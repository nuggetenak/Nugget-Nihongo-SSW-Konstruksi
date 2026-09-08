// ─── storage/engine.js ───────────────────────────────────────────────────────
// 3-document localStorage engine with lz-string compression.
// readDoc decompresses transparently; falls back to plain JSON (backward compat).
// ─────────────────────────────────────────────────────────────────────────────

import { STORAGE_VERSION, DOCS, DEFAULTS, UNMANAGED_KEYS } from './schema.js';
import {
  hasV1Data,
  migrate_v1_to_v2,
  cleanup_v1_keys,
  migrate_v2_to_v3,
  migrate_v3_to_v4,
  migrate_v4_to_v5,
  migrate_v5_to_v6,
  migrate_v6_to_v7,
} from './migrations.js';
import LZString from 'lz-string';
import { isQuotaError, notifyQuotaExceeded } from '../utils/storage-quota.js';

// ── In-memory cache ────────────────────────────────────────────────────────
let _cache = { progress: null, srs: null, prefs: null };
let _initialized = false;
// item 19: which doc(s), if any, failed to parse at init and got reset to
// defaults. Read via getCorruptionWarning() once React has mounted -- init()
// itself runs before that (main.jsx calls it pre-render), so there's no
// listener to call synchronously the way notifyQuotaExceeded has one.
let _corruption = [];

// ── Low-level ─────────────────────────────────────────────────────────────
// Returns { ok: true, data } | { ok: false, corrupt: boolean }. corrupt is
// true only when the key existed and had content that failed to parse --
// distinct from a genuinely missing key, which is the normal fresh-install
// case and not an error at all. Callers that only care about "do I have
// data" can still treat both as absent; init() cares about the difference so
// it doesn't destroy a corrupt document the same silent way it skips past a
// merely-missing one.
function readDoc(docKey) {
  let raw;
  try {
    raw = localStorage.getItem(docKey);
  } catch {
    return { ok: false, corrupt: false };
  }
  if (!raw) return { ok: false, corrupt: false };
  try {
    const decompressed = LZString.decompressFromUTF16(raw);
    if (decompressed) return classify(JSON.parse(decompressed), raw);
  } catch {
    // fall through to plain-JSON attempt below (pre-compression data)
  }
  try {
    return classify(JSON.parse(raw), raw);
  } catch {
    return { ok: false, corrupt: true, raw };
  }
}

// Parsing is not the same question as being usable, and readDoc only ever asked
// the first one (item 132). A document that parsed to `null`, `[]`, `42` or `{}`
// came back `ok: true`, then `progressRaw?._v ?? 0` resolved it to version 0,
// which is the fresh-install branch -- so init() overwrote it with defaults. No
// quarantine copy, no warning, nothing in getCorruptionWarning(): exactly the
// silent destruction the quarantine path 40 lines below exists to prevent, and
// reachable by any partial write, a truncated sync, or a hand-edited key.
//
// validateSnapshot() further down this same file already does this kind of
// shape checking for imported files. It just was never applied to the app's own
// documents on the way in.
function classify(data, raw) {
  const usable =
    !!data && typeof data === 'object' && !Array.isArray(data) && typeof data._v === 'number';
  return usable ? { ok: true, data } : { ok: false, corrupt: true, raw };
}

// Preserves the unreadable bytes under a side key instead of letting init()
// overwrite them with fresh defaults and lose them for good -- there's
// nothing the app can automatically recover, but there's a real difference
// between "gone" and "sitting in localStorage under a different key in case
// a support conversation ever wants to look at it".
function quarantineCorruptDoc(docKey, raw) {
  const backupKey = `${docKey}_corrupt_${Date.now()}`;
  try {
    localStorage.setItem(backupKey, raw);
  } catch {
    // Quota's the only realistic failure here (raw's already proven to be
    // valid string data, just not valid JSON) -- if even this fails, the
    // corruption warning below still fires without a preserved backup key,
    // which is strictly better than the silent-overwrite status quo.
  }
  _corruption.push({ doc: docKey, backupKey });
}

/** item 19: non-empty when init() had to reset a doc that existed but
 *  wouldn't parse, rather than a doc that was simply never written. Read
 *  this once, after mount -- it reflects what happened at this app-load's
 *  init() call, not an ongoing stream of events like the quota handler. */
export function getCorruptionWarning() {
  return _corruption;
}

function writeDoc(docKey, data) {
  try {
    // Compress before writing.
    const compressed = LZString.compressToUTF16(JSON.stringify(data));
    localStorage.setItem(docKey, compressed);
    return { ok: true };
  } catch (err) {
    if (isQuotaError(err)) {
      notifyQuotaExceeded(docKey);
      return { ok: false, reason: 'quota' };
    }
    // eslint-disable-next-line no-console
    console.error('[storage] writeDoc failed:', docKey, err);
    return { ok: false, reason: 'unknown' };
  }
}

function freshDefaults() {
  return {
    progress: { ...JSON.parse(JSON.stringify(DEFAULTS.progress)), _v: STORAGE_VERSION },
    srs: { _v: STORAGE_VERSION, cards: {} },
    prefs: { ...JSON.parse(JSON.stringify(DEFAULTS.prefs)), _v: STORAGE_VERSION },
  };
}

// ── Migration chain ───────────────────────────────────────────────────────
// Keyed by the version being migrated *from*. Adding a storage version is one
// entry here plus the function itself — see the loop in init() for why that
// matters.
const MIGRATIONS = {
  1: migrate_v1_to_v2,
  2: migrate_v2_to_v3,
  3: migrate_v3_to_v4,
  4: migrate_v4_to_v5,
  5: migrate_v5_to_v6,
  6: migrate_v6_to_v7,
};

// ── Init ──────────────────────────────────────────────────────────────────
// Called once on app start. Detects old data → migrates → caches.
export function init() {
  if (_initialized) return;

  const progressResult = readDoc(DOCS.progress);
  if (progressResult.corrupt) quarantineCorruptDoc(DOCS.progress, progressResult.raw);
  const progressRaw = progressResult.ok ? progressResult.data : null;
  const version = progressRaw?._v ?? 0;

  // ── A document at or ahead of the current version ────────────────────────
  // `>=`, not `===`, and that is a data-loss fix rather than tidying (found
  // 2026-09-07 by storage.migration-chain.test.js). A document stamped NEWER
  // than this build is what a user gets by opening an older install after a
  // newer one — an ordinary thing to do with a PWA, where an offline client can
  // sit on a cached older build for weeks. Every version of this code before
  // today fell through all of its branches to the fresh-install `else` and
  // wrote defaults straight over it: the whole study history, gone, silently,
  // for the crime of opening the app on a stale device.
  //
  // Loading it as-is is safe in the direction that matters. `set()` spreads the
  // cached document, so fields this build has never heard of ride through a
  // write untouched and are still there when the newer build comes back. The
  // residual risk is a future migration that *reinterprets* an existing field
  // rather than adding one — v3→v4's id renumbering is the precedent — where
  // this build would read the newer values as if they were its own. That costs
  // one session of wrong cards. Overwriting costs everything, permanently, and
  // is not recoverable by any action the user can take.
  if (version >= STORAGE_VERSION) {
    // Already current (or newer) — load directly
    _cache.progress = progressRaw;
    const srsResult = readDoc(DOCS.srs);
    if (srsResult.corrupt) quarantineCorruptDoc(DOCS.srs, srsResult.raw);
    _cache.srs = srsResult.ok ? srsResult.data : { _v: STORAGE_VERSION, cards: {} };
    const prefsResult = readDoc(DOCS.prefs);
    if (prefsResult.corrupt) quarantineCorruptDoc(DOCS.prefs, prefsResult.raw);
    _cache.prefs = prefsResult.ok
      ? prefsResult.data
      : { ...JSON.parse(JSON.stringify(DEFAULTS.prefs)), _v: STORAGE_VERSION };
  } else {
    // Find where this install actually is. v1 predates the _v stamp entirely,
    // so it is detected by the shape of its keys rather than by a number.
    const from = version >= 2 ? version : hasV1Data() ? 1 : null;

    if (from === null) {
      // Fresh install — write current defaults
      const d = freshDefaults();
      _cache.progress = d.progress;
      _cache.srs = d.srs;
      _cache.prefs = d.prefs;
      writeDoc(DOCS.progress, _cache.progress);
      writeDoc(DOCS.srs, _cache.srs);
      writeDoc(DOCS.prefs, _cache.prefs);
    } else {
      // Run the chain from wherever this install is up to current, writing each
      // step so the next one can read what the previous produced.
      //
      // This was five copy-pasted ladders — one per starting version — each
      // ending in the same three writes. Adding v6→v7 (item 58) meant editing
      // all five in step, which is how a chain grows a hole in the middle. The
      // registry is the chain now: a new version is one entry, and every
      // starting point picks it up for free.
      let migrated = null;
      for (let v = from; v < STORAGE_VERSION; v++) {
        const step = MIGRATIONS[v];
        if (!step) break; // no path from here; leave the data untouched
        migrated = step();
        writeDoc(DOCS.progress, migrated.progress);
        writeDoc(DOCS.srs, migrated.srs);
        writeDoc(DOCS.prefs, migrated.prefs);
      }
      if (migrated) {
        _cache.progress = migrated.progress;
        _cache.srs = migrated.srs;
        _cache.prefs = migrated.prefs;
      }
      if (from === 1) cleanup_v1_keys();
    }
  }

  _initialized = true;
}

// ── Document-level API ────────────────────────────────────────────────────
// get(doc) → returns full document object (reference to cache)
export function get(doc) {
  if (!_initialized) init();
  return _cache[doc] ?? DEFAULTS[doc];
}

// set(doc, updater | partial) → merges + writes
export function set(doc, updater) {
  if (!_initialized) init();
  const current = _cache[doc] ?? JSON.parse(JSON.stringify(DEFAULTS[doc]));
  const merged = typeof updater === 'function' ? updater(current) : { ...current, ...updater };
  // Stamped on every write so the app can answer "is what is on this device
  // newer than this backup file?" (item 138). It could not before: the import
  // screen compared the incoming file against `exportAll().exported_at`, which
  // exportAll *generates* at call time. That is the current clock, not a
  // last-modified time, so it was always later than any file and the
  // dual-device conflict warning was true on every single import, including
  // the ordinary restore-my-own-backup case it was written to leave alone.
  const next = { ...merged, updatedAt: Date.now() };
  _cache[doc] = next;
  writeDoc(DOCS[doc], next);
  return next;
}

/**
 * When this device's data last changed, or null if it never has (a fresh
 * install, or a user whose documents predate the stamp). Null is a truthful
 * "no idea", and the import screen treats it as no conflict rather than as a
 * conflict — an unknown is not evidence of one, and crying wolf is what item
 * 138 was.
 */
export function getLastMutatedAt() {
  if (!_initialized) init();
  const stamps = ['progress', 'srs', 'prefs']
    .map((d) => _cache[d]?.updatedAt)
    .filter((t) => typeof t === 'number');
  return stamps.length ? Math.max(...stamps) : null;
}

// ── SRS-specific hot path (avoids full doc serialize on each review) ───────
export function getSRSCard(cardId) {
  if (!_initialized) init();
  return _cache.srs?.cards?.[String(cardId)] ?? null;
}

export function setSRSCard(cardId, entry) {
  if (!_initialized) init();
  const id = String(cardId);
  if (!_cache.srs) _cache.srs = { _v: STORAGE_VERSION, cards: {} };
  _cache.srs.cards[id] = entry;
  writeDoc(DOCS.srs, _cache.srs);
}

export function getAllSRSCards() {
  if (!_initialized) init();
  return _cache.srs?.cards ?? {};
}

export function getSRSCardCount() {
  if (!_initialized) init();
  return Object.keys(_cache.srs?.cards ?? {}).length;
}

// ── Bulk ops ──────────────────────────────────────────────────────────────
export function resetAll() {
  const d = freshDefaults();
  _cache.progress = d.progress;
  _cache.srs = d.srs;
  _cache.prefs = d.prefs;
  writeDoc(DOCS.progress, _cache.progress);
  writeDoc(DOCS.srs, _cache.srs);
  writeDoc(DOCS.prefs, _cache.prefs);
  // The three documents were all this cleared, so a GitHub Personal Access
  // Token and the id of the user's backup gist survived a control labelled
  // "Hapus semua progress — tidak bisa dibatalkan" (item 133). Someone resetting
  // the app before handing the phone on reasonably reads that as everything
  // being gone; it left a live credential behind. See UNMANAGED_KEYS.
  for (const key of UNMANAGED_KEYS) {
    try {
      localStorage.removeItem(key);
    } catch {
      // A storage that refuses removeItem is one where nothing was written
      // either; there is nothing to recover from and nothing to report.
    }
  }
}

export function exportAll() {
  if (!_initialized) init();
  return {
    _storage_version: STORAGE_VERSION,
    exported_at: new Date().toISOString(),
    progress: _cache.progress,
    srs: _cache.srs,
    prefs: _cache.prefs,
  };
}

export function importAll(snapshot) {
  if (!snapshot?.progress || !snapshot?.srs || !snapshot?.prefs) {
    throw new Error('Invalid snapshot — missing documents');
  }
  _cache.progress = { ...snapshot.progress, _v: STORAGE_VERSION };
  _cache.srs = { ...snapshot.srs, _v: STORAGE_VERSION };
  _cache.prefs = { ...snapshot.prefs, _v: STORAGE_VERSION };
  writeDoc(DOCS.progress, _cache.progress);
  writeDoc(DOCS.srs, _cache.srs);
  writeDoc(DOCS.prefs, _cache.prefs);
}

// ── Test helpers ─────────────────────────────────────────────────────────
export function _reset_for_test() {
  _cache = { progress: null, srs: null, prefs: null };
  _initialized = false;
  _corruption = [];
}

// ── Snapshot validation ──────────────────────────────────────────────────────
// Validate a snapshot before importing. Returns { ok, reason, summary }.
export function validateSnapshot(snapshot) {
  if (!snapshot || typeof snapshot !== 'object') return { ok: false, reason: 'not_object' };
  if (!snapshot.progress || !snapshot.srs || !snapshot.prefs)
    return { ok: false, reason: 'missing_docs' };
  if (!Array.isArray(snapshot.progress.known)) return { ok: false, reason: 'invalid_known' };
  if (typeof snapshot.srs.cards !== 'object') return { ok: false, reason: 'invalid_srs' };
  return {
    ok: true,
    summary: {
      known: snapshot.progress.known.length,
      unknown: (snapshot.progress.unknown ?? []).length,
      srsCards: Object.keys(snapshot.srs.cards).length,
      sessions: (snapshot.progress.sessions ?? []).length,
      version: snapshot._storage_version ?? snapshot.progress._v ?? 'unknown',
      migrated: (snapshot._storage_version ?? snapshot.progress._v ?? 0) < STORAGE_VERSION,
    },
  };
}

/**
 * The delta counterpart to validateSnapshot. A delta file carries `srs` plus
 * `known`/`starred` and no `progress` or `prefs`, so running it through
 * validateSnapshot returns `missing_docs` — which is what made
 * "Ekspor Delta SRS Saja" produce a file the app refused to read (item 117).
 */
export function validateDelta(delta) {
  if (!delta || typeof delta !== 'object') return { ok: false, reason: 'not_object' };
  if (typeof delta.srs?.cards !== 'object' || delta.srs.cards === null)
    return { ok: false, reason: 'invalid_srs' };
  if (delta.known != null && !Array.isArray(delta.known))
    return { ok: false, reason: 'invalid_known' };
  return {
    ok: true,
    summary: {
      known: (delta.known ?? []).length,
      unknown: 0,
      srsCards: Object.keys(delta.srs.cards).length,
      sessions: 0,
      version: delta._storage_version ?? 'unknown',
      migrated: false,
    },
  };
}

// ── Safe import with rollback ────────────────────────────────────────────────
// Imports snapshot, rolls back to prior state if importAll throws.
export function importAllSafe(snapshot) {
  const validation = validateSnapshot(snapshot);
  if (!validation.ok) throw new Error(`Snapshot tidak valid: ${validation.reason}`);

  // Snapshot current state for rollback
  const backup = exportAll();
  try {
    importAll(snapshot);
  } catch (err) {
    // Rollback on failure
    try {
      importAll(backup);
    } catch {}
    throw err;
  }
  return validation.summary;
}
