// ─── tests/data-integrity.test.js ────────────────────────────────────────────
// Data integrity test suite.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect } from 'vitest';
import { CARDS } from '../data/cards.js';
import { QUIZ_SETS } from '../data/quiz-sets.js';
import { SOURCE_GROUPS, SOURCE_META } from '../data/categories.js';
import { JAC_TEORI } from '../data/sets/jac/jac-teori.js';
import { JAC_LIFELINE } from '../data/sets/jac/jac-lifeline.js';

describe('Data Integrity', () => {
  // C1: SOURCE_GROUPS keys in SOURCE_META
  it('C1: all SOURCE_GROUPS keys exist in SOURCE_META', () => {
    const metaKeys = new Set(Object.keys(SOURCE_META));
    SOURCE_GROUPS.forEach((g) => {
      g.keys.forEach((k) => {
        expect(metaKeys.has(k), `"${k}" missing from SOURCE_META`).toBe(true);
      });
    });
  });

  // C2: related_card_id integrity
  it('C2: all related_card_id refs point to valid cards', () => {
    const cardIds = new Set(CARDS.map((c) => c.id));
    const broken = [...JAC_TEORI, ...JAC_LIFELINE].filter(
      (q) => q.related_card_id !== null && !cardIds.has(q.related_card_id)
    );
    expect(broken.map((q) => `${q.id}→${q.related_card_id}`)).toHaveLength(0);
  });

  // C3: every QUIZ_SETS set has track field
  it('C3: every set in QUIZ_SETS has a track field', () => {
    const missing = QUIZ_SETS.filter((s) => !s.track);
    expect(missing.map((s) => s.id)).toHaveLength(0);
  });

  // C4: no _origIndex in CARDS
  it('C4: no _origIndex in CARDS', () => {
    const withOrig = CARDS.filter((c) => '_origIndex' in c);
    expect(withOrig.map((c) => c.id)).toHaveLength(0);
  });

  // C5: CARDS count matches expected
  it('C5: CARDS count is 1438', () => {
    expect(CARDS.length).toBe(1438);
  });

  // C6: no duplicate card IDs
  it('C6: no duplicate card IDs', () => {
    const ids = CARDS.map((c) => c.id);
    const seen = new Set();
    const dupes = ids.filter((id) => seen.has(id) || !seen.add(id));
    expect(dupes).toHaveLength(0);
  });

  // C7: all quiz answers valid index
  it('C7: quiz answer index < opts.length for all quiz cards', () => {
    const bad = CARDS.filter(
      (c) => c.type === 'quiz' && c.ans !== undefined && c.opts && c.ans >= c.opts.length
    );
    expect(bad.map((c) => `id:${c.id} ans:${c.ans} opts:${c.opts?.length}`)).toHaveLength(0);
  });

  // C8/C9: doboku/kenchiku tracks removed session 24 (content-dq) — see CHANGELOG.md.
  // getQuizSetsForTrack('doboku'|'kenchiku') is no longer a meaningful call; removed
  // rather than kept as a "returns empty" test since the tracks themselves are gone,
  // not just temporarily empty.
});
