// ─── tests/srs-graduation.test.js ────────────────────────────────────────────
// Does a card ever leave the learning steps?
//
// It did not, and nothing in this repo asked. `serializeCard` wrote nine of the ten
// fields ts-fsrs 5.x keeps on a Card and dropped `learning_steps` — the index of the
// step the card is on. So the round trip through localStorage reset it: the card
// advances to step 1, is written without that, and reads back as step 0 on the next
// review. Rate a card Oke, and it reschedules ten minutes out. Rate it Oke again,
// ten minutes. Twenty times, ten minutes, with stability frozen at its initial 2.31.
//
// The middle rating is the most common one, so for a learner using the app exactly
// as intended the spaced-repetition engine the whole product is built on stood
// still. Three separate external audits reviewed this file and none found it,
// because reading `serializeCard` tells you nothing is obviously missing — you have
// to rate the same card twice, which no test did.
//
// The failure mode is worth naming because it will recur: ts-fsrs is on a caret
// range, `learning_steps` arrived on the Card in a v5 release, and a hand-written
// serializer silently keeps working while dropping whatever the library added. The
// first test below is the guard against the next field.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect } from 'vitest';
import { createEmptyCard } from 'ts-fsrs';
import { createCard, scheduleReview, State } from '../srs/fsrs-core.js';

const RATING = { again: 1, hard: 2, good: 3, easy: 4 };

/** Replays `n` reviews at one rating, each taken on the day the last fell due. */
function replay(rating, n, from = '2026-01-01T00:00:00.000Z') {
  let card = createCard(new Date(from));
  let now = new Date(from);
  const trace = [];
  for (let i = 0; i < n; i++) {
    const res = scheduleReview(card, rating, now);
    card = res.card;
    now = new Date(card.due);
    trace.push({ state: card.state, stability: card.stability, interval: res.interval });
  }
  return { card, trace };
}

describe('the serialized card keeps every field the library puts on it', () => {
  it('loses nothing ts-fsrs writes', () => {
    // The guard that would have caught this on the day the dependency moved, and
    // will catch the next field the same way. A serialized card has to name every
    // key of a real one; extra keys of our own would be fine, missing ones are not.
    const real = createEmptyCard(new Date('2026-01-01T00:00:00.000Z'));
    const ours = createCard(new Date('2026-01-01T00:00:00.000Z'));
    const missing = Object.keys(real).filter((k) => !(k in ours));
    expect(
      missing,
      `serializeCard drops ${missing.join(', ')} — a dropped field is reset on every ` +
        `read, so the scheduler sees a card that never progressed`
    ).toEqual([]);
  });

  it('survives a round trip with its learning step intact', () => {
    const { card } = replay(RATING.good, 1);
    expect(card.learning_steps).toBe(1); // advanced, and written down
  });
});

describe('a card rated Oke graduates', () => {
  it('reaches the Review state rather than repeating ten-minute steps', () => {
    const { card, trace } = replay(RATING.good, 4);
    expect(card.state).toBe(State.Review);
    // Before the fix every one of these was state=Learning, interval 0, S=2.31.
    expect(trace.at(-1).interval).toBeGreaterThan(7);
  });

  it('grows its stability instead of freezing at the initial value', () => {
    const { trace } = replay(RATING.good, 4);
    const initial = trace[0].stability;
    expect(trace.at(-1).stability).toBeGreaterThan(initial * 5);
  });

  it('does not come back the same day after four correct reviews', () => {
    // The learner-facing statement of the bug: this is what "the SRS works" means.
    const { card } = replay(RATING.good, 4);
    const days = (Date.parse(card.due) - Date.parse(card.last_review)) / 86_400_000;
    expect(days).toBeGreaterThan(1);
  });

  it('keeps lengthening the interval as reviews accumulate', () => {
    const { trace } = replay(RATING.good, 5);
    const intervals = trace.map((t) => t.interval);
    for (let i = 2; i < intervals.length; i++) {
      expect(intervals[i], `interval ${i} did not grow: ${intervals.join(', ')}`).toBeGreaterThan(
        intervals[i - 1]
      );
    }
  });
});

describe('the other ratings behave as ts-fsrs intends', () => {
  it('Mudah graduates immediately, skipping the learning steps', () => {
    const { card, trace } = replay(RATING.easy, 1);
    expect(card.state).toBe(State.Review);
    expect(trace[0].interval).toBeGreaterThan(1);
  });

  it('Susah holds the card on its current learning step', () => {
    // Not a bug and deliberately pinned: Hard repeats the step rather than advancing,
    // which is the library's own behaviour and the reason a "stuck on step 0" trace
    // is not by itself evidence of the defect above.
    const { card } = replay(RATING.hard, 4);
    expect(card.state).toBe(State.Learning);
    expect(card.learning_steps).toBe(0);
  });

  it('Lagi on a graduated card sends it to Relearning, not back to New', () => {
    const card = replay(RATING.good, 4).card;
    const res = scheduleReview(card, RATING.again, new Date(card.due));
    expect(res.card.state).toBe(State.Relearning);
    expect(res.card.lapses).toBe(1);
  });
});

describe('cards written before the fix still load', () => {
  it('an entry with no learning_steps is read as step 0, not as undefined', () => {
    // Every card in every existing install is missing the field. Defaulting on read
    // is what keeps this off the migration chain: 0 is correct for anything already
    // in Review, and a card caught mid-Learning repeats one ten-minute step.
    const legacy = {
      due: '2026-02-01T00:00:00.000Z',
      stability: 46.3,
      difficulty: 2.1,
      elapsed_days: 46,
      scheduled_days: 46,
      reps: 4,
      lapses: 0,
      state: State.Review,
      last_review: '2025-12-17T00:00:00.000Z',
    };
    const res = scheduleReview(legacy, RATING.good, new Date('2026-02-01T00:00:00.000Z'));
    expect(res.card.state).toBe(State.Review);
    expect(res.card.learning_steps).toBe(0);
    expect(res.interval).toBeGreaterThan(46);
  });
});
