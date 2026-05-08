# 🏗️ SSW Konstruksi — Blueprint Current (v4.7.0)

> **Status:** ALL PHASES COMPLETE ✅ (Phase 5.2 content expansion deferred)
> **Version:** 4.7.0
> **Last updated:** 2026-05-08
> **Supersedes:** MASTER-BLUEPRINT-v6.md (archived — all phases A–G executed)

**→ For a new agent: start with `_MAP.md` in the repo root.**

---

## What Was Built

A React 19 PWA for Indonesian construction workers studying the JAC SSW exam.

| Dimension | Value |
|-----------|-------|
| Flashcards | 1,438 (curated, type-annotated, ruby-rendered) |
| Quiz questions | ~860 (JAC + Wayground + CSV + Sipil + Bangunan) |
| Modes | 23 (all React.lazy) |
| Storage schema | v3 (3-doc localStorage model) |
| Tests | 383 (35 files) |
| Prod deps | 4 (react, react-dom, ts-fsrs, lz-string) |
| Version | **4.7.0** |

---

## Completed Phase History

### Phases A–G (v3.7.0 → v4.0.0) — Core App

| Phase | Name | Key Deliverables |
|-------|------|-----------------|
| A | Bug Fixes + Storage v3 | seenPool→useRef, milestone toasts, anxiety toast, storage v3 migration, growth mindset strings |
| B | Content: Sipil & Bangunan | sipil-sets.js (3 sets, 45q), bangunan-sets.js (3 sets, 45q), functional quiz modes, QuestionImage component |
| C | Daily Mission + Session Analytics | daily-mission.js (Four Strands engine), MissionCompleteOverlay, session tracking (cap 90), habit anchor, StatsMode weekly chart |
| D | Export/Import Hardening | validateSnapshot, importAllSafe with rollback, SayaTab diff UI |
| E | FlashcardMode Decomposition | FlashcardMode/ sub-directory, FLIP_STYLE → CSS, furiganaPolicy prop chain |
| F | Exam Countdown + Audio | SayaTab date picker, Dashboard countdown banner, speak.js (Web Speech + HVPT cycling), 🔊 buttons |
| G | QA + Polish + Release | Coverage thresholds (70/60), flow tests, _MAP.md v4, v4.0.0 release |

### CS Series (v4.0.x) — Content Standardization

| Task | Deliverable |
|------|-------------|
| CS-01 | cards.js split into 8 source files in src/data/source/ |
| CS-02 | romaji field removed, type field added to all 1,438 cards |
| CS-03 | DescBlock native ruby rendering via parseRubyFragments |
| CS-04 | FlipCard quote field rendering on back face |
| CS-05 | Full re-annotation pass: 1,438 cards with desc/id_text/context quality pass |

### FE Series (v4.0.x → v4.1.0) — Frontend Polish

| Task | Deliverable |
|------|-------------|
| FE-01 | CSS module migration for all mode components (6 files) |
| FE-02 | prefers-reduced-motion in 7 CSS files |
| FE-03 | Design tokens: --sp-*, --shadow-*, --z-*, --ease-*, --t-*, .sr-only |
| FE-04 | A11y: aria-live, focus trap (useFocusTrap), focus management on mode change, kbHint |
| FE-05 | ErrorBoundary, OfflineBanner, useDebounce, Toast swipe+type |
| FE-06 | 22 new render tests: BottomNav, ResultScreen, Toast |
| FE-07 | Vite/Vitest @ alias, JSDoc types, Husky setup doc |
| FE-08 | PWA install prompt (SayaTab), SW_UPDATED toast (sw.js + App.jsx) |
| FE-09 | haptic.js, scroll restoration, View Transitions API |

### v4.2.0 — Test Fix + New Modes

| Item | Deliverable |
|------|-------------|
| Fix | BottomNav.test.jsx + Toast.test.jsx: CSS module mock → `{ default: new Proxy({}, { get: (_, k) => k }) }` |
| ProductionMode | ID→JP active recall with text input (`produksi`), registered in latihan |
| ConfusionMode | 28 confusion pairs VLT-style (音/字/意) (`mirip`), registered in latihan |

### v4.3.0 — Phase 5.1 Critical Gaps

| Item | Deliverable |
|------|-------------|
| SIM1 | SimulasiMode pause button + auto-pause on visibilitychange |
| BUG-06 | Unified question pool: JAC_OFFICIAL + WAYGROUND_SETS merged via normalizer |
| ST2 | Exam Readiness Score gauge in StatsMode (SVG ring, 3-color, formula) |
| R1 | ReviewMode rating distribution on done screen |
| A1 | Universal Wrong-Card Bridge — all quiz modes → filtered FlashcardMode |
| K1 | FlashcardMode swipe gestures: left=Lagi, right=Oke, up=Mudah |
| E1 | SW_UPDATED prompt (already in FE-08, now functional) |
| BUG-07 | SprintMode wrong-tracker write |

### v4.3.1 — Phase 5.3 + 5.4

| Item | Deliverable |
|------|-------------|
| BUG-05 | FlashcardMode filter/sort persist via sessionStorage |
| BUG-08 | GlossaryMode: non-hiragana furi → `#` bucket at end of A-Z nav |
| BUG-10 | `flashcardHintCount` in schema DEFAULTS → resets on `resetAll()` |
| BUG-11 | ExportMode conflict warning when device data is newer than import file |
| B2 | SprintMode: duration picker (30s/60s/2m) + category lock + escalating urgency |
| SIM3 | SimulasiMode: \"Latih Salah\" CTA → `onRetryWrong` FlashcardMode bridge |
| SIM4 | SimulasiMode: post-exam breakdown per source/set |
| F1 | Achievement badge system — 14 badges, `utils/achievements.js`, grid in SayaTab |
| F2 | Daily Challenge — date-seeded question in SayaTab, `utils/daily-challenge.js` |
| ST1 | StudyHeatmap — 18-week SVG heatmap in StatsMode, `components/StudyHeatmap.jsx` |
| A2 | Smart Mode Recommendation — `utils/recommend-mode.js` replaces `getQuickStart` |
| E4 | lz-string compression on all localStorage writes; backward-compat read fallback |

### v4.4.0 — Phase 5.5 Unfinished Items

| Item | Deliverable |
|------|-------------|
| D1 | DengarMode — audio-first listening comprehension quiz (`dengar` in `latihan`) |
| D3 | CatatanMode — personal notes/mnemonics per card, `prefs.notes`, filterable (`catatan` in `pelajari`) |
| A3 | Inter-mode breadcrumb nav — `modeHistory` + `goBack()` in AppContext; sticky `ModeRouter` bar |
| Infra | Sessions cap 90 → 180; StudyHeatmap `today` in useMemo; FlashcardMode dep fix; `schema.js` notes DEFAULTS |

### v4.5.0 — Phase 5.6 (B1) Kuis Produksi

| Item | Deliverable |
|------|-------------|
| B1 | `QuizProduksiMode.jsx` — JP→ID type-answer with fuzzy match, wrong-tracker, audio, session summary |
| Tests | `quiz-produksi.test.jsx` — 7 tests; total 383/383 ✅ |

### v4.7.0 — Phase 5.7 (W2)

| Item | Deliverable |
|------|-------------|
| W2 | WaygroundMode per-set "Ulang Salah" — `getSetWrongCount()` helper, `lemahMode` state, sub-button per set row, score isolation for lemah runs |

---

### v4.6.0 — E2/F4/ST3

| Item | Deliverable |
|------|-------------|
| E2 | GitHub Gist sync (opt-in) — `utils/gist-sync.js`; PAT input + Push/Pull in ExportMode |
| F4 | Sprint "Battle Past Self" ghost score — `sprintBestTimeline` in prefs, live ghost display |
| ST3 | Quiz accuracy per category in StatsMode — `🎯 N%` badge + wrong count from `quizWrong` |

---

## Open Items / Known Gaps (Post v4.6.0)

These are honest assessments — not blocking anything, but relevant for future work:

### Content Gaps (Phase 5.2 — Deferred)
- **Sipil/Bangunan track content is thin**: 45 questions each, written from general knowledge. JAC official PDFs for sipil (text5d–7d) and bangunan (text5k–7k) were not fully processed. The 1,438 flashcards are ~80% lifeline content — sipil and bangunan tracks show near-identical card pools.
- **Chapter 2–4 flashcards missing**: text2l, text3l, text4l not yet extracted. Merge-cards pipeline is ready — content needs to be authored and added starting at id 631.
- **Photo-based (写真) questions**: QuestionImage component exists and SW cache handles images, but actual images from JAC PDFs have not been extracted and added. B.7 infrastructure is in place, content is not.
- **desc field accuracy**: Term existence verified (63% JAC-traceable), but Indonesian explanation correctness was not audited. Human review recommended.

### Technical
- **sessions cap at 180**: Heatmap uses 18 weeks (~126 days). Cap bumped 90→180 in v4.4.0. ✅
- **lz-string prod dep**: `package.json` now has 4 prod deps (react, react-dom, ts-fsrs, lz-string). Hard constraint updated to 4. ✅

### Architecture
- **Category mismatch**: `jenis_kerja` and `alat_umum` categories contain lifeline content even for sipil/bangunan track users. Re-categorization would require content review of ~485 cards.

---

## Hard Constraints (Do Not Break)

1. **Pure localStorage** — no Supabase, no external auth, no window.storage
2. **Max 4 prod deps** — react, react-dom, ts-fsrs, lz-string
3. **All 23 modes stay React.lazy()**
4. **UI language: Indonesian** — code comments: English
5. **Zero network required** — full offline PWA
6. **`npm test` green** before every commit
7. **`npm run build` clean** before every commit
8. **`npm run lint` zero errors/warnings** before every commit

---

## Storage Schema v3

```js
DOCS = { progress: 'ssw-progress', srs: 'ssw-srs-data', prefs: 'ssw-prefs' }

progress: { _v:3, known[], unknown[], starred[], quizWrong{}, wrongCounts{},
            wgWrong{}, vocabWrong{}, jacScores{}, wgScores{}, vocabScores{},
            sipilScores{}, bangunanScores{},
            streakData{}, dailyCount{}, recentCards[],
            milestoneStreak7, milestoneQuiz70,
            sessions[],                    // cap 180 (bumped v4.4.0 for heatmap coverage)
            dailyMission }

prefs:    { _v:3, track, theme, onboarded, tutorialFlashcard, lastMode,
            dailyGoal,
            flashcardHintCount,            // BUG-10 fixed: now in DEFAULTS, resets on resetAll()
            examDate, audioEnabled, studyAnchor, furiganaPolicy,
            notes: {},                     // D3: personal notes per cardId (v4.4.0)
            sprintBestTimeline: [] }       // F4: ghost score timeline for Sprint (v4.6.0)

srs:      { _v:3, cards: { [cardId]: { card, history, reviewed_at } } }

// E4: All docs are lz-string compressed in localStorage.
// readDoc() decompresses; falls back to plain JSON for old data (backward compat).
```

---

## Archived Documents (docs/archive/)

All prior blueprints, proposals, and audit reports are in `docs/archive/`.
See `docs/archive/ARCHIVE-INDEX.md` for a summary of what's there and why.

The last active blueprint was `MASTER-BLUEPRINT-v6.md` (Opus 4.6 / Crunchy, 2026-05-01).
It has been moved to `docs/archive/` — all its phases are now complete.
