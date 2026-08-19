# HANDOFF.md — SSW Konstruksi · content-dq

> ## 🟢 MERGED INTO MAIN — 2026-08-18 (commit `151a45e`)
>
> **content-dq's mission is complete.** This document records its 3.5-month content-quality
> sprint (sessions 1–29) and the branch merge that closed it out. Both are done — verified via
> `npm test` (435/435), `npm run lint` (0 warnings), `npm run build` (clean), plus content-dq's
> own `verify-content.mjs`/`audit-track-consistency.mjs` (both clean). Full merge writeup:
> `CHANGELOG.md` [4.23.0], `_MAP.md` session log.
>
> **If you're a new agent starting fresh work (e.g. a frontend overhaul):** the GETTING STARTED
> and PROTOCOL sections immediately below describe the _content-dq_ workflow specifically —
> clone content-dq, never touch main, etc. That workflow is retired. You're almost certainly
> starting on `main` instead, which now has everything (content-dq's data + the original app).
> Read this file for background/history, but don't follow GETTING STARTED/PROTOCOL's literal
> instructions — check CURRENT STATE's top entry (the UI-overhaul one, 2026-08-19) for
> what's actually true today, and treat everything below it as history, not a live task queue. The `content-dq`
> branch itself still exists on the remote (nothing deleted it) but has no further role — every
> commit on it is already reachable from `main` via the merge.
>
> **What's NOT decided yet:** whether this file continues as the relay doc for whatever comes
> next, gets retired to `docs/archive/`, or gets replaced by something new — that's the owner's
> call, to be made in whatever chat picks up the next phase of work.

---

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

> ⚠️ **Historical — describes the now-completed content-dq workflow.** See the banner at the
> top of this file. If you're starting new work today, you almost certainly want `main`, not
> `content-dq`.

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

> ⚠️ **Historical — this was content-dq's protocol.** Retired along with the branch's mission
> (see banner at top). Kept here as a record of the workflow that made 29 sessions of
> multi-agent relay work without shared memory actually hold together — genuinely worth reading
> before designing whatever process the next phase of work uses, just don't follow step 4 below
> literally.

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
4. Commit, push to `content-dq`. (Historical instruction — content-dq is merged; there's no
   more content-dq-specific work to push there. New work goes on `main`.)
5. Overwrite this file in place with the new state. Don't create `HANDOFF_v2.md`.

---

## CURRENT STATE

**As of this edit, 2026-08-19 (frontend/UI overhaul session, new agent chat, following the
2026-08-18 merge close-out below — owner provided repo+token directly, same protocol).**
Verify before trusting past this point — this line doesn't update itself.

- **🟡 UI OVERHAUL IN PROGRESS — branch `feat/ui-overhaul`, 7 commits, NOT merged to `main`.**
  `main` is untouched and still at the post-merge state described further down. The branch is
  pushed to origin. Every commit was verified green before pushing: `npm test` 435/435,
  `npm run lint` 0 warnings, `npm run build` clean.

  **Direction (owner-approved before any code was written):** keep and evolve this app's own
  amber identity rather than aligning with the main Nugget Nihongo app; go fully adaptive
  across device sizes, not just "stop wasting space on desktop". Palette is the one locked
  constraint — everything else was left to agent judgement. The signature device is a
  **hazard rail**: a diagonal amber/near-black stripe borrowed from real construction signage,
  used ONLY to mark time-sensitive or active state (exam countdown, daily mission, active nav
  item). It stays meaningful because nothing else uses it — don't decorate with it.

  **What shipped, in dependency order:**
  1. `AppShell` — single owner of responsive layout for every screen. Bottom nav <1040px, side
     nav above. `chrome` prop ('tabs' | 'mode') decides which navigation is offered.
  2. All 21 mode screens routed through it. **This was the biggest gap:** `App.jsx` returned
     early for modes, so they bypassed the shell entirely and stayed a 480px column on desktop
     long after the tabs had gone responsive.
  3. Width is now a **responsive token**, not a per-file decision. 19 stylesheets set their own
     `max-width`; rather than patch each, `--max-w` is redefined at breakpoints in `global.css`
     and every screen inherits it. `--overlay-max-w` (fixed 480px) split out for dialogs,
     toasts, popups, bottom nav. Per-mode width lives in `MODE_META.width`, defaulting to a
     reading column.
  4. Icons unified. `MODE_META.ui` names the vector icon per mode — no component keeps its own
     mode→icon list. 20 generated icons in `public/icons/ui/`, 14 badges in
     `public/icons/badges/`, onboarding art in `public/illustrations/`.
  5. Dashboard, onboarding, and the flashcard screen redesigned.
  6. a11y sweep: added an `h1` (there was none), one global `:focus-visible` ring (there was
     one rule in the entire app), `--tap-min` 44px token, reduced-motion safety net.
  7. Prettier drift cleared repo-wide (was 237 files). **Kept as its own commit** so the UI
     work stays reviewable — mixed in it was a 249-file diff. Confirmed cosmetic: the built
     `data-cards` chunk has an identical content hash before and after.

  **Decisions worth not re-litigating:**
  - **Icons render as CSS masks, not `<img>`.** The art is single-colour line work on
    transparency, so its alpha IS the shape; masking with `background: currentColor` means the
    theme drives colour and dark mode still works. It also made the generator's palette drift
    (#FF9100 vs the specified #F59E0B) irrelevant. Switching to `<img>` would silently freeze
    them and break dark mode.
  - **The flashcard does NOT stretch to fill space.** Its height comes from a ResizeObserver in
    `FlipCard.jsx` measuring the back face, so the card holds one height across the flip.
    Forcing flex growth opens a gap _inside_ the card. This was tried and reverted; there is a
    comment in `flashcard.module.css` saying so.
  - **Prev/Next arrows stayed** on the flashcard screen. The original concept dropped them for
    swipe — a mobile-only assumption. Swipe doesn't exist with a mouse and desktop is now
    supported. The redundant "Lihat/Balik" button was removed instead.
  - **Badge→achievement mapping is explicit per achievement id**, not by array position, so
    reordering `achievements.js` can't silently shuffle the art.

  **Incidental fixes found along the way (not asked for):**
  - `sw.js` `CACHE_VERSION` was `4.21.1` against a `4.23.0` `package.json` — two releases stale
    despite the file's own instruction to bump per deploy. Returning users would have been
    served stale assets. Now `4.23.0`. **Bump this again before any deploy.**
  - `package-lock.json` version was out of sync with `package.json` (4.22.0 vs 4.23.0).
  - The app logo already existed at `public/icons/icon-*.png` but was used nowhere in the UI;
    onboarding showed a generic ⚡ emoji. Now uses the real logo. No new logo art is needed.
  - Content sat under the floating bottom nav on several screens because the safe padding was
    applied inline in `App.jsx` and each screen had to remember it. `AppShell` owns it now.
  - Flashcard "Reset" (erases all progress) sat in a uniform grid one tap from a star filter at
    identical visual weight. Now separated and styled as destructive.

  **NOT done — pick up here:**
  - **10 modes still render placeholder icon shapes.** A ready-to-paste prompt for the second
    sprite sheet is in `docs/ASSET-PROMPTS.md` section 4b. Activating them is one line each in
    the `ASSETS` map in `Icon.jsx`; the `MODE_META.ui` mapping already exists.
  - **`data-cards` chunk is 661KB (191KB gzipped)** and warns on every build. Undercuts the
    offline-first goal on slow connections. Deliberately left for its own branch — it's a build
    concern, not UI.
  - Belajar/Saya tab interiors were unpinned and now fill the shell, but their internal layouts
    were not redesigned for wide screens — they're single columns in a wide space. Glossary
    shows the pattern that works: `auto-fit` + `minmax()` on the row container, no media query.
  - **StatsMode at full width** has a small readiness ring floating in a very wide card, and a
    left-aligned heatmap in a wide box. Cosmetic, not broken — it needs a layout rethink rather
    than a width tweak, so it was left alone deliberately.
  - Desktop dashboard has vertical dead space; needs more content, not a layout change.
  - The branch has never been merged. Review the Prettier commit separately from the rest.

**As of this edit, 2026-08-18 (merge-execution session, new agent chat, directly following
session 29's handoff — owner provided repo+token directly, same protocol as prior sessions).**
Verify before trusting past this point — this line doesn't update itself.

- **🟢 MERGE COMPLETE — `content-dq` → `main`, 2026-08-18 (new chat, following directly from
  session 29's MERGE PREP entry below).** Pushed as commit `151a45e` on `main`. All 3 facts in
  the old MERGE PREP entry (kept below, struck through in spirit not in fact — still worth
  reading for the reasoning trail) held up under actual investigation, with corrections:
  no common ancestor confirmed (`git merge-base` exit 1); `main`'s independence confirmed, but
  refined — `content-dq`'s root commit (`c556f5f`) didn't just _lack_ the app scaffold, it
  _deleted_ main's entire app layer in one commit (248 files, -53,216/+381 lines) down to
  data+docs+viewer, so this was never two apps evolving in parallel; the "spot-checked, not
  diffed" claims about `main` still having `furi`/doboku/kenchiku/old-JAC-schema all confirmed
  true, and the real blast radius was bigger than flagged in every case (furi: 7 files named →
  33 actual; Doboku/Kenchiku: 3 files named → 33 actual).

  **Strategy:** not a git merge in the conflict-resolution sense. `git merge
--allow-unrelated-histories` used as a mechanical bootstrap on a safety branch (never touched
  `main` directly until everything was green) — cleanly auto-unioned 326 non-overlapping files,
  conflicts only on the 14 that existed on both sides. Those 14 resolved (10 data files took
  content-dq's version wholesale, 3 docs hand-merged combining both histories, 1 pair
  byte-identical/no-op). Then application-layer surgery: furi→`extractReadings()` swap across
  12 real consumers (caught a real answer-matching bug in `ProductionMode.jsx` along the way —
  see CHANGELOG [4.23.0]), full Doboku/Kenchiku removal across 33 files including onboarding UX
  (cut the track-picker step entirely rather than leave a 1-option choice), JAC schema
  migration, storage v5→v6 migration (deliberately incomplete — praktik/vocab set-id remapping
  skipped, no reliable old→new correspondence exists there, see migrations.js comments), and 4
  build-pipeline script fixes found only by actually running `npm run build` (not caught by
  tests/lint — regenerating `cards.js` also fixed 10 pre-existing duplicate-fragment bugs that
  existed in the committed aggregate but not the source files, since content-dq had no
  regeneration script of its own).

  **Final state, independently re-verified before push, not just trusted from earlier in the
  session:** `npm test` 435/435 (39 files), `npm run lint` 0 warnings, `npm run build` clean,
  `verify-content.mjs`/`audit-track-consistency.mjs` both clean, `git fetch` + `rev-parse`
  confirmed `origin/main` matches the intended commit hash exactly post-push.

  **`content-dq` branch:** still exists on the remote, not deleted. Every commit on it is
  reachable from `main` via the merge, so nothing is lost either way — deleting it is a safe,
  purely-cosmetic cleanup step whenever the owner wants to, not a data-preservation concern.

  **Not done, deliberately out of scope for this session:** the `npm run format` check surfaced
  161 files with formatting drift (`prettier --check`) — but this predates the merge entirely,
  including files `content-dq` never touched, so it's pre-existing app-wide debt, not a merge
  artifact. Worth knowing about for whoever does the frontend overhaul, not fixed here.

- **🔀 MERGE PREP (historical — see MERGE COMPLETE entry above; this entry is what the merge
  started from, kept for the reasoning trail).** Owner's plan at the time: session 29 (that one)
  closes out here; a **new chat** does the actual `main` merge. Three
  facts discovered during a brief, deliberately-not-deepened look at `main` — confirm these still
  hold before relying on them, they were checked once, not re-verified:
  1. **`content-dq` and `main` have NO common git ancestor.** `git merge-base main content-dq`
     returns nothing (exit code 1). This is not a normal feature branch — a plain `git merge` will
     not work sensibly (git has no shared history to 3-way-diff against). Whatever "merge" means
     here, it's a manual reconciliation/integration of files, not a git merge command. Don't
     attempt `git merge` expecting normal conflict markers on a shared history.
  2. **`main` has its own full 450-commit history, completely independent of `content-dq`**, with
     its own real app scaffold (`package.json` v4.22.0, `src/App.jsx`, `vite`/`vitest`/`eslint`,
     everything `content-dq` lacks) and its own separate handoff-doc lineage
     (`DATA_QUALITY_HANDOFF_v8/v11/v12.md` — different naming/versioning than this branch's
     unified `HANDOFF.md`, don't confuse the two). **`main`'s last commit is 2026-05-09** — the
     same day `content-dq` was created (`c556f5f`, "Init content-dq branch"). Reasonable reading:
     `main` was frozen right when `content-dq` branched off to do focused data-only work, and has
     sat untouched since — not two branches independently evolving in parallel this whole time.
     Worth confirming this reading is right before assuming it, but it's the more likely one given
     the exact date match.
  3. **Spot-checked, not exhaustively diffed:** `main` still has `furi` on every card (never went
     through this branch's P12), still has `jac-doboku.js`/`jac-kenchiku.js`/
     `cards-doboku.js`/`cards-kenchiku.js` (the tracks `content-dq` deliberately dropped session 24
     — scope reduced to Lifeline-only), and presumably still has the old jac-teori/jac-lifeline
     schema (not independently confirmed on `main`'s side, only confirmed as an issue on
     `content-dq`'s side in the `sets/jac/` note in ACTIVE TASKS below). **None of this was diffed
     file-by-file or investigated further — that's the new session's actual job**, not pre-solved
     here. This entry exists so that work doesn't start from zero, not so it can skip its own
     verification pass.
  - Everything else "merge-time" that accumulated across this whole project's life is still in
    ACTIVE TASKS' 📋 list below (the `furi`-consumer checklist, now actually relevant since P12 is
    done not hypothetical; the `sets/jac/` schema-swap note) — that list plus this entry together
    are the fullest picture that exists of what the merge involves. Nothing more was done toward
    executing it this session; owner was explicit that execution happens in a new chat.
- **Session 29 closed out here — 29 commits total, all pushed, both verify scripts green on every
  single one.** In order: the whole session-28 🟡 bucket (8 commits), a hygiene pass (1 commit),
  an exhaustive content-quality audit + P12 (5 commits), quiz-duplicate resolution (2 commits),
  scope-mismatch — first partial then, on owner instruction, fully exhaustive (6 commits), a
  general-knowledge fact-check pass (0 content commits, clean result), plus DOCS commits closing
  out each phase (7 commits). Full detail for every phase is in the entries above and below this
  one — not re-summarizing it here, just marking that this is where session 29 ends.

- **General-knowledge-provenance fact-check pass (second half of the "Fix all remaining gaps"
  instruction — "yang ~107 cards", corrected to the accurate count of 135 once actually compiled;
  the earlier "~107" was an undercount, forgot to include one of the scope-mismatch batches when
  estimating on the fly).** Compiled the exact list from git history (every commit that added
  general-domain-knowledge content rather than same-card-evidence-based completions or JAC-PDF-
  verified text): the 13 desc cards + 5-card scope-mismatch cluster from earlier this session +
  83 vocab-supplementary truncation completions + all 33 scope-mismatch fixes = 135 distinct
  card ids. Read every one's current `jp`+`desc` for internal consistency (found none broken —
  the scope-mismatch/truncation/corruption sweeps this session already caught anything wrong with
  these specific cards along the way). Then spot-verified the 6 most specific, highest-stakes
  numeric/regulatory claims across the set via live web search rather than trusting domain
  knowledge on faith:
  - id=94 (消火器 walking-distance): 20m / 30m-for-large-extinguishers — confirmed exact, multiple
    independent sources citing 消防法.
  - id=152 (賠償予定の禁止 statute citation): 労働基準法第16条 — confirmed exact article number.
  - id=160 (health checkup frequency + employer-funded): confirmed exact against 労働安全衛生規則
    第44条 (annual) + 第43条 (hiring-time), employer-funded per 厚生労働省 guidance.
  - id=966 (発信機 mounting height + walking distance): 0.8–1.5m / 50m / red color — confirmed
    exact against 消防法施行規則第24条, multiple sources. This was one of the ORIGINAL 13 cards
    flagged as worth spot-checking as far back as this project's early sessions — now actually
    checked, holds up.
  - id=973 (ロックウール heat resistance ±600°C): confirmed within the commonly-cited 600–700°C
    range multiple sources give: reasonable as stated, presented as an approximation already.
  - id=1246 (hearing protection threshold >85dB): confirmed exact against 騒音障害防止のための
    ガイドライン (厚生労働省).
  - **Result: 6 for 6 confirmed accurate, 0 errors found.** Given this consistent result across
    the most independently-checkable claims in the set, plus a clean full read of all 135 for
    internal consistency, treating this as a genuinely completed, positive-result fact-check
    pass rather than "spot-checked a few and hoped for the best." Didn't search the remaining
    ~129 cards' less-specific descriptive content individually — that would mean searching
    generic definitional statements with no verifiable claim to check against, which isn't a
    productive use of search budget once the pattern of accuracy is this consistent.
  - No content changes resulted from this pass (nothing was found wrong) — this is a verification
    record, not a fix commit. Provenance flag on these 135 cards stays in place regardless (still
    not JAC-PDF-verified, just now independently spot-confirmed as accurate where checkable).

- **Scope-mismatch sweep, exhaustively complete (owner directive: "Fix all remaining gaps").**
  6 more commits, all pushed (`fa21a12`, `8b80ee5`, `5de7393`, `87d664e` for this part). Went back
  to the ~130+ candidates the previous part explicitly recommended NOT sweeping mechanically, this
  time reading every single one's raw `jp`+`desc` by hand rather than trusting any heuristic —
  181 distinct card ids personally reviewed across 3 batches, cross-checked at the end against a
  zero-exclusion regeneration of the full candidate list: **0 genuinely unreviewed candidates
  remain.** This is a real exhaustive-complete claim, not "stopped at a reasonable point."
  - Total genuine fixes: 83 cards (33 from the previous part's two rounds + 50 more this part: 9 +
    23 + 17 + 1 closing-pass fix). Batch 2 (the larger 5-7-term "index/summary" cards) had a
    notably HIGHER true-positive rate than clean 2-term cards — the "these are probably
    intentionally brief" hypothesis from earlier this session didn't hold up once actually read;
    more bundled terms just means more chances for at least one to be genuinely under-addressed.
  - Also found and fixed, incidentally, while reading for scope-mismatch: 2 cases where a
    round-1-identified genuine gap was never actually applied (ids 194, 202 — caught the miss);
    an unusually dense cluster of duplicated-sentence-fragment corruptions (ids 551, 553, 1294,
    1303, 1348, 1351, 1352, 1353, 1361, 1380, 1381, 1389 — 12 instances, a sentence's tail
    verbatim-repeated, likely an artifact from however this content was originally generated);
    several more instances of the redundant-ruby-plus-inserted-character pattern already found
    repeatedly this session (ids 170, 231, 245, 572, 573, plus 1389's second issue on top of its
    duplicate fragment); id=1335 had NO real definitions at all, just a bare comma-separated term
    list — wrote actual definitions for all 6 terms.
  - Process note for future reference: hit real difficulty on id=1294 specifically — the source
    file stores that card's `desc` with a literal backslash-n escape sequence (two characters)
    where the runtime value (after Node imports the module) has an actual newline byte. A
    string extracted via the loaded `CARDS` array and compared against raw file text will silently
    fail to match across that boundary. Match against the literal escape sequence when a fix spans
    a multi-line desc field in this codebase.
  - verify-content.mjs + audit-track-consistency.mjs clean throughout (1438 unchanged, 0/1438
    track disagreements every single commit).

- **Scope-mismatch round 2 (same-day continuation, unprompted — "Continue" with no other
  instruction, read as "keep going with judgment" given the standing "trust your judgement"
  authorization from earlier this session). 1 commit, pushed, commit `71c08dc`:**
  - Fixed a real bug in the detector itself: it stripped ruby from `jp` before comparing terms,
    but never stripped ruby from `desc` — so already-fixed cards (id=517/530/585 from earlier
    this session) got false-flagged again, since their definitions restate each term WITH ruby
    embedded mid-word and that doesn't literally contain the plain-text term.
  - Reran with the fix: 153 candidates, most showing garbled term fragments from the splitter
    itself ("探針棒埋設物確認", "S整理") — the extraction had become the dominant noise source,
    not real content gaps. Went back to reading raw `jp`+`desc` pairs by hand for the ~50
    cleanest-looking (2-term) candidates rather than attempt a 5th regex refinement.
  - **True-positive rate on this batch: 6 genuine of ~50 read (~12%)** — most were synonym pairs
    (テスター/万用計, トランシット/セオドライト — same instrument, two names) or already
    adequately covered in flowing prose without literally repeating each term. Fixed the 6
    genuine ones (ids 101, 222, 457, 467, 1213, 1369) plus 3 more corruption instances of this
    session's recurring redundant-ruby pattern found along the way (ids 222 ×2, 243, 252), plus
    id=1213 turned out to have a genuine desc truncation (different bug class, missed by the
    earlier truncation sweep since it doesn't end on a tracked dangle-word).
  - **Recommendation, not just a status note: stop mechanically sweeping this category.** ~100
    candidates remain unread from this round's list, on top of the ~40 already known-remaining
    from round 1. Given the demonstrated low true-positive rate even on the cleanest subset, and
    that every detector refinement this session has surfaced a NEW false-positive mechanism
    rather than converging (4 rounds: term-count via ruby-internal separators, "=" counting,
    substring-without-stripping-desc-ruby, and now the splitter itself producing garbage on
    complex jp structures), continuing this as a mechanical sweep has poor odds of finding much
    more signal for the effort. If this matters enough to finish properly later, it needs full
    manual reading or a genuinely different verification approach — not another heuristic pass.
  - verify-content.mjs + audit-track-consistency.mjs clean after (1438 unchanged).
- **Quiz duplicates + scope-mismatch follow-through (owner-requested same day, "fix quiz
  duplicates & work through scope-mismatch"). 3 more commits, all pushed:**
  - **Quiz duplicates, fully resolved.** 9 in-scope exact-duplicate pairs total (`sim >= 0.85`,
    excluding `sets/jac/` and the documented jml/jmt/wt06 compilation pattern). 3 were this
    session's own earlier `wglv-jp-02` headword reconstructions (ids 16/17/21) unknowingly
    duplicating pre-existing sibling content — replaced with fresh terms cross-checked against
    all 120 questions in `wglv-jp-01/02/03` first: id=16 → インジケーター (EF-fusion indicator),
    id=17 → クランプ (clamp), id=21 → 架空ケーブル (aerial cable). The other 6: `wgl07#19`
    (insulation tolerance, dup of `wgl02#17`) → a torque-wrench QA question, grounded in a live
    web search of JIS B8607 rather than guessing a number; `wt08#8`+`wt08#12` (forklift + risk-
    assessment, dup of `wt02`) → crane sling (玉掛け) and arc-welding qualification requirements;
    `wglv-jp-03#5`+`#13` (電柱, 電熱線, dup of `wglv-jp-01`/`02`) → 碍子 (insulator) and 漏電遮断器
    (earth leakage breaker). One pair (`wglv-id-03#8`/`#29`) turned out NOT to be a real
    duplicate — "Pemotongan pipa" (cutting, the process) vs "Pemotong pipa" (cutter, the tool)
    are genuinely different vocab testing different JP terms, just worded confusingly similarly
    in Indonesian — added "(proses)"/"(alat)" disambiguators instead of replacing either.
    Bonus, found while reading `wt02` for replacement material: `wt02#3` had a genuine data
    corruption, literal lost-data bytes (two U+FFFD replacement characters, confirmed at the byte
    level) where マンホール's ホ should be — fixed against `wt02#2`'s correctly-spelled sibling.
    Commits `b9fe3e7`, `92d783f`.
  - **Scope-mismatch: 27 of ~68 candidates fixed.** Rebuilt the detector with the counting bug
    from the earlier pass fixed (separators inside ruby brackets were inflating term counts).
    Read all 68 by hand — even the refined "does each term's text literally appear in desc"
    check still had real false positives on inspection (e.g. id=1328's bridge-types card is
    fully covered via a "6 jenis jembatan: ..." list that doesn't use "=" per item; id=574
    genuinely covers 4 of 6 terms in plain prose my substring check mis-flagged as missing).
    Fixed ids: 166, 186, 188, 191, 192, 193, 195, 196, 201, 203, 225, 229, 230, 239, 378, 381,
    412, 425, 466, 516, 528, 557, 565, 598, 602, 1385, 1387 — each confirmed by reading `jp`
    against `desc` directly before writing a completion. Bonus, found while reading these: 4
    more instances of the "redundant/inserted-character ruby corruption" pattern from earlier
    this session (ids 192, 201, 203, 230 — e.g. id=230's `転《ころ》び用《てんよう》` was
    genuinely wrong, not just a ruby-split issue: 転び means "leaning," a different word
    entirely from 転用/reuse, which is what `jp` and the card's own `usage` field both confirm
    it should say), and one genuine content error rather than incompleteness — id=1387's ④ item
    said "塗装仕上げ" (paint finish) but `jp` lists 床 (floor) as the 4th term and the card's own
    `usage` field says フローリング (flooring), not paint. Left the remaining ~40 candidates
    (mostly larger 5-7-term "index/summary" cards) deliberately untouched — partial coverage on
    those is hard to distinguish confidently from intentional summary brevity without a slower,
    different methodology (checking whether each "missing" term has its own detailed card
    elsewhere in the corpus) than a straight sweep. Commit `decaab2`.
  - verify-content.mjs + audit-track-consistency.mjs clean throughout (1438 unchanged, 0/1438
    track disagreements).
- **Exhaustive content-quality audit + P12 (owner-requested, session 29, same day as the 🟡-bucket
  work below). 5 more commits, all pushed:**
  - Built corpus-wide audit tooling (kept in `/home/claude/audit` on whatever agent ran this —
    scratch, not committed, per established convention) covering ruby integrity, structural
    validity, dangling-text, scope-mismatch, and near-duplicate detection across **all** 1,438
    cards + 1,075 quiz questions, including `sets/jac/` (never swept before). Every heuristic in
    this pass went through 2-4 rounds of refinement after early versions threw heavy false-positive
    rates — noting the specific failure modes below since they'll recur if re-attempted naively:
    kanji-only ruby regexes don't see hiragana/katakana/digits legitimately mixed into a compound
    before `《》`, and simple term-counting doesn't know a ruby's own internal `/` separator isn't
    a second term. Commit `81ba664`.
  - **The big one: 83 truncated `desc` fields in `vocab-supplementary`** (495 cards, the largest
    single source category) — never covered by P5, since P5 only ever compared cards against real
    JAC PDF text and vocab-supplementary has no PDF source. Same provenance basis as the 13 desc
    cards: owner-authorized general domain knowledge, not JAC text. Every completion grounded in
    the same card's own `usage` field or `jp` meaning where one existed. Commit `a90702d`.
  - 4 stray-space ruby typos, 2 ruby-content corruptions, id=807's reading fix, id=898 + 14 more
    dangling `id_text` instances the original 9-card scan missed (found by re-scanning the _whole_
    corpus instead of trusting a pre-made list), 2 desc corruptions (truncation on 1221, a
    duplicated sentence fragment on 1355), 2 more scope-mismatch cards (1399, 245). Commits
    `81ba664`, `5382133`.
  - **P12 done: `furi` dropped from all 1438 cards**, all 3 layers (19 files). Pre-flight matched
    furi-count to id-count per file before touching anything — would have skipped and flagged any
    file where they disagreed, none did. Gated on P1 being genuinely complete, not just marked
    complete — verified with a (heavily refined) naked-kanji sweep rather than trusting the old
    note; found and fixed one real gap first (id=162's header phrase had no ruby at all, only its
    3 sub-terms did — furi was quietly the only place that reading still existed). Commits
    `8da67c8`, `9c2d2e2`. **`main`'s 6 furi-consumers are now stale — see the merge-time
    reconciliation list below, unchanged from before, just now actually triggered.**
  - **Found, characterized, deliberately NOT fixed — needs a real content-authoring pass, not a
    mechanical one:** a handful of exact-duplicate quiz questions across different files (same
    question, different distractor sets) — e.g. `wgl02#17`/`wgl07#19` (insulation thickness
    tolerance), `wglv-jp-01#25`/`wglv-jp-03#5` (電柱), and one _within_ `wglv-jp-02` itself (#14/#16,
    both test "EF socket meaning" with overlapping distractors — #16 is this session's own earlier
    headword reconstruction, which surfaced the overlap rather than created it). Distinct from the
    documented jml/jmt/wt06 compilation pattern. Not fixed because a proper fix means authoring a
    genuinely different replacement question per instance, not completing/correcting existing
    content — a different kind of task than everything else in this pass.
  - **Also characterized, not fixed:** ~70 more scope-mismatch candidates beyond the 2 fixed above,
    from a heuristic with a demonstrated ~50% false-positive rate even after fixing the counting
    bug — would need per-card reading to resolve responsibly, not a sweep.

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
    Also documented in `docs/CARD_CONTENT_SPEC.md` §0C ("DQ Copies Orphaned (by design)") —
    correcting an overclaim in this section's first draft, which said the audit doc was the
    _only_ place this was tracked. Added to the merge-time reconciliation list below anyway,
    since ACTIVE TASKS is what a new agent actually reads first, not the two reference docs.
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
- **P16 done.** Same monolith-drift pattern as P17: `wayground-sets.js` held a _stale_ copy of
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
  - Deliberately NOT touched: any card whose _content_ mentions 土木/建築 as vocabulary (e.g.
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

**Status as of 2026-08-18: empty.** All four buckets below are resolved/complete — the merge-time
reconciliation list (done via the actual merge), 🔵/🟡 (already empty as of session 29), 🟢 (P12
and P22, both complete). There is currently nothing queued here. The next phase of work (a
planned frontend overhaul, per the owner) hasn't been scoped yet — whatever chat picks that up
starts a fresh task list rather than looking for one here.

Everything below is either gated or genuinely unstarted. Nothing here is a "just pick the first
one" list — check the gate before starting.

### ✅ Merge-time reconciliation list — DONE (completed 2026-08-18, see MERGE COMPLETE entry above)

_(Kept collapsed/historical below — this was an open checklist through session 29, now fully
executed as part of the content-dq→main merge. Real scope during execution turned out larger
than scoped here: furi had 33 real file references, not the 7 listed; Doboku/Kenchiku had 33,
not the 3 mentioned elsewhere. Full detail: `CHANGELOG.md` [4.23.0], `_MAP.md` session log.)_

<details>
<summary>Original list, as it stood through session 29 (click to expand)</summary>

**These used to be filed as blockers for P12. They aren't.** Owner has explicitly accepted that
content-dq may break `main` and that reconfiguring `main` is merge-time work. Keeping the list
because it's the reconciliation checklist someone will need at merge — it took a session to
compile and shouldn't have to be rediscovered. `main` reads `card.furi` in at least these places:

| Consumer on `main`                                             | What breaks if `furi` is dropped                                                                                                                                                                     |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/tests/data.test.js:34`                                    | Test literally named _"every card has furi field (Phase 1)"_, asserts `CARDS.filter(c => c.furi == null)` is empty. Dropping furi fails CI immediately.                                              |
| `src/modes/GlossaryMode.jsx:48,54`                             | Sorts the whole glossary by `furi` **and** groups entries by `furi[0]` for the A-Z jump nav. Without furi every card falls into a single `'?'` bucket — the mode's primary navigation stops working. |
| `src/modes/ProductionMode.jsx:34`                              | `if (card.furi && trimmed === card.furi) return true` — the kana reading is an **accepted correct answer**. Dropping furi silently starts marking correct answers wrong.                             |
| `src/modes/FlashcardMode/FlipCard.jsx:90,137`                  | Renders `furi` on the card back and passes it to `JpDisplay`.                                                                                                                                        |
| `src/modes/SearchMode.jsx:38,70,177`                           | Search haystack, result label, and the reading line under each hit.                                                                                                                                  |
| `src/modes/QuizMode.jsx:68`                                    | `q.card.furi` feeds the quiz prompt's reading.                                                                                                                                                       |
| `src/modes/ConfusionMode.jsx`, `src/components/Onboarding.jsx` | Also reference furi (not audited line-by-line — the six above are already disqualifying).                                                                                                            |

At merge time each of those six needs `card.furi` swapped for `extractReading(c.jp)` off the
`《》` ruby (that's what P1 exists to guarantee), and `data.test.js`'s "every card has furi field
(Phase 1)" test needs deleting or rewriting — the test encodes the _old_ invariant on purpose, so
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

</details>

### 🔵 Gated on an owner decision — ask before starting

_(none right now — OD-5 resolved by investigation, see OPEN DECISIONS.)_

### 🟡 Needs human/AGENT-12 judgment — not gated on owner, but not mechanical either

_(empty — the whole session-28 bucket was resolved session 29. Full accounting in CURRENT STATE,
commits `c641e8c` through `b026998`. Nothing currently sits in this bucket; the next 🟡-shaped
item found during future work starts a fresh list here rather than reopening this one.)_

### 🟢 Unblocked — owner decision 2026-08-17 (session 28), ready to start

**Owner clarified the whole branch's contract:** _"branch content-dq emang cuma buat maintain and
fix all the quality of the content. I intended to do so even if it breaks main branch, because
emang nanti pas merge ke main harus reconfig & readjust semuanya."_ That settles the question the
P12 writeup below was stuck on. **Breaking `main` is expected and accepted here; reconciliation is
merge-time work by design.** Don't re-litigate this — a future agent finding `card.furi` consumers
on `main` should treat that as a merge-time TODO to record, not as a reason to stop.

| Task    | What                                                                     | Status                                                                                                                                                                                                                        |
| ------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P12     | Drop `furi` from all split files                                         | ✅ **Complete (session 29).** All 1438 cards, all 3 layers. See CURRENT STATE for the pre-check that verified P1 first (found and fixed one real gap, id=162).                                                                |
| **P22** | Quiz set equalization + question/option quality uplift, all non-JAC sets | ✅ **Complete (session 28).** Owner-requested 2026-08-17, not a pre-existing item. Full writeup below — 1 residual flag spun to the 🟡 bucket at the time (wglv-jp-02 headword loss), resolved session 29, see CURRENT STATE. |

**Board is otherwise clear of pre-identified tasks.** Both things the session-29 audit found are
now fully resolved, same day, on explicit owner instruction to finish rather than stop:

- **Quiz duplicates: fully resolved.** All 9 in-scope exact-duplicate pairs (excluding `sets/jac/`,
  which stays untouched) replaced with fresh, verified content. Full list + reasoning in CURRENT
  STATE. One near-miss (wglv-id-03#8/#29) turned out not to be a real duplicate — clarified
  instead of replaced.
- **Scope-mismatch: exhaustively complete, 83 total genuine fixes.** After stopping partway with a
  recommendation against continuing mechanically, the owner asked to finish anyway — went back and
  hand-read all 181 distinct candidates the detector could ever surface (not just the noisy
  subset), confirmed via a zero-exclusion regeneration that 0 remain unreviewed. Full breakdown +
  the corruption patterns found along the way in CURRENT STATE. Nothing left to pick up here.
- **General-knowledge-provenance fact-check: complete, 6/6 spot-verifications accurate.** All 135
  cards flagged as general-domain-knowledge (not JAC-PDF-verified) across this and earlier
  sessions read for internal consistency (clean) and the 6 most specific/checkable claims
  verified against live sources (all confirmed exact). Full list in CURRENT STATE. No fixes
  needed — this was a verification pass with a positive result, not a repair job.

#### P22 — Quiz quality (NEW, owner-requested session 28) — ✅ COMPLETE

Owner: _"before merging with main, aku pengen semua quiz (selain yang resmi dari JAC) itu semuanya
jumlah soal merata, kualitas soal & opsi jawabannya juga ditingkatkan."_ This was **not** on the
task list in any form — P8a/P8b/P10/P11 each touched quiz sets, but all four were narrow
defect-fixes on `wglv` only (ruby, empty `opts_id`, circular `exp`). Scope was all non-JAC sets —
`wayground/**` + `jac-mockup/**`. `sets/jac/` (jac-teori 65q, jac-lifeline 30q) was **out of
scope** throughout and was never touched.

**Final state: every one of the 5 original findings is resolved.**

| Finding (original census)                              | Resolution                                                                                                                                                                                                                                                                        |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ans:0` on 432/957 = 45%, concentrated in `wgl`/`wglv` | ✅ Fixed. All non-JAC questions now 4-option and rebalanced; see below.                                                                                                                                                                                                           |
| 657 questions at 3 options, 300 at 4                   | ✅ Fixed. **0 questions left at 3 options** (was 419 after wglv's 236 were done first).                                                                                                                                                                                           |
| Question counts uneven across sets in a family         | ✅ Fixed. +23 authored (nothing deleted): `wt01` 19→20, `wglv-id-01/02/03`+`wglv-jp-03` 39→40 each, `wtv01` 22→20 + new `wtv02` (20, 2 moved + 18 authored). `jml`=20 vs `jmt`=30 confirmed correct-as-is by owner (mirrors Prometric exam structure) — **do not equalize this**. |
| 288 duplicate-question groups (556q)                   | ✅ Investigated, **not a defect** — see below.                                                                                                                                                                                                                                    |
| 157 `exp` fields under 40 chars                        | ✅ Investigated, **mostly not a defect** — see below, but turned up a real separate bug.                                                                                                                                                                                          |

**Option-count + rebalance work, in the order it happened:**

1. `wglv-*` (236q): 4th option _sampled_ from the same-direction answer pool (each a real term
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

**Final corpus-wide check (980 questions, all of `wayground/**`+`jac-mockup/**`):** 0 at 3
options (was 419), 0 duplicate options within any single question, 0 `opts`/`opts_id` length
mismatches, 0 out-of-range `ans` indices, monolith↔split cross-check 0 mismatches. Answer-position
distribution 240/255/252/233 (~24–26% each) — not perfectly flat only because `jac-mockup`'s own
already-healthy ~23% natural distribution (300q, untouched by design) pulls the aggregate slightly;
every family P22 actually touched is individually at exact or near-exact even split.

**Duplicate-question investigation — resolved as NOT a defect, nothing changed.** Traced which
sets share which questions. `jml01–04` turned out to be near-1:1 compiled subsets of `wgl06–09`
(18–20/20 questions each, already 4-opt before this session touched `wgl`), `jml05` mixes from
`wgl02–04`, and every `jmt0N` draws 20–30 questions spread across _multiple_ `wt0N` sets. `wt06`
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

1. _Rank by similarity to the question stem_ → surface matches with no meaning. A question
   containing 最大 got the option `最大値`.
2. _Rank by shape match to the question's own options_ (length + ending), plus quantity-class,
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

| #   | Chapter     | JAC content covers                                                                                                               | Status                 | Filename     |
| --- | ----------- | -------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ------------ |
| 1   | teori ch1   | 日本の現場で大切にしていること (teamwork, 施工体制, CCUS, あいさつ, 朝礼)                                                        | ✅ received session 25 | `text1l.pdf` |
| 2   | teori ch2   | 働く上で守らなければならない法令 (labor law + 15 other laws)                                                                     | ✅ received session 25 | `text2.pdf`  |
| 3   | teori ch3   | 建設工事の種類と業務 (construction work types/trades — largest teori chapter, 183 cards)                                         | ✅ received session 25 | `text3.pdf`  |
| 4   | teori ch4   | 現場で使われるあいさつ・用語・共同生活上の注意 (site terminology, shared-living notes)                                           | ✅ received session 26 | `text4.pdf`  |
| 5   | praktik ch5 | Lifeline jitsugi (216 cards — largest single chapter)                                                                            | ✅ received session 26 | `text5l.pdf` |
| 6   | praktik ch6 | Lifeline jitsugi (133 cards — highest truncation rate of any chapter, 51%)                                                       | ✅ received session 27 | `text6l.pdf` |
| 7   | praktik ch7 | 建設工事の安全 — death-accident stats, 7 accident-type defs, safety cycle, PPE, heatstroke, 12 ヒューマンエラー types (47 cards) | ✅ received session 28 | `text7l.pdf` |

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
not 1, including `vocab-supplementary.js` and at least one lifeline/\*.js file that doesn't match
the chapter number. Grep the whole `src/data/cards/` tree for each id before assuming its
split-file location, don't stop at wherever the majority happen to be. Same goes for the source/
mirror: both `cards-common.js` and `cards-lifeline.js` may need the same fix.

_(P21 and PDF Viewer Mode themselves no longer exist — dropped session 24 along with the
Doboku/Kenchiku tracks. See the scope-reduction entry in CURRENT STATE — unrelated to this
tracker, noted here only because this section used to carry that note.)_

---

## OPEN DECISIONS

| ID   | Blocks             | Question                                                                                       | Status                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ---- | ------------------ | ---------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| OD-1 | P6, P13            | Source labels: retain legacy vs merge into `vocab-supplementary`?                              | ✅ Answered 2026-07-11: merge                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| OD-2 | P16, P8b, P10, P11 | wglv split: do it now or at merge time?                                                        | ✅ Answered 2026-07-11: now                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| OD-3 | P17                | jac-mockup rename: now or at merge time?                                                       | ✅ Answered 2026-07-11: now — P17 done                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| OD-4 | P10                | wglv02/03 hint: update to an ID-language clue, or keep as-is?                                  | ✅ Resolved via execution 2026-07-15 — P10 done (both halves), see CURRENT STATE. "Update" was the reasoned answer, not a coin flip; what had stopped session 23 was the composition method, not this decision.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| OD-5 | P12                | Separate SSW Flashcards repo: does it consume `card.furi`? (affects whether it's safe to drop) | ✅ **Resolved 2026-08-17 (session 28) — by investigation, not by owner.** The question turned out to be aimed at the wrong codebase. Checked the two archived snapshot repos (`Nugget-Nihongo-SSW-Konstruksi-v87`, `SSW-KONSTRUKSI-v85`): neither reads `card.furi` — their only `.furi` reads are `item.furi` from the separate `DANGER_PAIRS` structure, plus one `c.furi` in SearchMode. But **`main` of this repo reads `card.furi` in at least 6 mode components** — that finding still stands. **What it means for P12 has since changed**, though: a _separate_ owner decision the same session ("branch content-dq emang cuma buat maintain and fix all the quality... I intended to do so even if it breaks main") made breaking `main` acceptable regardless of this finding, so the 6 consumers are now a merge-time reconciliation checklist, not a blocker. P12 itself is unblocked but still unstarted — see ACTIVE TASKS' 📋 list for the consumer checklist and the P12 row for status. _(Session 29 update: P12 is now done — see CURRENT STATE. Leaving the rest of this entry as originally written rather than rewriting the history.)_ |

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
