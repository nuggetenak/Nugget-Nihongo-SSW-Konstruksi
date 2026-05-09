# 🎯 TASK-MASTER.md — v4.20 Implementation Plan
**Base:** v4.19.5 | **Proposal:** UPGRADE-PROPOSAL-v4.20.md (pass 14)

> **For new agents:** Read `_MAP.md` first (repo orientation), then this file. Pick the lowest unclaimed version. Each task file is self-contained — no need to read the full proposal.

---

## Agent Instructions

1. `git clone https://github.com/nuggetenak/Nugget-Nihongo-SSW-Konstruksi.git`
2. `cd Nugget-Nihongo-SSW-Konstruksi && npm install`
3. Check `docs/tasks/` — find the lowest version marked **READY** and not **DONE**
4. Read that task file completely before touching any code
5. Execute steps in order — commit after each logical unit (not all at end)
6. After success: mark task DONE by updating the status line in the task file and pushing
7. Update `CHANGELOG.md`, `package.json` version, `_MAP.md` per instructions in the task

---

## Version Queue

| Version | Task File | Status | Effort | Items |
|---------|-----------|--------|--------|-------|
| v4.20.0 | TASK-v4.20.0.md | **DONE** | Low | X1, X2 — P0 critical bugs |
| v4.20.1 | TASK-v4.20.1.md | **DONE** ✅ | Low | REF-6, N13, N9, N18, ENG-8 |
| v4.20.2 | TASK-v4.20.2.md | **DONE** ✅ | Low | ENG-2, N15, N19, B5, B1 |
| v4.20.3 | TASK-v4.20.3.md | **DONE** ✅ | Medium | ENG-1, ENG-7, B3, N2, N4 |
| v4.20.4 | TASK-v4.20.4.md | **DONE** ✅ | Medium | ENG-3, B2, F3, REF-4 |
| v4.20.5 | TASK-v4.20.5.md | **DONE** ✅ | Medium | B4, N6/OVERHAUL-2, N8/REF-5, N14, N22 |
| v4.20.6 | TASK-v4.20.6.md | **DONE** ✅ | Medium | N3, N7, N16, REF-3, N20, REF-3b, N11, R3, N23, OVERHAUL-3 |
| v4.20.7 | TASK-v4.20.7.md | **READY** | Low | ENG-5 |
| v4.20.8 | TASK-v4.20.8.md | **READY** | Low | F1, F2, F4, R1, R2, N10 |
| v4.20.9 | TASK-v4.20.9.md | **READY** | Low | DB-2,3,4,5, ENG-9, ENG-10 |
| v4.20.10 | TASK-v4.20.10.md | **READY** | Medium | DB-1, DB-6, DB-7, DB-8 |
| v4.20.11 | TASK-v4.20.11.md | **READY** | Low | N24, N25 |
| v4.20.12 | TASK-v4.20.12.md | **READY** | Low | STORAGE-1, ENG-12 |
| v4.20.13 | TASK-v4.20.13.md | **READY** | Medium | PERF-1, REF-10, ENG-13 |
| v4.20.14 | TASK-v4.20.14.md | **READY** | Low | PERF-2, REF-11 |
| v4.20.15 | TASK-v4.20.15.md | **READY** | Medium | ENG-11, migrate ~15 card-filter sites |
| v4.21.0 | TASK-v4.21.0.md | **READY** | Medium | REF-8, REF-9, Tests C1-C7 |
| v4.21.1 | TASK-v4.21.1.md | **BLOCKED** | High | OVERHAUL-1 — wait until v4.21.0 done |

> **BLOCKED** = has dependency. Do not start until prerequisite is DONE.

---

## Full Proposal Reference

`docs/UPGRADE-PROPOSAL-v4.20.md` — pass 14 (latest), contains full specs for all items.

Items from passes 1–11 (X1, X2, B1–B5, N1–N23, REF-1–REF-6, ENG-1–ENG-8) have full spec in the proposal. Tasks v4.20.0–v4.20.8 include the key details extracted from that proposal.

---

## Commit Message Convention

```
<type>(<scope>): <description>

type: fix | feat | refactor | test | chore | perf
scope: mode name, file name, or item ID
```

Examples:
- `fix(VocabMode): X1 — [description]`
- `feat(engine): ENG-12 storage-quota detection + recovery`
- `perf(ProgressContext): REF-10 memoize context value`
- `chore: bump version to 4.20.9`

---

## After Each Version

1. `npm run lint` — must pass (0 warnings)
2. `npm test -- --run` — must pass all
3. `npm run build` — must succeed
4. Bump `package.json` version
5. Update `CHANGELOG.md` (prepend entry)
6. Update `_MAP.md` (version line + log entry)
7. Push all commits

