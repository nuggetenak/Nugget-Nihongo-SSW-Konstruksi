// src/utils/constants.js
// Single source of truth for shared constants.
// Import from here — never hardcode these values in component files.

export const TOTAL_CARDS             = 1438;
export const HALF_DECK_THRESHOLD     = Math.ceil(TOTAL_CARDS / 2); // 719
export const FULL_DECK_THRESHOLD     = TOTAL_CARDS;

/** All modes whose sessions contribute to quiz accuracy scoring. */
export const SCORED_QUIZ_MODES = [
  'kuis', 'jac', 'wayground',
  'simulasi', 'vocab', 'kuisprod',
];

/** FSRS card considered "mature" at this interval (days). */
export const SRS_MATURE_DAYS = 21;

/** Max sessions stored in progress.sessions. */
export const SESSIONS_CAP = 180;
