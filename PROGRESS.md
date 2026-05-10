# SSW Konstruksi — DQ Progress Tracker
**Branch:** content-dq
**Last updated:** 2026-05-10 (cards/common FURI done)

---

## HOW TO USE
Agent: cek file ini dulu. Ambil item **pertama yang masih `[ ]`**. Kerjakan. Centang `[x]`. Update "Last updated". Commit push. Selesai untuk sesi ini — atau lanjut ke item berikutnya kalau konteks masih cukup.

---

## TASK KEY
- **FIX** = hapus double ruby + revert wrong ruby ke （）
- **ANNOTATE** = tambah 《》 ruby ke bare kanji
- **RUBY+HINT+ID** = tambah ruby ke q+opts, tambah hint (Indonesian), tambah id (1-indexed)
- **FURI** = align separator di `furi` field supaya cocok dengan `jp`
- **STRUCT** = structural fix (tambah field, tidak butuh Japanese knowledge)

---

## BATCH 1 — CSV Corruption Fix + Opts Annotation
*(12 files — prioritas tertinggi, ada corruption dari sesi Haiku)*

- [x] `src/data/sets/csv/cp01.js` — FIX + ANNOTATE opts
- [x] `src/data/sets/csv/cp02.js` — FIX + ANNOTATE opts
- [x] `src/data/sets/csv/cp03.js` — FIX + ANNOTATE opts
- [x] `src/data/sets/csv/cp04.js` — FIX + ANNOTATE opts
- [x] `src/data/sets/csv/cp05.js` — FIX + ANNOTATE opts
- [x] `src/data/sets/csv/cp06.js` — FIX + ANNOTATE opts
- [x] `src/data/sets/csv/ct01.js` — FIX + ANNOTATE opts
- [x] `src/data/sets/csv/ct02.js` — FIX + ANNOTATE opts
- [x] `src/data/sets/csv/ct03.js` — FIX + ANNOTATE opts
- [x] `src/data/sets/csv/ct04.js` — FIX + ANNOTATE opts
- [x] `src/data/sets/csv/ct05.js` — FIX + ANNOTATE opts
- [x] `src/data/sets/csv/ct06.js` — FIX + ANNOTATE opts

## BATCH 2 — Wayground Double Ruby Fix
*(26 files — fix double ruby saja, tidak perlu annotate baru)*

- [x] `src/data/sets/wayground/wt1.js` — FIX
- [x] `src/data/sets/wayground/wt2.js` — FIX
- [x] `src/data/sets/wayground/wt3.js` — FIX
- [x] `src/data/sets/wayground/wt4.js` — FIX
- [x] `src/data/sets/wayground/wt5.js` — FIX
- [x] `src/data/sets/wayground/wt6.js` — FIX
- [x] `src/data/sets/wayground/wt7.js` — FIX
- [x] `src/data/sets/wayground/wt8.js` — FIX
- [x] `src/data/sets/wayground/wt9.js` — FIX
- [x] `src/data/sets/wayground/wt10.js` — FIX
- [x] `src/data/sets/wayground/wg1.js` — FIX
- [x] `src/data/sets/wayground/wg2.js` — FIX
- [x] `src/data/sets/wayground/wg3.js` — FIX
- [x] `src/data/sets/wayground/wg4.js` — FIX
- [x] `src/data/sets/wayground/wg5.js` — FIX
- [x] `src/data/sets/wayground/wg6.js` — FIX
- [x] `src/data/sets/wayground/wg7.js` — FIX
- [x] `src/data/sets/wayground/wg8.js` — FIX
- [x] `src/data/sets/wayground/wg9.js` — FIX
- [x] `src/data/sets/wayground/wg11.js` — FIX
- [x] `src/data/sets/wayground/wg12.js` — FIX
- [x] `src/data/sets/wayground/wp1.js` — FIX
- [x] `src/data/sets/wayground/wp2.js` — FIX
- [x] `src/data/sets/wayground/wp3.js` — FIX
- [x] `src/data/sets/wayground/wp4.js` — FIX
- [x] `src/data/sets/wayground/wp5.js` — FIX

## BATCH 3 — Quiz Sets Full Annotation
*(6 files — ruby + hint + id, semua dari nol)*

- [x] `src/data/sets/quiz/doboku-01.js` — RUBY+HINT+ID
- [x] `src/data/sets/quiz/doboku-02.js` — RUBY+HINT+ID
- [x] `src/data/sets/quiz/doboku-03.js` — RUBY+HINT+ID
- [x] `src/data/sets/quiz/kenchiku-01.js` — RUBY+HINT+ID
- [x] `src/data/sets/quiz/kenchiku-02.js` — RUBY+HINT+ID
- [x] `src/data/sets/quiz/kenchiku-03.js` — RUBY+HINT+ID

## BATCH 4 — Cards Furi Alignment
*(22 files — align furi separators saja, tidak annotate ruby baru)*

- [x] `src/data/cards/common/ch1.js` — FURI
- [x] `src/data/cards/common/ch2.js` — FURI
- [x] `src/data/cards/common/ch3.js` — FURI
- [x] `src/data/cards/common/ch4.js` — FURI
- [x] `src/data/cards/common/ch5.js` — FURI
- [x] `src/data/cards/common/ch6.js` — FURI
- [x] `src/data/cards/common/ch7.js` — FURI
- [x] `src/data/cards/common/gakka.js` — FURI
- [x] `src/data/cards/common/vocab-jac.js` — FURI
- [x] `src/data/cards/common/vocab-lifeline.js` — FURI
- [x] `src/data/cards/common/vocab-misc.js` — FURI
- [x] `src/data/cards/common/vocab-supplementary.js` — FURI
- [ ] `src/data/cards/lifeline/ch2.js` — FURI
- [ ] `src/data/cards/lifeline/ch3.js` — FURI
- [ ] `src/data/cards/lifeline/ch4.js` — FURI
- [ ] `src/data/cards/lifeline/ch5.js` — FURI
- [ ] `src/data/cards/lifeline/ch6.js` — FURI
- [ ] `src/data/cards/lifeline/gakka.js` — FURI
- [ ] `src/data/cards/lifeline/vocab-jac.js` — FURI
- [ ] `src/data/cards/lifeline/vocab-lifeline.js` — FURI
- [ ] `src/data/cards/lifeline/vocab-misc.js` — FURI
- [ ] `src/data/cards/lifeline/vocab-supplementary.js` — FURI

## BATCH 5 — Structural & Small Tasks
*(agent tasks, tidak butuh Japanese knowledge)*

- [ ] `src/data/sets/jac/jac-teori.js` — STRUCT: fill 21 null `related_card_id`
- [ ] `src/data/confusion-pairs.js` — STRUCT: tambah `tip_id: null` ke 28 entries
- [ ] `src/data/danger-pairs.js` — STRUCT: audit + fix ruby di `traps[]` dan `explanation`

---

## RULES PER TASK TYPE

### FIX (csv + wayground)
1. Hapus double ruby: `漢字《よみ》《よみ》` → `漢字《よみ》`
2. Revert wrong ruby: `《non-kana》` → `（non-kana）` — hanya jika isi 《》 tidak mengandung hiragana/katakana
3. Script HARUS idempotent — strip dulu sebelum apply

### ANNOTATE opts (csv only)
- Setiap item di `opts: [...]` yang mengandung kanji → tambah `《よみ》`
- Format: full compound per segment, BUKAN suffix only
- Contoh: `'配管の継手'` → `'配管《はいかん》の継手《つぎて》'`
- Maru `（）` yang isinya non-kana → JANGAN diubah

### RUBY+HINT+ID (quiz sets)
- `q`: annotate semua kanji compound
- `opts`: annotate semua kanji compound
- `hint`: tambah field baru — Indonesian paraphrase singkat dari `q` (1 kalimat)
- `id`: tambah field baru — integer 1-indexed per set

### FURI (cards)
- Cek setiap card: apakah `jp` punya separator (`vs`, `・`, `：`, `/`) tapi `furi` tidak
- Kalau iya, tambah separator yang sama di posisi yang tepat di `furi`
- Contoh: `jp: '加湿器 vs 除湿器'`, `furi: 'かしつきじょしつき'` → `furi: 'かしつき vs じょしつき'`
- Jangan ubah `furi` yang sudah benar

### VERIFY sebelum commit
- Zero double ruby `》《` tersisa
- Zero kanji non-kana di dalam `《》`
- Zero bare kanji di field yang dikerjakan (untuk ANNOTATE task)
