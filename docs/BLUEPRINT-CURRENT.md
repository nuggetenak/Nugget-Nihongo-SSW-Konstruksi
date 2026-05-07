# 🏗️ SSW Konstruksi — Blueprint Current (v4.1.0)

> **Status:** ALL PHASES COMPLETE ✅
> **Version:** 4.1.0
> **Last updated:** 2026-05-07
> **Supersedes:** MASTER-BLUEPRINT-v6.md (archived — all phases A–G executed)

**→ For a new agent: start with `_MAP.md` in the repo root.**

---

## What Was Built

A React 19 PWA for Indonesian construction workers studying the JAC SSW exam.

| Dimension | Value |
|-----------|-------|
| Flashcards | 1,438 (curated, type-annotated, ruby-rendered) |
| Quiz questions | ~860 (JAC + Wayground + CSV + Sipil + Bangunan) |
| Modes | 18 (all React.lazy) |
| Storage schema | v3 (3-doc localStorage model) |
| Tests | 383+ (35 files) |
| Prod deps | 3 (react, react-dom, ts-fsrs) |

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

---

## Open Items / Known Gaps (Post v4.1.0)

These are honest assessments — not blocking anything, but relevant for future work:

### Content Gaps
- **Sipil/Bangunan track content is thin**: 45 questions each, written from general knowledge. JAC official PDFs for sipil (text5d–7d) and bangunan (text5k–7k) were not fully processed. The 1,438 flashcards are ~80% lifeline content — sipil and bangunan tracks show near-identical card pools.
- **Photo-based (写真) questions**: QuestionImage component exists and SW cache handles images, but actual images from JAC PDFs have not been extracted and added. B.7 infrastructure is in place, content is not.
- **desc field accuracy**: Term existence verified (63% JAC-traceable), but Indonesian explanation correctness was not audited. Human review recommended.

### Technical / Token Audit
- **FE-03 token audit**: 8+ locations in component CSS still use hardcoded values (z-index, shadow, transition values) instead of new CSS tokens. Flagged with comments in `global.css`. Low urgency — cosmetic consistency only.
- **Production mode (ID→JP)**: Output Hypothesis demands active production practice. Currently all quiz modes are JP→ID recognition only. A dedicated ID→JP input mode would address this gap. Documented but not implemented.
- **ConfusionMode / VLT placement test**: Documented in v5/v6 blueprints. Still not implemented.

### Architecture
- **Category mismatch**: `jenis_kerja` and `alat_umum` categories contain lifeline content even for sipil/bangunan track users. Re-categorization would require content review of ~485 cards.

---

## Hard Constraints (Do Not Break)

1. **Pure localStorage** — no Supabase, no external auth, no window.storage
2. **Max 3 prod deps** — react, react-dom, ts-fsrs
3. **All 18 modes stay React.lazy()**
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
            sessions[], dailyMission }

prefs:    { _v:3, track, theme, onboarded, tutorialFlashcard, lastMode,
            dailyGoal, flashcardHintCount,
            examDate, audioEnabled, studyAnchor, furiganaPolicy }

srs:      { _v:3, cards: { [cardId]: { card, history, reviewed_at } } }
```

---

## Archived Documents (docs/archive/)

All prior blueprints, proposals, and audit reports are in `docs/archive/`.
See `docs/archive/ARCHIVE-INDEX.md` for a summary of what's there and why.

The last active blueprint was `MASTER-BLUEPRINT-v6.md` (Opus 4.6 / Crunchy, 2026-05-01).
It has been moved to `docs/archive/` — all its phases are now complete.
