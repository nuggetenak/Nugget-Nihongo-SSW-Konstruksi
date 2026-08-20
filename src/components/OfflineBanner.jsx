// ─── OfflineBanner.jsx ────────────────────────────────────────────────────────
import { useState, useEffect } from 'react';
import s from './OfflineBanner.module.css';

export default function OfflineBanner() {
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, []);

  // Mirrors this banner's visibility onto <html> so anything else that's
  // fixed/sticky at the top (ModeHeader's trail) can offset below it instead
  // of overlapping — same JS-writes-a-signal pattern as AppShell's
  // data-bottom-nav-chrome, consumed in global.css.
  useEffect(() => {
    document.documentElement.dataset.offlineBannerVisible = String(!online);
    return () => {
      delete document.documentElement.dataset.offlineBannerVisible;
    };
  }, [online]);

  if (online) return null;

  return (
    <div className={s.banner} role="status" aria-live="polite">
      📶 Mode offline — semua data tersimpan lokal
    </div>
  );
}
