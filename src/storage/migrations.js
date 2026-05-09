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
    'ssw-known', 'ssw-unknown', 'ssw-starred',
    'ssw-quiz-wrong', 'ssw-wrong-counts',
    'ssw-jac-scores', 'ssw-wg-scores', 'ssw-vocab-scores',
    'ssw-study-streak', 'ssw-daily-count', 'ssw-recent',
    'ssw-milestone-streak7', 'ssw-milestone-quiz70',
    'ssw-track', 'ssw-theme', 'ssw-onboarded',
    'ssw-tutorial-flashcard', 'ssw-last-mode',
  ];
  const V1_PREFIXES = ['ssw-srs-', 'ssw-wg-wrong-', 'ssw-vocab-wrong-'];

  for (const key of V1_EXACT) {
    try { localStorage.removeItem(key); } catch {}
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
  } catch { return false; }
}

export function migrate_v2_to_v3() {
  const progress = safeGetDoc('ssw-progress', {});
  const srs = safeGetDoc('ssw-srs-data', { _v: 2, cards: {} });
  const prefs = safeGetDoc('ssw-prefs', {});

  // Bump version and add new progress fields
  progress._v = 3;
  progress.sipilScores    = progress.sipilScores    ?? {};
  progress.bangunanScores = progress.bangunanScores ?? {};
  progress.sessions       = progress.sessions       ?? [];
  progress.dailyMission   = progress.dailyMission   ?? null;

  srs._v = 3;

  // Bump version and add new prefs fields
  prefs._v = 3;
  prefs.examDate       = prefs.examDate       ?? null;
  prefs.audioEnabled   = prefs.audioEnabled   ?? true;
  prefs.studyAnchor    = prefs.studyAnchor    ?? null;
  prefs.furiganaPolicy = prefs.furiganaPolicy ?? 'always';

  return { progress, srs, prefs };
}
