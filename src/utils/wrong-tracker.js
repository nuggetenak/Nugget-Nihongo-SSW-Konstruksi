// ─── wrong-tracker.js ─────────────────────────────────────────────────────────
// Storage: pure localStorage via storage engine (3-document v3 schema).
// All wrong-tracking and scores now flow through the engine (progress doc).
// Legacy ssw-quiz-wrong / ssw-wg-wrong-* / ssw-vocab-wrong-* keys are
// migration read-only (one-time migrate then deleted).
//
// loadFromStorage/saveToStorage/removeFromStorage: low-level helpers used in
// migrations and tests. Production code uses engine.get/set instead.
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

// ── Storage helpers (synchronous localStorage) ─────────────────────────────
// Low-level raw key access. Used in migrations.js and test utilities.
// Production modes use engine.get / engine.set for all progress/prefs/srs data.

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
