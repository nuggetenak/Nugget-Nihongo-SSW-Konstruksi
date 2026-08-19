# SSW Konstruksi — DQ Progress Tracker

**Branch:** content-dq
**Last content updated:** 2026-05-18 (session 22 FINAL: P8a csv/ hint+opts annotated (+20 fields); all integrity checks pass; 0 naked in all sets)
**Last admin sync:** 2026-07-11 (session 23 — see HANDOFF v18 for what changed; this file's checklist itself was already accurate, only cross-references were stale)
**Handoff ref:** `DATA_QUALITY_HANDOFF_v18.md`
**Spec ref:** `docs/CARD_CONTENT_SPEC.md`

---

## HOW TO USE

Agent: baca `DATA_QUALITY_HANDOFF_v18.md` dulu — terutama STATUS SUMMARY dan WHAT'S ACTUALLY NEXT (semua task yang tidak OD-gated sudah selesai per session 23). Kalau mau ambil item **pertama yang masih `[ ]`**, cek dulu di HANDOFF v18 apakah item itu OD-gated atau butuh judgment/materi eksternal sebelum mulai. Kerjakan. Centang `[x]`. Update "Last content updated" di atas. Commit push. Lanjut ke item berikutnya atau stop.

**Dependency order (P14/P15 ditambahkan — sebelumnya hilang dari urutan ini walau aktif dikerjakan; keduanya sudah selesai):**
P0 → P1 → P2 → P3 → P4 → P5 → P9 → P7 → P14 → P15 → P16 → P17 → P8a → P8b → P10 → P11 → P6⚠️ → P12(merge) → P13

---

## ACTIVE TASKS

### P0 — 🔴 BLOCKING (fix dulu sebelum apapun)

Files C1: `src/data/cards/lifeline/ch6.js` (id=476), `src/data/cards/lifeline/vocab-supplementary.js` (id=773)
Files C2: `src/data/cards/lifeline/ch5.js` (id=321–371), `src/data/cards/lifeline/ch6.js` (id=452–619)

- [x] **C1:** Fix encoding corrupt desc — `id=476` (ch6.js), `id=773` (vocab-supplementary.js)
- [x] **C2:** Fix 12 nested ruby `《A《B》》` — id: 321, 330, 339, 356, 371, 452, 485, 606, 608, 610, 612, 619

---

### P1 — Ruby: jp field

Files: `src/data/cards/**/*.js` (split files)

- [x] 62 kartu jp tanpa ruby — tambahkan ruby `《ひらがな》`
- [x] 18 kartu katakana ruby `《katakana》` — convert ke `（katakana）`
- [x] ~152 naked kanji di jp dalam `（）` — tambahkan ruby (140 fixed; 78 post-P1-A)
- [ ] ~64 naked kanji di jp post-compound (subtitle/qualifier) — review manual [DEFERRED]

---

### P2 — Ruby: desc + usage

Files: `src/data/cards/**/*.js`

- [x] 33 naked kanji di desc — tambahkan ruby (10 kartu fixed; 1256–1286 range)
- [x] 2 naked kanji di usage — `id=662` fixed; `id=939` sudah clean

---

### P3 — Field fixes: cards

Files: split files + `src/data/source/cards-*.js` + `src/data/cards.js`

- [x] `id=136` — id_text → `Uji keterampilan + Teknisi bersertifikat`
- [x] `id=233` — id_text → `Tarik kabel, pasang konduit, slab, siapkan`
- [x] `id=1371` — id_text → `Konstruksi bata beton (CB)`
- [x] 41 id_text truncated ending `/` → lengkapi
- [x] 13 id_text multi-slash list → rewrite sebagai frasa BI
- [x] `id=166, 167, 170` — reclassify `category` → `'career'`
- [x] `id=1275` — retype `type` → `'hukum'`
- [x] `id=1184, 1185` — fix `source` → `'jac-ch2'`
- [ ] `id=1240` — fix `source` → DEFERRED: ambiguous; 厚生年金 konten jac-ch2 tapi belum dikonfirmasi

---

### P4 — Duplicate resolution

Files: split files + `cards.js` + `src/data/sets/jac/jac-teori.js`

- [x] Merge 5 exact duplicate pairs: ねじゲージ (374→del), ほうれんそう (592→del), マンドレル通過試験 (484→del), 玉掛け (518→del), 防露工事 (982→del)
- [ ] Merge EF接合 triple: id=459, 612, 613 — DEFERRED: 3 kartu punya konten berbeda, perlu konfirmasi AGENT 12 sebelum merge
- [ ] Review 6 same-jp ambiguous pairs — DEFERRED: perlu human judgment
- [x] Fix 26 duplicate id_text → disambiguasi selesai

---

### P5 — Desc truncation

Files: `src/data/cards/**/*.js` (prioritas: `lifeline/ch6.js`)

- [ ] 213 desc truncated mid-word — complete content [DEFERRED: butuh konten JAC asli]
- [ ] 266 desc berakhir complete-word tanpa period — [DEFERRED: mayoritas sebenarnya truncated]
- [x] 82 desc berakhir symbol — 13 fixed: 7×(》→.) + 6×completion (id=170,549,556,561,582,1021) + typo id=187; 15 truly truncated DEFERRED

---

### P9 — Angka-kunci fixes

File: `src/data/angka-kunci.js`

- [x] `kartu: null` → `kartu: 134` — entry `45 jam/bln, 360 jam/thn`
- [x] `kartu: null` → `kartu: 1172` — entry `6 bulan → 10 hari`
- [x] `kartu: null` → `kartu: 1347` — entry `< 6mm / ≥ 6mm`
- [x] `soal` field entry `< 6mm / ≥ 6mm` — sudah lengkap, tidak perlu fix
- [x] Verify 2 exam-meta entries — comment sudah ada ✓
- [x] Ruby pada soal fields — 0 naked kanji ✓

---

### P7 — JAC sets: exp corruption

Files: `src/data/sets/jac/jac-teori.js`, `src/data/sets/jac/jac-lifeline.js`

- [x] `jac-teori.js`: 6 dari 8 exp sudah bersih; 2 tersisa adalah konten valid (apostrophe intentional), bukan truncation
- [x] `jac-lifeline.js`: 0 exp bermasalah — semua sudah bersih ✓

---

### P16 — wglv SPLIT _(OD-2: confirm owner sebelum mulai)_

Files: `src/data/sets/wayground/lifeline/vocab/`

- [ ] Pisahkan wglv01–05 berdasarkan direction (JP→ID vs ID→JP)
- [ ] Buat `wglv-jp-01...` dari semua JP→ID questions; `wglv-id-01...` dari ID→JP
- [ ] Reset `id` per question ke sequential dalam masing-masing file baru
- [ ] Update set-level `id`, `title`, export const name
- [ ] Delete wglv01–05 lama
- [ ] Update exports di wayground index

---

### P17 — jac-mockup RENAME _(OD-3: confirm owner sebelum mulai)_

Files: `src/data/sets/csv/` → `src/data/sets/jac-mockup/`

> **OPSI B resolved (session 20):** Dirty state dari session 19 (jac-mockup files tidak ter-commit) resolved via fresh clone. Working state bersih. Tunggu OD-3 konfirmasi owner sebelum mulai P17 proper.

- [ ] Rename folder `sets/csv/` → `sets/jac-mockup/`
- [ ] Rename files: `ct01–ct06` → `jmt01–jmt06`; `cp01–cp06` → `jml01–jml06`
- [ ] Update `id:`, `title:`, `source:` field dalam setiap file
- [ ] Update export const names: `SET_CT01` → `SET_JMT01`, dst
- [ ] Update references di legacy monolithic + index

---

### P8a — Ruby: standard question sets _(P7 dulu; P17 dulu untuk item 2)_

Priority: JAC → jac-mockup → wt/wgl → quiz → wtv

- [x] `sets/jac/`: 95 naked `q` + naked `exp`/`hint` — **DONE session 20** (jac-teori.js + jac-lifeline.js, 3-pass annotation, 0 naked remaining, syntax-checked)
- [x] `sets/jac-mockup/` (ex-csv): ruby annotation done session 22 — 21 q + 174 exp + 16 hint + 4 opts annotated (pre-rename; content 100% clean, await P17 for folder rename)
- [x] `sets/wayground/teori/` + `lifeline/praktik/`: **DONE session 20** — 0 naked found (already clean pre-session)
- [x] `sets/quiz/`: **DONE session 20** (doboku-01~03, kenchiku-01~03 — 104 fields annotated, 0 naked remaining, syntax-checked)
- [x] `sets/wayground/vocab/wtv01.js`: **DONE session 20** — 0 naked found (already clean pre-session)

---

### P8b — Ruby: wglv _(P16 dulu)_

Files: `src/data/sets/wayground/lifeline/vocab/wglv-jp-*.js`, `wglv-id-*.js`

- [ ] wglv-jp series: naked `q` dan `exp`
- [ ] wglv-id series: naked `hint` dan `opts`

---

### P10 — wglv quality gaps _(P16 dulu)_

- [ ] wglv-id series: isi `opts_id` untuk semua wrong options
- [ ] wglv-jp series: perbaiki `hint` yang masih copy-of-q → ID clue _(OD-4)_

---

### P11 — wglv exp generic _(P16 dulu)_

- [ ] wglv-id series (ex-wglv04/05): ganti `"JP = bahasa Jepangnya."` → specific translation

---

### P6 — Source reclassification ⚠️ TUNGGU OWNER CONFIRM (OD-1)

> **JANGAN KERJAKAN sampai owner konfirmasi OD-1 di `docs/CARD_CONTENT_SPEC.md` §12.**

- [ ] Jika approved: 226 kartu deprecated sources → `vocab-supplementary`
- [ ] Edit `source:` di split files → re-run merge script

---

### P12 — Furi drop _(AT MERGE TIME — bukan sekarang)_

Prerequisites: P1 done, OD-5 confirmed, viewer.html updated

- [ ] Drop `furi` dari semua split files → re-run merge script

---

### P13 — Source cleanup _(setelah P6)_

- [ ] Re-run merge script → verify cards.js zero deprecated sources

---

### P14 — Type reclassification _(ongoing)_

- [x] Review 11 konsep kandidat vocab (session 22): reclassified 8 → vocab (id=82,83,186,188,201,295,381,401); kept konsep: 102, 226, 245
- [x] Extended scan seluruh konsep (session 22 wave 2): reclassified 55 tambahan → vocab (tools/instruments/materials/cable types: id=41–94 range, 121, 241, 244, 259, 260, 272, 278, 279, 283, 285, 299, 317, 332, 334, 335, 357, 363, 366, 386, 394); kept konsep: 55 (fenomena listrik), 84 (EF接合 deferred), 96 (system-level), 191/192/224 (grouped/verb), 275/284/358 (vs comparisons)
- [x] Extended scan wave 3 (session 22): reclassified 31 tambahan → vocab (pipe types, PPE, survey tools, fire systems, career terms: id=73,74,78,79,81,89,91,92,95,97,98,100,104,114,115,116,118,122,123,125,126,210,211,270,271,288,289,290,454,455,506)
- [x] Extended scan wave 4 (session 22): reclassified 340 tambahan → vocab; Extended scan wave 5: reclassified 156 tambahan → vocab
- [x] **P14 SELESAI** — total 581 kartu reclassified konsep→vocab session 22; konsep sisa 97 (genuine principles/procedures/regulations/category overviews)

---

### P15 — Usage expansion _(ongoing, parallel)_

- [x] Isi `usage` pada vocab yang belum punya — wave 1 (76) + wave 2 (55) + wave 3 (31) + wave 4 (340) + wave 5 (156) + batch akhir (434) = **1,092 total usage added session 22**; vocab coverage 100% (1244/1244)

---

### BLOCKED

- ⏸ P21 — JAC Doboku + Kenchiku jitsugi stubs — tunggu PDF JAC resmi dari owner
- ⏸ PDF Viewer Mode — tunggu URL PDF resmi JAC dari owner

---

## SELESAI (sessions 1–17, kompak)

### Infrastructure & Admin

| Task      | What                                                                              | Session |
| --------- | --------------------------------------------------------------------------------- | ------- |
| ADM1–ADM9 | Admin doc hygiene, commit hash sync, terminology fixes, session log updates       | 13–17   |
| W1        | Wayground taxonomy restructure — 26 sets rename+reorganize (wg/wp → wgl/wglv/wtv) | 12      |
| G1        | Type-based filtering — useTrackedCards, FilterPopup, FocusMode                    | 11      |
| G2        | Source fix: id:1184 → vocab-supplementary; id:1233 → jac-gakka1                   | 11      |

### Card Restructure

| Task  | What                                                                                                                         | Session |
| ----- | ---------------------------------------------------------------------------------------------------------------------------- | ------- |
| S1–S4 | Card split restructure — gakka.js/jitsugi.js/vocab-common.js/vocab-lifeline.js → correct split files. 1,443 cards preserved. | 8–9     |
| F1–F3 | Source cleanup — text3l→jac-ch3 (25), single-match trace relabel (120), categories.js text3l removed                         | 10      |

### Content DQ (sessions 1–10)

| Task               | What                                                                                          |
| ------------------ | --------------------------------------------------------------------------------------------- |
| P0–P6, P8–P10, P20 | Ruby annotation, furi fixes, maru→ruby, duplicate cleanup, quote removal, rename sipil→doboku |
| P7 (furi sep)      | Furi separator alignment — 213 cards                                                          |
| P11-FIX-A/B/C      | CSV double ruby fix + wrong 《》 revert + 198 bare opts annotated                             |
| P12-FIX            | Wayground double ruby fixed                                                                   |
| P13                | Quiz-sets id+hints+ruby done (90 qs)                                                          |
| P14 (old)          | Wayground exp stubs expanded                                                                  |
| P15 (old)          | CSV exp stubs replaced                                                                        |
| P16 (old)          | JAC teori+lifeline schema migrated → sets/jac/ DQ copies (new schema)                         |
| P17 (old)          | confusion-pairs tip_id filled (28 entries)                                                    |
| P18                | jac-teori.js related_card_id — 0 null remaining                                               |
| P19                | danger-pairs traps + explanation ruby done                                                    |
| H1–H11             | Housekeeping, wg12 track fix, quiz track field, ct01/ct02 syntax fix                          |
