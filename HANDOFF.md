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

**As of this edit, 2026-08-26.** Verify before trusting past this point — this line doesn't
update itself.

- **Branch `feat/ui-overhaul`, still NOT merged to `main`** — that remains the owner's call.
  `main` is untouched. `CACHE_VERSION` in `public/sw.js` still needs its pre-deploy bump
  (`docs/PWA_RELEASE_SPEC.md` §5) — deliberately not done during branch work.

- **The 38-item overhaul (2026-08-25) is old news now — full narrative retired to
  `docs/archive/HANDOFF-ui-overhaul-38-items.md`.** Condensed pointer: `_MAP.md` § Agent
  Session Log, 2026-08-25 row. Still true and worth keeping in mind: the amber identity is
  locked, the hazard rail is reserved for time-sensitive/active state only, the flashcard's
  height comes from a `ResizeObserver` in `FlipCard.jsx` and does not stretch (tried, reverted,
  documented in `flashcard.module.css`), icons render as CSS masks not `<img>`.

- **🟢 Batch A of the new plan (`docs/UI_UX_PLAN.md`) done — items 43, 44, 65, 3 commits
  (`1419c2c`, `bfc678d`, `f650d55`), each verified via `npm run validate` before and after.
  546/546 tests throughout, zero regressions.** This was the "ReviewMode is the poorer
  relation of FlashcardMode" set — furigana policy, ruby rendering, swipe gestures — done as
  one pass over one file, per the plan's own §10 suggested order.

  **Item 43** brought `furiganaPolicy` from 3 real consumers to every Japanese-rendering
  surface. The plan named 15 non-compliant modes (14 fixed here, `ReviewMode` is item 44);
  **2 more turned up in final verification that the plan's mode-scoped audit never caught**,
  because they live in `src/components/`: `Dashboard.jsx`'s "recently studied" widget and
  `SayaTab.jsx`'s daily-challenge question — both rendering raw `jp` with zero processing,
  arguably the two most-seen instances of the bug in the whole app (home tab, settings tab).
  Retired 3 local `showFuri` toggles (`JACMode`/`VocabMode`/`WaygroundMode`) that silently
  overrode the global policy — setting `'hidden'` to drill didn't hide anything in those
  three specifically until this fix. `QuizMode`'s named bug ("`'tap'` treated identically to
  `'always'`") turned out architectural: fixed at the shared `QuizShell` level (also used by
  `JACMode`/`VocabMode`/`WaygroundMode`), which was rendering plain text with no ruby at all
  regardless of policy. Two decisions documented in `docs/COMPONENT_SPEC.md` §8.1 rather than
  left implicit: answer options stay stripped (giveaway risk) but prompts and post-answer
  review screens don't (nothing left to protect once graded); a handful of dense inline
  labels stay stripped too, since `JpFront` computes its own font size with no override prop
  and its minimum size breaks tight rows.

  **Item 44**: `ReviewMode` adopted `JpFront` the same way — same fix, own commit since it's
  the specific thing the owner remembered. Bonus fix, same underlying bug: `ReviewMode`'s
  *and* `FlipCard`'s (the reference component) pre-flip `aria-label`s were both building
  their accessible name from raw, unstripped `jp`, so a screen reader announced literal
  `《reading》` markup. Both fixed.

  **Item 65**: swipe ported from `FlashcardMode/index.jsx` to `ReviewMode` — read the actual
  handler rather than assuming its shape first. Post-flip swipe maps directly to an FSRS
  rating (up/left/right = Easy/Again/Good, same 60px/÷120 thresholds, same live drag-tilt
  feedback), not just "reveal" as assumed going in. Pre-flip has no 1:1 port — `FlashcardMode`
  swipes to navigate a free-browsing deck, `ReviewMode`'s FSRS queue has no "previous" concept
  — so pre-flip swipe maps to flip instead. Deliberately not extracted into a shared hook
  (the source is inline in a working, tested, out-of-scope file; duplicating the ~15 lines
  felt safer than refactoring something nobody asked to touch). Scoped to flip-card surfaces
  only, per the plan's own note that swipe next to tappable quiz options invites mis-fires.

  **Noticed, not fixed, still true:** `standardizeFuri()` in `jp-helpers.js` is dead code now
  (its last 3 call sites were `VocabMode`/`WaygroundMode`'s retired toggles) — small cleanup
  candidate, not urgent. `--ssw-accentSoft` has an undefined-token fallback in
  `AngkaMode.module.css:225` and `DangerMode.module.css:222` (pre-existing, `audit:css-vars`
  flags it as non-blocking, neither file was touched by this batch). No new tests were added
  for the policy threading itself — existing 546 tests all still pass unmodified, which is
  real but partial coverage. Dedicated `furiganaPolicy` coverage, especially `QuizShell`'s
  `'tap'` path, would be a reasonable small follow-up whenever a session has room for it.

  **Next up: Batch B** per the plan's own §10 — items 45 (a11y announcements) → 46
  (`ResultScreen` adoption) → 49 (shared quiz counts), with 50 and 63 folded in since the
  plan flags them as touching the same files. Nothing started.

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
- `docs/UI_UX_PLAN.md` — **not stable reference; a work queue.** Current plan: **items 43+**,
  drafted 2026-08-25 from a fresh audit of quiz/exam surfaces and furigana consistency, plus five
  deferrals carried over from its predecessor. Nothing started. Unlike the `*_SPEC.md` files
  above, this is meant to shrink and retire to `docs/archive/` once empty — see
  `docs/AGENT_WORKFLOW.md` §3. Its predecessor (items 1–42, all shipped) is already archived
  there; numbering deliberately doesn't restart, so item references in git history stay unique
- `_MAP.md` — architecture map + full session-by-session history log
- `docs/archive/` — superseded docs, including this file's predecessors (`SESSION_PROMPT.md`,
  `PROGRESS.md`, `DATA_QUALITY_HANDOFF_v16/v17/v18.md`), `HANDOFF-content-dq-era.md` (the
  retired GETTING STARTED/PROTOCOL sections + the full 2026-08-18 merge entry + the fully
  resolved ACTIVE TASKS/OPEN DECISIONS content, all pulled out of this file 2026-08-19), and
  `DATA_ARCH_AUDIT.md` (frozen point-in-time audit, session 16 — moved here 2026-08-19, was
  sitting in `docs/` already marked "historical, not live")
- `README-CONTENT-DQ.md` — what's actually present on this branch vs `main`-only
