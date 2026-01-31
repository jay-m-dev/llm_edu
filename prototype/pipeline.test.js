import assert from "node:assert/strict";
import { applyPipeline, getPipelineStages } from "./pipeline.js";

const tokens = [
  { type: "word", value: "Hello", start: 0, end: 5 },
  { type: "punct", value: ",", start: 5, end: 6 },
  { type: "word", value: "World", start: 7, end: 12 },
];

{
  const stages = getPipelineStages();
  assert.equal(stages.length, 3);
}

{
  const result = applyPipeline(tokens);
  assert.equal(result.outputs.length, 3);
  assert.equal(result.finalTokens.length, tokens.length);
}

{
  const full = applyPipeline(tokens);
  const bypass = applyPipeline(tokens, { enabledStageIds: ["normalize", "compress"] });
  const fullValues = full.finalTokens.map((token) => token.value).join(" ");
  const bypassValues = bypass.finalTokens.map((token) => token.value).join(" ");
  assert.notEqual(fullValues, bypassValues);
}

{
  const resultA = applyPipeline(tokens);
  const resultB = applyPipeline(tokens);
  assert.deepEqual(resultA, resultB);
}

console.log("pipeline.test.js: all tests passed");
