# TASK v4.20.6 — N3, N7, N16, REF-3, N20, REF-3b, N11, R3

**Status:** DONE ✅ | **Effort:** Medium | **Depends on:** v4.20.5 DONE

## Goal: Wrong-answer + score writes via storage engine (A1/A2 interim fixes)

---

## Step 1 — N3: ProductionMode — add wrong tracking

**File:** `src/modes/ProductionMode.jsx`

ProductionMode tracks `results` but never writes wrong answers anywhere. Find where a wrong answer is recorded (compare user input vs expected):

```js
// FIND the "wrong answer" branch (something like):
setResults((prev) => [...prev, { cardId, correct: false }]);

// ADD immediately after:
import { useProgress } from '../contexts/ProgressContext.jsx';
const { recordWrong } = useProgress();
// In the wrong-answer branch:
recordWrong(cardId);
```

Commit: `fix(ProductionMode): N3 — call recordWrong on wrong answer`

---

## Step 2 — N7: JACMode — remove raw usePersistedState for wrong counts

**File:** `src/modes/JACMode.jsx` line 36

```js
// FIND:
const [wrongCounts, setWrongCounts] = usePersistedState('ssw-wrong-counts', {});

// REPLACE WITH:
import { get, set as storageSet } from '../storage/engine.js'; // may already be imported
// Read wrong counts from progress doc:
const [wrongCounts, setWrongCounts] = useState(() => get('progress')?.wrongCounts ?? {});

// Find where setWrongCounts is called with new data:
// BEFORE:
setWrongCounts(updated);
// AFTER:
setWrongCounts(updated);
storageSet('progress', (p) => ({ ...p, wrongCounts: updated }));
```

Commit: `fix(JACMode): N7 — wrongCounts via storage engine (not raw usePersistedState key)`

---

## Step 3 — N16: QuizProduksiMode — remove raw usePersistedState

**File:** `src/modes/QuizProduksiMode.jsx` line 48

```js
// FIND:
const [_quizWrong, setQuizWrong] = usePersistedState('ssw-quiz-produksi-wrong', {});

// REPLACE WITH (write to progress.quizWrong via ProgressContext):
import { useProgress } from '../contexts/ProgressContext.jsx';
const { recordWrong } = useProgress();
// Remove the setQuizWrong variable entirely.
// Find where wrong answers are written:
// BEFORE: setQuizWrong(...)
// AFTER: recordWrong(cardId) (using ProgressContext)
```

Commit: `fix(QuizProduksiMode): N16 — wrong answers via ProgressContext.recordWrong (not raw key)`

---

## Step 4 — REF-3: VocabMode + WaygroundMode — wrong writes via engine

**VocabMode.jsx** — find `usePersistedState('ssw-vocab-wrong-${activeSet}', {})`:

```js
// FIND:
const [vocabWrong, setVocabWrong] = usePersistedState(`ssw-vocab-wrong-${activeSet}`, {});
// ...
setVocabWrong(updated);

// REPLACE WITH:
const [vocabWrong, setVocabWrong] = useState(() => get('progress')?.vocabWrong ?? {});
// Where setVocabWrong(updated) is called, also write to engine:
setVocabWrong(updated);
storageSet('progress', (p) => ({ ...p, vocabWrong: updated }));
```

**WaygroundMode.jsx** — same pattern for `ssw-wg-wrong-${activeSet}`:

```js
// FIND:
const [wgWrong, setWgWrong] = usePersistedState(`ssw-wg-wrong-${activeSet}`, {});

// REPLACE WITH:
const [wgWrong, setWgWrong] = useState(() => get('progress')?.wgWrong ?? {});
// Co-write to engine where setWgWrong is called:
setWgWrong(updated);
storageSet('progress', (p) => ({ ...p, wgWrong: updated }));
```

Commit: `fix(VocabMode/WaygroundMode): REF-3 — wrong writes via storage engine (interim)`

---

## Step 5 — N20 + REF-3b: Score writes via ProgressContext.saveScore

**Files:** JACMode.jsx, WaygroundMode.jsx, VocabMode.jsx

All three use `usePersistedState` for score tracking:

- JACMode: `ssw-jac-scores`
- WaygroundMode: `ssw-wg-scores`
- VocabMode: `ssw-vocab-scores`

All three have a `ProgressContext.saveScore(type, setId, data)` already available. Check ModeRouter — it passes `saveScore` as a prop to these modes.

**For each file:**

```js
// FIND:
const [jacScores, setJacScores] = usePersistedState('ssw-jac-scores', {}); // or wg/vocab variant

// REPLACE WITH (ProgressContext already provides these via props or context):
const { saveScore, jacScores } = useProgress(); // or props equivalent
// Then replace setJacScores(data) with saveScore('jac', setId, data)
```

Check how `saveScore` is implemented in ProgressContext — match the call signature exactly.

Commit: `fix(modes): N20+REF-3b — score writes via ProgressContext.saveScore (JAC/Wayground/Vocab)`

---

## Step 6 — N11: Add `sprintBest` to `DEFAULTS.prefs`

**File:** `src/storage/schema.js`

```js
// FIND prefs DEFAULTS object. ADD:
sprintBests: {},          // { [durationKey]: { score, timeline } } — N10 scoped by duration
```

(This is needed by N10 fix — adding it to DEFAULTS now means it won't be undefined on load.)

Commit: `fix(schema): N11 — add sprintBests to DEFAULTS.prefs`

---

## Step 7 — R3: Remove dead `_unknown` prop from FocusMode

**File:** `src/modes/FocusMode.jsx` line 9

```js
// FIND:
export default function FocusMode({ known, _unknown, quizWrong, onExit, onSessionEnd }) {

// CHANGE TO (remove _unknown):
export default function FocusMode({ known, quizWrong, onExit, onSessionEnd }) {
```

**File:** `src/router/ModeRouter.jsx` line 233

```js
// FIND:
fokus: { known, unknown, quizWrong, onExit: exitMode, onSessionEnd: makeSessionEnd('fokus') },

// CHANGE TO (remove unknown):
fokus: { known, quizWrong, onExit: exitMode, onSessionEnd: makeSessionEnd('fokus') },
```

Commit: `fix(FocusMode): R3 — remove dead _unknown prop from component + ModeRouter`

---

## Final Steps

1. `npm run lint` — 0 warnings
2. `npm test -- --run` — all pass
3. `npm run build`
4. Bump → `4.20.6`, update CHANGELOG + \_MAP.md, push

## Done when

- [ ] ProductionMode calls recordWrong (N3)
- [ ] JACMode wrongCounts via engine (N7)
- [ ] QuizProduksiMode via recordWrong (N16)
- [ ] VocabMode + WaygroundMode wrong via engine (REF-3)
- [ ] All 3 modes scores via saveScore (N20+REF-3b)
- [ ] sprintBests in DEFAULTS.prefs (N11)
- [ ] FocusMode \_unknown removed (R3)
- [ ] All tests pass; version 4.20.6
