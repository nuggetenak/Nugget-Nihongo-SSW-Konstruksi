# Agent Task Files — SSW Konstruksi Frontend & Content Upgrade

## How to Use
Each file is a complete prompt for a free Claude Sonnet session.
1. Open a new Claude.ai chat
2. Paste the contents of the task file
3. Add the required source files (marked with [paste X here])
4. Run the task, get the output
5. Apply output to repo, commit, push

## Free Account Constraints
- Paste source code directly into the chat
- For large files (> 500 lines), split into multiple sessions
- The agent cannot run code — it writes scripts, you run them locally
- Each session is independent — no memory between sessions

---

## CONTENT STANDARDIZATION (CS) — Phase 1 Foundation

| Task | File | What Agent Does | You Run |
|---|---|---|---|
| CS-01 | AGENT-TASK-CS-01.md | Writes split-cards.mjs + merge-cards.mjs | `node scripts/split-cards.mjs` |
| CS-02 | AGENT-TASK-CS-02.md | Writes migrate-cs02.mjs (romaji remove + type add) | `node scripts/migrate-cs02.mjs` |
| CS-03 | AGENT-TASK-CS-03.md | Updates JpDisplay.jsx DescBlock | Apply file directly |
| CS-04 | AGENT-TASK-CS-04.md | Updates FlipCard.jsx + FlipCard.module.css | Apply files directly |

## CONTENT RE-ANNOTATION (CS-05) — Phase 2, 8 batches

| Task | File | Cards | Source file to paste |
|---|---|---|---|
| CS-05-A | AGENT-TASK-CS-05-TEMPLATE.md | 211 | cards-common-vocab.js |
| CS-05-B | AGENT-TASK-CS-05-TEMPLATE.md | 120 | cards-lifeline-vocab.js |
| CS-05-C | AGENT-TASK-CS-05-TEMPLATE.md | ~80 | cards-common.js (hukum only, filter by type) |
| CS-05-D | AGENT-TASK-CS-05-TEMPLATE.md | ~200 | cards-common.js (konsep, first half) |
| CS-05-E | AGENT-TASK-CS-05-TEMPLATE.md | ~200 | cards-common.js (konsep, second half) |
| CS-05-F | AGENT-TASK-CS-05-TEMPLATE.md | ~200 | cards-lifeline.js (first half) |
| CS-05-G | AGENT-TASK-CS-05-TEMPLATE.md | ~226 | cards-lifeline.js (second half) |
| CS-05-H | AGENT-TASK-CS-05-TEMPLATE.md | 148 | cards-kenchiku.js + cards-doboku.js |

⚠️ For CS-05: After CS-01 runs, you'll have the 8 source files. Use TEMPLATE.md as the prompt — paste it + the relevant source file content.

---

## FRONTEND (FE) — Phase 3

| Task | File | What Agent Does |
|---|---|---|
| FE-01-A | AGENT-TASK-FE-01-A.md | CSS module: DangerMode + AngkaMode |
| FE-01-B | AGENT-TASK-FE-01-B.md | CSS module: SimulasiMode + StatsMode |
| FE-01-C | AGENT-TASK-FE-01-C.md | CSS module: ReviewMode + GlossaryMode |
| FE-02 | AGENT-TASK-FE-02.md | prefers-reduced-motion in 7 CSS files |
| FE-03 | AGENT-TASK-FE-03.md | Design tokens: spacing, shadow, z-index, transitions |
| FE-04-AB | AGENT-TASK-FE-04-AB.md | A11y: aria labels + keyboard nav |
| FE-04-CD | AGENT-TASK-FE-04-CD.md | A11y: focus trap + focus management |
| FE-05 | AGENT-TASK-FE-05.md | ErrorBoundary + OfflineBanner + debounce + toast |
| FE-06 | AGENT-TASK-FE-06.md | Component render tests (install @testing-library first) |
| FE-07-08-09 | AGENT-TASK-FE-07-08-09.md | DX + PWA + UX Polish (haptic, scroll, transitions) |

---

## Order of Execution

```
Week 1 — Foundation:
  CS-01 → CS-02 → CS-03 → CS-04   (in order, each depends on previous)

Week 2 — Re-annotation:
  CS-05-A, CS-05-B                 (vocab first — fastest to validate)
  CS-05-C                          (hukum — most critical for exam prep)
  CS-05-D through CS-05-H          (can run in parallel)

Week 3 — Frontend:
  FE-01-A, FE-01-B, FE-01-C       (can run in parallel)
  FE-02                            (independent)
  FE-03                            (independent)
  FE-04-AB, FE-04-CD              (in order)
  FE-05                            (independent)

Week 4 — Polish:
  FE-06                            (after FE-05 done)
  FE-07-08-09                      (independent)
```

## Validation Before Committing Agent Output

For CS tasks:
- Run `npm run build` — must complete with 0 errors
- Run `npm test -- --run` — 360 tests must pass
- Spot-check 5–10 cards per batch manually

For FE tasks:
- Run `npm run lint` — 0 errors, 0 warnings
- Run `npm run build` — 0 errors
- Run `npm test -- --run` — all tests pass
