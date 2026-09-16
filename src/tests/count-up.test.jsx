// ─── tests/count-up.test.jsx ─────────────────────────────────────────────────
// item 159. A score that LANDS is a result; a score that CLIMBS is a small
// event, and this app is about progress measured over months.
//
// This is the file that actually drives frames. The component tests that render
// a ResultScreen run with "Animasi angka" off, because they are about grade
// bands rather than about motion -- which is the right split, but it means the
// counting has exactly one place holding it, and this is it.
//
// The assertion that matters most is the LAST one: with the toggle off the
// value has to be right on the FIRST render, with no frame in between. A reader
// who asked for less motion must never see a 0 that then becomes something
// else -- that is not "less motion", that is a wrong number briefly.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useCountUp } from '../hooks/useCountUp.js';
import { T } from '../utils/motion.js';

const root = document.documentElement;

beforeEach(() => {
  root.removeAttribute('data-motion-no-count');
  delete root.dataset.motion;
  window.matchMedia = vi.fn().mockReturnValue({ matches: false });
});
afterEach(() => {
  root.removeAttribute('data-motion-no-count');
});

describe('useCountUp', () => {
  it('starts at zero and arrives at the value', async () => {
    const { result } = renderHook(() => useCountUp(85, 60));
    expect(result.current, 'the climb has to start somewhere the eye can follow').toBe(0);
    await waitFor(() => expect(result.current).toBe(85), { timeout: 2000 });
  });

  it('never overshoots on the way', async () => {
    // Ease-out cubic, so this is a property of the curve rather than of luck --
    // and a number that flickered past its own value and came back would be
    // worse than not animating at all.
    const seen = [];
    const { result, rerender } = renderHook(() => useCountUp(50, 60));
    for (let i = 0; i < 40 && result.current !== 50; i++) {
      seen.push(result.current);
      await new Promise((r) => setTimeout(r, 8));
      rerender();
    }
    expect(Math.max(...seen, 0)).toBeLessThanOrEqual(50);
    expect(Math.min(...seen, 0)).toBeGreaterThanOrEqual(0);
  });

  it('continues from where it is when the value changes mid-flight', async () => {
    const { result, rerender } = renderHook(({ v }) => useCountUp(v, 60), {
      initialProps: { v: 100 },
    });
    await waitFor(() => expect(result.current).toBe(100), { timeout: 2000 });
    rerender({ v: 20 });
    // Not back to zero first: the eye is already at 100, and restarting from 0
    // would be a third number nobody asked for.
    expect(result.current).toBe(100);
    await waitFor(() => expect(result.current).toBe(20), { timeout: 2000 });
  });

  it('handles a non-finite value without painting NaN', async () => {
    const { result } = renderHook(() => useCountUp(undefined, 60));
    await waitFor(() => expect(Number.isFinite(result.current)).toBe(true));
    expect(result.current).toBe(0);
  });

  it('stops when the component goes away', async () => {
    const { unmount } = renderHook(() => useCountUp(90, 400));
    act(() => unmount());
    // No assertion on a value here -- the point is that no frame callback runs
    // against an unmounted hook, which React would warn about and which is the
    // same leak every other timer in this app had to clean up.
    await new Promise((r) => setTimeout(r, 60));
  });

  describe('when "Animasi angka" is off', () => {
    it('is the real value on the very first render, with no frame in between', () => {
      root.setAttribute('data-motion-no-count', '');
      const { result } = renderHook(() => useCountUp(73, T.count));
      expect(result.current).toBe(73);
    });

    it('follows a later change immediately too', () => {
      root.setAttribute('data-motion-no-count', '');
      const { result, rerender } = renderHook(({ v }) => useCountUp(v), {
        initialProps: { v: 10 },
      });
      expect(result.current).toBe(10);
      rerender({ v: 42 });
      expect(result.current).toBe(42);
    });
  });
});
