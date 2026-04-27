// ─── SearchMode ─────────────────────────────────────────────────────────────
// Full-text search across all cards with category-aware results.
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from "react";
import { stripFuri, extractReadings } from "../utils/jp-helpers.js";
import { CARDS } from "../data/cards.js";
import { getCatInfo } from "../data/categories.js";

function SearchMode() {
  const [query, setQuery] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  const q = query.trim().toLowerCase();
  const results = q.length < 1 ? [] : CARDS.filter(c =>
    c.jp.toLowerCase().includes(q) ||
    (c.romaji || "").toLowerCase().includes(q) ||
    c.id_text.toLowerCase().includes(q) ||
    (c.desc || "").toLowerCase().includes(q)
  );

  const highlight = (text) => {
    if (!q) return text;
    const idx = text.toLowerCase().indexOf(q);
    if (idx === -1) return text;
    return <>{text.slice(0, idx)}<mark style={{ background: "rgba(246,211,101,0.4)", color: "#fbd38d", borderRadius: 2, padding: "0 1px" }}>{text.slice(idx, idx + q.length)}</mark>{text.slice(idx + q.length)}</>;
  };

  return (
    <div style={{ padding: "0 16px 32px", maxWidth: 560, margin: "0 auto" }}>
      <div style={{ position: "sticky", top: 0, background: "rgba(15,12,41,0.97)", paddingTop: 4, paddingBottom: 10, zIndex: 10, backdropFilter: "blur(16px)" }}>
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 16, color: "#64748b" }}>🔍</span>
          <input
            autoFocus
            value={query}
            onChange={e => { setQuery(e.target.value); setExpandedId(null); }}
            placeholder="Cari JP, romaji, atau terjemahan…"
            style={{
              width: "100%", padding: "13px 40px 13px 44px", fontSize: 15,
              borderRadius: 14,
              background: "rgba(255,255,255,0.10)",
              border: `1.5px solid ${query ? "rgba(246,211,101,0.6)" : "rgba(255,255,255,0.2)"}`,
              color: "#e2e8f0", outline: "none", boxSizing: "border-box",
              fontFamily: "'Noto Sans JP', sans-serif",
              transition: "border-color 0.2s",
            }}
          />
          {query && (
            <button onClick={() => setQuery("")} style={{ fontFamily: "inherit", position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.12)", border: "none", color: "#e2e8f0", fontSize: 16, cursor: "pointer", padding: "2px 8px", borderRadius: 8, lineHeight: 1 }}>×</button>
          )}
        </div>
        {q.length > 0 && (
          <div style={{ fontSize: 13, color: "#64748b", marginTop: 7, textAlign: "center" }}>
            {results.length} kartu ditemukan dari {CARDS.length}
          </div>
        )}
      </div>

      {q.length === 0 && (
        <div style={{ textAlign: "center", padding: "48px 0" }}>
          <div style={{ fontSize: 36, marginBottom: 14 }}>🔍</div>
          <div style={{ fontSize: 15, color: "#94a3b8", marginBottom: 6 }}>Ketik untuk mencari kartu</div>
          <div style={{ fontSize: 13, color: "#64748b" }}>JP · romaji · terjemahan · deskripsi</div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {results.map(card => {
          const info = getCatInfo(card.category);
          const isOpen = expandedId === card.id;
          return (
            <div key={card.id} onClick={() => setExpandedId(isOpen ? null : card.id)} style={{ cursor: "pointer" }}>
              <div style={{ background: isOpen ? `${info.color}22` : "rgba(255,255,255,0.06)", border: `${isOpen ? "2px" : "1px"} solid ${isOpen ? info.color : "rgba(255,255,255,0.1)"}`, borderRadius: isOpen ? "14px 14px 0 0" : 14, padding: "12px 14px", display: "flex", gap: 10, alignItems: "flex-start" }}>
                <div style={{ fontSize: 20, flexShrink: 0 }}>{info.emoji}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                    <div style={{ fontSize: 16, fontFamily: "'Noto Sans JP',sans-serif", fontWeight: 700 }}>{highlight(stripFuri(card.jp))}</div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: info.color, background: `${info.color}20`, border: `1px solid ${info.color}40`, borderRadius: 6, padding: "1px 6px", flexShrink: 0 }}>{info.label}</div>
                  </div>
                  <div style={{ fontSize: 12, color: "#94a3b8" }}>{highlight(card.romaji)}</div>
                  <div style={{ fontSize: 13, color: "#93c5fd", marginTop: 2 }}>{highlight(card.id_text)}</div>
                </div>
                <div style={{ fontSize: 11, color: "#475569", flexShrink: 0, marginTop: 2 }}>#{card.id}</div>
              </div>
              {isOpen && (
                <div style={{ background: `${info.color}11`, border: `2px solid ${info.color}`, borderTop: `1px solid ${info.color}44`, borderRadius: "0 0 14px 14px", padding: "12px 14px" }}>
                  <div style={{ fontSize: 13, lineHeight: 1.8, color: "#cbd5e1" }}>{highlight(card.desc)}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}


export default SearchMode;
