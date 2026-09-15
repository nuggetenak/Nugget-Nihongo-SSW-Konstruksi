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
    // One quarantine copy per document, not one per event. Each of these holds a
    // whole document's bytes, they were never cleaned up, and the corruption
    // they record is exactly the kind of thing that recurs — a flaky sync writing
    // a truncated key on Monday does it again on Tuesday. Left unbounded, the
    // feature that exists to protect data ends up consuming the quota that the
    // data needs, and the quota warning fires for space taken by backups of
    // unreadable files nobody can use. The newest copy is the useful one.
    // `localStorage.key(i)`, not `Object.keys(localStorage)`. The latter reads as
    // the obvious spelling and is not the same thing: Storage exposes its entries
    // as own properties only by host magic, so under jsdom `Object.keys` returns
    // ["getItem","setItem","removeItem","clear","length","key"] — the methods —
    // and matches nothing. It happens to work in a browser, which is the worst
    // version of this bug: the cleanup would have been dead in every test and
    // live in production, so nothing here could have told us it was wrong.
    // Backwards, because removing an entry reindexes the ones after it.
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key?.startsWith(`${docKey}_corrupt_`)) localStorage.removeItem(key);
    }
    localStorage.setItem(backupKey, raw);
  } catch {
    // Quota's the only realistic failure here (raw's already proven to be
    // valid string data, just not valid JSON) -- if even this fails, the
    // corruption warning below still fires without a preserved backup key,
    // which is strictly better than the silent-overwrite status quo.
  }
  _corruption.push({ doc: docKey, backupKey });
}

// ── Another tab wrote to our storage ───────────────────────────────────────
// Two tabs each hold their own module-level `_cache`, and a write from either one
// goes straight to localStorage. So the second tab's next write is built from a
// snapshot taken before the first tab's, and silently reverses it: study fifty cards
// in one tab, rate one card in the other, and the fifty are gone with nothing on
// screen having changed. Desktop is a supported form factor here — there is a
// SideNav — and a second tab is how people use a browser.
//
// What this does is the honest minimum rather than a merge: re-read the changed
// document into the cache so this tab stops writing from a stale one, and tell the
// app so it can say the data moved. A live merge would need every context to
// reconcile React state it has already rendered from, and getting that subtly wrong
// is a worse failure than asking someone to reload.
//
// A LIST rather than a single slot (item 191). It was one slot, and
// DataWarningBanner held it -- so the banner could say "data changed in another
// tab", and nothing else in the app could hear about it at all. `useSRS` keys
// its derived values off a revision counter bumped only by a local review(), so
// a card rated in another tab updated the engine's cache while the due badge
// kept showing the old count until something local happened to re-render it.
const _externalChangeListeners = new Set();
let _listening = false;

/**
 * Subscribe to "another tab changed a document". Called with the doc name
 * ('progress' | 'srs' | 'prefs'), or null when the other tab cleared everything.
 * Returns an unsubscribe function.
 */
export function addExternalChangeListener(fn) {
  _externalChangeListeners.add(fn);
  return () => _externalChangeListeners.delete(fn);
}

/**
 * @deprecated Single-slot spelling kept so existing callers and tests keep
 * working. It registers one listener and replaces whatever it registered last,
 * which is the old behaviour exactly; `null` clears it. New code should use
 * addExternalChangeListener, because a second caller of this one silently
 * evicts the first -- which is the bug item 191 fixed.
 */
let _legacyHandler = null;
export function setExternalChangeHandler(fn) {
  if (_legacyHandler) _externalChangeListeners.delete(_legacyHandler);
  _legacyHandler = fn || null;
  if (_legacyHandler) _externalChangeListeners.add(_legacyHandler);
}

const DOC_BY_KEY = Object.fromEntries(Object.entries(DOCS).map(([doc, key]) => [key, doc]));

function onStorageEvent(e) {
  // `key === null` is a `clear()` from another tab. `newValue === null` is a removal.
  // Both mean this tab's cache is no longer what is on disk, but neither is something
  // this app does to itself, so treat them as an external change and re-read.
  const doc = e.key === null ? null : DOC_BY_KEY[e.key];
  if (e.key !== null && !doc) return; // some other key entirely (a gist token, say)
  for (const d of doc ? [doc] : ['progress', 'srs', 'prefs']) {
    const res = readDoc(DOCS[d]);
    if (res.ok) {
      _cache[d] = res.data;
      continue;
    }
    // A REMOVAL, and this is the branch that used to do nothing (item 197).
    // The paragraph above says a removal means "this tab's cache is no longer
    // what is on disk" -- but the loop only assigned on `ok`, and readDoc
    // returns `{ ok: false, corrupt: false }` for a key that is simply gone. So
    // the stale document stayed in `_cache`, and the very next set() or
    // setSRSCard() wrote it straight back: another tab clears the app's data,
    // this tab rates one card, and everything the clear removed is on disk
    // again. The stated intent and the code disagreed, which is the failure
    // this repo keeps writing release notes about.
    //
    // Dropping to null is what makes the next write rebuild from DEFAULTS
    // rather than from a document that no longer exists -- `get()` and `set()`
    // both already fall back to a fresh copy when the cache entry is null, so
    // nothing else needs to know.
    //
    // A CORRUPT document is deliberately not treated the same way. There, disk
    // is unreadable but this tab still holds a good copy in memory, and keeping
    // it is strictly better than discarding known-good data because some other
    // tab wrote garbage. Pending writes are dropped either way: whatever is
    // queued was built from a document the other tab has since replaced.
    if (!res.corrupt) _cache[d] = null;
    discardPending(d);
  }
  for (const fn of _externalChangeListeners) fn(doc);
}

function startListening() {
  if (_listening || typeof window === 'undefined' || !window.addEventListener) return;
  // `storage` fires only in the *other* tabs, never the one that wrote — which is
  // exactly the asymmetry this needs and the reason no guard against self-triggering
  // is required.
  window.addEventListener('storage', onStorageEvent);
  // The flush safety net for item 185's deferred writes. Without these, closing
  // the tab inside the debounce window loses the last rating — which would trade
  // a stall for data loss, and this file exists to prevent the second one.
  window.addEventListener('pagehide', onPageHiding);
  if (typeof document !== 'undefined' && document.addEventListener) {
    document.addEventListener('visibilitychange', onVisibilityChange);
  }
  _listening = true;
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

// ── Coalesced writes (item 185) ───────────────────────────────────────────
// Every write used to re-serialise and re-compress a WHOLE document, and
// `setSRSCard` calls that on every single card rating. Measured on a server
// CPU, with the deck's own HISTORY_LIMIT of 20 reviews per card:
//
//     250 cards   ->  156 kB JSON  ->   58 ms per rating
//     800 cards   ->  780 kB JSON  ->  250 ms per rating
//   1,626 cards   -> 2.7 MB JSON   ->  889 ms per rating
//
// A low-end Android phone -- the device this app was built for -- runs JS four
// to eight times slower than that. So the app got slower the more someone
// studied, and the learner who used it most was the one it punished, with a
// main thread blocked between the tap and the next card.
//
// The cache is already the authority: `get`, `getSRSCard` and `exportAll` all
// read `_cache`, never localStorage, and both writers stamp `updatedAt` on the
// cache synchronously before queueing. So deferring the *persist* changes
// nothing any reader -- or any conflict check -- can see. N ratings in a
// session collapse into one write.
//
// Only `set()` and `setSRSCard()` queue. init()'s migration and salvage
// writes, resetAll() and importAll() all still write synchronously and are
// untouched, because those are the branches where a deferred write is a risk
// rather than a saving.
const WRITE_DEBOUNCE_MS = 400;
const _dirty = new Set();
let _flushTimer = null;

function queueWrite(doc) {
  _dirty.add(doc);
  if (_flushTimer === null && typeof setTimeout === 'function') {
    _flushTimer = setTimeout(flushWrites, WRITE_DEBOUNCE_MS);
  }
}

/**
 * Persist every queued document now. Safe to call with nothing pending, and
 * safe to call twice. Exported because the lifecycle hooks below are not the
 * only caller that needs it: a test asserting on what is on disk has to be
 * able to say "now", and so does anything that hands the documents to another
 * process.
 */
export function flushWrites() {
  if (_flushTimer !== null) {
    clearTimeout(_flushTimer);
    _flushTimer = null;
  }
  if (_dirty.size === 0) return;
  const docs = [..._dirty];
  _dirty.clear();
  for (const doc of docs) {
    const res = writeDoc(DOCS[doc], _cache[doc]);
    // A failed write stays queued rather than being dropped (item 201). The
    // cache is still the truth, so the next queueWrite or the next flush --
    // pagehide, at the latest -- retries it. It deliberately does NOT
    // reschedule itself here: a persistent quota failure would spin a timer
    // forever and re-fire the quota banner on every tick, and `writeDoc` has
    // already notified once.
    if (!res.ok) _dirty.add(doc);
  }
}

/**
 * Drop queued writes for these documents WITHOUT persisting them.
 *
 * This is the trap that makes coalescing dangerous, and it is worth stating
 * plainly: `resetAll()` writes fresh defaults synchronously, but a rating from
 * two hundred milliseconds ago may still be sitting in the queue. Flushing it
 * would write the pre-reset document back over the defaults and resurrect
 * exactly the data the user asked to delete. The queue has to be discarded,
 * not drained. Same for `importAll`, whose whole job is to replace what is
 * there, and for a document another tab has just removed.
 */
function discardPending(...docs) {
  for (const d of docs) _dirty.delete(d);
  if (_dirty.size === 0 && _flushTimer !== null) {
    clearTimeout(_flushTimer);
    _flushTimer = null;
  }
}

function onPageHiding() {
  // The two events that actually fire when a mobile browser backgrounds or
  // kills a tab. `beforeunload` is unreliable on Android and fires too late to
  // be the safety net here.
  flushWrites();
}

function onVisibilityChange() {
  if (typeof document !== 'undefined' && document.visibilityState === 'hidden') flushWrites();
}

function freshDefaults() {
  return {
    progress: { ...JSON.parse(JSON.stringify(DEFAULTS.progress)), _v: STORAGE_VERSION },
    srs: { _v: STORAGE_VERSION, cards: {} },
    prefs: { ...JSON.parse(JSON.stringify(DEFAULTS.prefs)), _v: STORAGE_VERSION },
  };
}

// Reads the srs and prefs documents into the cache, quarantining either if it
// existed but would not parse. Extracted because three branches of init() need
// exactly this and one of them used to do something else — the fresh-install
// branch wrote defaults over both (see the comment there).
function loadSideDocs() {
  const srsResult = readDoc(DOCS.srs);
  if (srsResult.corrupt) quarantineCorruptDoc(DOCS.srs, srsResult.raw);
  _cache.srs = srsResult.ok ? srsResult.data : { _v: STORAGE_VERSION, cards: {} };
  const prefsResult = readDoc(DOCS.prefs);
  if (prefsResult.corrupt) quarantineCorruptDoc(DOCS.prefs, prefsResult.raw);
  _cache.prefs = prefsResult.ok
    ? prefsResult.data
    : { ...JSON.parse(JSON.stringify(DEFAULTS.prefs)), _v: STORAGE_VERSION };
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
    loadSideDocs();
  } else {
    // Find where this install actually is. v1 predates the _v stamp entirely,
    // so it is detected by the shape of its keys rather than by a number.
    const from = version >= 2 ? version : hasV1Data() ? 1 : null;

    if (from === null) {
      // ── Not necessarily a fresh install ──────────────────────────────────
      // This branch used to write `freshDefaults()` over all three documents,
      // and it is reached whenever the *progress* document alone is missing or
      // unusable — a partial "clear site data", a WebView cleanup, a truncated
      // sync write, a hand-edited key. So the price of losing one of three keys
      // was losing the other two as well, and the one that matters most is the
      // SRS document: every card's stability, difficulty and review history,
      // which nothing can reconstruct. A learner two years in could open the app
      // one morning to a deck that had never heard of them.
      //
      // The irony is that the quarantine path above had already done its job by
      // then: an unusable progress document was preserved under a side key, and
      // then this branch destroyed the two healthy documents next to it.
      //
      // So a genuinely fresh install is now the narrower claim it always should
      // have been: no progress document AND nothing worth keeping in the other
      // two. When either of the others is usable, only the missing document is
      // rebuilt from defaults.
      const srsResult = readDoc(DOCS.srs);
      const prefsResult = readDoc(DOCS.prefs);
      const salvageable = srsResult.ok || prefsResult.ok;
      const d = freshDefaults();

      _cache.progress = d.progress;
      writeDoc(DOCS.progress, _cache.progress);

      if (salvageable) {
        if (srsResult.corrupt) quarantineCorruptDoc(DOCS.srs, srsResult.raw);
        if (prefsResult.corrupt) quarantineCorruptDoc(DOCS.prefs, prefsResult.raw);
        // Kept as found, not rewritten: a document this build did not produce is
        // left byte-for-byte until something actually changes it. Only the ones
        // that were unreadable fall back to defaults, and only in memory.
        _cache.srs = srsResult.ok ? srsResult.data : d.srs;
        _cache.prefs = prefsResult.ok ? prefsResult.data : d.prefs;
        if (!srsResult.ok) writeDoc(DOCS.srs, _cache.srs);
        if (!prefsResult.ok) writeDoc(DOCS.prefs, _cache.prefs);
        // No corruption entry for the rebuilt progress document: if it was
        // unreadable the quarantine call at the top of init() already recorded
        // it, and if it was merely absent then nothing was lost and
        // DataWarningBanner would be crying wolf — the mistake item 138 was.
      } else {
        _cache.srs = d.srs;
        _cache.prefs = d.prefs;
        writeDoc(DOCS.srs, _cache.srs);
        writeDoc(DOCS.prefs, _cache.prefs);
      }
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
        if (!step) break; // no path from here — see the `if (!migrated)` below
        migrated = step();
        writeDoc(DOCS.progress, migrated.progress);
        writeDoc(DOCS.srs, migrated.srs);
        writeDoc(DOCS.prefs, migrated.prefs);
      }
      if (migrated) {
        _cache.progress = migrated.progress;
        _cache.srs = migrated.srs;
        _cache.prefs = migrated.prefs;
      } else {
        // ── The registry had no step for `from`, so nothing ran ──────────────
        // "leave the data untouched" is what the old comment here claimed, and
        // it was only half true. `migrated` stayed null, so all three cache
        // slots stayed null, `_initialized` went true anyway, and from that
        // point `get()` returned DEFAULTS while `set()` merged onto DEFAULTS and
        // wrote the result — defaults over the stored document, on the first
        // write. The data survived exactly until the user did anything.
        //
        // Unreachable today: every version 1–6 has an entry. It becomes
        // reachable the moment someone bumps STORAGE_VERSION and forgets the
        // registry line, which is precisely the hole the registry was built to
        // stop being silent, one branch over.
        //
        // Load what is on disk as-is instead. An older document read by a newer
        // build is the same situation as the `>=` branch above and is handled
        // the same way: fields this build does not know about ride through a
        // `set()` untouched, because `set()` spreads the cached document.
        _cache.progress = progressRaw;
        loadSideDocs();
        _corruption.push({ doc: DOCS.progress, backupKey: null, migrationGap: from });
      }
      if (from === 1) cleanup_v1_keys();
    }
  }

  _initialized = true;
  startListening();
}

// ── Document-level API ────────────────────────────────────────────────────
// get(doc) → returns full document object (reference to cache)
export function get(doc) {
  if (!_initialized) init();
  // The fallback is a copy, not `DEFAULTS[doc]` itself. Handing out the live
  // module-level object means any caller that mutates what it reads — one
  // `push` onto `known`, one assignment into `quizWrong` — edits the defaults
  // for the rest of the session, and every later reader sees the poisoned
  // values. No current caller does, which is what makes it worth closing now
  // rather than after one does.
  return _cache[doc] ?? JSON.parse(JSON.stringify(DEFAULTS[doc]));
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
  // Queued, not written (item 185). The cache above is what every reader sees —
  // get(), exportAll() and getLastMutatedAt() all read it — so the persist is
  // the only thing being deferred, and it collapses a session's worth of writes
  // into one.
  queueWrite(doc);
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
  // Stamped here too, and this is the one that was missing. `set()` stamps every
  // write it makes, and `getLastMutatedAt()` is built on those stamps — but
  // rating a card does not go through `set()`, it comes through here, and this
  // path wrote straight to storage without touching `updatedAt`. So the single
  // most common action in the app, the one the whole SRS loop is made of, moved
  // nothing that the conflict check could see.
  //
  // What that cost: a learner who only ever reviews cards — no quizzes, no
  // notes, no starring — reads as a device that has never changed. Restore an
  // eight-month-old backup over four hundred fresh reviews and the "data on this
  // device is newer than this file" warning stays silent, because as far as the
  // stamps were concerned it wasn't.
  _cache.srs.updatedAt = Date.now();
  // The single hottest write in the app: one per card rating, each of which used
  // to re-compress every card the learner had ever studied. See queueWrite.
  queueWrite('srs');
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
  // Discard before writing, never flush (see discardPending). A rating from two
  // hundred milliseconds ago is still queued, and flushing it here would write
  // the pre-reset document back over the defaults below — resurrecting exactly
  // the data the user asked to delete, from inside the function that deletes it.
  discardPending('progress', 'srs', 'prefs');
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
  // Stamped now, not carried from the file. Without this the restored documents
  // keep whatever `updatedAt` the *other* device wrote months ago, so a device
  // that has just had its entire history replaced claims it has not changed
  // since — and the next conflict check reasons from that. Restoring a backup is
  // the largest mutation this app can perform; it is the last thing that should
  // read as "no activity".
  // Same reasoning as resetAll: an import replaces all three documents, so a
  // queued write built from the outgoing ones must be dropped, not drained.
  discardPending('progress', 'srs', 'prefs');
  const now = Date.now();
  _cache.progress = { ...snapshot.progress, _v: STORAGE_VERSION, updatedAt: now };
  _cache.srs = { ...snapshot.srs, _v: STORAGE_VERSION, updatedAt: now };
  _cache.prefs = { ...snapshot.prefs, _v: STORAGE_VERSION, updatedAt: now };
  writeDoc(DOCS.progress, _cache.progress);
  writeDoc(DOCS.srs, _cache.srs);
  writeDoc(DOCS.prefs, _cache.prefs);
}

// ── Test helpers ─────────────────────────────────────────────────────────
export function _reset_for_test() {
  _cache = { progress: null, srs: null, prefs: null };
  _initialized = false;
  _corruption = [];
  if (_listening && typeof window !== 'undefined' && window.removeEventListener) {
    window.removeEventListener('storage', onStorageEvent);
    window.removeEventListener('pagehide', onPageHiding);
    if (typeof document !== 'undefined' && document.removeEventListener) {
      document.removeEventListener('visibilitychange', onVisibilityChange);
    }
  }
  _listening = false;
  // A queued write must not survive into the next test, or one test's rating
  // lands in another's localStorage.
  _dirty.clear();
  if (_flushTimer !== null) {
    clearTimeout(_flushTimer);
    _flushTimer = null;
  }
  _externalChangeListeners.clear();
  _legacyHandler = null;
}

// ── Snapshot validation ──────────────────────────────────────────────────────
// Validate a snapshot before importing. Returns { ok, reason, summary }.
/**
 * Is one `srs.cards[id]` entry safe to hand to the scheduler?
 *
 * The shape check above it used to stop at `typeof srs.cards === 'object'`, which
 * accepts `{ card: { due: 'garbage' }, history: 'oops' }`. That imports cleanly
 * and then fails much later and much worse: `deserializeCard` turns `'garbage'`
 * into an Invalid Date, ts-fsrs throws inside the rating call, the ErrorBoundary
 * takes the screen, and the entry that caused it is already persisted — so the
 * card is unrateable on every subsequent visit too. Rejecting the file is a
 * strictly better outcome than accepting a file that breaks one card forever.
 *
 * Deliberately permissive about which fields exist: entries written by older
 * versions carry different keys, and this runs on files a user is *restoring*.
 * It only rejects values that are present and of a type the scheduler cannot use.
 */
function isUsableSRSEntry(entry) {
  if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return false;
  if ('history' in entry && !Array.isArray(entry.history)) return false;
  const card = entry.card ?? entry;
  if (!card || typeof card !== 'object' || Array.isArray(card)) return false;
  if (card.due != null) {
    const due = typeof card.due === 'number' ? card.due : Date.parse(card.due);
    if (!Number.isFinite(due)) return false;
  }
  for (const k of ['stability', 'difficulty', 'reps', 'lapses', 'elapsed_days', 'scheduled_days']) {
    if (card[k] != null && typeof card[k] !== 'number') return false;
    if (typeof card[k] === 'number' && !Number.isFinite(card[k])) return false;
  }
  return true;
}

export function validateSnapshot(snapshot) {
  if (!snapshot || typeof snapshot !== 'object') return { ok: false, reason: 'not_object' };
  if (!snapshot.progress || !snapshot.srs || !snapshot.prefs)
    return { ok: false, reason: 'missing_docs' };
  if (!Array.isArray(snapshot.progress.known)) return { ok: false, reason: 'invalid_known' };
  if (typeof snapshot.srs.cards !== 'object' || snapshot.srs.cards === null)
    return { ok: false, reason: 'invalid_srs' };
  // `prefs` had no shape check at all, so `prefs: 42` or `prefs: []` sailed
  // through and every renderer downstream got a document it could not read.
  if (typeof snapshot.prefs !== 'object' || Array.isArray(snapshot.prefs))
    return { ok: false, reason: 'invalid_prefs' };
  for (const [id, entry] of Object.entries(snapshot.srs.cards)) {
    if (!isUsableSRSEntry(entry)) return { ok: false, reason: `invalid_srs_card:${id}` };
  }
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
  // Same per-entry check as validateSnapshot. A delta merges rather than
  // replaces, so an unusable entry here poisons one card instead of the store —
  // still a card the learner can never rate again.
  for (const [id, entry] of Object.entries(delta.srs.cards)) {
    if (!isUsableSRSEntry(entry)) return { ok: false, reason: `invalid_srs_card:${id}` };
  }
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
