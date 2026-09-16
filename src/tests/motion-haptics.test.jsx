// ─── tests/motion-haptics.test.jsx ────────────────────────────────────────────
// item 21: AngkaMode, DangerMode, and SimulasiMode hand-roll their own answer
// UI and had zero haptic feedback -- not a different pattern from the rest of
// the app, no pattern at all. Also covers the destructive-confirm haptic the
// plan asked for, and the prefers-reduced-motion guard on BottomNav's
// JS-invoked View Transition (a CSS catch-all can't reach that).
//
// item 174 (2026-09-15): this file NAMED Angka and Danger from the day it was
// written and never rendered either one -- the haptic those modes were given is
// asserted here for the first time, now that there is one component to assert it
// on. Which is itself the argument for the consolidation: a behaviour with four
// implementations had none of them under test, and a behaviour with one has it
// covered in five lines.
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, screen } from '@testing-library/react';
import { createElement } from 'react';

vi.mock('../utils/haptic.js', () => ({
  haptic: { tap: vi.fn(), correct: vi.fn(), wrong: vi.fn(), success: vi.fn(), flip: vi.fn() },
}));

import { haptic } from '../utils/haptic.js';
import BottomNav from '../components/BottomNav.jsx';
import OptionButton from '../components/OptionButton.jsx';
import { readFileSync } from 'fs';
import { resolve } from 'path';
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

// ─── withViewTransition survives a stub that returns nothing (item 147) ──────
// CI caught this against the double above: `vi.fn((cb) => cb())` returns
// undefined, the helper read `.finished` off it, and the TypeError left its
// re-entrancy flag stuck at true -- so every LATER navigation silently skipped
// its transition, permanently, from one throw. The real API returns a
// ViewTransition; a stub or a polyfill need not.
describe('withViewTransition — robustness of the re-entrancy flag', () => {
  it('still runs the update when startViewTransition returns nothing', async () => {
    const { withViewTransition } = await import('../utils/motion.js');
    document.startViewTransition = vi.fn((cb) => cb());
    window.matchMedia = vi.fn().mockReturnValue({ matches: false });

    const ran = [];
    expect(() => withViewTransition(() => ran.push('a'))).not.toThrow();
    expect(ran).toEqual(['a']);

    // The flag must be down again, or this second call falls through the
    // re-entrancy branch instead of starting its own transition.
    withViewTransition(() => ran.push('b'));
    expect(ran).toEqual(['a', 'b']);
    expect(document.startViewTransition).toHaveBeenCalledTimes(2);
    delete document.startViewTransition;
  });

  it('runs the update even if startViewTransition itself throws', async () => {
    const { withViewTransition } = await import('../utils/motion.js');
    document.startViewTransition = vi.fn(() => {
      throw new Error('no');
    });
    window.matchMedia = vi.fn().mockReturnValue({ matches: false });

    const ran = [];
    expect(() => withViewTransition(() => ran.push('a'))).not.toThrow();
    expect(ran, 'a failed animation must not cost the user their navigation').toEqual(['a']);

    withViewTransition(() => ran.push('b'));
    expect(ran).toEqual(['a', 'b']);
    delete document.startViewTransition;
  });
});

// ─── item 174: four hand-rolled answer buttons became one ────────────────────
describe('OptionButton — the answer haptic, on the one button that fires it', () => {
  const opts = [{ text: 'benar' }, { text: 'salah' }];

  function Row({ selected, onSelect }) {
    return opts.map((o, i) =>
      createElement(OptionButton, {
        key: i,
        idx: i,
        text: o.text,
        selected,
        isCorrect: i === 0,
        onSelect,
      })
    );
  }

  it('a correct tap buzzes correct, a wrong tap buzzes wrong', () => {
    const onSelect = vi.fn();
    const { rerender } = render(createElement(Row, { selected: null, onSelect }));

    fireEvent.click(screen.getByText('benar'));
    expect(haptic.correct).toHaveBeenCalledTimes(1);
    expect(haptic.wrong).not.toHaveBeenCalled();
    expect(onSelect).toHaveBeenCalledWith(0);

    vi.clearAllMocks();
    rerender(createElement(Row, { selected: null, onSelect }));
    fireEvent.click(screen.getByText('salah'));
    expect(haptic.wrong).toHaveBeenCalledTimes(1);
    expect(haptic.correct).not.toHaveBeenCalled();
  });

  it('an already-answered question does not fire again', () => {
    // The four hand-rolled copies each guarded this separately, in their own
    // handleSelect. One guard now, on the button, where the tap is.
    const onSelect = vi.fn();
    render(createElement(Row, { selected: 1, onSelect }));
    fireEvent.click(screen.getByText('benar'));
    expect(onSelect).not.toHaveBeenCalled();
    expect(haptic.correct).not.toHaveBeenCalled();
  });
});

describe('item 174 — the four modes stopped hand-rolling it', () => {
  const MODES = ['AngkaMode', 'DangerMode', 'ConfusionMode', 'DengarMode'];
  const read = (m) => readFileSync(resolve(__dirname, `../modes/${m}.jsx`), 'utf-8');

  it.each(MODES)('%s renders the shared OptionButton', (m) => {
    expect(read(m)).toContain("from '../components/OptionButton.jsx'");
  });

  it.each(MODES)('%s no longer triggers the answer keyframes itself', (m) => {
    // correctFlash/wrongShake are reserved for answer feedback (DESIGN_SPEC §4)
    // and there is now exactly one place that plays them. A mode naming either
    // again is a fifth copy starting.
    const src = read(m);
    expect(src, `${m} still plays correctFlash`).not.toMatch(/correctFlash/);
    expect(src, `${m} still plays wrongShake`).not.toMatch(/wrongShake/);
  });
});
