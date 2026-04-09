/**
 * pathUtils.js — Asset path helpers.
 *
 * Provides a robust path builder for locating question-paper PDF directories
 * so that path construction is centralised and never duplicated.
 */

/**
 * Valid paper numbers for A-Level Computer Science.
 * @type {ReadonlyArray<number>}
 */
export const VALID_PAPER_NUMBERS = Object.freeze([1, 2, 3, 4]);

/**
 * Build the asset directory path for a specific paper.
 *
 * @param {string} level        - e.g. 'a-level'
 * @param {string} subject      - e.g. 'computer-science'
 * @param {string} resource     - e.g. 'question-papers'
 * @param {number|string} paperNumber - must be 1, 2, 3, or 4
 * @returns {string} e.g. 'assets/a-level/computer-science/question-papers/paper-1'
 * @throws {Error} if paperNumber is not 1–4
 */
export function buildPaperPath(level, subject, resource, paperNumber) {
  const n = Number(paperNumber);
  if (!Number.isInteger(n) || n < 1 || n > 4) {
    throw new Error(
      `Invalid paper number: ${paperNumber}. Must be 1, 2, 3, or 4.`
    );
  }
  return `assets/${level}/${subject}/${resource}/paper-${n}`;
}
