// ─── tests/hesitation.test.js ────────────────────────────────────────────────
// Item 58's learner-facing half: responseMs is recorded and shown, never fed to
// FSRS. These tests pin the two properties that keep the list honest — it stays
// silent without enough data, and "slow" is measured against the learner's own
// pace rather than a constant.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect } from 'vitest';
import {
  median,
  timedReviews,
  hesitantCards,
  HESITATION_MIN_SAMPLES,
  HESITATION_RATIO,
  HESITATION_MAX_PLAUSIBLE_MS,
} from '../utils/hesitation.js';

// Build a store dict: each entry is a card id → history of [rating, ms] pairs.
function store(spec) {
  const out = {};
  for (const [id, reviews] of Object.entries(spec)) {
    out[id] = {
      card: {},
      history: reviews.map(([rating, responseMs], i) => ({
        date: `2026-09-0${i + 1}T00:00:00.000Z`,
        rating,
        ...(responseMs === undefined ? {} : { responseMs }),
      })),
    };
  }
  return out;
}

// Enough Good reviews at a steady pace to establish a baseline of `ms`.
function baseline(ms, n = HESITATION_MIN_SAMPLES) {
  const spec = {};
  for (let i = 0; i < n; i++) spec[1000 + i] = [[3, ms]];
  return spec;
}

describe('median', () => {
  it('returns null for no samples and the middle for odd counts', () => {
    expect(median([])).toBeNull();
    expect(median([5, 1, 3])).toBe(3);
  });

  it('averages the two middles for even counts', () => {
    expect(median([1, 2, 3, 4])).toBe(2.5);
  });
});

describe('timedReviews', () => {
  it('ignores entries with no responseMs — absent means "not measured", not zero', () => {
    // Every review taken before storage v7 is in this shape. Counting them as 0
    // would drag the median toward zero and make everything look like
    // hesitation.
    const s = store({
      1: [
        [3, undefined],
        [3, 4000],
      ],
    });
    expect(timedReviews(s)).toEqual([4000]);
  });

  it('drops implausibly long entries — walking away is not thinking', () => {
    const s = store({ 1: [[3, HESITATION_MAX_PLAUSIBLE_MS + 1]], 2: [[3, 3000]] });
    expect(timedReviews(s)).toEqual([3000]);
  });

  it('tolerates a missing or empty store', () => {
    expect(timedReviews()).toEqual([]);
    expect(timedReviews({ 1: {} })).toEqual([]);
  });
});

describe('hesitantCards', () => {
  it('says nothing until there are enough timed reviews to have a baseline', () => {
    const s = store({ 1: [[3, 2000]], 2: [[3, 30000]] });
    const out = hesitantCards(s);
    // Card 2 took fifteen times card 1. With two samples that is not a finding.
    expect(out.cards).toEqual([]);
    expect(out.baselineMs).toBeNull();
    expect(out.samples).toBe(2);
  });

  it('flags a correct-but-slow card once a baseline exists', () => {
    const s = store({ ...baseline(2000), 9001: [[3, 8000]] });
    const out = hesitantCards(s);
    expect(out.baselineMs).toBe(2000);
    expect(out.cards.map((c) => c.id)).toContain(9001);
    expect(out.cards.find((c) => c.id === 9001).ratio).toBe(4);
  });

  it('leaves Again and Hard alone — a slow miss is not news', () => {
    // The rating already told the learner and FSRS that this one was a
    // struggle. The list exists for the cards where nothing else shows it.
    const s = store({ ...baseline(2000), 9001: [[1, 8000]], 9002: [[2, 8000]] });
    expect(hesitantCards(s).cards).toEqual([]);
  });

  it('measures against the learner, not a constant', () => {
    // Same 8-second answer, two learners. For the slower one it is ordinary.
    const fast = hesitantCards(store({ ...baseline(2000), 9001: [[3, 8000]] }));
    const slow = hesitantCards(store({ ...baseline(9000), 9001: [[3, 8000]] }));
    expect(fast.cards.map((c) => c.id)).toEqual([9001]);
    expect(slow.cards).toEqual([]);
  });

  it('judges a card on its latest timed review, not its history', () => {
    // Laboured over once, instant now. Averaging would keep it on the list long
    // after it stopped being true.
    const s = store({
      ...baseline(2000),
      9001: [
        [3, 20000],
        [3, 1800],
      ],
    });
    expect(hesitantCards(s).cards).toEqual([]);
  });

  it('ranks worst first and honours the limit', () => {
    const s = store({
      ...baseline(2000),
      9001: [[3, 4000]],
      9002: [[3, 12000]],
      9003: [[3, 8000]],
    });
    const out = hesitantCards(s, { limit: 2 });
    expect(out.cards.map((c) => c.id)).toEqual([9002, 9003]);
  });

  it('keeps a card exactly on the ratio out of the list', () => {
    const s = store({ ...baseline(2000), 9001: [[3, 2000 * HESITATION_RATIO - 1]] });
    expect(hesitantCards(s).cards).toEqual([]);
  });
});
