# Data Architecture Audit — content-dq branch

**Date:** 2026-05-12 | **Last commit:** `d2ca97d` | **Auditor:** READ ONLY, zero edits

---

## 1. CARD FILES

### 1A. `src/data/cards.js` — Exported (auto-generated, working consumer)

- **Total:** 1,443 cards ✅ (header says 1443, matches actual count)
- **No `_origIndex` field** — stripped correctly by merge script ✅

**Source field distribution (actual from cards.js):**
| Source | Count | Notes |
|---|---|---|
| `vocab-supplementary` | 272 | External vocab, not in JAC PDFs |
| `jac-ch5` | 217 | |
| `jac-ch3` | 183 | |
| `jac-ch4` | 150 | |
| `jac-ch6` | 134 | |
| `vocab-lifeline` | 113 | Cross-chapter lifeline terms |
| `jac-ch2` | 99 | |
| `vocab-jac` | 49 | Cross-chapter JAC terms |
| `jac-ch7` | 48 | |
| `vocab-general` | 44 | External general construction |
| `vocab-exam` | 38 | Cross-chapter exam-prep |
| `jac-ch1` | 28 | |
| `vocab-teori` | 18 | Cross-chapter theory terms |
| `jac-jitsugi2` | 15 | |
| `jac-jitsugi1` | 13 | |
| `vocab-core` | 13 | |
| `jac-gakka1` | 6 | |
| `jac-gakka2` | 3 | |
| **TOTAL** | **1,443** | `text3l` = 0 ✅ (F1/F2/F3 complete) |

**⚠️ DISCREPANCY vs HANDOFF v16:**
Handoff §12 states `jac-ch2: 99`. Actual = 99 ✅
Handoff states `jac-ch3: 183`. Actual = 183 ✅
**However:** Handoff states `jac-ch5: 217` — actual also 217 ✅
Cards are consistent with handoff state. No discrepancy on source counts.

**Type field distribution:**
| Type | Count |
|---|---|
| `konsep` | 692 |
| `vocab` | 655 |
| `hukum` | 96 |
| **TOTAL** | **1,443** ✅ |

---

### 1B. `src/data/source/` — Source files (edit targets on `main`)

| File                | Cards     | Notes                                             |
| ------------------- | --------- | ------------------------------------------------- |
| `cards-common.js`   | 879       | Double-quote strings (intentional, do not change) |
| `cards-lifeline.js` | 564       | Double-quote strings (intentional)                |
| `cards-doboku.js`   | 0         | Stub — 4 lines total                              |
| `cards-kenchiku.js` | 0         | Stub — 4 lines total                              |
| **TOTAL**           | **1,443** | ✅ matches                                        |

---

### 1C. `src/data/cards/` — Split card files (working source of truth on `content-dq`)

| File                              | Cards     | Source filter              |
| --------------------------------- | --------- | -------------------------- |
| `common/ch1.js`                   | 28        | jac-ch1                    |
| `common/ch2.js`                   | 75        | jac-ch2                    |
| `common/ch3.js`                   | 131       | jac-ch3                    |
| `common/ch4.js`                   | 140       | jac-ch4                    |
| `common/vocab-jac.js`             | 67        | vocab-jac + jac-gakka1/2   |
| `common/vocab-supplementary.js`   | 247       | supplementary              |
| `lifeline/ch5.js`                 | 278       | jac-ch5                    |
| `lifeline/ch6.js`                 | 204       | jac-ch6                    |
| `lifeline/ch7.js`                 | 56        | jac-ch7                    |
| `lifeline/vocab-jac.js`           | 42        | vocab-jac + jac-jitsugi1/2 |
| `lifeline/vocab-supplementary.js` | 175       | supplementary              |
| **TOTAL**                         | **1,443** | ✅                         |

All split files retain `_origIndex` (intentional — stripped at merge time) ✅

---

## 2. QUESTION SETS (`src/data/sets/`)

### 2A. CSV Sets — `sets/csv/` (12 files, 300qs total)

| File      | Questions | Track                  |
| --------- | --------- | ---------------------- |
| ct01.js   | 30        | common                 |
| ct02.js   | 30        | common                 |
| ct03.js   | 30        | common                 |
| ct04.js   | 30        | common                 |
| ct05.js   | 30        | common                 |
| ct06.js   | 30        | common                 |
| cp01.js   | 20        | lifeline               |
| cp02.js   | 20        | lifeline               |
| cp03.js   | 20        | lifeline               |
| cp04.js   | 20        | lifeline               |
| cp05.js   | 20        | lifeline               |
| cp06.js   | 20        | lifeline               |
| **TOTAL** | **300**   | ct=common, cp=lifeline |

Schema: unified (`q/hint/opts/opts_id/ans/img/exp`), double ruby fixed ✅, exp stubs replaced ✅

---

### 2B. Wayground Sets — `sets/wayground/` (26 files, 657qs total)

**Teori (common):** `teori/` folder
| File | Qs |
|---|---|
| wt01.js | 19 |
| wt02–wt10.js | 20 each (×9 = 180) |
| **Teori subtotal** | **199** |

**Lifeline praktik:** `lifeline/praktik/` folder
| Files | Qs each | Subtotal |
|---|---|---|
| wgl01–wgl10.js | 20 each | 200 |

**Lifeline vocab:** `lifeline/vocab/` folder
| File | Qs |
|---|---|
| wglv01.js | 50 |
| wglv02.js | 46 |
| wglv03.js | 45 |
| wglv04.js | 45 |
| wglv05.js | 50 |
| **Vocab subtotal** | **236** |

**Vocab teori (common):** `vocab/` folder
| File | Qs |
|---|---|
| wtv01.js | 22 |

**Grand total: 657qs across 26 files** ✅ matches handoff

All files use new ID taxonomy (wt/wgl/wglv/wtv) — old wg/wp IDs gone ✅

---

### 2C. JAC Sets — `sets/jac/` (2 files, 95qs)

| File            | Qs     | Track    |
| --------------- | ------ | -------- |
| jac-teori.js    | 65     | common   |
| jac-lifeline.js | 30     | lifeline |
| **TOTAL**       | **95** | ✅       |

Schema: unified (q/hint/opts/opts_id/ans/img/exp), `hasPhoto` removed → `img: null` ✅
`related_card_id`: all 65 teori + 30 lifeline = 95/95 filled ✅

---

### 2D. Quiz Sets — `sets/quiz/` (6 files, 90qs)

| File           | Qs     | Track    |
| -------------- | ------ | -------- |
| doboku-01.js   | 15     | doboku   |
| doboku-02.js   | 15     | doboku   |
| doboku-03.js   | 15     | doboku   |
| kenchiku-01.js | 15     | kenchiku |
| kenchiku-02.js | 15     | kenchiku |
| kenchiku-03.js | 15     | kenchiku |
| **TOTAL**      | **90** | ✅       |

Per-question `id: N` (1-indexed) present ✅, `track` field present ✅
⚠️ Content is AI-generated (no real JAC PDF) — treat as draft/placeholder.

---

**QUESTION SET SUMMARY:**
| Category | Files | Questions | Track coverage |
|---|---|---|---|
| CSV | 12 | 300 | common + lifeline |
| Wayground | 26 | 657 | common + lifeline |
| JAC | 2 | 95 | common + lifeline |
| Quiz | 6 | 90 | doboku + kenchiku |
| **TOTAL** | **46** | **1,142** | all 4 tracks |

---

## 3. STUDY AIDS (`src/data/`)

### 3A. `confusion-pairs.js`

- **28 entries** — each identified by `type:` field
- **Fields:** `type, label, termA, furiA, defA, termB, furiB, defB, tip, tip_id`
- Ruby on `termA`/`termB`: ✅ done
- `defA`/`defB`: ✅ all 28 present
- `tip`/`tip_id`: ✅ all 28 filled (0 null)
- **Missing `track` field** on all 28 — open, no task assigned (not a regression)

### 3B. `danger-pairs.js`

- **20 entries** — each identified by `term:` field
- **Fields:** `term, furi, confusionType, explanation, track, traps, correct`
- Ruby on `term`: ✅ 17/20 (3 pure kana/romaji skipped, intentional)
- `traps`/`explanation` ruby: ✅ done (P19)
- `track`: ✅ all 20 present

### 3C. `angka-kunci.js`

- **29 entries** (soal field count = 29 data entries; first entry also has soal in comment header, total grep shows 30 — the extra is the comment line, not a data issue)
- **Fields:** `angka, konteks, track, kartu, mnemonic, soal`
- `soal` ruby: ✅ done
- `track`: ✅ present on 29/29 data entries
- `kartu`: 28/29 filled; **1 entry has `kartu: null`** (entry #2: "45 jam/bln, 360 jam/thn" — intentional, documented in DB-7 as `null` annotation)

---

## 4. MONOLITHIC vs SPLIT — SOURCE OF TRUTH

| File                                | Status                                                               | Working copy                                            |
| ----------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------- |
| `src/data/cards.js`                 | ✅ Auto-generated, current                                           | Generated from `source/` by merge script                |
| `src/data/cards/**/*.js`            | ✅ **Working source of truth** (content-dq)                          | Edit these for DQ                                       |
| `src/data/source/cards-common.js`   | ✅ Source (879 cards)                                                | Edit on `main`, run merge                               |
| `src/data/source/cards-lifeline.js` | ✅ Source (564 cards)                                                | Edit on `main`, run merge                               |
| `src/data/sets/csv/*.js`            | ✅ **Working source of truth**                                       | Split files, DQ complete                                |
| `src/data/csv-sets.js`              | ⚠️ **Legacy monolithic — DO NOT USE**                                | Still has old corruption; 300qs in old schema           |
| `src/data/sets/wayground/**/*.js`   | ✅ **Working source of truth**                                       | Renamed, reorganized (W1)                               |
| `src/data/wayground-sets.js`        | ⚠️ **Legacy monolithic — DO NOT USE**                                | Old IDs (wt1 not wt01), pre-W1 state                    |
| `src/data/sets/quiz/*.js`           | ✅ **Working source of truth**                                       | DQ complete                                             |
| `src/data/quiz-sets.js`             | ⚠️ **Legacy — imports monolithics, has inline DOBOKU/KENCHIKU_SETS** | Not updated for W1                                      |
| `src/data/sets/jac/jac-teori.js`    | ✅ **DQ working copy**                                               | New schema                                              |
| `src/data/jac-teori.js`             | ⚠️ **OLD SCHEMA**                                                    | Has `options:/answer:/hasPhoto:`, not `opts:/ans:/img:` |
| `src/data/sets/jac/jac-lifeline.js` | ✅ **DQ working copy**                                               | New schema                                              |
| `src/data/jac-lifeline.js`          | ⚠️ **OLD SCHEMA**                                                    | Same issue as jac-teori                                 |
| `src/data/jac-official.js`          | Shim — imports from top-level jac-\*.js                              | Will need update at merge                               |
| `src/data/jac-doboku.js`            | Stub — `JAC_DOBOKU = []`                                             | Blocked (no PDF)                                        |
| `src/data/jac-kenchiku.js`          | Stub — `JAC_KENCHIKU = []`                                           | Blocked (no PDF)                                        |

### ⚠️ NEW DISCREPANCY FOUND — Not in Handoff v16

**`src/data/jac-teori.js` (top-level) vs `src/data/sets/jac/jac-teori.js` are NOT identical and use different schemas:**

| Field         | `sets/jac/jac-teori.js` (DQ copy) | `jac-teori.js` (top-level)          |
| ------------- | --------------------------------- | ----------------------------------- |
| Question text | `q:`                              | `jp:` + `hiragana:`                 |
| Hint          | `hint:`                           | `id_text:`                          |
| Options       | `opts:` (array, separate)         | `options:` (combined JP+ID strings) |
| Answer        | `ans:`                            | `answer:`                           |
| Photo flag    | `img: null`                       | `hasPhoto: false`                   |

**`index.js` imports FROM `jac-teori.js` (top-level) — the OLD SCHEMA version.**
The DQ-migrated `sets/jac/jac-teori.js` is NOT wired into the export chain.

This means the app currently consumes the **pre-migration schema** for JAC Teori and Lifeline. The DQ split files are orphaned from the export chain until merge prep wires them in.

---

## 5. INDEX / EXPORT CHAIN

`src/data/index.js` re-exports:

```
CARDS              ← cards.js (auto-generated ✅)
JAC_OFFICIAL       ← jac-official.js (shim → jac-teori.js + jac-lifeline.js OLD SCHEMA ⚠️)
JAC_TEORI          ← jac-teori.js (top-level, OLD SCHEMA ⚠️)
JAC_LIFELINE       ← jac-lifeline.js (top-level, OLD SCHEMA ⚠️)
JAC_DOBOKU         ← jac-doboku.js (empty stub)
JAC_KENCHIKU       ← jac-kenchiku.js (empty stub)
WAYGROUND_SETS     ← wayground-sets.js (monolithic LEGACY ⚠️)
CSV_SETS           ← csv-sets.js (monolithic LEGACY ⚠️)
QUIZ_SETS          ← quiz-sets.js (imports both legacy monolithics ⚠️)
ANGKA_KUNCI        ← angka-kunci.js ✅
DANGER_PAIRS       ← danger-pairs.js ✅
CONFUSION_PAIRS    ← confusion-pairs.js ✅
CATEGORIES etc.    ← categories.js ✅
```

**None of the `sets/` split files are directly wired into `index.js`.** They are the DQ working copies but not consumed by the app until merge.

`quiz-sets.js` imports `wayground-sets.js` (legacy, wt1–wt10 old IDs) + `csv-sets.js` (legacy, old corruption). QUIZ_SETS exported by app = legacy data, not the DQ-fixed split files.

---

## 6. DISCREPANCY SUMMARY

| #   | Item                                        | Handoff Says                              | Actual                                                    | Severity                        |
| --- | ------------------------------------------- | ----------------------------------------- | --------------------------------------------------------- | ------------------------------- |
| D1  | `sets/jac/jac-teori.js` not wired to app    | (not documented)                          | Orphaned — old schema in production                       | **HIGH**                        |
| D2  | `sets/jac/jac-lifeline.js` not wired to app | (not documented)                          | Same — DQ version not consumed                            | **HIGH**                        |
| D3  | `jac-teori.js` (top-level) schema           | Handoff says "schema migrated ✅"         | Top-level still uses OLD schema (`options:`, `hasPhoto:`) | **HIGH**                        |
| D4  | App consumes legacy monolithics             | Handoff says split files = working source | split files not in export chain                           | **MEDIUM** (expected pre-merge) |
| D5  | `angka-kunci` entry count                   | Handoff says 29                           | 29 ✅ (soal comment line caused grep confusion)           | None                            |
| D6  | `wayground-sets.js` IDs                     | Handoff says "legacy, do not use"         | wt1/wt2 (not wt01/wt02) IDs — confirms legacy             | Expected                        |

**D1/D2/D3 note:** Handoff v16 states P16 = "schema migrated ✅" for both jac files. This is true for `sets/jac/*.js` (the DQ working copies). But the top-level `jac-teori.js` and `jac-lifeline.js` — which are what `index.js` actually imports — still have the pre-migration schema. This was apparently an intentional design: DQ branch migrated the schema in the `sets/jac/` copies but did not overwrite the top-level files. **At main-merge time, the top-level files must be replaced with the DQ copies.**

---

## 7. WHAT NEEDS TO HAPPEN AT MERGE

1. **Replace top-level `jac-teori.js` and `jac-lifeline.js`** with `sets/jac/` versions (new schema)
2. **Rebuild `wayground-sets.js`** from `sets/wayground/**/*.js` (W1 IDs, DQ-fixed content)
3. **Rebuild `csv-sets.js`** from `sets/csv/*.js` (fixed ruby, fixed exp stubs)
4. **Rebuild `quiz-sets.js`** from `sets/quiz/*.js` (or update to import from split files)
5. **Wire storage migration** — W1 ID rename (wg/wp → wgl/wglv/wtv) requires STORAGE_VERSION bump (3→4→5, reconcile with main)
6. **Run `node scripts/merge-cards.mjs`** to regenerate `cards.js` from `source/`

---

_Audit complete — no files modified. All counts verified from actual file contents._
