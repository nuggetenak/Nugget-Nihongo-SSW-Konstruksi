// src/tests/date.test.js
import { describe, it, expect } from 'vitest';
import { todayStr, prevDayStr, isoToLocalDate } from '../utils/date.js';

describe('date.js — local timezone helpers', () => {
  it('todayStr returns YYYY-MM-DD format', () => {
    const s = todayStr();
    expect(s).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('prevDayStr returns day before todayStr', () => {
    const today = new Date(todayStr());
    const prev  = new Date(prevDayStr());
    const diffMs = today.getTime() - prev.getTime();
    expect(diffMs).toBe(86400000); // exactly 1 day
  });

  it('isoToLocalDate converts UTC ISO to local YYYY-MM-DD', () => {
    const s = isoToLocalDate('2026-01-01T00:00:00.000Z');
    expect(s).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('isoToLocalDate returns null for null input', () => {
    expect(isoToLocalDate(null)).toBeNull();
  });

  it('todayStr and prevDayStr are different dates', () => {
    expect(todayStr()).not.toBe(prevDayStr());
  });
});
