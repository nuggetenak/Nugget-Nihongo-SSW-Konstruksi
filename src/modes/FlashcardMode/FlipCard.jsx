// ─── FlashcardMode/FlipCard.jsx ─────────────────────────────────────────────
// Converted from full inline-styles to CSS module classes.
// Dynamic values (border color, gradient from cat.color) remain inline.
// haptic.flip() on card tap.
// ─────────────────────────────────────────────────────────────────────────────
import { haptic } from '../../utils/haptic.js';
import { T } from '../../styles/theme.js';
import {
  JpFront,
  DescBlock,
  parseRubyFragments,
  renderJPWithRuby,
} from '../../components/JpDisplay.jsx';
import { extractReadings, stripFuri } from '../../utils/jp-helpers.js';
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

  // Item 74: there used to be a ResizeObserver here, measuring the back face so
  // the card could be given its height and the two faces would not differ
  // across the flip. `.back` is `bottom: 0` now, so the faces are the same box
  // by construction and the card is free to fill the scene — which the
  // measurement had been preventing, since a card sized to the back's *content*
  // is by definition not a card sized to its container.
  //
  // A back longer than the card scrolls inside itself; that is what its own
  // `overflow: hidden auto` and `overscroll-behavior: contain` were for.

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
      aria-label={flipped ? `Kartu balik: ${card.id_text}` : `Kartu depan: ${stripFuri(card.jp)}`}
      aria-live="polite"
      aria-atomic="true"
    >
      <div
        className={`fc-card${flipped ? ' is-flipped' : ''}`}
        style={{
          // No minHeight here on purpose. The floor is CSS's (see .front/.back
          // in FlipCard.module.css), which keeps the landscape override at
          // max-height:480px working — a hardcoded 230 here once defeated it,
          // dropping the faces to 140px while the card stayed at 230 so an
          // 800x400 phone still scrolled despite the rule written to stop that.
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
        {/* The back is tappable exactly like the front. It wasn't, and that was
            the whole reason a flipped card could not be turned back over on a
            touch screen: the front goes pointerEvents:none once flipped, and
            the back carried no handler at all, so the only way back was Space
            on a physical keyboard. */}
        <div
          className={`fc-face fc-face--back ${S.back}`}
          onClick={() => {
            haptic.flip();
            onFlip();
          }}
          role="button"
          tabIndex={flipped ? 0 : -1}
          aria-label={flipped ? 'Balik kartu' : undefined}
          onKeyDown={(e) => {
            if (!flipped) return;
            if (e.key !== 'Enter' && e.key !== ' ') return;
            e.preventDefault();
            haptic.flip();
            onFlip();
          }}
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

          {/* Stops the description area from flipping the card out from under
              someone who is reading it. The button below already guarded
              itself; the expanded text that replaces it did not. */}
          {card.desc && (
            <div className={S.backDescArea} onClick={(e) => e.stopPropagation()}>
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
