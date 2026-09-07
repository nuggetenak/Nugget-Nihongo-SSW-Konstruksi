// ─── tests/simulasi-jac-ratio.test.js ────────────────────────────────────────
// Item 98. The Teori & Praktik pool samples an exact 60/40. JAC Official drew
// one random teori set plus one random praktik set and then, for the two short
// presets, took a plain shuffled slice — so the composition was whatever chance
// gave. Measured over 20 000 draws of the 15-question preset before the fix:
// 0 to 11 praktik questions, mean 4.78, and 0.10% of runs with none at all.
//
// The fix samples in proportion to the pair it drew rather than forcing the
// pool's 60/40: this source's premise is "the official book", its full preset
// already takes the book's own mix (29 or 36 teori to 15 praktik), and a short
// run should be that mix, smaller. The owner's "biar keliatan kyk random"
// governs which pair is drawn, and still does — nothing here chooses the pair.
//
// Re-measured after: 4–5 praktik at 15 questions, 7–9 at 25, never zero. The
// remaining spread is which pair came up, not chance within it.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect } from 'vitest';
import { drawExam, SIMULASI_JAC_PRESETS } from '../modes/SimulasiMode.jsx';

const preset = (key) => SIMULASI_JAC_PRESETS.find((p) => p.key === key);
const praktik = (d) => d.filter((q) => q._category === 'praktik').length;

describe('JAC Official short presets have a ratio (item 98)', () => {
  it('always draws the number of questions the preset promised', () => {
    for (const key of ['quick', 'half']) {
      const p = preset(key);
      for (let i = 0; i < 200; i++) {
        expect(drawExam('jac', p)).toHaveLength(p.count);
      }
    }
  });

  it('never draws an exam with no practical questions in it', () => {
    // The defect this item names: a mock exam whose practical half can vanish
    // is not a mock exam.
    for (let i = 0; i < 500; i++) {
      expect(praktik(drawExam('jac', preset('quick')))).toBeGreaterThan(0);
    }
  });

  it('holds the practical share within one question of the pair it drew', () => {
    const p = preset('quick');
    for (let i = 0; i < 500; i++) {
      const n = praktik(drawExam('jac', p));
      // 15 × 15/44 = 5.1 and 15 × 15/51 = 4.4 — the two pairs, rounded.
      expect(n).toBeGreaterThanOrEqual(4);
      expect(n).toBeLessThanOrEqual(5);
    }
  });

  it('scales with the preset rather than being pinned to one number', () => {
    for (let i = 0; i < 200; i++) {
      const n = praktik(drawExam('jac', preset('half')));
      expect(n).toBeGreaterThanOrEqual(7);
      expect(n).toBeLessThanOrEqual(9);
    }
  });

  it('the full preset still takes everything in both sets', () => {
    // Unchanged on purpose: there the book's own mix *is* the exam.
    for (let i = 0; i < 50; i++) {
      const d = drawExam('jac', preset('full'));
      expect([44, 51]).toContain(d.length);
    }
  });

  it('tags every JAC question as teori or praktik', () => {
    // The tagging existed in the data (tt* = 学科, st* = 実技) and in this
    // file's own comments; only the mapper never carried it through, which is
    // why the results screen's teori/praktik breakdown rendered nothing for
    // this source.
    const d = drawExam('jac', preset('full'));
    expect(d.every((q) => q._category === 'teori' || q._category === 'praktik')).toBe(true);
  });
});
