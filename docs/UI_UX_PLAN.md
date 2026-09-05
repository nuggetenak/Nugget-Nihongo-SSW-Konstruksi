# UI/UX Plan — quiz, exam & furigana consistency (2026-08-25)

> **Work queue, not a spec.** Items retire as they land; this file goes to `docs/archive/`
> when empty. The previous plan (items 1–42, the 2026-08 overhaul) completed 2026-08-25 and
> lives at `docs/archive/UI_UX_PLAN-2026-08-overhaul.md`.
>
> **Numbering starts at 43** deliberately — so "item 15" in a commit message unambiguously
> means the archived plan, and nothing here collides with git history.
>
> **Where the open work is (re-checked 2026-09-05).** §0–§10 are the original 2026-08-25 round
> (43–65 plus the §6 enhancements 56–60); everything there is closed except **58** and **59**.
> Later rounds append rather than renumber: **§11** 66–68 (all closed), **§12** 69–74 (all open;
> 69 and 73 need an owner decision), **§13** 75–81 (78 closed, rest open), **§14** 82–102 (82–92
> closed, 93–102 open). Sections 8, 9 and 10 below describe the *first* round only and are not
> re-scoped by later ones — read them that way.

## 0. How this plan was built, and what that means for trusting it

Every finding below was verified against the actual code, not inferred from docs or from the
previous plan. Where a claim rests on a measurement or a grep, the number is stated so a future
session can re-run it rather than take it on faith. Where something looked like a bug but turned
out fine on inspection, it's recorded as **checked, not a bug** rather than silently dropped —
that's as useful as the findings, and stops the same false lead being re-investigated.

The previous plan's own experience is the reason for that discipline: roughly half its items
turned out to describe the code slightly wrong (stale line numbers, a step that no longer
existed, a duplicate implementation nobody had counted). Assume this plan will drift the same
way. **Re-verify before implementing.**

**Priorities.** `P0` learner-blocking or data-losing · `P1` real friction, hit often ·
`P2` polish and consistency · `P3` new capability. All 23 items are owner-approved to build
(the five in §6 were approved 2026-08-25); priority is about *order*, not permission.
**Sizes.** `S` under an hour · `M` a session · `L` its own session, possibly more.

---

## 1. The through-line: shared components exist, adoption is partial

Three items in the last plan (14 `EmptyState`, 38 `ErrorBoundary`, 17 skeletons) were all the
same shape — a good shared component existed and half the app didn't use it. **That pattern is
not resolved, it just moved.** This audit found the same thing in three more places:

| Shared thing | Consumers | Not using it |
|---|---|---|
| `ResultScreen.jsx` | 1 (`QuizShell` only) | 8 modes hand-roll their own finish screen |
| `JpDisplay` / `JpFront` (ruby) | 2 (`FlipCard`, `SprintMode`) | every other JP surface |
| `QuizShell` (keyboard, timer, a11y, results) | 4 (`kuis`/`jac`/`vocab`/`wayground`) | 8 quiz-shaped modes |

This is the single highest-leverage theme in the plan. Items 43–47 and 52 all descend from it.

---

## 2. P0 — Furigana is inconsistent in a way that actively hurts learning

### ☑ 43. `furiganaPolicy` is honoured in 3 places out of ~18 — `M`

**Verified.** `grep -rn "furiganaPolicy" src/` returns real consumers in exactly:
`FlashcardMode` → `FlipCard` → `JpFront`, `SprintMode` → `JpFront`, and `QuizMode` (partially —
it checks `'hidden'` but treats `'tap'` identically to `'always'`, so tap-to-reveal silently
doesn't work there).

Every other Japanese-rendering surface ignores the setting completely: `ReviewMode`, `JACMode`,
`VocabMode`, `WaygroundMode`, `SimulasiMode`, `ConfusionMode`, `DangerMode`, `AngkaMode`,
`DengarMode`, `ProductionMode`, `QuizProduksiMode`, `GlossaryMode`, `SearchMode`, `CatatanMode`,
`SumberMode`.

**Why this is P0 and not polish.** The audience is N5–N4. The default policy is `'always'`, so a
learner sees 屋内消火栓設備 *with* readings on a flashcard, then meets the same card in SRS review
or a quiz with the kanji bare and no reading anywhere. That's not a cosmetic inconsistency —
it's the difference between a card being readable and not, for the exact user this app is for.
It also means the Settings toggle is quietly lying: setting furigana to `'hidden'` (to self-test
readings) changes almost nothing, because most screens were never showing it.

**How it fits.** `JpFront` already implements all three policies correctly. This is adoption,
same as item 14 was — not new logic. The work is threading `furiganaPolicy` through and swapping
raw `stripFuri(...)` renders for `JpFront`. Do **not** add a second ruby implementation.

**Judgement call to make, not assume:** quiz *answer options* are a genuine exception worth
thinking about — furigana on the options of a "read this kanji" question gives away the answer.
Recommend: honour the policy on question prompts and review screens; leave options stripped, and
write that distinction down in `COMPONENT_SPEC.md` so it reads as a decision rather than an
oversight. Check each mode's actual question shape before applying this blanket-wise.

**Done when.** Every JP surface either honours `furiganaPolicy` or has a one-line comment saying
why it deliberately doesn't. Setting `'hidden'` visibly changes review and quiz screens. `'tap'`
works in `QuizMode`.

---

### ☑ 44. `ReviewMode` renders furigana as a detached line, not ruby — `S`

**Verified** (`ReviewMode.jsx:217`, `:315`): it calls `stripFuri(card.jp)` for the headword and
then separately renders `extractReadings(card.jp)` as a plain `.cardFuri` line underneath.
`FlipCard` renders the same card as true `<ruby>` with readings sitting above their kanji.

So the identical card looks structurally different depending on which mode you meet it in, and in
the SRS mode — the one a learner uses *daily and longest* — it's the worse of the two: readings
are decoupled from the characters they belong to, so on a multi-kanji compound you can't tell
which reading goes with which character.

Roll into item 43 if doing that first; it's the same fix (adopt `JpFront`). Listed separately
because it's independently worth doing even if 43 is deferred, and because it's the specific
thing the owner remembered as "ruby behaviour in other parts still needs adjustment."

**Done when.** `ReviewMode`'s headword renders ruby the same way `FlipCard` does, honouring policy.

---

## 3. P0/P1 — Quiz and exam consistency

### ☑ 45. Eight quiz modes announce nothing to screen readers — `M`

**Verified by count.** `grep -c "aria-live\|sr-only"` per mode:

```
AngkaMode 0 · DangerMode 0 · ConfusionMode 0 · DengarMode 0
ProductionMode 0 · QuizProduksiMode 0 · SimulasiMode 0 · SprintMode 0
```

`QuizShell` (`:167`, `:174`) has this right — an `sr-only` `aria-live="assertive"` region for
correct/wrong feedback plus a `polite` one for progress. So `kuis`/`jac`/`vocab`/`wayground` are
accessible and the other eight are silent: a screen-reader user gets no feedback on whether their
answer was right, in eight of twelve practice modes.

The previous plan spent real effort on a11y (items 30–36, focus rings, `lang="ja"`, focus traps).
This is the same class of gap in the surfaces that matter most, and it was out of that plan's
scope rather than checked-and-cleared.

**How it fits.** Extract `QuizShell`'s announcement region into something reusable (a small
`<QuizAnnouncer result={...} qIdx={...} total={...} />`, or fold it into item 47's shared shell if
that lands first) rather than pasting the same JSX eight times.

**Done when.** Answering in any practice mode announces the outcome once, politely-or-assertively
per the pattern `QuizShell` already sets, without double-announcing on modes that get it via a
shared component.

---

### ☑ 46. `ResultScreen` has one consumer; 8 modes hand-roll their finish screen — `M`

**Verified**: `grep -rln "ResultScreen"` → only `QuizShell.jsx`. `ResultScreen` already offers
score, max streak, restart, **retry-wrong**, **add-wrong-to-SRS**, and exit.

Hand-rolling their own: `AngkaMode`, `DangerMode`, `ConfusionMode`, `DengarMode`, `ProductionMode`,
`QuizProduksiMode`, `SprintMode`, `SimulasiMode`. Each therefore has its own idea of what a
learner sees after finishing — and most are missing retry-wrong and add-to-SRS entirely, which
are the two actions that actually turn a failed question into learning.

**Related, smaller, same root** — a clean inconsistency *within* the shared path: `VocabMode`
renders `QuizShell` but never passes `onRetryWrong` (`VocabMode.jsx:87–96`), while `kuis`, `jac`,
and `wayground` do (`ModeRouter.jsx`). So the retry-wrong button appears in three of the four
shared-shell modes and silently vanishes in the fourth, for no stated reason. One-line fix; do it
as part of this item so the "why is vocab different" question stops recurring.

**Care needed:** `SimulasiMode`'s results screen is genuinely different on purpose — pass/fail
banner against a 65% threshold, full answer review. Don't flatten that into the generic one.
Either extend `ResultScreen` with an optional pass/fail slot, or leave Simulasi out and say so.
`SprintMode`'s is also legitimately different (speed/ghost-race framing).

**Done when.** Every mode either uses `ResultScreen` or has a comment saying what it needs that
the shared one can't express. Retry-wrong and add-to-SRS available wherever they're meaningful.

---

### ☑ 47. Quiz feature parity: the matrix is arbitrary — `L`

Built by grepping each mode. `Y` = present, `–` = absent. (`kuis`/`jac`/`vocab`/`wayground`
inherit keyboard/timer/haptic from `QuizShell` + `OptionButton`, shown as inherited.)

| Mode | keyboard | timer | pause | SRS rating | retry-wrong | haptic |
|---|---|---|---|---|---|---|
| kuis, vocab, wayground | inherit | inherit | – | – | mixed¹ | inherit |
| jac | inherit | inherit | – | **Y** | Y | inherit |
| simulasi | – | Y | **Y** | – | Y | Y |
| sprint | – | Y | – | – | – | – |
| angka, jebak, mirip | Y | Y | – | – | – | Y |
| dengar | – | Y | – | – | – | Y |
| produksi, kuisprod | Y | Y | – | – | – | Y |

¹ see item 46 — vocab is the odd one out.

**The point isn't that every mode needs every feature** — a 60-second sprint shouldn't pause, and
free-text modes can't use 1–4 answer keys. The point is that **no one has ever decided** which
features belong to which mode shape; the matrix is an accident of what each mode's author
happened to add. Concretely odd right now:

- Only `JACMode` feeds answers into SRS. Why not vocab/wayground, which are also card-linked?
  (Check whether their questions carry a `cardId` — if they don't, that's the real blocker and
  worth recording.)
- `SprintMode` and `DengarMode` have no keyboard support while `angka`/`jebak`/`mirip` do,
  despite being the same multiple-choice shape.
- `SprintMode` has no haptics at all, alone among the hand-rolled modes (item 21 fixed
  `angka`/`jebak`/`simulasi` but `sprint` wasn't in that item's scope).

**How it fits.** Define **mode shapes** (`multiple-choice`, `free-text`, `timed-exam`,
`speed-drill`) and state what each shape gets, in `COMPONENT_SPEC.md`. Then close the gaps that
the definition exposes. This is the item most likely to sprawl — timebox it, and prefer writing
the definition + fixing 2–3 clear gaps over attempting total uniformity.

**Done when.** The shape→features table exists in `COMPONENT_SPEC.md` and every deviation from it
is either fixed or annotated.

---

### ☑ 48. `SimulasiMode` doesn't behave like the exam it simulates — `M`

**Verified** (`SimulasiMode.jsx`): `qIdx` only ever increments (`:169`, `:535`). There is no way
to go back, skip and return, flag a question for review, or change an answer before submitting.
Answering commits immediately and advances.

Every real JAC/SSW-style paper exam lets a candidate skip a hard question, come back, and change
their mind. A mode explicitly named *Simulasi*, with a countdown timer and a 65% pass threshold,
teaching a forward-only habit is training the wrong exam technique — arguably worse than having
no simulation, because it builds confidence in a strategy the real exam punishes.

**How it fits.** Answers already accumulate in a `results` array; the change is letting `qIdx`
move both ways, deferring scoring until submit, and adding a question-navigator (a grid of
numbers: answered / unanswered / flagged) plus an explicit **Submit** action. Note this
interacts with item 51 (mid-session persistence) — decide the order.

**Care needed:** don't apply this to the practice modes. Immediate feedback is correct for
`kuis`/`angka`/`mirip` — it's how you learn. Deferred feedback is correct for `simulasi` — it's
how you're tested. That distinction is worth stating in the spec, because it will otherwise look
like an inconsistency to a future session and get "fixed" in the wrong direction.

**Done when.** A learner can navigate freely, flag questions, see what's unanswered, and submit
deliberately; practice modes are untouched.

---

### ☑ 49. Question-count options differ per mode with no rationale — `S`

`QUIZ_COUNTS = [10, 20, 30]` is defined **three separate times** — `DengarMode.jsx:18`,
`ProductionMode.jsx:18`, `QuizProduksiMode.jsx:19` — and other modes offer different sets or a
`Semua` option. Same literal, copy-pasted; `src/utils/constants.js` already exists and is where
this belongs (`SESSIONS_CAP`, `SRS_MATURE_DAYS` etc. live there).

Also worth checking while in there: `prefs.quizQuestionCount` exists in the schema and is
described as "persist quiz question count" — verify it's actually read by the modes that show
these pills, or whether each mode re-defaults to 10 every time regardless.

**Done when.** One shared constant; per-mode deviations are explicit; the persisted preference
either works everywhere or is removed.

---

## 4. P1 — Offline asset integrity, plus one gesture gap (audit waves 2–3)

Wave 1 audited *screens*. This wave audited *assets* — what the app actually needs fetched, and
what happens when it can't fetch. Both items below came out of the owner's question "what if we
provide the fonts in the repo?", which turned out to be a better instinct than it looked.

### ☑ 61. Fonts come from a third-party CDN the app can't guarantee — `M`

**How it works today, verified** (`index.html:62–65`, `public/sw.js` fetch handler): all three
families — DM Sans, Noto Sans JP, Syne — load from `fonts.googleapis.com` / `fonts.gstatic.com`.
The service worker *does* handle them: cross-origin font requests hit a **cache-first** strategy
into a dedicated `CACHE_FONTS`.

**So offline works — but only after one successful online load.** That's the part worth being
precise about, because it's easy to read the SW code and conclude "fonts are handled, we're fine".
The failure cases that remain:

- **First run on a blocked or captive network.** Install the PWA on site WiFi that blocks external
  CDNs and the fonts never populate — the app runs indefinitely on system fallbacks. This is a
  plausible scenario for the actual audience, not a hypothetical.
- **Cache eviction.** `CACHE_FONTS` is evictable under storage pressure independently of the rest.
  A cheap phone under pressure can silently lose fonts a returning user already had.
- **Two extra origins on the critical path.** DNS + TLS to `googleapis` and `gstatic` before text
  can render properly. `display=swap` prevents invisible text but guarantees a visible reflow
  (FOUT) on every cold load — on 3G that's noticeable.

**On the cookie question, directly: no — never cookies.** Cookies cap around 4KB, are text-only,
and are sent with every single request; putting a font in one isn't possible or desirable. Font
binaries live in two places: the browser's ordinary **HTTP cache** (opaque, evictable, not
controllable) and the **Cache Storage API** — which is what the service worker uses, and the only
one this app has actual control over. Self-hosting moves fonts from "cached if the CDN was
reachable once" into "precached deliberately, same as any other app asset".

**The real design constraint, and why this isn't a five-minute change.** Noto Sans JP is a CJK
font — the full family is several megabytes. Google Fonts only gets away with serving it because
it slices the font by `unicode-range` into dozens of subsets and the browser downloads only the
slices it needs. **Naively self-hosting one big `.woff2` would balloon the offline payload**, in an
app already carrying a flagged 661 kB data chunk and holding a hard 4-dependency line.

**But this app is an unusually good fit for solving that properly:** the corpus is *fixed and
known* — 1,438 cards, shipped in-repo, not user-generated. The exact set of glyphs the app can
ever need is computable at build time. Subsetting Noto Sans JP to precisely that set (plus kana,
punctuation, and the Latin/Indonesian range for DM Sans and Syne) should land far below the naive
size, and unlike the CDN's generic slicing it would be exact.

**How it fits.** Build-step subsetting, output to `public/fonts/`, `@font-face` with local `src`,
drop the two `preconnect`s and the CDN `<link>`, add the files to `PRECACHE_URLS` (see item 62 —
these two want doing together), and delete the now-dead Google Fonts branch from the SW fetch
handler. Verify the tooling doesn't breach the dependency ceiling — a build-time devDependency is
fine, a runtime one is not.

**Care needed:** confirm licensing permits redistribution in-repo before committing binaries. All
three families are SIL Open Font License, which does permit it, but check rather than assume, and
include the license file alongside the fonts.

**Done when.** No external font request on any load; fonts precached with the rest of the shell;
measured payload delta recorded in the commit; `DESIGN_SPEC.md` §3 updated with the subsetting
approach so a future session doesn't "fix" it back to a CDN.

---

### ☑ 62. `PRECACHE_URLS` has 2 entries; 21 lazy chunks aren't among them — `M`

**Verified** (`public/sw.js:18–21`): `PRECACHE_URLS = [BASE + '/', BASE + '/index.html']`. That's
it. Everything else — the main bundle, CSS, the icon sprite, and **every one of the 21
lazy-loaded mode chunks** — is cached only opportunistically, when the fetch handler happens to
see a request for it.

**The consequence:** a learner who installs the app, lands on the dashboard, and then goes offline
can open only the modes they had already visited *while online*. Everything else fails on a dead
dynamic import. The app tells them, in `SideNav`'s footer, "konten siap offline" — item 25
narrowed that copy to say *konten*, which is honest about the card data, but the modes that
display it aren't guaranteed to be there.

This is the same failure item 37 was about (a stale chunk stranding a session), from the opposite
direction: not a *changed* chunk, an *absent* one. Item 38's error boundary will catch it and
offer a reload, but a reload offline can't fix it either.

**How it fits.** Vite emits a manifest at build time; generate `PRECACHE_URLS` from it rather than
hand-listing (hand-listing hashed filenames guarantees drift). Weigh precaching *all* mode chunks
against install cost on a metered connection — a reasonable middle path is precaching the shell
plus the handful of high-traffic modes (`kartu`, `ulasan`, `kuis`) and leaving rarely-used ones
opportunistic, which is a product call worth surfacing rather than deciding silently.

Pairs naturally with item 61 — same file, same "what's guaranteed offline" question, one
`CACHE_VERSION` bump between them.

**Done when.** A fresh install that goes offline immediately can still open the core study modes;
the precache list is generated, not hand-maintained; `PWA_RELEASE_SPEC.md` §2 documents what is
and isn't guaranteed.

---

### ☑ 63. `GlossaryMode`'s A–Z jump bar is a 28×28px tap target — `S`

**Verified** (`GlossaryMode.module.css:96–100`): `.azBtn` sets `min-width: 28px; height: 28px`
explicitly. The project's own `--tap-min` token exists for this and isn't used here. 28px against
a 44px guideline, on a control that is *by design* a row of small adjacent targets — the shape
most likely to be mis-tapped, on a construction worker's phone, possibly with gloves.

Narrow, real, and cheap. See §6 for why this is the *only* tap-target item.

---

### ☑ 64. `--ssw-onAmber` exists; 21 sites hardcode `#fff` instead — `S` — `P2`

A token for "text sitting on a saturated brand surface" is defined in `theme.js` and mostly
unused; `color: #fff` appears 21 times across `OfflineBanner`, `DataWarningBanner`,
`ConfirmDialog`, `Dashboard`, `BelajarTab`, `Onboarding`, `MissionCompleteOverlay`.

**Not a dark-mode bug** — checked, and every one of those sits on a fixed-colour background (the
red warning banner, an amber gradient, a dark overlay) that is identical in both themes, so white
stays correct. It's the same *class* of inconsistency item 40 addressed for correct/wrong: a
semantic token exists and isn't the single source of truth. Low priority precisely because
nothing is visibly broken — worth doing when already touching these files, not as its own errand.

---

### ☑ 65. `ReviewMode` is a flip-card surface with none of `FlashcardMode`'s gestures — `S`

**Verified**: `ReviewMode` has its own `flipped` state and flip interaction (`:28`, `:109`) — it
is structurally the same card-flipping surface as `FlashcardMode`. But `grep -rln "onTouchStart"`
returns only `FlashcardMode/index.jsx`, `FlipCard.jsx`, and `Toast.jsx`. So swipe-to-navigate
exists on flashcards and nowhere else.

Same complaint as items 43/44 from a different angle: the **SRS review mode is the one a learner
uses daily and longest**, and it's consistently the poorer relation of the flashcard mode it
mirrors — no ruby, no swipe, different furigana treatment. Worth fixing as a set rather than
three separate errands.

**Care needed:** swipe is *not* automatically right for quiz modes — a horizontal drag next to
tappable answer options invites mis-fires. Scope this to the flip-card surfaces only.

---

## 5. P1 — Carried forward from the completed plan

These were **deliberately deferred with reasons** in the archived plan, not missed. Reasons
summarised; full context in `docs/archive/UI_UX_PLAN-2026-08-overhaul.md`.

### ☑ 50. `correctFlash` / `wrongShake` reach only `OptionButton` — `M`
*(archived item 21's stated deferral)* The haptic half of answer feedback was unified across all
modes; the **visual** half wasn't. Both animations are defined in `global.css` and consumed only
by `OptionButton.module.css`, so the eight hand-rolled modes have no answer-feedback animation.
Each has bespoke option styling, so this is a real per-file CSS pass. Natural companion to items
45–47 — same files, same sitting.

### ☑ 51. A crash or reload mid-quiz loses every answer — `M`
*(archived item 19's finding; out of that item's scope)* `QuizShell`'s `results` live in
`useState` and only persist via `onFinish` at `phase === 'finished'`. Shared by
`kuis`/`jac`/`vocab`/`wayground`; the hand-rolled modes are the same shape. On a cheap phone with
aggressive background-tab eviction — the actual target device — losing a 30-question session to a
tab reclaim is a genuine and repeatable loss. Item 38's error boundary now tells the truth about
this ("jawaban yang belum selesai mungkin tidak tersimpan") but doesn't fix it.
Consider: write-through to `sessionStorage` per answer, offer resume on re-entry.

### ☑ 52. In-app mode exit doesn't pop the history entry — `S`
*(archived item 10's known gap, documented in `AppContext.jsx`)* Exiting a mode via an in-app
control replaces rather than pops, so a subsequent hardware-back can need two presses. Needs a
way to distinguish "our own `history.back()`" from "user pressed back" — the reason it wasn't
solved then. Low user impact; listed so it isn't rediscovered as new.

### ☑ 53. `rem` conversion for the type scale — `L`
*(archived item 22's deferral)* **Done 2026-08-31** — see `docs/DESIGN_SPEC.md` §3 for the full
account of why the original three-reason deferral turned out to be a much smaller change than
estimated once traced through, not a wrong call reversed. Every `--fs-*` token is `rem`; no
consuming stylesheet needed touching.

### ☑ 54. `speakJP()`'s `onError` is wired in one of six call sites — `S`
*(archived item 25's stated scope)* Only `DengarMode` reports a synthesis failure. The other five
(`QuizShell`, `ProductionMode`, `GlossaryMode`, `ReviewMode`, `QuizProduksiMode`) still fail
silently. Lower stakes there (audio is supplementary, not the exercise), which is why it was
scoped out — revisit if silent audio failure turns out to matter.

### ☑ 55. `FilterPopup` is archived but the capability is still missing — `M`
*(archived item 18)* A real category-picker with live counts, unwired because `FlashcardMode`'s
filter state is a single `__cat:` search string, not a multi-category set. Lives at
`legacy/unwired-app-code/`. Wiring it needs that state change first. `haptic.success()` is
likewise still defined and unused (archived item 21) — a first call site is a product decision.

**Done 2026-09-04.** The state change came first, exactly as this entry predicted. `search` no
longer carries three unrelated filters; categories are a `Set` (`'all'`/`'bintang'` as exclusive
sentinels, everything else multi-select) that *composes* with the text query instead of replacing
it, and old `__cat:`/`__starred__` values still in sessionStorage migrate on read. `FilterPopup`
moved to `src/components/` on top of `Sheet` (the focus trap and Escape-to-close it never had),
and counts from the deck it is handed rather than the global `CARDS` — so a `filterIds` deck
launched from `SumberMode` reports its own numbers instead of 1438. Entry point is a folder button
in the flashcard top bar: until now the only way to filter by category was to tap the badge on a
card of that category, i.e. find one first, inside the 1438-card deck you were trying to narrow.
`haptic.success()` is still unused — that half of this entry is unchanged, and still a product
decision.

---

## 6. P2/P3 — Approved enhancements (owner-approved 2026-08-25)

**All five approved by the owner** in one go, on the general principle that they improve the
project. Recording that as-stated, plus one honest caveat: a blanket yes is an approval of the
*idea*, and three of these still have a genuinely open **implementation-shape** question that the
proposal deliberately left unanswered. Those aren't reasons to delay — they're the first decision
each item needs, flagged so they get made rather than guessed at mid-build.

**Item 59 is the one to think hardest about, and it should not be built blind.** See its entry.

### ☑ 56. Exam-readiness estimate on the dashboard — `M` — `P2` — approved
`StatsMode` already computes `calcReadiness`, and the dashboard already shows an exam countdown
(items 12/24). Putting a *readiness* signal next to the *countdown* answers the question a
candidate actually has — "am I on track?" — rather than just "how long is left?".

**Open decision:** a confident-looking number that's wrong is actively demotivating for someone
whose visa depends on this exam. Strong recommendation: a band (`kurang siap` / `cukup` / `siap`)
over a false-precision percentage. Whoever builds this should also sanity-check what
`calcReadiness` actually measures before surfacing it as a headline — it was written for a stats
page, where being approximate is fine, not for a dashboard promise.

### ☑ 57. Weak-category drilling from the results screen — `S` — `P2` — approved
Retry-wrong exists but is flat — it retries *these specific* wrong cards. `FocusMode` already
computes per-category weakness. Offering "12 salah di 電気設備 — latih kategori itu" turns one bad
session into a targeted next session. Small because both halves already exist; pairs naturally
with item 46, which is already touching every results screen.

### ☐ 58. Answer-timing per question — `M` — `P3` — approved
`useSessionTimer` measures whole sessions. Per-question timing surfaces *hesitation* — cards
answered correctly but slowly are exactly the ones FSRS should see again sooner, and are invisible
today.

**Open decision, unchanged by approval:** verify against `ts-fsrs`'s actual rating model first.
This may be better expressed as an adjustment to the rating already being sent than as a new
stored field — the latter means a storage-schema change (v7) and a migration, which is a much
bigger commitment than the item's `M` size implies. Decide which before writing code.

**Decision made (2026-08-26): new stored field, not a rating adjustment. Checkbox deliberately
left unmarked — the decision is made, the migration itself is not built.**

`ts-fsrs`'s `Rating` is a fixed 4-value enum (Again/Hard/Good/Easy, `fsrs-core.js`) with no timing
input channel at all — confirmed by reading the actual integration, not assumed from general FSRS
knowledge. There's no way to hand the algorithm "took 8 seconds" directly; the only lever available
would be silently *changing which of the four discrete ratings gets sent* based on a computed
timing heuristic.

This codebase already has a directly relevant precedent for adjusting FSRS's inputs, and it argues
against that path: `INDONESIAN_CALIBRATION` (`fsrs-core.js`) sits explicitly inert
(`calibrated: false`) until real study data justifies activating it, rather than shipping a
plausible-sounding heuristic. A hesitation-based rating adjustment would be exactly that kind of
heuristic — no research backing for what the adjustment formula should be, and a real risk to the
algorithm's own validity: FSRS's model assumes the rating reflects the learner's genuine
self-assessed recall quality. Silently downgrading a "Good" to "Hard" because they were slow (a) has
no principled formula behind it and (b) could feel simply wrong to a learner who knows they got it
right and pressed accordingly.

New field is the right call, but "just add a field" undersells it — read `migrations.js` before
assuming so: this codebase's migrations are real, dedicated, per-version data transformations
(v1 through v6, 386 lines) touching actual users' stored SRS progress. A v7 migration deserves that
same level of focused care and its own session, not a rushed addition at the tail of a day that has
already landed 26 commits. Recommended shape for that future session: an *additive*, optional field
on the review record (not a scored input to FSRS) — e.g. `responseMs` — surfaced back to the
learner as an informational signal ("you hesitated on this one") rather than fed into the
algorithm at all, preserving `INDONESIAN_CALIBRATION`'s own standard of not touching FSRS's actual
behavior without real evidence behind the change.

### ☐ 59. Offline-capable audio via pre-generated clips — `L` — `P3` — approved, **measure first**
Item 25 made speech failure *legible*; it can't make it *work*. A worker studying on a train with
no local ja-JP voice has no audio at all. Pre-generated clips fix it properly.

**This is the one approval worth a second look, because it can make the app worse for the exact
user it's for.** The constraint isn't bureaucratic: this is an offline-first PWA for cheap phones
on metered connections, already carrying a flagged 661 kB data chunk. Audio clips for 1,438 cards
would dwarf everything else in the bundle. And it **compounds with item 61** — self-hosted fonts
add payload too, and nobody is currently tracking the total.

Before building: measure the current install footprint, then decide a **budget** the combined
61 + 59 work has to fit inside. Likely landing point is a subset — the ~200 JAC-official terms
rather than all 1,438 — and possibly on-demand download rather than precache, so the user opts in
rather than paying for it at install. If the measurement says the budget can't hold it, *that is a
legitimate outcome* and the approval doesn't override it; report back rather than shipping bloat.

**Measured (2026-08-26). Checkbox deliberately left unmarked — the measurement is done and
conclusive, but building this further hit a separate, concrete blocker described below.**

Current real precached install footprint, from the actual built `dist/sw.js` (not estimated):
**3.29 MB** (1.44 MB fonts from item 61 + 1.85 MB JS/CSS/data bundles, including the eagerly-
imported `data-cards` chunk).

Per-clip audio size wasn't guessed — generated real Opus-encoded test clips (`ffmpeg`/`libopus`,
available in this environment) at realistic short-word durations (1–2s, VOIP-optimized 24kbps) to
measure actual output size rather than assume one. Used white noise as the test signal
deliberately: it's close to worst-case for compression (incompressible), so this is a conservative
upper bound — real speech, with its silence gaps between syllables, compresses at least as well if
not better. Result: **3.1–6.0 KB per clip**, ~5 KB average.

| Scope | Added payload | New total | Increase |
|---|---|---|---|
| ~200 JAC-official terms | +0.98 MB | 4.27 MB | +30% |
| All 1,438 cards | +7.02 MB | 10.31 MB | **+213%** |

**Confirms the plan's own anticipated landing point, with real numbers behind it, not just
intuition**: the full corpus would more than *triple* the install size for an audience explicitly
characterized as cheap-phone, metered-connection — not defensible. The ~200-term subset, especially
as opt-in/on-demand rather than mandatory precache, is a real, fittable scope (+30%, comparable to
what item 61 itself added).

**Separate, concrete blocker on top of the budget question**: this environment has audio
*encoding* tooling (`ffmpeg`, `libopus`) but no actual Japanese text-to-speech voice or service —
the clips measured above are synthetic test signals for sizing purposes only, not usable audio.
Actually building this item needs either a real ja-JP TTS API (cloud-based — itself worth checking
against the offline-first constraint this whole item exists to serve, since a build-time TTS
service is fine, a runtime one would defeat the point) or licensed/recorded human audio for ~200
terms. Neither is something to source and integrate as a continuation of this session — a genuinely
separate task, not a shortcut to skip.

### ☑ 60. Typed-answer leniency is invisible — `S` — `P2` — approved
`QuizProduksiMode` advertises "pencocokan fleksibel (huruf besar/kecil diabaikan)" but a learner
who types a *nearly* right answer is just told they're wrong. Showing the diff
("kamu: *keselamaton* · benar: *keselamatan*") turns a typo into a spelling lesson.
Check what the matcher actually tolerates before writing copy that promises more than it delivers.

---

## 7. Checked — not bugs

Recorded so these aren't re-investigated. Several came out of wave 2 specifically because the
first grep looked alarming and the actual code was fine — that gap between "grep count" and
"real problem" is the thing worth writing down.

- **`QuizShell` a11y** — ~~correct. `sr-only` assertive region for answers, polite for progress.
  It's the model for item 45, not a target.~~ **Corrected (item 60, 2026-08-26): this was wrong.**
  Item 45's own `grep -n "aria-live"` found exactly 2 regions — question progress and the timer —
  neither announces correct/wrong. There was no answer-outcome announcement anywhere in the app,
  including here. Item 45 built `QuizAnnouncer` from scratch rather than extracting an existing
  pattern. Left the original claim struck through rather than deleted, so a future read of this
  section's own point ("that gap between grep count and real problem is worth writing down") isn't
  itself lost — this was the plan documenting its own audit as more thorough than it was.
- **`OptionButton`** — fully tokenised (`--ssw-correct`/`--ssw-wrong` + Bg/Border), animations
  wired. Item 40 verified this directly.
- **Immediate feedback in practice modes** — correct pedagogy, *not* an inconsistency with
  `SimulasiMode`. See item 48's warning.
- **`SimulasiMode`'s bespoke results screen** — genuinely different needs (pass/fail vs score).
  Not a `ResultScreen` adoption target without extending that component first.
- **`stripFuri` on quiz answer options** — plausibly deliberate (prevents giving away readings).
  Item 43 should confirm and document rather than "fix".
- **Tap targets generally** — 12 stylesheets declare button classes without referencing
  `--tap-min`, which reads like a systemic failure and isn't. Spot-measured the real ones:
  `OptionButton .btn` is 14px padding + 13px/1.75 text ≈ **51px**; `ResultScreen .btnWrong`
  ≈ **53px**. Both comfortably over 44px via padding alone. **Only `GlossaryMode`'s `.azBtn` sets
  an explicit undersized height** — hence item 63 is one narrow item, not a sweep. Don't re-run
  this as a blanket audit; measure before believing the token's absence means anything.
- **Hardcoded `#fff` and dark mode** — 21 occurrences, all on fixed-colour backgrounds identical
  in both themes. Not a theming bug. Tokenisation nit only; item 64.
- **Service worker font handling** — the SW *does* cache-first Google Fonts into `CACHE_FONTS`.
  Reading only that code suggests fonts are fully handled offline; item 61 exists because the
  gap is the *first* load and eviction, not the caching strategy itself.
- **Form inputs (wave 3)** — a grep for `<input` without a nearby label looked like eight
  unlabelled fields. All checked individually and all fine: attributes simply sit on the line
  *after* the tag, so `ProductionMode` (`aria-label="Jawaban"`), `FilterBar`
  (`aria-label="Cari kartu"`) and the rest are correctly labelled. `ExportMode:420` is a hidden
  `type="file"` input triggered by a properly-labelled button — the standard pattern, not a gap.
- **Missing Japanese headwords (wave 3)** — `HANDOFF.md` carries an open owner question about
  ~9 cards that lost their JP headwords. Checked `src/data/cards.js` directly: **1,438 `jp`
  fields, 0 empty**. That file is clean. The flagged set (`wglv-jp-02`) is wayground quiz data,
  a different file — so the question is still genuinely open, just not where a UI audit would
  find it. It's a content issue, not a UI/UX one; leaving it in `HANDOFF.md` where it belongs.
- **PWA manifest** — complete (`name`, `short_name`, `description`, `lang`, `dir`, `start_url`,
  `scope`, `display`, `display_override`, `orientation`, colours). Not a gap.

---

## 8. Audit status — the 2026-08-25 round only

_(Scope note, 2026-09-05: this section closes out **items 43–65** and nothing else. Three further
audit rounds ran after it and appended §11–§14; "the plan is considered complete" below means that
first queue, not this file. §9 and §10 are scoped the same way.)_

**Closed after three waves.** Wave 1 audited screens and interaction (items 43–49, 56–60), wave 2
audited assets and offline integrity (61–64), wave 3 audited gestures, forms, data integrity and
the manifest (65 — and four disproven findings above).

Wave 3 returned mostly clean, which is itself the useful result: one real finding out of five
leads. The plan is considered **complete as a starting queue** — not because nothing else exists,
but because the return per pass has clearly dropped, and further auditing without implementing is
less valuable than starting Batch A. Re-audit after the P0/P1 items land, not before.

---

## 9. Spec docs this plan may require updating

Per the archived plan's §10 convention — update the spec **in the same commit** as the item.
_(Items 43–65 only; the later rounds record their own spec impact in their commit messages.)_

| Item | Doc | What |
|---|---|---|
| 43, 44 | `COMPONENT_SPEC.md` §8 | Furigana policy: which surfaces honour it, and the options exception |
| 45, 46, 47 | `COMPONENT_SPEC.md` | Mode shapes → feature table; announcement pattern |
| 48 | `COMPONENT_SPEC.md` | Immediate vs deferred feedback, and why they differ |
| 49 | `constants.js` + spec | Shared quiz counts |
| 50 | `DESIGN_SPEC.md` §4 | Closes the gap that item 21 explicitly recorded as open |
| 53 | `DESIGN_SPEC.md` §3 | Replaces the recorded `rem` deferral |
| 61 | `DESIGN_SPEC.md` §3 | Self-hosted + subset fonts; why not a CDN (so it isn't reverted) |
| 61, 62 | `PWA_RELEASE_SPEC.md` §2 | What is actually guaranteed offline vs opportunistically cached |

---

## 10. Suggested order — items 43–65

_(All batches below are done except **58** and **59** in Batch F. Later rounds set their own
order; §14 states its own.)_

**Batch A (P0, highest value):** 43 → 44 → 65 — the SRS-review parity set. `ReviewMode` is the
mode a learner uses daily and longest, and is currently the poorer relation of `FlashcardMode` in
three separate ways (no ruby, detached readings, no swipe). Fixing them together is one pass over
one file instead of three. Self-contained and immediately visible.

**Batch B (quiz core):** 45 → 46 → 49 — accessibility parity, shared results screen, shared
constants. All the same files; doing them in one sitting avoids three passes over eight modes.
50 folds in naturally here, and 63 is a one-liner to sweep up while nearby.

**Batch C (offline integrity):** 61 → 62 — same file, same question, one `CACHE_VERSION` bump
between them. Independent of A and B, so it can run in either order. 61 needs a licensing check
and a build-step decision before code, so read it before scheduling.

**Batch D (bigger calls):** 47 → 48 — needs decisions, not just execution. Get owner input on
the mode-shape table and on deferred-feedback before starting.

**Batch E (carried-over + polish):** 51 → 54 → 52 → 64 — as capacity allows.

**Batch F (approved enhancements):** 57 → 60 → 56 → 58 → 59, roughly cheapest-first. 57 is nearly
free if done *during* Batch B, since item 46 is already rewriting every results screen — do it
there rather than as a separate pass. 60 is self-contained. 56 and 58 each need their open
decision made first (see their entries). **59 is last on purpose** — it needs item 61 done and the
combined payload measured before it can be scoped honestly.

**Nothing is unapproved any more.** Every item in this plan is cleared to build; what varies is
whether the *shape* is settled (most) or still needs a decision (56, 58, 59).

---

## 11. New round — 2026-08-31 UI/UX audit

Owner asked for an exhaustive UI/UX/typography audit (ruby rendering, font sizing, general
consistency), explicitly approving anything found along the way, plus a first pass at the newer
"expand to all devices" direction. Full detail lives in commit messages, not here (owner's own
stated preference) — this section is only the forward-looking remainder: real findings that
didn't get a full fix in that session, so they aren't lost the way this plan's own §0 warns
about. Numbering continues from 65; this is a new round, not a retroactive edit to 43–65.

### ☑ 66. Content-data defects surfaced by the ruby-renderer rewrite — `M`
**Done 2026-09-01.** All 4 rendering-affecting defects fixed at the source (each cross-checked
against that same card's own desc/usage field, which already had the correct form written
correctly in 2 of the 4 cases) — commit `c1cdbea`. The 79-occurrence duplicate-marker pattern
(same marker written twice in a row, e.g. the original `冷媒《れいばい》《れいばい》` report
that started this round) collapsed separately — commit `b12219f`. `ruby-audit-round3.test.jsx`'s
allowlist is back down to only the genuinely-unrenderable gloss/cloze cases.

### ☑ 67. Continue the "expand to all devices" audit past Belajar — `L`
**Substantially done 2026-09-01.** All 21 modes screenshotted at 375/820/1440px (42 screenshots,
actually reviewed). Of the 4 `default`-width modes: GlossaryMode and StatsMode already reflow
into real multi-column layouts; SumberMode and SearchMode stay single-column but were checked
against real content (not the empty state) and confirmed to genuinely use the width already
(progress bars, wrapping description text) rather than stretching with dead space — forcing
either into a grid would cramp their denser per-row content, unlike Belajar's case. Every
`reading`-width mode is correctly capped by design. Found and fixed 3 further layout bugs along
the way (not stretching, but the same "checked live, not assumed" spirit): title/button header
rows breaking at narrow widths in ConfusionMode, AngkaMode, DangerMode — see commits `7a73d95`,
`62484f7`. No further "stretching with dead space" cases found.

### ☑ 68. Remaining off-scale hardcoded font-sizes — `M`
**Picked up 2026-09-01, pivoted to something more consequential.** Checked several candidates
against comparable elements the way the pageTitle/ratingEmoji fixes worked (e.g. ReviewMode's
`flipIdText` vs FlashcardMode's `backId`) — found genuine differences, but consistently
multi-property ones (size *and* weight *and* color together) consistent with deliberate
adaptation to different visual contexts, not the single-property, context-independent mismatch
`ratingEmoji` was. Left those as-is rather than force a match without real evidence.

While doing that comparison work, found something bigger: 41 of the shared `modes.module.css`'s
67 rules (61%) were completely dead — zero `.jsx` references anywhere, from entire modes having
moved to their own dedicated CSS module over this app's history without the old shared rules
ever being cleaned up. Removed all 41, verified thoroughly (recursive cross-file search, not
just `src/modes/*.jsx`; caught and corrected one of its own false positives along the way; full
21-mode screenshot sweep before/after, pixel-identical). Commit `6353ff7` has the full account,
including an honest note on a one-off phantom-session screenshot during re-verification that
didn't reproduce across two more full-sequence runs with direct session-data inspection —
concluded likely Playwright timing variance, not a new bug, recorded rather than hidden.

---

## 12. New round — 2026-09-04 exhaustive audit

Owner asked for an exhaustive analysis, every gap/inconsistency/discrepancy fixed, and a UI/UX
upgrade, with explicit permission to overhaul anything. Most of what that pass found was fixed in
the same session (see `HANDOFF.md`'s CURRENT STATE for the commit map). This section is only the
remainder: things that turned up, are real, and were deliberately **not** closed — either because
they need an owner decision, or because they are genuinely separate scope.

Numbering continues from 68.

### ☐ 69. `VOCAB_SOURCES` excludes 49 cards where its name implies ~543 — `S` — **needs a decision**

`excludeVocab` (`useTrackedCards`) and FocusMode's weakness ranking both filter out cards whose
source is in `VOCAB_SOURCES`. After the five zero-card entries were removed (2026-09-04) that list
is exactly one source: `vocab-jac`, 49 cards. `vocab-supplementary` — 494 cards, by far the largest
vocab pool in the corpus — is **not** in it.

Both readings are defensible, which is why this wasn't just changed: `SOURCE_GROUPS` files
`vocab-supplementary` under "Sumber Tambahan" rather than "Kosakata", so its exclusion may be
deliberate; but the constant is named VOCAB_SOURCES and both consumers use it to mean "not chapter
content". Adding it would silently move **every category score on FocusMode's weakness screen**,
which is a user-visible change to a ranking, not a refactor.

Owner call: should `vocab-supplementary` count as vocab for the purpose of "which category am I
weakest in"?

### ☐ 70. StatsMode shows a raw readiness percentage; the Dashboard shows a band — `S`

Item 56 argued the case and acted on it: a false-precision readiness number is actively
demotivating for someone whose visa depends on this exam, so `calcReadinessBand` returns
kurang/cukup/siap and returns `null` below 5 scored sessions rather than guessing. The Dashboard
uses it. **StatsMode still renders "45%" in a big ring**, from `calcReadiness` directly — the same
underlying number item 56 decided not to show. One screen believes the argument and the other
doesn't.

Not changed here because it is item 56's own decision to extend, not a defect to fix, and the ring
is StatsMode's main visual anchor — replacing a percentage with a band is a layout question as much
as a copy one.

### ☐ 71. `《・》`-separated terms stack vertically in every context — `M`

`JpFront`'s `bullet` branch splits on `・` and stacks the parts. In list rows that is now handled
(`compact`, 2026-09-04), but the underlying split is still wrong for a class of entries: `・` is
also a *word-internal* separator in katakana loanwords, so `パワー・ハラスメント（パワハラ）` is
rendered as two stacked terms rather than one word.

Deliberately not "fixed" with a katakana heuristic: of the 8 all-katakana `・` entries in the
corpus, 4 are genuine lists (`ボルト・ナット・ワッシャー` = bolt, nut, washer; `タップ・ダイス`)
and 4 are arguably single terms (`パワー・ハラスメント`, `ロックアウト・タグアウト`). A rule keyed
on script would get about half of them wrong, which is worse than the current consistent behaviour.
Fixing this properly means marking the intent in the data, not guessing it at render time.

### ☐ 72. 101 font sizes are off the type scale (no longer frozen, still not on it) — `S`

254 of 297 inline `fontSize: <px>` values matched a `--fs-*` token exactly and were migrated
(2026-09-04). What was left — 41 in JSX and, once the scale was rebuilt, 60 more in stylesheets —
matched no token: 14, 16, 18, 20, 22, 24, 26, 28, 32, 36, 40, 44, 48, 52, 58, 60, 64px.

Half of this is now closed. They were **frozen**, which was a real defect: a px font-size follows
neither the viewport nor Ukuran Teks, so at "Sangat Besar" the text around a display numeral, an
empty-state emoji or an Onboarding heading grew 25% while the thing itself held still. All 101 are
rem now, at the value they already had, and `spacing-scale.test.js` keeps them that way.

What stays open is the original question: should any of them be a token? Snapping would move 24px
to 26 and 20px to 19, and item 68's judgment holds — don't force a match without evidence the
element wants the neighbouring token's size. Each is individually decidable, and they are trivial
to find (`rem` outside a `var()` in a `font-size`).

### ☐ 73. The setup screens are the last of the vertical dead space — `S` — **design call**

`.content` is a flex column in mode chrome now and a screen claims the leftover height with
`flex: 1 0 auto` (`LAYOUT_SPEC.md` §6). Kartu and Ulasan use it. A census of all 21 modes at
390×844, measured on the running app, says what is left:

| screen | empty below the content |
| --- | --- |
| Cari | 429px — but that is an empty result list waiting for a query, not a layout defect |
| Dengarkan | 382px |
| Produksi | 353px |
| Kuis Produksi | 353px |
| Kuis | 232px |
| Sprint | 203px |
| JAC Official | 63px |
| Kartu, Ulasan | 24px (the page's own bottom padding) |

Everything else scrolls. So the open question is exactly one shape: the five setup screens that
stack their options and then a "Mulai" button in the top two-thirds of the phone.

Not fixed here because it is not a defect the way Kartu's and Ulasan's were. There the *content*
was adrift in the space; here the question is whether the CTA should be bottom-anchored, which is a
design position (bottom-anchored = thumb-reachable and consistent with the app's bottom nav;
top-stacked = the button sits directly under the choice it confirms). Whichever way it goes it
should go the same way on all five, which is what makes it one decision rather than five.

### ☐ 74. The flip card cannot grow to fill its scene — `M`

`.scene` now grows and centres the card in the slack, but the card itself stays at
`max(230px, measured back-face height)`. Letting it stretch would use that space for the Japanese
instead of leaving it as air — and it would not reintroduce the flip-jump the ResizeObserver exists
to prevent, since both faces would take the same stretched height.

The blocker is `.back`, which is `position: absolute` with `top/left/right` and no `bottom`, so it
is content-height regardless of how tall the card gets: stretch the card today and the back face
renders shorter than the front. Fixing that means reworking a 3D flip whose two faces currently
size independently — small in diff, easy to get subtly wrong, and worth doing with the card
measured at several content lengths rather than eyeballed at one.


---

## 13. Feature-parity audit across the whole Belajar tab (2026-09-04)

Prompted by "kasih opsi kategori di menu kartu, sekalian analisa gap fitur menu kartu vs menu
lain" — then widened, on request, to every menu the Belajar tab lists.

Method, so a future session can re-run this rather than trust it: the tab
(`BelajarTab.jsx:135-173`) renders `MODE_SECTIONS` verbatim, so the mode list is the registry's.
Each mode's own file was read for its options; the **prop map at `ModeRouter.jsx:188-269` is the
authority** for the "session" and "audio" columns, because a mode cannot use a capability it is
never handed. Every claim below was checked against code, not inferred from these docs.

| Section | Mode | Category filter | Count option | Wrong-only | Session recorded | Audio | Resume |
|---|---|---|---|---|---|---|---|
| Pelajari | `kartu` | ☑ *(item 55)* | — | "Belum" (from `unknown`) | **no** | **not passed** | — |
| | `glosari` | Y chips | — | — | n/a read | reads `audioEnabled` itself | — |
| | `cari` | — (text) | — | — | n/a read | — | history 5 |
| | `catatan` | — | — | `ada`/`belum` pills | n/a read | — | — |
| Latihan | `kuis` | Y (⚙ panel) | `QUIZ_COUNTS`+All | Y Mode Lemah | Y | Y | **Y — only one** |
| | `sprint` | Y list+counts | duration 30/60/120 | — | Y | — | — |
| | `fokus` | Y weakest-first | inherits Sprint | implicit | Y | — | — |
| | `angka` | — | **—** | — | Y | — | — |
| | `jebak` | type, not category | **—** | — | Y | — | — |
| | `mirip` | type, not category | **—** | — | Y | — | — |
| | `produksi` | **—** | `QUIZ_COUNTS`+All | — | Y | Y | — |
| | `kuisprod` | **—** | `QUIZ_COUNTS`+All | — | Y | Y | — |
| | `dengar` | **—** | `QUIZ_COUNTS` | — | Y | **not passed** | — |
| Ujian | `jac` | topic (8) | per-set | Y ⚠ Lemah | Y | Y | — |
| | `wayground` | — (per set) | per-set | Y Ulang N | Y | — | — |
| | `vocab` | — (per set) | per-set | **—** | Y | Y | — |
| | `simulasi` | source+preset | preset | — | Y | — | **no** |
| Ulasan | `ulasan` | — (SRS queue) | due today | n/a | Y | Y | — |
| Alat | `stats`/`ekspor`/`sumber` | n/a | n/a | n/a | n/a | n/a | n/a |

### ☐ 75. `kartu` is the only content mode absent from its own statistics — `S` — `P1`

Across the whole prop map, **every** study mode is handed `onSessionEnd` or `onFinish` except
`kartu` (`ModeRouter.jsx:189-200`), which gets neither. So `progress.sessions` — what `StatsMode`,
`session-analytics.js` and the heatmap read — has never seen a minute of flashcard study. The
streak still advances (via `handleMark` → `advanceStudyDay`), so nothing is lost; the most-opened
mode in the app simply does not appear on its own stats page.

Needs a shape decision first: `kartu` has no session boundary — when is it "done"? Per N cards
rated, or on mode exit. Don't guess.

### ☐ 76. `audioEnabled` is distributed with no rule, and `speakOnFlip` is dead in Kartu — `M` — `P1`

Three findings, one root cause: nothing owns the question "which modes speak?".

1. **The listening mode is not handed the audio setting.** `dengar` is absent from the
   `audioEnabled` recipients (`ModeRouter.jsx:255-262`), and `DengarMode.jsx` never reads
   `prefs.audioEnabled` — only `canSpeak()` (`:52`). Meanwhile two *typing* modes (`produksi`,
   `kuisprod`) do get it. Turning audio off in Saya therefore does not silence the one mode built
   entirely on audio. This needs a decision rather than a patch: it may well be correct for Dengar
   to ignore the setting (obeying it makes the mode useless) — in which case the setting should
   say so.
2. **`prefs.speakOnFlip` does nothing in Kartu.** `SayaTab.jsx:541` labels it
   **"👆 Saat balik kartu"**. Its only reader is `ReviewMode.jsx:78,94`. `kartu` receives no
   `audioEnabled` and never calls `speakJP()`.
3. Receiving it: `kuis`, `jac`, `vocab`, `produksi`, `kuisprod`. Not: `kartu`, `sprint`,
   `wayground`, `dengar`, `angka`, `jebak`, `mirip`, `simulasi`.

### ☐ 77. Three differently-shaped category pickers, plus five copies of `pillStyle` — `M` — `P2`

Straight continuation of §1's through-line. Category selection is written three times:

| Where | Shape | Shows counts? |
|---|---|---|
| `QuizMode.jsx:64-70, 370-400` | chips, `['all', ...keys]` — raw key for non-`all` | no |
| `SprintMode.jsx:57-70, 212-246` | list rows, `{key,label,emoji}` objects | yes |
| `GlossaryMode.jsx:50-54, 262-285` | emoji chips from `getCatsForTrack` | active one only |

`FilterPopup` (item 55) is now a fourth — but a shared component in `src/components/`, which is
the direction the other three should collapse toward rather than another local variant.

And `pillStyle(on)` — identical body — is copied at `QuizMode.jsx:157`, `ProductionMode.jsx:176`,
`QuizProduksiMode.jsx:170`, `JACMode.jsx:177`, `WaygroundMode.jsx:171`, plus fully-inline chip
variants in `DangerMode.jsx:79-101`, `ConfusionMode.jsx:126-148`, `CatatanMode.jsx:274-291`,
`SprintMode.jsx:184-208`. `modes.module.css` already has `.pill` (`:272`) that none of them use.

### ☑ 78. Simulasi loses the entire exam on reload — `M` — `P1` — **done 2026-09-04**

**Shipped.** `SimulasiMode` now snapshots to `sessionStorage` on every answer, page change and
pause (`ssw-simulasi-progress` + `ssw-simulasi-questions`), and offers the exam back on the start
screen. The drawn question list is saved with it: both sources shuffle, and the options inside each
question are shuffled too, so restoring "question 7, answer B" against a fresh draw would restore
the position into a different exam. The deadline is stored absolute, so a reload three minutes
later comes back with three fewer minutes rather than a refilled clock — and an exam whose time ran
out while the tab was closed resumes straight into its own scoring. `readQuizSnapshot` grew an
optional staleness ceiling for this: its 30-minute default is shorter than the 100-minute exam it
was being asked to hold.

`jac`, `wayground` and `vocab` now pass `persistKey` too, through a shared `useQuizResume` hook
and a shared `ResumePrompt` component rather than a fourth copy of QuizMode's inline version. Doing
that turned up item 85 below, which was the more serious bug of the two.

**Original finding:** Item 51 (☑) gave `QuizShell` session persistence, but behind
an opt-in `persistKey` prop (`QuizShell.jsx:36`, `:55`) — and only `kuis` passes it
(`QuizMode.jsx:442`). `wayground`, `vocab` and `jac` call the same shell without it, so the
capability exists and is switched off.

`simulasi` is the worst case: it does not use `QuizShell` at all, and `SimulasiMode.jsx` touches
storage zero times (no `storageGet`/`storageSet`/`sessionStorage`) — for a **timed 40–60 question
mock exam** that goes to the trouble of registering
`useExitGuard(phase === 'playing' ? confirmDiscard : null)` (`:417`), the only mode in the app
that does. So it knows this session is expensive to lose, and guards only the in-app back button —
not a reload, a crash, or the OS reclaiming the tab on the cheap Android phones this is designed
for.

### ☐ 79. "Wrong-only" and "retry wrong" are both inconsistent, in different ways — `S` — `P2`

Pre-session wrong-only filters exist in `kuis` (`QuizMode.jsx:34,318-345`), `jac`
(`JACMode.jsx:348-365`), `wayground` (`WaygroundMode.jsx:434-458`). Absent from `vocab`,
`produksi`, `kuisprod`, `dengar`, `angka`, `mirip` — though `vocab` writes `progress.vocabWrong`
exactly as `wayground` writes `wgWrong`.

The post-session `onRetryWrong` bridge is lopsided differently: handed to `kuis`, `jac`,
`wayground`, `vocab`, `simulasi`, `produksi`, `kuisprod`, `dengar` — **not** to `sprint`, `angka`,
`jebak`, `mirip` (`ModeRouter.jsx:216-269`), all four of which record wrong answers
(`SprintMode.jsx:137-142`, and `recordWrong` in the others). The mistakes are stored; there is no
route back to them from the results screen.

`kartu` has the same idea under another name and another data source — the "Belum" button
(`ToolStrip.jsx:41-50`) reads `unknown`, not `quizWrong`.

### ☐ 80. Count and auto-advance options are distributed arbitrarily — `S` — `P2`

- `QUIZ_COUNTS = [10,20,30]` (`utils/constants.js:22`) is used by `kuis`, `dengar`, `produksi`,
  `kuisprod`. `angka`, `jebak` and `mirip` have **no length control at all** — always the whole
  shuffled pool, with no way to take a short session. (`kartu` likewise; see item 75, which has to
  define "a flashcard session" first.)
- **Auto-advance delay**: exposed by `kuis` (`QuizMode.jsx:35,362`) and `jac` (`JACMode.jsx:171`).
  `wayground` (`:153-161`) and `vocab` (`:93-103`) call the same `QuizShell` **without**
  `autoNextDelay`, so they are pinned to its 2000 ms default (`QuizShell.jsx:34`). Same screen,
  same shell; the control is present in two of the four and absent in the others.

Check against item 49 (☑, "Question-count options differ per mode with no rationale") before
building — some of this may be leftover scope, some may be regression.

### ☐ 81. `produksi` and `kuisprod` are ~500-line twins — `M` — `P2`

`ProductionMode.jsx` (531 lines) and `QuizProduksiMode.jsx` (500) share the start screen, the
`pillStyle` copy (`:176` / `:170`), `HowToPlayCard`, the count picker (`:219-234` in both) and the
state shape (`started/count/queue/idx/input/phase/results/sessionFired`, `:77-84` / `:76-83`).
They differ in exactly two places: direction (ID→JP vs JP→ID) and `isCorrect` (`:32-47` matching
JP/stripFuri/kana vs `:37-46` matching `id_text` synonyms). The clearest
one-component-with-a-direction-prop candidate in the codebase.

### Checked, not a bug

- No mode exposes a JP↔ID direction toggle; direction is chosen by *which mode you open*. That is
  consistent design, not a gap — and item 81 does not change it, only the code behind it.
- Shuffle is unconditional everywhere and does not need to become an option.
- `sprint` deliberately does not use `ResultScreen`, with the reasoning recorded in
  `SprintMode.jsx:259`. Don't "fix" it into using one.
- `glosari`, `cari`, `catatan`, `stats`, `ekspor`, `sumber` get no `onSessionEnd` and shouldn't —
  all are reading or tooling surfaces, not study sessions.

---

## 14. Exam family audit — `simulasi`, `jac`, `wayground`, `vocab` (2026-09-04)

Requested: "analisa mode simulasi dan mode lain yang berhubungan dengannya — jangan berasumsi
apa pun, list semua gap dan fitur yang belum ada." Scope is the whole Ujian section plus the
machinery those four modes share: `QuizShell`, `ResultScreen`, `quiz-persistence`,
`quiz-classification`, `simulasi-scoring`, `session-analytics`, `recommend-mode`, `achievements`,
and the prop map in `ModeRouter`.

Every finding below was read out of the code, and the numbers were measured rather than estimated
(the measuring scripts are one-off, run against `src/data/` directly). Owner decisions taken during
this session: **2 minutes per question is the correct exam rate** (which made `angka-kunci`'s
90-second entry the wrong one), and **fix everything that is clearly a bug**, which is what items
82–92 record.

### Where the exam family stood

| | `simulasi` | `jac` | `wayground` | `vocab` |
|---|---|---|---|---|
| Shell | bespoke | `QuizShell` | `QuizShell` | `QuizShell` |
| Survives reload | no → **yes** | no → **yes** | no → **yes** | no → **yes** |
| Retry-wrong → kartu | wrong ids → **fixed** | dead → **fixed** | never wired | impossible (no data) |
| Wrong answers recorded | **no** (item 93) | `wrongCounts` | `wgWrong` | `vocabWrong` |
| Wrong-only replay | no | ⚠ Lemah | ⚠ Ulang N | **no** (item 79) |
| Keyboard | **none** (item 95) | 1–4 · Space · Esc | same | same |
| Auto-advance control | n/a | 4 options | **locked 2 s** (item 80) | **locked 2 s** (item 80) |
| Audio | no | yes | **no** | yes |
| Score history | **none** (item 94) | `jacScores` | `wgScores` | `vocabScores` |

---

### ☑ 82. The exit guard was honoured by one of five routes out of a mode — `M` — `P0` — **fixed**

`AppContext`'s own comment: "every route out of the mode area awaits it first and aborts if it
returns false." Only `goBack` — the header's back arrow — ever did.

- **Escape** (`GlobalKeyboardLayer.jsx:50`) called `exitMode()` directly, and `exitMode` *clears*
  the guard on its way out. One keypress discarded a 100-minute exam with no prompt.
- **The hardware/browser back button**: the `popstate` handler never looked at the guard. On a
  phone this *is* the back button, which makes it the most expensive of the five.
- **`goTab` and `goMode`**: `SideNav` stays on screen on desktop while a mode is open, so a click
  on any tab or any other mode left silently.

Fixed by hoisting `exitGuardRef` above the navigation callbacks and routing all of them through one
`runGuarded` helper, which stays fully synchronous when no guard is registered — the common case,
and what existing callers and tests expect. `popstate` is the interesting one: the browser has
already moved by the time it fires, so the veto re-pushes the entry the app was parked on before
asking, and an allow re-applies the press with `history.back()`. A mode's own exit button keeps
calling `exitMode` directly: it has already asked, and routing it through the guard would ask the
same question twice. Pinned by `tests/exit-guard-routes.test.jsx` (8 tests). Verified in Chromium:
Escape and browser-back both raise the confirmation and leave the exam on screen.

A reload still cannot be intercepted usefully, which is what item 78's snapshot is for.

### ☑ 83. Every answer restarted the exam clock — `S` — `P0` — **fixed**

The countdown was a counter decremented by a `setInterval` whose effect listed `finishExam` in its
dependencies — and `finishExam` depends on `answers`. So **every single answer tore the interval
down and started a fresh one**, discarding that second's elapsed time. Fifty answers bought roughly
fifty free seconds; changing answers bought more; a fast run through the paper could stall the
clock almost entirely. The same effect meant a backgrounded tab lost whatever the browser's timer
throttling did not fire.

Now a deadline: `deadlineRef` holds the wall-clock instant the exam ends and each tick derives the
remainder from it, so it cannot drift, cannot be gamed by answering, survives throttling, and is
the one number a resumed exam needs. Pausing freezes the remainder and resuming re-derives the
deadline from it. `tests/simulasi-timer.test.jsx` pins all three.

### ☑ 84. "Latih N Salah" sent you to unrelated flashcards — `S` — `P0` — **fixed**

`SimulasiMode.jsx:572` passed `wrongList.map((_, i) => i)` — *positions in the wrong-answer list* —
to a prop that `ModeRouter` turns into `goMode('kartu', { filterIds: ids })`, matched against card
ids. Card ids run 1..1443, so one wrong answer sent you to an empty deck (id 0 matches nothing) and
twenty sent you to cards 1..19: real flashcards, none of them related to anything you got wrong.

The fix needed data, not just arithmetic: `buildJacPool` was dropping `related_card_id`, which
**all 95** JAC_OFFICIAL questions carry. It now flows through as `_cardId`. No question in
`QUIZ_SETS` has one (checked: 0 of 980), so a pure Teori & Praktik exam has nothing to offer here
and the button hides rather than lying.

### ☑ 85. Answering re-drew the live question list — `M` — `P0` — **fixed**

Found while wiring item 78 into `jac` and `wayground`, and the worst thing in this audit.

In both modes the question list was a `useMemo` whose dependency array included the wrong-answer
tally those same modes write to on every wrong answer (`WaygroundMode.jsx:115`,
`JACMode.jsx:71`). Answering wrongly recomputed the memo, re-ran `shuffle()`, and **replaced the
question on screen with a different one** — while `QuizShell` was still showing the ✓/✗ badges and
the explanation belonging to the question just answered. Reproduced before fixing; the probe's own
output: `5S活動の最初の「整理」とは何をするか？` became `KY活動の4ステップで最初に行うことは？` on the
answer click. In JAC's ⚠ Lemah mode it is worse still — the list is *filtered* by that tally, so a
wrong answer grows the list you are working through.

Both modes now draw their list once, into state, when a set is opened. That is also what makes a
session restorable, so the two fixes are the same change. `tests/quiz-list-stability.test.jsx`.

### ☑ 86. Retry-wrong was dead in three of the four exam modes — `S` — `P1` — **fixed**

`QuizShell` can only offer "Latih N salah" (and `ResultScreen`'s "Latih ⟨kategori⟩") when its
results carry `_cardId`. `JACMode`, `WaygroundMode` and `VocabMode` all set `_qId` and never
`_cardId`, so the button never rendered — while the prop map handed `jac` and `vocab` a working
`onRetryWrong`, and `WaygroundMode` never forwarded the prop to the shell at all. From the prop map
alone all three read as having the feature.

`jac` now works (its data has the links). `wayground` and `vocab` cannot until their questions get
card links — a content job, item 96 — so their dead wiring is removed and says why, rather than
looking like a feature that works.

### ☑ 87. 22.6% of full exams contained the same question twice — `S` — `P1` — **fixed**

`QUIZ_SETS` holds 740 teori/praktik questions but only **688 distinct** ones: 41 teori and 9
praktik questions appear in two sets each, mostly where a Wayground set and a JAC-Mockup set cover
the same ground (the KY活動 four-step questions live in `wt01`, `wt06`, `jmt01` and `jmt02`).
`buildQuizSetsPool` did not deduplicate, so sampling 30+20 drew a repeat in **22.6%** of full
exams — 6.2% at 25 questions, 2.1% at 15 (measured over 20 000 simulated draws each). A repeated
question is the most obviously "not a real exam" thing this mode can do.

Deduplicated by question text at pool build. Deliberately **not** applied to `buildJacPool`: 学科
Set 1 and 実技 Set 1 share exactly one question, but the owner's rule for JAC Official is "take
everything in both sets" (2026-08-28) and its 44/51 totals are a stated contract — official content
repeating across two official sets is the book's own doing.

### ☑ 88. The app contradicted itself about how long the exam is — `S` — `P1` — **fixed**

`data/angka-kunci.js` taught, as a memorisable exam fact, **"90 detik/soal — Estimasi waktu
Prometric (50 soal ÷ 75 mnt)"**. `SimulasiMode.jsx:59` used **2 minutes per question** (50 questions
= 100 minutes), with a comment claiming that matched the real JAC convention. Both described the
same exam and disagreed by 33%, and one of them was being drilled into users as a number to
memorise.

Owner ruled 2 min/question correct, so the `angka-kunci` entry was the wrong one and is now
`2 menit/soal`. The rate lives in `utils/constants.js` as `EXAM_SECONDS_PER_QUESTION` so the mode
and the data that teaches the number cannot drift apart again. `docs/CARD_CONTENT_SPEC.md` follows
the rename.

### ☑ 89. The instructions card described behaviour removed in item 48 — `XS` — `P2` — **fixed**

"🚫 Soal otomatis lanjut setelah kamu jawab" — item 48 removed auto-advance, and navigation has
been explicit ever since. The one card whose job is to state the rules was the last thing still
describing the old ones. Replaced with what the mode actually does, including that blanks count as
wrong (which it enforces, and never said up front).

### ☑ 90. Session durations accumulated across replays — `S` — `P2` — **fixed**

`useSessionTimer` measures from component mount and **nothing in the app ever called its
`reset()`**. So a second run via 🔄 Ulang reported its own duration plus the first run's plus the
time spent on the results screen in between — inflating study minutes and the heatmap for exactly
the users who replay, which the button exists to encourage. `QuizShell.handleRestart` now resets it.
`SimulasiMode` no longer uses the hook at all: its duration is `budget − remaining`, which is the
exam's own elapsed time and excludes both the preset-picking and any pauses.

### ☑ 91. One rule, three copies — `XS` — `P2` — **fixed**

The 65% pass mark existed as a bare `65` in `SimulasiMode` (the LULUS banner), `achievements.js`
(the "Siap Ujian" badge) and `recommend-mode.js` (the "needs more practice" gate) — three copies
that must agree, and the failure mode is a badge saying *Siap Ujian* while the exam screen says
*BELUM LULUS*. Now `EXAM_PASS_PCT`. Separately, `recommend-mode.js` reimplemented `getBestSimScore`
inline, character for character, directly beside its own import of `getAvgAccuracy` from the module
that exports it.

### ☑ 92. The results breakdown had no meaningful sample sizes — `S` — `P2` — **fixed**

"Breakdown per Set" on a 50-question pool exam is ~34 buckets of one or two questions each, which
says nothing about anything. The axis the exam is actually sampled on — 30 teori / 20 praktik —
was available and thrown away: `buildQuizSetsPool` tagged every question `_category`, and the
question mapper dropped it. Carried through now, with a teori/praktik breakdown above the per-set
one (and the row markup extracted rather than copied for the second list).

---

### ☐ 93. A wrong answer in the exam teaches the app nothing — `S` — `P1`

`simulasi` writes to no wrong-tracker at all — not `quizWrong`, not `wrongCounts`, not `wgWrong`,
not `vocabWrong`. Every other quiz mode records its mistakes, and three surfaces read them: JAC's
⚠ Lemah, Wayground's ⚠ Ulang N, and `FokusMode`'s weakest-category drill. So the single longest,
most diagnostic session in the app — 50 questions under time pressure — is also the only one whose
mistakes leave no trace once the results screen is closed.

Needs a decision on *where* they go before it can be built: `simulasi` draws from two pools with
two different id spaces (JAC question ids like `tt1_q01`, and `QUIZ_SETS` questions whose ids are
only unique within their set), so this is not a one-line write.

### ☐ 94. The exam keeps no history of itself — `S` — `P2`

`jac`, `wayground` and `vocab` each call `saveScore` and show past scores and personal bests on
their own start screens. `simulasi` never calls it, so there is no attempt history, no best score,
no "last time you got 58%" — for the one mode where a trend is the entire point of taking it twice.

Blocked on a related trap: `saveScore`'s key mapping is
`type === 'jac' ? 'jacScores' : type === 'wg' ? 'wgScores' : 'vocabScores'`
(`ProgressContext.jsx:156`) — any unrecognised type silently writes into `vocabScores`. No current
caller does, but adding a `sim` type without touching that ternary would corrupt vocab's scores
rather than fail.

### ☐ 95. `simulasi` has no keyboard support and thin screen-reader support — `M` — `P2`

`QuizShell` gives every other quiz mode `useQuizKeyboard` (1–4 to answer, Space/→ to advance, Esc
to leave), an `aria-live` "Soal X dari Y", and `QuizAnnouncer` for answer feedback. `simulasi`
builds its own playing screen and has none of it: no shortcuts at all, and no live region, so the
question counter and the countdown change silently.

Its question navigator compounds this: one button per question, in document order **before** the
Prev/Next row and the Kumpulkan button. On a 51-question JAC exam a keyboard or switch user tabs
through 51 buttons to reach "submit". Needs a design call (reorder, or a skip link), which is why
it is not in the fixed list above.

### ☐ 96. `QUIZ_SETS` questions have no link to the cards that teach them — `L` — `P2`

0 of 980 questions in `QUIZ_SETS` carry a `related_card_id`; all 95 in `JAC_OFFICIAL` do. That gap
is what makes retry-wrong impossible in `wayground` and `vocab` (item 86), keeps `ResultScreen`'s
"Latih ⟨kategori⟩" dark there, and blocks any SRS bridge from those modes. It is a content task —
980 links, presumably semi-automatable from the question text against the card corpus — not a code
one, and it should be sized honestly before anyone starts.

### ☐ 97. "Best simulasi score" does not know how long the exam was — `S` — `P1`

`recordSession` stores `{mode, correct, total, durationMs, date}` and nothing else, so a 15-question
Latihan Cepat and a 50-question Ujian Penuh are both just `mode: 'simulasi'`. `getBestSimScore`
takes the max percentage across them, and two things consume it: the **"Siap Ujian" badge** and the
readiness advice on the dashboard ("Skor simulasi X% — perlu latihan lebih sebelum ujian").

So the exam-readiness signal this app exists to produce can be earned on a 15-question practice
run — the shortest, easiest thing in the section. Fixing it means recording the preset alongside
the session, which is a `progress.sessions` shape change and therefore a storage-version decision.

### ☐ 98. JAC Official's short presets have no teori/praktik ratio — `S` — `P2`

The Teori & Praktik pool samples an exact 60/40 (9+6, 15+10, 30+20). JAC Official draws one random
teori set + one random praktik set and then, for Latihan Cepat and Setengah Ujian, takes a plain
shuffled slice — so the composition is whatever chance gives. Measured over 20 000 draws of the
15-question preset: **0 to 11 praktik questions**, mean 4.8, and 0.11% of runs contain no praktik
question at all. Either that variance is intended (it is a random draw from an official book) or
the same ratio rule should apply; the code states no view. Owner's "biar keliatan kyk random"
covers the *set pair*, not the slice within it.

### ☐ 99. The exam cannot show the pictures the exam has — `S` — `P3`

12 of the 95 JAC questions carry a `photoDesc`, and both `simulasi` and `QuizShell` render it as
text ("📷 Soal asli pakai foto"). Reading a description of a diagram is not answering a question
about a diagram, and these are 実技 questions where the picture is often the question. Nothing to
fix in code until the images exist; worth recording as a known fidelity limit, and as a reason not
to read a praktik sub-score too confidently.

### ☐ 100. The results screen only shows what you got wrong, and only partly — `S` — `P3`

Explanations are truncated at 160 characters with no way to expand (`ResultScreen` does the same at
180). Correct answers cannot be reviewed at all, so a lucky guess is indistinguishable from
knowledge. And review entries carry no question number, so an item cannot be matched back to the
navigator. Small, but this screen is the entire payload of a 100-minute session.

### ☐ 101. No way to flag a question and come back to it — `S` — `P3`

The navigator distinguishes answered from unanswered, which is most of the way there. Real exams —
including the Prometric delivery this simulates — let you mark a question you want to revisit,
which is exactly the behaviour a 100-minute paper rewards. `answers` is already a dict keyed by
index, so a parallel `flagged` set is the whole feature.

### ☐ 102. Small honesty gaps in the exam family's labels — `XS` — `P3`

- The source picker says "JAC Official — Soal resmi dari buku ujian JAC (95 soal)", but no preset
  ever draws from all 95: every start picks one teori + one praktik set (44 or 51).
- `MODE_META.simulasi.desc` is `'Ujian + timer'` while its section siblings derive real counts from
  the data (`MODE_COUNTS`), which exists precisely because hand-written counts had gone stale.
- `wayground` (740 questions, the largest bank in the app) and `vocab` are absent from
  `MISSION_TYPES` in `daily-mission.js` with no stated reason, while `kuisprod` and `mirip` are in.
  `simulasi`'s absence is self-evident; theirs is not.

---

### Checked, not a bug

- **`progress.wrongCounts` holds two id spaces.** `schema.js` documents it as `{ [cardId]: count }`
  and the v1 migration folds a legacy card-keyed map into it, while `JACMode` writes JAC question
  ids into the same object. No collision: JAC ids are strings (`tt1_q01`), card ids are numbers, and
  `lemahCount` only ever looks up JAC ids. The schema comment is now inaccurate; the behaviour is
  fine.
- **`simulasi` does not use `ResultScreen`.** Deliberate (item 46): a pass/fail banner against a
  threshold is not a generic score screen.
- **Deferred scoring and neutral option buttons.** Deliberate (item 48) — an exam simulation must
  not reveal correctness mid-exam, and `haptic.tap()` is used rather than `.correct()`/`.wrong()`
  precisely because the haptic would leak the answer.
- **Pausing has no time limit.** Offered on purpose, and the clock genuinely stops; someone who
  wants to cheat a practice exam does not need the pause button to do it.
- **`simulasi` receives no `audioEnabled`.** Correct for an exam, though item 76 still stands: no
  rule says which modes get it, which is why `dengar` — built entirely on audio — also does not.
- **Furigana on the question but never on the options.** `JpFront` honours `furiganaPolicy` for the
  question stem while options always go through `stripFuri`, in every mode. Inconsistent, but it is
  the whole app's convention, not this family's bug — and options render as plain text everywhere.
