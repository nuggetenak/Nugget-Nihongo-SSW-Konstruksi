// ─── tests/session-tracking.test.js ──────────────────────────────────────────
// Phase C: Session recording in ProgressContext.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect, beforeEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { createElement } from 'react';
import { _reset_for_test } from '../storage/engine.js';
import { ProgressProvider, useProgress } from '../contexts/ProgressContext.jsx';

beforeEach(() => {
  localStorage.clear();
  _reset_for_test();
});

function CaptureCtx({ onCtx }) {
  const ctx = useProgress();
  onCtx(ctx);
  return null;
}

function renderProgress() {
  let ctx;
  render(
    createElement(
      ProgressProvider,
      null,
      createElement(CaptureCtx, {
        onCtx: (c) => {
          ctx = c;
        },
      })
    )
  );
  return () => ctx;
}

describe('Phase C — Session Tracking', () => {
  it('sessions array starts empty', () => {
    const getCtx = renderProgress();
    expect(getCtx().sessions).toEqual([]);
  });

  it('recordSession adds a session with correct fields', () => {
    const getCtx = renderProgress();
    act(() => {
      getCtx().recordSession({ mode: 'kuis', correct: 7, total: 10, durationMs: 5000 });
    });
    const sessions = getCtx().sessions;
    expect(sessions.length).toBe(1);
    expect(sessions[0].mode).toBe('kuis');
    expect(sessions[0].correct).toBe(7);
    expect(sessions[0].total).toBe(10);
    expect(sessions[0].durationMs).toBe(5000);
    expect(sessions[0].date).toBeTruthy();
  });

  it('recordSession caps at 180 entries', () => {
    const getCtx = renderProgress();
    // Add 185 sessions
    act(() => {
      for (let i = 0; i < 185; i++) {
        getCtx().recordSession({ mode: 'kartu', correct: i, total: 10, durationMs: 1000 });
      }
    });
    expect(getCtx().sessions.length).toBe(180);
  });

  it('recordSession accumulates multiple calls', () => {
    const getCtx = renderProgress();
    act(() => {
      getCtx().recordSession({ mode: 'kuis', correct: 5, total: 10 });
      getCtx().recordSession({ mode: 'sprint', correct: 8, total: 20 });
    });
    expect(getCtx().sessions.length).toBe(2);
  });

  it('sessions from different modes are all recorded', () => {
    const getCtx = renderProgress();
    act(() => {
      getCtx().recordSession({ mode: 'kuis', correct: 5, total: 10 });
      getCtx().recordSession({ mode: 'jac', correct: 3, total: 5 });
    });
    const modes = getCtx().sessions.map((s) => s.mode);
    expect(modes).toContain('kuis');
    expect(modes).toContain('jac');
  });
});

// ─── Streak from sessions (2026-09-04) ───────────────────────────────────────
// Before this, handleMark was the only thing in the app that advanced
// streakData or dailyCount, so a learner who did SRS reviews or quizzes every
// day and never opened FlashcardMode showed a streak of 0. See advanceStudyDay
// in ProgressContext.jsx.
describe('study streak counts sessions, not just flashcard marks', () => {
  const today = () => new Date().toLocaleDateString('sv');

  it('a finished session starts the streak', () => {
    const getCtx = renderProgress();
    expect(getCtx().streakData.days ?? 0).toBe(0);
    act(() => {
      getCtx().recordSession({ mode: 'ulasan', correct: 8, total: 10, durationMs: 1000 });
    });
    expect(getCtx().streakData).toEqual({ days: 1, lastDate: today() });
  });

  it('a second session the same day does not double-count the streak', () => {
    const getCtx = renderProgress();
    act(() => {
      getCtx().recordSession({ mode: 'kuis', correct: 5, total: 10, durationMs: 1000 });
      getCtx().recordSession({ mode: 'jac', correct: 5, total: 10, durationMs: 1000 });
    });
    expect(getCtx().streakData.days).toBe(1);
  });

  it('an empty session does not advance the streak', () => {
    // This app has shipped a phantom 0/0 session before (ReviewMode logged one
    // just for opening the tab with nothing due). A streak that can be advanced
    // by opening a screen is worth less than one that cannot.
    const getCtx = renderProgress();
    act(() => {
      getCtx().recordSession({ mode: 'ulasan', correct: 0, total: 0, durationMs: 0 });
    });
    expect(getCtx().sessions.length).toBe(1);
    expect(getCtx().streakData.days ?? 0).toBe(0);
  });

  it('a session keeps dailyCount meaning "cards", not "sessions"', () => {
    const getCtx = renderProgress();
    act(() => {
      getCtx().handleMark(1, 'known');
      getCtx().recordSession({ mode: 'kuis', correct: 9, total: 10, durationMs: 1000 });
    });
    // One card marked, one session finished -> "+1 kartu hari ini", not +2.
    expect(getCtx().dailyCount).toEqual({ count: 1, date: today() });
  });
});
