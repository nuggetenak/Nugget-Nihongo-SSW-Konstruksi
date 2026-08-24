// ─── DataWarningBanner.jsx ────────────────────────────────────────────────────
// item 19: storage-quota and data-corruption warnings are data-loss-risk
// events, which item 16's convention says never belong on a self-dismissing
// toast. One persistent banner covers both -- same underlying message
// ("something's wrong with your saved data, back it up"), different trigger.
import { useState, useEffect, useCallback } from 'react';
import { useApp } from '../contexts/AppContext.jsx';
import { getCorruptionWarning } from '../storage/engine.js';
import { setQuotaHandler } from '../utils/storage-quota.js';
import s from './DataWarningBanner.module.css';

const COPY = {
  quota: {
    icon: '💾',
    text: 'Penyimpanan penuh — progres terbaru mungkin tidak tersimpan.',
  },
  corrupt: {
    icon: '⚠️',
    text: 'Data tersimpan tidak bisa dibaca dan sudah direset. Progres sebelumnya kemungkinan hilang.',
  },
};

export default function DataWarningBanner() {
  const { goMode } = useApp();
  const [warning, setWarning] = useState(null); // null | 'quota' | 'corrupt'
  const [dismissed, setDismissed] = useState(false);

  // Corruption, if any, already happened by the time this mounts — init()
  // runs synchronously before React does (main.jsx). One check is enough.
  useEffect(() => {
    if (getCorruptionWarning().length > 0) setWarning('corrupt');
  }, []);

  // Quota errors can happen at any point during the session, so this stays
  // registered for as long as the banner is mounted (effectively the whole
  // app lifetime, since AppShell always renders it).
  useEffect(() => {
    setQuotaHandler(() => {
      setWarning('quota');
      setDismissed(false); // a fresh quota event re-surfaces even if the last one was dismissed
    });
    return () => setQuotaHandler(null);
  }, []);

  // Reuses OfflineBanner's own visibility signal (global.css /
  // data-offline-banner-visible) rather than a second coordination
  // mechanism — when both are up, this one sits just below it instead of
  // overlapping it.
  const [offsetForOfflineBanner, setOffsetForOfflineBanner] = useState(false);
  useEffect(() => {
    const check = () =>
      setOffsetForOfflineBanner(document.documentElement.dataset.offlineBannerVisible === 'true');
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  const handleExport = useCallback(() => goMode('ekspor'), [goMode]);

  if (!warning || dismissed) return null;
  const copy = COPY[warning];

  return (
    <div
      className={s.banner}
      role="alert"
      style={offsetForOfflineBanner ? { top: 'var(--mode-header-top, 36px)' } : undefined}
    >
      <span className={s.msg}>
        {copy.icon} {copy.text}
      </span>
      <button className={s.action} onClick={handleExport}>
        Cadangkan data →
      </button>
      <button className={s.close} onClick={() => setDismissed(true)} aria-label="Tutup peringatan">
        ✕
      </button>
    </div>
  );
}
