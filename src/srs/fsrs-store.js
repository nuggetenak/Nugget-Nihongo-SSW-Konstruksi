// ─── fsrs-store.js ────────────────────────────────────────────────────────────
// Layer 2: Async storage adapter for FSRS card data.
//
// Storage priority:
//   1. window.storage (Claude artifacts / Claude.ai) — primary
//   2. localStorage   (GitHub Pages / standard browser) — fallback
//   3. In-memory only — last resort (data lost on refresh)
//
// Pattern: load-once-on-init → in-memory cache → write-through on review.
// This ensures reviews are always instant (no await in the hot path UI).
//
// Key format: `ssw-srs-{cardId}` where cardId is the numeric SSW card ID.
// Portable: can be adapted for main project by changing PREFIX and storage keys.
// ─────────────────────────────────────────────────────────────────────────────

const SRS_PREFIX    = 'ssw-srs-';
const META_KEY      = 'ssw-srs-meta';   // stores aggregate metadata
const HISTORY_LIMIT = 20;               // max review history entries per card

// ── Storage backend detection ──────────────────────────────────────────────
function hasWindowStorage() {
  return typeof window !== 'undefined' && typeof window.storage?.get === 'function';
}

function hasLocalStorage() {
  try { localStorage.setItem('__srs_test', '1'); localStorage.removeItem('__srs_test'); return true; }
  catch { return false; }
}

// Detect once on module load
const USE_WINDOW_STORAGE = hasWindowStorage();
const USE_LOCAL_STORAGE  = !USE_WINDOW_STORAGE && hasLocalStorage();

// ── Unified async storage ops ──────────────────────────────────────────────
async function storageGet(key) {
  if (USE_WINDOW_STORAGE) {
    const result = await window.storage.get(key);
    return result?.value ?? null;
  }
  if (USE_LOCAL_STORAGE) return localStorage.getItem(key);
  return null;
}

async function storageSet(key, value) {
  if (USE_WINDOW_STORAGE) {
    await window.storage.set(key, value);
  } else if (USE_LOCAL_STORAGE) {
    localStorage.setItem(key, value);
  }
  // else: memory-only, no persistence
}

async function storageDelete(key) {
  if (USE_WINDOW_STORAGE) {
    try { await window.storage.delete(key); } catch {}
  } else if (USE_LOCAL_STORAGE) {
    localStorage.removeItem(key);
  }
}

async function storageListKeys(prefix) {
  if (USE_WINDOW_STORAGE) {
    try {
      const result = await window.storage.list(prefix);
      return result?.keys ?? [];
    } catch { return []; }
  }
  if (USE_LOCAL_STORAGE) {
    return Object.keys(localStorage).filter(k => k.startsWith(prefix));
  }
  return Object.keys(_cache).map(id => cardKey(id));
}

// ── Key helpers ────────────────────────────────────────────────────────────
export const cardKey     = (cardId) => `${SRS_PREFIX}${cardId}`;
export const parseCardId = (key)    => key.startsWith(SRS_PREFIX) ? key.slice(SRS_PREFIX.length) : null;

// ── In-memory cache ────────────────────────────────────────────────────────
// { [cardId: string]: { card: SerializedCard, history: ReviewLog[], reviewed_at: ISO|null } }
let _cache       = {};
let _initialized = false;
let _initPromise = null;

// ── Init ───────────────────────────────────────────────────────────────────
// Load all SRS records from storage into cache. Safe to call multiple times.
export async function initStore() {
  if (_initialized) return _cache;
  if (_initPromise) return _initPromise;

  _initPromise = (async () => {
    try {
      const keys = await storageListKeys(SRS_PREFIX);
      const entries = await Promise.all(
        keys.map(async (key) => {
          try {
            const raw = await storageGet(key);
            if (!raw) return null;
            const id = parseCardId(key);
            if (!id) return null;
            return [id, JSON.parse(raw)];
          } catch { return null; }
        })
      );
      _cache = Object.fromEntries(entries.filter(Boolean));
    } catch {
      _cache = {};
    }
    _initialized = true;
    return _cache;
  })();

  return _initPromise;
}

// ── Read ───────────────────────────────────────────────────────────────────
export const getCard   = (cardId) => _cache[String(cardId)] ?? null;
export const hasCard   = (cardId) => String(cardId) in _cache;
export const getAllCards = ()     => ({ ..._cache });
export const getCardCount = ()    => Object.keys(_cache).length;

// ── Write-through ──────────────────────────────────────────────────────────
// Sync update to cache, async persist to storage. Fire-and-forget safe.
export async function saveCard(cardId, entry) {
  const id = String(cardId);
  _cache[id] = entry;
  try {
    await storageSet(cardKey(id), JSON.stringify(entry));
  } catch {}
}

// ── Export snapshot (for ExportMode) ──────────────────────────────────────
export function exportSRSSnapshot() {
  return {
    _srs_version: 1,
    exported_at:  new Date().toISOString(),
    backend:      USE_WINDOW_STORAGE ? 'window.storage' : USE_LOCAL_STORAGE ? 'localStorage' : 'memory',
    cards:        { ..._cache },
  };
}

// ── Import snapshot (for ExportMode) ──────────────────────────────────────
export async function importSRSSnapshot(snapshot) {
  if (!snapshot?.cards || typeof snapshot.cards !== 'object') {
    throw new Error('Invalid SRS snapshot — missing cards field');
  }
  const entries = Object.entries(snapshot.cards);
  _cache = {};
  await Promise.all(entries.map(([id, entry]) => saveCard(id, entry)));
  return entries.length;
}

// ── Reset (debug / test) ───────────────────────────────────────────────────
export async function resetStore() {
  const keys = Object.keys(_cache).map(cardKey);
  await Promise.all(keys.map(k => storageDelete(k)));
  _cache = {};
}

// ── Storage backend info (for ExportMode display) ─────────────────────────
export function getStorageBackend() {
  if (USE_WINDOW_STORAGE) return 'window.storage (Claude)';
  if (USE_LOCAL_STORAGE)  return 'localStorage (Browser)';
  return 'Memory (tidak persisten)';
}
