// ─── Data Barrel Export ──────────────────────────────────────────────────────
// Re-exports all data modules + computes derived constants.
// ─────────────────────────────────────────────────────────────────────────────

export { CARDS } from './cards.js';
export { SIPIL_SETS } from './sipil-sets.js';
export { BANGUNAN_SETS } from './bangunan-sets.js';
export { JAC_OFFICIAL } from './jac-official.js';
export { WAYGROUND_SETS } from './wayground-sets.js';
export { CSV_SETS } from './csv-sets.js';
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

// ─── Derived Data ────────────────────────────────────────────────────────────
import { CARDS } from './cards.js';
import { VOCAB_SOURCES } from './categories.js';

/** Cards from vocabulary-focused sources (lifeline4, vocab_*) */
export const VOCAB_BASE_CARDS = CARDS.filter((c) => VOCAB_SOURCES.includes(c.source));

/** Cards from concept/theory sources (text*, st*, tt*) */
export const KONSEP_BASE_CARDS = CARDS.filter((c) => !VOCAB_SOURCES.includes(c.source));

/** Total vocab card count */
export const VOCAB_CARD_COUNT = VOCAB_BASE_CARDS.length;
