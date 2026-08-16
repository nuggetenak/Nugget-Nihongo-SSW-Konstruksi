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

**As of this edit, 2026-08-17 (session 27, new agent chat — owner provided repo+token directly,
same protocol as prior sessions).** Verify before trusting past this point — this line doesn't
update itself.

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
- **Split-file/mirror track drift, done (session 24).** Executed the fix diagnosed earlier this
  session (commit `e530fd7`) — all 316 mismatches reconciled, `node
  scripts/audit-track-consistency.mjs` now reports 0/1438. String-aware brace-depth parser
  moved each card's object verbatim (not reformatted) to the split-file folder its mirror +
  `category` already agreed on. 6 new files created (common/ch5.js, ch6.js, ch7.js;
  lifeline/ch2.js, ch3.js, ch4.js), 2 existing ones gained cards (common/vocab-jac.js,
  vocab-supplementary.js), 1 deleted (lifeline/ch7.js — all 55 of its cards were mismatched;
  ch7 is JAC's safety chapter, and safety is common-domain by definition, so a whole chapter
  moving isn't a red flag on the fix itself). verify-content.mjs clean, 1438 unchanged, all 78
  files parse. Commit `da7337d`, full reasoning in the commit body.
- **Scope reduced to Lifeline-only (session 24, owner decision).** Owner: "lost track of
  everything," wanted fewer moving parts. Dropped PDF Viewer Mode and the Doboku + Kenchiku
  tracks entirely — not a data-loss call, both tracks were still 100% AI-generated draft
  content (90 quiz questions total) with zero real JAC material, blocked on a PDF that may
  never arrive. P21 no longer exists as a task; there's nothing left to reconcile once that
  PDF shows up because there's no track left for it to feed.
  - Deleted: `jac-doboku.js`/`jac-kenchiku.js`, `source/cards-doboku.js`/`cards-kenchiku.js`
    (all 4 were empty stubs), `sets/quiz/doboku-01..03.js` + `kenchiku-01..03.js` (6 files,
    90 questions) — 10 files total, nothing archived, recoverable from git history before
    this point if ever needed.
  - Edited: `quiz-sets.js` (dropped DOBOKU_SETS/KENCHIKU_SETS + the track-tagging map),
    `index.js` + `jac-official.js` (dropped the JAC_DOBOKU/JAC_KENCHIKU exports),
    `categories.js` (dropped 5 placeholder categories — doboku_doko/hoso/haisui,
    kenchiku_kutai/shiage, all 0 cards anyway — simplified every `tracks` array to
    `['lifeline']`), `useTrackedCards.js` (JSDoc only). `_MAP.md` and
    `docs/CARD_CONTENT_SPEC.md` updated to match; `docs/DATA_ARCH_AUDIT.md` left alone (it's a
    dated point-in-time snapshot, not a living doc — same reason `docs/archive/` stays
    untouched).
  - Deliberately NOT touched: any card whose *content* mentions 土木/建築 as vocabulary (e.g.
    "which of these counts as doboku work" general-knowledge questions) — those are correctly
    common-track material a lifeline learner should still know, not a track-membership bug.
    Confirmed incidental before leaving them alone, not assumed.
  - verify-content.mjs + audit-track-consistency.mjs both clean throughout — this touches the
    track/quiz scaffolding around the cards, not the 1438 cards themselves, which are
    unchanged.
  - **Not done, flagged for merge time:** `main` branch has `TrackPicker.jsx` (3-way onboarding
    picker) and `DobokuMode.jsx`/`KenchikuMode.jsx` — real UI code content-dq doesn't have a
    copy of. These need the equivalent removal/update when this branch merges, same bucket as
    P12. Don't forget this exists just because content-dq's own tree looks clean now.
- **Session 25 (new agent chat — not a continuation of session 24's conversation; owner
  provided repo+token directly rather than uploading this file, same underlying protocol).**
  `verify-content.mjs` + `audit-track-consistency.mjs` re-run fresh: both clean, numbers
  unchanged from session 24's close (1438 cards, 0 drift). Checked ACTIVE TASKS before starting
  anything: 🟢 bucket still empty, all 3 🟡 items still need source material or a non-mechanical
  owner call, P12 still gated on merge time. No PDF this session — owner confirmed directly,
  also checked `/mnt/user-data/uploads` (empty). Still waiting, see ⏸ below.
  - **Found + fixed one thing outside the tracked task list:** `README-CONTENT-DQ.md`'s tree
    still listed 5 files session 24's `d55ac3c` deleted (`cards-doboku.js`/`cards-kenchiku.js`
    stubs, `jac-doboku.js`/`jac-kenchiku.js` stubs, the whole `sets/quiz/` folder) — that commit
    updated `_MAP.md`/`CARD_CONTENT_SPEC.md` to match (verified: their remaining doboku/kenchiku
    mentions are correctly-phrased historical notes, not stale refs) but missed this file. Also
    corrected `quiz-sets.js`'s description (no longer has its own working-copy folder — that
    folder's gone, it's a pure aggregator now: `QUIZ_SETS = [...WAYGROUND_SETS,
    ...JAC_MOCKUP_SETS]`, confirmed by reading the file) and added `jac-official.js` to the tree
    (a pre-existing 4-line backward-compat shim, already documented in
    `_MAP.md`/`CHANGELOG.md`/`DATA_ARCH_AUDIT.md`, never listed here). Every file the corrected
    tree names now checked against the real filesystem — clean match either direction. No
    content/`src/data/` changes, the 1438 cards untouched. Commit `cbb7ff6`.
  - **Later, same session: first 2 of 4 teori PDFs arrived** (ch1 `日本の現場で大切にしていること`
    as `text1l.pdf`, ch2 `日本の現場で働く上で守らなければならない法令` as `text2.pdf`). Owner said
    PDFs are coming incrementally ("one by one" — token cost was a concern on their end) — don't
    expect all 7 (4 teori + 3 praktik) in one drop. Full intake tracker moved to ⏸ below (upgraded
    from a static note into a per-chapter table, since this is now clearly multi-session).
  - **P5 partial: 22 of 479 desc-truncation cards completed**, scoped exactly to what ch1+ch2
    cover (source=jac-ch1 ∪ jac-ch2, 130 cards checked, 95 already fine, 22 fixed, 5 left
    genuinely unresolved even with these 2 chapters — see commit body for the id-by-id
    reasoning on both the fixed and the deliberately-skipped ones, it's long and shouldn't be
    duplicated here). 3 of the 22 (149, 157, 159) involved one small inferential step beyond
    direct restatement — flagged in the commit in case the owner reads them differently. Caught
    and corrected one own error pre-commit: a mis-keyed furigana reading (事業主 as じぎょうしゃ,
    should be じぎょうぬし per the card's own jp/furi fields — this project's existing data was
    right, the draft fix was wrong). Also flagged but did **not** touch: id=468 (`category:
    "haikan"`, piping-technique content) is tagged `source: "jac-ch2"` despite ch2 being pure
    law content with nothing resembling this topic — smells like a source mistag, not something
    P5-style completion can resolve; needs an owner look, not guessed at. verify-content.mjs +
    audit-track-consistency.mjs both re-run clean after (1438 unchanged, no adds/removes/moves).
    Commit `61c180a`.
  - **Later still, same session: 3rd teori PDF arrived (ch3), scoped + fixed the same way.**
    source=jac-ch3 (183 cards): 100 already fine (some end in Japanese 。, not just Latin . —
    a real second valid convention in this dataset's newer cards, not a bug; learned this after
    initially over-flagging complete ①②③ enumerations as truncated), 56 fixed, 4 left open
    (insufficient PDF detail — 砥石/発信機/保安器/真空ポンプ, see commit body). Process catch:
    jac-ch3 cards aren't all in `common/ch3.js` — they span 8 files including 3 `lifeline/*.js`
    ones (content sourced from ch3's text but used in lifeline-track vocab). First fix pass
    missed those + had a find-replace bug for fragment-only old-strings (fine for full-string
    matches, silently failed for partial ones); both caught via the fix script's own
    should-have-matched-somewhere check, corrected, re-verified two independent ways (direct
    per-id punctuation check + fresh verify-content.mjs/audit-track-consistency.mjs, both
    clean, 1438 unchanged). Commit `dca925e`. P5 running total: 78/479 done.
  - **Part 4, due diligence pass (owner asked explicitly): 2 cards from part 3 recovered.**
    A full corpus-wide re-scan (not a re-read of the earlier triage) turned up id=1349 and
    id=1369 — both correctly analyzed and drafted during part 3, but dropped when that part's
    fix script got rewritten mid-stream to fix the fragment-matching bug; neither made it into
    the script that actually ran. Every other jac-ch1/ch2/ch3 card still failing the
    terminal-punctuation check matched one of the two documented lists (known skips or known
    false-positive enumerations) exactly — these 2 didn't match either, which is what surfaced
    them. Fixed same as the rest of the batch, verified against the source text. Also checked:
    file syntax (direct `import()` of all 8 touched files — clean), the 1438/97/1244/97/877/561
    breakdown in this section (re-verified against live data — still exact), and
    `docs/CARD_CONTENT_SPEC.md` + `_MAP.md` for other stale numbers while already in there (found
    a few — see those files' own histories; not duplicating here). Commit `1afb7a2`. **P5 running
    total, corrected: 80/479.**
- **Session 26 (2026-08-16, new agent chat).** `verify-content.mjs` + `audit-track-consistency.mjs`
  re-run fresh at start per protocol: both clean, 1438/0 unchanged from session 25's close. Checked
  ACTIVE TASKS before starting: 🟡 bucket's 3 items still gated the same way; PDF intake tracker
  showed ch4 (teori) and ch5/6/7 (praktik) all still ⏸. Owner attached 2 PDFs directly in this
  session's first message: `text4.pdf` (matches teori ch4 — 現場で使われるあいさつ・用語・共同生活上の
  注意 — confirmed by content match, not just filename) and `text5l.pdf` (matches praktik ch5 —
  工具・機械・材料・計測器の知識, cover page literally says 試験区分(ライフライン・設備)). These are
  the last teori PDF and the first of 3 praktik PDFs — fills 2 of the tracker's 4 remaining ⏸ rows.
  - **P5 continued: 94 of the newly-unlocked 365 jac-ch4/jac-ch5 cards fixed** (149+216 checked,
    269 already had proper terminal punctuation, 94 fixed, 2 left open). Full id-by-id breakdown,
    the 2 left-open cases, 6 in-passing ruby-bug fixes (all directly verifiable from each card's
    own jp/furi field, not guessed), and 2 newly-flagged-but-not-fixed issues (an id_text/jp
    6-word-vs-3-covered mismatch on id=585, and 8 id_text fields that dangle on a conjunction —
    different shape than P3's already-done "ends in /" pattern) are all in commit `b00bdf2`'s body,
    not duplicated here. Same working pattern as session 25 (`61c180a`, `dca925e`): filter by
    `source === "jac-chN"`, cross-reference each candidate against the actual PDF passage, complete
    only what's directly supported, leave the rest flagged. Grepped the whole `src/data/cards/`
    tree per id rather than assuming `common/ch4.js`/`common/ch5.js` — HANDOFF's own warning about
    jac-ch3 spanning 8 files held again here too (ch4/ch5 content also landed in
    `vocab-supplementary.js` and, for ch5, `lifeline/ch6.js`). Fixes were dry-run-previewed before
    writing to any file (concatenation seams checked programmatically for missing spaces / doubled
    words) after an initial draft pass had exactly that bug throughout — worth a next-agent note:
    when completing a truncated string via `oldValue + suffix`, always check the seam, not just the
    final sentence in isolation. verify-content.mjs + audit-track-consistency.mjs both clean after,
    1438 unchanged (desc text only, no adds/removes/moves), quote style preserved per-file. **P5
    running total: 174/479.** Remaining: jac-ch6 (133 cards, praktik) and jac-ch7 (47 cards,
    praktik) — both still need their PDF.
- **Session 27 (2026-08-17, new agent chat).** `verify-content.mjs` + `audit-track-consistency.mjs`
  re-run fresh at start: both clean, 1438/0 unchanged from session 26's close. Checked ACTIVE
  TASKS first per protocol. Owner attached `text6l.pdf` (ch6: 施⼯に関する知識) in this session's
  opening message — the exact chapter HANDOFF's tracker had called out to prioritize (see the old
  🟡 EF接合 entry and the PDF tracker's own note below).
  - **P5 continued: 66 of jac-ch6's 133 cards fixed** (65 already fine, 66 fixed, 1 left open —
    id=1325, トンネルの4種類, content not present anywhere in text6l.pdf at all, flagged as a
    likely source mistag rather than completed from nothing). Highest truncation rate of any
    chapter processed so far (68/133 ≈ 51%, vs 17-31% for ch1-ch5) — matches
    CARD_CONTENT_SPEC.md's existing note that ch6 was the priority chapter for mid-word
    truncations. Full id-by-id breakdown in commit `5447c94`'s body.
  - **EF接合 triple (459/612/613) furi issue resolved** — this was the other thing flagged
    specifically for ch6's arrival. Rather than guess at a fix, ran a corpus-precedent search
    first (19 + 20 + 35 comparable cards checked across three different jp-shape categories) and
    found the earlier "nested brackets are the bug" framing was itself an overcorrection — nesting
    is established convention (8 other cards do it). The real, evidence-backed issue was narrower:
    459's parenthetical is pure katakana (needs no furigana at all) and 612's already has its
    reading inline in `jp` (so furi needn't repeat it) — both come out to the same fix, furi →
    `"EFせつごう"` for all three. 613 turned out to be simple corruption, not a convention
    question: its furi/jp both held the verbatim reading of an unrelated later procedure step,
    now corrected. Full evidence trail (which precedent cards, what pattern each showed) is in
    commit `5447c94`'s body — worth reading in full before treating this class of "furi looks
    wrong" flag as unfixable without new PDF material in the future; sometimes the codebase
    itself already has the answer.
  - **Process note:** this batch's dry-run caught a new failure class beyond ch4/ch5's
    missing-space bug — whole-phrase repeats where the natural sentence continuation restated
    words already sitting right at the truncation point, invisible to a single-adjacent-word
    checker. Escalated the checker in three steps this session (word → n-gram → raw substring)
    as each prior version let something through; ended up needing all three plus a paren-balance
    check (caught one card, id=979, that wasn't actually truncated — it wasn't missing content at
    all, just a period). Next chapter (ch7) should start with the full checker already assembled
    rather than rebuilding it step by step again.
  - verify-content.mjs + audit-track-consistency.mjs both clean after (1438 unchanged, 0/1438
    track disagreements). Commit `5447c94`.
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
- **P5, partial:** 213 `desc` truncated mid-word + 266 missing period (~479 cards total) — needs
  real JAC PDF text, don't guess-fill these. **240 done so far** — session 25: 22 from
  jac-ch1/jac-ch2 (commit `61c180a`) + 58 from jac-ch3 (`dca925e` + `1afb7a2`); session 26: 94 from
  jac-ch4/jac-ch5 (`b00bdf2`); session 27: 66 from jac-ch6 (`5447c94`). ~239 still open: jac-ch7
  only (47 cards, praktik, still needs its PDF) — see the PDF intake tracker under ⏸ below. (The
  ~239 vs. 479-240=239 doesn't perfectly reconcile against the per-chapter card counts because the
  ~479 was always an estimate, not an exact pre-count — see each session's commit body for the
  actual checked/fixed/already-fine split per chapter.) Also still open even with a PDF available:
  id=94, 152, 160, 957 (from ch1/ch2), id=410, 966, 1063, 1143 (from ch3), id=93, 1190 (from ch5),
  id=1325 (from ch6) — none had enough specific detail in the provided chapter text to complete
  safely, see each commit body for the id-by-id reasoning. Separately flagged, not a P5 case:
  id=468 (source mistag, piping content tagged jac-ch2); id=585 (id_text/jp say "6 istilah" but
  desc only ever drafted 3 of them — pre-existing mismatch, not something a truncation-fix should
  silently expand to cover); 8 id_text fields (131, 223, 242, 245, 411, 591, 1373, 1378) in
  jac-ch4/ch5 that dangle on a conjunction/preposition — different shape than P3's already-done
  "ends in /" pattern, likely a separate undiscovered instance of the same underlying issue, needs
  its own pass rather than folding into P5.
- **New (P16, session 23):** what was wglv03 id=23 (now inside one of the wglv-id-* files —
  original numbering doesn't carry over, search by content: q starts "Apa bahasa Jepangnya
  'Membersihkan permukaan fusi'") has malformed `opts`: one entry looks like two merged options
  (`"融着面の清掃《...》b) 管の清掃《...》"`) and one empty string. Needs the original source to
  fix properly — didn't guess-fix it, just carried the malformed data through the split as-is.

### 🟢 Unblocked, no owner decision needed, just not done yet
*(none right now.)*

### ⏸ Blocked on external material — PDF intake tracker
7 source PDFs total: 4 teori (common, ch1–4) + 3 praktik (lifeline jitsugi, ch5–7). Owner is
providing them incrementally, not as one batch — token cost was an explicit concern on their
end (session 25). Don't expect all 7 at once; don't treat "only some are here" as blocked, work
whatever the available chapters unlock (see P5 in 🟡 above for the main thing this feeds).

| # | Chapter | JAC content covers | Status | Filename |
|---|---------|---------------------|--------|----------|
| 1 | teori ch1 | 日本の現場で大切にしていること (teamwork, 施工体制, CCUS, あいさつ, 朝礼) | ✅ received session 25 | `text1l.pdf` |
| 2 | teori ch2 | 働く上で守らなければならない法令 (labor law + 15 other laws) | ✅ received session 25 | `text2.pdf` |
| 3 | teori ch3 | 建設工事の種類と業務 (construction work types/trades — largest teori chapter, 183 cards) | ✅ received session 25 | `text3.pdf` |
| 4 | teori ch4 | 現場で使われるあいさつ・用語・共同生活上の注意 (site terminology, shared-living notes) | ✅ received session 26 | `text4.pdf` |
| 5 | praktik ch5 | Lifeline jitsugi (216 cards — largest single chapter) | ✅ received session 26 | `text5l.pdf` |
| 6 | praktik ch6 | Lifeline jitsugi (133 cards — highest truncation rate of any chapter, 51%) | ✅ received session 27 | `text6l.pdf` |
| 7 | praktik ch7 | Lifeline jitsugi (47 cards) | ⏸ not yet | — |

6 of 7 source PDFs are now in. Only ch7 (47 cards, praktik) remains outstanding — this is the
last chapter needed to close out P5 entirely.

Next agent, regardless of what this table says: check `/mnt/user-data/uploads` yourself at the
start of your session — the table can go stale, the upload check can't lie. When ch7 lands, the
pattern from sessions 25-27 (commits `61c180a`, `dca925e`, `b00bdf2`, `5447c94`) is reusable:
filter `cards.js` by `source === "jac-ch7"`, check each candidate's actual `desc` against the
specific PDF passage it should match, complete only what's directly supported, leave the rest
flagged rather than guessed. Before writing anything, dry-run the concatenation (`oldDesc +
suffix`) and run it through a real checker, not just a read-through — by session 27 this had grown
into three layers (adjacent-word, then n-gram phrase, then raw-substring-for-glued-tokens) plus a
paren-balance check, each added after the previous one let something through. Build the full
checker from the start for ch7 rather than re-discovering each layer again; see `p5_fixes_ch6.mjs`
committed to `5447c94`'s tree state (in git history, not present in the working tree) for what the
final version looked like, or just reconstruct: (1) exact adjacent-word repeat, (2) repeated 2-3
word n-grams, (3) repeated raw substrings ≥6 chars to catch same-word collisions across a glued
Japanese/Indonesian boundary with no space, (4) open-paren count equals close-paren count — the
last one exists because id=979 in ch6 turned out not to be truncated at all (just missing a
period after an already-closed paren); treating every flagged card as "needs more content" without
checking this first will occasionally produce broken parens on cards that only needed a period.

**The EF接合 furi issue (previously flagged here) is resolved** — see session 27's CURRENT STATE
entry and commit `5447c94` for the fix and its full evidence trail. If a similarly-flagged
"furi looks wrong, needs convention clarity" item comes up again: search the corpus for
comparable jp-shapes first (romaji-abbrev+ruby+parenthetical-gloss; pure-katakana parenthetical;
mixed katakana+kanji parenthetical) before concluding it's unfixable without new material — the
existing corpus often already encodes the convention, it just takes a few `grep`-equivalent
passes to surface it.

**Don't assume `source: "jac-chN"` cards all live in `common/chN.js`.** The ch3 batch spanned 8
files: mostly `common/ch3.js`, but also `common/vocab-supplementary.js` and — less expected —
`lifeline/ch3.js`, `lifeline/ch5.js`, `lifeline/ch6.js` (content originally drawn from ch3's
text, filed under lifeline-track vocab because that's what the term is actually used for in
practice). ch4/ch5 (session 26) and ch6 (session 27) held the same pattern each time — 7-8 files,
not 1, including `vocab-supplementary.js` and at least one lifeline/*.js file that doesn't match
the chapter number. Grep the whole `src/data/cards/` tree for each id before assuming its
split-file location, don't stop at wherever the majority happen to be. Same goes for the source/
mirror: both `cards-common.js` and `cards-lifeline.js` may need the same fix.

*(P21 and PDF Viewer Mode themselves no longer exist — dropped session 24 along with the
Doboku/Kenchiku tracks. See the scope-reduction entry in CURRENT STATE — unrelated to this
tracker, noted here only because this section used to carry that note.)*

---

## OPEN DECISIONS

| ID | Blocks | Question | Status |
|----|--------|----------|--------|
| OD-1 | P6, P13 | Source labels: retain legacy vs merge into `vocab-supplementary`? | ✅ Answered 2026-07-11: merge |
| OD-2 | P16, P8b, P10, P11 | wglv split: do it now or at merge time? | ✅ Answered 2026-07-11: now |
| OD-3 | P17 | jac-mockup rename: now or at merge time? | ✅ Answered 2026-07-11: now — P17 done |
| OD-4 | P10 | wglv02/03 hint: update to an ID-language clue, or keep as-is? | ✅ Resolved via execution 2026-07-15 — P10 done (both halves), see CURRENT STATE. "Update" was the reasoned answer, not a coin flip; what had stopped session 23 was the composition method, not this decision. |
| OD-5 | P12 | Separate SSW Flashcards repo: does it consume `card.furi`? (affects whether it's safe to drop) | Open — doesn't block anything until merge time (P12), not urgent |

Full rationale for each: `docs/CARD_CONTENT_SPEC.md` §12.

---

## RULES

- Run `scripts/verify-content.mjs` before and after any edit to `src/data/`
- Run `scripts/audit-track-consistency.mjs` after any edit that moves a card between
  `src/data/cards/common/` and `src/data/cards/lifeline/`, or changes a card's `category` or
  `source` field — it catches split-file/mirror track drift that `verify-content.mjs`'s
  count-only check can't see (this is how the 316-card drift fixed session 24 went unnoticed
  for however long it built up)
- Commit per task: `CONTENT: [task] — [short description]` (or `ADMIN:` / `DOCS:` for non-content)
- Mirror edits: split file → `src/data/source/cards-*.js` → `src/data/cards.js`, all three. Then
  verify. The session-23 corruption happened because step 3 wasn't checked before commit.
- Never push to `main`
- Ambiguity → write it down here, ask the owner, don't guess and proceed
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
