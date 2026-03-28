/**
 * topicScorer.js — Hybrid topic scorer combining TF-IDF cosine similarity with
 * keyword matching for improved topic detection.
 *
 * This module augments the pure keyword-matching in core.js with a lightweight
 * TF-IDF cosine similarity measure.  The two signals are combined into a single
 * 0-1 hybrid score that is more robust to paraphrasing and reduces false
 * positives that arise from incidental single-keyword matches.
 *
 * Scoring formula:
 *   hybridScore = WEIGHTS.tfidf × tfidfSimilarity + WEIGHTS.keyword × normalizedKeywordScore
 *
 * The keyword score is normalised relative to the highest-scoring topic so that
 * the best keyword match always contributes 1.0 to the keyword component.
 * TF-IDF similarity is computed between the question text and each topic's
 * keyword list joined as a reference document.
 *
 * Thresholds (tunable via THRESHOLDS export):
 *   hybridScore ≥ THRESHOLDS.related    → "related"
 *   hybridScore ≥ THRESHOLDS.borderline → "borderline"
 *   hybridScore <  THRESHOLDS.borderline → "not_related"
 */

/**
 * Configurable thresholds for topic-relatedness decisions.
 * Raise `related` for higher precision; lower `borderline` for higher recall.
 *
 * @type {{ related: number, borderline: number }}
 */
export const THRESHOLDS = {
  /** Hybrid score at or above this → "related". */
  related: 0.15,
  /** Hybrid score at or above this (but below `related`) → "borderline". */
  borderline: 0.05,
};

/**
 * Mixture weights for combining TF-IDF and keyword scores.
 * Values must sum to 1.0 for the hybrid score to remain in [0, 1].
 * If you change these values, verify that tfidf + keyword = 1.0.
 *
 * @type {{ tfidf: number, keyword: number }}
 */
export const WEIGHTS = {
  tfidf: 0.6,
  keyword: 0.4,
};

// ─── Text utilities ───────────────────────────────────────────────────────────

/** Common English stop-words excluded from TF-IDF to reduce noise. */
const STOP_WORDS = new Set([
  "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "with", "by", "from", "is", "are", "was", "were", "be", "been",
  "being", "have", "has", "had", "do", "does", "did", "will", "would",
  "could", "should", "may", "might", "can", "this", "that", "these",
  "those", "it", "its", "as", "if", "not", "no", "so", "up", "out",
]);

/**
 * Tokenise text into lowercase alphabetic/numeric words, removing punctuation
 * and filtering out stop-words.
 *
 * @param {string} text
 * @returns {string[]}
 */
export function tokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOP_WORDS.has(w));
}

/**
 * Build a raw term-count map from an array of tokens.
 *
 * @param {string[]} tokens
 * @returns {Map<string, number>}
 */
function rawTermCounts(tokens) {
  const counts = new Map();
  for (const t of tokens) counts.set(t, (counts.get(t) ?? 0) + 1);
  return counts;
}

// ─── TF-IDF cosine similarity ─────────────────────────────────────────────────

/**
 * Compute TF-IDF cosine similarity between two text strings.
 *
 * IDF is derived from the two-document corpus formed by `textA` and `textB`
 * themselves (smooth IDF: log((N+1)/(df+1)) + 1, N = 2).  Terms shared by
 * both documents are down-weighted relative to terms unique to one side, which
 * privileges subject-specific vocabulary over generic connective words that
 * have already been removed by `tokenize`.
 *
 * This is a lightweight approximation; a production system would compute IDF
 * over a large background corpus.  For same-domain exam text the two-document
 * IDF provides a useful relative signal at zero runtime cost.
 *
 * @param {string} textA
 * @param {string} textB
 * @returns {number} cosine similarity in [0, 1]
 */
export function tfidfCosineSimilarity(textA, textB) {
  const tokensA = tokenize(textA);
  const tokensB = tokenize(textB);

  if (tokensA.length === 0 || tokensB.length === 0) return 0;

  const countsA = rawTermCounts(tokensA);
  const countsB = rawTermCounts(tokensB);

  // Combined vocabulary
  const vocab = new Set([...countsA.keys(), ...countsB.keys()]);

  // Smooth IDF with N = 2 documents
  const N = 2;
  const vecA = [];
  const vecB = [];
  for (const term of vocab) {
    const df = (countsA.has(term) ? 1 : 0) + (countsB.has(term) ? 1 : 0);
    const idf = Math.log((N + 1) / (df + 1)) + 1;
    vecA.push((countsA.get(term) ?? 0) * idf);
    vecB.push((countsB.get(term) ?? 0) * idf);
  }

  // Cosine similarity
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// ─── Hybrid scoring ───────────────────────────────────────────────────────────

/**
 * Map a hybrid score to a human-readable relatedness category.
 *
 * @param {number} score — hybrid score in [0, 1]
 * @returns {"related" | "borderline" | "not_related"}
 */
export function categorize(score) {
  if (score >= THRESHOLDS.related) return "related";
  if (score >= THRESHOLDS.borderline) return "borderline";
  return "not_related";
}

/**
 * Augment keyword-scored topics with TF-IDF-based hybrid scores.
 *
 * Each topic's raw keyword score is normalised relative to the highest score
 * in the batch so that the best keyword match contributes a normalised 1.0 to
 * the keyword component.  TF-IDF similarity is then computed between the full
 * question text and the topic's keyword list (joined as a single document).
 *
 * The combined hybrid score and a relatedness label are added to each topic
 * object.  Topics are returned in the same order they were received; callers
 * should sort by `hybridScore` if ranking is required.
 *
 * @param {string} questionText — full (cleaned) question text
 * @param {Array<{
 *   id: string,
 *   label: string,
 *   keywords: string[],
 *   score: number,
 *   matchedKeywords: Array
 * }>} scoredTopics — topics after the keyword-scoring pass
 * @returns {Array<{
 *   id: string,
 *   label: string,
 *   keywords: string[],
 *   score: number,
 *   matchedKeywords: Array,
 *   hybridScore: number,
 *   tfidfScore: number,
 *   kwNormScore: number,
 *   relatedness: "related" | "borderline" | "not_related"
 * }>}
 */
export function augmentWithHybridScores(questionText, scoredTopics) {
  const maxKw = scoredTopics.reduce((m, t) => Math.max(m, t.score), 0);

  return scoredTopics.map((topic) => {
    // Normalise keyword score relative to the best-matching topic.
    const kwNormScore = maxKw > 0 ? topic.score / maxKw : 0;

    // TF-IDF similarity between question and topic keyword list.
    const topicText = topic.keywords.join(" ");
    const tfidfScore = tfidfCosineSimilarity(questionText, topicText);

    const hybridScore =
      WEIGHTS.tfidf * tfidfScore + WEIGHTS.keyword * kwNormScore;
    const relatedness = categorize(hybridScore);

    return { ...topic, hybridScore, tfidfScore, kwNormScore, relatedness };
  });
}
