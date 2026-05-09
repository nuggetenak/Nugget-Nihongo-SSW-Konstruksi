# TASK v4.20.3 — ENG-1: session-analytics.js + ENG-7: Tests
**Status:** DONE ✅ | **Effort:** Medium | **Depends on:** v4.20.2 DONE

## Goal
Create `session-analytics.js` to fix the same narrow quiz filter bug appearing in 3 separate files.

**Root problem:** B3, N2, N4 are all independently hardcoding `['kuis','jac','wayground']` as the quiz session filter. This misses Simulasi, Sipil, Bangunan, Vocab, KuisProd modes. `calcReadiness`, `avgAcc`, and `avgQuizAcc` achievement all undercount users' accuracy.

---

## Step 1 — ENG-1: Create `src/utils/session-analytics.js`

```js
// src/utils/session-analytics.js
// ENG-1: Shared session analytics — single source of truth for session math.
// Fixes B3 (StatsMode), N2 (recommend-mode), N4 (achievements) at one location.

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
  return sims.length
    ? Math.max(...sims.map((s) => Math.round((s.correct / s.total) * 100)))
    : 0;
}

/**
 * True if any sprint session had 0 wrong and >= minCards.
 */
export function hasPerfectSprint(sessions, minCards = 10) {
  return sessions.some(
    (s) => s.mode === 'sprint' && s.total >= minCards && s.correct === s.total
  );
}

/**
 * Count sessions per strand in the last N days.
 * Requires MODE_META to have a 'strand' field (ENG-3).
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
 * Extracted from StatsMode.calcReadiness (B3 fix).
 */
export function calcReadiness({ srs, sessions, streakData }) {
  const avgAcc = getAvgAccuracy(sessions);
  const bestSim = getBestSimScore(sessions);
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
```

Add to `src/utils/index.js` barrel:
```js
export { getAvgAccuracy, getBestSimScore, hasPerfectSprint, getStrandCounts, calcReadiness } from './session-analytics.js';
```

Commit: `feat(utils): ENG-1 session-analytics.js — shared session math; fixes B3/N2/N4`

---

## Step 2 — Fix B3: Update `StatsMode.jsx`

**File:** `src/modes/StatsMode.jsx`

Replace the local `calcReadiness` function with the imported one. Also fix the narrow filter:

```js
// ADD import:
import { calcReadiness } from '../utils/session-analytics.js';

// FIND and DELETE the local calcReadiness function (if it exists after B5 fix)
// OR replace the local implementation with the imported call.

// Find the narrow filter (same pattern as N2/N4 — ['kuis','jac','wayground']):
const quizSessions = sessions.filter(s => ['kuis','jac','wayground'].includes(s.mode));
// CHANGE TO:
import { SCORED_QUIZ_MODES } from '../utils/constants.js';
const quizSessions = sessions.filter(s => SCORED_QUIZ_MODES.includes(s.mode));
```

Commit: `fix(StatsMode): B3 — replace narrow quiz filter + local calcReadiness with session-analytics.js`

---

## Step 3 — Fix N2: Update `recommend-mode.js`

**File:** `src/utils/recommend-mode.js`

```js
// ADD import:
import { getAvgAccuracy } from './session-analytics.js';

// FIND the narrow filter:
const qs = sessions.filter(s => ['kuis','jac','wayground'].includes(s.mode) && s.total > 0);
const avgAcc = qs.length ? qs.reduce(...) / qs.length : null;

// REPLACE WITH:
const avgAcc = getAvgAccuracy(sessions);
```

Commit: `fix(recommend-mode): N2 — use getAvgAccuracy from session-analytics.js`

---

## Step 4 — Fix N4: Update `achievements.js`

**File:** `src/utils/achievements.js`

Same pattern — find the narrow filter and avgQuizAcc computation:
```js
// FIND:
sessions.filter((s) => ['kuis', 'jac', 'wayground'].includes(s.mode) && s.total > 0)

// CHANGE TO:
import { getAvgAccuracy } from './session-analytics.js';
// use getAvgAccuracy(sessions) wherever avgQuizAcc is computed
```

Commit: `fix(achievements): N4 — use getAvgAccuracy; quiz_70 now fires for all quiz modes`

---

## Step 5 — ENG-7: Create `src/tests/session-analytics.test.js`

```js
import { describe, it, expect } from 'vitest';
import { getAvgAccuracy, getBestSimScore, hasPerfectSprint, calcReadiness } from '../utils/session-analytics.js';

const makeSess = (mode, correct, total, date = new Date().toISOString()) =>
  ({ mode, correct, total, date, durationMs: 0 });

describe('session-analytics', () => {
  describe('getAvgAccuracy', () => {
    it('returns null for empty sessions', () => {
      expect(getAvgAccuracy([])).toBeNull();
    });
    it('ignores sessions with total=0', () => {
      expect(getAvgAccuracy([makeSess('kuis', 0, 0)])).toBeNull();
    });
    it('calculates average across SCORED_QUIZ_MODES', () => {
      const s = [makeSess('kuis', 8, 10), makeSess('simulasi', 6, 10)];
      expect(getAvgAccuracy(s)).toBeCloseTo(70);
    });
    it('ignores non-scored modes (e.g. ulasan)', () => {
      const s = [makeSess('kuis', 10, 10), makeSess('ulasan', 0, 0)];
      expect(getAvgAccuracy(s)).toBe(100);
    });
    it('limits to last n sessions when n specified', () => {
      const s = [makeSess('kuis', 0, 10), makeSess('kuis', 10, 10)];
      expect(getAvgAccuracy(s, 1)).toBe(100);
    });
  });

  describe('getBestSimScore', () => {
    it('returns 0 for no simulasi sessions', () => {
      expect(getBestSimScore([makeSess('kuis', 8, 10)])).toBe(0);
    });
    it('returns max simulasi score', () => {
      const s = [makeSess('simulasi', 7, 10), makeSess('simulasi', 9, 10)];
      expect(getBestSimScore(s)).toBe(90);
    });
  });

  describe('hasPerfectSprint', () => {
    it('returns false when no sprint session', () => {
      expect(hasPerfectSprint([])).toBe(false);
    });
    it('returns true for perfect sprint with enough cards', () => {
      expect(hasPerfectSprint([makeSess('sprint', 15, 15)])).toBe(true);
    });
    it('returns false for perfect but below minCards', () => {
      expect(hasPerfectSprint([makeSess('sprint', 5, 5)])).toBe(false);
    });
    it('returns false for imperfect sprint', () => {
      expect(hasPerfectSprint([makeSess('sprint', 14, 15)])).toBe(false);
    });
  });

  describe('calcReadiness', () => {
    it('returns 0 for empty state', () => {
      const r = calcReadiness({ srs: { stats: {} }, sessions: [], streakData: {} });
      expect(r).toBe(0);
    });
    it('returns 0–100', () => {
      const r = calcReadiness({ srs: { stats: { total: 100, mature: 50, review: 20 } },
        sessions: [makeSess('kuis', 8, 10)], streakData: { current: 7 } });
      expect(r).toBeGreaterThanOrEqual(0);
      expect(r).toBeLessThanOrEqual(100);
    });
  });
});
```

Commit: `test(session-analytics): ENG-7 — 13 tests for session-analytics.js`

---

## Final Steps
1. `npm run lint` — 0 warnings
2. `npm test -- --run` — all pass (13 new tests)
3. `npm run build`
4. Bump → `4.20.3`, update CHANGELOG + _MAP.md, push

## Done when
- [ ] session-analytics.js created (5 exports)
- [ ] utils/index.js updated
- [ ] StatsMode uses getAvgAccuracy/calcReadiness (B3)
- [ ] recommend-mode uses getAvgAccuracy (N2)
- [ ] achievements uses getAvgAccuracy (N4)
- [ ] session-analytics.test.js: 13 tests pass
- [ ] Version 4.20.3 pushed
