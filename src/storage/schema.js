// ─── storage/schema.js ────────────────────────────────────────────────────────
// Defines v2 storage: 3 documents instead of 20+ scattered keys.
// ─────────────────────────────────────────────────────────────────────────────

export const STORAGE_VERSION = 2;

export const DOCS = {
  progress: 'ssw-progress', // known/unknown/starred/scores/streak/daily/recent
  srs: 'ssw-srs-data',      // all FSRS card states (was 1438+ separate keys)
  prefs: 'ssw-prefs',       // track, theme, onboarded, lastMode, dailyGoal
};

export const DEFAULTS = {
  progress: {
    _v: STORAGE_VERSION,
    known: [],
    unknown: [],
    starred: [],
    quizWrong: {},      // { [cardId]: count }
    wrongCounts: {},    // ssw-wrong-counts
    wgWrong: {},        // { [setId]: wrongObj }
    vocabWrong: {},     // { [setId]: wrongObj }
    jacScores: {},      // { [setId]: { correct, total, date } }
    wgScores: {},
    vocabScores: {},
    streakData: {},     // { days, lastDate }
    dailyCount: { count: 0, date: '' },
    recentCards: [],    // array of cardIds (max 20)
    milestoneStreak7: false,
    milestoneQuiz70: false,
  },
  srs: {
    _v: STORAGE_VERSION,
    cards: {},          // { [cardId]: { card, history, reviewed_at } }
  },
  prefs: {
    _v: STORAGE_VERSION,
    track: null,
    theme: 'light',
    onboarded: false,
    tutorialFlashcard: false,
    lastMode: null,
    dailyGoal: 20,
  },
};
