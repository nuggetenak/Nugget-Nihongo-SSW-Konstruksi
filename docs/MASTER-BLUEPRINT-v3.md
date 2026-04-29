# 🏗️ SSW Konstruksi — Master Blueprint v3 (Opus)

> **Author:** Claude Opus 4.6 × Nugget · 2026-04-29
> **Scope:** Architecture refactor + Full UI/UX redesign + DX improvements
> **Executor:** Agent Sonnet (konten by agent lain)
> **Status:** APPROVED — semua open questions resolved, full creative freedom granted
> **Prerequisite:** Baca `_MAP.md` + dokumen ini sebelum mulai

---

## 0. Resolved Decisions (Lock-In)

Nugget memberikan full creative freedom. Keempat open question di-resolve sebagai berikut:

| # | Question | Decision | Rationale |
|---|----------|----------|-----------|
| 1 | Storage migration | **Auto-migrate** — zero user disruption | Junior user tidak tahu export/import. Data harus preserved silently. |
| 2 | Styling approach | **CSS Modules** — zero runtime overhead | Target device = HP Android budget. No Tailwind build dependency. CSS variables sudah ada di theme.js. |
| 3 | CI/CD | **GitHub Actions auto-deploy** on push to main | Multi-agent workflow butuh safety net. Auto SW cache versioning eliminasi stale cache risk. |
| 4 | Testing depth | **Unit + Component first**, E2E later | Playwright E2E butuh headless browser setup yang berat. Component tests dengan React Testing Library lebih actionable sekarang. |

---

## PART I: ARCHITECTURE REFACTOR

*(Full detail ada di `docs/REFACTOR-PROPOSAL-v2.md` — di bawah ini ringkasan + update)*

### A1. Storage Engine (3-Document Model)

**Current:** 20+ localStorage key patterns, SRS = 1438 separate keys, O(n) scan on init.

**Target:** 3 documents: `ssw-progress`, `ssw-srs-data`, `ssw-prefs`. Versioned with migration engine. Cold start dari ~300ms → <20ms.

```
src/storage/
├── engine.js          ← init(), get(), set(), debounced write-through
├── schema.js          ← STORAGE_VERSION, document shapes, defaults
├── migrations.js      ← v1→v2 auto-migrate from fragmented keys
└── index.js
```

Migration v1→v2 WAJIB:
1. Detect old keys → read → pack into 3 documents
2. Write new format
3. Delete old keys
4. Zero user disruption — test with real export data sebelum merge

### A2. App.jsx Decomposition

**Current:** 668-line god component.

**Target:** ~150 lines. Extract to:
- `src/contexts/ProgressContext.jsx` — known/unknown/starred/wrongCounts/scores
- `src/contexts/SRSContext.jsx` — useSRS wrapper, provides via context
- `src/contexts/AppContext.jsx` — track, theme, navigation, toast
- `src/router/ModeRouter.jsx` — lazy import + Suspense + ErrorBoundary
- `src/router/modes.js` — single registry for ALL mode definitions (eliminates duplication between App.jsx and Dashboard.jsx)

### A3. CSS Modules Migration

**Current:** 822 inline style objects.
**Target:** 0 inline style objects (except truly dynamic `left`, `width` etc.)

Strategy: per-file, incremental. Start with shared components → modes → App.

### A4. Data Splitting

- Remove `src/data/index.js` barrel re-export (tree-shaking anti-pattern)
- Split `cards.js` per track for lazy loading
- Ensure `csv-sets.js` (3998 lines) only loads when VocabMode opens

### A5. Error Boundaries + Resilience

- `ErrorBoundary` wrapping every lazy-loaded mode
- Defensive data validation in storage engine
- Graceful fallback UI per mode ("Mode ini error, kembali ke menu")

### A6. CI/CD

```yaml
# .github/workflows/ci.yml — on push + PR
lint → test → build → audit:integrity

# .github/workflows/deploy.yml — on push to main
build → auto-bump sw.js CACHE_VERSION → deploy to GitHub Pages
```

### A7. Testing Expansion

Current: 111 tests (data + utils only).
Add: storage engine tests (~30), component tests (~20), hook tests (~10).

---

## PART II: UI/UX REDESIGN — FROM PIXEL TO FLOW

### Design Philosophy

**Target user persona:** Budi, 26 tahun, dari Jawa Tengah. Bekerja di pabrik, belajar SSW Konstruksi malam hari pakai Samsung Galaxy A14 (layar 6.6", RAM 4GB, koneksi 4G tidak stabil). Bahasa Jepang level N5, baru mulai. Motivasinya: gaji 3x lipat di Jepang, kirim uang ke keluarga.

**Design principles:**

| # | Principle | Meaning |
|---|-----------|---------|
| P1 | **Mobile-first, mobile-only** | Design untuk layar 360-412px. Jangan design untuk desktop lalu shrink. |
| P2 | **Thumb-zone aware** | Primary actions di bottom 1/3 layar. Exit/back di top-left. |
| P3 | **Instant feedback** | Setiap tap harus ada respons visual dalam <100ms. |
| P4 | **Reduce cognitive load** | Junior user overwhelmed oleh 18 modes. Guide them, don't dump options. |
| P5 | **Japanese text is king** | JP text harus BESAR dan jelas. Furigana harus selalu terlihat. |
| P6 | **Progress = motivation** | Gamification yang bermakna. Streaks, milestones, visual progress. |
| P7 | **Error-proof** | Impossible to lose data. Impossible to get stuck. Always a way back. |
| P8 | **Offline-first** | App harus 100% functional tanpa internet setelah first load. |

---

### B1. Information Architecture — Restructured Navigation

**Current 4-tab structure:**
```
🏠 Beranda  |  📚 Belajar  |  ✍️ Ujian  |  ⋯ Lainnya
```

**Problem:** "Belajar" vs "Ujian" distinction is confusing — kuis ada di Belajar, soal JAC ada di Ujian, tapi keduanya = quiz format. Junior user tidak tahu harus mulai dari mana.

**Proposed 3-tab structure:**
```
🏠 Beranda  |  📖 Belajar  |  👤 Saya
```

**Rationale:**
- **Beranda** = Dashboard (unchanged, hero CTA + quick stats)
- **Belajar** = ALL study modes in one scrollable page, organized by intent:
  - 📝 **Pelajari** (learn new): Kartu, Glosari
  - 🧪 **Latihan** (practice): Kuis, Sprint, Fokus, Angka, Jebak
  - 📋 **Ujian** (test): JAC, Wayground, CSV Vocab, Simulasi
  - 🔁 **Ulasan** (review): SRS Review
- **Saya** = Personal: Stats, Progress, Export/Import, Settings (track, theme), Sumber

**Why 3 tabs, not 4:**
- Fewer tabs = larger touch targets in bottom nav
- "Lainnya" (⋯) is a UX anti-pattern — it's where features go to die
- Settings/Stats/Export are personal data → "Saya" tab is intuitive

**Implementation:**

```js
// router/modes.js
export const MODE_SECTIONS = {
  pelajari: {
    title: '📝 Pelajari',
    subtitle: 'Materi baru',
    modes: ['kartu', 'glosari'],
  },
  latihan: {
    title: '🧪 Latihan',
    subtitle: 'Asah kemampuan',
    modes: ['kuis', 'sprint', 'fokus', 'angka', 'jebak'],
  },
  ujian: {
    title: '📋 Ujian',
    subtitle: 'Soal ujian asli',
    modes: ['jac', 'wayground', 'vocab', 'simulasi', 'sipil', 'bangunan'],
  },
  ulasan: {
    title: '🔁 Ulasan',
    subtitle: 'Kartu jatuh tempo',
    modes: ['ulasan'],
  },
};
```

**Bottom Nav design:**

```css
/* BottomNav.module.css */
.nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 56px;
  background: var(--ssw-navBg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid var(--ssw-border);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  padding-bottom: env(safe-area-inset-bottom, 0px);
}

.tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 6px 0;
  font-size: 10px;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--ssw-textDim);
  transition: color 0.15s ease;
  position: relative;
}

.tab[data-active="true"] {
  color: var(--ssw-amber);
}

/* Active indicator — pill shape, not just a line */
.tab[data-active="true"]::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 32px;
  height: 3px;
  border-radius: 0 0 4px 4px;
  background: var(--ssw-amber);
}

.tab:active {
  transform: scale(0.92);
  transition: transform 0.08s ease;
}

.tabIcon {
  font-size: 20px;
  line-height: 1;
}
```

---

### B2. Onboarding — Guided, Not Just Informative

**Current:** 4 static info slides → track picker.

**Proposed:** Interactive onboarding that actually teaches something.

```
Step 1: Welcome
  "Selamat Datang di SSW Konstruksi!"
  [Animated construction helmet icon]
  [Lanjut →]

Step 2: Track Picker (MERGED into onboarding)
  "Bidang apa yang kamu pelajari?"
  [3 track cards — tap to select]
  [Lanjut →]

Step 3: Mini Flashcard Demo (INTERACTIVE)
  "Coba balik kartu ini 👇"
  [A real flashcard showing 安全帯 → "Safety harness"]
  [User taps to flip — satisfying animation]
  "Bagus! Tandai hafalanmu:"
  [✅ Hafal] [❌ Belum]

Step 4: Goal Setting (NEW)
  "Mau belajar berapa kartu per hari?"
  [10] [20] [30] [Custom]
  "Oke, 20 kartu/hari. Dengan jadwal ini, kamu bisa selesai semua materi dalam ~72 hari!"
  [Mulai Belajar 🚀]
```

**Why:** Current onboarding tells user ABOUT the app. New onboarding lets user EXPERIENCE the app. The mini flashcard demo teaches the core mechanic before they even start.

**Goal setting** creates commitment and enables the daily progress bar on Dashboard to have a personalized target.

---

### B3. Dashboard — Emotional, Not Just Informational

**Current dashboard sections (top to bottom):**
1. Header (brand + track badge + theme toggle)
2. Stats bar (Total / Hafal / Belum / Sisa)
3. Progress bar + streak + daily count
4. Starter pack (if new)
5. Quick Start CTA
6. SRS due alert
7. Mode Belajar grid (4 tiles)
8. Mode Ujian list (3 items)
9. SRS breakdown pills
10. Recently studied
11. Content stats footer
12. Quick links row

**Problem:** Too many sections, too much data. Junior user scrolls and scrolls. The most important action (Quick Start CTA) is below the fold on short screens because Stats bar and Progress bar take up space first.

**Redesigned Dashboard — "One Screen, One Action":**

```
┌─────────────────────────────────────┐
│  SSW Konstruksi          ⚡ lifeline │  ← Header: brand + track pill (tappable)
│  by Nugget Nihongo           ☀️/🌙  │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────────┐│
│  │ 🔥 5 hari berturut-turut!      ││  ← Streak hero (if active)
│  │                                 ││
│  │    ╭────────────────────╮       ││  ← Circular progress ring
│  │    │                    │       ││     (replaces both stats bar
│  │    │      37%           │       ││      AND progress bar)
│  │    │    534/1438        │       ││
│  │    ╰────────────────────╯       ││
│  │                                 ││
│  │  +12 hari ini  ·  20 target    ││  ← Daily progress inline
│  └─────────────────────────────────┘│
│                                     │
│  ┌─────────────────────────────────┐│
│  │ 🔁 16 kartu siap diulang       ││  ← Primary CTA (SRS if due)
│  │    Ulasan SRS hari ini      →  ││     OR Smart Quick Start
│  └─────────────────────────────────┘│
│                                     │
│  ┌────────┐  ┌────────┐            │
│  │ 🃏     │  │ ❓     │            │  ← Quick action pills (not grid)
│  │ Kartu  │  │ Kuis   │            │     Top 4 most-used modes
│  └────────┘  └────────┘            │
│  ┌────────┐  ┌────────┐            │
│  │ ⚡     │  │ 📋     │            │
│  │Sprint  │  │ JAC    │            │
│  └────────┘  └────────┘            │
│                                     │
│  ── Terakhir Dipelajari ──         │
│  安全帯 — Safety harness           │  ← Compact recent list (3 max)
│  足場 — Perancah                   │
│  墜落 — Jatuh dari ketinggian      │
│                                     │
└─────────────────────────────────────┘
```

**Key changes:**
1. **Circular progress ring** replaces both the 4-box stats bar AND the linear progress bar. One visual = all info. The ring is satisfying to watch fill up.
2. **Streak hero** — emotional, prominent when active. Hidden when 0.
3. **Primary CTA** — always above the fold. ONE button. Smart logic decides what to show.
4. **Quick action pills** — 2×2 grid of the 4 most-used modes. Not all 18. Full mode list is on Belajar tab.
5. **Remove**: Content stats footer (1438 / 95 / 579 counts — useless for daily use), SRS breakdown pills (moved to Saya → Stats), Starter pack section (replaced by onboarding).

**Circular Progress Ring Component:**

```jsx
// components/ProgressRing.jsx
function ProgressRing({ current, total, size = 140, stroke = 8 }) {
  const pct = total > 0 ? (current / total) * 100 : 0;
  const radius = (size - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className={s.ringContainer}>
      <svg width={size} height={size} className={s.ring}>
        {/* Track */}
        <circle cx={size/2} cy={size/2} r={radius}
          fill="none" stroke="var(--ssw-border)" strokeWidth={stroke} />
        {/* Progress */}
        <circle cx={size/2} cy={size/2} r={radius}
          fill="none" stroke="var(--ssw-amber)" strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size/2} ${size/2})`}
          style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
      </svg>
      <div className={s.ringCenter}>
        <div className={s.ringPct}>{Math.round(pct)}%</div>
        <div className={s.ringSub}>{current}/{total}</div>
      </div>
    </div>
  );
}
```

---

### B4. Flashcard Mode — The Core Experience

This is where users spend 80% of their time. It must be perfect.

**Current issues:**
- Card flip is instant (no animation) — feels cheap
- JP text can be small on compound terms
- FSRS 4-button rating appears only on long-press (hidden feature!)
- Swipe left/right works but has no visual feedback
- No visual distinction between "seen" and "unseen" cards

**Redesigned Flashcard:**

```
┌─────────────────────────────────────┐
│ ← Kartu          534/1438  ★ ⚙     │  ← Sticky header: back, counter, star, settings
│ ██████████████████░░░░░░░░░  37%    │  ← Thin progress bar
├─────────────────────────────────────┤
│                                     │
│  ┌─ FRONT ────────────────────────┐ │
│  │                                │ │
│  │      🏗 jenis_kerja            │ │  ← Category pill (top-left, subtle)
│  │                                │ │
│  │           足場                  │ │  ← JP text: LARGE (28-36px)
│  │         あしば                  │ │  ← Furigana: below, amber color
│  │         ashiba                  │ │  ← Romaji: smallest, muted
│  │                                │ │
│  │                                │ │
│  │        [ Tap untuk balik ]     │ │  ← Hint text (fades after 3rd card)
│  │                                │ │
│  │  SRS: Matang · 14 hari lagi    │ │  ← SRS status (bottom, subtle)
│  └────────────────────────────────┘ │
│                                     │
│  ┌──────┐  ┌──────┐  ┌──────┐      │
│  │  ←   │  │ flip │  │  →   │      │  ← Navigation: prev / flip / next
│  └──────┘  └──────┘  └──────┘      │     (thumb-zone, bottom 1/3)
│                                     │
└─────────────────────────────────────┘
```

```
┌─────────────────────────────────────┐
│ ← Kartu          534/1438  ★ ⚙     │
│ ██████████████████░░░░░░░░░  37%    │
├─────────────────────────────────────┤
│                                     │
│  ┌─ BACK (flipped) ──────────────┐ │
│  │  🏗 jenis_kerja   #534        │ │
│  │                                │ │
│  │     足場                       │ │  ← JP text (smaller on back)
│  │     あしば · ashiba            │ │
│  │                                │ │
│  │     Perancah                   │ │  ← ID translation: BOLD, prominent
│  │                                │ │
│  │  ─────────────────────────     │ │
│  │  Struktur sementara dari      │ │  ← Description: readable size
│  │  baja/kayu untuk bekerja      │ │
│  │  di ketinggian. WAJIB:        │ │
│  │  ① Inspeksi harian            │ │  ← Smart DescBlock formatting
│  │  ② Pagar pengaman ≥90cm       │ │
│  │  ③ Lantai kerja ≥40cm lebar   │ │
│  └────────────────────────────────┘ │
│                                     │
│  ┌──────────────────────────────┐   │  ← FSRS rating (ALWAYS visible
│  │ 🔴    🟠     🟢      💎     │   │     after flip, not long-press)
│  │ Lagi  Susah   Oke    Mudah  │   │
│  │ <1m   3h      1d     4d     │   │  ← Interval preview
│  └──────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

**Key design decisions:**

1. **Card flip animation** — 3D rotateY with perspective. Not just show/hide.
   ```css
   .card {
     perspective: 1000px;
     transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
   }
   .card[data-flipped="true"] {
     transform: rotateY(180deg);
   }
   .cardBack {
     transform: rotateY(180deg);  /* Pre-rotated so it reads correctly when flipped */
   }
   ```

2. **FSRS rating ALWAYS visible after flip** — current long-press is hidden UX. Junior users will never discover it. Just show 4 buttons. They're the most important interaction in the app.

3. **Remove binary ✅/❌ buttons** — FSRS rating IS the mark. Rating 1 (Lagi) = mark as unknown. Rating 3-4 = mark as known. No need for two separate systems.

4. **Swipe feedback** — card tilts slightly in swipe direction with spring physics:
   ```css
   .card[data-swiping="left"] {
     transform: translateX(-30px) rotate(-3deg);
     opacity: 0.85;
   }
   .card[data-swiping="right"] {
     transform: translateX(30px) rotate(3deg);
     opacity: 0.85;
   }
   ```

5. **Furigana always visible** on front. No toggle needed at this level (N5 students need it).

6. **"Tap untuk balik" hint** — shows on first 3 cards, then fades permanently. Teaches the mechanic without an onboarding slide.

---

### B5. Quiz Mode — Consistent Shell, Mode-Specific Flavor

All quiz-type modes (Kuis, JAC, Wayground, CSV Vocab, Angka, Jebak, Simulasi) share `QuizShell` but each gets a **visual flavor** via accent color and header treatment.

**QuizShell redesign:**

```
┌─────────────────────────────────────┐
│ ← Kuis          12/20  🔥3         │  ← Back, progress counter, streak
│ ██████████████████░░░░░░░░░░░       │  ← Progress bar (accent colored)
├─────────────────────────────────────┤
│                                     │
│  ┌────────────────────────────────┐ │
│  │                                │ │
│  │  安全帯の正しい使い方は？       │ │  ← Question (JP, large)
│  │                                │ │
│  │  Cara penggunaan safety        │ │  ← Hint/translation (smaller, muted)
│  │  harness yang benar?           │ │
│  │                                │ │
│  └────────────────────────────────┘ │
│                                     │
│  ┌────────────────────────────────┐ │
│  │  A  腰に巻いて使う             │ │  ← Options: letter prefix + JP
│  │     Dililitkan di pinggang     │ │     Sub-text: Indonesian translation
│  └────────────────────────────────┘ │
│  ┌────────────────────────────────┐ │
│  │  B  高い所に掛けて使う  ✓      │ │  ← Correct: green border + ✓
│  │     Dikaitkan di tempat tinggi │ │
│  └────────────────────────────────┘ │
│  ┌────────────────────────────────┐ │
│  │  C  頭にかぶって使う     ✗     │ │  ← User's wrong answer: red + ✗
│  │     Dipakai di kepala          │ │
│  └────────────────────────────────┘ │
│  ┌────────────────────────────────┐ │
│  │  D  足に付けて使う             │ │  ← Unselected: dimmed
│  │     Dipasang di kaki           │ │
│  └────────────────────────────────┘ │
│                                     │
│  ┌── 💡 Penjelasan ──────────────┐  │  ← Explanation (slides up after answer)
│  │  Safety harness (安全帯) WAJIB │  │
│  │  dikaitkan di titik jangkar    │  │
│  │  yang lebih TINGGI dari...     │  │
│  └────────────────────────────────┘  │
│                                     │
│  ┌────────────────────────────────┐ │
│  │         Lanjut →               │ │  ← Next button (or auto-advance)
│  └────────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

**Post-answer reveal improvements:**
- ALL options show both JP AND Indonesian after answering (currently only some modes do this)
- Correct answer: green left border + ✓ icon
- User's wrong answer: red left border + ✗ icon
- Unselected options: dimmed but still readable
- Explanation slides up with spring animation (not instant)

**Mode-specific flavors:**

| Mode | Accent Color | Header Extra | Special |
|------|-------------|-------------|---------|
| Kuis | amber (default) | Count selector | Lemah mode toggle |
| JAC Official | `#dc2626` (red) | Set name badge | Photo warning ⚠ |
| Wayground | `#0284C7` (blue) | Set name + emoji | Score history badge |
| CSV Vocab | `#7c3aed` (purple) | Set name | Hint always shown |
| Simulasi | `#dc2626` (red) | BIG countdown timer | Auto-finish on time-up |
| Angka Kunci | `#059669` (green) | — | Number-focused layout |
| Soal Jebak | `#ea580c` (orange) | ⚠ badge | Side-by-side comparison after |

---

### B6. Result Screen — Celebration or Encouragement

**Current:** Static grade emoji + percentage + review list.

**Redesigned — two distinct emotional paths:**

**Path A: Score ≥ 70% — CELEBRATE**
```
┌─────────────────────────────────────┐
│                                     │
│           ✨ 🏆 ✨                  │  ← Animated (bounce + sparkle)
│                                     │
│            85%                      │  ← Large, grade-colored
│       Bagus Sekali!                 │
│                                     │
│    17/20 benar · 🔥 12 streak      │
│                                     │
│  ┌─────────────────────────────────┐│
│  │  ╭──────────── 📊 ──────────╮  ││  ← Mini chart: score history
│  │  │  ·     ·              ·  │  ││     for this set (shows improvement)
│  │  │    ·      ·        ·     │  ││
│  │  │       ·      · ·        │  ││
│  │  ╰─────────────────────────╯  ││
│  │  Skor terakhir 3x: 65→72→85  ││
│  └─────────────────────────────────┘│
│                                     │
│  ┌────────────────────────────────┐ │
│  │         🔄 Ulang Lagi         │ │
│  └────────────────────────────────┘ │
│  ┌────────────────────────────────┐ │
│  │     ❌ Latih 3 Soal Salah     │ │
│  └────────────────────────────────┘ │
│  ┌────────────────────────────────┐ │
│  │         ← Kembali             │ │
│  └────────────────────────────────┘ │
│                                     │
│  ── Review Jawaban Salah ──        │
│  [expandable wrong answer cards]   │
│                                     │
└─────────────────────────────────────┘
```

**Path B: Score < 50% — ENCOURAGE (no shame)**
```
┌─────────────────────────────────────┐
│                                     │
│              💪                     │  ← Gentle, not sad
│                                     │
│            35%                      │
│      Jangan Menyerah!              │
│                                     │
│    7/20 benar                       │
│                                     │
│  ┌─ 💡 Tips ────────────────────┐   │  ← Actionable advice
│  │ Kamu banyak salah di kategori│   │
│  │ 法規 (Hukum). Coba pelajari  │   │
│  │ kartu hukum dulu sebelum     │   │
│  │ kuis lagi.                   │   │
│  │                              │   │
│  │ [→ Buka Kartu: Hukum]       │   │  ← Direct link to filtered flashcards
│  └──────────────────────────────┘   │
│                                     │
│  [🔄 Ulang]  [❌ Latih Salah (13)] │
│  [← Kembali]                       │
│                                     │
└─────────────────────────────────────┘
```

**Key additions:**
1. **Score history mini-chart** — shows improvement over time. "You're getting better" is more motivating than a single number.
2. **Weakness analysis** — identify which CATEGORY the user struggles with, suggest specific flashcard review.
3. **Animated grade** — scaleIn + sparkle for high scores. Gentle fadeIn for low scores (no dramatic failure animation).

---

### B7. Micro-interactions & Animation Spec

| Interaction | Animation | Duration | Easing |
|-------------|-----------|----------|--------|
| Page enter | fadeIn + translateY(12px→0) | 250ms | ease-out |
| Card flip | rotateY(0→180deg) with perspective | 400ms | cubic-bezier(0.4,0,0.2,1) |
| Card swipe | translateX + rotate(±3deg) | spring | — |
| Button tap | scale(1→0.95→1) | 120ms | ease |
| Option select (correct) | border-color + bg pulse green | 300ms | ease |
| Option select (wrong) | border-color + subtle shake(2px) | 300ms + 200ms | ease + linear |
| Toast appear | translateY(20px→0) + opacity | 250ms | ease-out |
| Toast dismiss | translateY(0→20px) + opacity | 200ms | ease-in |
| Progress ring fill | stroke-dashoffset | 800ms | ease-in-out |
| Streak counter increment | scaleIn + number roll | 400ms | spring |
| Mode tile tap | scale(0.97) + shadow deepen | 100ms | ease |
| Bottom nav switch | active indicator slide | 200ms | ease-in-out |
| Explanation reveal | maxHeight(0→auto) + opacity | 300ms | ease-out |
| FSRS button press | scale(0.9→1.05→1) + ripple | 200ms | spring |

**prefers-reduced-motion:** All animations → `duration: 0.01ms`. Already partially implemented but needs to cover ALL of the above.

---

### B8. Typography Scale

```css
/* Font sizes — designed for 360px mobile viewport */
--fs-hero: 32px;       /* Result screen percentage */
--fs-jp-primary: 28px; /* Flashcard front JP text */
--fs-jp-back: 20px;    /* Flashcard back JP text */
--fs-title: 17px;      /* Section titles, header brand */
--fs-subtitle: 15px;   /* Mode labels, CTA text */
--fs-body: 13px;       /* Descriptions, explanations */
--fs-caption: 12px;    /* Hints, translations, secondary info */
--fs-small: 11px;      /* Timestamps, counts, muted info */
--fs-micro: 10px;      /* Labels, badges, section headers */
--fs-nano: 9px;        /* Fine print, targets, footnotes */

/* Line heights */
--lh-tight: 1.2;      /* Headings, single-line */
--lh-normal: 1.5;     /* Body text */
--lh-relaxed: 1.75;   /* Japanese text (needs room for furigana) */

/* Font stacks */
--font-ui: 'DM Sans', system-ui, sans-serif;
--font-jp: 'Noto Sans JP', 'BIZ UDGothic', sans-serif;

/* Weight usage */
/* 400: body text, descriptions */
/* 500: Japanese text */
/* 600: secondary labels */
/* 700: primary labels, buttons */
/* 800: hero numbers, section titles */
```

---

### B9. Color System Enhancement

Current theme is solid. Add semantic color tokens:

```css
/* Status colors — used across all modes */
--color-success: #16a34a;
--color-success-bg: rgba(22, 163, 74, 0.10);
--color-success-border: rgba(22, 163, 74, 0.30);

--color-error: #dc2626;
--color-error-bg: rgba(220, 38, 38, 0.10);
--color-error-border: rgba(220, 38, 38, 0.30);

--color-warning: #f59e0b;
--color-warning-bg: rgba(245, 158, 11, 0.10);

--color-info: #3b82f6;
--color-info-bg: rgba(59, 130, 246, 0.10);

/* SRS-specific colors */
--srs-again: #f87171;
--srs-hard: #fb923c;
--srs-good: #4ade80;
--srs-easy: #60a5fa;

/* Grade colors (matches getGrade) */
--grade-s: #d97706;
--grade-a: #16a34a;
--grade-b: #0284c7;
--grade-c: #dc2626;
```

---

### B10. Loading & Empty States

**Loading states — skeleton, not spinner:**

```
┌─────────────────────────────────────┐
│ ← Kartu           ░░░░░/1438       │
│ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░     │
├─────────────────────────────────────┤
│                                     │
│  ┌────────────────────────────────┐ │
│  │  ░░░░░░░░░░                    │ │  ← Category pill skeleton
│  │                                │ │
│  │        ░░░░░░░░                │ │  ← JP text skeleton
│  │        ░░░░░                   │ │  ← Furigana skeleton
│  │        ░░░░░░░                 │ │  ← Romaji skeleton
│  │                                │ │
│  └────────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

Skeleton shimmer animation:
```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--ssw-surface) 25%,
    var(--ssw-surfaceHover) 50%,
    var(--ssw-surface) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  border-radius: 6px;
}
```

**Empty states — helpful, not sad:**

| State | Illustration | Message | CTA |
|-------|-------------|---------|-----|
| No due cards (SRS) | 🎉 | "Tidak ada kartu jatuh tempo. Kamu up to date!" | "Pelajari kartu baru →" |
| No wrong answers (Focus) | 💯 | "Belum ada jawaban salah. Terus belajar!" | "Coba Kuis →" |
| Search no results | 🔍 | "Tidak ditemukan untuk '{query}'" | "Coba kata kunci lain" |
| No starred cards | ⭐ | "Belum ada kartu favorit. Tap ★ di Kartu untuk menandai." | "Buka Kartu →" |
| No progress yet | 🌱 | "Mulai perjalananmu! Buka kartu pertamamu." | "Mulai →" |

---

### B11. Settings & Preferences (Saya Tab)

```
┌─────────────────────────────────────┐
│  👤 Saya                            │
├─────────────────────────────────────┤
│                                     │
│  ── Progress ──                     │
│  [Progress Ring]  37% hafal         │
│  534/1438 kartu · 🔥 5 hari        │
│                                     │
│  ── SRS ──                          │
│  Matang: 120  Muda: 89  Baru: 1229 │
│  [Lihat Detail →]                   │
│                                     │
│  ── Pengaturan ──                   │
│  Jalur belajar    [⚡ Lifeline  ▼]  │
│  Tema             [🌙 Gelap    ▼]  │
│  Target harian    [20 kartu    ▼]  │
│  Auto-next kuis   [1.5 detik   ▼]  │
│                                     │
│  ── Data ──                         │
│  [💾 Ekspor Progress]               │
│  [📥 Impor Progress]               │
│  [🗑️ Reset Semua Data]             │
│                                     │
│  ── Info ──                         │
│  [📂 Sumber Materi]                │
│  [ℹ️ Tentang Aplikasi]              │
│                                     │
│  SSW Konstruksi v3.2.0             │
│  by Nugget Nihongo                  │
│                                     │
└─────────────────────────────────────┘
```

**Reset Semua Data** requires:
1. First tap → "Yakin? Semua progress akan hilang."
2. 3-second countdown → "Reset (3... 2... 1...)"
3. Second tap during countdown → executes reset
4. Shows confirmation toast

---

### B12. Accessibility Checklist

| Item | Current | Target |
|------|---------|--------|
| Button aria-labels | ❌ Missing on emoji-only buttons | ✅ All buttons labeled |
| Focus indicators | ❌ None visible | ✅ 2px amber outline on :focus-visible |
| Toast announcements | ❌ No aria-live | ✅ role="alert" aria-live="polite" |
| Color contrast | ⚠ textDim fails 4.5:1 | ✅ All text ≥ 4.5:1 in both themes |
| Focus management | ❌ Lost on mode switch | ✅ Focus moves to mode header on enter |
| Skip to content | ❌ None | ✅ Skip nav link for keyboard users |
| Touch targets | ⚠ Some < 44px | ✅ All interactive ≥ 44×44px |
| Screen reader flow | ❌ Not tested | ✅ Landmark regions, heading hierarchy |

---

## PART III: EXECUTION ROADMAP

### Phase 1: Foundation (2 sessions)
> Storage engine + Context extraction + ErrorBoundary

1. Build `src/storage/` engine with v1→v2 migration
2. Write 30 storage tests
3. Extract ProgressContext, SRSContext, AppContext
4. Build ModeRouter with ErrorBoundary
5. Create `modes.js` single registry
6. Reduce App.jsx to ~150 lines
7. Verify all 18 modes still work

### Phase 2: Navigation Restructure (1 session)
> 3-tab layout + Belajar sections + Saya tab

1. Restructure BottomNav to 3 tabs
2. Build Belajar tab with section groups
3. Build Saya tab (settings, export, stats)
4. Move stats/export/sumber into Saya

### Phase 3: Dashboard Redesign (1 session)
> Progress ring + streak hero + smart CTA

1. Build ProgressRing component
2. Redesign Dashboard layout
3. Remove clutter (content stats, SRS pills → Saya)
4. Smart Quick Start logic

### Phase 4: Flashcard Overhaul (2 sessions)
> 3D flip + always-visible FSRS + swipe feedback

1. CSS-based 3D card flip animation
2. FSRS rating always visible after flip (remove long-press)
3. Merge binary known/unknown into FSRS rating
4. Swipe visual feedback (tilt + spring)
5. "Tap untuk balik" contextual hint

### Phase 5: Quiz Shell Polish (1-2 sessions)
> Post-answer reveal + mode flavors + explanation animation

1. All options show JP+ID after answer
2. Correct/wrong visual treatment
3. Explanation slide-up animation
4. Mode-specific accent colors and header treatments
5. Score history mini-chart on ResultScreen

### Phase 6: CSS Modules Migration (2-3 sessions)
> 822 inline styles → 0

1. Convert shared components first
2. Then modes (smallest → largest)
3. Apply typography scale + color tokens
4. Verify dark/light theming

### Phase 7: Onboarding Redesign (1 session)
> Interactive onboarding + goal setting

1. Merge track picker into onboarding flow
2. Build interactive mini-flashcard demo step
3. Add daily goal setter
4. Remove old 4-slide Onboarding

### Phase 8: Empty States + Loading + a11y (1 session)
> Skeleton loading + empty states + accessibility

1. Build skeleton components
2. Build all empty states (5 contexts)
3. Add aria-labels, focus management, live regions
4. Color contrast audit + fix

### Phase 9: CI/CD + DX (1 session)
> GitHub Actions + auto-deploy + testing expansion

1. CI pipeline (lint + test + build)
2. Auto-deploy to Pages with SW cache bump
3. Component tests for QuizShell, Dashboard, ResultScreen
4. Bundle visualizer

### Phase 10: QA + Release (1 session)
> Full regression test + deploy

1. Test all 18 modes
2. Test storage migration (old → new format)
3. Test offline behavior
4. Test on real Android device (budget)
5. Version bump + CHANGELOG
6. Deploy

**Total: ~13-16 sessions**

---

## Appendix: File Changes Summary

| Area | Files Added | Files Modified | Files Deleted |
|------|------------|----------------|---------------|
| Storage | 4 (engine, schema, migrations, index) | ~15 (all storage consumers) | 0 |
| Contexts | 3 (Progress, SRS, App) | 1 (App.jsx) | 0 |
| Router | 2 (ModeRouter, modes.js) | 1 (App.jsx) | 0 |
| CSS Modules | ~30 (.module.css files) | ~30 (all JSX files) | 0 |
| Components | 3 (ProgressRing, ErrorFallback, Skeleton) | ~12 | 0 |
| Navigation | 0 | 3 (BottomNav, Dashboard, App) | 0 |
| CI/CD | 2 (.github/workflows/) | 1 (vite.config.js) | 0 |
| Tests | 3+ (storage, component, hook tests) | 0 | 0 |

---

*Dokumen ini adalah master blueprint. Agent Sonnet harus membaca ini + `_MAP.md` sebelum memulai. Semua design decisions sudah final — tidak perlu tanya Nugget lagi kecuali ada blocking issue.*
