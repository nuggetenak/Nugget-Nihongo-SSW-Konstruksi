// ─── wrong-tracker.js (phaseA) ────────────────────────────────────────────────
// Storage: pure localStorage via storage engine (3-document v3 schema).
// A.7 TD-03: Removed all v1 direct-localStorage key constants (STORAGE_KEYS).
//     The old STORAGE_KEYS exported v1 paths like 'ssw-quiz-wrong' — these
//     no longer exist as standalone keys in v2/v3. All reads go through engine.
//     loadFromStorage/saveToStorage/removeFromStorage kept for any callers
//     that still use raw keys for non-migrated paths.
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
// These operate on raw keys — used only for paths not covered by the engine
// (e.g. legacy compatibility shims). Prefer engine.get/set for progress data.

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
