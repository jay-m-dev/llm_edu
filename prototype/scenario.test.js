import assert from "node:assert/strict";
import { findScenario, scenarios } from "./scenario.js";

{
  const scenario = findScenario("intro");
  assert.equal(scenario.id, "intro");
}

{
  const scenario = findScenario("missing");
  assert.equal(scenario.id, scenarios[0].id);
}

console.log("scenario.test.js: all tests passed");
