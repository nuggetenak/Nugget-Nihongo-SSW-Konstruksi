import { T } from '../styles/theme.js';
import { CARDS } from '../data/cards.js';

import { CATEGORIES } from '../data/categories.js';
import { getWrongCount } from '../utils/wrong-tracker.js';
import ProgressBar from '../components/ProgressBar.jsx';

export default function StatsMode({ known, unknown, quizWrong = {}, onExit }) {
  const total = CARDS.length;
  const knownN = known.size;
  const unknownN = unknown.size;
  const untouched = total - knownN - unknownN;
  const pct = Math.round((knownN / total) * 100);

  // Category breakdown
  const catStats = CATEGORIES.filter((c) => c.key !== 'all' && c.key !== 'bintang')
    .map((cat) => {
      const catCards = CARDS.filter((c) => c.category === cat.key);
      const catKnown = catCards.filter((c) => known.has(c.id)).length;
      return {
        ...cat,
        total: catCards.length,
        known: catKnown,
        pct: catCards.length > 0 ? Math.round((catKnown / catCards.length) * 100) : 0,
      };
    })
    .sort((a, b) => a.pct - b.pct);

  // Weakest topics
  const weakest = catStats.filter((c) => c.pct < 50).slice(0, 5);

  // Most-wrong cards
  const wrongEntries = Object.entries(quizWrong)
    .map(([id, val]) => ({ id: Number(id), count: getWrongCount(val) }))
    .filter((e) => e.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return (
    <div style={{ padding: '24px 16px', maxWidth: T.maxW, margin: '0 auto' }}>
      <button
        onClick={onExit}
        style={{
          fontFamily: 'inherit',
          fontSize: 12,
          color: T.textMuted,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          marginBottom: 16,
        }}
      >
        ← Kembali
      </button>
      <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>📊 Statistik</h2>

      {/* Overview Card */}
      <div
        style={{
          padding: '20px 16px',
          background: T.surface,
          borderRadius: T.r.lg,
          border: `1px solid ${T.border}`,
          marginBottom: 20,
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 36, fontWeight: 800, color: T.gold }}>{pct}%</div>
        <div style={{ fontSize: 13, color: T.textMuted, marginBottom: 12 }}>
          kartu sudah dihafal
        </div>
        <ProgressBar current={knownN} total={total} color={T.correct} />
        <div
          style={{ display: 'flex', justifyContent: 'space-around', marginTop: 14, fontSize: 12 }}
        >
          <span style={{ color: T.correct }}>✅ {knownN} hafal</span>
          <span style={{ color: T.wrong }}>❌ {unknownN} belum</span>
          <span style={{ color: T.textDim }}>⬜ {untouched} belum dicek</span>
        </div>
      </div>

      {/* Category Breakdown */}
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: 1.5,
          color: T.textDim,
          textTransform: 'uppercase',
          marginBottom: 8,
        }}
      >
        Per Kategori
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
        {catStats.map((c) => (
          <div
            key={c.key}
            style={{
              padding: '10px 12px',
              background: T.surface,
              borderRadius: T.r.sm,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <span style={{ fontSize: 14 }}>{c.emoji}</span>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 12,
                  marginBottom: 4,
                }}
              >
                <span>{c.label}</span>
                <span style={{ color: c.pct >= 70 ? T.correct : c.pct >= 40 ? T.gold : T.wrong }}>
                  {c.pct}%
                </span>
              </div>
              <ProgressBar
                current={c.known}
                total={c.total}
                color={c.pct >= 70 ? T.correct : c.pct >= 40 ? T.gold : T.wrong}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Weakest */}
      {weakest.length > 0 && (
        <>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 1.5,
              color: T.textDim,
              textTransform: 'uppercase',
              marginBottom: 8,
            }}
          >
            ⚠️ Perlu Fokus
          </div>
          <div
            style={{
              padding: '12px 14px',
              background: T.wrongBg,
              borderRadius: T.r.md,
              border: `1px solid ${T.wrongBorder}`,
              marginBottom: 20,
            }}
          >
            {weakest.map((c) => (
              <div key={c.key} style={{ fontSize: 12, color: T.wrong, padding: '4px 0' }}>
                {c.emoji} {c.label} — {c.pct}% ({c.known}/{c.total})
              </div>
            ))}
          </div>
        </>
      )}

      {/* Most Wrong */}
      {wrongEntries.length > 0 && (
        <>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: 1.5,
              color: T.textDim,
              textTransform: 'uppercase',
              marginBottom: 8,
            }}
          >
            Sering Salah
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {wrongEntries.map((e) => {
              const card = CARDS.find((c) => c.id === e.id);
              if (!card) return null;
              return (
                <div
                  key={e.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    background: T.surface,
                    borderRadius: T.r.sm,
                    fontSize: 12,
                  }}
                >
                  <span style={{ fontFamily: T.fontJP }}>{card.jp?.slice(0, 20)}</span>
                  <span style={{ color: T.wrong, fontWeight: 600 }}>{e.count}× salah</span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
