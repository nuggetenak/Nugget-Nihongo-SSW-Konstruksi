// ─── tests/flow.export-import.test.js ────────────────────────────────────────
// G.2 Integration: full export → import cycle — all 3 docs match.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect, beforeEach } from 'vitest';
import { _reset_for_test, init, get, set, exportAll, importAllSafe } from '../storage/engine.js';

beforeEach(() => {
  localStorage.clear();
  _reset_for_test();
  init();
});

describe('G.2 Flow — export → import cycle', () => {
  it('exported snapshot re-imports to identical state', () => {
    // Set up meaningful state
    set('progress', (p) => ({
      ...p,
      known: [1, 2, 3, 42, 99],
      unknown: [5, 6],
      starred: [42],
      quizWrong: { 5: { count: 3, lastWrong: 12345 } },
      streakData: { days: 5, lastDate: '2026-04-30' },
      sessions: [
        { mode: 'kuis', correct: 8, total: 10, date: '2026-05-01', durationMs: 5000 },
      ],
    }));
    set('prefs', (p) => ({ ...p, track: 'doboku', dailyGoal: 30, examDate: '2026-12-01' }));
    set('srs', (s) => ({ ...s, cards: { '42': { state: 2, stability: 1.5 } } }));

    // Export
    const snap = exportAll();
    expect(snap._storage_version).toBe(3);

    // Reset to empty
    set('progress', (p) => ({ ...p, known: [], sessions: [] }));
    set('prefs', (p) => ({ ...p, track: null, examDate: null }));
    set('srs', (s) => ({ ...s, cards: {} }));

    // Import
    const summary = importAllSafe(snap);
    expect(summary.known).toBe(5);
    expect(summary.srsCards).toBe(1);

    // Verify all docs restored
    const prog  = get('progress');
    const prefs = get('prefs');
    const srs   = get('srs');

    expect(prog.known).toEqual([1, 2, 3, 42, 99]);
    expect(prog.unknown).toEqual([5, 6]);
    expect(prog.starred).toEqual([42]);
    expect(prog.sessions.length).toBe(1);
    expect(prefs.track).toBe('doboku');
    expect(prefs.dailyGoal).toBe(30);
    expect(prefs.examDate).toBe('2026-12-01');
    expect(srs.cards['42'].state).toBe(2);
  });

  it('importAllSafe rolls back on corrupt snapshot', () => {
    set('progress', (p) => ({ ...p, known: [7, 8, 9] }));
    const beforeKnown = get('progress').known;

    // Corrupt snapshot — missing srs doc
    const badSnap = {
      _storage_version: 3,
      progress: { _v: 3, known: [1], unknown: [], starred: [] },
      prefs: { _v: 3 },
      // srs missing
    };
    expect(() => importAllSafe(badSnap)).toThrow();

    // State must be unchanged after failed import
    expect(get('progress').known).toEqual(beforeKnown);
  });
});
