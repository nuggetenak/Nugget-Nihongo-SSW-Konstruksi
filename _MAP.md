# 🗺️ _MAP.md — SSW Konstruksi · Agent Orientation

> **Last updated:** 2026-05-07 by Agent Sonnet 4.6 (FE sprint + full repo hygiene)
> **Version:** v4.1.0 — Phases A–G + CS-01–05 + FE-01–09 complete; 383+ tests
> **Blueprint:** `docs/BLUEPRINT-CURRENT.md` ← **READ THIS** (post-completion: open items, constraints, schema)
> **Old blueprint:** `docs/archive/MASTER-BLUEPRINT-v6.md` (all phases executed — archived 2026-05-07)

---

## 1. What This App Is

A React PWA study tool for the **JAC SSW Construction exam** (Japan). Interface in **Indonesian**, content **Japanese↔Indonesian bilingual**. Targets Indonesian construction workers studying for the SSW visa exam.

**Deployment:** GitHub Pages — static standalone PWA. `npm install && npm run build` → deploy `dist/`.
**Storage:** Pure `localStorage` — **never** `window.storage`, never Supabase, never external auth.
**Deps:** react 19, react-dom, ts-fsrs v5, Vite 6. **Max 3 prod deps — hard constraint.**

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
├── package.json                    ← v4.1.0 · react, react-dom, vite, ts-fsrs (3 prod deps)
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
│   ├── MASTER-BLUEPRINT-v6.md      ← ★ ACTIVE blueprint (Phases A–G)
│   ├── seeds/                      ← sipil-sets-seed.js, bangunan-sets-seed.js
│   └── archive/                    ← Old blueprints (reference only)
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
    │   ├── cards.js                ← CARDS[1438] (assembled from source/ by merge-cards.mjs)
    │   ├── source/                 ← 8 track source files (CS-01)
    │   │   ├── cards-common.js, cards-common-vocab.js
    │   │   ├── cards-doboku.js, cards-doboku-vocab.js
    │   │   ├── cards-kenchiku.js, cards-kenchiku-vocab.js
    │   │   └── cards-lifeline.js, cards-lifeline-vocab.js
    │   ├── jac-official.js         ← ~95 JAC questions
    │   ├── wayground-sets.js       ← 12 sets, ~579 questions
    │   ├── csv-sets.js             ← 12 sets, ~300 questions
    │   ├── sipil-sets.js           ← 3 sets, 45 questions
    │   ├── bangunan-sets.js        ← 3 sets, 45 questions
    │   ├── angka-kunci.js
    │   ├── danger-pairs.js
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
    │   ├── SearchMode.jsx          ← useDebounce applied (FE-05-C); track-aware
    │   ├── ExportMode.jsx
    │   ├── SumberMode.jsx
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
    │   └── index.js                ← barrel (all utils + haptic + speak exported)
    ├── styles/
    │   └── global.css              ← design tokens (FE-03): spacing, shadow, z-index, transitions
    │                               ← .sr-only utility (FE-04-A)
    │                               ← View Transitions ::view-transition rules (FE-09-C)
    │                               ← token audit comment block
    └── tests/                      ← 35 test files, 383+ tests
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
| Version | **4.1.0** |
| Tests | **383+** (35 files) |
| Prod dependencies | **3** (react, react-dom, ts-fsrs) |
| Modes | **18** (all React.lazy) |
| Flashcards | **1,438** |
| Quiz questions | **~860** (JAC + Wayground + CSV + Sipil + Bangunan) |
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

---

## 5. Key Design Rules (Hard Constraints)

1. **Pure localStorage** — Never `window.storage`, Supabase, external auth
2. **Max 3 prod deps** — react, react-dom, ts-fsrs
3. **All 18 modes stay React.lazy()** — no reverting lazy-loading
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
            sessions[],                               // cap 90
            dailyMission }

prefs:    { _v:3, track, theme, onboarded, tutorialFlashcard, lastMode,
            dailyGoal, flashcardHintCount,
            examDate, audioEnabled, studyAnchor, furiganaPolicy }

srs:      { _v:3, cards: { [cardId]: { card, history, reviewed_at } } }
```

---

## 7. New Files Since v4.0.2 (FE Sprint)

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

---

## 8. Agent Trail

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
| 2026-05-07 | Sonnet 4.6 | Repo hygiene: outputs/ untracked, stale branch deleted, barrel exports updated, gitignore/prettierignore expanded, CI improved, version → 4.1.0, _MAP.md + CHANGELOG updated |
