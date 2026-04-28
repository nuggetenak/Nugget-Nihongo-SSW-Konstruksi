# 🗺️ _MAP.md — SSW Flashcard App · Agent Orientation

> **Last updated:** 2026-04-28 by Crunchy (QA — Phase 4 complete)
> **Status:** Phase 1 ✅ Phase 2 ✅ Phase 3 ✅ Phase 4 ✅ — production-ready, deploy to GitHub Pages
> **Original:** `legacy/ssw_flashcards_v87.jsx` (7,390 lines, reference only)

---

## 1. What This App Is

A React-based study tool for the **JAC SSW (Specified Skilled Worker) Construction exam** in Japan. Interface is in **Indonesian (Bahasa Indonesia)**, content is **Japanese↔Indonesian bilingual**. Targets Indonesian construction workers studying for the SSW visa exam.

### Deployment
- **Target:** GitHub Pages — static standalone PWA, **no Claude/Anthropic dependency whatsoever**
- **Storage:** Pure `localStorage` — no `window.storage`, no Supabase, no external auth
- **Progress persistence:** Export/import JSON (cross-device)
- **Live v87 (previous):** https://nuggetenak.github.io/Nugget-Nihongo-SSW-Konstruksi-v87/
- **Build:** `npm install && npm run build` → deploy `dist/`

### Branding
- **Parent brand:** Nugget Nihongo
- **Product name:** SSW Konstruksi
- **Subtitle (JP):** 土木 · 建築 · ライフライン設備
- **In-app header:** SSW Konstruksi · by Nugget Nihongo

### 3 Study Tracks
| Track | JP | ID | Icon | Categories |
|-------|----|----|------|-----------|
| Teknik Sipil | 土木 | Jalan, jembatan, terowongan | 🏗️ | jenis_kerja, alat_umum + common |
| Bangunan | 建築 | Gedung, bekisting, tulangan | 🏢 | jenis_kerja, alat_umum + common |
| Lifeline & Peralatan | ライフライン・設備 | Listrik, pipa, HVAC | ⚡ | listrik, pipa, telekomunikasi, isolasi, pemadam + common |
| **Common (共通)** | 共通 | Wajib semua jalur | 📋 | salam, hukum, keselamatan, karier |

Track filtering is **fully implemented** — `CATEGORIES` has a `tracks[]` field; `getCatsForTrack(track)` returns valid category keys; `filteredCards` in App.jsx filters by track before applying pill selection.

---

## 2. Phase History

| Phase | Agent | Status | Summary |
|-------|-------|--------|---------|
| Phase 1 | Crispy | ✅ | Data normalization: 1438 cards, unified 0-based answer indexing, furi field filled |
| Phase 2 | Crispy | ✅ | Vite architecture, modular 37-file structure, shared components/hooks |
| Phase 3 | Crispy | ✅ | UX Polish: onboarding, track picker, dashboard, bottom nav, design system |
| Phase 4 | Crunchy (QA) | ✅ | Bug fixes + SRS engine + storage layer overhaul (see §10) |

---

## 3. Directory Structure

```
Nugget-Nihongo-SSW-Konstruksi/
├── _MAP.md                         ← YOU ARE HERE
├── README.md
├── index.html                      ← Vite entry point
├── package.json                    ← deps: react, react-dom, vite, ts-fsrs
├── vite.config.js                  ← base: /Nugget-Nihongo-SSW-Konstruksi/
├── docs/
│   ├── PROPOSAL.md
│   └── id-mapping-v87-to-v90.json
├── scripts/
│   └── phase1_normalize.py
├── legacy/
│   └── ssw_flashcards_v87.jsx      ← reference only
│
└── src/
    ├── main.jsx
    ├── App.jsx                     ← v2.3: track filter, useSRS, ReviewMode wired
    │
    ├── data/
    │   ├── index.js                ← barrel + derived constants
    │   ├── cards.js                ← CARDS[1438]
    │   ├── jac-official.js         ← JAC_OFFICIAL[~95]
    │   ├── wayground-sets.js       ← WAYGROUND_SETS[12]
    │   ├── angka-kunci.js
    │   ├── danger-pairs.js
    │   └── categories.js           ← CATEGORIES (with tracks[]), SOURCE_META (canonical keys), getCatsForTrack()
    │
    ├── srs/                        ← ★ NEW — SRS engine (Phase 4)
    │   ├── index.js                ← barrel export
    │   ├── fsrs-core.js            ← Layer 1: pure FSRS math, ts-fsrs wrapper, Indonesian calibration
    │   ├── fsrs-store.js           ← Layer 2: localStorage cache (load-once → write-through)
    │   └── fsrs-scheduler.js       ← Layer 3: business logic (due queue, stats, review recording)
    │
    ├── modes/
    │   ├── FlashcardMode.jsx       ← updated: 4-button FSRS rating after flip
    │   ├── ReviewMode.jsx          ← ★ NEW: dedicated SRS due queue mode
    │   ├── ExportMode.jsx          ← updated: SRS snapshot included, pure localStorage
    │   ├── QuizMode.jsx
    │   ├── JACMode.jsx
    │   ├── WaygroundMode.jsx
    │   ├── AngkaMode.jsx
    │   ├── DangerMode.jsx
    │   ├── SimulasiMode.jsx
    │   ├── SprintMode.jsx
    │   ├── FocusMode.jsx
    │   ├── StatsMode.jsx
    │   ├── SearchMode.jsx
    │   ├── GlossaryMode.jsx
    │   └── SumberMode.jsx
    │
    ├── components/
    │   ├── Dashboard.jsx           ← updated: SRS due count CTA, strength badges
    │   ├── TrackPicker.jsx
    │   ├── BottomNav.jsx
    │   ├── QuizShell.jsx
    │   ├── ResultScreen.jsx
    │   ├── OptionButton.jsx
    │   ├── ProgressBar.jsx
    │   └── JpDisplay.jsx
    │
    ├── hooks/
    │   ├── index.js                ← barrel (includes useSRS)
    │   ├── usePersistedState.js    ← updated: sync localStorage init, no async flash
    │   ├── useSRS.js               ← ★ NEW: React hook for SRS engine
    │   ├── useQuizKeyboard.js
    │   └── useStreak.js
    │
    ├── utils/
    │   ├── index.js
    │   ├── wrong-tracker.js        ← updated: pure localStorage, no window.storage
    │   ├── shuffle.js
    │   ├── jp-helpers.js
    │   └── quiz-generator.js
    │
    └── styles/
        └── theme.js                ← T tokens + T.track[key]
```

---

## 4. Data Schemas

### 4.1 CARDS
```js
{
  id: 42,                    // numeric, sequential 1–1438, no gaps
  category: "listrik",       // see CATEGORIES
  source: "jac-ch5",         // canonical key (see SOURCE_META)
  furi: "せっちぼう",
  jp: "接地棒",
  romaji: "secchibou",
  id_text: "Batang pentanahan",
  desc: "Batang yang didorong..."
}
```

**12 categories:** salam, hukum, jenis_kerja, listrik, telekomunikasi, pipa, isolasi, pemadam, keselamatan, karier, alat_umum, bintang

**Track assignment per category:**
- Common (all tracks): salam, hukum, keselamatan, karier
- doboku + kenchiku: jenis_kerja, alat_umum
- lifeline only: listrik, telekomunikasi, pipa, isolasi, pemadam

### 4.2 JAC_OFFICIAL & WAYGROUND_SETS
See previous _MAP.md sections — schemas unchanged. Answer indexing unified to **0-based** in Phase 1.

### 4.3 SRS Card Entry (localStorage: `ssw-srs-{cardId}`)
```js
{
  card: {
    due: "2026-05-01T00:00:00.000Z",  // ISO string
    stability: 4.2,                    // FSRS stability (days)
    difficulty: 5.0,                   // FSRS difficulty 1–10
    elapsed_days: 0,
    scheduled_days: 4,
    reps: 3,
    lapses: 0,
    state: 2,                          // 0=New 1=Learning 2=Review 3=Relearning
    last_review: "2026-04-28T..."
  },
  history: [                           // last 20 reviews
    { date: "2026-04-28T...", rating: 3 }
  ],
  reviewed_at: "2026-04-28T..."
}
```

---

## 5. SRS Architecture (Phase 4)

### Layer model
```
fsrs-core.js       — Pure math. ts-fsrs wrapper. RATING_META. Indonesian calibration stub.
                     Zero app dependencies. Copy to main project as-is.
fsrs-store.js      — localStorage adapter. Load-once init → in-memory cache → write-through.
                     Synchronous. Key prefix: ssw-srs-{cardId}.
fsrs-scheduler.js  — Business logic. recordReview(), getDueCardIds(), getSRSStats(),
                     previewIntervals(). All synchronous.
useSRS.js          — React hook. Calls initStore() synchronously. Exposes reactive
                     dueCount + stats via forceRender after each review.
```

### FSRS Rating buttons
| Button | Rating | Meaning | Maps to known/unknown |
|--------|--------|---------|----------------------|
| 🔴 Lagi  | 1 (Again) | Completely forgot | → unknown |
| 🟠 Susah | 2 (Hard)  | Recalled with difficulty | → known |
| 🟢 Oke   | 3 (Good)  | Recalled correctly | → known |
| 💎 Mudah | 4 (Easy)  | Recalled perfectly | → known |

### FlashcardMode UX flow
1. Card shows front (JP text)
2. User taps → back revealed (ID translation + desc)
3. 4 FSRS rating buttons appear with interval preview hints
4. On rating → SRS recorded + known/unknown updated + auto-advance

### ReviewMode
- Shows only cards due today (from `getDueCardIds()`)
- Sorted by urgency (lowest retrievability R first)
- Must flip before rating buttons activate
- Keyboard: Space/Enter = flip; 1/2/3/4 = rate
- Completion screen shows session stats

---

## 6. Storage Architecture

**All storage is pure `localStorage`. No window.storage. No external services.**

| localStorage key | Owner | Format | Content |
|-----------------|-------|--------|---------|
| `ssw-known` | App | `[cardId, ...]` | Cards marked known |
| `ssw-unknown` | App | `[cardId, ...]` | Cards marked unknown |
| `ssw-starred` | App | `[cardId, ...]` | Starred cards |
| `ssw-track` | App | `"doboku"` \| `"kenchiku"` \| `"lifeline"` | Selected track |
| `ssw-quiz-wrong` | QuizMode | `{cardId: {count, lastWrong}}` | Wrong counts |
| `ssw-wrong-counts` | JACMode | `{qId: {count, lastWrong}}` | JAC wrong counts |
| `ssw-wg-wrong-{setId}` | WaygroundMode | `{qIdx: {count, lastWrong}}` | Wayground wrong |
| `ssw-srs-{cardId}` | fsrs-store | SRS card entry (see §4.3) | FSRS card data |
| `ssw-onboarded` | App | `"1"` | Onboarding complete flag |

**usePersistedState** initializes synchronously from localStorage — no loading flash, no async effect.

---

## 7. Mode Index

| Mode key | File | Entry point | Notes |
|----------|------|-------------|-------|
| `ulasan` | ReviewMode.jsx | Belajar tab | ★ NEW — SRS due queue |
| `kartu` | FlashcardMode.jsx | Belajar tab | Updated: 4-button FSRS |
| `kuis` | QuizMode.jsx | Belajar tab | |
| `sprint` | SprintMode.jsx | Belajar tab | |
| `fokus` | FocusMode.jsx | Belajar tab | |
| `jac` | JACMode.jsx | Ujian tab | |
| `wayground` | WaygroundMode.jsx | Ujian tab | |
| `simulasi` | SimulasiMode.jsx | Ujian tab | |
| `angka` | AngkaMode.jsx | Ujian tab | |
| `jebak` | DangerMode.jsx | Ujian tab | |
| `cari` | SearchMode.jsx | Lainnya tab | |
| `glosari` | GlossaryMode.jsx | Lainnya tab | |
| `sumber` | SumberMode.jsx | Lainnya tab | SOURCE_META now uses canonical keys |
| `stats` | StatsMode.jsx | Lainnya tab | |
| `ekspor` | ExportMode.jsx | Lainnya tab | Updated: includes SRS snapshot |

---

## 8. Known Issues & TODO

### ✅ Resolved (Phase 4 / Crunchy QA)
- [x] `SOURCE_META` used old source keys → `SumberMode` rendered blank list
- [x] Track filtering was cosmetic only → cards not actually filtered by track
- [x] `CATEGORIES` had no `tracks[]` field
- [x] All storage used `window.storage` (Claude-only) → broken on GitHub Pages
- [x] `usePersistedState` had async flash of default value before storage loaded
- [x] No SRS system — only binary known/unknown
- [x] Export/import didn't include SRS data

### 🟡 Open / Future
- [ ] Per-card track tagging for jenis_kerja + alat_umum (currently category-level only)
- [ ] PWA manifest + service worker
- [ ] Breadcrumb navigation in nested modes
- [ ] Study plan mode (4-week guided)
- [ ] SRS difficulty calibration for Indonesian learners (needs 10K+ review events — see `INDONESIAN_CALIBRATION` in fsrs-core.js)
- [ ] Card images for tool recognition questions

---

## 9. Agent Instructions

### When Starting a New Session
1. Read this `_MAP.md` first
2. Check `docs/PROPOSAL.md` for full context
3. **Do not use `window.storage`** — this app is GitHub Pages only, pure localStorage
4. Test storage with: `localStorage.getItem('ssw-known')` in browser devtools

### Code Conventions
- **Language:** Indonesian for UI text; English for code comments
- **Git identity:** use your agent name (e.g., `Crispy`, `Crunchy`, `Golden`)
- **Commit style:** `type(scope): description`
- **Storage:** always `localStorage` — never `window.storage`, never Supabase
- **SRS:** import from `../srs/index.js` or direct layer file; never call ts-fsrs directly from components

### SRS Extension Points
- Custom FSRS parameters → `configureFSRS()` in `fsrs-core.js`
- Indonesian calibration → `INDONESIAN_CALIBRATION` stub in `fsrs-core.js`
- Add new storage keys → add to `STORAGE_KEYS` in `wrong-tracker.js` and document in §6

### Working with Data Files
- `src/data/cards.js` is 1,600+ lines — don't re-read unless necessary
- When adding cards: use next ID after current max
- `getCatsForTrack(track)` → returns category keys for a given track key

---

## 10. Phase 4 Changelog (Crunchy QA — 2026-04-28)

### Fix 1 — `src/data/categories.js`
- `SOURCE_META` remapped from old keys (`text1l`, `tt_sample`, `lifeline4`) to canonical keys (`jac-ch1`, `jac-gakka1`, `vocab-lifeline`, etc.)
- Added `tracks[]` field to every `CATEGORIES` entry
- Added `getCatsForTrack(track)` helper

### Fix 2 — `src/App.jsx`
- `filteredCards` now filters by track category set first, then by active pill selection
- Category pills only show categories valid for the current track
- Added `useSRS(trackCardIds)` hook
- Added `ReviewMode` to modeMap
- Added `ulasan` to BELAJAR_MODES with live due count badge
- `ModeGrid` accepts `badges` prop for numeric badge on any mode tile

### Fix 3 — `src/modes/ExportMode.jsx`
- Export/import progress JSON (known/unknown, wrong counts, track, SRS data)
- Added to Lainnya tab

### Phase 4 — SRS Engine (`src/srs/`)
- `fsrs-core.js` — pure FSRS math layer (ts-fsrs v5 wrapper, `RATING_META`, Indonesian calibration stub)
- `fsrs-store.js` — localStorage adapter, in-memory cache, write-through
- `fsrs-scheduler.js` — due queue, stats, review recording, interval preview
- `src/hooks/useSRS.js` — React hook, synchronous init, reactive dueCount

### Phase 4 — Storage Overhaul
- `wrong-tracker.js` — pure localStorage, synchronous
- `usePersistedState.js` — synchronous init, no async flash, no `ready` flag
- `fsrs-store.js` — pure localStorage, no window.storage
- `ExportMode.jsx` — pure localStorage, removed `__ls__` hack
- **Eliminated all `window.storage` references** across entire codebase

### New Files
- `src/srs/fsrs-core.js`
- `src/srs/fsrs-store.js`
- `src/srs/fsrs-scheduler.js`
- `src/srs/index.js`
- `src/hooks/useSRS.js`
- `src/modes/ReviewMode.jsx`

### Updated Files
- `src/data/categories.js`
- `src/utils/wrong-tracker.js`
- `src/hooks/usePersistedState.js`
- `src/hooks/index.js`
- `src/App.jsx`
- `src/modes/FlashcardMode.jsx`
- `src/modes/ExportMode.jsx`
- `src/components/Dashboard.jsx`
- `package.json` (added `ts-fsrs: ^5.0.0`)

---

*End of _MAP.md — Last updated 2026-04-28 by Crunchy (QA)*
