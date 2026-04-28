# 🗺️ _MAP.md — SSW Flashcard App · Agent Orientation

> **Last updated:** 2026-04-28 by Claude (bugfix pass — v2.3.6)
> **Status:** Phase 1 ✅ Phase 2 ✅ Phase 3 ✅ Phase 4 ✅ Phase 5 ✅ Phase 5.2 ✅ Phase 5.3 ✅ Phase 5.4 ✅ — production-ready, deployed to GitHub Pages
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
| Phase 5 | Crunchy (QA) | ✅ | PWA: manifest, service worker, 10 icons, apple meta, offline support |
| Phase 5.1 | Crunchy (QA) | ✅ | Icons replaced with Gemini-generated artwork; README full rewrite |
| Phase 5.2 | Codex (Audit) | ✅ | Audit: build PASS, lazy-load all 15 modes, CHANGELOG, audit report |
| Phase 5.3 | Claude (Bugfix) | ✅ | Bugfix pass: BottomNav dark bg, ReviewMode interval labels, async cleanup, initStore render fix, SearchMode boxSizing. Tests: 72→105. v2.3.4→v2.3.5 |
| Phase 5.4 | Claude (Bugfix) | ✅ | HTML/PWA fixes: favicon 404, FOUC dark-flash, color-scheme meta, manifest splash color. getCatsForTrack tests. Tests: 105→111. v2.3.6 |

---

## 3. Directory Structure

```
Nugget-Nihongo-SSW-Konstruksi/
├── _MAP.md                         ← YOU ARE HERE
├── CHANGELOG.md                    ← Versioned changelog (start: v2.3.1)
├── README.md
├── index.html                      ← Vite entry point
├── package.json                    ← deps: react, react-dom, vite, ts-fsrs
├── vite.config.js                  ← base: /Nugget-Nihongo-SSW-Konstruksi/
├── public/                         ← ★ NEW (Phase 5)
│   ├── manifest.webmanifest            ← PWA manifest
│   ├── sw.js                           ← Service worker (cache-first + offline)
│   ├── favicon.ico                     ← multi-size (16/32/48)
│   ├── favicon.png                     ← 32px fallback
│   └── icons/                          ← Gemini artwork, 72–512px + apple-touch                          ← 10 PNG icons (72–512, apple-touch)
├── docs/
│   ├── AUDIT-2026-04-28.md        ← Codex audit pass 1
│   ├── AUDIT-2026-04-28-PASS2.md  ← Codex audit pass 2 (integrity + chunking)
│   ├── AUDIT-2026-04-28-PASS3.md  ← Claude audit pass 3 (debug-to-deploy)
│   ├── PROPOSAL.md
│   └── id-mapping-v87-to-v90.json
├── scripts/
│   └── phase1_normalize.py
├── legacy/
│   └── ssw_flashcards_v87.jsx      ← reference only
│
└── src/
    ├── main.jsx
    ├── App.jsx                     ← v2.3.1: + React.lazy() for all 15 modes (Codex); v2.3.2: manualChunks perf
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
- [x] PWA manifest + service worker ✅ Phase 5
- [ ] Breadcrumb navigation in nested modes
- [ ] Study plan mode (4-week guided)
- [ ] Data splitting: dynamic import cards.js per track (Codex rec — reduce initial bundle)
- [ ] ESLint + Prettier + CI checks (Codex rec)
- [ ] Smoke tests UI minimal — Playwright/Vitest (Codex rec)
- [ ] SRS difficulty calibration for Indonesian learners (needs 10K+ review events — see `INDONESIAN_CALIBRATION` in fsrs-core.js)
- [ ] Card images for tool recognition questions

---

## 9. Agent Instructions

### ⚠️ Codex Audit Notes (Phase 5.2)
- All 15 modes are now `React.lazy()` — wrapped in `<Suspense fallback={<ModeLoadingFallback/>}>` in App.jsx
- Do NOT revert to static imports — lazy loading is intentional for bundle size
- `modeMap` still constructs JSX for all modes per render — this is safe (lazy chunks only download when rendered)
- `npm run audit:baseline` = `npm run build` — use for quick build health check
- Formal audit report: `docs/AUDIT-2026-04-28.md`

### ⚠️ Crispy / Integrator Sync Notes (Phase 4–5)
These changes affect integration — Crispy must be aware:

- **`package.json`** has new dep: `ts-fsrs: ^5.0.0` → run `npm install` before building
- **`src/srs/`** is a new directory — 4 files, do not delete
- **`usePersistedState`** return signature changed: now returns `[value, setter]` (2-tuple, no `ready` flag) — if any code destructures 3 values, fix it
- **`wrong-tracker.js`** functions are now synchronous — remove any `await loadFromStorage(...)` / `await saveToStorage(...)` in existing code
- **`window.storage`** is completely removed — never use it, never add it back
- **`Dashboard`** now accepts a `srs` prop — pass `srs` from `useSRS()` hook
- **Mode `ulasan`** → `ReviewMode` — requires `srs` prop
- **`public/`** is now populated — do not clear or gitignore it

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



## 11. Phase 5 Changelog (Crunchy QA — 2026-04-28)

### PWA Files Added

**`public/manifest.webmanifest`** — `display: standalone`, full icon set 72–512px with `maskable` purpose, 2 shortcuts (Kartu + Ulasan SRS), correct GH Pages `start_url`/`scope`.

**`public/sw.js`** — Cache-First for static assets + Google Fonts; Network-First for HTML navigation; offline fallback serves cached `index.html`; `skipWaiting()` + `clients.claim()` for immediate activation.

**`index.html`** — manifest link, apple-mobile-web-app meta, og tags, `color-scheme: dark`, `overscroll-behavior: none`, inline SW registration + `reg.update()` on every load.

**`public/icons/`** — 10 PNG icons: 72, 96, 128, 144, 152, 180, 192, 384, 512px + apple-touch-icon. Hard hat design, amber on dark.

### ⚠️ Cache Versioning for Deployments
Bump `CACHE_VERSION` in `public/sw.js` on every deploy:
```js
const CACHE_VERSION = 'ssw-v2'; // increment each deploy
```
This forces old SW to delete stale caches so users always get fresh assets.


---


## 12. Phase 5.1 Changelog (Crunchy QA — 2026-04-28)

### Icon Replacement
All placeholder icons replaced with Gemini-generated artwork:
- **Design:** Hard hat (ヘルメット) with amber body, brown stripe, scaffold-style "N" badge
- **Processed:** watermark removed, cropped, resized to all required sizes
- **Files:** `icon-72` through `icon-512`, `apple-touch-icon.png`, `favicon.png`, `favicon.ico` (multi-size 16/32/48)

### README.md — Full Rewrite
Previous README was v87-era (outdated). Now reflects:
- Current feature set (SRS, 15 modes, 3 tracks, PWA)
- Install instructions (Add to Home Screen)
- SRS rating table
- Export/import workflow
- Deployment instructions (including cache versioning reminder)
- Updated credit section (Crispy + Crunchy)


---


## 13. Phase 5.2 Changelog (Codex Audit — 2026-04-28)

### Audit Results
- **Build:** PASS (no compile errors)
- **Bundle:** ~1.4MB single chunk before fix — HIGH risk on low-end devices
- **Source hygiene:** GOOD — no TODO/FIXME/console.log found
- **Docs:** GAP — no formal audit trail or changelog (now fixed)

### Changes Applied by Codex

**`src/App.jsx`** — All 15 mode imports converted to `React.lazy()`:
```js
// Before
import FlashcardMode from './modes/FlashcardMode.jsx';
// After
const FlashcardMode = lazy(() => import('./modes/FlashcardMode.jsx'));
```
Mode render wrapped in `<Suspense fallback={<ModeLoadingFallback/>}>`.
Added `ModeLoadingFallback` component (centered spinner text).

**`package.json`** — version bumped to `2.3.1`; added `audit:baseline` script.

**`CHANGELOG.md`** — New file, versioned changelog starting at v2.3.1.

**`docs/AUDIT-2026-04-28.md`** — Formal audit report (build, perf, hygiene, remediation).

### Codex Backlog Recommendations (not yet implemented)
1. Dynamic import `cards.js` per track — further reduce initial payload
2. ESLint + Prettier + CI pipeline
3. Smoke tests (Playwright or Vitest)
4. JSON data splitting/compression


---

*End of _MAP.md — Last updated 2026-04-28 by Crunchy + Codex (Phase 5.2)*
