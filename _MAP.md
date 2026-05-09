# 🗺️ _MAP.md — SSW Konstruksi · Agent Orientation

> **Last updated: 2026-05-09 by Agent Sonnet 4.6 (v4.21.1: OVERHAUL-1 retire usePersistedState + ENG-4 WaygroundMode + ENG-6 ExportMode)
> **Version:** v4.21.1
> **Blueprint:** `docs/BLUEPRINT-CURRENT.md` ← **READ THIS** (constraints, schema, v4.20 queue)
> **Task files:** `docs/tasks/TASK-MASTER.md` ← **START HERE for implementation**
> **Proposal:** `docs/UPGRADE-PROPOSAL-v4.20.md` (pass 14) ← full specs for all items
> **Archive index:** `docs/archive/ARCHIVE-INDEX.md`

---

## 1. What This App Is

A React PWA study tool for the **JAC SSW Construction exam** (Japan). Interface in **Indonesian**, content **Japanese↔Indonesian bilingual**. Targets Indonesian construction workers studying for the SSW visa exam.

**Deployment:** GitHub Pages — static standalone PWA. `npm install && npm run build` → deploy `dist/`.
**Storage:** Pure `localStorage` — **never** `window.storage`, never Supabase, never external auth.
**Deps:** react 19, react-dom, ts-fsrs v5, lz-string. **Max 4 prod deps — hard constraint.**

### Branding
- **Parent:** Nugget Nihongo · **Product:** SSW Konstruksi
- **Subtitle:** 土木 · 建築 · ライフライン設備

### 3 Study Tracks
| Track | JP | Categories |
|-------|----|-----------| 
| Teknik Sipil 🏗️ | 土木 | jenis_kerja, alat_umum + common |
| Bangunan 🏢 | 建築 | jenis_kerja, alat_umum + common |
| Lifeline ⚡ | ライフライン・設備 | listrik, pipa, telekomunikasi, isolasi, pemadam + common |
| **Common** 📋 | 共通 | salam, hukum, keselamatan, karier (all tracks) |

---

## 2. Directory Structure

```
Nugget-Nihongo-SSW-Konstruksi/
├── _MAP.md                         ← YOU ARE HERE
├── CHANGELOG.md
├── README.md
├── HUSKY-SETUP.md                  ← FE-07-B: one-time pre-commit setup (user runs, not CI)
├── index.html
├── package.json                    ← v4.19.0 · react, react-dom, ts-fsrs, lz-string (4 prod deps)
├── vite.config.js                  ← base: /Nugget-Nihongo-SSW-Konstruksi/ · alias @→src
├── vitest.config.js                ← coverage thresholds 70%/60% · alias @→src (matches vite)
├── eslint.config.js
├── .prettierrc / .prettierignore
├── .gitignore                      ← outputs/, coverage/, stats.html, .env.* now excluded
├── .npmrc
├── public/
│   ├── manifest.webmanifest        ← PWA manifest
│   ├── sw.js                       ← SW: cache-first + SW_UPDATED postMessage on activate (FE-08-B)
│   └── icons/
├── .github/workflows/
│   ├── ci.yml                      ← lint + test (verbose) + build + build output check
│   └── deploy.yml                  ← validate → merge-cards → bump SW → build → pages deploy
├── docs/
│   ├── BLUEPRINT-CURRENT.md        ← active: post-completion status + open items
│   ├── archive/ARCHIVE-INDEX.md    ← index of all 15 historical docs
│   ├── archive/                    ← old blueprints v3–v6, proposals, audit docs (all executed)
│   └── seeds/                      ← sipil/bangunan seed JS (superseded by src/data/)
├── scripts/
│   ├── merge-cards.mjs             ← ACTIVE: deploy.yml assembles cards.js from source/
│   ├── audit-integrity.mjs         ← ACTIVE: npm run audit:integrity
│   └── archive/                    ← one-shot CS-01–05 migration scripts (do not re-run)
│       └── README.md
├── legacy/
│   └── ssw_flashcards_v87.jsx      ← Historical reference; not part of build
└── src/
    ├── types.js                    ← FE-07-C: JSDoc typedefs (Card, SRSState, Tab, ToastItem…)
    ├── main.jsx
    ├── App.jsx                     ← Root; per-tab ErrorBoundary; OfflineBanner; SW_UPDATED listener (FE-05-A/B, FE-08-B)
    ├── contexts/
    │   ├── AppContext.jsx           ← track, theme, nav, toast, prefs, setPref
    │   ├── ProgressContext.jsx      ← known/unknown/starred/streak/sessions/toastQueue
    │   └── SRSContext.jsx
    ├── data/
    │   ├── index.js                ← barrel re-export
    │   ├── cards.js                ← CARDS[1443] (assembled from source/ by merge-cards.mjs)
    │   ├── source/                 ← 8 track source files (CS-01)
    │   │   ├── cards-common.js, cards-common-vocab.js     ← 646 + 233 cards (includes migrated doboku/kenchiku)
    │   │   ├── cards-doboku.js, cards-doboku-vocab.js     ← empty [] (pending Ch.5+ sipil content)
    │   │   ├── cards-kenchiku.js, cards-kenchiku-vocab.js ← empty [] (pending Ch.5+ bangunan content)
    │   │   └── cards-lifeline.js, cards-lifeline-vocab.js ← 444 lifeline cards (text1l–text3l)
    │   ├── jac-teori.js            ← 65 学科 questions (tt1+tt2), track:'common'
    │   ├── jac-lifeline.js         ← 30 実技 questions (st1+st2), track:'lifeline'
    │   ├── jac-doboku.js           ← empty stub (pending sipil 実技 PDF)
    │   ├── jac-kenchiku.js         ← empty stub (pending bangunan 実技 PDF)
    │   ├── jac-official.js         ← backward-compat shim ([...JAC_TEORI, ...JAC_LIFELINE, ...])
    │   ├── quiz-sets.js            ← merged WAYGROUND_SETS + CSV_SETS; getQuizSetsForTrack() helper
    │   ├── wayground-sets.js       ← legacy source (still imported by quiz-sets.js)
    │   ├── csv-sets.js             ← legacy source (still imported by quiz-sets.js)
    │   ├── sipil-sets.js           ← 3 sets, 45 questions
    │   ├── bangunan-sets.js        ← 3 sets, 45 questions
    │   ├── angka-kunci.js          ← 29 entries with track, mnemonic, soal fields
    │   ├── confusion-pairs.js      ← 28 confusion pairs for ConfusionMode (音/字/意 types)
    │   ├── danger-pairs.js         ← 20 pairs with track, confusionType, explanation fields
    │   └── categories.js
    ├── srs/
    │   ├── fsrs-core.js
    │   ├── fsrs-store.js
    │   ├── fsrs-scheduler.js
    │   └── index.js                ← barrel
    ├── storage/
    │   ├── schema.js               ← STORAGE_VERSION=3, DEFAULTS
    │   ├── engine.js               ← 3-doc R/W, v2→v3 migration, validateSnapshot
    │   ├── migrations.js
    │   └── index.js                ← barrel
    ├── hooks/
    │   ├── useAnswerStreak.js
    │   ├── useDebounce.js          ← FE-05-C: 120ms input debounce
    │   ├── useFocusTrap.js         ← FE-04-C: Tab/Shift+Tab cycle, focus restore on unmount
    │   ├── usePersistedState.js
    │   ├── useQuizKeyboard.js
    │   ├── useSRS.js
    │   └── index.js                ← barrel (all 6 hooks exported)
    ├── components/
    │   ├── Dashboard.jsx           ← Mission card + exam countdown (Phase C, F)
    │   ├── BelajarTab.jsx
    │   ├── SayaTab.jsx             ← examDate + audioEnabled + PWA install prompt (Phase F, FE-08-A)
    │   ├── BottomNav.jsx           ← View Transitions API tab switch (FE-09-C); badge aria-label
    │   ├── ErrorBoundary.jsx       ← FE-05-A: class EB + TabError + FlatCardFallback exports
    │   ├── OfflineBanner.jsx       ← FE-05-B: fixed banner, online/offline listeners
    │   ├── QuizShell.jsx           ← sr-only live region + kbHint (FE-04-A/B)
    │   ├── ResultScreen.jsx
    │   ├── JpDisplay.jsx           ← furiganaPolicy + 🔊 audio button (Phase E, F)
    │   ├── OptionButton.jsx        ← haptic.correct/wrong on answer (FE-09-A)
    │   ├── ProgressBar.jsx
    │   ├── ProgressRing.jsx        ← role="img" + aria-label (FE-04-A)
    │   ├── Toast.jsx               ← swipe-dismiss + type prop + aria-live per type (FE-05-D)
    │   ├── TrackPicker.jsx         ← useFocusTrap + role="dialog" aria-modal (FE-04-C)
    │   ├── FilterPopup.jsx, ConfirmDialog.jsx
    │   ├── EmptyState.jsx, Skeleton.jsx
    │   ├── Onboarding.jsx
    │   ├── MissionCompleteOverlay.jsx
    │   ├── StudyHeatmap.jsx        ← 18-week SVG activity heatmap (ST1, v4.3.1)
    │   └── *.module.css            ← all have @media (prefers-reduced-motion) blocks (FE-02)
    ├── modes/
    │   ├── FlashcardMode.jsx       ← re-export shim → FlashcardMode/index.jsx
    │   ├── FlashcardMode/          ← decomposed (Phase E)
    │   │   ├── index.jsx           ← orchestrator; FlipCard in ErrorBoundary (FE-05-A)
    │   │   ├── FlipCard.jsx        ← haptic.flip() on card tap (FE-09-A); aria-live
    │   │   ├── RatingRow.jsx       ← haptic.tap() on rating (FE-09-A)
    │   │   ├── ToolStrip.jsx
    │   │   ├── FilterBar.jsx
    │   │   └── flashcard.module.css
    │   ├── ReviewMode.jsx          ← FSRS due-card review
    │   ├── QuizMode.jsx
    │   ├── SprintMode.jsx, FocusMode.jsx
    │   ├── JACMode.jsx, WaygroundMode.jsx, VocabMode.jsx
    │   ├── SimulasiMode.jsx        ← CSS module (FE-01-B)
    │   ├── AngkaMode.jsx           ← CSS module (FE-01-A)
    │   ├── DangerMode.jsx          ← CSS module (FE-01-A)
    │   ├── StatsMode.jsx           ← CSS module (FE-01-B)
    │   ├── GlossaryMode.jsx        ← CSS module (FE-01-C); IntersectionObserver intact
    │   ├── SipilMode.jsx, BangunanMode.jsx
    │   ├── ProductionMode.jsx      ← ID→JP active recall with text input (v4.2.0)
    │   ├── ConfusionMode.jsx       ← 28 confusion pairs VLT-style (音/字/意) (v4.2.0)
    │   ├── SearchMode.jsx          ← useDebounce applied (FE-05-C); track-aware; SR1 history + SR3 copy (v4.8.x)
    │   ├── DengarMode.jsx          ← audio-first listening quiz; wrong-tracker write (v4.4.0, D1-WT v4.8.1)
    │   ├── CatatanMode.jsx         ← personal notes/mnemonics per card (v4.4.0)
    │   ├── QuizProduksiMode.jsx    ← JP→ID type-answer production quiz, fuzzy match (v4.5.0)
    │   ├── ExportMode.jsx          ← Gist sync section (v4.6.0)
    │   ├── SumberMode.jsx          ← progress bar + Terlemah badge (v4.8.0)
    │   └── modes.module.css        ← shared mode styles
    ├── router/
    │   ├── ModeRouter.jsx          ← focus mgmt + scroll restoration on mode change (FE-04-D, FE-09-B)
    │   └── modes.js
    ├── utils/
    │   ├── daily-mission.js
    │   ├── haptic.js               ← FE-09-A: tap/correct/wrong/success/flip (Vibration API)
    │   ├── speak.js                ← Web Speech API + HVPT cycling (Phase F)
    │   ├── jp-helpers.js
    │   ├── quiz-generator.js
    │   ├── shuffle.js
    │   ├── wrong-tracker.js
    │   ├── achievements.js         ← 14 achievement badges (v4.3.1)
    │   ├── daily-challenge.js      ← date-seeded daily challenge question (v4.3.1)
    │   ├── recommend-mode.js       ← smart mode recommendation engine (v4.3.1)
    │   ├── gist-sync.js            ← GitHub Gist sync helper (v4.6.0)
    │   └── index.js                ← barrel (all utils + haptic + speak exported)
    ├── styles/
    │   └── global.css              ← design tokens (FE-03): spacing, shadow, z-index, transitions
    │                               ← .sr-only utility (FE-04-A)
    │                               ← View Transitions ::view-transition rules (FE-09-C)
    │                               ← token audit comment block
    └── tests/                      ← 35 test files, 387 tests
        ├── setup.js
        ├── BottomNav.test.jsx      ← FE-06: 7 tests
        ├── ResultScreen.test.jsx   ← FE-06: 7 tests
        ├── Toast.test.jsx          ← FE-06: 8 tests
        └── [32 existing test files]
```

---

---

## 3. Current Metrics

| Metric | Value |
|--------|-------|
| Version | **4.21.0** |
| Tests | **448** (40 files) |
| Prod dependencies | **4** (react, react-dom, ts-fsrs, lz-string) |
| Modes | **23** (all React.lazy) |
| Flashcards | **1,443** |
| Quiz questions | **~974** (JAC 95 + Wayground 579 + CSV 300 — all in SimulasiMode pool) |
| Storage schema | **v3** |
| localStorage docs | **3** (progress, srs, prefs) |
| CI/CD | ✅ GitHub Actions (auto-deploy) |
| SW auto-bump | ✅ deploy.yml |
| CSS modules | ✅ all mode components migrated (FE-01) |
| Reduced motion | ✅ 7 CSS files covered (FE-02) |
| A11y | ✅ aria-live, focus trap, sr-only, View Transitions (FE-04, FE-09-C) |

---

## 4. Phase History (Summary)

All phases complete. See `docs/BLUEPRINT-CURRENT.md` for full deliverable table.

| Version(s) | What Shipped |
|-----------|-------------|
| v3.7–4.0.0 | Core app: phases A–G (storage v3, content, daily mission, export, audio, QA) |
| v4.0.x | CS-01–05: content standardization (split, type, ruby, re-annotation) |
| v4.1.0 | FE-01–09: CSS modules, a11y, PWA, haptics, design tokens |
| v4.2–4.9 | 23 modes, Phase 5.1–5.8 feature batches, lz-string compression |
| v4.10–4.14 | Feature polish: JACMode SRS bridge, GlossaryMode Anki export, JAC topic tags |
| v4.15–4.17 | Content: JAC audit (23 fixes), C1 text3 +18 cards, C1 pass2 +15 cards |
| v4.18 | Refactor: 157 doboku/kenchiku cards → common |
| v4.19.0 | Data layer: JAC split, quiz-sets merge, track fields on all datasets |
| v4.19.1–4.19.5 | Hygiene: SOURCE_GROUPS fix, track field bugs, CSV pool, SearchMode fix, stale counts |

---

## 5. Key Design Rules (Hard Constraints)

1. **Pure localStorage** — Never `window.storage`, Supabase, external auth
2. **Max 4 prod deps** — react, react-dom, ts-fsrs, lz-string
3. **All 23 modes stay React.lazy()** — no reverting lazy-loading
4. **UI language: Indonesian** — Code comments: English
5. **Zero network required** — Full offline PWA
6. **Tests must pass** — `npm test` green before every commit
7. **Build must succeed** — `npm run build` clean
8. **Lint clean** — `npm run lint` zero errors/warnings

---

## 6. Storage Schema v3

```js
DOCS = { progress: 'ssw-progress', srs: 'ssw-srs-data', prefs: 'ssw-prefs' }

progress: { _v:3, known[], unknown[], starred[], quizWrong{}, wrongCounts{},
            wgWrong{}, vocabWrong{}, jacScores{}, wgScores{}, vocabScores{},
            sipilScores{}, bangunanScores{},
            streakData{}, dailyCount{}, recentCards[],
            milestoneStreak7, milestoneQuiz70,
            sessions[],                               // cap 180 (bumped v4.4.0)
            dailyMission }

prefs:    { _v:3, track, theme, onboarded, tutorialFlashcard, lastMode,
            dailyGoal, flashcardHintCount,
            examDate, audioEnabled, studyAnchor, furiganaPolicy,
            notes: {},                     // D3: personal notes per cardId (v4.4.0)
            sprintBestTimeline: [] }       // F4: ghost score timeline for Sprint (v4.6.0)

srs:      { _v:3, cards: { [cardId]: { card, history, reviewed_at } } }
```

---

---

## 7. Notable Files Added Since v4.0.0

### Data (v4.0.x → v4.19.0)
| File | Purpose |
|------|---------|
| `src/data/source/` (8 files) | CS-01 split: cards-common.js + vocab, cards-lifeline.js + vocab, stubs for doboku/kenchiku |
| `src/data/angka-kunci.js` | 29 entries with track, mnemonic, soal fields |
| `src/data/confusion-pairs.js` | 28 VLT-style confusion pairs (音/字/意) |
| `src/data/danger-pairs.js` | 20 pairs with confusionType, explanation, track fields |
| `src/data/sipil-sets.js` / `bangunan-sets.js` | 3 sets × 45qs each for Sipil/Bangunan tracks |
| `src/data/jac-teori.js` | 65 学科 questions (tt1+tt2), track:'common' — split from jac-official.js (v4.19.0) |
| `src/data/jac-lifeline.js` | 30 実技 Lifeline questions (st1+st2), track:'lifeline' (v4.19.0) |
| `src/data/jac-doboku.js` / `jac-kenchiku.js` | Empty stubs for future 実技 content |
| `src/data/jac-official.js` | Backward-compat shim: `[...JAC_TEORI, ...JAC_LIFELINE, ...]` |
| `src/data/quiz-sets.js` | Merged QUIZ_SETS = WAYGROUND_SETS + CSV_SETS; getQuizSetsForTrack() helper (v4.19.0) |
| `src/data/categories.js` | CATEGORIES, SOURCE_META (incl. text3l/vocab-supplementary/vocab-general), SOURCE_GROUPS (4 groups), SOURCE_ACCENT |

### Source/Utils (v4.0.x → v4.19.0)
| File | Purpose |
|------|---------|
| `src/types.js` | JSDoc typedefs (Card, SRSState, Tab, ToastItem) |
| `src/utils/haptic.js` | Vibration API: tap/correct/wrong/success/flip |
| `src/utils/achievements.js` | 14 achievement badges |
| `src/utils/daily-challenge.js` | Date-seeded daily challenge from JAC+QUIZ_SETS pool |
| `src/utils/recommend-mode.js` | Smart mode recommendation engine |
| `src/utils/gist-sync.js` | GitHub Gist sync helper |
| `src/hooks/useDebounce.js` | 120ms debounce for search inputs |
| `src/hooks/useFocusTrap.js` | Tab/Shift+Tab cycle + focus restore |
| `src/components/ErrorBoundary.jsx` | Class-based EB + TabError + FlatCardFallback |
| `src/components/OfflineBanner.jsx` | Fixed offline status banner |
| `src/components/StudyHeatmap.jsx` | 18-week SVG activity heatmap |

### Modes (v4.2.0 → v4.5.0)
| File | Purpose |
|------|---------|
| `src/modes/ProductionMode.jsx` | ID→JP active recall (text input) |
| `src/modes/ConfusionMode.jsx` | 28 confusion pairs VLT-style |
| `src/modes/DengarMode.jsx` | Audio-first listening comprehension quiz |
| `src/modes/CatatanMode.jsx` | Personal notes/mnemonics per card |
| `src/modes/QuizProduksiMode.jsx` | JP→ID type-answer production quiz, fuzzy match |

---

## 8. Agent Session Log

| Date | Version | Work |
|------|---------|------|
| 2026-05-09 | v4.21.1 | Sonnet 4.6: OVERHAUL-1 retire usePersistedState (3 sites → useProgress); ENG-4 WaygroundMode engine read; ENG-6 ExportMode richer summary; 457 tests (41 files) |
| 2026-05-09 | v4.21.1 | Sonnet 4.6: OVERHAUL-1 retire usePersistedState (3 sites → useProgress); ENG-4 WaygroundMode engine read; ENG-6 ExportMode richer summary; 457 tests (41 files) |
| 2026-05-09 | v4.21.0 | Sonnet 4.6: REF-8 merge vocab sources (8→4); REF-9 absorb sipil/bangunan into quiz-sets.js; C1-C9 integrity tests (448 tests, 40 files) |
| 2026-05-09 | v4.20.15 | Sonnet 4.6: ENG-11 useTrackedCards hook; 6 new tests (439 total, 39 files) |
| 2026-05-09 | v4.20.14 | Sonnet 4.6: REF-11 parseDescStructure; DescBlock useMemo; JpFront jpBranch useMemo |
| 2026-05-09 | v4.20.13 | Sonnet 4.6: REF-10 AppContext+ProgressContext+SRSContext useMemo; ENG-13 marker; 432 tests |
| 2026-05-09 | v4.20.12 | Sonnet 4.6: ENG-12 storage-quota.js; engine.js writeDoc quota handling; App.jsx handler registration |
| 2026-05-09 | v4.20.11 | Sonnet 4.6: N24 VocabMode QUIZ_SETS; N25 JACMode+SimulasiMode barrel import |
| 2026-05-09 | v4.20.10 | Sonnet 4.6: DB-1 photo banner in QuizShell; DB-6 empty track categories → placeholder; DB-7 intentional null kartu annotated; DB-8 covered by ENG-9 |
| 2026-05-09 | v4.20.9 | Sonnet 4.6: DB-2 JACMode filterIds guard; DB-3/4/5 data headers; ENG-9 validate-data.mjs prebuild hook; ENG-10 audit-related-ids.mjs; patched 22 broken JAC refs + 3 ANGKA_KUNCI refs → null |
| 2026-05-09 | v4.20.8 | Sonnet 4.6: R1 ReviewMode dead state; R2 Dashboard streak/dailyCount from context; F1 starred quiz btn; F2 SumberMode produksi/kuisprod; F4 migration toast; N10 SprintMode duration-keyed bests; test fix ProgressProvider |
| 2026-05-09 | v4.20.7 | Sonnet 4.6: ENG-5 useDailyChallenge hook; N5 SayaTab sessionStorage→engine; dailyChallengeLog in DEFAULTS.prefs; 429 tests |
| 2026-05-09 | v4.20.6 | Sonnet 4.6: N3 ProductionMode recordWrong; N7 JACMode wrongCounts engine; N16 QuizProduksi recordWrong; REF-3 VocabMode/WaygroundMode wrong via engine; N20+REF-3b saveScore all 3 modes; N11 sprintBests DEFAULTS; R3 FocusMode _unknown removed |
| 2026-05-01 | — | Opus 4.6 (Crunchy): Blueprint v6 — full codebase audit |
| 2026-05-02 | v4.0.0 | Sonnet 4.6: Phases A–G (storage v3, content, daily mission, export, audio, QA) |
| 2026-05-03–04 | v4.0.2 | Sonnet 4.6 + Codex: furigana chain, ruby rendering, ReviewMode, post-Codex cleanup |
| 2026-05-07 | v4.1.0–4.2.0 | Sonnet 4.6: FE-01–09 frontend polish, hygiene passes, ProductionMode + ConfusionMode |
| 2026-05-07 | v4.3.0 | Sonnet 4.6: Phase 5.1 (SIM1, BUG-06, ST2) |
| 2026-05-08 | v4.3.1–4.9.0 | Sonnet 4.6: Phases 5.3–5.8 — achievements, heatmap, lz-string, DengarMode, CatatanMode, Gist sync, Sprint ghost, 23 modes total |
| 2026-05-08 | v4.10.0–4.14.0 | Sonnet 4.6: Feature batches — JACMode SRS bridge, SumberMode actions, GlossaryMode Anki export, JAC topic tags |
| 2026-05-08 | v4.15.x–4.17.0 | Sonnet 4.6: JAC content audit (23 fixes), C1 text3 +18 cards, C1 pass2 +15 cards |
| 2026-05-08 | v4.18.0–4.19.0 | Sonnet 4.6: Refactors — doboku/kenchiku→common; JAC split; quiz-sets merge; track fields |
| 2026-05-09 | v4.20.5 | Sonnet 4.6: OVERHAUL-2 useSessionTimer; N6/N21 durationMs all 14 sites; N22 recordWrong makeWrongEntry; N14 buildAllQuestions hoist; B4 maintenance rotation; 429 tests |
| 2026-05-09 | v4.20.4 | Sonnet 4.6: ENG-3 MODE_META color+strand; F3 StatsMode MODE_META.color; B2+REF-4 daily-mission MISSION_TYPES |
| 2026-05-09 | v4.20.3 | Sonnet 4.6: ENG-1 session-analytics.js; B3 StatsMode calcReadiness; N2 recommend-mode getAvgAccuracy; N4 achievements getAvgAccuracy; ENG-7 13 new tests (429 total) |
| 2026-05-09 | v4.20.2 | Sonnet 4.6: ENG-2 constants.js, N15 SESSIONS_CAP, N19 SRS_MATURE_DAYS, B5 calcReadiness ×100 removed, B1 achievement thresholds corrected |
| 2026-05-09 | v4.20.1 | Sonnet 4.6: REF-6 date.js (local tz UTC fix), N13 ProgressContext streak, N9 daily files, N18 StudyHeatmap, Dashboard; ENG-8 date.test.js (416 tests, 36 files) |
| 2026-05-09 | v4.20.0 | Sonnet 4.6: P0 bugs — VocabMode X1 (MIX_ALL inside component + VOCAB_SETS memoized), SprintMode X2 (quizWrong→progress doc), AngkaMode+DangerMode import alias crashes, WaygroundMode React Compiler rule off |
| 2026-05-09 | v4.19.1–4.19.5 | Sonnet 4.6: 5 hygiene passes — C1 closure; SOURCE_GROUPS fix; track bugs (wt1-10, csv-sets); SimulasiMode+daily-challenge CSV pool; +24 tests; SearchMode wrongCount fix; barrel clean; stale counts |
