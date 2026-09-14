# Provenance — where this repository's content comes from

`LICENSE` covers the **software**: the application code, build scripts, tests and
documentation authored here, under MIT.

It does not settle the **content**. This app teaches from several corpora with
different origins, and lumping them under one licence statement would be a claim
nobody has checked. This file says which is which.

> **This file records the position; it does not resolve it.** Whether third-party
> exam material should sit in a public repository at all is an open decision for
> the repository owner, recorded in `HANDOFF.md`. Adding this file does not close
> that question — it makes it legible.

---

## Original to this project — covered by `LICENSE`

| What | Where | Note |
|---|---|---|
| Application code, tests, build scripts | `src/`, `scripts/`, config | MIT, as `LICENSE`. |
| **現場日本語 phrase corpus** — 84 spoken-register phrases | `src/data/genba-phrases.js` | Authored for this project (7.5.0, item 103) to fill a measured gap: the 1,418-card deck contained 3 imperative/request sentences. |
| **Skenario scenes** — six multi-beat site conversations | `src/data/genba-scenes.js` | Authored for this project (7.5.0, item 105). |
| Confusion pairs, danger pairs, angka-kunci | `src/data/confusion-pairs.js`, `danger-pairs.js`, `angka-kunci.js` | Compiled for this project from the deck's own material. |
| UI copy, about/help text, release notes | `src/data/about-content.js`, `release-notes.js` | Authored here. |
| Generated icon and badge art | `public/icons/` | Generated for this project; prompts in `docs/ASSET-PROMPTS.md`. |
| Onboarding illustration | `public/illustrations/` | Generated for this project. |

## Third-party — NOT covered by `LICENSE`

| What | Where | Status |
|---|---|---|
| **JAC Official sample questions** (95) | `src/data/jac-official.js` | Published sample questions for the 建設分野特定技能1号評価試験. Reproduced here for study. Rights belong to their publisher; **redistribution status unsettled**. |
| **JAC Official question images** (12) | `public/images/jac-official/` | Clip renders of the source PDF pages, including the exam's own masking of labels and credits (7.4.0, item 99). Same status as above. |
| **Wayground question banks** (680) | `src/data/wayground-sets.js` | Third-party practice material. **Redistribution status unsettled.** |
| **JAC Mockup sets** (300) | `src/data/jac-mockup-sets.js` | Third-party practice material. **Redistribution status unsettled.** |
| **Flashcard deck** (1,626 cards) | `src/data/source/`, generated into `cards.js` | Compiled here, but the terminology and many definitions derive from the published exam syllabus and study material. Treat as mixed. |

## Third-party — licensed, and the licence ships with it

| What | Where | Licence |
|---|---|---|
| DM Sans, Syne, Noto Sans JP (subsetted) | `public/fonts/` | SIL Open Font License 1.1 — full text in `public/fonts/LICENSE.txt`. Subsetting is explicitly permitted. |
| `react`, `react-dom` | npm | MIT |
| `ts-fsrs` | npm | MIT |
| `lz-string` | npm | MIT |

---

## If you are reusing something from here

- **Code** — MIT, go ahead, keep the notice.
- **`genba-phrases.js` / `genba-scenes.js`** — original to this project and MIT with
  the rest of the repository. These are the two corpora with no third-party question
  attached to them.
- **Anything in the "Third-party" table** — do not assume you may redistribute it.
  Check with the rights holder.

## For maintainers

When you add a corpus, add a row. A content file whose origin nobody recorded
becomes a content file whose origin nobody can reconstruct — which is the state
this file was written to end, and the reason it lists the unsettled items by name
rather than quietly omitting them.
