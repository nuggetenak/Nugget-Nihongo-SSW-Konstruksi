# HANDOFF.md — SSW Konstruksi

> **This file holds only live state.** CURRENT STATE's top entry is what's actually true today.
> When an entry's work is finished or merged, it moves to `docs/archive/` rather than
> accumulating here — see `docs/AGENT_WORKFLOW.md` §3 for the retirement steps, and
> `docs/archive/ARCHIVE-INDEX.md` for what has already moved.
>
> Everything up to and including the 7.0.0 release entry has been retired; the three 2026-09-08
> entries below are kept because their invariants are still live, and the 2026-09-15 entry is the
> most recent session's work (7.6.0, on the branch). (This paragraph itself said "the two
> 2026-09-04 entries below are kept because they are the most recent session's work" on 2026-09-09,
> four sessions after that stopped being true — corrected then, again on 2026-09-14, and again
> here. **That is three times for one sentence.** If you edit CURRENT STATE, edit this paragraph in
> the same pass; and if you find yourself correcting it a fourth time, the right fix is probably to
> stop naming dates in it at all rather than to correct it again.) The retired lineage, newest first:
> `HANDOFF-2026-09-04-07-sessions.md` (7.0.0's mode removal and card split, the governance-docs
> audit, and the two `simulasi`/Belajar-tab rounds),
> `HANDOFF-2026-09-04-audit-and-ui.md` (the 6.0.0 audit + the layout/typography overhaul),
> `HANDOFF-2026-08-31-09-01-ui-typography.md`, `HANDOFF-2026-08-27-28-sessions.md`,
> `HANDOFF-ui-overhaul-38-items.md`, `HANDOFF-content-dq-era.md` (the 3.5-month content-quality
> sprint, sessions 1–29, merged into `main` 2026-08-18 as `151a45e`).

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

**As of 2026-09-15.** Verify before trusting past this point — this line doesn't update itself.
At that date: version **7.6.0**, **1,626 cards**, **23 modes**, `STORAGE_VERSION` **7**,
`npm run validate` clean (**144 test files**; the test count moves every commit, so it is not
quoted here — run it). 7.5.1 is merged into `main`; 7.6.0 is on
`claude/ui-animations-open-items-uekmcq` as PR #20, draft.

- **2026-09-15: 7.6.0 — the write path, a motion language, and the guards that were not guarding.**
  Full write-up is `CHANGELOG.md` `[7.6.0]`. What a future session most needs to know:

  - **There IS a work queue again, and it is deliberate.**
    `docs/UI_UX_PLAN-2026-09-items-145-205.md`. Items 145–196 are closed by this release and 207
    closed after it; **205–206 and 208–215 are open**. It was opened per
    `docs/AGENT_WORKFLOW.md` §3 because the previous session's "no queue" state meant "what is
    open" had to be re-derived from the code by hand, and that re-derivation is most of what this
    release turned out to be.

  - **Four commits landed AFTER the 7.6.0 write-up below was written**, all on the same branch and
    all in `CHANGELOG.md` `[7.6.0]`: `f773b22` (the quiz-link deriver was sorting by the wrong
    property — identity before length, 71 more links), `f1235b4` (item 207, plus a `.claude/**`
    exclude in `vitest.config.js` — agent worktrees live inside the repo, so a root-level
    `vitest run` was collecting duplicate copies of the whole suite), `9ff8b0b` (the metrics table
    quoted a test count its own guard refuses to check) and `e76e7ca` (消化器 typed for 消火器 in a
    question's correct answer). **The version was NOT bumped for these** — 7.6.0 has not shipped
    yet, PR #20 is still a draft, so they are part of it rather than a release after it.

  - **`STORAGE_VERSION` is still 7 and that is correct.** `prefs.motion` is additive and stores
    `penuh`, so every existing install reads as full motion — which is truthful, because that is
    what they have been getting. A migration is for reinterpreting data that already exists, and a
    new default is not that.

  - **Writes are coalesced now (`engine.js`).** `set()` and `setSRSCard()` queue; everything else
    is unchanged and synchronous. The trap, if you touch this: `resetAll`/`importAll` must
    **discard** pending writes, not flush them — flushing a rating queued 200 ms before a reset
    writes the pre-reset document back over the fresh defaults. There is a test for it; do not
    "fix" it into a flush.

  - **The motion system has a reader-facing off switch**, `Pengaturan Gerakan` (mode key
    `gerakan`). Anything new that moves should ask `motionAllows(feature)` if it is JS-driven, or
    key off the `data-motion-*` attributes if it is CSS. `DESIGN_SPEC` §4a is the language; read it
    before adding motion rather than inventing beside it, which is the failure this whole release
    is a correction of.

  - **Four defects in this release were invisible to the test suite and found only in a browser**
    (the tab crossfade that never crossfaded anything, the CSP that refused the SW registration,
    the morph's missing half on a first entry, the flip whose "shared" rules were in a lazy chunk).
    That is the evidence behind open item 209, which asks for one permanent browser smoke test in
    CI. If you are adding anything visual, open Chromium — `playwright-core` installed outside the
    project drives the pre-installed browser without touching `package.json`.

  - **Two things in the plan were refused rather than deferred**, with the reasons written at the
    call sites: throw-to-rate on the flashcard (it is the behaviour v87 removed) and the
    per-character headword reveal (it breaks kinsoku shori and ruby association). Do not re-open
    either from the plan text alone.

  - **Quiz→card coverage is 540 of 980 (55.1%)**, up from 305. The medium tier is read and closed,
    and the matcher pass item 205 asked for is done: the deriver was ranking proposals by **how
    long** the matched headword was, when what decides a link is **what** it matched. Fifty
    questions whose correct answer was, whole, a card headword sat below the applyable tiers (47 in
    `low`, 3 in `medium`) — all fifty read correct. With the ambiguous set surfaced instead of
    dropped, text normalised before matching, and already-linked questions excluded from the tiers,
    that was 71 more links. **The lesson: before reading a tier, check that the thing sorting it is
    measuring the right property.** What is left is the LOW tier, now 305 rows, and the argument
    against hand-reading it stands. `docs/QUIZ_CONTENT_GAPS.md` holds the 72 questions no card
    teaches, which is a content report and not a linking backlog; four of its entries now name the
    near-miss card and what is actually missing (温度計 not 温度, 本溶接 not 溶接, and no card
    states a 脚立's opening angle). A fifth entry left the file for a different reason: it was
    never a gap, it was **消化器** (digestive organ) typed for **消火器** (fire extinguisher) in
    the question's own correct answer — homophones, so the furigana and the gloss both read
    correct. Fixed.

  - **The live queue is items 205-206 and 208-215** in `docs/UI_UX_PLAN-2026-09-items-145-205.md`.
    212-214 are new and carry measured evidence rather than suspicion: two more wrong sort keys
    in the deriver (an ambiguous headword loses to any shorter usable one; ~145 cards are
    invisible under their own bare name because of a parenthetical gloss), two small wins
    already read and ready, and nine cards that read their own headword two ways. **Two avenues
    are recorded as tested and rejected with the falsifying rows** — Indonesian gloss as a
    *substring*, and card desc/usage full-text search — so the next session does not re-import
    them. 206 and 209 were attempted by background agents and killed mid-edit by a rate limit;
    nothing was salvaged, and item 215 says why.

- **2026-09-14: 7.5.1 — the garbled question, and two guards that were only comments.**
  Full write-up is `CHANGELOG.md` `[7.5.1]`. What a future session most needs to know:

  - **There is no work queue any more.** Both UI/UX plans are archived and empty; see the
    REFERENCE section at the end of this file. A session that finds new work files it in
    `CHANGELOG.md` and here, or opens a successor plan on purpose starting after item 144.
    That is a deliberate cost: the queue used to absorb findings by default.
  - **A summary of a list is a claim about the list.** 7.5.0 shipped a §16 line saying items
    119, 120 and a "mode-correctness sweep" were still open, six lines above the entries
    saying they closed in 7.3.0. Re-derive a count from the thing it counts; do not carry the
    sentence forward. The same release's "Still open" section was wrong about `wgl09#9` for
    the same reason — the answer to "is this garbled term recoverable?" was in the question's
    own Indonesian hint.
  - **Do not teach a figure nothing in reach can source.** The same question's answer was
    管径の1.5倍程度, cited to the JAC practical module and nothing else, and "both banks agree"
    is worthless as corroboration — the two are one of the 258 duplicate groups, the same
    question copied, so it is one claim written twice. Ordinary practice for a copper capillary
    joint puts the engagement length near the tube's outside diameter, which is what the *other*
    bank's first distractor said, so the answer may well have been wrong; promoting a distractor
    on a recollection of a standard is item 115's mistake with its sign flipped. The question
    asks what a capillary fitting *is* now — 毛細管現象, the thing it is named for — which the
    deck's own cards support. **A figure question can go back in when someone knows the figure.**
  - **A corrupted string does not stay one defect.** 「キャップillary」 also mislinked its
    question, because `derive-quiz-card-links.mjs` matched the corrupted キャップ as a
    four-character headword — its high-confidence tier. When you fix a data string, check what
    was derived *from* it.
  - **The same question lives in both banks.** `wgl09#9` and `jml04#9` are one question;
    `audit-question-overlap.mjs` compares their answers, not their stems, so a stem corrupted
    identically in both passes it. Fix content in both, or check the other bank first.
  - **A comment naming a guard is not a guard.** `ci.yml` cited a
    `format-and-lint.test.js` that had never existed; `motion.js` cited a
    `reduced-motion.test.js` that never existed either. Both now name real files, and
    `ci-gate-parity.test.js` and `doc-references.test.js` are the tests that were being
    claimed. If a comment says a test asserts something, open the test.
  - **`docs/COMPONENT_SPEC.md` §16 documented five files deleted in 7.0.0** — a component
    spec's lists are read as the inventory, so that is the worst place for a phantom entry.
    Removing a mode is not just deleting its files: `removed-mode-safety.test.js` covers the
    two code paths that outlive a mode, and the docs are the third.

- **2026-09-13/14: the three external audits, item 114's second half, and the 103–105 group.**
  Full write-up is `CHANGELOG.md` `[7.5.0]`. What a future session most needs to know:

  - **`serializeCard` must carry every field ts-fsrs schedules on.** It omitted `learning_steps`,
    so every card came back from storage at step 0 and FSRS-6 re-entered the first learning step on
    every `Good` — a card rated "Oke" could never graduate. The scheduler was not mis-scheduling,
    it was standing still, for the rating most learners press most often. **If you add a field to
    the FSRS config or bump ts-fsrs, check the round-trip first**; nothing else in the app would
    show you this.
  - **A missing document is not a fresh install.** `init()`'s fresh-install branch wrote defaults
    over all three documents, so losing one key of three cost the SRS document too. It salvages now.
    The general rule: **a branch that writes DEFAULTS must first prove there is nothing to lose.**
  - **`enable_fuzz` is on in the app and off in the test setup.** On, because the library default is
    on and every learner sharing a history should not share due dates; off under test, because a
    seeded fuzz is still fuzz to an assertion.
  - **The app must not compute its own retrievability curve.** All three audits said the curve had
    drifted, and they were right about the drift and wrong about the direction — the app had a power
    curve of its own instead of calling `get_retrievability`. One curve, and it is the scheduler's.
  - **Item 114 is closed on both banks.** Wayground 48.5% → 20.4%, widest gap 31 → 2, over 191
    rewrites. **The method is a threshold, not a count** — rewrite every question whose answer stands
    3+ characters above its longest distractor — and the reason matters more than the number:
    picking N questions to hit a target is how a bank ends up tuned to its own test.
    `question-option-shuffle.test.js` holds both banks to the same four assertions now, two-sided.
  - **Three Wayground sets spell readings inline as 漢字（かな）** (wgl01–wgl05, wgl10) because their
    options render furigana-stripped — `WaygroundMode` passes `opts` through `stripFuri`, so 《》
    markers are invisible there and the parenthesised reading *is* the reading aid. wglv-\* is the
    opposite: it renders with ruby through `VocabMode` and has no parenthesised readings. **New text
    in a set must follow that set's idiom**, and lengthening a wgl01-style option means adding
    content in that form, not padding.
  - **Options are always furigana-stripped.** `OptionButton` prints the string, `QuizAnnouncer`
    speaks it to a screen reader, and `ResultScreen` files it as a review row — a 《》 marker is
    visible in the first and read aloud as brackets in the second. Both new modes strip, and both
    assert it; the reading is taught in the explanation panel instead.
  - **`ruby-scope.test.js`'s bank suites are zero, not a budget**, and `雷《かみなり》` is tolerated
    in the CARDS suite **only**. One slipped into `wt08#3` this session because a scratch script
    carried the card allowance across. It is `落雷《らくらい》` now.
  - **Items 103–105 exist because the owner delegated the call** ("finish all that's still open —
    you decide everything"). The plan had them as product direction and said so; that is still the
    right default for a future session, and this entry is the record of when it was overridden and
    by whom.
  - **`speaker` decides the drill direction in both new corpora**, and therefore what `answer` and
    `traps` hold: Indonesian actions for a line you hear, Japanese phrases for one you say. Both
    test files assert the split by character class, because nothing about a JS object stops the two
    being swapped and a swapped entry renders a perfectly plausible screen.
  - **`SkenarioMode` deliberately does not use `QuizShell`**, and must not be "simplified" into it.
    A scene's beats are ordered and the order is load-bearing; `QuizShell` shuffles. There is no
    session-length picker for the same reason.
  - **`router/modes.js` still must not import `src/data/`.** Both new modes' menu counts are
    literals in `constants.js` with `mode-counts.test.js` re-deriving them. Third and fourth entries
    under the same rule.
  - **`--ssw-teal` is per-theme** (teal-700 light, teal-400 dark) for the same reason
    `--ssw-amberText` is: it is read as text and one tone cannot clear 4.5:1 on both grounds. A
    literal `#fff` on the active chip would be 1.83:1 in dark theme; it uses `--ssw-bg` so the ink
    inverts with the ground.
  - **`npm run validate` was failing on `format:check` and nobody noticed**, because
    `src/data/card-index.js` was added to the tree without joining `src/data/cards.js` in
    `.prettierignore`. Both are generated by `merge-cards.mjs`. **Check the exit code, not the
    output** — this was masked for three commits by grepping for success markers.

- **2026-09-09: the JAC photo assets, the JAC Mockup distractor rewrite, and item 59 dropped.**
  Full write-up is `CHANGELOG.md` `[7.4.0]`. What a future session most needs to know:

  - **`img` on a JAC Official question is a path relative to `public/`**, rendered by
    `QuestionPhoto` as `${import.meta.env.BASE_URL}${img}` — a leading slash breaks the GitHub
    Pages subpath and there is a test that says so. Twelve of the 95 questions have one; the other
    83 keep `img: null`, which is what the field always was.
  - **`photoDesc` is alt text, not a caption, and must never name an option — and neither may
    `hint`.** Five of the twelve `photoDesc` strings named the correct answer outright before this
    release, and `st1_q10`'s `hint` carried a bracketed description of the diagram that named
    *tiang*, the answer, in visible text under the question. That third one was found by running
    the app, not by reading the data: both the audits and the first round of tests were looking at
    `photoDesc` only. `jac-question-images.test.js` now covers both fields, in both languages, and
    in both directions — naming a *wrong* option is a giveaway too.
  - **The JAC photo assets are page renders, not extracted images.** `st1_q10`'s blue arrow is a
    vector path drawn over the diagram and seven pages mask labels with white rectangles, so
    `extract_image(xref)` would lose the arrow and restore what the exam hid. If these ever need
    regenerating, read `scripts/archive/extract-jac-images.py` first — it is the only record of
    which page each file came from.
  - **They are deliberately not in `PRECACHE_URLS`.** `jac` is not one of the three high-traffic
    modes whose chunks are precached; precaching a mode's images while fetching its code on demand
    would be incoherent. Do not "fix" this by adding them.
  - **Never widen a distractor rewrite past the questions that need it.** 215 of the JAC Mockup
    bank's 300 questions had the answer as the longest option; the other 85 were left alone,
    because rewriting a question that is already balanced can only introduce an accidentally-correct
    distractor. That risk — not the length tell — is the one that governs this work.
  - **The item-114 machinery is in the session scratch, and the method is in `CHANGELOG.md`
    `[7.4.0]`**: per-slot character targets from a seeded permutation, then a verifier that checks
    answer-slot immutability, duplicates, ruby scope, length tolerance, and that no new distractor
    is the correct answer of the same question in the *other* bank. Rebuild it from that description
    rather than freehanding the Wayground pass.
  - **Item 59 is closed, not paused.** Do not re-measure it. The blocker was never the budget: no
    ja-JP synthesiser exists in any environment this repo has been built in, and what the item needs
    is a TTS contract or licensed recordings. If the owner ever buys a voice, that is a new item
    against that day's corpus and footprint.

- **2026-09-08 (second session): the reported bug, and 20 of the audit's filed items.** Full
  write-up is `CHANGELOG.md` `[7.3.0]`. What a future session most needs to know:

  - **Never compute a filtered deck inline in a component body.** `cards.filter(...)` allocates a
    new array every render; if it reaches any effect that sets state, the component re-renders
    forever. That is what made "Lihat" do nothing on every filtered deck, froze Sprint's setup
    screen at mount, and — the part worth remembering — **hangs the test runner instead of failing
    it**, so the regression stalls CI rather than reporting. `useScopedDeck` is the only sanctioned
    spelling and `untested-modes.test.jsx` sweeps the whole modes layer for the raw expression.
  - **A jsdom hang is a finding, not a harness quirk.** Item 118 filed exactly this as P2 and
    guessed at the harness. It was the most severe defect in the app. If a component cannot be
    rendered under test, that is the bug.
  - **`recordWrong` only accepts an integer card id.** `progress.quizWrong` is card-keyed and every
    reader treats it that way. A mistake on content with no card goes through
    `utils/mistake-bridge.js` to `progress.termWrong`. Do not invent a third id space.
  - **`router/modes.js` and anything it imports must not reach `src/data/` question banks.** Two
    modules did, for two menu integers and one daily question, and put 787 kB on the critical path
    of every first page view. `eager-bundle-graph.test.js` walks the static import graph from
    `main.jsx` and fails on any of the four heavy data modules.
  - **CI now runs `format:check` and `audit:full`.** Do not remove them to make a red run green:
    `verify-content.mjs` is the only check that catches a direct edit to the generated
    `src/data/cards.js`, which otherwise passes CI and is silently reverted at deploy.
  - **Coverage thresholds are a ratchet at today's real numbers, over all of `src/`.** Raise them
    when coverage rises; never lower them.
  - **Item 114 is half done and the half that is left is authoring, not engineering.** JAC Mockup's
    tell is untouched at 70.2%. Writing distractors at that scale risks shipping one that is
    accidentally correct, which is worse than the tell — this bank has already shipped a wrong
    safety answer (item 115, fixed here). The ceilings in `question-option-shuffle.test.js` hold
    the line meanwhile.

- **2026-09-08: five UI changes, three P0 fixes, and a 49-finding audit.** Full write-up is
  `CHANGELOG.md` `[7.2.0]`; the audit itself is §16 of `docs/archive/UI_UX_PLAN-2026-09-items-43-144.md`.
  What a future session most
  needs to know:

  - **Neither context may build a document from its own React state.** `setPref` and `setProg`
    forward the updater to `engine.set()` and take the merged result back. They used to hand over a
    finished snapshot assembled from state seeded once at mount, which silently overwrote every
    field written directly by the eight `prefs` and six `progress` writers outside the contexts —
    personal notes, sprint bests, wrong-answer history. `context-direct-write.test.js` holds it.
    **Do not "simplify" either back to `setState(prev => …)` with a `storageSet` inside.**
  - **A changed default is not a migration.** `textScale` → `kecil` and the new `lastSeenVersion`
    key both reach new installs only, because `init()` loads a current document as-is and
    `get('prefs')` returns it directly. `STORAGE_VERSION` stays 7 and
    `defaults-new-install-only.test.js` asserts both directions.
  - **`kecil` is an owner decision (2026-09-08), not drift.** Every other artefact in the repo
    argues for a larger default and will look like the authority. `text-scale.js`'s header says what
    it costs; a test name carries the date and the word "owner".
  - **Shuffling options did not close the guessable-bank problem, and the release note says so.**
    The correct answer is the longest option 51.5% (Wayground) and 72.0% (JAC Mockup) of the time; a
    length-picking bot scores the same and passes the 65% mark. That is a *content* defect —
    distractors are written tersely — and shuffling positions cannot touch it. Ceilings are recorded
    in `question-option-shuffle.test.js`. **Filed as UI_UX_PLAN item 114; this is the highest-value
    content work outstanding.**
  - **`filterReason` is part of `kartu`'s prop contract**, defaulting to `'wrong'` so the eight
    retry-wrong bridges are unchanged. Red is reserved for wrong answers again.
  - **`FlashcardMode` cannot be rendered with `filterIds` under jsdom — it hangs**, on `main` as
    well as here. That is why the banner spent so long mislabelling a source browse: the one prop
    that makes the banner appear could not be set in a test. Filed as item 118.
  - **`vitest.config.js` must mirror `vite.config.js`'s `define`.** It is a standalone config;
    `__APP_VERSION__` was missing there and nothing caught it because no test had ever rendered
    `SayaTab`.
  - **Two audit areas are not done, and are not clean**: a correctness pass on the 13 modes with no
    tests (6,009 lines), and the readiness/streak/SRS-bucket arithmetic. Both agents died on account
    rate limits. Items 119 and 120.

- **2026-09-08: "proceed to finish all hanging threads."** Same branch, restarted from `main`
  after PR #12 merged (a merged PR cannot track new work). Full write-up is `CHANGELOG.md`
  `[7.1.0]`. What a future session most needs to know:

  - **`STORAGE_VERSION` is 7**, and `init()`'s migration chain is a registry keyed by the version
    being migrated *from*, not five copy-pasted ladders. Adding v8 is one entry plus the function.
    `storage.migration-chain.test.js` walks every entry point v1–v6 to current and is the reason
    to keep that shape.
  - **A document stamped newer than the running build is loaded, not overwritten.** Every version
    of `init()` before this one wrote fresh defaults over it, destroying the study history of
    anyone who opened an older install after a newer one — ordinary for a PWA on a device that has
    been offline. Do not "simplify" that `>=` back to `===`.
  - **`related_card_id` values in the JAC sets were written in pre-v4 card numbering** and had
    never been remapped: 23 of 95 were sound. Fixed via `card-id-map-v4.js`, now 94 of 95, with
    `src/tests/related-card-links.test.js` holding the floor. **The lesson generalises**:
    `audit-related-ids.mjs` checks that an id *resolves*, which is not the same as checking it is
    the *right* card, and a corpus can be entirely wrong while every audit passes.
  - **305 of `QUIZ_SETS`' 980 questions now carry a link**, and the retry-wrong button works in
    `wayground`, `vocab` and `simulasi` for the first time. The remaining 675 need a human read;
    `npm run derive:quiz-links` regenerates the tiers. The 80 no-match rows are worth reading
    first for a different reason — a question about something the deck does not teach is a content
    gap, not a linking problem.
  - **Every one of the 1,418 vocab cards has a `usage` sentence.** The 7.0.0 entry below says 152
    do not; that is no longer true (the real figure at the time this was picked up was 90).
    `src/tests/vocab-usage.test.js` holds it at 100% — an equality, not a threshold, because
    anything weaker lets the next batch of split children through bare.
  - **`JpFront` splits on ・ / vs / ： / → outside `《reading》` markers only.** Eleven strings in
    the corpus carried a separator inside a reading; splitting on it put raw brackets on screen.
    Both the renderer and the data are fixed, and `audit:text` now rejects the shape.
  - **Five `UI_UX_PLAN` items remain open**, none for lack of a decision: 59 (no ja-JP voice
    exists anywhere in this toolchain), 99 (the exam photographs do not exist), 103–105 (product
    direction). Item 104 is now `S` rather than `M` — its question bank is the 1,409 verb-final
    `usage` sentences, already written; item 103's gap is confirmed by the same measurement, since
    only 3 of 1,418 are in an imperative register.
    **Superseded 2026-09-09:** 59 is dropped and 99 is fixed — the owner supplied the JAC PDFs, so
    "the exam photographs do not exist" stopped being true. **103–105 are the only open items left
    in the plan**, and all three are content projects at the owner's discretion rather than work an
    agent should start unasked: 103 is a register shift across the corpus, 105 is blocked on 103,
    and 104 adds a twentieth mode.
    **Superseded 2026-09-14:** the owner delegated the call ("finish all that's still open — you
    decide everything") and 103, 104 and 105 were all built in 7.5.0. **The plan has no open items
    at all now** and is archived; see the REFERENCE section below.

_(Four older entries — 2026-09-04 ×2, 2026-09-05 and 2026-09-07 — are retired to
`docs/archive/HANDOFF-2026-09-04-07-sessions.md`. All were merged and superseded.)_

---

## RULES

- Never push to `main` on your own initiative — merging is the owner's call, always has been.
  Not a literal absolute: 2026-08-27 round 3 is the concrete example — owner reviewed a summary
  of the branch, said "merge aja langsung," and that's what authorizes it. Absent that kind of
  explicit go-ahead in the current conversation, work stays on its branch.
- Ambiguity → write it down in CURRENT STATE, ask the owner, don't guess and proceed
- Commit message convention is whatever the active branch is already using — check recent
  `git log` rather than assuming. Everything since `feat/ui-overhaul` uses conventional-commits
  style (`feat(ui):`, `fix(simulasi):`, `docs:`, `chore:`), and that is what `main` carries now;
  the `CONTENT:`/`ADMIN:`/`DOCS:` prefixes are content-dq-era and no longer in use.
- **Close-out is four files, not two.** `HANDOFF.md` (state) and the work queue got updated every
  session; `CHANGELOG.md` and the version in `package.json` + `public/sw.js` got skipped, and did
  for three sessions running — 24 shipped commits with no release note. If a session put anything
  on `main` that a user would notice, it needs a CHANGELOG entry. **There is no queue file to
  update since 2026-09-14** — it retired empty — so the count is three, and the one that used to
  absorb a session's findings now has nowhere to go by default: file them in `CHANGELOG.md` and
  here, or open a new plan deliberately rather than by accident.

_(The rest of this section — `src/data/` editing rules, mirror-edit steps, the data-file
quote-style rule — was content-dq-specific and archived with it: `docs/archive/HANDOFF-content-dq-era.md`.
Note that its mirror-edit steps are now **historical only**: the mirror layers they describe were
deleted 2026-09-04 and `docs/AGENT_WORKFLOW.md` §4a is the live map of where to edit what.
`audit-track-consistency.mjs` went with them.)_

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
- **There is no live work queue.** Both UI/UX plans are archived and both are empty:
  items 1–42 (`UI_UX_PLAN-2026-08-overhaul.md`, closed 2026-08-25) and items 43–144
  (`docs/archive/UI_UX_PLAN-2026-09-items-43-144.md`, closed
  2026-09-14 — 101 shipped, item 59 dropped). Read either for per-item reasoning, **not as a task
  list**; each carries a header saying so. Numbering never restarts, so an item number in git
  history resolves to exactly one plan. The ruby backlog is gone the same way:
  `RUBY_MISMATCH_AUDIT.md` tracked 182 over-wide readings, the list reached zero on 2026-09-13,
  and `src/tests/ruby-scope.test.js` now holds it there — at zero for the question banks, and by
  named allow-list for the deck, rather than at a count.

  A session that finds new work has nowhere to file it by default. That is deliberate: put it in
  `CHANGELOG.md` and this file, or open a successor plan on purpose — starting the next number
  after 144 — rather than growing one by accident.
- `_MAP.md` — architecture map + full session-by-session history log
- `docs/archive/` — every superseded doc, **indexed in `docs/archive/ARCHIVE-INDEX.md`** — read
  the index rather than the folder listing. It includes this file's own predecessors
  (`SESSION_PROMPT.md`, `PROGRESS.md`, `DATA_QUALITY_HANDOFF_v8`–`v18`), the five retired
  CURRENT STATE entries, `DATA_ARCH_AUDIT.md`, and `README-CONTENT-DQ.md` (archived 2026-09-05 —
  it described the `content-dq` checkout, a branch merged 2026-08-18)
