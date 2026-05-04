// ─── tests/mission-overlay.test.jsx ───────────────────────────────────────────
// C.3: MissionCompleteOverlay renders, auto-dismisses, calls onDone.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
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
    expect(screen.getByText('Ketuk untuk tutup')).toBeTruthy();
  });

  it('has correct aria attributes', () => {
    render(<MissionCompleteOverlay />);
    const el = screen.getByRole('status');
    expect(el).toBeTruthy();
    expect(el.getAttribute('aria-live')).toBe('assertive');
  });

  it('calls onDone after 3 seconds', () => {
    const onDone = vi.fn();
    render(<MissionCompleteOverlay onDone={onDone} />);

    expect(onDone).not.toHaveBeenCalled();

    act(() => { vi.advanceTimersByTime(3000); });

    expect(onDone).toHaveBeenCalledTimes(1);
  });

  it('disappears from DOM after timeout', () => {
    const { container } = render(<MissionCompleteOverlay onDone={() => {}} />);
    expect(container.querySelector('[role="status"]')).toBeTruthy();

    act(() => { vi.advanceTimersByTime(3000); });

    expect(container.querySelector('[role="status"]')).toBeNull();
  });
});
