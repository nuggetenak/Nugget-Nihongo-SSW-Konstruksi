// ─── tests/components.dashboard.test.jsx ─────────────────────────────────────
// Component tests for Dashboard — rendering, CTA logic, navigation, quick modes.
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Dashboard from '../components/Dashboard.jsx';
import { ProgressProvider } from '../contexts/ProgressContext.jsx';
import { _reset_for_test, init, set } from '../storage/engine.js';

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
  track: 'lifeline',
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
      renderDashboard({ isDark: true });
      // Dark mode shows sun icon
      expect(screen.getByText('☀️')).toBeTruthy();
    });

    it('shows moon icon in light mode', () => {
      renderDashboard({ isDark: false });
      expect(screen.getByText('🌙')).toBeTruthy();
    });

    it('calls onToggleTheme when theme button clicked', () => {
      const onToggleTheme = vi.fn();
      renderDashboard({ onToggleTheme: onToggleTheme });
      fireEvent.click(screen.getByText('☀️'));
      expect(onToggleTheme).toHaveBeenCalledOnce();
    });

    it('calls onChangeTrack when track pill clicked', () => {
      const onChangeTrack = vi.fn();
      renderDashboard({ onChangeTrack: onChangeTrack });
      fireEvent.click(screen.getByText(/ライフライン/));
      expect(onChangeTrack).toHaveBeenCalledOnce();
    });
  });

  describe('progress ring', () => {
    it('shows 0 kartu hafal when known is empty', () => {
      renderDashboard({ known: new Set() });
      expect(screen.getByText('0 kartu hafal')).toBeTruthy();
    });

    it('shows correct count when known has cards', () => {
      renderDashboard({ known: new Set([1, 2, 3, 4, 5]) });
      expect(screen.getByText('5 kartu hafal')).toBeTruthy();
    });

    it('shows unknown count in detail text', () => {
      renderDashboard({ unknown: new Set([10, 11, 12]) });
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
      renderDashboard({ onNavigate: onNavigate });
      fireEvent.click(screen.getByText('Kuis'));
      expect(onNavigate).toHaveBeenCalledWith('kuis');
    });

    it('navigates to sprint mode', () => {
      const onNavigate = vi.fn();
      renderDashboard({ onNavigate: onNavigate });
      fireEvent.click(screen.getByText('Sprint'));
      expect(onNavigate).toHaveBeenCalledWith('sprint');
    });
  });

  describe('streak hero', () => {
    it('shows the real streak count once streak >= 2', () => {
      renderDashboard();
      expect(screen.queryByText(/hari berturut-turut!/)).toBeNull();
    });

    it('shows a start-a-streak prompt instead of nothing when streak < 2', () => {
      // Item 12: this slot used to render nothing at all below 2 days —
      // one of five conditional Dashboard blocks a brand-new user saw none
      // of. Now always shows one of the two states.
      renderDashboard();
      expect(screen.getByText('Mulai streak-mu')).toBeTruthy();
    });
  });

  describe('empty-state prompts (item 12)', () => {
    it('shows a set-exam-date prompt when no exam date is set, and it navigates to Saya', () => {
      const onGoTab = vi.fn();
      renderDashboard({ onGoTab });
      const prompt = screen.getByText('Belum atur tanggal ujian');
      expect(prompt).toBeTruthy();
      fireEvent.click(prompt);
      expect(onGoTab).toHaveBeenCalledWith('saya');
    });

    it('shows a nothing-recent prompt when recentCards is empty', () => {
      renderDashboard();
      expect(screen.getByText('Belum ada kartu dipelajari')).toBeTruthy();
    });
  });

  describe('track variants', () => {
    it('falls back to lifeline theme for a removed/unknown track value (e.g. stale localStorage from before the merge)', () => {
      renderDashboard({ track: 'doboku' });
      expect(screen.getByText(/ライフライン/)).toBeTruthy();
    });

    it('renders lifeline track', () => {
      renderDashboard({ track: 'lifeline' });
      expect(screen.getByText(/ライフライン/)).toBeTruthy();
    });
  });

  describe('exam-readiness band (item 56)', () => {
    const inDays = (n) => new Date(Date.now() + n * 86400000).toISOString();

    it('shows no band when no exam date is set (the default fixture)', () => {
      renderDashboard();
      expect(screen.queryByText(/Siap$/)).toBeNull();
      expect(screen.queryByText('Kurang siap')).toBeNull();
      expect(screen.queryByText('Cukup siap')).toBeNull();
    });

    it('shows no band when an exam date is set but there is not enough session history yet', () => {
      set('prefs', (p) => ({ ...p, examDate: inDays(30) }));
      set('progress', (p) => ({
        ...p,
        sessions: [{ mode: 'kuis', correct: 5, total: 10, date: new Date().toISOString() }],
      }));
      renderDashboard();
      expect(screen.queryByText('Kurang siap')).toBeNull();
      expect(screen.queryByText('Cukup siap')).toBeNull();
      expect(screen.queryByText('Siap')).toBeNull();
    });

    it('shows "Siap" for strong recent performance with an exam date set', () => {
      set('prefs', (p) => ({ ...p, examDate: inDays(30) }));
      set('progress', (p) => ({
        ...p,
        sessions: Array.from({ length: 6 }, () => ({
          mode: 'kuis',
          correct: 10,
          total: 10,
          date: new Date().toISOString(),
        })),
        streakData: { days: 14 },
      }));
      renderDashboard({ srs: { dueCount: 0, stats: { total: 100, mature: 90, review: 5 } } });
      expect(screen.getByText('Siap')).toBeTruthy();
    });

    it('shows no band on exam day itself, even with strong data (too late to act on it)', () => {
      set('prefs', (p) => ({ ...p, examDate: inDays(0) }));
      set('progress', (p) => ({
        ...p,
        sessions: Array.from({ length: 6 }, () => ({
          mode: 'kuis',
          correct: 10,
          total: 10,
          date: new Date().toISOString(),
        })),
        streakData: { days: 14 },
      }));
      renderDashboard({ srs: { dueCount: 0, stats: { total: 100, mature: 90, review: 5 } } });
      expect(screen.queryByText('Siap')).toBeNull();
    });
  });
});
