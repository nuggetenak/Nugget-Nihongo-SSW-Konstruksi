// ─── tests/mode-counts.test.js ───────────────────────────────────────────────
// UI_UX_PLAN item 131 — the guard that lets the menu counts be literals.
//
// router/modes.js derived these from QUIZ_SETS, which was right about drift and
// wrong about where: modes.js is statically imported by App.jsx and
// AppContext.jsx, so the quiz barrel put wayground-sets.js (481 kB) and
// jac-mockup-sets.js (226 kB) on the critical path of every first page view --
// modulepreloaded from index.html, before onboarding renders -- to produce two
// integers.
//
// So the counts are literals in constants.js and this test is what keeps them
// honest. A test may import 707 kB of question data; a bundle entry may not.
// Both numbers were hand-written once before and both went stale, which is the
// whole reason they were derived in the first place.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { QUIZ_SETS } from '../data/quiz-sets.js';
import { isVocabId } from '../utils/quiz-classification.js';
import { QUIZ_QUESTION_COUNTS } from '../utils/constants.js';
import { MODE_META } from '../router/modes.js';

const count = (sets) => sets.reduce((n, s) => n + s.questions.length, 0);

describe('the question counts the menu quotes', () => {
  it('matches the real Wayground bank', () => {
    const real = count(QUIZ_SETS.filter((s) => !isVocabId(s.id)));
    expect(
      QUIZ_QUESTION_COUNTS.wayground,
      `Wayground has ${real} questions — update QUIZ_QUESTION_COUNTS in src/utils/constants.js`
    ).toBe(real);
  });

  it('matches the real vocab bank', () => {
    const real = count(QUIZ_SETS.filter((s) => isVocabId(s.id)));
    expect(
      QUIZ_QUESTION_COUNTS.vocab,
      `Vocab has ${real} questions — update QUIZ_QUESTION_COUNTS in src/utils/constants.js`
    ).toBe(real);
  });

  it('is what the menu labels actually print', () => {
    expect(MODE_META.wayground.desc).toContain(String(QUIZ_QUESTION_COUNTS.wayground));
    expect(MODE_META.vocab.desc).toContain(String(QUIZ_QUESTION_COUNTS.vocab));
  });

  it('keeps the registry out of the question data', () => {
    // The actual invariant. If a future edit reaches for QUIZ_SETS here again,
    // the 707 kB comes back with it and nothing else would notice.
    const text = readFileSync(resolve(process.cwd(), 'src/router/modes.js'), 'utf8');
    expect(text).not.toMatch(/from '\.\.\/data\//);
  });
});
