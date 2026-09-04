import { describe, it, expect } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { JpFront, renderJPWithRuby } from '../components/JpDisplay.jsx';

describe('JpFront ruby furigana rendering', () => {
  it('renders ruby/rt when jp has inline furigana markers', () => {
    const { container } = render(
      <JpFront jp="鉄筋《てっきん》コンクリート" furiganaPolicy="always" />
    );
    const ruby = container.querySelector('ruby');
    const rt = container.querySelector('rt');

    expect(ruby).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Toggle furigana' })).toBeNull();
    expect(ruby?.textContent).toContain('鉄筋');
    expect(rt?.textContent).toBe('てっきん');
    expect(screen.getByText('コンクリート')).toBeTruthy();
  });

  it('does not render ruby when furiganaPolicy is hidden', () => {
    const { container } = render(<JpFront jp="鉄筋《てっきん》" furiganaPolicy="hidden" />);
    expect(container.querySelector('ruby')).toBeNull();
    expect(screen.getByText('鉄筋')).toBeTruthy();
  });

  it('tap policy reveals and hides furigana interactively', () => {
    const { container } = render(
      <JpFront jp="鉄筋《てっきん》コンクリート" furiganaPolicy="tap" />
    );
    const toggle = screen.getByRole('button', { name: 'Toggle furigana' });

    expect(container.querySelector('ruby')).toBeNull();
    expect(screen.getByText('👆 Ketuk untuk tampilkan furigana')).toBeTruthy();

    fireEvent.click(toggle);
    expect(container.querySelector('ruby')).toBeTruthy();
    expect(screen.getByText('👆 Ketuk untuk sembunyikan furigana')).toBeTruthy();

    fireEvent.click(toggle);
    expect(container.querySelector('ruby')).toBeNull();
  });

  // Regression: malformed source data can carry a single trailing reading for
  // a whole particle/number-interrupted phrase (only the kanji run touching
  // the 《》 marker gets matched as `base`). Previously this stranded the
  // lead-in text as bare unfurigana'd text next to a wildly disproportionate
  // <rt>, which overflowed and looked broken -- see docs/RUBY_MISMATCH_AUDIT.md.
  it('folds a disproportionate reading into its full phrase instead of stranding bare text', () => {
    const { container } = render(
      <JpFront jp="安全確認の8項目《あんぜんかくにんのはちこうもく》" furiganaPolicy="always" />
    );
    const rubies = container.querySelectorAll('ruby');
    const rt = container.querySelector('rt');
    // Exactly one ruby span covering the whole phrase -- not a bare
    // "安全確認の8" left dangling outside it plus a tiny orphaned "項目" ruby.
    expect(rubies.length).toBe(1);
    expect(rubies[0].textContent).toContain('安全確認の8項目');
    expect(rt?.textContent).toBe('あんぜんかくにんのはちこうもく');
  });

  it('keeps normal short readings tightly scoped to their own kanji run', () => {
    const { container } = render(
      <JpFront jp="鉄筋《てっきん》コンクリート製《せい》" furiganaPolicy="always" />
    );
    const rubies = container.querySelectorAll('ruby');
    expect(rubies.length).toBe(2);
    expect(rubies[1].textContent).toContain('製');
    expect(rubies[1].textContent).not.toContain('コンクリート');
  });

  // Regression: SimulasiMode's review list stacks many short JpFront answers
  // (e.g. 2-4 character terms like "任意"/"施工") next to longer ones. Without
  // a cap, jpFontSize's own length-based staircase sends short strings to its
  // largest tier (28px on mobile) -- fine for a single hero card, but reads
  // as random size-jumping once several sit in one scrolled list. maxSize
  // exists specifically so a dense-list caller can opt into a uniform ceiling
  // without changing anything for callers that don't pass it.
  it('maxSize caps the auto-computed font size for a short string', () => {
    const { container: uncapped } = render(<JpFront jp="任意" furiganaPolicy="hidden" />);
    const uncappedSpan = uncapped.querySelector('span[lang="ja"]');
    const uncappedSize = parseInt(uncappedSpan.style.fontSize, 10);
    expect(uncappedSize).toBeGreaterThan(20); // hits the short-string tier

    const { container: capped } = render(
      <JpFront jp="任意" furiganaPolicy="hidden" maxSize={15} />
    );
    const cappedSpan = capped.querySelector('span[lang="ja"]');
    expect(parseInt(cappedSpan.style.fontSize, 10)).toBe(15);
  });

  it('maxSize leaves a string already smaller than the cap untouched', () => {
    const longText = '安全確認の8項目という長い文字列テスト';
    const { container } = render(<JpFront jp={longText} furiganaPolicy="hidden" maxSize={30} />);
    const span = container.querySelector('span[lang="ja"]');
    expect(parseInt(span.style.fontSize, 10)).toBeLessThan(30);
  });

  // Regression: the old parse-then-reindex implementation parsed fragments
  // once against the original string, then re-located each one in a second
  // string via indexOf -- which finds the FIRST occurrence of a repeated
  // kanji base, not necessarily the one the marker actually belonged to.
  // Audited against every string in src/data (not just this one report):
  // 圧着ペンチ appears before the marked 圧着《あっちゃく》, and indexOf put
  // the ruby on the wrong, unrelated earlier occurrence every time.
  it('attaches a reading to the kanji its own marker touched, not an earlier bare repeat of the same kanji', () => {
    const { container } = render(
      <JpFront
        jp="圧着ペンチでリングスリーブを圧着《あっちゃく》して電線を接続する"
        furiganaPolicy="always"
      />
    );
    const rubies = [...container.querySelectorAll('ruby')];
    expect(rubies).toHaveLength(1);
    // The ruby'd span is the marked occurrence, not "圧着ペンチ".
    expect(rubies[0].textContent).toContain('あっちゃく');
    const rubyBase = rubies[0].firstChild.textContent;
    expect(rubyBase).toBe('圧着');
    // "圧着ペンチ" (the earlier, unmarked occurrence) reads as plain text --
    // container text has it once as bare text and once inside the ruby.
    expect(container.textContent).toContain('圧着ペンチ');
  });

  // Regression: this data uses two conventions for verbs/adjectives -- most
  // entries mark just the kanji stem (揚《あ》げる), but some mark the whole
  // conjugated word including its okurigana (見切る《みきる》). The old
  // regex required kanji directly touching 《, so the second form was never
  // captured at all -- not misplaced, not stripped, just left as literal
  // "見切る《みきる》" text in the middle of otherwise-clean output.
  it('splits okurigana folded into the marker back out into ordinary text', () => {
    const { container } = render(<JpFront jp="見切る《みきる》" furiganaPolicy="always" />);
    expect(container.querySelector('ruby')).toBeTruthy();
    expect(container.querySelector('rt')?.textContent).toBe('みき');
    expect(container.textContent).not.toMatch(/《.*》/);
    // The okurigana renders as ordinary text right after the ruby, not
    // inside the <rb>/<rt> pair.
    expect(container.querySelector('ruby')?.firstChild.textContent).toBe('見切');
  });

  it('does not confuse a genuine gloss or fill-in-the-blank marker for okurigana', () => {
    // ろう付け《ブレージング》: katakana gloss, not a phonetic reading for け
    // -- renderJPWithRuby itself must not split け off as if it were
    // okurigana (it isn't part of "ブレージング" at all). JpFront still
    // shows this reasonably via its own separate, pre-existing
    // extractReadings fallback (a single ruby over the whole word) since
    // this marker doesn't attach to any specific kanji run; that fallback
    // is unrelated to this fix, so exercise renderJPWithRuby directly here.
    const result = renderJPWithRuby('ろう付け《ブレージング》');
    const html = renderToStaticMarkup(result);
    expect(html).not.toContain('<rt>ブレージン</rt>'); // け must not be stripped from the reading
    expect(html).toContain('ろう付け《ブレージング》'); // passed through verbatim, no ruby at all

    // Cloze fill-in-the-blank markers get the same treatment.
    const cloze = renderJPWithRuby('文章の《 》に入る言葉');
    expect(renderToStaticMarkup(cloze)).toContain('文章の《 》に入る言葉');
  });

  // Regression: a handful of jac-mockup-sets.js entries have the same
  // marker duplicated back-to-back (冷媒《れいばい》《れいばい》) -- real
  // source data, found by the full test suite while verifying this fix, not
  // a hypothetical. The orphaned second copy has no kanji of its own to
  // attach to; it should disappear rather than show as broken raw brackets.
  it('drops an orphaned duplicate marker instead of leaving it as raw text', () => {
    const { container } = render(
      <JpFront jp="冷媒《れいばい》《れいばい》配管《はいかん》" furiganaPolicy="always" />
    );
    expect(container.textContent).not.toMatch(/《.*》/);
    expect(container.querySelectorAll('ruby')).toHaveLength(2);
  });

  // Regression: kanji+katakana loanword compounds (移動式クレーン, 冷却コイル,
  // 防水カバー -- ordinary vocabulary in this domain, not edge cases) were
  // never matched at all, since only trailing *hiragana* was recognized as
  // possible okurigana. Full-corpus scan found 871 occurrences / 384 unique
  // (base, reading) pairs of this exact shape. Worse than the plain
  // okurigana gap: when a katakana-suffixed marker shares a string with
  // *other*, successfully-matched markers, it fell into gap text and got
  // silently stripped by the stray-bracket cleanup rather than shown at all.
  it('renders a kanji+katakana loanword compound as one combined ruby', () => {
    const { container } = render(
      <JpFront jp="移動式クレーン《いどうしきくれえん》" furiganaPolicy="always" />
    );
    const ruby = container.querySelector('ruby');
    expect(ruby).toBeTruthy();
    expect(ruby.firstChild.textContent).toBe('移動式クレーン'); // kanji + katakana kept together
    expect(container.querySelector('rt')?.textContent).toBe('いどうしきくれえん'); // full reading, untrimmed
    expect(container.textContent).not.toMatch(/《.*》/);
  });

  it('does not silently drop a katakana-compound reading when it shares a string with other markers', () => {
    // Real shape from src/data: a kanji+katakana marker followed later by an
    // ordinary kanji-only marker in the same sentence.
    const result = renderJPWithRuby(
      '光ファイバーケーブル《ひかりふぁいばあけえぶる》を管路《かんろ》に通す'
    );
    const html = renderToStaticMarkup(result);
    expect(html).not.toMatch(/《.*》/);
    expect(html).toContain('ひかりふぁいばあけえぶる');
    expect(html).toContain('かんろ');
    expect((html.match(/<ruby/g) || []).length).toBe(2);
  });
});
