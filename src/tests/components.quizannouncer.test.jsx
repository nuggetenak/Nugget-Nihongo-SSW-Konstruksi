// ─── tests/components.quizannouncer.test.jsx ─────────────────────────────────
// Component tests for QuizAnnouncer (item 45) — the live-region text and its
// aria attributes, since that's the entire contract this component has.
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import QuizAnnouncer from '../components/QuizAnnouncer.jsx';

describe('QuizAnnouncer', () => {
  it('renders an empty live region when isCorrect is unset (nothing answered yet)', () => {
    const { container } = render(<QuizAnnouncer isCorrect={null} />);
    const region = container.querySelector('[aria-live]');
    expect(region).not.toBeNull();
    expect(region.textContent).toBe('');
  });

  it('announces "Benar!" when isCorrect is true', () => {
    const { container } = render(<QuizAnnouncer isCorrect={true} />);
    expect(container.textContent).toBe('Benar!');
  });

  it('announces "Salah." with no detail when isCorrect is false and no correctText given', () => {
    const { container } = render(<QuizAnnouncer isCorrect={false} />);
    expect(container.textContent).toBe('Salah.');
  });

  it('includes the correct answer when isCorrect is false and correctText is given', () => {
    const { container } = render(<QuizAnnouncer isCorrect={false} correctText="消火器" />);
    expect(container.textContent).toBe('Salah. Jawaban yang benar: 消火器');
  });

  it('always sets aria-live="assertive" and aria-atomic="true"', () => {
    const { container } = render(<QuizAnnouncer isCorrect={true} />);
    const region = container.querySelector('[aria-live]');
    expect(region.getAttribute('aria-live')).toBe('assertive');
    expect(region.getAttribute('aria-atomic')).toBe('true');
  });

  it('keeps the same DOM node across re-renders (text changes, element does not remount)', () => {
    const { container, rerender } = render(<QuizAnnouncer isCorrect={null} />);
    const before = container.querySelector('[aria-live]');
    rerender(<QuizAnnouncer isCorrect={true} />);
    const after = container.querySelector('[aria-live]');
    expect(after).toBe(before);
    expect(after.textContent).toBe('Benar!');
  });

  it('has the sr-only class so it never renders visibly', () => {
    const { container } = render(<QuizAnnouncer isCorrect={true} />);
    expect(container.querySelector('.sr-only')).not.toBeNull();
  });
});
