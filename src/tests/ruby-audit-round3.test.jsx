// ─── tests/ruby-audit-round3.test.jsx ────────────────────────────────────────
// Follow-up to ruby-audit-round2: that round fixed which fields get run
// through the ruby renderer. This round fixes the renderer itself -- the old
// parse-then-reindex implementation (parseRubyFragments once, then re-locate
// each fragment in a second string via indexOf) silently misplaced ruby onto
// the wrong occurrence whenever a kanji base repeated earlier in the same
// string as plain text, and never matched markers at all when the source
// used the "whole conjugated word, okurigana included" convention
// (見切る《みきる》) instead of the more common kanji-stem-only one
// (揚《あ》げる). Both were found by mechanically simulating the *old*
// algorithm against every string in src/data, not by manual spot-checking --
// see JpDisplay.jsx's renderJPWithRuby doc comment for the fix itself.
//
// This file sweeps every real string in the shipped data through the actual
// renderJPWithRuby (not a reimplementation) so the two can never drift.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { renderJPWithRuby } from '../components/JpDisplay.jsx';
import { CARDS } from '../data/cards.js';
import { DANGER_PAIRS } from '../data/danger-pairs.js';
import { CONFUSION_PAIRS } from '../data/confusion-pairs.js';
import { ANGKA_KUNCI } from '../data/angka-kunci.js';
import { JAC_OFFICIAL } from '../data/jac-official.js';
import { JAC_MOCKUP_SETS } from '../data/jac-mockup-sets.js';
import { WAYGROUND_SETS } from '../data/wayground-sets.js';

// Collect every string field across the known data shapes -- deliberately
// generic (walks any array/object) so it keeps covering new fields and new
// data files without needing to be hand-updated, the same lesson
// ruby-audit-round2 drew from the first pass's field-name allowlist missing
// real gaps.
function collectStrings(obj, acc = new Set()) {
  if (typeof obj === 'string') {
    if (obj.includes('《')) acc.add(obj);
  } else if (Array.isArray(obj)) {
    obj.forEach((v) => collectStrings(v, acc));
  } else if (obj && typeof obj === 'object') {
    Object.values(obj).forEach((v) => collectStrings(v, acc));
  }
  return acc;
}

const ALL_STRINGS = collectStrings([
  CARDS,
  DANGER_PAIRS,
  CONFUSION_PAIRS,
  ANGKA_KUNCI,
  JAC_OFFICIAL,
  JAC_MOCKUP_SETS,
  WAYGROUND_SETS,
]);

// Markers that legitimately can't become <ruby> and are expected to survive
// as literal bracketed text in the output -- glosses (a katakana synonym
// annotated onto a kanji+okurigana word, e.g. ろう付け《ブレージング》) and
// fill-in-the-blank cloze markers (《 》). Both fail the same check
// (reading doesn't end with the okurigana touching it) and both already
// rendered as raw brackets before this fix -- unchanged, not a regression.
// Listed explicitly (rather than just asserting "some raw brackets are OK")
// so a *new*, unexpected raw-bracket string fails the sweep instead of
// silently joining this list.
const KNOWN_UNRENDERABLE_SUBSTRINGS = [
  '《ブレージング》',
  '《ブレイジング》',
  '《矢板など》',
  '《衛生管理》',
  '《ヒューマンエラー》',
  '《 》', // cloze fill-in-the-blank
  // The rest of this list is real content-data defects the full sweep
  // surfaced, not rendering bugs: readings that are incomplete, mashed
  // together from more than one term, or wrapped in 《》 as a parenthetical
  // aside rather than a reading at all. Every one of these already fell
  // back to raw text before this fix too (verified: the old strict
  // kanji-only regex doesn't touch any of them either, since none has kanji
  // directly against the marker) -- listed explicitly rather than silently
  // passed so this sweep documents them for a future content-data pass
  // instead of hiding them. See docs/RUBY_MISMATCH_AUDIT.md.
  '打設する《だせつ》', // reading is missing する's own kana
  '丸のこ《まるのこきっくばっく》', // reading appends an unrelated hazard term
  '突き固める《つきかため》', // reading is missing its trailing る
  '左官仕上げ《さかんしあげとぎだしあらいだし》', // reading concatenates 3 technique names
];

describe('renderJPWithRuby — full-corpus sweep against the real fix', () => {
  it('sanity: the corpus actually has a meaningful number of ruby strings to sweep', () => {
    // Guards the sweep itself -- if this collapses to a handful, the import
    // list above has drifted from the real data shape and the sweep below
    // is silently checking almost nothing.
    expect(ALL_STRINGS.size).toBeGreaterThan(1000);
  });

  it('every string in the shipped data renders with no unexplained raw 《reading》 left over', () => {
    const unexpected = [];
    for (const text of ALL_STRINGS) {
      const html = renderToStaticMarkup(renderJPWithRuby(text));
      if (!html.includes('《')) continue;
      const isKnown = KNOWN_UNRENDERABLE_SUBSTRINGS.some((s) => html.includes(s));
      if (!isKnown) unexpected.push({ text, html });
    }
    if (unexpected.length) {
      // eslint-disable-next-line no-console
      console.error('Unexpected raw brackets:', JSON.stringify(unexpected.slice(0, 10), null, 2));
    }
    expect(unexpected).toEqual([]);
  });

  it('never emits an unclosed <rt> or a ruby with an empty base', () => {
    for (const text of ALL_STRINGS) {
      const html = renderToStaticMarkup(renderJPWithRuby(text));
      expect(html).not.toMatch(/<ruby[^>]*><rp>/); // base must not be empty
      // Every <ruby> that opens must close, every <rt> that opens must close.
      expect((html.match(/<ruby/g) || []).length).toBe((html.match(/<\/ruby>/g) || []).length);
      expect((html.match(/<rt>/g) || []).length).toBe((html.match(/<\/rt>/g) || []).length);
    }
  });

  // The specific real examples this fix was built against, re-verified here
  // against the live corpus (not a hand-copied literal) so a future content
  // edit that changes the exact string still exercises the same regression.
  it('the specific misplacement examples found in src/data are fixed', () => {
    // 圧着ペンチ (unmarked) appears before 圧着《あっちゃく》 (marked) in the
    // same string -- the old indexOf-based lookup put the ruby on the first,
    // wrong occurrence every time. Assert it lands on the marked one only.
    const geiText = [...ALL_STRINGS].find((t) => t.includes('圧着《あっちゃく》'));
    expect(geiText).toBeTruthy();
    const geiHtml = renderToStaticMarkup(renderJPWithRuby(geiText));
    expect(geiHtml).toContain('>圧着<');
    expect(geiHtml).toContain('あっちゃく');
    expect(geiHtml).not.toMatch(/《.*》/);

    // 表層の4層《よんそう》: base=層(1) reading=よんそう(4) sits exactly on
    // the implausible-fold boundary. Assert the reading is attached and
    // nothing is left dangling as bare unfurigana'd text with a stray
    // marker -- not a specific base string, since >= vs > is a deliberate,
    // separately-tested threshold choice (see MAX_PLAUSIBLE_KANA_PER_KANJI).
    const soText = [...ALL_STRINGS].find((t) => t.includes('層《よんそう》'));
    expect(soText).toBeTruthy();
    const soHtml = renderToStaticMarkup(renderJPWithRuby(soText));
    expect(soHtml).toContain('よんそう');
    expect(soHtml).toContain('層<rp>'); // 層 is the last character of some ruby's base
    expect(soHtml).not.toMatch(/《.*》/);
  });
});
