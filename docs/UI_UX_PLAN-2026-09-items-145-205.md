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

### 205 · Quiz→card linking, the medium tier — **OPEN, size L**

`npm run derive:quiz-links` regenerates the tiers; the script changes no data by design.

| Tier | Count | Meaning |
| --- | --- | --- |
| high | 303 | ≥4 characters in the stem. Applied in item 96. |
| **medium** | **222** | 3 characters in the stem, or ≥4 in the correct answer. *Probably* about it — and probably is not good enough to ship unread. |
| low | 375 | 2 characters anywhere. 安全 / 危険 / 作業 sit inside longer compounds constantly. |
| none | 80 | No headword in the corpus appears in the question at all. |

**The 80 no-match rows are a different finding and worth more than the links.** A question about
something the deck does not teach is a gap in the deck, not a linking problem. File them as a
content report before touching the medium tier.

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
