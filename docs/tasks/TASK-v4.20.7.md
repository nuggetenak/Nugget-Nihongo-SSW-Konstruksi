# TASK v4.20.7 — ENG-5: useDailyChallenge hook
**Status:** READY | **Effort:** Low | **Depends on:** v4.20.6 DONE

## Goal
Fix N5: daily challenge answer uses `sessionStorage` — lost on tab close/refresh. Move to storage engine.

---

## Step 1 — Update `src/storage/schema.js`

**File:** `src/storage/schema.js` — add to `DEFAULTS.prefs`:

```js
// FIND prefs DEFAULTS. ADD:
dailyChallengeLog: {},    // { [YYYY-MM-DD]: { selected: number, correct: boolean } }
```

Commit: `fix(schema): add dailyChallengeLog to DEFAULTS.prefs`

---

## Step 2 — Create `src/hooks/useDailyChallenge.js`

```js
// src/hooks/useDailyChallenge.js
// ENG-5: Daily challenge state + persistence.
// Replaces 8 lines of sessionStorage in SayaTab.jsx.
import { useState, useCallback } from 'react';
import { get, set as storageSet } from '../storage/engine.js';
import { getDailyChallenge } from '../utils/daily-challenge.js';
import { todayStr } from '../utils/date.js';

export function useDailyChallenge() {
  const today = todayStr(); // local date (REF-6)
  const question = getDailyChallenge(today);

  const [answered, setAnswered] = useState(() => {
    // Hydrate from storage engine (not sessionStorage)
    return get('prefs')?.dailyChallengeLog?.[today] ?? null;
  });

  const submit = useCallback(
    (selectedIdx, correctIdx) => {
      const result = { selected: selectedIdx, correct: selectedIdx === correctIdx };
      setAnswered(result);
      storageSet('prefs', (p) => ({
        ...p,
        dailyChallengeLog: {
          ...(p.dailyChallengeLog ?? {}),
          [today]: result,
        },
      }));
    },
    [today]
  );

  return { question, answered, submit };
}
```

Add to `src/hooks/index.js`:
```js
export { useDailyChallenge } from './useDailyChallenge.js';
```

Commit: `feat(hooks): ENG-5 useDailyChallenge — persists to storage engine (fixes N5 sessionStorage bug)`

---

## Step 3 — Update `src/components/SayaTab.jsx`

**File:** `src/components/SayaTab.jsx`

Find the daily challenge state logic (around lines 73, 215 — uses sessionStorage):

```js
// FIND (something like — exact code may vary):
const [challengeAnswered, setChallengeAnswered] = useState(
  () => sessionStorage.getItem('daily-challenge-answered') ?? null
);
const challenge = getDailyChallenge(today);
// ...
const handleChallengeAnswer = (idx) => {
  setChallengeAnswered(result);
  sessionStorage.setItem('daily-challenge-answered', JSON.stringify(result));
};

// REPLACE WITH:
import { useDailyChallenge } from '../hooks/useDailyChallenge.js';
const { question: challenge, answered: challengeAnswered, submit: submitChallenge } = useDailyChallenge();

// Replace handleChallengeAnswer calls with submitChallenge(selectedIdx, correctIdx)
// Remove the getDailyChallenge direct call (now inside the hook)
// Remove sessionStorage references
```

Commit: `refactor(SayaTab): use useDailyChallenge hook — removes sessionStorage usage (N5)`

---

## Final Steps
1. `npm run lint` — 0 warnings
2. `npm test -- --run` — all pass
3. `npm run build`
4. Bump → `4.20.7`, update CHANGELOG + _MAP.md, push

## Done when
- [ ] dailyChallengeLog in DEFAULTS.prefs
- [ ] useDailyChallenge.js created
- [ ] hooks/index.js updated
- [ ] SayaTab uses hook; no sessionStorage calls for challenge
- [ ] All tests pass; version 4.20.7
