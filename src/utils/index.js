// ─── Utils Barrel Export ─────────────────────────────────────────────────────
export { shuffle } from './shuffle.js';
export { stripFuri, extractReadings, standardizeFuri, hasJapanese, jpFontSize } from './jp-helpers.js';
export {
  getWrongCount,
  getWrongTime,
  makeWrongEntry,
  loadFromStorage,
  saveToStorage,
  removeFromStorage,
} from './wrong-tracker.js';
export { generateQuiz } from './quiz-generator.js';
// FE-09-A: vibration haptic patterns
export { haptic } from './haptic.js';
// Phase F: Web Speech API (already in tree, now re-exported for completeness)
export { speakJP, stopSpeech, canSpeak } from './speak.js';
// ENG-2: shared constants
export { TOTAL_CARDS, HALF_DECK_THRESHOLD, FULL_DECK_THRESHOLD,
         SCORED_QUIZ_MODES, SRS_MATURE_DAYS, SESSIONS_CAP,
         DAILY_CHALLENGE_KEY } from './constants.js';
// ENG-1: shared session analytics
export { getAvgAccuracy, getBestSimScore, hasPerfectSprint, getStrandCounts, calcReadiness } from './session-analytics.js';
// ENG-12: storage quota detection + recovery
export { setQuotaHandler, isQuotaError, notifyQuotaExceeded, estimateStorageUsage } from './storage-quota.js';
