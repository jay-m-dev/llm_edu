import assert from "node:assert/strict";
import { defaultPresets, hydratePresets } from "./presets.js";

{
  const presets = hydratePresets(null);
  assert.equal(presets.length, defaultPresets.length);
}

{
  const presets = hydratePresets([{ id: "custom", name: "Custom", params: { contextSize: 10 } }]);
  assert.equal(presets[0].id, "custom");
}

console.log("presets.test.js: all tests passed");
