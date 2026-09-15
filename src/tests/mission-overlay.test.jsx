// ─── tests/mission-overlay.test.jsx ───────────────────────────────────────────
// C.3: MissionCompleteOverlay renders, auto-dismisses, calls onDone.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { readFileSync } from 'fs';
import { resolve } from 'path';

vi.mock('../utils/haptic.js', () => ({
  haptic: { tap: vi.fn(), correct: vi.fn(), wrong: vi.fn(), success: vi.fn(), flip: vi.fn() },
}));
import { haptic } from '../utils/haptic.js';
import MissionCompleteOverlay from '../components/MissionCompleteOverlay.jsx';

describe('C.3 MissionCompleteOverlay', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders celebration text', () => {
    render(<MissionCompleteOverlay />);
    expect(screen.getByText('Misi Selesai!')).toBeTruthy();
    expect(screen.getByText(/Ketuk atau tekan Esc untuk tutup/)).toBeTruthy();
  });

  it('has correct aria attributes', () => {
    // alertdialog, not status (item 172). It is a full-screen blocker at the
    // app's highest z-index, and GlobalKeyboardLayer's isDialogOpen() matches
    // [role="dialog"], [role="alertdialog"] -- under role="status" it matched
    // neither, so Escape still exited the mode and 1/2/3 still switched tabs
    // behind an overlay that was covering the whole screen.
    render(<MissionCompleteOverlay />);
    const el = screen.getByRole('alertdialog');
    expect(el).toBeTruthy();
    expect(el.getAttribute('aria-live')).toBe('assertive');
    expect(el.getAttribute('aria-modal')).toBe('true');
  });

  it('calls onDone after 3 seconds', () => {
    const onDone = vi.fn();
    render(<MissionCompleteOverlay onDone={onDone} />);

    expect(onDone).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('disappears from DOM after timeout', () => {
    const { container } = render(<MissionCompleteOverlay onDone={() => {}} />);
    expect(container.querySelector('[role="alertdialog"]')).toBeTruthy();

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(container.querySelector('[role="alertdialog"]')).toBeNull();
  });
});

// ─── The reward has to survive the two settings that were removing it ────────
describe('MissionCompleteOverlay — keyboard and reduced motion (items 153, 172)', () => {
  beforeEach(() => {
    vi.clearAllMocks(); // the haptic mock is module-level; renders accumulate on it
    vi.useFakeTimers();
  });
  afterEach(() => vi.useRealTimers());

  it('Escape dismisses it', () => {
    const onDone = vi.fn();
    const { container } = render(<MissionCompleteOverlay onDone={onDone} />);
    act(() => {
      fireEvent.keyDown(window, { key: 'Escape' });
    });
    expect(onDone).toHaveBeenCalledTimes(1);
    expect(container.querySelector('[role="alertdialog"]')).toBeNull();
  });

  it('Enter dismisses it too', () => {
    const onDone = vi.fn();
    render(<MissionCompleteOverlay onDone={onDone} />);
    act(() => {
      fireEvent.keyDown(window, { key: 'Enter' });
    });
    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('fires the success haptic — its first call site anywhere', () => {
    // DESIGN_SPEC §4 has carried `haptic.success()` as defined-and-unused since
    // item 21, flagging rather than guessing because choosing a first use was a
    // product call. The one celebration in the app is that place.
    render(<MissionCompleteOverlay onDone={() => {}} />);
    expect(haptic.success).toHaveBeenCalledTimes(1);
  });

  it('carries its animation in a stylesheet, not an inline style', () => {
    // The actual defect behind item 153, asserted where it can be seen. The
    // animation ends at opacity 0 and runs `forwards`; the global reduced-motion
    // catch-all zeroes animation-duration, which for an animation like that
    // jumps it to the end rather than disabling it. So the celebration rendered
    // fully transparent for its whole life to anyone asking for less motion.
    // `animation: none` is the only spelling that stops it, and a rule cannot
    // reach an inline style — so "it is in the stylesheet" IS the fix.
    const src = readFileSync(
      resolve(process.cwd(), 'src/components/MissionCompleteOverlay.jsx'),
      'utf8'
    );
    expect(src, 'the animation moved back inline').not.toMatch(/animation:\s*'/);

    const css = readFileSync(
      resolve(process.cwd(), 'src/components/MissionCompleteOverlay.module.css'),
      'utf8'
    );
    expect(css).toMatch(/prefers-reduced-motion: reduce/);
    expect(css).toMatch(/animation:\s*none/);
  });
});

// ─── item 161: the celebration it is named for ───────────────────────────────
// It was a plain fade that reduced-motion readers could not see at all. The
// rebuild spends --z-celebration and --t-slow, both reserved for this moment and
// never used on it, plus haptic.success() -- and the two decorative layers are
// NOT RENDERED when the reader has switched celebrations off, rather than
// rendered and hidden.
describe('161 — the celebration layers', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });
  afterEach(() => {
    vi.useRealTimers();
    document.documentElement.removeAttribute('data-motion-no-celebrate');
    document.documentElement.removeAttribute('data-motion-no-count');
  });

  const sparks = () => document.querySelectorAll('[class*="spark"]').length;
  const sweeps = () => document.querySelectorAll('[class*="sweep"]').length;

  it('draws the hazard sweep and a twelve-point spark ring', () => {
    render(<MissionCompleteOverlay result={{ correct: 8, total: 10 }} />);
    expect(sweeps()).toBe(1);
    expect(sparks(), 'twelve is where a ring reads as a ring').toBe(12);
  });

  it('renders neither when the reader has celebrations off', () => {
    // Not hidden — absent. Twelve elements that can never be seen are still
    // twelve elements, and this is the toggle that says so.
    document.documentElement.setAttribute('data-motion-no-celebrate', '');
    // The score is a separate toggle ("Animasi angka"), and it stays on here on
    // purpose -- turning celebrations off must not silently take the counting
    // with it. Switched off only so the assertion below can read an exact
    // number under fake timers, where no frame ever runs.
    document.documentElement.setAttribute('data-motion-no-count', '');
    render(<MissionCompleteOverlay result={{ correct: 8, total: 10 }} />);
    expect(sweeps()).toBe(0);
    expect(sparks()).toBe(0);
    // The overlay itself still does its job.
    expect(screen.getByText('Misi Selesai!')).toBeTruthy();
    expect(screen.getByText(/8\/10 benar/)).toBeTruthy();
  });

  it('still fires the success haptic, which has no other call site in the app', () => {
    render(<MissionCompleteOverlay result={{ correct: 3, total: 3 }} />);
    expect(haptic.success).toHaveBeenCalledTimes(1);
  });
});
