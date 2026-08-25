// ─── tests/reset-progress.test.jsx ────────────────────────────────────────────
// item 15: FlashcardMode's reset button was wired to
// onMark('__RESET__', 'reset') — handleMark has no special case for that id,
// so it added the literal string '__RESET__' into the unknown set and left
// known/unknown otherwise untouched, despite the button's label promising
// "hapus semua progres". These tests cover the actual fix, resetKnownUnknown.
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, act, screen, fireEvent } from '@testing-library/react';
import { createElement } from 'react';
import { ProgressProvider, useProgress } from '../contexts/ProgressContext.jsx';
import { ToastProvider } from '../components/Toast.jsx';
import { ConfirmProvider } from '../components/ConfirmDialog.jsx';
import { AppProvider } from '../contexts/AppContext.jsx';
import { _reset_for_test } from '../storage/engine.js';
import FlashcardMode from '../modes/FlashcardMode/index.jsx';

beforeEach(() => {
  localStorage.clear();
  _reset_for_test();
});

function getCtx() {
  let ctx;
  render(
    createElement(ProgressProvider, null, createElement(Capture, { onCtx: (c) => (ctx = c) }))
  );
  return () => ctx;
}
function Capture({ onCtx }) {
  const ctx = useProgress();
  onCtx(ctx);
  return null;
}

describe('resetKnownUnknown', () => {
  it('clears known and unknown', () => {
    const get = getCtx();
    act(() => {
      get().handleMark('card-1', 'known');
      get().handleMark('card-2', 'unknown');
    });
    expect(get().known.size).toBe(1);
    expect(get().unknown.size).toBe(1);

    act(() => {
      get().resetKnownUnknown();
    });
    expect(get().known.size).toBe(0);
    expect(get().unknown.size).toBe(0);
  });

  it('does not add a stray sentinel entry the way the old broken call did', () => {
    const get = getCtx();
    act(() => {
      get().resetKnownUnknown();
    });
    expect(get().unknown.has('__RESET__')).toBe(false);
    expect(get().known.has('__RESET__')).toBe(false);
  });

  it('leaves starred, streak, and session history untouched — scoped to known/unknown only', () => {
    const get = getCtx();
    act(() => {
      get().toggleStar('card-9');
      get().handleMark('card-1', 'known');
      get().recordSession({ mode: 'kuis', correct: 5, total: 10, durationMs: 1000 });
    });
    const streakBefore = get().streakData?.days;
    const sessionsBefore = get().sessions.length;

    act(() => {
      get().resetKnownUnknown();
    });
    expect(get().starred.has('card-9')).toBe(true);
    expect(get().streakData?.days).toBe(streakBefore);
    expect(get().sessions.length).toBe(sessionsBefore);
  });
});

describe('FlashcardMode reset button — end to end', () => {
  const CARDS = [{ id: 1, jp: 'a', id_text: 'a', category: 'x', module: 'lifeline' }];

  it('a confirmed reset calls onResetProgress, not a bare onMark sentinel', async () => {
    const onResetProgress = vi.fn();
    const onMark = vi.fn();
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
            createElement(FlashcardMode, {
              cards: CARDS,
              known: new Set(),
              unknown: new Set(),
              onMark,
              onResetProgress,
              onExit: () => {},
              starred: new Set(),
              onToggleStar: () => {},
            })
          )
        )
      )
    );

    fireEvent.click(screen.getByLabelText('Reset semua progres belajar'));
    await act(async () => {
      fireEvent.click(screen.getByText('Reset'));
    });

    expect(onResetProgress).toHaveBeenCalledTimes(1);
    // The old bug's call shape — never happens now.
    expect(onMark).not.toHaveBeenCalledWith('__RESET__', 'reset');
  });

  it('cancelling the reset dialog calls neither', async () => {
    const onResetProgress = vi.fn();
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
            createElement(FlashcardMode, {
              cards: CARDS,
              known: new Set(),
              unknown: new Set(),
              onMark: () => {},
              onResetProgress,
              onExit: () => {},
              starred: new Set(),
              onToggleStar: () => {},
            })
          )
        )
      )
    );

    fireEvent.click(screen.getByLabelText('Reset semua progres belajar'));
    await act(async () => {
      fireEvent.click(screen.getByText('Batal'));
    });
    expect(onResetProgress).not.toHaveBeenCalled();
  });
});
