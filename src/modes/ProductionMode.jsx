// ─── ProductionMode.jsx ───────────────────────────────────────────────────────
// Active production practice: shown Indonesian → user types Japanese (kanji/kana).
// Implements Output Hypothesis (Swain 1985) — active recall bridges recognition→production gap.
// Accepts: exact jp match, stripped-furi match, or accepted romaji equivalent.
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useRef, useCallback, useEffect } from 'react';
import { T } from '../styles/theme.js';
import { useProgress } from '../contexts/ProgressContext.jsx';
import { useApp } from '../contexts/AppContext.jsx';
import { useSpeakErrorHandler } from '../hooks/useSpeakErrorHandler.js';
import { shuffle } from '../utils/shuffle.js';
import { stripFuri, extractReadings } from '../utils/jp-helpers.js';
import { JpFront, DescBlock } from '../components/JpDisplay.jsx';
import TypoDiff from '../components/TypoDiff.jsx';
import { diffChars } from '../utils/typo-diff.js';
import QuizAnnouncer from '../components/QuizAnnouncer.jsx';
import { speakJP, canSpeak } from '../utils/speak.js';
import { haptic } from '../utils/haptic.js';
import { useSessionTimer } from '../hooks/useSessionTimer.js';
import ProgressBar from '../components/ProgressBar.jsx';
import ResultScreen from '../components/ResultScreen.jsx';
import HowToPlayCard from '../components/HowToPlayCard.jsx';
import { QUIZ_COUNTS } from '../utils/constants.js';
import S from './modes.module.css';

// Normalize: strip furi, trim, lowercase for loose comparison
function norm(s = '') {
  return stripFuri(String(s)).trim().toLowerCase();
}

// Accept if: exact jp, stripped jp, or id_text match (fallback hint)
function isCorrect(input, card) {
  const trimmed = input.trim();
  if (!trimmed) return false;
  const stripped = stripFuri(card.jp);
  // Exact or stripped match
  if (trimmed === card.jp || trimmed === stripped) return true;
  // Lowercase match (for romaji-ish or capitalization)
  if (norm(trimmed) === norm(card.jp)) return true;
  // Kana-only match (reading extracted from inline 《》 ruby in jp).
  // extractReadings joins multiple readings with a display space (　); the old
  // furi field concatenated them with none (confirmed against main's pre-P12
  // data) — strip whitespace from both sides so either typing convention matches.
  const reading = extractReadings(card.jp);
  if (reading && trimmed.replace(/\s/g, '') === reading.replace(/\s/g, '')) return true;
  return false;
}

/**
 * Item 60: unlike QuizProduksiMode's multi-synonym id_text, isCorrect()
 * accepts two genuinely different targets here (the kanji form, or its kana
 * reading) -- diffs against whichever the input was actually closer to.
 */
function closestAnswerDiff(input, card) {
  const stripped = stripFuri(card.jp);
  const reading = extractReadings(card.jp);
  const candidates = [stripped, reading ? reading.replace(/\s/g, '') : null].filter(Boolean);
  let best = null;
  for (const candidate of candidates) {
    const ops = diffChars(input.trim(), candidate);
    const dist = ops.filter((o) => o.op !== 'match').length;
    if (!best || dist < best.dist) best = { candidate, ops, dist };
  }
  return best;
}

export default function ProductionMode({
  cards,
  onExit,
  onSessionEnd,
  onRetryWrong,
  audioEnabled = false,
}) {
  const { prefs, setPref } = useApp();
  const handleSpeakError = useSpeakErrorHandler();
  const furiganaPolicy = prefs?.furiganaPolicy ?? 'always';
  const [started, setStarted] = useState(false);
  const [count, setCount] = useState(() => prefs?.quizQuestionCount ?? 10);
  const [queue, setQueue] = useState([]);
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState('');
  const [phase, setPhase] = useState('prompt'); // 'prompt' | 'revealed'
  const [results, setResults] = useState([]);
  const [sessionFired, setSessionFired] = useState(false);
  const inputRef = useRef(null);
  const { getDurationMs } = useSessionTimer();
  const { recordWrong } = useProgress();

  const startSession = () => {
    const q = shuffle(cards).slice(0, count);
    setQueue(q);
    setIdx(0);
    setInput('');
    setPhase('prompt');
    setResults([]);
    setSessionFired(false);
    setStarted(true);
  };

  useEffect(() => {
    if (started && phase === 'prompt') {
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [started, idx, phase]);

  const card = queue[idx];
  const isLast = idx === queue.length - 1;

  const handleSubmit = useCallback(() => {
    if (phase !== 'prompt' || !card) return;
    const correct = isCorrect(input, card);
    if (correct) haptic.correct();
    else {
      haptic.wrong();
      recordWrong(card.id);
    }

    if (audioEnabled && canSpeak()) {
      speakJP(stripFuri(card.jp), { onError: () => handleSpeakError({ automatic: true }) });
    }

    setResults((r) => [...r, { card, input: input.trim(), correct }]);
    setPhase('revealed');
  }, [phase, card, input, audioEnabled, recordWrong, handleSpeakError]);

  const handleNext = useCallback(() => {
    if (isLast) {
      const finalResults = [...results];
      if (!sessionFired) {
        setSessionFired(true);
        const c = finalResults.filter((r) => r.correct).length;
        onSessionEnd?.({ correct: c, total: finalResults.length, durationMs: getDurationMs() });
      }
      setStarted(false);
      setIdx(0);
    } else {
      setIdx((i) => i + 1);
      setInput('');
      setPhase('prompt');
    }
  }, [isLast, results, sessionFired, onSessionEnd, getDurationMs]);

  const handleSkip = useCallback(() => {
    if (phase !== 'prompt' || !card) return;
    haptic.wrong();
    recordWrong(card.id);
    setResults((r) => [...r, { card, input: '', correct: false, skipped: true }]);
    setPhase('revealed');
  }, [phase, card, recordWrong]);

  useEffect(() => {
    const handler = (e) => {
      if (phase === 'prompt') {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleSubmit();
        }
        if (e.key === 'Escape') handleSkip();
      } else {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleNext();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [phase, handleSubmit, handleSkip, handleNext]);

  // ── Start screen ──────────────────────────────────────────────────────────
  if (!started) {
    const doneCount = results.length;
    const correctCount = results.filter((r) => r.correct).length;
    const showSummary = doneCount > 0;

    const pillStyle = (on) => ({
      fontFamily: 'inherit',
      padding: '7px 16px',
      fontSize: 'var(--fs-body)',
      borderRadius: T.r.pill,
      cursor: 'pointer',
      fontWeight: on ? 700 : 400,
      background: on ? T.surfaceActive : T.surface,
      border: `1px solid ${on ? T.borderActive : T.border}`,
      color: on ? T.amber : T.textMuted,
    });

    return (
      <div className={S.pageFade} style={{ padding: 'var(--sp-5) var(--sp-4)' }}>
        <p className={S.pageSub} style={{ marginBottom: 20 }}>
          Lihat terjemahan Indonesia → ketik jawaban Jepang (kanji/kana).
        </p>

        {showSummary && (
          <div
            className={S.card}
            style={{
              marginBottom: 20,
              background: T.correctBg,
              border: `1px solid ${T.correctBorder}`,
            }}
          >
            <div style={{ fontSize: 'var(--fs-body)', fontWeight: 700, color: T.correct }}>
              Sesi terakhir: {correctCount}/{doneCount} benar (
              {doneCount > 0 ? Math.round((correctCount / doneCount) * 100) : 0}%)
            </div>
          </div>
        )}

        <div className={S.sectionLabel}>Jumlah Soal</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {QUIZ_COUNTS.map((n) => (
            <button
              key={n}
              onClick={() => {
                setCount(n);
                setPref('quizQuestionCount', n);
              }}
              style={pillStyle(count === n)}
            >
              {n}
            </button>
          ))}
          <button onClick={() => setCount(cards.length)} style={pillStyle(count === cards.length)}>
            Semua ({cards.length})
          </button>
        </div>

        <HowToPlayCard
          explanation="Prompt bahasa Indonesia tampil → ketik Jepang (kanji, kana, atau kombinasi)."
          keyboardHint="Enter = kirim jawaban · Esc = skip · spasi (setelah reveal) = lanjut"
        />

        <button
          className={S.btnPrimary}
          style={{ fontSize: 'var(--fs-subtitle)', padding: '15px' }}
          onClick={startSession}
        >
          Mulai ✍️
        </button>
      </div>
    );
  }

  // ── Result screen ─────────────────────────────────────────────────────────
  if (!card) {
    const correct = results.filter((r) => r.correct).length;
    const total = results.length;
    const wrongList = results.filter((r) => !r.correct);
    const wrongCardIds = wrongList.map((r) => r.card.id).filter(Boolean);

    return (
      <ResultScreen
        correct={correct}
        total={total}
        review={wrongList.map((r) => ({
          question: r.card.jp,
          userAnswer: r.skipped ? '(dilewati)' : r.input,
          correctAnswer: r.card.id_text,
          category: r.card.category,
          _cardId: r.card.id,
        }))}
        onRestart={startSession}
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

  // ── Quiz screen ────────────────────────────────────────────────────────────
  const lastResult = phase === 'revealed' ? results[results.length - 1] : null;
  const answerCorrect = lastResult?.correct ?? false;

  return (
    <div className={S.pageScroll} style={{ padding: 'var(--sp-4)' }}>
      <QuizAnnouncer
        isCorrect={lastResult ? lastResult.correct : null}
        correctText={card.id_text}
      />
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <button
          className={S.btnBack}
          style={{ marginBottom: 0 }}
          onClick={() => {
            setStarted(false);
          }}
        >
          ← Produksi
        </button>
        <div style={{ fontSize: 'var(--fs-caption)', color: T.textDim }}>
          {idx + 1} / {queue.length}
          {results.length > 0 && (
            <span style={{ marginLeft: 8, color: T.correct, fontWeight: 700 }}>
              {results.filter((r) => r.correct).length} ✓
            </span>
          )}
        </div>
      </div>

      <ProgressBar
        current={idx + (phase === 'revealed' ? 1 : 0)}
        total={queue.length}
        color={T.amber}
      />

      {/* Prompt card — Indonesian → user types Japanese */}
      <div
        style={{
          background: T.surface,
          border: `1px solid ${T.border}`,
          borderRadius: 16,
          padding: '28px 20px',
          textAlign: 'center',
          margin: '16px 0',
          animation: 'scaleIn 0.2s var(--ease-smooth)',
        }}
      >
        <div
          style={{
            fontSize: 'var(--fs-small)',
            color: T.textDim,
            marginBottom: 8,
            letterSpacing: 1,
            textTransform: 'uppercase',
          }}
        >
          bahasa indonesia
        </div>
        <div
          style={{
            fontSize: 'var(--fs-page-title)',
            fontWeight: 700,
            color: T.text,
            lineHeight: 1.4,
          }}
        >
          {card.id_text}
        </div>
        {card.desc && (
          <div
            style={{
              fontSize: 'var(--fs-caption)',
              color: T.textDim,
              marginTop: 10,
              lineHeight: 1.5,
            }}
          >
            <DescBlock desc={card.desc} />
          </div>
        )}
      </div>

      {/* Input area */}
      {phase === 'prompt' ? (
        <>
          <div style={{ position: 'relative', marginBottom: 12 }}>
            <input
              ref={inputRef}
              aria-label="Jawaban"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ketik Jepang di sini... (kanji/kana)"
              style={{
                width: '100%',
                padding: '14px 16px',
                fontSize: 'var(--fs-jp-back)',
                fontFamily: 'Noto Sans JP, DM Sans, sans-serif',
                border: `1.5px solid ${T.border}`,
                borderRadius: 12,
                background: T.surface,
                color: T.text,
                boxSizing: 'border-box',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = T.borderActive;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = T.border;
              }}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
            />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className={S.btnPrimary}
              style={{ flex: 2 }}
              onClick={handleSubmit}
              disabled={!input.trim()}
            >
              Kirim →
            </button>
            <button
              className={S.btnSecondary}
              style={{ flex: 1, fontSize: 'var(--fs-caption)' }}
              onClick={handleSkip}
            >
              Lewati ⏭
            </button>
          </div>
        </>
      ) : (
        /* Reveal panel */
        <div
          style={{
            border: `1.5px solid ${answerCorrect ? T.correctBorder : T.wrongBorder}`,
            borderRadius: 12,
            background: answerCorrect ? T.correctBg : T.wrongBg,
            padding: '16px',
            marginBottom: 12,
            animation: 'scaleIn 0.18s var(--ease-smooth)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
            <span
              style={{ fontSize: 16, fontWeight: 700, color: answerCorrect ? T.correct : T.wrong }}
            >
              {answerCorrect ? '✓ Benar!' : '✗ Kurang tepat'}
            </span>
          </div>

          {!answerCorrect && lastResult?.input && (
            <div style={{ fontSize: 'var(--fs-body)', color: T.wrong, marginBottom: 6 }}>
              Kamu:{' '}
              <span style={{ fontFamily: 'Noto Sans JP, sans-serif' }}>
                {lastResult.input || '(dilewati)'}
              </span>
            </div>
          )}

          <div style={{ marginBottom: 6 }}>
            <span style={{ fontSize: 'var(--fs-small)', color: T.textDim }}>Jawaban: </span>
            <JpFront jp={card.jp} furiganaPolicy={furiganaPolicy} />
          </div>

          {!answerCorrect &&
            lastResult?.input &&
            (() => {
              const closest = closestAnswerDiff(lastResult.input, card);
              if (!closest || closest.dist < 1 || closest.dist > 3) return null;
              return (
                <div style={{ fontSize: 'var(--fs-body)', marginBottom: 4 }}>
                  <span style={{ color: T.textDim }}>Dekat: </span>
                  <span style={{ fontFamily: 'Noto Sans JP, sans-serif' }}>
                    <TypoDiff ops={closest.ops} />
                  </span>
                </div>
              );
            })()}

          {card.desc && (
            <div
              style={{
                fontSize: 'var(--fs-caption)',
                color: T.textDim,
                marginTop: 8,
                lineHeight: 1.5,
              }}
            >
              <DescBlock desc={card.desc} />
            </div>
          )}

          {audioEnabled && canSpeak() && (
            <button
              onClick={() => speakJP(stripFuri(card.jp), { onError: handleSpeakError })}
              style={{
                marginTop: 8,
                background: 'none',
                border: 'none',
                fontSize: 'var(--fs-caption)',
                color: T.amber,
                cursor: 'pointer',
                padding: '4px 0',
              }}
            >
              🔊 Dengarkan
            </button>
          )}
        </div>
      )}

      {phase === 'revealed' && (
        <button
          className={S.btnPrimary}
          style={{ fontSize: 'var(--fs-subtitle)' }}
          onClick={handleNext}
        >
          {isLast ? 'Lihat Hasil →' : 'Lanjut →'}
        </button>
      )}
    </div>
  );
}
