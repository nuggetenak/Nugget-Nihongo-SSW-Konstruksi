# HANDOFF.md — SSW Konstruksi

> ## 🟢 content-dq merged into main — 2026-08-18 (commit `151a45e`)
>
> content-dq's 3.5-month content-quality sprint (sessions 1–29) is done and merged, verified via
> `npm test` (435/435), `npm run lint` (0 warnings), `npm run build` (clean), plus content-dq's
> own `verify-content.mjs`/`audit-track-consistency.mjs` (both clean).
>
> **Retired 2026-08-19:** the GETTING STARTED/PROTOCOL sections that used to sit here
> (content-dq's own workflow) and the full merge-execution writeup that used to be CURRENT
> STATE's second entry are both archived verbatim to `docs/archive/HANDOFF-content-dq-era.md`.
> Condensed versions: `CHANGELOG.md` `[4.23.0]` (what shipped), `_MAP.md` § Agent Session Log
> (session-by-session).
>
> **This file now holds only live state.** CURRENT STATE's top entry is what's actually true
> today. When it's superseded, it moves to `docs/archive/` rather than accumulating here — see
> `docs/AGENT_WORKFLOW.md` §3 for the retirement steps.

---

**Read `docs/AGENT_WORKFLOW.md` first, always** — clone/read/verify order, token handling,
branch discipline, commit conventions, close-out steps, all of it. Not repeated here; this file
is state, that file is process, and keeping the same thing written in two places is exactly the
failure this repo's docs have already hit once (session 23: `SESSION_PROMPT.md` +
`DATA_QUALITY_HANDOFF_vNN.md` + `PROGRESS.md`'s checklist drifted out of sync with each other and
with reality, all archived, replaced by one file each for state and process).

`_MAP.md`, `docs/CARD_CONTENT_SPEC.md`, `docs/DESIGN_SPEC.md`, `docs/LAYOUT_SPEC.md`,
`docs/COMPONENT_SPEC.md`, `docs/PWA_RELEASE_SPEC.md` — stable reference material, full list with
what each covers in `docs/AGENT_WORKFLOW.md` §4. Read them from the clone; don't duplicate their
content into this file.

---

## CURRENT STATE

**As of this edit, 2026-08-28.** Verify before trusting past this point — this line doesn't
update itself.

- **2026-08-28 (same conversation as 2026-08-27 below, date rolled over mid-session): new
  screenshots, three more reports (font sizing, ruby still inconsistent elsewhere, Simulasi's
  exit/pause UX), owner said work directly on `main` this time instead of a branch — done, but
  every commit still validated before pushing, same discipline as always, just no branch/merge
  step in between. 7 commits, `cfc39a3`..`ff321c0`.**
  - **SimulasiMode, three reported issues at once**: (1) review-list font sizing read as random
    (short answers hitting `jpFontSize`'s largest tier next to longer ones in the same scrolled
    list) — new `maxSize` prop on `JpFront` (`JpDisplay.jsx`) caps it, applied here first. (2)
    Options and hint/id_text showing raw `《reading》` — SimulasiMode hand-rolls its own option
    buttons (item 48) and was never brought in line with how every other mode's options get
    `stripFuri()`'d; hint/id_text needed the opposite treatment (a new `MixedRuby` helper,
    `renderJPWithRuby` + `parseRubyFragments`) since some quiz sets' hint field is a deliberate
    mixed ID+JP kanji-breakdown string, not plain Indonesian — stripping would delete the
    reading that's the point of that hint style. (3) Keluar exited immediately with no
    confirmation during the playing phase (a misclick could discard a 45-minute/1075-question
    attempt) — now confirms via the `useConfirm` hook already in scope for the submit-with-
    unanswered path; pause overlay rebuilt with explicit Lanjutkan/Keluar buttons instead of a
    single tap-anywhere-to-resume target, so pausing doubles as the safe-exit moment being asked
    for.
  - **The ruby gap in SimulasiMode turned out to be one symptom of a much wider one**: traced
    the same raw-`《》` pattern through `QuizShell.jsx` (shared by JACMode/VocabMode/
    WaygroundMode — this is what the reported JAC Official screenshot was), then found
    `DescBlock` (`JpDisplay.jsx`) — a component that already correctly parses ruby *and* has
    for a while — was adopted in exactly one place, `FlashcardMode/FlipCard.jsx`. Everywhere
    else that shows a card's `desc` (ReviewMode, GlossaryMode, ProductionMode ×2,
    QuizProduksiMode, SumberMode) rendered it raw; SearchMode's truncated preview and
    GlossaryMode's Anki export got `stripFuri()` instead since DescBlock's line-based
    truncation doesn't fit a char-based preview. `DangerMode` (`correct`/`traps`/`explanation`
    /quiz options, 2 view variants each) and `ResultScreen.jsx` (shared by 7 more modes —
    `userAnswer`/`correctAnswer`/`explanation`) had the identical gap independently.
  - **Owner asked directly whether the sweep was actually thorough — honest answer at the time
    was no**, the first pass was targeted at what the screenshots showed, not systematic. Built
    an actual cross-reference for round 2: every data field carrying embedded readings in any
    live data file, matched against every render site of that field name in `src/modes` +
    `src/components`. Found what the field-name-matching first pass couldn't: `AngkaMode.jsx`'s
    `item.soal` (29/29 entries in `angka-kunci.js` carry readings), `subtitle` in VocabMode +
    WaygroundMode's set lists, SayaTab's daily challenge (traced to `daily-challenge.js`
    building its own question shape independently of every other already-fixed path),
    StatsMode's "Sering Salah" list (`.slice(0, 20)` on a raw string can cut a `《reading》`
    marker itself in half — worse than just showing it unrendered), and
    `ErrorBoundary.jsx`'s `FlatCardFallback` (the flashcard fallback for old WebViews without
    3D CSS — plausibly relevant to this specific audience's device mix, not just a theoretical
    path). Then went past static analysis, which only matches on field *names* and would miss
    code that reassigns to a different local variable first: rendered all 21 modes in a real
    browser (Playwright) with data seeded to trigger review/detail/wrong-answer paths, swept
    each for literal `《`/`》` in rendered DOM text. All 21 clean. Re-ran the static
    cross-reference too — zero genuine hits left, only confirmed false positives (CSS class
    names matching field names as substrings, generic component props always fed hardcoded
    strings).
  - **One flaky full-suite test run observed** while verifying (`simulasi-exit-and-options.test
    .jsx`'s full-sample check) — passed on isolation and on 4 of 5 full-suite runs; looks like
    test-environment resource contention under full-suite load rather than a logic issue, but
    noted rather than hidden. Worth a look if it recurs.
  - 617/617 tests (614 + 3 new this round), lint + build clean throughout, both rounds.

- **2026-08-28, continued (same conversation, later): SimulasiMode's question source split.**
  Owner asked two quick factual questions first ("mockup test tuh di menu yang mana?", "yang
  simulasi tuh ngambil route soal darimana?") — answered directly from the code (Soal Teknis'
  new JAC Mockup groups from the session above; `buildPool()` combining `JAC_OFFICIAL` +
  `QUIZ_SETS` into one undifferentiated 1075-question pool, plus a noted-but-harmless dead
  `'csv'` tag check that's never matched anything since the same rename that broke
  WaygroundMode's own grouping earlier this session). Owner's reaction: "itu jadi kacau sih" —
  and asked for a real restructure across two follow-up messages, the second one revising the
  first's own "opsi semua" plan mid-thought ("mungkin opsi 'semua' kurang relevan, mending kamu
  atur ulang aja").
  - **Extracted `src/utils/quiz-classification.js`** before duplicating WaygroundMode's
    teori/praktik/vocab id-matching logic into SimulasiMode too — the exact failure mode
    (matching logic living in one place, second consumer drifts from it) already happened once
    this session (the ct/cp→jmt/jml rename). WaygroundMode's `GROUPS` and VocabMode's vocab
    filter both refactored to import from here instead of their own inline prefix checks —
    mechanical, confirmed via their existing test coverage staying green, not assumed safe.
  - **SimulasiMode now asks for a source before a preset**: "Teori & Praktik" (default —
    everything except `JAC_OFFICIAL`, i.e. Wayground + JAC Mockup, sampled at a fixed 60/40
    teori/praktik ratio the owner specified directly — 30+20=50 for the full exam, scaling
    clean to 9+6=15 and 15+10=25 for the smaller presets) vs "JAC Official" (`JAC_OFFICIAL`'s
    own 95 questions, no forced ratio — owner explicitly fine with that: "presentasenya tidak
    sama 30+20 itu which is fine"). Freshly resampled every time Mulai is pressed (owner:
    "generate random based on the pool tiap kali mulai") — the existing seed-driven `useMemo`
    already re-ran on every start, this only changed what it samples.
  - **Resolves the mockup-menu question from the same conversation without extra surgery**:
    `jmt*`/`jml*` (JAC Mockup) are already teori/praktik-classified by the shared predicate, so
    they fall into the "Teori & Praktik" pool automatically — no separate menu needed, argued
    in the response rather than asked as an open question, since the reasoning follows directly
    from the restructure already underway.
  - The old "semua soal" full-pool preset (undifferentiated 1075) is gone — "Ujian Penuh" is
    now a fixed, composed 50 (30+20), per the owner's own follow-up correction.
  - `buildJacPool`/`buildQuizSetsPool` and both preset arrays exported by name specifically so
    the ratio math and classification could be tested directly (8 new tests: the 60/40 math
    generically across every preset not just spot-checked; every pooled question tagged teori
    or praktik and nothing else; vocab never appearing; pool composition cross-checked
    question-by-question against the same set-level predicate WaygroundMode uses, which would
    catch the two disagreeing, not just each looking right in isolation; JAC pool confirmed
    untagged; the UI selector itself). Verified visually (Playwright, both source modes) too,
    not just via tests. Zero changes needed to the *existing* SimulasiMode tests from earlier
    the same day — "Teori & Praktik" + "quick" are both the defaults those tests already
    assumed.
  - 2 commits (`3f7742d`, `ea5cf73`), 625/625 tests (617 + 8 new), lint + build clean.

- **2026-08-28, continued further (same conversation, same day): JAC Official's real set
  structure.** Owner asked for an accordion-style rework of the Belajar menu — discussed with
  the Visualizer tool (mockups, not code) rather than jumping straight to implementation, since
  it's a real IA change worth agreeing on first: recommended featured items stay always-visible
  with only the secondary compact-grid items collapsing per section, specifically because
  hiding daily-driver modes like Kartu/Kuis behind an extra tap would cost real time for
  returning users, not just look cluttered for new ones. No code changed from this yet — still
  a design conversation, not implemented.
  - Owner then asked for `JAC_OFFICIAL`'s internal sampling to use set-pairing too (echoing the
    Teori & Praktik conversation). **First response was wrong, and corrected mid-conversation
    rather than silently fixed later**: claimed `JAC_OFFICIAL` had no set structure at all —
    true of what `buildJacPool()` actually read, false of the underlying data. Owner pushed
    back with specifics; re-verified directly against `sets/jac/jac-teori.js` and
    `jac-lifeline.js` (not the flattened `jac-official.js` compat shim, which concatenates both
    into one array with no grouping preserved downstream) rather than continuing to argue from
    the wrong premise. Real structure: every question already carries a `set` field —
    `tt1`/`tt2` (学科/teori, 29 and 36 questions — genuinely uneven, not a data error) or
    `st1`/`st2` (実技/praktik, 15 each) — just never read by this pool.
  - **`pickJacSetPair()`**: every simulation start now picks one teori set + one praktik set at
    random (not exposed as a choice — owner: "biar keliatan kyk random"), takes everything in
    both. Total is whatever that pair adds up to — 44 or 51, never anything else, since the two
    praktik sets are equal size and teori is what swings it. "Ujian Penuh"'s label updated from
    a hardcoded question count (no longer true — that number was the source pool's total, not
    what an attempt draws) to state the range plainly. Verified live via Playwright, not just
    by test — a real run showed exactly 51.
  - 3 new tests (every draw is exactly 44 or 51 across 60 iterations with both totals required
    to appear; each draw's questions share exactly 2 distinct set labels, confirming one pair
    not a mix of more; existing no-category-tagging coverage unchanged). 1 commit (`b4db773`),
    627/627 tests, lint + build clean.

- **2026-08-28, final round this date: the Belajar-menu accordion, implemented.** Owner
  approved the direction from the Visualizer mockups earlier the same day ("Menu accordion aku
  udah acc. Implement now."). `BelajarTab.jsx`: featured card per section always stays visible;
  only the secondary compact-grid items collapse, toggled by tapping the section header.
  Collapsible derived from `rest.length > 0` (not hardcoded), so Ulasan — the one section with
  exactly one mode — correctly gets a plain non-interactive header, no chevron, nothing to
  collapse. Chevron sits in a round bubble background per the owner's specific follow-up on the
  mockup ("kasih bubble aja biar noticable"). Collapse mechanism is CSS `max-height` +
  `overflow`, not conditional unmounting, so secondary items stay reachable in the DOM even
  visually collapsed. Collapsed by default — verified via Playwright (not just asserted) that
  this delivers what it's for: every section collapsed fits all 5 section headers + featured
  cards + the bottom nav in a single 390×1000 screen with zero scrolling, down from a
  multi-screen scroll before. 5 new tests. 1 commit (`6043ad6`), 632/632 tests, lint clean.

- **2026-08-27 session (two rounds of fixes + a merge, all one conversation): 6 live-site bugs
  reported total, root-caused against actual code each time (not assumed from this file — see
  the correction entry right below for why that mattered), fixed on branch
  `fix/post-overhaul-bugs`, merged to `main` and deployed — owner's explicit call ("merge aja
  langsung"), fast-forwarded (`31b6bd0`, same convention as the previous feat/ui-overhaul merge:
  linear history, no merge commit), deploy confirmed via the Actions API before this line was
  written, not assumed.** Commits have full evidence each; short version, round 1:
  - **Furigana/ruby garbled + inconsistent**: `parseRubyFragments` only ever matched the kanji
    run touching a trailing 《reading》 marker. Phrases with a particle/number in the middle
    (安全確認の8項目 and ~250 others) got the *whole* reading pinned onto just the last 2-4
    characters, overflowing badly on wrap. Code fix in `JpDisplay.jsx` folds the in-between
    text into the ruby span when the ratio's implausible — fixes every instance, not just
    known ones. 35 of the ~250 data entries also hand/dictionary-verified and corrected
    directly; the rest are logged in `docs/RUBY_MISMATCH_AUDIT.md` rather than guessed at
    (real Japanese-reading-accuracy work, same shape as items 58/59 below — own session).
  - **Sprint's playing phase had no back button** — 'ready'/'done' both did, 'playing' was a
    plain oversight. Added the same back button, no pause feature built (see commit for why).
  - **Fokus screen showed a green ✓ next to 0%** — not a data bug, `trainedKeys` (drilled this
    session) and `known`/score (actual mastery) are intentionally independent signals; the
    checkmark just visually borrowed the "mastered" color. Swapped for a neutral 🔁 + tooltip.
  - **Praktik Set (10 sets, ids `wgl01`-`wgl10`) counted/mixed into "Kosakata · Vocab Drill"**:
    `VocabMode`'s `id.startsWith('wg')` filter doesn't distinguish them from the real vocab
    sets (`wglv-*`). First pass split it into two sections within VocabMode and **flagged the
    placement as a product-IA call for the owner** rather than deciding unilaterally — round 2
    below is the owner's answer.

  Round 2, same conversation, owner reviewed round 1 and gave three more things:
  - **Praktik Set → moved into "Soal Teknis" (`WaygroundMode`) instead**, per owner's explicit
    call, grouped with its existing Teori/Praktik structure (`GROUPS`' Praktik entry now matches
    `wgl0*` via a `match()` fn, not a plain prefix — `wgl10` doesn't share a string prefix with
    `wgl01`-`09`). VocabMode reverted to vocab-only. Surfaced a second bug while in there: the
    same file's "CSV Teori"/"CSV Praktik" groups used prefixes (`ct`/`cp`) that haven't existed
    since session 23 (2026-07-11) renamed those ids to `jmt`/`jml` — 12 real sets (300
    questions) were counted in this screen's own header total the entire time but unreachable
    from any group list on the screen showing that total. Fixed, relabeled to match the rename
    ("JAC Mockup Teori/Praktik").
  - **"Soal Teknis · Lifeline" title → "Soal Teknis"** — app's been single-track since
    Doboku/Kenchiku were dropped, so the suffix was dead weight from before that cut, not a
    meaningful qualifier. Grepped for the same pattern elsewhere; this was the only mode title
    carrying it.
  - **"Layout menu Belajar jelek banget" → `BelajarTab`'s compact-tile grid was never actually
    2 columns on any phone**, despite the code's own comment saying that was the design
    (`CompactCard` exists specifically for this). Root cause needed Playwright to actually find
    (see docs/LAYOUT_SPEC.md's Variant B section, corrected in the same commit): `repeat(auto-
    fit, minmax(MIN, MAX))` picks column *count* from MAX when MAX is a fixed length, not MIN —
    180px/240px needed `2×240+gap=488px`, which no phone in the compact breakpoint has, so it
    silently rendered one centered 240px column the entire time this grid has existed. Fixed to
    `minmax(120px, 140px)`, verified via Playwright to hold 2 columns from 360px up through the
    breakpoint ceiling. Checked StatsMode's and SayaTab's own same-pattern grids against the
    same question while there — both fine, for different reasons documented in that commit, not
    just left unchecked.
  - **Bonus, found while Playwright-testing the grid fix, not reported**: `StatsMode` crashed
    outright (full `ErrorBoundary` catch) on a session with a non-string `date` field. Doesn't
    happen through normal use (`recordSession` always writes an ISO string) but Impor Progress's
    `validateSnapshot` doesn't check individual session shapes, so a hand-edited/malformed
    import is a real path to it. Fixed by reusing `isoToLocalDate` (already used one section
    above, in `StudyHeatmap`, for the same data) instead of a raw `.slice()` call.

  All six verified against real code before being called bugs or fixed, not assumed from a
  screenshot or a prior report.

  **Round 3: merge.** Owner said "merge aja langsung" after reviewing round 2's summary — no
  further review requested, so none inserted. Re-ran `npm run validate` one more time on the
  exact commit about to reach `main` (not just trusted the branch-tip runs from rounds 1-2;
  merging changes what's actually live, so it's the one point where re-checking costs little and
  a miss costs the most), confirmed `main` hadn't moved since the branch was cut (still `83bb1cf`,
  so `--ff-only` applied cleanly, no merge commit needed), pushed, then polled the Actions API
  until the resulting deploy (`run 33112758755`, commit `31b6bd0`) reported
  `completed`/`success` — the same verification this session opened by finding *missing* for the
  previous merge, not skipped this time.
  605/605 tests (up from 600 at the start of this session), lint + build clean throughout.

- **🔴 Correction to what this section used to say:** it claimed `feat/ui-overhaul` was still
  NOT merged to `main`. That was wrong by the time the 2026-08-27 session started — verified
  directly against git, not assumed: `main` and `feat/ui-overhaul` point at the exact same
  commit (`83bb1cf`), and the Aug 26 18:28 UTC deploy of that commit to GitHub Pages succeeded.
  So the 23-item plan below (batches A–F) had been live in production the whole time this file
  said otherwise, and the four bugs above are real bugs in already-shipped code, not deploy lag
  or stale cache. **A stale CURRENT STATE claim is exactly the failure this file's own intro
  warns about, and it cost real investigation time before git log settled it.** If a future
  session finds this section describing branch/merge state, re-verify with
  `git log --oneline -1 main` / `origin/feat/ui-overhaul` before trusting it, same as
  everything else in this file.

- `CACHE_VERSION` in `public/sw.js` (the committed default, `ssw-v4.23.0`) still hasn't been
  hand-bumped, but doesn't need to be — `deploy.yml` auto-bumps it to a build timestamp on every
  push to `main`, unconditionally. The committed default only matters for local `npm run build`
  previews.

- **The 38-item overhaul (2026-08-25) is old news — full narrative in
  `docs/archive/HANDOFF-ui-overhaul-38-items.md`.** Still true: amber identity locked, hazard
  rail reserved for time-sensitive/active state only, flashcard height from `FlipCard.jsx`'s
  `ResizeObserver` (don't re-litigate), icons as CSS masks not `<img>`.

- **🟢 `docs/UI_UX_PLAN.md`'s entire 23-item plan (43–65) is closed out and confirmed live** (see
  correction above). Every item is either shipped or explicitly, reasoned-through deferred —
  nothing left silent, nothing assumed done. 27 commits total that session across Batches A–F,
  600/600 tests at the time, zero unresolved regressions *known at the time* — four real bugs
  in that same merged code surfaced by actual use on 2026-08-27 regardless (see below).

  **Batches A–E**: full detail in their own commits and `_MAP.md`'s earlier rows for this
  date — not re-summarized again here.

  **Batch F** (60 → 56 → 58 → 59, closing the plan):
  - **60**: typed-answer near-misses get a character-level diff highlight. Checked the plan's
    premise first — both free-text modes already showed "what you typed" vs. "the answer" as
    separate facts; the real gap was not highlighting *where* they differed. New
    `typo-diff.js` uses proper alignment (edit-distance DP), not naive index comparison, which
    matters concretely on this audience's phone keyboards — a single missing/extra letter
    would otherwise make an entire correct word look wrong under a naive diff. Found and fixed
    a stale claim in the plan's own §7 ("Checked — not bugs") along the way, which asserted
    something item 45 had already disproven.
  - **56**: exam-readiness band on the dashboard. Sanity-checked `calcReadiness` before reusing
    it, per the plan's own ask, and found a real, unrelated bug: it read
    `streakData?.current`, a field that doesn't exist (real shape is `{ days }`) — the streak
    component has silently contributed zero for every existing caller, always. Fixed at the
    source. Also added recency-weighting (existing callers unaffected) since the plan's own
    concern — a confident wrong number — was concretely true of the all-time-average version.
  - **58 and 59**: both explicitly asked for a decision/measurement before code, not execution
    outright — did that properly, neither concludes in a shipped feature, and that's the
    correct outcome given what was found, not scope avoidance. **58**: verified `ts-fsrs` has
    no timing input channel at all; decided a new stored field over a rating-adjustment
    heuristic (this codebase's own `INDONESIAN_CALIBRATION` precedent argues against
    unresearched adjustments to FSRS's inputs); the actual schema-v7 migration is real,
    dedicated work (confirmed by reading `migrations.js`, 386 lines of careful per-version
    transforms touching real user data) that deserves its own session. **59**: measured the
    real current install footprint (3.29 MB) and real per-clip audio size (via actual Opus
    encoding, not a guess) — full 1,438-card audio would triple the install size (+213%),
    confirmed not defensible for this audience; the plan's own anticipated ~200-term subset
    fits (+30%). Blocked on a second, separate, concrete gap beyond the budget question: this
    environment has no real Japanese TTS voice/service to generate actual usable audio.

  **Noticed, not fixed, still open across the whole plan:** `Onboarding.module.css`'s active
  track-label contrast question (item 64's tangent). The amber-gradient contrast question
  (`Dashboard`/`Onboarding`, also item 64) is unresolved, not deferred silently. Item 52's
  async `history.back()`/`replaceState` interaction is reasoned through but not verified on a
  real device. Items 53 (rem conversion) and 55 (FilterPopup) remain excluded, per their own
  plan entries, never in any batch's suggested ordering.

  **Next up:** everything from 2026-08-28 above (ruby-audit round, Simulasi source split, JAC
  Official's set-pairing fix, and the Belajar accordion) is committed directly to `main`
  (owner's call for this whole date) and about to be pushed in the same batch — check
  `git log origin/main..main` before assuming any of it's live if reading this before that push
  lands. Once pushed, confirm the deploy the same way 2026-08-27 round 3 did (Actions API, not
  assumed). Otherwise: someone who can verify actual Japanese readings should work through
  `docs/RUBY_MISMATCH_AUDIT.md` (210 entries, not urgent, scoped like items 58/59
  below); 53/55 excluded; 58/59 each need their own dedicated session (schema migration;
  sourcing real TTS audio).
---

_(ACTIVE TASKS and OPEN DECISIONS — content-dq's task tracker and decision log, both fully
resolved — archived to `docs/archive/HANDOFF-content-dq-era.md`. Pending work for the current
phase lives in CURRENT STATE's top entry, under "NOT done — pick up here" instead.)_

---

## RULES

- Never push to `main` on your own initiative — merging is the owner's call, always has been.
  Not a literal absolute: 2026-08-27 round 3 is the concrete example — owner reviewed a summary
  of the branch, said "merge aja langsung," and that's what authorizes it. Absent that kind of
  explicit go-ahead in the current conversation, work stays on its branch.
- Ambiguity → write it down in CURRENT STATE, ask the owner, don't guess and proceed
- Commit message convention is whatever the active branch is already using — check recent
  `git log` rather than assuming; content-dq used `CONTENT:`/`ADMIN:`/`DOCS:` prefixes,
  `feat/ui-overhaul` uses conventional-commits style (`feat(ui):`, `docs:`)

_(The rest of this section — `src/data/` editing rules, `verify-content.mjs` /
`audit-track-consistency.mjs`, mirror-edit steps, the data-file quote-style rule — was
content-dq-specific and archived with it. Still worth reading if a future session touches
`src/data/` again: `docs/archive/HANDOFF-content-dq-era.md`.)_

---

## REFERENCE (stable — read from the repo, not reproduced here)

- `docs/AGENT_WORKFLOW.md` — **read this first, every session.** Process, not state: clone/read
  order, token handling, branch discipline, commit conventions, close-out steps, the minimal
  kickoff template
- `docs/CARD_CONTENT_SPEC.md` — schema, ruby rules, taxonomy, full task rationale, Open Decisions detail
- `docs/DESIGN_SPEC.md` — palette, typography, icon rendering technique, hazard-rail motif
- `docs/LAYOUT_SPEC.md` — breakpoints, `--max-w`/`--overlay-max-w` tokens, the auto-fit/minmax
  responsive pattern
- `docs/COMPONENT_SPEC.md` — CSS Modules conventions, shared primitives, component patterns
- `docs/PWA_RELEASE_SPEC.md` — offline architecture, `CACHE_VERSION` discipline, deploy checklist
- `docs/UI_UX_PLAN.md` — **not stable reference; a work queue.** Its 43–65 plan (drafted
  2026-08-25) is fully closed out — see CURRENT STATE above, don't trust this bullet's own
  age over that. Unlike the `*_SPEC.md` files above, this is meant to shrink and retire to
  `docs/archive/` once empty — see `docs/AGENT_WORKFLOW.md` §3. Its predecessor (items 1–42,
  all shipped) is already archived there; numbering deliberately doesn't restart, so item
  references in git history stay unique
- `_MAP.md` — architecture map + full session-by-session history log
- `docs/archive/` — superseded docs, including this file's predecessors (`SESSION_PROMPT.md`,
  `PROGRESS.md`, `DATA_QUALITY_HANDOFF_v16/v17/v18.md`), `HANDOFF-content-dq-era.md` (the
  retired GETTING STARTED/PROTOCOL sections + the full 2026-08-18 merge entry + the fully
  resolved ACTIVE TASKS/OPEN DECISIONS content, all pulled out of this file 2026-08-19), and
  `DATA_ARCH_AUDIT.md` (frozen point-in-time audit, session 16 — moved here 2026-08-19, was
  sitting in `docs/` already marked "historical, not live")
- `README-CONTENT-DQ.md` — what's actually present on this branch vs `main`-only
