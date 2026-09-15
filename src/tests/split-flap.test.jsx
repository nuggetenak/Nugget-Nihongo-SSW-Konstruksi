// ─── tests/split-flap.test.jsx ───────────────────────────────────────────────
// item 158. The days-remaining count is the first number on the dashboard and
// the one with emotional weight; it was plain text.
//
// The honest note about what this animates, repeated here because it decides
// what is worth testing: a countdown changes once a day and nobody is watching
// at midnight, so the flip anyone actually sees is the ENTRANCE, every time
// they open the app. The per-digit stagger is what makes that read as a board
// settling rather than as text appearing — so the stagger index, and the
// re-key that replays it on a change, are the two things worth pinning.
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import SplitFlap from '../components/SplitFlap.jsx';

const root = document.documentElement;
const flaps = () => [...document.querySelectorAll('[class*="flap"]')];

beforeEach(() => {
  root.removeAttribute('data-motion-no-count');
});
afterEach(() => {
  root.removeAttribute('data-motion-no-count');
});

describe('SplitFlap', () => {
  it('splits the number into one hinge per character', () => {
    render(<SplitFlap value={23} />);
    expect(flaps().map((f) => f.textContent)).toEqual(['2', '3']);
  });

  it('gives each hinge its place in the order', () => {
    render(<SplitFlap value={120} />);
    expect(flaps().map((f) => f.style.getPropertyValue('--flap-i'))).toEqual(['0', '1', '2']);
  });

  it('reads as plain text to a screen reader', () => {
    // No aria-hidden, no duplicate live region: the characters ARE the content,
    // and the hinge is entirely CSS. A split-flap that had to be announced
    // separately would be a worse number, not a nicer one.
    render(
      <span>
        <SplitFlap value={7} /> hari lagi
      </span>
    );
    expect(screen.getByText(/hari lagi/).textContent.replace(/\s+/g, ' ')).toContain('7 hari lagi');
  });

  it('replays the flip when the value changes', () => {
    // The whole row re-keys, not just the digit that changed. A real board
    // flips only what moved; on a screen that leaves one digit sitting still
    // beside a flipping neighbour, which reads as a glitch rather than as a
    // mechanism.
    const { rerender } = render(<SplitFlap value={23} />);
    const first = flaps()[0];
    rerender(<SplitFlap value={22} />);
    expect(flaps()[0], 'the hinge was not remounted, so the flip cannot replay').not.toBe(first);
  });

  it('does not re-key when the value has not changed', () => {
    const { rerender } = render(<SplitFlap value={23} />);
    const first = flaps()[0];
    rerender(<SplitFlap value={23} />);
    expect(flaps()[0]).toBe(first);
  });

  it('marks itself un-animated when "Animasi angka" is off', () => {
    // The same toggle the counting numbers use, because this IS one: a reader
    // who switched off number animation should not find the countdown flipping
    // anyway. The digits still render.
    root.setAttribute('data-motion-no-count', '');
    render(<SplitFlap value={23} />);
    expect(flaps().map((f) => f.dataset.animated)).toEqual(['false', 'false']);
    expect(flaps().map((f) => f.textContent)).toEqual(['2', '3']);
  });
});
