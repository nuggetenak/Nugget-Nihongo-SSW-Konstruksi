# TASK v4.20.9 — DB-2, DB-3, DB-4, DB-5, ENG-9, ENG-10

**Status:** DONE ✅ | **Effort:** Low | **Depends on:** v4.20.8 DONE (or can be parallel)

## Goal

Fix 4 data file bugs, add pre-build data validator, add audit script.

---

## Step 1 — DB-5: Fix wayground-sets.js header (2 min)

**File:** `src/data/wayground-sets.js` line 1

```js
// BEFORE:
// SSW Flashcards: Wayground Quiz Sets — 12 set soal teknis dari Wayground/sensei

// AFTER:
// SSW Flashcards: Wayground Quiz Sets — 26 sets / 659 questions · track: common(10) + lifeline(16)
```

Commit: `fix(wayground-sets): DB-5 update header — 12 set → 26 sets / 659 questions`

---

## Step 2 — DB-3: Fix sipil/bangunan seed headers (5 min)

**File:** `src/data/sipil-sets.js` — replace lines 1-5:

```js
// BEFORE:
// ─── docs/seeds/sipil-sets-seed.js ────
// SEED DATA for Phase B — Copy to src/data/sipil-sets.js
// 3 sets × 15 questions = 45 questions (minimum viable)

// AFTER:
// ─── data/sipil-sets.js ───────────────────────────────────────────────────────
// 3 quiz sets × 15 questions = 45 questions · track: doboku
// Source: Phase B seed · SIPIL_SETS exported for SipilMode
```

**File:** `src/data/bangunan-sets.js` — same pattern:

```js
// AFTER:
// ─── data/bangunan-sets.js ────────────────────────────────────────────────────
// 3 quiz sets × 15 questions = 45 questions · track: kenchiku
// Source: Phase B seed · BANGUNAN_SETS exported for BangunanMode
```

Commit: `fix(data): DB-3 remove SEED DATA headers from sipil-sets + bangunan-sets`

---

## Step 3 — DB-4: Fix empty source file stale header comments (5 min)

**Files:** All 4 files in `src/data/source/`:

- `cards-doboku.js`
- `cards-kenchiku.js`
- `cards-doboku-vocab.js`
- `cards-kenchiku-vocab.js`

For each file, find and update the header comment:

```js
// BEFORE (varies per file):
// Cards: 58   (or 77, 9, 13)

// AFTER:
// Cards: 0 — content migrated to cards-common.js (v4.18.0)
// Stub preserved for future Ch.5+ content (doboku / kenchiku track)
```

Commit: `fix(source): DB-4 empty source files — update stale card-count headers`

---

## Step 4 — ENG-10: Create `scripts/audit-related-ids.mjs` (10 min)

Create new file:

```js
// scripts/audit-related-ids.mjs
// Cross-ref script: validates related_card_id in JAC data against current CARDS.
// Run: node scripts/audit-related-ids.mjs
// If errors: patch jac-teori.js + jac-lifeline.js to set broken refs → null
import { CARDS } from '../src/data/cards.js';
import { JAC_TEORI } from '../src/data/jac-teori.js';
import { JAC_LIFELINE } from '../src/data/jac-lifeline.js';

const cardIds = new Set(CARDS.map((c) => c.id));
const broken = [];

for (const q of [...JAC_TEORI, ...JAC_LIFELINE]) {
  if (q.related_card_id !== null && !cardIds.has(q.related_card_id)) {
    broken.push({ qId: q.id, badRef: q.related_card_id });
  }
}

if (broken.length) {
  console.log(`❌ ${broken.length} broken related_card_id refs (set to null in data):`);
  broken.forEach((b) => console.log(`  ${b.qId} → card ${b.badRef}`));
  console.log('\nFix: set these related_card_id values to null in jac-teori.js / jac-lifeline.js');
  process.exit(1);
}
console.log(
  `✅ All related_card_id refs valid (${[...JAC_TEORI, ...JAC_LIFELINE].length} questions checked).`
);
```

**Run it now:** `node scripts/audit-related-ids.mjs`

If it reports broken refs, patch `jac-teori.js` and `jac-lifeline.js` — find each broken `q.id` and set its `related_card_id` to `null`.

Known broken card IDs (from pass 12 audit): `32, 49, 115, 181, 190, 193, 195, 198, 200, 256, 268, 321, 629, 630, 658, 747, 748, 749, 750`

For each JAC question whose `related_card_id` is one of those: set it to `null`.

Commit: `feat(scripts): ENG-10 audit-related-ids.mjs + fix DB-2 broken refs`

---

## Step 5 — DB-2: Fix JACMode filterIds guard (2 min)

**File:** `src/modes/JACMode.jsx` — find the filterIds/related_card_id map (around line 84):

```js
// FIND this pattern:
const cardIds = wrongQIds.map((qId) => JAC_OFFICIAL.find((q) => q.id === qId)?.related_card_id);

// CHANGE TO:
const cardIds = wrongQIds
  .map((qId) => JAC_OFFICIAL.find((q) => q.id === qId)?.related_card_id)
  .filter((id) => typeof id === 'number');
```

Commit: `fix(JACMode): DB-2 filter undefined from related_card_id map`

---

## Step 6 — ENG-9: Create `scripts/validate-data.mjs` (15 min)

Create new file:

```js
// scripts/validate-data.mjs
// Pre-build data integrity checker. Called by package.json prebuild.
// Exits 1 if any error found.
import { CARDS } from '../src/data/cards.js';
import { JAC_TEORI } from '../src/data/jac-teori.js';
import { JAC_LIFELINE } from '../src/data/jac-lifeline.js';
import { ANGKA_KUNCI } from '../src/data/angka-kunci.js';
import { existsSync } from 'fs';

let errors = 0;
let warnings = 0;
const cardIds = new Set(CARDS.map((c) => c.id));

// 1. Duplicate card IDs
const seen = new Set();
for (const c of CARDS) {
  if (seen.has(c.id)) {
    console.error(`❌ Duplicate card id: ${c.id}`);
    errors++;
  }
  seen.add(c.id);
}

// 2. Broken related_card_id
for (const q of [...JAC_TEORI, ...JAC_LIFELINE]) {
  if (q.related_card_id !== null && !cardIds.has(q.related_card_id)) {
    console.error(`❌ Broken related_card_id: ${q.id} → card ${q.related_card_id}`);
    errors++;
  }
}

// 3. hasPhoto without asset
for (const q of [...JAC_TEORI, ...JAC_LIFELINE]) {
  if (q.hasPhoto && !existsSync(`public/jac-photos/${q.id}.webp`)) {
    console.warn(`⚠️  hasPhoto:true but no asset: ${q.id}`);
    warnings++;
  }
}

// 4. ANGKA_KUNCI broken kartu refs
for (const a of ANGKA_KUNCI) {
  if (a.kartu !== null && !cardIds.has(a.kartu)) {
    console.error(`❌ ANGKA_KUNCI broken kartu ref: "${a.angka}" → card ${a.kartu}`);
    errors++;
  }
}

// 5. Quiz answer index validity (ans < opts.length) — spot check CARDS type:quiz
const quizCards = CARDS.filter((c) => c.type === 'quiz' && c.ans !== undefined && c.opts);
for (const c of quizCards) {
  if (c.ans >= c.opts.length) {
    console.error(`❌ Card ${c.id}: ans=${c.ans} >= opts.length=${c.opts.length}`);
    errors++;
  }
}

if (errors > 0) {
  console.error(`\n${errors} error(s), ${warnings} warning(s). Fix before build.`);
  process.exit(1);
}
console.log(
  `✅ Data validation passed. ${warnings > 0 ? warnings + ' warning(s).' : ''} Cards: ${CARDS.length}`
);
```

**Wire into package.json** — add `prebuild` script:

```json
"scripts": {
  "prebuild": "node scripts/merge-cards.mjs && node scripts/validate-data.mjs",
  "build": "vite build",
  ...
}
```

**Test it:** `node scripts/validate-data.mjs` — should report hasPhoto warnings and pass.

Commit: `feat(scripts): ENG-9 validate-data.mjs + prebuild hook`

---

## Final Steps

1. `npm run lint` — 0 warnings
2. `npm test -- --run` — all pass
3. `npm run build` — success (prebuild runs validate-data)
4. Bump `package.json` → `4.20.9`
5. Prepend to `CHANGELOG.md`:

```
## [4.20.9] - [DATE]

### fix + feat: data integrity layer

- DB-2: JACMode filterIds guard — filter undefined related_card_id refs
- DB-3: sipil-sets + bangunan-sets SEED DATA headers removed
- DB-4: empty source file headers updated (Cards: 0 + migration note)
- DB-5: wayground-sets.js header — 12 set → 26 sets / 659 questions
- ENG-9: scripts/validate-data.mjs — pre-build data integrity checker (prebuild hook)
- ENG-10: scripts/audit-related-ids.mjs — one-shot cross-ref script; patched 19 broken refs
```

6. Update `_MAP.md` version line → `v4.20.9` + add log entry
7. Push all commits

## Done when

- [ ] DB-5 wayground header fixed
- [ ] DB-3 sipil/bangunan headers fixed
- [ ] DB-4 empty source headers updated
- [ ] ENG-10 audit script created + broken refs patched in JAC data
- [ ] DB-2 JACMode guard added
- [ ] ENG-9 validate-data.mjs created + prebuild hook added
- [ ] lint + tests + build all pass
- [ ] Version 4.20.9 released
