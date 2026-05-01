// ─── tests/export-import.test.js ─────────────────────────────────────────────
// Phase D: validateSnapshot, importAllSafe with rollback.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect, beforeEach } from 'vitest';
import {
  _reset_for_test, init, get, set,
  exportAll, importAll, validateSnapshot, importAllSafe,
} from '../storage/engine.js';

beforeEach(() => {
  localStorage.clear();
  _reset_for_test();
  init();
});

const makeValidSnapshot = (overrides = {}) => ({
  _storage_version: 3,
  exported_at: new Date().toISOString(),
  progress: {
    _v: 3, known: [1, 2, 3], unknown: [4], starred: [],
    quizWrong: {}, wrongCounts: {}, wgWrong: {}, vocabWrong: {},
    jacScores: {}, wgScores: {}, vocabScores: {},
    sipilScores: {}, bangunanScores: {},
    streakData: {}, dailyCount: { count: 0, date: '' },
    recentCards: [], milestoneStreak7: false, milestoneQuiz70: false,
    sessions: [], dailyMission: null,
  },
  srs: { _v: 3, cards: { '10': { state: 1 } } },
  prefs: {
    _v: 3, track: 'doboku', theme: 'light', onboarded: true,
    tutorialFlashcard: false, lastMode: null, dailyGoal: 20,
    examDate: null, audioEnabled: true, studyAnchor: null, furiganaPolicy: 'always',
  },
  ...overrides,
});

describe('Phase D — validateSnapshot', () => {
  it('returns ok:true for a valid snapshot', () => {
    const result = validateSnapshot(makeValidSnapshot());
    expect(result.ok).toBe(true);
    expect(result.summary.known).toBe(3);
    expect(result.summary.srsCards).toBe(1);
  });

  it('returns ok:false when snapshot is null', () => {
    expect(validateSnapshot(null).ok).toBe(false);
    expect(validateSnapshot(null).reason).toBe('not_object');
  });

  it('returns ok:false when snapshot is not an object', () => {
    expect(validateSnapshot('string').ok).toBe(false);
  });

  it('returns ok:false when progress doc is missing', () => {
    const s = makeValidSnapshot();
    delete s.progress;
    expect(validateSnapshot(s).ok).toBe(false);
    expect(validateSnapshot(s).reason).toBe('missing_docs');
  });

  it('returns ok:false when srs doc is missing', () => {
    const s = makeValidSnapshot();
    delete s.srs;
    expect(validateSnapshot(s).ok).toBe(false);
  });

  it('returns ok:false when prefs doc is missing', () => {
    const s = makeValidSnapshot();
    delete s.prefs;
    expect(validateSnapshot(s).ok).toBe(false);
  });

  it('returns ok:false when known is not an array', () => {
    const s = makeValidSnapshot();
    s.progress.known = 'bad';
    expect(validateSnapshot(s).ok).toBe(false);
    expect(validateSnapshot(s).reason).toBe('invalid_known');
  });

  it('returns ok:false when srs.cards is not an object', () => {
    const s = makeValidSnapshot();
    s.srs.cards = 'bad';
    expect(validateSnapshot(s).ok).toBe(false);
    expect(validateSnapshot(s).reason).toBe('invalid_srs');
  });

  it('summary includes version from _storage_version', () => {
    const result = validateSnapshot(makeValidSnapshot({ _storage_version: 3 }));
    expect(result.summary.version).toBe(3);
  });
});

describe('Phase D — importAllSafe', () => {
  it('successfully imports a valid snapshot', () => {
    const snap = makeValidSnapshot();
    const summary = importAllSafe(snap);
    expect(summary.known).toBe(3);
    expect(get('progress').known).toEqual([1, 2, 3]);
  });

  it('throws on invalid snapshot without modifying state', () => {
    // Set some known state first
    set('progress', (p) => ({ ...p, known: [99] }));
    const before = get('progress').known;

    expect(() => importAllSafe({ bad: 'data' })).toThrow();

    // State should be unchanged
    expect(get('progress').known).toEqual(before);
  });

  it('exported snapshot can be re-imported cleanly', () => {
    set('progress', (p) => ({ ...p, known: [5, 6, 7] }));
    const snap = exportAll();
    
    // Reset to empty
    set('progress', (p) => ({ ...p, known: [] }));
    
    importAllSafe(snap);
    expect(get('progress').known).toEqual([5, 6, 7]);
  });

  it('importAllSafe returns a summary object', () => {
    const snap = makeValidSnapshot();
    const summary = importAllSafe(snap);
    expect(summary).toHaveProperty('known');
    expect(summary).toHaveProperty('srsCards');
    expect(summary).toHaveProperty('version');
  });
});
