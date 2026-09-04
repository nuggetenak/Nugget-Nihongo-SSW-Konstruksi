// ─── router/modes.js ─────────────────────────────────────────────────────────
// Single registry for all modes: lazy imports, nav sections, metadata.
// (Doboku/Kenchiku modes removed — scope reduced to Lifeline-only, see CHANGELOG.md)
// ─────────────────────────────────────────────────────────────────────────────

import { lazy } from 'react';
import { QUIZ_SETS } from '../data/quiz-sets.js';
import { isVocabId } from '../utils/quiz-classification.js';

// Question counts shown in the menu, derived rather than typed.
//
// Both numbers here were hand-written and both were wrong: wayground claimed 579
// against a real 740, vocab claimed 380 against a real 240. They went stale when
// the jac-mockup sets were folded into WaygroundMode and the vocab drill was
// re-scoped to wglv-* ids only -- a content change nothing connected back to the
// two strings describing it. Counted from the same QUIZ_SETS/isVocabId split the
// two modes themselves use, so the menu and the mode can no longer disagree.
//
// Track-independent on purpose: this is a single-track app (every category is
// tracks: ['lifeline']), and a menu label is not the place to imply otherwise.
const countQuestions = (sets) => sets.reduce((n, s) => n + s.questions.length, 0);
const MODE_COUNTS = {
  wayground: countQuestions(QUIZ_SETS.filter((s) => !isVocabId(s.id))),
  vocab: countQuestions(QUIZ_SETS.filter((s) => isVocabId(s.id))),
};

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
  ekspor: lazy(() => import('../modes/ExportMode.jsx')),
  ulasan: lazy(() => import('../modes/ReviewMode.jsx')),
  produksi: lazy(() => import('../modes/ProductionMode.jsx')),
  mirip: lazy(() => import('../modes/ConfusionMode.jsx')),
  dengar: lazy(() => import('../modes/DengarMode.jsx')),
  catatan: lazy(() => import('../modes/CatatanMode.jsx')),
  kuisprod: lazy(() => import('../modes/QuizProduksiMode.jsx')),
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
    modes: ['kuis', 'sprint', 'fokus', 'angka', 'jebak', 'produksi', 'mirip', 'dengar', 'kuisprod'],
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
    desc: 'Ujian + timer',
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
  produksi: {
    icon: '✍️',
    ui: 'tulis',
    label: 'Produksi',
    desc: 'ID→JP: ketik jawaban Jepang',
    color: '#34d399',
    strand: 'output',
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
  kuisprod: {
    icon: '🔤',
    ui: 'ketik',
    label: 'Kuis Produksi',
    short: 'Kuis Prod',
    desc: 'JP → ketik terjemahan Indonesia',
    color: '#10b981',
    strand: 'output',
  },
};

// ── Dashboard quick tiles (4 most-used, top row) ─────────────────────────
export const DASHBOARD_QUICK_MODES = ['kartu', 'kuis', 'sprint', 'jac'];
