## [5.0.0] - 2026-08-28

### Major version bump — overdue. Two full work streams since 4.23.0, neither ever recorded here

`package.json` and this file both sat frozen at 4.23.0 since the content-dq merge
(2026-08-18) despite two substantial, separate bodies of work landing on `main` after
it — the version-bump discipline visible throughout this file's own earlier history
(patch bumps most sessions, minor bumps for real features) simply stopped being followed.
Caught and corrected on direct request, not found proactively — worth being honest about
that rather than implying otherwise. Major, not minor: the combined scope (a full UI/UX
pass touching nearly every screen, plus a live-bug-fixing pass that changed real user-
facing behavior in Simulasi, Belajar, and Saya) is a bigger jump than this project's own
historical minor-bump threshold.

### Stream 1 — `feat/ui-overhaul`, merged 2026-08-26 (fast-forward, no merge commit)

61 items total across two plans (38 items 2026-08-25, then 23 more items 43–65
2026-08-25/26), full detail in `docs/archive/HANDOFF-ui-overhaul-38-items.md` and
`_MAP.md`'s session log — summarized here, not repeated in full:

- **Furigana/ruby consistency**: true `<ruby>` markup replacing detached reading rows in
  `ReviewMode`, furigana policy enforcement across ~20 rendering surfaces, `QuizAnnouncer`
  screen-reader support.
- **Visual/interaction polish**: swipe gestures, `ResultScreen` adopted by 6 previously
  hand-rolled modes, shared `QUIZ_COUNTS` constant (fixed a persistence bug in the
  process), animations, A-Z bar tap targets.
- **Performance/offline**: self-hosted subsetted fonts (92% size reduction vs. naive
  self-hosting), manifest-driven `PRECACHE_URLS` (was 2 hand-written entries; now
  generated from Vite's real build manifest — 38 entries, the 3 highest-traffic modes'
  full dependency chains plus the shell).
- **Exam-readiness estimate, weak-category drilling, per-question timing, typed-answer
  diff display** — approved enhancements shipped as part of the 43–65 plan.
- 600/600 tests at merge time (up from 546 at the start of the 38-item plan).

### Stream 2 — 2026-08-27/28, live-bug-fixing sessions (this file's most recent work)

Two consecutive days, one continuous set of conversations, triggered by the owner
testing the just-merged `feat/ui-overhaul` build directly on-device. Full evidence per
fix in `_MAP.md`'s 2026-08-27 and 2026-08-28 rows and `HANDOFF.md`'s CURRENT STATE —
summarized here:

**Ruby/furigana — a second pass, systemic this time.** The 38-item plan's furigana work
fixed the rendering *mechanism*; this pass found the mechanism was still only wired up in
a fraction of the places that needed it. `parseRubyFragments` didn't handle particle/
number-interrupted phrases (`安全確認の8項目` and ~250 similar) correctly — fixed at the
code level (handles the whole class, not just known cases) and for 35 data entries
verified with high confidence (`docs/RUBY_MISMATCH_AUDIT.md` tracks the 210 that weren't
confident enough to auto-fix). `DescBlock` — a component that already correctly rendered
ruby in structured text — turned out to be adopted in exactly one place
(`FlashcardMode/FlipCard.jsx`); adopted in the 6 other modes that needed it
(`ReviewMode`, `GlossaryMode`, `ProductionMode` ×2, `QuizProduksiMode`, `SumberMode`).
`QuizShell` and `ResultScreen` — both shared across most of the app's quiz-style modes —
had the same raw-render gap in their hint/explanation/answer-review fields, fixed once
at the shared-component level rather than per-mode. A second, more systematic audit pass
(triggered by the owner asking directly whether the first pass was actually thorough — it
wasn't, and that was the honest answer given at the time) found more gaps a field-name
search alone couldn't: `AngkaMode`'s `item.soal`, `subtitle` on Wayground/JAC Mockup sets,
the Saya tab's daily-challenge feature (traced to `daily-challenge.js` building its own
question shape independently of every other already-fixed path), a `StatsMode`
truncation that could cut a ruby marker in half mid-string, and `ErrorBoundary`'s
old-WebView flashcard fallback. Verified via Playwright across all 21 modes with data
seeded to trigger review/detail paths, not just unit tests.

**Bug reports, root-caused against real code rather than assumed:**

- **Praktik Set** (10 sets) was being counted into "Kosakata · Vocab Drill" — moved into
  "Soal Teknis" (`WaygroundMode`), which surfaced a second bug in the same file: 12 "JAC
  Mockup" sets (300 questions) were counted in that screen's own header total but
  unreachable from any group list, since the group-matching prefixes hadn't been updated
  when those set ids were renamed in an earlier session.
- **Sprint** had no way to exit or pause mid-round — added both, with the pause overlay
  itself offering an exit path rather than being a separate, disconnected control.
- **Fokus** showed a green checkmark next to 0% mastery — not a data bug; a "drilled this
  session" indicator and actual mastery percentage are intentionally independent signals
  that happened to share a color, read as contradictory. Recolored, not restructured.
- **`BelajarTab`'s compact-tile grid** was never actually rendering 2 columns on any
  phone, despite the code's own comment saying that was the design — root cause needed
  Playwright to find: `repeat(auto-fit, minmax(min, max))` picks column count from `max`
  when `max` is a fixed length, not `min`, the opposite of what the fix's first attempt
  assumed. Same root mechanic (the reverse case — `min` governing count when `max` is
  `1fr`) caused a second, more severe bug found afterward: `SayaTab`'s settings/stats grid
  had a 400px minimum column width wider than this app's entire mobile content column,
  which doesn't just fail to add a column the way `BelajarTab`'s did — it's a hard floor,
  so every section on the Saya tab was forced 52px wider than the viewport, needing a
  manual pinch-zoom to use. `docs/LAYOUT_SPEC.md`'s Variant A/B guidance corrected both
  times so this mechanic doesn't get relearned the hard way a third time.
- **Simulasi restructured** at the owner's request into two explicit question sources
  instead of one undifferentiated 1075-question pool: "Teori & Praktik" (Wayground + JAC
  Mockup, sampled at a fixed 60/40 teori/praktik ratio — 30+20 for the full exam, scaling
  to 9+6 and 15+10 for smaller presets) and "JAC Official" (its own real internal
  structure — 2 teori sets, 2 praktik sets, sizes genuinely uneven — discovered mid-
  conversation after an initial wrong claim that no such structure existed, corrected
  once the owner pushed back with specifics). Every start resamples fresh rather than
  drawing from a fixed set.
- **Belajar tab reworked into an accordion** — featured card per section always visible,
  secondary items collapse per section (agreed via Visualizer mockups before
  implementation, not built sight-unseen). Verified via Playwright that every section
  collapsed now fits the whole tab in a single screen with zero scrolling, down from a
  multi-screen scroll before.

617 → 632 tests across this stream (605 at the start of 2026-08-27, +7 net through the
day, +5 more for the accordion) — exact progression per-commit in `_MAP.md`, not
restated here.

### Known follow-up work, not done here

- `docs/RUBY_MISMATCH_AUDIT.md`: 210 ruby entries flagged but not auto-fixed with
  confidence — needs a human who can verify actual Japanese readings.
- 94 question-text entries carry a redundant mixed annotation style (proper `《》` ruby
  markers duplicated by adjacent plain-paren readings) in `wayground-sets.js` — confirmed
  **not** an active rendering bug (`stripFuri`'s existing handling already absorbs it
  safely wherever it's actually used), but a content-authoring cleanliness item worth a
  future pass. Found incidentally while investigating the `SayaTab` overflow above; that
  bug turned out to be unrelated (a pure CSS grid issue).

## [4.23.0] - 2026-08-18

### merge(content-dq→main): branch merge — 3.5 months of content-quality work + Doboku/Kenchiku removal + furi→ruby migration

`content-dq` and `main` shared no common git ancestor (content-dq's root commit stripped the
app layer down to data-only on day one, 2026-05-10) — reconciled as a mechanical file union
(`git merge --allow-unrelated-histories`) followed by manual code surgery for everything the
file-level merge couldn't resolve on its own. Full writeup in `_MAP.md`'s session log and
`HANDOFF.md`.

**Data layer — replaced wholesale from content-dq:**

- `src/data/` restructured to a split-file architecture (`cards/{common,lifeline}/`,
  `sets/{wayground,jac-mockup,jac}/`) with `source/` mirrors and `cards.js`/`wayground-sets.js`/
  `jac-mockup-sets.js` as regenerated aggregates.
- Card count: 1,443 → 1,438 (5 duplicates removed). Quiz questions: ~974 → ~1,075 (Wayground
  680 · JAC Mockup 300 · JAC Resmi 95).
- `furi` field dropped from all 1,438 cards — readings now derived from inline `《》` ruby in
  `jp` via `extractReadings()` (already existed in `jp-helpers.js`).

**Doboku/Kenchiku tracks removed** (content-dq session 24 decision, propagated into the app
layer here): both tracks were 100% AI-generated draft content with zero official JAC material.
Deleted `DobokuMode.jsx`, `KenchikuMode.jsx`, `TrackPicker.jsx` (found to be fully dead code
during this pass — zero imports anywhere), removed the track-picker step from onboarding
entirely (single remaining track makes a "choice" meaningless — renumbered the flow from 4
steps to 3), 33 files touched in total. `dobokuScores`/`kenchikuScores` dropped from storage.

**JAC schema migration:** `jp/hiragana/options/answer/hasPhoto` → `q/hint/opts/opts_id/ans/
img/exp`. Reading now inline ruby in `q`; `opts_id` cleanly separates per-option Indonesian
translations (previously embedded inline in the JP option string). `JACMode.jsx`,
`SimulasiMode.jsx`, `daily-challenge.js` updated.

**furi → ruby migration, 12 files:** every real consumer of the dropped `card.furi` field
swapped to `extractReadings(card.jp)` — `Onboarding.jsx`, `QuizMode.jsx`, `ProductionMode.jsx`,
`FlashcardMode/FlipCard.jsx`, `SprintMode.jsx`, `SearchMode.jsx`, `GlossaryMode.jsx`,
`SumberMode.jsx`, `ReviewMode.jsx`, `CatatanMode.jsx`, `QuizProduksiMode.jsx`, `DengarMode.jsx`.
`ProductionMode.jsx`'s kana-only answer-matching branch needed more than a rename: the old
`furi` field concatenated multi-reading cards with no separator, `extractReadings()` joins
with a display space — fixed by normalizing whitespace before comparing, otherwise correctly-
typed answers on ~20% of cards (294/1438 have multiple ruby blocks) would have started failing.
Also fixed two pre-existing bugs found adjacent to this work: `CatatanMode.jsx` and
`DengarMode.jsx` were rendering raw `card.jp` (ruby brackets included) instead of
`stripFuri(card.jp)`.

**Storage v5 → v6:**

- `dobokuScores`/`kenchikuScores` dropped.
- `wgScores`/`jacScores`/`wgWrong` keys remapped for the wayground/CSV set-id rename, but only
  where a clean 1:1 correspondence could be verified (teori `wt1-10→wt01-10`, CSV→JAC-mockup
  `ct/cp→jmt/jml`, 22 sets). Deliberately not remapped: old praktik/vocab set ids — the old
  monolith had a confirmed set/track drift bug and vocab was genuinely restructured by question
  direction, not renamed, so no reliable correspondence exists to map from.

**Build pipeline fixes** (found by actually running `npm run build`, not caught by tests/lint):
`scripts/merge-cards.mjs` had the 2 deleted doboku/kenchiku source files hardcoded — fixing this
and regenerating `cards.js` also surfaced 10 cards where the committed aggregate had a
duplicated trailing sentence fragment already fixed in the source files but never propagated
(content-dq had no regeneration script). `scripts/validate-data.mjs`'s photo-asset check was
rewritten — it validated against a `public/jac-photos/` directory that has never existed,
meaning it fired a warning for every photo-linked question unconditionally since it was
written; now checks that the `photoDesc` text substitute (what the app actually renders) is
present and substantive instead. `vite.config.js`'s `manualChunks` referenced deleted file
paths directly (Rollup-only failure, invisible to imports elsewhere).

**Docs:** `HANDOFF.md`, `CARD_CONTENT_SPEC.md`, `DATA_ARCH_AUDIT.md`, `viewer.html` adopted from
content-dq. `DATA_QUALITY_HANDOFF_v8/v11/v12.md` moved to `docs/archive/` (superseded by
`HANDOFF.md`, same lineage). `docs/archive/ARCHIVE-INDEX.md` combined from both branches.
`README.md`/`_MAP.md` rewritten for the merged, single-track reality.

**Tests:** 435 passing (39 files) — up from a real baseline of 23 failures across 7 files
immediately post-merge (stale set-id references, dead doboku/kenchiku assertions, 2 pre-existing
`STORAGE_VERSION` hardcodes that already didn't match main's own code before this merge).
`npm run lint`: 0 warnings (also cleared one pre-existing unused import, predating this merge).
`npm run build`: clean.

### feat(data+storage): card ID renumbering — contiguous 1–1443

**Card IDs renumbered:**

- All 1,443 cards now have contiguous IDs 1–1443 (was 1–1628 with 185 gaps)
- Source files updated: cards-common.js (879 cards), cards-lifeline.js (564 cards)
- Cross-references updated: 73 JAC `related_card_id` refs, 24 `angka-kunci.js` kartu refs
- `scripts/renumber-cards.mjs`: one-shot script that built the mapping and rewrote all files

**Storage schema v4:**

- `STORAGE_VERSION` bumped 3 → 4
- `src/storage/card-id-map-v4.js`: old→new ID mapping (1443 entries)
- `migrate_v3_to_v4()`: remaps SRS card keys, known/unknown/starred arrays, quizWrong/wrongCounts
- Full migration chain: v1→v4, v2→v4, v3→v4 all handled in engine.js init
- Existing users' SRS progress fully preserved via remap

**Tests:** 457 passing (41 files) — version assertions updated (v3→v4), SRS key expectations updated

## [4.21.1] - 2026-05-09

### refactor(hooks) + fix(WaygroundMode) + feat(ExportMode): OVERHAUL-1 + ENG-4 + ENG-6

**OVERHAUL-1 — Retire usePersistedState.js:**

- `usePersistedState.js` deleted; removed from `hooks/index.js`
- `QuizMode.jsx`: replaced `usePersistedState('ssw-quiz-wrong', {})` with `useProgress().quizWrong` + `recordWrong`
- `DangerMode.jsx`: replaced `setDangerWrong(...)` with `useProgress().recordWrong(key)`
- `DengarMode.jsx`: replaced `setQuizWrong(...)` with `useProgress().recordWrong(cardId)`
- All quizWrong writes now flow through engine (lz-string compressed, exportable)

**ENG-4 — WaygroundMode legacy read fix:**

- `getSetWrongCount(setId)` migrated from `loadFromStorage('ssw-wg-wrong-${setId}')` to `get('progress')?.wgWrong` prefix scan
- `loadFromStorage` import removed from WaygroundMode

**ENG-6 — ExportMode richer summary:**

- `readSummary()` now includes: `quizWrong`, `wgWrong`, `jacScores`, `wgScores` counts
- Export stats display shows "Salah Kuis" and "Skor JAC" tiles

**Tests: 457 passing (41 files) — 9 new tests (OVERHAUL-1 × 3, ENG-4 × 2, ENG-6 × 4)**

## [4.21.0] - 2026-05-09

### refactor(data): data layer consolidation (REF-8 + REF-9 + C1-C9)

**REF-8 — Merge vocab source files (8 → 4 source files):**

- cards-common-vocab.js (233 cards) merged into cards-common.js → 879 total
- cards-lifeline-vocab.js (120 cards) merged into cards-lifeline.js → 564 total
- cards-doboku-vocab.js + cards-kenchiku-vocab.js (both empty stubs) deleted
- scripts/merge-cards.mjs inputs updated; count 1443 verified

**REF-9 — Absorb sipil/bangunan sets into quiz-sets.js:**

- SIPIL_SETS + BANGUNAN_SETS inlined into quiz-sets.js with track:'doboku'/'kenchiku'
- sipil-sets.js + bangunan-sets.js deleted
- SipilMode + BangunanMode use getQuizSetsForTrack() instead of direct imports
- sipil-data.test.js + bangunan-data.test.js updated to import from quiz-sets.js
- data/index.js: removed direct SIPIL_SETS/BANGUNAN_SETS re-exports
- Total QUIZ_SETS: 38 → 44 (+ 3 sipil + 3 bangunan)

**Tests C1-C9 — data-integrity.test.js:**

- C1: SOURCE_GROUPS keys in SOURCE_META
- C2: related_card_id refs valid
- C3: every QUIZ_SET has track field
- C4: no \_origIndex in CARDS
- C5: CARDS count = 1443
- C6: no duplicate card IDs
- C7: quiz answer index in bounds
- C8/C9: doboku/kenchiku track includes sipil/bangunan sets
- 448 total tests, 40 files

## [4.20.15] - 2026-05-09

### feat: useTrackedCards hook (ENG-11)

- hooks/useTrackedCards.js: centralized filtered-cards hook (track + excludeVocab + category + source + knownOnly + unknownOnly + starredOnly)
- hooks/index.js: barrel export added
- tests/useTrackedCards.test.jsx: 6 tests covering track filtering, excludeVocab, source, category, edge cases (439 total, 39 files)
- Existing sites (SearchMode, GlossaryMode, ModeRouter) deferred — all have showAllTracks or null-track conditional; don't force-fit per task spec

## [4.20.14] - 2026-05-09

### perf: JpDisplay memoization (REF-11)

- jp-helpers.js: parseDescStructure() — pure function for desc branch detection
- JpDisplay DescBlock: useMemo([desc, maxLines]) via parseDescStructure — no re-parse on unrelated renders
- JpDisplay JpFront: jpBranch useMemo([jp]) — vs/bullet/colon/arrow/plain detection memoized

## [4.20.13] - 2026-05-09

### perf: context memoization (REF-10 + ENG-13)

- AppContext: ctx wrapped in useMemo — stable reference across unrelated re-renders
- ProgressContext: ctx wrapped in useMemo with EMPTY_OBJ/ARR stable defaults
- SRSContext: stableSrs via useMemo([srs.dueCount, srs.review, ...]) — rebuilds only after review()
- hooks/useStableContextValue.js: ENG-13 marker file (useMemo inline per ESLint constraint)
- tests/context-memo.test.jsx: 3 memoization tests added (432 total, 38 files)

## [4.20.12] - 2026-05-09

### fix + feat: storage quota detection (STORAGE-1 + ENG-12)

- engine.js writeDoc: QuotaExceededError no longer silently swallowed; returns {ok, reason}
- New utils/storage-quota.js: isQuotaError, notifyQuotaExceeded, estimateStorageUsage, setQuotaHandler
- App.jsx: registers quota handler → toast on write failure
- utils/index.js: barrel updated

## [4.20.11] - 2026-05-09

### fix: direct-import corrections

- N24: VocabMode — WAYGROUND_SETS → QUIZ_SETS (includes 300 CSV questions in vocab pool)
- N25: JACMode + SimulasiMode — JAC_OFFICIAL via data/index.js barrel

## [4.20.10] - 2026-05-09

### fix: DB-1, DB-6, DB-7, DB-8

- DB-1: JACMode + QuizShell — photo banner for hasPhoto questions (yellow chip with photoDesc)
- DB-6: categories.js — 5 empty track categories marked placeholder:true + note (doboku_doko/hoso/haisui, kenchiku_kutai/shiage)
- DB-7: angka-kunci.js — intentional kartu:null exam meta entries annotated with comment
- DB-8: covered by ENG-9 validate-data.mjs duplicate ID check (v4.20.9)

## [4.20.9] - 2026-05-09

### fix + feat: data integrity layer

- DB-2: JACMode filterIds guard — filter undefined/null related_card_id refs (typeof === number)
- DB-3: sipil-sets + bangunan-sets SEED DATA headers removed
- DB-4: empty source file headers updated (Cards: 0 + migration note)
- DB-5: wayground-sets.js header — 12 set → 26 sets / 659 questions
- ENG-9: scripts/validate-data.mjs — pre-build data integrity checker (prebuild hook); patched 3 broken ANGKA_KUNCI kartu refs
- ENG-10: scripts/audit-related-ids.mjs — one-shot cross-ref script; patched 22 broken related_card_id refs → null

## [4.20.8] - 2026-05-09

### fix/feat: F1 F2 F4 R1 R2 N10

- **R1** ReviewMode: removed `_lastResult` / `setLast` dead state (never read; 3 occurrences)
- **R2** Dashboard: `streak` / `dailyCount` now from `useProgress()` (fixes stale `useMemo([], [])` freeze at mount); removed module-level `getStreak` / `getDailyCount` helpers
- **F1** Dashboard: starred-cards quiz button — visible when `starred.size > 0`, launches `kuis` with `filterIds`
- **F2** SumberMode: added `✍️ Produksi` and `🔤 Kuis Prod` quick-launch buttons alongside existing Kartu/Sprint/Kuis
- **F4** `validateSnapshot` summary: added `migrated` field (`true` when snapshot version < `STORAGE_VERSION`); `ExportMode` shows migration notice on both file-import and Gist-pull restore paths
- **N10** SprintMode: `sprintBests` now keyed by `selectedDuration` — each duration (30s/60s/2min) has independent personal best + ghost timeline; duration picker reloads bests on switch
- **Test fix** `components.dashboard.test.jsx`: wrapped all renders in `ProgressProvider` (required by R2 `useProgress` hook)

## [4.20.7] - 2026-05-09

### feat: useDailyChallenge hook — persists to storage engine (ENG-5, N5)

- ENG-5: Added `dailyChallengeLog: {}` to `DEFAULTS.prefs` in schema
- Created `src/hooks/useDailyChallenge.js` — encapsulates daily challenge state, persists answer to storage engine instead of sessionStorage
- `hooks/index.js`: barrel-exports `useDailyChallenge`
- `SayaTab.jsx`: replaced inline sessionStorage state (8+ lines) with `useDailyChallenge()` hook; removed `dcSelected` state; uses `dcAnswered.selected` for option highlighting

## [4.20.6] - 2026-05-09

### fix: wrong-answer + score writes via storage engine (N3, N7, N16, REF-3, N20, REF-3b, N11, R3)

- N3: ProductionMode — recordWrong called on wrong answer and skip
- N7: JACMode — wrongCounts now via storage engine (get/set), not raw usePersistedState key
- N16: QuizProduksiMode — wrong answers via ProgressContext.recordWrong, removed raw usePersistedState
- REF-3: VocabMode — vocabWrong writes via storage engine; WaygroundMode — wgWrong writes via engine
- N20+REF-3b: JACMode, WaygroundMode, VocabMode — score writes via ProgressContext.saveScore (not raw usePersistedState)
- N11: schema.js — sprintBests: {} added to DEFAULTS.prefs
- R3: FocusMode — dead \_unknown prop removed; ModeRouter — unknown removed from fokus props

## [4.20.5] - 2026-05-09

### feat + fix: useSessionTimer, durationMs, recordWrong, N14, B4 (OVERHAUL-2, N6, N21, N22, N14, B4)

- OVERHAUL-2: New src/hooks/useSessionTimer.js — centralized session duration tracking (getDurationMs, reset)
- N6/N17: ModeRouter — both makeSessionEnd and makeFinishHandler now accept + forward durationMs
- N6: QuizShell — tracks startTimeRef, passes durationMs to onFinish
- N6: 5 QuizShell modes (JAC, Vocab, Wayground, Sipil, Bangunan) forward durationMs in handleFinish
- N6/N21: All 9 non-QuizShell modes (Sprint, Simulasi, Confusion, Production, Danger, Angka, Review, QuizProduksi, Dengar) add useSessionTimer + pass durationMs
- N22: ProgressContext.recordWrong — uses makeWrongEntry format (was plain int)
- N14: daily-challenge.js — buildAllQuestions() hoisted to module-level const ALL_QUESTIONS (called once on import)
- B4: recommend-mode.js — maintenance-phase rotation (produksi/dengar/mirip) when matureCount > 300 && avgAcc > 70
- eslint: react-hooks/purity off (not using React Compiler)
- Tests: 429 passing, 37 files

## [4.20.4] - 2026-05-09

### feat + fix: MODE_META color/strand (ENG-3, F3, B2, REF-4)

- ENG-3: All 23 MODE_META entries now have `color` (hex) and `strand` fields
- F3: StatsMode — removed local MODE_COLORS object; uses MODE_META[mode].color
- B2: daily-mission.js — added produksi, kuisprod, mirip, dengar to MISSION_TYPES
- REF-4: MISSION_TYPES strands now derive from MODE_META (permanent single source)

## [4.20.3] - 2026-05-09

### feat + fix: session-analytics.js (ENG-1, ENG-7, B3, N2, N4)

- ENG-1: New src/utils/session-analytics.js — single source of truth for session math (getAvgAccuracy, getBestSimScore, hasPerfectSprint, getStrandCounts, calcReadiness)
- B3: StatsMode.jsx — replaced local calcReadiness + narrow ['kuis','jac','wayground'] filter with session-analytics imports
- N2: recommend-mode.js — replaced narrow quiz filter with getAvgAccuracy(sessions, 10)
- N4: achievements.js — replaced narrow quiz filter with getAvgAccuracy; quiz_70 now fires for all SCORED_QUIZ_MODES
- ENG-7: session-analytics.test.js — 13 new tests (429 total, 37 files)

## [4.20.2] - 2026-05-09

### feat + fix: constants extraction (ENG-2)

- ENG-2: New src/utils/constants.js (TOTAL_CARDS, SCORED_QUIZ_MODES, SRS_MATURE_DAYS, SESSIONS_CAP, etc.)
- N15: ProgressContext — SESSIONS_CAP constant (was hardcoded 180)
- N19: fsrs-scheduler — SRS_MATURE_DAYS constant (was hardcoded 21)
- B5 (P1): StatsMode calcReadiness — spurious ×100 removed; readiness now 0–100 correctly
- B1 (P1): achievements half_deck/full_deck thresholds updated to HALF_DECK_THRESHOLD/TOTAL_CARDS

## [4.20.1] - 2026-05-09

### fix + feat: UTC date bugs (REF-6 + ENG-8)

- REF-6: New src/utils/date.js — todayStr/prevDayStr/isoToLocalDate (local tz, not UTC)
- N13 (P1): ProgressContext streak tracking now uses local dates — fixes false streak resets at 07:00 WIB
- N9: daily-challenge + daily-mission use local todayStr
- N18: StudyHeatmap grid keys use local timezone
- Dashboard.jsx: UTC date references fixed
- ENG-8: src/tests/date.test.js (5 tests)

## [4.20.0] - 2026-05-09

### fix: P0 critical bugs + pre-existing lint crashes

- X1 (VocabMode): MIX_ALL moved inside component; VOCAB_SETS memoized with useMemo — fixes ReferenceError on load
- X2 (SprintMode): quizWrong written to progress doc (was: prefs)
- AngkaMode: `ANGKA_KUNCI` aliased as `ANGKA` at import; removed self-referencing filter — fixes crash on load
- DangerMode: `DANGER_PAIRS` aliased as `PAIRS` at import; removed self-referencing filter — fixes crash on load
- eslint.config.js: `react-hooks/preserve-manual-memoization` disabled (no React Compiler in project)

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
- `WAYGROUND_SETS track fields` (4 tests): wt*=common, wg*=lifeline, wp\*=lifeline, all sets have track
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
- VocabMode: wg\* sets filtered by track
- DangerMode: PAIRS = DANGER_PAIRS filtered by track
- AngkaMode: ANGKA = ANGKA_KUNCI filtered by track

**index.js barrel** — exports JAC_TEORI, JAC_LIFELINE, JAC_DOBOKU, JAC_KENCHIKU, QUIZ_SETS, getQuizSetsForTrack

- 387/387 tests pass

---

---

## Legacy History (v3.7.0 → v4.18.0)

> Full entry-by-entry history is in git log. Summary below.

| Version | Date       | Summary                                                                                                           |
| ------- | ---------- | ----------------------------------------------------------------------------------------------------------------- |
| 4.18.0  | 2026-05-08 | refactor: 157 doboku+kenchiku cards → common; source files emptied for Ch.5+                                      |
| 4.17.0  | 2026-05-08 | C1-pass2: +15 common cards (1457–1471) from text1l/text2/text3                                                    |
| 4.16.0  | 2026-05-08 | C1: +18 lifeline cards (1439–1456) from text3.pdf (source text3l)                                                 |
| 4.15.1  | 2026-05-08 | JAC audit: 6 furi fixes jac-ch1 (KY/CCUS); admin docs                                                             |
| 4.15.0  | 2026-05-08 | JAC audit text2.pdf: 17 furi/desc fixes jac-ch2                                                                   |
| 4.14.0  | 2026-05-08 | J4: topic field all 95 JAC qs (8 topics); J2: JACMode topic filter                                                |
| 4.13.0  | 2026-05-08 | G3: GlossaryMode mini-deck export → Anki TSV                                                                      |
| 4.12.0  | 2026-05-08 | Q3 difficulty detail; F2/F3 FocusMode; D1 explanation field; G4/W5/AK2/E3/K6                                      |
| 4.11.0  | 2026-05-08 | StatsMode BUG fix; D2/D3 DangerMode; AK1/AK3 AngkaMode; G2 compact; K5 add-SRS                                    |
| 4.10.0  | 2026-05-08 | J1 JACMode→SRS; K2 read-only toggle; SB3 SumberMode actions; Q5 category filter                                   |
| 4.9.0   | 2026-05-08 | R3/R4/R5 ReviewMode; W1/W4 WaygroundMode; Q4 quiz count; SR4 badges; ST4 week                                     |
| 4.8.2   | 2026-05-08 | SR3 search copy-to-clipboard; SIM5 pace hint                                                                      |
| 4.8.1   | 2026-05-08 | D1-WT: DengarMode wrong-tracker writes to shared quizWrong pool                                                   |
| 4.8.0   | 2026-05-08 | SR1 search history; G1 glossary audio; SB1/SB2 sumber progress; W3/R2/J3                                          |
| 4.7.0   | 2026-05-08 | W2: WaygroundMode per-set Ulang Salah mode                                                                        |
| 4.6.0   | 2026-05-08 | E2 Gist sync; F4 Sprint ghost score; ST3 quiz accuracy per category                                               |
| 4.5.0   | 2026-05-08 | B1: QuizProduksiMode (JP→ID type-answer, fuzzy match)                                                             |
| 4.4.0   | 2026-05-08 | Phase 5.5: DengarMode, CatatanMode, breadcrumb nav, sessions cap→180                                              |
| 4.3.1   | 2026-05-08 | Phase 5.3–5.4: B2 Sprint, SIM3/SIM4, F1 achievements, F2 daily challenge, ST1 heatmap, A2 recommend, E4 lz-string |
| 4.3.0   | 2026-05-07 | Phase 5.1: SIM1 pause, BUG-06 JAC+Wayground pool, ST2 Exam Readiness                                              |
| 4.2.0   | 2026-05-07 | BottomNav/Toast test fix; ProductionMode; ConfusionMode                                                           |
| 4.1.0   | 2026-05-07 | FE-01–09: CSS modules, a11y, error boundaries, offline banner, haptics, PWA                                       |
| 4.0.2   | 2026-05-04 | post-Codex: furigana, ReviewMode session, ruby rendering, stale branch cleanup                                    |
| 4.0.0   | 2026-05-02 | Phase F+G: exam countdown, audio, QA release                                                                      |
| 3.9.0   | 2026-05-02 | Phase D+E: export hardening, FlashcardMode decomposition                                                          |
| 3.8.0   | 2026-05-02 | Phase B+C: sipil/bangunan content, daily mission, session analytics                                               |
| 3.7.0   | 2026-05-02 | Phase A: bug fixes, storage v3 migration, debt cleanup                                                            |
