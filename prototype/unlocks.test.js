import assert from "node:assert/strict";
import { applyUnlocks, defaultUnlocks } from "./unlocks.js";

{
  const results = [
    { id: "stable-sampling", passed: true },
    { id: "focused-attention", passed: false },
  ];
  const rules = {
    "stable-sampling": "sampling-random",
    "focused-attention": "sampling-temp",
  };
  const { state, unlocked } = applyUnlocks(defaultUnlocks, results, rules);
  assert.equal(state["sampling-random"], true);
  assert.equal(state["sampling-temp"], false);
  assert.deepEqual(unlocked, ["sampling-random"]);
}

{
  const results = [{ id: "stable-sampling", passed: true }];
  const rules = { "stable-sampling": "sampling-random" };
  const { unlocked } = applyUnlocks({ "sampling-random": true }, results, rules);
  assert.deepEqual(unlocked, []);
}

console.log("unlocks.test.js: all tests passed");
