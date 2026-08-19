// ─── tests/storage.migration-v3.test.js ──────────────────────────────────────
// Storage migration tests: v1→current, v2→current, fresh install schema.
// (Filename kept for git history continuity — chain now runs to v6.)
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect, beforeEach } from 'vitest';
import { _reset_for_test, init, get } from '../storage/engine.js';
import { STORAGE_VERSION, DEFAULTS } from '../storage/schema.js';

beforeEach(() => {
  localStorage.clear();
  _reset_for_test();
});

describe('storage migration chain (v1/v2 → current)', () => {
  it('STORAGE_VERSION is a positive integer', () => {
    // Deliberately not hardcoded to a specific number — see prefs-schema.test.js
    // for why (this exact assertion already broke once before, silently, when
    // v4→v5 shipped without updating it).
    expect(Number.isInteger(STORAGE_VERSION)).toBe(true);
    expect(STORAGE_VERSION).toBeGreaterThan(0);
  });

  it('fresh install creates current schema with all fields', () => {
    init();
    const prog = get('progress');
    const prefs = get('prefs');

    expect(prog._v).toBe(STORAGE_VERSION);
    expect(prog).not.toHaveProperty('dobokuScores'); // removed at merge — track no longer exists
    expect(prog).not.toHaveProperty('kenchikuScores');
    expect(prog.sessions).toEqual([]);
    expect(prog.dailyMission).toBeNull();

    expect(prefs._v).toBe(STORAGE_VERSION);
    expect(prefs.examDate).toBeNull();
    expect(prefs.audioEnabled).toBe(true);
    expect(prefs.studyAnchor).toBeNull();
    expect(prefs.furiganaPolicy).toBe('always');
  });

  it('v2 data migrates to v4 preserving existing fields', () => {
    // Simulate v2 data in localStorage
    const v2Progress = {
      _v: 2,
      known: [1, 2, 3],
      unknown: [4, 5],
      starred: [],
      quizWrong: { 10: 2 },
      wrongCounts: {},
      wgWrong: {},
      vocabWrong: {},
      jacScores: { 'set-1': { correct: 8, total: 10 } },
      wgScores: {},
      vocabScores: {},
      streakData: { days: 5, lastDate: '2026-04-30' },
      dailyCount: { count: 3, date: '2026-04-30' },
      recentCards: [1, 2],
      milestoneStreak7: false,
      milestoneQuiz70: false,
    };
    const v2Prefs = {
      _v: 2,
      track: 'doboku',
      theme: 'dark',
      onboarded: true,
      tutorialFlashcard: false,
      lastMode: 'kuis',
      dailyGoal: 30,
    };
    const v2Srs = { _v: 2, cards: { 42: { state: 1 } } };

    localStorage.setItem('ssw-progress', JSON.stringify(v2Progress));
    localStorage.setItem('ssw-prefs', JSON.stringify(v2Prefs));
    localStorage.setItem('ssw-srs-data', JSON.stringify(v2Srs));

    init();
    const prog = get('progress');
    const prefs = get('prefs');
    const srs = get('srs');

    // Old fields preserved
    expect(prog.known).toEqual([1, 2, 3]);
    expect(prog.unknown).toEqual([4]); // 5 was deleted in renumbering
    expect(prog.jacScores['set-1'].correct).toBe(8);
    expect(prog.streakData.days).toBe(5);
    expect(prefs.track).toBe('doboku');
    expect(prefs.theme).toBe('dark');
    expect(prefs.dailyGoal).toBe(30);
    // card 42 was deleted in renumbering (gap 42-49 removed) → not in v4
    expect(srs.cards['42']).toBeUndefined();

    // New fields added by the migration chain
    expect(prog._v).toBe(STORAGE_VERSION);
    expect(prog).not.toHaveProperty('dobokuScores');
    expect(prog).not.toHaveProperty('kenchikuScores');
    expect(prog.sessions).toEqual([]);
    expect(prog.dailyMission).toBeNull();
    expect(prefs._v).toBe(STORAGE_VERSION);
    expect(prefs.examDate).toBeNull();
    expect(prefs.audioEnabled).toBe(true);
    expect(prefs.furiganaPolicy).toBe('always');
  });

  it('DEFAULTS.progress has all required fields', () => {
    const p = DEFAULTS.progress;
    expect(p).not.toHaveProperty('dobokuScores');
    expect(p).not.toHaveProperty('kenchikuScores');
    expect(p.sessions).toBeDefined();
    expect(p.dailyMission).toBeDefined();
  });

  it('DEFAULTS.prefs has all required fields', () => {
    const p = DEFAULTS.prefs;
    expect(p.examDate).toBeDefined();
    expect(p.audioEnabled).toBeDefined();
    expect(p.studyAnchor).toBeDefined();
    expect(p.furiganaPolicy).toBeDefined();
  });
});
