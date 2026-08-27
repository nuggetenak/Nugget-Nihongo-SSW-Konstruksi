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

**As of this edit, 2026-08-27.** Verify before trusting past this point — this line doesn't
update itself.

- **2026-08-27 session (two rounds — screenshots + follow-up in the same conversation): 6 live-
  site bugs reported total, root-caused against actual code each time (not assumed from this
  file — see the correction entry right below for why that mattered), fixed on branch
  `fix/post-overhaul-bugs` off `main`.** Not merged yet — owner's call, same rule as always.
  Commits have full evidence each; short version, round 1:
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

  **Next up:** the 2026-08-27 entry above is the current front of the queue — merge
  `fix/post-overhaul-bugs` (owner's call, per RULES below; Praktik Set placement is now
  decided — see round 2 above, no longer an open question), and someone who can verify actual
  Japanese readings should work through `docs/RUBY_MISMATCH_AUDIT.md`. Otherwise unchanged from
  before: 53/55 excluded, 58/59 each need their own dedicated session (schema migration;
  sourcing real TTS audio).
---

_(ACTIVE TASKS and OPEN DECISIONS — content-dq's task tracker and decision log, both fully
resolved — archived to `docs/archive/HANDOFF-content-dq-era.md`. Pending work for the current
phase lives in CURRENT STATE's top entry, under "NOT done — pick up here" instead.)_

---

## RULES

- Never push to `main`
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
