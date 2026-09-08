// ─── utils/daily-challenge.js ─────────────────────────────────────────────────
// One JAC/Wayground/CSV question per day, seeded by date.
//
// The banks are loaded with a dynamic import, and both halves of that matter
// (item 131, second half -- the audit found the registry importer and missed
// this one, which is the larger of the two).
//
// This module statically imported JAC_OFFICIAL and QUIZ_SETS, and then called
// buildAllQuestions() at module scope. SayaTab imports the hook that imports
// this, and SayaTab is one of App.jsx's three tabs, so the chain was eager:
// every first page view downloaded wayground-sets.js (481 kB) and
// jac-mockup-sets.js (226 kB) -- modulepreloaded from index.html, before
// onboarding renders -- and then, on the main thread, materialised all 1,075
// questions into a new array with a stripFuri pass over every option. To show
// one question.
//
// Now nothing is fetched until something actually asks for today's question,
// and the built pool is cached in a promise so a re-render does not rebuild it.
// SayaTab already renders the card behind `{dailyChallengeQ && ...}`, so
// arriving a tick later costs nothing visible.
// ─────────────────────────────────────────────────────────────────────────────
import { stripFuri } from './jp-helpers.js';

let _poolPromise = null;

async function buildAllQuestions() {
  const [{ JAC_OFFICIAL }, { QUIZ_SETS }] = await Promise.all([
    import('../data/jac-official.js'),
    import('../data/quiz-sets.js'),
  ]);
  // Options render as plain buttons here (SayaTab.jsx), same convention as
  // every other mode's options (VocabMode etc. strip before handing text to
  // QuizShell/OptionButton) -- stripped once at the source instead of in the
  // component, same reasoning as SimulasiMode's own fix.
  const jac = JAC_OFFICIAL.map((q) => ({
    jp: q.q,
    id_text: q.hint,
    options: q.opts.map(stripFuri),
    answer: q.ans,
    explanation: q.exp,
  }));
  const way = QUIZ_SETS.flatMap((set) =>
    (set.questions || []).map((q) => ({
      jp: q.q,
      id_text: q.hint || null,
      options: q.opts.map(stripFuri),
      answer: q.ans,
      explanation: q.exp || null,
    }))
  );
  return [...jac, ...way];
}

/** The whole question pool, fetched and built at most once per session. */
export function loadQuestionPool() {
  if (!_poolPromise) _poolPromise = buildAllQuestions();
  return _poolPromise;
}

/** The pure selector, separated so the seeding is testable without a fetch. */
export function pickDailyChallenge(pool, dateStr) {
  if (!pool?.length) return null;
  const seed = parseInt(dateStr.replace(/-/g, ''), 10); // YYYYMMDD as integer
  return pool[seed % pool.length];
}

/**
 * Today's challenge for an ISO date string (YYYY-MM-DD). Deterministic — the
 * same date always returns the same question.
 *
 * Async since 7.3.0: see the header. Callers render behind a null check anyway.
 */
export async function getDailyChallenge(dateStr) {
  return pickDailyChallenge(await loadQuestionPool(), dateStr);
}

/** For tests: the pool is cached for the life of the module. */
export function _reset_pool_for_test() {
  _poolPromise = null;
}
