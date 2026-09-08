// ─── tests/quiz-card-links.test.jsx ──────────────────────────────────────────
// Item 96. 0 of QUIZ_SETS' 980 questions carried a `related_card_id`, and three
// separate things depended on one: QuizShell's "Latih N salah" button, which
// assembles a deck from the cards behind the questions you missed;
// WaygroundMode, which never forwarded the prop to QuizShell at all; and
// VocabMode, which forwarded one that could never fire. All three read as a
// working feature from the prop map alone, which is exactly why it went
// unnoticed — nothing failed, a button simply never appeared.
//
// 305 links landed 2026-09-07 (the high-confidence tier of
// derive-quiz-card-links.mjs: a card headword of 4+ characters found in the
// question stem, from a headword carried by exactly one card). The other 675
// are deliberately still unlinked — a wrong link is worse than none, because it
// sends a learner to a card that does not teach the answer.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { QUIZ_SETS } from '../data/quiz-sets.js';
import { CARDS } from '../data/cards.js';
import QuizShell from '../components/QuizShell.jsx';

const cardIds = new Set(CARDS.map((c) => c.id));
const allQuestions = QUIZ_SETS.flatMap((s) => s.questions ?? []);
const linked = allQuestions.filter((q) => typeof q.related_card_id === 'number');

describe('QUIZ_SETS related_card_id', () => {
  it('links a meaningful share of the pool, and every link resolves', () => {
    // A floor rather than an exact number: the tier is derived, so re-running
    // the deriver after a content change may move it by a few either way. What
    // must not happen is the count silently returning toward zero.
    expect(linked.length).toBeGreaterThanOrEqual(250);
    for (const q of linked) {
      expect(cardIds.has(q.related_card_id), `q ${q.id} -> missing card`).toBe(true);
    }
  });

  it('leaves the rest unlinked rather than guessing', () => {
    // The point of the tiering. If this ever equals allQuestions.length, someone
    // shipped the medium and low tiers without reading them.
    expect(linked.length).toBeLessThan(allQuestions.length);
  });
});

describe('QuizShell — "Latih N salah" reaches the cards behind wrong answers', () => {
  const questions = [
    {
      question: '配管',
      options: [{ text: 'benar' }, { text: 'salah' }],
      correctIdx: 0,
      explanation: '',
      _cardId: 275,
    },
    {
      question: '電気',
      options: [{ text: 'benar' }, { text: 'salah' }],
      correctIdx: 0,
      explanation: '',
      _cardId: null,
    },
  ];

  function play(onRetryWrong) {
    render(
      <QuizShell
        questions={questions}
        onExit={() => {}}
        title="Tes"
        onFinish={() => {}}
        onRetryWrong={onRetryWrong}
      />
    );
    // Answer both wrong.
    for (let i = 0; i < questions.length; i++) {
      fireEvent.click(screen.getByText('salah'));
      const next = screen.queryByText(/Lanjut|Selesai|Lihat Hasil/);
      if (next) fireEvent.click(next);
    }
  }

  it('offers the deck for the wrong answers that have a card, and only those', () => {
    const onRetryWrong = vi.fn();
    play(onRetryWrong);
    const button = screen.queryByText(/Latih .* salah/);
    expect(button, 'retry button did not appear for a wrong answer with a card').toBeTruthy();
    fireEvent.click(button);
    // Question 2 was also wrong but carries no card id, so it must not appear
    // in the deck — a deck entry with no card is a dead link, not a lesson.
    expect(onRetryWrong).toHaveBeenCalledWith([275]);
  });
});
