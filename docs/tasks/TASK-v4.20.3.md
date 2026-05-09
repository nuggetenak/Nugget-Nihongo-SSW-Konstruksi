# TASK v4.20.3 — ENG-1, ENG-7, B3, N2, N4
**Status:** READY | **Effort:** Medium | **Depends on:** v4.20.2 DONE

## Items
- **ENG-1** — `src/utils/session-analytics.js` — extract session analysis logic
- **ENG-7** — (see proposal)
- **B3** (P1) — `src/modes/StatsMode.jsx` → uses ENG-1
- **N2** (P2) — `src/utils/recommend-mode.js` → uses ENG-1
- **N4** (P2) — `src/utils/achievements.js` → uses ENG-1

## Full spec
Read `docs/UPGRADE-PROPOSAL-v4.20.md` sections ENG-1, ENG-7, B3, N2, N4.

## Steps
1. Read proposal
2. Create session-analytics.js
3. Implement ENG-7
4. Migrate B3, N2, N4 callers
5. `npm test -- --run` → pass; bump → `4.20.3`; update CHANGELOG + _MAP.md; push

## Done when
- [ ] session-analytics.js + ENG-7 done
- [ ] B3 bug fixed; all tests pass; version 4.20.3
