// src/utils/session-analytics.js
// Shared session analytics — single source of truth for session math.

import { SCORED_QUIZ_MODES } from './constants.js';

/**
 * Average accuracy across all scored quiz sessions.
 * @param {Array} sessions - progress.sessions array
 * @param {number|null} n - if set, use only last N sessions
 * @returns {number|null} 0–100 or null if no sessions
 */
export function getAvgAccuracy(sessions, n = null) {
  const qs = sessions.filter((s) => SCORED_QUIZ_MODES.includes(s.mode) && s.total > 0);
  const slice = n ? qs.slice(-n) : qs;
  if (!slice.length) return null;
  return slice.reduce((acc, s) => acc + (s.correct / s.total) * 100, 0) / slice.length;
}

/**
 * Best simulasi score (0–100). Returns 0 if no simulasi sessions.
 */
export function getBestSimScore(sessions) {
  const sims = sessions.filter((s) => s.mode === 'simulasi' && s.total > 0);
  return sims.length ? Math.max(...sims.map((s) => Math.round((s.correct / s.total) * 100))) : 0;
}

/**
 * True if any sprint session had 0 wrong and >= minCards.
 */
export function hasPerfectSprint(sessions, minCards = 10) {
  return sessions.some((s) => s.mode === 'sprint' && s.total >= minCards && s.correct === s.total);
}

/**
 * Count sessions per strand in the last N days.
 * Requires MODE_META to have a 'strand' field.
 * @returns {{ [strand]: number }}
 */
export function getStrandCounts(sessions, modeMeta, days = 7) {
  const cutoff = Date.now() - days * 86400000;
  const recent = sessions.filter((s) => new Date(s.date).getTime() > cutoff);
  const counts = {};
  for (const s of recent) {
    const strand = modeMeta[s.mode]?.strand;
    if (strand) counts[strand] = (counts[strand] ?? 0) + 1;
  }
  return counts;
}

/**
 * Composite readiness score 0–100.
 * Composite readiness score used by StatsMode and recommend-mode.
 */
export function calcReadiness({ srs, sessions, streakData }) {
  const avgAcc = getAvgAccuracy(sessions);
  const streak = streakData?.current ?? 0;

  // SRS component (0–40): ratio of mature+review cards
  const total = srs?.stats?.total ?? 0;
  const mature = (srs?.stats?.mature ?? 0) + (srs?.stats?.review ?? 0);
  const srsScore = total > 0 ? (mature / total) * 40 : 0;

  // Quiz component (0–40): average accuracy
  const quizScore = avgAcc !== null ? (avgAcc / 100) * 40 : 0;

  // Streak component (0–20): capped at 14-day streak
  const streakScore = Math.min(20, (streak / 14) * 20);

  return Math.min(100, Math.round(srsScore + quizScore + streakScore));
}
