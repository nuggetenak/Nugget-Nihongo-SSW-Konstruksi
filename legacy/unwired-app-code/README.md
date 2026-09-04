# legacy/unwired-app-code/

Moved here 2026-08-18 during a repo hygiene pass, out of `src/`.

**Owner decision (2026-08-18, same day): keep as-is.** *"prolly gonna be useful or handy in some
ways in the future."* Not a temporary holding spot pending cleanup — settled. No need to
re-litigate this or suggest deleting it in a future session.

**Update (item 55, 2026-09-04): `FilterPopup.jsx` and `.module.css` are gone from here — they
graduated to `src/components/`.** The blocker recorded below ("wiring this up would need
`FlashcardMode`'s filtering to grow beyond its current single-category search-string convention
(`__cat:${key}`) to a real multi-category set — a small filtering-state change, not a drop-in")
was exactly right, and that state change is what item 55 did. Two things changed on the way in:
the sheet chrome now comes from `Sheet.jsx` (focus trap + Escape, which this never had), and
counts are computed from the deck passed in rather than the global `CARDS`, so a deck scoped by
`filterIds` reports its own numbers.

Removed rather than left here as a second copy. The owner decision below stands and is not being
re-litigated — it is about **unwired** code, and this file stopped being unwired. Keeping an
aging duplicate of a live component is the failure mode this repo has already paid for once (four
copies of the card corpus, two silently stale; see `CHANGELOG.md` 2026-09-04). The other two files
here are untouched.

**Update (item 18, 2026-08-24):** `FilterPopup.jsx` here was replaced with the current `main`/
`feat/ui-overhaul` version, which had diverged from this snapshot (`VOCAB_SOURCES.includes(c.source)`
replacing an older `c.type === 'vocab'` check, plus formatting) — the copy here was stale relative
to the schema the rest of the app now uses. Its `.module.css` was added alongside it (the original
move only carried the `.jsx`). It was still a genuine zero-consumer file on `feat/ui-overhaul`
too — not a `content-dq`-only artifact like its two companions turned out to be (see below) — so
`src/components/FilterPopup.jsx` and `.module.css` were removed from there rather than left
ambiguous a third time (`docs/UI_UX_PLAN.md` item 18). It stays functionally interesting (a real
category-picker grid with live counts, not a duplicate of `FlashcardMode/FilterBar.jsx`'s search
input), but wiring it up would need `FlashcardMode`'s filtering to grow beyond its current
single-category search-string convention (`__cat:${key}`) to a real multi-category set — a small
filtering-state change, not a drop-in, so out of scope for this item. If a future session wants to
wire this in, start there.

## What this is

Three React files (`FilterPopup.jsx`, `useTrackedCards.js`, `FocusMode.jsx`) that were sitting
in `src/components/`, `src/hooks/`, `src/modes/` with **zero references anywhere** in this
branch's tracked code or docs, and import paths that don't resolve on `content-dq`:

- `FilterPopup.jsx` → `../styles/theme.js`, `./FilterPopup.module.css` (neither exists here)
- `useTrackedCards.js` → `../contexts/ProgressContext.jsx` (doesn't exist here)
- `FocusMode.jsx` → `./SprintMode.jsx`, `./modes.module.css` (neither exists here)

`content-dq` has no `package.json`, no build config, no `App.jsx` — it's a data/content-focused
working branch (see `HANDOFF.md`), not a buildable app checkout. These 3 files can't run here
regardless of wiring.

## Why they weren't just deleted

Their dependencies (`theme.js`, `ProgressContext.jsx`, `SprintMode.jsx`) **did exist** in this
branch's git history at some point and were removed in an earlier, apparently-incomplete
scaffold-trimming pass. These three were touched as recently as session 24 (2026-07-26, the
same commit that dropped Doboku/Kenchiku scope — see `useTrackedCards.js`'s own docstring),
which reads more like "swept along in a broader find-and-replace for consistency" than
"deliberately kept." Given that ambiguity, moving rather than deleting seemed like the safer
call — recoverable in one step if there's a reason they should exist here, easy to actually
delete later if not.

If you're reading this and wondering whether these are meant to be live app code: they belong
on `main` (where `theme.js` etc. presumably do exist), not here — but the owner has decided to
keep this copy on `content-dq` regardless, so leave it in place.

**Confirmed, not just presumed (2026-08-24):** on `feat/ui-overhaul`, `useTrackedCards.js` and
`FocusMode.jsx` are both live, imported, exercised-by-tests code — genuinely orphaned only from
`content-dq`'s narrower, data-focused checkout, not orphaned in the real app. `FilterPopup.jsx`
is the one file of the three that really was (and still is, elsewhere) unwired everywhere — see
the item-18 update above.
