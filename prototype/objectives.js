export function getObjectives() {
  return [
    {
      id: "context-safe",
      description: "Keep all tokens within the context window (no drops).",
      evaluate(snapshot) {
        return snapshot.contextDropped.length === 0;
      },
    },
    {
      id: "stable-sampling",
      description: "Use low randomness (<= 0.2) for stable output.",
      evaluate(snapshot) {
        return snapshot.samplingRandom <= 0.2;
      },
    },
    {
      id: "focused-attention",
      description: "Maintain a strong attention peak (>= 0.5).",
      evaluate(snapshot) {
        if (!snapshot.attentionWeights.length) {
          return false;
        }
        const maxWeight = Math.max(...snapshot.attentionWeights);
        return maxWeight >= 0.5;
      },
    },
  ];
}

export function evaluateObjectives(snapshot) {
  if (!snapshot) {
    throw new TypeError("evaluateObjectives: snapshot is required");
  }
  return getObjectives().map((objective) => ({
    id: objective.id,
    description: objective.description,
    passed: objective.evaluate(snapshot),
  }));
}
