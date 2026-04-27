// ─── StatsMode ──────────────────────────────────────────────────────────────
// Statistics dashboard showing known/unknown cards and weakest areas.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { getWrongCount, loadFromStorage, STORAGE_KEYS } from "../utils/wrong-tracker.js";
import { CARDS } from "../data/cards.js";
import { JAC_OFFICIAL } from "../data/jac-official.js";
import { CATEGORIES, getCatInfo } from "../data/categories.js";

function StatsMode({ known, unknown }) {
  // Wrong-count data comes from storage; known/unknown come from App state (live)
  const [jacWrong, setJacWrong]     = useState({});
  const [quizWrong, setQuizWrong]   = useState({});
  const [wrongsLoaded, setWrongsLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try { const r = await window.storage.get("ssw-wrong-counts"); if (r) setJacWrong(JSON.parse(r.value)); } catch {}
      try { const r = await window.storage.get("ssw-quiz-wrong");   if (r) setQuizWrong(JSON.parse(r.value)); } catch {}
      setWrongsLoaded(true);
    })();
  }, []);

  if (!wrongsLoaded) return <div style={{ textAlign: "center", padding: 40, opacity: 0.4, fontSize: 13 }}>Memuat statistik…</div>;

  const total      = CARDS.length;
  const nKnown     = known.size;
  const nUnknown   = unknown.size;
  const nUntouched = total - nKnown - nUnknown;
  const pctKnown   = Math.round((nKnown / total) * 100);

  // Per-category — sorted by "most needs attention" (lowest known% first)
  const catStats = CATEGORIES
    .filter(c => c.key !== "all" && c.key !== "bintang")
    .map(({ key: cat, label, emoji, color }) => {
      const catCards = CARDS.filter(c => c.category === cat);
      if (catCards.length === 0) return null;
      const k = catCards.filter(c => known.has(c.id)).length;
      const u = catCards.filter(c => unknown.has(c.id)).length;
      return { cat, label, emoji, color, total: catCards.length, known: k, unknown: u, untouched: catCards.length - k - u };
    })
    .filter(Boolean)
    .sort((a, b) => (a.known / a.total) - (b.known / b.total)); // ascending = worst first (most needs work at top)

  // Top wrong JAC
  const topJAC = Object.entries(jacWrong)
    .sort((a, b) => getWrongCount(b[1]) - getWrongCount(a[1])).slice(0, 5)
    .map(([id, val]) => ({ q: JAC_OFFICIAL.find(q => q.id === id), cnt: getWrongCount(val) })).filter(x => x.q);
  // Top wrong Quiz
  const topQuiz = Object.entries(quizWrong)
    .sort((a, b) => getWrongCount(b[1]) - getWrongCount(a[1])).slice(0, 5)
    .map(([id, val]) => ({ card: CARDS.find(c => c.id === +id), cnt: getWrongCount(val) })).filter(x => x.card);
  // Recent wrong (last 7 days)
  const nowStats  = Date.now();
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  const recentWrongQuiz = Object.values(quizWrong).filter(v => {
    const t = getWrongTime(v); return t && (nowStats - t) < sevenDays;
  }).length;

  return (
    <div style={{ padding: "0 16px 32px", maxWidth: 560, margin: "0 auto" }}>
      {/* Overall */}
      <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 20, padding: "20px", border: "1px solid rgba(255,255,255,0.1)", marginBottom: 16 }}>
        <div style={{ fontSize: 11, opacity: 0.4, textTransform: "uppercase", letterSpacing: 2, marginBottom: 12 }}>Progress Keseluruhan</div>
        <div style={{ display: "flex", gap: 0, height: 12, borderRadius: 6, overflow: "hidden", marginBottom: 10 }}>
          <div style={{ width: `${pctKnown}%`, background: "linear-gradient(90deg, #68d391, #38b2ac)", transition: "width 0.5s" }} />
          <div style={{ width: `${Math.round((nUnknown/total)*100)}%`, background: "rgba(239,68,68,0.6)" }} />
          <div style={{ flex: 1, background: "rgba(255,255,255,0.08)" }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {[
            { label: "Hafal", value: nKnown, pct: pctKnown, color: "#68d391" },
            { label: "Belum ✗", value: nUnknown, pct: Math.round((nUnknown/total)*100), color: "#fc8181" },
            { label: "Belum disentuh", value: nUntouched, pct: Math.round((nUntouched/total)*100), color: "#718096" },
          ].map(s => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 10, opacity: 0.5 }}>{s.pct}% · {s.label}</div>
            </div>
          ))}
        </div>
        {recentWrongQuiz > 0 && (
          <div style={{ textAlign: "center", marginTop: 10, fontSize: 11, color: "#fc8181", opacity: 0.85 }}>
            🔴 {recentWrongQuiz} kartu Kuis salah dalam 7 hari terakhir
          </div>
        )}
      </div>

      {/* Per-category bars */}
      <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 20, padding: "16px", border: "1px solid rgba(255,255,255,0.08)", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ fontSize: 11, opacity: 0.4, textTransform: "uppercase", letterSpacing: 2 }}>Per Kategori</div>
          <div style={{ fontSize: 9, color: "#475569" }}>⬇ butuh perhatian terbesar</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {catStats.map(s => {
            const pct = Math.round((s.known / s.total) * 100);
            return (
              <div key={s.cat}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <div style={{ fontSize: 12 }}>{s.emoji} {s.label}</div>
                  <div style={{ fontSize: 11, opacity: 0.6 }}>{s.known}/{s.total}{s.unknown > 0 ? <span style={{ color: "#fc8181", marginLeft: 4 }}>✗{s.unknown}</span> : null} · <span style={{ color: pct >= 70 ? "#68d391" : pct >= 40 ? "#f6ad55" : "#fc8181", fontWeight: 700 }}>{pct}%</span></div>
                </div>
                <div style={{ height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: pct >= 70 ? "linear-gradient(90deg,#68d391,#38b2ac)" : pct >= 40 ? "#f6ad55" : "#fc8181", borderRadius: 99, transition: "width 0.5s" }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top wrong JAC */}
      {topJAC.length > 0 && (
        <div style={{ background: "rgba(102,126,234,0.08)", borderRadius: 20, padding: "16px", border: "1px solid rgba(102,126,234,0.2)", marginBottom: 12 }}>
          <div style={{ fontSize: 11, opacity: 0.4, textTransform: "uppercase", letterSpacing: 2, marginBottom: 10 }}>Top Salah — Soal JAC</div>
          {topJAC.map(({ q, cnt }) => (
            <div key={q.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ fontSize: 12, flex: 1, paddingRight: 8, lineHeight: 1.4 }}>{q.id_text}</div>
              <div style={{ background: "rgba(239,68,68,0.3)", borderRadius: 6, padding: "2px 7px", fontSize: 11, color: "#fc8181", fontWeight: 700, flexShrink: 0 }}>✗ {cnt}×</div>
            </div>
          ))}
        </div>
      )}

      {/* Top wrong Quiz */}
      {topQuiz.length > 0 && (
        <div style={{ background: "rgba(246,211,101,0.06)", borderRadius: 20, padding: "16px", border: "1px solid rgba(246,211,101,0.15)" }}>
          <div style={{ fontSize: 11, opacity: 0.4, textTransform: "uppercase", letterSpacing: 2, marginBottom: 10 }}>Top Salah — Kuis Kartu</div>
          {topQuiz.map(({ card, cnt }) => (
            <div key={card.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              <div style={{ flex: 1, paddingRight: 8 }}>
                <div style={{ fontSize: 13, fontFamily: "'Noto Sans JP', sans-serif", fontWeight: 700 }}>{stripFuri(card.jp)}</div>
                <div style={{ fontSize: 11, opacity: 0.55 }}>{card.id_text}</div>
              </div>
              <div style={{ background: "rgba(239,68,68,0.3)", borderRadius: 6, padding: "2px 7px", fontSize: 11, color: "#fc8181", fontWeight: 700, flexShrink: 0 }}>✗ {cnt}×</div>
            </div>
          ))}
        </div>
      )}

      {topJAC.length === 0 && topQuiz.length === 0 && (
        <div style={{ textAlign: "center", opacity: 0.35, fontSize: 12, padding: "12px 0" }}>Belum ada data salah — mulai Kuis atau Soal JAC dulu! 💪</div>
      )}

      {/* ── P13: Export / Import Progress ── */}
      <ExportImportPanel />
    </div>
  );
}


export default StatsMode;
