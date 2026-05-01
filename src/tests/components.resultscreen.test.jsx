// ─── tests/components.resultscreen.test.jsx ──────────────────────────────────
// Component tests for ResultScreen — two emotional paths, grade display, actions.
// phaseA: Updated 3 tests for A.10 growth-mindset changes:
//   - encourage emoji: 💪 → 🌱
//   - encourage label: "Jangan Menyerah" → "Belum. Tapi kamu sudah tahu..."
//   - weakness tip: use more specific selector to avoid multi-match
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ResultScreen from '../components/ResultScreen.jsx';

const defaultProps = {
  correct: 17,
  total: 20,
  maxStreak: 5,
  review: [],
  onRestart: vi.fn(),
  onRetryWrong: vi.fn(),
  onExit: vi.fn(),
};

describe('ResultScreen', () => {
  describe('celebrate path (≥70%)', () => {
    it('renders percentage correctly', () => {
      render(<ResultScreen {...defaultProps} correct={17} total={20} />);
      expect(screen.getByText('85%')).toBeTruthy();
    });

    it('shows 🏆 emoji for celebrate path', () => {
      render(<ResultScreen {...defaultProps} correct={17} total={20} />);
      expect(screen.getByText('🏆')).toBeTruthy();
    });

    it('shows correct score label', () => {
      render(<ResultScreen {...defaultProps} correct={17} total={20} />);
      expect(screen.getByText(/17\/20/)).toBeTruthy();
    });

    it('renders Ulang Lagi button', () => {
      render(<ResultScreen {...defaultProps} correct={17} total={20} />);
      expect(screen.getByText(/Ulang/i)).toBeTruthy();
    });

    it('calls onRestart when Ulang button clicked', () => {
      const onRestart = vi.fn();
      render(<ResultScreen {...defaultProps} correct={17} total={20} onRestart={onRestart} />);
      fireEvent.click(screen.getByText(/Ulang/i));
      expect(onRestart).toHaveBeenCalledOnce();
    });

    it('calls onExit when Kembali button clicked', () => {
      const onExit = vi.fn();
      render(<ResultScreen {...defaultProps} correct={17} total={20} onExit={onExit} />);
      fireEvent.click(screen.getByText(/Kembali/i));
      expect(onExit).toHaveBeenCalledOnce();
    });
  });

  describe('encourage path (<50%)', () => {
    // A.10: emoji changed from 💪 to 🌱 (growth mindset — Dweck 2006)
    it('renders 🌱 emoji for encourage path', () => {
      render(<ResultScreen {...defaultProps} correct={3} total={20} />);
      expect(screen.getByText('🌱')).toBeTruthy();
    });

    it('shows 15% for 3/20', () => {
      render(<ResultScreen {...defaultProps} correct={3} total={20} />);
      expect(screen.getByText('15%')).toBeTruthy();
    });

    // A.10: label changed from "Jangan Menyerah" to "not yet" framing
    it('shows growth-mindset "Belum" message on encourage path', () => {
      render(<ResultScreen {...defaultProps} correct={3} total={20} />);
      expect(screen.getByText(/Belum\. Tapi kamu sudah tahu/i)).toBeTruthy();
    });

    it('shows weakness tip when wrong count > 0', () => {
      render(<ResultScreen {...defaultProps} correct={3} total={20} />);
      // weaknessTip: "Kamu salah X soal. Coba pelajari kartunya lagi..."
      // Use /Coba pelajari/ to avoid matching heroLabel which also contains "pelajari"
      expect(screen.getByText(/Coba pelajari kartunya/i)).toBeTruthy();
    });
  });

  describe('neutral path (50-69%)', () => {
    it('shows 60% for 12/20', () => {
      render(<ResultScreen {...defaultProps} correct={12} total={20} />);
      expect(screen.getByText('60%')).toBeTruthy();
    });

    it('does not show 🏆 or 🌱 on neutral path', () => {
      render(<ResultScreen {...defaultProps} correct={12} total={20} />);
      expect(screen.queryByText('🏆')).toBeNull();
      expect(screen.queryByText('🌱')).toBeNull();
    });
  });

  describe('edge cases', () => {
    it('handles 100% score', () => {
      render(<ResultScreen {...defaultProps} correct={20} total={20} />);
      expect(screen.getByText('100%')).toBeTruthy();
    });

    it('handles 0% score', () => {
      render(<ResultScreen {...defaultProps} correct={0} total={20} />);
      expect(screen.getByText('0%')).toBeTruthy();
    });

    it('handles zero total gracefully', () => {
      render(<ResultScreen {...defaultProps} correct={0} total={0} />);
      expect(screen.getByText('0%')).toBeTruthy();
    });

    it('shows wrong answer review items when review prop has items', () => {
      const review = [
        { question: '足場とは何ですか？', userAnswer: 'Fondasi', correctAnswer: 'Perancah' },
      ];
      render(<ResultScreen {...defaultProps} correct={17} total={20} review={review} />);
      expect(screen.getByText(/足場とは何ですか？/)).toBeTruthy();
    });

    it('calls onRetryWrong with wrong items when retry button clicked', () => {
      const onRetryWrong = vi.fn();
      const review = [
        { question: '足場', userAnswer: 'A', correctAnswer: 'B' },
        { question: '安全帯', userAnswer: 'C', correctAnswer: 'D' },
      ];
      render(
        <ResultScreen
          {...defaultProps}
          correct={18}
          total={20}
          review={review}
          onRetryWrong={onRetryWrong}
        />
      );
      const retryBtn = screen.getAllByText(/salah/i)[0];
      fireEvent.click(retryBtn);
      expect(onRetryWrong).toHaveBeenCalledOnce();
    });
  });

  describe('maxStreak display', () => {
    it('shows streak count when maxStreak > 0', () => {
      render(<ResultScreen {...defaultProps} correct={17} total={20} maxStreak={8} />);
      expect(screen.getByText(/8 streak/)).toBeTruthy();
    });
  });
});
