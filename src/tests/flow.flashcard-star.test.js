// ─── tests/flow.flashcard-star.test.js ────────────────────────────────────────
// G.2 Integration: star card → persists in progress → survives re-init.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect, beforeEach } from 'vitest';
import { _reset_for_test, init, get, set } from '../storage/engine.js';

beforeEach(() => {
  localStorage.clear();
  _reset_for_test();
  init();
});

describe('G.2 Flow — Flashcard Star', () => {
  it('starred array starts empty', () => {
    expect(get('progress').starred).toEqual([]);
  });

  it('starring a card adds it to starred array', () => {
    set('progress', (p) => ({
      ...p,
      starred: [...new Set([...(p.starred || []), 42])],
    }));
    expect(get('progress').starred).toContain(42);
  });

  it('unstarring a card removes it from starred array', () => {
    set('progress', (p) => ({ ...p, starred: [10, 20, 30] }));
    set('progress', (p) => ({
      ...p,
      starred: p.starred.filter((id) => id !== 20),
    }));
    const starred = get('progress').starred;
    expect(starred).toContain(10);
    expect(starred).toContain(30);
    expect(starred).not.toContain(20);
  });

  it('starred cards persist across engine re-init', () => {
    set('progress', (p) => ({ ...p, starred: [5, 15, 25] }));
    _reset_for_test();
    init();
    expect(get('progress').starred).toEqual([5, 15, 25]);
  });

  it('starring the same card twice does not create duplicates', () => {
    set('progress', (p) => ({
      ...p,
      starred: [...new Set([...(p.starred || []), 42])],
    }));
    set('progress', (p) => ({
      ...p,
      starred: [...new Set([...(p.starred || []), 42])],
    }));
    const starred = get('progress').starred;
    expect(starred.filter((id) => id === 42).length).toBe(1);
  });
});
