// ─── ResultScreen.jsx v3.2 ────────────────────────────────────────────────────
// Phase 5: Two emotional paths — celebrate ≥70% · encourage <50%
// Blueprint B6: animated grade, weakness tip, review section
// ─────────────────────────────────────────────────────────────────────────────

import { T, getGrade } from '../styles/theme.js';

// Gentle shake for wrong-answer score
const SHAKE_STYLE = `
@keyframes rsShake {
  0%,100% { transform: translateX(0); }
  20%      { transform: translateX(-4px); }
  40%      { transform: translateX(4px); }
  60%      { transform: translateX(-3px); }
  80%      { transform: translateX(3px); }
}
`;
let _injected = false;
function ensureShakeStyle() {
  if (_injected) return;
  const el = document.createElement('style');
  el.textContent = SHAKE_STYLE;
  document.head.appendChild(el);
  _injected = true;
}

export default function ResultScreen({
  correct,
  total,
  maxStreak,
  review = [],
  onRestart,
  onRetryWrong,
  onExit,
  // title prop reserved for future use
}) {
  ensureShakeStyle();

  const pct       = total > 0 ? Math.round((correct / total) * 100) : 0;
  const grade     = getGrade(pct);
  const wrongCount= total - correct;
  const isCelebrate = pct >= 70;
  const isEncourage = pct < 50;

  // Detect dominant wrong category from review explanation text (heuristic)
  // For now show generic tip based on pct range
  const weaknessTip = isEncourage && wrongCount > 0
    ? `Kamu salah ${wrongCount} soal. Coba pelajari kartunya lagi, lalu kuis ulang.`
    : null;

  return (
    <div style={{ padding: '20px 16px', maxWidth: T.maxW, margin: '0 auto', animation: 'scaleIn 0.3s ease' }}>

      {/* ── Grade hero ── */}
      <div
        style={{
          textAlign: 'center',
          padding: '28px 20px 24px',
          background: isCelebrate ? 'rgba(22,163,74,0.06)' : isEncourage ? 'rgba(220,38,38,0.04)' : T.accentSoft,
          borderRadius: T.r.xl,
          border: `1px solid ${isCelebrate ? 'rgba(22,163,74,0.2)' : isEncourage ? 'rgba(220,38,38,0.15)' : T.border}`,
          marginBottom: 16,
        }}
      >
        {/* Emoji */}
        <div
          style={{
            fontSize: 52,
            marginBottom: 6,
            filter: `drop-shadow(0 4px 16px ${grade.color}44)`,
            animation: isCelebrate ? 'bounceIn 0.5s ease' : 'fadeIn 0.4s ease',
          }}
        >
          {isCelebrate ? '🏆' : isEncourage ? '💪' : grade.emoji}
        </div>

        {/* Percentage */}
        <div
          style={{
            fontSize: 36,
            fontWeight: 800,
            color: grade.color,
            marginBottom: 2,
            fontVariantNumeric: 'tabular-nums',
            animation: isEncourage ? 'rsShake 0.4s ease 0.3s both' : 'none',
          }}
        >
          {pct}%
        </div>

        <div style={{ fontSize: 14, color: T.textMuted, fontWeight: 700, marginBottom: 8 }}>
          {isCelebrate ? '🎉 ' : ''}{grade.label}
        </div>

        <div style={{ fontSize: 12, color: T.textDim }}>
          {correct}/{total} benar{maxStreak > 1 ? ` · 🔥 ${maxStreak} streak` : ''}
        </div>
      </div>

      {/* ── Weakness tip (encourage path only) ── */}
      {weaknessTip && (
        <div
          style={{
            padding: '12px 14px',
            borderRadius: T.r.md,
            background: 'rgba(59,130,246,0.06)',
            border: '1px solid rgba(59,130,246,0.15)',
            marginBottom: 12,
            fontSize: 12,
            color: T.textMuted,
            lineHeight: 1.6,
          }}
        >
          💡 {weaknessTip}
        </div>
      )}

      {/* ── Actions ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <button
          onClick={onRestart}
          style={{ flex: 1, padding: '12px', fontSize: 13, fontWeight: 700, fontFamily: 'inherit', borderRadius: T.r.md, background: T.accent, border: 'none', color: T.textBright, cursor: 'pointer', boxShadow: T.shadow.glow }}
        >
          🔄 Ulang
        </button>
        {onRetryWrong && wrongCount > 0 && (
          <button
            onClick={onRetryWrong}
            style={{ flex: 1, padding: '12px', fontSize: 13, fontWeight: 700, fontFamily: 'inherit', borderRadius: T.r.md, background: T.wrongBg, border: `1px solid ${T.wrongBorder}`, color: T.wrong, cursor: 'pointer' }}
          >
            ❌ Latih {wrongCount} salah
          </button>
        )}
      </div>
      <button
        onClick={onExit}
        style={{ width: '100%', padding: '10px', fontSize: 12, fontFamily: 'inherit', borderRadius: T.r.md, background: 'none', border: `1px solid ${T.border}`, color: T.textMuted, cursor: 'pointer', marginBottom: 20 }}
      >
        ← Kembali
      </button>

      {/* ── Wrong answer review ── */}
      {review.length > 0 && (
        <>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, color: T.textDim, textTransform: 'uppercase', marginBottom: 8 }}>
            Jawaban Salah ({review.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {review.map((r, i) => (
              <div
                key={i}
                style={{ padding: '12px 14px', borderRadius: T.r.md, background: T.surface, borderLeft: `3px solid ${T.wrong}`, animation: `slideUp 0.3s ease ${i * 0.05}s both` }}
              >
                <div style={{ fontSize: 13, fontFamily: T.fontJP, marginBottom: 6, lineHeight: 1.5 }}>
                  {r.question}
                </div>
                <div style={{ fontSize: 12, color: T.wrong, marginBottom: 3 }}>✗ {r.userAnswer}</div>
                <div style={{ fontSize: 12, color: T.correct, marginBottom: r.explanation ? 6 : 0 }}>✓ {r.correctAnswer}</div>
                {r.explanation && (
                  <div style={{ fontSize: 11, color: T.textDim, lineHeight: 1.5, borderTop: `1px solid ${T.border}`, paddingTop: 6 }}>
                    💡 {r.explanation.slice(0, 180)}{r.explanation.length > 180 ? '…' : ''}
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
