# 🗺️ _MAP.md — SSW Konstruksi · Agent Orientation

> **Last updated:** 2026-07-11 — session 23 ADMIN sync: session log below caught up — sessions 19–22 were missing (ADM10–13 were already logged correctly; my first pass at this file wrongly assumed they were missing too and duplicated them, caught in review before commit)
> **Version:** v4.22.0 · **Status:** content-dq — DQ done for everything not gated on an owner decision; see `HANDOFF.md`
> **Blueprint:** `docs/BLUEPRINT-CURRENT.md` ← constraints, schema, known gaps (main branch only — not present on content-dq)
> **DQ Spec:** `docs/CARD_CONTENT_SPEC.md` ← canonical schema, ruby rules, task list
> **Archive (main):** `docs/archive/ARCHIVE-INDEX.md` ← main branch's larger archive (proposals, TASK-v4.x files) — not present on content-dq
> **Archive (content-dq):** this branch has its own smaller `docs/archive/` (superseded DQ handoffs only) — see that folder's own `ARCHIVE-INDEX.md`
>
> ⚠️ Much of this file (directory tree below, `package.json`, `scripts/`, `public/`, `.github/`, tests) describes the **full app / main branch**. On `content-dq` you only actually have `src/data/`, `docs/CARD_CONTENT_SPEC.md`, `docs/DATA_ARCH_AUDIT.md`, `docs/archive/`, `viewer.html`, and the admin docs at root — see `README-CONTENT-DQ.md` for the accurate content-dq-only file list.

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
    │   ├── cards.js                ← CARDS[1443 on main; 1,438 on content-dq — 5 dup cards deleted pre-merge, see HANDOFF.md]
    │   ├── source/                 ← 4 source files: cards-common (879), cards-lifeline (564),
    │   │                              cards-doboku/kenchiku (empty stubs)
    │   ├── quiz-sets.js            ← QUIZ_SETS (45 sets, was 44 pre-P16): wayground + jac-mockup + doboku + kenchiku
    │   ├── jac-teori.js / jac-lifeline.js / jac-official.js
    │   ├── jac-doboku.js / jac-kenchiku.js   ← empty stubs (future 実技 content)
    │   ├── wayground-sets.js / jac-mockup-sets.js (ex-csv-sets.js, renamed P17)    ← source sets (imported by quiz-sets.js)
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
| `src/data/quiz-sets.js` | QUIZ_SETS = WAYGROUND_SETS + JAC_MOCKUP_SETS + DOBOKU_SETS + KENCHIKU_SETS (45 sets total, was 44 pre-P16 - wayground went 26→27 sets); getQuizSetsForTrack() helper; doboku/kenchiku sets inlined here (REF-9 v4.21.0, renamed P20; CSV_SETS→JAC_MOCKUP_SETS renamed P17) |
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
| 2026-07-11 | content-dq | Agent Claude: session 23 (cont'd, part 8, final) — owner requested handoff to a new agent. Enriched HANDOFF.md: added GETTING STARTED section (repo URL, clone command, token-sharing context) so it works as a standalone upload artifact; added detailed P10 investigation notes (61/119 confirmed copy-of-q hints, the context-drift risk found while dictionary-checking, why generation was not attempted) so the next agent does not have to rediscover this. Caught and fixed a dropped section heading from my own edit before committing. |
| 2026-07-11 | content-dq | Agent Claude: session 23 (cont'd, part 7) — executed P11. 50 instances of a circular non-explanation ("{term} = bahasa Jepangnya.") replaced with the actual meaning, using opts[ans]/opts_id[ans] already present in the same question object rather than inventing translations. Verified ans wasn't always 0 first (12/50 weren't) before trusting an index-0 shortcut. |
| 2026-07-11 | content-dq | Agent Claude: session 23 (cont'd, part 6) — executed P8b (owner: "continue whatever it is until everything's done"). Scoped to q/exp (wglv-jp) + opts (wglv-id) only, not hint, after confirming hint's kanji=meaning-breakdown style was never meant to carry ruby (checked the established P8a-done convention first). Built a whole-repo ruby dictionary (38,754 pairs) for confident lookups; fixed via redundant-dup stripping, round-paren-to-ruby conversion (using the text's own stated reading, not invented), same-question cross-reference, then dictionary lookup at ≥85% confidence. 61 instances across 26 compounds left unresolved on purpose (context-dependent single characters). Caught and fixed an off-by-one in the wayground-sets.js re-splice (missing opening brace before wg12) before committing. |
| 2026-07-11 | content-dq | Agent Claude: session 23 (cont'd, part 5) — executed P16 (OD-2: owner confirmed now). Verified the spec's wglv01 direction table was wrong (claimed 100% JP→ID, actual 26 ID→JP/24 JP→ID) before trusting it - corrected in CARD_CONTENT_SPEC.md. Real split: 117 ID→JP + 119 JP→ID = 236, chunked into wglv-jp-01/02/03 + wglv-id-01/02/03 (~39-40 each). Same monolith-drift pattern as P17: wayground-sets.js held stale content under legacy ids wg6/wg7/wg8/wg9/wg11 (not wglv01-05), with at least one confirmed drift (duplicated ruby on wg6 id=4, already fixed in the split file). Rebuilt from the split-file content. Found (not fixed) a malformed-opts data issue in one carried-over question, added to HANDOFF.md's judgment-call bucket. |
| 2026-07-11 | content-dq | Agent Claude: session 23 (cont'd, part 4) — executed P6+P13 (OD-1: owner confirmed merge). 226 cards on vocab-lifeline(113)/vocab-general(44)/vocab-teori(18)/vocab-core(13)/vocab-exam(38) reclassified to vocab-supplementary (269→495), across all 3 layers (5 split files + both source/ mirrors + cards.js, 678 total line changes = 226×3). Verify script confirms 0 deprecated values remain, all counts/mirrors still consistent. |
| 2026-07-11 | content-dq | Agent Claude: session 23 (cont'd, part 3) — owner answered OD-1 (merge), OD-2 (now), OD-3 (now) via quick tappable choices. Fixed the id=82/83/186/188/201 corruption (verify script now exits 0). Executed P17: sets/csv/→sets/jac-mockup/, ct*/cp*→jmt*/jml*, source unified to 'jac-mockup', titles/ids/export-names per CARD_CONTENT_SPEC.md §1.4. Also updated csv-sets.js→jac-mockup-sets.js (the actual monolith the running app consumes via quiz-sets.js — not just the split files, which was a scope gap the task list didn't make obvious) + quiz-sets.js + index.js + viewer.html + this file + README-CONTENT-DQ.md reference updates. |
| 2026-07-11 | content-dq | Agent Claude: session 23 (cont'd, part 2) — owner requested a redesign for a multi-agent relay workflow (upload/download one .md per agent handoff). Consolidated SESSION_PROMPT.md + DATA_QUALITY_HANDOFF_v18.md + PROGRESS.md's active checklist into one file, `HANDOFF.md`, always edited in place (no version numbers); all three archived. Added `scripts/verify-content.mjs` — dependency-free, catches syntax corruption and count mismatches without needing the main-branch build pipeline; confirmed it correctly flags the still-open id=82/83/186/188/201 corruption and correctly passes on a fixed test copy. Updated README-CONTENT-DQ.md + this file's own header/tree-comment to point at HANDOFF.md instead of the now-archived files. (Note: this row was briefly overwritten by mistake instead of added as a new row, then restored — same class of editing slip as the ADM10-13 duplication earlier this session, caught the same way, by reviewing the diff before trusting it.) |
| 2026-07-11 | content-dq | Agent Claude: session 23 ADMIN sync — HANDOFF v17→v18 (10 commits/2 sessions stale); SESSION_PROMPT rewrite; README-CONTENT-DQ.md 3× dangling v16 refs fixed; PROGRESS.md ref bump; this session-log gap (sessions 19–22 were missing — ADM10–13 below were already logged, my mistake initially claiming otherwise) backfilled; v16+v17 archived to docs/archive/; cards.js header comment fixed (1443→1438); found (not fixed) type-field corruption in 5 source/ mirror records — see HANDOFF v18 §1D |
| 2026-05-18 | content-dq | Sonnet 4.6: session 22 — P14/P15 SELESAI (581 konsep→vocab, 1092 usage added, 100% vocab coverage); P8a item 2 sets/csv/ ruby+hint+opts (0 naked remaining) |
| 2026-05-16 | content-dq | Sonnet 4.6: session 21 — HANDOFF v16→v17 sync (card count, source counts, known-issues, codebase state, session log 18–20) |
| 2026-05-16 | content-dq | Sonnet 4.6: session 20 — integrity checks (1,438 IDs, no dups, mirrors ✅); P17 dirty state OPSI B; P8a items 1/3/4/5 done (sets/jac/, sets/quiz/, wayground, wtv01) |
| 2026-05-15 | content-dq | Sonnet 4.6: session 19 — P0–P5,P7,P9: encoding fixes (id=476,773), 12 nested ruby, 62 jp ruby, 18 katakana ruby, ~140 naked jp parens, 10 naked desc, 52 id_text, 6 metadata, 5 duplicate cards deleted, 26 id_text disambiguated, P5-C 13 symbol fixes, 3 null angka-kunci fixed |
| 2026-05-14 | content-dq | Sonnet 4.6: ADM13 — last pass: C1 file path (773→vocab-supplementary), C2 table row 619 added, SESSION_PROMPT OD-4, hash sync 319f2c8 |
| 2026-05-14 | content-dq | Sonnet 4.6: ADM12 — recheck2: hash 319f2c8, type enum order, dangling v16 refs, §8 P6 ordering warning, _MAP ADM11 entry |
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
