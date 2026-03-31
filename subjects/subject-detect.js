/**
 * Subject detection from first-page text of a PDF.
 * Uses rule-based keyword scoring — no syllabus codes.
 *
 * export detectSubject(pageText: string): 'maths' | 'physics' | 'computer-science' | null
 * export detectLevel(pageText: string): 'o-level' | 'a-level' | null
 */

import { kwMatches } from "../core.js";

/** Keyword sets for subject detection. */
const SUBJECT_KEYWORDS = {
  maths: [
    "mathematics", "maths", "math",
    "algebra", "geometry", "trigonometry", "calculus", "statistics",
    "probability", "matrix", "matrices", "vector", "number", "arithmetic"
  ],
  physics: [
    "physics",
    "mechanics", "thermodynamics", "electromagnetism", "optics", "quantum",
    "kinematics", "dynamics", "forces", "waves", "electricity", "magnetism",
    "radioactivity", "nuclear", "astrophysics"
  ],
  "computer-science": [
    "computer science", "computing", "computer studies",
    "algorithm", "programming", "binary", "database", "networking",
    "hardware", "software", "data structure", "boolean", "logic gate",
    "pseudocode", "flowchart", "computational"
  ]
};

/** Keyword sets for level detection. */
const LEVEL_KEYWORDS = {
  "o-level": [
    "ordinary level", "o level", "o-level", "igcse", "gcse",
    "ordinary", "5054", "5070", "0580", "0625", "0478", "0984",
    "secondary", "lower secondary"
  ],
  "a-level": [
    "advanced level", "a level", "a-level", "a2", "as level", "as-level",
    "9709", "9702", "9608", "9618",
    "higher", "advanced subsidiary"
  ]
};

/**
 * Score a text against a keyword list (case-insensitive whole-word matching).
 * @param {string} text
 * @param {string[]} keywords
 * @returns {number}
 */
function scoreKeywords(text, keywords) {
  return keywords.reduce((score, kw) => {
    // Weight multi-word phrases higher than single words
    const weight = kw.includes(" ") ? 3 : 1;
    return score + (kwMatches(text, kw) ? weight : 0);
  }, 0);
}

/**
 * Detect subject from first-page text.
 * @param {string} pageText
 * @returns {'maths'|'physics'|'computer-science'|null}
 */
export function detectSubject(pageText) {
  const scores = Object.fromEntries(
    Object.entries(SUBJECT_KEYWORDS).map(([subject, kws]) => [
      subject,
      scoreKeywords(pageText, kws)
    ])
  );
  const best = Object.entries(scores).reduce(
    (a, b) => (b[1] > a[1] ? b : a),
    ["", 0]
  );
  return best[1] > 0 ? best[0] : null;
}

/**
 * Detect level from first-page text.
 * @param {string} pageText
 * @returns {'o-level'|'a-level'|null}
 */
export function detectLevel(pageText) {
  const scores = Object.fromEntries(
    Object.entries(LEVEL_KEYWORDS).map(([level, kws]) => [
      level,
      scoreKeywords(pageText, kws)
    ])
  );
  const best = Object.entries(scores).reduce(
    (a, b) => (b[1] > a[1] ? b : a),
    ["", 0]
  );
  return best[1] > 0 ? best[0] : null;
}
