# SSW Konstruksi — DQ Progress Tracker
**Branch:** content-dq
**Last updated:** 2026-05-11 (session 7: handoff hygiene — MASTER EXECUTION ORDER + CODEBASE STATE synced)
**Handoff ref:** `DATA_QUALITY_HANDOFF_v13.md`

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

## BATCH D — Housekeeping & pre-expansion hygiene (session 6)

### H1 — `_origIndex` audit & policy lock ✅
- [x] Verified: `cards.js` exports 0 `_origIndex` fields — merge script strips correctly
- [x] Verified: source files (879+564) and split card files (1,443) retain it intentionally
- [x] Policy documented in handoff v13 §1G + §11C
- **Decision:** NO stripping needed from source/split files. Field is a merge artifact, not a data field.

### H2 — `usage` field policy lock ✅
- [x] Verified count: 123 common + 30 lifeline = 153 total (matches handoff)
- [x] Policy locked in handoff v13 §1F: optional, no null-fill, no bulk-add
- **Decision (owner):** Absent = intentional. New cards: include only if natural example exists.

### H3 — `type` enum audit & documentation ✅
- [x] Audited actual values in both source files — zero anomalies
- [x] Lifeline: `konsep` (286) + `vocab` (278) — no `hukum` ✅
- [x] Common: `konsep` (406) + `vocab` (377) + `hukum` (96) ✅
- [x] Definitions documented in handoff v13 §1E
- **Decision:** No fixes needed. Enum is clean.

### H4 — `category` stubs for doboku/kenchiku ✅
- [x] Verified `categories.js` already has D1/D2/D3 + B1/B2 stubs with `placeholder: true`
- [x] Documented in handoff v13 §11A
- **Decision:** No new stubs needed. Structure is ready.

### H6 — Handoff file sync & rename ✅ (session 7)
- [x] Renamed `DATA_QUALITY_HANDOFF_v12.md` → `DATA_QUALITY_HANDOFF_v13.md` (filename now matches content)
- [x] MASTER EXECUTION ORDER: all completed tasks updated to ✅ (P7, P11-FIX-A/B, P11-C, P12-FIX, P13-struct/content, P14, P15, P16, P17, P18, P19) — were showing ❌ OPEN despite being done
- [x] CODEBASE STATE: clarified monolithic vs split file distinction — `csv-sets.js`/`wayground-sets.js` labelled as legacy originals (not working files on content-dq)
- [x] P21 status updated to ⏸ DEFERRED in execution order
- **Root cause:** Session 6 agent updated PROGRESS.md but did not sync the handoff's execution order section


- [x] Confirmed `jac-doboku.js` / `jac-kenchiku.js` at `src/data/` top-level (not `sets/jac/`)
- [x] PROGRESS.md P21 path already correct — no fix needed
- [x] Confirmed `sets/jac/` only has teori+lifeline (split DQ copies)
- [x] Documented in handoff v13 §11B
- [x] Soal source convention (`jac-gakka-d{n}` / `jac-jitsugi-d{n}`) already in handoff §0E
- ⚠️ **OWNER DECISION NEEDED**: Chapter card source naming for doboku/kenchiku (`jac-ch{n}-d` vs `jac-doboku-ch{n}` vs reuse `jac-ch{n}`) — documented in handoff §0E and §11E. Resolve before first card batch.

---



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
