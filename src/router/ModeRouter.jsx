// ─── router/ModeRouter.jsx ────────────────────────────────────────────────────
// Renders the active mode wrapped in Suspense + ErrorBoundary.
// Reads mode from AppContext, passes correct props to each mode.
// Phase 8: focus management — moves focus to #mode-heading on mount.
// ─────────────────────────────────────────────────────────────────────────────

import { Component, Suspense, useEffect, useRef, useState } from 'react';
import { T } from '../styles/theme.js';
import { CARDS } from '../data/cards.js';
import { getCatsForTrack } from '../data/categories.js';
import { useApp } from '../contexts/AppContext.jsx';
import { useProgress } from '../contexts/ProgressContext.jsx';
import { useSRSContext } from '../contexts/SRSContext.jsx';
import { getMission, completeMission, isMissionDoneToday } from '../utils/daily-mission.js';
import { MODE_COMPONENTS } from './modes.js';
import Skeleton from '../components/Skeleton.jsx';
import MissionCompleteOverlay from '../components/MissionCompleteOverlay.jsx';

// ── Loading fallback — skeleton, not spinner ───────────────────────────────
function ModeLoader() {
  return (
    <div
      style={{ padding: '20px 20px', maxWidth: 480, margin: '0 auto' }}
      role="status"
      aria-label="Memuat mode..."
      aria-live="polite"
    >
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' }}>
        <Skeleton width="80px" height={16} />
        <Skeleton width="60px" height={16} style={{ marginLeft: 'auto' }} />
      </div>
      <Skeleton width="100%" height={4} radius={99} style={{ marginBottom: 24 }} />
      <Skeleton.Card />
    </div>
  );
}

// ── Error boundary ─────────────────────────────────────────────────────────
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div
          role="alert"
          style={{
            minHeight: '60dvh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 32,
            textAlign: 'center',
            gap: 12,
          }}
        >
          <div style={{ fontSize: 40 }} aria-hidden="true">⚠️</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>
            Mode ini mengalami error
          </div>
          <div style={{ fontSize: 12, color: T.textDim, maxWidth: 280 }}>
            {this.state.error?.message ?? 'Terjadi kesalahan yang tidak terduga.'}
          </div>
          <button
            onClick={this.props.onExit}
            aria-label="Kembali ke menu utama"
            style={{
              marginTop: 8,
              fontFamily: 'inherit',
              padding: '10px 24px',
              borderRadius: T.r.md,
              background: T.surface,
              border: `1px solid ${T.border}`,
              color: T.text,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            ← Kembali ke Menu
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── Focus trap helper — moves focus to the skip target on mode entry ────────
function FocusSentinel() {
  const ref = useRef(null);
  useEffect(() => {
    // Small delay: let Suspense resolve before moving focus
    const t = setTimeout(() => {
      if (ref.current) {
        ref.current.focus({ preventScroll: false });
      }
    }, 80);
    return () => clearTimeout(t);
  }, []);

  return (
    // Invisible focus target — picked up by screen readers as region start
    <div
      ref={ref}
      id="mode-heading"
      tabIndex={-1}
      aria-live="polite"
      style={{
        position: 'absolute',
        width: 1,
        height: 1,
        overflow: 'hidden',
        clip: 'rect(0 0 0 0)',
        whiteSpace: 'nowrap',
      }}
    >
      Mode aktif
    </div>
  );
}

// ── ModeRouter ────────────────────────────────────────────────────────────
export default function ModeRouter() {
  const { mode, exitMode, track } = useApp();
  const { known, unknown, starred, quizWrong, toggleStar, handleMark, recordSession } = useProgress();
  const srs = useSRSContext();
  const [showMissionOverlay, setShowMissionOverlay] = useState(false);

  if (!mode) return null;

  const ModeComponent = MODE_COMPONENTS[mode];
  if (!ModeComponent) return null;

  // Phase C: Wrap onFinish to also record session + check mission completion
  const makeFinishHandler = (modeName, extra) => ({ correct = 0, total = 0, maxStreak = 0, maxWrongStreak = 0 } = {}) => {
    recordSession({ mode: modeName, correct, total });

    // C.3: Check if this mode matches the daily mission
    const mission = getMission();
    if (mission && mission.mode === modeName && !isMissionDoneToday()) {
      completeMission();
      setShowMissionOverlay(true);
    }

    extra?.({ correct, total, maxStreak, maxWrongStreak });
  };

  // sessionEnd: lightweight version for modes that manage their own score state.
  // Passed as onSessionEnd prop — modes call it from their existing handleFinish.
  const makeSessionEnd = (modeName) => ({ correct = 0, total = 0 } = {}) => {
    recordSession({ mode: modeName, correct, total });
    const mission = getMission();
    if (mission && mission.mode === modeName && !isMissionDoneToday()) {
      completeMission();
      setShowMissionOverlay(true);
    }
  };

  // Build filtered cards for modes that need them
  const trackCatKeys = track ? new Set(getCatsForTrack(track)) : null;

  const filteredCards = CARDS.filter((c) => {
    if (trackCatKeys && !trackCatKeys.has(c.category)) return false;
    return true;
  });

  // Prop map — each mode gets exactly what it needs
  const modeProps = {
    kartu: {
      cards: filteredCards,
      known,
      unknown,
      onMark: handleMark,
      onExit: exitMode,
      srs,
      starred,
      onToggleStar: toggleStar,
    },
    ulasan: { srs, onExit: exitMode },
    kuis:   {
      cards: filteredCards,
      allCards: CARDS,
      onExit: exitMode,
      onFinish: makeFinishHandler('kuis'),
    },
    sprint:   { cards: filteredCards, onExit: exitMode, onSessionEnd: makeSessionEnd('sprint') },
    fokus:    { known, unknown, quizWrong, onExit: exitMode },
    stats:    { known, unknown, quizWrong, onExit: exitMode },
    jac:      { onExit: exitMode, onSessionEnd: makeSessionEnd('jac') },
    wayground:{ onExit: exitMode, onSessionEnd: makeSessionEnd('wayground') },
    vocab:    { onExit: exitMode, onSessionEnd: makeSessionEnd('vocab') },
    simulasi: { onExit: exitMode, onSessionEnd: makeSessionEnd('simulasi') },
    sipil:    { onExit: exitMode, onSessionEnd: makeSessionEnd('sipil') },
    bangunan: { onExit: exitMode, onSessionEnd: makeSessionEnd('bangunan') },
    glosari:  { onExit: exitMode, track },
  };

  const props = modeProps[mode] ?? { onExit: exitMode };

  return (
    <ErrorBoundary onExit={exitMode}>
      <FocusSentinel />
      <Suspense fallback={<ModeLoader />}>
        <ModeComponent {...props} />
      </Suspense>
      {showMissionOverlay && (
        <MissionCompleteOverlay onDone={() => setShowMissionOverlay(false)} />
      )}
    </ErrorBoundary>
  );
}
