// ─── storage/schema.js (phaseA) ───────────────────────────────────────────────
// A.6: Upgraded from v2 → v3 schema.
// New fields: sipilScores, bangunanScores (Phase B), sessions, dailyMission (Phase C),
//             examDate, audioEnabled, studyAnchor (Phase F), furiganaPolicy (Phase E).
// ─────────────────────────────────────────────────────────────────────────────

export const STORAGE_VERSION = 3;

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
    sipilScores: {},    // Phase B: { [setId]: { correct, total, date } }
    bangunanScores: {}, // Phase B: { [setId]: { correct, total, date } }
    streakData: {},     // { days, lastDate }
    dailyCount: { count: 0, date: '' },
    recentCards: [],    // array of cardIds (max 20)
    milestoneStreak7: false,
    milestoneQuiz70: false,
    sessions: [],       // Phase C: [{ mode, correct, total, date, durationMs }]
    dailyMission: null, // Phase C: { date, mode, label, icon, completedAt }
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
    examDate: null,          // Phase F: ISO date string for exam countdown
    audioEnabled: true,      // Phase F: Web Speech API toggle
    studyAnchor: null,       // Phase C: 'morning' | 'lunch' | 'evening'
    furiganaPolicy: 'always',// Phase E: 'always' | 'tap' | 'hidden'
  },
};
