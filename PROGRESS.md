# SSW Konstruksi — DQ Progress Tracker
**Branch:** content-dq
**Last updated:** 2026-05-12 (session 15: ADM6 — commit hash sync, categories.js Sipil/Bangunan→Doboku/Kenchiku comments)
**Handoff ref:** `DATA_QUALITY_HANDOFF_v16.md`

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

## BATCH G — Opsi A: Type-based filtering (session 11)

### G1 — App logic: switch source-based → type-based filtering ✅
Files: `src/hooks/useTrackedCards.js`, `src/components/FilterPopup.jsx`, `src/modes/FocusMode.jsx`
- [x] `useTrackedCards.js`: `VOCAB_SOURCES.includes(c.source)` → `c.type === 'vocab'`, remove VOCAB_SOURCES import, update JSDoc
- [x] `FilterPopup.jsx`: `isVocab = VOCAB_SOURCES.includes(c.source)` → `isVocab = c.type === 'vocab'`, remove VOCAB_SOURCES import
- [x] `FocusMode.jsx`: `!VOCAB_SOURCES.includes(c.source)` → `c.type !== 'vocab'`, remove VOCAB_SOURCES import
- [x] Verify: 0 VOCAB_SOURCES references remaining in 3 files ✅
- [x] Impact: 428 vocab-type cards sekarang terdeteksi benar; 6 hukum cards tidak lagi salah terdeteksi

### G2 — Source fix: 2 hukum cards (PDF audit) ✅
Files: `src/data/cards/common/vocab-supplementary.js`, `src/data/source/cards-common.js`, `src/data/cards.js`
- [x] Audit 6 hukum cards vs 11 JAC PDFs (7 textbook + 4 soal ujian)
- [x] id:1184 発注者 — NOT FOUND di semua 11 PDF → `vocab-teori` → `vocab-supplementary` (external/no source)
- [x] id:1233 在留カード — single-match di tt_sample only → `vocab-teori` → `jac-gakka1` ✅
- [x] id:1167 許可, 1168 請負契約, 1169 元請け, 1237 更新 — multi-match (2–3 PDFs each) → `vocab-teori` RETAINED (cross-chapter confirmed)
- [x] vocab-teori count: 20 → 18 (4 hukum + 14 vocab remaining, all cross-chapter)
- [x] Updated in 3 files: split, source, exported ✅

---

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

## BATCH W — Wayground taxonomy restructure (session 12)

### W1 — Wayground set rename + folder restructure ✅
Files: `src/data/sets/wayground/**`
- [x] Create folder structure: teori/, vocab/, lifeline/praktik/, lifeline/vocab/
- [x] wt01–wt10: teori drills (common, shared) → `teori/`
- [x] wtv01: common vocab → `vocab/`
- [x] wgl01–wgl05: lifeline praktik quizizz (ex wg1–wg5) → `lifeline/praktik/`
- [x] wgl06–wgl10: lifeline praktik original (ex wp1–wp5) → `lifeline/praktik/`
- [x] wglv01–wglv05: lifeline vocab (ex wg6–wg9,wg11) → `lifeline/vocab/`
- [x] All set-level `id:` fields and `export const` names updated
- [x] Comment headers updated to new IDs
- [x] Zero old flat files remaining in wayground root
- [x] No app-code references to old IDs found (monolithic wayground-sets.js = legacy, untouched)
- **Future slots:** wtv02–wtv10, wglv06–wglv10, wgl11+ reserved for expansion
- **Doboku future:** `doboku/praktik/wgd01–...`, `doboku/vocab/wgdv01–...`
- **Kenchiku future:** `kenchiku/praktik/wgk01–...`, `kenchiku/vocab/wgkv01–...`
- **Storage note:** Set ID rename = breaking change. Migration version TBD — reconcile with main STORAGE_VERSION (currently 4 per CHANGELOG v4.22.0; next = 5).

---

## BATCH ADM — Administrative hygiene (sessions 13–14)

### ADM1 — Sync admin docs post-sessions-11-12 ✅
Files: `SESSION_PROMPT.md`, `DATA_QUALITY_HANDOFF_v16.md`, `README-CONTENT-DQ.md`, `_MAP.md`
- [x] SESSION_PROMPT.md: last commit `a8f6e82` → `ea6127d`; TASK SESI INI rewritten (G1+G2+W1 done, P21/PDF viewer blocked)
- [x] DATA_QUALITY_HANDOFF_v16.md: header (session 12, ea6127d); source counts (vocab-teori 20→18, vocab-supp 271→272, jac-gakka1 5→6); §13A Opsi A DONE; CODEBASE STATE wayground row updated; RINGKASAN SESSION 12 added; storage version clarified
- [x] README-CONTENT-DQ.md: `v12` → `v16` (×2); not-present note corrected (3 G1 files present)
- [x] _MAP.md: Storage Schema v3→v4; `_v:3`→`_v:4` in 3 schema docs; metrics table v3→v4

### ADM2 — Deep hygiene pass (session 13) ✅
Files: `DATA_QUALITY_HANDOFF_v16.md`, `PROGRESS.md`
- [x] §0B: wayground prefix taxonomy updated (old wg/wp retired, full post-W1 canonical set)
- [x] §1C: furi alignment marked DONE (P7 complete)
- [x] Part 3: set list replaced with post-W1 canonical IDs (wt/wtv/wgl/wglv); wg/wp old IDs removed
- [x] §3A storage version note: fixed (5→6 → 4→5, reconcile at merge)
- [x] Part 4: all tasks marked DONE (P11-FIX-A/B, P11-C, P15 complete)
- [x] Part 5: schema gaps table replaced with completed status; AI-generated caveat added
- [x] Part 6: jac-teori.js related_card_id updated (21 null → 0; P18 done)
- [x] Part 7: tip_id marked DONE (P17 complete)
- [x] Part 8: traps/explanation ruby marked DONE (P19 complete)
- [x] Part 12A: legacy label counts updated to post-G2 actuals (vocab-supplementary 271→272, vocab-teori 20→18)
- [x] AGENT RULES: wg6/wg11 old IDs → wglv01–wglv05
- [x] MASTER EXECUTION ORDER: P12-FIX and P14 path refs updated (flat → **)
- [x] §13C (duplicate of §12C) removed
- [x] Session 10 historical summary compressed (22 lines → 4 lines)
- [x] PROGRESS.md: BATCH W and BATCH ADM reordered (W=session 12 before ADM=session 13); W1 storage version note fixed (5→6 → 4→5)

### ADM3 — _MAP.md + README-CONTENT-DQ.md hygiene (session 13) ✅
Files: `_MAP.md`, `README-CONTENT-DQ.md`
- [x] §0B: ct/cp prefix location corrected (csv-sets.js → sets/csv/*.js); doboku-/kenchiku- → sets/quiz/*.js
- [x] §0E: text3l crossed out (retired by F3)
- [x] Part 7+8: missing closing `|` on table rows fixed
- [x] AGENT RULES: dangling `(v8: v5)` reference to deleted table removed
- [x] PART 12 FUTURE DEVELOPMENT NOTES renumbered → PART 14 (14A, 14B) — no longer conflicts with Part 12
- [x] README-CONTENT-DQ.md: last commit updated

### ADM4 — Hygiene pass 4, no-assume audit (session 13) ✅
Files: `DATA_QUALITY_HANDOFF_v16.md`, `PROGRESS.md`, `SESSION_PROMPT.md`
- [x] HANDOFF header: last commit `c1e1a53` → `efc8f02`
- [x] PROGRESS.md: F2 stale pre-G2 counts annotated (271→272, 20→18); TEMUAN SESSION 10 snapshot pointer added
- [x] PROGRESS.md: double `---` at end of BATCH C removed; double blank lines removed
- [x] SESSION_PROMPT.md: last commit `ea6127d` → `efc8f02`

### ADM5 — Session 14 deep hygiene: commit hash, terminology, session log ✅
Files: `DATA_QUALITY_HANDOFF_v16.md`, `SESSION_PROMPT.md`, `_MAP.md`, `PROGRESS.md`
- [x] HANDOFF header + RINGKASAN SESSION 12: last commit `efc8f02` → `8da61d7` (ADM4)
- [x] HANDOFF §12B: `SIPIL_SETS and BANGUNAN_SETS` → `DOBOKU_SETS and KENCHIKU_SETS` (post-P20)
- [x] HANDOFF Updated field: session 13 → session 14
- [x] SESSION_PROMPT: last commit `efc8f02` → `8da61d7`; STATE updated to per session 14
- [x] _MAP.md line 73: `sipil + bangunan` → `doboku + kenchiku` in QUIZ_SETS description
- [x] _MAP.md line 190: `SIPIL_SETS + BANGUNAN_SETS` → `DOBOKU_SETS + KENCHIKU_SETS` (post-P20)
- [x] _MAP.md session log: ADM3, ADM4, ADM5 entries added (were missing)
- [x] PROGRESS.md: ADM3, ADM4 entries added retroactively; ADM5 this entry; batch header updated

---

### ADM6 — Session 15 deep hygiene: commit hash sync, categories.js comment fix ✅
Files: `DATA_QUALITY_HANDOFF_v16.md`, `SESSION_PROMPT.md`, `_MAP.md`, `PROGRESS.md`, `src/data/categories.js`
- [x] HANDOFF header: last commit `8da61d7` → `9ed5e7e` (ADM5); Updated: session 14 → session 15; ADM6 description
- [x] HANDOFF RINGKASAN SESSION 12: last commit `8da61d7 (DOCS: ADM4)` → `9ed5e7e (DOCS: ADM5)`
- [x] SESSION_PROMPT: last commit `8da61d7` → `9ed5e7e`; STATE per session 14 → per session 15; ADM1–ADM5 → ADM1–ADM6
- [x] _MAP.md: ADM5 session log entry hash `→8da61d7` → `→9ed5e7e`; ADM6 session log entry added
- [x] PROGRESS.md: Last updated → session 15 ADM6; ADM6 entry added
- [x] `src/data/categories.js`: comments `// Sipil` → `// Doboku`, `// Bangunan` → `// Kenchiku` (missed by P20)

## SELESAI (semua sesi sebelumnya)
- ✅ G1: App logic switch source→type-based (useTrackedCards, FilterPopup, FocusMode) — 655 vocab + 96 hukum now correctly filtered
- ✅ G2: Source fix — id:1184 vocab-teori→vocab-supplementary, id:1233 vocab-teori→jac-gakka1 (PDF audit confirmed)
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

---

## BATCH F — Source field cleanup (session 10)

### F1 — Relabel text3l → jac-ch3 (25 cards)
Files: `src/data/cards/lifeline/ch5.js` (1), `src/data/cards/lifeline/ch6.js` (10), `src/data/cards/common/vocab-supplementary.js` (7+), `src/data/source/cards-lifeline.js`, `src/data/source/cards-common.js`, `src/data/cards.js`
- [x] `text3l` adalah konten dari text3.pdf (JAC ch3). 9 cards confirmed match di text3.pdf.
- [x] 16 "external" text3l cards = synthesized terms dari ch3, tidak verbatim → tetap jac-ch3
- [x] Replaced semua `source: "text3l"` → `source: "jac-ch3"` di 6 file
- [x] Verify: 0 text3l remaining, jac-ch3 total = 131 (ch3.js) + 25 = 156 ✅

### F2 — Single-match source trace relabel (120 cards)
- [x] Trace 693 legacy cards against 7 cleaned PDFs (space-stripped, furigana-stripped)
- [x] Result: 129 single_match | 183 multi_match | 369 external | 12 too_short
- [x] Exclude 9 text3l cards already fixed in F1
- [x] Relabel 120 remaining single-match → confirmed jac-chN
  - jac-ch2: +24 | jac-ch3: +27 | jac-ch4: +10 | jac-ch5: +17 | jac-ch6: +29 | jac-ch7: +13
- [x] Applied to 7 split files + cards-common.js + cards-lifeline.js + cards.js
- [x] Verify: 0 errors, 120/120 changed

jac-chN totals post-F1+F2:
  jac-ch1:28 | jac-ch2:99 | jac-ch3:183 | jac-ch4:150 | jac-ch5:217 | jac-ch6:134 | jac-ch7:48

Remaining legacy labels (548 cards, pre-G2 counts):
  vocab-supplementary(271→272 post-G2) vocab-lifeline(113) vocab-jac(49) vocab-general(44) vocab-exam(38) vocab-teori(20→18 post-G2) vocab-core(13)
  Multi-match decision: RESOLVED — 183 multi-match cards retained with legacy labels (DIPERTAHANKAN)

### F3 — categories.js cleanup: hapus text3l (defunct)
- [x] Hapus `text3l` dari SOURCE_META (sudah jadi jac-ch3 via F1)
- [x] Hapus `text3l` dari SOURCE_GROUPS['Sumber Tambahan']
- [x] Hapus `text3l` dari SOURCE_ACCENT
- [x] Verify: 0 text3l refs tersisa di categories.js

---

## TEMUAN SESSION 10 — untuk agent berikutnya

### ⚠️ DOBOKU & KENCHIKU — CONFIRMED AI-GENERATED
`jac-doboku.js` dan `jac-kenchiku.js` = empty stubs. TIDAK ADA PDF JAC untuk track ini.
2 set seed doboku & kenchiku (SIPIL_SETS dan BANGUNAN_SETS di quiz-sets.js) = murni
buatan Claude Opus, TIDAK mengacu dari PDF JAC manapun.
Status P21 (populate jac-doboku + jac-kenchiku) = BLOCKED sampai owner upload PDF resmi.

### SOURCE LABELS — KEPUTUSAN FINAL (tidak disederhanakan)
Labels legacy (vocab-lifeline, vocab-jac, vocab-exam, vocab-teori, vocab-core,
vocab-supplementary, vocab-general) DIPERTAHANKAN karena:
1. Semantiknya meaningful di UI (ditampilkan via SOURCE_META ke user)
2. Multi-match cards tidak bisa di-pin ke satu chapter (muncul di banyak PDF)
3. External cards (vocab-supplementary 270, vocab-general 32) memang dari luar 11 PDF JAC

Trace audit selesai (11 PDF = 7 textbook + 4 soal ujian JAC lifeline):
- F1+F2 fixed 145 cards: text3l→jac-ch3 (25) + single-match→jac-chN (120)
- 548 remaining legacy = correct as-is, tidak perlu diubah
- Counts di atas (vocab-supplementary 270, vocab-general 32) = pre-G2 session 10 snapshot
- Post-G2 actuals: vocab-supplementary 272, vocab-teori 18 (lihat RINGKASAN SESSION 12 di handoff)

### FITUR BARU — PDF VIEWER MODE (belum dikerjakan)
Owner request: mode baru di app untuk baca PDF textbook JAC resmi.
Spec awal:
- Option C: fetch langsung dari URL resmi JAC (butuh internet — OK)
- 7 PDF: text1l, text2, text3, text4, text5l, text6l, text7l
- Nanti tambah versi Indonesia (7 PDF lagi = 14 total)
- Implementasi: agent di branch terpisah atau lanjut di content-dq
- Owner perlu supply URL resmi JAC sebelum implementasi bisa mulai
⚠️ BLOCKED: butuh URL PDF resmi JAC dari owner
