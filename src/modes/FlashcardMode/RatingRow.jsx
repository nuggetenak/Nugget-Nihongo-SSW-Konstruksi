// ─── FlashcardMode/RatingRow.jsx (phaseE) ────────────────────────────────────
// FSRS 4-button rating row — shown after card is flipped.
// ─────────────────────────────────────────────────────────────────────────────
import { T } from '../../styles/theme.js';
import { RATING_META } from '../../srs/fsrs-core.js';
import FC from './flashcard.module.css';

function fmtInterval(d) {
  if (d == null) return '';
  if (d < 0.05)  return '<1m';
  if (d < 1)     return `${Math.round(d * 24)}j`;
  if (d < 7)     return `${Math.round(d)}h`;
  if (d < 30)    return `${Math.round(d / 7)}mgg`;
  return `${Math.round(d / 30)}bln`;
}

export default function RatingRow({ flipped, rated, srsPreviews, onRate }) {
  if (!flipped) return null;

  if (rated) {
    return (
      <div className={FC.ratedConfirm} style={{ color: T.textDim }}>
        ✓ Dinilai — melanjutkan…
      </div>
    );
  }

  return (
    <div className={FC.ratingWrap}>
      <div className={FC.ratingLabel} style={{ color: T.textDim }}>Seberapa hafal kamu?</div>
      <div className={FC.ratingGrid}>
        {[1, 2, 3, 4].map((r) => {
          const m        = RATING_META[r];
          const interval = srsPreviews?.[r];
          return (
            <button
              key={r}
              className={FC.ratingBtn}
              onClick={() => onRate(r)}
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
  );
}
