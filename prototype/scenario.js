export const scenarios = [
  {
    id: "intro",
    name: "Intro Run",
    summary: "Learn the loop with a short, safe prompt.",
    prompt: "Hello world from the simulator.",
  },
  {
    id: "context-drop",
    name: "Context Drop",
    summary: "See how tokens fall out of view.",
    prompt: "Repeat this sentence to overflow the window.",
  },
  {
    id: "sampling-shift",
    name: "Sampling Shift",
    summary: "Watch outputs drift as randomness rises.",
    prompt: "Describe a playful robot with one surprising detail.",
  },
];

export function findScenario(id) {
  return scenarios.find((scenario) => scenario.id === id) || scenarios[0];
}
