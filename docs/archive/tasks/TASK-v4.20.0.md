# TASK v4.20.0 — X1, X2: P0 Critical Bugs

**Status:** DONE ✅ | **Effort:** Low | **Depends on:** nothing — start here

---

## X1 — VocabMode crashes on load: ReferenceError

**File:** `src/modes/VocabMode.jsx` lines 13–19

`MIX_ALL` is defined at **module scope** but references `VOCAB_SETS`, which is declared **inside the component**. This causes `ReferenceError: VOCAB_SETS is not defined` on module load — VocabMode is completely inaccessible.

**Fix:** Move `MIX_ALL` inside the component body, below the line where `VOCAB_SETS` is declared.

```js
// FIND (at module scope, before export default function VocabMode):
const MIX_ALL = { ...VOCAB_SETS.reduce(...), title: `${totalSoal} Soal Campur` };

// FIX: Delete the module-level line.
// INSIDE the component, AFTER VOCAB_SETS is declared:
const MIX_ALL = { ...VOCAB_SETS.reduce(...), title: `${totalSoal} Soal Campur` };
// (keep the exact same content, just move it)
```

Commit: `fix(VocabMode): X1 — move MIX_ALL inside component; fixes ReferenceError on load`

---

## X2 — SprintMode writes quizWrong to wrong doc

**File:** `src/modes/SprintMode.jsx` — `handleDontKnow` function, around line 103

`storageSet('prefs', ...)` should be `storageSet('progress', ...)`. Wrong answers are being written to the prefs document instead of the progress document.

**Fix:** Find the `storageSet` call inside `handleDontKnow`:

```js
// FIND:
storageSet('prefs', (p) => {
  const qw = { ...(p?.quizWrong ?? {}) };
  qw[cardId] = makeWrongEntry(qw[cardId]);
  return { ...p, quizWrong: qw };
});

// CHANGE 'prefs' → 'progress':
storageSet('progress', (p) => {
  const qw = { ...(p?.quizWrong ?? {}) };
  qw[cardId] = makeWrongEntry(qw[cardId]);
  return { ...p, quizWrong: qw };
});
```

Commit: `fix(SprintMode): X2 — write quizWrong to progress doc, not prefs`

---

## Final Steps

1. `npm run lint` — 0 warnings
2. `npm test -- --run` — all pass
3. `npm run build` — success
4. Bump `package.json` → `4.20.0`
5. Prepend to `CHANGELOG.md`:

```
## [4.20.0] - [DATE]

### fix: P0 critical bugs

- X1 (VocabMode): MIX_ALL moved inside component — fixes ReferenceError on load
- X2 (SprintMode): quizWrong written to progress doc (was: prefs)
```

6. Update `_MAP.md` version line → `v4.20.0` + add log entry
7. Push all commits

## Done when

- [ ] VocabMode loads without error
- [ ] SprintMode writes quizWrong to progress
- [ ] All tests pass; version 4.20.0 pushed
