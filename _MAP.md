# 🗺️ _MAP.md — SSW Konstruksi · Agent Orientation

> **Last updated:** 2026-05-04 by Agent Sonnet (post-Codex cleanup — JpDisplay fix, ReviewMode session wiring)
> **Version:** v4.0.2 — all Phases A–G complete; 361 tests
> **Blueprint:** `docs/MASTER-BLUEPRINT-v6.md` ← **READ THIS FIRST** (v6 = agent-executable, self-contained, supersedes ALL prior)

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
├── _MAP.md                       ← YOU ARE HERE
├── CHANGELOG.md
├── README.md
├── index.html
├── package.json                  ← react, react-dom, vite, ts-fsrs (3 prod deps)
├── vite.config.js                ← base: /Nugget-Nihongo-SSW-Konstruksi/
├── vitest.config.js              ← coverage thresholds: 70% lines/fn, 60% branches
├── public/
│   ├── manifest.webmanifest      ← PWA manifest
│   ├── sw.js                     ← Service worker (auto-bumped by deploy.yml)
│   └── icons/
├── docs/
│   ├── MASTER-BLUEPRINT-v6.md    ← ★ ACTIVE blueprint (Phases A–G)
│   ├── seeds/                    ← sipil-sets-seed.js, bangunan-sets-seed.js
│   └── archive/                  ← Old blueprints (reference only)
└── src/
    ├── main.jsx
    ├── App.jsx                   ← Root; milestone toast consumer (Phase A)
    ├── contexts/
    │   ├── AppContext.jsx         ← track, theme, nav, toast, prefs, setPref
    │   ├── ProgressContext.jsx    ← known/unknown/starred/streak/sessions/toastQueue
    │   └── SRSContext.jsx
    ├── data/
    │   ├── index.js              ← barrel re-export
    │   ├── cards.js              ← CARDS[1438]
    │   ├── jac-official.js       ← ~95 JAC questions
    │   ├── wayground-sets.js     ← 12 sets, ~579 questions
    │   ├── csv-sets.js           ← 12 sets, ~300 questions
    │   ├── sipil-sets.js         ← 3 sets, 45 questions (Phase B)
    │   ├── bangunan-sets.js      ← 3 sets, 45 questions (Phase B)
    │   ├── angka-kunci.js
    │   ├── danger-pairs.js
    │   └── categories.js
    ├── srs/
    │   ├── fsrs-core.js
    │   ├── fsrs-store.js
    │   ├── fsrs-scheduler.js
    │   └── index.js
    ├── storage/
    │   ├── schema.js             ← STORAGE_VERSION=3, DEFAULTS (Phase A)
    │   ├── engine.js             ← 3-doc R/W, v2→v3 migration, validateSnapshot, importAllSafe (Phase D)
    │   └── migrations.js         ← v1→v2, v2→v3
    ├── hooks/
    │   ├── useAnswerStreak.js    ← renamed from useStreak (Phase A), tracks wrongStreak
    │   ├── usePersistedState.js
    │   ├── useQuizKeyboard.js
    │   ├── useSRS.js
    │   └── index.js
    ├── components/
    │   ├── Dashboard.jsx         ← Mission card + exam countdown (Phase C, F)
    │   ├── BelajarTab.jsx
    │   ├── SayaTab.jsx           ← examDate + audioEnabled settings (Phase F)
    │   ├── BottomNav.jsx
    │   ├── QuizShell.jsx         ← anxiety toast on ≥5 wrong (Phase A)
    │   ├── ResultScreen.jsx      ← growth mindset language (Phase A)
    │   ├── JpDisplay.jsx         ← furiganaPolicy + 🔊 audio button (Phase E, F)
    │   ├── OptionButton.jsx
    │   ├── ProgressBar.jsx, ProgressRing.jsx
    │   ├── FilterPopup.jsx, EmptyState.jsx
    │   ├── ConfirmDialog.jsx, Toast.jsx
    │   ├── TrackPicker.jsx, Onboarding.jsx, Skeleton.jsx
    │   └── *.module.css
    ├── modes/
    │   ├── FlashcardMode.jsx     ← re-export shim (Phase E)
    │   ├── FlashcardMode/        ← decomposed (Phase E)
    │   │   ├── index.jsx         ← orchestrator
    │   │   ├── FlipCard.jsx
    │   │   ├── RatingRow.jsx
    │   │   ├── ToolStrip.jsx
    │   │   ├── FilterBar.jsx
    │   │   └── flashcard.module.css  ← 3D flip CSS (TD-05)
    │   ├── ReviewMode.jsx
    │   ├── QuizMode.jsx          ← seenPool fixed to useRef (Phase A)
    │   ├── SprintMode.jsx, FocusMode.jsx
    │   ├── JACMode.jsx, WaygroundMode.jsx, VocabMode.jsx
    │   ├── SimulasiMode.jsx, AngkaMode.jsx, DangerMode.jsx
    │   ├── SipilMode.jsx         ← functional quiz, sipilScores (Phase B)
    │   ├── BangunanMode.jsx      ← functional quiz, bangunanScores (Phase B)
    │   ├── SearchMode.jsx, GlossaryMode.jsx, SumberMode.jsx
    │   ├── StatsMode.jsx
    │   ├── ExportMode.jsx        ← validate+preview+rollback (Phase D)
    │   └── modes.module.css
    ├── router/
    │   ├── ModeRouter.jsx        ← makeFinishHandler → recordSession (Phase C)
    │   └── modes.js              ← 18 modes, MODE_SECTIONS, no legacy arrays (Phase A)
    ├── utils/
    │   ├── daily-mission.js      ← Four Strands + SRS priority (Phase C)
    │   ├── speak.js              ← Web Speech API + HVPT cycling (Phase F)
    │   ├── jp-helpers.js
    │   ├── quiz-generator.js
    │   ├── shuffle.js
    │   ├── wrong-tracker.js      ← v1 STORAGE_KEYS removed (Phase A)
    │   └── index.js
    ├── styles/
    │   └── theme.js
    └── tests/                    ← 32 test files, 361 tests (Phase G + audit)
```

---

## 3. Current Metrics

| Metric | Value |
|--------|-------|
| Version | **4.0.0** |
| Tests | **~325 passing** (25 files) |
| Prod dependencies | **3** (react, react-dom, ts-fsrs) |
| Modes | **18** (all React.lazy) |
| Flashcards | **1,438** |
| Quiz questions | **~860** (JAC + Wayground + CSV + Sipil + Bangunan) |
| Storage schema | **v3** |
| localStorage docs | **3** (progress, srs, prefs) |
| CI/CD | ✅ GitHub Actions (auto-deploy) |
| SW auto-bump | ✅ deploy.yml |

---

## 4. Phase History (A–G complete)

| Phase | Name | Status |
|-------|------|--------|
| A | Bug Fixes + Storage v3 + Debt Cleanup | ✅ v3.7.0 |
| B | Content: Sipil & Bangunan | ✅ v3.8.0 |
| C | Daily Mission + Session Analytics | ✅ v3.8.0 |
| D | Export/Import Hardening | ✅ v3.9.0 |
| E | FlashcardMode Decomposition | ✅ v3.9.0 |
| F | Exam Countdown + Audio | ✅ v4.0.0 |
| G | QA + Polish + Release | ✅ v4.0.0 |

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
            sipilScores{}, bangunanScores{},           // Phase B
            streakData{}, dailyCount{}, recentCards[],
            milestoneStreak7, milestoneQuiz70,
            sessions[],                                // Phase C (cap 90)
            dailyMission }                             // Phase C

prefs:    { _v:3, track, theme, onboarded, tutorialFlashcard, lastMode,
            dailyGoal, flashcardHintCount,
            examDate,                                  // Phase F
            audioEnabled,                              // Phase F
            studyAnchor,                               // Phase C
            furiganaPolicy }                           // Phase E

srs:      { _v:3, cards: { [cardId]: { card, history, reviewed_at } } }
```

---

## 7. Agent Trail

| Date | Agent | Work |
|------|-------|------|
| 2026-05-01 | Opus 4.6 (Crunchy) | Blueprint v6 — full codebase audit, self-contained spec |
| 2026-05-02 | Sonnet 4.6 | Phase A: bug fixes, storage v3, debt cleanup |
| 2026-05-02 | Sonnet 4.6 | Phase B+C: sipil/bangunan content, daily mission, sessions |
| 2026-05-02 | Sonnet 4.6 | Phase D+E: export hardening, FlashcardMode decomposition |
| 2026-05-02 | Sonnet 4.6 | Phase F+G: exam countdown, audio, QA, release v4.0.0 |
| 2026-05-03 | Sonnet 4.6 | feat/audit-improvements B1-B4+M1-M3: furigana chain, session recording all modes, sprint PB, glossary track-aware |
| 2026-05-04 | Sonnet 4.6 | feat/audit-improvements C1-C6: ReviewMode audio, track-aware search, fokus/angka/jebak session wiring, StatsMode SRS+streak |
| 2026-05-04 | Codex (Sonnet) | feat/audit-improvements D1-D10: SayaTab inline edit, QuizMode furigana, SprintMode audio, StatsMode 7-day bars, MissionOverlay D8, SearchMode star, QuizShell audio D10 |
| 2026-05-04 | Codex (Sonnet) | fix(JpDisplay): native ruby rendering + tap-to-reveal furigana (PR #6) |
| 2026-05-04 | Sonnet 4.6 | post-Codex cleanup: fix wrapInteractive button wrapping, ReviewMode onSessionEnd, stale branch cleanup |
