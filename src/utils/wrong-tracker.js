// ─── wrong-tracker.js ─────────────────────────────────────────────────────────
// Storage: pure localStorage (GitHub Pages standalone deployment).
// No window.storage, no Claude dependency.
// ─────────────────────────────────────────────────────────────────────────────

// ── Wrong-answer value helpers ─────────────────────────────────────────────
// Backward-compatible: handles old format (plain number) and current ({count, lastWrong})

export function getWrongCount(val) {
  if (!val) return 0;
  return typeof val === 'number' ? val : val.count || 0;
}

export function getWrongTime(val) {
  if (!val || typeof val === 'number') return null;
  return val.lastWrong || null;
}

export function makeWrongEntry(existing, now = Date.now()) {
  return { count: getWrongCount(existing) + 1, lastWrong: now };
}

// ── Storage key constants ──────────────────────────────────────────────────
export const STORAGE_KEYS = {
  QUIZ_WRONG: 'ssw-quiz-wrong',
  JAC_WRONG: 'ssw-wrong-counts',
  WG_WRONG: (setId) => `ssw-wg-wrong-${setId}`,
  KNOWN: 'ssw-known',
  UNKNOWN: 'ssw-unknown',
  STARRED: 'ssw-starred',
};

// ── Storage helpers (synchronous localStorage) ─────────────────────────────
// Async signatures kept for API compatibility with usePersistedState.
// In practice these resolve immediately — no loading flash.

export function loadFromStorage(key, defaultVal = null) {
  try {
    const raw = localStorage.getItem(key);
    if (raw !== null) return JSON.parse(raw);
  } catch {}
  return defaultVal;
}

export function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export function removeFromStorage(key) {
  try {
    localStorage.removeItem(key);
  } catch {}
}
