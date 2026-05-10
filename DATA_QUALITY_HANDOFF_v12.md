# SSW Konstruksi — Data Quality Handoff v12
**Updated:** May 2026 — session 5 (admin/audit pass)
**Supersedes:** v1–v11 (this is the canonical single-source handoff)
**Scope:** ALL content files — cards + soal + pairs + angka
**Repo:** https://github.com/nuggetenak/Nugget-Nihongo-SSW-Konstruksi/
**Last commit:** `f4a47fb`

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

### Set List (26 sets, 657 total qs)
| ID | Title | Track | qs |
|---|---|---|---|
| `wt1`–`wt10` | Teori Set 1–10 | `common` | varies |
| `wg1`–`wg5` | Praktik Set 1–5 (quizizz) | `lifeline` | 20 each |
| `wp5` | Praktik Set 5 (was wg10) | `lifeline` | 20 |
| `wp1`–`wp4` | Praktik Set 1–4 | `lifeline` | 20 each |
| `wg6` | Vocab Set 1 | `lifeline` | 50 |
| `wg7` | Vocab Set 2 (was Set 7) | `lifeline` | 46 |

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

### 🔴 Corruption fixes — agent, do first
| Task | File | Scope | Status |
|---|---|---|---|
| **P11-FIX-A** | `csv-sets.js` | Remove double ruby from 39 q lines | ❌ OPEN |
| **P11-FIX-B** | `csv-sets.js` | Revert 26 wrong 《》 → （） (synonyms/abbrevs) | ❌ OPEN |
| **P12-FIX** | `wayground-sets.js` | Remove double ruby from 217 lines | ❌ OPEN |

### 🟡 Content tasks — owner does these (needs Japanese knowledge)
| Task | File | Scope | Status |
|---|---|---|---|
| **P11-C** | `csv-sets.js` | Annotate 198 bare opts lines | ❌ OPEN |
| **P13-content** | `quiz-sets.js` | Ruby for 90 q + ~360 opts + 90 hints | ❌ OPEN |
| **P15** | `csv-sets.js` | Replace ~40 "modul JAC" exp stubs | ❌ OPEN |
| **P7** | `cards-common.js`, `cards-lifeline.js` | Align furi separators — 211 cards | ❌ OPEN |
| **P18** | `jac-teori.js` | Fill 21 null `related_card_id` | ❌ OPEN |

### 🔵 Agent tasks — scripting only
| Task | File | Scope | Status |
|---|---|---|---|
| **P13-struct** | `quiz-sets.js` | Add `id` (1-indexed per set) to all 90 qs | ❌ OPEN |
| **P14** | `wayground-sets.js` | Expand ~28 stub `exp` fields | ❌ OPEN |
| **P16** | `jac-teori.js`, `jac-lifeline.js` | Schema migration — 95 qs | ❌ OPEN |
| **P17** | `confusion-pairs.js` | Add `tip_id` field to 28 entries | ❌ OPEN |
| **P19** | `danger-pairs.js` | Audit `traps`/`explanation` ruby | ❌ OPEN |
| **P21** | stubs | Populate `jac-doboku.js` + `jac-kenchiku.js` — **jitsugi** (praktik bergambar) soal per track, bukan teori. Schema sama: `q/hint/opts/opts_id/ans/img/exp`. `img: null` semua dulu. Source: PDF jitsugi doboku/kenchiku. | PENDING |

### ✅ Done
| Task | Notes |
|---|---|
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

## CODEBASE STATE (v12 — storage version 5, unchanged)

| File | Last changed | Notes |
|---|---|---|
| `src/storage/schema.js` | v8 | STORAGE_VERSION = 5 |
| `src/storage/engine.js` | v8 | v4→v5 migration wired |
| `src/data/source/cards-common.js` | v10 (P6) | 879 cards, jp ruby complete |
| `src/data/source/cards-lifeline.js` | v10 (P6) | 564 cards, jp ruby complete |
| `src/data/cards.js` | v10 | Regenerated — 1,443 cards |
| `src/data/confusion-pairs.js` | v8 (P8) | 28 pairs, termA/B ruby done |
| `src/data/danger-pairs.js` | v8 (P9) | 20 items, term ruby done |
| `src/data/angka-kunci.js` | v8 (P10) | 29 items, soal ruby done |
| `src/data/csv-sets.js` | v11 (P11) | ⚠️ Corrupted — see P11-FIX-A/B |
| `src/data/wayground-sets.js` | v11 (P12) | ⚠️ Corrupted — see P12-FIX |

---

## PART 10 — SPLIT FILE STRUCTURE (content-dq branch only)

All content files have been split into granular files for isolated DQ work.
**When merging to main**, agent reassembles these back into monolithic files.

```
src/data/sets/
  csv/          cp01.js–cp06.js, ct01.js–ct06.js          (12 files, 20–30 qs each)
  wayground/    wt1.js–wt10.js, wg1.js–wg7.js, wp1.js–wp5.js  (26 files)
  quiz/         doboku-01.js–03.js, kenchiku-01.js–03.js   (6 files, 15 qs each)
  jac/          jac-teori.js, jac-lifeline.js               (2 files, unchanged)

src/data/cards/
  common/       ch1.js(28) ch2.js(72) ch3.js(110) ch4.js(101) ch5.js(78)
                ch6.js(34) ch7.js(35) gakka.js(17)
                vocab-jac.js(59) vocab-lifeline.js(98)
                vocab-misc.js(114) vocab-supplementary.js(133)
  lifeline/     ch2.js(3) ch3.js(21) ch4.js(39) ch5.js(122) ch6.js(71)
                gakka.js(19) vocab-jac.js(14) vocab-lifeline.js(54)
                vocab-misc.js(83) vocab-supplementary.js(138)
```

### Split file export naming
- Sets: `export const SET_CP01 = {...}` (set object with questions array inside)
- Cards: `export const CARDS_CH1 = [...]` (card array)

### Monolithic originals still present (for reference, do not edit these)
`src/data/csv-sets.js`, `src/data/wayground-sets.js`, `src/data/quiz-sets.js`,
`src/data/source/cards-common.js`, `src/data/source/cards-lifeline.js`

### Agent task scope per file (DQ)
Each split file is self-contained. Work one file at a time:
1. Clone branch, open target file
2. Apply DQ fixes (ruby, opts, hints, exp stubs)
3. Verify, commit, push
4. Proceed to next file
