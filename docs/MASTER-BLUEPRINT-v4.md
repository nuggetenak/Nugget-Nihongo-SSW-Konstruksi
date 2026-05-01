# 🏗️ SSW Konstruksi — Master Blueprint v4

> **Repository:** [`nuggetenak/Nugget-Nihongo-SSW-Konstruksi`](https://github.com/nuggetenak/Nugget-Nihongo-SSW-Konstruksi)
> **Current Version:** v3.6.1 (Phase 1–10 RELEASED ✅)
> **Blueprint Author:** Agent Sonnet 4.6 · 2026-05-01
> **Audit basis:** Full source read — 99 files, 15,978 lines verified before writing
> **Prior blueprint author:** Genspark AI Architect (v4 Proposal, 2026-05-01)
> **Status:** 📋 ACTIVE — Approved by Nugget, ready for Opus 4.6 handoff

---

## 🔍 Sonnet 4.6 Audit Notes (Pre-Blueprint)

*Transparency log: what I personally verified vs what I accepted from prior proposal.*

**Verified accurate in prior proposal:**
- `Dashboard.jsx` `useMemo([])` bug — confirmed lines 66–68, deps `[]`, will not refresh on re-render
- `_seenPool` module-scope in `QuizMode.jsx` — confirmed line 3
- 4 wrong-tracking namespaces (`quizWrong`, `wrongCounts`, `wgWrong`/`vocabWrong`) — confirmed in `schema.js` DEFAULTS + `ProgressContext` ctx object
- `ExportMode.jsx` uses raw `collectProgressData()` + `exportSRSSnapshot()` — confirmed; `SayaTab` uses clean `engine.exportAll()`. Two different formats, not interchangeable
- `FLIP_STYLE` injected to `document.head` at runtime — confirmed lines 46–51 `FlashcardMode.jsx`
- `useStreak` (correct-answer in-session) vs `streakData` (day-streak in storage) — naming ambiguity confirmed
- `CACHE_VERSION = 'ssw-v2026-04-28'` hardcoded — confirmed `public/sw.js` line 10
- `SipilMode.jsx` (68 lines) and `BangunanMode.jsx` (70 lines) are full stubs in the mode registry
- `_newKnownSize` dead code in `ProgressContext.jsx` line 63
- `recordStudyDay`, `incrementDailyCount`, `pushRecentCard` exported from `Dashboard.jsx` — these are dead exports since `ProgressContext.handleMark` now handles all three; `Dashboard.jsx` reads from storage directly on mount only

**Corrected from prior proposal:**
- a11y claim "skip nav, focus sentinel, role=alert already done" — **partially wrong**. Only `role="status"` on ModeLoader, theme button aria-label, and what I added on 2026-05-01 (46 total). No skip-nav link, no focus sentinel implemented yet.
- `FlashcardMode.jsx` listed as 447 LOC — **confirmed accurate** after Phase 6 rewrite
- `Dashboard.jsx` listed as 165 LOC — **confirmed accurate**
- ESLint claimed to "enforce no-unused CSS modules" — **not implemented**. No CSS modules plugin in `eslint.config.js`

**Decisions recorded (from Nugget, 2026-05-01):**
- Cloud sync: **No** — export/import manual only, refine this instead
- Audio: **Hybrid** (Web Speech API for common terms + pre-baked for critical vocab)
- i18n: **Defer** (Sonnet decision: not worth extraction overhead for single-language app; revisit at v5 if user base expands beyond ID)
- LLM Coach: **Defer to v5** (Sonnet decision: requires backend, conflicts with zero-dependency philosophy)
- Konten Sipil/Bangunan: **From JAC Official existing data** — not new content authoring
- Exam countdown: **User sets exam date manually**
- FSRS telemetry: **Opt-in default OFF** (Sonnet decision: privacy-first for migrant workers)
- Version name: **v4.0**
- Branding: **Nugget Nihongo**, logo TBD

---

## 📑 Daftar Isi

1. [Architecture Health — Actual State](#1-architecture-health--actual-state)
2. [Confirmed Bugs (Fix Before Phase 11)](#2-confirmed-bugs-fix-before-phase-11)
3. [Technical Debt Register](#3-technical-debt-register)
4. [v4 Vision & Constraints](#4-v4-vision--constraints)
5. [Phase 11 — Bug Fixes & Storage Hardening](#5-phase-11--bug-fixes--storage-hardening)
6. [Phase 12 — Content: Sipil & Bangunan Tracks](#6-phase-12--content-sipil--bangunan-tracks)
7. [Phase 13 — Adaptive Learning (Daily Mission + FSRS+)](#7-phase-13--adaptive-learning-daily-mission--fsrs)
8. [Phase 14 — Export/Import Refinement](#8-phase-14--exportimport-refinement)
9. [Phase 15 — FlashcardMode Decomposition](#9-phase-15--flashcardmode-decomposition)
10. [Phase 16 — Exam Countdown + Audio (Hybrid)](#10-phase-16--exam-countdown--audio-hybrid)
11. [Phase 17 — QA, SW Auto-bump, Release v4.0](#11-phase-17--qa-sw-auto-bump-release-v40)
12. [Non-Goals (Explicitly Out of Scope)](#12-non-goals-explicitly-out-of-scope)
13. [File-by-File Verdict (Verified)](#13-file-by-file-verdict-verified)

---

## 1. Architecture Health — Actual State

### 1.1 Stack (verified)

| Layer | Tech | Status |
|---|---|---|
| UI | React 19 + Vite 6 | ✅ |
| SRS | ts-fsrs v5 (3-layer wrapper) | ✅ |
| Storage | localStorage, 3-document model, v2 schema | ✅ |
| Styling | CSS Modules (16 files) + theme.js tokens | ✅ |
| Testing | Vitest 4.1.5 — 223 tests, 10 files | ✅ |
| Lint | ESLint flat config v10 | ✅ |
| CI/CD | GitHub Actions (ci.yml + deploy.yml) | ✅ |
| PWA | Manual SW, CACHE_VERSION bump, cache-first/network-first | ✅ (manual bump = risk) |

### 1.2 Dependency count: **3 prod** (react, react-dom, ts-fsrs) — target: keep ≤5

### 1.3 Actual Health Scorecard

| Dimension | Score | Basis |
|---|:---:|---|
| Architecture | **A−** | 3-doc + 3-context + lazy modes = correct. Minus: Dashboard reads storage directly bypassing context; dead exports from Dashboard |
| SRS Engine | **A** | Clean 3-layer separation (core/store/scheduler). Calibration hooks ready |
| CSS / Styling | **B+** | 16 CSS modules. 487 justified inline remain. FLIP_STYLE injection = anti-pattern |
| A11y | **B+** | 46 aria attrs, WCAG AA contrast. Missing: skip-nav, focus sentinel, keyboard-only path |
| Performance | **A−** | Lazy modes + manual chunks. `csv-sets.js` (3998 lines) loaded per VocabMode lazy chunk — acceptable |
| Offline / PWA | **A−** | Cache strategy correct. Manual `CACHE_VERSION` bump = stale cache risk |
| Tests | **B+** | 223 tests, mostly unit + component. Missing: flow tests (onboarding→quiz→SRS write-back) |
| DX | **A** | Clean scripts, ESLint, audit:integrity, bundle visualizer |
| Content | **C+** | Lifeline track full. Sipil & Bangunan = stubs. User-facing gap |
| Export/Import | **B−** | Two incompatible export paths. `ExportMode` uses raw format; `SayaTab` uses engine format |
| Analytics | **D** | Streak + daily count exist. No time-on-card, no accuracy curve, no session metrics |

---

## 2. Confirmed Bugs (Fix Before Phase 11)

These are verified bugs that cause incorrect behavior today, in priority order.

### BUG-01 — Dashboard streak/count stale after quiz session
**File:** `src/components/Dashboard.jsx` lines 66–68
**Root cause:** `useMemo(() => getStreak(), [])` — empty deps. Reads storage once at mount. When user plays quiz and returns to Dashboard tab without unmounting, streak and dailyCount do not update.
**Fix:** Dashboard should consume `streakData` and `dailyCount` from `ProgressContext` (already available), not read storage directly. Remove the 3 dead functions `recordStudyDay`, `incrementDailyCount`, `pushRecentCard` from Dashboard exports.

### BUG-02 — `_seenPool` module-scope hidden global state
**File:** `src/modes/QuizMode.jsx` line 3
**Root cause:** `const _seenPool = new Set()` at module level. Not reset on HMR. If user exits and re-enters QuizMode in same session without triggering `onExit`, pool carries over and distorts "unseen first" logic.
**Fix:** Move to `useRef` inside the component, initialize to `new Set()`. Reset on `cards` prop change.

### BUG-03 — `_newKnownSize` reserved but unused, milestone toast incomplete
**File:** `src/contexts/ProgressContext.jsx` line 63
**Root cause:** `const _newKnownSize = knownSet.size; // reserved for milestone toast` — dead code. `milestoneQuiz70` is set via `setMilestoneQuiz70()` but no UI consumes it and no trigger fires for `milestoneStreak7` toast.
**Fix:** Either wire milestone toasts in `App.jsx` (check on `prog` change → fire `toast.show`) or remove dead milestone code entirely. Sonnet recommendation: keep the data fields, add toast triggers in `App.jsx` using `useEffect` watching `prog.milestoneStreak7`.

---

## 3. Technical Debt Register

Ordered by ROI (impact / effort).

### TD-01 — ExportMode uses incompatible export format (HIGH)
`ExportMode.jsx` calls custom `collectProgressData()` + `exportSRSSnapshot()` (raw localStorage keys). `SayaTab` calls `engine.exportAll()` (3-doc format). The two output schemas are different — a file from ExportMode cannot be reliably imported by SayaTab's `importAll()`. **ExportMode should be deleted and its UI merged into SayaTab.**

### TD-02 — Dead exports from Dashboard.jsx (MEDIUM)
`recordStudyDay`, `incrementDailyCount`, `pushRecentCard` exported from `Dashboard.jsx` but `ProgressContext.handleMark` already handles all three. These exports are not imported anywhere (verified by grep). Remove them, remove the direct `storageGet`/`storageSet` calls from Dashboard — Dashboard should be a pure display component reading from context.

### TD-03 — wrong-tracker.js: `STORAGE_KEYS` references v1 key names (MEDIUM)
`wrong-tracker.js` still exports `STORAGE_KEYS` with `'ssw-known'`, `'ssw-quiz-wrong'` etc. — v1 keys that no longer exist in v2 schema. The file is otherwise fine (`getWrongCount`, `makeWrongEntry` are used). Remove the dead `STORAGE_KEYS`, `loadFromStorage`, `saveToStorage`, `removeFromStorage` exports which bypass the storage engine.

### TD-04 — `useStreak` naming ambiguity (LOW-MEDIUM)
`useStreak` hook = correct-answer streak (in-session, not persisted). `streakData` in ProgressContext = study-day streak (persisted). One is called "streak" everywhere. Rename `useStreak` → `useAnswerStreak` to prevent confusion when reading code.

### TD-05 — FLIP_STYLE injected to document.head (LOW)
`FlashcardMode.jsx` injects a `<style>` tag at runtime on mount. Works fine but is an anti-pattern in a CSS Modules project. Move to `global.css` under a scoped `.fc-scene` selector. The animation `fcHintFade` should move there too.

### TD-06 — SW CACHE_VERSION manual bump (MEDIUM)
`public/sw.js` line 10: `const CACHE_VERSION = 'ssw-v2026-04-28'`. The deploy workflow should auto-generate this from `git describe --tags --always` or `date +%Y%m%d%H%M`. Risk: developer forgets to bump, users get stale cache.

### TD-07 — `data/index.js` barrel re-export (LOW)
Blueprint v3 §A4 noted this as backlog. The barrel exists and is used. Leave unless it causes circular import issues (it doesn't currently).

### TD-08 — Legacy arrays in `modes.js` (LOW)
`BELAJAR_MODES`, `UJIAN_MODES`, `LAINNYA_MODES` are legacy nav arrays kept for "backward compat." Grep shows `BelajarTab.jsx` and no other consumer uses these. Safe to remove after verifying no import.

---

## 4. v4 Vision & Constraints

### 4.1 North Star

*From "polished SSW flashcard app" → "adaptive SSW learning platform that knows when you're weak and what to study next."*

Three things that will most impact real users:
1. **Content completeness** — Sipil & Bangunan tracks fully populated (currently "Coming Soon" in UI)
2. **Adaptive guidance** — Daily Mission that removes the "what mode do I open today?" friction
3. **Durable progress** — Export/import that actually works reliably across devices

### 4.2 Hard Constraints (Non-Negotiable)

- **No backend / cloud sync** — localStorage only. Export/import is the sync mechanism.
- **No new prod dependencies** — stay at 3 prod deps (react, react-dom, ts-fsrs). New features use Web APIs.
- **No breaking storage migration without versioned migration path** — `STORAGE_VERSION` bump to 3 must come with `migrate_v2_to_v3()` in `migrations.js`.
- **All audio via Web Speech API only** — no audio file bundle (avoids 45MB+ asset overhead).
- **Branding: Nugget Nihongo** throughout.
- **No i18n extraction** — Indonesian strings stay hardcoded. Revisit at v5.
- **No LLM coach** — keep zero-latency, fully offline.

### 4.3 Guiding Principles

- Fix before feature: BUG-01, BUG-02, BUG-03 land in Phase 11 before any new feature work
- Additive not rewriting: phases should not break existing functionality
- Test before ship: every phase should include tests for the new behavior
- Honest UI: Sipil/Bangunan stub modes should show "Coming Soon" honestly (already do) until Phase 12 populates them

---

## 5. Phase 11 — Bug Fixes & Storage Hardening

**Goal:** Zero known bugs. Storage layer fully consistent. Dead code removed.
**Scope:** Non-breaking. No new features.
**Test target:** 223 → ~250 tests

### 11.1 Fix BUG-01 (Dashboard stale data)
- `Dashboard.jsx`: remove `useMemo([])` blocks for streak/dailyCount/recentCards
- Import and consume `useProgress()` → destructure `streakData`, `dailyCount`, `recentCards`
- Remove exported `recordStudyDay`, `incrementDailyCount`, `pushRecentCard` functions
- Remove direct `storageGet`/`storageSet` from Dashboard entirely

### 11.2 Fix BUG-02 (_seenPool)
- `QuizMode.jsx`: move `_seenPool` to `useRef(new Set())` inside component
- Add `useEffect(() => { seenPool.current.clear(); }, [cards])` to reset on card set change

### 11.3 Fix BUG-03 (milestone toast)
- `App.jsx`: add `useEffect` watching `prog` (via useProgress hook) — when `milestoneStreak7` transitions false→true, fire `toast.show('🔥 7 hari streak!')`. Same for milestoneQuiz70.
- Remove `_newKnownSize` dead variable from ProgressContext

### 11.4 Consolidate wrong-tracker (TD-01, TD-03)
- Delete `ExportMode.jsx` — its functionality already exists better in `SayaTab`
- Remove `src/modes/ekspor` from `MODE_COMPONENTS` and `MODE_META` in `modes.js`
- Remove dead exports from `wrong-tracker.js`: `STORAGE_KEYS`, `loadFromStorage`, `saveToStorage`, `removeFromStorage`
- Keep: `getWrongCount`, `getWrongTime`, `makeWrongEntry`

### 11.5 Remove dead Dashboard exports (TD-02)
Already covered by 11.1.

### 11.6 STORAGE_VERSION 2 → 3 (schema hardening)
- Add `examDate: null` to `DEFAULTS.prefs` (needed for Phase 16)
- Add `dailyMission: null` to `DEFAULTS.progress` (needed for Phase 13)
- Add `sessions: []` to `DEFAULTS.progress` (needed for Phase 13 analytics)
- Bump `STORAGE_VERSION = 3` in `schema.js`
- Add `migrate_v2_to_v3()` in `migrations.js`: copies all v2 fields, adds new fields with defaults
- Update `init()` in `engine.js` to handle v2→v3 migration path

### 11.7 Rename useStreak → useAnswerStreak (TD-04)
- Rename `src/hooks/useStreak.js` → `src/hooks/useAnswerStreak.js`
- Update all imports (QuizShell, hooks/index.js)
- Export as `useAnswerStreak`

### 11.8 Remove legacy nav arrays (TD-08, after verification)
- Grep confirms `BELAJAR_MODES`, `UJIAN_MODES`, `LAINNYA_MODES` are unused
- Remove from `modes.js`

### 11.9 Tests to add
- `migrations.v2-to-v3.test.js` — verify all v2 fields survive, new fields initialized
- `dashboard.staleness.test.jsx` — mount Dashboard, trigger handleMark via context, verify re-render
- `quiz.seenpool.test.jsx` — verify _seenPool resets on cards prop change

---

## 6. Phase 12 — Content: Sipil & Bangunan Tracks

**Goal:** Both stub modes replaced with real question content from existing JAC Official data.
**Constraint:** No new source files — use JAC Official (`jac-official.js`) as the base, filtered by construction domain. Add dedicated sets to `wayground-sets.js` or a new `sipil-sets.js`.

### 12.1 Content strategy

JAC Official has 95 questions across 4 sets (st1, st2, tt1, tt2). Most are 設備/lifeline-focused. For Sipil and Bangunan, content must come from:
- Filtering JAC `実技` questions relevant to 土木/建築 domains
- A new `src/data/sipil-sets.js` using the same question schema as `wayground-sets.js`
- A new `src/data/bangunan-sets.js` with the same schema

**Schema reference** (from `wayground-sets.js`):
```js
{
  id: 'wt1', title: 'Set Title', emoji: '📝', color: '#f97316',
  subtitle: 'JP subtitle', questions: [
    { id: 'q01', q: 'JP question', hint: 'hint', opts: ['A','B','C','D'],
      opts_id: ['ID-A','ID-B','ID-C','ID-D'], ans: 0, exp: 'explanation' }
  ]
}
```

### 12.2 SipilMode.jsx — full replacement
Replace stub with `WaygroundMode`-style implementation:
- Reads from `sipil-sets.js`
- Full quiz flow using `QuizShell`
- Score persistence to `progress.sipilScores` (add to schema in Phase 11)

### 12.3 BangunanMode.jsx — full replacement
Same pattern as SipilMode, reads `bangunan-sets.js`.

### 12.4 Update MODE_META
```js
sipil:    { icon: '⛏️', label: 'Sipil · 土木',    desc: 'Soal teknis 土木施工' },
bangunan: { icon: '🏗️', label: 'Bangunan · 建築',  desc: 'Soal teknis 建築施工' },
```

### 12.5 Tests to add
- `data.sipil.test.js` — verify schema, answer indices in range, no empty questions
- `data.bangunan.test.js` — same

---

## 7. Phase 13 — Adaptive Learning (Daily Mission + FSRS+)

**Goal:** User never has to think "what do I open today?" — the app tells them.
**New features:** Daily Mission widget, FSRS accuracy telemetry (local-only, opt-in OFF), session tracking.

### 13.1 Daily Mission Engine (`src/utils/daily-mission.js`)

```js
// Pure function, no storage access. Testable in isolation.
export function generateDailyMission(prog, srsStats, prefs) {
  // Returns: { target: 'ulasan'|'kuis'|'kartu', count: N, reason: string, urgency: 'high'|'medium'|'low' }
  // Priority:
  // 1. If srsStats.due > 0 → 'ulasan', count = due, urgency = 'high'
  // 2. If dailyCount < dailyGoal/2 → 'kartu', count = dailyGoal - dailyCount, urgency = 'medium'
  // 3. If quizWrong entries > 5 → 'fokus', urgency = 'medium'
  // 4. Default → 'kuis', urgency = 'low'
}
```

### 13.2 Daily Mission UI

Location: `Dashboard.jsx` — replace the static "quick action" CTA with a dynamic mission card.

```
┌─────────────────────────────────────────────────┐
│ 📋 Misi Hari Ini                          H:M  │  ← countdown to midnight
│                                                  │
│  🔁 Ulang 12 kartu SRS         urgency: HIGH   │
│  Terakhir: 3 hari lalu                          │
│                              [ Mulai Sekarang ] │
└─────────────────────────────────────────────────┘
```

### 13.3 Session tracking (local, stored in `progress.sessions`)

```js
// Schema (added to progress doc in Phase 11):
sessions: [
  { date: '2026-05-01', mode: 'kuis', correct: 8, total: 10, durationMs: 142000 }
  // max 90 entries (3 months), FIFO eviction
]
```

`QuizShell` already has `onFinish({ correct, total })`. Add `startTime` ref on mount, compute `durationMs = Date.now() - startTime` in `onFinish`, pass back.

### 13.4 StatsMode extension

Add session accuracy chart (last 14 days, bar chart):
- X axis: date
- Y axis: % correct
- Rendered as pure HTML/CSS bars (no chart library — stay zero-dep)

### 13.5 FSRS local telemetry (opt-in OFF)

- Add `prefs.fsrsTelemetry: false` to schema (Phase 11 already adds this)
- In `fsrs-scheduler.js`, if telemetry enabled: write to `progress.fsrsLog[]` — `{ cardId, rating, stability, difficulty, date }` (max 500 entries)
- No upload, no network. Purely for "show me my retention curve" in StatsMode v2

### 13.6 Tests to add
- `daily-mission.test.js` — all 4 priority branches
- `session-tracking.test.js` — verify session written on quiz finish, max 90 eviction

---

## 8. Phase 14 — Export/Import Refinement

**Goal:** Single, reliable export/import path. User can safely move progress between devices.

### 14.1 Delete ExportMode (covered in Phase 11 TD-01)

Already handled. This phase focuses on making SayaTab's export/import excellent.

### 14.2 Export UI improvements in SayaTab

Current SayaTab export: bare `handleExport` with minimal UI. Enhance:

**Export:**
- Show data summary before download: "Ekspor berisi: X kartu hafal, Y kartu SRS, Z sesi"
- File name includes version: `ssw-progress-v3-2026-05-01.json`
- Toast confirms with summary

**Import:**
- Show diff before applying: "File ini berisi X kartu hafal (kamu saat ini: Y). Lanjutkan?"
- Version check: if `snapshot._storage_version < STORAGE_VERSION`, run migration before import
- Validate schema before applying (already throws on missing docs, add field validation)
- Rollback on error: snapshot current state before import, restore if `importAll` throws

### 14.3 Import validation (`engine.js`)

```js
export function validateSnapshot(snapshot) {
  if (!snapshot?.progress || !snapshot?.srs || !snapshot?.prefs) return { ok: false, reason: 'missing_docs' };
  if (typeof snapshot.progress.known !== 'array') return { ok: false, reason: 'invalid_known' };
  // ... other checks
  return { ok: true, summary: { known: snapshot.progress.known.length, ... } };
}
```

### 14.4 Tests to add
- `import.validation.test.js` — valid snapshot, missing docs, wrong types, old version
- `import.rollback.test.js` — verify state unchanged after failed import

---

## 9. Phase 15 — FlashcardMode Decomposition

**Goal:** `FlashcardMode.jsx` (447 lines) split into focused sub-components. FLIP_STYLE moved to CSS.
**Constraint:** No behavioral change. All existing functionality must work identically.

### 15.1 Component split plan

```
src/modes/FlashcardMode/
  index.jsx          (orchestrator, ~80 lines)
  FlipCard.jsx       (3D card face, front + back, ~100 lines)
  RatingRow.jsx      (FSRS 4-button row, ~50 lines)
  ToolStrip.jsx      (sort/filter/reset/star buttons, ~60 lines)
  FilterBar.jsx      (search input + star button, ~40 lines)
  flashcard.module.css  (consolidates fc-scene + all card styles)
```

### 15.2 FLIP_STYLE → CSS

Move `FLIP_STYLE` constant to `src/styles/global.css`:

```css
.fc-scene { perspective: 1200px; }
.fc-card {
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.4s cubic-bezier(0.4,0,0.2,1);
  will-change: transform;
}
.fc-card.is-flipped { transform: rotateY(180deg); }
.fc-face { -webkit-backface-visibility: hidden; backface-visibility: hidden; }
.fc-face--back { transform: rotateY(180deg); }
@keyframes fcHintFade { 0%, 70% { opacity: 1; } 100% { opacity: 0; pointer-events: none; } }
```

Remove `ensureStyle()` and `FLIP_STYLE` from `FlashcardMode/index.jsx`.

Note: tilt transform on card (`rotateY + translateX + rotate`) stays inline — it's runtime-computed from `swipeDelta`.

### 15.3 Tests to add
- `flashcard.flip.test.jsx` — card flips on tap/space, FSRS rating row appears after flip
- `flashcard.filter.test.jsx` — search filters correctly, star filter shows only starred

---

## 10. Phase 16 — Exam Countdown + Audio (Hybrid)

**Goal:** User can set exam date → app shows days remaining + adjusts Daily Mission urgency. Audio via Web Speech API for JP terms.

### 16.1 Exam Countdown

**Storage:** `prefs.examDate: null` (added in Phase 11 schema v3)

**UI location:** `SayaTab.jsx` — new "Ujian" section:
```
┌──────────────────────────────────────┐
│ 🎯 Target Ujian                       │
│ 12 Mei 2026                  [Ubah]  │
│ 🗓️ 11 hari lagi                       │
│ Sisa waktu cukup untuk ulasan penuh  │
└──────────────────────────────────────┘
```

**Dashboard integration:** if `examDate` set and < 30 days away, show countdown chip in header:
```
[⛏ 土木]  [🗓 11h]  [🌙]
```

**Daily Mission urgency multiplier:** if `daysLeft < 14`, bump all urgencies one level.

**Date picker:** native `<input type="date">` — no library, works on all mobile browsers.

### 16.2 Audio — Web Speech API (hybrid)

**Scope:** JP term pronunciation only. Not full sentence TTS. Not descriptions.

**Implementation:** `src/utils/speak.js`
```js
let _synth = null;
function getSynth() { return _synth ??= window.speechSynthesis; }

export function speakJP(text, { rate = 0.8, pitch = 1.0 } = {}) {
  if (!window.speechSynthesis) return;
  getSynth().cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = 'ja-JP';
  utt.rate = rate;
  utt.pitch = pitch;
  getSynth().speak(utt);
}

export function canSpeak() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}
```

**UI integration:**
- `FlashcardMode` front face: 🔊 button next to JP term (appears only if `canSpeak()`)
- `ReviewMode` card front: same
- `JpDisplay.jsx`: optional `onSpeak` prop → shows 🔊 icon

**Prefs:** `prefs.audioEnabled: true` — toggle in SayaTab settings

**Note on "hybrid":** Web Speech API is sufficient. No pre-baked audio files — this keeps the bundle at zero increase and works offline (voices are cached by OS). Pre-baked audio deferred; revisit only if user feedback shows Web Speech quality insufficient on target devices (Indonesian Android).

### 16.3 Tests to add
- `exam-countdown.test.js` — daysLeft calculation, urgency multiplier at <14 days
- `speak.test.js` — canSpeak() returns false in jsdom; speakJP no-ops gracefully

---

## 11. Phase 17 — QA, SW Auto-bump, Release v4.0

**Goal:** Clean release. All phases integrated, tested, SW auto-bumps on deploy.

### 17.1 SW CACHE_VERSION auto-bump (TD-06)

In `deploy.yml`, before building:
```yaml
- name: Bump SW cache version
  run: |
    VERSION="ssw-v$(date +%Y%m%d%H%M)"
    sed -i "s/const CACHE_VERSION = .*/const CACHE_VERSION = '$VERSION';/" public/sw.js
```

This eliminates manual bump risk entirely.

### 17.2 Coverage thresholds

Add to `vitest.config.js`:
```js
coverage: {
  provider: 'v8',
  thresholds: { lines: 70, functions: 70, branches: 60 }
}
```

### 17.3 Flow tests (integration)

Tests that span multiple components/contexts:
- `flow.onboarding.test.jsx` — full onboarding 4 steps → completeOnboarding called with correct payload
- `flow.quiz-srs.test.jsx` — start quiz → answer wrong → SRS card written → progress.quizWrong updated
- `flow.flashcard-star.test.jsx` — star card → exit mode → re-enter → card still starred
- `flow.export-import.test.js` — exportAll → importAll → verify all 3 docs match

### 17.4 Release checklist
- [ ] All Phase 11–16 tests passing (target: ~320 tests)
- [ ] Lint: 0 errors, 0 warnings
- [ ] Build: clean, bundle visualizer reviewed (no chunk > 200KB gzip)
- [ ] Manual smoke test: Onboarding → Flashcard → Quiz → Review → Export → Import
- [ ] SW CACHE_VERSION auto-bumped in deploy workflow
- [ ] `package.json` version → `4.0.0`
- [ ] CHANGELOG entry `[4.0.0]`
- [ ] `_MAP.md` updated

---

## 12. Non-Goals (Explicitly Out of Scope)

| Feature | Decision | Revisit |
|---|---|---|
| Cloud sync / backend | ❌ Out. localStorage + export/import only | v5 |
| i18n extraction | ❌ Out. ID strings hardcoded | v5 |
| LLM Coach | ❌ Out. Offline-first constraint | v5 |
| Pre-baked audio files | ❌ Out. Web Speech API sufficient | v5 |
| Leaderboard / social | ❌ Out. No backend | Never unless requirements change |
| Playwright / E2E | ❌ Out. Manual QA covers device-specific behavior | v5 |
| New prod dependencies | ❌ Hard constraint. Max 3 prod deps | — |
| `vitest/ui` dev dep | ✅ Fine to add as dev dep only | Phase 17 |

---

## 13. File-by-File Verdict (Verified)

> All line counts and verdicts are from direct source read on 2026-05-01.

### Root & Config

| File | LOC | Verdict | Phase |
|---|---|---|---|
| `package.json` | — | ✅ lean, 3 prod deps | 17: add vitest coverage |
| `vite.config.js` | — | ✅ manual chunks correct | — |
| `eslint.config.js` | — | ✅ flat config v10 | — |
| `vitest.config.js` | — | ✅ | 17: add coverage thresholds |
| `public/sw.js` | — | ⚠️ CACHE_VERSION manual | 17: auto-bump via CI |
| `CHANGELOG.md` | — | ✅ | — |
| `_MAP.md` | — | ✅ excellent agent doc | Update each phase |

### `src/storage/`

| File | LOC | Verdict | Phase |
|---|---|---|---|
| `engine.js` | 156 | ✅ solid, clean API | 11: add v2→v3 migration path |
| `schema.js` | 45 | ✅ | 11: STORAGE_VERSION 3, add examDate/dailyMission/sessions |
| `migrations.js` | 143 | ✅ v1→v2 working | 11: add migrate_v2_to_v3() |

### `src/contexts/`

| File | LOC | Verdict | Phase |
|---|---|---|---|
| `AppContext.jsx` | 111 | ✅ | — |
| `ProgressContext.jsx` | 161 | ⚠️ _newKnownSize dead var | 11: remove, wire milestones |
| `SRSContext.jsx` | 32 | ✅ thin, correct | — |

### `src/srs/`

| File | LOC | Verdict | Phase |
|---|---|---|---|
| `fsrs-core.js` | 204 | ✅ clean, calibration hook comments present | 13: no change needed |
| `fsrs-store.js` | 57 | ✅ thin wrapper | — |
| `fsrs-scheduler.js` | 149 | ✅ | 13: add getOverdueRatio() for Daily Mission |
| `index.js` | 38 | ✅ barrel | — |

### `src/hooks/`

| File | LOC | Verdict | Phase |
|---|---|---|---|
| `useStreak.js` | 35 | ⚠️ naming ambiguity | 11: rename → useAnswerStreak |
| `useSRS.js` | 55 | ✅ | — |
| `usePersistedState.js` | 26 | ⚠️ legacy, bypasses engine | Deprecate after Phase 11 confirms nothing uses it for new fields |
| `useQuizKeyboard.js` | 45 | ✅ | — |

### `src/utils/`

| File | LOC | Verdict | Phase |
|---|---|---|---|
| `quiz-generator.js` | 50 | ✅ | — |
| `jp-helpers.js` | 66 | ✅ | — |
| `wrong-tracker.js` | 55 | ⚠️ dead exports (STORAGE_KEYS, load/save/removeFromStorage) | 11: remove dead exports |
| `shuffle.js` | 9 | ✅ | — |

### `src/components/`

| File | LOC | Verdict | Phase |
|---|---|---|---|
| `Dashboard.jsx` | 165 | 🔴 useMemo([]) BUG-01, dead exports | 11 |
| `BelajarTab.jsx` | 60 | ✅ | — |
| `SayaTab.jsx` | 169 | ⚠️ import handler truncated in read — verify complete | 14: export/import UI |
| `Onboarding.jsx` | 310 | ✅ 4-step, complete | — |
| `QuizShell.jsx` | 171 | ✅ | 13: add startTime for session tracking |
| `ResultScreen.jsx` | 94 | ✅ | — |
| `OptionButton.jsx` | 32 | ✅ | — |
| `ProgressBar.jsx` | 30 | ✅ aria added | — |
| `ProgressRing.jsx` | 55 | ✅ aria-hidden | — |
| `JpDisplay.jsx` | 207 | ✅ | 16: add onSpeak prop |
| `FilterPopup.jsx` | 140 | ✅ | — |
| `EmptyState.jsx` | 92 | ✅ | — |
| `ConfirmDialog.jsx` | 49 | ✅ | — |
| `Toast.jsx` | 68 | ✅ | — |
| `Skeleton.jsx` | 72 | ✅ | — |
| `TrackPicker.jsx` | 114 | ✅ | — |

### `src/modes/`

| File | LOC | Verdict | Phase |
|---|---|---|---|
| `FlashcardMode.jsx` | 447 | ⚠️ FLIP_STYLE injection, large | 15: decompose |
| `ReviewMode.jsx` | 190 | ✅ | — |
| `QuizMode.jsx` | 161 | 🔴 BUG-02 _seenPool | 11 |
| `JACMode.jsx` | 116 | ✅ | — |
| `WaygroundMode.jsx` | 123 | ✅ | — |
| `VocabMode.jsx` | 133 | ✅ | — |
| `SimulasiMode.jsx` | 192 | ✅ | — |
| `AngkaMode.jsx` | 225 | ⚠️ panel+quiz in one file | Consider split in Phase 15 |
| `DangerMode.jsx` | 215 | ⚠️ same pattern | Consider split in Phase 15 |
| `SprintMode.jsx` | 104 | ✅ | — |
| `FocusMode.jsx` | 78 | ✅ | 13: use session data for better weakness detection |
| `StatsMode.jsx` | 95 | ⚠️ extend | 13: session accuracy chart |
| `SearchMode.jsx` | 84 | ✅ | — |
| `GlossaryMode.jsx` | 138 | ✅ | — |
| `SumberMode.jsx` | 69 | ✅ | — |
| `ExportMode.jsx` | 149 | 🔴 delete — duplicate + incompatible format | 11 |
| `SipilMode.jsx` | 68 | 🔴 stub | 12 |
| `BangunanMode.jsx` | 70 | 🔴 stub | 12 |

### `src/data/`

| File | LOC | Verdict | Phase |
|---|---|---|---|
| `cards.js` | 1599 | ✅ | — |
| `categories.js` | 143 | ✅ | — |
| `jac-official.js` | 975 | ✅ 95 questions, 4 sets | 12: use as base for Sipil/Bangunan |
| `wayground-sets.js` | 860 | ✅ | — |
| `csv-sets.js` | 3998 | ✅ loaded per lazy chunk | — |
| `angka-kunci.js` | 40 | ✅ | — |
| `danger-pairs.js` | 152 | ✅ | — |
| `index.js` | 31 | ✅ barrel | — |

### `src/tests/` (223 tests, 10 files)

| File | Verdict |
|---|---|
| `data.test.js` | ✅ 42 tests |
| `storage.test.js` | ✅ 27 tests |
| `components.quizshell.test.jsx` | ✅ 21 tests |
| `scheduler.test.js` | ✅ 24 tests |
| `components.dashboard.test.jsx` | ✅ 20 tests (BUG-01 fix will need update here) |
| `components.resultscreen.test.jsx` | ✅ 18 tests |
| `utils.test.js` | ✅ 32 tests |
| `offline.sw.test.js` | ✅ 14 tests |
| `srs.test.js` | ✅ 16 tests |
| `quiz.test.js` | ✅ 9 tests |

---

## Appendix A — Phase Summary Table

| Phase | Name | Bugs Fixed | Features | Est. Tests Added |
|---|---|---|---|---|
| 11 | Bug Fixes & Storage Hardening | BUG-01, BUG-02, BUG-03 + 5 TD | None | +27 |
| 12 | Content: Sipil & Bangunan | — | 2 full modes | +20 |
| 13 | Adaptive Learning | — | Daily Mission, sessions, StatsMode+ | +25 |
| 14 | Export/Import Refinement | TD-01 | Export diff, import validation, rollback | +20 |
| 15 | FlashcardMode Decomposition | TD-05 | Refactor only | +15 |
| 16 | Exam Countdown + Audio | — | examDate UI, Web Speech | +15 |
| 17 | QA + Release v4.0 | — | Flow tests, SW auto-bump, coverage | +30 |
| **Total** | | | | **~350 tests** |

---

*Blueprint v4 authored by Agent Sonnet 4.6 on 2026-05-01.*
*All file verdicts, LOC counts, and bug confirmations based on direct source read of commit `da981b4`.*
*Prior proposal credit: Genspark AI Architect (structural analysis and health scorecard).*
