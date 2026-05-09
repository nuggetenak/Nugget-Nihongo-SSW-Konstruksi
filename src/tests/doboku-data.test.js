// ─── tests/doboku-data.test.js ────────────────────────────────────────────────
// Phase B: Schema validation for DOBOKU_SETS data. (REF-9: now in quiz-sets.js)
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect } from 'vitest';
import { getQuizSetsForTrack } from '../data/quiz-sets.js';
const DOBOKU_SETS = getQuizSetsForTrack('doboku').filter(s => s.track === 'doboku');

describe('Phase B — DOBOKU_SETS data', () => {
  it('exports an array of sets', () => {
    expect(Array.isArray(DOBOKU_SETS)).toBe(true);
    expect(DOBOKU_SETS.length).toBeGreaterThanOrEqual(3);
  });

  it('each set has required fields (id, title, subtitle, emoji, questions)', () => {
    for (const set of DOBOKU_SETS) {
      expect(set.id).toBeTruthy();
      expect(set.title).toBeTruthy();
      expect(set.subtitle).toBeTruthy();
      expect(set.emoji).toBeTruthy();
      expect(Array.isArray(set.questions)).toBe(true);
      expect(set.questions.length).toBeGreaterThanOrEqual(15);
    }
  });

  it('total question count ≥ 45', () => {
    const total = DOBOKU_SETS.reduce((n, s) => n + s.questions.length, 0);
    expect(total).toBeGreaterThanOrEqual(45);
  });

  it('every question has q, opts (4 items), ans (0-based in range), exp, cat', () => {
    for (const set of DOBOKU_SETS) {
      for (const q of set.questions) {
        expect(q.q).toBeTruthy();
        expect(Array.isArray(q.opts)).toBe(true);
        expect(q.opts.length).toBeGreaterThanOrEqual(3);
        expect(typeof q.ans).toBe('number');
        expect(q.ans).toBeGreaterThanOrEqual(0);
        expect(q.ans).toBeLessThan(q.opts.length);
        expect(q.exp).toBeTruthy();
        expect(q.cat).toBeTruthy();
      }
    }
  });

  it('every question has opts_id matching opts length', () => {
    for (const set of DOBOKU_SETS) {
      for (const q of set.questions) {
        if (q.opts_id) {
          expect(q.opts_id.length).toBe(q.opts.length);
        }
      }
    }
  });

  it('set IDs are unique', () => {
    const ids = DOBOKU_SETS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all ans values point to a valid option', () => {
    for (const set of DOBOKU_SETS) {
      for (const q of set.questions) {
        expect(q.opts[q.ans]).toBeTruthy();
      }
    }
  });

  it('no duplicate set IDs across doboku sets', () => {
    const ids = DOBOKU_SETS.map((s) => s.id);
    expect(ids.every((id) => id.startsWith('doboku-'))).toBe(true);
  });
});
