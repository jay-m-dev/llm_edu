export const eventTypes = [
  "run_start",
  "run_step",
  "run_pause",
  "run_complete",
  "replay_start",
  "replay_step",
  "objective_eval",
  "failure_detected",
  "settings_change",
  "preset_applied",
];

export function logEvent(logs, type, payload = {}) {
  if (!eventTypes.includes(type)) {
    return logs;
  }
  const entry = {
    id: Date.now().toString(36),
    type,
    time: new Date().toISOString(),
    payload,
  };
  return [entry, ...logs].slice(0, 200);
}
