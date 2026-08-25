// ─── router/ModeRouter.jsx ────────────────────────────────────────────────────
// Renders the active mode wrapped in Suspense + ErrorBoundary.
// Reads mode from AppContext, passes correct props to each mode.
// Focus management — moves focus to #mode-heading on mount.
// ─────────────────────────────────────────────────────────────────────────────

import { Suspense, useEffect, useRef, useState } from 'react';
import { CARDS } from '../data/cards.js';
import { getCatsForTrack } from '../data/categories.js';
import { useApp } from '../contexts/AppContext.jsx';
import { useProgress } from '../contexts/ProgressContext.jsx';
import { useSRSContext } from '../contexts/SRSContext.jsx';
import { getMission, completeMission, isMissionDoneToday } from '../utils/daily-mission.js';
import { get as storageGet } from '../storage/engine.js';
import { MODE_COMPONENTS, MODE_META } from './modes.js';
import Skeleton from '../components/Skeleton.jsx';
import ModeHeader from '../components/ModeHeader.jsx';
import ErrorBoundary from '../components/ErrorBoundary.jsx';
import MissionCompleteOverlay from '../components/MissionCompleteOverlay.jsx';

// ── Loading fallback — skeleton, not spinner ───────────────────────────────
// Shape follows MODE_META[mode].skeleton (item 17) so a quiz-shaped
// destination doesn't flash a flashcard-shaped loader before swapping to its
// real, differently-proportioned content. One aria-label on the wrapper is
// the single loading announcement for the whole fallback — the individual
// shimmer blocks are aria-hidden, not separately labelled.
export function ModeLoader({ shape = 'card' }) {
  return (
    <div role="status" aria-label="Memuat mode..." aria-live="polite">
      <div style={{ display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center' }}>
        <Skeleton width="80px" height={16} />
        <Skeleton width="60px" height={16} style={{ marginLeft: 'auto' }} />
      </div>
      <Skeleton width="100%" height={4} radius={99} style={{ marginBottom: 24 }} />
      {shape === 'quiz' && (
        <>
          <Skeleton width="90%" height={20} style={{ marginBottom: 20 }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Skeleton.QuizOption />
            <Skeleton.QuizOption />
            <Skeleton.QuizOption />
            <Skeleton.QuizOption />
          </div>
        </>
      )}
      {shape === 'list' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Skeleton.Row />
          <Skeleton.Row />
          <Skeleton.Row />
          <Skeleton.Row />
        </div>
      )}
      {shape === 'stat' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          <Skeleton.Stat />
          <Skeleton.Stat />
          <Skeleton.Stat />
          <Skeleton.Stat />
          <Skeleton.Stat />
          <Skeleton.Stat />
        </div>
      )}
      {shape === 'card' && <Skeleton.Card />}
    </div>
  );
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
    resetKnownUnknown,
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
      onResetProgress: resetKnownUnknown,
      onExit: exitMode,
      srs,
      starred,
      onToggleStar: toggleStar,
      filterIds: modeParams?.filterIds ?? null,
    },
    ulasan: {
      srs,
      onExit: exitMode,
      onSessionEnd: makeSessionEnd('ulasan'),
      onGoKartu: () => goMode('kartu'),
    },
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

  return (
    <ErrorBoundary
      title="Mode ini mengalami error"
      desc="Muat ulang biasanya memperbaikinya. Jawaban yang belum selesai di sesi ini mungkin tidak tersimpan."
      secondaryLabel="← Kembali ke Menu"
      onSecondary={exitMode}
    >
      <FocusSentinel />
      <ModeHeader mode={mode} modeHistory={modeHistory} onBack={goBack} />
      <Suspense fallback={<ModeLoader shape={MODE_META[mode]?.skeleton ?? 'card'} />}>
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
