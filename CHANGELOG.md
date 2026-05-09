## [4.20.0] - 2026-05-09

### fix: P0 critical bugs + pre-existing lint crashes

- X1 (VocabMode): MIX_ALL moved inside component; VOCAB_SETS memoized with useMemo — fixes ReferenceError on load
- X2 (SprintMode): quizWrong written to progress doc (was: prefs)
- AngkaMode: `ANGKA_KUNCI` aliased as `ANGKA` at import; removed self-referencing filter — fixes crash on load
- DangerMode: `DANGER_PAIRS` aliased as `PAIRS` at import; removed self-referencing filter — fixes crash on load
- eslint.config.js: `react-hooks/preserve-manual-memoization` disabled (no React Compiler in project)

---

## [v4.20.x] - QUEUED — 2026-05-09

### plan: v4.20.0–v4.21.1 implementation queued (Proposal pass 14)

19 task files in `docs/tasks/`. Pick up `TASK-MASTER.md` to begin.

**Pass 14 new items:** PERF-1 context memoization (REF-10+ENG-13), PERF-2 JpDisplay parse memo (REF-11), STORAGE-1 quota detection (ENG-12), ENG-11 useTrackedCards, N24 VocabMode QUIZ_SETS, N25 barrel imports.

**Earlier queued items:** X1/X2 (P0), B1–B5 (P1), DB-1–8, N1–N23, REF-1–9, ENG-1–10, Tests C1-C7.

---

## [4.19.5] - 2026-05-09

### fix: stale counts + daily-challenge CSV pool + vite chunk (Agent Sonnet 4.6)

**Bug fixes:**
- `Onboarding.jsx`: card count `1.438` → `1.443` (2 occurrences — welcome copy + goal-days calculation).
- `index.html`: OG meta description `1.438 kartu flashcard` → `1.443`.
- `daily-challenge.js`: used `WAYGROUND_SETS` directly (same missing-CSV bug as SimulasiMode). Changed to `QUIZ_SETS` — daily question pool now includes all 300 CSV questions.

**Build:**
- `vite.config.js`: `manualChunks` updated — `data-jac` chunk now includes `jac-teori.js` + `jac-lifeline.js`; `data-wayground` chunk includes `quiz-sets.js`.

---

## [4.19.4] - 2026-05-09

### fix: SearchMode wrongCount bug + barrel/schema hygiene (Agent Sonnet 4.6)

**Bug fixes:**
- `SearchMode.jsx`: `wrongCount` was reading raw `quizWrong[id]` value — displays `[object Object]× salah` when the entry is a wrongEntry object. Fixed by wrapping with `getWrongCount()`. Added import.
- `utils/index.js`: stale `STORAGE_KEYS` re-export removed (STORAGE_KEYS was deleted in v3 migration A.7 TD-03); `removeFromStorage` was exported from wrong-tracker.js but missing from barrel — added.
- `utils/index.js`: `standardizeFuri` was exported from jp-helpers.js but missing from barrel — added.

**Code quality:**
- `storage/schema.js`: `quizWrong` comment corrected from `{ [cardId]: count }` to `{ [cardId]: wrongEntry }` (backward-compat: plain int also accepted); prefs DEFAULTS comment alignment fixed; `sprintBest/sprintBestTimeline` note added.
- `contexts/ProgressContext.jsx`: indentation bug in ctx object fixed (misaligned comment); `recordWrong` clarifying comment added (legacy in-doc counter; out-of-docs tracking via wrong-tracker.js + ssw-quiz-wrong is the primary path).

---

## [4.19.3] - 2026-05-09

### test + docs: data integrity tests + blueprint sync (Agent Sonnet 4.6)

**Tests added to `data.test.js` (+24 tests → 411 total):**
- `JAC_TEORI / JAC_LIFELINE split` (8 tests): count, track fields, set keys, topic field presence
- `WAYGROUND_SETS track fields` (4 tests): wt*=common, wg*=lifeline, wp*=lifeline, all sets have track
- `CSV_SETS track fields` (3 tests): ct*=common, cp*=lifeline, all sets have track
- `QUIZ_SETS + getQuizSetsForTrack` (6 tests): total 38 sets, unique IDs, track present, per-track filter
- `SOURCE_GROUPS coverage` (3 tests): all keys in SOURCE_META, Sumber Tambahan group, text3l/vocab-supplementary/vocab-general

**docs/BLUEPRINT-CURRENT.md synced to v4.19.2:**
- Version: 4.19.0 → 4.19.2
- Quiz questions: ~860 → ~974
- Tests: 387 → 411

---

## [4.19.2] - 2026-05-09

### fix: track field bugs + SimulasiMode CSV gap (Agent Sonnet 4.6)

**Bug fixes — track field data:**
- `wayground-sets.js`: wt1–wt10 (Teori sets) were tagged `track:"lifeline"` — should be `track:"common"`. Fixed. Teori sets now visible to doboku/kenchiku track users in WaygroundMode.
- `csv-sets.js`: All 12 CSV sets (ct01–ct06, cp01–cp06) had no `track` field → invisible to `getQuizSetsForTrack()` and WaygroundMode. Added: ct* `track:'common'`, cp* `track:'lifeline'`.

**Bug fix — SimulasiMode exam pool:**
- `SimulasiMode.jsx` was importing `WAYGROUND_SETS` directly, missing all 300 CSV questions. Changed to `QUIZ_SETS` from `quiz-sets.js`. Exam pool now includes JAC (95q) + Wayground (579q) + CSV (300q) = ~974 questions total.

---

## [4.19.1] - 2026-05-09

### chore: C1 closure + hygiene pass (Agent Sonnet 4.6)

**C1 text4 audit — content complete:**
- Scanned text4.pdf (JAC Ch.4 — construction site greetings, layout terms, earthwork, foundation, concrete, building structure, electrical, lifeline, 5S, ほうれんそう)
- Result: 100% of Ch.4 terminology pre-exists in card DB — no new cards needed
- C1 fully closed: text3l +18 (v4.16.0) + pass2 +15 (v4.17.0) + text4 audit (0 new)

**categories.js fix (SumberMode coverage gap):**
- Moved supplementary SOURCE_META entries (`text3l`, `vocab-supplementary`, `vocab-general`) from mutation-style to inline in main object
- Added "Sumber Tambahan" group to SOURCE_GROUPS → SumberMode now shows all 3 supplementary sources (text3l: 25 cards, vocab-supplementary: 271 cards, vocab-general: 44 cards)
- Added SOURCE_ACCENT entries for `text3l`, `vocab-supplementary`, `vocab-general`

**Docs:**
- `BLUEPRINT-CURRENT.md` — status updated: NO OPEN ITEMS
- `_MAP.md` — log entry added
- `docs/archive/ARCHIVE-INDEX.md` — stale text4l reference removed

---

## [4.19.0] - 2026-05-08

### refactor: full data layer restructure — track fields + JAC split + quiz-sets merge (Agent Sonnet 4.6)

**Structure overhaul** — semua data file kini punya `track` field; JAC split by type; wayground+csv merged.

**JAC Official split:**
- `jac-teori.js` — 学科 tt1+tt2, 65qs, `track:'common'` (sama untuk semua 3 track)
- `jac-lifeline.js` — 実技 st1+st2 Lifeline, 30qs, `track:'lifeline'`
- `jac-doboku.js` / `jac-kenchiku.js` — empty stubs, siap diisi dari PDF
- `jac-official.js` → backward-compat shim (`[...JAC_TEORI, ...JAC_LIFELINE, ...]`)

**Question sets merged:**
- `quiz-sets.js` — single source of truth = WAYGROUND_SETS + CSV_SETS
- `getQuizSetsForTrack(track)` helper function
- wayground wt1–wt10 → `track:'common'`; wg*/wp* → `track:'lifeline'`
- CSV sets → `track:'lifeline'`

**Study aids — track field added:**
- `danger-pairs.js` — common: 12 pairs, lifeline: 8 pairs (per-pair track field)
- `angka-kunci.js` — common: 22 entries, lifeline: 7 entries (per-entry track field)

**Components updated — filter by current track:**
- WaygroundMode: imports QUIZ_SETS, filters `track === 'common' || track === currentTrack`
- VocabMode: wg* sets filtered by track
- DangerMode: PAIRS = DANGER_PAIRS filtered by track
- AngkaMode: ANGKA = ANGKA_KUNCI filtered by track

**index.js barrel** — exports JAC_TEORI, JAC_LIFELINE, JAC_DOBOKU, JAC_KENCHIKU, QUIZ_SETS, getQuizSetsForTrack

- 387/387 tests pass

---

---

## Legacy History (v3.7.0 → v4.18.0)

> Full entry-by-entry history is in git log. Summary below.

| Version | Date | Summary |
|---------|------|---------|
| 4.18.0 | 2026-05-08 | refactor: 157 doboku+kenchiku cards → common; source files emptied for Ch.5+ |
| 4.17.0 | 2026-05-08 | C1-pass2: +15 common cards (1457–1471) from text1l/text2/text3 |
| 4.16.0 | 2026-05-08 | C1: +18 lifeline cards (1439–1456) from text3.pdf (source text3l) |
| 4.15.1 | 2026-05-08 | JAC audit: 6 furi fixes jac-ch1 (KY/CCUS); admin docs |
| 4.15.0 | 2026-05-08 | JAC audit text2.pdf: 17 furi/desc fixes jac-ch2 |
| 4.14.0 | 2026-05-08 | J4: topic field all 95 JAC qs (8 topics); J2: JACMode topic filter |
| 4.13.0 | 2026-05-08 | G3: GlossaryMode mini-deck export → Anki TSV |
| 4.12.0 | 2026-05-08 | Q3 difficulty detail; F2/F3 FocusMode; D1 explanation field; G4/W5/AK2/E3/K6 |
| 4.11.0 | 2026-05-08 | StatsMode BUG fix; D2/D3 DangerMode; AK1/AK3 AngkaMode; G2 compact; K5 add-SRS |
| 4.10.0 | 2026-05-08 | J1 JACMode→SRS; K2 read-only toggle; SB3 SumberMode actions; Q5 category filter |
| 4.9.0  | 2026-05-08 | R3/R4/R5 ReviewMode; W1/W4 WaygroundMode; Q4 quiz count; SR4 badges; ST4 week |
| 4.8.2  | 2026-05-08 | SR3 search copy-to-clipboard; SIM5 pace hint |
| 4.8.1  | 2026-05-08 | D1-WT: DengarMode wrong-tracker writes to shared quizWrong pool |
| 4.8.0  | 2026-05-08 | SR1 search history; G1 glossary audio; SB1/SB2 sumber progress; W3/R2/J3 |
| 4.7.0  | 2026-05-08 | W2: WaygroundMode per-set Ulang Salah mode |
| 4.6.0  | 2026-05-08 | E2 Gist sync; F4 Sprint ghost score; ST3 quiz accuracy per category |
| 4.5.0  | 2026-05-08 | B1: QuizProduksiMode (JP→ID type-answer, fuzzy match) |
| 4.4.0  | 2026-05-08 | Phase 5.5: DengarMode, CatatanMode, breadcrumb nav, sessions cap→180 |
| 4.3.1  | 2026-05-08 | Phase 5.3–5.4: B2 Sprint, SIM3/SIM4, F1 achievements, F2 daily challenge, ST1 heatmap, A2 recommend, E4 lz-string |
| 4.3.0  | 2026-05-07 | Phase 5.1: SIM1 pause, BUG-06 JAC+Wayground pool, ST2 Exam Readiness |
| 4.2.0  | 2026-05-07 | BottomNav/Toast test fix; ProductionMode; ConfusionMode |
| 4.1.0  | 2026-05-07 | FE-01–09: CSS modules, a11y, error boundaries, offline banner, haptics, PWA |
| 4.0.2  | 2026-05-04 | post-Codex: furigana, ReviewMode session, ruby rendering, stale branch cleanup |
| 4.0.0  | 2026-05-02 | Phase F+G: exam countdown, audio, QA release |
| 3.9.0  | 2026-05-02 | Phase D+E: export hardening, FlashcardMode decomposition |
| 3.8.0  | 2026-05-02 | Phase B+C: sipil/bangunan content, daily mission, session analytics |
| 3.7.0  | 2026-05-02 | Phase A: bug fixes, storage v3 migration, debt cleanup |
