# Design Spec — SSW Konstruksi

Stable reference for the visual identity established during the `feat/ui-overhaul` phase
(2026-08). Doesn't change every session — update it when the identity itself changes, not when
a screen ships. Values below are pulled directly from `src/styles/theme.js` and
`src/styles/global.css`; if this doc and the code ever disagree, the code wins — fix this file
to match, not the reverse.

## 1. Identity

Amber/gold construction-site palette, kept deliberately distinct from the main Nugget Nihongo
app's own overhaul rather than aligned with it (owner-approved direction, see `_MAP.md` §7,
2026-08-19 row). Palette is the one locked constraint; everything else in this doc is judgment
that can evolve.

**Hazard rail** is the signature device: a diagonal amber/near-black stripe borrowed from real
construction signage.

```css
--hazard-dark: #3b2408;
--hazard: repeating-linear-gradient(45deg, var(--ssw-amber) 0 6px, var(--hazard-dark) 6px 12px);
--rail-w: 9px;
```

Used **only** to mark time-sensitive or active state — exam countdown, daily mission, the active
nav item. It stays meaningful because nothing else uses it. Don't reach for it as decoration.

**Touch targets.** `--tap-min: 44px` (`global.css`). Used one-handed on phones, often outdoors —
this is a real constraint, not a nice-to-have. Applies to every interactive element, including the
shared primitives in `modes.module.css` (`.btnIcon`, `.btnBack`), not just screen-specific buttons.
Where matching the visible glyph size isn't possible without a redesign, grow the tap zone with
padding or `min-height` rather than the visible element — the app's own `--tap-min` comment already
said this; item 36 (2026-08-20) was the first pass that actually checked the shared primitives
against it. Dense secondary-navigation controls (e.g. an A-Z jump index with dozens of targets in a
scrolling strip) are a reasonable, deliberate exception — WCAG 2.5.8 (AA) asks for 24px, `--tap-min`
is this app's own stricter 2.5.5-equivalent target, not a hard floor for every control everywhere.

## 2. Colour

Dual-theme (light default + dark), toggled by swapping a full set of CSS custom properties on
`document.documentElement` (`src/styles/theme.js`, `applyTheme(isDark)`). Components reference
`var(--ssw-*)`, never raw hex — that's what makes the toggle work everywhere at once.

**Except: identity accents may be literals; semantic state must be tokens (item 40).** That
"never raw hex" line reads as absolute and isn't applied that way in practice, nor should it be.
The line that actually matters: a colour carrying *meaning the user needs to read correctly*
(correct/wrong, pass/fail — the same signal reused for a destructive-vs-safe distinction would
count too) must be `var(--ssw-correct)`/`var(--ssw-wrong)` or their `Bg`/`Border` pairs, full
stop, in every mode, because a learner skim-reading results shouldn't have to recalibrate what
green means between screens. A colour that's just *decoration or data* — a topic taxonomy
(`JACMode`'s eight category colours, `ConfusionMode`'s 音/字/意 confusion-type palette), a
mode's own visual identity (`SimulasiMode`'s exam-red buttons, distinct from `--ssw-wrong` even
though it happens to also be red), a per-set accent (`MODE_META.color`) — can stay a literal,
because there's nothing to get inconsistent: nobody is relying on that specific red meaning
"wrong" the way they rely on it meaning "this is the exam-timer mode." When in doubt: if the
colour is answering "is this a good or bad outcome," it's semantic. If it's answering "which
category/mode/set is this," it's identity.

| Token                 | Light                    | Dark                       | Use                          |
| ---------------------- | ------------------------ | --------------------------- | ----------------------------- |
| `--ssw-bg`             | `#FFFDF5`                | `#0D0B08`                   | page background                |
| `--ssw-bgAlt`          | `#FEF9E7`                | `#110E0A`                   | secondary background           |
| `--ssw-surface`        | `rgba(180,83,9,0.06)`    | `rgba(245,158,11,0.055)`    | card fill                      |
| `--ssw-surfaceHover`   | `rgba(180,83,9,0.11)`    | `rgba(245,158,11,0.10)`     | hover state                    |
| `--ssw-surfaceActive`  | `rgba(180,83,9,0.16)`    | `rgba(245,158,11,0.14)`     | pressed state                  |
| `--ssw-text`           | `#1C1917`                | `#FEF3C7`                   | body text                      |
| `--ssw-textBright`     | `#0C0A09`                | `#FFFBEB`                   | headings/emphasis              |
| `--ssw-textMuted`      | `rgba(28,25,23,.72)`     | `rgba(254,243,199,.72)`     | secondary text                 |
| `--ssw-textDim`        | `rgba(28,25,23,.60)`     | `rgba(254,243,199,.58)`     | tertiary text                  |
| `--ssw-textFaint`      | `rgba(28,25,23,.45)`     | `rgba(254,243,199,.42)`     | disabled/hint text             |
| `--ssw-border`         | `rgba(180,83,9,.13)`     | `rgba(245,158,11,.08)`      | default border                 |
| `--ssw-borderLight`    | `rgba(180,83,9,.20)`     | `rgba(245,158,11,.14)`      | subtle border                  |
| `--ssw-borderHover`    | `rgba(180,83,9,.35)`     | `rgba(245,158,11,.25)`      | hover border                   |
| `--ssw-borderActive`   | `rgba(180,83,9,.55)`     | `rgba(245,158,11,.40)`      | focused/active border          |
| `--ssw-amber`          | `#F59E0B`                | `#F59E0B`                   | primary accent (same both)     |
| `--ssw-amberDark`      | `#92400E`                | `#92400E`                   | deep accent (same both)        |
| `--ssw-amberText`      | `#92400E`                | `#F59E0B`                   | amber read as text — differs per theme; amber/amberDark each fail 4.5:1 in one theme, this resolves to whichever passes |
| `--ssw-gold`           | `#FBBF24`                | `#FBBF24`                   | highlight accent (same both)   |
| `--ssw-correct`        | `#16a34a`                | `#16a34a`                   | correct-answer green           |
| `--ssw-wrong`          | `#dc2626`                | `#dc2626`                   | wrong-answer red                |

`--ssw-correctBg`/`Border` and `--ssw-wrongBg`/`Border` are the same green/red at 10%/35% alpha,
same in both themes. Shadow tokens (`--ssw-shadowSm/Md/Lg/Glow/GlowStrong`) and
`--ssw-scrollbar`/`--ssw-inputBg`/`--ssw-navBg` also theme-swap — see `theme.js` directly rather
than duplicating every value here.

**Static tokens** (don't theme-swap, defined once in `global.css`):

- Accent gradient: `linear-gradient(135deg, #92400e, #b45309 50%, #f59e0b)`
- Focus ring: `outline: 3px solid var(--ssw-amber)` + `box-shadow: 0 0 0 7px var(--ssw-textBright)`
  (item 9 — amber alone is 2.11:1 on the light bg, under the 3:1 WCAG 1.4.11 floor for a
  non-text indicator; textBright reads at ~19:1 against effectively any surface in the app,
  so it forms a reliable contrasting band past the outline regardless of local background)

## 3. Typography

- Body/UI: `'DM Sans', 'Noto Sans JP', system-ui, sans-serif`
- Headings/emphasis (used selectively — `pageTitle`, hero numbers, card titles): `'Syne', 'DM
  Sans', sans-serif`

Scale (`global.css`, all `--fs-*`): hero 32px, jp-primary 28px, jp-back 20px, title 17px,
subtitle 15px, body 13px, caption 12px, small 11px, micro 10px, nano 9px. Weights: regular 400,
medium 500, semi 600, bold 700, heavy 800, black 900. Line heights: tight 1.2, normal 1.5,
relaxed 1.75.

## 4. Spacing, radii, shadow, motion

```css
--sp-1: 4px;   --sp-2: 8px;   --sp-3: 12px;  --sp-4: 16px;  --sp-5: 20px;  --sp-6: 24px;
--r-xs: 6px;   --r-sm: 8px;   --r-md: 12px;  --r-lg: 16px;  --r-xl: 20px;  --r-xxl: 24px;  --r-pill: 99px;
--shadow-xs / -sm / -lg / -amber   (see global.css for exact values)
--ease-spring / --ease-smooth      --t-fast: 120ms  --t-base: 200ms  --t-slow: 350ms
```

Use these, not new one-off values — a new spacing/radius number that isn't on this scale is a
signal to double back and pick the nearest token rather than inventing one.

**Z-index scale** (`global.css`) — every deliberate app-chrome stacking decision routes through
this, not a raw number:

```css
--z-base: 1        --z-sticky: 10      --z-banner: 30      --z-nav: 100
--z-overlay: 200    --z-toast: 300      --z-modal: 400      --z-celebration: 500
```

`--z-modal` sits above `--z-toast` deliberately: a confirm dialog is a decision the user must
resolve, a toast is transient and ignorable, so the modal wins if both are on screen at once.
`--z-celebration` is the one intentional "above literally everything" tier — used exactly once, for
the full-screen mission-complete takeover. Local stacking contexts (e.g. `z-index: 1` inside a card
to lift one face above another) are relative to a parent, not app chrome, and stay off this scale —
tokenizing those would be noise.

**Motion and haptics (item 21, 2026-08-25).** Fourteen keyframes exist in `global.css` and
`src/utils/haptic.js` defines five vibration patterns; neither had a stated rule for when each
applies, which meant identical actions felt different depending on which mode you were in.

*Timing:* `--t-fast` for state changes (a button's pressed state, a toggle), `--t-base` for
entrances (a card sliding up, a screen fading in), `--t-slow` reserved for celebration (the mission-
complete takeover). `correctFlash`/`wrongShake` are answer-feedback animations specifically — don't
reach for them for anything else just because they're already defined.

*Haptics:* `haptic.correct()` / `haptic.wrong()` on every answer-commit, app-wide — regardless of
whether the mode renders its answer UI through the shared `OptionButton` or hand-rolls its own.
Audited before writing this rule rather than assumed: `AngkaMode`, `DangerMode`, and `SimulasiMode`
all hand-roll their own option buttons and had no haptic import at all — not a different pattern
from the rest of the app, no pattern. Fixed to match `OptionButton`/`ConfusionMode`/`ProductionMode`/
`QuizProduksiMode`/`DengarMode`, which already had this right. `haptic.tap()` is for neutral
interaction feedback with no correct/wrong dimension (a rating tap in `RatingRow`, the audio-replay
button in `DengarMode`). `haptic.flip()` is `FlipCard`'s own thing — a physical-feeling response to
the flip gesture, not answer feedback, kept distinct on purpose. `haptic.wrong()` again on
`ConfirmDialog`'s confirm button specifically (destructive-confirm) — reused rather than inventing a
sixth pattern for a single call site; it wasn't wired to anything before this item, since
`ConfirmDialog`'s own focus-trap work (item 15) didn't touch haptics. `haptic.success()` remains
defined and unused — no per-mode inconsistency to reconcile (nothing calls it anywhere to be
inconsistent with), and picking a first call site for it (milestone toasts? quiz completion?) is a
product decision this item's audit-and-reconcile scope doesn't cover. Flagging rather than guessing.

*Known gap, not reconciled this pass:* `correctFlash`/`wrongShake` — the visual counterpart to the
haptic fix above — are wired into `OptionButton.module.css` only. The same seven hand-rolled modes
that were missing haptics are also missing this animation on their own answer UI; each has bespoke
option-button styling, so bringing all seven in line is a real per-file CSS pass, not a mechanical
substitution like the haptic fix was. Scoped out of this item rather than done partially or rushed;
a reasonable follow-up if the owner wants full visual parity, not just tactile.

*JS-driven motion needs its own `prefers-reduced-motion` check* — a CSS rule can't reach an API
called from JS. `BottomNav`'s View Transitions crossfade (`document.startViewTransition`) was the
one instance of this in the app and had no such check; fixed (`window.matchMedia`). Worth
remembering for any future JS-invoked animation (the Web Animations API, anything using
`requestAnimationFrame` to drive motion) — the global catch-all in `global.css` only stops
CSS-property-driven animation and transition, nothing invoked imperatively.

## 5. Icon system

Two-tier, defined in `src/components/Icon.jsx`:

1. **Real art** (`ASSETS` map, name → filename in `public/icons/ui/`): rendered as a **CSS
   mask**, not `<img>`. The generated art is single-colour line work on transparency, so its
   alpha channel IS the shape — masking with `background-color: currentColor` means the theme
   drives colour, and dark mode works automatically. This is a **decision worth not
   re-litigating**: switching to `<img>` would freeze the colour and silently break dark mode.
2. **Placeholder** (`SHAPES` map, inline SVG path data): used for any icon name not yet in
   `ASSETS`. Minimal geometric silhouettes, deliberately not finished art — just distinct enough
   to tell modes apart at 20px while real art is pending. Activating a real asset is one line in
   `ASSETS`; nothing else needs to change, and layout doesn't shift when it lands.

**Generated art specs** (for anyone drafting more prompts — full prompt text in
`docs/ASSET-PROMPTS.md`):

- UI icons: 128px, greyscale+alpha, flat 2D vector, uniform 2px stroke, rounded caps/joins,
  amber `#F59E0B` — stroke only.
- Badges: 160px, hexagonal medal outline in amber dark `#92400E` containing one amber `#F59E0B`
  pictogram — same hexagon shape for all.
- **Generator palette drift is expected, not worth re-rolling for.** Icons came back `#FF9100`
  against spec `#F59E0B`; badges came back `#8C3202` against spec `#92400E`. Icons are immune
  because the mask technique discards the art's own colour. Badges were remapped to exact
  palette values by hand during slicing — filled art can't be masked, so if badges ever need to
  adapt to theme, they'd need regenerating as line art, not just reprocessing.
