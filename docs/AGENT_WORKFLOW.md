# Agent Workflow — SSW Konstruksi

The source of truth for **how** work happens on this repo, across sessions and across whichever
agent/tool picks it up. Not project state (that's `HANDOFF.md`) and not a technical spec (that's
`docs/*_SPEC.md`) — this is process. It should change rarely: task content changes every
session, the steps for approaching a session shouldn't.

Read this before doing anything else. If a Project-level instruction already pointed you here,
you've done that step — carry on to §1.

## 1. Starting a session

1. **Clone fresh.** Don't trust memory, a prior session's summary, or a stale local copy —
   `git clone` the repo now. Check `HANDOFF.md`'s current entry for which branch is live; don't
   default to `main` without checking, most active work happens on a feature branch.
2. **Read `HANDOFF.md`'s top CURRENT STATE entry next.** That's the actual current state.
   Everything below it, and everything in `docs/archive/`, is history — informative, not
   instruction.
3. **Verify claims against the actual code before trusting docs or assumptions.** Things drift.
   A doc saying something is true is a claim to check against the repo, not a fact to build on
   directly — this has caught real problems before (a stale `CACHE_VERSION`, a duplicate
   stylesheet nobody noticed, a doc self-describing as historical while still sitting live).
4. Read `_MAP.md` and the spec docs (§4) only as needed for the task at hand — they're
   reference, not a mandatory full read every session. Grep/search before you view-in-full.

**Token handling:** pasting a credential directly in chat is established, deliberate practice
here, not an oversight — don't flag it as a mistake each time. Use it once, embedded in the
clone URL; then strip it from git config immediately (`git remote set-url origin` back to the
plain HTTPS URL) so it isn't sitting in config for the rest of the session. Re-add it only
briefly when actually pushing, then strip again right after.

## 2. While working

- **Non-trivial work happens on a dedicated branch off `main`, merged only once verified
  clean.** Never push directly to `main`.
- **Verify before AND after.** Run tests/lint/build before starting changes — a real baseline,
  not a trusted claim — and again before committing.
- **Direct execution once direction is clear.** Don't check in on routine decisions or anything
  with an obvious right answer.
- **Flag genuinely risky things or real judgment calls _before_ doing them**, not after.
  Anything hard to reverse, any meaningful expansion past what was literally asked, any decision
  where reasonable people could land differently — that's a judgment call, not routine
  execution.
- **Surface problems noticed along the way, not just the thing asked about.** This has paid off
  repeatedly — a duplicate stylesheet, a latent CSS selector bug, a doc that already knew it was
  stale but hadn't moved. Don't go looking for extra work, but don't stay quiet about what turns
  up while doing the actual task either.
- **One source of truth per concept.** Tokens, registries, an existing pattern already doing this
  job elsewhere — reuse it rather than inventing a parallel approach. Check the spec docs (§4)
  before assuming something needs figuring out from scratch; a fair amount of it already has been.
- **Commit messages carry the reasoning, not just the change.** The diff already shows *what*;
  the message is the only place *why* survives. Future sessions read commit messages before they
  read code.
- **Ambiguity → write it down, ask, don't guess and proceed.**

## 3. Closing out a session

1. Update `HANDOFF.md`'s CURRENT STATE top entry **in place**. No versioned filenames
   (`_v17`, `_v18`, `HANDOFF_v2.md`) — that pattern was tried and explicitly retired (session 23):
   keeping several documents in sync by hand, across sessions with no shared memory, doesn't hold
   up. One file, edited in place, is easier to keep honest.
2. **Retire finished work, don't let it accumulate.** If an entry's work is genuinely done or
   superseded — not just "this session ended," but the underlying work is finished or merged —
   move it out: full text to `docs/archive/` with a short header explaining provenance, a pointer
   row into `_MAP.md`'s Agent Session Log, then delete it from `HANDOFF.md`. A live document that
   only ever grows stops getting read in full, which defeats the point of having one. (This is
   also why this file itself should stay short — if it starts accumulating session-specific
   content, that content belongs in `HANDOFF.md` or `_MAP.md` instead.)
3. Tests/lint/build clean **before pushing**, not just before committing — check again if any
   time passed between the two.
4. Commit, push.

## 4. Where things live — don't ask for these to be pasted, read them from the clone

| Doc                          | Covers                                                  |
| ----------------------------- | -------------------------------------------------------- |
| `HANDOFF.md`                  | Current live state only — read every session             |
| `_MAP.md`                      | Architecture + full session-by-session history log       |
| `docs/CARD_CONTENT_SPEC.md`    | Card data schema, taxonomy, ruby rules                    |
| `docs/DESIGN_SPEC.md`          | Palette, typography, icon system, hazard-rail motif       |
| `docs/LAYOUT_SPEC.md`          | Breakpoints, width tokens, the auto-fit/minmax pattern    |
| `docs/COMPONENT_SPEC.md`       | CSS Modules conventions, shared primitives, component patterns |
| `docs/PWA_RELEASE_SPEC.md`     | Offline architecture, `CACHE_VERSION` discipline, deploy checklist |
| `docs/ASSET-PROMPTS.md`        | Generation prompts for icon / badge / illustration art     |
| `docs/UI_UX_PLAN.md`           | **Work queue, not a spec** — prioritised UI/UX items; shrinks as they land, retires to `docs/archive/` when empty |
| `docs/archive/`                | Superseded/completed material, full text preserved        |
| `CHANGELOG.md`                 | Versioned release notes (updated at merge/release time)   |

Don't duplicate any of this into `HANDOFF.md` or here — link to it.

**Every live doc belongs in this table.** Two docs have now drifted badly while sitting in `docs/`
without a row here — `DATA_ARCH_AUDIT.md` (archived 2026-08-19) and `BLUEPRINT-CURRENT.md`
(archived 2026-08-20, by which point every headline number in it was wrong). A doc nothing points
at is a doc nothing keeps honest. If you add a doc, add its row; if you find a doc with no row,
that is a signal to check whether it is still true.

## 5. Minimal kickoff

If a Project-level instruction already points here, a session only needs:

```
Clone: https://github.com/nuggetenak/Nugget-Nihongo-SSW-Konstruksi.git (branch: <name>)
Token: <paste>
Task: <this session's priority, or "continue — pick up from HANDOFF's NOT-done list">
```

If there's no Project-level instruction in play (a fresh chat, a different tool), add one line:
`Read docs/AGENT_WORKFLOW.md first.` Everything else in this file still applies either way.

## 6. On models

Different phases of work may deliberately use different models — capability/cost fit for the
task, not a reason to change anything above. This file holds regardless of which model or tool
is reading it.
