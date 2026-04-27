# 📋 SSW Flashcard App — Proposal Refaktor Komprehensif

> **Status:** v87 (7.390 baris / 1,34 MB single file)
> **Target:** Bersih, konsisten, mudah di-maintain, siap pakai untuk junior
> **Penulis:** Claude × Nugget · April 2026

---

## 0. Ringkasan Eksekutif

File `ssw_flashcards_v87.jsx` adalah sebuah **"mega monolith"** — 1 file React JSX berisi **1.438 kartu flashcard, ~95 soal JAC, ~598 soal Wayground, 12+ set kuis, 27 komponen React, dan 767 inline style** — semuanya tumpuk jadi satu. Ini bekerja (congrats on passing!), tapi tidak maintainable untuk junior yang akan memakainya nanti.

Proposal ini dibagi menjadi **7 Pilar Refaktor**, masing-masing dengan daftar masalah, solusi, dan prioritas.

---

## 1. 🗂️ PILAR 1: Arsitektur File — Pecah Monolith

### 1.1 Masalah Saat Ini

Seluruh app ada di **1 file JSX** yang 7.390 baris. Ini artinya:
- Scroll fatigue: mencari 1 fungsi di antara 7K+ baris
- Setiap edit = re-read seluruh file oleh Claude agent → token mahal & lambat
- Tidak ada separation of concerns antara DATA, LOGIC, dan UI
- Git diff menjadi tidak bermakna — 1 edit kecil di data kelihatan sebagai perubahan besar

### 1.2 Solusi: Multi-File Modular Architecture

```
ssw-flashcards/
├── index.html                     # Entry point
├── src/
│   ├── App.jsx                    # Root component + routing + nav
│   ├── data/
│   │   ├── cards.js               # CARDS array (semua 1.438 kartu)
│   │   ├── jac-official.js        # JAC_OFFICIAL array (95 soal)
│   │   ├── wayground-sets.js      # WAYGROUND_SETS (12 set, ~598 soal)
│   │   ├── angka-kunci.js         # ANGKA_KUNCI
│   │   ├── danger-items.js        # DANGER_ITEMS (soal jebak)
│   │   ├── categories.js          # CATEGORIES + getCatInfo + SOURCE_META
│   │   └── vocab-sources.js       # VOCAB_SOURCES, VOCAB_BASE_CARDS, dkk
│   ├── modes/
│   │   ├── FlashcardMode.jsx
│   │   ├── QuizMode.jsx
│   │   ├── JACMode.jsx
│   │   ├── AngkaMode.jsx
│   │   ├── DangerMode.jsx
│   │   ├── SimulasiMode.jsx
│   │   ├── StatsMode.jsx
│   │   ├── SearchMode.jsx
│   │   ├── SprintMode.jsx
│   │   ├── FocusMode.jsx
│   │   ├── GlossaryMode.jsx
│   │   ├── WaygroundMode.jsx
│   │   └── SumberMode.jsx
│   ├── components/
│   │   ├── JpFront.jsx            # Komponen render kanji front
│   │   ├── DescBlock.jsx          # Komponen render penjelasan
│   │   └── ResultScreen.jsx       # Unified result/review screen
│   ├── utils/
│   │   ├── shuffle.js             # Fisher-Yates shuffle
│   │   ├── strip-furi.js          # stripFuri + extractReadings
│   │   ├── quiz-generator.js      # generateQuiz logic
│   │   ├── wrong-tracker.js       # getWrongCount, makeWrongEntry, storage helpers
│   │   └── jp-helpers.js          # hasJapanese, jpFontSize
│   └── styles/
│       └── theme.js               # Shared color tokens, gradients, shadows
└── _MAP.md                        # Orientation file for Claude sessions
```

### 1.3 Catatan Deployment

Karena workflow Nugget = upload zip → deploy via GitHub Pages drag-and-drop:
- **Opsi A (Recommended):** Tetap bundled single-file untuk DEPLOY, tapi develop multi-file → build step concat sebelum deploy (bisa pakai simple bash script atau esbuild 1-liner)
- **Opsi B:** Refaktor tapi keep single-file output — cukup gunakan `// ─── SECTION ───` markers yang sudah ada, tapi pindahkan DATA ke file terpisah yang di-lazy-load
- **Opsi C:** Full multi-file, host lewat Cloudflare Pages (Nugget sudah punya CF connected) → gratis, auto-deploy dari GitHub

---

## 2. 📊 PILAR 2: Data — Normalisasi & Konsistensi

### 2.1 Skema Kartu Tidak Konsisten

Saat ini CARDS punya **2 skema berbeda** tergantung sumber:

| Field | Kartu text/st (id 4–676) | Kartu lifeline4/vocab (id 769+) |
|-------|--------------------------|--------------------------------|
| `furi` | ❌ Tidak ada | ✅ Ada (hiragana reading) |
| `desc` | ✅ Selalu ada | ✅ Selalu ada |
| `romaji` | ✅ Selalu ada | ✅ Selalu ada |
| `source` | Konsisten (text2, text3, dll) | Konsisten tapi banyak varian |

**Masalah spesifik:**
- **708 kartu punya `furi`**, 730 kartu tidak → UX berbeda tergantung sumber
- **Source naming chaos:** ada 21 distinct source values, beberapa redundan:
  - `"st_sample_l"` vs `"st_sample2_l"` (sample exam sets)
  - `"vocab_teori"` vs `"vocab_teori v84"` (salah satu harusnya di-merge)
  - `"CSV v2 / JAC Official"` vs `"CSV Teori v2 / JAC Official"` (di Wayground, bukan di CARDS)
  - `"Wayground / Quizizz"` (campuran sumber)
- **ID gaps:** ID bukan sequential — ada lompatan besar (e.g., id 8 → 115, 44 → 103). Ini terjadi karena batch-batch tambahan dari agent berbeda

### 2.2 Solusi: Unified Card Schema

```js
// Semua kartu WAJIB punya field ini:
{
  id: Number,           // UNIQUE, auto-incrementing dari 1
  cat: String,          // category key (shortened from "category")
  src: String,          // normalized source key
  jp: String,           // teks Jepang (kanji + furigana inline)
  furi: String | null,  // hiragana reading (SEMUA kartu wajib diisi, bukan sebagian)
  romaji: String,       // romanisasi
  id_text: String,      // terjemahan Indonesia
  desc: String,         // penjelasan panjang
  tags: String[],       // BARU: tag untuk cross-referencing (opsional)
}
```

**Tindakan yang harus dilakukan:**
1. **Re-ID seluruh kartu** dari 1 s/d N secara sequential (simpan mapping lama → baru)
2. **Generate `furi` untuk semua 730 kartu yang belum punya** — bisa pakai NLP (MeCab/kuroshio) atau manual
3. **Normalize source names** — buat 1 canonical name per PDF sumber:
   - `text1l` → `"jac-ch1"` (Chapter 1: Salam & Keselamatan)
   - `text2` → `"jac-ch2"` (Chapter 2: Hukum)
   - `text3` → `"jac-ch3"` (Chapter 3: Jenis Kerja)
   - `text4` → `"jac-ch4"` (Chapter 4: Manajemen Konstruksi)
   - `text5l` → `"jac-ch5"` (Chapter 5: Alat & Material)
   - `text6l` → `"jac-ch6"` (Chapter 6: Manajemen Mutu)
   - `text7l` → `"jac-ch7"` (Chapter 7: Gambar Teknik)
   - `lifeline4` → `"vocab-lifeline"` (Kosakata Lifeline)
   - `vocab_exam` → `"vocab-exam"` (Kosakata Ujian)
   - `vocab_core` → `"vocab-core"` (Kosakata Inti)
   - `vocab_jac` → `"vocab-jac"` (Kosakata JAC Aisatsu)
   - `vocab_teori` → `"vocab-teori"` (Kosakata Teori)
   - dst.
4. **Validate** semua `romaji` — v86 mengklaim "0 romaji issues confirmed" tapi ada kemungkinan slip
5. **Merge duplikat konten** — beberapa kartu memiliki materi yang sangat mirip dari sumber berbeda

### 2.3 Data Soal — 3 Format Berbeda

Saat ini soal punya **3 format berbeda** yang membingungkan:

| Aspek | JAC_OFFICIAL | WAYGROUND_SETS | Quiz (generated) |
|-------|-------------|----------------|------------------|
| Indexing jawaban | `answer: 1` (1-based) | `ans: 0` (0-based) | `correct: true/false` |
| Furigana | `hiragana: ""` (field terpisah) | `《》` inline di `q` | Tidak ada |
| Opsi ID | `options[]` campur JP+ID | `opts[]` + `opts_id[]` terpisah | `text` saja |
| Explanation | `explanation` | `exp` | Dari `card.desc` |
| Photo | `hasPhoto` + `photoDesc` | Tidak ada | Tidak ada |

**Ini harus dinormalisasi ke 1 format.**

### 2.4 Solusi: Unified Question Schema

```js
{
  id: String,             // e.g., "jac-tt1-q01"
  set: String,            // e.g., "jac-tt1"
  setLabel: String,       // e.g., "学科 Set 1"
  question: {
    jp: String,           // Soal dalam bahasa Jepang (furigana pakai format 《》 konsisten)
    id: String,           // Terjemahan Indonesia
  },
  options: [
    { jp: String, id: String }   // Setiap opsi punya JP + ID
  ],
  answer: Number,         // 0-based INDEX (konsisten semua)
  explanation: String,    // Penjelasan (Indonesian)
  photo: String | null,   // Deskripsi foto jika ada
  relatedCardId: Number | null,  // Referensi ke CARDS
}
```

---

## 3. 🎨 PILAR 3: UI/UX — Konsistensi Visual & Interaksi

### 3.1 Masalah: 767 Inline Styles

Hampir semua styling di app ini adalah **inline `style={{}}` objects** — 767 instance. Ini artinya:
- Warna yang sama ditulis berulang di 50+ tempat (e.g., `#4ade80`, `#f87171`, `#64748b`)
- Tidak ada single source of truth untuk warna, spacing, radius, font
- Perubahan tema → edit 767 tempat
- Tiap mode punya "personality" visual sendiri — tidak terasa cohesive

### 3.2 Solusi: Design Token System

```js
// theme.js — SATU-SATUNYA tempat warna/spacing/radius hidup
export const T = {
  // Colors
  bg: "#0f172a",
  card: "rgba(255,255,255,0.06)",
  cardBorder: "rgba(255,255,255,0.09)",
  text: "#e2e8f0",
  textMuted: "#94a3b8",
  textDim: "#64748b",
  textDark: "#475569",
  
  correct: "#4ade80",
  correctBg: "rgba(74,222,128,0.1)",
  correctBorder: "rgba(74,222,128,0.35)",
  
  wrong: "#f87171",
  wrongBg: "rgba(248,113,113,0.1)",
  wrongBorder: "rgba(248,113,113,0.35)",

  accent: "linear-gradient(135deg, #f6d365, #fda085)",
  
  // Spacing
  pad: { xs: 4, sm: 8, md: 14, lg: 20, xl: 28 },
  
  // Radius
  rad: { sm: 8, md: 14, lg: 20, pill: 99 },
  
  // Fonts
  fontJP: "'Noto Sans JP', sans-serif",
  fontJPAlt: "'Zen Kaku Gothic New', 'Noto Sans JP', sans-serif",
  
  // Shared component presets
  btn: { fontFamily: "inherit", cursor: "pointer", border: "none" },
  progressBar: { height: 4, borderRadius: 99, overflow: "hidden" },
};
```

### 3.3 Masalah: Inkonsistensi Antar Mode

| Aspek | FlashcardMode | QuizMode | JACMode | WaygroundMode |
|-------|--------------|----------|---------|---------------|
| Progress bar height | 4px | 4px | 4px | 4px ✓ |
| Border radius tombol | 14px | 14px | 14px | 14px ✓ |
| Font jawaban | Noto Sans JP | Noto Sans JP | Inherit | Inherit ⚠️ |
| Result screen | Custom | Custom | Custom v77 | Custom v77 |
| "Soal berikutnya" text | "Soal berikutnya →" | "Soal berikutnya →" | Manual "Next" | "Soal berikutnya →" |
| Keyboard shortcuts | ← → Space | 1/2/3 + Enter | Enter/Space | Enter/Space |
| Wrong count storage key | `ssw-quiz-wrong` | `ssw-quiz-wrong` | `ssw-wrong-counts` | `ssw-wg-wrong-{id}` |
| Auto-next | ✅ Configurable | ❌ | ❌ | ❌ |
| Settings panel | ❌ | ✅ (difficulty, auto-next, hints) | ✅ (hiragana, ID) | ✅ (furigana, hint) |

**Ada banyak inkonsistensi halus yang membuat user experience terasa "patchy".**

### 3.4 Solusi: Unified Components

**3.4.1 — `<QuizShell>` — Komponen kuis universal**

Buat 1 komponen wrapper yang menangani:
- Progress bar
- Score display
- Keyboard shortcuts (1/2/3/4 pilih, Enter next)
- Option rendering dengan animasi benar/salah
- Auto-next logic
- Settings panel (furigana ON/OFF, ID ON/OFF, auto-next, difficulty)
- Result screen

Setiap mode (Quiz, JAC, Wayground, Simulasi, Jebak) hanya perlu menyediakan:
- Array of questions (dalam format unified)
- Config overrides (timer, passing threshold, dll)

**3.4.2 — `<ResultScreen>` — Hasil kuis universal**

v77 sudah mulai unify ini, tapi masih ada perbedaan. Buat 1 komponen:
- Grade emoji + warna
- Score + accuracy
- Progress bar
- Review jawaban (salah di-highlight, benar ditunjukkan)
- Tombol ulang + retry yang salah saja

### 3.5 Masalah: Navigation UX

Navigasi saat ini menggunakan 3-section tab bar: **Belajar | Ujian | Referensi**, masing-masing menampilkan grid 2×2 atau 2×3 tombol mode. Ini sudah cukup baik, tapi:

- **Tidak ada breadcrumb/back navigation** — dari dalam WaygroundQuiz, user tidak tahu cara kembali ke list set
- **Category filter** hanya berlaku untuk Kartu dan Kuis, tidak untuk mode lain — membingungkan
- **Vocab toggle** (Konsep ↔ Vocab) ada di header tapi efeknya tidak jelas
- **Tidak ada onboarding** — junior baru buka langsung lost, tidak tahu mulai dari mana

### 3.6 Solusi Navigasi

- Tambahkan **"Mulai dari sini"** card di landing state untuk user baru
- Setiap mode yang punya sub-navigation (Wayground, JAC set filter) → tunjukkan **breadcrumb mini** di atas
- Buat **tooltip/info popup** sederhana di setiap mode card yang menjelaskan fungsinya
- Gabungkan Stats ke dalam nav utama sebagai **badge** (angka known/unknown) bukan mode terpisah

---

## 4. 🔧 PILAR 4: Code Quality & Bug Fixes

### 4.1 Duplikasi Kode

**Pattern yang di-copy-paste di hampir setiap mode:**

1. **Storage load/save** — Setiap mode punya `useEffect` sendiri untuk `window.storage.get/set`. Ini di-repeat di QuizMode, JACMode, WaygroundMode, DangerMode, SimulasiMode (5x duplicated):
   ```js
   useEffect(() => {
     (async () => {
       try { const r = await window.storage.get("ssw-xxx"); ... } catch {}
       setStorageReady(true);
     })();
   }, []);
   ```
   → **Extract ke custom hook:** `usePersistedState(key, defaultVal)`

2. **Keyboard shortcut handler** — Setiap mode punya `useEffect` + `addEventListener("keydown")` sendiri (6x duplicated)
   → **Extract ke custom hook:** `useQuizKeyboard({ onSelect, onNext, phase, selected })`

3. **Shuffle + Fisher-Yates** — Sudah di-extract ke `shuffle()` tapi masih ada inline Fisher-Yates di JACMode (line 3287-3290)
   → **Hapus inline, pakai `shuffle()` yang sudah ada**

4. **Option rendering** — Tombol pilihan (dengan badge nomor, warna benar/salah) di-copy ke setiap mode dengan sedikit variasi
   → **Extract ke `<OptionButton>`**

5. **Streak tracking** — `streak`/`maxStreak` state + logic duplicated di 4 mode
   → **Extract ke `useStreak()` hook**

### 4.2 State Management

Saat ini state tersebar di banyak tempat:
- `known` / `unknown` Set di App level, diteruskan ke FlashcardMode & StatsMode
- `quizWrong` di QuizMode (key: `ssw-quiz-wrong`)
- `wrongCounts` di JACMode (key: `ssw-wrong-counts`)
- Wayground punya wrong count per set (key: `ssw-wg-wrong-{setId}`)

**Masalah:** Tidak ada **satu tempat** yang tahu "user ini lemah di topik apa". Data tersebar di 3+ storage keys yang tidak terhubung.

**Solusi:** Unified progress store:
```js
// Satu storage key: "ssw-progress"
{
  knownCards: [4, 5, 7, ...],
  unknownCards: [9, 12, ...],
  quizWrong: { "card-142": { count: 3, lastWrong: 1714200000 }, ... },
  jacWrong: { "tt1_q05": { count: 2, lastWrong: ... }, ... },
  wgWrong: { "wt1-q03": { count: 1, ... }, ... },
  lastSession: "2026-04-27T10:00:00Z",
  totalQuizzes: 47,
  totalCorrect: 312,
}
```

### 4.3 Known Bugs / Tech Debt

| # | Severity | Issue | Location |
|---|----------|-------|----------|
| 1 | 🟡 Med | `confirm()` digunakan di beberapa tempat tapi di-block oleh sandbox Claude artifact | SimulasiMode |
| 2 | 🟡 Med | `romaji` field bisa `null` — null guard hanya di SearchMode, belum di GlossaryMode sort | GlossaryMode |
| 3 | 🟢 Low | Version string hardcoded di 3 tempat (`_version`, header, changelog) — mudah out of sync | Multiple |
| 4 | 🟡 Med | `cardOrder` di FlashcardMode bisa stale jika `cards` prop berubah mid-session | FlashcardMode |
| 5 | 🟢 Low | Dead comments dari versi lama (e.g., `// id 1, 2, 3 dihapus di v25`) masih ada | CARDS data |
| 6 | 🟡 Med | `seenPoolRef` di QuizMode tidak di-reset saat switch difficulty level | QuizMode |
| 7 | 🟢 Low | `shuffleArr` alias disebutkan dihapus di v88 changelog tapi changelog itself masih bilang v87 di header | Changelog |
| 8 | 🔴 High | **Answer index inconsistency**: JAC uses 1-based (`answer: 1` = opsi pertama), Wayground uses 0-based (`ans: 0` = opsi pertama). Ini SANGAT membingungkan dan rawan salah saat menambah soal baru | JAC vs WG |
| 9 | 🟡 Med | Wayground set wt1 punya Q4 dan Q5 yang HAMPIR IDENTIK (keduanya tentang frekuensi KY, jawaban sama) | wt1 Q4/Q5 |
| 10 | 🟢 Low | `supeeसाaa` typo (Devanagari character) di romaji kartu id 1202 (スペーサー) | CARDS |

---

## 5. 📝 PILAR 5: Konten — Audit & Pengayaan

### 5.1 Audit Konten yang Dibutuhkan

1. **Cross-check dengan sumber resmi JAC** — Semua konten berasal dari:
   - `https://global.jac-skill.or.jp/indonesia/examination/documents.php` (PDF resmi)
   - CSV dari Wayground/sensei
   - Agent-generated content (Claude)
   
   **Risiko:** Agent-generated explanation bisa salah atau outdated. Semua `desc` dan `explanation` harus di-review oleh seseorang yang paham materi.

2. **Soal yang terlalu mirip / duplikat** — Beberapa soal Wayground menguji hal yang persis sama dengan JAC Official. Ini bisa bagus (reinforcement) tapi juga bisa overwhelming. Perlu ditandai (`isDuplicate: true` atau `relatedQuestionIds: []`).

3. **Photo-dependent questions** — 17 soal JAC Official punya `hasPhoto: true` dengan `photoDesc` teks. Tanpa foto asli, user hanya bisa baca deskripsi. Ini **harus** diberi flag visual yang jelas ("⚠ Soal ini aslinya pakai foto") dan idealnya foto asli atau ilustrasi pengganti ditambahkan.

### 5.2 Konten yang Masih Kurang

Berdasarkan silabus ujian JAC SSW Konstruksi:

| Topik | Coverage Saat Ini | Gap |
|-------|-------------------|-----|
| 安全管理 (Keselamatan) | ✅ Kuat (172 kartu) | — |
| 法規 (Hukum) | ✅ Kuat (91 kartu) | — |
| 工事の種類 (Jenis Kerja) | ✅ Kuat (320 kartu) | — |
| 電気工事 (Listrik) | ✅ Kuat (154 kartu) | — |
| 配管工事 (Pipa) | ✅ Kuat (200 kartu) | — |
| 通信工事 (Telekom) | ✅ Baik (65 kartu) | — |
| 消防設備 (Pemadam) | ⚠️ Cukup (40 kartu) | Bisa ditambah |
| 保温保冷 (Insulasi) | ⚠️ Cukup (45 kartu) | Bisa ditambah |
| 施工計画・工程管理 | ⚠️ Tersebar | Tidak ada kategori dedicated |
| 品質管理 (Mutu) | ⚠️ Tersebar | Tidak ada kategori dedicated |
| 環境管理 (Lingkungan) | ⚠️ Minim | Perlu ditambah |
| 実際のテスト形式 | ✅ Simulasi ada | Timer bisa lebih realistis |

### 5.3 Saran Konten Baru

1. **Kategori baru:** Tambahkan `sekou_kanri` (施工管理) dan `hinshitsu_kanri` (品質管理) — saat ini kontennya ada tapi tersebar di "jenis_kerja" dan "keselamatan"
2. **Flashcard gambar** — Banyak soal ujian real pakai foto alat. Tambahkan field `img` di kartu untuk alat-alat kunci (min 50 kartu), bisa pakai illustrasi SVG sederhana atau foto Creative Commons
3. **Mnemonik / memory tricks** — Tambahkan field `trick` opsional di kartu yang sulit. Contoh: "36協定 → 3(san) 6(roku) = saburoku → perjanjian lembur"

---

## 6. ⚡ PILAR 6: Fitur Baru untuk Junior

### 6.1 Fitur yang Sudah Bagus (Keep)
- ✅ Smart priority sorting (unknown → untouched → known)
- ✅ Anti-repeat quiz shuffler (seenPoolRef)
- ✅ 3 difficulty levels (Easy / Medium / Hard)
- ✅ Keyboard shortcuts
- ✅ Touch swipe navigation
- ✅ Persistent wrong-answer tracking
- ✅ Angka Kunci mode (angka penting wajib hafal)
- ✅ Soal Jebak mode (pasangan istilah mirip)
- ✅ Simulasi ujian dengan timer
- ✅ Glosari terurut

### 6.2 Fitur yang Perlu Diperbaiki
- 🔧 **Sprint mode** — konsep bagus tapi kurang polish. Butuh timer visual dan leaderboard sederhana
- 🔧 **Focus mode** — keren tapi routing internal (SprintMode nested di FocusMode) membingungkan
- 🔧 **Stats mode** — data ada tapi visualisasi kurang. Perlu chart sederhana (completion %, weakness areas)
- 🔧 **Search mode** — fungsional tapi bisa ditambahkan filter by category dan highlight match

### 6.3 Fitur Baru yang Diusulkan

| Fitur | Deskripsi | Prioritas |
|-------|-----------|-----------|
| **Study Plan** | Rencana belajar 4-minggu: setiap hari ada target kartu + kuis + review | 🔴 High |
| **Spaced Repetition** | SM-2 atau Leitner box system — otomatis jadwalkan review kartu berdasarkan performa | 🔴 High |
| **Progress Dashboard** | Landing page dengan ring chart: % kartu dikuasai, streak harian, weakness areas | 🟡 Med |
| **Export/Import Progress** | JSON export/import agar bisa pindah device tanpa kehilangan progress | 🟡 Med |
| **Offline PWA** | Service worker + manifest → bisa dipasang di homescreen dan dipakai offline | 🟡 Med |
| **Dark/Light Toggle** | Saat ini hanya dark mode. Beberapa junior mungkin prefer light mode | 🟢 Low |
| **Multilingual Toggle** | Switch interface JP↔ID untuk immersion mode | 🟢 Low |
| **Social Share** | "Aku dapat 95% di Simulasi Ujian SSW!" → share card untuk Instagram/WA | 🟢 Low |

---

## 7. 🚀 PILAR 7: Roadmap Implementasi

### Phase 1: Foundation (1-2 sessions)
> Fokus: Bersihkan data tanpa mengubah UX

1. **Normalize semua card IDs** — re-number dari 1 sequential
2. **Normalize source names** — canonical naming
3. **Unify answer indexing** — semua 0-based
4. **Fix known bugs** (#8 answer inconsistency, #10 typo, #9 duplicate questions)
5. **Add `furi` field ke semua kartu** yang belum punya (batch script)
6. **Generate `_MAP.md`** orientation file

### Phase 2: Architecture (2-3 sessions)
> Fokus: Pecah file, extract shared logic

1. **Split ke multi-file** sesuai arsitektur di Pilar 1
2. **Extract shared hooks** (usePersistedState, useQuizKeyboard, useStreak)
3. **Create theme.js** — design tokens
4. **Build `<QuizShell>` wrapper** — unify quiz UX
5. **Build `<ResultScreen>` component** — unify hasil
6. **Test semua mode** masih bekerja setelah refaktor

### Phase 3: UX Polish (1-2 sessions)
> Fokus: Konsistensi visual, onboarding

1. **Replace 767 inline styles** dengan theme tokens
2. **Add onboarding** "Mulai dari sini" untuk user baru
3. **Add breadcrumb** di mode yang punya sub-navigation
4. **Unified settings panel** yang konsisten di semua quiz mode
5. **Photo question warning** badge

### Phase 4: New Features (2-3 sessions)
> Fokus: Fitur untuk junior

1. **Spaced Repetition engine** (SM-2 atau Leitner)
2. **Study Plan mode** — guided 4-week plan
3. **Progress Dashboard** — visualisasi di landing page
4. **PWA manifest + service worker** → offline + installable
5. **Export/Import progress** JSON

### Phase 5: Content Enrichment (ongoing)
> Fokus: Konten akurat & lengkap

1. **Cross-check semua explanation** dengan PDF JAC terbaru
2. **Tambah kartu gambar** (min 50 alat kunci)
3. **Tambah kategori baru** (施工管理, 品質管理, 環境管理)
4. **Tambah mnemonik** untuk kartu sulit
5. **Review dari junior** — feedback loop

---

## 8. 📐 Technical Specifications

### 8.1 Angka-Angka Kunci Saat Ini

| Metrik | Nilai |
|--------|-------|
| Total baris kode | 7.390 |
| Ukuran file | 1,34 MB |
| Total kartu flashcard | ~1.438 (CARDS array) |
| Total soal JAC Official | ~95 (2 set gakka + 2 set jitsughi) |
| Total soal Wayground | ~598 (12 set: 6 teori + 3 praktik + 3 vocab) |
| Total angka kunci | ~45 |
| Total soal jebak (danger) | ~40+ |
| Total kategori | 12 + "all" + "bintang" |
| Total source values | 21 distinct |
| Total komponen React | 27 |
| Total inline style instances | 767 |
| Total storage keys | 5+ (fragmented) |

### 8.2 Target Setelah Refaktor

| Metrik | Target |
|--------|--------|
| File terbesar | < 500 baris |
| Data files | JSON/JS terpisah, masing-masing < 2000 baris |
| Inline styles | 0 (semua via theme tokens / Tailwind utility) |
| Storage keys | 1 unified (`ssw-progress`) |
| Answer indexing | 100% 0-based |
| Cards with `furi` | 100% |
| Duplicate questions flagged | 100% |
| Onboarding flow | Yes |
| PWA installable | Yes |
| Offline capable | Yes |

---

## 9. Pertanyaan untuk Nugget Sebelum Mulai

Sebelum aku mulai eksekusi, tolong confirm:

1. **Deployment preference:** Single-file artifact (current) atau multi-file via Cloudflare/GitHub Pages?
2. **Apakah kamu punya PDF sumber JAC terbaru?** Aku butuh ini untuk cross-check konten — bilang ke aku kalau kamu mau upload
3. **CSV dari Wayground/sensei** — mau dilampirkan untuk audit? Ini penting untuk traceability
4. **Target user junior:** Mereka di level bahasa Jepang apa? (N5/N4/N3?) — ini mempengaruhi apakah kita perlu tambah furigana lebih banyak
5. **Timeline:** Mau dikerjakan semua sekaligus atau phase-by-phase?
6. **Branding:** Mau tetap "SSW Flashcards" atau ada nama baru untuk versi junior-facing?

---

*Proposal ini adalah hasil analisis exhaustive dari 7.390 baris kode. Setiap rekomendasi bisa dieksekusi secara independen — kita tidak harus melakukan semuanya sekaligus. Prioritaskan Phase 1 (Foundation) karena ini yang paling impactful dengan effort paling sedikit.*
