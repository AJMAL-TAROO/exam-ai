/**
 * tests/nceTopics.test.js
 *
 * Sanity checks for the NCE topic list and NCE manifest structure.
 * Run with: node tests/nceTopics.test.js
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { TOPICS_NCE } from "../subjects/topics-nce.js";

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  PASS ${name}`);
    passed++;
  } catch (err) {
    console.error(`  FAIL ${name}`);
    console.error(`    ${err.message}`);
    failed++;
  }
}

const manifest = JSON.parse(readFileSync(new URL("../assets/manifest.json", import.meta.url), "utf8"));
const nceSubjects = Object.keys(manifest.nce || {}).sort();

console.log("\nNCE topic map");

test("TOPICS_NCE has every NCE subject from the manifest", () => {
  assert.deepEqual(Object.keys(TOPICS_NCE).sort(), nceSubjects);
});

test("every NCE subject has at least one topic", () => {
  for (const subject of nceSubjects) {
    assert.ok(Array.isArray(TOPICS_NCE[subject]), `${subject} topics should be an array`);
    assert.ok(TOPICS_NCE[subject].length > 0, `${subject} should have topics`);
  }
});

test("every NCE topic has id, label, and keywords", () => {
  for (const [subject, topics] of Object.entries(TOPICS_NCE)) {
    for (const topic of topics) {
      assert.ok(typeof topic.id === "string" && topic.id.length > 0, `${subject} topic missing id`);
      assert.ok(typeof topic.label === "string" && topic.label.length > 0, `${subject}/${topic.id} missing label`);
      assert.ok(
        Array.isArray(topic.keywords) && topic.keywords.length > 0,
        `${subject}/${topic.id} missing keywords`
      );
    }
  }
});

test("NCE topic ids are unique per subject", () => {
  for (const [subject, topics] of Object.entries(TOPICS_NCE)) {
    const ids = topics.map((topic) => topic.id);
    assert.equal(new Set(ids).size, ids.length, `${subject} has duplicate topic ids`);
  }
});

console.log("\nNCE manifest structure");

test("NCE subjects use marking-scheme for examiner report equivalents", () => {
  for (const [subject, data] of Object.entries(manifest.nce || {})) {
    assert.ok(Array.isArray(data["question-papers"]), `${subject} missing question-papers array`);
    assert.ok(Array.isArray(data["marking-scheme"]), `${subject} missing marking-scheme array`);
    assert.equal(data["examiner-reports"], undefined, `${subject} should not expose examiner-reports key`);
  }
});

test("NCE marking-scheme entries point at examiner-report PDFs", () => {
  for (const [subject, data] of Object.entries(manifest.nce || {})) {
    assert.ok(data["marking-scheme"].length > 0, `${subject} should have marking-scheme entries`);
    for (const path of data["marking-scheme"]) {
      assert.ok(path.includes("/examiner-reports/"), `${path} should remain in examiner-reports folder`);
      assert.ok(path.endsWith(".pdf"), `${path} should be a PDF`);
    }
  }
});

console.log(`\n${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
