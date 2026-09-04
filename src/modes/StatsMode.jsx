// ─── StatsMode.jsx ────────────────────────────────────────────────────────────
// Note: miniValue colors are dynamic per card type (T.gold/T.correct/#60a5fa) — kept inline.
// Note: catPct color is dynamic threshold-based (≥70/≥40) — kept inline.
// Note: chartBar height/background/border/opacity are fully dynamic — kept inline.
// Note: readinessRing stroke color is threshold-based (red/amber/green) — kept inline.
import { T } from '../styles/theme.js';
import { CARDS } from '../data/cards.js';
import { CATEGORIES } from '../data/categories.js';
import { getWrongCount } from '../utils/wrong-tracker.js';
import { calcReadiness } from '../utils/session-analytics.js';
import { isoToLocalDate } from '../utils/date.js';
import { stripFuri } from '../utils/jp-helpers.js';
import { MODE_META } from '../router/modes.js';
import ProgressBar from '../components/ProgressBar.jsx';
import ProgressRing from '../components/ProgressRing.jsx';
import StudyHeatmap from '../components/StudyHeatmap.jsx';
import S from './modes.module.css';
import ST from './StatsMode.module.css';

export default function StatsMode({
  known,
  unknown,
  quizWrong = {},
  srs,
  streakData,
  sessions = [],
  onExit,
}) {
  const total = CARDS.length;
  const knownN = known.size;
  const unknownN = unknown.size;
  const untouched = total - knownN - unknownN;
  const pct = Math.round((knownN / total) * 100);
  const streak = streakData?.days ?? 0;

  const readiness = calcReadiness({ srs, sessions, streakData });
  const ringColor = readiness >= 75 ? T.correct : readiness >= 50 ? T.gold : T.wrong;
  const readinessLabel =
    readiness >= 75 ? 'Siap Ujian! 🎉' : readiness >= 50 ? 'Hampir Siap' : 'Belum Siap';

  // Build quiz accuracy per category from wrong-tracker data.
  // quizWrong { [cardId]: wrongEntry } — cards with wrong entries have known errors
  // For each category, compute: totalAttempted (cards seen in quiz), wrongCount
  const quizWrongByCard = Object.fromEntries(
    Object.entries(quizWrong).map(([id, val]) => [Number(id), getWrongCount(val)])
  );

  const catStats = CATEGORIES.filter((c) => c.key !== 'all' && c.key !== 'bintang')
    .map((cat) => {
      const catCards = CARDS.filter((c) => c.category === cat.key);
      const catKnown = catCards.filter((c) => known.has(c.id)).length;
      // Quiz accuracy — cards with wrong data in this category.
      const catWrongCount = catCards.reduce((sum, c) => sum + (quizWrongByCard[c.id] ?? 0), 0);
      const catAttempted = catCards.filter((c) => quizWrongByCard[c.id] !== undefined).length;
      // quizAcc: if no data yet, null; otherwise approximate (known as correct proxy)
      const quizAcc =
        catAttempted > 0
          ? Math.max(0, Math.round(100 - (catWrongCount / Math.max(catAttempted, 1)) * 10))
          : null;
      return {
        ...cat,
        total: catCards.length,
        known: catKnown,
        pct: catCards.length > 0 ? Math.round((catKnown / catCards.length) * 100) : 0,
        quizAcc, // quiz accuracy estimate (null if no data)
        catWrongCount, // total wrong answers in this category
        catAttempted, // cards with quiz data in this category
      };
    })
    .sort((a, b) => a.pct - b.pct);

  const weakest = catStats.filter((c) => c.pct < 50).slice(0, 5);
  const wrongEntries = Object.entries(quizWrong)
    .map(([id, val]) => ({ id: Number(id), count: getWrongCount(val) }))
    .filter((e) => e.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const mature = srs?.stats?.mature ?? null;
  const young = srs?.stats?.young ?? null;
  const newCards = srs?.stats?.new ?? null;
  const dueCount = srs?.dueCount ?? 0;

  return (
    <div className={S.page}>
      <button className={S.btnBack} onClick={onExit}>
        ← Kembali
      </button>
      <h2 className={S.pageTitle} style={{ marginBottom: 16 }}>
        📊 Statistik
      </h2>

      {/* Exam Readiness Score + Overview — paired at wide widths, see .summaryRow */}
      <div className={ST.summaryRow}>
        <div
          className={`${S.cardLg} ${ST.overviewCard}`}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 10,
            paddingBottom: 20,
          }}
        >
          <div
            style={{
              fontSize: 'var(--fs-body)',
              fontWeight: 700,
              letterSpacing: 1,
              color: T.textDim,
              textTransform: 'uppercase',
              marginBottom: 4,
            }}
          >
            Kesiapan Ujian
          </div>
          {/* Render ProgressRing with dynamic color via CSS var override */}
          <div style={{ '--ssw-ringColor': ringColor, position: 'relative' }}>
            <svg
              width={140}
              height={140}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                transform: 'rotate(-90deg)',
                zIndex: 2,
              }}
            >
              <circle
                cx={70}
                cy={70}
                r={60}
                fill="none"
                stroke={ringColor}
                strokeWidth={10}
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 60}
                strokeDashoffset={2 * Math.PI * 60 * (1 - readiness / 100)}
                style={{
                  transition: 'stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1), stroke 0.5s',
                }}
              />
            </svg>
            <ProgressRing
              current={readiness}
              total={100}
              size={140}
              stroke={10}
              label={readinessLabel}
            />
          </div>
          <div
            style={{ fontSize: 'var(--fs-body)', color: ringColor, fontWeight: 700, marginTop: 2 }}
          >
            {readinessLabel}
          </div>
        </div>

        {/* Overview */}
        <div className={`${S.cardLg} ${ST.overviewCard}`}>
          <div className={ST.overviewPct} style={{ color: T.gold }}>
            {pct}%
          </div>
          <div className={ST.overviewSub}>kartu sudah dihafal</div>
          <ProgressBar current={knownN} total={total} color={T.correct} />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-around',
              marginTop: 14,
              fontSize: 'var(--fs-caption)',
            }}
          >
            <span className={ST.overviewKnown}>✅ {knownN} hafal</span>
            <span className={ST.overviewUnknown}>❌ {unknownN} belum</span>
            <span className={ST.overviewUntouched}>⬜ {untouched} belum dicek</span>
          </div>
        </div>
      </div>

      {/* Streak + SRS mini cards */}
      {(streak > 0 || mature !== null) && (
        <div
          className={ST.miniGrid}
          style={{
            display: 'grid',
            gridTemplateColumns: streak > 0 && mature !== null ? '1fr 1fr 1fr 1fr' : '1fr 1fr 1fr',
          }}
        >
          {streak > 0 && (
            <div className={ST.miniCard}>
              <div className={ST.miniEmoji}>🔥</div>
              <div className={ST.miniValue} style={{ color: T.gold }}>
                {streak}
              </div>
              <div className={ST.miniLabel}>hari streak</div>
            </div>
          )}
          {mature !== null && (
            <>
              <div className={ST.miniCard}>
                <div className={ST.miniEmoji}>🌟</div>
                <div className={ST.miniValue} style={{ color: T.correct }}>
                  {mature}
                </div>
                <div className={ST.miniLabel}>Matang</div>
              </div>
              <div className={ST.miniCard}>
                <div className={ST.miniEmoji}>📗</div>
                <div className={ST.miniValue} style={{ color: T.gold }}>
                  {young}
                </div>
                <div className={ST.miniLabel}>Berkemb.</div>
              </div>
              <div className={ST.miniCard}>
                <div className={ST.miniEmoji}>📘</div>
                <div className={ST.miniValue} style={{ color: '#60a5fa' }}>
                  {newCards}
                </div>
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

      <div className={S.sectionLabel}>📅 Kalender Belajar</div>
      <div className={`${S.cardLg} ${ST.heatmapCard}`}>
        <StudyHeatmap sessions={sessions} />
      </div>

      <div className={S.sectionLabel}>7 Hari Terakhir</div>
      {(() => {
        const days = Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          return d.toISOString().slice(0, 10);
        });
        const byDate = {};
        sessions.forEach((sess) => {
          // isoToLocalDate (already used by StudyHeatmap two sections up, for
          // this exact sessions array) instead of a raw sess.date?.slice(0,10):
          // recordSession (ProgressContext.jsx) always writes an ISO string
          // today, but this crashed the whole mode -- not just this chart --
          // on any session whose date isn't a string (e.g. a hand-edited or
          // future-format Impor Progress JSON; validateSnapshot doesn't check
          // individual session shapes). new Date(...) accepts a number fine,
          // so this tolerates that instead of throwing.
          const date = isoToLocalDate(sess.date);
          if (date && byDate[date] === undefined) byDate[date] = [];
          byDate[date]?.push(sess);
        });
        const counts = days.map((d) => (byDate[d] ?? []).length);
        const maxC = Math.max(...counts, 1);
        return (
          <div className={ST.chartWrap}>
            {days.map((d) => {
              const dayS = byDate[d] ?? [];
              const count = dayS.length;
              const h = count === 0 ? 4 : Math.max(12, Math.round((count / maxC) * 52));
              const dominant = dayS.reduce((acc, s) => {
                acc[s.mode] = (acc[s.mode] ?? 0) + 1;
                return acc;
              }, {});
              const topMode = Object.entries(dominant).sort((a, b) => b[1] - a[1])[0]?.[0];
              const color = topMode ? (MODE_META[topMode]?.color ?? T.amber) : T.border;
              const label = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'][
                new Date(d + 'T00:00:00').getDay()
              ];
              const isToday =
                new Date(d + 'T00:00:00').toDateString() === new Date().toDateString();
              return (
                <div key={d} className={ST.chartCol}>
                  <div className={ST.chartCount}>{count > 0 ? count : ''}</div>
                  <div
                    style={{
                      width: '100%',
                      height: h,
                      borderRadius: 4,
                      background: count === 0 ? T.surface : color,
                      border: `1px solid ${count === 0 ? T.border : color}`,
                      opacity: count === 0 ? 0.4 : 1,
                      transition: 'height 0.3s ease',
                    }}
                    title={`${d}: ${count} sesi`}
                  />
                  <div className={ST.chartLabel} style={{ fontWeight: isToday ? 700 : 400 }}>
                    {label}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })()}

      <div className={S.sectionLabel}>Per Kategori</div>
      {/* This week vs last week */}
      {(() => {
        const now = new Date();
        const startOfWeek = (d) => {
          const s = new Date(d);
          s.setDate(s.getDate() - s.getDay());
          s.setHours(0, 0, 0, 0);
          return s;
        };
        const thisWeekStart = startOfWeek(now).getTime();
        const lastWeekStart = thisWeekStart - 7 * 86400000;
        const thisWeek = sessions.filter((s) => {
          const t = new Date(s.date).getTime();
          return t >= thisWeekStart;
        });
        const lastWeek = sessions.filter((s) => {
          const t = new Date(s.date).getTime();
          return t >= lastWeekStart && t < thisWeekStart;
        });
        if (thisWeek.length === 0 && lastWeek.length === 0) return null;
        const diff = thisWeek.length - lastWeek.length;
        const diffColor = diff > 0 ? T.correct : diff < 0 ? T.wrong : T.textMuted;
        const diffLabel = diff > 0 ? `+${diff}` : String(diff);
        return (
          <div
            style={{
              background: T.surface,
              border: `1px solid ${T.border}`,
              borderRadius: 10,
              padding: '10px 14px',
              marginBottom: 16,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: 8,
              textAlign: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: 'var(--fs-micro)', color: T.textDim, fontWeight: 700 }}>
                MINGGU LALU
              </div>
              <div
                style={{ fontSize: 'var(--fs-page-title)', fontWeight: 800, color: T.textMuted }}
              >
                {lastWeek.length}
              </div>
              <div style={{ fontSize: 'var(--fs-nano)', color: T.textDim }}>sesi</div>
            </div>
            <div
              style={{ borderLeft: `1px solid ${T.border}`, borderRight: `1px solid ${T.border}` }}
            >
              <div style={{ fontSize: 'var(--fs-micro)', color: T.textDim, fontWeight: 700 }}>
                PERUBAHAN
              </div>
              <div style={{ fontSize: 'var(--fs-page-title)', fontWeight: 800, color: diffColor }}>
                {diff === 0 ? '=' : diffLabel}
              </div>
              <div style={{ fontSize: 'var(--fs-nano)', color: T.textDim }}>sesi</div>
            </div>
            <div>
              <div style={{ fontSize: 'var(--fs-micro)', color: T.textDim, fontWeight: 700 }}>
                MINGGU INI
              </div>
              <div style={{ fontSize: 'var(--fs-page-title)', fontWeight: 800, color: T.amber }}>
                {thisWeek.length}
              </div>
              <div style={{ fontSize: 'var(--fs-nano)', color: T.textDim }}>sesi</div>
            </div>
          </div>
        );
      })()}
      <div className={`${S.list} ${ST.catList}`}>
        {catStats.map((c) => (
          <div key={c.key} className={ST.catItem}>
            <span className={ST.catEmoji}>{c.emoji}</span>
            <div className={ST.catBody}>
              <div className={`${S.rowSpread} ${ST.catRow}`}>
                <span>{c.label}</span>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {/* Quiz accuracy badge */}
                  {c.quizAcc !== null && (
                    <span
                      style={{
                        fontSize: 'var(--fs-micro)',
                        fontWeight: 700,
                        color: T.textDim,
                        background: T.surface,
                        border: `1px solid ${T.border}`,
                        borderRadius: 4,
                        padding: '1px 5px',
                      }}
                    >
                      🎯 {c.quizAcc}%
                    </span>
                  )}
                  <span style={{ color: c.pct >= 70 ? T.correct : c.pct >= 40 ? T.gold : T.wrong }}>
                    {c.pct}%
                  </span>
                </div>
              </div>
              <ProgressBar
                current={c.known}
                total={c.total}
                color={c.pct >= 70 ? T.correct : c.pct >= 40 ? T.gold : T.wrong}
              />
              {/* Wrong answer count if any */}
              {c.catWrongCount > 0 && (
                <div style={{ fontSize: 'var(--fs-micro)', color: T.wrong, marginTop: 2 }}>
                  {c.catWrongCount}× salah dalam kuis
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {weakest.length > 0 && (
        <>
          <div className={S.sectionLabel}>⚠️ Perlu Fokus</div>
          <div className={ST.weakBox}>
            {weakest.map((c) => (
              <div key={c.key} className={ST.weakItem}>
                {c.emoji} {c.label} — {c.pct}% ({c.known}/{c.total})
              </div>
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
                  <span className={ST.wrongJp}>{stripFuri(card.jp)?.slice(0, 20)}</span>
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
