# Asset Prompts — SSW Konstruksi UI Overhaul

Prompt pack for generating UI art externally (Nano Banana Pro 2 / ChatGPT), to be
dropped into `public/icons/ui/` and activated via the `ASSETS` map in
`src/components/Icon.jsx`. Until then everything renders as a geometric
placeholder, so the app is fully usable with zero assets present.

---

## 0. Read this first — three things that decide whether the output is usable

**1. Generate each group as ONE sprite sheet, not as separate images.**
Icon sets generated one-at-a-time drift: stroke weights wander, optical sizes
disagree, corner radii change. Asking for a single labelled grid forces the model
to hold one style across the whole set. Split the grid afterwards.

**2. The "made by ChatGPT" tell is almost entirely gradients, soft drop shadows,
faux-3D bevels, and glossy highlights.** Every prompt below has a hard negative
block killing those. Keep it verbatim — it is doing most of the work. If output
still looks generated, the fix is nearly always to repeat the negatives, not to
add more positive description.

**3. Never let the model invent Japanese or Indonesian text.** Generated CJK is
reliably malformed and this is a language-learning app for people who cannot yet
spot the error. Every prompt says no text. Real text is rendered by the app.

---

## 1. Shared style block

Paste this into every prompt in sections 2–4.

```
STYLE: Flat 2D vector icon. Uniform 2px stroke weight, rounded caps and joins.
Geometric and mechanical, drawn on a consistent grid — construction-signage
clarity, not hand-drawn or playful. Single flat colour, no fills unless stated.
Transparent background. Centred in a square canvas with even padding on all
four sides. Legible as a silhouette at 20px.

PALETTE (use exactly, no other colours):
  amber        #F59E0B
  amber dark   #92400E
  near-black   #3B2408
  cream        #FFFDF5

NEGATIVE — do not produce any of these:
no gradients, no drop shadows, no soft shadows, no glow, no bevel, no emboss,
no 3D, no isometric, no glossy highlights, no plastic sheen, no skeuomorphism,
no photorealism, no sticker outline, no white background, no background shape,
no text, no letters, no numbers, no Japanese characters, no watermark,
no signature, no colour outside the palette above.
```

---

## 2. Navigation + mode icons — ONE sprite sheet

Covers every `SHAPES` key in `Icon.jsx`. Generate as a single sheet, then slice.

```
Generate ONE image: a 5 × 4 grid of 20 flat vector icons on a transparent
background. Even spacing, each icon in its own equal cell, all optically the
same size and stroke weight.

[PASTE SHARED STYLE BLOCK]

All icons in amber #F59E0B, stroke only.

Grid contents, left to right, top to bottom:
 1  house, simple pitched roof — "home"
 2  open book, front-on — "study"
 3  single person bust in a circle-less silhouette — "profile"
 4  a flashcard: rounded rectangle with a divider line near the top
 5  question mark inside a circle
 6  lightning bolt, angular
 7  clipboard with two horizontal lines
 8  document with lines and a pencil across the lower right corner
 9  shield with a check mark inside
10  five-pointed star
11  notebook with a spiral binding on the left
12  speaker with two sound arcs
13  magnifying glass
14  three dots in a horizontal row
15  flame, simple two-curve silhouette
16  concentric-circle target with a centre dot
17  calendar page with a header bar and two hanging rings
18  arrow pointing right
19  hard hat, side profile — construction safety helmet
20  wrench crossed with a screwdriver

Each icon must be immediately distinguishable from the other 19 in silhouette.
```

**Filenames after slicing** → `home, belajar, saya, kartu, kuis, sprint, jac,
simulasi, ujian, bintang, catatan, suara, cari, more, api, target, kalender,
panah, helm, alat` (`.png`, 512×512, transparent).

---

## 3. App logo / PWA icon — ALREADY EXISTS, DO NOT REGENERATE

Needs to work at 48px on an Android home screen and survive maskable-icon
cropping, so keep the mark well inside the safe area.

```
A flat vector app icon mark. A stylised hard hat viewed from the side,
constructed from clean geometric arcs, with a single diagonal hazard stripe
band across the helmet body. Solid amber #F59E0B helmet on a cream #FFFDF5
rounded-square background, hazard stripe in near-black #3B2408.

[PASTE SHARED STYLE BLOCK — but ignore "transparent background", this one
has the cream rounded-square background]

The mark must sit fully within the centre 70% of the canvas so it survives
circular and squircle cropping. Bold, high contrast, readable at 48px.
Square, 1024×1024.
```

Also request: **a transparent-background version with no rounded square** for
in-app header use.

**Files** → `logo-maskable.png` (1024), `logo.png` (1024, transparent),
`favicon.png` (256).

---

## 4. Achievement badges — ONE sprite sheet

The Saya tab has 14 achievement slots, currently rendering greyed-out
placeholders. These are the only assets allowed a second flat colour, since
locked/unlocked needs to read at a glance.

```
Generate ONE image: a 5 × 3 grid (14 used, last cell empty) of flat vector
achievement badges on a transparent background.

[PASTE SHARED STYLE BLOCK]

Each badge is a hexagonal medal outline in amber dark #92400E containing one
simple amber #F59E0B pictogram. Same hexagon for all 14 — only the inner
pictogram changes. No ribbons, no banners, no laurels.

Inner pictograms, in order:
 1  a single sprout with two leaves
 2  a stack of three bricks
 3  a half-filled circle
 4  a hard hat
 5  a flame
 6  a calendar page
 7  a lightning bolt
 8  a graduation cap
 9  a target with centre dot
10  a clipboard
11  a leafy branch
12  a tree
13  a mountain peak
14  a trophy cup
```

**Files** → `badge-01.png` … `badge-14.png` (512×512, transparent).

---

## 5. Onboarding illustration

Fixes the large empty gap on the welcome screen (visible in the current
build). Wider than tall so it fills horizontal space on a phone.

```
A flat vector illustration, wide 3:2 landscape composition, transparent
background. A simplified construction site skyline: two scaffolding towers of
different heights, a low-rise building outline between them, and a crane arm
reaching in from the right. Drawn entirely in clean geometric lines.

[PASTE SHARED STYLE BLOCK]

Line work in amber dark #92400E at uniform 2px weight. Three or four small
solid amber #F59E0B accent shapes only — do not fill large areas. Generous
negative space. Calm and orderly, not busy. No people, no vehicles, no text,
no signage lettering.
```

**File** → `onboarding-hero.png` (1536×1024, transparent).

---

## 4b. Second icon sheet — 10 modes still on placeholders

The first sheet covered navigation and common actions. Ten study modes are
still rendering geometric placeholders. Same shared style block, same rules.

```
Generate ONE image: a 5 x 2 grid of 10 flat vector icons on a transparent
background. Even spacing, each icon in its own equal cell, all optically the
same size and stroke weight.

[PASTE SHARED STYLE BLOCK]

All icons in amber #F59E0B, stroke only.

Grid contents, left to right, top to bottom:
 1  two curved arrows forming a circle — refresh / repeat
 2  graduation cap, front-on
 3  a grid of four squares — a number pad
 4  warning triangle with an exclamation mark
 5  a file folder, closed, viewed front-on
 6  bar chart with three bars of different heights on a baseline
 7  downward arrow into an open tray — save / export
 8  a pencil drawing a line, diagonal
 9  two horizontal arrows pointing opposite ways, stacked — swap
10  a keyboard: wide rounded rectangle with small key marks

Each icon must be distinguishable from the other 9 in silhouette.
```

**Filenames after slicing** -> `ulang, wisuda, angka, peringatan, arsip,
statistik, simpan, tulis, tukar, ketik` (`.png`, 512x512, transparent).

Activate them the same way: drop into `public/icons/ui/`, add one line each to
the `ASSETS` map in `src/components/Icon.jsx`. The mode-to-icon mapping already
exists in `MODE_META` (the `ui` key), so nothing else needs touching.

---

## 6. Status — what has landed

Sections 2 and 4 are **done**. Sheets were generated, sliced, and installed:

- 20 UI icons → `public/icons/ui/` (128px, greyscale+alpha, ~7KB each)
- 14 badges → `public/icons/badges/` (160px, ~3.5KB each)

Two notes from processing them, useful for the remaining sections:

**The generator drifted off-palette** — icons came back `#FF9100` and badges
`#8C3202` against the specified `#F59E0B` / `#92400E`. Expect this; it is not
worth re-rolling. Icons were immune because they render as CSS masks (colour
comes from `currentColor`, the art's own colour is discarded). Badges were
remapped to exact palette values during slicing.

**Ask for line art, not filled art, wherever possible.** Single-colour line work
on transparency can be used as a mask, which means it inherits the theme and
adapts to dark mode for free. The filled two-tone badges cannot — their colour
is baked in and will not respond to the theme. If badges ever need to work in
dark mode, regenerate them as single-colour line art.

**Section 5 (onboarding illustration) is done** — installed at
`public/illustrations/onboarding-hero.png` (1024px, ~52KB). Line colour came
back `#8F2E01` and was snapped to `#92400E` during processing. It is filled
line art, so it cannot be masked; dark mode gets a CSS brightness lift instead
of a second asset, which would be dead weight on a slow connection.

**Section 3 (logo) is NOT needed.** The app already ships a hard-hat logo at
`public/icons/icon-*.png`, wired into `index.html` as favicon and
apple-touch-icon. It is now also used on the onboarding screen. Do not
regenerate it — section 3 below is retained only for reference.

---

## 7. Activating an asset

Drop the file in `public/icons/ui/`, then add one line to `ASSETS` in
`src/components/Icon.jsx`:

```js
export const ASSETS = {
  kartu: 'kartu.png',
  kuis: 'kuis.png',
};
```

Unlisted names keep their placeholder, so assets can land one at a time without
ever leaving the UI in a broken state. Sizing, spacing, and colour are already
handled by the component — the art just needs correct alpha and square framing.

**Before committing any asset:** run it through an optimiser (`oxipng`,
`squoosh`). This app is offline-first for users on unreliable mobile
connections, and unoptimised 1024px PNGs will undo that. Icons should land
well under 10KB each.
