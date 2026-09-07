// ─── tests/ruby-scope.test.js ────────────────────────────────────────────────
// A 《reading》 marker only annotates the run of characters it touches. When a
// reading was authored for a longer phrase — 36協定《さぶろくきょうてい》, where the
// reading covers 三六協定 but only 協定 touches the marker — the <rt> renders far
// wider than its base and spills over its neighbours.
//
// `audit-data-text` cannot see this: a too-wide reading is still well-formed
// data. `extendBaseLeft` in JpDisplay recovers the common case by growing the
// base leftward, but only when the preceding text contains kana to pin the
// extension — a pure-kanji or digit prefix gives it nothing to anchor on, and
// those are what remain.
//
// docs/RUBY_MISMATCH_AUDIT.md tracks the backlog. This test measures the real
// thing, through the real parser, and holds the line: the count may fall, never
// rise.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect } from 'vitest';
import { CARDS } from '../data/cards.js';
import { parseRubyFragments } from '../components/JpDisplay.jsx';

/**
 * Calibrated against all 9,271 ruby fragments in the corpus rather than guessed:
 * the distribution sits almost entirely at 1–3 kana per base character (8,852 of
 * them), which is just what Japanese looks like. Past 3 the population changes
 * character — 協定《さぶろくきょうてい》, 条《だいじゅうろくじょう》, 業種《けんせつぎょうほうの…》
 * — readings authored for a phrase far longer than the marker touches.
 *
 * It is a superset, not a classifier: a few genuinely long single-kanji readings
 * (雷《かみなり》) sit just over the line. That is the right trade for a ratchet,
 * whose job is to stop the count growing, not to name every row.
 */
const OVERFLOW_RATIO = 3;

export function findWideReadings(cards = CARDS) {
  const out = [];
  for (const c of cards) {
    for (const field of ['jp', 'desc', 'usage']) {
      if (!c[field]) continue;
      for (const line of String(c[field]).split('\n')) {
        for (const f of parseRubyFragments(line)) {
          if (f.reading.length > f.base.length * OVERFLOW_RATIO) {
            out.push({ id: c.id, field, base: f.base, reading: f.reading });
          }
        }
      }
    }
  }
  return out;
}

describe('ruby scope', () => {
  // Measured 2026-09-07: 128 after the multi-vocabulary split resolved 16 of the
  // audit's rows as a side effect, then 42 once the digit- and latin-prefixed
  // class was rewritten. Lower this when rows are fixed; never raise it to make a
  // new one pass.
  const WIDE_READING_BUDGET = 42;

  it('no reading is wider than its base allows, beyond the known backlog', () => {
    const wide = findWideReadings();
    expect(
      wide.length,
      `${wide.length} readings overflow their base. Worst: ` +
        wide
          .sort((a, b) => b.reading.length / b.base.length - a.reading.length / a.base.length)
          .slice(0, 5)
          .map((w) => `${w.id} ${w.base}《${w.reading}》`)
          .join('; ')
    ).toBeLessThanOrEqual(WIDE_READING_BUDGET);
  });

  it('a reading whose base has kana to pin it is extended, not left short', () => {
    // 休憩時間の規定《きゅうけいじかんのきてい》 — the の gives extendBaseLeft an
    // anchor, so the base should cover the whole phrase rather than just 規定.
    const [frag] = parseRubyFragments('休憩時間の規定《きゅうけいじかんのきてい》');
    expect(frag.base).toBe('休憩時間の規定');
  });

  it('a marker at the start of the text may take a pure-kanji base', () => {
    // extendBaseLeft lowers its bar at text start, where there is no earlier word
    // to swallow — so this one already renders correctly and is not backlog.
    const [frag] = parseRubyFragments('新規入場者教育《しんきにゅうじょうしゃきょういく》');
    expect(frag.base).toBe('新規入場者教育');
  });

  it('a digit or latin prefix leaves the base short — the shape that was fixed', () => {
    // Nothing in `36` or `C` is a Japanese word character, so extendBaseLeft has
    // no anchor: the base stays at the kanji while the reading spells the whole
    // term. The parser is right to refuse; the data was wrong, and this class was
    // rewritten (36協定 -> 三六協定, CD管《しいぢいかん》 -> CD管《かん》).
    const [broken] = parseRubyFragments('36協定《さぶろくきょうてい》');
    expect(broken.base).toBe('協定');
    expect(broken.reading.length).toBeGreaterThan(broken.base.length * OVERFLOW_RATIO);

    const [fixed] = parseRubyFragments('三六協定《さぶろくきょうてい》');
    expect(fixed.base).toBe('三六協定');
    expect(fixed.reading.length).toBeLessThanOrEqual(fixed.base.length * OVERFLOW_RATIO);
  });
});
