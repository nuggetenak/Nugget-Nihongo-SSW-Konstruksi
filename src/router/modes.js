// ─── router/modes.js ──────────────────────────────────────────────────────────
// Single registry for all 18 modes. Eliminates duplication between
// App.jsx and Dashboard.jsx. Consumed by ModeRouter + navigation components.
// ─────────────────────────────────────────────────────────────────────────────

import { lazy } from 'react';

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
  sipil: lazy(() => import('../modes/SipilMode.jsx')),
  bangunan: lazy(() => import('../modes/BangunanMode.jsx')),
};

// ── Navigation sections ────────────────────────────────────────────────────
// Used by BottomNav (Belajar tab) and Dashboard quick-action tiles.
export const MODE_SECTIONS = {
  pelajari: {
    title: '📝 Pelajari',
    subtitle: 'Materi baru',
    modes: ['kartu', 'glosari'],
  },
  latihan: {
    title: '🧪 Latihan',
    subtitle: 'Asah kemampuan',
    modes: ['kuis', 'sprint', 'fokus', 'angka', 'jebak'],
  },
  ujian: {
    title: '📋 Ujian',
    subtitle: 'Soal ujian asli',
    modes: ['jac', 'wayground', 'vocab', 'simulasi', 'sipil', 'bangunan'],
  },
  ulasan: {
    title: '🔁 Ulasan',
    subtitle: 'Kartu jatuh tempo',
    modes: ['ulasan'],
  },
};

// ── Mode metadata (icon, label, desc) ────────────────────────────────────
export const MODE_META = {
  ulasan:   { icon: '🔁', label: 'Ulasan SRS',  desc: 'Kartu jatuh tempo hari ini' },
  kartu:    { icon: '🃏', label: 'Kartu',        desc: 'Flashcard interaktif' },
  kuis:     { icon: '❓', label: 'Kuis',          desc: 'Kuis otomatis 3 level' },
  sprint:   { icon: '⚡', label: 'Sprint',        desc: 'Drill kecepatan 60 detik' },
  fokus:    { icon: '🎯', label: 'Fokus',         desc: 'Latih kelemahan' },
  jac:      { icon: '📋', label: 'JAC Official', desc: 'Soal contoh ujian resmi' },
  wayground:{ icon: '🎓', label: 'Soal Teknis',  desc: '579 soal teori & praktik' },
  vocab:    { icon: '📖', label: 'Kosakata',      desc: '380 soal vocab JP↔ID' },
  simulasi: { icon: '🎯', label: 'Simulasi',      desc: 'Ujian + timer' },
  angka:    { icon: '🔢', label: 'Angka Kunci',   desc: 'Angka wajib hafal' },
  jebak:    { icon: '⚠️', label: 'Soal Jebak',   desc: 'Istilah mirip' },
  sipil:    { icon: '⛏️', label: 'Sipil · 土木',  desc: 'Segera hadir' },
  bangunan: { icon: '🏗️', label: 'Bangunan · 建築',desc: 'Segera hadir' },
  cari:     { icon: '🔍', label: 'Cari',          desc: 'Pencarian cepat' },
  glosari:  { icon: '📖', label: 'Glosari',       desc: 'Kamus terurut' },
  sumber:   { icon: '📂', label: 'Sumber',        desc: 'Per PDF sumber' },
  stats:    { icon: '📊', label: 'Statistik',     desc: 'Progress & kelemahan' },
  ekspor:   { icon: '💾', label: 'Ekspor',        desc: 'Simpan & pulihkan progress' },
};

// ── Dashboard quick tiles (4 most-used, top row) ─────────────────────────
export const DASHBOARD_QUICK_MODES = ['kartu', 'kuis', 'sprint', 'jac'];

// ── Legacy nav arrays (keep for backward compat during refactor) ──────────
export const BELAJAR_MODES = ['ulasan', 'kartu', 'kuis', 'sprint', 'fokus']
  .map((k) => ({ key: k, ...MODE_META[k] }));

export const UJIAN_MODES = ['jac', 'wayground', 'vocab', 'simulasi', 'angka', 'jebak', 'sipil', 'bangunan']
  .map((k) => ({ key: k, ...MODE_META[k] }));

export const LAINNYA_MODES = ['cari', 'glosari', 'sumber', 'stats', 'ekspor']
  .map((k) => ({ key: k, ...MODE_META[k] }));
