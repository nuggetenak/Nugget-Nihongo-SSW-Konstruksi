// ─── utils/simulasi-mistakes.js ──────────────────────────────────────────────
// Item 93. `simulasi` wrote to no wrong-tracker at all — not `quizWrong`, not
// `wrongCounts`, not `wgWrong`, not `vocabWrong` — so the longest and most
// diagnostic session in the app, 50 questions under time pressure, was the only
// one whose mistakes left no trace once the results screen closed.
//
// The decision the item asked for is *where* they go. It draws from two pools
// with two id spaces, and the answer is not to invent a third: file each
// mistake in the store its own source already uses, so the surfaces that
// already read those stores pick it up without knowing simulasi exists.
//
//   JAC questions  -> progress.wrongCounts, keyed by the JAC question id
//                     (`tt1_q01`). This is what JACMode writes and what its
//                     "⚠ Lemah" set reads back.
//   pool questions -> progress.wgWrong, keyed `${setId}-${q.id}`. This is what
//                     WaygroundMode writes and what its per-set
//                     "⚠ Ulang N salah" reads back.
//
// And, independently of both: any question that carries a related card id also
// goes through `recordWrong` into `progress.quizWrong`, which is what FokusMode
// weighs its weakest-category drill on. All 95 JAC questions carry one; none of
// the 980 QUIZ_SETS questions do (item 96), so this half is JAC-only today and
// widens on its own the moment that item lands.
//
// Written once at submit rather than per answer, deliberately: item 48 requires
// that an exam reveals nothing about correctness until it is handed in, and a
// store written mid-exam is a store that could be read mid-exam.
// ─────────────────────────────────────────────────────────────────────────────
import { set as storageSet } from '../storage/engine.js';
import { makeWrongEntry } from './wrong-tracker.js';

/**
 * @param {Array} results  from buildSimulasiResults
 * @param {(cardId: number) => void} [recordWrong]  ProgressContext's, for the
 *   card-level tracker. Optional so the function stays testable on its own.
 */
export function recordSimulasiMistakes(results, recordWrong) {
  const wrong = results.filter((r) => !r.isCorrect);
  if (wrong.length === 0) return { wrongCounts: 0, wgWrong: 0, cards: 0 };

  const jacKeys = wrong.filter((r) => r._source === 'jac' && r._wrongKey).map((r) => r._wrongKey);
  const poolKeys = wrong.filter((r) => r._source !== 'jac' && r._wrongKey).map((r) => r._wrongKey);
  const cardIds = [...new Set(wrong.map((r) => r._cardId).filter((id) => typeof id === 'number'))];

  if (jacKeys.length || poolKeys.length) {
    storageSet('progress', (p) => {
      const next = { ...p };
      if (jacKeys.length) {
        const wc = { ...(p?.wrongCounts ?? {}) };
        jacKeys.forEach((k) => (wc[k] = makeWrongEntry(wc[k])));
        next.wrongCounts = wc;
      }
      if (poolKeys.length) {
        const wg = { ...(p?.wgWrong ?? {}) };
        poolKeys.forEach((k) => (wg[k] = makeWrongEntry(wg[k])));
        next.wgWrong = wg;
      }
      return next;
    });
  }
  cardIds.forEach((id) => recordWrong?.(id));

  return { wrongCounts: jacKeys.length, wgWrong: poolKeys.length, cards: cardIds.length };
}
