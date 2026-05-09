// ─── utils/achievements.js ────────────────────────────────────────────────────
// F1: Achievement badge system. Pure functions — no side effects.
// Checks are run against a snapshot of user state.
// ─────────────────────────────────────────────────────────────────────────────
import { HALF_DECK_THRESHOLD, TOTAL_CARDS } from './constants.js';

export const ACHIEVEMENTS = [
  { id: 'first_10',       icon: '🌱', label: 'Langkah Pertama',  desc: '10 kartu hafal',                  check: (s) => s.known >= 10 },
  { id: 'first_100',      icon: '🏗️', label: 'Pondasi Kuat',     desc: '100 kartu hafal',                 check: (s) => s.known >= 100 },
  { id: 'half_deck',      icon: '💪', label: 'Setengah Jalan',   desc: `${HALF_DECK_THRESHOLD}+ kartu hafal`,  check: (s) => s.known >= HALF_DECK_THRESHOLD },
  { id: 'full_deck',      icon: '🏆', label: 'Nugget Pro',       desc: `Semua ${TOTAL_CARDS} kartu hafal`,     check: (s) => s.known >= TOTAL_CARDS },
  { id: 'week_streak',    icon: '🔥', label: 'Pekerja Keras',    desc: '7 hari berturut-turut',           check: (s) => s.streak >= 7 },
  { id: 'month_streak',   icon: '🌟', label: 'Konsisten',        desc: '30 hari berturut-turut',          check: (s) => s.streak >= 30 },
  { id: 'perfect_sprint', icon: '⚡', label: 'Kilat',            desc: 'Sprint tanpa salah (≥10 kartu)',  check: (s) => s.perfectSprint },
  { id: 'lulus_simulasi', icon: '🎓', label: 'Siap Ujian',       desc: 'Simulasi ≥65%',                   check: (s) => s.bestSimScore >= 65 },
  { id: 'sim_75',         icon: '🎯', label: 'Sangat Siap',      desc: 'Simulasi ≥75%',                   check: (s) => s.bestSimScore >= 75 },
  { id: 'jac_master',     icon: '📋', label: 'JAC Master',       desc: 'Semua set JAC ≥80%',              check: (s) => s.jacMastery },
  { id: 'srs_100',        icon: '🌿', label: 'SRS Pemula',       desc: '100 kartu SRS matang',            check: (s) => s.matureSRS >= 100 },
  { id: 'srs_500',        icon: '🌳', label: 'SRS Veteran',      desc: '500 kartu SRS matang',            check: (s) => s.matureSRS >= 500 },
  { id: 'quiz_70',        icon: '✨', label: 'Akurat',           desc: 'Akurasi kuis rata-rata ≥70%',     check: (s) => s.avgQuizAcc >= 70 },
  { id: 'sessions_50',    icon: '📚', label: 'Rajin Belajar',    desc: '50 sesi belajar',                 check: (s) => s.totalSessions >= 50 },
];

/**
 * Build achievement state snapshot from app data.
 * @param {{ known: Set, streakData: object, sessions: array, srs: object, jacScores: object }} data
 */
export function buildAchievementState({ known, streakData, sessions = [], srs, jacScores = {} }) {
  const knownN = known?.size ?? 0;
  const streak = streakData?.days ?? 0;
  const matureSRS = srs?.stats?.mature ?? 0;
  const totalSessions = sessions.length;

  // Best simulasi score from sessions
  const simSessions = sessions.filter((s) => s.mode === 'simulasi' && s.total > 0);
  const bestSimScore = simSessions.length > 0
    ? Math.max(...simSessions.map((s) => Math.round((s.correct / s.total) * 100)))
    : 0;

  // Perfect sprint: any sprint session with 0 wrong (correct === total, total >= 10)
  const perfectSprint = sessions.some((s) => s.mode === 'sprint' && s.total >= 10 && s.correct === s.total);

  // JAC mastery: all JAC set scores ≥80%
  const jacEntries = Object.values(jacScores);
  const jacMastery = jacEntries.length >= 4 &&
    jacEntries.every((s) => s.total > 0 && (s.correct / s.total) * 100 >= 80);

  // Average quiz accuracy from quiz/jac/wayground sessions
  const quizSess = sessions.filter((s) => ['kuis', 'jac', 'wayground'].includes(s.mode) && s.total > 0);
  const avgQuizAcc = quizSess.length > 0
    ? Math.round(quizSess.reduce((acc, s) => acc + (s.correct / s.total) * 100, 0) / quizSess.length)
    : 0;

  return { known: knownN, streak, matureSRS, totalSessions, bestSimScore, perfectSprint, jacMastery, avgQuizAcc };
}

/**
 * Returns array of { achievement, unlocked } for all achievements.
 */
export function evaluateAchievements(state) {
  return ACHIEVEMENTS.map((a) => ({ ...a, unlocked: a.check(state) }));
}
