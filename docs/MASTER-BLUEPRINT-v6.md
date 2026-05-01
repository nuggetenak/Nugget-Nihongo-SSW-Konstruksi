# 🏗️ SSW Konstruksi — Master Blueprint v6 (Agent-Executable)

> **Repository:** [`nuggetenak/Nugget-Nihongo-SSW-Konstruksi`](https://github.com/nuggetenak/Nugget-Nihongo-SSW-Konstruksi)
> **Current Version:** v3.6.1 (Phase 1–10 RELEASED ✅)
> **v6 Author:** Agent Opus 4.6 (Crunchy) · 2026-05-01
> **Supersedes:** MASTER-BLUEPRINT-v5.md (and all prior blueprints)
> **Status:** 📋 ACTIVE — For Sonnet 4.6 execution

---

## ⚡ What Changed: v5 → v6

v5 was a research-enrichment pass — it added §0.7–§0.12 evidence layers and C-10 through C-14 proposals but said "Phase 11–17 specs unchanged from v4-POLISHED", forcing the executing agent to cross-reference a separate archived document. That cross-reference is eliminated in v6.

**v6 changes:**

1. **SELF-CONTAINED** — All code specs are inline. No cross-references to v3/v4/v4-POLISHED. This document is the only document an executing agent needs.
2. **PHASE RENAMING** — Phases renamed A–G (fresh numbering). Old "Phase 11–17" mapping provided once, then never referenced again.
3. **AUDIT-CORRECTED** — Multiple stale items in v5 fixed against the actual codebase as of 2026-05-01:
   - TD-06 (SW auto-bump) → **ALREADY DONE** in `deploy.yml`. Removed from scope.
   - CI/CD → **ALREADY EXISTS**. Removed from scope.
   - Test count → **223 passing** (v5 said ~111 in places). Corrected.
   - `_MAP.md` → Still references v3 blueprint in some places. Phase G fixes this.
4. **EXACT CODE DIFFS** — Every change has copy-pasteable code. No "see other document."
5. **SEED DATA** — `sipil-sets.js` and `bangunan-sets.js` schemas + starter content provided in `docs/seeds/`.
6. **PER-PHASE CHECKLISTS** — Pre-flight, implementation, test, done checklists for each phase.
7. **RESEARCH PRESERVED** — All §0 evidence from v5 is carried forward by reference. The research is valid; the implementation specs were the gap.

**Phase mapping (old → new):**

| Old | New | Name |
|-----|-----|------|
| Phase 11 | **Phase A** | Bug Fixes + Storage v3 + Debt Cleanup |
| Phase 12 | **Phase B** | Content: Sipil & Bangunan |
| Phase 13 | **Phase C** | Daily Mission + Session Analytics |
| Phase 14 | **Phase D** | Export/Import Hardening |
| Phase 15 | **Phase E** | FlashcardMode Decomposition |
| Phase 16 | **Phase F** | Exam Countdown + Audio |
| Phase 17 | **Phase G** | QA + Polish + Release v4.0 |

---

## 📑 Table of Contents

0. [Project State Snapshot](#0-project-state-snapshot)
1. [Phase A — Bug Fixes + Storage v3 + Debt Cleanup](#phase-a--bug-fixes--storage-v3--debt-cleanup)
2. [Phase B — Content: Sipil & Bangunan](#phase-b--content-sipil--bangunan)
3. [Phase C — Daily Mission + Session Analytics](#phase-c--daily-mission--session-analytics)
4. [Phase D — Export/Import Hardening](#phase-d--exportimport-hardening)
5. [Phase E — FlashcardMode Decomposition](#phase-e--flashcardmode-decomposition)
6. [Phase F — Exam Countdown + Audio](#phase-f--exam-countdown--audio)
7. [Phase G — QA + Polish + Release v4.0](#phase-g--qa--polish--release-v40)
8. [Appendix: Research Foundation Summary](#appendix-research-foundation-summary)
9. [Appendix: Content Authoring Standard](#appendix-content-authoring-standard)
10. [Appendix: Agent Trail](#appendix-agent-trail)

---

## 0. Project State Snapshot

> Read this section to understand exactly what exists right now. Every file, every metric, every known issue.

### 0.1 Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19.1 |
| Build | Vite 6.3 |
| SRS Engine | ts-fsrs 5.3 |
| Storage | Pure localStorage (3-document model, v2 schema) |
| Hosting | GitHub Pages (static) |
| CI/CD | GitHub Actions (lint → test → build → deploy) |
| Tests | Vitest 4.1, @testing-library/react 16 |
| PWA | Custom service worker + manifest |

**Prod deps: 3** (react, react-dom, ts-fsrs) — Hard constraint: keep ≤ 5.

### 0.2 File Tree (source only)

```
src/
├── App.jsx                    (44 lines — root, 3-tab layout)
├── main.jsx                   (entry)
├── contexts/
│   ├── AppContext.jsx          (111 lines — track, theme, nav, toast)
│   ├── ProgressContext.jsx     (161 lines — known/unknown/starred/streak)
│   └── SRSContext.jsx          (32 lines — thin SRS wrapper)
├── data/
│   ├── cards.js                (1599 lines — 1438 flashcards)
│   ├── jac-official.js         (975 lines — ~95 JAC exam questions)
│   ├── wayground-sets.js       (860 lines — 12 quiz sets)
│   ├── csv-sets.js             (3998 lines — 12 sets, ~300 questions)
│   ├── angka-kunci.js          (critical numbers data)
│   ├── danger-pairs.js         (confusable pairs)
│   ├── categories.js           (category + source metadata)
│   └── index.js                (barrel re-export)
├── srs/
│   ├── fsrs-core.js            (204 lines — pure FSRS math)
│   ├── fsrs-store.js           (57 lines — localStorage adapter)
│   ├── fsrs-scheduler.js       (149 lines — due queue, stats)
│   └── index.js                (barrel)
├── storage/
│   ├── schema.js               (45 lines — v2 schema, DEFAULTS)
│   ├── engine.js               (156 lines — 3-doc R/W, migration)
│   └── migrations.js           (143 lines — v1→v2 migration)
├── hooks/
│   ├── usePersistedState.js
│   ├── useSRS.js
│   ├── useStreak.js            (streak tracker — ⚠️ needs rename)
│   ├── useQuizKeyboard.js
│   └── index.js
├── components/
│   ├── Dashboard.jsx           (165 lines)
│   ├── BelajarTab.jsx
│   ├── SayaTab.jsx             (169 lines)
│   ├── BottomNav.jsx
│   ├── QuizShell.jsx           (171 lines)
│   ├── ResultScreen.jsx
│   ├── JpDisplay.jsx           (207 lines)
│   ├── OptionButton.jsx
│   ├── ProgressBar.jsx
│   ├── ProgressRing.jsx
│   ├── FilterPopup.jsx
│   ├── EmptyState.jsx
│   ├── ConfirmDialog.jsx
│   ├── Toast.jsx
│   ├── TrackPicker.jsx
│   ├── Onboarding.jsx          (310 lines)
│   └── Skeleton.jsx
├── modes/                      (18 modes, all React.lazy)
│   ├── FlashcardMode.jsx       (447 lines — ⚠️ needs decomposition)
│   ├── ReviewMode.jsx          (190 lines)
│   ├── QuizMode.jsx            (161 lines — ⚠️ has _seenPool bug)
│   ├── SprintMode.jsx
│   ├── FocusMode.jsx
│   ├── JACMode.jsx
│   ├── WaygroundMode.jsx
│   ├── VocabMode.jsx
│   ├── SimulasiMode.jsx
│   ├── AngkaMode.jsx
│   ├── DangerMode.jsx
│   ├── SipilMode.jsx           (⚠️ stub — "Segera Hadir")
│   ├── BangunanMode.jsx        (⚠️ stub — "Segera Hadir")
│   ├── SearchMode.jsx
│   ├── GlossaryMode.jsx
│   ├── SumberMode.jsx
│   ├── StatsMode.jsx
│   ├── ExportMode.jsx          (⚠️ uses incompatible v1 format)
│   └── modes.module.css
├── router/
│   ├── ModeRouter.jsx          (180 lines)
│   └── modes.js                (mode registry + sections)
├── utils/
│   ├── jp-helpers.js           (furigana, readings, text utils)
│   ├── quiz-generator.js       (MC question generation)
│   ├── shuffle.js
│   ├── wrong-tracker.js
│   └── index.js
├── styles/
│   └── theme.js                (185 lines — tokens, CSS vars)
└── tests/                      (10 files, 223 tests, all passing)
```

### 0.3 Metrics

| Metric | Current Value |
|--------|-------------|
| Total source lines | ~15,978 |
| Tests | **223 passing** (10 files) |
| Prod dependencies | 3 |
| Modes | 18 (all lazy-loaded) |
| Flashcards | 1,438 |
| Quiz questions | ~770 (JAC + Wayground + CSV) |
| CSS Module files | 16 |
| localStorage documents | 3 (progress, srs, prefs) |
| CI/CD | ✅ GitHub Actions (auto-deploy) |
| SW auto-bump | ✅ Already in deploy.yml |

### 0.4 Confirmed Bugs (Still Open)

#### BUG-01 — Dashboard streak/count: dead utility functions

`Dashboard.jsx` exports `recordStudyDay()`, `incrementDailyCount()`, `pushRecentCard()` — but **nothing imports them**. These are dead code. Streak and daily count are actually handled inline in `ProgressContext.jsx`'s `handleMark()`. The dead exports should be removed, and any streak/count logic that Dashboard reads must come from ProgressContext.

#### BUG-02 — `_seenPool` module-scope hidden global state

`QuizMode.jsx` line 3: `const _seenPool = new Set()` is module-scope. React.lazy might recreate the module on HMR or route transitions, but in production builds the Set persists across mode entries. This means: if a user does QuizMode → exits → re-enters, seen cards are "remembered" incorrectly. Fix: move `_seenPool` into a `useRef`.

**Location:** `src/modes/QuizMode.jsx` lines 3, 31–35, 153.

#### BUG-03 — Milestone toast incomplete

`ProgressContext.jsx` has `_newKnownSize` (line 63) marked "reserved for milestone toast" but **never used to trigger a toast**. `milestoneStreak7` is tracked but no toast fires when it transitions to `true`. Wire these to `toast.show()` via AppContext.

#### BUG-04 — Anxiety-reduction toast missing (NEW from v5 research)

**Evidence:** Young (1991) — normalizing errors is an evidence-based intervention. Zhang (2019) — FLCA r = −.33.

When a user gets 5+ consecutive wrong answers in any quiz, no supportive message appears. Should show: `"Banyak salah? Wajar — artinya materi ini masih baru. Coba mode Kartu dulu 💪"` (4-second toast).

### 0.5 Technical Debt Register (Still Open)

| ID | Issue | Severity | Fix Phase |
|----|-------|----------|-----------|
| TD-01 | ExportMode uses v1 key format, incompatible with v2 storage | HIGH | A |
| TD-02 | Dead exports from Dashboard.jsx (recordStudyDay, etc.) | MEDIUM | A |
| TD-03 | wrong-tracker.js references v1 key names | MEDIUM | A |
| TD-04 | `useStreak` should be `useAnswerStreak` (naming clarity) | LOW | A |
| TD-05 | FLIP_STYLE injected to `<head>` via JS (should be CSS) | LOW | E |
| TD-07 | `data/index.js` barrel re-export adds indirection | LOW | G |
| TD-08 | Legacy nav arrays in `modes.js` (BELAJAR_MODES, etc.) | LOW | A |
| TD-09 | Card `desc` field: missing SSW workplace context | MEDIUM | B |
| TD-10 | Furigana always-visible regardless of user level | LOW | E |

**TD-06 (SW auto-bump) — ALREADY RESOLVED.** Present in `deploy.yml`. Removed from debt register.

### 0.6 Data Schemas (Current)

#### CARDS entry (cards.js)
```js
{
  id: 42,
  category: "listrik",         // 12 possible categories
  source: "jac-ch5",           // PDF chapter source
  furi: "せっちぼう",            // hiragana reading
  jp: "接地棒",                  // kanji/kana term
  romaji: "secchibou",
  id_text: "Batang pentanahan", // Indonesian translation
  desc: "..."                   // description (Indonesian)
}
```

#### Question Set entry (csv-sets.js / wayground-sets.js / jac-official.js)
```js
{
  id: "set-id",
  title: "Set Title",
  subtitle: "Subtitle",       // optional
  emoji: "🔧",
  questions: [
    {
      q: "質問テキスト",          // question text (Japanese)
      opts: ["A", "B", "C", "D"],       // options (Japanese)
      opts_id: ["A_id", "B_id", "C_id", "D_id"],  // options (Indonesian)
      ans: 0,                  // correct answer index (0-based)
      exp: "Penjelasan...",    // explanation (Indonesian)
      cat: "keselamatan",      // category
      hint: "...",             // optional hint
      desc: "...",             // optional description
    }
  ]
}
```

#### Storage v2 Schema (schema.js)
```js
STORAGE_VERSION = 2;

DOCS = {
  progress: 'ssw-progress',
  srs: 'ssw-srs-data',
  prefs: 'ssw-prefs',
};

DEFAULTS.progress = {
  _v: 2,
  known: [], unknown: [], starred: [],
  quizWrong: {}, wrongCounts: {},
  wgWrong: {}, vocabWrong: {},
  jacScores: {}, wgScores: {}, vocabScores: {},
  streakData: {}, dailyCount: { count: 0, date: '' },
  recentCards: [],
  milestoneStreak7: false, milestoneQuiz70: false,
};

DEFAULTS.srs = { _v: 2, cards: {} };

DEFAULTS.prefs = {
  _v: 2,
  track: null, theme: 'light', onboarded: false,
  tutorialFlashcard: false, lastMode: null, dailyGoal: 20,
};
```

### 0.7 Hard Constraints (Non-Negotiable for All Phases)

1. **Pure localStorage** — Never `window.storage`, Supabase, or external auth
2. **Max 3 prod dependencies** — react, react-dom, ts-fsrs. Adding a 4th requires explicit justification
3. **All 18+ modes stay React.lazy()** — No reverting lazy-loading
4. **UI language: Indonesian** — Code comments: English
5. **Zero-network-required** — App works fully offline (PWA)
6. **Tests must pass** — `npm test` green before and after every phase
7. **Build must succeed** — `npm run build` clean
8. **Lint clean** — `npm run lint` zero errors, zero warnings

---

## Phase A — Bug Fixes + Storage v3 + Debt Cleanup

> **Goal:** Fix all known bugs, upgrade storage schema to v3, clean technical debt. Zero new features.
> **Estimated scope:** ~15 files touched, ~30 new tests
> **Commit prefix:** `fix(phaseA):` or `refactor(phaseA):`

### A.PRE — Pre-flight Checklist

```
□ npm install succeeds
□ npm test — 223 tests pass
□ npm run build — clean
□ npm run lint — 0 errors
□ Read this entire Phase A section
```

---

### A.1 — Fix BUG-02: _seenPool module-scope → useRef

**File:** `src/modes/QuizMode.jsx`

**Current (broken):**
```js
// Line 3 — module scope, persists across mode entries
const _seenPool = new Set();
```

**Replace with:**
```js
// Remove line 3 entirely. Add inside component:
import { useState, useCallback, useMemo, useRef } from 'react';

export default function QuizMode({ cards, onExit }) {
  const seenPool = useRef(new Set());
  // ...
```

**All references to `_seenPool` → `seenPool.current`:**
- Line 31: `_seenPool.has(c.id)` → `seenPool.current.has(c.id)`
- Line 34: `_seenPool.clear()` → `seenPool.current.clear()`
- Line 35: `_seenPool.add(c.id)` → `seenPool.current.add(c.id)`
- Line 153: `_seenPool.clear()` → `seenPool.current.clear()`

**Test:** `src/tests/quiz.seenpool.test.jsx`
```js
import { describe, it, expect } from 'vitest';
// Verify that QuizMode does not export or use module-scope _seenPool.
// Integration test: mount QuizMode twice → second mount does not inherit first mount's seen cards.
```

---

### A.2 — Fix BUG-01 + TD-02: Remove dead Dashboard exports

**File:** `src/components/Dashboard.jsx`

Delete these three exported functions (lines 19–38) entirely:
- `export function recordStudyDay()` — dead, never imported
- `export function incrementDailyCount()` — dead, never imported
- `export function pushRecentCard()` — dead, never imported

Also delete the `today()` helper at line 17 if only used by these functions (check — it's also used by `getDailyCount` and `getStreak` which remain).

**Verify:** `grep -rn "recordStudyDay\|incrementDailyCount\|pushRecentCard" src/` should return 0 results after removal.

---

### A.3 — Fix BUG-03: Wire milestone toasts

**File:** `src/contexts/ProgressContext.jsx`

The context already tracks `milestoneStreak7` and `milestoneQuiz70` but never fires toasts.

**Changes:**

1. Import toast from AppContext:
```js
// At top of ProgressProvider:
import { useApp } from './AppContext.jsx'; // ← if circular, pass toast as prop instead
```

2. **Alternative (avoid circular deps):** Accept `toast` as a prop to ProgressProvider, or use a callback ref pattern.

**Recommended approach:** Add a `useEffect` in `App.jsx` that watches milestone flags:
```js
// In App.jsx, after const { known, unknown } = useProgress():
const progress = useProgress();

useEffect(() => {
  if (progress.milestoneStreak7 && !progress._streak7Toasted) {
    toast.show('🔥 7 hari berturut-turut! Konsistensi = kunci sukses.', { duration: 4000 });
    progress.setMilestoneToasted('streak7');
  }
}, [progress.milestoneStreak7]);
```

**Simpler approach (recommended):** Add a `checkMilestones()` function to ProgressContext that returns newly-achieved milestones, and call it from `handleMark`. Return value includes `{ newMilestones: ['streak7'] }`. Then in any component that calls `handleMark`, check the return:

```js
// In ProgressContext.jsx — modify handleMark return:
const result = { newMilestones: [] };
if (milestoneStreak7 && !prev.milestoneStreak7) {
  result.newMilestones.push('streak7');
}
return { ...nextState, _pendingMilestones: result.newMilestones };
```

**In FlashcardMode or wherever handleMark is called:**
```js
const handleKnown = (id) => {
  handleMark(id, 'known');
  // Toast logic now handled by a useEffect watching prog._pendingMilestones
};
```

**Pragmatic minimum implementation:**

In `ProgressContext.jsx`, add `toastQueue` state and a consumer:

```js
const [toastQueue, setToastQueue] = useState([]);

// Inside handleMark's setProg callback, after computing milestoneStreak7:
if (milestoneStreak7 && !prev.milestoneStreak7) {
  // Can't call toast here (inside setState). Use queue pattern:
  setTimeout(() => setToastQueue(q => [...q, { msg: '🔥 7 hari berturut-turut! Konsistensi = kunci sukses.', duration: 4000 }]), 0);
}
```

Expose `toastQueue` + `clearToast` from context. In `App.jsx`:
```js
const { toastQueue, clearToast } = useProgress();
const { toast } = useApp();

useEffect(() => {
  if (toastQueue.length > 0) {
    const t = toastQueue[0];
    toast.show(t.msg, { duration: t.duration });
    clearToast(0);
  }
}, [toastQueue]);
```

**Tests:** 3 tests
- Milestone streak7 triggers when streakData.days transitions from 6→7
- Milestone quiz70 triggers on first 70%+ quiz result
- No double-trigger on subsequent renders

---

### A.4 — Fix BUG-04: Anxiety-reduction toast

**File:** `src/hooks/useStreak.js` → Add consecutive wrong tracking

**Current `useStreak` only tracks correct streaks.** Extend it:

```js
export function useStreak() {
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [wrongStreak, setWrongStreak] = useState(0);
  const [maxWrongStreak, setMaxWrongStreak] = useState(0);

  const recordAnswer = useCallback((isCorrect) => {
    if (isCorrect) {
      setStreak((s) => {
        const next = s + 1;
        setMaxStreak((m) => Math.max(m, next));
        return next;
      });
      setWrongStreak(0);
    } else {
      setStreak(0);
      setWrongStreak((w) => {
        const next = w + 1;
        setMaxWrongStreak((m) => Math.max(m, next));
        return next;
      });
    }
  }, []);

  const reset = useCallback(() => {
    setStreak(0); setMaxStreak(0);
    setWrongStreak(0); setMaxWrongStreak(0);
  }, []);

  return { streak, maxStreak, wrongStreak, maxWrongStreak, recordAnswer, reset };
}
```

**File:** `src/components/QuizShell.jsx`

After `onFinish` call, check `maxWrongStreak`:
```js
// In the useEffect that fires on phase === 'finished':
useEffect(() => {
  if (phase === 'finished') {
    const correct = results.filter((r) => r.isCorrect).length;
    onFinish?.({ correct, total: results.length, maxStreak, maxWrongStreak });
  }
}, [phase]);
```

**File:** `src/App.jsx` or wherever QuizShell's `onFinish` is consumed

```js
// When onFinish fires with maxWrongStreak >= 5:
if (result.maxWrongStreak >= 5) {
  toast.show('Banyak salah? Wajar — artinya materi ini masih baru. Coba mode Kartu dulu 💪', { duration: 4000 });
}
```

**Tests:** 2 tests
- Toast appears when 5+ consecutive wrong
- Toast does NOT appear when < 5 consecutive wrong

---

### A.5 — TD-04: Rename useStreak → useAnswerStreak

**File:** `src/hooks/useStreak.js` → rename to `src/hooks/useAnswerStreak.js`

Update all imports (grep to find them):
- `src/components/QuizShell.jsx`
- `src/hooks/index.js`

**Also update the export name:**
```js
export function useAnswerStreak() { ... }
```

---

### A.6 — Storage Schema v2 → v3

**File:** `src/storage/schema.js`

```js
export const STORAGE_VERSION = 3;

export const DEFAULTS = {
  progress: {
    _v: 3,
    known: [], unknown: [], starred: [],
    quizWrong: {}, wrongCounts: {},
    wgWrong: {}, vocabWrong: {},
    jacScores: {}, wgScores: {}, vocabScores: {},
    sipilScores: {},      // ← NEW Phase B
    bangunanScores: {},   // ← NEW Phase B
    streakData: {},
    dailyCount: { count: 0, date: '' },
    recentCards: [],
    milestoneStreak7: false,
    milestoneQuiz70: false,
    sessions: [],         // ← NEW Phase C: { mode, correct, total, date, durationMs }
    dailyMission: null,   // ← NEW Phase C: { date, mode, target, completedAt }
  },
  srs: {
    _v: 3,
    cards: {},
  },
  prefs: {
    _v: 3,
    track: null,
    theme: 'light',
    onboarded: false,
    tutorialFlashcard: false,
    lastMode: null,
    dailyGoal: 20,
    examDate: null,          // ← NEW Phase F: ISO date string
    audioEnabled: true,      // ← NEW Phase F
    studyAnchor: null,       // ← NEW Phase C: 'morning' | 'lunch' | 'evening'
    furiganaPolicy: 'always', // ← NEW Phase E: 'always' | 'tap' | 'hidden'
  },
};
```

**File:** `src/storage/migrations.js` — Add `migrate_v2_to_v3()`:

```js
export function hasV2Data() {
  try {
    const raw = localStorage.getItem('ssw-progress');
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed?._v === 2;
  } catch { return false; }
}

export function migrate_v2_to_v3() {
  const progress = JSON.parse(localStorage.getItem('ssw-progress') || '{}');
  const srs = JSON.parse(localStorage.getItem('ssw-srs-data') || '{"cards":{}}');
  const prefs = JSON.parse(localStorage.getItem('ssw-prefs') || '{}');

  // Add new fields with defaults
  progress._v = 3;
  progress.sipilScores = progress.sipilScores ?? {};
  progress.bangunanScores = progress.bangunanScores ?? {};
  progress.sessions = progress.sessions ?? [];
  progress.dailyMission = progress.dailyMission ?? null;

  srs._v = 3;

  prefs._v = 3;
  prefs.examDate = prefs.examDate ?? null;
  prefs.audioEnabled = prefs.audioEnabled ?? true;
  prefs.studyAnchor = prefs.studyAnchor ?? null;
  prefs.furiganaPolicy = prefs.furiganaPolicy ?? 'always';

  return { progress, srs, prefs };
}
```

**File:** `src/storage/engine.js` — Update `init()` to handle v2→v3:

```js
import { hasV1Data, migrate_v1_to_v2, cleanup_v1_keys } from './migrations.js';
import { hasV2Data, migrate_v2_to_v3 } from './migrations.js';  // ← ADD

// In init():
if (isV2) {
  // v2 data — need v3 migration? Check version
  if (progressRaw._v === 2) {
    const migrated = migrate_v2_to_v3();
    _cache.progress = migrated.progress;
    _cache.srs = migrated.srs;
    _cache.prefs = migrated.prefs;
    writeDoc(DOCS.progress, _cache.progress);
    writeDoc(DOCS.srs, _cache.srs);
    writeDoc(DOCS.prefs, _cache.prefs);
  }
  // ... existing v2 load
}
```

Actually, cleaner approach — replace the `isV2` check with a version-aware loader:

```js
export function init() {
  if (_initialized) return;

  const progressRaw = readDoc(DOCS.progress);
  const version = progressRaw?._v ?? 0;

  if (version === STORAGE_VERSION) {
    // Current version — load directly
    _cache.progress = progressRaw;
    _cache.srs = readDoc(DOCS.srs) ?? freshDefaults().srs;
    _cache.prefs = readDoc(DOCS.prefs) ?? freshDefaults().prefs;
  } else if (version === 2) {
    // v2 → v3 migration
    const migrated = migrate_v2_to_v3();
    _cache = { progress: migrated.progress, srs: migrated.srs, prefs: migrated.prefs };
    writeDoc(DOCS.progress, _cache.progress);
    writeDoc(DOCS.srs, _cache.srs);
    writeDoc(DOCS.prefs, _cache.prefs);
  } else if (hasV1Data()) {
    // v1 → v2 → v3
    const v2 = migrate_v1_to_v2();
    // Write v2 first, then run v2→v3
    // ... or chain migrations
    const migrated = migrate_v2_to_v3_from(v2);
    _cache = { progress: migrated.progress, srs: migrated.srs, prefs: migrated.prefs };
    writeDoc(DOCS.progress, _cache.progress);
    writeDoc(DOCS.srs, _cache.srs);
    writeDoc(DOCS.prefs, _cache.prefs);
    cleanup_v1_keys();
  } else {
    // Fresh install
    const d = freshDefaults();
    _cache = { progress: d.progress, srs: d.srs, prefs: d.prefs };
    writeDoc(DOCS.progress, _cache.progress);
    writeDoc(DOCS.srs, _cache.srs);
    writeDoc(DOCS.prefs, _cache.prefs);
  }

  _initialized = true;
}
```

**Tests:** 5 tests
- Fresh install creates v3 schema
- v2 data migrates to v3 (new fields present, old data preserved)
- v1 data migrates through v2 to v3
- New default fields exist after migration (sipilScores, sessions, examDate, etc.)
- `STORAGE_VERSION` === 3

---

### A.7 — TD-03: Fix wrong-tracker v1 key references

**File:** `src/utils/wrong-tracker.js`

Audit for any hardcoded `'ssw-quiz-wrong'` or similar v1 key patterns. All reads/writes should go through `storage/engine.js`:

```js
import { get, set } from '../storage/engine.js';

export function getWrongCount(wrongObj) {
  if (!wrongObj) return 0;
  return typeof wrongObj === 'number' ? wrongObj : (wrongObj?.count ?? 0);
}

export function recordWrong(cardId) {
  const progress = get('progress');
  const current = progress.quizWrong?.[cardId] ?? 0;
  set('progress', (p) => ({
    ...p,
    quizWrong: { ...p.quizWrong, [cardId]: current + 1 },
  }));
}
```

---

### A.8 — TD-01: Fix ExportMode format compatibility

**File:** `src/modes/ExportMode.jsx`

ExportMode currently uses its own export format that doesn't match the v2 (soon v3) storage engine format.

**Option 1 (recommended):** Delete ExportMode entirely. Move export/import to SayaTab (Phase D handles the full implementation). For now, just ensure ExportMode calls `engine.exportAll()` and `engine.importAll()`.

**Option 2 (minimal fix):** Replace ExportMode's custom logic with:
```js
import { exportAll, importAll } from '../storage/engine.js';

// Export button:
const handleExport = () => {
  const data = exportAll();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ssw-progress-v${data._storage_version}-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
};
```

---

### A.9 — TD-08: Remove legacy nav arrays

**File:** `src/router/modes.js`

Delete these (lines near bottom):
```js
// DELETE:
export const BELAJAR_MODES = ...
export const UJIAN_MODES = ...
export const LAINNYA_MODES = ...
```

**Verify:** `grep -rn "BELAJAR_MODES\|UJIAN_MODES\|LAINNYA_MODES" src/` — should return only the definition lines (which you're deleting). If anything imports them, update those imports to use `MODE_SECTIONS` instead.

---

### A.10 — Growth Mindset Language (C-13 from v5)

**Evidence:** Dweck (2006) — "not yet" framing preserves motivation.

**File:** `src/components/ResultScreen.jsx`

Replace generic encouragement strings:

| Context | Current | New |
|---------|---------|-----|
| Path B (< 50%) | `"Jangan Menyerah!"` (generic) | `"Belum. Tapi kamu sudah tahu apa yang perlu dipelajari."` |
| Path encourage emoji | `'💪'` | `'🌱'` |

Find in `ResultScreen.jsx`:
```js
// Change the path label:
// Old:
path === 'encourage' ? '💪' : grade.emoji
// New:
path === 'encourage' ? '🌱' : grade.emoji
```

In `theme.js` or wherever `getGrade` is defined, update the label for low grades to use growth-mindset language. Or change it directly in ResultScreen where grade.label is shown:

```js
// After heroLabel:
<div className={s.heroLabel}>
  {path === 'celebrate' ? '🎉 ' : ''}
  {path === 'encourage' ? 'Belum. Tapi kamu sudah tahu apa yang perlu dipelajari.' : grade.label}
</div>
```

This is a zero-risk string change. No architecture impact.

---

### A.TESTS — Phase A Test Summary

| Test File | Tests | Description |
|-----------|-------|-------------|
| `quiz.seenpool.test.jsx` | 3 | useRef-based seen pool |
| `storage.migration-v3.test.js` | 5 | v2→v3, v1→v3, fresh install |
| `milestone.toast.test.jsx` | 3 | streak7, quiz70, no double-fire |
| `anxiety.toast.test.jsx` | 2 | wrongStreak ≥5, wrongStreak <5 |
| `wrongtracker.test.js` | 3 | v3-compatible read/write |
| **Total new** | **~16** | |
| **Running total** | **~239** | |

### A.DONE — Phase A Completion Checklist

```
□ All 4 bugs fixed (BUG-01 through BUG-04)
□ Storage schema v3 with migration path
□ All TD items for Phase A resolved
□ Growth mindset strings in ResultScreen
□ useStreak.js renamed to useAnswerStreak.js
□ Legacy nav arrays removed from modes.js
□ npm test — all tests pass (≥239)
□ npm run build — clean
□ npm run lint — 0 errors
□ CHANGELOG.md entry added
□ Commit: fix(phaseA): bug fixes, storage v3, debt cleanup
```

---

## Phase B — Content: Sipil & Bangunan

> **Goal:** Replace SipilMode and BangunanMode stubs with functional quiz modes backed by real question data.
> **Estimated scope:** 2 new data files, 2 mode rewrites, ~25 new tests
> **Commit prefix:** `feat(phaseB):`
> **Depends on:** Phase A (storage v3 with sipilScores/bangunanScores)

### B.PRE — Pre-flight Checklist

```
□ Phase A committed and passing
□ storage/schema.js has sipilScores and bangunanScores in DEFAULTS
□ Read Appendix: Content Authoring Standard (below)
```

---

### B.1 — Create `src/data/sipil-sets.js`

**Schema:** Identical to `csv-sets.js`. See `docs/seeds/sipil-sets-seed.js` for starter content.

```js
// src/data/sipil-sets.js — 土木 (Civil Engineering) question sets
// Content standard: every question must pass LSP filter (see blueprint Appendix)

export const SIPIL_SETS = [
  {
    id: 'sipil-01',
    title: '土工事の基本',
    subtitle: 'Pekerjaan Tanah Dasar',
    emoji: '⛏️',
    questions: [
      {
        q: '掘削作業を行う前に必ず確認することは？',
        opts: ['地下埋設物の有無', '天気予報', '作業員の年齢', '昼食のメニュー'],
        opts_id: [
          'Ada tidaknya utilitas bawah tanah',
          'Prakiraan cuaca',
          'Usia pekerja',
          'Menu makan siang'
        ],
        ans: 0,
        exp: 'Sebelum menggali, WAJIB cek utilitas bawah tanah (gas, listrik, air) untuk mencegah kecelakaan. Atasan akan tanya: 地下埋設物の確認はしましたか？',
        cat: 'jenis_kerja',
        desc: 'Pengecekan utilitas bawah tanah sebelum penggalian. Sebagai pekerja SSW: ini prosedur K3 wajib sebelum excavator mulai kerja — diatur UU Keselamatan Kerja Jepang.'
      },
      // ... more questions (minimum 15 per set, target 3 sets = 45+ questions)
    ]
  },
  // sipil-02, sipil-03 ...
];
```

**Content authoring rules (from v5 research, mandatory):**

1. Every `desc` must include SSW workplace context (not just definition)
2. Every `exp` must explain WHY the correct answer is correct + the most common wrong answer for Indonesian speakers
3. `opts_id` must use construction-worker register, not textbook register
4. Each set must sample ≥3 different semantic domains (no 10 consecutive 土留め questions)
5. Every question must be traceable to a TSA task ("Would a supervisor say this on site?")
6. `ans` is 0-based — always verify against `opts[]`

**Minimum content target:** 3 sets × 15 questions = 45 questions. Ideal: 3 × 20 = 60.

---

### B.2 — Create `src/data/bangunan-sets.js`

Same schema as sipil-sets.js. See `docs/seeds/bangunan-sets-seed.js` for starter content.

```js
export const BANGUNAN_SETS = [
  {
    id: 'bangunan-01',
    title: '型枠・コンクリート工事',
    subtitle: 'Bekisting & Beton',
    emoji: '🏗️',
    questions: [
      {
        q: 'コンクリートのスランプ試験で測るものは？',
        opts: ['軟らかさ（流動性）', '強度', '温度', '色'],
        opts_id: [
          'Kelunakan (flowability)',
          'Kekuatan',
          'Suhu',
          'Warna'
        ],
        ans: 0,
        exp: 'Slump test mengukur konsistensi/flowability beton segar, bukan kekuatan. Kekuatan diukur setelah curing. Di lapangan atasan akan bilang: スランプ値を確認してください。',
        cat: 'jenis_kerja',
        desc: 'Uji slump beton. Sebagai pekerja SSW bangunan: kamu akan lihat mandor cek ini setiap mixer truck datang — nilai slump yang salah = beton ditolak.'
      },
      // ... minimum 15 questions per set
    ]
  },
];
```

---

### B.3 — Register data in barrel export

**File:** `src/data/index.js`

Add:
```js
export { SIPIL_SETS } from './sipil-sets.js';
export { BANGUNAN_SETS } from './bangunan-sets.js';
```

---

### B.4 — Rewrite SipilMode.jsx

Replace the entire stub with a functional quiz mode using QuizShell:

```jsx
// src/modes/SipilMode.jsx — 土木 quiz mode
import { useState, useMemo } from 'react';
import { SIPIL_SETS } from '../data/sipil-sets.js';
import { get, set as storageSet } from '../storage/engine.js';
import QuizShell from '../components/QuizShell.jsx';
import S from './modes.module.css';
import { T } from '../styles/theme.js';

function normalizeQuestions(set) {
  return set.questions.map((q, i) => ({
    question: q.q,
    questionSub: q.opts_id ? undefined : undefined,
    options: q.opts.map((opt, j) => ({
      text: opt,
      sub: q.opts_id?.[j],
      correct: j === q.ans,
    })),
    correctIdx: q.ans,
    explanation: q.exp,
    hint: q.hint,
  }));
}

export default function SipilMode({ onExit }) {
  const [selectedSet, setSelectedSet] = useState(null);
  const scores = get('progress')?.sipilScores ?? {};

  const handleFinish = ({ correct, total }) => {
    storageSet('progress', (p) => ({
      ...p,
      sipilScores: {
        ...p.sipilScores,
        [selectedSet.id]: { correct, total, date: new Date().toISOString() },
      },
    }));
  };

  if (selectedSet) {
    const questions = normalizeQuestions(selectedSet);
    return (
      <QuizShell
        questions={questions}
        onExit={() => setSelectedSet(null)}
        onFinish={handleFinish}
        title={`Sipil — ${selectedSet.title}`}
        accentColor={T.amber}
        showHint
      />
    );
  }

  return (
    <div className={S.page}>
      <button className={S.btnBack} onClick={onExit}>← Kembali</button>
      <h2 className={S.pageTitle}>⛏️ Sipil · 土木</h2>
      <p className={S.pageSub}>Soal SSW Konstruksi jalur 土木</p>

      <div className={S.list}>
        {SIPIL_SETS.map((set) => {
          const score = scores[set.id];
          return (
            <button
              key={set.id}
              className={S.listItem}
              onClick={() => setSelectedSet(set)}
            >
              <span style={{ fontSize: 24 }}>{set.emoji}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{set.title}</div>
                <div style={{ fontSize: 11, color: T.textDim }}>{set.subtitle} · {set.questions.length} soal</div>
                {score && (
                  <div style={{ fontSize: 10, color: T.textMuted, marginTop: 2 }}>
                    Terakhir: {score.correct}/{score.total} ({Math.round(score.correct/score.total*100)}%)
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

---

### B.5 — Rewrite BangunanMode.jsx

Identical structure to SipilMode but using `BANGUNAN_SETS` and `bangunanScores`. Change accent color, emoji, title.

---

### B.6 — Update MODE_META

**File:** `src/router/modes.js`

```js
// Update:
sipil:    { icon: '⛏️', label: 'Sipil · 土木',    desc: `${SIPIL_SETS.length} set soal sipil` },
bangunan: { icon: '🏗️', label: 'Bangunan · 建築', desc: `${BANGUNAN_SETS.length} set soal bangunan` },
```

(Import `SIPIL_SETS` and `BANGUNAN_SETS` at top to get dynamic counts, or hardcode.)

---

### B.TESTS — Phase B Test Summary

| Test File | Tests | Description |
|-----------|-------|-------------|
| `sipil-data.test.js` | 8 | Schema validation: all questions have q/opts/ans/exp/cat, ans in range, unique IDs |
| `bangunan-data.test.js` | 8 | Same as above |
| `sipil-mode.test.jsx` | 5 | Renders set list, opens quiz, saves score |
| `bangunan-mode.test.jsx` | 4 | Renders set list, opens quiz |
| **Total new** | **~25** | |

### B.DONE — Phase B Completion Checklist

```
□ sipil-sets.js created with ≥45 questions (3+ sets)
□ bangunan-sets.js created with ≥45 questions (3+ sets)
□ SipilMode is a functional quiz (not a stub)
□ BangunanMode is a functional quiz (not a stub)
□ Scores persist to sipilScores/bangunanScores
□ All questions pass LSP filter (Appendix)
□ MODE_META updated (no more "Segera hadir")
□ npm test — all pass
□ npm run build — clean
□ Commit: feat(phaseB): sipil & bangunan content + quiz modes
```

---

## Phase C — Daily Mission + Session Analytics

> **Goal:** Add a daily study recommendation engine and session-level analytics tracking.
> **Estimated scope:** 2 new files, 5 modified files, ~28 new tests
> **Commit prefix:** `feat(phaseC):`
> **Depends on:** Phase A (storage v3 with sessions, dailyMission, studyAnchor)

### C.PRE — Pre-flight Checklist

```
□ Phase A and B committed and passing
□ storage/schema.js has sessions, dailyMission, studyAnchor
```

---

### C.1 — Daily Mission Engine

**Create:** `src/utils/daily-mission.js`

```js
// Daily Mission — recommends one study activity per day.
// Grounded in: Fogg (2009) Behavior Model, Clear (2018) Habit Loop,
// Nation (2007) Four Strands balance.

import { get, set as storageSet } from '../storage/engine.js';
import { getDueCardIds } from '../srs/fsrs-scheduler.js';

const MISSION_TYPES = [
  { mode: 'ulasan',  label: 'Ulasan SRS',       icon: '🔁', priority: 5, strand: 'fluency'   },
  { mode: 'kartu',   label: 'Pelajari Kartu',    icon: '🃏', priority: 3, strand: 'input'     },
  { mode: 'kuis',    label: 'Kuis 10 Soal',      icon: '❓', priority: 3, strand: 'language'  },
  { mode: 'sprint',  label: 'Sprint 60 Detik',   icon: '⚡', priority: 2, strand: 'output'    },
  { mode: 'jac',     label: 'Latihan JAC',       icon: '📋', priority: 2, strand: 'language'  },
  { mode: 'fokus',   label: 'Fokus Kelemahan',   icon: '🎯', priority: 4, strand: 'language'  },
];

export function generateDailyMission() {
  const today = new Date().toISOString().slice(0, 10);
  const progress = get('progress');
  const existing = progress.dailyMission;

  // Already generated today? Return existing
  if (existing?.date === today) return existing;

  // Priority logic:
  // 1. If SRS cards due → ulasan (highest priority)
  // 2. If many wrong answers recently → fokus
  // 3. Rotate through strands to maintain Four Strands balance
  const dueCount = getDueCardIds().length;
  const sessions = progress.sessions ?? [];
  const recentSessions = sessions.filter(s =>
    new Date(s.date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  );

  // Count strand usage in last 7 days
  const strandCounts = { input: 0, output: 0, fluency: 0, language: 0 };
  recentSessions.forEach(s => {
    const mt = MISSION_TYPES.find(m => m.mode === s.mode);
    if (mt) strandCounts[mt.strand]++;
  });

  let selectedMode;

  if (dueCount > 0) {
    selectedMode = 'ulasan';
  } else {
    // Find underrepresented strand
    const minStrand = Object.entries(strandCounts)
      .sort((a, b) => a[1] - b[1])[0][0];

    const candidates = MISSION_TYPES.filter(m => m.strand === minStrand);
    selectedMode = candidates[Math.floor(Math.random() * candidates.length)]?.mode || 'kartu';
  }

  const mission = {
    date: today,
    mode: selectedMode,
    label: MISSION_TYPES.find(m => m.mode === selectedMode)?.label || 'Belajar',
    icon: MISSION_TYPES.find(m => m.mode === selectedMode)?.icon || '📖',
    completedAt: null,
  };

  storageSet('progress', (p) => ({ ...p, dailyMission: mission }));
  return mission;
}

export function completeMission() {
  storageSet('progress', (p) => ({
    ...p,
    dailyMission: p.dailyMission
      ? { ...p.dailyMission, completedAt: Date.now() }
      : null,
  }));
}

export function getMission() {
  return get('progress')?.dailyMission ?? null;
}
```

---

### C.2 — Daily Mission UI in Dashboard

**File:** `src/components/Dashboard.jsx`

Add a mission card above the QuickStart CTA:

```jsx
// Import:
import { generateDailyMission, completeMission, getMission } from '../utils/daily-mission.js';

// Inside component, before return:
const mission = useMemo(() => generateDailyMission(), []);
const missionDone = mission?.completedAt &&
  new Date(mission.completedAt).toDateString() === new Date().toDateString();

// In JSX, before quickStart card:
{mission && !missionDone && (
  <button
    className={s.missionCard}
    onClick={() => onNavigate(mission.mode)}
    aria-label={`Misi hari ini: ${mission.label}`}
  >
    <span style={{ fontSize: 28 }}>{mission.icon}</span>
    <div>
      <div style={{ fontSize: 13, fontWeight: 700 }}>Misi Hari Ini</div>
      <div style={{ fontSize: 11, color: T.textDim }}>{mission.label}</div>
    </div>
    <span style={{ fontSize: 11, fontWeight: 700, color: T.accent }}>Mulai →</span>
  </button>
)}

{missionDone && (
  <div className={s.missionDone}>
    <span>✅</span>
    <span style={{ fontSize: 13, fontWeight: 700 }}>Misi Selesai!</span>
    <span style={{ fontSize: 11, color: T.textDim }}>Kembali besok 🌙</span>
  </div>
)}
```

Add corresponding CSS classes to `Dashboard.module.css`.

---

### C.3 — Mission Complete Overlay

**Evidence:** Clear (2018) — habit loop reward must be immediate and emotionally salient.

When a quiz/mode session finishes AND the mission mode matches, call `completeMission()` and show a brief overlay:

**File:** `src/components/MissionCompleteOverlay.jsx` (NEW)

```jsx
import { useEffect, useState } from 'react';

export default function MissionCompleteOverlay() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 1500);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.5)',
      animation: 'fadeOut 1.5s ease forwards',
    }}>
      <div style={{ textAlign: 'center', color: '#fff' }}>
        <div style={{ fontSize: 64 }}>🎉</div>
        <div style={{ fontSize: 24, fontWeight: 800, marginTop: 8 }}>Misi Selesai!</div>
      </div>
    </div>
  );
}
```

---

### C.4 — Session Tracking

Record session summaries to `progress.sessions` (capped at 90 entries):

**File:** `src/contexts/ProgressContext.jsx` — Add `recordSession`:

```js
const recordSession = useCallback(({ mode, correct, total, durationMs }) => {
  setProg((prev) => {
    const sessions = [...(prev.sessions ?? []), {
      mode,
      correct,
      total,
      durationMs,
      date: new Date().toISOString(),
    }].slice(-90); // keep last 90

    return { ...prev, sessions };
  });
}, [setProg]);
```

Expose `recordSession` from context. Call it from QuizShell's `onFinish`, from FlashcardMode on exit, etc.

---

### C.5 — StatsMode Enhancement

Add to StatsMode: sessions-per-week chart, strand balance visualization, daily count trend.

```jsx
// In StatsMode.jsx — add a "Riwayat Belajar" section:
const sessions = get('progress')?.sessions ?? [];
const last7 = sessions.filter(s => new Date(s.date) > new Date(Date.now() - 7*86400000));
const byDay = {};
last7.forEach(s => {
  const d = s.date.slice(0,10);
  byDay[d] = (byDay[d] || 0) + 1;
});
```

---

### C.6 — Habit Anchor Setting (C-12 from v5)

**File:** `src/components/SayaTab.jsx`

Add a "Waktu Belajar" picker:
```jsx
<div className={s.settingRow}>
  <div className={s.settingLabel}>Waktu Belajar</div>
  <select
    value={prefs.studyAnchor ?? ''}
    onChange={(e) => setPref('studyAnchor', e.target.value || null)}
    className={s.settingSelect}
  >
    <option value="">Tidak diatur</option>
    <option value="morning">Pagi sebelum kerja</option>
    <option value="lunch">Istirahat siang</option>
    <option value="evening">Malam setelah makan</option>
  </select>
</div>
```

Dashboard shows contextual greeting based on anchor:
```js
const anchorTexts = {
  morning: 'Selamat pagi! Ada 5 menit untuk belajar? ☀️',
  lunch: 'Istirahat siang — sempat latihan? 🍱',
  evening: 'Sudah makan malam? Waktunya belajar 🌙',
};
const anchorText = prefs.studyAnchor ? anchorTexts[prefs.studyAnchor] : null;
```

---

### C.TESTS — Phase C Test Summary

| Test File | Tests | Description |
|-----------|-------|-------------|
| `daily-mission.test.js` | 10 | Generate, deduplicate by date, priority branches, strand balance |
| `session-tracking.test.js` | 5 | Record, cap at 90, correct schema |
| `mission-overlay.test.jsx` | 3 | Renders, fades after 1.5s |
| `stats-sessions.test.jsx` | 5 | Weekly chart data, strand counts |
| `habit-anchor.test.jsx` | 5 | Prefs saved, Dashboard text changes |
| **Total new** | **~28** | |

### C.DONE — Phase C Completion Checklist

```
□ daily-mission.js created and tested
□ Dashboard shows mission card
□ MissionCompleteOverlay fires on mission completion
□ Sessions recorded on quiz/mode finish (capped at 90)
□ StatsMode shows session history
□ Habit anchor picker in SayaTab
□ Dashboard greeting reflects studyAnchor
□ npm test + build + lint clean
□ Commit: feat(phaseC): daily mission, session analytics, habit anchor
```

---

## Phase D — Export/Import Hardening

> **Goal:** Reliable, validated export/import with rollback. User is sole owner of their data.
> **Commit prefix:** `feat(phaseD):`

### D.1 — Snapshot Validation

**File:** `src/storage/engine.js` — Add:

```js
export function validateSnapshot(snapshot) {
  if (!snapshot || typeof snapshot !== 'object') return { ok: false, reason: 'not_object' };
  if (!snapshot.progress || !snapshot.srs || !snapshot.prefs) return { ok: false, reason: 'missing_docs' };
  if (!Array.isArray(snapshot.progress.known)) return { ok: false, reason: 'invalid_known' };
  if (typeof snapshot.srs.cards !== 'object') return { ok: false, reason: 'invalid_srs' };

  return {
    ok: true,
    summary: {
      known: snapshot.progress.known.length,
      srsCards: Object.keys(snapshot.srs.cards).length,
      sessions: (snapshot.progress.sessions ?? []).length,
      version: snapshot._storage_version ?? snapshot.progress._v ?? 'unknown',
    },
  };
}
```

### D.2 — Import with rollback

```js
export function importAllSafe(snapshot) {
  const validation = validateSnapshot(snapshot);
  if (!validation.ok) throw new Error(`Invalid snapshot: ${validation.reason}`);

  // Snapshot current state for rollback
  const backup = exportAll();

  try {
    importAll(snapshot);
  } catch (err) {
    // Rollback
    importAll(backup);
    throw err;
  }

  return validation.summary;
}
```

### D.3 — SayaTab Export/Import UI improvements

Show data summary before export, show diff before import, use ConfirmDialog for import.

### D.TESTS

| Test | Description |
|------|-------------|
| Valid snapshot passes validation | |
| Missing docs fails validation | |
| Invalid types fail validation | |
| Import rollback restores state on error | |
| Exported file imports cleanly | |

---

## Phase E — FlashcardMode Decomposition

> **Goal:** Split 447-line FlashcardMode into sub-components. Move FLIP_STYLE to CSS.
> **Commit prefix:** `refactor(phaseE):`
> **Constraint:** ZERO behavioral change. All existing functionality works identically.

### E.1 — Component Split

```
src/modes/FlashcardMode/
  index.jsx           (~80 lines — orchestrator)
  FlipCard.jsx        (~100 lines — 3D card, front + back faces)
  RatingRow.jsx       (~50 lines — FSRS 4-button row)
  ToolStrip.jsx       (~60 lines — sort/filter/reset/star)
  FilterBar.jsx       (~40 lines — search + star filter)
  flashcard.module.css
```

### E.2 — FLIP_STYLE → CSS (TD-05)

Move `FLIP_STYLE` to `src/styles/global.css`:

```css
/* Flashcard 3D flip */
.fc-scene { perspective: 1200px; }
.fc-card {
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.4s cubic-bezier(0.4,0,0.2,1);
  will-change: transform;
}
.fc-card.is-flipped { transform: rotateY(180deg); }
.fc-face {
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
}
.fc-face--back { transform: rotateY(180deg); }
@keyframes fcHintFade {
  0%, 70% { opacity: 1; }
  100% { opacity: 0; pointer-events: none; }
}
```

Delete `FLIP_STYLE` constant and `ensureStyle()` from FlashcardMode.

### E.3 — Furigana Policy Prep (TD-10)

Add `furiganaPolicy` prop to `JpDisplay.jsx`:

```jsx
export function JpFront({ text, furi, romaji, furiganaPolicy = 'always', ...props }) {
  const showFuri = furiganaPolicy === 'always' ||
    (furiganaPolicy === 'tap' && tapped);

  // ...existing render, but conditionally hide furigana
}
```

Wire it to `prefs.furiganaPolicy` from storage. Default is `'always'` — correct for current N5-N4 users.

### E.TESTS

- FlipCard renders front/back, flips on tap
- RatingRow shows 4 FSRS buttons
- Filter bar filters by text and star
- FLIP_STYLE no longer injected to `<head>` (check `document.head.querySelectorAll('style')`)

---

## Phase F — Exam Countdown + Audio

> **Goal:** Exam date countdown + Web Speech API audio for Japanese terms.
> **Commit prefix:** `feat(phaseF):`

### F.1 — Exam Countdown

**SayaTab:** Date picker with `<input type="date">`:
```jsx
<input
  type="date"
  value={prefs.examDate ?? ''}
  onChange={(e) => setPref('examDate', e.target.value || null)}
/>
```

**Dashboard:** If examDate set and < 30 days away, show countdown:
```jsx
const daysLeft = prefs.examDate
  ? Math.ceil((new Date(prefs.examDate) - new Date()) / 86400000)
  : null;

{daysLeft !== null && daysLeft <= 30 && daysLeft > 0 && (
  <div className={s.countdown}>
    🎯 {daysLeft} hari lagi
    {daysLeft <= 14 && ' — masa kritis ulasan!'}
  </div>
)}
```

**Daily Mission urgency:** If daysLeft < 14, bias mission toward `ulasan` and `fokus`.

### F.2 — Audio: Web Speech API

**Create:** `src/utils/speak.js`

```js
let _playCount = 0;

// HVPT-inspired variation (Logan et al. 1991)
const HVPT_PARAMS = [
  { rate: 0.70, pitch: 0.85 },  // slow, lower
  { rate: 0.80, pitch: 1.0  },  // standard
  { rate: 0.90, pitch: 1.15 },  // natural pace, higher
];

export function speakJP(text, { rate, pitch } = {}) {
  if (!canSpeak()) return;
  window.speechSynthesis.cancel();
  const params = (rate !== undefined)
    ? { rate, pitch: pitch ?? 1.0 }
    : HVPT_PARAMS[_playCount++ % 3];

  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = 'ja-JP';
  utt.rate = params.rate;
  utt.pitch = params.pitch;
  window.speechSynthesis.speak(utt);
}

export function canSpeak() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}
```

**Integration:**
- `JpDisplay.jsx`: Add 🔊 button if `canSpeak()` returns true
- `FlashcardMode`: Card front shows 🔊 next to JP term
- `ReviewMode`: Same
- Prefs toggle: `prefs.audioEnabled` in SayaTab

### F.TESTS

- `daysLeft` calculates correctly
- Countdown shows only when < 30 days
- `speakJP` no-ops in jsdom (canSpeak returns false)
- HVPT cycles through 3 param sets

---

## Phase G — QA + Polish + Release v4.0

> **Goal:** Final polish, coverage thresholds, flow tests, release.
> **Commit prefix:** `chore(phaseG):` or `test(phaseG):`

### G.1 — Coverage Thresholds

**File:** `vitest.config.js`

```js
export default defineConfig({
  test: {
    // ...existing config
    coverage: {
      provider: 'v8',
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 60,
      },
    },
  },
});
```

### G.2 — Flow Tests (Integration)

```
tests/
  flow.onboarding.test.jsx     — 4-step onboarding → completeOnboarding
  flow.quiz-srs.test.jsx       — quiz answer → SRS card written → score saved
  flow.flashcard-star.test.jsx  — star card → re-enter → still starred
  flow.export-import.test.jsx   — exportAll → importAll → all 3 docs match
  flow.daily-mission.test.jsx   — generate → complete → overlay shown
```

### G.3 — Update _MAP.md

Fix stale references:
- Change blueprint reference from v3 to v6
- Update test count
- Update metrics table
- Add Phase A–G to version history

### G.4 — TD-07: Clean data/index.js barrel

Either keep it (low impact) or remove it and update all imports to use direct paths. Decision: keep — the indirection cost is negligible and it simplifies imports.

### G.5 — Release Checklist

```
□ All Phase A–F tests passing
□ Total tests ≥ 350
□ npm run lint — 0 errors, 0 warnings
□ npm run build — clean, no chunk > 200KB gzip
□ Manual smoke test:
  □ Onboarding flow → track selection → goal setting
  □ Flashcard flip → known/unknown → SRS rating
  □ Quiz → wrong answers → anxiety toast (if 5+ wrong)
  □ Sprint mode → 60 second timer
  □ Sipil mode → quiz → score saved
  □ Bangunan mode → quiz → score saved
  □ Daily Mission → complete → overlay
  □ Export → download JSON
  □ Import → restore progress
  □ Exam countdown → set date → see countdown
  □ Audio 🔊 → plays JP audio (on device with speech synthesis)
  □ Dark mode toggle
  □ PWA install prompt
  □ Offline mode works
□ package.json version → 4.0.0
□ CHANGELOG.md entry [4.0.0]
□ _MAP.md updated (blueprint v6, metrics, phase list)
□ SW CACHE_VERSION will auto-bump on deploy (already in CI)
□ Final commit: chore: release v4.0.0
□ Push to main → CI auto-deploys
```

---

## Appendix: Research Foundation Summary

> All research from v5 §0.1–§0.12 is valid and carried forward. This is the condensed design-obligation version.

| Research Area | Key Finding | Design Obligation | Phase |
|---------------|-------------|-------------------|-------|
| FSRS (§0.1) | Spaced repetition g=0.72 | ts-fsrs stays, review queue central | All |
| PWA (§0.2) | 88.7% Indonesian Android, variable connectivity | Offline-first, SW auto-bump | All |
| No Dark Patterns (§0.3) | Leaderboards harm; need-supporting only | No social comparison, no punishment | All |
| Malu/FLCA (§0.4, §0.9) | r=−.33 anxiety–performance; face concern | Private progress, anxiety-reduction toasts | A |
| SSW Content (§0.5) | Sipil/Bangunan is highest-impact gap | Phase B is high priority | B |
| Four Strands (§0.6) | Input/output/fluency/language-focused | Daily Mission rotates strands | C |
| LSP Framework (§0.7) | Every question → TSA traceable | LSP filter on Phase B content | B |
| Andragogy (§0.8) | "Why does this matter NOW?" on every card | desc field = workplace context | B |
| Output Hypothesis (§0.10) | Production practice is distinct mechanism | SprintMode preserved; future ProduksiMode | — |
| Gamification/Habit (§0.11) | Novelty decays; habit loop is long-term | Mission complete overlay; study anchor | C |
| Furigana Policy (§0.12) | Expertise reversal effect | Level-differentiated furigana (default: always) | E |

---

## Appendix: Content Authoring Standard

> Run this checklist on EVERY question before committing to `sipil-sets.js` or `bangunan-sets.js`.

### Per-Question Checklist

```
□ F1 — TSA JUSTIFICATION
   "In what on-site scenario would a supervisor use/expect this term?"
   If answer = "only in a textbook" → REJECT or move to general vocab.

□ F2 — OBJECTIVE NEEDS CHECK
   Is this term required for: (a) safety, (b) task communication, (c) compliance?
   If none → REJECT.

□ F3 — METALINGUISTIC exp FIELD
   Does `exp` contain:
   □ Why the correct answer is correct
   □ The most probable wrong answer for an Indonesian speaker and why
   If not → ADD.

□ F4 — ANDRAGOGICAL desc FIELD
   Does `desc` contain:
   □ What it is (1 sentence)
   □ What you do with it on site / consequence of getting it wrong (1 sentence)
   □ Authentic supervisor dialogue fragment (1 sentence)
   If any missing → ADD.

□ F5 — SEMANTIC INTERLEAVE
   Are there 3+ consecutive questions from the same semantic domain?
   If yes → REORDER to break the cluster.

□ F6 — ANSWER INDEX CHECK
   Is `ans` 0-based and pointing to the correct option in `opts[]`?
   □ Verified

□ F7 — CONSTRUCTION-WORKER REGISTER
   Are `opts_id[]` translations using worker register (not textbook)?
   "dikaitkan di titik jangkar" ✅ not "dihubungkan pada lokasi tambatan" ❌
```

---

## Appendix: Agent Trail

### Session: 2026-05-01 — Agent Opus 4.6 (Crunchy)

**Session type:** Blueprint v6 — full audit + rewrite for agent executability

**What I audited:**
- Read `docs/MASTER-BLUEPRINT-v5.md` (718 lines) — full
- Read `docs/archive/MASTER-BLUEPRINT-v4-POLISHED.md` — Phase specs
- Read all source files: `App.jsx`, `QuizShell.jsx`, `ResultScreen.jsx`, `Dashboard.jsx`, `ProgressContext.jsx`, `AppContext.jsx`, `SayaTab.jsx`, `QuizMode.jsx`, `FlashcardMode.jsx`, `SprintMode.jsx`, `SipilMode.jsx`, `BangunanMode.jsx`, `JpDisplay.jsx`, storage layer, hooks, utils, router, data files
- Ran `npm test` — 223 tests pass
- Verified all bug and debt items against actual code

**Stale items corrected:**
1. TD-06 (SW auto-bump) — already in deploy.yml. Removed from scope.
2. CI/CD — already exists. Removed from scope.
3. Test count — 223 (v5 said 111 in _MAP.md metrics). Corrected.
4. _MAP.md blueprint reference — still says v3 in some places. Phase G corrects.
5. v5 "Phase 11–17 unchanged from v4-POLISHED" — inlined everything for self-containment.

**Structural changes from v5:**
1. Phase renaming: 11→A, 12→B, 13→C, 14→D, 15→E, 16→F, 17→G
2. All code specs inline — no cross-references
3. Pre-flight + done checklists per phase
4. Seed data schemas for sipil/bangunan
5. Research condensed to obligation table (full text in v5 §0)

**What is intentionally NOT in v6:**
- C-10 (Type-answer production mode) — remains Phase 18 / v5+
- C-14 (Signaling for sentence questions) — low priority, can be done opportunistically
- D-04 (Full HVPT) — partial implementation via speak.js rate/pitch cycling
- D-05 (WM-aware difficulty scaling) — v5+
- ConfusionMode — content bottleneck, deferred
- Full VLT placement — deferred
- Production mode (ID→JP) — documented as future Phase 18

---

*Blueprint v6 (agent-executable) — Agent Opus 4.6 (Crunchy) · 2026-05-01*
*Audit basis: live codebase at commit HEAD, 223 tests passing, all source files read*
*Supersedes: v5, v4-POLISHED, v4, v3*
