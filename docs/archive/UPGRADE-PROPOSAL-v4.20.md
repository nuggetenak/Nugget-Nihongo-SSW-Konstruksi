# SSW Konstruksi — Upgrade Proposal v4.20

**Date:** 2026-05-09 | **Base:** v4.19.5 | **Pass:** 14 (perf · context memoization · storage quota · JpDisplay re-parse)

---

## Changes from Pass 13

Pass 14 adds **3 new bugs** (PERF-1, PERF-2, STORAGE-1), **2 new refactors** (REF-10, REF-11), **3 new engines** (ENG-11, ENG-12, ENG-13). Focus: app-wide performance + production resilience (quota / re-render storms).

**New (pass 14) — performance + resilience:**

- **PERF-1** (P1) — All 3 contexts (App/Progress/SRS) build `value={}` fresh every render → all 23 modes re-render unnecessarily on any context owner state change
- **PERF-2** (P2) — `JpDisplay.DescBlock` re-parses ruby fragments on every render for every line — no memoization
- **STORAGE-1** (P1) — `localStorage.setItem` failures silently swallowed in `writeDoc` (`engine.js:38`). QuotaExceededError → user loses progress with no toast/recovery

**New refactors:**

- **REF-10** — Memoize all 3 context `value` objects via `useMemo` (PERF-1 fix)
- **REF-11** — `useMemo` JpDisplay DescBlock parsing keyed on `desc` (PERF-2 fix)

**New engines:**

- **ENG-11** — `hooks/useTrackedCards.js` — centralized filtered cards hook (track/category/source/known/unknown filters), eliminates ~15 sites of repeated filter logic
- **ENG-12** — `utils/storage-quota.js` — quota detection + recovery flow (toast → offer "Hapus history lama" / Export+Clear)
- **ENG-13** — `hooks/useStableContextValue.js` — utility hook for memoized context providers (powers REF-10)

All pass 12–13 items carry forward unchanged.

---

## P0 — CRITICAL BUGS

_(unchanged — X1, X2)_

---

## P1 — DATA CORRECTNESS + PERF

_(unchanged P1 items — B1–B5, N2, N4–N6, N9, N12, N13, DB-1)_

---

### PERF-1 · Context value not memoized — all consumers re-render on every owner state change _(NEW)_

**Files:** `src/contexts/AppContext.jsx`, `src/contexts/ProgressContext.jsx`, `src/contexts/SRSContext.jsx`

All three Provider components build the `value` prop fresh on every render:

```js
// ProgressContext.jsx ~line 145
const ctx = {
  known: knownSet,
  unknown: unknownSet,
  starred: starredSet,
  quizWrong: prog.quizWrong ?? {},
  // ... 20+ more fields
  recordSession,
  handleMark,
  toggleStar,
  recordWrong,
  saveScore,
};

return <ProgressCtx.Provider value={ctx}>{children}</ProgressCtx.Provider>;
```

`useMemo` is **not even imported**. Every call to `setProg()` (and there are ~15 callers across modes) creates a brand new `ctx` object. React's reference-equality check fails → **all 23 modes consuming `useProgress()` re-render**, even ones that don't use any of the changed fields.

Same pattern in:

- `AppContext.jsx` — `useMemo` not imported; `ctx = { ...20 fields ... }` built fresh each render
- `SRSContext.jsx` — `srs` from `useSRS(trackCardIds)` passed directly; `useSRS` returns a fresh object each call

**Impact:** Heavy modes (`FlashcardMode`, `JACMode`, `WaygroundMode`) re-mount expensive `useMemo` chains and JpDisplay parses on every unrelated state ticker (toast, streak, daily count).

**Fix (REF-10):**

```js
import { useMemo } from 'react';
// ...
const ctx = useMemo(
  () => ({
    known: knownSet,
    unknown: unknownSet,
    // ... all fields
  }),
  [knownSet, unknownSet, prog, toastQueue /* all deps */]
);
```

For complex deps (functions like `recordSession` from `useCallback`), they're already stable. Object/array fields from `prog.X ?? {}` need extraction to avoid `{}` recreation:

```js
// BEFORE (creates new {} every render):
quizWrong: prog.quizWrong ?? {},
// AFTER (stable when prog.quizWrong unchanged):
const quizWrong = prog.quizWrong ?? EMPTY_OBJ; // module-level const
```

**Test:** Add `src/tests/context-memo.test.jsx` — mount provider, render counter consumer, call unrelated setter, assert consumer renders ≤1 extra time.

---

### STORAGE-1 · `writeDoc` silently swallows QuotaExceededError → silent data loss _(NEW)_

**File:** `src/storage/engine.js` line 32–39

```js
function writeDoc(docKey, data) {
  try {
    const compressed = LZString.compressToUTF16(JSON.stringify(data));
    localStorage.setItem(docKey, compressed);
  } catch {} // ← swallows QuotaExceededError, JSON errors, everything
}
```

**Failure modes:**

1. localStorage at quota (~5–10 MB) → write fails → user thinks progress saved → next session: progress missing
2. Private browsing (Safari iOS) — quota = 0 → every write fails silently
3. Disk full → same

App has 1443 cards × FSRS state per card (~150 bytes) = ~215 KB SRS. Add sessions (180 cap × ~500 bytes = 90 KB), heatmap, scores → typical user is 300–500 KB. Power users on long-running installs can hit quota especially on iOS where origins share quota.

**Fix (paired with ENG-12):**

```js
function writeDoc(docKey, data) {
  try {
    const compressed = LZString.compressToUTF16(JSON.stringify(data));
    localStorage.setItem(docKey, compressed);
    return { ok: true };
  } catch (err) {
    if (err.name === 'QuotaExceededError' || err.code === 22) {
      onQuotaError(docKey); // ← from ENG-12, dispatches toast + recovery UI
      return { ok: false, reason: 'quota' };
    }
    console.error('[storage] writeDoc failed:', err);
    return { ok: false, reason: 'unknown' };
  }
}
```

`onQuotaError` (registered via `engine.setQuotaHandler(fn)` from `App.jsx`) dispatches a toast: _"Penyimpanan penuh. Backup otomatis tersedia di Pengaturan."_ and offers one-click compact-old-sessions or export+wipe.

---

## P2 — BUGS (continued)

### PERF-2 · `JpDisplay.DescBlock` re-parses ruby on every render _(NEW)_

**File:** `src/components/JpDisplay.jsx` lines 158–245

In `DescBlock`, every render path calls `parseRubyFragments(text)` once per line, line-of-text, intro, etc. — but only `JpFront` memoizes its top-level `parseRubyFragments(jp)`. Examples:

```js
// Branch A (line 188): per item
{
  renderJPWithRuby(item.body, parseRubyFragments(item.body));
}

// Branch B (line 218): per item.body
{
  renderJPWithRuby(item.body.trim(), parseRubyFragments(item.body.trim()));
}

// Branch C (line 232): per line
{
  renderJPWithRuby(line, parseRubyFragments(line));
}
```

`parseRubyFragments` runs a regex over the full string. A 10-line description with circled-numbers parses 10 separate strings each render. Most cards stay mounted — re-renders due to PERF-1 amplify this.

**Fix (REF-11):** Wrap the entire parsed structure in `useMemo` keyed on `desc`:

```js
export function DescBlock({ desc = '', maxLines = 0 }) {
  if (!desc) return null;

  const parsed = useMemo(() => parseDescStructure(desc, maxLines), [desc, maxLines]);
  // parsed = { branch: 'A'|'B'|'C', intro, items, lines, footnote }

  if (parsed.branch === 'A') return <BracketBranch {...parsed} />;
  if (parsed.branch === 'B') return <CircledBranch {...parsed} />;
  return <PlainBranch {...parsed} />;
}
```

Move parsing logic to a pure helper `parseDescStructure(desc, maxLines)` in `utils/jp-helpers.js` — testable in isolation.

---

### N24, N25, DB-2–DB-8 _(unchanged from pass 13)_

---

## New Engines

_(ENG-1 through ENG-10 unchanged)_

### ENG-11 · `hooks/useTrackedCards.js` — centralized filtered cards _(NEW)_

**Problem:** ~15 sites repeat variations of:

```js
const trackCats = useMemo(() => getCatsForTrack(track), [track]);
const cards = useMemo(
  () => CARDS.filter((c) => trackCats.includes(c.category) && !VOCAB_SOURCES.includes(c.source)),
  [trackCats]
);
```

Slight variations across FocusMode, FlashcardMode, ReviewMode, SearchMode, StatsMode, etc. Each duplicates filter logic. Bugs in one don't propagate to others (e.g., `SearchMode` v4.19.4 wrongCount fix wasn't needed in others because they used different patterns).

**Solution:**

```js
// hooks/useTrackedCards.js
export function useTrackedCards({
  track,
  excludeVocab = false,
  category = null,
  source = null,
  knownOnly = false,
  unknownOnly = false,
  starredOnly = false,
} = {}) {
  const { known, unknown, starred } = useProgress();
  return useMemo(() => {
    const trackCats = getCatsForTrack(track);
    return CARDS.filter((c) => {
      if (!trackCats.includes(c.category)) return false;
      if (excludeVocab && VOCAB_SOURCES.includes(c.source)) return false;
      if (category && c.category !== category) return false;
      if (source && c.source !== source) return false;
      if (knownOnly && !known.has(c.id)) return false;
      if (unknownOnly && !unknown.has(c.id)) return false;
      if (starredOnly && !starred.has(c.id)) return false;
      return true;
    });
  }, [
    track,
    excludeVocab,
    category,
    source,
    knownOnly,
    unknownOnly,
    starredOnly,
    known,
    unknown,
    starred,
  ]);
}
```

**Migration:** ~15 sites simplify to one line. Tested once via the hook's own test.

---

### ENG-12 · `utils/storage-quota.js` — quota detection + recovery _(NEW — pairs with STORAGE-1)_

```js
// utils/storage-quota.js
let _quotaHandler = null;

export function setQuotaHandler(fn) {
  _quotaHandler = fn;
}

export function isQuotaError(err) {
  return err?.name === 'QuotaExceededError' || err?.code === 22 || err?.code === 1014; // Firefox
}

export function notifyQuotaExceeded(context = '') {
  if (_quotaHandler) _quotaHandler(context);
  console.warn('[storage] Quota exceeded:', context);
}

// Estimates current usage in bytes (Storage API where available)
export async function estimateUsage() {
  if (navigator.storage?.estimate) {
    const e = await navigator.storage.estimate();
    return { used: e.usage, quota: e.quota, pct: ((e.usage / e.quota) * 100).toFixed(1) };
  }
  return null;
}
```

**Wire-up:** App.jsx registers handler on mount:

```js
useEffect(() => {
  setQuotaHandler(() => {
    showToast('💾 Penyimpanan penuh. Buka Pengaturan → Backup & Hapus.');
    // optional: navigate to ExportMode
  });
}, []);
```

**Recovery flow in SayaTab/ExportMode:**

- Show estimateUsage() bar (X.X MB / Y MB)
- Buttons: "Hapus sessions > 30 hari" / "Export semua + wipe"

---

### ENG-13 · `hooks/useStableContextValue.js` — memoized context value utility _(NEW — pairs with REF-10)_

```js
// hooks/useStableContextValue.js
import { useMemo, useRef } from 'react';

/**
 * Memoizes a context value object based on a deps array.
 * Adds dev-only warning if deps change shape between renders.
 */
export function useStableContextValue(buildValue, deps) {
  const lastDepsRef = useRef(null);
  if (process.env.NODE_ENV === 'development') {
    if (lastDepsRef.current && lastDepsRef.current.length !== deps.length) {
      console.warn('[useStableContextValue] deps array length changed');
    }
    lastDepsRef.current = deps;
  }
  return useMemo(buildValue, deps);
}
```

Used by all 3 contexts in REF-10:

```js
const ctx = useStableContextValue(
  () => ({
    known: knownSet,
    // ...
  }),
  [knownSet, unknownSet, prog, toastQueue, modeHistory]
);
```

---

## Refactors

_(REF-1 through REF-9 unchanged)_

### REF-10 · Memoize all 3 context value objects _(NEW)_

**Files:** `src/contexts/AppContext.jsx`, `ProgressContext.jsx`, `SRSContext.jsx`

Apply ENG-13's `useStableContextValue` (or plain `useMemo`). Module-level `EMPTY_OBJ`/`EMPTY_ARR` constants for `?? {}` defaults to keep references stable.

**Sequencing:** Land alongside PERF-1 fix in same commit. Add tests:

- `tests/context-memo.test.jsx` (new) — render-counter consumer; assert no extra renders on unrelated setter
- Run before/after benchmark in dev: simulate 100 toast triggers, measure FlashcardMode render count

**Risk:** Stale closures if deps array misses something. Mitigated by ESLint `react-hooks/exhaustive-deps` (already enabled).

---

### REF-11 · Memoize JpDisplay DescBlock parsing _(NEW)_

**File:** `src/components/JpDisplay.jsx`

Move three branch-detection + parsing logic from inline render to `parseDescStructure(desc, maxLines)` in `utils/jp-helpers.js`. Wrap call in `useMemo([desc, maxLines])` inside `DescBlock`.

**Bonus:** Same approach to `JpFront` — currently only the top-level `parseRubyFragments(jp)` is memoized; the branch detection (VS regex, ・split, ：split, → split) re-runs every render. Memoize the full structure.

---

## Implementation Plan (Updated)

| Version      | Items                                                              | Effort     |
| ------------ | ------------------------------------------------------------------ | ---------- |
| v4.20.0      | X1, X2                                                             | Low        |
| v4.20.1      | REF-6 + N13 + N9 + N18 + ENG-8                                     | Low        |
| v4.20.2      | ENG-2 + N15 + N19 + B5 + B1                                        | Low        |
| v4.20.3      | ENG-1 + ENG-7 + B3/N2/N4                                           | Medium     |
| v4.20.4      | ENG-3 + B2 + F3 + REF-4                                            | Medium     |
| v4.20.5      | B4 + N6 + N8/REF-5 + N14 + N22                                     | Medium     |
| v4.20.6      | N3 + N7 + N16 + REF-3 + N20 + REF-3b + N11 + R3 + N23 + OVERHAUL-3 | Medium     |
| v4.20.7      | ENG-5                                                              | Low        |
| v4.20.8      | F1 + F2 + F4 + R1 + R2 + N10                                       | Low        |
| v4.20.9      | DB-2 + DB-3 + DB-4/REF-7 + DB-5 + ENG-10 + ENG-9                   | Low        |
| v4.20.10     | DB-1 + DB-6 + DB-7 + DB-8                                          | Medium     |
| v4.20.11     | N24 + N25                                                          | Low        |
| **v4.20.12** | **STORAGE-1 + ENG-12 (quota detection + recovery toast)**          | **Low**    |
| **v4.20.13** | **PERF-1 + REF-10 + ENG-13 (context memoization)**                 | **Medium** |
| **v4.20.14** | **PERF-2 + REF-11 (JpDisplay memoization)**                        | **Low**    |
| **v4.20.15** | **ENG-11 (`useTrackedCards`) + migrate ~15 sites**                 | **Medium** |
| v4.21.0      | REF-8 + REF-9 + Tests C1-C7                                        | Medium     |
| v4.21.1      | ENG-4 + ENG-6 + OVERHAUL-1 + full sweep                            | High       |

---

## Hard Constraints (unchanged)

- ✅ Pure localStorage — no external deps added
- ✅ Prod dep count: 4 (unchanged)
- ✅ All 23 modes remain `React.lazy()`
- ✅ UI language: Indonesian
- ✅ Full offline PWA — no network calls
- ✅ Card IDs: NEVER changed
- ✅ New files: pure functions / pure hooks — testable without React

---

## Complete Bug Registry

| ID            | Priority       | File(s)                                              | Status                           |
| ------------- | -------------- | ---------------------------------------------------- | -------------------------------- |
| X1            | P0             | VocabMode.jsx                                        | Open                             |
| X2            | P0             | SprintMode.jsx                                       | Open                             |
| B1            | P1             | achievements.js                                      | → ENG-2                          |
| B2            | P1             | daily-mission.js                                     | → ENG-3                          |
| B3            | P1             | StatsMode.jsx                                        | → ENG-1                          |
| B4            | P1             | recommend-mode.js                                    | Open                             |
| B5            | P1             | StatsMode.jsx                                        | Remove `× 100`                   |
| DB-1          | P1             | jac-teori.js / jac-lifeline.js + public/             | Open — 12 photo assets missing   |
| **PERF-1**    | **P1**         | **All 3 contexts**                                   | **→ v4.20.13 (REF-10 + ENG-13)** |
| **STORAGE-1** | **P1**         | **storage/engine.js:38**                             | **→ v4.20.12 (ENG-12)**          |
| N1            | P2             | VocabMode / WaygroundMode                            | → REF-3                          |
| N2            | P2             | recommend-mode.js                                    | → ENG-1                          |
| N3            | P2             | ProductionMode.jsx                                   | Open                             |
| N4            | P2             | achievements.js                                      | → ENG-1                          |
| N5            | P2             | SayaTab.jsx                                          | → ENG-5                          |
| N6            | P2             | 13 modes + ModeRouter + QuizShell                    | Open (14 sites, OVERHAUL-2)      |
| N7            | P2             | JACMode.jsx                                          | → REF-3                          |
| N8            | P2             | achievements.js                                      | → REF-5                          |
| N9            | P2             | daily-mission.js, daily-challenge.js                 | → REF-6                          |
| N10           | P3             | SprintMode.jsx                                       | Open                             |
| N11           | P2             | schema.js                                            | → N10                            |
| N12           | P2             | engine.js                                            | → ENG-6                          |
| N13           | P1             | ProgressContext.jsx, Dashboard.jsx                   | → REF-6                          |
| N14           | P3             | daily-challenge.js                                   | → v4.20.5                        |
| N15           | P3             | ProgressContext.jsx                                  | → ENG-2                          |
| N16           | P2             | QuizProduksiMode.jsx                                 | → REF-3/ENG-4                    |
| N17           | P2             | ModeRouter.jsx                                       | → N6 scope                       |
| N18           | P2             | StudyHeatmap.jsx                                     | → REF-6                          |
| N19           | P3             | fsrs-scheduler.js                                    | → ENG-2                          |
| N20           | P2             | JACMode / WaygroundMode / VocabMode                  | → REF-3b / ENG-4                 |
| N21           | P2             | 12 modes (see N6 table)                              | → N6 / OVERHAUL-2                |
| N22           | P2             | ProgressContext.jsx:103                              | → v4.20.5                        |
| N23           | P2             | SipilMode.jsx:33 / BangunanMode.jsx:33               | → v4.20.6 / OVERHAUL-3           |
| N24           | P2             | VocabMode.jsx                                        | → v4.20.11                       |
| N25           | P3             | JACMode.jsx + SimulasiMode.jsx                       | → v4.20.11                       |
| **PERF-2**    | **P2**         | **JpDisplay.jsx (DescBlock + JpFront)**              | **→ v4.20.14 (REF-11)**          |
| DB-2          | P2             | jac-teori.js / jac-lifeline.js / JACMode.jsx:84      | → v4.20.9 + ENG-9                |
| DB-3          | P2             | sipil-sets.js / bangunan-sets.js                     | → v4.21.0 / REF-9                |
| DB-4          | P2             | 4 empty source files + merge-cards.mjs               | → v4.21.0 / REF-8                |
| DB-5          | P2             | wayground-sets.js header                             | → v4.20.9                        |
| DB-6          | P2             | cards.js / categories.js                             | → v4.20.10 (data authoring)      |
| DB-7          | P3             | angka-kunci.js                                       | → v4.20.10                       |
| DB-8          | P3             | cards.js / CI pipeline                               | → ENG-9                          |
| F1            | P3             | Dashboard.jsx                                        | Open                             |
| F2            | P3             | SumberMode.jsx                                       | Open                             |
| F3            | P3             | StatsMode.jsx                                        | → ENG-3                          |
| F4            | P3             | ExportMode.jsx                                       | → ENG-6 companion                |
| R1            | P3             | ReviewMode.jsx                                       | Open                             |
| R2            | P3             | Dashboard.jsx                                        | Open                             |
| R3            | P3             | FocusMode.jsx + ModeRouter                           | Open                             |
| OVERHAUL-1    | structural     | usePersistedState.js + 10 call sites                 | → v4.21.1                        |
| OVERHAUL-2    | structural     | new useSessionTimer.js + 14 sites                    | → v4.20.5                        |
| OVERHAUL-3    | structural     | ProgressContext.saveScore + SipilMode + BangunanMode | → v4.20.6                        |
| REF-8         | structural     | 8 source files → 6; vocab merged                     | → v4.21.0                        |
| REF-9         | structural     | sipil-sets + bangunan-sets → quiz-sets.js            | → v4.21.0                        |
| **REF-10**    | **structural** | **All 3 contexts memoized**                          | **→ v4.20.13**                   |
| **REF-11**    | **perf**       | **JpDisplay parse memoization**                      | **→ v4.20.14**                   |
| ENG-10        | script         | scripts/audit-related-ids.mjs                        | → v4.20.9                        |
| **ENG-11**    | **hook**       | **hooks/useTrackedCards.js**                         | **→ v4.20.15**                   |
| **ENG-12**    | **util**       | **utils/storage-quota.js**                           | **→ v4.20.12**                   |
| **ENG-13**    | **hook**       | **hooks/useStableContextValue.js**                   | **→ v4.20.13**                   |
| Tests C1-C7   | test           | src/tests/data-integrity.test.js                     | → v4.21.0                        |
