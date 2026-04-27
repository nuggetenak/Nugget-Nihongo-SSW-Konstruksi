// ─── FlashcardMode ──────────────────────────────────────────────────────────
// Swipeable flashcard viewer with known/unknown marking, priority sort, and search.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback, useRef } from "react";
import { shuffle } from "../utils/shuffle.js";
import { getCatInfo } from "../data/categories.js";
import { JpFront, DescBlock } from "../components/JpDisplay.jsx";

function FlashcardMode({ cards, known, setKnown, unknown, setUnknown, starred = new Set(), toggleStar = () => {} }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [showDesc, setShowDesc] = useState(false);
  const [cardOrder, setCardOrder] = useState([]);
  const [search, setSearch] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);

  // Reset deck when key changes (handled by key prop) OR when card count changes
  const cardsLen = cards.length;
  useEffect(() => {
    setCardOrder([]);
    setCurrentIndex(0); setFlipped(false); setShowDesc(false); setSearch("");
  }, [cardsLen]);

  const baseCards = cardOrder.length === cards.length && cardOrder.length > 0
    ? cardOrder.map(i => cards[i]) : cards;
  const displayCards = search.trim() ? baseCards.filter(c =>
    c.jp.includes(search) ||
    (c.romaji || "").toLowerCase().includes(search.toLowerCase()) ||
    c.id_text.toLowerCase().includes(search.toLowerCase())
  ) : baseCards;
  const card = displayCards[Math.min(currentIndex, Math.max(0, displayCards.length - 1))];
  if (!card) return null;

  const catInfo = getCatInfo(card.category);
  const progress = ((currentIndex + 1) / displayCards.length) * 100;

  const handleNext = useCallback(() => {
    setFlipped(false); setShowDesc(false);
    if (currentIndex < displayCards.length - 1) { setCurrentIndex(i => i + 1); }
  }, [currentIndex, displayCards.length]);
  const handlePrev = useCallback(() => {
    setFlipped(false); setShowDesc(false);
    if (currentIndex > 0) { setCurrentIndex(i => i - 1); }
  }, [currentIndex]);

  useEffect(() => {
    const h = (e) => {
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === " " || e.key === "ArrowUp") { e.preventDefault(); setFlipped(f => !f); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [handleNext, handlePrev]);

  const markKnown = () => {
    setKnown(s => new Set([...s, card.id]));
    setUnknown(s => { const ns = new Set(s); ns.delete(card.id); return ns; });
    handleNext();
  };
  const markUnknown = () => {
    setUnknown(s => new Set([...s, card.id]));
    setKnown(s => { const ns = new Set(s); ns.delete(card.id); return ns; });
    handleNext();
  };

  const statusBorder = known.has(card.id) ? "2px solid #22c55e" : unknown.has(card.id) ? "2px solid #ef4444" : "2px solid rgba(255,255,255,0.15)";
  const unknownCards = displayCards.filter(c => unknown.has(c.id));

  // Per-view counts (filtered to displayCards only, not global Set size)
  const knownInView = displayCards.filter(c => known.has(c.id)).length;
  const unknownInView = displayCards.filter(c => unknown.has(c.id)).length;

  return (
    <>
      {/* ── SEARCH + STAR ── */}
      <div style={{ display: "flex", gap: 8, padding: "0 16px 10px", maxWidth: 560, margin: "0 auto" }}>
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setCurrentIndex(0); }}
          placeholder="🔍 Cari JP / romaji / ID..."
          style={{ flex: 1, padding: "9px 14px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.3)", color: "#e2e8f0", fontSize: 13, fontFamily: "inherit", outline: "none" }}
        />
        <button onClick={() => { if(card) toggleStar(card.id); }} style={{ fontFamily: "inherit",
          padding: "9px 14px", borderRadius: 12, fontSize: 16, fontWeight: 700,
          border: `1px solid ${starred.has(card?.id) ? "rgba(251,191,36,0.5)" : "rgba(255,255,255,0.1)"}`,
          background: starred.has(card?.id) ? "rgba(251,191,36,0.15)" : "rgba(0,0,0,0.2)",
          color: starred.has(card?.id) ? "#fbbf24" : "#475569", cursor: "pointer", lineHeight: 1,
        }}>{starred.has(card?.id) ? "⭐" : "☆"}</button>
      </div>

      {/* ── STATS BAR ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, padding: "0 16px 10px", maxWidth: 560, margin: "0 auto" }}>
        {[
          { label: "Total",  val: displayCards.length,                                   col: "#94a3b8", bg: "rgba(148,163,184,0.08)" },
          { label: "Hafal",  val: knownInView,                                            col: "#4ade80", bg: "rgba(74,222,128,0.08)"  },
          { label: "Belum",  val: unknownInView,                                          col: "#f87171", bg: "rgba(248,113,113,0.08)" },
          { label: "Sisa",   val: displayCards.length - knownInView - unknownInView,      col: "#fbbf24", bg: "rgba(251,191,36,0.08)"  },
        ].map(s => (
          <div key={s.label} style={{ textAlign: "center", background: s.bg, borderRadius: 12, padding: "10px 4px", border: `1px solid ${s.col}18` }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: s.col, lineHeight: 1, letterSpacing: -0.5 }}>{s.val}</div>
            <div style={{ fontSize: 10, color: s.col, opacity: 0.65, marginTop: 3, letterSpacing: 0.3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── PROGRESS ── */}
      <div style={{ padding: "0 16px 10px", maxWidth: 560, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#475569", marginBottom: 6 }}>
          <span>{currentIndex + 1} / {displayCards.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg, #f6d365, #fda085)", borderRadius: 99, transition: "width 0.3s" }} />
        </div>
      </div>

      {/* ── CARD ── */}
      <div style={{ padding: "0 16px 10px", maxWidth: 560, margin: "0 auto" }}>
        <div
          onClick={() => { setFlipped(f => !f); if (!flipped) setShowDesc(false); }}
          onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; touchStartY.current = e.touches[0].clientY; }}
          onTouchEnd={(e) => {
            if (touchStartX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchStartX.current;
            const dy = e.changedTouches[0].clientY - touchStartY.current;
            touchStartX.current = null; touchStartY.current = null;
            if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 35) {
              e.preventDefault();
              if (dx > 0) handlePrev(); else handleNext();
            } else if (dy < -35 && Math.abs(dy) > Math.abs(dx)) {
              e.preventDefault();
              setFlipped(f => !f); if (!flipped) setShowDesc(false);
            }
          }}
          style={{
            width: "100%", minHeight: 230,
            background: flipped ? `linear-gradient(135deg, ${catInfo.color}cc, ${catInfo.color}77)` : "rgba(255,255,255,0.07)",
            backdropFilter: "blur(12px)", borderRadius: 20,
            border: flipped ? `1.5px solid ${catInfo.color}99` : statusBorder,
            cursor: "pointer", padding: "36px 26px 28px",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            position: "relative", transition: "background 0.3s, border 0.3s, box-shadow 0.3s",
            boxShadow: flipped ? `0 8px 32px ${catInfo.color}33` : "0 4px 20px rgba(0,0,0,0.35)",
          }}>

          {/* category badge */}
          <div style={{ position: "absolute", top: 12, left: 14, background: `${catInfo.color}bb`, padding: "3px 10px", borderRadius: 10, fontSize: 10, fontFamily: "'Noto Sans JP', sans-serif", color: "#fff", letterSpacing: 0.3 }}>
            {catInfo.emoji} {catInfo.label}
          </div>

          {/* status dot */}
          {(known.has(card.id) || unknown.has(card.id)) && (
            <div style={{ position: "absolute", top: 14, right: 16, fontSize: 14 }}>
              {known.has(card.id) ? "✅" : "🔴"}
            </div>
          )}

          {/* card id */}
          <div style={{ position: "absolute", bottom: 12, right: 14, fontSize: 10, color: "#334155" }}>#{card.id}</div>

          {!flipped ? (
            <div style={{ textAlign: "center", width: "100%" }}>
              <JpFront text={card.jp} />
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 12, letterSpacing: 0.5 }}>{card.romaji}</div>
              <div style={{ fontSize: 10, color: "#64748b", marginTop: 12, letterSpacing: 1, opacity: 0.5 }}>ketuk = balik · geser = next</div>
            </div>
          ) : (
            <div style={{ textAlign: "center", width: "100%" }}>
              <div style={{ fontSize: 11, color: catInfo.color, marginBottom: 8, letterSpacing: 1, fontWeight: 700 }}>{card.romaji}</div>
              <div style={{ fontSize: card.id_text.length > 30 ? 17 : 20, fontWeight: 700, marginBottom: 12, fontFamily: "'Noto Sans JP', sans-serif", lineHeight: 1.35, color: "#f1f5f9" }}>{card.id_text}</div>
              {showDesc ? (
                <div style={{ background: "rgba(0,0,0,0.22)", borderRadius: 12, padding: "12px 14px", marginTop: 4, textAlign: "left" }}>
                  <DescBlock text={card.desc} />
                </div>
              ) : (
                <button onClick={(e) => { e.stopPropagation(); setShowDesc(true); }} style={{ fontFamily: "inherit",
                  marginTop: 8, padding: "10px 22px", fontSize: 12, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 20, color: "rgba(255,255,255,0.85)", cursor: "pointer",
                }}>📖 Lihat penjelasan</button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── NAVIGATION ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, padding: "0 16px 8px", maxWidth: 560, margin: "0 auto" }}>
        <button onClick={handlePrev} disabled={currentIndex === 0} style={{ fontFamily: "inherit",
          padding: "13px 6px", fontSize: 13, borderRadius: 14,
          background: currentIndex === 0 ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.09)", color: currentIndex === 0 ? "#475569" : "#94a3b8",
          cursor: currentIndex === 0 ? "default" : "pointer", fontWeight: 600,
        }}>← Prev</button>
        <button onClick={() => setFlipped(f => !f)} style={{ fontFamily: "inherit",
          padding: "13px 6px", fontSize: 13, borderRadius: 14,
          background: "linear-gradient(135deg, #f6d365, #fda085)", border: "none",
          color: "#1a1a2e", fontWeight: 800, cursor: "pointer",
        }}>{flipped ? "🔄 Balik" : "👁 Lihat"}</button>
        <button onClick={handleNext} disabled={currentIndex === displayCards.length - 1} style={{ fontFamily: "inherit",
          padding: "13px 6px", fontSize: 13, borderRadius: 14,
          background: currentIndex === displayCards.length - 1 ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.08)",
          border: "1px solid rgba(255,255,255,0.09)", color: currentIndex === displayCards.length - 1 ? "#475569" : "#94a3b8",
          cursor: currentIndex === displayCards.length - 1 ? "default" : "pointer", fontWeight: 600,
        }}>Next →</button>
      </div>

      {/* ── MARK BUTTONS ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, padding: "0 16px 8px", maxWidth: 560, margin: "0 auto" }}>
        <button onClick={markUnknown} style={{ fontFamily: "inherit",
          padding: "13px", fontSize: 13, borderRadius: 14,
          background: "rgba(248,113,113,0.1)", border: "1.5px solid rgba(248,113,113,0.35)",
          color: "#f87171", cursor: "pointer", fontWeight: 700,
        }}>✗ Belum hafal</button>
        <button onClick={markKnown} style={{ fontFamily: "inherit",
          padding: "13px", fontSize: 13, borderRadius: 14,
          background: "rgba(74,222,128,0.1)", border: "1.5px solid rgba(74,222,128,0.35)",
          color: "#4ade80", cursor: "pointer", fontWeight: 700,
        }}>✓ Sudah hafal</button>
      </div>

      {/* ── UTILITY ROW ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, padding: "0 16px 20px", maxWidth: 560, margin: "0 auto" }}>
        {[
          { icon: "🎯", label: "Prioritas", action: () => {
            // Smart sort: unknown first → untouched → known, shuffled within each group
            const byStatus = (c) => unknown.has(c.id) ? 0 : known.has(c.id) ? 2 : 1;
            const withIdx  = shuffle(cards.map((c, i) => ({ c, i })));
            withIdx.sort((a, b) => byStatus(a.c) - byStatus(b.c)); // stable: keeps shuffle within group
            setCardOrder(withIdx.map(({ i }) => i));
            setCurrentIndex(0); setFlipped(false); setShowDesc(false);
          }},
          { icon: "⏮", label: "Urut",   action: () => { setCardOrder(cards.map((_,i) => i)); setCurrentIndex(0); setFlipped(false); setShowDesc(false); } },
          { icon: "🔄", label: confirmReset ? "Yakin?" : "Reset", action: () => { if (confirmReset) { setKnown(new Set()); setUnknown(new Set()); setConfirmReset(false); } else { setConfirmReset(true); setTimeout(() => setConfirmReset(false), 3000); } }, accent: confirmReset },
          { icon: "🔁", label: `❌ ${unknownCards.length}`, action: () => { if (unknownCards.length > 0) { setCardOrder(unknownCards.map(c => cards.indexOf(c))); setCurrentIndex(0); setFlipped(false); setShowDesc(false); } }, accent: unknownCards.length > 0, disabled: unknownCards.length === 0 },
        ].map(b => (
          <button key={b.label} onClick={b.action} style={{ fontFamily: "inherit",
            padding: "10px 4px", fontSize: 10, borderRadius: 12,
            background: b.accent ? "rgba(248,113,113,0.1)" : "rgba(255,255,255,0.05)",
            border: b.accent ? "1px solid rgba(248,113,113,0.25)" : "1px solid rgba(255,255,255,0.08)",
            color: b.accent ? "#f87171" : "#64748b", cursor: b.disabled ? "default" : "pointer",
            opacity: b.disabled ? 0.3 : 1, pointerEvents: b.disabled ? "none" : "auto",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
          }}>
            <span style={{ fontSize: 16 }}>{b.icon}</span>
            <span style={{ lineHeight: 1.2 }}>{b.label}</span>
          </button>
        ))}
      </div>
    </>
  );
}

export default FlashcardMode;
