// ─── tests/question-origin.test.jsx ──────────────────────────────────────────
// Item 106. A learner answering a question could not tell the official JAC
// book's own wording from practice material written to drill them. On an
// exam-prep app that is a trust question: "this is what the exam asked" and
// "this is what we wrote" deserve different weight, and looked identical.
//
// The distinction was in the data the whole time — JAC_OFFICIAL on one side,
// and QUIZ_SETS' `source` field naming `jac-mockup` apart from the six
// `wayground-*` sources on the other. Nothing carried it through.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { createElement } from 'react';
import { ConfirmProvider } from '../components/ConfirmDialog.jsx';
import { ToastProvider } from '../components/Toast.jsx';
import { AppProvider } from '../contexts/AppContext.jsx';
import { ProgressProvider } from '../contexts/ProgressContext.jsx';
import { _reset_for_test } from '../storage/engine.js';
import SimulasiMode, { buildJacPool, buildQuizSetsPool } from '../modes/SimulasiMode.jsx';
import { originForSet, originMeta, ORIGIN_META } from '../utils/question-origin.js';
import { QUIZ_SETS } from '../data/quiz-sets.js';

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  _reset_for_test();
});

describe('question origin (item 106)', () => {
  it('separates the official book from mockups and from practice', () => {
    expect(originForSet('jac-mockup')).toBe('mockup');
    expect(originForSet('wayground-teori')).toBe('latihan');
    expect(originForSet('wayground-quizizz')).toBe('latihan');
    expect(originForSet(undefined)).toBe('latihan');
  });

  it('falls back to the most modest claim for an unknown tier', () => {
    // Overclaiming is the failure that matters here: an unlabelled question
    // must never read as official.
    expect(originMeta('nonsense')).toBe(ORIGIN_META.latihan);
  });

  it('every JAC Official question is marked as the book itself', () => {
    const pool = buildJacPool();
    expect(pool.length).toBeGreaterThan(0);
    expect(pool.every((q) => q._origin === 'resmi')).toBe(true);
  });

  it('the mixed pool distinguishes its two kinds, and claims neither is official', () => {
    const pool = buildQuizSetsPool();
    const kinds = new Set(pool.map((q) => q._origin));
    expect(kinds).toEqual(new Set(['mockup', 'latihan']));
    // The pool draws from QUIZ_SETS, and no QUIZ_SETS question is from the book.
    expect(pool.every((q) => q._origin !== 'resmi')).toBe(true);
  });

  it('agrees with the set-level source field for every question', () => {
    const pool = buildQuizSetsPool();
    for (const set of QUIZ_SETS) {
      const inPool = pool.filter((q) => q._setLabel === set.title);
      if (!inPool.length) continue;
      expect(inPool.every((q) => q._origin === originForSet(set.source))).toBe(true);
    }
  });

  it('shows the badge on the question being answered', async () => {
    render(
      createElement(
        ToastProvider,
        null,
        createElement(
          ConfirmProvider,
          null,
          createElement(
            AppProvider,
            null,
            createElement(
              ProgressProvider,
              null,
              createElement(SimulasiMode, {
                onExit: vi.fn(),
                onSessionEnd: vi.fn(),
                onRetryWrong: vi.fn(),
              })
            )
          )
        )
      )
    );
    await act(async () => fireEvent.click(screen.getByText('Mulai Simulasi 🎯')));
    const badge = document.querySelector('[class*="originBadge"]');
    expect(badge).toBeTruthy();
    expect(badge.textContent).toMatch(/Mockup|Latihan|Resmi/);
  });
});
