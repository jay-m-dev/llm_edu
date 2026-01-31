import assert from "node:assert/strict";
import { evaluateObjectives } from "./objectives.js";

const baseSnapshot = {
  contextDropped: [],
  samplingRandom: 0.1,
  attentionWeights: [0.6, 0.2, 0.2],
};

{
  const results = evaluateObjectives(baseSnapshot);
  assert.equal(results.length, 3);
  results.forEach((result) => assert.equal(result.passed, true));
}

{
  const results = evaluateObjectives({
    contextDropped: [{ index: 0, token: { value: "x" } }],
    samplingRandom: 0.4,
    attentionWeights: [0.4, 0.3, 0.3],
  });
  assert.deepEqual(
    results.map((result) => result.passed),
    [false, false, false]
  );
}

console.log("objectives.test.js: all tests passed");
