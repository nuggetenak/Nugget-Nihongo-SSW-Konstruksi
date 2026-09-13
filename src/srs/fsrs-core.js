// ─── fsrs-core.js ─────────────────────────────────────────────────────────────
// Layer 1: Pure FSRS computation. No storage, no React, no side effects.
// Wraps ts-fsrs with Indonesian-learner calibration hooks.
//
// Research basis:
//   Ye et al. (2022) — FSRS memory model (KDD proceedings)
//   Matsunaga (1999) — non-kanji L1 learners need 2.3× exposures for kanji
//
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
// Unused until Indonesian-learner calibration study data is available.
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
  // Fuzz is ON in the app and OFF in tests, and the asymmetry is the point.
  //
  // This shipped `false`, with the reason given as "deterministic intervals (easier
  // to test)" — a testing convenience applied to production. What fuzz does is
  // scatter each new interval by a few percent, and what that buys is a *flat* due
  // queue: without it every card reviewed in one session comes back on the same
  // future day, and keeps clumping with each subsequent review. For someone
  // onboarding a 1,626-card deck in a handful of long sittings, that builds a
  // calendar of 200-card days with nothing in between — and a 200-card day after a
  // week away is the single most common reason people abandon an SRS deck. This
  // audience is studying for a visa-dependent exam on a phone, in the evenings.
  //
  // Determinism is still what tests need, so `src/tests/setup.js` turns fuzz off
  // globally via `configureFSRS`. That is also what finally gives `configureFSRS` a
  // caller: it was flagged as unreferenced in item 139 and deliberately kept as "the
  // only tuning seam FSRS has". This is the seam being used for what it is for.
  enable_fuzz: true,
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
    // Which learning step the card is on. ts-fsrs 5.x added this to its Card and
    // this function did not, so every card that went through storage came back
    // claiming to be on step 0 — and a card on step 0 of ['1m','10m'] that is rated
    // Good advances to step 1, is written without it, and reads as step 0 again on
    // the next review.
    //
    // The effect was that **a card rated Oke could never graduate.** Twenty
    // consecutive Good ratings left it in Learning with a ten-minute interval and
    // stability pinned at its initial 2.31, where the library alone reaches the
    // Review state on the second review and a 46-day interval by the fourth. The
    // middle rating — the most common one — made the scheduler stand still, so the
    // whole point of the app quietly did not work for the learner who was using it
    // as intended. Nothing caught it because no test rated the same card twice, and
    // the field arrived silently inside a caret range.
    learning_steps: tsCard.learning_steps ?? 0,
    state: tsCard.state,
    last_review: tsCard.last_review ? toISO(tsCard.last_review) : null,
  };
}

function deserializeCard(plain) {
  return {
    ...plain,
    // Absent on every card written before this fix. 0 is what `createEmptyCard`
    // starts at and is correct for anything already in Review or Relearning, which
    // is most of a real store; a card caught mid-Learning repeats one step, which
    // costs a single ten-minute interval and then corrects itself. Defaulting on
    // read rather than migrating the documents keeps this off the migration chain
    // for a field the scheduler can supply a safe value for.
    learning_steps: plain.learning_steps ?? 0,
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
// Asked of ts-fsrs rather than computed here. Returns 0–1; 1 = just reviewed,
// 0 = a card that has never been seen.
//
// This was `R = (1 + t/(9·S))^(−1)` — the FSRS-4.5 power forgetting curve, written
// out by hand. The installed ts-fsrs is 5.3.2 and schedules with FSRS-6 parameters
// (21 weights, not 17), so the app was labelling cards with one model's curve while
// the scheduler planned them with another's.
//
// Measured before changing it, because the external audit that raised this (Genspark
// §5.2) marked it unconfirmed and got the direction wrong. It predicted a systematic
// *over*estimate of recall. What the numbers actually show, for a card at S = 46.3:
//
//     t (days)      ts-fsrs     old local     delta
//           1        0.9968        0.9976    +0.0008
//          46        0.9005        0.9006    +0.0001   <- the scheduled interval
//          80        0.8583        0.8390    -0.0193
//         160        0.7961        0.7226    -0.0735
//         365        0.7160        0.5332    -0.1829
//
// The two agree almost exactly at the interval FSRS actually schedules — which is
// the point the request_retention target is defined at — and diverge as the card
// ages past it, with the old formula reading *low*, not high. So the defect is not
// "the app is optimistic"; it is that `getStrength`'s labels turned pessimistic on
// exactly the mature cards a learner has earned. The old curve crossed the "Mulai
// Pudar" threshold at 179 days where FSRS-6 crosses it at 431: a card the scheduler
// believed 80% likely to be recalled was shown as fading, and one at 72% as
// "Hampir Lupa".
//
// `getDueCardIds` sorts by this and is unaffected either way: both curves depend on
// t/S alone and both are strictly decreasing in it, so they induce the same order.
// The labels were the only consumer that could disagree, and they did.
export function getRetrievability(serializedCard, now = new Date()) {
  if (!serializedCard?.last_review || serializedCard.state === State.New) return 0;
  // The third argument asks for a number rather than a formatted percentage string,
  // and the serialized (ISO-string) shape is accepted as-is — verified against
  // 5.3.2 rather than assumed.
  const R = getInstance().get_retrievability(serializedCard, now, false);
  return Number.isFinite(R) ? Math.max(0, Math.min(1, R)) : 0;
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
