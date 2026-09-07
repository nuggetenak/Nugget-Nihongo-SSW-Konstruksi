// src/utils/constants.js
// Single source of truth for shared constants.
// Import from here — never hardcode these values in component files.

export const TOTAL_CARDS = 1626;
export const HALF_DECK_THRESHOLD = Math.ceil(TOTAL_CARDS / 2); // 813
export const FULL_DECK_THRESHOLD = TOTAL_CARDS;

/** All modes whose sessions contribute to quiz accuracy scoring. */
export const SCORED_QUIZ_MODES = ['kuis', 'jac', 'wayground', 'simulasi', 'vocab'];

/** FSRS card considered "mature" at this interval (days). */
export const SRS_MATURE_DAYS = 21;

/** Max sessions stored in progress.sessions. */
export const SESSIONS_CAP = 180;

/** Question-count picker options, shared by DengarMode/QuizMode. QuizMode adds
 *  its own dynamic 4th "Semua" option (category-filtered deck size) on top of
 *  this base rather than duplicating it — see QuizMode.jsx for that explicit
 *  deviation. */
export const QUIZ_COUNTS = [10, 20, 30];

/** Pass threshold for the exam simulation, as a percentage.
 *
 *  Lived as a bare `65` in three places that all describe the same rule:
 *  SimulasiMode's own PASS_PCT (which drove the LULUS banner), the
 *  `lulus_simulasi` achievement's `bestSimScore >= 65`, and recommend-mode's
 *  `bestSim < 65` gate on advising more practice. Three copies of one number
 *  that must agree — the badge saying "Siap Ujian" while the exam screen said
 *  "BELUM LULUS" is the drift this prevents. */
export const EXAM_PASS_PCT = 65;

/** Seconds allowed per question in the exam simulation.
 *
 *  2 minutes per question, confirmed by the owner (2026-09-04) as the real
 *  JAC convention when this contradicted `data/angka-kunci.js`, which had been
 *  teaching 90 s/question ("50 soal ÷ 75 mnt") as a memorisable exam fact.
 *  That entry was the wrong one and has been corrected to match; the number
 *  lives here now so the mode and the thing that teaches the number can never
 *  disagree again. */
export const EXAM_SECONDS_PER_QUESTION = 2 * 60;

/** The full exam's shape: 30 teori + 20 praktik = 50 questions.
 *
 *  Item 102b: the Belajar menu described `simulasi` as 'Ujian + timer' while
 *  every sibling in its section derives a real figure from the data — the
 *  mechanism that exists because hand-written counts had already gone stale
 *  twice. The counts themselves lived only inside SimulasiMode's POOL_PRESETS,
 *  which the registry cannot import: `simulasi` is a lazy chunk, and a static
 *  import there would pull the whole mode into the initial bundle to read three
 *  numbers. Both now read them from here instead. */
export const EXAM_FULL_TEORI = 30;
export const EXAM_FULL_PRAKTIK = 20;
export const EXAM_FULL_QUESTIONS = EXAM_FULL_TEORI + EXAM_FULL_PRAKTIK;

/** Minutes a run of `n` questions is given, at the rate above. Exported so the
 *  menu, the preset labels and the timer cannot quote three different budgets
 *  for the same exam. */
export const examMinutes = (n) => (n * EXAM_SECONDS_PER_QUESTION) / 60;
