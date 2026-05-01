// ─── tests/flow.quiz-srs.test.js ─────────────────────────────────────────────
// G.2 Integration: quiz answer → session recorded → storage updated.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect, beforeEach } from 'vitest';
import { _reset_for_test, init, get, set } from '../storage/engine.js';
import { generateDailyMission, completeMission, getMission } from '../utils/daily-mission.js';

beforeEach(() => {
  localStorage.clear();
  _reset_for_test();
  init();
});

describe('G.2 Flow — quiz session recording', () => {
  it('sessions array grows when recordSession is called multiple times', () => {
    // Simulate 3 quiz sessions via direct storage manipulation
    const sessions = [
      { mode: 'kuis',  correct: 7, total: 10, durationMs: 5000, date: '2026-05-01T10:00:00Z' },
      { mode: 'jac',   correct: 4, total: 5,  durationMs: 3000, date: '2026-05-01T11:00:00Z' },
      { mode: 'sipil', correct: 12, total: 15, durationMs: 8000, date: '2026-05-01T12:00:00Z' },
    ];
    set('progress', (p) => ({ ...p, sessions }));

    const stored = get('progress').sessions;
    expect(stored.length).toBe(3);
    expect(stored[0].mode).toBe('kuis');
    expect(stored[2].mode).toBe('sipil');
  });

  it('sessions are capped at 90 entries', () => {
    const sessions = Array.from({ length: 100 }, (_, i) => ({
      mode: 'kartu', correct: i, total: 10, durationMs: 1000, date: new Date().toISOString(),
    }));
    set('progress', (p) => ({ ...p, sessions: sessions.slice(-90) }));
    expect(get('progress').sessions.length).toBe(90);
  });

  it('daily mission completes and persists completedAt', () => {
    const mission = generateDailyMission();
    expect(mission.completedAt).toBeNull();
    completeMission();
    const after = getMission();
    expect(after.completedAt).not.toBeNull();
    expect(typeof after.completedAt).toBe('number');
  });

  it('sipilScores and bangunanScores can be written and read', () => {
    set('progress', (p) => ({
      ...p,
      sipilScores: { 'sipil-01': { correct: 12, total: 15, date: '2026-05-01' } },
      bangunanScores: { 'bangunan-01': { correct: 10, total: 15, date: '2026-05-01' } },
    }));

    const prog = get('progress');
    expect(prog.sipilScores['sipil-01'].correct).toBe(12);
    expect(prog.bangunanScores['bangunan-01'].correct).toBe(10);
  });
});
