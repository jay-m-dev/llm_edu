import assert from "node:assert/strict";
import { createClock } from "./clock.js";

{
  let ticks = 0;
  const clock = createClock({ onTick: () => { ticks += 1; } });
  clock.step();
  clock.step();
  assert.equal(ticks, 2);
}

console.log("clock.test.js: all tests passed");
