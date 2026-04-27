// ─── FocusMode ──────────────────────────────────────────────────────────────
// Weakness-focused study mode — finds your weakest categories and drills them.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { getWrongCount, loadFromStorage, STORAGE_KEYS } from "../utils/wrong-tracker.js";
import { CARDS } from "../data/cards.js";
import { JAC_OFFICIAL } from "../data/jac-official.js";
import { CATEGORIES, getCatInfo, VOCAB_SOURCES } from "../data/categories.js";
import SprintMode from "./SprintMode.jsx";

function FocusMode() {
  const [data, setData] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [sprintCards, setSprintCards] = useState(null);

  useEffect(() => {
    (async () => {
      let known = new Set(), unknown = new Set(), jacWrong = {}, quizWrong = {};
      try { const r = await window.storage.get("ssw-progress"); if (r) { const p = JSON.parse(r.value); known = new Set(p.known || []); unknown = new Set(p.unknown || []); } } catch {}
      try { const r = await window.storage.get("ssw-wrong-counts"); if (r) jacWrong = JSON.parse(r.value); } catch {}
      try { const r = await window.storage.get("ssw-quiz-wrong"); if (r) quizWrong = JSON.parse(r.value); } catch {}
      setData({ known, unknown, jacWrong, quizWrong });
    })();
  }, []);

  if (!data) return <div style={{ textAlign: "center", padding: 40, opacity: 0.4, fontSize: 13 }}>Memuat data fokus…</div>;
  if (sprintCards) return <SprintMode key="fokus-sprint" cards={sprintCards} onBack={() => setSprintCards(null)} />;

  // Map JAC wrong → card via related_card_id
  const jacCardWrong = {};
  JAC_OFFICIAL.forEach(q => {
    if (q.related_card_id && data.jacWrong[q.id]) {
      jacCardWrong[q.related_card_id] = (jacCardWrong[q.related_card_id] || 0) + getWrongCount(data.jacWrong[q.id]);
    }
  });

  // Score: belum hafal +3, quiz wrong ×2, JAC wrong ×1
  const scored = CARDS.map(card => {
    const flashScore = data.unknown.has(card.id) ? 3 : 0;
    const quizCnt    = getWrongCount(data.quizWrong[card.id]);
    const quizTime   = getWrongTime(data.quizWrong[card.id]);
    const jacCnt     = jacCardWrong[card.id] || 0;
    const total      = flashScore + quizCnt * 2 + jacCnt;
    return { card, total, flashScore, quizCnt, jacCnt, quizTime };
  }).filter(x => x.total > 0).sort((a, b) => b.total - a.total).slice(0, 30);

  const nowFokus = Date.now();
  const sevenDaysFokus = 7 * 24 * 60 * 60 * 1000;
  const recentCount = scored.filter(x => x.quizTime && (nowFokus - x.quizTime) < sevenDaysFokus).length;

  return (
    <div style={{ padding: "0 16px 32px", maxWidth: 560, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontSize: 12, opacity: 0.5 }}>
          {scored.length > 0 ? `${scored.length} kartu butuh perhatian` : "Semua kartu aman 🎉"}
        </div>
        {recentCount > 0 && (
          <div style={{ fontSize: 11, background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "3px 9px", color: "#fc8181" }}>
            🔴 {recentCount}× salah ≤7 hari
          </div>
        )}
      </div>

      {scored.length === 0 ? (
        <div style={{ textAlign: "center", padding: "48px 0", opacity: 0.35, fontSize: 13 }}>
          Belum ada data kelemahan.<br />
          <span style={{ fontSize: 11, display: "block", marginTop: 6, lineHeight: 1.7 }}>
            Kerjakan Kartu, Kuis, atau JAC dulu<br />agar sistem bisa mendeteksi pola salah.
          </span>
        </div>
      ) : (
        <>
          <button onClick={() => setSprintCards(scored.map(x => x.card))} style={{ fontFamily: "inherit",
            width: "100%", padding: "13px", fontSize: 13, fontWeight: 700, borderRadius: 14,
            background: "linear-gradient(135deg, #e53e3e, #c05621)", border: "none",
            color: "#fff", cursor: "pointer", marginBottom: 16,
          }}>
            ⚡ Sprint semua kartu lemah ({scored.length})
          </button>

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {scored.map(({ card, total, flashScore, quizCnt, jacCnt, quizTime }, rank) => {
              const info = getCatInfo(card.category);
              const isRecent = quizTime && (nowFokus - quizTime) < sevenDaysFokus;
              const isOpen = expandedId === card.id;
              return (
                <div key={card.id}>
                  <div
                    onClick={() => setExpandedId(isOpen ? null : card.id)}
                    style={{
                      background: isOpen ? `${info.color}22` : "rgba(255,255,255,0.05)",
                      border: `1px solid ${isRecent ? "rgba(239,68,68,0.4)" : isOpen ? info.color : "rgba(255,255,255,0.1)"}`,
                      borderRadius: isOpen ? "14px 14px 0 0" : 14,
                      padding: "11px 14px", cursor: "pointer",
                      display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10,
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 10, opacity: 0.35, marginBottom: 3 }}>#{rank + 1} · {info.emoji} {info.label}</div>
                      <div style={{ fontSize: 15, fontFamily: "'Noto Sans JP',sans-serif", fontWeight: 700, lineHeight: 1.3, marginBottom: 3 }}>{stripFuri(card.jp)}</div>
                      <div style={{ fontSize: 12, color: "#90cdf4", marginBottom: 6 }}>{card.id_text}</div>
                      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                        {flashScore > 0 && <span style={{ fontSize: 10, background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 6, padding: "2px 7px", color: "#fc8181" }}>🃏 Belum hafal</span>}
                        {quizCnt > 0 && <span style={{ fontSize: 10, background: "rgba(246,211,101,0.12)", border: "1px solid rgba(246,211,101,0.25)", borderRadius: 6, padding: "2px 7px", color: "#fbd38d" }}>📝 ✗{quizCnt}×</span>}
                        {jacCnt > 0 && <span style={{ fontSize: 10, background: "rgba(102,126,234,0.12)", border: "1px solid rgba(102,126,234,0.25)", borderRadius: 6, padding: "2px 7px", color: "#c3dafe" }}>📋 ✗{jacCnt}×</span>}
                        {isRecent && <span style={{ fontSize: 10, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 6, padding: "2px 7px", color: "#fc8181" }}>🔴 ≤7hr</span>}
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: 20, fontWeight: 700, color: total >= 7 ? "#fc8181" : total >= 4 ? "#f6ad55" : "#fbd38d", lineHeight: 1 }}>{total}</div>
                      <div style={{ fontSize: 9, opacity: 0.35, marginTop: 2 }}>skor</div>
                      <div style={{ fontSize: 11, opacity: 0.4, marginTop: 4 }}>{isOpen ? "▲" : "▼"}</div>
                    </div>
                  </div>
                  {isOpen && (
                    <div style={{ background: `${info.color}11`, border: `1px solid ${info.color}`, borderTop: `1px solid ${info.color}44`, borderRadius: "0 0 14px 14px", padding: "12px 14px" }}>
                      <div style={{ fontSize: 12, opacity: 0.55, marginBottom: 4 }}>{card.romaji}</div>
                      <div style={{ fontSize: 12, lineHeight: 1.7, opacity: 0.85 }}>{card.desc}</div>
                      <button onClick={(e) => { e.stopPropagation(); setSprintCards([card]); }} style={{ fontFamily: "inherit", marginTop: 10, padding: "6px 14px", fontSize: 11, borderRadius: 8, background: "linear-gradient(135deg, #e53e3e, #c05621)", border: "none", color: "#fff", cursor: "pointer", fontWeight: 700 }}>
                        ⚡ Sprint kartu ini
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}


export default FocusMode;
