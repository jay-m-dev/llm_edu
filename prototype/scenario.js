export const scenarios = [
  {
    id: "intro",
    name: "Intro Run",
    summary: "Learn the loop with a short, safe prompt.",
    intro: "Set a prompt, run generation, inspect what happened, and adjust. Failure is safe here; it just points to what to tweak next.",
    objectiveId: "stable-sampling",
    failureHint: "If output drifts, lower randomness and try again.",
    lesson: [
      "Small prompts make it easier to see each token step.",
      "Lower randomness produces steadier output.",
      "Inspecting tokens helps you spot drift early.",
    ],
    params: { contextSize: 16, samplingTemp: 0.9, samplingRandom: 0.15 },
    prompt: "Hello world from the simulator.",
  },
  {
    id: "tutorial",
    name: "Interactive Tutorial",
    summary: "Follow a guided loop: run, inspect, adjust.",
    intro: "Complete each step to learn the core loop hands-on.",
    objectiveId: "stable-sampling",
    failureHint: "If the output drifts, lower randomness or temperature.",
    lesson: [
      "Generate, inspect, and adjust are the core loop.",
      "Small adjustments create visible output shifts.",
      "Repeatable runs help you isolate cause and effect.",
    ],
    params: { contextSize: 12, samplingTemp: 1, samplingRandom: 0.2, samplingSeed: 1337 },
    prompt: "Write a short greeting and then summarize it in three words.",
  },
  {
    id: "context-drop",
    name: "Context Drop",
    summary: "See how tokens fall out of view.",
    intro: "Use a longer prompt to exceed the context window and watch earlier tokens drop off.",
    objectiveId: "context-safe",
    failureHint: "Increase context size or shorten the prompt to pass.",
    lesson: [
      "Older tokens fall out when the context window is small.",
      "Bigger memory keeps earlier details in view.",
      "Dropped tokens can change later output.",
    ],
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
    lesson: [
      "Higher randomness makes outputs more varied.",
      "Lower randomness keeps the run on topic.",
      "Compare runs to see how sampling shifts focus.",
    ],
    params: { contextSize: 12, samplingTemp: 1.2, samplingRandom: 0.35, samplingSeed: 5151 },
    prompt: "Describe a playful robot with one surprising detail.",
  },
  {
    id: "hallucination-tradeoff",
    name: "Hallucination Tradeoff",
    summary: "See accuracy vs creativity tension under high randomness.",
    intro: "Start with high randomness and watch hallucination flags appear. Lower randomness to stabilize the output.",
    objectiveId: "stable-sampling",
    failureHint: "Drop randomness below 0.2 to reduce hallucination flags.",
    lesson: [
      "High randomness can trigger risky guesses.",
      "Lower randomness reduces hallucination flags.",
      "Stability trades off with creativity.",
    ],
    params: { contextSize: 14, samplingTemp: 1.6, samplingRandom: 0.6, samplingSeed: 9001 },
    prompt: "List three facts about a fictional planet. Keep them consistent.",
  },
  {
    id: "prompt-sensitivity",
    name: "Prompt Sensitivity",
    summary: "Small wording changes cause output shifts.",
    intro: "Toggle between two similar prompts and observe how output changes. Tighten the prompt to stabilize results.",
    objectiveId: "stable-sampling",
    failureHint: "Use more specific language to reduce drift.",
    lesson: [
      "Tiny wording changes can shift outputs.",
      "Specific prompts reduce drift.",
      "Compare prompt variants to see sensitivity.",
    ],
    params: { contextSize: 12, samplingTemp: 1.1, samplingRandom: 0.25, samplingSeed: 7007 },
    prompt: "Describe a tiny spaceship pilot in two sentences.",
    promptAlt: "Describe a tiny spaceship pilot in two short sentences.",
  },
];

export function findScenario(id) {
  return scenarios.find((scenario) => scenario.id === id) || scenarios[0];
}
