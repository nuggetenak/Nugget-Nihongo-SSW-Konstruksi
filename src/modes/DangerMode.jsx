// ─── DangerMode ─────────────────────────────────────────────────────────────
// Confusing term pairs drill — trains students to distinguish similar terms.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import { shuffle } from "../utils/shuffle.js";
import { DANGER_PAIRS } from "../data/danger-pairs.js";

function DangerMode() {
  const [items, setItems] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [results, setResults] = useState([]);
  const [phase, setPhase] = useState("playing");
  const [opts, setOpts] = useState([]);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [showFuri, setShowFuri] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [pickedAnswers, setPickedAnswers] = useState([]); // text of picked option per question

  const startDrill = useCallback(() => {
    const shuffled = shuffle(DANGER_PAIRS);
    setItems(shuffled);
    setCurrentIdx(0);
    setSelected(null);
    setResults([]);
    setPickedAnswers([]);
    setPhase("playing");
    setStreak(0);
    setMaxStreak(0);
  }, []);

  useEffect(() => { startDrill(); }, []);

  useEffect(() => {
    if (items.length === 0) return;
    const item = items[currentIdx];
    const allOpts = shuffle([
      { text: item.correct, correct: true },
      ...item.traps.map(t => ({ text: t, correct: false })),
    ]);
    setOpts(allOpts);
    setSelected(null);
  }, [currentIdx, items]);

  const handleSelect = useCallback((idx) => {
    if (selected !== null) return;
    setSelected(idx);
    const correct = opts[idx]?.correct;
    setResults(r => [...r, correct]);
    setPickedAnswers(p => [...p, opts[idx]?.text]);
    const ns = correct ? streak + 1 : 0;
    setStreak(ns);
    setMaxStreak(m => Math.max(m, ns));
  }, [selected, opts, streak]);

  const handleNext = useCallback(() => {
    if (currentIdx < items.length - 1) { setSelected(null); setCurrentIdx(i => i + 1); }
    else setPhase("finished");
  }, [currentIdx, items.length]);

  // Keyboard shortcuts: 1/2/3 pick + Enter/Space next
  useEffect(() => {
    const h = (e) => {
      if (phase !== "playing" || items.length === 0) return;
      const MAP = { "1": 0, "2": 1, "3": 2, "a": 0, "b": 1, "c": 2 };
      const k = e.key.toLowerCase();
      if (selected === null && MAP[k] !== undefined && opts[MAP[k]]) handleSelect(MAP[k]);
      else if (selected !== null && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); handleNext(); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [selected, phase, items.length, opts, handleSelect, handleNext]);

  if (items.length === 0) return null;

  if (phase === "finished") {
    const score = results.filter(Boolean).length;
    const acc = Math.round((score / items.length) * 100);
    const wrongItems = items.filter((_, i) => results[i] === false);
    const grade = acc >= 90 ? { emoji: "🏆", col: "#fbbf24" } : acc >= 70 ? { emoji: "✨", col: "#4ade80" } : acc >= 50 ? { emoji: "📚", col: "#60a5fa" } : { emoji: "💪", col: "#f87171" };
    return (
      <div style={{ padding: "16px", maxWidth: 560, margin: "0 auto" }}>
        <div style={{ borderRadius: 22, background: "rgba(255,255,255,0.06)", border: `1px solid ${grade.col}30`, padding: "28px 22px", textAlign: "center", marginBottom: 18, boxShadow: `0 8px 32px ${grade.col}10` }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>{grade.emoji}</div>
          <div style={{ fontSize: 11, color: "#475569", letterSpacing: 2, marginBottom: 6 }}>HASIL JEBAK DRILL</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: grade.col, marginBottom: 4 }}>{score} / {items.length}</div>
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
              {items.map((item, i) => {
                if (results[i] !== false) return null;
                const picked = pickedAnswers[i];
                const opts3 = [item.correct, ...item.traps];
                return (
                  <div key={i} style={{ borderRadius: 16, background: "rgba(239,68,68,0.07)", border: "1.5px solid rgba(239,68,68,0.25)", overflow: "hidden" }}>
                    <div style={{ padding: "10px 14px", background: "rgba(239,68,68,0.08)", display: "flex", alignItems: "center", gap: 8, borderBottom: "1px solid rgba(239,68,68,0.15)" }}>
                      <span style={{ fontSize: 16 }}>✗</span>
                      <span style={{ fontSize: 12, color: "#f87171", fontWeight: 700 }}>Salah → {item.correct}</span>
                    </div>
                    <div style={{ padding: "12px 14px" }}>
                      <div style={{ fontSize: 12, color: "#94a3b8", fontStyle: "italic", lineHeight: 1.6, marginBottom: 10 }}>
                        <span style={{ fontFamily: "'Zen Kaku Gothic New','Noto Sans JP',sans-serif", fontSize: 16, fontWeight: 700, color: "#e2e8f0", fontStyle: "normal" }}>{item.term}</span>
                        {item.furi && <span style={{ marginLeft: 8, fontSize: 11, color: "#93c5fd" }}>{item.furi}</span>}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        {opts3.map((opt, oi) => {
                          const isAns = oi === 0;
                          const isPicked = opt === picked && !isAns;
                          return (
                            <div key={oi} style={{ fontSize: 12, padding: "6px 10px", borderRadius: 8, lineHeight: 1.5, display: "flex", gap: 6,
                              background: isAns ? "rgba(74,222,128,0.1)" : isPicked ? "rgba(248,113,113,0.08)" : "transparent",
                              border: isAns ? "1px solid rgba(74,222,128,0.3)" : isPicked ? "1px solid rgba(248,113,113,0.2)" : "1px solid transparent",
                              color: isAns ? "#86efac" : isPicked ? "#fca5a5" : "#64748b" }}>
                              <span style={{ fontWeight: 700, minWidth: 16, flexShrink: 0 }}>{oi + 1})</span>
                              <span>{opt}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={startDrill} style={{ fontFamily: "inherit", flex: 2, padding: "14px 0", fontSize: 14, fontWeight: 700, borderRadius: 14, background: "linear-gradient(135deg, #ed8936, #c05621)", border: "none", color: "#fff", cursor: "pointer" }}>🔄 Ulangi Drill</button>
          {wrongItems.length > 0 && (
            <button onClick={() => { setItems(shuffle(wrongItems)); setCurrentIdx(0); setSelected(null); setResults([]); setPhase("playing"); }} style={{ fontFamily: "inherit", flex: 1, padding: "14px 0", fontSize: 14, fontWeight: 700, borderRadius: 14, background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.4)", color: "#fc8181", cursor: "pointer" }}>🔁 Salah ({wrongItems.length})</button>
          )}
        </div>
      </div>
    );
  }

  const item = items[currentIdx];
  const score = results.filter(Boolean).length;
  return (
    <div style={{ padding: "0 16px 24px", maxWidth: 560, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, opacity: 0.6 }}>Soal {currentIdx + 1} / {items.length}</span>
          {streak > 1 && <span style={{ fontSize: 11, color: "#fbbf24", fontWeight: 700 }}>🔥{streak}</span>}
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#68d391" }}>✓ {score}<span style={{ color: "#fc8181", marginLeft: 10 }}>✗ {results.filter(r => !r).length}</span></div>
          <button onClick={() => setShowSettings(s => !s)} style={{ fontFamily: "inherit", padding: "5px 9px", fontSize: 11, borderRadius: 8, cursor: "pointer", background: showSettings ? "rgba(147,197,253,0.15)" : "rgba(255,255,255,0.06)", border: `1px solid ${showSettings ? "rgba(147,197,253,0.4)" : "rgba(255,255,255,0.1)"}`, color: showSettings ? "#93c5fd" : "#475569" }}>⚙</button>
        </div>
      </div>
      {showSettings && (
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "12px 14px", marginBottom: 10 }}>
          <div style={{ fontSize: 10, color: "#475569", letterSpacing: 1.5, marginBottom: 10 }}>TAMPILKAN SEBELUM JAWAB</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 11, color: "#64748b" }}>Furigana</span>
            <button onClick={() => setShowFuri(v => !v)} style={{ fontFamily: "inherit", padding: "4px 12px", fontSize: 11, borderRadius: 7, cursor: "pointer", fontWeight: 700, background: showFuri ? "rgba(147,197,253,0.15)" : "rgba(255,255,255,0.05)", border: `1px solid ${showFuri ? "rgba(147,197,253,0.4)" : "rgba(255,255,255,0.08)"}`, color: showFuri ? "#93c5fd" : "#64748b" }}>{showFuri ? "ON" : "OFF"}</button>
            <span style={{ fontSize: 10, color: "#475569" }}>🇮🇩 muncul setelah jawab</span>
          </div>
        </div>
      )}
      <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden", marginBottom: 14 }}>
        <div style={{ height: "100%", width: `${(currentIdx / items.length) * 100}%`, background: "linear-gradient(90deg, #ed8936, #c05621)", transition: "width 0.3s" }} />
      </div>
      <div style={{ background: "linear-gradient(135deg, rgba(237,137,54,0.2), rgba(192,86,33,0.15))", borderRadius: 20, padding: "20px 18px", border: "2px solid rgba(237,137,54,0.45)", marginBottom: 14 }}>
        <div style={{ fontSize: 10, opacity: 0.5, textTransform: "uppercase", letterSpacing: 2, marginBottom: 8 }}>⚠ Pasangan Jebak</div>
        <div style={{ fontSize: 20, fontFamily: "'Zen Kaku Gothic New', 'Noto Sans JP', sans-serif", fontWeight: 700, lineHeight: 1.4 }}>{item.term}</div>
        {((showFuri && item.furi) || (selected !== null && item.furi)) && (
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.10)", marginTop: 8, paddingTop: 8 }}>
            {(showFuri || selected !== null) && item.furi && (
              <div style={{ fontSize: 13, color: "#93c5fd", opacity: 0.85, fontFamily: "'Noto Sans JP', sans-serif" }}>{item.furi}</div>
            )}
          </div>
        )}
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
            <button key={idx} onClick={() => handleSelect(idx)} style={{ fontFamily: "inherit", padding: "13px 16px", fontSize: 13, borderRadius: 14, background: bg, border, color, cursor: selected !== null ? "default" : "pointer", textAlign: "left", lineHeight: 1.5, display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ width: 26, height: 26, borderRadius: "50%", flexShrink: 0, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, border: "1px solid rgba(255,255,255,0.15)" }}>
                {selected !== null ? (opt.correct ? "✓" : idx === selected ? "✗" : idx + 1) : idx + 1}
              </span>
              {opt.text}
            </button>
          );
        })}
      </div>
      {selected !== null && (
        <>
          <div style={{ background: opts[selected]?.correct ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)", border: `1px solid ${opts[selected]?.correct ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`, borderRadius: 14, padding: "14px 16px", marginBottom: 12 }}>
            {opts[selected]?.correct ? (
              <div style={{ fontSize: 13, fontWeight: 700, color: "#4ade80" }}>✓ Benar!</div>
            ) : (
              <>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#fca5a5", marginBottom: 6 }}>✗ Salah — jawaban yang benar:</div>
                <div style={{ fontSize: 13, color: "#86efac", fontWeight: 600, marginBottom: 6 }}>{opts.find(o => o.correct)?.text}</div>
                <div style={{ fontSize: 11, opacity: 0.65, color: "#fca5a5" }}>Trap yang kamu pilih: {opts[selected]?.text}</div>
              </>
            )}
          </div>
          <button onClick={handleNext} style={{ width: "100%", padding: "14px", fontSize: 15, fontWeight: 700, borderRadius: 14, background: "linear-gradient(135deg, #ed8936, #c05621)", border: "none", color: "#fff", cursor: "pointer", fontFamily: "inherit" }}>
            {currentIdx < items.length - 1 ? "Soal berikutnya →" : "Lihat hasil 🏁"}
          </button>
        </>
      )}
    </div>
  );
}

export default DangerMode;
