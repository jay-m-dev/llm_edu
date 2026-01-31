export function scoreRun(snapshot) {
  if (!snapshot) {
    throw new TypeError("scoreRun: snapshot is required");
  }

  const stability = Math.max(0, 1 - snapshot.samplingRandom);
  const focus = snapshot.attentionWeights.length
    ? Math.max(...snapshot.attentionWeights)
    : 0;
  const efficiency = snapshot.contextDropped.length === 0 ? 1 : 0.4;
  const coherence = snapshot.tokens.length === 0 ? 0 : Math.min(snapshot.tokens.length / 10, 1);

  return [
    { id: "stability", label: "Stability", value: Number(stability.toFixed(2)) },
    { id: "focus", label: "Focus", value: Number(focus.toFixed(2)) },
    { id: "efficiency", label: "Efficiency", value: Number(efficiency.toFixed(2)) },
    { id: "coherence", label: "Coherence", value: Number(coherence.toFixed(2)) },
  ];
}
