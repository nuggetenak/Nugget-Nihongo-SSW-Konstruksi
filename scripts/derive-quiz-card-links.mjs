#!/usr/bin/env node
// ─── scripts/derive-quiz-card-links.mjs ──────────────────────────────────────
// Item 96. 0 of 980 questions in QUIZ_SETS carry a `related_card_id`; all 95 in
// JAC_OFFICIAL do. That gap is what keeps "Latih N salah" dark in `wayground`
// and `vocab`, and it is what item 79 ran into again from the other direction.
//
// The item asks for the job to be *sized honestly before anyone starts*, which
// is what this script is: it proposes a link for every question it can, sorts
// the proposals into confidence tiers, and writes them out for review. It
// changes no data — a wrong link is worse than no link, because it sends a
// learner to a card that does not teach the answer.
//
// How a link is proposed: card headwords (`jp`, furigana stripped) are matched
// against the question stem, longest first, so 鉄骨造 wins over 鉄骨 wherever
// both appear. A headword carried by more than one card is skipped entirely —
// it cannot identify one of them.
//
// Tiers, by how much of the question the matched headword accounts for:
//
//   high    >= 4 characters, in the stem. Sampled by hand and correct; these
//           are terms specific enough that their presence is the subject.
//   medium  3 characters in the stem, or >= 4 in the correct answer. The
//           question is probably about it. Probably is not good enough to ship
//           unread.
//   low     2 characters anywhere. 安全, 危険, 作業 and their like sit inside
//           longer compounds constantly, so these are as often the wrong card
//           as the right one — 危険 for a question about 危険予知訓練 is not a
//           lie, but it is not the card that teaches the answer either.
//   none    no headword in the corpus appears in the question at all.
//
// Usage:  node scripts/derive-quiz-card-links.mjs [--out proposals.json]
// ─────────────────────────────────────────────────────────────────────────────
import { writeFileSync } from 'fs';
import { CARDS } from '../src/data/cards.js';
import { QUIZ_SETS } from '../src/data/quiz-sets.js';
import { stripFuri } from '../src/utils/jp-helpers.js';

const MIN_HEAD = 2;
const TIER_HIGH = 4;
const TIER_MEDIUM = 3;

const heads = CARDS.map((c) => ({ id: c.id, head: stripFuri(c.jp).trim(), idText: c.id_text }))
  .filter((h) => h.head.length >= MIN_HEAD)
  .sort((a, b) => b.head.length - a.head.length);

const headCount = {};
heads.forEach((h) => (headCount[h.head] = (headCount[h.head] ?? 0) + 1));
const ambiguous = Object.entries(headCount).filter(([, n]) => n > 1);
const usable = heads.filter((h) => headCount[h.head] === 1);

const findIn = (text, minLen) => {
  const t = stripFuri(text ?? '');
  for (const h of usable) if (h.head.length >= minLen && t.includes(h.head)) return h;
  return null;
};

const tiers = { high: [], medium: [], low: [], none: [] };
for (const set of QUIZ_SETS) {
  for (const q of set.questions) {
    const base = { set: set.id, question: q.id, jp: stripFuri(q.q), hint: q.hint ?? null };
    const inStemHigh = findIn(q.q, TIER_HIGH);
    if (inStemHigh) {
      tiers.high.push({
        ...base,
        head: inStemHigh.head,
        cardId: inStemHigh.id,
        cardText: inStemHigh.idText,
      });
      continue;
    }
    const medium = findIn(q.q, TIER_MEDIUM) ?? findIn(q.opts?.[q.ans], TIER_HIGH);
    if (medium) {
      tiers.medium.push({ ...base, head: medium.head, cardId: medium.id, cardText: medium.idText });
      continue;
    }
    const low = findIn(q.q, MIN_HEAD) ?? findIn(q.opts?.[q.ans], MIN_HEAD);
    if (low) {
      tiers.low.push({ ...base, head: low.head, cardId: low.id, cardText: low.idText });
      continue;
    }
    tiers.none.push(base);
  }
}

const total = QUIZ_SETS.reduce((n, s) => n + s.questions.length, 0);
const pct = (n) => `${((n / total) * 100).toFixed(1)}%`;

console.log(`QUIZ_SETS questions      : ${total}`);
console.log(`card headwords usable    : ${usable.length} of ${heads.length}`);
console.log(`  skipped as ambiguous   : ${ambiguous.length} headwords on more than one card`);
console.log('');
for (const k of ['high', 'medium', 'low', 'none']) {
  console.log(`${k.padEnd(8)} ${String(tiers[k].length).padStart(4)}  ${pct(tiers[k].length)}`);
}
console.log('');
console.log(`Auto-linkable with confidence  : ${tiers.high.length} (${pct(tiers.high.length)})`);
console.log(
  `Needs a human read             : ${tiers.medium.length + tiers.low.length + tiers.none.length}`
);

const outFlag = process.argv.indexOf('--out');
if (outFlag !== -1 && process.argv[outFlag + 1]) {
  writeFileSync(process.argv[outFlag + 1], JSON.stringify(tiers, null, 1), 'utf8');
  console.log(`\nwritten to ${process.argv[outFlag + 1]}`);
}
