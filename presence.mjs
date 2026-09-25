import { fresh } from "./core.mjs";

// A long gap is an accepted reset heuristic, not proof of system sleep.
// Ordinary inactivity does not pause or reset a timer while checks continue.
export const RESET_GAP_MS = 120000;
export function applyPresence(
  timer,
  state,
  settings,
  now = Date.now(),
  checkedAt,
) {
  if (state === "locked" && !timer.paused) {
    return {
      ...timer,
      paused: true,
      systemPaused: true,
      remaining: Math.max(0, (timer.deadline ?? now) - now),
      deadline: null,
    };
  }
  const longGap =
    Number.isFinite(checkedAt) &&
    checkedAt >= 0 &&
    now - checkedAt > RESET_GAP_MS;
  if (
    (state === "active" || state === "idle") &&
    (timer.systemPaused || (!timer.paused && longGap))
  ) {
    // Discard the interrupted interval/break, keeping completed breaks intact.
    // reconcile() handles a change of day after this transition.
    return {
      ...fresh(settings, now),
      completed: timer.completed,
      day: timer.day,
      systemPaused: false,
    };
  }
  return { ...timer };
}
