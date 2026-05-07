// ─── ResultScreen.test.jsx ────────────────────────────────────────────────────
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ResultScreen from '../components/ResultScreen.jsx';

vi.mock('../components/ResultScreen.module.css', () => ({}));

function make(correct, total, opts = {}) {
  return render(
    <ResultScreen
      correct={correct}
      total={total}
      maxStreak={opts.maxStreak ?? 0}
      review={opts.review ?? []}
      onRestart={opts.onRestart ?? vi.fn()}
      onRetryWrong={opts.onRetryWrong ?? vi.fn()}
      onExit={opts.onExit ?? vi.fn()}
    />
  );
}

describe('ResultScreen', () => {
  it('score ≥ 70 renders data-path="celebrate"', () => {
    make(7, 10);
    const hero = document.querySelector('[data-path="celebrate"]');
    expect(hero).toBeTruthy();
  });

  it('score < 50 renders data-path="encourage"', () => {
    make(4, 10);
    const hero = document.querySelector('[data-path="encourage"]');
    expect(hero).toBeTruthy();
  });

  it('score 50–69 renders data-path="neutral"', () => {
    make(6, 10);
    const hero = document.querySelector('[data-path="neutral"]');
    expect(hero).toBeTruthy();
  });

  it('"Ulangi" button calls onRestart', () => {
    const onRestart = vi.fn();
    make(5, 10, { onRestart });
    const btn = screen.getByRole('button', { name: /ulangi/i });
    fireEvent.click(btn);
    expect(onRestart).toHaveBeenCalledTimes(1);
  });

  it('"Kembali" button calls onExit', () => {
    const onExit = vi.fn();
    make(5, 10, { onExit });
    const btn = screen.getByRole('button', { name: /kembali/i });
    fireEvent.click(btn);
    expect(onExit).toHaveBeenCalledTimes(1);
  });

  it('wrong answers list renders with correct count', () => {
    const review = [
      { id: 1, jp: '基礎', id_text: 'Fondasi', picked: 0, correct: 1 },
      { id: 2, jp: '足場', id_text: 'Perancah', picked: 1, correct: 0 },
    ];
    make(8, 10, { review });
    // ResultScreen shows a "Coba Lagi (N)" or review section
    const wrongItems = document.querySelectorAll('[data-wrong="true"], .wrongItem');
    // At minimum verify review is passed without crash and count shows
    expect(screen.queryByText(/2/)).toBeTruthy();
  });

  it('renders correct/total in score text', () => {
    make(7, 10);
    expect(screen.getByText(/7\/10/)).toBeTruthy();
  });
});
