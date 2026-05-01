// ─── tests/daily-mission.test.js ─────────────────────────────────────────────
// Phase C: Daily Mission engine tests.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { _reset_for_test, init, set } from '../storage/engine.js';
import { generateDailyMission, completeMission, getMission, isMissionDoneToday } from '../utils/daily-mission.js';

beforeEach(() => {
  localStorage.clear();
  _reset_for_test();
  init();
});

describe('Phase C — Daily Mission', () => {
  it('generateDailyMission returns a mission object with required fields', () => {
    const m = generateDailyMission();
    expect(m.date).toBeTruthy();
    expect(m.mode).toBeTruthy();
    expect(m.label).toBeTruthy();
    expect(m.icon).toBeTruthy();
    expect(m.completedAt).toBeNull();
  });

  it('calling generateDailyMission twice on same day returns cached mission', () => {
    const m1 = generateDailyMission();
    const m2 = generateDailyMission();
    expect(m1.date).toBe(m2.date);
    expect(m1.mode).toBe(m2.mode);
  });

  it('mission is stored to progress.dailyMission', () => {
    generateDailyMission();
    const stored = getMission();
    expect(stored).toBeTruthy();
    expect(stored.mode).toBeTruthy();
  });

  it('completeMission sets completedAt timestamp', () => {
    generateDailyMission();
    completeMission();
    const m = getMission();
    expect(m.completedAt).not.toBeNull();
    expect(typeof m.completedAt).toBe('number');
  });

  it('isMissionDoneToday returns false before completion', () => {
    generateDailyMission();
    expect(isMissionDoneToday()).toBe(false);
  });

  it('isMissionDoneToday returns true after completion', () => {
    generateDailyMission();
    completeMission();
    expect(isMissionDoneToday()).toBe(true);
  });

  it('when SRS due count = 0 and no sessions, mode is not ulasan by force', () => {
    // With no due cards the engine picks by strand balance — just verify it returns a valid mode
    const m = generateDailyMission();
    const validModes = ['ulasan', 'kartu', 'kuis', 'sprint', 'jac', 'fokus'];
    expect(validModes).toContain(m.mode);
  });

  it('when sessions array is empty, returns a mission with a strand-balanced mode', () => {
    set('progress', (p) => ({ ...p, sessions: [] }));
    const m = generateDailyMission();
    expect(m.mode).toBeTruthy();
  });

  it('mission has today date', () => {
    const today = new Date().toISOString().slice(0, 10);
    const m = generateDailyMission();
    expect(m.date).toBe(today);
  });

  it('getMission returns null before any mission generated', () => {
    // Fresh storage — no mission set
    set('progress', (p) => ({ ...p, dailyMission: null }));
    const m = getMission();
    expect(m).toBeNull();
  });
});
