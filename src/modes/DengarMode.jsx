// ─── DengarMode.jsx ───────────────────────────────────────────────────────────
// Audio-first listening comprehension mode.
// Shows 🔊 button → user hears Japanese → picks Indonesian translation.
// Trains ear-to-meaning pathway (no visual kanji crutch).
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useCallback, useEffect, useRef } from 'react';
import { shuffle } from '../utils/shuffle.js';
import { speakJP, canSpeak, LISTENING_SPEEDS, LISTENING_SPEED_DEFAULT } from '../utils/speak.js';
import { pillStyle } from '../styles/pill.js';
import { haptic } from '../utils/haptic.js';
import { stripFuri } from '../utils/jp-helpers.js';
import { JpFront } from '../components/JpDisplay.jsx';
import QuizAnnouncer from '../components/QuizAnnouncer.jsx';
import { useProgress } from '../contexts/ProgressContext.jsx';
import { getWrongCount } from '../utils/wrong-tracker.js';
import { useSessionTimer } from '../hooks/useSessionTimer.js';
import { useQuizKeyboard } from '../hooks/useQuizKeyboard.js';
import { useApp } from '../contexts/AppContext.jsx';
import { useOnlineStatus } from '../hooks/useOnlineStatus.js';
import ProgressBar from '../components/ProgressBar.jsx';
import ResultScreen from '../components/ResultScreen.jsx';
import { QUIZ_COUNTS, QUIZ_COUNT_ALL, resolveQuizCount } from '../utils/constants.js';
import S from './modes.module.css';

function buildQuestions(cards, count, allCards) {
  const pool = shuffle(cards).slice(0, count);
  return pool.map((card) => {
    // Build 4 distractors from allCards
    const others = shuffle(allCards.filter((c) => c.id !== card.id)).slice(0, 3);
    const opts = shuffle([
      { text: card.id_text || card.jp, isCorrect: true },
      ...others.map((c) => ({ text: c.id_text || c.jp, isCorrect: false })),
    ]);
    return { card, opts, correctIdx: opts.findIndex((o) => o.isCorrect) };
  });
}

export default function DengarMode({ cards, allCards, onExit, onSessionEnd, onRetryWrong }) {
  const { toast, prefs, setPref } = useApp();
  const { quizWrong, recordWrong } = useProgress();
  const furiganaPolicy = prefs?.furiganaPolicy ?? 'always';
  const [started, setStarted] = useState(false);
  // Item 80: 0 is the "Semua" sentinel now, shared with every other mode that
  // offers a length -- resolved against this deck rather than stored as its size.
  const [countPref, setCountPref] = useState(() => prefs?.quizQuestionCount ?? 10);
  // Item 79: Dengar records every wrong answer into the shared quizWrong store
  // by real card id (see handleSelect below) — the same store Kuis's "Mode
  // Lemah" reads — and then offered no way to drill only those. The filter was
  // one of the three the item found missing where the data was already there.
  const [lemahMode, setLemahMode] = useState(false);
  // Item 107: one speed trained word recognition; real instructions arrive fast
  // and clipped. Persisted, because a learner's comfortable pace is a property
  // of the learner and not of one session.
  const [speed, setSpeed] = useState(() => prefs?.listeningSpeed ?? LISTENING_SPEED_DEFAULT);
  const lemahCards = cards.filter((c) => getWrongCount(quizWrong[c.id]) > 0);
  const deck = lemahMode ? lemahCards : cards;
  const count = resolveQuizCount(countPref, deck.length);
  const [questions, setQuestions] = useState([]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null); // null | index
  const [results, setResults] = useState([]);
  const [sessionFired, setSessionFired] = useState(false);
  const speakCountRef = useRef(0);
  const advanceTimerRef = useRef(null);
  const { getDurationMs } = useSessionTimer();
  const online = useOnlineStatus();

  const hasAudio = canSpeak();

  // item 25: a synthesis failure (e.g. no offline-capable ja-JP voice) used
  // to fail silently -- the card just never made a sound, with nothing to
  // tell a listening-comprehension-mode user whether that was expected or
  // broken. One toast, not one per failed attempt in a row.
  const warnedRef = useRef(false);
  const handleSpeakError = useCallback(() => {
    if (warnedRef.current) return;
    warnedRef.current = true;
    toast.show(
      online
        ? '🔇 Audio gagal diputar. Coba lagi atau lanjutkan tanpa suara.'
        : '📶 Audio tidak tersedia offline di perangkat ini.',
      { type: 'error', duration: 5000 }
    );
  }, [toast, online]);

  const start = () => {
    // Distractors still come from the whole deck: a wrong-only run should be
    // narrower, not easier.
    const qs = buildQuestions(deck, count, allCards || cards);
    setQuestions(qs);
    setIdx(0);
    setSelected(null);
    setResults([]);
    setSessionFired(false);
    speakCountRef.current = 0;
    warnedRef.current = false;
    setStarted(true);
  };

  const currentQ = questions[idx];

  // Auto-speak when card loads
  useEffect(() => {
    if (!started || !currentQ || selected !== null) return;
    speakCountRef.current = 0;
    if (!hasAudio) return;
    // Cleared on unmount (item 119/F8). ModeRouter cancels speech when the mode
    // changes, but this fires ~300ms after that cancel, so leaving mid-question
    // made the phone read Japanese over the Beranda screen.
    const t = setTimeout(
      () => speakJP(stripFuri(currentQ.card.jp), { speed, onError: handleSpeakError }),
      300
    );
    return () => clearTimeout(t);
  }, [idx, started]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => () => clearTimeout(advanceTimerRef.current), []);

  const handleSpeak = () => {
    if (!currentQ) return;
    speakCountRef.current += 1;
    speakJP(stripFuri(currentQ.card.jp), { speed, onError: handleSpeakError });
    haptic.tap();
  };

  // Item 119/F2. `results` used to be read straight out of this closure, and
  // handleSelect schedules `setTimeout(advance, 1500)` with the `advance` from
  // the render *before* setResults commits -- so on the last question the
  // session was recorded one answer short. A 10-question run answered 9/10
  // stored {correct: 9, total: 9} = 100%, while the results screen correctly
  // showed 90%; every consumer of progress.sessions (Stats accuracy, the
  // heatmap, the readiness score, the mission overlay) got the wrong number.
  // Worse, pressing Enter instead of waiting for the auto-advance took the
  // current render's closure and stored the right one, so the same session
  // recorded differently depending on whether the learner waited.
  //
  // A ref, because the timeout cannot be given a fresher closure after the fact.
  const resultsRef = useRef([]);
  useEffect(() => {
    resultsRef.current = results;
  }, [results]);

  const advance = useCallback(() => {
    clearTimeout(advanceTimerRef.current);
    if (idx + 1 < questions.length) {
      setIdx((i) => i + 1);
      setSelected(null);
    } else {
      if (!sessionFired && onSessionEnd) {
        const done = resultsRef.current;
        onSessionEnd({
          mode: 'dengar',
          correct: done.filter((r) => r.isCorrect).length,
          total: done.length,
          durationMs: getDurationMs(),
        });
        setSessionFired(true);
      }
      setIdx(questions.length); // trigger done state
    }
  }, [idx, questions.length, sessionFired, onSessionEnd, getDurationMs]);

  const handleSelect = useCallback(
    (optIdx) => {
      if (selected !== null) return;
      setSelected(optIdx);
      const isCorrect = optIdx === currentQ.correctIdx;
      haptic[isCorrect ? 'correct' : 'wrong']();
      setResults((r) => [
        ...r,
        {
          card: currentQ.card,
          isCorrect,
          pickedText: currentQ.opts[optIdx]?.text || '',
          correctText: currentQ.opts[currentQ.correctIdx]?.text || '',
        },
      ]);
      // Record wrong answer in shared wrong-tracker pool.
      if (!isCorrect) {
        const cardId = currentQ.card.id;
        if (cardId) recordWrong(cardId);
      }

      advanceTimerRef.current = setTimeout(advance, 1500);
    },
    [selected, currentQ, recordWrong, advance]
  );

  useQuizKeyboard({
    onSelect: handleSelect,
    onNext: advance,
    selected,
    phase: started && currentQ ? 'playing' : 'not-playing',
    optCount: currentQ?.opts?.length ?? 4,
  });

  // ── Settings screen ──────────────────────────────────────────────────────
  if (!started) {
    return (
      <div className={`${S.page} ${S.setupPage}`}>
        <div style={{ marginBottom: 'var(--space-24)' }}>
          <p className={S.pageSub} style={{ marginBottom: 0 }}>
            Dengar 🔊 bahasa Jepang → pilih terjemahan Indonesia
          </p>
          {!hasAudio && (
            <div
              style={{
                marginTop: 'var(--space-12)',
                padding: 'var(--space-10) var(--space-14)',
                background: 'var(--ssw-wrongBg)',
                border: '1px solid var(--ssw-wrongBorder)',
                borderRadius: 10,
                fontSize: 'var(--fs-body)',
                color: 'var(--ssw-wrong)',
              }}
            >
              ⚠️ Browser ini tidak mendukung Web Speech API. Mode Dengarkan membutuhkan audio.
            </div>
          )}
          {hasAudio && !online && (
            <div
              style={{
                marginTop: 'var(--space-12)',
                padding: 'var(--space-10) var(--space-14)',
                background: 'var(--ssw-surface)',
                border: '1px solid var(--ssw-border)',
                borderRadius: 10,
                fontSize: 'var(--fs-body)',
                color: 'var(--ssw-textMuted)',
              }}
            >
              📶 Kamu sedang offline. Audio biasanya tetap jalan jika perangkatmu punya suara Jepang
              offline — kalau tidak terdengar, itu sebabnya.
            </div>
          )}
        </div>

        <div style={{ marginBottom: 'var(--space-20)' }}>
          <div
            style={{
              fontSize: 'var(--fs-caption)',
              fontWeight: 600,
              color: 'var(--ssw-textMuted)',
              marginBottom: 'var(--space-8)',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            Jumlah Soal
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-8)' }}>
            {[...QUIZ_COUNTS.filter((n) => n < deck.length), QUIZ_COUNT_ALL].map((n) => (
              <button
                key={n}
                onClick={() => {
                  setCountPref(n);
                  setPref('quizQuestionCount', n);
                }}
                style={{
                  flex: 1,
                  padding: 'var(--space-10) 0',
                  borderRadius: 10,
                  fontFamily: 'inherit',
                  fontSize: 'var(--fs-subtitle)',
                  fontWeight: countPref === n ? 700 : 400,
                  cursor: 'pointer',
                  border: `2px solid ${countPref === n ? 'var(--ssw-amber)' : 'var(--ssw-border)'}`,
                  background: countPref === n ? 'rgba(245,158,11,0.12)' : 'var(--ssw-surface)',
                  color: countPref === n ? 'var(--ssw-amber)' : 'var(--ssw-textMuted)',
                  transition: 'all 0.15s',
                }}
              >
                {n === QUIZ_COUNT_ALL ? 'Semua' : n}
              </button>
            ))}
          </div>
        </div>

        <div
          style={{
            padding: 'var(--space-14) var(--space-16)',
            background: 'var(--ssw-surface)',
            borderRadius: 12,
            marginBottom: 'var(--space-24)',
            fontSize: 'var(--fs-body)',
            color: 'var(--ssw-textMuted)',
            lineHeight: 1.6,
          }}
        >
          <strong style={{ color: 'var(--ssw-textBright)' }}>Cara main:</strong> Tekan 🔊 untuk
          mendengar kata Jepang. Pilih terjemahan yang benar. Kartu bergerak otomatis setelah {1.5}{' '}
          detik.
        </div>

        {/* Item 107: graded listening. Each level is a band of three rates
            rather than one, so the HVPT variation the audio wrapper exists for
            survives the grading — see LISTENING_SPEEDS. */}
        <div style={{ marginBottom: 'var(--space-20)' }}>
          <div
            style={{
              fontSize: 'var(--fs-caption)',
              color: 'var(--ssw-textMuted)',
              marginBottom: 'var(--space-8)',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            Kecepatan Bicara
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-6)', flexWrap: 'wrap' }}>
            {Object.entries(LISTENING_SPEEDS).map(([key, meta]) => (
              <button
                key={key}
                onClick={() => {
                  setSpeed(key);
                  setPref('listeningSpeed', key);
                }}
                aria-pressed={speed === key}
                style={pillStyle(speed === key)}
              >
                {meta.label}
              </button>
            ))}
          </div>
          <div
            style={{
              fontSize: 'var(--fs-small)',
              color: 'var(--ssw-textDim)',
              marginTop: 'var(--space-6)',
            }}
          >
            {LISTENING_SPEEDS[speed]?.sub ?? ''}
          </div>
        </div>

        {lemahCards.length > 0 && (
          <div className={S.rowSpread} style={{ marginBottom: 'var(--space-20)' }}>
            <div>
              <div
                style={{ fontSize: 'var(--fs-body)', fontWeight: 600, color: 'var(--ssw-text)' }}
              >
                Mode Lemah
              </div>
              <div style={{ fontSize: 'var(--fs-small)', color: 'var(--ssw-textDim)' }}>
                Fokus ke {lemahCards.length} kartu yang sering salah
              </div>
            </div>
            <button
              onClick={() => setLemahMode((l) => !l)}
              aria-pressed={lemahMode}
              style={{
                fontFamily: 'inherit',
                padding: 'var(--space-6) var(--space-14)',
                borderRadius: 999,
                border: `1px solid ${lemahMode ? 'var(--ssw-wrongBorder)' : 'var(--ssw-border)'}`,
                background: lemahMode ? 'var(--ssw-wrongBg)' : 'var(--ssw-surface)',
                color: lemahMode ? 'var(--ssw-wrong)' : 'var(--ssw-textMuted)',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: 'var(--fs-caption)',
              }}
            >
              {lemahMode ? '⚠ ON' : 'OFF'}
            </button>
          </div>
        )}

        <div className={S.setupCta}>
          <button
            onClick={start}
            disabled={!hasAudio}
            style={{
              width: '100%',
              padding: 'var(--space-14)',
              borderRadius: 12,
              background: hasAudio ? 'var(--ssw-amber)' : 'var(--ssw-surface)',
              color: hasAudio ? '#fff' : 'var(--ssw-textFaint)',
              fontFamily: 'inherit',
              fontSize: '1rem',
              fontWeight: 700,
              border: 'none',
              cursor: hasAudio ? 'pointer' : 'not-allowed',
            }}
          >
            Mulai Latihan
          </button>
        </div>
      </div>
    );
  }

  // ── Done screen ───────────────────────────────────────────────────────────
  if (idx >= questions.length && results.length > 0) {
    const correct = results.filter((r) => r.isCorrect).length;
    const wrongList = results.filter((r) => !r.isCorrect);
    const wrongCardIds = wrongList.map((r) => r.card.id).filter(Boolean);

    return (
      <ResultScreen
        correct={correct}
        total={results.length}
        review={wrongList.map((r) => ({
          question: r.card.jp,
          userAnswer: r.pickedText,
          correctAnswer: r.correctText,
          category: r.card.category,
          _cardId: r.card.id,
        }))}
        onRestart={start}
        onRetryWrong={onRetryWrong ? () => onRetryWrong(wrongCardIds) : undefined}
        onDrillCategory={
          onRetryWrong
            ? (catKey) =>
                onRetryWrong(
                  wrongList.filter((r) => r.card.category === catKey).map((r) => r.card.id)
                )
            : undefined
        }
        onExit={onExit}
      />
    );
  }

  if (!currentQ) return null;

  // ── Quiz screen ───────────────────────────────────────────────────────────
  const isAnswered = selected !== null;

  return (
    <div className={S.page}>
      <QuizAnnouncer
        isCorrect={selected !== null ? selected === currentQ.correctIdx : null}
        correctText={currentQ.opts[currentQ.correctIdx]?.text}
      />
      {/* Item 119/F6: this passed value/max, and ProgressBar takes
          current/total — so the bar sat at 0% for the whole quiz and announced
          "0% selesai" on the last question. Every other caller in the app uses
          current/total, which is why the shared component never grew a
          tolerance for the other spelling. */}
      <ProgressBar current={idx} total={questions.length} />

      <div
        style={{
          textAlign: 'center',
          padding: 'var(--space-32) var(--space-16) var(--space-24)',
          background: 'var(--ssw-surface)',
          borderRadius: 16,
          marginBottom: 'var(--space-20)',
        }}
      >
        <div
          style={{
            fontSize: 'var(--fs-body)',
            color: 'var(--ssw-textMuted)',
            marginBottom: 'var(--space-12)',
          }}
        >
          {idx + 1} / {questions.length}
        </div>

        {/* Big speak button */}
        <button
          onClick={handleSpeak}
          disabled={isAnswered}
          aria-label="Putar audio"
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: isAnswered ? 'var(--ssw-surface)' : 'var(--ssw-amber)',
            border: 'none',
            cursor: isAnswered ? 'default' : 'pointer',
            fontSize: 'var(--fs-hero)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: isAnswered ? 'none' : '0 4px 16px rgba(245,158,11,0.35)',
            transition: 'all 0.2s',
          }}
        >
          🔊
        </button>

        <div
          style={{
            marginTop: 'var(--space-16)',
            fontSize: 'var(--fs-body)',
            color: 'var(--ssw-textMuted)',
            opacity: isAnswered ? 0 : 1,
            transition: 'opacity 0.2s',
          }}
        >
          Tekan untuk mendengar kata Jepang
        </div>

        {/* Reveal after answer */}
        {isAnswered && (
          <div style={{ marginTop: 'var(--space-12)' }}>
            <JpFront jp={currentQ.card.jp} furiganaPolicy={furiganaPolicy} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-10)' }}>
        {currentQ.opts.map((opt, i) => {
          let bg = 'var(--ssw-surface)';
          let border = 'var(--ssw-border)';
          let color = 'var(--ssw-text)';
          let anim = 'none';
          if (isAnswered) {
            if (opt.isCorrect) {
              bg = 'var(--ssw-correctBg)';
              border = 'var(--ssw-correctBorder)';
              color = 'var(--ssw-correct)';
              anim = 'correctFlash 0.5s ease';
            } else if (i === selected && !opt.isCorrect) {
              bg = 'var(--ssw-wrongBg)';
              border = 'var(--ssw-wrongBorder)';
              color = 'var(--ssw-wrong)';
              anim = 'wrongShake 0.45s ease';
            }
          }
          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={isAnswered}
              style={{
                width: '100%',
                padding: 'var(--space-14) var(--space-16)',
                textAlign: 'left',
                borderRadius: 12,
                background: bg,
                border: `2px solid ${border}`,
                color,
                fontFamily: 'inherit',
                fontSize: 'var(--fs-subtitle)',
                cursor: isAnswered ? 'default' : 'pointer',
                transition: 'all 0.15s',
                fontWeight: 500,
                animation: anim,
              }}
            >
              {opt.text}
            </button>
          );
        })}
      </div>
    </div>
  );
}
