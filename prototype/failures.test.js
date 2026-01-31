import assert from "node:assert/strict";
import { detectFailures } from "./failures.js";

{
  const failures = detectFailures({
    tokens: [],
    contextDropped: [],
    samplingRandom: 0.1,
    attentionWeights: [],
  });
  assert.ok(failures.some((failure) => failure.id === "empty-input"));
}

{
  const failures = detectFailures({
    tokens: [{ value: "a" }],
    contextDropped: [{ index: 0, token: { value: "a" } }],
    samplingRandom: 0.8,
    attentionWeights: [0.2, 0.2, 0.2],
  });
  const ids = failures.map((failure) => failure.id);
  assert.ok(ids.includes("context-drop"));
  assert.ok(ids.includes("sampling-drift"));
  assert.ok(ids.includes("attention-diffuse"));
}

console.log("failures.test.js: all tests passed");
