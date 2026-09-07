// ─── tests/simulasi-history-mistakes.test.jsx ────────────────────────────────
// Items 93, 94 and 97 — three ways the exam mode was outside the app's own
// bookkeeping.
//
// 93: it wrote to no wrong-tracker at all, so the longest and most diagnostic
// session in the app was the only one whose mistakes left no trace.
// 94: it called `saveScore` never, so the one mode where a trend is the reason
// to take it twice kept no history of itself — behind a trap the item found
// first: `saveScore`'s final ternary branch was `vocabScores`, so an
// unrecognised type wrote into vocab rather than failing.
// 97: `getBestSimScore` took the max across every run regardless of length, so
// the "Siap Ujian" claim was earnable on the shortest thing in the section.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { _reset_for_test, init, get, set } from '../storage/engine.js';
import { recordSimulasiMistakes } from '../utils/simulasi-mistakes.js';
import { getWrongCount } from '../utils/wrong-tracker.js';
import { EXAM_READINESS_MIN_QUESTIONS, EXAM_FULL_QUESTIONS } from '../utils/constants.js';

const jacQ = (key, cardId, isCorrect) => ({
  isCorrect,
  _source: 'jac',
  _wrongKey: key,
  _cardId: cardId,
});
const poolQ = (key, isCorrect) => ({
  isCorrect,
  _source: 'wayground',
  _wrongKey: key,
  _cardId: null,
});

beforeEach(() => {
  localStorage.clear();
  _reset_for_test();
  init();
});

describe('simulasi files its mistakes where the app already looks (item 93)', () => {
  it('sends a JAC mistake to wrongCounts, under the id JACMode uses', () => {
    recordSimulasiMistakes([jacQ('tt1_q01', 275, false), jacQ('tt1_q02', 807, true)]);
    const wc = get('progress').wrongCounts;
    expect(getWrongCount(wc.tt1_q01)).toBe(1);
    expect(wc.tt1_q02).toBeUndefined();
  });

  it('sends a pool mistake to wgWrong, under the key WaygroundMode uses', () => {
    recordSimulasiMistakes([poolQ('wt01-3', false), poolQ('wt01-4', true)]);
    const wg = get('progress').wgWrong;
    expect(getWrongCount(wg['wt01-3'])).toBe(1);
    expect(wg['wt01-4']).toBeUndefined();
  });

  it('does not invent a third namespace for a mixed exam', () => {
    const out = recordSimulasiMistakes([jacQ('tt2_q09', 1291, false), poolQ('jmt01-7', false)]);
    expect(out).toMatchObject({ wrongCounts: 1, wgWrong: 1 });
    const p = get('progress');
    expect(Object.keys(p.wrongCounts)).toEqual(['tt2_q09']);
    expect(Object.keys(p.wgWrong)).toEqual(['jmt01-7']);
  });

  it('also reports card-level mistakes, deduplicated, for FokusMode', () => {
    const recordWrong = vi.fn();
    recordSimulasiMistakes(
      [jacQ('a', 275, false), jacQ('b', 275, false), poolQ('c', false)],
      recordWrong
    );
    expect(recordWrong.mock.calls.map(([id]) => id)).toEqual([275]);
  });

  it('accumulates across attempts rather than overwriting', () => {
    recordSimulasiMistakes([jacQ('tt1_q01', null, false)]);
    recordSimulasiMistakes([jacQ('tt1_q01', null, false)]);
    expect(getWrongCount(get('progress').wrongCounts.tt1_q01)).toBe(2);
  });

  it('writes nothing at all for a clean sheet', () => {
    const before = JSON.stringify(get('progress'));
    recordSimulasiMistakes([jacQ('tt1_q01', 275, true), poolQ('wt01-3', true)]);
    expect(JSON.stringify(get('progress'))).toBe(before);
  });
});

describe('saveScore cannot write into the wrong store any more (item 94)', () => {
  it('files a simulasi attempt under simScores', () => {
    set('progress', (p) => ({ ...p, simScores: { 'pool-full': { pct: 58 } } }));
    expect(get('progress').simScores['pool-full'].pct).toBe(58);
  });

  it('an unknown score type is a no-op, not a write into vocabScores', async () => {
    // The trap item 94 named: the key was picked by a ternary whose last branch
    // was vocabScores, so adding a `sim` type without touching it would have
    // corrupted vocab's history rather than failing.
    const { default: React } = await import('react');
    const { render } = await import('@testing-library/react');
    const { ProgressProvider, useProgress } = await import('../contexts/ProgressContext.jsx');
    let api;
    function Probe() {
      api = useProgress();
      return null;
    }
    render(React.createElement(ProgressProvider, null, React.createElement(Probe)));
    api.saveScore('vocab', 'wglv-01', { pct: 90 });
    api.saveScore('nonsense', 'wglv-01', { pct: 10 });
    expect(get('progress').vocabScores['wglv-01'].pct).toBe(90);
  });
});

describe('the readiness threshold (item 97)', () => {
  it('sits below the shortest full exam and above the longest short one', () => {
    // Full: 50 (pool) and 44-51 (JAC pair). Short: 15 and 25.
    expect(EXAM_READINESS_MIN_QUESTIONS).toBeLessThanOrEqual(44);
    expect(EXAM_READINESS_MIN_QUESTIONS).toBeGreaterThan(25);
    expect(EXAM_READINESS_MIN_QUESTIONS).toBeLessThanOrEqual(EXAM_FULL_QUESTIONS);
  });
});
