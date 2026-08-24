// ─── tests/data-warning.test.jsx ──────────────────────────────────────────────
// item 19: "a corrupt localStorage document — what does the user see?" Before
// this, the answer was nothing — readDoc swallowed the parse error, init()
// treated it identically to a fresh install, and immediately overwrote the
// unreadable bytes with empty defaults. These tests cover the fix: detected,
// preserved under a backup key, and surfaced -- not silently destroyed.
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { createElement } from 'react';
import {
  init,
  get,
  _reset_for_test,
  getCorruptionWarning,
} from '../storage/engine.js';
import { notifyQuotaExceeded } from '../utils/storage-quota.js';
import DataWarningBanner from '../components/DataWarningBanner.jsx';
import { AppProvider } from '../contexts/AppContext.jsx';
import { ToastProvider } from '../components/Toast.jsx';

beforeEach(() => {
  localStorage.clear();
  _reset_for_test();
});

describe('storage engine — corruption handling', () => {
  it('a document that fails to parse is quarantined, not silently overwritten in place', () => {
    localStorage.setItem('ssw-progress', 'not valid json{{{');
    init();

    expect(getCorruptionWarning().length).toBe(1);
    expect(getCorruptionWarning()[0].doc).toBe('ssw-progress');

    // The original bytes still exist somewhere in localStorage, under the
    // recorded backup key -- not just gone.
    const backupKey = getCorruptionWarning()[0].backupKey;
    expect(localStorage.getItem(backupKey)).toBe('not valid json{{{');
  });

  it('the app still functions after corrupt data — falls back to fresh defaults rather than crashing', () => {
    localStorage.setItem('ssw-progress', '{{{broken');
    init();
    const progress = get('progress');
    expect(Array.isArray(progress.known)).toBe(true);
    expect(progress.known.length).toBe(0);
  });

  it('a genuinely missing key (real fresh install) is not flagged as corruption', () => {
    // Nothing written at all.
    init();
    expect(getCorruptionWarning().length).toBe(0);
  });

  it('valid existing data parses normally and is not flagged', () => {
    // Simulate a real prior session by going through init() once to write
    // valid current-version docs, then re-reading them.
    init();
    _reset_for_test();
    init();
    expect(getCorruptionWarning().length).toBe(0);
  });
});

describe('DataWarningBanner', () => {
  function renderBanner() {
    return render(
      createElement(
        ToastProvider,
        null,
        createElement(AppProvider, null, createElement(DataWarningBanner))
      )
    );
  }

  it('renders nothing when there is no warning', () => {
    renderBanner();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('shows a corruption warning with a backup action when init() had to quarantine a doc', () => {
    localStorage.setItem('ssw-progress', 'not valid json{{{');
    init();
    renderBanner();
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/tidak bisa dibaca/)).toBeInTheDocument();
    expect(screen.getByText('Cadangkan data →')).toBeInTheDocument();
  });

  it('shows a quota warning when the quota handler fires, and can be dismissed', () => {
    renderBanner();
    act(() => {
      notifyQuotaExceeded('ssw-progress');
    });
    expect(screen.getByText(/Penyimpanan penuh/)).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Tutup peringatan'));
    expect(screen.queryByRole('alert')).toBeNull();
  });
});
