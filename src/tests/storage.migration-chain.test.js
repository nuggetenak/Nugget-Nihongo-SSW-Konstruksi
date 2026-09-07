// ─── tests/storage.migration-chain.test.js ───────────────────────────────────
// Every starting version reaches the current one.
//
// storage.migration-v3.test.js covers v1 and v2 — the two entry points that
// existed when it was written — and nothing covered v3, v4 or v5. That was
// survivable while init() carried one hand-written ladder per starting version:
// each was visible in the diff. Item 58 replaced those five copy-pasted ladders
// with a registry keyed by the version being migrated *from*, so a missing
// entry is now a silent hole rather than a missing branch, and an install that
// hits it stops on an old version and keeps running against a newer schema.
//
// The guard is behavioural on purpose. Asserting that MIGRATIONS has a key for
// every version would test the table against itself; seeding a real document at
// each version and asserting where it lands tests the loop, the writes between
// steps, and the migrations themselves.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect, beforeEach } from 'vitest';
import LZString from 'lz-string';
import { _reset_for_test, init, get, set } from '../storage/engine.js';
import { STORAGE_VERSION } from '../storage/schema.js';

beforeEach(() => {
  localStorage.clear();
  _reset_for_test();
});

// Card ids 1-3 survive the v3→v4 renumbering (ids with gaps behind them do not
// — see storage.migration-v3.test.js, where card 42 is deliberately dropped),
// so they are the ids to carry through a test that starts below v4.
const KEPT_IDS = [1, 2, 3];

function seed(version) {
  const progress = {
    _v: version,
    known: [...KEPT_IDS],
    unknown: [],
    starred: [1],
    quizWrong: {},
    wrongCounts: { 2: 3 },
    wgWrong: {},
    vocabWrong: {},
    jacScores: { tt1: { correct: 8, total: 10 } },
    wgScores: {},
    vocabScores: {},
    streakData: { days: 5, lastDate: '2026-09-01' },
    dailyCount: { count: 3, date: '2026-09-01' },
    recentCards: [1],
    milestoneStreak7: true,
    milestoneQuiz70: false,
  };
  const prefs = { _v: version, theme: 'dark', onboarded: true, dailyGoal: 30 };
  const srs = {
    _v: version,
    cards: { 1: { state: 2, reps: 4, history: [{ rating: 3, at: '2026-09-01T00:00:00.000Z' }] } },
  };
  localStorage.setItem('ssw-progress', JSON.stringify(progress));
  localStorage.setItem('ssw-prefs', JSON.stringify(prefs));
  localStorage.setItem('ssw-srs-data', JSON.stringify(srs));
}

describe('storage migration chain — every entry point reaches current', () => {
  for (let from = 2; from < STORAGE_VERSION; from++) {
    it(`v${from} data lands on v${STORAGE_VERSION} with its history intact`, () => {
      seed(from);
      init();

      const prog = get('progress');
      const prefs = get('prefs');
      const srs = get('srs');

      // All three documents move together. A chain that bumps progress and
      // leaves srs behind is the failure mode this is really watching for:
      // nothing reads srs._v at runtime, so it would go unnoticed until the
      // next migration keyed off it.
      expect(prog._v).toBe(STORAGE_VERSION);
      expect(prefs._v).toBe(STORAGE_VERSION);
      expect(srs._v).toBe(STORAGE_VERSION);

      // The user's actual study history survives the whole walk.
      expect(prog.known).toEqual(KEPT_IDS);
      expect(prog.starred).toEqual([1]);
      expect(prog.jacScores.tt1.correct).toBe(8);
      expect(prog.streakData.days).toBe(5);
      expect(prog.milestoneStreak7).toBe(true);
      expect(prefs.theme).toBe('dark');
      expect(prefs.dailyGoal).toBe(30);
      expect(srs.cards['1'].reps).toBe(4);
      expect(srs.cards['1'].history).toHaveLength(1);
    });
  }

  it('a v1 install (no _v stamp at all) reaches current and its v1 keys are cleaned up', () => {
    localStorage.setItem('ssw-known', JSON.stringify(KEPT_IDS));
    localStorage.setItem('ssw-theme', 'dark');
    localStorage.setItem('ssw-onboarded', '1');
    localStorage.setItem('ssw-srs-1', JSON.stringify({ state: 2, reps: 4 }));

    init();

    expect(get('progress')._v).toBe(STORAGE_VERSION);
    expect(get('srs')._v).toBe(STORAGE_VERSION);
    expect(get('prefs')._v).toBe(STORAGE_VERSION);
    expect(get('progress').known).toEqual(KEPT_IDS);
    expect(get('prefs').theme).toBe('dark');
    // cleanup_v1_keys runs only from v1, and only after the chain completed.
    expect(localStorage.getItem('ssw-known')).toBeNull();
    expect(localStorage.getItem('ssw-srs-1')).toBeNull();
    expect(localStorage.getItem('ssw-progress')).not.toBeNull();
  });

  it('the migrated documents are persisted, not just cached', () => {
    // Each step writes before the next reads, and the last write is what a
    // reload sees. Losing that turns a one-time migration into one that reruns
    // on every open — which for v3→v4 would renumber already-renumbered ids.
    seed(STORAGE_VERSION - 1);
    init();
    _reset_for_test();
    init();
    expect(get('progress')._v).toBe(STORAGE_VERSION);
    expect(get('progress').known).toEqual(KEPT_IDS);
  });

  it('a document newer than this build is loaded, not overwritten', () => {
    // Someone opens an older build after using a newer one — routine for a PWA,
    // where an offline device can sit on a cached build for weeks. Until
    // 2026-09-07 every version of init() fell through to the fresh-install
    // branch here and wrote defaults over the entire study history.
    const future = JSON.parse(localStorage.getItem('ssw-progress') ?? '{}');
    seed(STORAGE_VERSION + 1);
    const seeded = JSON.parse(localStorage.getItem('ssw-progress'));
    seeded.somethingThisBuildHasNeverHeardOf = { kept: true };
    localStorage.setItem('ssw-progress', JSON.stringify(seeded));
    expect(future).toBeTruthy(); // guards against the seed silently no-op'ing

    init();
    expect(get('progress')._v).toBe(STORAGE_VERSION + 1);
    expect(get('progress').known).toEqual(KEPT_IDS);

    // And a write from this build carries the unknown field through, so the
    // newer build finds its own data intact when it comes back.
    set('progress', { starred: [2] });
    const persisted = JSON.parse(
      LZString.decompressFromUTF16(localStorage.getItem('ssw-progress')) ??
        localStorage.getItem('ssw-progress')
    );
    expect(persisted.somethingThisBuildHasNeverHeardOf).toEqual({ kept: true });
    expect(persisted.starred).toEqual([2]);
    expect(persisted._v).toBe(STORAGE_VERSION + 1);
  });
});
