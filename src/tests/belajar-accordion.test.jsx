// ─── tests/belajar-accordion.test.jsx ────────────────────────────────────────
// Owner's request (2026-08-28): rework the Belajar tab's menu into an
// accordion so it doesn't read as one long undifferentiated scroll. Design
// agreed via Visualizer mockups first: the featured card (first/most-used
// mode per section) always stays visible; only the secondary compact-grid
// items collapse, toggled by tapping the section header, which shows a
// chevron in a round "bubble" (explicit follow-up request -- a bare glyph
// didn't read as tappable) only when there's actually something to collapse.
// Collapsed by default, so the tab's initial scroll length is just the 5
// section headers + featured cards -- verified visually via Playwright
// (fullPage screenshot) that this fits a single 390x1000 viewport with zero
// scrolling needed, not asserted here since jsdom doesn't lay out real pixels.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import BelajarTab from '../components/BelajarTab.jsx';
import { MODE_SECTIONS, MODE_META } from '../router/modes.js';

function getCollapsibleFor(sectionLabelText) {
  const header = screen.getByText(sectionLabelText).closest('button, div');
  // .section wraps [header, featured card, collapsible?] -- the collapsible
  // is a sibling after the featured card, not a descendant of the header.
  const section = header.parentElement;
  return section.querySelector('[class*="collapsible"]');
}

describe('BelajarTab — accordion', () => {
  it('featured card is always in the document for every section, regardless of expand state', () => {
    render(<BelajarTab onSelect={() => {}} />);
    for (const section of Object.values(MODE_SECTIONS)) {
      const [featuredKey] = section.modes;
      expect(screen.getByText(MODE_META[featuredKey].label)).toBeTruthy();
    }
  });

  it('a section with only one mode (Ulasan) gets no toggle chevron -- nothing to collapse', () => {
    render(<BelajarTab onSelect={() => {}} />);
    const ulasanSection = Object.entries(MODE_SECTIONS).find(([, s]) => s.modes.length === 1);
    expect(ulasanSection).toBeTruthy();
    const [, section] = ulasanSection;
    const label = section.title.replace(/[^\p{L}\s]/gu, '').trim().toUpperCase();
    const header = screen.getByText(label);
    expect(header.closest('button')).toBeNull(); // plain div, not a toggle button
  });

  it('sections with secondary items start collapsed by default', () => {
    render(<BelajarTab onSelect={() => {}} />);
    const latihanLabel = MODE_SECTIONS.latihan.title
      .replace(/[^\p{L}\s]/gu, '')
      .trim()
      .toUpperCase();
    const collapsible = getCollapsibleFor(latihanLabel);
    expect(collapsible.getAttribute('data-expanded')).toBe('false');
  });

  it('clicking a section header expands it, clicking again collapses it, independent of other sections', () => {
    render(<BelajarTab onSelect={() => {}} />);
    const latihanLabel = MODE_SECTIONS.latihan.title
      .replace(/[^\p{L}\s]/gu, '')
      .trim()
      .toUpperCase();
    const pelajariLabel = MODE_SECTIONS.pelajari.title
      .replace(/[^\p{L}\s]/gu, '')
      .trim()
      .toUpperCase();
    const latihanHeader = screen.getByText(latihanLabel).closest('button');

    fireEvent.click(latihanHeader);
    expect(getCollapsibleFor(latihanLabel).getAttribute('data-expanded')).toBe('true');
    // Expanding Latihan must not have touched Pelajari's own state.
    expect(getCollapsibleFor(pelajariLabel).getAttribute('data-expanded')).toBe('false');

    fireEvent.click(latihanHeader);
    expect(getCollapsibleFor(latihanLabel).getAttribute('data-expanded')).toBe('false');
  });

  it('a secondary mode inside a collapsed section is still selectable once expanded', () => {
    const onSelect = vi.fn();
    render(<BelajarTab onSelect={onSelect} />);
    const latihanLabel = MODE_SECTIONS.latihan.title
      .replace(/[^\p{L}\s]/gu, '')
      .trim()
      .toUpperCase();
    fireEvent.click(screen.getByText(latihanLabel).closest('button'));
    const secondaryKey = MODE_SECTIONS.latihan.modes[1]; // 'sprint'
    fireEvent.click(screen.getByText(MODE_META[secondaryKey].label));
    expect(onSelect).toHaveBeenCalledWith(secondaryKey);
  });
});
