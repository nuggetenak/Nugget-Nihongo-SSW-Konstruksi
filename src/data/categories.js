// ─── data/categories.js — Content Architecture v2 ─────────────────────────────
// Two-layer model: Common (K) + Lifeline (L).
// Doboku/Kenchiku tracks (D/B categories, both still-empty placeholders — "Future Ch.5+
// content" never arrived) removed session 24 (2026-07-26), scope reduced to Lifeline-only
// per owner decision. See HANDOFF.md. (Note: the docs/CONTENT-BLUEPRINT.md this comment used
// to point to doesn't exist in this branch's history either — pre-existing dangling
// reference, not something new from this edit.)
// ─────────────────────────────────────────────────────────────────────────────

export const CATEGORIES = [
  { key: 'all', label: 'すべて', color: '#4a5568', emoji: '📚', tracks: ['lifeline'] },
  // Common
  {
    key: 'gaiyou',
    label: '建設概要・挨拶',
    color: '#c05621',
    emoji: '🏛️',
    tracks: ['lifeline'],
    module: 'K1',
  },
  {
    key: 'anzen',
    label: '安全衛生',
    color: '#22543d',
    emoji: '🦺',
    tracks: ['lifeline'],
    module: 'K2',
  },
  {
    key: 'hourei',
    label: '法令・規制',
    color: '#285e61',
    emoji: '⚖️',
    tracks: ['lifeline'],
    module: 'K3',
  },
  {
    key: 'sekou',
    label: '施工管理・共通',
    color: '#2d3748',
    emoji: '📋',
    tracks: ['lifeline'],
    module: 'K4',
  },
  {
    key: 'career',
    label: 'キャリア・雇用',
    color: '#553c9a',
    emoji: '👷',
    tracks: ['lifeline'],
    module: 'K5',
  },
  // Lifeline
  {
    key: 'haikan',
    label: '配管工事',
    color: '#3c366b',
    emoji: '🔧',
    tracks: ['lifeline'],
    module: 'L1',
  },
  {
    key: 'denki',
    label: '電気工事',
    color: '#744210',
    emoji: '⚡',
    tracks: ['lifeline'],
    module: 'L2',
  },
  {
    key: 'tsushin',
    label: '通信工事',
    color: '#1c4532',
    emoji: '📡',
    tracks: ['lifeline'],
    module: 'L3',
  },
  {
    key: 'shoubou',
    label: '消防設備',
    color: '#742a2a',
    emoji: '🔥',
    tracks: ['lifeline'],
    module: 'L4',
  },
  {
    key: 'hoon',
    label: '保温保冷',
    color: '#702459',
    emoji: '🌡️',
    tracks: ['lifeline'],
    module: 'L5',
  },
  {
    key: 'setsubi_kougu',
    label: '設備・空調',
    color: '#2d3748',
    emoji: '🔨',
    tracks: ['lifeline'],
    module: 'L6',
  },
  // Meta
  { key: 'bintang', label: 'Bintang', color: '#b7791f', emoji: '⭐', tracks: ['lifeline'] },
];

export const getCatInfo = (key) => CATEGORIES.find((c) => c.key === key) || CATEGORIES[0];

export const getCatsForTrack = (track) =>
  CATEGORIES.filter((c) => c.key !== 'all' && c.key !== 'bintang' && c.tracks?.includes(track)).map(
    (c) => c.key
  );

export const getCatsForModule = (prefix) =>
  CATEGORIES.filter((c) => c.module?.startsWith(prefix)).map((c) => c.key);

export const SOURCE_META = {
  // ── PDF Utama JAC (Chapter 1–7) ──────────────────────────────────────────
  'jac-ch1': { label: 'JAC Ch.1 — Keselamatan & Salam', emoji: '🙏', color: '#c05621' },
  'jac-ch2': { label: 'JAC Ch.2 — Hukum & Regulasi', emoji: '⚖️', color: '#285e61' },
  'jac-ch3': { label: 'JAC Ch.3 — Jenis Pekerjaan', emoji: '🏗️', color: '#1a365d' },
  'jac-ch4': { label: 'JAC Ch.4 — Konstruksi & Teknik', emoji: '🔩', color: '#3c366b' },
  'jac-ch5': { label: 'JAC Ch.5 — Alat & Mesin', emoji: '🔌', color: '#744210' },
  'jac-ch6': { label: 'JAC Ch.6 — Pipa & Isolasi', emoji: '🌡️', color: '#702459' },
  'jac-ch7': { label: 'JAC Ch.7 — Karier & Mesin', emoji: '👷', color: '#553c9a' },
  // ── Soal Contoh ───────────────────────────────────────────────────────────
  'jac-gakka1': { label: 'Soal Contoh 学科 Set 1', emoji: '📋', color: '#742a2a' },
  'jac-gakka2': { label: 'Soal Contoh 学科 Set 2', emoji: '📋', color: '#742a2a' },
  'jac-jitsugi1': { label: 'Soal Contoh 実技 Set 1', emoji: '🔧', color: '#22543d' },
  'jac-jitsugi2': { label: 'Soal Contoh 実技 Set 2', emoji: '🔧', color: '#22543d' },
  // ── Kosakata (vocab source files) ─────────────────────────────────────────
  // vocab-lifeline / vocab-core / vocab-exam / vocab-teori / vocab-general were
  // removed 2026-09-04: all five were declared here but carried by zero cards,
  // left behind when the Doboku/Kenchiku scope reduction (session 24) took their
  // content with it. SumberMode renders one row per SOURCE_GROUPS key, so each
  // one showed up on screen as a permanent, un-openable "0 kartu" row — five of
  // the seventeen rows on that screen were dead. `scripts/audit-integrity.mjs`
  // now fails on a zero-card source so this can't silently come back.
  'vocab-jac': { label: 'Vocab JAC — Kosakata soal JAC', emoji: '📝', color: '#1d4ed8' },
  // ── Sumber Tambahan (supplementary — provenance audit) ────────────────────
  'vocab-supplementary': {
    label: 'Vocab Supplementary — Kosakata pelengkap',
    emoji: '📝',
    color: '#6b7280',
  },
};

// VOCAB_SOURCES is gone (item 69, 2026-09-07). It listed "source files that are
// pure vocabulary lists rather than chapter content", and the question left open
// was whether `vocab-supplementary` (the largest vocab pool in the corpus)
// belonged in it. Measuring first turned the question around:
//
//   * Its only live consumer was FocusMode's weakness ranking. `excludeVocab`
//     in useTrackedCards read it too, but no component ever passed that option —
//     only its own test did.
//   * Excluding cards there makes the ranking *less* truthful, not more: a
//     category's weakness is its unlearned cards, whichever file they arrived
//     in, and FocusMode hands `catCards` straight to the drill — so an excluded
//     card is one the weakness path can never show you.
//   * Adding `vocab-supplementary` would have made that worse and unevenly: it
//     is 6% of `hourei` but 58% of `career`, 56% of `hoon`, 48% of `gaiyou`.
//     That does not shift the ranking, it restructures it.
//   * And the distinction it drew no longer exists. The 7.0.0 split made one
//     card one term across the whole corpus, 87% of which is now `type: 'vocab'`;
//     "chapter content" and "vocabulary list" stopped being different shapes.
//
// So the answer to "should vocab-supplementary count?" is yes — and so should
// `vocab-jac`, whose exclusion was the real anomaly at 40 cards (2.5% of the
// corpus): too small to shape a ranking, big enough to make one wrong.
//
// Category scores drop slightly everywhere as a result, because the denominator
// now includes cards that were quietly not counted. That is the honest number,
// and it is the same reasoning as item 97's: this app should not tell someone
// they are further along than they are.

export const SOURCE_GROUPS = [
  {
    label: 'PDF Utama JAC',
    keys: ['jac-ch1', 'jac-ch2', 'jac-ch3', 'jac-ch4', 'jac-ch5', 'jac-ch6', 'jac-ch7'],
  },
  { label: 'Soal Contoh', keys: ['jac-gakka1', 'jac-gakka2', 'jac-jitsugi1', 'jac-jitsugi2'] },
  { label: 'Kosakata', keys: ['vocab-jac'] },
  { label: 'Sumber Tambahan', keys: ['vocab-supplementary'] },
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
  'vocab-jac': '#93c5fd',
  'vocab-supplementary': '#9ca3af',
};
