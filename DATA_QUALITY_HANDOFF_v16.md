# SSW Konstruksi — Data Quality Handoff v16
**Updated:** May 2026 — session 10 (H9/H10/H11 housekeeping + S1–S4 card restructure complete)
**Supersedes:** v1–v14 (this is the canonical single-source handoff)
**Scope:** ALL content files — cards + soal + pairs + angka
**Repo:** https://github.com/nuggetenak/Nugget-Nihongo-SSW-Konstruksi/
**Last commit:** `f4a47fb` (pre-session-6)

---

## PART 0 — NAMING CONVENTION CANONICAL SPEC

### 0A. Track Values (code/data canonical)
| Track | Meaning | Indonesian | Japanese |
|---|---|---|---|
| `common` | All tracks (Teori) | — | 学科 |
| `lifeline` | ライフライン設備 | — | 実技 Lifeline |
| `doboku` | 土木 | Sipil | 土木 |
| `kenchiku` | 建築 | Bangunan | 建築 |

**Rule:** `track` field values are always the romaji column. Never `sipil`, never `bangunan`, never `gakka`.

### 0B. Set ID Prefix Taxonomy
| Prefix | Meaning | File |
|---|---|---|
| `wt{n}` | Wayground Teori | `wayground-sets.js` |
| `wg{n}` | Wayground Vocab | `wayground-sets.js` |
| `wp{n}` | Wayground Praktik | `wayground-sets.js` |
| `ct{n}` | CSV Teori | `csv-sets.js` |
| `cp{n}` | CSV Praktik | `csv-sets.js` |
| `doboku-{n}` | Quiz Doboku | `quiz-sets.js` |
| `kenchiku-{n}` | Quiz Kenchiku | `quiz-sets.js` |
| `tt{n}_q{nn}` | JAC Teori question ID | `jac-teori.js` |
| `st{n}_q{nn}` | JAC Lifeline question ID | `jac-lifeline.js` |

**Future JAC doboku/kenchiku IDs:** use `dt{n}_q{nn}` / `kt{n}_q{nn}`.

### 0C. File Naming
| Domain | File | Export |
|---|---|---|
| JAC Teori | `jac-teori.js` | `JAC_TEORI` |
| JAC Lifeline | `jac-lifeline.js` | `JAC_LIFELINE` |
| JAC Doboku (stub) | `jac-doboku.js` | `JAC_DOBOKU` |
| JAC Kenchiku (stub) | `jac-kenchiku.js` | `JAC_KENCHIKU` |
| Shim | `jac-official.js` | `JAC_OFFICIAL` |
| Cards (common+LL) | `cards-common.js`, `cards-lifeline.js` | (merged) |
| Cards (future) | `cards-doboku.js`, `cards-kenchiku.js` | (stubs) |

### 0D. Quote Style
| File(s) | Style |
|---|---|
| All data files | single-quote `'` ✅ canonical |

> **Note:** `cards-common.js` and `cards-lifeline.js` still use double-quote strings — known inconsistency. Do NOT bulk-requote.

### 0E. `source` Field Values on Cards
From JAC PDF: `jac-ch1` through `jac-ch7`
From JAC sample exams: `jac-gakka1`, `jac-gakka2`, `jac-jitsugi1`, `jac-jitsugi2`
Vocab: `vocab-core`, `vocab-exam`, `vocab-jac`, `vocab-lifeline`, `vocab-teori`, `vocab-general`, `vocab-supplementary`
Other: `text3l`
New cards from JAC Doboku sample exams → `jac-gakka-d{n}` / `jac-jitsugi-d{n}`. Kenchiku → `-k{n}`.

> ⚠️ **OWNER DECISION NEEDED — source naming for doboku/kenchiku chapter cards**  
> If JAC doboku/kenchiku PDFs use chapter structure (Ch.1–Ch.N), what `source` value should cards use?  
> **Option A:** `jac-ch{n}-d` / `jac-ch{n}-k` (suffix the track)  
> **Option B:** `jac-doboku-ch{n}` / `jac-kenchiku-ch{n}` (prefix the track)  
> **Option C:** Reuse existing `jac-ch{n}` (if shared chapters — e.g. common safety content)  
> `cards-doboku.js` is currently empty — no existing values to derive from. Decide before first card batch.

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
  type,         // 'konsep' | 'hukum' | 'vocab'  — see §1E for definitions
  id_text,      // Indonesian definition
  desc,         // Indonesian context description
  usage,        // [OPTIONAL — see §1F] usage example sentence
  _origIndex,   // [SOURCE ONLY — see §1G] stripped by merge script — do not edit
}
```
`quote` field: **DELETED** in v7. Zero remaining in both source files.

### 1E. `type` Enum — Definitions (VERIFIED session 6)

| Value | Common | Lifeline | Definition |
|---|---|---|---|
| `konsep` | ✅ 406 | ✅ 286 | Conceptual/procedural knowledge — not a law, not pure vocab |
| `vocab` | ✅ 377 | ✅ 278 | Vocabulary term — Japanese term + Indonesian gloss, may have desc |
| `hukum` | ✅ 96 | ❌ 0 | Law, regulation, or legal provision — common track only |

**No anomalies found.** Lifeline correctly has zero `hukum` cards — all legal content is in common.  
Future doboku/kenchiku cards: use same three values. `hukum` is valid for track-specific regulations.

### 1F. `usage` Field Policy (VERIFIED session 6)

| File | Cards with `usage` | Cards without |
|---|---|---|
| `cards-common.js` | 123 | 756 |
| `cards-lifeline.js` | 30 | 534 |
| **TOTAL** | **153** | **1,290** |

**Policy (owner decision):** `usage` is **optional**. Absent = no usage example available.  
**Rule:** Do NOT null-fill missing `usage`. Do NOT bulk-add. Leave absent cards as-is.  
When adding new cards (doboku/kenchiku), include `usage` only if a natural example exists.

### 1G. `_origIndex` Field Policy (VERIFIED session 6)

`_origIndex` exists in **source files only** (`src/data/source/cards-*.js`) and **split card files** (`src/data/cards/**/*.js`). It does **NOT** appear in the exported `src/data/cards.js`.

| File | `_origIndex` present |
|---|---|
| `src/data/source/cards-common.js` | ✅ 879 (intentional) |
| `src/data/source/cards-lifeline.js` | ✅ 564 (intentional) |
| `src/data/cards/**/*.js` (split files) | ✅ 1,443 (intentional) |
| `src/data/cards.js` (exported) | **0** — stripped by merge script ✅ |

**Rule:** Do NOT strip `_origIndex` from source or split files. It is a merge-time artifact used to preserve original ordering. The merge script (`scripts/merge-cards.mjs`) strips it automatically when generating `cards.js`.  
**On `content-dq` branch:** `_origIndex` is retained in split files. It will be stripped when reassembled into `cards.js` at main-merge time.

### 1A. Current `jp` Ruby Status
| File | Total | Has 《》 ruby | Maru（kanji）remaining | Bare kanji | Pure kana/romaji |
|---|---|---|---|---|---|
| `cards-common.js` | 879 | ~762 | ~44 (kanji-in-maru, kept) | 0 | ~73 |
| `cards-lifeline.js` | 564 | ~452 | ~21 (kanji-in-maru, kept) | 0 | ~91 |
| **TOTAL** | **1,443** | **~1,214** | **~65** | **0** | **~164** |

### 1B. `furi` Typos — FIXED in v7
| id | Was | Fixed to |
|---|---|---|
| 532 | `ねちゅうしょうのしょうじょう` | `ねっちゅうしょうのしょうじょう` ✅ |
| 230 | `てにょうくぎじまい` | `てんようくぎじまい` ✅ |

### 1C. Multi-Part `furi` — 211 cards (OPEN — **needs owner**)
Cards where `jp` has multi-part segments (・ vs / ：) but `furi` is unseparated flat string.
Fix: align `furi` separators to match `jp`. **Requires Japanese knowledge — owner does this.**
```js
// BAD
jp: "加湿器 vs 除湿器", furi: "かしつきじょしつき"
// GOOD
jp: "加湿器 vs 除湿器", furi: "かしつき vs じょしつき"
```

### 1D. Ruby Format Rules (canonical)
```js
// Full compound — annotate entire reading, NEVER suffix-only
"呼水装置《こすいそうち》"   // ✅
"呼水装置《そうち》"         // ❌

// Multi-part — separator preserved, ruby per segment
"加湿器《かしつき》 vs 除湿器《じょしつき》"

// Mixed JP/katakana — only kanji compounds get ruby
"ディスクグラインダー 高速型《がた》 vs 低速型《がた》"

// Maru retained for non-reading content (synonyms, abbrevs, explanations)
"危険予知活動（KY活動）"   // ✅ keep
"アスベスト（石綿）"       // ✅ keep
"時間外労働（残業）"        // ✅ keep
```

---

## PART 2 — SCHEMA STATUS

### Unified Question Schema (canonical — all JAC sets use this)
```js
{
  id,       // string ID e.g. 'tt1_q01', 'st1_q01', 'kt1_q01', 'dt1_q01'
  q,        // JP question string with 《》 ruby
  hint,     // Indonesian paraphrase of q (required)
  opts,     // JP options array with 《》 ruby
  opts_id,  // Indonesian options array (parallel)
  ans,      // 0-based index
  img,      // image filename string | null (null = no image yet / no image)
  exp,      // Indonesian explanation, min 30 chars
  // set-level fields: id, set, setLabel, topic, track, related_card_id
}
```

> **`img` field:** All JAC sets (teori, lifeline, doboku, kenchiku) have photo-based questions. Use `img: null` as placeholder — populate filename when assets are ready. `hasPhoto` boolean is **deprecated** — replaced by `img`.

### JAC Exam Session Pairing
Each track has 2 exam sessions. Default pairing (teori shared across all tracks):
```
Lifeline:  Teori Set 1 (tt1) + Lifeline Set 1 (st1)
           Teori Set 2 (tt2) + Lifeline Set 2 (st2)
Kenchiku:  Teori Set 1 (tt1) + Kenchiku Set 1 (kt1)
           Teori Set 2 (tt2) + Kenchiku Set 2 (kt2)
Doboku:    Teori Set 1 (tt1) + Doboku Set 1 (dt1)
           Teori Set 2 (tt2) + Doboku Set 2 (dt2)
```
`jac-teori.js` is shared — same 65 qs used by all 3 tracks.

### ID Conventions
| File | Question ID format |
|---|---|
| `jac-teori.js` | `tt{n}_q{nn}` |
| `jac-lifeline.js` | `st{n}_q{nn}` |
| `jac-kenchiku.js` | `kt{n}_q{nn}` |
| `jac-doboku.js` | `dt{n}_q{nn}` |

---

## PART 3 — WAYGROUND QUESTIONS

### Set List (26 files, 657 total qs)

**Teori sets — track: `common`**
| ID | Subtitle | qs |
|---|---|---|
| `wt1` | Teori Set 1 | 19 |
| `wt2`–`wt10` | Teori Set 2–10 | 20 each |
| **Total wt** | | **199** |

**Vocab/Praktik sets — track: `lifeline`**
| ID | Title | Subtitle | qs | Notes |
|---|---|---|---|---|
| `wg1`–`wg5` | Praktik Set 1–5 | Quizizz-imported | 20 each | 100 total |
| `wg6` | Vocab Set 1 | Kosakata ライフライン第5章 | 50 | |
| `wg7` | Vocab Set 2 | Kosakata ライフライン第6章 (1) | 46 | |
| `wg8` | Vocab Set 3 | Kosakata ライフライン第6章 (2) | 45 | |
| `wg9` | Vocab Set 4 | Kosakata ライフライン第6章 (3) | 45 | |
| `wg11` | Vocab Set 5 | Kosakata ライフライン言葉第5章 | 50 | |
| `wg12` | Vocab Teori Set 1 | 学科キーワード 法規・安全・施工管理 | 22 | ⚠️ track bug — see H10 |
| `wp1`–`wp5` | Praktik Set 1–5 | | 20 each | 100 total |
| **Total wg+wp** | | | **458** | |

**Grand total: 657 qs across 26 files**
> No `wg10` — was renamed to `wp5`. No `wg12` is excluded from grand total reassignment pending H10 fix.

> ~~**`wg12` track bug**~~ **FIXED (H10):** `track` corrected to `"common"`. Content is 学科 keywords, not lifeline-specific.

> **`wg6`–`wg11` short `exp` fields** are intentional vocab-recognition format — do NOT expand.

---

## PART 4 — CSV SETS (`csv-sets.js`, 12 sets, 300 qs)

### Ruby Status (post-audit v12 — ACTUAL counts)
| Field | Status |
|---|---|
| `q` ruby | Partially done — 39 q lines have **double ruby corruption** (needs fix first) |
| `opts` ruby | **198/300 opts lines completely bare** — major gap |
| `hint` | ✅ all present |
| `exp` "modul JAC" stubs | ~40 items — OPEN P15 |

> **Wrong ruby (26 lines):** Haiku put kanji synonyms/explanations inside 《》 — e.g. `時間外労働《残業》`, `グラインダー《研削盤》`. These violate the maru rule and must be reverted to `（）`.

---

## PART 5 — QUIZ SETS (`quiz-sets.js`, 6 sets, 90 qs)

Set IDs: `doboku-01`, `doboku-02`, `doboku-03`, `kenchiku-01`, `kenchiku-02`, `kenchiku-03`.

### Schema Gaps (OPEN P13)
| Field | Status |
|---|---|
| `q` ruby | 0/90 — all bare kanji |
| `opts` ruby | 0/~360 |
| `hint` | missing on all 90 |
| `id` per question | missing on all 90 |
| `exp` quality | ✅ avg 154 chars — good |
| `cat`, `desc` | present (extra fields — keep until DC-1/DC-2 migration) |

---

## PART 6 — JAC_TEORI + JAC_LIFELINE (95 qs)

| File | qs | `related_card_id` filled | null |
|---|---|---|---|
| `jac-teori.js` | 65 | 44 | **21** |
| `jac-lifeline.js` | 30 | 29 | 1 |

Schema migration complete (P16). `hasPhoto` deprecated → replaced by `img: null` on all qs (teori 65 + lifeline 30).

---

## PART 7 — CONFUSION_PAIRS (28 entries)

| Field | Status |
|---|---|
| `termA` / `termB` ruby | ✅ DONE v8 |
| `furiA` / `furiB` | ✅ present |
| `tip_id` field | missing — OPEN P17 (agent task) |
| `track` field | missing on all 28 — OPEN |

---

## PART 8 — DANGER_PAIRS (20 entries)

| Field | Status |
|---|---|
| `term` ruby | ✅ DONE v8 — 17/20 (3 pure kana/romaji skipped) |
| `furi` | ✅ all 20 |
| `track` | ✅ all 20 |
| `traps[]` + `explanation` ruby | audit needed — OPEN P19 (agent task) |

---

## PART 9 — ANGKA_KUNCI (29 entries)

| Field | Status |
|---|---|
| `soal` ruby | ✅ DONE v8 — all 29 |
| `kartu` (numeric card ID) | 24/29 filled ✅ |
| `mnemonic` | ✅ all 29 |
| `track` | ✅ all 29 |

> `kartu` is a **number** (card id), NOT a string field named `kartu_id`.

---

## MASTER EXECUTION ORDER (v12)

### 🔴 Corruption fixes — DONE
| Task | File | Scope | Status |
|---|---|---|---|
| **P11-FIX-A** | `sets/csv/*.js` | Remove double ruby from 39 q lines | ✅ DONE (split files) |
| **P11-FIX-B** | `sets/csv/*.js` | Revert 26 wrong 《》 → （） (synonyms/abbrevs) | ✅ DONE (split files) |
| **P12-FIX** | `sets/wayground/*.js` | Remove double ruby from 217 lines | ✅ DONE (split files) |

> **Note:** Monolithic `csv-sets.js` and `wayground-sets.js` still show corruption — these are legacy originals, intentionally not edited on `content-dq`. Split files in `src/data/sets/` are the working source of truth. Monolithics will be replaced at main-merge time.

### 🟡 Content tasks — DONE
| Task | File | Scope | Status |
|---|---|---|---|
| **P11-C** | `sets/csv/*.js` | Annotate 198 bare opts lines | ✅ DONE (split files) |
| **P13-content** | `sets/quiz/*.js` | Ruby for 90 q + ~360 opts + 90 hints | ✅ DONE |
| **P15** | `sets/csv/*.js` | Replace ~40 "modul JAC" exp stubs | ✅ DONE |
| **P7** | `src/data/cards/**/*.js` | Align furi separators — 152 fixed, 5 romaji-only accepted | ✅ DONE |
| **P18** | `sets/jac/jac-teori.js` | Fill 21 null `related_card_id` — 0 null remaining | ✅ DONE |

### 🔵 Agent tasks — DONE
| Task | File | Scope | Status |
|---|---|---|---|
| **P13-struct** | `sets/quiz/*.js` | Add `id` (1-indexed per set) to all 90 qs | ✅ DONE |
| **P14** | `sets/wayground/*.js` | Expand ~28 stub `exp` fields | ✅ DONE |
| **P16** | `sets/jac/jac-teori.js`, `sets/jac/jac-lifeline.js` | Schema migration — 95 qs | ✅ DONE |
| **P17** | `confusion-pairs.js` | Add `tip_id` field to 28 entries — 0 null remaining | ✅ DONE |
| **P19** | `danger-pairs.js` | Audit `traps`/`explanation` ruby | ✅ DONE |
| **P21** | stubs | Populate `jac-doboku.js` + `jac-kenchiku.js` — **jitsugi** (praktik bergambar) soal per track, bukan teori. Schema sama: `q/hint/opts/opts_id/ans/img/exp`. `img: null` semua dulu. Source: PDF jitsugi doboku/kenchiku. | ⏸ DEFERRED — blocked, belum ada PDF |

### ✅ Done
| Task | Notes |
|---|---|
| H9 | Fix orphaned duplicate opts lines in ct01.js + ct02.js — both exit clean |
| H10 | wg12 `track: "lifeline"` → `"common"` |
| H11 | Add `track` field to 6 quiz split files (doboku-01/02/03, kenchiku-01/02/03) |
| S1 | Split gakka.js: 8→common/vocab-jac.js (67), 9→lifeline/vocab-jac.js (23), deleted |
| S2 | Merge jitsugi.js (19) → lifeline/vocab-jac.js (42 total), deleted |
| S3 | Migrate vocab-common.js (114) → common/vocab-supplementary.js (247 total), deleted |
| S4 | Redistribute vocab-lifeline.js (235) by category: ch5(278)/ch6(204)/ch7(56)/vocab-supp(175), deleted |
| P0–P0d | UI fixes, wg renames, quote removal |
| P1 | Delete all `quote` fields (590 removed) |
| P2 | Fix 4 malformed jp-ruby cards (ids 293,476,489,491) |
| P3 | Fix 2 furi typos (ids 532, 230) |
| P4 | 220 maru→ruby conversions (119 maru retained — correct) |
| P5 | 1,020 bare-kanji jp fields annotated |
| P6 | 153 multi-part jp fields annotated per-segment |
| P7b | Add CONFUSION_PAIRS to index.js |
| P7c | Rename wg10→wp5; fix titles |
| P7d | Standardize quote style in jac-* |
| P8 | Ruby on termA/termB in confusion-pairs (28 pairs) |
| P9 | Ruby on term in danger-pairs (17/20; 3 kana/romaji skipped) |
| P10 | Ruby on soal in angka-kunci (29 items) |
| P11 (q only) | csv-sets.js q lines annotated — **but corrupted, needs P11-FIX-A/B first** |
| P12 (coverage) | wayground-sets.js bare kanji cleared — **but corrupted, needs P12-FIX first** |
| P20 | Rename sipil→doboku, bangunan→kenchiku |

---

## AGENT RULES (canonical)

- **Edit source files** `src/data/source/` for cards; all other data files edit directly.
- **After any card source edit (on `main`):** run `node scripts/merge-cards.mjs`
- **On branch `content-dq`:** merge script tidak tersedia. Edit `src/data/source/cards-*.js` DAN `src/data/cards.js` secara bersamaan. Regenerasi otomatis terjadi saat merge ke `main`.
- **Never edit** `src/data/cards.js` directly on `main` — auto-generated. On `content-dq`, editing it manually is permitted only alongside a matching source file edit.
- **Never bulk-touch** `furi` fields — only confirmed typos.
- **Ruby format:** annotate full compound reading, never suffix-only.
- **Maru `（）` with non-kana content** (synonyms, abbreviations, definitions, explanations) — do NOT convert to `《》`. Only pure-hiragana/katakana readings get converted.
- **`exp` minimum:** 30 chars for non-vocab sets; real Indonesian, not placeholder.
- **wg6/wg7/wg8/wg9/wg11 short exp** = intentional vocab-recognition format — do NOT expand.
- **`angka.kartu`** is a number (card id), not a string field `kartu_id`.
- **Track values:** `common`, `lifeline`, `doboku`, `kenchiku` only.
- **Single-quote strings** in all data files — canonical. Exception: `cards-common.js` / `cards-lifeline.js` use double-quotes — do not change.
- **Storage version:** currently `5`. Next schema change → bump to `6`.

---

## CODEBASE STATE (v13 — storage version 5, unchanged)

> **`content-dq` branch note:** Split files in `src/data/sets/` and `src/data/cards/` are the **working source of truth**. Monolithic files (`csv-sets.js`, `wayground-sets.js`, `quiz-sets.js`) are legacy originals retained for reference — intentionally not edited on this branch. They will be replaced at main-merge time by reassembling from split files.

| File | Last changed | Notes |
|---|---|---|
| `src/storage/schema.js` | v8 | STORAGE_VERSION = 5 |
| `src/storage/engine.js` | v8 | v4→v5 migration wired |
| `src/data/source/cards-common.js` | v10 (P6) | 879 cards, jp ruby complete |
| `src/data/source/cards-lifeline.js` | v10 (P6) | 564 cards, jp ruby complete |
| `src/data/source/cards-doboku.js` | stub | 0 cards — empty, ready for Ch.5+ content |
| `src/data/source/cards-kenchiku.js` | stub | 0 cards — empty, ready for Ch.5+ content |
| `src/data/cards.js` | v10 | Regenerated — 1,443 cards |
| `src/data/cards/**/*.js` | session 9 (S1–S4) | Split files — furi aligned, ruby complete ✅. Restructure complete: deprecated files deleted, 1,443 cards redistributed ✅ |
| `src/data/confusion-pairs.js` | session 6 (P17) | 28 pairs, termA/B ruby done, tip_id filled ✅ |
| `src/data/danger-pairs.js` | session 6 (P19) | 20 items, term + traps + explanation ruby done ✅ |
| `src/data/angka-kunci.js` | v8 (P10) | 29 items, soal ruby done ✅ |
| `src/data/sets/csv/*.js` | session 9 (H9) | Double ruby fixed, wrong 《》 reverted, opts annotated ✅. ct01.js + ct02.js syntax errors fixed ✅ |
| `src/data/sets/wayground/*.js` | session 9 (H10) | Double ruby fixed, exp stubs filled ✅. wg12 track corrected: "lifeline"→"common" ✅ |
| `src/data/sets/quiz/*.js` | session 9 (H11) | id field added, hints filled, ruby done ✅. track field added to all 6 files ✅ |
| `src/data/sets/jac/jac-teori.js` | session 6 (P16/P18) | Schema migrated, related_card_id complete ✅ |
| `src/data/sets/jac/jac-lifeline.js` | session 6 (P16) | Schema migrated ✅ |
| `src/data/csv-sets.js` | v11 | ⚠️ Legacy monolithic — corrupted, do not use. Working copy: `sets/csv/` |
| `src/data/wayground-sets.js` | v11 | ⚠️ Legacy monolithic — corrupted, do not use. Working copy: `sets/wayground/` |
| `src/data/jac-doboku.js` | stub | empty `JAC_DOBOKU = []` — awaiting PDF |
| `src/data/jac-kenchiku.js` | stub | empty `JAC_KENCHIKU = []` — awaiting PDF |

---

## PART 10 — SPLIT FILE STRUCTURE (content-dq branch only)

All content files have been split into granular files for isolated DQ work.
**When merging to main**, agent reassembles these back into monolithic files.
**Card restructure (S1–S4) complete** — deprecated files deleted, 1,443 cards redistributed. ✅

### 10A. Question Sets — current state ✅
```
src/data/sets/
  csv/          cp01.js–cp06.js  (lifeline, 20qs each)
                ct01.js–ct06.js  (common, 30qs each)
                ct01.js + ct02.js syntax errors fixed ✅ (H9)
  wayground/    wt1.js–wt10.js, wg1.js–wg9.js, wg11.js, wg12.js, wp1.js–wp5.js
                (26 files — see Part 3 for full inventory)
  quiz/         doboku-01.js–03.js, kenchiku-01.js–03.js   (6 files, 15qs each)
                track field added to all 6 files ✅ (H11)
  jac/          jac-teori.js, jac-lifeline.js               (2 files, unchanged)
```

### 10B. Card Split Files — CURRENT state (post S1–S4 restructure ✅)

> **Restructure COMPLETE as of session 9.** All deprecated files deleted. 1,443 cards preserved, zero data change.

```
src/data/cards/
  common/
    ch1.js                    28 cards  ✅ pure source: jac-ch1
    ch2.js                    75 cards  ✅ pure source: jac-ch2
    ch3.js                   131 cards  ✅ pure source: jac-ch3
    ch4.js                   140 cards  ✅ pure source: jac-ch4
    vocab-jac.js              67 cards  ✅ vocab-jac + jac-gakka1/2 (S1)
    vocab-supplementary.js   247 cards  ✅ supplementary + vocab-common migrated (S3)
    [DELETED] gakka.js                     (S1 — split to vocab-jac common+lifeline)
    [DELETED] vocab-common.js              (S3 — migrated to vocab-supplementary)

  lifeline/
    ch5.js                   278 cards  ✅ jac-ch5 + denki/tsushin/sekou from S4
    ch6.js                   204 cards  ✅ jac-ch6 + haikan/hoon/shoubou/setsubi_kougu from S4
    ch7.js                    56 cards  ✅ jac-ch7 + anzen from S4
    vocab-jac.js              42 cards  ✅ vocab-jac + jac-jitsugi1/2 (S1+S2)
    vocab-supplementary.js   175 cards  ✅ supplementary + career cards from S4
    [DELETED] jitsugi.js                   (S2 — merged to lifeline/vocab-jac.js)
    [DELETED] vocab-lifeline.js            (S4 — distributed by category)
```

**Grand total: 1,443 cards** (28+75+131+140+67+247+278+204+56+42+175 = 1,443 ✅)

### 10C. Card Split Files — TARGET state (post S1–S4) ✅ ACHIEVED

> **Target state reached.** Section retained for historical reference — see 10B for current canonical state.

### 10D. Card taxonomy — canonical rules (locked this session)

**Two orthogonal dimensions:**
```
Dimension 1 — CHAPTER (source field): where in the textbook
  jac-ch1..ch4  → common/ folder
  jac-ch5..ch7  → lifeline/ folder

Dimension 2 — TOPIC (category field): what the content is about
  gaiyou, career, hourei, sekou, anzen  → K-series (teori/umum)
  haikan, denki, tsushin, shoubou,
  hoon, setsubi_kougu                   → L-series (lifeline equipment)
```

Chapter and category are **orthogonal** — the same category (e.g. `haikan`) appears in both ch3 (introductory) and ch6 (advanced). This is correct per textbook structure.

**File roles:**
| File | Contains | Source filter |
|---|---|---|
| `chN.js` | All cards from JAC textbook chapter N | `jac-chN` |
| `vocab-jac.js` (common) | Vocab from JAC official sample exams 学科 | `vocab-jac`, `jac-gakka1`, `jac-gakka2` |
| `vocab-jac.js` (lifeline) | Vocab from JAC official sample exams 実技 | `vocab-jac`, `jac-jitsugi1`, `jac-jitsugi2` |
| `vocab-supplementary.js` | All vocab not from JAC textbook chapters or official exams | everything else |

**Rule:** Never put a card in `chN.js` unless its `source` is `jac-chN`. Cards from other sources that belong to the same domain go to vocab-supplementary.

### 10E. Split file export naming
- Sets: `export const SET_CP01 = {...}` (set object with questions array inside)
- Cards: `export const CARDS_CH1 = [...]` (card array)

### 10F. Monolithic originals (reference only — do not edit)
`src/data/csv-sets.js`, `src/data/wayground-sets.js`, `src/data/quiz-sets.js`,
`src/data/source/cards-common.js`, `src/data/source/cards-lifeline.js`

---

## PART 12 — FUTURE DEVELOPMENT NOTES

### 12A. Agent task scope per split file (DQ)
Each split file is self-contained. Work one file at a time:
1. Clone branch, open target file
2. Apply DQ fixes (ruby, opts, hints, exp stubs)
3. Verify, commit, push
4. Proceed to next file

### 12B. Option B — Chapter & Type filter UI (DEFERRED — post card restructure)

**Context:** Currently FlashcardMode has only two filter dimensions: text search and `__cat:` category filter. The `source` and `type` fields on cards are populated but not exposed to the user. This creates a UX gap — user cannot say "show me only ch5 vocab" or "vocab cards only."

**When:** After S1–S4 card restructure is complete and verified on `content-dq`.

**What to build:**
- **Chapter filter** — FilterBar dropdown: "Semua bab" / "Bab 5" / "Bab 6" / "Bab 7" (powered by `source: jac-chN`)
- **Type filter** — Toggle: "Semua" / "Vocab saja" / "Konsep saja" (powered by `type: 'vocab'|'konsep'|'hukum'`)
- Both filters should compose with existing category filter

**Files to touch:**
- `src/modes/FlashcardMode/FilterBar.jsx` — add filter controls
- `src/modes/FlashcardMode/index.jsx` — add filter state + apply to `displayCards`
- `src/router/ModeRouter.jsx` — no change needed (filters are in-mode, not at card-load level)

**Data already ready:**
- `source` field: `jac-ch5` / `jac-ch6` / `jac-ch7` on all chapter cards ✅
- `type` field: `konsep` / `vocab` / `hukum` on all cards ✅
- After S1–S4: chapter cards will be in clean `chN.js` files and source will be authoritative

**Dependency:** S1–S4 must be merged and verified first. Do not build Option B against the current mixed/deprecated file state.

---

## PART 11 — DOBOKU/KENCHIKU PRE-EXPANSION STATE (session 6 audit)

### 11A. Category Stubs — VERIFIED ✅
`src/data/categories.js` already defines doboku/kenchiku track categories with `placeholder: true`.

| Key | Label | Module | Track | Status |
|---|---|---|---|---|
| `doboku_doko` | 土工事・インフラ | D1 | `doboku` | stub ✅ |
| `doboku_hoso` | 舗装・道路 | D2 | `doboku` | stub ✅ |
| `doboku_haisui` | 排水・基礎・杭 | D3 | `doboku` | stub ✅ |
| `kenchiku_kutai` | 躯体工事 | B1 | `kenchiku` | stub ✅ |
| `kenchiku_shiage` | 仕上げ・内装 | B2 | `kenchiku` | stub ✅ |

All marked `placeholder: true, note: 'Future Ch.5+ content'`. Do NOT remove `placeholder` until content is populated.  
**Rule:** When adding doboku/kenchiku cards, assign to these category keys. Do NOT invent new category keys without owner approval.

### 11B. File Locations — VERIFIED ✅

| File | Location | Notes |
|---|---|---|
| `jac-doboku.js` | `src/data/jac-doboku.js` | TOP-LEVEL — not in `sets/jac/` |
| `jac-kenchiku.js` | `src/data/jac-kenchiku.js` | TOP-LEVEL — not in `sets/jac/` |
| `cards-doboku.js` | `src/data/source/cards-doboku.js` | Source stub — 0 cards |
| `cards-kenchiku.js` | `src/data/source/cards-kenchiku.js` | Source stub — 0 cards |

`src/data/sets/jac/` only contains `jac-teori.js` and `jac-lifeline.js` (split DQ copies). Doboku/kenchiku stubs do NOT go in `sets/jac/`.

### 11C. `_origIndex` Policy — VERIFIED ✅ (no action needed)

`_origIndex` is stripped automatically by `scripts/merge-cards.mjs` at merge time.  
Verified: `src/data/cards.js` exports **0** `_origIndex` fields.  
Source files and split card files retain it intentionally — it is a merge ordering artifact, not a data field.  
**Do NOT strip from source or split files. Do NOT export to consumers.**

### 11D. `usage` Field Policy — LOCKED (owner decision)

`usage` is **optional**. 153/1,443 cards have it. Absent = intentional.  
**No null-fill. No bulk addition.** New doboku/kenchiku cards: include only if natural example exists.

### 11E. Source Naming for Doboku/Kenchiku Chapter Cards

> ⚠️ **OWNER DECISION PENDING** — see §0E for options (A/B/C).  
> `cards-doboku.js` and `cards-kenchiku.js` are currently empty.  
> Resolve before first card batch for either track.

---

## PART 12 — SESSION 10 UPDATES (source audit + new features)

**Updated:** May 2026 — session 10 (F1–F3 source cleanup, full PDF audit, new feature specs)

### 12A. Source Audit — COMPLETE ✅

All 1,443 cards audited against **11 JAC PDFs** (7 textbook + 4 soal ujian lifeline):

**PDFs used:**
| Source key | File | Content |
|---|---|---|
| `jac-ch1` | text1l.pdf | Ch.1 — 日本の現場 |
| `jac-ch2` | text2.pdf | Ch.2 — 法令 |
| `jac-ch3` | text3.pdf | Ch.3 — 建設工事の種類 |
| `jac-ch4` | text4.pdf | Ch.4 — あいさつ・用語 |
| `jac-ch5` | text5l.pdf | Ch.5 — 工具・機械・材料 |
| `jac-ch6` | text6l.pdf | Ch.6 — 施工知識 |
| `jac-ch7` | text7l.pdf | Ch.7 — 安全 |
| `jac-gakka1` | tt_sample.pdf | 学科 サンプル問題 |
| `jac-gakka2` | tt_sample2.pdf | 学科 追加サンプル問題 |
| `jac-jitsugi1` | st_sample_l.pdf | 実技 lifeline サンプル問題 |
| `jac-jitsugi2` | st_sample2_l.pdf | 実技 lifeline 追加サンプル問題 |

**Fixes shipped:**
- F1: `text3l` (25 cards) → `jac-ch3` — confirmed in text3.pdf
- F2: 120 single-match cards → correct `jac-chN` via PDF trace
- F3: `text3l` removed from `categories.js` (SOURCE_META, SOURCE_GROUPS, SOURCE_ACCENT)

**Remaining legacy labels — INTENTIONAL, DO NOT CHANGE:**

| Label | Count | Nature |
|---|---|---|
| `vocab-supplementary` | 271 | External — technical vocab not in any JAC PDF |
| `vocab-lifeline` | 113 | Cross-chapter + external lifeline terms |
| `vocab-jac` | 49 | Cross-chapter JAC terms (appear in both textbook + exam PDFs) |
| `vocab-general` | 44 | External — general construction vocab |
| `vocab-exam` | 38 | Cross-chapter exam-prep terms |
| `vocab-teori` | 20 | Cross-chapter theory terms |
| `vocab-core` | 13 | Cross-chapter core terms |

These labels are pedagogically meaningful and displayed to users via `SOURCE_META`. Multi-match terms cannot be attributed to a single chapter — keeping labels is correct.

### 12B. Doboku & Kenchiku — CONFIRMED AI-GENERATED ⚠️

**Owner confirmed (session 10):** No JAC PDFs exist for doboku or kenchiku tracks. The 2 seed sets (SIPIL_SETS and BANGUNAN_SETS in `quiz-sets.js`) were generated by Claude Opus with no reference to real JAC materials.

**Implications:**
- P21 (`jac-doboku.js` + `jac-kenchiku.js`) remains **BLOCKED** — no source PDF
- AI-generated quiz sets should be treated as draft/placeholder content
- When real doboku/kenchiku PDFs arrive, those sets will need full audit against source
- Do NOT use AI-generated sets as reference for card content

### 12C. PDF Viewer Mode — NEW FEATURE (not yet implemented) ⚠️ BLOCKED

**Owner decision:** Add a new mode for reading JAC textbook PDFs inside the app.

**Spec:**
- Fetch PDFs directly from official JAC URLs (internet required — accepted)
- 7 PDFs: text1l through text7l (Japanese)
- Future: +7 PDFs Indonesian translation (owner will supply)
- Implementation: fetch-on-demand, no bundling
- UI: chapter picker → PDF display

**Status: BLOCKED** — owner needs to supply official JAC PDF URLs before implementation.
Agent must NOT guess or hardcode URLs. Wait for owner to provide.

**When ready:** implement as new mode (e.g. `TeksMode` or `BacaMode`), React.lazy(), follows constraint #3 (all modes lazy). Add to `src/router/modes.js` registry.
