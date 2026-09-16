// ─── Dashboard.jsx ──────────────────────────────────────────────────────────
// Home tab. Reads as a status board: what's urgent, where you stand, what to
// do next. The hazard rail (see global.css) marks anything time-sensitive.
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect, useMemo, useState } from 'react';
import { useProgress } from '../contexts/ProgressContext.jsx';
import { useApp } from '../contexts/AppContext.jsx';
import { generateDailyMission, isMissionDoneToday } from '../utils/daily-mission.js';
import { calcReadinessBand } from '../utils/session-analytics.js';
import s from './Dashboard.module.css';
import { T } from '../styles/theme.js';
import { get as storageGet } from '../storage/engine.js';
import Icon from './Icon.jsx';
import SplitFlap from './SplitFlap.jsx';
import { markMorphSource } from '../utils/motion.js';
import { JpFront } from './JpDisplay.jsx';
import { JP_LIST_MAX, stripFuri } from '../utils/jp-helpers.js';
import { recommendMode } from '../utils/recommend-mode.js';
import { formatCount } from '../utils/format.js';
import { TOTAL_CARDS } from '../utils/constants.js';
import { MODE_META, DASHBOARD_QUICK_MODES } from '../router/modes.js';
import { getThemeMode } from '../utils/theme-mode.js';

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

// Which modes appear as quick tiles. The list itself is the registry's
// (`DASHBOARD_QUICK_MODES`); only the display shape is built here.
//
// It used to be a local `QUICK_MODE_KEYS = ['kartu', 'kuis', 'sprint', 'jac']`
// under a comment saying label and icon come from MODE_META "so this never
// drifts out of sync with the registry". That was half of the risk named and
// the other half left open: `router/modes.js` exports the same four keys, calls
// itself the authority on them, and **nothing read it** — so editing the
// registry's list moved nothing, and the two agreed only because no one had
// touched either. Item 207.
const QUICK_MODES = DASHBOARD_QUICK_MODES.map((key) => ({
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
  theme,
  onToggleTheme,
}) {
  const { prefs } = useApp();
  const furiganaPolicy = prefs?.furiganaPolicy ?? 'always';
  const total = TOTAL_CARDS;
  const knownN = known.size;
  const unknownN = unknown.size;
  const pct = total > 0 ? Math.round((knownN / total) * 100) : 0;
  const restN = Math.max(0, total - knownN - unknownN);

  const trackInfo = T.track[track] || T.track.lifeline;
  const { streakData, dailyCount, starred, recentCards: recentIds } = useProgress();
  // From the context rather than a second storageGet: ProgressContext already
  // owns recentCards, and two readers of one field is one too many.
  //
  // The card *content* arrives after first paint, and that is the whole reason this
  // is an effect rather than a `useMemo` over `CARDS`. The Dashboard is the first
  // screen, so importing `cards.js` here — for at most three rows of "Terakhir
  // dipelajari" — meant the entry graph fetched and parsed 212 kB gzipped of corpus
  // before anything at all appeared. Everything else on this screen comes from the
  // progress and SRS documents and needs none of it.
  //
  // The strip is absent until the chunk resolves, which is what it already does for
  // a learner with no history; a returning one sees it appear a beat after the rest.
  // The alternative — blocking the first paint of the home screen on the corpus —
  // is the trade this reverses.
  const [recentCards, setRecentCards] = useState([]);
  useEffect(() => {
    const ids = (recentIds ?? []).slice(0, 5);
    if (ids.length === 0) {
      setRecentCards([]);
      return;
    }
    let live = true;
    import('../data/cards.js').then(({ CARDS }) => {
      if (!live) return;
      setRecentCards(
        ids
          .map((id) => CARDS.find((c) => c.id === id))
          .filter(Boolean)
          .slice(0, 3)
      );
    });
    return () => {
      live = false;
    };
  }, [recentIds]);

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
          {/* Three states now, so the glyph comes from the registry and the
              label names the current one -- "Ganti tema" never said which. */}
          <button
            className={s.themeBtn}
            onClick={onToggleTheme}
            aria-label={`Tema: ${getThemeMode(theme).label} — ketuk untuk ganti`}
          >
            {getThemeMode(theme).emoji}
          </button>
        </div>
      </header>

      <div className={s.cols}>
        <div className={s.colMain}>
          {/* ── Exam countdown — hazard rail ── */}
          {showCountdown && (
            <div className={s.rail} data-tier={tier}>
              <div className={s.railTitle}>
                {daysLeft === 0 ? (
                  'Hari ini ujian!'
                ) : (
                  <>
                    <SplitFlap value={daysLeft} /> hari lagi menuju ujian
                  </>
                )}
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
                    gap: 'var(--space-6)',
                    marginTop: 'var(--space-8)',
                    padding: 'var(--space-4) var(--space-10)',
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
            {QUICK_MODES.map((m, i) => (
              <button
                key={m.key}
                className={`${s.quickTile} stagger-item`}
                style={{ '--stagger-i': i }}
                onClick={(e) => {
                  markMorphSource(e.currentTarget);
                  onNavigate(m.key);
                }}
              >
                <span data-morph="icon" className={s.quickIcon}>
                  <Icon name={m.ui} size={22} />
                </span>
                <span data-morph="label" className={s.quickLabel}>
                  {m.label}
                </span>
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
                  <li key={c.id}>
                    {/* A real control, not a styled <li>. Every other tappable
                      thing on this screen is a <button>; these rows looked
                      identical and did nothing. */}
                    <button
                      className={s.recentCard}
                      onClick={() =>
                        onNavigate('kartu', { filterIds: [c.id], filterReason: 'recent' })
                      }
                      // stripFuri: the raw jp carries 《reading》 markers, which a
                      // screen reader would announce as literal bracket syntax.
                      aria-label={`Buka kartu ${stripFuri(c.jp)} — ${c.id_text}`}
                    >
                      <span className={s.recentJp}>
                        <JpFront
                          jp={c.jp}
                          furiganaPolicy={furiganaPolicy}
                          maxSize={JP_LIST_MAX}
                          compact
                        />
                      </span>
                      <span className={s.recentId}>{c.id_text}</span>
                    </button>
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
