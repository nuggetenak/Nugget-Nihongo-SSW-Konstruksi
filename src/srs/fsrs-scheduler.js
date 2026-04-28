// ─── fsrs-scheduler.js ────────────────────────────────────────────────────────
// Layer 3: FSRS scheduling business logic.
// Pure coordination between fsrs-core (math) and fsrs-store (storage).
// No React. No storage concerns. No UI concerns.
// ─────────────────────────────────────────────────────────────────────────────

import {
  createCard,
  scheduleReview,
  isDue,
  getRetrievability,
  getStrength,
  getStateLabel,
  ratingToKnown,
  State,
} from './fsrs-core.js';

import { getCard, saveCard, getAllCards } from './fsrs-store.js';

const HISTORY_LIMIT = 20;

// ── Record a review ────────────────────────────────────────────────────────
// cardId: numeric SSW card ID
// rating: 1 (Again) | 2 (Hard) | 3 (Good) | 4 (Easy)
// Returns { entry, interval, isKnown } — synchronous
export function recordReview(cardId, rating, now = new Date()) {
  let entry = getCard(cardId);

  if (!entry) {
    entry = {
      card: createCard(now),
      history: [],
      reviewed_at: null,
    };
  }

  const { card: nextCard, interval } = scheduleReview(entry.card, rating, now);

  const nextEntry = {
    card: nextCard,
    history: [
      ...(entry.history ?? []).slice(-(HISTORY_LIMIT - 1)),
      { date: now.toISOString(), rating },
    ],
    reviewed_at: now.toISOString(),
  };

  saveCard(cardId, nextEntry); // synchronous write-through

  return {
    entry: nextEntry,
    interval,
    isKnown: ratingToKnown(rating),
  };
}

// ── Due card queue ─────────────────────────────────────────────────────────
// Returns numeric cardIds due today, sorted by urgency (lowest R first).
export function getDueCardIds(whitelistIds = null, now = new Date()) {
  const all = getAllCards();
  const whiteset = whitelistIds ? new Set(whitelistIds.map(String)) : null;

  return Object.entries(all)
    .filter(([id, entry]) => {
      if (whiteset && !whiteset.has(id)) return false;
      return isDue(entry.card, now);
    })
    .sort(([, a], [, b]) => getRetrievability(a.card, now) - getRetrievability(b.card, now))
    .map(([id]) => Number(id));
}

// ── Per-card SRS info ──────────────────────────────────────────────────────
export function getCardSRSInfo(cardId, now = new Date()) {
  const entry = getCard(cardId);
  if (!entry) {
    return {
      seen: false,
      status: 'Baru',
      strength: getStrength(null),
      R: 0,
      nextDue: null,
      reps: 0,
      lapses: 0,
      history: [],
    };
  }
  return {
    seen: true,
    status: getStateLabel(entry.card),
    strength: getStrength(entry.card, now),
    R: getRetrievability(entry.card, now),
    nextDue: new Date(entry.card.due),
    reps: entry.card.reps,
    lapses: entry.card.lapses,
    history: entry.history ?? [],
  };
}

// ── Aggregate stats ────────────────────────────────────────────────────────
export function getSRSStats(allCardIds = [], now = new Date()) {
  const all = getAllCards();
  const seen = new Set(Object.keys(all));
  let newCount = 0,
    learning = 0,
    young = 0,
    mature = 0,
    due = 0;

  for (const id of allCardIds.map(String)) {
    if (!seen.has(id)) {
      newCount++;
      continue;
    }
    const { card } = all[id];
    if (isDue(card, now)) due++;
    const s = card.stability ?? 0;
    if (card.state === State.Learning || card.state === State.Relearning) learning++;
    else if (s >= 21) mature++;
    else young++;
  }

  return { total: allCardIds.length, new: newCount, learning, young, mature, due };
}

// ── Interval preview per rating ────────────────────────────────────────────
export function previewIntervals(cardId, now = new Date()) {
  const entry = getCard(cardId);
  const card = entry?.card ?? createCard(now);

  return Object.fromEntries(
    [1, 2, 3, 4].map((rating) => {
      try {
        const { interval } = scheduleReview(card, rating, now);
        return [rating, interval];
      } catch {
        return [rating, null];
      }
    })
  );
}

// ── Format interval for display ────────────────────────────────────────────
export function fmtInterval(days) {
  if (!days || days < 1) return '<1j';
  if (days < 7) return `${Math.round(days)}j`;
  if (days < 30) return `${Math.round(days / 7)}mgg`;
  if (days < 365) return `${Math.round(days / 30)}bln`;
  return `${(days / 365).toFixed(1)}th`;
}
