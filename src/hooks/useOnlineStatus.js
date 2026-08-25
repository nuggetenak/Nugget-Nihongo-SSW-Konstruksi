// ─── hooks/useOnlineStatus.js ──────────────────────────────────────────────
// item 25: extracted from OfflineBanner.jsx, which had this inline with zero
// other consumers. gist-sync (a real network call) and the audio features
// (Web Speech API, which may depend on a network voice) both needed the same
// state to disable themselves with a reason instead of failing silently or
// surfacing only a generic fetch error after the fact.
import { useState, useEffect } from 'react';

export function useOnlineStatus() {
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

  return online;
}
