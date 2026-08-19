# 🏗️ SSW Konstruksi — Blueprint Current (v4.21.1)

> **Status:** v4.22.0 STABLE ✅
> **Version:** 4.22.0
> **Last updated:** 2026-05-09 (v4.22.0: card ID renumbering, storage v4)
> **For new agents:** Read `_MAP.md` first. All TASK-v4.20.x / TASK-v4.21.x files are DONE.

---

## What Was Built

React 19 PWA for Indonesian construction workers studying the JAC SSW exam.

| Dimension      | Value                                                        |
| -------------- | ------------------------------------------------------------ |
| Flashcards     | 1,443 (common+lifeline; doboku/kenchiku empty pending Ch.5+) |
| Quiz questions | ~974 (JAC 95 + Wayground 579 + CSV 300)                      |
| Modes          | 23 (all React.lazy)                                          |
| Storage schema | v3 (3-doc localStorage, lz-string compressed)                |
| Tests          | 457 (41 files)                                               |
| Prod deps      | 4 (react, react-dom, ts-fsrs, lz-string)                     |
| Version        | **4.22.0**                                                   |

---

## Completed Phases (Summary)

| Version(s)      | Phase                              | Key Deliverables                                                                                         |
| --------------- | ---------------------------------- | -------------------------------------------------------------------------------------------------------- |
| v3.7.0          | A — Bug Fixes + Storage v3         | seenPool→useRef, milestone toasts, storage v3 migration                                                  |
| v3.8.0          | B+C — Content + Daily Mission      | sipil/bangunan sets, daily-mission engine, session tracking                                              |
| v3.9.0          | D+E — Export + Decomposition       | validateSnapshot, importAllSafe, FlashcardMode/ sub-dir                                                  |
| v4.0.0          | F+G — Exam Countdown + Audio + QA  | SayaTab date picker, speak.js, coverage thresholds                                                       |
| v4.0.x          | CS-01–05 — Content Standardization | 8 source files split, type field, native ruby, re-annotation                                             |
| v4.1.0          | FE-01–09 — Frontend Polish         | CSS modules, a11y, error boundaries, PWA, haptics, design tokens                                         |
| v4.2.0          | Test fix + Modes                   | BottomNav/Toast mock fix; ProductionMode; ConfusionMode                                                  |
| v4.3.0–4.3.1    | Phase 5.1–5.4                      | SIM1 pause, BUG-06 pool merge, ST2 gauge, B2 Sprint, achievements, heatmap, lz-string                    |
| v4.4.0–4.7.0    | Phase 5.5–5.7                      | DengarMode, CatatanMode, breadcrumb, Gist sync, Sprint ghost, WaygroundMode Ulang Salah                  |
| v4.8.0–4.9.0    | Phase 5.8 + Open Items             | SR1 history, G1 audio, SB1/2 sumber, R3/R4/R5 review, ST4 week                                           |
| v4.10.0–4.13.0  | Feature batch                      | J1 SRS bridge, K2 read-only, SB3 actions, G3 Anki export                                                 |
| v4.14.0         | J4+J2 JAC topics                   | topic field on 95 questions; JACMode topic filter                                                        |
| v4.15.x         | JAC content audit                  | 23 furi/desc fixes across jac-ch1 + jac-ch2                                                              |
| v4.16.0–4.17.0  | C1 content                         | +18 lifeline (text3l) + +15 common (pass2) = +33 cards                                                   |
| v4.18.0         | Refactor: track migration          | 157 doboku+kenchiku cards → common; source files emptied                                                 |
| v4.19.0         | Refactor: data layer               | JAC split (jac-teori/jac-lifeline), quiz-sets.js, track fields everywhere                                |
| v4.19.1         | Hygiene                            | C1 text4 closed; categories.js SOURCE_GROUPS fix (+340 cards to SumberMode)                              |
| v4.19.2         | Bug fixes                          | wt1-10 track common; csv-sets track fields; SimulasiMode +300 CSV                                        |
| v4.19.3         | Tests                              | +24 data tests (JAC split, track fields, QUIZ_SETS, SOURCE_GROUPS)                                       |
| v4.19.4         | Bug fixes                          | SearchMode wrongCount→getWrongCount; utils/index barrel clean                                            |
| v4.19.5         | Hygiene                            | Onboarding/index.html 1438→1443; daily-challenge QUIZ_SETS; vite chunks                                  |
| v4.20.0–4.20.15 | Engines + Features + Data          | session-analytics, OVERHAUL-2, DB fixes, ENG-9/10/11/12/13, storage quota, context memo, useTrackedCards |
| v4.21.0         | Structural                         | REF-8/REF-9: merge vocab sources (8→4); absorb sipil/bangunan sets; C1-C9 data-integrity tests           |
| v4.21.1         | OVERHAUL-1                         | Retire usePersistedState; ENG-4 WaygroundMode engine read; ENG-6 ExportMode richer summary               |
| v4.22.0         | Card ID renumber                   | 185 gaps removed; IDs contiguous 1–1443; storage schema v4 + remap migration                             |

---

## v4.20–v4.21 — COMPLETE ✅

All 19 task files executed. See `docs/archive/tasks/TASK-MASTER.md` for full record.

| Batch       | Versions          | Status  |
| ----------- | ----------------- | ------- |
| Quick fixes | v4.20.0–v4.20.2   | ✅ DONE |
| Engines     | v4.20.3–v4.20.5   | ✅ DONE |
| Features    | v4.20.6–v4.20.8   | ✅ DONE |
| Data layer  | v4.20.9–v4.20.11  | ✅ DONE |
| Resilience  | v4.20.12          | ✅ DONE |
| Performance | v4.20.13–v4.20.15 | ✅ DONE |
| Structural  | v4.21.0–v4.21.1   | ✅ DONE |

## Known Gaps & Deferred Work

These are honest assessments — not blocking anything, but relevant for future work.

### Content Gaps (Phase 5.2 — Deferred)

- **Sipil/Bangunan track content is thin**: 45 questions each, written from general knowledge. JAC official PDFs for sipil (text5d–7d) and bangunan (text5k–7k) were not fully processed. The 1,410 flashcards are ~80% lifeline content — sipil and bangunan tracks show near-identical card pools.
- **Chapter 2 & 4 flashcards**: text1l/text2 pass2 done (+15 common cards 1457–1471), text3l done (+18 lifeline cards 1439–1456), text4 audit done — all Ch.4 terminology pre-exists in cards (100% coverage confirmed 2026-05-09).
- **Photo-based (写真) questions**: QuestionImage component exists and SW cache handles images, but actual images from JAC PDFs have not been extracted. Infrastructure is in place; content is not.
- **desc field accuracy**: Term existence verified (63% JAC-traceable), but Indonesian explanation correctness was not audited. Human review recommended.

### Technical

- **sessionStorage keys**: `ssw-search-history` (SR1) and `ssw-fc-search`/`ssw-fc-sort` (BUG-05) live in sessionStorage — per-tab, not persisted. Expected behaviour.
- **Gist credentials**: `ssw-gist-pat` / `ssw-gist-id` stored as plain localStorage strings (not in engine). Intentional — sensitive, excluded from export.
- **sprintBest/sprintBestTimeline**: Stored directly on prefs doc via `storageSet` but not in schema DEFAULTS — set dynamically by SprintMode on first PB.

### Architecture

- **Category mismatch**: `jenis_kerja` and `alat_umum` categories contain lifeline content even for sipil/bangunan track users. Re-categorization would require content review of ~485 cards.

### Remaining Open Items

- **E2** (export encryption) — ~~🟢 Nice-to-have~~ **DISMISSED** — not worth complexity; no sensitive data in export.
- **C1** ✅ FULLY COMPLETE — text4 audit (2026-05-09): all Ch.4 terms pre-exist; no new cards added. text3l +18, pass2 +15 already committed.
- **C2** (sipil/bangunan expansion) — **DISMISSED** — 45 questions per track is sufficient for current learner scope; expansion deferred indefinitely.

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
            speakOnFlip: false,            // R3: speak on card flip instead of advance (v4.9.0)
            quizQuestionCount: 10,         // Q4: persist quiz count selection (v4.9.0)
            sprintBest: 0,                 // F4: personal best sprint score — dynamic, not in DEFAULTS
            sprintBestTimeline: [] }       // F4: ghost score timeline — dynamic, not in DEFAULTS

srs:      { _v:3, cards: { [cardId]: { card, history, reviewed_at } } }

// E4: All DOCS are lz-string compressed in localStorage.
// readDoc() decompresses; falls back to plain JSON for old data (backward compat).

// ✅ All wrong-tracking and scores now flow through engine (lz-string compressed, exportable).
// Legacy keys (ssw-quiz-wrong, ssw-wrong-counts, ssw-jac/wg/vocab-scores,
//   ssw-wg-wrong-{id}, ssw-vocab-wrong-{id}) are one-time migration reads → deleted post-migrate.
//
// ⚠️ Truly out-of-engine keys (intentional — not in progress/prefs/srs docs):
// ssw-fc-search / ssw-fc-sort  string (sessionStorage — FlashcardMode filter persist)
// ssw-gist-pat / ssw-gist-id   string (GitHub Gist credentials — sensitive, excluded from export)
// ssw-search-history           string[] (sessionStorage — per tab, not persisted)
```

---

## Archived Documents (docs/archive/)

All prior blueprints, proposals, and audit reports are in `docs/archive/`.
See `docs/archive/ARCHIVE-INDEX.md` for a summary of what's there and why.

The last active blueprint was `MASTER-BLUEPRINT-v6.md` (Opus 4.6 / Crunchy, 2026-05-01).
It has been moved to `docs/archive/` — all its phases are now complete.
