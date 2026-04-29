// ─── components/SayaTab.jsx ───────────────────────────────────────────────────
// "Saya" tab: personal progress, settings, data export/import.
// Consolidates Stats, Export, Sumber into one personal hub.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useCallback } from 'react';
import { T } from '../styles/theme.js';
import { CARDS } from '../data/cards.js';
import { exportAll, importAll, resetAll } from '../storage/engine.js';
import { useApp } from '../contexts/AppContext.jsx';
import { useProgress } from '../contexts/ProgressContext.jsx';
import { useSRSContext } from '../contexts/SRSContext.jsx';
import ProgressRing from './ProgressRing.jsx';

const TRACK_LABELS = {
  doboku: '⛏ Teknik Sipil · 土木',
  kenchiku: '🏗 Bangunan · 建築',
  lifeline: '⚡ Lifeline · ライフライン',
};

function Row({ label, value, sub, onClick, danger = false }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '13px 0',
        borderBottom: `1px solid ${T.border}`,
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: danger ? '#dc2626' : T.text }}>
          {label}
        </div>
        {sub && <div style={{ fontSize: 11, color: T.textDim, marginTop: 2 }}>{sub}</div>}
      </div>
      {value !== undefined && (
        <div style={{ fontSize: 13, color: T.textMuted, display: 'flex', alignItems: 'center', gap: 6 }}>
          {value}
          {onClick && <span style={{ color: T.textFaint }}>›</span>}
        </div>
      )}
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: 0.8,
          textTransform: 'uppercase',
          color: T.textDim,
          padding: '18px 0 4px',
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

export default function SayaTab() {
  const { track, setTrack, isDark, toggleTheme, toast, goMode } = useApp();
  const { known, unknown, streakData } = useProgress();
  const srs = useSRSContext();

  const total = CARDS.length;
  const knownN = known.size;
  const streak = streakData?.days ?? 0;

  // SRS stats
  const mature = srs.stats?.mature ?? 0;
  const young = srs.stats?.young ?? 0;
  const newCards = srs.stats?.new ?? 0;

  // Reset state machine
  const [resetStep, setResetStep] = useState(0); // 0=idle, 1=confirm, 2=countdown
  const [countdown, setCountdown] = useState(3);

  const handleResetTap = useCallback(() => {
    if (resetStep === 0) {
      setResetStep(1);
      return;
    }
    if (resetStep === 1) {
      setResetStep(2);
      setCountdown(3);
      let n = 3;
      const iv = setInterval(() => {
        n -= 1;
        setCountdown(n);
        if (n <= 0) { clearInterval(iv); setResetStep(3); }
      }, 1000);
      return;
    }
    if (resetStep === 3) {
      resetAll();
      setResetStep(0);
      toast.show('🗑️ Semua data telah direset');
    }
  }, [resetStep, toast]);

  // Export
  const handleExport = useCallback(() => {
    try {
      const data = exportAll();
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ssw-progress-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.show('💾 Progress berhasil diekspor');
    } catch {
      toast.show('❌ Gagal ekspor');
    }
  }, [toast]);

  // Import
  const handleImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const snap = JSON.parse(ev.target.result);
          importAll(snap);
          toast.show('📥 Progress berhasil diimpor — muat ulang halaman');
          setTimeout(() => window.location.reload(), 1500);
        } catch {
          toast.show('❌ File tidak valid');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, [toast]);

  const resetLabel =
    resetStep === 0 ? '🗑️ Reset Semua Data' :
    resetStep === 1 ? '⚠️ Yakin? Tap lagi untuk konfirmasi' :
    resetStep === 2 ? `Tunggu… (${countdown}s)` :
    '💥 Tap untuk konfirmasi reset';

  return (
    <div
      style={{
        padding: '0 16px 32px',
        maxWidth: T.maxW,
        margin: '0 auto',
        animation: 'fadeIn 0.25s ease',
      }}
    >
      {/* Header */}
      <div style={{ padding: '16px 0 4px' }}>
        <span
          style={{
            fontSize: 17,
            fontWeight: 800,
            background: T.accent,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Saya
        </span>
      </div>

      {/* Progress card */}
      <div
        style={{
          background: T.surface,
          border: `1px solid ${T.border}`,
          borderRadius: T.r.lg,
          padding: '20px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          marginTop: 8,
        }}
      >
        <ProgressRing current={knownN} total={total} size={100} stroke={8} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 6 }}>
            {knownN} kartu hafal
          </div>
          <div style={{ fontSize: 12, color: T.textDim, marginBottom: 4 }}>
            {unknown.size} belum · {total - knownN - unknown.size} sisa
          </div>
          {streak > 0 && (
            <div style={{ fontSize: 12, color: T.amber, fontWeight: 700 }}>
              🔥 {streak} hari berturut-turut
            </div>
          )}
        </div>
      </div>

      {/* SRS section */}
      <Section title="SRS">
        <Row label="Matang" value={mature} sub="Interval ≥ 21 hari" />
        <Row label="Muda" value={young} sub="Interval < 21 hari" />
        <Row label="Baru" value={newCards} sub="Belum pernah diulang" />
        {srs.dueCount > 0 && (
          <Row label="Jatuh tempo hari ini" value={srs.dueCount} sub="Siap diulang sekarang" />
        )}
      </Section>

      {/* Settings section */}
      <Section title="Pengaturan">
        <Row
          label="Jalur Belajar"
          value={TRACK_LABELS[track] ?? track}
          sub="Tap untuk ganti jalur"
          onClick={() => setTrack(null)}
        />
        <Row
          label="Tema"
          value={isDark ? '🌙 Gelap' : '☀️ Terang'}
          onClick={toggleTheme}
        />
      </Section>

      {/* Data section */}
      <Section title="Data">
        <Row
          label="💾 Ekspor Progress"
          sub="Unduh file JSON cadangan"
          onClick={handleExport}
        />
        <Row
          label="📥 Impor Progress"
          sub="Pulihkan dari file JSON"
          onClick={handleImport}
        />
        <div
          onClick={handleResetTap}
          style={{
            padding: '13px 0',
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: resetStep > 0 ? '#dc2626' : T.textDim,
              transition: 'color 0.2s',
            }}
          >
            {resetLabel}
          </div>
          {resetStep === 0 && (
            <div style={{ fontSize: 11, color: T.textFaint, marginTop: 2 }}>
              Hapus semua progress — tidak bisa dibatalkan
            </div>
          )}
        </div>
      </Section>

      {/* Info */}
      <Section title="Info">
        <Row label="📂 Sumber Materi" sub="Per PDF sumber" onClick={() => goMode('sumber')} />
        <Row label="ℹ️ Tentang Aplikasi" sub="SSW Konstruksi · by Nugget Nihongo" />
      </Section>

      <div
        style={{
          textAlign: 'center',
          fontSize: 10,
          color: T.textFaint,
          marginTop: 20,
          lineHeight: 1.6,
        }}
      >
        SSW Konstruksi v3.2.0
        <br />
        by Nugget Nihongo
        <br />
        土木 · 建築 · ライフライン設備
      </div>
    </div>
  );
}
