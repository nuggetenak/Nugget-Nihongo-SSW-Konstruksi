// BangunanMode.jsx — Scaffold for 建築 (Bangunan / Building Construction) track
import { T } from '../styles/theme.js';
import S from './modes.module.css';

const INDIGO = '#818cf8';

const PLANNED_CONTENT = [
  { icon: '🪵', label: 'Pekerjaan Kayu', jp: '木工事', desc: 'Struktur, bekisting kayu, finishing' },
  { icon: '🧱', label: 'Pasangan & Plester', jp: '左官工事', desc: 'Bata, mortar, acian, keramik' },
  { icon: '🔩', label: 'Struktur Baja', jp: '鉄骨工事', desc: 'Kolom baja, balok, sambungan' },
  { icon: '🏗️', label: 'Beton & Bekisting', jp: '型枠・コンクリート工事', desc: 'Cor beton, curing, pengujian slump' },
  { icon: '🎨', label: 'Finishing', jp: '仕上げ工事', desc: 'Cat, wallpaper, lantai, plafon' },
  { icon: '🪟', label: 'Pintu & Jendela', jp: '建具工事', desc: 'Kusen aluminium, kaca, hardware' },
];

export default function BangunanMode({ onExit }) {
  return (
    <div className={S.page}>
      <button className={S.btnBack} onClick={onExit}>← Kembali</button>

      <div style={{ marginBottom: 24 }}>
        <div className={S.row} style={{ gap: 12, marginBottom: 8 }}>
          <span style={{ fontSize: 32 }}>🏗️</span>
          <div>
            <h2 className={S.pageTitle} style={{ fontSize: 20 }}>Bangunan · 建築</h2>
            <div style={{ fontSize: 12, color: T.textMuted, fontFamily: T.fontJP }}>建築施工管理 — Kenchiku Sekō Kanri</div>
          </div>
        </div>
        <div style={{ padding: '14px 16px', borderRadius: T.r.md, background: 'linear-gradient(135deg,rgba(99,102,241,0.08),rgba(139,92,246,0.06))', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 22 }}>🚧</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: INDIGO }}>Segera Hadir</div>
            <div style={{ fontSize: 11, color: T.textDim, marginTop: 2 }}>Soal SSW Konstruksi jalur 建築 sedang disiapkan. Upload PDF sumber ke sesi berikutnya untuk mulai build.</div>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <div className={S.rowSpread} style={{ fontSize: 11, color: T.textDim, marginBottom: 6 }}>
          <span>Progress konten</span>
          <span style={{ fontWeight: 700, color: INDIGO }}>0 / ~300 soal</span>
        </div>
        <div style={{ height: 6, borderRadius: T.r.pill, background: T.surface, border: `1px solid ${T.border}`, overflow: 'hidden' }}>
          <div style={{ width: '0%', height: '100%', background: 'linear-gradient(90deg,#6366f1,#8b5cf6)', borderRadius: T.r.pill }} />
        </div>
      </div>

      <div className={S.sectionLabel}>Materi Yang Akan Datang</div>
      <div className={S.list}>
        {PLANNED_CONTENT.map((item) => (
          <div key={item.label} className={S.row} style={{ padding: '12px 14px 12px 16px', borderRadius: T.r.md, background: T.surface, border: `1px solid ${T.border}`, opacity: 0.6, gap: 12 }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>{item.icon}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>
                {item.label}
                <span style={{ fontSize: 11, fontWeight: 400, color: T.textDim, marginLeft: 6, fontFamily: T.fontJP }}>{item.jp}</span>
              </div>
              <div style={{ fontSize: 11, color: T.textDim, marginTop: 2 }}>{item.desc}</div>
            </div>
            <span style={{ fontSize: 9, fontWeight: 700, color: T.textDim, background: T.border, borderRadius: T.r.pill, padding: '2px 7px', flexShrink: 0 }}>SOON</span>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 20, padding: '12px 14px', borderRadius: T.r.md, background: T.surface, border: `1px dashed ${T.border}`, fontSize: 11, color: T.textDim, lineHeight: 1.6 }}>
        📄 <strong>Untuk developer:</strong> tambahkan soal di <code>src/data/bangunan-sets.js</code> dengan schema yang sama seperti <code>csv-sets.js</code>, lalu import di mode ini.
      </div>
    </div>
  );
}
