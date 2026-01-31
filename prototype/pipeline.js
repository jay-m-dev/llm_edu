const stages = [
  {
    id: "normalize",
    name: "Normalize",
    transform(tokens) {
      return tokens.map((token) => {
        if (token.type !== "word") {
          return { ...token };
        }
        return { ...token, value: token.value.toLowerCase() };
      });
    },
  },
  {
    id: "tag",
    name: "Tag Length",
    transform(tokens) {
      return tokens.map((token) => {
        if (token.type !== "word") {
          return { ...token };
        }
        const suffix = String(token.value.length);
        return { ...token, value: `${token.value}_${suffix}` };
      });
    },
  },
  {
    id: "compress",
    name: "Compress",
    transform(tokens) {
      return tokens.map((token) => {
        if (token.type !== "word") {
          return { ...token };
        }
        const value = token.value.length > 5 ? `${token.value.slice(0, 5)}~` : token.value;
        return { ...token, value };
      });
    },
  },
];

export function getPipelineStages() {
  return stages.map((stage) => ({ id: stage.id, name: stage.name }));
}

export function applyPipeline(tokens, options = {}) {
  if (!Array.isArray(tokens)) {
    throw new TypeError("applyPipeline: tokens must be an array");
  }

  const enabledIds = options.enabledStageIds || stages.map((stage) => stage.id);
  const outputs = [];
  let current = tokens.map((token) => ({ ...token }));

  stages.forEach((stage) => {
    if (!enabledIds.includes(stage.id)) {
      outputs.push({ id: stage.id, name: stage.name, tokens: current });
      return;
    }
    current = stage.transform(current);
    outputs.push({ id: stage.id, name: stage.name, tokens: current });
  });

  return {
    outputs,
    finalTokens: current,
  };
}
