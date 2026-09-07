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
 * @param {Set<number>|Array<number>} flagged - question indexes the user marked
 *   for review (item 101). Optional; an exam with none behaves as before.
 * @returns {Array} one entry per question, in question order (not answer
 *   order -- important, since free navigation means these can differ)
 */
export function buildSimulasiResults(questions, answers, flagged) {
  const marked = flagged instanceof Set ? flagged : new Set(flagged ?? []);
  return questions.map((question, i) => {
    const a = answers[i];
    return {
      // Item 100: the review list carried no question number, so a row could
      // not be matched back to the navigator you had just been staring at --
      // "the third one down" is not an identifier. 1-based, because that is
      // what the navigator and the "Soal 7 / 15" counter both show.
      number: i + 1,
      // Item 101: whether it was flagged, so the review can say so. A flag you
      // can set but never see again teaches nothing.
      wasFlagged: marked.has(i),
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
      // Item 93: how this question is identified in the store its own source
      // already uses — see recordSimulasiMistakes.
      _wrongKey: question._wrongKey ?? null,
    };
  });
}
