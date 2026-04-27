import { useState } from "react";
import { T } from "../styles/theme.js";
import { CARDS } from "../data/cards.js";
import { SOURCE_META, SOURCE_GROUPS, SOURCE_ACCENT } from "../data/categories.js";
import { stripFuri } from "../utils/jp-helpers.js";

export default function SumberMode({ onExit }) {
  const [activeSrc, setActiveSrc] = useState(null);
  const [expanded, setExpanded] = useState(null);

  if (activeSrc) {
    const srcCards = CARDS.filter(c => c.source === activeSrc);
    const meta = SOURCE_META[activeSrc] || { label: activeSrc, emoji: "📄" };
    const color = SOURCE_ACCENT[activeSrc] || T.gold;

    return (
      <div style={{ padding: "16px 16px 24px", maxWidth: T.maxW, margin: "0 auto" }}>
        <button onClick={() => setActiveSrc(null)} style={{ fontFamily: "inherit", fontSize: 12, color: T.textMuted, background: "none", border: "none", cursor: "pointer", marginBottom: 12 }}>← Sumber</button>
        <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 4 }}>{meta.emoji} {meta.label}</h2>
        <p style={{ fontSize: 12, color: T.textDim, marginBottom: 16 }}>{srcCards.length} kartu</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {srcCards.map(c => (
            <div key={c.id} onClick={() => setExpanded(expanded === c.id ? null : c.id)} style={{
              padding: "10px 12px", borderRadius: T.r.md, cursor: "pointer",
              background: T.surface, borderLeft: `3px solid ${color}`,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontFamily: T.fontJP, fontSize: 13 }}>{stripFuri(c.jp)}</span>
                <span style={{ fontSize: 12, color: T.textMuted, flexShrink: 0, marginLeft: 8 }}>{c.id_text}</span>
              </div>
              {expanded === c.id && (
                <div style={{ marginTop: 6, fontSize: 11, color: T.textMuted, lineHeight: 1.5 }}>
                  {c.furi && <div style={{ color: T.textDim, fontFamily: T.fontJP }}>{c.furi} · {c.romaji}</div>}
                  <div style={{ marginTop: 4 }}>{c.desc}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px 16px", maxWidth: T.maxW, margin: "0 auto" }}>
      <button onClick={onExit} style={{ fontFamily: "inherit", fontSize: 12, color: T.textMuted, background: "none", border: "none", cursor: "pointer", marginBottom: 16 }}>← Kembali</button>
      <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>📂 Sumber</h2>
      <p style={{ fontSize: 13, color: T.textMuted, marginBottom: 20 }}>Jelajahi kartu berdasarkan sumber PDF/CSV</p>

      {SOURCE_GROUPS.map(g => (
        <div key={g.label} style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: T.textDim, textTransform: "uppercase", marginBottom: 8 }}>{g.label}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {g.keys.map(key => {
              const meta = SOURCE_META[key];
              if (!meta) return null;
              const count = CARDS.filter(c => c.source === key).length;
              const color = SOURCE_ACCENT[key] || T.gold;
              return (
                <button key={key} onClick={() => setActiveSrc(key)} style={{
                  fontFamily: "inherit", padding: "12px 14px", borderRadius: T.r.md, cursor: "pointer",
                  background: T.surface, border: `1px solid ${T.border}`, color: T.text,
                  textAlign: "left", borderLeft: `3px solid ${color}`,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>{meta.emoji} {meta.label}</span>
                    <span style={{ fontSize: 12, color: T.textDim }}>{count}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
