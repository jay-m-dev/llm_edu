import assert from "node:assert/strict";
import { scoreRun } from "./scoring.js";

{
  const scores = scoreRun({
    samplingRandom: 0.2,
    attentionWeights: [0.6, 0.2, 0.2],
    contextDropped: [],
    tokens: [{ value: "a" }, { value: "b" }, { value: "c" }],
  });
  assert.equal(scores.length, 4);
  scores.forEach((score) => {
    assert.ok(score.value >= 0 && score.value <= 1);
  });
}

{
  const scores = scoreRun({
    samplingRandom: 0.8,
    attentionWeights: [],
    contextDropped: [{ index: 0 }],
    tokens: [],
  });
  const values = scores.map((score) => score.value);
  assert.ok(values[0] < 1);
}

console.log("scoring.test.js: all tests passed");
