// ─── tests/useTrackedCards.test.jsx ──────────────────────────────────────────
// useTrackedCards hook tests.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { createElement } from 'react';
import { _reset_for_test } from '../storage/engine.js';
import { ProgressProvider } from '../contexts/ProgressContext.jsx';
import { useTrackedCards } from '../hooks/useTrackedCards.js';

beforeEach(() => {
  localStorage.clear();
  _reset_for_test();
});

const wrapper = ({ children }) => createElement(ProgressProvider, null, children);

describe('useTrackedCards', () => {
  it('returns cards for lifeline track', () => {
    const { result } = renderHook(() => useTrackedCards({ track: 'lifeline' }), { wrapper });
    expect(result.current.length).toBeGreaterThan(0);
    expect(result.current.every((c) => typeof c.id === 'number')).toBe(true);
  });

  it('returns empty array for a removed track (doboku/kenchiku no longer exist)', () => {
    const { result } = renderHook(() => useTrackedCards({ track: 'doboku' }), { wrapper });
    expect(result.current).toHaveLength(0);
  });

  // Item 69: `excludeVocab` is gone. It was an option no component ever passed,
  // over a distinction — "vocabulary list" against "chapter content" — that
  // stopped existing when 7.0.0 made one card one term. An unknown option must
  // be ignored rather than silently narrowing the deck.
  it('ignores an option it does not have, rather than filtering on it', () => {
    const all = renderHook(() => useTrackedCards({ track: 'lifeline' }), { wrapper }).result
      .current;
    const withDeadOption = renderHook(
      () => useTrackedCards({ track: 'lifeline', excludeVocab: true }),
      { wrapper }
    ).result.current;
    expect(withDeadOption).toHaveLength(all.length);
  });

  it('returns empty array for category with no cards', () => {
    const { result } = renderHook(
      () => useTrackedCards({ track: 'lifeline', category: 'nonexistent' }),
      { wrapper }
    );
    expect(result.current).toHaveLength(0);
  });

  it('returns empty array for unknown track', () => {
    const { result } = renderHook(() => useTrackedCards({ track: 'unknowntrack' }), { wrapper });
    expect(result.current).toHaveLength(0);
  });

  it('source filter narrows results', () => {
    // Get all lifeline cards to find a valid source
    const all = renderHook(() => useTrackedCards({ track: 'lifeline' }), { wrapper }).result
      .current;
    if (all.length === 0) return; // guard: no cards in env
    const validSource = all[0].source;
    const bySource = renderHook(() => useTrackedCards({ track: 'lifeline', source: validSource }), {
      wrapper,
    }).result.current;
    expect(bySource.length).toBeGreaterThan(0);
    expect(bySource.length).toBeLessThanOrEqual(all.length);
    expect(bySource.every((c) => c.source === validSource)).toBe(true);
  });

  it('returns an array of valid card objects', () => {
    const { result } = renderHook(() => useTrackedCards({ track: 'lifeline' }), { wrapper });
    const cards = result.current;
    expect(Array.isArray(cards)).toBe(true);
    if (cards.length > 0) {
      const sample = cards[0];
      expect(sample).toHaveProperty('id');
      expect(sample).toHaveProperty('category');
      expect(sample).toHaveProperty('source');
    }
  });
});
