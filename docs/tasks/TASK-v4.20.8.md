# TASK v4.20.8 — F1, F2, F4, R1, R2, N10
**Status:** DONE ✅ | **Effort:** Low | **Depends on:** v4.20.7 DONE

---

## F1 — Starred-cards quiz entry point

**File:** `src/components/Dashboard.jsx` (or BelajarTab.jsx)

Add a "Kuis Bintang" button visible only when `starred.size > 0`:

```jsx
import { useProgress } from '../contexts/ProgressContext.jsx';
import { useApp } from '../contexts/AppContext.jsx';
const { starred } = useProgress();
const { goMode } = useApp();

// In render, somewhere near the quick-action buttons:
{starred.size > 0 && (
  <button onClick={() => goMode('kuis', { filterIds: [...starred] })}
    style={{ /* use existing button style */ }}>
    ⭐ Kuis Bintang ({starred.size})
  </button>
)}
```

Commit: `feat(Dashboard): F1 — starred-cards quiz button`

---

## F2 — SumberMode missing produksi/kuisprod buttons

**File:** `src/modes/SumberMode.jsx`

Find the quick-launch action buttons (3 existing: kartu, kuis, sprint or similar). Add 2 more:

```jsx
// Add these alongside existing action buttons (adapt to match existing style):
<button onClick={() => onNavigate?.('produksi', { filterIds })}>✍️ Produksi</button>
<button onClick={() => onNavigate?.('kuisprod', { filterIds })}>🔤 Kuis Prod</button>
```

Where `filterIds` is the existing filtered card IDs for the selected source.

Commit: `feat(SumberMode): F2 — add produksi + kuisprod quick-launch buttons`

---

## F4 — ExportMode migration toast

**File:** `src/modes/ExportMode.jsx`

Find where `importAllSafe` is called (on restore/import). Check the return value:

```js
// FIND:
const result = importAllSafe(snapshot);

// ADD after:
if (result?.migrated) {
  showToast('ℹ️ Data diperbarui dari format lama — backup baru tersedia.');
}
```

(Use whatever toast mechanism the file already uses — `toast(...)` from useApp, or dispatch, etc.)

Commit: `feat(ExportMode): F4 — show migration notice when old snapshot restored`

---

## R1 — ReviewMode dead state

**File:** `src/modes/ReviewMode.jsx` around line 28

```js
// FIND and DELETE all 3 occurrences:
const [_lastResult, setLast] = useState(null); // DELETE this line
// ...
setLast(...); // DELETE these calls (2 of them)
```

Commit: `fix(ReviewMode): R1 — remove _lastResult dead state (never read)`

---

## R2 — Dashboard stale streak/dailyCount

**File:** `src/components/Dashboard.jsx`

```js
// FIND (stale useMemo with empty deps):
const streak     = useMemo(() => getStreak(), []);     // ❌ freezes at mount
const dailyCount = useMemo(() => getDailyCount(), []); // ❌ freezes at mount

// CHANGE TO (consume from ProgressContext — already subscribed to state changes):
import { useProgress } from '../contexts/ProgressContext.jsx';
const { streakData, dailyCount } = useProgress();
// Use streakData.current for streak count
// Use dailyCount.count for daily count
```

Remove the direct `getStreak()` / `getDailyCount()` calls if they're no longer needed.

Commit: `fix(Dashboard): R2 — streak/dailyCount from ProgressContext (not stale useMemo)`

---

## N10 — SprintMode: scope ghost timeline by duration

**File:** `src/modes/SprintMode.jsx`

Currently `sprintBests` is keyed globally. It should be keyed by duration so each duration (1min, 3min, etc.) has its own best score and timeline.

```js
// FIND where sprintBest is read/written (after N11 fix, sprintBests:{} is in DEFAULTS):
// Something like: prefs.sprintBest, prefs.sprintBestTimeline

// CHANGE to duration-keyed:
const key = selectedDuration; // e.g. 'sprint_60', 'sprint_180', etc.
const durationBests = prefs.sprintBests?.[key] ?? { score: 0, timeline: [] };
const currentBest = durationBests.score;
const ghostTimeline = durationBests.timeline;

// When saving:
storageSet('prefs', p => ({
  ...p,
  sprintBests: {
    ...(p.sprintBests ?? {}),
    [key]: { score: newScore, timeline: newTimeline }
  }
}));
```

Read the existing implementation first to understand the exact field names, then adapt.

Commit: `fix(SprintMode): N10 — sprintBests scoped by duration key`

---

## Final Steps
1. `npm run lint` — 0 warnings
2. `npm test -- --run` — all pass
3. `npm run build`
4. Bump → `4.20.8`, update CHANGELOG + _MAP.md, push

## Done when
- [ ] Starred-cards quiz button in Dashboard (F1)
- [ ] SumberMode has produksi/kuisprod buttons (F2)
- [ ] ExportMode shows migration toast (F4)
- [ ] ReviewMode _lastResult removed (R1)
- [ ] Dashboard streak/dailyCount from ProgressContext (R2)
- [ ] SprintMode bests keyed by duration (N10)
- [ ] All tests pass; version 4.20.8
