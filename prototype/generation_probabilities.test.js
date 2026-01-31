import assert from "node:assert/strict";
import { buildStepDistribution } from "./generation_probabilities.js";

const tokens = [
  { type: "word", value: "alpha", start: 0, end: 5 },
  { type: "word", value: "beta", start: 6, end: 10 },
  { type: "punct", value: "!", start: 10, end: 11 },
];

{
  const dist = buildStepDistribution(tokens, 0, { seed: 9, temperature: 1, randomness: 0.1 });
  const sum = dist.reduce((acc, value) => acc + value, 0);
  assert.ok(Math.abs(sum - 1) < 1e-9);
}

{
  const first = buildStepDistribution(tokens, 2, { seed: 3, temperature: 1, randomness: 0.2 });
  const second = buildStepDistribution(tokens, 2, { seed: 3, temperature: 1, randomness: 0.2 });
  assert.deepEqual(first, second);
}

{
  const a = buildStepDistribution(tokens, 0, { seed: 1, temperature: 1, randomness: 0.2 });
  const b = buildStepDistribution(tokens, 1, { seed: 1, temperature: 1, randomness: 0.2 });
  assert.notDeepEqual(a, b);
}

console.log("generation_probabilities.test.js: all tests passed");
