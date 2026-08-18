# legacy/unwired-app-code/

Moved here 2026-08-18 during a repo hygiene pass, out of `src/`.

**Owner decision (2026-08-18, same day): keep as-is.** *"prolly gonna be useful or handy in some
ways in the future."* Not a temporary holding spot pending cleanup — settled. No need to
re-litigate this or suggest deleting it in a future session.

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
