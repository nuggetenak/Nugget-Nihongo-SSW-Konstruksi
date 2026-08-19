# SSW Konstruksi — Data Quality Handoff v18

**Updated:** 2026-07-11 — session 23 (ADMIN: full resync — SESSION_PROMPT/HANDOFF were 10 commits / 2 sessions stale; PROGRESS.md was current and is the source these numbers were verified against)
**Supersedes:** v1–v17 (this is the canonical single-source handoff; v16 and v17 moved to `docs/archive/`)
**Scope:** ALL content files — cards + soal + pairs + angka
**Repo:** https://github.com/nuggetenak/Nugget-Nihongo-SSW-Konstruksi/
**Last commit (at sync time):** `81f7c8d` (CONTENT: P8a csv/ — hint+opts annotated; all sets 0 naked; integrity checks pass)
**Spec:** `docs/CARD_CONTENT_SPEC.md` — canonical schema, ruby rules, taxonomy, DQ task list

---

## ⚠️ STATUS SUMMARY — READ THIS FIRST

**Every currently-unblocked DQ task is done.** P0–P5, P7, P9, P14, P15, P8a are complete (P14/P15 finished session 22; P8a item 2 finished same session — this was the gap v17/SESSION_PROMPT hadn't caught up to). Every task still open needs one of three things, not more autonomous DQ grinding:

1. **Owner decision on OD-1 through OD-5** (unblocks P6, P16, P17, P8b, P10, P11, P12, P13 — i.e. most of what's left)
2. **Human/AGENT 12 judgment call** on a small named list of ambiguous items (EF接合 triple, 6 same-jp pairs, id=1240 source, ~64 post-compound ruby cases)
3. **Real JAC PDF source material** not yet available (P5 truncation repair, P21, PDF Viewer Mode)

See **"WHAT'S ACTUALLY NEXT"** near the end of this doc for the full breakdown. There is no item you can hand an agent right now with "just pick the first `[ ]`" — the first several `[ ]`s are all gated.

**New issue found during this sync (not yet fixed — flagging only):** 5 cards (`id=82,83,186,188,201`) have a corrupted `type` field in the `src/data/source/cards-*.js` mirror layer only — literal `\'vocab\'` (invalid JS: backslash outside any string) instead of `'vocab'`. `cards.js` has these 5 correctly as `"vocab"` already. Root cause: the P14 session-22 mirror-edit to `source/` introduced stray escaping for this one sub-batch. Trivial one-line-per-file fix, but it's a content-file edit, not admin, so it's documented here rather than applied. See §1D below.

---

## QUICK START FOR NEXT AGENT

1. Read the STATUS SUMMARY above and §"WHAT'S ACTUALLY NEXT"
2. Read `SESSION_PROMPT.md`
3. Read `PROGRESS.md` — if you find a `[ ]` task, check it isn't OD-gated before starting
4. Read `docs/CARD_CONTENT_SPEC.md` §8 for full task detail, §12 for Open Decisions
5. Work that task. Mark `[x]`. Update "Last updated" in PROGRESS.md. Commit. Push.

**ZERO EDITS TO MAIN BRANCH. content-dq only.**

---

## PART 0 — NAMING CONVENTION CANONICAL SPEC

### 0A. Track Values

| Track      | Meaning            | Indonesian | Japanese      |
| ---------- | ------------------ | ---------- | ------------- |
| `common`   | All tracks (Teori) | —          | 学科          |
| `lifeline` | ライフライン設備   | —          | 実技 Lifeline |
| `doboku`   | 土木               | Sipil      | 土木          |
| `kenchiku` | 建築               | Bangunan   | 建築          |

**Rule:** `track` field values are always the romaji column.

### 0B. Set ID Prefix Taxonomy (UPDATED v17 — adds jmt/jml/wglv-jp/wglv-id)

| Prefix         | Meaning                                               | Location                           |
| -------------- | ----------------------------------------------------- | ---------------------------------- |
| `wt{nn}`       | Wayground Teori (common)                              | `sets/wayground/teori/`            |
| `wtv{nn}`      | Wayground Vocab (common)                              | `sets/wayground/vocab/`            |
| `wgl{nn}`      | Wayground Lifeline Praktik                            | `sets/wayground/lifeline/praktik/` |
| `wglv-jp-{nn}` | Wayground Lifeline Vocab — JP→ID direction (post-P16) | `sets/wayground/lifeline/vocab/`   |
| `wglv-id-{nn}` | Wayground Lifeline Vocab — ID→JP direction (post-P16) | `sets/wayground/lifeline/vocab/`   |
| ~~`wglv{nn}`~~ | Legacy — to be split into wglv-jp/wglv-id via P16     | deprecated post-P16                |
| `jmt{n}`       | JAC Mockup Teori (common) — post-P17, ex-ct           | `sets/jac-mockup/`                 |
| `jml{n}`       | JAC Mockup Lifeline — post-P17, ex-cp                 | `sets/jac-mockup/`                 |
| ~~`ct{n}`~~    | Legacy CSV Teori — rename to jmt via P17              | deprecated post-P17                |
| ~~`cp{n}`~~    | Legacy CSV Lifeline — rename to jml via P17           | deprecated post-P17                |
| `doboku-{n}`   | Quiz Doboku                                           | `sets/quiz/doboku-*.js`            |
| `kenchiku-{n}` | Quiz Kenchiku                                         | `sets/quiz/kenchiku-*.js`          |
| `tt{n}_q{nn}`  | JAC Official Teori question ID                        | `sets/jac/jac-teori.js`            |
| `st{n}_q{nn}`  | JAC Official Lifeline question ID                     | `sets/jac/jac-lifeline.js`         |

### 0C–0E. (unchanged from v16)

Quote style: single-quote canonical. Source field values: unchanged — see §12A.
`furi` field: DEPRECATED — drop at merge time only. See `docs/CARD_CONTENT_SPEC.md` §1.1.

---

## PART 1 — CARDS

### Card Schema (canonical)

```js
{
  id,           // numeric — immutable after publish
  category,     // key → CATEGORIES
  source,       // 'jac-ch1' etc
  furi,         // DEPRECATED — drop at merge time
  jp,           // Japanese term with 《》 ruby
  type,         // 'konsep' | 'vocab' | 'hukum'
  id_text,      // Indonesian translation — frasa nominal
  desc,         // Indonesian explanation — wajib ending punct
  usage,        // [vocab only, optional] usage example sentence
  _origIndex,   // [source + split files only] stripped by merge script
}
```

See `docs/CARD_CONTENT_SPEC.md` §3–§4 for full field specs.

### 1A. Current State (re-verified programmatically 2026-07-11, session 23 — parsed `cards.js` + both `source/` mirrors directly with node, not copied from a prior session's claim)

| Track     | Cards     | konsep | vocab     | hukum  |
| --------- | --------- | ------ | --------- | ------ |
| common    | 877       | —      | —         | —      |
| lifeline  | 561       | —      | —         | —      |
| **TOTAL** | **1,438** | **97** | **1,244** | **97** |

Per-track type split wasn't re-derived this pass (would need a second script run against each `source/cards-*.js`, blocked by the §1D corruption below throwing a parse error on 3 of the 5 records in `cards-common.js` and both in `cards-lifeline.js` — see §1D). Total-level numbers above come from `cards.js`, which parses cleanly.

**Reconciling against session 22's own commit claims:** vocab=1,244 matches `bf2e12d` ("vocab coverage 100% (1244/1244)") exactly ✅. konsep=97 matches PROGRESS.md P14 ("konsep sisa 97") exactly ✅. hukum=97 is **+1 versus the 96 recorded in v17's 2026-05-16 snapshot** — no session log entry explains this delta (P14/P15 commits only describe konsep→vocab moves). Flagging as an open, low-stakes discrepancy rather than silently carrying either number forward; total (1,438) and the vocab/konsep figures are independently corroborated so this doesn't block anything.

Split files verified post-session 20: 1,438 ✅ (5 deleted: id=374,484,518,592,982) — total re-confirmed 2026-07-11.
Mirrors verified: cards.js ↔ cards-common.js + cards-lifeline.js ↔ split files — **ID counts** all 1,438 match ✅. **Content-level mirror is NOT fully clean** — see §1D, a new finding this pass.

### 1B. Known Issues — audited session 18, status updated session 20

| Finding                     | Count                                                   | Task    | Status                                          |
| --------------------------- | ------------------------------------------------------- | ------- | ----------------------------------------------- |
| Encoding corrupt desc       | 2 (id=476,773)                                          | P0-C1   | ✅ DONE                                         |
| Nested ruby 《A《B》》      | 12 (id=321,330,339,356,371,452,485,606,608,610,612,619) | P0-C2   | ✅ DONE                                         |
| jp tanpa ruby               | 62                                                      | P1      | ✅ DONE                                         |
| Katakana in ruby            | 18                                                      | P1      | ✅ DONE                                         |
| Naked kanji jp（）          | ~152                                                    | P1      | ✅ DONE (140 fixed; ~64 DEFERRED manual)        |
| Naked kanji desc            | 33                                                      | P2      | ✅ DONE                                         |
| id_text truncated `/`       | 41                                                      | P3      | ✅ DONE                                         |
| id_text multi-slash list    | 13                                                      | P3      | ✅ DONE                                         |
| Metadata fixes              | 6 (category/type/source)                                | P3      | ✅ DONE (id=1240 DEFERRED)                      |
| Duplicate cards             | 5 exact pairs                                           | P4      | ✅ DONE (deleted id=374,484,518,592,982)        |
| Duplicate id_text           | 26                                                      | P4      | ✅ DONE                                         |
| EF接合 triple               | id=459,612,613                                          | P4      | ⏸ DEFERRED — await AGENT 12                     |
| 6 ambiguous jp pairs        | see PROGRESS.md §P4                                     | P4      | ⏸ DEFERRED — await AGENT 12                     |
| desc truncated mid-word     | 213                                                     | P5-A    | ⏸ DEFERRED — need JAC source                    |
| desc missing period         | 266                                                     | P5-B    | ⏸ DEFERRED                                      |
| desc symbol-ending          | 82 total → 13 fixed                                     | P5-C    | ✅ DONE (13 fixed; 15 truly truncated DEFERRED) |
| angka-kunci null kartu      | 3 nulls                                                 | P9      | ✅ DONE                                         |
| JAC exp trailing backslash  | 12 entries                                              | P7      | ✅ DONE (verified clean)                        |
| Naked q/exp/hint sets/jac/  | ~138 fields                                             | P8a-1   | ✅ DONE session 20                              |
| Naked q/exp/hint sets/quiz/ | ~104 fields                                             | P8a-4   | ✅ DONE session 20                              |
| Naked q/exp/hint wayground  | 0                                                       | P8a-3+5 | ✅ Already clean                                |
| category/type mismatch      | 4                                                       | P3      |
| Desc truncated mid-word     | 213                                                     | P5      |
| Desc missing punct          | 266+82                                                  | P5      |
| Exact duplicates            | 5 pairs + 1 triple                                      | P4      |
| Duplicate id_text           | 25                                                      | P4      |
| angka-kunci kartu: null     | 3 fixable + 2 exam-meta                                 | P9      |

### 1C. furi Status (deprecated)

944 kartu: redundant. 149 kartu: contaminated. 62 kartu: jp has no ruby (blocks furi drop).
Do NOT maintain furi. Fix jp ruby (P1) first, then drop furi at merge time (P12).

---

### 1D. NEW — `type` field corruption in `source/` mirror (found 2026-07-11, session 23, NOT fixed)

While re-verifying the mirror-consistency claim above, `source/cards-common.js` and `source/cards-lifeline.js` failed to parse as JS. Root cause: 5 records have a literal backslash before both quotes on the `type` line — `type: \'vocab\',` — which is invalid outside a string context (`SyntaxError: Invalid or unexpected token`). `cards.js` has the same 5 records written correctly as `type: "vocab"`.

| id  | File                       | Line (at sync time) |
| --- | -------------------------- | ------------------- |
| 82  | `source/cards-lifeline.js` | 626                 |
| 83  | `source/cards-lifeline.js` | 638                 |
| 186 | `source/cards-common.js`   | 1270                |
| 188 | `source/cards-common.js`   | 1294                |
| 201 | `source/cards-common.js`   | 1450                |

These are exactly the first 5 of the 8 ids in PROGRESS.md's first P14 batch (`id=82,83,186,188,201,295,381,401` — the other 3 in that batch are unaffected). Most likely cause: whatever edit method mirrored the P14 reclassification from `cards.js` into `source/` for this sub-batch introduced stray escaping — possibly a shell/regex replacement that treated `'` as needing escaping when it didn't.

**Why this matters:** `source/cards-*.js` currently cannot be `node --require`'d or run through any real JS parser as-is. Nothing on `content-dq` catches this today (no lint/build/test here — see README-CONTENT-DQ.md). It would surface at merge time when these files reach `main`'s toolchain.

**Not fixed here** — this is a content-file edit (even though mechanical/low-risk), and this sync was scoped to administration/docs per owner instruction. Fix is: remove the 2 stray backslashes on each of the 5 lines above, i.e. `\'vocab\'` → `'vocab'`. One line each, no semantic change — the value was already correctly decided as `'vocab'` in P14, this only fixes how it's written to disk in the mirror layer.

---

## PART 2 — QUESTION SETS: SCHEMA

### Standard Question Schema (canonical — all sets except wglv)

```js
{
  id,              // string (set-level) + number (per-question)
  track,           // 'common'|'lifeline'|'doboku'|'kenchiku'
  q,               // JP soal — all kanji need 《》 ruby
  hint,            // ID clue — all kanji need ruby
  opts,            // JP (wt/wgl): ruby wajib | ID (jac/jmt/quiz): no ruby needed
  opts_id,         // ID translation ALL options — including wrong options
  ans,             // 0-based index
  exp,             // full explanation — all kanji ruby, wajib ending punct
  img?,            // jac sets only: null | filename
  related_card_id?,// jac sets only: valid card id
}
```

### wglv-jp Schema (JP→ID direction)

```js
{
  (id, q, hint, opts, opts_id, ans, exp);
}
// q: JP soal — all kanji ruby
// hint: ID clue — BUKAN copy of q
// opts: ID strings — no ruby needed
// exp: "JP term《ruby》 = ID translation"
```

### wglv-id Schema (ID→JP direction)

```js
{
  (id, q, hint, opts, opts_id, ans, exp);
}
// q: BI soal — "Apa bahasa Jepangnya \"[term]\"?"
// hint: JP term dengan ruby — satu term
// opts: JP terms — all kanji ruby
// opts_id: ID translation ALL opts — termasuk wrong options
// exp: "JP term《ruby》 = ID translation"
```

---

## PART 3 — WAYGROUND SETS (post-W1)

26 files, 657 total qs. Full set list in `docs/CARD_CONTENT_SPEC.md` §5.5.

**wglv01–05 current state (pre-P16 split):**
| File | Total | ID→JP | JP→ID |
|---|---|---|---|
| wglv01 | 50 | 0 | 50 |
| wglv02 | 46 | 21 | 25 |
| wglv03 | 45 | 20 | 25 |
| wglv04 | 45 | 25 | 20 |
| wglv05 | 50 | 25 | 25 |

**After P16:** wglv01–05 deleted, replaced by wglv-jp-{nn} and wglv-id-{nn} series.

**wglv quality issues (fix in P10/P11 after P16):**

- wglv-id (ex wglv04/05): `opts_id` partial — wrong options kosong
- wglv-jp (ex wglv01/02/03): some `hint` = copy of q — needs ID clue
- wglv-id: generic `exp` format — needs specific translation

Storage migration note: W1 ID rename = STORAGE_VERSION 4→5 at main-merge time.

---

## PART 4 — CSV SETS (pre-P17: 12 sets, 300 qs)

Pre-P17: folder `sets/csv/`, files ct01–ct06 + cp01–cp06.
Post-P17: folder `sets/jac-mockup/`, files jmt01–jmt06 + jml01–jml06.

**Ruby status: COMPLETE for q/opts/exp (P11-FIX, P15 done). Also COMPLETE for hint/opts as of session 22** — P8a item 2 finished `0fccbd1`+`81f7c8d`: 21 q + 174 exp + 16 hint + 4 opts annotated, 0 naked remaining, integrity checks pass. Content is 100% clean pre-rename; only the folder/file rename itself (P17) is still pending OD-3.

Note: Monolithic `csv-sets.js` = legacy reference, do not edit. Working copy: `sets/csv/`.

---

## PART 5 — QUIZ SETS (6 sets, 90 qs)

IDs: `doboku-01/02/03`, `kenchiku-01/02/03`. Schema + ruby + hints + track: all done (P13).

⚠️ Content is AI-generated (no real JAC PDF). Treat as draft. **Naked `exp`: DONE** — P8a item 4 (session 20) annotated 104 fields, 0 naked remaining, syntax-checked. (v17 still listed this as an open "~78 entries" item; it wasn't re-checked before v17 shipped.)

---

## PART 6 — JAC OFFICIAL SETS (95 qs)

| File                       | qs  | related_card_id | Schema                   |
| -------------------------- | --- | --------------- | ------------------------ |
| `sets/jac/jac-teori.js`    | 65  | 65/65 filled ✅ | NEW (q/opts/ans/img/exp) |
| `sets/jac/jac-lifeline.js` | 30  | 30/30 filled ✅ | NEW                      |

⚠️ These DQ copies are ORPHANED — not consumed by app. Top-level `jac-teori.js`/`jac-lifeline.js` (old schema) still consumed. At merge: replace top-level with these DQ copies.

**NEW ISSUES (session 18):**

- 12 `exp` berakhir `\'` (8 in jac-teori, 4 in jac-lifeline) — corruption, fix in P7

---

## PART 7 — CONFUSION_PAIRS (28 entries)

Schema: `type, label, termA, furiA, defA, termB, furiB, defB, tip, tip_id`
All fields complete. Ruby done. ✅ No action needed.
Note: `track` field missing on all 28 — open, no task assigned.

---

## PART 8 — DANGER_PAIRS (20 entries)

All fields complete. Ruby done. ✅ No action needed.

---

## PART 9 — ANGKA_KUNCI (29 entries)

`soal` ruby: done ✅. `mnemonic` + `track`: done ✅.

**NEW ISSUES (session 18):**

- 5 entries with `kartu: null` — DATA_ARCH_AUDIT undercounted (stated 1, actual 5)
- 3 fixable: id=134 (45 jam/bln), id=1172 (6 bulan→10 hari), id=1347 (< 6mm / ≥ 6mm)
- 2 intentional exam-meta: add comment `// exam-meta`
- 28/29 soal fields have naked kanji — fix in P9

---

## MASTER EXECUTION ORDER

See `PROGRESS.md` for live checklist. See `docs/CARD_CONTENT_SPEC.md` §8 for full task detail.

**Dependency order (P14/P15 added — v17 omitted them despite them being active/ongoing tasks; both are now done):**
P0 → P1 → P2 → P3 → P4 → P5 → P9 → P7 → P14 → P15 → P16 → P17 → P8a → P8b → P10 → P11 → P6⚠️ → P12(merge) → P13

**Status as of this sync:** everything up to and including P8a is done. P14/P15 (which had no fixed dependency slot in v17) are also done. Nothing past P8a can start without an OD.

**Open decisions required from owner before:**

- P6: OD-1 (source reclassification — retain vs merge)
- P16: OD-2 (wglv split timing)
- P17: OD-3 (jac-mockup rename timing)
- P12: OD-5 (SSW Flashcards repo furi usage)

---

## AGENT RULES (canonical)

- Edit split files in `src/data/cards/` and `src/data/sets/` — these are the working source of truth
- Also update `src/data/source/cards-*.js` when editing card split files (mirror edit)
- Also update `src/data/cards.js` when editing card split files (mirror edit)
- Never edit monolithic `csv-sets.js`/`wayground-sets.js` — legacy reference only
- Never edit `furi` field (deprecated)
- Ruby: annotate full compound, never suffix-only. `（）` for aliases/synonyms — not `《》`
- `exp` minimum 30 chars, real Indonesian
- `wglv` short exp = intentional vocab format — do NOT expand (until P11 post-P16)
- `angka.kartu` = number (card id), not string
- Track values: `common`, `lifeline`, `doboku`, `kenchiku` only
- Single-quote strings in all data files (except `cards-common.js`/`cards-lifeline.js` — do not requote)
- ZERO edits to main branch

---

## CODEBASE STATE (v18 — post session 22, synced session 23)

| File/Module                            | State                                         | Notes                                                                                                                              |
| -------------------------------------- | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `src/data/cards/**/*.js`               | 1,438 cards ✅                                | 5 deleted (id=374,484,518,592,982)                                                                                                 |
| `src/data/source/cards-*.js`           | 1,438 IDs match ✅ / **content NOT clean** ⚠️ | 5 records have invalid JS (`type: \'vocab\',`) — see §1D                                                                           |
| `src/data/cards.js`                    | 1,438 exported ✅                             | Clean, parses fine; header comment says "1443" — stale, harmless (not re-generated since P4 deletions)                             |
| `src/data/sets/csv/*.js`               | 12 files, ruby+hint+opts done ✅              | Pre-P17 rename (awaiting OD-3); content 100% clean per session 22                                                                  |
| `src/data/sets/wayground/**/*.js`      | 26 files ✅                                   | wglv pre-P16 split; q/exp/hint already clean                                                                                       |
| `src/data/sets/quiz/*.js`              | 6 files ✅                                    | ruby annotated session 20 (0 naked)                                                                                                |
| `src/data/sets/jac/*.js`               | 2 files ✅                                    | ruby annotated session 20 (0 naked)                                                                                                |
| `src/data/confusion-pairs.js`          | done ✅                                       | 28 entries                                                                                                                         |
| `src/data/danger-pairs.js`             | done ✅                                       | 20 entries                                                                                                                         |
| `src/data/angka-kunci.js`              | done ✅                                       | 3 null kartu fixed (session 19); 0 naked soal                                                                                      |
| `src/data/jac-teori.js` (top-level)    | OLD schema                                    | Consumed by app; replace at merge                                                                                                  |
| `src/data/jac-lifeline.js` (top-level) | OLD schema                                    | idem                                                                                                                               |
| `src/data/jac-doboku.js`               | empty stub                                    | Awaiting PDF                                                                                                                       |
| `src/data/jac-kenchiku.js`             | empty stub                                    | Awaiting PDF                                                                                                                       |
| Monolithic `csv-sets.js` etc           | legacy, do not edit                           | Replaced at merge time                                                                                                             |
| `docs/CARD_CONTENT_SPEC.md`            | canonical spec ✅                             | Last updated session 18 — still accurate, no changes needed this sync                                                              |
| `docs/DATA_ARCH_AUDIT.md`              | audit reference ✅                            | Frozen point-in-time snapshot (session 16) — intentionally not updated, its own superseded findings are cross-referenced from here |

---

## HISTORICAL SUMMARY (sessions 1–22, compact)

### Selesai

| Session(s) | Task                            | What                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ---------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1–7        | P0–P20                          | Ruby annotation (1,020 jp), furi fixes, maru→ruby (220), quote removal (590), rename sipil→doboku, duplicate cleanup                                                                                                                                                                                                                                                                                                                                                                                            |
| 8–9        | S1–S4                           | Card restructure — 4 deprecated files deleted, 1,443 cards redistributed to split files                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 9          | H9/H10/H11                      | ct01/ct02 syntax fix; wg12 track fix; quiz track field added                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| 9          | P11-FIX, P12-FIX, P13, P14, P15 | CSV/wayground double ruby fix; quiz ruby+hints; wayground/CSV exp stubs expanded                                                                                                                                                                                                                                                                                                                                                                                                                                |
| 9          | P16 (old), P17 (old), P18, P19  | JAC schema migration; confusion-pairs tip_id; jac-teori related_card_id filled; danger-pairs ruby                                                                                                                                                                                                                                                                                                                                                                                                               |
| 10         | F1–F3                           | Source cleanup: text3l→jac-ch3 (25 cards), single-match trace (120 cards), categories.js cleanup                                                                                                                                                                                                                                                                                                                                                                                                                |
| 11         | G1–G2                           | Type-based filtering in app; source fix id:1184, id:1233                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| 12         | W1                              | Wayground taxonomy restructure: 26 sets renamed + reorganized                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| 13–17      | ADM1–ADM9                       | Admin doc hygiene, commit hash syncs, session log updates                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 17         | ADM9                            | v87 comparison marked done (owner-confirmed)                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| 18         | ADM10                           | Consolidated CARD_CONTENT_SPEC (7 versions → 1 canonical); DATA_ARCH_AUDIT; PROGRESS.md P0–P17 task list                                                                                                                                                                                                                                                                                                                                                                                                        |
| 18         | ADM11/ADM12                     | Recheck passes — commit hash sync, type enum order, dangling v16 refs, §8 ordering warning                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 18         | ADM13                           | Final ADM pass — C1/C2 file paths, C2 row 619, OD-4, hash sync                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 19         | P0–P5, P7, P9                   | Encoding fixes (id=476,773); 12 nested ruby; 62 jp ruby; 18 katakana ruby; ~140 naked jp parens; 10 naked desc; 52 id_text fixes; 6 metadata; delete 5 duplicate cards; disambiguate 26 id_text; P5-C 13 symbol fixes; P9 3 null angka-kunci fixed; P7 JAC exp verified clean                                                                                                                                                                                                                                   |
| 20         | ADMIN                           | Integrity checks (1,438 IDs, no dups, mirrors ✅, no orphaned related_card_id); P17 dirty state OPSI B                                                                                                                                                                                                                                                                                                                                                                                                          |
| 20         | P8a-1                           | sets/jac/ ruby: jac-teori.js + jac-lifeline.js — 3-pass, 138 fields, 0 naked remaining                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 20         | P8a-3+5                         | sets/wayground/ + wtv01 — verified already clean (0 naked)                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| 20         | P8a-4                           | sets/quiz/ ruby: doboku-01~03 + kenchiku-01~03 — 104 fields, 0 naked remaining                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| 21         | ADMIN                           | Handoff v17 sync (card count, source counts, known-issues status, codebase state, session log 18–20)                                                                                                                                                                                                                                                                                                                                                                                                            |
| 21–22      | P14                             | Type reclassification konsep→vocab, 5 waves, 581 kartu total; konsep sisa 97 (genuine principles/procedures/regulations)                                                                                                                                                                                                                                                                                                                                                                                        |
| 21–22      | P15                             | Usage field expansion, 6 batches, 1,092 kartu total; vocab coverage 100% (1244/1244)                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 22         | P8a-2                           | sets/csv/ (ex jac-mockup target) ruby: 21 q + 174 exp annotated, then hint(16)+opts(4) — 0 naked remaining, integrity checks pass                                                                                                                                                                                                                                                                                                                                                                               |
| 23         | ADMIN                           | **This sync.** HANDOFF v17→v18 (was 10 commits / 2 sessions stale); SESSION_PROMPT rewrite; README-CONTENT-DQ.md dangling v16 ref fixed; PROGRESS.md ref bump; \_MAP.md session log caught up (was missing ADM10–13 + all of sessions 19–22); v16+v17 archived to `docs/archive/`; cards.js stale header comment fixed (1443→1438); **new finding:** `type` field corruption in 5 `source/` mirror records (id=82,83,186,188,201) — documented in §1D, not fixed (content edit, out of scope for an admin pass) |

### Blocked (unchanged)

- P21 — JAC Doboku + Kenchiku jitsugi: tunggu PDF JAC resmi
- PDF Viewer Mode: tunggu URL PDF resmi JAC dari owner

---

## SOURCE FIELD VALUES — CANONICAL (post F1+F2+G2+P4 deletions)

```
jac-ch1:28  jac-ch2:101  jac-ch3:183  jac-ch4:149
jac-ch5:216 jac-ch6:133 jac-ch7:47
jac-gakka1:6  jac-gakka2:3
jac-jitsugi1:13  jac-jitsugi2:15
vocab-supplementary:269  vocab-lifeline:113  vocab-jac:49
vocab-general:44  vocab-exam:38  vocab-teori:18  vocab-core:13
```

Total: 1,438 ✅ | text3l: 0 ✅ (vs 1,443 pre-P4 — 5 cards deleted)

Legacy vocab-\* labels DIPERTAHANKAN — pedagogically meaningful in UI via SOURCE_META.
See `docs/CARD_CONTENT_SPEC.md` §12 OD-1 for pending owner decision on reclassification.

---

## OPEN DECISIONS (summary — detail di CARD_CONTENT_SPEC.md §12)

| ID   | Blocks             | Question                                                                             |
| ---- | ------------------ | ------------------------------------------------------------------------------------ |
| OD-1 | P6, P13            | Source labels: retain legacy vs merge ke vocab-supplementary?                        |
| OD-2 | P16, P8b, P10, P11 | wglv split: sekarang atau saat merge?                                                |
| OD-3 | P17, P8a item 2    | jac-mockup rename: sekarang atau saat merge?                                         |
| OD-4 | P10                | wglv02/03 hint: update ke ID clue atau keep?                                         |
| OD-5 | P12                | SSW Flashcards repo: pakai `card.furi` field?                                        |
| —    | P21                | Doboku/kenchiku source naming convention — see `docs/CARD_CONTENT_SPEC.md` §5.3 note |

---

## WHAT'S ACTUALLY NEXT (new section, session 23)

Written because SESSION_PROMPT.md's "pick the first `[ ]`" instruction, followed literally right now, leads straight into an OD-gated task. Three buckets, in the order it's probably most useful to clear them:

### Bucket 1 — needs your decision (5 minutes each, unblocks the most work)

- **OD-2** (wglv split, P16): unblocks P16 → P8b → P10 → P11. Biggest single unlock.
- **OD-3** (jac-mockup rename, P17): unblocks P17 → the folder rename that P8a item 2's content is already sitting clean and ready for.
- **OD-1** (source reclassification, P6): unblocks P6 → P13.
- **OD-4** (wglv02/03 hint direction, P10): small, only matters once OD-2/P16 happen.
- **OD-5** (furi field usage in the separate SSW Flashcards repo, P12): only matters at merge time.

### Bucket 2 — needs careful human/AGENT 12 judgment, not blocked on you specifically

- EF接合 triple (id=459, 612, 613) — 3 cards, different content, merge candidate (P4)
- 6 same-jp ambiguous pairs (124/842, 299/858, 862/309, 438/911, 482/819, 416/1182) (P4)
- id=1240 source field — ambiguous jac-ch2 content (P3)
- ~64 naked-kanji jp post-compound/qualifier cases (P1) — each may need a different ruby placement call

### Bucket 3 — blocked on external material, not actionable either way

- P5 desc truncation (213 mid-word + 266 missing-period, ~479 cards) — needs real JAC PDF text, can't be guessed
- P21 (JAC doboku/kenchiku jitsugi stubs) — needs official PDF
- PDF Viewer Mode — needs official PDF URL

### Also sitting there, cheap, not yet triaged into the P-numbered list

- `type` field corruption in 5 `source/` mirror records (§1D) — mechanical, 1 line × 5, but is a content edit
- `confusion-pairs.js` missing `track` field on all 28 entries (Part 7) — open, no task assigned, no owner decision needed, could just be picked up
