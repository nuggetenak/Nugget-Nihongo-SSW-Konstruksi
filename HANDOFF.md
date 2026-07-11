# HANDOFF.md — SSW Konstruksi · content-dq

**This is the relay baton.** One file, always edited in place — no more `_v17`/`_v18` filenames.
Owner uploads this file to a new agent chat, agent works, agent overwrites this file with the
updated state, owner downloads it and hands it to the next agent. Repeat.

This file replaced `SESSION_PROMPT.md` + the versioned `DATA_QUALITY_HANDOFF_vNN.md` +
`PROGRESS.md`'s active-checklist role on 2026-07-11 (session 23) — all three archived to
`docs/archive/`, superseded by this file. Reason: those three drifted out of sync with each
other and with the actual repo state (by 10 commits / 2 sessions, at the point this was written)
because keeping N documents in sync by hand, across many separate agent sessions with no shared
memory, doesn't hold up. One file is easier to keep honest than four.

`_MAP.md` (architecture + detailed session-by-session log) and `docs/CARD_CONTENT_SPEC.md`
(schema/rules/taxonomy) are **not** folded in here — they're stable reference material that
doesn't change every session, and they live in the repo, not in what gets uploaded. Read them
from the clone. Don't duplicate their content into this file; link to them.

---

## ⚡ PROTOCOL — READ THIS PART EVEN IF YOU SKIP EVERYTHING ELSE

**On start, before touching anything:**
1. Clone the repo, checkout `content-dq`.
2. Run `node scripts/verify-content.mjs`. It's dependency-free, no `npm install` needed.
3. Compare its output against the CURRENT STATE section below. If they disagree, trust the
   script — this file may be stale the moment a later session's work isn't reflected here yet.
4. Read ACTIVE TASKS + OPEN DECISIONS below before picking anything up. Several open items are
   gated on an owner decision or external material — check before starting, not after.

**Before you write the updated HANDOFF.md to hand off:**
1. Run `node scripts/verify-content.mjs` again. Don't hand-carry-forward the numbers you started
   with — re-derive them. This is the single change that would have caught the biggest problem
   found in session 23 (a corrupted `type` field that sat undetected across a full session
   because nothing re-checked it before the handoff doc was written).
2. Update PROGRESS checkboxes in the ACTIVE TASKS section below (this file now owns that list).
3. Check your own edits are internally consistent with the rest of this file — don't leave a
   stale reference to something you just changed.
4. Commit, push to `content-dq`. Never `main`.
5. Overwrite this file in place with the new state. Don't create `HANDOFF_v2.md`.

---

## CURRENT STATE

**As of this edit, 2026-07-11 (session 23, cont'd).** Verify before trusting past this point —
this line doesn't update itself.

- 1,438 cards total — 97 konsep / 1,244 vocab / 97 hukum (877 common + 561 lifeline)
- P0–P5, P7, P9, P14, P15, P8a: all done
- `type` field corruption (id=82,83,186,188,201): **fixed**, verify script exits 0
- **Owner answered OD-1/OD-2/OD-3 (2026-07-11):** OD-1 → merge deprecated sources into
  `vocab-supplementary`. OD-2 → split wglv now. OD-3 → rename jac-mockup now.
- **P17 done:** `sets/csv/` → `sets/jac-mockup/`, `ct*/cp*` → `jmt*/jml*`, source unified to
  `'jac-mockup'`, titles/ids/export-names updated. Also touched (not just the split files):
  the monolith `csv-sets.js` → `jac-mockup-sets.js` (this is what the app actually runs —
  `quiz-sets.js` imports from the monolith, not the split files directly) plus `quiz-sets.js`,
  `index.js`, `viewer.html` reference updates. Verify script confirms all files still parse.
- P6/P13, P16 (+ dependents P8b/P10/P11): now unblocked, in progress or queued this session
- No lint/build/test on this branch (`package.json`/`scripts/` other than the verify script are
  `main`-only) — `scripts/verify-content.mjs` is the only safety net right now.

---

## ACTIVE TASKS

Everything below is either gated or genuinely unstarted. Nothing here is a "just pick the first
one" list — check the gate before starting.

### 🔵 Gated on an owner decision — ask before starting
| Task | Depends on | What |
|---|---|---|
| P16 | OD-2 | Split `wglv01–05` into `wglv-jp-*` (JP→ID) and `wglv-id-*` (ID→JP); reset ids; update exports; delete old files |
| P8b | P16 first | wglv-jp: naked `q`/`exp`. wglv-id: naked `hint`/`opts` |
| P10 | P16 first, OD-4 for hint direction | wglv-id: fill `opts_id` for all wrong options. wglv-jp: fix `hint` that's still copy-of-q |
| P11 | P16 first | wglv-id (ex-04/05): replace generic `"JP = bahasa Jepangnya."` with specific translation |
| P6 | OD-1 | If approved: 226 kartu deprecated sources → `vocab-supplementary`; edit `source:` in split files |
| P12 | merge time, not now | Drop `furi` from all split files |
| P13 | after P6 | Verify zero deprecated sources remain |

### 🟡 Needs human/AGENT-12 judgment — not gated on owner, but not mechanical either
- ~64 naked-kanji `jp` post-compound/qualifier cases (P1) — each may need a different ruby call
- `id=1240` `source` field — ambiguous jac-ch2 content (P3)
- EF接合 triple (id=459, 612, 613) — 3 cards, different content, merge candidate (P4)
- 6 same-jp ambiguous pairs: 124/842, 299/858, 862/309, 438/911, 482/819, 416/1182 (P4)
- 213 `desc` truncated mid-word + 266 missing period (~479 cards, P5) — needs real JAC PDF text,
  don't guess-fill these

### 🟢 Unblocked, no owner decision needed, just not done yet
- `confusion-pairs.js`: add `track` field to all 28 entries — no task number assigned, open

### ⏸ Blocked on external material
- P21 — JAC Doboku + Kenchiku jitsugi stubs — needs official PDF from owner
- PDF Viewer Mode — needs official PDF URL from owner

---

## OPEN DECISIONS

| ID | Blocks | Question | Status |
|----|--------|----------|--------|
| OD-1 | P6, P13 | Source labels: retain legacy vs merge into `vocab-supplementary`? | ✅ Answered 2026-07-11: merge |
| OD-2 | P16, P8b, P10, P11 | wglv split: do it now or at merge time? | ✅ Answered 2026-07-11: now |
| OD-3 | P17 | jac-mockup rename: now or at merge time? | ✅ Answered 2026-07-11: now — P17 done |
| OD-4 | P10 | wglv02/03 hint: update to an ID-language clue, or keep as-is? | Open |
| OD-5 | P12 | Separate SSW Flashcards repo: does it consume `card.furi`? (affects whether it's safe to drop) | Open — doesn't block anything until merge time (P12), not urgent |

Full rationale for each: `docs/CARD_CONTENT_SPEC.md` §12.

---

## RULES

- Run `scripts/verify-content.mjs` before and after any edit to `src/data/`
- Commit per task: `CONTENT: [task] — [short description]` (or `ADMIN:` / `DOCS:` for non-content)
- Mirror edits: split file → `src/data/source/cards-*.js` → `src/data/cards.js`, all three. Then
  verify. The session-23 corruption happened because step 3 wasn't checked before commit.
- Never push to `main`
- Ambiguity → write it down here, ask the owner, don't guess and proceed
- `jac-doboku.js` / `jac-kenchiku.js` — don't touch, waiting on PDF
- Single-quote strings in data files, **except** `cards-common.js`/`cards-lifeline.js` — leave
  their existing quote style alone, don't requote (pre-existing rule, origin unclear — but the
  session-22 `type` field corruption happened in exactly these two files too, so treat them as
  fragile regardless of the rule's original reason)

---

## REFERENCE (stable — read from the repo, not reproduced here)

- `docs/CARD_CONTENT_SPEC.md` — schema, ruby rules, taxonomy, full task rationale, Open Decisions detail
- `_MAP.md` — architecture map + full session-by-session history log
- `docs/DATA_ARCH_AUDIT.md` — frozen point-in-time audit (session 16) — historical, not live
- `docs/archive/` — superseded docs, including this file's predecessors (`SESSION_PROMPT.md`,
  `PROGRESS.md`, `DATA_QUALITY_HANDOFF_v16/v17/v18.md`)
- `README-CONTENT-DQ.md` — what's actually present on this branch vs `main`-only
