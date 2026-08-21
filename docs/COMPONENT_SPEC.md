# Component Spec — SSW Konstruksi

Stable reference for how components in this codebase are structured. Covers conventions, not
history — if a convention below turns out not to match the code, trust the code and fix this
doc, don't assume the doc is aspirational.

## 1. File organization

CSS Modules, co-located: `ComponentName.jsx` + `ComponentName.module.css` in the same folder,
imported as a scoped object (`import s from './ComponentName.module.css'`, used as
`className={s.thing}`). Mode screens live in `src/modes/`, shared UI in `src/components/`.

## 2. Shared primitives (`src/modes/modes.module.css`, imported as `S`)

Common building blocks every mode screen reuses instead of redefining:

- `.page` — the standard screen wrapper: `max-width: var(--max-w); margin: 0 auto;` plus
  standard padding. This is what makes a screen participate in the responsive width system —
  see `docs/LAYOUT_SPEC.md`.
- `.pageScroll` / `.pageFade` / `.pageCenter` — page variants for scrolling content, fade-in
  entry, and vertically-centered content respectively.
- `.pageTitle` / `.pageSub` / `.sectionLabel` — text hierarchy for screen titles, subtitles, and
  section headers (the latter has a trailing rule via `::after`).
- `.card` / `.cardLg` — the two card sizes. Neither sets its own width — it fills whatever
  container it's in, which is why wide-screen work is almost always about the container, not the
  card (see `docs/LAYOUT_SPEC.md` §3).
- `.row` / `.rowSpread` / `.rowSpreadMb` — flex row primitives; `rowSpread` is
  `justify-content: space-between`, the shape that benefits from Variant A in the grid pattern.
- `.btnBack` / `.btnIcon` / `.btnPrimary` — the three standard button treatments.

Reach for these before writing new CSS that duplicates one — a new one-off `.card`-shaped class
in a component-local module is usually a sign the shared primitive should have been used or
extended instead.

## 3. Icon usage

`MODE_META` (`src/router/modes.js`) is the single source of truth for every mode's icon: each
entry has a `ui` field naming the icon (key into `Icon.jsx`'s `ASSETS`/`SHAPES`, not a filename).
No component keeps its own mode→icon mapping — look it up from `MODE_META`, don't hardcode an
`Icon name="..."` string that duplicates it elsewhere. See `docs/DESIGN_SPEC.md` §5 for the
mask-vs-placeholder rendering mechanics.

```js
export const MODE_META = {
  ulasan: { icon: '🔁', ui: 'ulang', label: 'Ulasan SRS', desc: '...', color: '#22c55e', strand: 'fluency' },
  // ...
};
```

`icon` (emoji) and `ui` (vector icon key) are both present per-entry and used in different
contexts — check which a given screen actually renders before assuming.

## 4. Id-based mapping, not positional

`src/utils/achievements.js`: each achievement is `{ id, icon, badge, ... }` with an explicit
`badge` filename per entry. **This is deliberate and worth preserving** — reordering the
achievements array can't silently shuffle which art shows for which achievement, because nothing
depends on array position. Any future badge/asset/id-keyed data should follow the same shape:
explicit id → asset mapping, not "the Nth item gets the Nth asset."

## 5. Section/Row pattern (SayaTab)

A small local pattern worth reusing anywhere a screen is a list of labeled settings/stats rather
than cards: a `Section` wrapper (title + a `.sectionBody` grid, see `docs/LAYOUT_SPEC.md` §3 for
the grid mechanics) containing `Row` children (`label` left, `value` + optional chevron right,
`onClick` for tap-to-edit). Non-`Row` children (inline-edit forms, destructive actions, custom
blocks) are routed to a full-width span automatically via `:not(.row)` — no per-child JSX needs
to know it's "special," it just needs a different class name than `.row`.

```jsx
<Section title="Pengaturan">
  <Row label="Tema" value={isDark ? '🌙 Gelap' : '☀️ Terang'} onClick={toggleTheme} />
  {editing ? <div className={s.inlineEdit}>...</div> : <Row ... />}
</Section>
```

`Row` renders as a real `<button>` when `onClick` is present, a plain `<div>` when it isn't (item
33, 2026-08-20) — a static display row shouldn't be announced as a control, but a clickable one
needs to be keyboard-reachable, which a bare `<div onClick>` never was. The `.row` class carries UA
button-chrome resets (`background: none; border: none; width: 100%; font: inherit;` etc.) so both
render identically regardless of which element they end up as — extend those resets if `.row` ever
needs new styling, rather than assuming the div-only defaults still apply.

## 6. Inline styles vs. CSS Module classes

Observed pattern, not a strictly enforced rule — both are used throughout, and the split roughly
follows: **inline `style={{ }}`** for values computed at render time (a colour derived from a
score, a dynamic width) or genuinely one-off single-use positioning; **`.module.css` classes**
for anything reused across renders, anything that needs to respond to a media query or the
responsive grid system, or anything with a `:hover`/`:active`/pseudo-element variant (inline
styles can't express those at all). When converting inline styles to a class during other work
(as happened to SayaTab's achievement grid and StatsMode's heatmap wrapper this session), that's
a reasonable opportunistic cleanup, not a required one — don't go looking for inline styles to
convert as a task in itself.

**Only `--ssw-*` tokens are real.** `--c-*` and `--color-*` are two abandoned naming schemes from
before the `--ssw-*` convention settled — nothing defines them, and eleven references shipped
pointing at them anyway with no fallback, silently voiding the declaration rather than erroring
(item 30, 2026-08-20; `scripts/audit-css-vars.mjs` now catches this class of bug in `npm run
validate`). If a `var(--c-...)` or `var(--color-...)` reference is ever found, it's a bug to fix by
repointing at the matching `--ssw-*` token, not a second scheme to keep alive.

## 7. Mode-level chrome (`ModeHeader`)

`src/components/ModeHeader.jsx`, rendered once by `ModeRouter` above every mode's own content —
individual modes never render their own page-title header. Always shows the active mode's identity
(icon from `MODE_META[mode].ui` through `<Icon>`, label as a real `<h1>` — this is the one `<h1>`
every mode screen has), and a breadcrumb trail when `modeHistory` has depth. Every ancestor in the
trail is independently clickable via `AppContext`'s `goBack(targetMode)`, which truncates history to
jump directly to any point in the stack — not just pop one level. On screens under 700px the trail
collapses to just the immediate parent via a CSS-only `display: contents` toggle (no JS breakpoint
detection, matching this app's established convention — see `docs/LAYOUT_SPEC.md`).

Modes still supply their own `.btnBack` for "exit this mode entirely" (a different action from the
trail's "go back one level of mode-to-mode navigation") — the two are not yet consolidated. If a
future pass migrates `.btnBack` into `ModeHeader`, update this section and confirm the two don't
both render for the same action.

## 8. Japanese text rendering (`JpDisplay`)

`src/components/JpDisplay.jsx` is the single component that renders Japanese content — its 6
layout-branch spans and its standalone furigana row all carry `lang="ja"` (item 34, 2026-08-20).
`<html lang="id">` is correct for the app's own interface language, but nothing inside previously
told the browser or a screen reader that any *content* was Japanese — `speak.js` already set
`utt.lang = 'ja-JP'` for text-to-speech, so the gap was markup-only. Matters for two concrete
things: CJK glyph-variant selection (a handful of Han characters render differently in Japanese vs.
Chinese typefaces) and correct screen-reader pronunciation.

Both `<ruby>` sites also carry `<rp>(</rp>…<rp>)</rp>` around their `<rt>`, hidden via `.ruby rp {
display: none }` in normal rendering — degrades to "reading (base)" as plain text in any renderer
without ruby support, rather than losing the reading entirely. See `docs/CARD_CONTENT_SPEC.md` §6
for the `《》` data-encoding convention this component parses into `<ruby>` markup — that section
covers the string format, this one covers what it becomes on screen.

A direct-render fallback exists outside `JpDisplay`: `ErrorBoundary`'s `FlatCardFallback` renders
`card.jp` raw (old-WebView / no-`ResizeObserver` path). It carries its own `lang="ja"` directly
rather than routing through `JpDisplay`, since that fallback is deliberately minimal and doesn't
carry the props (`furi`, `furiganaPolicy`) `JpDisplay` expects.
