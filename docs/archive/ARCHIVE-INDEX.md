# 📦 docs/archive/ — Archive Index

> All documents here are historical. They informed decisions that have been implemented.
> Do NOT use these as instructions — they describe work that is already done.
> **Active docs are in `docs/` (not this subfolder), `_MAP.md`, and `HANDOFF.md` (repo root).**

Merged 2026-08-18 from `main`'s pre-merge archive (proposals, blueprints, audits, task files —
app-side project history) and `content-dq`'s archive (superseded data-quality handoff docs).
Previously two separate `docs/archive/` folders on two branches with no common ancestor; now one.

**This index must list every file in this folder.** Five files were archived between 2026-08-19
and 2026-09-04 without a row here, which is the same failure the folder exists to prevent — an
archive nobody can navigate is a pile. Backfilled 2026-09-05; if you archive something, add its
row in the same commit.

---

## App / architecture history (from `main`)

| File                                                            | Type             | Summary                                                                                                                       | Superseded by                           |
| --------------------------------------------------------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| `UI_UX_PLAN-2026-08-overhaul.md`                                | Work queue       | The `feat/ui-overhaul` work queue (items 1–42, 38 actionable). **All shipped**, completed 2026-08-25 at 546 tests. Kept in full for its per-item reasoning — including routes deliberately *not* taken, and five deferrals carried into the successor plan. | `docs/UI_UX_PLAN.md` (items 43+)        |
| `UPGRADE-PROPOSAL-v4.20.md`                                     | Proposal         | v4.20 upgrade proposal (pass 14) — all 19 items fully implemented through v4.21.1.                                            | Implemented                             |
| `tasks/TASK-MASTER.md`                                          | Task plan        | Master task list for v4.20.0–v4.21.1 (19 tasks). All DONE.                                                                    | Implemented                             |
| `tasks/TASK-v4.20.0 … TASK-v4.21.1`                             | Task files       | **18** individual task files (v4.20.0–v4.20.15, v4.21.0, v4.21.1), each self-contained and executed in order. Corrected 2026-09-05: this row said 19, matching `TASK-MASTER.md`'s "19 tasks" — but that count is the proposal's 19 items, spread across 18 version files. | Implemented                             |
| `BLUEPRINT-CURRENT.md`                                          | Blueprint        | `main`'s project blueprint as of 2026-05-09 — constraints, storage v3 schema, phase history, known gaps. **Archived 2026-08-20:** sat live in `docs/` while every headline number went stale (v3 vs v6 storage, 23 vs 21 modes, 457 vs 435 tests) and while describing the removed Doboku/Kenchiku tracks. See its own header for the full drift table. | Live docs per `docs/AGENT_WORKFLOW.md` §4 |
| `SSW_UPGRADE_PROPOSAL_v1.md`                                    | Audit/Proposal   | Full audit of all 15 modes (v3 of doc, hygiene passes ×3). 71 findings, 11 bugs — all resolved by v4.14.0. **NO OPEN ITEMS.** | `BLUEPRINT-CURRENT.md` (also archived)  |
| `MASTER-BLUEPRINT-v6.md`                                        | Blueprint        | Agent-executable spec for Phases A–G (Opus 4.6 / Crunchy, 2026-05-01). **All phases complete.**                               | `BLUEPRINT-CURRENT.md` (also archived)  |
| `MASTER-BLUEPRINT-v5.md`                                        | Blueprint        | v5: research-enriched spec with §0 evidence layers. Incorporated into v6.                                                     | v6                                      |
| `MASTER-BLUEPRINT-v4-POLISHED.md`                               | Blueprint        | v4 polished: Phases 11–17 detail (renamed A–G in v6).                                                                         | v6                                      |
| `MASTER-BLUEPRINT-v4.md`                                        | Blueprint        | v4: Sonnet-verified revision of v3.                                                                                           | v4-POLISHED                             |
| `MASTER-BLUEPRINT-v3.md`                                        | Blueprint        | v3: first full architecture rewrite (Opus).                                                                                   | v4                                      |
| `CONTENT-BLUEPRINT.md`                                          | Content Proposal | Crunchy's audit of the content layer: track mismatch, lifeline dominance, JAC PDF gap.                                        | `BLUEPRINT-CURRENT.md` §Open Items (also archived) |
| `CONTENT-VERIFICATION-REPORT.md`                                | Audit Report     | Automated term-matching of 1,438 cards (pre-dedup) against JAC textbook markdown.                                             | Baked into cards.js                     |
| `PROPOSAL.md`                                                   | Proposal         | Early architecture proposal (pre-v3).                                                                                         | v3                                      |
| `REFACTOR-PROPOSAL-v2.md`                                       | Proposal         | Opus deep audit + refactor proposal (v2). Led to v3 blueprint.                                                                | v3                                      |
| `UX-OVERHAUL-PROPOSAL.md`                                       | Proposal         | UX overhaul proposal (pre-v3).                                                                                                | v3                                      |
| `AUDIT-2026-04-28.md` / `-PASS2.md` / `-PASS3.md` / `-codex.md` | Audit            | Codex comprehensive project audit, 2026-04-28, 3 passes + supplementary.                                                      | Addressed in phases                     |
| `AUDIT-2026-04-30.md`                                           | Audit            | Post-merge audit (2026-04-30).                                                                                                | Addressed                               |
| `id-mapping-v87-to-v90.json`                                    | Data             | Card ID mapping from legacy v87 monolith to v90+ modular structure.                                                           | Historical reference only               |

**Seeds (deleted):** `docs/seeds/sipil-sets-seed.js` and `bangunan-sets-seed.js` were deleted in
hygiene pass 3 (2026-05-09), pre-dating the full Doboku/Kenchiku removal (session 24, content-dq).

---

## Retired live docs (2026-08-19 onward)

Docs archived *after* the merge, under `docs/AGENT_WORKFLOW.md` §3's retirement rule: when an
entry's work is finished or merged, the full text moves here with a provenance header, a pointer
row goes into `_MAP.md`'s Agent Session Log, and it is deleted from the live file.

| File | Type | Summary | Archived |
| ---- | ---- | ------- | -------- |
| `HANDOFF-content-dq-era.md` | Handoff sections | The GETTING STARTED/PROTOCOL sections and the full 2026-08-18 merge-execution writeup, pulled out of `HANDOFF.md`. Its mirror-edit steps are **historical only** — the mirror layers they describe were deleted 2026-09-04; `docs/AGENT_WORKFLOW.md` §4a is the live map. | 2026-08-19 |
| `DATA_ARCH_AUDIT.md` | Audit | Frozen point-in-time data-architecture audit (session 16). Was sitting live in `docs/` already marked "historical, not live" — the case that prompted §4's "every live doc belongs in the table" rule. | 2026-08-19 |
| `HANDOFF-ui-overhaul-38-items.md` | Handoff entry | The `feat/ui-overhaul` era CURRENT STATE entry — all 38 actionable items of the 2026-08 overhaul plan. | 2026-08-20 |
| `HANDOFF-2026-08-27-28-sessions.md` | Handoff entry | The post-overhaul bug-fix rounds plus the SimulasiMode/Belajar work. | 2026-08-31 |
| `HANDOFF-2026-08-31-09-01-ui-typography.md` | Handoff entry | The 2026-08-31/09-01 UI + typography sessions, with a note on the one claim in it a later session had to correct. | 2026-09-04 |
| `HANDOFF-2026-09-04-audit-and-ui.md` | Handoff entry | The 6.0.0 exhaustive audit and the layout/typography overhaul that followed it, same day. Condensed versions: `CHANGELOG.md` [6.0.0] and [6.1.0], `_MAP.md` § Agent Session Log. | 2026-09-05 |
| `README-CONTENT-DQ.md` | Branch guide | The `content-dq` working guide. That branch merged 2026-08-18; the split-file layers it tells you to edit were deleted 2026-09-04, and its merge plan was executed in full. See its own header for the drift list. | 2026-09-05 |

---

## Data-quality handoff history (from `content-dq`)

Superseded admin/handoff docs, kept for history instead of deleted. Git history has every version
anyway (`git log --follow <file>`), but having the actual file here is faster than archaeology.

Established session 23 (2026-07-11) as the going-forward convention: `SESSION_PROMPT.md` + the
versioned `DATA_QUALITY_HANDOFF_vNN.md` + `PROGRESS.md`'s active-checklist role were consolidated
into one file, `HANDOFF.md` (repo root), to support a multi-agent relay workflow where the owner
uploads/downloads a single file per session instead of four.

| File                          | Superseded by                                    | Superseded when                                        |
| ----------------------------- | ------------------------------------------------ | ------------------------------------------------------ |
| `DATA_QUALITY_HANDOFF_v8.md`  | v11 (main, pre-fork)                             | main-side handoff lineage, pre-dates content-dq        |
| `DATA_QUALITY_HANDOFF_v11.md` | v12 (main, pre-fork)                             | main-side handoff lineage, pre-dates content-dq        |
| `DATA_QUALITY_HANDOFF_v12.md` | content-dq's v16+ lineage after the branch split | main's last handoff doc before content-dq branched off |
| `DATA_QUALITY_HANDOFF_v16.md` | v17 (ADM10, session 18)                          | Root since session 18, archived session 23             |
| `DATA_QUALITY_HANDOFF_v17.md` | v18 (session 23)                                 | Archived same session it was superseded                |
| `DATA_QUALITY_HANDOFF_v18.md` | `HANDOFF.md` (session 23)                        | Archived same session — consolidation, not staleness   |
| `SESSION_PROMPT.md`           | `HANDOFF.md` (session 23)                        | idem                                                   |
| `PROGRESS.md`                 | `HANDOFF.md` (session 23, active items only)     | idem                                                   |

**Note on `PROGRESS.md`:** its "SELESAI (sessions 1–17)" historical table was not carried into
`HANDOFF.md` — that's compact history, same category as `_MAP.md`'s session log. Only its
still-open checklist items moved forward. Full original P0–P17 task list with rationale is in
this archived copy.

**Note on `DATA_QUALITY_HANDOFF_v8/v11/v12.md`:** these three lived at repo root on `main` (not
`docs/archive/`) until this merge — moved here 2026-08-18 alongside the rest of the handoff-doc
lineage, since `HANDOFF.md` (content-dq's continuation of the same lineage) is now the single
current source of truth for both.

Current single source of truth: `../../HANDOFF.md` (repo root).

---

_Last updated: 2026-09-05 — backfilled the six post-merge archivals and `README-CONTENT-DQ.md`;
corrected the task-file count (18 files, 19 tasks)._
