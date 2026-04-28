// ─── Dashboard.jsx ────────────────────────────────────────────────────────────
import { T } from '../styles/theme.js';
import { CARDS } from '../data/cards.js';
import { JAC_OFFICIAL } from '../data/jac-official.js';
import { WAYGROUND_SETS } from '../data/wayground-sets.js';
import ProgressBar from './ProgressBar.jsx';

export default function Dashboard({ known, unknown, track, onNavigate, onChangeTrack, srs, isDark, onToggleTheme }) {
  const total = CARDS.length;
  const knownN = known.size;
  const unknownN = unknown.size;
  const untouched = total - knownN - unknownN;
  const pct = total > 0 ? Math.round((knownN / total) * 100) : 0;
  const wgTotal = WAYGROUND_SETS.reduce((n, s) => n + s.questions.length, 0);
  const trackInfo = T.track[track] || T.track.doboku;

  const dueCount = srs?.dueCount ?? 0;
  const srsStats = srs?.stats;

  // Suggested next action
  const getSuggestion = () => {
    if (dueCount > 0)
      return {
        icon: '🔁',
        label: `${dueCount} kartu siap diulang`,
        desc: 'Kartu SRS jatuh tempo hari ini',
        mode: 'ulasan',
      };
    if (knownN === 0)
      return {
        icon: '🃏',
        label: 'Mulai dari Kartu',
        desc: 'Pelajari istilah dasar dulu',
        mode: 'kartu',
      };
    if (pct < 20)
      return {
        icon: '🃏',
        label: 'Lanjutkan Kartu',
        desc: `${knownN} sudah hafal, terus!`,
        mode: 'kartu',
      };
    if (pct < 50)
      return { icon: '❓', label: 'Coba Kuis', desc: 'Uji pemahaman kamu', mode: 'kuis' };
    if (pct < 70)
      return {
        icon: '📋',
        label: 'Soal JAC Official',
        desc: 'Latihan soal ujian asli',
        mode: 'jac',
      };
    return { icon: '🎯', label: 'Simulasi Ujian', desc: 'Kamu sudah siap!', mode: 'simulasi' };
  };
  const suggestion = getSuggestion();

  return (
    <div
      style={{
        padding: '0 16px 24px',
        maxWidth: T.maxW,
        margin: '0 auto',
        animation: 'fadeIn 0.3s ease',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px 0 14px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <div style={{ fontSize: 17, fontWeight: 800 }}>
            <span
              style={{
                background: T.accent,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              SSW Konstruksi
            </span>
          </div>
          <div style={{ fontSize: 10, color: T.textDim, marginTop: 1 }}>by Nugget Nihongo</div>
        </div>
        <button
          onClick={onChangeTrack}
          style={{
            fontFamily: 'inherit',
            fontSize: 11,
            padding: '5px 10px',
            borderRadius: T.r.pill,
            cursor: 'pointer',
            background: trackInfo.bg,
            border: `1px solid ${trackInfo.color}33`,
            color: trackInfo.color,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          {trackInfo.icon} {trackInfo.jp}
        </button>
        <button
          onClick={onToggleTheme}
          title={isDark ? 'Switch to Light' : 'Switch to Dark'}
          style={{
            fontFamily: 'inherit',
            fontSize: 16,
            width: 34,
            height: 34,
            borderRadius: T.r.pill,
            cursor: 'pointer',
            background: T.surface,
            border: `1px solid ${T.borderLight}`,
            color: T.text,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'background 0.15s',
          }}
        >
          {isDark ? '☀️' : '🌙'}
        </button>
      </div>

      {/* SRS Due alert — prominent when cards are due */}
      {dueCount > 0 && (
        <button
          onClick={() => onNavigate('ulasan')}
          style={{
            width: '100%',
            padding: '13px 16px',
            marginBottom: 12,
            fontFamily: 'inherit',
            borderRadius: T.r.lg,
            cursor: 'pointer',
            background: 'linear-gradient(135deg, rgba(251,191,36,0.15), rgba(245,158,11,0.08))',
            border: `1.5px solid ${T.borderActive}`,
            color: T.text,
            textAlign: 'left',
            animation: 'slideUp 0.3s ease both',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 22 }}>🔁</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: T.gold }}>
                {dueCount} kartu siap diulang
              </div>
              <div style={{ fontSize: 11, color: T.textDim, marginTop: 1 }}>
                Ulasan SRS hari ini · ketuk untuk mulai
              </div>
            </div>
            <span style={{ fontSize: 16, color: T.gold, opacity: 0.7 }}>→</span>
          </div>
        </button>
      )}

      {/* Progress Card */}
      <div
        style={{
          padding: '20px 16px',
          borderRadius: T.r.xl,
          background: T.accentSoft,
          border: `1px solid ${T.border}`,
          marginBottom: 12,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -30,
            right: -30,
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${T.amber}12, transparent 70%)`,
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, position: 'relative' }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: `conic-gradient(${T.amber} ${pct * 3.6}deg, rgba(245,158,11,0.08) 0deg)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <div
              style={{
                width: 50,
                height: 50,
                borderRadius: '50%',
                background: T.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 16,
                fontWeight: 800,
                color: T.gold,
              }}
            >
              {pct}%
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>Progress Belajar</div>
            <div style={{ display: 'flex', gap: 10, fontSize: 12, flexWrap: 'wrap' }}>
              <span style={{ color: T.correct }}>✅ {knownN}</span>
              <span style={{ color: T.wrong }}>❌ {unknownN}</span>
              <span style={{ color: T.textDim }}>⬜ {untouched}</span>
            </div>
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <ProgressBar current={knownN} total={total} color={T.amber} />
        </div>

        {/* SRS breakdown (if data available) */}
        {srsStats && srsStats.total > 0 && (
          <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[
              { n: srsStats.mature, label: 'Matang', color: T.correct },
              { n: srsStats.young, label: 'Muda', color: T.gold },
              { n: srsStats.learning, label: 'Belajar', color: '#60a5fa' },
              { n: srsStats.new, label: 'Baru', color: T.textDim },
            ].map(
              (s) =>
                s.n > 0 && (
                  <span
                    key={s.label}
                    style={{
                      fontSize: 10,
                      padding: '2px 6px',
                      borderRadius: T.r.pill,
                      background: `${s.color}12`,
                      color: s.color,
                      border: `1px solid ${s.color}25`,
                    }}
                  >
                    {s.n} {s.label}
                  </span>
                )
            )}
          </div>
        )}
      </div>

      {/* Suggested Action CTA */}
      <button
        onClick={() => onNavigate(suggestion.mode)}
        style={{
          width: '100%',
          padding: '16px',
          marginBottom: 12,
          fontFamily: 'inherit',
          borderRadius: T.r.lg,
          cursor: 'pointer',
          background: T.accent,
          border: 'none',
          color: T.textBright,
          textAlign: 'left',
          boxShadow: T.shadow.glow,
          transition: 'transform 0.15s',
          animation: 'slideUp 0.4s ease 0.1s both',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 24 }}>{suggestion.icon}</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{suggestion.label}</div>
            <div style={{ fontSize: 11, opacity: 0.75, marginTop: 1 }}>{suggestion.desc}</div>
          </div>
          <span style={{ marginLeft: 'auto', fontSize: 16, opacity: 0.6 }}>→</span>
        </div>
      </button>

      {/* Stats Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 8,
          marginBottom: 12,
          animation: 'slideUp 0.4s ease 0.15s both',
        }}
      >
        {[
          { n: CARDS.length, label: 'Kartu', icon: '🃏' },
          { n: JAC_OFFICIAL.length, label: 'Soal JAC', icon: '📋' },
          { n: wgTotal, label: 'Soal Teknis', icon: '🎓' },
        ].map((s, i) => (
          <div
            key={i}
            style={{
              padding: '12px 8px',
              borderRadius: T.r.md,
              background: T.surface,
              border: `1px solid ${T.border}`,
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 16, marginBottom: 2 }}>{s.icon}</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: T.gold }}>
              {s.n.toLocaleString()}
            </div>
            <div style={{ fontSize: 10, color: T.textDim }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: 1.5,
          color: T.textDim,
          textTransform: 'uppercase',
          marginBottom: 8,
          animation: 'slideUp 0.4s ease 0.2s both',
        }}
      >
        Akses Cepat
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 8,
          animation: 'slideUp 0.4s ease 0.2s both',
        }}
      >
        {[
          { key: 'ulasan', icon: '🔁', label: 'Ulasan SRS', badge: dueCount },
          { key: 'kartu', icon: '🃏', label: 'Kartu' },
          { key: 'kuis', icon: '❓', label: 'Kuis' },
          { key: 'stats', icon: '📊', label: 'Statistik' },
        ].map((m) => (
          <button
            key={m.key}
            onClick={() => onNavigate(m.key)}
            style={{
              fontFamily: 'inherit',
              padding: '14px 12px',
              borderRadius: T.r.md,
              cursor: 'pointer',
              background: T.surface,
              border: `1px solid ${m.key === 'ulasan' && dueCount > 0 ? T.borderLight : T.border}`,
              color: T.text,
              textAlign: 'left',
              position: 'relative',
              transition: 'all 0.15s',
            }}
          >
            <span style={{ fontSize: 18, marginRight: 8 }}>{m.icon}</span>
            <span style={{ fontSize: 13, fontWeight: 600 }}>{m.label}</span>
            {m.badge > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '1px 5px',
                  borderRadius: T.r.pill,
                  background: T.amber,
                  color: T.bg,
                }}
              >
                {m.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      <div
        style={{
          textAlign: 'center',
          marginTop: 24,
          fontSize: 10,
          color: T.textFaint,
          animation: 'fadeIn 0.5s ease 0.3s both',
        }}
      >
        Teknik Sipil · Bangunan · Lifeline & Peralatan
      </div>
    </div>
  );
}
