import { T } from '../styles/theme.js';
import { CARDS } from '../data/cards.js';
import { CATEGORIES } from '../data/categories.js';
import { getWrongCount } from '../utils/wrong-tracker.js';
import ProgressBar from '../components/ProgressBar.jsx';
import S from './modes.module.css';

export default function StatsMode({ known, unknown, quizWrong = {}, srs, streakData, sessions = [], onExit }) {
  const total = CARDS.length;
  const knownN = known.size;
  const unknownN = unknown.size;
  const untouched = total - knownN - unknownN;
  const pct = Math.round((knownN / total) * 100);
  const streak = streakData?.days ?? 0;

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

  const mature   = srs?.stats?.mature   ?? null;
  const young    = srs?.stats?.young    ?? null;
  const newCards = srs?.stats?.new      ?? null;
  const dueCount = srs?.dueCount        ?? 0;

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

      {/* Streak + SRS mini cards */}
      {(streak > 0 || mature !== null) && (
        <div style={{ display: 'grid', gridTemplateColumns: streak > 0 && mature !== null ? '1fr 1fr 1fr 1fr' : '1fr 1fr 1fr', gap: 8, marginBottom: 20 }}>
          {streak > 0 && (
            <div style={{ padding: '10px 6px', borderRadius: T.r.md, background: T.surface, border: `1px solid ${T.border}`, textAlign: 'center' }}>
              <div style={{ fontSize: 14 }}>🔥</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: T.gold }}>{streak}</div>
              <div style={{ fontSize: 10, color: T.textDim }}>hari streak</div>
            </div>
          )}
          {mature !== null && (
            <>
              <div style={{ padding: '10px 6px', borderRadius: T.r.md, background: T.surface, border: `1px solid ${T.border}`, textAlign: 'center' }}>
                <div style={{ fontSize: 14 }}>🌟</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: T.correct }}>{mature}</div>
                <div style={{ fontSize: 10, color: T.textDim }}>Matang</div>
              </div>
              <div style={{ padding: '10px 6px', borderRadius: T.r.md, background: T.surface, border: `1px solid ${T.border}`, textAlign: 'center' }}>
                <div style={{ fontSize: 14 }}>📗</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: T.gold }}>{young}</div>
                <div style={{ fontSize: 10, color: T.textDim }}>Berkemb.</div>
              </div>
              <div style={{ padding: '10px 6px', borderRadius: T.r.md, background: T.surface, border: `1px solid ${T.border}`, textAlign: 'center' }}>
                <div style={{ fontSize: 14 }}>📘</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#60a5fa' }}>{newCards}</div>
                <div style={{ fontSize: 10, color: T.textDim }}>Baru SRS</div>
              </div>
            </>
          )}
        </div>
      )}
      {dueCount > 0 && (
        <div style={{ padding: '10px 14px', borderRadius: T.r.md, background: 'rgba(251,191,36,0.07)', border: '1px solid rgba(251,191,36,0.3)', marginBottom: 20, fontSize: 12, color: T.gold, fontWeight: 600 }}>
          🔁 {dueCount} kartu SRS jatuh tempo hari ini — siap diulang!
        </div>
      )}


      <div className={S.sectionLabel}>7 Hari Terakhir</div>
      {(() => {
        const MODE_COLORS = { ulasan: '#22c55e', kuis: '#f59e0b', kartu: '#60a5fa', sprint: '#a78bfa', fokus: '#f472b6', jac: '#fb923c', angka: '#34d399', jebak: '#f87171' };
        const days = Array.from({ length: 7 }, (_, i) => {
          const d = new Date(); d.setDate(d.getDate() - (6 - i));
          return d.toISOString().slice(0, 10);
        });
        const byDate = {};
        sessions.forEach((sess) => { const date = sess.date?.slice(0, 10); if (date && byDate[date] === undefined) byDate[date] = []; byDate[date]?.push(sess); });
        const counts = days.map((d) => (byDate[d] ?? []).length);
        const maxC = Math.max(...counts, 1);
        return (
          <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 60, marginBottom: 20, padding: '0 4px' }}>
            {days.map((d, i) => {
              const dayS = byDate[d] ?? [];
              const count = dayS.length;
              const h = count === 0 ? 4 : Math.max(12, Math.round((count / maxC) * 52));
              const dominant = dayS.reduce((acc, s) => { acc[s.mode] = (acc[s.mode] ?? 0) + 1; return acc; }, {});
              const topMode = Object.entries(dominant).sort((a, b) => b[1] - a[1])[0]?.[0];
              const color = topMode ? (MODE_COLORS[topMode] ?? T.amber) : T.border;
              const label = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'][new Date(d + 'T00:00:00').getDay()];
              return (
                <div key={d} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div style={{ fontSize: 9, color: T.textDim }}>{count > 0 ? count : ''}</div>
                  <div style={{ width: '100%', height: h, borderRadius: 4, background: count === 0 ? T.surface : color, border: `1px solid ${count === 0 ? T.border : color}`, opacity: count === 0 ? 0.4 : 1, transition: 'height 0.3s ease' }} title={`${d}: ${count} sesi`} />
                  <div style={{ fontSize: 9, color: T.textDim, fontWeight: new Date(d + 'T00:00:00').toDateString() === new Date().toDateString() ? 700 : 400 }}>{label}</div>
                </div>
              );
            })}
          </div>
        );
      })()}

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
