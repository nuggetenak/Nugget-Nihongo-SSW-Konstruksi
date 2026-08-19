# TASK v4.20.2 — ENG-2: Constants + N15, N19, B5, B1

**Status:** DONE ✅ | **Effort:** Low | **Depends on:** v4.20.1 DONE

---

## Step 1 — ENG-2: Create `src/utils/constants.js`

```js
// src/utils/constants.js
// Single source of truth for shared constants.
// Import from here — never hardcode these values in component files.

export const TOTAL_CARDS = 1443;
export const HALF_DECK_THRESHOLD = Math.ceil(TOTAL_CARDS / 2); // 722
export const FULL_DECK_THRESHOLD = TOTAL_CARDS;

/** All modes whose sessions contribute to quiz accuracy scoring. */
export const SCORED_QUIZ_MODES = [
  'kuis',
  'jac',
  'wayground',
  'simulasi',
  'sipil',
  'bangunan',
  'vocab',
  'kuisprod',
];

/** FSRS card considered "mature" at this interval (days). */
export const SRS_MATURE_DAYS = 21;

/** Max sessions stored in progress.sessions. */
export const SESSIONS_CAP = 180;

/** localStorage key for daily challenge log (legacy — use storage engine). */
export const DAILY_CHALLENGE_KEY = 'ssw-daily-challenge';
```

Add to `src/utils/index.js` barrel:

```js
export {
  TOTAL_CARDS,
  HALF_DECK_THRESHOLD,
  FULL_DECK_THRESHOLD,
  SCORED_QUIZ_MODES,
  SRS_MATURE_DAYS,
  SESSIONS_CAP,
  DAILY_CHALLENGE_KEY,
} from './constants.js';
```

Commit: `feat(utils): ENG-2 create constants.js — shared constants (TOTAL_CARDS, SCORED_QUIZ_MODES, etc.)`

---

## Step 2 — N15: `ProgressContext.jsx` — `SESSIONS_CAP` constant

**File:** `src/contexts/ProgressContext.jsx` around line 142

```js
// FIND (hardcoded 180):
if (updated.length > 180) updated = updated.slice(-180);

// CHANGE TO:
import { SESSIONS_CAP } from '../utils/constants.js';
if (updated.length > SESSIONS_CAP) updated = updated.slice(-SESSIONS_CAP);
```

Commit: `fix(ProgressContext): N15 — use SESSIONS_CAP constant (was hardcoded 180)`

---

## Step 3 — N19: `fsrs-scheduler.js` — `SRS_MATURE_DAYS` constant

**File:** `src/srs/fsrs-scheduler.js` around line 118

```js
// FIND (hardcoded 21):
else if (s >= 21) mature++;

// CHANGE TO:
import { SRS_MATURE_DAYS } from '../utils/constants.js';
else if (s >= SRS_MATURE_DAYS) mature++;
```

Commit: `fix(fsrs-scheduler): N19 — use SRS_MATURE_DAYS constant (was hardcoded 21)`

---

## Step 4 — B5: `StatsMode.jsx` — Remove spurious `× 100`

**File:** `src/modes/StatsMode.jsx` — `calcReadiness` function, around line 36

The readiness formula already produces a 0–100 value. There is an erroneous `* 100` at the end that pins it to 100% for any non-zero score.

```js
// FIND (something like):
return Math.min(100, (srsScore + quizScore + streakScore) * 100);
//                                                         ^^^^ REMOVE THIS

// CHANGE TO:
return Math.min(100, srsScore + quizScore + streakScore);
```

Commit: `fix(StatsMode): B5 — remove spurious × 100 from calcReadiness; was always returning 100%`

---

## Step 5 — B1: `achievements.js` — Update stale thresholds

**File:** `src/utils/achievements.js` lines 9–10

```js
// ADD import at top:
import { HALF_DECK_THRESHOLD, TOTAL_CARDS } from './constants.js';

// FIND the achievement entries for half_deck and full_deck:
// Something like:
{ id: 'half_deck', ..., check: (s) => s.knownCount >= 705 },
{ id: 'full_deck', ..., check: (s) => s.knownCount >= 1410 },

// CHANGE TO:
{ id: 'half_deck', ..., check: (s) => s.knownCount >= HALF_DECK_THRESHOLD },
{ id: 'full_deck', ..., check: (s) => s.knownCount >= FULL_DECK_THRESHOLD },
```

Commit: `fix(achievements): B1 — half_deck threshold 705→722, full_deck 1410→1443 (TOTAL_CARDS)`

---

## Final Steps

1. `npm run lint` — 0 warnings
2. `npm test -- --run` — all pass
3. `npm run build`
4. Bump → `4.20.2`
5. Prepend CHANGELOG:

```
## [4.20.2] - [DATE]

### feat + fix: constants extraction (ENG-2)

- ENG-2: New src/utils/constants.js (TOTAL_CARDS, SCORED_QUIZ_MODES, SRS_MATURE_DAYS, SESSIONS_CAP, etc.)
- N15: ProgressContext — SESSIONS_CAP constant (was hardcoded 180)
- N19: fsrs-scheduler — SRS_MATURE_DAYS constant (was hardcoded 21)
- B5 (P1): StatsMode calcReadiness — spurious ×100 removed; readiness now 0–100 correctly
- B1 (P1): achievements half_deck/full_deck thresholds updated to HALF_DECK_THRESHOLD/TOTAL_CARDS
```

6. Update `_MAP.md` + push

## Done when

- [ ] constants.js created
- [ ] utils/index.js barrel updated
- [ ] ProgressContext uses SESSIONS_CAP
- [ ] fsrs-scheduler uses SRS_MATURE_DAYS
- [ ] StatsMode calcReadiness no longer × 100
- [ ] achievements thresholds correct
- [ ] All tests pass; version 4.20.2
