# HANDOFF.md — SSW Konstruksi

> **This file holds only live state.** CURRENT STATE's top entry is what's actually true today.
> When an entry's work is finished or merged, it moves to `docs/archive/` rather than
> accumulating here — see `docs/AGENT_WORKFLOW.md` §3 for the retirement steps, and
> `docs/archive/ARCHIVE-INDEX.md` for what has already moved.
>
> Everything up to and including the 6.0.0 release entry has been retired; the two 2026-09-04
> entries below are kept because they are the most recent session's work. The retired lineage,
> newest first:
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

**As of 2026-09-05.** Verify before trusting past this point — this line doesn't update itself.
At that date: version **6.1.0**, **768 tests in 79 files**, `npm run validate` clean, `main` at
`6344ca6` and both entries below merged into it.

- **2026-09-05: "audit administrative and governance docs; fix all discrepancies; compact and do
  deep comprehensive housekeeping."** Branch `claude/admin-governance-docs-audit-qpmndo`. No
  content or app-behaviour change except one broken tool; everything else is docs. What the audit
  found, and what was done about it, is `CHANGELOG.md` `[6.1.0]` § "Administrative and governance
  docs" — not restated here. The parts that change how a future session should work:

  - **`CHANGELOG.md` had not been touched since `e92b912`, and ten commits landed after it** —
    six substantive, including a new feature (the kartu category picker) and four P0 fixes to the
    exam modes, all on `main`, none of them in any release note. Written up as **6.1.0**;
    `package.json` and `public/sw.js`'s `CACHE_VERSION` bumped to match (the SW's own comment
    requires them equal). The convention that produced the gap is worth naming: two sessions in a
    row closed out by updating `HANDOFF.md` and `UI_UX_PLAN.md` but not `CHANGELOG.md`.
    `docs/AGENT_WORKFLOW.md` §3's close-out list now says so explicitly.
  - **`docs/AGENT_WORKFLOW.md` §4's own rule was being broken by three live docs.** Rows added for
    `RUBY_MISMATCH_AUDIT.md`, `README.md`, `HUSKY-SETUP.md` and the two nested READMEs, plus a new
    paragraph applying the same rule to headline *numbers*, which is what actually went wrong here.
  - **`README-CONTENT-DQ.md` archived.** It described a branch merged 2026-08-18, told readers to
    edit split-file layers deleted 2026-09-04, and carried a merge plan already executed.
  - **`docs/RUBY_MISMATCH_AUDIT.md` re-measured.** Its central claim — that its 182 findings were
    "NOT currently visually broken" because a renderer fallback folded the in-between text into the
    ruby base — described behaviour **6.0.0 deleted**. 38 of the 182 have since been fixed by other
    work; **144 remain** and now render with the reading over only the kanji run touching the
    marker. Re-scoped, not rewritten.
  - **`viewer.html`'s JAC Ujian tab had been silently empty since the 2026-08-18 merge**, importing
    two top-level files that moved to `src/data/sets/jac/`. Its loader swallows import failures, so
    it showed an empty tab rather than an error. Fixed.

- **2026-09-04: "analyze the simulasi mode and other modes related to it. do not assume
  anything, list all gaps and also additional missing features."** Branch
  `claude/menu-kartu-kategori-gap-1onln7` (continued). Owner chose "fix everything that is clearly
  a bug" over analysis-only, and settled a factual contradiction the audit turned up (see below).
  The audit itself is `docs/UI_UX_PLAN.md` §14 — items 82–102 plus a "checked, not a bug" list;
  reasoning per fix is in the commit messages.

  - **Four P0s, three of which silently destroyed work.** (1) The exit guard was honoured by
    exactly one of the five routes out of a mode — Escape, the hardware back button and the
    desktop side nav each discarded a running 100-minute exam with no prompt, despite
    `AppContext`'s own comment claiming "every route out of the mode area awaits it first".
    (2) The exam clock was a counter whose interval was torn down and restarted by *every answer*,
    because its effect depended on `finishExam` which depends on `answers`; it is a wall-clock
    deadline now. (3) "Latih N Salah" passed positions in the wrong-answer list as card ids, so it
    navigated to unrelated flashcards (`buildJacPool` was dropping the `related_card_id` that all
    95 JAC questions carry). (4) Found while wiring persistence: in `jac` and `wayground` the live
    question list was a memo keyed on the wrong-answer tally those modes write to on every wrong
    answer, so **answering re-shuffled the list and swapped the question on screen** while the
    feedback for the previous one was still displayed. Reproduced before fixing.
  - **Item 78 closed.** `simulasi` snapshots to sessionStorage (progress + the drawn question list,
    with an absolute deadline so a reload does not refill the clock), and `jac`/`wayground`/`vocab`
    now pass `persistKey` through a shared `useQuizResume` + `ResumePrompt` rather than a fourth
    copy of QuizMode's inline version.
  - **Owner decision — the exam is 2 min/question.** `data/angka-kunci.js` was teaching
    "90 detik/soal (50 soal ÷ 75 mnt)" as a memorisable fact while `SimulasiMode` used 2 min; owner
    ruled the mode right, so the data entry was wrong and is corrected. The rate and the 65% pass
    mark both live in `utils/constants.js` now — 65 had three copies that had to agree.
  - **Still open, written up not built**: items 93–102 — chiefly that `simulasi` records its wrong
    answers nowhere (93), keeps no attempt history (94), has no keyboard support (95), and that
    `getBestSimScore` cannot tell a 15-question practice run from a 50-question exam, which is what
    the "Siap Ujian" badge and the readiness advice are computed from (97).
  - Verified: `npm run validate` clean (768 tests, up from 745; five audits; build), plus driving
    the real app in Chromium at 390×844 — Escape and browser-back both raise the confirmation, a
    reload offers the exam back at "3/15 soal terjawab · sisa waktu 29:55", and the clock keeps
    running across the reload.

- **2026-09-04: "buat menu kartu bisa kasih opsi pilihan kategori, sama analisa gap feature
  menu kartu dan menu yang lain"** (widened mid-session to "analisa juga menu lainnya di tab
  belajar", plus "aku pengen kyk versi legacy v87 yang bisa bolak balik kartu"). Branch
  `claude/menu-kartu-kategori-gap-1onln7`. Three things landed; reasoning is in the commit
  messages, this is a map to them.

  - **Category picker in `kartu` — `docs/UI_UX_PLAN.md` item 55 closed.** `FilterPopup` had sat
    unwired in `legacy/unwired-app-code/` since 2026-08-18 waiting on exactly one thing: the
    mode's filter state was a single `search` string doing three unrelated jobs (free text,
    `__cat:<key>` for one category, `__starred__`), so the three were mutually exclusive and a
    category could never be reached except by tapping the badge of a card already on screen —
    inside the 1438-card deck you were trying to narrow. Categories are a `Set` now, composing
    with the text query; old sessionStorage values migrate on read. `FilterPopup` graduated to
    `src/components/` on top of `Sheet` (focus trap + Escape it never had) and counts from the
    deck it is handed, so a `filterIds` deck from `SumberMode` no longer reports 1438. Its
    `legacy/` copy is deleted rather than left to age — see that README.
  - **A flipped card could not be turned back over on a touch screen.** Not a feature request, a
    regression: the front face carried the flip handler and went `pointerEvents:none` once
    flipped, the back face carried none, and the `🔄 Balik` button had been removed 2026-09-04 as
    "redundant with tapping the card" — true of the front, false of the back. Space on a physical
    keyboard was the only way back. Restored to v87 semantics: both faces tappable, flip button
    back, horizontal swipe *always* navigates and up flips (swipes used to silently rate and
    auto-advance a face-up card, which is what made "go back" unreachable), and the rating row
    now persists once a card has been seen rather than vanishing on every flip-back.
  - **`docs/UI_UX_PLAN.md` §13 — feature-parity audit of all 21 modes in the Belajar tab**, items
    75–81, none built. `ModeRouter.jsx`'s prop map is the authority for what a mode can even do.
    Item 78 was flagged as the one to take first, and was taken first — see the entry above.

_(The three entries this file used to carry above these are archived — see the note at the top.)_

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
