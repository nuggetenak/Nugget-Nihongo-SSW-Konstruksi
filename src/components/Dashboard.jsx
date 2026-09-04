// ─── Dashboard.jsx ──────────────────────────────────────────────────────────
// Home tab. Reads as a status board: what's urgent, where you stand, what to
// do next. The hazard rail (see global.css) marks anything time-sensitive.
// ─────────────────────────────────────────────────────────────────────────────
import { useMemo } from 'react';
import { useProgress } from '../contexts/ProgressContext.jsx';
import { useApp } from '../contexts/AppContext.jsx';
import { generateDailyMission, isMissionDoneToday } from '../utils/daily-mission.js';
import { calcReadinessBand } from '../utils/session-analytics.js';
import s from './Dashboard.module.css';
import { T } from '../styles/theme.js';
import { CARDS } from '../data/cards.js';
import { get as storageGet } from '../storage/engine.js';
import Icon from './Icon.jsx';
import { JpFront } from './JpDisplay.jsx';
import { JP_LIST_MAX } from '../utils/jp-helpers.js';
import { recommendMode } from '../utils/recommend-mode.js';
import { formatCount } from '../utils/format.js';
import { MODE_META } from '../router/modes.js';

const getRecent = () => (storageGet('progress')?.recentCards ?? []).slice(0, 5);

function getQuickStart(srs, examDate) {
  const sessions = storageGet('progress')?.sessions ?? [];
  const streak = storageGet('progress')?.streakData?.days ?? 0;
  const rec = recommendMode({ srsState: srs, sessions, streak, examDate });
  return {
    ui: MODE_META[rec.mode]?.ui ?? 'panah',
    label: rec.label,
    desc: rec.reason,
    mode: rec.mode,
  };
}

function getCountdownTier(daysLeft) {
  if (daysLeft === 0) return 'today';
  if (daysLeft <= 7) return 'critical';
  if (daysLeft <= 14) return 'warning';
  return 'info';
}

// Which modes appear as quick tiles. Only the keys live here — label and icon
// are read from MODE_META so this never drifts out of sync with the registry.
const QUICK_MODE_KEYS = ['kartu', 'kuis', 'sprint', 'jac'];
const QUICK_MODES = QUICK_MODE_KEYS.map((key) => ({
  key,
  ui: MODE_META[key]?.ui ?? 'more',
  label: MODE_META[key]?.short ?? MODE_META[key]?.label ?? key,
}));

export default function Dashboard({
  known,
  unknown,
  track,
  onNavigate,
  onChangeTrack,
  onGoTab,
  srs,
  isDark,
  onToggleTheme,
}) {
  const { prefs } = useApp();
  const furiganaPolicy = prefs?.furiganaPolicy ?? 'always';
  const total = CARDS.length;
  const knownN = known.size;
  const unknownN = unknown.size;
  const pct = total > 0 ? Math.round((knownN / total) * 100) : 0;
  const restN = Math.max(0, total - knownN - unknownN);

  const trackInfo = T.track[track] || T.track.lifeline;
  const { streakData, dailyCount, starred } = useProgress();
  const recentIds = useMemo(() => getRecent(), []);
  const recentCards = useMemo(
    () =>
      recentIds
        .map((id) => CARDS.find((c) => c.id === id))
        .filter(Boolean)
        .slice(0, 3),
    [recentIds]
  );

  const examDate = storageGet('prefs')?.examDate ?? null;
  const daysLeft = examDate ? Math.ceil((new Date(examDate) - new Date()) / 86400000) : null;
  const showCountdown = daysLeft !== null && daysLeft >= 0 && daysLeft <= 60;
  const tier = showCountdown ? getCountdownTier(daysLeft) : null;

  const readinessBand = useMemo(() => {
    if (!showCountdown || daysLeft === 0) return null; // too late to act on it today
    const sessions = storageGet('progress')?.sessions ?? [];
    const streakData = storageGet('progress')?.streakData ?? {};
    return calcReadinessBand({ srs, sessions, streakData });
  }, [showCountdown, daysLeft, srs]);

  const qs = getQuickStart(srs, examDate);
  const mission = useMemo(() => {
    try {
      return generateDailyMission();
    } catch {
      return null;
    }
  }, []);
  const missionDone = useMemo(() => {
    try {
      return isMissionDoneToday();
    } catch {
      return false;
    }
  }, []);

  // Percentages drive the meter widths directly — no rounding, so a 1% slice
  // still renders as a hairline rather than collapsing to nothing.
  const knownW = total > 0 ? (knownN / total) * 100 : 0;
  const unknownW = total > 0 ? (unknownN / total) * 100 : 0;

  return (
    <div className={s.container}>
      {/* ── Header ── */}
      <header className={s.header}>
        <div className={s.brand}>
          <h1 className={s.brandName}>SSW Konstruksi</h1>
          <div className={s.brandSub}>by Nugget Nihongo</div>
        </div>
        {/* Wide screens: the side nav already carries the brand, so the header
            switches to a page title instead of repeating it. Both stay in the
            DOM; display:none (in the 1040px breakpoint below) already excludes
            whichever one isn't shown from the accessibility tree on its own —
            no aria-hidden needed, and one was previously fighting that by
            hardcoding the wide-screen title out of the tree even once CSS
            made it the visible one. */}
        <div className={s.pageTitle}>
          <h1 className={s.pageTitleName}>Beranda</h1>
          <div className={s.pageTitleSub}>
            {streakData.days >= 2
              ? `Selamat datang kembali — ${streakData.days} hari berturut-turut`
              : 'Selamat datang kembali'}
          </div>
        </div>
        <div className={s.headerRight}>
          <button
            className={s.trackPill}
            onClick={onChangeTrack}
            style={{
              background: trackInfo.bg,
              border: `1px solid ${trackInfo.color}33`,
              color: trackInfo.color,
            }}
          >
            {trackInfo.icon} {trackInfo.jp}
          </button>
          <button className={s.themeBtn} onClick={onToggleTheme} aria-label="Ganti tema">
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      <div className={s.cols}>
        <div className={s.colMain}>
          {/* ── Exam countdown — hazard rail ── */}
          {showCountdown && (
            <div className={s.rail} data-tier={tier}>
              <div className={s.railTitle}>
                {daysLeft === 0 ? 'Hari ini ujian!' : `${daysLeft} hari lagi menuju ujian`}
              </div>
              <div className={s.railSub}>
                {daysLeft === 0
                  ? 'Semangat! Kamu sudah siap 💪'
                  : daysLeft <= 14
                    ? 'Masa kritis — prioritaskan Ulasan SRS'
                    : 'Jaga konsistensi belajar harian'}
              </div>
              {readinessBand && (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    marginTop: 8,
                    padding: '3px 10px',
                    borderRadius: 999,
                    fontSize: 'var(--fs-caption)',
                    fontWeight: 700,
                    background:
                      readinessBand.key === 'siap'
                        ? 'var(--ssw-correctBg)'
                        : readinessBand.key === 'cukup'
                          ? 'rgba(217, 119, 6, 0.15)'
                          : 'var(--ssw-wrongBg)',
                    color:
                      readinessBand.key === 'siap'
                        ? T.correct
                        : readinessBand.key === 'cukup'
                          ? T.gold
                          : T.wrong,
                  }}
                >
                  {readinessBand.label}
                </div>
              )}
            </div>
          )}
          {!showCountdown && !examDate && (
            <button className={s.hint} onClick={() => onGoTab?.('saya')}>
              <span className={s.hintIcon} aria-hidden="true">
                <Icon name="kalender" size={20} />
              </span>
              <span>
                <span className={s.hintTitle}>Belum atur tanggal ujian</span>
                <span className={s.hintSub}>
                  Atur di tab Saya supaya hitung mundur muncul di sini
                </span>
              </span>
            </button>
          )}

          {/* ── Progress meter ── */}
          <section className={s.statBlock} aria-label="Progres belajar">
            <div className={s.statTop}>
              <div>
                <div className={s.statBig}>{formatCount(knownN)} kartu hafal</div>
                <div className={s.statSub}>dari {formatCount(total)} kartu</div>
              </div>
              <div className={s.statPct}>{pct}%</div>
            </div>
            <div className={s.meter}>
              <div className={s.meterKnown} style={{ width: `${knownW}%` }} />
              <div className={s.meterUnknown} style={{ width: `${unknownW}%` }} />
            </div>
            <div className={s.legend}>
              <span className={s.lg}>
                <i className={s.dotKnown} />
                {formatCount(knownN)} hafal
              </span>
              <span className={s.lg}>
                <i className={s.dotUnknown} />
                {formatCount(unknownN)} belum
              </span>
              <span className={s.lg}>
                <i className={s.dotRest} />
                {formatCount(restN)} sisa
              </span>
            </div>
          </section>

          {/* ── Primary CTA ── */}
          <button className={s.cta} onClick={() => onNavigate(qs.mode)}>
            <span className={s.ctaIcon}>
              <Icon name={qs.ui} size={20} />
            </span>
            <span className={s.ctaBody}>
              <span className={s.ctaLabel}>{qs.label}</span>
              <span className={s.ctaDesc}>{qs.desc}</span>
            </span>
            <span className={s.ctaArrow} aria-hidden="true">
              <Icon name="panah" size={18} />
            </span>
          </button>

          {/* ── Streak ── */}
          {streakData.days >= 2 ? (
            <div className={s.streak}>
              <span className={s.streakIcon} aria-hidden="true">
                🔥
              </span>
              <div>
                <div className={s.streakDays}>{streakData.days} hari berturut-turut!</div>
                <div className={s.streakSub}>
                  {dailyCount.count > 0
                    ? `+${dailyCount.count} kartu hari ini`
                    : 'Jaga streakmu — belajar hari ini'}
                </div>
              </div>
            </div>
          ) : (
            <div className={s.streak}>
              <span className={s.streakIcon} aria-hidden="true">
                🔥
              </span>
              <div>
                <div className={s.streakDays}>Mulai streak-mu</div>
                <div className={s.streakSub}>
                  {dailyCount.count > 0
                    ? `+${dailyCount.count} kartu hari ini — lanjutkan besok`
                    : 'Belajar hari ini untuk mulai streak'}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={s.colSide}>
          {/* ── Daily mission — hazard rail (time-boxed to today) ── */}
          {mission && !missionDone && (
            <button className={s.railBtn} onClick={() => onNavigate(mission.mode)}>
              <span className={s.railBody}>
                <span className={s.railEyebrow}>Misi hari ini</span>
                <span className={s.railTitle}>{mission.label}</span>
              </span>
              <span className={s.railArrow} aria-hidden="true">
                <Icon name="panah" size={16} />
              </span>
            </button>
          )}
          {missionDone && (
            <div className={s.missionDone}>
              <span className={s.railEyebrow}>Misi hari ini</span>
              <span className={s.railTitle}>Selesai! Kembali besok 🌙</span>
            </div>
          )}

          {/* ── Quick grid ── */}
          <h2 className={s.secLabel}>Mulai belajar</h2>
          <div className={s.quickGrid}>
            {QUICK_MODES.map((m) => (
              <button key={m.key} className={s.quickTile} onClick={() => onNavigate(m.key)}>
                <span className={s.quickIcon}>
                  <Icon name={m.ui} size={22} />
                </span>
                <span className={s.quickLabel}>{m.label}</span>
              </button>
            ))}
          </div>

          {starred.size > 0 && (
            <button
              className={s.starredBtn}
              onClick={() => onNavigate('kuis', { filterIds: [...starred] })}
            >
              <Icon name="bintang" size={18} />
              Kuis Bintang ({starred.size})
            </button>
          )}

          {/* ── Recent ── */}
          {recentCards.length > 0 ? (
            <>
              <h2 className={s.secLabel}>Terakhir dipelajari</h2>
              <ul className={s.recentList}>
                {recentCards.map((c) => (
                  <li key={c.id} className={s.recentCard}>
                    <span className={s.recentJp}>
                      <JpFront
                        jp={c.jp}
                        furiganaPolicy={furiganaPolicy}
                        maxSize={JP_LIST_MAX}
                        compact
                      />
                    </span>
                    <span className={s.recentId}>{c.id_text}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <>
              <h2 className={s.secLabel}>Terakhir dipelajari</h2>
              <button className={s.hint} onClick={() => onNavigate('kartu')}>
                <span className={s.hintIcon} aria-hidden="true">
                  <Icon name="belajar" size={20} />
                </span>
                <span>
                  <span className={s.hintTitle}>Belum ada kartu dipelajari</span>
                  <span className={s.hintSub}>Mulai dari mode Kartu di tab Belajar</span>
                </span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
