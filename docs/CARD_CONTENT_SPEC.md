# SSW Flashcard — Card Content Spec (Consolidated)
**Branch:** content-dq | **Version:** v1.6-consolidated | **Status:** CANONICAL
**Last reconciled:** 2026-05-14 (session 18 — ADM10: merged v1.0–v1.6 + DATA_ARCH_AUDIT)

---

## DAFTAR ISI
0. [Branch State Audit](#0-branch-state-audit)
1. [Keputusan Arsitektur](#1-keputusan-arsitektur)
2. [Audit Findings](#2-audit-findings)
3. [Schema Canonical](#3-schema-canonical)
4. [Spec Per Field](#4-spec-per-field)
5. [Taxonomy Canonical](#5-taxonomy-canonical)
6. [Ruby Annotation Standard](#6-ruby-annotation-standard)
7. [Duplicate Handling](#7-duplicate-handling)
8. [DQ Task List](#8-dq-task-list)
9. [PDF Mapping Task](#9-pdf-mapping-task)
10. [QC Checklist](#10-qc-checklist)
11. [Merge Prep Checklist](#11-merge-prep-checklist)
12. [Open Decisions](#12-open-decisions)

---

## 0. BRANCH STATE AUDIT

*Diverifikasi 2026-05-14 dari actual files di content-dq. Zero edits saat audit.*

### 0A. Commit Hash — Discrepancy
| File | Stated | Actual | Fix |
|------|--------|--------|-----|
| `SESSION_PROMPT.md` | `e0e689b` (ADM7) | `d2ca97d` (ADM9) | ✅ Fixed ADM10 |
| `DATA_QUALITY_HANDOFF_v16.md` | `e0e689b` (ADM7) | `d2ca97d` (ADM9) | ✅ Fixed ADM10 |
| `_MAP.md` session log | Last entry: ADM8 | ADM9 exists | ✅ Fixed ADM10 |

**Root cause:** ADM9 (`d2ca97d`) committed tanpa update SESSION_PROMPT/HANDOFF.

### 0B. angka-kunci.js — Null Count Discrepancy
DATA_ARCH_AUDIT menyatakan "1 null entry" → **SALAH**. Actual: **5 null entries**.

| angka | Resolution |
|-------|-----------|
| `45 jam/bln, 360 jam/thn` | `kartu: 134` — backing card EXISTS ← belum diapply |
| `6 bulan → 10 hari` | `kartu: 1172` — backing card EXISTS ← belum diapply |
| `< 6mm / ≥ 6mm` | `kartu: 1347` — backing card EXISTS + soal terpotong ← belum diapply |
| `90 detik/soal` | `kartu: null, // exam-meta` — sudah ada comment ✅ |
| `65%` | `kartu: null, // exam-meta` — sudah ada comment ✅ |

→ **P9 di task list covers semua fix ini.**

### 0C. JAC Schema — DQ Copies Orphaned (by design)
| File | Schema | Consumed by app? |
|------|--------|-----------------|
| `src/data/jac-teori.js` (top-level) | OLD (`jp:`, `options:`, `hasPhoto:`) | ✅ Ya — via index.js |
| `src/data/sets/jac/jac-teori.js` (DQ copy) | NEW (`q:`, `opts:`, `img:`) | ❌ Tidak — orphaned |
| `src/data/jac-lifeline.js` (top-level) | OLD schema | ✅ Ya — via index.js |
| `src/data/sets/jac/jac-lifeline.js` (DQ copy) | NEW schema | ❌ Tidak — orphaned |

**By design** — DQ branch tidak overwrite top-level files. At merge: top-level files harus diganti dengan versi DQ. Lihat §11 Merge Prep.

### 0D. Split File Counts — Verified ✅ (original audit baseline, see note)
1,443 cards total: split files ✅, source/ files ✅, cards.js ✅. Semua konsisten.

*(Session 25 due-diligence note: this reflects the state at the time this spec was first
written, before P4's 5-duplicate deletion — current live count is 1,438, tracked in
`HANDOFF.md`'s CURRENT STATE, not here. Left as-is rather than edited, since editing would
misrepresent what the original audit actually found. Same applies to §2A's card-type
breakdown below — that's the pre-DQ-campaign baseline, not current.)*

### 0E. Dokumen Ini Tidak Ada di Repo Sebelumnya
CARD_CONTENT_SPEC v1.0–v1.6 dan DATA_ARCH_AUDIT adalah dokumen lokal owner. Di-commit di sesi ini sebagai `docs/CARD_CONTENT_SPEC.md` dan `docs/DATA_ARCH_AUDIT.md`.

---

## 1. KEPUTUSAN ARSITEKTUR

### 1.1 Field `furi` — DROP AT MERGE TIME

**Situasi:** Satu user (owner). Main branch belum dishare. content-dq adalah isolated DQ workspace.

**Temuan audit:**
- 944 kartu: furi identik dengan first ruby di jp — 100% redundant
- 149 kartu: furi contaminated dengan context keywords — salah
- 62 kartu: jp belum punya ruby — ini yang jadi blocker
- Penggunaan di codebase: hanya `viewer.html` baris 218 sebagai display, tidak ada di search/sort/filter/logika

**Keputusan: drop furi sebagai bagian dari merge operation. Tidak ada phasing.**

**Prerequisite sebelum drop:**
1. 62 kartu jp-tanpa-ruby harus difix ruby-nya dulu (P1)
2. `viewer.html` diupdate: ganti `c.furi||''` dengan `extractReading(c.jp)`
3. Cek SSW Flashcards app (repo terpisah) untuk `card.furi` usage

```js
// viewer.html replace function:
function extractReading(jp) {
  const rubies = [...(jp||'').matchAll(/《([^》]+)》/g)].map(m => m[1]);
  if (rubies.length) return rubies[0];
  return (jp||'').replace(/[\u30a0-\u30ff]/g, ch =>
    String.fromCharCode(ch.charCodeAt(0) - 0x60));
}
```

Sampai merge: field `furi` tetap ada di schema tapi tidak di-maintain. Jangan fix, jangan update furi pada kartu yang diedit — fokus ke `jp` ruby.

---

### 1.2 Slash `/` dalam `id_text` — FORMALIZED

Format resmi: `A / B` = alias separator (A = term utama, B = nama alternatif).

Dibolehkan:
```
'Penandaan tinta / marking'     ✅ alias
'Tester / Multimeter'           ✅ alternative name
'BM / GL / FL'                  ✅ acronym group
```

Tidak dibolehkan:
```
'Uji keterampilan /'            ❌ truncated — harus dilengkapi
'通線/konduit/slab/siapkan'     ❌ list bukan terjemahan — rewrite
```

Yang wajib difix: 41 truncated (ending `/`), 13 multi-slash list, 3 id_text berisi kanji/JP.

---

### 1.3 wglv — SPLIT menjadi `wglv-jp` dan `wglv-id`

**Kondisi existing:** wglv02–05 mixed — dua tipe soal berbeda dalam satu file.

| File | Total | ID→JP | JP→ID |
|------|-------|-------|-------|
| wglv01 | 50 | 0 | 50 |
| wglv02 | 46 | 21 | 25 |
| wglv03 | 45 | 20 | 25 |
| wglv04 | 45 | 25 | 20 |
| wglv05 | 50 | 25 | 25 |

**Keputusan: SPLIT menjadi dua series.**

- `wglv-jp` → soal dalam JP, pilihan dalam BI (JP→ID direction)
- `wglv-id` → soal dalam BI, pilihan dalam JP (ID→JP direction)
- ID scheme: `wglv-jp-01`, `wglv-jp-02`, ... dan `wglv-id-01`, `wglv-id-02`, ...
- Location: tetap di `sets/wayground/lifeline/vocab/`
- wglv01 (semua JP→ID) → langsung jadi `wglv-jp-01`
- wglv02–05: questions dipecah ke file yang sesuai berdasarkan direction

> **Koreksi (session 23, P16 eksekusi):** klaim "wglv01 semua JP→ID" di atas **salah** —
> diverifikasi programatically (cek bahasa `opts` per soal): wglv01 aktualnya 26 ID→JP + 24
> JP→ID, mixed sama seperti wglv02-05. wglv02/04/05 di tabel atas sudah akurat (terverifikasi
> cocok); hanya wglv01 yang meleset. Total real: 117 ID→JP + 119 JP→ID = 236 (bukan 91+145
> seperti isyarat tabel). Eksekusi P16 pakai angka terverifikasi ini, bukan tabel di atas.
> Tidak diketahui dari mana klaim awal "wglv01 100% JP→ID" berasal — mungkin asumsi yang belum
> pernah dicek, bukan re-verifikasi yang salah.

---

### 1.4 CSV Sets — RENAME menjadi `jac-mockup`

"CSV" merujuk ke format upload, bukan konten. Konten sebenarnya adalah soal mock JAC buatan AI.

| Lama | Baru |
|------|------|
| `sets/csv/ct01–ct06` | `sets/jac-mockup/jmt01–jmt06` |
| `sets/csv/cp01–cp06` | `sets/jac-mockup/jml01–jml06` |
| `source: 'csv-teori'` | `source: 'jac-mockup'` |
| `source: 'csv-praktik'` | `source: 'jac-mockup'` |
| `title: 'CSV Teori 01'` | `title: 'JAC Mockup Teori 01'` |
| `id: 'ct01'` | `id: 'jmt01'` |
| `id: 'cp01'` | `id: 'jml01'` |
| `SET_CT01` | `SET_JMT01` |

---

### 1.5 Angka-kunci null entries — RESOLVED (belum diapply)

| angka | Resolution |
|-------|-----------|
| `45 jam/bln, 360 jam/thn` | `kartu: 134` — card 割増賃金率 cover threshold ini |
| `6 bulan → 10 hari` | `kartu: 1172` — card 有給休暇, exact match |
| `< 6mm / ≥ 6mm` | `kartu: 1347` — card 軽量鉄骨 vs 重量鉄骨 |
| `90 detik/soal` | `kartu: null, // exam-meta` — strategi ujian, bukan konten teknis |
| `65%` | `kartu: null, // exam-meta` — sama |

---

## 2. AUDIT FINDINGS

### 2A — Cards (1,443 kartu total: konsep=692, vocab=655, hukum=96) — *pre-DQ-campaign
baseline, see §0D note; current live breakdown is in HANDOFF.md (97/1244/97)*

#### 🔴 CRITICAL

**C1 — Encoding corruption di desc: 2 kartu**

| id | src | Fix |
|----|-----|-----|
| 476 | ch6.js | desc berisi bytes UTF-8 decoded sebagai latin1 |
| 773 | vocab-supplementary.js | idem (source=jac-ch6 tapi file di vocab-supplementary) |

**C2 — Nested ruby `《A《B》》`: 12 kartu**

Invalid syntax — akan crash renderer. Semua dari jac-ch5/ch6.

| id | jp (truncated) | Fix |
|----|---------------|-----|
| 321 | `E管《いいかん《ねじなし…》》` | Pisah ke jp + `（）` |
| 330 | `光ファイバー融着…《…《さんほうしき》》` | idem |
| 339 | `石綿セメント管《…《あすべすとかん》》` | idem |
| 356 | `可搬式作業台《…《のびうま》》` | idem |
| 371 | `ケーブル繰り出し機《…《かっしゃしき》》` | idem |
| 452 | `保温材の収縮《…《さいだいにぱあせんと》》` | idem |
| 485 | `気密試験《…《かんろふせつご》》` | idem |
| 606 | `差し込み継手工法《…《まるだくと》》` | idem |
| 608 | `硬質塩化ビニル管《…《せっちゃくざいせつごう》》` | idem |
| 610 | `ねじ込み配管《…《つうすいはようじょうご》》` | idem |
| 612 | `EF接合《EFせつごう《えれくとろふゅうじょん》》` | idem |
| 619 | `ベンダー曲げ加工《べんだあまげかこう《さいしょうまげはんけい》》` | idem |

Fix pattern:
```
❌ 気密試験《きみつしけん《かんろふせつご》》
✅ 気密試験《きみつしけん》（管路布設後《かんろふせつご》）
```

---

#### 🟠 HIGH

**H1 — Naked kanji di jp dalam `（）`: ~152 kartu**

Kanji dalam parenthetical tanpa ruby. Contoh:
```
アスベスト（石綿）           → 石綿《いしわた》 wajib
バックホウ（油圧ショベル）   → 油圧ショベル《ゆあつしょべる》 wajib
```

**H2 — Naked kanji di jp post-compound (subtitle): ~64 kartu**

Kanji setelah compound ruby selesai, sebagai subtitle/qualifier. Review manual per kartu.

**H3 — Furi mengandung non-hiragana: 132 kartu**

Less critical karena furi deprecated. 39 berisi `《》` brackets (wajib fix sebelum drop).

**H4 — desc tanpa ending punctuation: 561 kartu**

| Pattern | Count | Status |
|---------|-------|--------|
| Mid-word truncated | 213 | ❌❌ Konten hilang |
| Complete word, missing period | 266 | ❌ Tambah `.` |
| Symbol endings (`→`,`=`,`:`,`》`,`、`) | 82 | ❌ Fix |

**H5 — Naked kanji di desc: 33 kartu**

Mayoritas dari id range 1256–1286 (source: jac-ch3, batch baru QC kurang).

**H6 — Exact duplicate jp: 22 distinct values (46 kartu)**

Yang wajib merge (same jp, same type):

| jp | ids | Action |
|----|-----|--------|
| `ねじゲージ` | 374, 433 | Merge |
| `ほうれんそう（報告・連絡・相談）` | 219, 592 | Merge |
| `マンドレル通過試験` | 484, 614 | Merge |
| `玉掛け` | 165, 518 | Merge |
| `防露工事` | 982, 1257 | Merge |
| `EF接合` | 459, 612, 613 | ~~Merge — triple~~ — reviewed P4 (session 24): kept separate, each covers a distinct step (concept / indicator-check / prep-sequence). This table entry predates that review; not an open action.

~10 pasang same-jp different-type: sebagian legitimate (konsep + vocab), sebagian redundant — review manual.

---

#### 🟡 MEDIUM

**M1 — Katakana ruby `《katakana》`: 18 kartu**

`《》` eksklusif untuk hiragana. Convert ke `（）` format.

```
❌ 石綿《アスベスト》         → ✅ 石綿《いしわた》（アスベスト）
❌ パイプレンチ《ピレン》     → ✅ パイプレンチ（略称: ピレン）
❌ NATM《ナトム》工法         → ✅ NATM（ナトム）工法
```

**M2 — Furi contaminated dengan desc content: 6 kartu severe**

| id | jp | furi_len | Fix |
|----|-----|---------|-----|
| 525 | `新規入場者教育` | 44 chars | Hapus context, keep reading only |
| 539 | `パワハラ防止法` | 31 chars | idem |
| 621 | `三大災害` | 36 chars | furi = `さんだいさいがい` |
| 1313 | `舗装の4層` | 32 chars | idem |
| 1333 | `海洋土木の4工事` | 34 chars | idem |
| 1370 | `吹付けウレタン` | 33 chars | idem |

**M3 — Duplicate id_text: 25 nilai**

id_text yang sama di-share oleh kartu dengan jp berbeda → harus disambiguate. Contoh: `'Kontraktor utama'` ada di id=115, 504, 1169.

**M4 — category=hourei tapi type≠hukum: 4 kartu**

| id | jp | Fix |
|----|-----|-----|
| 166 | 資格の3種類 | reclassify category → `career` |
| 167 | 発破技士免許 | reclassify category → `career` |
| 170 | クレーン資格 | reclassify category → `career` |
| 1275 | 建設業法の重点施策 | retype → `hukum` |

**M5 — type=hukum tapi source=vocab-supplementary: 3 kartu**

id=1184, 1185, 1240 — source harus dikoreksi ke chapter/vocab yang sesuai.

**M6 — id_text bermasalah: 3 kartu**

| id | id_text | Fix |
|----|---------|-----|
| 136 | `'Uji keterampilan /'` | Truncated — lengkapi |
| 233 | `'通線/konduit/slab/siapkan'` | List bukan terjemahan — rewrite |
| 1371 | `'CB造'` | Masih JP — ganti: `'Konstruksi bata beton (CB)'` |

**M7 — Typo furi: 2 kartu**

| id | furi salah | Benar |
|----|-----------|-------|
| ~1300 | `ねぎり` | `ねきり` (根切り) |
| ~807 | `くったい` | `くたい` (躯体) |

*(Less critical karena furi deprecated, tapi jp field tetap perlu diverifikasi)*

---

### 2B — Study Aids

**confusion-pairs.js — CLEAN**
28 entries, semua field lengkap, 0 naked kanji, 0 truncated. No action needed.

**danger-pairs.js — CLEAN**
20 entries, semua field lengkap, 0 naked kanji. No action needed.

**angka-kunci.js — Issues**
- 29 entries, 5 `kartu: null` → resolved per §1.5, belum diapply
- 28/29 soal field mengandung naked kanji → perlu ruby

---

### 2C — Question Sets (46 files, 1,142 soal)

**0 dari 46 file adalah clean.** Semua mengandung naked kanji.

| Set group | Soal | naked_q | naked_exp | naked_hint | Exp corrupt |
|-----------|------|---------|-----------|------------|-------------|
| jac-teori | 65 | 65 (100%) | 60 | 13 | 8 (backslash) |
| jac-lifeline | 30 | 30 (100%) | 27 | 10 | 4 (backslash) |
| jac-mockup teori (ct) | 180 | ~30 | ~90 | ~10 | 0 |
| jac-mockup lifeline (cp) | 120 | ~26 | ~74 | ~6 | 0 |
| wt (teori) | 199 | 37 | 124 | 56 | ~7 |
| wgl (lifeline praktik) | 200 | 84 | 86 | 0 | ~6 |
| wglv (vocab) | 236 | 111 | varies | 131 | 0 |
| wtv | 22 | 5 | 22 | 22 | 0 |
| quiz | 90 | 0 | 78 | 26 | 0 |

**JAC exp corruption (12 entries):** exp berakhir `\'` — konten hilang, wajib fix.

**wglv04/05 quality gaps:**
- `opts_id` partial: hanya correct answer yang diisi, wrong options kosong
- `exp` generic: `"JP = bahasa Jepangnya."` — tidak informatif

---

### 2D — categories.js

Active: gaiyou, anzen, hourei, sekou, career, haikan, denki, tsushin, shoubou, hoon, setsubi_kougu
UI feature: bintang (favorites — tidak di cards, OK)

(Doboku/Kenchiku placeholder categories — doboku_doko, doboku_hoso, doboku_haisui,
kenchiku_kutai, kenchiku_shiage, all 0 kartu — removed session 24 along with the tracks
themselves. Scope reduced to Lifeline-only per owner decision, see HANDOFF.md.)

Tidak ada kartu yang menggunakan category tidak terdaftar di categories.js. ✅

---

## 3. SCHEMA CANONICAL

### 3A — Cards

```js
{
  id:       number,         // immutable setelah publish
  category: string,         // §5.2
  source:   string,         // §5.3
  furi:     string,         // DEPRECATED — drop at merge, tidak di-maintain
  jp:       string,         // §4.2
  type:     'konsep'|'vocab'|'hukum',
  id_text:  string,         // §4.4
  desc:     string,         // §4.5
  usage?:   string,         // vocab only, opsional — §4.6
}
```

Field order wajib seperti di atas. `usage` ditulis hanya jika ada — tidak boleh `usage: null`.

---

### 3B — Standard Question Sets (wt, wgl, wtv, jac-mockup, jac official, quiz)

```js
{
  id:              string|number,  // set: string; q: number (sequential)
  track:           string,         // 'common'|'lifeline'
  q:               string,         // soal JP — semua kanji wajib ruby
  hint:            string,         // ID clue — semua kanji wajib ruby
  opts:            string[],       // wt/wgl: JP strings (ruby wajib)
                                   // jac-mockup/jac/quiz: ID strings
  opts_id:         string[],       // ID translation semua opts — wajib semua diisi
  ans:             number,         // 0-based index
  exp:             string,         // penjelasan — semua kanji ruby, wajib ending punct
  img?:            null|string,    // jac sets only
  related_card_id?: number,        // jac sets only — ID valid di cards.js
}
```

---

### 3C — wglv-jp (JP→ID vocab sets)

```js
{
  id:      number,     // sequential dalam file
  q:       string,     // soal JP — semua kanji ruby
  hint:    string,     // ID clue — BERBEDA dari q, bukan copy
  opts:    string[],   // BI strings (pilihan dalam Indonesia)
  opts_id: string[],   // boleh sama dengan opts
  ans:     number,
  exp:     string,     // format: "JP term《ruby》 = ID translation"
}
```

---

### 3D — wglv-id (ID→JP vocab sets)

```js
{
  id:      number,     // sequential dalam file
  q:       string,     // soal BI — format "Apa bahasa Jepangnya \"[term]\"?"
  hint:    string,     // JP term dengan ruby — satu term, bukan kalimat
  opts:    string[],   // JP terms — semua kanji ruby
  opts_id: string[],   // ID translation SEMUA opts — termasuk wrong options
  ans:     number,
  exp:     string,     // format: "JP term《ruby》 = ID translation"
}
```

---

### 3E — angka-kunci

```js
{
  angka:    string,          // nilai numerik yang diuji
  konteks:  string,          // konteks penggunaan
  track:    string,          // 'common'|'lifeline'
  kartu:    number|null,     // ID backing card; null hanya jika exam-meta
  mnemonic: string,          // tips hafalan
  soal:     string,          // JP — semua kanji ruby; format: pertanyaan？ → jawaban
}
```

---

## 4. SPEC PER FIELD

### 4.1 `id` (cards)
- Auto-assigned, sequential, **immutable** setelah publish
- Referenced oleh `related_card_id` di question sets
- Tidak boleh duplikat

---

### 4.2 `jp` — Istilah Jepang

**Ruby rules:**

| Konten | Treatment |
|--------|-----------|
| Kanji / compound kanji | Wajib ruby `《ひらがな》` |
| Kanji dalam `（）` | Wajib ruby sama seperti di luar |
| Katakana (loan words, acronym) | Tidak perlu ruby |
| Hiragana | Tidak perlu ruby |
| Romaji / angka | Tidak perlu ruby |
| Nested `《A《B》》` | **DILARANG** — selalu fix |
| Katakana alias/abbreviation | Gunakan `（katakana）` bukan `《katakana》` |

**Katakana alias policy:**
```
❌ 石綿《アスベスト》          ✅ 石綿《いしわた》（アスベスト）
❌ パイプレンチ《ピレン》      ✅ パイプレンチ（略称: ピレン） atau drop ruby
❌ NATM《ナトム》工法          ✅ NATM（ナトム）工法
❌ パワー・ハラスメント《パワハラ》  ✅ パワー・ハラスメント（パワハラ）
```

**Nested ruby fix pattern:**
```
❌ 気密試験《きみつしけん《かんろふせつご》》
✅ 気密試験《きみつしけん》（管路布設後《かんろふせつご》）
```

**Normalisasi form:**
- Okurigana: form kamus → `仮付け溶接` bukan `仮付溶接`
- Order: kanji dulu → `建設キャリアアップシステム《…》（CCUS）`
- Threshold/angka tidak di jp → masuk desc
- Subtitle setelah `:` tidak di jp → masuk desc atau `（）`

---

### 4.3 `furi` — DEPRECATED
Tidak di-maintain. Drop at merge time. Lihat §1.1.

---

### 4.4 `id_text` — Terjemahan Indonesia

- Bahasa Indonesia murni — tidak boleh ada kanji, katakana, romaji Jepang
  - Exception: nama teknis BI baku (APAR, RAB, CCUS, BM, dsb)
- Frasa nominal singkat — **tidak diakhiri titik**, tidak diawali huruf kecil
- **Diskriminatif** — berbeda dari id_text kartu lain yang jp-nya berbeda
- Slash `/`: max 1, tidak di akhir, B harus alias/alternative bukan deskriptor umum
- Panjang: 2–60 karakter

---

### 4.5 `desc` — Penjelasan

**Rules universal:**
- Wajib berakhir: `.` atau `。` atau `）` atau `」` atau `】`
- Multiline (`\n`): **setiap baris** wajib berakhir tanda baca
- Semua kanji wajib ruby `《》`
- Tidak boleh berakhir dengan `→`, `=`, `:`, `、`, `》`, atau mid-word
- Tidak boleh ada encoding corruption

**Panjang sehat:**
| type | min | ideal | max |
|------|-----|-------|-----|
| konsep | 60 | 80–120 | 200 |
| vocab | 35 | 50–90 | 170 |
| hukum | 50 | 80–120 | 200 |

**Konsep:** Menjawab *bagaimana*, *mengapa*, *cara kerja*, *apa bedanya X vs Y*. Bukan hanya "X adalah Y."

**Vocab:** Kalimat 1 = definisi inti. Kalimat 2 opsional via `\n` = konteks lapangan atau contrast dengan term lain.

**Hukum:** Wajib ada threshold, angka, atau kewajiban konkret. Menjawab: *berapa / kapan / siapa wajib*.

---

### 4.6 `usage` — Kalimat contoh (vocab only)

**Format wajib:** `[kalimat JP dengan ruby]（[terjemahan ID, frasa verbal]）`

- HANYA pada `type: vocab`
- Semua kanji dalam kalimat JP wajib ruby
- Kalimat JP menggunakan vocab utama kartu ini
- Template `〜を動詞《どうし》する（melakukan〜）` — valid
- Tidak diakhiri tanda baca di luar `）`
- Tidak boleh `usage: null` atau `usage: ""` — jika tidak ada, jangan tulis field-nya

**Coverage target (long-term):**
sekou ≥50% | haikan ≥35% | anzen ≥35% | career/denki/hoon ≥25% | tsushin/shoubou ≥20% | gaiyou/setsubi_kougu ≥15%

---

### 4.7 `q`, `hint`, `opts`, `exp` — Standard sets

- `q`: JP, semua kanji ruby
- `hint`: ID clue, semua kanji ruby
- `opts` (wt/wgl): JP strings, semua kanji ruby
- `opts` (jac-mockup/jac/quiz): ID strings, tidak perlu ruby
- `opts_id`: ID translation semua opsi — wajib diisi semua, termasuk wrong options
- `exp`: kalimat penuh, semua kanji ruby, wajib ending punct, tidak berakhir `\'`

---

### 4.8 `q`, `hint`, `opts`, `exp` — wglv-jp (JP→ID)

- `q`: JP, semua kanji ruby. Format soal makna.
- `hint`: **ID clue** — wajib berbeda dari q, berikan konteks BI bukan copy q
- `opts`: ID strings, tidak perlu ruby
- `opts_id`: boleh sama dengan opts
- `exp`: format `"JP term《ruby》 = ID translation"`

---

### 4.9 `q`, `hint`, `opts`, `exp` — wglv-id (ID→JP)

- `q`: BI. Format: `"Apa bahasa Jepangnya \"[term]\"?"`
- `hint`: JP term dengan ruby — satu term, bukan kalimat penuh
- `opts`: JP terms, semua kanji ruby
- `opts_id`: ID translation **semua** opts — wajib termasuk wrong options
- `exp`: format `"JP term《ruby》 = ID translation"`

---

### 4.10 `soal` — angka-kunci

- Semua kanji wajib ruby
- Format: `[pertanyaan JP]？ → [jawaban singkat]`
- Jawaban setelah `→` tidak perlu ending punct

---

## 5. TAXONOMY CANONICAL

### 5.1 `type`

| Value | Definisi | Ciri desc |
|-------|----------|-----------| 
| `konsep` | Proses, sistem, prosedur, teknik, kegiatan | Aktif — bagaimana/mengapa; sering multi-kalimat |
| `vocab` | Kata benda, kerja, sifat teknis | Definitional; 1–2 kalimat; `usage` opsional |
| `hukum` | UU, regulasi, kewajiban hukum | Ada angka/threshold/kewajiban konkret |

**Decision tree:**
```
Apakah tentang UU/regulasi dengan kewajiban/threshold?
  YES → hukum

Apakah jp bisa didefinisikan sebagai benda/kata dalam 1-2 kalimat?
  YES, tidak butuh penjelasan prosedur → vocab
  YES, butuh penjelasan cara kerja/sistem → konsep

Apakah konten adalah SOP, urutan langkah, metode, perbandingan sistem?
  YES → konsep
```

Edge cases:
- Komponen/alat: **vocab** (desc jelaskan cara kerja)
- Sertifikasi/lisensi: **konsep** dengan `category: career`
- Nama UU tanpa angka tapi ada scope/kewajiban: **hukum**
- Alat + teknik penggunaan: alat → vocab, teknik → konsep (kartu terpisah)

---

### 5.2 `category`

| Code | Domain | Type yang dibolehkan | Count |
|------|--------|---------------------|-------|
| `sekou` | Konstruksi umum, teknik sipil | konsep, vocab | 437 |
| `haikan` | Perpipaan, plumbing, gas, refrigerasi | konsep, vocab | 225 |
| `anzen` | K3, APD, keselamatan kerja | konsep, vocab | 164 |
| `denki` | Elektrikal, kabel, panel | konsep, vocab | 158 |
| `career` | Karir SSW, sertifikasi, visa, CCUS | konsep, vocab, hukum | 142 |
| `tsushin` | Telekomunikasi, LAN, serat optik | konsep, vocab | 67 |
| `hoon` | Insulasi panas/dingin | konsep, vocab | 54 |
| `shoubou` | Pemadam kebakaran, sprinkler | konsep, vocab | 42 |
| `gaiyou` | Konsep umum proyek, manajemen | konsep, vocab | 39 |
| `hourei` | UU dan regulasi pemerintah | **hukum only** | 97 |
| `setsubi_kougu` | Alat dan perkakas instalasi | konsep, vocab | 18 |

Hard rules:
- `hourei` → hukum only. Tidak boleh konsep atau vocab.
- Sertifikasi/lisensi teknis → `career`, bukan `hourei`
- Alat pemadam → `shoubou`, bukan `anzen`

---

### 5.3 `source` — Status saat ini

> ⚠️ **OPEN DECISION (lihat §12 OD-1):** Source taxonomy ini adalah pending konfirmasi owner.
> Handoff v16 menyatakan "SOURCE LABELS DIPERTAHANKAN". CARD_CONTENT_SPEC v1.1+ propose reclassify 226 kartu ke `vocab-supplementary`. Tunggu keputusan sebelum P6 dikerjakan.

| Code | Asal | Count saat ini |
|------|------|---------------|
| `jac-ch1` – `jac-ch7` | Chapter JAC 1–7 | 28/99/183/150/217/134/48 |
| `jac-jitsugi1`, `jac-jitsugi2` | Praktik JAC | 13/15 |
| `jac-gakka1`, `jac-gakka2` | Gakka JAC | 6/3 |
| `vocab-jac` | Vocab cross-chapter dari JAC | 49 |
| `vocab-supplementary` | Vocab tambahan | 272 |
| `vocab-lifeline` | Cross-chapter lifeline | 113 |
| `vocab-teori` | Cross-chapter theory | 18 |
| `vocab-general` | Vocab umum konstruksi | 44 |
| `vocab-exam` | Vocab fokus ujian | 38 |
| `vocab-core` | Vocab inti | 13 |

---

### 5.4 `track`

| Value | Dipakai di |
|-------|-----------|
| `common` | cards/common/, wt, jmt, jac-teori |
| `lifeline` | cards/lifeline/, wgl, wglv-jp, wglv-id, jml, jac-lifeline |

(`doboku`/`kenchiku` values, and everything that used them, removed session 24 — scope
reduced to Lifeline-only per owner decision. See HANDOFF.md.)

---

### 5.5 Set ID taxonomy

| Prefix | Type | Track |
|--------|------|-------|
| `wt01`–`wt10` | Wayground Teori | common |
| `wgl01`–`wgl10` | Wayground Lifeline praktik | lifeline |
| `wglv-jp-01`, ... | Vocab JP→ID (post-P16) | lifeline |
| `wglv-id-01`, ... | Vocab ID→JP (post-P16) | lifeline |
| `wtv01` | Wayground Vocab Teori | common |
| `jmt01`–`jmt06` | JAC Mockup Teori (post-P17, ex-ct) | common |
| `jml01`–`jml06` | JAC Mockup Lifeline (post-P17, ex-cp) | lifeline |
| `tt1`, `tt2` | JAC Official Teori | common |
| `st1` | JAC Official Lifeline | lifeline |

---

## 6. RUBY ANNOTATION STANDARD

### Prinsip
`《》` = **eksklusif** untuk hiragana reading. Berlaku di: `jp`, `desc`, `usage`, `q`, `hint`, `opts` (jika JP), `exp`, `soal`.

Tidak berlaku di: `opts` yang sudah ID strings, `opts_id`, `id_text`, `furi` (deprecated).

### Patterns

```
// COMPOUND — ruby covers full compound
漏電遮断機《ろうどうしゃだんき》              ✅

// OKURIGANA — hiragana outside ruby (valid Japanese)
真空引《しんくうび》き                        ✅

// PARENTHETICAL — kanji in （）needs ruby
アスベスト（石綿《いしわた》）                ✅
バックホウ（油圧ショベル《ゆあつしょべる》）   ✅

// ALIAS — katakana equivalent uses （）
石綿《いしわた》（アスベスト）                ✅
水準器《すいじゅんき》（レベル）              ✅

// KATAKANA-ONLY — no ruby needed
パワー・ハラスメント（パワハラ）              ✅

// MULTI-TERM — ruby per term
土留め《どどめ》・擁壁《ようへき》            ✅

// NESTED — FORBIDDEN
気密試験《きみつしけん《かんろ》》            ❌ → 気密試験《きみつしけん》（管路布設後）
《katakana》                                   ❌ → （katakana）
```

### desc ruby repetition
- Kemunculan pertama kanji dalam desc → wajib ruby
- Kemunculan ke-2+ dari kanji **sama** dalam kalimat **sama** → boleh skip
- Kemunculan ke-2+ dalam baris/kalimat **berbeda** → ruby lagi

---

## 7. DUPLICATE HANDLING

### Exact duplicates — wajib merge
Lihat §2A H6. Process: ambil desc lebih lengkap → delete yang lain → update `related_card_id` di question sets jika id yang didelete dipakai.

### Same jp, different type
~10 pairs legitimate (konsep = cara kerja, vocab = definisi kata) → pertahankan.
~6 pairs redundant → review manual dengan decision tree §5.1.

### Duplicate id_text
25 nilai — untuk setiap kasus: revisi id_text agar diskriminatif.

---

## 8. DQ TASK LIST

*Dependency order: P0 → P1 → P2 → P3 → P4 → P5 → P9 → P7 → P16 → P17 → P8a → P8b → P10 → P11 → P6⚠️ → P12(merge) → P13 → P14 → P15*

> **Note untuk agent:** (1) P16 dan P17 tercantum di bagian bawah §8 ini karena blocked oleh OD-2/OD-3, tapi dalam urutan eksekusi mereka harus selesai **sebelum** P8a item 2 (P17) dan P8b/P10/P11 (P16). (2) P6 tercantum antara P5 dan P7 secara numerik, tapi dalam urutan eksekusi P6 datang **setelah P11** dan hanya jika OD-1 sudah dikonfirmasi. Ikuti dependency order di atas, bukan urutan fisik dalam dokumen ini.

### P0 — 🔴 BLOCKING
- [ ] Fix encoding corrupt id=476 (`cards/lifeline/ch6.js`), id=773 (`cards/lifeline/vocab-supplementary.js`)
- [ ] Fix 12 nested ruby cards (id: 321,330,339,356,371 in ch5.js; 452,485,606,608,610,612,619 in ch6.js)

### P1 — Ruby: jp field (prerequisite furi drop)
- [ ] 62 kartu jp tanpa ruby → tambahkan ruby
- [ ] 18 kartu katakana ruby → convert ke `（）`
- [ ] ~152 naked kanji di jp `（）` → tambahkan ruby
- [ ] ~64 naked kanji di jp post-compound → review manual per kartu

### P2 — Ruby: desc + usage
- [ ] 33 naked kanji di desc → tambahkan ruby
- [ ] 2 naked kanji di usage (id=662, 939) → tambahkan ruby

### P3 — Field fixes (cards)
- [ ] id=136: lengkapi id_text `'Uji keterampilan /'`
- [ ] id=233: rewrite id_text `'通線/konduit/slab/siapkan'` → frasa BI
- [ ] id=1371: ganti id_text `'CB造'` → `'Konstruksi bata beton (CB)'`
- [ ] 41 id_text truncated ending `/` → lengkapi
- [ ] 13 id_text multi-slash list → rewrite sebagai frasa BI
- [ ] M4: fix 4 kartu category=hourei/type=konsep (id=166→career, 167→career, 170→career, 1275→hukum)
- [ ] M5: fix 3 kartu source (id=1184,1185 → jac-ch2; id=1240 → source sesuai konten)

### P4 — Duplicate resolution (cards)
- [ ] Merge 5 exact duplicate pairs + EF接合 triple (id=459,612,613)
- [ ] Review 6 same-jp ambiguous pairs → merge atau pertahankan
- [ ] Fix 25 duplicate id_text → disambiguate

### P5 — Desc truncation (cards) — ✅ DONE (session 28)
> **Session 25 (2026-08-12 to 08-15): 80/479 done — 22 from jac-ch1+jac-ch2 (commit `61c180a`),
> 58 from jac-ch3 (`dca925e` + a 2-card due-diligence catch in `1afb7a2`). Session 26 (2026-08-16):
> +94 from jac-ch4+jac-ch5 (commit `b00bdf2`), running total 174/479. Session 27 (2026-08-17): +66
> from jac-ch6 (commit `5447c94`), running total 240/479. Session 28 (2026-08-17): +18 from
> jac-ch7 (commit `60dcf1a`), final total 258/479 — this was the 7th and last source PDF, so
> every chapter has now been checked against its real textbook text at least once. Marking this
> **done** rather than continuing to track it as partial: the gap between 258 and the original
> ~479 estimate isn't unstarted work sitting in a queue, it's (a) the specific ids that stayed
> flagged after real cross-referencing because the source text genuinely didn't have enough detail
> to complete safely — see HANDOFF.md's "Residual data-quality flags" list for the full,
> currently-14-id roster (94,152,160,957,410,966,1063,1143,93,1190,1325,530,624 — one from ch6 was
> a likely source mistag, two new from ch7) — and (b) slack in the original ~479 figure itself,
> which HANDOFF always caveated as an estimate never reconciled against an exact pre-count; every
> chapter's real fixed-count came in below what a proportional share of 479 would predict, ch7
> included (18 of 47 checked cards — same story every other chapter told). Re-opening P5 only
> makes sense if new source material surfaces for
> one of the still-flagged ids; there's no more mechanical work here otherwise. Separately: the
> EF接合 furi item (session 27) and a distinct furi/jp ruby-corruption pattern found on 7 ch7 cards
> (session 28) are both resolved — see commits `5447c94` and `60dcf1a`.**
- [ ] 213 mid-word truncated → complete content
- [ ] 266 complete-word missing period → add `.`
- [ ] 82 symbol endings (`→`,`=`,`:`,`》`,`、`) → fix per kasus

### P6 — Source reclassification ⚠️ PENDING OWNER DECISION
> **LIHAT §12 OD-1 — konflik antara handoff v16 (retain) dan CARD_CONTENT_SPEC (merge).
> JANGAN kerjakan P6 sampai owner confirm.**
- [ ] Jika approved: 226 kartu `vocab-lifeline/teori/general/exam/core` → `vocab-supplementary`
- [ ] Edit source field di split files → re-run merge script

### P7 — JAC sets: exp corruption
- [ ] `sets/jac/jac-teori.js`: 8 exp berakhir `\'` → complete/fix
- [ ] `sets/jac/jac-lifeline.js`: 4 exp berakhir `\'` → complete/fix

### P8a — Ruby: standard question sets *(P7 dulu; P17 dulu untuk item 2)*
Priority:
1. JAC teori + lifeline: 95 naked `q` (100%)
2. jac-mockup `q` dan `exp`: ~220
3. Wayground wt/wgl `exp`: ~210
4. Quiz sets `exp`: ~78
5. Wayground wtv semua fields: ~49

Pengecualian: `opts` yang sudah ID strings, `opts_id`, wglv `exp` format `"JP = ID"` tidak perlu fix.

### P9 — angka-kunci fixes
- [ ] Update `kartu: null` → `kartu: 134` (entry `45 jam/bln`)
- [ ] Update `kartu: null` → `kartu: 1172` (entry `6 bulan → 10 hari`)
- [ ] Update `kartu: null` → `kartu: 1347` (entry `< 6mm / ≥ 6mm`)
- [ ] Tambahkan comment `// exam-meta` pada entry `90 detik/soal` dan `65%` *(sudah ada, verify)*
- [ ] Lengkapi soal field entry `< 6mm / ≥ 6mm` yang terpotong
- [ ] Ruby pada 28/29 soal fields

### P10 — wglv quality gaps (setelah P16)
- [ ] wglv-id series: isi opts_id untuk semua wrong options
- [ ] wglv-jp series: perbaiki hint yang masih copy-of-q → ID clue

### P11 — wglv exp generic (setelah P16)
- [ ] wglv-id series (ex-wglv04/05): ganti `"JP = bahasa Jepangnya."` → specific translation

### P12 — Furi drop (BLOCKED — bukan sekadar "at merge time", setelah P1)
> **Session 28 (2026-08-17): OD-5 terjawab lewat investigasi, dan jawabannya mengubah scope P12.**
> Pertanyaan OD-5 ("apakah repo SSW Flashcards terpisah pakai `card.furi`?") ternyata menyasar
> codebase yang salah. Dua repo snapshot (`...-v87`, `SSW-KONSTRUKSI-v85`) **tidak** membaca
> `card.furi` — satu-satunya `.furi` di sana adalah `item.furi` dari struktur `DANGER_PAIRS` yang
> terpisah. Tapi **`main` repo ini sendiri membaca `card.furi` di minimal 6 komponen mode**, dan
> itulah yang sebenarnya menggate P12. Checklist di bawah diganti: item `viewer.html` yang lama
> sudah tidak mencerminkan arsitektur `main` sekarang (mode-mode JSX, bukan satu viewer).
> **Blocker konkret (diverifikasi dengan membaca source `main`, bukan asumsi):**
> - `src/tests/data.test.js:34` — test bernama *"every card has furi field (Phase 1)"*, assert
>   `CARDS.filter(c => c.furi == null)` kosong. Drop furi → CI langsung merah.
> - `src/modes/GlossaryMode.jsx:48,54` — sort seluruh glossary by `furi` DAN group by `furi[0]`
>   untuk nav A-Z. Tanpa furi semua kartu jatuh ke bucket `'?'` — navigasi utama mode itu mati.
> - `src/modes/ProductionMode.jsx:34` — `card.furi` adalah **jawaban yang diterima** di quiz
>   produksi. Drop furi → jawaban benar mulai dinilai salah tanpa error apa pun.
> - `src/modes/FlashcardMode/FlipCard.jsx:90,137`, `src/modes/SearchMode.jsx:38,70,177`,
>   `src/modes/QuizMode.jsx:68` — render/serch/prompt. (`ConfusionMode.jsx` + `Onboarding.jsx`
>   juga menyebut furi, belum diaudit baris-per-baris; enam di atas sudah cukup mendiskualifikasi.)
>
> Arah penggantian yang paling mungkin tetap `extractReading(c.jp)` dari ruby `《》` (itu memang
> tujuan P1 — lihat framing "prerequisite furi drop"), tapi artinya tiap consumer butuh helper,
> bukan sekadar hapus field. `SearchMode.jsx` sudah meng-import `stripFuri`, jadi helper-nya
> mungkin sebagian sudah ada. **Ini pekerjaan desain UI di `main`, bukan pekerjaan data di
> content-dq** — tidak ada yang bisa dikerjakan dari branch ini untuk memajukannya.
- [ ] **PRASYARAT BARU:** putuskan pengganti furi di 6 consumer `main` di atas (kemungkinan
      `extractReading(c.jp)`) — ini keputusan desain, belum diambil siapa pun
- [ ] Update tiap consumer + `src/tests/data.test.js` (test-nya sendiri harus ikut berubah)
- [x] ~~Confirm SSW Flashcards repo tidak pakai `card.furi` (OD-5)~~ — selesai session 28: repo
      terpisah tidak pakai, tapi `main` pakai. Lihat blocker di atas.
- [ ] Drop furi dari semua split files → re-run merge (HANYA setelah dua item pertama beres)

### P13 — Post-source-reclassify (setelah P6)
- [ ] Re-run merge script → verify cards.js bersih dari deprecated sources

### P14 — Type reclassification (ongoing)
- [ ] Review 31 konsep kandidat retype vocab (short definitional desc)
  - Candidates: id 82, 83, 102, 186, 188, 201, 226, 245, 295, 381, 401 (dan lainnya)

### P15 — Usage expansion (ongoing)
- [ ] Isi usage pada vocab yang belum punya, per coverage target §4.6

### P16 — wglv SPLIT (sebelum P8b, P10, P11)
> **Done, session 23 (commit `3e8cea8`) — see HANDOFF.md CURRENT STATE for full detail
> (source unification, decisions made without asking, one data-quality issue carried through
> unfixed). Checkboxes below left unchecked on purpose — this section defines the task, HANDOFF.md
> tracks live status, same convention as P5's annotation above.**
- [ ] Pisahkan questions dari wglv01–05 berdasarkan direction
- [ ] Buat `wglv-jp-01, -02, ...` dari semua JP→ID questions
- [ ] Buat `wglv-id-01, -02, ...` dari semua ID→JP questions
- [ ] Reset `id` per question ke sequential dalam masing-masing file baru
- [ ] Update set-level `id`, export const name, title
- [ ] Delete wglv01–05
- [ ] Update exports di index

### P17 — jac-mockup RENAME (sebelum P8a item 2)
> **Done, session 23 (commit `001d357` + monolith sync) — see HANDOFF.md CURRENT STATE.
> Checkboxes left unchecked on purpose, same convention as P5/P16 above.**
- [ ] Rename folder `sets/csv/` → `sets/jac-mockup/`
- [ ] Rename files: ct→jmt, cp→jml
- [ ] Update `id:`, `title:`, `source:` field dalam setiap file
- [ ] Update export const names
- [ ] Update references di legacy monolithic dan index

### P8b — Ruby: wglv question sets (setelah P16)
- [ ] wglv-jp: naked `q` dan `exp`
- [ ] wglv-id: naked `hint` dan `opts`

### Blocked
(P21 — JAC Doboku + Kenchiku jitsugi — and PDF Viewer Mode, both removed session 24 along
with the Doboku/Kenchiku tracks themselves. Scope reduced to Lifeline-only per owner
decision. See HANDOFF.md.)

---

## 9. PDF MAPPING TASK

**11 PDF:** Setiap PDF = satu task terpisah untuk agen.

| # | PDF | Type | Track | Source output |
|---|-----|------|-------|--------------|
| 1–4 | JAC Teori | Materi | common | `jac-ch{N}`, target `cards/common/` |
| 5–7 | JAC Lifeline Praktik | Materi | lifeline | `jac-ch{N}`, target `cards/lifeline/` |
| 8–9 | Latihan Soal JAC Teori | Soal | common | mapping soal→kartu |
| 10–11 | Latihan Soal JAC Lifeline | Soal | lifeline | mapping soal→kartu |

**Output per PDF:** `PDF_MAPPING_[N]_[track]_[type].md`

**Untuk PDF materi (1–7):** Agen scan tiap term → classify sebagai EXISTING_MATCH / PARTIAL_MATCH / MISSING → output draft kartu baru jika MISSING.

**Untuk PDF soal latihan (8–11):** Agen mapping soal → kartu backing → identify EXISTING_COVER / WEAK_CARD / MISSING_CARD.

**Cross-chapter vocab dari PDF:** source = `vocab-jac`
**Vocab tambahan yang tidak eksplisit di PDF:** source = `vocab-supplementary`

---

## 10. QC CHECKLIST

### Kartu baru

```
jp:
  [ ] Semua kanji punya ruby 《ひらがな》 — termasuk kanji dalam （）
  [ ] Ruby adalah hiragana, bukan katakana
  [ ] Tidak ada nested ruby 《A《B》》
  [ ] Katakana alias/abbreviation menggunakan （） bukan 《》
  [ ] Threshold/angka tidak embedded dalam jp (masuk desc)

furi: (untuk kartu baru sebelum merge)
  [ ] Isi first ruby reading saja — tidak lebih

id_text:
  [ ] Bahasa Indonesia murni (tidak ada kanji/katakana/romaji JP)
  [ ] Tidak diakhiri titik, tidak diawali huruf kecil
  [ ] Diskriminatif dari id_text kartu lain yang jp-nya berbeda
  [ ] Slash max 1, tidak di akhir string

desc:
  [ ] Berakhir dengan . 。 ） 」 atau 】
  [ ] Setiap baris multiline berakhir tanda baca
  [ ] Tidak berakhir dengan → = : 、 》 atau mid-word
  [ ] Semua kanji punya ruby 《》
  [ ] Tidak ada encoding corruption

usage (jika ada):
  [ ] Hanya pada type vocab
  [ ] Format: [JP + ruby]（[terjemahan ID frasa verbal]）
  [ ] Semua kanji dalam JP punya ruby

type: [ ] sesuai decision tree §5.1
category: [ ] hourei hanya untuk hukum
source: [ ] tidak pakai deprecated sources (pending OD-1)
id: [ ] tidak duplikat
jp: [ ] tidak exact-duplikat dengan kartu lain (same type)
id_text: [ ] tidak duplikat dengan kartu lain yang jp-nya berbeda
```

### Standard question set entry

```
q: [ ] semua kanji ruby
hint: [ ] semua kanji ruby
opts (jika JP): [ ] semua kanji ruby
opts_id: [ ] semua opsi terisi (termasuk wrong options)
exp: [ ] semua kanji ruby  [ ] ending punct  [ ] tidak berakhir \'
related_card_id (jac): [ ] ID valid di cards.js
```

### wglv-jp entry

```
q: [ ] JP, semua kanji ruby
hint: [ ] ID clue — BERBEDA dari q, bukan copy/translasi q
opts: [ ] ID strings (tidak perlu ruby)
exp: [ ] format "JP term《ruby》 = ID translation"
```

### wglv-id entry

```
q: [ ] BI, format "Apa bahasa Jepangnya..."
hint: [ ] JP term dengan ruby — satu term
opts: [ ] JP terms, semua kanji ruby
opts_id: [ ] SEMUA opsi terisi termasuk wrong options
exp: [ ] format "JP term《ruby》 = ID translation"
```

### angka-kunci entry

```
soal: [ ] semua kanji ruby  [ ] format pertanyaan？ → jawaban
kartu: [ ] ID valid di cards.js
       [ ] null HANYA jika exam-meta — tambahkan comment // exam-meta
```

---

## 11. MERGE PREP CHECKLIST

Agent di `main` saat merge dari content-dq:

1. **Replace** `src/data/jac-teori.js` dan `jac-lifeline.js` (top-level) dengan versi `sets/jac/` — new schema (`q/hint/opts/ans/img/exp`)
2. **Rebuild** `wayground-sets.js` dari `sets/wayground/**/*.js` (W1 IDs: wt/wgl/wglv/wtv) —
   includes the wglv-jp/wglv-id split (P16, done session 23) and the P8b ruby fixes; both are
   already re-synced into the monolith, this step just needs to not clobber that
3. **Rebuild** `jac-mockup-sets.js` dari `sets/jac-mockup/*.js` (P17 done session 23 — renamed
   from `csv-sets.js`/`sets/csv/`; no conditional left, those old names don't exist anymore)
4. **`quiz-sets.js` needs no separate rebuild step.** Session 24's Doboku/Kenchiku removal
   deleted `sets/quiz/` entirely (it only ever held doboku-01..03.js/kenchiku-01..03.js) —
   `quiz-sets.js` is now a pure aggregator, `QUIZ_SETS = [...WAYGROUND_SETS,
   ...JAC_MOCKUP_SETS]`, no source folder of its own. Once steps 2 and 3 rebuild those two
   monoliths, this one is automatically current.
5. **Storage migration:** W1 ID rename = STORAGE_VERSION bump 4→5, add migration di `migrations.js`
6. **Run** `node scripts/merge-cards.mjs` → regenerate `cards.js` dari `source/`
7. **Drop `furi`** dari semua split files → re-run merge (P12 prerequisite harus selesai)
8. **Update** `viewer.html`: `c.furi||''` → `extractReading(c.jp)`
9. ~~Jika P17 selesai: update csv-sets.js shim~~ — **done, folded into item 3 above** (P17
   completed session 23, including the monolith rename — see `HANDOFF.md` CURRENT STATE)
10. ~~Jika P16 selesai: update wayground exports~~ — **done, folded into item 2 above** (P16
    completed session 23, monolith already re-synced per P8b's session-23 note)
11. **Also update `TrackPicker.jsx`/`DobokuMode.jsx`/`KenchikuMode.jsx`** on `main` — real UI
    code content-dq doesn't have a copy of, needs the equivalent Doboku/Kenchiku removal
    (session 24 scope reduction) applied there too. Flagged in `HANDOFF.md`'s CURRENT STATE,
    added here session 25 since it was missing from this checklist entirely.

---

## 12. OPEN DECISIONS

Butuh konfirmasi owner sebelum task terkait dikerjakan.

| ID | Issue | Options | Blocks | Status |
|----|-------|---------|--------|--------|
| OD-1 | **Source taxonomy: retain legacy labels vs merge ke vocab-supplementary** | A: Retain (handoff v16 decision — labels meaningful di UI) / B: Merge (CARD_CONTENT_SPEC v1.1+) | P6, P13 | ✅ B, answered 2026-07-11 |
| OD-2 | wglv split (P16): kerjakan sekarang di content-dq, atau tunda saat merge? | A: Sekarang / B: Tunda | P8b, P10, P11 | ✅ A, answered 2026-07-11 |
| OD-3 | jac-mockup rename (P17): kerjakan sekarang? | A: Sekarang / B: Tunda saat merge | P8a item 2 | ✅ A, answered 2026-07-11 |
| OD-4 | wglv02/03 hint di JP→ID: ubah ke ID clue seperti wglv04/05, atau biarkan? | A: Update / B: Keep as-is | P10 | ✅ A, resolved via execution 2026-07-15 |
| OD-5 | SSW Flashcards app (repo terpisah): apakah pakai `card.furi` field? | Confirm / Deny | P12 | ✅ **Terjawab session 28 (2026-08-17) lewat investigasi, bukan lewat owner.** Repo terpisah: TIDAK pakai. Tapi `main` repo ini sendiri: PAKAI, di ≥6 komponen mode — dan itu yang sebenarnya menggate P12. Lihat §8 P12 untuk daftar blocker konkret. |

---

*Single source of truth untuk content-dq DQ work. Update setelah setiap batch P0–P17 selesai.*
