// ─── FlashcardMode/ToolStrip.jsx ────────────────────────────────────────────
// Secondary controls for the flashcard screen.
//
// Split into two groups on purpose. Every control used to sit in one uniform
// 5-button grid, which put "Reset" — which erases all progress — one tap away
// from a star filter, at identical visual weight. It has a two-tap confirm,
// but nothing about it *looked* destructive. View controls are now a row of
// their own; reset is separated, demoted, and styled as the hazard it is.
// ─────────────────────────────────────────────────────────────────────────────
import { T } from '../../styles/theme.js';
import Icon from '../../components/Icon.jsx';
import FC from './flashcard.module.css';

export default function ToolStrip({
  sortMode,
  onCycleSort,
  reviewBelum,
  onToggleBelum,
  unknownInView,
  onReset,
  starredCount,
  starFilterActive,
  onToggleStarFilter,
  flipped,
  rated,
  readOnly,
  onToggleReadOnly,
}) {
  const sortLabel =
    sortMode === 'original' ? 'Urut' : sortMode === 'shuffle' ? 'Acak' : 'Prioritas';

  // Non-destructive: they only change what you see or how you rate.
  const viewTools = [
    {
      ui: 'tukar',
      label: sortLabel,
      aria: `Urutan kartu: ${sortLabel}. Ketuk untuk ganti`,
      active: sortMode !== 'priority',
      onClick: onCycleSort,
    },
    {
      ui: 'peringatan',
      label: unknownInView > 0 ? `${unknownInView}` : 'Belum',
      aria: `Saring kartu belum hafal${unknownInView > 0 ? ` (${unknownInView} kartu)` : ''}`,
      active: reviewBelum,
      border: T.wrongBorder,
      bg: T.wrongBg,
      color: T.wrong,
      onClick: onToggleBelum,
    },
    {
      ui: 'bintang',
      label: starredCount > 0 ? `${starredCount}` : 'Bintang',
      aria: `Saring kartu berbintang${starredCount > 0 ? ` (${starredCount} kartu)` : ''}`,
      active: starFilterActive,
      border: `${T.gold}80`,
      bg: 'rgba(251,191,36,0.12)',
      color: T.gold,
      onClick: onToggleStarFilter,
    },
    {
      ui: readOnly ? 'belajar' : 'tulis',
      label: readOnly ? 'Baca' : 'Rating',
      aria: readOnly
        ? 'Mode baca aktif. Ketuk untuk menilai kartu'
        : 'Mode rating aktif. Ketuk untuk hanya membaca',
      active: readOnly,
      border: 'rgba(99,102,241,0.4)',
      bg: 'rgba(99,102,241,0.1)',
      color: '#818cf8',
      onClick: onToggleReadOnly,
    },
  ];

  return (
    <>
      <div className={FC.toolGrid}>
        {viewTools.map((btn) => (
          <button
            key={btn.label + btn.ui}
            className={FC.toolBtn}
            onClick={btn.onClick}
            aria-label={btn.aria}
            aria-pressed={btn.active}
            style={{
              border: `1px solid ${btn.active ? btn.border || T.borderActive : T.border}`,
              background: btn.active ? btn.bg || T.surfaceActive : T.surface,
              color: btn.active ? btn.color || T.amber : T.textMuted,
            }}
          >
            <Icon name={btn.ui} size={18} />
            <span>{btn.label}</span>
          </button>
        ))}
      </div>

      {/* Destructive — separated so it cannot be mistaken for a view filter.
          Confirmation is now a real dialog (item 15) rather than a two-tap
          timer, so this button has one steady state. */}
      <button className={FC.resetBtn} onClick={onReset} aria-label="Reset semua progres belajar">
        <Icon name="ulang" size={15} />
        Reset progres
      </button>

      {flipped && !rated && (
        <div className={FC.kbHint} style={{ color: T.textFaint }}>
          Keyboard: 1 Lagi · 2 Susah · 3 Oke · 4 Mudah
        </div>
      )}
    </>
  );
}
