# SSW Konstruksi — DQ Progress Tracker
**Branch:** content-dq
**Last updated:** 2026-05-11 (session 9: H9/H10/H11/S1-S4 execution)
**Handoff ref:** `DATA_QUALITY_HANDOFF_v15.md`

---

## HOW TO USE
Agent: cek file ini dulu. Ambil item **pertama yang masih `[ ]`**. Kerjakan. Centang `[x]`. Update "Last updated". Commit push. Selesai untuk sesi ini — atau lanjut ke item berikutnya kalau konteks masih cukup.

---

## TASK KEY
- **RUBY** = tambah ruby 《》 ke field yang masih bare kanji (butuh Japanese knowledge)
- **FURI-ALIGN** = sesuaikan separator di `furi` agar cocok dengan `jp` (vs / ・ / ：)
- **FILL** = isi field yang null/kosong dengan konten yang benar
- **AUDIT** = cek + tambah ruby ke field dalam file tertentu
- **RESTRUCTURE** = reorganisasi card ke file yang benar (zero data change)

---

## BATCH E — Card file restructure (session 8)

> **IMPORTANT:** Tasks S1–S4 harus dikerjakan BERURUTAN. S2 bergantung pada hasil S1. S4 paling complex — baca spec S4 dulu sebelum mulai.
> **Rule:** Zero data change — id, jp, category, source, semua field tidak disentuh. Hanya pindah card ke file yang benar.
> **Commit format:** `ARCH: [S1/S2/S3/S4] — [deskripsi singkat]`

### S1 — Split gakka.js: merge ke vocab-jac (common) + pindah ke lifeline
Files: `src/data/cards/common/gakka.js`, `src/data/cards/common/vocab-jac.js`, `src/data/cards/lifeline/vocab-jac.js`
- [x] Buka `common/gakka.js` — 17 cards total:
  - Cards dengan `source: "jac-gakka1"` (5) + `source: "jac-gakka2"` (3) → append ke `common/vocab-jac.js`
  - Cards dengan `source: "jac-jitsugi1"` (6) + `source: "jac-jitsugi2"` (3) → append ke `lifeline/vocab-jac.js`
- [x] Delete `common/gakka.js`
- [x] Verify: `common/vocab-jac.js` = 67 cards ✅, `lifeline/vocab-jac.js` = 23 cards ✅

### S2 — Merge jitsugi.js ke lifeline/vocab-jac.js
Files: `src/data/cards/lifeline/jitsugi.js`, `src/data/cards/lifeline/vocab-jac.js`
- [x] Append semua 19 cards dari `lifeline/jitsugi.js` ke `lifeline/vocab-jac.js`
  - All 19 cards: `source: "jac-jitsugi1"` (7) + `source: "jac-jitsugi2"` (12)
- [x] Delete `lifeline/jitsugi.js`
- [x] Verify: `lifeline/vocab-jac.js` = 42 cards total ✅ (23 dari S1 + 19)

### S3 — Migrate vocab-common.js → vocab-supplementary.js (common)
Files: `src/data/cards/common/vocab-common.js`, `src/data/cards/common/vocab-supplementary.js`
- [x] Append semua 114 cards dari `common/vocab-common.js` ke `common/vocab-supplementary.js`
  - Sources: vocab-core(12), vocab-exam(35), vocab-general(31), vocab-teori(29), text3l(7)
  - None have `jac-ch1`–`jac-ch4` source — semua masuk supplementary, zero exception
- [x] Delete `common/vocab-common.js`
- [x] Verify: `common/vocab-supplementary.js` = 247 cards ✅

### S4 — Reassign vocab-lifeline.js (235 cards) ke chapter files + vocab-supplementary
Files: `src/data/cards/lifeline/vocab-lifeline.js`, `src/data/cards/lifeline/ch5.js`, `src/data/cards/lifeline/ch6.js`, `src/data/cards/lifeline/ch7.js`, `src/data/cards/lifeline/vocab-supplementary.js`

**Category → chapter mapping rules:**
| Category | Target file | Rationale |
|---|---|---|
| `denki` (30 cards) | `ch5.js` | ch5 dominan: 57 vs 7 |
| `tsushin` (8 cards) | `ch5.js` | ch5 dominan: 23 vs 9 |
| `sekou` (40 cards) | `ch5.js` | ch5 dominan: 73 vs 14 |
| `haikan` (62 cards) | `ch6.js` | ch6 dominan: 42 vs 33 |
| `hoon` (24 cards) | `ch6.js` | ch6 dominan: 5 vs 2 |
| `shoubou` (10 cards) | `ch6.js` | ch6 dominan: 4 vs 7 (approx — cek isi) |
| `setsubi_kougu` (3 cards) | `ch6.js` | only in ch6 |
| `anzen` (21 cards) | `ch7.js` | ch7 = 35 anzen cards exclusively |
| `career` (37 cards) | `vocab-supplementary.js` | ⚠️ tidak ada di ch5/6/7 — kategori ini orphan di lifeline |

- [x] Untuk setiap card di `vocab-lifeline.js`: baca `category` → append ke file target sesuai tabel
- [x] Delete `lifeline/vocab-lifeline.js`
- [x] Verify card counts:
  - `ch5.js` naik dari 200 ke 278 (+denki30+tsushin8+sekou40) ✅
  - `ch6.js` naik dari 105 ke 204 (+haikan62+hoon24+shoubou10+setsubi_kougu3) ✅
  - `ch7.js` naik dari 35 ke 56 (+anzen21) ✅
  - `vocab-supplementary.js` naik dari 138 ke 175 (+career37) ✅
  - Total 235 cards terdistribusi, grand total tetap 1,443 ✅

> ⚠️ `career` cards (37) di vocab-lifeline.js adalah kategori yang tidak ada mapping-nya ke lifeline chapter manapun. Owner decision: sudah confirmed → `vocab-supplementary.js`.

---

## BATCH D — Housekeeping & pre-expansion hygiene (session 6 & 7)

### H1–H6 ✅ (lihat SELESAI di bawah)

### H7 — Update handoff Part 3 + Part 10 ✅
- [x] Part 3: Wayground set inventory diperbarui — wg8/9/11/12 ditambahkan, total count verified (26 files, 657 qs)
- [x] Part 10: Completely rewritten — actual file structure (10B), target state (10C), taxonomy rules (10D)
- [x] Handoff renamed v13 → v14

### H8 — Document wg8/wg9/wg11/wg12 ✅
- [x] Merged ke H7 — sudah done

### H9 — Fix ct01.js + ct02.js syntax errors 🔴
Files: `src/data/sets/csv/ct01.js`, `src/data/sets/csv/ct02.js`
- [x] **ct01.js:** Ada orphaned lines setelah `opts:` array — stray duplicate lines tanpa key/value context. Locate dan delete.
  ```
  // Pattern: setelah opts: [...] ada baris stray seperti:
  '休憩《きゅうけい》を取る',
  '危険《きけん》を予測...
  ```
  Cek sekitar line 87–93. Remove semua orphaned lines antara `opts:` dan `opts_id:`.
- [x] **ct02.js:** Same pattern — orphaned lines antara `opts:` dan `opts_id:`. Cek sekitar line 38–44.
- [x] Verify: `node --input-type=module < src/data/sets/csv/ct01.js` exits clean
- [x] Verify: `node --input-type=module < src/data/sets/csv/ct02.js` exits clean
- **Root cause:** Previous agent melakukan opts collapse tapi tidak membersihkan original opts lines

### H10 — Fix wg12 track field 🟡
File: `src/data/sets/wayground/wg12.js`
- [x] Change `track: "lifeline"` → `track: "common"`
- [x] Subtitle: "学科キーワード 法規・安全《あんぜん》・施工管理" — content is teori/common keywords, not lifeline-specific
- [x] Verify no other field changes needed
- **Root cause:** Possibly agent hallucination filling an empty track slot

### H11 — Add explicit `track` field to 6 quiz split files 🟡
Files: `src/data/sets/quiz/doboku-01.js`, `doboku-02.js`, `doboku-03.js`, `kenchiku-01.js`, `kenchiku-02.js`, `kenchiku-03.js`
- [x] Add `track: 'doboku'` to doboku-01/02/03.js (top-level set object field)
- [x] Add `track: 'kenchiku'` to kenchiku-01/02/03.js (top-level set object field)
- [x] Single-quote strings (canonical for data files)
- [x] Verify field is in the SET object, not inside individual questions

### H6 — Handoff file sync & rename ✅ (session 7)
- [x] Renamed v12 → v13, MASTER EXECUTION ORDER synced, monolithic vs split clarified, P21 DEFERRED

---

## BATCH B — Owner tasks (butuh Japanese knowledge)

### P7 — Cards furi separator alignment (213 cards) ✅
Files: `src/data/cards/common/**/*.js` + `src/data/cards/lifeline/**/*.js`
- [x] Sesuaikan `furi` separator agar cocok dengan `jp` pada 213 card

---

## BATCH C — Pending (blocked)

### P21 — JAC Doboku + Kenchiku jitsugi stubs
`src/data/jac-doboku.js`, `src/data/jac-kenchiku.js`
- [ ] Populate stubs setelah PDF JAC jitsugi doboku/kenchiku tersedia
- **Blocked:** belum ada PDF source material
- **Schema:** gunakan unified question schema (`q`, `hint`, `opts`, `opts_id`, `ans`, `img`, `exp`) — `img: null` semua dulu
- **ID format:** doboku → `dt{n}_q{nn}`, kenchiku → `kt{n}_q{nn}`

---

## SELESAI (semua sesi sebelumnya)
- ✅ H9: ct01.js + ct02.js syntax errors fixed (orphaned duplicate opts lines removed)
- ✅ H10: wg12 track "lifeline" → "common"
- ✅ H11: track field added to 6 quiz split files (doboku/kenchiku)
- ✅ S1: gakka.js split — 8 cards→common/vocab-jac.js (67), 9 cards→lifeline/vocab-jac.js (23), gakka.js deleted
- ✅ S2: jitsugi.js merged → lifeline/vocab-jac.js (42 total), jitsugi.js deleted
- ✅ S3: vocab-common.js migrated → common/vocab-supplementary.js (247 total), vocab-common.js deleted
- ✅ S4: vocab-lifeline.js (235 cards) redistributed by category → ch5(278)/ch6(204)/ch7(56)/vocab-supp(175), vocab-lifeline.js deleted


- ✅ H1–H6: housekeeping, policy locks, handoff sync
- ✅ P7: furi separator alignment (213 cards)
- ✅ P17: confusion-pairs tip_id filled (28 entries)
- ✅ P19: danger-pairs traps + explanation ruby done
- ✅ P16: jac-teori.js + jac-lifeline.js schema migrated (95 qs)
- ✅ P18: jac-teori.js related_card_id — 0 null tersisa
- ✅ P14: wayground exp stubs — 0 stub tersisa
- ✅ P13-struct/content: quiz-sets id + hints + ruby done (90 qs)
- ✅ P12-FIX: wayground double ruby fixed
- ✅ P11-FIX-A/B + C: csv double ruby + wrong 《》 + 198 bare opts
- ✅ P15: csv exp stubs replaced
- ✅ P0–P0d, P1–P6, P8–P10, P20: semua selesai (lihat handoff)
- ✅ P3: Fix 2 furi typos (ids 532, 230)
- ✅ P4: 220 maru→ruby conversions
- ✅ P5: 1,020 bare-kanji jp fields annotated
- ✅ P6: 153 multi-part jp fields annotated per-segment
- ✅ P7b/c/d: index.js, wg10→wp5, quote style jac-*
- ✅ P8: Ruby pada termA/termB confusion-pairs (28 pairs)
- ✅ P9: Ruby pada term danger-pairs (17/20; 3 kana/romaji skipped)
- ✅ P10: Ruby pada soal angka-kunci (29 items)
- ✅ P11 (FIX-A/B + C): csv double ruby fix + wrong 《》 revert + 198 bare opts annotated
- ✅ P20: Rename sipil→doboku, bangunan→kenchiku
