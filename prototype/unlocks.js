export const defaultUnlocks = {
  "context-size": false,
  "sampling-temp": false,
  "sampling-random": false,
};

export function applyUnlocks(currentState, results, rules) {
  if (!currentState || typeof currentState !== "object") {
    throw new TypeError("applyUnlocks: currentState must be an object");
  }
  if (!Array.isArray(results)) {
    throw new TypeError("applyUnlocks: results must be an array");
  }
  if (!rules || typeof rules !== "object") {
    throw new TypeError("applyUnlocks: rules must be an object");
  }

  const nextState = { ...currentState };
  const unlocked = [];

  results.forEach((result) => {
    const target = rules[result.id];
    if (!target) {
      return;
    }
    if (result.passed && !nextState[target]) {
      nextState[target] = true;
      unlocked.push(target);
    }
  });

  return { state: nextState, unlocked };
}
