# UI/UX Plan — quiz, exam & furigana consistency (2026-08-25)

> **Work queue, not a spec.** Items retire as they land; this file goes to `docs/archive/`
> when empty. The previous plan (items 1–42, the 2026-08 overhaul) completed 2026-08-25 and
> lives at `docs/archive/UI_UX_PLAN-2026-08-overhaul.md`.
>
> **Numbering starts at 43** deliberately — so "item 15" in a commit message unambiguously
> means the archived plan, and nothing here collides with git history.

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

### ☐ 47. Quiz feature parity: the matrix is arbitrary — `L`

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

### ☐ 48. `SimulasiMode` doesn't behave like the exam it simulates — `M`

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

### ☐ 61. Fonts come from a third-party CDN the app can't guarantee — `M`

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

### ☐ 62. `PRECACHE_URLS` has 2 entries; 21 lazy chunks aren't among them — `M`

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

### ☐ 63. `GlossaryMode`'s A–Z jump bar is a 28×28px tap target — `S`

**Verified** (`GlossaryMode.module.css:96–100`): `.azBtn` sets `min-width: 28px; height: 28px`
explicitly. The project's own `--tap-min` token exists for this and isn't used here. 28px against
a 44px guideline, on a control that is *by design* a row of small adjacent targets — the shape
most likely to be mis-tapped, on a construction worker's phone, possibly with gloves.

Narrow, real, and cheap. See §6 for why this is the *only* tap-target item.

---

### ☐ 64. `--ssw-onAmber` exists; 21 sites hardcode `#fff` instead — `S` — `P2`

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

### ☐ 51. A crash or reload mid-quiz loses every answer — `M`
*(archived item 19's finding; out of that item's scope)* `QuizShell`'s `results` live in
`useState` and only persist via `onFinish` at `phase === 'finished'`. Shared by
`kuis`/`jac`/`vocab`/`wayground`; the hand-rolled modes are the same shape. On a cheap phone with
aggressive background-tab eviction — the actual target device — losing a 30-question session to a
tab reclaim is a genuine and repeatable loss. Item 38's error boundary now tells the truth about
this ("jawaban yang belum selesai mungkin tidak tersimpan") but doesn't fix it.
Consider: write-through to `sessionStorage` per answer, offer resume on re-entry.

### ☐ 52. In-app mode exit doesn't pop the history entry — `S`
*(archived item 10's known gap, documented in `AppContext.jsx`)* Exiting a mode via an in-app
control replaces rather than pops, so a subsequent hardware-back can need two presses. Needs a
way to distinguish "our own `history.back()`" from "user pressed back" — the reason it wasn't
solved then. Low user impact; listed so it isn't rediscovered as new.

### ☐ 53. `rem` conversion for the type scale — `L`
*(archived item 22's deferral)* Every `--fs-*` is `px`, so none respond to a user's OS/browser
font-size preference. Touches ~89 stylesheets and interacts with `em`-based ruby and
`jpFontSize()`'s own ladder. Genuine accessibility win for older users; genuinely large.

### ☐ 54. `speakJP()`'s `onError` is wired in one of six call sites — `S`
*(archived item 25's stated scope)* Only `DengarMode` reports a synthesis failure. The other five
(`QuizShell`, `ProductionMode`, `GlossaryMode`, `ReviewMode`, `QuizProduksiMode`) still fail
silently. Lower stakes there (audio is supplementary, not the exercise), which is why it was
scoped out — revisit if silent audio failure turns out to matter.

### ☐ 55. `FilterPopup` is archived but the capability is still missing — `M`
*(archived item 18)* A real category-picker with live counts, unwired because `FlashcardMode`'s
filter state is a single `__cat:` search string, not a multi-category set. Lives at
`legacy/unwired-app-code/`. Wiring it needs that state change first. `haptic.success()` is
likewise still defined and unused (archived item 21) — a first call site is a product decision.

---

## 6. P2/P3 — Approved enhancements (owner-approved 2026-08-25)

**All five approved by the owner** in one go, on the general principle that they improve the
project. Recording that as-stated, plus one honest caveat: a blanket yes is an approval of the
*idea*, and three of these still have a genuinely open **implementation-shape** question that the
proposal deliberately left unanswered. Those aren't reasons to delay — they're the first decision
each item needs, flagged so they get made rather than guessed at mid-build.

**Item 59 is the one to think hardest about, and it should not be built blind.** See its entry.

### ☐ 56. Exam-readiness estimate on the dashboard — `M` — `P2` — approved
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

### ☐ 60. Typed-answer leniency is invisible — `S` — `P2` — approved
`QuizProduksiMode` advertises "pencocokan fleksibel (huruf besar/kecil diabaikan)" but a learner
who types a *nearly* right answer is just told they're wrong. Showing the diff
("kamu: *keselamaton* · benar: *keselamatan*") turns a typo into a spelling lesson.
Check what the matcher actually tolerates before writing copy that promises more than it delivers.

---

## 7. Checked — not bugs

Recorded so these aren't re-investigated. Several came out of wave 2 specifically because the
first grep looked alarming and the actual code was fine — that gap between "grep count" and
"real problem" is the thing worth writing down.

- **`QuizShell` a11y** — correct. `sr-only` assertive region for answers, polite for progress.
  It's the model for item 45, not a target.
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

## 8. Audit status

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

## 10. Suggested order

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
