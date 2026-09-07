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

/** Question-count picker options, shared by every mode that offers a length.
 *
 *  Item 80: `kuis` and `dengar` had this; `angka`, `jebak` and `mirip` had no
 *  length control at all — always the whole shuffled pool, with no way to take
 *  a short session on the way to work. They have one now, through
 *  `SessionLengthPicker`, and it reads and writes the same
 *  `prefs.quizQuestionCount` the other two already used, so the choice follows
 *  the learner between modes instead of resetting to 10 in each. */
export const QUIZ_COUNTS = [10, 20, 30];

/** `prefs.quizQuestionCount` sentinel for "Semua" — the whole available pool.
 *
 *  QuizMode already offered "Semua" by storing the deck's own size, which meant
 *  the number persisted from one mode was a fixed count in the next, and a
 *  meaningless one at that (71 questions, because that is how many confusion
 *  pairs there are). A sentinel says what was actually chosen. */
export const QUIZ_COUNT_ALL = 0;

/**
 * How many questions to draw, given the stored preference and what is available.
 * `QUIZ_COUNT_ALL` and any value past the pool both mean "all of it".
 */
export const resolveQuizCount = (pref, total) =>
  pref === QUIZ_COUNT_ALL || pref == null || pref > total ? total : pref;

/** Auto-advance delays after an answer is revealed, in ms.
 *
 *  Item 80: this was two arrays of different shapes (`{ms,label}` in JACMode,
 *  `{v,l}` in QuizMode) offered by two of the four modes that share QuizShell —
 *  `wayground` and `vocab` render the identical screen and were pinned to the
 *  shell's 2000 ms default with no way to change it. One list now, and the
 *  choice is a preference rather than a per-session setting, so setting it
 *  where the options panel exists applies it to the modes that have no panel to
 *  put it on. */
export const AUTO_NEXT_DELAYS = [
  { ms: 1000, label: '1 dtk' },
  { ms: 1500, label: '1,5 dtk' },
  { ms: 2000, label: '2 dtk' },
  { ms: 0, label: 'Manual' },
];
export const AUTO_NEXT_DEFAULT_MS = 2000;

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
