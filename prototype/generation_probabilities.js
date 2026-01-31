import { buildDistribution } from "./sampling.js";

export function buildStepDistribution(tokens, stepIndex, options = {}) {
  if (!Array.isArray(tokens)) {
    throw new TypeError("buildStepDistribution: tokens must be an array");
  }
  if (!Number.isInteger(stepIndex) || stepIndex < 0) {
    throw new TypeError("buildStepDistribution: stepIndex must be a non-negative integer");
  }

  const seedBase = Number.isInteger(options.seed) ? options.seed : 0;
  const temperature = Number(options.temperature) || 1;
  const randomness = Number(options.randomness) || 0;

  return buildDistribution(tokens, {
    seed: seedBase + stepIndex,
    temperature,
    randomness,
  });
}
