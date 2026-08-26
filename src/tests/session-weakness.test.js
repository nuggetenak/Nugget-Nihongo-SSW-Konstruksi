// ─── tests/session-weakness.test.js ───────────────────────────────────────────
// findWeakestCategory (item 57) — grouping, the 2-minimum threshold, missing
// category data, and the two lookup paths (.category direct vs .cardId).
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { findWeakestCategory } from '../utils/session-weakness.js';
import { CARDS } from '../data/cards.js';
import { CATEGORIES } from '../data/categories.js';

// Use real category keys from the data so the meta lookup succeeds.
const realCat = CATEGORIES.find((c) => c.key !== 'all')?.key;
const otherCat = CATEGORIES.find((c) => c.key !== 'all' && c.key !== realCat)?.key;
const realCardInCat = CARDS.find((c) => c.category === realCat);

describe('findWeakestCategory', () => {
  it('returns null for an empty or missing array', () => {
    expect(findWeakestCategory([])).toBeNull();
    expect(findWeakestCategory(undefined)).toBeNull();
    expect(findWeakestCategory(null)).toBeNull();
  });

  it('returns null when only one wrong answer lands in a category (not a pattern)', () => {
    expect(findWeakestCategory([{ category: realCat }])).toBeNull();
  });

  it('finds the category with 2+ wrong answers via direct .category', () => {
    const result = findWeakestCategory([
      { category: realCat },
      { category: realCat },
      { category: otherCat },
    ]);
    expect(result).not.toBeNull();
    expect(result.key).toBe(realCat);
    expect(result.count).toBe(2);
  });

  it('resolves category via .cardId when .category is absent', () => {
    if (!realCardInCat) return; // skip if fixture data is empty (shouldn't happen)
    const result = findWeakestCategory([
      { cardId: realCardInCat.id },
      { cardId: realCardInCat.id },
    ]);
    expect(result?.key).toBe(realCat);
  });

  it('skips records with neither .category nor a resolvable .cardId', () => {
    const result = findWeakestCategory([
      { cardId: 'not-a-real-card-id' },
      { cardId: 'also-not-real' },
      { category: realCat },
      { category: realCat },
    ]);
    expect(result?.key).toBe(realCat);
  });

  it('picks the category with the most wrong answers when several qualify', () => {
    const result = findWeakestCategory([
      { category: realCat },
      { category: realCat },
      { category: otherCat },
      { category: otherCat },
      { category: otherCat },
    ]);
    expect(result.key).toBe(otherCat);
    expect(result.count).toBe(3);
  });

  it('includes label and emoji from CATEGORIES metadata', () => {
    const meta = CATEGORIES.find((c) => c.key === realCat);
    const result = findWeakestCategory([{ category: realCat }, { category: realCat }]);
    expect(result.label).toBe(meta.label);
    expect(result.emoji).toBe(meta.emoji);
  });
});
