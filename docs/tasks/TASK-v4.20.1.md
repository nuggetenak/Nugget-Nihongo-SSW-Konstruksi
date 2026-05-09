# TASK v4.20.1 — REF-6: UTC Date Fix + ENG-8: Date Tests
**Status:** READY | **Effort:** Low | **Depends on:** v4.20.0 DONE

## Goal
Create `src/utils/date.js` with local-timezone date helpers. Fix 6 UTC date bugs across 5 files. Create date tests.

**Why this matters:** Indonesian users (WIB = UTC+7) studying before 07:00 local time hit UTC midnight boundary. Streak falsely resets, daily missions reset mid-day. P1 streak bug.

---

## Step 1 — Create `src/utils/date.js`

```js
// src/utils/date.js
// REF-6: Shared date utilities — all return local timezone dates (not UTC).
// 'sv' locale produces YYYY-MM-DD in local tz — no library needed.

/** Today's date as YYYY-MM-DD in local timezone. */
export function todayStr() {
  return new Date().toLocaleDateString('sv');
}

/** Yesterday's date as YYYY-MM-DD in local timezone. */
export function prevDayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toLocaleDateString('sv');
}

/** Convert a UTC ISO string (e.g. session.date) to local YYYY-MM-DD. */
export function isoToLocalDate(isoStr) {
  if (!isoStr) return null;
  return new Date(isoStr).toLocaleDateString('sv');
}
```

Commit: `feat(utils): REF-6 create date.js — local-timezone date helpers`

---

## Step 2 — Fix N13: `ProgressContext.jsx` (P1 streak bug)

**File:** `src/contexts/ProgressContext.jsx`

Find line 15 (module-level):
```js
// FIND:
const today = () => new Date().toISOString().slice(0, 10); // ❌ UTC

// CHANGE TO (add import at top):
import { todayStr, prevDayStr } from '../utils/date.js';
// DELETE the today() function entirely
```

Find line 202 (getPrevDate function):
```js
// FIND:
function getPrevDate() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10); // ❌ UTC
}

// REPLACE with (or delete the function and):
// Every call to getPrevDate() → prevDayStr()
// Every call to today() → todayStr()
```

Search the file for all usages of `today()` and `getPrevDate()` and replace them with `todayStr()` and `prevDayStr()` respectively.

Commit: `fix(ProgressContext): N13 — replace UTC today()/getPrevDate() with local date.js helpers`

---

## Step 3 — Fix N9: `daily-challenge.js` + `daily-mission.js`

**File:** `src/utils/daily-challenge.js` — find `todayStr` export:
```js
// FIND (something like):
export function todayStr() {
  return new Date().toISOString().slice(0, 10); // ❌ UTC
}

// REPLACE WITH (re-export from date.js):
export { todayStr } from './date.js'; // backward compat re-export
```

**File:** `src/utils/daily-mission.js` — find UTC date usage (around line 22):
```js
// FIND (something like):
const today = new Date().toISOString().slice(0, 10); // ❌ UTC

// CHANGE TO:
import { todayStr } from './date.js';
const today = todayStr();
```

Commit: `fix(daily): N9 — daily-challenge + daily-mission use local todayStr from date.js`

---

## Step 4 — Fix N18: `StudyHeatmap.jsx` (grid key off-by-one)

**File:** `src/components/StudyHeatmap.jsx` line 29

```js
// FIND (grid key generation):
const key = d.toISOString().slice(0, 10); // ❌ UTC — shows activity on wrong day before 07:00

// CHANGE TO:
import { isoToLocalDate, todayStr } from '../utils/date.js';
const key = d.toLocaleDateString('sv'); // ✅ local date for grid
```

Also find where session dates are looked up in the grid (usually something like `sess.date.slice(0,10)`):
```js
// FIND (session → grid mapping):
const dateKey = sess.date?.slice(0, 10); // or similar UTC extraction

// CHANGE TO:
const dateKey = isoToLocalDate(sess.date);
```

Commit: `fix(StudyHeatmap): N18 — grid keys use local timezone (isoToLocalDate)`

---

## Step 5 — Fix Dashboard.jsx UTC dates (R2 companion)

**File:** `src/components/Dashboard.jsx` lines 11, 13 — find any `toISOString().slice(0,10)` or inline `today` function:
```js
// FIND and replace with todayStr() import from date.js
import { todayStr } from '../utils/date.js';
```

Commit: `fix(Dashboard): fix UTC date references — use todayStr from date.js`

---

## Step 6 — ENG-8: Create `src/tests/date.test.js`

```js
// src/tests/date.test.js
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { todayStr, prevDayStr, isoToLocalDate } from '../utils/date.js';

describe('date.js — local timezone helpers', () => {
  it('todayStr returns YYYY-MM-DD format', () => {
    const s = todayStr();
    expect(s).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('prevDayStr returns day before todayStr', () => {
    const today = new Date(todayStr());
    const prev  = new Date(prevDayStr());
    const diffMs = today.getTime() - prev.getTime();
    expect(diffMs).toBe(86400000); // exactly 1 day
  });

  it('isoToLocalDate converts UTC ISO to local YYYY-MM-DD', () => {
    const s = isoToLocalDate('2026-01-01T00:00:00.000Z');
    expect(s).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('isoToLocalDate returns null for null input', () => {
    expect(isoToLocalDate(null)).toBeNull();
  });

  it('todayStr and prevDayStr are different dates', () => {
    expect(todayStr()).not.toBe(prevDayStr());
  });
});
```

Commit: `test(date): ENG-8 — date.test.js for local timezone helpers`

---

## Final Steps
1. `npm run lint` — 0 warnings
2. `npm test -- --run` — all pass (date.test.js should have 5 passing tests)
3. `npm run build`
4. Bump → `4.20.1`
5. Prepend CHANGELOG:
```
## [4.20.1] - [DATE]

### fix + feat: UTC date bugs (REF-6 + ENG-8)

- REF-6: New src/utils/date.js — todayStr/prevDayStr/isoToLocalDate (local tz, not UTC)
- N13 (P1): ProgressContext streak tracking now uses local dates — fixes false streak resets at 07:00 WIB
- N9: daily-challenge + daily-mission use local todayStr
- N18: StudyHeatmap grid keys use local timezone
- Dashboard.jsx: UTC date references fixed
- ENG-8: src/tests/date.test.js (5 tests)
```
6. Update `_MAP.md` version + log entry; push

## Done when
- [ ] date.js created with 3 exports
- [ ] ProgressContext: today() + getPrevDate() removed, replaced with todayStr()/prevDayStr()
- [ ] daily-challenge.js re-exports todayStr from date.js
- [ ] daily-mission.js uses local todayStr
- [ ] StudyHeatmap uses isoToLocalDate
- [ ] Dashboard fixed
- [ ] date.test.js created, 5 tests pass
- [ ] All tests pass; version 4.20.1
