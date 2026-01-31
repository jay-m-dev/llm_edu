import assert from "node:assert/strict";
import { computeAttention } from "./attention.js";

const tokens = [
  { type: "word", value: "alpha", start: 0, end: 5 },
  { type: "punct", value: ",", start: 5, end: 6 },
  { type: "word", value: "alpha", start: 7, end: 12 },
];

{
  const weights = computeAttention(tokens, 2);
  assert.equal(weights.length, tokens.length);
  const sum = weights.reduce((acc, value) => acc + value, 0);
  assert.ok(Math.abs(sum - 1) < 1e-9);
}

{
  const first = computeAttention(tokens, 2);
  const second = computeAttention(tokens, 2);
  assert.deepEqual(first, second);
}

{
  const weights = computeAttention(tokens, 2);
  assert.ok(weights[2] > weights[1]);
}

console.log("attention.test.js: all tests passed");
