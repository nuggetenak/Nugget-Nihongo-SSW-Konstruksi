// ─── Dashboard.jsx v3.2 ────────────────────────────────────────────────────────
// Blueprint B3: "One Screen, One Action"
// Circular progress ring + streak hero + smart CTA + quick actions + recent cards
// ─────────────────────────────────────────────────────────────────────────────

import { useMemo } from 'react';
import { T } from '../styles/theme.js';
import { CARDS } from '../data/cards.js';
import { get as storageGet, set as storageSet } from '../storage/engine.js';
import ProgressRing from './ProgressRing.jsx';

// ── Storage utilities (called by ModeRouter/FlashcardMode on card mark) ───────
function getTodayStr() { return new Date().toISOString().slice(0, 10); }

function getStudyStreak() { return storageGet('progress')?.streakData ?? { days: 0, lastDate: null }; }
function getDailyCount() {
  const dc = storageGet('progress')?.dailyCount ?? { count: 0, date: '' };
  return dc.date === getTodayStr() ? dc.count : 0;
}
function getRecentCards() { return (storageGet('progress')?.recentCards ?? []).slice(0, 5); }

export function recordStudyDay() {
  const today = getTodayStr();
  const streak = getStudyStreak();
  if (streak.lastDate === today) return;
  const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
  const yStr = yesterday.toISOString().slice(0, 10);
  const newDays = streak.lastDate === yStr ? (streak.days ?? 0) + 1 : 1;
  storageSet('progress', (prev) => ({ ...prev, streakData: { days: newDays, lastDate: today } }));
}

export function incrementDailyCount() {
  const today = getTodayStr();
  const dc = storageGet('progress')?.dailyCount ?? { count: 0, date: '' };
  const count = dc.date === today ? dc.count + 1 : 1;
  storageSet('progress', (prev) => ({ ...prev, dailyCount: { count, date: today } }));
}

export function pushRecentCard(cardId) {
  const prev = (storageGet('progress')?.recentCards ?? []).slice(0, 5);
  const next = [cardId, ...prev.filter((id) => id !== cardId)].slice(0, 5);
  storageSet('progress', (p) => ({ ...p, recentCards: next }));
}

// ── Smart Quick Start logic ───────────────────────────────────────────────────
function getQuickStart(knownN, pct, dueCount) {
  if (dueCount > 0) return { icon: '🔁', label: `${dueCount} kartu siap diulang`, desc: 'Ulasan SRS hari ini', mode: 'ulasan' };
  if (knownN === 0)  return { icon: '🃏', label: 'Mulai dari Kartu', desc: 'Pelajari istilah dasar dulu', mode: 'kartu' };
  if (pct < 20)      return { icon: '🃏', label: 'Lanjutkan Kartu', desc: `${knownN} sudah hafal — terus!`, mode: 'kartu' };
  if (pct < 50)      return { icon: '❓', label: 'Coba Kuis', desc: 'Uji pemahaman kamu', mode: 'kuis' };
  if (pct < 70)      return { icon: '📋', label: 'Soal JAC Official', desc: 'Latihan soal ujian asli', mode: 'jac' };
  return               { icon: '🎯', label: 'Simulasi Ujian', desc: 'Kamu sudah siap! 💪', mode: 'simulasi' };
}

// ── Quick action tiles (2×2 grid) ────────────────────────────────────────────
const QUICK_MODES = [
  { key: 'kartu',  icon: '🃏', label: 'Kartu'  },
  { key: 'kuis',   icon: '❓', label: 'Kuis'   },
  { key: 'sprint', icon: '⚡', label: 'Sprint' },
  { key: 'jac',    icon: '📋', label: 'JAC'    },
];

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard({ known, unknown, track, onNavigate, onChangeTrack, srs, isDark, onToggleTheme }) {
  const total = CARDS.length;
  const knownN = known.size;
  const unknownN = unknown.size;
  const pct = total > 0 ? Math.round((knownN / total) * 100) : 0;
  const dueCount = srs?.dueCount ?? 0;

  const trackInfo = T.track[track] || T.track.doboku;
  const studyStreak = useMemo(() => getStudyStreak(), []);
  const dailyCount  = useMemo(() => getDailyCount(), []);
  const recentIds   = useMemo(() => getRecentCards(), []);
  const recentCards = useMemo(() => recentIds.map((id) => CARDS.find((c) => c.id === id)).filter(Boolean).slice(0, 3), [recentIds]);

  const qs = getQuickStart(knownN, pct, dueCount);

  return (
    <div style={{ padding: '0 16px 28px', maxWidth: T.maxW, margin: '0 auto', animation: 'fadeIn 0.3s ease' }}>

      {/* ── Header ── */}
      <div style={{ padding: '16px 0 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
            aria-label={isDark ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'}
            style={{ fontFamily: 'inherit', fontSize: 16, width: 34, height: 34, borderRadius: T.r.pill, cursor: 'pointer', background: T.surface, border: `1px solid ${T.borderLight}`, color: T.text, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          >
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>
      </div>

      {/* ── Streak hero (prominent when active) ── */}
      {studyStreak.days >= 2 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 16px',
            borderRadius: T.r.lg,
            background: 'rgba(245,158,11,0.08)',
            border: `1px solid rgba(245,158,11,0.25)`,
            marginBottom: 14,
            animation: 'slideUp 0.3s ease',
          }}
        >
          <span style={{ fontSize: 28 }}>🔥</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: T.amber }}>
              {studyStreak.days} hari berturut-turut!
            </div>
            <div style={{ fontSize: 11, color: T.textDim, marginTop: 2 }}>
              {dailyCount > 0 ? `+${dailyCount} kartu hari ini` : 'Jaga streakmu — belajar hari ini!'}
            </div>
          </div>
        </div>
      )}

      {/* ── Progress ring card ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          padding: '20px 16px',
          borderRadius: T.r.lg,
          background: T.surface,
          border: `1px solid ${T.border}`,
          marginBottom: 14,
        }}
      >
        <ProgressRing current={knownN} total={total} size={120} stroke={10} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: T.text, marginBottom: 6 }}>
            {knownN} kartu hafal
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <div style={{ fontSize: 12, color: T.textDim }}>
              {unknownN} belum · {total - knownN - unknownN} sisa
            </div>
            {studyStreak.days > 0 && studyStreak.days < 2 && (
              <div style={{ fontSize: 12, color: T.amber, fontWeight: 700 }}>
                🔥 {studyStreak.days} hari streak
              </div>
            )}
            {dailyCount > 0 && (
              <div style={{ fontSize: 11, color: T.textDim }}>
                +{dailyCount} hari ini
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Primary CTA ── */}
      <button
        onClick={() => onNavigate(qs.mode)}
        style={{
          width: '100%',
          padding: '18px 20px',
          marginBottom: 14,
          fontFamily: 'inherit',
          borderRadius: T.r.lg,
          cursor: 'pointer',
          background: T.accent,
          border: 'none',
          color: T.textBright,
          textAlign: 'left',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          boxShadow: T.shadow.glowStrong,
        }}
      >
        <span style={{ fontSize: 28, flexShrink: 0 }}>{qs.icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 800, lineHeight: 1.2 }}>{qs.label}</div>
          <div style={{ fontSize: 12, opacity: 0.75, marginTop: 2 }}>{qs.desc}</div>
        </div>
        <span style={{ fontSize: 18, opacity: 0.6 }}>→</span>
      </button>

      {/* ── Quick action 2×2 grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
        {QUICK_MODES.map((m) => (
          <button
            key={m.key}
            onClick={() => onNavigate(m.key)}
            style={{
              fontFamily: 'inherit',
              padding: '16px 14px',
              borderRadius: T.r.lg,
              cursor: 'pointer',
              background: T.surface,
              border: `1px solid ${T.border}`,
              color: T.text,
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              transition: 'all 0.15s',
            }}
          >
            <span style={{ fontSize: 20 }}>{m.icon}</span>
            <span style={{ fontSize: 13, fontWeight: 700 }}>{m.label}</span>
          </button>
        ))}
      </div>

      {/* ── Recently studied (3 max) ── */}
      {recentCards.length > 0 && (
        <div>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 0.8,
              textTransform: 'uppercase',
              color: T.textDim,
              marginBottom: 10,
            }}
          >
            Terakhir Dipelajari
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {recentCards.map((c) => (
              <div
                key={c.id}
                style={{
                  padding: '10px 12px',
                  borderRadius: T.r.md,
                  background: T.surface,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <span style={{ fontSize: 15, fontWeight: 700, color: T.text }}>{c.jp}</span>
                <span style={{ fontSize: 11, color: T.textDim }}>— {c.id_text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
