## [6.1.0] - 2026-09-05

Two sessions of work that reached `main` without a release note, plus the audit that found the
gap. Minor version, not patch: `kartu` gains a category picker, and four P0 fixes change how the
exam modes behave.

### The gap itself

`CHANGELOG.md` was last touched at `e92b912` on 2026-09-04, and ten commits landed on `main`
after it — six of them substantive, including a new feature and four P0 bug fixes. Every one of
those sessions closed out by updating `HANDOFF.md` and `docs/UI_UX_PLAN.md`, and stopped there.
`docs/AGENT_WORKFLOW.md` §3 now names the release note and the version bump as explicit close-out
steps, because "update the handoff" had quietly come to mean "we're done".

`package.json` and `public/sw.js`'s `CACHE_VERSION` are bumped together here. That file's own
comment says the two are kept equal, and they had already drifted once (4.23.0 against a 6.0.0
package) — harmless in production, since `deploy.yml` rewrites the value to a UTC timestamp before
every build, but it reads exactly like the stale-cache bug `docs/PWA_RELEASE_SPEC.md` §2 warns
about.

### Kartu — a category picker, and a card you can turn back over

- **Opening Kartu dropped you on card 1 of 1438 with no way to narrow it.** `ModeRouter` filters
  only by `track`, and every category carries `tracks: ['lifeline']`, so every category was always
  in the deck. `FilterPopup` — a real category grid with live counts — had sat unwired in
  `legacy/unwired-app-code/` since 2026-08-18, blocked on one thing: the mode's filter state was a
  single `search` string doing three unrelated jobs (free text, `__cat:<key>` for exactly one
  category, `__starred__`), so the three were mutually exclusive and a category could only be
  reached by tapping the badge on a card already on screen — inside the deck you were trying to
  narrow. Categories are a `Set` now, composing with the text query; old sessionStorage values
  migrate on read. `FilterPopup` graduated to `src/components/` on top of `Sheet` (focus trap and
  Escape, which it never had) and counts from the deck it is handed, so a `filterIds` deck from
  SumberMode no longer reports 1438. Closes `docs/UI_UX_PLAN.md` item 55.
- **A flipped card could not be turned back over on a touch screen.** A regression, not a missing
  feature: the front face carried the flip handler and went `pointerEvents: none` once flipped, the
  back face carried none, and the 🔄 Balik button had been removed earlier the same day as
  "redundant with tapping the card" — true of the front, false of the back. Space on a physical
  keyboard was the only way back, which is no help to the audience this app is for. Restored to v87
  semantics: both faces tappable, flip button back, horizontal swipe always navigates and up flips
  (swipes used to silently rate and auto-advance a face-up card, which is what made "go back"
  unreachable), and the rating row persists once a card has been seen rather than vanishing on
  every flip-back.

### The exam family — four P0s, three of which silently destroyed work

- **The exit guard was honoured by one of five routes out of a mode.** `AppContext`'s own comment
  claimed "every route out of the mode area awaits it first and aborts if it returns false"; only
  the header's back arrow ever did. Escape (`GlobalKeyboardLayer` called `exitMode()` directly,
  which clears the guard on its way past), the hardware/browser back button (the `popstate` handler
  never looked at the guard at all — and on a phone that *is* the back button), and `goTab`/`goMode`
  from the desktop side nav, which stays on screen while a mode is open, each discarded a running
  100-minute exam with no prompt.
- **Every answer restarted the exam clock.** The countdown was a counter decremented by a
  `setInterval` whose effect listed `finishExam` in its dependencies — and `finishExam` depends on
  `answers`. Each answer therefore tore the interval down and started a fresh one, discarding the
  second in progress: fifty answers bought roughly fifty free seconds, changing answers bought
  more, and a fast run could stall the clock almost entirely. It is a wall-clock deadline now, so
  the remainder is derived rather than accumulated — it cannot drift, cannot be gamed by answering,
  and survives a backgrounded tab's timer throttling.
- **"Latih N Salah" navigated to unrelated flashcards.** It passed `wrongList.map((_, i) => i)` —
  positions in the wrong-answer list — to a prop that takes card ids. One wrong answer sent you to
  an empty deck; twenty sent you to cards 1–19, all real, none related to anything you got wrong.
  The fix was data, not arithmetic: `buildJacPool` was dropping the `related_card_id` that all 95
  JAC Official questions carry.
- **Answering re-drew the live question list underneath the reader.** In `wayground` and `jac` the
  question list was a `useMemo` whose dependency array included the wrong-answer tally those same
  modes write to on every wrong answer. Answering wrongly recomputed the memo, re-ran `shuffle()`,
  and replaced the question on screen — while QuizShell was still showing the badge and explanation
  for the question just answered. Reproduced before fixing (`5S活動の最初の…` became `KY活動の4…` on
  the answer click). JAC's Lemah mode was worse: the list is filtered by that tally, so a wrong
  answer grew the list you were working through. Both modes draw their list once now, into state,
  through a single `openSet` — which is also what makes a session restorable, so the two fixes are
  one change.

### An exam that survives a reload

Closes `docs/UI_UX_PLAN.md` item 78.

- `simulasi` snapshots progress **and the drawn question list** to sessionStorage. The list cannot
  be re-derived: both sources shuffle, and the options inside each question shuffle too, so
  restoring "question 7, answer B" against a fresh draw restores a position into a different exam.
  The deadline is stored absolute, so a reload three minutes later comes back with three fewer
  minutes, and an exam whose time ran out while the tab was closed resumes straight into its own
  scoring with no special case. Leaving on purpose clears the snapshot.
- `jac`, `wayground` and `vocab` pass `persistKey` through a shared `useQuizResume` + `ResumePrompt`
  rather than a fourth copy of QuizMode's inline prompt. QuizShell has been able to snapshot since
  item 51; only QuizMode had ever opted in.
- `readQuizSnapshot` grew an optional staleness ceiling, because its 30-minute default is shorter
  than the exam it was being asked to hold.

### Exam correctness, smaller

- **The app contradicted itself about how long the exam is.** `angka-kunci.js` taught "90 detik/soal
  (50 soal ÷ 75 mnt)" as a fact to memorise while `SimulasiMode` used 2 min/question — a 33%
  disagreement about the same exam, in an app whose whole purpose is exam prep. Owner ruled the mode
  correct, so the data entry was the wrong one and is corrected. The rate and the 65% pass mark both
  live in `utils/constants.js` now; 65 had three copies that had to agree, and the failure mode is a
  badge reading "Siap Ujian" beside an exam screen reading "BELUM LULUS".
- **22.6% of full exams contained the same question twice.** The pool held 740 questions but 688
  distinct ones — 41 teori and 9 praktik appear in two sets each, mostly where a Wayground set and a
  JAC-Mockup set cover the same ground. Measured over 20,000 simulated draws per preset (6.2% at 25
  questions, 2.1% at 15). Deduplicated at pool build. Deliberately **not** applied to
  `buildJacPool`: 学科 Set 1 and 実技 Set 1 share one question, but "take everything in both sets"
  is the owner's stated rule for that source and 44/51 is a stated contract.
- **Retry-wrong was dead in three of the four exam modes**, for a reason none of them stated:
  QuizShell can only offer "Latih N salah" when its results carry a `_cardId`, and all three set
  only `_qId`. `jac` works now. `wayground` and `vocab` cannot — **no `QUIZ_SETS` question has a
  card link, 0 of 980** — so their dead wiring is removed and says why, instead of reading as a
  working feature from the prop map.
- **Session durations accumulated across replays.** `useSessionTimer` measures from mount and
  nothing had ever called its `reset()`, so a second run through the Ulang button reported its own
  duration plus the first run's plus the time spent reading the results screen in between —
  inflating study minutes for exactly the users who replay, which that button exists to encourage.
- The Simulasi instructions card still promised "Soal otomatis lanjut setelah kamu jawab", which
  item 48 made false, and never mentioned that blanks count as wrong although it enforces exactly
  that. The results breakdown grouped a 50-question exam into ~34 buckets of one or two questions,
  while the axis it is actually sampled on (30 teori / 20 praktik) was tagged in the pool and thrown
  away by the question mapper.
- `recommend-mode` reimplemented `getBestSimScore` inline, next to its own import of
  `getAvgAccuracy` from the module that exports it.

### Layout and typography, recorded late

These three landed after the 6.0.0 entry was written and belong here rather than folded backwards
into it.

- **101 font sizes were still frozen in px** — 60 in stylesheets, 41 in JSX style objects — left
  behind by the type-scale rebuild because they matched no token exactly. A px font-size grows with
  neither the viewport nor Ukuran Teks, so at "Sangat Besar" the surrounding text grows 25% around
  a number, icon or heading that does not move; and these were not marginal text but the empty-state
  emoji, the display numerals on Statistik and the Dashboard, and the Onboarding headings. All 101
  are rem now at the value they already had, so nothing moves at the default. Deliberately rem
  rather than snapped to the nearest `--fs-*` token — that question is `docs/UI_UX_PLAN.md` item 72
  and stays open; being *frozen* was the defect and it is closed. `spacing-scale.test.js` gained the
  matching tripwire.
- **`ulasan` left ~400px empty under a 220px card** on a 390×844 phone — the mode this app's own
  plan calls the one a learner uses daily and longest, with its rating buttons in the middle of the
  screen instead of under the thumb. The card fills its scene now; having a single face (unlike
  `FlipCard`) it can simply stretch, which also means it no longer changes height on the flip at
  all. Two more found by the same sweep: `.quizPage` was repeating `.content`'s gutter, and two
  frozen px paddings were hidden from the spacing tripwire.
- **A field named for a number held phrases and pushed the row off screen.** AngkaMode's
  `.angkaValue` is styled as a fixed numeric column — `tabular-nums`, 64px floor, `flex-shrink: 0` —
  but ">6jam → 45 mnt, >8jam → 1 jam" is a real entry. With shrink disabled it took 323px of a 350px
  row, squeezed the context text beside it to zero width, and pushed the chevron 14px past the right
  edge of a 390px screen. It shrinks and wraps now; the floor stays, as `4rem` so it grows with the
  text.

### Administrative and governance docs

An audit of every administrative and governance doc against the repo, on the same rule 6.0.0 used:
where a doc's claim disagreed with the repo, the repo won.

- **`README.md` carried two different test counts, neither correct** — 672 in the stack table and
  728 in the project tree, against a measured **768 in 79 files**. Its CI section was a numbered
  list broken in half by a paragraph inserted between items 3 and 4, and it listed two localStorage
  pref keys that do not exist (`goalHarian`, `sprintBestTimeline`; the real ones are `dailyGoal` and
  `sprintBests`). It also had no pointer to the governance docs at all — a reader arriving at the
  repo could not find `AGENT_WORKFLOW.md` from it. Added.
- **`_MAP.md` was three minor versions behind and structurally broken.** It described itself as
  v4.23.0 with 435 tests in 39 files; listed `src/data/cards/**`, `src/data/sets/wayground/**` and
  `src/data/sets/jac-mockup/**` plus `audit-track-consistency.mjs`, all deleted 2026-09-04; pointed
  at `src/hooks/useStableContextValue.js` and top-level `jac-teori.js`/`jac-lifeline.js`, none of
  which exist; was missing §4 and §5 entirely, with Data/Source-Utils/Modes left as `###` blocks
  orphaned under Storage Schema; had two table rows split across lines so they rendered as garbage;
  and showed 5 of 21 modes. Renumbered 1–6, retreed against the actual filesystem, metrics
  re-derived, and the mode table is now the full roster taken from `router/modes.js`.
- **`docs/AGENT_WORKFLOW.md` §4 states "every live doc belongs in this table" and three live docs
  had no row** — `RUBY_MISMATCH_AUDIT.md`, `README.md`, `HUSKY-SETUP.md`, plus the two nested
  READMEs. Rows added, and the rule extended to headline *numbers*, which is what actually drifted.
  §3 gained the CHANGELOG/version close-out step and a re-derive-your-numbers step.
- **`docs/RUBY_MISMATCH_AUDIT.md` told readers its findings were not visually broken, on the
  strength of behaviour 6.0.0 deleted.** Its central claim rested on the JpDisplay fallback that
  folded in-between plain text into the ruby base — the same fallback removed above for producing
  three classes of wrong annotation. Re-measured: **38 of the 182 rows were fixed by the 2026-09-04
  content pass** (struck through, not deleted, so a re-run of the original scan can be compared),
  **144 remain**, and those now render as the too-wide `<rt>` this file was written about.
- **`docs/CARD_CONTENT_SPEC.md` read as an open queue for work that finished on 2026-08-18.** Its
  §8 checkboxes were never ticked, so a fresh reader met a "🔴 BLOCKING" P0 list for a completed
  campaign; §0C described a JAC file layout the merge replaced; §11's merge checklist had been
  executed; §12's decisions were all resolved. A status map at the top now says which sections are
  live (§3–§7, §10 — schema, taxonomy, ruby rules, QC) and which are history, with banners in place.
  §11's step 8 turned out never to have been done — see `viewer.html` below.
- **`README-CONTENT-DQ.md` archived.** A working guide for the `content-dq` branch, which merged
  2026-08-18. It instructed readers to edit split-file layers deleted 2026-09-04, carried
  "LEGACY MONOLITHIC — DO NOT EDIT" warnings on the two files that *are* now the source, and ended
  with a merge plan already executed.
- **`docs/archive/ARCHIVE-INDEX.md` was missing five files** archived between 2026-08-19 and
  2026-09-04, and miscounted the task files (18 files covering 19 tasks, not 19 files). Backfilled,
  with a new section for post-merge retirements.
- **`scripts/archive/README.md` listed 2 of the 9 active scripts** and said `split-cards.mjs`
  produced 8 source files (2 survive). Rewritten with every active script, what runs it, and the
  reason it matters: `audit-related-ids.mjs` died on every invocation from August until 2026-09-04
  precisely because no npm script called it.
- **`HANDOFF.md` compacted.** The 6.0.0 entry and the layout/typography entry are archived to
  `docs/archive/HANDOFF-2026-09-04-audit-and-ui.md` per §3, leaving live state only. Its "open items
  → §12" pointer was stale (open work spans §12, §13 and §14, plus items 58 and 59), and one entry
  cited `docs/UI_UX_PLAN.md` §7 for the Belajar audit that is §13.
- **`docs/UI_UX_PLAN.md`** §8/§9/§10 declare the plan "closed after three waves"; they describe the
  2026-08-25 round only, and three further rounds have appended since. Scoped in place, and the
  front matter now says where the open items actually are.

### viewer.html

The standalone content browser had two dead spots, both from schema changes it was never updated
for. **Its JAC Ujian tab had been empty since the 2026-08-18 merge** — it imports
`src/data/jac-teori.js` and `jac-lifeline.js`, which moved to `src/data/sets/jac/`, and its loader
catches a failed import and returns `null`, so it rendered an empty tab rather than an error. And
it printed `c.furi || ''` into a dedicated element for a field the schema dropped in P12; readings
have lived inline in `jp` as 《》 markers since, which its own `rubyRender()` already draws. That
was step 8 of `CARD_CONTENT_SPEC.md`'s merge checklist, never carried out.

### Verification

`npm run validate` clean: format, lint, **768 tests** (79 files, up from 728), five audits, build.
The exam work was additionally driven in Chromium at 390×844: Escape and browser-back both raise
the confirmation, and a reload offers the exam back at "3/15 soal terjawab · sisa waktu 29:55" with
the clock still running down. Every count in this entry and in the docs it describes was re-derived
from the repo on 2026-09-05, not carried forward.

Open items, including three that are owner decisions: `docs/UI_UX_PLAN.md` §12–§14, plus items 58
and 59, plus the 144 rows in `docs/RUBY_MISMATCH_AUDIT.md`.

## [6.0.0] - 2026-09-04

Exhaustive audit of the whole repo, then the fixes. Major version because the data layout changed
(three unimported mirror layers deleted) and every mode screen's chrome was restructured. Nothing
in a user's saved progress is affected — storage schema stays v6.

Every finding below was measured against the running app or the real data. Where a doc's claim
disagreed with the repo, the repo won and the doc was corrected.

### Ruby rendering — three bugs the corpus sweep structurally could not see

`ruby-audit-round3.test.jsx` renders every 《》-bearing string through the real renderer and asserts
no unexplained raw bracket survives. That answers "does the renderer produce garbage?" It cannot
answer "does it produce the RIGHT annotation?" — its own header says so. All three of these produce
well-formed markup and are visibly wrong on screen:

1. **A reading covering text left of its kanji.** `ラジオ体操《らじおたいそう》` annotated only 体操
   with the whole word's reading — and because a browser distributes a too-wide `<rt>` across its
   base, 5 kana over 2 kanji rendered as "体 操". **349 strings** across every script:
   差し込み継手, 足場組立て作業主任者, 管の切断, GX形ダクタイル鋳鉄管, グラスウール保温材.
2. **Kanji-bearing glosses rendered as furigana.** 《》 has a second, unrelated use in this corpus —
   an ordinary parenthetical, used throughout jac-mockup-sets.js: `危険予知活動《KY活動》`,
   `180度《完全に開く》`, `1件500万円以上《建築工事は1500万円以上》`. Those became `<rt>`, so whole
   sentences rendered at annotation size above a single kanji. **31 occurrences.**
3. **Indonesian prose folded into ruby bases.** The old fallback folded all preceding text into the
   base whenever a reading looked disproportionate, which on this app's bilingual descriptions
   produced ruby like "(digantung saat dipakai), dan 立てかけ式" with furigana over the lot. **89
   strings.**

Where a base starts is now decided by matching the reading against the candidate word, not guessed
from shape or length. Verified by rendering all 6,000 corpus strings before and after and reading
every one of the 261 distinct base changes; no reading changed, only bases moved. One known false
positive is recorded in the commit rather than hidden.

### Three dead data mirror layers retired

src/data held four copies of the card corpus and three of the quiz sets. Measured, not assumed:

| layer | state | imported by |
|---|---|---|
| `src/data/cards/**` | 1438 cards, **70 drifted** | nothing |
| `src/data/sets/wayground/**` | in sync | nothing |
| `src/data/sets/jac-mockup/**` | **all 12 sets drifted** | nothing |
| `src/data/sets/jac/**` | live | `jac-official.js` |

The drift is precisely the last two sessions' own fixes, applied to the live files only — the
expected outcome of maintaining four copies by hand. Worse than dead: `wayground-sets.js` and
`jac-mockup-sets.js` both carried headers reading "regenerated from the authoritative split files
… do not hand-edit", and **no such regeneration script has ever existed in this repo**; README
described `src/data/cards/` as the layer to edit while `merge-cards.mjs` reads only
`src/data/source/`; HANDOFF warned future sessions that one of these folders "will produce false
leads". 56 files / 1.7 MB deleted, recoverable from git history. `docs/AGENT_WORKFLOW.md` §4a is now
the single map of where to edit what.

### The audits that should have caught it

- `audit-integrity.mjs` demanded a `furi` field the schema dropped when readings moved inline into
  `jp` — **2876 phantom issues and exit 1 on every run**. An audit that always fails is an audit
  nobody runs, which is how five zero-card sources survived in `SOURCE_META`, each rendering as a
  permanent, un-openable "0 kartu" row in SumberMode. Rewritten; registry-rot check added.
- `audit-related-ids.mjs` imported two files that moved at the 2026-08-18 merge — **every run since
  has died with ERR_MODULE_NOT_FOUND**. It was in no npm script, which is why nobody noticed.
- `verify-content.mjs` compared only counts. All four layers held 1438 cards, so it printed
  "✅ Clean … safe to copy into HANDOFF.md as-is" while 70 of those cards differed in content. Now
  compares `cards.js` against `source/` field by field and names the drifted card.
- `audit-track-consistency.mjs` deleted with the layer it existed to audit.
- New `audit-data-text.mjs`: pooled ruby readings, malformed markers, and look-alike codepoints.
- **`npm run validate` now actually gates**: format:check (33 files had drifted out of prettier
  format), lint, test, all five audits, build. CI runs lint/test/build only, so nothing had ever
  run format:check or four of the five audits.

### State bugs

- **The study streak only counted flashcard marks.** `handleMark` was the only thing in the app
  touching `streakData` or `dailyCount`, so a learner doing SRS reviews every morning for a month —
  or nothing but quizzes and mock exams — had a streak of 0 throughout. It feeds the Dashboard
  headline, the week/month streak achievements, and 20 of the 100 points in the readiness score: one
  missing call site, wrong in four visible places. Sessions now advance it, gated on `total > 0` so
  a phantom 0/0 session can't.
- `calcReadiness` read `srs.stats.review`, **a key that has never existed** (`getSRSStats` returns
  total/new/learning/young/mature/due), so the SRS component counted mature cards only while its
  comment said "mature+review". Second dead-key bug found in this one function.
- `SRSContext` memoised its provider value from a hand-listed key subset that **omitted `stats`** —
  any review changing the stats without changing the due count served consumers the previous
  render's numbers.
- `goTab` never cleared `modeParams`, unlike every other exit path.
- `buildAchievementState` had inline copies of two scoring helpers it was already importing a third
  from.

### Design system

Keyframes lived in **two files with six conflicting definitions** — fadeIn 6px vs 8px, slideUp 14
vs 20, scaleIn 0.93 vs 0.92, and `shimmer` running in **opposite directions** — and `theme.js`'s
JS-injected `<style>` block silently won every one, making the values in global.css dead.
Confirmed by reading the live CSSOM in a browser rather than reasoning about import order.
Consolidated into global.css at the values that were actually rendering, so no pixels moved; ten
unreferenced keyframes and a dead `.ssw-stagger` helper dropped; `--ssw-accentSoft` defined, which
two stylesheets had been asking for and silently falling back from since it never existed.

**254 of 297 inline `fontSize: <px>` in JSX migrated onto the `--fs-*` tokens.** DESIGN_SPEC §3
claimed of the px→rem conversion that "every consumer only ever reads `--fs-*` via var(), confirmed
by grep" — that grep can only have covered stylesheets, so the whole point of the conversion reached
the shell and missed nearly every mode screen, which was also frozen at phone sizes on desktop. The
spec is corrected in place rather than quietly rewritten.

### UI

- **One mode header.** 20 of 21 modes rendered their own name a second time under the shared
  header, and drew one of **27 different back buttons**. ModeHeader is now the whole header: back
  control, breadcrumb, `<h1>`. Comes with an exit guard (`useExitGuard`) so the single shared arrow
  cannot silently discard a half-finished exam — SimulasiMode registers its confirmation while, and
  only while, one is running.
- **Two modes rendered the entire deck.** Buku Catatan at 19,264 DOM nodes / 134,599px; Glosari at
  18,329 / 82,128px. Now 714 / 4,095px and 1,642 / 6,105px, rendering incrementally, with Glosari's
  A–Z jump verified still landing correctly.
- **The app's one horizontal overflow**, found by sweeping 24 screens × 3 viewports: Glosari's
  `minmax(430px, 1fr)` is a hard floor, so at a 390px viewport its rows stayed 430px and pushed the
  document to 446px. Its own regression test was scoped to one selector in one file and is now
  general across every auto-fit grid.
- **`JpFront` gained `compact`** for list contexts: the stacked, centred hero treatment for
  vs/・/：/→ terms was leaking into scrolling lists, where **15% of cards** contain one of those
  separators and became 3–5 line centred blocks among single-line neighbours.
- **Seven declarations across five files were switching off the app's only focus indicator**, all on
  text inputs — the controls where a keyboard user most needs it. And the indicator itself was drawn
  so the outline's own offset gap was solid near-black, reading as a heavy black frame; on an input
  the amber was never visible at all.
- **Autoplay TTS failures no longer raise an error toast.** On a phone with no ja-JP voice — ordinary
  on the handsets this app targets — opening ReviewMode produced an error about a feature the
  learner never invoked, every session. Deliberate taps on a speaker button still warn.
- **A control that could not change anything, shown in two modes.** SearchMode's and GlossaryMode's
  "Semua jalur / Jalurku" toggle: every category carries `tracks: ['lifeline']`, so both sides
  produced the identical set.

### Typography

**85% of the app's visible text was 13px or smaller.** A Playwright census of every rendered text
node across all 24 screens: 29% at 11px, 20% at 13, 14% at 12, 8% at 10, 4% at 9 — and 9% at 7px,
0.2% at 5px. The 5–7px was furigana: `.ruby rt` was `0.44em` of `jpFontSize`'s 13px floor, two
numbers in two files nobody had multiplied. For an audience reading Japanese on cheap phones,
outdoors, that was the app's largest usability problem, and it was invisible from the code — no
single rule looks wrong, the sizes just accumulate at the bottom. The old scale also had five steps
(9/10/11/12/13) inside 4px, then a gap to 17, then to 22: indistinguishable in use, and false
precision.

Rebuilt as fluid `clamp(rem + vw)` on a ~1.11 → 1.2 ratio, each token interpolating from its phone
size at 390px to its desktop size at 1280px. `rem + vw`, never bare `vw` — the rem term is what
keeps the scale responsive to a reader's own font-size preference. After: 50.6% at ≤13px, nothing
below 10px.

**New: Ukuran Teks** (Saya tab) — four steps, 90/100/112/125%, applied pre-paint so there is no
flash on load, persisted in prefs.

### Layout

- **Spacing did not move with the type.** Measured once Ukuran Teks existed: at "Sangat Besar" body
  text goes 15px → 18.8px while `--sp-3` stays 12px and `--sp-4` stays 16px, so every gap, padding
  and gutter holds still and the layout gets *tighter* for exactly the reader who asked for it to
  get looser. The scale is now `--space-2`…`--space-64` in rem — renamed rather than redefined, so
  a missed call site fails `audit:css-vars` instead of silently mis-sizing. 520 values moved onto
  it (102 in CSS, 418 in JSX style objects), 140 of them off-grid and snapped to the nearest step.
- **Width had two owners.** `AppShell.module.css` states in its own header that component
  stylesheets must not set their own max-width; ten of them did, along with their own 16px gutter
  *inside* `.content`, which had already applied both. A mode screen got 326px of a 390px phone
  where the tab screens got 358px.
- **A mode could not reach the height the shell reserved for it.** `.content` is viewport-tall, but
  a mode inside it is a plain block, so everything short of a full screen packed against the top —
  284px of empty space under FlashcardMode's last control at 390×844, 334px at 1440×900, which also
  put the primary controls out of thumb reach. Now 40px at both.
- **11 of 21 mode titles were ellipsised** at 320px, 3 at 390px, because sticky chrome had been
  given the display-size page-title token.

### Content

**180 ruby readings scoped to the term they actually belong to.** Found from a
screenshot taken for the layout work, not from the data: a flashcard rendered
タイル張り工事 with a reading three times too long, and a browser spreads a
too-wide `<rt>` evenly across its base — so the Japanese itself came apart into
spaced-out characters. Two classes underneath it:

- **147 split words whose second half carried the whole word's reading** —
  `給湯《きゅうとう》管《きゅうとうかん》`, `型《かた》枠《かたわく》`,
  `通信《つうしん》ケーブル《つうしんケーブル》`. Mechanical to detect (the
  second reading starts with the first one in full) and so fixed and guarded
  mechanically; `audit-data-text.mjs` grows the rule, whose existing pooled
  check keyed on whitespace and could never have seen these.
- **33 card titles with several terms' readings run together**, sometimes
  including readings for terms that only appear in the card's notes. No rule
  says which part belongs to which term, so each was re-annotated by hand from
  the card's own fields.

Corpus-wide, kana readings that cannot align to any suffix of the text before
them fell from 283 to 122; among card titles, from 32 to 3.

- 13 pooled ruby readings split per term — `免振 vs 制振 vs 耐震《めんしん vs せいしん vs たいしん》`
  attached three terms' readings to the last term, so DangerMode's accordion showed raw 《》
  mid-title. Each fix derived from the entry's own sibling fields.
- 21 Kangxi Radical codepoints (`⽅` U+2F45 for `方` U+65B9) and one Cyrillic а/р typo'd into a Latin
  word — both flagged as out of scope by the 2026-08-26 font work and still live until now. They
  render identically to the right character, so nothing on screen ever revealed them, and they sat
  in quiz data, which `audit-integrity.mjs` never reads.
- Two stale question counts in the mode registry, now derived from the data: Wayground claimed 579
  soal against a real 740, Kosakata claimed 380 against a real 240 — and Kosakata's own screen had
  been printing 240 all along, so the menu and the mode disagreed within one session.
- "3 jalur" and a footer reading 土木 · 建築 · ライフライン設備 in the Saya tab, and index.html's
  og:description advertising 1.443 cards against a real 1,438.

### Verification

`npm run validate` clean: format, lint, **728 tests** (up from 652), five audits, build. Every UI
change screenshotted at 390/820/1440px in both themes, before and after. The typography and layout
work additionally swept all 24 screens × 3 viewports for horizontal overflow and unreachable nav at
both Normal and Sangat Besar text size — clean at both.

Open items, including two decisions for the owner: `docs/UI_UX_PLAN.md` §12.

## [5.5.0] - 2026-09-01

### Item 68 picked up too -- pivoted from font-sizes to a bigger dead-code finding

Same session, continued once more. Comparing candidate font-sizes against equivalent elements
elsewhere (the same method that confirmed the earlier pageTitle/ratingEmoji fixes) surfaced
something more consequential than the font-sizes themselves: 41 of the shared `modes.module.css`
file's 67 rules -- 61% of it -- had zero references anywhere in the app. Whole sections had gone
dead wholesale (Stats mode, Review mode, Export mode, Sprint/angka, Simulasi/danger shared,
Wayground, Sipil/Bangunan/JAC shared, Sumber mode, nearly all of Flashcard-specific, all of
Glossary/vocab list items) from the same pattern repeated across this app's history: a mode
moves to its own dedicated CSS module, and the shared rules it used to lean on are never removed.

Removed all 41, verified carefully: a recursive cross-file search rather than just
`src/modes/*.jsx` (which would have missed subdirectory components), a self-caught false positive
along the way (a non-word-boundary match that mistook an unrelated inline animation name for a
live class reference), and a full 21-mode screenshot sweep at both viewports before and after,
confirming nothing visually changed anywhere the removed rules used to apply.

The font-size comparisons themselves mostly weren't actionable on inspection -- differences found
(e.g. ReviewMode's flipIdText vs FlashcardMode's backId) were consistently multi-property
(size+weight+color together), consistent with deliberate adaptation to different visual
treatments rather than an accidental single-property mismatch. Left as-is rather than forced to
match without real evidence.

652/652 tests (re-run 3x for confidence, given a one-off screenshot artifact investigated during
this round that didn't reproduce on retest), lint clean, build clean.



### Closing out the leftover items -- owner said "yes please" to picking them back up

Same session as 5.3.0, continued. Closed both remaining items from `docs/UI_UX_PLAN.md` §11.

**Item 66 (content-data defects), fully closed.** The 4 remaining rendering-affecting readings
fixed at the source, each cross-checked against that same card's own desc/usage field first (2
of the 4 already had the correct form written correctly elsewhere in the same card, which is
what made the wrong one identifiable as wrong): 打設する《だせつ》 (marker repositioned before
the okurigana), 丸のこ《まるのこきっくばっく》 (unrelated hazard term trimmed off the reading),
突き固める《つきかため》 (reading completed with its own missing trailing る), 左官仕上げ
《さかんしあげとぎだしあらいだし》 (two unrelated technique names trimmed off). Also collapsed
the 79-occurrence duplicated-marker pattern in jac-mockup-sets.js (the exact same marker written
twice in a row, e.g. the original 冷媒《れいばい》《れいばい》 report that started this whole
thread) -- cosmetically harmless as of the round-4 rewrite, but real duplication worth cleaning
rather than leaving for the renderer to quietly paper over indefinitely.

**Item 67 (expand-to-all-devices audit), substantially closed.** Re-checked the 4 `default`-width
modes against real content rather than empty states -- SumberMode and SearchMode's single-column
layout confirmed to already use its width correctly (wrapping description text, progress bars),
not stretching with dead space the way Belajar's case was. No further stretching bugs found
across the full 21-mode registry.

Item 68 (remaining off-scale font-sizes) left open deliberately -- its own framing needs
item-by-item comparison work before it can say which few values actually need changing, better
suited to a fresh session's full budget than a low-confidence pass at the end of this one.

652/652 tests, lint clean, build clean.



### "Polish the UI & UX, overhaul anything" -- owner gave full latitude, audited systematically

Same session as 5.2.0, continued into the next calendar day. Screenshotted all 21 modes at
mobile and desktop (42 screenshots) rather than guessing at what might need polish.

**ReviewMode was logging a phantom session.** Not a visual bug -- opening "Ulasan SRS" with
zero cards due silently recorded a 0/0 session, inflating streak/weekly-stats/daily-mission
bookkeeping just from opening the tab. Found while investigating what looked like a broken
bar chart in Statistik; the chart was rendering correctly the entire time, the session data
feeding it wasn't. Fixed at the source: the recording effect now requires a genuinely
non-empty queue, matching the condition the render path (EmptyState.NoReviews) already used.

**DengarMode's settings-screen heading** didn't match the shared styling convention every
other mode's equivalent screen uses (SprintMode, ProductionMode, FocusMode) -- hand-rolled
inline styles rendered in the wrong font family and a visibly lighter weight. Fixed to match.

**Three modes' title-and-button header rows broke at narrow widths**: ConfusionMode's title
wrapped to two lines, AngkaMode's title was actually overlapped by its own button, DangerMode's
title wrapped. Root cause: a shared button style meant for standalone full-width buttons,
reused in a row context where it only stayed compact by accident. Fixed with the appropriate
technique per case (auto-width override for the single-button case; wrap-and-reflow for the
two-button case) -- and worth noting honestly: the first fix attempted on ConfusionMode made
it substantially worse before the real cause was found, caught by screenshot rather than
shipped. Every fix in this round was verified with real before/after screenshots at both
viewports, not assumed correct from source alone.

651/651 tests (3 new), lint clean, build clean.

## [5.2.0] - 2026-08-31

### Owner tested v5.1.0 live, found real gaps -- same-day follow-up

Same session as 5.1.0, continued after the owner tried the shipped build and reported a
screenshot plus a factual correction, both investigated and fixed the same day.

**Ruby round 4.** Round 3's corpus sweep verifies the renderer never produces garbage for any
real string; it can't verify the renderer produces the *right* output, since it has no
independent way to know what "right" is for a given string -- a different property, and the
reason a passing sweep still shipped with two more real, separate bugs:

- The reported card (ダクトの3種類, "3 duct types") had a content-data bug, not a rendering
  bug: its `jp` field literally concatenated five readings into one marker -- its own two
  words' readings, plus three more copied in from its own `desc` field's separate terms.
  Searched systematically rather than patching only the report: 127 cards had a suspiciously
  long reading; every one hand-verified against its own desc/usage (two automated shortcuts
  were tried first and both produced confident-looking wrong answers on close inspection); 26
  were genuine bugs and are fixed, ~101 were long-but-correct and left untouched.
- Separately, kanji+katakana loanword compounds (移動式クレーン, 冷却コイル, 防水カバー --
  ordinary vocabulary in this domain, not edge cases) were never matched by the renderer at
  all, and silently dropped when they shared a sentence with other, successfully-matched
  markers. 871 occurrences, 384 unique pairs across the shipped data. Fixed by keeping
  kanji+katakana always combined as one ruby span with the untrimmed reading, rather than
  attempting an unreliable cross-script exact-match split.
- Same pass also stopped JpFront from forcing Japanese typography (CJK font, centering,
  kanji-density length-scaling) onto non-Japanese content that a few modes' shared
  ResultScreen slots sometimes carry (Indonesian definitions/translations) -- new
  `isMeaningfullyJapanese()` ratio check, found while re-auditing the same render paths.

**Simulasi exam timing corrected to the real exam's convention.** Owner: 2 minutes per
question (100 min for the 50-question full exam), not the roughly 1 min/question the app
actually shipped with. Applied uniformly to every preset (quick 15->30min, half 25->50min,
full 50->100min), not only the one specifically mentioned. JAC Official's own "full" preset
draws a random set-pair at runtime (44 or 51 questions, not a fixed 50) -- its time budget is
now computed from the actual drawn count once known, rather than a static guess, and its label
states the honest 88-102 minute range instead of picking one number.

644/648 -> 648/648 tests across this round (11 new: 4 ruby regression + 3 corpus-level +
4 timing), lint clean, build clean throughout.



### Exhaustive UI/UX/typography audit, owner-requested with full authorization

New agent session, owner asked for a thorough, unscoped UI/UX/typography audit ("audit
super duper exhaustively," blanket approval for anything found, full token budget
authorized). Full detail in each fix's own commit message and in `docs/DESIGN_SPEC.md`/
`docs/LAYOUT_SPEC.md`, both updated in place — summarized here, not repeated in full.

**Ruby rendering — the underlying algorithm, not just adoption coverage this time.**
Prior rounds (2026-08-27/28) fixed *which fields* get run through the ruby renderer and
verified via a Playwright DOM sweep for literal `《`/`》` characters. That sweep couldn't
catch two classes of bug in the renderer itself, because neither leaves a literal bracket
to find: (1) `parseRubyFragments`/`renderJPWithRuby`'s two-step parse-then-reindex design
silently misplaced a reading onto the wrong occurrence of a repeated kanji base — found by
mechanically simulating the old algorithm against every string in `src/data`, not
spot-checking; (2) the regex required kanji touching `《` directly, so the real, common
alternate data convention of marking a whole conjugated word including its okurigana
(見切る《みきる》, not 見切《みき》る) was never matched at all — ~870 occurrences across
`src/data`, silently dropped in some render paths, left as literal bracketed text in
others. Rewritten as a single forward pass over the source text; a new corpus-wide test
(`ruby-audit-round3.test.jsx`) renders every real `《`-bearing string in the shipped data
through the actual function and asserts no unexplained raw bracket survives — surfaced 5
more pre-existing content-data defects along the way (incomplete/concatenated readings,
one case of `《》` used as a parenthetical aside), logged rather than papered over.

**Dense-list font-size capping, swept to completion.** `maxSize` (JpFront's opt-in ceiling
on jpFontSize's upward auto-scaling for short strings) was added 2026-08-28 for the one
reported case. This pass traced all ~30 live call sites individually and found ~9 more
dense-list/grid contexts with the identical bug (SearchMode, GlossaryMode, DangerMode's
accordion, CatatanMode, SumberMode, Dashboard's recent-cards list, ConfusionMode ×3) — two
of them had an additional latent bug where a wrapping `fontSize` style had never actually
applied at all, since JpFront always overrides with its own inline size.

**Typography consistency.** New `--fs-page-title` token (22px/26px wide) unifying
BelajarTab's page title (confirmed via live computed-style measurement to be the actual
outlier at 24px, not SayaTab/every mode screen's already-matching 22px — Dashboard's own
h1 shared the same drift but is invisible below the 1040px breakpoint, so this was a
growing-not-shrinking problem). 52 hardcoded font-sizes that exactly matched an existing
token mechanically migrated onto it. ReviewMode's SRS rating-emoji was smaller than its
own text label — a real bug (confirmed by comparing the whole button to FlashcardMode's
structurally identical widget), not intentional compactness — fixed to match.

**`--fs-*` converted to `rem`**, closing `docs/UI_UX_PLAN.md` item 53 (deferred
2026-08-26). The original three-reason deferral turned out to describe a much smaller
change than estimated once actually traced through: ruby's `em` sizing and
`jpFontSize()`'s JS ladder both compute independently of these specific CSS custom
properties, and the ~89-file number was a verification surface, not an edit surface, since
every consumer only ever reads via `var()`. Verified live: pixel-identical output at
default zoom, and a forced larger root font-size now actually scales these tokens, which
it structurally could not do before.

**First concrete step on "expand to all devices."** BelajarTab's single-column accordion
menu was stretching to the full 1180px desktop content column with a growing dead gap
beside every card, unlike Dashboard and SayaTab, which both genuinely reflow into
multi-column layouts at the same breakpoint (confirmed live at 375/820/1440px viewports,
not assumed from source). Given the same `width='reading'` policy every individual mode
screen already defaults to for this shape of content.

**Docs housekeeping.** HANDOFF.md had grown to 412 lines, well past its own ~190-line
target — the accumulated 2026-08-27/28 narrative retired to
`docs/archive/HANDOFF-2026-08-27-28-sessions.md` per the documented retirement procedure,
`_MAP.md`'s session log condensed to a pointer row. `docs/UI_UX_PLAN.md` gains a new §11
(items 66-68) for real findings this round didn't fully close out — remaining content-data
defects, the rest of the mode registry's own "expand to all devices" audit, a longer tail
of one-off font-sizes not individually checked.

642/642 tests (633 + 9 new), lint clean, build clean throughout.



### Major version bump — overdue. Two full work streams since 4.23.0, neither ever recorded here

`package.json` and this file both sat frozen at 4.23.0 since the content-dq merge
(2026-08-18) despite two substantial, separate bodies of work landing on `main` after
it — the version-bump discipline visible throughout this file's own earlier history
(patch bumps most sessions, minor bumps for real features) simply stopped being followed.
Caught and corrected on direct request, not found proactively — worth being honest about
that rather than implying otherwise. Major, not minor: the combined scope (a full UI/UX
pass touching nearly every screen, plus a live-bug-fixing pass that changed real user-
facing behavior in Simulasi, Belajar, and Saya) is a bigger jump than this project's own
historical minor-bump threshold.

### Stream 1 — `feat/ui-overhaul`, merged 2026-08-26 (fast-forward, no merge commit)

61 items total across two plans (38 items 2026-08-25, then 23 more items 43–65
2026-08-25/26), full detail in `docs/archive/HANDOFF-ui-overhaul-38-items.md` and
`_MAP.md`'s session log — summarized here, not repeated in full:

- **Furigana/ruby consistency**: true `<ruby>` markup replacing detached reading rows in
  `ReviewMode`, furigana policy enforcement across ~20 rendering surfaces, `QuizAnnouncer`
  screen-reader support.
- **Visual/interaction polish**: swipe gestures, `ResultScreen` adopted by 6 previously
  hand-rolled modes, shared `QUIZ_COUNTS` constant (fixed a persistence bug in the
  process), animations, A-Z bar tap targets.
- **Performance/offline**: self-hosted subsetted fonts (92% size reduction vs. naive
  self-hosting), manifest-driven `PRECACHE_URLS` (was 2 hand-written entries; now
  generated from Vite's real build manifest — 38 entries, the 3 highest-traffic modes'
  full dependency chains plus the shell).
- **Exam-readiness estimate, weak-category drilling, per-question timing, typed-answer
  diff display** — approved enhancements shipped as part of the 43–65 plan.
- 600/600 tests at merge time (up from 546 at the start of the 38-item plan).

### Stream 2 — 2026-08-27/28, live-bug-fixing sessions (this file's most recent work)

Two consecutive days, one continuous set of conversations, triggered by the owner
testing the just-merged `feat/ui-overhaul` build directly on-device. Full evidence per
fix in `_MAP.md`'s 2026-08-27 and 2026-08-28 rows and `HANDOFF.md`'s CURRENT STATE —
summarized here:

**Ruby/furigana — a second pass, systemic this time.** The 38-item plan's furigana work
fixed the rendering *mechanism*; this pass found the mechanism was still only wired up in
a fraction of the places that needed it. `parseRubyFragments` didn't handle particle/
number-interrupted phrases (`安全確認の8項目` and ~250 similar) correctly — fixed at the
code level (handles the whole class, not just known cases) and for 35 data entries
verified with high confidence (`docs/RUBY_MISMATCH_AUDIT.md` tracks the 210 that weren't
confident enough to auto-fix). `DescBlock` — a component that already correctly rendered
ruby in structured text — turned out to be adopted in exactly one place
(`FlashcardMode/FlipCard.jsx`); adopted in the 6 other modes that needed it
(`ReviewMode`, `GlossaryMode`, `ProductionMode` ×2, `QuizProduksiMode`, `SumberMode`).
`QuizShell` and `ResultScreen` — both shared across most of the app's quiz-style modes —
had the same raw-render gap in their hint/explanation/answer-review fields, fixed once
at the shared-component level rather than per-mode. A second, more systematic audit pass
(triggered by the owner asking directly whether the first pass was actually thorough — it
wasn't, and that was the honest answer given at the time) found more gaps a field-name
search alone couldn't: `AngkaMode`'s `item.soal`, `subtitle` on Wayground/JAC Mockup sets,
the Saya tab's daily-challenge feature (traced to `daily-challenge.js` building its own
question shape independently of every other already-fixed path), a `StatsMode`
truncation that could cut a ruby marker in half mid-string, and `ErrorBoundary`'s
old-WebView flashcard fallback. Verified via Playwright across all 21 modes with data
seeded to trigger review/detail paths, not just unit tests.

**Bug reports, root-caused against real code rather than assumed:**

- **Praktik Set** (10 sets) was being counted into "Kosakata · Vocab Drill" — moved into
  "Soal Teknis" (`WaygroundMode`), which surfaced a second bug in the same file: 12 "JAC
  Mockup" sets (300 questions) were counted in that screen's own header total but
  unreachable from any group list, since the group-matching prefixes hadn't been updated
  when those set ids were renamed in an earlier session.
- **Sprint** had no way to exit or pause mid-round — added both, with the pause overlay
  itself offering an exit path rather than being a separate, disconnected control.
- **Fokus** showed a green checkmark next to 0% mastery — not a data bug; a "drilled this
  session" indicator and actual mastery percentage are intentionally independent signals
  that happened to share a color, read as contradictory. Recolored, not restructured.
- **`BelajarTab`'s compact-tile grid** was never actually rendering 2 columns on any
  phone, despite the code's own comment saying that was the design — root cause needed
  Playwright to find: `repeat(auto-fit, minmax(min, max))` picks column count from `max`
  when `max` is a fixed length, not `min`, the opposite of what the fix's first attempt
  assumed. Same root mechanic (the reverse case — `min` governing count when `max` is
  `1fr`) caused a second, more severe bug found afterward: `SayaTab`'s settings/stats grid
  had a 400px minimum column width wider than this app's entire mobile content column,
  which doesn't just fail to add a column the way `BelajarTab`'s did — it's a hard floor,
  so every section on the Saya tab was forced 52px wider than the viewport, needing a
  manual pinch-zoom to use. `docs/LAYOUT_SPEC.md`'s Variant A/B guidance corrected both
  times so this mechanic doesn't get relearned the hard way a third time.
- **Simulasi restructured** at the owner's request into two explicit question sources
  instead of one undifferentiated 1075-question pool: "Teori & Praktik" (Wayground + JAC
  Mockup, sampled at a fixed 60/40 teori/praktik ratio — 30+20 for the full exam, scaling
  to 9+6 and 15+10 for smaller presets) and "JAC Official" (its own real internal
  structure — 2 teori sets, 2 praktik sets, sizes genuinely uneven — discovered mid-
  conversation after an initial wrong claim that no such structure existed, corrected
  once the owner pushed back with specifics). Every start resamples fresh rather than
  drawing from a fixed set.
- **Belajar tab reworked into an accordion** — featured card per section always visible,
  secondary items collapse per section (agreed via Visualizer mockups before
  implementation, not built sight-unseen). Verified via Playwright that every section
  collapsed now fits the whole tab in a single screen with zero scrolling, down from a
  multi-screen scroll before.

617 → 632 tests across this stream (605 at the start of 2026-08-27, +7 net through the
day, +5 more for the accordion) — exact progression per-commit in `_MAP.md`, not
restated here.

### Known follow-up work, not done here

- `docs/RUBY_MISMATCH_AUDIT.md`: 210 ruby entries flagged but not auto-fixed with
  confidence — needs a human who can verify actual Japanese readings.
- 94 question-text entries carry a redundant mixed annotation style (proper `《》` ruby
  markers duplicated by adjacent plain-paren readings) in `wayground-sets.js` — confirmed
  **not** an active rendering bug (`stripFuri`'s existing handling already absorbs it
  safely wherever it's actually used), but a content-authoring cleanliness item worth a
  future pass. Found incidentally while investigating the `SayaTab` overflow above; that
  bug turned out to be unrelated (a pure CSS grid issue).

## [4.23.0] - 2026-08-18

### merge(content-dq→main): branch merge — 3.5 months of content-quality work + Doboku/Kenchiku removal + furi→ruby migration

`content-dq` and `main` shared no common git ancestor (content-dq's root commit stripped the
app layer down to data-only on day one, 2026-05-10) — reconciled as a mechanical file union
(`git merge --allow-unrelated-histories`) followed by manual code surgery for everything the
file-level merge couldn't resolve on its own. Full writeup in `_MAP.md`'s session log and
`HANDOFF.md`.

**Data layer — replaced wholesale from content-dq:**

- `src/data/` restructured to a split-file architecture (`cards/{common,lifeline}/`,
  `sets/{wayground,jac-mockup,jac}/`) with `source/` mirrors and `cards.js`/`wayground-sets.js`/
  `jac-mockup-sets.js` as regenerated aggregates.
- Card count: 1,443 → 1,438 (5 duplicates removed). Quiz questions: ~974 → ~1,075 (Wayground
  680 · JAC Mockup 300 · JAC Resmi 95).
- `furi` field dropped from all 1,438 cards — readings now derived from inline `《》` ruby in
  `jp` via `extractReadings()` (already existed in `jp-helpers.js`).

**Doboku/Kenchiku tracks removed** (content-dq session 24 decision, propagated into the app
layer here): both tracks were 100% AI-generated draft content with zero official JAC material.
Deleted `DobokuMode.jsx`, `KenchikuMode.jsx`, `TrackPicker.jsx` (found to be fully dead code
during this pass — zero imports anywhere), removed the track-picker step from onboarding
entirely (single remaining track makes a "choice" meaningless — renumbered the flow from 4
steps to 3), 33 files touched in total. `dobokuScores`/`kenchikuScores` dropped from storage.

**JAC schema migration:** `jp/hiragana/options/answer/hasPhoto` → `q/hint/opts/opts_id/ans/
img/exp`. Reading now inline ruby in `q`; `opts_id` cleanly separates per-option Indonesian
translations (previously embedded inline in the JP option string). `JACMode.jsx`,
`SimulasiMode.jsx`, `daily-challenge.js` updated.

**furi → ruby migration, 12 files:** every real consumer of the dropped `card.furi` field
swapped to `extractReadings(card.jp)` — `Onboarding.jsx`, `QuizMode.jsx`, `ProductionMode.jsx`,
`FlashcardMode/FlipCard.jsx`, `SprintMode.jsx`, `SearchMode.jsx`, `GlossaryMode.jsx`,
`SumberMode.jsx`, `ReviewMode.jsx`, `CatatanMode.jsx`, `QuizProduksiMode.jsx`, `DengarMode.jsx`.
`ProductionMode.jsx`'s kana-only answer-matching branch needed more than a rename: the old
`furi` field concatenated multi-reading cards with no separator, `extractReadings()` joins
with a display space — fixed by normalizing whitespace before comparing, otherwise correctly-
typed answers on ~20% of cards (294/1438 have multiple ruby blocks) would have started failing.
Also fixed two pre-existing bugs found adjacent to this work: `CatatanMode.jsx` and
`DengarMode.jsx` were rendering raw `card.jp` (ruby brackets included) instead of
`stripFuri(card.jp)`.

**Storage v5 → v6:**

- `dobokuScores`/`kenchikuScores` dropped.
- `wgScores`/`jacScores`/`wgWrong` keys remapped for the wayground/CSV set-id rename, but only
  where a clean 1:1 correspondence could be verified (teori `wt1-10→wt01-10`, CSV→JAC-mockup
  `ct/cp→jmt/jml`, 22 sets). Deliberately not remapped: old praktik/vocab set ids — the old
  monolith had a confirmed set/track drift bug and vocab was genuinely restructured by question
  direction, not renamed, so no reliable correspondence exists to map from.

**Build pipeline fixes** (found by actually running `npm run build`, not caught by tests/lint):
`scripts/merge-cards.mjs` had the 2 deleted doboku/kenchiku source files hardcoded — fixing this
and regenerating `cards.js` also surfaced 10 cards where the committed aggregate had a
duplicated trailing sentence fragment already fixed in the source files but never propagated
(content-dq had no regeneration script). `scripts/validate-data.mjs`'s photo-asset check was
rewritten — it validated against a `public/jac-photos/` directory that has never existed,
meaning it fired a warning for every photo-linked question unconditionally since it was
written; now checks that the `photoDesc` text substitute (what the app actually renders) is
present and substantive instead. `vite.config.js`'s `manualChunks` referenced deleted file
paths directly (Rollup-only failure, invisible to imports elsewhere).

**Docs:** `HANDOFF.md`, `CARD_CONTENT_SPEC.md`, `DATA_ARCH_AUDIT.md`, `viewer.html` adopted from
content-dq. `DATA_QUALITY_HANDOFF_v8/v11/v12.md` moved to `docs/archive/` (superseded by
`HANDOFF.md`, same lineage). `docs/archive/ARCHIVE-INDEX.md` combined from both branches.
`README.md`/`_MAP.md` rewritten for the merged, single-track reality.

**Tests:** 435 passing (39 files) — up from a real baseline of 23 failures across 7 files
immediately post-merge (stale set-id references, dead doboku/kenchiku assertions, 2 pre-existing
`STORAGE_VERSION` hardcodes that already didn't match main's own code before this merge).
`npm run lint`: 0 warnings (also cleared one pre-existing unused import, predating this merge).
`npm run build`: clean.

### feat(data+storage): card ID renumbering — contiguous 1–1443

**Card IDs renumbered:**

- All 1,443 cards now have contiguous IDs 1–1443 (was 1–1628 with 185 gaps)
- Source files updated: cards-common.js (879 cards), cards-lifeline.js (564 cards)
- Cross-references updated: 73 JAC `related_card_id` refs, 24 `angka-kunci.js` kartu refs
- `scripts/renumber-cards.mjs`: one-shot script that built the mapping and rewrote all files

**Storage schema v4:**

- `STORAGE_VERSION` bumped 3 → 4
- `src/storage/card-id-map-v4.js`: old→new ID mapping (1443 entries)
- `migrate_v3_to_v4()`: remaps SRS card keys, known/unknown/starred arrays, quizWrong/wrongCounts
- Full migration chain: v1→v4, v2→v4, v3→v4 all handled in engine.js init
- Existing users' SRS progress fully preserved via remap

**Tests:** 457 passing (41 files) — version assertions updated (v3→v4), SRS key expectations updated

## [4.21.1] - 2026-05-09

### refactor(hooks) + fix(WaygroundMode) + feat(ExportMode): OVERHAUL-1 + ENG-4 + ENG-6

**OVERHAUL-1 — Retire usePersistedState.js:**

- `usePersistedState.js` deleted; removed from `hooks/index.js`
- `QuizMode.jsx`: replaced `usePersistedState('ssw-quiz-wrong', {})` with `useProgress().quizWrong` + `recordWrong`
- `DangerMode.jsx`: replaced `setDangerWrong(...)` with `useProgress().recordWrong(key)`
- `DengarMode.jsx`: replaced `setQuizWrong(...)` with `useProgress().recordWrong(cardId)`
- All quizWrong writes now flow through engine (lz-string compressed, exportable)

**ENG-4 — WaygroundMode legacy read fix:**

- `getSetWrongCount(setId)` migrated from `loadFromStorage('ssw-wg-wrong-${setId}')` to `get('progress')?.wgWrong` prefix scan
- `loadFromStorage` import removed from WaygroundMode

**ENG-6 — ExportMode richer summary:**

- `readSummary()` now includes: `quizWrong`, `wgWrong`, `jacScores`, `wgScores` counts
- Export stats display shows "Salah Kuis" and "Skor JAC" tiles

**Tests: 457 passing (41 files) — 9 new tests (OVERHAUL-1 × 3, ENG-4 × 2, ENG-6 × 4)**

## [4.21.0] - 2026-05-09

### refactor(data): data layer consolidation (REF-8 + REF-9 + C1-C9)

**REF-8 — Merge vocab source files (8 → 4 source files):**

- cards-common-vocab.js (233 cards) merged into cards-common.js → 879 total
- cards-lifeline-vocab.js (120 cards) merged into cards-lifeline.js → 564 total
- cards-doboku-vocab.js + cards-kenchiku-vocab.js (both empty stubs) deleted
- scripts/merge-cards.mjs inputs updated; count 1443 verified

**REF-9 — Absorb sipil/bangunan sets into quiz-sets.js:**

- SIPIL_SETS + BANGUNAN_SETS inlined into quiz-sets.js with track:'doboku'/'kenchiku'
- sipil-sets.js + bangunan-sets.js deleted
- SipilMode + BangunanMode use getQuizSetsForTrack() instead of direct imports
- sipil-data.test.js + bangunan-data.test.js updated to import from quiz-sets.js
- data/index.js: removed direct SIPIL_SETS/BANGUNAN_SETS re-exports
- Total QUIZ_SETS: 38 → 44 (+ 3 sipil + 3 bangunan)

**Tests C1-C9 — data-integrity.test.js:**

- C1: SOURCE_GROUPS keys in SOURCE_META
- C2: related_card_id refs valid
- C3: every QUIZ_SET has track field
- C4: no \_origIndex in CARDS
- C5: CARDS count = 1443
- C6: no duplicate card IDs
- C7: quiz answer index in bounds
- C8/C9: doboku/kenchiku track includes sipil/bangunan sets
- 448 total tests, 40 files

## [4.20.15] - 2026-05-09

### feat: useTrackedCards hook (ENG-11)

- hooks/useTrackedCards.js: centralized filtered-cards hook (track + excludeVocab + category + source + knownOnly + unknownOnly + starredOnly)
- hooks/index.js: barrel export added
- tests/useTrackedCards.test.jsx: 6 tests covering track filtering, excludeVocab, source, category, edge cases (439 total, 39 files)
- Existing sites (SearchMode, GlossaryMode, ModeRouter) deferred — all have showAllTracks or null-track conditional; don't force-fit per task spec

## [4.20.14] - 2026-05-09

### perf: JpDisplay memoization (REF-11)

- jp-helpers.js: parseDescStructure() — pure function for desc branch detection
- JpDisplay DescBlock: useMemo([desc, maxLines]) via parseDescStructure — no re-parse on unrelated renders
- JpDisplay JpFront: jpBranch useMemo([jp]) — vs/bullet/colon/arrow/plain detection memoized

## [4.20.13] - 2026-05-09

### perf: context memoization (REF-10 + ENG-13)

- AppContext: ctx wrapped in useMemo — stable reference across unrelated re-renders
- ProgressContext: ctx wrapped in useMemo with EMPTY_OBJ/ARR stable defaults
- SRSContext: stableSrs via useMemo([srs.dueCount, srs.review, ...]) — rebuilds only after review()
- hooks/useStableContextValue.js: ENG-13 marker file (useMemo inline per ESLint constraint)
- tests/context-memo.test.jsx: 3 memoization tests added (432 total, 38 files)

## [4.20.12] - 2026-05-09

### fix + feat: storage quota detection (STORAGE-1 + ENG-12)

- engine.js writeDoc: QuotaExceededError no longer silently swallowed; returns {ok, reason}
- New utils/storage-quota.js: isQuotaError, notifyQuotaExceeded, estimateStorageUsage, setQuotaHandler
- App.jsx: registers quota handler → toast on write failure
- utils/index.js: barrel updated

## [4.20.11] - 2026-05-09

### fix: direct-import corrections

- N24: VocabMode — WAYGROUND_SETS → QUIZ_SETS (includes 300 CSV questions in vocab pool)
- N25: JACMode + SimulasiMode — JAC_OFFICIAL via data/index.js barrel

## [4.20.10] - 2026-05-09

### fix: DB-1, DB-6, DB-7, DB-8

- DB-1: JACMode + QuizShell — photo banner for hasPhoto questions (yellow chip with photoDesc)
- DB-6: categories.js — 5 empty track categories marked placeholder:true + note (doboku_doko/hoso/haisui, kenchiku_kutai/shiage)
- DB-7: angka-kunci.js — intentional kartu:null exam meta entries annotated with comment
- DB-8: covered by ENG-9 validate-data.mjs duplicate ID check (v4.20.9)

## [4.20.9] - 2026-05-09

### fix + feat: data integrity layer

- DB-2: JACMode filterIds guard — filter undefined/null related_card_id refs (typeof === number)
- DB-3: sipil-sets + bangunan-sets SEED DATA headers removed
- DB-4: empty source file headers updated (Cards: 0 + migration note)
- DB-5: wayground-sets.js header — 12 set → 26 sets / 659 questions
- ENG-9: scripts/validate-data.mjs — pre-build data integrity checker (prebuild hook); patched 3 broken ANGKA_KUNCI kartu refs
- ENG-10: scripts/audit-related-ids.mjs — one-shot cross-ref script; patched 22 broken related_card_id refs → null

## [4.20.8] - 2026-05-09

### fix/feat: F1 F2 F4 R1 R2 N10

- **R1** ReviewMode: removed `_lastResult` / `setLast` dead state (never read; 3 occurrences)
- **R2** Dashboard: `streak` / `dailyCount` now from `useProgress()` (fixes stale `useMemo([], [])` freeze at mount); removed module-level `getStreak` / `getDailyCount` helpers
- **F1** Dashboard: starred-cards quiz button — visible when `starred.size > 0`, launches `kuis` with `filterIds`
- **F2** SumberMode: added `✍️ Produksi` and `🔤 Kuis Prod` quick-launch buttons alongside existing Kartu/Sprint/Kuis
- **F4** `validateSnapshot` summary: added `migrated` field (`true` when snapshot version < `STORAGE_VERSION`); `ExportMode` shows migration notice on both file-import and Gist-pull restore paths
- **N10** SprintMode: `sprintBests` now keyed by `selectedDuration` — each duration (30s/60s/2min) has independent personal best + ghost timeline; duration picker reloads bests on switch
- **Test fix** `components.dashboard.test.jsx`: wrapped all renders in `ProgressProvider` (required by R2 `useProgress` hook)

## [4.20.7] - 2026-05-09

### feat: useDailyChallenge hook — persists to storage engine (ENG-5, N5)

- ENG-5: Added `dailyChallengeLog: {}` to `DEFAULTS.prefs` in schema
- Created `src/hooks/useDailyChallenge.js` — encapsulates daily challenge state, persists answer to storage engine instead of sessionStorage
- `hooks/index.js`: barrel-exports `useDailyChallenge`
- `SayaTab.jsx`: replaced inline sessionStorage state (8+ lines) with `useDailyChallenge()` hook; removed `dcSelected` state; uses `dcAnswered.selected` for option highlighting

## [4.20.6] - 2026-05-09

### fix: wrong-answer + score writes via storage engine (N3, N7, N16, REF-3, N20, REF-3b, N11, R3)

- N3: ProductionMode — recordWrong called on wrong answer and skip
- N7: JACMode — wrongCounts now via storage engine (get/set), not raw usePersistedState key
- N16: QuizProduksiMode — wrong answers via ProgressContext.recordWrong, removed raw usePersistedState
- REF-3: VocabMode — vocabWrong writes via storage engine; WaygroundMode — wgWrong writes via engine
- N20+REF-3b: JACMode, WaygroundMode, VocabMode — score writes via ProgressContext.saveScore (not raw usePersistedState)
- N11: schema.js — sprintBests: {} added to DEFAULTS.prefs
- R3: FocusMode — dead \_unknown prop removed; ModeRouter — unknown removed from fokus props

## [4.20.5] - 2026-05-09

### feat + fix: useSessionTimer, durationMs, recordWrong, N14, B4 (OVERHAUL-2, N6, N21, N22, N14, B4)

- OVERHAUL-2: New src/hooks/useSessionTimer.js — centralized session duration tracking (getDurationMs, reset)
- N6/N17: ModeRouter — both makeSessionEnd and makeFinishHandler now accept + forward durationMs
- N6: QuizShell — tracks startTimeRef, passes durationMs to onFinish
- N6: 5 QuizShell modes (JAC, Vocab, Wayground, Sipil, Bangunan) forward durationMs in handleFinish
- N6/N21: All 9 non-QuizShell modes (Sprint, Simulasi, Confusion, Production, Danger, Angka, Review, QuizProduksi, Dengar) add useSessionTimer + pass durationMs
- N22: ProgressContext.recordWrong — uses makeWrongEntry format (was plain int)
- N14: daily-challenge.js — buildAllQuestions() hoisted to module-level const ALL_QUESTIONS (called once on import)
- B4: recommend-mode.js — maintenance-phase rotation (produksi/dengar/mirip) when matureCount > 300 && avgAcc > 70
- eslint: react-hooks/purity off (not using React Compiler)
- Tests: 429 passing, 37 files

## [4.20.4] - 2026-05-09

### feat + fix: MODE_META color/strand (ENG-3, F3, B2, REF-4)

- ENG-3: All 23 MODE_META entries now have `color` (hex) and `strand` fields
- F3: StatsMode — removed local MODE_COLORS object; uses MODE_META[mode].color
- B2: daily-mission.js — added produksi, kuisprod, mirip, dengar to MISSION_TYPES
- REF-4: MISSION_TYPES strands now derive from MODE_META (permanent single source)

## [4.20.3] - 2026-05-09

### feat + fix: session-analytics.js (ENG-1, ENG-7, B3, N2, N4)

- ENG-1: New src/utils/session-analytics.js — single source of truth for session math (getAvgAccuracy, getBestSimScore, hasPerfectSprint, getStrandCounts, calcReadiness)
- B3: StatsMode.jsx — replaced local calcReadiness + narrow ['kuis','jac','wayground'] filter with session-analytics imports
- N2: recommend-mode.js — replaced narrow quiz filter with getAvgAccuracy(sessions, 10)
- N4: achievements.js — replaced narrow quiz filter with getAvgAccuracy; quiz_70 now fires for all SCORED_QUIZ_MODES
- ENG-7: session-analytics.test.js — 13 new tests (429 total, 37 files)

## [4.20.2] - 2026-05-09

### feat + fix: constants extraction (ENG-2)

- ENG-2: New src/utils/constants.js (TOTAL_CARDS, SCORED_QUIZ_MODES, SRS_MATURE_DAYS, SESSIONS_CAP, etc.)
- N15: ProgressContext — SESSIONS_CAP constant (was hardcoded 180)
- N19: fsrs-scheduler — SRS_MATURE_DAYS constant (was hardcoded 21)
- B5 (P1): StatsMode calcReadiness — spurious ×100 removed; readiness now 0–100 correctly
- B1 (P1): achievements half_deck/full_deck thresholds updated to HALF_DECK_THRESHOLD/TOTAL_CARDS

## [4.20.1] - 2026-05-09

### fix + feat: UTC date bugs (REF-6 + ENG-8)

- REF-6: New src/utils/date.js — todayStr/prevDayStr/isoToLocalDate (local tz, not UTC)
- N13 (P1): ProgressContext streak tracking now uses local dates — fixes false streak resets at 07:00 WIB
- N9: daily-challenge + daily-mission use local todayStr
- N18: StudyHeatmap grid keys use local timezone
- Dashboard.jsx: UTC date references fixed
- ENG-8: src/tests/date.test.js (5 tests)

## [4.20.0] - 2026-05-09

### fix: P0 critical bugs + pre-existing lint crashes

- X1 (VocabMode): MIX_ALL moved inside component; VOCAB_SETS memoized with useMemo — fixes ReferenceError on load
- X2 (SprintMode): quizWrong written to progress doc (was: prefs)
- AngkaMode: `ANGKA_KUNCI` aliased as `ANGKA` at import; removed self-referencing filter — fixes crash on load
- DangerMode: `DANGER_PAIRS` aliased as `PAIRS` at import; removed self-referencing filter — fixes crash on load
- eslint.config.js: `react-hooks/preserve-manual-memoization` disabled (no React Compiler in project)

---

## [4.19.5] - 2026-05-09

### fix: stale counts + daily-challenge CSV pool + vite chunk (Agent Sonnet 4.6)

**Bug fixes:**

- `Onboarding.jsx`: card count `1.438` → `1.443` (2 occurrences — welcome copy + goal-days calculation).
- `index.html`: OG meta description `1.438 kartu flashcard` → `1.443`.
- `daily-challenge.js`: used `WAYGROUND_SETS` directly (same missing-CSV bug as SimulasiMode). Changed to `QUIZ_SETS` — daily question pool now includes all 300 CSV questions.

**Build:**

- `vite.config.js`: `manualChunks` updated — `data-jac` chunk now includes `jac-teori.js` + `jac-lifeline.js`; `data-wayground` chunk includes `quiz-sets.js`.

---

## [4.19.4] - 2026-05-09

### fix: SearchMode wrongCount bug + barrel/schema hygiene (Agent Sonnet 4.6)

**Bug fixes:**

- `SearchMode.jsx`: `wrongCount` was reading raw `quizWrong[id]` value — displays `[object Object]× salah` when the entry is a wrongEntry object. Fixed by wrapping with `getWrongCount()`. Added import.
- `utils/index.js`: stale `STORAGE_KEYS` re-export removed (STORAGE_KEYS was deleted in v3 migration A.7 TD-03); `removeFromStorage` was exported from wrong-tracker.js but missing from barrel — added.
- `utils/index.js`: `standardizeFuri` was exported from jp-helpers.js but missing from barrel — added.

**Code quality:**

- `storage/schema.js`: `quizWrong` comment corrected from `{ [cardId]: count }` to `{ [cardId]: wrongEntry }` (backward-compat: plain int also accepted); prefs DEFAULTS comment alignment fixed; `sprintBest/sprintBestTimeline` note added.
- `contexts/ProgressContext.jsx`: indentation bug in ctx object fixed (misaligned comment); `recordWrong` clarifying comment added (legacy in-doc counter; out-of-docs tracking via wrong-tracker.js + ssw-quiz-wrong is the primary path).

---

## [4.19.3] - 2026-05-09

### test + docs: data integrity tests + blueprint sync (Agent Sonnet 4.6)

**Tests added to `data.test.js` (+24 tests → 411 total):**

- `JAC_TEORI / JAC_LIFELINE split` (8 tests): count, track fields, set keys, topic field presence
- `WAYGROUND_SETS track fields` (4 tests): wt*=common, wg*=lifeline, wp\*=lifeline, all sets have track
- `CSV_SETS track fields` (3 tests): ct*=common, cp*=lifeline, all sets have track
- `QUIZ_SETS + getQuizSetsForTrack` (6 tests): total 38 sets, unique IDs, track present, per-track filter
- `SOURCE_GROUPS coverage` (3 tests): all keys in SOURCE_META, Sumber Tambahan group, text3l/vocab-supplementary/vocab-general

**docs/BLUEPRINT-CURRENT.md synced to v4.19.2:**

- Version: 4.19.0 → 4.19.2
- Quiz questions: ~860 → ~974
- Tests: 387 → 411

---

## [4.19.2] - 2026-05-09

### fix: track field bugs + SimulasiMode CSV gap (Agent Sonnet 4.6)

**Bug fixes — track field data:**

- `wayground-sets.js`: wt1–wt10 (Teori sets) were tagged `track:"lifeline"` — should be `track:"common"`. Fixed. Teori sets now visible to doboku/kenchiku track users in WaygroundMode.
- `csv-sets.js`: All 12 CSV sets (ct01–ct06, cp01–cp06) had no `track` field → invisible to `getQuizSetsForTrack()` and WaygroundMode. Added: ct* `track:'common'`, cp* `track:'lifeline'`.

**Bug fix — SimulasiMode exam pool:**

- `SimulasiMode.jsx` was importing `WAYGROUND_SETS` directly, missing all 300 CSV questions. Changed to `QUIZ_SETS` from `quiz-sets.js`. Exam pool now includes JAC (95q) + Wayground (579q) + CSV (300q) = ~974 questions total.

---

## [4.19.1] - 2026-05-09

### chore: C1 closure + hygiene pass (Agent Sonnet 4.6)

**C1 text4 audit — content complete:**

- Scanned text4.pdf (JAC Ch.4 — construction site greetings, layout terms, earthwork, foundation, concrete, building structure, electrical, lifeline, 5S, ほうれんそう)
- Result: 100% of Ch.4 terminology pre-exists in card DB — no new cards needed
- C1 fully closed: text3l +18 (v4.16.0) + pass2 +15 (v4.17.0) + text4 audit (0 new)

**categories.js fix (SumberMode coverage gap):**

- Moved supplementary SOURCE_META entries (`text3l`, `vocab-supplementary`, `vocab-general`) from mutation-style to inline in main object
- Added "Sumber Tambahan" group to SOURCE_GROUPS → SumberMode now shows all 3 supplementary sources (text3l: 25 cards, vocab-supplementary: 271 cards, vocab-general: 44 cards)
- Added SOURCE_ACCENT entries for `text3l`, `vocab-supplementary`, `vocab-general`

**Docs:**

- `BLUEPRINT-CURRENT.md` — status updated: NO OPEN ITEMS
- `_MAP.md` — log entry added
- `docs/archive/ARCHIVE-INDEX.md` — stale text4l reference removed

---

## [4.19.0] - 2026-05-08

### refactor: full data layer restructure — track fields + JAC split + quiz-sets merge (Agent Sonnet 4.6)

**Structure overhaul** — semua data file kini punya `track` field; JAC split by type; wayground+csv merged.

**JAC Official split:**

- `jac-teori.js` — 学科 tt1+tt2, 65qs, `track:'common'` (sama untuk semua 3 track)
- `jac-lifeline.js` — 実技 st1+st2 Lifeline, 30qs, `track:'lifeline'`
- `jac-doboku.js` / `jac-kenchiku.js` — empty stubs, siap diisi dari PDF
- `jac-official.js` → backward-compat shim (`[...JAC_TEORI, ...JAC_LIFELINE, ...]`)

**Question sets merged:**

- `quiz-sets.js` — single source of truth = WAYGROUND_SETS + CSV_SETS
- `getQuizSetsForTrack(track)` helper function
- wayground wt1–wt10 → `track:'common'`; wg*/wp* → `track:'lifeline'`
- CSV sets → `track:'lifeline'`

**Study aids — track field added:**

- `danger-pairs.js` — common: 12 pairs, lifeline: 8 pairs (per-pair track field)
- `angka-kunci.js` — common: 22 entries, lifeline: 7 entries (per-entry track field)

**Components updated — filter by current track:**

- WaygroundMode: imports QUIZ_SETS, filters `track === 'common' || track === currentTrack`
- VocabMode: wg\* sets filtered by track
- DangerMode: PAIRS = DANGER_PAIRS filtered by track
- AngkaMode: ANGKA = ANGKA_KUNCI filtered by track

**index.js barrel** — exports JAC_TEORI, JAC_LIFELINE, JAC_DOBOKU, JAC_KENCHIKU, QUIZ_SETS, getQuizSetsForTrack

- 387/387 tests pass

---

---

## Legacy History (v3.7.0 → v4.18.0)

> Full entry-by-entry history is in git log. Summary below.

| Version | Date       | Summary                                                                                                           |
| ------- | ---------- | ----------------------------------------------------------------------------------------------------------------- |
| 4.18.0  | 2026-05-08 | refactor: 157 doboku+kenchiku cards → common; source files emptied for Ch.5+                                      |
| 4.17.0  | 2026-05-08 | C1-pass2: +15 common cards (1457–1471) from text1l/text2/text3                                                    |
| 4.16.0  | 2026-05-08 | C1: +18 lifeline cards (1439–1456) from text3.pdf (source text3l)                                                 |
| 4.15.1  | 2026-05-08 | JAC audit: 6 furi fixes jac-ch1 (KY/CCUS); admin docs                                                             |
| 4.15.0  | 2026-05-08 | JAC audit text2.pdf: 17 furi/desc fixes jac-ch2                                                                   |
| 4.14.0  | 2026-05-08 | J4: topic field all 95 JAC qs (8 topics); J2: JACMode topic filter                                                |
| 4.13.0  | 2026-05-08 | G3: GlossaryMode mini-deck export → Anki TSV                                                                      |
| 4.12.0  | 2026-05-08 | Q3 difficulty detail; F2/F3 FocusMode; D1 explanation field; G4/W5/AK2/E3/K6                                      |
| 4.11.0  | 2026-05-08 | StatsMode BUG fix; D2/D3 DangerMode; AK1/AK3 AngkaMode; G2 compact; K5 add-SRS                                    |
| 4.10.0  | 2026-05-08 | J1 JACMode→SRS; K2 read-only toggle; SB3 SumberMode actions; Q5 category filter                                   |
| 4.9.0   | 2026-05-08 | R3/R4/R5 ReviewMode; W1/W4 WaygroundMode; Q4 quiz count; SR4 badges; ST4 week                                     |
| 4.8.2   | 2026-05-08 | SR3 search copy-to-clipboard; SIM5 pace hint                                                                      |
| 4.8.1   | 2026-05-08 | D1-WT: DengarMode wrong-tracker writes to shared quizWrong pool                                                   |
| 4.8.0   | 2026-05-08 | SR1 search history; G1 glossary audio; SB1/SB2 sumber progress; W3/R2/J3                                          |
| 4.7.0   | 2026-05-08 | W2: WaygroundMode per-set Ulang Salah mode                                                                        |
| 4.6.0   | 2026-05-08 | E2 Gist sync; F4 Sprint ghost score; ST3 quiz accuracy per category                                               |
| 4.5.0   | 2026-05-08 | B1: QuizProduksiMode (JP→ID type-answer, fuzzy match)                                                             |
| 4.4.0   | 2026-05-08 | Phase 5.5: DengarMode, CatatanMode, breadcrumb nav, sessions cap→180                                              |
| 4.3.1   | 2026-05-08 | Phase 5.3–5.4: B2 Sprint, SIM3/SIM4, F1 achievements, F2 daily challenge, ST1 heatmap, A2 recommend, E4 lz-string |
| 4.3.0   | 2026-05-07 | Phase 5.1: SIM1 pause, BUG-06 JAC+Wayground pool, ST2 Exam Readiness                                              |
| 4.2.0   | 2026-05-07 | BottomNav/Toast test fix; ProductionMode; ConfusionMode                                                           |
| 4.1.0   | 2026-05-07 | FE-01–09: CSS modules, a11y, error boundaries, offline banner, haptics, PWA                                       |
| 4.0.2   | 2026-05-04 | post-Codex: furigana, ReviewMode session, ruby rendering, stale branch cleanup                                    |
| 4.0.0   | 2026-05-02 | Phase F+G: exam countdown, audio, QA release                                                                      |
| 3.9.0   | 2026-05-02 | Phase D+E: export hardening, FlashcardMode decomposition                                                          |
| 3.8.0   | 2026-05-02 | Phase B+C: sipil/bangunan content, daily mission, session analytics                                               |
| 3.7.0   | 2026-05-02 | Phase A: bug fixes, storage v3 migration, debt cleanup                                                            |
