// ─── tests/exam-countdown.test.js ────────────────────────────────────────────
// Phase F: Exam countdown logic.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect, beforeEach } from 'vitest';
import { _reset_for_test, init, set, get } from '../storage/engine.js';

beforeEach(() => {
  localStorage.clear();
  _reset_for_test();
  init();
});

function calcDaysLeft(examDate) {
  if (!examDate) return null;
  return Math.ceil((new Date(examDate) - new Date()) / 86400000);
}

describe('Phase F — Exam Countdown', () => {
  it('daysLeft is null when no examDate set', () => {
    expect(calcDaysLeft(null)).toBeNull();
  });

  it('daysLeft is positive for future dates', () => {
    const future = new Date();
    future.setDate(future.getDate() + 10);
    const dateStr = future.toISOString().slice(0, 10);
    expect(calcDaysLeft(dateStr)).toBeGreaterThan(0);
  });

  it('daysLeft is negative or zero for past dates', () => {
    const past = new Date();
    past.setDate(past.getDate() - 5);
    const dateStr = past.toISOString().slice(0, 10);
    expect(calcDaysLeft(dateStr)).toBeLessThanOrEqual(0);
  });

  it('countdown shows only when daysLeft > 0 and <= 30', () => {
    const show = (d) => d !== null && d > 0 && d <= 30;
    expect(show(10)).toBe(true);
    expect(show(30)).toBe(true);
    expect(show(31)).toBe(false);
    expect(show(0)).toBe(false);
    expect(show(-1)).toBe(false);
    expect(show(null)).toBe(false);
  });

  it('examDate can be set and read from prefs', () => {
    set('prefs', (p) => ({ ...p, examDate: '2026-12-01' }));
    expect(get('prefs').examDate).toBe('2026-12-01');
  });

  it('audioEnabled defaults to true in prefs', () => {
    const prefs = get('prefs');
    expect(prefs.audioEnabled).toBe(true);
  });

  it('audioEnabled can be toggled', () => {
    set('prefs', (p) => ({ ...p, audioEnabled: false }));
    expect(get('prefs').audioEnabled).toBe(false);
  });
});
