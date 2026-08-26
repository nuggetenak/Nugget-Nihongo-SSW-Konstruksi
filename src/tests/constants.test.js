// ─── tests/constants.test.js ──────────────────────────────────────────────────
// Item 49: QUIZ_COUNTS is now the single source of truth for the question-
// count picker (was duplicated identically in 3 files). Just checking the
// shape here — the actual persistence behavior is exercised by hand per mode
// since it depends on each mode's own useApp()/prefs wiring.
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { QUIZ_COUNTS } from '../utils/constants.js';

describe('QUIZ_COUNTS', () => {
  it('is the shared [10, 20, 30] base', () => {
    expect(QUIZ_COUNTS).toEqual([10, 20, 30]);
  });

  it('is a real array other modules can spread/map', () => {
    expect(Array.isArray(QUIZ_COUNTS)).toBe(true);
    expect([...QUIZ_COUNTS, 'Semua']).toEqual([10, 20, 30, 'Semua']);
  });
});
