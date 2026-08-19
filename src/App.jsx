// ─── App.jsx ────────────────────────────────────────────────────────────────
// Root. 3-tab layout: Beranda / Belajar / Saya.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect } from 'react';
import { useApp } from './contexts/AppContext.jsx';
import { useProgress } from './contexts/ProgressContext.jsx';
import { useSRSContext } from './contexts/SRSContext.jsx';
import { setQuotaHandler } from './utils/storage-quota.js';

import ErrorBoundary, { TabError } from './components/ErrorBoundary.jsx';
import OfflineBanner from './components/OfflineBanner.jsx';
import Onboarding from './components/Onboarding.jsx';
import AppShell from './components/AppShell.jsx';
import Dashboard from './components/Dashboard.jsx';
import BelajarTab from './components/BelajarTab.jsx';
import SayaTab from './components/SayaTab.jsx';
import ModeRouter from './router/ModeRouter.jsx';
import { MODE_META } from './router/modes.js';

// ── Main ──────────────────────────────────────────────────────────────────
export default function App() {
  const {
    track,
    setTrack,
    isDark,
    toggleTheme,
    onboarded,
    completeOnboarding,
    tab,
    mode,
    goMode,
    goTab,
    toast,
  } = useApp();
  const { known, unknown, toastQueue, clearToast } = useProgress();
  const srs = useSRSContext();

  // Consume queued milestone toasts from ProgressContext.
  useEffect(() => {
    if (toastQueue.length > 0) {
      const t = toastQueue[0];
      toast.show(t.msg, { duration: t.duration ?? 4000 });
      clearToast(0);
    }
  }, [toastQueue, toast, clearToast]);

  // Listen for SW_UPDATED message from service worker and offer reload.
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    const handler = (e) => {
      if (e.data?.type === 'SW_UPDATED') {
        toast.show('🔄 Update tersedia', {
          undo: () => window.location.reload(),
          duration: 10000,
          type: 'default',
        });
      }
    };
    navigator.serviceWorker.addEventListener('message', handler);
    return () => navigator.serviceWorker.removeEventListener('message', handler);
  }, [toast]);

  // Register quota error handler — shows toast if localStorage write fails.
  useEffect(() => {
    setQuotaHandler(() => {
      toast.show('💾 Penyimpanan penuh. Backup data di menu Pengaturan sebelum data hilang.', {
        duration: 8000,
        type: 'error',
      });
    });
  }, [toast]);

  // Active mode. Routed through AppShell too — modes previously returned early
  // and bypassed the shell entirely, which is why they stayed a 480px column on
  // desktop while the tabs had already gone responsive.
  if (mode)
    return (
      <main id="main-content">
        <AppShell
          tab={tab}
          onTabChange={goTab}
          dueBadge={srs.dueCount}
          chrome="mode"
          width={MODE_META[mode]?.width ?? 'reading'}
        >
          <ModeRouter />
        </AppShell>
      </main>
    );

  // First-run: interactive onboarding handles Welcome + Track + Demo + Goal.
  if (!onboarded) return <Onboarding onComplete={completeOnboarding} />;

  // Edge case: onboarded but track cleared (e.g. user reset track from Saya).
  if (!track) return <Onboarding onComplete={completeOnboarding} />;

  const belajarBadges = { ulasan: srs.dueCount };

  return (
    <main id="main-content">
      <OfflineBanner />

      <AppShell tab={tab} onTabChange={goTab} dueBadge={srs.dueCount}>
        {tab === 'home' && (
          <ErrorBoundary fallback={<TabError tab="Beranda" />}>
            <Dashboard
              known={known}
              unknown={unknown}
              track={track}
              onNavigate={goMode}
              onChangeTrack={() => setTrack(null)}
              srs={srs}
              isDark={isDark}
              onToggleTheme={toggleTheme}
            />
          </ErrorBoundary>
        )}
        {tab === 'belajar' && (
          <ErrorBoundary fallback={<TabError tab="Belajar" />}>
            <BelajarTab onSelect={goMode} badges={belajarBadges} />
          </ErrorBoundary>
        )}
        {tab === 'saya' && (
          <ErrorBoundary fallback={<TabError tab="Saya" />}>
            <SayaTab />
          </ErrorBoundary>
        )}
      </AppShell>
    </main>
  );
}
