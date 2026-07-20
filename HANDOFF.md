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

**As of this edit, 2026-07-15 (session 24).** Verify before trusting past this point — this line
doesn't update itself.

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
- **`confusion-pairs.js` done (session 24).** Added `track` to all 28 entries — field didn't exist
  before. No in-file precedent, so methodology borrowed from the sibling `danger-pairs.js` (same
  shape, already had `track`) + `_MAP.md`'s "3 Study Tracks" table. Result: 27 `common` / 1
  `lifeline` (the crimping pair, matches danger-pairs' own lifeline-tagged crimping entry) / 0
  doboku/kenchiku. Lopsided on purpose, not on omission — flagged for a sanity check, easy to
  redo per-line if any single call is wrong. Commit `cbfc0de`, full reasoning in the commit body.
- **P3 done (session 24).** `id=1240` source: `vocab-supplementary` → `jac-ch2`. Evidence: sits
  between id=1238/1239/1241 (all jac-ch2, same kind of content — named insurance schemes off the
  same textbook list), and jac-ch2 is the dominant source for `category:"hourei"` anyway (76/94).
  Fixed across `cards.js`, `source/cards-common.js`, and moved the object from
  `cards/common/vocab-supplementary.js` → `cards/common/ch2.js` (split files are 1:1 with source
  value). Commit `bbcc070`.
- **P4 done (session 24) — no merges.** EF接合 triple (459/612/613) and all 6 same-jp pairs
  (124/842, 299/858, 862/309, 438/911, 482/819, 416/1182) reviewed individually — none merged.
  3 of 6 pairs are the established konsep+vocab dual-card pattern (one deeper explanation, one
  drill card with `usage`, same headword by design — 842/1182 even self-label `"(vocab)"` in
  `id_text`). The rest (299/858, 438/911, 482/819) are same-`type` but cover genuinely different
  angles (e.g. 299 teaches a 水平器/水準器 tool-confusion distinction 858 doesn't have; 438
  enumerates 4 bevel types 911 doesn't). Bonus fix found along the way: `id=438`'s `furi` had 4
  bevel-type readings from its own `desc` concatenated onto the headword reading
  (`かいさきかこうがたがたれがたいがた` → `かいさきかこう`, confirmed against sibling `id=911`'s
  clean furi for the identical headword). New furi anomaly found on the EF接合 triple itself —
  not fixed, see 🟡 bucket below. Commit `dae7aef`.
- **P1 done (session 24) — H2 sub-count was stale.** HANDOFF's "~64 naked-kanji jp
  post-compound" figure was CARD_CONTENT_SPEC.md's original audit number, never re-verified
  against live data. Fresh count: 12 (H1, the related "~152 in parens" figure, is fully at 0 —
  also stale, also never resolved). Fixed all 12, each cross-checked against something already
  in the corpus (sibling readings, usage-field precedent for common verbs like 見る) rather than
  guessed — see commit body for the full per-card evidence. Also fixed a second, pre-existing
  naked-kanji instance on id=1390 that was outside H2's own defined scope (leading 屋根工事,
  not just the trailing qualifier) — same card, same fix, no reason to leave it. Commit
  `a0fc3bf`. Surfaced a much bigger separate finding along the way — see 🟢 bucket above
  (split-file/mirror track drift, 316 cards).
- **P10 done (session 24) — both halves.** 61 copy-of-q wglv-jp hints rewritten term-by-term
  (not via blanket dictionary lookup — that was the exact risk flagged last session). Every
  hint checked against the term's own already-known correct answer so the component gloss has
  to support the known meaning, not just sound plausible. 100 empty wglv-id `opts_id` slots
  filled — 35 mechanically via cross-reference to an existing verified translation elsewhere in
  the corpus, 65 by real translation (standard construction/electrical/plumbing terminology).
  Split files + wayground-sets.js monolith both updated, 0 mismatches verified across every
  touched question. Commit `7bfc516`, full per-half methodology in the commit body. Also fixed
  a small furi bug found along the way (wglv-jp-01 id=31, 共板フランジ工法) — sibling id=30 in
  the same file showed the correct pattern directly. Commit `8766231`.
- No lint/build/test on this branch (`package.json`/`scripts/` other than the verify script are
  `main`-only) — `scripts/verify-content.mjs` is the only safety net right now.

---

## ACTIVE TASKS

Everything below is either gated or genuinely unstarted. Nothing here is a "just pick the first
one" list — check the gate before starting.

### 🔵 Gated on an owner decision — ask before starting
| Task | Depends on | What |
|---|---|---|
| P12 | merge time, not now | Drop `furi` from all split files |

### 🟡 Needs human/AGENT-12 judgment — not gated on owner, but not mechanical either
- 213 `desc` truncated mid-word + 266 missing period (~479 cards, P5) — needs real JAC PDF text,
  don't guess-fill these
- **New (P4, session 24):** EF接合 triple (id=459,612,613) `furi` fields are non-standard —
  459/612 nest `《》`-bracketed glosses *inside* the furi string itself (should be plain reading
  text); 613's furi doesn't read as "EF接合" at all, looks corrupted. No clean sibling to
  cross-reference (unlike id=438's furi contamination, fixed this session). Needs either the
  original source or a clearer read on this project's furi convention for EF/katakana-mixed
  terms before touching — don't guess.
- **New (P16, session 23):** what was wglv03 id=23 (now inside one of the wglv-id-* files —
  original numbering doesn't carry over, search by content: q starts "Apa bahasa Jepangnya
  'Membersihkan permukaan fusi'") has malformed `opts`: one entry looks like two merged options
  (`"融着面の清掃《...》b) 管の清掃《...》"`) and one empty string. Needs the original source to
  fix properly — didn't guess-fix it, just carried the malformed data through the split as-is.

### 🟢 Unblocked, no owner decision needed, just not done yet
- **New (found during P1, session 24): 316 cards' split-file folder disagrees with their source
  mirror about track.** `node scripts/audit-track-consistency.mjs` reproduces this — reads
  fresh, don't trust these numbers past this session either. Rule is 100% validated already
  (checked all 316, zero exceptions): each card's own `category` field always agrees with the
  **mirror**, never the split file, cross-checked against categories.js's per-category `tracks`
  array. So the fix direction is settled — move the split-file copy to match the mirror — this
  is mechanical, not a judgment call, just not done yet:
  - 253 cards sit in a `cards/lifeline/*.js` file but belong in `cards/common/`: 82 jac-ch5,
    43 jac-ch6, 39 jac-ch7, 77 vocab-supplementary, 9 jac-jitsugi1/2, 3 singletons
    (ch2/ch3/ch4). vocab-supplementary and vocab-jac targets already exist on the common side;
    ch5/ch6/ch7 don't have a common/ counterpart file yet — create them.
  - 63 cards sit in `cards/common/*.js` but belong in `cards/lifeline/`: 39 jac-ch4, 21 jac-ch3,
    3 jac-ch2. lifeline/ doesn't have ch2/ch3/ch4 files yet — create them.
  - Confirmed **zero live-app risk either way**: `scripts/merge-cards.mjs` (main-only, not on
    content-dq — read via `git show origin/main:scripts/merge-cards.mjs`) builds `cards.js`
    straight from `src/data/source/cards-*.js`; it never reads the split files under
    `src/data/cards/` at all. So this is purely an editing-layer consistency problem, not
    something reaching real users. That's *why* it wasn't executed this session — 316 cards
    across 6 new files was real effort for zero user-facing benefit, and P1's actual ruby fixes
    (live content) were the higher-priority use of the session. Good next-session task: fully
    mechanical, fully de-risked, just needs the time.

### ⏸ Blocked on external material
- P21 — JAC Doboku + Kenchiku jitsugi stubs — needs official PDF from owner
- PDF Viewer Mode — needs official PDF URL from owner

**P21 detail (investigated session 24, owner asked "why does doboku/kenchiku show up at all if
everything's sourced from JAC teori+praktik, which is common/lifeline only?"):** confirmed —
JAC Official (95 soal: tt1/tt2/st1/st2) and JAC Mockup (300 soal: jmt01-06/jml01-06) are 100%
`common`/`lifeline`, 0 `doboku`/`kenchiku`, both layers. `cards.js` same story — 0 cards tagged
doboku/kenchiku (`cards-doboku.js`/`cards-kenchiku.js` source mirrors both empty). Not luck:
`main` commit `1473acb` (v4.18.0) is titled "migrate doboku+kenchiku 157 cards to common",
reasoning "Ch.1-4 content belongs in common (all tracks)" — this exact failure mode got hit and
fixed once already. That commit isn't in content-dq's lineage (branch had already diverged), but
content-dq's current state independently satisfies the same invariant, so the fix still holds
here regardless of path.

The only current source of doboku/kenchiku-tagged content is **Quiz Internal**
(`quiz/doboku-01/02/03.js` + `kenchiku-01/02/03.js`, 90 soal) — AI-generated draft, not
JAC-sourced (matches its own catalog label: "belum ada PDF JAC asli buat validasi"). This is
exactly what this task is blocked on: `jac-doboku.js`/`jac-kenchiku.js` are empty stubs waiting
for the real PDF, and until it lands, the Quiz Internal drafts are the *only* content behind
those two tracks — not a bug, just the current state.

Worth knowing the actual weight of what's blocked here: doboku/kenchiku aren't a minor corner of
the app, they're 2 of its 3 onboarding tracks (`main`: `TrackPicker.jsx` — "Pilih Jalur Belajar" /
🏗️ Teknik Sipil · 🏢 Bangunan · ⚡ Lifeline — plus `DobokuMode.jsx`/`KenchikuMode.jsx`, both call
`getQuizSetsForTrack('doboku'|'kenchiku')` directly). Lifeline is fully JAC-sourced end to end;
doboku and kenchiku currently run on 100% unvalidated AI-generated questions until this PDF
shows up. (Also note: content-dq's own `src/components`/`src/modes` only has `FilterPopup.jsx` +
`FocusMode.jsx` — the full UI above, including TrackPicker/DobokuMode/KenchikuMode, is `main`-only
right now, consistent with P12 being deferred to merge time.)

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
