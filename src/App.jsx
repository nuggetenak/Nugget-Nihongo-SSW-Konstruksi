// ─── SSW Konstruksi · by Nugget Nihongo ─────────────────────────────────────
// Root component: onboarding → nav → mode routing
// v2.0 — Full rewrite (Phase 2)
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import { T } from "./styles/theme.js";
import { CARDS } from "./data/cards.js";
import { CATEGORIES, getCatInfo, VOCAB_SOURCES } from "./data/categories.js";
import { shuffle } from "./utils/shuffle.js";
import { usePersistedState } from "./hooks/usePersistedState.js";
import { loadFromStorage, saveToStorage } from "./utils/wrong-tracker.js";

// Modes
import FlashcardMode from "./modes/FlashcardMode.jsx";
import QuizMode from "./modes/QuizMode.jsx";
import JACMode from "./modes/JACMode.jsx";
import WaygroundMode from "./modes/WaygroundMode.jsx";
import AngkaMode from "./modes/AngkaMode.jsx";
import DangerMode from "./modes/DangerMode.jsx";
import SimulasiMode from "./modes/SimulasiMode.jsx";
import StatsMode from "./modes/StatsMode.jsx";
import SearchMode from "./modes/SearchMode.jsx";
import SprintMode from "./modes/SprintMode.jsx";
import FocusMode from "./modes/FocusMode.jsx";
import GlossaryMode from "./modes/GlossaryMode.jsx";
import SumberMode from "./modes/SumberMode.jsx";

// ─── Onboarding ──────────────────────────────────────────────────────────────
function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const steps = [
    { emoji: "🏗️", title: "Selamat Datang!", sub: "SSW Konstruksi · by Nugget Nihongo", desc: "Aplikasi belajar untuk ujian SSW Konstruksi Jepang. Flashcard, kuis, dan simulasi ujian — semua dalam Bahasa Indonesia." },
    { emoji: "📚", title: "1.438 Kartu Flashcard", sub: "土木 · 建築 · ライフライン設備", desc: "Materi lengkap dari PDF resmi JAC: keselamatan, hukum, jenis pekerjaan, alat, pipa, listrik, telekomunikasi, dan lainnya." },
    { emoji: "🎯", title: "Kuis & Simulasi", sub: "Latihan seperti ujian asli", desc: "95 soal JAC Official + 598 soal teknis + simulasi ujian penuh dengan timer. Lacak kelemahan dan perkuat pemahaman." },
    { emoji: "🚀", title: "Siap Belajar!", sub: "頑張ってね！ Semangat!", desc: "Mulai dari Kartu untuk belajar istilah, lalu uji diri dengan Kuis. Tandai yang sudah hafal. Pasti bisa! 💪" },
  ];
  const s = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", textAlign: "center" }}>
      <div style={{ fontSize: 56, marginBottom: 16, filter: "drop-shadow(0 4px 20px rgba(245,158,11,0.3))" }}>{s.emoji}</div>
      <h1 style={{ fontSize: 22, fontWeight: 800, background: T.accent, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 4 }}>{s.title}</h1>
      <div style={{ fontSize: 12, color: T.textMuted, letterSpacing: 0.5, marginBottom: 16 }}>{s.sub}</div>
      <p style={{ fontSize: 13, lineHeight: 1.7, color: T.textDim, maxWidth: 320, marginBottom: 32 }}>{s.desc}</p>
      <div style={{ display: "flex", gap: 5, marginBottom: 20 }}>
        {steps.map((_, i) => <div key={i} style={{ width: i === step ? 22 : 7, height: 7, borderRadius: T.r.pill, background: i === step ? T.amber : "rgba(245,158,11,0.2)", transition: "all 0.3s" }} />)}
      </div>
      <button onClick={() => isLast ? onComplete() : setStep(step + 1)} style={{
        fontFamily: "inherit", padding: "12px 44px", fontSize: 14, fontWeight: 700,
        borderRadius: T.r.md, background: T.accent, border: "none", color: T.textBright, cursor: "pointer",
        boxShadow: "0 4px 20px rgba(245,158,11,0.25)",
      }}>{isLast ? "Mulai Belajar 🚀" : "Lanjut →"}</button>
      {!isLast && (
        <button onClick={onComplete} style={{ fontFamily: "inherit", marginTop: 10, padding: "6px 16px", fontSize: 11, background: "none", border: "none", color: T.textFaint, cursor: "pointer" }}>Lewati</button>
      )}
    </div>
  );
}

// ─── Mode Menu Definitions ───────────────────────────────────────────────────
const TABS = [
  { key: "belajar", label: "Belajar" },
  { key: "ujian",   label: "Ujian" },
  { key: "ref",     label: "Referensi" },
];

const MODES = {
  belajar: [
    { key: "kartu",   icon: "🃏", label: "Kartu",         desc: "Flashcard interaktif" },
    { key: "kuis",    icon: "❓", label: "Kuis",           desc: "Kuis otomatis 3 level" },
    { key: "sprint",  icon: "⚡", label: "Sprint",         desc: "Drill kecepatan 60 detik" },
    { key: "fokus",   icon: "🎯", label: "Fokus",          desc: "Latih kelemahan" },
  ],
  ujian: [
    { key: "jac",     icon: "📋", label: "JAC Official",   desc: "Soal contoh ujian resmi" },
    { key: "wayground",icon: "🎓", label: "Wayground",     desc: "598 soal teknis" },
    { key: "simulasi",icon: "🎯", label: "Simulasi",       desc: "Ujian + timer" },
    { key: "angka",   icon: "🔢", label: "Angka Kunci",    desc: "Angka wajib hafal" },
    { key: "jebak",   icon: "⚠️", label: "Soal Jebak",     desc: "Istilah mirip" },
  ],
  ref: [
    { key: "cari",    icon: "🔍", label: "Cari",           desc: "Pencarian cepat" },
    { key: "glosari", icon: "📖", label: "Glosari",        desc: "Kamus terurut" },
    { key: "sumber",  icon: "📂", label: "Sumber",         desc: "Per PDF sumber" },
    { key: "stats",   icon: "📊", label: "Statistik",      desc: "Progress & kelemahan" },
  ],
};

// ─── Main App ────────────────────────────────────────────────────────────────
export default function App() {
  // ── Onboarding ──
  const [onboarded, setOnboarded] = useState(() => {
    try { return !!localStorage.getItem("ssw-onboarded"); } catch { return false; }
  });

  // ── Navigation ──
  const [mode, setMode] = useState(null); // null = home
  const [tab, setTab] = useState("belajar");
  const [vocabMode, setVocabMode] = useState(false); // false = konsep, true = vocab

  // ── Category Filter ──
  const [activeCats, setActiveCats] = useState(new Set(["all"]));
  const toggleCat = (key) => {
    setActiveCats(prev => {
      const next = new Set(prev);
      if (key === "all") return new Set(["all"]);
      next.delete("all");
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next.size === 0 ? new Set(["all"]) : next;
    });
  };

  // ── Known/Unknown Sets ──
  const [known, setKnown] = usePersistedState("ssw-known", []);
  const [unknown, setUnknown] = usePersistedState("ssw-unknown", []);
  const knownSet = new Set(Array.isArray(known) ? known : []);
  const unknownSet = new Set(Array.isArray(unknown) ? unknown : []);

  const handleMark = useCallback((id, type) => {
    if (type === "known") {
      setKnown(k => { const s = new Set(k); s.add(id); return [...s]; });
      setUnknown(u => { const s = new Set(u); s.delete(id); return [...s]; });
    } else {
      setUnknown(u => { const s = new Set(u); s.add(id); return [...s]; });
      setKnown(k => { const s = new Set(k); s.delete(id); return [...s]; });
    }
  }, [setKnown, setUnknown]);

  // ── Quiz Wrong Tracking (read-only for stats) ──
  const [quizWrong] = usePersistedState("ssw-quiz-wrong", {});

  // ── Filtered Cards ──
  const filteredCards = CARDS.filter(c => {
    const isVocab = VOCAB_SOURCES.includes(c.source);
    if (vocabMode !== isVocab) return false;
    if (activeCats.has("all")) return true;
    return activeCats.has(c.category);
  });

  // ── Handle Onboarding ──
  if (!onboarded) {
    return <Onboarding onComplete={() => { setOnboarded(true); try { localStorage.setItem("ssw-onboarded", "1"); } catch {} }} />;
  }

  // ── Render Active Mode ──
  const exitMode = () => { setMode(null); window.scrollTo({ top: 0, behavior: "instant" }); };
  if (mode) {
    switch (mode) {
      case "kartu":    return <FlashcardMode cards={filteredCards} known={knownSet} unknown={unknownSet} onMark={handleMark} onExit={exitMode} />;
      case "kuis":     return <QuizMode cards={filteredCards} allCards={CARDS} onExit={exitMode} />;
      case "jac":      return <JACMode onExit={exitMode} />;
      case "wayground":return <WaygroundMode onExit={exitMode} />;
      case "angka":    return <AngkaMode onExit={exitMode} />;
      case "jebak":    return <DangerMode onExit={exitMode} />;
      case "simulasi": return <SimulasiMode onExit={exitMode} />;
      case "stats":    return <StatsMode known={knownSet} unknown={unknownSet} quizWrong={quizWrong} onExit={exitMode} />;
      case "cari":     return <SearchMode onExit={exitMode} />;
      case "sprint":   return <SprintMode cards={filteredCards} onExit={exitMode} />;
      case "fokus":    return <FocusMode known={knownSet} unknown={unknownSet} quizWrong={quizWrong} onExit={exitMode} />;
      case "glosari":  return <GlossaryMode onExit={exitMode} />;
      case "sumber":   return <SumberMode onExit={exitMode} />;
      default:         return null;
    }
  }

  // ── Home Screen ──
  const knownCount = filteredCards.filter(c => knownSet.has(c.id)).length;
  const pctKnown = filteredCards.length > 0 ? Math.round((knownCount / filteredCards.length) * 100) : 0;

  return (
    <div style={{ minHeight: "100dvh", maxWidth: T.maxW, margin: "0 auto", padding: "0 16px 32px" }}>

      {/* ── Brand Header ── */}
      <div style={{ padding: "20px 0 12px", textAlign: "center" }}>
        <div style={{ fontSize: 18, fontWeight: 800 }}>
          <span style={{ background: T.accent, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>SSW Konstruksi</span>
        </div>
        <div style={{ fontSize: 10, color: T.textDim, letterSpacing: 1, marginTop: 2 }}>by Nugget Nihongo</div>
      </div>

      {/* ── Progress Pill ── */}
      <div style={{
        padding: "10px 14px", borderRadius: T.r.md,
        background: T.surface, border: `1px solid ${T.border}`,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginBottom: 14, fontSize: 12,
      }}>
        <span style={{ color: T.textMuted }}>{filteredCards.length} kartu · {pctKnown}% hafal</span>
        <span style={{ color: T.gold, fontWeight: 700 }}>{knownCount}/{filteredCards.length}</span>
      </div>

      {/* ── Konsep / Vocab Toggle ── */}
      <div style={{ display: "flex", gap: 0, marginBottom: 14, borderRadius: T.r.md, overflow: "hidden", border: `1px solid ${T.border}` }}>
        {[
          { v: false, label: "Konsep", count: CARDS.filter(c => !VOCAB_SOURCES.includes(c.source)).length },
          { v: true,  label: "Kosakata", count: CARDS.filter(c => VOCAB_SOURCES.includes(c.source)).length },
        ].map(t => (
          <button key={String(t.v)} onClick={() => setVocabMode(t.v)} style={{
            flex: 1, padding: "8px", fontSize: 12, fontWeight: 600,
            fontFamily: "inherit", border: "none", cursor: "pointer",
            background: vocabMode === t.v ? "rgba(245,158,11,0.15)" : T.surface,
            color: vocabMode === t.v ? T.gold : T.textMuted,
          }}>
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {/* ── Category Filter ── */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 18 }}>
        {CATEGORIES.filter(c => c.key !== "bintang").map(c => {
          const active = activeCats.has(c.key);
          return (
            <button key={c.key} onClick={() => toggleCat(c.key)} style={{
              fontFamily: "inherit", fontSize: 10, padding: "4px 9px", borderRadius: T.r.pill, cursor: "pointer",
              background: active ? "rgba(251,191,36,0.15)" : "transparent",
              border: `1px solid ${active ? "rgba(251,191,36,0.35)" : T.border}`,
              color: active ? T.gold : T.textDim,
            }}>
              {c.emoji} {c.key === "all" ? "Semua" : ""}
            </button>
          );
        })}
      </div>

      {/* ── Tab Bar ── */}
      <div style={{ display: "flex", gap: 0, marginBottom: 16, borderRadius: T.r.md, overflow: "hidden", border: `1px solid ${T.border}` }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            flex: 1, padding: "9px", fontSize: 12, fontWeight: 600,
            fontFamily: "inherit", border: "none", cursor: "pointer",
            background: tab === t.key ? "rgba(245,158,11,0.12)" : T.surface,
            color: tab === t.key ? T.gold : T.textMuted,
            borderRight: t.key !== "ref" ? `1px solid ${T.border}` : "none",
          }}>{t.label}</button>
        ))}
      </div>

      {/* ── Mode Grid ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {MODES[tab].map(m => (
          <button
            key={m.key}
            onClick={() => { setMode(m.key); window.scrollTo({ top: 0, behavior: "instant" }); }}
            style={{
              fontFamily: "inherit", padding: "16px 12px", borderRadius: T.r.lg, cursor: "pointer",
              background: T.surface, border: `1px solid ${T.border}`,
              color: T.text, textAlign: "left",
              transition: "all 0.15s",
            }}
          >
            <div style={{ fontSize: 22, marginBottom: 6 }}>{m.icon}</div>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{m.label}</div>
            <div style={{ fontSize: 10, color: T.textDim, lineHeight: 1.3 }}>{m.desc}</div>
          </button>
        ))}
      </div>

      {/* ── Footer ── */}
      <div style={{ textAlign: "center", marginTop: 32, fontSize: 10, color: T.textFaint }}>
        SSW Konstruksi v2.0 · Teknik Sipil · Bangunan · Lifeline & Peralatan
      </div>
    </div>
  );
}
