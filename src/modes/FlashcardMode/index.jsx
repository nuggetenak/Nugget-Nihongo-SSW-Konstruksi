// ─── FlashcardMode/index.jsx (phaseE) ────────────────────────────────────────
// Orchestrator — all state lives here, sub-components are presentational.
// Phase E changes:
//   - Split from single 447-line file into 5 sub-components
//   - E.2 TD-05: 3D flip CSS moved from JS injection to flashcard.module.css
//   - E.3 TD-10: furiganaPolicy prop wired to JpDisplay (default: 'always')
// Zero behavioral change — all existing functionality preserved.
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect, useCallback, useRef } from 'react';
import { T } from '../../styles/theme.js';
import { shuffle } from '../../utils/shuffle.js';
import { getCatInfo } from '../../data/categories.js';
import { useToast } from '../../components/Toast.jsx';
import { get as storageGet, set as storageSet } from '../../storage/engine.js';
import ProgressBar from '../../components/ProgressBar.jsx';
import S from '../modes.module.css';

import FlipCard   from './FlipCard.jsx';
import RatingRow  from './RatingRow.jsx';
import ToolStrip  from './ToolStrip.jsx';
import FilterBar  from './FilterBar.jsx';

export default function FlashcardMode({
  cards, known, unknown, onMark, onExit, srs,
  starred = new Set(), onToggleStar = () => {},
}) {
  const [order, setOrder]           = useState([]);
  const [idx, setIdx]               = useState(0);
  const [flipped, setFlipped]       = useState(false);
  const [showDesc, setShowDesc]     = useState(false);
  const [rated, setRated]           = useState(false);
  const toast                        = useToast();

  // Hint: show "Tap untuk balik" until 3 flips lifetime
  const [hintCount, setHintCount] = useState(() => storageGet('prefs')?.flashcardHintCount ?? 0);
  const showHint  = hintCount < 3 && !flipped;
  const bumpHint  = useCallback(() => {
    if (hintCount >= 3) return;
    const next = hintCount + 1;
    setHintCount(next);
    storageSet('prefs', (p) => ({ ...p, flashcardHintCount: next }));
  }, [hintCount]);

  // Swipe tilt
  const [touchStart, setTouchStart] = useState(null);
  const [swipeDelta, setSwipeDelta] = useState(0);

  // Filter/sort
  const [search, setSearch]             = useState('');
  const [sortMode, setSortMode]         = useState('priority');
  const [reviewBelum, setReviewBelum]   = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const confirmTimer                     = useRef(null);

  // E.3 TD-10 / Phase G: furiganaPolicy — now wired to FlipCard → JpFront
  const furiganaPolicy = storageGet('prefs')?.furiganaPolicy ?? 'always';
  // Phase F: audioEnabled from prefs
  const audioEnabled = storageGet('prefs')?.audioEnabled !== false;

  const rebuildOrder = useCallback((mode) => {
    const base = reviewBelum ? cards.filter((c) => unknown.has(c.id)) : cards;
    if (mode === 'original') return base;
    if (mode === 'shuffle')  return shuffle([...base]);
    const u = base.filter((c) => unknown.has(c.id));
    const t = base.filter((c) => !known.has(c.id) && !unknown.has(c.id));
    const k = base.filter((c) => known.has(c.id));
    return [...shuffle(u), ...shuffle(t), ...shuffle(k)];
  }, [cards, known, unknown, reviewBelum]);

  useEffect(() => {
    setOrder(rebuildOrder(sortMode));
    setIdx(0); setFlipped(false); setShowDesc(false); setRated(false);
  }, [cards, known, unknown, rebuildOrder, sortMode, reviewBelum]);

  const displayCards = search === '__starred__'
    ? order.filter((c) => starred.has(c.id))
    : search.trim()
      ? order.filter((c) => {
          const q = search.toLowerCase();
          return (c.jp     || '').toLowerCase().includes(q) ||
                 (c.romaji || '').toLowerCase().includes(q) ||
                 (c.id_text|| '').toLowerCase().includes(q);
        })
      : order;

  const safeIdx   = Math.min(idx, Math.max(0, displayCards.length - 1));
  const card      = displayCards[safeIdx];
  const cat       = card ? getCatInfo(card.category) : null;
  const isKnown   = card && known.has(card.id);
  const isUnknown = card && unknown.has(card.id);
  const isStarred = card && starred.has(card.id);

  const knownInView   = displayCards.filter((c) => known.has(c.id)).length;
  const unknownInView = displayCards.filter((c) => unknown.has(c.id)).length;

  const srsInfo     = srs?.ready && card ? srs.getInfo(card.id)      : null;
  const srsPreviews = srs?.ready && card ? srs.previewFor(card.id)   : {};

  const go = useCallback((dir) => {
    setSwipeDelta(0);
    setIdx((i) => Math.max(0, Math.min(displayCards.length - 1, i + dir)));
    setFlipped(false); setShowDesc(false); setRated(false);
  }, [displayCards.length]);

  const flip = useCallback(() => {
    if (!flipped) bumpHint();
    setFlipped((f) => !f);
    setShowDesc(false);
  }, [flipped, bumpHint]);

  const handleRate = useCallback((rating) => {
    if (!card || rated) return;
    if (srs?.ready) {
      const result = srs.review(card.id, rating);
      onMark?.(card.id, result.isKnown ? 'known' : 'unknown');
    } else {
      onMark?.(card.id, rating >= 2 ? 'known' : 'unknown');
    }
    setRated(true);
    setTimeout(() => go(1), 400);
  }, [card, rated, srs, onMark, go]);

  const handleReset = useCallback(() => {
    if (confirmReset) {
      clearTimeout(confirmTimer.current);
      onMark?.('__RESET__', 'reset');
      setConfirmReset(false);
      setOrder(rebuildOrder(sortMode));
      setIdx(0); setFlipped(false); setRated(false);
      toast.show('Progres direset');
    } else {
      setConfirmReset(true);
      confirmTimer.current = setTimeout(() => setConfirmReset(false), 3000);
    }
  }, [confirmReset, onMark, rebuildOrder, sortMode, toast]);

  useEffect(() => {
    const h = (e) => {
      if (e.key === 'ArrowLeft')  { go(-1); return; }
      if (e.key === 'ArrowRight') { go(1);  return; }
      if (e.key === ' ')          { e.preventDefault(); flip(); return; }
      if (flipped && !rated) {
        if (e.key === '1') handleRate(1);
        if (e.key === '2') handleRate(2);
        if (e.key === '3') handleRate(3);
        if (e.key === '4') handleRate(4);
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [go, flip, flipped, rated, handleRate]);

  // ── Empty state ──────────────────────────────────────────────────────────
  if (!card || displayCards.length === 0) {
    return (
      <div className={S.pageCenter}>
        <button onClick={onExit} className={S.btnBack} style={{ display: 'inline-block', marginBottom: 24 }}>← Kembali</button>
        <div className={S.emptyIcon}>{search ? '🔍' : reviewBelum ? '🎉' : '📭'}</div>
        <div className={S.emptyTitle}>
          {search ? `Tidak ada hasil untuk "${search}"` : reviewBelum ? 'Tidak ada kartu belum hafal!' : 'Tidak ada kartu'}
        </div>
        {(search || reviewBelum) && (
          <button onClick={() => { setSearch(''); setReviewBelum(false); }} className={S.btnSecondary}>
            Reset filter
          </button>
        )}
      </div>
    );
  }

  const borderColor = isKnown ? T.correctBorder : isUnknown ? T.wrongBorder : T.border;

  return (
    <div className={S.fcWrapper}>

      {/* Header */}
      <div className={S.modeHeader} style={{ marginBottom: 6 }}>
        <button className={S.btnBack} style={{ marginBottom: 0 }} onClick={onExit}>← Kartu</button>
        <div className={S.row} style={{ fontSize: 12 }}>
          {srsInfo && (
            <span className={S.pill} style={{ background: `${srsInfo.strength.color}15`, color: srsInfo.strength.color }}>
              {srsInfo.strength.label}
            </span>
          )}
          <span style={{ color: T.textDim, fontVariantNumeric: 'tabular-nums' }}>{safeIdx + 1}/{displayCards.length}</span>
        </div>
      </div>

      <ProgressBar current={knownInView} total={displayCards.length} color={T.correct} />

      {/* Stats mini */}
      <div className={S.statRow} style={{ marginTop: 8 }}>
        {[
          { label: 'Hafal', val: knownInView,   color: T.correct, bg: T.correctBg },
          { label: 'Belum', val: unknownInView,  color: T.wrong,   bg: T.wrongBg },
          { label: 'Sisa',  val: displayCards.length - knownInView - unknownInView, color: T.gold, bg: 'rgba(251,191,36,0.08)' },
        ].map((stat) => (
          <div key={stat.label} className={S.statCell} style={{ background: stat.bg, border: `1px solid ${stat.color}22` }}>
            <div className={S.statVal} style={{ color: stat.color }}>{stat.val}</div>
            <div className={S.statLabel}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <FilterBar
        search={search}
        onSearch={(v) => { setSearch(v); setIdx(0); }}
        isStarred={isStarred}
        onToggleStar={() => onToggleStar(card?.id)}
      />

      {/* 3D Flip Card */}
      <FlipCard
        card={card}
        cat={cat}
        flipped={flipped}
        audioEnabled={audioEnabled}
        furiganaPolicy={furiganaPolicy}
        showDesc={showDesc}
        onFlip={flip}
        onShowDesc={() => setShowDesc(true)}
        safeIdx={safeIdx}
        totalCount={displayCards.length}
        srsInfo={srsInfo}
        hintCount={hintCount}
        showHint={showHint}
        borderColor={borderColor}
        swipeDelta={swipeDelta}
        onTouchStart={(e) => setTouchStart(e.touches[0].clientX)}
        onTouchMove={(e) => {
          if (touchStart === null) return;
          const delta = (e.touches[0].clientX - touchStart) / 120;
          setSwipeDelta(Math.max(-1, Math.min(1, delta)));
        }}
        onTouchEnd={(e) => {
          const diff = touchStart !== null ? e.changedTouches[0].clientX - touchStart : 0;
          setSwipeDelta(0); setTouchStart(null);
          if (Math.abs(diff) > 60) go(diff > 0 ? -1 : 1);
        }}
      />

      {/* FSRS rating row */}
      <RatingRow
        flipped={flipped}
        rated={rated}
        srsPreviews={srsPreviews}
        onRate={handleRate}
      />

      {/* Nav row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 10 }}>
        <button
          onClick={() => go(-1)} disabled={safeIdx === 0}
          style={{ fontFamily: 'inherit', padding: '11px 8px', borderRadius: T.r.md, border: `1px solid ${T.border}`, background: T.surface, color: safeIdx === 0 ? T.textFaint : T.text, cursor: safeIdx === 0 ? 'default' : 'pointer', fontSize: 13, fontWeight: 600 }}
        >← Prev</button>
        <button
          onClick={flip}
          style={{ fontFamily: 'inherit', padding: '11px 8px', borderRadius: T.r.md, border: 'none', background: T.accent, color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700, boxShadow: T.shadow.glow }}
        >{flipped ? '🔄 Balik' : '👁️ Lihat'}</button>
        <button
          onClick={() => go(1)} disabled={safeIdx >= displayCards.length - 1}
          style={{ fontFamily: 'inherit', padding: '11px 8px', borderRadius: T.r.md, border: `1px solid ${T.border}`, background: T.surface, color: safeIdx >= displayCards.length - 1 ? T.textFaint : T.text, cursor: safeIdx >= displayCards.length - 1 ? 'default' : 'pointer', fontSize: 13, fontWeight: 600 }}
        >Next →</button>
      </div>

      {/* Tool strip */}
      <ToolStrip
        sortMode={sortMode}
        onCycleSort={() => setSortMode((m) => m === 'priority' ? 'original' : m === 'original' ? 'shuffle' : 'priority')}
        reviewBelum={reviewBelum}
        onToggleBelum={() => { setReviewBelum((r) => !r); setIdx(0); }}
        unknownInView={unknownInView}
        confirmReset={confirmReset}
        onReset={handleReset}
        starredCount={starred.size}
        starFilterActive={search === '__starred__'}
        onToggleStarFilter={() => { setSearch(search === '__starred__' ? '' : '__starred__'); setIdx(0); }}
        flipped={flipped}
        rated={rated}
      />

    </div>
  );
}
