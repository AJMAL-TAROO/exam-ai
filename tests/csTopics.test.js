/**
 * tests/csTopics.test.js
 *
 * Sanity checks for the Cambridge AS & A Level Computer Science
 * chapter-aligned topic list in subjects/topics-a.js.
 *
 * Run with: node tests/csTopics.test.js
 */

import assert from "node:assert/strict";
import { TOPICS_A } from "../subjects/topics-a.js";

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

// ─── CS topic structure ───────────────────────────────────────────────────────

const csTopics = TOPICS_A["computer-science"];

console.log("\nCambridge CS chapter alignment");

test("computer-science key exists in TOPICS_A", () => {
  assert.ok(Array.isArray(csTopics), "expected an array under TOPICS_A['computer-science']");
});

test("exactly 20 chapters are defined", () => {
  assert.equal(csTopics.length, 20, `expected 20 chapters, got ${csTopics.length}`);
});

test("every chapter has a non-empty id", () => {
  csTopics.forEach((ch, i) => {
    assert.ok(typeof ch.id === "string" && ch.id.length > 0, `chapter ${i + 1} has missing/empty id`);
  });
});

test("every chapter has a label containing its chapter number", () => {
  csTopics.forEach((ch, i) => {
    const expectedNum = String(i + 1);
    assert.ok(
      ch.label.includes(expectedNum),
      `chapter ${i + 1} label "${ch.label}" does not contain "${expectedNum}"`
    );
  });
});

test("every chapter has a non-empty keywords array", () => {
  csTopics.forEach((ch, i) => {
    assert.ok(
      Array.isArray(ch.keywords) && ch.keywords.length > 0,
      `chapter ${i + 1} ("${ch.label}") has no keywords`
    );
  });
});

test("all chapter ids are unique", () => {
  const ids = csTopics.map((ch) => ch.id);
  const unique = new Set(ids);
  assert.equal(unique.size, ids.length, `duplicate chapter ids found: ${ids.filter((id, i) => ids.indexOf(id) !== i)}`);
});

test("chapter 1 contains 'binary' keyword", () => {
  const ch1 = csTopics[0];
  assert.ok(ch1.keywords.some((kw) => kw.toLowerCase() === "binary"), "chapter 1 missing 'binary' keyword");
});

test("chapter 8 contains 'primary key' keyword", () => {
  const ch8 = csTopics[7];
  assert.ok(ch8.keywords.some((kw) => kw.toLowerCase().includes("primary key")), "chapter 8 missing 'primary key' keyword");
});

test("chapter 18 contains 'neural network' keyword", () => {
  const ch18 = csTopics[17];
  assert.ok(ch18.keywords.some((kw) => kw.toLowerCase().includes("neural network")), "chapter 18 missing 'neural network' keyword");
});

test("chapter 20 contains 'OOP' or 'object-oriented' keyword", () => {
  const ch20 = csTopics[19];
  assert.ok(
    ch20.keywords.some((kw) => kw === "OOP" || kw.toLowerCase().includes("object-oriented")),
    "chapter 20 missing OOP keyword"
  );
});

// ─── Chapter 4 assembly-mnemonic anchors ──────────────────────────────────────

const ch4 = csTopics[3];
const ch4kws = ch4.keywords.map((k) => k.toUpperCase());

const REQUIRED_MNEMONICS = [
  "LDM", "LDD", "LDR", "LDX", "STO", "INC", "DEC",
  "ADD", "SUB", "JMP", "JPE", "JPN", "JPZ", "OUT", "IN", "END",
];
const REQUIRED_REGISTERS = ["ACC", "IX", "PC", "MAR", "MDR", "CIR"];

console.log("\nChapter 4 assembly-mnemonic anchors");

test("chapter 4 contains all required mnemonic anchor keywords", () => {
  const missing = REQUIRED_MNEMONICS.filter((m) => !ch4kws.includes(m));
  assert.equal(
    missing.length,
    0,
    `chapter 4 missing mnemonics: ${missing.join(", ")}`
  );
});

test("chapter 4 contains all required register/CPU anchor keywords", () => {
  const missing = REQUIRED_REGISTERS.filter((r) => !ch4kws.includes(r));
  assert.equal(
    missing.length,
    0,
    `chapter 4 missing register/CPU terms: ${missing.join(", ")}`
  );
});

test("assembly-trace snippet scores higher for Chapter 4 than Chapter 1", () => {
  // Simulate the keyword hit-count scoring used by the classifier.
  // Count how many keywords from each chapter appear in the snippet (case-insensitive).
  const snippet = "LDM STO LDX LDD ACC IX ASCII";
  const snippetUpper = snippet.toUpperCase();

  function countHits(topic) {
    return topic.keywords.filter((kw) =>
      snippetUpper.includes(kw.toUpperCase())
    ).length;
  }

  const ch1 = csTopics[0];
  const ch4hits = countHits(ch4);
  const ch1hits = countHits(ch1);

  assert.ok(
    ch4hits > ch1hits,
    `Expected Chapter 4 (${ch4hits} hits) to outscore Chapter 1 (${ch1hits} hits) for assembly-trace snippet`
  );
});

// ─── Summary ──────────────────────────────────────────────────────────────────

console.log(`\n${passed + failed} test(s): ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
