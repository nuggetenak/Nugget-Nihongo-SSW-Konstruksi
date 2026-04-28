// ─── FlashcardMode.jsx ────────────────────────────────────────────────────────
// Browse + study mode. Shows cards in priority order (unknown → untouched → known).
// When SRS prop is provided: 4-button FSRS rating appears after flip.
// Rating feeds both the FSRS engine AND the existing known/unknown lists.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react';
import { T } from '../styles/theme.js';
import { shuffle } from '../utils/shuffle.js';
import { stripFuri, jpFontSize } from '../utils/jp-helpers.js';
import { getCatInfo } from '../data/categories.js';
import { RATING_META } from '../srs/fsrs-core.js';
import ProgressBar from '../components/ProgressBar.jsx';

export default function FlashcardMode({ cards, known, unknown, onMark, onExit, srs }) {
  const [order, setOrder] = useState([]);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [touchX, setTouchX] = useState(null);
  const [swipeDir, setSwipeDir] = useState(0);
  const [rated, setRated] = useState(false); // true after rating — shows brief feedback
  const [lastRating, setLastRating] = useState(null);

  useEffect(() => {
    const unknownCards = cards.filter((c) => unknown.has(c.id));
    const knownCards = cards.filter((c) => known.has(c.id));
    const untouched = cards.filter((c) => !known.has(c.id) && !unknown.has(c.id));
    // Priority: unknown → untouched → known
    setOrder(shuffle([...unknownCards, ...shuffle(untouched), ...knownCards])); // eslint-disable-line react-hooks/set-state-in-effect
    setIdx(0);
    setFlipped(false);
    setRated(false);
    setLastRating(null);
  }, [cards, known, unknown]);

  const card = order[idx];

  const go = useCallback(
    (dir) => {
      setSwipeDir(dir);
      setTimeout(() => {
        setIdx((i) => Math.max(0, Math.min(order.length - 1, i + dir)));
        setFlipped(false);
        setSwipeDir(0);
        setRated(false);
        setLastRating(null);
      }, 120);
    },
    [order.length]
  );

  // Handle FSRS rating
  const handleRate = useCallback(
    (rating) => {
      if (!card) return;
      const _meta = RATING_META[rating];

      // Update SRS engine
      if (srs?.ready) {
        const result = srs.review(card.id, rating);
        onMark?.(card.id, result.isKnown ? 'known' : 'unknown');
      } else {
        // Fallback: use binary mapping if SRS not ready
        onMark?.(card.id, rating >= 2 ? 'known' : 'unknown');
      }

      setLastRating(rating);
      setRated(true);

      // Auto-advance after brief feedback
      setTimeout(() => go(1), 500);
    },
    [card, srs, onMark, go]
  );

  // Keyboard shortcuts
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
      if (flipped && !rated) {
        if (e.key === '1') handleRate(1);
        if (e.key === '2') handleRate(2);
        if (e.key === '3') handleRate(3);
        if (e.key === '4') handleRate(4);
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [go, flipped, rated, handleRate]);

  if (!card || order.length === 0)
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
            marginBottom: 20,
          }}
        >
          ← Kembali
        </button>
        <div style={{ fontSize: 32, marginBottom: 12 }}>📭</div>
        <div style={{ fontSize: 14, color: T.textMuted }}>Tidak ada kartu di filter ini.</div>
      </div>
    );

  const cat = getCatInfo(card.category);
  const knownCount = cards.filter((c) => known.has(c.id)).length;
  const pctKnown = Math.round((knownCount / cards.length) * 100);
  const isKnown = known.has(card.id);
  const isUnknown = unknown.has(card.id);
  const clean = stripFuri(card.jp);
  const fs = jpFontSize(clean);

  // SRS info for current card
  const info = srs?.ready ? srs.getInfo(card.id) : null;
  const previews = srs?.ready ? srs.previewFor(card.id) : {};

  // Card border color: follows SRS strength or known/unknown
  const borderColor = isKnown ? T.correctBorder : isUnknown ? T.wrongBorder : T.border;
  const glowColor = isKnown ? `${T.correct}12` : isUnknown ? `${T.wrong}12` : 'none';

  return (
    <div
      style={{
        padding: '12px 16px 24px',
        maxWidth: T.maxW,
        margin: '0 auto',
        animation: 'fadeIn 0.2s ease',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
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
          {info && (
            <span
              style={{
                fontSize: 10,
                padding: '1px 6px',
                borderRadius: T.r.pill,
                background: `${info.strength.color}15`,
                color: info.strength.color,
              }}
            >
              {info.strength.label}
            </span>
          )}
          <span style={{ color: T.correct, fontWeight: 600 }}>{pctKnown}%</span>
          <span style={{ color: T.textFaint, fontVariantNumeric: 'tabular-nums' }}>
            {idx + 1}/{order.length}
          </span>
        </div>
      </div>
      <ProgressBar current={knownCount} total={cards.length} color={T.correct} />

      {/* Card */}
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
          marginTop: 14,
          padding: flipped ? '22px 18px' : '32px 20px',
          background: T.surface,
          borderRadius: T.r.xxl,
          border: `1.5px solid ${borderColor}`,
          minHeight: 220,
          cursor: flipped ? 'default' : 'pointer',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
          transform:
            swipeDir !== 0 ? `translateX(${swipeDir * 30}px) rotate(${swipeDir * 2}deg)` : 'none',
          opacity: swipeDir !== 0 ? 0.6 : 1,
          boxShadow: glowColor !== 'none' ? `0 0 20px ${glowColor}` : 'none',
        }}
      >
        {/* Front */}
        <div style={{ textAlign: 'center', marginBottom: flipped ? 14 : 0 }}>
          <div style={{ fontSize: fs, fontWeight: 700, fontFamily: T.fontJP, lineHeight: 1.4 }}>
            {clean}
          </div>
          {card.furi && (
            <div style={{ fontSize: 12, color: T.textMuted, fontFamily: T.fontJP, marginTop: 4 }}>
              {card.furi}
            </div>
          )}
          <div style={{ fontSize: 11, color: T.textDim, fontStyle: 'italic', marginTop: 2 }}>
            {card.romaji}
          </div>
        </div>

        {/* Back */}
        {flipped && (
          <div
            style={{
              animation: 'fadeIn 0.15s ease',
              borderTop: `1px solid ${T.border}`,
              paddingTop: 12,
            }}
          >
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                marginBottom: 8,
                textAlign: 'center',
                color: T.gold,
              }}
            >
              {card.id_text}
            </div>
            <div style={{ fontSize: 12, lineHeight: 1.7, color: T.textMuted }}>{card.desc}</div>
            <div style={{ marginTop: 10, textAlign: 'center' }}>
              <span
                style={{
                  fontSize: 10,
                  padding: '3px 10px',
                  borderRadius: T.r.pill,
                  background: `${cat.color}15`,
                  color: cat.color,
                  border: `1px solid ${cat.color}33`,
                }}
              >
                {cat.emoji} {cat.label}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Tap hint */}
      <div
        style={{
          textAlign: 'center',
          fontSize: 10,
          color: T.textFaint,
          marginTop: 8,
          letterSpacing: 0.5,
        }}
      >
        {flipped
          ? rated
            ? ''
            : 'Nilai pemahamanmu · 1/2/3/4'
          : 'Ketuk untuk lihat jawaban · geser untuk navigasi'}
      </div>

      {/* ── Action area ────────────────────────────────────────────────── */}
      {flipped && !rated && (
        /* FSRS 4-button rating */
        <div
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 6, marginTop: 12 }}
        >
          {[1, 2, 3, 4].map((rating) => {
            const m = RATING_META[rating];
            const days = previews[rating];
            return (
              <button
                key={rating}
                onClick={() => handleRate(rating)}
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
                  transition: 'all 0.15s',
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
      )}

      {/* Rating feedback flash */}
      {rated && lastRating && (
        <div
          style={{
            marginTop: 12,
            padding: '10px',
            borderRadius: T.r.md,
            textAlign: 'center',
            background: RATING_META[lastRating].bg,
            border: `1px solid ${RATING_META[lastRating].border}`,
            color: RATING_META[lastRating].color,
            fontSize: 13,
            fontWeight: 700,
            animation: 'fadeIn 0.1s ease',
          }}
        >
          {RATING_META[lastRating].emoji} {RATING_META[lastRating].id}
        </div>
      )}

      {/* Before flip: no action buttons — intentional, user must flip first */}

      {/* Nav */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 12,
          padding: '0 4px',
        }}
      >
        <button
          onClick={() => go(-1)}
          disabled={idx === 0}
          style={{
            fontFamily: 'inherit',
            fontSize: 12,
            color: idx === 0 ? T.textFaint : T.textMuted,
            background: 'none',
            border: 'none',
            cursor: idx === 0 ? 'default' : 'pointer',
            padding: '6px 0',
          }}
        >
          ← Sblm
        </button>
        <button
          onClick={() => go(1)}
          disabled={idx >= order.length - 1}
          style={{
            fontFamily: 'inherit',
            fontSize: 12,
            color: idx >= order.length - 1 ? T.textFaint : T.textMuted,
            background: 'none',
            border: 'none',
            cursor: idx >= order.length - 1 ? 'default' : 'pointer',
            padding: '6px 0',
          }}
        >
          Slnjt →
        </button>
      </div>
    </div>
  );
}
