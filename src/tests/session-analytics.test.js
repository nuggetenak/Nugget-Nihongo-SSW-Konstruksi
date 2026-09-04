import { describe, it, expect } from 'vitest';
import {
  getAvgAccuracy,
  getBestSimScore,
  hasPerfectSprint,
  calcReadiness,
  calcReadinessBand,
} from '../utils/session-analytics.js';

const makeSess = (mode, correct, total, date = new Date().toISOString()) => ({
  mode,
  correct,
  total,
  date,
  durationMs: 0,
});

describe('session-analytics', () => {
  describe('getAvgAccuracy', () => {
    it('returns null for empty sessions', () => {
      expect(getAvgAccuracy([])).toBeNull();
    });
    it('ignores sessions with total=0', () => {
      expect(getAvgAccuracy([makeSess('kuis', 0, 0)])).toBeNull();
    });
    it('calculates average across SCORED_QUIZ_MODES', () => {
      const s = [makeSess('kuis', 8, 10), makeSess('simulasi', 6, 10)];
      expect(getAvgAccuracy(s)).toBeCloseTo(70);
    });
    it('ignores non-scored modes (e.g. ulasan)', () => {
      const s = [makeSess('kuis', 10, 10), makeSess('ulasan', 0, 0)];
      expect(getAvgAccuracy(s)).toBe(100);
    });
    it('limits to last n sessions when n specified', () => {
      const s = [makeSess('kuis', 0, 10), makeSess('kuis', 10, 10)];
      expect(getAvgAccuracy(s, 1)).toBe(100);
    });
  });

  describe('getBestSimScore', () => {
    it('returns 0 for no simulasi sessions', () => {
      expect(getBestSimScore([makeSess('kuis', 8, 10)])).toBe(0);
    });
    it('returns max simulasi score', () => {
      const s = [makeSess('simulasi', 7, 10), makeSess('simulasi', 9, 10)];
      expect(getBestSimScore(s)).toBe(90);
    });
  });

  describe('hasPerfectSprint', () => {
    it('returns false when no sprint session', () => {
      expect(hasPerfectSprint([])).toBe(false);
    });
    it('returns true for perfect sprint with enough cards', () => {
      expect(hasPerfectSprint([makeSess('sprint', 15, 15)])).toBe(true);
    });
    it('returns false for perfect but below minCards', () => {
      expect(hasPerfectSprint([makeSess('sprint', 5, 5)])).toBe(false);
    });
    it('returns false for imperfect sprint', () => {
      expect(hasPerfectSprint([makeSess('sprint', 14, 15)])).toBe(false);
    });
  });

  describe('calcReadiness', () => {
    it('returns 0 for empty state', () => {
      const r = calcReadiness({ srs: { stats: {} }, sessions: [], streakData: {} });
      expect(r).toBe(0);
    });
    it('returns 0–100', () => {
      const r = calcReadiness({
        srs: { stats: { total: 100, mature: 50, review: 20 } },
        sessions: [makeSess('kuis', 8, 10)],
        streakData: { days: 7 },
      });
      expect(r).toBeGreaterThanOrEqual(0);
      expect(r).toBeLessThanOrEqual(100);
    });
    it('a real streak actually raises the score (regression check for the streakData.current/days field-name bug)', () => {
      const base = { srs: { stats: {} }, sessions: [] };
      const noStreak = calcReadiness({ ...base, streakData: { days: 0 } });
      const withStreak = calcReadiness({ ...base, streakData: { days: 14 } });
      expect(withStreak).toBeGreaterThan(noStreak);
      expect(withStreak).toBe(20); // full streak component, capped at 14 days
    });
    it('accepts a wrong field name silently rather than crashing, but contributes nothing from it (documents the shape, not a fix)', () => {
      const r = calcReadiness({
        srs: { stats: {} },
        sessions: [],
        streakData: { current: 14 }, // wrong field -- .days is the real one
      });
      expect(r).toBe(0); // silently ignored, not an error -- worth knowing if this shape drifts again
    });
  });

  describe('calcReadinessBand', () => {
    it('returns null when there is not enough scored-session data yet', () => {
      const band = calcReadinessBand({
        srs: { stats: {} },
        sessions: [makeSess('kuis', 5, 5)], // only 1 session, below the minimum
        streakData: { days: 0 },
      });
      expect(band).toBeNull();
    });

    it('bands a low score as "Kurang siap"', () => {
      const sessions = Array.from({ length: 6 }, () => makeSess('kuis', 1, 10)); // 10% accuracy
      const band = calcReadinessBand({ srs: { stats: {} }, sessions, streakData: { days: 0 } });
      expect(band?.key).toBe('kurang');
    });

    it('bands a high score as "Siap"', () => {
      const sessions = Array.from({ length: 6 }, () => makeSess('kuis', 10, 10)); // 100% accuracy
      const band = calcReadinessBand({
        srs: { stats: { total: 100, mature: 90, review: 5 } },
        sessions,
        streakData: { days: 14 },
      });
      expect(band?.key).toBe('siap');
    });

    it('weights recent sessions, not the all-time average -- early struggling should not permanently cap a since-improved score', () => {
      const earlyBad = Array.from({ length: 20 }, () => makeSess('kuis', 1, 10)); // 10% accuracy, old
      const recentGood = Array.from({ length: 10 }, () => makeSess('kuis', 10, 10)); // 100%, recent
      const sessions = [...earlyBad, ...recentGood];
      const band = calcReadinessBand({
        srs: { stats: { total: 100, mature: 80, review: 10 } },
        sessions,
        streakData: { days: 10 },
      });
      // All-time average here would be roughly (20*10% + 10*100%)/30 ≈ 40%,
      // pulling the band down to "cukup" or worse despite genuinely strong
      // recent performance. Recency-weighting should reflect the improvement.
      expect(band?.key).toBe('siap');
    });
  });
});

// ─── SRS component of the readiness score (2026-09-04) ───────────────────────
describe('calcReadiness — SRS component counts every card in review', () => {
  const sessions = [];

  it('counts young cards, not only mature ones', () => {
    // `srs.stats.review` never existed — getSRSStats returns
    // { total, new, learning, young, mature, due } — so this component silently
    // counted mature cards only, and its own comment ("mature+review") described
    // an intent the code never had. In FSRS terms young and mature are both the
    // Review state, split by SRS_MATURE_DAYS.
    const allYoung = { stats: { total: 100, new: 0, learning: 0, young: 100, mature: 0, due: 0 } };
    const allMature = { stats: { total: 100, new: 0, learning: 0, young: 0, mature: 100, due: 0 } };
    const streakData = {};
    expect(calcReadiness({ srs: allYoung, sessions, streakData })).toBe(
      calcReadiness({ srs: allMature, sessions, streakData })
    );
    // 40 of 100 points come from the SRS component; nothing else scores here.
    expect(calcReadiness({ srs: allYoung, sessions, streakData })).toBe(40);
  });

  it('a deck that has never been reviewed still scores 0 on the SRS component', () => {
    const allNew = { stats: { total: 100, new: 100, learning: 0, young: 0, mature: 0, due: 0 } };
    expect(calcReadiness({ srs: allNew, sessions, streakData: {} })).toBe(0);
  });
});
