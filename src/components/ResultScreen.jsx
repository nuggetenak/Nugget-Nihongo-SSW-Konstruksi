import { T, getGrade } from "../styles/theme.js";

/**
 * Unified result screen for all quiz modes.
 * @param {number}   correct    - Number of correct answers
 * @param {number}   total      - Total questions
 * @param {number}   maxStreak  - Best consecutive streak
 * @param {Array}    review     - Array of { question, userAnswer, correctAnswer, explanation }
 * @param {Function} onRestart  - Full restart callback
 * @param {Function} onRetryWrong - Retry only wrong answers callback (optional)
 * @param {Function} onExit     - Back to menu callback
 * @param {string}   [title]    - Optional mode title
 */
export default function ResultScreen({ correct, total, maxStreak, review = [], onRestart, onRetryWrong, onExit, title }) {
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  const grade = getGrade(pct);
  const wrongCount = total - correct;

  return (
    <div style={{ padding: "24px 16px", maxWidth: T.maxW, margin: "0 auto" }}>
      {/* Grade Card */}
      <div style={{
        textAlign: "center", padding: "32px 20px",
        background: T.surface, borderRadius: T.r.xl,
        border: `1px solid ${T.border}`, marginBottom: 20,
      }}>
        <div style={{ fontSize: 56, marginBottom: 8, filter: `drop-shadow(0 4px 20px ${grade.color}44)` }}>{grade.emoji}</div>
        <div style={{ fontSize: 28, fontWeight: 800, color: grade.color, marginBottom: 4 }}>{pct}%</div>
        <div style={{ fontSize: 14, color: T.textMuted, marginBottom: 16 }}>{grade.label}</div>
        <div style={{ fontSize: 13, color: T.textDim }}>
          {correct}/{total} benar {maxStreak > 1 && `· 🔥 ${maxStreak} streak`}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <button onClick={onRestart} style={{
          flex: 1, padding: "12px", fontSize: 13, fontWeight: 700,
          fontFamily: "inherit", borderRadius: T.r.md,
          background: T.accent, border: "none", color: T.textBright, cursor: "pointer",
        }}>🔄 Ulang Semua</button>
        {onRetryWrong && wrongCount > 0 && (
          <button onClick={onRetryWrong} style={{
            flex: 1, padding: "12px", fontSize: 13, fontWeight: 700,
            fontFamily: "inherit", borderRadius: T.r.md,
            background: T.wrongBg, border: `1px solid ${T.wrongBorder}`,
            color: T.wrong, cursor: "pointer",
          }}>❌ Yang Salah ({wrongCount})</button>
        )}
      </div>
      <button onClick={onExit} style={{
        width: "100%", padding: "10px", fontSize: 12, fontFamily: "inherit",
        borderRadius: T.r.md, background: "none",
        border: `1px solid ${T.border}`, color: T.textMuted, cursor: "pointer",
        marginBottom: 24,
      }}>← Kembali</button>

      {/* Review Section */}
      {review.length > 0 && (
        <>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: T.textDim, textTransform: "uppercase", marginBottom: 10 }}>
            Review Jawaban
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {review.map((r, i) => (
              <div key={i} style={{
                padding: "12px 14px", borderRadius: T.r.md,
                background: T.surface,
                borderLeft: `3px solid ${r.isCorrect ? T.correct : T.wrong}`,
              }}>
                <div style={{ fontSize: 13, fontFamily: T.fontJP, marginBottom: 6 }}>{r.question}</div>
                {!r.isCorrect && (
                  <div style={{ fontSize: 12, color: T.wrong, marginBottom: 4 }}>
                    Jawaban kamu: {r.userAnswer}
                  </div>
                )}
                <div style={{ fontSize: 12, color: T.correct }}>
                  ✓ {r.correctAnswer}
                </div>
                {r.explanation && (
                  <div style={{ fontSize: 11, color: T.textMuted, marginTop: 6, lineHeight: 1.5 }}>{r.explanation}</div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
