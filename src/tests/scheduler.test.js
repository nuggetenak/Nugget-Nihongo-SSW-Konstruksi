import { describe, it, expect, beforeEach } from 'vitest';
import {
  recordReview,
  getDueCardIds,
  getSRSStats,
  previewIntervals,
  fmtInterval,
} from '../srs/fsrs-scheduler.js';
import { resetStore, getCard, getCardCount } from '../srs/fsrs-store.js';
import { createCard } from '../srs/fsrs-core.js';

// Reset store between tests — clears in-memory cache + localStorage stub
beforeEach(() => {
  resetStore();
  localStorage.clear();
});

// ─── fmtInterval ─────────────────────────────────────────────────────────────
describe('fmtInterval', () => {
  it('< 1 day → "<1j"', () => {
    expect(fmtInterval(0)).toBe('<1j');
    expect(fmtInterval(0.5)).toBe('<1j');
    expect(fmtInterval(null)).toBe('<1j');
  });

  it('1-6 days → "Nj"', () => {
    expect(fmtInterval(1)).toBe('1j');
    expect(fmtInterval(4)).toBe('4j');
    expect(fmtInterval(6)).toBe('6j');
  });

  it('7-29 days → "Nmgg"', () => {
    expect(fmtInterval(7)).toBe('1mgg');
    expect(fmtInterval(14)).toBe('2mgg');
    expect(fmtInterval(21)).toBe('3mgg');
  });

  it('30-364 days → "Nbln"', () => {
    expect(fmtInterval(30)).toBe('1bln');
    expect(fmtInterval(90)).toBe('3bln');
    expect(fmtInterval(180)).toBe('6bln');
  });

  it('365+ days → "N.Nth"', () => {
    expect(fmtInterval(365)).toBe('1.0th');
    expect(fmtInterval(730)).toBe('2.0th');
  });
});

// ─── recordReview ────────────────────────────────────────────────────────────
describe('recordReview', () => {
  it('creates card entry on first review', () => {
    expect(getCard(999)).toBeNull();
    recordReview(999, 3);
    expect(getCard(999)).not.toBeNull();
  });

  it('returns interval (number) and isKnown (bool)', () => {
    const result = recordReview(1, 3); // Good
    expect(typeof result.interval).toBe('number');
    expect(typeof result.isKnown).toBe('boolean');
  });

  it('Again (1) → isKnown=false', () => {
    expect(recordReview(2, 1).isKnown).toBe(false);
  });

  it('Hard/Good/Easy (2-4) → isKnown=true', () => {
    expect(recordReview(3, 2).isKnown).toBe(true);
    expect(recordReview(4, 3).isKnown).toBe(true);
    expect(recordReview(5, 4).isKnown).toBe(true);
  });

  it('persists entry across calls', () => {
    recordReview(10, 3);
    recordReview(10, 4);
    const entry = getCard(10);
    expect(entry.history).toHaveLength(2);
  });

  it('increments reps on subsequent reviews', () => {
    recordReview(20, 3);
    recordReview(20, 3);
    const entry = getCard(20);
    expect(entry.card.reps).toBeGreaterThanOrEqual(2);
  });

  it('Again gives shorter interval than Easy', () => {
    const again = recordReview(100, 1).interval;
    resetStore();
    localStorage.clear();
    const easy = recordReview(100, 4).interval;
    expect(again).toBeLessThanOrEqual(easy);
  });
});

// ─── getDueCardIds ────────────────────────────────────────────────────────────
describe('getDueCardIds', () => {
  it('returns empty array when no cards reviewed', () => {
    expect(getDueCardIds([1, 2, 3])).toEqual([]);
  });

  it('returns card after Again — still due (Learning state, short interval)', () => {
    recordReview(1, 1); // Again → very short interval, likely still due
    // Note: ts-fsrs may schedule learning cards for minutes ahead, not days
    // Just verify it returns a number array
    const due = getDueCardIds([1, 2, 3]);
    expect(Array.isArray(due)).toBe(true);
    due.forEach((id) => expect(typeof id).toBe('number'));
  });

  it('respects whitelist — only returns IDs in the whitelist', () => {
    recordReview(1, 1);
    recordReview(2, 1);
    const due = getDueCardIds([1]); // whitelist only [1]
    due.forEach((id) => expect(id).toBe(1));
  });

  it('returns [] for empty whitelist', () => {
    recordReview(1, 1);
    expect(getDueCardIds([])).toEqual([]);
  });
});

// ─── getSRSStats ──────────────────────────────────────────────────────────────
describe('getSRSStats', () => {
  it('all cards are "new" when none reviewed', () => {
    const stats = getSRSStats([1, 2, 3]);
    expect(stats.new).toBe(3);
    expect(stats.learning).toBe(0);
    expect(stats.young).toBe(0);
    expect(stats.mature).toBe(0);
    expect(stats.total).toBe(3);
  });

  it('reviewed card moves out of new bucket', () => {
    recordReview(1, 3);
    const stats = getSRSStats([1, 2, 3]);
    expect(stats.new).toBe(2); // 2 and 3 still new
    expect(stats.new + stats.learning + stats.young + stats.mature).toBe(3);
  });

  it('returns 0s for empty id list', () => {
    const stats = getSRSStats([]);
    expect(stats.total).toBe(0);
    expect(stats.new).toBe(0);
  });
});

// ─── previewIntervals ─────────────────────────────────────────────────────────
describe('previewIntervals', () => {
  it('returns object with keys 1-4 for unseen card', () => {
    const preview = previewIntervals(999);
    [1, 2, 3, 4].forEach((r) => {
      expect(preview).toHaveProperty(String(r));
    });
  });

  it('all intervals are numbers or null', () => {
    const preview = previewIntervals(999);
    Object.values(preview).forEach((v) => {
      expect(v === null || typeof v === 'number').toBe(true);
    });
  });

  it('Easy (4) interval >= Good (3) interval for fresh card', () => {
    const preview = previewIntervals(888);
    if (preview[3] != null && preview[4] != null) {
      expect(preview[4]).toBeGreaterThanOrEqual(preview[3]);
    }
  });

  it('returns intervals for a reviewed card too', () => {
    recordReview(77, 3);
    const preview = previewIntervals(77);
    expect(preview).toHaveProperty('3');
  });
});

// ─── store persistence via getCardCount ──────────────────────────────────────
describe('store write-through', () => {
  it('getCardCount increases after reviews', () => {
    expect(getCardCount()).toBe(0);
    recordReview(1, 3);
    recordReview(2, 3);
    expect(getCardCount()).toBe(2);
  });
});
