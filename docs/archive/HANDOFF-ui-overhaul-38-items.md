# HANDOFF.md — UI overhaul execution narrative (2026-08-25), archived

> **Historical. Retired from HANDOFF.md's CURRENT STATE 2026-08-26**, once Batch A
> (items 43/44/65 of the *new* plan) landed on top of it, per `docs/AGENT_WORKFLOW.md` §3:
> retire finished work rather than let CURRENT STATE accumulate. The underlying work
> (all 38 items of the archived `docs/archive/UI_UX_PLAN-2026-08-overhaul.md`) was already
> fully shipped and verified as of 2026-08-25 — this is the "what shipped, in dependency
> order" writeup and its accompanying decisions/incidental-fixes record, preserved verbatim
> because future sessions may still need the *why*, not just the fact that it happened.
> Condensed pointer: `_MAP.md` § Agent Session Log.
>
> As of this archiving, the branch is still **not merged to main** — that remains the
> owner's call, unchanged by anything below.

---

**🟢 UI OVERHAUL PLAN COMPLETE — branch `feat/ui-overhaul`, ~58 commits ahead of `main`, still
NOT merged.** `main` is untouched and still at the post-content-dq-merge state. All 38
actionable items of the overhaul plan shipped; that plan is archived at
`docs/archive/UI_UX_PLAN-2026-08-overhaul.md`. Verified green before every push: `npm test`
**546/546** (56 files), `npm run lint` 0 warnings, `npm run build` clean (the `data-cards`
661KB chunk warning is the known, deliberately-deferred issue below, not new).

**Merge decision is the owner's and hasn't been made.** `CACHE_VERSION` in `public/sw.js`
still needs its pre-deploy bump (`docs/PWA_RELEASE_SPEC.md` §5) — deliberately not done
during branch work.

**Historical note (2026-08-20), kept because the direction still governs:**

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
8. StatsMode, BelajarTab, and SayaTab redesigned for wide screens. All three reuse Glossary's
   `auto-fit` + `minmax()` row-container technique rather than introducing a new pattern:
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

**EXECUTION COMPLETE (2026-08-25) — all 38 actionable items shipped**, each its own commit,
each verified green before pushing (`npm test` / `npm run lint` / `npm run audit:css-vars` /
`npm run build`). Final count **546/546 (56 files)**, up from 435 when the overhaul started.
Every commit message carries that item's specific evidence and reasoning — this entry is a
summary, not a replacement for reading them. The plan itself, with all its per-item "how it
fits" reasoning and its record of routes deliberately not taken, is preserved at
`docs/archive/UI_UX_PLAN-2026-08-overhaul.md`.

Items 9, 10 and 37 (the three that were blocked on an owner decision) were resolved by the
owner on 2026-08-24 — restrict-usage for contrast, wait-for-user for the service worker, and
a scoped now-not-later for browser history — then shipped.

**Five deferrals were carried forward into the new plan rather than dropped:** the `rem`
conversion, `correctFlash`/`wrongShake` parity across hand-rolled modes, incremental mid-quiz
persistence, the in-app-exit history gap, and `FilterPopup` wiring. They are items 50–55 in
`docs/UI_UX_PLAN.md`, each with its original reason recorded.

**Two things found and fixed during execution that weren't itemized in the plan:**
- `AppShell.module.css`: `.content[data-nav-safe='true']` was out-specificity-ing the desktop
  media query's intended `--sp-6`, so the three tab screens reserved ~100px of dead bottom
  padding at desktop width for a bottom-nav pill that's `display:none` there. Found while
  wiring item 1's toast-offset fix through this exact file; fixed in the same commit. Directly
  relevant to item 12's "dashboard vertical dead space" diagnosis — part of that dead space was
  this, not just conditional content.
- `Dashboard.jsx`'s "Beranda" title carried a hardcoded `aria-hidden="true"` regardless of
  breakpoint, while CSS already correctly swapped which of two page titles was *visually* shown
  at 1040px. Screen readers stayed stuck announcing the mobile-only branding text even at
  desktop width, where sighted users see something else — visible and announced text were
  different strings. Found and fixed while doing item 11/35's heading work.

**Spec docs updated to match, in a follow-up pass after realizing it hadn't happened per-item as
the plan's own §10 requires:** `docs/DESIGN_SPEC.md` gained the z-index scale (item 4) and
`--tap-min` documentation (item 36) — neither existed in any spec before. `docs/COMPONENT_SPEC.md`
gained a note that `Row` renders as a real `<button>` when clickable (item 33), a warning that
`--c-*`/`--color-*` are dead token schemes (item 30), and two new sections — §7 for `ModeHeader`
as a shared primitive (item 11), §8 for `JpDisplay`'s `lang="ja"` handling (item 34).
`docs/LAYOUT_SPEC.md` §4 documents SideNav's expanded role (item 13). `docs/CARD_CONTENT_SPEC.md`
§6 gained a short cross-reference to COMPONENT_SPEC §8 — recalibrated from the plan's original
suggestion of putting the full rendering detail there, since that document turned out to be
purely about data-encoding conventions once actually read, not rendering.

`docs/BLUEPRINT-CURRENT.md` was archived to `docs/archive/` with a provenance header carrying
the full drift table — it claimed storage v3 / 23 modes / 1,443 cards / 457 tests against an
actual v6 / 21 / 1,438 / 435, and described the removed Doboku/Kenchiku tracks at length.
Checked first that nothing live was lost: its one still-useful section, "Hard Constraints (Do
Not Break)," is already covered more accurately in `docs/PWA_RELEASE_SPEC.md` §1,
`docs/AGENT_WORKFLOW.md` §2, and `_MAP.md` §1/§3. `ARCHIVE-INDEX.md` gained a row and had three
stale "superseded by" pointers retargeted. `_MAP.md`'s `docs/` tree turned out to be stale in
the same way — it still listed `DATA_ARCH_AUDIT.md` as live (archived 2026-08-19) and omitted
every spec doc added since — so it was corrected to match the directory.
