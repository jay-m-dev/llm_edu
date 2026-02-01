import assert from "node:assert/strict";
import { logEvent } from "./instrumentation.js";

{
  const logs = logEvent([], "run_start", { id: 1 });
  assert.equal(logs.length, 1);
  assert.equal(logs[0].type, "run_start");
}

{
  const logs = logEvent([], "unknown");
  assert.equal(logs.length, 0);
}

console.log("instrumentation.test.js: all tests passed");
