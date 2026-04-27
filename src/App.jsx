// ─── SSW Konstruksi · by Nugget Nihongo ─────────────────────────────────────
// v2.1 — Phase 3: Full UX overhaul + 3-track navigation
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useCallback } from "react";
import { T } from "./styles/theme.js";
import { CARDS } from "./data/cards.js";
import { CATEGORIES, getCatInfo, VOCAB_SOURCES } from "./data/categories.js";
import { usePersistedState } from "./hooks/usePersistedState.js";

// Components
import TrackPicker from "./components/TrackPicker.jsx";
import BottomNav from "./components/BottomNav.jsx";
import Dashboard from "./components/Dashboard.jsx";

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
    { emoji: "📚", title: "1.438 Kartu Flashcard", sub: "土木 · 建築 · ライフライン設備", desc: "Materi lengkap dari PDF resmi JAC: keselamatan, hukum, jenis pekerjaan, alat, pipa, listrik, dan lainnya." },
    { emoji: "🎯", title: "Kuis & Simulasi", sub: "Latihan seperti ujian asli", desc: "95 soal JAC Official + 598 soal teknis + simulasi ujian penuh dengan timer." },
    { emoji: "🚀", title: "Siap Belajar!", sub: "頑張ってね！", desc: "Pilih jalur belajar, lalu mulai dari Kartu. Tandai yang sudah hafal. Pasti bisa! 💪" },
  ];
  const s = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", textAlign: "center" }}>
      <div style={{ fontSize: 56, marginBottom: 16, filter: "drop-shadow(0 4px 20px rgba(245,158,11,0.3))", animation: "scaleIn 0.3s ease" }}>{s.emoji}</div>
      <h1 style={{ fontSize: 22, fontWeight: 800, background: T.accent, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 4 }}>{s.title}</h1>
      <div style={{ fontSize: 12, color: T.textMuted, letterSpacing: 0.5, marginBottom: 16 }}>{s.sub}</div>
      <p style={{ fontSize: 13, lineHeight: 1.7, color: T.textDim, maxWidth: 320, marginBottom: 32 }}>{s.desc}</p>
      <div style={{ display: "flex", gap: 5, marginBottom: 20 }}>
        {steps.map((_, i) => <div key={i} style={{ width: i === step ? 22 : 7, height: 7, borderRadius: T.r.pill, background: i === step ? T.amber : "rgba(245,158,11,0.2)", transition: "all 0.3s" }} />)}
      </div>
      <button onClick={() => isLast ? onComplete() : setStep(step + 1)} style={{
        fontFamily: "inherit", padding: "12px 44px", fontSize: 14, fontWeight: 700,
        borderRadius: T.r.md, background: T.accent, border: "none", color: T.textBright, cursor: "pointer",
        boxShadow: T.shadow.glowStrong,
      }}>{isLast ? "Pilih Jalur 🚀" : "Lanjut →"}</button>
      {!isLast && <button onClick={onComplete} style={{ fontFamily: "inherit", marginTop: 10, padding: "6px 16px", fontSize: 11, background: "none", border: "none", color: T.textFaint, cursor: "pointer" }}>Lewati</button>}
    </div>
  );
}

// ─── Mode Menus ──────────────────────────────────────────────────────────────
const BELAJAR_MODES = [
  { key: "kartu",  icon: "🃏", label: "Kartu",  desc: "Flashcard interaktif" },
  { key: "kuis",   icon: "❓", label: "Kuis",   desc: "Kuis otomatis 3 level" },
  { key: "sprint", icon: "⚡", label: "Sprint", desc: "Drill kecepatan 60 detik" },
  { key: "fokus",  icon: "🎯", label: "Fokus",  desc: "Latih kelemahan" },
];
const UJIAN_MODES = [
  { key: "jac",      icon: "📋", label: "JAC Official", desc: "Soal contoh ujian resmi" },
  { key: "wayground",icon: "🎓", label: "Wayground",    desc: "598 soal teknis" },
  { key: "simulasi", icon: "🎯", label: "Simulasi",     desc: "Ujian + timer" },
  { key: "angka",    icon: "🔢", label: "Angka Kunci",  desc: "Angka wajib hafal" },
  { key: "jebak",    icon: "⚠️", label: "Soal Jebak",   desc: "Istilah mirip" },
];
const LAINNYA_MODES = [
  { key: "cari",    icon: "🔍", label: "Cari",      desc: "Pencarian cepat" },
  { key: "glosari", icon: "📖", label: "Glosari",   desc: "Kamus terurut" },
  { key: "sumber",  icon: "📂", label: "Sumber",    desc: "Per PDF sumber" },
  { key: "stats",   icon: "📊", label: "Statistik", desc: "Progress & kelemahan" },
];

function ModeGrid({ modes, onSelect, title }) {
  return (
    <div style={{ padding: "0 16px 24px", maxWidth: T.maxW, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ padding: "16px 0 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 17, fontWeight: 800 }}>
          <span style={{ background: T.accent, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{title}</span>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, animation: "fadeIn 0.3s ease" }}>
        {modes.map((m, i) => (
          <button
            key={m.key}
            onClick={() => onSelect(m.key)}
            style={{
              fontFamily: "inherit", padding: "18px 14px", borderRadius: T.r.lg, cursor: "pointer",
              background: T.surface, border: `1px solid ${T.border}`,
              color: T.text, textAlign: "left",
              transition: "all 0.15s",
              animation: `slideUp 0.3s ease ${i * 0.04}s both`,
            }}
          >
            <div style={{ fontSize: 24, marginBottom: 8 }}>{m.icon}</div>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 3 }}>{m.label}</div>
            <div style={{ fontSize: 11, color: T.textDim, lineHeight: 1.4 }}>{m.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main App ────────────────────────────────────────────────────────────────
export default function App() {
  // ── Setup State ──
  const [onboarded, setOnboarded] = useState(() => {
    try { return !!localStorage.getItem("ssw-onboarded"); } catch { return false; }
  });
  const [track, setTrack] = usePersistedState("ssw-track", null);
  const [tab, setTab] = useState("home");
  const [mode, setMode] = useState(null);
  const [vocabMode, setVocabMode] = useState(false);
  const [activeCats, setActiveCats] = useState(new Set(["all"]));

  // ── Known/Unknown ──
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

  const [quizWrong] = usePersistedState("ssw-quiz-wrong", {});

  // ── Category Toggle ──
  const toggleCat = (key) => {
    setActiveCats(prev => {
      if (key === "all") return new Set(["all"]);
      const next = new Set(prev);
      next.delete("all");
      if (next.has(key)) next.delete(key); else next.add(key);
      return next.size === 0 ? new Set(["all"]) : next;
    });
  };

  // ── Filtered Cards ──
  const filteredCards = CARDS.filter(c => {
    const isVocab = VOCAB_SOURCES.includes(c.source);
    if (vocabMode !== isVocab) return false;
    if (activeCats.has("all")) return true;
    return activeCats.has(c.category);
  });

  // ── Navigate ──
  const goMode = (m) => { setMode(m); window.scrollTo({ top: 0, behavior: "instant" }); };
  const exitMode = () => { setMode(null); window.scrollTo({ top: 0, behavior: "instant" }); };
  const goTab = (t) => { setTab(t); setMode(null); window.scrollTo({ top: 0, behavior: "instant" }); };

  // ═══ FLOW: Onboarding → Track → App ═══

  // 1. Onboarding
  if (!onboarded) {
    return <Onboarding onComplete={() => { setOnboarded(true); try { localStorage.setItem("ssw-onboarded", "1"); } catch {} }} />;
  }

  // 2. Track Picker
  if (!track) {
    return <TrackPicker onSelect={(t) => setTrack(t)} />;
  }

  // 3. Active Mode (full screen, no bottom nav)
  if (mode) {
    const modeMap = {
      kartu:    <FlashcardMode cards={filteredCards} known={knownSet} unknown={unknownSet} onMark={handleMark} onExit={exitMode} />,
      kuis:     <QuizMode cards={filteredCards} allCards={CARDS} onExit={exitMode} />,
      jac:      <JACMode onExit={exitMode} />,
      wayground:<WaygroundMode onExit={exitMode} />,
      angka:    <AngkaMode onExit={exitMode} />,
      jebak:    <DangerMode onExit={exitMode} />,
      simulasi: <SimulasiMode onExit={exitMode} />,
      stats:    <StatsMode known={knownSet} unknown={unknownSet} quizWrong={quizWrong} onExit={exitMode} />,
      cari:     <SearchMode onExit={exitMode} />,
      sprint:   <SprintMode cards={filteredCards} onExit={exitMode} />,
      fokus:    <FocusMode known={knownSet} unknown={unknownSet} quizWrong={quizWrong} onExit={exitMode} />,
      glosari:  <GlossaryMode onExit={exitMode} />,
      sumber:   <SumberMode onExit={exitMode} />,
    };
    return modeMap[mode] || null;
  }

  // 4. Home with Bottom Nav
  return (
    <div style={{ paddingBottom: T.navH + 16 }}>
      {/* ── Category/Vocab Filter (for Belajar tab) ── */}
      {tab === "belajar" && (
        <div style={{ padding: "12px 16px 0", maxWidth: T.maxW, margin: "0 auto" }}>
          <div style={{ padding: "16px 0 10px" }}>
            <div style={{ fontSize: 17, fontWeight: 800 }}>
              <span style={{ background: T.accent, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Belajar</span>
            </div>
          </div>
          {/* Konsep / Vocab toggle */}
          <div style={{ display: "flex", gap: 0, marginBottom: 10, borderRadius: T.r.md, overflow: "hidden", border: `1px solid ${T.border}` }}>
            {[false, true].map(v => (
              <button key={String(v)} onClick={() => setVocabMode(v)} style={{
                flex: 1, padding: "7px", fontSize: 11, fontWeight: 600,
                fontFamily: "inherit", border: "none", cursor: "pointer",
                background: vocabMode === v ? "rgba(245,158,11,0.12)" : T.surface,
                color: vocabMode === v ? T.gold : T.textDim,
              }}>
                {v ? "📝 Kosakata" : "💡 Konsep"}
              </button>
            ))}
          </div>
          {/* Category pills */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 6 }}>
            {CATEGORIES.filter(c => c.key !== "bintang").map(c => {
              const active = activeCats.has(c.key);
              return (
                <button key={c.key} onClick={() => toggleCat(c.key)} style={{
                  fontFamily: "inherit", fontSize: 10, padding: "3px 8px", borderRadius: T.r.pill, cursor: "pointer",
                  background: active ? "rgba(251,191,36,0.12)" : "transparent",
                  border: `1px solid ${active ? "rgba(251,191,36,0.30)" : T.border}`,
                  color: active ? T.gold : T.textFaint,
                  transition: "all 0.15s",
                }}>{c.emoji}</button>
              );
            })}
          </div>
          <div style={{ fontSize: 11, color: T.textDim, marginBottom: 8 }}>
            {filteredCards.length} kartu dipilih
          </div>
        </div>
      )}

      {/* ── Tab Content ── */}
      {tab === "home" && (
        <Dashboard
          known={knownSet}
          unknown={unknownSet}
          track={track}
          onNavigate={goMode}
          onChangeTrack={() => setTrack(null)}
        />
      )}
      {tab === "belajar" && <ModeGrid modes={BELAJAR_MODES} onSelect={goMode} title="" />}
      {tab === "ujian"   && <ModeGrid modes={UJIAN_MODES}   onSelect={goMode} title="Ujian" />}
      {tab === "lainnya" && <ModeGrid modes={LAINNYA_MODES} onSelect={goMode} title="Lainnya" />}

      {/* ── Bottom Navigation ── */}
      <BottomNav active={tab} onChange={goTab} />
    </div>
  );
}
