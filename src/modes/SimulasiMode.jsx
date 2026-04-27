import { useState, useMemo } from "react";
import { T } from "../styles/theme.js";
import { shuffle } from "../utils/shuffle.js";
import { stripFuri, extractReadings } from "../utils/jp-helpers.js";
import { JAC_OFFICIAL } from "../data/jac-official.js";
import QuizShell from "../components/QuizShell.jsx";

const PRESETS = [
  { key: "quick", label: "Quick (15 soal, 15 menit)", count: 15, time: 15 * 60 },
  { key: "half", label: "Half (25 soal, 25 menit)", count: 25, time: 25 * 60 },
  { key: "full", label: "Full (semua soal, 45 menit)", count: 0, time: 45 * 60 },
];

export default function SimulasiMode({ onExit }) {
  const [preset, setPreset] = useState("quick");
  const [started, setStarted] = useState(false);
  const [seed, setSeed] = useState(0);

  const config = PRESETS.find(p => p.key === preset) || PRESETS[0];

  const questions = useMemo(() => {
    if (!started) return [];
    const pool = shuffle(JAC_OFFICIAL);
    const items = config.count > 0 ? pool.slice(0, config.count) : pool;
    return items.map(q => ({
      question: q.jp,
      questionSub: q.id_text,
      options: q.options.map(opt => ({ text: opt, sub: null })),
      correctIdx: q.answer,
      explanation: q.explanation,
      hint: q.hasPhoto ? `📷 ${q.photoDesc || "Soal asli pakai foto"}` : null,
    }));
  }, [started, seed, config.count]);

  if (!started) {
    return (
      <div style={{ padding: "24px 16px", maxWidth: T.maxW, margin: "0 auto" }}>
        <button onClick={onExit} style={{ fontFamily: "inherit", fontSize: 12, color: T.textMuted, background: "none", border: "none", cursor: "pointer", marginBottom: 16 }}>← Kembali</button>
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>🎯 Simulasi Ujian</h2>
        <p style={{ fontSize: 13, color: T.textMuted, marginBottom: 20 }}>Latihan seperti ujian asli dengan timer. Passing: 65%</p>

        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: T.textDim, textTransform: "uppercase", marginBottom: 8 }}>Mode</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
          {PRESETS.map(p => (
            <button key={p.key} onClick={() => setPreset(p.key)} style={{
              fontFamily: "inherit", padding: "12px 14px", borderRadius: T.r.md, cursor: "pointer",
              background: preset === p.key ? "rgba(239,68,68,0.12)" : T.surface,
              border: `1px solid ${preset === p.key ? "rgba(239,68,68,0.4)" : T.border}`,
              color: preset === p.key ? "#ef4444" : T.text,
              textAlign: "left", fontSize: 13,
            }}>{p.label}</button>
          ))}
        </div>

        <button onClick={() => { setSeed(s => s + 1); setStarted(true); }} style={{
          width: "100%", padding: "14px", fontSize: 15, fontWeight: 700,
          fontFamily: "inherit", borderRadius: T.r.md,
          background: "linear-gradient(135deg, #7f1d1d, #dc2626)", border: "none",
          color: T.textBright, cursor: "pointer",
        }}>Mulai Simulasi 🎯</button>
      </div>
    );
  }

  return (
    <QuizShell
      questions={questions}
      onExit={() => setStarted(false)}
      title="Simulasi Ujian"
      timer={config.time}
      showHint={true}
      accentColor="#ef4444"
    />
  );
}
