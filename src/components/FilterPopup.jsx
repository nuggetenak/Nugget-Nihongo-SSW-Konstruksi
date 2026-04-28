// ─── FilterPopup.jsx ──────────────────────────────────────────────────────────
// Full-screen category filter overlay — 3-col grid with counts
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import { T } from '../styles/theme.js';
import { CARDS } from '../data/cards.js';
import { CATEGORIES, getCatsForTrack, VOCAB_SOURCES } from '../data/categories.js';

// Build card count per category for a given track + vocabMode
function buildCounts(track, vocabMode) {
  const trackCatKeys = track ? new Set(getCatsForTrack(track)) : null;
  const counts = {};
  CARDS.forEach((c) => {
    const isVocab = VOCAB_SOURCES.includes(c.source);
    if (vocabMode !== isVocab) return;
    if (trackCatKeys && !trackCatKeys.has(c.category)) return;
    counts[c.category] = (counts[c.category] || 0) + 1;
  });
  // total = sum of all matched
  counts.all = Object.values(counts).reduce((a, b) => a + b, 0);
  return counts;
}

export default function FilterPopup({
  isOpen,
  onClose,
  track,
  vocabMode,
  activeCats,
  onApply,
  starredCount = 0,
}) {
  // Use a key so the inner component remounts fresh each time popup opens
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

function FilterPopupInner({
  onClose,
  track,
  vocabMode,
  activeCats,
  onApply,
  starredCount,
}) {
  const [pendingCats, setPendingCats] = useState(new Set(activeCats));
  const counts = buildCounts(track, vocabMode);

  const trackCatKeys = track ? new Set(getCatsForTrack(track)) : null;

  // Visible categories for this track (excl. 'all' — we show it separately)
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

  // Count how many cards the pending selection matches
  const pendingCount = pendingCats.has('all')
    ? counts.all
    : pendingCats.has('bintang')
    ? starredCount
    : [...pendingCats].reduce((sum, k) => sum + (counts[k] || 0), 0);

  const pendingCatCount = pendingCats.has('all') ? 0 : pendingCats.size;

  const handleApply = () => {
    onApply(pendingCats);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, animation: 'fadeIn 0.15s ease' }}
      />
      {/* Sheet */}
      <div
        style={{ position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: T.maxW, zIndex: 201, background: 'var(--ssw-bg)', borderRadius: `${T.r.xl}px ${T.r.xl}px 0 0`, boxShadow: T.shadow.lg, animation: 'slideUp 0.25s ease', maxHeight: '80dvh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Handle */}
        <div style={{ width: 36, height: 4, background: 'var(--ssw-border)', borderRadius: 99, margin: '12px auto 0' }} />

        {/* Title */}
        <div style={{ padding: '12px 20px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 15, fontWeight: 800 }}>Filter Kategori</span>
          <button onClick={onClose} style={{ fontFamily: 'inherit', fontSize: 13, color: T.textMuted, background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px' }}>✕</button>
        </div>

        {/* Scrollable grid */}
        <div style={{ overflowY: 'auto', padding: '0 16px 8px', flex: 1 }}>
          {/* "All" row */}
          <button
            onClick={() => togglePending('all')}
            style={{ fontFamily: 'inherit', width: '100%', padding: '12px 14px', borderRadius: T.r.md, background: pendingAll ? 'rgba(245,158,11,0.12)' : T.surface, border: `1.5px solid ${pendingAll ? T.amber : T.border}`, color: pendingAll ? T.amber : T.text, textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, fontWeight: pendingAll ? 700 : 400 }}
          >
            <span>📚 すべて</span>
            <span style={{ fontSize: 12, opacity: 0.65 }}>{counts.all}</span>
          </button>

          {/* 3-col grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 8 }}>
            {/* Bintang (starred) */}
            {starredCount > 0 && (
              <button
                onClick={() => togglePending('bintang')}
                style={{ fontFamily: 'inherit', padding: '10px 8px', borderRadius: T.r.md, background: pendingCats.has('bintang') ? 'rgba(251,191,36,0.15)' : T.surface, border: `1.5px solid ${pendingCats.has('bintang') ? T.gold : T.border}`, color: T.text, textAlign: 'center', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}
              >
                <span style={{ fontSize: 18 }}>⭐</span>
                <span style={{ fontSize: 9, fontWeight: 700, color: T.textMuted, lineHeight: 1.2 }}>Bintang</span>
                <span style={{ fontSize: 10, fontWeight: 700, color: T.gold }}>{starredCount}</span>
              </button>
            )}

            {/* Category cells */}
            {visibleCats
              .filter((c) => c.key !== 'bintang')
              .map((cat) => {
                const active = pendingCats.has(cat.key);
                const cnt = counts[cat.key] || 0;
                return (
                  <button
                    key={cat.key}
                    onClick={() => togglePending(cat.key)}
                    style={{ fontFamily: 'inherit', padding: '10px 8px', borderRadius: T.r.md, background: active ? `${cat.color}18` : T.surface, border: `1.5px solid ${active ? cat.color + '60' : T.border}`, color: T.text, textAlign: 'center', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, opacity: cnt === 0 ? 0.4 : 1 }}
                  >
                    <span style={{ fontSize: 18 }}>{cat.emoji}</span>
                    <span style={{ fontSize: 9, fontWeight: 600, color: T.textDim, lineHeight: 1.2, fontFamily: T.fontJP }}>{cat.label}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: active ? cat.color : T.textDim }}>{cnt}</span>
                  </button>
                );
              })}
          </div>
        </div>

        {/* Apply button */}
        <div style={{ padding: '12px 16px 28px', borderTop: `1px solid ${T.border}` }}>
          <button
            onClick={handleApply}
            style={{ width: '100%', padding: '13px', fontSize: 14, fontWeight: 700, fontFamily: 'inherit', borderRadius: T.r.md, background: T.accent, border: 'none', color: T.textBright, cursor: 'pointer', boxShadow: T.shadow.glow }}
          >
            {pendingCatCount > 0
              ? `✓ Terapkan ${pendingCatCount} kategori (${pendingCount} kartu)`
              : `✓ Terapkan semua (${pendingCount} kartu)`}
          </button>
        </div>
      </div>
    </>
  );
}
