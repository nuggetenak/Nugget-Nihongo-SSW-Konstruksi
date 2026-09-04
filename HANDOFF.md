# HANDOFF.md — SSW Konstruksi

> ## 🟢 content-dq merged into main — 2026-08-18 (commit `151a45e`)
>
> content-dq's 3.5-month content-quality sprint (sessions 1–29) is done and merged, verified via
> `npm test` (435/435), `npm run lint` (0 warnings), `npm run build` (clean), plus content-dq's
> own `verify-content.mjs`/`audit-track-consistency.mjs` (both clean).
>
> **Retired 2026-08-19:** the GETTING STARTED/PROTOCOL sections that used to sit here
> (content-dq's own workflow) and the full merge-execution writeup that used to be CURRENT
> STATE's second entry are both archived verbatim to `docs/archive/HANDOFF-content-dq-era.md`.
> Condensed versions: `CHANGELOG.md` `[4.23.0]` (what shipped), `_MAP.md` § Agent Session Log
> (session-by-session).
>
> **This file now holds only live state.** CURRENT STATE's top entry is what's actually true
> today. When it's superseded, it moves to `docs/archive/` rather than accumulating here — see
> `docs/AGENT_WORKFLOW.md` §3 for the retirement steps.

---

**Read `docs/AGENT_WORKFLOW.md` first, always** — clone/read/verify order, token handling,
branch discipline, commit conventions, close-out steps, all of it. Not repeated here; this file
is state, that file is process, and keeping the same thing written in two places is exactly the
failure this repo's docs have already hit once (session 23: `SESSION_PROMPT.md` +
`DATA_QUALITY_HANDOFF_vNN.md` + `PROGRESS.md`'s checklist drifted out of sync with each other and
with reality, all archived, replaced by one file each for state and process).

`_MAP.md`, `docs/CARD_CONTENT_SPEC.md`, `docs/DESIGN_SPEC.md`, `docs/LAYOUT_SPEC.md`,
`docs/COMPONENT_SPEC.md`, `docs/PWA_RELEASE_SPEC.md` — stable reference material, full list with
what each covers in `docs/AGENT_WORKFLOW.md` §4. Read them from the clone; don't duplicate their
content into this file.

---

## CURRENT STATE

**As of 2026-09-04.** Verify before trusting past this point — this line doesn't update itself.

- **2026-09-04: "analyze comprehensively and exhaustively; fix all gaps, inconsistencies,
  discrepancies; upgrade the UI & UX."** Branch `claude/analysis-ui-polish-cxnj2d`, PR #8 (draft).
  Full reasoning lives in the commit messages, one per theme — this is a map to them, not a
  restatement. Everything below was measured against the running app or the real data; where a
  doc's claim disagreed with the repo, the repo won and the doc was corrected.

  - **`64f016d` — three ruby rendering bugs the corpus sweep structurally could not see.**
    `ruby-audit-round3.test.jsx` asks "does the renderer produce garbage?"; it cannot ask "does it
    produce the *right* annotation?", and all three of these produce well-formed markup:
    (1) a reading covering text left of its kanji — `ラジオ体操《らじおたいそう》` annotated only
    体操, and a browser spreads the too-wide `<rt>` so it rendered as "体 操" (**349 strings**);
    (2) kanji-bearing parentheticals rendered as furigana — `危険予知活動《KY活動》`, whole
    sentences at annotation size above one kanji (**31**); (3) Indonesian prose folded into ruby
    bases by the old length-based fallback (**89**). Where a base starts is now *matched* against
    the reading rather than guessed. Verified by rendering all 6,000 corpus strings before and
    after and reading every one of the 261 distinct base changes; one known false positive is
    recorded in the commit rather than hidden.
  - **`907a902` — three dead data mirror layers retired, and the audits that missed them.**
    `src/data/cards/**` (70 cards drifted), `src/data/sets/wayground/**`, `src/data/sets/jac-mockup/**`
    (all 12 sets drifted): none imported by anything, two silently stale with the last two
    sessions' own fixes, and two live files carrying headers telling maintainers to edit the split
    copies and run a regeneration script **that has never existed in this repo**. 56 files / 1.7 MB
    deleted. `audit-integrity.mjs` had been reporting 2876 phantom issues every run (it demanded a
    `furi` field the schema dropped) — which is how 5 zero-card sources survived in `SOURCE_META`,
    each an "0 kartu" row in SumberMode; `audit-related-ids.mjs` had been dying with
    ERR_MODULE_NOT_FOUND since August; `verify-content.mjs` compared only counts, printed "✅ Clean
    … safe to copy into HANDOFF.md as-is" over 70 drifted cards, and now compares field by field.
    New `audit-data-text.mjs`. **`npm run validate` now actually gates**: format:check, lint, test,
    all five audits, build.
  - **`aa5d610` — four state bugs.** The study streak only counted flashcard marks, so a learner
    doing SRS reviews daily had a streak of 0 (it feeds the Dashboard headline, two achievements
    and 20 of 100 readiness points); `calcReadiness` read `srs.stats.review`, a key that has never
    existed; `SRSContext` memoised its value from a key list omitting `stats`; `goTab` never
    cleared `modeParams`.
  - **`ff45009` — design system.** Keyframes lived in two files with **six conflicting
    definitions** (`shimmer` ran in opposite directions) and `theme.js`'s JS-injected copy silently
    won; consolidated at the values that were actually rendering. **254 of 297 inline `fontSize:
    <px>` in JSX** migrated onto the `--fs-*` tokens — `DESIGN_SPEC` §3's claim that "every
    consumer reads `--fs-*` via var(), confirmed by grep" was only ever true of stylesheets, and is
    now corrected in place.
  - **`29f61ae` — one mode header, and lists a phone can render.** 20 of 21 modes rendered their
    name twice and drew one of 27 different back buttons; ModeHeader is now the whole header, with
    an exit guard (`useExitGuard`) so the shared arrow can't silently discard a half-finished exam.
    Buku Catatan went from 19,264 DOM nodes / 134,599px to 714 / 4,095px, Glosari from 18,329 /
    82,128px to 1,642 / 6,105px. The app's one horizontal overflow fixed (`minmax(430px, 1fr)` is a
    hard floor).
  - **`fb96a5f` — a11y and copy.** **Seven declarations across five files were switching off the
    app's only focus indicator**, all on text inputs; and the indicator itself was drawn so that
    the outline's offset gap was solid near-black, reading as a heavy frame. Autoplay TTS failures
    no longer raise an error toast (a phone with no ja-JP voice got one on every ReviewMode entry).
    A track toggle that could not change anything, shown in two modes, removed. "3 jalur" and a
    footer naming two removed tracks, corrected.
  - **Content**: 13 pooled ruby readings split per term; 21 Kangxi Radical codepoints and one
    Cyrillic typo fixed — both flagged as out-of-scope by the 2026-08-26 font work and still live
    until now, both now guarded by `audit-data-text.mjs`.

- **2026-09-04, second half: "overhaul the layouts & font typography; you can add new features."**
  Same branch and PR. All of it measured on the running app first.

  - **`38eb58d` — the type scale rebuilt.** A Playwright walk of every rendered text node across
    all 24 screens found **85% of the app's visible text at 13px or smaller**: 29% at 11px, 20% at
    13, 14% at 12, 8% at 10, 4% at 9 — and **9% at 7px, 0.2% at 5px**. The 5–7px was furigana:
    `.ruby rt` was `0.44em` of `jpFontSize`'s 13px floor, two numbers in two files that nobody had
    multiplied together. No single rule looked wrong; the sizes only accumulate. The scale is now
    fluid `clamp(rem + vw)` on a ~1.11→1.2 ratio (the rem term is what keeps it responsive to a
    reader's font-size preference — a pure-vw preferred value silently defeats that). After:
    **50.6% at ≤13px and nothing below 10px**.
  - **`95eb1b3` — Ukuran Teks, a reader-facing control for the whole scale.** Four steps
    (90/100/112/125%) in Saya, applied pre-paint in `main.jsx` so there is no flash, persisted in
    prefs. New feature, not a fix: the audience reads Japanese on cheap phones, outdoors.
  - **`ac69cf6` — spacing that scales with the text, and one owner for width.** Ukuran Teks made a
    latent bug visible: the spacing scale was px, so at "Sangat Besar" body text went 15px → 18.8px
    while `--sp-3` stayed 12px — the layout got *tighter* for exactly the reader who asked for it
    to get looser. Rebuilt as `--space-2`…`--space-64` in rem (renamed, not redefined, so a missed
    call site fails `audit:css-vars` instead of silently mis-sizing). Ten stylesheets were also
    repeating the max-width and gutter that `AppShell`'s `.content` had already applied, against
    that file's own stated rule — costing a mode screen 32px of a 390px phone. And `.content` is a
    flex column in mode chrome now, so a mode can claim the height the shell already reserves:
    FlashcardMode's dead space went **284px → 40px** on mobile, **334px → 40px** on desktop.
  - **`fc5ce55` — the mode title was ellipsised on 11 of 21 screens** at 320px, 3 at 390px
    ("Ekspor & Impor" wanted 308px of a 188px box). Cause: giving sticky chrome `--fs-page-title`.
    Now `--fs-title`, still the largest thing in the band, 0 truncated at either width.
  - **`57aca37` — 418 inline spacing declarations** in JSX style objects moved onto the tokens.
    Fixing only the stylesheets would have left more than half the app's spacing frozen against
    Ukuran Teks.

- **Open items for the next session: `docs/UI_UX_PLAN.md` §12.** Two of them are decisions for the
  owner, not execution.

- **Verification**: `npm run validate` clean — format, lint, **719 tests**, five audits, build.
  Every UI change screenshotted at 390/820/1440px in both themes, before and after; the layout and
  typography work additionally swept for horizontal overflow and unreachable nav at all three
  viewports at both Normal and Sangat Besar text size.

_(The 2026-08-31 / 09-01 entry this replaces is archived verbatim to
`docs/archive/HANDOFF-2026-08-31-09-01-ui-typography.md`, with a note on the one claim in it a
later session had to correct.)_

---

## RULES

- Never push to `main` on your own initiative — merging is the owner's call, always has been.
  Not a literal absolute: 2026-08-27 round 3 is the concrete example — owner reviewed a summary
  of the branch, said "merge aja langsung," and that's what authorizes it. Absent that kind of
  explicit go-ahead in the current conversation, work stays on its branch.
- Ambiguity → write it down in CURRENT STATE, ask the owner, don't guess and proceed
- Commit message convention is whatever the active branch is already using — check recent
  `git log` rather than assuming; content-dq used `CONTENT:`/`ADMIN:`/`DOCS:` prefixes,
  `feat/ui-overhaul` uses conventional-commits style (`feat(ui):`, `docs:`)

_(The rest of this section — `src/data/` editing rules, mirror-edit steps, the data-file
quote-style rule — was content-dq-specific and archived with it: `docs/archive/HANDOFF-content-dq-era.md`.
Note that its mirror-edit steps are now **historical only**: the mirror layers they describe were
deleted 2026-09-04 and `docs/AGENT_WORKFLOW.md` §4a is the live map of where to edit what.
`audit-track-consistency.mjs` went with them.)_

---

## REFERENCE (stable — read from the repo, not reproduced here)

- `docs/AGENT_WORKFLOW.md` — **read this first, every session.** Process, not state: clone/read
  order, token handling, branch discipline, commit conventions, close-out steps, the minimal
  kickoff template
- `docs/CARD_CONTENT_SPEC.md` — schema, ruby rules, taxonomy, full task rationale, Open Decisions detail
- `docs/DESIGN_SPEC.md` — palette, typography, icon rendering technique, hazard-rail motif
- `docs/LAYOUT_SPEC.md` — breakpoints, `--max-w`/`--overlay-max-w` tokens, the auto-fit/minmax
  responsive pattern
- `docs/COMPONENT_SPEC.md` — CSS Modules conventions, shared primitives, component patterns
- `docs/PWA_RELEASE_SPEC.md` — offline architecture, `CACHE_VERSION` discipline, deploy checklist
- `docs/UI_UX_PLAN.md` — **not stable reference; a work queue.** Items 43–65 (drafted
  2026-08-25) closed out 2026-08-26/28; items 66–68 added 2026-08-31 and closed 2026-09-01;
  §12 (items 69–72) added 2026-09-04 — see CURRENT STATE above, don't trust this bullet's own
  age over that. Unlike the `*_SPEC.md`
  files above, this is meant to shrink and retire to `docs/archive/` once empty — see
  `docs/AGENT_WORKFLOW.md` §3. Its predecessor (items 1–42, all shipped) is already archived
  there; numbering deliberately doesn't restart, so item references in git history stay unique
- `_MAP.md` — architecture map + full session-by-session history log
- `docs/archive/` — superseded docs, including this file's predecessors (`SESSION_PROMPT.md`,
  `PROGRESS.md`, `DATA_QUALITY_HANDOFF_v16/v17/v18.md`), `HANDOFF-content-dq-era.md` (the
  retired GETTING STARTED/PROTOCOL sections + the full 2026-08-18 merge entry + the fully
  resolved ACTIVE TASKS/OPEN DECISIONS content, all pulled out of this file 2026-08-19),
  `HANDOFF-2026-08-27-28-sessions.md` (the post-overhaul bug-fix rounds + SimulasiMode/Belajar
  work, pulled out 2026-08-31), and `DATA_ARCH_AUDIT.md` (frozen point-in-time audit, session
  16 — moved here 2026-08-19, was sitting in `docs/` already marked "historical, not live")
- `README-CONTENT-DQ.md` — what's actually present on this branch vs `main`-only
