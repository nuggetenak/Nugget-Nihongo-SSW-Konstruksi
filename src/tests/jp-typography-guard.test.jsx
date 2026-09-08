// ─── tests/jp-typography-guard.test.jsx ──────────────────────────────────────
// UI_UX_PLAN item 116 — nine real Japanese terms were rendered as Indonesian.
//
// `isMeaningfullyJapanese` routes text below 40% Japanese characters to plain,
// left-aligned `lang="id"` body text, and that guard is right: several shared
// ResultScreen slots carry Indonesian sentences with an incidental JP term.
//
// What it was not right about was <latin abbreviation>+<kanji> construction
// terms. `CD管《かん》` is 33% Japanese, so it fell through to the bail-out --
// which renders the *stripped* string, i.e. `CD管` with the reading dropped.
// The one part a learner cannot supply (管 = pipe) lost the one thing that
// makes it readable, and a screen reader was told it was Indonesian.
//
// The fix is the reading marker, not the threshold: 《》 only ever appears on
// Japanese text, so it cannot fire on the Indonesian sentences the guard
// exists for. Lowering 0.4 to 0.25 would have dragged them back over the line.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { JpFront } from '../components/JpDisplay.jsx';
import { isMeaningfullyJapanese } from '../utils/jp-helpers.js';
import { CARDS } from '../data/cards.js';

// The nine that were misclassified, one per shape in the corpus.
const RESCUED = [
  'CD管《かん》',
  'PC杭《ぐい》',
  'PHC杭《ぐい》',
  'RC造《ぞう》',
  'SRC造《ぞう》',
  'PF管《かん》',
  'CB造《ぞう》',
  '土留め《どどめ》≥ 1.5m',
];

// Genuine acronyms. No kanji, no reading — the guard is doing its job here and
// must keep doing it.
const ACRONYMS = ['OTDR', 'QCDSE', '5M', 'WBGT', 'COS（Change Over Switch）'];

// What the guard was built for: Indonesian prose with an incidental JP term.
const INDONESIAN = [
  'Panel listrik utama di lokasi kerja (配電盤)',
  'Sabuk pengaman wajib dipakai di ketinggian lebih dari dua meter',
];

describe('Japanese typography guard', () => {
  it.each(RESCUED)('treats %s as Japanese — it carries a reading', (jp) => {
    expect(isMeaningfullyJapanese(jp)).toBe(true);
  });

  it.each(ACRONYMS)('still routes %s to plain body text', (jp) => {
    expect(isMeaningfullyJapanese(jp)).toBe(false);
  });

  it.each(INDONESIAN)('still routes Indonesian prose to plain body text: %s', (jp) => {
    expect(isMeaningfullyJapanese(jp)).toBe(false);
  });

  it('renders the reading for a rescued term instead of dropping it', () => {
    const { container } = render(<JpFront jp="CD管《かん》" furiganaPolicy="always" />);
    // The whole cost of the bug: `かん` did not appear anywhere on screen.
    expect(container.querySelector('rt')?.textContent).toBe('かん');
    expect(container.querySelector('[lang="id"]')).toBeNull();
  });

  it('leaves a genuine acronym as plain Indonesian-tagged text', () => {
    const { container } = render(<JpFront jp="OTDR" furiganaPolicy="always" />);
    expect(container.querySelector('[lang="id"]')?.textContent).toBe('OTDR');
    expect(container.querySelector('ruby')).toBeNull();
  });

  it('is not fed pre-stripped text — stripping first is what hid the nine', () => {
    // The call site passes `jp`, not `stripFuri(jp)`. If that ever regresses,
    // the marker is gone by the time the guard sees it and the ratio decides.
    expect(isMeaningfullyJapanese('CD管')).toBe(false);
    expect(isMeaningfullyJapanese('CD管《かん》')).toBe(true);
  });

  it('leaves exactly the acronym population bailing out across the corpus', () => {
    const bailed = CARDS.filter((c) => !isMeaningfullyJapanese(c.jp));
    // 28 before the fix; the nine kanji-carrying terms are no longer among them.
    expect(bailed).toHaveLength(19);
    // Budget in the ruby-scope.test.js shape: every remaining bail-out must be
    // a string with no kanji at all, so it can never be one of these again.
    for (const c of bailed) {
      expect(/[一-鿿]/.test(c.jp), `card ${c.id} (${c.jp}) has kanji`).toBe(false);
    }
  });
});
