// ─── FlashcardMode/FlipCard.jsx ─────────────────────────────────────────────
// Converted from full inline-styles to CSS module classes.
// Dynamic values (border color, gradient from cat.color) remain inline.
// haptic.flip() on card tap.
// ─────────────────────────────────────────────────────────────────────────────
import { useRef, useEffect, useState } from 'react';
import { haptic } from '../../utils/haptic.js';
import { T } from '../../styles/theme.js';
import {
  JpFront,
  DescBlock,
  parseRubyFragments,
  renderJPWithRuby,
} from '../../components/JpDisplay.jsx';
import { extractReadings } from '../../utils/jp-helpers.js';
import FC from './flashcard.module.css';
import S from './FlipCard.module.css';

export default function FlipCard({
  card,
  cat,
  flipped,
  showDesc,
  onFlip,
  onShowDesc,
  safeIdx,
  srsInfo,
  hintCount,
  showHint,
  borderColor,
  swipeDelta,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  onCatFilter,
  furiganaPolicy = 'always',
}) {
  const cardTiltDeg = swipeDelta * 4;
  const cardShiftPx = swipeDelta * 24;

  const catColor = cat?.color ?? T.amber;

  // Measure back face so the card container expands to fit whichever face is taller.
  const backRef = useRef(null);
  const [backH, setBackH] = useState(0);
  useEffect(() => {
    setBackH(0);
  }, [card.id]);
  useEffect(() => {
    if (!backRef.current) return;
    const ro = new ResizeObserver(([e]) => {
      // borderBoxSize includes padding; fall back to contentRect for older browsers.
      const h = e.borderBoxSize?.[0]?.blockSize ?? e.contentRect.height;
      setBackH(h);
    });
    ro.observe(backRef.current);
    return () => ro.disconnect();
  }, [card.id, showDesc]);

  // Category badge is independently clickable when onCatFilter exists (filters
  // by category, distinct from the outer card-flip action) -- a real <button>
  // in that case; a plain <span> when it's just a label. Valid to nest a real
  // button here since its ancestor (the front face) is role="button" on a
  // <div>, not an actual <button> element.
  const BadgeTag = onCatFilter ? 'button' : 'span';

  return (
    <div
      className={`fc-scene ${FC.scene}`}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      aria-label={flipped ? `Kartu balik: ${card.id_text}` : `Kartu depan: ${card.jp}`}
      aria-live="polite"
      aria-atomic="true"
    >
      <div
        className={`fc-card${flipped ? ' is-flipped' : ''}`}
        style={{
          minHeight: Math.max(230, backH),
          transform: `rotateY(${flipped ? 180 : 0}deg) translateX(${cardShiftPx}px) rotate(${cardTiltDeg}deg)`,
        }}
      >
        {/* ── FRONT ─────────────────────────────────────────────────────── */}
        <div
          className={`fc-face ${S.front}`}
          onClick={() => {
            haptic.flip();
            onFlip();
          }}
          role="button"
          tabIndex={flipped ? -1 : 0}
          aria-label={flipped ? undefined : 'Balik kartu'}
          onKeyDown={(e) => {
            if (flipped) return;
            if (e.key !== 'Enter' && e.key !== ' ') return;
            e.preventDefault();
            haptic.flip();
            onFlip();
          }}
          style={{ border: `1.5px solid ${borderColor}`, pointerEvents: flipped ? 'none' : 'auto' }}
        >
          {cat && (
            <BadgeTag
              type={onCatFilter ? 'button' : undefined}
              tabIndex={onCatFilter && !flipped ? 0 : -1}
              className={S.catBadgeFront}
              style={{
                background: `${catColor}22`,
                color: catColor,
                cursor: onCatFilter ? 'pointer' : 'default',
              }}
              onClick={
                onCatFilter
                  ? (e) => {
                      e.stopPropagation();
                      onCatFilter(cat.key);
                    }
                  : undefined
              }
              title={onCatFilter ? `Filter: ${cat.label}` : undefined}
            >
              {cat.emoji} {cat.label}
            </BadgeTag>
          )}
          <div className={S.cardNum}>#{safeIdx + 1}</div>

          <div className={S.frontContent}>
            <JpFront jp={card.jp} furiganaPolicy={furiganaPolicy} />
          </div>

          {srsInfo && (
            <div className={S.srsInfo} style={{ bottom: showHint ? 26 : 10 }}>
              {srsInfo.strength.label}
              {srsInfo.interval > 0 ? ` · ${Math.round(srsInfo.interval)}j lagi` : ''}
            </div>
          )}

          {showHint && (
            <div
              className={S.flipHint}
              style={{
                bottom: 10,
                animation: hintCount === 2 ? 'fcHintFade 2s ease forwards' : 'none',
              }}
            >
              👆 Tap untuk balik
            </div>
          )}
        </div>

        {/* ── BACK ──────────────────────────────────────────────────────── */}
        <div
          ref={backRef}
          className={`fc-face fc-face--back ${S.back}`}
          style={{
            background: `linear-gradient(145deg, ${catColor}dd 0%, ${catColor}88 100%)`,
            border: `1.5px solid ${catColor}88`,
            boxShadow: `0 8px 40px ${catColor}44, 0 2px 12px ${catColor}22`,
            pointerEvents: flipped ? 'auto' : 'none',
          }}
        >
          <div className={S.backHeader}>
            {cat && (
              <span className={S.catBadgeBack}>
                {cat.emoji} {cat.label}
              </span>
            )}
            <span className={S.cardNumBack}>#{safeIdx + 1}</span>
          </div>

          <div className={S.backBody}>
            <div className={S.backJp}>{renderJPWithRuby(card.jp, parseRubyFragments(card.jp))}</div>
            <div className={S.backFuri}>{extractReadings(card.jp)}</div>
            <div className={S.backId}>{card.id_text}</div>
          </div>

          {card.desc && (
            <div className={S.backDescArea}>
              {!showDesc ? (
                <button
                  className={S.backDescBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    onShowDesc();
                  }}
                >
                  📖 Lihat penjelasan
                </button>
              ) : (
                <div className={S.backDescText}>
                  <DescBlock desc={card.desc} />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
