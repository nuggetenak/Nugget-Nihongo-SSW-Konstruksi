// ─── fsrs-store.js ────────────────────────────────────────────────────────────
// Layer 2: FSRS card storage — pure localStorage (GitHub Pages standalone).
// No window.storage, no Claude dependency.
//
// Pattern: load-once-on-init → in-memory cache → write-through on review.
// Reviews are instant (synchronous cache hit); persistence is synchronous too.
//
// Key format: `ssw-srs-{cardId}` where cardId is the numeric SSW card ID.
// ─────────────────────────────────────────────────────────────────────────────

const SRS_PREFIX = 'ssw-srs-';

// ── Key helpers ────────────────────────────────────────────────────────────
export const cardKey = (cardId) => `${SRS_PREFIX}${cardId}`;
export const parseCardId = (key) =>
  key.startsWith(SRS_PREFIX) ? key.slice(SRS_PREFIX.length) : null;

// ── In-memory cache ────────────────────────────────────────────────────────
// { [cardId: string]: { card: SerializedCard, history: ReviewLog[], reviewed_at: ISO|null } }
let _cache = {};
let _initialized = false;

// ── Init ───────────────────────────────────────────────────────────────────
// Load all ssw-srs-* keys from localStorage into cache. Synchronous.
// Safe to call multiple times — no-ops after first call.
export function initStore() {
  if (_initialized) return _cache;

  try {
    const keys = Object.keys(localStorage).filter((k) => k.startsWith(SRS_PREFIX));
    _cache = {};
    for (const key of keys) {
      try {
        const raw = localStorage.getItem(key);
        const id = parseCardId(key);
        if (raw && id) _cache[id] = JSON.parse(raw);
      } catch {}
    }
  } catch {
    _cache = {};
  }

  _initialized = true;
  return _cache;
}

// ── Read ───────────────────────────────────────────────────────────────────
export const getCard = (cardId) => _cache[String(cardId)] ?? null;
export const hasCard = (cardId) => String(cardId) in _cache;
export const getAllCards = () => ({ ..._cache });
export const getCardCount = () => Object.keys(_cache).length;

// ── Write-through ──────────────────────────────────────────────────────────
// Updates cache synchronously, persists to localStorage synchronously.
export function saveCard(cardId, entry) {
  const id = String(cardId);
  _cache[id] = entry;
  try {
    localStorage.setItem(cardKey(id), JSON.stringify(entry));
  } catch {}
}

// ── Export snapshot (for ExportMode) ──────────────────────────────────────
export function exportSRSSnapshot() {
  return {
    _srs_version: 1,
    exported_at: new Date().toISOString(),
    cards: { ..._cache },
  };
}

// ── Import snapshot (for ExportMode) ──────────────────────────────────────
export function importSRSSnapshot(snapshot) {
  if (!snapshot?.cards || typeof snapshot.cards !== 'object') {
    throw new Error('Invalid SRS snapshot — missing cards field');
  }
  _cache = {};
  for (const [id, entry] of Object.entries(snapshot.cards)) {
    saveCard(id, entry);
  }
  return Object.keys(snapshot.cards).length;
}

// ── Reset ─────────────────────────────────────────────────────────────────
export function resetStore() {
  const keys = Object.keys(localStorage).filter((k) => k.startsWith(SRS_PREFIX));
  keys.forEach((k) => localStorage.removeItem(k));
  _cache = {};
}
