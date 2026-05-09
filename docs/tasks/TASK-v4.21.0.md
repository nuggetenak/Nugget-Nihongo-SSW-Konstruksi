# TASK v4.21.0 — REF-8, REF-9, Tests C1-C7
**Status:** READY | **Effort:** Medium | **Depends on:** v4.20.15 DONE

## Goal
Data layer consolidation: merge vocab source files, absorb sipil/bangunan sets, add data integrity tests.

**⚠️ SAFETY FIRST:** This task deletes 6 files. Card IDs NEVER change. SRS data is safe. Do Phase A before Phase B.

---

## Phase A — Run audit scripts (do this first, ship separately if needed)

```bash
node scripts/audit-related-ids.mjs   # should report 0 if v4.20.9 done
node scripts/validate-data.mjs       # should pass
```

If either reports errors, fix them before continuing.

---

## Phase B1 — Merge vocab source files (REF-8)

### Pre-check: confirm no ID collision
```bash
node -e "
import('./src/data/source/cards-common.js').then(a =>
import('./src/data/source/cards-common-vocab.js').then(b => {
  const aIds = new Set(a.S_COMMON.map(c=>c.id));
  const bIds = b.S_COMMON_VOCAB.map(c=>c.id);
  const clash = bIds.filter(id => aIds.has(id));
  console.log('Collisions:', clash);
}));
"
```
Expected: `Collisions: []`

### Merge `cards-common-vocab.js` into `cards-common.js`

1. Open `src/data/source/cards-common-vocab.js`
2. Copy all entries from its export array (233 cards)
3. Append them to the export array in `src/data/source/cards-common.js` (after the last entry, before `];`)
4. Delete `cards-common-vocab.js`

### Merge `cards-lifeline-vocab.js` into `cards-lifeline.js`

Same process (120 cards → append to cards-lifeline.js, delete vocab file).

### Delete empty stub vocab files
- Delete `src/data/source/cards-doboku-vocab.js`
- Delete `src/data/source/cards-kenchiku-vocab.js`

### Update `scripts/merge-cards.mjs`

Find the `inputs` array:
```js
// BEFORE:
const inputs = [
  'cards-common.js', 'cards-common-vocab.js',
  'cards-lifeline.js', 'cards-lifeline-vocab.js',
  'cards-doboku.js', 'cards-doboku-vocab.js',
  'cards-kenchiku.js', 'cards-kenchiku-vocab.js',
];

// AFTER:
const inputs = [
  'cards-common.js',    // common + vocab merged
  'cards-lifeline.js',  // lifeline + vocab merged
  'cards-doboku.js',    // stub — 0 cards
  'cards-kenchiku.js',  // stub — 0 cards
];
```

### Run merge and verify count
```bash
node scripts/merge-cards.mjs
# Should output: Total cards: 1443
```

**If count ≠ 1443: STOP and debug. Do not proceed.**

Commit: `refactor(data): REF-8 merge vocab source files — 8 source files → 6; count 1443 verified`

---

## Phase B2 — Absorb sipil/bangunan sets into quiz-sets.js (REF-9)

### Pre-check: no set ID collision
```bash
node -e "
import('./src/data/quiz-sets.js').then(q =>
import('./src/data/sipil-sets.js').then(s =>
import('./src/data/bangunan-sets.js').then(b => {
  const existing = new Set(q.QUIZ_SETS.map(s=>s.id));
  [...s.SIPIL_SETS, ...b.BANGUNAN_SETS].forEach(set => {
    if (existing.has(set.id)) console.log('COLLISION:', set.id);
    else console.log('OK:', set.id);
  });
})));
"
```
Expected: all OK (sipil-01/02/03, bangunan-01/02/03 don't conflict with wt*/wg*/wp*/ct*/cp*)

### Update `src/data/quiz-sets.js`

Current content:
```js
import { WAYGROUND_SETS } from './wayground-sets.js';
import { CSV_SETS } from './csv-sets.js';
export const QUIZ_SETS = [...WAYGROUND_SETS, ...CSV_SETS];
export const getQuizSetsForTrack = (track) =>
  QUIZ_SETS.filter((s) => s.track === 'common' || s.track === track);
```

New content:
```js
import { WAYGROUND_SETS } from './wayground-sets.js';
import { CSV_SETS } from './csv-sets.js';
import { SIPIL_SETS } from './sipil-sets.js';
import { BANGUNAN_SETS } from './bangunan-sets.js';

// Add track field to sipil/bangunan sets (they had no track field before)
const SIPIL_WITH_TRACK = SIPIL_SETS.map(s => ({ ...s, track: 'doboku' }));
const BANGUNAN_WITH_TRACK = BANGUNAN_SETS.map(s => ({ ...s, track: 'kenchiku' }));

export const QUIZ_SETS = [...WAYGROUND_SETS, ...CSV_SETS, ...SIPIL_WITH_TRACK, ...BANGUNAN_WITH_TRACK];

export const getQuizSetsForTrack = (track) =>
  QUIZ_SETS.filter((s) => s.track === 'common' || s.track === track);
```

### Fix `src/modes/SipilMode.jsx`

```js
// BEFORE:
import { SIPIL_SETS } from '../data/sipil-sets.js';

// AFTER:
import { getQuizSetsForTrack } from '../data/quiz-sets.js';
// ...inside component:
const SIPIL_SETS = getQuizSetsForTrack('doboku');
```

### Fix `src/modes/BangunanMode.jsx`

```js
// BEFORE:
import { BANGUNAN_SETS } from '../data/bangunan-sets.js';

// AFTER:
import { getQuizSetsForTrack } from '../data/quiz-sets.js';
// ...inside component:
const BANGUNAN_SETS = getQuizSetsForTrack('kenchiku');
```

### grep check before deleting
```bash
grep -rn "sipil-sets\|bangunan-sets\|SIPIL_SETS\|BANGUNAN_SETS" src/ --include="*.jsx" --include="*.js"
```
Must show 0 results before deleting files.

### Delete files
- Delete `src/data/sipil-sets.js`
- Delete `src/data/bangunan-sets.js`

Commit: `refactor(data): REF-9 absorb sipil/bangunan sets into quiz-sets.js; fix SipilMode + BangunanMode imports`

---

## Phase C — Data Integrity Tests (C1-C7)

Create `src/tests/data-integrity.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { CARDS } from '../data/cards.js';
import { QUIZ_SETS, getQuizSetsForTrack } from '../data/quiz-sets.js';
import { SOURCE_GROUPS, SOURCE_META } from '../data/categories.js';
import { JAC_TEORI, JAC_LIFELINE } from '../data/index.js';

describe('Data Integrity', () => {
  // C1: SOURCE_GROUPS keys in SOURCE_META
  it('C1: all SOURCE_GROUPS keys exist in SOURCE_META', () => {
    const metaKeys = new Set(Object.keys(SOURCE_META));
    SOURCE_GROUPS.forEach(g => {
      g.keys.forEach(k => {
        expect(metaKeys.has(k), `"${k}" missing from SOURCE_META`).toBe(true);
      });
    });
  });

  // C2: related_card_id integrity
  it('C2: all related_card_id refs point to valid cards', () => {
    const cardIds = new Set(CARDS.map(c => c.id));
    const broken = [...JAC_TEORI, ...JAC_LIFELINE]
      .filter(q => q.related_card_id !== null && !cardIds.has(q.related_card_id));
    expect(broken.map(q => `${q.id}→${q.related_card_id}`)).toHaveLength(0);
  });

  // C3: every QUIZ_SETS set has track field
  it('C3: every set in QUIZ_SETS has a track field', () => {
    const missing = QUIZ_SETS.filter(s => !s.track);
    expect(missing.map(s => s.id)).toHaveLength(0);
  });

  // C4: no _origIndex in CARDS
  it('C4: no _origIndex in CARDS', () => {
    const withOrig = CARDS.filter(c => '_origIndex' in c);
    expect(withOrig.map(c => c.id)).toHaveLength(0);
  });

  // C5: CARDS count matches expected
  it('C5: CARDS count is 1443', () => {
    expect(CARDS.length).toBe(1443);
  });

  // C6: no duplicate card IDs
  it('C6: no duplicate card IDs', () => {
    const ids = CARDS.map(c => c.id);
    const seen = new Set();
    const dupes = ids.filter(id => seen.has(id) || !seen.add(id));
    expect(dupes).toHaveLength(0);
  });

  // C7: all quiz answers valid index
  it('C7: quiz answer index < opts.length for all quiz cards', () => {
    const bad = CARDS.filter(c =>
      c.type === 'quiz' && c.ans !== undefined && c.opts && c.ans >= c.opts.length
    );
    expect(bad.map(c => `id:${c.id} ans:${c.ans} opts:${c.opts?.length}`)).toHaveLength(0);
  });

  // C8: getQuizSetsForTrack('doboku') includes sipil sets
  it('C8: getQuizSetsForTrack doboku includes sipil sets', () => {
    const sets = getQuizSetsForTrack('doboku');
    expect(sets.some(s => s.id.startsWith('sipil'))).toBe(true);
  });

  // C9: getQuizSetsForTrack('kenchiku') includes bangunan sets
  it('C9: getQuizSetsForTrack kenchiku includes bangunan sets', () => {
    const sets = getQuizSetsForTrack('kenchiku');
    expect(sets.some(s => s.id.startsWith('bangunan'))).toBe(true);
  });
});
```

Commit: `test(data): Tests C1-C9 — data integrity suite`

---

## Final Steps
1. `npm run lint` — 0 warnings
2. `npm test -- --run` — all pass (C1-C9 should all be green)
3. `npm run build`
4. Bump → `4.21.0`, update CHANGELOG + _MAP.md, push

## Done when
- [ ] vocab files merged (count 1443 verified)
- [ ] sipil/bangunan sets absorbed into quiz-sets.js
- [ ] SipilMode + BangunanMode imports fixed
- [ ] sipil-sets.js + bangunan-sets.js deleted (grep clean)
- [ ] Tests C1-C9 all pass
- [ ] All tests pass; version 4.21.0
