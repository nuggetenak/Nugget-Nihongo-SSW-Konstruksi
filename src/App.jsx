// ─── SSW Flashcard App — Main Component ─────────────────────────────────────
// Root component: navigation, category filtering, mode routing.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";

// Data
import {
  CARDS, JAC_OFFICIAL, WAYGROUND_SETS,
  CATEGORIES, getCatInfo, VOCAB_SOURCES,
  VOCAB_BASE_CARDS, KONSEP_BASE_CARDS, VOCAB_CARD_COUNT,
} from "./data/index.js";

// Utils
import { shuffle } from "./utils/shuffle.js";
import { loadFromStorage, saveToStorage } from "./utils/wrong-tracker.js";

// Modes
import FlashcardMode from "./modes/FlashcardMode.jsx";
import QuizMode from "./modes/QuizMode.jsx";
import JACMode from "./modes/JACMode.jsx";
import AngkaMode from "./modes/AngkaMode.jsx";
import DangerMode from "./modes/DangerMode.jsx";
import SimulasiMode from "./modes/SimulasiMode.jsx";
import StatsMode from "./modes/StatsMode.jsx";
import SearchMode from "./modes/SearchMode.jsx";
import SprintMode from "./modes/SprintMode.jsx";
import FocusMode from "./modes/FocusMode.jsx";
import GlossaryMode from "./modes/GlossaryMode.jsx";
import WaygroundMode from "./modes/WaygroundMode.jsx";
import SumberMode from "./modes/SumberMode.jsx";

export default function FlashcardApp() {
  const [mode, setModeRaw] = useState("kartu");
  const [headerPct, setHeaderPct] = useState(null); // live %hafal for header pill

  // ROI: persist last-used mode across sessions
  const setMode = (m) => {
    setModeRaw(m);
    window.scrollTo({ top: 0, behavior: 'instant' });
    window.storage.set("ssw-last-mode", m).catch(() => {});
  };
  const [activeCategories, setActiveCategories] = useState(new Set(["all"]));
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("belajar");
  const [known, setKnown] = useState(new Set());
  const [unknown, setUnknown] = useState(new Set());
  const [progressLoaded, setProgressLoaded] = useState(false);
  const [starred, setStarred] = useState(() => new Set());
  const [vocabTrack, setVocabTrack] = useState(false);
  const toggleStar = (id) => setStarred(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });

  const toggleCategory = (key) => {
    setActiveCategories(prev => {
      if (key === "all") return new Set(["all"]);
      const next = new Set(prev);
      next.delete("all");
      if (next.has(key)) { next.delete(key); if (next.size === 0) return new Set(["all"]); }
      else next.add(key);
      return next;
    });
  };

  // ── P1: Load progress + last-mode + starred from storage on mount ──
  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get("ssw-progress");
        if (res) {
          const p = JSON.parse(res.value);
          if (p.known) setKnown(new Set(p.known));
          if (p.unknown) setUnknown(new Set(p.unknown));
          if (p.known) setHeaderPct(Math.round((p.known.length / CARDS.length) * 100));
        }
      } catch {}
      try {
        const lm = await window.storage.get("ssw-last-mode");
        if (lm?.value) { setModeRaw(lm.value); setActiveSection(SECTION_FOR_MODE[lm.value] || "belajar"); }
      } catch {}
      try {
        const sr = await window.storage.get("ssw-starred");
        if (sr) setStarred(new Set(JSON.parse(sr.value)));
      } catch {}
      setProgressLoaded(true);
    })();
  }, []);

  // ── P1: Auto-save progress whenever known/unknown changes ──
  useEffect(() => {
    if (!progressLoaded) return;
    window.storage.set("ssw-progress", JSON.stringify({ known: [...known], unknown: [...unknown] })).catch(() => {});
    setHeaderPct(Math.round((known.size / CARDS.length) * 100));
  }, [known, unknown, progressLoaded]);

  // ── BUG-01: Auto-save starred whenever it changes ──
  useEffect(() => {
    if (!progressLoaded) return;
    window.storage.set("ssw-starred", JSON.stringify([...starred])).catch(() => {});
  }, [starred, progressLoaded]);

  const filteredCards = (() => {
    const base = vocabTrack ? VOCAB_BASE_CARDS : KONSEP_BASE_CARDS;
    if (activeCategories.has("all") || activeCategories.size === 0) return base;
    return base.filter(c =>
      (activeCategories.has("bintang") && starred.has(c.id)) ||
      activeCategories.has(c.category)
    );
  })();

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)", fontFamily: "'Noto Sans JP', 'Segoe UI', sans-serif", color: "#e2e8f0", userSelect: "none", paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}>
      <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;700&family=Zen+Kaku+Gothic+New:wght@700&display=swap" rel="stylesheet" />

      <div style={{ padding: "14px 16px 2px", display: "flex", alignItems: "flex-start", justifyContent: "center", position: "relative" }}>
        <div style={{ textAlign: "center", flex: 1, minWidth: 0 }}>
          <h1 style={{ margin: 0, fontSize: 20, fontFamily: "'Zen Kaku Gothic New', sans-serif", fontWeight: 700, background: "linear-gradient(90deg, #f6d365, #fda085)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            インフラ・設備 フラッシュカード
          </h1>
          <div style={{ fontSize: 11, color: "#64748b", marginTop: 3 }}>
            {CARDS.length} kartu · {JAC_OFFICIAL.length} soal JAC · {WAYGROUND_SETS.length} set Wayground · v87
          </div>
          <div style={{ fontSize: 10, color: "#64748b", marginTop: 2, letterSpacing: 1.2 }}>
            by Nugget Nihongo
          </div>
        </div>
        {/* Live progress pill — hidden at 0% */}
        {headerPct !== null && headerPct > 0 && (
          <div style={{
            background: headerPct >= 70 ? "rgba(56,178,172,0.18)" : headerPct >= 40 ? "rgba(246,173,85,0.18)" : "rgba(255,255,255,0.07)",
            border: `1px solid ${headerPct >= 70 ? "rgba(104,211,145,0.5)" : headerPct >= 40 ? "rgba(246,173,85,0.4)" : "rgba(255,255,255,0.12)"}`,
            borderRadius: 20, padding: "4px 10px",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 1,
            flexShrink: 0,
          }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: headerPct >= 70 ? "#68d391" : headerPct >= 40 ? "#f6ad55" : "#718096", lineHeight: 1 }}>{headerPct}%</span>
            <span style={{ fontSize: 8, color: "#4a5568", letterSpacing: 0.5 }}>hafal</span>
          </div>
        )}
      </div>

      {/* TAB BAR — 4 section tabs */}
      <div style={{ padding: "10px 14px 0", maxWidth: 560, margin: "0 auto" }}>
        <div style={{ display: "flex", gap: 4 }}>
          {[
            { key: "belajar",   label: "🃏 Belajar"   },
            { key: "ujian",     label: "📋 Ujian" },
            { key: "referensi", label: "📖 Referensi" },
            { key: "progres",   label: "📊 Progres"   },
          ].map(tab => {
            const isActive = activeSection === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => {
                  setActiveSection(tab.key);
                  if (tab.key === "progres")   setMode("stats");
                  else if (tab.key === "ujian")     setMode("jac");
                  else if (tab.key === "referensi") setMode("glos");
                  else if (tab.key === "belajar")   setMode("kartu");
                }}
                style={{
                  fontFamily: "inherit",
                  flex: 1,
                  padding: "10px 6px",
                  fontSize: 11,
                  fontWeight: 700,
                  borderRadius: "10px 10px 0 0",
                  background: isActive ? "rgba(255,255,255,0.1)" : "transparent",
                  border: isActive ? "1px solid rgba(255,255,255,0.15)" : "1px solid transparent",
                  borderBottom: isActive ? "2px solid transparent" : "1px solid rgba(255,255,255,0.08)",
                  color: isActive ? "#e2e8f0" : "#94a3b8",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  whiteSpace: "nowrap",
                  opacity: isActive ? 1 : 0.5,
                }}
              >{tab.label}</button>
            );
          })}
        </div>

        {/* SUB-MENU PANEL — hidden for progres */}
        {activeSection !== "progres" && (
        <div style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.13)", borderTop: "none", borderRadius: "0 0 14px 14px", padding: "8px" }}>
          {activeSection === "belajar" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

              {/* ── TRACK TOGGLE — pill segmented control ── */}
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.8, color: "#475569", textTransform: "uppercase", marginBottom: 6, paddingLeft: 2 }}>Materi</div>
                <div style={{ display: "flex", background: "rgba(0,0,0,0.3)", borderRadius: 12, padding: 3, gap: 3, border: "1px solid rgba(255,255,255,0.07)" }}>
                  {[
                    { key: false, icon: "🏗️", label: "Konsep", count: KONSEP_BASE_CARDS.length, accent: "#93c5fd", grad: "linear-gradient(135deg,#1e3a5f,#2563eb)" },
                    { key: true,  icon: "📖", label: "Vocab",   count: VOCAB_CARD_COUNT, accent: "#6ee7b7", grad: "linear-gradient(135deg,#064e3b,#059669)" },
                  ].map((t) => {
                    const on = vocabTrack === t.key;
                    return (
                      <button key={String(t.key)}
                        onClick={() => { setVocabTrack(t.key); setActiveCategories(new Set(["all"])); }}
                        style={{ fontFamily: "inherit",
                          flex: 1, padding: "8px 10px", borderRadius: 9, cursor: "pointer",
                          background: on ? t.grad : "transparent",
                          border: on ? `1px solid ${t.accent}44` : "1px solid transparent",
                          color: on ? "#fff" : "#475569",
                          transition: "all 0.2s",
                          boxShadow: on ? `0 2px 12px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)` : "none",
                          display: "flex", alignItems: "center", gap: 8,
                        }}>
                        <span style={{ fontSize: 16, lineHeight: 1, filter: on ? "none" : "grayscale(1)", transition: "filter 0.2s" }}>{t.icon}</span>
                        <div style={{ textAlign: "left" }}>
                          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.2, lineHeight: 1.2 }}>{t.label}</div>
                          <div style={{ fontSize: 9, color: on ? t.accent : "#334155", marginTop: 2, fontFamily: "monospace", letterSpacing: 0.5 }}>{t.count} kartu</div>
                        </div>
                        {on && <span style={{ marginLeft: "auto", width: 6, height: 6, borderRadius: "50%", background: t.accent, boxShadow: `0 0 6px ${t.accent}` }} />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── MODE GRID — 2×2 with descriptions ── */}
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.8, color: "#475569", textTransform: "uppercase", marginBottom: 6, paddingLeft: 2 }}>Mode Belajar</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
                  {[
                    { key: "kartu",  icon: "🃏", label: "Kartu",       desc: "Belajar mandiri",  grad: "linear-gradient(135deg,#b45309,#d97706)", glow: "rgba(217,119,6,0.35)",  accent: "#fbbf24" },
                    { key: "kuis",   icon: "📝", label: "Kuis",         desc: "4 pilihan · acak", grad: "linear-gradient(135deg,#4338ca,#7c3aed)", glow: "rgba(124,58,237,0.35)", accent: "#a78bfa" },
                    { key: "sprint", icon: "⚡", label: "Sprint",       desc: "Jawab cepat",      grad: "linear-gradient(135deg,#6d28d9,#9333ea)", glow: "rgba(147,51,234,0.35)", accent: "#c084fc" },
                    { key: "fokus",  icon: "🎯", label: "Fokus Lemah",  desc: "Kartu terlemah",   grad: "linear-gradient(135deg,#991b1b,#dc2626)", glow: "rgba(220,38,38,0.35)",  accent: "#f87171", hide: vocabTrack },
                  ].map((m) => {
                    if (m.hide) return null;
                    const on = mode === m.key;
                    return (
                      <button key={m.key} onClick={() => setMode(m.key)}
                        style={{ fontFamily: "inherit",
                          padding: "11px 10px", borderRadius: 12, cursor: "pointer",
                          background: on ? m.grad : "rgba(255,255,255,0.04)",
                          border: on ? `1px solid ${m.accent}44` : "1px solid rgba(255,255,255,0.08)",
                          color: on ? "#fff" : "#475569",
                          transition: "all 0.2s",
                          boxShadow: on ? `0 4px 16px ${m.glow}, inset 0 1px 0 rgba(255,255,255,0.15)` : "none",
                          display: "flex", alignItems: "center", gap: 10,
                          textAlign: "left",
                        }}>
                        <span style={{
                          fontSize: 22, lineHeight: 1, flexShrink: 0,
                          filter: on ? "drop-shadow(0 0 4px rgba(255,255,255,0.4))" : "grayscale(0.7) brightness(0.6)",
                          transition: "filter 0.2s",
                        }}>{m.icon}</span>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.2, lineHeight: 1.2, color: on ? "#fff" : "#64748b" }}>{m.label}</div>
                          <div style={{ fontSize: 9, marginTop: 2, color: on ? m.accent : "#334155", letterSpacing: 0.3 }}>{m.desc}</div>
                        </div>
                        {on && <span style={{ marginLeft: "auto", fontSize: 8, color: m.accent, flexShrink: 0 }}>▶</span>}
                      </button>
                    );
                  })}
                  {/* Spacer if fokus hidden (vocabTrack on) to keep grid balanced */}
                  {vocabTrack && <div />}
                </div>
              </div>

            </div>
          )}

          {activeSection === "ujian" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>

              {/* ── MODE GRID — 2×2 exam cards ── */}
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.8, color: "#475569", textTransform: "uppercase", marginBottom: 6, paddingLeft: 2 }}>Mode Ujian</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
                  {[
                    { key: "jac",      icon: "📋", label: "JAC Official", desc: "Soal resmi · shuffle",    grad: "linear-gradient(135deg,#991b1b,#e53e3e)", glow: "rgba(229,62,62,0.35)",  accent: "#fc8181" },
                    { key: "simulasi", icon: "🎯", label: "Simulasi",      desc: "Ujian penuh mock",       grad: "linear-gradient(135deg,#702459,#d53f8c)", glow: "rgba(213,63,140,0.35)", accent: "#f687b3" },
                    { key: "jebak",    icon: "⚠️", label: "Soal Jebak",   desc: "Istilah mirip · trap",   grad: "linear-gradient(135deg,#c05621,#ed8936)", glow: "rgba(237,137,54,0.35)", accent: "#fbd38d" },
                    { key: "wayground",icon: "🔧", label: "Wayground",     desc: `${WAYGROUND_SETS.length} set teknis`,  grad: "linear-gradient(135deg,#1a365d,#1d4ed8)", glow: "rgba(29,78,216,0.35)", accent: "#93c5fd" },
                  ].map((m) => {
                    const on = mode === m.key;
                    return (
                      <button key={m.key} onClick={() => setMode(m.key)}
                        style={{ fontFamily: "inherit",
                          padding: "11px 10px", borderRadius: 12, cursor: "pointer",
                          background: on ? m.grad : "rgba(255,255,255,0.04)",
                          border: on ? `1px solid ${m.accent}44` : "1px solid rgba(255,255,255,0.08)",
                          color: on ? "#fff" : "#475569",
                          transition: "all 0.2s",
                          boxShadow: on ? `0 4px 16px ${m.glow}, inset 0 1px 0 rgba(255,255,255,0.15)` : "none",
                          display: "flex", alignItems: "center", gap: 10,
                          textAlign: "left",
                        }}>
                        <span style={{
                          fontSize: 22, lineHeight: 1, flexShrink: 0,
                          filter: on ? "drop-shadow(0 0 4px rgba(255,255,255,0.4))" : "grayscale(0.7) brightness(0.6)",
                          transition: "filter 0.2s",
                        }}>{m.icon}</span>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.2, lineHeight: 1.2, color: on ? "#fff" : "#64748b" }}>{m.label}</div>
                          <div style={{ fontSize: 9, marginTop: 2, color: on ? m.accent : "#334155", letterSpacing: 0.3 }}>{m.desc}</div>
                        </div>
                        {on && <span style={{ marginLeft: "auto", fontSize: 8, color: m.accent, flexShrink: 0 }}>▶</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {activeSection === "referensi" && (
            <div>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.8, color: "#475569", textTransform: "uppercase", marginBottom: 6, paddingLeft: 2 }}>Referensi</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
              {[
                { key: "glos",   icon: "📖", label: "Glosari",  desc: "Semua kosakata",  grad: "linear-gradient(135deg,#7c3aed,#553c9a)", glow: "rgba(124,58,237,0.35)", accent: "#c4b5fd" },
                { key: "angka",  icon: "🔢", label: "Angka",    desc: "Angka kunci ujian", grad: "linear-gradient(135deg,#0d9488,#2c7a7b)", glow: "rgba(56,178,172,0.35)", accent: "#81e6d9" },
                { key: "cari",   icon: "🔍", label: "Cari",     desc: "Cari kartu cepat",  grad: "linear-gradient(135deg,#b45309,#92400e)", glow: "rgba(217,119,6,0.35)", accent: "#fbbf24" },
                { key: "sumber", icon: "📑", label: "Sumber",   desc: "Browse per PDF",    grad: "linear-gradient(135deg,#1a365d,#4a6fa5)", glow: "rgba(74,111,165,0.35)", accent: "#93c5fd" },
              ].map(m => {
                const on = mode === m.key;
                return (
                  <button key={m.key} onClick={() => setMode(m.key)} style={{ fontFamily: "inherit",
                    padding: "11px 10px", borderRadius: 12, cursor: "pointer",
                    background: on ? m.grad : "rgba(255,255,255,0.04)",
                    border: on ? `1px solid ${m.accent}44` : "1px solid rgba(255,255,255,0.08)",
                    color: on ? "#fff" : "#475569",
                    transition: "all 0.2s",
                    boxShadow: on ? `0 4px 16px ${m.glow}, inset 0 1px 0 rgba(255,255,255,0.15)` : "none",
                    display: "flex", alignItems: "center", gap: 10,
                    textAlign: "left",
                  }}>
                    <span style={{
                      fontSize: 22, lineHeight: 1, flexShrink: 0,
                      filter: on ? "drop-shadow(0 0 4px rgba(255,255,255,0.4))" : "grayscale(0.7) brightness(0.6)",
                      transition: "filter 0.2s",
                    }}>{m.icon}</span>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: 0.2, lineHeight: 1.2, color: on ? "#fff" : "#64748b" }}>{m.label}</div>
                      <div style={{ fontSize: 9, marginTop: 2, color: on ? m.accent : "#334155", letterSpacing: 0.3 }}>{m.desc}</div>
                    </div>
                    {on && <span style={{ marginLeft: "auto", fontSize: 8, color: m.accent, flexShrink: 0 }}>▶</span>}
                  </button>
                );
              })}
              </div>
            </div>
          )}

        </div>
        )}
      </div>

      {/* ── CATEGORY FILTER — collapsible multi-select ── */}
      {(mode === "kartu" || mode === "kuis" || mode === "sprint") && (() => {
        const base = vocabTrack ? VOCAB_BASE_CARDS : KONSEP_BASE_CARDS;
        const isAll = activeCategories.has("all") || activeCategories.size === 0;
        const selectedCats = isAll ? [] : CATEGORIES.filter(c => c.key !== "all" && activeCategories.has(c.key));
        const totalFiltered = filteredCards.length;
        // Summary label
        let summaryLabel, summaryColor;
        if (isAll) {
          summaryLabel = "📚 すべて";
          summaryColor = "#94a3b8";
        } else if (selectedCats.length === 1) {
          summaryLabel = `${selectedCats[0].emoji} ${selectedCats[0].label}`;
          summaryColor = selectedCats[0].color;
        } else {
          summaryLabel = selectedCats.map(c => c.emoji).join(" ") + ` · ${selectedCats.length} kategori`;
          summaryColor = "#f6ad55";
        }
        return (
          <div style={{ padding: "8px 14px 2px", maxWidth: 560, margin: "0 auto" }}>
            {/* ── Filter bar ── */}
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              {/* Current filter chip */}
              <div style={{
                flex: 1, padding: "8px 14px", borderRadius: 12,
                background: isAll ? "rgba(255,255,255,0.06)" : `rgba(${summaryColor === "#f6ad55" ? "246,173,85" : "99,179,237"},0.1)`,
                border: `1.5px solid ${isAll ? "rgba(255,255,255,0.12)" : summaryColor + "55"}`,
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: isAll ? "#94a3b8" : "#e2e8f0", fontFamily: "'Noto Sans JP', sans-serif" }}>
                  {summaryLabel}
                </span>
                <span style={{ fontSize: 11, fontFamily: "monospace", color: "#64748b", flexShrink: 0, marginLeft: 8 }}>
                  {totalFiltered} kartu
                </span>
              </div>
              {/* Toggle filter button */}
              <button
                onClick={() => setFilterOpen(f => !f)}
                style={{
                  fontFamily: "inherit",
                  padding: "8px 12px", borderRadius: 12, fontSize: 12, fontWeight: 700,
                  background: filterOpen ? "rgba(99,179,237,0.15)" : "rgba(255,255,255,0.06)",
                  border: filterOpen ? "1.5px solid rgba(99,179,237,0.4)" : "1.5px solid rgba(255,255,255,0.12)",
                  color: filterOpen ? "#93c5fd" : "#64748b",
                  cursor: "pointer", transition: "all 0.18s",
                  display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                <span style={{ fontSize: 13 }}>⊞</span>
                <span>Filter</span>
                <span style={{ fontSize: 10, transition: "transform 0.2s", display: "inline-block", transform: filterOpen ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
              </button>
            </div>

            {/* ── Expanded filter panel ── */}
            {filterOpen && (
              <div style={{
                marginTop: 8, padding: "10px", borderRadius: 14,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
              }}>
                {/* すべて reset */}
                <button
                  onClick={() => { setActiveCategories(new Set(["all"])); }}
                  style={{
                    width: "100%", marginBottom: 8, padding: "8px 14px", fontSize: 12, fontWeight: 700,
                    borderRadius: 10, fontFamily: "'Noto Sans JP', sans-serif", cursor: "pointer",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    background: isAll ? "rgba(74,85,104,0.4)" : "rgba(255,255,255,0.04)",
                    border: isAll ? "2px solid rgba(113,128,150,0.7)" : "1px solid rgba(255,255,255,0.1)",
                    color: isAll ? "#e2e8f0" : "#64748b",
                    transition: "all 0.15s",
                  }}
                >
                  <span style={{ fontSize: 14 }}>📚 すべて</span>
                  <span style={{ fontFamily: "monospace", fontSize: 11, opacity: 0.65 }}>{base.length}</span>
                </button>
                {/* 3-col category grid */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 5 }}>
                  {CATEGORIES.slice(1).map(cat => {
                    const count = cat.key === "bintang"
                      ? base.filter(c => starred.has(c.id)).length
                      : base.filter(c => c.category === cat.key).length;
                    if (vocabTrack && count === 0 && cat.key !== "bintang") return null;
                    const on = activeCategories.has(cat.key);
                    return (
                      <button
                        key={cat.key}
                        onClick={() => toggleCategory(cat.key)}
                        style={{
                          padding: "8px 6px 7px", borderRadius: 10,
                          fontFamily: "'Noto Sans JP', sans-serif", cursor: "pointer",
                          display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                          background: on ? `${cat.color}44` : "rgba(255,255,255,0.04)",
                          border: on ? `2px solid ${cat.color}cc` : "1px solid rgba(255,255,255,0.09)",
                          color: on ? "#e2e8f0" : "#64748b",
                          transition: "all 0.15s",
                          boxShadow: on ? `0 2px 8px ${cat.color}33` : "none",
                          position: "relative",
                        }}
                      >
                        {on && (
                          <span style={{ position: "absolute", top: 4, right: 5, fontSize: 8, color: "#e2e8f0", opacity: 0.9 }}>✓</span>
                        )}
                        <span style={{ fontSize: 17, lineHeight: 1 }}>{cat.emoji}</span>
                        <span style={{ fontSize: 9, fontWeight: 700, textAlign: "center", lineHeight: 1.3, letterSpacing: 0.2 }}>{cat.label}</span>
                        <span style={{ fontSize: 9, fontFamily: "monospace", opacity: 0.55 }}>{count}</span>
                      </button>
                    );
                  })}
                </div>
                {/* Terapkan / close */}
                {!isAll && (
                  <button
                    onClick={() => setFilterOpen(false)}
                    style={{
                      fontFamily: "inherit",
                      marginTop: 8, width: "100%", padding: "9px", fontSize: 12, fontWeight: 700, borderRadius: 10,
                      background: "linear-gradient(135deg,#f6d365,#fda085)", border: "none",
                      color: "#1a1a2e", cursor: "pointer",
                    }}
                  >
                    ✓ Terapkan {selectedCats.length} kategori ({totalFiltered} kartu)
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })()}

      {/* CONTENT */}
      {mode === "kartu"    && <FlashcardMode key={`fc-${[...activeCategories].sort().join('-')}-${vocabTrack}`} cards={filteredCards} known={known} setKnown={setKnown} unknown={unknown} setUnknown={setUnknown} starred={starred} toggleStar={toggleStar} />}
      {mode === "kuis"     && <QuizMode key={`kuis-${[...activeCategories].sort().join('-')}-${vocabTrack}`} cards={filteredCards} allCards={vocabTrack ? VOCAB_BASE_CARDS : CARDS} />}
      {mode === "jac"      && <JACMode />}
      {mode === "angka"    && <AngkaMode key="angka" />}
      {mode === "jebak"    && <DangerMode key="jebak" />}
      {mode === "simulasi" && <SimulasiMode key="simulasi" />}
      {mode === "stats"    && <StatsMode key="stats" known={known} unknown={unknown} />}
      {mode === "cari"     && <SearchMode key="cari" />}
      {mode === "sprint"   && <SprintMode key={`sprint-${[...activeCategories].sort().join('-')}-${vocabTrack}`} cards={filteredCards} />}
      {mode === "fokus"    && <FocusMode key="fokus" />}
      {mode === "glos"     && <GlossaryMode key="glos" />}
      {mode === "wayground" && <WaygroundMode key="wayground" sets={WAYGROUND_SETS} />}
      {mode === "sumber"   && <SumberMode key="sumber" onBrowse={(src) => { setActiveCategories(new Set(["all"])); setVocabTrack(false); setMode("kartu"); }} />}
    </div>
  );
}

// ─── CHANGELOG (compact) ────────────────────────────────────────────────
// ─── CHANGELOG (compact) ────────────────────────────────────────────────────
// v34-v42: UI/UX audit, content fixes, tab-bar nav redesign
// v51-v56: Referensi UI, sub-nav premium redesign, touch swipe, +250 vocab_exam, keyboard shortcuts
// v57-v60: jpFontSize() adaptive, JpFront/DescBlock smart rendering, FlashcardMode overhaul
// v62-v64a: React hooks-order fix, deep audit (16+16 fixes), layout/typography, confirm() sandbox fix
// v65-v66: +4 Wayground quiz sets (62qs), +74 lifeline4 vocab cards, +3 Wayground vocab sets (99qs)
// v67: Exhaustive UI/UX consistency audit (30+ fixes across all modes)
// v72: Quiz format overhaul (furigana/🇮🇩 auto-reveal), Wayground edge cases, hint hygiene (129 replacements)
// v73: Deep hygiene — 260 JAC furigana, 224 ✓ removals, 12 orphan category fixes, extractReadings() expanded
// v74: Codex audit patch — SearchMode c.furi cleanup, DescBlock ⑪-⑮ tokenizer, hint text alignment
// v75: Changelog compacted (90→10 lines)
// v76: Review screen redesign — consistent readable cards across Quiz/JAC/Wayground results; progress bars 6→4px
// v77: End result screens unified to Wayground style; pickedAnswers tracking in JAC/Jebak/Simulasi → red highlight wrong pick
// v78: QuizMode anti-repeat shuffler (seenPoolRef — no repeat until all cards seen); 3 difficulty levels Easy/Medium/Hard (distractor logic per category); Simulasi question order fixed (no shuffle, options-only shuffle retained)
// v79: stripFuri upgraded — pure-kana-only strip (preserves semantic （石綿）（NFB）（SGP）etc); applied to 6 raw render sites: QuizMode opt.jp, AngkaMode relCard.jp, SprintMode list, FocusMode, SearchMode, GlossaryMode collapsed
// v80: stripFuri smarter validator — handles kana+slash (ぎのうし/ぎのうけんてい) and kana+vs (たんたいきてい vs しゅうだんきてい) edge cases; katakana content always kept; DescBlock: inline ①②③ refs no longer create phantom items; new 【keyword】 list format (38 entries)
// v83: Fix Praktik ordering (wg10→after wg5), wg7+wg8 24→25q, furigana on all 598 WG questions+opts (CSV+word-dict)
// v84: +35 vocab_teori cards (IDs 1393-1427): 法規・安全管理・施工管理・設備ライフライン clusters; +wg12 Vocab Teori 22qs; hygiene: 12 romaji space/typo fixes (id:952,953,954,960,962,968,981,992,1026-1029); vocab_teori wired into VOCAB_SOURCES, SOURCE_META, ACCENT, GROUPS
// v85: +18 vocab aisatsu (IDs 1428-1445, salam category, source: vocab_jac) — おはようございます/よろしく/了解 etc.; hygiene: 15 romaji bugs fixed across lifeline4+vocab_jac+vocab_core+vocab_exam (omo na→omona, busshing→busshingu, ba a cha a to→baachaato, etc.); id:1281 restored after accidental sed deletion
// v86: +40 JAC gap cards (IDs 1446-1485): ほうれんそう(5) + 職場マナー(5) + 体調管理(4) + 残業/明細(3) + 特定技能/在留(6) + 社会保険(5) + APD詳細(6) + CCUS/技能レベル(2) + 空調室外機/室内機/フレア/ドレン(4); hygiene FINAL: 6 romaji bugs fixed (hoonzai/hoontou/hoontai/anzentai/aentessen/guriin fairu) → 0 romaji issues confirmed
// v88: LOGIC UPGRADES — ①generateQuiz: medium=1same+2diff, hard=same-cat+weakDistr+quizWrongRef; ②startQuiz exhaustion→weak-first; ③FlashcardMode Acak→Prioritas smart-sort(unknown→untouched→known); ④StatsMode live known/unknown props, catStats worst-first sort, ✗N badge; v87: Wayground quiz deep audit — ①WRONG ANSWER FIXED: wt1 Q3 ans 2→1 (KY Step 4=目標宣言); ②CURRENCY FIX: wt4 Q3 500万円=5 juta yen; ③66 truncated explanations completed; CODE BUGS FIXED: BUG-01 header v83→v87, BUG-02 export _version v82→v87, BUG-03 dead-code 応用 check removed, BUG-04 wg12 double-render (vocabSets∩teoriSets), BUG-05/06 WaygroundResult grade.col+color#4a6080, BUG-07 qIdx-score→answers.filter negative counter, BUG-08 4-space indent, BUG-09 SearchMode romaji null-guard; HYGIENE: shuffleArr alias removed (all → shuffle)
