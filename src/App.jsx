// ─── App.jsx ──────────────────────────────────────────────────────────────────
// Root. 3-tab layout: Beranda / Belajar / Saya.
// All state lives in contexts; routing in ModeRouter.
// ─────────────────────────────────────────────────────────────────────────────

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
  const { track, setTrack, isDark, toggleTheme, onboarded, completeOnboarding, tab, mode, goMode, goTab } = useApp();
  const { known, unknown } = useProgress();
  const srs = useSRSContext();

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
