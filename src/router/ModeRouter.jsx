// ─── router/ModeRouter.jsx ────────────────────────────────────────────────────
// Renders the active mode wrapped in Suspense + ErrorBoundary.
// Reads mode from AppContext, passes correct props to each mode.
// Focus management — moves focus to the mode's own <h1> on every mode change.
// ─────────────────────────────────────────────────────────────────────────────

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
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
      <div
        style={{
          display: 'flex',
          gap: 'var(--space-10)',
          marginBottom: 'var(--space-16)',
          alignItems: 'center',
        }}
      >
        <Skeleton width="80px" height={16} />
        <Skeleton width="60px" height={16} style={{ marginLeft: 'auto' }} />
      </div>
      <Skeleton width="100%" height={4} radius={99} style={{ marginBottom: 'var(--space-24)' }} />
      {shape === 'quiz' && (
        <>
          <Skeleton width="90%" height={20} style={{ marginBottom: 'var(--space-20)' }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-10)' }}>
            <Skeleton.QuizOption />
            <Skeleton.QuizOption />
            <Skeleton.QuizOption />
            <Skeleton.QuizOption />
          </div>
        </>
      )}
      {shape === 'list' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>
          <Skeleton.Row />
          <Skeleton.Row />
          <Skeleton.Row />
          <Skeleton.Row />
        </div>
      )}
      {shape === 'stat' && (
        <div
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-12)' }}
        >
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

    // Move focus to the new screen's heading — the standard SPA route-change
    // pattern: a screen reader announces the new context, and a keyboard user's
    // next Tab starts from the top of the new screen rather than wherever the
    // old one left them.
    //
    // This used to select `[data-autofocus], main h1, main button:not([disabled])`
    // and take the first match in DOCUMENT order — which is neither the
    // data-autofocus element (nothing in the app has ever set that attribute)
    // nor the h1. `<main id="main-content">` wraps the whole shell, side nav
    // included, so on desktop the first enabled button in it is SideNav's
    // "Beranda", and entering any mode moved focus to an unrelated nav item; on
    // a phone it landed on the header's own back button, i.e. "leave this mode".
    // Neither was visible until the focus ring was repaired earlier today, at
    // which point it became obvious in a screenshot.
    //
    // It also raced a second mechanism: a FocusSentinel component focused a
    // hidden aria-live div at 80ms and this overwrote it at 100ms. That
    // component is gone; ModeHeader's h1 carries tabIndex={-1} and is the one
    // target.
    const t = setTimeout(() => {
      document.querySelector('[data-autofocus], #mode-heading')?.focus({ preventScroll: true });
    }, 100);
    return () => clearTimeout(t);
  }, [mode]);

  // Build filtered cards for modes that need them. Memoised on `track` alone —
  // it walks all 1438 cards, and this component re-renders on every progress
  // change (it consumes known/unknown/starred), so without this it re-filtered
  // the whole corpus on every card mark and handed a fresh array identity to
  // half the modes each time.
  const filteredCards = useMemo(() => {
    const trackCatKeys = track ? new Set(getCatsForTrack(track)) : null;
    if (!trackCatKeys) return CARDS;
    return CARDS.filter((c) => trackCatKeys.has(c.category));
  }, [track]);

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

  // Item 76: who gets the audio setting, and why. The distribution had no rule,
  // so it had drifted -- `wayground` renders QuizShell's speaker button and was
  // never handed the pref that shows it, while `dengar`, built entirely on
  // audio, was equally absent for the opposite reason.
  //
  // The rule: `audioEnabled` is a global mute for audio the app *offers*. A mode
  // receives it when it can speak Japanese that it is also showing as text --
  // there the sound is an aid, and muting it costs only convenience. Two
  // exceptions, both deliberate:
  //
  //   `dengar`   -- its task *is* listening. Obeying the mute would leave the
  //                 mode with nothing to do, so it is exempt and the setting in
  //                 Saya says so rather than quietly lying.
  //   `simulasi` -- an exam does not offer aids (item 48's reasoning, unchanged).
  //
  // Every other absence follows from the rule itself: `sprint`, `angka`,
  // `jebak` and `mirip` never call speakJP, so there is nothing to mute.
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
      // Why a filtered deck is filtered. Defaults to 'wrong' so the eight
      // onRetryWrong call sites below are unchanged and cannot regress; the
      // banner used to be gated on filterIds alone, which painted "❌ Latihan
      // kartu salah" over any filtered deck -- including SumberMode's "browse
      // this PDF's cards", where nothing is wrong at all.
      filterReason: modeParams?.filterReason ?? 'wrong',
      // Item 75. The one study mode that recorded nothing. FlashcardMode fires
      // this on unmount when at least one card was rated -- a flashcard sitting
      // has no natural length, so leaving is the end of it.
      onSessionEnd: makeSessionEnd('kartu'),
      // Item 76: it shows Japanese and asks you to recall its meaning, and had
      // no way to hear it. Manual button only -- see FlipCard.
      audioEnabled,
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
      // Item 79: it recorded every "Tidak Tahu" into progress.quizWrong by card
      // id and then offered no route back to those cards.
      onRetryWrong: (ids) => goMode('kartu', { filterIds: ids }),
      filterIds: modeParams?.filterIds ?? null,
    },
    fokus: { known, quizWrong, onExit: exitMode, onSessionEnd: makeSessionEnd('fokus') },
    stats: { known, unknown, quizWrong, srs, streakData, sessions },
    // Item 79: every ANGKA_KUNCI entry carries an explicit `kartu` id, so this
    // bridge is exact rather than inferred from matching Japanese strings.
    angka: {
      onSessionEnd: makeSessionEnd('angka'),
      onRetryWrong: (ids) => goMode('kartu', { filterIds: ids }),
    },
    jebak: { onSessionEnd: makeSessionEnd('jebak') },
    cari: { track, starred, toggleStar },
    // jac keeps onRetryWrong and now actually reaches it: every JAC_OFFICIAL
    // question has a related_card_id, which JACMode passes through as _cardId.
    jac: {
      onSessionEnd: makeSessionEnd('jac'),
      onRetryWrong: (ids) => goMode('kartu', { filterIds: ids }),
      audioEnabled,
    },
    // wayground and vocab had no onRetryWrong until item 96 (2026-09-07),
    // because their questions come from QUIZ_SETS and not one of the 980
    // carried a related card id -- QuizShell could never assemble a deck to
    // send anywhere. 305 do now. Two other halves of the same feature were also
    // missing and are fixed with it: WaygroundMode never forwarded the prop to
    // QuizShell at all, and VocabMode forwarded one that could not fire. All
    // three read as a working feature from the prop map alone, which is why it
    // sat unnoticed.
    wayground: {
      onSessionEnd: makeSessionEnd('wayground'),
      onRetryWrong: (ids) => goMode('kartu', { filterIds: ids }),
      // Item 76: it renders QuizShell, which draws a speaker button behind this
      // prop -- so the button had simply never appeared in the largest question
      // bank in the app, on Japanese it shows as text like every other quiz.
      audioEnabled,
    },
    vocab: {
      onSessionEnd: makeSessionEnd('vocab'),
      onRetryWrong: (ids) => goMode('kartu', { filterIds: ids }),
      audioEnabled,
    },
    simulasi: {
      onExit: exitMode,
      onSessionEnd: makeSessionEnd('simulasi'),
      onRetryWrong: (ids) => goMode('kartu', { filterIds: ids }),
    },
    glosari: { track },
    mirip: { onSessionEnd: makeSessionEnd('mirip') },
    dengar: {
      cards: filteredCards,
      allCards: CARDS,
      onExit: exitMode,
      onSessionEnd: makeSessionEnd('dengar'),
      onRetryWrong: (ids) => goMode('kartu', { filterIds: ids }),
    },
    catatan: { cards: filteredCards },
    sumber: { onNavigate: goMode },
    tentang: { onNavigate: goMode, section: modeParams?.section ?? null },
  };

  // ModeHeader owns the back control for every mode now (2026-09-04), so most
  // modes no longer take onExit at all. The ones still listed below use it for
  // something a header arrow can't be: a results screen's primary "done"
  // button, or an exit that has to run a confirmation first.
  const props = modeProps[mode] ?? {};

  return (
    <ErrorBoundary
      title="Mode ini mengalami error"
      desc="Muat ulang biasanya memperbaikinya. Jawaban yang belum selesai di sesi ini mungkin tidak tersimpan."
      secondaryLabel="← Kembali ke Menu"
      onSecondary={exitMode}
    >
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
