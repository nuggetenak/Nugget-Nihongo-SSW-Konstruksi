import { T } from '../styles/theme.js';
import { CARDS } from '../data/cards.js';
import { CATEGORIES } from '../data/categories.js';
import { getWrongCount } from '../utils/wrong-tracker.js';
import ProgressBar from '../components/ProgressBar.jsx';
import S from './modes.module.css';

export default function StatsMode({ known, unknown, quizWrong = {}, onExit }) {
  const total = CARDS.length;
  const knownN = known.size;
  const unknownN = unknown.size;
  const untouched = total - knownN - unknownN;
  const pct = Math.round((knownN / total) * 100);

  const catStats = CATEGORIES.filter((c) => c.key !== 'all' && c.key !== 'bintang')
    .map((cat) => {
      const catCards = CARDS.filter((c) => c.category === cat.key);
      const catKnown = catCards.filter((c) => known.has(c.id)).length;
      return { ...cat, total: catCards.length, known: catKnown, pct: catCards.length > 0 ? Math.round((catKnown / catCards.length) * 100) : 0 };
    })
    .sort((a, b) => a.pct - b.pct);

  const weakest = catStats.filter((c) => c.pct < 50).slice(0, 5);
  const wrongEntries = Object.entries(quizWrong)
    .map(([id, val]) => ({ id: Number(id), count: getWrongCount(val) }))
    .filter((e) => e.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  return (
    <div className={S.page}>
      <button className={S.btnBack} onClick={onExit}>← Kembali</button>
      <h2 className={S.pageTitle} style={{ marginBottom: 16 }}>📊 Statistik</h2>

      {/* Overview */}
      <div className={S.cardLg} style={{ marginBottom: 20, textAlign: 'center' }}>
        <div style={{ fontSize: 36, fontWeight: 800, color: T.gold }}>{pct}%</div>
        <div style={{ fontSize: 13, color: T.textMuted, marginBottom: 12 }}>kartu sudah dihafal</div>
        <ProgressBar current={knownN} total={total} color={T.correct} />
        <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 14, fontSize: 12 }}>
          <span style={{ color: T.correct }}>✅ {knownN} hafal</span>
          <span style={{ color: T.wrong }}>❌ {unknownN} belum</span>
          <span style={{ color: T.textDim }}>⬜ {untouched} belum dicek</span>
        </div>
      </div>

      <div className={S.sectionLabel}>Per Kategori</div>
      <div className={S.list} style={{ gap: 6, marginBottom: 20 }}>
        {catStats.map((c) => (
          <div key={c.key} style={{ padding: '10px 12px', background: T.surface, borderRadius: T.r.sm, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 14 }}>{c.emoji}</span>
            <div style={{ flex: 1 }}>
              <div className={S.rowSpread} style={{ fontSize: 12, marginBottom: 4 }}>
                <span>{c.label}</span>
                <span style={{ color: c.pct >= 70 ? T.correct : c.pct >= 40 ? T.gold : T.wrong }}>{c.pct}%</span>
              </div>
              <ProgressBar current={c.known} total={c.total} color={c.pct >= 70 ? T.correct : c.pct >= 40 ? T.gold : T.wrong} />
            </div>
          </div>
        ))}
      </div>

      {weakest.length > 0 && (
        <>
          <div className={S.sectionLabel}>⚠️ Perlu Fokus</div>
          <div style={{ padding: '12px 14px', background: T.wrongBg, borderRadius: T.r.md, border: `1px solid ${T.wrongBorder}`, marginBottom: 20 }}>
            {weakest.map((c) => (
              <div key={c.key} style={{ fontSize: 12, color: T.wrong, padding: '4px 0' }}>
                {c.emoji} {c.label} — {c.pct}% ({c.known}/{c.total})
              </div>
            ))}
          </div>
        </>
      )}

      {wrongEntries.length > 0 && (
        <>
          <div className={S.sectionLabel}>Sering Salah</div>
          <div className={S.list} style={{ gap: 4 }}>
            {wrongEntries.map((e) => {
              const card = CARDS.find((c) => c.id === e.id);
              if (!card) return null;
              return (
                <div key={e.id} className={S.rowSpread} style={{ padding: '8px 12px', background: T.surface, borderRadius: T.r.sm, fontSize: 12 }}>
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
