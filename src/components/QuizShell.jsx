import { useState, useCallback, useEffect } from "react";
import { T } from "../styles/theme.js";
import { useQuizKeyboard } from "../hooks/useQuizKeyboard.js";
import { useStreak } from "../hooks/useStreak.js";
import ProgressBar from "./ProgressBar.jsx";
import OptionButton from "./OptionButton.jsx";
import ResultScreen from "./ResultScreen.jsx";

/**
 * QuizShell — Unified quiz flow wrapper.
 *
 * Handles: progress bar, question display, option rendering, keyboard,
 * streak, auto-next, correct/wrong feedback, result screen.
 *
 * Each quiz mode just provides questions + config.
 *
 * @param {Array}    questions   - [{ question, questionSub, options: [{ text, sub }], correctIdx, explanation }]
 * @param {Function} onExit      - Back to menu
 * @param {string}   title       - Mode title
 * @param {Function} [onAnswer]  - Called with (questionIdx, selectedIdx, isCorrect) for tracking
 * @param {number}   [timer]     - Time limit in seconds (0 = no timer)
 * @param {boolean}  [showHint]  - Show hint field if present
 * @param {Function} [renderExtra] - Custom content below question (e.g., photo desc)
 * @param {string}   [accentColor] - Custom accent color for this mode
 */
export default function QuizShell({
  questions,
  onExit,
  title = "Kuis",
  onAnswer,
  timer = 0,
  showHint = false,
  renderExtra,
  accentColor = T.amber,
}) {
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [results, setResults] = useState([]); // { isCorrect, userAnswer, correctAnswer, question, explanation }
  const [phase, setPhase] = useState("playing"); // "playing" | "finished"
  const [timeLeft, setTimeLeft] = useState(timer);
  const { streak, maxStreak, recordAnswer, reset: resetStreak } = useStreak();

  const q = questions[qIdx];
  const isLast = qIdx === questions.length - 1;

  // Timer countdown
  useEffect(() => {
    if (timer <= 0 || phase !== "playing") return;
    if (timeLeft <= 0) { setPhase("finished"); return; }
    const t = setTimeout(() => setTimeLeft(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, timer, phase]);

  const handleSelect = useCallback((idx) => {
    if (selected !== null || phase !== "playing") return;
    setSelected(idx);
    const isCorrect = idx === q.correctIdx;
    recordAnswer(isCorrect);
    onAnswer?.(qIdx, idx, isCorrect);
    setResults(r => [...r, {
      isCorrect,
      question: q.question,
      userAnswer: q.options[idx]?.text || "",
      correctAnswer: q.options[q.correctIdx]?.text || "",
      explanation: q.explanation || "",
    }]);
  }, [selected, phase, q, qIdx, onAnswer, recordAnswer]);

  const handleNext = useCallback(() => {
    if (selected === null) return;
    if (isLast) {
      setPhase("finished");
    } else {
      setQIdx(i => i + 1);
      setSelected(null);
    }
  }, [selected, isLast]);

  useQuizKeyboard({
    onSelect: handleSelect,
    onNext: handleNext,
    selected,
    phase,
    optCount: q?.options?.length || 4,
  });

  // Auto-next after 1.2s delay
  useEffect(() => {
    if (selected === null || phase !== "playing") return;
    const t = setTimeout(handleNext, 1800);
    return () => clearTimeout(t);
  }, [selected, phase, handleNext]);

  const handleRestart = () => {
    setQIdx(0); setSelected(null); setResults([]); setPhase("playing");
    setTimeLeft(timer); resetStreak();
  };

  const handleRetryWrong = () => {
    // This is a simplified retry — in practice the parent mode should handle this
    // by filtering questions to only wrong ones
    handleRestart();
  };

  // ─── Finished ────
  if (phase === "finished") {
    const correct = results.filter(r => r.isCorrect).length;
    return (
      <ResultScreen
        correct={correct}
        total={results.length}
        maxStreak={maxStreak}
        review={results.filter(r => !r.isCorrect)}
        onRestart={handleRestart}
        onRetryWrong={handleRetryWrong}
        onExit={onExit}
        title={title}
      />
    );
  }

  if (!q) return null;

  const correct = results.filter(r => r.isCorrect).length;
  const fmtTime = timer > 0 ? `${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, "0")}` : null;

  return (
    <div style={{ padding: "16px 16px 24px", maxWidth: T.maxW, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <button onClick={onExit} style={{
          fontFamily: "inherit", fontSize: 12, color: T.textMuted,
          background: "none", border: "none", cursor: "pointer", padding: "4px 0",
        }}>← {title}</button>
        <div style={{ fontSize: 12, color: T.textDim }}>
          {fmtTime && <span style={{ color: timeLeft < 60 ? T.wrong : T.textMuted, fontWeight: 600, marginRight: 8 }}>⏱ {fmtTime}</span>}
          {correct}/{qIdx + (selected !== null ? 1 : 0)} benar
          {streak > 1 && <span style={{ color: T.amber, marginLeft: 6 }}>🔥{streak}</span>}
        </div>
      </div>

      {/* Progress */}
      <ProgressBar current={qIdx + (selected !== null ? 1 : 0)} total={questions.length} color={accentColor} />

      {/* Question Counter */}
      <div style={{ fontSize: 11, color: T.textDim, marginTop: 10, marginBottom: 16 }}>
        Soal {qIdx + 1} / {questions.length}
      </div>

      {/* Question Card */}
      <div style={{
        padding: "20px 16px",
        background: T.surface,
        borderRadius: T.r.lg,
        border: `1px solid ${T.border}`,
        marginBottom: 16,
      }}>
        <div style={{ fontSize: 16, fontFamily: T.fontJP, lineHeight: 1.7, marginBottom: q.questionSub ? 8 : 0 }}>
          {q.question}
        </div>
        {q.questionSub && (
          <div style={{ fontSize: 13, color: T.textMuted, lineHeight: 1.5 }}>{q.questionSub}</div>
        )}
        {showHint && q.hint && (
          <div style={{ fontSize: 12, color: T.gold, marginTop: 8, fontStyle: "italic" }}>💡 {q.hint}</div>
        )}
        {renderExtra?.(q)}
      </div>

      {/* Options */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {q.options.map((opt, i) => (
          <OptionButton
            key={i}
            idx={i}
            text={opt.text}
            subText={opt.sub}
            selected={selected}
            isCorrect={i === q.correctIdx}
            onSelect={handleSelect}
          />
        ))}
      </div>

      {/* Explanation (shown after answer) */}
      {selected !== null && q.explanation && (
        <div style={{
          marginTop: 14, padding: "12px 14px",
          background: "rgba(251,191,36,0.06)",
          border: `1px solid rgba(251,191,36,0.15)`,
          borderRadius: T.r.md,
          fontSize: 12, lineHeight: 1.6, color: T.textMuted,
        }}>
          💡 {q.explanation}
        </div>
      )}

      {/* Next Button (shown after answer) */}
      {selected !== null && (
        <button onClick={handleNext} style={{
          width: "100%", marginTop: 14, padding: "12px",
          fontSize: 13, fontWeight: 700, fontFamily: "inherit",
          borderRadius: T.r.md, border: "none",
          background: T.accent, color: T.textBright, cursor: "pointer",
        }}>
          {isLast ? "Lihat Hasil →" : "Soal Berikutnya →"}
        </button>
      )}
    </div>
  );
}
