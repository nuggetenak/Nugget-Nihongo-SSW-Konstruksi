// ─── FlashcardMode/FlipCard.jsx (phaseE) ─────────────────────────────────────
// 3D flip card — front and back faces, swipe-tilt, tap-to-flip.
// FLIP_STYLE now lives in flashcard.module.css (TD-05).
// ─────────────────────────────────────────────────────────────────────────────
import { T } from '../../styles/theme.js';
import { JpFront, DescBlock } from '../../components/JpDisplay.jsx';
import FC from './flashcard.module.css';

export default function FlipCard({
  card,
  cat,
  flipped,
  showDesc,
  onFlip,
  onShowDesc,
  safeIdx,
  // totalCount kept in props signature for future use (e.g. "X/Y" display)
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
          minHeight: 220,
          transform: `rotateY(${flipped ? 180 : 0}deg) translateX(${cardShiftPx}px) rotate(${cardTiltDeg}deg)`,
        }}
      >
        {/* ── FRONT ────────────────────────────────────────────────────────── */}
        <div
          className="fc-face"
          onClick={onFlip}
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
          {cat && (
            <div style={{ position: 'absolute', top: 12, left: 14 }}>
              <span style={{ background: `${cat.color}bb`, color: '#fff', padding: '3px 10px', borderRadius: T.r.pill, fontSize: 10, fontFamily: T.fontJP, fontWeight: 600 }}>
                {cat.emoji} {cat.label}
              </span>
            </div>
          )}
          <div style={{ position: 'absolute', top: 14, right: 14, fontSize: 10, color: T.textFaint, fontVariantNumeric: 'tabular-nums' }}>#{safeIdx + 1}</div>

          <div style={{ textAlign: 'center' }}>
            <JpFront jp={card.jp} furi={card.furi} romaji={card.romaji} audioEnabled={audioEnabled} furiganaPolicy={furiganaPolicy} />
          </div>

          {srsInfo && (
            <div style={{ position: 'absolute', bottom: 10, fontSize: 10, color: T.textFaint }}>
              {srsInfo.strength.label}{srsInfo.interval > 0 ? ` · ${Math.round(srsInfo.interval)}j lagi` : ''}
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

        {/* ── BACK ─────────────────────────────────────────────────────────── */}
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
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
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
                  onClick={(e) => { e.stopPropagation(); onShowDesc(); }}
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
  );
}
