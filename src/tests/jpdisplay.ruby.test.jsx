import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { JpFront } from '../components/JpDisplay.jsx';

describe('JpFront ruby furigana rendering', () => {
  it('renders ruby/rt when jp has inline furigana markers', () => {
    const { container } = render(<JpFront jp="鉄筋《てっきん》コンクリート" furiganaPolicy="always" />);
    const ruby = container.querySelector('ruby');
    const rt = container.querySelector('rt');

    expect(ruby).toBeTruthy();
    expect(ruby?.textContent).toContain('鉄筋');
    expect(rt?.textContent).toBe('てっきん');
    expect(screen.getByText('コンクリート')).toBeTruthy();
  });

  it('does not render ruby when furiganaPolicy is hidden', () => {
    const { container } = render(<JpFront jp="鉄筋《てっきん》" furiganaPolicy="hidden" />);
    expect(container.querySelector('ruby')).toBeNull();
    expect(screen.getByText('鉄筋')).toBeTruthy();
  });
});
