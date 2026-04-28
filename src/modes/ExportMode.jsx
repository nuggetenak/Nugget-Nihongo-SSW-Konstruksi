// ─── ExportMode.jsx ───────────────────────────────────────────────────────────
// Export & import all progress data: known/unknown + SRS card states.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from 'react';
import { T } from '../styles/theme.js';
import { exportSRSSnapshot, importSRSSnapshot, getStorageBackend } from '../srs/fsrs-store.js';

const EXPORT_VERSION = 2; // bumped from v1 — now includes SRS data

// ── Collect all ssw-* keys from window.storage / localStorage ─────────────
async function collectProgressData() {
  const data = {};

  // Try window.storage first
  if (typeof window.storage?.list === 'function') {
    try {
      const listed = await window.storage.list('ssw-');
      // Exclude SRS keys — those are handled by exportSRSSnapshot()
      const keys = (listed?.keys ?? []).filter(k => !k.startsWith('ssw-srs-'));
      for (const key of keys) {
        try {
          const item = await window.storage.get(key);
          if (item) data[key] = item.value;
        } catch {}
      }
    } catch {}
  } else {
    // localStorage fallback
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith('ssw-') && !key.startsWith('ssw-srs-')) {
        data[key] = localStorage.getItem(key);
      }
    }
  }

  // Grab onboarding flag from localStorage regardless
  try {
    const v = localStorage.getItem('ssw-onboarded');
    if (v) data['__ls__ssw-onboarded'] = v;
  } catch {}

  return data;
}

// ── Restore ssw-* keys ────────────────────────────────────────────────────
async function restoreProgressData(data) {
  let count = 0;
  for (const [key, value] of Object.entries(data)) {
    if (key.startsWith('__ls__')) {
      try { localStorage.setItem(key.replace('__ls__', ''), value); count++; } catch {}
    } else if (typeof window.storage?.set === 'function') {
      try { await window.storage.set(key, value); count++; } catch {}
    } else {
      try { localStorage.setItem(key, value); count++; } catch {}
    }
  }
  return count;
}

// ── Summary reader ────────────────────────────────────────────────────────
async function readSummary() {
  try {
    const data = await collectProgressData();
    const known   = data['ssw-known']   ? JSON.parse(data['ssw-known']).length   : 0;
    const unknown = data['ssw-unknown'] ? JSON.parse(data['ssw-unknown']).length : 0;
    const srsSnap = exportSRSSnapshot();
    const srsCount = Object.keys(srsSnap.cards).length;
    return { keyCount: Object.keys(data).length, known, unknown, srsCount };
  } catch {
    return { keyCount: 0, known: 0, unknown: 0, srsCount: 0 };
  }
}

export default function ExportMode({ onExit }) {
  const [summary, setSummary]   = useState(null);
  const [status, setStatus]     = useState(null); // { type: 'ok'|'err', msg }
  const [importing, setImport]  = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    readSummary().then(setSummary);
  }, []);

  // ── Export ───────────────────────────────────────────────────────────────
  const handleExport = async () => {
    setStatus(null);
    try {
      const [progressData, srsSnapshot] = await Promise.all([
        collectProgressData(),
        Promise.resolve(exportSRSSnapshot()),
      ]);

      const bundle = {
        _meta: {
          version:     EXPORT_VERSION,
          exported_at: new Date().toISOString(),
          app:         'SSW Konstruksi by Nugget Nihongo',
          backend:     getStorageBackend(),
        },
        progress: progressData,
        srs:      srsSnapshot,
      };

      const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `ssw-progress-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      const srsCount = Object.keys(srsSnapshot.cards).length;
      setStatus({ type: 'ok', msg: `✅ Ekspor berhasil! ${Object.keys(progressData).length} kunci progress + ${srsCount} kartu SRS tersimpan.` });
    } catch (e) {
      setStatus({ type: 'err', msg: `❌ Ekspor gagal: ${e.message}` });
    }
  };

  // ── Import ────────────────────────────────────────────────────────────────
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImport(true);
    setStatus(null);

    try {
      const text   = await file.text();
      const bundle = JSON.parse(text);

      // v1 compat: old format had `data` field, no SRS
      const progressData = bundle.progress ?? bundle.data;
      if (!progressData || typeof progressData !== 'object') {
        throw new Error('Format file tidak valid — field progress tidak ditemukan.');
      }

      const progressCount = await restoreProgressData(progressData);

      let srsCount = 0;
      if (bundle.srs?.cards) {
        srsCount = await importSRSSnapshot(bundle.srs);
      }

      setStatus({ type: 'ok', msg: `✅ Import berhasil! ${progressCount} kunci progress + ${srsCount} kartu SRS dipulihkan. Reload halaman untuk melihat perubahan.` });
      setSummary(await readSummary());
    } catch (e) {
      setStatus({ type: 'err', msg: `❌ Import gagal: ${e.message}` });
    } finally {
      setImport(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div style={{ padding: '24px 16px', maxWidth: T.maxW, margin: '0 auto' }}>
      <button onClick={onExit} style={{ fontFamily: 'inherit', fontSize: 12, color: T.textMuted, background: 'none', border: 'none', cursor: 'pointer', marginBottom: 16 }}>← Kembali</button>
      <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>💾 Ekspor & Impor</h2>
      <p style={{ fontSize: 12, color: T.textDim, marginBottom: 20, lineHeight: 1.6 }}>
        Simpan semua progress belajar + data SRS ke file JSON, atau pulihkan dari backup.
      </p>

      {/* Summary */}
      <div style={{ padding: '16px', background: T.surface, borderRadius: T.r.lg, border: `1px solid ${T.border}`, marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.5, color: T.textDim, textTransform: 'uppercase', marginBottom: 10 }}>
          Data Tersimpan Saat Ini
        </div>
        {summary === null ? (
          <div style={{ fontSize: 12, color: T.textDim }}>Memuat...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 6, textAlign: 'center' }}>
            {[
              { n: summary.known,    label: 'Hafal',      icon: '✅' },
              { n: summary.unknown,  label: 'Belum',      icon: '❌' },
              { n: summary.srsCount, label: 'Kartu SRS',  icon: '🔁' },
              { n: summary.keyCount, label: 'Total Kunci', icon: '🗂️' },
            ].map((s, i) => (
              <div key={i} style={{ padding: '8px 4px', background: T.bg, borderRadius: T.r.md, border: `1px solid ${T.border}` }}>
                <div style={{ fontSize: 14 }}>{s.icon}</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: T.gold }}>{s.n}</div>
                <div style={{ fontSize: 9, color: T.textDim }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}
        <div style={{ fontSize: 10, color: T.textFaint, marginTop: 10 }}>
          Backend: {getStorageBackend()}
        </div>
      </div>

      {/* Export */}
      <button onClick={handleExport} style={{
        width: '100%', padding: '14px', marginBottom: 10,
        fontFamily: 'inherit', fontSize: 14, fontWeight: 700,
        borderRadius: T.r.md, border: 'none', cursor: 'pointer',
        background: T.accent, color: T.textBright, boxShadow: T.shadow.glow,
      }}>
        📤 Ekspor Progress ke File
      </button>

      {/* Import */}
      <div onClick={() => fileRef.current?.click()} style={{
        width: '100%', padding: '14px', marginBottom: 20,
        fontFamily: 'inherit', fontSize: 14, fontWeight: 700,
        borderRadius: T.r.md, border: `1px dashed ${T.borderLight}`,
        cursor: 'pointer', textAlign: 'center',
        background: T.surface, color: T.textMuted, boxSizing: 'border-box',
      }}>
        {importing ? '⏳ Mengimpor...' : '📥 Impor Progress dari File'}
      </div>
      <input ref={fileRef} type="file" accept=".json" onChange={handleFileChange} style={{ display: 'none' }} />

      {/* Status */}
      {status && (
        <div style={{
          padding: '12px 14px', borderRadius: T.r.md, fontSize: 13, lineHeight: 1.5, marginBottom: 16,
          background: status.type === 'ok' ? T.correctBg : T.wrongBg,
          border: `1px solid ${status.type === 'ok' ? T.correctBorder : T.wrongBorder}`,
          color: status.type === 'ok' ? T.correct : T.wrong,
        }}>
          {status.msg}
        </div>
      )}

      {/* Info */}
      <div style={{ padding: '12px 14px', background: T.surface, borderRadius: T.r.md, border: `1px solid ${T.border}` }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: T.textDim, marginBottom: 6 }}>💡 Yang tersimpan dalam file ekspor:</div>
        <ul style={{ margin: 0, paddingLeft: 16, fontSize: 11, color: T.textDim, lineHeight: 1.8 }}>
          <li>Kartu hafal / belum hafal</li>
          <li>Data SRS per kartu (stability, difficulty, jadwal ulang)</li>
          <li>Riwayat jawaban salah dari kuis</li>
          <li>Jalur belajar yang dipilih (土木/建築/ライフライン)</li>
          <li>Kartu berbintang</li>
        </ul>
      </div>
    </div>
  );
}
