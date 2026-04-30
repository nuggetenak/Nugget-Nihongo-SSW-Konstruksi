// ─── ExportMode.jsx ───────────────────────────────────────────────────────────
import { useState, useRef } from 'react';
import { T } from '../styles/theme.js';
import { exportSRSSnapshot, importSRSSnapshot } from '../srs/fsrs-store.js';
import S from './modes.module.css';

const EXPORT_VERSION = 2;
const SSW_PREFIX = 'ssw-';
const SRS_PREFIX = 'ssw-srs-';

function collectProgressData() {
  const data = {};
  try {
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith(SSW_PREFIX) && !key.startsWith(SRS_PREFIX)) {
        data[key] = localStorage.getItem(key);
      }
    }
  } catch {}
  return data;
}

function restoreProgressData(data) {
  let count = 0;
  for (const [key, value] of Object.entries(data)) {
    const realKey = key.startsWith('__ls__') ? key.replace('__ls__', '') : key;
    try { localStorage.setItem(realKey, value); count++; } catch {}
  }
  return count;
}

function readSummary() {
  try {
    const progress = collectProgressData();
    const known = progress['ssw-known'] ? JSON.parse(progress['ssw-known']).length : 0;
    const unknown = progress['ssw-unknown'] ? JSON.parse(progress['ssw-unknown']).length : 0;
    const srs = exportSRSSnapshot();
    return { known, unknown, srsCount: Object.keys(srs.cards).length, keyCount: Object.keys(progress).length };
  } catch {
    return { known: 0, unknown: 0, srsCount: 0, keyCount: 0 };
  }
}

export default function ExportMode({ onExit }) {
  const [summary, setSummary] = useState(() => readSummary());
  const [status, setStatus] = useState(null);
  const [importing, setImport] = useState(false);
  const fileRef = useRef(null);

  const handleExport = () => {
    setStatus(null);
    try {
      const progressData = collectProgressData();
      const srsSnapshot = exportSRSSnapshot();
      const bundle = {
        _meta: { version: EXPORT_VERSION, exported_at: new Date().toISOString(), app: 'SSW Konstruksi by Nugget Nihongo' },
        progress: progressData,
        srs: srsSnapshot,
      };
      const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `ssw-progress-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setStatus({ type: 'ok', msg: `✅ Berhasil! ${Object.keys(progressData).length} kunci progress + ${Object.keys(srsSnapshot.cards).length} kartu SRS disimpan.` });
    } catch (e) { setStatus({ type: 'err', msg: `❌ Gagal: ${e.message}` }); }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImport(true); setStatus(null);
    try {
      const bundle = JSON.parse(await file.text());
      const progressData = bundle.progress ?? bundle.data;
      if (!progressData || typeof progressData !== 'object') throw new Error('Format file tidak valid.');
      const progressCount = restoreProgressData(progressData);
      let srsCount = 0;
      if (bundle.srs?.cards) srsCount = importSRSSnapshot(bundle.srs);
      setStatus({ type: 'ok', msg: `✅ Berhasil! ${progressCount} kunci + ${srsCount} kartu SRS dipulihkan. Reload untuk melihat perubahan.` });
      setSummary(readSummary());
    } catch (e) { setStatus({ type: 'err', msg: `❌ Gagal: ${e.message}` }); }
    finally { setImport(false); if (fileRef.current) fileRef.current.value = ''; }
  };

  const summaryItems = [
    { n: summary.known, label: 'Hafal', icon: '✅' },
    { n: summary.unknown, label: 'Belum', icon: '❌' },
    { n: summary.srsCount, label: 'Kartu SRS', icon: '🔁' },
    { n: summary.keyCount, label: 'Kunci', icon: '🗂️' },
  ];

  return (
    <div className={S.page}>
      <button className={S.btnBack} onClick={onExit}>← Kembali</button>
      <h2 className={S.pageTitle}>💾 Ekspor &amp; Impor</h2>
      <p className={S.pageSub} style={{ fontSize: 12, color: T.textDim }}>
        Simpan progress ke file JSON untuk backup atau pindah perangkat.
      </p>

      {/* Summary */}
      <div className={S.cardLg} style={{ marginBottom: 20 }}>
        <div className={S.sectionLabel} style={{ marginBottom: 10 }}>Data Tersimpan Saat Ini</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 6, textAlign: 'center' }}>
          {summaryItems.map((s, i) => (
            <div key={i} style={{ padding: '8px 4px', background: T.bg, borderRadius: T.r.md, border: `1px solid ${T.border}` }}>
              <div style={{ fontSize: 14 }}>{s.icon}</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: T.gold }}>{s.n}</div>
              <div style={{ fontSize: 9, color: T.textDim }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 10, color: T.textFaint, marginTop: 10 }}>Disimpan di localStorage browser ini</div>
      </div>

      <button className={S.btnPrimary} style={{ marginBottom: 10 }} onClick={handleExport}>
        📤 Ekspor Progress ke File
      </button>

      <div
        style={{ width: '100%', padding: '14px', marginBottom: 20, fontFamily: 'inherit', fontSize: 14, fontWeight: 700, borderRadius: T.r.md, border: `1px dashed ${T.borderLight}`, cursor: 'pointer', textAlign: 'center', background: T.surface, color: T.textMuted, boxSizing: 'border-box' }}
        onClick={() => fileRef.current?.click()}
      >
        {importing ? '⏳ Mengimpor...' : '📥 Impor dari File'}
      </div>
      <input ref={fileRef} type="file" accept=".json" onChange={handleFileChange} style={{ display: 'none' }} />

      {status && (
        <div style={{ padding: '12px 14px', borderRadius: T.r.md, fontSize: 13, lineHeight: 1.5, marginBottom: 16, background: status.type === 'ok' ? T.correctBg : T.wrongBg, border: `1px solid ${status.type === 'ok' ? T.correctBorder : T.wrongBorder}`, color: status.type === 'ok' ? T.correct : T.wrong }}>
          {status.msg}
        </div>
      )}

      <div className={S.cardLg}>
        <div style={{ fontSize: 11, fontWeight: 700, color: T.textDim, marginBottom: 6 }}>💡 Isi file ekspor:</div>
        <ul style={{ margin: 0, paddingLeft: 16, fontSize: 11, color: T.textDim, lineHeight: 1.8 }}>
          <li>Kartu hafal / belum hafal</li>
          <li>Data SRS per kartu (jadwal ulang, stability, history)</li>
          <li>Riwayat jawaban salah dari kuis</li>
          <li>Jalur belajar (土木 / 建築 / ライフライン)</li>
        </ul>
        <div style={{ marginTop: 10, fontSize: 11, color: T.textDim, lineHeight: 1.6 }}>
          ⚠️ Progress tersimpan di browser ini saja. Gunakan ekspor/impor untuk pindah ke perangkat lain.
        </div>
      </div>
    </div>
  );
}
