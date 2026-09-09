# HANDOFF.md — SSW Konstruksi

> **This file holds only live state.** CURRENT STATE's top entry is what's actually true today.
> When an entry's work is finished or merged, it moves to `docs/archive/` rather than
> accumulating here — see `docs/AGENT_WORKFLOW.md` §3 for the retirement steps, and
> `docs/archive/ARCHIVE-INDEX.md` for what has already moved.
>
> Everything up to and including the 7.0.0 release entry has been retired; the three 2026-09-08
> entries below are kept because their invariants are still live, and the 2026-09-09 entry is the
> most recent session's work. (This paragraph itself still said "the two 2026-09-04 entries below
> are kept because they are the most recent session's work" on 2026-09-09, four sessions after that
> stopped being true — corrected then.) The retired lineage, newest first:
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

**As of 2026-09-09.** Verify before trusting past this point — this line doesn't update itself.
At that date: version **7.4.0**, **1,626 cards**, **20 modes**, `STORAGE_VERSION` **7**,
`npm run validate` clean (125 files, 1,157 tests). 7.3.0 is merged into `main`
(PR #15, `35e7ce3`); 7.4.0 is on `claude/item-59-quiz-assets-sl3ge9`.

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
  `CHANGELOG.md` `[7.2.0]`; the audit itself is `docs/UI_UX_PLAN.md` §16. What a future session most
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
    `npm run derive:quiz-links` regenerates the tiers. The 79 no-match rows are worth reading
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
- **Close-out is four files, not two.** `HANDOFF.md` (state) and `docs/UI_UX_PLAN.md` (the queue)
  get updated every session; `CHANGELOG.md` and the version in `package.json` + `public/sw.js`
  get skipped, and did for three sessions running — 24 shipped commits with no release note. If
  a session put anything on `main` that a user would notice, it needs a CHANGELOG entry.

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
- `docs/UI_UX_PLAN.md` — **not stable reference; a work queue**, and the one place open items
  live. Closed rounds: items 43–65 (drafted 2026-08-25, closed 2026-08-26/28), 66–68 (added
  2026-08-31, closed 2026-09-01). **Still open, as of 2026-09-05:**
  - §12 (2026-09-04 exhaustive audit) — 69, 70, 71, 72, 73, 74. 69 and 73 are owner decisions.
  - §13 (Belajar-tab feature parity) — 75, 76, 77, 79, 80, 81. 78 done.
  - §14 (exam family) — 93–102. 82–92 done.
  - §6 carried enhancements — 58, 59. 59 is gated on measuring the payload first.

  Unlike the `*_SPEC.md` files above, this is meant to shrink and retire to `docs/archive/` once
  empty — see `docs/AGENT_WORKFLOW.md` §3. Its predecessor (items 1–42, all shipped) is already
  archived there; numbering deliberately doesn't restart, so item references in git history stay
  unique.
- `docs/RUBY_MISMATCH_AUDIT.md` — **also a work queue, not a spec.** 144 readings (of an original
  182) still annotate only the kanji run touching the marker rather than the phrase the reading was
  written for. Needs a session with someone who can confirm actual Japanese readings; see item
  58/59 for the same shape of "real, scoped, non-urgent" work.
- `_MAP.md` — architecture map + full session-by-session history log
- `docs/archive/` — every superseded doc, **indexed in `docs/archive/ARCHIVE-INDEX.md`** — read
  the index rather than the folder listing. It includes this file's own predecessors
  (`SESSION_PROMPT.md`, `PROGRESS.md`, `DATA_QUALITY_HANDOFF_v8`–`v18`), the five retired
  CURRENT STATE entries, `DATA_ARCH_AUDIT.md`, and `README-CONTENT-DQ.md` (archived 2026-09-05 —
  it described the `content-dq` checkout, a branch merged 2026-08-18)
