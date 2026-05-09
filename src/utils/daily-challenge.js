// ─── utils/daily-challenge.js ─────────────────────────────────────────────────
// One JAC/Wayground/CSV question per day, seeded by date.
// ─────────────────────────────────────────────────────────────────────────────
import { JAC_OFFICIAL } from '../data/jac-official.js';
import { QUIZ_SETS } from '../data/quiz-sets.js';

function buildAllQuestions() {
  const jac = JAC_OFFICIAL.map((q) => ({
    jp: q.jp,
    id_text: q.id_text,
    options: q.options,
    answer: q.answer,
    explanation: q.explanation,
  }));
  const way = QUIZ_SETS.flatMap((set) =>
    (set.questions || []).map((q) => ({
      jp: q.q,
      id_text: q.hint || null,
      options: q.opts,
      answer: q.ans,
      explanation: q.exp || null,
    }))
  );
  return [...jac, ...way];
}

const ALL_QUESTIONS = buildAllQuestions(); // called once on import

/**
 * Returns the daily challenge question for a given ISO date string (YYYY-MM-DD).
 * Deterministic — same date always returns same question.
 */
export function getDailyChallenge(dateStr) {
  const all = ALL_QUESTIONS;
  if (!all.length) return null;
  const seed = parseInt(dateStr.replace(/-/g, ''), 10); // YYYYMMDD as integer
  const idx = seed % all.length;
  return all[idx];
}

/** Returns today's date as YYYY-MM-DD string (local timezone, backward-compat re-export). */
export { todayStr } from './date.js';
