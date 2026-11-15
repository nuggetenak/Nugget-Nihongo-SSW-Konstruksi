// ─── tests/quiz-option-ruby-toggles.test.jsx ─────────────────────────────
// Tests for Item 216: Furigana ruby and Indonesian sub-text toggles on quiz
// answer option buttons, ResultScreen, and mode setup screens.
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import OptionButton from '../components/OptionButton.jsx';
import QuizShell from '../components/QuizShell.jsx';
import { mapQuestions } from '../modes/JACMode.jsx';
import { drawExam } from '../modes/SimulasiMode.jsx';

describe('Item 216: OptionButton ruby and sub-text', () => {
  it('renders ruby tags when rawText has 《》 markers and showFuri is true', () => {
    const { container } = render(
      <OptionButton
        idx={0}
        text="足場"
        rawText="足場《あしば》"
        subText="Perancah"
        showFuri={true}
        showSub={true}
        selected={null}
        isCorrect={false}
        onSelect={vi.fn()}
      />
    );
    const ruby = container.querySelector('ruby');
    expect(ruby).not.toBeNull();
    const rt = container.querySelector('rt');
    expect(rt).not.toBeNull();
    expect(rt?.textContent).toBe('あしば');
    expect(screen.getByText('Perancah')).toBeTruthy();
  });

  it('renders plain text when showFuri is false even if rawText has markers', () => {
    const { container } = render(
      <OptionButton
        idx={0}
        text="足場"
        rawText="足場《あしば》"
        subText="Perancah"
        showFuri={false}
        showSub={true}
        selected={null}
        isCorrect={false}
        onSelect={vi.fn()}
      />
    );
    expect(container.querySelector('ruby')).toBeNull();
    expect(screen.getByText('足場')).toBeTruthy();
    expect(screen.getByText('Perancah')).toBeTruthy();
  });

  it('hides subText when showSub is false', () => {
    render(
      <OptionButton
        idx={0}
        text="足場"
        rawText="足場《あしば》"
        subText="Perancah"
        showFuri={true}
        showSub={false}
        selected={null}
        isCorrect={false}
        onSelect={vi.fn()}
      />
    );
    expect(screen.queryByText('Perancah')).toBeNull();
  });
});

describe('Item 216: Question generators include rawText', () => {
  it('JACMode mapQuestions retains rawText on options', () => {
    const sample = [
      {
        q: '問題',
        opts: ['足場《あしば》', '土台《どだい》'],
        ans: 0,
        exp: '説明',
      },
    ];
    const mapped = mapQuestions(sample, true);
    const rawTexts = mapped[0].options.map((o) => o.rawText).sort();
    expect(rawTexts).toEqual(['土台《どだい》', '足場《あしば》']);
    const texts = mapped[0].options.map((o) => o.text).sort();
    expect(texts).toEqual(['土台', '足場']);
  });

  it('SimulasiMode drawExam retains rawText on opts', () => {
    const drawn = drawExam('jac', { count: 5 });
    expect(drawn.length).toBeGreaterThan(0);
    const firstOpt = drawn[0].opts[0];
    expect(firstOpt).toHaveProperty('rawText');
    expect(firstOpt).toHaveProperty('text');
  });
});

describe('Item 216: QuizShell toggles in header', () => {
  it('displays furigana and Indonesian toggles in the header', () => {
    const questions = [
      {
        question: '問題',
        options: [{ text: '足場', rawText: '足場《あしば》', sub: 'Perancah' }],
        correctIdx: 0,
      },
    ];
    render(
      <QuizShell
        questions={questions}
        onExit={vi.fn()}
        onAnswer={vi.fn()}
        onFinish={vi.fn()}
        autoNextDelay={0}
      />
    );

    const furiBtn = screen.getByTitle('Furigana pilihan jawaban');
    const idBtn = screen.getByTitle('Terjemahan Indonesia');
    expect(furiBtn).toBeTruthy();
    expect(idBtn).toBeTruthy();
    expect(furiBtn.textContent).toContain('ふ ON');
    expect(idBtn.textContent).toContain('ID ON');
  });
});
