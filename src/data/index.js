// ─── Data Barrel Export ──────────────────────────────────────────────────────
// Re-exports all data modules + computes derived constants.
// ─────────────────────────────────────────────────────────────────────────────

export { CARDS } from './cards.js';

// JAC Official — split by type
// jac-official.js is a backward-compat shim: [...JAC_TEORI, ...JAC_LIFELINE, ...]
export { JAC_OFFICIAL } from './jac-official.js';
export { JAC_TEORI } from './jac-teori.js';           // 学科 (common, all tracks)
export { JAC_LIFELINE } from './jac-lifeline.js';     // 実技 Lifeline
export { JAC_DOBOKU } from './jac-doboku.js';         // 実技 Doboku (future)
export { JAC_KENCHIKU } from './jac-kenchiku.js';     // 実技 Kenchiku (future)

// Question sets — wayground + CSV with track field
// wayground-sets.js + csv-sets.js kept as shims; quiz-sets.js = combined
export { WAYGROUND_SETS } from './wayground-sets.js';
export { CSV_SETS } from './csv-sets.js';
export { QUIZ_SETS, getQuizSetsForTrack } from './quiz-sets.js';

// Study aids — with track field
export { ANGKA_KUNCI } from './angka-kunci.js';
export { DANGER_PAIRS } from './danger-pairs.js';

export {
  CATEGORIES,
  getCatInfo,
  SOURCE_META,
  VOCAB_SOURCES,
  SOURCE_GROUPS,
  SOURCE_ACCENT,
} from './categories.js';
