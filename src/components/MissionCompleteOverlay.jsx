// ─── components/MissionCompleteOverlay.jsx ────────────────────────────────────
// C.3: Brief celebration overlay when daily mission completes.
// Evidence: Clear (2018) — habit loop reward must be immediate and emotionally salient.
// Auto-dismisses after 1.5 seconds. Calls onDone when finished.
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react';

export default function MissionCompleteOverlay({ onDone }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      onDone?.();
    }, 1500);
    return () => clearTimeout(t);
  }, [onDone]);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="assertive"
      aria-label="Misi hari ini selesai"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.55)',
        animation: 'missionFadeOut 1.5s ease forwards',
      }}
    >
      <div style={{ textAlign: 'center', color: '#fff' }}>
        <div style={{ fontSize: 64, lineHeight: 1 }} aria-hidden="true">🎉</div>
        <div style={{ fontSize: 22, fontWeight: 800, marginTop: 10 }}>Misi Selesai!</div>
        <div style={{ fontSize: 13, marginTop: 6, opacity: 0.8 }}>Kembali besok untuk misi baru</div>
      </div>
    </div>
  );
}
