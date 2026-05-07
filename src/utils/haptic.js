// ─── haptic.js ────────────────────────────────────────────────────────────────
// Vibration patterns for tactile feedback via Vibration API.
// All calls are no-ops on devices/browsers that don't support navigator.vibrate.
export const haptic = {
  tap:     () => navigator.vibrate?.(8),
  correct: () => navigator.vibrate?.(12),
  wrong:   () => navigator.vibrate?.([10, 50, 10]),
  success: () => navigator.vibrate?.([15, 30, 15, 30, 15]),
  flip:    () => navigator.vibrate?.(6),
};
