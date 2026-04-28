// ─── fsrs-core.js ─────────────────────────────────────────────────────────────
// Layer 1: Pure FSRS computation. No storage, no React, no side effects.
// Wraps ts-fsrs with Indonesian-learner calibration hooks.
//
// Research basis:
//   Ye et al. (2022) — FSRS memory model (KDD proceedings)
//   Matsunaga (1999) — non-kanji L1 learners need 2.3× exposures for kanji
//   Blueprint §8.11.2 — Study 2: FSRS difficulty prior calibration
//
// Portable: can be copied to main Nugget Nihongo project unchanged.
// ─────────────────────────────────────────────────────────────────────────────

import { fsrs, createEmptyCard, Rating, State } from 'ts-fsrs';

// ── Rating constants (re-exported for consumers) ───────────────────────────
export { Rating, State };

export const FSRS_RATINGS = {
  AGAIN: Rating.Again, // 1
  HARD: Rating.Hard, // 2
  GOOD: Rating.Good, // 3
  EASY: Rating.Easy, // 4
};

// UI metadata for each rating button
export const RATING_META = {
  [Rating.Again]: {
    id: 'Lagi',
    en: 'Again',
    emoji: '🔴',
    color: '#f87171',
    bg: 'rgba(248,113,113,0.10)',
    border: 'rgba(248,113,113,0.35)',
  },
  [Rating.Hard]: {
    id: 'Susah',
    en: 'Hard',
    emoji: '🟠',
    color: '#fb923c',
    bg: 'rgba(251,146,60,0.10)',
    border: 'rgba(251,146,60,0.35)',
  },
  [Rating.Good]: {
    id: 'Oke',
    en: 'Good',
    emoji: '🟢',
    color: '#4ade80',
    bg: 'rgba(74,222,128,0.10)',
    border: 'rgba(74,222,128,0.35)',
  },
  [Rating.Easy]: {
    id: 'Mudah',
    en: 'Easy',
    emoji: '💎',
    color: '#60a5fa',
    bg: 'rgba(96,165,250,0.10)',
    border: 'rgba(96,165,250,0.35)',
  },
};

// ── Indonesian Learner Calibration ─────────────────────────────────────────
// Matsunaga (1999): non-kanji L1 learners (~BI, BM) need ~2.3× more exposures
// for kanji vocabulary retention. Currently using FSRS defaults.
// Replace kanji_difficulty_boost / kanji_stability_factor when
// Blueprint Study 2 calibration data (§8.11.2) becomes available.
export const INDONESIAN_CALIBRATION = {
  kanji_difficulty_boost: 0, // additive to FSRS difficulty [future]
  kanji_stability_factor: 1.0, // multiplier on initial stability [future]
  matsunaga_multiplier: 2.3, // reference constant (do not change)
  calibrated: false, // flip to true when Study 2 data arrives
};

// ── Default FSRS settings ──────────────────────────────────────────────────
const DEFAULT_CONFIG = {
  request_retention: 0.9, // target recall probability
  maximum_interval: 365, // days
  enable_fuzz: false, // deterministic intervals (easier to test)
};

// ── FSRS instance (lazy-initialized, singleton per config) ─────────────────
let _fsrsInstance = null;
let _currentConfig = { ...DEFAULT_CONFIG };

function getInstance() {
  if (!_fsrsInstance) {
    _fsrsInstance = fsrs(_currentConfig);
  }
  return _fsrsInstance;
}

// Reconfigure — call to change retention target, resets instance.
export function configureFSRS(overrides = {}) {
  _currentConfig = { ..._currentConfig, ...overrides };
  _fsrsInstance = null;
}

export function getFSRSConfig() {
  return { ..._currentConfig };
}

// ── Card serialization ─────────────────────────────────────────────────────
// All card data is stored as plain JSON-serializable objects (ISO date strings).
// ts-fsrs internally uses Date objects — these helpers convert back and forth.

function serializeCard(tsCard) {
  return {
    due: toISO(tsCard.due),
    stability: tsCard.stability,
    difficulty: tsCard.difficulty,
    elapsed_days: tsCard.elapsed_days,
    scheduled_days: tsCard.scheduled_days,
    reps: tsCard.reps,
    lapses: tsCard.lapses,
    state: tsCard.state,
    last_review: tsCard.last_review ? toISO(tsCard.last_review) : null,
  };
}

function deserializeCard(plain) {
  return {
    ...plain,
    due: new Date(plain.due),
    last_review: plain.last_review ? new Date(plain.last_review) : undefined,
  };
}

function toISO(d) {
  return d instanceof Date ? d.toISOString() : d;
}

// ── Card factory ───────────────────────────────────────────────────────────
// Returns a fresh serialized FSRS card (state=New, never reviewed).
export function createCard(now = new Date()) {
  return serializeCard(createEmptyCard(now));
}

// ── Core: schedule a review ────────────────────────────────────────────────
// serializedCard: plain object from storage
// rating:         1 (Again) | 2 (Hard) | 3 (Good) | 4 (Easy)
// Returns { card: SerializedCard, interval: days, state: FSRSState }
export function scheduleReview(serializedCard, rating, now = new Date()) {
  const f = getInstance();
  const card = deserializeCard(serializedCard);
  const scheduling = f.repeat(card, now);
  const result = scheduling[rating];

  if (!result?.card) {
    throw new Error(`[fsrs-core] Invalid scheduling result for rating ${rating}`);
  }

  return {
    card: serializeCard(result.card),
    interval: result.card.scheduled_days,
    state: result.card.state,
  };
}

// ── Retrievability R(t, S) ─────────────────────────────────────────────────
// Power forgetting curve: R = (1 + t / (9·S))^(−1)
// Returns 0–1. 1 = perfect recall (just reviewed), 0 = completely forgotten.
export function getRetrievability(serializedCard, now = new Date()) {
  if (!serializedCard?.last_review || serializedCard.state === State.New) return 0;
  const S = serializedCard.stability || 1;
  const elapsed = (now - new Date(serializedCard.last_review)) / 86_400_000; // ms→days
  return Math.max(0, Math.min(1, Math.pow(1 + elapsed / (9 * S), -1)));
}

// ── Due check ─────────────────────────────────────────────────────────────
export function isDue(serializedCard, now = new Date()) {
  if (!serializedCard?.due) return false;
  return new Date(serializedCard.due) <= now;
}

// ── Strength label (for UI chips/badges) ──────────────────────────────────
// Returns { label, color, level } where level ∈ 'new'|'strong'|'fading'|'weak'|'critical'
export function getStrength(serializedCard, now = new Date()) {
  if (!serializedCard || serializedCard.state === State.New) {
    return { label: 'Baru', color: '#94a3b8', level: 'new' };
  }
  const R = getRetrievability(serializedCard, now);
  if (R >= 0.9) return { label: 'Kuat', color: '#4ade80', level: 'strong' };
  if (R >= 0.7) return { label: 'Mulai Pudar', color: '#facc15', level: 'fading' };
  if (R >= 0.5) return { label: 'Lemah', color: '#fb923c', level: 'weak' };
  return { label: 'Hampir Lupa', color: '#f87171', level: 'critical' };
}

// ── State label (human-readable) ──────────────────────────────────────────
export function getStateLabel(serializedCard) {
  if (!serializedCard || serializedCard.state === State.New) return 'Baru';
  const { state, stability = 0 } = serializedCard;
  if (state === State.Learning) return 'Dipelajari';
  if (state === State.Relearning) return 'Diulang';
  // State.Review (2)
  if (stability >= 21) return 'Matang';
  if (stability >= 7) return 'Berkembang';
  return 'Muda';
}

// ── Rating → known/unknown mapping (for backward compat) ──────────────────
// Maps FSRS 4-point scale to the existing binary known/unknown system.
// Again=1 → unknown. Hard/Good/Easy (2–4) → known.
export function ratingToKnown(rating) {
  return rating >= Rating.Hard; // true = known, false = unknown
}
