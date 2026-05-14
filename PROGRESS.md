# SSW Konstruksi — DQ Progress Tracker
**Branch:** content-dq
**Last updated:** 2026-05-14 (session 18: ADM10 — consolidated spec, admin sync)
**Handoff ref:** `DATA_QUALITY_HANDOFF_v17.md`
**Spec ref:** `docs/CARD_CONTENT_SPEC.md`

---

## HOW TO USE
Agent: baca `DATA_QUALITY_HANDOFF_v17.md` dulu. Ambil item **pertama yang masih `[ ]`**. Kerjakan. Centang `[x]`. Update "Last updated". Commit push. Lanjut ke item berikutnya atau stop.

**Dependency order:**
P0 → P1 → P2 → P3 → P4 → P5 → P9 → P7 → P16 → P17 → P8a → P8b → P10 → P11 → P6⚠️ → P12(merge) → P13 → P14 → P15

---

## ACTIVE TASKS

### P0 — 🔴 BLOCKING (fix dulu sebelum apapun)
Files: `src/data/cards/lifeline/ch6.js`, `src/data/cards/lifeline/ch5.js` (+ lihat tabel C2 di spec)
- [ ] **C1:** Fix encoding corrupt desc — `id=476` (jac-ch6), `id=773` (jac-ch6)
- [ ] **C2:** Fix 12 nested ruby `《A《B》》` — id: 321, 330, 339, 356, 371, 452, 485, 606, 608, 610, 612, 619

---

### P1 — Ruby: jp field
Files: `src/data/cards/**/*.js` (split files)
- [ ] 62 kartu jp tanpa ruby — tambahkan ruby `《ひらがな》`
- [ ] 18 kartu katakana ruby `《katakana》` — convert ke `（katakana）`
- [ ] ~152 naked kanji di jp dalam `（）` — tambahkan ruby
- [ ] ~64 naked kanji di jp post-compound (subtitle/qualifier) — review manual

---

### P2 — Ruby: desc + usage
Files: `src/data/cards/**/*.js`
- [ ] 33 naked kanji di desc — tambahkan ruby (prioritas: id range 1256–1286, jac-ch3)
- [ ] 2 naked kanji di usage — `id=662`, `id=939`

---

### P3 — Field fixes: cards
Files: split files + `src/data/source/cards-*.js` + `src/data/cards.js`
- [ ] `id=136` — id_text `'Uji keterampilan /'` → lengkapi phrase
- [ ] `id=233` — id_text `'通線/konduit/slab/siapkan'` → satu frasa BI yang readable
- [ ] `id=1371` — id_text `'CB造'` → `'Konstruksi bata beton (CB)'`
- [ ] 41 id_text truncated ending `/` → lengkapi
- [ ] 13 id_text multi-slash list → rewrite sebagai frasa BI
- [ ] `id=166, 167, 170` — reclassify `category` → `'career'`
- [ ] `id=1275` — retype `type` → `'hukum'`
- [ ] `id=1184, 1185` — fix `source` → `'jac-ch2'`
- [ ] `id=1240` — fix `source` → source yang sesuai konten

---

### P4 — Duplicate resolution
Files: split files + `cards.js` + `src/data/sets/jac/jac-teori.js`
- [ ] Merge 5 exact duplicate pairs: ねじゲージ (374,433), ほうれんそう (219,592), マンドレル通過試験 (484,614), 玉掛け (165,518), 防露工事 (982,1257)
- [ ] Merge EF接合 triple: id=459, 612, 613 → satu kartu
- [ ] Review 6 same-jp ambiguous pairs — decision tree §5.1 di spec
- [ ] Disambiguate 25 duplicate id_text

---

### P5 — Desc truncation
Files: `src/data/cards/**/*.js` (prioritas: `lifeline/ch6.js`)
- [ ] 213 desc truncated mid-word — complete content
- [ ] 266 desc berakhir complete-word tanpa period — add trailing `.`
- [ ] 82 desc berakhir symbol (`→`, `=`, `:`, `》`, `、`) — fix per kasus

---

### P9 — Angka-kunci fixes
File: `src/data/angka-kunci.js`
- [ ] `kartu: null` → `kartu: 134` — entry `45 jam/bln, 360 jam/thn`
- [ ] `kartu: null` → `kartu: 1172` — entry `6 bulan → 10 hari`
- [ ] `kartu: null` → `kartu: 1347` — entry `< 6mm / ≥ 6mm`
- [ ] Lengkapi `soal` field entry `< 6mm / ≥ 6mm` yang terpotong
- [ ] Verify 2 exam-meta entries sudah ada comment `// exam-meta`
- [ ] Ruby pada 28/29 `soal` fields yang masih naked kanji

---

### P7 — JAC sets: exp corruption
Files: `src/data/sets/jac/jac-teori.js`, `src/data/sets/jac/jac-lifeline.js`
- [ ] `jac-teori.js`: 8 exp berakhir `\'` — complete/fix konten
- [ ] `jac-lifeline.js`: 4 exp berakhir `\'` — complete/fix konten

---

### P16 — wglv SPLIT *(OD-2: confirm owner sebelum mulai)*
Files: `src/data/sets/wayground/lifeline/vocab/`
- [ ] Pisahkan wglv01–05 berdasarkan direction (JP→ID vs ID→JP)
- [ ] Buat `wglv-jp-01...` dari semua JP→ID questions; `wglv-id-01...` dari ID→JP
- [ ] Reset `id` per question ke sequential dalam masing-masing file baru
- [ ] Update set-level `id`, `title`, export const name
- [ ] Delete wglv01–05 lama
- [ ] Update exports di wayground index

---

### P17 — jac-mockup RENAME *(OD-3: confirm owner sebelum mulai)*
Files: `src/data/sets/csv/` → `src/data/sets/jac-mockup/`
- [ ] Rename folder `sets/csv/` → `sets/jac-mockup/`
- [ ] Rename files: `ct01–ct06` → `jmt01–jmt06`; `cp01–cp06` → `jml01–jml06`
- [ ] Update `id:`, `title:`, `source:` field dalam setiap file
- [ ] Update export const names: `SET_CT01` → `SET_JMT01`, dst
- [ ] Update references di legacy monolithic + index

---

### P8a — Ruby: standard question sets *(P7 + P17 dulu)*
Priority: JAC → jac-mockup → wt/wgl → quiz → wtv
- [ ] `sets/jac/`: 95 naked `q` + naked `exp`/`hint`
- [ ] `sets/jac-mockup/` (ex-csv): ~56 naked `q` + ~164 naked `exp`
- [ ] `sets/wayground/teori/` + `lifeline/praktik/`: ~37+84 naked `q`, ~210 naked `exp`
- [ ] `sets/quiz/`: ~78 naked `exp`
- [ ] `sets/wayground/vocab/wtv01.js`: ~5 naked `q`, ~22 naked `exp`/`hint`

---

### P8b — Ruby: wglv *(P16 dulu)*
Files: `src/data/sets/wayground/lifeline/vocab/wglv-jp-*.js`, `wglv-id-*.js`
- [ ] wglv-jp series: naked `q` dan `exp`
- [ ] wglv-id series: naked `hint` dan `opts`

---

### P10 — wglv quality gaps *(P16 dulu)*
- [ ] wglv-id series: isi `opts_id` untuk semua wrong options
- [ ] wglv-jp series: perbaiki `hint` yang masih copy-of-q → ID clue *(OD-4)*

---

### P11 — wglv exp generic *(P16 dulu)*
- [ ] wglv-id series (ex-wglv04/05): ganti `"JP = bahasa Jepangnya."` → specific translation

---

### P6 — Source reclassification ⚠️ TUNGGU OWNER CONFIRM (OD-1)
> **JANGAN KERJAKAN sampai owner konfirmasi OD-1 di `docs/CARD_CONTENT_SPEC.md` §12.**
- [ ] Jika approved: 226 kartu deprecated sources → `vocab-supplementary`
- [ ] Edit `source:` di split files → re-run merge script

---

### P12 — Furi drop *(AT MERGE TIME — bukan sekarang)*
Prerequisites: P1 done, OD-5 confirmed, viewer.html updated
- [ ] Drop `furi` dari semua split files → re-run merge script

---

### P13 — Source cleanup *(setelah P6)*
- [ ] Re-run merge script → verify cards.js zero deprecated sources

---

### P14 — Type reclassification *(ongoing)*
- [ ] Review 31 konsep kandidat vocab: id 82,83,102,186,188,201,226,245,295,381,401 (+ others)

---

### P15 — Usage expansion *(ongoing, parallel)*
- [ ] Isi `usage` pada vocab yang belum punya — target per category di spec §4.6

---

### BLOCKED
- ⏸ P21 — JAC Doboku + Kenchiku jitsugi stubs — tunggu PDF JAC resmi dari owner
- ⏸ PDF Viewer Mode — tunggu URL PDF resmi JAC dari owner

---

## SELESAI (sessions 1–17, kompak)

### Infrastructure & Admin
| Task | What | Session |
|------|------|---------|
| ADM1–ADM9 | Admin doc hygiene, commit hash sync, terminology fixes, session log updates | 13–17 |
| W1 | Wayground taxonomy restructure — 26 sets rename+reorganize (wg/wp → wgl/wglv/wtv) | 12 |
| G1 | Type-based filtering — useTrackedCards, FilterPopup, FocusMode | 11 |
| G2 | Source fix: id:1184 → vocab-supplementary; id:1233 → jac-gakka1 | 11 |

### Card Restructure
| Task | What | Session |
|------|------|---------|
| S1–S4 | Card split restructure — gakka.js/jitsugi.js/vocab-common.js/vocab-lifeline.js → correct split files. 1,443 cards preserved. | 8–9 |
| F1–F3 | Source cleanup — text3l→jac-ch3 (25), single-match trace relabel (120), categories.js text3l removed | 10 |

### Content DQ (sessions 1–10)
| Task | What |
|------|------|
| P0–P6, P8–P10, P20 | Ruby annotation, furi fixes, maru→ruby, duplicate cleanup, quote removal, rename sipil→doboku |
| P7 (furi sep) | Furi separator alignment — 213 cards |
| P11-FIX-A/B/C | CSV double ruby fix + wrong 《》 revert + 198 bare opts annotated |
| P12-FIX | Wayground double ruby fixed |
| P13 | Quiz-sets id+hints+ruby done (90 qs) |
| P14 (old) | Wayground exp stubs expanded |
| P15 (old) | CSV exp stubs replaced |
| P16 (old) | JAC teori+lifeline schema migrated → sets/jac/ DQ copies (new schema) |
| P17 (old) | confusion-pairs tip_id filled (28 entries) |
| P18 | jac-teori.js related_card_id — 0 null remaining |
| P19 | danger-pairs traps + explanation ruby done |
| H1–H11 | Housekeeping, wg12 track fix, quiz track field, ct01/ct02 syntax fix |
