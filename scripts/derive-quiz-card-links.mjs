#!/usr/bin/env node
// ─── scripts/derive-quiz-card-links.mjs ──────────────────────────────────────
// Item 96, then item 205. 0 of 980 questions in QUIZ_SETS carried a
// `related_card_id`; all 95 in JAC_OFFICIAL did. That gap is what keeps
// "Latih N salah" dark in `wayground` and `vocab`, and it is what item 79 ran
// into again from the other direction.
//
// The item asks for the job to be *sized honestly before anyone starts*, which
// is what this script is: it proposes a link for every question it can, sorts
// the proposals into confidence tiers, and writes them out for review. It
// changes no data — a wrong link is worse than no link, because it sends a
// learner to a card that does not teach the answer.
//
// How a link is proposed: card headwords (`jp`, furigana stripped) are matched
// against the question, longest first, so 鉄骨造 wins over 鉄骨 wherever both
// appear.
//
// ── What item 205 changed, and why ───────────────────────────────────────────
//
// The first version ranked a proposal by HOW LONG the matched headword was.
// Closing the medium tier by hand showed that the length is the weaker half of
// the signal: what matters is WHAT the headword matched. A four-character run
// inside a stem is a topic; a headword that IS the correct answer is the
// lesson. So the tiers lead with two identity tests, and length only decides
// between the substring tiers below them.
//
// That reordering is not cosmetic. Fifty unlinked questions had an answer that
// was, whole, a card headword -- 温水管, 検電器, 朝礼 -- and not one of them
// reached a tier anybody would apply unread: 47 were filed `low` and 3
// `medium`, because 温水管 is three characters and the answer was only
// consulted at four. Forty-seven of them sat in the tier whose own definition
// says it is "as often the wrong card as the right one", behind 375 rows nobody
// could justify reading. All fifty read correct on review.
//
// Three more changes, each from a failure `docs/QUIZ_CONTENT_GAPS.md` recorded
// when the medium tier was closed:
//
//   * Text is normalised (NFKC, spaces and interpuncts removed) before
//     matching. `EF ソケット` written with a space missed `EFソケット`
//     entirely: one space defeated the match.
//   * An ambiguous headword -- one carried by more than one card -- is no
//     longer dropped. It cannot identify a card on its own, but a human reads two
//     candidates in seconds, and three of the seven links recovered by hand
//     in 7.6.0 were ambiguity discards. They go to their own bucket carrying
//     every candidate, which is a review queue rather than a silence.
//   * Questions that already carry a `related_card_id` are excluded from the
//     tiers and counted separately. The script used to re-tier all 980 however
//     many were linked, so after 7.6.0 applied 468 links it still reported
//     "needs a human read: 677" -- a claim about a list that was no longer
//     true of the list.
//
// Tiers, strongest first:
//
//   answer      the correct answer IS a card headword, whole. The card teaches
//               precisely the thing the question is testing.
//   definition  the stem is 「Xの意味は…」/「Xとは…」 and X IS a card headword.
//               The question asks what X means; the card says what X means.
//               These are JP→ID questions whose answer is the Indonesian
//               gloss and carries no Japanese at all, so no amount of reading
//               the ANSWER could ever have found them.
//   high        >= 4 characters, in the stem. Sampled by hand and correct;
//               these are terms specific enough that their presence is the
//               subject.
//   medium      3 characters in the stem, or >= 4 in the correct answer. The
//               question is probably about it. Probably is not good enough to
//               ship unread. (All 222 read in 7.6.0: 156 applied, 66 rejected.)
//   low         2 characters anywhere. 安全, 危険, 作業 and their like sit
//               inside longer compounds constantly, so these are as often the
//               wrong card as the right one — 危険 for a question about
//               危険予知訓練 is not a lie, but it is not the card that teaches
//               the answer either.
//   ambiguous   matched on a headword more than one card carries. An identity
//               match here outranks every substring tier -- two named cards,
//               one certainly right, is a decision; a three-character run is a
//               guess. Carries every candidate, and says which kind it is.
//   none        no headword in the corpus appears in the question at all.
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

// U+30FB KATAKANA MIDDLE DOT, named rather than typed: as a literal in a
// character class it is indistinguishable from a full stop at a glance, and the
// ideographic space beside it tripped `no-irregular-whitespace`. NFKC already
// folds U+3000 to a plain space and U+FF65 to this, so `\s` plus this one
// codepoint is the whole separator set.
const MIDDLE_DOT = String.fromCodePoint(0x30fb);
const SEPARATORS = new RegExp(`[\\s${MIDDLE_DOT}]`, 'g');

/**
 * Compare-form of a string: full-width forms folded to half (NFKC), and every
 * space and interpunct dropped. Stems and headwords disagree about both --
 * `EF ソケット` vs `EFソケット`, `上水道 ・ ガス EF 接合` vs `EF接合` -- and
 * neither disagreement means anything to a reader.
 */
const norm = (s) => (s ?? '').normalize('NFKC').replace(SEPARATORS, '');

const heads = CARDS.map((c) => ({ id: c.id, head: stripFuri(c.jp).trim(), idText: c.id_text }))
  .filter((h) => h.head.length >= MIN_HEAD)
  .sort((a, b) => b.head.length - a.head.length);

/** Every card carrying a given headword, keyed by its compare-form. */
const byHead = new Map();
for (const h of heads) {
  const k = norm(h.head);
  if (!byHead.has(k)) byHead.set(k, []);
  byHead.get(k).push(h);
}

const usable = heads.filter((h) => byHead.get(norm(h.head)).length === 1);
const ambiguousHeads = [...byHead.values()].filter((v) => v.length > 1);

/** Longest usable headword of at least `minLen` occurring anywhere in `text`. */
const findIn = (text, minLen) => {
  const t = norm(stripFuri(text ?? ''));
  for (const h of usable) {
    const n = norm(h.head);
    if (n.length >= minLen && t.includes(n)) return h;
  }
  return null;
};

/** Same, over the headwords more than one card carries. Returns the candidates. */
const findAmbiguous = (text, minLen) => {
  const t = norm(stripFuri(text ?? ''));
  for (const cands of ambiguousHeads) {
    const n = norm(cands[0].head);
    if (n.length >= minLen && t.includes(n)) return cands;
  }
  return null;
};

// 「Xの意味は何ですか？」 and 「Xとは何ですか？」 -- the two spellings the
// wglv-jp banks use for "what does X mean". The group is everything before the
// marker, so a full sentence produces a full sentence and simply fails the
// exact headword lookup below; only a stem that IS a term can match.
const DEFINITION_STEM = /^(.+?)(?:の意味は|とは)(?:何ですか|何か)?[？?。]?$/;

const cardsFor = (text) => byHead.get(norm(stripFuri(text ?? ''))) ?? null;

const tiers = {
  answer: [],
  definition: [],
  high: [],
  medium: [],
  low: [],
  ambiguous: [],
  none: [],
};
let alreadyLinked = 0;
let total = 0;

for (const set of QUIZ_SETS) {
  for (const q of set.questions) {
    total++;
    if (q.related_card_id != null) {
      alreadyLinked++;
      continue;
    }
    const base = { set: set.id, question: q.id, jp: stripFuri(q.q), hint: q.hint ?? null };
    const one = (h, tier) =>
      tiers[tier].push({ ...base, head: h.head, cardId: h.id, cardText: h.idText });
    const many = (cands, why) =>
      tiers.ambiguous.push({
        ...base,
        head: cands[0].head,
        why,
        candidates: cands.map((c) => ({ cardId: c.id, cardText: c.idText })),
      });

    // 1. The correct answer, whole, is a card headword.
    const answerCards = cardsFor(q.opts?.[q.ans]);
    if (answerCards?.length === 1) {
      one(answerCards[0], 'answer');
      continue;
    }

    // 2. The stem asks what a term means, and that term is a card headword.
    const defMatch = DEFINITION_STEM.exec(stripFuri(q.q).trim());
    const defCards = defMatch && cardsFor(defMatch[1]);
    if (defCards?.length === 1) {
      one(defCards[0], 'definition');
      continue;
    }

    // 3. Both identity tests can land on an ambiguous headword, and that beats
    //    every substring tier below rather than falling through to them. Two
    //    named candidates, one of which is certainly right, is a five-second
    //    decision; a three-character run found somewhere in the stem is a
    //    guess. Letting the substring tiers answer first is how `wgl10#1` --
    //    whose answer is 脚立, on exactly two cards -- would get silently
    //    linked to whatever else its stem happens to contain.
    if (answerCards?.length > 1) {
      many(answerCards, 'answer');
      continue;
    }
    if (defCards?.length > 1) {
      many(defCards, 'definition');
      continue;
    }

    // 4-6. Substring tiers, by how much of the question the headword accounts for.
    const inStemHigh = findIn(q.q, TIER_HIGH);
    if (inStemHigh) {
      one(inStemHigh, 'high');
      continue;
    }
    const medium = findIn(q.q, TIER_MEDIUM) ?? findIn(q.opts?.[q.ans], TIER_HIGH);
    if (medium) {
      one(medium, 'medium');
      continue;
    }
    const low = findIn(q.q, MIN_HEAD) ?? findIn(q.opts?.[q.ans], MIN_HEAD);
    if (low) {
      one(low, 'low');
      continue;
    }

    // 7. Nothing unambiguous anywhere. Surface whatever the ambiguous set can
    //    reach rather than reporting this question as unreachable.
    const ambAny =
      findAmbiguous(q.q, TIER_HIGH) ??
      findAmbiguous(q.q, TIER_MEDIUM) ??
      findAmbiguous(q.q, MIN_HEAD) ??
      findAmbiguous(q.opts?.[q.ans], MIN_HEAD);
    if (ambAny) {
      many(ambAny, 'substring');
      continue;
    }

    tiers.none.push(base);
  }
}

const unlinked = total - alreadyLinked;
const pct = (n, of) => `${((n / of) * 100).toFixed(1)}%`;

console.log(`QUIZ_SETS questions      : ${total}`);
console.log(`  already linked         : ${alreadyLinked}  (${pct(alreadyLinked, total)})`);
console.log(`  left to tier           : ${unlinked}`);
console.log('');
console.log(`card headwords           : ${heads.length}`);
console.log(`  identify one card      : ${usable.length}`);
console.log(
  `  carried by several     : ${ambiguousHeads.length} headwords on ` +
    `${ambiguousHeads.reduce((n, c) => n + c.length, 0)} cards — surfaced, not dropped`
);
console.log('');
for (const k of ['answer', 'definition', 'high', 'medium', 'low', 'ambiguous', 'none']) {
  const row = `${k.padEnd(11)} ${String(tiers[k].length).padStart(4)}  ${pct(tiers[k].length, unlinked)}`;
  // The ambiguous bucket holds two different kinds of work and the counts are
  // not interchangeable: an identity match with two candidates is a decision,
  // a substring match with two candidates is still a guess with a shortlist.
  if (k !== 'ambiguous') {
    console.log(row);
    continue;
  }
  const ident = tiers.ambiguous.filter((a) => a.why !== 'substring').length;
  console.log(`${row}   (${ident} identity, ${tiers.ambiguous.length - ident} substring)`);
}
console.log('');
const identity = tiers.answer.length + tiers.definition.length;
console.log(`Identity match, safe to apply  : ${identity}`);
console.log(`Plus the high tier             : ${identity + tiers.high.length}`);
console.log(
  `Needs a human read             : ${tiers.medium.length + tiers.low.length + tiers.ambiguous.length}`
);

const outFlag = process.argv.indexOf('--out');
if (outFlag !== -1 && process.argv[outFlag + 1]) {
  writeFileSync(process.argv[outFlag + 1], JSON.stringify(tiers, null, 1), 'utf8');
  console.log(`\nwritten to ${process.argv[outFlag + 1]}`);
}
