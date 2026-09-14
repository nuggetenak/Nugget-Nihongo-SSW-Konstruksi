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
// 2. LENGTH. The correct answer was the single longest option 51.5% of the time
//    in Wayground (48.3% after the first balancing pass) and 72.0% in JAC
//    Mockup, because answers are written out and distractors were written
//    tersely -- mean 11.5 vs 8.3 characters, and 9.9 vs 6.0. A bot that ignores
//    the question and picks the longest option scores those same figures,
//    against a 25% baseline and a 65% pass mark.
//
//    **Shuffling does not touch this.** The bot picks by length, not position,
//    so it finds the answer wherever it lands. Closing it meant rewriting
//    distractors to comparable length -- a content project, not a code change.
//
//    **Both banks are closed as of 7.5.0.** JAC Mockup went 71.7% -> 22.7% in
//    7.4.0 over 215 rewritten questions, mean distractor length 6.0 -> 10.0
//    against a mean answer of 9.9. Wayground followed in 7.5.0: 48.5% -> 20.4%
//    over 191 rewritten questions, mean distractor 8.3 -> 10.7 against a mean
//    answer of 11.1 (48.5% is this branch's starting point, measured; 51.5% was
//    the figure before 7.4.0's first pass trimmed 26 Wayground answers).
//
//    Wayground's second pass ran to a threshold rather than a count: rewrite
//    every question whose answer stands 3+ characters above its longest
//    distractor -- 185 of them at the branch point. That is the population a
//    learner can pick by sight, and it is a statement about the content rather
//    than about this file; the rate falls out of it. The widest remaining gap is
//    2 characters, so the per-question bound below is slack by three. It is kept
//    at 5 to match JAC Mockup's, because 5 is the figure that says "no single
//    question is guessable on its own" -- 2 is just where this corpus landed.
//
//    The bounds below are two-sided on purpose. A ceiling alone would be passed
//    by driving the figure to zero, and "the answer is never the longest" is the
//    same tell with its sign flipped -- a bot that skips the longest option
//    would then beat chance. What the test wants is the figure sitting *at*
//    chance, so the floor matters as much as the ceiling.
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

  it('Wayground: at chance now, and must stay there in both directions', () => {
    // 20.4% measured 2026-09-14 against a 25.0% baseline, down from 51.5% (and
    // from the 0.49 ceiling this assertion held between the two passes). Two-
    // sided for the reason in the header: below the floor the bank would be
    // telling a bot to *avoid* the longest option.
    const rate = longestIsAnswer(WG);
    expect(rate).toBeLessThanOrEqual(0.26);
    expect(rate).toBeGreaterThanOrEqual(0.17);
  });

  it('Wayground: answers and distractors are now the same length on average', () => {
    // 11.1 vs 10.7 characters. Same property as the JAC Mockup case below: the
    // rate above can be satisfied by extreme questions cancelling out, and this
    // is the underlying distribution that cannot.
    const strip2 = (q, i) => strip(q.opts[i]).length;
    const ans = WG.reduce((a, q) => a + strip2(q, q.ans), 0) / WG.length;
    const dis =
      WG.reduce(
        (a, q) =>
          a +
          q.opts.reduce((b, _, i) => (i === q.ans ? b : b + strip2(q, i)), 0) / (q.opts.length - 1),
        0
      ) / WG.length;
    expect(Math.abs(ans - dis)).toBeLessThan(1.5);
  });

  it('Wayground: no answer towers over its distractors any more', () => {
    // The 74 questions with a 6+ character gap are gone, and so are the 185 with
    // 3+. Widest remaining is 2. Held at 5 -- see the header for why the bound is
    // not tightened to what was measured.
    const worst = Math.max(
      ...WG.map((q) => {
        const l = q.opts.map((o) => strip(o).length);
        return l[q.ans] - Math.max(...l.filter((_, i) => i !== q.ans));
      })
    );
    expect(worst).toBeLessThanOrEqual(5);
  });

  it('JAC Mockup: at chance now, and must stay there in both directions', () => {
    // 22.7% measured 2026-09-09 against a 25.0% baseline, down from 71.7%.
    // Two-sided: below the floor the bank would be telling a bot to *avoid* the
    // longest option, which is worth exactly as much as the old tell was.
    const rate = longestIsAnswer(JM);
    expect(rate).toBeLessThanOrEqual(0.26);
    expect(rate).toBeGreaterThanOrEqual(0.17);
  });

  it('JAC Mockup: answers and distractors are now the same length on average', () => {
    // The distribution above can be satisfied by a few extreme questions
    // cancelling out. This is the underlying property: 9.9 vs 10.0 characters.
    const strip2 = (q, i) => strip(q.opts[i]).length;
    const ans = JM.reduce((a, q) => a + strip2(q, q.ans), 0) / JM.length;
    const dis =
      JM.reduce(
        (a, q) =>
          a +
          q.opts.reduce((b, _, i) => (i === q.ans ? b : b + strip2(q, i)), 0) / (q.opts.length - 1),
        0
      ) / JM.length;
    expect(Math.abs(ans - dis)).toBeLessThan(1.5);
  });

  it('JAC Mockup: no answer towers over its distractors any more', () => {
    // The 16 questions with a 10+ character gap and the 49 with 6-9 are gone;
    // the widest remaining gap is 5. A single question that far out is guessable
    // on its own, whatever the bank-wide figure says.
    const worst = Math.max(
      ...JM.map((q) => {
        const l = q.opts.map((o) => strip(o).length);
        return l[q.ans] - Math.max(...l.filter((_, i) => i !== q.ans));
      })
    );
    expect(worst).toBeLessThanOrEqual(5);
  });

  it('JAC Official is not affected — its options are comparably written', () => {
    // 36.8% overall, and at or near chance within each option-count group
    // (2-option 47.1% vs 50% chance, 3-option 43.2% vs 33%, 4-option 23.5% vs
    // 25%). The real exam's own questions do not have the tell; only the two
    // practice banks written for this app do, which is the useful comparison.
    expect(longestIsAnswer(JAC_OFFICIAL)).toBeLessThan(0.4);
  });
});
