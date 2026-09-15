// ─── router/modes.js ─────────────────────────────────────────────────────────
// The registry for all modes: lazy imports, nav sections, metadata, and the
// dashboard's quick-tile list.
// (Doboku/Kenchiku modes removed — scope reduced to Lifeline-only, see CHANGELOG.md)
//
// ── Why this is four exports and not one object (item 207) ───────────────────
//
// The header used to say "single registry" while the file held four objects
// that had to be kept in step by hand, and the plan filed that as a refactor.
// Reading it, three of the four are not four copies of one fact — they are four
// *different* facts, and each has a shape for a reason:
//
//   MODE_COMPONENTS  what to load. The `lazy(() => import('...'))` calls have
//                    to stay literal where a bundler can see them; that is what
//                    gives each mode its own chunk.
//   MODE_SECTIONS    where a mode appears in the menu, AND IN WHAT ORDER. The
//                    order is the array. Folding section membership into
//                    MODE_META would replace a self-evident ordering with an
//                    `order:` integer nobody can keep unique.
//   MODE_META        what to show. Keyed by mode, no ordering, no imports.
//   DASHBOARD_QUICK_MODES  which four modes get a home-screen tile.
//
// So the parallel-object complaint holds for exactly one of them, and it was a
// real defect rather than a tidiness one: `DASHBOARD_QUICK_MODES` had **no
// reader anywhere in the app**, while `Dashboard.jsx` carried its own private
// copy of the same four keys. This file called itself the authority on a list
// that only it read. Dashboard imports it now.
//
// What keeps the rest honest is `src/tests/removed-mode-safety.test.js`: every
// mode in a section has a component and metadata, every component has metadata,
// every metadata entry has a component, no section lists a mode twice, and the
// quick-tile list names real modes. A key set that must agree with another key
// set needs a test, not a comment — which is the whole lesson of 7.5.1.
// ─────────────────────────────────────────────────────────────────────────────

import { lazy } from 'react';
import {
  EXAM_FULL_QUESTIONS,
  examMinutes,
  QUIZ_QUESTION_COUNTS as MODE_COUNTS,
} from '../utils/constants.js';

// Question counts shown in the menu live in constants.js, not here.
//
// They used to be derived in this file from QUIZ_SETS -- correct in principle,
// and it fixed two hand-written counts that had gone stale (wayground said 579
// against a real 740, vocab 380 against 240). The cost was invisible: this
// module is statically imported by App.jsx and AppContext.jsx, so importing the
// quiz barrel here put wayground-sets.js (481 kB) and jac-mockup-sets.js
// (226 kB) on the critical path of every first page view, modulepreloaded from
// index.html, to compute two integers.
//
// Same trap EXAM_FULL_TEORI was pulled out of, same fix. The counts are
// literals in constants.js and src/tests/mode-counts.test.js re-derives them
// from the real data and fails on drift -- a test can import 707 kB; a bundle
// entry cannot.

// ── Lazy imports ──────────────────────────────────────────────────────────
export const MODE_COMPONENTS = {
  kartu: lazy(() => import('../modes/FlashcardMode.jsx')),
  kuis: lazy(() => import('../modes/QuizMode.jsx')),
  jac: lazy(() => import('../modes/JACMode.jsx')),
  wayground: lazy(() => import('../modes/WaygroundMode.jsx')),
  vocab: lazy(() => import('../modes/VocabMode.jsx')),
  angka: lazy(() => import('../modes/AngkaMode.jsx')),
  jebak: lazy(() => import('../modes/DangerMode.jsx')),
  simulasi: lazy(() => import('../modes/SimulasiMode.jsx')),
  stats: lazy(() => import('../modes/StatsMode.jsx')),
  cari: lazy(() => import('../modes/SearchMode.jsx')),
  sprint: lazy(() => import('../modes/SprintMode.jsx')),
  fokus: lazy(() => import('../modes/FocusMode.jsx')),
  glosari: lazy(() => import('../modes/GlossaryMode.jsx')),
  sumber: lazy(() => import('../modes/SumberMode.jsx')),
  tentang: lazy(() => import('../modes/TentangMode.jsx')),
  gerakan: lazy(() => import('../modes/GerakanMode.jsx')),
  ekspor: lazy(() => import('../modes/ExportMode.jsx')),
  ulasan: lazy(() => import('../modes/ReviewMode.jsx')),
  mirip: lazy(() => import('../modes/ConfusionMode.jsx')),
  dengar: lazy(() => import('../modes/DengarMode.jsx')),
  catatan: lazy(() => import('../modes/CatatanMode.jsx')),
  genba: lazy(() => import('../modes/GenbaMode.jsx')),
  skenario: lazy(() => import('../modes/SkenarioMode.jsx')),
};

// ── Navigation sections ────────────────────────────────────────────────────
export const MODE_SECTIONS = {
  pelajari: {
    title: '📝 Pelajari',
    subtitle: 'Materi baru',
    modes: ['kartu', 'glosari', 'cari', 'catatan'],
  },
  latihan: {
    title: '🧪 Latihan',
    subtitle: 'Asah kemampuan',
    modes: ['kuis', 'sprint', 'fokus', 'angka', 'jebak', 'mirip', 'dengar', 'genba', 'skenario'],
  },
  ujian: {
    title: '📋 Ujian',
    subtitle: 'Soal ujian asli',
    modes: ['jac', 'wayground', 'vocab', 'simulasi'],
  },
  ulasan: {
    title: '🔁 Ulasan',
    subtitle: 'Kartu jatuh tempo',
    modes: ['ulasan'],
  },
  alat: {
    title: '🛠️ Alat',
    subtitle: 'Progress & data',
    modes: ['stats', 'ekspor', 'sumber'],
  },
};

/**
 * Which section a mode belongs to, or null for the handful that belong to none.
 *
 * Added for item 154, which gives each section its own page-transition
 * character: entering an exam should not feel like opening the glossary. The
 * sections already group every mode by what it is FOR -- this is what lets the
 * grouping be something a reader feels rather than something only the Belajar
 * menu knows.
 *
 * `info` and `gerakan` are reached from Saya and are deliberately outside
 * MODE_SECTIONS (a help page is not a study mode), so they get null and fall
 * back to the plain directional transition. That is the right answer for them,
 * not a gap.
 */
export function sectionOf(modeKey) {
  for (const [key, section] of Object.entries(MODE_SECTIONS)) {
    if (section.modes.includes(modeKey)) return key;
  }
  return null;
}

// ── Mode metadata (icon, label, desc, color, strand) ────────────────────
// `width` — layout width for the mode's screen, consumed by AppShell.
//   omitted   -> 'reading' (default): a single focused column. Correct for
//                every study surface; full-width flashcards on a desktop
//                monitor put the Japanese term in the middle of an empty field.
//   'default' -> uses the full responsive shell width. For dense, scannable
//                screens (tables, long lists) that genuinely benefit.
// `skeleton` — Suspense-fallback shape while this mode's chunk loads (item
//   17), consumed by ModeRouter's ModeLoader. One generic loader used to
//   cover a flashcard, a stats dashboard, and a glossary alike; on a slow
//   connection (the design assumption) that's on screen long enough for the
//   mismatch to register as a layout jump when real content lands.
//   'card' (default) -> a single card face, like the destination screen
//   'quiz'  -> a question row + a few answer-option rows
//   'list'  -> a few scrollable rows (search results, glossary, notes)
//   'stat'  -> a small grid of numbers, like a stats dashboard
export const MODE_META = {
  ulasan: {
    icon: '🔁',
    ui: 'ulang',
    label: 'Ulasan SRS',
    desc: 'Kartu jatuh tempo hari ini',
    color: '#22c55e',
    strand: 'fluency',
  },
  kartu: {
    icon: '🃏',
    ui: 'kartu',
    label: 'Kartu',
    desc: 'Flashcard interaktif',
    color: '#60a5fa',
    strand: 'input',
  },
  kuis: {
    icon: '❓',
    ui: 'kuis',
    label: 'Kuis',
    desc: 'Kuis otomatis 3 level',
    color: '#f59e0b',
    strand: 'language',
    skeleton: 'quiz',
  },
  sprint: {
    icon: '⚡',
    ui: 'sprint',
    label: 'Sprint',
    desc: 'Drill kecepatan 60 detik',
    color: '#a78bfa',
    strand: 'output',
    skeleton: 'quiz',
  },
  fokus: {
    icon: '🎯',
    ui: 'target',
    label: 'Fokus',
    desc: 'Latih kelemahan',
    color: '#f97316',
    strand: 'input',
    skeleton: 'quiz',
  },
  jac: {
    icon: '📋',
    ui: 'jac',
    label: 'JAC Official',
    short: 'JAC',
    desc: 'Soal contoh ujian resmi',
    color: '#6366f1',
    strand: 'language',
    skeleton: 'quiz',
  },
  wayground: {
    icon: '🎓',
    ui: 'wisuda',
    label: 'Soal Teknis',
    short: 'Teknis',
    // Was '579 soal teori & praktik' -- the mode actually serves 740 (every
    // non-vocab set for this track, jac-mockup included). Wrong on the Belajar
    // menu and the side nav since the jac-mockup sets moved in here. Derived
    // from the data now, so it can't drift again; see MODE_COUNTS below.
    desc: `${MODE_COUNTS.wayground} soal teori & praktik`,
    color: '#fb923c',
    strand: 'language',
    skeleton: 'quiz',
  },
  vocab: {
    icon: '📖',
    ui: 'belajar',
    label: 'Kosakata',
    // Was '380 soal vocab JP↔ID'; the real figure is 240, and the mode's own
    // screen has been printing 240 all along -- the menu and the mode disagreed
    // with each other in the same session.
    desc: `${MODE_COUNTS.vocab} soal vocab JP↔ID`,
    color: '#0891b2',
    strand: 'input',
    skeleton: 'quiz',
  },
  simulasi: {
    icon: '🎯',
    ui: 'simulasi',
    label: 'Simulasi',
    // Item 102b: was 'Ujian + timer', the one description in this section that
    // named no figure while `jac`, `wayground` and `vocab` all derive theirs.
    // The mode offers three lengths; the full exam is the one worth advertising,
    // and its shape lives in constants.js so this and SimulasiMode's own preset
    // read the same numbers. Shorter runs are described on the setup screen,
    // where the choice is actually made.
    desc: `Ujian penuh ${EXAM_FULL_QUESTIONS} soal · ${examMinutes(EXAM_FULL_QUESTIONS)} menit`,
    color: '#ef4444',
    strand: 'language',
    skeleton: 'quiz',
  },
  angka: {
    icon: '🔢',
    ui: 'angka',
    label: 'Angka Kunci',
    desc: 'Angka wajib hafal',
    color: '#facc15',
    strand: 'input',
    skeleton: 'quiz',
  },
  jebak: {
    icon: '⚠️',
    ui: 'peringatan',
    label: 'Soal Jebak',
    desc: 'Istilah mirip',
    color: '#dc2626',
    strand: 'input',
    skeleton: 'quiz',
  },
  // items 103/104. `output` strand: the drill is half comprehension and half
  // production -- half its questions ask what you would say -- and `output` is
  // the strand the app had thinnest after the two typing modes left in 7.0.0.
  genba: {
    icon: '🗣️',
    ui: 'helm',
    label: 'Bahasa Lapangan',
    short: 'Lapangan',
    desc: `${MODE_COUNTS.genba} kalimat yang diucapkan di lokasi`,
    color: '#14b8a6',
    strand: 'output',
    skeleton: 'quiz',
  },
  // item 105. `fluency` rather than `output`: a scene is one thread read at the
  // speed it is spoken, and what it trains is following it without stopping --
  // Nation's fluency strand, and the strand `ulasan` was alone in until now.
  skenario: {
    icon: '🎬',
    ui: 'kalender',
    label: 'Skenario',
    desc: `${MODE_COUNTS.skenario} situasi, satu percakapan penuh`,
    color: '#0d9488',
    strand: 'fluency',
    skeleton: 'quiz',
  },
  cari: {
    icon: '🔍',
    ui: 'cari',
    label: 'Cari',
    width: 'default',
    desc: 'Pencarian cepat',
    color: '#475569',
    strand: 'input',
    skeleton: 'list',
  },
  glosari: {
    icon: '📖',
    ui: 'belajar',
    label: 'Glosari',
    width: 'default',
    desc: 'Kamus terurut',
    color: '#7c3aed',
    strand: 'input',
    skeleton: 'list',
  },
  sumber: {
    icon: '📂',
    ui: 'arsip',
    label: 'Sumber',
    width: 'default',
    desc: 'Per PDF sumber',
    color: '#64748b',
    strand: null,
    skeleton: 'list',
  },
  // Reached only from Saya -> Info; deliberately absent from MODE_SECTIONS,
  // because Belajar is the study menu and a help page is not a study mode.
  // goMode works without section membership. strand: null keeps it out of
  // MISSION_MODES -- a reference surface is not a daily mission.
  gerakan: {
    icon: '✨',
    ui: 'info',
    label: 'Pengaturan Gerakan',
    width: 'default',
    desc: 'Seberapa banyak aplikasi bergerak',
    color: '#a78bfa',
    strand: null,
    skeleton: 'list',
  },
  tentang: {
    icon: 'ℹ️',
    ui: 'info',
    label: 'Tentang Aplikasi',
    width: 'default',
    desc: 'Panduan, tanya-jawab & catatan pembaruan',
    color: '#64748b',
    strand: null,
    skeleton: 'list',
  },
  stats: {
    icon: '📊',
    ui: 'statistik',
    label: 'Statistik',
    width: 'default',
    desc: 'Progress & kelemahan',
    color: '#2dd4bf',
    strand: null,
    skeleton: 'stat',
  },
  ekspor: {
    icon: '💾',
    ui: 'simpan',
    // 'Ekspor & Impor' -- the mode's own heading said this, and now that
    // ModeHeader is the only title on the screen the label has to carry it.
    label: 'Ekspor & Impor',
    short: 'Ekspor',
    desc: 'Simpan & pulihkan progress',
    color: '#94a3b8',
    strand: null,
    skeleton: 'list',
  },
  mirip: {
    icon: '🔀',
    ui: 'tukar',
    label: 'Kata Mirip',
    desc: 'VLT: pasang istilah yang serupa',
    color: '#f472b6',
    strand: 'language',
    skeleton: 'quiz',
  },
  dengar: {
    icon: '🎧',
    ui: 'suara',
    label: 'Dengarkan',
    desc: 'Dengar JP → pilih terjemahan',
    color: '#e879f9',
    strand: 'language',
    skeleton: 'quiz',
  },
  catatan: {
    icon: '📓',
    ui: 'catatan',
    label: 'Buku Catatan',
    desc: 'Catatan & mnemonik pribadi',
    color: '#84cc16',
    strand: 'input',
    skeleton: 'list',
  },
};

// ── Dashboard quick tiles (4 most-used, top row) ─────────────────────────
// Read by `Dashboard.jsx`, which builds each tile's icon and label from
// MODE_META. `.quickGrid` is `repeat(4, 1fr)`, so a fifth key does not vanish
// -- it wraps onto a second row as a single quarter-width tile, which is worse,
// because it looks deliberate. Change the grid and this list together.
export const DASHBOARD_QUICK_MODES = ['kartu', 'kuis', 'sprint', 'jac'];
