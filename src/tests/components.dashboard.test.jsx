// ─── tests/components.dashboard.test.jsx ─────────────────────────────────────
// Component tests for Dashboard — rendering, CTA logic, navigation, quick modes.
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Dashboard from '../components/Dashboard.jsx';
import { _reset_for_test, init } from '../storage/engine.js';

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
      render(<Dashboard {...defaultProps} />);
      expect(screen.getByText('SSW Konstruksi')).toBeTruthy();
    });

    it('renders Nugget Nihongo subtitle', () => {
      render(<Dashboard {...defaultProps} />);
      expect(screen.getByText(/Nugget Nihongo/)).toBeTruthy();
    });

    it('renders theme toggle button', () => {
      render(<Dashboard {...defaultProps} isDark={true} />);
      // Dark mode shows sun icon
      expect(screen.getByText('☀️')).toBeTruthy();
    });

    it('shows moon icon in light mode', () => {
      render(<Dashboard {...defaultProps} isDark={false} />);
      expect(screen.getByText('🌙')).toBeTruthy();
    });

    it('calls onToggleTheme when theme button clicked', () => {
      const onToggleTheme = vi.fn();
      render(<Dashboard {...defaultProps} onToggleTheme={onToggleTheme} />);
      fireEvent.click(screen.getByText('☀️'));
      expect(onToggleTheme).toHaveBeenCalledOnce();
    });

    it('calls onChangeTrack when track pill clicked', () => {
      const onChangeTrack = vi.fn();
      render(<Dashboard {...defaultProps} onChangeTrack={onChangeTrack} />);
      fireEvent.click(screen.getByText(/土木/));
      expect(onChangeTrack).toHaveBeenCalledOnce();
    });
  });

  describe('progress ring', () => {
    it('shows 0 kartu hafal when known is empty', () => {
      render(<Dashboard {...defaultProps} known={new Set()} />);
      expect(screen.getByText('0 kartu hafal')).toBeTruthy();
    });

    it('shows correct count when known has cards', () => {
      render(<Dashboard {...defaultProps} known={new Set([1, 2, 3, 4, 5])} />);
      expect(screen.getByText('5 kartu hafal')).toBeTruthy();
    });

    it('shows unknown count in detail text', () => {
      render(<Dashboard {...defaultProps} unknown={new Set([10, 11, 12])} />);
      expect(screen.getByText(/3 belum/)).toBeTruthy();
    });
  });

  describe('smart CTA logic', () => {
    it('shows SRS review CTA when dueCount > 0', () => {
      render(<Dashboard {...defaultProps} srs={{ dueCount: 5 }} />);
      expect(screen.getByText(/5 kartu siap diulang/)).toBeTruthy();
    });

    it('navigates to ulasan when SRS CTA clicked', () => {
      const onNavigate = vi.fn();
      render(<Dashboard {...defaultProps} srs={{ dueCount: 5 }} onNavigate={onNavigate} />);
      fireEvent.click(screen.getByText(/5 kartu siap diulang/));
      expect(onNavigate).toHaveBeenCalledWith('ulasan');
    });

    it('shows Mulai dari Kartu when known is empty and no SRS due', () => {
      render(<Dashboard {...defaultProps} known={new Set()} srs={{ dueCount: 0 }} />);
      expect(screen.getByText(/Mulai dari Kartu/)).toBeTruthy();
    });

    it('navigates to kartu when Mulai CTA clicked', () => {
      const onNavigate = vi.fn();
      render(<Dashboard {...defaultProps} known={new Set()} srs={{ dueCount: 0 }} onNavigate={onNavigate} />);
      // Click the CTA button (contains the label)
      fireEvent.click(screen.getByText(/Mulai dari Kartu/));
      expect(onNavigate).toHaveBeenCalledWith('kartu');
    });
  });

  describe('quick mode grid', () => {
    it('renders 4 quick action tiles', () => {
      render(<Dashboard {...defaultProps} />);
      expect(screen.getByText('Kartu')).toBeTruthy();
      expect(screen.getByText('Kuis')).toBeTruthy();
      expect(screen.getByText('Sprint')).toBeTruthy();
      expect(screen.getByText('JAC')).toBeTruthy();
    });

    it('navigates to correct mode when quick tile clicked', () => {
      const onNavigate = vi.fn();
      render(<Dashboard {...defaultProps} onNavigate={onNavigate} />);
      fireEvent.click(screen.getByText('Kuis'));
      expect(onNavigate).toHaveBeenCalledWith('kuis');
    });

    it('navigates to sprint mode', () => {
      const onNavigate = vi.fn();
      render(<Dashboard {...defaultProps} onNavigate={onNavigate} />);
      fireEvent.click(screen.getByText('Sprint'));
      expect(onNavigate).toHaveBeenCalledWith('sprint');
    });
  });

  describe('streak hero', () => {
    it('does not show streak hero when streak < 2', () => {
      render(<Dashboard {...defaultProps} />);
      // No "hari berturut-turut" text
      expect(screen.queryByText(/hari berturut-turut/)).toBeNull();
    });
  });

  describe('track variants', () => {
    it('renders doboku track', () => {
      render(<Dashboard {...defaultProps} track="doboku" />);
      expect(screen.getByText(/土木/)).toBeTruthy();
    });

    it('renders bangunan track', () => {
      render(<Dashboard {...defaultProps} track="kenchiku" />);
      expect(screen.getByText(/建築/)).toBeTruthy();
    });

    it('renders lifeline track', () => {
      render(<Dashboard {...defaultProps} track="lifeline" />);
      expect(screen.getByText(/ライフライン/)).toBeTruthy();
    });
  });
});
