// ─── tests/session-tracking.test.js ──────────────────────────────────────────
// Phase C: Session recording in ProgressContext.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect, beforeEach } from 'vitest';
import { render, act } from "@testing-library/react";
import { createElement } from "react";
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
    createElement(ProgressProvider, null,
      createElement(CaptureCtx, { onCtx: (c) => { ctx = c; } })
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

  it('recordSession caps at 90 entries', () => {
    const getCtx = renderProgress();
    // Add 95 sessions
    act(() => {
      for (let i = 0; i < 95; i++) {
        getCtx().recordSession({ mode: 'kartu', correct: i, total: 10, durationMs: 1000 });
      }
    });
    expect(getCtx().sessions.length).toBe(90);
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
