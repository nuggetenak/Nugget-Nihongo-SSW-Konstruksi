import { useState, useEffect, useCallback } from "react";
import { T } from "../styles/theme.js";
import { shuffle } from "../utils/shuffle.js";
import { stripFuri, jpFontSize } from "../utils/jp-helpers.js";
import { getCatInfo } from "../data/categories.js";
import ProgressBar from "../components/ProgressBar.jsx";

export default function FlashcardMode({ cards, known, unknown, onMark, onExit }) {
  const [order, setOrder] = useState([]);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [touchX, setTouchX] = useState(null);
  const [swipeDir, setSwipeDir] = useState(0); // -1 left, 0 none, 1 right

  useEffect(() => {
    const unknownCards = cards.filter(c => unknown.has(c.id));
    const knownCards = cards.filter(c => known.has(c.id));
    const untouched = cards.filter(c => !known.has(c.id) && !unknown.has(c.id));
    setOrder(shuffle([...unknownCards, ...shuffle(untouched), ...knownCards]));
    setIdx(0); setFlipped(false);
  }, [cards, known.size, unknown.size]);

  const card = order[idx];
  if (!card || order.length === 0) return (
    <div style={{ padding: "40px 20px", textAlign: "center", maxWidth: T.maxW, margin: "0 auto" }}>
      <button onClick={onExit} style={{ fontFamily: "inherit", fontSize: 12, color: T.textMuted, background: "none", border: "none", cursor: "pointer", marginBottom: 20 }}>← Kembali</button>
      <div style={{ fontSize: 32, marginBottom: 12 }}>📭</div>
      <div style={{ fontSize: 14, color: T.textMuted }}>Tidak ada kartu di filter ini.</div>
    </div>
  );

  const cat = getCatInfo(card.category);
  const knownCount = cards.filter(c => known.has(c.id)).length;
  const pctKnown = Math.round((knownCount / cards.length) * 100);
  const isKnown = known.has(card.id);
  const isUnknown = unknown.has(card.id);
  const clean = stripFuri(card.jp);
  const fs = jpFontSize(clean);

  const go = (dir) => {
    setSwipeDir(dir);
    setTimeout(() => {
      setIdx(i => Math.max(0, Math.min(order.length - 1, i + dir)));
      setFlipped(false); setSwipeDir(0);
    }, 120);
  };

  useEffect(() => {
    const h = (e) => {
      if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === " ") { e.preventDefault(); setFlipped(f => !f); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  return (
    <div style={{ padding: "12px 16px 24px", maxWidth: T.maxW, margin: "0 auto", animation: "fadeIn 0.2s ease" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <button onClick={onExit} style={{ fontFamily: "inherit", fontSize: 12, color: T.textMuted, background: "none", border: "none", cursor: "pointer", padding: "6px 0" }}>← Kartu</button>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
          <span style={{ color: T.correct, fontWeight: 600 }}>{pctKnown}%</span>
          <span style={{ color: T.textFaint, fontVariantNumeric: "tabular-nums" }}>{idx + 1}/{order.length}</span>
        </div>
      </div>
      <ProgressBar current={knownCount} total={cards.length} color={T.correct} />

      {/* Card */}
      <div
        onClick={() => setFlipped(f => !f)}
        onTouchStart={e => setTouchX(e.touches[0].clientX)}
        onTouchEnd={e => {
          if (touchX === null) return;
          const diff = e.changedTouches[0].clientX - touchX;
          if (Math.abs(diff) > 60) go(diff > 0 ? -1 : 1);
          setTouchX(null);
        }}
        style={{
          marginTop: 14, padding: flipped ? "24px 18px" : "32px 20px",
          background: T.surface, borderRadius: T.r.xxl,
          border: `1.5px solid ${isKnown ? T.correctBorder : isUnknown ? T.wrongBorder : T.border}`,
          minHeight: 230, cursor: "pointer",
          display: "flex", flexDirection: "column", justifyContent: "center",
          transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
          transform: swipeDir !== 0 ? `translateX(${swipeDir * 30}px) rotate(${swipeDir * 2}deg)` : "none",
          opacity: swipeDir !== 0 ? 0.6 : 1,
          boxShadow: isKnown ? `0 0 20px ${T.correct}12` : isUnknown ? `0 0 20px ${T.wrong}12` : "none",
        }}
      >
        {!flipped ? (
          /* ── FRONT ── */
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: fs, fontWeight: 700, fontFamily: T.fontJP, lineHeight: 1.4, marginBottom: 6 }}>{clean}</div>
            {card.furi && <div style={{ fontSize: 12, color: T.textMuted, fontFamily: T.fontJP, marginBottom: 3 }}>{card.furi}</div>}
            <div style={{ fontSize: 11, color: T.textDim, fontStyle: "italic" }}>{card.romaji}</div>
          </div>
        ) : (
          /* ── BACK ── */
          <div style={{ animation: "fadeIn 0.15s ease" }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 10, textAlign: "center", color: T.gold }}>{card.id_text}</div>
            <div style={{ fontSize: 12, lineHeight: 1.7, color: T.textMuted }}>{card.desc}</div>
            <div style={{ marginTop: 12, textAlign: "center" }}>
              <span style={{
                fontSize: 10, padding: "3px 10px", borderRadius: T.r.pill,
                background: `${cat.color}15`, color: cat.color,
                border: `1px solid ${cat.color}33`,
              }}>{cat.emoji} {cat.label}</span>
            </div>
          </div>
        )}
      </div>

      {/* Tap hint */}
      <div style={{ textAlign: "center", fontSize: 10, color: T.textFaint, marginTop: 8, letterSpacing: 0.5 }}>
        {flipped ? "ketuk untuk balik" : "ketuk untuk lihat jawaban · geser untuk navigasi"}
      </div>

      {/* Mark Buttons */}
      <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
        <button onClick={() => { onMark(card.id, "unknown"); go(1); }} style={{
          flex: 1, padding: "13px", fontSize: 13, fontWeight: 700,
          fontFamily: "inherit", borderRadius: T.r.md, cursor: "pointer",
          background: isUnknown ? T.wrongBg : T.surface,
          border: `1.5px solid ${isUnknown ? T.wrongBorder : T.border}`,
          color: isUnknown ? T.wrong : T.text,
          transition: "all 0.15s",
        }}>❌ Belum</button>
        <button onClick={() => { onMark(card.id, "known"); go(1); }} style={{
          flex: 1, padding: "13px", fontSize: 13, fontWeight: 700,
          fontFamily: "inherit", borderRadius: T.r.md, cursor: "pointer",
          background: isKnown ? T.correctBg : T.surface,
          border: `1.5px solid ${isKnown ? T.correctBorder : T.border}`,
          color: isKnown ? T.correct : T.text,
          transition: "all 0.15s",
        }}>✅ Hafal</button>
      </div>

      {/* Nav */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, padding: "0 4px" }}>
        <button onClick={() => go(-1)} disabled={idx === 0} style={{
          fontFamily: "inherit", fontSize: 12, color: idx === 0 ? T.textFaint : T.textMuted,
          background: "none", border: "none", cursor: idx === 0 ? "default" : "pointer", padding: "6px 0",
        }}>← Sblm</button>
        <button onClick={() => go(1)} disabled={idx >= order.length - 1} style={{
          fontFamily: "inherit", fontSize: 12, color: idx >= order.length - 1 ? T.textFaint : T.textMuted,
          background: "none", border: "none", cursor: idx >= order.length - 1 ? "default" : "pointer", padding: "6px 0",
        }}>Slnjt →</button>
      </div>
    </div>
  );
}
