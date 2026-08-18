// ─── tests/useTrackedCards.test.jsx ──────────────────────────────────────────
// useTrackedCards hook tests.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { createElement } from 'react';
import { _reset_for_test } from '../storage/engine.js';
import { ProgressProvider } from '../contexts/ProgressContext.jsx';
import { useTrackedCards } from '../hooks/useTrackedCards.js';
import { VOCAB_SOURCES } from '../data/categories.js';

beforeEach(() => {
  localStorage.clear();
  _reset_for_test();
});

const wrapper = ({ children }) => createElement(ProgressProvider, null, children);

describe('useTrackedCards', () => {
  it('returns cards for lifeline track', () => {
    const { result } = renderHook(() => useTrackedCards({ track: 'lifeline' }), { wrapper });
    expect(result.current.length).toBeGreaterThan(0);
    expect(result.current.every(c => typeof c.id === 'number')).toBe(true);
  });

  it('returns empty array for a removed track (doboku/kenchiku no longer exist)', () => {
    const { result } = renderHook(() => useTrackedCards({ track: 'doboku' }), { wrapper });
    expect(result.current).toHaveLength(0);
  });

  it('excludeVocab filters out vocab sources', () => {
    const all = renderHook(() => useTrackedCards({ track: 'lifeline' }), { wrapper }).result.current;
    const noVocab = renderHook(() => useTrackedCards({ track: 'lifeline', excludeVocab: true }), { wrapper }).result.current;
    expect(noVocab.length).toBeLessThanOrEqual(all.length);
    expect(noVocab.every(c => !VOCAB_SOURCES.includes(c.source))).toBe(true);
  });

  it('returns empty array for category with no cards', () => {
    const { result } = renderHook(() => useTrackedCards({ track: 'lifeline', category: 'nonexistent' }), { wrapper });
    expect(result.current).toHaveLength(0);
  });

  it('returns empty array for unknown track', () => {
    const { result } = renderHook(() => useTrackedCards({ track: 'unknowntrack' }), { wrapper });
    expect(result.current).toHaveLength(0);
  });

  it('source filter narrows results', () => {
    // Get all lifeline cards to find a valid source
    const all = renderHook(() => useTrackedCards({ track: 'lifeline' }), { wrapper }).result.current;
    if (all.length === 0) return; // guard: no cards in env
    const validSource = all[0].source;
    const bySource = renderHook(() => useTrackedCards({ track: 'lifeline', source: validSource }), { wrapper }).result.current;
    expect(bySource.length).toBeGreaterThan(0);
    expect(bySource.length).toBeLessThanOrEqual(all.length);
    expect(bySource.every(c => c.source === validSource)).toBe(true);
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
