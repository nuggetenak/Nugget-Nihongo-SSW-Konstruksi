// ─── Dashboard.jsx v3.0 ────────────────────────────────────────────────────────
// Phase 7 overhaul: Quick Start, Stats bar, Mode grid, Streak, Daily progress,
// Recently studied, SRS breakdown
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo } from 'react';
import { T } from '../styles/theme.js';
import { CARDS } from '../data/cards.js';
import { JAC_OFFICIAL } from '../data/jac-official.js';
import { WAYGROUND_SETS } from '../data/wayground-sets.js';
import { loadFromStorage } from '../utils/wrong-tracker.js';
import ProgressBar from './ProgressBar.jsx';

// ── Time estimate labels ─────────────────────────────────────────────────────
const MODE_META = {
  ulasan:   { icon: '🔁', label: 'Ulasan SRS',    desc: 'Kartu jatuh tempo hari ini',   time: null },
  kartu:    { icon: '🃏', label: 'Kartu',          desc: 'Flashcard interaktif',          time: '~10 mnt' },
  kuis:     { icon: '❓', label: 'Kuis',           desc: 'Pilihan ganda otomatis',        time: '~5 mnt' },
  sprint:   { icon: '⚡', label: 'Sprint',         desc: 'Drill kecepatan 60 detik',      time: '~3 mnt' },
  fokus:    { icon: '🎯', label: 'Fokus',          desc: 'Latih kartu yang salah',        time: '~5 mnt' },
  jac:      { icon: '📋', label: 'JAC Official',  desc: 'Soal ujian resmi',              time: '~15 mnt' },
  wayground:{ icon: '🎓', label: 'Wayground',      desc: 'Soal teknis',                   time: '~10 mnt' },
  simulasi: { icon: '🎯', label: 'Simulasi',       desc: 'Ujian penuh + timer',           time: '~30 mnt' },
  stats:    { icon: '📊', label: 'Statistik',      desc: 'Progress & kelemahan',          time: null },
};

// ── Daily streak helper ──────────────────────────────────────────────────────
function getStudyStreak() {
  try {
    const raw = localStorage.getItem('ssw-study-streak');
    if (!raw) return { days: 0, lastDate: null };
    return JSON.parse(raw);
  } catch { return { days: 0, lastDate: null }; }
}

function getTodayStr() {
  return new Date().toISOString().slice(0, 10);
}

// Called by App.jsx when a card is marked — we update streak + daily count
export function recordStudyDay() {
  const today = getTodayStr();
  try {
    const streak = getStudyStreak();
    if (streak.lastDate === today) return; // already recorded today
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = yesterday.toISOString().slice(0, 10);
    const newDays = streak.lastDate === yStr ? streak.days + 1 : 1;
    localStorage.setItem('ssw-study-streak', JSON.stringify({ days: newDays, lastDate: today }));
  } catch {}
}

// ── Daily card count ──────────────────────────────────────────────────────────
function getDailyCount() {
  try {
    const raw = localStorage.getItem('ssw-daily-count');
    if (!raw) return 0;
    const { count, date } = JSON.parse(raw);
    return date === getTodayStr() ? count : 0;
  } catch { return 0; }
}

export function incrementDailyCount() {
  try {
    const today = getTodayStr();
    const raw = localStorage.getItem('ssw-daily-count');
    const prev = raw ? JSON.parse(raw) : { count: 0, date: today };
    const count = prev.date === today ? prev.count + 1 : 1;
    localStorage.setItem('ssw-daily-count', JSON.stringify({ count, date: today }));
  } catch {}
}

// ── Recently studied ─────────────────────────────────────────────────────────
function getRecentCards() {
  try {
    const raw = localStorage.getItem('ssw-recent');
    if (!raw) return [];
    return JSON.parse(raw).slice(0, 5);
  } catch { return []; }
}

export function pushRecentCard(cardId) {
  try {
    const prev = getRecentCards();
    const next = [cardId, ...prev.filter((id) => id !== cardId)].slice(0, 5);
    localStorage.setItem('ssw-recent', JSON.stringify(next));
  } catch {}
}

// ── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard({
  known,
  unknown,
  track,
  onNavigate,
  onChangeTrack,
  srs,
  isDark,
  onToggleTheme,
}) {
  const total    = CARDS.length;
  const knownN   = known.size;
  const unknownN = unknown.size;
  const sisa     = total - knownN;
  const pct      = total > 0 ? Math.round((knownN / total) * 100) : 0;

  const wgTotal  = WAYGROUND_SETS.reduce((n, s) => n + s.questions.length, 0);
  const trackInfo = T.track[track] || T.track.doboku;

  const dueCount  = srs?.dueCount ?? 0;
  const srsStats  = srs?.stats;

  const studyStreak = useMemo(() => getStudyStreak(), []);
  const dailyCount  = useMemo(() => getDailyCount(), []);
  const recentIds   = useMemo(() => getRecentCards(), []);
  const recentCards = useMemo(
    () => recentIds.map((id) => CARDS.find((c) => c.id === id)).filter(Boolean),
    [recentIds]
  );

  // JAC last score
  const jacScores = useMemo(() => {
    return loadFromStorage('ssw-jac-scores', {});
  }, []);
  const bestJacScore = Object.values(jacScores).reduce((best, s) => Math.max(best, s.pct || 0), 0);

  // ── Smart Quick Start ────────────────────────────────────────────────────
  const getQuickStart = () => {
    if (dueCount > 0)   return { icon: '🔁', label: `${dueCount} kartu siap diulang`, desc: 'Ulasan SRS hari ini', mode: 'ulasan', accent: true };
    if (knownN === 0)   return { icon: '🃏', label: 'Mulai dari Kartu', desc: 'Pelajari istilah dasar dulu', mode: 'kartu', accent: true };
    if (pct < 20)       return { icon: '🃏', label: 'Lanjutkan Kartu', desc: `${knownN} sudah hafal — terus!`, mode: 'kartu', accent: true };
    if (pct < 50)       return { icon: '❓', label: 'Coba Kuis', desc: 'Uji pemahaman kamu', mode: 'kuis', accent: true };
    if (pct < 70)       return { icon: '📋', label: 'Soal JAC Official', desc: 'Latihan soal ujian asli', mode: 'jac', accent: true };
    return               { icon: '🎯', label: 'Simulasi Ujian', desc: 'Kamu sudah siap! 💪', mode: 'simulasi', accent: true };
  };
  const qs = getQuickStart();

  // ── Mode tiles ───────────────────────────────────────────────────────────
  const BELAJAR_TILES = ['kartu', 'kuis', 'sprint', 'fokus'];
  const UJIAN_TILES   = ['jac', 'wayground', 'simulasi'];

  return (
    <div style={{ padding: '0 16px 28px', maxWidth: T.maxW, margin: '0 auto', animation: 'fadeIn 0.3s ease' }}>

      {/* ── Header ── */}
      <div style={{ padding: '16px 0 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 17, fontWeight: 800 }}>
            <span style={{ background: T.accent, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              SSW Konstruksi
            </span>
          </div>
          <div style={{ fontSize: 10, color: T.textDim, marginTop: 1 }}>by Nugget Nihongo</div>
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button
            onClick={onChangeTrack}
            style={{ fontFamily: 'inherit', fontSize: 11, padding: '5px 10px', borderRadius: T.r.pill, cursor: 'pointer', background: trackInfo.bg, border: `1px solid ${trackInfo.color}33`, color: trackInfo.color, display: 'flex', alignItems: 'center', gap: 4 }}
          >
            {trackInfo.icon} {trackInfo.jp}
          </button>
          <button
            onClick={onToggleTheme}
            title={isDark ? 'Switch to Light' : 'Switch to Dark'}
            style={{ fontFamily: 'inherit', fontSize: 16, width: 34, height: 34, borderRadius: T.r.pill, cursor: 'pointer', background: T.surface, border: `1px solid ${T.borderLight}`, color: T.text, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          >
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>
      </div>

      {/* ── Stats bar: 4 colored boxes ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 6, marginBottom: 12 }}>
        {[
          { n: total,    label: 'Total',  color: T.textMuted,  bg: T.surface },
          { n: knownN,   label: 'Hafal',  color: T.correct,    bg: T.correctBg },
          { n: unknownN, label: 'Belum',  color: T.wrong,      bg: T.wrongBg },
          { n: sisa,     label: 'Sisa',   color: T.gold,       bg: 'rgba(251,191,36,0.08)' },
        ].map((s) => (
          <div key={s.label} style={{ padding: '10px 8px', borderRadius: T.r.md, background: s.bg, border: `1px solid ${T.border}`, textAlign: 'center' }}>
            <div style={{ fontSize: 17, fontWeight: 800, color: s.color, fontVariantNumeric: 'tabular-nums' }}>{s.n}</div>
            <div style={{ fontSize: 9, color: s.color, opacity: 0.8, fontWeight: 600, letterSpacing: 0.5 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Progress bar + streak + daily ── */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.textDim }}>{pct}% hafal</div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {studyStreak.days > 0 && (
              <span style={{ fontSize: 11, color: T.gold, fontWeight: 700 }}>🔥 {studyStreak.days} hari</span>
            )}
            {dailyCount > 0 && (
              <span style={{ fontSize: 11, color: T.textDim }}>+{dailyCount} hari ini</span>
            )}
          </div>
        </div>
        <ProgressBar current={knownN} total={total} color={T.amber} />
        {/* Daily goal mini-bar (goal: 20 cards) */}
        {dailyCount > 0 && (
          <div style={{ marginTop: 5 }}>
            <div style={{ height: 3, background: T.border, borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min((dailyCount / 20) * 100, 100)}%`, background: T.correct, borderRadius: 99, transition: 'width 0.5s ease' }} />
            </div>
            <div style={{ fontSize: 9, color: T.textFaint, marginTop: 3 }}>Target hari ini: {dailyCount}/20 kartu{dailyCount >= 20 ? ' ✅' : ''}</div>
          </div>
        )}
      </div>

      {/* ── Quick Start CTA ── */}
      <button
        onClick={() => onNavigate(qs.mode)}
        style={{ width: '100%', padding: '18px 16px', marginBottom: 14, fontFamily: 'inherit', borderRadius: T.r.lg, cursor: 'pointer', background: T.accent, border: 'none', color: T.textBright, textAlign: 'left', boxShadow: T.shadow.glow, animation: 'slideUp 0.3s ease 0.05s both' }}
      >
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, opacity: 0.7, marginBottom: 8, textTransform: 'uppercase' }}>Mulai Sekarang</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 28 }}>{qs.icon}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 2 }}>{qs.label}</div>
            <div style={{ fontSize: 12, opacity: 0.75 }}>{qs.desc}</div>
          </div>
          <span style={{ fontSize: 18, opacity: 0.6 }}>→</span>
        </div>
      </button>

      {/* ── SRS due alert (if QuickStart didn't already go to ulasan) ── */}
      {dueCount > 0 && qs.mode !== 'ulasan' && (
        <button
          onClick={() => onNavigate('ulasan')}
          style={{ width: '100%', padding: '12px 16px', marginBottom: 14, fontFamily: 'inherit', borderRadius: T.r.lg, cursor: 'pointer', background: 'rgba(251,191,36,0.08)', border: `1.5px solid ${T.borderActive}`, color: T.text, textAlign: 'left', animation: 'slideUp 0.3s ease both' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 18 }}>🔁</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.gold }}>{dueCount} kartu siap diulang</div>
              <div style={{ fontSize: 11, color: T.textDim, marginTop: 1 }}>Ulasan SRS hari ini</div>
            </div>
            <span style={{ fontSize: 14, color: T.gold, opacity: 0.7 }}>→</span>
          </div>
        </button>
      )}

      {/* ── Mode Belajar grid ── */}
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: T.textDim, textTransform: 'uppercase', marginBottom: 8, animation: 'slideUp 0.3s ease 0.1s both' }}>
        Mode Belajar
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14, animation: 'slideUp 0.3s ease 0.1s both' }}>
        {BELAJAR_TILES.map((key, i) => {
          const m = MODE_META[key];
          const badge = key === 'ulasan' ? dueCount : 0;
          return (
            <button
              key={key}
              onClick={() => onNavigate(key)}
              style={{ fontFamily: 'inherit', padding: '14px 12px', borderRadius: T.r.md, cursor: 'pointer', background: T.surface, border: `1px solid ${badge > 0 ? T.borderLight : T.border}`, color: T.text, textAlign: 'left', position: 'relative', animation: `slideUp 0.3s ease ${0.1 + i * 0.04}s both` }}
            >
              {badge > 0 && (
                <span style={{ position: 'absolute', top: 8, right: 8, fontSize: 10, fontWeight: 700, padding: '1px 5px', borderRadius: T.r.pill, background: T.amber, color: T.bg }}>{badge}</span>
              )}
              <div style={{ fontSize: 22, marginBottom: 6 }}>{m.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{m.label}</div>
              <div style={{ fontSize: 10, color: T.textDim, lineHeight: 1.4 }}>{m.desc}</div>
              {m.time && <div style={{ fontSize: 9, color: T.textFaint, marginTop: 4 }}>{m.time}</div>}
            </button>
          );
        })}
      </div>

      {/* ── Mode Ujian row ── */}
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: T.textDim, textTransform: 'uppercase', marginBottom: 8 }}>
        Mode Ujian
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 14 }}>
        {UJIAN_TILES.map((key) => {
          const m = MODE_META[key];
          // Show JAC best score if available
          const subExtra = key === 'jac' && bestJacScore > 0 ? ` · Skor terbaik: ${bestJacScore}%` : '';
          return (
            <button
              key={key}
              onClick={() => onNavigate(key)}
              style={{ fontFamily: 'inherit', padding: '12px 14px', borderRadius: T.r.md, cursor: 'pointer', background: T.surface, border: `1px solid ${T.border}`, color: T.text, textAlign: 'left', display: 'flex', alignItems: 'center', gap: 12 }}
            >
              <span style={{ fontSize: 20, flexShrink: 0 }}>{m.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{m.label}</div>
                <div style={{ fontSize: 11, color: T.textDim }}>{m.desc}{subExtra}</div>
              </div>
              {m.time && <span style={{ fontSize: 10, color: T.textFaint, flexShrink: 0 }}>{m.time}</span>}
              <span style={{ fontSize: 14, color: T.textDim, flexShrink: 0 }}>›</span>
            </button>
          );
        })}
      </div>

      {/* ── SRS breakdown (if data) ── */}
      {srsStats && srsStats.total > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: T.textDim, textTransform: 'uppercase', marginBottom: 8 }}>SRS Breakdown</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[
              { n: srsStats.mature,   label: 'Matang',  color: T.correct },
              { n: srsStats.young,    label: 'Muda',    color: T.gold },
              { n: srsStats.learning, label: 'Belajar', color: '#60a5fa' },
              { n: srsStats.new,      label: 'Baru',    color: T.textDim },
            ].map((s) => s.n > 0 && (
              <span key={s.label} style={{ fontSize: 11, padding: '4px 10px', borderRadius: T.r.pill, background: `${s.color}12`, color: s.color, border: `1px solid ${s.color}25`, fontWeight: 600 }}>
                {s.n} {s.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Recently studied ── */}
      {recentCards.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: T.textDim, textTransform: 'uppercase', marginBottom: 8 }}>Terakhir Dipelajari</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {recentCards.map((c, i) => (
              <div
                key={c.id}
                style={{ padding: '9px 12px', borderRadius: T.r.md, background: T.surface, border: `1px solid ${T.border}`, display: 'flex', gap: 10, alignItems: 'center', animation: `slideUp 0.3s ease ${i * 0.04}s both` }}
              >
                <span style={{ fontFamily: T.fontJP, fontSize: 14, fontWeight: 700, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.jp}</span>
                <span style={{ fontSize: 11, color: T.textDim, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '45%' }}>{c.id_text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Content stats footer ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6, marginBottom: 14 }}>
        {[
          { n: CARDS.length, label: 'Kartu', icon: '🃏' },
          { n: JAC_OFFICIAL.length, label: 'Soal JAC', icon: '📋' },
          { n: wgTotal, label: 'Teknis', icon: '🎓' },
        ].map((s) => (
          <div key={s.label} style={{ padding: '10px 8px', borderRadius: T.r.md, background: T.surface, border: `1px solid ${T.border}`, textAlign: 'center' }}>
            <div style={{ fontSize: 14, marginBottom: 2 }}>{s.icon}</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: T.gold }}>{s.n.toLocaleString()}</div>
            <div style={{ fontSize: 9, color: T.textDim }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Quick links row ── */}
      <div style={{ display: 'flex', gap: 6 }}>
        {['stats', 'cari', 'glosari'].map((key) => {
          const labels = { stats: '📊 Statistik', cari: '🔍 Cari', glosari: '📖 Glosari' };
          return (
            <button
              key={key}
              onClick={() => onNavigate(key)}
              style={{ flex: 1, fontFamily: 'inherit', padding: '9px 4px', fontSize: 11, fontWeight: 600, borderRadius: T.r.md, background: T.surface, border: `1px solid ${T.border}`, color: T.textMuted, cursor: 'pointer' }}
            >
              {labels[key]}
            </button>
          );
        })}
      </div>

      <div style={{ textAlign: 'center', marginTop: 20, fontSize: 10, color: T.textFaint }}>
        Teknik Sipil · Bangunan · Lifeline & Peralatan
      </div>
    </div>
  );
}
