// ─── StatsMode.jsx ────────────────────────────────────────────────────────────
// Note: miniValue colors are dynamic per card type (T.gold/T.correct/#60a5fa) — kept inline.
// Note: catPct color is dynamic threshold-based (≥70/≥40) — kept inline.
// Note: chartBar height/background/border/opacity are fully dynamic — kept inline.
// Note: readinessRing stroke color is threshold-based (red/amber/green) — kept inline.
import { T } from '../styles/theme.js';
import { CARDS } from '../data/cards.js';
import { CATEGORIES } from '../data/categories.js';
import { getWrongCount } from '../utils/wrong-tracker.js';
import ProgressBar from '../components/ProgressBar.jsx';
import ProgressRing from '../components/ProgressRing.jsx';
import S from './modes.module.css';
import ST from './StatsMode.module.css';

function calcReadiness({ srs, sessions = [], streakData }) {
  const matureCards = srs?.stats?.mature ?? 0;
  const totalCards = CARDS.length || 1;
  const streak = streakData?.days ?? 0;

  const quizSessions = sessions.filter((s) => ['kuis', 'jac', 'wayground'].includes(s.mode));
  const avgQuizAccuracy = quizSessions.length > 0
    ? quizSessions.reduce((acc, s) => acc + (s.total > 0 ? (s.correct / s.total) * 100 : 0), 0) / quizSessions.length
    : 0;

  const simSessions = sessions.filter((s) => s.mode === 'simulasi');
  const bestSimScore = simSessions.length > 0
    ? Math.max(...simSessions.map((s) => (s.total > 0 ? (s.correct / s.total) * 100 : 0)))
    : 0;

  const readiness = (
    (matureCards / totalCards) * 40 +
    (avgQuizAccuracy / 100) * 35 +
    (Math.min(streak, 14) / 14) * 15 +
    (bestSimScore > 65 ? bestSimScore / 100 : 0) * 10
  ) * 100;

  return Math.min(100, Math.round(readiness));
}

export default function StatsMode({ known, unknown, quizWrong = {}, srs, streakData, sessions = [], onExit }) {
  const total = CARDS.length;
  const knownN = known.size;
  const unknownN = unknown.size;
  const untouched = total - knownN - unknownN;
  const pct = Math.round((knownN / total) * 100);
  const streak = streakData?.days ?? 0;

  const readiness = calcReadiness({ srs, sessions, streakData });
  const ringColor = readiness >= 75 ? T.correct : readiness >= 50 ? T.gold : T.wrong;
  const readinessLabel = readiness >= 75 ? 'Siap Ujian! 🎉' : readiness >= 50 ? 'Hampir Siap' : 'Belum Siap';

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

      {/* Exam Readiness Score */}
      <div className={`${S.cardLg} ${ST.overviewCard}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, paddingBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1, color: T.textDim, textTransform: 'uppercase', marginBottom: 4 }}>Kesiapan Ujian</div>
        {/* Render ProgressRing with dynamic color via CSS var override */}
        <div style={{ '--ssw-ringColor': ringColor, position: 'relative' }}>
          <svg width={140} height={140} style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)', zIndex: 2 }}>
            <circle cx={70} cy={70} r={60} fill="none" stroke={ringColor} strokeWidth={10} strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 60}
              strokeDashoffset={2 * Math.PI * 60 * (1 - readiness / 100)}
              style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1), stroke 0.5s' }}
            />
          </svg>
          <ProgressRing current={readiness} total={100} size={140} stroke={10} label={readinessLabel} />
        </div>
        <div style={{ fontSize: 13, color: ringColor, fontWeight: 700, marginTop: 2 }}>{readinessLabel}</div>
      </div>

      {/* Overview */}
      <div className={`${S.cardLg} ${ST.overviewCard}`}>
        <div className={ST.overviewPct} style={{ color: T.gold }}>{pct}%</div>
        <div className={ST.overviewSub}>kartu sudah dihafal</div>
        <ProgressBar current={knownN} total={total} color={T.correct} />
        <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 14, fontSize: 12 }}>
          <span className={ST.overviewKnown}>✅ {knownN} hafal</span>
          <span className={ST.overviewUnknown}>❌ {unknownN} belum</span>
          <span className={ST.overviewUntouched}>⬜ {untouched} belum dicek</span>
        </div>
      </div>

      {/* Streak + SRS mini cards */}
      {(streak > 0 || mature !== null) && (
        <div
          className={ST.miniGrid}
          style={{ display: 'grid', gridTemplateColumns: streak > 0 && mature !== null ? '1fr 1fr 1fr 1fr' : '1fr 1fr 1fr' }}
        >
          {streak > 0 && (
            <div className={ST.miniCard}>
              <div className={ST.miniEmoji}>🔥</div>
              <div className={ST.miniValue} style={{ color: T.gold }}>{streak}</div>
              <div className={ST.miniLabel}>hari streak</div>
            </div>
          )}
          {mature !== null && (
            <>
              <div className={ST.miniCard}>
                <div className={ST.miniEmoji}>🌟</div>
                <div className={ST.miniValue} style={{ color: T.correct }}>{mature}</div>
                <div className={ST.miniLabel}>Matang</div>
              </div>
              <div className={ST.miniCard}>
                <div className={ST.miniEmoji}>📗</div>
                <div className={ST.miniValue} style={{ color: T.gold }}>{young}</div>
                <div className={ST.miniLabel}>Berkemb.</div>
              </div>
              <div className={ST.miniCard}>
                <div className={ST.miniEmoji}>📘</div>
                <div className={ST.miniValue} style={{ color: '#60a5fa' }}>{newCards}</div>
                <div className={ST.miniLabel}>Baru SRS</div>
              </div>
            </>
          )}
        </div>
      )}

      {dueCount > 0 && (
        <div className={ST.dueBanner}>
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
          <div className={ST.chartWrap}>
            {days.map((d) => {
              const dayS = byDate[d] ?? [];
              const count = dayS.length;
              const h = count === 0 ? 4 : Math.max(12, Math.round((count / maxC) * 52));
              const dominant = dayS.reduce((acc, s) => { acc[s.mode] = (acc[s.mode] ?? 0) + 1; return acc; }, {});
              const topMode = Object.entries(dominant).sort((a, b) => b[1] - a[1])[0]?.[0];
              const color = topMode ? (MODE_COLORS[topMode] ?? T.amber) : T.border;
              const label = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'][new Date(d + 'T00:00:00').getDay()];
              const isToday = new Date(d + 'T00:00:00').toDateString() === new Date().toDateString();
              return (
                <div key={d} className={ST.chartCol}>
                  <div className={ST.chartCount}>{count > 0 ? count : ''}</div>
                  <div
                    style={{ width: '100%', height: h, borderRadius: 4, background: count === 0 ? T.surface : color, border: `1px solid ${count === 0 ? T.border : color}`, opacity: count === 0 ? 0.4 : 1, transition: 'height 0.3s ease' }}
                    title={`${d}: ${count} sesi`}
                  />
                  <div className={ST.chartLabel} style={{ fontWeight: isToday ? 700 : 400 }}>{label}</div>
                </div>
              );
            })}
          </div>
        );
      })()}

      <div className={S.sectionLabel}>Per Kategori</div>
      <div className={`${S.list} ${ST.catList}`}>
        {catStats.map((c) => (
          <div key={c.key} className={ST.catItem}>
            <span className={ST.catEmoji}>{c.emoji}</span>
            <div className={ST.catBody}>
              <div className={`${S.rowSpread} ${ST.catRow}`}>
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
          <div className={ST.weakBox}>
            {weakest.map((c) => (
              <div key={c.key} className={ST.weakItem}>{c.emoji} {c.label} — {c.pct}% ({c.known}/{c.total})</div>
            ))}
          </div>
        </>
      )}

      {wrongEntries.length > 0 && (
        <>
          <div className={S.sectionLabel}>Sering Salah</div>
          <div className={`${S.list}`} style={{ gap: 4 }}>
            {wrongEntries.map((e) => {
              const card = CARDS.find((c) => c.id === e.id);
              if (!card) return null;
              return (
                <div key={e.id} className={`${S.rowSpread} ${ST.wrongRow}`}>
                  <span className={ST.wrongJp}>{card.jp?.slice(0, 20)}</span>
                  <span className={ST.wrongCount}>{e.count}× salah</span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
