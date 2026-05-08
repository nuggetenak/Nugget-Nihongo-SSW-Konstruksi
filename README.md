# 🏗️ Nugget Nihongo — SSW Konstruksi

**Aplikasi belajar ujian SSW Konstruksi Jepang untuk tenaga kerja Indonesia.**

土木 · 建築 · ライフライン設備

🔗 **[Buka Aplikasi](https://nuggetenak.github.io/Nugget-Nihongo-SSW-Konstruksi/)**

---

## Apa Ini?

PWA (Progressive Web App) untuk persiapan ujian Specified Skilled Worker (特定技能 / SSW) bidang konstruksi Jepang. Dirancang untuk TKI yang bersiap kerja di Jepang sebagai pekerja konstruksi.

**Fitur utama:**
- 🃏 **1,438 flashcard** dengan SRS (Spaced Repetition / FSRS) — hafal lebih efisien
- ❓ **~860 soal kuis** — format JAC, Wayground, CSV, Sipil, Bangunan
- 🎯 **Simulasi ujian** dengan timer dan penilaian lulus/tidak
- ⚠️ **Soal Jebak** — pasangan kata yang sering tertukar
- 🔢 **Angka Kunci** — angka wajib hafal sebelum ujian
- 📊 **Statistik** per kategori + riwayat belajar 7 hari
- 🌙 **Mode gelap/terang** + offline-first (PWA)
- 🔊 **Audio bahasa Jepang** via Web Speech API

**3 Jalur Studi:**
| Jalur | 日本語 | Fokus |
|-------|-------|-------|
| Teknik Sipil | 土木 | Pekerjaan tanah, infrastruktur |
| Bangunan | 建築 | Gedung, bekisting, beton |
| Lifeline | ライフライン設備 | Listrik, pipa, AC, telekomunikasi |

---

## Install Aplikasi (PWA)

1. Buka di browser HP: `https://nuggetenak.github.io/Nugget-Nihongo-SSW-Konstruksi/`
2. Tap **"Tambahkan ke Layar Utama"** (Android) atau **"Add to Home Screen"** (iOS)
3. Buka dari ikon — bisa dipakai offline setelah pertama kali dibuka

---

## Development

### Prasyarat
- Node.js 22+
- npm

### Setup
```bash
git clone https://github.com/nuggetenak/Nugget-Nihongo-SSW-Konstruksi.git
cd Nugget-Nihongo-SSW-Konstruksi
npm install
npm run dev        # dev server → http://localhost:5173/Nugget-Nihongo-SSW-Konstruksi/
```

### Perintah
```bash
npm run dev           # Dev server dengan HMR
npm run build         # Production build → dist/
npm run preview       # Preview build lokal
npm test              # Jalankan semua test (383+ test cases)
npm run test:watch    # Test mode watch
npm run lint          # ESLint (0 warnings required)
npm run lint:fix      # Auto-fix ESLint
npm run format        # Prettier format
npm run validate      # lint + test + build
npm run audit:integrity  # Audit integritas data kartu
```

### Stack
| Layer | Teknologi |
|-------|-----------|
| Framework | React 19 |
| Build | Vite 6 + @vitejs/plugin-react |
| SRS Engine | ts-fsrs 5.3 |
| Storage | Pure localStorage (schema v3) |
| Tests | Vitest 4 + @testing-library/react |
| Styling | CSS Modules + CSS custom properties |
| CI/CD | GitHub Actions → GitHub Pages |
| PWA | Custom service worker + Web App Manifest |

**Prod dependencies: 4** (react, react-dom, ts-fsrs, lz-string) — hard constraint.

---

## Struktur Proyek

```
src/
├── App.jsx                  # Root, 3-tab layout
├── contexts/                # AppContext, ProgressContext, SRSContext
├── data/                    # Flashcard & quiz data (1,438 cards + ~860 questions)
│   └── source/              # 8 source files (CS-01 split)
├── srs/                     # FSRS engine (fsrs-core, fsrs-store, fsrs-scheduler)
├── storage/                 # localStorage engine, schema v3, migrations
├── hooks/                   # useAnswerStreak, useDebounce, useFocusTrap, useSRS, …
├── components/              # Shared UI components
├── modes/                   # 23 mode screens (all React.lazy)
│   └── FlashcardMode/       # Decomposed flashcard mode
├── router/                  # ModeRouter + modes registry
├── utils/                   # haptic, speak, jp-helpers, shuffle, …
├── styles/                  # global.css (design tokens), theme.js
└── tests/                   # 35 test files, 383+ tests
```

Untuk orientasi lebih detail: lihat `_MAP.md` di root repo.

---

## Arsitektur Data (localStorage)

3 dokumen localStorage terpisah:

| Key | Isi |
|-----|-----|
| `ssw-progress` | known/unknown cards, quiz scores, streak, sessions, daily mission |
| `ssw-srs-data` | FSRS card states (stability, difficulty, interval, due date) |
| `ssw-prefs` | track, theme, furiganaPolicy, audioEnabled, examDate, goalHarian |

Export/import tersedia di tab **Saya** → fitur backup & restore.

---

## CI/CD

Setiap push ke `main` → GitHub Actions menjalankan:
1. **Lint** (`npm run lint` — zero warnings)
2. **Test** (`npm test -- --run`)
3. **Build** (`npm run build`)
4. **Deploy** ke GitHub Pages (otomatis, lewat `deploy.yml`)

Service worker cache version di-bump otomatis di setiap deploy.

---

## Kontribusi

1. Fork repo
2. Buat branch: `git checkout -b feat/nama-fitur`
3. Pastikan `npm run validate` lulus sebelum push
4. Buat Pull Request ke `main`

**Untuk setup pre-commit hook:** lihat `HUSKY-SETUP.md`

---

## Lisensi

Pribadi / Private — Nugget Nihongo · 2026
