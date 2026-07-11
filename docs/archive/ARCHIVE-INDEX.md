# docs/archive/ — Index

Superseded admin/handoff docs, kept for history instead of deleted. Git history has every version anyway (`git log --follow <file>`), but having the actual file here is faster than archaeology when you just want to check "what did v16 say about X."

Established session 23 (2026-07-11) as the going-forward convention — previously superseded handoffs were left in repo root (v16 sat alongside v17 since ADM10/session 18). Root now only holds `HANDOFF.md`.

## Session 23 restructure (2026-07-11)

`SESSION_PROMPT.md` + the versioned `DATA_QUALITY_HANDOFF_vNN.md` + `PROGRESS.md`'s active-checklist role were consolidated into one file, `HANDOFF.md` (repo root), to support a multi-agent relay workflow where the owner uploads/downloads a single file per session instead of four. See `../../HANDOFF.md` for the reasoning and the current state.

| File | Superseded by | Superseded when |
|---|---|---|
| `DATA_QUALITY_HANDOFF_v16.md` | v17 (ADM10, session 18) | Root since session 18, archived session 23 |
| `DATA_QUALITY_HANDOFF_v17.md` | v18 (session 23) | Archived same session it was superseded |
| `DATA_QUALITY_HANDOFF_v18.md` | `HANDOFF.md` (session 23) | Archived same session — consolidation, not staleness |
| `SESSION_PROMPT.md` | `HANDOFF.md` (session 23) | idem |
| `PROGRESS.md` | `HANDOFF.md` (session 23, active items only — see note below) | idem |

**Note on `PROGRESS.md`:** its "SELESAI (sessions 1–17)" historical table was NOT carried into `HANDOFF.md` — that's compact history, same category as everything else in `git log` and `_MAP.md`'s session log, not live state. Only its still-open checklist items moved forward, into `HANDOFF.md`'s ACTIVE TASKS section. If you need the full original P0–P17 task list with rationale (not just the current open items), it's in this archived copy.

Current single source of truth: `../../HANDOFF.md` (repo root).

Note: `_MAP.md` (repo root) references a `docs/archive/` on `main` with its own `ARCHIVE-INDEX.md` and a `tasks/` subfolder — that's a separate, larger archive that lives on `main` only (proposals, executed TASK-v4.x files, etc.), not this one. This `docs/archive/` is `content-dq`-branch-local.
