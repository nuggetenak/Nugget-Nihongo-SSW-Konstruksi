# SSW Konstruksi — Content DQ Branch

**Branch:** `content-dq`
**Purpose:** Isolated workspace for all content/data quality work.
**Merge target:** `main` (after all quality tasks complete)

---

## What's in this branch

```
src/data/                        ← all content files (edit here)
  source/                        ← card source files (edit these, NOT cards.js)
    cards-common.js
    cards-lifeline.js
  cards.js                       ← AUTO-GENERATED — do not edit
  categories.js                  ← taxonomy — edit only if adding new categories
  jac-mockup-sets.js             ← ⚠️ LEGACY MONOLITHIC (ex-csv-sets.js, renamed P17) — for routine content edits, use sets/jac-mockup/*.js instead, gets rebuilt into this file at merge time. EXCEPTION: structural changes (renames, field-name changes) must touch both layers immediately, same as this P17 rename did — a stale monolith breaks the running app right away, unlike a routine content fix which just waits for the next rebuild.
  wayground-sets.js              ← ⚠️ LEGACY MONOLITHIC — DO NOT EDIT. Working copy: sets/wayground/**/*.js
  quiz-sets.js                   ← aggregator only (session 24+): `QUIZ_SETS = [...WAYGROUND_SETS, ...JAC_MOCKUP_SETS]` — no own content or working-copy folder since Doboku/Kenchiku removal, edit via wayground-sets.js / jac-mockup-sets.js instead
  sets/                          ← ✅ WORKING SPLIT FILES — edit these
    jac-mockup/  jml01–jml06.js, jmt01–jmt06.js  (renamed P17, ex sets/csv/ cp*/ct*)
    wayground/
      teori/      wt01–wt10.js
      vocab/      wtv01.js
      lifeline/praktik/   wgl01–wgl10.js
      lifeline/vocab/     wglv-jp-01–03.js, wglv-id-01–03.js (P16 split, ex wglv01-05)
    jac/    jac-teori.js, jac-lifeline.js
  jac-teori.js                   ← JAC official exam Teori (65 qs)
  jac-lifeline.js                ← JAC official exam Lifeline (30 qs)
  jac-official.js                ← backward-compat shim: `[...JAC_TEORI, ...JAC_LIFELINE]`
  confusion-pairs.js             ← 28 confusion pairs
  danger-pairs.js                ← 20 danger pairs
  angka-kunci.js                 ← 29 angka kunci
  index.js                       ← shim/re-export only

viewer.html                      ← Open in browser to review content
HANDOFF.md                       ← Single-file relay baton: state, active tasks, rules, protocol (docs/archive/ has everything it superseded)
_MAP.md                          ← App orientation & codebase overview
CHANGELOG.md                     ← Version history
README.md                        ← App README
README-CONTENT-DQ.md             ← This file
```

**Also present (added by G1, session 11):** `src/hooks/useTrackedCards.js`, `src/components/FilterPopup.jsx`, `src/modes/FocusMode.jsx` — type-based filtering files.

**Not present here:** other `src/modes/`, `src/components/`, `src/storage/`, `src/tests/`, `public/`, `package.json`, `HUSKY-SETUP.md`, `scripts/`, etc. — those live on `main` only. (README.md at repo root describes the full app including these — if you're only working `content-dq`, most of that doc doesn't apply to what's actually checked out here.)

---

## How to use viewer.html

1. Clone this branch locally
2. Open `viewer.html` directly in browser (**Chrome/Edge only** — needs ES module support with local files, or use `npx serve .`)
3. Tabs: Flashcards · CSV Quiz · Wayground · Quiz Sets · JAC Ujian
4. Red/yellow flags on cards = quality issues to fix

> Note: if browser blocks local module imports, run: `npx serve . -p 3000` then open `http://localhost:3000/viewer.html`

---

## Agent instructions

- **Read `HANDOFF.md` first** — it's a single relay file now (session 23): current state, active tasks, open decisions, rules, and the protocol for keeping it honest. Superseded docs are in `docs/archive/` if you need the old detail (e.g. full original P0–P17 rationale is in the archived `PROGRESS.md`).
- Run `node scripts/verify-content.mjs` before trusting any number in `HANDOFF.md` and again before updating it — no `npm install` needed, it's dependency-free
- Clone **this branch** (`content-dq`), not `main`
- Cards source edits: edit `src/data/source/cards-*.js`. There's no merge script on this branch (`scripts/` other than the verify script is `main`-only) — update `cards.js` by hand too (mirror edit), then run the verify script before committing.
- All other data files: edit directly
- Commit and push to `content-dq` only
- Do NOT push to `main` — that happens at merge time

---

## Merge plan (when all tasks done)

Agent on `main` will:
1. Copy all `src/data/` files from `content-dq` → `main`
2. Update any renamed file imports in `src/modes/`, `src/components/`, etc.
3. **W1 storage migration:** Wayground set IDs renamed (wg/wp → wgl/wglv/wtv). Bump `STORAGE_VERSION` (currently 4 → 5) and add migration in `migrations.js` to remap stored wgScores keys.
4. Run `npm test` → verify 457 tests pass (41 files)
5. Bump version + CHANGELOG entry
6. Push to main
