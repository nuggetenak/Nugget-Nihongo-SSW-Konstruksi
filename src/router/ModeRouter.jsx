// ─── router/ModeRouter.jsx ────────────────────────────────────────────────────
// Renders the active mode wrapped in Suspense + ErrorBoundary.
// Reads mode from AppContext, passes correct props to each mode.
// Focus management — moves focus to #mode-heading on mount.
// ─────────────────────────────────────────────────────────────────────────────

import { Component, Suspense, useEffect, useRef, useState } from 'react';
import { T } from '../styles/theme.js';
import { CARDS } from '../data/cards.js';
import { getCatsForTrack } from '../data/categories.js';
import { useApp } from '../contexts/AppContext.jsx';
import { useProgress } from '../contexts/ProgressContext.jsx';
import { useSRSContext } from '../contexts/SRSContext.jsx';
import { getMission, completeMission, isMissionDoneToday } from '../utils/daily-mission.js';
import { get as storageGet } from '../storage/engine.js';
import { MODE_COMPONENTS, MODE_META } from './modes.js';
import Skeleton from '../components/Skeleton.jsx';
import MissionCompleteOverlay from '../components/MissionCompleteOverlay.jsx';

// ── Loading fallback — skeleton, not spinner ───────────────────────────────
function ModeLoader() {
  return (
    <div
      style={{ padding: 'var(--sp-5)', maxWidth: 'var(--max-w)', margin: '0 auto' }}
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
          <div style={{ fontSize: 40 }} aria-hidden="true">
            ⚠️
          </div>
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
  const { mode, modeParams, exitMode, goMode, track, modeHistory, goBack } = useApp();
  const {
    known,
    unknown,
    starred,
    quizWrong,
    toggleStar,
    handleMark,
    recordSession,
    streakData,
    sessions,
  } = useProgress();
  const srs = useSRSContext();
  const [showMissionOverlay, setShowMissionOverlay] = useState(false);
  const [missionResult, setMissionResult] = useState(null);

  // Focus management + scroll restoration on mode change.
  const prevMode = useRef(null);
  const scrollCache = useRef(new Map());

  useEffect(() => {
    if (prevMode.current === mode) return;

    // Save scroll position of the mode we're leaving
    if (prevMode.current !== null) {
      scrollCache.current.set(prevMode.current, window.scrollY);
    }
    prevMode.current = mode;

    // Restore scroll for the mode we're entering (default 0)
    const saved = scrollCache.current.get(mode) ?? 0;
    window.scrollTo(0, saved);

    // Focus first interactive element after render
    const t = setTimeout(() => {
      const target = document.querySelector(
        '[data-autofocus], main h1, main button:not([disabled])'
      );
      target?.focus({ preventScroll: true });
    }, 100);
    return () => clearTimeout(t);
  }, [mode]);

  if (!mode) return null;

  const ModeComponent = MODE_COMPONENTS[mode];
  if (!ModeComponent) return null;

  // Wrap onFinish to also record session + check mission completion.
  const makeFinishHandler =
    (modeName, extra) =>
    ({ correct = 0, total = 0, durationMs = 0, maxStreak = 0, maxWrongStreak = 0 } = {}) => {
      recordSession({ mode: modeName, correct, total, durationMs });

      // C.3: Check if this mode matches the daily mission
      const mission = getMission();
      if (mission && mission.mode === modeName && !isMissionDoneToday()) {
        completeMission();
        setMissionResult({ label: mission.label, icon: mission.icon, correct, total });
        setShowMissionOverlay(true);
      }

      extra?.({ correct, total, maxStreak, maxWrongStreak });
    };

  // sessionEnd: lightweight version for modes that manage their own score state.
  // Passed as onSessionEnd prop — modes call it from their existing handleFinish.
  const makeSessionEnd =
    (modeName) =>
    ({ correct = 0, total = 0, durationMs = 0 } = {}) => {
      recordSession({ mode: modeName, correct, total, durationMs });
      const mission = getMission();
      if (mission && mission.mode === modeName && !isMissionDoneToday()) {
        completeMission();
        setMissionResult({ label: mission.label, icon: mission.icon, correct, total });
        setShowMissionOverlay(true);
      }
    };

  // Build filtered cards for modes that need them
  const trackCatKeys = track ? new Set(getCatsForTrack(track)) : null;

  const filteredCards = CARDS.filter((c) => {
    if (trackCatKeys && !trackCatKeys.has(c.category)) return false;
    return true;
  });

  const audioEnabled = storageGet('prefs')?.audioEnabled !== false;

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
      filterIds: modeParams?.filterIds ?? null,
    },
    ulasan: { srs, onExit: exitMode, onSessionEnd: makeSessionEnd('ulasan') },
    kuis: {
      cards: filteredCards,
      allCards: CARDS,
      onExit: exitMode,
      onFinish: makeFinishHandler('kuis'),
      onRetryWrong: (ids) => goMode('kartu', { filterIds: ids }),
      audioEnabled,
      filterIds: modeParams?.filterIds ?? null,
    },
    sprint: {
      cards: filteredCards,
      onExit: exitMode,
      onSessionEnd: makeSessionEnd('sprint'),
      filterIds: modeParams?.filterIds ?? null,
    },
    fokus: { known, quizWrong, onExit: exitMode, onSessionEnd: makeSessionEnd('fokus') },
    stats: { known, unknown, quizWrong, srs, streakData, sessions, onExit: exitMode },
    angka: { onExit: exitMode, onSessionEnd: makeSessionEnd('angka') },
    jebak: { onExit: exitMode, onSessionEnd: makeSessionEnd('jebak') },
    cari: { onExit: exitMode, track, starred, toggleStar },
    jac: {
      onExit: exitMode,
      onSessionEnd: makeSessionEnd('jac'),
      onRetryWrong: (ids) => goMode('kartu', { filterIds: ids }),
      audioEnabled,
    },
    wayground: {
      onExit: exitMode,
      onSessionEnd: makeSessionEnd('wayground'),
      onRetryWrong: (ids) => goMode('kartu', { filterIds: ids }),
    },
    vocab: { onExit: exitMode, onSessionEnd: makeSessionEnd('vocab'), audioEnabled },
    simulasi: {
      onExit: exitMode,
      onSessionEnd: makeSessionEnd('simulasi'),
      onRetryWrong: (ids) => goMode('kartu', { filterIds: ids }),
    },
    glosari: { onExit: exitMode, track },
    produksi: {
      cards: filteredCards,
      onExit: exitMode,
      onSessionEnd: makeSessionEnd('produksi'),
      audioEnabled,
    },
    mirip: { onExit: exitMode, onSessionEnd: makeSessionEnd('mirip') },
    dengar: {
      cards: filteredCards,
      allCards: CARDS,
      onExit: exitMode,
      onSessionEnd: makeSessionEnd('dengar'),
    },
    catatan: { cards: filteredCards, onExit: exitMode },
    kuisprod: {
      cards: filteredCards,
      onExit: exitMode,
      onSessionEnd: makeSessionEnd('kuisprod'),
      audioEnabled,
    },
    sumber: { onExit: exitMode, onNavigate: goMode },
  };

  const props = modeProps[mode] ?? { onExit: exitMode };

  // Breadcrumb — show "← Kembali ke [Mode]" if there's navigation history.
  const breadcrumbMode = modeHistory.length > 0 ? modeHistory[modeHistory.length - 1] : null;
  const breadcrumbMeta = breadcrumbMode ? MODE_META[breadcrumbMode] : null;

  return (
    <ErrorBoundary onExit={exitMode}>
      <FocusSentinel />
      {breadcrumbMeta && (
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 'var(--z-banner, 30)',
            background: 'var(--ssw-navBg)',
            borderBottom: '1px solid var(--ssw-border)',
            padding: '6px 16px',
          }}
        >
          <button
            onClick={goBack}
            aria-label={`Kembali ke ${breadcrumbMeta.label}`}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: 12,
              fontWeight: 600,
              color: 'var(--ssw-amber)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '4px 0',
            }}
          >
            ← {breadcrumbMeta.icon} {breadcrumbMeta.label}
          </button>
        </div>
      )}
      <Suspense fallback={<ModeLoader />}>
        <ModeComponent {...props} />
      </Suspense>
      {showMissionOverlay && (
        <MissionCompleteOverlay
          result={missionResult}
          onDone={() => {
            setShowMissionOverlay(false);
            setMissionResult(null);
          }}
        />
      )}
    </ErrorBoundary>
  );
}
