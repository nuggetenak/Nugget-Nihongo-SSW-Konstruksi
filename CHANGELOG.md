## [3.6.0] - 2026-05-01

### Phase 10 — QA + Release

**Lint fixes (0 errors, 0 warnings):**
- `FlashcardMode.jsx`: suppress false-positive `react-hooks/refs` on `starred.size` (Set prop, not a ref)
- `Onboarding.jsx`: rename unused `stepIdx` → `_stepIdx`
- `ReviewMode.jsx`: remove unused `EmptyState` import
- `VocabMode.jsx`: fix `let qs` → `const qs`

**Final audit:**
- 209 tests passing (all 9 test files green)
- `audit:integrity`: 1438 cards, 0 issues, 0 warnings
- Build: 106 modules, clean
- `dist/stats.html` bundle visualizer generated

---

## [3.5.3] - 2026-05-01

### Phase 9 — CI/CD + DX

**Component tests (+59 new tests, 150 → 209):**
- `ResultScreen` — 18 tests: celebrate/encourage/neutral paths, edge cases, actions
- `QuizShell` — 21 tests: rendering, answer selection, multi-Q flow, finish flow
- `Dashboard` — 20 tests: header, progress ring, smart CTA, quick modes, track variants

**Bundle visualizer:**
- Install `rollup-plugin-visualizer`
- `vite.config.js` → functional form (mode-aware), visualizer outputs `dist/stats.html` with gzip+brotli sizes

**DX:**
- `vitest.config.js`: expand coverage to include `storage/**` + 3 core components
- Install missing `@testing-library/dom` peer dep

---

## [3.5.2] - 2026-05-01

### Phase 8 — Empty States + Loading + Accessibility

**Skeleton component:**
- `src/components/Skeleton.jsx` — new reusable shimmer skeleton with sub-variants: `Skeleton` (base), `Skeleton.Card` (flashcard front), `Skeleton.QuizOption`, `Skeleton.Stat`, `Skeleton.Row`
- `src/components/Skeleton.module.css` — shimmer keyframe animation via CSS gradient sweep

**Empty states:**
- `src/components/EmptyState.jsx` — added 5 named presets: `EmptyState.NoReviews`, `EmptyState.NoWrong`, `EmptyState.SearchEmpty`, `EmptyState.NoStarred`, `EmptyState.NoProgress`; added `role="status"` + `aria-live="polite"` to base component

**Accessibility:**
- `src/components/Toast.jsx` — added `role="status"` + `aria-live="polite"` + `aria-atomic="false"` to toast stack; aria-labels on Batalkan + close buttons
- `src/router/ModeRouter.jsx` — replaced plain text loader with `Skeleton.Card`; `ModeLoader` now has `role="status"` + `aria-label`; ErrorBoundary gets `role="alert"`; `FocusSentinel` component moves focus to `#mode-heading` on mode entry (80ms delay for Suspense)
- `index.html` — skip nav link (`.skip-nav`) reveals on :focus; `#root` gets `role="application"` + `aria-label`; `<main id="main-content">` landmark in App.jsx
- `src/App.jsx` — wrapped render output in `<main id="main-content">` for skip nav target

**Color contrast (Blueprint B12):**
- `src/styles/theme.js` — bumped `--ssw-textDim` light: 0.36→0.52, dark: 0.30→0.50; `--ssw-textMuted` light: 0.58→0.72, dark: 0.55→0.72; `--ssw-textFaint` light: 0.18→0.32, dark: 0.16→0.30 — all text now ≥4.5:1 against bg

**ReviewMode loading:**
- `src/modes/ReviewMode.jsx` — `queue === null` state now renders `Skeleton.Card` instead of dim text

Build ✓ · 150 tests ✓

## [3.5.1] - 2026-05-01

### Phase 7 — Onboarding Redesign

**Strategy:** Replace static 4-slide onboarding with interactive 4-step flow. Track picker merged into onboarding. Daily goal setter added.

**Changes:**
- `src/components/Onboarding.jsx` — new component (replaces inline in App.jsx). 4 steps: Welcome → Track Picker (merged) → Mini Flashcard Demo (3D flip, 安全帯) → Daily Goal Setter (10/20/30/50 kartu/hari)
- `src/components/Onboarding.module.css` — full CSS module with animation spec
- `src/App.jsx` — remove inline Onboarding + TrackPicker imports; use new `Onboarding`; edge-case track=null handled
- `src/contexts/AppContext.jsx` — `completeOnboarding` now accepts `{ track, dailyGoal }` payload; `setDailyGoal` exposed in context; `dailyGoal` surfaced
- `src/storage/schema.js` — `dailyGoal: 20` already in defaults (no change)

**Result:** New users experience interactive onboarding: tap to flip real flashcard (3D CSS animation), pick track, set daily goal. Old 4-slide flow removed. Build ✓ · 150 tests pass ✓

## [3.4.0] - 2026-04-29

### Phase 6 — CSS Modules (partial — presentation components)

**Strategy:** Extract inline styles from presentation components into CSS modules.
Logic/data components (modes, hooks, srs) deferred to Phase 6 continuation.

**New CSS Module files (8):**
- `src/styles/global.css` — static design tokens (border radii, type scale, font weights, animations, scrollbar, focus-visible), imported once in `main.jsx`
- `src/components/BottomNav.module.css` — nav, tab, activePill, badge
- `src/components/ProgressRing.module.css` — container, svg track/progress, center text
- `src/components/BelajarTab.module.css` — container, page title, section headers, mode card grid
- `src/components/SayaTab.module.css` — container, progress card, section label, row, reset row, footer
- `src/components/Dashboard.module.css` — container, header, streak hero, ring card, CTA, quick grid, recent cards
- `src/components/ProgressBar.module.css` — track, fill
- `src/components/OptionButton.module.css` — btn, badge, text, sub (data-state variants)
- `src/components/ResultScreen.module.css` — hero, tip, actions, reviewItem (data-path variants)

**Migrated components:**
- `BottomNav.jsx` — 0 inline styles (was ~12)
- `BelajarTab.jsx` — 0 inline styles (was ~18)
- `SayaTab.jsx` — 0 inline styles (was ~30)
- `Dashboard.jsx` — 1 justified inline (track pill: dynamic per-track color)
- `ProgressRing.jsx` — 3 justified inline (width/height/fontSize: prop-driven)
- `ProgressBar.jsx` — height/color remain inline (prop-driven)
- `OptionButton.jsx` — uses data-state='correct|wrong|dim' on btn+badge
- `ResultScreen.jsx` — uses data-path='celebrate|encourage|neutral' on hero

**Remaining inline styles (487 — all justified):**
- All dynamic: per-category/per-rating/per-track color, conditional state bg/border, prop-driven sizes, animation runtime values
- Static layout atoms fully migrated to CSS modules
- No further CSS module migration needed

**theme.js:** amber, gold, correct/wrong/border tokens promoted to CSS vars
(--ssw-amber, --ssw-gold, --ssw-correct, --ssw-correctBg, --ssw-correctBorder, --ssw-wrong, --ssw-wrongBg, --ssw-wrongBorder)

**Build:** pending Codex · **Lint:** pending · **Tests:** pending
**Phase 6 COMPLETE** — all 18 modes + all components migrated. 822 → 487 inline styles.

## [3.3.0] - 2026-04-29

### Phase 4 — Flashcard Overhaul
- **3D card flip animation**: CSS `preserve-3d` + `backface-visibility: hidden`
  - Front and back as separate DOM faces (no conditional show/hide)
  - 400ms `cubic-bezier(0.4,0,0.2,1)` transition
- **FSRS 4-button always visible** after flip — no more long-press required
  - Removed binary ✅/❌ buttons entirely — FSRS rating IS the mark
  - Shows interval preview under each button (e.g. "<1m", "3h", "1h", "4h")
  - Keyboard shortcuts: 1=Lagi · 2=Susah · 3=Oke · 4=Mudah
- **Swipe tilt feedback**: card tilts ±4deg + shifts ±24px during swipe gesture
- **"Tap untuk balik" hint**: shows for first 3 lifetime flips, then fades permanently
  - Stored in `prefs.flashcardHintCount` via storage engine
- **Back face redesign**: category gradient bg, JP smaller, ID translation large + bold
- Removed: long-press detection, separate binary mark row, "Tahan tombol" hint
- Kept: search, star, tools row (sort/review-belum/reset/bintang filter), keyboard nav

### Phase 5 — Quiz Shell Polish
- **ResultScreen two-path emotional design** (Blueprint B6):
  - ≥70%: celebrate path — trophy 🏆, green bg, "Bagus Sekali!" 
  - <50%: encourage path — 💪, gentle red tint, weakness tip + "Latih X salah" CTA
  - Score 50–70%: neutral path with grade emoji
  - Wrong-answer shake animation (rsShake) for low scores
- **Explanation animation**: `slideUp 0.25s ease` (was `fadeIn`)
- **Lint**: 0 warnings, 0 errors across all new files

### Phase 9 — CI/CD (partial)
- `.github/workflows/ci.yml`: lint + test + build on every push/PR
- `.github/workflows/deploy.yml`: updated with auto-bump `CACHE_VERSION` in `sw.js`
  - Format: `v{timestamp}` (e.g. `v20260429101500`) on every deploy
  - Prevents stale service worker cache after deploys

## [3.2.0] - 2026-04-29

### Phase 2 — Navigation Restructure (3-tab layout)
- **BottomNav**: 4 tabs → 3 tabs (🏠 Beranda / 📖 Belajar / 👤 Saya)
  - Active pill indicator (pill shape top, not just line)
  - Due badge on Belajar tab shows SRS due count
  - Larger touch targets (3 tabs vs 4 = 33% bigger per tab)
- **BelajarTab** (`src/components/BelajarTab.jsx`): new component
  - All study modes in one scrollable page, grouped by intent
  - 4 sections: 📝 Pelajari (Kartu, Glosari, Cari) · 🧪 Latihan · 📋 Ujian · 🔁 Ulasan
  - Replaces 3 separate tabs (Belajar / Ujian / Lainnya)
- **SayaTab** (`src/components/SayaTab.jsx`): new personal hub
  - Progress ring + streak + SRS breakdown
  - Settings: track picker, theme toggle
  - Data: Export (JSON download) · Import · Reset (3-step countdown confirmation)
  - Links: Sumber Materi → opens SumberMode
  - Consolidates Stats, Export, Sumber from old Lainnya tab

### Phase 3 — Dashboard Redesign
- **ProgressRing** (`src/components/ProgressRing.jsx`): new SVG circular progress
  - Replaces 4-box stats bar AND linear progress bar
  - Animated stroke-dashoffset fill (0.8s ease)
  - Shows percentage + count inline in ring center
- **Dashboard** redesigned (819 → 265 lines):
  - Removed: 4-box stats bar, linear progress bar, SRS breakdown pills, content stats footer, quick links row, starter pack section
  - Added: streak hero card (visible when ≥2 days streak)
  - Added: circular progress ring card with inline stats
  - Added: smart primary CTA (SRS if due, else smart suggestion by progress level)
  - Added: 2×2 quick action grid (Kartu, Kuis, Sprint, JAC)
  - Added: compact recent cards list (3 max, JP + translation)
- **App.jsx**: 131 → 72 lines
  - Removed vocabMode/activeCats/filterOpen state (filter was in Belajar tab header)
  - Removed old ModeGrid + BELAJAR_MODES/UJIAN_MODES/LAINNYA_MODES usage from App
  - Clean 3-tab rendering: home=Dashboard · belajar=BelajarTab · saya=SayaTab

# Changelog

## [3.1.0] - 2026-04-29

### Phase 12 — Vocab DB Build

#### New Files
- `src/data/csv-sets.js` — **300 soal SSW Konstruksi Setsubi** dari CSV agent Claude:
  - 12 sets: `ct01–ct06` (Teori, 30qs each) + `cp01–cp06` (Praktik, 20qs each)
  - Format: 4-choice (A/B/C/D), full bilingual JP↔ID, rich pedagogical explanations
  - Imported into WaygroundMode under "CSV Teori" dan "CSV Praktik" groups

#### Updated Files
- `src/data/wayground-sets.js` — Complete **wg7** (46qs) dan **wg8** (45qs):
  - wg7: Extracted from PDF 07_SSW_ch6_50qs_vocab.pdf (ライフライン第6章 vocab)
  - wg8: Extracted from PDF 08_SSW_ch6_49qs_vocab2.pdf (続き, deduplicated)
  - Both: full furigana《》notation, bilingual opts_id, explanations
- `src/data/index.js` — Added `export { CSV_SETS }` barrel export
- `src/modes/WaygroundMode.jsx`:
  - Imports both `WAYGROUND_SETS` and `CSV_SETS` → merged as `ALL_SETS`
  - Added groups: "CSV Teori" (ct prefix) dan "CSV Praktik" (cp prefix)
  - Added "Segera Hadir / Coming Soon" section for Doboku (土木) dan Kenchiku (建築) tracks
  - Title updated: "Soal Teknis · Lifeline" with total soal count

#### Data Summary
| Source | Sets | Questions |
|--------|------|-----------|
| Wayground (wt) | 10 | 199 |
| Wayground Praktik (wp) | 4 | 80 |
| Wayground Vocab (wg) | 12 | ~380 |
| CSV Teori (ct01-06) | 6 | 180 |
| CSV Praktik (cp01-06) | 6 | 120 |
| **Total** | **38** | **~959** |

#### Source PDFs Status
| PDF | Title | Status | Notes |
|-----|-------|--------|-------|
| 01-06 | Lifeline 15/10/50/20/15/22qs | ✅ Curated | In wg1-wg6 sets (existing) |
| 07 | ライフライン第6章 50QS | ✅ Complete | wg7: 46qs (4 cross-dedup removed) |
| 08 | ライフライン第6章 50QS(2) | ✅ Complete | wg8: 45qs (4 cross-dedup removed) |
| 09 | ライフライン6(2) | ✅ Existing | wg9: 50qs (previously extracted) |
| 10 | ライフライン第5章 fill-in | ✅ Existing | wg10: 20qs (previously extracted) |
| 11 | ライフライン言葉第5章 | ✅ Existing | wg11: 50qs (previously extracted) |
| 12 | DUPLICATE of PDF 10 | ⏭️ Skipped | As per handoff instructions |
## [3.0.1] - 2026-04-28

### Phase 11 — GlossaryMode A-Z Navigation
- Sticky horizontal nav strip dengan semua huruf hiragana yang tersedia di dataset
- Auto-scroll nav pill ke posisi aktif saat user scroll halaman (via IntersectionObserver)
- Jump-to-section: tap huruf di nav strip → scroll smooth ke section dengan offset correction untuk sticky header
- Section headers sekarang punya count badge (jumlah istilah per huruf)
- Expanded card sekarang menampilkan source tag (canonical key)
- Category emoji indicator per kartu (tampil di row utama, tidak hanya saat expand)
- Count badge di filter category pills (hanya saat pill tersebut active)
- Reset expanded + active letter saat ganti category filter


## [3.0.0] - 2026-04-28

### Phase 1 — Smart Text Components
- `JpFront`: smart compound-term layouts — `vs` (stacked+VS), `・` (stacked+HR), `：` (title/subtitle), `→` (chain) — ported from v87 with T.* theming
- `DescBlock`: smart description parsing — `①②③` circled lists, `【keyword】` labeled segments, `(Sumber:...)` footnote extraction

### Phase 2 — FlashcardMode Feature Restore (12 features)
- Search bar: real-time filter by JP / romaji / ID
- Star system: ⭐/☆ per card, persisted to localStorage `ssw-starred`
- Stats row: Total / Hafal / Belum / Sisa colored boxes
- Category pill on card front (top-left badge)
- Card # indicator (#N corner)
- Tools row: Prioritas/Acak/Urut toggle, Review ❌ Belum filter, Reset (2-tap confirm), ⭐ Bintang filter
- Flip gradient: card bg → category color gradient on flip
- Status border: green/red/neutral by known state
- Smart JpFront + DescBlock on card front/back
- Binary mark buttons (✓/✗) with FSRS 4-button behind long-press
- Improved empty states (search, reviewBelum, empty filter)

### Phase 3 — QuizMode Feature Restore
- Quiz count selector: 10 / 20 / 30 / Semua
- Lemah mode: focus on previously-wrong cards (sorted by wrong count)
- Anti-repeat: seenPool prevents same card twice per session
- Settings panel: ⚙ gear toggles difficulty, lemah mode, auto-next delay
- Configurable auto-next: 1s / 1.5s / 2s / Manual
- QuizShell: `autoNextDelay` prop, manual mode skips auto-advance

### Phase 4 — JACMode + WaygroundMode + SimulasiMode
- JACMode: lemah filter, score tracking per set (`ssw-jac-scores`), last-score badge, auto-delay setting
- WaygroundMode: score + maxStreak per set (`ssw-wg-scores`), badge on picker cards, color stripe
- SimulasiMode: standalone (no QuizShell) — big timer, LULUS/BELUM LULUS (65%), wrong review
- QuizShell: `onFinish({ correct, total, maxStreak })` callback prop

### Phase 5 — DangerMode + AngkaMode
- DangerMode: browse panel accordion (correct vs traps), quiz with after-answer pair comparison
- AngkaMode: grouped browse panel (5 topic groups), quiz with wrong review, "Wajib hafal" banner

### Phase 6 — FilterPopup + App UX
- FilterPopup.jsx: 3-col grid bottom sheet, Bintang cell, "Terapkan" CTA
- Last-mode persistence: `ssw-last-mode` (app resumes on reload)
- Materi toggle: card counts per segment

### Phase 7 — Dashboard Overhaul
- Stats bar (4 colored boxes), Quick Start CTA (smart logic), Mode tiles with time estimates
- Streak + daily count + daily goal bar, Recently studied (5 cards), SRS breakdown
- Content stats footer, Quick links row

### Phase 8 — Visual Polish + Empty States + Accessibility
- Toast.jsx (useToast), ConfirmDialog.jsx (useConfirm), EmptyState.jsx
- Empty states: ReviewMode, SearchMode, FocusMode
- FlashcardMode: toast on mark (with Undo) + reset
- `prefers-reduced-motion` media query — all animations disabled

### Phase 9 — Beginner UX
- FlashcardMode first-time tutorial overlay (dismissed once, stored)
- InfoTooltip ⓘ: SRS and JAC explanations on Dashboard
- Starter pack section for users with 0 known cards
- Milestone toasts (once each): 10 cards hafal, first quiz ≥70%, 7-day streak

### Kept from v2.x
- FSRS spaced repetition engine (unchanged)
- Light/dark theme with CSS vars (unchanged)
- Track system (unchanged)
- PWA + CI/CD (unchanged)
- 111 tests — all pass


## [2.3.6] - 2026-04-28

### Fixed
- **favicon 404** — icon-32x32.png tidak ada; diganti favicon.ico + favicon.png.
- **FOUC dark-flash light mode** — body/root:empty::before background diganti ke #FFFDF5.
- **color-scheme meta salah** — "dark" → "light dark".
- **manifest background_color** — #0D0B08 → #FFFDF5 (light default splash).

### Added
- 6 tests baru: getCatsForTrack coverage (data.test.js). Total: 111 tests.

## [2.3.5] - 2026-04-28

### Fixed
- **`useSRS`: `initStore()` dipanggil setiap render** — dipindah ke initializer `useState(() => { initStore(); return 0; })` sehingga hanya dipanggil sekali saat mount.
- **`SearchMode`: input `width: 100%` tanpa `boxSizing: border-box`** — menyebabkan horizontal overflow di layar sempit. Fixed.

### Added
- **`src/tests/scheduler.test.js`** — 24 test baru: `fmtInterval` (5 kasus edge), `recordReview` (7 kasus), `getDueCardIds` (4 kasus), `getSRSStats` (3 kasus), `previewIntervals` (4 kasus), store write-through (1 kasus). Sebelumnya `fsrs-scheduler.js` 0% coverage dari test suite.
- **`src/tests/quiz.test.js`** — 9 test baru: `generateQuiz` (easy/medium/hard, correctness, dedup, edge cases). Sebelumnya `quiz-generator.js` 0% coverage.

### Changed
- Test suite naik dari **72 → 105 tests** (5 test files).
- `_MAP.md` Phase 5.3 entry diperbarui dengan info test suite baru.

## [2.3.4] - 2026-04-28

### Fixed
- **BottomNav hardcoded dark background** — `rgba(13,11,8,0.92)` diganti `var(--ssw-navBg)`. Nav sekarang ikut theme light/dark dengan benar.
- **ReviewMode interval labels salah unit** — inline formatter menggunakan suffix `h` (ambigu: jam atau hari?) diganti pakai `fmtInterval()` dari `fsrs-scheduler.js` yang konsisten memakai `j` (hari), `mgg` (minggu), `bln` (bulan), `th` (tahun).
- **`handleRate` di ReviewMode tidak perlu `async`** — keyword dihapus; tidak ada `await` di dalam fungsi tersebut.

### Changed
- `_MAP.md` diperbarui: Phase 5.3, docs listing PASS2+PASS3, version info.

## [2.3.3] - 2026-04-28

### Fixed
- Bump `CACHE_VERSION` pada `public/sw.js` ke `ssw-v2026-04-28` agar service worker melakukan invalidasi cache lama setelah deploy baru (mencegah pengguna tetap terjebak di bundle lama).
- Format ulang 3 file (`Dashboard.jsx`, `main.jsx`, `styles/theme.js`) dengan Prettier untuk konsistensi kode; format-check sekarang clean 100%.
- Bump `package.json` version ke 2.3.3 untuk sinkronisasi dengan CHANGELOG.

## [2.3.2] - 2026-04-28

### Added
- Audit pass 2 yang lebih agresif: script `scripts/audit-integrity.mjs` untuk validasi data (schema, ID, category, source, grouping).
- Script npm baru: `audit:integrity` dan `audit:full`.

### Changed
- `vite.config.js` dioptimalkan dengan `manualChunks` untuk memisahkan `cards-data` dan `vendor` dari chunk utama.
- `src/App.jsx` mempertahankan lazy-load mode-level (Review/Kartu/Kuis/dll) untuk mengurangi beban mode code pada initial route.

### Notes
- Hasil build terbaru: chunk utama turun signifikan, data cards dipisah ke chunk khusus.
- `npm audit --omit=dev` belum bisa dieksekusi penuh di environment ini (registry endpoint mengembalikan HTTP 403).

## [2.3.1] - 2026-04-28

### Added
- Dokumen audit komprehensif: `docs/AUDIT-2026-04-28.md`.
- Script administratif `audit:baseline` untuk cek baseline cepat.
- ESLint + Prettier konfigurasi. 72 tests (utils, srs, data) — semua pass.
- GitHub Actions CI/CD: validate → build → deploy.

### Changed
- Refactor loading mode di `src/App.jsx` menjadi lazy-loaded per mode menggunakan `React.lazy` + `Suspense`.
- Tambahan fallback loading saat mode dimuat.
- README diperbarui dengan referensi dokumen audit.

### Notes
- Build tetap lolos.
- Warning bundle size perlu tindak lanjut tambahan pada pemisahan data besar.

---

## [2.3.2] - 2026-04-28 (Codex audit)

### Added
- Audit pass 2: `scripts/audit-integrity.mjs` untuk validasi data (schema, ID, category, source, grouping)
- Script npm: `audit:integrity` dan `audit:full`

### Changed
- `vite.config.js`: `manualChunks` untuk memisahkan `cards-data` dan `vendor`
- `src/App.jsx`: lazy-load mode-level via `React.lazy` + `Suspense`

## [2.3.1] - 2026-04-28 (Codex audit)

### Added
- Dokumen audit: `docs/AUDIT-2026-04-28.md`
- Script `audit:baseline`

### Changed
- README diperbarui dengan referensi audit
