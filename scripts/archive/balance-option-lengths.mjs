// scripts/archive/balance-option-lengths.mjs — ONE-SHOT, ALREADY RUN. Do not run again.
//
// UI_UX_PLAN item 114. In the two practice banks the correct answer is the
// longest option far more often than chance: 51.1% in Wayground and 70.2% in JAC
// Mockup, against 36.3% in JAC Official — which is the real exam's own questions
// and shows no tell at all. A learner who reads nothing and picks the longest
// option scores those figures against a 65% pass mark, and is being trained on a
// cue the real exam does not have.
//
// This script applies the half of the repair that carries no authoring risk.
//
// RULE 1 — drop a trailing parenthetical from the correct answer.
//   `安全データシート（SDS/MSDS）` becomes `安全データシート`, which is
//   byte-for-byte what the *other* bank already ships for the same question. So
//   the short form is not invented here; it is adopted from the corpus. The
//   detail is not lost either: every one of these questions repeats it in `exp`,
//   which the learner reads straight after answering. Applied to `opts_id` in
//   the same move — the Indonesian gloss carries the identical tell, and fixing
//   only the Japanese would leave it intact for anyone studying with IDs shown.
//
//   Guarded: only where the answer is currently the longest option, only where
//   the trimmed text stays unique among the options, and never below 2 chars.
//
// What this script deliberately does NOT do is write distractors. The larger
// half of the tell is that distractors are terse where answers are sentences
// (`色`, `任意`, `5m` against `試験圧の1.5倍以上で作業員を退避`), and repairing
// that means authoring plausible-but-wrong Japanese for hundreds of questions.
// A distractor that is accidentally correct is a worse defect than the tell, and
// this bank has already shipped one wrong safety answer (item 115). That work is
// still open and is tracked as item 114.
import { readFileSync, writeFileSync } from 'node:fs';
import { JAC_MOCKUP_SETS } from '../../src/data/jac-mockup-sets.js';
import { WAYGROUND_SETS } from '../../src/data/wayground-sets.js';
import { stripFuri } from '../../src/utils/jp-helpers.js';

const TAIL_JP = /[（(][^（()）]*[）)]\s*$/;
const len = (s) => stripFuri(s ?? '').replace(/\s+/g, '').length;

const FILES = {
  'src/data/jac-mockup-sets.js': JAC_MOCKUP_SETS,
  'src/data/wayground-sets.js': WAYGROUND_SETS,
};

let trimmed = 0;
for (const [path, sets] of Object.entries(FILES)) {
  let text = readFileSync(path, 'utf8');
  for (const set of sets) {
    for (const q of set.questions ?? []) {
      const opts = q.opts ?? [];
      if (opts.length < 2) continue;
      const answer = opts[q.ans];
      if (!answer || !TAIL_JP.test(stripFuri(answer))) continue;

      const lens = opts.map(len);
      const maxOther = Math.max(...lens.filter((_, i) => i !== q.ans));
      if (lens[q.ans] <= maxOther) continue; // not the tell

      const short = answer.replace(TAIL_JP, '').trim();
      if (len(short) < 2) continue;
      const others = opts.filter((_, i) => i !== q.ans).map((o) => stripFuri(o).trim());
      if (others.includes(stripFuri(short).trim())) continue; // would collide

      const before = text;
      text = text.replaceAll(JSON.stringify(answer).slice(1, -1), JSON.stringify(short).slice(1, -1));
      text = text.replaceAll(answer, short);

      const gloss = q.opts_id?.[q.ans];
      if (gloss && /\([^()]*\)\s*$/.test(gloss)) {
        const shortGloss = gloss.replace(/\([^()]*\)\s*$/, '').trim();
        if (shortGloss.length > 3) text = text.replaceAll(gloss, shortGloss);
      }
      if (text !== before) {
        trimmed++;
        console.log(`  ${set.id}/${q.id}  ${lens[q.ans]} → ${len(short)} chars (max other ${maxOther})`);
      }
    }
  }
  writeFileSync(path, text);
}
console.log(`\nTrimmed ${trimmed} answers.`);
