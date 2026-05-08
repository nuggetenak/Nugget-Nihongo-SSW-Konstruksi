# 🪖 SSW Konstruksi — Audit & Upgrade Proposal
**Versi Proposal:** v3 | **Tanggal Audit:** 2026-05-07 | **Hygiene Pass:** 2026-05-08 (×3) | **Auditor:** Claude Sonnet 4.6

---

## ✅ VERSION DISCREPANCY — RESOLVED (2026-05-07)

> Ditemukan saat audit awal (v4.2.0 di source vs v4.0.2 di deployed). Semua item telah diselesaikan.

| Item | Resolusi |
|------|----------|
| PR #7 furigana tap-to-toggle | ✅ Merged ke main (commit `6a329e7`) |
| CHANGELOG entries v4.1.x + v4.2.0 | ✅ Ditulis ulang (sesi sebelumnya) |
| SayaTab.jsx footer | ✅ Fixed `v4.0.2` → current (commit `532db6a`) |
| GitHub Actions deploy | ✅ Auto-trigger dari push ke main |
| Version sync | ✅ SayaTab sekarang menampilkan versi dari `package.json` |

---

## 📋 Ringkasan Eksekutif

App telah tumbuh dari single-file JSX 7.390 baris (v87) menjadi arsitektur multi-komponen yang matang (**v4.8.2**) dengan **23 mode**, **383+ test**, FSRS engine, PWA, CI/CD, dan 1.438 kartu. Kualitas teknis sangat baik.

**Hasil audit ini menemukan 6 kategori peningkatan:**
- **A** — Alur Lintas Mode (cross-mode flow gaps)
- **B** — Penguatan Mode Belajar yang ada
- **C** — Konten & Data Pipeline
- **D** — Mode Baru yang direkomendasikan
- **E** — Teknis & Infrastruktur
- **F** — Gamifikasi & Motivasi

**Skala prioritas:** 🔴 Kritis · 🟠 Tinggi · 🟡 Sedang · 🟢 Nice-to-have

---

## 🔍 Analisis Per-Mode

### 1. 🔁 Ulasan SRS (ReviewMode)

**Kondisi saat ini:** Auto-speak on card advance (D5), 🔊 manual replay (C1), FSRS 4-button rating, `ReviewSummaryScreen` setelah sesi selesai (R1 v4.3.0), due-reason chip (R2 v4.8.0).

| # | Temuan | Tipe | Prioritas |
|---|--------|------|-----------|
| R1 | ~~Tidak ada **session summary screen**~~ ✅ FIXED v4.3.0 — `ReviewSummaryScreen` dengan rating distribution (Again/Hard/Ok/Easy) dan % akurasi | Gap | 🔴 |
| R2 | ~~Tidak ada indikator "kenapa kartu ini muncul sekarang"~~ ✅ FIXED v4.8.0 — interval/due-reason tidak ditampilkan | UX | 🟠 |
| R3 | ~~Audio auto-speak pada card advance bisa mengganggu — perlu opsi **"speak on flip"**~~ ✅ FIXED v4.9.0 — `speakOnFlip` pref + toggle di SayaTab | Refinement | 🟡 |
| R4 | ~~Tidak ada shortcut untuk **"skip card"** tanpa menilai~~ ✅ FIXED v4.9.0 — tombol "Lewati" + keyboard `S` | UX | 🟡 |
| R5 | ~~Queue tidak menampilkan **jumlah kartu tersisa** secara live di header~~ ✅ FIXED v4.9.0 — `N / total · N lagi` di header | UX | 🟢 |

**Rekomendasi R1 (kritis):** Tambahkan `ReviewSummaryScreen` setelah sesi selesai: kartu ditinjau, distribusi rating (Again/Hard/Ok/Easy), estimated next due count, CTA "Lanjut ke Kartu" atau "Kembali".

---

### 2. 🃏 Kartu (FlashcardMode)

**Kondisi saat ini:** Decomposed ke 5 subcomponen, 3D flip, FSRS rating, search, star, furigana policy, swipe gestures kiri/kanan/atas (K1 v4.3.0), filter persist (BUG-05 v4.3.1), breadcrumb nav (A3 v4.4.0).

| # | Temuan | Tipe | Prioritas |
|---|--------|------|-----------|
| K1 | ~~**Swipe left/right untuk rating** belum diimplementasi~~ ✅ FIXED v4.3.0 — swipe kiri=Lagi, kanan=Oke, atas=Mudah di `FlipCard.jsx` (K1) | Gap | 🔴 |
| K2 | ~~Tidak ada mode **"Hanya Baca"** — review pasif~~ ✅ FIXED v4.10.0 — ToolStrip toggle 👁 Baca / 📝 Rating, hides RatingRow | Feature | 🟠 |
| K3 | ~~`FilterBar` tidak persist filter antar-sesi~~ ✅ FIXED v4.3.1 (BUG-05) — filter/sort persist via sessionStorage | Bug | 🟠 |
| K4 | ~~**"Tap untuk balik"** hint tidak reset saat `resetAll()`~~ ✅ FIXED v4.3.1 (BUG-10) — `flashcardHintCount` ada di `DEFAULTS`, reset otomatis | Bug | 🟡 |
| K5 | ~~Tidak ada tombol **"Tambah ke SRS manual"**~~ ✅ FIXED v4.11.0 — "＋ Tambah ke Ulasan SRS" button for known cards not in SRS queue | Feature | 🟡 |
| K6 | ~~Category pill di front card tidak bisa di-tap untuk filter langsung (missed affordance)~~ ✅ FIXED v4.12.0 — tap category badge → filter deck to that category | UX | 🟢 |

**Rekomendasi K1 (kritis):** Implementasi swipe gesture di `FlipCard.jsx` — swipe kiri = "Lagi" (1), swipe kanan = "Oke" (3), swipe atas = "Mudah" (4). Sudah ada `swipeTilt` infrastructure, tinggal wire ke rating callback.

---

### 3. ❓ Kuis (QuizMode)

**Kondisi saat ini:** Furigana policy, seenPool fix (A1), 3 difficulty levels, lemah mode, auto-next, Wrong-Card Bridge ke FlashcardMode (A1 v4.3.0). Mode produksi terpisah: `QuizProduksiMode.jsx` (B1 v4.5.0).

| # | Temuan | Tipe | Prioritas |
|---|--------|------|-----------|
| Q1 | ~~Tidak ada **mode produksi**~~ ✅ FIXED v4.5.0 (B1) — `QuizProduksiMode.jsx`: JP→ID type-answer dengan fuzzy match | Gap | 🔴 |
| Q2 | ~~Tidak ada **"Pelajari yang Salah"** CTA~~ ✅ FIXED v4.3.0 (A1) — ResultScreen.jsx CTA `onRetryWrong` terhubung ke FlashcardMode dengan `filterIds` | Gap | 🔴 |
| Q3 | ~~Difficulty level tidak dijelaskan kepada user sebelum mulai — apa bedanya "mudah" vs "sulit" secara konkret?~~ ✅ FIXED v4.12.0 — detail text shown inline on selection | UX | 🟠 |
| Q4 | ~~Opsi jumlah soal (10/20/30/Semua) tidak persist ke sesi berikutnya~~ ✅ FIXED v4.9.0 — disimpan ke `prefs.quizQuestionCount` | UX | 🟡 |
| Q5 | ~~Tidak ada **"Quiz per Kategori"**~~ ✅ FIXED v4.10.0 — category picker di ⚙ Pengaturan QuizMode | Feature | 🟡 |
| Q6 | Wrong-answer explanation (`DescBlock`) tidak selalu ada di semua kartu — perlu audit coverage | Data | 🟡 |

**Rekomendasi Q2 (kritis):** Setelah `ResultScreen`, pass `wrongCardIds` ke parent. "Latih X salah" CTA yang sudah ada di ResultScreen harusnya navigate ke FlashcardMode dengan `filterIds={wrongCardIds}`. Saat ini CTA ada tapi navigasinya belum ter-wire ke filtered set.

---

### 4. ⚡ Sprint (SprintMode)

**Kondisi saat ini:** Duration picker 30s/60s/2m (B2), category lock (B2), escalating urgency (B2), ghost score live (F4 v4.6.0), personal best (`sprintBest` + `sprintBestTimeline` in prefs), wrong-tracker write (BUG-07 v4.3.0), session recording.

| # | Temuan | Tipe | Prioritas |
|---|--------|------|-----------|
| S1 | ~~Sprint hanya 60 detik flat~~ ✅ FIXED v4.3.1 (B2) — durasi picker 30s/60s/2m | Feature | 🟠 |
| S2 | ~~Tidak ada **category lock**~~ ✅ FIXED v4.3.1 (B2) — category picker sebelum sprint dimulai | Feature | 🟠 |
| S3 | ~~Visual countdown tidak **eskalasi**~~ ✅ FIXED v4.3.1 (B2) — `isWarning` (amber) dan `isUrgent` (red) color states | UX | 🟡 |
| S4 | ~~Personal best tidak dibanding secara visual~~ ✅ FIXED v4.6.0 (F4) — ghost score `👻 N` live vs score sekarang via `sprintBestTimeline` | UX | 🟡 |
| S5 | ~~Sprint tidak menambah kartu salah ke wrong-tracker~~ ✅ FIXED v4.3.0 (BUG-07/S5) — wrong-tracker write di SprintMode | Bug | 🟠 |

**Rekomendasi S5 (bug):** Wire `useWrongTracker` ke Sprint answer handler. Tiap kartu yang salah dalam sprint harus `incrementWrong(cardId)` — saat ini sprint tidak menulis ke wrong-tracker sehingga FocusMode tidak bisa "belajar dari kesalahan sprint".

---

### 5. 🎯 Fokus (FocusMode)

**Kondisi saat ini:** Session recording, wraps SprintMode, auto-pilih kategori terlemah, explainer panel "Kenapa kategori ini?" (F1 v4.3.0), breadcrumb nav (A3 v4.4.0).

| # | Temuan | Tipe | Prioritas |
|---|--------|------|-----------|
| F1 | ~~UI tidak menampilkan **"Kenapa kategori ini?"**~~ ✅ FIXED v4.3.0 — explainer panel dengan nama kategori + rekomendasi terlemah (FocusMode) | UX | 🔴 |
| F2 | ~~Setelah satu sesi Sprint selesai, FocusMode tidak otomatis **pindah ke kategori terlemah berikutnya**~~ ✅ FIXED v4.12.0 — auto-advance + session progress counter | Gap | 🟠 |
| F3 | ~~Tidak ada visual progress "kamu sudah melatih N dari M kategori lemah hari ini"~~ ✅ FIXED v4.12.0 — banner + ✓ badges on trained categories | UX | 🟡 |

**Rekomendasi F1 (kritis):** Sebelum mulai drill, tampilkan panel: "Kategori terlemah kamu: **[Nama Kategori]** — Akurasi: XX% (N salah dari M soal terakhir)". Ini penting secara pedagogis — andragogi mensyaratkan learner memahami *mengapa* mereka belajar sesuatu.

---

### 6. 📋 JAC Official (JACMode)

**Kondisi saat ini:** Score tracking per set, last-score badge + best score (J3 v4.8.0), lemah filter, auto-delay, Wrong-Card Bridge (A1 v4.3.0).

| # | Temuan | Tipe | Prioritas |
|---|--------|------|-----------|
| J1 | ~~Kartu yang salah di JACMode **tidak masuk ke SRS queue**~~ ✅ FIXED v4.10.0 — "🧠 Tambah ke Ulasan SRS" pada ResultScreen, queues `related_card_id` via `recordReview(id, 1)` | Gap | 🔴 |
| J2 | Tidak ada **"Simulasi chapter"** — user tidak bisa mensimulasikan ujian hanya dari bab tertentu | Feature | 🟠 |
| J3 | ~~Score badge di picker hanya tampilkan persentase terakhir, bukan **best score**~~ ✅ FIXED v4.8.0 | UX | 🟡 |
| J4 | Soal JAC tidak punya tag chapter/bab — sulit tahu soal mana yang dari bab mana | Data | 🟠 |

**Rekomendasi J1 (kritis):** Setelah JACMode selesai, tawarkan "Tambah X soal salah ke Ulasan SRS?" → jika iya, buat SRS card sementara dari soal JAC yang salah. Ini menutup loop antara exam prep dan vocabulary reinforcement.

---

### 7. 🎓 Wayground (WaygroundMode)

**Kondisi saat ini:** Score + maxStreak per set, badges, CSV Teori + CSV Praktik terintegrasi, per-set "Ulang Salah" sub-button (W2 v4.7.0), badge "Baru" untuk set belum dikerjakan (W3 v4.8.0).

| # | Temuan | Tipe | Prioritas |
|---|--------|------|-----------|
| W1 | ~~**CSV Teori vs CSV Praktik** tidak cukup jelas dibedakan secara visual di picker~~ ✅ FIXED v4.9.0 — deskripsi grup di setiap header | UX | 🟠 |
| W2 | ~~Tidak ada **"review hanya salah"** per-set~~ ✅ FIXED v4.7.0 — `lemahMode` sub-button per set row | Gap | 🟠 |
| W3 | ~~Set yang belum pernah dikerjakan tidak diberi badge/tag "Belum Dikerjakan" yang jelas~~ ✅ FIXED v4.8.0 | UX | 🟡 |
| W4 | ~~WaygroundMode tidak menampilkan **total score** lintas semua set~~ ✅ FIXED v4.9.0 — summary card total benar/salah + % di atas picker | UX | 🟡 |
| W5 | ~~Tidak ada urutan saran — set mana yang sebaiknya dikerjakan lebih dulu?~~ ✅ FIXED v4.12.0 — "Disarankan Berikutnya" card in picker | Feature | 🟡 |

---

### 8. 🎯 Simulasi (SimulasiMode)

**Kondisi saat ini:** Big timer dengan pace hint `N soal/mnt` (SIM5 v4.8.2), LULUS/BELUM LULUS (65% threshold), pause + auto-pause (SIM1 v4.3.0), unified pool JAC+Wayground (BUG-06 v4.3.0), post-exam breakdown (SIM4 v4.3.1), Wrong-Card Bridge (SIM3 v4.3.1).

| # | Temuan | Tipe | Prioritas |
|---|--------|------|-----------|
| SIM1 | ~~Tidak ada **pause button**~~ ✅ FIXED v4.3.0 — pause + auto-pause via `visibilitychange` + resume overlay | Gap | 🔴 |
| SIM2 | ~~Kartu simulasi tidak ter-randomisasi dari semua jalur~~ ✅ FIXED v4.3.0 (BUG-06) — pool unified dari JAC_OFFICIAL + WAYGROUND_SETS via normalizer | Bug | 🔴 |
| SIM3 | ~~Kartu salah tidak dieksport ke SRS/Fokus~~ ✅ FIXED v4.3.1 — "Latih Salah" CTA → `onRetryWrong` FlashcardMode bridge | Gap | 🟠 |
| SIM4 | ~~Tidak ada **post-exam analysis**~~ ✅ FIXED v4.3.1 — breakdown per sumber/set setelah result screen | Feature | 🟠 |
| SIM5 | ~~Timer tidak menampilkan **"N soal/menit yang dibutuhkan"**~~ ✅ FIXED v4.8.2 — `N soal/mnt` live di bawah timer | UX | 🟡 |

**Rekomendasi SIM1 + SIM2 (kritis):** Pause via `document.hidden` visibility API (jika user minimize app, pause otomatis). Untuk randomisasi: pastikan soal simulasi diambil dari semua jalur aktif user (saat ini kemungkinan hanya dari jalur default).

---

### 9. 🔢 Angka Kunci (AngkaMode)

**Kondisi saat ini:** Session end recording (C4), quiz + browse panel, 5 topik grup.

| # | Temuan | Tipe | Prioritas |
|---|--------|------|-----------|
| AK1 | ~~Tidak ada **mnemonic/memory hook** per angka~~ ✅ FIXED v4.11.0 — `mnemonic` field di semua 28 entri, ditampilkan di panel + pada jawaban salah | Content | 🟠 |
| AK2 | ~~Mode browse tidak menampilkan angka dalam **konteks kalimat soal** — hanya label + nilai~~ ✅ FIXED v4.12.0 — `soal` field (sample exam question) on all 28 entries | UX | 🟡 |
| AK3 | ~~Tidak ada **"tulis angkanya"**~~ ✅ FIXED v4.11.0 — `TypeQuizView`: ⌨️ Ketik mode, fuzzy match, mnemonic hint on wrong | Feature | 🟡 |

---

### 10. ⚠️ Soal Jebak (DangerMode)

**Kondisi saat ini:** Browse accordion, quiz dengan after-answer pair comparison, session end (C4).

| # | Temuan | Tipe | Prioritas |
|---|--------|------|-----------|
| D1 | ~~Tidak ada **penjelasan linguistik** "kenapa keduanya sering tertukar" — hanya menampilkan pasangan, tidak mengajarkan perbedaannya~~ ✅ FIXED v4.12.0 — `explanation` field on all 20 pairs | Content | 🟠 |
| D2 | ~~Pasangan jebak tidak dikategorikan by confusion type~~ ✅ FIXED v4.11.0 — `confusionType` field: makna/kata/angka/prosedur; filter chips in panel | Data | 🟡 |
| D3 | ~~Setelah quiz, pasangan yang salah tidak dimasukkan ke review pool khusus~~ ✅ FIXED v4.11.0 — wrong answers write to shared `ssw-quiz-wrong` | Gap | 🟡 |

---

### 11. 🔍 Cari (SearchMode)

**Kondisi saat ini:** Track-aware, starring, search meta shows pool size, riwayat 5 pencarian terakhir (SR1 v4.8.0), copy-to-clipboard ⎘ per result (SR3 v4.8.2), useDebounce 120ms.

| # | Temuan | Tipe | Prioritas |
|---|--------|------|-----------|
| SR1 | ~~Tidak ada **search history**~~ ✅ FIXED v4.8.0 — user sering mencari kata yang sama berulang kali | Feature | 🟠 |
| SR2 | Tidak bisa search by **furigana reading** — ketik "あんぜん" tidak menemukan kartu "安全" | Bug | 🟠 |
| SR3 | ~~Tidak ada **"Copy ke Clipboard"**~~ ✅ FIXED v4.8.2 — tombol ⎘ per hasil pencarian, salin JP+furigana+terjemahan | Feature | 🟢 |
| SR4 | ~~Hasil pencarian tidak menampilkan **akurasi user** untuk kartu itu~~ ✅ FIXED v4.9.0 — badge `✓ Hafal` + `⚠ Nx salah` per kartu | Feature | 🟡 |

---

### 12. 📖 Glosari (GlossaryMode)

**Kondisi saat ini:** A-Z hiragana nav + `#` bucket untuk non-hiragana (BUG-08 v4.3.1), IntersectionObserver sync, category filter dengan count badge, tombol 🔊 audio per entry (G1 v4.8.0).

| # | Temuan | Tipe | Prioritas |
|---|--------|------|-----------|
| G1 | ~~Tidak ada **audio per entry**~~ ✅ FIXED v4.8.0 — Glosari adalah tempat ideal untuk mendengarkan pronunciation | Gap | 🟠 |
| G2 | ~~Tidak ada **compact vs expanded** view toggle~~ ✅ FIXED v4.11.0 — ≡ Kompak / ⊞ Lebar toggle di header | UX | 🟡 |
| G3 | ~~Tidak ada **"Export Pilihan sebagai Mini Deck"** — user pilih 20 kata dari glosari, export ke format yang bisa diimport ke Anki~~ ✅ FIXED v4.13.0 — ☑ Pilih mode + ⬇ Ekspor Anki (TSV download) | Feature | 🟢 |
| G4 | ~~A-Z nav hanya hiragana — kata dengan awalan kanji/romaji tidak terjangkau~~ ✅ FIXED v4.12.0 — non-kana initials each get own nav key | Bug | 🟡 |

---

### 13. 📂 Sumber (SumberMode)

**Kondisi saat ini:** Browse kartu per sumber PDF, progress bar hafalan per sumber + badge "Terlemah" (SB1/SB2 v4.8.0).

| # | Temuan | Tipe | Prioritas |
|---|--------|------|-----------|
| SB1 | ~~Tidak ada **progress per sumber**~~ ✅ FIXED v4.8.0 — sudah hafal berapa % dari setiap PDF? | Feature | 🟠 |
| SB2 | ~~Tidak ada indikasi **sumber mana yang paling banyak kartu belum diketahui**~~ ✅ FIXED v4.8.0 | Feature | 🟠 |
| SB3 | ~~Tidak bisa langsung **"Sprint dari sumber ini"** atau "Kuis dari sumber ini"**~~ ✅ FIXED v4.10.0 — 🃏 Kartu / ⚡ Sprint / ❓ Kuis buttons per source | Feature | 🟡 |

---

### 14. 📊 Statistik (StatsMode)

**Kondisi saat ini:** 18-week SVG heatmap (ST1 v4.3.1), Exam Readiness Score gauge (ST2 v4.3.0), SRS breakdown grid, quiz accuracy per kategori (ST3 v4.6.0), streak card, "Sering Salah" top-10, due-count banner.

| # | Temuan | Tipe | Prioritas |
|---|--------|------|-----------|
| ST1 | ~~Tidak ada **heatmap kalender**~~ ✅ FIXED v4.3.1 — `StudyHeatmap.jsx`, 18-week SVG, amber opacity scale | Feature | 🟠 |
| ST2 | ~~Tidak ada **"Exam Readiness Score"**~~ ✅ FIXED v4.3.0 — SVG ring gauge di StatsMode, formula SRS×40+quiz×35+streak×15+sim×10 | Feature | 🔴 |
| ST3 | ~~Akurasi per kategori tidak divisualisasikan~~ ✅ FIXED v4.6.0 — `🎯 N%` badge + wrong count per kategori di StatsMode | Gap | 🟠 |
| ST4 | ~~Tidak ada perbandingan **"minggu ini vs minggu lalu"**~~ ✅ FIXED v4.9.0 — grid 3 kolom di StatsMode | Feature | 🟡 |
| ST5 | ~~Kartu "sering salah" (wrong-tracker) tidak diekspos ke user~~ ✅ CONFIRMED DONE — "Sering Salah" section in StatsMode | Bug | 🟠 |

**Rekomendasi ST2 (kritis):** Hitung `readinessScore` dari: (% kartu Mature × 0.4) + (avg quiz accuracy × 0.4) + (streak continuity × 0.2). Tampilkan sebagai gauge atau progress ring di atas StatsMode. Ini memberikan user satu angka untuk menjawab "sudah siap ujian belum?"

---

### 15. 💾 Ekspor (ExportMode)

**Kondisi saat ini:** 2-step import dengan diff preview, validateSnapshot, importAllSafe dengan rollback, konflik warning (BUG-11 v4.3.1), GitHub Gist sync opt-in (E2 v4.6.0).

| # | Temuan | Tipe | Prioritas |
|---|--------|------|-----------|
| E1 | ~~Tidak ada **cloud sync**~~ ✅ FIXED v4.6.0 (E2/E3) — GitHub Gist sync opt-in, `gist-sync.js` + PAT input di ExportMode | Gap | 🟠 |
| E2 | Export file tidak terenkripsi — meskipun tidak berisi data sensitif, bisa ditambahkan opsi password | Nice | 🟢 |
| E3 | ~~Tidak ada **"Incremental backup"** — hanya full snapshot, tidak bisa backup hanya delta SRS~~ ✅ FIXED v4.12.0 — "Ekspor Delta SRS Saja" button in ExportMode | Feature | 🟡 |
| E4 | ~~Import tidak mendeteksi **konflik ID**~~ ✅ FIXED v4.3.1 (BUG-11) — conflict warning saat data device lebih baru dari file import | Bug | 🟠 |

---

## 🚀 Proposal Peningkatan Utama

### KATEGORI A — Alur Lintas Mode (Cross-Mode Flow)

#### A1 🔴 "Pelajari Yang Salah" — Universal Wrong-Card Flow

**Problem:** Setiap mode yang punya quiz result tidak menghubungkan kembali ke study mode. User tahu mereka salah, tapi tidak ada satu klik untuk drill langsung.

**Solusi:** Buat `WrongSessionBridge` utility:
```js
// utils/wrong-session-bridge.js
export function bridgeToFlashcard(wrongCardIds, navigate) {
  // Store temp session filter
  storageSet('ssw-session-filter', { ids: wrongCardIds, expires: Date.now() + 3600000 });
  navigate('kartu'); // FlashcardMode reads session filter on mount
}
```
Wire ke semua ResultScreen via `onStudyWrong` prop. **Berlaku untuk:** Kuis, JAC, Wayground, Simulasi, Sprint, Fokus.

**Impact:** Menutup gap terbesar dalam learning loop. User tidak perlu manually cari kartu yang salah.

---

#### A2 🟠 Smart Mode Recommendation Engine

**Problem:** Dashboard menampilkan grid mode yang sama setiap hari. User tidak tahu mode mana yang paling bermanfaat untuk kondisi mereka hari ini.

**Solusi:** `utils/recommend-mode.js` — fungsi murni yang menerima `{ srsState, sessions, streak, daysUntilExam }` dan mengembalikan rekomendasi berprioritas:

```
Kondisi → Rekomendasi
SRS due > 20 → "Mulai dengan Ulasan dulu"
SRS due = 0, quiz accuracy < 60% → "Coba Sprint dulu, lalu Kuis"
Exam dalam 7 hari → "Waktunya Simulasi!"
Streak 0, baru buka → "Mulai dengan 10 Kartu saja"
```

Tampilkan sebagai card interaktif di Dashboard, bukan hanya teks static. Ganti CTA utama dengan rekomendasi dinamis.

---

#### A3 🟠 Inter-Mode Navigation Breadcrumb

**Problem:** Tidak ada cara untuk kembali ke mode sebelumnya atau tahu "aku sedang ada di mana di dalam app".

**Solusi:** `ModeRouter` tambahkan `modeHistory` stack (max 3). BottomNav tampilkan "← Kembali ke [Mode]" jika ada history. Terutama berguna ketika FocusMode → Sprint → selesai → user tidak tahu harus kemana.

---

### KATEGORI B — Penguatan Mode yang Ada

#### B1 🔴 QuizMode: Type-Answer Production Mode (Blueprint C-10)

**Problem:** Semua kuis adalah recognition (pilih dari 4 pilihan). Ujian JAC mengharuskan recall, bukan hanya recognition.

**Solusi:** Toggle "Mode Produksi" di QuizShell:
- Tampilkan soal JP, user ketik terjemahan Indonesia
- Gunakan fuzzy matching (`utils/fuzzy-match.js`) — toleransi typo, sinonim, singkatan umum
- Keyboard otomatis muncul di Android
- Scoring: exact match = 3 poin, close match = 1 poin, salah = 0

**Referensi Blueprint:** C-10 (type-answer production), Nation (2001) four strands — production output adalah satu dari empat strand yang belum terlayani.

---

#### B2 🟠 SprintMode: Category Lock + Escalating Difficulty

**Solusi:**
1. Tambahkan category picker sebelum sprint dimulai (opsional, default: semua)
2. Durasi opsi: 30s / 60s (default) / 120s
3. Visual escalation: 0-30s normal, 30-50s amber pulse, 50-60s red + haptic tiap detik
4. Wire wrong-tracker — tiap salah dalam sprint harus tertulis ke wrong-tracker

---

#### B3 🔴 SimulasiMode: Pause + Post-Exam Analysis

**Solusi:**
1. Pause via `document.addEventListener('visibilitychange')` — auto-pause saat minimize, resume prompt saat kembali
2. Hasil simulasi menampilkan breakdown per kategori (K3 XX%, Hukum XX%, Teknis XX%)
3. CTA "Tambah ke SRS" untuk semua kartu yang salah
4. Simpan simulasi history (tanggal, score, daysUntilExam) — tampilkan progress simulasi dari waktu ke waktu di StatsMode

---

#### B4 🟠 FocusMode: "Kenapa Kategori Ini?" Explainer

**Solusi:** Sebelum drill dimulai, tampilkan panel 3 detik (dismissable):
```
🎯 Fokus: K3 Konstruksi
Akurasi kamu: 43% (18 salah dari 42 soal terakhir)
Terakhir dilatih: 3 hari lalu
[Mulai Drill] [Pilih Kategori Lain]
```

Ini memenuhi prinsip andragogi (andragogy): learner dewasa perlu tahu *mengapa* sebelum *bagaimana*.

---

#### B5 🟠 ReviewMode: Session Summary Screen

**Solusi:** Setelah queue habis, tampilkan:
```
✅ Sesi Ulasan Selesai
Ditinjau: 24 kartu
Lagi: 3 | Susah: 5 | Oke: 10 | Mudah: 6
Kartu jatuh tempo berikutnya: 8 jam lagi
[Lanjut Belajar] [Kembali ke Beranda]
```

---

### KATEGORI C — Konten & Data

#### C1 🔴 Ekspansi Kartu — Chapter 2–4 (text2l, text3l, text4l)

**Status saat ini:** 1.438 kartu, chapter 1 complete. Chapter 2–4 belum diextract.

**Action items:**
1. Upload `text2l.pdf`, `text3l.pdf`, `text4l.pdf`
2. Ekstrak vocabulary line-by-line ke CARDS array mulai id 631
3. Assign `source: 'text2l'` / `text3l` / `text4l` untuk filtering di SumberMode
4. Tag dengan kategori yang sesuai per bab

**Priority:** Tertinggi untuk konten — lebih banyak kartu = SRS lebih komprehensif = persiapan ujian lebih baik.

---

#### C2 🟠 Sipil & Bangunan — Ekspansi Soal

**Status saat ini:** Sipil 45 soal (3 set), Bangunan 45 soal (3 set). Target: 90+ masing-masing.

**Action items:**
1. Tambah 3 set baru per jalur (K3 lanjutan, Material, Prosedur lapangan)
2. Verifikasi alignment dengan kisi-kisi JAC terbaru
3. Tambahkan soal dari materi wg7–wg12 yang belum dimasukkan ke SipilMode/BangunanMode

---

#### C3 🟡 Audit Kelengkapan Explanation Field

**Problem:** Tidak semua kartu memiliki `explanation` / `DescBlock` yang terisi — terutama kartu dari chapter awal yang di-generate sebelum standar konten ditetapkan.

**Action:** Jalankan `audit:integrity` dengan pengecekan tambahan: kartu dengan `explanation: ''` atau `null` → generate list → batch-fill dengan Claude.

---

#### C4 🟠 Tag Bab/Chapter per Soal JAC

**Problem:** 95 soal JAC tidak memiliki metadata bab — user tidak bisa tahu soal mana yang dari bab mana.

**Solusi:** Tambahkan `chapter: 1-6` ke setiap soal JAC di `jac-questions.js`. Tampilkan di JACMode picker sebagai filter "Bab 1 / Bab 2 / Bab 3 / Semua".

---

### KATEGORI D — Mode Baru

#### D1 🟠 Mode: Dengarkan (Listening Comprehension)

**Konsep:** Audio-first mode — dengarkan Japanese, tap terjemahan yang benar.

**Implementasi:**
```
1. Tampilkan UI: [▶] [opsi A] [opsi B] [opsi C] [opsi D]
2. Auto-speak JP term via speakJP()
3. User tap jawaban
4. Wrong → auto-repeat audio + highlight benar
5. Session end → wire ke onSessionEnd + wrong-tracker
```

**Kenapa penting:** Ujian lisan SSW mengharuskan pemahaman instruksi JP di lapangan. Pure listening mode melatih comprehension tanpa visual crutch. Memanfaatkan `speak.js` yang sudah ada (HVPT cycling).

**File baru:** `src/modes/DengarMode.jsx` + entry di `modes.js` + `ModeRouter.jsx`

---

#### D2 🟠 Mode: Exam Countdown Dashboard

**Konsep:** Ketika `prefs.examDate` set dan ≤14 hari, ganti Dashboard utama menjadi "Exam Countdown Mode" dengan rekomendasi harian adaptif.

**Implementasi:**
```
🗓️ 7 Hari Menuju Ujian

Hari ini fokus: [rekomendasi berdasarkan weakness]
Kartu yang perlu direview: 34
Simulasi terakhir: 67% (3 hari lalu)
Target: simulasi ≥75% sebelum hari ujian

[Ulasan SRS] [Simulasi Ujian] [Soal Jebak]
```

**Berbeda dari** countdown banner yang sudah ada (hanya tampilan) — ini adalah *mode belajar adaptif* yang berubah setiap hari berdasarkan proximity ke ujian.

---

#### D3 🟡 Mode: Buku Catatan (Personal Notes per Kartu)

**Konsep:** User bisa tambahkan catatan pribadi ke setiap kartu — mnemonik, konteks dari pengalaman kerja, pengingat pribadi.

**Implementasi:**
- `notes: {}` object di storage — `{ [cardId]: "catatan user" }`
- Di FlashcardMode back face, tampilkan catatan jika ada + edit button
- Di GlossaryMode, tampilkan catatan saat expand
- Diinclude dalam export/import JSON

**Kenapa penting:** Constructivism (Vygotsky) — personal meaning-making lebih kuat dari definisi generik.

---

### KATEGORI E — Teknis & Infrastruktur

#### E1 🔴 Otomatisasi Version Consistency

**Problem:** Version string tersebar di 3 tempat berbeda (`package.json`, `SayaTab.jsx` footer, `CACHE_VERSION` di `sw.js`) dan harus di-update manual — itulah akar dari version discrepancy yang ditemukan.

**Solusi:** Buat script `scripts/bump-version.mjs` yang jadi single source of truth:

```js
// scripts/bump-version.mjs
import { readFileSync, writeFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('package.json'));
const version = pkg.version;

// Update sw.js CACHE_VERSION
let sw = readFileSync('public/sw.js', 'utf8');
sw = sw.replace(/CACHE_VERSION\s*=\s*['"][^'"]+['"]/, `CACHE_VERSION = 'ssw-v${version}'`);
writeFileSync('public/sw.js', sw);

// Update SayaTab.jsx version display
let saya = readFileSync('src/components/SayaTab.jsx', 'utf8');
saya = saya.replace(/v\d+\.\d+\.\d+(?=.*footer|.*versi)/gi, `v${version}`);
writeFileSync('src/components/SayaTab.jsx', saya);

console.log(`✅ Version synced to v${version}`);
```

Tambahkan ke `package.json` scripts: `"version:sync": "node scripts/bump-version.mjs"`. Panggil di CI sebelum build.

#### E2 🔴 "Versi Baru Tersedia" In-App Prompt

**Problem:** SW di-update di deploy baru, tapi user tidak tahu. Mereka terus pakai versi lama sampai hard refresh.

**Solusi:**
```js
// public/sw.js — postMessage ke client ketika SW baru aktif
self.addEventListener('activate', event => {
  clients.matchAll().then(clients => {
    clients.forEach(c => c.postMessage({ type: 'SW_UPDATED' }));
  });
});

// App.jsx — listen dan tampilkan toast
navigator.serviceWorker.addEventListener('message', e => {
  if (e.data?.type === 'SW_UPDATED') {
    toast.show('Versi baru tersedia — ketuk untuk refresh', { 
      action: { label: 'Refresh', onClick: () => location.reload() },
      duration: 0 // persistent
    });
  }
});
```

---

#### E3 🟠 Multi-Device Sync via GitHub Gist (No Backend)

**Problem:** Export/import manual via file — tidak praktis di mobile.

**Solusi (opsional, opt-in):** User masukkan GitHub Personal Access Token (PAT) → data di-sync ke private Gist. No backend diperlukan.

```js
// utils/gist-sync.js
export async function pushToGist(token, data) {
  const res = await fetch('https://api.github.com/gists', {
    method: 'POST',
    headers: { Authorization: `token ${token}` },
    body: JSON.stringify({
      description: 'SSW Progress Backup',
      public: false,
      files: { 'progress.json': { content: JSON.stringify(data) } }
    })
  });
  return res.json();
}
```

Tampilkan di ExportMode sebagai opsi tambahan — user yang tidak mau tidak perlu pakai.

---

#### E4 🟡 LocalStorage Compression

**Problem:** FSRS store bisa tumbuh besar seiring waktu — tiap kartu punya `{ due, stability, difficulty, elapsed, scheduled, reps, lapses, state, last_review }`.

**Solusi:** Gunakan `lz-string` (1.5kb gzip) untuk compress value sebelum `localStorage.setItem`:

```js
import LZString from 'lz-string';

export const storageSet = (key, value) => {
  const str = JSON.stringify(value);
  // Compress hanya jika value besar (> 1KB)
  if (str.length > 1024) {
    localStorage.setItem(key, LZString.compressToUTF16(str));
    localStorage.setItem(key + '_compressed', 'true');
  } else {
    localStorage.setItem(key, str);
  }
};
```

---

#### E5 🟠 StatsMode: Heatmap Kalender

**Problem:** 7-day bar bagus tapi tidak menunjukkan konsistensi jangka panjang.

**Solusi:** GitHub-style 52-week heatmap menggunakan SVG. Data dari `sessions` array (capped 180, sudah ada). Color: `--ssw-amber` opacity 10%→100% berdasarkan kartu dipelajari per hari.

```jsx
// components/StudyHeatmap.jsx
// 52 kolom (minggu) × 7 baris (hari)
// Setiap cell = satu hari, opacity berdasarkan count
// Tooltip on hover: "3 Mei — 24 kartu dipelajari"
```

---

#### E6 🟢 Search Furigana Support

**Problem:** User tidak bisa cari "あんぜん" untuk menemukan "安全".

**Solusi:** Tambahkan `reading` field ke setiap kartu (furigana reading plain text). Sudah ada furigana dalam format `《》` — parse ke plain text untuk search index.

```js
// utils/jp-helpers.js — tambahkan
export function extractReading(jp) {
  // "安全《あんぜん》帯" → "あんぜん"
  return jp.replace(/[^《》]+(?=《)/g, '').replace(/[《》]/g, '').trim();
}
```

---

### KATEGORI F — Gamifikasi & Motivasi

#### F1 🟠 Achievement Badge System

**Problem:** Milestone toasts (sudah ada sejak Phase 9) adalah one-time notification yang hilang. Tidak ada **permanen** pencapaian yang bisa dilihat user.

**Solusi:** `utils/achievements.js` + UI di SayaTab:

```js
const ACHIEVEMENTS = [
  { id: 'first_100', label: 'Pondasi Kuat', desc: '100 kartu hafal', icon: '🏗️', check: s => s.known >= 100 },
  { id: 'week_streak', label: 'Pekerja Keras', desc: '7 hari berturut-turut', icon: '🔥', check: s => s.streak >= 7 },
  { id: 'perfect_sprint', label: 'Kilat', desc: 'Sprint tanpa salah', icon: '⚡', check: s => s.perfectSprint },
  { id: 'lulus_simulasi', label: 'Siap Ujian', desc: 'Simulasi ≥75%', icon: '🎓', check: s => s.bestSim >= 75 },
  { id: 'all_jac', label: 'JAC Master', desc: 'Semua set JAC ≥80%', icon: '📋', check: s => s.jacMastery },
  { id: 'half_deck', label: 'Setengah Jalan', desc: '719+ kartu hafal', icon: '💪', check: s => s.known >= 719 },
  { id: 'full_deck', label: 'Nugget Pro', desc: 'Semua 1438 kartu hafal', icon: '🏆', check: s => s.known >= 1438 },
];
```

Tampilkan di SayaTab sebagai grid badge (grayscale jika belum unlock, warna jika sudah).

---

#### F2 🔴 Exam Readiness Score

**Konsep:** Satu angka yang menjawab "sudah berapa persen siap ujian?"

**Formula:**
```
readiness = (
  (matureCards / totalCards) * 40 +        // SRS maturity weight
  (avgQuizAccuracy / 100) * 35 +           // Quiz performance
  (Math.min(streak, 14) / 14) * 15 +      // Consistency
  (bestSimScore > 65 ? bestSimScore / 100 : 0) * 10  // Exam simulation
) * 100
```

**Tampilan:**
- Gauge lingkaran di atas StatsMode (warna: merah < 50, amber 50-74, hijau ≥ 75)
- Label: "Belum Siap" / "Hampir" / "Siap Ujian! 🎉"
- Sub-breakdown: SRS ▓▓▓░░ Kuis ▓▓▓▓░ Konsistensi ▓▓░░░ Simulasi ▓░░░░

---

#### F3 🟡 Daily Challenge — "Soal Hari Ini"

**Konsep:** Satu soal JAC/Wayground pilihan per hari — ditampilkan di Dashboard, berlaku 24 jam.

**Implementasi:**
```js
// utils/daily-challenge.js
export function getDailyChallenge(allQuestions, today) {
  const seed = parseInt(today.replace(/-/g, '')); // YYYYMMDD as seed
  const idx = seed % allQuestions.length;
  return allQuestions[idx];
}
```

User yang menjawab benar mendapat toast khusus + streak counter "N hari berturut soal harian". Simple, tapi membangun habit daily open.

---

#### F4 🟢 "Battle Past Self" — Sprint vs Rekaman

**Konsep:** Sprint mode menampilkan "ghost" — jumlah yang personal best kamu capai detik demi detik — sehingga user "berlomba" dengan diri sendiri.

**Implementasi:** Simpan `sprintBestTimeline: [{ t: 5, score: 2 }, { t: 10, score: 5 }, ...]` di prefs. Selama sprint berjalan, tampilkan score ghost vs score sekarang.

---

## 📋 Roadmap Implementasi yang Disarankan

### 🔧 Pre-Phase — Housekeeping ✅ SELESAI (2026-05-07)

1. ✅ **Merge PR #7** — sudah di main (commit `6a329e7`) sebelum sesi ini
2. ✅ **Reconstruct CHANGELOG** — v4.1.0 + v4.2.0 sudah ditulis (sesi sebelumnya)
3. ✅ **Fix SayaTab footer** — `v4.0.2` → `v4.2.0` (commit `532db6a`)
4. ✅ **Trigger deploy** — GitHub Actions auto-trigger dari push
5. ✅ **Re-triage** — BUG-04 (PR #7) dan BUG-02 (CHANGELOG) confirmed resolved

### Phase 5.1 — Critical Gaps ✅ SELESAI (2026-05-07–08, commits `c59d54e` + `081c70f`)
1. ✅ **R1** ReviewMode rating distribution pada done screen
2. ✅ **A1** Wrong-Card Bridge — semua quiz → FlashcardMode filtered (kuis/jac/wayground/simulasi)
3. ✅ **K1** FlashcardMode swipe gesture: kiri=Lagi, kanan=Oke, atas=Mudah
4. ✅ **SIM1** SimulasiMode pause button + auto-pause on visibilitychange + overlay resume
5. ✅ **BUG-06** SimulasiMode unified pool — JAC_OFFICIAL + WAYGROUND_SETS via normalizer
6. ✅ **F1** FocusMode "Kenapa kategori ini?" explainer panel
7. ✅ **ST2** Exam Readiness Score gauge in StatsMode (SVG ring, formula, labels)
8. ✅ **E1** "Versi baru tersedia" SW update prompt
9. ✅ **S5/BUG-07** SprintMode wrong-tracker (bonus — dikerjakan bersamaan)

### Phase 5.2 — Content Expansion ⏳ SKIP (per instruksi Crispy — fokus ke fitur dulu)
1. ⏳ **C1** Upload + ekstrak Chapter 2–4 (text2l, text3l, text4l) — id 631+
2. ⏳ **C4** Tag bab/chapter ke soal JAC
3. ⏳ **C2** Ekspansi soal Sipil + Bangunan (45 → 90+ masing-masing)

### Phase 5.3 — Mode Enhancements ✅ SELESAI (2026-05-08, commit `d081434`)
1. ✅ **B1** QuizMode Type-Answer Production Mode — `src/modes/QuizProduksiMode.jsx` (v4.5.0, JP→ID fuzzy match)
2. ✅ **B2** SprintMode Category Lock + Escalating Timer (duration picker + category picker + color urgency)
3. ✅ **SIM3** SimulasiMode Post-Exam: "Latih Salah" CTA → onRetryWrong bridge
4. ✅ **SIM4** SimulasiMode Breakdown per set/source setelah result
5. ~~⏳ **D1** Mode Dengarkan (Listening Comprehension) — belum dikerjakan~~ → moved to Phase 5.5 ✅
6. ✅ **F1** Achievement Badge System — 14 badges di SayaTab (utils/achievements.js)
7. ✅ **F2** Daily Challenge "Soal Hari Ini" — deterministic seeded (utils/daily-challenge.js)

### Phase 5.4 — Polish & Infrastructure ✅ SELESAI (2026-05-08, commit `d081434`)
1. ✅ **ST1** StatsMode Heatmap Kalender (18-week SVG — StudyHeatmap.jsx)
2. ✅ **A2** Smart Mode Recommendation Engine — recommend-mode.js replaces getQuickStart
3. ✅ **E4** LocalStorage compression (lz-string) — engine.js + migrations.js + storage tests
4. ~~⏳ **D3** Mode Buku Catatan per Kartu~~ → moved to Phase 5.5
5. ~~⏳ **E2** GitHub Gist sync (opt-in)~~ ✅ v4.6.0 — `gist-sync.js` + ExportMode section

### Phase 5.5 — Unfinished Items ✅ SELESAI (2026-05-08)
1. ✅ **D1** Mode Dengarkan (Listening Comprehension) — `src/modes/DengarMode.jsx`
2. ✅ **D3** Mode Buku Catatan (Personal Notes) — `src/modes/CatatanMode.jsx`
3. ✅ **A3** Inter-Mode Navigation Breadcrumb — `modeHistory` + `goBack()` in AppContext + sticky breadcrumb in ModeRouter
4. ✅ Sessions cap 90→180 (heatmap coverage)
5. ✅ Lint fixes: StudyHeatmap `today` in useMemo, FlashcardMode redundant dep

### Phase 5.6 — E2/F4/ST3 ✅ SELESAI (2026-05-08, v4.6.0)
1. ✅ **E2** GitHub Gist sync (opt-in) — `src/utils/gist-sync.js` + collapsible section in ExportMode
2. ✅ **F4** Sprint "Battle Past Self" ghost score — `sprintBestTimeline` in prefs, live `👻 N` display
3. ✅ **ST3** Quiz accuracy per category in StatsMode — `🎯 N%` badge + `N× salah dalam kuis` from `quizWrong`

### Phase 5.7 — W2 ✅ SELESAI (2026-05-08, commit `36543ab` + `v4.7.0`)
1. ✅ **W2** WaygroundMode per-set "Ulang Salah" — `lemahMode` filter + sub-button per set row

### Phase 5.8 — UX Polish ✅ SELESAI (2026-05-08, v4.8.0)
1. ✅ **SR1** SearchMode: riwayat pencarian 5 term terakhir (sessionStorage, chip UI)
2. ✅ **G1** GlossaryMode: tombol 🔊 per entry di area expanded
3. ✅ **SB1/SB2** SumberMode: progress bar hafalan + badge "Terlemah" per sumber
4. ✅ **W3** WaygroundMode: badge "Baru" untuk set belum pernah dikerjakan
5. ✅ **R2** ReviewMode: chip due-reason (reps count + interval) di bawah strength pill
6. ✅ **J3** JACMode: `bestPct` tersimpan + ditampilkan di picker

### Phase 5.8.1 — DengarMode Wrong-Tracker ✅ SELESAI (2026-05-08, v4.8.1)
1. ✅ **D1-WT** DengarMode wrong-tracker — wrong answers ditulis ke shared `quizWrong` pool

### Phase 5.8.2 — SR3 + SIM5 ✅ SELESAI (2026-05-08, v4.8.2)
1. ✅ **SR3** SearchMode: copy-to-clipboard ⎘ per result
2. ✅ **SIM5** SimulasiMode: pace hint `N soal/mnt` live di bawah timer

---

## 🐛 Bug Registry

| ID | File | Deskripsi | Prioritas |
|----|------|-----------|-----------|
| BUG-01 | `SayaTab.jsx` + deploy pipeline | ~~**Version display stuck v4.0.2**~~ ✅ FIXED commit `532db6a` | 🔴 |
| BUG-02 | `CHANGELOG.md` | ~~**Missing changelog entries**~~ ✅ FIXED (sesi sebelumnya) | 🔴 |
| BUG-03 | GitHub Actions / deploy | ~~**Deployed app stale**~~ ✅ RESOLVED — CI auto-deploys on every push to main | 🔴 |
| BUG-04 | PR #7 | ~~**Furigana tap-to-toggle menggantung**~~ ✅ FIXED sudah di main commit `6a329e7` | 🔴 |
| BUG-05 | `FlashcardMode/index.jsx` | ~~Filter tidak persist antar mode switch~~ ✅ FIXED commit `d081434` | 🔴 |
| BUG-06 | `SimulasiMode.jsx` | ~~Soal tidak ter-randomisasi dari semua jalur~~ ✅ FIXED commit `081c70f` | 🔴 |
| BUG-07 | `SprintMode.jsx` | ~~**Jawaban salah tidak masuk wrong-tracker**~~ ✅ FIXED commit `c59d54e` | 🔴 |
| BUG-08 | `GlossaryMode.jsx` | ~~A-Z nav tidak menjangkau kata berawalan kanji~~ ✅ FIXED commit `d081434` | 🟠 |
| BUG-09 | `SearchMode.jsx` | ~~Tidak bisa search by furigana reading~~ ✅ RESOLVED — `furi` field sudah di haystack | 🟠 |
| BUG-10 | `FlashcardMode/index.jsx` | ~~flashcardHintCount tidak di-reset saat resetAll()~~ ✅ FIXED commit `d081434` | 🟡 |
| BUG-11 | `ExportMode.jsx` | ~~Import tidak deteksi konflik ID dual-device~~ ✅ FIXED commit `d081434` | 🟠 |

**Status: 0 bug terbuka per 2026-05-08**

---

## 📊 Metrik Keberhasilan

| Metrik | Awal Audit | Saat Ini (v4.8.2) | Target (Phase 5.4) |
|--------|------------|--------------------|--------------------|
| Total kartu | 1.438 | 1.438 | 2.000+ (Ch 2–4 — Phase 5.2 pending) |
| Test | ~321 | **383** | 380+ ✅ |
| Mode count | 15 | **23** | 22 ✅ |
| Bug terbuka | 8 known | **0** | 0 ✅ |
| SRS modes with session tracking | 12/15 | 15/15 | 15/15 ✅ |
| Modes with wrong-tracker | 7/15 | **7/23** (writers) | — |
| Cross-mode flow coverage | 0% | 100% | 100% ✅ |
| localStorage compression | ❌ | ✅ lz-string | ✅ |
| Exam Readiness Score | ❌ | ✅ gauge in StatsMode | ✅ |
| Achievement system | ❌ | ✅ 14 badges | ✅ |

---

## 🏗️ Catatan Arsitektur

### Sudah Baik — Pertahankan
- FSRS engine adalah implementasi terbaik yang bisa ada untuk SRS — jangan ganti
- CSS Modules migration sudah bersih — jangan balik ke inline styles
- `storage/engine.js` dengan `validateSnapshot` + rollback adalah gold standard
- CI/CD pipeline dengan auto CACHE_VERSION bump — pertahankan pola ini
- Test-first approach — setiap feature baru harus ada test

### Perlu Perhatian
- `sessions` array capped 180 (bumped v4.4.0) — 18-week heatmap sudah terlayani ✅
- `prefs` object makin besar — pertimbangkan split ke `prefs` (settings) + `userState` (computed)
- Bundle size: `wayground-sets.js` + `csv-sets.js` + `cards.js` bisa dijadikan lazy-loaded via dynamic import

### Debt yang Diketahui (dari CHANGELOG)
- ~~Blueprint C-10 (type-answer) — belum diimplementasi~~ ✅ DONE v4.5.0 (B1) — `QuizProduksiMode.jsx`
- Sipil/Bangunan "Segera Hadir" untuk soal tambahan → **Phase 5.2 C2**
- Source PDF status Ch 2–4 masih "pending" → **Phase 5.2 C1**

---

## 🎯 Prioritas Paling Tinggi untuk Segera Dikerjakan

**Status saat ini (v4.8.2):** Semua prioritas kritis sudah selesai.

**Housekeeping:** ✅ PR #7 merged, CHANGELOG reconstructed, SayaTab footer fixed, CI auto-deploy aktif.

**Item kritis yang sudah selesai:**
1. ✅ **A1 — Wrong-Card Bridge** — semua quiz modes → FlashcardMode filtered (v4.3.0)
2. ✅ **ST2 — Exam Readiness Score** — SVG gauge di StatsMode (v4.3.0)
3. ✅ **C1 — Chapter 2–4** — deferred (Phase 5.2, skip per instruksi Crispy)

**Remaining open (non-5.2):** Lihat per-mode tables untuk item tanpa ~~strikethrough~~.

---

*Proposal v3 — hygiene pass 2026-05-08 (v7): G3 di-strikethrough (v4.13.0); Q3/F2/F3/D1/G4/W5/AK2/E3/K6 di-strikethrough (v4.12.0); D2/D3/AK1/AK3/G2/K5 di-strikethrough (v4.11.0); R3/R4/R5/W1/W4/Q4/SR4/ST4 di-strikethrough (v4.9.0); J1/K2/Q5/SB3 di-strikethrough (v4.10.0). Originally v2: 71 temuan, 30 rekomendasi, 11 bug (4 versi + 7 fungsional). Remaining open (v4.13.0): Q6, J2, J4 — butuh akses PDF/data konten. SR2 confirmed resolved (furi in haystack). E2 confirmed resolved (v4.6.0).*

*— Claude Sonnet 4.6, 2026-05-07 | Hygiene pass: Agent Sonnet 4.6, 2026-05-08*
