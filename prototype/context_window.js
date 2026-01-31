export function applyContextWindow(tokens, maxSize) {
  if (!Array.isArray(tokens)) {
    throw new TypeError("applyContextWindow: tokens must be an array");
  }
  if (!Number.isInteger(maxSize) || maxSize < 0) {
    throw new TypeError("applyContextWindow: maxSize must be a non-negative integer");
  }

  if (maxSize === 0) {
    return { activeTokens: [], droppedTokens: tokens.map((token, index) => ({ token, index })) };
  }

  if (tokens.length <= maxSize) {
    return { activeTokens: tokens.map((token, index) => ({ token, index })), droppedTokens: [] };
  }

  const startIndex = tokens.length - maxSize;
  const activeTokens = tokens.slice(startIndex).map((token, offset) => ({
    token,
    index: startIndex + offset,
  }));
  const droppedTokens = tokens.slice(0, startIndex).map((token, index) => ({
    token,
    index,
  }));

  return { activeTokens, droppedTokens };
}
