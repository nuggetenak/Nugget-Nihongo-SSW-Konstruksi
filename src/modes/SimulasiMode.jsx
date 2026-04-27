// ─── SimulasiMode ───────────────────────────────────────────────────────────
// Full exam simulation with timer, passing threshold, and result review.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback, useRef } from "react";
import { shuffle } from "../utils/shuffle.js";
import { extractReadings, stripFuri } from "../utils/jp-helpers.js";
import { JAC_OFFICIAL } from "../data/jac-official.js";

function SimulasiMode() {
  const WAKTU_PER_SOAL = 90;
  const PASS_THRESHOLD = 0.65;
  const [phase, setPhase] = useState("start");
  const [setChoice, setSetChoice] = useState("all"); // "all" | "set1" | "set2"
  const [soalList, setSoalList] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [records, setRecords] = useState([]);
  const [shuffledOpts, setShuffledOpts] = useState([]);
  const [timeLeft, setTimeLeft] = useState(WAKTU_PER_SOAL);
  const [simHistory, setSimHistory] = useState(null);

  const SET_CONFIG = {
    all:  { label: "Semua", sets: ["tt1","tt2","st1","st2"] },
    set1: { label: "Set 1 (Teori S1 + Praktik S1)", sets: ["tt1","st1"] },
    set2: { label: "Set 2 (Teori S2 + Praktik S2)", sets: ["tt2","st2"] },
  };

  const getSoalByChoice = (choice) =>
    JAC_OFFICIAL.filter(q => SET_CONFIG[choice].sets.includes(q.set));

  // PERSIST-04: Load simulasi history
  useEffect(() => {
    (async () => {
      try {
        const r = await window.storage.get("ssw-simulasi-history");
        if (r) setSimHistory(JSON.parse(r.value));
      } catch {}
    })();
  }, []);

  const startSimulasi = () => {
    const pool = getSoalByChoice(setChoice);
    const ordered = [...pool]; // urutan soal tetap, hanya opsi yang diacak per soal
    setSoalList(ordered);
    setCurrentIdx(0);
    setSelected(null);
    setRecords([]);
    setTimeLeft(WAKTU_PER_SOAL);
    setPhase("playing");
  };

  // Shuffle options when question changes
  useEffect(() => {
    if (phase !== "playing" || soalList.length === 0) return;
    const q = soalList[currentIdx];
    if (!q) return;
    const opts = q.options.map((text, i) => ({ text, origIdx: i + 1 }));
    const s = shuffle(opts);
    setShuffledOpts(s);
    setSelected(null);
    setTimeLeft(WAKTU_PER_SOAL);
  }, [currentIdx, soalList, phase]);

  // Timer countdown — stops immediately when an answer is selected
  useEffect(() => {
    if (phase !== "playing" || selected !== null) return;
    const id = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(id);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [currentIdx, phase, selected]);

  // Keyboard shortcuts: 1/2/3/4 pick + Enter/Space next
  useEffect(() => {
    if (phase !== "playing") return;
    const h = (e) => {
      const MAP = { "1": 0, "2": 1, "3": 2, "4": 3 };
      const k = e.key;
      if (selected === null && MAP[k] !== undefined && shuffledOpts[MAP[k]]) handleSelect(MAP[k]);
      else if (selected !== null && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); handleNext(); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [selected, phase, shuffledOpts]);

  // Auto-advance on timeout
  useEffect(() => {
    if (phase !== "playing" || timeLeft !== 0 || selected !== null) return;
    // Batch record + advance atomically to avoid race between setRecords and setCurrentIdx
    const newRec = { correct: false, timeout: true, timeUsed: WAKTU_PER_SOAL };
    setRecords(r => {
      const next = [...r, newRec];
      // Use functional update for currentIdx inside setRecords to guarantee ordering
      setTimeout(() => {
        setCurrentIdx(i => {
          if (i < soalList.length - 1) return i + 1;
          setPhase("result");
          return i;
        });
      }, 0);
      return next;
    });
  }, [timeLeft, phase, selected, soalList.length]);

  const handleSelect = (idx) => {
    if (selected !== null || phase !== "playing") return;
    setSelected(idx);
    const correct = shuffledOpts[idx]?.origIdx === soalList[currentIdx]?.answer;
    const timeUsed = WAKTU_PER_SOAL - timeLeft;
    setRecords(r => [...r, { correct, timeout: false, timeUsed }]);
  };

  const handleNext = () => {
    if (currentIdx < soalList.length - 1) {
      setSelected(null);
      setCurrentIdx(i => i + 1);
    } else {
      setPhase("result");
    }
  };

  // START SCREEN
  if (phase === "start") {
    const previewCount = getSoalByChoice(setChoice).length;
    return (
      <div style={{ padding: "16px", maxWidth: 560, margin: "0 auto" }}>
        <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 24, padding: "32px 24px", textAlign: "center", border: "1px solid rgba(229,62,62,0.3)" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎯</div>
          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 8 }}>Simulasi Ujian</div>
          <div style={{ fontSize: 13, opacity: 0.65, lineHeight: 1.7, marginBottom: 20 }}>
            Format ujian Prometric SSW No.1 Konstruksi
          </div>

          {/* Set selector */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, opacity: 0.45, textTransform: "uppercase", letterSpacing: 2, marginBottom: 10 }}>Pilih Set Soal</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { key: "all",  label: "Semua Soal",       sub: `tt1+tt2+st1+st2 · ${JAC_OFFICIAL.length} soal` },
                { key: "set1", label: "Set 1",             sub: `Teori S1 (29) + Praktik S1 (15) · 44 soal` },
                { key: "set2", label: "Set 2",             sub: `Teori S2 (36) + Praktik S2 (15) · 51 soal` },
              ].map(s => (
                <button key={s.key} onClick={() => setSetChoice(s.key)} style={{ fontFamily: "inherit",
                  padding: "11px 16px", borderRadius: 14, cursor: "pointer", textAlign: "left",
                  background: setChoice === s.key ? "rgba(229,62,62,0.2)" : "rgba(255,255,255,0.06)",
                  border: setChoice === s.key ? "2px solid rgba(229,62,62,0.7)" : "1px solid rgba(255,255,255,0.12)",
                  color: "#e2e8f0",
                  display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10,
                }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700 }}>{s.label}</div>
                    <div style={{ fontSize: 11, opacity: 0.55, marginTop: 2 }}>{s.sub}</div>
                  </div>
                  {setChoice === s.key && <div style={{ fontSize: 18, color: "#fc8181" }}>●</div>}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 20 }}>
            {[
              { label: "Total soal", value: `${previewCount}` },
              { label: "Waktu/soal", value: "90 dtk" },
              { label: "Lulus", value: "≥ 65%" },
            ].map(s => (
              <div key={s.label} style={{ background: "rgba(229,62,62,0.1)", border: "1px solid rgba(229,62,62,0.25)", borderRadius: 14, padding: "12px 8px" }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#fc8181" }}>{s.value}</div>
                <div style={{ fontSize: 10, opacity: 0.55, marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 12, opacity: 0.45, marginBottom: 20, lineHeight: 1.6 }}>
            • Hiragana tidak ditampilkan · opsi diacak<br />
            • Timer habis → otomatis lanjut (dihitung salah)
          </div>
          <button onClick={startSimulasi} style={{ padding: "14px 40px", fontSize: 16, fontWeight: 700, borderRadius: 16, background: "linear-gradient(135deg, #e53e3e, #c05621)", border: "none", color: "#fff", cursor: "pointer", width: "100%", fontFamily: "inherit" }}>
            ▶ Mulai Simulasi
          </button>
          {simHistory && (
            <div style={{ marginTop: 14, background: "rgba(229,62,62,0.08)", border: "1px solid rgba(229,62,62,0.2)", borderRadius: 14, padding: "10px 14px", textAlign: "left" }}>
              <div style={{ fontSize: 12, color: "#fc8181", fontWeight: 700 }}>📊 Terakhir: {simHistory.lastPct}% ({simHistory.lastSet}) · {simHistory.lastDate}</div>
              {simHistory.bestPct !== simHistory.lastPct && <div style={{ fontSize: 11, opacity: 0.6, marginTop: 2 }}>Best: {simHistory.bestPct}%</div>}
            </div>
          )}
        </div>
      </div>
    );
  }

  // RESULT SCREEN
  if (phase === "result") {
    const score = records.filter(r => r.correct).length;
    const timeouts = records.filter(r => r.timeout).length;
    const total = soalList.length;
    const acc = Math.round((score / total) * 100);
    const lulus = acc >= Math.round(PASS_THRESHOLD * 100);
    const avgTime = records.filter(r => !r.timeout).length > 0
      ? Math.round(records.filter(r => !r.timeout).reduce((s, r) => s + r.timeUsed, 0) / records.filter(r => !r.timeout).length)
      : WAKTU_PER_SOAL;
    const wrongSoal = soalList.reduce((acc, q, i) => { if (!records[i]?.correct) acc.push({ q, rec: records[i] }); return acc; }, []);

    // PERSIST-04: save history
    const newHistory = {
      lastScore: score, lastTotal: total, lastPct: acc,
      lastDate: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
      lastSet: SET_CONFIG[setChoice]?.label || setChoice,
      passed: lulus,
      bestPct: simHistory ? Math.max(simHistory.bestPct || 0, acc) : acc,
    };
    // Always persist; update React state only when displayed values change (prevents re-render loop)
    window.storage.set("ssw-simulasi-history", JSON.stringify(newHistory)).catch(() => {});
    if (!simHistory || simHistory.lastPct !== acc || simHistory.bestPct !== newHistory.bestPct) {
      setSimHistory(newHistory);
    }

    return (
      <div style={{ padding: "16px", maxWidth: 560, margin: "0 auto" }}>
        {/* Score panel */}
        <div style={{ borderRadius: 22, background: "rgba(255,255,255,0.06)", border: `1px solid ${lulus ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`, padding: "28px 22px", textAlign: "center", marginBottom: 18, boxShadow: `0 8px 32px ${lulus ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)"}` }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>{lulus ? "✅" : "💪"}</div>
          <div style={{ fontSize: 11, color: "#475569", letterSpacing: 2, marginBottom: 6 }}>SIMULASI UJIAN</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: lulus ? "#86efac" : "#fc8181", marginBottom: 4 }}>{lulus ? "LULUS" : "Perlu latihan lagi"}</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: lulus ? "#4ade80" : "#f87171", marginBottom: 4 }}>{score} / {total}</div>
          <div style={{ fontSize: 13, color: "#94a3b8" }}>{acc}%</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, margin: "16px 0" }}>
            {[
              { label: "Benar", value: score, color: "#4ade80" },
              { label: "Timeout", value: timeouts, color: "#fbbf24" },
              { label: "Rata-rata", value: `${avgTime}s`, color: "#60a5fa" },
            ].map(s => (
              <div key={s.label} style={{ background: "rgba(255,255,255,0.06)", borderRadius: 12, padding: "10px 6px" }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 10, color: "#64748b" }}>{s.label}</div>
              </div>
            ))}
          </div>
          <div style={{ height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 99, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${acc}%`, background: lulus ? "linear-gradient(90deg,#4ade80,#38b2ac)" : "linear-gradient(90deg,#f6ad55,#fc8181)", borderRadius: 99 }} />
          </div>
          <div style={{ fontSize: 10, color: "#475569", marginTop: 6 }}>Threshold lulus: 65%</div>
        </div>
        {/* Review section - OUTSIDE score panel */}
        {wrongSoal.length > 0 && (
          <>
            <div style={{ fontSize: 10, color: "#64748b", letterSpacing: 1.5, marginBottom: 8 }}>SOAL SALAH / TIMEOUT ({wrongSoal.length})</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
              {wrongSoal.map(({ q, rec }) => {
                const isTimeout = rec?.timeout;
                const borderCol = isTimeout ? "rgba(251,191,36,0.3)" : "rgba(239,68,68,0.25)";
                const bgCol = isTimeout ? "rgba(251,191,36,0.07)" : "rgba(239,68,68,0.07)";
                const headerBg = isTimeout ? "rgba(251,191,36,0.08)" : "rgba(239,68,68,0.08)";
                return (
                  <div key={q.id} style={{ borderRadius: 16, background: bgCol, border: `1.5px solid ${borderCol}`, overflow: "hidden" }}>
                    <div style={{ padding: "8px 14px", background: headerBg, borderBottom: `1px solid ${borderCol}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 10, color: "#94a3b8" }}>{q.setLabel}</span>
                      {isTimeout && <span style={{ fontSize: 10, color: "#fbbf24", fontWeight: 700 }}>⏱ Timeout</span>}
                    </div>
                    <div style={{ padding: "12px 14px" }}>
                      <div style={{ fontSize: 13, color: "#e2e8f0", lineHeight: 1.6, marginBottom: 6 }}>{q.id_text}</div>
                      <div style={{ fontSize: 12, color: "#86efac", padding: "6px 10px", borderRadius: 8, background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.25)", lineHeight: 1.5 }}>✓ {q.options[q.answer - 1]}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
        <button onClick={() => setPhase("start")} style={{ fontFamily: "inherit", width: "100%", padding: "14px", fontSize: 15, fontWeight: 700, borderRadius: 14, background: "linear-gradient(135deg, #e53e3e, #c05621)", border: "none", color: "#fff", cursor: "pointer" }}>
          🔄 Coba Lagi / Ganti Set
        </button>
      </div>
    );
  }

  // PLAYING
  const q = soalList[currentIdx];
  if (!q || shuffledOpts.length === 0) return null;
  const score = records.filter(r => r.correct).length;
  const timerPct = (timeLeft / WAKTU_PER_SOAL) * 100;
  const timerColor = timeLeft > 30 ? "#68d391" : timeLeft > 10 ? "#f6ad55" : "#fc8181";

  return (
    <div style={{ padding: "0 16px 24px", maxWidth: 560, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, opacity: 0.6 }}>Soal {currentIdx + 1} / {soalList.length}</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: timerColor }}>{timeLeft}s</span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#68d391" }}>✓ {score}</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#fc8181" }}>✗ {records.filter(r => !r.correct).length}</span>
          <button onClick={() => setPhase("start")} style={{ fontSize: 11, padding: "4px 8px", borderRadius: 8, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", color: "#94a3b8", cursor: "pointer", fontFamily: "inherit" }}>✕</button>
        </div>
      </div>
      {/* Progress bar */}
      <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden", marginBottom: 6 }}>
        <div style={{ height: "100%", width: `${(currentIdx / soalList.length) * 100}%`, background: "linear-gradient(90deg, #e53e3e, #c05621)", transition: "width 0.3s" }} />
      </div>
      {/* Timer bar */}
      <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden", marginBottom: 14 }}>
        <div style={{ height: "100%", width: `${timerPct}%`, background: timerColor, transition: "width 1s linear", borderRadius: 99 }} />
      </div>
      {/* Question */}
      <div style={{ background: "linear-gradient(135deg, rgba(229,62,62,0.2), rgba(192,86,33,0.15))", borderRadius: 20, padding: "18px", border: "2px solid rgba(229,62,62,0.4)", marginBottom: 14 }}>
        {q.hasPhoto && (
          <div style={{ background: "rgba(246,211,101,0.15)", border: "1px solid rgba(246,211,101,0.35)", borderRadius: 10, padding: "8px 12px", marginBottom: 12, fontSize: 12, lineHeight: 1.5, color: "#fbd38d" }}>{q.photoDesc}</div>
        )}
        <div style={{ fontSize: 14, lineHeight: 1.7, fontFamily: "'Noto Sans JP', sans-serif" }}>{q.jp}</div>
        {selected !== null && (q.hiragana || q.id_text) && (
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.10)", marginTop: 10, paddingTop: 8 }}>
            {q.hiragana && (
              <div style={{ fontSize: 12, lineHeight: 1.65, fontFamily: "'Noto Sans JP', sans-serif", color: "#93c5fd", opacity: 0.85, marginBottom: 4 }}>
                {q.hiragana}
              </div>
            )}
            {q.id_text && (
              <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.5 }}>
                🇮🇩 {q.id_text}
              </div>
            )}
          </div>
        )}
      </div>
      {/* Options */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
        {shuffledOpts.map((opt, idx) => {
          const isCorrect = opt.origIdx === q.answer;
          const jpPart = opt.text.replace(/\s*[\(（][^\)）]*[\)）]/g, "").trim();
          // LAST non-Japanese paren content = Indonesian (future-proof)
          const allParens = [...opt.text.matchAll(/[\(（]([^\)）]+)[\)）]/g)].map(m => m[1]);
          const idPart = allParens.filter(p => !hasJapanese(p)).pop() || null;
          // Furigana from full-width （ふりがな）— null for current JAC ASCII-paren data
          const optFuri = extractReadings(opt.text);
          let bg = "rgba(255,255,255,0.07)", border = "1px solid rgba(255,255,255,0.12)", color = "#e2e8f0";
          if (selected !== null) {
            if (isCorrect) { bg = "rgba(34,197,94,0.2)"; border = "2px solid #22c55e"; color = "#86efac"; }
            else if (idx === selected) { bg = "rgba(239,68,68,0.2)"; border = "2px solid #ef4444"; color = "#fca5a5"; }
            else { bg = "rgba(255,255,255,0.03)"; color = "rgba(255,255,255,0.3)"; }
          }
          const idColor = isCorrect ? "#86efac" : idx === selected ? "#fca5a5" : "rgba(255,255,255,0.35)";
          return (
            <button key={idx} onClick={() => handleSelect(idx)} style={{ fontFamily: "inherit", padding: "13px 16px", fontSize: 13, borderRadius: 14, background: bg, border, color, cursor: selected !== null ? "default" : "pointer", textAlign: "left", lineHeight: 1.5, display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ width: 26, height: 26, borderRadius: "50%", flexShrink: 0, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, border: "1px solid rgba(255,255,255,0.15)", marginTop: 1 }}>
                {selected !== null ? (isCorrect ? "✓" : idx === selected ? "✗" : idx + 1) : idx + 1}
              </span>
              <div style={{ flex: 1 }}>
                <div>{jpPart}</div>
                {selected !== null && optFuri && (
                  <>
                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", margin: "5px 0 4px" }} />
                    <div style={{ fontSize: 11, color: "#93c5fd", opacity: 0.75 }}>{optFuri}</div>
                  </>
                )}
                {selected !== null && idPart && (
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
          <div style={{ background: shuffledOpts[selected]?.origIdx === q.answer ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)", border: `1px solid ${shuffledOpts[selected]?.origIdx === q.answer ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`, borderRadius: 14, padding: "12px 14px", marginBottom: 12 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: shuffledOpts[selected]?.origIdx === q.answer ? "#4ade80" : "#f87171" }}>
              {shuffledOpts[selected]?.origIdx === q.answer ? "✓ Benar!" : `✗ Salah — jawaban: ${q.options[q.answer - 1]}`}
            </div>
            {q.explanation && <div style={{ fontSize: 12, color: "#cbd5e0", lineHeight: 1.65, marginTop: 6 }}>{q.explanation}</div>}
          </div>
          <button onClick={handleNext} style={{ fontFamily: "inherit", width: "100%", padding: "14px", fontSize: 15, fontWeight: 700, borderRadius: 14, background: "linear-gradient(135deg, #e53e3e, #c05621)", border: "none", color: "#fff", cursor: "pointer" }}>
            {currentIdx < soalList.length - 1 ? "Soal berikutnya →" : "Lihat hasil 🏁"}
          </button>
        </>
      )}
    </div>
  );
}

// ─── P9: STATS DASHBOARD ─────────────────────────────────────────────────────
// ─── P13: EXPORT / IMPORT PROGRESS ──────────────────────────────────────────
const STORAGE_KEYS = ["ssw-progress", "ssw-wrong-counts", "ssw-quiz-wrong", "ssw-last-mode", "ssw-starred", "ssw-simulasi-history"];

function ExportImportPanel() {
  const [status, setStatus] = useState(null); // {type: "ok"|"err", msg}
  const [importing, setImporting] = useState(false);

  const handleExport = async () => {
    try {
      const bundle = { _version: "v87", _exported: new Date().toISOString() };
      for (const key of STORAGE_KEYS) {
        try { const r = await window.storage.get(key); bundle[key] = r ? r.value : null; } catch { bundle[key] = null; }
      }
      const json = JSON.stringify(bundle, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ssw-progress-${new Date().toISOString().slice(0,10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setStatus({ type: "ok", msg: "✅ Progress berhasil diekspor!" });
    } catch (e) {
      setStatus({ type: "err", msg: "❌ Ekspor gagal: " + e.message });
    }
    setTimeout(() => setStatus(null), 3500);
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const bundle = JSON.parse(ev.target.result);
        let restored = 0;
        for (const key of STORAGE_KEYS) {
          if (bundle[key] != null) {
            await window.storage.set(key, bundle[key]);
            restored++;
          }
        }
        setStatus({ type: "ok", msg: `✅ ${restored} kunci progress dipulihkan! Muat ulang app untuk melihat hasilnya.` });
      } catch (e) {
        setStatus({ type: "err", msg: "❌ Import gagal: file tidak valid atau corrupt." });
      }
      setImporting(false);
      setTimeout(() => setStatus(null), 5000);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div style={{ marginTop: 20, background: "rgba(255,255,255,0.04)", borderRadius: 20, padding: "18px 16px", border: "1px solid rgba(255,255,255,0.08)" }}>
      <div style={{ fontSize: 11, opacity: 0.4, textTransform: "uppercase", letterSpacing: 2, marginBottom: 14 }}>💾 Backup &amp; Restore Progress</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <button onClick={handleExport} style={{ fontFamily: "inherit",
          padding: "12px 8px", fontSize: 12, fontWeight: 700, borderRadius: 14,
          background: "linear-gradient(135deg, #38b2ac, #2c7a7b)", border: "none",
          color: "#fff", cursor: "pointer",
        }}>
          📤 Export JSON
        </button>
        <label style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "12px 8px", fontSize: 12, fontWeight: 700, borderRadius: 14,
          background: importing ? "rgba(255,255,255,0.06)" : "linear-gradient(135deg, #667eea, #764ba2)",
          border: "none", color: "#fff", cursor: "pointer",
        }}>
          📥 Import JSON
          <input type="file" accept=".json" onChange={handleImport} style={{ display: "none" }} disabled={importing} />
        </label>
      </div>
      {status && (
        <div style={{
          marginTop: 12, padding: "10px 14px", borderRadius: 10, fontSize: 12, lineHeight: 1.5,
          background: status.type === "ok" ? "rgba(56,178,172,0.15)" : "rgba(239,68,68,0.15)",
          border: `1px solid ${status.type === "ok" ? "rgba(56,178,172,0.35)" : "rgba(239,68,68,0.35)"}`,
          color: status.type === "ok" ? "#81e6d9" : "#fc8181",
        }}>
          {status.msg}
        </div>
      )}
      <div style={{ fontSize: 11, opacity: 0.4, marginTop: 10, lineHeight: 1.6 }}>
        Export menyimpan semua progress kartu, data salah JAC &amp; Kuis, dan mode terakhir ke file JSON.
        Import memulihkan dari file tersebut — berguna saat pindah device atau buat artifact baru.
      </div>
    </div>
  );
}


export default SimulasiMode;
