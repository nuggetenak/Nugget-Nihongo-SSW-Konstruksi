import { describe, it, expect } from 'vitest';
import { generateQuiz } from '../utils/quiz-generator.js';
import { CARDS } from '../data/cards.js';

// Use a small stable slice for deterministic-enough testing
const SAMPLE = CARDS.slice(0, 30);
const ALL = CARDS;

describe('generateQuiz', () => {
  it('returns same number of questions as input cards', () => {
    const qs = generateQuiz(SAMPLE.slice(0, 5), ALL, 'medium');
    expect(qs).toHaveLength(5);
  });

  it('each question has card + exactly 4 options', () => {
    const qs = generateQuiz(SAMPLE.slice(0, 5), ALL, 'medium');
    qs.forEach((q) => {
      expect(q.card).toBeDefined();
      expect(q.options).toHaveLength(4);
    });
  });

  it('exactly one correct option per question', () => {
    const qs = generateQuiz(SAMPLE.slice(0, 10), ALL, 'medium');
    qs.forEach((q) => {
      const correct = q.options.filter((o) => o.correct);
      expect(correct).toHaveLength(1);
    });
  });

  it('correct option text matches the card id_text', () => {
    const qs = generateQuiz(SAMPLE.slice(0, 10), ALL, 'medium');
    qs.forEach((q) => {
      const correct = q.options.find((o) => o.correct);
      expect(correct.text).toBe(q.card.id_text);
    });
  });

  it('no duplicate options within a question', () => {
    const qs = generateQuiz(SAMPLE.slice(0, 10), ALL, 'medium');
    qs.forEach((q) => {
      const texts = q.options.map((o) => o.text);
      expect(new Set(texts).size).toBe(texts.length);
    });
  });

  it('handles easy difficulty', () => {
    const qs = generateQuiz(SAMPLE.slice(0, 5), ALL, 'easy');
    expect(qs).toHaveLength(5);
    qs.forEach((q) => expect(q.options).toHaveLength(4));
  });

  it('handles hard difficulty', () => {
    const qs = generateQuiz(SAMPLE.slice(0, 5), ALL, 'hard');
    expect(qs).toHaveLength(5);
    qs.forEach((q) => expect(q.options).toHaveLength(4));
  });

  it('returns empty array for empty input', () => {
    expect(generateQuiz([], ALL, 'medium')).toEqual([]);
  });

  it('uses quizWrong to prefer wrong-history cards in hard mode', () => {
    // Just verifies it doesn't throw when quizWrong is provided
    const wrongMap = { [CARDS[50].id]: { count: 3, lastWrong: Date.now() } };
    expect(() => generateQuiz(SAMPLE.slice(0, 5), ALL, 'hard', wrongMap)).not.toThrow();
  });
});
