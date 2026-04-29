# 🏗️ SSW Konstruksi — Proposal Refaktor v2 (Opus)

> **Author:** Claude Opus 4.6 × Nugget · 2026-04-29
> **Scope:** Architecture, Performance, Storage, DX, Testing, CI/CD
> **Target executor:** Agent Sonnet (konten by agent lain)
> **Prerequisite:** Baca `_MAP.md` + proposal ini sebelum mulai

---

## 0. Konteks & Status Saat Ini

Proyek sudah sangat mature — 10 phase UX overhaul selesai, SRS engine hidup, PWA ready, 111 test passing, 18 mode lazy-loaded. Proposal lama (v87 era) sudah ~80% tereksekusi.

**Tapi ada utang arsitektur yang makin besar:**

| Metrik | Nilai | Masalah |
|--------|-------|---------|
| Inline styles | **822** | Naik dari 767 di v87 — refactor justru menambah |
| localStorage keys | **20+ pola distinct** | Fragmentasi, no migration, no schema version |
| App.jsx | **668 baris** | God component: state, routing, filtering, UI semua di sini |
| Data files total | **7.798 baris** | csv-sets.js alone = 3.998 baris |
| ErrorBoundary | **0** | 18 lazy imports tanpa error handling |
| Component tests | **0** | 111 test = data integrity + utils only |
| CI/CD | **0** | No GitHub Actions, no auto-deploy |
| Mode definitions | **duplikat** | BELAJAR_MODES di App.jsx ≠ MODE_META di Dashboard.jsx |
| SRS init | O(n) localStorage scan | `Object.keys(localStorage).filter(...)` on every cold start |

**Proposal ini fokus pada hal-hal yang BUKAN konten** — murni arsitektur, performa, developer experience. Konten (kartu baru, soal baru, cross-check JAC) dikerjakan agent lain.

---

## 1. 🧱 PILAR 1: Storage Architecture — Unified + Versioned

### 1.1 Masalah Kritis

Saat ini ada **20+ pola localStorage key** yang tersebar:

```
ssw-known, ssw-unknown, ssw-starred          → arrays
ssw-track, ssw-onboarded, ssw-theme          → single values
ssw-quiz-wrong, ssw-wrong-counts             → objects
ssw-wg-wrong-{setId}                         → per-set objects
ssw-vocab-wrong-{setId}                      → per-set objects
ssw-jac-scores, ssw-wg-scores, ssw-vocab-scores → score maps
ssw-srs-{cardId}                             → 1 key PER CARD (1438+ keys!)
ssw-study-streak, ssw-daily-count, ssw-recent → dashboard data
ssw-last-mode, ssw-tutorial-flashcard        → UI state
ssw-milestone-quiz70, ssw-milestone-streak5  → achievement flags
```

**Masalah konkret:**
1. **SRS = 1438 localStorage keys.** `initStore()` melakukan `Object.keys(localStorage).filter(k => k.startsWith('ssw-srs-'))` — ini O(n) scan semua keys di storage. Pada device murah (target user: HP Android budget), ini bisa 200-500ms blocking.
2. **No schema version.** Jika format berubah (misalnya SRS card entry berubah field), tidak ada migration path — data user rusak silently.
3. **Export/Import fragile.** ExportMode harus tahu SEMUA key patterns, kalau ada yang tertinggal = data loss.
4. **Wrong-count keys multiply.** Setiap Wayground set dan CSV set bikin key baru: `ssw-wg-wrong-wg01`, `ssw-vocab-wrong-ct01`, dst — scaling linearly.
5. **No cross-tab sync.** User buka di 2 tab → race condition pada SRS writes.

### 1.2 Solusi: 3-Document Storage Engine

```
src/storage/
├── engine.js          ← Read/write layer with versioning + migration
├── schema.js          ← Type definitions + version constants
├── migrations.js      ← v1→v2, v2→v3, etc. migration functions
└── index.js           ← Barrel export
```

**Arsitektur: 3 dokumen localStorage, bukan 1438+.**

```js
// schema.js
export const STORAGE_VERSION = 2;

export const STORAGE_KEYS = {
  PROGRESS: 'ssw-progress',   // Semua progress data (known, unknown, starred, wrong counts, scores)
  SRS:      'ssw-srs-data',   // Semua SRS card entries dalam 1 object
  PREFS:    'ssw-prefs',      // UI preferences (track, theme, onboarded, tutorial flags)
};
```

```js
// engine.js
const _cache = { progress: null, srs: null, prefs: null };

export function init() {
  // 1 read per document, not 1438 reads
  for (const [key, storageKey] of Object.entries(STORAGE_KEYS)) {
    try {
      const raw = localStorage.getItem(storageKey);
      _cache[key.toLowerCase()] = raw ? JSON.parse(raw) : getDefaults(key);
    } catch { _cache[key.toLowerCase()] = getDefaults(key); }
  }
  // Run migrations if version mismatch
  migrateIfNeeded(_cache);
  return _cache;
}

// Write-through with debounce (16ms = 1 frame)
let _writeTimer = null;
function scheduleSave(docKey) {
  clearTimeout(_writeTimer);
  _writeTimer = setTimeout(() => {
    localStorage.setItem(STORAGE_KEYS[docKey], JSON.stringify(_cache[docKey.toLowerCase()]));
  }, 16);
}
```

**Progress document structure:**
```js
{
  _v: 2,
  known: [1, 5, 42, ...],        // card IDs
  unknown: [3, 7, ...],
  starred: [10, 20, ...],
  wrongCounts: {
    quiz: { "42": { count: 3, last: "2026-04-28" } },
    jac: { "jac-gakka1-q5": { count: 1, last: "..." } },
    wayground: { "wg01-3": { count: 2, last: "..." } },
    csv: { "ct01-7": { count: 1, last: "..." } },
  },
  scores: {
    jac: { "jac-gakka1": { score: 18, total: 20, pct: 90, date: "..." } },
    wayground: { "wg01": { score: 12, total: 15, pct: 80, maxStreak: 8, date: "..." } },
    csv: { "ct01": { score: 19, total: 25, pct: 76, date: "..." } },
  },
  streak: { current: 5, best: 12, lastDate: "2026-04-28" },
  dailyCount: { date: "2026-04-28", count: 45 },
  recentCards: [1438, 1200, 800],
  milestones: { quiz70: true, streak5: true },
}
```

**SRS document structure:**
```js
{
  _v: 2,
  cards: {
    "1": { card: {...}, history: [...], reviewed_at: "..." },
    "42": { card: {...}, history: [...], reviewed_at: "..." },
    // ... all 1438 potential entries in 1 document
  }
}
```

**Prefs document structure:**
```js
{
  _v: 2,
  track: "lifeline",
  theme: "dark",
  onboarded: true,
  tutorialSeen: { flashcard: true },
  lastMode: "kartu",
}
```

### 1.3 Migration Engine

```js
// migrations.js
const MIGRATIONS = {
  1: (data) => {
    // v1→v2: merge fragmented keys into 3-document model
    // Read old ssw-known, ssw-unknown, etc. → pack into progress document
    // Read all ssw-srs-* keys → pack into srs document
    // Clean up old keys after successful migration
  },
};

export function migrateIfNeeded(cache) {
  const currentVersion = cache.progress?._v || 1;
  for (let v = currentVersion; v < STORAGE_VERSION; v++) {
    if (MIGRATIONS[v]) MIGRATIONS[v](cache);
  }
}
```

### 1.4 Manfaat

| Aspek | Sebelum | Sesudah |
|-------|---------|---------|
| localStorage reads on init | ~1450+ | **3** |
| Cold start (budget Android) | 200-500ms | **<20ms** |
| Export/Import | Manual enumerate 20+ key patterns | **3 JSON docs, guaranteed complete** |
| Schema changes | Silent data corruption | **Versioned migrations** |
| New quiz set → new storage | New key pattern needed | **Nested under existing doc** |

### 1.5 Prioritas: 🔴 HIGH — Foundation untuk semua perbaikan lain

### 1.6 Backward Compatibility

Migration v1 harus:
1. Detect old-format keys (`ssw-known`, `ssw-srs-*`, etc.)
2. Read and pack into new 3-document format
3. Write new documents
4. Delete old keys (with try/catch)
5. User experience: zero disruption, progress 100% preserved

---

## 2. 🧩 PILAR 2: App.jsx Decomposition — Context + Router

### 2.1 Masalah

`App.jsx` = 668 baris melakukan terlalu banyak:
- State management (known, unknown, starred, track, mode, tab, vocabMode, activeCats, etc.)
- Card filtering logic
- Mode routing (manual `modeMap` object with 17 entries)
- SRS hook initialization
- Onboarding flow
- Dashboard rendering
- Filter popup state
- Toast integration
- Milestone detection

Ini berarti:
- Setiap edit di App.jsx = re-read 668 baris oleh agent → token mahal
- Sulit di-test — no unit testable logic
- Props drilling: `known`, `unknown`, `starred`, `srs`, `onExit` passed ke semua modes

### 2.2 Solusi: Extract ke Context + Lightweight Router

```
src/
├── contexts/
│   ├── ProgressContext.jsx    ← known/unknown/starred + handlers
│   ├── SRSContext.jsx         ← SRS engine wrapper
│   └── AppContext.jsx         ← track, theme, toast, navigation
├── router/
│   ├── ModeRouter.jsx         ← lazy import + Suspense + ErrorBoundary
│   └── modes.js               ← Single source of truth for mode definitions
├── App.jsx                    ← ~150 lines: compose contexts + router
```

**Sebelum (App.jsx 668 baris):**
```jsx
// State
const [known, setKnown] = usePersistedState('ssw-known', []);
const [unknown, setUnknown] = usePersistedState('ssw-unknown', []);
const [starred, setStarred] = usePersistedState('ssw-starred', []);
// ... 20 more useState
// ... filtering logic
// ... modeMap with 17 entries
// ... inline Onboarding component
// ... ModeGrid component
```

**Sesudah (App.jsx ~150 baris):**
```jsx
import { ProgressProvider } from './contexts/ProgressContext';
import { SRSProvider } from './contexts/SRSContext';
import { AppProvider } from './contexts/AppContext';
import ModeRouter from './router/ModeRouter';
import Dashboard from './components/Dashboard';
import BottomNav from './components/BottomNav';

export default function App() {
  return (
    <AppProvider>
      <ProgressProvider>
        <SRSProvider>
          <AppShell />
        </SRSProvider>
      </ProgressProvider>
    </AppProvider>
  );
}

function AppShell() {
  const { mode, tab } = useApp();
  if (mode) return <ModeRouter mode={mode} />;
  return (
    <>
      {tab === 'home' && <Dashboard />}
      {tab === 'belajar' && <BelajarTab />}
      {tab === 'ujian' && <UjianTab />}
      {tab === 'lainnya' && <LainnyaTab />}
      <BottomNav />
    </>
  );
}
```

**ProgressContext.jsx:**
```jsx
const ProgressContext = createContext();
export function ProgressProvider({ children }) {
  const store = useStore(); // dari storage engine baru
  // known, unknown, starred, handleMark, toggleStar
  // wrongCounts, scores
  // Semua mode konsumsi via useProgress() hook
  return <ProgressContext.Provider value={...}>{children}</ProgressContext.Provider>;
}
export const useProgress = () => useContext(ProgressContext);
```

**modes.js — Single Source of Truth:**
```js
// ELIMINASI duplikasi antara App.jsx BELAJAR_MODES dan Dashboard.jsx MODE_META
export const ALL_MODES = {
  ulasan: {
    icon: '🔁', label: 'Ulasan SRS', desc: 'Kartu jatuh tempo hari ini',
    tab: 'belajar', time: null,
    component: () => import('../modes/ReviewMode.jsx'),
  },
  kartu: {
    icon: '🃏', label: 'Kartu', desc: 'Flashcard interaktif',
    tab: 'belajar', time: '~10 mnt',
    component: () => import('../modes/FlashcardMode.jsx'),
  },
  // ... semua 17 modes
};
```

### 2.3 ModeRouter dengan ErrorBoundary

```jsx
// router/ModeRouter.jsx
import { lazy, Suspense } from 'react';
import { ALL_MODES } from './modes';
import ErrorFallback from '../components/ErrorFallback';

const cache = {};
function getComponent(key) {
  if (!cache[key]) {
    cache[key] = lazy(ALL_MODES[key].component);
  }
  return cache[key];
}

export default function ModeRouter({ mode }) {
  const Component = getComponent(mode);
  return (
    <ErrorBoundary fallback={<ErrorFallback mode={mode} />}>
      <Suspense fallback={<ModeLoading />}>
        <Component />
      </Suspense>
    </ErrorBoundary>
  );
}

// ErrorBoundary — saat ini NOL di seluruh app
class ErrorBoundary extends React.Component {
  state = { error: null };
  static getDerivedStateFromError(e) { return { error: e }; }
  render() {
    if (this.state.error) return this.props.fallback;
    return this.props.children;
  }
}
```

### 2.4 Manfaat

| Aspek | Sebelum | Sesudah |
|-------|---------|---------|
| App.jsx size | 668 baris | **~150 baris** |
| Props drilling depth | 3-4 levels | **0 (context)** |
| Mode definitions | Duplicated (App + Dashboard) | **1 source of truth** |
| Error recovery | Crash = white screen | **Graceful fallback per mode** |
| Agent edit cost | Re-read 668 lines | **Edit 1 small file** |

### 2.5 Prioritas: 🔴 HIGH

---

## 3. 🎨 PILAR 3: Styling — CSS Modules atau Utility-First

### 3.1 Masalah: 822 Inline Styles (naik dari 767!)

Contoh tipikal saat ini:
```jsx
<div style={{
  padding: '12px 16px', borderRadius: T.r.md,
  background: T.surface, border: `1px solid ${T.border}`,
  display: 'flex', gap: 8, alignItems: 'center',
  animation: 'fadeIn 0.3s ease',
}}>
```

Ini buruk karena:
- **Tidak cacheable oleh browser** — setiap render = new style object allocation
- **Tidak hover/focus/media-query aware** — harus pakai onMouseEnter/Leave
- **Tidak searchable** — "dimana semua padding 12px?" → impossible
- **Agent cost tinggi** — 822 style objects = thousands of tokens per file read
- **Bundle size inflated** — style objects masuk JS bundle, bukan CSS cache

### 3.2 Opsi Solusi

| Opsi | Pros | Cons | Verdict |
|------|------|------|---------|
| **CSS Modules** | Zero runtime, browser caching, standard CSS | Need .module.css files per component, no dynamic theming | ⭐ Best for this project |
| **Tailwind CSS** | Utility-first, great DX, small bundle | Build step dependency, learning curve, class string noise | Good alternative |
| **Vanilla Extract** | Type-safe CSS-in-JS, zero runtime | Complex setup, TS dependency | Overkill |
| **Styled Components** | Dynamic theming, familiar syntax | Runtime cost, bundle size | Wrong trade-off for mobile-first |

### 3.3 Recommendation: CSS Modules + Design Token CSS Variables (Already Have!)

`theme.js` sudah menggunakan CSS variables (`var(--ssw-bg)` etc.) — ini pondasi yang sempurna.

**Strategy:** Convert inline styles → CSS Modules, tetap pakai CSS variables untuk theming.

```css
/* FlashcardMode.module.css */
.card {
  padding: 12px 16px;
  border-radius: var(--ssw-r-md, 12px);
  background: var(--ssw-surface);
  border: 1px solid var(--ssw-border);
  display: flex;
  gap: 8px;
  align-items: center;
  animation: fadeIn 0.3s ease;
}

.card:hover {
  background: var(--ssw-surfaceHover);  /* IMPOSSIBLE with inline styles! */
}

@media (prefers-reduced-motion: reduce) {
  .card { animation: none; }  /* Already handled globally but now per-component too */
}
```

```jsx
// FlashcardMode.jsx
import s from './FlashcardMode.module.css';
<div className={s.card}>  // Clean, cacheable, searchable
```

**Vite supports CSS Modules out of the box** — zero config needed.

### 3.4 Implementation Plan

Phase ini bisa dilakukan **per-file, incrementally**:
1. Start with shared components (QuizShell, ResultScreen, OptionButton, ProgressBar)
2. Then modes from smallest to largest
3. App.jsx last (depends on context extraction in Pilar 2)

**Target: 0 inline style objects** (except truly dynamic values like `left: ${x}px`).

### 3.5 Prioritas: 🟡 MEDIUM — bisa incremental, tapi impact besar pada DX & performance

---

## 4. 📦 PILAR 4: Data Splitting & Lazy Loading

### 4.1 Masalah

```
src/data/cards.js       → 1,599 lines (1438 cards, ~90KB parsed)
src/data/csv-sets.js    → 3,998 lines (300 questions, ~250KB parsed)
src/data/jac-official.js → 975 lines
src/data/wayground-sets.js → 860 lines
Total data:              7,798 lines
```

Vite `manualChunks` sudah memisahkan data ke chunk terpisah, tapi **semua chunks di-load saat app start** karena `CARDS` diimport di `App.jsx` top-level untuk filtering.

### 4.2 Solusi: Track-Based Data Splitting

**Ide: split `cards.js` per track, lazy-load saat track dipilih.**

```
src/data/
├── cards-common.js      ← salam, hukum, keselamatan, karier (~400 cards)
├── cards-doboku.js      ← jenis_kerja + alat_umum for doboku (~300 cards)
├── cards-kenchiku.js    ← jenis_kerja + alat_umum for kenchiku (~300 cards)
├── cards-lifeline.js    ← listrik, pipa, telekom, isolasi, pemadam (~438 cards)
├── cards-loader.js      ← Dynamic import helper
```

```js
// cards-loader.js
const trackModules = {
  doboku: () => Promise.all([
    import('./cards-common.js'),
    import('./cards-doboku.js'),
  ]).then(([c, d]) => [...c.CARDS, ...d.CARDS]),

  kenchiku: () => Promise.all([
    import('./cards-common.js'),
    import('./cards-kenchiku.js'),
  ]).then(([c, k]) => [...c.CARDS, ...k.CARDS]),

  lifeline: () => Promise.all([
    import('./cards-common.js'),
    import('./cards-lifeline.js'),
  ]).then(([c, l]) => [...c.CARDS, ...l.CARDS]),
};

export async function loadCardsForTrack(track) {
  return trackModules[track]();
}
```

**Benefit:** User yang pilih "Lifeline" tidak perlu download 600 kartu Sipil/Bangunan.

### 4.3 Soal Data: Lazy per Mode

CSV sets dan Wayground sets **hanya dibutuhkan saat mode dibuka**:

```js
// Di VocabMode.jsx — sudah lazy via React.lazy, tapi data masih eager
// Sebelum:
import { CSV_SETS } from '../data/csv-sets.js';

// Sesudah: import di dalam komponen
const VocabMode = () => {
  const [sets, setSets] = useState(null);
  useEffect(() => {
    import('../data/csv-sets.js').then(m => setSets(m.CSV_SETS));
  }, []);
  if (!sets) return <Loading />;
  // ...
};
```

Tapi ini sudah otomatis terjadi karena `React.lazy()` — Vite code-splits mode + dependenciesnya. **Yang perlu dipastikan:** `csv-sets.js` tidak di-import di file manapun selain `VocabMode.jsx` (dan `data/index.js` barrel — yang harus di-refactor).

### 4.4 Barrel Export Anti-Pattern

`src/data/index.js` saat ini re-exports SEMUA data:
```js
export { CARDS } from './cards.js';
export { CSV_SETS } from './csv-sets.js';
// etc.
```

**Masalah:** Siapapun yang `import { CARDS } from '../data'` juga pulls in CSV_SETS tree karena barrel. Vite tree-shaking **tidak** menghapus re-exported modules dalam barrel di semua kasus.

**Solusi:** Hapus barrel untuk data files. Import langsung:
```js
import { CARDS } from '../data/cards.js';  // Not from '../data'
```

### 4.5 Estimasi Impact

| Metrik | Sebelum | Sesudah |
|--------|---------|---------|
| Initial JS parse (semua data) | ~400KB | **~150KB** (common + 1 track) |
| Time to interactive (3G) | ~3.5s | **~2.0s** |
| Unused data downloaded | ~60% | **~0%** |

### 4.6 Prioritas: 🟡 MEDIUM — sangat impactful untuk target user (HP budget, jaringan lambat)

---

## 5. 🛡️ PILAR 5: Error Handling & Resilience

### 5.1 Masalah: Zero Error Boundaries

18 mode di-lazy-load tapi **tidak ada ErrorBoundary**. Jika 1 mode crash (misalnya data corrupt, atau edge case di SRS calculation), seluruh app white-screens.

Skenario real:
- User punya SRS data corrupt dari export lama → ReviewMode crash → app mati
- csv-sets.js punya typo di 1 soal → VocabMode crash → app mati
- Network timeout saat lazy-load → blank screen, no retry

### 5.2 Solusi: Layered Error Boundaries

```
<AppErrorBoundary>          ← Catch-all: "Something went wrong, reload"
  <AppProvider>
    <ModeErrorBoundary>     ← Per-mode: "Mode ini error, kembali ke menu"
      <LazyMode />
    </ModeErrorBoundary>
  </AppProvider>
</AppErrorBoundary>
```

```jsx
// components/ErrorFallback.jsx
export function ModeErrorFallback({ mode, error, onReset }) {
  return (
    <div className={s.errorScreen}>
      <div className={s.emoji}>⚠️</div>
      <h2>Mode "{mode}" mengalami masalah</h2>
      <p className={s.errorMsg}>{error?.message || 'Unknown error'}</p>
      <div className={s.actions}>
        <button onClick={onReset}>Coba Lagi</button>
        <button onClick={() => window.location.reload()}>Muat Ulang App</button>
      </div>
    </div>
  );
}
```

### 5.3 Defensive Data Access

Tambahkan runtime validation untuk data dari localStorage:

```js
// Di storage/engine.js
function validateProgress(data) {
  if (!data || typeof data !== 'object') return getDefaults('PROGRESS');
  if (!Array.isArray(data.known)) data.known = [];
  if (!Array.isArray(data.unknown)) data.unknown = [];
  // ... validate each field, fallback to defaults
  return data;
}
```

### 5.4 Prioritas: 🔴 HIGH — user-facing crashes pada target audience (junior yang tidak tahu debug)

---

## 6. 🧪 PILAR 6: Testing Strategy

### 6.1 Status Saat Ini

```
111 tests passing:
- src/tests/data.test.js     (299 lines) — data integrity
- src/tests/utils.test.js    (176 lines) — shuffle, jp-helpers, quiz-generator
- src/tests/srs.test.js      (unknown)   — FSRS core
- src/tests/scheduler.test.js (188 lines) — FSRS scheduler
- src/tests/quiz.test.js     (unknown)   — quiz generation
```

**Yang TIDAK di-test:**
- ❌ Semua 12 komponen (`Dashboard`, `QuizShell`, `ResultScreen`, etc.)
- ❌ Semua 18 mode
- ❌ Storage engine (read/write/migration)
- ❌ Hook behavior (`usePersistedState`, `useSRS`, `useStreak`)
- ❌ Navigation flow (onboarding → track picker → dashboard → mode → exit)
- ❌ Export/Import round-trip

### 6.2 Testing Pyramid

```
                    ┌─────────┐
                    │  E2E    │  ← Playwright: 5-10 critical flows
                    │  (few)  │     "Buka app → pilih track → flip kartu → rate SRS"
                   ┌┴─────────┴┐
                   │ Component  │  ← React Testing Library: 20-30 tests
                   │  (some)    │     QuizShell, Dashboard, ResultScreen, FilterPopup
                  ┌┴────────────┴┐
                  │ Integration   │  ← Storage engine, SRS flow, migration
                  │  (moderate)   │     "Write v1 data → init → migrate → read v2"
                 ┌┴──────────────┴┐
                 │ Unit (many)     │  ← Already good: data, utils, FSRS math
                 └────────────────┘
```

### 6.3 Concrete Test Additions

**Storage engine tests (baru, ~30 tests):**
```js
describe('StorageEngine', () => {
  it('initializes with defaults on empty localStorage');
  it('reads and parses 3 documents');
  it('write-through updates localStorage');
  it('debounces rapid writes');
  it('migrates v1 fragmented keys to v2 unified');
  it('preserves all data through migration');
  it('handles corrupt JSON gracefully');
  it('export snapshot is importable');
});
```

**Component tests (baru, ~20 tests):**
```js
describe('QuizShell', () => {
  it('renders question and options');
  it('highlights correct/wrong after selection');
  it('auto-advances after delay');
  it('shows result screen after all questions');
  it('calls onFinish with correct/total/maxStreak');
});

describe('Dashboard', () => {
  it('shows SRS due count badge');
  it('shows progress ring');
  it('navigates to mode on tile click');
});
```

**E2E smoke tests (Playwright, ~5 tests):**
```js
test('full study flow', async ({ page }) => {
  await page.goto('/');
  // Skip onboarding
  // Pick track
  // Open flashcard mode
  // Flip card, rate SRS
  // Exit, check dashboard updated
});
```

### 6.4 Prioritas: 🟡 MEDIUM — critical path tests first, expand over time

---

## 7. 🚀 PILAR 7: CI/CD & Developer Experience

### 7.1 GitHub Actions Pipeline

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build
      - run: npm run audit:integrity
```

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      pages: write
      id-token: write
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci && npm run build
      # Auto-bump CACHE_VERSION in sw.js before deploy
      - run: |
          HASH=$(git rev-parse --short HEAD)
          sed -i "s/CACHE_VERSION = .*/CACHE_VERSION = 'ssw-${HASH}';/" dist/sw.js
      - uses: actions/deploy-pages@v4
```

**Bonus: auto-increment SW cache version** — currently manual, prone to stale caches.

### 7.2 Pre-commit Hooks (Optional)

```json
// package.json
"lint-staged": {
  "src/**/*.{js,jsx}": ["eslint --fix", "prettier --write"]
}
```

### 7.3 Prioritas: 🟡 MEDIUM — prevents regressions, enables confident multi-agent workflow

---

## 8. 🔧 PILAR 8: Miscellaneous Improvements

### 8.1 Duplicate Mode Definitions

**Problem:** Mode metadata duplicated between `App.jsx` (`BELAJAR_MODES`, `UJIAN_MODES`, `LAINNYA_MODES`) and `Dashboard.jsx` (`MODE_META`). Adding a mode = edit 2 files.

**Solution:** Single `modes.js` registry (see Pilar 2). Both App and Dashboard consume from same source.

### 8.2 Onboarding as Separate Component File

**Problem:** `Onboarding` function is defined inline in `App.jsx` (75 lines). Not reusable, clutters App.

**Solution:** Extract to `src/components/Onboarding.jsx`.

### 8.3 PWA Service Worker — Auto Cache Versioning

**Problem:** `CACHE_VERSION` in `sw.js` must be manually bumped. Forgotten bumps = users stuck on old version.

**Solution:** Vite plugin or build script that injects git hash:
```js
// vite.config.js
{
  plugins: [
    react(),
    {
      name: 'sw-version',
      writeBundle() {
        const hash = execSync('git rev-parse --short HEAD').toString().trim();
        const swPath = path.join('dist', 'sw.js');
        let sw = fs.readFileSync(swPath, 'utf-8');
        sw = sw.replace(/CACHE_VERSION = '[^']*'/, `CACHE_VERSION = 'ssw-${hash}'`);
        fs.writeFileSync(swPath, sw);
      }
    }
  ]
}
```

### 8.4 Accessibility Quick Wins

Saat ini:
- ❌ Buttons tanpa `aria-label` (emoji-only buttons)
- ❌ Focus management saat mode switch (keyboard users lost)
- ❌ No `role="alert"` pada toast notifications
- ❌ Color contrast issues di beberapa `textDim` values

Quick fixes:
```jsx
<button aria-label="Kembali ke menu" onClick={onExit}>←</button>
<div role="alert" aria-live="polite">{toastMessage}</div>
```

### 8.5 Bundle Analysis

Add `rollup-plugin-visualizer` untuk track bundle size over time:
```js
// vite.config.js
import { visualizer } from 'rollup-plugin-visualizer';
plugins: [react(), visualizer({ filename: 'dist/stats.html' })]
```

### 8.6 Prioritas: 🟢 LOW — quality of life, do when convenient

---

## 9. 🗺️ Roadmap Eksekusi

### Phase A: Storage Foundation (1 session)
> **Prerequisite untuk Phase B-D**

1. Build `src/storage/` engine (3 files)
2. Write migration from v1 (fragmented) → v2 (3-doc)
3. Write 30 storage tests
4. Wire up to existing app (replace all `localStorage.getItem/setItem` calls)
5. Test migration with real data (export current → clear → import → verify)

### Phase B: App Decomposition (1-2 sessions)
> **Depends on Phase A**

1. Extract `ProgressContext`, `SRSContext`, `AppContext`
2. Create `modes.js` single registry
3. Build `ModeRouter` with ErrorBoundary
4. Extract `Onboarding.jsx`
5. Reduce App.jsx to ~150 lines
6. Verify all 18 modes still work

### Phase C: CSS Modules Migration (2-3 sessions)
> **Independent — can parallel with B**

1. Start with shared components (6 files)
2. Then modes, smallest first
3. Target: 0 inline style objects
4. Verify dark/light theming still works

### Phase D: Data Splitting (1 session)
> **Depends on Phase B (context provides data)**

1. Split cards.js per track
2. Build cards-loader with dynamic import
3. Remove barrel re-exports for data
4. Verify lazy loading works per track

### Phase E: CI/CD + DX (1 session)
> **Independent**

1. GitHub Actions CI (lint + test + build)
2. GitHub Actions deploy (auto cache version)
3. Add rollup-plugin-visualizer
4. Pre-commit hooks (optional)

### Phase F: Testing Expansion (ongoing)
> **After Phase A-B stabilize**

1. Component tests for QuizShell, Dashboard, ResultScreen
2. Integration tests for storage migration
3. E2E smoke tests (Playwright, 5 critical paths)

---

## 10. Estimasi Total

| Phase | Sessions | Lines Changed | Risk |
|-------|----------|---------------|------|
| A — Storage | 1 | ~600 new, ~400 edit | Medium (migration) |
| B — Decomposition | 1-2 | ~800 new, ~500 delete | Medium (refactor) |
| C — CSS Modules | 2-3 | ~2000 edit | Low (cosmetic) |
| D — Data Split | 1 | ~200 new, ~100 edit | Low |
| E — CI/CD | 1 | ~100 new (config) | Low |
| F — Testing | ongoing | ~500+ new | Low |
| **Total** | **7-10 sessions** | **~4000+ lines** | |

---

## 11. Yang TIDAK Termasuk (Agent Lain)

- ❌ Konten baru (kartu, soal, kategori baru)
- ❌ Cross-check dengan PDF JAC terbaru
- ❌ Gambar/illustrasi untuk soal alat
- ❌ Mnemonik / memory tricks
- ❌ CSV dari Wayground/sensei audit
- ❌ Translation / i18n system (premature — app is Indonesian-only for now)

---

## 12. Pertanyaan untuk Nugget

1. **Storage migration:** Mau backward-compatible (auto-migrate old format) atau clean break (user harus export-import)?
   → Rekomendasi: auto-migrate.

2. **CSS Modules vs Tailwind:** Preferensi styling approach?
   → Rekomendasi: CSS Modules (zero runtime, no build dep).

3. **CI/CD:** GitHub Actions auto-deploy ke Pages, atau tetap manual?
   → Rekomendasi: auto-deploy on push to main.

4. **Testing depth:** Mau Playwright E2E atau cukup unit + component?
   → Rekomendasi: unit + component dulu, E2E belakangan.

---

*Proposal ini dihasilkan dari audit exhaustive 19.646 baris source code, 20+ localStorage key patterns, 822 inline style instances, dan seluruh dokumentasi proyek. Setiap pilar bisa dieksekusi independen — tapi Phase A (Storage) adalah foundation yang membuka Phase B dan D.*
