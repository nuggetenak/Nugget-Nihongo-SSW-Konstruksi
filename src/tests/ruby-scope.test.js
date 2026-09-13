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
// docs/RUBY_MISMATCH_AUDIT.md tracked the backlog and is retired (2026-09-13,
// docs/archive/) — the list is empty. This test measures the real thing, through the
// real parser, and holds it at zero rather than at a count.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect } from 'vitest';
import { CARDS } from '../data/cards.js';
import { WAYGROUND_SETS } from '../data/wayground-sets.js';
import { JAC_MOCKUP_SETS } from '../data/jac-mockup-sets.js';
import { JAC_OFFICIAL } from '../data/jac-official.js';
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

/**
 * Readings that are legitimately longer than three kana per kanji.
 *
 * This replaces a budget, and the replacement is the point. The budget stood at 42
 * and the backlog behind it was 39 readings, most of which were not over-wide
 * annotations at all but *compounds split in half with a kana inserted between
 * them* — `転《ころ》び落《てんらく》` where the word is 転落, so the deck
 * displayed 転び落, which is not a word. A number cannot tell those apart from
 * 雷《かみなり》, which is simply how 雷 is read, so for five weeks it reported
 * both as the same kind of debt and neither got looked at.
 *
 * An allow-list has to name each one, so adding to it is a claim someone can check.
 * Every entry here is a single kanji whose ordinary reading runs to four kana.
 */
const LONG_BUT_CORRECT = new Set(['雷《かみなり》']);

describe('ruby scope', () => {
  it('no reading is wider than its base allows', () => {
    const wide = findWideReadings().filter(
      (w) => !LONG_BUT_CORRECT.has(`${w.base}《${w.reading}》`)
    );
    expect(
      wide.map((w) => `${w.id}.${w.field} ${w.base}《${w.reading}》`),
      'a reading wider than its base can hold. If it is genuinely that long, add it ' +
        'to LONG_BUT_CORRECT by name rather than raising a count'
    ).toEqual([]);
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

/**
 * Every ruby fragment in the three question banks, through the same parser.
 *
 * This existed for CARDS only, and the banks carry more ruby than the deck does —
 * 10,420 fragments against the deck's 9,271 — so the larger half of the corpus was
 * unguarded. Found on 2026-09-13 while building item 114's verifier for Wayground:
 * a marker there could hold a whole sentence and nothing would say so.
 */
function bankFragments() {
  const out = [];
  const banks = [
    ['wayground', WAYGROUND_SETS.flatMap((s) => s.questions.map((q) => ({ ...q, set: s.id })))],
    ['jac-mockup', JAC_MOCKUP_SETS.flatMap((s) => s.questions.map((q) => ({ ...q, set: s.id })))],
    ['jac-official', JAC_OFFICIAL.map((q) => ({ ...q, set: 'official' }))],
  ];
  for (const [bank, qs] of banks) {
    for (const q of qs) {
      const fields = [
        ['q', q.q],
        ['hint', q.hint],
        ['exp', q.exp],
        ...(q.opts ?? []).map((o, i) => [`opts[${i}]`, o]),
        ...(q.opts_id ?? []).map((o, i) => [`opts_id[${i}]`, o]),
      ];
      for (const [field, val] of fields) {
        if (!val) continue;
        for (const line of String(val).split('\n')) {
          for (const f of parseRubyFragments(line)) {
            out.push({ where: `${bank}:${q.set}#${q.id}.${field}`, ...f });
          }
        }
      }
    }
  }
  return out;
}

/** A reading is kana. Nothing else belongs in one — see the non-kana suite below. */
const NON_KANA = /[^\u3041-\u309F\u30A0-\u30FF\u30FC\u3005]/;

function cardFragments() {
  const out = [];
  for (const c of CARDS) {
    for (const field of ['jp', 'desc', 'usage']) {
      if (!c[field]) continue;
      for (const line of String(c[field]).split('\n')) {
        for (const f of parseRubyFragments(line)) {
          out.push({ where: `card:${c.id}.${field}`, ...f });
        }
      }
    }
  }
  return out;
}

describe('ruby scope: the question banks', () => {
  // Zero, not a budget. The 18 sites that were over-wide here on 2026-09-13 were
  // all fixed in the same pass (scripts/archive/fix-ruby-non-kana.mjs), so there is
  // no backlog to tolerate and no reason to let one start.
  it('no reading in any question bank is wider than its base allows', () => {
    const wide = bankFragments().filter((f) => f.reading.length > f.base.length * OVERFLOW_RATIO);
    expect(
      wide.map((w) => `${w.where} ${w.base}\u300a${w.reading}\u300b`),
      'a marker holding a phrase reading rather than its own base'
    ).toEqual([]);
  });
});

describe('a reading contains only kana', () => {
  // The sibling class of the one above, and the one that renders most obviously
  // wrong: 21 markers held a latin abbreviation (ALGC, SDS/MSDS, CCUS), a digit the
  // base text already showed (`時間《6じかん》`), or a whole sentence with its
  // commas. A ratio check cannot see any of those — `布《ALGC》` is four characters
  // over one, comfortably inside the budget, and still not a reading.
  //
  // ー and 々 are allowed: a long-vowel mark and the repeater are part of how kana
  // is written. Kanji in a reading is not checked here because the parser already
  // treats that as a gloss and emits no fragment for it.
  it('no card reading carries a digit, a latin letter or punctuation', () => {
    const bad = cardFragments().filter((f) => NON_KANA.test(f.reading));
    expect(bad.map((b) => `${b.where} ${b.base}\u300a${b.reading}\u300b`)).toEqual([]);
  });

  it('no question-bank reading does either', () => {
    const bad = bankFragments().filter((f) => NON_KANA.test(f.reading));
    expect(bad.map((b) => `${b.where} ${b.base}\u300a${b.reading}\u300b`)).toEqual([]);
  });
});
