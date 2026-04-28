// SSW Flashcards: Categories, Source Metadata, and Category Helpers

// tracks[] defines which study tracks each category belongs to.
// Common categories (salam, hukum, keselamatan, karier) appear in ALL tracks.
export const CATEGORIES = [
  {
    key: 'all',
    label: 'すべて',
    color: '#4a5568',
    emoji: '📚',
    tracks: ['doboku', 'kenchiku', 'lifeline'],
  },
  {
    key: 'salam',
    label: '挨拶・安全',
    color: '#c05621',
    emoji: '🙏',
    tracks: ['doboku', 'kenchiku', 'lifeline'],
  },
  {
    key: 'hukum',
    label: '法律・規制',
    color: '#285e61',
    emoji: '⚖️',
    tracks: ['doboku', 'kenchiku', 'lifeline'],
  },
  {
    key: 'jenis_kerja',
    label: '工事の種類',
    color: '#1a365d',
    emoji: '🏗️',
    tracks: ['doboku', 'kenchiku'],
  },
  { key: 'listrik', label: '電気工事', color: '#744210', emoji: '⚡', tracks: ['lifeline'] },
  { key: 'telekomunikasi', label: '通信工事', color: '#1c4532', emoji: '📡', tracks: ['lifeline'] },
  { key: 'pipa', label: '配管工事', color: '#3c366b', emoji: '🔧', tracks: ['lifeline'] },
  { key: 'isolasi', label: '保温保冷', color: '#702459', emoji: '🌡️', tracks: ['lifeline'] },
  { key: 'pemadam', label: '消防設備', color: '#742a2a', emoji: '🔥', tracks: ['lifeline'] },
  {
    key: 'keselamatan',
    label: '安全管理',
    color: '#22543d',
    emoji: '🦺',
    tracks: ['doboku', 'kenchiku', 'lifeline'],
  },
  {
    key: 'karier',
    label: 'キャリア・雇用',
    color: '#553c9a',
    emoji: '👷',
    tracks: ['doboku', 'kenchiku', 'lifeline'],
  },
  {
    key: 'alat_umum',
    label: '共通工具',
    color: '#2d3748',
    emoji: '🔨',
    tracks: ['doboku', 'kenchiku'],
  },
  {
    key: 'bintang',
    label: 'Bintang',
    color: '#b7791f',
    emoji: '⭐',
    tracks: ['doboku', 'kenchiku', 'lifeline'],
  },
];

export const getCatInfo = (key) => CATEGORIES.find((c) => c.key === key) || CATEGORIES[0];

// Returns category keys valid for a given track (excludes "all" and "bintang" — handled separately)
export const getCatsForTrack = (track) =>
  CATEGORIES.filter((c) => c.key !== 'all' && c.key !== 'bintang' && c.tracks?.includes(track)).map(
    (c) => c.key
  );

// Fix: SOURCE_META now uses canonical source keys (matching cards.js after Phase 1 normalization)
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
  'vocab-lifeline': { label: 'Vocab Wayground — Kosakata 設備実技', emoji: '📖', color: '#0369a1' },
  'vocab-jac': { label: 'Vocab JAC — Kosakata dari soal JAC', emoji: '📝', color: '#1d4ed8' },
  'vocab-core': { label: 'Vocab Core — Kosakata inti konstruksi', emoji: '🏛️', color: '#2d3748' },
  'vocab-exam': {
    label: 'Vocab Exam — 250 kosakata ujian Prometric',
    emoji: '🎯',
    color: '#7c3aed',
  },
  'vocab-teori': {
    label: 'Vocab Teori — Kosakata 学科 (hukum & safety)',
    emoji: '📋',
    color: '#dc2626',
  },
};

export const VOCAB_SOURCES = [
  'vocab-lifeline',
  'vocab-jac',
  'vocab-core',
  'vocab-exam',
  'vocab-teori',
];

// Source grouping for SumberMode
export const SOURCE_GROUPS = [
  {
    label: 'PDF Utama JAC',
    keys: ['jac-ch1', 'jac-ch2', 'jac-ch3', 'jac-ch4', 'jac-ch5', 'jac-ch6', 'jac-ch7'],
  },
  { label: 'Soal Contoh', keys: ['jac-gakka1', 'jac-gakka2', 'jac-jitsugi1', 'jac-jitsugi2'] },
  {
    label: 'Kosakata',
    keys: ['vocab-lifeline', 'vocab-jac', 'vocab-core', 'vocab-exam', 'vocab-teori'],
  },
];

export const SOURCE_ACCENT = {
  'jac-ch1': '#ed8936',
  'jac-ch2': '#38b2ac',
  'jac-ch3': '#667eea',
  'jac-ch4': '#ed64a6',
  'jac-ch5': '#ecc94b',
  'jac-ch6': '#9f7aea',
  'jac-ch7': '#48bb78',
  'jac-gakka1': '#fc8181',
  'jac-gakka2': '#fc8181',
  'jac-jitsugi1': '#68d391',
  'jac-jitsugi2': '#68d391',
  'vocab-lifeline': '#63b3ed',
  'vocab-jac': '#93c5fd',
  'vocab-core': '#cbd5e0',
  'vocab-exam': '#b794f4',
  'vocab-teori': '#f56565',
};
