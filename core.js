/**
 * core.js — PDF processing, question extraction, topic tagging, paper generation.
 *
 * Depends on PDF.js loaded globally as `pdfjsLib` (ESM via CDN).
 */

import { detectSubject, detectLevel } from "./subjects/subject-detect.js";

// ─── PDF.js helpers ──────────────────────────────────────────────────────────

/**
 * Load a PDF document from a URL.
 * @param {string} url
 * @returns {Promise<PDFDocumentProxy>}
 */
export async function loadPdf(url) {
  const loadingTask = pdfjsLib.getDocument({ url, verbosity: 0 });
  return loadingTask.promise;
}

/**
 * Reconstruct page text by grouping text items by y-coordinate,
 * sorting groups top→bottom, items within group left→right.
 *
 * Inter-item gaps are measured in PDF user-space units and converted to an
 * approximate number of space characters so that table columns remain visually
 * aligned when the text is displayed in a monospaced context.
 *
 * @param {PDFPageProxy} page
 * @returns {Promise<string>}
 */
export async function extractPageText(page) {
  const content = await page.getTextContent();
  // Group items by rounded y (viewport coords are bottom-up; use transform[5])
  const rows = new Map();
  for (const item of content.items) {
    if (!item.str) continue;
    const y = Math.round(item.transform[5]);
    if (!rows.has(y)) rows.set(y, []);
    rows.get(y).push(item);
  }
  // Sort rows top→bottom (higher y = higher on page in PDF coords)
  const sortedRows = [...rows.entries()].sort((a, b) => b[0] - a[0]);
  return sortedRows
    .map(([, items]) => {
      const sorted = items.sort((a, b) => a.transform[4] - b.transform[4]);
      if (sorted.length === 1) return sorted[0].str.trim();

      // Reconstruct the row preserving inter-column spacing.
      // For each adjacent pair of items we measure the pixel gap between the
      // end of the previous item and the start of the next, then convert it to
      // a number of space characters proportional to the average character
      // width.  This keeps table columns legible in the extracted text.
      let line = sorted[0].str;
      for (let i = 1; i < sorted.length; i++) {
        const prev = sorted[i - 1];
        const cur  = sorted[i];
        const itemWidth = prev.width > 0 ? prev.width : 0;
        const gapPx     = cur.transform[4] - (prev.transform[4] + itemWidth);
        const charWidth  = prev.str.length > 0
          ? (prev.width > 0 ? prev.width : DEFAULT_CHAR_WIDTH) / prev.str.length
          : DEFAULT_CHAR_WIDTH;
        // Map pixel gap to space count; clamp to MIN_GAP_SPACES–MAX_GAP_SPACES.
        const spaces = Math.min(MAX_GAP_SPACES, Math.max(MIN_GAP_SPACES, Math.round(gapPx / charWidth)));
        line += " ".repeat(spaces) + cur.str;
      }
      return line.trim();
    })
    .filter(Boolean)
    .join("\n");
}

/**
 * Extract text from all pages of a PDF document.
 * @param {PDFDocumentProxy} pdfDoc
 * @returns {Promise<string[]>} — one string per page
 */
export async function extractAllPagesText(pdfDoc) {
  const pages = [];
  for (let i = 1; i <= pdfDoc.numPages; i++) {
    const page = await pdfDoc.getPage(i);
    pages.push(await extractPageText(page));
  }
  return pages;
}

// ─── Header / footer cleaning ─────────────────────────────────────────────────

/** Fallback character width (PDF user-space units) when an item has no width. */
const DEFAULT_CHAR_WIDTH = 8;

/** Minimum number of spaces inserted to represent an inter-item gap. */
const MIN_GAP_SPACES = 1;

/** Maximum number of spaces inserted to represent an inter-item gap. */
const MAX_GAP_SPACES = 16;

/**
 * Lines that are typically headers or footers in Cambridge exam papers.
 * These are removed from each page's text before question extraction.
 */
const NOISE_PATTERNS = [
  /^\s*turn\s+over\s*$/i,
  /^\s*©\s*ucles\s*/i,
  /^\s*cambridge\s+(international|assessment)\s*(examinations?|education)?\s*/i,
  /^\s*\d{4}\/\d+\/[oms]\/\d+\s*/i,          // paper codes like 0580/22/M/J/23
  /^\s*(specimen|mark\s*scheme)\s*$/i,
  /^\s*(additional\s+materials?|answer\s+booklet)\s*/i,
  /^\s*(read\s+these\s+instructions\s+first|information)\s*$/i,
  /^\s*\d+\s*$/,                               // standalone page numbers
  /^\s*(blank\s+page|this\s+page\s+is\s+intentionally\s+blank)\s*$/i,
  /^\s*(write\s+in\s+the\s+spaces|write\s+your\s+answers?)\s*/i,
  /^\s*if\s+you\s+have\s+been\s+given\s+an?\s+answer\s+booklet/i,
  /^\s*for\s+examiner\s*['']?\s*s?\s*use\s*$/i,
  /^\s*do\s+not\s+write\s+(in|outside)\s+the\s+margin/i,
  // Cover-page duration line (e.g. "1 hour 30 minutes", "2 hours", "45 minutes").
  // This is the primary root cause: "1 hour 30 minutes" matches QUESTION_START_RE
  // because it starts with "1 ", creating a false Question 1 that swallows all
  // front-page instructions until the real Question 2 start is found.
  /^\s*\d+\s+hours?(?:\s+\d+\s+minutes?)?\s*$/i,
  /^\s*\d+\s+minutes?\s*$/i,
  // Front-page boilerplate (will not appear inside actual question text)
  /^\s*you\s+must\s+answer\s+on\s+the\s+question\s+paper/i,
  /^\s*no\s+additional\s+materials?\s+are\s+needed/i,
  // "INSTRUCTIONS" section heading (distinct from "Read these instructions first")
  /^\s*instructions\s*$/i,
  // Document page-count footer (e.g. "This document has 16 pages. Any blank pages are indicated.")
  /^\s*this\s+(document|paper)\s+has\s+\d+\s+pages?/i,
  /^\s*any\s+blank\s+pages?\s+are\s+indicated/i,
  // Cambridge internal document codes (e.g. "DC (DE/FC) 318301/3")
  /^\s*DC\s+\([^)]+\)\s+\d+\/\d+\s*$/i,
];

/**
 * Remove common header/footer noise from a line.
 * @param {string} line
 * @returns {boolean} true if the line should be kept
 */
function isContentLine(line) {
  return !NOISE_PATTERNS.some((p) => p.test(line));
}

/**
 * Clean a page's raw text.
 * @param {string} pageText
 * @returns {string}
 */
export function cleanPageText(pageText) {
  return pageText
    .split("\n")
    .filter(isContentLine)
    .join("\n");
}

// ─── Question splitting ───────────────────────────────────────────────────────

/**
 * Regex for a *candidate* question-start line.
 *
 * Accepted forms:
 *   "1"           — number alone on a line (Cambridge style: number above question body)
 *   "1."          — number with trailing period, alone on a line
 *   "1 text…"     — number followed by question text on the same line
 *   "1. text…"    — number + period + text
 *   "1 (a) …"     — number + sub-part marker on same line (very common in Cambridge papers)
 *   "Q1 …"        — Q-prefix variants
 *   "Question 1"  — full word prefix
 *
 * This is a broad first pass.  False positives are removed by
 * isQuestionFalsePositive() below.
 *
 * NOTE: The negative lookahead only excludes a bare digit following the
 * question number (e.g. "3 5 marks"), NOT a parenthesis.  Excluding "("
 * was the original bug: Cambridge questions often start "3 (a) …" where
 * the sub-part marker sits on the same line as the question number.
 */
const QUESTION_CANDIDATE_RE =
  /^(?:Question\s+|Q\.?\s*)?(\d{1,2})(?:\s*\.?\s*$|(?:\.\s+|\s+)(?!\s*\d))/im;

/**
 * Patterns that identify a candidate line as a false positive — i.e. it is NOT
 * really the start of a new question even though it begins with a number.
 *
 * Common occurrences in Cambridge exam papers:
 *   "2 marks"  "3 mark"  — mark allocations
 *   "3 cm"  "2 mm"  "5 km" — length measurements
 *   "2 kg"  "4 mg"  "3 g"  — mass measurements
 *   "2 × 10³"  "3 + x"     — inline mathematics
 */
const FALSE_POSITIVE_PATTERNS = [
  /^\d+\s+marks?\b/i,                  // mark allocations
  /^\d+\s+(?:cm|mm|km)\b/i,           // length units
  /^\d+\s+(?:kg|mg|g)\b/i,            // mass units
  /^\d+\s*[×÷+\-=*]/,                 // mathematical operators
  /^\d+\s*\(\s*\d/,                   // number followed by parenthesised digit e.g. "3 (2)"
];

/**
 * Return true when a candidate line (already matched by QUESTION_CANDIDATE_RE)
 * should be rejected as a false positive.
 * @param {string} line
 * @returns {boolean}
 */
function isQuestionFalsePositive(line) {
  return FALSE_POSITIVE_PATTERNS.some((re) => re.test(line));
}

/**
 * Minimum number of non-empty content lines a question must contain before the
 * next question header is accepted as genuine.  Cambridge questions are never
 * just a single line, so anything detected sooner is almost certainly a
 * false positive (e.g. a mark-allocation number, a table cell, etc.).
 */
const MIN_LINES_PER_QUESTION = 2;

/**
 * Split full-document text into individual main questions.
 *
 * Strategy:
 *  1. Flatten all pages into a single line array, recording which PDF page
 *     (1-based) each line came from so we can report startPage / endPage.
 *  2. Find every line matching QUESTION_START_RE.
 *  3. Accept only strictly-monotonically-increasing question numbers (1, 2, 3 …)
 *     within the range 1-40, AND only when the previous question already contains
 *     at least MIN_LINES_PER_QUESTION non-empty lines (guards against a false
 *     positive appearing on the very first or second line of a real question).
 *  4. Slice between consecutive accepted starts.
 *
 * @param {string[]} pageTexts — raw text per page (cleaning is applied here)
 * @returns {{ number: number, text: string, startPage: number, endPage: number }[]}
 */
export function splitIntoQuestions(pageTexts) {
  // Build a flat line array and a parallel array mapping each line to its
  // 1-based source page number.
  const lines       = [];
  const linePageMap = []; // linePageMap[i] = 1-based page number

  for (let p = 0; p < pageTexts.length; p++) {
    const pageLines = cleanPageText(pageTexts[p]).split("\n");
    for (const line of pageLines) {
      lines.push(line);
      linePageMap.push(p + 1);
    }
  }

  const questionStarts = []; // { index: lineIndex, number: qNum }

  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(QUESTION_CANDIDATE_RE);
    if (!m) continue;
    if (isQuestionFalsePositive(lines[i])) continue;
    const num = parseInt(m[1], 10);
    const prev = questionStarts[questionStarts.length - 1];
    // Must be in sane range and strictly one more than the previous question.
    if (num < 1 || num > 40) continue;
    if (prev && num !== prev.number + 1) continue;
    // Reject if the previous question body has fewer than MIN_LINES_PER_QUESTION
    // non-empty lines — this filters out false positives that sit immediately
    // after a real question header (e.g. "2 marks" on line 2 of Q1).
    if (prev) {
      const bodyLines = lines
        .slice(prev.index + 1, i)
        .filter((l) => l.trim().length > 0);
      if (bodyLines.length < MIN_LINES_PER_QUESTION) continue;
    }
    questionStarts.push({ index: i, number: num });
  }

  // Build question text slices
  const questions = [];
  for (let i = 0; i < questionStarts.length; i++) {
    const start = questionStarts[i].index;
    const end =
      i + 1 < questionStarts.length ? questionStarts[i + 1].index : lines.length;
    const text = lines.slice(start, end).join("\n").trim();
    if (text.length > 10) {
      questions.push({
        number: questionStarts[i].number,
        text,
        matchedLine: lines[start],
        startPage: linePageMap[start] ?? 1,
        // `end` is exclusive, so the last line of the question is at `end - 1`.
        endPage:   linePageMap[end - 1] ?? linePageMap[start] ?? 1,
      });
    }
  }
  return questions;
}

// ─── Topic tagging ────────────────────────────────────────────────────────────

/**
 * Find the character index of the first sub-part label in question text.
 * Sub-part labels look like "(a)", "(b)", "(i)", "(ii)" etc. and appear at
 * the start of a line (possibly indented).
 * Returns -1 if no sub-part label is found.
 *
 * @param {string} text
 * @returns {number}
 */
function findFirstSubPartIndex(text) {
  // Match a line that begins (optionally with whitespace) with a sub-part label.
  // We accept 1-3 letters (lower or upper-case) to cover (a)…(c) and (i)…(viii) etc.
  const m = /(?:^|\n)[ \t]*\([a-zA-Z]{1,3}\)/.exec(text);
  if (!m) return -1;
  // If the match started at position 0 we keep the full string as "sub-part";
  // otherwise skip the leading newline so the split is clean.
  return m.index === 0 ? 0 : m.index + 1;
}

/**
 * Extract every unique sub-part label found in a question text
 * (e.g. ["a", "b", "i", "ii"]).
 *
 * @param {string} questionText
 * @returns {string[]}
 */
function extractSubParts(questionText) {
  const matches = [...questionText.matchAll(/\(\s*([a-zA-Z]{1,3})\s*\)/g)];
  return [...new Set(matches.map((m) => m[1].toLowerCase()))];
}

/**
 * Return the first element of `lines` that contains `kwLower`
 * (case-insensitive), truncated to 100 characters.
 * Returns an empty string if not found.
 *
 * @param {string[]} lines — pre-split lines (original case)
 * @param {string} kwLower — already lower-cased keyword
 * @returns {string}
 */
function findContextLine(lines, kwLower) {
  for (const line of lines) {
    if (line.toLowerCase().includes(kwLower)) {
      const t = line.trim();
      return t.length > 100 ? t.slice(0, 100) + "…" : t;
    }
  }
  return "";
}

/** Weight applied to multi-word keywords (more specific → higher signal). */
const MULTI_WORD_WEIGHT = 3;

/** Weight applied to single-word keywords. */
const SINGLE_WORD_WEIGHT = 1;

/**
 * Extra multiplier for keywords found in the *main question body* (before the
 * first sub-part label).  This ensures the overall topic of the question
 * dominates over incidental keywords that appear only in individual sub-parts.
 */
const MAIN_BODY_MULTIPLIER = 2;

/**
 * Score a question against each topic.
 *
 * Keywords found in the *main question body* (the text before the first
 * sub-part label) are given MAIN_BODY_MULTIPLIER× weight so that the overall
 * subject of the question dominates over incidental keywords in individual
 * sub-parts.
 *
 * Multi-word keywords already receive MULTI_WORD_WEIGHT× weight; that
 * multiplier is applied on top of the main-body bonus
 * (main-body multi-word → MULTI_WORD_WEIGHT × MAIN_BODY_MULTIPLIER effective weight).
 *
 * @param {string} questionText
 * @param {{ id: string, label: string, keywords: string[] }[]} topics
 * @returns {TopicScore[]}
 */
function scoreTopics(questionText, topics) {
  const splitIdx = findFirstSubPartIndex(questionText);
  const mainText     = (splitIdx >= 0 ? questionText.slice(0, splitIdx) : questionText).toLowerCase();
  const subText      = (splitIdx >= 0 ? questionText.slice(splitIdx)    : "").toLowerCase();
  // Pre-split the original-case text into lines once so findContextLine can
  // iterate without re-splitting on every keyword lookup.
  const mainLines = (splitIdx >= 0 ? questionText.slice(0, splitIdx) : questionText).split("\n");
  const subLines  = (splitIdx >= 0 ? questionText.slice(splitIdx)    : "").split("\n");

  return topics.map((topic) => {
    /** @type {MatchedKeyword[]} */
    const matchedKeywords = [];
    let score = 0;

    for (const kw of topic.keywords) {
      const kwLower    = kw.toLowerCase();
      const baseWeight = kw.includes(" ") ? MULTI_WORD_WEIGHT : SINGLE_WORD_WEIGHT;

      const inMain = mainText.includes(kwLower);
      const inSub  = !inMain && subText.includes(kwLower);

      if (inMain) {
        score += baseWeight * MAIN_BODY_MULTIPLIER;
        matchedKeywords.push({ kw, location: "main", context: findContextLine(mainLines, kwLower) });
      } else if (inSub) {
        score += baseWeight;
        matchedKeywords.push({ kw, location: "sub", context: findContextLine(subLines, kwLower) });
      }
    }

    return { id: topic.id, label: topic.label, score, matchedKeywords };
  });
}

/**
 * Tag a question with its single best-matching topic using keyword scoring.
 *
 * Each question is assigned to exactly one topic — the one with the highest
 * keyword score. If no topic scores at all, the question is tagged as
 * "unclassified".
 *
 * @param {string} questionText
 * @param {{ id: string, label: string, keywords: string[] }[]} topics
 * @returns {string[]} singleton array containing the best topic ID
 */
export function tagTopics(questionText, topics) {
  const scored = scoreTopics(questionText, topics)
    .filter((t) => t.score > 0)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) return ["unclassified"];
  // Return only the single highest-scoring topic.
  return [scored[0].id];
}

/**
 * Like tagTopics but also returns full per-topic score details for debugging,
 * plus the list of sub-part labels found in the question.
 *
 * @param {string} questionText
 * @param {{ id: string, label: string, keywords: string[] }[]} topics
 * @returns {{ topicScores: TopicScore[], subParts: string[] }}
 */
export function tagTopicsDebug(questionText, topics) {
  const topicScores = scoreTopics(questionText, topics)
    .sort((a, b) => b.score - a.score);
  const subParts = extractSubParts(questionText);
  return { topicScores, subParts };
}

// ─── Question index ───────────────────────────────────────────────────────────

/**
 * @typedef {Object} MatchedKeyword
 * @property {string} kw       — the keyword that matched
 * @property {'main'|'sub'} location — whether found in the main question body or a sub-part
 * @property {string} context — the (truncated) line of text where the keyword was found
 */

/**
 * @typedef {Object} TopicScore
 * @property {string} id
 * @property {string} label
 * @property {number} score
 * @property {MatchedKeyword[]} matchedKeywords
 */

/**
 * @typedef {Object} QuestionDebugInfo
 * @property {string} matchedLine  — the raw text line that triggered question detection
 * @property {TopicScore[]} topicScores — all topics with their keyword scores
 * @property {string[]} subParts — sub-part labels found in the question (e.g. ["a","b","i","ii"])
 */

/**
 * @typedef {Object} QuestionEntry
 * @property {string} pdfUrl
 * @property {number} number
 * @property {string} text
 * @property {string[]} topics
 * @property {number} startPage — 1-based page where the question begins
 * @property {number} endPage   — 1-based page where the question ends (≥ startPage)
 * @property {QuestionDebugInfo} debugInfo — AI analysis details for review
 */

/**
 * Build a question index from a list of PDF URLs for a given subject/level.
 *
 * @param {string[]} pdfUrls
 * @param {{ id: string, label: string, keywords: string[] }[]} topics
 * @param {(done: number, total: number, url: string) => void} [onProgress]
 * @returns {Promise<QuestionEntry[]>}
 */
export async function buildIndex(pdfUrls, topics, onProgress) {
  const index = [];
  // Deduplicate URLs so the same PDF is never processed twice even if it
  // appears more than once in the manifest or matched-URL list.
  const uniqueUrls = [...new Set(pdfUrls)];
  // Track (pdfUrl, questionNumber) pairs to skip duplicate question entries.
  const seenKeys = new Set();

  for (let i = 0; i < uniqueUrls.length; i++) {
    const url = uniqueUrls[i];
    if (onProgress) onProgress(i, uniqueUrls.length, url);
    try {
      const pdfDoc = await loadPdf(url);
      const rawPages = await extractAllPagesText(pdfDoc);
      const questions = splitIntoQuestions(rawPages);
      for (const q of questions) {
        const key = `${url}||${q.number}`;
        if (seenKeys.has(key)) continue;
        seenKeys.add(key);
        const debugResult = tagTopicsDebug(q.text, topics);
        index.push({
          pdfUrl: url,
          number: q.number,
          text: q.text,
          topics: tagTopics(q.text, topics),
          startPage: q.startPage,
          endPage:   q.endPage,
          debugInfo: {
            matchedLine: q.matchedLine,
            topicScores: debugResult.topicScores,
            subParts:    debugResult.subParts,
          },
        });
      }
    } catch (err) {
      console.warn(`Failed to process ${url}:`, err);
    }
  }
  if (onProgress) onProgress(uniqueUrls.length, uniqueUrls.length, "");
  return index;
}

// ─── Seeded shuffle ───────────────────────────────────────────────────────────

/**
 * Mulberry32 — fast, seedable 32-bit PRNG.
 * @param {number} seed
 * @returns {() => number} — returns float in [0, 1)
 */
function mulberry32(seed) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Fisher-Yates shuffle using a seeded RNG.
 * Returns a new shuffled array (does not mutate original).
 * @template T
 * @param {T[]} array
 * @param {number} seed
 * @returns {T[]}
 */
export function seededShuffle(array, seed) {
  const arr = [...array];
  const rand = mulberry32(seed >>> 0);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ─── Paper generation ─────────────────────────────────────────────────────────

/**
 * Generate a randomized exam paper.
 *
 * @param {QuestionEntry[]} index
 * @param {Object} opts
 * @param {string[]|null} opts.topics — filter to these topic IDs (null = all)
 * @param {number} opts.count — number of questions
 * @param {number|null} opts.seed — RNG seed (null = random)
 * @returns {QuestionEntry[]}
 */
export function generatePaper(index, { topics = null, count = 10, seed = null }) {
  let pool = index;

  // Filter by topics if requested
  if (topics && topics.length > 0) {
    pool = index.filter((q) => q.topics.some((t) => topics.includes(t)));
  }

  // Deduplicate by (pdfUrl, question number) so no question ever appears twice
  // in the generated paper, even if the index somehow contains duplicates.
  const seen = new Set();
  pool = pool.filter((q) => {
    const key = `${q.pdfUrl}||${q.number}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  if (pool.length === 0) return [];

  const effectiveSeed = seed !== null ? (seed >>> 0) : (Math.random() * 0x100000000) >>> 0;
  const shuffled = seededShuffle(pool, effectiveSeed);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

// ─── First-page scan ──────────────────────────────────────────────────────────

/**
 * Scan the first page of a PDF and return its cleaned text.
 * Used to detect subject/level without processing the whole PDF.
 *
 * @param {string} url
 * @returns {Promise<string>}
 */
export async function scanFirstPage(url) {
  const pdfDoc = await loadPdf(url);
  const page = await pdfDoc.getPage(1);
  const raw = await extractPageText(page);
  return cleanPageText(raw);
}

/**
 * Filter PDF URLs by subject and level using first-page keyword detection.
 *
 * @param {string[]} urls — all PDFs for a chosen level bucket
 * @param {string} subject — 'maths' | 'physics' | 'computer-science'
 * @param {string} level   — 'o-level' | 'a-level'
 * @param {(done: number, total: number) => void} [onProgress]
 * @returns {Promise<string[]>} URLs whose first page matches subject+level
 */
export async function filterPdfsBySubjectLevel(urls, subject, level, onProgress) {
  // Deduplicate URLs before scanning so the same PDF is never processed twice.
  const uniqueUrls = [...new Set(urls)];
  const matched = [];
  for (let i = 0; i < uniqueUrls.length; i++) {
    if (onProgress) onProgress(i, uniqueUrls.length);
    try {
      const text = await scanFirstPage(uniqueUrls[i]);
      const detectedSubject = detectSubject(text);
      const detectedLevel = detectLevel(text);
      // Accept if subject matches; level may be null (ambiguous first page)
      if (
        detectedSubject === subject &&
        (detectedLevel === null || detectedLevel === level)
      ) {
        matched.push(uniqueUrls[i]);
      }
    } catch (err) {
      console.warn(`Scan failed for ${uniqueUrls[i]}:`, err);
    }
  }
  if (onProgress) onProgress(uniqueUrls.length, uniqueUrls.length);
  return matched;
}
