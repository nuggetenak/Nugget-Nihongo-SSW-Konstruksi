// ─── tests/flow.daily-mission.test.js ─────────────────────────────────────────
// G.2 Integration: generate mission → do session → complete mission → done today.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect, beforeEach } from 'vitest';
import { _reset_for_test, init, get, set } from '../storage/engine.js';
import {
  generateDailyMission,
  completeMission,
  getMission,
  isMissionDoneToday,
} from '../utils/daily-mission.js';

beforeEach(() => {
  localStorage.clear();
  _reset_for_test();
  init();
});

describe('G.2 Flow — Daily Mission End-to-End', () => {
  it('full lifecycle: generate → session → complete → done', () => {
    // Step 1: Generate mission
    const mission = generateDailyMission();
    expect(mission.mode).toBeTruthy();
    expect(mission.completedAt).toBeNull();
    expect(isMissionDoneToday()).toBe(false);

    // Step 2: Simulate a session for the mission mode
    set('progress', (p) => ({
      ...p,
      sessions: [
        ...(p.sessions || []),
        {
          mode: mission.mode,
          correct: 8,
          total: 10,
          durationMs: 5000,
          date: new Date().toISOString(),
        },
      ],
    }));

    // Step 3: Complete the mission
    completeMission();
    expect(isMissionDoneToday()).toBe(true);

    // Step 4: Mission data persists
    const stored = getMission();
    expect(stored.completedAt).not.toBeNull();
    expect(stored.mode).toBe(mission.mode);
  });

  it('completing mission does not affect session data', () => {
    generateDailyMission();
    set('progress', (p) => ({
      ...p,
      sessions: [
        { mode: 'kuis', correct: 5, total: 10, durationMs: 3000, date: new Date().toISOString() },
      ],
    }));
    completeMission();

    const prog = get('progress');
    expect(prog.sessions.length).toBe(1);
    expect(prog.sessions[0].mode).toBe('kuis');
  });

  it('second generateDailyMission call on same day returns same mission even after complete', () => {
    const m1 = generateDailyMission();
    completeMission();
    const m2 = generateDailyMission();
    expect(m2.mode).toBe(m1.mode);
    expect(m2.completedAt).not.toBeNull();
  });

  it('mission persists across engine re-init', () => {
    const mission = generateDailyMission();
    completeMission();

    _reset_for_test();
    init();

    const stored = getMission();
    expect(stored.mode).toBe(mission.mode);
    expect(stored.completedAt).not.toBeNull();
  });
});
