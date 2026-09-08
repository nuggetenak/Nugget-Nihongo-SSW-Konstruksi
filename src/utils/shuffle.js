// Fisher-Yates shuffle — returns a new shuffled copy, does NOT mutate original
export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Shuffle a question's answer options and report where the correct one landed.
 *
 * The three static-bank modes (`wayground`, `vocab`, `jac`) rendered
 * `q.opts` in source order with `correctIdx: q.ans` straight from the data, so
 * the options never moved. That leaked the answer, because the correct option
 * is written more fully than its distractors: measured over the real corpus, a
 * bot that just picks the longest option scores **72.0% on JAC Mockup and 51.5%
 * on Wayground**, against a 65% pass mark and a 25% baseline. Someone drilling
 * those banks is rewarded for reading option length rather than Japanese, and
 * then meets a real exam that has no such tell.
 *
 * `SimulasiMode` and `quiz-generator` already shuffled; this is that same
 * behaviour, factored out so the three that didn't cannot drift from it again.
 *
 * Call once per draw, never per render: these modes memoise their question
 * list, and re-shuffling on render would move the options between the tap and
 * the feedback -- the defect item 85 was filed for.
 *
 * @param {Array} options  display-ready options, any shape
 * @param {number} correctIdx  index of the correct option in `options`
 * @returns {{ options: Array, correctIdx: number }}
 */
export function shuffleOptions(options, correctIdx) {
  if (!Array.isArray(options) || options.length < 2) return { options, correctIdx };
  const shuffled = shuffle(options.map((opt, origIdx) => ({ opt, origIdx })));
  return {
    options: shuffled.map((o) => o.opt),
    // -1 only if the caller passed an index outside the array, which is a data
    // bug; preserved rather than silently remapped to 0, so it stays visible.
    correctIdx: shuffled.findIndex((o) => o.origIdx === correctIdx),
  };
}
