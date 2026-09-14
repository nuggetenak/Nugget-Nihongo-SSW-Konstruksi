// ─── tests/jp-text-scale.test.js ─────────────────────────────────────────────
// Ukuran Teks sets a PERCENTAGE on the root font-size; every rem in the app
// resolves against it. jpFontSize() returns bare numbers that JpDisplay applies
// as an inline px `fontSize`, and px resolves against nothing -- so Besar and
// Sangat Besar enlarged every label, button and Indonesian gloss and left the
// JAPANESE exactly where it was. On the flashcard front, every quiz stem, every
// glossary entry: the one piece of content the control exists for, in an app
// whose own setting copy promised "Semua tulisan".
//
// The audience is people still learning the script, on cheap phones, often
// outdoors. This was the single highest-value UI defect found in the 7.6.0
// audit pass.
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { jpFontSize } from '../utils/jp-helpers.js';
import { applyTextScale, TEXT_SCALES, DEFAULT_TEXT_SCALE } from '../utils/text-scale.js';

const SHORT = 'ライフライン'; // 6 chars — a typical headword
const LONG = 'この現場では安全帯を必ず着用してください'; // past the longest rung

beforeEach(() => applyTextScale(DEFAULT_TEXT_SCALE));
afterEach(() => applyTextScale(DEFAULT_TEXT_SCALE));

const at = (key, text) => {
  applyTextScale(key);
  return jpFontSize(text);
};

describe('Japanese follows Ukuran Teks', () => {
  it('grows at Besar and Sangat Besar', () => {
    const normal = at('normal', SHORT);
    expect(at('besar', SHORT), 'Besar must enlarge Japanese').toBeGreaterThan(normal);
    expect(at('sangat-besar', SHORT), 'Sangat Besar must enlarge it further').toBeGreaterThan(
      at('besar', SHORT)
    );
  });

  it('grows at every length rung, not just short headwords', () => {
    for (const text of [SHORT, LONG, 'あ', '配管工事の施工管理']) {
      expect(at('sangat-besar', text), `no growth for "${text}"`).toBeGreaterThan(
        at('normal', text)
      );
    }
  });

  it('tracks the declared percentage rather than a second ladder', () => {
    // One source for "how much bigger". A separate multiplier table here would
    // be the same class of bug as the one being fixed: two places encoding one
    // decision, drifting apart the moment either moves.
    for (const s of TEXT_SCALES) {
      if (s.pct < 100) continue;
      const expected = Math.round(jpFontSizeAtNormal(SHORT) * (s.pct / 100));
      expect(at(s.key, SHORT), `${s.key} (${s.pct}%)`).toBe(expected);
    }
  });

  function jpFontSizeAtNormal(text) {
    applyTextScale('normal');
    return jpFontSize(text);
  }
});

describe('but never shrinks — the owner decision this protects', () => {
  it('Kecil leaves Japanese exactly where Normal has it', () => {
    // THE test to read before making this symmetric. `kecil` (90%) is the
    // DEFAULT, an owner decision recorded in text-scale.js, so scaling both ways
    // would shrink every flashcard headword 30px -> 27px for every existing
    // reader who has never touched the setting. A census of this app found 85%
    // of its text at 13px or below and called that its largest usability
    // problem; 13px of CJK is not 13px of Latin, because a kanji carries far
    // more strokes in the same box.
    expect(at('kecil', SHORT), 'Kecil must not shrink Japanese').toBe(at('normal', SHORT));
    expect(at('kecil', LONG)).toBe(at('normal', LONG));
  });

  it('the floor holds for any percentage below 100, not just the declared rungs', () => {
    document.documentElement.style.fontSize = '50%';
    expect(jpFontSize(SHORT)).toBe(at('normal', SHORT));
  });

  it('survives a root font-size that is unset or nonsense', () => {
    document.documentElement.style.fontSize = '';
    const bare = jpFontSize(SHORT);
    document.documentElement.style.fontSize = 'inherit';
    expect(jpFontSize(SHORT)).toBe(bare);
    expect(bare).toBeGreaterThan(0);
  });
});
