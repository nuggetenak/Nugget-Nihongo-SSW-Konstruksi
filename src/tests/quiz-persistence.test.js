// ─── tests/quiz-persistence.test.js ───────────────────────────────────────────
// saveQuizSnapshot / readQuizSnapshot / clearQuizSnapshot (item 51) — the
// storage mechanics: round-trip, staleness expiry, silent failure on a
// storage error, and clearing.
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  saveQuizSnapshot,
  readQuizSnapshot,
  clearQuizSnapshot,
} from '../utils/quiz-persistence.js';

beforeEach(() => {
  sessionStorage.clear();
});

describe('quiz-persistence', () => {
  it('round-trips an arbitrary serializable snapshot', () => {
    const snapshot = { qIdx: 3, selected: 1, results: [{ isCorrect: true }] };
    saveQuizSnapshot('test-key', snapshot);
    expect(readQuizSnapshot('test-key')).toEqual(snapshot);
  });

  it('returns null when nothing is saved under the key', () => {
    expect(readQuizSnapshot('never-saved')).toBeNull();
  });

  it('returns null and clears a snapshot older than 30 minutes', () => {
    const now = Date.now();
    vi.spyOn(Date, 'now').mockReturnValue(now);
    saveQuizSnapshot('stale-key', { qIdx: 0 });

    vi.spyOn(Date, 'now').mockReturnValue(now + 31 * 60 * 1000);
    expect(readQuizSnapshot('stale-key')).toBeNull();
    // Confirm it was actually removed, not just reported as null this time.
    vi.spyOn(Date, 'now').mockReturnValue(now); // rewind, in case removal didn't happen
    expect(readQuizSnapshot('stale-key')).toBeNull();

    vi.restoreAllMocks();
  });

  it('keeps a snapshot saved 29 minutes ago (just under the threshold)', () => {
    const now = Date.now();
    vi.spyOn(Date, 'now').mockReturnValue(now);
    saveQuizSnapshot('fresh-key', { qIdx: 5 });

    vi.spyOn(Date, 'now').mockReturnValue(now + 29 * 60 * 1000);
    expect(readQuizSnapshot('fresh-key')).toEqual({ qIdx: 5 });

    vi.restoreAllMocks();
  });

  it('clearQuizSnapshot removes a saved snapshot', () => {
    saveQuizSnapshot('to-clear', { qIdx: 1 });
    clearQuizSnapshot('to-clear');
    expect(readQuizSnapshot('to-clear')).toBeNull();
  });

  it('does not throw when sessionStorage.setItem fails (quota, private browsing)', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    expect(() => saveQuizSnapshot('will-fail', { qIdx: 0 })).not.toThrow();
    spy.mockRestore();
  });

  it('does not throw and returns null when sessionStorage.getItem fails', () => {
    const spy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    expect(() => readQuizSnapshot('will-fail')).not.toThrow();
    expect(readQuizSnapshot('will-fail')).toBeNull();
    spy.mockRestore();
  });

  it('handles corrupt JSON in storage gracefully', () => {
    sessionStorage.setItem('corrupt', 'not valid json{');
    expect(readQuizSnapshot('corrupt')).toBeNull();
  });
});
