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

- **The 38-item overhaul (2026-08-25) is old news — full narrative in
  `docs/archive/HANDOFF-ui-overhaul-38-items.md`.** Still true and worth keeping in mind: amber
  identity locked, hazard rail reserved for time-sensitive/active state only, flashcard height
  from `FlipCard.jsx`'s `ResizeObserver` (does not stretch, don't re-litigate), icons as CSS
  masks not `<img>`.

- **🟢 Batch A + Batch B of the new plan (`docs/UI_UX_PLAN.md`) both done — items 43, 44, 65,
  45, 46, 57, 49, 50, 63. 9 commits total this session** (`1419c2c` `bfc678d` `f650d55` `e4d91dd`
  `9de2834` `3d8a47b` `97e39a0` `cc939de`, plus the `0ada7fe` docs close-out between batches),
  each verified via `npm run validate` before and after. **562/562 tests, up from 546 at the
  start of this session. Nothing pushed to origin yet — all 9 commits are local.**

  **Batch A** (ReviewMode/FlashcardMode parity: furigana policy, true ruby, swipe gestures) —
  full detail in commits `1419c2c`/`bfc678d`/`f650d55` and `_MAP.md`'s session log; not
  re-summarized here to avoid a third copy of the same reasoning.

  **Batch B** (quiz core, per the plan's own §10: "45 → 46 → 49, same files, one sitting; 50
  folds in naturally; 63 is a one-liner to sweep up while nearby"):

  - **Item 45**: screen-reader outcome announcements. The plan's premise was wrong, verified
    before building anything — `QuizShell` didn't already have this (its two `aria-live`
    regions are progress and timer, neither announces correct/wrong), so this wasn't an
    extraction, it was new everywhere, including the four modes the plan called compliant. New
    `QuizAnnouncer.jsx`. `SprintMode` deliberately excluded (self-assessment, no graded answer).
  - **Item 46 + 57** (combined, per the plan's own recommendation): `ResultScreen` adopted by 6
    more modes (`AngkaMode`, `DangerMode`, `ConfusionMode`, `DengarMode`, `ProductionMode`,
    `QuizProduksiMode`). `SimulasiMode`/`SprintMode` deliberately excluded, documented at each
    call site. Found and fixed a real regression from item 43 along the way — `ResultScreen`'s
    review section was showing raw `《reading》` markup since the `QuizShell` question field
    changed from stripped to raw. Fixed `VocabMode`'s missing `onRetryWrong` (root cause was
    `ModeRouter.jsx`, not `VocabMode.jsx`). New `session-weakness.js` for item 57's drill
    suggestion — opt-in, silently absent where a mode's data doesn't map to `CATEGORIES`
    (verified per mode rather than assumed).
  - **Item 49**: `QUIZ_COUNTS` deduplicated (`src/utils/constants.js`). Verified the plan's own
    "check whether this actually works" ask and found a real bug: `prefs.quizQuestionCount` was
    only read/written by `QuizMode` — the other three modes reset to 10 every session
    regardless of what was picked. Fixed at all four.
  - **Item 50**: `correctFlash`/`wrongShake` reach 4 modes, not the "eight" the plan (or even
    `DESIGN_SPEC.md`'s own item-21 note, which said "seven") claimed — checked each mode's
    actual shape rather than trusting either number. `SimulasiMode` already had it (uses
    `OptionButton` directly), `ProductionMode`/`QuizProduksiMode` are free-text with a
    differently-animated reveal panel, `SprintMode`'s colors are static not reactive.
  - **Item 63**: `GlossaryMode`'s A-Z bar, 28px → `--tap-min` (44px). One-liner, exactly as
    described.

  **Noticed, not fixed, still true:** `standardizeFuri()` in `jp-helpers.js` is dead code
  (item 43's retired toggles were its last callers). The 2 pre-existing `--ssw-accentSoft`
  css-vars warnings (`AngkaMode.module.css:225`, `DangerMode.module.css:222`) are still there,
  confirmed unrelated to anything touched this session. No new automated tests for item 45's
  policy-threading equivalent — outcome announcement — beyond `QuizAnnouncer`'s own unit tests;
  nothing exercises it through an actual mode yet.

  **Next up: Batch C or D** per the plan's own §10 — **C** (61 → 62, offline asset integrity,
  independent of A/B, 61 needs a licensing check before code) or **D** (47 → 48, needs owner
  decisions on the mode-shape table and deferred-feedback before starting — not a session to
  just start executing). Owner's call which.
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
