import { useState } from 'react';
import { T } from '../styles/theme.js';

const TRACKS = [
  {
    key: 'doboku',
    icon: '🏗️',
    label: 'Teknik Sipil',
    jp: '土木',
    desc: 'Jalan, jembatan, terowongan, bendungan, pondasi',
    color: '#F59E0B',
    gradient: 'linear-gradient(135deg, #78350F, #B45309)',
  },
  {
    key: 'kenchiku',
    icon: '🏢',
    label: 'Bangunan',
    jp: '建築',
    desc: 'Gedung, bekisting, tulangan, dinding, finishing',
    color: '#0EA5E9',
    gradient: 'linear-gradient(135deg, #0C4A6E, #0284C7)',
  },
  {
    key: 'lifeline',
    icon: '⚡',
    label: 'Lifeline & Peralatan',
    jp: 'ライフライン・設備',
    desc: 'Listrik, pipa, HVAC, pemadam, telekomunikasi',
    color: '#10B981',
    gradient: 'linear-gradient(135deg, #064E3B, #059669)',
  },
];

export default function TrackPicker({ onSelect }) {
  const [selected, setSelected] = useState(null);

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '32px 20px',
        animation: 'fadeIn 0.4s ease',
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div
          style={{
            fontSize: 13,
            color: T.textDim,
            letterSpacing: 1.5,
            textTransform: 'uppercase',
            marginBottom: 6,
          }}
        >
          Pilih Jalur Belajar
        </div>
        <div style={{ fontSize: 20, fontWeight: 800 }}>
          <span
            style={{
              background: T.accent,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Bidang Apa Yang Kamu Pelajari?
          </span>
        </div>
      </div>

      {/* Track Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
        {TRACKS.map((track, i) => {
          const active = selected === track.key;
          return (
            <button
              key={track.key}
              onClick={() => setSelected(track.key)}
              style={{
                fontFamily: 'inherit',
                padding: '18px 16px',
                borderRadius: T.r.xl,
                cursor: 'pointer',
                background: active ? track.gradient : T.surface,
                border: `2px solid ${active ? track.color : T.border}`,
                color: T.text,
                textAlign: 'left',
                transform: active ? 'scale(1.02)' : 'scale(1)',
                boxShadow: active ? `0 8px 30px ${track.color}25` : 'none',
                transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
                animation: `slideUp 0.4s ease ${i * 0.08}s both`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div
                  style={{
                    fontSize: 28,
                    width: 52,
                    height: 52,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: T.r.lg,
                    background: active ? 'rgba(255,255,255,0.15)' : `${track.color}15`,
                  }}
                >
                  {track.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 2 }}>
                    {track.label}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      fontFamily: T.fontJP,
                      color: active ? 'rgba(255,255,255,0.7)' : T.textMuted,
                      marginBottom: 3,
                    }}
                  >
                    {track.jp}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: active ? 'rgba(255,255,255,0.55)' : T.textDim,
                      lineHeight: 1.3,
                    }}
                  >
                    {track.desc}
                  </div>
                </div>
                {active && <div style={{ fontSize: 18, color: 'rgba(255,255,255,0.8)' }}>✓</div>}
              </div>
            </button>
          );
        })}
      </div>

      {/* Info */}
      <div
        style={{
          fontSize: 11,
          color: T.textFaint,
          textAlign: 'center',
          marginBottom: 20,
          lineHeight: 1.5,
        }}
      >
        Materi umum (keselamatan, hukum, KY, 5S) otomatis termasuk di semua jalur.
        <br />
        Kamu bisa ganti jalur kapan saja nanti.
      </div>

      {/* CTA */}
      <button
        onClick={() => selected && onSelect(selected)}
        disabled={!selected}
        style={{
          width: '100%',
          padding: '14px',
          fontSize: 15,
          fontWeight: 700,
          fontFamily: 'inherit',
          borderRadius: T.r.md,
          border: 'none',
          cursor: selected ? 'pointer' : 'default',
          background: selected ? T.accent : T.surface,
          color: selected ? T.textBright : T.textDim,
          boxShadow: selected ? T.shadow.glowStrong : 'none',
          transition: 'all 0.25s',
        }}
      >
        {selected ? 'Lanjut →' : 'Pilih salah satu di atas'}
      </button>
    </div>
  );
}

export { TRACKS };
