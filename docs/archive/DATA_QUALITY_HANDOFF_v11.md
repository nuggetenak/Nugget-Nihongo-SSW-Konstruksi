# SSW Konstruksi — Data Quality Handoff v11

**Updated by:** Data Quality Agent (May 2026 — session 4)
**Supersedes:** v1–v10 (this is the canonical single-source handoff)
**Scope:** ALL content files — cards + soal + pairs + angka
**Repo:** https://github.com/nuggetenak/Nugget-Nihongo-SSW-Konstruksi/
**Last commit:** `9d4929f` — P11 + P12 completed and pushed

---

## PART 0 — NAMING CONVENTION CANONICAL SPEC

### 0A. Track Values (code/data canonical)

| Track      | Meaning            | Indonesian | Japanese      |
| ---------- | ------------------ | ---------- | ------------- |
| `common`   | All tracks (Teori) | —          | 学科          |
| `lifeline` | ライフライン設備   | —          | 実技 Lifeline |
| `doboku`   | 土木               | Sipil      | 土木          |
| `kenchiku` | 建築               | Bangunan   | 建築          |

**Rule:** `track` field values are always the romaji column. Never `sipil`, never `bangunan`, never `gakka`.

### 0B. Set ID Prefix Taxonomy

| Prefix         | Meaning                  | File                |
| -------------- | ------------------------ | ------------------- |
| `wt{n}`        | Wayground Teori          | `wayground-sets.js` |
| `wg{n}`        | Wayground Vocab          | `wayground-sets.js` |
| `wp{n}`        | Wayground Praktik        | `wayground-sets.js` |
| `ct{n}`        | CSV Teori                | `csv-sets.js`       |
| `cp{n}`        | CSV Praktik              | `csv-sets.js`       |
| `doboku-{n}`   | Quiz Doboku              | `quiz-sets.js`      |
| `kenchiku-{n}` | Quiz Kenchiku            | `quiz-sets.js`      |
| `tt{n}_q{nn}`  | JAC Teori question ID    | `jac-teori.js`      |
| `st{n}_q{nn}`  | JAC Lifeline question ID | `jac-lifeline.js`   |

**Future JAC doboku/kenchiku IDs:** use `dt{n}_q{nn}` / `kt{n}_q{nn}`.

### 0C. File Naming

| Domain              | File                                   | Export         |
| ------------------- | -------------------------------------- | -------------- |
| JAC Teori           | `jac-teori.js`                         | `JAC_TEORI`    |
| JAC Lifeline        | `jac-lifeline.js`                      | `JAC_LIFELINE` |
| JAC Doboku (stub)   | `jac-doboku.js`                        | `JAC_DOBOKU`   |
| JAC Kenchiku (stub) | `jac-kenchiku.js`                      | `JAC_KENCHIKU` |
| Shim                | `jac-official.js`                      | `JAC_OFFICIAL` |
| Cards (common+LL)   | `cards-common.js`, `cards-lifeline.js` | (merged)       |
| Cards (future)      | `cards-doboku.js`, `cards-kenchiku.js` | (stubs)        |

### 0D. Quote Style

| File(s)        | Style                                              |
| -------------- | -------------------------------------------------- |
| All data files | single-quote `'` ✅ canonical (jac-\* fixed in v7) |

> **Note:** `cards-common.js` and `cards-lifeline.js` still use double-quote strings — this is a known inconsistency. Do NOT bulk-requote; it risks corrupting escaped characters.

### 0E. `source` Field Values on Cards

From JAC PDF: `jac-ch1` through `jac-ch7`
From JAC sample exams: `jac-gakka1`, `jac-gakka2`, `jac-jitsugi1`, `jac-jitsugi2`
Vocab: `vocab-core`, `vocab-exam`, `vocab-jac`, `vocab-lifeline`, `vocab-teori`, `vocab-general`, `vocab-supplementary`
Other: `text3l`
New cards from JAC Doboku PDF → `jac-gakka-d{n}` / `jac-jitsugi-d{n}`. Kenchiku → `-k{n}`.

---

## PART 1 — CARDS (`src/data/source/`)

### Card Schema (complete, canonical)

```js
{
  id,           // numeric
  category,     // key → CATEGORIES
  source,       // 'jac-ch1' etc
  furi,         // hiragana reading
  jp,           // Japanese term (target: all contain 《》 ruby)
  type,         // 'konsep' | 'hukum' | 'vocab'
  id_text,      // Indonesian definition
  desc,         // Indonesian context description
  usage,        // [OPTIONAL, 153 cards] usage example sentence
  _origIndex,   // [SOURCE ONLY] stripped by merge script — do not edit
}
```

`quote` field: **DELETED** in v7. Zero remaining in both source files.

### 1A. Current `jp` Ruby Status (v8 actuals)

| File                | Total     | Has 《》 ruby | Maru（kana）remaining     | Bare kanji | Pure kana/romaji |
| ------------------- | --------- | ------------- | ------------------------- | ---------- | ---------------- |
| `cards-common.js`   | 879       | ~762          | ~44 (kanji-in-maru, kept) | 0          | ~73              |
| `cards-lifeline.js` | 564       | ~452          | ~21 (kanji-in-maru, kept) | 0          | ~91              |
| **TOTAL**           | **1,443** | **~1,214**    | **~65**                   | **0**      | **~164**         |

> **P4 note (v8):** 220 pure-kana maru `（kana）` → `《kana》` converted. 119 maru patterns remain — these contain non-reading content (synonyms, abbreviations, definitions) and are intentionally preserved as `（）`. Do NOT bulk-convert remaining maru.

> **P5 note (v9):** 1,020 bare-kanji jp fields annotated with full-compound ruby `jp《furi》`. 65 maru cases skipped — kanji inside `（漢字）` are synonyms/expansions, correctly preserved. Zero bare-kanji jp fields remain in either source file.

> **P6 note (v10):** 153 multi-part `jp` fields (109 common + 44 lifeline) annotated with per-segment ruby. All kanji segments across `・`, `vs`, `／`, `：` separators now have their own `《》`. Zero multi-segment jp fields with unannotated kanji remain.

### 1B. `furi` Typos — FIXED in v7

| id  | Was                            | Fixed to                            |
| --- | ------------------------------ | ----------------------------------- |
| 532 | `ねちゅうしょうのしょうじょう` | `ねっちゅうしょうのしょうじょう` ✅ |
| 230 | `てにょうくぎじまい`           | `てんようくぎじまい` ✅             |

### 1C. Multi-Part `furi` — 211 cards (OPEN)

Cards where `jp` has multi-part segments (・ vs / ：) but `furi` is unseparated flat string.
Fix: align `furi` separators to match `jp`.

```js
// BAD
jp: "加湿器 vs 除湿器", furi: "かしつきじょしつき"
// GOOD
jp: "加湿器 vs 除湿器", furi: "かしつき vs じょしつき"
```

### 1D. Malformed jp-ruby Cards — ✅ ALL FIXED in v8

| id  | Status                                                     |
| --- | ---------------------------------------------------------- |
| 293 | ✅ `ディスクグラインダー 高速型《がた》 vs 低速型《がた》` |
| 476 | ✅ `漏電《ろうでん》と漏電遮断機《しゃだんき》`            |
| 489 | ✅ `呼水装置《こすいそうち》`                              |
| 491 | ✅ `性能試験装置《せいのうしけんそうち》`                  |

### 1E. Ruby Format Rules (canonical)

```js
// Full compound — annotate entire reading, NEVER suffix-only
'呼水装置《こすいそうち》'; // ✅
'呼水装置《そうち》'; // ❌ 装置 reading only

// Multi-part — separator preserved, ruby per segment
'加湿器《かしつき》 vs 除湿器《じょしつき》';
'転用《てんよう》・釘仕舞《くぎじまい》';

// Mixed JP/katakana — only kanji compounds get ruby
'ディスクグラインダー 高速型《がた》 vs 低速型《がた》';

// Maru retained for non-reading content (synonyms, abbrevs)
'危険予知活動（KY活動）'; // ✅ keep — KY is abbreviation, not reading
'アスベスト（石綿）'; // ✅ keep — 石綿 is kanji synonym, not kana reading
```

---

## PART 2 — SCHEMA STATUS

### Unified Question Schema (canonical — wayground + csv already on this)

```js
{
  id,       // integer, unique within set
  q,        // JP question string with 《》 ruby
  hint,     // Indonesian paraphrase of q (required)
  opts,     // JP options array with 《》 ruby
  opts_id,  // Indonesian options array (parallel)
  ans,      // 0-based index
  exp,      // Indonesian explanation, min 30 chars
  // set-level: track, source
}
```

### jac-teori.js + jac-lifeline.js — Old Schema (OPEN P16)

Still uses old schema as of v8 (quote style fixed, schema unchanged):

```js
{
  id,           // 'tt1_q01'
  set,          // 'tt1'
  setLabel,     // '学科 Set 1'
  topic,        // 'umum' | 'keselamatan' | etc
  jp,           // JP question (no ruby)
  hiragana,     // flat reading
  id_text,      // Indonesian question
  options,      // mixed string: 'JP（kana）(Indonesian)'
  answer,       // 0-based
  hasPhoto,     // bool
  explanation,  // Indonesian explanation
  related_card_id, // card id or null
  track,        // 'common' | 'lifeline'
}
```

Migration target: `jp`→`q` (add ruby), `answer`→`ans`, `explanation`→`exp`, split `options`→`opts`+`opts_id`, `id_text`→`hint`, drop `hiragana`.

### New JAC Doboku/Kenchiku files: use unified schema with `related_card_id: null` where card doesn't exist yet.

---

## PART 3 — WAYGROUND QUESTIONS

### Set List (v7 canonical — 26 sets, 657 total qs)

| ID           | Title                     | Track      | qs      |
| ------------ | ------------------------- | ---------- | ------- |
| `wt1`–`wt10` | Teori Set 1–10            | `common`   | varies  |
| `wg1`–`wg5`  | Praktik Set 1–5 (quizizz) | `lifeline` | 20 each |
| `wp5`        | Praktik Set 5 (was wg10)  | `lifeline` | 20      |
| `wp1`–`wp4`  | Praktik Set 1–4           | `lifeline` | 20 each |
| `wg6`        | Vocab Set 1               | `lifeline` | 50      |
| `wg7`        | Vocab Set 2 (was Set 7)   | `lifeline` | 46      |

---

## PART 5 — CSV SETS (12 sets, 300 qs)

### Schema Gaps (OPEN P11, P15)

| Field                   | Status                      |
| ----------------------- | --------------------------- |
| `q` ruby                | 35/300 — mostly bare kanji  |
| `opts` ruby             | 30/1200 — mostly bare kanji |
| `hint`                  | ✅ all present              |
| `exp` "modul JAC" stubs | ~40 items — OPEN P15        |

---

## PART 4 — QUIZ SETS (6 sets, 90 qs)

Set IDs: `doboku-01`, `doboku-02`, `doboku-03`, `kenchiku-01`, `kenchiku-02`, `kenchiku-03`.

### Schema Gaps (OPEN P13)

| Field             | Status                                                  |
| ----------------- | ------------------------------------------------------- |
| `q` ruby          | 0 / 90 — all bare kanji                                 |
| `opts` ruby       | 0 / ~360                                                |
| `hint`            | missing on all 90                                       |
| `id` per question | missing on all 90                                       |
| `exp` quality     | ✅ avg 154 chars — good                                 |
| `cat`, `desc`     | present (extra fields — keep until DC-1/DC-2 migration) |

---

## PART 6 — JAC_TEORI + JAC_LIFELINE (95 qs)

| File              | qs  | `related_card_id` filled | null   |
| ----------------- | --- | ------------------------ | ------ |
| `jac-teori.js`    | 65  | 44                       | **21** |
| `jac-lifeline.js` | 30  | 29                       | 1      |

All cross-refs verified valid (v5). Schema migration pending (P16). `hasPhoto`: teori=5, lifeline=7.

**jac-doboku.js / jac-kenchiku.js:** empty stubs `[]`. Populate after PDF. Use unified schema + IDs `dt{n}_q{nn}` / `kt{n}_q{nn}`.

---

## PART 7 — CONFUSION_PAIRS (28 entries)

| Field                  | Status                                             |
| ---------------------- | -------------------------------------------------- |
| Export in `index.js`   | ✅ Added v7                                        |
| `termA` / `termB` ruby | ✅ **DONE v8** — all 28 pairs with kanji annotated |
| `furiA` / `furiB`      | ✅ present — keep                                  |
| `tip_id` field         | missing — OPEN P17                                 |
| `track` field          | missing on all 28 — OPEN                           |

---

## PART 8 — DANGER_PAIRS (20 entries)

| Field                          | Status                                                                                                         |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| `term` ruby                    | ✅ **DONE v8** — 17/20 annotated; 3 correctly skipped (pure kana/romaji: グラスウール, OTDR, ラッキングカバー) |
| `furi`                         | ✅ all 20                                                                                                      |
| `track`                        | ✅ all 20 (common=12, lifeline=8)                                                                              |
| `traps[]` + `explanation` ruby | audit needed — OPEN P19                                                                                        |

---

## PART 9 — ANGKA_KUNCI (29 entries)

| Field                     | Status                            |
| ------------------------- | --------------------------------- |
| `soal` ruby               | ✅ **DONE v8** — all 29 annotated |
| `kartu` (numeric card ID) | 24/29 filled, all valid ✅        |
| `mnemonic`                | ✅ all 29                         |
| `track`                   | ✅ all 29                         |

> `kartu` is a **number** (card id), NOT a string field named `kartu_id`. Do not rename.

---

## MASTER EXECUTION ORDER (v8)

| Priority | Task                                             | File(s)                                | Scope                                               | Status      |
| -------- | ------------------------------------------------ | -------------------------------------- | --------------------------------------------------- | ----------- |
| **P0**   | UI: back face ruby render                        | `FlipCard.jsx`                         | 1 line                                              | ✅ DONE v7  |
| **P0b**  | UI: remove quote JSX block                       | `FlipCard.jsx`                         | 5 lines                                             | ✅ DONE v7  |
| **P0c**  | Fix wg8/wg9 duplicate questions                  | `wayground-sets.js`                    | 2 entries                                           | ✅ DONE v7  |
| **P0d**  | Fix wg9 subtitle conflict                        | `wayground-sets.js`                    | 1 subtitle                                          | ✅ DONE v7  |
| **P1**   | Delete ALL `quote` fields                        | `cards-common.js`, `cards-lifeline.js` | 590 removed                                         | ✅ DONE v7  |
| **P2**   | Fix 4 malformed jp-ruby cards                    | source                                 | ids 293,476,489,491                                 | ✅ DONE v8  |
| **P3**   | Fix 2 furi typos                                 | source                                 | ids 532, 230                                        | ✅ DONE v7  |
| **P4**   | Convert `jp（kana）` → `jp《kana》`              | source                                 | **220 converted** (119 maru retained — non-reading) | ✅ DONE v8  |
| **P5**   | Add 《》 ruby to bare kanji jp                   | source                                 | **1020 annotated; 65 maru-kanji skipped**           | ✅ DONE v9  |
| **P6**   | Add ruby per-segment multi-part jp               | source                                 | **153 annotated**                                   | ✅ DONE v10 |
| **P7**   | Align furi separators multi-part                 | source                                 | 211 cards                                           | OPEN        |
| **P7b**  | Add `CONFUSION_PAIRS` to index.js                | `index.js`                             | 1 line                                              | ✅ DONE v7  |
| **P7c**  | Rename wg10→wp5; fix all titles                  | `wayground-sets.js`                    | 1 ID + 9 titles                                     | ✅ DONE v7  |
| **P7d**  | Standardize quote style in jac-\*                | `jac-teori.js`, `jac-lifeline.js`      | both files                                          | ✅ DONE v7  |
| **P8**   | Add ruby to `termA/termB`                        | `confusion-pairs.js`                   | 28 pairs                                            | ✅ DONE v8  |
| **P9**   | Add ruby to `term` in danger-pairs               | `danger-pairs.js`                      | 17/20 (3 kana/romaji skipped)                       | ✅ DONE v8  |
| **P10**  | Add ruby to `soal` in angka-kunci                | `angka-kunci.js`                       | 29 items                                            | ✅ DONE v8  |
| **P11**  | Add ruby to CSV `q` + `opts`                     | `csv-sets.js`                          | **339q, 409 opts**                                  | ✅ DONE v11 |
| **P12**  | Add ruby to wayground bare-kanji `q`+`opts`      | `wayground-sets.js`                    | **488q, 276 opts**                                  | ✅ DONE v11 |
| **P13**  | Add ruby + hint + id to quiz-set inline q        | `quiz-sets.js`                         | 90q, ~360 opts                                      | OPEN        |
| **P14**  | Expand real stub `exp` in teori/praktik sets     | `wayground-sets.js`                    | ~28 stubs                                           | OPEN        |
| **P15**  | Replace "modul JAC" exp in CSV                   | `csv-sets.js`                          | 40 items                                            | OPEN        |
| **P16**  | Migrate jac-teori/lifeline to unified schema     | `jac-teori.js`, `jac-lifeline.js`      | 95q                                                 | OPEN        |
| **P17**  | Add `tip_id` to confusion-pairs                  | `confusion-pairs.js`                   | 28 pairs                                            | OPEN        |
| **P18**  | Fill 21 null `related_card_id` in jac-teori      | `jac-teori.js`                         | 21q                                                 | OPEN        |
| **P19**  | Audit `traps`/`explanation` ruby in danger-pairs | `danger-pairs.js`                      | 20 items                                            | OPEN        |
| **P20**  | Rename sipil→doboku, bangunan→kenchiku           | all code files                         | full codebase                                       | ✅ DONE v7  |
| **P21**  | Populate jac-doboku + jac-kenchiku               | stubs                                  | After PDF                                           | PENDING     |

---

## P13 EXECUTION NOTES (Session 4 Planning)

### Analysis Complete

- **Structure**: 6 quiz sets (doboku-01/02/03, kenchiku-01/02/03), 90 total questions
- **Current state**: All q and opts are **bare kanji** (0% ruby coverage)
- **Missing fields**: `hint` (all 90), `id` (per-question, 1-indexed per set)
- **exp quality**: ✅ Already good (~150 chars avg, real Indonesian)

### P13 Requirements

1. **Ruby annotation**: Apply to all 90 q + ~360 opts
   - Reuse OVERRIDES from P11/P12 (87 terms)
   - Add site-specific: 土工事, 掘削, 転圧, 圧力, 機械, etc.
2. **Hint field**: Generate 90 short Indonesian paraphrases
   - Format: "Apa tentang X?" or direct question paraphrase
   - Source: Use existing `exp`, `opts_id`, `desc` for context
   - Example: Q="掘削作業を..." → Hint="Pengecekan sebelum penggalian apa?"
3. **ID field**: Add sequential 1-indexed IDs per set
   - doboku-01: id=1 to 15
   - doboku-02: id=1 to 15
   - doboku-03: id=1 to 15 (same for kenchiku-01/02/03)

### Recommended Approach for Next Agent

1. Extract all 90 (q, opts_id, exp) tuples → JSON
2. Use API/manual mapping to generate hints preserving Indonesian idiom
3. Build FINAL_OVERRIDES (87 + site-specific)
4. Rebuild quiz-sets.js using regex substitution with id + hint injection
5. Verify: all q/opts have ruby, all have id + hint

### Notes

- Don't modify `cat`, `desc`, `exp` fields — these are good
- Preserve opts_id, ans exactly as-is
- Check for any existing id/hint fields (expect zero)
- No double-ruby violations (use careful regex boundaries)

---

## CONTENT COUNT REFERENCE (v8 — authoritative)

| File                 | Type       | Count             | jp/q ruby                     | opts ruby  |
| -------------------- | ---------- | ----------------- | ----------------------------- | ---------- |
| `cards-common.js`    | flashcards | 879               | ~142 / 879                    | n/a        |
| `cards-lifeline.js`  | flashcards | 564               | ~83 / 564                     | n/a        |
| `cards-doboku.js`    | flashcards | 0 stub            | —                             | —          |
| `cards-kenchiku.js`  | flashcards | 0 stub            | —                             | —          |
| `wayground-sets.js`  | questions  | **657** (26 sets) | ~506/657                      | ~1315/1971 |
| `csv-sets.js`        | questions  | 300 (12 sets)     | 35/300                        | 30/1200    |
| `quiz-sets.js`       | questions  | 90 (6 sets)       | 0/90                          | 0/360      |
| `jac-teori.js`       | questions  | 65                | 0 (old schema)                | 0          |
| `jac-lifeline.js`    | questions  | 30                | 0 (old schema)                | 0          |
| `jac-doboku.js`      | questions  | 0 stub            | —                             | —          |
| `jac-kenchiku.js`    | questions  | 0 stub            | —                             | —          |
| `confusion-pairs.js` | pairs      | 28                | ✅ 28/28 termA+termB          | n/a        |
| `danger-pairs.js`    | items      | 20                | ✅ 17/20 term (3 kana/romaji) | n/a        |
| `angka-kunci.js`     | items      | 29                | ✅ 29/29 soal                 | n/a        |

---

## CODEBASE STATE (v8 — storage version 5)

| File                                | Change in v8                                                                                                            |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `src/storage/schema.js`             | `STORAGE_VERSION` bumped 4→5                                                                                            |
| `src/storage/engine.js`             | `hasV4Data` + `migrate_v4_to_v5` imported; v4→v5 branch added; v3→v4→v5 chain; v2→v3→v4→v5 chain; v1 full chain updated |
| `src/data/source/cards-common.js`   | P2 id 293 fixed; P4 141 maru→ruby                                                                                       |
| `src/data/source/cards-lifeline.js` | P2 ids 476,489,491 fixed; P4 79 maru→ruby                                                                               |
| `src/data/cards.js`                 | Regenerated (merge-cards) — 1443 cards                                                                                  |
| `src/data/confusion-pairs.js`       | P8: ruby added to termA/termB on all 28 kanji entries                                                                   |
| `src/data/danger-pairs.js`          | P9: ruby added to term on 17/20 entries (3 pure-kana/romaji skipped)                                                    |
| `src/data/angka-kunci.js`           | P10: ruby added to all 29 soal sentences                                                                                |
| `src/data/source/cards-common.js`   | P5: 620 bare-kanji jp annotated; 44 maru-kanji skipped                                                                  |
| `src/data/source/cards-lifeline.js` | P5: 400 bare-kanji jp annotated; 21 maru-kanji skipped                                                                  |
| `src/data/cards.js`                 | P5: Regenerated (merge-cards) — 1443 cards                                                                              |
| `src/data/source/cards-common.js`   | P6: 109 multi-part jp fields annotated per-segment                                                                      |
| `src/data/source/cards-lifeline.js` | P6: 44 multi-part jp fields annotated per-segment                                                                       |
| `src/data/cards.js`                 | P6: Regenerated (merge-cards) — 1443 cards                                                                              |

---

## ARCHITECTURAL DECISIONS (unchanged)

- **Decision A:** `csv-sets.js` → `jac-mockup.js`, add `section: 'teori'|'praktik'` per q
- **Decision B:** Future Doboku/Kenchiku content (pending PDFs)
- **Decision C:** `wayground-sets.js` → split by track; inline doboku/kenchiku → `wayground-sets-doboku.js` + `wayground-sets-kenchiku.js`
- **Decision D:** Track-aware nav filtering for DobokuMode/KenchikuMode

---

## AGENT RULES (canonical — all versions merged)

- **Edit source files** `src/data/source/` for cards; all other data files edit directly.
- **After any card source edit:** run `node scripts/merge-cards.mjs`
- **Never edit** `src/data/cards.js` directly — auto-generated.
- **Never bulk-touch** `furi` fields — only confirmed typos.
- **Ruby format:** annotate full compound reading, never suffix-only.
- **Maru `（）` with non-kana content** (synonyms, abbreviations, definitions) — do NOT convert to `《》`. Only pure-hiragana/katakana readings get converted.
- **`exp` minimum:** 30 chars for non-vocab sets; real Indonesian, not placeholder.
- **wg6/wg7/wg8/wg9/wg11 short exp** = intentional vocab-recognition format — do NOT expand.
- **`angka.kartu`** is a number (card id), not a string field `kartu_id`.
- **Track values:** `common`, `lifeline`, `doboku`, `kenchiku` only — never `sipil`, `bangunan`, `gakka`.
- **`sipil-*` / `bangunan-*` IDs are GONE** — all renamed to `doboku-*` / `kenchiku-*`.
- **New JAC questions:** use unified schema; IDs `dt{n}_q{nn}` / `kt{n}_q{nn}`.
- **New source cards (doboku/kenchiku):** add to `cards-doboku.js` / `cards-kenchiku.js`, NOT `cards-common.js`.
- **`jac-official.js`** is a shim — never add content here directly.
- **Single-quote strings** in all data files — canonical. Exception: `cards-common.js` / `cards-lifeline.js` use double-quotes — do not change.
- **`CONFUSION_PAIRS`** is now exported from `index.js` barrel — import from there, not direct path.
- **Storage version:** currently `5`. Next schema change → bump to `6` and add `migrate_v5_to_v6` + `hasV5Data` in `migrations.js`, wire into `engine.js`.
