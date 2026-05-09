// ─── BottomNav.test.jsx ───────────────────────────────────────────────────────
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import BottomNav from '../components/BottomNav.jsx';

vi.mock('../components/BottomNav.module.css', () => ({
  default: new Proxy({}, { get: (_, key) => key }),
}));

const _TABS = ['home', 'belajar', 'saya'];

describe('BottomNav', () => {
  it('renders 3 tabs (Beranda, Belajar, Saya)', () => {
    render(<BottomNav active="home" onChange={() => {}} dueBadge={0} />);
    expect(screen.getByLabelText(/beranda/i)).toBeTruthy();
    expect(screen.getByLabelText(/belajar/i)).toBeTruthy();
    expect(screen.getByLabelText(/saya/i)).toBeTruthy();
  });

  it('active tab has data-active="true"', () => {
    render(<BottomNav active="belajar" onChange={() => {}} dueBadge={0} />);
    const activeBtn = screen.getByLabelText(/belajar/i);
    expect(activeBtn.getAttribute('data-active')).toBe('true');
  });

  it('inactive tabs do not have data-active="true"', () => {
    render(<BottomNav active="home" onChange={() => {}} dueBadge={0} />);
    const belajarBtn = screen.getByLabelText(/belajar/i);
    expect(belajarBtn.getAttribute('data-active')).not.toBe('true');
  });

  it('clicking inactive tab calls onChange with correct tab id', () => {
    const onChange = vi.fn();
    render(<BottomNav active="home" onChange={onChange} dueBadge={0} />);
    fireEvent.click(screen.getByLabelText(/belajar/i));
    expect(onChange).toHaveBeenCalledWith('belajar');
  });

  it('badge renders when dueBadge > 0', () => {
    render(<BottomNav active="home" onChange={() => {}} dueBadge={5} />);
    // badge should be visible — aria-label includes count
    const belajarBtn = screen.getByLabelText(/5 notifikasi/i);
    expect(belajarBtn).toBeTruthy();
  });

  it('aria-current="page" on active tab', () => {
    render(<BottomNav active="saya" onChange={() => {}} dueBadge={0} />);
    const activeBtn = screen.getByLabelText(/saya/i);
    expect(activeBtn.getAttribute('aria-current')).toBe('page');
  });

  it('inactive tabs do not have aria-current="page"', () => {
    render(<BottomNav active="home" onChange={() => {}} dueBadge={0} />);
    const belajarBtn = screen.getByLabelText(/belajar/i);
    expect(belajarBtn.getAttribute('aria-current')).toBeNull();
  });
});
