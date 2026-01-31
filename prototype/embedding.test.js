import assert from "node:assert/strict";
import { embedToken } from "./embedding.js";

{
  const first = embedToken("hello");
  const second = embedToken("hello");
  assert.deepEqual(first, second);
}

{
  const result = embedToken("token");
  assert.equal(result.labels.length, 4);
  assert.equal(result.values.length, 4);
  result.values.forEach((value) => {
    assert.ok(value >= 0 && value <= 1, "value is within 0..1");
  });
}

{
  const a = embedToken("alpha");
  const b = embedToken("beta");
  assert.notDeepEqual(a.values, b.values);
}

console.log("embedding.test.js: all tests passed");
