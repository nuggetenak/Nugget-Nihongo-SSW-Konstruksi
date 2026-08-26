// ─── quiz-persistence.js ─────────────────────────────────────────────────
// Item 51 (2026-08-26): "A crash or reload mid-quiz loses every answer."
//
// Deliberately generic -- write/read/clear an arbitrary serializable snapshot
// under a key, nothing more. Different quiz-shaped modes have genuinely
// different state shapes (QuizShell's results[] + qIdx + selected;
// SimulasiMode's answers{} dict; the free-text modes' queue+idx+phase), and
// forcing one canonical shape onto all of them would be a bigger, riskier
// change than this item asked for. The caller decides what to snapshot and
// how to apply a restored one -- this hook only owns the storage mechanics.
//
// sessionStorage, not localStorage: this is meant to survive a reload or a
// backgrounded-tab reclaim within the same browsing session, not to persist
// across days. An abandoned quiz from three days ago shouldn't resurrect
// itself as a resume prompt -- see MAX_AGE_MS below.

const MAX_AGE_MS = 30 * 60 * 1000; // 30 minutes -- long enough for a real
// interruption (phone call, reload), short enough that a stale prompt
// days later would just be confusing, not helpful.

export function saveQuizSnapshot(key, snapshot) {
  try {
    sessionStorage.setItem(key, JSON.stringify({ snapshot, savedAt: Date.now() }));
  } catch {
    // sessionStorage can throw (private browsing, quota) -- persistence is
    // a nice-to-have here, not a hard requirement, so fail silently rather
    // than break the quiz over a storage write.
  }
}

/**
 * Returns the saved snapshot if one exists and isn't stale, else null.
 * Does NOT clear it -- call clearQuizSnapshot() explicitly once the caller
 * has decided what to do with it (resumed, or the user declined).
 */
export function readQuizSnapshot(key) {
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const { snapshot, savedAt } = JSON.parse(raw);
    if (Date.now() - savedAt > MAX_AGE_MS) {
      sessionStorage.removeItem(key);
      return null;
    }
    return snapshot;
  } catch {
    return null;
  }
}

export function clearQuizSnapshot(key) {
  try {
    sessionStorage.removeItem(key);
  } catch {
    // as above -- not fatal if this fails
  }
}
