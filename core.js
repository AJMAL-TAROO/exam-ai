/**
 * core.js — PDF processing, question extraction, topic tagging, paper generation.
 *
 * Depends on PDF.js loaded globally as `pdfjsLib` (ESM via CDN).
 */

import { detectSubject, detectLevel } from "./subjects/subject-detect.js";
import { augmentWithHybridScores } from "./topicScorer.js";

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
 * Reconstruct page text by clustering text items into lines using a
 * tolerance-based y-coordinate grouping, then sorting groups top→bottom and
 * items within each group left→right.
 *
 * This is more robust than strict Math.round(y) bucketing because it
 * tolerates small y-jitter caused by superscripts, subscripts, and
 * multi-font lines that PDF.js may place at slightly different baselines.
 *
 * Lines are prefixed with one or more marker characters so that
 * splitIntoQuestions can use them as extra signals for question detection:
 *   BOLD_LINE_PREFIX (\x01)  — first item uses a bold font
 *   LARGE_GAP_PREFIX (\x02)  — unusually large vertical gap above this line
 *   LEFT_MARGIN_PREFIX (\x03) — first item starts at/near the left margin
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

  // Collect items that have text content.
  const allItems = content.items.filter((item) => item.str);
  if (allItems.length === 0) return "";

  // ── Step 1: Cluster items into lines ────────────────────────────────────
  // Sort all items by y descending (higher y = higher on the page in PDF
  // user-space coordinates, since y increases bottom→top).
  const sortedByY = [...allItems].sort((a, b) => b.transform[5] - a.transform[5]);

  // Group items into line clusters: start a new cluster when the y gap to
  // the previous item exceeds Y_CLUSTER_TOLERANCE PDF units.  This is
  // more robust than Math.round(y) for PDFs where the same visual line
  // has items at subtly different baseline positions.
  const lineGroups = [];
  for (const item of sortedByY) {
    const y = item.transform[5];
    const last = lineGroups[lineGroups.length - 1];
    if (!last || Math.abs(y - last.y) > Y_CLUSTER_TOLERANCE) {
      lineGroups.push({ y, items: [item] });
    } else {
      last.items.push(item);
    }
  }

  // ── Step 2: Compute median line spacing for large-gap detection ──────────
  // Build the array of gaps between consecutive line group y-values.
  const gaps = [];
  for (let i = 1; i < lineGroups.length; i++) {
    gaps.push(lineGroups[i - 1].y - lineGroups[i].y); // positive because sorted desc
  }
  gaps.sort((a, b) => a - b);
  // Use the median gap as the "typical" line spacing.
  const medianGap = gaps.length > 0 ? gaps[Math.floor(gaps.length / 2)] : 12;
  const largeGapThreshold = LARGE_GAP_MULTIPLIER * medianGap;

  // ── Step 3: Build line strings with prefix markers ───────────────────────
  return lineGroups
    .map((group, groupIdx) => {
      // Sort items left→right by x position.
      const sorted = group.items.sort((a, b) => a.transform[4] - b.transform[4]);

      // Bold detection: first item on the line uses a bold font.
      const startsWithBold = isBoldItem(content.styles, sorted[0]);

      // Left-margin detection: first item starts within LEFT_MARGIN_MAX_X
      // PDF units from the left edge.  Cambridge question numbers are always
      // placed at the left margin, so this is a reliable geometric signal.
      const firstX = sorted[0].transform[4];
      const isLeftMargin = firstX < LEFT_MARGIN_MAX_X;

      // Large-gap detection: the vertical gap above this line is much larger
      // than the median, indicating a section or question boundary.
      let hasLargeGapAbove = false;
      if (groupIdx > 0) {
        const gapAbove = lineGroups[groupIdx - 1].y - group.y;
        hasLargeGapAbove = gapAbove >= largeGapThreshold;
      }

      // Reconstruct the line text, preserving inter-column spacing.
      let line;
      if (sorted.length === 1) {
        line = sorted[0].str.trim();
      } else {
        let built = sorted[0].str;
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
          built += " ".repeat(spaces) + cur.str;
        }
        line = built.trim();
      }

      if (!line) return null;

      // Build the prefix string.  Order is fixed (bold, gap, margin) so that
      // the regex patterns in splitIntoQuestions can match them reliably.
      let prefix = "";
      if (startsWithBold)    prefix += BOLD_LINE_PREFIX;
      if (hasLargeGapAbove)  prefix += LARGE_GAP_PREFIX;
      if (isLeftMargin)      prefix += LEFT_MARGIN_PREFIX;

      return prefix + line;
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
 * Prefix prepended to a line whose first text item is rendered in a bold font.
 * Used by splitIntoQuestions to identify question-header lines by their bold
 * formatting rather than relying on text patterns alone.
 */
const BOLD_LINE_PREFIX = '\x01';

/**
 * Prefix prepended to a line that has an unusually large vertical gap above
 * it (>= LARGE_GAP_MULTIPLIER × the median inter-line gap for the page).
 * This is a geometric signal that the line may start a new section or question.
 */
const LARGE_GAP_PREFIX = '\x02';

/**
 * Prefix prepended to a line whose first text item starts at or near the left
 * margin (x < LEFT_MARGIN_MAX_X PDF units).  Cambridge question numbers are
 * always placed at the left margin, making this a reliable positional signal.
 */
const LEFT_MARGIN_PREFIX = '\x03';

/**
 * Maximum y-distance (PDF user-space units) between two items that are still
 * considered part of the same line cluster.  Values ≤ 4 cover typical
 * subscript/superscript baseline shifts without merging adjacent text rows.
 */
const Y_CLUSTER_TOLERANCE = 4;

/**
 * First item x-position threshold (PDF user-space units) below which a line
 * is considered to start "at the left margin".
 * Cambridge A4 papers have a left margin of roughly 30–40 mm ≈ 85–113 pt;
 * question numbers appear right at that margin, so 90 pt is a safe threshold.
 */
const LEFT_MARGIN_MAX_X = 90;

/**
 * A vertical gap is considered "large" when it is this many times greater
 * than the median inter-line gap for the page.  1.8× covers typical paragraph
 * spacing while identifying genuine section/question breaks.
 */
const LARGE_GAP_MULTIPLIER = 1.8;

/**
 * Average character count per page below which a document is flagged as
 * having low text coverage (likely image-heavy or scanned).
 */
const LOW_TEXT_CHARS_PER_PAGE = 200;

/**
 * Maximum allowed gap in the monotonically-increasing question-number
 * sequence.  Allowing a gap of 2 means that if Q3 is missed the extractor
 * still accepts Q4, Q5, … rather than discarding all subsequent questions.
 */
const MAX_QUESTION_NUMBER_GAP = 2;

/**
 * Return true when the given PDF text item uses a bold font.
 * Checks the fontFamily from the styles map (most reliable) and falls back to
 * the raw fontName string that PDF.js sometimes embeds with a descriptor.
 *
 * @param {Object} styles — the `styles` object returned by getTextContent()
 * @param {Object} item   — a single text item from content.items
 * @returns {boolean}
 */
function isBoldItem(styles, item) {
  if (!item) return false;
  const family = styles?.[item.fontName]?.fontFamily ?? '';
  return /bold/i.test(family) || /bold/i.test(item.fontName ?? '');
}

/**
 * Matches a bare integer on its own line — used to strip page-number headers
 * and footers.
 *
 * Cambridge exam papers print the page number as a standalone digit string in
 * the top margin and/or at the very bottom of each page.  PDF.js extracts it
 * as the first or last line(s) of the page text depending on the paper format.
 * We therefore apply this filter only to the first 3 and last 3 raw lines of
 * each page inside splitIntoQuestions (position-aware), so that it does NOT
 * remove legitimate question-number markers that appear in the body of a page.
 * (e.g. "6" alone on a line in the body is Cambridge style for starting Q6.)
 *
 * cleanPageText still applies it unconditionally because that function is used
 * for keyword-based subject/level scanning where question numbers are irrelevant.
 */
const STANDALONE_NUMBER_RE = /^\s*\d+\s*$/;

/**
 * Lines that are typically headers or footers in Cambridge exam papers.
 * These are removed from each page's text before question extraction.
 *
 * NOTE: STANDALONE_NUMBER_RE is intentionally NOT in this list so that
 * isContentLine (used by splitIntoQuestions with position awareness) keeps
 * standalone numbers in the body of a page.  cleanPageText adds the filter
 * back for the scanning path where question numbers are irrelevant.
 */
const NOISE_PATTERNS = [
  /^\s*turn\s+over\s*$/i,
  /^\s*©\s*ucles\s*/i,
  /^\s*cambridge\s+(international|assessment)\s*(examinations?|education)?\s*/i,
  /^\s*\d{4}\/\d+\/[oms]\/\d+\s*/i,          // paper codes like 0580/22/M/J/23
  /^\s*(specimen|mark\s*scheme)\s*$/i,
  /^\s*(additional\s+materials?|answer\s+booklet)\s*/i,
  /^\s*(read\s+these\s+instructions\s+first|information)\s*$/i,
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
 * Strip all known prefix marker characters (\x01, \x02, \x03) from the
 * beginning of a line.  These markers are added by extractPageText to carry
 * formatting and geometric signals; they must be removed before content
 * matching or display.
 * @param {string} line
 * @returns {string}
 */
function stripPrefixes(line) {
  return line.replace(/^[\x01\x02\x03]+/, "");
}

/**
 * Remove common header/footer noise from a line.
 * Does NOT filter standalone numbers — see STANDALONE_NUMBER_RE for why.
 * @param {string} line
 * @returns {boolean} true if the line should be kept
 */
function isContentLine(line) {
  return !NOISE_PATTERNS.some((p) => p.test(stripPrefixes(line)));
}

/**
 * Regex matching a "BLANK PAGE" or "THIS PAGE IS INTENTIONALLY LEFT BLANK" notice.
 * Used to detect PDF pages that should be excluded from question rendering.
 *
 * The `m` flag is intentional: raw page text is a multi-line string and we want
 * to test whether *any* line within it is a standalone blank-page declaration,
 * even if other lines (page numbers, headers) are present on the same page.
 * The leading [\x01\x02\x03]* strips any combination of prefix markers that
 * extractPageText may have prepended to the line.
 */
const BLANK_PAGE_RE = /^[\x01\x02\x03]*\s*(blank\s+page|this\s+page\s+is\s+intentionally\s+(left\s+)?blank)\s*$/im;

/**
 * Return true when the raw page text belongs to a blank page — i.e. the page
 * explicitly declares itself as blank via the standard Cambridge notice.
 *
 * @param {string} rawPageText
 * @returns {boolean}
 */
function isBlankPage(rawPageText) {
  return BLANK_PAGE_RE.test(rawPageText);
}

/**
 * Clean a page's raw text.
 * Used for subject/level keyword scanning where question numbers are irrelevant,
 * so standalone numbers are filtered out here (along with all other noise).
 * All prefix markers inserted by extractPageText are stripped from each line.
 * @param {string} pageText
 * @returns {string}
 */
export function cleanPageText(pageText) {
  return pageText
    .split("\n")
    .map(stripPrefixes)
    .filter((line) => isContentLine(line) && !STANDALONE_NUMBER_RE.test(line))
    .join("\n");
}

// ─── Question splitting ───────────────────────────────────────────────────────

/**
 * Regex for a *candidate* question-start line (primary: bold required).
 *
 * Cambridge exam papers render question numbers in bold.  extractPageText
 * prepends BOLD_LINE_PREFIX (\x01) to every line whose first text item is
 * bold, so a genuine question header will always start with \x01.
 * The new LARGE_GAP_PREFIX (\x02) and LEFT_MARGIN_PREFIX (\x03) may also
 * appear after \x01, so the pattern accepts them as optional followers.
 *
 * Accepted forms (immediately after the prefix block):
 *   "1"           — number alone on a line (Cambridge style: number above question body)
 *   "1."          — number with trailing period, alone on a line
 *   "1 text…"     — number followed by question text on the same line
 *   "1. text…"    — number + period + text
 *   "1 (a) …"     — number + sub-part marker on same line (very common in Cambridge papers)
 *   "Q1 …"        — Q-prefix variants
 *   "Question 1"  — full word prefix
 *
 * Leading-zero numbers are rejected by the character class [1-9]\d? — this
 * rejects "04", "01", "08" etc. which appear in paper codes but never as
 * genuine Cambridge main-question numbers.
 *
 * This is a broad first pass.  False positives are removed by
 * isQuestionFalsePositive() below.
 */
const QUESTION_CANDIDATE_RE =
  // \x01[\x02\x03]*     — bold prefix followed by optional gap/margin prefixes
  // (?:Question\s+|…)?  — optional "Question " / "Q" word prefix
  // ([1-9]\d?)          — 1- or 2-digit number, no leading zero (rejects "04")
  // (?:…|…)             — number ends the line OR is followed by "." / space
  // (?!\s*\d)           — NOT immediately followed by another digit
  /^\x01[\x02\x03]*(?:Question\s+|Q\.?\s*)?([1-9]\d?)(?:\s*\.?\s*$|(?:\.\s+|\s+)(?!\s*\d))/i;

/**
 * Geometric fallback regex — used when bold-prefix detection yields nothing.
 *
 * Requires at least one geometric signal: a large-gap prefix (\x02) or a
 * left-margin prefix (\x03), optionally combined with the bold prefix (\x01).
 * These signals are set by extractPageText based on vertical spacing and the
 * x-position of the first text item, providing reliable question-boundary cues
 * even when bold font metadata is unavailable.
 */
const QUESTION_CANDIDATE_GEOMETRIC_RE =
  /^\x01?(?:\x02[\x03]?|[\x02]?\x03)(?:Question\s+|Q\.?\s*)?([1-9]\d?)(?:\s*\.?\s*$|(?:\.\s+|\s+)(?!\s*\d))/i;

/**
 * Pattern-only fallback regex — last resort when no geometric signals exist.
 *
 * Identical to QUESTION_CANDIDATE_RE except all prefixes (\x01–\x03) are
 * optional.  The same false-positive filters and monotonic-numbering
 * validation still apply; the only change is that plain lines are eligible.
 */
const QUESTION_CANDIDATE_FALLBACK_RE =
  /^\x01?[\x02\x03]*(?:Question\s+|Q\.?\s*)?([1-9]\d?)(?:\s*\.?\s*$|(?:\.\s+|\s+)(?!\s*\d))/i;

/**
 * Patterns that identify a candidate line as a false positive — i.e. it is NOT
 * really the start of a new question even though it begins with a number.
 *
 * Common occurrences in Cambridge exam papers:
 *   "2 marks"  "3 mark"  — mark allocations
 *   "3 cm"  "2 mm"  "5 km" — length measurements
 *   "2 kg"  "4 mg"  "3 g"  — mass measurements
 *   "2 × 10³"  "3 + x"     — inline mathematics
 *   "6 ................."   — numbered fill-in blank (sequence placeholder)
 *   "6. ................."  — same with trailing period
 *   "Question 5 ......."   — dotted-line placeholder with full "Question N" prefix
 *   "Question 5 continues on the next page" — continuation notice (not a new question)
 *
 * The dotted-line pattern is especially important: Cambridge questions sometimes
 * contain a numbered completion sequence (e.g. network communication steps 1–8)
 * where even-numbered rows are blank lines for students to fill in.  Those rows
 * look like "6 ........................." and would otherwise be mistaken for the
 * start of question 6, causing all subsequent real questions to shift by one.
 */
const FALSE_POSITIVE_PATTERNS = [
  /^\s*\d+\s+marks?\b/i,              // mark allocations
  /^\s*\d+\s+(?:cm|mm|km)\b/i,       // length units
  /^\s*\d+\s+(?:kg|mg|g)\b/i,        // mass units
  /^\s*\d+\s*[×÷+\-=*]/,             // mathematical operators
  /^\s*\d+\s*\(\s*\d/,               // number followed by parenthesised digit e.g. "3 (2)"
  /^\s*\d+\.?\s+\.{3,}/,              // fill-in blank or dotted: "6 ......." or "6. ......."
  /^\s*question\s+\d+\s+\.{3,}/i,   // dotted with "Question" prefix: "Question 5 ......."
  /^\s*(?:question\s+)?\d+\s+continues?\b/i, // continuation notice: "Question 5 continues on the next page"
];

/**
 * Return true when a candidate line (already matched by QUESTION_CANDIDATE_RE)
 * should be rejected as a false positive.
 * @param {string} line
 * @returns {boolean}
 */
function isQuestionFalsePositive(line) {
  return FALSE_POSITIVE_PATTERNS.some((re) => re.test(stripPrefixes(line)));
}

/**
 * Returns true if the candidate line at index i appears to be part of a
 * numbered fill-in-the-blank sequence rather than a genuine main question.
 *
 * Cambridge exam papers sometimes include ordered completion exercises (e.g.
 * the steps of a network handshake) where each step is numbered 1–N.
 * Blank-answer steps are rendered as dotted lines ("6 .......................")
 * and are already rejected by FALSE_POSITIVE_PATTERNS.  However, steps that
 * provide a given answer look identical to a main question header — for
 * example:
 *
 *   "7 The booking details are added to the database."
 *
 * This line is actually step 7 of a fill-in sequence inside question 5 (f),
 * not the start of main question 7.
 *
 * We detect this situation by checking whether any line within a small context
 * window around the candidate contains a dotted placeholder whose step number
 * is adjacent (±2) to `num`.  When such a neighbouring dotted line exists it
 * strongly indicates that the candidate is part of a fill-in sequence rather
 * than at a real question boundary.
 *
 * @param {string[]} lines - full flattened line array (after noise filtering)
 * @param {number}   i     - index of the candidate line
 * @param {number}   num   - question number parsed from the candidate line
 * @returns {boolean}
 */
function isInFillinSequence(lines, i, num) {
  const WINDOW = 8;
  const start = Math.max(0, i - WINDOW);
  const end   = Math.min(lines.length, i + WINDOW + 1);
  for (let j = start; j < end; j++) {
    if (j === i) continue;
    const plain = stripPrefixes(lines[j]);
    const m = plain.match(/^\s*(\d+)\s+\.{3,}/);
    if (!m) continue;
    if (Math.abs(parseInt(m[1], 10) - num) <= 2) return true;
  }
  return false;
}

/**
 * Minimum number of non-empty content lines a question must contain before the
 * next question header is accepted as genuine.  Cambridge questions are never
 * just a single line, so anything detected sooner is almost certainly a
 * false positive (e.g. a mark-allocation number, a table cell, etc.).
 */
const MIN_LINES_PER_QUESTION = 2;

/**
 * Scan `lines` for candidate question-start positions using `candidateRE`.
 *
 * Applies the same false-positive filters and monotonic-numbering validation
 * that splitIntoQuestions uses, so the result can be used directly as the
 * `questionStarts` array.
 *
 * Monotonic numbering allows a gap of up to MAX_QUESTION_NUMBER_GAP so that
 * a single missed header (e.g. Q3 not detected) does not discard all later
 * questions (Q4, Q5, … are still accepted after Q2).
 *
 * @param {string[]} lines      — flat filtered line array
 * @param {RegExp}   candidateRE — regex used to identify candidate lines
 * @returns {{ index: number, number: number, candidatesConsidered: number }[]}
 */
function scanForQuestionStarts(lines, candidateRE) {
  const starts = [];
  let candidatesConsidered = 0;
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(candidateRE);
    if (!m) continue;
    candidatesConsidered++;
    if (isQuestionFalsePositive(lines[i])) continue;
    const num = parseInt(m[1], 10);
    if (isInFillinSequence(lines, i, num)) continue;
    const prev = starts[starts.length - 1];
    // Must be in sane range.
    if (num < 1 || num > 40) continue;
    // Cambridge papers always begin at question 1.  Requiring the very first
    // accepted question to be Q1 prevents stray page-number headers (e.g. the
    // page number "2" at the top of page 2) from being mistakenly accepted as
    // the first question, which would then cause Q1 to be skipped entirely.
    if (!prev && num !== 1) continue;
    // Allow a gap of up to MAX_QUESTION_NUMBER_GAP in the sequence so that
    // a single missed question header does not cause all later questions to be
    // discarded.  e.g. if Q3 is not detected, Q4 is still accepted after Q2.
    if (prev && (num <= prev.number || num > prev.number + MAX_QUESTION_NUMBER_GAP)) continue;
    // Reject if the previous question body has fewer than MIN_LINES_PER_QUESTION
    // non-empty lines — this filters out false positives that sit immediately
    // after a real question header (e.g. "2 marks" on line 2 of Q1).
    if (prev) {
      const bodyLines = lines
        .slice(prev.index + 1, i)
        .filter((l) => l.trim().length > 0);
      if (bodyLines.length < MIN_LINES_PER_QUESTION) continue;
    }
    starts.push({ index: i, number: num });
  }
  // Attach the candidate count so callers can surface it in debugInfo.
  starts.candidatesConsidered = candidatesConsidered;
  return starts;
}

/**
 * Assess the text coverage of a set of page texts.
 *
 * Returns diagnostic information useful for detecting image-heavy or scanned
 * PDFs where PDF.js text extraction may be insufficient for reliable question
 * splitting.
 *
 * @param {string[]} pageTexts — raw page text strings (with prefix markers)
 * @returns {{ avgCharsPerPage: number, lowTextPages: number[], isLowCoverage: boolean }}
 */
function assessTextCoverage(pageTexts) {
  const charCounts = pageTexts.map((t) => {
    // Strip prefix markers and collapse whitespace before counting.
    const cleaned = t.replace(/[\x01\x02\x03]/g, "").replace(/\s+/g, " ").trim();
    return cleaned.length;
  });
  const total = charCounts.reduce((s, c) => s + c, 0);
  const avgCharsPerPage = pageTexts.length > 0 ? Math.round(total / pageTexts.length) : 0;
  const lowTextPages = charCounts
    .map((c, i) => (c < 100 ? i + 1 : null))
    .filter((n) => n !== null);
  const isLowCoverage = avgCharsPerPage < LOW_TEXT_CHARS_PER_PAGE;
  return { avgCharsPerPage, lowTextPages, isLowCoverage };
}

/**
 * Split full-document text into individual main questions.
 *
 * Strategy (three-tier fallback):
 *  1. Flatten all pages into a single line array, recording which PDF page
 *     (1-based) each line came from so we can report startPage / endPage.
 *  2a. PRIMARY — require bold prefix (\x01).  Cambridge exam papers render
 *      question numbers in bold, so this is the most precise signal.
 *  2b. GEOMETRIC FALLBACK — require at least one geometric signal: large-gap
 *      prefix (\x02) or left-margin prefix (\x03).  Used when bold metadata
 *      is absent (e.g. non-standard fonts) but layout geometry is reliable.
 *  2c. PATTERN-ONLY FALLBACK — last resort; all prefixes optional.  Used when
 *      text coverage is too low for geometric signals to be meaningful.
 *  3. Accept only monotonically-increasing question numbers (1, 2, 3 …) with
 *     a tolerance of MAX_QUESTION_NUMBER_GAP so that a single missed header
 *     does not discard all subsequent questions.
 *  4. Slice between consecutive accepted starts.  Blank pages ("BLANK PAGE")
 *     within the range are tracked for the caller.
 *
 * @param {string[]} pageTexts — raw text per page (cleaning is applied here)
 * @param {Object}  [outMeta]  — optional object to receive extraction metadata:
 *   { extractionMode, candidateHeadersFound, lowTextCoverage, avgCharsPerPage }
 * @returns {{ number: number, text: string, startPage: number, endPage: number, blankPages: number[] }[]}
 */
export function splitIntoQuestions(pageTexts, outMeta = null) {
  // Build a flat line array and a parallel array mapping each line to its
  // 1-based source page number.
  const lines       = [];
  const linePageMap = []; // linePageMap[i] = 1-based page number

  // Detect blank pages (pages that explicitly say "BLANK PAGE") so they can be
  // excluded from the rendered output.
  const blankPageNums = new Set();

  for (let p = 0; p < pageTexts.length; p++) {
    if (isBlankPage(pageTexts[p])) blankPageNums.add(p + 1); // 1-based
    const rawLines = pageTexts[p].split("\n");
    for (let li = 0; li < rawLines.length; li++) {
      const line = rawLines[li];
      // Drop standard header/footer noise (paper codes, "Turn over", etc.).
      if (!isContentLine(line)) continue;
      // Standalone numbers are page-number headers or footers when they appear
      // at the very START or END of the raw page text.  Cambridge papers render
      // the page number in the top margin and/or at the bottom of each page;
      // PDF.js extracts it as one of the first or last raw lines depending on
      // the paper format.  Only drop standalone numbers from the first 3 and
      // last 3 raw lines so that question-number markers in the page body are
      // preserved (e.g. "6" alone on a line in the body is Q6's header).
      if (STANDALONE_NUMBER_RE.test(stripPrefixes(line)) && (li < 3 || li >= rawLines.length - 3)) continue;
      lines.push(line);
      linePageMap.push(p + 1);
    }
  }

  // Assess text coverage so we can report it in debugInfo even when no
  // fallback is needed.
  const coverage = assessTextCoverage(pageTexts);

  // Three-tier candidate detection:
  // Tier 1 — bold prefix (highest precision, most common for Cambridge papers)
  let questionStarts = scanForQuestionStarts(lines, QUESTION_CANDIDATE_RE);
  let extractionMode = "bold";

  // Tier 2 — geometric signals (large-gap or left-margin), no bold required.
  // Triggered when bold detection finds nothing.
  if (questionStarts.length === 0) {
    questionStarts = scanForQuestionStarts(lines, QUESTION_CANDIDATE_GEOMETRIC_RE);
    extractionMode = "geometric";
  }

  // Tier 3 — pattern-only, no prefix required.
  // Triggered when both bold and geometric detection find nothing.
  if (questionStarts.length === 0) {
    questionStarts = scanForQuestionStarts(lines, QUESTION_CANDIDATE_FALLBACK_RE);
    extractionMode = "pattern-only";
  }

  // Write extraction metadata into the caller-supplied object (if any).
  if (outMeta) {
    outMeta.extractionMode = extractionMode;
    outMeta.candidateHeadersFound = questionStarts.candidatesConsidered ?? 0;
    outMeta.lowTextCoverage = coverage.isLowCoverage;
    outMeta.avgCharsPerPage = coverage.avgCharsPerPage;
  }

  // Build question text slices
  const questions = [];
  for (let i = 0; i < questionStarts.length; i++) {
    const start = questionStarts[i].index;
    const end =
      i + 1 < questionStarts.length ? questionStarts[i + 1].index : lines.length;
    // Strip all prefix markers before joining into the final question text.
    const text = lines
      .slice(start, end)
      .map(stripPrefixes)
      .join("\n")
      .trim();
    if (text.length > 10) {
      const startPage = linePageMap[start] ?? 1;
      // End the question one page before the next question begins.  This ensures
      // the last page shown for question N does not bleed into the first page of
      // question N+1.  For the final question, use the page of its last line.
      let endPage;
      if (i + 1 < questionStarts.length) {
        const nextQPage = linePageMap[questionStarts[i + 1].index] ?? startPage;
        endPage = Math.max(startPage, nextQPage - 1);
      } else {
        endPage = linePageMap[end - 1] ?? startPage;
      }
      // Collect blank pages that fall within this question's page range.
      const blankPages = [...blankPageNums].filter((p) => p >= startPage && p <= endPage);
      questions.push({
        number: questionStarts[i].number,
        text,
        matchedLine: stripPrefixes(lines[start]),
        startPage,
        endPage,
        blankPages,
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
 * Normalize hyphens and underscores to spaces so that, for example,
 * "graph-based" and "graph_theory" are treated as "graph based" and
 * "graph theory" when matching.
 *
 * @param {string} s
 * @returns {string}
 */
function normalizeForMatch(s) {
  return s.replace(/[-_]/g, " ");
}

/**
 * Check whether a keyword appears in text as a whole word or phrase rather
 * than as a bare substring.
 *
 * - Single-word keywords are matched at word boundaries (\b…\b), so
 *   "graph" will not match inside "photographer".
 * - Multi-word phrases are matched at phrase boundaries with flexible
 *   internal whitespace, so "linked list" matches "linked-list" after
 *   normalization and also "linked  list" with extra spaces.
 * - Both text and keyword have hyphens/underscores normalized to spaces
 *   before matching, so "graph-based" in the text matches keyword "graph".
 * - Punctuation adjacent to a token is handled naturally by \b
 *   (e.g., "graph," "graph." "(graph)" all match keyword "graph").
 * - Matching is case-insensitive.
 *
 * @param {string} text — text to search (any case)
 * @param {string} kw   — keyword to find (any case)
 * @returns {boolean}
 */
export function kwMatches(text, kw) {
  const normText = normalizeForMatch(text.toLowerCase());
  const normKw   = normalizeForMatch(kw.toLowerCase());
  if (normKw.includes(" ")) {
    // Multi-word phrase: allow flexible whitespace between words.
    const words   = normKw.split(/\s+/).map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    const pattern = "\\b" + words.join("\\s+") + "\\b";
    return new RegExp(pattern).test(normText);
  } else {
    const escaped = normKw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp("\\b" + escaped + "\\b").test(normText);
  }
}

/**
 * Return the first element of `lines` that contains `kwLower`
 * as a whole word or phrase (case-insensitive), truncated to 100 characters.
 * Returns an empty string if not found.
 *
 * @param {string[]} lines — pre-split lines (original case)
 * @param {string} kwLower — already lower-cased keyword
 * @returns {string}
 */
function findContextLine(lines, kwLower) {
  for (const line of lines) {
    if (kwMatches(line, kwLower)) {
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

      const inMain = kwMatches(mainText, kwLower);
      const inSub  = !inMain && kwMatches(subText, kwLower);

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
 * Augment keyword scores with TF-IDF hybrid scores and return all per-topic
 * results sorted by hybrid score descending.
 *
 * @param {string} questionText
 * @param {{ id: string, label: string, keywords: string[] }[]} topics
 * @returns {Array<import('./topicScorer.js').AugmentedTopicScore>}
 */
function scoreTopicsHybrid(questionText, topics) {
  // Build a lookup so keywords can be re-attached after the scoring pass.
  const keywordsById = Object.fromEntries(topics.map((t) => [t.id, Array.isArray(t.keywords) ? t.keywords : []]));

  // scoreTopics() returns objects without the keywords field; merge them back
  // so that augmentWithHybridScores() can compute TF-IDF against each topic's
  // keyword list without throwing on topic.keywords.join().
  const keywordScored = scoreTopics(questionText, topics).map((scored) => ({
    ...scored,
    keywords: Array.isArray(keywordsById[scored.id]) ? keywordsById[scored.id] : [],
  }));

  return augmentWithHybridScores(questionText, keywordScored)
    .sort((a, b) => b.hybridScore - a.hybridScore);
}

/**
 * Tag a question with its single best-matching topic using the hybrid scorer.
 *
 * Each question is assigned to exactly one topic — the one with the highest
 * hybrid score (TF-IDF cosine similarity + normalised keyword score).  Topics
 * whose hybrid score falls below the "borderline" threshold are excluded, so
 * a question is tagged as "unclassified" only when no topic achieves even a
 * minimal relevance signal.
 *
 * @param {string} questionText
 * @param {{ id: string, label: string, keywords: string[] }[]} topics
 * @returns {string[]} singleton array containing the best topic ID
 */
export function tagTopics(questionText, topics) {
  const scored = scoreTopicsHybrid(questionText, topics)
    .filter((t) => t.relatedness !== "not_related");

  if (scored.length === 0) return ["unclassified"];
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
  const topicScores = scoreTopicsHybrid(questionText, topics);
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
 * @property {number} score — raw keyword score
 * @property {MatchedKeyword[]} matchedKeywords
 * @property {number} hybridScore — combined TF-IDF + keyword score in [0, 1]
 * @property {number} tfidfScore — TF-IDF cosine similarity component in [0, 1]
 * @property {number} kwNormScore — normalised keyword score in [0, 1]
 * @property {"related"|"borderline"|"not_related"} relatedness — categorised hybrid score
 */

/**
 * @typedef {Object} QuestionDebugInfo
 * @property {string} matchedLine  — the raw text line that triggered question detection
 * @property {TopicScore[]} topicScores — all topics with their keyword scores
 * @property {string[]} subParts — sub-part labels found in the question (e.g. ["a","b","i","ii"])
 * @property {'bold'|'geometric'|'pattern-only'} extractionMode — which detection tier was used
 * @property {number} candidateHeadersFound — total candidate lines considered before filtering
 * @property {boolean} lowTextCoverage — true when avg chars/page was below threshold
 * @property {number} avgCharsPerPage — average extractable characters per page for this PDF
 */

/**
 * @typedef {Object} QuestionEntry
 * @property {string} pdfUrl
 * @property {number} number
 * @property {string} text
 * @property {string[]} topics
 * @property {number} startPage  — 1-based page where the question begins
 * @property {number} endPage    — 1-based page where the question ends (≥ startPage)
 * @property {number[]} blankPages — 1-based page numbers within [startPage, endPage] that are blank
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
      // Capture extraction metadata (mode, candidate count, coverage) for debugInfo.
      const extractionMeta = {};
      const questions = splitIntoQuestions(rawPages, extractionMeta);
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
          blankPages: q.blankPages ?? [],
          debugInfo: {
            matchedLine:           q.matchedLine,
            topicScores:           debugResult.topicScores,
            subParts:              debugResult.subParts,
            extractionMode:        extractionMeta.extractionMode        ?? "bold",
            candidateHeadersFound: extractionMeta.candidateHeadersFound ?? 0,
            lowTextCoverage:       extractionMeta.lowTextCoverage       ?? false,
            avgCharsPerPage:       extractionMeta.avgCharsPerPage       ?? 0,
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
