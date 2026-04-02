/**
 * tests/splitIntoQuestions.blankPages.test.js
 *
 * Unit tests for the blank-page boundary rule in splitIntoQuestions().
 * Run with: node tests/splitIntoQuestions.blankPages.test.js
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

// ─── Blank-page boundary clamping ─────────────────────────────────────────────

console.log("\nBlank-page boundary clamping in splitIntoQuestions()");

test("question spanning a blank page is clamped to stop before the blank page", () => {
  // Page 1: Question 1 content
  // Page 2: explicit blank page
  // Page 3: Question 2 content
  // Without the fix, Q1 would naturally get endPage = 2 (page before Q2 start).
  // With the fix, endPage must be clamped to 1 (blank page 2 - 1).
  const pageTexts = [
    // page 1 – Q1 header + content (bold prefix \x01 triggers question detection)
    "\x011 A factory makes chocolate bars\nSome content about chocolate",
    // page 2 – blank page
    "BLANK PAGE",
    // page 3 – Q2 header
    "\x012 State what is meant by a relational database model\nSome database content here",
  ];

  const questions = splitIntoQuestions(pageTexts);

  const q1 = questions.find((q) => q.number === 1);
  assert.ok(q1, "Question 1 should be detected");
  assert.equal(
    q1.endPage,
    1,
    `Q1 endPage should be clamped to 1 (before blank page 2), got ${q1.endPage}`
  );
  // The blank page itself must NOT appear in Q1's blankPages list after clamping.
  assert.ok(
    !q1.blankPages.includes(2),
    "Blank page 2 should not appear inside Q1's blankPages after clamping"
  );
});

test("questions without blank pages between them are unaffected", () => {
  // Page 1: Q1, Page 2: Q2 – no blank pages at all.
  // Each question body must have >= MIN_LINES_PER_QUESTION (2) non-empty lines.
  const pageTexts = [
    "\x011 What is the purpose of a primary key\nA primary key uniquely identifies a row\nIt ensures each record in a table is unique",
    "\x012 Describe normalisation to third normal form\nNormalisation removes redundancy\nThird normal form eliminates transitive dependencies",
  ];

  const questions = splitIntoQuestions(pageTexts);

  const q1 = questions.find((q) => q.number === 1);
  const q2 = questions.find((q) => q.number === 2);

  assert.ok(q1, "Q1 should be detected");
  assert.ok(q2, "Q2 should be detected");

  assert.equal(q1.startPage, 1, "Q1 startPage should be 1");
  assert.equal(q1.endPage, 1, "Q1 endPage should be 1 (page before Q2)");
  assert.equal(q2.startPage, 2, "Q2 startPage should be 2");
  assert.deepEqual(q1.blankPages, [], "Q1 should have no blank pages");
  assert.deepEqual(q2.blankPages, [], "Q2 should have no blank pages");
});

test("blank page immediately after startPage does not produce negative or invalid endPage", () => {
  // Q1 starts on page 1, blank page is page 1 itself — blank is NOT in (startPage, endPage]
  // because the filter is strictly > startPage.
  // Q1 starts on page 1, blank page is page 2, Q1's natural endPage is also 2.
  // Clamped endPage = max(startPage=1, blankPage-1=1) = 1, which is >= startPage.
  const pageTexts = [
    "\x011 Describe the structure of a stack data structure\nContent about stacks here",
    "BLANK PAGE",
    "\x012 What is a queue and how does it differ from a stack\nContent about queues here",
  ];

  const questions = splitIntoQuestions(pageTexts);

  const q1 = questions.find((q) => q.number === 1);
  assert.ok(q1, "Q1 should be detected");
  assert.ok(
    q1.endPage >= q1.startPage,
    `endPage (${q1.endPage}) must be >= startPage (${q1.startPage})`
  );
  assert.equal(q1.endPage, 1, `Q1 endPage should be 1, got ${q1.endPage}`);
});

test("blank page at the very start (page 1) does not affect questions starting later", () => {
  // Page 1 is blank, Q1 starts on page 2 – no blanks in Q1's range.
  const pageTexts = [
    "BLANK PAGE",
    "\x011 What is an entity relationship diagram\nContent about ERD here\nAn ERD shows entities and their relationships",
    "\x012 Describe the role of a primary key in a relational table\nContent about primary keys here\nPrimary keys uniquely identify rows in a table",
  ];

  const questions = splitIntoQuestions(pageTexts);

  const q1 = questions.find((q) => q.number === 1);
  assert.ok(q1, "Q1 should be detected");
  assert.equal(q1.startPage, 2, "Q1 should start on page 2");
  assert.equal(q1.endPage, 2, "Q1 endPage should be 2 (page before Q2)");
  assert.deepEqual(q1.blankPages, [], "Q1 should have no blank pages in its range");
});

// ─── Text content respects blank-page clamping ────────────────────────────────

console.log("\nText content attribution after blank-page clamping");

test("Q1 text does not include Q2-only content when a blank page separates them", () => {
  // Page 1: Q1 content about chocolate factories (2 body lines to pass
  //         MIN_LINES_PER_QUESTION so that Q2's header is accepted)
  // Page 2: blank page
  // Page 3: Q2 content about relational databases
  // Q1's text must NOT contain "relational database" (a Q2-only phrase).
  const pageTexts = [
    "\x011 A factory makes chocolate bars\nChocolate production requires cocoa beans\nThe beans are processed and moulded",
    "BLANK PAGE",
    "\x012 State what is meant by a relational database model\nA relational database stores data in tables\nTables are linked by foreign keys",
  ];

  const questions = splitIntoQuestions(pageTexts);

  const q1 = questions.find((q) => q.number === 1);
  const q2 = questions.find((q) => q.number === 2);

  assert.ok(q1, "Q1 should be detected");
  assert.ok(q2, "Q2 should be detected");

  assert.ok(
    !q1.text.toLowerCase().includes("relational database"),
    `Q1 text must not contain Q2-only phrase "relational database", got: ${q1.text}`
  );
  assert.ok(
    q2.text.toLowerCase().includes("relational database"),
    `Q2 text must contain "relational database", got: ${q2.text}`
  );
  assert.ok(
    q1.text.toLowerCase().includes("chocolate"),
    `Q1 text must still contain its own content "chocolate", got: ${q1.text}`
  );
});

test("both questions are independently extractable when each has distinct topic keywords", () => {
  // Q1 is about chocolate/factories; Q2 is about relational databases.
  // After the fix both should be detected as separate questions with
  // their own distinct content – neither absorbs the other.
  const pageTexts = [
    "\x011 A factory makes chocolate bars\nChocolate production requires cocoa\nThe process involves tempering the chocolate",
    "BLANK PAGE",
    "\x012 State what is meant by a relational database model\nA relational database stores data in tables\nTables are linked by foreign keys",
  ];

  const questions = splitIntoQuestions(pageTexts);

  assert.equal(questions.length, 2, `Expected 2 questions, got ${questions.length}`);

  const q1 = questions.find((q) => q.number === 1);
  const q2 = questions.find((q) => q.number === 2);

  assert.ok(q1, "Q1 should be present");
  assert.ok(q2, "Q2 should be present");

  // Q1 must contain only its own content.
  assert.ok(q1.text.toLowerCase().includes("chocolate"), "Q1 should mention chocolate");
  assert.ok(!q1.text.toLowerCase().includes("relational database"), "Q1 should not mention relational database");

  // Q2 must contain only its own content.
  assert.ok(q2.text.toLowerCase().includes("relational database"), "Q2 should mention relational database");
  assert.ok(!q2.text.toLowerCase().includes("chocolate"), "Q2 should not mention chocolate");
});

// ─── Summary ──────────────────────────────────────────────────────────────────

console.log(`\n${passed + failed} test(s): ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
