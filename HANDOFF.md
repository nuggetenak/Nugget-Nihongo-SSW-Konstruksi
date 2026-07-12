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

## GETTING STARTED (new agent, new chat, no other context)

```
Repo:   https://github.com/nuggetenak/Nugget-Nihongo-SSW-Konstruksi
Branch: content-dq  (NOT main — never push to main)

git clone -b content-dq https://[token]@github.com/nuggetenak/Nugget-Nihongo-SSW-Konstruksi.git
```

The owner will paste a GitHub PAT in the chat for clone/push access — sharing it directly in
chat like this is their established, deliberate practice for this workflow, not an oversight.

Then: PROTOCOL section below, first.

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
- `type` field corruption (id=82,83,186,188,201): fixed, verify script exits 0
- **Owner answered OD-1/OD-2/OD-3 (2026-07-11):** OD-1 → merge deprecated sources into
  `vocab-supplementary`. OD-2 → split wglv now. OD-3 → rename jac-mockup now.
- **P17 done:** `sets/csv/` → `sets/jac-mockup/` (see git log for detail — also touched the
  monolith `csv-sets.js`→`jac-mockup-sets.js`, not just the split files)
- **P6 + P13 done:** the 226 cards on `vocab-lifeline`/`vocab-general`/`vocab-teori`/
  `vocab-core`/`vocab-exam` → `vocab-supplementary`. That source is now 495 (was 269). All 5
  deprecated values confirmed at 0 remaining across all 3 layers (split/mirror/cards.js).
- **P16 done.** Same monolith-drift pattern as P17: `wayground-sets.js` held a *stale* copy of
  this content under legacy ids `wg6/wg7/wg8/wg9/wg11` (not `wglv01-05` — different ids entirely,
  and at least one confirmed content diff vs. the split files, a duplicated ruby annotation on
  wg6/id=4 that was already fixed in wglv01.js but never propagated). Rebuilt from the (correct)
  split-file content, not the stale monolith. **CARD_CONTENT_SPEC.md's direction table was wrong
  for wglv01** — claimed 100% JP→ID (0/50), verified actual is 26 ID→JP / 24 JP→ID, i.e. mixed
  like every other wglv file. Correction noted in the spec itself. Real totals used: 117 ID→JP +
  119 JP→ID = 236 (not the spec-implied 91+145). Decisions made without asking (flagging here,
  easy to redo differently if wrong): 3 files per direction, ~39-40 questions each, chunked in
  original wglv01→05 order (not fully interleaved) so each new file stays reasonably coherent;
  `source: "wayground-lifeline-vocab"` unified across all 6 new files (same move as P17's source
  unification, old per-file sources wayground-quizizz/pdf7/8/9/11 dropped since files no longer
  map 1:1 to those origins post-split). One data-quality issue found and carried through
  unfixed, not judgment-called: see 🟡 bucket below.
- **P8b done (mostly).** Scoped to what the task actually specified — `q`/`exp` for wglv-jp,
  `opts` for wglv-id — not `hint`, after checking the established convention (already-verified
  P8a files use plain Indonesian prose or kanji=meaning breakdowns in `hint`, never `《》` ruby;
  confirmed hint's "naked" kanji in wglv are meaning-breakdowns like `温=panas`, not something
  that was ever meant to carry a reading). Fixed via mechanical passes: strip redundant
  ruby+round-paren duplicates, convert round-paren-only readings to proper `《》` ruby using the
  text's own stated reading (not invented), cross-reference the same compound if it's already
  ruby'd elsewhere in the same question, then a whole-repo dictionary built from 38,754 existing
  `《》` pairs for remaining high-confidence matches only (≥85% reading consistency required).
  61 instances across 26 unique compounds left **unresolved on purpose** — mostly single
  characters (管, 輪, 形, etc.) whose reading genuinely depends on context I can't verify safely.
  Left naked rather than guessed; several still have their original round-paren reading sitting
  right there for whoever picks this up next. Re-synced into `wayground-sets.js` after fixing —
  had to redo the P16 splice, caught and fixed an off-by-one that dropped a `{` before pushing.
- **P11 done.** 50 instances of `"{term} = bahasa Jepangnya."` (a circular non-explanation - just
  said "= its Japanese") replaced with `"{opts[ans]} = {opts_id[ans]}."` using data already
  present in the same question object (not invented) - verified `ans` isn't always 0 first (12
  of 50 weren't) and `opts_id[ans]` is never empty before trusting this approach.
- No lint/build/test on this branch (`package.json`/`scripts/` other than the verify script are
  `main`-only) — `scripts/verify-content.mjs` is the only safety net right now.

---

## ACTIVE TASKS

Everything below is either gated or genuinely unstarted. Nothing here is a "just pick the first
one" list — check the gate before starting.

### 🔵 Gated on an owner decision — ask before starting
| Task | Depends on | What |
|---|---|---|
| P10 | OD-4 (see note) | wglv-id: fill `opts_id` for all wrong options (currently `["text","",""]` pattern - only the correct answer has a translation). wglv-jp: fix `hint` that's still copy-of-q. |
| P12 | merge time, not now | Drop `furi` from all split files |

**P10 detail (investigated session 23, not executed):** of 119 wglv-jp hints, 61 are confirmed
copy-of-q (hint text ≈ question text, adds zero information — detectable via hint containing
both `意味は` and `ですか`). OD-4 asks whether to fix these, but this isn't really a 50/50 call:
copy-of-q hints are objectively broken regardless of preference, so "update" is the reasoned
answer, not a guess. What stopped execution wasn't the decision, it was the *method*: fixing
these means **composing new kanji-meaning-breakdown hints**, not reusing/reformatting existing
verified data like every other fix this session did. A quick dictionary check found a live
example of context-drift risk (柱 aggregated to "kolom" across the corpus, but means "tiang" in
電柱 specifically) — enough to stop rather than generate 61 at once. If you pick this up: go
term-by-term with real verification per compound (not a blanket aggregate lookup), or get
additional source material from the owner, rather than trusting a frequency-based dictionary.
The wglv-id half (filling `opts_id` for wrong options) wasn't investigated at all this session -
unknown scope, check before assuming it's the same risk profile as the hint half.

### 🟡 Needs human/AGENT-12 judgment — not gated on owner, but not mechanical either
- ~64 naked-kanji `jp` post-compound/qualifier cases (P1) — each may need a different ruby call
- `id=1240` `source` field — ambiguous jac-ch2 content (P3)
- EF接合 triple (id=459, 612, 613) — 3 cards, different content, merge candidate (P4)
- 6 same-jp ambiguous pairs: 124/842, 299/858, 862/309, 438/911, 482/819, 416/1182 (P4)
- 213 `desc` truncated mid-word + 266 missing period (~479 cards, P5) — needs real JAC PDF text,
  don't guess-fill these
- **New (P16, session 23):** what was wglv03 id=23 (now inside one of the wglv-id-* files —
  original numbering doesn't carry over, search by content: q starts "Apa bahasa Jepangnya
  'Membersihkan permukaan fusi'") has malformed `opts`: one entry looks like two merged options
  (`"融着面の清掃《...》b) 管の清掃《...》"`) and one empty string. Needs the original source to
  fix properly — didn't guess-fix it, just carried the malformed data through the split as-is.

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
| OD-4 | P10 | wglv02/03 hint: update to an ID-language clue, or keep as-is? | Not really open — see P10 detail above, "update" is the reasoned answer. What's actually blocking is the composition method, not this decision. |
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
