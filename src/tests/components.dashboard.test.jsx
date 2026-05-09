// ─── tests/components.dashboard.test.jsx ─────────────────────────────────────
// Component tests for Dashboard — rendering, CTA logic, navigation, quick modes.
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Dashboard from '../components/Dashboard.jsx';
import { ProgressProvider } from '../contexts/ProgressContext.jsx';
import { _reset_for_test, init } from '../storage/engine.js';

function renderDashboard(props = {}) {
  return render(
    <ProgressProvider>
      <Dashboard {...defaultProps} {...props} />
    </ProgressProvider>
  );
}

const defaultProps = {
  known: new Set(),
  unknown: new Set(),
  track: 'doboku',
  onNavigate: vi.fn(),
  onChangeTrack: vi.fn(),
  srs: { dueCount: 0 },
  isDark: true,
  onToggleTheme: vi.fn(),
};

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    _reset_for_test();
    init();
  });

  describe('header', () => {
    it('renders brand name', () => {
      renderDashboard();
      expect(screen.getByText('SSW Konstruksi')).toBeTruthy();
    });

    it('renders Nugget Nihongo subtitle', () => {
      renderDashboard();
      expect(screen.getByText(/Nugget Nihongo/)).toBeTruthy();
    });

    it('renders theme toggle button', () => {
      renderDashboard({isDark: true });
      // Dark mode shows sun icon
      expect(screen.getByText('☀️')).toBeTruthy();
    });

    it('shows moon icon in light mode', () => {
      renderDashboard({isDark: false });
      expect(screen.getByText('🌙')).toBeTruthy();
    });

    it('calls onToggleTheme when theme button clicked', () => {
      const onToggleTheme = vi.fn();
      renderDashboard({onToggleTheme: onToggleTheme });
      fireEvent.click(screen.getByText('☀️'));
      expect(onToggleTheme).toHaveBeenCalledOnce();
    });

    it('calls onChangeTrack when track pill clicked', () => {
      const onChangeTrack = vi.fn();
      renderDashboard({onChangeTrack: onChangeTrack });
      fireEvent.click(screen.getByText(/土木/));
      expect(onChangeTrack).toHaveBeenCalledOnce();
    });
  });

  describe('progress ring', () => {
    it('shows 0 kartu hafal when known is empty', () => {
      renderDashboard({known: new Set() });
      expect(screen.getByText('0 kartu hafal')).toBeTruthy();
    });

    it('shows correct count when known has cards', () => {
      renderDashboard({known: new Set([1, 2, 3, 4, 5]) });
      expect(screen.getByText('5 kartu hafal')).toBeTruthy();
    });

    it('shows unknown count in detail text', () => {
      renderDashboard({unknown: new Set([10, 11, 12]) });
      expect(screen.getByText(/3 belum/)).toBeTruthy();
    });
  });

  describe('smart CTA logic', () => {
    it('shows SRS review CTA when dueCount > 0', () => {
      renderDashboard({ srs: { dueCount: 20, stats: { mature: 0 } } });
      // A2: recommendMode returns 'Ulasan SRS' for dueCount >= 20
      expect(screen.getByText(/Ulasan SRS/)).toBeTruthy();
    });

    it('navigates to ulasan when SRS CTA clicked', () => {
      const onNavigate = vi.fn();
      renderDashboard({ srs: { dueCount: 20, stats: { mature: 0 } }, onNavigate });
      fireEvent.click(screen.getByText(/Ulasan SRS/));
      expect(onNavigate).toHaveBeenCalledWith('ulasan');
    });

    it('shows Mode Kartu when known is empty and no SRS due', () => {
      renderDashboard({ known: new Set(), srs: { dueCount: 0, stats: { mature: 0 } } });
      // A2: streak=0 → recommend kartu
      expect(screen.getByText(/Mode Kartu/)).toBeTruthy();
    });

    it('navigates to kartu when Mode Kartu CTA clicked', () => {
      const onNavigate = vi.fn();
      renderDashboard({ known: new Set(), srs: { dueCount: 0, stats: { mature: 0 } }, onNavigate });
      fireEvent.click(screen.getByText(/Mode Kartu/));
      expect(onNavigate).toHaveBeenCalledWith('kartu');
    });
  });

  describe('quick mode grid', () => {
    it('renders 4 quick action tiles', () => {
      renderDashboard();
      expect(screen.getByText('Kartu')).toBeTruthy();
      expect(screen.getByText('Kuis')).toBeTruthy();
      expect(screen.getByText('Sprint')).toBeTruthy();
      expect(screen.getByText('JAC')).toBeTruthy();
    });

    it('navigates to correct mode when quick tile clicked', () => {
      const onNavigate = vi.fn();
      renderDashboard({onNavigate: onNavigate });
      fireEvent.click(screen.getByText('Kuis'));
      expect(onNavigate).toHaveBeenCalledWith('kuis');
    });

    it('navigates to sprint mode', () => {
      const onNavigate = vi.fn();
      renderDashboard({onNavigate: onNavigate });
      fireEvent.click(screen.getByText('Sprint'));
      expect(onNavigate).toHaveBeenCalledWith('sprint');
    });
  });

  describe('streak hero', () => {
    it('does not show streak hero when streak < 2', () => {
      renderDashboard();
      // No "hari berturut-turut" text
      expect(screen.queryByText(/hari berturut-turut/)).toBeNull();
    });
  });

  describe('track variants', () => {
    it('renders doboku track', () => {
      renderDashboard({ track: 'doboku' });
      expect(screen.getByText(/土木/)).toBeTruthy();
    });

    it('renders bangunan track', () => {
      renderDashboard({ track: 'kenchiku' });
      expect(screen.getByText(/建築/)).toBeTruthy();
    });

    it('renders lifeline track', () => {
      renderDashboard({ track: 'lifeline' });
      expect(screen.getByText(/ライフライン/)).toBeTruthy();
    });
  });
});
