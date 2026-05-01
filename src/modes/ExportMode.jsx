// ─── ExportMode.jsx (phaseD) ──────────────────────────────────────────────────
// Phase D: Import hardening — validateSnapshot before applying, rollback on error.
//          Shows data summary before export and diff preview before import.
//          Phase A already rewired to engine exportAll()/importAll().
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useRef } from 'react';
import { T } from '../styles/theme.js';
import { exportAll, importAllSafe, validateSnapshot } from '../storage/engine.js';
import S from './modes.module.css';

function readSummary() {
  try {
    const data = exportAll();
    return {
      known:    (data.progress?.known    ?? []).length,
      unknown:  (data.progress?.unknown  ?? []).length,
      starred:  (data.progress?.starred  ?? []).length,
      srsCount: Object.keys(data.srs?.cards ?? {}).length,
      sessions: (data.progress?.sessions ?? []).length,
      version:  data._storage_version ?? data.progress?._v ?? '?',
    };
  } catch {
    return { known: 0, unknown: 0, starred: 0, srsCount: 0, sessions: 0, version: '?' };
  }
}

export default function ExportMode({ onExit }) {
  const [summary, setSummary]       = useState(() => readSummary());
  const [status, setStatus]         = useState(null);
  const [importing, setImport]      = useState(false);
  const [previewData, setPreviewData] = useState(null); // pending import data
  const fileRef = useRef(null);

  const handleExport = () => {
    setStatus(null);
    try {
      const data = exportAll();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url;
      a.download = `ssw-progress-v${data._storage_version}-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setStatus({ type: 'ok', msg: `✅ Berhasil! ${summary.known} hafal + ${summary.srsCount} kartu SRS disimpan.` });
    } catch (e) { setStatus({ type: 'err', msg: `❌ Gagal ekspor: ${e.message}` }); }
  };

  // Step 1: read & validate file — show preview before applying
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImport(true); setStatus(null); setPreviewData(null);
    try {
      const parsed   = JSON.parse(await file.text());
      const validation = validateSnapshot(parsed);
      if (!validation.ok) throw new Error(`Format tidak valid: ${validation.reason}`);
      // Show diff summary for user to confirm
      setPreviewData({ snapshot: parsed, incoming: validation.summary });
      setStatus({ type: 'preview', msg: null });
    } catch (e) {
      setStatus({ type: 'err', msg: `❌ File tidak valid: ${e.message}` });
    } finally {
      setImport(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  // Step 2: user confirms import
  const handleConfirmImport = () => {
    if (!previewData) return;
    try {
      importAllSafe(previewData.snapshot);
      setSummary(readSummary());
      setPreviewData(null);
      setStatus({ type: 'ok', msg: `✅ Dipulihkan! ${previewData.incoming.known} hafal, ${previewData.incoming.srsCards} kartu SRS. Muat ulang halaman.` });
    } catch (e) {
      setStatus({ type: 'err', msg: `❌ Import gagal (progress lama tetap): ${e.message}` });
      setPreviewData(null);
    }
  };

  const summaryItems = [
    { n: summary.known,    label: 'Hafal',     icon: '✅' },
    { n: summary.unknown,  label: 'Belum',     icon: '❌' },
    { n: summary.srsCount, label: 'Kartu SRS', icon: '🔁' },
    { n: summary.sessions, label: 'Sesi',      icon: '📊' },
  ];

  return (
    <div className={S.page}>
      <button className={S.btnBack} onClick={onExit}>← Kembali</button>
      <h2 className={S.pageTitle}>💾 Ekspor &amp; Impor</h2>
      <p className={S.pageSub} style={{ fontSize: 12, color: T.textDim }}>
        Simpan progress ke file JSON untuk backup atau pindah perangkat.
      </p>

      {/* Current data summary */}
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
        <div style={{ fontSize: 10, color: T.textFaint, marginTop: 10 }}>
          Schema v{summary.version} · localStorage browser ini
        </div>
      </div>

      <button className={S.btnPrimary} style={{ marginBottom: 10 }} onClick={handleExport}>
        📤 Ekspor Progress ke File
      </button>

      {/* Import — show preview panel when file is loaded */}
      {previewData ? (
        <div className={S.cardLg} style={{ marginBottom: 16, border: `1px solid ${T.gold}55`, background: `${T.gold}08` }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>📥 Pratinjau Data Import</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
            {[
              { label: 'Hafal',     cur: summary.known,    inc: previewData.incoming.known },
              { label: 'Kartu SRS', cur: summary.srsCount, inc: previewData.incoming.srsCards },
              { label: 'Sesi',      cur: summary.sessions, inc: previewData.incoming.sessions },
              { label: 'Versi',     cur: `v${summary.version}`, inc: `v${previewData.incoming.version}` },
            ].map((row, i) => (
              <div key={i} style={{ background: T.bg, borderRadius: T.r.md, padding: '8px 10px', border: `1px solid ${T.border}`, fontSize: 11 }}>
                <div style={{ fontWeight: 700, color: T.textDim, marginBottom: 4 }}>{row.label}</div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span style={{ color: T.textMuted }}>{row.cur}</span>
                  <span style={{ color: T.textFaint }}>→</span>
                  <span style={{ color: T.amber, fontWeight: 700 }}>{row.inc}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <button
              className={S.btnPrimary}
              style={{ background: T.correct, fontSize: 13 }}
              onClick={handleConfirmImport}
            >
              ✅ Konfirmasi Import
            </button>
            <button
              className={S.btnSecondary}
              style={{ fontSize: 13 }}
              onClick={() => { setPreviewData(null); setStatus(null); }}
            >
              ✕ Batal
            </button>
          </div>
        </div>
      ) : (
        <div
          style={{ width: '100%', padding: '14px', marginBottom: 20, fontFamily: 'inherit', fontSize: 14, fontWeight: 700, borderRadius: T.r.md, border: `1px dashed ${T.borderLight}`, cursor: 'pointer', textAlign: 'center', background: T.surface, color: T.textMuted, boxSizing: 'border-box' }}
          onClick={() => fileRef.current?.click()}
        >
          {importing ? '⏳ Memuat...' : '📥 Impor dari File'}
        </div>
      )}
      <input ref={fileRef} type="file" accept=".json" onChange={handleFileChange} style={{ display: 'none' }} />

      {/* Status message */}
      {status && status.type !== 'preview' && (
        <div style={{ padding: '12px 14px', borderRadius: T.r.md, fontSize: 13, lineHeight: 1.5, marginBottom: 16, background: status.type === 'ok' ? T.correctBg : T.wrongBg, border: `1px solid ${status.type === 'ok' ? T.correctBorder : T.wrongBorder}`, color: status.type === 'ok' ? T.correct : T.wrong }}>
          {status.msg}
        </div>
      )}

      <div className={S.cardLg}>
        <div style={{ fontSize: 11, fontWeight: 700, color: T.textDim, marginBottom: 6 }}>💡 Isi file ekspor:</div>
        <ul style={{ margin: 0, paddingLeft: 16, fontSize: 11, color: T.textDim, lineHeight: 1.8 }}>
          <li>Kartu hafal / belum hafal / berbintang</li>
          <li>Data SRS per kartu (jadwal ulang, stability, history)</li>
          <li>Riwayat jawaban salah dari kuis</li>
          <li>Riwayat sesi belajar (Phase C)</li>
          <li>Jalur belajar &amp; preferensi (土木 / 建築 / ライフライン)</li>
        </ul>
        <div style={{ marginTop: 10, fontSize: 11, color: T.textDim, lineHeight: 1.6 }}>
          ⚠️ Proses import menampilkan pratinjau data sebelum diterapkan. Kalau gagal, data lama otomatis dipulihkan.
        </div>
      </div>
    </div>
  );
}
