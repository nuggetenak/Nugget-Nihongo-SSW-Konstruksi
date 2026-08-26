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

- **Branch `feat/ui-overhaul`, still NOT merged to `main`** — owner's call. `main` untouched.
  `CACHE_VERSION` in `public/sw.js` still needs its pre-deploy bump — deliberately not done
  during branch work, including through items 61/62 which touched that file heavily.

- **The 38-item overhaul (2026-08-25) is old news — full narrative in
  `docs/archive/HANDOFF-ui-overhaul-38-items.md`.** Still true: amber identity locked, hazard
  rail reserved for time-sensitive/active state only, flashcard height from `FlipCard.jsx`'s
  `ResizeObserver` (don't re-litigate), icons as CSS masks not `<img>`.

- **🟢 Batches A through E of the new plan (`docs/UI_UX_PLAN.md`) all done — items 43, 44, 65,
  45, 46, 57, 49, 50, 63, 47, 48, 51, 52, 54, 64. 21 commits total this session, 581/581 tests
  (up from 546 at the start), zero regressions.** Only Batch F remains (60, 56, 58, 59 — 57
  already shipped in Batch B).

  **Batches A–C** (43,44,65 / 45,46,57,49,50,63 / 61,62): full detail in their own commits and
  `_MAP.md`'s earlier rows for this date — not re-summarized again here.

  **Batch D** (47 → 48) — the owner explicitly delegated both decisions ("do the judgment
  call") rather than this staying blocked. Item 47: defined a mode-shape → feature matrix
  (`COMPONENT_SPEC.md` §12) rather than chasing per-mode parity; closed one gap
  (`DengarMode`'s missing keyboard support). Item 48: `SimulasiMode` redesigned from
  immediate-advance to free-navigate-then-submit, matching a real exam. Reconsidered the
  plan's own "interacts with item 51, decide the order" caution rather than just repeating it —
  split "deferred scoring" into deferred-*saving* (still genuinely risky, still item 51's job)
  and deferred-*feedback-display* (not risky, buildable now), so this didn't need to wait after
  all. Scoring extracted to a pure, tested function (`simulasi-scoring.js`) since a subtle bug
  there wouldn't just look wrong, it would misstate someone's real exam readiness.

  **Batch E** (51 → 54 → 52 → 64, no decisions needed per the plan) — the batch that found the
  most real, unplanned complexity:
  - **51**: mid-quiz persistence. New `quiz-persistence.js` (moved out of `src/hooks/` once I
    noticed it wasn't actually a hook — no `useState`/`useEffect` inside). `QuizMode` is the
    reference implementation, not full coverage — a resume needs the *exact question set*
    restored, not just progress markers against a freshly re-randomized quiz, and getting that
    right took real care even once. `JACMode`/`VocabMode`/`WaygroundMode` + hand-rolled modes
    are a documented same-pattern follow-up, not attempted here.
  - **54**: `speakJP` onError wired at the 5 missing call sites via a new shared hook,
    extracted from `DengarMode`'s existing pattern. Deliberately did NOT refactor `DengarMode`
    onto it (it has a session-reset nuance the shared hook doesn't expose) — touching
    already-correct code for a cosmetic win wasn't worth the risk.
  - **52**: in-app exit now pops the history entry. The plan's stated blocker turned out
    already solved (`isPopRef`) — just never used to *initiate* a pop, only to react to one.
    **Caught a real regression via the full test suite, not review**: the first design made the
    visible state update depend on `history.back()`'s async popstate, which broke an existing,
    unrelated test (`global-keyboard.test.jsx`). Redesigned so the direct state change always
    happens synchronously; popping the browser entry is now purely additive. Also fixed a
    pre-existing bug found along the way: `modeParams` was never cleared on any popstate, not
    even the original hardware-back path.
  - **64**: the plan's "21 sites" turned out to be genuinely overstated — verified count is 1
    real fix, 11 correctly-already-white, 2 on an amber-*gradient* (deliberately not touched —
    the token's dark value likely has poor contrast against the gradient's darker stop, would
    need its own check), 1 unrelated finding flagged separately.

  **Noticed, not fixed, still open:** `Onboarding.module.css`'s active track-label turns text
  white without the background actually changing for that state (item 64's tangent). The
  amber-gradient contrast question (`Dashboard`/`Onboarding`) is unresolved, not just deferred
  silently. Item 52's async history.back()/replaceState interaction is reasoned through as safe
  but not verified on a real device — worth a first real-device check before merge.

  **Next up: Batch F** (60 → 56 → 58 → 59, per the plan's own suggested order) — 56 and 58 each
  have their own open decision (a band vs. percentage for 56, already effectively pre-decided by
  the plan's own strong recommendation; an FSRS-rating-model question for 58, genuinely open).
  59 is explicitly gated on measuring the combined 61+59 payload first, and the plan is clear
  that "the budget can't hold it" is a legitimate outcome, not a failure to work around.
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
