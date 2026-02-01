import assert from "node:assert/strict";
import { detectHallucinations } from "./hallucination.js";

{
  const tokens = [
    { type: "word", value: "alpha" },
    { type: "word", value: "beta" },
  ];
  const distributions = [
    [0.1, 0.9],
    [0.05, 0.95],
  ];
  const flags = detectHallucinations(tokens, distributions, 0.2);
  assert.equal(flags.length, 1);
}

{
  const tokens = [{ type: "punct", value: "!" }];
  const distributions = [[0.05]];
  const flags = detectHallucinations(tokens, distributions, 0.2);
  assert.equal(flags.length, 0);
}

console.log("hallucination.test.js: all tests passed");
