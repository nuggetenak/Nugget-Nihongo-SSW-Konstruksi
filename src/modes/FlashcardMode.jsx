import { useState, useEffect, useCallback, useRef } from "react";
import { T } from "../styles/theme.js";
import { shuffle } from "../utils/shuffle.js";
import { stripFuri } from "../utils/jp-helpers.js";
import { JpFront, DescBlock } from "../components/JpDisplay.jsx";
import { getCatInfo } from "../data/categories.js";
import ProgressBar from "../components/ProgressBar.jsx";

export default function FlashcardMode({ cards, known, unknown, onMark, onExit }) {
  const [order, setOrder] = useState([]);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [touchX, setTouchX] = useState(null);

  useEffect(() => {
    // Priority sort: unknown → untouched → known
    const unknownCards = cards.filter(c => unknown.has(c.id));
    const knownCards = cards.filter(c => known.has(c.id));
    const untouched = cards.filter(c => !known.has(c.id) && !unknown.has(c.id));
    setOrder(shuffle([...unknownCards, ...shuffle(untouched), ...knownCards]));
    setIdx(0);
    setFlipped(false);
  }, [cards, known.size, unknown.size]);

  const card = order[idx];
  if (!card) return null;

  const cat = getCatInfo(card.category);
  const knownCount = cards.filter(c => known.has(c.id)).length;
  const pctKnown = Math.round((knownCount / cards.length) * 100);

  const go = (dir) => {
    setIdx(i => Math.max(0, Math.min(order.length - 1, i + dir)));
    setFlipped(false);
  };

  const handleTouchStart = (e) => setTouchX(e.touches[0].clientX);
  const handleTouchEnd = (e) => {
    if (touchX === null) return;
    const diff = e.changedTouches[0].clientX - touchX;
    if (Math.abs(diff) > 60) go(diff > 0 ? -1 : 1);
    setTouchX(null);
  };

  // Keyboard
  useEffect(() => {
    const h = (e) => {
      if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === " ") { e.preventDefault(); setFlipped(f => !f); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const isKnown = known.has(card.id);
  const isUnknown = unknown.has(card.id);

  return (
    <div style={{ padding: "16px 16px 24px", maxWidth: T.maxW, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <button onClick={onExit} style={{ fontFamily: "inherit", fontSize: 12, color: T.textMuted, background: "none", border: "none", cursor: "pointer" }}>← Kartu</button>
        <div style={{ fontSize: 12, color: T.textDim }}>{pctKnown}% hafal · {idx + 1}/{order.length}</div>
      </div>
      <ProgressBar current={idx + 1} total={order.length} />

      {/* Card */}
      <div
        onClick={() => setFlipped(f => !f)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{
          marginTop: 16,
          padding: "28px 20px",
          background: T.surface,
          borderRadius: T.r.xl,
          border: `1px solid ${T.border}`,
          minHeight: 220,
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          transition: "all 0.2s",
        }}
      >
        {!flipped ? (
          <JpFront jp={card.jp} furi={card.furi} romaji={card.romaji} />
        ) : (
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 10, textAlign: "center" }}>
              {card.id_text}
            </div>
            <DescBlock desc={card.desc} />
            <div style={{ marginTop: 10, textAlign: "center" }}>
              <span style={{ fontSize: 10, padding: "3px 8px", borderRadius: T.r.pill, background: cat.color + "22", color: cat.color, border: `1px solid ${cat.color}44` }}>
                {cat.emoji} {cat.label}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Tap hint */}
      <div style={{ textAlign: "center", fontSize: 11, color: T.textFaint, marginTop: 8 }}>
        {flipped ? "ketuk untuk balik" : "ketuk untuk lihat jawaban"}
      </div>

      {/* Mark Buttons */}
      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <button onClick={() => { onMark(card.id, "unknown"); go(1); }} style={{
          flex: 1, padding: "12px", fontSize: 13, fontWeight: 600,
          fontFamily: "inherit", borderRadius: T.r.md, cursor: "pointer",
          background: isUnknown ? T.wrongBg : T.surface,
          border: `1px solid ${isUnknown ? T.wrongBorder : T.border}`,
          color: isUnknown ? T.wrong : T.text,
        }}>❌ Belum hafal</button>
        <button onClick={() => { onMark(card.id, "known"); go(1); }} style={{
          flex: 1, padding: "12px", fontSize: 13, fontWeight: 600,
          fontFamily: "inherit", borderRadius: T.r.md, cursor: "pointer",
          background: isKnown ? T.correctBg : T.surface,
          border: `1px solid ${isKnown ? T.correctBorder : T.border}`,
          color: isKnown ? T.correct : T.text,
        }}>✅ Sudah hafal</button>
      </div>

      {/* Nav Arrows */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12 }}>
        <button onClick={() => go(-1)} disabled={idx === 0} style={{
          fontFamily: "inherit", fontSize: 12, color: idx === 0 ? T.textFaint : T.textMuted,
          background: "none", border: "none", cursor: idx === 0 ? "default" : "pointer",
        }}>← Sebelumnya</button>
        <button onClick={() => go(1)} disabled={idx === order.length - 1} style={{
          fontFamily: "inherit", fontSize: 12, color: idx === order.length - 1 ? T.textFaint : T.textMuted,
          background: "none", border: "none", cursor: idx === order.length - 1 ? "default" : "pointer",
        }}>Selanjutnya →</button>
      </div>
    </div>
  );
}
