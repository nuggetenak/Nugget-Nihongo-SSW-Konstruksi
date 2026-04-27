import { useState, useMemo, useCallback } from "react";
import { T } from "../styles/theme.js";
import { shuffle } from "../utils/shuffle.js";
import { makeWrongEntry } from "../utils/wrong-tracker.js";
import { usePersistedState } from "../hooks/usePersistedState.js";
import { stripFuri } from "../utils/jp-helpers.js";
import { WAYGROUND_SETS } from "../data/wayground-sets.js";
import QuizShell from "../components/QuizShell.jsx";

export default function WaygroundMode({ onExit }) {
  const [activeSet, setActiveSet] = useState(null);
  const [showFuri, setShowFuri] = useState(true);
  const [showHint, setShowHint] = useState(true);

  const set = WAYGROUND_SETS.find(s => s.id === activeSet);

  const questions = useMemo(() => {
    if (!set) return [];
    return shuffle(set.questions).map(q => ({
      question: showFuri ? q.q : stripFuri(q.q),
      questionSub: null,
      hint: showHint ? q.hint : null,
      options: q.opts.map((opt, i) => ({
        text: showFuri ? opt : stripFuri(opt),
        sub: q.opts_id?.[i] || null,
      })),
      correctIdx: q.ans,
      explanation: q.exp,
      _qId: `${set.id}-${q.id}`,
    }));
  }, [set, showFuri, showHint]);

  const [wrongCounts, setWrongCounts] = usePersistedState(
    activeSet ? `ssw-wg-wrong-${activeSet}` : "ssw-wg-temp", {}
  );

  const handleAnswer = useCallback((qIdx, selIdx, isCorrect) => {
    if (!isCorrect && set) {
      const qId = questions[qIdx]?._qId;
      if (qId) setWrongCounts(w => ({ ...w, [qId]: makeWrongEntry(w[qId]) }));
    }
  }, [questions, set, setWrongCounts]);

  // ─── Set Picker ───
  if (!activeSet) {
    const groups = [
      { label: "Teori", sets: WAYGROUND_SETS.filter(s => s.id.startsWith("wt")) },
      { label: "Praktik", sets: WAYGROUND_SETS.filter(s => s.id.startsWith("wp")) },
      { label: "Kosakata", sets: WAYGROUND_SETS.filter(s => s.id.startsWith("wg")) },
    ].filter(g => g.sets.length > 0);

    return (
      <div style={{ padding: "24px 16px", maxWidth: T.maxW, margin: "0 auto" }}>
        <button onClick={onExit} style={{ fontFamily: "inherit", fontSize: 12, color: T.textMuted, background: "none", border: "none", cursor: "pointer", marginBottom: 16 }}>← Kembali</button>
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>Wayground · Soal Teknis</h2>
        <p style={{ fontSize: 13, color: T.textMuted, marginBottom: 12 }}>
          {WAYGROUND_SETS.reduce((n, s) => n + s.questions.length, 0)} soal dalam {WAYGROUND_SETS.length} set
        </p>

        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          <button onClick={() => setShowFuri(f => !f)} style={{
            fontFamily: "inherit", fontSize: 11, padding: "6px 12px", borderRadius: T.r.pill, cursor: "pointer",
            background: showFuri ? "rgba(251,191,36,0.15)" : T.surface,
            border: `1px solid ${showFuri ? "rgba(251,191,36,0.4)" : T.border}`,
            color: showFuri ? T.gold : T.textMuted,
          }}>ふり {showFuri ? "ON" : "OFF"}</button>
          <button onClick={() => setShowHint(f => !f)} style={{
            fontFamily: "inherit", fontSize: 11, padding: "6px 12px", borderRadius: T.r.pill, cursor: "pointer",
            background: showHint ? "rgba(251,191,36,0.15)" : T.surface,
            border: `1px solid ${showHint ? "rgba(251,191,36,0.4)" : T.border}`,
            color: showHint ? T.gold : T.textMuted,
          }}>💡 {showHint ? "ON" : "OFF"}</button>
        </div>

        {groups.map(g => (
          <div key={g.label} style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: T.textDim, textTransform: "uppercase", marginBottom: 8 }}>{g.label}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {g.sets.map(s => (
                <button key={s.id} onClick={() => setActiveSet(s.id)} style={{
                  fontFamily: "inherit", padding: "14px 16px", borderRadius: T.r.md, cursor: "pointer",
                  background: T.surface, border: `1px solid ${T.border}`, color: T.text,
                  textAlign: "left",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>{s.emoji} {s.title}</span>
                    <span style={{ fontSize: 11, color: T.textDim }}>{s.questions.length}q</span>
                  </div>
                  {s.subtitle && <div style={{ fontSize: 11, color: T.textDim, marginTop: 4, fontFamily: T.fontJP }}>{s.subtitle}</div>}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <QuizShell
      questions={questions}
      onExit={() => setActiveSet(null)}
      title={`Wayground · ${set?.title || ""}`}
      onAnswer={handleAnswer}
      showHint={showHint}
      accentColor={set?.color || T.amber}
    />
  );
}
