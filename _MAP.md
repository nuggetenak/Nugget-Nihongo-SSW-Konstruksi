# 🗺️ _MAP.md — SSW Konstruksi · Agent Orientation

> **Last updated:** 2026-04-29 by Sonnet
> **Version:** v3.5.2 — Phase 1–8(complete)+9(partial) complete
> **Blueprint:** `docs/MASTER-BLUEPRINT-v3.md` ← **READ THIS FIRST**

---

## 1. What This App Is

A React PWA study tool for the **JAC SSW Construction exam** (Japan). Interface in **Indonesian**, content **Japanese↔Indonesian bilingual**. Targets Indonesian construction workers studying for the SSW visa exam.

**Deployment:** GitHub Pages — static standalone PWA. `npm install && npm run build` → deploy `dist/`.
**Storage:** Pure `localStorage` — **never** `window.storage`, never Supabase, never external auth.
**Deps:** react 19, react-dom, ts-fsrs v5, Vite 6.

### Branding
- **Parent:** Nugget Nihongo · **Product:** SSW Konstruksi
- **Subtitle:** 土木 · 建築 · ライフライン設備

### 3 Study Tracks
| Track | JP | Categories |
|-------|----|-----------|
| Teknik Sipil 🏗️ | 土木 | jenis_kerja, alat_umum + common |
| Bangunan 🏢 | 建築 | jenis_kerja, alat_umum + common |
| Lifeline ⚡ | ライフライン・設備 | listrik, pipa, telekomunikasi, isolasi, pemadam + common |
| **Common** 📋 | 共通 | salam, hukum, keselamatan, karier (all tracks) |

---

## 2. Directory Structure

```
Nugget-Nihongo-SSW-Konstruksi/
├── _MAP.md                      ← YOU ARE HERE
├── CHANGELOG.md
├── README.md
├── index.html                   ← Vite entry
├── package.json                 ← react, react-dom, vite, ts-fsrs
├── vite.config.js               ← base: /Nugget-Nihongo-SSW-Konstruksi/
├── public/
│   ├── manifest.webmanifest     ← PWA manifest
│   ├── sw.js                    ← Service worker (bump CACHE_VERSION on deploy!)
│   ├── favicon.ico / .png
│   └── icons/                   ← 72–512px PNGs + apple-touch
├── docs/
│   ├── MASTER-BLUEPRINT-v3.md   ← ★ ACTIVE — architecture + UI/UX redesign plan
│   └── archive/                 ← Old proposals, audits, mappings (reference only)
├── scripts/
│   └── phase1_normalize.py      ← historical
├── legacy/
│   └── ssw_flashcards_v87.jsx   ← reference only
│
└── src/
    ├── main.jsx
    ├── App.jsx                  ← 668 lines (to be decomposed per Blueprint Phase 1)
    ├── data/
    │   ├── index.js             ← barrel (to be removed per Blueprint §A4)
    │   ├── cards.js             ← CARDS[1438]
    │   ├── jac-official.js      ← JAC_OFFICIAL[~95 questions]
    │   ├── wayground-sets.js    ← WAYGROUND_SETS[12 sets]
    │   ├── csv-sets.js          ← CSV_SETS[12 sets, 300 questions]
    │   ├── angka-kunci.js
    │   ├── danger-pairs.js
    │   └── categories.js        ← CATEGORIES, SOURCE_META, getCatsForTrack()
    ├── srs/
    │   ├── index.js
    │   ├── fsrs-core.js         ← Pure FSRS math (ts-fsrs wrapper)
    │   ├── fsrs-store.js        ← localStorage cache (to be replaced per Blueprint §A1)
    │   └── fsrs-scheduler.js    ← Due queue, stats, review recording
    ├── modes/                   ← 18 modes, all React.lazy()
    │   ├── FlashcardMode.jsx    ├── ReviewMode.jsx
    │   ├── QuizMode.jsx         ├── JACMode.jsx
    │   ├── WaygroundMode.jsx    ├── VocabMode.jsx
    │   ├── SimulasiMode.jsx     ├── AngkaMode.jsx
    │   ├── DangerMode.jsx       ├── SprintMode.jsx
    │   ├── FocusMode.jsx        ├── StatsMode.jsx
    │   ├── SearchMode.jsx       ├── GlossaryMode.jsx
    │   ├── SumberMode.jsx       ├── ExportMode.jsx
    │   ├── SipilMode.jsx        └── BangunanMode.jsx
    ├── components/
    │   ├── Dashboard.jsx        ├── TrackPicker.jsx
    │   ├── BottomNav.jsx        ├── QuizShell.jsx
    │   ├── ResultScreen.jsx     ├── OptionButton.jsx
    │   ├── ProgressBar.jsx      ├── JpDisplay.jsx
    │   ├── FilterPopup.jsx      ├── EmptyState.jsx
    │   ├── ConfirmDialog.jsx    └── Toast.jsx
    ├── hooks/
    │   ├── index.js             ├── usePersistedState.js
    │   ├── useSRS.js            ├── useQuizKeyboard.js
    │   └── useStreak.js
    ├── utils/
    │   ├── index.js             ├── wrong-tracker.js
    │   ├── shuffle.js           ├── jp-helpers.js
    │   └── quiz-generator.js
    └── styles/
        └── theme.js             ← T tokens, CSS vars, light/dark themes
```

---

## 3. Data Schemas

### CARDS
```js
{ id: 42, category: "listrik", source: "jac-ch5", furi: "せっちぼう",
  jp: "接地棒", romaji: "secchibou", id_text: "Batang pentanahan", desc: "..." }
```
12 categories: salam, hukum, jenis_kerja, listrik, telekomunikasi, pipa, isolasi, pemadam, keselamatan, karier, alat_umum, bintang. IDs sequential 1–1438.

### Question Sets (JAC, Wayground, CSV)
All use **0-based answer indexing**. See individual data files for schema details.

### SRS Card Entry (`ssw-srs-{cardId}`)
```js
{ card: { due, stability, difficulty, state, reps, lapses, ... },
  history: [{ date, rating }], reviewed_at: "ISO" }
```
FSRS ratings: 1=Again, 2=Hard, 3=Good, 4=Easy.

---

## 4. Storage Keys (Current — to be consolidated per Blueprint §A1)

| Key Pattern | Content |
|-------------|---------|
| `ssw-known`, `ssw-unknown`, `ssw-starred` | Card ID arrays |
| `ssw-track`, `ssw-theme`, `ssw-onboarded` | Single values |
| `ssw-quiz-wrong`, `ssw-wrong-counts` | Wrong-count maps |
| `ssw-wg-wrong-{id}`, `ssw-vocab-wrong-{id}` | Per-set wrong counts |
| `ssw-jac-scores`, `ssw-wg-scores`, `ssw-vocab-scores` | Score maps |
| `ssw-srs-{cardId}` | **1 key per card** (1438+ keys — to be unified) |
| `ssw-study-streak`, `ssw-daily-count`, `ssw-recent` | Dashboard data |
| `ssw-last-mode`, `ssw-tutorial-flashcard` | UI state |

---

## 5. SRS Architecture

```
fsrs-core.js       — Pure math. ts-fsrs wrapper. Zero app dependencies.
fsrs-store.js      — localStorage adapter. Load-once → in-memory cache → write-through.
fsrs-scheduler.js  — recordReview(), getDueCardIds(), getSRSStats(), previewIntervals().
useSRS.js          — React hook. Synchronous init. Exposes dueCount + stats.
```

FSRS buttons: 🔴 Lagi (Again) · 🟠 Susah (Hard) · 🟢 Oke (Good) · 💎 Mudah (Easy)

---

## 6. Agent Instructions

### ⚠️ Before Starting Any Work
1. **Read `docs/MASTER-BLUEPRINT-v3.md`** — the active architecture + UX redesign plan
2. Read this `_MAP.md` for current state reference
3. **Never use `window.storage`** — pure localStorage only
4. **Never revert `React.lazy()`** — all 18 modes must stay lazy-loaded
5. Run `npm install && npm run build` to verify build health before and after changes
6. Run `npm test` — all 111 tests must pass

### Code Conventions
- **UI language:** Indonesian · **Code comments:** English
- **Git identity:** Use your agent name (e.g., `Crispy`, `Sonnet`, `Opus`)
- **Commits:** `type(scope): description` (e.g., `feat(storage): add 3-document engine`)
- **SRS imports:** From `../srs/index.js` or direct layer file — never call ts-fsrs directly
- **Storage:** Always `localStorage` — never `window.storage`, never Supabase

### SW Cache Versioning
Bump `CACHE_VERSION` in `public/sw.js` on every deploy. Blueprint §A6 automates this via CI/CD.

---

## 7. Current Metrics

| Metric | Value | Blueprint Target |
|--------|-------|-----------------|
| Source lines | ~20,136 | — |
| Inline styles | 822 → **487** (justified inline only) ✅ | 0 static (done) |
| CSS Module files | 0 → **16** ✅ | ~16 |
| localStorage key patterns | 20+ → **3 documents** ✅ | 3 documents |
| App.jsx | 668 → **72 lines** ✅ | ~150 lines |
| BottomNav | 4 tabs → **3 tabs** ✅ | 3 tabs |
| Dashboard | 819 → **265 lines** ✅ | Redesigned |
| ErrorBoundary count | 0 → **all 18 modes** ✅ | All 18 modes wrapped |
| Tests | 111 → **150 passing** ✅ | ~170+ |
| CI/CD | none → **GitHub Actions** ✅ | GitHub Actions auto-deploy |
| 3D card flip | none → **✅** | Phase 4 |
| FSRS always visible | long-press → **✅** | Phase 4 |
| ResultScreen 2-path | none → **✅** | Phase 5 |

---

*For historical changelogs (Phases 1–15), see `docs/archive/` and `CHANGELOG.md`.*
