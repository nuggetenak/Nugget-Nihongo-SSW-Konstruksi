// ─── tests/wrongtracker.test.js ──────────────────────────────────────────────
// Tests for wrong-tracker value helpers and backward compat.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect } from 'vitest';
import {
  getWrongCount,
  getWrongTime,
  makeWrongEntry,
  loadFromStorage,
  saveToStorage,
} from '../utils/wrong-tracker.js';
// A.7: STORAGE_KEYS was removed — this import should fail (undefined)
import * as wrongTracker from '../utils/wrong-tracker.js';

describe('wrong-tracker — value helpers + backward compat', () => {
  it('STORAGE_KEYS is no longer exported', () => {
    expect(wrongTracker.STORAGE_KEYS).toBeUndefined();
  });

  it('getWrongCount handles legacy number format', () => {
    expect(getWrongCount(3)).toBe(3);
    expect(getWrongCount(0)).toBe(0);
    expect(getWrongCount(null)).toBe(0);
    expect(getWrongCount(undefined)).toBe(0);
  });

  it('getWrongCount handles object format (current format)', () => {
    expect(getWrongCount({ count: 5, lastWrong: 12345 })).toBe(5);
    expect(getWrongCount({ count: 0 })).toBe(0);
  });

  it('makeWrongEntry increments count and sets timestamp', () => {
    const entry = makeWrongEntry(null, 9999);
    expect(entry.count).toBe(1);
    expect(entry.lastWrong).toBe(9999);

    const entry2 = makeWrongEntry(entry, 10000);
    expect(entry2.count).toBe(2);
  });

  it('loadFromStorage / saveToStorage round-trip', () => {
    saveToStorage('test-key-x', { value: 42 });
    const result = loadFromStorage('test-key-x', null);
    expect(result).toEqual({ value: 42 });
    localStorage.removeItem('test-key-x');
  });
});
