export function tokenize(input) {
  if (typeof input !== "string") {
    throw new TypeError("tokenize: input must be a string");
  }

  const tokens = [];
  const isWordChar = (ch) => /[A-Za-z0-9_]/.test(ch);
  const isWhitespace = (ch) => /\s/.test(ch);

  let i = 0;
  while (i < input.length) {
    const ch = input[i];

    if (isWhitespace(ch)) {
      i += 1;
      continue;
    }

    if (isWordChar(ch)) {
      const start = i;
      let j = i + 1;
      while (j < input.length && isWordChar(input[j])) {
        j += 1;
      }
      tokens.push({
        type: "word",
        value: input.slice(start, j),
        start,
        end: j,
      });
      i = j;
      continue;
    }

    tokens.push({
      type: "punct",
      value: ch,
      start: i,
      end: i + 1,
    });
    i += 1;
  }

  return tokens;
}
