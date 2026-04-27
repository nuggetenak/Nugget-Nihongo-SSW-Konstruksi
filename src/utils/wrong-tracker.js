// ─── Wrong-Answer Tracking Utilities ─────────────────────────────────────────
// Backward-compatible: handles both old format (plain number) and new format ({count, lastWrong})

/**
 * Get wrong-answer count from a stored value.
 * Handles both legacy (number) and current ({count, lastWrong}) formats.
 */
export function getWrongCount(val) {
  if (!val) return 0;
  return typeof val === "number" ? val : (val.count || 0);
}

/**
 * Get timestamp of last wrong answer.
 */
export function getWrongTime(val) {
  if (!val || typeof val === "number") return null;
  return val.lastWrong || null;
}

/**
 * Create a new wrong-answer entry, incrementing count.
 */
export function makeWrongEntry(existing, now = Date.now()) {
  return { count: getWrongCount(existing) + 1, lastWrong: now };
}

// ─── Storage Key Constants ───────────────────────────────────────────────────
export const STORAGE_KEYS = {
  QUIZ_WRONG:  "ssw-quiz-wrong",
  JAC_WRONG:   "ssw-wrong-counts",
  WG_WRONG:    (setId) => `ssw-wg-wrong-${setId}`,
  KNOWN:       "ssw-known",
  UNKNOWN:     "ssw-unknown",
  STARRED:     "ssw-starred",
};

// ─── Storage Helpers ─────────────────────────────────────────────────────────

/**
 * Load a JSON value from persistent storage.
 * Returns defaultVal if key doesn't exist or parse fails.
 */
export async function loadFromStorage(key, defaultVal = null) {
  try {
    const result = await window.storage.get(key);
    if (result) return JSON.parse(result.value);
  } catch {}
  return defaultVal;
}

/**
 * Save a JSON value to persistent storage.
 */
export async function saveToStorage(key, value) {
  try {
    await window.storage.set(key, JSON.stringify(value));
  } catch {}
}
