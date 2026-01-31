function getKeywordBoost(token, focusToken) {
  if (!token || !focusToken) {
    return 0;
  }
  if (token.type !== "word" || focusToken.type !== "word") {
    return 0;
  }
  return token.value.toLowerCase() === focusToken.value.toLowerCase() ? 0.5 : 0;
}

export function computeAttention(tokens, focusIndex) {
  if (!Array.isArray(tokens)) {
    throw new TypeError("computeAttention: tokens must be an array");
  }

  if (tokens.length === 0) {
    return [];
  }

  if (focusIndex < 0 || focusIndex >= tokens.length) {
    throw new RangeError("computeAttention: focusIndex out of range");
  }

  const focusToken = tokens[focusIndex];
  const raw = tokens.map((token, index) => {
    const distance = Math.abs(focusIndex - index);
    const recency = 1 / (1 + distance);
    const boost = getKeywordBoost(token, focusToken);
    return recency + boost;
  });

  const total = raw.reduce((sum, value) => sum + value, 0);
  return raw.map((value) => value / total);
}
