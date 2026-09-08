// ─── tests/mistake-bridge.test.js ────────────────────────────────────────────
// UI_UX_PLAN items 127, 128 and 129 — three ways a wrong answer went nowhere.
//
// The app has one card-level wrong-answer store, `progress.quizWrong`, and it
// is what FokusMode's "Latih kelemahan" and StatsMode's per-category weakness
// view are built on. Nobody owned the route into it, so:
//
//   127 — ConfusionMode recorded nothing anywhere.
//   128 — Wayground, Vocab and JAC recorded only into their own per-set stores,
//         so a card missed in the app's largest question bank never reached
//         Fokus or Stats, while the identical question missed inside simulasi
//         did. The same mistake counted or did not depending on the screen.
//   129 — DangerMode wrote `danger-<term>` string keys into the card-keyed
//         store: inert in one reader, a `NaN` property in the other.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { init, get, _reset_for_test } from '../storage/engine.js';
import {
  cardIdForTerm,
  recordTermMistake,
  _reset_index_for_test,
} from '../utils/mistake-bridge.js';
import { CARDS } from '../data/cards.js';
import { DANGER_PAIRS } from '../data/danger-pairs.js';

beforeEach(() => {
  localStorage.clear();
  _reset_for_test();
  _reset_index_for_test();
  init();
});

describe('cardIdForTerm', () => {
  it('resolves a term that is a card, ignoring furigana spelling', () => {
    const card = CARDS.find((c) => c.jp.includes('《'));
    expect(cardIdForTerm(card.jp)).toBe(card.id);
  });

  it('returns null for a term the corpus does not carry', () => {
    expect(cardIdForTerm('存在しない用語ですよ')).toBeNull();
    expect(cardIdForTerm('')).toBeNull();
    expect(cardIdForTerm(undefined)).toBeNull();
  });

  it('resolves the DangerMode terms that are cards, and only those', () => {
    const resolved = DANGER_PAIRS.filter((p) => cardIdForTerm(p.term) !== null);
    // Measured 2026-09-08. Both halves of the bridge are load-bearing precisely
    // because this is neither 0 nor 20 — a card-only design would drop half.
    expect(resolved.length).toBeGreaterThan(0);
    expect(resolved.length).toBeLessThan(DANGER_PAIRS.length);
  });
});

describe('recordTermMistake', () => {
  it('sends a term that is a card to the card store', () => {
    const card = CARDS[0];
    const recordWrong = vi.fn();
    expect(recordTermMistake(card.jp, recordWrong)).toBe('card');
    expect(recordWrong).toHaveBeenCalledWith(card.id);
    // And nothing invented alongside it.
    expect(get('progress').termWrong ?? {}).toEqual({});
  });

  it('sends a term with no card to termWrong, not to the card store', () => {
    const recordWrong = vi.fn();
    expect(recordTermMistake('免振《めんしん》 vs 制振《せいしん》', recordWrong)).toBe('term');
    expect(recordWrong).not.toHaveBeenCalled();
    const stored = get('progress').termWrong;
    expect(Object.keys(stored)).toHaveLength(1);
    // Keyed by the stripped term — never `danger-<term>` in quizWrong.
    expect(Object.keys(stored)[0]).not.toMatch(/^danger-/);
    expect(get('progress').quizWrong ?? {}).toEqual({});
  });

  it('tallies repeats rather than overwriting them', () => {
    const term = '免振《めんしん》 vs 制振《せいしん》';
    recordTermMistake(term);
    recordTermMistake(term);
    const entry = Object.values(get('progress').termWrong)[0];
    expect(entry.count).toBe(2);
  });
});

describe('recordWrong refuses a non-card id', () => {
  it('drops a string key instead of storing it', async () => {
    const { renderHook, act } = await import('@testing-library/react');
    const { ProgressProvider, useProgress } = await import('../contexts/ProgressContext.jsx');
    const { result } = renderHook(() => useProgress(), { wrapper: ProgressProvider });

    act(() => result.current.recordWrong('danger-短絡'));
    act(() => result.current.recordWrong(undefined));
    act(() => result.current.recordWrong(1.5));
    expect(get('progress').quizWrong ?? {}).toEqual({});

    act(() => result.current.recordWrong(42));
    expect(Object.keys(get('progress').quizWrong)).toEqual(['42']);
  });
});

describe('the card-id space is held at the writer', () => {
  it('every quiz mode that grades an answer routes it somewhere', () => {
    // A source check, not a render: these five modes each hold their own answer
    // handler, and the defect in all three items was an omission rather than a
    // wrong call. This is the guard that would have failed on day one.
    const GRADING_MODES = {
      'WaygroundMode.jsx': 'recordWrong',
      'VocabMode.jsx': 'recordWrong',
      'JACMode.jsx': 'recordWrong',
      'QuizMode.jsx': 'recordWrong',
      'DengarMode.jsx': 'recordWrong',
      'ConfusionMode.jsx': 'recordTermMistake',
      'DangerMode.jsx': 'recordTermMistake',
      'SimulasiMode.jsx': 'recordSimulasiMistakes',
    };
    for (const [file, needle] of Object.entries(GRADING_MODES)) {
      const src = readFileSync(resolve(process.cwd(), 'src/modes', file), 'utf8');
      expect(src.includes(needle), `${file} never calls ${needle}`).toBe(true);
    }
  });

  it('no mode passes a non-card key to recordWrong', () => {
    // Item 129's exact shape: a template literal into the card-keyed store.
    for (const file of ['DangerMode.jsx', 'ConfusionMode.jsx', 'DengarMode.jsx', 'QuizMode.jsx']) {
      const src = readFileSync(resolve(process.cwd(), 'src/modes', file), 'utf8');
      expect(src, `${file} builds a string key for recordWrong`).not.toMatch(/recordWrong\(\s*`/);
    }
  });
});
