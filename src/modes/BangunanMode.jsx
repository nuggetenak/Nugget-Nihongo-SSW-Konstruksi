// BangunanMode.jsx — Scaffold for 建築 (Bangunan / Building Construction) track
// Data: pending source PDFs from sensei. Structure ready, just add bangunan-sets.js.

import { T } from '../styles/theme.js';

const PLANNED_CONTENT = [
  {
    icon: '🪵',
    label: 'Pekerjaan Kayu',
    jp: '木工事',
    desc: 'Struktur, bekisting kayu, finishing',
  },
  { icon: '🧱', label: 'Pasangan & Plester', jp: '左官工事', desc: 'Bata, mortar, acian, keramik' },
  { icon: '🔩', label: 'Struktur Baja', jp: '鉄骨工事', desc: 'Kolom baja, balok, sambungan' },
  {
    icon: '🏗️',
    label: 'Beton & Bekisting',
    jp: '型枠・コンクリート工事',
    desc: 'Cor beton, curing, pengujian slump',
  },
  { icon: '🎨', label: 'Finishing', jp: '仕上げ工事', desc: 'Cat, wallpaper, lantai, plafon' },
  { icon: '🪟', label: 'Pintu & Jendela', jp: '建具工事', desc: 'Kusen aluminium, kaca, hardware' },
];

export default function BangunanMode({ onExit }) {
  return (
    <div style={{ padding: '24px 16px', maxWidth: T.maxW, margin: '0 auto' }}>
      <button
        onClick={onExit}
        style={{
          fontFamily: 'inherit',
          fontSize: 12,
          color: T.textMuted,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          marginBottom: 16,
        }}
      >
        ← Kembali
      </button>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <span style={{ fontSize: 32 }}>🏗️</span>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>Bangunan · 建築</h2>
            <div style={{ fontSize: 12, color: T.textMuted, fontFamily: T.fontJP }}>
              建築施工管理 — Kenchiku Sekō Kanri
            </div>
          </div>
        </div>

        {/* Coming Soon banner */}
        <div
          style={{
            padding: '14px 16px',
            borderRadius: T.r.md,
            background: 'linear-gradient(135deg,rgba(99,102,241,0.08),rgba(139,92,246,0.06))',
            border: '1px solid rgba(99,102,241,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <span style={{ fontSize: 22 }}>🚧</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#818cf8' }}>Segera Hadir</div>
            <div style={{ fontSize: 11, color: T.textDim, marginTop: 2 }}>
              Soal SSW Konstruksi jalur 建築 sedang disiapkan. Upload PDF sumber ke sesi berikutnya
              untuk mulai build.
            </div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ marginBottom: 24 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 11,
            color: T.textDim,
            marginBottom: 6,
          }}
        >
          <span>Progress konten</span>
          <span style={{ fontWeight: 700, color: '#818cf8' }}>0 / ~300 soal</span>
        </div>
        <div
          style={{
            height: 6,
            borderRadius: T.r.pill,
            background: T.surface,
            border: `1px solid ${T.border}`,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: '0%',
              height: '100%',
              background: 'linear-gradient(90deg,#6366f1,#8b5cf6)',
              borderRadius: T.r.pill,
            }}
          />
        </div>
      </div>

      {/* Planned content */}
      <div style={{ marginBottom: 8 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 800,
            color: T.textMuted,
            letterSpacing: 1.5,
            textTransform: 'uppercase',
            marginBottom: 12,
          }}
        >
          Materi Yang Akan Datang
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {PLANNED_CONTENT.map((item) => (
            <div
              key={item.label}
              style={{
                padding: '12px 14px 12px 16px',
                borderRadius: T.r.md,
                background: T.surface,
                border: `1px solid ${T.border}`,
                opacity: 0.6,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <span style={{ fontSize: 20, flexShrink: 0 }}>{item.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>
                  {item.label}
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 400,
                      color: T.textDim,
                      marginLeft: 6,
                      fontFamily: T.fontJP,
                    }}
                  >
                    {item.jp}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: T.textDim, marginTop: 2 }}>{item.desc}</div>
              </div>
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  color: T.textDim,
                  background: T.border,
                  borderRadius: T.r.pill,
                  padding: '2px 7px',
                  flexShrink: 0,
                }}
              >
                SOON
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Source note */}
      <div
        style={{
          marginTop: 20,
          padding: '12px 14px',
          borderRadius: T.r.md,
          background: T.surface,
          border: `1px dashed ${T.border}`,
          fontSize: 11,
          color: T.textDim,
          lineHeight: 1.6,
        }}
      >
        📄 <strong>Untuk developer:</strong> tambahkan soal di{' '}
        <code>src/data/bangunan-sets.js</code> dengan schema yang sama seperti{' '}
        <code>csv-sets.js</code>, lalu import di mode ini.
      </div>
    </div>
  );
}
