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
    .map(([, items]) =>
      items
        .sort((a, b) => a.transform[4] - b.transform[4])
        .map((i) => i.str)
        .join(" ")
        .trim()
    )
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
 * Regex for a main question start.
 * Matches:
 *   "1 "  "Q1 "  "Q 1 "  "Question 1 "  "Question 1."
 * Does NOT match sub-parts like "(a)", "(i)", "1.a", "1(a)"
 */
const QUESTION_START_RE =
  /^(?:Question\s+|Q\.?\s*)?(\d{1,2})(?:\s+|\.\s+)(?!\s*\()/im;

/**
 * Split full-document text into individual main questions.
 *
 * Strategy:
 *  1. Join all pages into one string.
 *  2. Find every match of QUESTION_START_RE.
 *  3. Slice between consecutive matches.
 *  4. Require monotonically increasing question numbers to filter false positives.
 *
 * @param {string[]} pageTexts — cleaned text per page
 * @returns {{ number: number, text: string }[]}
 */
export function splitIntoQuestions(pageTexts) {
  const fullText = pageTexts.map(cleanPageText).join("\n");
  const lines = fullText.split("\n");

  const questionStarts = []; // { index: lineIndex, number: qNum }

  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(QUESTION_START_RE);
    if (!m) continue;
    const num = parseInt(m[1], 10);
    // Enforce strictly monotonically increasing (1, 2, 3 …) in sane range (1-40)
    const prev = questionStarts[questionStarts.length - 1];
    if (num < 1 || num > 40) continue;
    if (prev && num !== prev.number + 1) continue;
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
      questions.push({ number: questionStarts[i].number, text });
    }
  }
  return questions;
}

// ─── Topic tagging ────────────────────────────────────────────────────────────

/**
 * Tag a question with matching topics using keyword scoring.
 *
 * @param {string} questionText
 * @param {{ id: string, label: string, keywords: string[] }[]} topics
 * @returns {string[]} list of topic IDs that score above threshold
 */
export function tagTopics(questionText, topics) {
  const lower = questionText.toLowerCase();
  const scored = topics
    .map((topic) => {
      const score = topic.keywords.reduce((s, kw) => {
        const weight = kw.includes(" ") ? 3 : 1;
        return s + (lower.includes(kw.toLowerCase()) ? weight : 0);
      }, 0);
      return { id: topic.id, score };
    })
    .filter((t) => t.score > 0)
    .sort((a, b) => b.score - a.score);

  // Return top-scoring topics (those within 50% of the best score)
  if (scored.length === 0) return ["unclassified"];
  const best = scored[0].score;
  return scored
    .filter((t) => t.score >= best * 0.5)
    .map((t) => t.id);
}

// ─── Question index ───────────────────────────────────────────────────────────

/**
 * @typedef {Object} QuestionEntry
 * @property {string} pdfUrl
 * @property {number} number
 * @property {string} text
 * @property {string[]} topics
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
  for (let i = 0; i < pdfUrls.length; i++) {
    const url = pdfUrls[i];
    if (onProgress) onProgress(i, pdfUrls.length, url);
    try {
      const pdfDoc = await loadPdf(url);
      const rawPages = await extractAllPagesText(pdfDoc);
      const questions = splitIntoQuestions(rawPages);
      for (const q of questions) {
        index.push({
          pdfUrl: url,
          number: q.number,
          text: q.text,
          topics: tagTopics(q.text, topics),
        });
      }
    } catch (err) {
      console.warn(`Failed to process ${url}:`, err);
    }
  }
  if (onProgress) onProgress(pdfUrls.length, pdfUrls.length, "");
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
  const matched = [];
  for (let i = 0; i < urls.length; i++) {
    if (onProgress) onProgress(i, urls.length);
    try {
      const text = await scanFirstPage(urls[i]);
      const detectedSubject = detectSubject(text);
      const detectedLevel = detectLevel(text);
      // Accept if subject matches; level may be null (ambiguous first page)
      if (
        detectedSubject === subject &&
        (detectedLevel === null || detectedLevel === level)
      ) {
        matched.push(urls[i]);
      }
    } catch (err) {
      console.warn(`Scan failed for ${urls[i]}:`, err);
    }
  }
  if (onProgress) onProgress(urls.length, urls.length);
  return matched;
}
