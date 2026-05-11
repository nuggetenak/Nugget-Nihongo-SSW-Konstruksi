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
    cards-doboku.js (stub)
    cards-kenchiku.js (stub)
  cards.js                       ← AUTO-GENERATED — do not edit
  categories.js                  ← taxonomy — edit only if adding new categories
  csv-sets.js                    ← CSV quiz sets (12 sets, 300 qs)
  wayground-sets.js              ← Wayground quiz (26 sets, 657 qs)
  quiz-sets.js                   ← Doboku/Kenchiku quiz (6 sets, 90 qs)
  jac-teori.js                   ← JAC official exam Teori (65 qs)
  jac-lifeline.js                ← JAC official exam Lifeline (30 qs)
  jac-doboku.js (stub)
  jac-kenchiku.js (stub)
  confusion-pairs.js             ← 28 confusion pairs
  danger-pairs.js                ← 20 danger pairs
  angka-kunci.js                 ← 29 angka kunci
  index.js                       ← shim/re-export only

viewer.html                      ← Open in browser to review content
DATA_QUALITY_HANDOFF_v16.md      ← Master task list & specs
_MAP.md                          ← App orientation & codebase overview
CHANGELOG.md                     ← Version history
README.md                        ← App README
README-CONTENT-DQ.md             ← This file
```

**Also present (added by G1, session 11):** `src/hooks/useTrackedCards.js`, `src/components/FilterPopup.jsx`, `src/modes/FocusMode.jsx` — type-based filtering files.

**Not present here:** other `src/modes/`, `src/components/`, `src/storage/`, `src/tests/`, `public/`, `package.json`, etc. — those live on `main` only.

---

## How to use viewer.html

1. Clone this branch locally
2. Open `viewer.html` directly in browser (**Chrome/Edge only** — needs ES module support with local files, or use `npx serve .`)
3. Tabs: Flashcards · CSV Quiz · Wayground · Quiz Sets · JAC Ujian
4. Red/yellow flags on cards = quality issues to fix

> Note: if browser blocks local module imports, run: `npx serve . -p 3000` then open `http://localhost:3000/viewer.html`

---

## Agent instructions

- **Read `DATA_QUALITY_HANDOFF_v16.md` first** — full task list, schemas, rules
- Clone **this branch** (`content-dq`), not `main`
- Cards source edits: edit `src/data/source/cards-*.js`, then run `node scripts/merge-cards.mjs` — wait, **merge script is on main only**. For source card edits in this branch, edit both source AND `cards.js` manually, or note the changes for merge time.
- All other data files: edit directly
- Commit and push to `content-dq` only
- Do NOT push to `main` — that happens at merge time

---

## Merge plan (when all tasks done)

Agent on `main` will:
1. Copy all `src/data/` files from `content-dq` → `main`
2. Update any renamed file imports in `src/modes/`, `src/components/`, etc.
3. Run `npm test` → verify 387 tests pass
4. Bump version + CHANGELOG entry
5. Push to main
