# TASK v4.20.2 — ENG-2, N15, N19, B5, B1
**Status:** READY | **Effort:** Low | **Depends on:** v4.20.1 DONE

## Items
- **ENG-2** — `src/utils/constants.js` — magic numbers/constants extraction
- **N15** (P3) — `src/contexts/ProgressContext.jsx` → uses ENG-2
- **N19** (P3) — `src/srs/fsrs-scheduler.js` → uses ENG-2
- **B5** (P1) — `src/modes/StatsMode.jsx` — remove `× 100` from accuracy calculation
- **B1** (P1) — `src/utils/achievements.js` → ENG-2 dependency

## Full spec
Read `docs/UPGRADE-PROPOSAL-v4.20.md` sections ENG-2, N15, N19, B5, B1.

## Steps
1. Read proposal for full detail
2. Create `src/utils/constants.js`
3. Fix B5 (StatsMode `× 100` bug — straightforward arithmetic fix)
4. Update B1, N15, N19 callers
5. `npm test -- --run` → pass
6. Bump → `4.20.2`, update CHANGELOG + _MAP.md, push

## Done when
- [ ] constants.js created
- [ ] StatsMode accuracy calculation correct (B5)
- [ ] All tests pass; version 4.20.2
