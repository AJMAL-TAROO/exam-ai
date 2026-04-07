/**
 * tests/keywordMatching.test.js
 *
 * Regression tests for the whole-word keyword matching introduced in
 * kwMatches() (core.js) to prevent false-positive substring matches
 * (e.g., keyword "graph" incorrectly matching inside "photographer").
 *
 * Run with: node tests/keywordMatching.test.js
 */

import assert from "node:assert/strict";
import { kwMatches } from "../core.js";

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

// ─── Regression: no false positives from substring matching ──────────────────

console.log("\nFalse-positive regression (substring must NOT match)");

test('keyword "graph" does not match inside "photographer"', () => {
  assert.equal(kwMatches("the photographer took a photo", "graph"), false);
});

test('keyword "graph" does not match inside "autograph"', () => {
  assert.equal(kwMatches("she signed an autograph", "graph"), false);
});

test('keyword "tree" does not match inside "street"', () => {
  assert.equal(kwMatches("walk down the street", "tree"), false);
});

test('keyword "stack" does not match inside "haystack"', () => {
  assert.equal(kwMatches("needle in a haystack", "stack"), false);
});

// ─── Single-word whole-word matching ─────────────────────────────────────────

console.log("\nSingle-word whole-word matching (must match)");

test('keyword "graph" matches standalone "graph"', () => {
  assert.equal(kwMatches("draw a graph of the data", "graph"), true);
});

test('keyword "graph" is case-insensitive', () => {
  assert.equal(kwMatches("draw a Graph of the data", "graph"), true);
});

// ─── Punctuation adjacent to tokens ──────────────────────────────────────────

console.log("\nPunctuation-adjacent matching");

test('keyword "graph" matches "graph," (trailing comma)', () => {
  assert.equal(kwMatches("construct a graph, then label it", "graph"), true);
});

test('keyword "graph" matches "graph." (trailing period)', () => {
  assert.equal(kwMatches("draw the graph.", "graph"), true);
});

test('keyword "graph" matches "(graph)" (surrounded by parentheses)', () => {
  assert.equal(kwMatches("see figure (graph) below", "graph"), true);
});

test('keyword "graph" matches "graph:" (trailing colon)', () => {
  assert.equal(kwMatches("graph: a visual representation", "graph"), true);
});

// ─── Multi-word phrase matching ───────────────────────────────────────────────

console.log("\nMulti-word phrase matching");

test('keyword "linked list" matches "linked list"', () => {
  assert.equal(kwMatches("implement a linked list in java", "linked list"), true);
});

test('keyword "linked list" matches with trailing punctuation "linked list."', () => {
  assert.equal(kwMatches("implement a linked list.", "linked list"), true);
});

test('keyword "linked list" matches with extra internal spaces', () => {
  assert.equal(kwMatches("implement a linked  list", "linked list"), true);
});

test('keyword "linked list" does NOT match "linked" alone', () => {
  assert.equal(kwMatches("the nodes are linked together", "linked list"), false);
});

test('keyword "binary tree" matches "binary tree"', () => {
  assert.equal(kwMatches("traverse a binary tree using dfs", "binary tree"), true);
});

// ─── Hyphen / underscore normalization ───────────────────────────────────────

console.log("\nHyphen/underscore normalization");

test('keyword "graph" matches "graph-based" (hyphenated text)', () => {
  assert.equal(kwMatches("a graph-based approach", "graph"), true);
});

test('keyword "graph" matches "graph_theory" (underscored text)', () => {
  assert.equal(kwMatches("study graph_theory", "graph"), true);
});

test('keyword "graph based" (multi-word) matches "graph-based" in text', () => {
  assert.equal(kwMatches("a graph-based algorithm", "graph based"), true);
});

test('keyword "graph based" (multi-word) matches "graph_based" in text', () => {
  assert.equal(kwMatches("a graph_based algorithm", "graph based"), true);
});

// ─── AND/OR false-positive prevention ────────────────────────────────────────

console.log("\nAND/OR false-positive prevention");

test('standalone keyword "AND" matches plain English "and" (shows why it must not be used alone)', () => {
  // kwMatches is case-insensitive whole-word: "and" in English text matches
  // keyword "AND". This test documents the behaviour and explains why the
  // keyword lists use "AND gate" / "OR gate" instead of bare "AND" / "OR".
  assert.equal(kwMatches("Explain the advantages and disadvantages", "AND"), true);
});

test('multi-word keyword "AND gate" does NOT match plain English "and"', () => {
  assert.equal(kwMatches("Explain the advantages and disadvantages", "AND gate"), false);
});

test('multi-word keyword "OR gate" does NOT match plain English "or"', () => {
  assert.equal(kwMatches("choose one or the other option", "OR gate"), false);
});

test('multi-word keyword "NOT gate" does NOT match plain English "not"', () => {
  assert.equal(kwMatches("this is not a logic question", "NOT gate"), false);
});

test('"AND gate" matches technical text "truth table for AND gate"', () => {
  assert.equal(kwMatches("truth table for AND gate", "AND gate"), true);
});

test('"OR gate" matches technical text "inputs to OR gate"', () => {
  assert.equal(kwMatches("inputs to OR gate", "OR gate"), true);
});

test('"NOT gate" matches technical text "output of NOT gate is inverted"', () => {
  assert.equal(kwMatches("output of NOT gate is inverted", "NOT gate"), true);
});

// ─── Summary ──────────────────────────────────────────────────────────────────

console.log(`\n${passed + failed} test(s): ${passed} passed, ${failed} failed\n`);
if (failed > 0) process.exit(1);
