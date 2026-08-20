# 📦 docs/archive/ — Archive Index

> All documents here are historical. They informed decisions that have been implemented.
> Do NOT use these as instructions — they describe work that is already done.
> **Active docs are in `docs/` (not this subfolder), `_MAP.md`, and `HANDOFF.md` (repo root).**

Merged 2026-08-18 from `main`'s pre-merge archive (proposals, blueprints, audits, task files —
app-side project history) and `content-dq`'s archive (superseded data-quality handoff docs).
Previously two separate `docs/archive/` folders on two branches with no common ancestor; now one.

---

## App / architecture history (from `main`)

| File                                                            | Type             | Summary                                                                                                                       | Superseded by                           |
| --------------------------------------------------------------- | ---------------- | ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| `UPGRADE-PROPOSAL-v4.20.md`                                     | Proposal         | v4.20 upgrade proposal (pass 14) — all 19 items fully implemented through v4.21.1.                                            | Implemented                             |
| `tasks/TASK-MASTER.md`                                          | Task plan        | Master task list for v4.20.0–v4.21.1 (19 tasks). All DONE.                                                                    | Implemented                             |
| `tasks/TASK-v4.20.0 … TASK-v4.21.1`                             | Task files       | 19 individual task files — each self-contained, executed in order.                                                            | Implemented                             |
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

_Last updated: 2026-08-18 — content-dq/main merge, archives combined._
