// ─── TrackPicker.jsx ──────────────────────────────────────────────────────────
// Note: per-track gradient/color on card bg/border/shadow — justified inline.
import { useState } from 'react';
import { T } from '../styles/theme.js';
import S from './TrackPicker.module.css';

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
    <div className={S.wrap}>
      <div className={S.header}>
        <div className={S.eyebrow}>Pilih Jalur Belajar</div>
        <div className={S.headline}>Bidang Apa Yang Kamu Pelajari?</div>
      </div>

      <div className={S.list}>
        {TRACKS.map((track, i) => {
          const active = selected === track.key;
          return (
            <button
              key={track.key}
              className={S.card}
              onClick={() => setSelected(track.key)}
              style={{
                background: active ? track.gradient : T.surface,
                border: `2px solid ${active ? track.color : T.border}`,
                color: T.text,
                transform: active ? 'scale(1.02)' : 'scale(1)',
                boxShadow: active ? `0 8px 30px ${track.color}25` : 'none',
                animation: `slideUp 0.4s ease ${i * 0.08}s both`,
              }}
            >
              <div className={S.cardInner}>
                <div
                  className={S.iconWrap}
                  style={{ background: active ? 'rgba(255,255,255,0.15)' : `${track.color}15` }}
                >
                  {track.icon}
                </div>
                <div className={S.cardMeta}>
                  <div className={S.cardLabel}>{track.label}</div>
                  <div
                    className={S.cardJp}
                    style={{
                      fontFamily: T.fontJP,
                      color: active ? 'rgba(255,255,255,0.7)' : T.textMuted,
                    }}
                  >
                    {track.jp}
                  </div>
                  <div
                    className={S.cardDesc}
                    style={{ color: active ? 'rgba(255,255,255,0.55)' : T.textDim }}
                  >
                    {track.desc}
                  </div>
                </div>
                {active && <div className={S.checkmark}>✓</div>}
              </div>
            </button>
          );
        })}
      </div>

      <div className={S.info}>
        Materi umum (keselamatan, hukum, KY, 5S) otomatis termasuk di semua jalur.
        <br />
        Kamu bisa ganti jalur kapan saja nanti.
      </div>

      <button
        className={S.cta}
        data-ready={String(!!selected)}
        disabled={!selected}
        onClick={() => selected && onSelect(selected)}
      >
        {selected ? 'Lanjut →' : 'Pilih salah satu di atas'}
      </button>
    </div>
  );
}

export { TRACKS };
