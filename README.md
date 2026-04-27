# 🇯🇵 Nugget Nihongo — SSW Konstruksi

Aplikasi belajar untuk **Ujian SSW (Specified Skilled Worker) Konstruksi Jepang** — flashcard, kuis, dan simulasi ujian dalam Bahasa Indonesia.

## 📊 Konten

| Tipe | Jumlah |
|------|--------|
| Kartu Flashcard | ~1.438 |
| Soal JAC Official | ~95 |
| Soal Wayground/Sensei | ~598 (12 set) |
| Angka Kunci | ~45 |
| Pasangan Jebak | ~40+ |
| Kategori | 12 |

## 🎮 Mode Belajar

- **Kartu** — Flashcard interaktif dengan swipe & marking
- **Kuis** — Kuis otomatis 3 tingkat kesulitan
- **JAC Official** — Soal resmi dari contoh ujian JAC
- **Simulasi** — Simulasi ujian penuh dengan timer
- **Wayground** — 12 set soal teknis
- **Sprint** — Drill kecepatan
- **Fokus** — Latihan kelemahan otomatis
- **Soal Jebak** — Pasangan istilah mirip
- **Angka** — Angka kunci wajib hafal
- **Glosari** — Kamus lengkap terurut
- **Cari** — Pencarian cepat
- **Sumber** — Jelajahi per PDF sumber

## 🏗️ Arsitektur

```
src/
├── App.jsx          # Komponen utama
├── data/            # Semua data konten
├── modes/           # Komponen per mode (13 file)
├── components/      # Komponen shared (JpFront, DescBlock)
├── hooks/           # Custom hooks (usePersistedState, useQuizKeyboard, useStreak)
├── utils/           # Utility functions (shuffle, stripFuri, quiz-generator)
└── styles/          # Design tokens & theme
```

Lihat `_MAP.md` untuk orientasi lengkap dan `docs/PROPOSAL.md` untuk roadmap refaktor.

## 📜 Versi Sebelumnya

- **v87 (live):** https://nuggetenak.github.io/Nugget-Nihongo-SSW-Konstruksi-v87/
- **v87 (monolith):** `legacy/ssw_flashcards_v87.jsx`

## 📝 Sumber Konten

Konten berasal dari PDF resmi [JAC](https://global.jac-skill.or.jp/indonesia/examination/documents.php), materi Wayground dari sensei, dan kosakata yang di-generate oleh Claude.

## 🙏 Credit

Dibuat oleh **Nugget** dengan bantuan **Claude (Crispy)** — untuk para calon pekerja SSW Konstruksi Indonesia.
