// ─── ResultScreen.jsx ────────────────────────────────────────────────────────
// Low-score messages use "not yet" framing (Dweck 2006) to preserve motivation.
// ─────────────────────────────────────────────────────────────────────────────

import s from './ResultScreen.module.css';
import { getGrade } from '../styles/theme.js';
import { useApp } from '../contexts/AppContext.jsx';
import { JpFront } from './JpDisplay.jsx';
import { findWeakestCategory } from '../utils/session-weakness.js';

// rsShake animation — injected once (not worth a CSS module import just for this)
const SHAKE_CSS = `@keyframes rsShake{0%,100%{transform:translateX(0)}20%{transform:translateX(-4px)}40%{transform:translateX(4px)}60%{transform:translateX(-3px)}80%{transform:translateX(3px)}}`;
let _shakeInjected = false;
function ensureShake() {
  if (_shakeInjected || typeof document === 'undefined') return;
  const el = document.createElement('style');
  el.textContent = SHAKE_CSS;
  document.head.appendChild(el);
  _shakeInjected = true;
}

export default function ResultScreen({
  correct,
  total,
  maxStreak,
  review = [],
  onRestart,
  onRetryWrong,
  onAddToSRS,
  srsWrongCount,
  onDrillCategory,
  onExit,
}) {
  const { prefs } = useApp();
  const furiganaPolicy = prefs?.furiganaPolicy ?? 'always';
  ensureShake();

  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  const grade = getGrade(pct);
  const wrongCount = total - correct;
  const path = pct >= 70 ? 'celebrate' : pct < 50 ? 'encourage' : 'neutral';

  const weakCategory = onDrillCategory
    ? findWeakestCategory(review.map((r) => ({ category: r.category, cardId: r._cardId })))
    : null;

  const weaknessTip =
    path === 'encourage' && wrongCount > 0
      ? `Kamu salah ${wrongCount} soal. Coba pelajari kartunya lagi, lalu kuis ulang.`
      : null;

  return (
    <div className={s.container}>
      {/* Grade hero */}
      <div className={s.hero} data-path={path}>
        {path === 'celebrate' && <div className={s.stars} aria-hidden="true" />}
        <span className={s.heroEmoji} data-path={path}>
          {path === 'celebrate' ? '🏆' : path === 'encourage' ? '🌱' : grade.emoji}
        </span>
        <div className={s.heroPct} data-shake={path === 'encourage'} style={{ color: grade.color }}>
          {pct}%
        </div>
        <div className={s.heroLabel}>
          {path === 'celebrate'
            ? '🎉 ' + grade.label
            : path === 'encourage'
              ? 'Belum. Tapi kamu sudah tahu apa yang perlu dipelajari.'
              : grade.label}
        </div>
        <div className={s.heroSub}>
          {correct}/{total} benar{maxStreak > 1 ? ` · 🔥 ${maxStreak} streak` : ''}
        </div>
      </div>

      {/* Weakness tip */}
      {weaknessTip && <div className={s.tip}>💡 {weaknessTip}</div>}
      {weakCategory && (
        <div className={s.tip}>
          {weakCategory.emoji} {weakCategory.count} salah di {weakCategory.label} — latih
          kategori itu?
          <button
            className={s.btnWrong}
            style={{ marginTop: 8 }}
            onClick={() => onDrillCategory(weakCategory.key)}
          >
            Latih {weakCategory.label}
          </button>
        </div>
      )}

      {/* Actions */}
      <div className={s.actions}>
        <button className={s.btnPrimary} onClick={onRestart}>
          🔄 Ulang
        </button>
        {onRetryWrong && wrongCount > 0 && (
          <button className={s.btnWrong} onClick={onRetryWrong}>
            ❌ Latih {wrongCount} salah
          </button>
        )}
        {onAddToSRS && (srsWrongCount ?? wrongCount) > 0 && (
          <button
            className={s.btnWrong}
            style={{
              background: 'rgba(99,102,241,0.12)',
              borderColor: 'rgba(99,102,241,0.35)',
              color: '#818cf8',
            }}
            onClick={onAddToSRS}
          >
            🧠 Tambah ke Ulasan SRS
          </button>
        )}
      </div>
      <button className={s.btnBack} onClick={onExit}>
        ← Kembali
      </button>

      {/* Wrong answer review */}
      {review.length > 0 && (
        <>
          <div className={s.reviewHeader}>Jawaban Salah ({review.length})</div>
          <div className={s.reviewList}>
            {review.map((r, i) => (
              <div
                key={i}
                className={s.reviewItem}
                style={{ animation: `slideUp 0.3s ease ${i * 0.05}s both` }}
              >
                <div className={s.reviewQ}>
                  <JpFront jp={r.question} furiganaPolicy={furiganaPolicy} />
                </div>
                <div className={s.reviewWrong}>✗ {r.userAnswer}</div>
                <div className={s.reviewCorrect}>✓ {r.correctAnswer}</div>
                {r.explanation && (
                  <div className={s.reviewExpl}>
                    💡 {r.explanation.slice(0, 180)}
                    {r.explanation.length > 180 ? '…' : ''}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
