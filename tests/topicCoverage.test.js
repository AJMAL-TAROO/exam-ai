/**
 * tests/topicCoverage.test.js
 *
 * Ensures each manifest subject has a matching topic list for its level.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { TOPICS_A } from "../subjects/topics-a.js";
import { TOPICS_O } from "../subjects/topics-o.js";
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
const topicMaps = {
  "o-level": TOPICS_O,
  "a-level": TOPICS_A,
  nce: TOPICS_NCE,
};

function hasTopics(subjectTopics) {
  if (Array.isArray(subjectTopics)) return subjectTopics.length > 0;
  if (!subjectTopics || typeof subjectTopics !== "object") return false;
  if (Array.isArray(subjectTopics.topics)) return subjectTopics.topics.length > 0;
  if (subjectTopics.paperTopics) return Object.values(subjectTopics.paperTopics).some(hasTopics);
  return Object.values(subjectTopics).some(hasTopics);
}

console.log("\nTopic coverage by level");

for (const [level, topicMap] of Object.entries(topicMaps)) {
  test(`${level} manifest subjects all have topics`, () => {
    const manifestSubjects = Object.keys(manifest[level] || {}).sort();
    const topicSubjects = Object.keys(topicMap || {}).sort();
    assert.deepEqual(topicSubjects, manifestSubjects);

    for (const subject of manifestSubjects) {
      assert.ok(hasTopics(topicMap[subject]), `${level}/${subject} has no topics`);
    }
  });
}

test("English is not exposed in manifest or topic maps", () => {
  for (const [level, subjects] of Object.entries(manifest)) {
    assert.equal(subjects.english, undefined, `${level} manifest still exposes english`);
  }

  for (const [level, topicMap] of Object.entries(topicMaps)) {
    assert.equal(topicMap.english, undefined, `${level} topic map still exposes english`);
  }
});

console.log(`\n${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
