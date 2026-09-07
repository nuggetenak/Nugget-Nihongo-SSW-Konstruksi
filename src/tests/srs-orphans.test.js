// ─── tests/srs-orphans.test.js ───────────────────────────────────────────────
// The multi-vocabulary split retired 41 card ids: cards whose terms deduplicated
// into a card that already existed. Ids are never renumbered — that is the rule
// `scripts/audit-integrity.mjs` states, because renumbering would invalidate
// every saved SRS state, note and starred id in every install — but a *removed*
// id leaves an SRS entry with no card behind it in anyone who had reviewed it.
//
// That was known and accepted: `getDueCardIds(whitelist)` filters an orphan out
// before it can reach `CARD_MAP[currentId]` in ReviewMode, so nothing crashes
// and no migration is required. What was not known is that one caller passed no
// whitelist at all.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { _reset_for_test, init, set } from '../storage/engine.js';
import { getDueCardIds } from '../srs/fsrs-scheduler.js';
import { initStore } from '../srs/fsrs-store.js';
import { CARDS } from '../data/cards.js';

const SRC = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** An SRS entry for a card id that no longer exists, due since yesterday. */
function seedOrphan(id) {
  const yesterday = new Date(Date.now() - 86400000).toISOString();
  set('srs', (s) => ({
    ...s,
    cards: {
      ...(s?.cards ?? {}),
      [id]: {
        card: { due: yesterday, stability: 1, difficulty: 5, state: 2, reps: 1, lapses: 0 },
        history: [],
        reviewed_at: yesterday,
      },
    },
  }));
  initStore();
}

beforeEach(() => {
  localStorage.clear();
  _reset_for_test();
  init();
});

describe('an SRS entry with no card behind it', () => {
  const deadId = 999999;

  it('is filtered out when the caller says which cards are live', () => {
    seedOrphan(deadId);
    const live = CARDS.map((c) => c.id);
    expect(getDueCardIds(live)).not.toContain(deadId);
  });

  it('is counted when the caller does not — which is why every caller must', () => {
    // Pinning the behaviour, not endorsing it: this is exactly the shape that
    // made an uncompletable "Ulasan SRS" mission possible.
    seedOrphan(deadId);
    expect(getDueCardIds()).toContain(deadId);
  });

  it('no caller in the app leaves the whitelist off', () => {
    const callers = ['hooks/useSRS.js', 'utils/daily-mission.js'];
    for (const f of callers) {
      const src = readFileSync(resolve(SRC, f), 'utf-8');
      for (const m of src.matchAll(/getDueCardIds\(([^)]*)\)/g)) {
        const arg = m[1].trim();
        expect(arg, `${f}: getDueCardIds(${arg}) has no whitelist`).not.toBe('');
      }
    }
  });

  it('the daily mission does not offer a review it cannot deliver', async () => {
    seedOrphan(deadId);
    vi.resetModules();
    const { generateDailyMission } = await import('../utils/daily-mission.js');
    const mission = generateDailyMission();
    // With no real card due, an orphan must not make Ulasan today's mission.
    expect(mission.mode).not.toBe('ulasan');
  });
});
