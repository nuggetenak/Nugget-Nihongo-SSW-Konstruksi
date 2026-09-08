// ─── tests/related-card-links.test.js ────────────────────────────────────────
// The links that send a learner from a question they got wrong to the card that
// teaches it. `audit-related-ids.mjs` already checks every id resolves to a
// live card; it cannot check the card is the *right* one, and that is the
// failure that actually shipped.
//
// Found 2026-09-07 while sizing item 96: 72 of the 95 JAC Official links were
// written against the card numbering that existed BEFORE the v3→v4 renumbering
// and were never remapped with the rest of the corpus. They all still resolved,
// so every audit passed, and 「パワー・ハラスメント」 quietly linked to 通勤災害,
// 「消防法」 to 水道法, 「ご安全に」 to ガス漏れ試験. Measured before the fix: 23
// of 95 links pointed at a card whose headword appears anywhere in the
// question, its correct answer, or its explanation. After: 94 of 95.
//
// The split was clean and provable rather than guessed at — every stale link
// referenced an id ≤ 746 and every sound one an id ≥ 807, exactly the shape of
// two authoring batches either side of the renumbering — and each remap was
// accepted only where the remapped card scored at least as well on the same
// evidence. Five more were re-pointed by hand where phase 2 had split their
// target and the parent kept the id: タッチアンドコール, 一坪, 釘仕舞, 感電, 建築.
//
// This test is the floor that keeps it there. It is deliberately a proportion
// and not an exact list: a headword-overlap heuristic cannot adjudicate every
// link (`一坪` teaching a question answered `坪` is right and scores zero here),
// so demanding 95 of 95 would be demanding the heuristic be perfect. Demanding
// 90 of 95 catches a 72-link regression on its first commit.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect } from 'vitest';
import { JAC_OFFICIAL } from '../data/index.js';
import { CARDS } from '../data/cards.js';
import { stripFuri } from '../utils/jp-helpers.js';

const byId = new Map(CARDS.map((c) => [c.id, c]));

/** Does any 2+ character run of the card's headword appear in the question? */
function headwordAppears(cardId, text) {
  const card = byId.get(cardId);
  if (!card) return false;
  const head = stripFuri(card.jp).trim();
  for (let len = head.length; len >= 2; len--) {
    for (let i = 0; i + len <= head.length; i++) {
      if (text.includes(head.slice(i, i + len))) return true;
    }
  }
  return false;
}

const questionText = (q) => stripFuri([q.q, q.opts?.[q.ans], q.exp].filter(Boolean).join(' '));

describe('JAC Official related_card_id — points at a card about the question', () => {
  it('at least 90 of 95 links land on a card the question actually mentions', () => {
    const misses = JAC_OFFICIAL.filter(
      (q) => !headwordAppears(q.related_card_id, questionText(q))
    ).map((q) => {
      const c = byId.get(q.related_card_id);
      return `${q.id} -> ${q.related_card_id} ${c ? stripFuri(c.jp) : '(gone)'}`;
    });
    const hits = JAC_OFFICIAL.length - misses.length;
    expect(hits, `links that miss:\n${misses.join('\n')}`).toBeGreaterThanOrEqual(90);
  });

  it('the links that the stale numbering broke worst are the right cards now', () => {
    // Anchors, in the corpus's own terms rather than by count: each of these was
    // demonstrably wrong before and is checkable by reading the card. If the
    // pre-v4 ids ever come back, these break first and say so by name.
    const anchors = {
      tt1_q03: 'パワー・ハラスメント', // was 通勤災害
      tt1_q06: '消防法', // was 水道法
      tt1_q17: '電気工事士', // was 芯
      tt1_q22: 'ご安全に', // was ガス漏れ試験
      tt1_q28: '5S', // was 割増賃金率
    };
    for (const [qid, expected] of Object.entries(anchors)) {
      const q = JAC_OFFICIAL.find((x) => x.id === qid);
      expect(q, `question ${qid} not found`).toBeTruthy();
      const card = byId.get(q.related_card_id);
      expect(card, `${qid} -> ${q.related_card_id} does not resolve`).toBeTruthy();
      expect(stripFuri(card.jp), `${qid} links to the wrong card`).toContain(expected);
    }
  });
});
