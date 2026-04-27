// ─── WaygroundMode + WaygroundQuizMode ──────────────────────────────────────
// Technical quiz sets from Wayground/sensei with set picker and quiz engine.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import { shuffle } from "../utils/shuffle.js";
import { extractReadings, stripFuri } from "../utils/jp-helpers.js";
import { getWrongCount, makeWrongEntry, loadFromStorage, saveToStorage, STORAGE_KEYS } from "../utils/wrong-tracker.js";
import { CARDS } from "../data/cards.js";

function WaygroundMode({ sets }) {
  const [activeSet, setActiveSet] = useState(null);

  if (activeSet) {
    return <WaygroundQuizMode set={activeSet} onBack={() => setActiveSet(null)} />;
  }

  const teoriSets   = sets.filter(s => s.title.includes("Teori"));
  const praktikSets = sets.filter(s => s.title.includes("Praktik"));
  const vocabSets   = sets.filter(s => s.title.includes("Vocab") && !s.title.includes("Teori"));
  const totalSoal   = sets.reduce((a, s) => a + s.questions.length, 0);

  // Detect question type from subtitle → small badge
  const getQType = (subtitle) => {
    if (subtitle.includes("穴埋め"))   return { label: "穴埋め", col: "#fbbf24" };
    if (subtitle.includes("応用"))     return { label: "応用",   col: "#f472b6" };
    if (subtitle.includes("施工"))     return { label: "施工",   col: "#34d399" };
    if (subtitle.includes("実技"))     return { label: "実技",   col: "#60a5fa" };
    if (subtitle.includes("ファイナル")) return { label: "総合",   col: "#ec4899" };
    if (subtitle.includes("基準法"))   return { label: "法令",   col: "#eab308" };
    if (subtitle.includes("業法"))     return { label: "法令",   col: "#22c55e" };
    if (subtitle.includes("管理"))     return { label: "管理",   col: "#818cf8" };
    if (subtitle.includes("資格"))     return { label: "資格",   col: "#a3e635" };
    if (subtitle.includes("職場"))     return { label: "職場",   col: "#e879f9" };
    if (subtitle.includes("リスク"))   return { label: "リスク", col: "#22d3ee" };
    return null;
  };

  // Extract topic chips from "A・B・C XXX問題" → ["A","B","C"]
  const getTopics = (subtitle) => {
    const first = subtitle.split(/\s/)[0];
    return first.includes("・") ? first.split("・").slice(0, 3) : [];
  };

  // Strip " · Nqs" from title since we badge it separately
  const cleanTitle = (t) => t.replace(/\s*·\s*\d+qs\s*$/, "").trim();

  const renderSet = (set) => {
    const qtype  = getQType(set.subtitle);
    const topics = getTopics(set.subtitle);
    const title  = cleanTitle(set.title);
    const n      = set.questions.length;

    return (
      <button key={set.id} onClick={() => setActiveSet(set)} style={{
        fontFamily: "inherit", width: "100%", marginBottom: 8,
        borderRadius: 14, cursor: "pointer", textAlign: "left",
        background: "rgba(255,255,255,0.05)", border: `1px solid ${set.color}28`,
        display: "flex", alignItems: "stretch", overflow: "hidden",
        transition: "border-color 0.15s, box-shadow 0.15s",
        boxShadow: `0 2px 10px rgba(0,0,0,0.22)`,
      }}>
        {/* coloured left stripe */}
        <div style={{ width: 4, background: `linear-gradient(180deg,${set.color},${set.color}88)`, flexShrink: 0 }} />

        {/* main content */}
        <div style={{ flex: 1, padding: "11px 13px", minWidth: 0 }}>
          {/* row 1: emoji + title + badges */}
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 5 }}>
            <span style={{ fontSize: 15, lineHeight: 1, flexShrink: 0 }}>{set.emoji}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0", flex: 1, minWidth: 0,
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</span>
            {/* type badge */}
            {qtype && (
              <span style={{ fontSize: 9, fontWeight: 700, color: qtype.col,
                background: `${qtype.col}18`, border: `1px solid ${qtype.col}40`,
                borderRadius: 5, padding: "2px 5px", letterSpacing: 0.3, flexShrink: 0 }}>
                {qtype.label}
              </span>
            )}
            {/* question count pill */}
            <span style={{ fontSize: 10, fontWeight: 800, color: set.color,
              background: `${set.color}18`, border: `1px solid ${set.color}45`,
              borderRadius: 20, padding: "2px 9px", flexShrink: 0, letterSpacing: 0.3 }}>
              {n}
            </span>
          </div>

          {/* row 2: subtitle */}
          <div style={{ fontSize: 10, color: "#475569", lineHeight: 1.4, marginBottom: topics.length ? 6 : 0,
            fontFamily: "'Noto Sans JP',sans-serif", whiteSpace: "nowrap",
            overflow: "hidden", textOverflow: "ellipsis" }}>
            {set.subtitle}
          </div>

          {/* row 3: topic chips (teknis sets only) */}
          {topics.length > 0 && (
            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
              {topics.map(t => (
                <span key={t} style={{ fontSize: 9, fontWeight: 600, color: set.color,
                  background: `${set.color}12`, border: `1px solid ${set.color}30`,
                  borderRadius: 4, padding: "2px 6px",
                  fontFamily: "'Noto Sans JP',sans-serif" }}>{t}</span>
              ))}
            </div>
          )}
        </div>

        {/* arrow */}
        <div style={{ display: "flex", alignItems: "center", paddingRight: 13, paddingLeft: 2,
          color: "#334155", fontSize: 18, flexShrink: 0 }}>›</div>
      </button>
    );
  };

  // Section divider with thin rule and count badge
  const SectionDivider = ({ icon, label, count, col }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
      <span style={{ fontSize: 13 }}>{icon}</span>
      <span style={{ fontSize: 10, fontWeight: 800, color: col, letterSpacing: 1.8,
        textTransform: "uppercase", whiteSpace: "nowrap" }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg,${col}30,transparent)` }} />
      <span style={{ fontSize: 10, color: "#334155", background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.09)", borderRadius: 20,
        padding: "2px 9px", fontWeight: 700 }}>{count} set</span>
    </div>
  );

  return (
    <div style={{ padding: "0 16px 24px", maxWidth: 560, margin: "0 auto" }}>

      {/* header */}
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: "#60a5fa",
          letterSpacing: 3, marginBottom: 6 }}>WAYGROUND QUIZ</div>
        <div style={{ display: "flex", justifyContent: "center", gap: 18 }}>
          <div style={{ fontSize: 11, color: "#475569" }}>
            <span style={{ color: "#cbd5e1", fontWeight: 700 }}>{sets.length}</span> set
          </div>
          <div style={{ width: 1, height: 12, background: "rgba(255,255,255,0.1)", alignSelf: "center" }} />
          <div style={{ fontSize: 11, color: "#475569" }}>
            <span style={{ color: "#cbd5e1", fontWeight: 700 }}>{totalSoal}</span> soal latihan
          </div>
        </div>
      </div>

      {teoriSets.length > 0 && (
        <>
          <SectionDivider icon="📋" label="Soal Teori" count={teoriSets.length} col="#f97316" />
          {teoriSets.map(renderSet)}
        </>
      )}

      {praktikSets.length > 0 && (
        <>
          <div style={{ height: 14 }} />
          <SectionDivider icon="🛠️" label="Soal Praktik" count={praktikSets.length} col="#4ade80" />
          {praktikSets.map(renderSet)}
        </>
      )}

      {vocabSets.length > 0 && (
        <>
          <div style={{ height: 14 }} />
          <SectionDivider icon="📖" label="Soal Kosakata" count={vocabSets.length} col="#60a5fa" />
          {vocabSets.map(renderSet)}
        </>
      )}

      {sets.length === 0 && (
        <div style={{ textAlign: "center", padding: "40px 16px", color: "#64748b" }}>
          Belum ada quiz set.
        </div>
      )}
    </div>
  );
}

// ─── WAYGROUND QUIZ MODE ──────────────────────────────────────────────────────
function WaygroundQuizMode({ set, onBack }) {
  const TOTAL = set.questions.length;
  const [qs, setQs]     = useState(() => shuffle(buildShuffledSet(set.questions)));
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showExp, setShowExp]   = useState(false);
  const [score, setScore]       = useState(0);
  const [done, setDone]         = useState(false);
  const [answers, setAnswers]   = useState([]);
  const [streak, setStreak]     = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [showFuri, setShowFuri] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showID, setShowID]     = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const q = qs[qIdx];

  // Per-question detection
  const qHasJP    = hasJapanese(q.q);
  const hintIsJP  = hasJapanese(q.hint);
  const qReadings = qHasJP ? extractReadings(q.q) : null;

  // Question card reveal logic
  const showFuriRow = qReadings && (showFuri || selected !== null);
  const showJPHint  = hintIsJP  && q.hint && (showHint || selected !== null);  // JP hints via 💡 toggle
  const showIDHint  = !hintIsJP && q.hint && (showHint || selected !== null);
  const showQDivider = showFuriRow || showJPHint || showIDHint;

  // Option helpers
  const optIsJP     = (opt) => hasJapanese(opt);
  const optMain     = (opt) => stripFuri(opt);
  const optReadings = (opt) => optIsJP(opt) ? extractReadings(opt) : null;
  // Show opts_id only when it adds info beyond the option text itself
  const optIdDiffers = (opt, idText) => {
    if (!idText) return false;
    const stripped = idText.replace(/\s*✓\s*$/, "").trim();
    return stripped !== optMain(opt).trim();
  };

  const pick = useCallback((i) => {
    if (selected !== null) return;
    setSelected(i);
    setShowExp(true);
    const correct = i === q.ans;
    const ns = correct ? streak + 1 : 0;
    setScore(v => correct ? v + 1 : v);
    setStreak(ns);
    setMaxStreak(v => Math.max(v, ns));
    setAnswers(a => [...a, { q, correct, pickedIdx: i }]);
  }, [selected, q, streak]);

  const next = useCallback(() => {
    if (qIdx + 1 >= TOTAL) { setDone(true); return; }
    setQIdx(v => v + 1);
    setSelected(null);
    setShowExp(false);
  }, [qIdx, TOTAL]);

  useEffect(() => {
    const handler = (e) => {
      const map = { "1": 0, "2": 1, "3": 2, "a": 0, "b": 1, "c": 2 };
      if (selected === null && map[e.key] !== undefined) pick(map[e.key]);
      else if (selected !== null && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); next(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selected, pick, next]);

  const restart = () => {
    setQs(shuffle(buildShuffledSet(set.questions)));
    setQIdx(0); setSelected(null); setShowExp(false);
    setScore(0); setDone(false); setAnswers([]);
    setStreak(0); setMaxStreak(0);
  };

  if (done) return <WaygroundResult score={score} total={TOTAL} answers={answers} maxStreak={maxStreak} onRestart={restart} onBack={onBack} />;

  const isCorrect = selected === q.ans;
  const pct = Math.round((qIdx / TOTAL) * 100);

  return (
    <div style={{ padding: "0 16px", maxWidth: 560, margin: "0 auto" }}>
      {/* header strip — set info only, toggles moved to ⚙ */}
      <div style={{ background: "rgba(29,78,216,0.15)", border: "1px solid rgba(96,165,250,0.2)", borderRadius: 16, padding: "12px 14px", marginBottom: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#93c5fd" }}>{set.emoji} {set.title}</div>
            <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>{set.subtitle}</div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={() => setShowSettings(s => !s)} style={{ fontFamily: "inherit", padding: "5px 9px", fontSize: 11, borderRadius: 8, cursor: "pointer", background: showSettings ? "rgba(147,197,253,0.15)" : "rgba(0,0,0,0.2)", border: `1px solid ${showSettings ? "rgba(147,197,253,0.4)" : "rgba(255,255,255,0.1)"}`, color: showSettings ? "#93c5fd" : "#475569" }}>⚙</button>
            <button onClick={onBack} style={{ fontFamily: "inherit", padding: "5px 10px", borderRadius: 8, fontSize: 11, fontWeight: 600, background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8", cursor: "pointer" }}>✕</button>
          </div>
        </div>
      </div>

      {/* settings panel */}
      {showSettings && (
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "12px 14px", marginBottom: 10 }}>
          <div style={{ fontSize: 10, color: "#475569", letterSpacing: 1.5, marginBottom: 10 }}>TAMPILKAN SEBELUM JAWAB</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {[
              { label: "Furigana", on: showFuri, set: setShowFuri, col: "#93c5fd", bg: "rgba(147,197,253,0.15)", bdr: "rgba(147,197,253,0.4)" },
              { label: "🇮🇩 Indonesia", on: showID, set: setShowID, col: "#4ade80", bg: "rgba(74,222,128,0.15)", bdr: "rgba(74,222,128,0.4)" },
              { label: "💡 Petunjuk", on: showHint, set: setShowHint, col: "#fbbf24", bg: "rgba(251,191,36,0.15)", bdr: "rgba(251,191,36,0.4)" },
            ].map(t => (
              <div key={t.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 11, color: "#64748b" }}>{t.label}</span>
                <button onClick={() => t.set(v => !v)} style={{ fontFamily: "inherit", padding: "4px 10px", fontSize: 11, borderRadius: 7, cursor: "pointer", fontWeight: 700, background: t.on ? t.bg : "rgba(255,255,255,0.05)", border: `1px solid ${t.on ? t.bdr : "rgba(255,255,255,0.08)"}`, color: t.on ? t.col : "#64748b" }}>{t.on ? "ON" : "OFF"}</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* progress */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontSize: 12, color: "#94a3b8" }}>Soal <span style={{ color: "#60a5fa", fontWeight: 700, fontSize: 14 }}>{qIdx + 1}</span> / {TOTAL}</span>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "#4ade80", fontWeight: 600 }}>✓ {score}</span>
          <span style={{ fontSize: 12, color: "#f87171", fontWeight: 600 }}>✗ {answers.filter(a => !a.correct).length}</span>
          {streak > 1 && <span style={{ fontSize: 12, color: "#fbbf24" }}>🔥{streak}</span>}
        </div>
      </div>
      <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 99, marginBottom: 14, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,#1d4ed8,#60a5fa)", borderRadius: 99, transition: "width 0.3s" }} />
      </div>

      {/* question card */}
      <div style={{ borderRadius: 20, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", padding: "20px 18px", marginBottom: 14 }}>
        <div style={{ fontSize: 15, color: "#e2e8f0", lineHeight: 1.9, fontFamily: "'Zen Kaku Gothic New','Noto Sans JP',sans-serif" }}>{stripFuri(q.q)}</div>
        {showQDivider && (
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.09)", marginTop: 10, paddingTop: 8 }}>
            {showFuriRow && (
              <div style={{ fontSize: 11, color: "#93c5fd", opacity: 0.85, lineHeight: 1.7 }}>{qReadings}</div>
            )}
            {showJPHint && (
              <div style={{ fontSize: 12, color: "#93c5fd", opacity: 0.7, fontFamily: "'Noto Sans JP',sans-serif", marginTop: showFuriRow ? 3 : 0 }}>あ {q.hint}</div>
            )}
            {showIDHint && (
              <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.6, fontStyle: "italic", marginTop: (showFuriRow || showJPHint) ? 3 : 0 }}>🇮🇩 {q.hint}</div>
            )}
          </div>
        )}
      </div>

      {/* options */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
        {q.opts.map((opt, i) => {
          let bg = "rgba(255,255,255,0.04)", border = "rgba(255,255,255,0.1)", color = "#cbd5e1", icon = null;
          if (selected !== null) {
            if (i === q.ans)         { bg = "rgba(34,197,94,0.12)"; border = "rgba(34,197,94,0.4)"; color = "#4ade80"; icon = "✓"; }
            else if (i === selected) { bg = "rgba(239,68,68,0.12)"; border = "rgba(239,68,68,0.4)"; color = "#f87171"; icon = "✗"; }
            else                     { bg = "rgba(0,0,0,0.15)"; border = "rgba(255,255,255,0.04)"; color = "#475569"; }
          }
          const readings = optReadings(opt);
          const idText = q.opts_id[i];
          const showOptFuri = readings && (showFuri || selected !== null);
          const showOptID   = optIsJP(opt) && (showID || selected !== null) && optIdDiffers(opt, idText);
          const subColor    = selected !== null ? (i === q.ans ? "#86efac" : "rgba(255,255,255,0.35)") : "#94a3b8";
          return (
            <button key={i} onClick={() => pick(i)} style={{ fontFamily: "inherit",
              width: "100%", padding: "13px 16px", borderRadius: 14,
              border: `1.5px solid ${border}`, background: bg, color,
              fontSize: 14, cursor: selected !== null ? "default" : "pointer",
              textAlign: "left", display: "flex", alignItems: "flex-start", gap: 12,
              transition: "all 0.15s", lineHeight: 1.6,
            }}>
              <span style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(0,0,0,0.2)", border: `1px solid ${border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0, color: icon ? (i === q.ans ? "#4ade80" : "#f87171") : "#64748b", marginTop: 2 }}>
                {icon || (i + 1)}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: "'Zen Kaku Gothic New','Noto Sans JP',sans-serif" }}>{optMain(opt)}</div>
                {(showOptFuri || showOptID) && (
                  <>
                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", margin: "5px 0 4px" }} />
                    {showOptFuri && <div style={{ fontSize: 11, color: subColor, opacity: 0.85 }}>{readings}</div>}
                    {showOptID   && <div style={{ fontSize: 11, color: subColor, opacity: 0.85, marginTop: showOptFuri ? 2 : 0 }}>🇮🇩 {idText.replace(/\s*✓\s*$/, "")}</div>}
                  </>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* explanation */}
      {showExp && (
        <div style={{ borderRadius: 14, background: isCorrect ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)", border: `1px solid ${isCorrect ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)"}`, padding: "14px 16px", marginBottom: 14, lineHeight: 1.8 }}>
          <div style={{ fontSize: 12, color: isCorrect ? "#4ade80" : "#f87171", fontWeight: 700, marginBottom: 6 }}>
            {isCorrect ? "✓ Benar!" : `✗ Salah — Jawaban: ${q.ans + 1}) ${optMain(q.opts[q.ans])}`}
          </div>
          <div style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.7 }}>📖 {q.exp}</div>
        </div>
      )}

      {selected !== null && (
        <button onClick={next} style={{ width: "100%", padding: "15px 0", borderRadius: 14, border: "none", background: "linear-gradient(135deg,#1d4ed8,#0369a1)", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 16px rgba(29,78,216,0.3)" }}>
          {qIdx + 1 >= TOTAL ? "🏁 Lihat Hasil" : "Soal berikutnya →"}
        </button>
      )}
      {selected === null && <div style={{ marginTop: 8, fontSize: 10, color: "#64748b", textAlign: "center" }}>Ketuk opsi untuk menjawab</div>}
    </div>
  );
}

// ─── WAYGROUND RESULT ─────────────────────────────────────────────────────────
function WaygroundResult({ score, total, answers, maxStreak, onRestart, onBack }) {
  const pct = Math.round((score / total) * 100);
  const grade = pct >= 90 ? { label: "完璧！", col: "#fbbf24", emoji: "🏆" }
              : pct >= 70 ? { label: "いいね！", col: "#4ade80", emoji: "✨" }
              : pct >= 50 ? { label: "もう少し", col: "#60a5fa", emoji: "📚" }
              : { label: "がんばれ！", col: "#f87171", emoji: "💪" };

  return (
    <div style={{ padding: "0 16px", maxWidth: 560, margin: "0 auto" }}>
      <div style={{ borderRadius: 22, background: "rgba(255,255,255,0.06)", border: `1px solid ${grade.col}30`, padding: "28px 22px", textAlign: "center", marginBottom: 18, boxShadow: `0 8px 32px ${grade.col}10` }}>
        <div style={{ fontSize: 40, marginBottom: 8 }}>{grade.emoji}</div>
        <div style={{ fontSize: 11, color: "#475569", letterSpacing: 2, marginBottom: 6 }}>HASIL WAYGROUND QUIZ</div>
        <div style={{ fontSize: 32, fontWeight: 900, color: grade.col, marginBottom: 4 }}>{score} / {total}</div>
        <div style={{ fontSize: 13, color: "#94a3b8" }}>{pct}% · {grade.label}</div>
        {maxStreak > 1 && <div style={{ marginTop: 10, fontSize: 12, color: "#fbbf2480" }}>🔥 streak terpanjang: {maxStreak}</div>}
        <div style={{ height: 4, background: "rgba(0,0,0,0.3)", borderRadius: 99, margin: "18px 0 0", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg,${grade.col}80,${grade.col})`, borderRadius: 99, transition: "width 0.6s ease" }} />
        </div>
      </div>

      <div style={{ fontSize: 10, color: "#64748b", marginBottom: 8, letterSpacing: 1.5 }}>REVIEW JAWABAN</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
        {answers.map((a, i) => (
          <div key={i} style={{ borderRadius: 16, background: a.correct ? "rgba(34,197,94,0.06)" : "rgba(239,68,68,0.07)", border: `1.5px solid ${a.correct ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)"}`, overflow: "hidden" }}>
            {/* Header */}
            <div style={{ padding: "10px 14px", background: a.correct ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)", display: "flex", alignItems: "center", gap: 8, borderBottom: `1px solid ${a.correct ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)"}` }}>
              <span style={{ fontSize: 16 }}>{a.correct ? "✓" : "✗"}</span>
              <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700 }}>Q{a.q.id}</span>
              <span style={{ fontSize: 12, color: a.correct ? "#4ade80" : "#f87171", fontWeight: 700 }}>
                {a.correct ? "Benar" : `Salah → ${a.q.ans + 1}) ${stripFuri(a.q.opts[a.q.ans])}`}
              </span>
            </div>
            {/* Body */}
            <div style={{ padding: "12px 14px" }}>
              <div style={{ fontSize: 12, color: "#94a3b8", fontStyle: "italic", lineHeight: 1.6, marginBottom: 10 }}>{hasJapanese(a.q.hint) ? `あ ${a.q.hint}` : `🇮🇩 ${a.q.hint}`}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {a.q.opts.map((opt, oi) => {
                  const isAns = oi === a.q.ans; const isPicked = oi === a.pickedIdx && !isAns;
                  return (
                    <div key={oi} style={{ fontSize: 12, padding: "6px 10px", borderRadius: 8, lineHeight: 1.5, display: "flex", gap: 6, alignItems: "flex-start",
                      background: isAns ? "rgba(74,222,128,0.1)" : isPicked ? "rgba(248,113,113,0.08)" : "transparent",
                      border: isAns ? "1px solid rgba(74,222,128,0.3)" : isPicked ? "1px solid rgba(248,113,113,0.2)" : "1px solid transparent",
                      color: isAns ? "#86efac" : isPicked ? "#fca5a5" : "#64748b"
                    }}>
                      <span style={{ fontWeight: 700, minWidth: 16, flexShrink: 0 }}>{oi + 1})</span>
                      <div>
                        <span style={{ fontFamily: "'Noto Sans JP',sans-serif" }}>{stripFuri(opt)}</span>
                        <span style={{ marginLeft: 6, fontSize: 11, opacity: 0.7 }}>— {a.q.opts_id[oi].replace(/\s*✓\s*$/, "")}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.7, marginTop: 10, borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 10 }}>
                📖 {a.q.exp}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={onBack} style={{ flex: 1, padding: "14px 0", borderRadius: 14, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.06)", color: "#94a3b8", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>← Set</button>
        <button onClick={onRestart} style={{ flex: 2, padding: "14px 0", borderRadius: 14, border: "1.5px solid rgba(29,78,216,0.5)", background: "linear-gradient(135deg,#1d4ed8,#0369a1)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>🔄 Ulangi</button>
      </div>
    </div>
  );
}




export { WaygroundMode as default, WaygroundQuizMode };
