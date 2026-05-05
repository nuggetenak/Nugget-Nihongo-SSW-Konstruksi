// ─── FlashcardMode/FlipCard.jsx v2.0 — CSS Module upgrade ────────────────────
// Converted from full inline-styles to CSS module classes.
// Dynamic values (border color, gradient from cat.color) remain inline.
// ─────────────────────────────────────────────────────────────────────────────
import { T } from '../../styles/theme.js';
import { JpFront, DescBlock, parseRubyFragments, renderJPWithRuby } from '../../components/JpDisplay.jsx';
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
  // totalCount kept for future "X/Y" display
  // eslint-disable-next-line no-unused-vars
  totalCount,
  srsInfo,
  hintCount,
  showHint,
  borderColor,
  swipeDelta,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  audioEnabled = true,
  furiganaPolicy = 'always',
}) {
  const cardTiltDeg = swipeDelta * 4;
  const cardShiftPx = swipeDelta * 24;

  const catColor = cat?.color ?? T.amber;

  return (
    <div
      className={`fc-scene ${FC.scene}`}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div
        className={`fc-card${flipped ? ' is-flipped' : ''}`}
        style={{
          minHeight: 230,
          transform: `rotateY(${flipped ? 180 : 0}deg) translateX(${cardShiftPx}px) rotate(${cardTiltDeg}deg)`,
        }}
      >
        {/* ── FRONT ─────────────────────────────────────────────────────── */}
        <div
          className={`fc-face ${S.front}`}
          onClick={onFlip}
          style={{ border: `1.5px solid ${borderColor}` }}
        >
          {cat && (
            <span
              className={S.catBadgeFront}
              style={{ background: `${catColor}22`, color: catColor }}
            >
              {cat.emoji} {cat.label}
            </span>
          )}
          <div className={S.cardNum}>#{safeIdx + 1}</div>

          <div className={S.frontContent}>
            <JpFront
              jp={card.jp}
              furi={card.furi}
              
              audioEnabled={audioEnabled}
              furiganaPolicy={furiganaPolicy}
            />
          </div>

          {srsInfo && (
            <div className={S.srsInfo} style={{ bottom: showHint ? 26 : 10 }}>
              {srsInfo.strength.label}{srsInfo.interval > 0 ? ` · ${Math.round(srsInfo.interval)}j lagi` : ''}
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
          className={`fc-face fc-face--back ${S.back}`}
          style={{
            background: `linear-gradient(145deg, ${catColor}dd 0%, ${catColor}88 100%)`,
            border: `1.5px solid ${catColor}88`,
            boxShadow: `0 8px 40px ${catColor}44, 0 2px 12px ${catColor}22`,
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
            <div className={S.backJp}>{card.jp}</div>
            <div className={S.backFuri}>{card.furi}</div>
            <div className={S.backId}>{card.id_text}</div>
          </div>

          {card.desc && (
            <div className={S.backDescArea}>
              {!showDesc ? (
                <button
                  className={S.backDescBtn}
                  onClick={(e) => { e.stopPropagation(); onShowDesc(); }}
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
          {card.quote && (
            <div className={S.quoteBlock}>
              <span className={S.quoteLabel}>{renderJPWithRuby('現場《げんば》より', parseRubyFragments('現場《げんば》より'))}</span>
              <div className={S.quoteText}>
                「{renderJPWithRuby(card.quote, parseRubyFragments(card.quote))}」
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
