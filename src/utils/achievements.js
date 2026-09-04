// ─── utils/achievements.js ────────────────────────────────────────────────────
// Achievement badge system. Pure functions — no side effects.
// Checks are run against a snapshot of user state.
// ─────────────────────────────────────────────────────────────────────────────
import { HALF_DECK_THRESHOLD, TOTAL_CARDS, EXAM_PASS_PCT } from './constants.js';
import { getAvgAccuracy, getBestSimScore, hasPerfectSprint } from './session-analytics.js';

export const ACHIEVEMENTS = [
  {
    id: 'first_10',
    icon: '🌱',
    badge: 'badge-01.png',
    label: 'Langkah Pertama',
    desc: '10 kartu hafal',
    check: (s) => s.known >= 10,
  },
  {
    id: 'first_100',
    icon: '🏗️',
    badge: 'badge-02.png',
    label: 'Pondasi Kuat',
    desc: '100 kartu hafal',
    check: (s) => s.known >= 100,
  },
  {
    id: 'half_deck',
    icon: '💪',
    badge: 'badge-03.png',
    label: 'Setengah Jalan',
    desc: `${HALF_DECK_THRESHOLD}+ kartu hafal`,
    check: (s) => s.known >= HALF_DECK_THRESHOLD,
  },
  {
    id: 'full_deck',
    icon: '🏆',
    badge: 'badge-14.png',
    label: 'Nugget Pro',
    desc: `Semua ${TOTAL_CARDS} kartu hafal`,
    check: (s) => s.known >= TOTAL_CARDS,
  },
  {
    id: 'week_streak',
    icon: '🔥',
    badge: 'badge-05.png',
    label: 'Pekerja Keras',
    desc: '7 hari berturut-turut',
    check: (s) => s.streak >= 7,
  },
  {
    id: 'month_streak',
    icon: '🌟',
    badge: 'badge-06.png',
    label: 'Konsisten',
    desc: '30 hari berturut-turut',
    check: (s) => s.streak >= 30,
  },
  {
    id: 'perfect_sprint',
    icon: '⚡',
    badge: 'badge-07.png',
    label: 'Kilat',
    desc: 'Sprint tanpa salah (≥10 kartu)',
    check: (s) => s.perfectSprint,
  },
  {
    id: 'lulus_simulasi',
    icon: '🎓',
    badge: 'badge-08.png',
    label: 'Siap Ujian',
    desc: `Simulasi ≥${EXAM_PASS_PCT}%`,
    check: (s) => s.bestSimScore >= EXAM_PASS_PCT,
  },
  {
    id: 'sim_75',
    icon: '🎯',
    badge: 'badge-09.png',
    label: 'Sangat Siap',
    desc: 'Simulasi ≥75%',
    check: (s) => s.bestSimScore >= 75,
  },
  {
    id: 'jac_master',
    icon: '📋',
    badge: 'badge-10.png',
    label: 'JAC Master',
    desc: 'Semua set JAC ≥80%',
    check: (s) => s.jacMastery,
  },
  {
    id: 'srs_100',
    icon: '🌿',
    badge: 'badge-11.png',
    label: 'SRS Pemula',
    desc: '100 kartu SRS matang',
    check: (s) => s.matureSRS >= 100,
  },
  {
    id: 'srs_500',
    icon: '🌳',
    badge: 'badge-12.png',
    label: 'SRS Veteran',
    desc: '500 kartu SRS matang',
    check: (s) => s.matureSRS >= 500,
  },
  {
    id: 'quiz_70',
    icon: '✨',
    badge: 'badge-13.png',
    label: 'Akurat',
    desc: 'Akurasi kuis rata-rata ≥70%',
    check: (s) => s.avgQuizAcc >= 70,
  },
  {
    id: 'sessions_50',
    icon: '📚',
    badge: 'badge-04.png',
    label: 'Rajin Belajar',
    desc: '50 sesi belajar',
    check: (s) => s.totalSessions >= 50,
  },
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

  // Both of these had a second, identical implementation inline here while
  // session-analytics.js — already imported for getAvgAccuracy, one line up —
  // exported them. Two copies of a scoring rule is one copy too many: whichever
  // gets updated, the other silently disagrees, and both feed user-visible
  // badges. Now the shared ones.
  const bestSimScore = getBestSimScore(sessions);
  const perfectSprint = hasPerfectSprint(sessions);

  // JAC mastery: all JAC set scores ≥80%
  const jacEntries = Object.values(jacScores);
  const jacMastery =
    jacEntries.length >= 4 &&
    jacEntries.every((s) => s.total > 0 && (s.correct / s.total) * 100 >= 80);

  // Average quiz accuracy across all scored quiz modes.
  const avgQuizAcc = getAvgAccuracy(sessions) ?? 0;

  return {
    known: knownN,
    streak,
    matureSRS,
    totalSessions,
    bestSimScore,
    perfectSprint,
    jacMastery,
    avgQuizAcc,
  };
}

/**
 * Returns array of { achievement, unlocked } for all achievements.
 */
export function evaluateAchievements(state) {
  return ACHIEVEMENTS.map((a) => ({ ...a, unlocked: a.check(state) }));
}
