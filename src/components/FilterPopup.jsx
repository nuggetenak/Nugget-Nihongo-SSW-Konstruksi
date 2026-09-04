// ─── FilterPopup.jsx ──────────────────────────────────────────────────────────
// Multi-select category picker with live per-category counts.
//
// Lived unwired at legacy/unwired-app-code/ since 2026-08-18 (UI_UX_PLAN item
// 55) waiting on FlashcardMode's filter state to grow from a single `__cat:`
// search string into a real set. That happened, so this graduated into src/.
//
// Two things changed on the way in:
//   1. Backdrop/panel/handle now come from Sheet.jsx, which carries the focus
//      trap and Escape-to-close this never had. Sheet's own header says it was
//      extracted so a second modal implementation wouldn't grow beside it --
//      this is not going to be the third.
//   2. Counts are computed from the `cards` prop, not from the CARDS module.
//      The old buildCounts() filtered the global corpus by track/vocabMode --
//      two concepts FlashcardMode doesn't have -- and reported 1438-card totals
//      even when the mode was launched from SumberMode scoped to one source.
//
// Note: per-category color on .cell bg/border/count -- justified inline.
import { useState } from 'react';
import { T } from '../styles/theme.js';
import { CATEGORIES } from '../data/categories.js';
import Sheet from './Sheet.jsx';
import S from './FilterPopup.module.css';

const TITLE_ID = 'filter-popup-title';

function buildCounts(cards) {
  const counts = {};
  cards.forEach((c) => {
    counts[c.category] = (counts[c.category] || 0) + 1;
  });
  counts.all = cards.length;
  return counts;
}

export default function FilterPopup({
  isOpen,
  onClose,
  cards,
  activeCats,
  onApply,
  starredCount = 0,
}) {
  if (!isOpen) return null;
  return (
    // Remounting on the active set means "open, fiddle, close without applying"
    // reliably reopens on what is actually applied, not on the abandoned draft.
    <FilterPopupInner
      key={[...activeCats].sort().join('|')}
      onClose={onClose}
      cards={cards}
      activeCats={activeCats}
      onApply={onApply}
      starredCount={starredCount}
    />
  );
}

function FilterPopupInner({ onClose, cards, activeCats, onApply, starredCount }) {
  const [pendingCats, setPendingCats] = useState(new Set(activeCats));
  const counts = buildCounts(cards);

  // Zero-count categories are hidden rather than dimmed. With a filterIds deck
  // most of the 11 are empty, and eight greyed rows is not a useful picker.
  const visibleCats = CATEGORIES.filter(
    (c) => c.key !== 'all' && c.key !== 'bintang' && (counts[c.key] || 0) > 0
  );

  const pendingAll = pendingCats.has('all');

  const togglePending = (key) => {
    setPendingCats((prev) => {
      if (key === 'all' || key === 'bintang') return new Set([key]);
      const next = new Set(prev);
      next.delete('all');
      next.delete('bintang');
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next.size === 0 ? new Set(['all']) : next;
    });
  };

  const pendingCount = pendingCats.has('all')
    ? counts.all
    : pendingCats.has('bintang')
      ? starredCount
      : [...pendingCats].reduce((sum, k) => sum + (counts[k] || 0), 0);

  const pendingCatCount =
    pendingCats.has('all') || pendingCats.has('bintang') ? 0 : pendingCats.size;

  const handleApply = () => {
    onApply(pendingCats);
    onClose();
  };

  return (
    <Sheet onClose={onClose} labelledBy={TITLE_ID}>
      <div className={S.titleRow}>
        <span className={S.titleText} id={TITLE_ID}>
          Filter Kategori
        </span>
        <button className={S.btnClose} onClick={onClose} aria-label="Tutup filter">
          ✕
        </button>
      </div>

      {/* All row */}
      <button
        className={S.allRow}
        data-active={String(pendingAll)}
        aria-pressed={pendingAll}
        onClick={() => togglePending('all')}
      >
        <span>📚 Semua kategori</span>
        <span className={S.allCount}>{counts.all}</span>
      </button>

      <div className={S.grid}>
        {starredCount > 0 && (
          <button
            className={S.cell}
            onClick={() => togglePending('bintang')}
            aria-pressed={pendingCats.has('bintang')}
            style={{
              background: pendingCats.has('bintang') ? 'rgba(251,191,36,0.15)' : T.surface,
              border: `1.5px solid ${pendingCats.has('bintang') ? T.gold : T.border}`,
            }}
          >
            <span className={S.cellEmoji}>⭐</span>
            <span className={S.cellLabel}>Bintang</span>
            <span className={S.cellCount} style={{ color: T.gold }}>
              {starredCount}
            </span>
          </button>
        )}
        {visibleCats.map((cat) => {
          const active = pendingCats.has(cat.key);
          return (
            <button
              key={cat.key}
              className={S.cell}
              onClick={() => togglePending(cat.key)}
              aria-pressed={active}
              style={{
                background: active ? `${cat.color}18` : T.surface,
                border: `1.5px solid ${active ? `${cat.color}60` : T.border}`,
              }}
            >
              <span className={S.cellEmoji}>{cat.emoji}</span>
              <span className={S.cellLabel} style={{ fontFamily: T.fontJP }}>
                {cat.label}
              </span>
              <span className={S.cellCount} style={{ color: active ? cat.color : T.textDim }}>
                {counts[cat.key]}
              </span>
            </button>
          );
        })}
      </div>

      <div className={S.footer}>
        <button className={S.applyBtn} onClick={handleApply}>
          {pendingCatCount > 0
            ? `✓ Terapkan ${pendingCatCount} kategori (${pendingCount} kartu)`
            : `✓ Terapkan (${pendingCount} kartu)`}
        </button>
      </div>
    </Sheet>
  );
}
