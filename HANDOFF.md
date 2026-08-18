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

**As of this edit, 2026-08-18 (session 29, new agent chat — owner provided repo+token directly,
same protocol as prior sessions).** Verify before trusting past this point — this line doesn't
update itself.

- **Entire 🟡 bucket from session 28 resolved this session. 8 content commits, all pushed:**
  - id=468 + id=470 (found the second while investigating the first) — source mistag jac-ch2→
    jac-ch6, corpus-precedent backed (6 sibling flange/duct cards + a near-duplicate already on
    ch6). Commit `c641e8c`.
  - All 9 dangling `id_text` (131/223/242/245/411/524/591/1373/1378) completed — 7 sourced
    directly from the same card's own `desc`/`jp`/`usage` field, 2 (242/591) on owner's exact
    wording call ("di proyek konstruksi"). Bonus: id=223's `desc` had a ruby corruption
    (`転《ころ》びび《ころび》`→`転び《ころび》`), fixed from its own `usage` field. Commits
    `cce78ba`, `21fa830`.
  - Scope-mismatch cluster (223/517/530/533/585) completed from general construction/safety
    knowledge, owner-authorized, same provenance basis as the 13 `desc` cards below. ⚠️ Not
    JAC-source-verified — re-check if ch4/ch7 PDF material ever resurfaces. Also caught id=585's
    `id_text` disagreeing with its own `jp` on term count (said 4, `jp` lists 6) — corrected.
    Commit `042aa84`.
  - wglv-id-02's "malformed opts" card (search: "Membersihkan permukaan fusi") was worse than
    originally described — a list-merge artifact contaminating 3 fields plus 2 junk `opts_id`
    slots plus a blank option, not "one merged option + one blank." 4/5 fixed directly; the blank
    JP term resolved below via corpus precedent. Commit `0358d3b`.
  - **Found while scoping that same card further: the "opsi lain"/repeated-question `opts_id`
    defect is systemic, not isolated** — 16 of 120 questions across all 3 `wglv-id-*` files (12
    "opsi lain" slots + 8 repeated-question slots). Two mechanical signatures: repeated-question
    slots are pure extraction (the ID phrase is already quoted inside `q`), "opsi lain" slots
    needed real translation cross-checked against how the same term is already rendered
    elsewhere in this corpus. All 16 resolved. Also fixed 2 more ruby corruptions of the exact
    same "redundant full-phrase ruby on a sub-part" shape as id=223 above, and a `ダグタイル`→
    `ダクタイル` kana typo spread across 5 questions (confirmed against the correctly-spelled
    form used dozens of times elsewhere). A broad ruby-length heuristic thrown at the rest of
    the file family came back too noisy to trust (~100 hits, nearly all false positives from
    mixed kanji/kana runs) — abandoned rather than acted on; a real audit of what's left needs
    P8b's dictionary-cross-reference approach, not a length heuristic. Commit `af9534f`.
  - wglv-id-02's blank `opts[0]` ("Fiksasi pipa dan fitting" survived, its JP term didn't)
    resolved by corpus precedent, not a guess — `wglv-id-01#27` already pairs the identical
    Indonesian phrase with `管と継手の固定《かんとつぎてのこてい》`.
  - `wglv-jp-02` ids 16–24 (9 cards, complete JP-headword loss) — all 9 reconstructed. **New
    methodology this session:** grounded the less-obvious terms in live web search against real
    Japanese trade/manufacturer documentation (Sekisui Chemical + Kubota Chemix official
    EF-pipe-joint installation manuals, a water utility's install spec, POLITEC industry-
    association pages) rather than working from memory alone — this is real SSW exam-prep
    content, wrong technical vocabulary is worse than leaving it flagged. `ターミナルピン` and
    `スクレープ` confirmed verbatim against manufacturer documentation, not inferred.
    `通信工事`/`地中配管` are standard compounds not source-verified beyond general usage —
    lower-confidence than the rest of this batch, worth a re-check if source material turns up.
    Commit `b026998`.
- **Repo hygiene pass (owner-requested, session 29) — commit `4fcf60f`, full reasoning in the
  commit body.** Full-tree audit before touching anything, two findings:
  - Moved 3 files with zero references anywhere and import paths that don't resolve on this
    branch (`FilterPopup.jsx`, `useTrackedCards.js`, `FocusMode.jsx` — depended on `theme.js`/
    `ProgressContext.jsx`/`SprintMode.jsx`/`*.module.css`, none of which exist here) to
    `legacy/unwired-app-code/` rather than deleting outright, since their dependencies did once
    exist on this branch and were removed in an apparently-incomplete earlier scaffold trim —
    see that folder's own README for the full trail and a one-line delete command if that's the
    eventual call.
  - **Did NOT touch `sets/jac/*.js` vs top-level `jac-teori.js`/`jac-lifeline.js`**, despite
    looking identical in shape to the above at a glance (unwired split files sitting next to
    what the app actually imports). This is documented, intentional, merge-time-gated technical
    debt, not cruft — `docs/DATA_ARCH_AUDIT.md` (2026-05-12) already found and fully explained
    it, and P22 reconfirmed `sets/jac/` as deliberately out-of-scope as recently as session 28.
    Added to the merge-time reconciliation list below since the only place this was tracked was
    a 3-month-old audit doc easy to forget exists.
  - `README.md`'s card/question counts were stale (1,443 / ~974, predating the 5-duplicate
    cleanup and the session-24 Doboku/Kenchiku removal) — corrected to 1,438 / ~1,075.
- 1,438 cards total — 97 konsep / 1,244 vocab / 97 hukum (877 common + 561 lifeline). Unchanged
  this session — no cards added or removed, only field-level content fixes.
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
- **Session 28 (2026-08-17, new agent chat).** `verify-content.mjs` + `audit-track-consistency.mjs`
  re-run fresh at start: both clean, 1438/0 unchanged from session 27's close. Checked ACTIVE
  TASKS first per protocol. Owner attached `text7l.pdf` (ch7: 建設工事の安全) directly in this
  session's opening message — the 7th and last of the tracked source PDFs.
  - **P5 done — jac-ch7 was the last chapter, PDF intake now complete.** Scoped source===jac-ch7
    across the whole `src/data/cards/` tree (landed in 4 files, not just `common/ch7.js` — same
    multi-file pattern as every prior chapter). 47 total: 27 already had proper terminal
    punctuation, 18 fixed, 2 left open (530, 624 — source too thin to complete safely, see commit
    `60dcf1a`'s body for why each specifically can't be guessed). Also caught 7 bonus `furi`/`jp`-
    ruby corruption fixes along the way (a pattern distinct from anything previously flagged: the
    correct headword reading with an unrelated extra reading concatenated onto the end, always
    traceable to content elsewhere on the same card) — each cross-checked against a clean
    precedent already in the corpus, not guessed. Full id-by-id evidence in commit `60dcf1a`.
  - **P5 final accounting:** was 240/479, now 258/479 (+18). Calling this done rather than
    partial because every one of the 7 source chapters has now been checked against its real
    textbook text at least once — there's no more incoming material that unblocks further
    mechanical progress. The ~221 gap from the original 479 estimate is the already-enumerated
    flagged list below (permanently open pending source material that may never arrive) plus
    slack in the original estimate itself, which HANDOFF always caveated as approximate — every
    chapter's real fixed-count came in under a proportional share of it, ch7 included.
    Still-flagged ids, carried forward from every chapter: 94, 152, 160, 957 (ch1/ch2); 410, 966,
    1063, 1143 (ch3); 93, 1190 (ch5); 1325 (ch6); 530, 624 (ch7, new this session).
  - **Also found, not a P5 case, not fixed (flagging per the established id=585 pattern):** 517
    and 533 (like 530 above) each have a `jp` field listing 2-3 combined terms but `desc` only
    ever covers the first — complete, correctly-punctuated sentences, so not a truncation defect,
    just a scope choice nobody expanded. And id=524's `id_text` ("8 materi K3 wajib untuk")
    dangles on a preposition — adding it to the already-tracked list of 8 similar id_text
    instances (131/223/242/245/411/591/1373/1378) from ch4/ch5; still out of P5's scope (that's
    `desc` only), still not touched.
  - **In passing:** CURRENT STATE's own top summary line ("P0–P5, ... all done") already listed
    P5 as done before this session — it wasn't, ACTIVE TASKS' own 🟡 bucket said so directly one
    section down. Doesn't need a fix now since P5 actually is done as of this commit, but flagging
    the drift in case the same top-line/ACTIVE-TASKS disagreement pattern recurs for a different
    P-number later — that line doesn't auto-verify against ACTIVE TASKS the way the card counts
    auto-verify against `verify-content.mjs`.
  - verify-content.mjs + audit-track-consistency.mjs both clean after (1438 unchanged, 0/1438
    track disagreements). Commit `60dcf1a`.
  - **P22 done (new task, owner-requested, not pre-existing) — quiz quality uplift across all
    non-JAC quiz sets.** Full writeup in ACTIVE TASKS; compact version here. Corpus 957→980
    questions (957 was 5 files' worth pre-P22; +23 authored for count-equalization, 0 deleted).
    Every question now 4-option (was 657×3-opt/300×4-opt) and rebalanced: `wglv-*` (236q) via
    pooled-sampling from the corpus's own answer terms, `wgl01-10`+`wt01-10`+`wtv01` (419q, the
    bulk of the work) hand-authored one distractor per question after an automated approach was
    tried and reverted for producing category-mismatched junk. `wayground-sets.js` monolith
    regenerated wholesale twice (once fixing a pre-existing 21/27 set-id/track drift vs. the split
    files, once after the 419 distractors landed) rather than hand-patched either time. Two census
    items resolved by investigation rather than by editing: 288 "duplicate questions" turned out
    to be a deliberate cumulative-review/mock-exam-compilation architecture (jml/jmt compile from
    wgl/wt; wt06 compiles from wt01-05+wt08) and weren't touched; 157 thin `exp` fields turned out
    to be 148 already-adequate and 9 a genuinely different bug (wglv-jp-02 ids 16-24 lost their
    Japanese headword entirely, predates this session) — flagged in the 🟡 bucket, not fixed.
    verify-content.mjs + audit-track-consistency.mjs clean throughout (this task never touches
    `src/data/cards*`, only `src/data/sets/` + the wayground monolith). Commits `4957188` →
    `d4f3c86` (see git log for the full sequence; ~13 commits, content and docs interleaved).
- No lint/build/test on this branch (`package.json`/`scripts/` other than the verify script are
  `main`-only) — `scripts/verify-content.mjs` is the only safety net right now.

---

## ACTIVE TASKS

Everything below is either gated or genuinely unstarted. Nothing here is a "just pick the first
one" list — check the gate before starting.

### 📋 Merge-time reconciliation list — NOT blockers (owner decision, session 28)
**These used to be filed as blockers for P12. They aren't.** Owner has explicitly accepted that
content-dq may break `main` and that reconfiguring `main` is merge-time work. Keeping the list
because it's the reconciliation checklist someone will need at merge — it took a session to
compile and shouldn't have to be rediscovered. `main` reads `card.furi` in at least these places:

| Consumer on `main` | What breaks if `furi` is dropped |
|---|---|
| `src/tests/data.test.js:34` | Test literally named *"every card has furi field (Phase 1)"*, asserts `CARDS.filter(c => c.furi == null)` is empty. Dropping furi fails CI immediately. |
| `src/modes/GlossaryMode.jsx:48,54` | Sorts the whole glossary by `furi` **and** groups entries by `furi[0]` for the A-Z jump nav. Without furi every card falls into a single `'?'` bucket — the mode's primary navigation stops working. |
| `src/modes/ProductionMode.jsx:34` | `if (card.furi && trimmed === card.furi) return true` — the kana reading is an **accepted correct answer**. Dropping furi silently starts marking correct answers wrong. |
| `src/modes/FlashcardMode/FlipCard.jsx:90,137` | Renders `furi` on the card back and passes it to `JpDisplay`. |
| `src/modes/SearchMode.jsx:38,70,177` | Search haystack, result label, and the reading line under each hit. |
| `src/modes/QuizMode.jsx:68` | `q.card.furi` feeds the quiz prompt's reading. |
| `src/modes/ConfusionMode.jsx`, `src/components/Onboarding.jsx` | Also reference furi (not audited line-by-line — the six above are already disqualifying). |

At merge time each of those six needs `card.furi` swapped for `extractReading(c.jp)` off the
`《》` ruby (that's what P1 exists to guarantee), and `data.test.js`'s "every card has furi field
(Phase 1)" test needs deleting or rewriting — the test encodes the *old* invariant on purpose, so
it failing is the expected signal, not a regression. `SearchMode.jsx` already imports a
`stripFuri`, so part of the helper may exist already.

**Also merge-time, unrelated to `furi`:** `sets/jac/jac-teori.js` (65q) + `sets/jac/jac-lifeline.js`
(30q) are the DQ-migrated, new-schema (`q`/`hint`/`opts`/`ans`/`img`/`exp`) working copies —
`index.js` currently imports the top-level `jac-teori.js`/`jac-lifeline.js` instead, which are
still on the pre-migration schema (`jp`/`hiragana`/`options`/`answer`/`hasPhoto`). Original
finding + full field-mapping table: `docs/DATA_ARCH_AUDIT.md` §4/§6 (D1–D3), 2026-05-12 — still
accurate as of session 29, re-confirmed rather than re-derived. At merge: replace the top-level
files with the `sets/jac/` versions (same swap pattern as the `wayground`/`jac-mockup` monoliths
already went through).

### 🔵 Gated on an owner decision — ask before starting
*(none right now — OD-5 resolved by investigation, see OPEN DECISIONS.)*

### 🟡 Needs human/AGENT-12 judgment — not gated on owner, but not mechanical either
*(empty — the whole session-28 bucket was resolved session 29. Full accounting in CURRENT STATE,
commits `c641e8c` through `b026998`. Nothing currently sits in this bucket; the next 🟡-shaped
item found during future work starts a fresh list here rather than reopening this one.)*

### 🟢 Unblocked — owner decision 2026-08-17 (session 28), ready to start
**Owner clarified the whole branch's contract:** *"branch content-dq emang cuma buat maintain and
fix all the quality of the content. I intended to do so even if it breaks main branch, because
emang nanti pas merge ke main harus reconfig & readjust semuanya."* That settles the question the
P12 writeup below was stuck on. **Breaking `main` is expected and accepted here; reconciliation is
merge-time work by design.** Don't re-litigate this — a future agent finding `card.furi` consumers
on `main` should treat that as a merge-time TODO to record, not as a reason to stop.

| Task | What | Status |
|---|---|---|
| P12 | Drop `furi` from all split files | **Unblocked.** The 6 `main` consumers listed below are now merge-time reconciliation items, not blockers. Still genuinely unstarted — nobody has done it yet. Do P1 first if it isn't fully done (P12 depends on `《》` ruby in `jp` being complete, since `extractReading(c.jp)` is the intended replacement). |
| **P22** | Quiz set equalization + question/option quality uplift, all non-JAC sets | ✅ **Complete (session 28).** Owner-requested 2026-08-17, not a pre-existing item. Full writeup below — 1 residual flag spun to the 🟡 bucket at the time (wglv-jp-02 headword loss), resolved session 29, see CURRENT STATE. |

#### P22 — Quiz quality (NEW, owner-requested session 28) — ✅ COMPLETE
Owner: *"before merging with main, aku pengen semua quiz (selain yang resmi dari JAC) itu semuanya
jumlah soal merata, kualitas soal & opsi jawabannya juga ditingkatkan."* This was **not** on the
task list in any form — P8a/P8b/P10/P11 each touched quiz sets, but all four were narrow
defect-fixes on `wglv` only (ruby, empty `opts_id`, circular `exp`). Scope was all non-JAC sets —
`wayground/**` + `jac-mockup/**`. `sets/jac/` (jac-teori 65q, jac-lifeline 30q) was **out of
scope** throughout and was never touched.

**Final state: every one of the 5 original findings is resolved.**

| Finding (original census) | Resolution |
|---|---|
| `ans:0` on 432/957 = 45%, concentrated in `wgl`/`wglv` | ✅ Fixed. All non-JAC questions now 4-option and rebalanced; see below. |
| 657 questions at 3 options, 300 at 4 | ✅ Fixed. **0 questions left at 3 options** (was 419 after wglv's 236 were done first). |
| Question counts uneven across sets in a family | ✅ Fixed. +23 authored (nothing deleted): `wt01` 19→20, `wglv-id-01/02/03`+`wglv-jp-03` 39→40 each, `wtv01` 22→20 + new `wtv02` (20, 2 moved + 18 authored). `jml`=20 vs `jmt`=30 confirmed correct-as-is by owner (mirrors Prometric exam structure) — **do not equalize this**. |
| 288 duplicate-question groups (556q) | ✅ Investigated, **not a defect** — see below. |
| 157 `exp` fields under 40 chars | ✅ Investigated, **mostly not a defect** — see below, but turned up a real separate bug. |

**Option-count + rebalance work, in the order it happened:**
1. `wglv-*` (236q): 4th option *sampled* from the same-direction answer pool (each a real term
   already correct elsewhere, with 4 guards including a near-synonym block), rebalanced
   round-robin in the same pass as the append (rebalancing first would park every new option at
   index 3 and create a fresh tell — do this in one pass, always). 206/236 at position 0 →
   60/60/60/56. Commit `4957188`.
2. `wgl01–10` + `wt01–10` + `wtv01` (419q): the sampling trick from step 1 **does not transfer**
   here — these are conceptual/statement questions (claims, not interchangeable terms), and an
   automated pooled-sampling attempt was tried, audited, and reverted (~8/11 sampled bad — see the
   ⛔ box below). **Hand-authored instead**, one wrong option per question, read individually
   against its own existing 2 wrong answers. `wgl` matched the corpus's own established
   generic-technical-parameter register (color/weight/flow-rate/temperature/noise) plus real
   confusable material/tool swaps where safely defensible (e.g. 保冷材-vs-保温材). `wt`/`wtv` used
   real adjacent facts/roles/rates (e.g. real overtime multiplier 1.35倍 as a wrong answer to a
   1.25倍 question; real-but-different roles like 衛生管理者 vs 安全管理者). Deliberately avoided any
   distractor that could itself be a second valid correct answer (e.g. rejected 経験の浅さ as a
   "wrong" human-error cause since it's also a true cause elsewhere in the corpus — used 給料の高さ
   instead). wgl → exact 50/50/50/50 (commit `ec82166`); wt+wtv01 → exact 55/55/55/55 (commit
   `d87926d`). `wt06` reuses the same distractor text as its verbatim-duplicate twins in wt01–05
   for consistency rather than authoring independent ones (see duplicate-triage finding below for
   why wt06 duplicates so much in the first place).
3. Monolith `wayground-sets.js` fully regenerated (not hand-patched) from the split files after
   both chunks landed. Commit `8177064`.

**Final corpus-wide check (980 questions, all of `wayground/**` + `jac-mockup/**`):** 0 at 3
options (was 419), 0 duplicate options within any single question, 0 `opts`/`opts_id` length
mismatches, 0 out-of-range `ans` indices, monolith↔split cross-check 0 mismatches. Answer-position
distribution 240/255/252/233 (~24–26% each) — not perfectly flat only because `jac-mockup`'s own
already-healthy ~23% natural distribution (300q, untouched by design) pulls the aggregate slightly;
every family P22 actually touched is individually at exact or near-exact even split.

**Duplicate-question investigation — resolved as NOT a defect, nothing changed.** Traced which
sets share which questions. `jml01–04` turned out to be near-1:1 compiled subsets of `wgl06–09`
(18–20/20 questions each, already 4-opt before this session touched `wgl`), `jml05` mixes from
`wgl02–04`, and every `jmt0N` draws 20–30 questions spread across *multiple* `wt0N` sets. `wt06`
does the same thing one level down: 20 questions pulled from 6 different earlier `wt` sets (2 from
wt01, 5 from wt02, 5 from wt03, 3 from wt05, 4 from wt04, 1 from wt08). This is a
cumulative-review / mock-exam-compilation architecture — matches the owner's own confirmation that
`jml`/`jmt` mirror the real Prometric exam structure — not accidental copy-paste. Deleting or
rewriting any of it would break the design.

**Thin-`exp` investigation — resolved as mostly NOT a defect, but surfaced a real separate bug.**
Of the 157: 140 already follow adequate "term《ruby》 = translation." format (fine for a vocab
card, expanding would be padding); 8 more (`wgl02–06`) use the corpus's own "A → B → C" arrow-chain
shorthand, also fine, just compact. **The remaining 9 are not a length problem: `wglv-jp-02` ids
16–24 have completely lost their Japanese headword** — `q`, `hint`, the correct answer, and `exp`
are all the same Indonesian phrase (e.g. id=16: q="Apa arti dari soket EF?", ans="Soket EF",
exp="Soket EF" — a tautological, zero-value question). Scanned all 3 `wglv-jp-*` sets for this
signature (question containing zero Japanese characters, structurally wrong for a "JP→ID"
direction quiz) — confirmed isolated to exactly this one contiguous block, nowhere else. Predates
this session entirely (present already at the original P16-split commit `3e8cea8`).
**Deliberately NOT fixed** — reconstructing 9 missing Japanese headwords is qualitatively different
from completing truncated-but-present content; it's inventing which specific term was intended.
One (id=16) has reasonable support for "EFソケット" given `wgl06` already establishes EF接合
(electrofusion joint) terminology in this exact domain — but the other 8 (id=17 water-supply
polyethylene pipe, 18 terminal pin, 19 "scraping", 20 "cooling", 21 telecom work, 22 underground
piping, 23 cable wiring, 24 underground optical cable wiring) each have multiple equally-plausible
Japanese candidates with no way to disambiguate from available data. Flagged all 9 together rather
than fixing 1 of 9 and silently leaving 8 broken. **Needs owner input or new source material** —
does the owner remember/have a source for what these 9 terms should be?

### ✅ Resolved (session 28): monolith ↔ split-file set-id drift
Was 21 of 27 sets disagreeing. Owner confirmed `main` and the live site have no users but himself,
which removed the reason to be careful (set ids are plausibly the key for saved study progress, so
renaming risked orphaning history). `src/data/wayground-sets.js` is now **regenerated wholesale
from the split files** and carries a do-not-hand-edit header — hand-editing is what let the drift
accumulate. Mapping applied: `wt1–wt10`→`wt01–wt10`, `wg1–wg5`+`wp1–wp5`→`wgl01–wgl10` (`wp5`→
`wgl10`, `wp1–wp4`→`wgl06–wgl09`), `wg12`→`wtv01` (+ track `lifeline`→`common`, it's a teori set).
Set order preserved so app ordering doesn't shift. 0 id diffs, 0 track diffs, 28 sets, 980
questions. **If you change a set, edit the split file and regenerate — don't touch the monolith.**

### ⛔ Do not retry: pooled distractor generation for concept questions
Attempted and reverted in session 28. The wglv approach (sample a real term from the corpus answer
pool) **does not transfer** to `wgl`/`wt`/`wtv01`. Vocabulary options are interchangeable members of
one semantic space; concept options are claims written for one specific question, and no
substitutable pool exists. Two rankings were tried and both failed:

1. *Rank by similarity to the question stem* → surface matches with no meaning. A question
   containing 最大 got the option `最大値`.
2. *Rank by shape match to the question's own options* (length + ending), plus quantity-class,
   stem-echo and near-duplicate filters → better, but an 11-sample audit spread across all 21 files
   still found ~8 bad: `15A以下` offered as a **millimetre** tolerance; `ノイズを増やす` as a property
   of a socket fitting; `ハンマー` in a fill-in-the-blank reading 「＿＿を塗って」; `ダムを造る` as a
   response to low oxygen; `どちらも同じ`/`どちらでもない` dropped into questions that aren't
   comparisons; and worst, `wt09 q11` given `建物の断熱性を高めるため` next to its existing distractor
   `建物を断熱するため` — two options meaning the same thing.

A tighter filter is not the fix. The failure is semantic and the scoring function only sees
characters and length; it cannot tell that a tool doesn't belong where an event belongs. The
automated "weak match" counter said 4 of 419 — **that number was meaningless**, because the score it
thresholds measures shape, not sense. Don't trust a shape metric as a quality metric.

**These 419 need distractors authored per question. There is no shortcut.** Suggested batching:
one set (20 questions) at a time, reading each question, so quality stays reviewable. `wgl01–10`
first — it also carries the last remaining answer-position bias (60%, `wgl05` still 20/20).

**Question counts (the "merata" half) — ✅ DONE, nothing left:**
`jml01–06` all 20 · `jmt01–06` all 30 · `wgl01–10` all 20 · `wt01`=**19**, `wt02–10` all 20 ·
`wglv-id-01/02/03`=39/39/39, `wglv-jp-01/02/03`=40/40/39 · `wtv01`=**22** (lone file, no siblings).
Both former outliers are resolved (see Step 2 above). **`jml`=20 vs `jmt`=30 is CORRECT — do not
"fix" it.** Owner confirmed 2026-08-17: the mockup sets deliberately mirror the Prometric exam
simulation structure, and the real JAC sets are 65:30 because that's exactly what the source is.
Any future agent tempted to equalize these two families should stop.

Remaining order — all of it now **authoring work, not scripting work** (see the ⛔ box above):
(1) `wgl01–10`, 200 questions — author a 4th option + rebalance in one pass, worst remaining bias
at 60% (`wgl05` still 20/20); (2) `wt01–10` + `wtv01`, 219 questions — 4th option only, their bias
is already fine; (3) cross-set duplicate triage (288); (4) thin-`exp` expansion (157).
`jac-mockup` and `wtv02` need none of this. 419 questions still at 3 options.

### ✅ Resolved (session 28) — PDF intake tracker, kept for the record
All 7 source PDFs arrived and were processed (owner sent them incrementally across sessions
25-28, not as one batch — token cost was an explicit concern on their end, session 25). Nothing
is waiting on external material anymore for P5 specifically. Table kept here as a record of what
each chapter covers, in case a future task needs to know which PDF a given `source: "jac-chN"`
card traces back to.

| # | Chapter | JAC content covers | Status | Filename |
|---|---------|---------------------|--------|----------|
| 1 | teori ch1 | 日本の現場で大切にしていること (teamwork, 施工体制, CCUS, あいさつ, 朝礼) | ✅ received session 25 | `text1l.pdf` |
| 2 | teori ch2 | 働く上で守らなければならない法令 (labor law + 15 other laws) | ✅ received session 25 | `text2.pdf` |
| 3 | teori ch3 | 建設工事の種類と業務 (construction work types/trades — largest teori chapter, 183 cards) | ✅ received session 25 | `text3.pdf` |
| 4 | teori ch4 | 現場で使われるあいさつ・用語・共同生活上の注意 (site terminology, shared-living notes) | ✅ received session 26 | `text4.pdf` |
| 5 | praktik ch5 | Lifeline jitsugi (216 cards — largest single chapter) | ✅ received session 26 | `text5l.pdf` |
| 6 | praktik ch6 | Lifeline jitsugi (133 cards — highest truncation rate of any chapter, 51%) | ✅ received session 27 | `text6l.pdf` |
| 7 | praktik ch7 | 建設工事の安全 — death-accident stats, 7 accident-type defs, safety cycle, PPE, heatstroke, 12 ヒューマンエラー types (47 cards) | ✅ received session 28 | `text7l.pdf` |

**Reusable methodology, if a future task needs to cross-reference corpus text against a source
PDF again** (not just P5 — this generalizes): filter by the relevant `source` value, grep the
whole `src/data/cards/` tree per id rather than assuming one obvious file (every chapter from
ch3 onward spanned 4-8 split files, never just 1), complete only what's directly supported by the
actual passage, leave the rest flagged rather than guessed. Before writing anything, dry-run every
`oldValue + suffix` concatenation through a 4-layer checker built from the start: (1) exact
adjacent-word repeat at the seam, (2) repeated 2-3 word n-grams across the seam, (3) repeated raw
substrings ≥6 chars for glued-token collisions with no space, (4) open-paren count equals
close-paren count (catches cards that only needed a period, not more content — session 27's
id=979 was exactly this). Sessions 26/27 each discovered these layers one at a time after the
previous one let something through; session 28 built all four upfront (script: `check_concat.mjs`,
scratch tooling, not committed — same as prior sessions' `p5_fixes_chN.mjs` scripts).

**The EF接合 furi issue (session 27) and the furi/jp ruby-corruption pattern (session 28,
7 cards) are both resolved** — see commits `5447c94` and `60dcf1a` for the fixes and full
evidence trails. If a similarly-flagged "furi/jp looks wrong" item comes up again: search the
corpus for comparable jp-shapes or check the same card's own usage-field ruby before concluding
it's unfixable without new material — the existing corpus often already encodes the correct
reading, it just takes a few `grep`-equivalent passes to surface it.

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
| OD-5 | P12 | Separate SSW Flashcards repo: does it consume `card.furi`? (affects whether it's safe to drop) | ✅ **Resolved 2026-08-17 (session 28) — by investigation, not by owner.** The question turned out to be aimed at the wrong codebase. Checked the two archived snapshot repos (`Nugget-Nihongo-SSW-Konstruksi-v87`, `SSW-KONSTRUKSI-v85`): neither reads `card.furi` — their only `.furi` reads are `item.furi` from the separate `DANGER_PAIRS` structure, plus one `c.furi` in SearchMode. But **`main` of this repo reads `card.furi` in at least 6 mode components** — that finding still stands. **What it means for P12 has since changed**, though: a *separate* owner decision the same session ("branch content-dq emang cuma buat maintain and fix all the quality... I intended to do so even if it breaks main") made breaking `main` acceptable regardless of this finding, so the 6 consumers are now a merge-time reconciliation checklist, not a blocker. P12 itself is unblocked but still unstarted — see ACTIVE TASKS' 📋 list for the consumer checklist and the P12 row for status. |

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
