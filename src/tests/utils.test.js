import { describe, it, expect, afterEach } from 'vitest';
import { shuffle } from '../utils/shuffle.js';
import { stripFuri, extractReadings, hasJapanese, jpFontSize } from '../utils/jp-helpers.js';
import {
  getWrongCount,
  getWrongTime,
  makeWrongEntry,
  loadFromStorage,
  saveToStorage,
} from '../utils/wrong-tracker.js';

// ─── shuffle ─────────────────────────────────────────────────────────────────
describe('shuffle', () => {
  it('returns same length array', () => {
    const arr = [1, 2, 3, 4, 5];
    expect(shuffle(arr)).toHaveLength(5);
  });

  it('does not mutate original', () => {
    const arr = [1, 2, 3];
    const original = [...arr];
    shuffle(arr);
    expect(arr).toEqual(original);
  });

  it('contains same elements', () => {
    const arr = [1, 2, 3, 4, 5];
    expect(shuffle(arr).sort()).toEqual([1, 2, 3, 4, 5]);
  });

  it('handles empty array', () => {
    expect(shuffle([])).toEqual([]);
  });

  it('handles single element', () => {
    expect(shuffle([42])).toEqual([42]);
  });
});

// ─── jp-helpers ──────────────────────────────────────────────────────────────
describe('stripFuri', () => {
  it('removes 《》 ruby markers', () => {
    expect(stripFuri('危険《きけん》予知《よち》')).toBe('危険予知');
  });

  it('removes hiragana （） readings', () => {
    expect(stripFuri('接地棒（せっちぼう）')).toBe('接地棒');
  });

  it('keeps semantic katakana parens', () => {
    // （SGP）is a product code, not a reading → keep
    const input = '配管（SGP）';
    expect(stripFuri(input)).toBe('配管（SGP）');
  });

  it('returns plain text unchanged', () => {
    expect(stripFuri('ヘルメット')).toBe('ヘルメット');
  });

  it('handles empty string', () => {
    expect(stripFuri('')).toBe('');
  });
});

describe('extractReadings', () => {
  it('extracts hiragana from （）', () => {
    const result = extractReadings('接地棒（せっちぼう）');
    expect(result).toBe('せっちぼう');
  });

  it('extracts from 《》 format', () => {
    const result = extractReadings('危険《きけん》予知《よち》');
    expect(result).not.toBeNull();
    expect(result).toContain('きけん');
  });

  it('returns null when no readings', () => {
    expect(extractReadings('helmet')).toBeNull();
  });
});

describe('hasJapanese', () => {
  it('detects hiragana', () => {
    expect(hasJapanese('せっちぼう')).toBe(true);
  });

  it('detects katakana', () => {
    expect(hasJapanese('ヘルメット')).toBe(true);
  });

  it('detects kanji', () => {
    expect(hasJapanese('接地棒')).toBe(true);
  });

  it('returns false for latin', () => {
    expect(hasJapanese('helmet')).toBe(false);
  });

  it('handles empty', () => {
    expect(hasJapanese('')).toBe(false);
  });
});

describe('jpFontSize', () => {
  it('returns larger size for short text', () => {
    expect(jpFontSize('OK')).toBeGreaterThanOrEqual(24);
  });

  it('returns smaller size for long text, but never below the legibility floor', () => {
    const long = jpFontSize('これはとても長い日本語のテキストです');
    const short = jpFontSize('OK');
    expect(long).toBeLessThan(short);
    // The floor moved 13 -> 17 on 2026-09-04. 13px of CJK is not comparable to
    // 13px of Latin — a kanji carries far more strokes in the same box — and
    // this ladder also multiplies into the furigana above it (rt is an em ratio
    // of this size), which is how furigana came to render at 5.7px.
    expect(long).toBeGreaterThanOrEqual(17);
  });

  it('returns a number', () => {
    expect(typeof jpFontSize('テスト')).toBe('number');
  });

  // The CSS scale is fluid now (typography-scale.test.js), but jpFontSize stays
  // a JS ladder with a hard breakpoint check: it drives an inline font-size from
  // string length, which no CSS clamp can express.
  describe('wide breakpoint (item 22)', () => {
    const realMatchMedia = window.matchMedia;
    afterEach(() => {
      window.matchMedia = realMatchMedia;
    });

    it('returns larger sizes at >=1040px than at compact/medium, same rung for rung', () => {
      window.matchMedia = (q) => ({ matches: q.includes('1040') });
      const wideShort = jpFontSize('OK');
      const wideLong = jpFontSize('これはとても長い日本語のテキストです');

      window.matchMedia = () => ({ matches: false });
      const compactShort = jpFontSize('OK');
      const compactLong = jpFontSize('これはとても長い日本語のテキストです');

      expect(wideShort).toBeGreaterThan(compactShort);
      expect(wideLong).toBeGreaterThan(compactLong);
    });

    it('checks the same 1040px breakpoint global.css uses, not a different number', () => {
      const seenQueries = [];
      window.matchMedia = (q) => {
        seenQueries.push(q);
        return { matches: false };
      };
      jpFontSize('テスト');
      expect(seenQueries.some((q) => q.includes('1040px'))).toBe(true);
    });
  });
});

// ─── wrong-tracker ───────────────────────────────────────────────────────────
describe('getWrongCount', () => {
  it('handles null/undefined', () => {
    expect(getWrongCount(null)).toBe(0);
    expect(getWrongCount(undefined)).toBe(0);
  });

  it('handles legacy number format', () => {
    expect(getWrongCount(3)).toBe(3);
  });

  it('handles new object format', () => {
    expect(getWrongCount({ count: 5, lastWrong: 1714200000 })).toBe(5);
  });
});

describe('getWrongTime', () => {
  it('returns null for legacy format', () => {
    expect(getWrongTime(3)).toBeNull();
    expect(getWrongTime(null)).toBeNull();
  });

  it('returns timestamp from object format', () => {
    const ts = 1714200000;
    expect(getWrongTime({ count: 2, lastWrong: ts })).toBe(ts);
  });
});

describe('makeWrongEntry', () => {
  it('increments count from nothing', () => {
    const entry = makeWrongEntry(undefined, 1000);
    expect(entry.count).toBe(1);
    expect(entry.lastWrong).toBe(1000);
  });

  it('increments count from legacy number', () => {
    expect(makeWrongEntry(2, 1000).count).toBe(3);
  });

  it('increments count from object', () => {
    expect(makeWrongEntry({ count: 4, lastWrong: 999 }, 1000).count).toBe(5);
  });
});

describe('loadFromStorage / saveToStorage', () => {
  it('round-trips a simple value', () => {
    saveToStorage('test-key', { a: 1 });
    expect(loadFromStorage('test-key', null)).toEqual({ a: 1 });
  });

  it('returns defaultVal for missing key', () => {
    expect(loadFromStorage('definitely-not-there-xyz', 'fallback')).toBe('fallback');
  });

  it('handles arrays', () => {
    saveToStorage('arr-key', [1, 2, 3]);
    expect(loadFromStorage('arr-key', [])).toEqual([1, 2, 3]);
  });
});
