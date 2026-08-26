// ─── tests/simulasi-scoring.test.js ───────────────────────────────────────────
// buildSimulasiResults (item 48) — correctness of the scoring itself, since
// this is the one part of the redesign where a bug would silently mislead
// someone about their own exam readiness.
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { buildSimulasiResults } from '../utils/simulasi-scoring.js';

const questions = [
  { jp: 'A', id_text: 'a', opts: [{ text: 'x' }, { text: 'y' }], correctIdx: 0 },
  { jp: 'B', id_text: 'b', opts: [{ text: 'x' }, { text: 'y' }], correctIdx: 1 },
  { jp: 'C', id_text: 'c', opts: [{ text: 'x' }, { text: 'y' }], correctIdx: 0 },
];

describe('buildSimulasiResults', () => {
  it('marks a correctly-answered question as correct', () => {
    const answers = { 0: { selectedIdx: 0, isCorrect: true } };
    const results = buildSimulasiResults(questions, answers);
    expect(results[0].isCorrect).toBe(true);
  });

  it('marks a wrongly-answered question as wrong', () => {
    const answers = { 0: { selectedIdx: 1, isCorrect: false } };
    const results = buildSimulasiResults(questions, answers);
    expect(results[0].isCorrect).toBe(false);
  });

  it('treats an unanswered question as wrong, not skipped or excused', () => {
    const answers = {}; // nothing answered
    const results = buildSimulasiResults(questions, answers);
    expect(results).toHaveLength(3);
    expect(results.every((r) => r.isCorrect === false)).toBe(true);
    expect(results.every((r) => r.userIdx === null)).toBe(true);
  });

  it('returns exactly one entry per question, in question order -- not answer order', () => {
    // Answered out of order (2 first, then 0), which free navigation allows.
    const answers = {
      2: { selectedIdx: 0, isCorrect: true },
      0: { selectedIdx: 0, isCorrect: true },
    };
    const results = buildSimulasiResults(questions, answers);
    expect(results).toHaveLength(3);
    expect(results[0].jp).toBe('A');
    expect(results[1].jp).toBe('B'); // question 1 (index 1), unanswered
    expect(results[2].jp).toBe('C');
    expect(results[1].isCorrect).toBe(false);
    expect(results[1].userIdx).toBeNull();
  });

  it('recomputes isCorrect from selectedIdx vs. correctIdx rather than trusting a stale flag', () => {
    // If an answer's stored isCorrect were ever wrong/stale relative to
    // selectedIdx, the rebuild should still get it right from the indices.
    const answers = { 1: { selectedIdx: 1, isCorrect: false } }; // stale flag, wrong
    const results = buildSimulasiResults(questions, answers);
    expect(results[1].isCorrect).toBe(true); // question 1's correctIdx is 1
  });

  it('reflects a changed answer (re-selecting), not the first one given', () => {
    // Simulates the free-navigation "change your mind" flow: only the
    // latest entry in the answers dict for a given question exists.
    const answers = { 0: { selectedIdx: 1, isCorrect: false } }; // changed from 0 to 1
    const results = buildSimulasiResults(questions, answers);
    expect(results[0].userIdx).toBe(1);
    expect(results[0].isCorrect).toBe(false);
  });

  it('preserves review-relevant fields for the results screen', () => {
    const richQuestions = [
      {
        jp: '漢字',
        id_text: 'kanji',
        opts: [{ text: 'a' }, { text: 'b' }],
        correctIdx: 0,
        explanation: 'karena begini',
        _source: 'jac',
        _setLabel: 'JAC 2024',
      },
    ];
    const results = buildSimulasiResults(richQuestions, {});
    expect(results[0]).toMatchObject({
      jp: '漢字',
      id_text: 'kanji',
      explanation: 'karena begini',
      _source: 'jac',
      _setLabel: 'JAC 2024',
    });
  });
});
