// ─── App.jsx ────────────────────────────────────────────────────────────────
// Root. 3-tab layout: Beranda / Belajar / Saya.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect } from 'react';
import { useApp } from './contexts/AppContext.jsx';
import { useProgress } from './contexts/ProgressContext.jsx';
import { useSRSContext } from './contexts/SRSContext.jsx';

import ErrorBoundary, { TabError } from './components/ErrorBoundary.jsx';
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

  // Watch for a new service worker finishing install and prompt before it
  // takes over — see UI_UX_PLAN.md item 37. The worker itself no longer calls
  // skipWaiting on install (sw.js), so it sits in `waiting` until the user
  // accepts here; only then do we post SKIP_WAITING and reload.
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    let cancelled = false;

    const promptUpdate = (worker) => {
      if (cancelled) return;
      cancelled = true; // one prompt per detected update is enough
      toast.show('🔄 Update tersedia', {
        undo: () => worker.postMessage({ type: 'SKIP_WAITING' }),
        actionLabel: 'Perbarui',
        duration: 10000,
        type: 'default',
      });
    };

    const watch = (reg) => {
      if (!reg) return;
      // A worker may already be waiting by the time this effect runs (e.g.
      // it finished installing while this tab was in the background).
      if (reg.waiting && navigator.serviceWorker.controller) {
        promptUpdate(reg.waiting);
      }
      reg.addEventListener('updatefound', () => {
        const installing = reg.installing;
        if (!installing) return;
        installing.addEventListener('statechange', () => {
          // controller already set = this isn't the first-ever install, so an
          // 'installed' worker here means a real update is ready.
          if (installing.state === 'installed' && navigator.serviceWorker.controller) {
            promptUpdate(installing);
          }
        });
      });
    };

    navigator.serviceWorker.getRegistration().then(watch);
    const onControllerChange = () => window.location.reload();
    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);
    return () => navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
  }, [toast]);

  // Storage-quota warnings moved to DataWarningBanner (item 19) -- a
  // data-loss-risk event doesn't belong on a self-dismissing toast (item
  // 16's own convention). Rendered unconditionally in AppShell, so it's
  // always the single place quotaHandler gets registered.

  // Active mode. Routed through AppShell too — modes previously returned early
  // and bypassed the shell entirely, which is why they stayed a 480px column on
  // desktop while the tabs had already gone responsive.
  if (mode)
    return (
      <main id="main-content" tabIndex={-1}>
        <AppShell
          tab={tab}
          onTabChange={goTab}
          dueBadge={srs.dueCount}
          chrome="mode"
          width={MODE_META[mode]?.width ?? 'reading'}
          mode={mode}
          onSelectMode={goMode}
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
    <main id="main-content" tabIndex={-1}>
      <AppShell tab={tab} onTabChange={goTab} dueBadge={srs.dueCount} onSelectMode={goMode}>
        {tab === 'home' && (
          <ErrorBoundary fallback={<TabError tab="Beranda" />}>
            <Dashboard
              known={known}
              unknown={unknown}
              track={track}
              onNavigate={goMode}
              onChangeTrack={() => setTrack(null)}
              onGoTab={goTab}
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
