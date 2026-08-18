// ─── tests/prefs-schema.test.js ───────────────────────────────────────────────
// Additional tests for storage v3 schema fields, prefs edge cases.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect, beforeEach } from 'vitest';
import { _reset_for_test, init, get, set, exportAll, importAllSafe, validateSnapshot } from '../storage/engine.js';
import { STORAGE_VERSION, DEFAULTS } from '../storage/schema.js';

beforeEach(() => {
  localStorage.clear();
  _reset_for_test();
  init();
});

describe('Storage schema — field defaults', () => {
  it('STORAGE_VERSION is a positive integer', () => {
    // Deliberately not hardcoded to a specific number: this exact test broke
    // once already (asserted ===4 after the app had moved on to v5, silently
    // for months) and would only repeat the same failure mode on the next bump.
    expect(Number.isInteger(STORAGE_VERSION)).toBe(true);
    expect(STORAGE_VERSION).toBeGreaterThan(0);
  });

  it('all progress fields exist in DEFAULTS', () => {
    const p = DEFAULTS.progress;
    expect(p).toHaveProperty('sessions');
    expect(p).toHaveProperty('dailyMission');
    expect(p).not.toHaveProperty('dobokuScores'); // removed at merge — track no longer exists
    expect(p).not.toHaveProperty('kenchikuScores');
  });

  it('all v3 prefs fields exist in DEFAULTS', () => {
    const p = DEFAULTS.prefs;
    expect(p).toHaveProperty('examDate');
    expect(p).toHaveProperty('audioEnabled');
    expect(p).toHaveProperty('studyAnchor');
    expect(p).toHaveProperty('furiganaPolicy');
  });

  it('furiganaPolicy defaults to always', () => {
    expect(get('prefs').furiganaPolicy).toBe('always');
  });

  it('audioEnabled defaults to true', () => {
    expect(get('prefs').audioEnabled).toBe(true);
  });

  it('examDate defaults to null', () => {
    expect(get('prefs').examDate).toBeNull();
  });

  it('studyAnchor defaults to null', () => {
    expect(get('prefs').studyAnchor).toBeNull();
  });

  it('setting examDate persists', () => {
    set('prefs', (p) => ({ ...p, examDate: '2026-06-15' }));
    expect(get('prefs').examDate).toBe('2026-06-15');
  });

  it('setting studyAnchor persists', () => {
    set('prefs', (p) => ({ ...p, studyAnchor: 'morning' }));
    expect(get('prefs').studyAnchor).toBe('morning');
  });

  it('setting furiganaPolicy to tap persists', () => {
    set('prefs', (p) => ({ ...p, furiganaPolicy: 'tap' }));
    expect(get('prefs').furiganaPolicy).toBe('tap');
  });
});

describe('Storage schema — progress fields', () => {
  it('jacScores starts empty', () => {
    expect(get('progress').jacScores).toEqual({});
  });

  it('wgScores starts empty', () => {
    expect(get('progress').wgScores).toEqual({});
  });

  it('sessions starts empty', () => {
    expect(get('progress').sessions).toEqual([]);
  });

  it('dailyMission starts null', () => {
    expect(get('progress').dailyMission).toBeNull();
  });

  it('writing a wayground score round-trips correctly', () => {
    const score = { correct: 12, total: 15, date: '2026-05-01T00:00:00Z' };
    set('progress', (p) => ({
      ...p,
      wgScores: { ...p.wgScores, 'wt01': score },
    }));
    expect(get('progress').wgScores['wt01']).toEqual(score);
  });
});

describe('Export/Import — Validation', () => {
  it('validateSnapshot rejects non-object', () => {
    expect(validateSnapshot(null).ok).toBe(false);
    expect(validateSnapshot('string').ok).toBe(false);
    expect(validateSnapshot(42).ok).toBe(false);
  });

  it('validateSnapshot rejects missing docs', () => {
    expect(validateSnapshot({ progress: {} }).ok).toBe(false);
    expect(validateSnapshot({ srs: {} }).ok).toBe(false);
  });

  it('exportAll + importAllSafe round-trips', () => {
    set('progress', (p) => ({ ...p, known: [1, 2, 3], starred: [10] }));
    set('prefs', (p) => ({ ...p, examDate: '2026-07-01' }));

    const snapshot = exportAll();
    localStorage.clear();
    _reset_for_test();
    init();

    // Fresh install — verify clean
    expect(get('progress').known).toEqual([]);

    // Import
    importAllSafe(snapshot);
    expect(get('progress').known).toEqual([1, 2, 3]);
    expect(get('progress').starred).toEqual([10]);
    expect(get('prefs').examDate).toBe('2026-07-01');
  });
});
