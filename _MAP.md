# 🗺️ _MAP.md — SSW Konstruksi · Agent Orientation

> **Last updated:** 2026-05-14 — ADM11: recheck fixes (commit hash, P8a prereq note, §8 ordering warning)
> **Version:** v4.22.0 · **Status:** content-dq DQ ACTIVE — see PROGRESS.md
> **Blueprint:** `docs/BLUEPRINT-CURRENT.md` ← constraints, schema, known gaps
> **DQ Spec:** `docs/CARD_CONTENT_SPEC.md` ← canonical schema, ruby rules, task list
> **Archive:** `docs/archive/ARCHIVE-INDEX.md` ← all historical docs

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
├── HUSKY-SETUP.md                  ← one-time pre-commit hook setup (run locally, not CI)
├── index.html
├── package.json                    ← v4.22.0 · react, react-dom, ts-fsrs, lz-string (4 prod deps)
├── vite.config.js                  ← base: /Nugget-Nihongo-SSW-Konstruksi/ · alias @→src
├── vitest.config.js                ← coverage thresholds 70%/60%
├── eslint.config.js / .prettierrc
├── public/
│   ├── manifest.webmanifest        ← PWA manifest
│   ├── sw.js                       ← cache-first SW; SW_UPDATED postMessage on activate
│   └── icons/
├── .github/workflows/
│   ├── ci.yml                      ← lint + test (verbose) + build + output check
│   └── deploy.yml                  ← validate → merge-cards → bump SW cache → build → pages
├── docs/
│   ├── BLUEPRINT-CURRENT.md        ← ACTIVE: constraints, schema, known gaps, phase history
│   └── archive/                    ← all historical docs, proposals, task files (all executed)
│       ├── ARCHIVE-INDEX.md        ← index of everything archived
│       └── tasks/                  ← TASK-v4.20.0 … TASK-v4.21.1 (all DONE)
├── scripts/
│   ├── merge-cards.mjs             ← ACTIVE: assembles cards.js from source/ (runs in deploy)
│   ├── validate-data.mjs           ← ACTIVE: prebuild data validation
│   ├── audit-integrity.mjs         ← npm run audit:integrity
│   ├── audit-related-ids.mjs       ← one-shot audit tool (ENG-10)
│   └── archive/                    ← one-shot CS-01–05 migration scripts (do not re-run)
├── legacy/
│   └── ssw_flashcards_v87.jsx      ← historical reference; not part of build
└── src/
    ├── App.jsx / main.jsx
    ├── types.js                    ← JSDoc typedefs (Card, SRSState, Tab, ToastItem)
    ├── contexts/                   ← AppContext, ProgressContext, SRSContext (all useMemo)
    ├── data/
    │   ├── cards.js                ← CARDS[1443] (assembled by merge-cards.mjs)
    │   ├── source/                 ← 4 source files: cards-common (879), cards-lifeline (564),
    │   │                              cards-doboku/kenchiku (empty stubs)
    │   ├── quiz-sets.js            ← QUIZ_SETS (44 sets): wayground + csv + doboku + kenchiku
    │   ├── jac-teori.js / jac-lifeline.js / jac-official.js
    │   ├── jac-doboku.js / jac-kenchiku.js   ← empty stubs (future 実技 content)
    │   ├── wayground-sets.js / csv-sets.js    ← source sets (imported by quiz-sets.js)
    │   ├── angka-kunci.js          ← 29 entries
    │   ├── confusion-pairs.js      ← 28 pairs
    │   ├── danger-pairs.js         ← 20 pairs
    │   ├── categories.js           ← CATEGORIES, SOURCE_META, SOURCE_GROUPS, SOURCE_ACCENT
    │   └── index.js                ← barrel
    ├── srs/                        ← FSRS engine: fsrs-core, fsrs-store, fsrs-scheduler
    ├── storage/                    ← engine.js (3-doc R/W), schema.js (v4), migrations.js
    ├── hooks/                      ← useAnswerStreak, useDailyChallenge, useDebounce,
    │                                  useFocusTrap, useQuizKeyboard, useSRS, useSessionTimer,
    │                                  useStableContextValue, useTrackedCards + index.js barrel
    ├── components/                 ← Dashboard, BelajarTab, SayaTab, BottomNav, QuizShell,
    │                                  JpDisplay, Toast, ErrorBoundary, Onboarding, …
    ├── modes/                      ← 23 modes (all React.lazy); FlashcardMode/ decomposed
    ├── router/                     ← ModeRouter + modes.js registry
    ├── utils/                      ← daily-mission, haptic, speak, jp-helpers, quiz-generator,
    │                                  shuffle, wrong-tracker, achievements, daily-challenge,
    │                                  recommend-mode, gist-sync, session-analytics, storage-quota
    ├── styles/                     ← global.css (design tokens + sr-only + View Transitions)
    └── tests/                      ← 41 test files, 457 tests
```

---

---

## 3. Current Metrics

| Metric | Value |
|--------|-------|
| Version | **4.22.0** |
| Tests | **457** (41 files) |
| Prod dependencies | **4** (react, react-dom, ts-fsrs, lz-string) |
| Modes | **23** (all React.lazy) |
| Flashcards | **1,443** |
| Quiz questions | **~1052** (JAC 95 + Wayground 657 + CSV 300 — all in SimulasiMode pool) |
| Storage schema | **v4** |
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
| v4.20.0–4.20.15 | P0 bugs, refactors, engines (session-analytics, OVERHAUL-2), storage quota, context memo, useTrackedCards |
| v4.21.0 | REF-8/REF-9: vocab merge (8→4 source files), absorb sipil/bangunan sets; C1-C9 data-integrity tests |
| v4.21.1 | OVERHAUL-1: retire usePersistedState; ENG-4 WaygroundMode engine read; ENG-6 ExportMode richer summary |
| v4.22.0 | Card ID renumber: 185 gaps removed; IDs contiguous 1–1443; storage schema v4 + remap migration |

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

## 6. Storage Schema v4

```js
DOCS = { progress: 'ssw-progress', srs: 'ssw-srs-data', prefs: 'ssw-prefs' }

progress: { _v:4, known[], unknown[], starred[], quizWrong{}, wrongCounts{},
            wgWrong{}, vocabWrong{}, jacScores{}, wgScores{}, vocabScores{},
            sipilScores{}, bangunanScores{},
            streakData{}, dailyCount{}, recentCards[],
            milestoneStreak7, milestoneQuiz70,
            sessions[],                               // cap 180 (bumped v4.4.0)
            dailyMission }

prefs:    { _v:4, track, theme, onboarded, tutorialFlashcard, lastMode,
            dailyGoal, flashcardHintCount,
            examDate, audioEnabled, studyAnchor, furiganaPolicy,
            notes: {},                     // D3: personal notes per cardId (v4.4.0)
            sprintBestTimeline: [] }       // F4: ghost score timeline for Sprint (v4.6.0)

srs:      { _v:4, cards: { [cardId]: { card, history, reviewed_at } } }
```

---

## 7. Notable Files Added Since v4.0.0

### Data (v4.0.x → v4.21.1)
| File | Purpose |
|------|---------|
| `src/data/source/` (4 files) | CS-01 split: cards-common.js (879 cards), cards-lifeline.js (564 cards), stubs for doboku/kenchiku; vocab files merged in (REF-8 v4.21.0) |
| `src/data/angka-kunci.js` | 29 entries with track, mnemonic, soal fields |
| `src/data/confusion-pairs.js` | 28 VLT-style confusion pairs (音/字/意) |
| `src/data/danger-pairs.js` | 20 pairs with confusionType, explanation, track fields |
| `src/data/quiz-sets.js` | QUIZ_SETS = WAYGROUND_SETS + CSV_SETS + DOBOKU_SETS + KENCHIKU_SETS (44 sets total); getQuizSetsForTrack() helper; doboku/kenchiku sets inlined here (REF-9 v4.21.0, renamed P20) |
| `src/data/jac-teori.js` | 65 学科 questions (tt1+tt2), track:'common' — split from jac-official.js (v4.19.0) |
| `src/data/jac-lifeline.js` | 30 実技 Lifeline questions (st1+st2), track:'lifeline' (v4.19.0) |
| `src/data/jac-doboku.js` / `jac-kenchiku.js` | Empty stubs for future 実技 content |
| `src/data/jac-official.js` | Backward-compat shim: `[...JAC_TEORI, ...JAC_LIFELINE, ...]` |
| `src/data/categories.js` | CATEGORIES, SOURCE_META (incl. vocab-supplementary/vocab-general/jac-ch1–7), SOURCE_GROUPS (4 groups), SOURCE_ACCENT |

### Source/Utils (v4.0.x → v4.21.1)
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
| `src/hooks/useTrackedCards.js` | Memoized card filtering by track + prefs (ENG-11 v4.20.15) |
| `src/hooks/useSessionTimer.js` | Session timing for session-analytics |
| `src/hooks/useStableContextValue.js` | useMemo wrapper for context stability (REF-10 v4.20.13) |
| `src/utils/session-analytics.js` | Session duration/accuracy analytics (ENG-1 v4.20.3) |
| `src/utils/storage-quota.js` | QuotaExceededError detection + user notification (ENG-12 v4.20.12) |
| `src/storage/card-id-map-v4.js` | Old→new card ID mapping used by v3→v4 storage migration (1443 entries) |
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
| 2026-05-14 | content-dq | Sonnet 4.6: ADM11 — recheck: commit hash a9f9c94, P8a prereq note, SPEC §8 dependency order warning for P16/P17 |
| 2026-05-14 | content-dq | Sonnet 4.6: ADM10 — CARD_CONTENT_SPEC consolidated (v1.0–v1.6 + DATA_ARCH_AUDIT merged), DATA_QUALITY_HANDOFF v16→v17, PROGRESS.md compacted, SESSION_PROMPT/\_MAP updated, docs/ created |
| 2026-05-14 | content-dq | Sonnet 4.6: ADM9 — mark v87 comparison done (owner-confirmed), remove from blocked list |
| 2026-05-12 | content-dq | Sonnet 4.6: ADM8 commit hash sync — ADM7 self-reference fix (3a199f1→e0e689b), session 16→17, ADM1–ADM7→ADM1–ADM8 |
| 2026-05-12 | content-dq | Sonnet 4.6: ADM7 hygiene audit — data audit all sets/cards/pairs/angka; Part 6 jac-lifeline null fix (29→30); Part 7 confusion-pairs defA/defB schema doc; session 15→16 sync |
| 2026-05-12 | content-dq | Sonnet 4.6: ADM6 deep hygiene — last commit hash sync (→9ed5e7e), categories.js comment fix (Sipil→Doboku, Bangunan→Kenchiku), SESSION_PROMPT/HANDOFF/PROGRESS session 14→15, ADM6 tracking |
| 2026-05-12 | content-dq | Sonnet 4.6: ADM5 deep hygiene — last commit hash sync (→9ed5e7e), SIPIL/BANGUNAN→DOBOKU/KENCHIKU in _MAP+HANDOFF, _MAP session log gaps (ADM3/ADM4), PROGRESS ADM3/ADM4/ADM5 retroactive tracking |
| 2026-05-11 | content-dq | Sonnet 4.6: ADM4 hygiene pass 4 — HANDOFF prefix taxonomy + Part 7/8 table fixes + Part 12→14 renumber, SESSION_PROMPT last commit, PROGRESS stale count annotations |
| 2026-05-11 | content-dq | Sonnet 4.6: ADM3 _MAP.md + README-CONTENT-DQ.md hygiene — §0B set prefix locations, §0E text3l crossed out, Part 7/8 table rows, AGENT RULES dangling ref, Part 12→14 renumber |
| 2026-05-11 | content-dq | Sonnet 4.6: ADM2 deep hygiene pass — all stale refs purged (handoff v16, §0B prefix taxonomy, Parts 3–8, session summaries, PROGRESS batch order) |
| 2026-05-11 | content-dq | Sonnet 4.6: ADM1 admin sync post-sessions-11-12 (source counts, §13A, CODEBASE STATE wayground, _MAP.md storage v3→v4) |
| 2026-05-10 | content-dq | Sonnet 4.6: W1 wayground taxonomy restructure — 26 sets renamed+reorganized into teori/vocab/lifeline/praktik/lifeline/vocab subfolders |
| 2026-05-10 | content-dq | Sonnet 4.6: G1 type-based filtering (useTrackedCards, FilterPopup, FocusMode); G2 source fix (id:1184 vocab-supp, id:1233 jac-gakka1) |
| 2026-05-09 | content-dq | Sonnet 4.6: sessions 1–8 data hygiene — ruby annotation, furi alignment, schema migration, confusion/danger pairs, csv/quiz/wayground audits, card restructure (S1–S4), source cleanup (F1–F3), housekeeping (H1–H11) |
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
