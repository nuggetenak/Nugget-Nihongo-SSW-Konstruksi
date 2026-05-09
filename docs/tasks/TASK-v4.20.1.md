# TASK v4.20.1 — REF-6, N13, N9, N18, ENG-8
**Status:** READY | **Effort:** Low | **Depends on:** v4.20.0 DONE

## Items
- **REF-6** — Extract date utility `src/utils/date.js`
- **N13** (P1) — `src/contexts/ProgressContext.jsx`, `src/components/Dashboard.jsx` → uses REF-6
- **N9** (P2) — `src/utils/daily-mission.js`, `src/utils/daily-challenge.js` → uses REF-6
- **N18** (P2) — `src/components/StudyHeatmap.jsx` → uses REF-6
- **ENG-8** — (see proposal)

## Full spec
Read `docs/UPGRADE-PROPOSAL-v4.20.md` sections REF-6, N13, N9, N18, ENG-8.

## Steps
1. Read proposal for full detail on each item
2. Create `src/utils/date.js` (REF-6)
3. Update callers: ProgressContext, Dashboard, daily-mission.js, daily-challenge.js, StudyHeatmap
4. Implement ENG-8
5. `npm test -- --run` → pass; `npm run build` → success
6. Bump version → `4.20.1`, update CHANGELOG + _MAP.md
7. Push

## Done when
- [ ] date.js created and all callers migrated
- [ ] ENG-8 done
- [ ] All tests pass
- [ ] Version 4.20.1 released
