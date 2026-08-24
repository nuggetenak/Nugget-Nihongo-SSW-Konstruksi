// ─── storage/engine.js ───────────────────────────────────────────────────────
// 3-document localStorage engine with lz-string compression.
// readDoc decompresses transparently; falls back to plain JSON (backward compat).
// ─────────────────────────────────────────────────────────────────────────────

import { STORAGE_VERSION, DOCS, DEFAULTS } from './schema.js';
import {
  hasV1Data,
  migrate_v1_to_v2,
  cleanup_v1_keys,
  migrate_v2_to_v3,
  migrate_v3_to_v4,
  migrate_v4_to_v5,
  migrate_v5_to_v6,
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
    if (decompressed) return { ok: true, data: JSON.parse(decompressed) };
  } catch {
    // fall through to plain-JSON attempt below (pre-compression data)
  }
  try {
    return { ok: true, data: JSON.parse(raw) };
  } catch {
    return { ok: false, corrupt: true, raw };
  }
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

// ── Init ──────────────────────────────────────────────────────────────────
// Called once on app start. Detects v1/v2 data → migrates → caches.
export function init() {
  if (_initialized) return;

  const progressResult = readDoc(DOCS.progress);
  if (progressResult.corrupt) quarantineCorruptDoc(DOCS.progress, progressResult.raw);
  const progressRaw = progressResult.ok ? progressResult.data : null;
  const version = progressRaw?._v ?? 0;

  if (version === STORAGE_VERSION) {
    // Already current — load directly
    _cache.progress = progressRaw;
    const srsResult = readDoc(DOCS.srs);
    if (srsResult.corrupt) quarantineCorruptDoc(DOCS.srs, srsResult.raw);
    _cache.srs = srsResult.ok ? srsResult.data : { _v: STORAGE_VERSION, cards: {} };
    const prefsResult = readDoc(DOCS.prefs);
    if (prefsResult.corrupt) quarantineCorruptDoc(DOCS.prefs, prefsResult.raw);
    _cache.prefs = prefsResult.ok
      ? prefsResult.data
      : { ...JSON.parse(JSON.stringify(DEFAULTS.prefs)), _v: STORAGE_VERSION };
  } else if (version === 5) {
    // v5 → v6: doboku/kenchiku scores dropped, wayground/csv id renames remapped
    const migrated = migrate_v5_to_v6();
    _cache.progress = migrated.progress;
    _cache.srs = migrated.srs;
    _cache.prefs = migrated.prefs;
    writeDoc(DOCS.progress, _cache.progress);
    writeDoc(DOCS.srs, _cache.srs);
    writeDoc(DOCS.prefs, _cache.prefs);
  } else if (version === 4) {
    // v4 → v5 → v6
    const migrated45 = migrate_v4_to_v5();
    writeDoc(DOCS.progress, migrated45.progress);
    writeDoc(DOCS.srs, migrated45.srs);
    writeDoc(DOCS.prefs, migrated45.prefs);
    const migrated = migrate_v5_to_v6();
    _cache.progress = migrated.progress;
    _cache.srs = migrated.srs;
    _cache.prefs = migrated.prefs;
    writeDoc(DOCS.progress, _cache.progress);
    writeDoc(DOCS.srs, _cache.srs);
    writeDoc(DOCS.prefs, _cache.prefs);
  } else if (version === 3) {
    // v3 → v4 → v5 → v6
    const migrated34 = migrate_v3_to_v4();
    writeDoc(DOCS.progress, migrated34.progress);
    writeDoc(DOCS.srs, migrated34.srs);
    writeDoc(DOCS.prefs, migrated34.prefs);
    const migrated45 = migrate_v4_to_v5();
    writeDoc(DOCS.progress, migrated45.progress);
    writeDoc(DOCS.srs, migrated45.srs);
    writeDoc(DOCS.prefs, migrated45.prefs);
    const migrated = migrate_v5_to_v6();
    _cache.progress = migrated.progress;
    _cache.srs = migrated.srs;
    _cache.prefs = migrated.prefs;
    writeDoc(DOCS.progress, _cache.progress);
    writeDoc(DOCS.srs, _cache.srs);
    writeDoc(DOCS.prefs, _cache.prefs);
  } else if (version === 2) {
    // v2 → v3 → v4 → v5 → v6 migration chain
    const migrated23 = migrate_v2_to_v3();
    writeDoc(DOCS.progress, migrated23.progress);
    writeDoc(DOCS.srs, migrated23.srs);
    writeDoc(DOCS.prefs, migrated23.prefs);
    const migrated34 = migrate_v3_to_v4();
    writeDoc(DOCS.progress, migrated34.progress);
    writeDoc(DOCS.srs, migrated34.srs);
    writeDoc(DOCS.prefs, migrated34.prefs);
    const migrated45 = migrate_v4_to_v5();
    writeDoc(DOCS.progress, migrated45.progress);
    writeDoc(DOCS.srs, migrated45.srs);
    writeDoc(DOCS.prefs, migrated45.prefs);
    const migrated = migrate_v5_to_v6();
    _cache.progress = migrated.progress;
    _cache.srs = migrated.srs;
    _cache.prefs = migrated.prefs;
    writeDoc(DOCS.progress, _cache.progress);
    writeDoc(DOCS.srs, _cache.srs);
    writeDoc(DOCS.prefs, _cache.prefs);
  } else if (hasV1Data()) {
    // v1 → v2 → v3 → v4 → v5 → v6 chain migration
    const v2 = migrate_v1_to_v2();
    // Write intermediate v2 docs so migrate_v2_to_v3 can read them
    writeDoc(DOCS.progress, v2.progress);
    writeDoc(DOCS.srs, v2.srs);
    writeDoc(DOCS.prefs, v2.prefs);
    const migrated23 = migrate_v2_to_v3();
    writeDoc(DOCS.progress, migrated23.progress);
    writeDoc(DOCS.srs, migrated23.srs);
    writeDoc(DOCS.prefs, migrated23.prefs);
    const migrated34 = migrate_v3_to_v4();
    writeDoc(DOCS.progress, migrated34.progress);
    writeDoc(DOCS.srs, migrated34.srs);
    writeDoc(DOCS.prefs, migrated34.prefs);
    const migrated45 = migrate_v4_to_v5();
    writeDoc(DOCS.progress, migrated45.progress);
    writeDoc(DOCS.srs, migrated45.srs);
    writeDoc(DOCS.prefs, migrated45.prefs);
    const migrated56 = migrate_v5_to_v6();
    _cache.progress = migrated56.progress;
    _cache.srs = migrated56.srs;
    _cache.prefs = migrated56.prefs;
    writeDoc(DOCS.progress, _cache.progress);
    writeDoc(DOCS.srs, _cache.srs);
    writeDoc(DOCS.prefs, _cache.prefs);
    cleanup_v1_keys();
  } else {
    // Fresh install — write v3 defaults
    const d = freshDefaults();
    _cache.progress = d.progress;
    _cache.srs = d.srs;
    _cache.prefs = d.prefs;
    writeDoc(DOCS.progress, _cache.progress);
    writeDoc(DOCS.srs, _cache.srs);
    writeDoc(DOCS.prefs, _cache.prefs);
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
  const next = typeof updater === 'function' ? updater(current) : { ...current, ...updater };
  _cache[doc] = next;
  writeDoc(DOCS[doc], next);
  return next;
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
