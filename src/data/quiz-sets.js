// quiz-sets.js — All question sets, single source of truth.
// track: 'common'   = Teori (Ch.1-4, all tracks see this)
// track: 'lifeline' = Praktik Lifeline + JAC Mockup Lifeline
//
// Doboku/Kenchiku tracks + their quiz sets removed session 24 (2026-07-26) — scope reduced to
// Lifeline-only per owner decision. See HANDOFF.md. (Previously: DOBOKU_SETS/KENCHIKU_SETS,
// 90 AI-generated draft questions, sets/quiz/doboku-01..03.js + kenchiku-01..03.js — all
// deleted, not archived; recoverable from git history before this commit if ever needed.)
import { WAYGROUND_SETS } from './wayground-sets.js';
import { JAC_MOCKUP_SETS } from './jac-mockup-sets.js';

export const QUIZ_SETS = [...WAYGROUND_SETS, ...JAC_MOCKUP_SETS];

export const getQuizSetsForTrack = (track) =>
  QUIZ_SETS.filter((s) => s.track === 'common' || s.track === track);
