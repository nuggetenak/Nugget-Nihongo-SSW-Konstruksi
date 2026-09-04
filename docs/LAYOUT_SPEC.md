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
--gutter-compact: var(--space-16);  --gutter-medium: var(--space-24);  --gutter-wide: var(--space-32);
```

`--max-w` is **the only place the content column's width changes.** `--overlay-max-w` is for
dialogs, toasts, popups, and the floating bottom nav specifically, and stays phone-width at every
size on purpose: a 1180px confirm dialog is not an improvement.

The gutters are rem (via the spacing scale — `DESIGN_SPEC.md` §4), so they grow with the reader's
text size. That matters because of the Ukuran Teks control: at "Sangat Besar" the body goes 15px →
18.8px, and a gutter frozen at 16px would put bigger words in the same margin.

**Screens do not set width.** `AppShell`'s `.content` applies `--max-w`, the gutter and the
bottom-nav safe area, once, for everything rendered inside it — which is every screen. Ten
stylesheets used to repeat `max-width: var(--max-w); margin: 0 auto` plus their own 16px gutter
anyway; that cost a mode screen 32px of a 390px phone (326px of content where the tab screens,
rendering straight into `.content`, got 358px) and the repeated `max-width` never bound, because
`.content`'s is the smaller value at every breakpoint. Removed 2026-09-04. If a wrapper needs
vertical rhythm, set `padding-block` and nothing else.

## 3. The auto-fit + minmax pattern

The one responsive technique this codebase uses for "how many columns fit," established while
fixing Glossary's term-row layout and reused for every wide-screen fix since (StatsMode,
BelajarTab, SayaTab). No media query — column count is container-driven:

```css
.container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(MIN, MAX));
  column-gap: var(--space-16);
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

**`width` prop** (`'default' | 'reading'`, `AppShell.jsx`): the other half of the width story
alongside `--max-w` itself. `'reading'` caps the content column at `--reading-max-w` (620px)
regardless of how wide `--max-w` has grown at the current breakpoint; `'default'` doesn't cap it at
all. Every individual mode defaults to `'reading'` (`App.jsx`, `MODE_META[mode]?.width ?? 'reading'`)
— a small, explicit allowlist of modes with genuinely wide content (grids, side-by-side comparisons)
opts back out to `'default'`. The three top-level tabs didn't have an equivalent default at all until
2026-08-31 — `AppShell` fell through to its own `'default'` for all three, which happened to be
correct for Dashboard and SayaTab (both genuinely reflow into multi-column layouts at the 1040px
breakpoint — confirmed live, not assumed: SayaTab's achievement grid goes to 8 columns, Dashboard
splits into its documented 2-column layout) but left BelajarTab's single flowing column of
section-header-plus-one-featured-card stretching to the full 1180px content column with a growing
dead gap beside each card. Fixed in `App.jsx` by giving the tab-level shell the same policy
individual modes already use: `width={tab === 'belajar' ? 'reading' : 'default'}`. If a future tab or
mode is added, ask the same question this fix answers — does this screen's content actually reflow
to use extra width, or is it a single column that would just stretch? — rather than assuming either
default is automatically right.

## 5. Line length — why the reading column is 620px and stays there

Measured live, not assumed: characters-per-line across the reading-width screens comes out at
**47–57 on a 390px phone and 69–82 on a 1440px desktop**. The typographic comfort band is roughly
45–85, so the 620px column is already at the top of it on desktop. This is the answer to the
obvious-looking finding that 18 of 24 screens use only 46% of a 1440px viewport: widening them
would push past 82 CPL and make them _harder_ to read, not easier. The dead space beside a reading
column is the column working correctly.

Screens that genuinely reflow — grids, side-by-side comparisons, the dashboard — opt out via
`width='default'` (§4). That is the lever for using desktop width, not the reading column's cap.

Vertical space is the different question, and there the finding was real: see §6.

## 6. Filling the height the shell already reserves

`.content` is as tall as the viewport — it's a stretched flex item of `.contentCol`, which sits in
a `min-height: 100dvh` shell. A screen rendered inside it is a plain block, though, so it can only
be as tall as its content, and everything short of a full screen packs against the top. Measured on
FlashcardMode, the app's primary screen: **284px of empty space under the last control at 390×844,
334px at 1440×900** — which also puts the primary controls a thumb-stretch away from the bottom of
the phone.

In mode chrome `.content` is a flex column (`AppShell.module.css`), and a screen opts into the
leftover height with `flex: 1 0 auto`. `1 0 auto`, never `flex: 1`: grow into free space, but never
shrink below the content's own height on a short screen. FlashcardMode is the one screen using it
so far — `.fcWrapper` grows, and inside it `.scene` grows too and centres the card, so the slack
becomes equal air above and below the card instead of a gap under the last button (284px → 40px on
mobile, 334px → 40px on desktop, with no new scrolling at 390×640).

Modes that don't opt in are unaffected: they keep `flex: 0 1 auto` and their auto height. Setup
screens (QuizMode, Kuis Produksi and friends) still leave 250–330px under their "Mulai" button —
whether the CTA should be bottom-anchored on those is a design call, not a bug, and is tracked in
`UI_UX_PLAN.md` §12 rather than fixed here.

## 7. Expanding beyond phone-first

This app was built mobile-first and stayed that way through most of its history — every width
decision above originates from "how does this look on a phone" and widens outward from there. The
project's own direction is now explicitly broader: supporting tablet and desktop well, not just
not-broken. The breakpoint system, `--max-w`, the `width` prop, and the auto-fit/minmax pattern in
§3 already give any screen the tools to do this without inventing something new — what's still real
work, screen by screen, is checking whether a given screen's content actually *uses* the width it's
handed (reflows, adds columns, increases density) or just *stretches* into it (single column, same
shape, more dead space). The Belajar fix directly above is the concrete example of the second case
found and fixed; auditing the rest of the mode registry the same way (live, at real viewport widths,
not from source alone — several of this session's real findings did not show up from reading CSS)
is the natural next slice of this work, not a one-time pass.
