# Changelog

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
