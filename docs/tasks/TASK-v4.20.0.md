# TASK v4.20.0 — X1, X2: P0 Critical Bugs
**Status:** READY | **Effort:** Low | **Must complete before:** v4.20.1

## Items
- **X1** (P0) — `src/modes/VocabMode.jsx`
- **X2** (P0) — `src/modes/SprintMode.jsx`

## Full spec
Read `docs/UPGRADE-PROPOSAL-v4.20.md` sections X1 and X2 (P0 Critical Bugs).

## Steps
1. Read the proposal for exact description of each bug
2. `git clone` repo, `npm install`
3. Fix X1 in VocabMode.jsx
4. `npm test -- --run` → pass
5. Commit: `fix(VocabMode): X1 — [description]`
6. Fix X2 in SprintMode.jsx
7. `npm test -- --run` → pass
8. Commit: `fix(SprintMode): X2 — [description]`
9. `npm run build` → success
10. Bump `package.json` version → `4.20.0`
11. Prepend CHANGELOG entry for v4.20.0
12. Update `_MAP.md` version line + log entry
13. Commit: `chore: release v4.20.0`
14. Push

## Done when
- [ ] Both bugs fixed
- [ ] All tests pass
- [ ] Version bumped to 4.20.0
- [ ] CHANGELOG updated
- [ ] _MAP.md updated
