// ─── FlashcardMode/RatingRow.jsx ────────────────────────────────────────────
// FSRS 4-button rating row — shown once this card has been flipped at least
// once, not only while the back happens to be facing.
//
// It used to key off `flipped`, which was fine while flipping back was
// impossible. Now that a card can be turned over freely, keying off `flipped`
// would yank the four buttons off screen every time someone flipped back to
// re-check the Japanese, and bounce the page height with them. `seen` resets
// when the card changes, so the row still can't be used before reading the
// answer — it just stops disappearing mid-decision.
// haptic.tap() on rating button tap.
// ─────────────────────────────────────────────────────────────────────────────
import { haptic } from '../../utils/haptic.js';
import { T } from '../../styles/theme.js';
import { RATING_META } from '../../srs/fsrs-core.js';
import FC from './flashcard.module.css';

function fmtInterval(d) {
  if (d == null) return '';
  if (d < 0.05) return '<1m';
  if (d < 1) return `${Math.round(d * 24)}j`;
  if (d < 7) return `${Math.round(d)}h`;
  if (d < 30) return `${Math.round(d / 7)}mgg`;
  return `${Math.round(d / 30)}bln`;
}

export default function RatingRow({ seen, rated, srsPreviews, onRate }) {
  // The row's footprint is reserved in all three states rather than mounted and
  // unmounted (item 74). It used to return null before the first flip and a
  // one-line confirmation after rating, so the block below the card changed
  // height twice per card. That was survivable while the card was a fixed
  // height and only the air around it moved — but the card fills the scene now,
  // so anything that resizes the scene resizes the card, and the four buttons
  // arriving on the first flip would have shrunk the card mid-flip: the very
  // jump the retired ResizeObserver existed to prevent, by another route.
  //
  // The grid is always what sets the height (it is the tallest state); the
  // other two states sit over it.
  const showButtons = seen && !rated;

  return (
    <div className={FC.ratingWrap} style={{ position: 'relative' }}>
      {!showButtons && (
        <div className={FC.ratingOverlay} style={{ color: T.textDim }}>
          {rated ? '✓ Dinilai — melanjutkan…' : 'Balik kartu dulu untuk menilai'}
        </div>
      )}
      <div
        style={{ visibility: showButtons ? 'visible' : 'hidden' }}
        aria-hidden={showButtons ? undefined : true}
      >
        <div className={FC.ratingLabel} style={{ color: T.textDim }}>
          Seberapa hafal kamu?
        </div>
        <div className={FC.ratingGrid}>
          {[1, 2, 3, 4].map((r) => {
            const m = RATING_META[r];
            const interval = srsPreviews?.[r];
            return (
              <button
                key={r}
                className={FC.ratingBtn}
                // Hidden means unreachable, not merely invisible: a disabled
                // button is skipped by the tab order and ignored by a click that
                // lands on the reserved-but-empty space.
                disabled={!showButtons}
                onClick={() => {
                  haptic.tap();
                  onRate(r);
                }}
                aria-label={`Nilai ${m.id}${interval != null ? ` — ulang dalam ${fmtInterval(interval)}` : ''}`}
                style={{ background: m.bg, border: `1.5px solid ${m.border}`, color: m.color }}
              >
                <span className={FC.ratingEmoji}>{m.emoji}</span>
                <span className={FC.ratingId}>{m.id}</span>
                <span className={FC.ratingInterval}>{fmtInterval(interval)}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
