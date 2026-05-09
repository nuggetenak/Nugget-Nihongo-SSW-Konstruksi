// ─── router/modes.js ─────────────────────────────────────────────────────────
// Single registry for all 23 modes: lazy imports, nav sections, metadata.
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
    modes: ['jac', 'wayground', 'vocab', 'simulasi', 'sipil', 'bangunan'],
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
export const MODE_META = {
  ulasan:   { icon: '🔁', label: 'Ulasan SRS',  desc: 'Kartu jatuh tempo hari ini',         color: '#22c55e', strand: 'fluency'  },
  kartu:    { icon: '🃏', label: 'Kartu',        desc: 'Flashcard interaktif',               color: '#60a5fa', strand: 'input'    },
  kuis:     { icon: '❓', label: 'Kuis',          desc: 'Kuis otomatis 3 level',              color: '#f59e0b', strand: 'language' },
  sprint:   { icon: '⚡', label: 'Sprint',        desc: 'Drill kecepatan 60 detik',           color: '#a78bfa', strand: 'output'   },
  fokus:    { icon: '🎯', label: 'Fokus',         desc: 'Latih kelemahan',                    color: '#f97316', strand: 'input'    },
  jac:      { icon: '📋', label: 'JAC Official', desc: 'Soal contoh ujian resmi',            color: '#6366f1', strand: 'language' },
  wayground:{ icon: '🎓', label: 'Soal Teknis',  desc: '579 soal teori & praktik',           color: '#fb923c', strand: 'language' },
  vocab:    { icon: '📖', label: 'Kosakata',      desc: '380 soal vocab JP↔ID',              color: '#0891b2', strand: 'input'    },
  simulasi: { icon: '🎯', label: 'Simulasi',      desc: 'Ujian + timer',                      color: '#ef4444', strand: 'language' },
  angka:    { icon: '🔢', label: 'Angka Kunci',   desc: 'Angka wajib hafal',                  color: '#facc15', strand: 'input'    },
  jebak:    { icon: '⚠️', label: 'Soal Jebak',   desc: 'Istilah mirip',                      color: '#dc2626', strand: 'input'    },
  sipil:    { icon: '⛏️', label: 'Sipil · 土木',    desc: '45 soal SSW jalur 土木',            color: '#78716c', strand: 'language' },
  bangunan: { icon: '🏗️', label: 'Bangunan · 建築', desc: '45 soal SSW jalur 建築',          color: '#0ea5e9', strand: 'language' },
  cari:     { icon: '🔍', label: 'Cari',          desc: 'Pencarian cepat',                    color: '#475569', strand: 'input'    },
  glosari:  { icon: '📖', label: 'Glosari',       desc: 'Kamus terurut',                      color: '#7c3aed', strand: 'input'    },
  sumber:   { icon: '📂', label: 'Sumber',        desc: 'Per PDF sumber',                     color: '#64748b', strand: null       },
  stats:    { icon: '📊', label: 'Statistik',     desc: 'Progress & kelemahan',               color: '#2dd4bf', strand: null       },
  ekspor:   { icon: '💾', label: 'Ekspor',        desc: 'Simpan & pulihkan progress',         color: '#94a3b8', strand: null       },
  produksi: { icon: '✍️', label: 'Produksi',       desc: 'ID→JP: ketik jawaban Jepang',        color: '#34d399', strand: 'output'   },
  mirip:    { icon: '🔀', label: 'Kata Mirip',     desc: 'VLT: pasang istilah yang serupa',    color: '#f472b6', strand: 'language' },
  dengar:   { icon: '🎧', label: 'Dengarkan',      desc: 'Dengar JP → pilih terjemahan',       color: '#e879f9', strand: 'language' },
  catatan:  { icon: '📓', label: 'Buku Catatan',   desc: 'Catatan & mnemonik pribadi',         color: '#84cc16', strand: 'input'    },
  kuisprod: { icon: '🔤', label: 'Kuis Produksi',  desc: 'JP → ketik terjemahan Indonesia',    color: '#10b981', strand: 'output'   },
};

// ── Dashboard quick tiles (4 most-used, top row) ─────────────────────────
export const DASHBOARD_QUICK_MODES = ['kartu', 'kuis', 'sprint', 'jac'];
