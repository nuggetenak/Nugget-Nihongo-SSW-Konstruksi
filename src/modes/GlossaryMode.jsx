// ─── GlossaryMode ───────────────────────────────────────────────────────────
// Alphabetically-sorted glossary of all terms, expandable by category.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { stripFuri, extractReadings } from "../utils/jp-helpers.js";
import { CARDS } from "../data/cards.js";
import { CATEGORIES, getCatInfo } from "../data/categories.js";

function GlossaryMode() {
  const [openCat, setOpenCat] = useState(null);
  const [openCard, setOpenCard] = useState(null);

  const CAT_META = {
    salam:        { label: "🙏 Salam & Ungkapan",       color: "#f6ad55", bg: "rgba(246,173,85," },
    hukum:        { label: "⚖️ Hukum & Regulasi",       color: "#90cdf4", bg: "rgba(144,205,244," },
    jenis_kerja:  { label: "🔨 Jenis Pekerjaan",        color: "#9ae6b4", bg: "rgba(154,230,180," },
    listrik:      { label: "⚡ Kelistrikan",             color: "#faf089", bg: "rgba(250,240,137," },
    telekomunikasi:{ label: "📡 Telekomunikasi",        color: "#76e4f7", bg: "rgba(118,228,247," },
    alat_umum:    { label: "🔧 Alat Umum",              color: "#d6bcfa", bg: "rgba(214,188,250," },
    pipa:         { label: "🪠 Pipa & Sanitasi",        color: "#81e6d9", bg: "rgba(129,230,217," },
    keselamatan:  { label: "🦺 Keselamatan (K3)",       color: "#fc8181", bg: "rgba(252,129,129," },
    karier:       { label: "📋 Karier & Manajemen",     color: "#b794f4", bg: "rgba(183,148,244," },
    pemadam:      { label: "🚒 Pemadam Kebakaran",      color: "#f97316", bg: "rgba(249,115,22," },
    isolasi:      { label: "🧱 Isolasi Termal",         color: "#f6ad55", bg: "rgba(246,173,85," },
  };

  const grouped = Object.keys(CAT_META)
    .map(cat => ({ cat, ...CAT_META[cat], cards: CARDS.filter(c => c.category === cat) }))
    .filter(g => g.cards.length > 0);

  return (
    <div style={{ padding: "0 16px 32px", maxWidth: 560, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#e2e8f0", letterSpacing: 0.3 }}>📖 Glosari Kosakata</div>
          <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{CARDS.length} entri · {grouped.length} kategori</div>
        </div>
        <div style={{ fontSize: 11, color: "#64748b", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "4px 10px" }}>
          tap → expand
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {grouped.map(({ cat, label, color, bg, cards }) => {
          const isOpen = openCat === cat;
          return (
            <div key={cat} style={{ borderRadius: 14, overflow: "hidden", boxShadow: isOpen ? `0 4px 20px rgba(0,0,0,0.25)` : "none", transition: "box-shadow 0.2s" }}>
              {/* ── Category header ── */}
              <div
                onClick={() => { setOpenCat(isOpen ? null : cat); setOpenCard(null); }}
                style={{
                  background: isOpen ? `${bg}0.16)` : `${bg}0.07)`,
                  borderRadius: isOpen ? "14px 14px 0 0" : 14,
                  border: `1px solid ${isOpen ? `${bg}0.5)` : `${bg}0.2)`}`,
                  padding: "13px 14px 13px 18px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  transition: "all 0.18s",
                  userSelect: "none",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* left accent strip */}
                <div style={{
                  position: "absolute", left: 0, top: 0, bottom: 0, width: 4,
                  background: color, opacity: isOpen ? 1 : 0.5, transition: "opacity 0.18s",
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color }}>{label}</div>
                </div>
                <div style={{
                  background: `${bg}0.2)`,
                  borderRadius: 20,
                  padding: "3px 11px",
                  fontSize: 12,
                  fontWeight: 700,
                  color,
                  flexShrink: 0,
                  border: `1px solid ${bg}0.35)`,
                }}>
                  {cards.length}
                </div>
                <div style={{ fontSize: 13, color, opacity: 0.6, flexShrink: 0, transition: "transform 0.18s", transform: isOpen ? "rotate(180deg)" : "none" }}>
                  ▼
                </div>
              </div>

              {/* ── Card list ── */}
              {isOpen && (
                <div style={{
                  background: `${bg}0.04)`,
                  border: `1px solid ${bg}0.5)`,
                  borderTop: "none",
                  borderRadius: "0 0 14px 14px",
                  overflow: "hidden",
                }}>
                  {cards.map((card, idx) => {
                    const isCardOpen = openCard === card.id;
                    return (
                      <div
                        key={card.id}
                        onClick={e => { e.stopPropagation(); setOpenCard(isCardOpen ? null : card.id); }}
                        style={{
                          padding: "12px 16px",
                          borderBottom: idx < cards.length - 1 ? `1px solid ${bg}0.12)` : "none",
                          cursor: "pointer",
                          background: isCardOpen ? `${bg}0.12)` : "transparent",
                          transition: "background 0.15s",
                          minHeight: 44,
                        }}
                      >
                        {/* row: jp + id_text + arrow */}
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                              fontSize: 15,
                              fontFamily: "'Zen Kaku Gothic New','Noto Sans JP',sans-serif",
                              fontWeight: 700,
                              color,
                              marginBottom: 2,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}>
                              {stripFuri(card.jp)}
                            </div>
                            <div style={{
                              fontSize: 13,
                              color: "#94a3b8",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}>
                              {card.id_text}
                            </div>
                          </div>
                          <div style={{ fontSize: 12, color, opacity: 0.5, flexShrink: 0, transition: "transform 0.15s", transform: isCardOpen ? "rotate(180deg)" : "none" }}>
                            ▼
                          </div>
                        </div>

                        {/* expanded detail */}
                        {isCardOpen && (
                          <div style={{
                            marginTop: 10,
                            paddingTop: 10,
                            borderTop: "1px solid rgba(255,255,255,0.08)",
                          }}>
                            <div style={{ fontSize: 11, color: "#64748b", marginBottom: 5 }}>
                              #{card.id} · {card.category}
                            </div>
                            <div style={{
                              fontSize: 24,
                              fontFamily: "'Zen Kaku Gothic New','Noto Sans JP',sans-serif",
                              fontWeight: 700,
                              color,
                              marginBottom: 4,
                              lineHeight: 1.3,
                            }}>
                              {card.jp}
                            </div>
                            <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 6, fontStyle: "italic" }}>
                              {card.romaji}
                            </div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: "#93c5fd", marginBottom: 8 }}>
                              {card.id_text}
                            </div>
                            <div style={{ fontSize: 13, lineHeight: 1.75, color: "#cbd5e1" }}>
                              <DescBlock text={card.desc} />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}



export default GlossaryMode;
