export const defaultPresets = [
  {
    id: "steady",
    name: "Steady",
    params: { contextSize: 16, samplingTemp: 0.8, samplingRandom: 0.1 },
  },
  {
    id: "creative",
    name: "Creative",
    params: { contextSize: 12, samplingTemp: 1.4, samplingRandom: 0.4 },
  },
  {
    id: "minimal",
    name: "Minimal",
    params: { contextSize: 8, samplingTemp: 0.7, samplingRandom: 0.05 },
  },
];

export function hydratePresets(saved) {
  if (!Array.isArray(saved) || saved.length === 0) {
    return [...defaultPresets];
  }
  return saved;
}
