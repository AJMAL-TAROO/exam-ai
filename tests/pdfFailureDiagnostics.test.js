import assert from "node:assert/strict";
import { buildIndex, buildMcqIndex } from "../core.js";

const failureMessage = "Worker initialization failed";
globalThis.pdfjsLib = {
  getDocument() {
    return { promise: Promise.reject(new Error(failureMessage)) };
  },
};

async function verifyFailureCallback(buildFn, label) {
  const failures = [];
  const result = await buildFn(
    ["assets/test-paper.pdf"],
    [],
    null,
    (error, url) => failures.push({ error, url })
  );

  assert.deepEqual(result, [], `${label} should return an empty index`);
  assert.equal(failures.length, 1, `${label} should report one failure`);
  assert.equal(failures[0].url, "assets/test-paper.pdf");
  assert.equal(failures[0].error.message, failureMessage);
}

await verifyFailureCallback(buildIndex, "written index");
await verifyFailureCallback(buildMcqIndex, "MCQ index");

console.log("PDF failure diagnostics: 2 passed, 0 failed");
