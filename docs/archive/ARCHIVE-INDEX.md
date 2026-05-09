# 📦 docs/archive/ — Archive Index

> All documents here are historical. They informed decisions that have been implemented.
> Do NOT use these as instructions — they describe work that is already done.
> **Active docs are in `docs/` (not this subfolder) and in `_MAP.md` (repo root).**

---

## Document Index

| File | Type | Summary | Superseded by |
|------|------|---------|---------------|
| `UPGRADE-PROPOSAL-v4.20.md` | Proposal | v4.20 upgrade proposal (pass 14) — all 19 items fully implemented through v4.21.1. | Implemented |
| `tasks/TASK-MASTER.md` | Task plan | Master task list for v4.20.0–v4.21.1 (19 tasks). All DONE. | Implemented |
| `tasks/TASK-v4.20.0 … TASK-v4.21.1` | Task files | 19 individual task files — each self-contained, executed in order. | Implemented |
| `SSW_UPGRADE_PROPOSAL_v1.md` | Audit/Proposal | Full audit of all 15 modes (v3 of doc, hygiene passes ×3). 71 findings, 11 bugs — all resolved by v4.14.0. E2 & C2 dismissed 2026-05-09. text4 audit 2026-05-09: all Ch.4 terms pre-exist — C1 fully closed. **NO OPEN ITEMS.** | `docs/BLUEPRINT-CURRENT.md` |
| `MASTER-BLUEPRINT-v6.md` | Blueprint | Agent-executable spec for Phases A–G (Opus 4.6 / Crunchy, 2026-05-01). **All phases complete.** | `docs/BLUEPRINT-CURRENT.md` |
| `MASTER-BLUEPRINT-v5.md` | Blueprint | v5: research-enriched spec with §0 evidence layers. Incorporated into v6. | v6 |
| `MASTER-BLUEPRINT-v4-POLISHED.md` | Blueprint | v4 polished: Phases 11–17 detail (renamed A–G in v6). | v6 |
| `MASTER-BLUEPRINT-v4.md` | Blueprint | v4: Sonnet-verified revision of v3. | v4-POLISHED |
| `MASTER-BLUEPRINT-v3.md` | Blueprint | v3: first full architecture rewrite (Opus). | v4 |
| `CONTENT-BLUEPRINT.md` | Content Proposal | Crunchy's audit of the content layer: track mismatch, lifeline dominance, JAC PDF gap. Status: reviewed and partially actioned (CS-01–05 executed; sipil/bangunan track gap documented in BLUEPRINT-CURRENT.md). | `docs/BLUEPRINT-CURRENT.md` §Open Items |
| `CONTENT-VERIFICATION-REPORT.md` | Audit Report | Automated term-matching of 1,438 cards (pre-dedup) against JAC textbook markdown. Results: 63% verified, 15% synthesized, 19% supplementary, 3% general. Source tags corrected. | Baked into cards.js |
| `PROPOSAL.md` | Proposal | Early architecture proposal (pre-v3). | v3 |
| `REFACTOR-PROPOSAL-v2.md` | Proposal | Opus deep audit + refactor proposal (v2). Led to v3 blueprint. | v3 |
| `UX-OVERHAUL-PROPOSAL.md` | Proposal | UX overhaul proposal (pre-v3). | v3 |
| `AUDIT-2026-04-28.md` | Audit | Codex comprehensive project audit, 2026-04-28, pass 1. | Addressed in phases |
| `AUDIT-2026-04-28-PASS2.md` | Audit | Pass 2 of the above. | Addressed |
| `AUDIT-2026-04-28-PASS3.md` | Audit | Pass 3 of the above. | Addressed |
| `AUDIT-2026-04-28-codex.md` | Audit | Codex supplementary findings. | Addressed |
| `AUDIT-2026-04-30.md` | Audit | Post-merge audit (2026-04-30). | Addressed |
| `id-mapping-v87-to-v90.json` | Data | Card ID mapping from legacy v87 monolith to v90+ modular structure. | Historical reference only |

---

## Seeds (deleted)

`docs/seeds/sipil-sets-seed.js` and `bangunan-sets-seed.js` were deleted in hygiene pass 3 (2026-05-09). The actual sipil/bangunan quiz sets are now inlined in `src/data/quiz-sets.js` (REF-9, v4.21.0). The seed files referenced `sipil-sets.js`/`bangunan-sets.js` which are also deleted.

---

*Last updated: 2026-05-09 — hygiene pass 3: archived tasks/, UPGRADE-PROPOSAL-v4.20.md; deleted seeds/*
