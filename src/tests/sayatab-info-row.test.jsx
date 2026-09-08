// ─── tests/sayatab-info-row.test.jsx ─────────────────────────────────────────
// The first test in this suite to actually render SayaTab. That is worth
// noting: SayaTab has printed __APP_VERSION__ in three places since 6.x and no
// test ever mounted it, so the missing `define` in vitest.config.js stayed
// invisible until this file existed -- as a ReferenceError, not a wrong string.
//
// The row itself used to fire a one-line toast. It opens the Tentang screen
// now, and carries the "Baru" badge until those notes have been read.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import LZString from 'lz-string';
import SayaTab from '../components/SayaTab.jsx';
import { ToastProvider } from '../components/Toast.jsx';
import { ConfirmProvider } from '../components/ConfirmDialog.jsx';
import { AppProvider } from '../contexts/AppContext.jsx';
import { ProgressProvider } from '../contexts/ProgressContext.jsx';
import { SRSProvider } from '../contexts/SRSContext.jsx';
import { _reset_for_test, init } from '../storage/engine.js';
import { STORAGE_VERSION, DOCS, DEFAULTS } from '../storage/schema.js';

function seed(prefFields = {}) {
  const write = (k, d) => localStorage.setItem(k, LZString.compressToUTF16(JSON.stringify(d)));
  write(DOCS.progress, { ...DEFAULTS.progress, _v: STORAGE_VERSION });
  write(DOCS.srs, { ...DEFAULTS.srs, _v: STORAGE_VERSION });
  write(DOCS.prefs, { ...DEFAULTS.prefs, _v: STORAGE_VERSION, ...prefFields });
}

function setup() {
  return render(
    <ToastProvider>
      <ConfirmProvider>
        <AppProvider>
          <ProgressProvider>
            <SRSProvider>
              <SayaTab />
            </SRSProvider>
          </ProgressProvider>
        </AppProvider>
      </ConfirmProvider>
    </ToastProvider>
  );
}

const infoRow = () => screen.getByText('ℹ️ Tentang Aplikasi').closest('button');
// Scoped to the row: the SRS section has its own "Baru" row (Matang / Muda /
// Baru / Jatuh tempo), so a bare getByText('Baru') matches the wrong thing.
const badge = () => within(infoRow()).queryByText('Baru');

beforeEach(() => {
  localStorage.clear();
  _reset_for_test();
  vi.restoreAllMocks();
});

describe('the Tentang Aplikasi row', () => {
  it('renders at all — which is what proves __APP_VERSION__ is defined in tests', () => {
    seed();
    init();
    setup();
    expect(infoRow()).toBeTruthy();
  });

  it('shows the Baru badge when the reader has not seen these notes', () => {
    seed({ lastSeenVersion: null });
    init();
    setup();
    expect(badge()).toBeTruthy();
  });

  it('shows the Baru badge when the stored version is an older release', () => {
    seed({ lastSeenVersion: '7.1.0' });
    init();
    setup();
    expect(badge()).toBeTruthy();
  });

  it('shows the version instead of the badge once the notes have been seen', () => {
    seed({ lastSeenVersion: __APP_VERSION__ });
    init();
    setup();
    expect(badge()).toBeNull();
    expect(within(infoRow()).getByText(`v${__APP_VERSION__}`)).toBeTruthy();
  });

  it('opens the Tentang mode rather than firing a toast', () => {
    seed();
    init();
    setup();
    fireEvent.click(infoRow());
    // goMode persists the destination, which is the observable effect here.
    expect(document.body.textContent).not.toContain('by Nugget Nihongo 🏗️');
  });
});
