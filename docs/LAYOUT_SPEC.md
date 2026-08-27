# Layout Spec — SSW Konstruksi

Stable reference for the responsive system built during `feat/ui-overhaul`. Read this before
making any width/column-count decision — it exists specifically so that judgment worked out once
(often the hard way, see §3) doesn't need re-deriving from CSS every session.

## 1. Breakpoints

Defined once, in exactly one place: `@media` blocks at the bottom of `src/styles/global.css`,
kept in sync with the nav-placement breakpoints in `AppShell.module.css`. CSS custom properties
aren't valid inside `@media` conditions, so the breakpoint numbers themselves are necessarily
hardcoded there — everywhere else, use the tokens, not the raw numbers.

| Range              | Name    | Device      | Nav                  |
| ------------------- | ------- | ----------- | --------------------- |
| < 700px             | compact | phone       | bottom nav, 1 column   |
| 700px – 1039px      | medium  | tablet      | bottom nav, wider column, 2-col grids |
| ≥ 1040px            | wide    | desktop     | side nav, 2-col dashboard |

## 2. Width tokens

```css
--max-w: 480px;          /* → 620px at ≥700px, → 1180px at ≥1040px */
--overlay-max-w: 480px;  /* fixed at every breakpoint */
--reading-max-w: 620px;  /* single-column content on medium screens specifically */
--sidenav-w: 236px;
--gutter-compact: 16px;  --gutter-medium: 24px;  --gutter-wide: 32px;
```

`--max-w` is **the only place the content column's width changes.** A screen sets
`max-width: var(--max-w)` once and never needs its own media query for width — it widens with
the shell automatically. `--overlay-max-w` is for dialogs, toasts, popups, and the floating
bottom nav specifically, and stays phone-width at every size on purpose: a 1180px confirm dialog
is not an improvement.

## 3. The auto-fit + minmax pattern

The one responsive technique this codebase uses for "how many columns fit," established while
fixing Glossary's term-row layout and reused for every wide-screen fix since (StatsMode,
BelajarTab, SayaTab). No media query — column count is container-driven:

```css
.container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(MIN, MAX));
  column-gap: var(--sp-4);
}
```

**There are two variants, and picking the wrong one recreates the exact bug this pattern was
built to fix:**

### Variant A — `MAX: 1fr`, for content that benefits from stretching

Use when each item is shaped like `justify-content: space-between` — a label on one side, a
value on the other (Glossary's term rows, SayaTab's settings rows). This content genuinely uses
extra width: it just pushes the value further from the label, which reads fine up to a
reasonable point.

```css
grid-template-columns: repeat(auto-fit, minmax(430px, 1fr));  /* Glossary: JP term ↔ gloss */
grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));  /* SayaTab: setting ↔ value */
```

Glossary's 430px minimum specifically avoids truncating Japanese terms — an earlier 340px
attempt produced 3 columns but truncated long terms with "…", which is exactly the text someone
is scanning for. Density was deliberately traded for legibility.

### Variant B — `MAX:` a finite cap, for fixed-size centered content

Use for anything that doesn't get more useful by stretching — a ring, a stat number, a badge
icon+label, a tile with centered content. **A track's `max` in `minmax()` is a hard ceiling
regardless of leftover container space** — capping it means extra room just stays as page
whitespace instead of padding out the content, which is the actual fix (pairing/flowing more
items, not just making one item's box bigger). This is what motivated the pattern in the first
place: a single centered ring in a `1fr` (or unconstrained) container just became a *bigger* box
with the same small ring floating in it — more width wasn't the fix, a ceiling and something to
pair with was.

```css
grid-template-columns: repeat(auto-fit, minmax(260px, 380px));  /* StatsMode summary cards */
grid-template-columns: repeat(auto-fit, minmax(120px, 140px));  /* BelajarTab compact tiles */
grid-template-columns: repeat(auto-fit, minmax(90px, 120px));   /* SayaTab achievement badges */
```

**When both MIN and MAX are fixed lengths (not `1fr`/`auto`), auto-fit picks the column *count* using
MAX, not MIN** — per spec, tracks are sized at their max for this calculation when the max is
definite. The min only controls shrinking *after* that count is already fixed; it does not widen
how many tracks fit. This is easy to get backwards (it was gotten backwards once, here: BelajarTab
shipped with `minmax(180px, 240px)`, which reads like "as few as 180px" but actually needs
`2×240px + gap` before a second column can ever appear — no phone in the compact breakpoint has
that much room, so it silently rendered a single centered 240px column with dead space beside it,
on every phone, the entire time). **To size a Variant B grid for a specific column count on a
specific container width, solve for MAX** — `N × MAX + (N-1) × gap ≤ target width` — not MIN.
StatsMode's 260/380 pair is fine specifically *because* single-column-until-desktop is its stated
intent (see that file's own comment); it would be the same bug if the intent had been "2 columns
on phone."

### Routing non-uniform children with `:not()`

When a container mixes grid-flowing items with occasional full-width children (a form, a
destructive action row, custom rich content), don't special-case each one in JSX — give the
uniform items a shared class and target the rest:

```css
.container > :not(.row) {
  grid-column: 1 / -1;
}
```

This is how SayaTab's `Section` component routes inline-edit forms, the reset row, and custom
blocks (Daily Challenge, Achievements) to full width automatically, with zero per-child
bookkeeping — see `src/components/SayaTab.module.css` for the live example.

### A pitfall this pattern created once, worth remembering

CSS selectors that assume a fixed column count (`nth-child(odd)` meaning "alone in its row," for
example) silently stop being true once column count becomes container-driven instead of fixed.
BelajarTab had a "lone last card spans full row" rule written for a hardcoded 2-column grid;
switching to `auto-fit` made 3+ columns possible, and `nth-child(odd)` no longer reliably meant
"alone in its row" at those widths. Fixed by scoping that specific rule to
`@media (max-width: 699px)`, where the 2-column assumption is guaranteed true again. If a rule's
correctness depends on knowing the column count, either gate it to the one breakpoint where the
count is fixed, or drop the special case — a plain, ungrouped item at normal tile size is usually
fine without one.

## 4. AppShell

Single owner of responsive layout for every screen (`src/components/AppShell.jsx`). Bottom nav
below 1040px, side nav at/above it. `chrome` prop (`'tabs' | 'mode'`) decides which navigation is
offered. Owns the bottom-nav safe-area padding too — screens don't need to remember it
individually.

**SideNav** (`src/components/SideNav.jsx`) is more than the 3 top-level tabs (item 13, 2026-08-20):
beneath them it renders the full mode registry, grouped by the existing `MODE_SECTIONS` (from
`src/router/modes.js` — the same registry `docs/COMPONENT_SPEC.md` §3 already establishes as the
single source of truth for mode metadata, not a new mapping). Native `<details>`/`<summary>` per
section, no custom JS expand/collapse state. `AppShell` passes `mode` and `onSelectMode` through so
the side nav can mark the active mode and navigate directly to one — both props are optional
(`BottomNav` doesn't take them; narrower screens don't get this secondary list at all, matching
`--sidenav-w`'s own width budget). The section containing the active mode auto-opens; nothing is
forced open when no mode is active. `.modeSections` scrolls internally (`overflow-y: auto` +
`min-height: 0` — the standard fix for flexbox's `min-height: auto` default defeating `overflow`
in a bounded column) rather than pushing the tabs or the footer off-screen when expanded.
