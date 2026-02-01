export function detectHallucinations(tokens, distributions, threshold = 0.2) {
  if (!Array.isArray(tokens) || !Array.isArray(distributions)) {
    throw new TypeError("detectHallucinations: tokens and distributions must be arrays");
  }

  const flags = [];
  const steps = Math.min(tokens.length, distributions.length);
  for (let i = 0; i < steps; i += 1) {
    const token = tokens[i];
    const distribution = distributions[i] || [];
    const probability = distribution[i] ?? 0;
    if (token.type === "word" && probability < threshold) {
      flags.push({
        index: i,
        reason: "Low probability token suggests a risky guess.",
      });
    }
  }

  return flags;
}
