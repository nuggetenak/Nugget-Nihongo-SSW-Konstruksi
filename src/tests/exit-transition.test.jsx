// ─── tests/exit-transition.test.jsx ───────────────────────────────────────────
// item 148. Every overlay in this app entered and then VANISHED, and giving them
// an exit is a change to WHEN a parent is told to unmount them -- which is a
// change to timing, which is the class of thing that breaks silently.
//
// The rule these tests exist to pin, in one sentence: AN ANIMATION MAY NEVER
// DELAY AN ACTION THE USER HAS TAKEN; IT IS ALLOWED TO OUTLIVE IT. The first
// attempt at this hook had it backwards -- ConfirmDialog routed the ANSWER
// through the exit, so a destructive confirmation took 120ms to do the thing you
// had just confirmed, and sixteen tests across six files were right to object.
// The ordering half of the rule is asserted in ConfirmDialog.test.jsx and
// Toast.test.jsx, where the actions actually live; this file holds the timing.
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useExitTransition } from '../hooks/useExitTransition.js';
import { T } from '../utils/motion.js';

describe('useExitTransition', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    delete document.documentElement.dataset.motion;
  });

  it('starts open: not closing, nothing called', () => {
    const onClose = vi.fn();
    const { result } = renderHook(() => useExitTransition(onClose));
    expect(result.current.closing).toBe(false);
    expect(onClose).not.toHaveBeenCalled();
  });

  it('flags closing immediately but holds onClose until the exit has played', () => {
    const onClose = vi.fn();
    const { result } = renderHook(() => useExitTransition(onClose));

    act(() => result.current.requestClose());
    // The element needs `data-closing` on the very next frame -- that attribute
    // IS the animation. The parent must not have been told yet.
    expect(result.current.closing).toBe(true);
    expect(onClose).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(T.fast + 1);
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('honours a custom duration', () => {
    const onClose = vi.fn();
    const { result } = renderHook(() => useExitTransition(onClose, T.enter));

    act(() => result.current.requestClose());
    act(() => {
      vi.advanceTimersByTime(T.fast + 1);
    });
    expect(onClose, 'still mid-exit at the default rung').not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(T.enter);
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('closes once however many times it is asked', () => {
    // Not hypothetical: a backdrop click and an Escape can both land inside the
    // exit window, and for ConfirmDialog a second close means resolving the same
    // promise twice.
    const onClose = vi.fn();
    const { result } = renderHook(() => useExitTransition(onClose));

    act(() => {
      result.current.requestClose();
      result.current.requestClose();
      result.current.requestClose();
    });
    act(() => {
      vi.advanceTimersByTime(T.fast + 1);
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('unmounting mid-exit does not fire onClose afterwards', () => {
    // The same leak ReviewMode's advance timer needed cleaning up: a timer left
    // holding a callback on a component that is gone.
    const onClose = vi.fn();
    const { result, unmount } = renderHook(() => useExitTransition(onClose));

    act(() => result.current.requestClose());
    unmount();
    act(() => {
      vi.advanceTimersByTime(T.fast + 1);
    });
    expect(onClose).not.toHaveBeenCalled();
  });

  describe('when motion is off', () => {
    it('closes synchronously and never flags closing', () => {
      // The fallback for "no animation" has to be the INSTANT behaviour these
      // overlays already had -- not a silent 120ms pause where an animation
      // would have been. A reader who asked for less motion must not be given
      // a slower app as the price.
      document.documentElement.dataset.motion = 'mati';
      const onClose = vi.fn();
      const { result } = renderHook(() => useExitTransition(onClose));

      act(() => result.current.requestClose());
      expect(onClose).toHaveBeenCalledTimes(1);
      expect(result.current.closing).toBe(false);
    });

    it('still closes only once', () => {
      document.documentElement.dataset.motion = 'mati';
      const onClose = vi.fn();
      const { result } = renderHook(() => useExitTransition(onClose));

      act(() => {
        result.current.requestClose();
        result.current.requestClose();
      });
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});
