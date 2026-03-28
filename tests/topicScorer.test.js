/**
 * tests/topicScorer.test.js
 *
 * Simple test suite for the hybrid topic scorer using Node.js built-in assert.
 * Run with: node tests/topicScorer.test.js
 */

import assert from "node:assert/strict";
import {
  tokenize,
  tfidfCosineSimilarity,
  categorize,
  augmentWithHybridScores,
  THRESHOLDS,
  WEIGHTS,
} from "../topicScorer.js";

// ─── Helpers ──────────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    ${err.message}`);
    failed++;
  }
}

// ─── tokenize ─────────────────────────────────────────────────────────────────

console.log("\ntokenize");

test("lowercases and splits on whitespace", () => {
  assert.deepEqual(tokenize("Hello World"), ["hello", "world"]);
});

test("strips punctuation", () => {
  assert.deepEqual(tokenize("kinetic energy: 42J"), ["kinetic", "energy", "42j"]);
});

test("removes stop words", () => {
  const tokens = tokenize("the force is strong");
  assert.ok(!tokens.includes("the"));
  assert.ok(!tokens.includes("is"));
  assert.ok(tokens.includes("force"));
  assert.ok(tokens.includes("strong"));
});

test("filters single-character tokens", () => {
  assert.ok(!tokenize("a b c force").includes("a"));
  assert.ok(!tokenize("a b c force").includes("b"));
  assert.ok(!tokenize("a b c force").includes("c"));
});

test("returns empty array for empty string", () => {
  assert.deepEqual(tokenize(""), []);
});

// ─── tfidfCosineSimilarity ────────────────────────────────────────────────────

console.log("\ntfidfCosineSimilarity");

test("identical texts → similarity of 1", () => {
  const sim = tfidfCosineSimilarity("kinetic energy force momentum", "kinetic energy force momentum");
  assert.ok(sim > 0.99, `expected ~1, got ${sim}`);
});

test("completely disjoint texts → similarity of 0", () => {
  const sim = tfidfCosineSimilarity("photosynthesis chlorophyll", "Newton momentum velocity");
  assert.equal(sim, 0);
});

test("partial overlap → intermediate similarity", () => {
  const sim = tfidfCosineSimilarity(
    "kinetic energy and momentum",
    "potential energy velocity momentum force"
  );
  assert.ok(sim > 0 && sim < 1, `expected 0 < sim < 1, got ${sim}`);
});

test("highly related physics text scores higher than unrelated biology text", () => {
  const mechanicsKeywords = "force velocity acceleration momentum Newton mass weight";
  const physicsQuestion = "Calculate the momentum of a particle given its mass and velocity";
  const biologyQuestion = "Describe the process of photosynthesis in plant cells";

  const physSim = tfidfCosineSimilarity(physicsQuestion, mechanicsKeywords);
  const bioSim = tfidfCosineSimilarity(biologyQuestion, mechanicsKeywords);
  assert.ok(
    physSim > bioSim,
    `physics sim (${physSim}) should be > biology sim (${bioSim})`
  );
});

test("returns 0 when either input is empty", () => {
  assert.equal(tfidfCosineSimilarity("", "kinetic energy"), 0);
  assert.equal(tfidfCosineSimilarity("kinetic energy", ""), 0);
  assert.equal(tfidfCosineSimilarity("", ""), 0);
});

// ─── categorize ───────────────────────────────────────────────────────────────

console.log("\ncategorize");

test("score above related threshold → related", () => {
  assert.equal(categorize(THRESHOLDS.related + 0.1), "related");
});

test("score at related threshold → related", () => {
  assert.equal(categorize(THRESHOLDS.related), "related");
});

test("score between thresholds → borderline", () => {
  const mid = (THRESHOLDS.related + THRESHOLDS.borderline) / 2;
  assert.equal(categorize(mid), "borderline");
});

test("score at borderline threshold → borderline", () => {
  assert.equal(categorize(THRESHOLDS.borderline), "borderline");
});

test("score below borderline threshold → not_related", () => {
  assert.equal(categorize(THRESHOLDS.borderline - 0.01), "not_related");
});

test("score of 0 → not_related", () => {
  assert.equal(categorize(0), "not_related");
});

// ─── augmentWithHybridScores ──────────────────────────────────────────────────

console.log("\naugmentWithHybridScores");

/**
 * Minimal topic fixture for testing — avoids loading the full topic files.
 */
const mechanicsTopic = {
  id: "mechanics",
  label: "Mechanics",
  keywords: ["force", "velocity", "acceleration", "momentum", "Newton", "mass", "energy", "kinetic"],
  score: 0,
  matchedKeywords: [],
};

const algebraTopic = {
  id: "algebra",
  label: "Algebra",
  keywords: ["equation", "quadratic", "variable", "coefficient", "solve", "expression", "formula"],
  score: 0,
  matchedKeywords: [],
};

test("augmented topics include hybridScore, tfidfScore, kwNormScore, relatedness", () => {
  const results = augmentWithHybridScores("A body moves at constant velocity", [
    { ...mechanicsTopic, score: 6, matchedKeywords: [{ kw: "velocity", location: "main", context: "" }] },
  ]);
  const topic = results[0];
  assert.ok(typeof topic.hybridScore === "number");
  assert.ok(typeof topic.tfidfScore === "number");
  assert.ok(typeof topic.kwNormScore === "number");
  assert.ok(["related", "borderline", "not_related"].includes(topic.relatedness));
});

// ─── Paraphrase detection ─────────────────────────────────────────────────────

console.log("\nParaphrase detection (TF-IDF advantage over keyword-only)");

test("question with overlapping vocabulary scores higher than unrelated text", () => {
  // "Related" question shares vocabulary with mechanics keywords (mass, velocity, kinetic)
  // even though it doesn't use the full set of exact keyword phrases.
  const questionRelated = "An object with mass 3 kg moves at velocity 4 m/s. Calculate its kinetic energy.";
  const questionUnrelated = "Describe the role of enzymes in breaking down food molecules into simpler sugars.";

  const topicWithScore = (score, matchedKws) => ({
    ...mechanicsTopic,
    score,
    matchedKeywords: matchedKws,
  });

  const [relResult] = augmentWithHybridScores(questionRelated, [topicWithScore(0, [])]);
  const [unrelResult] = augmentWithHybridScores(questionUnrelated, [topicWithScore(0, [])]);

  assert.ok(
    relResult.tfidfScore > unrelResult.tfidfScore,
    `related TF-IDF (${relResult.tfidfScore.toFixed(3)}) should exceed unrelated (${unrelResult.tfidfScore.toFixed(3)})`
  );
});

test("topic with strong keyword match outranks accidental single-word match when TF-IDF corroborates", () => {
  // Topic A: strong keyword match (many mechanics terms)
  const topicA = {
    ...mechanicsTopic,
    score: 18, // 3 multi-word matches
    matchedKeywords: [
      { kw: "kinetic energy", location: "main", context: "" },
      { kw: "velocity", location: "main", context: "" },
    ],
  };

  // Topic B: accidental single keyword match in unrelated question
  const topicB = {
    ...algebraTopic,
    score: 2, // 1 single-word incidental match
    matchedKeywords: [{ kw: "solve", location: "sub", context: "" }],
  };

  const questionText = "Calculate the kinetic energy and final velocity of the object after the force acts on it";
  const results = augmentWithHybridScores(questionText, [topicA, topicB])
    .sort((a, b) => b.hybridScore - a.hybridScore);

  assert.equal(
    results[0].id,
    "mechanics",
    `Mechanics should win; got ${results[0].id} (hybridScore: ${results[0].hybridScore.toFixed(3)})`
  );
});

// ─── False-positive reduction ─────────────────────────────────────────────────

console.log("\nFalse-positive reduction");

test("purely unrelated question scores not_related even when one keyword matches", () => {
  // "force" accidentally appears in a question about social science
  const unrelatedQuestion = "The government will force citizens to pay higher taxes on income";
  const topicWithSingleAccidentalMatch = {
    ...mechanicsTopic,
    score: 2, // "force" matched, but context is unrelated
    matchedKeywords: [{ kw: "force", location: "main", context: "" }],
  };

  // Give the algebra topic a higher keyword score to push mechanics kwNormScore low
  const betterAlgebraTopic = {
    ...algebraTopic,
    score: 12,
    matchedKeywords: [
      { kw: "equation", location: "main", context: "" },
      { kw: "solve", location: "main", context: "" },
    ],
  };

  const results = augmentWithHybridScores(unrelatedQuestion, [
    topicWithSingleAccidentalMatch,
    betterAlgebraTopic,
  ]);

  const mechResult = results.find((r) => r.id === "mechanics");
  // Mechanics kwNormScore should be low (2/12 = 0.167) and tfidf should also
  // be low for an unrelated tax question → borderline or not_related
  assert.ok(
    mechResult.relatedness !== "related",
    `Mechanics should not be 'related' for a tax question; got '${mechResult.relatedness}' (hybridScore: ${mechResult.hybridScore.toFixed(3)})`
  );
});

test("clearly related question is classified as related", () => {
  const clearlyRelated = "Calculate the kinetic energy of a 2 kg mass moving at 5 m/s and find the net force";
  const topic = {
    ...mechanicsTopic,
    score: 18,
    matchedKeywords: [
      { kw: "kinetic energy", location: "main", context: "" },
      { kw: "force", location: "main", context: "" },
      { kw: "mass", location: "main", context: "" },
    ],
  };
  const [result] = augmentWithHybridScores(clearlyRelated, [topic]);
  assert.equal(
    result.relatedness,
    "related",
    `Expected 'related', got '${result.relatedness}' (hybridScore: ${result.hybridScore.toFixed(3)})`
  );
});

test("clearly unrelated question (no keyword match, no TF-IDF) is not_related", () => {
  const unrelated = "Describe the life cycle of a butterfly and its metamorphosis stages";
  const topic = { ...mechanicsTopic, score: 0, matchedKeywords: [] };
  const [result] = augmentWithHybridScores(unrelated, [topic]);
  assert.equal(
    result.relatedness,
    "not_related",
    `Expected 'not_related', got '${result.relatedness}' (hybridScore: ${result.hybridScore.toFixed(3)})`
  );
});

// ─── WEIGHTS and THRESHOLDS are exported for tuning ──────────────────────────

console.log("\nConfiguration exports");

test("WEIGHTS.tfidf + WEIGHTS.keyword = 1.0", () => {
  assert.ok(
    Math.abs(WEIGHTS.tfidf + WEIGHTS.keyword - 1.0) < 1e-9,
    `Expected weights to sum to 1; got ${WEIGHTS.tfidf + WEIGHTS.keyword}`
  );
});

test("THRESHOLDS.related > THRESHOLDS.borderline", () => {
  assert.ok(
    THRESHOLDS.related > THRESHOLDS.borderline,
    `related (${THRESHOLDS.related}) must be > borderline (${THRESHOLDS.borderline})`
  );
});

test("THRESHOLDS.borderline >= 0", () => {
  assert.ok(THRESHOLDS.borderline >= 0);
});

// ─── Summary ──────────────────────────────────────────────────────────────────

console.log(`\n${passed + failed} test(s): ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
