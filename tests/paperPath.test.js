/**
 * tests/paperPath.test.js
 *
 * Tests for the buildPaperPath utility and manifest paper-URL lookup.
 * Run with: node tests/paperPath.test.js
 */

import assert from "node:assert/strict";
import { buildPaperPath, VALID_PAPER_NUMBERS } from "../pathUtils.js";

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

// ─── buildPaperPath — valid inputs ────────────────────────────────────────────

console.log("\nbuildPaperPath — valid paper numbers");

test("paper 1 returns correct path", () => {
  assert.equal(
    buildPaperPath("a-level", "computer-science", "question-papers", 1),
    "assets/a-level/computer-science/question-papers/paper-1"
  );
});

test("paper 2 returns correct path", () => {
  assert.equal(
    buildPaperPath("a-level", "computer-science", "question-papers", 2),
    "assets/a-level/computer-science/question-papers/paper-2"
  );
});

test("paper 3 returns correct path", () => {
  assert.equal(
    buildPaperPath("a-level", "computer-science", "question-papers", 3),
    "assets/a-level/computer-science/question-papers/paper-3"
  );
});

test("paper 4 returns correct path", () => {
  assert.equal(
    buildPaperPath("a-level", "computer-science", "question-papers", 4),
    "assets/a-level/computer-science/question-papers/paper-4"
  );
});

test("string '1' is coerced to number", () => {
  assert.equal(
    buildPaperPath("a-level", "computer-science", "question-papers", "1"),
    "assets/a-level/computer-science/question-papers/paper-1"
  );
});

test("level and subject are reflected in the path", () => {
  const path = buildPaperPath("o-level", "maths", "question-papers", 1);
  assert.ok(path.startsWith("assets/o-level/maths/"));
});

test("resource is reflected in the path", () => {
  const path = buildPaperPath("a-level", "computer-science", "mark-schemes", 2);
  assert.ok(path.includes("/mark-schemes/"));
});

// ─── buildPaperPath — invalid inputs ─────────────────────────────────────────

console.log("\nbuildPaperPath — invalid paper numbers");

test("throws for paper 0", () => {
  assert.throws(
    () => buildPaperPath("a-level", "computer-science", "question-papers", 0),
    /Invalid paper number/
  );
});

test("throws for paper 5", () => {
  assert.throws(
    () => buildPaperPath("a-level", "computer-science", "question-papers", 5),
    /Invalid paper number/
  );
});

test("throws for negative number", () => {
  assert.throws(
    () => buildPaperPath("a-level", "computer-science", "question-papers", -1),
    /Invalid paper number/
  );
});

test("throws for non-integer (1.5)", () => {
  assert.throws(
    () => buildPaperPath("a-level", "computer-science", "question-papers", 1.5),
    /Invalid paper number/
  );
});

test("throws for NaN", () => {
  assert.throws(
    () => buildPaperPath("a-level", "computer-science", "question-papers", NaN),
    /Invalid paper number/
  );
});

test("throws for undefined", () => {
  assert.throws(
    () => buildPaperPath("a-level", "computer-science", "question-papers", undefined),
    /Invalid paper number/
  );
});

// ─── VALID_PAPER_NUMBERS ──────────────────────────────────────────────────────

console.log("\nVALID_PAPER_NUMBERS");

test("contains exactly 1, 2, 3, 4", () => {
  assert.deepEqual([...VALID_PAPER_NUMBERS], [1, 2, 3, 4]);
});

// ─── Manifest paper-URL lookup (simulated) ────────────────────────────────────

console.log("\nManifest paper-URL lookup (simulated)");

/**
 * Mirrors the lookup logic used in app.js onLoadFilesClick for CS A-Level.
 * @param {object} manifest
 * @param {string} level
 * @param {string} subject
 * @param {number} paperNumber
 * @returns {string[]}
 */
function getManifestPaperUrls(manifest, level, subject, paperNumber) {
  const subjectData = manifest[level]?.[subject];
  const paperKey = `paper-${paperNumber}`;
  if (subjectData && typeof subjectData === "object" && !Array.isArray(subjectData)) {
    return subjectData[paperKey] || [];
  }
  return [];
}

const sampleManifest = {
  "a-level": {
    "maths": [],
    "computer-science": {
      "paper-1": [
        "assets/a-level/computer-science/question-papers/paper-1/9618_w23_qp_11.pdf",
        "assets/a-level/computer-science/question-papers/paper-1/9618_w23_qp_12.pdf",
      ],
      "paper-2": [],
      "paper-3": [],
      "paper-4": [],
    },
  },
};

test("returns URLs for paper-1 when PDFs exist", () => {
  const urls = getManifestPaperUrls(sampleManifest, "a-level", "computer-science", 1);
  assert.equal(urls.length, 2);
  assert.ok(urls[0].includes("paper-1"));
});

test("returns empty array for paper-2 (no PDFs)", () => {
  const urls = getManifestPaperUrls(sampleManifest, "a-level", "computer-science", 2);
  assert.deepEqual(urls, []);
});

test("returns empty array for paper-3 (no PDFs)", () => {
  const urls = getManifestPaperUrls(sampleManifest, "a-level", "computer-science", 3);
  assert.deepEqual(urls, []);
});

test("returns empty array for paper-4 (no PDFs)", () => {
  const urls = getManifestPaperUrls(sampleManifest, "a-level", "computer-science", 4);
  assert.deepEqual(urls, []);
});

test("returns empty array for flat-array subjects (e.g. maths)", () => {
  const urls = getManifestPaperUrls(sampleManifest, "a-level", "maths", 1);
  assert.deepEqual(urls, []);
});

test("returns empty array for missing subject", () => {
  const urls = getManifestPaperUrls(sampleManifest, "a-level", "physics", 1);
  assert.deepEqual(urls, []);
});

// ─── Summary ──────────────────────────────────────────────────────────────────

console.log(`\n${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
