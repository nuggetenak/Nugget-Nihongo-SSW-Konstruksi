// ─── data/categories.js — Content Architecture v2 ─────────────────────────────
// Three-layer model: Common (K) + Track-specific (D/B/L) + Practice
// See docs/CONTENT-BLUEPRINT.md for full rationale.
// ─────────────────────────────────────────────────────────────────────────────

export const CATEGORIES = [
  { key: 'all', label: 'すべて', color: '#4a5568', emoji: '📚', tracks: ['doboku','kenchiku','lifeline'] },
  // Common
  { key: 'gaiyou', label: '建設概要・挨拶', color: '#c05621', emoji: '🏛️', tracks: ['doboku','kenchiku','lifeline'], module: 'K1' },
  { key: 'anzen',  label: '安全衛生',      color: '#22543d', emoji: '🦺', tracks: ['doboku','kenchiku','lifeline'], module: 'K2' },
  { key: 'hourei', label: '法令・規制',     color: '#285e61', emoji: '⚖️', tracks: ['doboku','kenchiku','lifeline'], module: 'K3' },
  { key: 'sekou',  label: '施工管理・共通',  color: '#2d3748', emoji: '📋', tracks: ['doboku','kenchiku','lifeline'], module: 'K4' },
  { key: 'career', label: 'キャリア・雇用',  color: '#553c9a', emoji: '👷', tracks: ['doboku','kenchiku','lifeline'], module: 'K5' },
  // Sipil
  { key: 'doboku_doko',   label: '土工事・インフラ', color: '#744210', emoji: '⛏️', tracks: ['doboku'], module: 'D1' },
  { key: 'doboku_hoso',   label: '舗装・道路',      color: '#975a16', emoji: '🛣️', tracks: ['doboku'], module: 'D2' },
  { key: 'doboku_haisui', label: '排水・基礎・杭',   color: '#2c5282', emoji: '🌊', tracks: ['doboku'], module: 'D3' },
  // Bangunan
  { key: 'kenchiku_kutai',  label: '躯体工事',     color: '#1a365d', emoji: '🏗️', tracks: ['kenchiku'], module: 'B1' },
  { key: 'kenchiku_shiage', label: '仕上げ・内装',  color: '#6b46c1', emoji: '🎨', tracks: ['kenchiku'], module: 'B2' },
  // Lifeline
  { key: 'haikan',       label: '配管工事',     color: '#3c366b', emoji: '🔧', tracks: ['lifeline'], module: 'L1' },
  { key: 'denki',        label: '電気工事',     color: '#744210', emoji: '⚡', tracks: ['lifeline'], module: 'L2' },
  { key: 'tsushin',      label: '通信工事',     color: '#1c4532', emoji: '📡', tracks: ['lifeline'], module: 'L3' },
  { key: 'shoubou',      label: '消防設備',     color: '#742a2a', emoji: '🔥', tracks: ['lifeline'], module: 'L4' },
  { key: 'hoon',         label: '保温保冷',     color: '#702459', emoji: '🌡️', tracks: ['lifeline'], module: 'L5' },
  { key: 'setsubi_kougu',label: '設備・空調',    color: '#2d3748', emoji: '🔨', tracks: ['lifeline'], module: 'L6' },
  // Meta
  { key: 'bintang', label: 'Bintang', color: '#b7791f', emoji: '⭐', tracks: ['doboku','kenchiku','lifeline'] },
];

export const getCatInfo = (key) => CATEGORIES.find((c) => c.key === key) || CATEGORIES[0];

export const getCatsForTrack = (track) =>
  CATEGORIES.filter((c) => c.key !== 'all' && c.key !== 'bintang' && c.tracks?.includes(track)).map((c) => c.key);

export const getCatsForModule = (prefix) =>
  CATEGORIES.filter((c) => c.module?.startsWith(prefix)).map((c) => c.key);

export const SOURCE_META = {
  'jac-ch1': { label: 'JAC Ch.1 — Keselamatan & Salam', emoji: '🙏', color: '#c05621' },
  'jac-ch2': { label: 'JAC Ch.2 — Hukum & Regulasi', emoji: '⚖️', color: '#285e61' },
  'jac-ch3': { label: 'JAC Ch.3 — Jenis Pekerjaan', emoji: '🏗️', color: '#1a365d' },
  'jac-ch4': { label: 'JAC Ch.4 — Konstruksi & Teknik', emoji: '🔩', color: '#3c366b' },
  'jac-ch5': { label: 'JAC Ch.5 — Alat & Mesin', emoji: '🔌', color: '#744210' },
  'jac-ch6': { label: 'JAC Ch.6 — Pipa & Isolasi', emoji: '🌡️', color: '#702459' },
  'jac-ch7': { label: 'JAC Ch.7 — Karier & Mesin', emoji: '👷', color: '#553c9a' },
  'jac-gakka1': { label: 'Soal Contoh 学科 Set 1', emoji: '📋', color: '#742a2a' },
  'jac-gakka2': { label: 'Soal Contoh 学科 Set 2', emoji: '📋', color: '#742a2a' },
  'jac-jitsugi1': { label: 'Soal Contoh 実技 Set 1', emoji: '🔧', color: '#22543d' },
  'jac-jitsugi2': { label: 'Soal Contoh 実技 Set 2', emoji: '🔧', color: '#22543d' },
  'vocab-lifeline': { label: 'Vocab — Kosakata 設備実技', emoji: '📖', color: '#0369a1' },
  'vocab-jac': { label: 'Vocab JAC — Kosakata soal JAC', emoji: '📝', color: '#1d4ed8' },
  'vocab-core': { label: 'Vocab Core — Kosakata inti', emoji: '🏛️', color: '#2d3748' },
  'vocab-exam': { label: 'Vocab Exam — 250 kosakata ujian', emoji: '🎯', color: '#7c3aed' },
  'vocab-teori': { label: 'Vocab Teori — Kosakata 学科', emoji: '📋', color: '#dc2626' },
};

export const VOCAB_SOURCES = ['vocab-lifeline','vocab-jac','vocab-core','vocab-exam','vocab-teori'];

export const SOURCE_GROUPS = [
  { label: 'PDF Utama JAC', keys: ['jac-ch1','jac-ch2','jac-ch3','jac-ch4','jac-ch5','jac-ch6','jac-ch7'] },
  { label: 'Soal Contoh', keys: ['jac-gakka1','jac-gakka2','jac-jitsugi1','jac-jitsugi2'] },
  { label: 'Kosakata', keys: ['vocab-lifeline','vocab-jac','vocab-core','vocab-exam','vocab-teori'] },
];

export const SOURCE_ACCENT = {
  'jac-ch1': '#ed8936', 'jac-ch2': '#38b2ac', 'jac-ch3': '#667eea',
  'jac-ch4': '#ed64a6', 'jac-ch5': '#ecc94b', 'jac-ch6': '#9f7aea',
  'jac-ch7': '#48bb78',
  'jac-gakka1': '#fc8181', 'jac-gakka2': '#fc8181',
  'jac-jitsugi1': '#68d391', 'jac-jitsugi2': '#68d391',
  'vocab-lifeline': '#63b3ed', 'vocab-jac': '#93c5fd', 'vocab-core': '#cbd5e0',
  'vocab-exam': '#b794f4', 'vocab-teori': '#f56565',
};
