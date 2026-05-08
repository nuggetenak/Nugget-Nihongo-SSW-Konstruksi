// quiz-sets.js — All question sets, single source of truth
// track: 'common'   = Teori (Ch.1-4, all 3 tracks see this)
// track: 'lifeline' = Praktik Lifeline + CSV Lifeline
// track: 'doboku'   = Praktik Doboku (future)
// track: 'kenchiku' = Praktik Kenchiku (future)
import { WAYGROUND_SETS } from './wayground-sets.js';
import { CSV_SETS } from './csv-sets.js';
export const QUIZ_SETS = [...WAYGROUND_SETS, ...CSV_SETS];
export const getQuizSetsForTrack = (track) =>
  QUIZ_SETS.filter((s) => s.track === 'common' || s.track === track);
