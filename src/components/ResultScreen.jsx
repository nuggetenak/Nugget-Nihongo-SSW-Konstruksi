import { T, getGrade } from "../styles/theme.js";

export default function ResultScreen({ correct, total, maxStreak, review = [], onRestart, onRetryWrong, onExit }) {
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  const grade = getGrade(pct);
  const wrongCount = total - correct;

  return (
    <div style={{ padding: "20px 16px", maxWidth: T.maxW, margin: "0 auto", animation: "scaleIn 0.3s ease" }}>
      {/* Grade */}
      <div style={{
        textAlign: "center", padding: "28px 20px 24px",
        background: T.accentSoft, borderRadius: T.r.xl,
        border: `1px solid ${T.border}`, marginBottom: 16,
      }}>
        <div style={{ fontSize: 52, marginBottom: 6, filter: `drop-shadow(0 4px 16px ${grade.color}44)` }}>{grade.emoji}</div>
        <div style={{ fontSize: 32, fontWeight: 800, color: grade.color, marginBottom: 2, fontVariantNumeric: "tabular-nums" }}>{pct}%</div>
        <div style={{ fontSize: 14, color: T.textMuted, fontWeight: 600, marginBottom: 12 }}>{grade.label}</div>
        <div style={{ fontSize: 12, color: T.textDim }}>
          {correct}/{total} benar{maxStreak > 1 && ` · 🔥 ${maxStreak} streak`}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button onClick={onRestart} style={{
          flex: 1, padding: "12px", fontSize: 13, fontWeight: 700, fontFamily: "inherit",
          borderRadius: T.r.md, background: T.accent, border: "none", color: T.textBright,
          cursor: "pointer", boxShadow: T.shadow.glow,
        }}>🔄 Ulang</button>
        {onRetryWrong && wrongCount > 0 && (
          <button onClick={onRetryWrong} style={{
            flex: 1, padding: "12px", fontSize: 13, fontWeight: 700, fontFamily: "inherit",
            borderRadius: T.r.md, background: T.wrongBg, border: `1px solid ${T.wrongBorder}`,
            color: T.wrong, cursor: "pointer",
          }}>❌ Salah ({wrongCount})</button>
        )}
      </div>
      <button onClick={onExit} style={{
        width: "100%", padding: "10px", fontSize: 12, fontFamily: "inherit",
        borderRadius: T.r.md, background: "none", border: `1px solid ${T.border}`,
        color: T.textMuted, cursor: "pointer", marginBottom: 20,
      }}>← Kembali</button>

      {/* Review */}
      {review.length > 0 && (
        <>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: T.textDim, textTransform: "uppercase", marginBottom: 8 }}>Review</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {review.map((r, i) => (
              <div key={i} style={{
                padding: "12px 14px", borderRadius: T.r.md, background: T.surface,
                borderLeft: `3px solid ${T.wrong}`, animation: `slideUp 0.3s ease ${i * 0.05}s both`,
              }}>
                <div style={{ fontSize: 13, fontFamily: T.fontJP, marginBottom: 5, lineHeight: 1.5 }}>{r.question}</div>
                <div style={{ fontSize: 12, color: T.wrong, marginBottom: 3 }}>✗ {r.userAnswer}</div>
                <div style={{ fontSize: 12, color: T.correct }}>✓ {r.correctAnswer}</div>
                {r.explanation && <div style={{ fontSize: 11, color: T.textDim, marginTop: 5, lineHeight: 1.5, borderTop: `1px solid ${T.border}`, paddingTop: 5 }}>💡 {r.explanation.slice(0, 150)}{r.explanation.length > 150 ? "…" : ""}</div>}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
