// ─── SideNav.test.jsx ─────────────────────────────────────────────────────────
// Covers item 13's addition: the full mode registry beneath the 3 tabs.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SideNav from '../components/SideNav.jsx';

vi.mock('../components/SideNav.module.css', () => ({
  default: new Proxy({}, { get: (_, key) => key }),
}));

describe('SideNav', () => {
  it('still renders the 3 top-level tabs unchanged', () => {
    render(<SideNav active="home" onChange={() => {}} dueBadge={0} />);
    expect(screen.getByLabelText('Beranda')).toBeTruthy();
    expect(screen.getByLabelText('Belajar')).toBeTruthy();
    expect(screen.getByLabelText('Saya')).toBeTruthy();
  });

  it('does not render mode sections when onSelectMode is not passed', () => {
    render(<SideNav active="home" onChange={() => {}} dueBadge={0} />);
    // "Kartu" is a mode item's label — should not exist without onSelectMode.
    expect(screen.queryByText('Kartu')).toBeNull();
  });

  it('renders mode sections grouped by MODE_SECTIONS when onSelectMode is passed', () => {
    render(
      <SideNav active="belajar" onChange={() => {}} dueBadge={0} onSelectMode={() => {}} />
    );
    expect(screen.getByText('📝 Pelajari')).toBeTruthy();
    expect(screen.getByText('🧪 Latihan')).toBeTruthy();
    expect(screen.getByText('Kartu')).toBeTruthy();
  });

  it('calls onSelectMode with the mode key when a mode item is clicked', () => {
    const onSelectMode = vi.fn();
    render(
      <SideNav active="belajar" onChange={() => {}} dueBadge={0} onSelectMode={onSelectMode} />
    );
    fireEvent.click(screen.getByText('Kartu'));
    expect(onSelectMode).toHaveBeenCalledWith('kartu');
  });

  it("marks the active mode's own item with aria-current", () => {
    render(
      <SideNav
        active="belajar"
        onChange={() => {}}
        dueBadge={0}
        mode="kartu"
        onSelectMode={() => {}}
      />
    );
    const kartuButton = screen.getByText('Kartu').closest('button');
    expect(kartuButton.getAttribute('aria-current')).toBe('page');
  });

  it("auto-opens the section containing the active mode", () => {
    render(
      <SideNav
        active="belajar"
        onChange={() => {}}
        dueBadge={0}
        mode="sprint"
        onSelectMode={() => {}}
      />
    );
    // 'sprint' lives in MODE_SECTIONS.latihan ("🧪 Latihan") — its <details>
    // should be open, so "Sprint" is actually visible/queryable, not just
    // present but hidden inside a closed <details>.
    const sprintButton = screen.getByText('Sprint').closest('button');
    const details = sprintButton.closest('details');
    expect(details.open).toBe(true);
  });

  it('does not force any section open when no mode is active', () => {
    render(<SideNav active="belajar" onChange={() => {}} dueBadge={0} onSelectMode={() => {}} />);
    const anyDetails = screen.getByText('📝 Pelajari').closest('details');
    expect(anyDetails.open).toBe(false);
  });
});
