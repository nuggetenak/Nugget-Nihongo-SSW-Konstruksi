# HANDOFF — 2026-09-04 to 2026-09-07 (retired 2026-09-09)

**Provenance.** These four CURRENT STATE entries were the live text of `HANDOFF.md` for the sessions
dated 2026-09-04 (two entries), 2026-09-05 and 2026-09-07. All four are merged into `main` and all
are superseded by the 7.1.0–7.4.0 entries that followed them; they are moved here per
`docs/AGENT_WORKFLOW.md` §3.2 rather than left to accumulate in a file that is supposed to hold only
live state.

**What they cover, newest first:**

| Entry | Release | Subject |
|---|---|---|
| 2026-09-07 | 7.0.0 | Two modes removed, multi-vocabulary cards split (1,438 → 1,626), the docs queue |
| 2026-09-05 | 6.1.0 | Administrative and governance docs audit — every headline number re-derived |
| 2026-09-04 | 6.1.0 | `simulasi` and the exam family, analysed rather than assumed |
| 2026-09-04 | 6.1.0 | Category picker in `kartu`, Belajar-tab feature-parity gap analysis |

Read these as history. Anything in them that is still a live invariant is in the current
`HANDOFF.md`, in a test, or in a spec doc under `docs/`; if only this file says it, check the repo
before believing it.

---

- **2026-09-07: "hapus mode produksi & kuis produksi · pecah kartu multi-kosakata · kerjakan
  antrean docs."** Branch `claude/remove-modes-split-vocab-cards-5r2qfe`. Full write-up is
  `CHANGELOG.md` `[7.0.0]`; per-item reasoning is in `docs/UI_UX_PLAN.md` and the commit messages.
  What a future session most needs to know:

  - **The corpus is 1,626, not 1,438, and one card is one term.** `docs/CARD_SPLIT_AUDIT.md` holds
    a verdict for every card in the pre-split corpus, including the rule that kept each of the 113
    that stayed whole. **Card ids were not renumbered** and must not be — a parent keeps its id for
    its first term, children are appended, and `scripts/audit-integrity.mjs` explains what
    renumbering would break. (`STORAGE_VERSION` was 6 at 7.0.0; it is **7** as of 7.1.0 — item 58,
    an additive field, not a renumbering.)
  - **Deduplicate before splitting, if this ever happens again.** 583 raw child slots collapsed to
    451 distinct terms; 76 of those already had cards. Splitting first would have created about 128
    duplicates to clean up afterwards.
  - **41 card ids were retired**, and every one of them has its content on a surviving card
    (checked against `main`'s corpus, not assumed). Retiring an id is not the same thing as
    renumbering — renumbering is what `audit-integrity.mjs` forbids — but it does leave an orphaned
    SRS entry in anyone who had reviewed that card. Harmless where the caller passes a whitelist of
    live ids, which is the design; `daily-mission.js` did not, and could therefore set an
    "Ulasan SRS" mission with an empty review queue behind it. Fixed here.
    `src/tests/srs-orphans.test.js` now asserts that no call site leaves the whitelist off.
  - ~~**152 of 518 vocab children have no `usage`**~~ — **closed 2026-09-08.** The residue was 90
    by the time it was picked up, and they are written; the corpus is at 1,418 of 1,418. The
    caution behind the original decision still stands and is why the sentences follow one fixed
    shape with full ruby, and why `audit:text` gets to reject them (it rejected one).
  - **Two runtime hazards came out of the mode removal, not the deletion itself**: a `% 3` modulo
    left over a 2-element rotation, and a persisted `prefs.lastMode` naming a mode that no longer
    exists. Both are fixed at the class level, and `src/tests/removed-mode-safety.test.js` holds
    them.
  - ~~**Ten `UI_UX_PLAN` items remain open**~~ — **five, as of 7.1.0.** Closed since: 58 (storage
    v7), 69 (the owner call, decided by measurement), 96 (305 links landed), 107 and 108. Still
    open: 59, 99, 103–105 — see the 2026-09-08 entry above.
  - **Measured, not eyeballed**: items 73 and 74 were driven in Chromium against the running app
    (dead space 179px→0 on a phone, 401px→0 on a tablet), and item 98's before/after distributions
    come from 20,000 simulated draws each.

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
