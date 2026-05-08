# 🗺️ _MAP.md — SSW Konstruksi · Agent Orientation

> **Last updated:** 2026-05-09 by Agent Sonnet 4.6 (v4.19.3: +24 tests for track fields/QUIZ_SETS/SOURCE_GROUPS)
> **Version:** v4.19.3 — +24 data tests; blueprint synced
> **Blueprint:** `docs/BLUEPRINT-CURRENT.md` ← **READ THIS** (post-completion: open items, constraints, schema)
> **Upgrade Proposal:** `docs/archive/SSW_UPGRADE_PROPOSAL_v1.md` ← **ARCHIVED** — all 71 items resolved by v4.14.0; E2 & C2 dismissed
> **Old blueprint:** `docs/archive/MASTER-BLUEPRINT-v6.md` (all phases executed — archived 2026-05-07)

---

## 1. What This App Is

A React PWA study tool for the **JAC SSW Construction exam** (Japan). Interface in **Indonesian**, content **Japanese↔Indonesian bilingual**. Targets Indonesian construction workers studying for the SSW visa exam.

**Deployment:** GitHub Pages — static standalone PWA. `npm install && npm run build` → deploy `dist/`.
**Storage:** Pure `localStorage` — **never** `window.storage`, never Supabase, never external auth.
**Deps:** react 19, react-dom, ts-fsrs v5, Vite 6. **Max 4 prod deps — hard constraint.**

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

## 3. Current Metrics

| Metric | Value |
|--------|-------|
| Version | **4.19.3** |
| Tests | **411** (35 files) |
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

## 4. Phase History

| Phase | Name | Status |
|-------|------|--------|
| A | Bug Fixes + Storage v3 + Debt Cleanup | ✅ v3.7.0 |
| B | Content: Sipil & Bangunan | ✅ v3.8.0 |
| C | Daily Mission + Session Analytics | ✅ v3.8.0 |
| D | Export/Import Hardening | ✅ v3.9.0 |
| E | FlashcardMode Decomposition | ✅ v3.9.0 |
| F | Exam Countdown + Audio | ✅ v4.0.0 |
| G | QA + Polish + Release | ✅ v4.0.0 |
| CS-01–05 | Content Standardization (split, type, ruby, quote, re-annotation) | ✅ v4.0.x |
| FE-01–09 | CSS Modules · A11y · Robustness · DX · PWA · UX | ✅ v4.1.0 |
| Phase 5.1 | Critical Gaps: R1 ReviewSummary, A1 WrongBridge, K1 SwipeGesture, SIM1 Pause, BUG-06 Pool, ST2 Readiness, E1 SWUpdate, S5/BUG-07 Sprint wrong-tracker | ✅ v4.3.0 |
| Phase 5.3 | Mode Enhancements: B2 SprintCategory, SIM3+SIM4 PostExam, F1 Achievements, F2 DailyChallenge | ✅ v4.3.1 |
| Phase 5.4 | Polish & Infra: ST1 Heatmap, A2 SmartRecommend, E4 lz-compression | ✅ v4.3.1 |
| Phase 5.5 | Unfinished items: D1 DengarMode, D3 CatatanMode, A3 Breadcrumb, sessions cap 180, lint fixes | ✅ v4.4.0 |
| Phase 5.6 (B1) | Kuis Produksi: JP→ID type-answer mode (QuizProduksiMode), 7 tests | ✅ v4.5.0 |
| Phase 5.7 (W2) | WaygroundMode per-set Ulang Salah mode | ✅ v4.7.0 |
| Phase 5.8 | UX Polish: SR1 search history, G1 glossary audio, SB1/SB2 sumber progress, W3 Baru badge, R2 due reason, J3 best score | ✅ v4.8.0 |
| v4.8.1 | DengarMode wrong-tracker (D1-WT) — writes to shared quizWrong pool | ✅ v4.8.1 |
| v4.8.2 | SR3 copy-to-clipboard in SearchMode; SIM5 pace hint in SimulasiMode | ✅ v4.8.2 |
| Phase 5.9 | R3 speakOnFlip, R4 skip card, R5 remaining count, W1 group desc, W4 total score, Q4 quiz count persist, SR4 accuracy badges, ST4 week comparison | ✅ v4.9.0 |
| v4.10.0 | J1 JACMode→SRS; K2 FlashcardMode read-only toggle; SB3 SumberMode per-source actions; Q5 QuizMode category filter | ✅ v4.10.0 |
| v4.11.0 | StatsMode catList fix; D2 DangerMode confusionType+filter; D3 wrong-tracker; AK1 AngkaMode mnemonic+TypeQuiz; G2 GlossaryMode compact toggle; K5 add-to-SRS | ✅ v4.11.0 |
| v4.12.0 | Q3 difficulty detail; F2/F3 FocusMode auto-advance+progress; D1 danger explanation; G4 glossary nav keys; W5 suggested next; AK2 soal field; E3 SRS delta; K6 category pill filter | ✅ v4.12.0 |
| v4.13.0 | G3 GlossaryMode export mini deck — select mode + Anki TSV download | ✅ v4.13.0 |
| v4.14.0 | J4 topic field on all 95 JAC questions (8 topics); J2 JACMode topic filter + Simulasi per Topik | ✅ v4.14.0 |
| v4.15.x | JAC content audit: 17 furi/desc fixes jac-ch2; 6 furi fixes jac-ch1 (KY acronym) | ✅ v4.15.1 |
| v4.16.0 | C1 text3.pdf: 18 new lifeline cards 1439–1456 (text3l source) | ✅ v4.16.0 |
| v4.17.0 | C1-pass2: 15 new common cards 1457–1471 from text1l/text2/text3 | ✅ v4.17.0 |
| v4.18.0 | refactor: 157 doboku+kenchiku cards → common; source files emptied for Ch.5+ | ✅ v4.18.0 |
| v4.19.0 | refactor: JAC split (jac-teori/jac-lifeline/stubs); quiz-sets.js merged; track fields on danger-pairs + angka-kunci; components filter by track | ✅ v4.19.0 |

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

## 7. Notable New Files (v4.0.2 → v4.14.0)

| File | Purpose |
|------|---------|
| `src/types.js` | JSDoc typedefs for Card, SRSState, Tab, ToastItem, etc. |
| `src/utils/haptic.js` | Vibration API patterns: tap/correct/wrong/success/flip |
| `src/hooks/useDebounce.js` | 120ms debounce for search inputs |
| `src/hooks/useFocusTrap.js` | Tab/Shift+Tab cycle + focus restore for dialogs |
| `src/components/ErrorBoundary.jsx` | Class-based EB + TabError + FlatCardFallback |
| `src/components/OfflineBanner.jsx` | Fixed offline status banner |
| `src/components/OfflineBanner.module.css` | Banner styles with slideDown + reduced-motion |
| `src/modes/*.module.css` (×6) | DangerMode, AngkaMode, SimulasiMode, StatsMode, ReviewMode, GlossaryMode |
| `src/tests/BottomNav.test.jsx` | 7 render/aria tests |
| `src/tests/ResultScreen.test.jsx` | 7 render/interaction tests |
| `src/tests/Toast.test.jsx` | 8 tests incl. fake timers + type-aware aria-live |
| `HUSKY-SETUP.md` | One-time pre-commit hook setup instructions |

### New Files Since v4.3.0

| File | Purpose |
|------|---------|
| `src/utils/achievements.js` | 14 achievement badges — `buildAchievementState()` + `evaluateAchievements()` |
| `src/utils/daily-challenge.js` | Deterministic date-seeded daily challenge question from JAC+Wayground pool |
| `src/utils/recommend-mode.js` | Smart mode recommendation engine — replaces `getQuickStart` in Dashboard |
| `src/components/StudyHeatmap.jsx` | 18-week SVG activity heatmap (126 days, amber opacity scale) |
| `src/modes/DengarMode.jsx` | Audio-first listening comprehension quiz (v4.4.0) |
| `src/modes/CatatanMode.jsx` | Personal notes/mnemonics per card, filterable (v4.4.0) |
| `src/modes/QuizProduksiMode.jsx` | JP→ID type-answer production quiz with fuzzy match (v4.5.0) |
| `src/utils/gist-sync.js` | GitHub Gist sync helper — push/pull/find for multi-device backup (v4.6.0) |
| `src/tests/quiz-produksi.test.jsx` | 7 tests for QuizProduksiMode (v4.5.0) |

### New Files Since v4.14.0

| File | Purpose |
|------|---------|
| `src/data/jac-teori.js` | 65 学科 questions split from jac-official (v4.19.0) |
| `src/data/jac-lifeline.js` | 30 Lifeline 実技 questions split from jac-official (v4.19.0) |
| `src/data/jac-doboku.js` | Empty stub for sipil 実技 (v4.19.0) |
| `src/data/jac-kenchiku.js` | Empty stub for bangunan 実技 (v4.19.0) |
| `src/data/quiz-sets.js` | Merged WAYGROUND_SETS + CSV_SETS with `getQuizSetsForTrack()` (v4.19.0) |

> **Current counts:** ANGKA_KUNCI = 29 (common: 22, lifeline: 7); DANGER_PAIRS = 20 (common: 12, lifeline: 8)

---

| Date | Agent | Work |
|------|-------|------|
| 2026-05-01 | Opus 4.6 (Crunchy) | Blueprint v6 — full codebase audit, self-contained spec |
| 2026-05-02 | Sonnet 4.6 | Phase A: bug fixes, storage v3, debt cleanup |
| 2026-05-02 | Sonnet 4.6 | Phase B+C: sipil/bangunan content, daily mission, sessions |
| 2026-05-02 | Sonnet 4.6 | Phase D+E: export hardening, FlashcardMode decomposition |
| 2026-05-02 | Sonnet 4.6 | Phase F+G: exam countdown, audio, QA, release v4.0.0 |
| 2026-05-03 | Sonnet 4.6 | B1–B4+M1–M3: furigana chain, session recording, sprint PB, glossary track-aware |
| 2026-05-04 | Sonnet 4.6 | C1–C6: ReviewMode audio, track-aware search, StatsMode SRS+streak |
| 2026-05-04 | Codex (Sonnet) | D1–D10: SayaTab inline edit, QuizMode furigana, MissionOverlay, SearchMode star |
| 2026-05-04 | Codex (Sonnet) | fix(JpDisplay): native ruby rendering + tap-to-reveal furigana |
| 2026-05-04 | Sonnet 4.6 | post-Codex cleanup: wrapInteractive, ReviewMode session, stale branch cleanup |
| 2026-05-07 | Sonnet 4.6 | FE-01–09: CSS modules, reduced motion, design tokens, a11y, error boundaries, offline banner, debounce, toast upgrade, 22 new tests, path alias, types, PWA install, SW update toast, haptics, scroll restore, View Transitions |
| 2026-05-07 | Sonnet 4.6 | Hygiene pass 1: outputs/ untracked, stale branch deleted, barrel exports, gitignore, CI improved, version → 4.1.0, _MAP + CHANGELOG updated |
| 2026-05-07 | Sonnet 4.6 | Hygiene pass 2: blueprint archived → BLUEPRINT-CURRENT.md; README rewritten; ARCHIVE-INDEX created; one-shot scripts → scripts/archive/; duplicate ResultScreen.test removed; CHANGELOG compacted 739→326 lines; eslint/prettier ignore scripts/archive/ |
| 2026-05-07 | Sonnet 4.6 | v4.2.0: fixed BottomNav.test + Toast.test CSS module mock (vi.mock → default Proxy); bumped to 20 modes; docs updated (MAP, BLUEPRINT-CURRENT, CHANGELOG) |
| 2026-05-07 | Sonnet 4.6 | v4.3.0 Phase 5.1 complete: SIM1 (pause + auto-pause), BUG-06 (JAC+Wayground pool merge), ST2 (Exam Readiness gauge in StatsMode). 376/376 tests. |
| 2026-05-08 | Sonnet 4.6 | v4.3.1 Phase 5.1–5.4: BUG-05/08/10/11 fixed; B2 SprintMode category+duration+escalation; SIM3+SIM4 post-exam analysis; F1 achievements (14 badges); F2 daily challenge; ST1 heatmap; A2 smart recommendation; E4 lz-string compression. 376/376 tests. |
| 2026-05-08 | Sonnet 4.6 | v4.4.0 Phase 5.5: D1 DengarMode (listening comprehension); D3 CatatanMode (personal notes per card); A3 breadcrumb nav; sessions cap 90→180; lint fixes (StudyHeatmap, FlashcardMode). 376/376 tests. |
| 2026-05-08 | Sonnet 4.6 | v4.5.0 B1: QuizProduksiMode — JP→ID type-answer production quiz, fuzzy match, wrong-tracker, audio. 383/383 tests. |
| 2026-05-08 | Sonnet 4.6 | v4.6.0 E2/F4/ST3: Gist sync (ExportMode), Sprint ghost score (F4 Battle Past Self), quiz accuracy per category in StatsMode. 383/383 tests. |
| 2026-05-08 | Sonnet 4.6 | v4.7.0 W2: WaygroundMode per-set "Ulang Salah" sub-button + lemahMode filter. ST5 confirmed already complete. |
| 2026-05-08 | Sonnet 4.6 | v4.8.0 Phase 5.8: SR1 search history (sessionStorage), G1 glossary audio, SB1/SB2 sumber progress bar + terlemah badge, W3 "Baru" badge for untouched sets, R2 ReviewMode due-reason chip, J3 JACMode best score. |
| 2026-05-08 | Sonnet 4.6 | v4.8.1: DengarMode wrong-tracker (D1-WT) — wrong answers now written to shared quizWrong pool. Modes with wrong-tracker: 10→11/15. |
| 2026-05-08 | Sonnet 4.6 | v4.8.2: SR3 copy-to-clipboard in SearchMode (⎘ button per result); SIM5 pace hint in SimulasiMode (soal/mnt below timer). |
| 2026-05-08 | Sonnet 4.6 | v4.9.0 open items: R3 speakOnFlip, R4 skip card, R5 remaining count, W1 group desc, W4 total score, Q4 quiz count persist, SR4 search accuracy badges, ST4 week comparison. |
| 2026-05-08 | Sonnet 4.6 | v4.10.0: J1 JACMode→SRS (wrong answers queue related flashcards); K2 FlashcardMode read-only toggle; SB3 SumberMode Kartu/Sprint/Kuis per-source actions + filterIds to sprint/kuis; Q5 QuizMode category filter. |
| 2026-05-08 | Sonnet 4.6 | v4.11.0: StatsMode catList wrapper fix (BUG from v4.9.0); D2 DangerMode confusionType + filter chips + wrong-tracker; AK1 AngkaMode mnemonic field (all 28) + TypeQuizView; G2 GlossaryMode compact/expanded toggle; K5 FlashcardMode add-to-SRS button. |
| 2026-05-08 | Sonnet 4.6 | v4.12.0: Q3 difficulty detail; F2 FocusMode auto-advance; F3 session progress counter; D1 danger-pairs explanation field (all 20); G4 glossary non-kana nav keys; W5 suggested next set; AK2 soal field (all 28); E3 SRS delta backup; K6 category pill tap-to-filter. |
| 2026-05-08 | Sonnet 4.6 | v4.13.0: G3 GlossaryMode export mini deck — ☑ select mode, Anki TSV download (JP+furi+terjemahan+desc+tags). |
| 2026-05-08 | Sonnet 4.6 | v4.14.0 J4+J2: topic field on all 95 JAC questions (8 topics); JACMode topic filter chip row + "Simulasi per Topik" CTA. |
| 2026-05-08 | Sonnet 4.6 | Hygiene audit pass: CHANGELOG v4.14.0 entry added; _MAP/BLUEPRINT-CURRENT/PROPOSAL synced to v4.14.0; J2+J4+SR2 strikethrough in proposal. |
| 2026-05-08 | Sonnet 4.6 | v4.15.0 text2.pdf audit: 17 fixes jac-ch2 (furi/desc); v4.15.1: 6 furi fixes jac-ch1 (CCUS/KY). Admin docs deferred. |
| 2026-05-08 | Sonnet 4.6 | v4.16.0 C1: text3.pdf — 18 new lifeline cards (1439–1456, source text3l); text3l SOURCE_META; admin catch-up v4.15.x. |
| 2026-05-08 | Sonnet 4.6 | v4.17.0 C1-pass2: 15 new common cards (1457–1471) from text1l/text2/text3 — CCUS levels, drone rules, 建設業法設備業種, 労働者改善法, 特定技能失業ルール, 資格区分6種, とび職, 鉄骨構造, 車両系3t. |
| 2026-05-08 | Sonnet 4.6 | v4.18.0 refactor: doboku(58)+kenchiku(77)+doboku-vocab(9)+kenchiku-vocab(13)=157 cards migrated to common; source files emptied for future Ch.5+ use. |
| 2026-05-08 | Sonnet 4.6 | v4.19.0 refactor: JAC split (jac-teori/jac-lifeline/stubs); quiz-sets.js merged; track field on all question sets, danger-pairs, angka-kunci; components filter by track. |
