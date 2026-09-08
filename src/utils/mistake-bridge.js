// ─── utils/mistake-bridge.js ─────────────────────────────────────────────────
// One place to file a wrong answer, for the modes whose questions are not
// card-shaped.
//
// The app has one card-level wrong-answer store, `progress.quizWrong`, keyed by
// card id. It is what FokusMode weighs "Latih kelemahan" on and what StatsMode's
// per-category weakness view reads. Three separate defects came out of nobody
// owning the route into it (items 127, 128, 129):
//
//   * ConfusionMode ("Kata Mirip", 656 lines) recorded nothing anywhere. Answer
//     every pair wrong and the app learned nothing.
//   * Wayground, Vocab and JAC recorded into their own per-set stores and never
//     bridged. So a card missed in Wayground -- 680 questions, the largest bank
//     in the app -- never reached Fokus or Stats, while the *same* question
//     missed inside simulasi did, because simulasi-mistakes.js bridges it. The
//     same mistake counted or did not depending on which screen you made it on.
//   * DangerMode called `recordWrong('danger-<term>')`, putting string keys into
//     a store every reader treats as card-keyed. Inert in FokusMode, a `NaN`
//     property in StatsMode, and exported forever.
//
// Two rules, and they are the same two simulasi-mistakes.js already follows:
//
//   1. A mistake on content that has a card goes to the card store, so the
//      surfaces that already read it pick it up without knowing the mode exists.
//   2. A mistake on content that has no card goes to `progress.termWrong`, keyed
//      by the term. NOT into the card store under an invented key -- that is
//      what item 129 was.
//
// Only about half of DANGER_PAIRS and a minority of CONFUSION_PAIRS have a card
// (measured 2026-09-08: 10/20 and 5/28 with both terms resolving), so both
// halves are load-bearing. Resolution is by furigana-stripped `jp`, because the
// pair files and the card corpus were authored separately and spell readings
// differently.
// ─────────────────────────────────────────────────────────────────────────────
import { CARDS } from '../data/cards.js';
import { stripFuri } from './jp-helpers.js';
import { set as storageSet } from '../storage/engine.js';
import { makeWrongEntry } from './wrong-tracker.js';

// Built once, lazily: 1,626 entries is cheap but there is no reason to pay for
// it on a screen that never grades anything.
let _index = null;
function cardIndex() {
  if (_index) return _index;
  _index = new Map();
  for (const c of CARDS) {
    const key = stripFuri(c.jp ?? '').trim();
    // First card wins. Duplicate jp across cards is rare and either card is a
    // defensible target for "you got this term wrong".
    if (key && !_index.has(key)) _index.set(key, c.id);
  }
  return _index;
}

/** The card id for a Japanese term, or null when the corpus has no such card. */
export function cardIdForTerm(term) {
  if (!term) return null;
  return cardIndex().get(stripFuri(term).trim()) ?? null;
}

/**
 * Files one wrong answer on a term.
 *
 * @param {string} term        the Japanese term the learner got wrong
 * @param {(cardId: number) => void} [recordWrong]  ProgressContext's, for the
 *   card store. Optional so this stays testable without a provider.
 * @returns {'card'|'term'|'none'} where it went — returned so a caller can
 *   assert on it and so the tests can tell the two paths apart.
 */
export function recordTermMistake(term, recordWrong) {
  if (!term) return 'none';
  const cardId = cardIdForTerm(term);
  if (cardId !== null) {
    recordWrong?.(cardId);
    return 'card';
  }
  const key = stripFuri(term).trim();
  storageSet('progress', (p) => ({
    ...p,
    termWrong: { ...(p?.termWrong ?? {}), [key]: makeWrongEntry(p?.termWrong?.[key]) },
  }));
  return 'term';
}

/** For tests: the index is module-level, and CARDS is a module-level import. */
export function _reset_index_for_test() {
  _index = null;
}
