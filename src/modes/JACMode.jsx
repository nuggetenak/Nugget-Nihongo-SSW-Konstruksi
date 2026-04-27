// ─── JACMode ────────────────────────────────────────────────────────────────
// Official JAC exam questions with set filtering, wrong-answer tracking, and review.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import { shuffle } from "../utils/shuffle.js";
import { getWrongCount, makeWrongEntry, loadFromStorage, saveToStorage, STORAGE_KEYS } from "../utils/wrong-tracker.js";
import { extractReadings, stripFuri } from "../utils/jp-helpers.js";
import { JAC_OFFICIAL } from "../data/jac-official.js";

function JACMode() {
  const [setFilter, setSetFilter] = useState("all");
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [results, setResults] = useState([]);
  const [phase, setPhase] = useState("playing");
  const [wrongCounts, setWrongCounts] = useState({});
  const [storageReady, setStorageReady] = useState(false);
  const [shuffledOptions, setShuffledOptions] = useState([]); // P2
  const [showHiragana, setShowHiragana] = useState(false);   // P3 — default OFF
  const [showID, setShowID] = useState(false);                // toggle terjemahan Indonesia — default OFF
  const [showSettings, setShowSettings] = useState(false);    // settings panel toggle

  // ── Load wrong counts from storage on mount ──
  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get("ssw-wrong-counts");
        if (res) setWrongCounts(JSON.parse(res.value));
      } catch {}
      setStorageReady(true);
    })();
  }, []);

  // ── Save a wrong answer increment ──
  const recordWrong = async (qId) => {
    const next = { ...wrongCounts, [qId]: makeWrongEntry(wrongCounts[qId]) };
    setWrongCounts(next);
    try { await window.storage.set("ssw-wrong-counts", JSON.stringify(next)); } catch {}
  };

  const [sessionQ, setSessionQ] = useState([]);

  const liveFilteredQ = (() => {
    let base = setFilter === "all" ? JAC_OFFICIAL
      : setFilter === "lemah" ? [...JAC_OFFICIAL].sort((a, b) => getWrongCount(wrongCounts[b.id]) - getWrongCount(wrongCounts[a.id])).filter(q => getWrongCount(wrongCounts[q.id]) > 0)
      : JAC_OFFICIAL.filter(q => q.set === setFilter);
    return base;
  })();

  const [pickedAnswers, setPickedAnswers] = useState([]); // origIdx of picked option per question

  const startSession = useCallback((qList) => {
    setSessionQ(qList);
    setCurrentQ(0); setSelected(null); setResults([]); setPickedAnswers([]); setPhase("playing");
  }, []);

  useEffect(() => { if (storageReady) startSession(liveFilteredQ); }, [setFilter, storageReady]);

  const q = sessionQ[currentQ];
  const totalQ = sessionQ.length;
  const score = results.filter(Boolean).length;
  const lemahCount = JAC_OFFICIAL.filter(q => getWrongCount(wrongCounts[q.id]) > 0).length;

  const handleNext = useCallback(() => {
    if (currentQ < totalQ - 1) { setCurrentQ(i => i + 1); setSelected(null); }
    else setPhase("finished");
  }, [currentQ, totalQ]);

  // FEAT-01: keyboard Enter/Space = next after answering
  useEffect(() => {
    const h = (e) => {
      if (selected !== null && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        if (phase === "playing") handleNext();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [selected, phase, handleNext]);
  useEffect(() => {
    if (!storageReady) return;
    const q = sessionQ[currentQ];
    if (!q) return;
    const opts = q.options.map((text, i) => ({ text, origIdx: i + 1 }));
    // Fisher-Yates
    for (let i = opts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [opts[i], opts[j]] = [opts[j], opts[i]];
    }
    setShuffledOptions(opts);
    setSelected(null);
  }, [currentQ, setFilter, storageReady, sessionQ]);

  if (!storageReady) return <div style={{ textAlign: "center", padding: 40, opacity: 0.5, fontSize: 13 }}>Memuat data…</div>;
  if (liveFilteredQ.length === 0) return (
    <div style={{ textAlign: "center", padding: 40, opacity: 0.6, fontSize: 13 }}>
      {setFilter === "lemah" ? "Belum ada soal yang pernah salah. Kerjakan dulu beberapa soal! 💪" : "Tidak ada soal."}
    </div>
  );

  if (!q && phase === "playing") return <div style={{ textAlign: "center", padding: 40, opacity: 0.4, fontSize: 13 }}>Memuat soal…</div>;

  const handleSelect = async (idx) => {
    if (selected !== null) return;
    setSelected(idx);
    const correct = shuffledOptions[idx]?.origIdx === q.answer;
    setResults(r => [...r, correct]);
    setPickedAnswers(p => [...p, shuffledOptions[idx]?.origIdx]);
    if (!correct) await recordWrong(q.id);
  };

  if (phase === "finished") {
    const accuracy = Math.round((score / totalQ) * 100);
    const wrongQs = sessionQ.filter((_, i) => results[i] === false);
    const grade = accuracy >= 90 ? { emoji: "🏆", col: "#fbbf24" } : accuracy >= 70 ? { emoji: "✨", col: "#4ade80" } : accuracy >= 50 ? { emoji: "📚", col: "#60a5fa" } : { emoji: "💪", col: "#f87171" };
    return (
      <div style={{ padding: "16px", maxWidth: 560, margin: "0 auto" }}>
        <div style={{ borderRadius: 22, background: "rgba(255,255,255,0.06)", border: `1px solid ${grade.col}30`, padding: "28px 22px", textAlign: "center", marginBottom: 18, boxShadow: `0 8px 32px ${grade.col}10` }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>{grade.emoji}</div>
          <div style={{ fontSize: 11, color: "#475569", letterSpacing: 2, marginBottom: 6 }}>HASIL SOAL RESMI JAC</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: grade.col, marginBottom: 4 }}>{score} / {totalQ}</div>
          <div style={{ fontSize: 13, color: "#94a3b8" }}>{accuracy}% benar</div>
          <div style={{ height: 4, background: "rgba(0,0,0,0.3)", borderRadius: 99, margin: "18px 0 0", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${accuracy}%`, background: `linear-gradient(90deg,${grade.col}80,${grade.col})`, borderRadius: 99, transition: "width 0.6s ease" }} />
          </div>
        </div>
        <div style={{ fontSize: 10, color: "#64748b", letterSpacing: 1.5, marginBottom: 8 }}>REVIEW JAWABAN</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
          {sessionQ.map((wq, i) => {
            const correct = results[i] !== false;
            const correctLabel = wq.options[wq.answer - 1];
            const cnt = getWrongCount(wrongCounts[wq.id]);
            return (
              <div key={wq.id} style={{ borderRadius: 16, background: correct ? "rgba(34,197,94,0.06)" : "rgba(239,68,68,0.07)", border: `1.5px solid ${correct ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)"}`, overflow: "hidden" }}>
                <div style={{ padding: "10px 14px", background: correct ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)", display: "flex", alignItems: "center", gap: 8, borderBottom: `1px solid ${correct ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)"}` }}>
                  <span style={{ fontSize: 16 }}>{correct ? "✓" : "✗"}</span>
                  <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700 }}>{wq.setLabel}</span>
                  <span style={{ fontSize: 12, color: correct ? "#4ade80" : "#f87171", fontWeight: 700, flex: 1 }}>
                    {correct ? "Benar" : `Salah → ${correctLabel}`}
                  </span>
                  {!correct && cnt >= 2 && <span style={{ background: "rgba(239,68,68,0.3)", borderRadius: 8, padding: "2px 8px", fontSize: 11, color: "#fc8181", fontWeight: 700 }}>✗ {cnt}×</span>}
                </div>
                <div style={{ padding: "12px 14px" }}>
                  <div style={{ fontSize: 12, color: "#94a3b8", fontStyle: "italic", lineHeight: 1.6, marginBottom: 10, fontFamily: "'Noto Sans JP',sans-serif" }}>{wq.id_text || wq.jp}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {wq.options.map((opt, oi) => {
                      const isAns = oi + 1 === wq.answer;
                      const isPicked = !correct && oi + 1 === pickedAnswers[i] && !isAns;
                      return (
                        <div key={oi} style={{ fontSize: 12, padding: "6px 10px", borderRadius: 8, lineHeight: 1.5, display: "flex", gap: 6,
                          background: isAns ? "rgba(74,222,128,0.1)" : isPicked ? "rgba(248,113,113,0.08)" : "transparent",
                          border: isAns ? "1px solid rgba(74,222,128,0.3)" : isPicked ? "1px solid rgba(248,113,113,0.2)" : "1px solid transparent",
                          color: isAns ? "#86efac" : isPicked ? "#fca5a5" : "#64748b" }}>
                          <span style={{ fontWeight: 700, minWidth: 16, flexShrink: 0 }}>{oi + 1})</span>
                          <span style={{ fontFamily: "'Noto Sans JP',sans-serif" }}>{opt}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <button onClick={() => startSession(liveFilteredQ)} style={{ fontFamily: "inherit", width: "100%", padding: "14px", fontSize: 15, fontWeight: 700, borderRadius: 14, background: "linear-gradient(135deg, #667eea, #764ba2)", border: "none", color: "#fff", cursor: "pointer" }}>🔄 Ulangi</button>
      </div>
    );
  }

  return (
    <div style={{ padding: "0 16px 24px", maxWidth: 560, margin: "0 auto" }}>
      {/* ── Set filter ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginBottom: 14 }}>
        {[
          { key: "all",   label: `Semua`,    sub: `${JAC_OFFICIAL.length} soal` },
          { key: "tt1",   label: `学科 S1`,  sub: `29 soal` },
          { key: "tt2",   label: `学科 S2`,  sub: `36 soal` },
          { key: "st1",   label: `実技 S1`,  sub: `15 soal` },
          { key: "st2",   label: `実技 S2`,  sub: `15 soal` },
          { key: "lemah", label: `⚠ Lemah`,  sub: lemahCount > 0 ? `${lemahCount} soal` : `belum ada`, accent: lemahCount > 0 },
        ].map(f => (
          <button key={f.key} onClick={() => setSetFilter(f.key)} style={{ fontFamily: "inherit",
            padding: "10px 8px",
            fontSize: 12,
            fontWeight: setFilter === f.key ? 700 : 500,
            borderRadius: 10,
            cursor: "pointer",
            background: setFilter === f.key
              ? (f.accent ? "linear-gradient(135deg, #c05621, #9c4221)" : "linear-gradient(135deg, #667eea, #764ba2)")
              : f.accent ? "rgba(239,68,68,0.1)" : "rgba(255,255,255,0.07)",
            border: setFilter === f.key
              ? "1px solid transparent"
              : f.accent ? "1px solid rgba(239,68,68,0.3)" : "1px solid rgba(255,255,255,0.12)",
            color: setFilter === f.key ? "#fff" : f.accent ? "#fc8181" : "#a0aec0",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
            transition: "all 0.15s",
          }}>
            <span style={{ fontFamily: "'Noto Sans JP', sans-serif" }}>{f.label}</span>
            <span style={{ fontSize: 10, opacity: 0.6, fontWeight: 400 }}>{f.sub}</span>
          </button>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ fontSize: 12, opacity: 0.6 }}>Soal {currentQ + 1} / {totalQ} &nbsp;·&nbsp; <span style={{ opacity: 0.8 }}>{q.setLabel}</span></div>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#68d391" }}>✓ {score}<span style={{ color: "#fc8181", marginLeft: 10 }}>✗ {results.filter(r => !r).length}</span></div>
      </div>
      <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden", marginBottom: 14 }}>
        <div style={{ height: "100%", width: `${(currentQ / totalQ) * 100}%`, background: "linear-gradient(135deg, #667eea, #764ba2)", transition: "width 0.3s" }} />
      </div>

      {/* Question */}
      <div style={{ background: "linear-gradient(135deg, rgba(102,126,234,0.25), rgba(118,75,162,0.2))", borderRadius: 20, padding: "16px 20px", border: "2px solid rgba(102,126,234,0.4)", marginBottom: 14 }}>
        {/* Header: set label + settings */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", letterSpacing: 1.5, textTransform: "uppercase" }}>{q.setLabel}</div>
          <button onClick={() => setShowSettings(s => !s)} style={{ fontFamily: "inherit", padding: "5px 9px", fontSize: 11, borderRadius: 8, cursor: "pointer", background: showSettings ? "rgba(147,197,253,0.15)" : "rgba(255,255,255,0.06)", border: `1px solid ${showSettings ? "rgba(147,197,253,0.4)" : "rgba(255,255,255,0.1)"}`, color: showSettings ? "#93c5fd" : "#475569" }}>⚙</button>
        </div>
        {showSettings && (
          <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "12px 14px", marginBottom: 10 }}>
            <div style={{ fontSize: 10, color: "#475569", letterSpacing: 1.5, marginBottom: 10 }}>TAMPILKAN SEBELUM JAWAB</div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 11, color: "#64748b" }}>Hiragana</span>
                <button onClick={() => setShowHiragana(s => !s)} style={{ fontFamily: "inherit", padding: "4px 12px", fontSize: 11, borderRadius: 7, cursor: "pointer", fontWeight: 700, background: showHiragana ? "rgba(147,197,253,0.15)" : "rgba(255,255,255,0.05)", border: `1px solid ${showHiragana ? "rgba(147,197,253,0.4)" : "rgba(255,255,255,0.08)"}`, color: showHiragana ? "#93c5fd" : "#64748b" }}>{showHiragana ? "ON" : "OFF"}</button>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 11, color: "#64748b" }}>🇮🇩 Indonesia</span>
                <button onClick={() => setShowID(s => !s)} style={{ fontFamily: "inherit", padding: "4px 12px", fontSize: 11, borderRadius: 7, cursor: "pointer", fontWeight: 700, background: showID ? "rgba(74,222,128,0.15)" : "rgba(255,255,255,0.05)", border: `1px solid ${showID ? "rgba(74,222,128,0.4)" : "rgba(255,255,255,0.08)"}`, color: showID ? "#4ade80" : "#64748b" }}>{showID ? "ON" : "OFF"}</button>
              </div>
            </div>
          </div>
        )}
        {q.hasPhoto && (
          <div style={{ background: "rgba(246,211,101,0.15)", border: "1px solid rgba(246,211,101,0.35)", borderRadius: 10, padding: "8px 12px", marginBottom: 12, fontSize: 12, lineHeight: 1.5, color: "#fbd38d" }}>
            {q.photoDesc}
          </div>
        )}
        <div style={{ fontSize: 14, lineHeight: 1.75, fontFamily: "'Noto Sans JP', sans-serif", marginBottom: 6 }}>{q.jp}</div>
        {((q.hiragana && (showHiragana || selected !== null)) || ((showID || selected !== null) && q.id_text)) && (
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.10)", marginTop: 8, paddingTop: 8 }}>
            {q.hiragana && (showHiragana || selected !== null) && (
              <div style={{ fontSize: 12, lineHeight: 1.65, fontFamily: "'Noto Sans JP', sans-serif", color: "#93c5fd", opacity: 0.85, marginBottom: 4 }}>
                {q.hiragana}
              </div>
            )}
            {(showID || selected !== null) && q.id_text && (
              <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}>
                🇮🇩 {q.id_text}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Options */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
        {shuffledOptions.map((opt, idx) => {
          const isCorrect = opt.origIdx === q.answer;
          const jpPart = opt.text.replace(/\s*[\(（][^\)）]*[\)）]/g, "").trim();
          // Use LAST non-Japanese paren content as Indonesian (future-proof for when data adds furigana)
          const allParens = [...opt.text.matchAll(/[\(（]([^\)）]+)[\)）]/g)].map(m => m[1]);
          const idPart = allParens.filter(p => !hasJapanese(p)).pop() || null;
          // Furigana via full-width （ふりがな）— null for current ASCII-paren JAC data, ready for future data
          const optFuri = extractReadings(opt.text);
          let bg = "rgba(255,255,255,0.07)", border = "1px solid rgba(255,255,255,0.10)", color = "#e2e8f0";
          if (selected !== null) {
            if (isCorrect) { bg = "rgba(74,222,128,0.15)"; border = "2px solid #4ade80"; color = "#86efac"; }
            else if (idx === selected) { bg = "rgba(248,113,113,0.15)"; border = "2px solid #f87171"; color = "#fca5a5"; }
            else { bg = "rgba(255,255,255,0.02)"; color = "rgba(255,255,255,0.3)"; border = "1px solid rgba(255,255,255,0.06)"; }
          }
          const idColor = selected !== null ? (isCorrect ? "#86efac" : idx === selected ? "#fca5a5" : "rgba(255,255,255,0.35)") : "#94a3b8";
          return (
            <button key={idx} onClick={() => handleSelect(idx)} style={{ padding: "13px 14px", fontSize: 13, borderRadius: 14, background: bg, border, color, cursor: selected !== null ? "default" : "pointer", textAlign: "left", lineHeight: 1.5, display: "flex", gap: 10, alignItems: "flex-start", fontFamily: "'Noto Sans JP', sans-serif", transition: "all 0.15s" }}>
              <span style={{ width: 26, height: 26, borderRadius: "50%", flexShrink: 0, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, border: "1px solid rgba(255,255,255,0.1)", marginTop: 1 }}>
                {selected !== null ? (isCorrect ? "✓" : idx === selected ? "✗" : idx + 1) : idx + 1}
              </span>
              <div style={{ flex: 1 }}>
                <div>{jpPart}</div>
                {(showHiragana || selected !== null) && optFuri && (
                  <>
                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", margin: "5px 0 4px" }} />
                    <div style={{ fontSize: 11, color: "#93c5fd", opacity: 0.75 }}>{optFuri}</div>
                  </>
                )}
                {(showID || selected !== null) && idPart && (
                  <>
                    {!optFuri && <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", margin: "5px 0 4px" }} />}
                    <div style={{ fontSize: 11, color: idColor, opacity: 0.85 }}>🇮🇩 {idPart}</div>
                  </>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {selected !== null && (
        <>
          <div style={{ background: shuffledOptions[selected]?.origIdx === q.answer ? "rgba(74,222,128,0.08)" : "rgba(248,113,113,0.08)", border: `1px solid ${shuffledOptions[selected]?.origIdx === q.answer ? "rgba(74,222,128,0.25)" : "rgba(248,113,113,0.25)"}`, borderRadius: 14, padding: "14px 16px", marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 6, color: shuffledOptions[selected]?.origIdx === q.answer ? "#4ade80" : "#f87171" }}>
              {shuffledOptions[selected]?.origIdx === q.answer ? "✓ Benar!" : `✗ Salah — jawaban: ${q.options[q.answer - 1]}`}
            </div>
            {(showID || selected !== null) && (
              <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.55, marginBottom: 8, borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: 8 }}>
                🇮🇩 {q.id_text}
              </div>
            )}
            <div style={{ fontSize: 12, color: "#cbd5e0", lineHeight: 1.65 }}>{q.explanation}</div>
          </div>
          <button onClick={handleNext} style={{ fontFamily: "inherit", width: "100%", padding: "14px", fontSize: 15, fontWeight: 700, borderRadius: 14, background: "linear-gradient(135deg, #667eea, #764ba2)", border: "none", color: "#fff", cursor: "pointer" }}>
            {currentQ < totalQ - 1 ? "Soal berikutnya →" : "Lihat hasil 🏁"}
          </button>
        </>
      )}
    </div>
  );
}


export default JACMode;
