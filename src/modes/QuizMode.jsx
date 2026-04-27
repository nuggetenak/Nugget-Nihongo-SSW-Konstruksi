// ─── QuizMode ───────────────────────────────────────────────────────────────
// Auto-generated quiz from flashcards with 3 difficulty levels, anti-repeat, and auto-next.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback, useRef } from "react";
import { shuffle } from "../utils/shuffle.js";
import { generateQuiz } from "../utils/quiz-generator.js";
import { getWrongCount, makeWrongEntry, loadFromStorage, saveToStorage, STORAGE_KEYS } from "../utils/wrong-tracker.js";
import { stripFuri } from "../utils/jp-helpers.js";
import { DescBlock } from "../components/JpDisplay.jsx";
import { CARDS } from "../data/cards.js";

function QuizMode({ cards, allCards }) {
  const [quizCount, setQuizCount]   = useState(10);
  const [autoNext,  setAutoNext]    = useState(true);
  const [autoDelay, setAutoDelay]   = useState(1500);
  const [showExp,   setShowExp]     = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [showHints, setShowHints]   = useState(false);
  const [questions,  setQuestions]  = useState([]);
  const [currentQ,   setCurrentQ]   = useState(0);
  const [selected,   setSelected]   = useState(null);
  const [results,    setResults]    = useState([]);
  const [answers,    setAnswers]    = useState([]);
  const [phase,      setPhase]      = useState("playing");
  const [streak,     setStreak]     = useState(0);
  const [maxStreak,  setMaxStreak]  = useState(0);
  const [autoCountdown, setAutoCountdown] = useState(0);
  const [quizWrong,  setQuizWrong]  = useState({});
  const [storageReady, setStorageReady] = useState(false);
  const [lemahMode,  setLemahMode]  = useState(false);
  const [difficulty, setDifficulty] = useState("medium"); // "easy" | "medium" | "hard"
  const autoTimerRef = useRef(null);
  const countdownRef = useRef(null);
  const seenPoolRef   = useRef(new Set()); // anti-repeat: tracks seen card IDs within this mount
  const quizWrongRef   = useRef({});            // stable ref for quizWrong (avoids startQuiz dep churn)

  const insufficientCards = !cards || cards.length < 2;

  useEffect(() => {
    (async () => {
      try { const r = await window.storage.get("ssw-quiz-wrong"); if (r) setQuizWrong(JSON.parse(r.value)); } catch {}
      setStorageReady(true);
    })();
  }, []);

  // Keep quizWrongRef in sync so startQuiz always sees fresh counts without re-creating the callback
  useEffect(() => { quizWrongRef.current = quizWrong; }, [quizWrong]);

  const recordQuizWrong = async (cardId) => {
    setQuizWrong(prev => {
      const next = { ...prev, [cardId]: makeWrongEntry(prev[cardId]) };
      window.storage.set("ssw-quiz-wrong", JSON.stringify(next)).catch(() => {});
      return next;
    });
  };

  const lemahCards = cards.filter(c => getWrongCount(quizWrong[c.id]) > 0)
    .sort((a, b) => getWrongCount(quizWrong[b.id]) - getWrongCount(quizWrong[a.id]));
  const activeCards = lemahMode && lemahCards.length > 0 ? lemahCards : cards;

  const startQuiz = useCallback((targetCards, count, forceReset = false) => {
    const n = Math.min(count !== undefined ? count : quizCount, targetCards.length);
    if (forceReset) seenPoolRef.current = new Set();
    // Anti-repeat: prefer cards not yet seen this session
    const seen = seenPoolRef.current;
    const unseen = targetCards.filter(c => !seen.has(c.id));
    let pick;
    if (unseen.length >= n) {
      pick = shuffle([...unseen]).slice(0, n);
    } else {
      // Pool exhausted: reset and prioritise weak cards (most wrong-count) for next round
      seenPoolRef.current = new Set();
      const withWrong = shuffle(targetCards.filter(c => getWrongCount(quizWrongRef.current[c.id]) > 0));
      const noWrong   = shuffle(targetCards.filter(c => getWrongCount(quizWrongRef.current[c.id]) === 0));
      pick = [...withWrong, ...noWrong].slice(0, n);
    }
    pick.forEach(c => seenPoolRef.current.add(c.id));
    const qs = generateQuiz(pick, allCards, difficulty, quizWrongRef.current);
    setQuestions(qs); setCurrentQ(0); setSelected(null); setResults([]); setAnswers([]);
    setPhase("playing"); setStreak(0); setMaxStreak(0);
  }, [allCards, quizCount, difficulty]);

  useEffect(() => { if (storageReady && !insufficientCards) startQuiz(activeCards); }, [storageReady, insufficientCards, startQuiz]);

  const totalQ = questions.length;

  const clearTimers = useCallback(() => {
    if (autoTimerRef.current) { clearTimeout(autoTimerRef.current); autoTimerRef.current = null; }
    if (countdownRef.current) { clearInterval(countdownRef.current); countdownRef.current = null; }
    setAutoCountdown(0);
  }, []);

  const handleNext = useCallback(() => {
    clearTimers();
    setCurrentQ(i => {
      if (i + 1 >= totalQ) { setPhase("finished"); return i; }
      setSelected(null);
      return i + 1;
    });
  }, [totalQ, clearTimers]);

  const handleSelect = useCallback(async (idx) => {
    if (selected !== null || !questions[currentQ]) return;
    const q = questions[currentQ];
    const correct = q.options[idx].correct;
    setSelected(idx);
    setStreak(s => { const ns = correct ? s + 1 : 0; setMaxStreak(m => Math.max(m, ns)); return ns; });
    setResults(r => [...r, correct]);
    setAnswers(a => [...a, { card: q.card, correct, picked: q.options[idx].text, answer: q.options.find(o => o.correct)?.text }]);
    if (!correct) await recordQuizWrong(q.card.id);
    if (autoNext) {
      setAutoCountdown(autoDelay);
      countdownRef.current = setInterval(() => setAutoCountdown(v => Math.max(0, v - 100)), 100);
      autoTimerRef.current = setTimeout(() => { clearInterval(countdownRef.current); countdownRef.current = null; setAutoCountdown(0); handleNext(); }, autoDelay);
    }
  }, [selected, questions, currentQ, autoNext, autoDelay, handleNext]);

  useEffect(() => {
    const h = (e) => {
      if (phase !== "playing") return;
      const MAP = { "1": 0, "2": 1, "3": 2, "4": 3, "a": 0, "b": 1, "c": 2, "d": 3 };
      const k = e.key.toLowerCase();
      if (selected === null && MAP[k] !== undefined && questions[currentQ]?.options[MAP[k]]) {
        handleSelect(MAP[k]);
      } else if (selected !== null && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault(); handleNext();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [selected, currentQ, phase, questions, handleSelect, handleNext]);

  if (insufficientCards) return (
    <div style={{ textAlign: "center", padding: "40px 16px", color: "#475569", maxWidth: 560, margin: "0 auto" }}>
      Butuh minimal 2 kartu untuk Kuis. Pilih kategori lain atau gunakan track Konsep.
    </div>
  );
  if (!storageReady || questions.length === 0) return <div style={{ textAlign: "center", padding: 40, opacity: 0.4, fontSize: 13 }}>Memuat…</div>;

  if (phase === "finished") {
    const score = results.filter(Boolean).length;
    const accuracy = Math.round((score / totalQ) * 100);
    const grade = accuracy >= 90 ? { emoji: "🏆", col: "#fbbf24" }
                : accuracy >= 70 ? { emoji: "✨", col: "#4ade80" }
                : accuracy >= 50 ? { emoji: "📚", col: "#60a5fa" }
                :                  { emoji: "💪", col: "#f87171" };
    const wrongOnes = answers.filter(a => !a.correct);
    return (
      <div style={{ padding: "0 16px 24px", maxWidth: 560, margin: "0 auto" }}>
        <div style={{ borderRadius: 22, background: "rgba(255,255,255,0.06)", border: `1px solid ${grade.col}30`, padding: "28px 22px", textAlign: "center", marginBottom: 18, boxShadow: `0 8px 32px ${grade.col}10` }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>{grade.emoji}</div>
          <div style={{ fontSize: 11, color: "#475569", letterSpacing: 2, marginBottom: 6 }}>HASIL KUIS</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: grade.col, marginBottom: 4 }}>{score} / {totalQ}</div>
          <div style={{ fontSize: 13, color: "#94a3b8" }}>{accuracy}% benar</div>
          {maxStreak > 2 && <div style={{ marginTop: 10, fontSize: 12, color: "#fbbf2480" }}>🔥 streak terpanjang: {maxStreak}</div>}
          <div style={{ height: 4, background: "rgba(0,0,0,0.3)", borderRadius: 99, margin: "18px 0 0", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${accuracy}%`, background: `linear-gradient(90deg,${grade.col}80,${grade.col})`, borderRadius: 99, transition: "width 0.6s ease" }} />
          </div>
        </div>
        <div style={{ fontSize: 10, color: "#64748b", marginBottom: 8, letterSpacing: 1.5 }}>REVIEW JAWABAN</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
          {answers.map((a, i) => (
            <div key={i} style={{ borderRadius: 16, background: a.correct ? "rgba(34,197,94,0.06)" : "rgba(239,68,68,0.07)", border: `1.5px solid ${a.correct ? "rgba(34,197,94,0.25)" : "rgba(239,68,68,0.25)"}`, overflow: "hidden" }}>
              <div style={{ padding: "10px 14px", background: a.correct ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)", display: "flex", alignItems: "center", gap: 8, borderBottom: `1px solid ${a.correct ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)"}` }}>
                <span style={{ fontSize: 16 }}>{a.correct ? "✓" : "✗"}</span>
                <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 700 }}>Q{i + 1}</span>
                <span style={{ fontSize: 12, color: a.correct ? "#4ade80" : "#f87171", fontWeight: 700 }}>
                  {a.correct ? "Benar" : `Salah → ${a.answer}`}
                </span>
              </div>
              <div style={{ padding: "12px 14px" }}>
                <div style={{ fontSize: 12, color: "#94a3b8", fontStyle: "italic", lineHeight: 1.6, marginBottom: 10 }}>
                  {hasJapanese(a.card.jp) ? `あ ${stripFuri(a.card.jp)}` : `🇮🇩 ${a.card.id_text}`}
                  {a.card.romaji && <span style={{ marginLeft: 8, fontSize: 11, opacity: 0.6 }}>({a.card.romaji})</span>}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  {!a.correct && (
                    <div style={{ fontSize: 12, padding: "6px 10px", borderRadius: 8, lineHeight: 1.5, background: "rgba(248,113,113,0.08)", border: "1px solid rgba(248,113,113,0.2)", color: "#fca5a5" }}>✗ {a.picked}</div>
                  )}
                  <div style={{ fontSize: 12, padding: "6px 10px", borderRadius: 8, lineHeight: 1.5, background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.3)", color: "#86efac" }}>✓ {a.answer}</div>
                </div>
                {a.card.desc && (
                  <div style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.7, marginTop: 10, borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 10 }}>📖 {a.card.desc}</div>
                )}
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => startQuiz(activeCards)} style={{ fontFamily: "inherit", flex: 1, padding: "14px 0", borderRadius: 14, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.06)", color: "#94a3b8", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>🔄 Ulangi</button>
          {wrongOnes.length > 0 && <button onClick={() => startQuiz(wrongOnes.map(w => w.card), wrongOnes.length, true)} style={{ fontFamily: "inherit", flex: 2, padding: "14px 0", borderRadius: 14, border: "1.5px solid rgba(248,113,113,0.5)", background: "linear-gradient(135deg,rgba(248,113,113,0.15),rgba(239,68,68,0.08))", color: "#f87171", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>🔁 Salah ({wrongOnes.length})</button>}
        </div>
      </div>
    );
  }

  const q = questions[currentQ];
  if (!q) return null;
  const score = results.filter(Boolean).length;
  const catInfo = getCatInfo(q.card.category);

  return (
    <div style={{ padding: "0 16px 24px", maxWidth: 560, margin: "0 auto" }}>
      {/* TOP BAR */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12, color: "#475569" }}>{currentQ + 1}<span style={{ opacity: 0.4 }}>/{totalQ}</span></span>
          {streak > 1 && <span style={{ fontSize: 11, color: "#fbbf24", fontWeight: 700 }}>🔥{streak}</span>}
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#4ade80" }}>✓{score}</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: "#f87171" }}>✗{results.filter(r => !r).length}</span>
          <button onClick={() => setShowSettings(s => !s)} style={{ fontFamily: "inherit", padding: "5px 9px", fontSize: 11, borderRadius: 8, cursor: "pointer", background: showSettings ? "rgba(147,197,253,0.15)" : "rgba(255,255,255,0.06)", border: `1px solid ${showSettings ? "rgba(147,197,253,0.4)" : "rgba(255,255,255,0.1)"}`, color: showSettings ? "#93c5fd" : "#475569" }}>⚙</button>
        </div>
      </div>
      {/* SETTINGS PANEL */}
      {showSettings && (
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "14px 16px", marginBottom: 10 }}>
          <div style={{ fontSize: 10, color: "#475569", letterSpacing: 1.5, marginBottom: 10 }}>PENGATURAN KUIS</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, color: "#64748b", minWidth: 70 }}>Jumlah soal</span>
              {[10, 20, 30, cards.length].map((n, i) => { const lbl = i === 3 ? "Semua" : String(n); const on = quizCount === n; return <button key={n} onClick={() => { setQuizCount(n); startQuiz(activeCards, n); }} style={{ fontFamily: "inherit", padding: "4px 10px", fontSize: 11, borderRadius: 7, cursor: "pointer", fontWeight: on ? 700 : 400, background: on ? "rgba(147,197,253,0.2)" : "rgba(255,255,255,0.05)", border: `1px solid ${on ? "rgba(147,197,253,0.5)" : "rgba(255,255,255,0.08)"}`, color: on ? "#93c5fd" : "#64748b" }}>{lbl}</button>; })}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, color: "#64748b", minWidth: 70 }}>Auto next</span>
              <button onClick={() => setAutoNext(v => !v)} style={{ fontFamily: "inherit", padding: "4px 12px", fontSize: 11, borderRadius: 7, cursor: "pointer", fontWeight: 700, background: autoNext ? "rgba(74,222,128,0.15)" : "rgba(255,255,255,0.05)", border: `1px solid ${autoNext ? "rgba(74,222,128,0.4)" : "rgba(255,255,255,0.08)"}`, color: autoNext ? "#4ade80" : "#64748b" }}>{autoNext ? "ON" : "OFF"}</button>
              {autoNext && [1000, 1500, 2000].map(d => <button key={d} onClick={() => setAutoDelay(d)} style={{ fontFamily: "inherit", padding: "4px 8px", fontSize: 11, borderRadius: 7, cursor: "pointer", background: autoDelay === d ? "rgba(147,197,253,0.15)" : "rgba(255,255,255,0.04)", border: `1px solid ${autoDelay === d ? "rgba(147,197,253,0.4)" : "rgba(255,255,255,0.07)"}`, color: autoDelay === d ? "#93c5fd" : "#475569" }}>{d / 1000}s</button>)}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 11, color: "#64748b", minWidth: 70 }}>Penjelasan</span>
              <button onClick={() => setShowExp(v => !v)} style={{ fontFamily: "inherit", padding: "4px 12px", fontSize: 11, borderRadius: 7, cursor: "pointer", fontWeight: 700, background: showExp ? "rgba(74,222,128,0.15)" : "rgba(255,255,255,0.05)", border: `1px solid ${showExp ? "rgba(74,222,128,0.4)" : "rgba(255,255,255,0.08)"}`, color: showExp ? "#4ade80" : "#64748b" }}>{showExp ? "ON" : "OFF"}</button>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 11, color: "#64748b", minWidth: 70 }}>Romaji</span>
              <button onClick={() => setShowHints(v => !v)} style={{ fontFamily: "inherit", padding: "4px 12px", fontSize: 11, borderRadius: 7, cursor: "pointer", fontWeight: 700, background: showHints ? "rgba(147,197,253,0.15)" : "rgba(255,255,255,0.05)", border: `1px solid ${showHints ? "rgba(147,197,253,0.4)" : "rgba(255,255,255,0.08)"}`, color: showHints ? "#93c5fd" : "#64748b" }}>{showHints ? "ON" : "OFF"}</button>
              {showHints && <span style={{ fontSize: 10, color: "#475569" }}>tampil sebelum jawab</span>}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, color: "#64748b", minWidth: 70 }}>Kesulitan</span>
              {[
                { key: "easy",   label: "Easy",   col: "#4ade80", bg: "rgba(74,222,128,0.15)",   border: "rgba(74,222,128,0.4)"   },
                { key: "medium", label: "Medium", col: "#fbbf24", bg: "rgba(251,191,36,0.15)",   border: "rgba(251,191,36,0.4)"   },
                { key: "hard",   label: "Hard",   col: "#f87171", bg: "rgba(248,113,113,0.15)",  border: "rgba(248,113,113,0.4)"  },
              ].map(d => (
                <button key={d.key} onClick={() => { setDifficulty(d.key); startQuiz(activeCards, undefined); }} style={{ fontFamily: "inherit", padding: "4px 10px", fontSize: 11, borderRadius: 7, cursor: "pointer", fontWeight: difficulty === d.key ? 700 : 400, background: difficulty === d.key ? d.bg : "rgba(255,255,255,0.05)", border: `1px solid ${difficulty === d.key ? d.border : "rgba(255,255,255,0.08)"}`, color: difficulty === d.key ? d.col : "#64748b" }}>{d.label}</button>
              ))}
              <span style={{ fontSize: 10, color: "#475569" }}>{difficulty === "easy" ? "pilihan dari kategori berbeda" : difficulty === "hard" ? "sama kategori + kartu lemahmu" : "1 sama kategori + 2 berbeda"}</span>
            </div>
            {lemahCards.length > 0 && <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ fontSize: 11, color: "#64748b", minWidth: 70 }}>Mode</span><button onClick={() => { const next = !lemahMode; setLemahMode(next); startQuiz(next && lemahCards.length > 0 ? lemahCards : cards); }} style={{ fontFamily: "inherit", padding: "4px 12px", fontSize: 11, borderRadius: 7, cursor: "pointer", fontWeight: 700, background: lemahMode ? "rgba(248,113,113,0.15)" : "rgba(255,255,255,0.05)", border: `1px solid ${lemahMode ? "rgba(248,113,113,0.4)" : "rgba(255,255,255,0.08)"}`, color: lemahMode ? "#f87171" : "#64748b" }}>{lemahMode ? `⚠ Fokus Lemah (${lemahCards.length})` : "Normal"}</button></div>}
          </div>
        </div>
      )}
      {/* PROGRESS BAR */}
      <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden", marginBottom: 14 }}>
        <div style={{ height: "100%", width: `${(currentQ / totalQ) * 100}%`, background: "linear-gradient(90deg,#f6d365,#fda085)", borderRadius: 99, transition: "width 0.3s" }} />
      </div>
      {/* QUESTION CARD */}
      <div style={{ background: `linear-gradient(135deg,${catInfo.color}bb,${catInfo.color}55)`, borderRadius: 20, padding: "22px 18px", border: `1.5px solid ${catInfo.color}88`, boxShadow: `0 6px 24px ${catInfo.color}22`, marginBottom: 14, textAlign: "center", minHeight: 120, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", letterSpacing: 1.5, marginBottom: 8 }}>{catInfo.emoji} {catInfo.label}</div>
        <JpFront text={q.card.jp} />
        {(selected !== null || showHints) && (
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.12)", marginTop: 10, paddingTop: 8 }}>
            <div style={{ fontSize: 11, color: "#93c5fd", opacity: 0.85 }}>{q.card.romaji}</div>
            {selected !== null && <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>🇮🇩 {q.card.id_text}</div>}
          </div>
        )}
      </div>
      {/* OPTIONS */}
      <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 12 }}>
        {q.options.map((opt, idx) => {
          let bg = "rgba(255,255,255,0.06)", border = "1px solid rgba(255,255,255,0.09)", color = "#cbd5e0";
          if (selected !== null) {
            if (opt.correct)         { bg = "rgba(74,222,128,0.14)"; border = "2px solid #4ade8088"; color = "#86efac"; }
            else if (idx === selected) { bg = "rgba(248,113,113,0.14)"; border = "2px solid #f8717188"; color = "#fca5a5"; }
            else                     { bg = "rgba(255,255,255,0.02)"; border = "1px solid rgba(255,255,255,0.05)"; color = "rgba(255,255,255,0.25)"; }
          }
          const badgeColor = selected !== null ? (opt.correct ? "#4ade80" : idx === selected ? "#f87171" : "rgba(255,255,255,0.15)") : "#64748b";
          const subColor = selected !== null ? (opt.correct ? "#4ade8088" : idx === selected ? "#f8717188" : "rgba(255,255,255,0.12)") : "#64748b";
          return (
            <button key={idx} onClick={() => handleSelect(idx)} style={{ padding: "13px 14px", fontSize: 13, borderRadius: 14, background: bg, border, color, cursor: selected !== null ? "default" : "pointer", textAlign: "left", lineHeight: 1.5, display: "flex", gap: 10, alignItems: "flex-start", fontFamily: "'Noto Sans JP',sans-serif", transition: "all 0.15s" }}>
              <span style={{ width: 26, height: 26, borderRadius: "50%", flexShrink: 0, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, border: "1px solid rgba(255,255,255,0.09)", color: badgeColor, marginTop: 1 }}>
                {selected !== null ? (opt.correct ? "✓" : idx === selected ? "✗" : idx + 1) : idx + 1}
              </span>
              <div style={{ flex: 1 }}>
                <div>{opt.text}</div>
                {selected !== null && opt.jp && (
                  <>
                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", margin: "6px 0 4px" }} />
                    <div style={{ fontSize: 11, fontFamily: "'Noto Sans JP',sans-serif", color: subColor }}>{stripFuri(opt.jp)}</div>
                    <div style={{ fontSize: 10, color: subColor, marginTop: 2, opacity: 0.8 }}>{opt.romaji}</div>
                  </>
                )}
              </div>
            </button>
          );
        })}
      </div>
      {/* EXPLANATION + NEXT */}
      {selected !== null && (
        <>
          {showExp && (
            <div style={{ background: q.options[selected].correct ? "rgba(74,222,128,0.07)" : "rgba(248,113,113,0.07)", border: `1px solid ${q.options[selected].correct ? "rgba(74,222,128,0.2)" : "rgba(248,113,113,0.2)"}`, borderRadius: 14, padding: "13px 14px", marginBottom: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6, color: q.options[selected].correct ? "#4ade80" : "#f87171" }}>
                {q.options[selected].correct ? "✓ Benar!" : `✗ Salah — ✓ ${q.options.find(o => o.correct)?.text}`}
              </div>
              <DescBlock text={q.card.desc} />
            </div>
          )}
          {!autoNext ? (
            <button onClick={handleNext} style={{ fontFamily: "inherit", width: "100%", padding: "13px", fontSize: 14, fontWeight: 700, borderRadius: 14, background: "linear-gradient(135deg,#f6d365,#fda085)", border: "none", color: "#1a1a2e", cursor: "pointer" }}>
              {currentQ < totalQ - 1 ? "Soal berikutnya →" : "Lihat hasil 🏁"}
            </button>
          ) : (
            <button onClick={handleNext} style={{ fontFamily: "inherit", width: "100%", padding: "9px", fontSize: 12, borderRadius: 14, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", color: "#475569", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <span>Skip →</span>
              <span style={{ fontSize: 10, opacity: 0.5 }}>atau Enter</span>
              {autoCountdown > 0 && <span style={{ fontSize: 10, color: "#93c5fd" }}>{(autoCountdown / 1000).toFixed(1)}s</span>}
            </button>
          )}
        </>
      )}
      <div style={{ textAlign: "center", fontSize: 10, color: "#475569", marginTop: 8 }}>⌨ 1/2/3 pilih · Enter lanjut</div>
    </div>
  );
}


export default QuizMode;
