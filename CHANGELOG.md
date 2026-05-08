## [4.19.1] - 2026-05-09

### chore: C1 closure + hygiene pass (Agent Sonnet 4.6)

**C1 text4 audit — content complete:**
- Scanned text4.pdf (JAC Ch.4 — construction site greetings, layout terms, earthwork, foundation, concrete, building structure, electrical, lifeline, 5S, ほうれんそう)
- Result: 100% of Ch.4 terminology pre-exists in card DB — no new cards needed
- C1 fully closed: text3l +18 (v4.16.0) + pass2 +15 (v4.17.0) + text4 audit (0 new)

**categories.js fix (SumberMode coverage gap):**
- Moved supplementary SOURCE_META entries (`text3l`, `vocab-supplementary`, `vocab-general`) from mutation-style to inline in main object
- Added "Sumber Tambahan" group to SOURCE_GROUPS → SumberMode now shows all 3 supplementary sources (text3l: 25 cards, vocab-supplementary: 271 cards, vocab-general: 44 cards)
- Added SOURCE_ACCENT entries for `text3l`, `vocab-supplementary`, `vocab-general`

**Docs:**
- `BLUEPRINT-CURRENT.md` — status updated: NO OPEN ITEMS
- `_MAP.md` — log entry added
- `docs/archive/ARCHIVE-INDEX.md` — stale text4l reference removed

---

## [4.19.0] - 2026-05-08

### refactor: full data layer restructure — track fields + JAC split + quiz-sets merge (Agent Sonnet 4.6)

**Structure overhaul** — semua data file kini punya `track` field; JAC split by type; wayground+csv merged.

**JAC Official split:**
- `jac-teori.js` — 学科 tt1+tt2, 65qs, `track:'common'` (sama untuk semua 3 track)
- `jac-lifeline.js` — 実技 st1+st2 Lifeline, 30qs, `track:'lifeline'`
- `jac-doboku.js` / `jac-kenchiku.js` — empty stubs, siap diisi dari PDF
- `jac-official.js` → backward-compat shim (`[...JAC_TEORI, ...JAC_LIFELINE, ...]`)

**Question sets merged:**
- `quiz-sets.js` — single source of truth = WAYGROUND_SETS + CSV_SETS
- `getQuizSetsForTrack(track)` helper function
- wayground wt1–wt10 → `track:'common'`; wg*/wp* → `track:'lifeline'`
- CSV sets → `track:'lifeline'`

**Study aids — track field added:**
- `danger-pairs.js` — common: 12 pairs, lifeline: 8 pairs (per-pair track field)
- `angka-kunci.js` — common: 22 entries, lifeline: 7 entries (per-entry track field)

**Components updated — filter by current track:**
- WaygroundMode: imports QUIZ_SETS, filters `track === 'common' || track === currentTrack`
- VocabMode: wg* sets filtered by track
- DangerMode: PAIRS = DANGER_PAIRS filtered by track
- AngkaMode: ANGKA = ANGKA_KUNCI filtered by track

**index.js barrel** — exports JAC_TEORI, JAC_LIFELINE, JAC_DOBOKU, JAC_KENCHIKU, QUIZ_SETS, getQuizSetsForTrack

- 387/387 tests pass

---

## [4.18.0] - 2026-05-08

### refactor: migrate doboku + kenchiku cards to common (Agent Sonnet 4.6)

**Structure correction** — Ch.1–4 content belongs in common (shared by all tracks).

- `cards-doboku.js` (58 kartu) → `cards-common.js` — category remapped: doboku_doko/hoso/haisui → sekou
- `cards-kenchiku.js` (77 kartu) → `cards-common.js` — category remapped: kenchiku_kutai/shiage → sekou
- `cards-doboku-vocab.js` (9 kartu) → `cards-common-vocab.js`
- `cards-kenchiku-vocab.js` (13 kartu) → `cards-common-vocab.js`
- Source files doboku/kenchiku now empty `[]` (preserved for future Ch.5+ track-specific content)
- IDs reassigned 1472–1628; _origIndex 1443–1599
- Total cards unchanged: 1443 | common: 496→646, common-vocab: 211→233
- 387/387 tests pass

---

## [4.17.0] - 2026-05-08

### feat(C1-pass2): text1l + text2 + text3 — 15 new cards pass 2 (Agent Sonnet 4.6)

Extraction pass on all 3 PDFs; new cards added to `cards-common.js` (IDs 1457–1471):

**text1l (jac-ch1):**
- 1457 CCUSの4レベルと条件 (白/青/銀/金; Lv.2=645日/3年)

**text2 (jac-ch2):**
- 1458 ドローンの飛行禁止5ルール (飲酒/夜間/目視外/距離/危険物)
- 1459 建設業法の許可業種（設備関係6種 — 熱絶縁工事業を強調）
- 1460 建設労働者雇用改善法の重点施策 (2024年残業上限/CCUS/フルハーネス/外国人)
- 1461 特定技能外国人・失業時の在留ルール (3ヶ月ルール/基本手当45〜80%)
- 1469 産業廃棄物の保管とマニフェスト義務 (元請け/下請けの責任分担)
- 1470 熱中症予防の3対策 (日陰/水塩飴/救急)
- 1471 航空障害灯とドローン規制の数値 (60m/100g/150m禁止区域)

**text3 (jac-ch3 / text3l):**
- 1462 足場の組立て等作業主任者・作業者 (5m以上→技能講習; 全員→特別教育)
- 1463 地山の掘削及び土止め支保工作業主任者 (2m以上→技能講習)
- 1464 ロープ高所作業（特別教育） (2m以上作業床困難)
- 1465 型わく支保工・ずい道等掘削作業主任者 (技能講習/特別教育)
- 1466 とび職の6種類 (足場/鉄骨/橋梁/重量/送電/町場)
- 1467 鉄骨構造の3種類と2工法 (ブレース/ラーメン/トラス; 建て逃げ/水平積上げ)
- 1468 車両系建設機械と3t境界 (3t以上→技能講習; 未満→特別教育)
- Total: 1428 → **1443** cards | 387/387 tests pass

---

## [4.16.0] - 2026-05-08

### feat(C1): text3.pdf — 18 new cards ライフライン track (Agent Sonnet 4.6)

**C1 phase complete** — Chapter 3 (建設工事の種類と業務) extracted from text3.pdf.

New cards 1439–1456 (`source: text3l`) in `cards-lifeline.js`:
- 1439 建設工事の3区分 | 1440 吹付けウレタン断熱工事 | 1441 ウレタン断熱QC
- 1442 防露工事 | 1443 保温保冷安全機能 | 1444 推進トンネル工事
- 1445 推進管の種類 | 1446 配管工事の基本技能 | 1447 受水槽
- 1448 通気設備 | 1449 ウレタン防水 | 1450 FRP防水 | 1451 シーリング防水
- 1452 さく井工事4種 | 1453 通信土木 | 1454 上水道の流れ
- 1455 下水道の流れ | 1456 消防法による設置義務
- `text3l` added to `SOURCE_META` in `categories.js`
- Total: 1410 → 1428 cards | Lifeline: 426 → 444
- Admin catch-up: v4.15.0+4.15.1 admin docs not previously updated
- 387/387 tests pass

---

## [4.15.1] - 2026-05-08

### fix(jac-ch1): furi audit — 6 fixes (Agent Sonnet 4.6)

- **id:584** furi: `CCUSひょうかのさんきじゅん` → `ひょうかのさんきじゅん` (drop Latin acronym from furi)
- **id:586** furi: `あんぜんしょうわ` → `あんぜんしょうわ・たっちあんどこーる` (incomplete)
- **id:588** furi: `けいわいかつどう` → `きけんよちかつどうのよんすてっぷ` (KY≠けいわい; missing の4ステップ)
- **id:589** furi: `けいわいぼーど` → `きけんよちぼーど` (KY≠けいわい)
- **id:590** furi: `ぜんたいちょうれい` → `ぜんたいちょうれいのろっこうもく` (incomplete)
- **id:591** furi: `あんぜんかくにん` → `あんぜんかくにんのはちこうもく` (incomplete)
- 387/387 tests pass

---

## [4.15.0] - 2026-05-08

### Content Audit — jac-ch1 fix + jac-ch2 text2.pdf audit (Agent Sonnet 4.6)

**fix(jac-ch1)** *(undocumented from previous session — commit 5c2ea70)*
- Corrected furi errors: ID 1 (ちょれい→ちょうれい), ID 2 (duplicate かつどう), ID 130, ID 576, ID 586, ID 588–592
- Stripped hiragana readings from jp field (IDs 572–592): readings belong in furi only
- Fixed truncated id_text: IDs 578, 580

**fix(jac-ch2)** — text2.pdf audit: 17 fixes across 14 cards
- **id:151** desc restored: lembur rates (+25%/+35%/+25%) + cap 45 jam/bulan, 360 jam/tahun (April 2024)
- **id:153** desc restored: 32 jenis sertifikasi konstruksi; level 特級・1〜3級・基礎級 added
- **id:154** desc restored: visa 在留資格 context added
- **id:155** desc restored: 基本手当 45〜80% upah harian, 90〜360 hari
- **id:156** furi fixed: すとれすへっく → すとれすちぇっく (ストレスチェック)
- **id:160** desc restored: "Kerja >8 jam → 1 jam" (was truncated at "1")
- **id:163** furi fixed: description text removed from furi field → でんぱほう
- **id:164** desc restored: 4 tunjangan 療養・休業・遺族・介護 with full context
- **id:621** furi fixed: extra text removed → ろうどうしゃのせきむ; desc: removed erroneous furigana on "UU"
- **id:623** desc fixed: 転《ころ》び落→転落《てんらく》; full top-5 ranking added (110/31/27/25/19件)
- **id:624** desc restored: 5th purpose "perkembangan industri yang sehat" added
- **id:625** desc restored: 建ぺい率・容積率 context added
- **id:626** furi fixed: description-length string → はいきぶつしょりほう; desc restored with 元請/sub責任
- **id:627** furi fixed: description-length string → げすいどうほう; desc restored with 6 reasons + concrete neutralization note
- 387/387 tests pass

---

## [4.14.0] - 2026-05-08

### J4+J2 — JAC Topic Tags + Simulasi per Topik (Agent Sonnet 4.6)

**J4 — Topic field on all 95 JAC questions**
- `topic` field added to all 95 questions in `jac-official.js`
- 8 topics: listrik / pipa / telekomunikasi / pemadam / isolasi / keselamatan / hukum / umum

**J2 — JACMode topic filter + Simulasi per Topik**
- Topic filter chip row in JACMode picker
- "Simulasi per Topik" CTA button — runs simulation filtered to selected topic
- Set list shows filtered count per topic when filter active
- 387/387 tests, lint clean, build clean

---

## [4.13.0] - 2026-05-08

### G3 — GlossaryMode Export Mini Deck (Agent Sonnet 4.6)

**G3 — GlossaryMode select mode + Anki TSV export**
- ☑ Pilih toggle button in GlossaryMode header activates select mode
- Tap any entry to select/deselect; selected entries show checkmark overlay
- "Semua" button quick-selects all currently visible (filtered) entries
- Footer bar shows selected count + "⬇ Ekspor Anki" button
- Downloads TSV file (Anki-importable): `JP[furi]\tterjemahan + desc\ttags`
- Tags include category key and source key per card
- Works with existing category filter — export subset from any category

---

## [4.12.0] - 2026-05-08

### Open Items Batch — Q3, F2/F3, D1, G4, W5, AK2, E3, K6 (Agent Sonnet 4.6)

**Q3 — QuizMode difficulty detail text**
- Selected difficulty now shows concrete explanation inline (e.g. "Semua pilihan dari kategori sama — mendekati kesulitan ujian asli JAC")

**F2 — FocusMode auto-advance to next weakest category**
- After sprint ends, FocusMode automatically navigates to the next weakest untrained category
- If all categories trained, returns to picker

**F3 — FocusMode session progress counter**
- Progress banner: "N dari M kategori dilatih sesi ini" with next category suggestion
- ✓ badge on trained category buttons in picker

**D1 — DangerMode linguistic explanation field**
- `explanation` field added to all 20 danger pairs explaining *why* they are confused
- Displayed in accordion browse panel and after-answer card in quiz mode

**G4 — GlossaryMode non-kana nav keys**
- Kanji and romaji initials each get their own nav key instead of collapsing into `#`
- Non-kana keys sorted alphabetically and appended after hiragana/katakana

**W5 — WaygroundMode suggested next set**
- "Disarankan Berikutnya" card above set picker: untouched sets first, then lowest score
- Tappable — navigates directly to that set

**AK2 — AngkaMode sample exam question context**
- `soal` field added to all 28 angka-kunci entries (sample JAC-style question)
- Displayed in accordion browse panel below konteks label

**E3 — ExportMode incremental SRS delta backup**
- New "Ekspor Delta SRS Saja" button — exports only SRS cards + known + starred
- Smaller file size; suitable for frequent daily backups

**K6 — FlashcardMode category pill tap-to-filter**
- Tapping category badge on FlipCard front face filters deck to that category (`__cat:KEY__` token)
- FilterBar shows active category chip with "✕ Hapus filter" button instead of text input
- sessionStorage persists the cat filter across mode switches (BUG-05 pattern)

---

## [4.11.0] - 2026-05-08

### Open Items Batch — StatsMode fix, DangerMode D2/D3, AngkaMode AK1/AK3, GlossaryMode G2, FlashcardMode K5 (Agent Sonnet 4.6)

**BUG-FIX — StatsMode: Missing catList wrapper div (pre-existing from v4.9.0 ST4)**
- `<div className={S.list, ST.catList}>` wrapper accidentally removed by ST4 insertion
- Caused parse error at line 273 (`{weakest.length > 0}`) — build broken since v4.9.0
- Restored wrapper around `{catStats.map(...)}` block

**DangerMode D2 — Confusion Type Filter**
- Added `confusionType` field to all 19 danger pairs: `makna` / `kata` / `angka` / `prosedur`
- Panel now shows filter chip row (Semua / Makna Mirip / Istilah Mirip / Angka-Warna / Prosedur-Aturan)
- Drill button count reflects filtered set; filter resets expanded state
- Color-coded badges shown on each term row in accordion

**DangerMode D3 — Wrong-Tracker Write**
- Wrong answers in Drill quiz now write to shared `ssw-quiz-wrong` pool
- Key format: `danger-{term}` — compatible with StatsMode "Sering Salah" section
- DangerMode is now mode #12/23 with wrong-tracker support

**AngkaMode AK1 — Mnemonic / Memory Hook per Angka**
- Added `mnemonic` field to all 28 entries in `angka-kunci.js`
- Memory hooks explain the logic behind each number (e.g. "8 jam = 1 hari kerja; 5 hari × 8 = 40")
- Displayed in accordion detail panel under 💡 icon

**AngkaMode AK3 — Type-Answer Quiz (⌨️ Ketik)**
- New `TypeQuizView` component: user types the angka/value for each konteks prompt
- Fuzzy match: normalizes punctuation, spaces, case; partial first-number match allowed
- Shows mnemonic hint on wrong answer
- Panel header now has two buttons: 🧠 Pilihan (recognition) + ⌨️ Ketik (production)

**GlossaryMode G2 — Compact / Expanded View Toggle**
- New toggle button in header: ≡ Kompak ↔ ⊞ Lebar
- Kompak (default): click individual row to expand
- Lebar: all entries always show furigana + desc + source pill

**FlashcardMode K5 — Tambah ke SRS Manual**
- Known cards not yet in SRS queue now show "＋ Tambah ke Ulasan SRS" button
- Calls `srs.review(card.id, 1)` to enqueue with Again rating (due immediately)
- Known cards already in SRS show "✓ Sudah di SRS" indicator instead

**JACMode — Lint fix**
- `srsAdded` state prefixed `_srsAdded` (written but never read)

---

## [4.10.0] - 2026-05-08

### Open Items Batch — J1/K2/SB3/Q5 (Agent Sonnet 4.6)

**J1 — JACMode: Tambah ke SRS**
- Wrong JAC question answers now offer "🧠 Tambah ke Ulasan SRS" on ResultScreen
- Adds `related_card_id` flashcards to SRS queue via `recordReview(id, 1)` (Again = due immediately)
- Toast confirms how many cards were queued; button disabled after adding
- `onAddToSRS` prop chain: JACMode → QuizShell → ResultScreen

**K2 — FlashcardMode: Mode Hanya Baca**
- New ToolStrip button "👁 Baca / 📝 Rating" toggles read-only mode
- When active: RatingRow hidden, swipe hint hidden — browse cards without FSRS rating

**SB3 — SumberMode: Kartu / Sprint / Kuis per Sumber**
- Source detail view now shows 🃏 Kartu / ⚡ Sprint / ❓ Kuis action buttons
- Navigates to respective mode scoped to that source's card IDs
- `onNavigate` prop injected from ModeRouter; `filterIds` now passed to sprint + kuis modeProps
- SprintMode + QuizMode respect `filterIds` to scope baseCards pool

**Q5 — QuizMode: Filter per Kategori**
- Category picker added inside ⚙ Pengaturan panel
- Filters question pool to selected category; count display updates live
- Works with lemahMode (intersection of both filters)

**ResultScreen: onAddToSRS prop**
- New `onAddToSRS` prop + `srsWrongCount` prop for external SRS add CTA
- Indigo-styled button renders only when both prop and wrongCount > 0

---

## [4.9.0] - 2026-05-08

### Open Items Batch (Agent Sonnet 4.6)

**R3 — ReviewMode: Speak on Flip**
- Opsi baru di SayaTab: audio diputar saat kartu dibalik (vs saat kartu berikutnya muncul)
- Dikontrol via pref `speakOnFlip` — default off (perilaku lama tetap)

**R4 — ReviewMode: Skip Kartu**
- Tombol "Lewati" di header + shortcut keyboard `S` — lanjut ke kartu berikutnya tanpa memberikan rating SRS
- Berguna untuk kartu baru yang belum dipelajari konteksnya

**R5 — ReviewMode: Sisa Kartu**
- Header sekarang menampilkan `idx+1 / total · N lagi` — user tahu berapa kartu yang tersisa

**W1 — WaygroundMode: Deskripsi Grup**
- Setiap grup (Teori/Praktik/CSV Teori/CSV Praktik) kini memiliki deskripsi singkat di bawah nama grup

**W4 — WaygroundMode: Total Score Lintas Set**
- Card ringkasan di atas picker: total benar/salah + persentase dari semua set yang sudah dikerjakan

**Q4 — QuizMode: Persist Jumlah Soal**
- Pilihan jumlah soal (10/20/30/Semua) disimpan ke `prefs.quizQuestionCount` — persist antar-sesi

**SR4 — SearchMode: Akurasi User per Kartu**
- Badge `✓ Hafal` (hijau) dan `⚠ Nx salah` (merah) ditampilkan di setiap hasil pencarian

**ST4 — StatsMode: Minggu Ini vs Minggu Lalu**
- Grid 3 kolom: Minggu Lalu / Perubahan / Minggu Ini — perbandingan jumlah sesi belajar

---

## [4.8.2] - 2026-05-08

### SR3 + SIM5 (Agent Sonnet 4.6)

**SR3 — SearchMode: Copy to Clipboard**
- Tombol ⎘ pada setiap hasil pencarian — salin `JP (furigana) — terjemahan` ke clipboard
- Feedback visual: ikon ⎘ → ✓ selama 1.5 detik setelah berhasil disalin

**SIM5 — SimulasiMode: Pace Hint**
- `N soal/mnt` ditampilkan di bawah timer — kalkulasi live: soal tersisa ÷ menit tersisa
- Berubah warna merah saat `isUrgent` (≤60 detik)

---

## [4.8.1] - 2026-05-08

### D1-WT — DengarMode Wrong-Tracker (Agent Sonnet 4.6)

- DengarMode wrong answers now written to shared `quizWrong` pool (same key as QuizMode/JACMode/etc.)
- Enables FocusMode "terlemah" recommendations to include DengarMode mistakes
- Modes with wrong-tracker: 10 → 11/15

---

## [4.8.0] - 2026-05-08

### Phase 5.8 — UX Polish (Agent Sonnet 4.6)

**SR1 — SearchMode: Riwayat Pencarian**
- 5 pencarian terakhir disimpan di `sessionStorage` (per-sesi, tidak persisten)
- Ditampilkan sebagai chip bertap di bawah input saat query kosong
- Riwayat diperbarui saat `onBlur` input dengan query ≥2 karakter

**G1 — GlossaryMode: Audio per Entry**
- Tombol 🔊 muncul di area expanded tiap entri (jika `audioEnabled` aktif)
- Memanfaatkan `speakJP` + `canSpeak()` dari `speak.js` yang sudah ada

**SB1/SB2 — SumberMode: Progress per Sumber + Indikator Terlemah**
- Progress bar mini (hafal/total) per sumber di picker utama
- Badge "Terlemah" pada sumber dengan persentase hafalan terendah
- Progress dihitung dari `progress.known` vs kartu per sumber

**W3 — WaygroundMode: Badge "Baru" untuk Set Belum Dikerjakan**
- Label amber "Baru" muncul di set yang belum pernah dikerjakan (tidak ada `wgScores` untuk set itu)

**R2 — ReviewMode: Chip Alasan Due**
- Chip kedua di bawah strength pill: `N× ulasan · interval Xj` (atau "Baru" untuk kartu pertama kali)
- Memanfaatkan `info.reps` dan `intervals[3]` (next Easy interval sebagai referensi)

**J3 — JACMode: Best Score**
- `bestPct` tersimpan berdampingan dengan `pct` terakhir di `jacScores`
- Di picker, jika `bestPct !== pct`, tampilkan `best N%` di samping skor terakhir

---

## [4.7.0] - 2026-05-08

### W2 (Agent Sonnet 4.6)

**W2 — Per-Set "Ulang Salah" Mode in WaygroundMode**
- `getSetWrongCount(setId)` helper reads per-set wrong counts at picker render time via `loadFromStorage`
- `lemahMode` state: when true, filters question pool to wrong-only for the active set before shuffling
- Each set row in the picker now shows an `⚠ Ulang N salah` sub-button when that set has stored wrong answers
- Sub-button is visually attached to its set row (no top border, red tint, rounded only at bottom)
- Lemah-mode runs show `⚠ [title] · Salah` in QuizShell header
- Lemah-mode scores do not overwrite the set's official score in `wgScores`
- `handleExit` resets `lemahMode` on back navigation so picker is always clean
- Import updated: `makeWrongEntry, getWrongCount, loadFromStorage` from `wrong-tracker.js`

**Administrative**
- ST5 confirmed complete (StatsMode already shows "Sering Salah" top-10 wrong cards from `quizWrong`)

---

## [4.6.0] - 2026-05-08

### E2/E3 · F4 · ST3 (Agent Sonnet 4.6)

**E2/E3 — GitHub Gist Sync (Multi-Device, Opt-In)**
- New `src/utils/gist-sync.js`: `pushToGist`, `pullFromGist`, `findExistingGist`, token/ID persistence helpers
- ExportMode: collapsible "Sinkronisasi Gist" section — PAT input, Gist ID display, Push/Pull/Simpan buttons
- Auto-discovers existing Gist on first pull (no manual ID needed)
- Token stored in localStorage only, sent exclusively to `api.github.com`
- Error handling with inline status messages per operation

**F4 — Sprint "Battle Past Self" Ghost Score**
- `sprintBestTimeline: [{ t, score }]` recorded every 5 seconds during sprint, saved to `prefs` on new personal best
- Ghost score displayed live during playing phase: `👻 N ↑ unggul!` / `= sejajar` / `↓ -N`
- `getBestTimeline()` loaded on mount; resets each new session
- `savePersonalBest(score, timeline)` replaces old signature

**ST3 — Quiz Accuracy Per Category in StatsMode**
- Per-category quiz accuracy badge `🎯 N%` shown next to hafal % in category list
- Wrong answer count `N× salah dalam kuis` shown below progress bar when >0
- Derived from existing `quizWrong` wrong-tracker — no new storage needed
- Shows `null` (hidden) when no quiz data for that category yet

**Metrics:** 35 test files · **387 tests** · 23 modes · 1,410 cards

---

## [4.5.0] - 2026-05-08


### B1 — Kuis Produksi: JP→ID Type-Answer Mode (Agent Sonnet 4.6)

**New mode: `src/modes/QuizProduksiMode.jsx`**
- User sees Japanese term + furigana → types Indonesian translation (inverse of ProductionMode)
- Fuzzy matching: case-insensitive, strips punctuation, accepts slash-separated synonyms in `id_text`
- Wrong-answer tracking: writes to `ssw-quiz-produksi-wrong` via `wrong-tracker.js`
- Optional audio: 🔊 button plays JP via Web Speech API when `audioEnabled`
- Session summary: score %, wrong-card review list with correct answer revealed
- Keyboard: Enter=submit, Esc=skip, Enter/Space(after reveal)=next
- Registered as `kuisprod` in `latihan` section (modes.js + ModeRouter)
- 7 tests in `src/tests/quiz-produksi.test.jsx`

**Metrics:** 35 test files · **387 tests** · 23 modes · 1,410 cards

---

## [4.4.0] - 2026-05-08


### Phase 5.5 — Unfinished Items from Proposal (Agent Sonnet 4.6)

**D1 — Mode Dengarkan (Listening Comprehension)**
- New `src/modes/DengarMode.jsx` — audio-first quiz mode
- 🔊 button plays Japanese via Web Speech API; user picks Indonesian translation from 4 options
- Auto-advances after 1.5s; reveals kanji + furigana after answer
- Gracefully disabled if browser lacks Web Speech API
- Registered in `latihan` section; wired in ModeRouter with `allCards` for distractors

**D3 — Mode Buku Catatan (Personal Notes per Card)**
- New `src/modes/CatatanMode.jsx` — personal notes & mnemonics per flashcard
- Notes stored in `prefs.notes: { [cardId]: string }` (included in export/import)
- Filter: Semua / Ada Catatan / Belum Ada; live search across cards + notes
- Inline edit/save/delete per card; amber highlight for notes with content
- Registered in `pelajari` section; `notes: {}` added to schema DEFAULTS

**A3 — Inter-Mode Navigation Breadcrumb**
- `AppContext`: `modeHistory` state (max 3) + `goBack()` — tracks mode navigation stack
- `ModeRouter`: sticky breadcrumb bar `← 🏷️ [Mode Sebelumnya]` when history exists
- `goMode()` now pushes current mode to history before navigating
- `exitMode()` and `goTab()` clear history

**Technical debt fixes**
- Sessions cap bumped 90 → 180 for better heatmap coverage (~6 months)
- `session-tracking.test.js`: updated cap assertion to 180
- `StudyHeatmap.jsx`: moved `today` inside `useMemo` (fixes exhaustive-deps warning)
- `FlashcardMode/index.jsx`: fixed redundant `cards` dep in `useCallback`
- `schema.js`: `notes: {}` added to prefs DEFAULTS

**Stats**
- Modes: 20 → 22 (dengar + catatan)
- Tests: 376/376 ✅ | Lint: clean ✅ | Build: clean ✅

---

## [4.3.1] - 2026-05-08

### Phase 5.1 Completion + Phase 5.3 + Phase 5.4 (Agent Sonnet 4.6, commits `081c70f` + `d081434`)

**SIM1 + BUG-06 — SimulasiMode Pause & Unified Question Pool**
- Pause button in header; auto-pause on `visibilitychange` (tab/minimize); overlay tap to resume
- `buildPool()` normalizer merges `JAC_OFFICIAL` + `WAYGROUND_SETS` into single shuffled pool
- Source metadata (`_source`, `_setLabel`) propagated through to results

**ST2 — Exam Readiness Score Gauge (StatsMode)**
- SVG ring above overview card; color: red <50 / amber 50–74 / green ≥75
- Formula: mature×40 + avgQuizAcc×35 + streak×15 + bestSim×10
- Labels: Belum Siap / Hampir Siap / Siap Ujian!

**BUG-05 — FlashcardMode Filter Persist**
- `search` and `sortMode` state initialized from `sessionStorage` and written back on change
- Keys: `ssw-fc-search`, `ssw-fc-sort` — session-scoped (cleared on tab close)

**BUG-08 — GlossaryMode A-Z Nav Kanji/Romaji**
- Non-hiragana/katakana `furi` initials bucketed to `#` at end of nav list
- 13 cards with romaji-initial furi now accessible

**BUG-10 — flashcardHintCount Reset on resetAll()**
- `flashcardHintCount: 0` added to `DEFAULTS.prefs` in `schema.js`
- `resetAll()` now correctly resets hint counter via `freshDefaults()`

**BUG-11 — ExportMode Conflict Detection**
- `exported_at` timestamp compared: device vs file
- Warning banner shown if device data is newer than imported file

**B2 — SprintMode Category Lock + Escalating Timer**
- Duration picker: 30s / 60s / 2 menit before sprint
- Category picker: filtered from available cards; default all
- Visual urgency: normal → amber pulse (≤30s) → red pulse (≤10s)

**SIM3 + SIM4 — Post-Exam Analysis + Breakdown**
- "Latih N Salah" CTA wired to `onRetryWrong` prop (opens FlashcardMode filtered)
- Breakdown per set/source card rendered after results (SIM4)

**F1 — Achievement Badge System**
- `src/utils/achievements.js`: 14 badges with `check(state)` predicates
- `buildAchievementState()` + `evaluateAchievements()` pure functions
- 4×N grid in SayaTab: grayscale until unlocked

**F2 — Daily Challenge (Soal Hari Ini)**
- `src/utils/daily-challenge.js`: deterministic date-seeded question from JAC+Wayground pool
- Rendered in SayaTab with inline option buttons; answered state in sessionStorage

**ST1 — StudyHeatmap (Kalender Belajar)**
- `src/components/StudyHeatmap.jsx`: 18-week SVG heatmap (126 days)
- Color: amber opacity 25–100% by session count; "Sedikit / Banyak" legend
- Wired into StatsMode above 7-day bar chart

**A2 — Smart Mode Recommendation Engine**
- `src/utils/recommend-mode.js`: pure function, priority-rule based
- Replaces `getQuickStart` in Dashboard — reads sessions + streak from storage
- Rules: exam proximity, SRS due, streak, quiz accuracy, sim score

**E4 — lz-string localStorage Compression**
- `engine.js`: `writeDoc` compresses via `LZString.compressToUTF16`; `readDoc` decompresses with JSON fallback (backward compat)
- `migrations.js`: `safeGetDoc` added — decompresses engine docs before v2→v3 migration
- `storage.test.js`: 5 raw `JSON.parse(localStorage.getItem(...))` assertions replaced with `get()` calls

**Tests:** 376/376 passing · Build clean (9.9s)

---

## [4.3.0] - 2026-05-07

### Phase 5.1 — Critical Gaps (Agent Sonnet 4.6, commits `532db6a` + `c59d54e`)

**Fix — SayaTab version string (BUG-01)**
- `SayaTab.jsx`: hardcoded `v4.0.2` → `v4.2.0` (3 occurrences: sub prop, toast, footer JSX)

**R1 — ReviewMode Rating Distribution**
- Done screen sekarang tampilkan grid 4-cell: Lagi / Susah / Oke / Mudah dengan count per rating
- `ratingDist` state tracked selama sesi, direset tiap sesi baru

**A1 — Wrong-Card Bridge (universal)**
- `AppContext.goMode(key, params?)` extended — opsional params object (e.g. `{ filterIds: [...] }`)
- `modeParams` exposed di context; `exitMode` clears it
- `ModeRouter`: `kartu` mode receives `filterIds` dari `modeParams`
- `FlashcardMode`: accepts `filterIds` prop — filters `baseCards`, shows red banner "Latihan kartu salah"
- `QuizShell`: tracks `_cardId` per result; `onRetryWrong(ids)` prop navigates ke filtered kartu
- `QuizMode`: forwards `onRetryWrong` prop ke QuizShell
- Modes wired: `kuis`, `jac`, `wayground`, `simulasi`

**K1 — FlashcardMode Swipe Gesture untuk Rating**
- `touchStart` now `{x, y}` object untuk track dua axis
- Saat flipped + belum rated: swipe kiri=Lagi(1), kanan=Oke(3), atas=Mudah(4); threshold 60px, dominant axis check
- Swipe navigasi kartu tetap berfungsi saat belum flip
- Hint "← Lagi · Oke → · ↑ Mudah" tampil di bawah kartu saat flipped

**S5/BUG-07 — SprintMode Wrong-Tracker**
- `handleDontKnow` sekarang nulis `makeWrongEntry` ke `prefs.quizWrong`
- FocusMode dan mode lain yang baca `quizWrong` kini dapat data dari Sprint

**F1 — FocusMode "Kenapa Kategori Ini?" Explainer**
- Panel info ditampilkan sebelum sprint dimulai: nama kategori, akurasi %, stats hafal/salah
- 3 tier pesan kontekstual: <40% / 40-70% / ≥70%

**E1 — SW Update Prompt**
- `index.html` SW registration: `updatefound` + `statechange` listener
- Amber banner fixed di `bottom: 80px` dengan tombol "Perbarui" (reload untuk aktivasi SW baru)

**Docs**
- `docs/SSW_UPGRADE_PROPOSAL_v1.md`: Pre-Phase + Phase 5.1 ditandai ✅; Bug Registry diupdate

**Tests**: 376/376 passing (tidak ada regresi)

---

## [4.2.0] - 2026-05-07

### Test Fix + New Modes (Agent Sonnet 4.6, commit post-61e159e)

**Fix — CSS Module Mock in Test Files**
- `BottomNav.test.jsx` and `Toast.test.jsx`: `vi.mock('*.module.css', () => ({}))` was missing a `default` export, causing all 15 tests to fail with "No default export" error
- Fixed by returning `{ default: new Proxy({}, { get: (_, k) => k }) }` — all 376 tests now green

**New Modes (from prior session commit 61e159e)**
- `ProductionMode` (`produksi`): ID→JP active recall with text input; registered in latihan
- `ConfusionMode` (`mirip`): 28 confusion pairs VLT-style (音/字/意); registered in latihan
- Mode count: 18 → 20

**Docs**
- `_MAP.md`: ProductionMode + ConfusionMode added to directory structure; metrics updated (v4.2.0, 20 modes)
- `docs/BLUEPRINT-CURRENT.md`: v4.2.0 section added; ProductionMode + ConfusionMode marked complete in open items
- `package.json`: version bumped to 4.2.0

---

## [4.1.0] - 2026-05-07

### FE Sprint — CSS Modules, A11y, Robustness, DX, PWA, UX Polish (Agent Sonnet 4.6)

**FE-01 — CSS Module Migration (all mode components)**
- `DangerMode`, `AngkaMode`, `SimulasiMode`, `StatsMode`, `ReviewMode`, `GlossaryMode` — all inline styles extracted to `.module.css` counterparts
- Dynamic/runtime styles (answer state colors, group colors, grade thresholds, animation delays) correctly kept inline with justification comments

**FE-02 — Reduced Motion**
- `@media (prefers-reduced-motion: reduce)` blocks added to 7 CSS files: `global.css`, `flashcard.module.css`, `Dashboard.module.css`, `ResultScreen.module.css`, `QuizShell.module.css`, `BottomNav.module.css`, `FlipCard.module.css`

**FE-03 — Design Token Expansion (`global.css`)**
- Spacing scale: `--sp-1` through `--sp-6` (4–24px)
- Shadow scale: `--shadow-xs/sm/lg/amber`
- Z-index scale: `--z-base/sticky/nav/overlay/toast`
- Transition presets: `--ease-spring/smooth`, `--t-fast/base/slow`
- `.sr-only` utility class
- Token audit comment block flagging 8+ hardcoded values for future cleanup

**FE-04 — Accessibility**
- A: `ProgressRing` `role="img"` + descriptive `aria-label`; `BottomNav` badge count in `aria-label`; `FlipCard` `aria-live="polite"` + `aria-atomic` + state-aware label; `QuizShell` sr-only assertive live region
- B: `QuizShell` keyboard hint UI + `.kbHint` CSS class
- C: `useFocusTrap` hook created; applied to `TrackPicker` (`role="dialog" aria-modal="true"`)
- D: `ModeRouter` focus management on mode change (100ms delay, `[data-autofocus]` target)

**FE-05 — Component Robustness**
- A: `ErrorBoundary.jsx` (class-based) with `TabError` + `FlatCardFallback`; per-tab boundaries in `App.jsx`; `FlipCard` wrapped for old WebView 3D CSS failures
- B: `OfflineBanner.jsx` + CSS — fixed banner, `navigator.onLine` + event listeners, `slideDown` animation
- C: `useDebounce.js` (120ms default); applied to `SearchMode`
- D: `Toast` upgraded — swipe-left dismiss (60px threshold), `type` prop (`default/success/error/warning`), `data-type` CSS color variants, type-aware `aria-live`

**FE-06 — Component Render Tests (22 new test cases)**
- `BottomNav.test.jsx`: 7 tests — tab render, data-active, onChange, badge count, aria-current
- `ResultScreen.test.jsx`: 7 tests — celebrate/encourage/neutral data-path, onRestart, onExit, score text
- `Toast.test.jsx`: 8 tests — render, auto-dismiss (fake timers), undo, dismiss, stack, role=status, aria-live per type

**FE-07 — DX Improvements**
- A: `vite.config.js` + `vitest.config.js` — `@` path alias → `src/`
- B: `HUSKY-SETUP.md` — one-time pre-commit hook setup instructions
- C: `src/types.js` — JSDoc typedefs: `Card`, `Category`, `SRSState`, `Tab`, `ToastItem`, `StreakData`, `UserPrefs`

**FE-08 — PWA Hardening**
- A: `SayaTab` PWA install prompt — `beforeinstallprompt` capture, install card UI with amber accent
- B: `sw.js` activate → `postMessage({type:'SW_UPDATED'})` to all clients; `App.jsx` SW message listener → update toast with reload action

**FE-09 — UX Polish**
- A: `haptic.js` — `tap/correct/wrong/success/flip` via Vibration API; applied to `OptionButton`, `FlipCard`, `RatingRow`
- B: Scroll restoration in `ModeRouter` — `scrollCache` Map saves/restores `window.scrollY` per mode
- C: View Transitions API in `BottomNav` — `document.startViewTransition` wrapper (progressive enhancement); `::view-transition-old/new` 150ms CSS in `global.css`

**Build:** ✅ clean · lint: 0 errors 0 warnings · commits `f8150e6`→`5ca29f1`

---

### Repo Hygiene — 2026-05-07

- `outputs/` removed from git tracking (10 agent JSON artefacts — already merged into `src/data/source/`); added to `.gitignore`
- Stale remote branch `feat/ui-ux-upgrade` deleted
- `src/hooks/index.js` — `useDebounce` + `useFocusTrap` added to barrel export
- `src/utils/index.js` — `haptic` + `speak.js` exports added to barrel
- `.gitignore` — added `outputs/`, `coverage/`, `stats.html`, `.env.*`
- `.prettierignore` — added `outputs/`, `coverage/`
- `vitest.config.js` — `resolve.alias @→src` added (mirrors `vite.config.js`); `@vitejs/plugin-react` import path fixed
- `.github/workflows/ci.yml` — verbose test reporter, build output check step
- `_MAP.md` — updated to v4.1.0: all FE tasks, new files, metrics, agent trail entry

---

## [4.0.2] - 2026-05-04

### feat/audit-improvements — D1–D10 (Agent Sonnet 4.6)

- `components/SayaTab.jsx` — D1: Replace `prompt()` for Target Harian + Tanggal Ujian with inline input UI (mobile-safe, no dialog blocks)
- `components/SayaTab.module.css` — D1: Add `.inlineEdit`, `.inlineInput`, `.inlineSave`, `.inlineDelete`, `.inlineCancel` styles
- `modes/QuizMode.jsx` — D2: Respect `furiganaPolicy` pref in `startQuiz()` — question uses raw jp+furi when 'always', strips when 'hidden'
- `modes/SprintMode.jsx` — D3: Wire `furiganaPolicy` + `audioEnabled` from storage into `JpFront` props
- `router/modes.js` — D4: Add `alat` section (`stats`, `ekspor`, `sumber`) to `MODE_SECTIONS` — modes now reachable from BelajarTab grid
- `modes/ReviewMode.jsx` — D5: Auto-speak on card advance via `useEffect([currentId])` with 300ms delay; manual 🔊 kept for replay
- `utils/daily-mission.js` — D6: Add `angka` + `jebak` to `MISSION_TYPES` pool (were wired but excluded from daily selection)
- `modes/StatsMode.jsx` — D7: Accept `sessions` prop; render 7-day CSS activity bars colored by dominant mode
- `router/ModeRouter.jsx` — D7: Destructure + pass `sessions` from ProgressContext to stats mode props
- `components/MissionCompleteOverlay.jsx` — D8: Tap-to-dismiss, shows mission icon+label+score, auto-dismiss 1.5s→3s
- `router/ModeRouter.jsx` — D8: Track `missionResult` state, pass `result` prop to overlay, clear on close
- `modes/SearchMode.jsx` — D9: Accept `starred`+`toggleStar` props; ⭐/☆ button on each result card
- `router/ModeRouter.jsx` — D9: Pass `starred`+`toggleStar` to `cari` mode
- `components/QuizShell.jsx` — D10: Add optional `audioEnabled` prop + 🔊 button in counter row (opt-in, default false)
- `modes/QuizMode.jsx` + `JACMode.jsx` + `VocabMode.jsx` — D10: Accept + pass `audioEnabled` to QuizShell
- `router/ModeRouter.jsx` — D10: Read `audioEnabled` from prefs, pass to `kuis`, `jac`, `vocab` $
 ## [4.0.1] - 2026-05-04

### feat/audit-improvements — C1–C6 (Agent Sonnet 4.6)

- `modes/ReviewMode.jsx` — C1: implement 🔊 audio button using `speakJP` + `canSpeak` (B4 was dead import only). Button shown in card header when `audioEnabled=true`; taps `speakJP(clean)`.
- `modes/SearchMode.jsx` — C2: track-aware filtering. Accepts `track` prop. Default pool = jalur aktif via `getCatsForTrack`. Toggle pill 🗂 Jalurku / 🗂 Semua jalur. Search meta shows pool size.
- `modes/FocusMode.jsx` — C3: accepts + forwards `onSessionEnd` to inner SprintMode. Sprint sessions inside FocusMode now recorded.
- `modes/AngkaMode.jsx` — C4: QuizView fires `onSessionEnd` via `useEffect` on `phase=result`. `sessionFired` ref prevents double-fire. `restart()` resets ref.
- `modes/DangerMode.jsx` — C4: same pattern as AngkaMode.
- `router/ModeRouter.jsx` — C5: fill modeProps gaps — `fokus`/`angka`/`jebak` get `onSessionEnd`; `cari` gets `track`; `stats` gets `srs`+`streakData`. Destructures `streakData` from `useProgress`.
- `modes/StatsMode.jsx` — C6: SRS breakdown grid (🌟 Matang / 📗 Berkemb. / 📘 Baru) + 🔥 streak card + due-count banner.

**Build:** ✅ clean · lint: 0 errors 0 warnings · commit `77a0b93`

---

### feat/audit-improvements — B1–B4 + M1–M3 (Agent Sonnet 4.6, 2026-05-03)

- `modes/FlashcardMode/index.jsx` + `FlipCard.jsx` + `JpDisplay.jsx` — B1: `furiganaPolicy` prop chain fixed end-to-end (was silently dropped via `no-unused-vars`).
- `components/SayaTab.jsx` — B2+M1: furigana policy toggle row added to Pengaturan. Tap cycles `always → hidden → always`.
- `router/ModeRouter.jsx` — B3: `makeSessionEnd()` helper; all 7 quiz modes (SprintMode, JACMode, WaygroundMode, VocabMode, SimulasiMode, SipilMode, BangunanMode) now fire `recordSession` + mission check via `onSessionEnd`.
- `modes/ReviewMode.jsx` — B4: `storageGet` import added (audio groundwork — completed in C1).
- `modes/SprintMode.jsx` — M2: personal best tracking (`prefs.sprintBest`). 🏆 shown on ready + result screens. `sessionEndFired` ref prevents double-fire.
- `modes/GlossaryMode.jsx` — M3: track-aware category pills. Toggle 🗂 Jalurku / 🗂 Semua jalur.

**Build:** ✅ clean · commit `a68bf82`

---

## [4.0.0] - 2026-05-02

### Release v4.0.0 — Phase F + G Complete (Agent Sonnet)

**Phase F — Exam Countdown + Audio**

- `utils/speak.js` (NEW) — Web Speech API with HVPT-inspired cycling (Logan et al. 1991):
  - `speakJP(text)` — speaks Japanese with `ja-JP` lang tag
  - 3-parameter cycle: 70%/0.85, 80%/1.0, 90%/1.15 rate/pitch variation
  - `canSpeak()` — graceful degradation (returns false in jsdom/unsupported browsers)
  - `stopSpeech()`, `_resetPlayCount()` for testing
- `components/JpDisplay.jsx` — `JpFront` now has 🔊 button when `audioEnabled=true` and `canSpeak()=true`
  - Inline in default render path; tap calls `speakJP(stripFuri(jp))`
- `modes/FlashcardMode/FlipCard.jsx` — receives `audioEnabled` prop, passes to `JpFront`
- `components/Dashboard.jsx` — Exam countdown banner:
  - Shows when `prefs.examDate` is set and ≤30 days away
  - Color-coded: blue (≤30d), amber (≤14d), red (≤7d)
  - Critical message when ≤14 days
- `components/SayaTab.jsx` — Two new settings rows:
  - 📅 Tanggal Ujian — date picker (YYYY-MM-DD prompt), stored in `prefs.examDate`
  - 🔊 Audio Bahasa Jepang — toggle `prefs.audioEnabled`

**Phase G — QA + Polish + Release v4.0**

- `vitest.config.js` — Coverage thresholds added: lines 70%, functions 70%, branches 60%
- `_MAP.md` — Fully updated to v4.0.0: all Phase A–G tracked, metrics updated (321 tests, 26 files), complete file tree with phase annotations, storage schema v3 reference, agent trail
- `package.json` — Version bumped to `4.0.0`
- `SayaTab.jsx` — Footer version updated to v4.0.0

**Integration Tests (G.2)**
- `flow.export-import.test.js` (+2): full export→import cycle, rollback on corrupt snapshot
- `flow.quiz-srs.test.js` (+4): session recording, sipil/bangunan scores, mission completion
- `flow.storage-integrity.test.js` (+5): all v3 schema fields correct types across all phases
- `speak.test.js` (+8): canSpeak jsdom=false, no-throw in no-api env, mock browser test, HVPT cycling
- `exam-countdown.test.js` (+7): daysLeft logic, show thresholds, examDate + audioEnabled storage

**Final counts: 295 → 321 tests (+26) · 21 → 26 test files (+5)**

---

## [3.9.0] - 2026-05-02

### Phase D + E Complete — Export Hardening + FlashcardMode Decomposition (Agent Sonnet)

**Phase D — Export/Import Hardening**

- `storage/engine.js` — Added `validateSnapshot(snapshot)`: validates structure before import, returns `{ ok, reason, summary }`
- `storage/engine.js` — Added `importAllSafe(snapshot)`: validates first, snapshots current state, applies import, auto-rollbacks on error
- `modes/ExportMode.jsx` — Full rewrite with 2-step import flow:
  1. File loaded → validated → diff preview shown (before vs incoming data)
  2. User confirms → `importAllSafe()` applied with rollback safety
  - Summary widget now shows sessions count + schema version
  - Error messages mention that old data is safe if import fails

**Phase E — FlashcardMode Decomposition**

- `modes/FlashcardMode.jsx` (447 lines) → shim re-export only
- New `src/modes/FlashcardMode/` directory:
  - `index.jsx` (~120 lines) — orchestrator; all state management
  - `FlipCard.jsx` — 3D front/back card, swipe tilt, hint overlay
  - `RatingRow.jsx` — FSRS 4-button rating row with interval preview
  - `ToolStrip.jsx` — Sort / belum / reset / star-filter tools + keyboard hint
  - `FilterBar.jsx` — Search input + star toggle button
  - `flashcard.module.css` — 3D flip CSS (TD-05: moved from JS injection)
- **TD-05**: `FLIP_STYLE` constant + `ensureStyle()` function removed entirely
  - CSS now lives in `flashcard.module.css` with `:global()` class selectors
  - No more `document.createElement('style')` at render time
- **TD-10**: `JpDisplay.jsx` `JpFront()` accepts `furiganaPolicy` prop
  - Values: `'always'` (default, no change) | `'hidden'` (suppress furigana)
  - Default `'always'` — zero behavioral change for all current users
  - Prep for Phase G settings UI

**Tests: 273 → 295 (+22 new)**
- `export-import.test.js` (+13): validateSnapshot (8 cases), importAllSafe (4 cases)
- `flashcard-decomp.test.jsx` (+9): file existence, shim structure, CSS content, TD-05 & TD-10 verification

## [3.8.0] - 2026-05-02

### Phase B + C Complete — Content Sipil/Bangunan + Daily Mission (Agent Sonnet)

**Phase B — Content: Sipil & Bangunan**

- `src/data/sipil-sets.js` — 45 soal (3 set × 15): 土工事, K3 Sipil, Hukum & SSW
- `src/data/bangunan-sets.js` — 45 soal (3 set × 15): Bekisting/Beton, K3 Bangunan, Alat & Prosedur
- `SipilMode.jsx` — Replaced "Segera Hadir" stub dengan quiz fungsional, saves ke `sipilScores`
- `BangunanMode.jsx` — Replaced "Segera Hadir" stub dengan quiz fungsional, saves ke `bangunanScores`
- `data/index.js` — Tambah barrel export `SIPIL_SETS`, `BANGUNAN_SETS`
- `router/modes.js` — Update MODE_META: hilangkan "Segera hadir", tampilkan jumlah soal

**Phase C — Daily Mission + Session Analytics**

- `utils/daily-mission.js` (NEW) — `generateDailyMission()`, `completeMission()`, `getMission()`, `isMissionDoneToday()`
  - Priority: SRS due → strand underrepresented (Four Strands, Nation 2007)
  - Cached per-day via `progress.dailyMission`
- `contexts/ProgressContext.jsx` — Tambah `recordSession()` (cap 90), expose `sessions` array
- `router/ModeRouter.jsx` — `makeFinishHandler()` wrap `onFinish` semua mode → auto-record session
- `components/Dashboard.jsx` — Misi Hari Ini card di atas Quick Grid; ✅ badge kalau sudah selesai
- `contexts/AppContext.jsx` — Expose `setPref` + `prefs` di ctx object
- `components/SayaTab.jsx` — Target harian editable via prompt

**Tests: 258 → 273 (+15 new)**
- `sipil-data.test.js` (+8): Schema validation semua soal
- `bangunan-data.test.js` (+8): Schema + cross-validation no ID overlap
- `daily-mission.test.js` (+10): Generate, cache, complete, strand logic
- `session-tracking.test.js` (+5): recordSession, cap 90, multi-mode

## [3.7.0] - 2026-05-02

### Phase A Complete — Bug Fixes + Storage v3 + Debt Cleanup (Agent Sonnet)

**A.1 — BUG-02 Fix: `_seenPool` module-scope → `useRef`**
- `QuizMode.jsx`: Moved `const _seenPool = new Set()` from module scope into `useRef(new Set())` inside component
- Prevents stale seen-card memory across separate QuizMode sessions (module-scope Set survives HMR and route transitions)
- All `_seenPool.current` references updated throughout component

**A.2 — BUG-01 + TD-02 Fix: Remove dead Dashboard exports**
- `Dashboard.jsx`: Removed `export function recordStudyDay()`, `export function incrementDailyCount()`, `export function pushRecentCard()` — never imported by anything
- Streak and daily-count logic correctly lives in `ProgressContext.jsx`'s `handleMark()`
- Removed import of `storageSet` from Dashboard (no longer needed after dead-code removal)

**A.3 — BUG-03 Fix: Wire milestone toasts**
- `ProgressContext.jsx`: Added `toastQueue` state + `clearToast()` callback
- Milestone streak7 and quiz70 now enqueue toast messages via `setTimeout(() => setToastQueue(...), 0)` pattern (avoids setState-within-setState)
- `App.jsx`: Added `useEffect` to consume `toastQueue` and fire `toast.show()` on each queued item

**A.4 — BUG-04 Fix: Anxiety-reduction toast on 5+ wrong streak**
- `useAnswerStreak.js` (new, see A.5): Extended to track `wrongStreak` + `maxWrongStreak`
- `QuizShell.jsx`: On quiz finish, if `maxWrongStreak >= 5`, fires: *"Banyak salah? Wajar — artinya materi ini masih baru. Coba mode Kartu dulu 💪"*
- Evidence: Young (1991) — normalizing errors reduces FLCA; Zhang (2019) r = −.33

**A.5 — TD-04: Rename `useStreak` → `useAnswerStreak`**
- `src/hooks/useStreak.js` → `src/hooks/useAnswerStreak.js`
- Export renamed: `useStreak` → `useAnswerStreak`
- `hooks/index.js`: Exports both `useAnswerStreak` (primary) and `useStreak` (alias for backward compat)
- `QuizShell.jsx`: Import updated to `useAnswerStreak`

**A.6 — Storage schema v2 → v3**
- `storage/schema.js`: `STORAGE_VERSION` bumped 2 → 3
- New `progress` fields: `sipilScores`, `bangunanScores` (Phase B), `sessions`, `dailyMission` (Phase C)
- New `prefs` fields: `examDate`, `audioEnabled` (Phase F), `studyAnchor` (Phase C), `furiganaPolicy` (Phase E)
- `storage/migrations.js`: Added `hasV2Data()` and `migrate_v2_to_v3()`
- `storage/engine.js`: `init()` now handles v2→v3 migration; v1 data chains through v2→v3; fresh install writes v3 defaults

**A.7 — TD-03: Fix wrong-tracker v1 key references**
- `utils/wrong-tracker.js`: Removed exported `STORAGE_KEYS` object (contained v1 key strings like `'ssw-quiz-wrong'` that no longer exist as standalone keys in v2/v3)
- Value helpers (`getWrongCount`, `makeWrongEntry`, etc.) unchanged — still backward-compatible

**A.8 — TD-01: Fix ExportMode format compatibility**
- `modes/ExportMode.jsx`: Replaced custom `collectProgressData()`/`restoreProgressData()` (scraped individual localStorage keys) with `exportAll()`/`importAll()` from storage engine
- Export filename now includes schema version: `ssw-progress-v3-YYYY-MM-DD.json`
- Summary widget shows schema version instead of raw key count

**A.9 — TD-08: Remove legacy nav arrays**
- `router/modes.js`: Removed `BELAJAR_MODES`, `UJIAN_MODES`, `LAINNYA_MODES` exports
- Navigation uses `MODE_SECTIONS` throughout; legacy arrays were never imported

**A.10 — Growth mindset language in ResultScreen (C-13)**
- `components/ResultScreen.jsx`: Encourage path (< 50%) changes:
  - Emoji: `💪` → `🌱`
  - Label: replaced with *"Belum. Tapi kamu sudah tahu apa yang perlu dipelajari."*
- Evidence: Dweck (2006) — "not yet" framing preserves intrinsic motivation

**Tests: 223 → 242 (+19 new)**
- `quiz.seenpool.test.jsx` (+3): Verifies `_seenPool` not at module scope; `useRef` pattern present
- `storage.migration-v3.test.js` (+5): Fresh install v3, v2→v3 migration, DEFAULTS shape
- `milestone.toast.test.jsx` (+3): Toast queue init, clearToast callable
- `anxiety.toast.test.jsx` (+3): `maxWrongStreak` logic, threshold checks
- `wrongtracker.test.js` (+5): `STORAGE_KEYS` removed, value helpers correct
- `components.resultscreen.test.jsx`: Updated 3 tests for A.10 (🌱 emoji, "Belum" label, tip selector)

**AppContext**: Added safe default context value so `useApp()` degrades gracefully in unit tests that don't wrap with `AppProvider`

---


---

## Pre-v3.7.0 History (Compacted)

> Full entries for these versions are preserved in git history.
> Summary of key milestones only.

### v3.6.x (2026-04-29 – 2026-05-01) — CSS Modules + Component Polish

- **v3.6.1** `docs` — blueprint v5, _MAP hygiene
- **v3.6.1** — Phase 10 QA release; 72 tests passing
- **v3.6.0** — Phase 9: component tests + bundle visualizer (rollup-plugin-visualizer)
- **v3.5.3** — Phase 8: skeleton loading, empty states, a11y (role/aria attrs)
- **v3.5.2** — Phase 7: interactive 4-step onboarding (TrackPicker, goal, tutorial)
- **v3.5.1** — Phase 6 CSS Modules complete: all components + modes migrated; inline styles → 0

### v3.4.x – v3.0.x (2026-04-28 – 2026-04-29) — Feature Build

- **v3.4.0** — Phase 5: DangerMode + AngkaMode polish; FilterPopup; last-mode persist
- **v3.3.0** — Phase 4: JACMode + WaygroundMode + SimulasiMode restored
- **v3.2.0** — Phase 3 / VocabMode: dedicated vocab drill; wg1–wg12; CSV sets (300 soal)
- **v3.1.0** — VocabDB: wg7–wg12 complete from JAC PDFs; csv-sets.js (300 soal)
- **v3.0.1** — Phase 9–10: Beginner UX, tutorial, milestones, Toast, ConfirmDialog
- **v3.0.0** — Major rewrite: Vite build, 3-tab nav, Dashboard, shared components, SRS engine

### v2.3.x (2026-04-28) — Legacy Monolith → Modular

- **v2.3.6** — HTML/PWA bug fixes + getCatsForTrack tests (105 tests)
- **v2.3.5** — initStore render fix, SearchMode, 105 tests
- **v2.3.4** — BottomNav theme, ReviewMode interval labels
- **v2.3.3** — Format + version sync
- **v2.3.2/v2.3.1** — Codex comprehensive audit + aggressive integrity pass
- **v2.3.x (pre-Codex)** — ts-fsrs integration, FSRS ReviewMode, pure localStorage migration, PWA icons, dark mode

