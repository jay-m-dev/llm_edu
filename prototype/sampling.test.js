import assert from "node:assert/strict";
import { buildDistribution, sampleFromDistribution } from "./sampling.js";

const tokens = [
  { type: "word", value: "short", start: 0, end: 5 },
  { type: "word", value: "longerword", start: 6, end: 16 },
  { type: "punct", value: "!", start: 16, end: 17 },
];

{
  const dist = buildDistribution(tokens, { seed: 42, temperature: 1, randomness: 0 });
  const sum = dist.reduce((acc, value) => acc + value, 0);
  assert.ok(Math.abs(sum - 1) < 1e-9);
}

{
  const first = sampleFromDistribution(tokens, { seed: 7, temperature: 1, randomness: 0.2 });
  const second = sampleFromDistribution(tokens, { seed: 7, temperature: 1, randomness: 0.2 });
  assert.deepEqual(first, second);
}

{
  const cool = buildDistribution(tokens, { seed: 1, temperature: 0.5, randomness: 0 });
  const hot = buildDistribution(tokens, { seed: 1, temperature: 2, randomness: 0 });
  assert.notDeepEqual(cool, hot);
}

console.log("sampling.test.js: all tests passed");
