// ─── tests/vocab-usage.test.js ───────────────────────────────────────────────
// Every `type: 'vocab'` card carries a worked example sentence.
//
// CARD_CONTENT_SPEC §4.6 *permits* omitting `usage`, and that permission is why
// this needed a test rather than a rule. When 7.0.0 split 264 bundled cards into
// one card per term, the plan's own appendix tightened the rule for the children
// — each gets its own sentence, "bukan menghilangkan field-nya karena repot" —
// because the split's whole risk is producing 1,900 loose nouns with nothing
// holding them to the work. A sentence is what holds them.
//
// The rule was applied to about 380 of the children and then quietly stopped:
// 90 were still bare on 2026-09-07, every one of them a product of the split
// (all 90 carried the "Satu rangkaian dengan …" sibling clause the split
// writes). They are written now. This is the floor that keeps them written, and
// it is an equality rather than a threshold because the corpus is at 100%: a
// weaker assertion would let the next batch of children through bare, which is
// exactly how the first 90 got in.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect } from 'vitest';
import { CARDS } from '../data/cards.js';
import { stripFuri } from '../utils/jp-helpers.js';

const vocab = CARDS.filter((c) => c.type === 'vocab');

describe('vocab cards carry a worked example', () => {
  it('every vocab card has a usage sentence', () => {
    const bare = vocab
      .filter((c) => !c.usage || !String(c.usage).trim())
      .map((c) => `${c.id} ${stripFuri(c.jp)}`);
    expect(bare, `vocab cards with no usage:\n${bare.join('\n')}`).toEqual([]);
  });

  it('non-vocab cards omit the field rather than nulling it', () => {
    // §4.6: `usage` is meaningful only for vocab. A `null` would have to be
    // special-cased at every read; absence is self-describing.
    const wrong = CARDS.filter((c) => c.type !== 'vocab' && 'usage' in c).map((c) => c.id);
    expect(wrong).toEqual([]);
  });

  it('each usage carries its Indonesian gloss in trailing full-width parens', () => {
    // The corpus convention throughout: Japanese first, then the meaning in the
    // reader's own language in （）. Parsed from the END rather than the first
    // （, because the Japanese half legitimately contains its own parenthetical
    // — G管《かん》（厚鋼《あつこう》）を屋外《おくがい》に使《つか》う — and
    // splitting on the first one calls 30-odd correct sentences malformed.
    const malformed = vocab
      .filter((c) => {
        const u = String(c.usage).trimEnd();
        if (!u.endsWith('）')) return true;
        let depth = 0;
        let open = -1;
        for (let i = u.length - 1; i >= 0; i--) {
          if (u[i] === '）') depth++;
          else if (u[i] === '（' && --depth === 0) {
            open = i;
            break;
          }
        }
        if (open <= 0) return true; // no gloss, or nothing before it
        return stripFuri(u.slice(0, open)).trim().length === 0;
      })
      .map((c) => `${c.id} ${String(c.usage).slice(0, 70)}`);
    expect(malformed, `malformed usage:\n${malformed.slice(0, 20).join('\n')}`).toEqual([]);
  });
});
