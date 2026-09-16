// ─── App.jsx ────────────────────────────────────────────────────────────────
// Root. 3-tab layout: Beranda / Belajar / Saya.
// ─────────────────────────────────────────────────────────────────────────────

import { lazy, Suspense, useEffect } from 'react';
import { useApp } from './contexts/AppContext.jsx';
import { useProgress } from './contexts/ProgressContext.jsx';
import { useSRSContext } from './contexts/SRSContext.jsx';

import ErrorBoundary, { TabError } from './components/ErrorBoundary.jsx';
import Onboarding from './components/Onboarding.jsx';
import AppShell from './components/AppShell.jsx';
import ModeHeader from './components/ModeHeader.jsx';
import Dashboard from './components/Dashboard.jsx';
import BelajarTab from './components/BelajarTab.jsx';
import SayaTab from './components/SayaTab.jsx';
import Skeleton from './components/Skeleton.jsx';
import { MODE_META } from './router/modes.js';

// Lazy, and not for its own weight. `ModeRouter` statically imports `cards.js` to
// build `filteredCards` and to hand `allCards` to the modes that need it, so a static
// import here put the whole 758 kB / 212 kB-gzipped corpus in the entry graph —
// fetched and parsed before first paint, on every first page view, for a tree that
// only renders once the learner has opened a mode. Every mode inside it is already
// lazy for exactly this reason; the router itself was the hole in that.
//
// The boundary is honest about what it is waiting for: opening a mode already shows a
// skeleton while the mode's own chunk loads, so this adds no new kind of wait, only
// the same one slightly earlier in the chain.
const loadModeRouter = () => import('./router/ModeRouter.jsx');
const ModeRouter = lazy(loadModeRouter);

// ── Main ──────────────────────────────────────────────────────────────────
export default function App() {
  const {
    track,
    setTrack,
    theme,
    toggleTheme,
    onboarded,
    completeOnboarding,
    tab,
    mode,
    modeHistory,
    goMode,
    goTab,
    goBack,
    toast,
  } = useApp();
  const { known, unknown, toastQueue, clearToast } = useProgress();
  const srs = useSRSContext();

  // Warm the router chunk once the app is idle (item 153).
  //
  // It stays out of the ENTRY graph -- this is still a dynamic import, fired
  // after first paint, and eager-bundle-graph.test.js walks static imports
  // only. What it buys is the first mode entry of a session: until this chunk
  // is in, opening any mode shows a skeleton while it downloads, and ModeHeader
  // lives inside it.
  //
  // That last detail is why this is filed under the morph rather than under
  // perf. The shared-element transition needs the header's icon and title to
  // EXIST in the new snapshot, which is taken the moment the update commits --
  // and measured in Chromium, the first entry produced only the outgoing halves
  // (`::view-transition-old(morph-icon)` with no matching `-new`), because the
  // header had not arrived yet. The second entry produced the full group. A
  // feature that works every time except the first is worse than one that never
  // does, because nobody can tell which one they are looking at.
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(loadModeRouter, { timeout: 3000 });
      return () => window.cancelIdleCallback?.(id);
    }
    // Safari has no requestIdleCallback. A timeout past first paint is the
    // same intent with a cruder instrument.
    const t = setTimeout(loadModeRouter, 1200);
    return () => clearTimeout(t);
  }, []);

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
    return () =>
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
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
          {/* ── The header is chrome, so it is eager (item 153) ──────────────
              It rendered inside ModeRouter until now, and ModeRouter is lazy.
              That meant the back control and the page title did not exist until
              a 7.7 kB chunk had downloaded -- so the first mode entry of a
              session showed a bare skeleton with no title and no way back, on
              exactly the connection where that wait is longest.

              It also broke the shared-element morph, which is how this was
              found. Measured in Chromium: on a first entry the transition
              produced `::view-transition-old(morph-icon)` with no matching
              `-new`, because the destination had not arrived when the snapshot
              was taken; on the second it produced the full group. Warming the
              chunk did not help -- React.lazy resolves its payload on the first
              RENDER attempt, so even an already-downloaded module suspends
              once, and flushSync cannot wait out the microtask that would
              settle it. Rendering the header outside that boundary is the fix,
              and it is the right place for it regardless.

              ModeHeader draws from MODE_META and Icon, both already eager, so
              this adds nothing to the entry graph -- eager-bundle-graph.test.js
              still passes unchanged. */}
          <ModeHeader mode={mode} modeHistory={modeHistory} onBack={goBack} />

          {/* The three tabs below each get a boundary; this branch did not, and
              it is the most-exercised screen in the app. ModeRouter has one of
              its own, but it wraps only its Suspense -- everything ModeRouter
              computes before that return (its hooks, filteredCards, the whole
              modeProps map) ran outside any boundary, so a throw there
              unmounted the tree to a blank page mid-study. */}
          <ErrorBoundary fallback={<TabError tab="Mode belajar" />}>
            <Suspense
              fallback={
                <div role="status" aria-label="Memuat mode...">
                  <Skeleton
                    width="100%"
                    height={4}
                    radius={99}
                    style={{ marginBottom: 'var(--space-24)' }}
                  />
                  <Skeleton.Card />
                </div>
              }
            >
              <ModeRouter />
            </Suspense>
          </ErrorBoundary>
        </AppShell>
      </main>
    );

  // First-run: interactive onboarding handles Welcome + Track + Demo + Goal.
  //
  // Inside `<main id="main-content">` like every other branch, because
  // `index.html`'s skip link points at that id and this was the one screen where the
  // target did not exist — so the very first keyboard user to press Tab on the very
  // first screen got a link that went nowhere.
  if (!onboarded)
    return (
      <main id="main-content" tabIndex={-1}>
        <Onboarding onComplete={completeOnboarding} />
      </main>
    );

  // Edge case: onboarded but track cleared (e.g. user reset track from Saya).
  // startStep='goal' -- track itself has no picker step (single-track scope,
  // see Onboarding.jsx), so replaying Welcome + the flashcard Demo for what
  // is really a one-field settings confirmation was the actual bug (item 24).
  if (!track)
    return (
      <main id="main-content" tabIndex={-1}>
        <Onboarding onComplete={completeOnboarding} startStep="goal" />
      </main>
    );

  const belajarBadges = { ulasan: srs.dueCount };

  return (
    <main id="main-content" tabIndex={-1}>
      <AppShell
        tab={tab}
        onTabChange={goTab}
        dueBadge={srs.dueCount}
        onSelectMode={goMode}
        width={tab === 'belajar' ? 'reading' : 'default'}
      >
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
              theme={theme}
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
