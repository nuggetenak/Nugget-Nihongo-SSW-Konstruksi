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

## 4b. Second icon sheet — the ten placeholders still on screen

**Re-derived 2026-09-15 (item 183), and the previous version of this section would
have wasted a generation run.** It listed ten cells ending in `ketik`, described
as "a keyboard" — and `ketik` exists in no mode, no `MODE_META.ui` value and no
`SHAPES` entry. That cell would have produced an icon nothing in the app can
render. Meanwhile `info` was genuinely missing and sat orphaned in its own
subsection at the end of this file, outside the sheet.

The list below was derived by comparing every `ui` key the app actually renders
against `Icon.jsx`'s `ASSETS` map, rather than by reading the old list:

```
MODE_META.ui  ∪  ToolStrip's ui   minus   ASSETS  =  the ten below
```

Two of them are among the most-used screens in the app: **`ulang`** is the SRS
review the dashboard badge points at, and **`wisuda`** is the 740-question bank.

_(A note for anyone reading the 7.6.0 plan alongside this: that plan said nine,
and said `tulis` was dead and should be deleted rather than commissioned.
`tulis` is live — `FlashcardMode/ToolStrip.jsx` renders it for the
rating/read-only toggle. Checked rather than taken on trust; the count is ten.)_

| # | Name | Where it renders | Subject |
| --- | --- | --- | --- |
| 1 | `ulang` | Ulasan SRS — the mode the dashboard due-badge points at | two curved arrows forming a closed circle |
| 2 | `wisuda` | Wayground — the 740-question bank | a graduation cap seen front-on |
| 3 | `angka` | Angka Kunci | a 3×3 keypad grid |
| 4 | `peringatan` | Soal Jebak | a warning triangle with an exclamation mark |
| 5 | `arsip` | JAC Teknis, and the archive affordance | a closed front-on file folder |
| 6 | `statistik` | Statistik | three bars of different heights on a baseline |
| 7 | `simpan` | Ekspor | a downward arrow into an open tray |
| 8 | `tukar` | Kosakata | two horizontal arrows pointing opposite ways, stacked |
| 9 | `info` | Tentang Aplikasi | a circled lowercase "i" |
| 10 | `tulis` | FlashcardMode's rating/read-only toggle | a pencil drawing a diagonal line |

### Why two dialects for every prompt

The art is generated externally, and the two models this repo actually uses want
different things:

- **Gemini (incl. Nano Banana Pro 2)** takes conversational, descriptive
  direction and will honour "match this reference sheet" when the twenty
  installed icons in `public/icons/ui/*.png` are passed as image input. Its
  variants therefore lead with the reference and then describe the subject.
- **ChatGPT's image model** responds to an explicit constraint list and does not
  reliably carry a negative block referenced from earlier in a conversation. Its
  variants are structured, and repeat the negatives **by design** — §0's rule 2
  says the fix for generated-looking output is nearly always to repeat the
  negatives, not to add positive description.

Every prompt below carries §1's shared style block verbatim (§0 rule 2: "keep it
verbatim — it is doing most of the work") and honours the three lessons §6
already records: **line art, not filled**, so the icon can be a CSS mask and
inherit the theme; **expect palette drift and do not re-roll for it**, because a
masked icon discards its source colour entirely; and **never let the model invent
CJK**.

---

### 4b-1. The sheet — primary path, both dialects

§0's rule 1 is right and was learned the hard way: icons generated one at a time
drift in stroke weight and optical size. Ask for one grid.

**Gemini**

```
Here are twenty icons from an existing set — please study them first and match
them exactly for stroke weight, optical size, corner radius and overall
temperament.
[ATTACH: public/icons/ui/*.png]

Now draw ONE image: a 3 x 4 grid of 10 NEW icons in that same set, on a
transparent background, with the last two cells of the bottom row left empty.
Even spacing, each icon alone in its own equal cell, all optically the same
weight and size as the reference above.

[PASTE SHARED STYLE BLOCK FROM §1]

All icons in amber #F59E0B, stroke only, no fills.

Reading left to right, top to bottom:
 1  two curved arrows chasing each other around a closed circle
 2  a graduation cap seen front-on, flat board with a tassel hanging right
 3  a 3 x 3 grid of small rounded squares — a numeric keypad
 4  an equilateral warning triangle with an exclamation mark inside
 5  a closed file folder seen front-on, with its tab at the top left
 6  three vertical bars of different heights standing on a baseline
 7  a downward arrow landing in an open tray
 8  two horizontal arrows stacked, pointing in opposite directions
 9  a circle with a lowercase letter i inside it
10  a pencil at a diagonal, drawing a short line from its tip

Each icon must be tellable from the other nine as a black silhouette at 20px.
Cells 11 and 12 stay empty.
```

**ChatGPT**

```
Generate ONE image: a 3 x 4 grid of flat 2D vector icons on a transparent
background. Ten icons; the last two cells are empty. Each icon alone in its own
equal cell, even spacing, all icons optically the same size and the same stroke
weight as each other.

[PASTE SHARED STYLE BLOCK FROM §1]

CONSTRAINTS:
- Stroke only. No fills anywhere. Uniform 2px stroke, rounded caps and joins.
- One colour: amber #F59E0B. No other colour anywhere in the image.
- Each icon drawn on a 20 x 20 grid and legible as a silhouette at 20px.
- Each icon must be distinguishable from the other nine in silhouette alone.
- Transparent background. No cell borders, no grid lines, no labels.

CELL CONTENTS, left to right then top to bottom:
 1  two curved arrows chasing each other around a closed circle
 2  a graduation cap seen front-on, flat board with a tassel hanging right
 3  a 3 x 3 grid of small rounded squares — a numeric keypad
 4  an equilateral warning triangle with an exclamation mark inside
 5  a closed file folder seen front-on, with its tab at the top left
 6  three vertical bars of different heights standing on a baseline
 7  a downward arrow landing in an open tray
 8  two horizontal arrows stacked, pointing in opposite directions
 9  a circle with a lowercase letter i inside it
10  a pencil at a diagonal, drawing a short line from its tip
11  empty
12  empty

NEGATIVE — none of the following may appear:
no gradients, no drop shadows, no soft shadows, no glow, no bevel, no emboss,
no 3D, no isometric, no glossy highlights, no plastic sheen, no skeuomorphism,
no photorealism, no sticker outline, no white background, no background shape,
no text, no letters other than the single lowercase i in cell 9, no numbers,
no Japanese characters, no watermark, no signature, no cell borders,
no colour outside amber #F59E0B.
```

---

### 4b-2. The nine re-rolls, plus the tenth

§6 records the re-roll as the normal outcome rather than the exception: a sheet
comes back with one or two cells wrong and you need **exactly that cell** again,
matched to the ones that were fine. Each prompt below pins the 2px stroke, the
20×20 grid, optical size against the icons already installed, and silhouette
distinctness from its nine neighbours.

For every one of these, the Gemini variant assumes you attach the **good cells
from the sheet you just generated** plus `public/icons/ui/*.png`; the ChatGPT
variant assumes no memory and restates everything.

**The line to reuse verbatim in each ChatGPT re-roll** (call it `[RR]`):

```
Flat 2D vector icon, stroke only, no fills. Uniform 2px stroke with rounded caps
and joins, drawn on a 20 x 20 grid, centred in a square canvas with even padding
on all four sides. One colour: amber #F59E0B. Transparent background. Legible as
a silhouette at 20px. Geometric and mechanical — construction-signage clarity,
not hand-drawn, not playful, not decorative.

NEGATIVE: no gradients, no drop shadows, no soft shadows, no glow, no bevel,
no emboss, no 3D, no isometric, no glossy highlights, no plastic sheen,
no skeuomorphism, no photorealism, no sticker outline, no white background,
no background shape, no text, no letters, no numbers, no Japanese characters,
no watermark, no signature, no colour outside amber #F59E0B.
```

| # | Gemini | ChatGPT |
| --- | --- | --- |
| **1 `ulang`** | "Same set as the attached icons, same weight. One icon: two curved arrows chasing each other around a closed circle, the classic refresh loop. Arrowheads at opposite ends of the circle so it reads as continuous rotation. Nothing inside the circle." | `[RR]` + "SUBJECT: two curved arrows forming a closed circle, arrowheads at opposite ends, reading as continuous rotation. The circle's interior is empty. Must not be confusable with a plain ring or with two separate arrows." |
| **2 `wisuda`** | "Same set, same weight. One icon: a graduation cap seen front-on — a flat square board in perspective over a small rounded crown, with a tassel hanging from the right corner. Read it as a mortarboard, not as a diamond." | `[RR]` + "SUBJECT: a graduation cap (mortarboard) seen front-on — a flat board over a small crown, tassel hanging from the right corner. Must not be confusable with a diamond, an envelope, or a roof." |
| **3 `angka`** | "Same set, same weight. One icon: a 3 x 3 grid of nine small rounded squares, evenly spaced, like a numeric keypad. Empty squares — no digits inside them." | `[RR]` + "SUBJECT: a 3 x 3 grid of nine small rounded squares, evenly spaced, forming a numeric keypad. The squares are empty outlines. Do not draw digits inside them. Must not be confusable with a window or a calendar." |
| **4 `peringatan`** | "Same set, same weight. One icon: an equilateral triangle standing on its base with rounded corners, an exclamation mark centred inside it — a vertical stroke above a dot. This is a construction hazard sign; it should read as one." | `[RR]` + "SUBJECT: an equilateral triangle standing on its base, rounded corners, with an exclamation mark centred inside — a vertical stroke above a separate dot. Must not be confusable with a plain triangle or with a road sign that has a different symbol inside." |
| **5 `arsip`** | "Same set, same weight. One icon: a closed file folder seen front-on, its tab rising at the top left. Flat, rectangular, no papers sticking out, no label." | `[RR]` + "SUBJECT: a closed file folder seen front-on, with a raised tab at the top left. No papers protruding, no label on the front. Must not be confusable with a plain rectangle, a box, or an open folder." |
| **6 `statistik`** | "Same set, same weight. One icon: three vertical bars of clearly different heights standing on a shared horizontal baseline — short, tall, medium, left to right. No axis labels, no grid." | `[RR]` + "SUBJECT: three vertical bars of clearly different heights on a shared horizontal baseline, ordered short / tall / medium from left to right. No axis labels, no gridlines, no numbers. Must not be confusable with an equaliser or with a signal-strength meter." |
| **7 `simpan`** | "Same set, same weight. One icon: a downward arrow landing into an open tray — a wide shallow U below, the arrow above it pointing down into the opening. Read it as save-to-disk / export, not as a download cloud." | `[RR]` + "SUBJECT: a downward arrow landing into an open tray — a wide shallow U shape below, a vertical arrow above pointing down into its opening. Must not be confusable with a cloud-download icon, a floppy disk, or an inbox with mail in it." |
| **8 `tukar`** | "Same set, same weight. One icon: two horizontal arrows stacked one above the other, the top one pointing right and the bottom one pointing left. Equal length, clearly parallel — a swap, not a cycle." | `[RR]` + "SUBJECT: two horizontal arrows stacked vertically, the upper pointing right and the lower pointing left, equal length and clearly parallel. Must not be curved and must not be confusable with a refresh loop or with a transfer icon that has more than two arrows." |
| **9 `info`** | "Same set, same weight. One icon: a plain circle with a lowercase letter i centred inside it — a dot above a short vertical stroke. Calm and geometric; this is the only icon in the set allowed to contain a letter." | `[RR — but strike the phrase \"no letters\" from the negative]` + "SUBJECT: a circle with a lowercase letter i centred inside it: a separate dot above a short vertical stroke. This is the ONLY permitted letter; no other text anywhere. Must not be confusable with an exclamation mark or a question mark." |
| **10 `tulis`** | "Same set, same weight. One icon: a pencil held at a 45-degree diagonal, tip at the lower left, drawing a short straight line away from its tip. Simple body, clear tip, no eraser detail." | `[RR]` + "SUBJECT: a pencil at a 45-degree diagonal, tip at the lower left, with a short straight line drawn away from the tip. Simple body with a clearly tapered tip. No eraser, no hand. Must not be confusable with a pen, a brush, or a ruler." |

**Filenames after slicing** → `ulang, wisuda, angka, peringatan, arsip,
statistik, simpan, tukar, info, tulis` (`.png`, 512×512, transparent).

Activation is unchanged and already documented in §7 — drop the file in
`public/icons/ui/`, add one line to `ASSETS` in `src/components/Icon.jsx`.
**Unlisted names keep their placeholder, so these ten can land one at a time and
the UI is never broken in between.** The mode-to-icon mapping already exists in
`MODE_META`'s `ui` key; nothing else needs touching.

---

### 4c. The maskable PWA icon (item 196)

`public/manifest.webmanifest` lists `icon-192x192.png` and `icon-512x512.png`
**twice each** — once as `purpose: "any"` and once as `purpose: "maskable"`.
They are the same file. A maskable icon is cropped by the platform to whatever
shape it likes (circle, squircle, rounded square, teardrop), and the spec's safe
zone is a centred circle of 80% of the width — so anything in the outer ~10% on
each side can be cut. Feeding an `any` icon in as maskable means Android crops
into the hard-hat logo on the home screen, which is the app's first impression.

This needs **one** new asset: a re-framed version of the existing logo with the
hard hat scaled down inside a filled square. Not a re-drawn logo — §3 is
explicit that the logo already exists and must not be regenerated. The safest
production route is to re-frame the existing `icon-512x512.png` in an image
editor rather than to generate anything at all; the prompts below are for the
case where a generated version is wanted instead.

**Gemini**

```
[ATTACH: public/icons/icon-512x512.png]

Re-frame this exact logo for use as an Android maskable app icon. Do not
redraw it, do not restyle it, do not change its colours — only its framing.

- Square canvas, 512 x 512.
- Fill the entire canvas edge to edge with the logo's own background colour.
  No transparency anywhere.
- Scale the hard-hat mark down and centre it so that the whole mark fits
  inside a centred circle of 80% of the canvas width — roughly 410px across.
  Everything outside that circle must be plain background and nothing else.
- Do not add a border, ring, badge, shadow or new shape of any kind.
- No text, no letters, no numbers.

The test: any circular, squircle or rounded-square crop of this image must
leave the hard hat whole and centred.
```

**ChatGPT**

```
Re-frame an existing app logo as an Android maskable icon. The logo is attached;
reproduce it faithfully — same shape, same colours, same stroke weights. The
only change is framing.

OUTPUT: one square PNG, 512 x 512.

CONSTRAINTS:
- The background fills the whole canvas, edge to edge, in the logo's own
  background colour. No transparency, no alpha anywhere.
- The hard-hat mark is centred and scaled so it fits entirely within a centred
  circle of 80% of the canvas width (≈410px diameter). This is the maskable
  safe zone.
- Outside that safe-zone circle there is plain background and nothing else —
  no ring, no border, no badge, no corner marks, no shadow.
- Do not redraw or restyle the mark. Do not change its colour.

NEGATIVE: no gradients, no drop shadows, no glow, no bevel, no 3D,
no glossy highlights, no sticker outline, no text, no letters, no numbers,
no Japanese characters, no watermark, no signature, no transparency,
no additional decorative elements.

VERIFY BEFORE RETURNING: a circular crop, a squircle crop and a rounded-square
crop of the output must each leave the hard hat whole and centred.
```

**After it lands:** save it into `public/icons/` as **icon-maskable-512x512.png**
(and a 192 if you want one), then point the two `purpose: "maskable"` entries in
`public/manifest.webmanifest` at it instead of at the `any` files.

_(The filename above is deliberately not backticked. `doc-references.test.js`
resolves every backticked repo path in a live doc and failed on this one when it
was — correctly: a backticked path is a pointer a future session follows, and a
pointer at a file that does not exist yet costs that session the time it takes to
work out which of the two is wrong. A file to be CREATED is not a pointer.)_ Check the
result with Chrome DevTools → Application → Manifest, which previews the
maskable crop directly.

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

**Sections 4b and 4c are OPEN, and are prompts rather than art.** They were
re-derived on 2026-09-15 (items 183 and 196) and nothing has been generated from
them yet. 4b's previous version would have wasted a run — see the note at the
head of that section. The ten icons can land one at a time; the maskable icon is
one asset and closes a real defect, since Android is currently cropping into the
hard hat on the home screen.

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

_(The `info` icon had its own prompt here, outside the sheet, from 7.2.0 until
item 183 folded it into §4b as cell 9 — which is where it belongs: an icon
generated alone is an icon that does not match the set, and §0's first rule says
so. `Icon.jsx`'s `SHAPES` still carries the circled-i placeholder until the real
file lands.)_
