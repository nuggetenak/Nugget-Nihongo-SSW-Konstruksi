# Changelog

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
