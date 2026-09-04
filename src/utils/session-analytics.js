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
 *
 * @param {number|null} recentN - if set, weight the quiz component toward
 *   the last N sessions instead of the all-time average. Existing callers
 *   don't pass this and get exactly the original behavior; added for item
 *   56's dashboard use, where an all-time average would understate genuine
 *   recent improvement (or overstate current ability after a long gap) --
 *   the exact "confident-looking wrong number" that item's plan text was
 *   worried about, worth avoiding for a dashboard *promise*, not just a
 *   stats-page number where being approximate is fine.
 */
export function calcReadiness({ srs, sessions, streakData }, recentN = null) {
  const avgAcc = getAvgAccuracy(sessions, recentN);
  // Bug found while sanity-checking this for item 56: streakData's real
  // shape is { days, lastDate } (confirmed against ProgressContext.jsx and
  // StatsMode's own correct `streakData?.days` a few lines from its call to
  // this function) -- `.current` doesn't exist on it, so this component has
  // silently been 0 for every caller, always, regardless of actual streak.
  const streak = streakData?.days ?? 0;

  // SRS component (0–40): ratio of cards in the review state.
  //
  // Second dead-key bug in this same function (the first was streakData.current,
  // fixed for item 56 and noted below). `srs.stats.review` has never existed —
  // getSRSStats returns { total, new, learning, young, mature, due } — so this
  // silently counted only mature cards, and its own comment saying
  // "mature+review" was describing an intent the code never implemented. `young`
  // is what that comment meant: in FSRS terms young and mature are both the
  // Review state, split by SRS_MATURE_DAYS. A learner with 300 cards in review
  // but none yet past 21 days scored 0 on a component meant to reward exactly
  // that progress.
  const total = srs?.stats?.total ?? 0;
  const inReview = (srs?.stats?.mature ?? 0) + (srs?.stats?.young ?? 0);
  const srsScore = total > 0 ? (inReview / total) * 40 : 0;

  // Quiz component (0–40): average accuracy (recent-N if requested)
  const quizScore = avgAcc !== null ? (avgAcc / 100) * 40 : 0;

  // Streak component (0–20): capped at 14-day streak
  const streakScore = Math.min(20, (streak / 14) * 20);

  return Math.min(100, Math.round(srsScore + quizScore + streakScore));
}

const READINESS_MIN_SESSIONS = 5; // below this, a band would be more noise than signal

/**
 * Item 56: readiness as a band (kurang siap / cukup / siap), not a
 * false-precision percentage -- the plan's own strong recommendation, since
 * a confident-looking wrong number is actively demotivating for someone
 * whose visa depends on this exam. Recency-weighted (last 10 sessions) via
 * calcReadiness's recentN param, not the all-time average StatsMode uses --
 * this is surfaced as a dashboard promise, not a stats-page number.
 *
 * Returns null (not a low band) when there isn't enough data yet to say
 * anything meaningful -- "belum cukup data" is honest; "kurang siap" from
 * three sessions isn't a readiness assessment, it's noise wearing a label.
 */
export function calcReadinessBand({ srs, sessions, streakData }) {
  const scoredCount = sessions.filter(
    (s) => SCORED_QUIZ_MODES.includes(s.mode) && s.total > 0
  ).length;
  if (scoredCount < READINESS_MIN_SESSIONS) return null;

  const score = calcReadiness({ srs, sessions, streakData }, 10);
  if (score < 40) return { key: 'kurang', label: 'Kurang siap', score };
  if (score < 70) return { key: 'cukup', label: 'Cukup siap', score };
  return { key: 'siap', label: 'Siap', score };
}
