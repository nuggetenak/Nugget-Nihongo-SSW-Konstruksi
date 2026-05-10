# SSW Konstruksi — DQ Progress Tracker
**Branch:** content-dq
**Last updated:** 2026-05-10 (schema update: hasPhoto→img:null, P21 clarified jitsugi+pairing)
**Handoff ref:** `DATA_QUALITY_HANDOFF_v12.md`

---

## HOW TO USE
Agent: cek file ini dulu. Ambil item **pertama yang masih `[ ]`**. Kerjakan. Centang `[x]`. Update "Last updated". Commit push. Selesai untuk sesi ini — atau lanjut ke item berikutnya kalau konteks masih cukup.

---

## TASK KEY
- **RUBY** = tambah ruby 《》 ke field yang masih bare kanji (butuh Japanese knowledge)
- **FURI-ALIGN** = sesuaikan separator di `furi` agar cocok dengan `jp` (vs / ・ / ：)
- **FILL** = isi field yang null/kosong dengan konten yang benar
- **AUDIT** = cek + tambah ruby ke field dalam file tertentu

---

## BATCH A — Agent tasks (scripting only)

### P17 — confusion-pairs: fill tip_id (28 entries)
`src/data/confusion-pairs.js`
- [x] Fill all 28 `tip_id: null` → Indonesian translation of `tip` field
- **Rule:** `tip_id` = terjemahan bebas Indonesian dari `tip` (JP). Tone: singkat, faktual, ≤100 char.
- **Verify:** zero `tip_id: null` tersisa

### P19 — danger-pairs: ruby on traps + explanation (20 entries)
`src/data/danger-pairs.js`
- [x] Tambah ruby 《》 ke semua kanji dalam field `traps[]` dan `explanation`
- **Rule:** annotate full compound, bukan suffix. Maru `（）` untuk sinonim/abbrev — jangan ubah ke `《》`.
- **Verify:** semua kanji dalam traps/explanation sudah punya 《》

---

## BATCH B — Owner tasks (butuh Japanese knowledge)

### P7 — Cards furi separator alignment (213 cards)
Files: `src/data/cards/common/**/*.js` + `src/data/cards/lifeline/**/*.js`
- [x] Sesuaikan `furi` separator agar cocok dengan `jp` pada 213 card yang mismatch
- **Rule:** jika `jp` punya `vs`, `・`, atau `：` → `furi` harus punya separator yang sama di posisi yang sama
  ```js
  // BAD
  jp: "加湿器《かしつき》 vs 除湿器《じょしつき》", furi: "かしつきじょしつき"
  // GOOD
  jp: "加湿器《かしつき》 vs 除湿器《じょしつき》", furi: "かしつき vs じょしつき"
  ```
- **Verify:** zero furi mismatch (run check script)

---

## BATCH C — Pending (blocked)

### P21 — JAC Doboku + Kenchiku jitsugi stubs
`src/data/jac-doboku.js`, `src/data/jac-kenchiku.js`
- [ ] Populate stubs setelah PDF JAC jitsugi doboku/kenchiku tersedia
- **Blocked:** belum ada PDF source material
- **Clarification:** file ini berisi soal **jitsugi** (praktik bergambar) per track — BUKAN soal teori. `jac-teori.js` dipakai bersama oleh semua 3 track.
- **Schema:** gunakan unified question schema (`q`, `hint`, `opts`, `opts_id`, `ans`, `img`, `exp`) — `img: null` semua dulu
- **ID format:** doboku → `dt{n}_q{nn}`, kenchiku → `kt{n}_q{nn}`
- **Exam pairing:** Teori Set 1/2 (tt1/tt2) dipasangkan dengan jitsugi set masing-masing track

---

## SELESAI (semua sesi sebelumnya)

### Konfirmasi dari audit aktual (2026-05-10)
- ✅ **P16**: jac-teori.js (65 qs) + jac-lifeline.js (30 qs) — MIGRATE selesai hari ini. Bonus: structural fix st1_q14.
- ✅ **P18**: jac-teori.js null related_card_id — 0 null tersisa (verified)
- ✅ **P14**: wayground exp stubs — 0 stub tersisa (verified)
- ✅ **P13-struct**: quiz-sets — id field ditambah ke semua 90 qs (verified)
- ✅ **P13-content**: quiz-sets — hint + ruby pada q + opts (verified)
- ✅ **P12-FIX**: wayground double ruby — clean (verified wt1)
- ✅ **P11-FIX-B**: csv wrong 《》 → （） — clean (verified)
- ✅ **P15**: csv exp stubs ~40 items — semua replaced

### Dari handoff v12 DONE list
- ✅ P0–P0d: UI fixes, wg renames, quote removal
- ✅ P1: Delete semua `quote` fields (590 removed)
- ✅ P2: Fix 4 malformed jp-ruby cards (ids 293, 476, 489, 491)
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
