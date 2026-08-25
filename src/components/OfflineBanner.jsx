// ─── OfflineBanner.jsx ────────────────────────────────────────────────────────
import { useEffect } from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus.js';
import s from './OfflineBanner.module.css';

export default function OfflineBanner() {
  const online = useOnlineStatus();

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
      📶 Mode offline — kartu, kuis & SRS tetap jalan. Audio & sinkronisasi Gist mungkin tidak
      tersedia.
    </div>
  );
}
