// ─── tests/mode-header.test.jsx ──────────────────────────────────────────────
// ModeHeader became the ONLY header on every mode screen (2026-09-04): back
// control, breadcrumb trail, and the mode's name as the page <h1>. Before that,
// 20 of 21 modes rendered their own duplicate title and each drew one of 27
// different back buttons — 25 labelled "← Kembali", one "← Keluar", one a bare
// circular icon.
//
// The contract that consolidation created is what this file protects, because
// breaking it is silent: AppShell hides the bottom nav in mode chrome on phones,
// so if this header stops rendering its back control there is NO way out of a
// mode on a phone except the browser's own back gesture.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ModeHeader from '../components/ModeHeader.jsx';
import { MODE_COMPONENTS, MODE_META } from '../router/modes.js';

const modeKeys = Object.keys(MODE_COMPONENTS);

describe('ModeHeader — the one header every mode gets', () => {
  it.each(modeKeys)('%s renders a back control and its name as the page h1', (mode) => {
    const onBack = vi.fn();
    render(<ModeHeader mode={mode} modeHistory={[]} onBack={onBack} />);

    const back = screen.getByRole('button', { name: /^Kembali/ });
    fireEvent.click(back);
    expect(onBack).toHaveBeenCalledTimes(1);

    // goBack, called with no argument: pops one level of mode-to-mode history if
    // there is any, exits the mode area if there isn't. Passing a mode key here
    // would jump to that mode instead, so the absence of an argument matters.
    expect(onBack).toHaveBeenCalledWith();

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1.textContent).toContain(MODE_META[mode].label);
  });

  it('every registered mode has the metadata the header renders from', () => {
    // A mode added to MODE_COMPONENTS without a MODE_META entry renders no
    // header at all — no title, and no way back on a phone.
    for (const mode of modeKeys) {
      expect(MODE_META[mode], `MODE_META missing an entry for "${mode}"`).toBeTruthy();
      expect(MODE_META[mode].label, `MODE_META.${mode} has no label`).toBeTruthy();
      expect(MODE_META[mode].ui, `MODE_META.${mode} has no icon key`).toBeTruthy();
    }
  });

  it('with history, back is labelled for the parent it returns to', () => {
    const onBack = vi.fn();
    render(<ModeHeader mode="kartu" modeHistory={['kuis']} onBack={onBack} />);
    expect(screen.getByRole('button', { name: 'Kembali ke Kuis' })).toBeTruthy();
  });

  it('without history, back is labelled as leaving the mode area', () => {
    const onBack = vi.fn();
    render(<ModeHeader mode="kartu" modeHistory={[]} onBack={onBack} />);
    expect(screen.getByRole('button', { name: 'Kembali ke menu' })).toBeTruthy();
  });

  it('every trail crumb jumps directly to its own ancestor, not just one level', () => {
    // AppContext's goBack(targetMode) truncates history to any point in the
    // stack; the trail is only useful if each crumb actually uses that.
    const onBack = vi.fn();
    render(<ModeHeader mode="kartu" modeHistory={['stats', 'kuis']} onBack={onBack} />);
    fireEvent.click(screen.getByRole('button', { name: 'Ke Statistik' }));
    expect(onBack).toHaveBeenCalledWith('stats');
  });

  it('the back arrow and the crumb beside it do not share an accessible name', () => {
    // They do different things — the arrow pops one level, a crumb jumps to a
    // named point in the stack — and with history both used to be labelled
    // "Kembali ke <parent>", which a screen reader user cannot tell apart. Found
    // by this file's own first run, not by inspection.
    const onBack = vi.fn();
    render(<ModeHeader mode="kartu" modeHistory={['kuis']} onBack={onBack} />);
    const names = screen
      .getAllByRole('button')
      .map((b) => b.getAttribute('aria-label') ?? b.textContent.trim());
    expect(new Set(names).size).toBe(names.length);
  });
});
