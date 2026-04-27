# 🗺️ _MAP.md — SSW Flashcard App · Agent Orientation

> **Last updated:** 2026-04-28 by Crispy (Phase 3 UX Polish complete)
> **Status:** Phase 1 ✅ Phase 2 ✅ Phase 3 ✅ — production-ready, deploy to GitHub Pages
> **Original:** `legacy/ssw_flashcards_v87.jsx` (7,390 lines, reference only)

---

## 1. What This App Is

A React-based study tool for the **JAC SSW (Specified Skilled Worker) Construction exam** in Japan. Interface is in **Indonesian** (Bahasa Indonesia), content is **Japanese↔Indonesian bilingual**. It helps Indonesian construction workers study for the SSW visa exam covering safety, law, construction techniques, tools, and vocabulary.

### Branding

- **Parent brand:** Nugget Nihongo
- **Product name:** SSW Konstruksi
- **Subtitle (JP):** 土木 · 建築 · ライフライン設備
- **Subtitle (ID):** Teknik Sipil · Bangunan · Lifeline & Peralatan
- **In-app header:** SSW Konstruksi · by Nugget Nihongo

### 3 Study Tracks (jalur belajar)

The JAC exam has 3 specialization tracks. Users pick their track on first launch;
all content (cards, quizzes, simulation) auto-filters to that track.

| Track | JP | ID | Icon | Categories |
|-------|----|----|------|-----------|
| Teknik Sipil | 土木 | Jalan, jembatan, terowongan, bendungan | 🏗️ | jenis_kerja (civil subset), alat_umum (civil subset) |
| Bangunan | 建築 | Gedung, bekisting, tulangan, finishing | 🏢 | jenis_kerja (building subset), alat_umum (building subset) |
| Lifeline & Peralatan | ライフライン・設備 | Listrik, pipa, HVAC, pemadam, telekom | ⚡ | listrik, pipa, telekomunikasi, isolasi, pemadam |
| **Umum (共通)** | 共通 | Wajib semua jalur | 📋 | salam, hukum, keselamatan, karier |

**Implementation note:** Current 12 categories need a `track` mapping field added.
Some categories (jenis_kerja, alat_umum) contain cards from multiple tracks — these
will need per-card track tagging or sub-categorization. The 共通 (common) categories
appear in ALL tracks automatically.

### Deployment & Target

- **Deploy:** GitHub Pages (static site, simple)
- **Target users:** Junior SSW candidates, Japanese level N5-N4 (beginners)
- **Progress persistence:** Users export/import JSON to save progress across devices
- **Live v87 (previous):** https://nuggetenak.github.io/Nugget-Nihongo-SSW-Konstruksi-v87/

---

## 2. Directory Structure

```
Nugget-Nihongo-SSW-Konstruksi/
├── _MAP.md                    ← YOU ARE HERE
├── README.md                  ← Public readme
├── index.html                 ← Vite entry point (loads src/main.jsx)
├── package.json               ← npm deps: react, react-dom, vite
├── vite.config.js             ← Vite config (base: /Nugget-Nihongo-SSW-Konstruksi/)
├── docs/
│   ├── PROPOSAL.md            ← Full refactor proposal (7 pillars)
│   └── id-mapping-v87-to-v90.json ← Old→new card ID mapping (1438 entries)
├── scripts/
│   └── phase1_normalize.py    ← Data normalization script (run once, done)
├── legacy/
│   └── ssw_flashcards_v87.jsx ← Original monolith (7,390 lines, reference only)
│
└── src/                       ← 37 source files, 5778 lines total
    ├── main.jsx               ← React root (5 lines)
    ├── App.jsx                ← Root component: onboarding, nav, routing (268 lines)
    │
    ├── data/                  ← All content data (3533 lines)
    │   ├── index.js           ← Barrel export + derived constants
    │   ├── cards.js           ← CARDS[1438] — all flashcards (1599 lines)
    │   ├── jac-official.js    ← JAC_OFFICIAL[~95] — exam questions (975 lines)
    │   ├── wayground-sets.js  ← WAYGROUND_SETS[12] — ~597 quiz questions (819 lines)
    │   ├── angka-kunci.js     ← ANGKA_KUNCI[~45] — key numbers
    │   ├── danger-pairs.js    ← DANGER_PAIRS[~20] — confusing term pairs
    │   └── categories.js      ← CATEGORIES, SOURCE_META, getCatInfo, etc.
    │
    ├── modes/                 ← One file per mode (1167 lines total)
    │   ├── FlashcardMode.jsx  ← Swipeable cards + known/unknown (140 lines)
    │   ├── QuizMode.jsx       ← Auto-generated quiz, 3 difficulty levels (86 lines)
    │   ├── JACMode.jsx        ← Official JAC exam questions (107 lines)
    │   ├── WaygroundMode.jsx  ← Technical quiz sets from sensei (109 lines)
    │   ├── AngkaMode.jsx      ← Key numbers quiz (62 lines)
    │   ├── DangerMode.jsx     ← Confusing term pairs drill (79 lines)
    │   ├── SimulasiMode.jsx   ← Full exam simulation + timer (75 lines)
    │   ├── SprintMode.jsx     ← Speed drill 60s (123 lines)
    │   ├── FocusMode.jsx      ← Weakness drill (66 lines)
    │   ├── StatsMode.jsx      ← Progress statistics (100 lines)
    │   ├── SearchMode.jsx     ← Full-text search (64 lines)
    │   ├── GlossaryMode.jsx   ← Sorted glossary (78 lines)
    │   └── SumberMode.jsx     ← Browse by source (78 lines)
    │
    ├── components/            ← Shared UI components (431 lines)
    │   ├── QuizShell.jsx      ← Unified quiz flow wrapper (211 lines) ★
    │   ├── ResultScreen.jsx   ← Unified result/review screen (90 lines)
    │   ├── OptionButton.jsx   ← Quiz option with badge + feedback (69 lines)
    │   ├── ProgressBar.jsx    ← Reusable progress bar (10 lines)
    │   └── JpDisplay.jsx      ← JpFront + DescBlock renderers (51 lines)
    │
    ├── hooks/                 ← Custom React hooks (119 lines)
    │   ├── index.js           ← Barrel export
    │   ├── usePersistedState.js ← window.storage persistence
    │   ├── useQuizKeyboard.js ← Keyboard shortcuts (1/2/3/4, Enter)
    │   └── useStreak.js       ← Answer streak tracking
    │
    ├── utils/                 ← Pure functions (190 lines)
    │   ├── index.js           ← Barrel export
    │   ├── shuffle.js         ← Fisher-Yates shuffle
    │   ├── jp-helpers.js      ← stripFuri, extractReadings, jpFontSize
    │   ├── wrong-tracker.js   ← Wrong-answer storage helpers
    │   └── quiz-generator.js  ← Quiz question generator (3 difficulties)
    │
    └── styles/
        └── theme.js           ← Design tokens: T (colors/spacing) + getGrade (65 lines)
```

---

## 3. Data Schemas

### 3.1 CARDS (flashcards)

```js
{
  id: 42,                        // Unique numeric ID — SEQUENTIAL 1-1438, no gaps
  category: "listrik",           // Category key (see CATEGORIES)
  source: "jac-ch5",             // Canonical source key (see list below)
  furi: "せっちぼう",              // Hiragana reading — ALL 1438 cards have this field
  jp: "接地棒",                   // Japanese text (kanji, may contain inline furigana)
  romaji: "secchibou",           // Romanization
  id_text: "Batang pentanahan",  // Indonesian translation (short)
  desc: "Batang yang didorong..."// Indonesian explanation (long)
}
```

**12 categories:** salam, hukum, jenis_kerja, listrik, telekomunikasi, pipa, isolasi, pemadam, keselamatan, karier, alat_umum, (+ virtual: bintang)

**16 canonical sources:** jac-ch1, jac-ch2, jac-ch3, jac-ch4, jac-ch5, jac-ch6, jac-ch7, jac-gakka1, jac-gakka2, jac-jitsugi1, jac-jitsugi2, vocab-lifeline, vocab-jac, vocab-core, vocab-exam, vocab-teori

### 3.2 JAC_OFFICIAL (exam questions)

```js
{
  id: "tt1_q01",                 // String ID: {set}_{question}
  set: "tt1",                    // Set key: tt1, tt2, st1, st2
  setLabel: "学科 Set 1",        // Human-readable set name
  jp: "作業開始前に...",           // Question in Japanese
  hiragana: "さぎょう...",        // Full hiragana reading (separate field!)
  id_text: "Pertemuan harian...", // Question in Indonesian
  options: ["朝礼（...）", ...],  // Array of option strings (mixed JP+ID)
  answer: 0,                     // 0-BASED INDEX — UNIFIED with Wayground (Phase 1)
  hasPhoto: false,               // Whether original has a photo
  photoDesc: null,               // Text description of photo if hasPhoto
  explanation: "朝礼 = ...",     // Indonesian explanation
  related_card_id: 1             // Links to CARDS[].id (renumbered in Phase 1)
}
```

### 3.3 WAYGROUND_SETS (quiz sets)

```js
{
  id: "wt1",                     // Set ID
  title: "Teori Set 1 · 20qs",  // Display title
  subtitle: "安全管理...",        // Subtitle
  emoji: "🎯",                   // Icon
  color: "#f97316",              // Theme color
  grad: "linear-gradient(...)",  // Gradient CSS
  source: "CSV Teori v2 / JAC Official",
  questions: [{
    id: 1,                       // Numeric, per-set (not globally unique)
    q: "KY活動《かつどう》...",   // Question (furigana uses 《》 format)
    hint: "Langkah pertama...",  // Indonesian hint
    opts: ["対策を決める", ...],   // Japanese options
    opts_id: ["Menentukan...", ...], // Indonesian options (parallel array)
    ans: 1,                      // ⚠ 0-BASED INDEX (0 = first option)
    exp: "4 langkah KY: ...",    // Indonesian explanation
  }]
}
```

### ✅ Answer Indexing — UNIFIED (Phase 1)

| Data Source    | Index Base | `answer: 0` means |
|----------------|-----------|-------------------|
| JAC_OFFICIAL   | 0-based   | First option      |
| WAYGROUND_SETS | 0-based   | First option      |

Both sources now use **0-based indexing**. This was unified in Phase 1 (JAC was previously 1-based).

---

## 4. Mode Components Reference

| Mode | File | Purpose | Has Storage | Has Keyboard |
|------|------|---------|-------------|-------------|
| FlashcardMode | FlashcardMode.jsx | Swipeable card viewer | known/unknown (App-level) | ← → Space |
| QuizMode | QuizMode.jsx | Auto-generated quiz | ssw-quiz-wrong | 1/2/3 Enter |
| JACMode | JACMode.jsx | Official JAC questions | ssw-wrong-counts | Enter/Space |
| AngkaMode | AngkaMode.jsx | Key numbers | — | 1/2/3/4 Enter |
| DangerMode | DangerMode.jsx | Confusing pairs drill | — | 1/2/3 Enter |
| SimulasiMode | SimulasiMode.jsx | Exam simulation | — | Enter |
| StatsMode | StatsMode.jsx | Progress stats | reads all keys | — |
| SearchMode | SearchMode.jsx | Full-text search | — | — |
| SprintMode | SprintMode.jsx | Speed drill | — | — |
| FocusMode | FocusMode.jsx | Weakness drill | reads all keys | — |
| GlossaryMode | GlossaryMode.jsx | Sorted glossary | — | — |
| SumberMode | SumberMode.jsx | Browse by source | — | — |
| WaygroundMode | WaygroundMode.jsx | Technical quiz sets | ssw-wg-wrong-{id} | Enter/Space |

---

## 5. Persistent Storage Keys

| Key | Owner | Format | Content |
|-----|-------|--------|---------|
| `ssw-quiz-wrong` | QuizMode | `{cardId: {count, lastWrong}}` | Wrong counts from auto-generated quizzes |
| `ssw-wrong-counts` | JACMode | `{qId: {count, lastWrong}}` | Wrong counts from JAC official questions |
| `ssw-wg-wrong-{setId}` | WaygroundMode | `{qIdx: {count, lastWrong}}` | Wrong counts per Wayground set |
| `ssw-known` | App (via FlashcardMode) | `[cardId, ...]` | Cards marked "known" |
| `ssw-unknown` | App (via FlashcardMode) | `[cardId, ...]` | Cards marked "unknown" |
| `ssw-starred` | App | `[cardId, ...]` | Starred/bookmarked cards |

---

## 6. Architecture Decisions & Trade-offs

### Current State (Phase 3 complete)
- **40 source files, 6055 lines total** — builds in ~500ms with Vite
- **Build output:** `dist/index.html` + `dist/assets/index-*.js` (1.38MB, 441KB gzipped)
- **UX flow:** Onboarding (4 steps) → Track Picker (3 tracks) → Dashboard → Bottom Nav
- **Bottom navigation:** 4 tabs — 🏠 Beranda, 📚 Belajar, ✍️ Ujian, ⋯ Lainnya
- **Dashboard:** Progress ring, smart suggestion, stats row, quick actions
- **Track system:** Track selection persisted, shown in header badge
- **Design:** "Warm Industrial Japanese" — amber accent, dark bg, CSS animations
- **QuizShell:** wraps 6 quiz modes with unified UX
- **No code file exceeds 264 lines**

### Deployment Strategy
- **GitHub Pages (recommended):** `npm run build` → deploy `dist/` folder
  - Set GitHub Pages source to "GitHub Actions" or deploy `dist/` manually
  - `vite.config.js` has `base: '/Nugget-Nihongo-SSW-Konstruksi/'` for GH Pages path
- **Local dev:** `npm run dev` → http://localhost:5173
- **Preview build:** `npm run preview` → serves `dist/` locally

---

## 7. Known Issues & TODO

### 🔴 HIGH Priority
- [x] ~~**Wire up multi-file imports**~~ ✅ Phase 2 (Vite, builds in 452ms)
- [x] ~~**Unify answer indexing** — JAC (1-based) → all 0-based~~ ✅ Phase 1
- [x] ~~**Add furi field to all 730 cards** missing it~~ ✅ Phase 1
- [x] ~~**Add bundler** (esbuild or vite)~~ ✅ Phase 2 (Vite + React plugin)

### 🟡 MEDIUM Priority
- [x] ~~**Replace inline styles** with theme tokens~~ ✅ Phase 2 (T object, 0 inline hex colors)
- [x] ~~**Integrate shared hooks** into mode components~~ ✅ Phase 2 (usePersistedState, useQuizKeyboard, useStreak)
- [x] ~~**Build `<QuizShell>` wrapper**~~ ✅ Phase 2 (211 lines, wraps 6 quiz modes)
- [x] ~~**Build `<ResultScreen>` component**~~ ✅ Phase 2 (90 lines, unified results)
- [x] ~~**Fix romaji typo** (`supeeसाaa` → `supeesaa`)~~ ✅ Phase 1
- [x] ~~**Remove duplicate Wayground questions** (wt1 Q4 ≈ Q5)~~ ✅ Phase 1
- [x] ~~**Normalize source names**~~ ✅ Phase 1 (16 canonical names)

### 🟢 LOW Priority (Phase 3+)
- [ ] **3-track navigation** (土木 / 建築 / ライフライン) — track picker + auto-filter
- [ ] Add breadcrumb navigation in nested modes
- [ ] Add onboarding flow for new users
- [ ] Add breadcrumb navigation
- [ ] Implement spaced repetition (SM-2 or Leitner)
- [ ] Add study plan mode (4-week guided plan)
- [ ] PWA manifest + service worker
- [ ] Export/import progress JSON
- [ ] Add card images for tool recognition questions

---

## 8. Agent Instructions

### When Starting a New Session
1. Read this `_MAP.md` first
2. Check `docs/PROPOSAL.md` for the full refactor plan
3. Ask Nugget which phase/task to work on
4. Test changes against `legacy/ssw_flashcards_v87.jsx` to ensure no regressions

### Code Conventions
- **Language:** Indonesian for UI text and user-facing strings
- **Comments:** English for code comments
- **Git identity:** `Crispy <crispy@nugget.local>`
- **Commit style:** Descriptive, prefixed (e.g., `refactor: extract QuizMode to separate file`)
- **Data edits:** Always note the source (PDF page, CSV row, agent-generated)

### Working with Data Files
- `src/data/cards.js` is 1,601 lines — don't re-read the whole thing unless needed
- When adding cards, use the next available ID after the current max
- When adding questions, check the answer index convention for that data file
- Cross-reference `related_card_id` when adding JAC questions

### Nugget's Workflow
- Uploads ZIP → states task → receives new ZIP → deploys via GitHub drag-and-drop
- Communicates casually in Indonesian with English/Japanese code-switching
- Uses expressions like "GAS," "BOOM," "MANTAB" to signal enthusiasm
- Target: make this tool usable by junior SSW candidates

---

## 9. Content Sources Traceability

| Source Key | Old Key | Origin | Notes |
|-----------|---------|--------|-------|
| jac-ch1 | text1l | JAC PDF Ch.1 — 挨拶・安全管理 | Greetings, morning assembly, KY, 5S |
| jac-ch2 | text2 | JAC PDF Ch.2 — 法規 | Laws: labor, safety, construction, recycling |
| jac-ch3 | text3 | JAC PDF Ch.3 — 工事の種類 | Work types: lifeline, equipment, building |
| jac-ch4 | text4 | JAC PDF Ch.4 — 施工管理 | Construction management, surveying, formwork |
| jac-ch5 | text5l | JAC PDF Ch.5 — 工具・機械 | Tools, equipment, measuring instruments |
| jac-ch6 | text6l | JAC PDF Ch.6 — 配管・保温保冷 | Piping, insulation, HVAC |
| jac-ch7 | text7l | JAC PDF Ch.7 — キャリア | Career, qualifications, CCUS |
| jac-gakka1 | tt_sample | JAC sample exam — 学科 Set 1 | 25 theory questions with photos |
| jac-gakka2 | tt_sample2 | JAC sample exam — 学科 Set 2 | 36 theory questions |
| jac-jitsugi1 | st_sample_l | JAC sample exam — 実技 Set 1 | 22 practical questions |
| jac-jitsugi2 | st_sample2_l | JAC sample exam — 実技 Set 2 | 12 practical questions |
| vocab-lifeline | lifeline4 | Wayground CSV — vocab from sensei | 260 lifeline/equipment vocab cards |
| vocab-jac | vocab_jac | Agent-generated from JAC questions | 103 vocab cards from exam content |
| vocab-core | vocab_core | Agent-generated core terms | 22 core construction vocab |
| vocab-exam | vocab_exam | Agent-generated exam vocab | 249 exam-focused vocab cards |
| vocab-teori | vocab_teori | Agent-generated theory vocab | 54 law/safety management vocab |

Old→new ID mapping: `docs/id-mapping-v87-to-v90.json` (1438 entries)

Official JAC source: https://global.jac-skill.or.jp/indonesia/examination/documents.php

---

*End of _MAP.md — Last updated 2026-04-27 by Crispy*

---

## 10. v90 Design Overhaul Changelog

### Design System: Cold Slate → Warm Amber (matching nugget-nihongo.pages.dev)

| Token | v87 (old) | v90 (new) | Purpose |
|-------|-----------|-----------|---------|
| Background | `#0f172a` (cold slate) | `#0D0B08` (warm dark) | Main bg |
| Primary text | `#e2e8f0` (cool gray) | `#FEF3C7` (warm cream) | Body text |
| Bright text | `#f1f5f9` | `#FFFBEB` | Headlines |
| Muted text | `#94a3b8` | `rgba(254,243,199,0.56)` | Secondary |
| Accent gradient | `#f6d365 → #fda085` | `#92400E → #B45309 → #F59E0B` | Brand amber |
| Info color | `#93c5fd` (blue) | `#FBBF24` (gold) | Highlights |
| Borders | `rgba(255,255,255,0.09)` | `rgba(245,158,11,0.10)` | Warm tint |
| Surfaces | `rgba(255,255,255,0.0X)` | `rgba(245,158,11,0.0X)` | Warm tint |

### UX Additions
- **Onboarding flow** — 4-step welcome screen for first-time users
- **DM Sans font** — Matching main site typography
- **Warm amber borders** — All borders have amber tint instead of cold white
- **Brand gradient buttons** — CTA buttons use `#92400E → #F59E0B`

### Files
- `src/App-v90.jsx` — Complete working artifact (7,462 lines)
- `legacy/ssw_flashcards_v87.jsx` — Previous version for comparison
