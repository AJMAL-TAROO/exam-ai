/**
 * tests/splitIntoQuestions.geometric.test.js
 *
 * Unit tests for geometric-mode question detection in splitIntoQuestions().
 * Specifically validates that question headers marked with the left-margin
 * prefix (\x03) are recognised as new question boundaries so that adjacent
 * questions are never merged into each other.
 *
 * Run with: node tests/splitIntoQuestions.geometric.test.js
 */

import assert from "node:assert/strict";
import { splitIntoQuestions } from "../core.js";

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

// ─── Geometric mode — left-margin prefix (\x03) ───────────────────────────────

console.log("\nGeometric mode: left-margin prefix (\x03) question splitting");

test("Q4 is not merged into Q3 when all headers carry the left-margin prefix", () => {
  // Simulates geometric mode: no bold prefix (\x01), headers use \x03 only.
  // Q1–Q4 all have the left-margin prefix.  The critical assertion is that
  // Q4's header ("4 K2 Mountain Guiding...") is detected as a new question
  // boundary and is NOT merged into Q3.
  // Without a sufficient LEFT_MARGIN_MAX_X the "4" might not receive \x03,
  // causing Q3 to absorb Q4's content.
  const pageTexts = [
    [
      "\x031 A factory makes chocolate bars",
      "The factory runs three production lines simultaneously",
      "Each line produces a different variety of chocolate",
      "\x032 State what is meant by a relational database model",
      "A relational database organises data into tables",
      "Tables are related using foreign-key constraints",
      "\x033 The table shows part of the instruction set for a processor",
      "The processor uses two-address instructions",
      "Each instruction has an opcode and two operands",
      "\x034 K2 Mountain Guiding is a company that organises guided climbs",
      "The company keeps records of climbers and their bookings",
      "Describe the structure of a relational database suitable for this purpose",
    ].join("\n"),
  ];

  const questions = splitIntoQuestions(pageTexts);

  const q3 = questions.find((q) => q.number === 3);
  const q4 = questions.find((q) => q.number === 4);

  assert.ok(q3, "Question 3 should be detected");
  assert.ok(q4, "Question 4 should be detected as a separate question");

  // Q3 must not contain any Q4 content.
  assert.ok(
    !q3.text.toLowerCase().includes("k2 mountain"),
    `Q3 text must not include Q4 content ("k2 mountain"), got: ${q3.text}`
  );

  // Q4 must contain its own content.
  assert.ok(
    q4.text.toLowerCase().includes("k2 mountain"),
    `Q4 text must include "k2 mountain", got: ${q4.text}`
  );
});

test("geometric mode correctly splits three consecutive questions via left-margin prefix", () => {
  // Questions 1, 2 and 3 each have only the left-margin prefix — no bold.
  // All three must be detected as independent questions.
  const pageTexts = [
    [
      "\x031 A factory makes chocolate bars",
      "The factory runs three production lines simultaneously",
      "Each line produces a different variety of chocolate",
      "\x032 State what is meant by a relational database model",
      "A relational database organises data into tables",
      "Tables are related using foreign-key constraints",
      "\x033 The table shows part of the instruction set for a processor",
      "Registers are used to hold intermediate results",
      "The program counter holds the address of the next instruction",
    ].join("\n"),
  ];

  const questions = splitIntoQuestions(pageTexts);

  assert.equal(
    questions.length,
    3,
    `Expected 3 questions, got ${questions.length}: ${questions.map((q) => q.number).join(", ")}`
  );

  const q1 = questions.find((q) => q.number === 1);
  const q2 = questions.find((q) => q.number === 2);
  const q3 = questions.find((q) => q.number === 3);

  assert.ok(q1, "Q1 should be detected");
  assert.ok(q2, "Q2 should be detected");
  assert.ok(q3, "Q3 should be detected");

  assert.ok(q1.text.toLowerCase().includes("chocolate"), "Q1 should contain its own content");
  assert.ok(!q1.text.toLowerCase().includes("relational"), "Q1 must not absorb Q2 content");

  assert.ok(q2.text.toLowerCase().includes("relational"), "Q2 should contain its own content");
  assert.ok(!q2.text.toLowerCase().includes("chocolate"), "Q2 must not contain Q1 content");

  assert.ok(q3.text.toLowerCase().includes("processor"), "Q3 should contain its own content");
  assert.ok(!q3.text.toLowerCase().includes("chocolate"), "Q3 must not contain Q1 content");
});

test("left-margin prefix alone (no bold, no large-gap) is sufficient to trigger geometric detection", () => {
  // Verifies that \x03 by itself (without \x01 or \x02) enables geometric mode.
  const pageTexts = [
    [
      "\x031 What is the purpose of a primary key in a relational table",
      "A primary key uniquely identifies each record",
      "It prevents duplicate rows within the same table",
      "\x032 Describe what is meant by normalisation",
      "Normalisation removes redundant data from tables",
      "Third normal form eliminates transitive dependencies",
    ].join("\n"),
  ];

  const meta = {};
  const questions = splitIntoQuestions(pageTexts, meta);

  assert.equal(
    meta.extractionMode,
    "geometric",
    `Expected extractionMode to be "geometric", got "${meta.extractionMode}"`
  );

  assert.equal(
    questions.length,
    2,
    `Expected 2 questions, got ${questions.length}`
  );
});

// ─── Summary ──────────────────────────────────────────────────────────────────

console.log(`\n${passed + failed} test(s): ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
