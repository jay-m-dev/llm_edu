export function createClock({ onTick, intervalMs = 300 } = {}) {
  if (typeof onTick !== "function") {
    throw new TypeError("createClock: onTick must be a function");
  }

  let timer = null;
  let currentInterval = intervalMs;

  function start() {
    if (timer) {
      return;
    }
    timer = setInterval(() => {
      onTick();
    }, currentInterval);
  }

  function stop() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  function step() {
    onTick();
  }

  function setSpeed(multiplier) {
    const clamped = Math.max(0.2, multiplier || 1);
    currentInterval = Math.max(50, Math.round(intervalMs / clamped));
    if (timer) {
      stop();
      start();
    }
  }

  return { start, stop, step, setSpeed };
}
