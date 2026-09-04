// ─── tests/mode-skeleton.test.jsx ─────────────────────────────────────────────
// item 17: one generic card-shaped Suspense fallback used to cover every mode
// regardless of destination shape. MODE_META[mode].skeleton now drives which
// shape ModeLoader renders.
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ModeLoader } from '../router/ModeRouter.jsx';
import { MODE_META, MODE_COMPONENTS } from '../router/modes.js';

describe('ModeLoader shapes', () => {
  it('defaults to the card shape when no shape prop is given', () => {
    const { container } = render(<ModeLoader />);
    // Skeleton.Card renders a single .card block; quiz/list/stat blocks don't.
    expect(container.querySelector('[class*="card"]')).toBeTruthy();
  });

  it('renders four answer-option rows for the quiz shape', () => {
    render(<ModeLoader shape="quiz" />);
    const options = document.querySelectorAll('[class*="quizOption"]');
    expect(options.length).toBe(4);
  });

  it('renders row skeletons for the list shape', () => {
    render(<ModeLoader shape="list" />);
    const rows = document.querySelectorAll('[class*="row"]');
    expect(rows.length).toBeGreaterThanOrEqual(4);
  });

  it('renders a stat grid for the stat shape', () => {
    render(<ModeLoader shape="stat" />);
    const stats = document.querySelectorAll('[class*="stat"]');
    expect(stats.length).toBeGreaterThanOrEqual(6);
  });

  it('has exactly one loading announcement for the whole fallback, not one per block', () => {
    render(<ModeLoader shape="quiz" />);
    expect(screen.getAllByRole('status')).toHaveLength(1);
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Memuat mode...');
  });
});

describe('MODE_META skeleton coverage', () => {
  it('every registered mode has a skeleton value that is a real, known shape', () => {
    const known = new Set(['card', 'quiz', 'list', 'stat']);
    for (const key of Object.keys(MODE_COMPONENTS)) {
      const shape = MODE_META[key]?.skeleton ?? 'card'; // 'card' is ModeLoader's own default
      expect(known.has(shape), `${key} has an unrecognized skeleton "${shape}"`).toBe(true);
    }
  });

  it('every entry in MODE_COMPONENTS has a matching MODE_META entry (no silently-unstyled mode)', () => {
    for (const key of Object.keys(MODE_COMPONENTS)) {
      expect(
        MODE_META[key],
        `${key} is registered as a component but has no MODE_META entry`
      ).toBeDefined();
    }
  });
});
