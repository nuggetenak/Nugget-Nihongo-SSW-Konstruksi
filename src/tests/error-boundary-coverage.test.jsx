// ─── tests/error-boundary-coverage.test.jsx ──────────────────────────────────
// Two places had no boundary above them, and both are load-bearing.
//
// 1. `App.jsx`'s `if (mode)` branch rendered `<ModeRouter />` bare, while the
//    three tab branches each got one. ModeRouter has an internal boundary, but
//    it wraps only ModeHeader + Suspense -- everything ModeRouter computes
//    before that return (its hooks, filteredCards, the whole modeProps map) ran
//    outside it. A throw there blanked the screen mid-study.
//
// 2. `main.jsx` mounted five nested providers with no boundary anywhere, so a
//    throw in any provider's own render had nothing above it at all.
//
// The root fallback deliberately does not use `TabError`, because TabError
// calls useApp() -- the very thing that may have just failed.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ErrorBoundary, { TabError } from '../components/ErrorBoundary.jsx';
import { ToastProvider } from '../components/Toast.jsx';
import { AppProvider } from '../contexts/AppContext.jsx';
import { _reset_for_test } from '../storage/engine.js';

function Boom() {
  throw new Error('boom from a provider');
}

beforeEach(() => {
  localStorage.clear();
  _reset_for_test();
  // The boundary logs via console.error by design; keep the run readable.
  vi.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => vi.restoreAllMocks());

describe('the root boundary', () => {
  it('renders a fallback instead of a blank page when a provider throws', () => {
    render(
      <ErrorBoundary title="Aplikasi gagal dimuat" desc="Terjadi kesalahan saat memulai aplikasi.">
        <ToastProvider>
          <Boom />
        </ToastProvider>
      </ErrorBoundary>
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Aplikasi gagal dimuat')).toBeInTheDocument();
  });

  it('needs no React context to render — a context may be what failed', () => {
    // No AppProvider anywhere in this tree. TabError would need one.
    render(
      <ErrorBoundary title="Aplikasi gagal dimuat">
        <Boom />
      </ErrorBoundary>
    );
    expect(screen.getByText('Aplikasi gagal dimuat')).toBeInTheDocument();
  });
});

describe('the mode-area boundary', () => {
  it('catches a throw from the mode area and offers a way out', () => {
    render(
      <ToastProvider>
        <AppProvider>
          <ErrorBoundary fallback={<TabError tab="Mode belajar" />}>
            <Boom />
          </ErrorBoundary>
        </AppProvider>
      </ToastProvider>
    );
    expect(screen.getByText('Tab Mode belajar mengalami error')).toBeInTheDocument();
    // Progress is at risk in a mode, so the backup route must be offered.
    expect(screen.getByText(/Cadangkan data/)).toBeInTheDocument();
  });
});
