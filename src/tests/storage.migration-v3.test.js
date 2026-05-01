// ─── tests/storage.migration-v3.test.js ──────────────────────────────────────
// A.6: v2→v3, v1→v3, fresh-install migration tests.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect, beforeEach } from 'vitest';
import { _reset_for_test, init, get } from '../storage/engine.js';
import { STORAGE_VERSION, DEFAULTS } from '../storage/schema.js';

beforeEach(() => {
  localStorage.clear();
  _reset_for_test();
});

describe('A.6 Storage v3', () => {
  it('STORAGE_VERSION is 3', () => {
    expect(STORAGE_VERSION).toBe(3);
  });

  it('fresh install creates v3 schema with all new fields', () => {
    init();
    const prog = get('progress');
    const prefs = get('prefs');

    expect(prog._v).toBe(3);
    expect(prog.sipilScores).toBeDefined();
    expect(prog.bangunanScores).toBeDefined();
    expect(prog.sessions).toEqual([]);
    expect(prog.dailyMission).toBeNull();

    expect(prefs._v).toBe(3);
    expect(prefs.examDate).toBeNull();
    expect(prefs.audioEnabled).toBe(true);
    expect(prefs.studyAnchor).toBeNull();
    expect(prefs.furiganaPolicy).toBe('always');
  });

  it('v2 data migrates to v3 preserving existing fields', () => {
    // Simulate v2 data in localStorage
    const v2Progress = {
      _v: 2,
      known: [1, 2, 3],
      unknown: [4, 5],
      starred: [],
      quizWrong: { 10: 2 },
      wrongCounts: {},
      wgWrong: {}, vocabWrong: {},
      jacScores: { 'set-1': { correct: 8, total: 10 } },
      wgScores: {}, vocabScores: {},
      streakData: { days: 5, lastDate: '2026-04-30' },
      dailyCount: { count: 3, date: '2026-04-30' },
      recentCards: [1, 2],
      milestoneStreak7: false,
      milestoneQuiz70: false,
    };
    const v2Prefs = {
      _v: 2,
      track: 'doboku', theme: 'dark', onboarded: true,
      tutorialFlashcard: false, lastMode: 'kuis', dailyGoal: 30,
    };
    const v2Srs = { _v: 2, cards: { '42': { state: 1 } } };

    localStorage.setItem('ssw-progress', JSON.stringify(v2Progress));
    localStorage.setItem('ssw-prefs', JSON.stringify(v2Prefs));
    localStorage.setItem('ssw-srs-data', JSON.stringify(v2Srs));

    init();
    const prog = get('progress');
    const prefs = get('prefs');
    const srs = get('srs');

    // Old fields preserved
    expect(prog.known).toEqual([1, 2, 3]);
    expect(prog.jacScores['set-1'].correct).toBe(8);
    expect(prog.streakData.days).toBe(5);
    expect(prefs.track).toBe('doboku');
    expect(prefs.theme).toBe('dark');
    expect(prefs.dailyGoal).toBe(30);
    expect(srs.cards['42']).toBeDefined();

    // New v3 fields added
    expect(prog._v).toBe(3);
    expect(prog.sipilScores).toEqual({});
    expect(prog.bangunanScores).toEqual({});
    expect(prog.sessions).toEqual([]);
    expect(prog.dailyMission).toBeNull();
    expect(prefs._v).toBe(3);
    expect(prefs.examDate).toBeNull();
    expect(prefs.audioEnabled).toBe(true);
    expect(prefs.furiganaPolicy).toBe('always');
  });

  it('DEFAULTS.progress has all required v3 fields', () => {
    const p = DEFAULTS.progress;
    expect(p.sipilScores).toBeDefined();
    expect(p.bangunanScores).toBeDefined();
    expect(p.sessions).toBeDefined();
    expect(p.dailyMission).toBeDefined();
  });

  it('DEFAULTS.prefs has all required v3 fields', () => {
    const p = DEFAULTS.prefs;
    expect(p.examDate).toBeDefined();
    expect(p.audioEnabled).toBeDefined();
    expect(p.studyAnchor).toBeDefined();
    expect(p.furiganaPolicy).toBeDefined();
  });
});
