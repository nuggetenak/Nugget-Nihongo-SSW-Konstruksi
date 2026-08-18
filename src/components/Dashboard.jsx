// ─── Dashboard.jsx ──────────────────────────────────────────────────────────
import { useMemo } from 'react';
import { useProgress } from '../contexts/ProgressContext.jsx';
import { generateDailyMission, isMissionDoneToday } from '../utils/daily-mission.js';
import s from './Dashboard.module.css';
import { T } from '../styles/theme.js';
import { CARDS } from '../data/cards.js';
import { get as storageGet } from '../storage/engine.js';
import ProgressRing from './ProgressRing.jsx';
import { recommendMode } from '../utils/recommend-mode.js';

const getRecent     = () => (storageGet('progress')?.recentCards ?? []).slice(0, 5);

// Smart mode recommendation via recommendMode()
function getQuickStart(knownN, pct, dueCount, srs, examDate) {
  const sessions = storageGet('progress')?.sessions ?? [];
  const streak   = storageGet('progress')?.streakData?.days ?? 0;
  const rec = recommendMode({ srsState: srs, sessions, streak, examDate });
  return { icon: rec.icon, label: rec.label, desc: rec.reason, mode: rec.mode };
}

// Urgency tier for countdown card
function getCountdownTier(daysLeft) {
  if (daysLeft === 0) return 'today';
  if (daysLeft <= 7)  return 'critical';
  if (daysLeft <= 14) return 'warning';
  return 'info';
}

const QUICK_MODES = [
  { key: 'kartu',  icon: '🃏', label: 'Kartu'  },
  { key: 'kuis',   icon: '❓', label: 'Kuis'   },
  { key: 'sprint', icon: '⚡', label: 'Sprint' },
  { key: 'jac',    icon: '📋', label: 'JAC'    },
];

export default function Dashboard({ known, unknown, track, onNavigate, onChangeTrack, srs, isDark, onToggleTheme }) {
  const total    = CARDS.length;
  const knownN   = known.size;
  const unknownN = unknown.size;
  const pct      = total > 0 ? Math.round((knownN / total) * 100) : 0;
  const dueCount = srs?.dueCount ?? 0;

  const trackInfo   = T.track[track] || T.track.lifeline;
  const { streakData, dailyCount, starred } = useProgress();
  const recentIds   = useMemo(() => getRecent(), []);
  const recentCards = useMemo(() => recentIds.map((id) => CARDS.find((c) => c.id === id)).filter(Boolean).slice(0, 3), [recentIds]);
  const examDate   = storageGet('prefs')?.examDate ?? null;
  const daysLeft   = examDate ? Math.ceil((new Date(examDate) - new Date()) / 86400000) : null;
  const showCountdown = daysLeft !== null && daysLeft >= 0 && daysLeft <= 60;
  const tier       = showCountdown ? getCountdownTier(daysLeft) : null;

  const qs          = getQuickStart(knownN, pct, dueCount, srs, examDate);

  const mission     = useMemo(() => { try { return generateDailyMission(); } catch { return null; } }, []);
  const missionDone = useMemo(() => { try { return isMissionDoneToday(); } catch { return false; } }, []);

  return (
    <div className={s.container}>

      {/* ── Header ── */}
      <div className={s.header}>
        <div className={s.brand}>
          <div className={s.brandName}>SSW Konstruksi</div>
          <div className={s.brandSub}>by Nugget Nihongo</div>
        </div>
        <div className={s.headerRight}>
          <button
            className={s.trackPill}
            onClick={onChangeTrack}
            style={{ background: trackInfo.bg, border: `1px solid ${trackInfo.color}33`, color: trackInfo.color }}
          >
            {trackInfo.icon} {trackInfo.jp}
          </button>
          <button className={s.themeBtn} onClick={onToggleTheme} aria-label="Toggle tema">
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>
      </div>

      {/* ── Streak hero ── */}
      {streakData.days >= 2 && (
        <div className={s.streakHero}>
          <span className={s.streakEmoji}>🔥</span>
          <div>
            <div className={s.streakDays}>{streakData.days} hari berturut-turut!</div>
            <div className={s.streakSub}>
              {dailyCount.count > 0 ? `+${dailyCount.count} kartu hari ini` : 'Jaga streakmu — belajar hari ini!'}
            </div>
          </div>
        </div>
      )}

      {/* ── Exam countdown ── */}
      {showCountdown && (
        <div className={s.countdownCard} data-tier={tier}>
          <span className={s.countdownIcon}>
            {tier === 'today' ? '🔴' : tier === 'critical' ? '⚠️' : tier === 'warning' ? '🎯' : '📅'}
          </span>
          <div>
            <div className={s.countdownDays} data-tier={tier}>
              {daysLeft === 0 ? 'Hari ini ujian!' : `${daysLeft} hari lagi menuju ujian`}
            </div>
            <div className={s.countdownSub}>
              {daysLeft === 0 ? 'Semangat! Kamu sudah siap 💪'
                : daysLeft <= 14 ? 'Masa kritis — prioritaskan Ulasan SRS!'
                : 'Jaga konsistensi belajar harian.'}
            </div>
          </div>
        </div>
      )}

      {/* ── Progress ring card ── */}
      <div className={s.ringCard}>
        <ProgressRing current={knownN} total={total} size={120} stroke={10} />
        <div className={s.ringInfo}>
          <div className={s.ringKnown}>{knownN} kartu hafal</div>
          <div className={s.ringDetail}>{unknownN} belum · {total - knownN - unknownN} sisa</div>
          <div className={s.ringPct}>{pct}% selesai</div>
          {streakData.days > 0 && streakData.days < 2 && (
            <div className={s.ringStreak}>🔥 {streakData.days} hari streak</div>
          )}
          {dailyCount.count > 0 && (
            <div className={s.ringDaily}>+{dailyCount.count} hari ini</div>
          )}
        </div>
      </div>

      {/* ── Primary CTA ── */}
      <button className={s.cta} onClick={() => onNavigate(qs.mode)}>
        <span className={s.ctaIcon}>{qs.icon}</span>
        <div className={s.ctaBody}>
          <div className={s.ctaLabel}>{qs.label}</div>
          <div className={s.ctaDesc}>{qs.desc}</div>
        </div>
        <span className={s.ctaArrow}>→</span>
      </button>

      {/* ── Daily Mission ── */}
      {mission && !missionDone && (
        <button className={s.missionCard} onClick={() => onNavigate(mission.mode)}>
          <span className={s.missionIcon}>{mission.icon}</span>
          <div className={s.missionBody}>
            <div className={s.missionEyebrow}>MISI HARI INI</div>
            <div className={s.missionLabel}>{mission.label}</div>
          </div>
          <span className={s.missionArrow}>→</span>
        </button>
      )}
      {missionDone && (
        <div className={s.missionDone}>
          <span className={s.missionIcon}>✅</span>
          <div className={s.missionBody}>
            <div className={s.missionEyebrow}>MISI HARI INI</div>
            <div className={s.missionLabel}>Selesai! Kembali besok 🌙</div>
          </div>
        </div>
      )}

      {/* ── Quick grid ── */}
      <div className={s.quickGrid}>
        {QUICK_MODES.map((m) => (
          <button key={m.key} className={s.quickTile} onClick={() => onNavigate(m.key)}>
            <span className={s.quickIcon}>{m.icon}</span>
            <span className={s.quickLabel}>{m.label}</span>
          </button>
        ))}
      </div>

      {/* Starred-cards quiz button */}
      {starred.size > 0 && (
        <button className={s.quickTile} style={{ width: '100%', marginTop: 8 }}
          onClick={() => onNavigate('kuis', { filterIds: [...starred] })}>
          <span className={s.quickIcon}>⭐</span>
          <span className={s.quickLabel}>Kuis Bintang ({starred.size})</span>
        </button>
      )}

      {/* ── Recent cards ── */}
      {recentCards.length > 0 && (
        <>
          <div className={s.recentHeader}>Terakhir Dipelajari</div>
          <div className={s.recentList}>
            {recentCards.map((c) => (
              <div key={c.id} className={s.recentCard}>
                <span className={s.recentJp}>{c.jp}</span>
                <span className={s.recentId}>— {c.id_text}</span>
              </div>
            ))}
          </div>
        </>
      )}

    </div>
  );
}
