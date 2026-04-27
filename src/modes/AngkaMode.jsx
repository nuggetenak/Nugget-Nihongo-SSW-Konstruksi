// ─── AngkaMode ──────────────────────────────────────────────────────────────
// Key numbers quiz — critical exam numbers students must memorize.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import { shuffle } from "../utils/shuffle.js";
import { stripFuri } from "../utils/jp-helpers.js";
import { ANGKA_KUNCI } from "../data/angka-kunci.js";
import { CARDS } from "../data/cards.js";

function AngkaMode() {
  const [subMode, setSubMode] = useState("panel");
  const [expandedIdx, setExpandedIdx] = useState(null);
  const [quizItems, setQuizItems] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [results, setResults] = useState([]);
  const [phase, setPhase] = useState("playing");
  const [opts, setOpts] = useState([]);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [pickedAnswers, setPickedAnswers] = useState([]); // text of picked option per question

  const startQuiz = () => {
    const items = shuffle(ANGKA_KUNCI);
    setQuizItems(items);
    setCurrentIdx(0);
    setSelected(null);
    setResults([]);
    setPickedAnswers([]);
    setPhase("playing");
    setSubMode("quiz");
    setStreak(0);
    setMaxStreak(0);
  };

  const handleAngkaSelect = useCallback((idx) => {
    if (selected !== null) return;
    setSelected(idx);
    const correct = opts[idx]?.correct;
    setResults(r => [...r, correct]);
    setPickedAnswers(p => [...p, opts[idx]?.text]);
    const ns = correct ? streak + 1 : 0;
    setStreak(ns);
    setMaxStreak(m => Math.max(m, ns));
  }, [selected, opts, streak]);

  const handleAngkaNext = useCallback(() => {
    if (currentIdx < quizItems.length - 1) { setSelected(null); setCurrentIdx(i => i + 1); }
    else setPhase("finished");
  }, [currentIdx, quizItems.length]);

  // Keyboard shortcuts
  useEffect(() => {
    if (subMode !== "quiz" || phase !== "playing") return;
    const h = (e) => {
      const MAP = { "1": 0, "2": 1, "3": 2, "4": 3, "a": 0, "b": 1, "c": 2, "d": 3 };
      const k = e.key.toLowerCase();
      if (selected === null && MAP[k] !== undefined && opts[MAP[k]]) handleAngkaSelect(MAP[k]);
      else if (selected !== null && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); handleAngkaNext(); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [subMode, phase, selected, opts, handleAngkaSelect, handleAngkaNext]);

  // Generate options for current quiz item
  useEffect(() => {
    if (subMode !== "quiz" || quizItems.length === 0) return;
    const item = quizItems[currentIdx];
    const wrongs = shuffle(ANGKA_KUNCI.filter(a => a.angka !== item.angka)).slice(0, 3);
    const allOpts = shuffle([
      { text: item.angka, correct: true },
      ...wrongs.map(w => ({ text: w.angka, correct: false })),
    ]);
    setOpts(allOpts);
    setSelected(null);
  }, [currentIdx, quizItems, subMode]);

  if (subMode === "panel") {
    return (
      <div style={{ padding: "0 16px 32px", maxWidth: 560, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0" }}>🔢 Angka Kunci Ujian</div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{ANGKA_KUNCI.length} angka wajib hafal</div>
          </div>
          <button onClick={startQuiz} style={{ fontFamily: "inherit", padding: "9px 18px", fontSize: 13, borderRadius: 10, cursor: "pointer", background: "linear-gradient(135deg, #38b2ac, #2c7a7b)", border: "none", color: "#fff", fontWeight: 700 }}>
            🧠 Quiz
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {ANGKA_KUNCI.map((item, i) => {
            const isOpen = expandedIdx === i;
            // Find the related card if any
            const relCard = item.kartu ? CARDS.find(c => c.id === item.kartu) : null;
            return (
              <div key={i} onClick={() => setExpandedIdx(isOpen ? null : i)} style={{ cursor: "pointer" }}>
                <div style={{ background: isOpen ? "rgba(56,178,172,0.22)" : "rgba(56,178,172,0.1)", border: `${isOpen ? "2px" : "1px"} solid ${isOpen ? "rgba(56,178,172,0.7)" : "rgba(56,178,172,0.3)"}`, borderRadius: isOpen ? "14px 14px 0 0" : 14, padding: "12px 14px", display: "flex", gap: 12, alignItems: "center", transition: "all 0.15s" }}>
                  <div style={{ background: "linear-gradient(135deg, #38b2ac, #2c7a7b)", borderRadius: 10, padding: "5px 8px", fontSize: 13, fontWeight: 700, color: "#fff", flexShrink: 0, fontFamily: "monospace", minWidth: 20, textAlign: "center", lineHeight: 1.3 }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: "#81e6d9", fontFamily: "monospace", marginBottom: 2 }}>{item.angka}</div>
                    <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.konteks}</div>
                  </div>
                  <div style={{ fontSize: 15, color: "#64748b", flexShrink: 0 }}>{isOpen ? "▲" : "▼"}</div>
                </div>
                {isOpen && (
                  <div style={{ background: "rgba(56,178,172,0.07)", border: "2px solid rgba(56,178,172,0.7)", borderTop: "1px solid rgba(56,178,172,0.2)", borderRadius: "0 0 14px 14px", padding: "14px 16px" }}>
                    <div style={{ fontSize: 24, fontWeight: 700, color: "#81e6d9", fontFamily: "monospace", marginBottom: 8 }}>{item.angka}</div>
                    <div style={{ fontSize: 14, lineHeight: 1.7, color: "#cbd5e1", marginBottom: 10 }}>{item.konteks}</div>
                    {relCard && (
                      <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 12, padding: "12px 14px", border: "1px solid rgba(255,255,255,0.1)" }}>
                        <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 6 }}>Kartu #{relCard.id} · {relCard.category}</div>
                        <div style={{ fontSize: 18, fontFamily: "'Zen Kaku Gothic New','Noto Sans JP',sans-serif", fontWeight: 700, marginBottom: 4 }}>{stripFuri(relCard.jp)}</div>
                        <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 6 }}>{relCard.romaji}</div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#93c5fd", marginBottom: 6 }}>{relCard.id_text}</div>
                        <div style={{ fontSize: 13, color: "#cbd5e1", lineHeight: 1.7 }}>{relCard.desc}</div>
                      </div>
                    )}
                    {!relCard && item.kartu && (
                      <div style={{ fontSize: 12, color: "#64748b" }}>→ Kartu #{item.kartu}</div>
                    )}
                    {!item.kartu && (
                      <div style={{ fontSize: 12, color: "#64748b", fontStyle: "italic" }}>Tidak terikat ke kartu spesifik (data umum ujian)</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Quiz mode
  if (phase === "finished") {
    const score = results.filter(Boolean).length;
    const acc = Math.round((score / quizItems.length) * 100);
    const grade = acc >= 90 ? { emoji: "🏆", col: "#fbbf24" } : acc >= 70 ? { emoji: "✨", col: "#4ade80" } : acc >= 50 ? { emoji: "📚", col: "#60a5fa" } : { emoji: "💪", col: "#f87171" };
    const wrongItems = quizItems.filter((_, i) => results[i] === false);
    return (
      <div style={{ padding: "16px", maxWidth: 560, margin: "0 auto" }}>
        <div style={{ borderRadius: 22, background: "rgba(255,255,255,0.06)", border: `1px solid ${grade.col}30`, padding: "28px 22px", textAlign: "center", marginBottom: 18, boxShadow: `0 8px 32px ${grade.col}10` }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>{grade.emoji}</div>
          <div style={{ fontSize: 11, color: "#475569", letterSpacing: 2, marginBottom: 6 }}>HASIL SIMULASI ANGKA</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: grade.col, marginBottom: 4 }}>{score} / {quizItems.length}</div>
          <div style={{ fontSize: 13, color: "#94a3b8" }}>{acc}% benar</div>
          {maxStreak > 2 && <div style={{ marginTop: 10, fontSize: 12, color: "#fbbf2480" }}>🔥 streak terpanjang: {maxStreak}</div>}
          <div style={{ height: 4, background: "rgba(0,0,0,0.3)", borderRadius: 99, margin: "18px 0 0", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${acc}%`, background: `linear-gradient(90deg,${grade.col}80,${grade.col})`, borderRadius: 99, transition: "width 0.6s ease" }} />
          </div>
        </div>
        {wrongItems.length > 0 && (
          <>
            <div style={{ fontSize: 10, color: "#64748b", letterSpacing: 1.5, marginBottom: 8 }}>REVIEW JAWABAN SALAH ({wrongItems.length})</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
              {quizItems.map((item, i) => {
                if (results[i] !== false) return null;
                const picked = pickedAnswers[i];
                return (
                  <div key={i} style={{ borderRadius: 16, background: "rgba(239,68,68,0.07)", border: "1.5px solid rgba(239,68,68,0.25)", overflow: "hidden" }}>
                    <div style={{ padding: "10px 14px", background: "rgba(239,68,68,0.08)", display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid rgba(239,68,68,0.15)" }}>
                      <span style={{ fontSize: 16 }}>✗</span>
                      <span style={{ fontSize: 12, color: "#f87171", fontWeight: 700 }}>Salah → {item.angka}</span>
                    </div>
                    <div style={{ padding: "12px 14px" }}>
                      <div style={{ fontSize: 13, color: "#e2e8f0", lineHeight: 1.7, fontFamily: "'Noto Sans JP',sans-serif", marginBottom: 8 }}>{item.konteks}</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        {picked && picked !== item.angka && (
                          <div style={{ fontSize: 12, padding: "6px 10px", borderRadius: 8, background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", color: "#fca5a5", fontFamily: "monospace" }}>✗ {picked}</div>
                        )}
                        <div style={{ fontSize: 12, padding: "6px 10px", borderRadius: 8, background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.3)", color: "#86efac", fontFamily: "monospace" }}>✓ {item.angka}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={startQuiz} style={{ fontFamily: "inherit", flex: 2, padding: "14px 0", fontSize: 14, fontWeight: 700, borderRadius: 14, background: "linear-gradient(135deg, #38b2ac, #2c7a7b)", border: "none", color: "#fff", cursor: "pointer" }}>🔄 Ulangi Quiz</button>
          <button onClick={() => setSubMode("panel")} style={{ fontFamily: "inherit", flex: 1, padding: "14px 0", fontSize: 14, fontWeight: 700, borderRadius: 14, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.06)", color: "#94a3b8", cursor: "pointer" }}>📋 Panel</button>
        </div>
      </div>
    );
  }

  const item = quizItems[currentIdx];
  const score = results.filter(Boolean).length;
  return (
    <div style={{ padding: "0 16px 24px", maxWidth: 560, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, opacity: 0.6 }}>Soal {currentIdx + 1} / {quizItems.length}</span>
          {streak > 1 && <span style={{ fontSize: 11, color: "#fbbf24", fontWeight: 700 }}>🔥{streak}</span>}
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#68d391" }}>✓ {score}<span style={{ color: "#fc8181", marginLeft: 10 }}>✗ {results.filter(r => !r).length}</span></div>
      </div>
      <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden", marginBottom: 14 }}>
        <div style={{ height: "100%", width: `${(currentIdx / quizItems.length) * 100}%`, background: "linear-gradient(90deg, #38b2ac, #2c7a7b)", transition: "width 0.3s" }} />
      </div>
      <div style={{ background: "linear-gradient(135deg, rgba(56,178,172,0.2), rgba(44,122,123,0.15))", borderRadius: 20, padding: "20px 18px", border: "2px solid rgba(56,178,172,0.4)", marginBottom: 14 }}>
        <div style={{ fontSize: 11, opacity: 0.5, textTransform: "uppercase", letterSpacing: 2, marginBottom: 10 }}>Angka berapa untuk…</div>
        <div style={{ fontSize: 14, lineHeight: 1.7, fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 600 }}>{item.konteks}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
        {opts.map((opt, idx) => {
          let bg = "rgba(255,255,255,0.07)", border = "1px solid rgba(255,255,255,0.12)", color = "#e2e8f0";
          if (selected !== null) {
            if (opt.correct) { bg = "rgba(34,197,94,0.2)"; border = "2px solid #22c55e"; color = "#86efac"; }
            else if (idx === selected) { bg = "rgba(239,68,68,0.2)"; border = "2px solid #ef4444"; color = "#fca5a5"; }
            else { bg = "rgba(255,255,255,0.03)"; color = "rgba(255,255,255,0.3)"; }
          }
          return (
            <button key={idx} onClick={() => handleAngkaSelect(idx)} style={{ fontFamily: "inherit", padding: "13px 16px", fontSize: 14, borderRadius: 14, background: bg, border, color, cursor: selected !== null ? "default" : "pointer", textAlign: "left", lineHeight: 1.4, fontWeight: 600, display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ width: 26, height: 26, borderRadius: "50%", flexShrink: 0, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, border: "1px solid rgba(255,255,255,0.15)" }}>
                {selected !== null ? (opt.correct ? "✓" : idx === selected ? "✗" : idx + 1) : idx + 1}
              </span>
              <span style={{ fontFamily: "monospace" }}>{opt.text}</span>
            </button>
          );
        })}
      </div>
      {selected !== null && (
        <>
          <div style={{ background: opts[selected]?.correct ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)", border: `1px solid ${opts[selected]?.correct ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`, borderRadius: 14, padding: "12px 14px", marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: opts[selected]?.correct ? "#86efac" : "#fca5a5" }}>
              {opts[selected]?.correct ? "✓ Benar!" : `✗ Jawaban: ${item.angka}`}
            </div>
          </div>
          <button onClick={handleAngkaNext} style={{ width: "100%", padding: "14px", fontSize: 15, fontWeight: 700, borderRadius: 14, background: "linear-gradient(135deg, #38b2ac, #2c7a7b)", border: "none", color: "#fff", cursor: "pointer", fontFamily: "inherit" }}>
            {currentIdx < quizItems.length - 1 ? "Soal berikutnya →" : "Lihat hasil 🏁"}
          </button>
        </>
      )}
    </div>
  );
}


export default AngkaMode;
