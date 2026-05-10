# SSW Konstruksi — DQ Progress Tracker
**Branch:** content-dq
**Last updated:** 2026-05-10 (cp06 EXP-STUB done)
**Handoff ref:** `DATA_QUALITY_HANDOFF_v12.md`

---

## HOW TO USE
Agent: cek file ini dulu. Ambil item **pertama yang masih `[ ]`**. Kerjakan. Centang `[x]`. Update "Last updated". Commit push. Selesai untuk sesi ini — atau lanjut ke item berikutnya kalau konteks masih cukup.

---

## TASK KEY
- **EXP-STUB** = ganti placeholder "Lihat modul JAC..." dengan penjelasan Indonesian nyata (min 30 char)
- **STRUCT** = structural fix — tidak butuh Japanese knowledge
- **MIGRATE** = schema migration: rename fields + split opts → opts + opts_id

---

## BATCH 1 — CSV exp stubs (P15)
*(~40 items di 8 file — ganti placeholder "Lihat modul JAC" dengan exp nyata)*
*(Perlu konteks soal — lihat `q` + `opts` + `ans` per item untuk tulis exp yang benar)*

- [x] `src/data/sets/csv/cp01.js` — EXP-STUB (3 stubs)
- [x] `src/data/sets/csv/cp02.js` — EXP-STUB (6 stubs)
- [x] `src/data/sets/csv/cp03.js` — EXP-STUB (6 stubs)
- [x] `src/data/sets/csv/cp04.js` — EXP-STUB (8 stubs)
- [x] `src/data/sets/csv/cp05.js` — EXP-STUB (6 stubs)
- [x] `src/data/sets/csv/cp06.js` — EXP-STUB (6 stubs)
- [ ] `src/data/sets/csv/ct03.js` — EXP-STUB (3 stubs)
- [ ] `src/data/sets/csv/ct06.js` — EXP-STUB (2 stubs)

---

## BATCH 2 — JAC Lifeline: null related_card_id (P18-LL)
*(1 entry — STRUCT: cukup isi ID kartu yang tepat)*

- [ ] `src/data/sets/jac/jac-lifeline.js` — STRUCT: fill 1 null `related_card_id` (st1_q13, 感電 → kartu #81)

---

## BATCH 3 — JAC Schema Migration (P16)
*(95 qs — rename + restructure fields ke unified question schema)*
*(Urutan: teori dulu, lalu lifeline)*

- [ ] `src/data/sets/jac/jac-teori.js` — MIGRATE (65 qs)
- [ ] `src/data/sets/jac/jac-lifeline.js` — MIGRATE (30 qs)

---

## RULES PER TASK TYPE

### EXP-STUB
- Cari semua `exp` yang mengandung teks "Lihat modul JAC", "lihat modul", atau yang < 30 char
- Ganti dengan penjelasan Indonesian yang nyata, min 30 char
- Gunakan konteks `q` + `opts` + `ans` dari soal yang sama
- Pertahankan tone: singkat, faktual, fokus kenapa jawaban benar vs distraktor
- Contoh target length: 50–150 char

### STRUCT (fill null related_card_id)
- Temukan kartu yang sesuai di `src/data/cards/`
- Gunakan `id` numerik dari card, bukan string
- "Kartu #N" di `explanation` field = petunjuk langsung ke card id N

### MIGRATE (P16 schema)
Old schema → New (unified question) schema:

| Old field | New field | Catatan |
|---|---|---|
| `jp` | `q` | tambah ruby 《》 jika ada kanji belum dianotasi |
| `id_text` | `hint` | rename saja |
| `options[i]` → split | `opts[i]` = JP part; `opts_id[i]` = ID part | pisah per item |
| `answer` | `ans` | rename saja |
| `explanation` | `exp` | rename saja |
| `hiragana` | — | hapus field ini |
| `hasPhoto` | tetap | jangan ubah |
| `photoDesc` | tetap | jangan ubah |
| `related_card_id` | tetap | jangan ubah |
| `track` | tetap | jangan ubah |
| `id`, `set`, `setLabel`, `topic` | tetap | jangan ubah |

**opts split rule:**
```js
// Old: options item dengan format "JP（よみ）(ID text)"
'安全確認（あんぜんかくにん）(Konfirmasi keselamatan)'
// New:
opts:    ['安全確認《あんぜんかくにん》']
opts_id: ['Konfirmasi keselamatan']

// Old: katakana/romaji dengan ID text
'チームワーク (Kerja tim / Teamwork)'
// New:
opts:    ['チームワーク']
opts_id: ['Kerja tim / Teamwork']
```

**VERIFY sebelum commit:**
- Zero `hiragana` field tersisa
- Zero `options` field tersisa (semua sudah jadi `opts` + `opts_id`)
- Semua `opts[i]` berisi JP string (dengan ruby jika ada kanji)
- Semua `opts_id[i]` berisi Indonesian string
- Length `opts` === length `opts_id` per soal

---

## SELESAI (sesi sebelumnya)

### Batch lama (PROGRESS.md sebelumnya)
- ✅ BATCH 1–2: CSV + Wayground FIX + ANNOTATE opts (P11-FIX-A/B, P11-C, P12-FIX)
- ✅ BATCH 3: Quiz sets RUBY+HINT+ID (P13 — 6 files)
- ✅ BATCH 4: Cards FURI alignment (P7 — 22 files)
- ✅ BATCH 5: jac-teori null IDs (P18), confusion-pairs tip_id (P17), danger-pairs audit (P19)

### Dari handoff v12 (done sebelum content-dq)
- ✅ P8: confusion-pairs termA/B ruby
- ✅ P9: danger-pairs term ruby
- ✅ P10: angka-kunci soal ruby
- ✅ P14: wayground exp stubs — 0 remaining (verified 2026-05-10)
