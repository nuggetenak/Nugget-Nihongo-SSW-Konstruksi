// ─── storage/migrations.js ───────────────────────────────────────────────────
// v1 → v2 → v3 migration chain. Runs once on first open after upgrade.
// safeGetDoc handles both plain JSON (v1/v2) and lz-string compressed (v3).
// ─────────────────────────────────────────────────────────────────────────────

import { DEFAULTS, STORAGE_VERSION } from './schema.js';
import LZString from 'lz-string';

// Read plain JSON key (v1 keys are never compressed)
function safeGet(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

// Read a v2/v3 engine doc key — tries lz decompress first, falls back to plain JSON (E4)
function safeGetDoc(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    try {
      const decompressed = LZString.decompressFromUTF16(raw);
      if (decompressed) return JSON.parse(decompressed);
    } catch {}
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function safeGetRaw(key, fallback = null) {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

// V1 marker keys — presence of any means migration is needed
const V1_MARKERS = ['ssw-known', 'ssw-track', 'ssw-theme', 'ssw-onboarded', 'ssw-study-streak'];

// Enumerate localStorage keys (works in jsdom + real browsers)
function lsKeys() {
  const keys = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k) keys.push(k);
    }
  } catch {}
  return keys;
}

// Detect if v1 data exists
export function hasV1Data() {
  try {
    if (V1_MARKERS.some((k) => localStorage.getItem(k) !== null)) return true;
    // v1 SRS keys: ssw-srs-{digit} (exclude v2 doc key ssw-srs-data)
    return lsKeys().some((k) => k.startsWith('ssw-srs-') && k !== 'ssw-srs-data');
  } catch {
    return false;
  }
}

// Pack all v1 data into 3 v2 document objects (no localStorage writes here)
export function migrate_v1_to_v2() {
  const allKeys = lsKeys();

  // ── Progress doc ──────────────────────────────────────────────────────────
  const progress = JSON.parse(JSON.stringify(DEFAULTS.progress));
  progress._v = STORAGE_VERSION;

  progress.known = safeGet('ssw-known', []);
  progress.unknown = safeGet('ssw-unknown', []);
  progress.starred = safeGet('ssw-starred', []);
  progress.quizWrong = safeGet('ssw-quiz-wrong', {});
  progress.wrongCounts = safeGet('ssw-wrong-counts', {});
  progress.jacScores = safeGet('ssw-jac-scores', {});
  progress.wgScores = safeGet('ssw-wg-scores', {});
  progress.vocabScores = safeGet('ssw-vocab-scores', {});
  progress.streakData = safeGet('ssw-study-streak', {});
  progress.dailyCount = safeGet('ssw-daily-count', { count: 0, date: '' });
  progress.recentCards = safeGet('ssw-recent', []);
  progress.milestoneStreak7 = !!safeGetRaw('ssw-milestone-streak7');
  progress.milestoneQuiz70 = !!safeGetRaw('ssw-milestone-quiz70');

  // wg-wrong per set
  const wgWrong = {};
  for (const key of allKeys) {
    if (key.startsWith('ssw-wg-wrong-')) {
      const id = key.slice('ssw-wg-wrong-'.length);
      wgWrong[id] = safeGet(key, {});
    }
  }
  progress.wgWrong = wgWrong;

  // vocab-wrong per set
  const vocabWrong = {};
  for (const key of allKeys) {
    if (key.startsWith('ssw-vocab-wrong-')) {
      const id = key.slice('ssw-vocab-wrong-'.length);
      vocabWrong[id] = safeGet(key, {});
    }
  }
  progress.vocabWrong = vocabWrong;

  // ── SRS doc ───────────────────────────────────────────────────────────────
  const srs = { _v: STORAGE_VERSION, cards: {} };
  const SRS_PREFIX = 'ssw-srs-';
  for (const key of allKeys) {
    if (key.startsWith(SRS_PREFIX)) {
      const id = key.slice(SRS_PREFIX.length);
      const val = safeGet(key, null);
      if (val && id) srs.cards[id] = val;
    }
  }

  // ── Prefs doc ─────────────────────────────────────────────────────────────
  const prefs = JSON.parse(JSON.stringify(DEFAULTS.prefs));
  prefs._v = STORAGE_VERSION;
  prefs.track = safeGet('ssw-track', null);
  prefs.theme = safeGetRaw('ssw-theme', 'light');
  prefs.onboarded = !!safeGetRaw('ssw-onboarded');
  prefs.tutorialFlashcard = !!safeGetRaw('ssw-tutorial-flashcard');
  prefs.lastMode = safeGetRaw('ssw-last-mode', null);

  return { progress, srs, prefs };
}

// Remove all v1 keys from localStorage after successful migration
export function cleanup_v1_keys() {
  const V1_EXACT = [
    'ssw-known',
    'ssw-unknown',
    'ssw-starred',
    'ssw-quiz-wrong',
    'ssw-wrong-counts',
    'ssw-jac-scores',
    'ssw-wg-scores',
    'ssw-vocab-scores',
    'ssw-study-streak',
    'ssw-daily-count',
    'ssw-recent',
    'ssw-milestone-streak7',
    'ssw-milestone-quiz70',
    'ssw-track',
    'ssw-theme',
    'ssw-onboarded',
    'ssw-tutorial-flashcard',
    'ssw-last-mode',
  ];
  const V1_PREFIXES = ['ssw-srs-', 'ssw-wg-wrong-', 'ssw-vocab-wrong-'];

  for (const key of V1_EXACT) {
    try {
      localStorage.removeItem(key);
    } catch {}
  }
  // v2 doc keys that must NOT be deleted
  const V2_DOCS = ['ssw-progress', 'ssw-srs-data', 'ssw-prefs'];
  try {
    for (const key of lsKeys()) {
      if (V2_DOCS.includes(key)) continue; // protect v2 docs
      if (V1_PREFIXES.some((p) => key.startsWith(p))) {
        localStorage.removeItem(key);
      }
    }
  } catch {}
}

// ── v2 → v3 migration ────────────────────────────────────────────────────────
// Adds new fields introduced in schema v3 with safe defaults.
// Existing data is fully preserved; only new keys are added.

export function hasV2Data() {
  try {
    const parsed = safeGetDoc('ssw-progress', null);
    return parsed?._v === 2;
  } catch {
    return false;
  }
}

export function migrate_v2_to_v3() {
  const progress = safeGetDoc('ssw-progress', {});
  const srs = safeGetDoc('ssw-srs-data', { _v: 2, cards: {} });
  const prefs = safeGetDoc('ssw-prefs', {});

  // Bump version and add new progress fields
  progress._v = 3;
  progress.dobokuScores = progress.dobokuScores ?? {};
  progress.kenchikuScores = progress.kenchikuScores ?? {};
  progress.sessions = progress.sessions ?? [];
  progress.dailyMission = progress.dailyMission ?? null;

  srs._v = 3;

  // Bump version and add new prefs fields
  prefs._v = 3;
  prefs.examDate = prefs.examDate ?? null;
  prefs.audioEnabled = prefs.audioEnabled ?? true;
  prefs.studyAnchor = prefs.studyAnchor ?? null;
  prefs.furiganaPolicy = prefs.furiganaPolicy ?? 'always';

  return { progress, srs, prefs };
}

// ── v3 → v4 migration ────────────────────────────────────────────────────────
// Card IDs were renumbered to be contiguous 1–1443 (185 gaps removed).
// Remaps SRS card keys and progress arrays that reference old card IDs.

import CARD_ID_MAP from './card-id-map-v4.js';

export function hasV3Data() {
  try {
    const parsed = safeGetDoc('ssw-progress', null);
    return parsed?._v === 3;
  } catch {
    return false;
  }
}

export function migrate_v3_to_v4() {
  const progress = safeGetDoc('ssw-progress', {});
  const srs = safeGetDoc('ssw-srs-data', { _v: 3, cards: {} });
  const prefs = safeGetDoc('ssw-prefs', {});

  const remap = (id) => {
    const n = CARD_ID_MAP[String(id)];
    return n !== undefined ? n : null; // null = card no longer exists
  };

  // Remap arrays of card IDs
  for (const field of ['known', 'unknown', 'starred', 'recentCards']) {
    if (Array.isArray(progress[field])) {
      progress[field] = progress[field].map(remap).filter(Boolean);
    }
  }

  // Remap object keys (quizWrong, wrongCounts)
  for (const field of ['quizWrong', 'wrongCounts']) {
    if (progress[field] && typeof progress[field] === 'object') {
      const remapped = {};
      for (const [oldId, val] of Object.entries(progress[field])) {
        const newId = remap(parseInt(oldId, 10));
        if (newId !== null) remapped[newId] = val;
      }
      progress[field] = remapped;
    }
  }

  // Remap SRS card keys
  if (srs.cards && typeof srs.cards === 'object') {
    const remappedSrs = {};
    for (const [oldId, val] of Object.entries(srs.cards)) {
      const newId = remap(parseInt(oldId, 10));
      if (newId !== null) remappedSrs[newId] = val;
    }
    srs.cards = remappedSrs;
  }

  progress._v = 4;
  srs._v = 4;
  prefs._v = 4;

  return { progress, srs, prefs };
}

// ── v4 → v5 migration ────────────────────────────────────────────────────────
// Renames sipilScores→dobokuScores, bangunanScores→kenchikuScores.

export function hasV4Data() {
  try {
    const parsed = safeGetDoc('ssw-progress', null);
    return parsed?._v === 4;
  } catch {
    return false;
  }
}

export function migrate_v4_to_v5() {
  const progress = safeGetDoc('ssw-progress', {});
  const srs = safeGetDoc('ssw-srs-data', { _v: 4, cards: {} });
  const prefs = safeGetDoc('ssw-prefs', {});

  // Rename score keys
  progress.dobokuScores = progress.sipilScores ?? {};
  progress.kenchikuScores = progress.bangunanScores ?? {};
  delete progress.sipilScores;
  delete progress.bangunanScores;

  progress._v = 5;
  srs._v = 5;
  prefs._v = 5;

  return { progress, srs, prefs };
}

// ── v5 → v6 migration ────────────────────────────────────────────────────────
// content-dq/main merge (2026-08-18). Two independent changes bundled into one
// version bump since they land in the same release:
//
// 1. Doboku/Kenchiku tracks removed entirely (session 24 decision, carried into
//    main at merge time). dobokuScores/kenchikuScores dropped — both tracks were
//    100% AI-generated draft content with zero real JAC material, so there's no
//    real practice history being discarded, just dead score-tracking fields.
//
// 2. Wayground/CSV quiz-set IDs renamed as part of content-dq's data-quality
//    work. Remapped where the rename is a *confirmed* 1:1 correspondence:
//      - Teori:      wt1..wt10        → wt01..wt10
//      - CSV→JAC-mockup teori: ct01..ct06 → jmt01..jmt06
//      - CSV→JAC-mockup praktik: cp01..cp06 → jml01..jml06
//    NOT remapped, deliberately: the old praktik sets (wg2-5/wp1-5) and the old
//    vocab sets (wg6-9/wg11/wg12). The old wayground-sets.js monolith had a
//    confirmed 21-of-27-set id/track drift bug (fixed session 28) and the vocab
//    sets were genuinely restructured by question-direction (P16 split), not
//    just renamed — there's no reliable 1:1 old-key→new-key correspondence to
//    map from, and guessing one risks silently attributing a user's score
//    history to the wrong set, which is worse than leaving the old key inert.
//    Old wgScores/vocabScores entries under those keys are left in place
//    un-migrated; they just won't match any current set id going forward.

const WAYGROUND_ID_RENAME = {
  wt1: 'wt01',
  wt2: 'wt02',
  wt3: 'wt03',
  wt4: 'wt04',
  wt5: 'wt05',
  wt6: 'wt06',
  wt7: 'wt07',
  wt8: 'wt08',
  wt9: 'wt09',
  wt10: 'wt10',
  ct01: 'jmt01',
  ct02: 'jmt02',
  ct03: 'jmt03',
  ct04: 'jmt04',
  ct05: 'jmt05',
  ct06: 'jmt06',
  cp01: 'jml01',
  cp02: 'jml02',
  cp03: 'jml03',
  cp04: 'jml04',
  cp05: 'jml05',
  cp06: 'jml06',
};

function remapScoreKeys(scores = {}) {
  const out = {};
  for (const [key, val] of Object.entries(scores)) {
    out[WAYGROUND_ID_RENAME[key] ?? key] = val;
  }
  return out;
}

export function hasV5Data() {
  try {
    const parsed = safeGetDoc('ssw-progress', null);
    return parsed?._v === 5;
  } catch {
    return false;
  }
}

export function migrate_v5_to_v6() {
  const progress = safeGetDoc('ssw-progress', {});
  const srs = safeGetDoc('ssw-srs-data', { _v: 5, cards: {} });
  const prefs = safeGetDoc('ssw-prefs', {});

  delete progress.dobokuScores;
  delete progress.kenchikuScores;

  if (progress.wgScores) progress.wgScores = remapScoreKeys(progress.wgScores);
  if (progress.jacScores) progress.jacScores = remapScoreKeys(progress.jacScores);
  if (progress.wgWrong) progress.wgWrong = remapScoreKeys(progress.wgWrong);

  progress._v = 6;
  srs._v = 6;
  prefs._v = 6;

  return { progress, srs, prefs };
}
