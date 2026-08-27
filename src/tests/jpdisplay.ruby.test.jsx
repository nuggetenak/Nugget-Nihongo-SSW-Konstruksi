import { describe, it, expect } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { JpFront } from '../components/JpDisplay.jsx';

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
});
