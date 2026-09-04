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

Scale (`global.css`, all `--fs-*`, rem since 2026-08-31 — see below): hero 32px,
jp-primary 28px, jp-back 20px, page-title 22px, title 17px, subtitle 15px, body 13px,
caption 12px, small 11px, micro 10px, nano 9px. Weights: regular 400, medium 500, semi
600, bold 700, heavy 800, black 900. Line heights: tight 1.2, normal 1.5, relaxed 1.75.

`--fs-page-title` (2026-08-31): the app's actual page-title heading role — BelajarTab,
SayaTab, Dashboard's (mostly desktop-only, see below) `<h1>`, and every individual mode
screen via `modes.module.css`'s shared `.pageTitle`. Existed as a de facto convention
(22px, weight 800) before it existed as a token: SayaTab and every mode screen had
already independently converged on it, BelajarTab and Dashboard's h1 had drifted to
24px/900 without anyone deciding they should differ. Named and unified rather than
introducing a new size — confirmed live (Playwright, computed styles) which value was
actually the majority before picking one. Dashboard's own instance is `display: none` on
mobile/tablet (a casual greeting header takes its place there) and only becomes visible
at the 1040px breakpoint once the side nav takes over the brand slot — so this specific
mismatch was invisible below desktop width and would only have become a visible problem
as desktop use grows, which is exactly the direction this app is now headed (see
`docs/LAYOUT_SPEC.md`'s "expand to all devices" note).

**Wide breakpoint (≥1040px) reads larger, not just wider (item 22).** The overhaul solved
width comprehensively (`--max-w` widens, grids reflow) but not density — 13px body text at
arm's length from a monitor reads small, and hero type sized to anchor a phone screen is
modest on a desktop dashboard. Inside the same `@media (min-width: 1040px)` block that
already redefines `--max-w`: hero 36px, jp-primary 30px, jp-back 22px, page-title 26px,
title 18px, subtitle 16px, body 14px, caption 13px, small 12px. Micro/nano stay put —
badge and fine-print scale, not reading scale, more likely to sit in a fixed-dimension
container where even 1px risks overflow, and less central to what "wide-screen reading
comfort" is actually about. Compact and medium are unchanged; every consumer of these
tokens gets the wide values for free, no per-component edits, same mechanism `--max-w`
already proved.

`jpFontSize()` (`src/utils/jp-helpers.js`) needed its own fix, not just the tokens above — it's a
length-based ladder that drives `JpDisplay`'s actual rendered size via an inline style, and never
read `--fs-jp-primary`/`--fs-jp-back` to begin with. Since `JpDisplay` is the primary JP rendering
path in this app, bumping only the CSS tokens would have had no visible effect on most real card
content. Gained the same 1040px check (`window.matchMedia`, duplicating the breakpoint number
since JS can't read a media query out of a stylesheet — if `min-width: 1040px` above ever moves,
this needs to move with it) and a wide ladder matching the static bump per rung (28→30 same delta
as jp-primary, 20→22 same as jp-back, and so on) so the two scales move together rather than
drifting into two different answers for "how much bigger is wide." Ruby annotations
(`.ruby rt`, `JpDisplay.module.css`) are sized in `em` relative to their parent JP text, so they
scale proportionally with both of the above automatically — no separate ruby-specific fix needed,
verified by reading the actual rule rather than assumed. Ruby's own em-multiplier (0.44, not the
W3C-documented-default 0.5) is a deliberate, working value tuned for this content's density —
checked against the spec, left alone rather than "corrected" to match it; a smaller-than-half
ratio is a normal choice for compound-kanji readings, not a bug.

**`jpFontSize()`'s upward scaling for short strings needs a ceiling in dense lists — `maxSize`
(`JpFront`, 2026-08-28, swept to every remaining call site 2026-08-31).** 28px on mobile for a
≤4-character string is right for a single hero card (a flashcard front, a review-mode question) but
reads as random size-jumping once several `JpFront` instances share a list or grid — a 2-character
answer hitting the ceiling right next to a 12-character one at a much smaller tier. `maxSize` is an
opt-in prop precisely because the two contexts need opposite defaults; every `.map()`-rendered list
and every side-by-side grid pairing in the app now passes it (`JP_LIST_MAX`/`JP_LIST_MAX_SECONDARY`,
`src/utils/jp-helpers.js`, plus two mode-local constants in `ConfusionMode.jsx` for its two other
shapes of the same problem) — audited by tracing each of the ~30 live `<JpFront` call sites
individually, not by pattern-matching class names. Single-item hero contexts (`FlipCard.jsx`,
`SprintMode.jsx`, `ReviewMode.jsx`'s active-card front, and others) are deliberately left uncapped —
that's the one case `maxSize` exists to leave alone.

**Ruby rendering (`renderJPWithRuby`, `JpDisplay.jsx`) was rewritten 2026-08-31 — parse-then-
reindex replaced with a single forward pass.** The old implementation parsed `《reading》` markers
once against the source string, then re-located each parsed fragment in a (possibly different)
render-target string via `indexOf`. Whenever a fragment's kanji base repeated earlier in the same
string as ordinary unmarked text, `indexOf` silently found the wrong, earlier occurrence — audited
against every string in `src/data`, not just the one reported case, and found genuinely wrong ruby
placement in real shipped content. The same regex also required kanji touching `《` directly, so
the (real, common) alternate convention of marking a whole conjugated word including its okurigana
(見切る《みきる》, ~870 occurrences across `src/data`) was never matched at all — silently dropped
in some render paths, left as literal bracketed text in others. `renderJPWithRuby` now walks the
source text once, so a match is always exactly where its own regex match landed; a validated
trailing-hiragana group splits back into plain okurigana after the ruby rather than being folded in
or dropped. Full detail and the exact fix shape: see the function's own doc comment and
`src/tests/ruby-audit-round3.test.jsx`, a corpus-wide sweep that renders every real `《`-bearing
string in the shipped data through the actual function.

**Round 4, same day.** The round-3 sweep verifies the renderer never produces garbage for any real
string; it can't verify the renderer produces the *right* output, since it doesn't independently
know what "right" is for a given string — a different property, and the reason a passing sweep
still shipped with two more real bugs. Both found by testing live rather than by re-running the
existing automated checks: (1) a content-data bug — a handful of card `jp` fields had multiple
terms' readings accidentally concatenated into one marker (root-caused, 26 cards fixed at the data
source, not papered over in the renderer); (2) kanji+katakana loanword compounds
(移動式クレーン, 冷却コイル — ordinary vocabulary in this domain) were never matched at all, since
the trailing-kana group only recognized hiragana. Both `renderJPWithRuby` and `parseRubyFragments`
now branch by script: hiragana keeps exact-match validation against the reading's tail (reliable,
since real okurigana readings are phonetic echoes of hiragana already in the text); katakana is
always kept combined with the kanji as one ruby span using the full reading, since exact-match
validation is unreliable across scripts (readings are written in hiragana; a katakana chōonpu like
クレーン's ー doesn't literally appear in its own hiragana transliteration くれえん — same sound,
different characters, so string comparison isn't the right tool here regardless of how careful the
implementation is).

**The `rem` question — resolved 2026-08-31, was deferred.** Every `--fs-*` token is now `rem`, not
`px` — responds to a user's browser/OS font-size preference. The original deferral (item 53, this
item) gave three reasons: touching ~89 consuming stylesheets; this app caring less about the
benefit than a reading-heavy site would, since pinch-zoom already covers the mobile case regardless
of unit; and needing care around ruby's `em` sizing and `jpFontSize()`'s own ladder. Revisited
because the third reason's premise didn't hold once actually traced: ruby's `em` computes from its
parent's *inline* font-size (always a raw px number from `jpFontSize()`, never one of these custom
properties), and `jpFontSize()` itself is independent JS, so neither interaction touches this change
at all. The ~89-file number turned out to be a verification surface, not an edit surface — every
consumer only ever reads `--fs-*` via `var()`, confirmed by grep, so the ~20 lines that define the
tokens were the entire change.

> **Corrected 2026-09-04.** That grep can only have covered stylesheets. 297 inline
> `fontSize: <px>` values lived in JSX across 28 files and none of them read a token, so the whole
> point of this conversion — text that responds to a reader's OS font-size setting — reached the
> shell and missed nearly every mode screen; the same text was also frozen at phone sizes on
> desktop while everything around it grew at the 1040px breakpoint. 254 of the 297 matched a token
> exactly and are now migrated. The 43 that don't (14, 16, 18, 24, 36, 48, 64px) are left alone,
> same judgment as item 68 — and are now the only inline sizes in the app, which makes them easy to
> find. **When checking a claim like "every consumer uses the token", grep the JSX too**: in this
> app, inline `style={{}}` is where most of the type lives. No custom root font-size exists anywhere in this app, so every
computed value is pixel-identical to before at default settings; verified live (Playwright) that
forcing a larger root font-size now actually scales these tokens, which it structurally could not do
before. The app-shell/pinch-zoom reasoning is still true and still a fair tradeoff either way — the
scope estimate was the thing that changed, not the underlying judgment call.

**Self-hosted, subsetted fonts (item 61, 2026-08-26).** All three families used to load from
`fonts.googleapis.com`/`fonts.gstatic.com`. Verified before changing anything: all three (DM Sans,
Noto Sans JP, Syne) are SIL Open Font License 1.1, confirmed against each project's own repository
and the copyright notice embedded in the font files themselves (not assumed from "most Google
Fonts are OFL") — OFL explicitly permits subsetting under its MODIFICATION clause. Attribution and
the full license text: `public/fonts/LICENSE.txt`.

**Why self-host at all, and why this app is a good fit for it.** A CDN font only reaches the cache
after one successful online load — first run on a network that blocks external CDNs, or ordinary
`CACHE_FONTS` eviction under storage pressure, means the app falls back to system fonts
indefinitely. Naively self-hosting the full families would have made this worse, not better: Noto
Sans JP's full glyph set alone is multiple megabytes, and Google Fonts only avoids shipping all of
it by slicing dynamically per request. But this app's Japanese content is fixed and known — 1,438
cards, shipped in-repo — so the exact glyph set it can ever need is computable, unlike a
general-purpose site.

**How the subset was built, and verified — not just assumed to work.** Every `.js` export in
`src/data/` was walked (not just `cards.js` — the first pass, scoped to just that file, would have
missed real content in `confusion-pairs.js`/`danger-pairs.js`/`angka-kunci.js`/the JAC and Wayground
sets, caught by broadening the scan and finding 1,327 unique JP-range characters where `cards.js`
alone only had 990). Refined to a second pass classifying by *which field* a character came from
(`jp` vs. everything else) rather than only its Unicode block, after the first pass's block-based
split put Greek letters used for real construction/electrical notation (Φ for pipe diameter, seen
inside actual `jp` field content) into the wrong font's subset. Padded with a safety margin (full
hiragana/katakana, CJK punctuation, halfwidth/fullwidth forms, circled numbers) as insurance
against the regex-based literal extraction missing something built via string interpolation. Two
unrelated, pre-existing data bugs turned up during this process and were *not* fixed there (out of
scope for a font item) but were flagged: Kangxi Radical codepoints (e.g. `⽅`, U+2F45) instead of
the correct CJK ideograph (`方`, U+65B9) for a handful of characters — visually near-identical,
semantically wrong; and one card's `usage` field with a Cyrillic а/р typo'd into
"gamb**а****р**kan" (should be Latin).

**Both fixed 2026-09-04.** 21 Kangxi occurrences (`⽅`/`⾓`/`⾯`/`⽳`) in `wayground-sets.js` and the
one Cyrillic pair. They had survived because search, sort and every audit treat the look-alike and
the real character as unrelated while the screen shows no difference at all — and because they sat
in quiz data, which `audit-integrity.mjs` never reads (it only walks the CARDS corpus).
`scripts/audit-data-text.mjs` now scans every file under `src/data/` for both codepoint ranges, so
the class can't return; verified by reintroducing one and watching it fail.

Final verification was against each *source* font's own actual coverage, not a blind character-
count check: comparing subsetted-font coverage to source-font coverage catches only genuine
subsetting bugs, not "this font never had emoji glyphs anyway" false positives (regular text
webfonts don't ship color emoji; those already render via OS-level fallback, unchanged by this
item). Result: **zero characters dropped by subsetting** across all four Noto Sans JP weights, DM
Sans, and Syne. Both DM Sans's and Syne's variable weight axes survived subsetting intact.

**Payload**: 1.44 MB total across all 6 files (4 Noto Sans JP weights + DM Sans + Syne, all woff2),
precached at install (see PWA_RELEASE_SPEC.md §2) rather than fetched opportunistically. Compared
against naively self-hosting the full, unsubsetted source families (18.11 MB) — a 92% reduction,
confirming the plan's own hypothesis that this corpus is a good fit for exact subsetting rather
than generic CDN slicing.

Build process: `scripts/generate-precache.mjs`, run via `postbuild` — see item 62 below, done
together since both touch the same "what's guaranteed offline" question. Regeneration process (if
the corpus grows enough to need it) is documented at the top of that script and in
`public/fonts/LICENSE.txt`; not wired as a live build step since it depends on `fonttools`
(Python), a one-time/occasional regeneration tool rather than a JS-toolchain runtime dependency.

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

*Closed (item 50, 2026-08-26):* `correctFlash`/`wrongShake` — the visual counterpart to the haptic
fix above — were wired into `OptionButton.module.css` only. Verified against this exact record
before starting: the "seven modes" figure above was for *haptics*, which can fire on any answer-
submission event regardless of UI shape. This animation needs an actual clickable option element
to apply to, which narrows the real count to four: `AngkaMode`, `DangerMode`, `ConfusionMode`,
`DengarMode` — genuinely hand-rolled multiple-choice buttons with color-only feedback and no
animation. Checked and deliberately excluded the rest: `SimulasiMode` already renders through the
shared `OptionButton` component (gets the animation for free, wasn't actually missing it despite
being named in the plan's "eight hand-rolled modes" count); `ProductionMode`/`QuizProduksiMode`
are free-text with a reveal *panel*, not options, and already carry their own `scaleIn` entrance
animation — a different shape, not a gap; `SprintMode`'s button colors are a static affordance
("this button means Tahu"), not a reactive correct/wrong state, so there's no reveal moment to
animate. Each mode's own `animation` property reuses the same two `global.css` keyframes
`OptionButton` already uses — no new keyframes, no new CSS file.

*JS-driven motion needs its own `prefers-reduced-motion` check* — a CSS rule can't reach an API
called from JS. `BottomNav`'s View Transitions crossfade (`document.startViewTransition`) was the
one instance of this in the app and had no such check; fixed (`window.matchMedia`). Worth
remembering for any future JS-invoked animation (the Web Animations API, anything using
`requestAnimationFrame` to drive motion) — the global catch-all in `global.css` only stops
CSS-property-driven animation and transition, nothing invoked imperatively.

**Landscape and reach (item 23, 2026-08-25).** Two related mobile-ergonomics rules, not yet stated
anywhere before this.

*Landscape is a height problem, not an orientation one.* `@media (max-height: 480px)`, not
`(orientation: landscape)` — a height query also catches a small phone held normally, and correctly
leaves a tall tablet alone even if some tablet somewhere reports landscape. Measured before
touching anything, per the plan's own instruction: a landscape phone is roughly 360px tall; `.page`
padding (24px), `ModeHeader` (padding + margin), and `FlipCard`'s 230px `min-height` alone summed
past that before `RatingRow` was even counted — this wasn't a hypothetical, the card was already
overflowing on paper. Compressed all three (`FlipCard.module.css`, `modes.module.css`'s `.page`,
`ModeHeader.module.css`) at that breakpoint. Each override is appended after the rule it overrides
in its file, not placed earlier — a media query earlier in a stylesheet than the base rule it's
meant to override loses that rule in source order once the query matches, since both have equal
specificity and CSS resolves ties by position, not by which one has a condition attached.

*Reach: destructive/rare controls may live in the top third; frequent ones belong in the lower
half where a thumb reaches one-handed.* `FlashcardMode` already follows this (bottom-anchored
rating row) without ever stating it; stated now so it's a rule future modes can be checked against,
not a pattern only visible by example. The one clear top-third *frequent* control in the app is
`ModeHeader`'s back button (item 11) — but it already has two reach-free alternatives that satisfy
the underlying need without requiring the reach at all: the hardware/gesture back button (item 10)
and `Escape` (item 20's keyboard layer). The principle is about a *frequent action having some
alternative to reaching the top third*, not about every top-positioned control needing to physically
move — a back button with a working hardware-back equivalent already satisfies that without
relocating anything.

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

## 6. Offline-dependent affordances (item 25, 2026-08-25)

Almost everything in this app is genuinely local — cards, SRS, quizzes, all of it. Two things
aren't: the Web Speech API (`src/utils/speak.js`) may depend on a network voice depending on the
platform, and `src/utils/gist-sync.js` needs the network outright. Before this item, both could
fail with no explanation — a card in `DengarMode` that just never made a sound, a Gist push that
surfaced only a raw fetch error.

**The rule:** an offline-dependent control reads `useOnlineStatus()` (`src/hooks/useOnlineStatus.js`
— one shared hook now; `OfflineBanner.jsx` used to have this state inline with no other consumer)
and says what's unavailable and why, rather than failing without explanation. Two different
shapes depending on whether the failure is *predictable* or not:

- **Deterministic (gist-sync):** a network request either has a network or it doesn't — checked
  before attempting, not caught after. `ExportMode`'s Gist buttons disable with a `title` tooltip
  and a persistent inline explanation while offline, and the handler itself also checks first
  (defense in depth against a race between the check and the click).
- **Not reliably predictable (speech synthesis):** whether a given voice works offline depends on
  whether the OS/browser has a local voice installed for that language — there's no standardised,
  reliably-supported way to know this in advance (`SpeechSynthesisVoice.localService` exists on
  some browsers but isn't consistent enough to gate a UI on). Guessing wrong in either direction
  is worse than not guessing: a false "this won't work" hides audio that would have played fine: a
  false "this will work" is the exact silent-failure this item exists to fix. `speakJP()` instead
  takes an `onError` callback wired to the utterance's real `onerror` event — report an actual
  failure when one happens, don't predict one. `DengarMode` pairs this with an honest, hedged
  offline note ("audio usually still works if your device has an offline Japanese voice") rather
  than a hard warning, and a toast (once per session, not once per failed card) if a real failure
  fires.

**Scope, stated rather than left implicit:** `speakJP()` is called from six files; only
`DengarMode` got the toast-on-failure treatment. It's the plan's own named example and the one
mode where audio is the exercise itself — you're blocked without it, not just missing a
supplementary tap-to-hear affordance the way a flashcard's speaker icon is. The other five
(`QuizShell`, `ProductionMode`, `GlossaryMode`, `ReviewMode`, `QuizProduksiMode`) still call
`speakJP()` exactly as before — no `onError`, so a failure there is exactly as silent as it was
before this item. A reasonable follow-up if silent audio failure turns out to matter in those
modes too, not a gap discovered and left unmentioned.

`SideNav`'s footer ("kartu · siap offline") was the one specific claim the plan named — narrowed
to "konten siap offline" so it reads as a claim about the card content specifically, not the
whole app's every feature.

**`--ssw-onAmber` contrast token (item 64, 2026-08-26).** Plan described 21 sites hardcoding
`#fff` where this token (`#1a0a00`, for text on flat `--ssw-amber` backgrounds) should be used.
Verified before fixing anything, rather than trusting the count: found 15 hardcoded `#fff`/`white`
declarations total in the whole codebase (not 21), and checked each one's actual background —

- **1 genuine match**: `CatatanMode.jsx`'s save button, flat `var(--ssw-amber)` background. Fixed.
- **11 are correctly white already** — dark overlays (`rgba(0,0,0,0.6-0.72)`), the danger-red
  `ConfirmDialog`/`DataWarningBanner` variants, a blue `OfflineBanner`, a per-item dynamic-color
  badge (`BelajarTab`'s `featuredBadge`, background is `sm.color` — varies per mode, not amber-only,
  so `--ssw-onAmber` would be wrong there specifically even though white is a reasonable universal
  choice across arbitrary brand colors).
- **2 are on an amber-derived *gradient*, not the flat token** (`Dashboard.module.css` via
  `--accent`, `Onboarding.module.css`'s track-selector background) —
  `linear-gradient(135deg, #92400e, #b45309 50%, #f59e0b)`. Deliberately **not** swapped to
  `--ssw-onAmber`: that token's very dark value (`#1a0a00`) was designed and presumably checked
  against the *flat* `#F59E0B`, not this gradient's much darker brown stop (`#92400e`) — dark text
  on dark brown is poor contrast, so blindly applying the "fix" here risked making it worse, not
  better. Needs its own check (possibly a second, gradient-aware token) rather than reusing this
  one on an unverified assumption that "amber-family" is close enough.
- **1 unrelated finding, not fixed here**: `Onboarding.module.css`'s
  `.trackCard[data-active='true'] .trackLabel` turns text white on selection, but the card's
  background (`var(--ssw-surface)`) never changes for the active state — no amber, no dark
  overlay, nothing that would justify white text specifically. Doesn't look like a contrast bug in
  practice (worth a screenshot check, not assumed), but the rule itself doesn't parse as intentional
  either. Flagged for a future small item, out of scope for the token question this item is about.
