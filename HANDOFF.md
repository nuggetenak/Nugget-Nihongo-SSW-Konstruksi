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
  during branch work, per the standing rule, even though items 61/62 touched this file heavily.

- **🟢 Batches A, B, C of the new plan all done — items 43,44,65 / 45,46,57,49,50,63 /
  61,62. 12 commits total this session, 562/562 tests, zero regressions.** Older two batches'
  full detail: commits + `_MAP.md`'s session log (not re-summarized here each time — see that
  log's own 2026-08-26 rows).

  **Batch C (`61`+`62`, combined per the plan's own "these two want doing together"):**
  self-hosted, subsetted fonts replacing the Google Fonts CDN, plus generated (not
  hand-written) `PRECACHE_URLS`. The heaviest single item this session — genuine build
  infrastructure, not a JSX/CSS fix, so it got a correspondingly heavier verification pass:

  - Licensing (the plan's own "check rather than assume" ask): confirmed SIL OFL 1.1 for all
    three families against each project's own repo and the fonts' own embedded copyright
    metadata, not assumed from "most Google Fonts are OFL."
  - Character-set extraction needed two corrections before it was trustworthy: scoping to
    `cards.js` alone missed real content in `confusion-pairs.js`/`danger-pairs.js`/
    `angka-kunci.js`/the JAC and Wayground sets (990 chars found → 1,327 once broadened);
    classifying by Unicode block instead of by which field a character came from put Greek
    letters used in real construction/electrical notation (Φ, inside actual `jp` fields) in
    the wrong font's subset.
  - Found, not fixed (flagged in `DESIGN_SPEC.md` §3): 70 wayground data files use Kangxi
    Radical codepoints instead of the correct CJK ideographs for a few characters (visually
    identical, semantically wrong); one card has a Cyrillic а/р typo in Indonesian text.
  - Final check was subset-vs-source-font coverage, not a blind "does my list match" — catches
    real subsetting bugs without false-flagging glyphs (mostly emoji) no plain text webfont
    ever had. Result: **zero characters dropped**, both variable weight axes intact.
  - **1.44 MB total, a 92% reduction vs. naively self-hosting the full unsubsetted families
    (18.11 MB)** — confirms the plan's own hypothesis that this app's fixed corpus is a good
    fit for exact subsetting.
  - New `scripts/generate-precache.mjs`, runs as `postbuild`, reads Vite's real manifest
    (`manifest: true` added to `vite.config.js`). Precache scope decided per the plan's own
    suggested middle path (surfaced, not silently picked): shell + the 3 highest-traffic modes
    (`kartu`/`ulasan`/`kuis`) + their full dependency chains + the 6 font files = 38 entries.
    Not all 21 modes — traded against install size for the metered-connection audience.

  **Noticed, not fixed, still true:** `standardizeFuri()` still dead code. The 2 pre-existing
  `--ssw-accentSoft` css-vars warnings, still there, still unrelated. No automated test for
  `generate-precache.mjs` itself (would need to mock Vite's build system or run real builds in
  the test suite) — verified manually via an actual clean build + file-existence check instead,
  documented as a known gap in `PWA_RELEASE_SPEC.md` §2 rather than left silent.

- **🟡 Batch D (items 47, 48) — investigated, NOT executed. Needs owner decisions the plan
  itself flags as needed before code, not something to guess and build.** Full context and the
  specific questions are in this session's chat, not repeated here — summary: item 47 wants an
  actual mode-shape → feature definition (what should `pause`/`keyboard`/`SRS-rating` mean for
  each mode shape, not just what each mode currently happens to have); item 48 wants
  `SimulasiMode` redesigned from immediate-advance to free-navigate-then-submit, which the plan
  itself says interacts with item 51 (not yet built) — building 48 first would make the
  already-tracked mid-session-loss problem worse until 51 also lands, so the sequencing itself
  is part of what needs deciding. Re-verified the feature matrix against current code before
  presenting this (it drifted since the plan was written — this session's own Batch B work gave
  `DengarMode`/`ProductionMode`/`QuizProduksiMode` real `cardId` linkage that item 47's original
  audit didn't have).

  **Next up:** whichever of 47/48 the owner has direction on, or Batch E/F (carried-over polish
  / approved enhancements) if D stays parked. Nothing in D started in code.
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
