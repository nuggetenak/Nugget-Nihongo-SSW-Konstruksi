# TASK v4.20.5 — B4, N6 (14 sites), OVERHAUL-2, N8/REF-5, N14, N22

**Status:** DONE ✅ | **Effort:** Medium | **Depends on:** v4.20.4 DONE

---

## Step 1 — OVERHAUL-2: Create `src/hooks/useSessionTimer.js`

```js
// src/hooks/useSessionTimer.js
// OVERHAUL-2: Centralized session duration tracking.
// Eliminates per-mode useRef(Date.now()) boilerplate across 14 call sites.
import { useRef } from 'react';

export function useSessionTimer() {
  const startRef = useRef(Date.now());
  return {
    getDurationMs: () => Date.now() - startRef.current,
    reset: () => {
      startRef.current = Date.now();
    },
  };
}
```

Add to `src/hooks/index.js`:

```js
export { useSessionTimer } from './useSessionTimer.js';
```

Commit: `feat(hooks): OVERHAUL-2 useSessionTimer — centralized session duration tracking`

---

## Step 2 — N6: Fix `durationMs` — ModeRouter + QuizShell + 14 modes

**This is the largest step. Work through it systematically.**

### 2a — `src/router/ModeRouter.jsx`

Find `makeSessionEnd`:

```js
// FIND:
const makeSessionEnd = (modeName) => ({ correct = 0, total = 0 } = {}) => {
  recordSession({ mode: modeName, correct, total });
  ...

// CHANGE TO:
const makeSessionEnd = (modeName) => ({ correct = 0, total = 0, durationMs = 0 } = {}) => {
  recordSession({ mode: modeName, correct, total, durationMs });
  ...
```

Find `makeFinishHandler` (used for kuis mode):

```js
// FIND:
const makeFinishHandler = (modeName, extra) => ({ correct = 0, total = 0, ...rest } = {}) => {
  recordSession({ mode: modeName, correct, total });
  ...

// CHANGE TO:
const makeFinishHandler = (modeName, extra) => ({ correct = 0, total = 0, durationMs = 0, ...rest } = {}) => {
  recordSession({ mode: modeName, correct, total, durationMs });
  ...
```

Commit: `fix(ModeRouter): N6/N17 — both handlers accept + forward durationMs`

### 2b — `src/components/QuizShell.jsx`

Add session start time tracking:

```js
import { useRef } from 'react'; // add if not imported
// Inside component:
const startTimeRef = useRef(Date.now());

// Find where onFinish is called (at quiz completion):
// FIND:
onFinish?.({ correct, total: results.length, maxStreak, maxWrongStreak });
// CHANGE TO:
onFinish?.({
  correct,
  total: results.length,
  maxStreak,
  maxWrongStreak,
  durationMs: Date.now() - startTimeRef.current,
});
```

Commit: `fix(QuizShell): N6 — track startTime; pass durationMs to onFinish`

### 2c — Modes using QuizShell (forward durationMs in handleFinish)

**Files:** JACMode.jsx, VocabMode.jsx, WaygroundMode.jsx, SipilMode.jsx, BangunanMode.jsx

For each, find the `handleFinish` callback passed to QuizShell:

```js
// FIND (example from JACMode):
const handleFinish = useCallback(({ correct, total }) => {
  onSessionEnd?.({ correct, total });
  ...

// CHANGE TO:
const handleFinish = useCallback(({ correct, total, durationMs = 0 }) => {
  onSessionEnd?.({ correct, total, durationMs });
  ...
```

Commit: `fix(modes): N6 — QuizShell modes forward durationMs from handleFinish (JAC/Vocab/Wayground/Sipil/Bangunan)`

### 2d — Modes NOT using QuizShell (add useSessionTimer)

**Files:** SprintMode.jsx, SimulasiMode.jsx, ConfusionMode.jsx, ProductionMode.jsx, DangerMode.jsx, AngkaMode.jsx, ReviewMode.jsx, QuizProduksiMode.jsx, DengarMode.jsx

For each, add at component top:

```js
import { useSessionTimer } from '../hooks/useSessionTimer.js'; // add if not present
const { getDurationMs } = useSessionTimer();
```

Then find where `onSessionEnd` is called and add `durationMs`:

```js
// BEFORE:
onSessionEnd?.({ correct, total });

// AFTER:
onSessionEnd?.({ correct, total, durationMs: getDurationMs() });
```

**SprintMode** already has elapsed time via `DURATIONS` — use whichever gives better precision. If `getDurationMs()` is available, prefer it. If sprint has its own timer, you can use: `durationMs: elapsed * 1000` where `elapsed = duration - timeLeft`.

**SimulasiMode** same: if it has `config.time - timeLeft`, use that. Otherwise use `getDurationMs()`.

Commit: `fix(modes): N6/N21 — all 9 non-QuizShell modes add useSessionTimer + durationMs`

---

## Step 3 — N22: Fix `recordWrong` in ProgressContext

**File:** `src/contexts/ProgressContext.jsx` around line 103

```js
// FIND:
qw[cardId] = (qw[cardId] ?? 0) + 1; // ❌ plain int

// CHANGE TO:
import { makeWrongEntry } from '../utils/wrong-tracker.js'; // add if not imported
qw[cardId] = makeWrongEntry(qw[cardId]); // {count, lastWrong}
```

Commit: `fix(ProgressContext): N22 — recordWrong uses makeWrongEntry format (not plain int)`

---

## Step 4 — N8 + REF-5: Achievement descriptions from constants

**File:** `src/utils/achievements.js`

```js
import { HALF_DECK_THRESHOLD, TOTAL_CARDS } from './constants.js';

// FIND entries with hardcoded count strings:
{ id: 'half_deck', desc: '705+ kartu hafal', ... },
{ id: 'full_deck', desc: 'Semua 1410 kartu hafal', ... },

// CHANGE TO:
{ id: 'half_deck', desc: `${HALF_DECK_THRESHOLD}+ kartu hafal`, ... },
{ id: 'full_deck', desc: `Semua ${TOTAL_CARDS} kartu hafal`, ... },
```

Commit: `fix(achievements): N8+REF-5 — description strings use HALF_DECK_THRESHOLD/TOTAL_CARDS constants`

---

## Step 5 — N14: Hoist `buildAllQuestions()` in daily-challenge.js

**File:** `src/utils/daily-challenge.js`

Find `buildAllQuestions()` — it's currently called inside another function (rebuilds the question pool on every call). Move it to module level:

```js
// FIND (inside a function):
function buildAllQuestions() { ... }
const all = buildAllQuestions();

// CHANGE TO (at module level, outside any function):
function buildAllQuestions() { ... }
const ALL_QUESTIONS = buildAllQuestions(); // called once on import
// Then replace internal uses of buildAllQuestions() with ALL_QUESTIONS
```

Commit: `perf(daily-challenge): N14 — hoist buildAllQuestions() to module level const`

---

## Step 6 — B4: `recommendMode` ignores output/listening modes

**File:** `src/utils/recommend-mode.js`

Find the final fallback or recommend logic. Add a maintenance-phase rotation before the default fallback:

```js
// Add before the final fallback return:
const matureCount = srsState?.mature ?? 0;
const avgAcc = getAvgAccuracy(sessions); // already imported

if (matureCount > 300 && avgAcc !== null && avgAcc > 70) {
  const dayIdx = Math.floor(Date.now() / 86400000) % 3;
  const rotation = ['produksi', 'dengar', 'mirip'];
  const mode = rotation[dayIdx];
  return {
    mode,
    icon: '🔄',
    label: 'Mode Rotasi',
    reason: 'Kuasaan kosakata sudah baik — variasikan latihan',
  };
}
```

Commit: `fix(recommend-mode): B4 — add maintenance-phase rotation for output/listening modes`

---

## Final Steps

1. `npm run lint` — 0 warnings
2. `npm test -- --run` — all pass
3. `npm run build`
4. Bump → `4.20.5`, update CHANGELOG + \_MAP.md, push

## Done when

- [ ] useSessionTimer.js created
- [ ] ModeRouter both handlers accept durationMs
- [ ] QuizShell passes durationMs to onFinish
- [ ] 5 QuizShell modes forward durationMs in handleFinish
- [ ] 9 non-QuizShell modes use useSessionTimer
- [ ] ProgressContext recordWrong uses makeWrongEntry
- [ ] Achievement descriptions from constants
- [ ] buildAllQuestions hoisted
- [ ] recommendMode adds rotation
- [ ] All tests pass; version 4.20.5
