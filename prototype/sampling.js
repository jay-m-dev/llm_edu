function createSeededRng(seed) {
  let state = seed >>> 0;
  return function next() {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function baseScoreForToken(token) {
  if (token.type === "word") {
    return Math.max(token.value.length, 1);
  }
  return 0.5;
}

export function buildDistribution(tokens, options = {}) {
  if (!Array.isArray(tokens)) {
    throw new TypeError("buildDistribution: tokens must be an array");
  }

  const seed = Number.isInteger(options.seed) ? options.seed : 0;
  const temperature = Math.max(Number(options.temperature) || 1, 0.1);
  const randomness = Math.max(Number(options.randomness) || 0, 0);
  const rng = createSeededRng(seed);

  if (tokens.length === 0) {
    return [];
  }

  const exponent = 1 / temperature;
  const weights = tokens.map((token) => {
    const noise = randomness > 0 ? rng() * randomness : 0;
    const score = baseScoreForToken(token) + noise;
    return Math.pow(score, exponent);
  });

  const total = weights.reduce((sum, value) => sum + value, 0);
  return weights.map((value) => value / total);
}

export function sampleFromDistribution(tokens, options = {}) {
  if (!Array.isArray(tokens)) {
    throw new TypeError("sampleFromDistribution: tokens must be an array");
  }

  const seed = Number.isInteger(options.seed) ? options.seed : 0;
  const temperature = Math.max(Number(options.temperature) || 1, 0.1);
  const randomness = Math.max(Number(options.randomness) || 0, 0);
  const rng = createSeededRng(seed);

  if (tokens.length === 0) {
    return { distribution: [], selectedIndex: null };
  }

  const exponent = 1 / temperature;
  const weights = tokens.map((token) => {
    const noise = randomness > 0 ? rng() * randomness : 0;
    const score = baseScoreForToken(token) + noise;
    return Math.pow(score, exponent);
  });

  const total = weights.reduce((sum, value) => sum + value, 0);
  const distribution = weights.map((value) => value / total);

  const draw = rng();
  let cumulative = 0;
  let selectedIndex = distribution.length - 1;
  for (let i = 0; i < distribution.length; i += 1) {
    cumulative += distribution[i];
    if (draw <= cumulative) {
      selectedIndex = i;
      break;
    }
  }

  return { distribution, selectedIndex };
}
