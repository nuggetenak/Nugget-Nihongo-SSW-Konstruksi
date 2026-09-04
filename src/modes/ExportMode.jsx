// ─── ExportMode.jsx ──────────────────────────────────────────────────────────
// validateSnapshot before applying import; rollback on error.
// Shows data summary before export and diff preview before import.
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useRef } from 'react';
import { T } from '../styles/theme.js';
import { exportAll, importAllSafe, validateSnapshot } from '../storage/engine.js';
import {
  saveToken,
  loadToken,
  saveGistId,
  loadGistId,
  pushToGist,
  pullFromGist,
  findExistingGist,
} from '../utils/gist-sync.js';
import { useOnlineStatus } from '../hooks/useOnlineStatus.js';
import S from './modes.module.css';

function readSummary() {
  try {
    const data = exportAll();
    return {
      known: (data.progress?.known ?? []).length,
      unknown: (data.progress?.unknown ?? []).length,
      starred: (data.progress?.starred ?? []).length,
      srsCount: Object.keys(data.srs?.cards ?? {}).length,
      sessions: (data.progress?.sessions ?? []).length,
      quizWrong: Object.keys(data.progress?.quizWrong ?? {}).length,
      wgWrong: Object.keys(data.progress?.wgWrong ?? {}).length,
      jacScores: Object.keys(data.progress?.jacScores ?? {}).length,
      wgScores: Object.keys(data.progress?.wgScores ?? {}).length,
      version: data._storage_version ?? data.progress?._v ?? '?',
      exportedAt: data.exported_at ?? null,
    };
  } catch {
    return { known: 0, unknown: 0, starred: 0, srsCount: 0, sessions: 0, version: '?' };
  }
}

export default function ExportMode() {
  const [summary, setSummary] = useState(() => readSummary());
  const [status, setStatus] = useState(null);
  const [importing, setImport] = useState(false);
  const [previewData, setPreviewData] = useState(null); // pending import data
  const fileRef = useRef(null);

  // Gist sync state.
  const [gistPat, setGistPat] = useState(() => loadToken());
  const [gistId, setGistId] = useState(() => loadGistId());
  const [gistStatus, setGistStatus] = useState(null);
  const [gistBusy, setGistBusy] = useState(false);
  const online = useOnlineStatus();
  const [showGist, setShowGist] = useState(false);

  const handleExport = () => {
    setStatus(null);
    try {
      const data = exportAll();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ssw-progress-v${data._storage_version}-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setStatus({
        type: 'ok',
        msg: `✅ Berhasil! ${summary.known} hafal + ${summary.srsCount} kartu SRS disimpan.`,
      });
    } catch (e) {
      setStatus({ type: 'err', msg: `❌ Gagal ekspor: ${e.message}` });
    }
  };

  // Step 1: read & validate file — show preview before applying
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImport(true);
    setStatus(null);
    setPreviewData(null);
    try {
      const parsed = JSON.parse(await file.text());
      const validation = validateSnapshot(parsed);
      if (!validation.ok) throw new Error(`Format tidak valid: ${validation.reason}`);
      // Detect if current data is newer than file (dual-device conflict).
      const currentExportedAt = exportAll().exported_at ?? null;
      const fileExportedAt = parsed.exported_at ?? null;
      const hasConflict =
        currentExportedAt &&
        fileExportedAt &&
        new Date(currentExportedAt) > new Date(fileExportedAt);
      // Show diff summary for user to confirm
      setPreviewData({
        snapshot: parsed,
        incoming: validation.summary,
        hasConflict,
        fileDate: fileExportedAt,
        currentDate: currentExportedAt,
      });
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
      const result = importAllSafe(previewData.snapshot);
      setSummary(readSummary());
      setPreviewData(null);
      const migratedNote = result?.migrated ? ' ℹ️ Data diperbarui dari format lama.' : '';
      setStatus({
        type: 'ok',
        msg: `✅ Dipulihkan! ${previewData.incoming.known} hafal, ${previewData.incoming.srsCards} kartu SRS. Muat ulang halaman.${migratedNote}`,
      });
    } catch (e) {
      setStatus({ type: 'err', msg: `❌ Import gagal (progress lama tetap): ${e.message}` });
      setPreviewData(null);
    }
  };

  // Gist handlers.
  const handleGistPush = async () => {
    if (!online) {
      setGistStatus({ type: 'err', msg: '📶 Offline — sinkronisasi Gist butuh koneksi internet.' });
      return;
    }
    if (!gistPat.trim()) {
      setGistStatus({ type: 'err', msg: '❌ Masukkan GitHub Token terlebih dahulu.' });
      return;
    }
    setGistBusy(true);
    setGistStatus(null);
    try {
      const data = exportAll();
      let targetId = gistId;
      if (!targetId) {
        const found = await findExistingGist(gistPat);
        targetId = found?.id ?? '';
      }
      const result = await pushToGist(gistPat, data, targetId);
      saveGistId(result.id);
      setGistId(result.id);
      setGistStatus({ type: 'ok', msg: `✅ Tersimpan ke Gist! (${result.id.slice(0, 8)}…)` });
    } catch (e) {
      setGistStatus({ type: 'err', msg: `❌ ${e.message}` });
    } finally {
      setGistBusy(false);
    }
  };

  const handleGistPull = async () => {
    if (!online) {
      setGistStatus({ type: 'err', msg: '📶 Offline — sinkronisasi Gist butuh koneksi internet.' });
      return;
    }
    if (!gistPat.trim()) {
      setGistStatus({ type: 'err', msg: '❌ Masukkan GitHub Token terlebih dahulu.' });
      return;
    }
    setGistBusy(true);
    setGistStatus(null);
    try {
      let targetId = gistId;
      if (!targetId) {
        const found = await findExistingGist(gistPat);
        if (!found) throw new Error('Gist belum ditemukan. Push dulu dari perangkat lain.');
        targetId = found.id;
        saveGistId(found.id);
        setGistId(found.id);
      }
      const snapshot = await pullFromGist(gistPat, targetId);
      const validation = validateSnapshot(snapshot);
      if (!validation.ok) throw new Error(`Format tidak valid: ${validation.reason}`);
      const gistResult = importAllSafe(snapshot);
      setSummary(readSummary());
      const gistMigratedNote = gistResult?.migrated ? ' ℹ️ Data diperbarui dari format lama.' : '';
      setGistStatus({
        type: 'ok',
        msg: `✅ Progress dipulihkan dari Gist! Muat ulang halaman.${gistMigratedNote}`,
      });
    } catch (e) {
      setGistStatus({ type: 'err', msg: `❌ ${e.message}` });
    } finally {
      setGistBusy(false);
    }
  };

  const savePatAndId = () => {
    saveToken(gistPat.trim());
    saveGistId(gistId.trim());
    setGistStatus({ type: 'ok', msg: '✅ Token tersimpan.' });
  };

  const summaryItems = [
    { n: summary.known, label: 'Hafal', icon: '✅' },
    { n: summary.unknown, label: 'Belum', icon: '❌' },
    { n: summary.srsCount, label: 'Kartu SRS', icon: '🔁' },
    { n: summary.sessions, label: 'Sesi', icon: '📊' },
    { n: summary.quizWrong, label: 'Salah Kuis', icon: '⚠️' },
    { n: summary.jacScores, label: 'Skor JAC', icon: '🏆' },
  ];

  return (
    <div className={S.page}>
      <p className={S.pageSub} style={{ fontSize: 'var(--fs-caption)', color: T.textDim }}>
        Simpan progress ke file JSON untuk backup atau pindah perangkat.
      </p>

      {/* Current data summary */}
      <div className={S.cardLg} style={{ marginBottom: 'var(--space-20)' }}>
        <div className={S.sectionLabel} style={{ marginBottom: 'var(--space-10)' }}>
          Data Tersimpan Saat Ini
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr 1fr',
            gap: 'var(--space-6)',
            textAlign: 'center',
          }}
        >
          {summaryItems.map((s, i) => (
            <div
              key={i}
              style={{
                padding: 'var(--space-8) var(--space-4)',
                background: T.bg,
                borderRadius: T.r.md,
                border: `1px solid ${T.border}`,
              }}
            >
              <div style={{ fontSize: 14 }}>{s.icon}</div>
              <div style={{ fontSize: 16, fontWeight: 800, color: T.gold }}>{s.n}</div>
              <div style={{ fontSize: 'var(--fs-nano)', color: T.textDim }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div
          style={{ fontSize: 'var(--fs-micro)', color: T.textFaint, marginTop: 'var(--space-10)' }}
        >
          Schema v{summary.version} · localStorage browser ini
        </div>
      </div>

      <button
        className={S.btnPrimary}
        style={{ marginBottom: 'var(--space-10)' }}
        onClick={handleExport}
      >
        📤 Ekspor Progress ke File
      </button>
      <button
        onClick={() => {
          try {
            const full = exportAll();
            const delta = {
              _type: 'ssw-srs-delta',
              _storage_version: full._storage_version,
              exported_at: new Date().toISOString(),
              srs: full.srs,
              // Also include known/starred for SRS context
              known: full.progress?.known ?? [],
              starred: full.progress?.starred ?? [],
            };
            const blob = new Blob([JSON.stringify(delta, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ssw-srs-delta-${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            setStatus({ type: 'ok', msg: `✅ Delta SRS disimpan: ${summary.srsCount} kartu SRS.` });
          } catch (e) {
            setStatus({ type: 'err', msg: `❌ Gagal: ${e.message}` });
          }
        }}
        style={{
          fontFamily: 'inherit',
          width: '100%',
          padding: 'var(--space-12) 0',
          borderRadius: T.r.lg,
          border: `1px solid ${T.border}`,
          background: T.surface,
          color: T.textMuted,
          cursor: 'pointer',
          fontSize: 14,
          fontWeight: 600,
          marginBottom: 'var(--space-10)',
        }}
      >
        🧠 Ekspor Delta SRS Saja
      </button>
      <p
        style={{
          fontSize: 'var(--fs-small)',
          color: T.textDim,
          marginBottom: 'var(--space-16)',
          lineHeight: 1.5,
        }}
      >
        Delta SRS = hanya data ulasan (kartu hafal + jadwal SRS) tanpa statistik kuis. Lebih kecil,
        berguna untuk backup rutin harian.
      </p>

      {/* Import — show preview panel when file is loaded */}
      {previewData ? (
        <div
          className={S.cardLg}
          style={{
            marginBottom: 'var(--space-16)',
            border: `1px solid ${T.gold}55`,
            background: `${T.gold}08`,
          }}
        >
          <div
            style={{ fontSize: 'var(--fs-body)', fontWeight: 700, marginBottom: 'var(--space-10)' }}
          >
            📥 Pratinjau Data Import
          </div>
          {/* Conflict warning if current data is newer than file. */}
          {previewData.hasConflict && (
            <div
              style={{
                marginBottom: 'var(--space-10)',
                padding: 'var(--space-10) var(--space-12)',
                borderRadius: T.r.md,
                background: T.wrongBg,
                border: `1px solid ${T.wrongBorder}`,
                fontSize: 'var(--fs-caption)',
                color: T.wrong,
                lineHeight: 1.5,
              }}
            >
              ⚠️ <strong>Potensi Konflik:</strong> Data di perangkat ini lebih baru dari file yang
              diimpor.
              <br />
              <span style={{ color: T.textDim }}>
                File: {previewData.fileDate?.slice(0, 16).replace('T', ' ')} · Perangkat:{' '}
                {previewData.currentDate?.slice(0, 16).replace('T', ' ')}
              </span>
              <br />
              Melanjutkan akan <strong>menimpa data yang lebih baru</strong>.
            </div>
          )}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 'var(--space-8)',
              marginBottom: 'var(--space-12)',
            }}
          >
            {[
              { label: 'Hafal', cur: summary.known, inc: previewData.incoming.known },
              { label: 'Kartu SRS', cur: summary.srsCount, inc: previewData.incoming.srsCards },
              { label: 'Sesi', cur: summary.sessions, inc: previewData.incoming.sessions },
              {
                label: 'Versi',
                cur: `v${summary.version}`,
                inc: `v${previewData.incoming.version}`,
              },
            ].map((row, i) => (
              <div
                key={i}
                style={{
                  background: T.bg,
                  borderRadius: T.r.md,
                  padding: 'var(--space-8) var(--space-10)',
                  border: `1px solid ${T.border}`,
                  fontSize: 'var(--fs-small)',
                }}
              >
                <div style={{ fontWeight: 700, color: T.textDim, marginBottom: 'var(--space-4)' }}>
                  {row.label}
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-6)', alignItems: 'center' }}>
                  <span style={{ color: T.textMuted }}>{row.cur}</span>
                  <span style={{ color: T.textFaint }}>→</span>
                  <span style={{ color: T.amber, fontWeight: 700 }}>{row.inc}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-8)' }}>
            <button
              className={S.btnPrimary}
              style={{ background: T.correct, fontSize: 'var(--fs-body)' }}
              onClick={handleConfirmImport}
            >
              ✅ Konfirmasi Import
            </button>
            <button
              className={S.btnSecondary}
              style={{ fontSize: 'var(--fs-body)' }}
              onClick={() => {
                setPreviewData(null);
                setStatus(null);
              }}
            >
              ✕ Batal
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          style={{
            width: '100%',
            margin: 0,
            padding: 'var(--space-14)',
            marginBottom: 'var(--space-20)',
            fontFamily: 'inherit',
            fontSize: 14,
            fontWeight: 700,
            borderRadius: T.r.md,
            border: `1px dashed ${T.borderLight}`,
            cursor: 'pointer',
            textAlign: 'center',
            background: T.surface,
            color: T.textMuted,
            boxSizing: 'border-box',
          }}
          onClick={() => fileRef.current?.click()}
        >
          {importing ? '⏳ Memuat...' : '📥 Impor dari File'}
        </button>
      )}
      <input
        ref={fileRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      {/* Status message */}
      {status && status.type !== 'preview' && (
        <div
          style={{
            padding: 'var(--space-12) var(--space-14)',
            borderRadius: T.r.md,
            fontSize: 'var(--fs-body)',
            lineHeight: 1.5,
            marginBottom: 'var(--space-16)',
            background: status.type === 'ok' ? T.correctBg : T.wrongBg,
            border: `1px solid ${status.type === 'ok' ? T.correctBorder : T.wrongBorder}`,
            color: status.type === 'ok' ? T.correct : T.wrong,
          }}
        >
          {status.msg}
        </div>
      )}

      {/* GitHub Gist Sync */}
      <button
        onClick={() => setShowGist((s) => !s)}
        style={{
          width: '100%',
          padding: 'var(--space-12)',
          marginBottom: 'var(--space-12)',
          fontFamily: 'inherit',
          fontSize: 'var(--fs-body)',
          fontWeight: 700,
          borderRadius: T.r.md,
          border: `1px solid ${showGist ? T.borderActive : T.border}`,
          background: showGist ? T.surfaceActive : T.surface,
          color: showGist ? T.amber : T.textMuted,
          cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        🔗 Sinkronisasi Gist (Multi-Perangkat) {showGist ? '▲' : '▼'}
      </button>

      {showGist && (
        <div className={S.cardLg} style={{ marginBottom: 'var(--space-16)' }}>
          <div
            style={{
              fontSize: 'var(--fs-small)',
              color: T.textDim,
              marginBottom: 'var(--space-10)',
              lineHeight: 1.6,
            }}
          >
            Sync progress antar-perangkat tanpa backend — pakai GitHub Gist pribadi kamu (gratis).
            Token disimpan di perangkat ini saja dan hanya dikirim ke{' '}
            <strong>api.github.com</strong>.
          </div>

          {!online && (
            <div
              style={{
                fontSize: 'var(--fs-small)',
                color: T.wrong,
                background: T.wrongBg,
                border: `1px solid ${T.wrongBorder}`,
                borderRadius: 8,
                padding: 'var(--space-8) var(--space-10)',
                marginBottom: 'var(--space-10)',
              }}
            >
              📶 Offline sekarang — Push/Pull butuh koneksi internet. Semua fitur lain (kartu, kuis,
              ekspor/impor file lokal) tetap jalan seperti biasa.
            </div>
          )}

          <label
            htmlFor="export-gist-pat"
            style={{
              display: 'block',
              fontSize: 'var(--fs-small)',
              fontWeight: 700,
              color: T.text,
              marginBottom: 'var(--space-4)',
            }}
          >
            GitHub Personal Access Token (scope: gist)
          </label>
          <input
            id="export-gist-pat"
            type="password"
            value={gistPat}
            onChange={(e) => setGistPat(e.target.value)}
            placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
            style={{
              width: '100%',
              padding: 'var(--space-10) var(--space-12)',
              fontSize: 'var(--fs-body)',
              fontFamily: 'monospace',
              border: `1px solid ${T.border}`,
              borderRadius: T.r.md,
              background: T.surface,
              color: T.text,
              boxSizing: 'border-box',
              marginBottom: 'var(--space-8)',
            }}
          />

          <label
            htmlFor="export-gist-id"
            style={{
              display: 'block',
              fontSize: 'var(--fs-small)',
              fontWeight: 700,
              color: T.text,
              marginBottom: 'var(--space-4)',
            }}
          >
            Gist ID (isi otomatis setelah push pertama)
          </label>
          <input
            id="export-gist-id"
            type="text"
            value={gistId}
            onChange={(e) => setGistId(e.target.value)}
            placeholder="(otomatis diisi)"
            style={{
              width: '100%',
              padding: 'var(--space-10) var(--space-12)',
              fontSize: 'var(--fs-caption)',
              fontFamily: 'monospace',
              border: `1px solid ${T.border}`,
              borderRadius: T.r.md,
              background: T.surface,
              color: T.textMuted,
              boxSizing: 'border-box',
              marginBottom: 'var(--space-10)',
            }}
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: 'var(--space-6)',
              marginBottom: 'var(--space-8)',
            }}
          >
            <button
              onClick={savePatAndId}
              disabled={gistBusy}
              style={{
                padding: 'var(--space-10) var(--space-6)',
                fontFamily: 'inherit',
                fontSize: 'var(--fs-small)',
                fontWeight: 700,
                borderRadius: T.r.md,
                border: `1px solid ${T.border}`,
                background: T.surface,
                color: T.textMuted,
                cursor: 'pointer',
              }}
            >
              💾 Simpan
            </button>
            <button
              onClick={handleGistPush}
              disabled={gistBusy || !gistPat.trim() || !online}
              title={online ? undefined : 'Butuh koneksi internet'}
              style={{
                padding: 'var(--space-10) var(--space-6)',
                fontFamily: 'inherit',
                fontSize: 'var(--fs-small)',
                fontWeight: 700,
                borderRadius: T.r.md,
                border: `1px solid ${T.correctBorder}`,
                background: T.correctBg,
                color: T.correct,
                cursor: online ? 'pointer' : 'not-allowed',
                opacity: online ? 1 : 0.5,
              }}
            >
              {gistBusy ? '⏳' : '⬆ Push'}
            </button>
            <button
              onClick={handleGistPull}
              disabled={gistBusy || !gistPat.trim() || !online}
              title={online ? undefined : 'Butuh koneksi internet'}
              style={{
                padding: 'var(--space-10) var(--space-6)',
                fontFamily: 'inherit',
                fontSize: 'var(--fs-small)',
                fontWeight: 700,
                borderRadius: T.r.md,
                border: `1px solid ${T.borderActive}`,
                background: T.surfaceActive,
                color: T.amber,
                cursor: online ? 'pointer' : 'not-allowed',
                opacity: online ? 1 : 0.5,
              }}
            >
              {gistBusy ? '⏳' : '⬇ Pull'}
            </button>
          </div>

          {gistStatus && (
            <div
              style={{
                fontSize: 'var(--fs-caption)',
                padding: 'var(--space-8) var(--space-10)',
                borderRadius: T.r.md,
                background: gistStatus.type === 'ok' ? T.correctBg : T.wrongBg,
                border: `1px solid ${gistStatus.type === 'ok' ? T.correctBorder : T.wrongBorder}`,
                color: gistStatus.type === 'ok' ? T.correct : T.wrong,
              }}
            >
              {gistStatus.msg}
            </div>
          )}

          <div
            style={{
              marginTop: 'var(--space-8)',
              fontSize: 'var(--fs-micro)',
              color: T.textDim,
              lineHeight: 1.5,
            }}
          >
            Cara buat token: github.com → Settings → Developer settings → Personal access tokens →
            New token → centang <strong>gist</strong>
          </div>
        </div>
      )}

      <div className={S.cardLg}>
        <div
          style={{
            fontSize: 'var(--fs-small)',
            fontWeight: 700,
            color: T.textDim,
            marginBottom: 'var(--space-6)',
          }}
        >
          💡 Isi file ekspor:
        </div>
        <ul
          style={{
            margin: 0,
            paddingLeft: 'var(--space-16)',
            fontSize: 'var(--fs-small)',
            color: T.textDim,
            lineHeight: 1.8,
          }}
        >
          <li>Kartu hafal / belum hafal / berbintang</li>
          <li>Data SRS per kartu (jadwal ulang, stability, history)</li>
          <li>Riwayat jawaban salah dari kuis</li>
          <li>Riwayat sesi belajar</li>
          <li>Jalur belajar &amp; preferensi (土木 / 建築 / ライフライン)</li>
        </ul>
        <div
          style={{
            marginTop: 'var(--space-10)',
            fontSize: 'var(--fs-small)',
            color: T.textDim,
            lineHeight: 1.6,
          }}
        >
          ⚠️ Proses import menampilkan pratinjau data sebelum diterapkan. Kalau gagal, data lama
          otomatis dipulihkan.
        </div>
      </div>
    </div>
  );
}
