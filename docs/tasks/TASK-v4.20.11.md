# TASK v4.20.11 — N24, N25: Direct Import Fixes
**Status:** DONE ✅ | **Effort:** Low | **Depends on:** can be done any time after v4.20.9

## Items
- **N24** (P2) — `VocabMode.jsx` imports `WAYGROUND_SETS` directly → misses 300 CSV questions
- **N25** (P3) — `JACMode.jsx` + `SimulasiMode.jsx` import `JAC_OFFICIAL` directly (not via barrel)

---

## Step 1 — N24: Fix VocabMode import

**File:** `src/modes/VocabMode.jsx`

Find (line ~8):
```js
import { WAYGROUND_SETS } from '../data/wayground-sets.js';
```

Replace with:
```js
import { QUIZ_SETS, getQuizSetsForTrack } from '../data/quiz-sets.js';
```

Then find every usage of `WAYGROUND_SETS` in the file:
- Replace `WAYGROUND_SETS.filter(...)` → `getQuizSetsForTrack(track).filter(...)`
- Or if filtering by track isn't done yet: `QUIZ_SETS.filter(s => s.track === 'common' || s.track === track)`

Check what the component does with the sets — it likely filters by track or just uses all. Apply whichever filter matches the original intent.

After change: run `npm test -- --run` to verify.

Commit: `fix(VocabMode): N24 — use QUIZ_SETS; includes 300 CSV questions in vocab pool`

---

## Step 2 — N25: Fix JACMode + SimulasiMode barrel imports

**File:** `src/modes/JACMode.jsx` line ~7:
```js
// BEFORE:
import { JAC_OFFICIAL } from '../data/jac-official.js';

// AFTER:
import { JAC_OFFICIAL } from '../data/index.js';
```

**File:** `src/modes/SimulasiMode.jsx` line ~5:
```js
// BEFORE:
import { JAC_OFFICIAL } from '../data/jac-official.js';

// AFTER:
import { JAC_OFFICIAL } from '../data/index.js';
```

Commit: `fix(imports): N25 — JACMode + SimulasiMode use data/index.js barrel for JAC_OFFICIAL`

---

## Final Steps
1. `npm run lint` — 0 warnings
2. `npm test -- --run` — all pass
3. `npm run build` — success
4. Bump `package.json` → `4.20.11`
5. Prepend CHANGELOG:
```
## [4.20.11] - [DATE]

### fix: direct-import corrections
- N24: VocabMode — WAYGROUND_SETS → QUIZ_SETS (includes 300 CSV questions in vocab pool)
- N25: JACMode + SimulasiMode — JAC_OFFICIAL via data/index.js barrel
```
6. Update `_MAP.md` version line + log entry
7. Push

## Done when
- [ ] VocabMode uses QUIZ_SETS
- [ ] JACMode + SimulasiMode use barrel
- [ ] Tests pass; version 4.20.11
