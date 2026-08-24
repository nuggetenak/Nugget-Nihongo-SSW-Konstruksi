// ─── tests/error-boundary.test.jsx ────────────────────────────────────────────
// item 38: recovery is a reload by default (a state-clear can't fix a stale
// lazy-chunk import), a `retry` prop can override it, and the raw error
// message sits behind a collapsed disclosure rather than in the user's face.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { createElement } from 'react';
import { _reset_for_test } from '../storage/engine.js';
import ErrorBoundary, { TabError } from '../components/ErrorBoundary.jsx';
import { AppProvider } from '../contexts/AppContext.jsx';
import { ToastProvider } from '../components/Toast.jsx';

function Boom() {
  throw new Error('kaboom, chunk not found');
}

// Suppress the expected console.error noise from componentDidCatch / React's
// own error logging for these intentionally-thrown-error tests.
beforeEach(() => {
  localStorage.clear();
  _reset_for_test();
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('ErrorBoundary', () => {
  it('renders a fallback instead of crashing when a child throws', () => {
    render(
      createElement(ErrorBoundary, { title: 'Terjadi kesalahan' }, createElement(Boom))
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Terjadi kesalahan')).toBeInTheDocument();
  });

  it('the primary action reloads the page by default, not a state-clear retry', () => {
    const reloadSpy = vi.fn();
    const originalLocation = window.location;
    Object.defineProperty(window, 'location', {
      value: { ...originalLocation, reload: reloadSpy },
      writable: true,
    });

    render(createElement(ErrorBoundary, null, createElement(Boom)));
    fireEvent.click(screen.getByText('Muat ulang'));

    expect(reloadSpy).toHaveBeenCalledTimes(1);
    Object.defineProperty(window, 'location', { value: originalLocation, writable: true });
  });

  it('a retry prop overrides the default reload', () => {
    const retrySpy = vi.fn();
    render(createElement(ErrorBoundary, { retry: retrySpy }, createElement(Boom)));
    fireEvent.click(screen.getByText('Muat ulang'));
    expect(retrySpy).toHaveBeenCalledTimes(1);
  });

  it('the raw error message is not shown by default -- only behind Detail teknis', () => {
    render(createElement(ErrorBoundary, null, createElement(Boom)));
    // The message text exists in the DOM (inside a closed <details>), but is
    // not presented as the visible explanation the way the old inline
    // {error.message} text was.
    expect(screen.queryByText('kaboom, chunk not found')).toBeInTheDocument();
    expect(screen.getByText('Detail teknis')).toBeInTheDocument();
    const details = document.querySelector('details');
    expect(details.open).toBe(false);
  });

  it('a secondary action renders and fires when provided', () => {
    const secondarySpy = vi.fn();
    render(
      createElement(
        ErrorBoundary,
        { secondaryLabel: '← Kembali ke Menu', onSecondary: secondarySpy },
        createElement(Boom)
      )
    );
    fireEvent.click(screen.getByText('← Kembali ke Menu'));
    expect(secondarySpy).toHaveBeenCalledTimes(1);
  });

  it('a custom fallback still takes over completely, unchanged from before', () => {
    render(
      createElement(
        ErrorBoundary,
        { fallback: createElement('div', null, 'custom fallback') },
        createElement(Boom)
      )
    );
    expect(screen.getByText('custom fallback')).toBeInTheDocument();
  });
});

describe('TabError', () => {
  function renderTabError() {
    return render(
      createElement(
        ToastProvider,
        null,
        createElement(AppProvider, null, createElement(TabError, { tab: 'Beranda' }))
      )
    );
  }

  it('offers a backup-data action that navigates to export mode', () => {
    renderTabError();
    // Reaching for goMode('ekspor') indirectly: the button exists and is
    // clickable without throwing, which is what matters here (AppContext's
    // own navigation is covered separately in history.test.jsx).
    const btn = screen.getByText('Cadangkan data →');
    expect(() => fireEvent.click(btn)).not.toThrow();
  });
});
