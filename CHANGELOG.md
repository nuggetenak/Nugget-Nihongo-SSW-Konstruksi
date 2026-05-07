## [4.2.0] - 2026-05-07

### Test Fix + New Modes (Agent Sonnet 4.6, commit post-61e159e)

**Fix — CSS Module Mock in Test Files**
- `BottomNav.test.jsx` and `Toast.test.jsx`: `vi.mock('*.module.css', () => ({}))` was missing a `default` export, causing all 15 tests to fail with "No default export" error
- Fixed by returning `{ default: new Proxy({}, { get: (_, k) => k }) }` — all 376 tests now green

**New Modes (from prior session commit 61e159e)**
- `ProductionMode` (`produksi`): ID→JP active recall with text input; registered in latihan
- `ConfusionMode` (`mirip`): 28 confusion pairs VLT-style (音/字/意); registered in latihan
- Mode count: 18 → 20

**Docs**
- `_MAP.md`: ProductionMode + ConfusionMode added to directory structure; metrics updated (v4.2.0, 20 modes)
- `docs/BLUEPRINT-CURRENT.md`: v4.2.0 section added; ProductionMode + ConfusionMode marked complete in open items
- `package.json`: version bumped to 4.2.0

---

## [4.1.0] - 2026-05-07

### FE Sprint — CSS Modules, A11y, Robustness, DX, PWA, UX Polish (Agent Sonnet 4.6)

**FE-01 — CSS Module Migration (all mode components)**
- `DangerMode`, `AngkaMode`, `SimulasiMode`, `StatsMode`, `ReviewMode`, `GlossaryMode` — all inline styles extracted to `.module.css` counterparts
- Dynamic/runtime styles (answer state colors, group colors, grade thresholds, animation delays) correctly kept inline with justification comments

**FE-02 — Reduced Motion**
- `@media (prefers-reduced-motion: reduce)` blocks added to 7 CSS files: `global.css`, `flashcard.module.css`, `Dashboard.module.css`, `ResultScreen.module.css`, `QuizShell.module.css`, `BottomNav.module.css`, `FlipCard.module.css`

**FE-03 — Design Token Expansion (`global.css`)**
- Spacing scale: `--sp-1` through `--sp-6` (4–24px)
- Shadow scale: `--shadow-xs/sm/lg/amber`
- Z-index scale: `--z-base/sticky/nav/overlay/toast`
- Transition presets: `--ease-spring/smooth`, `--t-fast/base/slow`
- `.sr-only` utility class
- Token audit comment block flagging 8+ hardcoded values for future cleanup

**FE-04 — Accessibility**
- A: `ProgressRing` `role="img"` + descriptive `aria-label`; `BottomNav` badge count in `aria-label`; `FlipCard` `aria-live="polite"` + `aria-atomic` + state-aware label; `QuizShell` sr-only assertive live region
- B: `QuizShell` keyboard hint UI + `.kbHint` CSS class
- C: `useFocusTrap` hook created; applied to `TrackPicker` (`role="dialog" aria-modal="true"`)
- D: `ModeRouter` focus management on mode change (100ms delay, `[data-autofocus]` target)

**FE-05 — Component Robustness**
- A: `ErrorBoundary.jsx` (class-based) with `TabError` + `FlatCardFallback`; per-tab boundaries in `App.jsx`; `FlipCard` wrapped for old WebView 3D CSS failures
- B: `OfflineBanner.jsx` + CSS — fixed banner, `navigator.onLine` + event listeners, `slideDown` animation
- C: `useDebounce.js` (120ms default); applied to `SearchMode`
- D: `Toast` upgraded — swipe-left dismiss (60px threshold), `type` prop (`default/success/error/warning`), `data-type` CSS color variants, type-aware `aria-live`

**FE-06 — Component Render Tests (22 new test cases)**
- `BottomNav.test.jsx`: 7 tests — tab render, data-active, onChange, badge count, aria-current
- `ResultScreen.test.jsx`: 7 tests — celebrate/encourage/neutral data-path, onRestart, onExit, score text
- `Toast.test.jsx`: 8 tests — render, auto-dismiss (fake timers), undo, dismiss, stack, role=status, aria-live per type

**FE-07 — DX Improvements**
- A: `vite.config.js` + `vitest.config.js` — `@` path alias → `src/`
- B: `HUSKY-SETUP.md` — one-time pre-commit hook setup instructions
- C: `src/types.js` — JSDoc typedefs: `Card`, `Category`, `SRSState`, `Tab`, `ToastItem`, `StreakData`, `UserPrefs`

**FE-08 — PWA Hardening**
- A: `SayaTab` PWA install prompt — `beforeinstallprompt` capture, install card UI with amber accent
- B: `sw.js` activate → `postMessage({type:'SW_UPDATED'})` to all clients; `App.jsx` SW message listener → update toast with reload action

**FE-09 — UX Polish**
- A: `haptic.js` — `tap/correct/wrong/success/flip` via Vibration API; applied to `OptionButton`, `FlipCard`, `RatingRow`
- B: Scroll restoration in `ModeRouter` — `scrollCache` Map saves/restores `window.scrollY` per mode
- C: View Transitions API in `BottomNav` — `document.startViewTransition` wrapper (progressive enhancement); `::view-transition-old/new` 150ms CSS in `global.css`

**Build:** ✅ clean · lint: 0 errors 0 warnings · commits `f8150e6`→`5ca29f1`

---

### Repo Hygiene — 2026-05-07

- `outputs/` removed from git tracking (10 agent JSON artefacts — already merged into `src/data/source/`); added to `.gitignore`
- Stale remote branch `feat/ui-ux-upgrade` deleted
- `src/hooks/index.js` — `useDebounce` + `useFocusTrap` added to barrel export
- `src/utils/index.js` — `haptic` + `speak.js` exports added to barrel
- `.gitignore` — added `outputs/`, `coverage/`, `stats.html`, `.env.*`
- `.prettierignore` — added `outputs/`, `coverage/`
- `vitest.config.js` — `resolve.alias @→src` added (mirrors `vite.config.js`); `@vitejs/plugin-react` import path fixed
- `.github/workflows/ci.yml` — verbose test reporter, build output check step
- `_MAP.md` — updated to v4.1.0: all FE tasks, new files, metrics, agent trail entry

---

## [4.0.2] - 2026-05-04

### feat/audit-improvements — D1–D10 (Agent Sonnet 4.6)

- `components/SayaTab.jsx` — D1: Replace `prompt()` for Target Harian + Tanggal Ujian with inline input UI (mobile-safe, no dialog blocks)
- `components/SayaTab.module.css` — D1: Add `.inlineEdit`, `.inlineInput`, `.inlineSave`, `.inlineDelete`, `.inlineCancel` styles
- `modes/QuizMode.jsx` — D2: Respect `furiganaPolicy` pref in `startQuiz()` — question uses raw jp+furi when 'always', strips when 'hidden'
- `modes/SprintMode.jsx` — D3: Wire `furiganaPolicy` + `audioEnabled` from storage into `JpFront` props
- `router/modes.js` — D4: Add `alat` section (`stats`, `ekspor`, `sumber`) to `MODE_SECTIONS` — modes now reachable from BelajarTab grid
- `modes/ReviewMode.jsx` — D5: Auto-speak on card advance via `useEffect([currentId])` with 300ms delay; manual 🔊 kept for replay
- `utils/daily-mission.js` — D6: Add `angka` + `jebak` to `MISSION_TYPES` pool (were wired but excluded from daily selection)
- `modes/StatsMode.jsx` — D7: Accept `sessions` prop; render 7-day CSS activity bars colored by dominant mode
- `router/ModeRouter.jsx` — D7: Destructure + pass `sessions` from ProgressContext to stats mode props
- `components/MissionCompleteOverlay.jsx` — D8: Tap-to-dismiss, shows mission icon+label+score, auto-dismiss 1.5s→3s
- `router/ModeRouter.jsx` — D8: Track `missionResult` state, pass `result` prop to overlay, clear on close
- `modes/SearchMode.jsx` — D9: Accept `starred`+`toggleStar` props; ⭐/☆ button on each result card
- `router/ModeRouter.jsx` — D9: Pass `starred`+`toggleStar` to `cari` mode
- `components/QuizShell.jsx` — D10: Add optional `audioEnabled` prop + 🔊 button in counter row (opt-in, default false)
- `modes/QuizMode.jsx` + `JACMode.jsx` + `VocabMode.jsx` — D10: Accept + pass `audioEnabled` to QuizShell
- `router/ModeRouter.jsx` — D10: Read `audioEnabled` from prefs, pass to `kuis`, `jac`, `vocab` $
 ## [4.0.1] - 2026-05-04

### feat/audit-improvements — C1–C6 (Agent Sonnet 4.6)

- `modes/ReviewMode.jsx` — C1: implement 🔊 audio button using `speakJP` + `canSpeak` (B4 was dead import only). Button shown in card header when `audioEnabled=true`; taps `speakJP(clean)`.
- `modes/SearchMode.jsx` — C2: track-aware filtering. Accepts `track` prop. Default pool = jalur aktif via `getCatsForTrack`. Toggle pill 🗂 Jalurku / 🗂 Semua jalur. Search meta shows pool size.
- `modes/FocusMode.jsx` — C3: accepts + forwards `onSessionEnd` to inner SprintMode. Sprint sessions inside FocusMode now recorded.
- `modes/AngkaMode.jsx` — C4: QuizView fires `onSessionEnd` via `useEffect` on `phase=result`. `sessionFired` ref prevents double-fire. `restart()` resets ref.
- `modes/DangerMode.jsx` — C4: same pattern as AngkaMode.
- `router/ModeRouter.jsx` — C5: fill modeProps gaps — `fokus`/`angka`/`jebak` get `onSessionEnd`; `cari` gets `track`; `stats` gets `srs`+`streakData`. Destructures `streakData` from `useProgress`.
- `modes/StatsMode.jsx` — C6: SRS breakdown grid (🌟 Matang / 📗 Berkemb. / 📘 Baru) + 🔥 streak card + due-count banner.

**Build:** ✅ clean · lint: 0 errors 0 warnings · commit `77a0b93`

---

### feat/audit-improvements — B1–B4 + M1–M3 (Agent Sonnet 4.6, 2026-05-03)

- `modes/FlashcardMode/index.jsx` + `FlipCard.jsx` + `JpDisplay.jsx` — B1: `furiganaPolicy` prop chain fixed end-to-end (was silently dropped via `no-unused-vars`).
- `components/SayaTab.jsx` — B2+M1: furigana policy toggle row added to Pengaturan. Tap cycles `always → hidden → always`.
- `router/ModeRouter.jsx` — B3: `makeSessionEnd()` helper; all 7 quiz modes (SprintMode, JACMode, WaygroundMode, VocabMode, SimulasiMode, SipilMode, BangunanMode) now fire `recordSession` + mission check via `onSessionEnd`.
- `modes/ReviewMode.jsx` — B4: `storageGet` import added (audio groundwork — completed in C1).
- `modes/SprintMode.jsx` — M2: personal best tracking (`prefs.sprintBest`). 🏆 shown on ready + result screens. `sessionEndFired` ref prevents double-fire.
- `modes/GlossaryMode.jsx` — M3: track-aware category pills. Toggle 🗂 Jalurku / 🗂 Semua jalur.

**Build:** ✅ clean · commit `a68bf82`

---

## [4.0.0] - 2026-05-02

### Release v4.0.0 — Phase F + G Complete (Agent Sonnet)

**Phase F — Exam Countdown + Audio**

- `utils/speak.js` (NEW) — Web Speech API with HVPT-inspired cycling (Logan et al. 1991):
  - `speakJP(text)` — speaks Japanese with `ja-JP` lang tag
  - 3-parameter cycle: 70%/0.85, 80%/1.0, 90%/1.15 rate/pitch variation
  - `canSpeak()` — graceful degradation (returns false in jsdom/unsupported browsers)
  - `stopSpeech()`, `_resetPlayCount()` for testing
- `components/JpDisplay.jsx` — `JpFront` now has 🔊 button when `audioEnabled=true` and `canSpeak()=true`
  - Inline in default render path; tap calls `speakJP(stripFuri(jp))`
- `modes/FlashcardMode/FlipCard.jsx` — receives `audioEnabled` prop, passes to `JpFront`
- `components/Dashboard.jsx` — Exam countdown banner:
  - Shows when `prefs.examDate` is set and ≤30 days away
  - Color-coded: blue (≤30d), amber (≤14d), red (≤7d)
  - Critical message when ≤14 days
- `components/SayaTab.jsx` — Two new settings rows:
  - 📅 Tanggal Ujian — date picker (YYYY-MM-DD prompt), stored in `prefs.examDate`
  - 🔊 Audio Bahasa Jepang — toggle `prefs.audioEnabled`

**Phase G — QA + Polish + Release v4.0**

- `vitest.config.js` — Coverage thresholds added: lines 70%, functions 70%, branches 60%
- `_MAP.md` — Fully updated to v4.0.0: all Phase A–G tracked, metrics updated (321 tests, 26 files), complete file tree with phase annotations, storage schema v3 reference, agent trail
- `package.json` — Version bumped to `4.0.0`
- `SayaTab.jsx` — Footer version updated to v4.0.0

**Integration Tests (G.2)**
- `flow.export-import.test.js` (+2): full export→import cycle, rollback on corrupt snapshot
- `flow.quiz-srs.test.js` (+4): session recording, sipil/bangunan scores, mission completion
- `flow.storage-integrity.test.js` (+5): all v3 schema fields correct types across all phases
- `speak.test.js` (+8): canSpeak jsdom=false, no-throw in no-api env, mock browser test, HVPT cycling
- `exam-countdown.test.js` (+7): daysLeft logic, show thresholds, examDate + audioEnabled storage

**Final counts: 295 → 321 tests (+26) · 21 → 26 test files (+5)**

---

## [3.9.0] - 2026-05-02

### Phase D + E Complete — Export Hardening + FlashcardMode Decomposition (Agent Sonnet)

**Phase D — Export/Import Hardening**

- `storage/engine.js` — Added `validateSnapshot(snapshot)`: validates structure before import, returns `{ ok, reason, summary }`
- `storage/engine.js` — Added `importAllSafe(snapshot)`: validates first, snapshots current state, applies import, auto-rollbacks on error
- `modes/ExportMode.jsx` — Full rewrite with 2-step import flow:
  1. File loaded → validated → diff preview shown (before vs incoming data)
  2. User confirms → `importAllSafe()` applied with rollback safety
  - Summary widget now shows sessions count + schema version
  - Error messages mention that old data is safe if import fails

**Phase E — FlashcardMode Decomposition**

- `modes/FlashcardMode.jsx` (447 lines) → shim re-export only
- New `src/modes/FlashcardMode/` directory:
  - `index.jsx` (~120 lines) — orchestrator; all state management
  - `FlipCard.jsx` — 3D front/back card, swipe tilt, hint overlay
  - `RatingRow.jsx` — FSRS 4-button rating row with interval preview
  - `ToolStrip.jsx` — Sort / belum / reset / star-filter tools + keyboard hint
  - `FilterBar.jsx` — Search input + star toggle button
  - `flashcard.module.css` — 3D flip CSS (TD-05: moved from JS injection)
- **TD-05**: `FLIP_STYLE` constant + `ensureStyle()` function removed entirely
  - CSS now lives in `flashcard.module.css` with `:global()` class selectors
  - No more `document.createElement('style')` at render time
- **TD-10**: `JpDisplay.jsx` `JpFront()` accepts `furiganaPolicy` prop
  - Values: `'always'` (default, no change) | `'hidden'` (suppress furigana)
  - Default `'always'` — zero behavioral change for all current users
  - Prep for Phase G settings UI

**Tests: 273 → 295 (+22 new)**
- `export-import.test.js` (+13): validateSnapshot (8 cases), importAllSafe (4 cases)
- `flashcard-decomp.test.jsx` (+9): file existence, shim structure, CSS content, TD-05 & TD-10 verification

## [3.8.0] - 2026-05-02

### Phase B + C Complete — Content Sipil/Bangunan + Daily Mission (Agent Sonnet)

**Phase B — Content: Sipil & Bangunan**

- `src/data/sipil-sets.js` — 45 soal (3 set × 15): 土工事, K3 Sipil, Hukum & SSW
- `src/data/bangunan-sets.js` — 45 soal (3 set × 15): Bekisting/Beton, K3 Bangunan, Alat & Prosedur
- `SipilMode.jsx` — Replaced "Segera Hadir" stub dengan quiz fungsional, saves ke `sipilScores`
- `BangunanMode.jsx` — Replaced "Segera Hadir" stub dengan quiz fungsional, saves ke `bangunanScores`
- `data/index.js` — Tambah barrel export `SIPIL_SETS`, `BANGUNAN_SETS`
- `router/modes.js` — Update MODE_META: hilangkan "Segera hadir", tampilkan jumlah soal

**Phase C — Daily Mission + Session Analytics**

- `utils/daily-mission.js` (NEW) — `generateDailyMission()`, `completeMission()`, `getMission()`, `isMissionDoneToday()`
  - Priority: SRS due → strand underrepresented (Four Strands, Nation 2007)
  - Cached per-day via `progress.dailyMission`
- `contexts/ProgressContext.jsx` — Tambah `recordSession()` (cap 90), expose `sessions` array
- `router/ModeRouter.jsx` — `makeFinishHandler()` wrap `onFinish` semua mode → auto-record session
- `components/Dashboard.jsx` — Misi Hari Ini card di atas Quick Grid; ✅ badge kalau sudah selesai
- `contexts/AppContext.jsx` — Expose `setPref` + `prefs` di ctx object
- `components/SayaTab.jsx` — Target harian editable via prompt

**Tests: 258 → 273 (+15 new)**
- `sipil-data.test.js` (+8): Schema validation semua soal
- `bangunan-data.test.js` (+8): Schema + cross-validation no ID overlap
- `daily-mission.test.js` (+10): Generate, cache, complete, strand logic
- `session-tracking.test.js` (+5): recordSession, cap 90, multi-mode

## [3.7.0] - 2026-05-02

### Phase A Complete — Bug Fixes + Storage v3 + Debt Cleanup (Agent Sonnet)

**A.1 — BUG-02 Fix: `_seenPool` module-scope → `useRef`**
- `QuizMode.jsx`: Moved `const _seenPool = new Set()` from module scope into `useRef(new Set())` inside component
- Prevents stale seen-card memory across separate QuizMode sessions (module-scope Set survives HMR and route transitions)
- All `_seenPool.current` references updated throughout component

**A.2 — BUG-01 + TD-02 Fix: Remove dead Dashboard exports**
- `Dashboard.jsx`: Removed `export function recordStudyDay()`, `export function incrementDailyCount()`, `export function pushRecentCard()` — never imported by anything
- Streak and daily-count logic correctly lives in `ProgressContext.jsx`'s `handleMark()`
- Removed import of `storageSet` from Dashboard (no longer needed after dead-code removal)

**A.3 — BUG-03 Fix: Wire milestone toasts**
- `ProgressContext.jsx`: Added `toastQueue` state + `clearToast()` callback
- Milestone streak7 and quiz70 now enqueue toast messages via `setTimeout(() => setToastQueue(...), 0)` pattern (avoids setState-within-setState)
- `App.jsx`: Added `useEffect` to consume `toastQueue` and fire `toast.show()` on each queued item

**A.4 — BUG-04 Fix: Anxiety-reduction toast on 5+ wrong streak**
- `useAnswerStreak.js` (new, see A.5): Extended to track `wrongStreak` + `maxWrongStreak`
- `QuizShell.jsx`: On quiz finish, if `maxWrongStreak >= 5`, fires: *"Banyak salah? Wajar — artinya materi ini masih baru. Coba mode Kartu dulu 💪"*
- Evidence: Young (1991) — normalizing errors reduces FLCA; Zhang (2019) r = −.33

**A.5 — TD-04: Rename `useStreak` → `useAnswerStreak`**
- `src/hooks/useStreak.js` → `src/hooks/useAnswerStreak.js`
- Export renamed: `useStreak` → `useAnswerStreak`
- `hooks/index.js`: Exports both `useAnswerStreak` (primary) and `useStreak` (alias for backward compat)
- `QuizShell.jsx`: Import updated to `useAnswerStreak`

**A.6 — Storage schema v2 → v3**
- `storage/schema.js`: `STORAGE_VERSION` bumped 2 → 3
- New `progress` fields: `sipilScores`, `bangunanScores` (Phase B), `sessions`, `dailyMission` (Phase C)
- New `prefs` fields: `examDate`, `audioEnabled` (Phase F), `studyAnchor` (Phase C), `furiganaPolicy` (Phase E)
- `storage/migrations.js`: Added `hasV2Data()` and `migrate_v2_to_v3()`
- `storage/engine.js`: `init()` now handles v2→v3 migration; v1 data chains through v2→v3; fresh install writes v3 defaults

**A.7 — TD-03: Fix wrong-tracker v1 key references**
- `utils/wrong-tracker.js`: Removed exported `STORAGE_KEYS` object (contained v1 key strings like `'ssw-quiz-wrong'` that no longer exist as standalone keys in v2/v3)
- Value helpers (`getWrongCount`, `makeWrongEntry`, etc.) unchanged — still backward-compatible

**A.8 — TD-01: Fix ExportMode format compatibility**
- `modes/ExportMode.jsx`: Replaced custom `collectProgressData()`/`restoreProgressData()` (scraped individual localStorage keys) with `exportAll()`/`importAll()` from storage engine
- Export filename now includes schema version: `ssw-progress-v3-YYYY-MM-DD.json`
- Summary widget shows schema version instead of raw key count

**A.9 — TD-08: Remove legacy nav arrays**
- `router/modes.js`: Removed `BELAJAR_MODES`, `UJIAN_MODES`, `LAINNYA_MODES` exports
- Navigation uses `MODE_SECTIONS` throughout; legacy arrays were never imported

**A.10 — Growth mindset language in ResultScreen (C-13)**
- `components/ResultScreen.jsx`: Encourage path (< 50%) changes:
  - Emoji: `💪` → `🌱`
  - Label: replaced with *"Belum. Tapi kamu sudah tahu apa yang perlu dipelajari."*
- Evidence: Dweck (2006) — "not yet" framing preserves intrinsic motivation

**Tests: 223 → 242 (+19 new)**
- `quiz.seenpool.test.jsx` (+3): Verifies `_seenPool` not at module scope; `useRef` pattern present
- `storage.migration-v3.test.js` (+5): Fresh install v3, v2→v3 migration, DEFAULTS shape
- `milestone.toast.test.jsx` (+3): Toast queue init, clearToast callable
- `anxiety.toast.test.jsx` (+3): `maxWrongStreak` logic, threshold checks
- `wrongtracker.test.js` (+5): `STORAGE_KEYS` removed, value helpers correct
- `components.resultscreen.test.jsx`: Updated 3 tests for A.10 (🌱 emoji, "Belum" label, tip selector)

**AppContext**: Added safe default context value so `useApp()` degrades gracefully in unit tests that don't wrap with `AppProvider`

---


---

## Pre-v3.7.0 History (Compacted)

> Full entries for these versions are preserved in git history.
> Summary of key milestones only.

### v3.6.x (2026-04-29 – 2026-05-01) — CSS Modules + Component Polish

- **v3.6.1** `docs` — blueprint v5, _MAP hygiene
- **v3.6.1** — Phase 10 QA release; 72 tests passing
- **v3.6.0** — Phase 9: component tests + bundle visualizer (rollup-plugin-visualizer)
- **v3.5.3** — Phase 8: skeleton loading, empty states, a11y (role/aria attrs)
- **v3.5.2** — Phase 7: interactive 4-step onboarding (TrackPicker, goal, tutorial)
- **v3.5.1** — Phase 6 CSS Modules complete: all components + modes migrated; inline styles → 0

### v3.4.x – v3.0.x (2026-04-28 – 2026-04-29) — Feature Build

- **v3.4.0** — Phase 5: DangerMode + AngkaMode polish; FilterPopup; last-mode persist
- **v3.3.0** — Phase 4: JACMode + WaygroundMode + SimulasiMode restored
- **v3.2.0** — Phase 3 / VocabMode: dedicated vocab drill; wg1–wg12; CSV sets (300 soal)
- **v3.1.0** — VocabDB: wg7–wg12 complete from JAC PDFs; csv-sets.js (300 soal)
- **v3.0.1** — Phase 9–10: Beginner UX, tutorial, milestones, Toast, ConfirmDialog
- **v3.0.0** — Major rewrite: Vite build, 3-tab nav, Dashboard, shared components, SRS engine

### v2.3.x (2026-04-28) — Legacy Monolith → Modular

- **v2.3.6** — HTML/PWA bug fixes + getCatsForTrack tests (105 tests)
- **v2.3.5** — initStore render fix, SearchMode, 105 tests
- **v2.3.4** — BottomNav theme, ReviewMode interval labels
- **v2.3.3** — Format + version sync
- **v2.3.2/v2.3.1** — Codex comprehensive audit + aggressive integrity pass
- **v2.3.x (pre-Codex)** — ts-fsrs integration, FSRS ReviewMode, pure localStorage migration, PWA icons, dark mode

