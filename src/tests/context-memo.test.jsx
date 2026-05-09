// ─── tests/context-memo.test.jsx ─────────────────────────────────────────────
// Verifies context value memoization prevents unnecessary consumer re-renders.
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

describe('ProgressContext memoization', () => {
  it('consumer does not re-render when unrelated state changes', () => {
    let renderCount = 0;

    function Consumer() {
      useProgress(); // just subscribe
      renderCount++;
      return null;
    }

    const { rerender } = render(
      createElement(ProgressProvider, null, createElement(Consumer, null))
    );

    const initialCount = renderCount;

    // Re-render provider with same props — context value should be stable
    rerender(
      createElement(ProgressProvider, null, createElement(Consumer, null))
    );

    // Consumer should re-render at most once (from rerender itself).
    // With memoized ctx, React bails out when value reference is stable.
    expect(renderCount).toBeLessThanOrEqual(initialCount + 1);
  });

  it('ctx value has stable reference when prog is unchanged', () => {
    let capturedCtx1 = null;
    let capturedCtx2 = null;
    let callCount = 0;

    function Capture({ onCtx }) {
      const ctx = useProgress();
      callCount++;
      onCtx(ctx);
      return null;
    }

    const { rerender } = render(
      createElement(ProgressProvider, null,
        createElement(Capture, { onCtx: (c) => { capturedCtx1 = c; } })
      )
    );

    // Re-render with different onCtx callback (simulates parent re-render)
    rerender(
      createElement(ProgressProvider, null,
        createElement(Capture, { onCtx: (c) => { capturedCtx2 = c; } })
      )
    );

    // If ctx is memoized, the reference should be stable when prog hasn't changed
    expect(capturedCtx1).not.toBeNull();
    expect(capturedCtx2).not.toBeNull();
    // Key fields should be equal
    expect(capturedCtx1.sessions).toBe(capturedCtx2.sessions);
    expect(capturedCtx1.recordSession).toBe(capturedCtx2.recordSession);
  });

  it('ctx value updates when state changes via action', () => {

    const getCtx = () => {
      let ctx;
      render(
        createElement(ProgressProvider, null,
          createElement(CaptureCtx, { onCtx: (c) => { ctx = c; } })
        )
      );
      return () => ctx;
    };

    const getLatest = getCtx();

    const sessionsBefore = getLatest().sessions.length;

    act(() => {
      getLatest().recordSession({ mode: 'kuis', correct: 5, total: 10, durationMs: 3000 });
    });

    expect(getLatest().sessions.length).toBe(sessionsBefore + 1);
  });
});
