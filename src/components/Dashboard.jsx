// ─── Dashboard.jsx v3.4 (phaseA) ──────────────────────────────────────────────
// A.2: Fixed BUG-01 + TD-02 — removed dead exported utility functions
//      (recordStudyDay, incrementDailyCount, pushRecentCard).
//      These were never imported anywhere; streak/daily-count logic lives in
//      ProgressContext.jsx's handleMark(). today() helper retained for local use.
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo } from 'react';
import { generateDailyMission, isMissionDoneToday } from '../utils/daily-mission.js';
import s from './Dashboard.module.css';
import { T } from '../styles/theme.js';
import { CARDS } from '../data/cards.js';
import { get as storageGet } from '../storage/engine.js';
import ProgressRing from './ProgressRing.jsx';

// ── Storage utilities (local, not exported) ───────────────────────────────
const today = () => new Date().toISOString().slice(0, 10);

const getStreak    = () => storageGet('progress')?.streakData     ?? { days: 0, lastDate: null };
const getDailyCount= () => { const dc = storageGet('progress')?.dailyCount ?? { count: 0, date: '' }; return dc.date === today() ? dc.count : 0; };
const getRecent    = () => (storageGet('progress')?.recentCards   ?? []).slice(0, 5);

// ── Smart CTA logic ───────────────────────────────────────────────────────────
function getQuickStart(knownN, pct, dueCount) {
  if (dueCount > 0) return { icon: '🔁', label: `${dueCount} kartu siap diulang`, desc: 'Ulasan SRS hari ini',     mode: 'ulasan'   };
  if (knownN === 0) return { icon: '🃏', label: 'Mulai dari Kartu',              desc: 'Pelajari istilah dasar',   mode: 'kartu'    };
  if (pct < 20)     return { icon: '🃏', label: 'Lanjutkan Kartu',               desc: `${knownN} sudah hafal!`,   mode: 'kartu'    };
  if (pct < 50)     return { icon: '❓', label: 'Coba Kuis',                     desc: 'Uji pemahaman kamu',       mode: 'kuis'     };
  if (pct < 70)     return { icon: '📋', label: 'Soal JAC Official',             desc: 'Latihan soal ujian asli',  mode: 'jac'      };
  return               { icon: '🎯', label: 'Simulasi Ujian',              desc: 'Kamu sudah siap! 💪',      mode: 'simulasi' };
}

const QUICK_MODES = [
  { key: 'kartu',  icon: '🃏', label: 'Kartu'  },
  { key: 'kuis',   icon: '❓', label: 'Kuis'   },
  { key: 'sprint', icon: '⚡', label: 'Sprint' },
  { key: 'jac',    icon: '📋', label: 'JAC'    },
];

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard({ known, unknown, track, onNavigate, onChangeTrack, srs, isDark, onToggleTheme }) {
  const total    = CARDS.length;
  const knownN   = known.size;
  const unknownN = unknown.size;
  const pct      = total > 0 ? Math.round((knownN / total) * 100) : 0;
  const dueCount = srs?.dueCount ?? 0;

  const trackInfo   = T.track[track] || T.track.doboku;
  const streak      = useMemo(() => getStreak(), []);
  const dailyCount  = useMemo(() => getDailyCount(), []);
  const recentIds   = useMemo(() => getRecent(), []);
  const recentCards = useMemo(() => recentIds.map((id) => CARDS.find((c) => c.id === id)).filter(Boolean).slice(0, 3), [recentIds]);

  const qs = getQuickStart(knownN, pct, dueCount);

  // Phase F: Exam countdown
  const examDate = storageGet('prefs')?.examDate ?? null;

  const daysLeft = examDate
    ? Math.ceil((new Date(examDate) - new Date()) / 86400000)
    : null;
  const showCountdown = daysLeft !== null && daysLeft > 0 && daysLeft <= 30;

  // Phase C: Daily mission
  const mission = useMemo(() => {
    try { return generateDailyMission(); } catch { return null; }
  }, []);
  const missionDone = useMemo(() => {
    try { return isMissionDoneToday(); } catch { return false; }
  }, []);

  return (
    <div className={s.container}>

      {/* Header */}
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
          <button
            className={s.themeBtn}
            onClick={onToggleTheme}
            aria-label={isDark ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'}
          >
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>
      </div>

      {/* Streak hero */}
      {streak.days >= 2 && (
        <div className={s.streakHero}>
          <span className={s.streakEmoji}>🔥</span>
          <div>
            <div className={s.streakDays}>{streak.days} hari berturut-turut!</div>
            <div className={s.streakSub}>
              {dailyCount > 0 ? `+${dailyCount} kartu hari ini` : 'Jaga streakmu — belajar hari ini!'}
            </div>
          </div>
        </div>
      )}

      {/* Phase F: Exam countdown — shown when ≤30 days away */}
      {showCountdown && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 16px', marginBottom: 12,
          borderRadius: 12,
          background: daysLeft <= 7 ? 'rgba(239,68,68,0.08)' : daysLeft <= 14 ? 'rgba(245,158,11,0.08)' : 'rgba(59,130,246,0.08)',
          border: `1px solid ${daysLeft <= 7 ? 'rgba(239,68,68,0.3)' : daysLeft <= 14 ? 'rgba(245,158,11,0.3)' : 'rgba(59,130,246,0.3)'}`,
        }}>
          <span style={{ fontSize: 22 }}>🎯</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: daysLeft <= 7 ? '#ef4444' : daysLeft <= 14 ? T.gold : '#3b82f6' }}>
              {daysLeft} hari lagi menuju ujian
            </div>
            <div style={{ fontSize: 11, color: T.textDim }}>
              {daysLeft <= 14 ? 'Masa kritis — prioritaskan Ulasan SRS!' : 'Jaga konsistensi belajar harian.'}
            </div>
          </div>
        </div>
      )}

      {/* Progress ring card */}
      <div className={s.ringCard}>
        <ProgressRing current={knownN} total={total} size={120} stroke={10} />
        <div className={s.ringInfo}>
          <div className={s.ringKnown}>{knownN} kartu hafal</div>
          <div className={s.ringDetail}>{unknownN} belum · {total - knownN - unknownN} sisa</div>
          {streak.days > 0 && streak.days < 2 && (
            <div className={s.ringStreak}>🔥 {streak.days} hari streak</div>
          )}
          {dailyCount > 0 && (
            <div className={s.ringDaily}>+{dailyCount} hari ini</div>
          )}
        </div>
      </div>

      {/* Primary CTA */}
      <button className={s.cta} onClick={() => onNavigate(qs.mode)}>
        <span className={s.ctaIcon}>{qs.icon}</span>
        <div className={s.ctaBody}>
          <div className={s.ctaLabel}>{qs.label}</div>
          <div className={s.ctaDesc}>{qs.desc}</div>
        </div>
        <span className={s.ctaArrow}>→</span>
      </button>

      {/* Phase C: Daily Mission card */}
      {mission && !missionDone && (
        <button
          className={s.cta}
          onClick={() => onNavigate(mission.mode)}
          style={{ marginTop: 0, background: 'transparent', border: `1px dashed ${T.borderActive}` }}
          aria-label={`Misi hari ini: ${mission.label}`}
        >
          <span className={s.ctaIcon}>{mission.icon}</span>
          <div className={s.ctaBody}>
            <div className={s.ctaLabel} style={{ fontSize: 11, color: T.textDim, fontWeight: 600 }}>MISI HARI INI</div>
            <div className={s.ctaDesc} style={{ color: T.text, fontWeight: 700 }}>{mission.label}</div>
          </div>
          <span className={s.ctaArrow} style={{ color: T.amber }}>→</span>
        </button>
      )}
      {missionDone && (
        <div className={s.cta} style={{ opacity: 0.6, cursor: 'default', pointerEvents: 'none' }}>
          <span className={s.ctaIcon}>✅</span>
          <div className={s.ctaBody}>
            <div className={s.ctaLabel} style={{ fontSize: 11 }}>MISI HARI INI</div>
            <div className={s.ctaDesc}>Selesai! Kembali besok 🌙</div>
          </div>
        </div>
      )}

      {/* Quick action grid */}
      <div className={s.quickGrid}>
        {QUICK_MODES.map((m) => (
          <button key={m.key} className={s.quickTile} onClick={() => onNavigate(m.key)}>
            <span className={s.quickIcon}>{m.icon}</span>
            <span className={s.quickLabel}>{m.label}</span>
          </button>
        ))}
      </div>

      {/* Recent cards */}
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
