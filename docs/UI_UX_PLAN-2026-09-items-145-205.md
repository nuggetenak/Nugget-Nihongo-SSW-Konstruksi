# UI/UX plan — items 145–205 (opened 2026-09-14, 7.6.0)

**Status: items 145–196 are closed by 7.6.0. Items 197–205 are the live queue.**

This file exists because `docs/AGENT_WORKFLOW.md` §3 says a session that finds new work files it
deliberately rather than leaving it in a commit message, and because the numbering never restarts —
items 1–42 and 43–144 are archived and empty, so this picks up at 145.

---

## How this plan came about, and the one thing worth carrying forward

The session opened as "brief me on what's still open, and add animation throughout the UI". As of
7.5.1 the repo tracked **nothing**: both UI/UX plans archived and empty, no open issues, no open
PRs, no `TODO`/`FIXME` anywhere in `src/` or `scripts/`, no skipped tests in 136 test files. So
"what's open" had to be re-derived from the code.

It was not nothing. And the thing worth carrying into the next session is the *shape* of what turned
up, because it repeated in almost every part of the release:

> **A rule that is written down and not enforced drifts, and it drifts invisibly — because from
> inside any single file the code looks right.**

- `DESIGN_SPEC` §4 stated a timing policy since item 21. Measured in 7.5.1: one keyframe played at
  **six** different durations; tokens used in 49 places and bypassed in 77.
- `motion-scale.test.js` was written to stop exactly that, and missed four modes because it required
  the quote on the same line as the property.
- `motion-haptics.test.jsx` had **named** Angka and Danger since the day it was written and never
  rendered either one.
- `nav-a11y-residuals.test.jsx` compared two counts that happened to be equal for two cancelling
  wrong reasons.
- `_MAP.md` §3 carried a metrics table, formatted to look like ground truth, that was four releases
  stale under a banner saying it had been re-derived.
- `flashcard.module.css` declared `:global(.fc-card)`, which reads like a shared definition and is
  not one — it ships inside a lazy chunk, so Onboarding's "shared" flip measured `perspective: none`.
- FE-09-C's tab crossfade never crossfaded anything, and the test passed the whole time because it
  asserted the function was *called*.

None of those was caught by reading. Every one was caught by measuring, sweeping, or opening a
browser. That is the method this plan recommends to its successor, more than any individual item.

---

## Closed by 7.6.0 — items 145–196

Full reasoning lives in the commits; this is the index.

| Items | What |
| --- | --- |
| 145, 146, 149, 150 | The motion scale: one ladder through `--t-mult`, 77 literals converted, `T` exported for the fourteen `setTimeout`s that stand in for an animation, and the three separate reduced-motion failure modes |
| 147 | The tab crossfade that never crossfaded — `flushSync` inside the View Transition callback, plus the re-entrancy flag that one throw could strand |
| 148 | Exits. Every overlay entered and then vanished; `useExitTransition`, and the ordering rule that an animation may never delay an action the user took |
| 151, 152 | `Pengaturan Gerakan`: four presets, nine toggles, a speed dial, and one resolver |
| 153, 154 | The shared-element morph, and navigation that has direction and per-section character |
| 155–163, 165 | Signature motion: card physics, answer choreography, furigana, the split-flap countdown, counting numbers, the drawing ring and building heatmap, the celebration, the streak, the held-back skeleton, one flip |
| 164, 166–169 | Press feedback on thirteen stylesheets, list stagger, the accordion, the four zero-motion files, side-nav parity and the toast that follows the finger |
| 170–175 | Japanese text responding to Ukuran Teks, the dead `--fs-jp-primary`, the celebration overlay's keyboard behaviour, the breadcrumb tap target, four hand-rolled option buttons becoming one, and two new gates in `audit-css-vars.mjs` |
| 176–181, 184 | The docs, re-derived rather than edited — and `doc-references.test.js` extended from paths to numbers |
| 183, 196 | `ASSET-PROMPTS.md` §4b/§4c rewritten: ten icons (not nine, and not the fictional `ketik`), in two model dialects, plus the maskable PWA icon |
| 185–195, 197–204 | Part F: the write path, the storage-engine robustness cluster, the confirmed audit defects, CSP, `LICENSE` + `PROVENANCE.md` |

**Not done, and named rather than quietly dropped:**

- **Item 182 (quiz→card linking, medium tier).** 222 judgements, each requiring the question to be
  read against the card it would point at. Item 96's rule stands and is why it cannot be batched: *a
  link to a card that does not teach the answer is worse than no link.* Current tiers, re-derived
  2026-09-15: high 303 (applied), medium 222, low 375, none 80. Carried as item 205 below.
- **Item 155's throw-to-rate.** Refused rather than deferred — see item 205's note.
- **Item 157's per-character headword reveal.** Refused; the reason is at the call site in
  `src/components/JpDisplay.jsx`.

---

## The live queue — items 197–205

### 197–203 · The storage-engine cluster (landed in 7.6.0, kept here for the record)

All seven shipped with item 185 because they are the same file and fixing the write path without
them would have widened 197's window. Listed in the closed table above; the numbers are retained so
nothing renumbers them.

### 204 · `package-lock.json` version drift

Closed by the 7.6.0 bump. The close-out checklist in `PWA_RELEASE_SPEC.md` names the lock file
alongside `package.json` and `public/sw.js` now, which is the part that stops it recurring.

---

### 205 · Quiz→card linking — **medium tier and the matcher done; the low tier remains, size L**

`npm run derive:quiz-links` regenerates the tiers; the script changes no data by design.

Coverage: **305 of 980 (31.1%) → 468 (47.8%) in 7.6.0 → 539 (55.0%) after the matcher pass.**

The tiers below are the deriver's own, re-run against the 441 questions that are still unlinked.
`answer` and `definition` did not exist before the matcher pass; `high` and `medium` are what item
96 and 7.6.0 already closed, so they read empty or near it.

| Tier | Count | Status |
| --- | --- | --- |
| answer | 50 | The correct answer IS a card headword, whole. **All 50 read, all 50 applied.** |
| definition | 13 | The stem is 「Xの意味は…」 and X IS a card headword. **All 13 applied.** |
| high | 303 + 1 | ≥4 characters in the stem. Applied in item 96; normalisation found one more. |
| medium | 222 | All 222 read in 7.6.0: 156 applied, 66 rejected. 64 of those 66 still tier as medium; the other two moved under the new sort and were applied. |
| low | 305 | 2 characters anywhere. 安全 / 危険 / 作業 sit inside longer compounds constantly. **Untouched — this is what remains of item 205.** |
| ambiguous | 11 | New. 7 identity matches, all applied after a hand decision; 4 substring matches, all rejected on reading and now recorded as content gaps. |
| none | 68 | Was 80: 7 recovered in 7.6.0, 1 in the matcher pass, 4 reclassified as near-misses. The rest are `docs/QUIZ_CONTENT_GAPS.md`. |

**The medium tier is done.** Each of the 222 was read against the card it would point at, and the
rule that decided every one of them was: *does this card teach the ANSWER* — not does the headword
appear in the stem. Sixty-six were rejected on exactly that, and the clearest illustration is the
one that was already a defect: `wgl10#18` asks what you put over a wire to protect it (絶縁キャップ,
an insulation cap) and matched card 904 キャップ, the cap fitted to seal a *pipe* for a pressure
test. 7.5.1 fixed that same confusion on a different question. Five more were retargeted to a
better card than the script proposed, which reading finds and a script cannot: an asbestos
qualification question points at 石綿取り扱い作業者 rather than the generic 特別教育, and a question
about preventing electric shock points at 絶縁抵抗測定 rather than at 電動工具.

**The matcher was improved before the low tier was touched, and that turned out to be the whole
point.** The plan said reading 375 rows one by one was probably the wrong shape of work. It was
wrong for a sharper reason than "slow": the deriver was ranking proposals by **how long** the
matched headword was, when what decides a link is **what** the headword matched. A four-character
run inside a stem is a topic. A headword that IS the correct answer is the lesson.

Fifty unlinked questions had an answer that was, whole, a card headword — 温水管, 検電器, 朝礼 — and
not one reached a tier anyone would apply unread: **47 were filed `low` and 3 `medium`**, because
温水管 is three characters and the answer was only consulted at four. Forty-seven were sitting in
the tier whose own definition says it is "as often the wrong card as the right one", behind 375 rows
nobody could justify reading. **All fifty read correct.** Nothing needed to be read one by one; the
sort key was wrong.

Three smaller changes came from the failures `docs/QUIZ_CONTENT_GAPS.md` recorded, each fixed where
it was found rather than filed again:

- **The ambiguous set is surfaced, not dropped.** 41 headwords sit on more than one card. The
  deriver discarded them silently; three of the seven hand-recoveries in 7.6.0 came out of that
  discard. They now go to their own bucket carrying every candidate — 7 identity matches, each a
  five-second decision (`wgl04#1`'s サドル is the 配管 one, not the conduit one; `wgl10#1` wants the
  object, not card 309's three prohibitions), and 4 substring matches, all four rejected on reading
  and now sharper entries in the gaps file than they were as no-matches.
- **Text is normalised (NFKC, spaces and interpuncts dropped) before matching.** `EF ソケット`
  written with a space missed `EFソケット`: one space defeated the match. Recovers `wglv-jp-02#2`.
- **The identity tests reach the JP→ID questions nothing else could.** 「Xの意味は何ですか」 with
  an Indonesian answer carries no Japanese outside the stem, so no amount of reading the *answer*
  would ever have found them. 13 more.

**What is left is still the LOW tier**, now 305 rows, and the argument for not hand-reading it
stands. The lesson to carry: before reading a tier, check that the thing sorting it is measuring
the right property. One reordering was worth 71 links and four corrected gap entries.

---

### 206 · Letter-spacing bypasses its own scale — size M

Found while closing item 171. `--ls-tight` / `--ls-wide` / `--ls-label` had **one reader between
them** while **61 raw `letter-spacing` values across 29 distinct numbers** were spelled out by hand
in the stylesheets. Six of those were the tokens' exact values and now point at them; the rest do
not land on a rung.

This is the letter-spacing version of the "one keyframe, six speeds" drift item 146 unwound, and it
wants the same treatment — *with the same care*. Item 68's judgment applies: do not snap 24px to 26
without evidence the element wants the neighbouring token's size. The right move is probably to
widen the scale to fit what the app actually uses, rather than to force the app onto a scale that
was never derived from it.

---

### 207 · `router/modes.js` keeps mode metadata in four parallel objects — size M, filed not fixed

Its own header calls itself "the registry and the authority", and it is four objects that must be
kept in step by hand. Real, and not a bug a user hits today. Deliberately not absorbed into 7.6.0:
it would have turned a motion release into a router refactor.

### 208 · `ModeRouter.jsx` is a 364-line god object — size L, filed not fixed

Same reasoning. Note that 7.6.0 already took one thing out of it — `ModeHeader` moved up into
`App.jsx` (item 153), because a lazily-loaded router is the wrong place for the control that gets
you back out of a mode that has not loaded.

### 209 · No end-to-end browser smoke test in CI — size M, filed not fixed

**This one has the strongest evidence behind it of the three.** Four separate defects in 7.6.0 were
invisible to 1,400 passing tests and were found only by driving Chromium:

- the tab crossfade that never crossfaded (item 147),
- the CSP that silently refused the service-worker registration (item 189),
- the shared-element morph that produced only its outgoing half on a first entry (item 153),
- the "shared" flip that measured `perspective: none` because its rules were in a lazy chunk (165).

The harnesses that found them are throwaway scripts in a session scratchpad, driving the
pre-installed Chromium through `playwright-core` installed outside the project — so nothing was
added to `package.json` and nothing survives the session. Making one of them permanent is the
cheapest way to stop the next one of these shipping.

### 210 · The GitHub PAT for Gist sync sits in plaintext `localStorage` — size M, owner decision

Carried by two external audits across two rounds, unchanged. Not a defect with a local fix: any
browser-only app storing a token has this shape, and the alternatives (a backend, a short-lived
device flow) change what the app is. Recorded so it stops being re-found.

### 211 · Third-party exam content in a public tree — **open owner decision, not a task**

`LICENSE` and `PROVENANCE.md` landed in 7.6.0 and do exactly one thing: say which corpus came from
where, and which have an unsettled redistribution status. They do not resolve whether the JAC
Official set, its PDF page-renders, or the Wayground banks belong in a public repository. Recording
it is not closing it.

---

## Numbering

Next item is **212**. Never restart; the two archived plans and this one share one sequence, and a
commit message that says "item 96" has to keep meaning the same thing in five years.
