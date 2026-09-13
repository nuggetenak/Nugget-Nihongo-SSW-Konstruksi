// balance-wayground-lengths.mjs — item 114, Wayground pass (2026-09-13).
//
// The 7.4.0 JAC Mockup pass built the same two halves and then left them in a chat
// session, so HANDOFF had to tell the next session to rebuild them from a prose
// description. That is the mistake this file exists to not repeat: both halves are
// committed, and running `plan` reproduces the exact work packet the authoring was
// done against.
//
//   node scripts/archive/balance-wayground-lengths.mjs plan    > packet.json
//   node scripts/archive/balance-wayground-lengths.mjs verify   (after editing)
//
// WHY THE TARGETS LOOK ASYMMETRIC. The JAC pass could randomise the answer's length
// rank uniformly inside the questions it touched, because it touched 215 of 300 — the
// 85 it left alone were a small enough remainder not to bias the bank. Wayground is
// the other shape: 397 of 680 questions have the answer at least tied-longest, and
// the other 283 already sit at r2/r3/r4 in a *skewed* distribution (166/78/39). Draw
// uniform ranks inside the touched set and the bank lands at ~12% answer-longest —
// which is not "fixed", it is the same tell with its sign flipped, and a bot that
// skips the longest option would beat chance. So the target ranks are drawn to make
// the BANK uniform, not the touched subset: the deficit against 170-per-rank is what
// gets allocated.
import { WAYGROUND_SETS } from '../../src/data/wayground-sets.js';
import { JAC_MOCKUP_SETS } from '../../src/data/jac-mockup-sets.js';

const strip = (s) => String(s).replace(/《[^》]*》/g, '');
const len = (s) => strip(s).length;

/** mulberry32 — same seed, same packet, forever. */
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const SEED = 114114;

/** Rank of the answer among the four option lengths; 1 = longest, ties take the best rank. */
function answerRank(q) {
  const l = q.opts.map(len);
  return 1 + l.filter((v, i) => i !== q.ans && v > l[q.ans]).length;
}

/** What the test measures: a bot that picks the first-longest option. */
function longestIsAnswer(qs) {
  return qs.filter((q) => {
    const l = q.opts.map(len);
    return l.indexOf(Math.max(...l)) === q.ans;
  }).length;
}

const ALL = WAYGROUND_SETS.flatMap((s) => s.questions.map((q) => ({ set: s.id, q })));
const JM_BY_Q = new Map();
for (const s of JAC_MOCKUP_SETS)
  for (const q of s.questions) JM_BY_Q.set(strip(q.q).replace(/\s+/g, ''), strip(q.opts[q.ans]));

function buildPlan() {
  const rank1 = ALL.filter(({ q }) => answerRank(q) === 1);
  const rest = ALL.filter(({ q }) => answerRank(q) !== 1);
  const have = [0, 0, 0, 0];
  for (const { q } of rest) have[answerRank(q) - 1]++;

  const perRank = Math.round(ALL.length / 4);
  // Deficit against a uniform bank, capped so the allocation sums to rank1.length.
  const want = have.map((h) => Math.max(0, perRank - h));
  const scale = rank1.length / want.reduce((a, b) => a + b, 0);
  const alloc = want.map((w) => Math.floor(w * scale));
  while (alloc.reduce((a, b) => a + b, 0) < rank1.length) alloc[3]++;

  // Questions whose answer towers over every distractor are the individually
  // guessable ones, so they are drawn first and always get a target that moves
  // them — never left to chance.
  const gap = ({ q }) => len(q.opts[q.ans]) - Math.max(...q.opts.map(len).filter((_, i) => i !== q.ans));
  const rand = rng(SEED);
  const pool = [...rank1]
    .map((e) => ({ e, key: gap(e) >= 6 ? -1 + rand() * 0.001 : rand() }))
    .sort((a, b) => a.key - b.key)
    .map((x) => x.e);

  // Hand out the non-1 ranks first (hardest constraint, and the wide-gap questions
  // sit at the head of the pool), then rank 1 for the remainder.
  const order = [4, 3, 2, 1];
  const out = [];
  let i = 0;
  for (const r of order) {
    for (let n = 0; n < alloc[r - 1]; n++, i++) {
      if (i >= pool.length) break;
      out.push({ entry: pool[i], targetRank: r });
    }
  }
  return { rank1, rest, have, alloc, plan: out };
}

/**
 * Per-slot character targets. The answer slot never moves — it is correct as
 * written and it is what the learner is there to read — so the targets are for the
 * distractors, expressed around the answer's own length A: (targetRank - 1) of them
 * must land above A, the others at or just below it. Margins stay inside ±4 so the
 * four options cluster rather than trading one tell for a spread.
 */
function slotTargets(q, targetRank, rand) {
  const A = len(q.opts[q.ans]);
  const above = targetRank - 1;
  const idx = q.opts.map((_, i) => i).filter((i) => i !== q.ans);
  // shuffle which distractors go above, so "the long one is always slot 1" never sets in
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  const targets = {};
  idx.forEach((slot, n) => {
    const delta = n < above ? 1 + Math.floor(rand() * 4) : -Math.floor(rand() * 5);
    targets[slot] = Math.max(2, A + delta);
  });
  return { answerLen: A, targets };
}

function cmdPlan() {
  const { rank1, rest, have, alloc, plan } = buildPlan();
  const rand = rng(SEED + 1);
  const packet = plan.map(({ entry, targetRank }) => {
    const { q, set } = entry;
    const { answerLen, targets } = slotTargets(q, targetRank, rand);
    return {
      set,
      qid: q.id,
      targetRank,
      answerLen,
      ans: q.ans,
      q: q.q,
      hint: q.hint,
      exp: q.exp,
      opts: q.opts.map((o, i) => ({
        i,
        text: o,
        len: len(o),
        role: i === q.ans ? 'ANSWER — do not touch' : 'distractor',
        target: i === q.ans ? null : targets[i],
      })),
    };
  });
  console.log(
    JSON.stringify(
      {
        bank: { questions: ALL.length, rank1: rank1.length, untouched: rest.length, untouchedRanks: have },
        allocation: { r1: alloc[0], r2: alloc[1], r3: alloc[2], r4: alloc[3] },
        seed: SEED,
        packet,
      },
      null,
      1
    )
  );
}

function cmdVerify() {
  const problems = [];
  const ranks = [0, 0, 0, 0];
  let ansSum = 0,
    disSum = 0,
    worstGap = -Infinity;

  for (const { set, q } of ALL) {
    const where = `${set}#${q.id}`;
    const l = q.opts.map(len);

    if (q.opts.length !== 4) problems.push(`${where}: ${q.opts.length} options, expected 4`);
    if (q.opts.length !== q.opts_id.length)
      problems.push(`${where}: ${q.opts.length} opts vs ${q.opts_id.length} opts_id`);
    if (q.ans < 0 || q.ans >= q.opts.length) problems.push(`${where}: ans ${q.ans} out of range`);

    const seen = new Set();
    for (const [i, o] of q.opts.entries()) {
      const key = strip(o).trim();
      if (!key) problems.push(`${where}: option ${i} is blank`);
      if (seen.has(key)) problems.push(`${where}: option ${i} duplicates another option (${key})`);
      seen.add(key);
    }
    const seenId = new Set();
    for (const [i, o] of q.opts_id.entries()) {
      const key = String(o).trim();
      if (!key) problems.push(`${where}: opts_id ${i} is blank`);
      if (seenId.has(key)) problems.push(`${where}: opts_id ${i} duplicates another gloss (${key})`);
      seenId.add(key);
    }

    // Ruby. Two mechanical rules only -- the readings that actually break are the
    // ones whose base is a run of bare kanji, because `extendBaseLeft` has no kana
    // to anchor a wider base on and leaves the <rt> spilling over its neighbours.
    // A reading sitting on okurigana is the parser's extending case and is not this
    // script's business; `src/tests/ruby-scope.test.js` measures that through the
    // real parser, which a dependency-free .mjs cannot import.
    for (const o of q.opts) {
      for (const m of String(o).matchAll(/([^《》]*)《([^》]*)》/g)) {
        const [, before, reading] = m;
        if (!/^[\u3041-\u309F\u30FC]+$/.test(reading))
          problems.push(`${where}: reading 《${reading}》 is not hiragana`);
        const base = (before.match(/[\u3005\u4E00-\u9FFF]+$/) || [''])[0];
        if (base && reading.length > base.length * 3)
          problems.push(`${where}: 《${reading}》 is wider than ${base} can hold`);
        if (!base && /[0-9A-Za-z]$/.test(before))
          problems.push(`${where}: 《${reading}》 hangs off a digit/latin prefix`);
      }
    }

    // the one accidental-correct case a machine can catch
    const twin = JM_BY_Q.get(strip(q.q).replace(/\s+/g, ''));
    if (twin) {
      for (const [i, o] of q.opts.entries()) {
        if (i !== q.ans && strip(o) === twin)
          problems.push(`${where}: distractor ${i} is the other bank's correct answer (${twin})`);
      }
    }

    ranks[answerRank(q) - 1]++;
    ansSum += l[q.ans];
    disSum += l.reduce((a, v, i) => (i === q.ans ? a : a + v), 0) / (l.length - 1);
    worstGap = Math.max(worstGap, l[q.ans] - Math.max(...l.filter((_, i) => i !== q.ans)));
  }

  const n = ALL.length;
  const rate = longestIsAnswer(ALL.map((e) => e.q)) / n;
  console.log(`Wayground: ${n} questions`);
  console.log(`  answer is first-longest: ${(100 * rate).toFixed(1)}%  (target 25.0%, bounds 17-26%)`);
  console.log(`  answer length rank:      ${ranks.map((v, i) => `r${i + 1} ${(100 * v / n).toFixed(1)}%`).join('  ')}`);
  console.log(`  mean answer ${(ansSum / n).toFixed(1)} vs mean distractor ${(disSum / n).toFixed(1)} (must be within 1.5)`);
  console.log(`  widest single-question gap: ${worstGap} (must be <= 5)`);
  if (problems.length) {
    console.log(`\n${problems.length} problem(s):`);
    for (const p of problems.slice(0, 60)) console.log(`  - ${p}`);
    process.exitCode = 1;
  } else {
    console.log('\nno structural problems');
  }
}

const cmd = process.argv[2];
if (cmd === 'plan') cmdPlan();
else if (cmd === 'verify') cmdVerify();
else {
  console.error('usage: balance-wayground-lengths.mjs plan|verify');
  process.exitCode = 2;
}
