// ─── tests/overhaul1-eng4-eng6.test.js ───────────────────────────────────────
// OVERHAUL-1: verify usePersistedState retired — no legacy ssw-quiz-wrong direct writes
// ENG-4: WaygroundMode getSetWrongCount reads from engine (progress.wgWrong)
// ENG-6: engine exportAll includes quizWrong + wgWrong in progress doc
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect, beforeEach } from 'vitest';
import { _reset_for_test, init, get, set as engineSet, exportAll } from '../storage/engine.js';
import { makeWrongEntry } from '../utils/wrong-tracker.js';

beforeEach(() => {
  localStorage.clear();
  _reset_for_test();
});

// ── OVERHAUL-1 ───────────────────────────────────────────────────────────────

describe('OVERHAUL-1 — usePersistedState retired', () => {
  it('usePersistedState.js file no longer exists in hooks barrel', async () => {
    // hooks/index.js should not export usePersistedState
    const hooks = await import('../hooks/index.js');
    expect(hooks.usePersistedState).toBeUndefined();
  });

  it('quizWrong is stored in engine progress doc (not legacy ssw-quiz-wrong key)', () => {
    init();
    // Simulate recordWrong path: engine writes to progress.quizWrong
    engineSet('progress', (p) => ({
      ...p,
      quizWrong: { ...p.quizWrong, 'jac-ch1-001': makeWrongEntry(undefined) },
    }));
    const prog = get('progress');
    expect(prog.quizWrong['jac-ch1-001']).toBeDefined();
    expect(prog.quizWrong['jac-ch1-001'].count).toBe(1);
    // Legacy key should NOT be written
    expect(localStorage.getItem('ssw-quiz-wrong')).toBeNull();
  });

  it('multiple recordWrong calls accumulate in engine progress.quizWrong', () => {
    init();
    engineSet('progress', (p) => ({
      ...p,
      quizWrong: { ...p.quizWrong, 'jac-ch1-002': makeWrongEntry(undefined) },
    }));
    engineSet('progress', (p) => ({
      ...p,
      quizWrong: { ...p.quizWrong, 'jac-ch1-002': makeWrongEntry(p.quizWrong['jac-ch1-002']) },
    }));
    expect(get('progress').quizWrong['jac-ch1-002'].count).toBe(2);
  });
});

// ── ENG-4 ────────────────────────────────────────────────────────────────────

describe('ENG-4 — WaygroundMode getSetWrongCount reads from engine', () => {
  it('wgWrong stored in progress doc keyed as setId-qId', () => {
    init();
    engineSet('progress', (p) => ({
      ...p,
      wgWrong: {
        ...p.wgWrong,
        'wt001-q1': makeWrongEntry(undefined),
        'wt001-q2': makeWrongEntry(undefined),
        'wt002-q1': makeWrongEntry(undefined),
      },
    }));
    const wgWrong = get('progress').wgWrong;
    // Count for set 'wt001': 2 entries
    const setId = 'wt001';
    const prefix = `${setId}-`;
    const count = Object.entries(wgWrong)
      .filter(([k]) => k.startsWith(prefix))
      .filter(([, v]) => v.count > 0).length;
    expect(count).toBe(2);
  });

  it('getSetWrongCount is isolated per setId prefix', () => {
    init();
    engineSet('progress', (p) => ({
      ...p,
      wgWrong: {
        'wt001-q1': makeWrongEntry(undefined),
        'wt002-q1': makeWrongEntry(undefined),
        'wt002-q2': makeWrongEntry(undefined),
      },
    }));
    const wgWrong = get('progress').wgWrong;
    const countFor = (setId) => {
      const prefix = `${setId}-`;
      return Object.entries(wgWrong)
        .filter(([k]) => k.startsWith(prefix))
        .filter(([, v]) => v.count > 0).length;
    };
    expect(countFor('wt001')).toBe(1);
    expect(countFor('wt002')).toBe(2);
    expect(countFor('wt003')).toBe(0);
  });
});

// ── ENG-6 ────────────────────────────────────────────────────────────────────

describe('ENG-6 — exportAll captures quizWrong + wgWrong', () => {
  it('exportAll includes progress.quizWrong', () => {
    init();
    engineSet('progress', (p) => ({
      ...p,
      quizWrong: { 'jac-ch1-010': makeWrongEntry(undefined) },
    }));
    const snap = exportAll();
    expect(snap.progress.quizWrong).toBeDefined();
    expect(Object.keys(snap.progress.quizWrong).length).toBe(1);
  });

  it('exportAll includes progress.wgWrong', () => {
    init();
    engineSet('progress', (p) => ({
      ...p,
      wgWrong: { 'wt001-q1': makeWrongEntry(undefined) },
    }));
    const snap = exportAll();
    expect(snap.progress.wgWrong).toBeDefined();
    expect(Object.keys(snap.progress.wgWrong).length).toBe(1);
  });

  it('exportAll captures jacScores and wgScores', () => {
    init();
    engineSet('progress', (p) => ({
      ...p,
      jacScores: { 'set-jac-1': { score: 8, total: 10, pct: 80 } },
      wgScores: { wt001: { correct: 5, total: 10 } },
    }));
    const snap = exportAll();
    expect(snap.progress.jacScores['set-jac-1'].pct).toBe(80);
    expect(snap.progress.wgScores['wt001'].correct).toBe(5);
  });

  it('round-trip export/import preserves quizWrong and wgWrong', () => {
    const { importAllSafe } = require('../storage/engine.js');
    init();
    engineSet('progress', (p) => ({
      ...p,
      quizWrong: { 'jac-ch2-005': makeWrongEntry(undefined) },
      wgWrong: { 'wt001-q3': makeWrongEntry(undefined) },
    }));
    const snap = exportAll();
    _reset_for_test();
    localStorage.clear();
    importAllSafe(snap);
    const prog = get('progress');
    expect(prog.quizWrong['jac-ch2-005'].count).toBe(1);
    expect(prog.wgWrong['wt001-q3'].count).toBe(1);
  });
});
