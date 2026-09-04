# Archived HANDOFF entry — 2026-08-31 / 09-01 UI, typography and ruby rounds

Pulled out of `HANDOFF.md` on 2026-09-04 per `docs/AGENT_WORKFLOW.md` §3: the work it describes is
finished (items 66, 67 and 68 of `docs/UI_UX_PLAN.md` all closed) and the file had grown past its
own ~190-line target again. Verbatim, nothing edited.

One correction worth reading before trusting the text below, because a later session had to fix it:
the ruby "round 3 / round 4" entries describe the corpus sweep as the thing that verifies ruby
rendering. It verifies that the renderer produces no *garbage*; it cannot verify that the
annotation is *right*, and three further bug classes were found on 2026-09-04 that it had been
passing all along (readings reaching left of their kanji, kanji-bearing glosses rendered as
furigana, Indonesian prose folded into ruby bases). See commit `64f016d`.

---

## CURRENT STATE

**As of this edit, 2026-09-01 (same conversation as 2026-08-31 above, date rolled over
mid-session — same pattern as 2026-08-27→08-28 further below).** Verify before trusting past
this point — this line doesn't update itself.

- **2026-09-01: "polish the UI & UX, overhaul anything."** Screenshotted all 21 modes at
  mobile (390px) and desktop (1440px) — 42 screenshots, actually reviewed, not assumed clean.
  Found and fixed: **ReviewMode was logging a phantom 0/0 session** just from opening the tab
  with nothing due (data-integrity bug, not visual — silently inflated streak/stats; found
  while chasing what looked like a broken Statistik chart, which turned out to be rendering
  correctly the whole time); **DengarMode's intro heading** used hand-rolled inline styles
  instead of the shared `pageTitle` convention every other mode's equivalent screen uses;
  **three modes' title-next-to-button header rows broke** at narrow widths (ConfusionMode
  wrapped to two lines, AngkaMode's button actually overlapped and covered part of the title,
  DangerMode wrapped) — root cause was a shared button class with `width: 100%` baked in for a
  different context. Worth flagging: the first attempted fix (flex:1 on the title wrapper)
  made ConfusionMode's case dramatically worse — caught from a screenshot before keeping it,
  reverted, fixed properly. Every fix in this round was screenshotted before *and* after, not
  trusted from reading the code. Commits `7a73d95`, `62484f7`.
  - **Same-day follow-up, owner said "yes please" to picking up the leftover items**: closed
    `docs/UI_UX_PLAN.md` items 66 and 67. Item 66 — the 4 remaining content-data defects, each
    fixed by cross-checking against that same card's own desc/usage field (2 of 4 already had
    the correct form sitting right there), plus the 79-occurrence duplicated-marker pattern
    collapsed at the source. Item 67 — re-checked the 4 `default`-width modes against real
    content (not empty states) and confirmed SumberMode/SearchMode's single-column layout is
    already using its width correctly (wrapping description text, progress bars) rather than
    stretching with dead space; nothing further to fix there. Commits `c1cdbea`, `b12219f`.
  - **Item 68 also picked up, same "continue" — pivoted to something bigger than font-sizes**:
    comparing candidate font-sizes against equivalent elements (same method as pageTitle/
    ratingEmoji) surfaced 41 dead rules in the shared `modes.module.css` (61% of the file) —
    whole sections left behind by modes that moved to their own dedicated CSS module over time.
    Removed, thoroughly verified (recursive cross-file check, not just `src/modes/*.jsx`; caught
    and corrected its own false positive along the way; full 21-mode screenshot sweep before/
    after). Commit `6353ff7` — also has an honest note on a one-off screenshot artifact during
    re-verification that didn't reproduce on retest (likely Playwright timing, not a real
    regression — investigated properly rather than assumed either way).

- **2026-08-31: exhaustive UI/UX/typography audit** (new agent chat, owner provided repo+token
  directly, explicit blanket approval up front: "consider everything is approved," full token
  budget authorized for "super duper exhaustive" auditing, work done directly on `main` per
  owner's explicit instruction — same pattern as 2026-08-27/28, not a deviation from branch
  discipline). Full reasoning for every item below is in its own commit message (owner's stated
  preference: short chat replies, detail in commits) — this entry is a map to the commits, not a
  restatement of them.

  - **Ruby rendering rewritten** (`renderJPWithRuby`, `JpDisplay.jsx`) — the old parse-then-
    reindex implementation silently misplaced furigana whenever a kanji base repeated earlier in
    the same string as plain text (found by mechanically simulating the algorithm against every
    string in `src/data`, not spot-checking), and never matched the "whole conjugated word
    including okurigana" marker convention at all (見切る《みきる》 vs. the more common
    揚《あ》げる — ~870 real occurrences, silently dropped in some render paths, shown as raw
    `《》` in others). Rewritten as a single forward pass; a corpus-wide sweep
    (`ruby-audit-round3.test.jsx`) renders every real `《`-bearing string in the shipped data
    through the actual function and asserts no unexplained raw bracket survives. Surfaced 5 more
    content-data defects along the way (incomplete/concatenated readings, one 《》-as-parenthetical
    case) — logged in that test's own allowlist, not fixed here (content work, not rendering).
    Commit `3bbc62e`.
  - **Ruby round 4, same day, owner tested live and found more** — round 3's corpus sweep
    checked whether the renderer produces *garbage output* for every string; it didn't check
    whether the renderer produces the *right* output, which is a different, harder property a
    sweep can't verify by itself (it doesn't know what "right" is). Owner's screenshot
    (ダクトの3種類 showing a completely unrelated reading) forced that distinction and both
    turned out to be real, separate bugs:
    - **Content-data bug, not a rendering bug**: the reported card's own `jp` field literally
      had five readings concatenated into one marker (its own two words' readings, plus three
      more copied in from its `desc` field's separate terms). Searched systematically rather
      than patching the one report — 127 cards had a suspiciously long reading; hand-verified
      every one against its own desc/usage (two automated heuristics were tried first and both
      produced confident-looking wrong answers — see the commit for why); 26 were genuine bugs,
      fixed; ~101 were long-but-correct and left alone. **Important scoping note for next time**:
      restrict this kind of scan to `src/data/source/cards-{common,lifeline}.js` specifically —
      `src/data/cards.js` is generated (fine to read, but edits there don't stick) and
      `src/data/cards/lifeline/` is a stale, unimported pre-restructure reference copy that will
      produce false leads if it's included in a broad `find src/data` sweep. Commit `5d84e9b`.
    - **Separate, larger rendering bug**: kanji+katakana loanword compounds (移動式クレーン,
      冷却コイル, 防水カバー — ordinary vocabulary here, not edge cases) were never matched at
      all — the regex only recognized hiragana as valid trailing okurigana. 871 occurrences, 384
      unique pairs, silently dropped whenever they shared a string with another, successfully-
      matched marker. Fixed by keeping kanji+katakana always combined as one ruby span with the
      untrimmed reading, rather than attempting to split (readings are written in hiragana, so
      splitting via exact character match against katakana is unreliable — chōonpu doesn't
      round-trip). Commit `6bc2ebb`.
    - Same commit also fixes JpFront forcing Japanese typography (CJK font, centering,
      kanji-density length-scaling) onto non-Japanese content that a few modes' shared
      ResultScreen slots sometimes carry (Indonesian definitions/translations) — new
      `isMeaningfullyJapanese()` ratio check in `jp-helpers.js`, found while re-auditing the same
      render paths, not part of the original report.
    - **Simulasi exam-timing fixed too, same message** — owner's real-exam knowledge: 2 min/
      question (100 min for the 50-question full exam), not the ~1 min/question the app actually
      shipped with (quick/half were exactly 1:1, full was even slightly under at 0.9). Applied
      uniformly to every preset. JAC Official's own "full" preset draws a random set-pair at
      runtime (44 or 51 questions, not a fixed 50) — its time budget is now computed from the
      actual drawn count via a correction effect once `questions` resolves, rather than a static
      guess; the preset's own label states the honest 88–102 min range instead of picking one
      number. Verified live and via a test that drives a real random draw end-to-end. Commit
      `d4efb09`.

    only covered the one reported case (SimulasiMode's review list); this pass traced all ~30 live
    call sites and fixed the other ~9 (SearchMode, GlossaryMode, DangerMode's accordion,
    CatatanMode, SumberMode, Dashboard's recent-cards list, ConfusionMode ×3). Promoted the
    working 17/15 values to named constants (`JP_LIST_MAX`/`JP_LIST_MAX_SECONDARY`,
    `jp-helpers.js`). Commit `f16c9f7`.
  - **Typography consistency**: new `--fs-page-title` token (22px/26px wide) unifying BelajarTab
    (was 24px, the actual outlier — confirmed live via Playwright which value was the real
    majority before picking one) with SayaTab/every mode screen's already-matching 22px; 52
    hardcoded sizes that exactly matched an existing token mechanically migrated onto it;
    ReviewMode's rating-emoji was smaller than its own text label (real bug — confirmed by
    comparing the whole button to FlashcardMode's identical widget, not assumed), fixed. Commits
    `1f31af8`, `51a414b`, `c260df3`.
  - **`--fs-*` converted to `rem`** — closes `docs/UI_UX_PLAN.md` item 53, deferred since
    2026-08-26 as "touches ~89 files, interacts with ruby's `em` sizing and `jpFontSize()`'s JS
    ladder." Both interaction concerns turned out not to apply to this specific change once
    traced through (ruby's `em` computes from an inline px style, never from these tokens;
    `jpFontSize()` is independent JS) and the 89-file number was a verification surface, not an
    edit surface — every consumer only reads via `var()`. Verified live: default-zoom output is
    pixel-identical to before, forcing a larger root font-size now actually scales these tokens
    (couldn't before). Commit `d398244`.
  - **Belajar's desktop layout fixed** — first real "expand to all devices" finding: Belajar's
    single-column accordion menu was stretching to the full 1180px content column at the 1040px+
    breakpoint with a growing dead gap beside every card, unlike Dashboard/Saya which both
    genuinely reflow (confirmed live at 375/820/1440px, not assumed). Given `width='reading'`,
    the same policy every individual mode already defaults to for this shape of content. Commit
    `14a7712`.
  - **Docs**: `docs/DESIGN_SPEC.md` §3 (typography) rewritten to match everything above;
    `docs/LAYOUT_SPEC.md` gets a new §5 framing the "expand to all devices" direction and
    documents the `width` prop; `docs/UI_UX_PLAN.md` item 53 closed, new §11 (items 66-68) for
    what this round found but didn't fully close out — **read that section before starting a
    follow-up session**, it's the actual "what's next" list.
  - **HANDOFF.md housekeeping** (this file, same pass): the accumulated 2026-08-27/28 narrative
    (330 lines) retired to `docs/archive/HANDOFF-2026-08-27-28-sessions.md` per
    `docs/AGENT_WORKFLOW.md` §3 — this file had grown well past its own ~190-line target.
    `_MAP.md`'s Agent Session Log gets one terse pointer row instead, matching that log's own
    older, more compact convention rather than the verbose style recent rows had drifted into.
  - **Not yet pushed to origin as of this row being written** — check `git log origin/main..main`
    before assuming any of this is live. Confirm the resulting deploy via the Actions API once
    pushed, same discipline as every prior session, not assumed from a successful push.
  - Test count and validate status: see the last commit's own message for the exact number
    (checked before every commit, this file doesn't duplicate a number that goes stale the moment
    the next session adds a test).

_(ACTIVE TASKS and OPEN DECISIONS — content-dq's task tracker and decision log, both fully
resolved — archived to `docs/archive/HANDOFF-content-dq-era.md`. Pending work for the current
phase lives in `docs/UI_UX_PLAN.md` §11 (items 66-68) instead of here.)_

