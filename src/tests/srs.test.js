import { describe, it, expect, beforeEach } from 'vitest';
import {
  createCard,
  scheduleReview,
  isDue,
  getStrength,
  getStateLabel,
  ratingToKnown,
  RATING_META,
} from '../srs/fsrs-core.js';

describe('createCard', () => {
  it('returns a serialized card object', () => {
    const card = createCard();
    expect(card).toBeDefined();
    expect(typeof card).toBe('object');
  });

  it('new card has state=0 (New)', () => {
    const card = createCard();
    expect(card.state).toBe(0);
  });
});

describe('scheduleReview', () => {
  let freshCard;
  beforeEach(() => {
    freshCard = createCard();
  });

  it('returns { card, interval, state }', () => {
    const result = scheduleReview(freshCard, 3); // Good
    expect(result.card).toBeDefined();
    expect(typeof result.interval).toBe('number');
    expect(result.state).toBeDefined();
  });

  it('Again gives shorter or equal interval than Good', () => {
    const again = scheduleReview(freshCard, 1);
    const good = scheduleReview(freshCard, 3);
    expect(again.interval).toBeLessThanOrEqual(good.interval);
  });

  it('Easy gives longer or equal interval than Good', () => {
    const good = scheduleReview(freshCard, 3);
    const easy = scheduleReview(freshCard, 4);
    expect(easy.interval).toBeGreaterThanOrEqual(good.interval);
  });
});

describe('isDue', () => {
  it('new card is due', () => {
    expect(isDue(createCard())).toBe(true);
  });

  it('card just reviewed Good is not immediately due', () => {
    const card = createCard();
    const { card: reviewed } = scheduleReview(card, 3);
    expect(isDue(reviewed)).toBe(false);
  });
});

describe('ratingToKnown — Crunchy implementation: Hard>=2 is known', () => {
  it('Again (1) → not known', () => expect(ratingToKnown(1)).toBe(false));
  it('Hard (2) → known (Crunchy threshold: rating >= Hard)', () =>
    expect(ratingToKnown(2)).toBe(true));
  it('Good (3) → known', () => expect(ratingToKnown(3)).toBe(true));
  it('Easy (4) → known', () => expect(ratingToKnown(4)).toBe(true));
});

describe('getStrength', () => {
  it('returns object with label, color, level', () => {
    const s = getStrength(createCard());
    expect(s).toHaveProperty('label');
    expect(s).toHaveProperty('color');
    expect(s).toHaveProperty('level');
  });

  it('new card has level="new"', () => {
    expect(getStrength(createCard()).level).toBe('new');
  });

  it('reviewed card has non-new level', () => {
    const card = createCard();
    const { card: reviewed } = scheduleReview(card, 3);
    const strength = getStrength(reviewed);
    expect(strength.level).not.toBe('new');
  });
});

describe('RATING_META', () => {
  it('has entries for ratings 1-4', () => {
    [1, 2, 3, 4].forEach((r) => {
      expect(RATING_META[r]).toBeDefined();
    });
  });
});

describe('getStateLabel', () => {
  it('new card returns "Baru"', () => {
    expect(getStateLabel(createCard())).toBe('Baru');
  });
});
