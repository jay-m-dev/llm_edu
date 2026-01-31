function hashWithSeed(seed, value) {
  let hash = seed;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function embedToken(value) {
  if (typeof value !== "string") {
    throw new TypeError("embedToken: value must be a string");
  }

  const seeds = [17, 31, 47, 61];
  const features = seeds.map((seed) => {
    const hashed = hashWithSeed(seed, value);
    return (hashed % 100) / 100;
  });

  return {
    labels: ["signal", "shape", "tone", "weight"],
    values: features,
  };
}
