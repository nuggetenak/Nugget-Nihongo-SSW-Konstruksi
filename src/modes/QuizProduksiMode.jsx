// ─── QuizProduksiMode.jsx ────────────────────────────────────────────────────
// B1 (Proposal): Quiz Production Mode — JP→ID recall.
// User sees Japanese term + furigana, types Indonesian translation.
// Inverse of ProductionMode (ID→JP). Mirrors SSW exam listening context.
// Fuzzy matching: case-insensitive, strips punctuation, accepts synonyms in id_text.
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useRef, useCallback, useEffect } from 'react';
import { T } from '../styles/theme.js';
import { shuffle } from '../utils/shuffle.js';
import { stripFuri } from '../utils/jp-helpers.js';
import { speakJP, canSpeak } from '../utils/speak.js';
import { haptic } from '../utils/haptic.js';
import { useProgress } from '../contexts/ProgressContext.jsx';
import { useApp } from '../contexts/AppContext.jsx';
import { useSpeakErrorHandler } from '../hooks/useSpeakErrorHandler.js';
import { JpFront, DescBlock } from '../components/JpDisplay.jsx';
import QuizAnnouncer from '../components/QuizAnnouncer.jsx';
import { useSessionTimer } from '../hooks/useSessionTimer.js';
import ProgressBar from '../components/ProgressBar.jsx';
import ResultScreen from '../components/ResultScreen.jsx';
import HowToPlayCard from '../components/HowToPlayCard.jsx';
import TypoDiff from '../components/TypoDiff.jsx';
import { diffChars } from '../utils/typo-diff.js';
import { QUIZ_COUNTS } from '../utils/constants.js';
import S from './modes.module.css';

// Normalize for fuzzy compare: lowercase, strip punctuation, collapse spaces
function norm(s = '') {
  return String(s)
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Accept if any slash-separated synonym in id_text matches (case-insensitive, fuzzy)
function isCorrect(input, card) {
  const trimmed = input.trim();
  if (!trimmed) return false;
  const normInput = norm(trimmed);
  // id_text may be "Apel pagi" or "Rapat / Pertemuan pagi"
  const synonyms = card.id_text.split(/[/,]/).map((s) => norm(s.trim()));
  return synonyms.some(
    (syn) => normInput === syn || syn.includes(normInput) || normInput.includes(syn)
  );
}

/**
 * Finds which accepted synonym in id_text the user's input was closest to,
 * and the character diff against it -- for showing a specific, relevant
 * typo highlight rather than a diff against an arbitrary or combined string.
 * Case-insensitive, matching isCorrect()'s own case-ignoring comparison --
 * otherwise a pure case difference would be falsely flagged as a typo.
 */
function closestSynonymDiff(input, idText) {
  const synonyms = idText.split(/[/,]/).map((s) => s.trim());
  let best = null;
  for (const syn of synonyms) {
    const ops = diffChars(input.toLowerCase(), syn.toLowerCase());
    const dist = ops.filter((o) => o.op !== 'match').length;
    if (!best || dist < best.dist) best = { syn, ops, dist };
  }
  return best;
}

export default function QuizProduksiMode({
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
    else haptic.wrong();

    if (!correct) {
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

  const pillStyle = (on) => ({
    fontFamily: 'inherit',
    padding: 'var(--space-8) var(--space-16)',
    fontSize: 'var(--fs-body)',
    borderRadius: T.r.pill,
    cursor: 'pointer',
    fontWeight: on ? 700 : 400,
    background: on ? T.surfaceActive : T.surface,
    border: `1px solid ${on ? T.borderActive : T.border}`,
    color: on ? T.amber : T.textMuted,
  });

  // ── Start screen ────────────────────────────────────────────────────────────
  if (!started) {
    const doneCount = results.length;
    const correctCount = results.filter((r) => r.correct).length;
    const showSummary = doneCount > 0;

    return (
      <div className={S.pageFade} style={{ padding: 'var(--space-20) var(--space-16)' }}>
        <p className={S.pageSub} style={{ marginBottom: 'var(--space-20)' }}>
          Lihat istilah Jepang → ketik terjemahan Indonesia kamu.
        </p>

        {showSummary && (
          <div
            className={S.card}
            style={{
              marginBottom: 'var(--space-20)',
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
        <div
          style={{
            display: 'flex',
            gap: 'var(--space-8)',
            marginBottom: 'var(--space-24)',
            flexWrap: 'wrap',
          }}
        >
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
          explanation="Istilah Jepang tampil → ketik terjemahan bahasa Indonesia."
          keyboardHint="Enter = kirim · Esc = lewati · Pencocokan fleksibel (huruf besar/kecil diabaikan)"
        />

        <button
          className={S.btnPrimary}
          style={{ fontSize: 'var(--fs-subtitle)', padding: 'var(--space-16)' }}
          onClick={startSession}
        >
          Mulai 🔤
        </button>
      </div>
    );
  }

  // ── Result screen ───────────────────────────────────────────────────────────
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

  // ── Quiz screen ─────────────────────────────────────────────────────────────
  const lastResult = phase === 'revealed' ? results[results.length - 1] : null;
  const answerCorrect = lastResult?.correct ?? false;

  return (
    <div className={S.pageScroll} style={{ padding: 'var(--space-16)' }}>
      <QuizAnnouncer
        isCorrect={lastResult ? lastResult.correct : null}
        correctText={card.id_text}
      />
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--space-12)',
        }}
      >
        <button className={S.btnBack} style={{ marginBottom: 0 }} onClick={() => setStarted(false)}>
          ← Kuis Prod.
        </button>
        <div style={{ fontSize: 'var(--fs-caption)', color: T.textDim }}>
          {idx + 1} / {queue.length}
          {results.length > 0 && (
            <span style={{ marginLeft: 'var(--space-8)', color: T.correct, fontWeight: 700 }}>
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

      {/* Prompt card — Japanese term → user types Indonesian */}
      <div
        style={{
          background: T.surface,
          border: `1px solid ${T.border}`,
          borderRadius: 16,
          padding: 'var(--space-28) var(--space-20)',
          textAlign: 'center',
          margin: 'var(--space-16) 0',
          animation: 'scaleIn 0.2s var(--ease-smooth)',
        }}
      >
        <div
          style={{
            fontSize: 'var(--fs-small)',
            color: T.textDim,
            marginBottom: 'var(--space-8)',
            letterSpacing: 1,
            textTransform: 'uppercase',
          }}
        >
          bahasa jepang
        </div>
        <JpFront jp={card.jp} furiganaPolicy={furiganaPolicy} />
        {audioEnabled && canSpeak() && (
          <button
            onClick={() => speakJP(stripFuri(card.jp), { onError: handleSpeakError })}
            style={{
              marginTop: 'var(--space-10)',
              background: 'none',
              border: 'none',
              fontSize: 'var(--fs-body)',
              color: T.amber,
              cursor: 'pointer',
              padding: 'var(--space-4) 0',
            }}
          >
            🔊
          </button>
        )}
      </div>

      {/* Input area */}
      {phase === 'prompt' ? (
        <>
          <div style={{ position: 'relative', marginBottom: 'var(--space-12)' }}>
            <input
              ref={inputRef}
              aria-label="Jawaban"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ketik terjemahan Indonesia..."
              style={{
                width: '100%',
                padding: 'var(--space-14) var(--space-16)',
                fontSize: 16,
                fontFamily: 'DM Sans, sans-serif',
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
              spellCheck={false}
            />
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-8)' }}>
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
            padding: 'var(--space-16)',
            marginBottom: 'var(--space-12)',
            animation: 'scaleIn 0.18s var(--ease-smooth)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: 'var(--space-8)',
              marginBottom: 'var(--space-8)',
            }}
          >
            <span
              style={{ fontSize: 16, fontWeight: 700, color: answerCorrect ? T.correct : T.wrong }}
            >
              {answerCorrect ? '✓ Benar!' : '✗ Kurang tepat'}
            </span>
          </div>

          {!answerCorrect && lastResult?.input && (
            <div
              style={{ fontSize: 'var(--fs-body)', color: T.wrong, marginBottom: 'var(--space-6)' }}
            >
              Kamu: {lastResult.input || '(dilewati)'}
            </div>
          )}

          <div style={{ marginBottom: 'var(--space-4)' }}>
            <span style={{ fontSize: 'var(--fs-small)', color: T.textDim }}>Jawaban: </span>
            <span style={{ fontSize: 16, fontWeight: 700, color: T.text }}>{card.id_text}</span>
          </div>

          {!answerCorrect &&
            lastResult?.input &&
            (() => {
              const closest = closestSynonymDiff(lastResult.input, card.id_text);
              // Only worth a "spelling lesson" highlight for a near-miss --
              // a large edit distance means a genuinely different answer,
              // where a mostly-red diff would be noise, not help.
              if (!closest || closest.dist < 1 || closest.dist > 3) return null;
              return (
                <div style={{ fontSize: 'var(--fs-body)', marginBottom: 'var(--space-4)' }}>
                  <span style={{ color: T.textDim }}>Dekat: </span>
                  <TypoDiff ops={closest.ops} />
                </div>
              );
            })()}

          {card.desc && (
            <div
              style={{
                fontSize: 'var(--fs-caption)',
                color: T.textDim,
                marginTop: 'var(--space-8)',
                lineHeight: 1.5,
              }}
            >
              <DescBlock desc={card.desc} />
            </div>
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
