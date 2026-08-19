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

  if (online) return null;

  return (
    <div className={s.banner} role="status" aria-live="polite">
      📶 Mode offline — semua data tersimpan lokal
    </div>
  );
}
