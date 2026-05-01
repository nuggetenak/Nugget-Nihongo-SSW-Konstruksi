// ─── FilterPopup.jsx ──────────────────────────────────────────────────────────
// Note: per-category color on .cell bg/border/count — justified inline.
import { useState } from 'react';
import { T } from '../styles/theme.js';
import { CARDS } from '../data/cards.js';
import { CATEGORIES, getCatsForTrack, VOCAB_SOURCES } from '../data/categories.js';
import S from './FilterPopup.module.css';

function buildCounts(track, vocabMode) {
  const trackCatKeys = track ? new Set(getCatsForTrack(track)) : null;
  const counts = {};
  CARDS.forEach((c) => {
    const isVocab = VOCAB_SOURCES.includes(c.source);
    if (vocabMode !== isVocab) return;
    if (trackCatKeys && !trackCatKeys.has(c.category)) return;
    counts[c.category] = (counts[c.category] || 0) + 1;
  });
  counts.all = Object.values(counts).reduce((a, b) => a + b, 0);
  return counts;
}

export default function FilterPopup({ isOpen, onClose, track, vocabMode, activeCats, onApply, starredCount = 0 }) {
  if (!isOpen) return null;
  return (
    <FilterPopupInner
      key={JSON.stringify([...activeCats])}
      onClose={onClose}
      track={track}
      vocabMode={vocabMode}
      activeCats={activeCats}
      onApply={onApply}
      starredCount={starredCount}
    />
  );
}

function FilterPopupInner({ onClose, track, vocabMode, activeCats, onApply, starredCount }) {
  const [pendingCats, setPendingCats] = useState(new Set(activeCats));
  const counts = buildCounts(track, vocabMode);
  const trackCatKeys = track ? new Set(getCatsForTrack(track)) : null;

  const visibleCats = CATEGORIES.filter(
    (c) => c.key !== 'all' && (c.key === 'bintang' || !trackCatKeys || trackCatKeys.has(c.key))
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

  const pendingCatCount = pendingCats.has('all') ? 0 : pendingCats.size;

  const handleApply = () => { onApply(pendingCats); onClose(); };

  return (
    <>
      <div className={S.backdrop} onClick={onClose} />
      <div className={S.sheet} role="dialog" aria-modal="true" aria-label="Filter Kategori">
        <div className={S.handle} />
        <div className={S.titleRow}>
          <span className={S.titleText}>Filter Kategori</span>
          <button className={S.btnClose} onClick={onClose} aria-label="Tutup filter">✕</button>
        </div>

        <div className={S.scroll}>
          {/* All row */}
          <button
            className={S.allRow}
            data-active={String(pendingAll)}
            onClick={() => togglePending('all')}
          >
            <span>📚 すべて</span>
            <span className={S.allCount}>{counts.all}</span>
          </button>

          {/* 3-col grid */}
          <div className={S.grid}>
            {starredCount > 0 && (
              <button
                className={S.cell}
                onClick={() => togglePending('bintang')}
                style={{
                  background: pendingCats.has('bintang') ? 'rgba(251,191,36,0.15)' : T.surface,
                  border: `1.5px solid ${pendingCats.has('bintang') ? T.gold : T.border}`,
                }}
              >
                <span className={S.cellEmoji}>⭐</span>
                <span className={S.cellLabel}>Bintang</span>
                <span className={S.cellCount} style={{ color: T.gold }}>{starredCount}</span>
              </button>
            )}
            {visibleCats.filter((c) => c.key !== 'bintang').map((cat) => {
              const active = pendingCats.has(cat.key);
              const cnt = counts[cat.key] || 0;
              return (
                <button
                  key={cat.key}
                  className={S.cell}
                  onClick={() => togglePending(cat.key)}
                  style={{
                    background: active ? `${cat.color}18` : T.surface,
                    border: `1.5px solid ${active ? cat.color + '60' : T.border}`,
                    opacity: cnt === 0 ? 0.4 : 1,
                  }}
                >
                  <span className={S.cellEmoji}>{cat.emoji}</span>
                  <span className={S.cellLabel} style={{ fontFamily: T.fontJP }}>{cat.label}</span>
                  <span className={S.cellCount} style={{ color: active ? cat.color : T.textDim }}>{cnt}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className={S.footer}>
          <button className={S.applyBtn} onClick={handleApply}>
            {pendingCatCount > 0
              ? `✓ Terapkan ${pendingCatCount} kategori (${pendingCount} kartu)`
              : `✓ Terapkan semua (${pendingCount} kartu)`}
          </button>
        </div>
      </div>
    </>
  );
}
