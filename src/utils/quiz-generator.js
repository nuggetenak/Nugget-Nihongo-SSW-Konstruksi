// ─── Quiz Question Generator ─────────────────────────────────────────────────
// Generates multiple-choice questions from flashcard data

import { shuffle } from './shuffle.js';
import { getWrongCount } from './wrong-tracker.js';
import { CARDS } from '../data/cards.js';

/**
 * Generate quiz questions from a pool of flashcards.
 *
 * @param {Array} targetCards  - Cards to create questions from
 * @param {Array} allCards     - Full card pool for distractor selection
 * @param {string} difficulty  - "easy" | "medium" | "hard"
 * @param {Object} quizWrong   - Wrong-answer history {cardId: {count, lastWrong}}
 * @returns {Array} Array of { card, options: [{text, jp, romaji, correct}] }
 */
export function generateQuiz(targetCards, allCards, difficulty = 'medium', quizWrong = {}) {
  return shuffle(targetCards).map((card) => {
    const pool = (allCards || CARDS).filter((c) => c.id !== card.id);
    const sameCat = pool.filter((c) => c.category === card.category);
    const diffCat = pool.filter((c) => c.category !== card.category);

    let distractors;

    if (difficulty === 'easy') {
      // Easy: all distractors from clearly different categories
      distractors = shuffle(diffCat.length >= 3 ? diffCat : pool).slice(0, 3);
    } else if (difficulty === 'hard') {
      // Hard: same-category; prefer cards user has gotten wrong (surface past mistakes)
      const weakSameCat = sameCat.filter((c) => getWrongCount(quizWrong[c.id]) > 0);
      const hardPool = weakSameCat.length >= 3 ? weakSameCat : sameCat.length >= 3 ? sameCat : pool;
      distractors = shuffle(hardPool).slice(0, 3);
    } else {
      // Medium: 1 same-category + 2 different-category (balanced challenge)
      const samePick = sameCat.length >= 1 ? shuffle([...sameCat]).slice(0, 1) : [];
      const diffPick = shuffle(pool.filter((c) => !samePick.includes(c))).slice(
        0,
        3 - samePick.length
      );
      distractors = shuffle([...samePick, ...diffPick]);
    }

    const options = shuffle([
      { text: card.id_text, jp: card.jp, romaji: card.romaji, correct: true },
      ...distractors.map((c) => ({ text: c.id_text, jp: c.jp, romaji: c.romaji, correct: false })),
    ]);

    return { card, options };
  });
}
