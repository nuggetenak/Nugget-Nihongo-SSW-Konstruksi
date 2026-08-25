// ─── tests/motion-haptics.test.jsx ────────────────────────────────────────────
// item 21: AngkaMode, DangerMode, and SimulasiMode hand-roll their own answer
// UI and had zero haptic feedback -- not a different pattern from the rest of
// the app, no pattern at all. Also covers the destructive-confirm haptic the
// plan asked for, and the prefers-reduced-motion guard on BottomNav's
// JS-invoked View Transition (a CSS catch-all can't reach that).
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import { createElement } from 'react';

vi.mock('../utils/haptic.js', () => ({
  haptic: { tap: vi.fn(), correct: vi.fn(), wrong: vi.fn(), success: vi.fn(), flip: vi.fn() },
}));

import { haptic } from '../utils/haptic.js';
import BottomNav from '../components/BottomNav.jsx';
import { ConfirmProvider, useConfirm } from '../components/ConfirmDialog.jsx';

vi.mock('../components/BottomNav.module.css', () => ({
  default: new Proxy({}, { get: (_, key) => key }),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('BottomNav — reduced-motion guard on JS-driven transition (item 21)', () => {
  it('uses startViewTransition when available and reduced-motion is not preferred', () => {
    const svt = vi.fn((cb) => cb());
    document.startViewTransition = svt;
    window.matchMedia = vi.fn().mockReturnValue({ matches: false });
    const onChange = vi.fn();

    render(<BottomNav active="home" onChange={onChange} dueBadge={0} />);
    fireEvent.click(screen.getByLabelText(/belajar/i));

    expect(svt).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('belajar');
    delete document.startViewTransition;
  });

  it('skips startViewTransition when the user prefers reduced motion, calling onChange directly', () => {
    const svt = vi.fn((cb) => cb());
    document.startViewTransition = svt;
    window.matchMedia = vi.fn().mockReturnValue({ matches: true }); // prefers-reduced-motion: reduce
    const onChange = vi.fn();

    render(<BottomNav active="home" onChange={onChange} dueBadge={0} />);
    fireEvent.click(screen.getByLabelText(/belajar/i));

    expect(svt).not.toHaveBeenCalled();
    expect(onChange).toHaveBeenCalledWith('belajar');
    delete document.startViewTransition;
  });
});

describe('ConfirmDialog — destructive-confirm haptic (item 21)', () => {
  function Trigger() {
    const confirm = useConfirm();
    return <button onClick={() => confirm('Yakin?')}>ask</button>;
  }

  it('confirming fires haptic.wrong(); cancelling does not', () => {
    render(createElement(ConfirmProvider, null, createElement(Trigger)));

    fireEvent.click(screen.getByText('ask'));
    fireEvent.click(screen.getByText('Batal'));
    expect(haptic.wrong).not.toHaveBeenCalled();

    fireEvent.click(screen.getByText('ask'));
    fireEvent.click(screen.getByText('Ya'));
    expect(haptic.wrong).toHaveBeenCalledTimes(1);
  });
});
