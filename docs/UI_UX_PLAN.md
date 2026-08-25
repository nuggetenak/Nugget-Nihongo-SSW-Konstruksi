# UI/UX Plan — SSW Konstruksi

> **Execution status as of 2026-08-20 (same day as drafting): 19 of 38 actionable items shipped.**
> Batches 0–2 (all P0 mechanical + accessibility items) and Batch 6 (P1 layout: 11, 12, 13) are
> done, verified, committed, and pushed to `feat/ui-overhaul`. Done items are marked `☑` below and
> retain their full write-up — nothing was deleted — since the write-up is now the record of what
> shipped and why, not just a proposal. The three 🔶 judgment calls (9, 10, 37) are untouched,
> waiting on an owner decision. Batches 7–8 (20 items) are unstarted. See each commit on
> `feat/ui-overhaul` for the exact diff and verification output per item; see `HANDOFF.md` for the
> running summary.

Drafted 2026-08-20 on `feat/ui-overhaul` across two drafting passes. Every claim was checked against
the code, the build output, or a throwaway reproduction, not taken from documentation.

This is a work queue for a later execution session, probably a different model with no memory of
this one. It is written for that reader: file paths are absolute from the repo root, findings
carry the evidence that produced them, and every item states what "done" looks like so completion
is checkable rather than judged.

**42 items in four priority bands**, plus four in §7 that are listed for visibility only. Items
1–29 came from the first pass, 30–42 from a second exhaustive audit on the same day. The second
pass went looking specifically for defects that are invisible to the existing safety net — things
that pass `npm test`, `npm run lint`, and `npm run build` and still ship broken. It found several
(undefined CSS variables that silently void a declaration, a key handler that eats its own search
box, an entire settings screen unreachable by keyboard), which is worth knowing when weighing how
much to trust a green pipeline on UI work here.

Where the audit checked a suspicion and found **no** problem, the item says so explicitly. Those
notes are load-bearing: they exist so a later session doesn't "fix" something that is already
correct. `toLocaleDateString('sv')` in `src/utils/date.js` is the clearest example — it looks like
a locale bug and is not one.

---

## 0. How to use this document

1. Read `docs/AGENT_WORKFLOW.md` first — this doc is task content, not process, and does not
   repeat branch/commit/verification discipline.
2. Work **top-down within a priority band.** Items are ordered inside each band so that earlier
   ones remove obstacles for later ones. Across bands, P0 before P1 before P2 before P3.
3. **Re-verify before fixing.** Every finding here has a file and a reason. Check it still holds
   before acting — this doc ages the same way every other doc in this repo has.
4. **Items marked 🔶 JUDGMENT CALL need owner sign-off before execution**, per
   `docs/AGENT_WORKFLOW.md` §2. They change architecture, touch the locked palette, or could
   reasonably be decided the other way. Don't execute them silently as part of a batch.
5. Each item is sized `S` (under an hour), `M` (a focused sitting), `L` (its own branch and
   probably its own session).
6. When an item ships, mark it done **here**, and record the outcome in `HANDOFF.md`'s CURRENT
   STATE per the close-out steps. Don't let this file drift into a record of things already done —
   retire completed sections to `docs/archive/` once a band is fully closed.

### Status legend

`☐` not started `◐` in progress `☑` done `🔶` needs owner decision first

---

## 1. Ground rules

These are constraints, not suggestions. Violating one produces work that a later session has to
undo — which has already happened on this repo more than once.

**Reuse, don't parallel-invent.** `docs/AGENT_WORKFLOW.md` §2: one source of truth per concept. In
practice, for UI work:

| Need | Use | Don't |
| --- | --- | --- |
| Content width | `var(--max-w)` via `S.page` | A new `max-width` in a component module |
| Dialog/toast/popup width | `var(--overlay-max-w)` | Letting it inherit `--max-w` and go 1180px |
| Column count | `auto-fit` + `minmax()` (§3 below) | A media query counting columns by hand |
| Spacing / radius / shadow / timing | `--sp-*`, `--r-*`, `--shadow-*`, `--t-*`, `--ease-*` | A new one-off px value |
| Colour | `var(--ssw-*)` | Raw hex — it breaks the dark-mode toggle |
| Stacking | `--z-base/sticky/nav/overlay/toast` | A raw number (see item 4) |
| A mode's icon | `MODE_META[key].ui` through `<Icon>` | A hardcoded icon name or an `<img>` |
| Card / row / button / title | The primitives in `src/modes/modes.module.css` (imported as `S`) | A local `.card`-shaped class |

**The two grid variants.** `docs/LAYOUT_SPEC.md` §3 is the whole responsive story, and picking the
wrong variant recreates the exact bug the pattern exists to fix:

- **Variant A — `minmax(MIN, 1fr)`** for rows shaped like `space-between` (label ↔ value). Extra
  width usefully pushes the two apart.
- **Variant B — `minmax(MIN, <finite cap>)`** for fixed-size centered content (a ring, a stat, a
  badge, a tile). A track's `max` is a hard ceiling regardless of leftover space, so surplus stays
  as page whitespace instead of inflating one item's box. That is the fix, not a side effect.

If a rule's correctness depends on knowing the column count (`nth-child(odd)` meaning "alone in
its row"), gate it to the one breakpoint where the count is fixed, or drop it. See LAYOUT_SPEC §3's
closing note.

**Four production dependencies, hard ceiling.** `react`, `react-dom`, `ts-fsrs`, `lz-string`.
Everything proposed here is implementable with what's already installed plus platform APIs. A
fifth dependency is an owner conversation, not an implementation detail.

**The audience is the spec.** Indonesian construction workers, N5–N4 Japanese, studying on phones,
often outdoors, often on bad connections, often one-handed and tired after a shift. When two
options are otherwise equal, pick the one that survives a cracked screen in direct sunlight on 3G.
"Now aiming to expand to all kinds of user devices" widens the target; it does not demote the
phone.

**Hazard rail stays scarce.** `--hazard` marks time-sensitive or active state only — exam
countdown, daily mission, active nav item. It works because nothing else uses it. Do not decorate
with it. (`docs/DESIGN_SPEC.md` §1.)

---

## 2. Priority summary

Ordered by band, then by item number — the same order as the body sections, so the two can't drift
apart. **Item numbers are stable IDs in discovery order, not execution order.** They are referenced
from `HANDOFF.md` and from each other, so don't renumber them; if an item is dropped, strike it and
leave the number retired. For dependency-aware ordering, see §8.

Pass column: `1` = first drafting pass, `2` = second audit pass (2026-08-20).

| # | Item | Band | Size | Pass | Note |
| --- | --- | --- | --- | --- | --- |
| 1 | Toast stack is mispositioned at most breakpoints | P0 | S | 1 | ☑ shipped; Blocks 16  |
| 2 | Safe-area insets missing under `viewport-fit=cover` | P0 | S | 1 | ☑ shipped; iOS home indicator  |
| 3 | `100vh` in AppShell on a mobile-first app | P0 | S | 1 | ☑ shipped  |
| 4 | Z-index scale exists but is bypassed everywhere | P0 | S | 1 | ☑ shipped; Blocks 7, 11, 15  |
| 5 | Dead reduced-motion block + duplicate focus ring | P0 | S | 1 | ☑ shipped; Verified dead code  |
| 6 | Two competing "update available" prompts | P0 | S | 1 | ☑ shipped; See also 37  |
| 7 | Offline banner never renders inside a mode | P0 | S | 1 | ☑ shipped; Needs 4  |
| 8 | `role="application"` on `#root` | P0 | S | 1 | ☑ shipped; Disables SR browse mode  |
| 9 | Low-contrast text tokens | P0 | M | 1 | 🔶 Measured; touches token table |
| 30 | Eleven CSS custom properties referenced but never defined | P0 | S | 2 | ☑ shipped; Silent; breaks score colours  |
| 31 | FlashcardMode's key handler hijacks its own search box | P0 | S | 2 | ☑ shipped; Verified empirically; blocks 20  |
| 32 | Not one input in the app has an accessible name | P0 | M | 2 | ☑ shipped; Zero `<label>` app-wide  |
| 33 | Core interactions are on `<div>`s keyboards can't reach | P0 | M | 2 | ☑ shipped; Incl. the `Row` primitive  |
| 34 | Japanese content is not marked as Japanese | P0 | S | 2 | ☑ shipped; Compounds with 39  |
| 35 | No `<h1>` on any mode screen, or on Belajar/Saya | P0 | S | 2 | ☑ shipped; Mostly solved by 11  |
| 36 | Button primitives below the app's own touch minimum | P0 | M | 2 | ☑ shipped; `.btnBack`, `.btnIcon`  |
| 10 | Browser history / hardware back button | P1 | L | 1 | 🔶 Architecture change |
| 11 | Mode header: promote the breadcrumb to a real component | P1 | M | 1 | ☑ shipped; Needs 4; also fixes most of 35  |
| 12 | Dashboard vertical dead space | P1 | M | 1 | ☑ shipped; From HANDOFF NOT-done  |
| 13 | Side nav is three items in a full-height column | P1 | M | 1 | ☑ shipped; Desktop density  |
| 37 | SW replaces itself mid-session against lazy chunks | P1 | M | 2 | 🔶 Behaviour change; see 6, 38 |
| 38 | Error states: untokenized, and a retry that can't work | P1 | M | 2 | Concrete half of 19 |
| 14 | Adopt `EmptyState` — it has zero consumers | P2 | M | 1 | Also serves 12 |
| 15 | Adopt `ConfirmDialog` + `useFocusTrap` | P2 | M | 1 | Needs 4; serves 10, 33 |
| 16 | Define toast semantics and stop losing messages | P2 | M | 1 | Needs 1 |
| 17 | Loading and skeleton consistency | P2 | M | 1 | Pairs with 41 |
| 18 | Decide `FilterPopup`'s fate | P2 | S | 1 | Verified dead component |
| 19 | Error and recovery states | P2 | M | 1 | Needs 16's conventions |
| 39 | Japanese text falls back to a font never loaded | P2 | S | 2 | Pairs with 34 |
| 40 | Correct/wrong colours bypass the semantic tokens | P2 | S | 2 | |
| 41 | The mode loader is a different width than its mode | P2 | S | 2 | ☑ shipped; Pairs with 17  |
| 42 | Number formatting is inconsistent | P2 | S | 2 | |
| 20 | Global keyboard layer + discoverable shortcuts | P3 | M | 1 | Needs 31 first |
| 21 | Motion and haptics consistency pass | P3 | M | 1 | |
| 22 | Wide-breakpoint density and typography | P3 | M | 1 | |
| 23 | Landscape and one-handed reach | P3 | M | 1 | Needs 2 |
| 24 | Onboarding and first-run continuity | P3 | M | 1 | Feeds 12 |
| 25 | Offline legibility — say what works without a connection | P3 | S | 1 | Needs 7 |

Items 26–29 are **listed for visibility only** in §7 — do not draft or execute solutions for them
from this document.

---

## 3. P0 — Correctness

Shipped UI that is measurably wrong. These are small, mostly isolated, and several sit underneath
later items — fixing them first avoids building on a crooked foundation. A P1 item that depends on
a P0 item says so.

### ☑ 1. Toast stack is mispositioned at most breakpoints — `S`

**What.** `src/components/Toast.jsx` positions the toast stack with an inline
`style={{ bottom: T.navH + 12 }}` — a constant 76px, applied unconditionally. Move that offset
into `Toast.module.css` and make it conditional on whether a bottom nav is actually present.

**Why.** The bottom nav is not always there. `AppShell` renders it only when `chrome === 'tabs'`,
and `AppShell.module.css` hides it entirely at `≥1040px` in favour of the side nav. So the 76px
offset is correct in exactly one case — the three top-level tabs on a screen under 1040px — and
wrong in the other two:

- **Desktop (≥1040px):** no bottom nav exists. Toasts float 76px above the bottom edge with
  nothing beneath them.
- **Any mode screen on a phone:** `chrome='mode'` suppresses the bottom pill (`App.jsx` passes it;
  `AppShell.jsx` gates on `showBottomNav`). Same dangling gap — and mode screens are where most
  toasts actually fire, since that's where answering, rating, and starring happen.

**How it fits.** `AppShell` is already the single owner of nav placement and already reserves the
nav's footprint via `--nav-safe` on `.content[data-nav-safe]`. Extend that ownership rather than
teaching Toast about breakpoints:

- Have `AppShell` set a CSS custom property on the shell element — e.g. `--toast-offset`, resolving
  to `calc(var(--nav-h) + var(--sp-3))` when the bottom nav is mounted and `var(--sp-4)` when it
  isn't — using the same `data-chrome` / `data-nav-safe` attribute hooks already in
  `AppShell.module.css`, plus the existing `@media (min-width: 1040px)` block there.
- `.stack` in `Toast.module.css` reads `bottom: var(--toast-offset, var(--sp-4))`. The fallback
  matters: `ToastProvider` is mounted above `AppProvider` in `src/main.jsx`, so it renders outside
  the shell and must degrade sanely if the property is absent.
- Drop the `T` import from `Toast.jsx` if nothing else needs it.

Once item 2 lands, that offset should also add `env(safe-area-inset-bottom)`.

**Done when.** A toast fired from a mode screen on a phone sits just above the content edge, not
76px up; a toast on desktop sits at the bottom gutter; a toast on a tab screen under 1040px is
unchanged from today. No inline positioning left in `Toast.jsx`. `src/tests/Toast.test.jsx` and
`src/tests/milestone.toast.test.jsx` still pass.

---

### ☑ 2. Safe-area insets missing under `viewport-fit=cover` — `S`

**What.** `index.html` sets `viewport-fit=cover` on the viewport meta. Nothing in `src/` uses
`env(safe-area-inset-*)` — zero occurrences across the whole tree. Add insets to the fixed-position
chrome.

**Why.** `viewport-fit=cover` deliberately extends the layout past the safe area into the display
cutout and home-indicator zones. That is only correct when something then compensates. Nothing
does. `BottomNav.module.css` pins the floating pill at `bottom: 14px`, which on any iPhone with a
home indicator places the primary navigation directly under the system gesture area — taps get
intercepted, and the pill reads as sitting on top of the indicator. Android gesture-nav devices
have the same problem in a milder form. This hits the primary audience on the primary device class.

**How it fits.** Additive, in the components that already own fixed positioning — no new pattern:

- `BottomNav.module.css` `.nav`: `bottom: calc(14px + env(safe-area-inset-bottom, 0px))`.
- `--nav-safe` in `src/styles/global.css` (currently `calc(var(--nav-h) + 36px)`): add the same
  inset so reserved content space grows with it. This is the token `AppShell` already consumes, so
  every screen picks the change up for free.
- The toast offset from item 1.
- Left/right insets on the shell gutters for landscape on notched devices — pairs with item 23.

Use the two-argument form `env(..., 0px)` throughout so non-notched devices and the test
environment resolve to today's values exactly.

**Done when.** On a notched-device viewport, the bottom nav clears the home indicator and no
content sits under it; on a non-notched viewport, rendering is byte-identical to today.

---

### ☑ 3. `100vh` in AppShell on a mobile-first app — `S`

**What.** `src/components/AppShell.module.css` `.shell` sets `min-height: 100vh`. Change to
`100dvh`.

**Why.** The repo has already decided this — `index.html`'s inline critical CSS uses `100dvh` for
both `body` and `#root`, and `src/components/Onboarding.module.css` uses `100dvh`. `AppShell` is
the one place still on `100vh`, and it's the one that wraps every screen at every breakpoint. On
mobile browsers with retracting toolbars, `100vh` resolves to the *largest* possible viewport, so
the shell is taller than the visible area and the page gains phantom scroll.

`src/components/SideNav.module.css` also uses `height: 100vh`, but SideNav only renders at
≥1040px where the dynamic-toolbar problem doesn't arise. Change it for consistency, not urgency.

**How it fits.** One-line change, matching the convention already established in two other files.

**Done when.** No `100vh` remains in `src/`; scroll height on a phone viewport equals content
height with no dead scroll at the bottom.

---

### ☑ 4. Z-index scale exists but is bypassed everywhere — `S`

**What.** `src/styles/global.css` defines a five-step scale — `--z-base: 1`, `--z-sticky: 10`,
`--z-nav: 100`, `--z-overlay: 200`, `--z-toast: 300`. Almost nothing uses it. Route every
deliberate stacking decision through the tokens and add the one that's missing.

**Why.** Verified current state:

| Location | Value | Problem |
| --- | --- | --- |
| `src/router/ModeRouter.jsx:313` | `var(--z-banner, 30)` | **`--z-banner` does not exist.** Silently falls back to an off-scale 30. |
| `src/components/MissionCompleteOverlay.jsx:34` | `9999` inline | Far off-scale |
| `src/components/ConfirmDialog.module.css:7,18` | `400` / `401` | Above `--z-toast`, so a confirm dialog covers toasts |
| `src/components/FilterPopup.module.css:7,18` | `200` / `201` | Matches `--z-overlay` by coincidence, not by reference |
| `src/components/Toast.module.css:9` | `300` | Matches `--z-toast` by coincidence |
| `src/modes/GlossaryMode.jsx:421` | `40` inline | Off-scale |
| `src/modes/SimulasiMode.jsx:548` | `50` inline | Off-scale |

A scale nobody references isn't a scale. Right now the only way to know what covers what is to grep
seven files and compare integers — which is exactly the situation the tokens were added to end.
`BottomNav.module.css` already does this correctly (`z-index: var(--z-nav)`); it's the model.

**How it fits.** Don't invent a new scale — the existing one is fine and the ordering it implies is
already what the app wants. Two mechanical steps:

- Add `--z-banner: 30` to the scale in `global.css`, between `--z-sticky` and `--z-nav`. The
  fallback value is already load-bearing in `ModeRouter`, so adopting 30 changes no rendering. (It
  is also the right slot for the mode header in item 11.)
- Replace every raw value above with the nearest token. `+1` companions (`401`, `201`) become
  `calc(var(--z-overlay) + 1)` so the pairing stays legible.
- **Decide deliberately whether a confirm dialog should cover a toast.** Today it does, at 400 vs
  300. A modal asking "erase all progress?" arguably *should* sit above an incidental toast — if
  so, keep the ordering and express it as a token (`--z-modal: 400`) rather than as a bare number
  that reads like an accident. If not, drop it below `--z-toast`. Either is defensible; the current
  state is that nobody chose.
- Local stacking contexts (`z-index: 1` inside a card, `z-index: 2` on a flip face) are **not** in
  scope. Those are relative to a parent, not to app chrome, and tokenizing them would be noise.

**Done when.** No raw z-index above ~10 remains outside a local stacking context; `--z-banner`
exists; the dialog-vs-toast ordering is a recorded decision, not a leftover.

---

### ☑ 5. Dead reduced-motion block + duplicate focus ring — `S`

**What.** Two independent pieces of dead or conflicting CSS in `src/styles/global.css`.

**Why — the reduced-motion block is dead code.** The block around line 338 targets
`.hero[data-path='celebrate']`, `.streakEmoji`, `.cta::after`, `.heroEmoji`, `.heroPct`,
`.stars::before`, `.container`, `.streakHero`, `.countdownCard`, `.btnNext`, `.badge`. Every one of
those is a **CSS Modules class**, which the build hashes. Verified in the build output:
`dist/assets/index-*.css` contains the raw selector `.hero`, while the DOM actually carries
`._heroEmoji_i1zqy_73`. They cannot match. The rules have never done anything.

Reduced motion is genuinely handled, twice over, so nothing is lost by deleting the block:
- The `*, *::before, *::after` catch-all at the end of `global.css` (the safety net added during
  this overhaul), and
- Per-module blocks with correctly-hashed selectors — verified present in
  `dist/assets/QuizShell-*.css` and `dist/assets/FlashcardMode-*.css`.

**Why — the focus ring is declared twice, differently.** Line ~236: `:focus-visible { outline: 2px
solid var(--ssw-amber); }`. Line ~388: `:where(button, a, input, select, textarea,
[tabindex]):focus-visible { outline: 3px solid var(--ssw-amber); }`. `:where()` contributes zero
specificity, so both rules compute to the same specificity and source order decides — the 3px rule
wins for those six selectors, the 2px rule applies to anything else focusable. `docs/DESIGN_SPEC.md`
§2 documents only the 3px ring, and `HANDOFF.md` describes the overhaul as having added "one global
`:focus-visible` ring." There are two.

**How it fits.** Deletion and consolidation. Keep the `:where(...)` 3px rule — it is the documented
one and the more deliberate one. Removing the narrower earlier rule slightly *widens* focus
coverage, since the surviving rule's selector list is broad and `:where()` keeps it easy to
override locally.

**Done when.** One `:focus-visible` rule in `global.css`; the dead reduced-motion block gone; a
manual pass with `prefers-reduced-motion: reduce` still shows animation suppressed everywhere
(proving the catch-all was doing the work all along). `docs/DESIGN_SPEC.md` §2 needs no edit — it
already describes the surviving rule.

---

### ☑ 6. Two competing "update available" prompts — `S`

**What.** The app has two independent new-version notifications. Keep one.

**Why.** `index.html`'s inline service-worker registration script builds a raw DOM banner
(`#sw-update-banner`) on `updatefound`, and separately `src/App.jsx` shows a toast on the
`SW_UPDATED` message. Depending on timing a user can see both, or see the raw banner where the
design system would have shown a toast.

The inline banner bypasses the design system completely: hardcoded `#1c1917` / `#f59e0b` (so it
does not adapt to dark mode), `z-index: 9999`, `bottom: 80px` duplicating the nav-height assumption
from item 1, and `white-space: nowrap` on a string that will overflow a 320px phone. It also can't
be dismissed except by acting on it.

**How it fits.** Keep the toast — it's themed, positioned by the system, dismissible, already has
an "undo"-slot pattern that suits a "Perbarui" action, and `App.jsx` already wires it with a
10-second duration. Reduce the inline script to registration plus `reg.update()` only, and let the
existing `SW_UPDATED` path own the UI.

Confirm before cutting that `SW_UPDATED` actually fires in the current `public/sw.js` — the
`App.jsx` listener and the inline `updatefound` handler are two different mechanisms, and only the
inline one is provably reachable today. If the message isn't posted, wire it in `sw.js` as part of
this item. **Bump `CACHE_VERSION` when touching `sw.js`** (`docs/PWA_RELEASE_SPEC.md` §2).

**Done when.** One notification path; it themes correctly in dark mode; the text wraps rather than
overflowing at 320px; `src/tests/offline.sw.test.js` still passes.

---

### ☑ 7. Offline banner never renders inside a mode — `S`

**What.** `src/App.jsx` renders `<OfflineBanner />` only in the tabs branch. The mode branch
returns early, before it.

**Why.** Losing connectivity mid-session is the normal case for this audience, and a study mode is
where they'll be when it happens. The banner exists precisely to reassure that nothing is lost
("semua data tersimpan lokal") — and it is absent from the 21 screens where that reassurance is
worth most.

**How it fits.** Same fix shape as the bug HANDOFF already records for nav-safe padding: something
every screen needs was applied per-screen and one branch forgot. Move `<OfflineBanner />` into
`AppShell` so both branches inherit it, consistent with AppShell being the single owner of chrome.
Check the stacking against `--z-nav` and `--z-banner` once item 4 lands.

**Done when.** Going offline inside any mode shows the banner; it doesn't overlap the mode header
(item 11) or the bottom nav.

---

### ☑ 8. `role="application"` on `#root` — `S`

**What.** `index.html` has `<div id="root" role="application" aria-label="SSW Konstruksi">`. Remove
the role, keep the label or move it to the `<main>`.

**Why.** `role="application"` tells a screen reader to leave browse mode and forward nearly all
keystrokes to the page. It is meant for genuine app-like widgets — a canvas editor, a spreadsheet
grid — where the author has implemented complete keyboard handling for every control. This app is
mostly headings, buttons, lists, and text: exactly the content browse mode exists to navigate. With
the role set, the standard reading and navigation shortcuts stop working across the entire app.

This directly undercuts the a11y sweep already done on this branch (an `h1` was added, a global
focus ring, `--tap-min`) — those improvements are reached through the very navigation this role
disables.

**How it fits.** One attribute deleted. `src/App.jsx` already renders `<main id="main-content">`,
and `index.html`'s skip link already targets it, so the landmark structure is in place.

While here, add `tabindex="-1"` to that `<main>` so the skip link reliably moves focus (in several
browsers, jumping to a non-focusable element moves the scroll position but not focus, so the next
Tab resumes from the top of the page — which defeats the skip link).

**Done when.** No `role="application"` in the tree; skip link moves focus, verifiable by pressing
Tab immediately after activating it and landing inside the content.

---

### ☑ 9. Low-contrast text tokens — `M` — needs owner decision

**What.** `--ssw-textFaint` fails WCAG AA, and amber-on-light fails badly wherever it carries text
or meaning. Measured, not estimated:

| Token / pair | Light theme | Dark theme |
| --- | --- | --- |
| `--ssw-textMuted` | 6.84:1 ✅ | 9.26:1 ✅ |
| `--ssw-textDim` | 4.57:1 ✅ (barely) | 6.30:1 ✅ |
| `--ssw-textFaint` | **2.89:1 ❌** fails AA *and* AA-large | **3.74:1 ❌** AA-large only |
| `--ssw-amber` as text on `--ssw-bg` | **2.11:1 ❌** | 9.15:1 ✅ |

(Computed by compositing each token's alpha over the theme background and applying the WCAG
relative-luminance formula. Reproducible — the alphas are in `src/styles/theme.js`.)

**Why it matters here more than usual.** `--ssw-textFaint` appears 48 times across 24 files, and
one of them is `BottomNav.module.css`, where it colours the **inactive tab labels** — the app's
primary navigation, at 10px, at 2.89:1, in the light theme that is the default. The audience reads
this outdoors in daylight on phone screens that are often scratched. This is the one accessibility
finding in this document with a direct, everyday functional cost.

Amber-as-text at 2.11:1 affects 27 CSS rules plus the inline breadcrumb in `ModeRouter.jsx:329`.
The same 2.11:1 also applies to the **focus ring**, which WCAG 1.4.11 expects to reach 3:1 as a
non-text indicator — so keyboard focus is hard to see in light theme, right after item 8 restored
keyboard navigation.

**Why this is a judgment call.** `docs/DESIGN_SPEC.md` §1 states the palette is the one locked
constraint. Changing a token's alpha is arguably not a palette change — the amber/gold identity is
untouched — but it does edit the table in `theme.js` that DESIGN_SPEC mirrors, and it will shift
the look of 24 files. That's the owner's call, not an executing session's. Three options, roughly
in order of how much they disturb the design:

1. **Raise the alphas.** `--ssw-textFaint` needs roughly `.62` in light and `.55` in dark to clear
   4.5:1. Smallest diff, but it compresses the gap between `textDim` and `textFaint` to almost
   nothing — at which point the honest move is to collapse the two tokens into one and cut a rung
   from the scale.
2. **Keep the value, restrict the usage.** Declare `--ssw-textFaint` legitimate only for
   genuinely decorative or disabled text, and migrate everything load-bearing — nav labels first —
   up to `--ssw-textDim`. No palette edit at all. More files touched, identity fully preserved.
3. **Fix the worst offenders only.** Bottom-nav inactive labels and the focus ring, leave the rest.
   Cheapest; leaves a token in the system that's known to fail.

For the focus ring specifically, option 3 has a clean answer regardless of which route is chosen
for text: keep the amber ring but pair it with a contrasting outer edge — e.g. a `box-shadow` ring
in `--ssw-textBright` just outside the amber outline — so it reads against both themes without
introducing a new accent colour. That's the standard two-tone focus indicator technique and needs
no palette change.

**Done when.** The owner has picked a route; no interactive text sits below 4.5:1 in either theme;
the focus indicator reaches 3:1 against adjacent colours; `docs/DESIGN_SPEC.md` §2's table matches
whatever `theme.js` ends up saying.

---

---

_Items 30–36 below were added by the second audit pass (2026-08-20). They are P0 for the same
reason as items 1–8: shipped behaviour that is measurably wrong. Several are accessibility defects
that also break ordinary mouse-and-touch use, so they are not "a11y polish" — they are bugs._

### ☑ 30. Eleven CSS custom properties are referenced but never defined — `S`

**What.** Fourteen `var(--…)` names are used in `src/` and defined nowhere. Eleven of those uses
have **no fallback**, so the whole declaration is invalid at computed-value time and the property
silently unsets. Define them, or repoint them at the tokens that already exist.

**Why.** Verified by diffing every `var()` reference in `src/` against the 92 tokens actually
defined in `global.css` plus `theme.js`. Two abandoned naming schemes and two typos:

| Undefined token | Sites | Effect |
| --- | --- | --- |
| `--c-correct` / `--c-amber` / `--c-wrong` | `WaygroundMode.jsx:263,265,266` | **The overall-score percentage loses its colour coding entirely.** It is meant to read green ≥70%, amber ≥50%, red below. `color` is inherited, so all three branches render identically. |
| `--c-text-dim` | `WaygroundMode.jsx:249,309,321`, `ReviewMode.jsx:257` | Labels inherit instead of dimming — visual hierarchy collapses |
| `--c-text-muted` | `WaygroundMode.jsx:252` | Same |
| `--c-surface` / `--c-border` | `WaygroundMode.jsx:322,323` | `background` transparent; `border` shorthand invalid, so **no border renders at all** |
| `--color-surface` / `--color-border` / `--color-text` | `AngkaMode.jsx:642,643,644` | Same shape — the unanswered-state option box loses fill and border |
| `--fw-semibold` | `JpDisplay.module.css:75` | Typo — the real token is `--fw-semi`. Font weight inherits. |

The remaining three (`--font-jp`, `--ssw-accentSoft`, `--z-banner`) do have fallbacks and are
less severe; `--z-banner` is item 4 and `--font-jp` is item 39.

`--c-*` and `--color-*` are two dead naming schemes from before the `--ssw-*` convention settled.
Nothing defines them and nothing ever will — every one has an exact live equivalent
(`--ssw-correct`, `--ssw-amber`, `--ssw-wrong`, `--ssw-textDim`, `--ssw-textMuted`,
`--ssw-surface`, `--ssw-border`, `--ssw-text`).

**How it fits.** Pure repointing — no new tokens, no design decisions. `docs/DESIGN_SPEC.md` §2
already names the correct token for every case. Do **not** define `--c-*`/`--color-*` aliases; that
would make two parallel naming schemes permanent, which is the opposite of one-source-of-truth.

**Worth adding as a guard:** this class of bug is invisible in review, in tests, and in the build —
CSS with an undefined `var()` is valid CSS. A tiny script comparing `var()` references against
defined tokens would catch the next one, and could run alongside the existing
`scripts/validate-data.mjs` in `prebuild`. That's the only reason this keeps happening.

**Done when.** Every `var()` reference in `src/` resolves to a defined token; WaygroundMode's score
is colour-coded again; a check exists so the next dead token is caught mechanically.

---

### ☑ 31. FlashcardMode's global key handler hijacks its own search box — `S`

**What.** `src/modes/FlashcardMode/index.jsx:173-197` registers a `window` keydown listener binding
Space, ArrowLeft, ArrowRight, and 1–4. `FilterBar` (`FilterBar.jsx:45`) renders a search input in
the same tree. The listener has no check for whether focus is in a field.

**Why.** Typing in the flashcard search box is broken in the flagship mode:

- **Space is swallowed.** The handler calls `e.preventDefault()`, so the character is never
  inserted — and the card flips instead. Multi-word searches are impossible.
- **Arrow keys navigate cards** instead of moving the text cursor, so the query can't be edited.
- **1/2/3/4 rate the card** when it's flipped, instead of typing digits.

Verified empirically, not just by reading: a scratch test reproducing the exact pattern confirmed
`fireEvent.keyDown` returns `false` (preventDefault fired) while the flip counter incremented. The
scratch file was deleted after; no test was added, since this is a drafting document and the fix
should land with its own regression test.

**Scope — checked, and narrower than it first looked.** `ProductionMode` and `QuizProduksiMode`
bind only Enter/Escape while their input is active, which is intended. `AngkaMode` has two separate
components in one file with separate `phase` state; the digit-mapping handler and the typing input
never render together. **FlashcardMode is the only mode actually affected.**

**How it fits.** One guard at the top of the handler — bail when the event target is an input,
textarea, or contenteditable. No global keydown handler anywhere in `src/` does this today
(verified: zero references to `tagName`, `activeElement`, or `isContentEditable` outside
`useFocusTrap`), so the guard belongs in a small shared helper rather than pasted per-mode —
especially since **item 20 proposes adding an app-level keyboard layer**, which would multiply this
bug across every screen if the pattern isn't fixed first.

**Sequencing.** Do this before item 20, not after.

**Done when.** Every word of a multi-word query can be typed into the flashcard search box; arrows
move the caret while the field is focused; a regression test covers it.

---

### ☑ 32. Not one input in the app has an accessible name — `M`

**What.** Twelve `<input>`/`<textarea>` elements across nine files. **Zero `<label>` elements and
zero `htmlFor` attributes exist in the entire codebase.** Nine inputs rely on `placeholder` alone;
three have nothing at all.

**Why.** A `placeholder` is not an accessible name: screen readers announce it inconsistently, and
it disappears the moment the user types, so anyone who loses their place has no way to recover what
the field was for. For the three with nothing, assistive tech announces only "edit text."

The three with no name at all are worth noting because **the fix is free** — they already have
visible label text sitting right next to them, just not associated:

| Site | Visible text already present | Missing |
| --- | --- | --- |
| `SayaTab.jsx:393` | `<div class="inlineEditLabel">Target kartu per hari (1–200)</div>` | association |
| `SayaTab.jsx:446` | `<div class="inlineEditLabel">Tanggal ujian</div>` | association |
| `ExportMode.jsx:408` | hidden file input — see item 33 for the real problem there | — |

**How it fits.** No visual change anywhere. Two mechanical patterns:

- Where visible label text already exists (`SayaTab`'s inline edits), give it an `id` and add
  `aria-labelledby`, or convert the `div` to a `<label htmlFor>`. Prefer the real `<label>` — it
  also makes the label text click-to-focus, which is a genuine usability gain on a phone.
- Where the design is placeholder-only by intent (search boxes), add `aria-label` alongside; keep
  the placeholder as the visible hint.

`docs/COMPONENT_SPEC.md` §2 has no form primitive today. If item 14's `EmptyState` adoption shows
the value of shared primitives, a small `Field` wrapper (label + input + optional hint) is the
natural follow-on and would make this class of defect structurally impossible. Worth proposing, not
worth blocking this fix on.

**Done when.** Every input has an accessible name; the two SayaTab labels are real `<label>`
elements; no new visual difference.

---

### ☑ 33. Core interactions are on `<div>`s that keyboards can't reach — `M`

**What.** Ten non-interactive elements carry `onClick` with no `role` and no `tabIndex` (measured
with a JSX-aware scan, not a grep). Several are primary interactions.

**Why.** Ranked by what it costs the user:

| Site | What it is | Consequence |
| --- | --- | --- |
| `SayaTab.jsx:23` | **the `Row` primitive itself** | `docs/COMPONENT_SPEC.md` §5 documents `Row` as a reusable pattern. Every settings row — theme, daily goal, exam date, export, import — is keyboard-unreachable. That is the whole Saya screen. |
| `SayaTab.jsx:562` | the reset row | **Erasing all progress** is not keyboard-reachable — and see item 15, its confirmation is a bespoke timed tap |
| `ExportMode.jsx:387` | "📥 Impor dari File" trigger | A keyboard user **cannot restore a backup.** On an app with no backend and localStorage-only persistence, this is the recovery path |
| `GlossaryMode.jsx:310` | every term row | Glossary is unusable by keyboard |
| `SumberMode.jsx:124` | every source card | Same |
| `FlashcardMode/FlipCard.jsx:78,87` | the card face | Flip works via the window Space handler, but the card is never focusable, so nothing announces it as interactive |
| `SimulasiMode.jsx:543` | pause overlay | Can't be dismissed by keyboard |
| `ConfirmDialog.jsx:26`, `FilterPopup.jsx:83` | modal backdrops | Conventional; acceptable **once Escape works** — which is item 15 |

Note this is not only a screen-reader concern. `<div onClick>` gives no `:focus-visible` ring
(item 5's ring targets `button, a, input, select, textarea, [tabindex]`), no Enter/Space
activation, and no disabled semantics.

**How it fits.** Almost all of these should simply be `<button type="button">` with the existing
class. `Row` is the high-leverage one — fixing the primitive fixes every consumer at once, and
`docs/COMPONENT_SPEC.md` §5 already frames it as a shared pattern, so the spec needs a one-line
update rather than a rethink. Two cautions:

- A `<button>` inside a grid item inherits button defaults — reset `background`, `border`,
  `font`, and `text-align: left` so `Row`'s `space-between` layout is unchanged. This is Variant A
  content (`docs/LAYOUT_SPEC.md` §3), so the row must keep stretching.
- `Row` renders only when `onClick` is present in some call sites; keep the non-clickable variant a
  `div` rather than a disabled button, so static rows aren't announced as controls.

**Done when.** Every interaction reachable by mouse is reachable by keyboard; the focus ring shows
on all of them; `Row`'s visual output is unchanged.

---

### ☑ 34. Japanese content is not marked as Japanese — `S`

**What.** `index.html` sets `<html lang="id">`, correctly. **No element anywhere in `src/` sets
`lang`** — zero occurrences. Every Japanese term, reading, and example sentence is therefore
declared to be Indonesian.

**Why.** This is the content the entire app exists to teach.

- A screen reader reads 現場 with an Indonesian voice and Indonesian letter-to-sound rules. The
  output is not Japanese and not intelligible.
- Browsers use `lang` to pick CJK glyph variants. Several Han characters render differently in
  Japanese and Chinese typefaces, and the font stack falls back to generic `serif` in some places
  (item 39) — where it does, an unmarked page can select a non-Japanese glyph form for a character
  a learner is trying to memorise the shape of.

The app already knows the content is Japanese: `src/utils/speak.js:42` sets `utt.lang = 'ja-JP'`
for text-to-speech. Only the markup doesn't say so.

**How it fits.** `JpDisplay` is the single component that renders Japanese (`<ruby>`/`<rt>` at
`JpDisplay.jsx:154,189`), so `lang="ja"` on its root covers most of the app in one edit. Sweep the
remaining direct `{card.jp}` renders — `ErrorBoundary.jsx`'s `FlatCardFallback` is one — and
prefer routing them through `JpDisplay` where practical, which is the one-source-of-truth move
anyway.

Consider `<rp>` fallback parentheses around `<rt>` at the same time; cheap, and it degrades ruby
gracefully in any renderer without ruby support.

**Done when.** Japanese text carries `lang="ja"`; TTS and markup agree; no visual change.

---

### ☑ 35. No `<h1>` on any mode screen, or on Belajar or Saya — `S`

**What.** The app has exactly two `<h1>`s: `Dashboard.jsx:105` ("SSW Konstruksi") and
`Onboarding.jsx:38`. Everything else starts at `<h2>` (22 of them) or uses a `div`.

**Why.** `App.jsx` returns early for modes, so when a mode is open Dashboard isn't mounted and its
`h1` is gone with it — every one of the 21 mode screens is a page whose highest heading is `h2`,
with no `h1` above it. Heading navigation is one of the main ways screen-reader users move around,
and here it lands on a mid-level heading with no page title.

Two more gaps in the same family:

- `BelajarTab.jsx:102` and `SayaTab.jsx:195` render their titles as `<div className={s.pageTitle}>`
  — visually titles, semantically nothing. Two of the three top-level tabs have no heading at all.
- `Dashboard.jsx:111` marks the visible "Beranda" page title `aria-hidden="true"` while the `h1`
  it replaces on wide screens is hidden by CSS. So on desktop the text a sighted user sees is
  hidden from assistive tech, and the text assistive tech reads is invisible. Both are reasonable
  in isolation; together they're inverted.

Four modes have no heading whatsoever: `CatatanMode`, `DengarMode`, `SearchMode` (and
`FlashcardMode.jsx`, which is only a lazy-entry shim and correctly has none — its real screen is
`FlashcardMode/index.jsx`).

**How it fits.** **Item 11 fixes most of this for free.** A `ModeHeader` rendering the mode's label
from `MODE_META` as an `<h1>` gives all 21 mode screens a correct page title and a correct heading
root in one component, and the existing `h2`s below it become properly nested. That is a good
reason to sequence item 11 early. Remaining work here is then small: promote the two tab titles
from `div` to `h1`, and reconcile Dashboard's aria-hidden inversion.

**Done when.** Every screen has exactly one `h1` naming that screen; heading levels descend without
gaps; the visible title and the announced title are the same string.

---

### ☑ 36. Shared button primitives are below the app's own touch-target minimum — `M`

**What.** `global.css` defines `--tap-min: 44px` with a comment justifying it specifically for this
audience ("used one-handed on phones, often outdoors"). It is referenced in **two stylesheets** —
`Dashboard.module.css` and `flashcard.module.css`. The shared primitives in
`src/modes/modes.module.css` that `docs/COMPONENT_SPEC.md` §2 tells every screen to reuse don't
use it, and two fall short:

| Primitive | Actual | vs `--tap-min` |
| --- | --- | --- |
| `.btnIcon` | `width: 40px; height: 40px` | 40 < 44 |
| `.btnBack` | `font-size: var(--fs-caption)` (12px) + `padding: 7px 10px 7px 0` → ≈32px tall, and `padding-left: 0` so the hit area hugs the glyph | well under |
| `.btnPrimary` | `padding: 15px` + 13px text → ≈48px | fine |

`.btnBack` is the primary escape hatch on every mode screen, and it is the smallest target in the
set. On a phone, outdoors, one-handed, that is the wrong thing to make hard to hit.

**Two off-token values in `.btnPrimary` worth fixing in the same pass:** `color: #1a0a00` is a raw
hex (`docs/DESIGN_SPEC.md` §2: components reference `var(--ssw-*)`, never raw hex — this one won't
adapt if the amber ever changes), and its `box-shadow: 0 4px 20px rgba(245,158,11,0.3)` is a
near-duplicate of the existing `--shadow-amber` (`0 4px 20px rgba(245,158,11,0.28)`).

**How it fits.** Raise `.btnIcon` to `var(--tap-min)` and give `.btnBack` symmetric padding plus a
`min-height`. Keep the *visual* size where it is if the design calls for it — padding and a
transparent hit area do the job without making the glyph bigger, which is the standard way to hit
44px without redesigning. Then sweep the remaining stylesheets for interactive elements under 44px
rather than treating `--tap-min` as decorative.

**Done when.** No interactive element is smaller than `--tap-min` in either dimension; the token is
used where it applies; `.btnPrimary` carries no raw hex and no duplicated shadow.

## 4. P1 — Navigation and orientation

Where the user is, how they got there, how they leave. The breadcrumb work started on this branch
is real but partial; these items finish the thought.

### ☑ 10. Browser history / hardware back button — `L` — needs owner decision

**What.** Navigation is pure React state — `tab`, `mode`, `modeHistory` in
`src/contexts/AppContext.jsx`. There is no `history.pushState` or `popstate` handling anywhere in
`src/` (verified by grep). Integrate the existing navigation model with the browser history stack.

**Why.** On Android — the dominant platform for this audience — the hardware/gesture back button is
*the* way people go back. With no history entries, back doesn't return to the previous screen: it
exits the PWA. From the middle of a quiz. There is no in-app equivalent for that gesture and no
warning that it will happen.

Secondary consequences of the same gap: no deep-linking or shareable screen URLs; browser
back/forward inert on desktop; and `prefs.lastMode` restores the last mode on reload, so a refresh
drops the user into a study screen with a back stack that no longer exists.

**Why this is a judgment call.** It changes the navigation architecture. It is also the single
biggest mobile UX gap in the app, which is why it leads P1 despite being the largest item here. The
constraints make it more interesting than "add a router":

- **No new dependency.** React Router is out — see §1. This is `pushState` + a `popstate` listener
  inside `AppContext`, which is a genuinely modest amount of code given the navigation model is
  already centralised there and already tracks its own stack.
- **The app is served from a subpath** (`/Nugget-Nihongo-SSW-Konstruksi/`, see `index.html`), and
  the service worker's HTML-shell strategy is Network-First with cache fallback. Any URL scheme
  must resolve offline for a returning user. **Hash-based routing (`#/mode/kartu`) sidesteps both
  problems** and is likely the right call — no server rewrite rules, no SW routing changes, works
  offline unchanged. Path-based routing is prettier and probably not worth it here.
- **`modeHistory` already exists** and is capped at 3 (`AppContext.jsx`, `goMode`). Decide whether
  the browser stack becomes the source of truth and `modeHistory` is derived, or the two are kept
  in sync. One source of truth is the repo's stated preference; deriving is cleaner but touches
  `goBack` and item 11.
- **In-quiz back needs a guard.** Backing out mid-quiz should confirm before discarding a session —
  which is item 15's `ConfirmDialog`, so sequence this after it or accept a follow-up.

**Suggested scope split.** Land the back-button fix alone first (highest value, smallest surface):
push a history entry on `goMode`/`goTab`, pop on `popstate`, map to the existing `goBack`/`exitMode`.
Deep links and URL-shaped state can follow as a second pass if the owner wants them.

**Done when.** Back from a mode returns to the previous screen rather than exiting the app; back
from a top-level tab is the documented exit point; a mid-quiz back prompts before discarding;
reload behaviour is deliberate rather than incidental.

---

### ☑ 11. Mode header: promote the breadcrumb to a real component — `M`

**What.** `src/router/ModeRouter.jsx` lines 301–339 render a sticky back-link built entirely from
inline styles. Extract it into a proper `ModeHeader` component with its own CSS module, and widen
what it does.

**Why.** Five separate problems in one 30-line block:

1. **It usually isn't there.** It renders only when `modeHistory.length > 0` — i.e. only on
   mode→mode navigation. Entering a mode from the Belajar tab, the overwhelmingly common path,
   leaves `modeHistory` empty and shows nothing. So the app's positional indicator is absent in the
   ordinary case and present in the rare one.
2. **It's one level, not a trail.** `modeHistory` holds up to 3 and the code comment calls it a
   "breadcrumb stack," but only `[length - 1]` is ever read. It's a back link wearing a
   breadcrumb's name.
3. **It's inline-styled.** `docs/COMPONENT_SPEC.md` §6 puts sticky positioning, hover states, and
   anything responding to the responsive system in a module — this is all three. As inline styles
   it can't have `:hover`, can't respond to a breakpoint, and can't be themed beyond the vars it
   names.
4. **It uses the wrong icon field.** It renders `breadcrumbMeta.icon` (emoji) where
   `docs/COMPONENT_SPEC.md` §3 establishes `MODE_META[key].ui` through `<Icon>` as the unified
   system. It is the last emoji-vs-vector inconsistency in the navigation chrome.
5. **It references a token that doesn't exist** — `var(--z-banner, 30)`, see item 4.

**How it fits.** A new `src/components/ModeHeader.jsx` + `ModeHeader.module.css`, rendered by
`ModeRouter` for every mode, not conditionally:

- **Always shows the current mode's identity** — `<Icon name={MODE_META[mode].ui} />` plus
  `MODE_META[mode].label`. That alone fixes the "no header on the common path" problem and gives
  the 21 mode screens a consistent top edge they currently lack.
- **Shows the trail when there is one**, reading the full `modeHistory` rather than one entry:
  `Belajar › Kartu › Kuis`. Each ancestor is a button. On compact widths, collapse to the immediate
  parent only (`← Kartu`) — a three-level trail doesn't fit a 320px screen and this is the exact
  situation `--overlay-max-w` reasoning applies to: more width is not automatically an improvement.
- **Owns the back affordance.** Modes currently supply their own via `onExit` and `S.btnBack`.
  Consolidating is a real improvement but touches many files — it's reasonable to land the header
  first and migrate `btnBack` per-mode as a follow-up, as long as the two don't both render.
- **Sticky at `var(--z-banner)`**, once item 4 defines it. Coordinate with item 7 so the offline
  banner and the header stack rather than overlap.
- Width comes from the shell — the header sits inside `AppShell`'s content column and needs no
  `max-width` of its own.

**Depends on.** Item 4 (token). Coordinate with items 7 and 10.

**Done when.** Every mode screen has a consistent header; the trail reflects real history and
collapses on compact; no inline styles remain in `ModeRouter`'s render; icons come from
`MODE_META.ui`; no mode renders both a header back button and its own.

---

### ☑ 12. Dashboard vertical dead space — `M`

**What.** Carried forward from `HANDOFF.md`'s NOT-done list, where it reads: *"Desktop dashboard has
vertical dead space; needs more content, not a layout change."* That diagnosis holds — this item
proposes what the content should be.

**Why the space is empty is mostly conditional rendering.** Reading
`src/components/Dashboard.jsx`, the two columns hold eight blocks and five are conditional:

| Block | Column | Renders when |
| --- | --- | --- |
| Exam countdown | main | `examDate` set **and** ≤60 days out |
| Progress meter | main | always |
| Primary CTA | main | always |
| Streak | main | `streakData.days >= 2` |
| Daily mission | side | always (two states) |
| Quick grid | side | always |
| Starred quiz | side | `starred.size > 0` |
| Recent cards | side | `recentCards.length > 0` |

A new user — no exam date, no streak, nothing starred, nothing recent — sees four blocks on a
1180px column. The emptiest dashboard is the one shown to the person with the least reason to stay.
Note this is **not** desktop-only: the same conditionals leave a sparse phone screen, it's just less
visible when the column is 480px.

**How it fits.** Add content that already exists as data; don't restructure the grid. Candidates,
roughly by value:

- **SRS due forecast.** `SRSContext` already computes `dueCount`. A small 7-day "what's coming"
  strip turns the dashboard into something worth opening daily and directly serves the app's core
  loop. Reuse `ProgressBar` or the heatmap cell treatment rather than a new chart primitive.
- **Study heatmap preview.** `src/components/StudyHeatmap.jsx` exists and is used in StatsMode. A
  4-week slice on the dashboard is high-density, visually distinctive, and free — it also fills
  vertical space in a way a card can't, which is the actual complaint.
- **Weakest categories.** `src/utils/wrong-tracker.js` and `session-analytics.js` already track
  this. "3 kategori paling sering salah" with a tap-through to a filtered quiz is the most
  actionable block on the page. Use Variant A (`minmax(MIN, 1fr)`) — these are label↔value rows.
- **Achievement progress.** `src/utils/achievements.js` has explicit per-id badge art. A "next
  badge, 4 away" nudge reuses existing assets. Variant B with a finite cap — badges are fixed-size
  centered content.
- **Meaningful states for the empty conditionals**, rather than nothing: no exam date → "Set exam
  date" prompt (a real onboarding gap); no streak → "start one today"; nothing recent → point at
  the Belajar tab. This is item 14's `EmptyState` doing its job, and it's the cheapest fix here.

**Sequencing note.** Do the empty-state pass first — it's small, it's most of the perceived
improvement, and it tells you how much genuine dead space is left before you build charts to fill
it. Don't add all five blocks; pick by value and re-measure.

**Grid mechanics.** `Dashboard.module.css` owns the one legitimate exception to "breakpoints live in
AppShell" (its two-column rule, acknowledged in `AppShell.module.css`'s header comment). Keep that
exception contained — new blocks go inside the existing `.colMain` / `.colSide` containers and use
Variant B caps internally so a single stat card doesn't inflate to fill 1180px.

**Done when.** A brand-new user with no data sees a dashboard with no large empty regions at 1180px
and no lonely gaps at 480px; every added block reuses an existing data source; no new top-level
breakpoint was introduced.

---

### ☑ 13. Side nav is three items in a full-height column — `M`

**What.** `src/components/SideNav.jsx` renders exactly three items — Beranda, Belajar, Saya — in a
236px column at `height: 100vh`. Below them: a card count and empty space. Use the room.

**Why.** The side nav is a direct transliteration of the bottom pill, which had three items because
a phone pill fits three. A desktop sidebar has room for the 21 modes that currently require a trip
to the Belajar tab and a scroll. `MODE_SECTIONS` in `src/router/modes.js` already groups them —
Pelajari / Latihan / Ujian / Ulasan / Alat — and that grouping is unused by the side nav.

There's also a state gap: entering a mode leaves the side nav showing whichever *tab* was last
active, so on desktop nothing indicates which of 21 modes is open. `SideNav` receives no `mode`
prop at all.

**How it fits.**

- Keep the three tabs as the primary group, then render `MODE_SECTIONS` beneath as a secondary
  list — section title, modes indented, icons from `MODE_META[key].ui`. This is the registry doing
  what it was built for; no new mapping.
- Pass `mode` into `SideNav` and mark the active one. The **hazard rail** is the established device
  for active nav state (`docs/DESIGN_SPEC.md` §1) — this is a legitimate use, not decoration, and
  it's already how the bottom nav marks active.
- Consider collapsing sections by default with only the active one open, so the column doesn't
  become a 21-item wall. Native `<details>`/`<summary>` handles this with no JS and correct
  keyboard/AT semantics out of the box.
- `--sidenav-w` is 236px and stays; if the mode list needs more room, that token is the one place
  to change it.
- Fix `height: 100vh` → `100dvh` here as part of item 3.

**Done when.** Every mode is reachable in one click at ≥1040px; the active mode is visibly marked;
the column doesn't overflow at a 1040px-tall viewport; the bottom nav at narrower widths is
untouched.

---

---

_Items 37–38 added by the second audit pass (2026-08-20)._

### ☑ 37. The service worker replaces itself mid-session, and every mode is a lazy chunk — `M` — needs owner decision

**What.** `public/sw.js` calls `self.skipWaiting()` on install (line 28) and `self.clients.claim()`
on activate (line 42), then deletes every cache not in `ALL_CACHES` (lines 35–41). Meanwhile all 21
modes are `React.lazy` and Vite emits content-hashed chunk filenames. Decide whether an update
should take over a live session at all.

**Why.** Two consequences, one cosmetic and one not.

**The cosmetic one:** the update prompt is misleading. Item 6 treats the two competing
notifications as a duplication problem, and it is — but the deeper issue is that by the time either
one appears, `skipWaiting` + `clients.claim` have **already** made the new worker active and
claimed the page. "Perbarui" isn't a choice about whether to update; the update happened. The
button only reloads.

**The one that matters:** a user studying while a deploy lands now has an old JS bundle running
against a new cache, with the old caches deleted. Navigating to a mode whose chunk hasn't loaded
yet triggers a dynamic import of a hashed filename that no longer exists in the cache **or** on the
server (a Pages deploy replaces the asset directory). The import rejects. On a fully lazy-loaded
app that's a hard failure on the next navigation, and it lands on exactly the users who keep the
app open — the committed daily ones.

`ModeRouter` does wrap `<Suspense>` in an `ErrorBoundary`, so this surfaces as the error fallback
rather than a white screen. But see item 38: that fallback's "Coba lagi" only clears React state
and re-attempts the same dead import, so it fails again immediately.

**Why this is a judgment call.** `skipWaiting` is a deliberate trade — it exists so users get fixes
fast without waiting for every tab to close, which for an offline-first app with a stale-cache
history (`docs/PWA_RELEASE_SPEC.md` §2) is a defensible default. Removing it means updates land
later; keeping it means accepting mid-session swaps. Reasonable people land differently, so this
needs the owner, not an executing session. Three routes:

1. **Wait for the user.** Drop `skipWaiting`; let the new worker stay `waiting`; have the toast's
   action post `SKIP_WAITING` and only then reload. The prompt becomes truthful and no session is
   swapped underneath. Most correct, most work.
2. **Keep `skipWaiting`, stop deleting the old cache immediately.** Retain the previous
   `CACHE_VERSION`'s static cache for one generation so in-flight lazy imports still resolve.
   Cheapest real mitigation; costs some storage.
3. **Keep current behaviour, handle the failure.** Catch dynamic-import rejection and force a
   reload rather than showing a retry that can't work. Doesn't prevent the interruption but stops
   it being a dead end. Pairs with item 38 and is worth doing regardless of 1 or 2.

**Note for whoever executes:** touching `sw.js` means bumping `CACHE_VERSION`
(`docs/PWA_RELEASE_SPEC.md` §2), and `src/tests/offline.sw.test.js` covers this file.

**Done when.** The owner has chosen; the update prompt describes what actually happens; a deploy
during an open session cannot leave the app in a state where the only recovery is a manual refresh.

---

### ☑ 38. Error states: untokenized, unexplained, and a retry that can't work — `M`

**What.** `src/components/ErrorBoundary.jsx` provides three fallbacks — `TabError`,
`FlatCardFallback`, and the generic boundary. All three are built from inline styles, and the
generic one's recovery action is ineffective for the most likely real failure.

**Why.** Item 19 proposes reviewing error *paths*; this is the concrete state of the *components*
those paths land on:

- **"Coba lagi" mostly can't work.** It calls `this.setState({ error: null })`, which re-renders the
  same subtree. For a stale lazy-chunk import (item 37 — the most likely production error here),
  React retries the same failed import and throws again immediately. The user gets a button that
  visibly does nothing. `TabError` gets this right with `window.location.reload()`; the generic
  boundary doesn't.
- **The raw error message is shown to the user:** `{this.state.error?.message ?? 'Unknown error'}`.
  For the chunk case that renders as `Failed to fetch dynamically imported module: https://…` — an
  English stack-level string in front of an Indonesian construction worker. Useful in a console,
  not in the UI.
- **Every value is hardcoded.** `padding: 32`, `fontSize: 32/13/12`, `borderRadius: 12`,
  `opacity: 0.6` — none from `--sp-*`, `--fs-*`, or `--r-*`. `docs/COMPONENT_SPEC.md` §6 puts
  reusable, themed, hover-capable UI in a module; these are all three, and the buttons have no
  hover or active state at all.
- **Two different looks for one concept.** `TabError` and the generic fallback present the same
  class of event differently, so a user hitting both sees two unrelated designs.

**How it fits.** `EmptyState` is already the app's icon + title + explanation + one-action shape and
is already themed — item 19 proposes reusing it for errors and this is the concrete version of
that. Give `ErrorBoundary` a real CSS module, express the three fallbacks as one component with a
variant, and:

- Recovery action is **reload**, not state-clear, unless the boundary is given a retry callback that
  actually re-fetches something.
- Show plain Indonesian; keep the technical message behind a collapsed "Detail teknis" for anyone
  reporting a bug, and keep the existing `console.error` in `componentDidCatch` for diagnostics.
- Offer the export path where progress could be at risk, per item 15's reasoning.

**Done when.** One error presentation, tokenized and themed; the recovery action works for chunk
failures; the user-facing copy is Indonesian and actionable; no inline styles left in
`ErrorBoundary.jsx`.

## 5. P2 — Consistency and feedback

The app tells the user what happened in several different voices, and three well-built shared
components have no consumers at all. This band is mostly adoption, not construction.

### ☐ 14. Adopt `EmptyState` — it has zero consumers — `M`

**What.** `src/components/EmptyState.jsx` is a finished component with five named presets —
`NoReviews`, `NoWrong`, `SearchEmpty`, `NoStarred`, `NoProgress` — each with icon, title, Indonesian
copy, and a CTA. **Nothing imports it.** Verified across the whole tree.

**Why.** Meanwhile the modes hand-roll their own, less complete versions:

| Location | Current treatment |
| --- | --- |
| `src/modes/FocusMode.jsx:140` | Local `S.emptyTitle`, no CTA |
| `src/modes/JACMode.jsx:146` | Local `S.emptyTitle`, no CTA |
| `src/modes/FlashcardMode/index.jsx:213-216` | Three inline ternary strings |
| `src/modes/ReviewMode.jsx:151` | Inline text — and `EmptyState.NoReviews` was written for exactly this |
| `src/modes/CatatanMode.jsx:294` | Inline ternary |

Every one of these is a moment where a user hit a wall. The hand-rolled versions tell them they've
hit it; the component tells them what to do next. `NoReviews` — "you're up to date, come back
tomorrow, here's a new card in the meantime" — is a materially better outcome than a bare sentence,
especially for someone whose habit is still forming.

**How it fits.** Pure adoption. Replace each hand-rolled block with the matching preset, wire `onCta`
to `goMode`. Add presets for genuine gaps found along the way (`NoNotes` for CatatanMode) following
the existing shape. Delete the local `.emptyTitle` styles once nothing uses them.

Two things to check while in there: the component takes a `style` prop escape hatch that shouldn't
be needed if the container is right, and it sets `role="status" aria-live="polite"` — appropriate
for content that appears after a search, worth confirming it isn't announced spuriously on initial
mount.

Also worth doing here: the empty-state half of item 12, which is the same component on the
dashboard.

**Done when.** No hand-rolled empty state remains in `src/modes/`; every empty state offers a next
action; `EmptyState.jsx` has real consumers.

---

### ☑ 15. Adopt `ConfirmDialog` + `useFocusTrap` for destructive actions — `M`

**What.** `ConfirmProvider` is mounted in `src/main.jsx` and `useConfirm` has **zero consumers**.
`src/hooks/useFocusTrap.js` also has zero consumers. Meanwhile destructive confirmation is
hand-rolled twice, differently.

**Why.** Two bespoke patterns for the same job:

- `src/modes/FlashcardMode/index.jsx:158-169` — tap-twice-within-3-seconds, with a `setTimeout` that
  reverts the button. HANDOFF records that this control erases all progress and used to sit in a
  uniform grid at the same visual weight as a star filter; it was separated and restyled, but the
  confirmation is still a timing-based double-tap. On a phone, in a pocket, that is a genuinely
  reachable accident.
- `src/components/SayaTab.jsx:116` — a four-state machine, `idle → confirm → countdown → ready`.

Neither surfaces what's about to be lost. Both are more code than calling `await confirm(...)`.

Separately, `ConfirmDialog` itself has an a11y gap: it sets `role="dialog" aria-modal="true"` but
implements **no focus trap and no Escape handler**. `aria-modal` promises assistive tech that focus
is contained; nothing contains it. The hook that would fix this is sitting unused in the same repo.

**How it fits.**

- Wire `useFocusTrap` into `ConfirmDialog` — the hook exists, this is what it's for. Add Escape →
  cancel, and return focus to the triggering element on close.
- Migrate both hand-rolled flows to `useConfirm`. Its promise-based API (`const ok = await
  confirm(msg)`) collapses the state machine to a single `if`.
- **Make the message specific.** "Hapus semua progres?" is weaker than naming the loss: *"X kartu
  hafal, Y hari streak, dan Z catatan akan hilang. Ini tidak bisa dibatalkan."* Those numbers are
  already in `ProgressContext`. For an audience whose data lives only in localStorage with no
  backend, this is the last line of defence.
- **Point at the export.** `ExportMode` exists. A destructive confirm should offer backup as an
  alternative to proceeding.
- The dialog uses `--overlay-max-w` correctly already — leave that.

**Depends on.** Item 4 settles the dialog-vs-toast stacking question.

**Done when.** One confirmation path app-wide; focus is trapped and Escape cancels; focus returns to
the trigger; destructive messages name what will be lost; no timing-based double-tap remains.

---

### ☑ 16. Define toast semantics and stop losing messages — `M`

**What.** `ToastProvider` is used from several places with no shared convention about when a toast is
the right vehicle, and its queue silently drops messages. Write the convention down; fix the queue.

**Why.** Current behaviour, from `src/components/Toast.jsx`:

- **The queue drops messages.** `setToasts((ts) => [...ts.slice(-1), {...}])` keeps only the last
  existing toast plus the new one — a hard cap of two, enforced by discarding without any signal. A
  milestone toast landing at the same moment as a quota error can silently delete one of them. A cap
  is reasonable; discarding the *older* item invisibly is not, and a queue that shows them in
  sequence is barely more code.
- **Timers are never cleared.** `setTimeout(() => dismiss(id), duration)` is never cancelled — not on
  manual dismiss, not on provider unmount. Harmless today, a warning-generating leak under test and
  a real one if the provider ever remounts.
- **`role="status"` with `aria-live="assertive"` contradict.** `role="status"` carries an implicit
  `aria-live="polite"`; overriding it to assertive is ambiguous across screen readers. For genuinely
  interrupting messages the correct pairing is `role="alert"`. Currently error-type toasts request
  assertive on a status role.
- **Dismissal is touch-only.** Swipe-left works; there is no keyboard equivalent, and no
  pause-on-hover for desktop, where a 3.5s auto-dismiss on a long message is easy to miss.

And there's no rule for when to toast at all. Today it carries milestones, quota errors, SW updates,
and the anxiety-reduction message from `useAnswerStreak` (≥5 consecutive wrong) — that last one is
a thoughtful piece of design and shouldn't be competing with a storage warning for the same 3.5
seconds.

**How it fits.** Extend the existing component; don't replace it.

- Queue rather than discard: cap concurrent display at 2–3, hold the rest, show them as slots free.
- Clear timers on dismiss and on unmount.
- Use `role="alert"` for `type="error"`, `role="status"` for the rest, and drop the conflicting
  `aria-live` override.
- Add Escape-to-dismiss for the top toast and pause-on-hover.
- Write the convention into `docs/COMPONENT_SPEC.md` — roughly: **toast** for transient
  acknowledgement the user doesn't need to act on; **inline** for anything tied to a specific
  control (validation, per-card feedback); **dialog** for anything requiring a decision; **banner**
  for persistent state like offline. Errors that lose data are never toast-only.
- Consider a priority field so the anxiety message and a quota error don't race.

**Depends on.** Item 1 (positioning) — do that first, it's P0 and self-contained.

**Done when.** No message is silently dropped; no timer leaks; screen-reader semantics are
internally consistent; a keyboard user can dismiss; the convention is documented and the existing
call sites match it.

---

### ☐ 17. Loading and skeleton consistency — `M`

**What.** `src/components/Skeleton.jsx` provides `Skeleton`, `.Card`, `.QuizOption`, `.Stat`,
`.Row`. Only `ModeRouter` and `ReviewMode` import it. Apply it consistently to the lazy-loading
boundary all 21 modes pass through.

**Why.** Every mode is `React.lazy` (`MODE_COMPONENTS` in `src/router/modes.js`) behind a single
`<Suspense fallback={<ModeLoader />}>`. So one generic fallback covers a flashcard screen, a stats
dashboard, and a glossary — all of which have completely different shapes. On a slow connection,
which is the design assumption, that fallback is on screen long enough to matter, and a
shape-matched skeleton makes the wait feel shorter and stops the layout jumping when content lands.

The `data-cards` chunk (item 27) makes this worse: 661KB has to arrive before most modes render.
Until that's addressed, the loading state *is* the first impression for a returning user on a bad
connection.

**How it fits.** `MODE_META` is the natural home for the mapping — a `skeleton` field per mode
naming a variant, defaulting to the current generic loader. That follows the registry pattern
already used for `ui`, `width`, and `color`, and keeps `ModeRouter` from growing a second
mode→something lookup, which `docs/COMPONENT_SPEC.md` §3 explicitly warns against.

Also worth checking: `Skeleton.Card` sets both `aria-hidden="true"` and `aria-label` — the label is
unreachable while hidden. Either drop the label or expose a single polite "Memuat…" live region for
the whole fallback rather than per-block labels.

**Done when.** Mode loading states match their destination's shape; no layout shift when real
content replaces a skeleton; one loading announcement per transition, not several.

---

### ☑ 18. Decide `FilterPopup`'s fate — `S`

**What.** `src/components/FilterPopup.jsx` + `.module.css` have zero consumers. Either wire it up or
archive it.

**Why.** `_MAP.md`'s session log records that this file was moved to `legacy/unwired-app-code/` on
the content-dq branch during a hygiene pass, then came back through the merge. It is now sitting in
`src/components/` looking live. Meanwhile filtering *is* a real need — `FlashcardMode` has its own
`FilterBar`, and Dashboard's starred-quiz entry point passes `filterIds` through `goMode`.

This is small but it's exactly the drift `docs/AGENT_WORKFLOW.md` §1.3 warns about: a future session
will read `src/components/` as the inventory of live UI and count something that isn't.

**How it fits.** Check whether it duplicates `FlashcardMode/FilterBar.jsx`. If it's better, adopt it
and retire FilterBar. If not, move it to `docs/archive/` or delete it — its history is in git either
way. Don't leave it ambiguous a third time.

**Done when.** Every file in `src/components/` has a consumer, or a comment saying why it doesn't.

---

### ☑ 19. Error and recovery states — `M`

**What.** Review what a user actually sees when something fails, and make the recovery paths real.

**Why.** The scaffolding is in place — `ErrorBoundary` wraps each tab with a `TabError` fallback,
and `ModeRouter` wraps modes with an `onExit`. What's unverified is whether the fallbacks are
useful: whether they explain anything in Indonesian at the audience's reading level, whether they
offer a way out beyond "exit the mode," and whether they preserve in-progress work.

Specific things worth checking rather than assuming:

- A crash mid-quiz — is the session recorded, or silently lost?
- Storage-quota failure has a handler (`setQuotaHandler` in `App.jsx`) that shows an 8-second error
  toast telling the user to back up. That's a toast for a data-loss event, which item 16's own
  convention says is wrong. It should be a persistent, dismissible banner or a dialog with a direct
  link to `ExportMode`.
- A corrupt localStorage document — `src/storage/migrations.js` handles version upgrades, but a
  parse failure on a compressed doc is a different case. What does the user see?

**How it fits.** Reuse `EmptyState`'s shape for error presentation (icon, title, explanation, one
clear action) rather than building a second visual language for failure — it's the same shape and
already themed. Route data-loss messaging through the banner/dialog levels of item 16's convention,
not the toast level.

**Done when.** Every failure path shows plain-Indonesian text and at least one action; nothing
requiring the user to act arrives via a self-dismissing toast; in-progress work survives a mode
crash or is explicitly acknowledged as lost.

---

---

_Items 39–42 added by the second audit pass (2026-08-20)._

### ☐ 39. Japanese text falls back to a font the app never loads — `S`

**What.** `AngkaMode.module.css:152,202` and `SimulasiMode.module.css:112,227` set
`font-family: var(--font-jp, 'Noto Serif JP', serif)`. `--font-jp` is defined nowhere, and
**`Noto Serif JP` is not loaded** — `index.html` requests DM Sans, Noto Sans **JP**, and Syne. So
the chain falls all the way through to generic `serif`.

**Why.** These four rules cover `.questionJp` and `.reviewJp` in the exam-simulation mode and the
related-card Japanese in Angka — Japanese exam content rendered in whatever serif the device
happens to have, next to identical content elsewhere in Noto Sans JP. On Android that fallback
varies by vendor and may have no Japanese coverage at all, in which case the user gets tofu boxes
or Chinese glyph forms for the characters they're studying. Compounds directly with item 34: no
`lang="ja"` means the browser has no signal to prefer a Japanese face when it does have a choice.

**How it fits.** Two options, and the second is probably right:

1. Define `--font-jp` in `global.css` as the loaded stack (`'Noto Sans JP', system-ui, sans-serif`)
   and keep the four call sites. Adds a token that duplicates what `body` already sets.
2. Delete the four `font-family` declarations. Japanese already inherits `'DM Sans', 'Noto Sans JP',
   system-ui` from `body`, and DM Sans has no CJK coverage so Japanese characters resolve to Noto
   Sans JP automatically. Fewer moving parts.

Pick 2 unless a deliberate serif treatment for exam questions is wanted — in which case that's a
design decision for `docs/DESIGN_SPEC.md` §3 and the font has to actually be loaded, which costs
a webfont request against the offline-first budget.

**Done when.** Japanese renders in the same loaded family everywhere; no `var()` in the app points
at an unloaded font.

---

### ☐ 40. Correct/wrong colours bypass the semantic tokens — `S`

**What.** `--ssw-correct` (`#16a34a`) and `--ssw-wrong` (`#dc2626`) exist, theme-swap, and have
matching `…Bg`/`…Border` variants. Several modes use different greens and reds instead.

**Why.** `AngkaMode.jsx:643,663` uses `#22c55e`/`#ef4444`; `AngkaMode.jsx:595,596` uses
`#F87171`/`#4ADE80`; `SimulasiMode.jsx:313,314` uses `#16a34a`/`#dc2626` as raw literals rather than
tokens. So "correct" is at least three different greens depending on which mode you're in — and
`AngkaMode`'s results list uses a *fourth* pair. Correct/wrong is the most semantically loaded
colour signal in a study app; it should be the most consistent thing in it, and a learner
skim-reading results shouldn't have to recalibrate per screen.

Raw literals also don't theme-swap. `AngkaMode.jsx:227,592,668` uses `#9CA3AF` for secondary text,
which sits at roughly 2.3:1 on the light background — a contrast failure of the same kind as item 9
but self-inflicted rather than inherited from the palette.

**How it fits.** Mechanical substitution to `var(--ssw-correct)` / `var(--ssw-wrong)` and the muted
text tokens. Genuine per-mode accents (`ANGKA_COLOR`, `MODE_META.color`, the category colour map)
are a different thing and should stay — they're data, not theme. The line is: **semantic state uses
tokens; identity accents may be literals.** Worth writing into `docs/DESIGN_SPEC.md` §2, since the
existing "never raw hex" rule reads as absolute and clearly isn't being applied that way.

Scope for sizing: 113 raw hex literals total (86 in JSX, 27 in `.module.css`), but most are
legitimate accents or white-on-accent text. The correct/wrong and muted-grey cases are the ones
that matter.

**Done when.** One green and one red for correct/wrong app-wide, both theme-aware; no raw grey used
as body text; the accent-vs-semantic distinction is documented.

---

### ☑ 41. The mode loader is a different width than the mode it loads — `S`

**What.** `ModeRouter.jsx`'s `ModeLoader` hardcodes `maxWidth: 'var(--max-w)'` inline. But
`App.jsx` passes `MODE_META[mode]?.width ?? 'reading'` to `AppShell`, and most modes are `reading`
(620px) rather than full `--max-w` (1180px at desktop).

**Why.** The skeleton renders at up to 1180px, then the real mode mounts at 620px and everything
snaps inward. On the slow connections this app is built for, the loader is on screen long enough
for that jump to be the first thing the user sees. It's also redundant — `AppShell`'s `.content`
already applies the correct max-width, so the inline one only ever fights it.

**How it fits.** Delete the inline `maxWidth` and `margin` and let the shell own width, which is
what `docs/LAYOUT_SPEC.md` §2 says: "A screen sets `max-width: var(--max-w)` once and never needs
its own media query" — and a screen inside `AppShell` doesn't even need that. Pairs naturally with
item 17, which reshapes the loader per mode anyway.

Also here: `Skeleton.Card` sets both `aria-hidden="true"` and `aria-label` — the label is
unreachable while the element is hidden. `ModeLoader` already has a `role="status"` wrapper with
its own label, so drop the per-block labels rather than adding more.

**Done when.** No width change when a mode replaces its skeleton; loader width comes only from the
shell; one loading announcement per transition.

---

### ☐ 42. Number formatting is inconsistent — `S`

**What.** Card counts use `toLocaleString('id-ID')` in three places (`Dashboard.jsx:160,179`,
`SideNav.jsx:50`) and render raw everywhere else — including `Dashboard.jsx`'s own
`{knownN} kartu hafal` two lines above a formatted one. So the same corpus shows as "1.438" and
"1438" on the same screen.

**Why.** Small, but it's the sort of thing that reads as unfinished, and Indonesian uses `.` as the
thousands separator so an unformatted four-digit number looks wrong rather than merely plain.

**Not a bug:** `toLocaleDateString('sv')` in `src/utils/date.js` and `StudyHeatmap.jsx` is the
standard trick for an ISO `YYYY-MM-DD` key and is correct — leave it alone. Checked precisely so a
later session doesn't "fix" it.

**How it fits.** A tiny `formatCount()` in `src/utils/` (there is no formatting helper today) used
everywhere a corpus-scale number is displayed. Small numbers — a streak of 5, a score of 7/10 —
don't need it and shouldn't get it.

**Done when.** Counts in the thousands format consistently; `date.js` untouched.

## 6. P3 — Reach and polish

Worth doing, not worth blocking on. Roughly in value order within the band.

### ☐ 20. Global keyboard layer + discoverable shortcuts — `M`

**What.** Keyboard support exists per-mode: `useQuizKeyboard` (1/2/3/4 or a/b/c/d to select, Enter or
Space to advance) plus local `keydown` handlers in nine files. There is no app-level layer and no
way to find out any of it exists.

**Why.** Desktop is now a supported target. `ProductionMode.jsx:199` renders a hint line — "Enter =
kirim jawaban · Esc = skip · spasi = lanjut" — which is the right instinct, implemented once, in
one mode. Elsewhere the shortcuts are invisible.

**How it fits.** Native, no dependency:

- App-level: `Escape` exits a mode (pairs with item 10's history work), `?` opens a shortcut sheet,
  `1/2/3` switches tabs. Guard against firing while an input is focused.
- One `<kbd>`-styled shortcut sheet reusing `ConfirmDialog`'s overlay shell so it inherits the focus
  trap from item 15 rather than growing a second modal implementation.
- Generalise `ProductionMode`'s hint line into a small shared component; show it only on
  pointer-fine devices via `@media (hover: hover) and (pointer: fine)` so phones aren't told about
  keys they don't have.

**Done when.** Shortcuts are discoverable from any screen; nothing fires while typing in a field;
phones show no keyboard hints.

---

### ☐ 21. Motion and haptics consistency pass — `M`

**What.** `global.css` defines nine keyframe animations and two easing tokens; `src/utils/haptic.js`
is used in seven files. Neither has a stated rule for when it applies.

**Why.** Haptics fire in `OptionButton`, `RatingRow`, `FlipCard`, and four modes — but whether an
identical interaction buzzes depends on which screen you're on. Same for motion: `popIn`,
`bounceIn`, `correctFlash`, `wrongShake` exist, and which one a correct answer gets varies by mode.
Inconsistent feedback for identical actions reads as unfinished, and on a phone in a pocket a
stray vibration is a real annoyance.

**How it fits.** Audit first, then write the rule into `docs/DESIGN_SPEC.md` §4 — something like:
haptic on answer-commit and on destructive-confirm only; `--t-fast` for state changes, `--t-base`
for entrances, `--t-slow` for celebration; `correctFlash`/`wrongShake` reserved for answer feedback.
Then reconcile call sites to match. Item 5 removes the dead reduced-motion block; the catch-all
already covers new animations, but any JS-driven motion needs its own `prefers-reduced-motion`
check since a CSS rule can't reach it.

**Done when.** Identical interactions feel identical across modes; the rule is documented; haptics
respect a user preference if one is added.

---

### ☐ 22. Wide-breakpoint density and typography — `M`

**What.** The type scale is fixed in px across all three breakpoints. Review whether 1180px should
read the same as 480px.

**Why.** The overhaul solved *width* comprehensively (`--max-w` widens, grids reflow) but not
*density*: 13px body text at arm's length on a monitor is small, and 32px hero type that anchors a
phone screen is modest on a desktop dashboard. This is the natural follow-on to the layout work,
not a criticism of it.

Related and worth deciding at the same time: every `--fs-*` token is px, which means they don't
respond to a user's browser font-size setting. Moving to `rem` would fix that, but it's a
cross-cutting change touching every stylesheet and could easily be its own session — and it may
interact with the JP typography, where `Noto Sans JP` at small sizes is already tight.

**How it fits.** `--fs-*` tokens are already centralised in `global.css`, and `--max-w` proves the
pattern: redefine tokens inside the existing `@media (min-width: 1040px)` block and every consumer
follows with no per-file edits. No new breakpoints, no per-component overrides. Bump conservatively
— body 13→14px, hero 32→36px — and check the JP display sizes separately, since ruby text has its
own legibility floor (`docs/CARD_CONTENT_SPEC.md` covers ruby rules).

**Done when.** Wide-screen reading comfort improves without any layout reflow; compact and medium
are pixel-identical to today; the rem question is either done or explicitly deferred with a reason.

---

### ☐ 23. Landscape and one-handed reach — `M`

**What.** Two related mobile-ergonomics gaps: nothing handles landscape orientation, and primary
actions sit at the top of tall screens.

**Why.** Landscape happens — phone propped up, watching a listening exercise, or just held sideways
on a break. In landscape a phone is roughly 360px tall; a fixed bottom nav plus a mode header plus
`--nav-safe` padding can leave very little for the flashcard itself. Worth measuring before
designing: this may already be fine, or it may be unusable.

Separately, the app is explicitly built for one-handed use (`--tap-min: 44px` is justified in
`global.css` on exactly those grounds), but on a 6.7" phone the top third is out of thumb reach.
`ModeHeader`'s back button (item 11) and several mode controls live there.

**How it fits.** For landscape, use the existing breakpoint vocabulary rather than adding an
orientation query if a height-based one will do — `@media (max-height: 480px)` to compress the
header, reduce vertical padding, and consider docking the nav to the side. For reach, the principle
is that destructive and rarely-used controls may live at the top; frequent ones (rate, flip, next)
belong in the lower half. `FlashcardMode` already gets this roughly right with its bottom-anchored
rating row — the pattern is there, it just isn't stated.

**Done when.** A flashcard is usable at 360px viewport height; the reach principle is written into
`docs/DESIGN_SPEC.md`; no frequent action sits in the top third of a mode screen without an
alternative.

---

### ☐ 24. Onboarding and first-run continuity — `M`

**What.** Review what happens after onboarding completes, and close the gaps it leaves open.

**Why.** `Onboarding.jsx` covers Welcome → Track → Demo → Goal, and HANDOFF records it was
redesigned with real illustration art this branch. But `Dashboard` reads `prefs.examDate` and shows
the countdown — the single strongest motivational device in the app, and the only legitimate use of
the hazard rail on that screen — only when a date is set, and **onboarding never asks for one.** It
has to be found in SayaTab. So the highest-value dashboard element is off by default for every new
user, which is also part of item 12's dead space.

Also: `App.jsx` falls back to `<Onboarding>` when `onboarded` is true but `track` is null (after a
track reset from SayaTab). A returning user who resets their track gets the full first-run flow,
including Welcome and Demo. That's a jarring re-entry for what should be a one-question change.

**How it fits.** Add an optional exam-date step to the existing flow — skippable, since not everyone
has a date booked, and pair the skip with a dashboard prompt (item 12) so it can be set later
without hunting. Make the track-only re-entry a targeted step rather than the full sequence;
`Onboarding` is already stepped, so this is a starting-index prop, not a new component.

**Done when.** A new user reaches the dashboard with a countdown or an obvious way to set one;
resetting a track doesn't replay Welcome and Demo.

---

### ☐ 25. Offline legibility — say what works without a connection — `S`

**What.** The offline banner says "Mode offline — semua data tersimpan lokal." True, and reassuring,
but it doesn't say what still works.

**Why.** Offline-first is the app's core promise and almost everything genuinely works — the cards,
the SRS, the quizzes, all of it is local. But the audio features (`src/utils/speak.js`,
`DengarMode`) depend on platform speech synthesis, which may or may not have offline voices, and
`src/utils/gist-sync.js` needs the network outright. A user who hits a silent failure in DengarMode
while offline has no way to know it's expected.

**How it fits.** Small and additive, once item 7 puts the banner in `AppShell` where modes can see
it: have offline-dependent affordances read the same online state the banner uses and disable
themselves with a short reason rather than failing silently. `SideNav`'s footer already advertises
"siap offline" — that claim is worth making precise. This is a copy-and-state problem, not a layout
one.

**Done when.** Nothing network-dependent fails silently offline; the offline banner or the affected
control says what's unavailable and why.

---

## 7. Listed for visibility — do not draft or execute from this document

Carried here so nothing is lost when `HANDOFF.md`'s NOT-done list is trimmed. These are **not**
UI/UX work items and this plan deliberately proposes no solutions for them. They stay owned where
they already are.

- **☐ 26. Ten modes still render placeholder icon shapes.** Verified: `MODE_META` names 20 distinct
  `ui` keys, `Icon.jsx`'s `ASSETS` map covers 20, and the ten with no real art are `ulang`,
  `wisuda`, `angka`, `peringatan`, `arsip`, `statistik`, `simpan`, `tulis`, `tukar`, `ketik` — they
  fall through to the `SHAPES` placeholder silhouettes. A ready-to-paste generation prompt is in
  `docs/ASSET-PROMPTS.md` §4b. **Owner is generating this art externally.** Activation is one line
  each in `ASSETS`; layout does not shift when it lands. Asset pipeline, not an agent task until
  handed off.

- **☐ 27. `data-cards` chunk is 661KB (191KB gzipped).** Re-verified this session: `npm run build`
  reports `data-cards-BHVwn0HW.js  661.05 kB │ gzip: 191.32 kB` and warns. Undercuts offline-first
  on slow connections — it must land before the app is meaningfully usable. Build/data-loading
  concern, deliberately deferred to its own branch. It has UI *consequences* (see item 17), but the
  fix is not a UI fix.

- **☐ 28. `data-wayground` chunk is 479.55KB (135.86KB gzipped).** Not previously recorded anywhere.
  Sits just under the 500KB warning threshold, so it's invisible in build output today and will
  start warning if the Wayground set grows at all. Same branch and same conversation as item 27
  whenever that happens.

- **☐ 29. The branch has never been merged; review the Prettier commit separately.**
  `feat/ui-overhaul` is 14 commits ahead of `main` and unmerged. `f2fa439` ("style: apply Prettier
  repo-wide") touches 237 files and was deliberately kept as its own commit so the UI work stays
  reviewable — review it separately from the rest. Process item, carried from HANDOFF.

**Resolved 2026-08-20 — no longer pending.** The first pass flagged `docs/BLUEPRINT-CURRENT.md`
as live-but-stale and left it for the owner. The owner said to fix it along the way, so it has been
archived to `docs/archive/BLUEPRINT-CURRENT.md` with a provenance header carrying the full drift
table (it claimed storage v3 / 23 modes / 1,443 cards / 457 tests against an actual v6 / 21 /
1,438 / 435, and documented the removed Doboku/Kenchiku tracks at length). Nothing live was lost —
its one section with ongoing value, "Hard Constraints (Do Not Break)," is already covered more
accurately by `docs/PWA_RELEASE_SPEC.md` §1, `docs/AGENT_WORKFLOW.md` §2, and `_MAP.md` §1/§3.
`docs/archive/ARCHIVE-INDEX.md` gained a row, and three "superseded by" pointers that aimed at the
old live path were retargeted. `_MAP.md`'s `docs/` tree was stale in the same way — still listing
`DATA_ARCH_AUDIT.md` as live and omitting every spec doc added since — and was corrected in the
same commit.

Recorded here rather than deleted because it is the second time a doc has drifted this way while
sitting outside `docs/AGENT_WORKFLOW.md` §4's table. The pattern is the point: **a doc nothing
points at is a doc nothing keeps honest.** If this plan is still live in three months and §4 still
doesn't mention it, that is the same failure starting again.

---

## 8. Suggested execution sequencing

Not a schedule — a dependency order. Batching keeps commits reviewable and keeps verification
honest. Where an item blocks another, it is called out; everything else inside a batch is
independent and can be split or grouped freely.

**Batch 0 — the silent-defect fixes (items 30, 31, 41).** Do these first, before anything else,
even though 41 is nominally P2. Reason: all three are cases where the app renders something wrong
while every check passes, and two of them will otherwise be *reintroduced* by later work in this
plan — item 20 would spread item 31's missing focus guard across every screen, and item 17 would
build a nicer skeleton on top of item 41's wrong width. Small, mechanical, no design decisions.
Item 30 should land with the token-reference guard script described in its entry; without that,
this is a fix rather than a fix plus a floor.

**Batch 1 — P0 mechanical (items 1–8, 34, 35, 36).** All small, all verified, no design decisions.
One commit per item, or group by file where they overlap. Ordering constraints inside the batch:
item 4 before items 7 and 11 (they need `--z-banner`); item 1 before item 16. Item 35 is cheaper
after item 11, so it can also slip to Batch 4 — decide when you get there rather than doing the
work twice.

**Batch 2 — the accessibility structural fixes (items 32, 33).** Bigger than Batch 1 and touching
many files, but mechanical and low-risk: no visual output should change. Worth its own reviewable
diff precisely because "no visual change" is the acceptance criterion — mixed into a batch that
does change visuals, nobody can verify it. Item 33's `Row` fix is the high-leverage piece; do it
first and confirm SayaTab looks byte-identical before touching the rest.

**Batch 3 — item 9 (contrast).** Blocked on an owner decision between the three routes. Don't roll
it into an earlier batch; it changes visual output everywhere and deserves an isolated diff.

**Batch 4 — item 10 (history).** Blocked on an owner decision. Its own branch. Largest single item
in this plan; do not batch it with anything. Item 15 should land first if a mid-quiz back-guard is
in scope.

**Batch 5 — item 37 (service worker).** Blocked on an owner decision. Keep separate from Batch 4
even though both are navigation-adjacent: this one touches `sw.js`, needs a `CACHE_VERSION` bump,
and is the one change in this plan that can break the offline path for existing installs if it goes
wrong. Item 6 either folds into this or lands just before it — decide together, since 37 determines
what the prompt in 6 should honestly say.

**Batch 6 — P1 layout (items 11, 12, 13).** Item 11 first: the mode header is what other navigation
work coordinates with, and it resolves most of item 35 as a side effect. Then 12 and 13, which are
independent of each other. Item 14 is worth pulling forward into this batch — the empty-state pass
is most of the perceived improvement in item 12 and tells you how much real dead space is left.

**Batch 7 — P2 adoption and consistency (items 14, 15, 18, 38, 39, 40, 42, then 16, 17, 19).**
14/15/18 are adoption of components that already exist. 38/39/40/42 are small and independent.
16 needs item 1; 17 pairs with the already-done 41; 19 needs the conventions established in 16, so
it goes last.

**Batch 8 — P3.** Pick by value as time allows. Nothing in P3 blocks anything else, but item 20
must not start before item 31.

**Every batch:** `npm test` / `npm run lint` / `npm run build` before starting and again before
committing — `docs/AGENT_WORKFLOW.md` §2. Baseline as of this drafting session, re-verified rather
than taken from docs: **435/435 tests passing (39 files), lint 0 warnings, build clean** apart from
the known `data-cards` warning. If a number differs when you start, find out why before changing
anything.

**A note on tests.** Several items here are regressions that the existing 435 tests did not catch
and would not catch again — item 31 in particular is a plain functional bug in the most-used mode.
Where an item describes a reproducible defect, land a regression test with the fix. Item 31's entry
describes the exact reproduction that was used to confirm it.

---

## 9. Cross-cutting verification checklist

Applies to every item. UI changes here can't be caught by the test suite alone — most of it is
logic and data — so these are manual, and worth actually doing rather than assuming.

- [ ] **Three breakpoints.** 375px (phone), 768px (tablet), 1440px (desktop). The 1040px boundary
      specifically — nav placement flips there and it's where the mode-screen bug in item 1 lives.
- [ ] **Both themes.** Light is the default and the weaker one for contrast; check it first.
- [ ] **Keyboard only.** Tab through, confirm focus is visible at every stop and never trapped
      outside a modal or lost after a dialog closes.
- [ ] **Reduced motion** on, at least once per batch that touches animation.
- [ ] **Offline.** DevTools offline, then navigate — this is the app's core promise.
- [ ] **Both chrome modes.** `chrome='tabs'` and `chrome='mode'` behave differently; a change
      verified on the dashboard alone is verified on roughly a seventh of the app.
- [ ] **No new raw values.** Grep the diff for hex colours, px spacing off the `--sp-*` scale, and
      bare z-index numbers.
- [ ] **No new `max-width` in a component module.** Width is a shell concern
      (`docs/LAYOUT_SPEC.md` §2).
- [ ] **Tests, lint, build** — before and after, not just after.
- [ ] **`CACHE_VERSION`** bumped in `public/sw.js` if anything shipped-facing changed
      (`docs/PWA_RELEASE_SPEC.md` §2). It has been missed before.
- [ ] **Every `var()` in the diff resolves.** Added by the second pass, because eleven undefined
      tokens shipped without anything noticing (item 30). An undefined `var()` with no fallback is
      valid CSS that silently voids its declaration — lint, tests, and build all pass.
- [ ] **Typing works.** If the screen has a text field and any global key handler, type a
      multi-word phrase into it and confirm every character lands (item 31).
- [ ] **Tab to every control you can click.** If the mouse can reach it, the keyboard must
      (item 33). Watch for `<div onClick>`.
- [ ] **Real device once per band.** The emulator won't show you the iOS home-indicator overlap
      (item 2), a vendor CJK font fallback (item 39), or how a 44px target actually feels
      (item 36).

---

## 10. Spec docs this plan may require updating

When an item changes something the specs describe, update the spec **in the same commit** — one
source of truth per concept, and a spec that lags the code is worse than no spec.

| Item | Doc | What changes |
| --- | --- | --- |
| 4 | `docs/DESIGN_SPEC.md` §4 | `--z-banner` added; dialog/toast ordering recorded |
| 5 | `docs/DESIGN_SPEC.md` §2 | Focus-ring description matches the surviving rule |
| 9 | `docs/DESIGN_SPEC.md` §2 | Colour table if any alpha changes |
| 11 | `docs/COMPONENT_SPEC.md` §2 | `ModeHeader` as a shared primitive |
| 13 | `docs/LAYOUT_SPEC.md` §4 | SideNav's expanded role |
| 16 | `docs/COMPONENT_SPEC.md` | Toast-vs-inline-vs-dialog-vs-banner convention |
| 17 | `docs/COMPONENT_SPEC.md` §3 | `MODE_META.skeleton` field |
| 21 | `docs/DESIGN_SPEC.md` §4 | Motion and haptic rules |
| 22 | `docs/DESIGN_SPEC.md` §3 | Responsive type scale |
| 23 | `docs/DESIGN_SPEC.md` | Reach principle |
| 30 | `docs/COMPONENT_SPEC.md` | Note that `--c-*` / `--color-*` are dead schemes; `--ssw-*` only |
| 32 | `docs/COMPONENT_SPEC.md` §2 | A `Field` primitive, if one is introduced |
| 33 | `docs/COMPONENT_SPEC.md` §5 | `Row` is a `<button>`, not a `<div>` |
| 34 | `docs/CARD_CONTENT_SPEC.md` | `lang="ja"` on rendered Japanese |
| 36 | `docs/DESIGN_SPEC.md` §2 | `--tap-min` applies to the shared button primitives |
| 37 | `docs/PWA_RELEASE_SPEC.md` §2 | Update/activation strategy, whichever route is chosen |
| 39 | `docs/DESIGN_SPEC.md` §3 | Which font family Japanese uses, and that it must be loaded |
| 40 | `docs/DESIGN_SPEC.md` §2 | Semantic state uses tokens; identity accents may be literals |

---

_Drafted against `feat/ui-overhaul` @ `2169bfc`, 2026-08-20, across two passes on the same day.
Every "verified" claim was checked against the code, the build output in `dist/`, or a throwaway
reproduction — not carried over from another doc. No application code was written or changed in
either pass; `src/` was confirmed untouched before committing. Findings age — re-check before
acting, and treat a line number as a hint about where to look rather than a guarantee._
