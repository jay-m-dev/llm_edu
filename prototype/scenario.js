export const scenarios = [
  {
    id: "intro",
    name: "Intro Run",
    summary: "Learn the loop with a short, safe prompt.",
    intro: "Set a prompt, run generation, inspect what happened, and adjust. Failure is safe here; it just points to what to tweak next.",
    objectiveId: "stable-sampling",
    failureHint: "If output drifts, lower randomness and try again.",
    params: { contextSize: 16, samplingTemp: 0.9, samplingRandom: 0.15 },
    prompt: "Hello world from the simulator.",
  },
  {
    id: "context-drop",
    name: "Context Drop",
    summary: "See how tokens fall out of view.",
    intro: "Use a longer prompt to exceed the context window and watch earlier tokens drop off.",
    objectiveId: "context-safe",
    failureHint: "Increase context size or shorten the prompt to pass.",
    params: { contextSize: 8, samplingTemp: 1, samplingRandom: 0.1, samplingSeed: 4242 },
    prompt:
      "Repeat this sentence to overflow the window. Repeat this sentence to overflow the window. Repeat this sentence to overflow the window.",
  },
  {
    id: "sampling-shift",
    name: "Sampling Shift",
    summary: "Watch outputs drift as randomness rises.",
    intro: "Adjust randomness to see output stabilize or drift. Compare two runs back-to-back.",
    objectiveId: "focused-attention",
    failureHint: "Reduce randomness or tighten the prompt to improve focus.",
    params: { contextSize: 12, samplingTemp: 1.2, samplingRandom: 0.35 },
    prompt: "Describe a playful robot with one surprising detail.",
  },
];

export function findScenario(id) {
  return scenarios.find((scenario) => scenario.id === id) || scenarios[0];
}
