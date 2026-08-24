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

## 9. Feedback level: toast vs. inline vs. dialog vs. banner (item 16, 2026-08-24)

Four different ways this app tells the user something happened, and the rule for which one a new
call site should reach for:

- **Toast** (`useToast`, `src/components/Toast.jsx`) — transient acknowledgement the user doesn't
  need to act on. A save happened, a milestone landed, an update is available. Self-dismisses;
  losing it costs nothing since it wasn't the only record of the thing it announced. Never the
  right vehicle for something that loses data if missed — see storage-quota below.
- **Inline** — feedback tied to a specific control: field validation, a per-card correct/wrong
  flash, a button's own pending/success state. Appears at the point of interaction, not stacked
  elsewhere on screen, and doesn't compete with unrelated toasts for the same few seconds of
  attention.
- **Dialog** (`useConfirm` / `ConfirmDialog`) — anything requiring a decision before proceeding.
  Blocks until answered; the only one of the four that does.
- **Banner** — persistent state that stays true until it isn't: offline, a storage-quota warning
  still in effect, anything the user should be able to check back on rather than catch in a 3.5s
  window.

**Errors that lose data are never toast-only.** A storage-quota failure (`setQuotaHandler` in
`App.jsx`) was toasting an 8-second warning — a data-loss event given a self-dismissing,
easy-to-miss vehicle. Item 19 moves this to a banner/dialog; flagged here so a future toast call
site doesn't reintroduce the same mismatch for a different data-loss case.

**Toast internals** (`Toast.jsx`, reworked this item — was: silently discarding whatever didn't
fit past 2 concurrent, timers that outlived their toast, `role="status"` fighting an `aria-live`
override to `"assertive"`):

- Concurrent display caps at `MAX_VISIBLE` (2); anything past that queues and appears as a slot
  frees up, rather than being discarded. `show(msg, { priority: true })` jumps the queue —
  useful when two toasts land close together and one matters more (the anxiety-reduction message
  from `useAnswerStreak` and a quota warning racing for the same slot, for instance).
- Each toast owns its auto-dismiss timer via its own effect (mount → set, pause/unmount/id-or-
  duration-change → clear) rather than a hand-tracked timer map — pausing on hover/focus is just
  toggling a state value the effect already depends on, and cleanup on unmount is automatic
  rather than another thing to remember.
- `role="alert"` (implicit assertive) for `type: "error"`, `role="status"` (implicit polite) for
  everything else, no explicit `aria-live` on either — the previous code set an explicit
  `aria-live` that sometimes contradicted the role's own implicit one, which is ambiguous across
  screen readers. Don't add `aria-live` back without removing the role, or the other way around.
- `Escape` dismisses the frontmost (most recently shown) toast, guarded by the same
  `isTypingTarget` check item 31 introduced for the first global key handler — reused, not
  reimplemented (`src/utils/keyboard.js`).
