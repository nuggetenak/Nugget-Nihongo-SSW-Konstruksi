// ─── utils/auto-next.js ──────────────────────────────────────────────────────
// Item 80. The auto-advance delay was a per-session choice offered by two of
// the four modes that share QuizShell — and `wayground` and `vocab`, which
// render the identical screen from a set list with no options panel, had no way
// to reach it at all and sat pinned to the shell's 2000 ms default.
//
// Making it a preference solves that without inventing a picker for a screen
// that has nowhere to put one: it is set where a panel exists (Kuis, JAC) and
// obeyed by every mode that auto-advances.
// ─────────────────────────────────────────────────────────────────────────────
import { get as storageGet, set as storageSet } from '../storage/engine.js';
import { AUTO_NEXT_DEFAULT_MS } from './constants.js';

/** The stored delay in ms. 0 is a real value (Manual), so `??` and not `||`. */
export function storedAutoNextDelay() {
  return storageGet('prefs')?.autoNextDelay ?? AUTO_NEXT_DEFAULT_MS;
}

export function saveAutoNextDelay(ms) {
  const prefs = storageGet('prefs') ?? {};
  storageSet('prefs', { ...prefs, autoNextDelay: ms });
}
