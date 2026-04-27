// ─── SprintMode ─────────────────────────────────────────────────────────────
// Speed-round flashcard drill with timer.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback, useRef } from "react";
import { shuffle } from "../utils/shuffle.js";
import { stripFuri } from "../utils/jp-helpers.js";
import { getCatInfo } from "../data/categories.js";

function SprintMode({ cards, onBack }) {
  const [deck, setDeck] = useState([]);
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState({ known: 0, unknown: 0 });
  const [phase, setPhase] = useState("playing");
  const [unknownDeck, setUnknownDeck] = useState([]);
  const sprintTouchX = useRef(null);
  const sprintTouchY = useRef(null);

  const insufficientSprint = !cards || cards.length < 2;

  const startSprint = useCallback((targetCards) => {
    setDeck(shuffle(targetCards.map((_, i) => i)).map(i => targetCards[i]));
    setIdx(0); setRevealed(false); setScore({ known: 0, unknown: 0 }); setPhase("playing"); setUnknownDeck([]);
  }, []);

  useEffect(() => { if (!insufficientSprint && cards.length > 0) startSprint(cards); }, [cards, insufficientSprint]);

  if (insufficientSprint) return (
    <div style={{ textAlign: "center", padding: "40px 16px", color: "#475569" }}>
      Butuh minimal 2 kartu untuk Sprint.
    </div>
  );
  if (deck.length === 0) return null;

  const card = deck[idx];
  const total = deck.length;

  const advance = (wasKnown) => {
    if (!wasKnown) setUnknownDeck(u => [...u, deck[idx]]);
    setScore(s => ({ ...s, [wasKnown ? "known" : "unknown"]: s[wasKnown ? "known" : "unknown"] + 1 }));
    if (idx < total - 1) { setIdx(i => i + 1); setRevealed(false); }
    else setPhase("finished");
  };

  if (phase === "finished") {
    const acc = Math.round((score.known / total) * 100);
    const grade = acc >= 90 ? { emoji: "🏆", col: "#fbbf24" } : acc >= 70 ? { emoji: "✨", col: "#4ade80" } : acc >= 50 ? { emoji: "📚", col: "#60a5fa" } : { emoji: "💪", col: "#f87171" };
    return (
      <div style={{ padding: "16px", maxWidth: 560, margin: "0 auto" }}>
        <div style={{ borderRadius: 22, background: "rgba(255,255,255,0.06)", border: `1px solid ${grade.col}30`, padding: "28px 22px", textAlign: "center", marginBottom: 18, boxShadow: `0 8px 32px ${grade.col}10` }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>{grade.emoji}</div>
          <div style={{ fontSize: 11, color: "#475569", letterSpacing: 2, marginBottom: 6 }}>HASIL SPRINT</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: grade.col, marginBottom: 4 }}>{score.known} / {total}</div>
          <div style={{ fontSize: 13, color: "#94a3b8" }}>{acc}% hafal · {score.unknown} belum</div>
          <div style={{ height: 4, background: "rgba(0,0,0,0.3)", borderRadius: 99, margin: "18px 0 0", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${acc}%`, background: `linear-gradient(90deg,${grade.col}80,${grade.col})`, borderRadius: 99, transition: "width 0.6s ease" }} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => startSprint(cards)} style={{ fontFamily: "inherit", flex: 2, padding: "14px 0", fontSize: 14, fontWeight: 700, borderRadius: 14, background: "linear-gradient(135deg, #9f7aea, #6b46c1)", border: "none", color: "#fff", cursor: "pointer" }}>⚡ Sprint lagi</button>
          {score.unknown > 0 && <button onClick={() => startSprint(unknownDeck)} style={{ fontFamily: "inherit", flex: 1, padding: "14px 0", fontSize: 14, fontWeight: 700, borderRadius: 14, background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.4)", color: "#fc8181", cursor: "pointer" }}>🔁 Belum ({score.unknown})</button>}
          {onBack && <button onClick={onBack} style={{ fontFamily: "inherit", padding: "14px 16px", fontSize: 14, fontWeight: 700, borderRadius: 14, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.06)", color: "#94a3b8", cursor: "pointer" }}>← Fokus</button>}
        </div>
      </div>
    );
  }

  const info = getCatInfo(card.category);
  return (
    <div style={{ padding: "0 16px 24px", maxWidth: 560, margin: "0 auto" }}>
      {onBack && (
        <button onClick={onBack} style={{ fontFamily: "inherit", marginBottom: 10, padding: "5px 12px", fontSize: 11, borderRadius: 8, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", color: "#a0aec0", cursor: "pointer" }}>← Fokus</button>
      )}
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, alignItems: "center" }}>
        <div style={{ fontSize: 12, opacity: 0.5 }}>{idx + 1} / {total}</div>
        <div style={{ fontSize: 13, fontWeight: 700 }}>
          <span style={{ color: "#68d391" }}>✓ {score.known}</span>
          <span style={{ color: "#fc8181", marginLeft: 10 }}>✗ {score.unknown}</span>
        </div>
      </div>
      <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 99, overflow: "hidden", marginBottom: 14 }}>
        <div style={{ height: "100%", width: `${(idx / total) * 100}%`, background: "linear-gradient(90deg, #9f7aea, #6b46c1)", transition: "width 0.2s" }} />
      </div>

      {/* Card — tap to reveal, swipe left/right when revealed */}
      <div
        onClick={() => !revealed && setRevealed(true)}
        onTouchStart={(e) => { sprintTouchX.current = e.touches[0].clientX; sprintTouchY.current = e.touches[0].clientY; }}
        onTouchEnd={(e) => {
          if (sprintTouchX.current === null) return;
          const dx = e.changedTouches[0].clientX - sprintTouchX.current;
          const dy = e.changedTouches[0].clientY - sprintTouchY.current;
          sprintTouchX.current = null; sprintTouchY.current = null;
          if (!revealed) return; // only swipe when answer is shown
          if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 35) {
            e.preventDefault();
            advance(dx > 0); // swipe right = hafal, swipe left = belum
          }
        }}
        style={{ background: `linear-gradient(135deg, ${info.color}cc, ${info.color}55)`, borderRadius: 24, padding: "28px 24px", border: `2px solid ${info.color}`, boxShadow: `0 12px 40px ${info.color}33`, marginBottom: 14, textAlign: "center", minHeight: 180, display: "flex", flexDirection: "column", justifyContent: "center", cursor: revealed ? "default" : "pointer", userSelect: "none" }}>
        <div style={{ fontSize: 11, opacity: 0.6, letterSpacing: 1, marginBottom: 10 }}>{info.emoji} {info.label} · #{card.id}</div>
        <JpFront text={card.jp} />
        <div style={{ fontSize: 12, opacity: 0.55 }}>{card.romaji}</div>
        {!revealed && (
          <div style={{ marginTop: 16, fontSize: 12, opacity: 0.35, border: "1px dashed rgba(255,255,255,0.2)", borderRadius: 8, padding: "6px 12px", display: "inline-block" }}>
            Tap untuk lihat arti
          </div>
        )}
        {revealed && (
          <div style={{ marginTop: 14, borderTop: `1px solid ${info.color}66`, paddingTop: 14 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{card.id_text}</div>
            <div style={{ fontSize: 12, opacity: 0.7, lineHeight: 1.6 }}>{card.desc}</div>
          </div>
        )}
      </div>

      {/* Action buttons — only after reveal */}
      {revealed ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <button onClick={() => advance(false)} style={{ fontFamily: "inherit", padding: "14px", fontSize: 15, fontWeight: 700, borderRadius: 16, background: "rgba(239,68,68,0.15)", border: "2px solid rgba(239,68,68,0.4)", color: "#fc8181", cursor: "pointer" }}>✗ Belum</button>
          <button onClick={() => advance(true)} style={{ fontFamily: "inherit", padding: "14px", fontSize: 15, fontWeight: 700, borderRadius: 16, background: "rgba(34,197,94,0.15)", border: "2px solid rgba(34,197,94,0.4)", color: "#86efac", cursor: "pointer" }}>✓ Hafal!</button>
        </div>
      ) : (
        <div style={{ textAlign: "center", fontSize: 12, opacity: 0.3 }}>Tap kartu untuk lihat jawaban &nbsp;·&nbsp; geser kanan/kiri setelah reveal</div>
      )}
    </div>
  );
}



export default SprintMode;
