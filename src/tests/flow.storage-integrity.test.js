// ─── tests/flow.storage-integrity.test.js ────────────────────────────────────
// G.2 Integration: storage schema integrity across all phases.
// Verifies every Phase A-F field is present and correctly typed.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect, beforeEach } from 'vitest';
import { _reset_for_test, init, get } from '../storage/engine.js';
import { STORAGE_VERSION, DEFAULTS } from '../storage/schema.js';

beforeEach(() => {
  localStorage.clear();
  _reset_for_test();
  init();
});

describe('G.2 Storage integrity — complete v3 schema', () => {
  it('all required progress fields present and correct types', () => {
    const p = get('progress');
    expect(p._v).toBe(STORAGE_VERSION);
    expect(Array.isArray(p.known)).toBe(true);
    expect(Array.isArray(p.unknown)).toBe(true);
    expect(Array.isArray(p.starred)).toBe(true);
    expect(typeof p.quizWrong).toBe('object');
    expect(typeof p.jacScores).toBe('object');
    expect(typeof p.sipilScores).toBe('object');     // Phase B
    expect(typeof p.bangunanScores).toBe('object');  // Phase B
    expect(Array.isArray(p.sessions)).toBe(true);    // Phase C
    expect(p.dailyMission === null || typeof p.dailyMission === 'object').toBe(true); // Phase C
    expect(typeof p.milestoneStreak7).toBe('boolean');
    expect(typeof p.milestoneQuiz70).toBe('boolean');
  });

  it('all required prefs fields present and correct types', () => {
    const p = get('prefs');
    expect(p._v).toBe(STORAGE_VERSION);
    expect(p.examDate === null || typeof p.examDate === 'string').toBe(true);  // Phase F
    expect(typeof p.audioEnabled).toBe('boolean');    // Phase F
    expect(p.studyAnchor === null || typeof p.studyAnchor === 'string').toBe(true); // Phase C
    expect(typeof p.furiganaPolicy).toBe('string');   // Phase E
    expect(typeof p.dailyGoal).toBe('number');
    expect(typeof p.onboarded).toBe('boolean');
  });

  it('srs doc has v3 and cards object', () => {
    const s = get('srs');
    expect(s._v).toBe(STORAGE_VERSION);
    expect(typeof s.cards).toBe('object');
  });

  it('DEFAULTS match expected shapes', () => {
    expect(DEFAULTS.progress.sipilScores).toBeDefined();
    expect(DEFAULTS.progress.bangunanScores).toBeDefined();
    expect(DEFAULTS.progress.sessions).toBeDefined();
    expect(DEFAULTS.prefs.examDate).toBeDefined();
    expect(DEFAULTS.prefs.audioEnabled).toBeDefined();
    expect(DEFAULTS.prefs.furiganaPolicy).toBeDefined();
  });

  it('fresh install produces identical structure to DEFAULTS', () => {
    const p = get('progress');
    const d = DEFAULTS.progress;
    // Spot-check structural equivalence
    expect(Object.keys(p).sort()).toEqual(
      expect.arrayContaining(Object.keys(d))
    );
  });
});
