// ─── tests/question-option-shuffle.test.js ───────────────────────────────────
// Two separate things, and it is worth not confusing them again.
//
// 1. POSITION. `wayground`, `vocab` and `jac` rendered `q.opts` in source order
//    with `correctIdx: q.ans` straight from the data, so a given question's
//    options sat in the same places every time you drew it. Re-drilling a set
//    therefore trained "the answer was third" rather than the content. That is
//    what `shuffleOptions` fixes, and it is a modest fix: measured on the
//    shipped data, `q.ans` was already near-uniform across the four positions
//    (25.4% max share in Wayground, 28.3% in JAC Mockup, against a 25%
//    baseline), so there was no *distributional* position leak to close.
//
// 2. LENGTH. The correct answer is the single longest option 51.5% of the time
//    in Wayground (48.3% after the first balancing pass) and 72.0% in JAC
//    Mockup, because answers are written out and
//    distractors are written tersely -- mean 11.5 vs 8.3 characters, and 9.9 vs
//    6.0. A bot that ignores the question and picks the longest option scores
//    those same figures, against a 25% baseline and a 65% pass mark.
//
//    **Shuffling does not touch this.** The bot picks by length, not position,
//    so it finds the answer wherever it lands. Closing it means rewriting
//    distractors to comparable length across 980 questions -- a content
//    project, not a code change. The budget test at the bottom records the
//    current figures so the problem stays visible and cannot quietly worsen,
//    the same shape as `ruby-scope.test.js`'s ceiling.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect } from 'vitest';
import { WAYGROUND_SETS } from '../data/wayground-sets.js';
import { JAC_MOCKUP_SETS } from '../data/jac-mockup-sets.js';
import { JAC_OFFICIAL } from '../data/jac-official.js';
import { shuffleOptions } from '../utils/shuffle.js';

const strip = (s) => String(s).replace(/《[^》]*》/g, '');

/** Score of a bot that reads nothing and always picks the longest option. */
function longestOptionBotScore(questions) {
  let right = 0;
  for (const q of questions) {
    const { options, correctIdx } = shuffleOptions([...q.opts], q.ans);
    const lens = options.map((o) => strip(o).length);
    const pick = lens.indexOf(Math.max(...lens));
    if (pick === correctIdx) right++;
  }
  return right / questions.length;
}

const WG = WAYGROUND_SETS.flatMap((s) => s.questions);
const JM = JAC_MOCKUP_SETS.flatMap((s) => s.questions);

describe('shuffleOptions', () => {
  it('keeps the correct option pointing at the same text', () => {
    const opts = ['satu', 'dua', 'tiga', 'empat'];
    for (let i = 0; i < 200; i++) {
      const { options, correctIdx } = shuffleOptions(opts, 2);
      expect(options[correctIdx]).toBe('tiga');
      expect([...options].sort()).toEqual([...opts].sort());
    }
  });

  it('leaves a single-option question alone rather than returning -1', () => {
    expect(shuffleOptions(['hanya ini'], 0)).toEqual({ options: ['hanya ini'], correctIdx: 0 });
  });

  it('actually moves the answer around, over many draws', () => {
    const seen = new Set();
    for (let i = 0; i < 200; i++) seen.add(shuffleOptions(['a', 'b', 'c', 'd'], 0).correctIdx);
    expect(seen.size).toBe(4); // every position reachable
  });
});

describe('position: shuffling spreads the answer evenly', () => {
  // What shuffleOptions actually guarantees. Drawn over the real corpus so a
  // regression in the wiring (not just the helper) would show up here.
  it('Wayground: the answer lands in each position about a quarter of the time', () => {
    const dist = [0, 0, 0, 0];
    for (const q of WG) dist[shuffleOptions([...q.opts], q.ans).correctIdx]++;
    for (const n of dist) expect(n / WG.length).toBeGreaterThan(0.2);
    for (const n of dist) expect(n / WG.length).toBeLessThan(0.3);
  });
});

describe('length: the known content defect, held at its current level', () => {
  // NOT closed -- see the header. These are ceilings that may fall and must not
  // rise. If distractors get rewritten these numbers drop and the bounds should
  // be tightened; if someone adds terse distractors they fail here first.
  const longestIsAnswer = (qs) =>
    qs.filter((q) => {
      const l = q.opts.map((o) => strip(o).length);
      return l.indexOf(Math.max(...l)) === q.ans;
    }).length / qs.length;

  it('Wayground: correct answer is the longest option no more often than today', () => {
    // Was 0.52. Lowered 2026-09-08 after the first balancing pass (item 114)
    // trimmed 26 answers that ended in a parenthetical the explanation already
    // repeated -- and, in 17 cases, that the *other* bank already shipped in
    // exactly the short form. Adopted, not invented.
    expect(longestIsAnswer(WG)).toBeLessThanOrEqual(0.49);
  });

  it('JAC Mockup: same ceiling — this bank is the worse of the two', () => {
    expect(longestIsAnswer(JM)).toBeLessThanOrEqual(0.72);
  });

  it('JAC Official is not affected — its options are comparably written', () => {
    // 36.8% overall, and at or near chance within each option-count group
    // (2-option 47.1% vs 50% chance, 3-option 43.2% vs 33%, 4-option 23.5% vs
    // 25%). The real exam's own questions do not have the tell; only the two
    // practice banks written for this app do, which is the useful comparison.
    expect(longestIsAnswer(JAC_OFFICIAL)).toBeLessThan(0.4);
  });
});
