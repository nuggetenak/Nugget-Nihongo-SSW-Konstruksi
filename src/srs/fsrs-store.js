// ─── srs/fsrs-store.js ────────────────────────────────────────────────────────
// Layer 2: FSRS card storage — backed by storage engine (v2: ssw-srs-data).
// API unchanged so scheduler + hooks don't need updates.
//
// Pattern: storage engine is the source of truth (already in-memory).
// All reads/writes go through engine.getSRSCard / engine.setSRSCard.
// ─────────────────────────────────────────────────────────────────────────────

import {
  init as engineInit,
  getSRSCard,
  setSRSCard as engineSetCard,
  getAllSRSCards,
  getSRSCardCount,
  set as engineSet,
  _reset_for_test,
} from '../storage/engine.js';

/** The `_type` stamped into an "Ekspor Delta SRS Saja" file. One spelling. */
export const DELTA_TYPE = 'ssw-srs-delta';

// ── Init ───────────────────────────────────────────────────────────────────
// Called by useSRS on first render. Delegates to storage engine.
export function initStore() {
  engineInit();
}

// ── Read ───────────────────────────────────────────────────────────────────
export const getCard = (cardId) => getSRSCard(cardId);
export const hasCard = (cardId) => getSRSCard(cardId) !== null;
export const getAllCards = () => getAllSRSCards();
export const getCardCount = () => getSRSCardCount();

// ── Write ─────────────────────────────────────────────────────────────────
export function saveCard(cardId, entry) {
  engineSetCard(cardId, entry);
}

// ── Export / Import (for ExportMode) ──────────────────────────────────────
export function exportSRSSnapshot() {
  return {
    _srs_version: 1,
    exported_at: new Date().toISOString(),
    cards: getAllSRSCards(),
  };
}

// Merges card by card, deliberately: the app's other import path
// (engine.importAll) is a whole-document replace, so restoring an older backup
// there discards every review made since. A delta file is for routine backup on
// one device and for carrying reviews between two, and neither wants a replace.
export function importSRSSnapshot(snapshot) {
  if (!snapshot?.cards || typeof snapshot.cards !== 'object') {
    throw new Error('Invalid SRS snapshot — missing cards field');
  }
  for (const [id, entry] of Object.entries(snapshot.cards)) {
    engineSetCard(id, entry);
  }
  return Object.keys(snapshot.cards).length;
}

/**
 * Applies an "Ekspor Delta SRS Saja" file.
 *
 * Item 117: that button wrote `{ _type, _storage_version, exported_at, srs,
 * known, starred }` -- no `progress`, no `prefs` -- and the only import path in
 * the app ran it through validateSnapshot, which hard-requires all three
 * documents and rejects with `missing_docs`. So the app offered a backup button
 * whose output the app could not read back. Every ingredient for the fix was
 * already written: importSRSSnapshot above is a correct per-card merge that was
 * reachable only through a barrel nothing imported (item 139).
 *
 * Cards merge; `known` and `starred` union. Union rather than replace because a
 * delta carries no negative information -- a card missing from the file means
 * "this device did not say", not "this device says no" -- so subtracting would
 * discard local marks the file was never claiming to describe.
 *
 * @returns {{cards:number, known:number, starred:number}} what was applied
 */
export function importSRSDelta(delta) {
  if (!delta || typeof delta !== 'object') throw new Error('Delta tidak valid');
  if (delta._type !== DELTA_TYPE) throw new Error('Bukan file Delta SRS');
  const cards = importSRSSnapshot(delta.srs ?? {});

  const known = Array.isArray(delta.known) ? delta.known : [];
  const starred = Array.isArray(delta.starred) ? delta.starred : [];
  if (known.length || starred.length) {
    engineSet('progress', (p) => ({
      ...p,
      known: [...new Set([...(p?.known ?? []), ...known])],
      starred: [...new Set([...(p?.starred ?? []), ...starred])],
    }));
  }
  return { cards, known: known.length, starred: starred.length };
}

/** True for a file produced by "Ekspor Delta SRS Saja". */
export function isSRSDelta(parsed) {
  return !!parsed && typeof parsed === 'object' && parsed._type === DELTA_TYPE;
}

// ── Reset (used by tests) ─────────────────────────────────────────────────
export function resetStore() {
  _reset_for_test();
}
