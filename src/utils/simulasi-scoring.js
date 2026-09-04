// ─── simulasi-scoring.js ──────────────────────────────────────────────────
// Item 48 (2026-08-26): SimulasiMode's scoring logic, extracted into a pure
// function so it's testable without rendering the component. This is the
// one part of the free-navigation/deferred-scoring redesign where a subtle
// bug (an off-by-one, wrong blank-answer handling) wouldn't just look
// wrong -- it would silently tell someone the wrong thing about their own
// exam readiness, which matters more than most UI bugs in this app.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Build the final scored results array from a question set and the answers
 * given so far. An unanswered question counts as wrong -- matching how a
 * real exam treats a blank: no credit, not "not counted."
 *
 * @param {Array} questions - each with { jp, id_text, opts, correctIdx,
 *   explanation, _source, _setLabel, _category, _cardId }
 * @param {Object} answers - { [questionIndex]: { selectedIdx, isCorrect } }
 * @returns {Array} one entry per question, in question order (not answer
 *   order -- important, since free navigation means these can differ)
 */
export function buildSimulasiResults(questions, answers) {
  return questions.map((question, i) => {
    const a = answers[i];
    return {
      isCorrect: a ? a.selectedIdx === question.correctIdx : false,
      jp: question.jp,
      id_text: question.id_text,
      opts: question.opts,
      correctIdx: question.correctIdx,
      userIdx: a ? a.selectedIdx : null,
      explanation: question.explanation,
      _source: question._source,
      _setLabel: question._setLabel,
      // Carried so the results screen can break down teori vs praktik (the
      // only breakdown with meaningful sample sizes on a 50-question draw
      // spread across ~34 sets) and can send genuinely-wrong questions to
      // their linked flashcards. Both are null for sources that don't have
      // them -- JAC Official questions have no teori/praktik tagging, and
      // no Wayground/JAC-Mockup question has a related card.
      _category: question._category ?? null,
      _cardId: question._cardId ?? null,
    };
  });
}
