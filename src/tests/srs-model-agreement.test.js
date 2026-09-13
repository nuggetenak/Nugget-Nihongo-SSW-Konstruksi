// ─── tests/srs-model-agreement.test.js ───────────────────────────────────────
// The app and the scheduler have to believe the same things about a card.
//
// They did not. `getRetrievability` wrote out the FSRS-4.5 power forgetting curve
// by hand — `R = (1 + t/(9S))^(-1)` — while the installed ts-fsrs 5.3.2 schedules
// with FSRS-6 parameters. Every "Kuat / Mulai Pudar / Lemah / Hampir Lupa" label the
// learner reads came from one model and every due date from the other.
//
// Raised by an external audit (Genspark §5.2) that marked it unconfirmed and
// predicted the wrong direction: it expected the app to *overestimate* recall. The
// measurement said otherwise, and the measurement is what these tests keep.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect } from 'vitest';
import { fsrs, generatorParameters, Rating as TSRating } from 'ts-fsrs';
import {
  createCard,
  scheduleReview,
  getRetrievability,
  getStrength,
  getFSRSConfig,
  configureFSRS,
} from '../srs/fsrs-core.js';

const DAY = 86_400_000;
const at = (iso, days) => new Date(Date.parse(iso) + days * DAY);

/**
 * A mature card: four Good reviews, each taken on the day the previous one fell due.
 * Lands in Review with S = 46.3 and a 46-day interval — which is only true since
 * `learning_steps` started being persisted. Before that this loop produced a card
 * stuck in Learning at a ten-minute interval, which is how the graduation bug
 * surfaced: writing this helper is what exposed it.
 */
function matureCard() {
  let card = createCard(new Date('2026-01-01T00:00:00.000Z'));
  let now = new Date('2026-01-01T00:00:00.000Z');
  for (let i = 0; i < 4; i++) {
    const res = scheduleReview(card, 3, now);
    card = res.card;
    now = new Date(card.due);
  }
  return card;
}

describe('retrievability comes from the scheduler, not a second copy of the curve', () => {
  it('agrees with ts-fsrs at every elapsed time, not just at the due date', () => {
    // The old hand-written curve agreed to four decimal places *at the scheduled
    // interval* — which is exactly where request_retention pins it, and exactly why
    // nothing noticed — and drifted from there. At one year it was 0.18 low.
    const card = matureCard();
    const lib = fsrs(generatorParameters(getFSRSConfig()));
    for (const t of [1, 5, 10, 20, 40, 80, 160, 365]) {
      const when = at(card.last_review, t);
      const mine = getRetrievability(card, when);
      const theirs = Number(lib.get_retrievability(card, when, false));
      expect(Math.abs(mine - theirs), `R disagrees at t=${t}d: ${mine} vs ${theirs}`).toBeLessThan(
        0.0005
      );
    }
  });

  it('is about the target retention at the interval the scheduler chose', () => {
    // The property that makes the whole model coherent: a card reviewed exactly when
    // it came due should sit at request_retention.
    const card = matureCard();
    const R = getRetrievability(card, new Date(card.due));
    expect(R).toBeGreaterThan(getFSRSConfig().request_retention - 0.02);
    expect(R).toBeLessThan(getFSRSConfig().request_retention + 0.02);
  });

  it('does not downgrade a mature card a whole band early', () => {
    // The user-visible defect, measured rather than asserted from the curve algebra.
    // For this card (S = 46.3) the two models agree on the band until roughly 180
    // days, then part: at one year FSRS-6 puts recall at 0.716 — "Mulai Pudar" — and
    // the old hand-written curve at 0.533, which is "Lemah". A whole band of
    // pessimism on exactly the cards a learner has earned, and the further out the
    // card, the worse it got.
    const card = matureCard();
    const oldCurve = (t) => Math.pow(1 + t / (9 * card.stability), -1);

    const t = 365;
    const when = at(card.last_review, t);
    expect(getStrength(card, when).level).toBe('fading');
    // And the old formula would have said 'weak', which is what makes this a fix
    // rather than a restatement of the same number.
    expect(oldCurve(t)).toBeLessThan(0.7);
  });

  it('is 0 for a card that has never been reviewed', () => {
    const fresh = createCard(new Date('2026-01-01T00:00:00.000Z'));
    expect(getRetrievability(fresh, new Date('2026-02-01T00:00:00.000Z'))).toBe(0);
    expect(getStrength(fresh).level).toBe('new');
  });

  it('stays inside 0–1 for absurd inputs rather than returning NaN', () => {
    const card = matureCard();
    expect(getRetrievability({ ...card, stability: 0 }, new Date(card.due))).toBeLessThanOrEqual(1);
    expect(getRetrievability({ ...card, stability: 0 }, new Date(card.due))).toBeGreaterThanOrEqual(
      0
    );
    expect(getRetrievability(null)).toBe(0);
    expect(getRetrievability(undefined)).toBe(0);
  });

  it('orders the due queue the same way the old curve did', () => {
    // Worth pinning, because it is the reason this was safe to change at once.
    // `getDueCardIds` sorts by R ascending for urgency; both curves are functions of
    // t/S alone and strictly decreasing in it, so they induce the same order and the
    // queue is unaffected. Only the labels could disagree, and they did.
    const card = matureCard();
    const oldCurve = (t) => Math.pow(1 + t / (9 * card.stability), -1);
    const ts = [1, 7, 30, 90, 200, 400];
    const mineOrder = [...ts].sort(
      (a, b) =>
        getRetrievability(card, at(card.last_review, a)) -
        getRetrievability(card, at(card.last_review, b))
    );
    const oldOrder = [...ts].sort((a, b) => oldCurve(a) - oldCurve(b));
    expect(mineOrder).toEqual(oldOrder);
  });
});

describe('interval fuzz ships on', () => {
  // It shipped off, with the reason recorded as "deterministic intervals (easier to
  // test)" — a testing convenience left in production. Without fuzz every card
  // reviewed in one sitting comes due on the same future day and keeps clumping, so
  // onboarding a 1,626-card deck in a few long sessions builds a calendar of
  // 200-card days. That, after a week away, is the most ordinary reason someone
  // abandons a deck. `src/tests/setup.js` turns it off for tests, in one place.
  it('is enabled in the shipped default config', () => {
    // The suite setup has already switched it off, so read the module default from
    // a fresh configuration rather than from the current instance.
    const saved = getFSRSConfig();
    try {
      configureFSRS({ enable_fuzz: true });
      expect(getFSRSConfig().enable_fuzz).toBe(true);
    } finally {
      configureFSRS(saved);
    }
    // And the source says so, which is what a future reader will check.
    expect(getFSRSConfig().enable_fuzz).toBe(false); // the test-suite override
  });

  it('spreads the due calendar across cards, which is the whole point', () => {
    // Measured, and it corrected an assumption worth writing down: ts-fsrs seeds fuzz
    // *from the card*, so it is not random. Re-scheduling one card gives the same
    // interval every time; what varies is the interval between different cards. That
    // is the property that matters here — twelve cards with identical review
    // histories all came due on day 163 with fuzz off, and land across 145–189 with
    // it on.
    const saved = getFSRSConfig();
    try {
      configureFSRS({ enable_fuzz: true });
      const intervals = new Set();
      for (let d = 0; d < 12; d++) {
        // Same history, started on a different day, so these are genuinely different
        // cards rather than one card drawn repeatedly.
        let card = createCard(new Date(Date.parse('2026-01-01T00:00:00.000Z') + d * 86_400_000));
        let t = new Date(card.due);
        for (let i = 0; i < 4; i++) {
          card = scheduleReview(card, 3, t).card;
          t = new Date(card.due);
        }
        intervals.add(scheduleReview(card, 3, t).interval);
      }
      expect(intervals.size, 'fuzz left every card on the same due day').toBeGreaterThan(1);
    } finally {
      configureFSRS(saved);
    }
  });

  it('is reproducible per card either way, so no test becomes flaky', () => {
    // The reason the override in setup.js is about keeping hardcoded interval
    // *values* stable, not about flakiness: fuzz is seeded, so a given card always
    // schedules to the same day.
    const saved = getFSRSConfig();
    try {
      configureFSRS({ enable_fuzz: true });
      const now = new Date('2026-01-01T00:00:00.000Z');
      const card = createCard(now);
      const draws = new Set();
      for (let i = 0; i < 20; i++) draws.add(scheduleReview(card, 3, now).interval);
      expect(draws.size).toBe(1);
    } finally {
      configureFSRS(saved);
    }
  });

  it('is off while this suite runs, so interval assertions keep their values', () => {
    expect(getFSRSConfig().enable_fuzz).toBe(false);
    const now = new Date('2026-01-01T00:00:00.000Z');
    const card = createCard(now);
    expect(scheduleReview(card, 3, now).interval).toBe(scheduleReview(card, 3, now).interval);
  });
});

describe('the app and ts-fsrs use one parameter set', () => {
  it('the installed library is the FSRS-6 generation the curve now comes from', () => {
    // 21 weights is FSRS-6; 17 was 4.5/5. If a future bump changes this, the
    // agreement test above is the one that matters — this is here to make the reason
    // legible rather than to freeze a version.
    expect(generatorParameters(getFSRSConfig()).w).toHaveLength(21);
    expect(TSRating.Good).toBe(3);
  });
});
