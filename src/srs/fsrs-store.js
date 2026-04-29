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
  _reset_for_test,
} from '../storage/engine.js';

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

export function importSRSSnapshot(snapshot) {
  if (!snapshot?.cards || typeof snapshot.cards !== 'object') {
    throw new Error('Invalid SRS snapshot — missing cards field');
  }
  for (const [id, entry] of Object.entries(snapshot.cards)) {
    engineSetCard(id, entry);
  }
  return Object.keys(snapshot.cards).length;
}

// ── Reset (used by tests) ─────────────────────────────────────────────────
export function resetStore() {
  _reset_for_test();
}
