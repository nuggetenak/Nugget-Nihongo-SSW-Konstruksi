// ─── storage/schema.js ───────────────────────────────────────────────────────
// Storage v3 schema — 3-document localStorage model.
// All user data lives in progress, srs, or prefs docs (lz-string compressed).
// ─────────────────────────────────────────────────────────────────────────────

export const STORAGE_VERSION = 4;

export const DOCS = {
  progress: 'ssw-progress', // known/unknown/starred/scores/streak/daily/recent
  srs: 'ssw-srs-data',      // all FSRS card states
  prefs: 'ssw-prefs',       // track, theme, onboarded, lastMode, dailyGoal
};

export const DEFAULTS = {
  progress: {
    _v: STORAGE_VERSION,
    known: [],
    unknown: [],
    starred: [],
    quizWrong: {},      // { [cardId]: wrongEntry } — {count, lastWrong} (backward-compat: plain int also accepted)
    wrongCounts: {},    // { [cardId]: count } — wrong answer tally per card
    wgWrong: {},        // { [setId]: wrongObj }
    vocabWrong: {},     // { [setId]: wrongObj }
    jacScores: {},      // { [setId]: { correct, total, date } }
    wgScores: {},
    vocabScores: {},
    dobokuScores: {},   // { [setId]: { correct, total, date } }
    kenchikuScores: {}, // { [setId]: { correct, total, date } }
    streakData: {},     // { days, lastDate }
    dailyCount: { count: 0, date: '' },
    recentCards: [],    // array of cardIds (max 20)
    milestoneStreak7: false,
    milestoneQuiz70: false,
    sessions: [],       // [{ mode, correct, total, date, durationMs }]
    dailyMission: null, // { date, mode, label, icon, completedAt }
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
    examDate: null,           // ISO date string for exam countdown
    audioEnabled: true,       // Web Speech API toggle
    studyAnchor: null,        // 'morning' | 'lunch' | 'evening'
    furiganaPolicy: 'always', // 'always' | 'tap' | 'hidden'
    flashcardHintCount: 0,    // resets on resetAll()
    notes: {},                // personal notes per card { [cardId]: string }
    speakOnFlip: false,       // speak on card flip instead of advance
    quizQuestionCount: 10,    // persist quiz question count
    sprintBests: {},          // per-duration personal bests { [durationKey]: { score, timeline } }
    dailyChallengeLog: {},    // { [YYYY-MM-DD]: { selected: number, correct: boolean } }
  },
};
