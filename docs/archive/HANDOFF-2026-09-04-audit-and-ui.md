# HANDOFF entry — 2026-09-04, the 6.0.0 exhaustive audit and the layout/typography overhaul

> **ARCHIVED 2026-09-05.** Historical — a record of what one session did, not instructions.
>
> Pulled out of `HANDOFF.md`'s CURRENT STATE under `docs/AGENT_WORKFLOW.md` §3, because the work
> is merged to `main` and released. Both halves ran in the same conversation on branch
> `claude/analysis-ui-polish-cxnj2d` (PR #8).
>
> **Condensed versions:** `CHANGELOG.md` `[6.0.0]` (the audit half, released) and `[6.1.0]` (the
> typography/layout half plus everything after it), `_MAP.md` § Agent Session Log (one row).
> Per-fix reasoning lives in the commit messages, which is where this entry always pointed.
>
> **One number in it was already stale when archived:** the closing "Verification" bullet says
> **728 tests**, correct on the day the typography half landed. Later commits in the same session
> took it to 745 and then 768; `npm test` said 768 on 2026-09-05. Left as written rather than
> edited, since editing would misrepresent what that session actually verified.

---

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
  - **`1817d7f` — the flip card's height floor was a phone constant, in two places.** 230px in
    CSS and again in JSX; the card sat 230px tall in an ~800px scene on a tablet, and the JSX copy
    had been silently defeating the `max-height: 480px` landscape rule since item 23 wrote it.
  - **`94900de` + `c79365b` — 180 ruby readings scoped to their own term.** Found from a tablet
    screenshot taken for the layout work: a card rendered タイル張り工事 with a reading three
    times too long, and a browser spreads a too-wide `<rt>` across its base, so the Japanese came
    apart into spaced characters. 147 were split words whose second marker repeated the first's
    reading (`給湯《きゅうとう》管《きゅうとうかん》`) — mechanical to detect, so fixed and
    guarded in `audit-data-text.mjs`, whose existing pooled check keys on whitespace and could
    never have seen them. 33 were card titles with several terms' readings run together, each
    re-annotated by hand from the card's own fields. Corpus-wide, readings that cannot align to
    the text before them fell from 283 to 122; among card titles, 32 to 3.

- **Open items for the next session: `docs/UI_UX_PLAN.md` §12.** Two of them are decisions for the
  owner, not execution.

- **Verification**: `npm run validate` clean — format, lint, **728 tests**, five audits, build.
  Every UI change screenshotted at 390/820/1440px in both themes, before and after; the layout and
  typography work additionally swept for horizontal overflow and unreachable nav at all three
  viewports at both Normal and Sangat Besar text size.
