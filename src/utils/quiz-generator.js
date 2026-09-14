// ─── Quiz Question Generator ─────────────────────────────────────────────────
// Generates multiple-choice questions from flashcard data

import { shuffle } from './shuffle.js';
import { getWrongCount } from './wrong-tracker.js';
import { CARDS } from '../data/cards.js';

/** Option texts compare case- and whitespace-insensitively: two glosses that
 *  differ only in trailing space are the same option to a learner reading them. */
const norm = (s) =>
  String(s ?? '')
    .trim()
    .toLowerCase();

/**
 * Generate quiz questions from a pool of flashcards.
 *
 * @param {Array} targetCards  - Cards to create questions from
 * @param {Array} allCards     - Full card pool for distractor selection
 * @param {string} difficulty  - "easy" | "medium" | "hard"
 * @param {Object} quizWrong   - Wrong-answer history {cardId: {count, lastWrong}}
 * @returns {Array} Array of { card, options: [{text, jp, correct}] }
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
      const picked = new Set(samePick);
      const diffPick = shuffle(pool.filter((c) => !picked.has(c))).slice(0, 3 - samePick.length);
      distractors = shuffle([...samePick, ...diffPick]);
    }

    // Deduplicated by option *text*, not by card identity.
    //
    // Every branch above picks distinct cards, which is not the same guarantee:
    // two cards with the same Indonesian gloss would put the same string in two
    // slots, and one of those two is marked wrong — so the learner taps a correct
    // answer and is told they are wrong, with no way to tell why. Worse if the
    // collision is with the *correct* card's own gloss, which is two right answers
    // and one of them scored against them.
    //
    // Measured before writing this: all 1,626 cards currently have distinct
    // `id_text`, so nothing is reachable today, and `audit-integrity.mjs` now
    // asserts that so it stays true. This is the belt to that braces — the audit
    // protects the corpus, this protects the generator against a pool it was
    // handed (callers pass their own `allCards`).
    const seen = new Set([norm(card.id_text)]);
    const uniqueDistractors = [];
    for (const c of distractors) {
      const key = norm(c.id_text);
      if (seen.has(key)) continue;
      seen.add(key);
      uniqueDistractors.push(c);
    }

    const options = shuffle([
      { text: card.id_text, jp: card.jp, correct: true },
      ...uniqueDistractors.map((c) => ({ text: c.id_text, jp: c.jp, correct: false })),
    ]);

    return { card, options };
  });
}
