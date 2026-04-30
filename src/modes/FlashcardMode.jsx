// ─── FlashcardMode.jsx v4.1 ──────────────────────────────────────────────────
// Phase 4: 3D flip · FSRS always visible after flip · swipe tilt
// Phase 6: CSS modules — static layout atoms extracted.
// Note: card border-color is dynamic (known/unknown state) — justified inline.
// Note: card transform (tilt + flip) is animated, runtime — justified inline.
// Note: back face bg/border/shadow use per-category color — justified inline.
// Note: FSRS rating btn bg/border/color use per-rating RATING_META — justified inline.
// Note: star btn border/bg/color are conditional on isStarred — justified inline.
// Note: nav btn color/cursor conditional on disabled state — justified inline.
// Note: tool btn border/bg/color conditional on active state — justified inline.
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect, useCallback, useRef } from 'react';
import { T } from '../styles/theme.js';
import { shuffle } from '../utils/shuffle.js';
import { getCatInfo } from '../data/categories.js';
import { RATING_META } from '../srs/fsrs-core.js';
import { JpFront, DescBlock } from '../components/JpDisplay.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import { useToast } from '../components/Toast.jsx';
import { get as storageGet, set as storageSet } from '../storage/engine.js';
import S from './modes.module.css';

// ── CSS injected once for 3D flip ─────────────────────────────────────────────
const FLIP_STYLE = `
.fc-scene { perspective: 1200px; }
.fc-card  {
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.4s cubic-bezier(0.4,0,0.2,1);
  will-change: transform;
}
.fc-card.is-flipped { transform: rotateY(180deg); }
.fc-face {
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
}
.fc-face--back { transform: rotateY(180deg); }

@keyframes fcHintFade {
  0%   { opacity: 1; }
  70%  { opacity: 1; }
  100% { opacity: 0; pointer-events: none; }
}
`;
let _styleInjected = false;
function ensureStyle() {
  if (_styleInjected) return;
  const el = document.createElement('style');
  el.textContent = FLIP_STYLE;
  document.head.appendChild(el);
  _styleInjected = true;
}

function fmtInterval(d) {
  if (d == null) return '';
  if (d < 0.05)  return '<1m';
  if (d < 1)     return `${Math.round(d * 24)}j`;
  if (d < 7)     return `${Math.round(d)}h`;
  if (d < 30)    return `${Math.round(d / 7)}mgg`;
  return `${Math.round(d / 30)}bln`;
}

export default function FlashcardMode({ cards, known, unknown, onMark, onExit, srs, starred = new Set(), onToggleStar = () => {} }) {
  ensureStyle();

  const [order, setOrder]           = useState([]);
  const [idx, setIdx]               = useState(0);
  const [flipped, setFlipped]       = useState(false);
  const [showDesc, setShowDesc]     = useState(false);
  const [rated, setRated]           = useState(false);
  const toast                        = useToast();

  // Hint system: show "Tap untuk balik" until 3 flips lifetime
  const [hintCount, setHintCount] = useState(() => storageGet('prefs')?.flashcardHintCount ?? 0);
  const showHint = hintCount < 3 && !flipped;
  const bumpHint = useCallback(() => {
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

  // Derived
  const displayCards = search === '__starred__'
    ? order.filter((c) => starred.has(c.id))
    : search.trim()
      ? order.filter((c) => {
          const q = search.toLowerCase();
          return (c.jp || '').toLowerCase().includes(q) ||
                 (c.romaji || '').toLowerCase().includes(q) ||
                 (c.id_text || '').toLowerCase().includes(q);
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

  const srsInfo     = srs?.ready && card ? srs.getInfo(card.id) : null;
  const srsPreviews = srs?.ready && card ? srs.previewFor(card.id) : {};

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

  // Empty state
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

  const borderColor  = isKnown ? T.correctBorder : isUnknown ? T.wrongBorder : T.border;
  const cardTiltDeg  = swipeDelta * 4;
  const cardShiftPx  = swipeDelta * 24;

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
        ].map((s) => (
          <div key={s.label} className={S.statCell} style={{ background: s.bg, border: `1px solid ${s.color}22` }}>
            <div className={S.statVal} style={{ color: s.color }}>{s.val}</div>
            <div className={S.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search + star */}
      <div className={S.searchBar} style={{ marginTop: 10, marginBottom: 12 }}>
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setIdx(0); }}
          placeholder="🔍 Cari JP / romaji / ID..."
          className={S.searchInput}
        />
        <button
          onClick={() => onToggleStar(card?.id)}
          aria-label={isStarred ? 'Hapus bintang' : 'Tambah bintang'}
          className={S.btnIcon}
          style={{
            border: `1px solid ${isStarred ? T.gold + '80' : T.border}`,
            background: isStarred ? 'rgba(251,191,36,0.12)' : T.surface,
            color: isStarred ? T.gold : T.textDim,
          }}
        >
          {isStarred ? '⭐' : '☆'}
        </button>
      </div>

      {/* 3D Flip Card */}
      <div
        className="fc-scene"
        style={{ marginBottom: 12 }}
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
      >
        <div
          className={`fc-card${flipped ? ' is-flipped' : ''}`}
          style={{
            minHeight: 220,
            // transform overrides .fc-card.is-flipped to add tilt/shift
            transform: `rotateY(${flipped ? 180 : 0}deg) translateX(${cardShiftPx}px) rotate(${cardTiltDeg}deg)`,
          }}
        >
          {/* FRONT */}
          <div
            className="fc-face"
            onClick={flip}
            style={{
              padding: '36px 18px 48px',
              background: T.surface,
              borderRadius: T.r.xxl,
              border: `1.5px solid ${borderColor}`,
              boxShadow: T.shadow.md,
              minHeight: 220,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', position: 'relative',
            }}
          >
            <div style={{ position: 'absolute', top: 12, left: 14 }}>
              {cat && (
                <span style={{ background: `${cat.color}bb`, color: '#fff', padding: '3px 10px', borderRadius: T.r.pill, fontSize: 10, fontFamily: T.fontJP, fontWeight: 600 }}>
                  {cat.emoji} {cat.label}
                </span>
              )}
            </div>
            <div style={{ position: 'absolute', top: 14, right: 14, fontSize: 10, color: T.textFaint, fontVariantNumeric: 'tabular-nums' }}>#{safeIdx + 1}</div>

            <div style={{ textAlign: 'center' }}>
              <JpFront jp={card.jp} furi={card.furi} romaji={card.romaji} />
            </div>

            {srsInfo && (
              <div style={{ position: 'absolute', bottom: 10, fontSize: 10, color: T.textFaint }}>
                {srsInfo.strength.label}{srsInfo.interval > 0 ? ` · ${Math.round(srsInfo.interval)}h lagi` : ''}
              </div>
            )}

            {showHint && (
              <div style={{
                position: 'absolute',
                bottom: srsInfo ? 26 : 10,
                fontSize: 10, color: T.textFaint, letterSpacing: 0.5,
                animation: hintCount === 2 ? 'fcHintFade 2s ease forwards' : 'none',
              }}>
                👆 Tap untuk balik
              </div>
            )}
          </div>

          {/* BACK */}
          <div
            className="fc-face fc-face--back"
            style={{
              padding: '20px 18px 16px',
              background: `linear-gradient(135deg, ${cat?.color ?? T.amber}cc, ${cat?.color ?? T.amber}77)`,
              borderRadius: T.r.xxl,
              border: `1.5px solid ${cat?.color ?? T.amber}99`,
              boxShadow: `0 8px 32px ${cat?.color ?? T.amber}33`,
              minHeight: 220,
              display: 'flex', flexDirection: 'column',
              position: 'absolute', top: 0, left: 0, right: 0,
            }}
          >
            <div className={S.rowSpread} style={{ marginBottom: 10 }}>
              {cat && (
                <span style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', padding: '3px 10px', borderRadius: T.r.pill, fontSize: 10, fontFamily: T.fontJP, fontWeight: 600 }}>
                  {cat.emoji} {cat.label}
                </span>
              )}
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontVariantNumeric: 'tabular-nums' }}>#{safeIdx + 1}</span>
            </div>

            <div style={{ fontSize: 18, fontWeight: 700, textAlign: 'center', color: '#fff', marginBottom: 4, fontFamily: T.fontJP }}>{card.jp}</div>
            <div style={{ fontSize: 12, textAlign: 'center', color: 'rgba(255,255,255,0.65)', marginBottom: 12 }}>{card.furi} · {card.romaji}</div>
            <div style={{ fontSize: 20, fontWeight: 800, textAlign: 'center', color: '#fff', marginBottom: 10 }}>{card.id_text}</div>

            {card.desc && (
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: 10, marginTop: 2 }}>
                {!showDesc ? (
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowDesc(true); }}
                    style={{ fontFamily: 'inherit', fontSize: 12, padding: '6px 16px', borderRadius: T.r.pill, border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.12)', color: '#fff', cursor: 'pointer', display: 'block', margin: '0 auto' }}
                  >
                    📖 Lihat penjelasan
                  </button>
                ) : (
                  <div style={{ animation: 'fadeIn 0.15s ease' }}>
                    <DescBlock desc={card.desc} />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FSRS 4-button — always visible after flip */}
      {flipped && !rated && (
        <div style={{ animation: 'slideUp 0.25s ease' }}>
          <div style={{ fontSize: 11, color: T.textDim, textAlign: 'center', marginBottom: 8 }}>Seberapa hafal kamu?</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
            {[1, 2, 3, 4].map((r) => {
              const m = RATING_META[r];
              const interval = srsPreviews[r];
              return (
                <button
                  key={r}
                  onClick={() => handleRate(r)}
                  style={{
                    fontFamily: 'inherit', padding: '12px 4px', borderRadius: T.r.md, cursor: 'pointer',
                    background: m.bg, border: `1.5px solid ${m.border}`, color: m.color,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, transition: 'transform 0.1s ease',
                  }}
                >
                  <span style={{ fontSize: 16 }}>{m.emoji}</span>
                  <span style={{ fontSize: 12, fontWeight: 700 }}>{m.id}</span>
                  <span style={{ fontSize: 9, opacity: 0.65 }}>{fmtInterval(interval)}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {rated && (
        <div style={{ textAlign: 'center', padding: '16px 0', fontSize: 13, color: T.textDim, animation: 'fadeIn 0.2s ease' }}>
          ✓ Dinilai — melanjutkan…
        </div>
      )}

      {/* Nav row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 10 }}>
        <button onClick={() => go(-1)} disabled={safeIdx === 0} style={{ fontFamily: 'inherit', padding: '11px 8px', borderRadius: T.r.md, border: `1px solid ${T.border}`, background: T.surface, color: safeIdx === 0 ? T.textFaint : T.text, cursor: safeIdx === 0 ? 'default' : 'pointer', fontSize: 13, fontWeight: 600 }}>← Prev</button>
        <button onClick={flip} style={{ fontFamily: 'inherit', padding: '11px 8px', borderRadius: T.r.md, border: 'none', background: T.accent, color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 700, boxShadow: T.shadow.glow }}>
          {flipped ? '🔄 Balik' : '👁️ Lihat'}
        </button>
        <button onClick={() => go(1)} disabled={safeIdx >= displayCards.length - 1} style={{ fontFamily: 'inherit', padding: '11px 8px', borderRadius: T.r.md, border: `1px solid ${T.border}`, background: T.surface, color: safeIdx >= displayCards.length - 1 ? T.textFaint : T.text, cursor: safeIdx >= displayCards.length - 1 ? 'default' : 'pointer', fontSize: 13, fontWeight: 600 }}>Next →</button>
      </div>

      {/* Tools row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 6, marginTop: 8 }}>
        {[
          { emoji: sortMode === 'original' ? '⏮' : sortMode === 'shuffle' ? '🔀' : '🎯', label: sortMode === 'original' ? 'Urut' : sortMode === 'shuffle' ? 'Acak' : 'Prioritas', active: sortMode !== 'priority', onClick: () => setSortMode((m) => m === 'priority' ? 'original' : m === 'original' ? 'shuffle' : 'priority') },
          { emoji: '❌', label: unknownInView > 0 ? `${unknownInView}` : 'Belum', active: reviewBelum, border: T.wrongBorder, bg: T.wrongBg, color: T.wrong, onClick: () => { setReviewBelum((r) => !r); setIdx(0); } },
          { emoji: '🔄', label: confirmReset ? 'Yakin?' : 'Reset', active: confirmReset, border: T.wrongBorder, bg: T.wrongBg, color: T.wrong, onClick: handleReset },
          { emoji: '⭐', label: starred.size > 0 ? `${starred.size}` : 'Bintang', active: search === '__starred__', border: T.gold + '80', bg: 'rgba(251,191,36,0.12)', color: T.gold, onClick: () => { setSearch(search === '__starred__' ? '' : '__starred__'); setIdx(0); } },
        ].map((btn, i) => (
          <button key={i} onClick={btn.onClick} style={{ fontFamily: 'inherit', padding: '8px 4px', borderRadius: T.r.md, border: `1px solid ${btn.active ? (btn.border || T.borderActive) : T.border}`, background: btn.active ? (btn.bg || T.surfaceActive) : T.surface, color: btn.active ? (btn.color || T.amber) : T.textMuted, cursor: 'pointer', fontSize: 11, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <span>{btn.emoji}</span><span>{btn.label}</span>
          </button>
        ))}
      </div>

      {flipped && !rated && (
        <div style={{ textAlign: 'center', fontSize: 10, color: T.textFaint, marginTop: 6 }}>
          Keyboard: 1 Lagi · 2 Susah · 3 Oke · 4 Mudah
        </div>
      )}
    </div>
  );
}
