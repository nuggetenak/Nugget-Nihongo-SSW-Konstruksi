// ─── tests/offline-legibility.test.jsx ────────────────────────────────────────
// item 25: almost everything in this app is genuinely local, but gist-sync
// needs the network outright and speech synthesis may depend on a network
// voice -- both could fail with zero explanation before this item.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, act, renderHook } from '@testing-library/react';
import { createElement } from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus.js';

function setNavigatorOnline(value) {
  Object.defineProperty(navigator, 'onLine', { value, writable: true, configurable: true });
}

describe('useOnlineStatus', () => {
  afterEach(() => setNavigatorOnline(true));

  it('reflects navigator.onLine on mount', () => {
    setNavigatorOnline(false);
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(false);
  });

  it('updates when the browser fires online/offline events', () => {
    setNavigatorOnline(true);
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(true);

    act(() => window.dispatchEvent(new Event('offline')));
    expect(result.current).toBe(false);

    act(() => window.dispatchEvent(new Event('online')));
    expect(result.current).toBe(true);
  });
});

describe('OfflineBanner — says what still works (item 25)', () => {
  afterEach(() => setNavigatorOnline(true));

  it('names what works and what might not, not just "offline"', async () => {
    setNavigatorOnline(false);
    const { default: OfflineBanner } = await import('../components/OfflineBanner.jsx');
    render(createElement(OfflineBanner));
    const banner = screen.getByRole('status');
    expect(banner.textContent).toMatch(/kartu.*kuis.*SRS.*tetap jalan/);
    expect(banner.textContent).toMatch(/Audio.*Gist.*mungkin tidak tersedia/);
  });
});

describe('ExportMode — Gist buttons check online status before attempting (item 25)', () => {
  beforeEach(() => {
    localStorage.clear();
  });
  afterEach(() => setNavigatorOnline(true));

  async function renderExport() {
    const { _reset_for_test, init } = await import('../storage/engine.js');
    _reset_for_test();
    init();
    const { ToastProvider } = await import('../components/Toast.jsx');
    const { default: ExportMode } = await import('../modes/ExportMode.jsx');
    render(createElement(ToastProvider, null, createElement(ExportMode, { onExit: () => {} })));
    fireEvent.click(screen.getByText(/Sinkronisasi Gist/));
  }

  it('shows an inline offline explanation in the Gist panel when offline', async () => {
    setNavigatorOnline(false);
    await renderExport();
    expect(screen.getByText(/Offline sekarang/)).toBeInTheDocument();
    expect(screen.getByText(/Push\/Pull butuh koneksi internet/)).toBeInTheDocument();
  });

  it('does not show the offline explanation when online', async () => {
    setNavigatorOnline(true);
    await renderExport();
    expect(screen.queryByText(/Offline sekarang/)).toBeNull();
  });

  it('Push button is disabled while offline even with a token entered', async () => {
    setNavigatorOnline(false);
    await renderExport();
    fireEvent.change(screen.getByLabelText(/GitHub Personal Access Token/), {
      target: { value: 'ghp_faketoken' },
    });
    expect(screen.getByText('⬆ Push').closest('button')).toBeDisabled();
  });
});

describe('DengarMode — a real speech failure surfaces a toast, not silence (item 25)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    setNavigatorOnline(true);
    vi.doUnmock('../utils/speak.js');
  });

  const CARDS = [
    { id: 1, jp: '安全', id_text: 'keselamatan', category: 'x', module: 'lifeline' },
    { id: 2, jp: '危険', id_text: 'bahaya', category: 'x', module: 'lifeline' },
  ];

  // canSpeak() is false in jsdom (no speechSynthesis at all), which makes
  // DengarMode disable its own "Mulai Latihan" button before a session can
  // even start -- correct existing behavior, but it means jsdom's natural
  // environment can't reach "the API exists but this specific call failed",
  // which is the actual case this item's onError wiring is for. Mocking
  // canSpeak -> true and speakJP -> synchronously fails tests that
  // specific path directly instead.
  async function renderDengarWithFailingAudio() {
    vi.doMock('../utils/speak.js', () => ({
      canSpeak: () => true,
      speakJP: (text, opts) => opts?.onError?.(new Error('mock synthesis failure')),
      stopSpeech: () => {},
    }));
    vi.resetModules();
    const { _reset_for_test, init } = await import('../storage/engine.js');
    _reset_for_test();
    init();
    const { ToastProvider } = await import('../components/Toast.jsx');
    const { AppProvider } = await import('../contexts/AppContext.jsx');
    const { ProgressProvider } = await import('../contexts/ProgressContext.jsx');
    const { default: DengarMode } = await import('../modes/DengarMode.jsx');
    render(
      createElement(
        ToastProvider,
        null,
        createElement(
          AppProvider,
          null,
          createElement(
            ProgressProvider,
            null,
            createElement(DengarMode, { cards: CARDS, allCards: CARDS, onExit: () => {} })
          )
        )
      )
    );
  }

  it('a failed playback shows a toast rather than staying silent', async () => {
    await renderDengarWithFailingAudio();
    fireEvent.click(screen.getByText('Mulai Latihan'));
    await act(async () => {
      vi.advanceTimersByTime(400); // past the 300ms auto-speak delay
    });
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('only warns once per session, not once per failed card', async () => {
    await renderDengarWithFailingAudio();
    fireEvent.click(screen.getByText('Mulai Latihan'));
    await act(async () => {
      vi.advanceTimersByTime(400);
    });
    const alertsAfterFirst = screen.getAllByRole('alert').length;

    const replayBtn = screen.getByRole('button', { name: 'Putar audio' });
    fireEvent.click(replayBtn);
    expect(screen.getAllByRole('alert').length).toBe(alertsAfterFirst);
  });
});
