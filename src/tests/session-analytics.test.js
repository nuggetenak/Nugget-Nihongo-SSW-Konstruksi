import { describe, it, expect } from 'vitest';
import { getAvgAccuracy, getBestSimScore, hasPerfectSprint, calcReadiness } from '../utils/session-analytics.js';

const makeSess = (mode, correct, total, date = new Date().toISOString()) =>
  ({ mode, correct, total, date, durationMs: 0 });

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
      const r = calcReadiness({ srs: { stats: { total: 100, mature: 50, review: 20 } },
        sessions: [makeSess('kuis', 8, 10)], streakData: { current: 7 } });
      expect(r).toBeGreaterThanOrEqual(0);
      expect(r).toBeLessThanOrEqual(100);
    });
  });
});
