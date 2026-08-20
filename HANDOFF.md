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

**As of this edit, 2026-08-19 (frontend/UI overhaul session, new agent chat — owner provided
repo+token directly, same protocol).** The 2026-08-18 merge close-out entry that used to follow
this one is archived — see banner above. Verify before trusting past this point — this line
doesn't update itself.

- **🟡 UI OVERHAUL IN PROGRESS — branch `feat/ui-overhaul`, 13 commits (10 feat/style/docs +
  3 new below), NOT merged to `main`.** `main` is untouched and still at the post-merge state
  described further down. The branch is pushed to origin. Every commit was verified green
  before pushing: `npm test` 435/435, `npm run lint` 0 warnings, `npm run build` clean (the
  `data-cards` 661KB chunk warning is the known, deliberately-deferred issue below, not new).

  **Direction (owner-approved before any code was written):** keep and evolve this app's own
  amber identity rather than aligning with the main Nugget Nihongo app; go fully adaptive
  across device sizes, not just "stop wasting space on desktop". Palette is the one locked
  constraint — everything else was left to agent judgement. The signature device is a
  **hazard rail**: a diagonal amber/near-black stripe borrowed from real construction signage,
  used ONLY to mark time-sensitive or active state (exam countdown, daily mission, active nav
  item). It stays meaningful because nothing else uses it — don't decorate with it.

  **What shipped, in dependency order:**
  1. `AppShell` — single owner of responsive layout for every screen. Bottom nav <1040px, side
     nav above. `chrome` prop ('tabs' | 'mode') decides which navigation is offered.
  2. All 21 mode screens routed through it. **This was the biggest gap:** `App.jsx` returned
     early for modes, so they bypassed the shell entirely and stayed a 480px column on desktop
     long after the tabs had gone responsive.
  3. Width is now a **responsive token**, not a per-file decision. 19 stylesheets set their own
     `max-width`; rather than patch each, `--max-w` is redefined at breakpoints in `global.css`
     and every screen inherits it. `--overlay-max-w` (fixed 480px) split out for dialogs,
     toasts, popups, bottom nav. Per-mode width lives in `MODE_META.width`, defaulting to a
     reading column.
  4. Icons unified. `MODE_META.ui` names the vector icon per mode — no component keeps its own
     mode→icon list. 20 generated icons in `public/icons/ui/`, 14 badges in
     `public/icons/badges/`, onboarding art in `public/illustrations/`.
  5. Dashboard, onboarding, and the flashcard screen redesigned.
  6. a11y sweep: added an `h1` (there was none), one global `:focus-visible` ring (there was
     one rule in the entire app), `--tap-min` 44px token, reduced-motion safety net.
  7. Prettier drift cleared repo-wide (was 237 files). **Kept as its own commit** so the UI
     work stays reviewable — mixed in it was a 249-file diff. Confirmed cosmetic: the built
     `data-cards` chunk has an identical content hash before and after.
  8. StatsMode, BelajarTab, and SayaTab redesigned for wide screens (the three items this
     entry used to list under "NOT done"). All three reuse Glossary's `auto-fit` + `minmax()`
     row-container technique rather than introducing a new pattern:
     - `StatsMode`: readiness ring + overview card now pair in a shared row (`.summaryRow`)
       instead of each stretching alone; the heatmap card sizes to its fixed-width SVG
       (`.heatmapCard`, `width: fit-content`) instead of stretching and leaving the calendar
       pinned to the left edge.
     - `BelajarTab`: `.compactGrid` went from a hardcoded 2 columns to `auto-fit` + `minmax`;
       compact width renders identically, wider screens get more columns (latihan's 8 tiles
       go from 4 rows to 2 at wide).
     - `SayaTab`: `Section` now wraps its children in `.sectionBody`, a grid that flows `.row`
       items into columns and routes everything else (`:not(.row)` — inline-edit forms, the
       destructive reset row, Daily Challenge, Achievements) to a full-width span
       automatically, no per-child JSX bookkeeping needed. The achievements badge grid moved
       off a hardcoded 4 columns onto the same `auto-fit` technique.

  **Decisions worth not re-litigating:**
  - **Grid tracks are capped (`minmax(min, 380px)` etc.), not `1fr`, for fixed-size centered
    content** — a ring, a stat number, a badge icon+label. `1fr` is still correct for rows
    shaped like `justify-content: space-between` (Glossary's term rows, SayaTab's settings
    rows) since that content genuinely uses extra width by spreading label/value apart. A
    track's `max` in `minmax()` is a hard ceiling regardless of leftover container space, so
    this is a real fork in the pattern, not an inconsistency — check which shape you're
    looking at before "fixing" one to match the other.
  - **Icons render as CSS masks, not `<img>`.** The art is single-colour line work on
    transparency, so its alpha IS the shape; masking with `background: currentColor` means the
    theme drives colour and dark mode still works. It also made the generator's palette drift
    (#FF9100 vs the specified #F59E0B) irrelevant. Switching to `<img>` would silently freeze
    them and break dark mode.
  - **The flashcard does NOT stretch to fill space.** Its height comes from a ResizeObserver in
    `FlipCard.jsx` measuring the back face, so the card holds one height across the flip.
    Forcing flex growth opens a gap _inside_ the card. This was tried and reverted; there is a
    comment in `flashcard.module.css` saying so.
  - **Prev/Next arrows stayed** on the flashcard screen. The original concept dropped them for
    swipe — a mobile-only assumption. Swipe doesn't exist with a mouse and desktop is now
    supported. The redundant "Lihat/Balik" button was removed instead.
  - **Badge→achievement mapping is explicit per achievement id**, not by array position, so
    reordering `achievements.js` can't silently shuffle the art.

  **Incidental fixes found along the way (not asked for):**
  - `sw.js` `CACHE_VERSION` was `4.21.1` against a `4.23.0` `package.json` — two releases stale
    despite the file's own instruction to bump per deploy. Returning users would have been
    served stale assets. Now `4.23.0`. **Bump this again before any deploy.**
  - `package-lock.json` version was out of sync with `package.json` (4.22.0 vs 4.23.0).
  - The app logo already existed at `public/icons/icon-*.png` but was used nowhere in the UI;
    onboarding showed a generic ⚡ emoji. Now uses the real logo. No new logo art is needed.
  - Content sat under the floating bottom nav on several screens because the safe padding was
    applied inline in `App.jsx` and each screen had to remember it. `AppShell` owns it now.
  - Flashcard "Reset" (erases all progress) sat in a uniform grid one tap from a star filter at
    identical visual weight. Now separated and styled as destructive.
  - `SayaTab.module.css` was 536 lines and contained a complete, stale first stylesheet (lines
    1–247, headed "v3.0 — UI Upgrade Round 2") entirely shadowed by a second, refined one
    below it. Confirmed via diff and by checking which half the JSX actually depends on (only
    the second half defines `.installCard`, which the JSX uses). Cascade is per-property, not
    per-block, so a handful of first-half-only declarations were still live even though the
    rest of that block was fully overridden by the second: `progressCard` box-shadow and its
    `::before` gradient line, `progressInfo` z-index, `progressKnown` font-family/line-height,
    `progressStreak` border, `pageTitle` font-family/line-height. Removed the dead block and
    folded the still-live properties into the surviving rules — zero visual change confirmed
    property-by-property, file is now 312 lines. Also gave `.progressCard` a `max-width: 560px`
    so the hero card at the top of the page doesn't stretch to the full 1180px column with
    nothing to pair it with.

  **NOT done — pick up here: → `docs/UI_UX_PLAN.md`**

  All four items that used to be listed here have moved into that document (2026-08-20 drafting
  session, docs-only, no application code touched). It is the work queue now — read it rather
  than this list:

  - Dashboard vertical dead space → plan item 12, with a diagnosis (five of the dashboard's
    eight blocks are conditional, so a new user sees four) and candidate content.
  - 10 placeholder mode icons → plan item 26, **visibility only.** Still owner-owned, still
    external art generation, no solution drafted. The ten keys are enumerated there.
  - `data-cards` 661KB chunk → plan item 27, **visibility only.** Still a build concern for its
    own branch, no solution drafted. Re-verified at 661.05KB / 191.32KB gzipped.
  - Branch unmerged, review the Prettier commit (`f2fa439`, 237 files) separately → plan item 29.

  The plan now holds **42 numbered proposals** across four priority bands, each with evidence, a
  fit-to-existing-system note, and acceptance criteria, plus a dependency-ordered batch plan.
  Items 1–29 came from the first drafting pass; **items 30–42 came from a second exhaustive audit
  the same day**, which went looking specifically for defects that pass `npm test`, `npm run
  lint`, and `npm run build` and still ship broken. It found enough of them to be worth
  distrusting a green pipeline on UI work here:

  - **11 CSS custom properties are referenced but defined nowhere, with no fallback** (plan item
    30). An undefined `var()` is valid CSS that silently voids its whole declaration. The worst
    case: WaygroundMode's overall-score percentage is meant to render green ≥70% / amber ≥50% /
    red below, and all three branches point at dead tokens, so **the colour coding does nothing**.
    AngkaMode's option boxes lose fill and border the same way. Two abandoned naming schemes
    (`--c-*`, `--color-*`) plus a `--fw-semibold` typo for `--fw-semi`.
  - **FlashcardMode's window keydown handler hijacks its own search box** (item 31). Space is
    swallowed and flips the card; arrows navigate cards instead of moving the caret. Multi-word
    search is impossible in the most-used mode. Confirmed with a throwaway reproduction, since
    reading alone wasn't proof. Checked the three other candidate modes — they're fine.
  - **Zero `<label>` elements and zero `htmlFor` in the whole codebase** (item 32); none of the 12
    inputs has an accessible name.
  - **`SayaTab`'s `Row` — the primitive COMPONENT_SPEC §5 documents as reusable — is a
    `<div onClick>`** (item 33), so the entire settings screen is keyboard-unreachable, including
    erase-all-progress and the "Impor dari File" restore path.
  - **No `lang="ja"` anywhere** (item 34), so every Japanese term is declared Indonesian to screen
    readers and to the browser's CJK glyph selection. `speak.js` already sets `ja-JP` for TTS.
  - **No `<h1>` on any of the 21 mode screens**, or on Belajar/Saya (item 35). Item 11's
    `ModeHeader` resolves most of it as a side effect — a reason to sequence 11 early.
  - `.btnIcon` is 40px and `.btnBack` ≈32px against the app's own justified `--tap-min: 44px`,
    which is referenced in only 2 of ~30 stylesheets (item 36).
  - `--font-jp` falls back to `Noto Serif JP`, **which the app never loads** — Japanese exam
    content in SimulasiMode drops to generic serif (item 39).

  **Three items are flagged 🔶 needing an owner decision before execution:**
  - **Item 9** — measured contrast failures. `--ssw-textFaint` is 2.89:1 in light theme and is
    what colours the bottom nav's inactive labels; amber-as-text is 2.11:1, which also affects
    the focus ring. Any fix touches the token table DESIGN_SPEC calls locked. Three routes given.
  - **Item 10** — no `pushState`/`popstate` anywhere, so Android's hardware back button exits the
    PWA from any screen, mid-quiz included. Fixing it is a navigation-architecture change.
  - **Item 37 (new)** — `sw.js` calls `skipWaiting()` + `clients.claim()` and deletes old caches,
    while all 21 modes are `React.lazy` with content-hashed chunks. A deploy during an open
    session can leave stale imports that exist neither in cache nor on the server, and
    `ErrorBoundary`'s "Coba lagi" only clears React state, so it retries the same dead import
    forever. Three routes given; all touch `sw.js` and need a `CACHE_VERSION` bump.

  The audit also recorded several suspicions that turned out **not** to be bugs, so a later
  session doesn't "fix" them: `toLocaleDateString('sv')` is the correct ISO-key trick;
  AngkaMode's digit shortcuts and its typing input live in two components that never co-render;
  ProductionMode and QuizProduksiMode bind only Enter/Escape while their field is focused.

  Baseline re-verified during both passes: `npm test` 435/435 (39 files), `npm run lint` 0
  warnings, `npm run build` clean apart from the known `data-cards` warning. `src/` confirmed
  untouched before committing.

  **Done this session (was flagged for you last time):** `docs/BLUEPRINT-CURRENT.md` has been
  archived to `docs/archive/` with a provenance header carrying the full drift table — it claimed
  storage v3 / 23 modes / 1,443 cards / 457 tests against an actual v6 / 21 / 1,438 / 435, and
  described the removed Doboku/Kenchiku tracks at length. Checked first that nothing live was
  lost: its one still-useful section, "Hard Constraints (Do Not Break)," is already covered more
  accurately in `docs/PWA_RELEASE_SPEC.md` §1, `docs/AGENT_WORKFLOW.md` §2, and `_MAP.md` §1/§3.
  `ARCHIVE-INDEX.md` gained a row and had three stale "superseded by" pointers retargeted.
  `_MAP.md`'s `docs/` tree turned out to be stale in the same way — it still listed
  `DATA_ARCH_AUDIT.md` as live (archived 2026-08-19) and omitted every spec doc added since — so
  it was corrected to match the directory.

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
- `docs/UI_UX_PLAN.md` — **not stable reference; a work queue.** 29 prioritised UI/UX items
  drafted 2026-08-20, carrying everything that used to sit in CURRENT STATE's NOT-done list.
  Unlike the `*_SPEC.md` files above, this one is meant to shrink and eventually be retired to
  `docs/archive/` once its bands are closed — see `docs/AGENT_WORKFLOW.md` §3
- `_MAP.md` — architecture map + full session-by-session history log
- `docs/archive/` — superseded docs, including this file's predecessors (`SESSION_PROMPT.md`,
  `PROGRESS.md`, `DATA_QUALITY_HANDOFF_v16/v17/v18.md`), `HANDOFF-content-dq-era.md` (the
  retired GETTING STARTED/PROTOCOL sections + the full 2026-08-18 merge entry + the fully
  resolved ACTIVE TASKS/OPEN DECISIONS content, all pulled out of this file 2026-08-19), and
  `DATA_ARCH_AUDIT.md` (frozen point-in-time audit, session 16 — moved here 2026-08-19, was
  sitting in `docs/` already marked "historical, not live")
- `README-CONTENT-DQ.md` — what's actually present on this branch vs `main`-only
