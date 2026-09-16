// ─── DataWarningBanner.jsx ────────────────────────────────────────────────────
// item 19: storage-quota and data-corruption warnings are data-loss-risk events,
// which item 16's convention says never belong on a self-dismissing toast. One
// persistent banner covers all four states now -- quota, corruption, a document this
// build cannot migrate, and another tab writing to the same data -- because they share
// a shape ("something happened to your saved data") while wanting different words and
// a different next step. The copy is per state for exactly that reason: telling
// someone their data "has been reset and is probably lost" when in fact another tab
// simply moved ahead would be the worse kind of wrong.
import { useState, useEffect, useCallback } from 'react';
import { useApp } from '../contexts/AppContext.jsx';
import { getCorruptionWarning, addExternalChangeListener } from '../storage/engine.js';
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
  // A migration gap is not corruption and nothing was reset — the document is
  // intact, this build just has no upgrade path to it. Saying "sudah direset,
  // progres kemungkinan hilang" there would be false, and would push the user
  // towards overwriting data that is still fine.
  stale: {
    icon: '⚠️',
    text: 'Data tersimpan dari versi lain belum bisa diperbarui. Data aman — cadangkan sebelum lanjut.',
  },
  // Another tab changed the same data. Nothing is lost at this point — the engine has
  // re-read the changed document — but this tab is showing numbers from before it, and
  // continuing to study here would build on a view that is already behind.
  othertab: {
    icon: '🔄',
    text: 'Data berubah di tab lain. Muat ulang halaman agar angka di sini ikut terbaru.',
  },
};

export default function DataWarningBanner() {
  const { goMode } = useApp();
  const [warning, setWarning] = useState(null); // null | 'quota' | 'corrupt' | 'stale' | 'othertab'
  const [dismissed, setDismissed] = useState(false);

  // Corruption, if any, already happened by the time this mounts — init()
  // runs synchronously before React does (main.jsx). One check is enough.
  useEffect(() => {
    const entries = getCorruptionWarning();
    if (entries.length === 0) return;
    setWarning(entries.every((e) => e.migrationGap != null) ? 'stale' : 'corrupt');
  }, []);

  // A second tab writing to the same three documents. Registered here for the same
  // reason the quota handler is: it can happen at any point in a session, and this
  // banner is the app's one persistent surface for "something happened to your data"
  // — item 16's rule says a data-loss-risk event never belongs on a self-dismissing
  // toast, and a stale view of your own study history qualifies.
  useEffect(() => {
    // addExternalChangeListener, not the old single-slot setter: useSRS needs to
    // hear the same event to refresh the due badge (item 191), and one slot meant
    // whichever of the two registered last silently evicted the other.
    return addExternalChangeListener(() => {
      setWarning((w) => (w === 'quota' || w === 'corrupt' ? w : 'othertab'));
      setDismissed(false);
    });
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
      {warning === 'othertab' ? (
        // Backing up from a stale tab would write this tab's older view into the file.
        // Reloading is the action that actually helps here.
        <button className={s.action} onClick={() => window.location.reload()}>
          Muat ulang →
        </button>
      ) : (
        <button className={s.action} onClick={handleExport}>
          Cadangkan data →
        </button>
      )}
      <button className={s.close} onClick={() => setDismissed(true)} aria-label="Tutup peringatan">
        ✕
      </button>
    </div>
  );
}
