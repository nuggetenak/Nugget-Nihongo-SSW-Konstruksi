// ─── tests/use-scoped-deck.test.jsx ──────────────────────────────────────────
// UI_UX_PLAN item 118. The invariant is referential stability, and it is tested
// here rather than through FlashcardMode on purpose: when this breaks, the
// component re-renders without bound, and rendering it hangs the test runner
// instead of failing it. A hook test fails in milliseconds and cannot stall CI.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useScopedDeck } from '../modes/FlashcardMode/use-scoped-deck.js';

const CARDS = [
  { id: 1, jp: 'a' },
  { id: 2, jp: 'b' },
  { id: 3, jp: 'c' },
];

describe('useScopedDeck', () => {
  it('returns the same reference across re-renders with unchanged inputs', () => {
    const ids = [1, 3];
    const { result, rerender } = renderHook(({ c, f }) => useScopedDeck(c, f), {
      initialProps: { c: CARDS, f: ids },
    });
    const first = result.current;
    rerender({ c: CARDS, f: ids });
    rerender({ c: CARDS, f: ids });
    // This is the whole bug: `cards.filter(...)` inline handed back a new array
    // every render, and the effect keyed on it reset the card and the index
    // before the next paint.
    expect(result.current).toBe(first);
  });

  it('hands back the deck itself, not a copy, when unfiltered', () => {
    const { result } = renderHook(() => useScopedDeck(CARDS, null));
    expect(result.current).toBe(CARDS);
  });

  it('scopes to the ids given, in deck order', () => {
    const { result } = renderHook(() => useScopedDeck(CARDS, [3, 1]));
    expect(result.current.map((c) => c.id)).toEqual([1, 3]);
  });

  it('recomputes when the filter changes', () => {
    const { result, rerender } = renderHook(({ f }) => useScopedDeck(CARDS, f), {
      initialProps: { f: [1] },
    });
    const first = result.current;
    rerender({ f: [2] });
    expect(result.current).not.toBe(first);
    expect(result.current.map((c) => c.id)).toEqual([2]);
  });

  it('returns an empty deck when nothing matches, without throwing', () => {
    const { result } = renderHook(() => useScopedDeck(CARDS, [999]));
    expect(result.current).toEqual([]);
  });
});
