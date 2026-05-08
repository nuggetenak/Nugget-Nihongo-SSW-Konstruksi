# 🏗️ SSW Konstruksi — Blueprint Current (v4.19.2)

> **Status:** ALL PHASES COMPLETE ✅ — NO OPEN ITEMS (C1 fully done: text4 audit confirmed all content pre-exists; C2 & E2 dismissed)
> **Version:** 4.19.2
> **Last updated:** 2026-05-09 (v4.19.2: track field bugs fixed; SimulasiMode exam pool +300 CSV qs; tests added)
> **Supersedes:** MASTER-BLUEPRINT-v6.md (archived — all phases A–G executed)

**→ For a new agent: start with `_MAP.md` in the repo root.**

---

## What Was Built

A React 19 PWA for Indonesian construction workers studying the JAC SSW exam.

| Dimension | Value |
|-----------|-------|
| Flashcards | 1,443 (all in common+lifeline; doboku/kenchiku source files empty pending Ch.5+) |
| Quiz questions | ~974 (JAC 95 + Wayground 579 + CSV 300 — all in SimulasiMode pool) |
| Modes | 23 (all React.lazy) |
| Storage schema | v3 (3-doc localStorage model) |
| Tests | 411 (35 files, +24 new) |
| Prod deps | 4 (react, react-dom, ts-fsrs, lz-string) |
| Version | **4.19.2** |

---

## Completed Phase History

### Phases A–G (v3.7.0 → v4.0.0) — Core App

| Phase | Name | Key Deliverables |
|-------|------|-----------------|
| A | Bug Fixes + Storage v3 | seenPool→useRef, milestone toasts, anxiety toast, storage v3 migration, growth mindset strings |
| B | Content: Sipil & Bangunan | sipil-sets.js (3 sets, 45q), bangunan-sets.js (3 sets, 45q), functional quiz modes, QuestionImage component |
| C | Daily Mission + Session Analytics | daily-mission.js (Four Strands engine), MissionCompleteOverlay, session tracking (initial cap 90, bumped 180 in v4.4.0), habit anchor, StatsMode weekly chart |
| D | Export/Import Hardening | validateSnapshot, importAllSafe with rollback, SayaTab diff UI |
| E | FlashcardMode Decomposition | FlashcardMode/ sub-directory, FLIP_STYLE → CSS, furiganaPolicy prop chain |
| F | Exam Countdown + Audio | SayaTab date picker, Dashboard countdown banner, speak.js (Web Speech + HVPT cycling), 🔊 buttons |
| G | QA + Polish + Release | Coverage thresholds (70/60), flow tests, _MAP.md v4, v4.0.0 release |

### CS Series (v4.0.x) — Content Standardization

| Task | Deliverable |
|------|-------------|
| CS-01 | cards.js split into 8 source files in src/data/source/ |
| CS-02 | romaji field removed, type field added to all 1,410 cards |
| CS-03 | DescBlock native ruby rendering via parseRubyFragments |
| CS-04 | FlipCard quote field rendering on back face |
| CS-05 | Full re-annotation pass: 1,410 cards with desc/id_text/context quality pass |

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
| SIM3 | SimulasiMode: "Latih Salah" CTA → `onRetryWrong` FlashcardMode bridge |
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
| Tests | `quiz-produksi.test.jsx` — 7 tests added (total 387) |

### v4.6.0 — Gist Sync + Sprint Ghost + StatsMode Accuracy

| Item | Deliverable |
|------|-------------|
| E2 | GitHub Gist sync (opt-in) — `utils/gist-sync.js`; PAT input + Push/Pull in ExportMode |
| F4 | Sprint "Battle Past Self" ghost score — `sprintBestTimeline` in prefs, live ghost display |
| ST3 | Quiz accuracy per category in StatsMode — `🎯 N%` badge + wrong count from `quizWrong` |

### v4.7.0 — Phase 5.7 (W2)

| Item | Deliverable |
|------|-------------|
| W2 | WaygroundMode per-set "Ulang Salah" — `getSetWrongCount()` helper, `lemahMode` state, sub-button per set row, score isolation for lemah runs |

### v4.8.0 — Phase 5.8 UX Polish

| Item | Deliverable |
|------|-------------|
| SR1 | SearchMode: search history — 5 recent terms in sessionStorage, chip UI below input |
| G1 | GlossaryMode: 🔊 audio button per entry in expanded view (uses `speakJP`) |
| SB1/SB2 | SumberMode: progress bar (% hafal) + "Terlemah" badge per source in picker |
| W3 | WaygroundMode: "Baru" amber badge on sets never attempted (no `wgScores` entry) |
| R2 | ReviewMode: due-reason chip showing `N× ulasan · interval Xj` next to strength pill |
| J3 | JACMode: `bestPct` stored alongside `pct`; best score shown in picker when differs |

### v4.8.1 — DengarMode Wrong-Tracker

| Item | Deliverable |
|------|-------------|
| D1-WT | `DengarMode.jsx` wrong-tracker — wrong answers written to shared `quizWrong` pool; 7 modes write to `quizWrong` at this point: QuizMode, JACMode, WaygroundMode, SprintMode, VocabMode, QuizProduksiMode, DengarMode (DangerMode added as 8th in v4.11.0 D3) |

### v4.8.2 — SR3 + SIM5

| Item | Deliverable |
|------|-------------|
| SR3 | `SearchMode.jsx` — copy-to-clipboard button (⎘) per result card; copies JP+furigana+terjemahan; visual ✓ feedback 1.5s |
| SIM5 | `SimulasiMode.jsx` — live `N soal/mnt` pace hint below timer; turns red on `isUrgent` |

### v4.9.0 — Open Items Batch (R3/R4/R5/W1/W4/Q4/SR4/ST4)

| Item | Deliverable |
|------|-------------|
| R3 | ReviewMode: `speakOnFlip` pref — audio plays on card flip instead of card advance; toggle in SayaTab; default off |
| R4 | ReviewMode: "Lewati" button + keyboard `S` — skip card without SRS rating |
| R5 | ReviewMode: live remaining count `N / total · N lagi` in header |
| W1 | WaygroundMode: group description below each group header (Teori / Praktik / CSV Teori / CSV Praktik) |
| W4 | WaygroundMode: total score summary card above picker — total benar/salah + % across all attempted sets |
| Q4 | QuizMode: persist question count selection to `prefs.quizQuestionCount`; restored on next session |
| SR4 | SearchMode: accuracy badges per result — `✓ Hafal` (green) and `⚠ N× salah` (red) |
| ST4 | StatsMode: week comparison grid — Minggu Lalu / Perubahan / Minggu Ini |

### v4.10.0 — Open Items Batch (J1/K2/SB3/Q5)

| Item | Deliverable |
|------|-------------|
| J1 | JACMode: "🧠 Tambah ke Ulasan SRS" on ResultScreen — queues `related_card_id` flashcards via `recordReview(id, 1)`; toast confirms count |
| K2 | FlashcardMode: ToolStrip "👁 Baca / 📝 Rating" toggle — read-only mode hides RatingRow and swipe hint |
| SB3 | SumberMode: 🃏 Kartu / ⚡ Sprint / ❓ Kuis action buttons per source — navigates to mode scoped to that source's card IDs |
| Q5 | QuizMode: category filter picker in ⚙ Pengaturan — scopes question pool to selected category |

### v4.11.0 — Open Items Batch (StatsMode fix, D2/D3, AK1/AK3, G2, K5)

| Item | Deliverable |
|------|-------------|
| BUG-FIX | StatsMode: restored missing `<div className={S.list, ST.catList}>` wrapper (parse error since v4.9.0 ST4) |
| D2 | DangerMode: `confusionType` field on all 20 danger pairs; filter chip row in panel (makna/kata/angka/prosedur) |
| D3 | DangerMode: wrong-tracker write to shared `ssw-quiz-wrong` on wrong drill answers — 8th mode writing to quizWrong pool |
| AK1 | AngkaMode: `mnemonic` field on all 29 `angka-kunci` entries; displayed in accordion + on wrong answer |
| AK3 | AngkaMode: `TypeQuizView` — ⌨️ Ketik mode, type-answer production quiz, fuzzy match |
| G2 | GlossaryMode: compact/expanded toggle (≡ Kompak = click-to-expand; ⊞ Lebar = always-show-all) |
| K5 | FlashcardMode: "＋ Tambah ke Ulasan SRS" button for known cards not yet in SRS queue |

### v4.12.0 — Open Items Batch (Q3/F2/F3/D1/G4/W5/AK2/E3/K6)

| Item | Deliverable |
|------|-------------|
| Q3 | QuizMode: difficulty detail text shown inline on selection |
| F2 | FocusMode: auto-advance to next weakest category after sprint ends |
| F3 | FocusMode: session progress counter — N/M categories trained, ✓ badge per button |
| D1 | `danger-pairs.js`: `explanation` field on all 20 pairs (linguistic "why confused"); shown in accordion + quiz |
| G4 | GlossaryMode: kanji/romaji initials each get own nav key; sorted alphabetically after kana |
| W5 | WaygroundMode: "Disarankan Berikutnya" card — untouched first, then lowest score |
| AK2 | `angka-kunci.js`: `soal` field (sample JAC-style question) on all 29 entries; shown in accordion |
| E3 | ExportMode: "Ekspor Delta SRS Saja" button — SRS+known+starred only, smaller file |
| K6 | FlashcardMode: category pill tap-to-filter (`__cat:KEY__`); FilterBar shows cat chip with clear button |

### v4.13.0 — G3 Export Mini Deck

| Item | Deliverable |
|------|-------------|
| G3 | `GlossaryMode.jsx` — select mode (☑ Pilih toggle), tap-to-select cards, "Semua" quick-select, footer "⬇ Ekspor Anki" downloads TSV file (Anki-importable: JP[furi]\tterjemahan+desc\ttags) |

### v4.14.0 — J4+J2 JAC Topic Tags

| Item | Deliverable |
|------|-------------|
| J4 | `jac-official.js`: `topic` field on all 95 questions (8 topics: listrik/pipa/telekomunikasi/pemadam/isolasi/keselamatan/hukum/umum) |
| J2 | `JACMode.jsx`: topic filter chip row + "Simulasi per Topik" CTA; filtered set count per topic |

### v4.15.0 + v4.15.1 — JAC Content Audit (furi/desc fixes)

| Item | Deliverable |
|------|-------------|
| jac-ch2 | 17 fixes across 14 cards: desc restored, furi corrected (IDs 151–627) |
| jac-ch1 | 6 furi fixes (IDs 584–591): KY acronym corrections, incomplete furi chains |

### v4.16.0 — C1 text3.pdf (18 new Lifeline cards)

| Item | Deliverable |
|------|-------------|
| C1 | 18 new cards 1439–1456 (`source: text3l`) in `cards-lifeline.js`; `text3l` added to `SOURCE_META` in `categories.js` |
| Cards | 建設工事の3区分, ウレタン断熱, 防露工事, 配管工事, 受水槽, 通気設備, FRP防水, さく井, 通信土木, 上水道/下水道の流れ, 消防法設置義務 |

### v4.17.0 — C1-pass2 (15 new common cards)

| Item | Deliverable |
|------|-------------|
| C1-pass2 | 15 new cards 1457–1471 in `cards-common.js`; sourced from text1l/text2/text3 second pass |
| Cards | CCUSの4レベル, ドローン飛行禁止5ルール, 建設業法許可業種6種, 雇用改善法重点施策, 特定技能失業ルール, 足場作業主任者, 掘削作業主任者, とび職6種, 鉄骨構造3種, 車両系3t境界 |

### v4.18.0 — refactor: doboku+kenchiku → common

| Item | Deliverable |
|------|-------------|
| Migrate | 58 doboku + 77 kenchiku + 9 doboku-vocab + 13 kenchiku-vocab (157 cards total) → `cards-common.js`/`cards-common-vocab.js` |
| Category | `doboku_doko/hoso/haisui` and `kenchiku_kutai/shiage` remapped → `sekou` |
| Source files | `cards-doboku.js`, `cards-kenchiku.js`, etc. now empty `[]` (preserved for future Ch.5+ content) |
| Cards | IDs reassigned 1472–1628; total unchanged at 1443 |

### v4.19.0 — refactor: JAC split + quiz-sets merge + track fields

| Item | Deliverable |
|------|-------------|
| JAC split | `jac-official.js` → `jac-teori.js` (65q, common) + `jac-lifeline.js` (30q, lifeline) + stubs (`jac-doboku.js`, `jac-kenchiku.js`); `jac-official.js` kept as backward-compat shim |
| quiz-sets merge | `quiz-sets.js` = WAYGROUND_SETS + CSV_SETS; `getQuizSetsForTrack(track)` helper |
| Track fields | `danger-pairs.js` (common:12/lifeline:8), `angka-kunci.js` (common:22/lifeline:7) per-entry track |
| Components | WaygroundMode, VocabMode, DangerMode, AngkaMode filter by current track |

---

## Known Gaps & Deferred Work

These are honest assessments — not blocking anything, but relevant for future work.

### Content Gaps (Phase 5.2 — Deferred)
- **Sipil/Bangunan track content is thin**: 45 questions each, written from general knowledge. JAC official PDFs for sipil (text5d–7d) and bangunan (text5k–7k) were not fully processed. The 1,410 flashcards are ~80% lifeline content — sipil and bangunan tracks show near-identical card pools.
- **Chapter 2 & 4 flashcards**: text1l/text2 pass2 done (+15 common cards 1457–1471), text3l done (+18 lifeline cards 1439–1456), text4 audit done — all Ch.4 terminology pre-exists in cards (100% coverage confirmed 2026-05-09).
- **Photo-based (写真) questions**: QuestionImage component exists and SW cache handles images, but actual images from JAC PDFs have not been extracted. Infrastructure is in place; content is not.
- **desc field accuracy**: Term existence verified (63% JAC-traceable), but Indonesian explanation correctness was not audited. Human review recommended.

### Technical
- **Out-of-DOCS localStorage keys**: Several modes use `usePersistedState` with keys outside the 3-doc engine (see Storage Schema below). These bypass lz-string compression and `validateSnapshot`. Known — not blocking, but relevant if adding export coverage.
- **sessionStorage keys**: `ssw-search-history` (SR1) and `ssw-fc-search`/`ssw-fc-sort` (BUG-05) live in sessionStorage — per-tab, not persisted. Expected behaviour.
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

// ⚠️ Out-of-DOCS keys (usePersistedState — bypass engine/compression/export):
// ssw-jac-scores           { [setKey]: { score, total, pct, date, bestPct } }
// ssw-wg-scores            { [setId]: { correct, total, date, maxStreak } }
// ssw-vocab-scores         { [setId]: { correct, total, date } }
// ssw-quiz-wrong           { [cardId]: wrongEntry }  ← shared pool (8 modes write)
// ssw-wrong-counts         { [cardId]: count }
// ssw-quiz-produksi-wrong  { [cardId]: wrongEntry }
// ssw-wg-wrong-{setId}     { [cardId]: wrongEntry }  ← per-set Wayground wrong
// ssw-vocab-wrong-{setId}  { [cardId]: wrongEntry }
// ssw-fc-search / ssw-fc-sort  string (sessionStorage — FlashcardMode filter persist)
// ssw-gist-pat / ssw-gist-id   string (GitHub Gist credentials)
// ssw-search-history           string[] (sessionStorage — per tab, not persisted)
```

---

## Archived Documents (docs/archive/)

All prior blueprints, proposals, and audit reports are in `docs/archive/`.
See `docs/archive/ARCHIVE-INDEX.md` for a summary of what's there and why.

The last active blueprint was `MASTER-BLUEPRINT-v6.md` (Opus 4.6 / Crunchy, 2026-05-01).
It has been moved to `docs/archive/` — all its phases are now complete.

