// SipilMode.jsx — Scaffold for 土木 (Sipil / Civil Engineering) track
// Data: pending source PDFs from sensei. Structure ready, just add sipil-sets.js.

import { T } from '../styles/theme.js';

const PLANNED_CONTENT = [
  { icon: '🏗️', label: 'Pekerjaan Tanah', jp: '土工事', desc: 'Galian, timbunan, kompaksi' },
  { icon: '🛣️', label: 'Pekerjaan Jalan', jp: '道路工事', desc: 'Aspal, beton, drainase jalan' },
  { icon: '🌉', label: 'Jembatan', jp: '橋梁工事', desc: 'Struktur beton, baja, fondasi' },
  { icon: '🚇', label: 'Terowongan', jp: 'トンネル工事', desc: 'Metode NATM, shield, cut-cover' },
  {
    icon: '🌊',
    label: 'Pekerjaan Air',
    jp: '河川工事',
    desc: 'Tanggul, bendungan, saluran irigasi',
  },
  { icon: '⚙️', label: 'Alat Berat', jp: '建設機械', desc: 'Excavator, bulldozer, crane' },
];

export default function SipilMode({ onExit }) {
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
          <span style={{ fontSize: 32 }}>⛏️</span>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>Sipil · 土木</h2>
            <div style={{ fontSize: 12, color: T.textMuted, fontFamily: T.fontJP }}>
              土木施工管理 — Doboku Sekō Kanri
            </div>
          </div>
        </div>

        {/* Coming Soon banner */}
        <div
          style={{
            padding: '14px 16px',
            borderRadius: T.r.md,
            background: 'linear-gradient(135deg,rgba(245,158,11,0.08),rgba(234,88,12,0.06))',
            border: '1px solid rgba(245,158,11,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <span style={{ fontSize: 22 }}>🚧</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.amber }}>Segera Hadir</div>
            <div style={{ fontSize: 11, color: T.textDim, marginTop: 2 }}>
              Soal SSW Konstruksi jalur 土木 sedang disiapkan. Upload PDF sumber ke sesi berikutnya
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
          <span style={{ fontWeight: 700, color: T.amber }}>0 / ~300 soal</span>
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
            style={{ width: '0%', height: '100%', background: T.accent, borderRadius: T.r.pill }}
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
        📄 <strong>Untuk developer:</strong> tambahkan soal di <code>src/data/sipil-sets.js</code>{' '}
        dengan schema yang sama seperti <code>csv-sets.js</code>, lalu import di mode ini.
      </div>
    </div>
  );
}
