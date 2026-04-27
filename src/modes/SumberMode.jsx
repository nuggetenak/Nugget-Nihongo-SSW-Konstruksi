// ─── SumberMode ─────────────────────────────────────────────────────────────
// Source browser — browse cards organized by their PDF/CSV source.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { CARDS } from "../data/cards.js";
import { SOURCE_META, SOURCE_GROUPS, SOURCE_ACCENT, getCatInfo } from "../data/categories.js";
import { DescBlock } from "../components/JpDisplay.jsx";

function SumberMode({ onBrowse }) {
  const [activeSrc, setActiveSrc] = useState(null);
  const [srcIdx, setSrcIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [viewMode, setViewMode] = useState("list"); // "list" or "card"
  const [openCard, setOpenCard] = useState(null);

  const srcCards = activeSrc ? CARDS.filter(c => c.source === activeSrc) : [];
  const card = srcCards[srcIdx];

  if (activeSrc && srcCards.length > 0) {
    const meta = SOURCE_META[activeSrc] || { label: activeSrc, emoji: "📄", color: "#4a5568" };
    const accent = {
      text1l:"#f97316",text2:"#22d3ee",text3:"#34d399",text4:"#a78bfa",
      text5l:"#fbbf24",text6l:"#f472b6",text7l:"#818cf8",
      tt_sample:"#ef4444",tt_sample2:"#ef4444",st_sample_l:"#10b981",st_sample2_l:"#10b981",
      lifeline4:"#60a5fa",vocab_jac:"#818cf8",vocab_core:"#94a3b8",vocab_exam:"#a78bfa",vocab_teori:"#f87171",
    }[activeSrc] || meta.color;

    return (
      <div style={{ padding: "0 16px 24px", maxWidth: 560, margin: "0 auto" }}>
        {/* header */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, background: "rgba(255,255,255,0.06)", borderRadius: 14, padding: "10px 14px", border: `1px solid ${accent}25` }}>
          <button onClick={() => { setActiveSrc(null); setSrcIdx(0); setFlipped(false); setOpenCard(null); }}
            style={{ fontFamily: "inherit", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", color: "#e2e8f0", fontSize: 14, cursor: "pointer", padding: "5px 11px", borderRadius: 9, fontWeight: 700, lineHeight: 1 }}>
            ←
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: accent, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{meta.emoji} {meta.label}</div>
            <div style={{ fontSize: 11, color: "#64748b", marginTop: 1 }}>{srcCards.length} kartu</div>
          </div>
          {/* view toggle */}
          <div style={{ display: "flex", background: "rgba(0,0,0,0.3)", borderRadius: 8, padding: 2, gap: 2 }}>
            {[
              { key: "list", icon: "☰" },
              { key: "card", icon: "🃏" },
            ].map(v => (
              <button key={v.key} onClick={() => setViewMode(v.key)} style={{
                fontFamily: "inherit", padding: "5px 10px", borderRadius: 6, fontSize: 12,
                background: viewMode === v.key ? `${accent}30` : "transparent",
                border: viewMode === v.key ? `1px solid ${accent}50` : "1px solid transparent",
                color: viewMode === v.key ? accent : "#475569", cursor: "pointer", fontWeight: 700,
              }}>{v.icon}</button>
            ))}
          </div>
        </div>

        {viewMode === "list" ? (
          /* ── LIST VIEW (scrollable like Glossary) ── */
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {srcCards.map((c, idx) => {
              const isOpen = openCard === c.id;
              return (
                <div key={c.id} onClick={() => setOpenCard(isOpen ? null : c.id)} style={{
                  padding: "12px 16px", borderRadius: 12, cursor: "pointer",
                  background: isOpen ? `${accent}12` : "rgba(255,255,255,0.04)",
                  border: `1px solid ${isOpen ? `${accent}40` : "rgba(255,255,255,0.08)"}`,
                  transition: "all 0.15s",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: 9, color: "#475569", fontFamily: "monospace", flexShrink: 0 }}>#{c.id}</span>
                      <span style={{ fontSize: 15, fontFamily: "'Zen Kaku Gothic New','Noto Sans JP',sans-serif", fontWeight: 700, color: "#e2e8f0" }}>{stripFuri(c.jp)}</span>
                    </div>
                    <span style={{ fontSize: 11, color: "#475569", transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s", flexShrink: 0 }}>▼</span>
                  </div>
                  {isOpen && (
                    <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${accent}20` }}>
                      <div style={{ fontSize: 11, color: accent, marginBottom: 4 }}>{c.romaji}</div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "#f1f5f9", marginBottom: 8 }}>{c.id_text}</div>
                      <div style={{ fontSize: 12, lineHeight: 1.7, color: "#94a3b8" }}>
                        <DescBlock text={c.desc} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* ── CARD VIEW (flashcard) ── */
          <>
            {/* progress bar */}
            <div style={{ height: 4, background: "rgba(255,255,255,0.07)", borderRadius: 99, marginBottom: 14, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${((srcIdx + 1) / srcCards.length) * 100}%`, background: `linear-gradient(90deg,${accent}88,${accent})`, borderRadius: 99, transition: "width 0.3s ease" }} />
            </div>
            <div style={{ fontSize: 11, color: "#64748b", textAlign: "center", marginBottom: 8 }}>Kartu {srcIdx + 1} / {srcCards.length}</div>

            {/* flashcard */}
            {card && (
              <div onClick={() => setFlipped(f => !f)} style={{
                borderRadius: 22, minHeight: 240,
                background: flipped
                  ? `linear-gradient(145deg,${accent}1a,rgba(255,255,255,0.04))`
                  : "rgba(255,255,255,0.06)",
                border: `1.5px solid ${accent}${flipped ? "50" : "20"}`,
                cursor: "pointer", padding: "28px 24px 22px",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                marginBottom: 12, transition: "all 0.22s",
                boxShadow: flipped ? `0 8px 32px ${accent}18` : "0 2px 12px rgba(0,0,0,0.2)",
              }}>
                {!flipped ? (
                  <div style={{ textAlign: "center", width: "100%" }}>
                    <JpFront text={card.jp} />
                    <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 10 }}>{card.romaji}</div>
                    <div style={{ fontSize: 9, color: "#475569", marginTop: 10, opacity: 0.6 }}>ketuk = balik · geser = next</div>
                  </div>
                ) : (
                  <div style={{ textAlign: "center", width: "100%" }}>
                    <div style={{ fontSize: 12, color: accent, marginBottom: 8, letterSpacing: 1, fontWeight: 700 }}>{card.romaji}</div>
                    <div style={{ fontSize: card.id_text.length > 25 ? 17 : 22, fontWeight: 800, color: "#f1f5f9", marginBottom: 14, lineHeight: 1.4 }}>{card.id_text}</div>
                    <div style={{ borderTop: `1px solid ${accent}20`, paddingTop: 14, textAlign: "left" }}>
                      <DescBlock text={card.desc} />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* nav */}
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => { setSrcIdx(i => Math.max(0, i-1)); setFlipped(false); }} disabled={srcIdx === 0}
                style={{ fontFamily: "inherit", flex: 1, padding: "14px", borderRadius: 13, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: srcIdx === 0 ? "#475569" : "#94a3b8", cursor: srcIdx === 0 ? "default" : "pointer", fontWeight: 700, fontSize: 16 }}>
                ←
              </button>
              <button onClick={() => setFlipped(f => !f)}
                style={{ fontFamily: "inherit", flex: 2, padding: "14px", borderRadius: 13, background: `linear-gradient(135deg,${accent}30,${accent}18)`, border: `1px solid ${accent}50`, color: "#e2e8f0", cursor: "pointer", fontWeight: 700, fontSize: 14 }}>
                {flipped ? "🔄 Balik" : "👁 Lihat"}
              </button>
              <button onClick={() => { setSrcIdx(i => Math.min(srcCards.length-1, i+1)); setFlipped(false); }} disabled={srcIdx === srcCards.length-1}
                style={{ fontFamily: "inherit", flex: 1, padding: "14px", borderRadius: 13, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: srcIdx === srcCards.length-1 ? "#475569" : "#94a3b8", cursor: srcIdx === srcCards.length-1 ? "default" : "pointer", fontWeight: 700, fontSize: 16 }}>
                →
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  // Set selector
  const srcList = Object.entries(SOURCE_META).filter(([src]) => CARDS.some(c => c.source === src));

  const GROUPS = [
    { label: "📚 Buku Teks",   keys: ["text1l","text2","text3","text4","text5l","text6l","text7l"] },
    { label: "📋 Soal Latihan",keys: ["tt_sample","tt_sample2","st_sample_l","st_sample2_l"] },
    { label: "📖 Kosakata",    keys: ["lifeline4","vocab_jac","vocab_core","vocab_exam","vocab_teori"] },
  ];

  const ACCENT = {
    text1l:"#f97316",text2:"#22d3ee",text3:"#34d399",text4:"#a78bfa",
    text5l:"#fbbf24",text6l:"#f472b6",text7l:"#818cf8",
    tt_sample:"#ef4444",tt_sample2:"#ef4444",st_sample_l:"#10b981",st_sample2_l:"#10b981",
    lifeline4:"#60a5fa",vocab_jac:"#818cf8",vocab_core:"#94a3b8",vocab_exam:"#a78bfa",vocab_teori:"#f87171",
  };

  return (
    <div style={{ padding: "0 16px 32px", maxWidth: 560, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#e2e8f0" }}>📑 Browse per Sumber PDF</div>
          <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{srcList.length} sumber tersedia</div>
        </div>
      </div>
      {GROUPS.map(group => {
        const items = group.keys.filter(k => srcList.find(([s]) => s === k));
        if (items.length === 0) return null;
        return (
          <div key={group.label} style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: 1.2, marginBottom: 8, paddingLeft: 4 }}>
              {group.label}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {items.map(src => {
                const meta = SOURCE_META[src];
                const count = CARDS.filter(c => c.source === src).length;
                const accent = ACCENT[src] || "#64748b";
                return (
                  <button key={src} onClick={() => { setActiveSrc(src); setSrcIdx(0); setFlipped(false); }}
                    style={{
                      width: "100%", padding: "13px 16px 13px 20px", borderRadius: 12,
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.09)",
                      cursor: "pointer", textAlign: "left", fontFamily: "inherit",
                      display: "flex", alignItems: "center", gap: 12,
                      transition: "all 0.15s", position: "relative", overflow: "hidden",
                    }}>
                    {/* left accent */}
                    <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: accent, borderRadius: "12px 0 0 12px" }} />
                    <span style={{ fontSize: 20 }}>{meta.emoji}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{meta.label}</div>
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: accent, background: `${accent}20`, border: `1px solid ${accent}40`, borderRadius: 20, padding: "2px 9px", flexShrink: 0 }}>
                      {count}
                    </div>
                    <div style={{ fontSize: 14, color: "#64748b", flexShrink: 0 }}>›</div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}


export default SumberMode;
