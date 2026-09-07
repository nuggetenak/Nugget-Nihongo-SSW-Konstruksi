// ─── tests/daily-mission.test.js ─────────────────────────────────────────────
// Phase C: Daily Mission engine tests.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { _reset_for_test, init, set } from '../storage/engine.js';
import {
  generateDailyMission,
  completeMission,
  getMission,
  isMissionDoneToday,
  MISSION_MODES,
} from '../utils/daily-mission.js';
import { MODE_META, MODE_COMPONENTS } from '../router/modes.js';

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
    expect(MISSION_MODES).toContain(m.mode);
  });

  // Item 102c. The list used to be a bare array whose omissions had no stated
  // reason: `wayground` -- the largest question bank in the app -- and `vocab`
  // were out while `mirip` was in. It has a rule now, and this is the rule:
  // every mode with a strand is a mission except a 100-minute exam and the
  // reference surfaces, which have no end to reach.
  it('offers every strand-carrying mode except the exam and the reference surfaces', () => {
    const NOT_A_MISSION = ['simulasi', 'cari', 'glosari', 'catatan'];
    const expected = Object.entries(MODE_META)
      .filter(([id, meta]) => meta.strand && !NOT_A_MISSION.includes(id))
      .map(([id]) => id);
    expect([...MISSION_MODES].sort()).toEqual([...expected].sort());
  });

  it('every mission mode still exists as a mode', () => {
    MISSION_MODES.forEach((m) => expect(MODE_COMPONENTS).toHaveProperty(m));
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
