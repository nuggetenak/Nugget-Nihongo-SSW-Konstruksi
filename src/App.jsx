// ─── App.jsx (phaseA) ─────────────────────────────────────────────────────────
// Root. 3-tab layout: Beranda / Belajar / Saya.
// A.3 BUG-03: Consumes toastQueue from ProgressContext to fire milestone toasts.
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect } from 'react';
import { T } from './styles/theme.js';
import { useApp } from './contexts/AppContext.jsx';
import { useProgress } from './contexts/ProgressContext.jsx';
import { useSRSContext } from './contexts/SRSContext.jsx';

import Onboarding from './components/Onboarding.jsx';
import BottomNav from './components/BottomNav.jsx';
import Dashboard from './components/Dashboard.jsx';
import BelajarTab from './components/BelajarTab.jsx';
import SayaTab from './components/SayaTab.jsx';
import ModeRouter from './router/ModeRouter.jsx';

// ── Main ──────────────────────────────────────────────────────────────────
export default function App() {
  const { track, setTrack, isDark, toggleTheme, onboarded, completeOnboarding, tab, mode, goMode, goTab, toast } = useApp();
  const { known, unknown, toastQueue, clearToast } = useProgress();
  const srs = useSRSContext();

  // A.3: Consume queued milestone toasts from ProgressContext.
  // Using a queue (not direct setState) because toasts must fire after render,
  // not inside setProg's setState callback.
  useEffect(() => {
    if (toastQueue.length > 0) {
      const t = toastQueue[0];
      toast.show(t.msg, { duration: t.duration ?? 4000 });
      clearToast(0);
    }
  }, [toastQueue, toast, clearToast]);

  // Active mode takes full screen
  if (mode) return <main id="main-content"><ModeRouter /></main>;

  // First-run: interactive onboarding handles Welcome + Track + Demo + Goal.
  if (!onboarded) return <Onboarding onComplete={completeOnboarding} />;

  // Edge case: onboarded but track cleared (e.g. user reset track from Saya).
  if (!track) return <Onboarding onComplete={completeOnboarding} />;

  const belajarBadges = { ulasan: srs.dueCount };

  return (
    <main id="main-content" style={{ paddingBottom: T.navH + 16 }}>
      {tab === 'home'    && <Dashboard known={known} unknown={unknown} track={track} onNavigate={goMode} onChangeTrack={() => setTrack(null)} srs={srs} isDark={isDark} onToggleTheme={toggleTheme} />}
      {tab === 'belajar' && <BelajarTab onSelect={goMode} badges={belajarBadges} />}
      {tab === 'saya'    && <SayaTab />}

      <BottomNav active={tab} onChange={goTab} dueBadge={srs.dueCount} />
    </main>
  );
}
