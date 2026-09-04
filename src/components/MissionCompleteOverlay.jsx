// ─── components/MissionCompleteOverlay.jsx ────────────────────────────────────
// Tap-to-dismiss overlay. Shows mission label + score, auto-dismiss after 3s.
// Evidence: Clear (2018) — reward must be salient and interactive.
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect, useState } from 'react';

export default function MissionCompleteOverlay({ onDone, result }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      onDone?.();
    }, 3000);
    return () => clearTimeout(t);
  }, [onDone]);

  if (!visible) return null;

  const handleTap = () => {
    setVisible(false);
    onDone?.();
  };

  return (
    <div
      role="status"
      aria-live="assertive"
      aria-label="Misi hari ini selesai"
      onClick={handleTap}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 'var(--z-celebration)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.65)',
        cursor: 'pointer',
        animation: 'missionFadeOut 3s ease forwards',
      }}
    >
      <div style={{ textAlign: 'center', color: '#fff', padding: '0 32px', userSelect: 'none' }}>
        <div style={{ fontSize: 64, lineHeight: 1 }} aria-hidden="true">
          {result?.icon ?? '🎉'}
        </div>
        <div style={{ fontSize: 'var(--fs-page-title)', fontWeight: 800, marginTop: 10 }}>
          Misi Selesai!
        </div>
        {result?.label && (
          <div style={{ fontSize: 14, marginTop: 6, opacity: 0.9, fontWeight: 600 }}>
            {result.label}
          </div>
        )}
        {result?.total > 0 && (
          <div style={{ fontSize: 'var(--fs-body)', marginTop: 4, opacity: 0.75 }}>
            {result.correct}/{result.total} benar
          </div>
        )}
        <div style={{ fontSize: 'var(--fs-small)', marginTop: 12, opacity: 0.5 }}>
          Ketuk untuk tutup
        </div>
      </div>
    </div>
  );
}
