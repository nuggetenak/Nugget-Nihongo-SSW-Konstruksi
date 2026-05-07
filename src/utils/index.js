// ─── Utils Barrel Export ─────────────────────────────────────────────────────
export { shuffle } from './shuffle.js';
export { stripFuri, extractReadings, hasJapanese, jpFontSize } from './jp-helpers.js';
export {
  getWrongCount,
  getWrongTime,
  makeWrongEntry,
  STORAGE_KEYS,
  loadFromStorage,
  saveToStorage,
} from './wrong-tracker.js';
export { generateQuiz } from './quiz-generator.js';
// FE-09-A: vibration haptic patterns
export { haptic } from './haptic.js';
// Phase F: Web Speech API (already in tree, now re-exported for completeness)
export { speakJP, stopSpeech, canSpeak } from './speak.js';
