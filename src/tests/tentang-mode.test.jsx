// ─── tests/tentang-mode.test.jsx ─────────────────────────────────────────────
// "Tentang Aplikasi" used to be a one-line toast. It is a real screen now, and
// the parts worth pinning are the ones that would rot silently: the menu guide
// is generated from the mode registry rather than retyped, the privacy section
// states the consequence that actually costs a user their progress, and opening
// the screen clears the "Baru" badge.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TentangMode from '../modes/TentangMode.jsx';
import { ToastProvider } from '../components/Toast.jsx';
import { AppProvider } from '../contexts/AppContext.jsx';
import { _reset_for_test, init, get } from '../storage/engine.js';
import { MODE_SECTIONS, MODE_META } from '../router/modes.js';
import { CARDS } from '../data/cards.js';
import { RELEASE_NOTES } from '../data/release-notes.js';
import { formatCount } from '../utils/format.js';

function setup(props = {}) {
  return render(
    <ToastProvider>
      <AppProvider>
        <TentangMode onNavigate={vi.fn()} {...props} />
      </AppProvider>
    </ToastProvider>
  );
}

beforeEach(() => {
  localStorage.clear();
  _reset_for_test();
  init();
});

describe('identity', () => {
  it('shows the build version and the real card count, not literals', () => {
    // The line is split across a <strong>, so read the container rather than
    // hunting for a single text node.
    const { container } = setup();
    const text = container.textContent;
    expect(text).toContain(__APP_VERSION__);
    expect(text).toContain(formatCount(CARDS.length));
  });
});

describe('release notes', () => {
  it('shows the newest release expanded', () => {
    setup();
    expect(screen.getByText(RELEASE_NOTES[0].title)).toBeTruthy();
  });

  it('puts older releases behind one control', () => {
    setup();
    expect(screen.getByText('Rilis sebelumnya')).toBeTruthy();
  });
});

describe('the menu guide is generated, not retyped', () => {
  it('lists every mode in MODE_SECTIONS with its registry label', () => {
    setup();
    // This is the assertion that keeps the guide from drifting: add a mode to a
    // section and it appears here with no edit to this screen.
    for (const sec of Object.values(MODE_SECTIONS)) {
      for (const key of sec.modes) {
        const label = MODE_META[key]?.label;
        if (!label) continue;
        expect(screen.getAllByText(label).length, `missing ${key}`).toBeGreaterThan(0);
      }
    }
  });

  it('navigates to the tapped mode', () => {
    const onNavigate = vi.fn();
    setup({ onNavigate });
    fireEvent.click(screen.getAllByText(MODE_META.kuis.label)[0].closest('button'));
    expect(onNavigate).toHaveBeenCalledWith('kuis');
  });
});

describe('the sections that carry a real cost', () => {
  it('says progress lives only on this device and is lost with it', () => {
    setup();
    expect(screen.getByText(/ganti HP.*progres hilang/i)).toBeTruthy();
  });

  it('offers the backup route from the privacy section', () => {
    const onNavigate = vi.fn();
    setup({ onNavigate });
    fireEvent.click(screen.getByText(/Cadangkan progres sekarang/));
    expect(onNavigate).toHaveBeenCalledWith('ekspor');
  });

  it('routes to sumber from the credits section', () => {
    const onNavigate = vi.fn();
    setup({ onNavigate });
    fireEvent.click(screen.getByText(/Belajar per sumber/));
    expect(onNavigate).toHaveBeenCalledWith('sumber');
  });

  it('does not overclaim the scheduler — says the calibration is standard', () => {
    setup();
    expect(screen.getByText(/pengaturan standar/i)).toBeTruthy();
  });
});

describe('the Baru badge', () => {
  it('stamps lastSeenVersion on mount, so the badge clears', () => {
    expect(get('prefs').lastSeenVersion).toBeNull();
    setup();
    expect(get('prefs').lastSeenVersion).toBe(__APP_VERSION__);
  });
});
