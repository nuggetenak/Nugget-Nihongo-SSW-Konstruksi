import { useState, useCallback, useEffect } from "react";
import { T } from "../styles/theme.js";
import { useQuizKeyboard } from "../hooks/useQuizKeyboard.js";
import { useStreak } from "../hooks/useStreak.js";
import ProgressBar from "./ProgressBar.jsx";
import OptionButton from "./OptionButton.jsx";
import ResultScreen from "./ResultScreen.jsx";

export default function QuizShell({
  questions, onExit, title = "Kuis", onAnswer,
  timer = 0, showHint = false, renderExtra, accentColor = T.amber,
}) {
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [results, setResults] = useState([]);
  const [phase, setPhase] = useState("playing");
  const [timeLeft, setTimeLeft] = useState(timer);
  const { streak, maxStreak, recordAnswer, reset: resetStreak } = useStreak();

  const q = questions[qIdx];
  const isLast = qIdx === questions.length - 1;

  // Timer
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
      isCorrect, question: q.question,
      userAnswer: q.options[idx]?.text || "",
      correctAnswer: q.options[q.correctIdx]?.text || "",
      explanation: q.explanation || "",
    }]);
  }, [selected, phase, q, qIdx, onAnswer, recordAnswer]);

  const handleNext = useCallback(() => {
    if (selected === null) return;
    if (isLast) { setPhase("finished"); }
    else { setQIdx(i => i + 1); setSelected(null); }
  }, [selected, isLast]);

  useQuizKeyboard({ onSelect: handleSelect, onNext: handleNext, selected, phase, optCount: q?.options?.length || 4 });

  // Auto-next
  useEffect(() => {
    if (selected === null || phase !== "playing") return;
    const t = setTimeout(handleNext, 2000);
    return () => clearTimeout(t);
  }, [selected, phase, handleNext]);

  const handleRestart = () => {
    setQIdx(0); setSelected(null); setResults([]); setPhase("playing"); setTimeLeft(timer); resetStreak();
  };

  if (phase === "finished") {
    const correct = results.filter(r => r.isCorrect).length;
    return <ResultScreen correct={correct} total={results.length} maxStreak={maxStreak} review={results.filter(r => !r.isCorrect)} onRestart={handleRestart} onRetryWrong={handleRestart} onExit={onExit} />;
  }
  if (!q) return null;

  const correct = results.filter(r => r.isCorrect).length;
  const fmtTime = timer > 0 ? `${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, "0")}` : null;

  return (
    <div style={{ padding: "12px 16px 24px", maxWidth: T.maxW, margin: "0 auto", animation: "fadeIn 0.2s ease" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <button onClick={onExit} style={{ fontFamily: "inherit", fontSize: 12, color: T.textMuted, background: "none", border: "none", cursor: "pointer", padding: "6px 0" }}>← {title}</button>
        <div style={{ fontSize: 12, color: T.textDim, display: "flex", alignItems: "center", gap: 8 }}>
          {fmtTime && <span style={{ color: timeLeft < 60 ? T.wrong : T.textMuted, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>⏱ {fmtTime}</span>}
          <span style={{ fontVariantNumeric: "tabular-nums" }}>{correct}/{qIdx + (selected !== null ? 1 : 0)}</span>
          {streak > 1 && <span style={{ color: T.amber, fontSize: 11, fontWeight: 700 }}>🔥{streak}</span>}
        </div>
      </div>

      <ProgressBar current={qIdx + (selected !== null ? 1 : 0)} total={questions.length} color={accentColor} />

      <div style={{ fontSize: 11, color: T.textFaint, marginTop: 8, marginBottom: 14, fontVariantNumeric: "tabular-nums" }}>
        {qIdx + 1} / {questions.length}
      </div>

      {/* Question */}
      <div style={{
        padding: "18px 16px", background: T.surface, borderRadius: T.r.lg,
        border: `1px solid ${T.border}`, marginBottom: 14,
        animation: "fadeIn 0.2s ease",
      }}>
        <div style={{ fontSize: 15, fontFamily: T.fontJP, lineHeight: 1.75, fontWeight: 500 }}>{q.question}</div>
        {q.questionSub && <div style={{ fontSize: 12, color: T.textMuted, marginTop: 6, lineHeight: 1.5 }}>{q.questionSub}</div>}
        {showHint && q.hint && <div style={{ fontSize: 11, color: T.gold, marginTop: 8, padding: "6px 10px", background: "rgba(251,191,36,0.06)", borderRadius: T.r.sm, lineHeight: 1.4 }}>💡 {q.hint}</div>}
        {renderExtra?.(q)}
      </div>

      {/* Options */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {q.options.map((opt, i) => (
          <OptionButton key={i} idx={i} text={opt.text} subText={opt.sub} selected={selected} isCorrect={i === q.correctIdx} onSelect={handleSelect} />
        ))}
      </div>

      {/* Explanation */}
      {selected !== null && q.explanation && (
        <div style={{
          marginTop: 12, padding: "12px 14px", borderRadius: T.r.md,
          background: "rgba(251,191,36,0.05)", border: `1px solid rgba(251,191,36,0.12)`,
          fontSize: 12, lineHeight: 1.65, color: T.textMuted, animation: "fadeIn 0.2s ease",
        }}>💡 {q.explanation}</div>
      )}

      {/* Next */}
      {selected !== null && (
        <button onClick={handleNext} style={{
          width: "100%", marginTop: 12, padding: "13px", fontSize: 13, fontWeight: 700,
          fontFamily: "inherit", borderRadius: T.r.md, border: "none",
          background: T.accent, color: T.textBright, cursor: "pointer",
          boxShadow: T.shadow.glow, animation: "fadeIn 0.15s ease",
        }}>
          {isLast ? "Lihat Hasil →" : "Lanjut →"}
        </button>
      )}
    </div>
  );
}
