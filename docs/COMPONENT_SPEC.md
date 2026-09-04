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

It also owns **the** back control (2026-09-04). Leaving a mode used to be each mode's own job, and
each did it differently: a circular icon button in FlashcardMode, `← Keluar` in ReviewMode,
`← Kembali` in 25 other places, some sticky, most scrolling away with the content — and on a phone,
where AppShell hides the bottom nav in mode chrome, that per-mode button was the only way out. It
calls `goBack()`, which pops one level of mode-to-mode history if there is any and falls through to
`exitMode()` when there isn't, so a single affordance covers both.

Modes still supply their own `.btnBack`, but only for navigation _inside_ a mode — leaving a
running quiz for its own setup screen, closing a source detail. That is a different action from
"leave this mode", and the two no longer render for the same one.

The `<h1>` is set in `--fs-title`, not `--fs-page-title`. It is sticky chrome sharing a row with
the back button and the trail, not content in the body column: at page-title size, 11 of the 21
mode labels were ellipsised at 320px and 3 at 390px (see `DESIGN_SPEC.md` §3). It wraps to at most
two lines as a backstop for a very large Ukuran Teks setting.

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

### 8.1 `furiganaPolicy` adoption (item 43, 2026-08-26)

`JpFront` (the named export from `JpDisplay.jsx` used for headword-style rendering) already
implemented all three `furiganaPolicy` values (`'always'|'tap'|'hidden'`) correctly — the gap was
never in `JpFront` itself, it was that most Japanese-rendering surfaces never called it. Verified
via `grep -rn "furiganaPolicy" src/`: 3 real consumers before this item (`FlashcardMode`→`FlipCard`,
`SprintMode`, and `QuizMode` partially — see below). The plan's own audit named 15 more
(`ReviewMode`, `JACMode`, `VocabMode`, `WaygroundMode`, `SimulasiMode`, `ConfusionMode`,
`DangerMode`, `AngkaMode`, `DengarMode`, `ProductionMode`, `QuizProduksiMode`, `GlossaryMode`,
`SearchMode`, `CatatanMode`, `SumberMode`), 14 of which are fixed by this item (`ReviewMode` is
item 44 — same fix, its own commit, see §8.2). **Two more turned up in a final verification sweep
that weren't in the plan's list at all**, because they're in `src/components/` rather than
`src/modes/` and the audit was mode-scoped: `Dashboard.jsx`'s "recently studied" widget and
`SayaTab.jsx`'s daily-challenge question, both rendering raw `card.jp` with zero processing —
arguably the two most-seen instances of the bug in the app, on the home tab and the settings tab.

**Two decisions made during the sweep, not just bug fixes:**

- **Answer options vs. prompts/review.** Quiz answer options stay stripped
  (`stripFuri`, not `JpFront`) — furigana on the options of a "read this kanji" question gives
  away which option is correct. This does *not* apply to prompts/headwords (nothing to give
  away — the reading isn't the thing being tested) or to any post-answer review/results screen
  (`ProductionMode`, `QuizProduksiMode`, `SimulasiMode`'s review list, `ConfusionMode`'s wrong-list)
  — once the question is graded there's no answer left to protect, and seeing the reading while
  reviewing a mistake is the point. Checked per mode rather than applied as a blanket rule, per
  the plan's own instruction.
- **Compact inline labels stay stripped, not ruby.** `JpFront` computes its own font size from
  text length (`jpFontSize()` in `jp-helpers.js`) and can't be sized down by a caller — there's no
  size-override prop. A handful of sites are dense inline labels (`ConfusionMode`'s wrong-pair
  summary rows, ~11px, term inline with `= definition`) where `JpFront`'s minimum computed size
  and block-ish layout would break a tight row. Those use `stripFuri` (fixes the raw-markup bug,
  correct either way since policy) — no ruby, no `useApp` policy read needed since there's no
  reading being shown at all to gate.

**Retired, not just fixed:** `JACMode`, `VocabMode`, and `WaygroundMode` each had their own local
`showFuri` toggle (`useState(true)`, its own "ふり ON/OFF" pill button), completely disconnected
from the `furiganaPolicy` Settings toggle. Setting the global policy to `'hidden'` for drilling
didn't hide anything in these three specifically — the local toggle silently overrode it. Removed
all three; furigana visibility is one global setting now, not four.

**`QuizMode`'s specific bug** (it "honoured" policy but collapsed `'tap'` into `'always'`,
`furiganaPolicy !== 'hidden'` treating both the same) turned out to be architectural, not local:
`QuizMode` pre-stripped the question and passed a separately-extracted reading as `questionSub`,
a second, shallower implementation of exactly the "detached reading" pattern this item exists to
retire — and `QuizShell` (the shared shell behind `QuizMode`/`JACMode`/`VocabMode`/`WaygroundMode`)
rendered `question`/`questionSub` as plain text with no ruby at all. Fixed at the `QuizShell`
level: it now renders `q.question` via `JpFront` directly, reading `furiganaPolicy` itself via
`useApp()`. `questionSub` wasn't removed — `JACMode` overloads it for an unrelated "show official
question ID" hint toggle, which stays.

**`ReviewMode` (item 44, 2026-08-26):** the last of the 3-out-of-18 gap. Same fix as §8.1 — it
called `stripFuri()` for the headword and separately rendered `extractReadings()` as a detached
`.cardFuri` line underneath (now removed), so a card looked structurally different in daily SRS
review than everywhere else, and on multi-kanji compounds there was no way to tell which reading
belonged to which character. Now renders via `JpFront` like every other surface. Also fixed:
`ReviewMode`'s (and `FlipCard`'s — same bug in the reference component, caught during item 43's
verification sweep) pre-flip `aria-label` was building its accessible name from the raw,
un-stripped `jp` string, so a screen reader announced literal `《reading》` markup syntax instead
of the word. Both now use `stripFuri()`'s output for the label.

**`QuizAnnouncer` — outcome announcements (item 45, 2026-08-26):** the plan's own audit named
`QuizShell` as already having a correct/wrong announcement to extract. **Verified wrong** —
`grep -n "aria-live" src/components/QuizShell.jsx` returns exactly two regions, and neither
announces an answer's correctness: one is question progress ("Soal X dari Y"), the other wraps
the timer display. `OptionButton.jsx` has zero `aria-`/`role` attributes. No mode announced
correct/wrong to a screen reader, including the four `QuizShell`-based modes the plan called
compliant — this was a new capability, not an extraction of an existing one.

`src/components/QuizAnnouncer.jsx` is the shared fix: takes `isCorrect` (`true`/`false`/`null`)
and an optional `correctText`, renders one `sr-only` `aria-live="assertive"` region. Rendered
unconditionally with its text changing between `''`/`'Benar!'`/`'Salah...'` rather than being
mounted/unmounted, matching how `QuizShell`'s own progress region already behaves — the more
reliable pattern for consistent announcement across screen readers. Used by `QuizShell` (fixing
all four modes behind it) and directly by `AngkaMode`, `DangerMode`, `ConfusionMode`,
`DengarMode`, `SimulasiMode`, `ProductionMode`, `QuizProduksiMode`.

**Not used by `SprintMode`.** Its Tahu/Tidak Tahu buttons are self-assessment — there's no
correct answer being checked against a selection, so there's nothing for the announcer to
announce that the user's own tap didn't already convey. Documented inline at the call site,
not just here, so it reads as a decision and not a gap.

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

## 10. Shared constants (item 49, 2026-08-26)

`QUIZ_COUNTS = [10, 20, 30]` (`src/utils/constants.js`) is the question-count picker's single
source of truth — was defined identically in `DengarMode.jsx`, `ProductionMode.jsx`, and
`QuizProduksiMode.jsx`. `QuizMode.jsx` spreads it plus its own dynamic 4th "Semua" option
(category-filtered deck size) rather than duplicating the base array — an explicit deviation,
not a fourth copy.

**Bug found and fixed alongside the dedup, not just a rename:** `prefs.quizQuestionCount` exists
in the storage schema and is described as persisting the picker choice, but only `QuizMode` ever
read or wrote it — `DengarMode`/`ProductionMode`/`QuizProduksiMode` reset to a hardcoded 10 every
session regardless of what the user last picked. Verified via grep before assuming the pref
worked anywhere. All four modes now read the initial count from `prefs.quizQuestionCount` and
write back through `useApp()`'s `setPref` on selection.

## 11. `ResultScreen` adoption + weak-category drilling (items 46, 57, 2026-08-26)

**Verified**: `grep -rln "ResultScreen"` returned only `QuizShell.jsx` before this item. Eight
modes hand-rolled their own finish screen instead, most missing retry-wrong and add-to-SRS
entirely — the two actions that turn a failed session into learning. Now adopted by `AngkaMode`
(both its multiple-choice and typed-input variants), `DangerMode`, `ConfusionMode`, `DengarMode`,
`ProductionMode`, `QuizProduksiMode`, in addition to the four already behind `QuizShell`.

**Field mapping isn't literal-copy-the-old-layout.** `review[].question` renders through
`JpFront` (see §8.1), so it must actually be the Japanese content — for most modes that's
straightforward (the headword being tested), but `ProductionMode`/`QuizProduksiMode` test in
*different directions* (kanji→reading vs. kanji→meaning) and needed the mapping worked out per
mode rather than copied: `question` is always `card.jp`, `correctAnswer` is whichever of
`card.id_text` / the extracted reading actually represents "what should have been produced,"
`userAnswer` stays plain text regardless of direction (it's either already-clean option text or
free-typed input, never re-processed).

**Deliberately not adopted — documented at the call site, not just here** (per the item's own
"Done when: every mode either uses ResultScreen or has a comment saying what it needs that the
shared one can't express"): `SimulasiMode` (pass/fail banner against a 65% threshold, full
sequential answer review — the whole point of an exam simulation) and `SprintMode` (speed/ghost-
race framing, no graded answer to review — same self-assessment reasoning as §"QuizAnnouncer"
above).

**Related bug, found and fixed while here, not itemized separately:** item 43 changed
`QuizShell`'s `q.question` from pre-stripped text to raw `jp` (so the live question could render
as ruby), but never updated `ResultScreen`'s review section, which still rendered `{r.question}`
as bare text. The four `QuizShell`-based modes had been showing raw `《reading》` markup in their
wrong-answer review since that commit. `ResultScreen` now renders `question` through `JpFront`;
`userAnswer`/`correctAnswer` deliberately stay plain text since they're language-dependent per
mode (Japanese for the multiple-choice modes, Indonesian `id_text` for the free-text ones) and
wrapping non-Japanese text in a Japanese-ruby component would be wrong.

**`VocabMode`'s missing `onRetryWrong`**, called out in the plan as a "related, smaller, same
root" issue: the prop wasn't wired at the `ModeRouter.jsx` level at all (not a `VocabMode.jsx`
bug — the component had nowhere to forward a prop it never received). Fixed at both ends.

**Item 57 (weak-category drilling), folded into this item per the plan's own §10** ("nearly
free... do it there rather than as a separate pass"). New: `src/utils/session-weakness.js`,
`findWeakestCategory(wrongRecords)` — deliberately a new, session-scoped helper rather than
reusing `FocusMode`'s `catStats`, which answers a different question (all-time weakness vs. this
session's cluster). Wired into `ResultScreen` as an opt-in `onDrillCategory` prop that computes
its own suggestion from `review[]`'s `category`/`_cardId` fields — callers don't need to
pre-compute anything, and the feature silently doesn't appear when a mode's underlying data
doesn't map to the `CATEGORIES` taxonomy (`AngkaMode`'s numbers, `DangerMode`/`ConfusionMode`'s
curated pairs — verified via their data files, neither has a `.category` field). Also added to
`QuizShell`'s existing `ResultScreen` call, where it only ever activates for `QuizMode` — the
only one of the four `QuizShell`-based modes whose questions carry `_cardId` at all (verified via
grep; `JACMode`/`VocabMode`/`WaygroundMode` don't set it, which is exactly the open question item
47 already flags as unresolved for those three — not resolved here, just not blocking `QuizMode`
from getting the feature).

## 12. Mode-shape feature parity (item 47, 2026-08-26)

Owner decision, made explicit here rather than left as an implicit pattern across 12 files. There
are four quiz *shapes* in this app — not modes, shapes, since several modes share one — and each
shape gets a defined set of features. A mode not having a feature its shape defines is a bug;
a mode not having a feature its shape doesn't define is not.

| Feature | Multiple-choice | Free-text | Timed-exam | Speed-drill |
|---|---|---|---|---|
| Keyboard (1–4 select, Enter/Space advance) | ✅ | ✅ | ✅ | ❌ |
| Haptic (correct/wrong) | ✅ | ✅ | ✅ | ❌ |
| Screen-reader outcome announcement (item 45) | ✅ | ✅ | ✅ | ❌ |
| Pause | ❌ | ❌ | ✅ | ❌ |
| `ResultScreen` (item 46) | ✅ | ✅ | ❌ (own results) | ❌ (own results) |
| SRS / retry-wrong feed | Where `cardId` exists | Where `cardId` exists | Where `cardId` exists | N/A |

**Modes per shape:** multiple-choice = `kuis`/`jac`/`vocab`/`wayground` (via `QuizShell`),
`AngkaMode`, `DangerMode`, `ConfusionMode`, `DengarMode`. Free-text = `ProductionMode`,
`QuizProduksiMode`. Timed-exam = `SimulasiMode`. Speed-drill = `SprintMode`. (`ReviewMode` and
`FlashcardMode` are a different architecture entirely — FSRS-scheduled review and free browsing,
not a quiz shape — already covered in items 43–45, 65, not revisited here.)

**Reasoning per row**, not just the table: keyboard/haptic/announcement are about a *graded*
answer — a moment where the app judges right or wrong. Speed-drill's Tahu/Tidak Tahu is
self-assessment, not a judgment the app makes (same reasoning item 45 already used to exclude it
from `QuizAnnouncer`, extended consistently here rather than re-litigated per feature). Pause
belongs to timed-exam specifically because losing your place mid-exam under time pressure is a
real, disruptive cost that browsing- or drill-shaped modes don't share — and speed-drill's own
timer is core to its challenge (beat the clock), so pausing it undermines the shape's own point,
not a gap in it. `ResultScreen` already excludes timed-exam/speed-drill (item 46) for the same
kind of reason: a pass/fail banner is exam's whole point, ghost-race framing is drill's.

**SRS/retry-wrong is a data question, not a feature-parity one** — this was item 47's own opening
question ("only JACMode feeds SRS — why not vocab/wayground, which are also card-linked?").
Checked rather than assumed: `vocab`/`wayground` draw from hand-curated question sets
(`quiz-sets.js`/`wayground-sets.js`) that were never built with a stable per-question `cardId`
linking back to `CARDS` — unlike `QuizMode`'s `generateQuiz()`, which builds questions
programmatically *from* `CARDS` and always has one. Giving `vocab`/`wayground` real linkage would
mean either manually matching several hundred hand-written questions to `CARDS` entries by content
(error-prone, and a wrong match is worse than no match) or restructuring how those question sets
are authored — a data-migration project, not a UI-parity fix, and disproportionate to what this
item asked for. Left unlinked, documented as a decided exclusion rather than a silent gap.

**Gap actually closed this item:** `DengarMode` was multiple-choice-shaped but missing keyboard
support — the same shape as `AngkaMode`/`DangerMode`/`ConfusionMode`, all three of which already
had it, making its absence here an inconsistency rather than a deliberate difference. Fixed,
reusing the existing `useQuizKeyboard` hook unchanged. Its 1.5s auto-advance-after-answering timer
was refactored into a named, callable function so keyboard's Enter/Space can skip the wait
(previously only reachable by waiting it out) — small usability win for someone drilling quickly
on their phone, in the audience's actual context.

**`SimulasiMode`'s keyboard gap is not fixed here**, deliberately — it's about to be rewritten by
item 48 (free navigation, deferred scoring), which changes its answering flow enough that wiring
keyboard support against the current shape would likely need redoing against the new one. Folded
into that item instead of built twice.

## 13. Immediate vs. deferred feedback (item 48, 2026-08-26)

`SimulasiMode` redesigned from immediate-advance to free-navigate-then-submit, matching how a real
JAC/SSW paper exam actually works: skip a hard question, come back to it, change your mind, submit
whenever you're ready rather than being locked into answering in order.

**The owner delegated the underlying product decision** rather than this staying blocked on further
back-and-forth (explicit: "do the judgment call") — documented here the same way every other
judgment call this session has been, not treated as a special case for being bigger.

**Sequencing question resolved, not deferred.** The plan flagged that this interacts with item 51
(mid-session persistence, not yet built) and said to "decide the order." Reconsidered rather than
just repeating the original caution: the plan's literal wording was "deferring scoring until
submit," which sounds like it defers *saving*, and deferred-saving genuinely would make the
already-tracked mid-session-loss problem worse — more ungraded work sitting in memory before
becoming durable. But that's not what got built. Each answer is still recorded to the `answers`
state the moment it's given or changed — nothing about *saving* is deferred, only the *display* of
correct/wrong. The amount of at-risk, not-yet-persisted work is the same as it always was for this
mode (and every other mode — none of them have had mid-session persistence, that's what item 51
is *for*). Splitting "deferred scoring" into "deferred saving" (the risky half, still item 51's job)
and "deferred feedback display" (the half actually worth building now) meant this didn't need to
wait.

**What "deferred" actually meant, once traced through:** not just delaying the aggregate score.
`OptionButton` reveals correct/wrong the instant an option is selected — using it during play would
have leaked the answer immediately, so `SimulasiMode` moved off the shared component for its
in-progress question buttons (neutral selected/unselected only; `OptionButton` is unchanged, still
used by the other 4 multiple-choice modes) and started rendering its own. The old live ✓/✗ score
tally and the immediate per-question explanation box are both gone for the same reason — an exam
simulation that tells you how you're doing while you're still taking it isn't simulating anything.
Also removed: the `QuizAnnouncer` wiring item 45 added here. That was correct under the old
immediate-feedback design (verified against actual behavior at the time); it stopped being correct
the moment feedback became deferred, so removing it is a necessary revision of that earlier work,
not a contradiction of it.

**Scoring extracted into `src/utils/simulasi-scoring.js`, `buildSimulasiResults(questions, answers)`**
— a pure function, not inlined in the component. This is the one place in the redesign where a
subtle bug (a stale flag trusted instead of recomputed, an off-by-one against free-navigation
order, blank treated as "not counted" instead of "wrong") wouldn't just look wrong — it would
silently misstate someone's actual exam readiness, which matters more here than most UI bugs in
this app. 7 tests, including one that explicitly recomputes `isCorrect` from indices rather than
trusting whatever was stored, and one confirming blank questions score as wrong (matching real-exam
semantics: no credit for a blank, not excused from grading).

**Submit confirms before discarding blanks**, via the existing `useConfirm()` (`ConfirmDialog.jsx`)
rather than new UI: "N questions unanswered, count as wrong same as a real exam — submit anyway?"
Worth flagging rather than treating as a clean reuse: that dialog is explicitly documented in its
own file as being for *destructive* actions (its confirm button is hardcoded to the danger color).
Submitting an incomplete exam isn't destructive in that sense — nothing is deleted, it's a normal,
expected exam action. Reused it anyway rather than building new confirmation UI for one call site;
the message text is written to carry the actual meaning regardless of the button's color, and the
mismatch is a minor visual imperfection, not a functional one.

**Question navigator**: a compact numbered grid (current/answered/unanswered, three visually
distinct states), tappable to jump directly — the free-navigation equivalent of glancing down a
paper answer sheet to see what's left. Prev/Next buttons remain for straightforward linear use;
the navigator is there for the "skip around" case a real exam actually allows.

## 14. Mid-session persistence (item 51, 2026-08-26)

Not in plan §9's doc-update table, added anyway since it meaningfully extends `QuizShell`'s
contract (new optional props) — same judgment item 65 already used for an undocumented-by-plan
but still shared-contract-changing addition.

`src/utils/quiz-persistence.js`: `saveQuizSnapshot`/`readQuizSnapshot`/`clearQuizSnapshot`, plain
functions (not a hook — no `useState`/`useEffect` inside, moved out of `src/hooks/` where it was
first written, into `src/utils/` where this codebase's own convention actually puts it). Deliberately
generic — an arbitrary serializable snapshot under a key, nothing shape-specific — since
`QuizShell`'s `results[]`/`qIdx`/`selected`, `SimulasiMode`'s `answers{}` dict (item 48), and the
hand-rolled modes' own state are all genuinely different shapes; forcing one canonical structure
onto all of them would have been a bigger, riskier change than this item asked for. 30-minute
staleness window — long enough for a real interruption, short enough that a resume prompt for a
three-day-old abandoned quiz would be confusing rather than helpful.

**`QuizShell` gains four new optional props** (`persistKey`, `initialQIdx`, `initialSelected`,
`initialResults`), all defaulting to exactly today's behavior. `JACMode`/`VocabMode`/`WaygroundMode`
don't pass them and are unaffected by this item — verified by running the full suite unmodified,
not just asserted.

**`QuizMode` is the reference implementation**, not full coverage. A real resume needs the exact
question set restored, not just progress markers against a freshly re-randomized quiz — showing
"question 7 of 10, 4 correct" against ten *different* questions than the ones actually answered
would be worse than no resume feature at all. So `QuizMode` persists its `questions` array under
its own key alongside `QuizShell`'s own progress snapshot, and restores both together on resume.
Caught before shipping: exiting mid-quiz, resuming, playing further, then exiting *again* needs to
re-read the latest snapshot at that second exit — trusting the resume prompt's original mount-time
data would show a second prompt with stale, outdated progress.

**Deliberately not extended to `JACMode`/`VocabMode`/`WaygroundMode` or the hand-rolled modes in
this item.** Same underlying pattern would apply, but getting the "exact question set, not just
progress" subtlety right took real care even once — rolling it out to the other 3 `QuizShell`
consumers plus ~8 differently-shaped hand-rolled modes in the same pass risked rushing the parts
that matter (a resume that silently shows the wrong quiz is worse than the crash it's meant to
protect against). One correct, tested reference implementation now; same-pattern follow-up later,
not itemized as a new gap since it's the direct, obvious next step from what's here.

## 15. In-app exit now pops the history entry, not just the hardware back button (item 52, 2026-08-26)

Not in plan §9's table, added anyway per the same judgment items 51 and 65 already used —
`exitMode`'s behavior meaningfully changed.

**The plan framed the blocker as needing "a way to tell 'this update came from our own
`history.back()` call' apart from 'the user pressed back.'`** Verified before assuming that gap
was real: `isPopRef` (`AppContext.jsx`) already solves exactly that, and has since item 10. It just
wasn't being used to *initiate* a pop for in-app exits — only to react to one that had already
happened via the hardware button. The actual missing piece was a way to know it was *safe* to
call `history.back()` at all — new `canPopRef`, true only while the current top-of-stack entry is
confirmed to be the one pushed on mode-area entry, cleared by any real `popstate` (the browser's
position having moved for a reason outside `exitMode`'s own tracking invalidates the assumption).
`exitMode` never calls `history.back()` unconditionally — only when `canPopRef` says it's safe,
falling back to the original behavior otherwise, so an uncertain case can't eject the user out of
the app entirely (no history entry to land on) instead of exiting a mode.

**Found and fixed alongside, not caused by this item**: `onPopState` never cleared `modeParams`,
so even the *original*, unmodified hardware-back button already left it stale when leaving mode
area — this item's tests exposed it, not introduced it.

**Caught by the full test suite, not by review — a real regression in the first design.** The
first version made `exitMode`'s *visible* state update depend on `history.back()` actually
triggering `popstate`, which isn't synchronous and isn't guaranteed same-tick even in real
browsers, and doesn't happen automatically at all in jsdom without explicit test-level mocking.
An existing, unmodified test (`global-keyboard.test.jsx`, "Escape exits the current mode")
started failing — `mode` never became `null` because nothing in the test simulated the async pop.
Redesigned: `exitMode` **always** does the original direct, synchronous state update first (so
nothing depending on `mode` being `null` immediately after calling it can break, matching every
caller's existing expectation), and *additionally* fires `history.back()` when safe — purely to
correct the browser's history depth, never something the visible UI waits on. The eventual
(possibly async) `popstate` this triggers lands on state the direct update already made correct,
so it's a redundant, idempotent update, not a race.

**Honest limit on verification**: the interaction between the direct update's own
`history.replaceState()` (fired by the `[tab, mode]` effect reacting to the state change) and the
separately-in-flight `history.back()` navigation is reasoned through — `replaceState` only changes
the current entry's *content*, not its *stack position*, so a pending back-navigation should still
correctly land one position back regardless of a replace happening in between — but not verifiable
in jsdom, which doesn't implement real session-history navigation timing. Worth a first real-device
check before merge, not just trusting the reasoning.

## 16. Typed-answer diff highlighting (item 60, 2026-08-26)

Not in plan §9's table, added anyway per the same judgment items 51/52/65 already used — a new
shared utility, used across 2 modes.

**Checked the plan's premise before building anything.** "A learner who types a nearly right
answer is just told they're wrong" turned out not quite true — both `ProductionMode` and
`QuizProduksiMode` already showed "Kamu: X" / "Jawaban: Y" as separate facts on a wrong answer.
The real gap was narrower: nothing highlighted *where* the two differed, leaving the learner to
spot their own typo by eye.

`src/utils/typo-diff.js`, `diffChars(input, answer)` — proper alignment (edit-distance dynamic
programming), not naive index-by-index comparison. That distinction matters concretely here: a
single missing or extra letter (an easy, common miss on the audience's actual device — a phone
keyboard) shifts every character after it under naive comparison, making the entire rest of a
correctly-known word look wrong. That's not a spelling lesson, it's actively misleading. 9 tests,
including the plan's own example (isolates to exactly one substitution, not a cascade) and a
textbook edit-distance check (kitten→sitting = 3) as an algorithm-independent correctness anchor.

`src/components/TypoDiff.jsx` renders the diff with highlighting, kept separate from the algorithm
so `diffChars` stays independently testable without a DOM.

**Two different "what to diff against" problems, not one** — `QuizProduksiMode`'s `id_text` can
hold multiple valid synonyms ("Rapat / Pertemuan pagi"), where diffing against the raw combined
string would be nonsensical; its `closestSynonymDiff` splits and picks the nearest one.
`ProductionMode` tests a genuinely different thing (JP↔reading, not JP↔meaning — confirmed by
reading its actual `isCorrect()`, not assumed from the similar file name) — its `closestAnswerDiff`
picks between the kanji form and its kana reading instead, since `isCorrect()` itself accepts
either. Both diff case-insensitively where case isn't semantically meaningful (Indonesian text in
`QuizProduksiMode`) and case-sensitively where it doesn't apply at all (Japanese text in
`ProductionMode` has no case to normalize).

**Only shown for a near-miss** (edit distance 1–3), not any wrong answer — a highlight against a
genuinely different answer would be mostly-red noise, not a lesson. Neither helper is exported or
unit-tested directly (same as the existing, similarly-private `isCorrect`/`norm` in both files) —
the actual algorithmic risk is covered by `typo-diff.js`'s own tests; these are thin, low-risk
selection logic on top of it.

## 17. Dashboard exam-readiness band (item 56, 2026-08-26)

Not in plan §9's table, added anyway per the same judgment items 51/52/60/65 already used.

**Sanity-checked `calcReadiness` before reusing it, per the plan's own explicit ask** ("sanity-
check what it actually measures before surfacing it as a headline — it was written for a stats
page, not a dashboard promise"). Found two real issues, not one design concern:

- **A genuine, unrelated bug**: `calcReadiness` read `streakData?.current`, but the real shape
  (confirmed against `ProgressContext.jsx` and `StatsMode`'s own correct `streakData?.days` a few
  lines from its own call to this function) is `{ days, lastDate }` — no `.current` field exists.
  The streak component (20% of the composite score) has silently contributed **zero** for every
  existing caller (`StatsMode`, `recommend-mode`), always, regardless of anyone's actual streak.
  Fixed at the source, not worked around in a new function — this makes `StatsMode`'s existing
  display more accurate too, not just this item's new use.
- **A design gap specific to this use case**: the quiz-accuracy component used the *all-time*
  average, not recent performance. Fine for a stats page (an honest lifetime number), wrong for a
  dashboard *promise* — someone who struggled early but has since improved substantially would see
  an artificially low score, exactly the "confident-looking wrong number" the plan was worried
  about. Added an optional `recentN` parameter to `calcReadiness` rather than a second function
  duplicating the SRS/streak logic; existing callers don't pass it and are unaffected (verified via
  the full suite passing unmodified for their tests).

**`calcReadinessBand`**: bands into kurang siap / cukup / siap rather than a percentage — the
plan's own strong recommendation, adopted rather than re-litigated, since it was already
well-reasoned. Returns `null` (not a discouraging low band) below a minimum session count — a
band from 2-3 sessions is noise wearing a label, not an assessment. Shown on the dashboard next to
the exam countdown per the plan's framing, suppressed on exam day itself (`daysLeft === 0`) so it
doesn't risk visually contradicting the existing, unconditional "Semangat! Kamu sudah siap 💪"
send-off message with a data-driven claim on a day when there's nothing left to act on anyway.

10 new tests: the streak-bug regression check (a real streak now measurably raises the score),
the band thresholds, the minimum-data gate, and specifically a test proving recency-weighting
actually overcomes a poor all-time average from early sessions — the exact scenario item 56's
plan text was concerned about, verified rather than assumed fixed.
