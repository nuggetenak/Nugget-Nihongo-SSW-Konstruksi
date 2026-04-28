# 🪖 SSW Konstruksi · by Nugget Nihongo

> **Aplikasi belajar Ujian SSW Konstruksi Jepang** — flashcard, kuis, simulasi ujian, dan sistem ulang cerdas (SRS) dalam Bahasa Indonesia.

[![GitHub Pages](https://img.shields.io/badge/Deploy-GitHub%20Pages-222?logo=github)](https://nuggetenak.github.io/Nugget-Nihongo-SSW-Konstruksi/)
[![PWA](https://img.shields.io/badge/PWA-Installable-F59E0B?logo=pwa)](https://nuggetenak.github.io/Nugget-Nihongo-SSW-Konstruksi/)

---

## 📱 Install Aplikasi

Buka di browser → ketuk **"Tambahkan ke Layar Utama"** (iOS/Android) atau ikon install di desktop.
App berjalan offline setelah pertama kali dibuka.

---

## 📊 Konten

| Tipe | Jumlah |
|------|--------|
| Kartu Flashcard | 1.438 |
| Soal JAC Official | ~95 |
| Soal Wayground/Sensei | ~598 (12 set) |
| Angka Kunci | ~45 |
| Pasangan Jebak | ~40 |
| Kategori | 12 |
| Jalur Belajar | 3 (土木 / 建築 / ライフライン) |

---

## 🎯 Jalur Belajar (Track)

Pilih jalur sesuai bidang spesialisasimu — konten otomatis terfilter:

| Jalur | Bidang |
|-------|--------|
| 🏗️ **Teknik Sipil** (土木) | Jalan, jembatan, terowongan, bendungan |
| 🏢 **Bangunan** (建築) | Gedung, bekisting, tulangan, finishing |
| ⚡ **Lifeline & Peralatan** (ライフライン) | Listrik, pipa, HVAC, pemadam, telekomunikasi |

Materi **keselamatan, hukum, KY, 5S, karier** otomatis muncul di semua jalur.

---

## 🎮 Mode Belajar

### Tab Belajar
| Mode | Keterangan |
|------|-----------|
| 🔁 **Ulasan SRS** | Kartu yang jatuh tempo hari ini — diurutkan dari yang paling terlupakan |
| 🃏 **Kartu** | Flashcard dengan 4-tombol FSRS rating setelah flip |
| ❓ **Kuis** | Kuis pilihan ganda otomatis, 3 tingkat kesulitan |
| ⚡ **Sprint** | Drill kecepatan 60 detik |
| 🎯 **Fokus** | Latihan otomatis per kategori terlemah |

### Tab Ujian
| Mode | Keterangan |
|------|-----------|
| 📋 **JAC Official** | ~95 soal resmi dari contoh ujian JAC |
| 🎓 **Wayground** | 598 soal teknis dari sensei (12 set) |
| 🎯 **Simulasi** | Simulasi ujian penuh dengan timer |
| 🔢 **Angka Kunci** | Angka-angka wajib hafal |
| ⚠️ **Soal Jebak** | Pasangan istilah yang sering tertukar |

### Tab Lainnya
| Mode | Keterangan |
|------|-----------|
| 🔍 **Cari** | Pencarian cepat JP/romaji/Indonesia |
| 📖 **Glosari** | Kamus lengkap terurut |
| 📂 **Sumber** | Jelajahi kartu per PDF sumber |
| 📊 **Statistik** | Progress, kelemahan, kartu sering salah |
| 💾 **Ekspor** | Backup & pulihkan progress ke file JSON |

---

## 🧠 Sistem SRS (Spaced Repetition)

Menggunakan algoritma **FSRS (Free Spaced Repetition Scheduler)** — lebih akurat dari SM-2/Anki klasik.

Setelah flip kartu, nilai pemahamanmu:

| Tombol | Rating | Jadwal Ulang |
|--------|--------|-------------|
| 🔴 Lagi  | 1 | Hari ini lagi |
| 🟠 Susah | 2 | Lebih pendek |
| 🟢 Oke   | 3 | Interval normal |
| 💎 Mudah | 4 | Interval lebih panjang |

Progress tersimpan di `localStorage` browser. Gunakan **Ekspor** untuk backup/pindah perangkat.

---

## 💾 Progress & Offline

- **Tersimpan di:** `localStorage` browser (tidak perlu akun)
- **Backup:** Tab Lainnya → 💾 Ekspor → download file JSON
- **Pindah perangkat:** Ekspor di perangkat lama → Impor di perangkat baru
- **Offline:** Setelah pertama kali dibuka, app bisa dipakai tanpa internet (Service Worker)

---

## 🏗️ Arsitektur

```
src/
├── App.jsx              # Root: onboarding → track picker → main UI
├── data/                # Konten (cards, JAC, Wayground, categories)
├── srs/                 # SRS engine (fsrs-core, fsrs-store, fsrs-scheduler)
├── modes/               # 15 mode components
├── components/          # Shared UI (Dashboard, TrackPicker, BottomNav, ...)
├── hooks/               # usePersistedState, useSRS, useQuizKeyboard, useStreak
├── utils/               # shuffle, jp-helpers, wrong-tracker, quiz-generator
└── styles/              # Design tokens (theme.js)

public/
├── manifest.webmanifest # PWA manifest
├── sw.js                # Service worker
├── favicon.ico / .png   # Favicon
└── icons/               # PWA icons 72–512px
```

Lihat [`_MAP.md`](./_MAP.md) untuk orientasi lengkap bagi agen/developer.

---

## 🚀 Deploy

```bash
npm install
npm run build
# → deploy isi dist/ ke GitHub Pages
```

> ⚠️ Setelah deploy baru, bump `CACHE_VERSION` di `public/sw.js` agar pengguna mendapat versi terbaru.

---

## 🧾 Audit & Administratif

- Audit komprehensif terbaru: [`docs/AUDIT-2026-04-28.md`](./docs/AUDIT-2026-04-28.md)
- Audit pass 2 (agresif): [`docs/AUDIT-2026-04-28-PASS2.md`](./docs/AUDIT-2026-04-28-PASS2.md)
- Riwayat perubahan: [`CHANGELOG.md`](./CHANGELOG.md)
- Jalankan baseline audit lokal:

```bash
npm run audit:baseline
npm run audit:integrity
npm run audit:full
```

---

## 📜 Versi Sebelumnya

- **v87 (live):** https://nuggetenak.github.io/Nugget-Nihongo-SSW-Konstruksi-v87/
- **v87 (source):** `legacy/ssw_flashcards_v87.jsx` (7.390 baris, referensi saja)

---

## 📝 Sumber Konten

Konten berasal dari PDF resmi [JAC](https://global.jac-skill.or.jp/indonesia/examination/documents.php), materi Wayground dari sensei, dan kosakata yang di-generate oleh Claude.

---

## 🤝 Credit

Dibuat oleh **Nugget** dengan bantuan tim agen Claude:
- **Crispy** (Agent 1 / Integrator) — arsitektur, data normalization, UX
- **Crunchy** (Agent 6 / QA) — bug fixes, SRS engine, PWA, storage overhaul
