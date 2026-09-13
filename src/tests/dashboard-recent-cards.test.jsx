// ─── tests/dashboard-recent-cards.test.jsx ───────────────────────────────────
// "Terakhir dipelajari" rows looked tappable and were inert <li>s -- the one
// interactive-looking block on Beranda that was never wired up. They open the
// card now, through the app's existing deep-link convention rather than a new
// prop: goMode('kartu', { filterIds: [id] }), the same call SumberMode and
// every retry-wrong bridge already make.
//
// The banner half matters as much: that convention used to paint a red
// "❌ Latihan kartu salah" over any filtered deck, so opening a card you just
// studied would have accused you of getting it wrong.
//
// The rows arrive asynchronously as of 2026-09-13, hence the `waitFor`s. The card
// *content* they need is the only thing on Beranda that wants the corpus, and
// importing it eagerly for three rows put 212 kB gzipped ahead of the home screen's
// first paint. Everything else here comes from the progress and SRS documents. So the
// strip appears a beat after the rest of the screen, which is what these tests now
// assert — and the empty case below stays synchronous, because with no recent ids
// there is nothing to fetch.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LZString from 'lz-string';
import Dashboard from '../components/Dashboard.jsx';
import { ProgressProvider } from '../contexts/ProgressContext.jsx';
import { _reset_for_test, init } from '../storage/engine.js';
import { STORAGE_VERSION, DOCS, DEFAULTS } from '../storage/schema.js';
import { CARDS } from '../data/cards.js';

function seedRecent(ids) {
  const write = (k, d) => localStorage.setItem(k, LZString.compressToUTF16(JSON.stringify(d)));
  write(DOCS.progress, { ...DEFAULTS.progress, _v: STORAGE_VERSION, recentCards: ids });
  write(DOCS.srs, { ...DEFAULTS.srs, _v: STORAGE_VERSION });
  write(DOCS.prefs, { ...DEFAULTS.prefs, _v: STORAGE_VERSION });
}

// known/unknown are Sets here, as in components.dashboard.test.jsx -- the
// component calls .size on them.
function renderDash(props = {}) {
  return render(
    <ProgressProvider>
      <Dashboard
        known={new Set()}
        unknown={new Set()}
        track="lifeline"
        onNavigate={vi.fn()}
        onChangeTrack={vi.fn()}
        srs={{ dueCount: 0 }}
        theme="light"
        onToggleTheme={vi.fn()}
        {...props}
      />
    </ProgressProvider>
  );
}

beforeEach(() => {
  localStorage.clear();
  _reset_for_test();
});

describe('recently studied rows', () => {
  it('renders each row as a real button', async () => {
    seedRecent([CARDS[0].id]);
    init();
    renderDash();
    await waitFor(() =>
      expect(screen.getAllByRole('button', { name: /Buka kartu/ }).length).toBeGreaterThan(0)
    );
  });

  it('opens the tapped card in kartu, scoped to that one id', async () => {
    const card = CARDS[3];
    seedRecent([card.id]);
    init();
    const onNavigate = vi.fn();
    renderDash({ onNavigate });

    await waitFor(() => screen.getByRole('button', { name: /Buka kartu/ }));
    fireEvent.click(screen.getByRole('button', { name: /Buka kartu/ }));
    expect(onNavigate).toHaveBeenCalledWith('kartu', {
      filterIds: [card.id],
      filterReason: 'recent',
    });
  });

  it('names the button from the stripped headword, not raw 《》 markup', async () => {
    const withRuby = CARDS.find((c) => c.jp.includes('《'));
    expect(withRuby, 'no ruby-bearing card in the corpus to test with').toBeTruthy();
    seedRecent([withRuby.id]);
    init();
    renderDash();
    const btn = await waitFor(() => screen.getByRole('button', { name: /Buka kartu/ }));
    expect(btn.getAttribute('aria-label')).not.toContain('《');
  });

  it('still shows the empty prompt when nothing has been studied', () => {
    // Synchronous on purpose: no recent ids means no import, so this asserts the
    // absence without a wait that could hide a regression behind a timeout.
    seedRecent([]);
    init();
    renderDash();
    expect(screen.queryByRole('button', { name: /Buka kartu/ })).toBeNull();
  });

  it('paints the rest of Beranda without waiting for the corpus', async () => {
    // The point of the change, stated as the user sees it: the screen is usable on
    // the first frame and the strip catches up. The heading belongs to the strip, so
    // it is absent at first too — what has to be there immediately is everything
    // built from the progress and SRS documents.
    seedRecent([CARDS[0].id]);
    init();
    renderDash();

    expect(screen.getByText('SSW Konstruksi')).toBeTruthy();
    expect(screen.getByText('Mulai belajar')).toBeTruthy();
    expect(screen.queryByRole('button', { name: /Buka kartu/ })).toBeNull();

    // …and then it arrives, so this is a delay rather than a loss.
    await waitFor(() => expect(screen.getByText(/Terakhir dipelajari/)).toBeTruthy());
  });
});
