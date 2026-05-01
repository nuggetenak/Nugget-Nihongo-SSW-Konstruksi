// ─── FlashcardMode/ToolStrip.jsx (phaseE) ────────────────────────────────────
// Sort / filter-belum / reset / star filter tool strip.
// ─────────────────────────────────────────────────────────────────────────────
import { T } from '../../styles/theme.js';
import FC from './flashcard.module.css';

export default function ToolStrip({
  sortMode,
  onCycleSort,
  reviewBelum,
  onToggleBelum,
  unknownInView,
  confirmReset,
  onReset,
  starredCount,
  starFilterActive,
  onToggleStarFilter,
  flipped,
  rated,
}) {
  const tools = [
    {
      emoji: sortMode === 'original' ? '⏮' : sortMode === 'shuffle' ? '🔀' : '🎯',
      label: sortMode === 'original' ? 'Urut' : sortMode === 'shuffle' ? 'Acak' : 'Prioritas',
      active: sortMode !== 'priority',
      onClick: onCycleSort,
    },
    {
      emoji: '❌',
      label: unknownInView > 0 ? `${unknownInView}` : 'Belum',
      active: reviewBelum,
      border: T.wrongBorder, bg: T.wrongBg, color: T.wrong,
      onClick: onToggleBelum,
    },
    {
      emoji: '🔄',
      label: confirmReset ? 'Yakin?' : 'Reset',
      active: confirmReset,
      border: T.wrongBorder, bg: T.wrongBg, color: T.wrong,
      onClick: onReset,
    },
    {
      emoji: '⭐',
      label: starredCount > 0 ? `${starredCount}` : 'Bintang',
      active: starFilterActive,
      border: `${T.gold}80`, bg: 'rgba(251,191,36,0.12)', color: T.gold,
      onClick: onToggleStarFilter,
    },
  ];

  return (
    <>
      <div className={FC.toolGrid}>
        {tools.map((btn, i) => (
          <button
            key={i}
            className={FC.toolBtn}
            onClick={btn.onClick}
            style={{
              border: `1px solid ${btn.active ? (btn.border || T.borderActive) : T.border}`,
              background: btn.active ? (btn.bg || T.surfaceActive) : T.surface,
              color: btn.active ? (btn.color || T.amber) : T.textMuted,
            }}
          >
            <span>{btn.emoji}</span>
            <span>{btn.label}</span>
          </button>
        ))}
      </div>
      {flipped && !rated && (
        <div className={FC.kbHint} style={{ color: T.textFaint }}>
          Keyboard: 1 Lagi · 2 Susah · 3 Oke · 4 Mudah
        </div>
      )}
    </>
  );
}
