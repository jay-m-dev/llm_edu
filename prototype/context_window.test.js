import assert from "node:assert/strict";
import { applyContextWindow } from "./context_window.js";

const tokens = [
  { type: "word", value: "a", start: 0, end: 1 },
  { type: "word", value: "b", start: 2, end: 3 },
  { type: "word", value: "c", start: 4, end: 5 },
  { type: "word", value: "d", start: 6, end: 7 },
  { type: "word", value: "e", start: 8, end: 9 },
];

{
  const result = applyContextWindow(tokens, 3);
  assert.deepEqual(
    result.activeTokens.map((item) => item.index),
    [2, 3, 4]
  );
  assert.deepEqual(
    result.droppedTokens.map((item) => item.index),
    [0, 1]
  );
}

{
  const result = applyContextWindow(tokens, 10);
  assert.equal(result.activeTokens.length, tokens.length);
  assert.equal(result.droppedTokens.length, 0);
}

{
  const result = applyContextWindow(tokens, 0);
  assert.equal(result.activeTokens.length, 0);
  assert.equal(result.droppedTokens.length, tokens.length);
}

console.log("context_window.test.js: all tests passed");
