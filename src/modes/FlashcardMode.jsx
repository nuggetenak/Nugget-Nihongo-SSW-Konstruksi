// ─── FlashcardMode.jsx ────────────────────────────────────────────────────────
// v3.0 — Feature-complete port: search, star, tools row, stats, JpFront,
//         DescBlock, category pill, flip gradient + FSRS 4-button (long-press)
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback, useRef } from 'react';
import { T } from '../styles/theme.js';
import { shuffle } from '../utils/shuffle.js';

import { getCatInfo } from '../data/categories.js';
import { RATING_META } from '../srs/fsrs-core.js';
import { JpFront, DescBlock } from '../components/JpDisplay.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import { useToast } from '../components/Toast.jsx';

export default function FlashcardMode({
  cards,
  known,
  unknown,
  onMark,
  onExit,
  srs,
  starred = new Set(),
  onToggleStar = () => {},
}) {
  // ── Core state ──
  const [order, setOrder] = useState([]);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [showDesc, setShowDesc] = useState(false);
  const toast = useToast();

  // ── Tutorial overlay (first-time only) ──────────────────────────────────
  const [showTutorial, setShowTutorial] = useState(() => {
    try {
      return !localStorage.getItem('ssw-tutorial-flashcard');
    } catch {
      return false;
    }
  });
  const dismissTutorial = () => {
    try {
      localStorage.setItem('ssw-tutorial-flashcard', '1');
    } catch {}
    setShowTutorial(false);
  };

  // ── Search + filter ──
  const [search, setSearch] = useState('');

  // ── Tools state ──
  const [sortMode, setSortMode] = useState('priority'); // 'priority' | 'original' | 'shuffle'
  const [reviewBelum, setReviewBelum] = useState(false); // show only unknown cards
  const [confirmReset, setConfirmReset] = useState(false);
  const confirmTimer = useRef(null);

  // ── FSRS long-press ──
  const [showFSRS, setShowFSRS] = useState(false);
  const [rated, setRated] = useState(false);
  const [_lastRating, setLastRating] = useState(null);
  const longPressTimer = useRef(null);

  // ── Swipe ──
  const [touchX, setTouchX] = useState(null);
  const [swipeDir, setSwipeDir] = useState(0);

  // ── Build card order ─────────────────────────────────────────────────────
  const rebuildOrder = useCallback(
    (mode) => {
      const base = reviewBelum ? cards.filter((c) => unknown.has(c.id)) : cards;
      let ordered;
      if (mode === 'original') {
        ordered = base;
      } else if (mode === 'shuffle') {
        ordered = shuffle([...base]);
      } else {
        // priority: unknown → untouched → known
        const u = base.filter((c) => unknown.has(c.id));
        const t = base.filter((c) => !known.has(c.id) && !unknown.has(c.id));
        const k = base.filter((c) => known.has(c.id));
        ordered = [...shuffle(u), ...shuffle(t), ...shuffle(k)];
      }
      return ordered;
    },
    [cards, known, unknown, reviewBelum]
  );

  useEffect(() => {
    setOrder(rebuildOrder(sortMode));
    setIdx(0);
    setFlipped(false);
    setShowDesc(false);
    setRated(false);
    setShowFSRS(false);
  }, [cards, known, unknown, rebuildOrder, sortMode, reviewBelum]);

  // ── Derived data ────────────────────────────────────────────────────────
  const displayCards =
    search === '__starred__'
      ? order.filter((c) => starred.has(c.id))
      : search.trim()
        ? order.filter((c) => {
            const q = search.toLowerCase();
            return (
              (c.jp || '').toLowerCase().includes(q) ||
              (c.romaji || '').toLowerCase().includes(q) ||
              (c.id_text || '').toLowerCase().includes(q)
            );
          })
        : order;

  const card = displayCards[Math.min(idx, Math.max(0, displayCards.length - 1))];
  const cat = card ? getCatInfo(card.category) : null;

  const knownInView = displayCards.filter((c) => known.has(c.id)).length;
  const unknownInView = displayCards.filter((c) => unknown.has(c.id)).length;
  const sisa = displayCards.length - knownInView - unknownInView;

  // SRS info
  const srsInfo = srs?.ready && card ? srs.getInfo(card.id) : null;
  const srsPreviews = srs?.ready && card ? srs.previewFor(card.id) : {};

  // ── Navigation ─────────────────────────────────────────────────────────
  const go = useCallback(
    (dir) => {
      setSwipeDir(dir);
      setTimeout(() => {
        setIdx((i) => Math.max(0, Math.min(displayCards.length - 1, i + dir)));
        setFlipped(false);
        setShowDesc(false);
        setSwipeDir(0);
        setRated(false);
        setShowFSRS(false);
        setLastRating(null);
      }, 120);
    },
    [displayCards.length]
  );

  // ── Mark actions ────────────────────────────────────────────────────────
  const markCard = useCallback(
    (type) => {
      if (!card) return;
      const prevType = known.has(card.id) ? 'known' : unknown.has(card.id) ? 'unknown' : null;
      if (srs?.ready) {
        const rating = type === 'known' ? 3 : 1;
        const result = srs.review(card.id, rating);
        onMark?.(card.id, result.isKnown ? 'known' : 'unknown');
      } else {
        onMark?.(card.id, type);
      }
      const label = type === 'known' ? 'Kartu ditandai hafal ✓' : 'Kartu ditandai belum ✗';
      toast.show(label, {
        undo: prevType ? () => onMark?.(card.id, prevType) : undefined,
      });
      setTimeout(() => go(1), 300);
    },
    [card, srs, onMark, go, toast, known, unknown]
  );

  const handleRate = useCallback(
    (rating) => {
      if (!card) return;
      if (srs?.ready) {
        const result = srs.review(card.id, rating);
        onMark?.(card.id, result.isKnown ? 'known' : 'unknown');
      } else {
        onMark?.(card.id, rating >= 2 ? 'known' : 'unknown');
      }
      setLastRating(rating);
      setRated(true);
      setShowFSRS(false);
      setTimeout(() => go(1), 500);
    },
    [card, srs, onMark, go]
  );

  // ── Reset ───────────────────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    if (confirmReset) {
      clearTimeout(confirmTimer.current);
      onMark?.('__RESET__', 'reset');
      setConfirmReset(false);
      setOrder(rebuildOrder(sortMode));
      setIdx(0);
      setFlipped(false);
      toast.show('Progres direset');
    } else {
      setConfirmReset(true);
      confirmTimer.current = setTimeout(() => setConfirmReset(false), 3000);
    }
  }, [confirmReset, onMark, rebuildOrder, sortMode, toast]);

  // ── Keyboard ────────────────────────────────────────────────────────────
  useEffect(() => {
    const h = (e) => {
      if (e.key === 'ArrowLeft') {
        go(-1);
        return;
      }
      if (e.key === 'ArrowRight') {
        go(1);
        return;
      }
      if (e.key === ' ') {
        e.preventDefault();
        setFlipped((f) => !f);
        return;
      }
      if (flipped && !rated && showFSRS) {
        if (e.key === '1') handleRate(1);
        if (e.key === '2') handleRate(2);
        if (e.key === '3') handleRate(3);
        if (e.key === '4') handleRate(4);
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [go, flipped, rated, showFSRS, handleRate]);

  // ── Empty state ─────────────────────────────────────────────────────────
  if (!card || displayCards.length === 0) {
    const isEmpty = cards.length === 0;
    return (
      <div
        style={{ padding: '40px 20px', textAlign: 'center', maxWidth: T.maxW, margin: '0 auto' }}
      >
        <button
          onClick={onExit}
          style={{
            fontFamily: 'inherit',
            fontSize: 12,
            color: T.textMuted,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            marginBottom: 24,
          }}
        >
          ← Kembali
        </button>
        <div style={{ fontSize: 40, marginBottom: 12 }}>
          {isEmpty ? '📭' : search ? '🔍' : reviewBelum ? '🎉' : '📭'}
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8, color: T.text }}>
          {isEmpty
            ? 'Tidak ada kartu'
            : search
              ? `Tidak ada hasil untuk "${search}"`
              : reviewBelum
                ? 'Tidak ada kartu belum hafal!'
                : 'Tidak ada kartu di filter ini.'}
        </div>
        <div style={{ fontSize: 13, color: T.textMuted, marginBottom: 20 }}>
          {reviewBelum
            ? 'Semua kartu sudah kamu tandai hafal. 🎊'
            : search
              ? 'Coba kata lain atau hapus pencarian.'
              : 'Ubah filter untuk melihat kartu lain.'}
        </div>
        {(search || reviewBelum) && (
          <button
            onClick={() => {
              setSearch('');
              setReviewBelum(false);
            }}
            style={{
              fontFamily: 'inherit',
              padding: '10px 20px',
              borderRadius: T.r.pill,
              background: T.surface,
              border: `1px solid ${T.border}`,
              color: T.text,
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            Reset filter
          </button>
        )}
      </div>
    );
  }

  const isKnown = known.has(card.id);
  const isUnknown = unknown.has(card.id);
  const isStarred = starred.has(card.id);

  // Card border by state
  const borderColor = isKnown ? T.correctBorder : isUnknown ? T.wrongBorder : T.border;

  // Card bg: flipped = category gradient, front = surface
  const cardBg = flipped ? `linear-gradient(135deg, ${cat.color}cc, ${cat.color}77)` : T.surface;
  const cardBorder = flipped ? `1.5px solid ${cat.color}99` : `1.5px solid ${borderColor}`;
  const cardShadow = flipped ? `0 8px 32px ${cat.color}33` : T.shadow.md;

  return (
    <div
      style={{
        padding: '12px 16px 120px',
        maxWidth: T.maxW,
        margin: '0 auto',
        animation: 'fadeIn 0.2s ease',
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 6,
        }}
      >
        <button
          onClick={onExit}
          style={{
            fontFamily: 'inherit',
            fontSize: 12,
            color: T.textMuted,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '6px 0',
          }}
        >
          ← Kartu
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
          {srsInfo && (
            <span
              style={{
                fontSize: 10,
                padding: '1px 6px',
                borderRadius: T.r.pill,
                background: `${srsInfo.strength.color}15`,
                color: srsInfo.strength.color,
              }}
            >
              {srsInfo.strength.label}
            </span>
          )}
          <span style={{ color: T.textDim, fontVariantNumeric: 'tabular-nums' }}>
            {idx + 1}/{displayCards.length}
          </span>
        </div>
      </div>

      <ProgressBar current={knownInView} total={displayCards.length} color={T.correct} />

      {/* ── Stats row ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr 1fr',
          gap: 6,
          marginTop: 10,
          marginBottom: 10,
        }}
      >
        {[
          { label: 'Total', val: displayCards.length, color: T.text, bg: T.surface },
          { label: 'Hafal', val: knownInView, color: T.correct, bg: T.correctBg },
          { label: 'Belum', val: unknownInView, color: T.wrong, bg: T.wrongBg },
          { label: 'Sisa', val: sisa, color: T.gold, bg: 'rgba(251,191,36,0.08)' },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              padding: '8px 4px',
              borderRadius: T.r.md,
              background: s.bg,
              border: `1px solid ${s.color}22`,
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: 15,
                fontWeight: 800,
                color: s.color,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {s.val}
            </div>
            <div style={{ fontSize: 10, color: T.textDim, marginTop: 1 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Search + star row ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setIdx(0);
            }}
            placeholder="🔍 Cari JP / romaji / ID..."
            style={{
              width: '100%',
              padding: '9px 12px',
              borderRadius: T.r.md,
              border: `1px solid ${T.border}`,
              background: T.surface,
              color: T.text,
              fontFamily: 'inherit',
              fontSize: 13,
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>
        <button
          onClick={() => onToggleStar(card?.id)}
          style={{
            width: 40,
            height: 40,
            borderRadius: T.r.md,
            border: `1px solid ${isStarred ? T.gold + '80' : T.border}`,
            background: isStarred ? 'rgba(251,191,36,0.12)' : T.surface,
            color: isStarred ? T.gold : T.textDim,
            cursor: 'pointer',
            fontSize: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {isStarred ? '⭐' : '☆'}
        </button>
      </div>

      {/* ── Card ── */}
      <div
        onClick={() => {
          if (!flipped) setFlipped(true);
        }}
        onTouchStart={(e) => setTouchX(e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX === null) return;
          const diff = e.changedTouches[0].clientX - touchX;
          if (Math.abs(diff) > 60) go(diff > 0 ? -1 : 1);
          setTouchX(null);
        }}
        style={{
          position: 'relative',
          padding: flipped ? '18px 16px 20px' : '28px 18px',
          background: cardBg,
          borderRadius: T.r.xxl,
          border: cardBorder,
          minHeight: 200,
          cursor: flipped ? 'default' : 'pointer',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
          transform:
            swipeDir !== 0 ? `translateX(${swipeDir * 30}px) rotate(${swipeDir * 2}deg)` : 'none',
          opacity: swipeDir !== 0 ? 0.6 : 1,
          boxShadow: cardShadow,
        }}
      >
        {/* Category pill + card # */}
        <div
          style={{
            position: 'absolute',
            top: 12,
            left: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          {cat && (
            <span
              style={{
                background: `${cat.color}bb`,
                color: '#fff',
                padding: '3px 10px',
                borderRadius: T.r.pill,
                fontSize: 10,
                fontFamily: T.fontJP,
                letterSpacing: 0.3,
                fontWeight: 600,
              }}
            >
              {cat.emoji} {cat.label}
            </span>
          )}
        </div>
        <div
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            fontSize: 10,
            color: flipped ? 'rgba(255,255,255,0.45)' : T.textFaint,
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          #{idx + 1}
        </div>

        {/* Front */}
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <JpFront jp={card.jp} furi={card.furi} romaji={card.romaji} />
        </div>

        {/* Back */}
        {flipped && (
          <div
            style={{
              animation: 'fadeIn 0.18s ease',
              borderTop: `1px solid rgba(255,255,255,0.2)`,
              paddingTop: 14,
              marginTop: 14,
            }}
          >
            <div
              style={{
                fontSize: 17,
                fontWeight: 700,
                marginBottom: 10,
                textAlign: 'center',
                color: flipped ? '#fff' : T.textBright,
              }}
            >
              {card.id_text}
            </div>
            {!showDesc && card.desc && (
              <div style={{ textAlign: 'center' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDesc(true);
                  }}
                  style={{
                    fontFamily: 'inherit',
                    fontSize: 12,
                    padding: '6px 16px',
                    borderRadius: T.r.pill,
                    border: '1px solid rgba(255,255,255,0.25)',
                    background: 'rgba(255,255,255,0.12)',
                    color: '#fff',
                    cursor: 'pointer',
                  }}
                >
                  📖 Lihat penjelasan
                </button>
              </div>
            )}
            {showDesc && card.desc && (
              <div style={{ animation: 'fadeIn 0.15s ease' }}>
                <DescBlock desc={card.desc} />
              </div>
            )}
          </div>
        )}

        {/* Hint */}
        {!flipped && (
          <div
            style={{
              position: 'absolute',
              bottom: 12,
              left: 0,
              right: 0,
              textAlign: 'center',
              fontSize: 10,
              color: flipped ? 'rgba(255,255,255,0.3)' : T.textFaint,
              letterSpacing: 0.5,
            }}
          >
            ketuk untuk balik · geser untuk navigasi
          </div>
        )}
      </div>

      {/* ── Nav row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 10 }}>
        <button
          onClick={() => go(-1)}
          disabled={idx === 0}
          style={{
            fontFamily: 'inherit',
            padding: '11px 8px',
            borderRadius: T.r.md,
            border: `1px solid ${T.border}`,
            background: T.surface,
            color: idx === 0 ? T.textFaint : T.text,
            cursor: idx === 0 ? 'default' : 'pointer',
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          ← Prev
        </button>
        <button
          onClick={() => {
            setFlipped((f) => !f);
            setShowDesc(false);
          }}
          style={{
            fontFamily: 'inherit',
            padding: '11px 8px',
            borderRadius: T.r.md,
            border: 'none',
            background: T.accent,
            color: '#fff',
            cursor: 'pointer',
            fontSize: 13,
            fontWeight: 700,
            boxShadow: T.shadow.glow,
          }}
        >
          {flipped ? '🔄 Balik' : '👁️ Lihat'}
        </button>
        <button
          onClick={() => go(1)}
          disabled={idx >= displayCards.length - 1}
          style={{
            fontFamily: 'inherit',
            padding: '11px 8px',
            borderRadius: T.r.md,
            border: `1px solid ${T.border}`,
            background: T.surface,
            color: idx >= displayCards.length - 1 ? T.textFaint : T.text,
            cursor: idx >= displayCards.length - 1 ? 'default' : 'pointer',
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          Next →
        </button>
      </div>

      {/* ── Mark row (binary) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
        <button
          onClick={() => markCard('unknown')}
          onMouseDown={() => {
            longPressTimer.current = setTimeout(() => {
              setShowFSRS(true);
              setFlipped(true);
            }, 600);
          }}
          onMouseUp={() => clearTimeout(longPressTimer.current)}
          onTouchStart={() => {
            longPressTimer.current = setTimeout(() => {
              setShowFSRS(true);
              setFlipped(true);
            }, 600);
          }}
          onTouchEnd={() => clearTimeout(longPressTimer.current)}
          style={{
            fontFamily: 'inherit',
            padding: '13px',
            borderRadius: T.r.md,
            border: `1.5px solid ${T.wrongBorder}`,
            background: T.wrongBg,
            color: T.wrong,
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          ✗ Belum hafal
        </button>
        <button
          onClick={() => markCard('known')}
          onMouseDown={() => {
            longPressTimer.current = setTimeout(() => {
              setShowFSRS(true);
              setFlipped(true);
            }, 600);
          }}
          onMouseUp={() => clearTimeout(longPressTimer.current)}
          onTouchStart={() => {
            longPressTimer.current = setTimeout(() => {
              setShowFSRS(true);
              setFlipped(true);
            }, 600);
          }}
          onTouchEnd={() => clearTimeout(longPressTimer.current)}
          style={{
            fontFamily: 'inherit',
            padding: '13px',
            borderRadius: T.r.md,
            border: `1.5px solid ${T.correctBorder}`,
            background: T.correctBg,
            color: T.correct,
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          ✓ Sudah hafal
        </button>
      </div>

      {/* Long-press hint */}
      <div style={{ textAlign: 'center', fontSize: 10, color: T.textFaint, marginTop: 4 }}>
        Tahan tombol untuk rating FSRS detail
      </div>

      {/* ── FSRS 4-button (shown on long-press) ── */}
      {showFSRS && flipped && !rated && (
        <div style={{ marginTop: 10, animation: 'slideUp 0.2s ease' }}>
          <div style={{ fontSize: 11, color: T.textDim, textAlign: 'center', marginBottom: 6 }}>
            Rating detail FSRS
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 6 }}>
            {[1, 2, 3, 4].map((r) => {
              const m = RATING_META[r];
              const days = srsPreviews[r];
              return (
                <button
                  key={r}
                  onClick={() => handleRate(r)}
                  style={{
                    fontFamily: 'inherit',
                    padding: '10px 4px',
                    borderRadius: T.r.md,
                    cursor: 'pointer',
                    background: m.bg,
                    border: `1.5px solid ${m.border}`,
                    color: m.color,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  <span style={{ fontSize: 14 }}>{m.emoji}</span>
                  <span style={{ fontSize: 11, fontWeight: 700 }}>{m.id}</span>
                  {days != null && (
                    <span style={{ fontSize: 9, opacity: 0.65 }}>
                      {days < 1
                        ? '<1h'
                        : days < 7
                          ? `${days}h`
                          : days < 30
                            ? `${Math.round(days / 7)}mgg`
                            : `${Math.round(days / 30)}bln`}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Tools row ── */}
      <div
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 6, marginTop: 10 }}
      >
        {/* Urut */}
        <button
          onClick={() =>
            setSortMode((m) =>
              m === 'priority' ? 'original' : m === 'original' ? 'shuffle' : 'priority'
            )
          }
          style={{
            fontFamily: 'inherit',
            padding: '8px 4px',
            borderRadius: T.r.md,
            border: `1px solid ${T.border}`,
            background: sortMode !== 'priority' ? T.surfaceActive : T.surface,
            color: sortMode !== 'priority' ? T.amber : T.textMuted,
            cursor: 'pointer',
            fontSize: 11,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <span>{sortMode === 'original' ? '⏮' : sortMode === 'shuffle' ? '🔀' : '🎯'}</span>
          <span>
            {sortMode === 'original' ? 'Urut' : sortMode === 'shuffle' ? 'Acak' : 'Prioritas'}
          </span>
        </button>
        {/* Review Belum */}
        <button
          onClick={() => {
            setReviewBelum((r) => !r);
            setIdx(0);
          }}
          style={{
            fontFamily: 'inherit',
            padding: '8px 4px',
            borderRadius: T.r.md,
            border: `1px solid ${reviewBelum ? T.wrongBorder : T.border}`,
            background: reviewBelum ? T.wrongBg : T.surface,
            color: reviewBelum ? T.wrong : T.textMuted,
            cursor: 'pointer',
            fontSize: 11,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <span>❌</span>
          <span>{unknownInView > 0 ? `${unknownInView} Belum` : 'Belum'}</span>
        </button>
        {/* Reset */}
        <button
          onClick={handleReset}
          style={{
            fontFamily: 'inherit',
            padding: '8px 4px',
            borderRadius: T.r.md,
            border: `1px solid ${confirmReset ? T.wrongBorder : T.border}`,
            background: confirmReset ? T.wrongBg : T.surface,
            color: confirmReset ? T.wrong : T.textMuted,
            cursor: 'pointer',
            fontSize: 11,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <span>🔄</span>
          <span>{confirmReset ? 'Yakin?' : 'Reset'}</span>
        </button>
        {/* ── Star filter — show starred only */}
        <button
          onClick={() => {
            setSearch(search === '__starred__' ? '' : '__starred__');
            setIdx(0);
          }}
          style={{
            fontFamily: 'inherit',
            padding: '8px 4px',
            borderRadius: T.r.md,
            border: `1px solid ${search === '__starred__' ? T.gold + '80' : T.border}`,
            background: search === '__starred__' ? 'rgba(251,191,36,0.12)' : T.surface,
            color: search === '__starred__' ? T.gold : T.textMuted,
            cursor: 'pointer',
            fontSize: 11,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <span>⭐</span>
          <span>{starred.size > 0 ? `${starred.size}` : 'Bintang'}</span>
        </button>
      </div>

      {/* ── First-time tutorial overlay ── */}
      {showTutorial && (
        <div
          onClick={dismissTutorial}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.75)',
            zIndex: 250,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <div
            style={{
              background: 'var(--ssw-bg)',
              borderRadius: T.r.xl,
              padding: '28px 24px',
              maxWidth: 320,
              width: '100%',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 12 }}>🃏</div>
            <div style={{ fontSize: 16, fontWeight: 800, marginBottom: 16 }}>Cara Pakai Kartu</div>
            {[
              { icon: '👆', text: 'Ketuk kartu untuk balik' },
              { icon: '👈👉', text: 'Geser kiri-kanan untuk navigasi' },
              { icon: '✅', text: 'Tandai sesuai pemahamanmu' },
              { icon: '⭐', text: 'Bintang untuk kartu penting' },
            ].map((tip) => (
              <div
                key={tip.icon}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '9px 0',
                  borderBottom: `1px solid ${T.border}`,
                  textAlign: 'left',
                }}
              >
                <span style={{ fontSize: 20, width: 32, textAlign: 'center', flexShrink: 0 }}>
                  {tip.icon}
                </span>
                <span style={{ fontSize: 13, color: T.textMuted }}>{tip.text}</span>
              </div>
            ))}
            <button
              style={{
                marginTop: 20,
                width: '100%',
                padding: '12px',
                fontSize: 14,
                fontWeight: 700,
                fontFamily: 'inherit',
                borderRadius: T.r.md,
                background: T.accent,
                border: 'none',
                color: T.textBright,
                cursor: 'pointer',
              }}
            >
              Mulai Belajar →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
