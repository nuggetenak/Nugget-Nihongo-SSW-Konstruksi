// ─── tests/components.quizshell.test.jsx ─────────────────────────────────────
// Component tests for QuizShell — question rendering, answer selection,
// progression, finish flow.
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import QuizShell from '../components/QuizShell.jsx';

const makeQ = (overrides = {}) => ({
  question: '足場とは？',
  questionSub: 'Apa itu perancah?',
  options: [
    { text: 'Perancah' },
    { text: 'Fondasi' },
    { text: 'Dinding' },
    { text: 'Atap' },
  ],
  correctIdx: 0,
  explanation: 'Perancah adalah struktur sementara untuk bekerja di ketinggian.',
  ...overrides,
});

const defaultProps = {
  questions: [makeQ()],
  onExit: vi.fn(),
  title: 'Kuis',
  onAnswer: vi.fn(),
  onFinish: vi.fn(),
  autoNextDelay: 0, // disable auto-advance in tests
};

describe('QuizShell', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('initial render', () => {
    it('renders question text', () => {
      render(<QuizShell {...defaultProps} />);
      expect(screen.getByText('足場とは？')).toBeTruthy();
    });

    it('renders question sub-text (Indonesian translation)', () => {
      render(<QuizShell {...defaultProps} />);
      expect(screen.getByText('Apa itu perancah?')).toBeTruthy();
    });

    it('renders all 4 options', () => {
      render(<QuizShell {...defaultProps} />);
      expect(screen.getByText('Perancah')).toBeTruthy();
      expect(screen.getByText('Fondasi')).toBeTruthy();
      expect(screen.getByText('Dinding')).toBeTruthy();
      expect(screen.getByText('Atap')).toBeTruthy();
    });

    it('renders title in back button', () => {
      render(<QuizShell {...defaultProps} title="JAC Test" />);
      expect(screen.getByText(/JAC Test/)).toBeTruthy();
    });

    it('shows question counter 1/N', () => {
      render(<QuizShell {...defaultProps} />);
      expect(screen.getByText('1 / 1')).toBeTruthy();
    });

    it('does not show hint when showHint=false and hint is provided', () => {
      render(<QuizShell {...defaultProps} questions={[makeQ({ hint: 'Ini hint' })]} showHint={false} />);
      expect(screen.queryByText(/Ini hint/)).toBeNull();
    });

    it('shows hint when showHint=true', () => {
      render(<QuizShell {...defaultProps} questions={[makeQ({ hint: 'Petunjuk penting' })]} showHint={true} />);
      expect(screen.getByText(/Petunjuk penting/)).toBeTruthy();
    });
  });

  describe('answer selection', () => {
    it('does not show explanation before answering', () => {
      render(<QuizShell {...defaultProps} />);
      expect(screen.queryByText(/Perancah adalah struktur/)).toBeNull();
    });

    it('shows explanation after selecting an answer', () => {
      render(<QuizShell {...defaultProps} />);
      fireEvent.click(screen.getByText('Perancah'));
      expect(screen.getByText(/Perancah adalah struktur/)).toBeTruthy();
    });

    it('calls onAnswer with correct args when option selected', () => {
      const onAnswer = vi.fn();
      render(<QuizShell {...defaultProps} onAnswer={onAnswer} />);
      fireEvent.click(screen.getByText('Fondasi')); // index 1, wrong
      expect(onAnswer).toHaveBeenCalledWith(0, 1, false);
    });

    it('calls onAnswer with isCorrect=true for correct option', () => {
      const onAnswer = vi.fn();
      render(<QuizShell {...defaultProps} onAnswer={onAnswer} />);
      fireEvent.click(screen.getByText('Perancah')); // index 0, correct
      expect(onAnswer).toHaveBeenCalledWith(0, 0, true);
    });

    it('cannot select another option after first selection', () => {
      const onAnswer = vi.fn();
      render(<QuizShell {...defaultProps} onAnswer={onAnswer} />);
      fireEvent.click(screen.getByText('Fondasi'));
      fireEvent.click(screen.getByText('Dinding'));
      // onAnswer should only be called once
      expect(onAnswer).toHaveBeenCalledOnce();
    });

    it('shows Lanjut → button after answering', () => {
      render(<QuizShell {...defaultProps} />);
      fireEvent.click(screen.getByText('Perancah'));
      expect(screen.getByText(/Lihat Hasil/)).toBeTruthy(); // last question → "Lihat Hasil"
    });
  });

  describe('multi-question flow', () => {
    const twoQuestions = [
      makeQ({ question: 'Q1?', options: [{ text: 'A1' }, { text: 'B1' }, { text: 'C1' }, { text: 'D1' }], correctIdx: 0 }),
      makeQ({ question: 'Q2?', options: [{ text: 'A2' }, { text: 'B2' }, { text: 'C2' }, { text: 'D2' }], correctIdx: 1 }),
    ];

    it('shows Lanjut → on non-last question', () => {
      render(<QuizShell {...defaultProps} questions={twoQuestions} />);
      fireEvent.click(screen.getByText('A1'));
      expect(screen.getByText(/Lanjut →/)).toBeTruthy();
    });

    it('advances to next question on Lanjut click', () => {
      render(<QuizShell {...defaultProps} questions={twoQuestions} />);
      fireEvent.click(screen.getByText('A1'));
      fireEvent.click(screen.getByText('Lanjut →'));
      expect(screen.getByText('Q2?')).toBeTruthy();
    });

    it('shows counter correctly on second question', () => {
      render(<QuizShell {...defaultProps} questions={twoQuestions} />);
      fireEvent.click(screen.getByText('A1'));
      fireEvent.click(screen.getByText('Lanjut →'));
      expect(screen.getByText('2 / 2')).toBeTruthy();
    });
  });

  describe('finish flow', () => {
    it('shows ResultScreen after answering last question and clicking Lihat Hasil', () => {
      const onFinish = vi.fn();
      render(<QuizShell {...defaultProps} onFinish={onFinish} />);
      fireEvent.click(screen.getByText('Perancah'));
      fireEvent.click(screen.getByText(/Lihat Hasil/));
      // ResultScreen shows percentage
      expect(screen.getByText('100%')).toBeTruthy();
    });

    it('calls onFinish with correct stats', () => {
      const onFinish = vi.fn();
      render(<QuizShell {...defaultProps} onFinish={onFinish} />);
      fireEvent.click(screen.getByText('Perancah')); // correct
      fireEvent.click(screen.getByText(/Lihat Hasil/));
      expect(onFinish).toHaveBeenCalledWith(
        expect.objectContaining({ correct: 1, total: 1 })
      );
    });

    it('calls onExit when ← Kembali is clicked on ResultScreen', () => {
      const onExit = vi.fn();
      render(<QuizShell {...defaultProps} onExit={onExit} />);
      fireEvent.click(screen.getByText('Perancah'));
      fireEvent.click(screen.getByText(/Lihat Hasil/));
      fireEvent.click(screen.getByText(/Kembali/));
      expect(onExit).toHaveBeenCalledOnce();
    });
  });

  describe('empty/edge cases', () => {
    it('returns null when questions array is empty', () => {
      const { container } = render(<QuizShell {...defaultProps} questions={[]} />);
      expect(container.firstChild).toBeNull();
    });

    it('renders without explanation if no explanation provided', () => {
      const q = makeQ({ explanation: undefined });
      render(<QuizShell {...defaultProps} questions={[q]} />);
      fireEvent.click(screen.getByText('Perancah'));
      // No explanation div — no crash
      expect(screen.getByText('Perancah')).toBeTruthy();
    });
  });
});
