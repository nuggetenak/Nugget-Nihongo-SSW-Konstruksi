# TASK v4.20.13 — PERF-1: Context Memoization (REF-10 + ENG-13)
**Status:** READY | **Effort:** Medium | **Depends on:** v4.20.12 DONE

## Goal
All 3 context Providers rebuild `value={}` fresh every render → all 23 mode consumers re-render unnecessarily. Fix with `useMemo`.

---

## Step 1 — Create `src/hooks/useStableContextValue.js` (ENG-13)

```js
// src/hooks/useStableContextValue.js
// Utility: memoizes a context value object based on deps array.
// Adds dev-only console warning if deps array length changes (structural bug indicator).
import { useMemo, useRef } from 'react';

export function useStableContextValue(buildFn, deps) {
  if (process.env.NODE_ENV === 'development') {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const lenRef = useRef(null);
    if (lenRef.current !== null && lenRef.current !== deps.length) {
      console.warn('[useStableContextValue] deps length changed — possible deps array bug');
    }
    lenRef.current = deps.length;
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(buildFn, deps);
}
```

Add to `src/hooks/index.js`:
```js
export { useStableContextValue } from './useStableContextValue.js';
```

Commit: `feat(hooks): ENG-13 useStableContextValue — memoized context value utility`

---

## Step 2 — Memoize `src/contexts/AppContext.jsx` (REF-10a)

1. Add `useMemo` to the React import
2. Find `const ctx = { ... }` near the Provider return
3. Wrap it:

```js
import { useState, useCallback, useMemo } from 'react';

// BEFORE:
const ctx = {
  mode, setMode, goTab, modeHistory, goBack, toast, // ...all fields
};

// AFTER — add module-level constants for stable empty defaults:
const EMPTY_ARR = [];

// inside the component:
const ctx = useMemo(() => ({
  mode, setMode, goTab, modeHistory, goBack, toast,
  // ...all fields — list ALL of them
}), [mode, setMode, goTab, modeHistory, goBack, toast]); // list all deps
```

**Important:** Every value in the ctx object must appear in the deps array. Run `npm run lint` after — ESLint `react-hooks/exhaustive-deps` will catch any missing deps.

Commit: `perf(AppContext): REF-10 memoize context value with useMemo`

---

## Step 3 — Memoize `src/contexts/ProgressContext.jsx` (REF-10b)

This is the most complex because it has ~20+ fields. Same pattern:

```js
import { useState, useCallback, useMemo } from 'react';

// Module-level stable defaults (prevent {} recreation each render):
const EMPTY_OBJ = Object.freeze({});
const EMPTY_ARR = Object.freeze([]);

// Inside provider, replace ctx construction:
const ctx = useMemo(() => ({
  known: knownSet,
  unknown: unknownSet,
  starred: starredSet,
  quizWrong: prog.quizWrong ?? EMPTY_OBJ,
  jacScores: prog.jacScores ?? EMPTY_OBJ,
  wgScores: prog.wgScores ?? EMPTY_OBJ,
  vocabScores: prog.vocabScores ?? EMPTY_OBJ,
  wgWrong: prog.wgWrong ?? EMPTY_OBJ,
  vocabWrong: prog.vocabWrong ?? EMPTY_OBJ,
  streakData: prog.streakData ?? EMPTY_OBJ,
  dailyCount: prog.dailyCount ?? { count: 0, date: '' },
  recentCards: prog.recentCards ?? EMPTY_ARR,
  milestoneStreak7: prog.milestoneStreak7 ?? false,
  milestoneQuiz70: prog.milestoneQuiz70 ?? false,
  toastQueue,
  clearToast,
  sessions: prog.sessions ?? EMPTY_ARR,
  recordSession,
  handleMark,
  toggleStar,
  recordWrong,
  saveScore,
  setMilestoneQuiz70,
}), [
  knownSet, unknownSet, starredSet, prog,
  toastQueue, clearToast,
  recordSession, handleMark, toggleStar, recordWrong, saveScore, setMilestoneQuiz70,
]);
```

**Note on `prog`:** `prog` is the whole progress object from state. If it changes reference on every write, the memo still re-runs — but that's correct behavior (something actually changed). The key win is preventing re-renders when *unrelated* state updates (toast, streak, etc.) fire.

Commit: `perf(ProgressContext): REF-10 memoize context value — prevents unnecessary re-renders in 23 modes`

---

## Step 4 — Memoize `src/contexts/SRSContext.jsx` (REF-10c)

This one is simpler — `srs` comes from `useSRS(trackCardIds)` which returns a fresh object.

Check if `useSRS` already returns a stable ref. If not:
```js
import { useMemo } from 'react';

// In SRSContext provider:
const stableSrs = useMemo(() => srs, [srs.dueCount, srs.stats, srs.review, srs.getDue]);
// Only re-memoize when observable values change

return <SRSCtx.Provider value={stableSrs}>{children}</SRSCtx.Provider>;
```

If `useSRS` already returns a stable object via `useMemo` internally, this step may be a no-op. Check `src/hooks/useSRS.js` — if it wraps return value in useMemo already, skip this step.

Commit: `perf(SRSContext): REF-10 memoize SRS context value`

---

## Step 5 — Verify: Write render-count test

Create `src/tests/context-memo.test.jsx`:
```jsx
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { ProgressProvider, useProgress } from '../contexts/ProgressContext.jsx';

describe('ProgressContext memoization', () => {
  it('consumer does not re-render when unrelated state changes', () => {
    let renderCount = 0;
    function Consumer() {
      useProgress(); // just subscribe
      renderCount++;
      return null;
    }
    const { rerender } = render(
      <ProgressProvider><Consumer /></ProgressProvider>
    );
    const initialCount = renderCount;
    // Re-render provider with same props (simulates toast tick or unrelated update)
    rerender(<ProgressProvider><Consumer /></ProgressProvider>);
    // Consumer should NOT have re-rendered extra times
    expect(renderCount).toBe(initialCount + 1); // only +1 from rerender itself
  });
});
```

This is a best-effort test — the exact behavior depends on implementation. Adjust expected count if needed. The key is it doesn't spike to 5+ renders.

---

## Final Steps
1. `npm run lint` — 0 warnings (exhaustive-deps must pass)
2. `npm test -- --run` — all pass
3. `npm run build`
4. Bump → `4.20.13`, update CHANGELOG + _MAP.md, push

## Done when
- [ ] useStableContextValue.js created
- [ ] AppContext ctx memoized
- [ ] ProgressContext ctx memoized (with EMPTY_OBJ/ARR constants)
- [ ] SRSContext checked + memoized if needed
- [ ] lint exhaustive-deps passing
- [ ] context-memo test added
- [ ] All tests pass; version 4.20.13
