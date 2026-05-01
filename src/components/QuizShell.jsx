// ─── QuizShell.jsx ────────────────────────────────────────────────────────────
// Note: timer color (red when <60s) kept inline — conditional/prop-driven.
import { useState, useCallback, useEffect } from 'react';
import { T } from '../styles/theme.js';
import { useQuizKeyboard } from '../hooks/useQuizKeyboard.js';
import { useStreak } from '../hooks/useStreak.js';
import ProgressBar from './ProgressBar.jsx';
import OptionButton from './OptionButton.jsx';
import ResultScreen from './ResultScreen.jsx';
import S from './QuizShell.module.css';

export default function QuizShell({
  questions,
  onExit,
  title = 'Kuis',
  onAnswer,
  onFinish,
  timer = 0,
  showHint = false,
  renderExtra,
  accentColor = T.amber,
  autoNextDelay = 2000,
}) {
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [results, setResults] = useState([]);
  const [phase, setPhase] = useState('playing');
  const [timeLeft, setTimeLeft] = useState(timer);
  const { streak, maxStreak, recordAnswer, reset: resetStreak } = useStreak();

  const q = questions[qIdx];
  const isLast = qIdx === questions.length - 1;

  useEffect(() => {
    if (timer <= 0 || phase !== 'playing') return;
    if (timeLeft <= 0) { setPhase('finished'); return; }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, timer, phase]);

  const handleSelect = useCallback(
    (idx) => {
      if (selected !== null || phase !== 'playing') return;
      setSelected(idx);
      const isCorrect = idx === q.correctIdx;
      recordAnswer(isCorrect);
      onAnswer?.(qIdx, idx, isCorrect);
      setResults((r) => [
        ...r,
        {
          isCorrect,
          question: q.question,
          userAnswer: q.options[idx]?.text || '',
          correctAnswer: q.options[q.correctIdx]?.text || '',
          explanation: q.explanation || '',
        },
      ]);
    },
    [selected, phase, q, qIdx, onAnswer, recordAnswer]
  );

  const handleNext = useCallback(() => {
    if (selected === null) return;
    if (isLast) { setPhase('finished'); }
    else { setQIdx((i) => i + 1); setSelected(null); }
  }, [selected, isLast]);

  useQuizKeyboard({ onSelect: handleSelect, onNext: handleNext, selected, phase, optCount: q?.options?.length || 4 });

  useEffect(() => {
    if (selected === null || phase !== 'playing') return;
    if (autoNextDelay === 0) return;
    const t = setTimeout(handleNext, autoNextDelay);
    return () => clearTimeout(t);
  }, [selected, phase, handleNext, autoNextDelay]);

  const handleRestart = () => {
    setQIdx(0); setSelected(null); setResults([]); setPhase('playing');
    setTimeLeft(timer); resetStreak();
  };

  useEffect(() => {
    if (phase === 'finished') {
      const correct = results.filter((r) => r.isCorrect).length;
      onFinish?.({ correct, total: results.length, maxStreak });
    }
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  if (phase === 'finished') {
    const correct = results.filter((r) => r.isCorrect).length;
    return (
      <ResultScreen
        correct={correct}
        total={results.length}
        maxStreak={maxStreak}
        review={results.filter((r) => !r.isCorrect)}
        onRestart={handleRestart}
        onRetryWrong={handleRestart}
        onExit={onExit}
      />
    );
  }
  if (!q) return null;

  const correct = results.filter((r) => r.isCorrect).length;
  const fmtTime = timer > 0
    ? `${Math.floor(timeLeft / 60)}:${String(timeLeft % 60).padStart(2, '0')}`
    : null;

  return (
    <div className={S.wrap}>
      <div className={S.header}>
        <button className={S.btnBack} onClick={onExit}>← {title}</button>
        <div className={S.meta} aria-live="polite" aria-atomic="true">
          {fmtTime && (
            <span
              className={S.timer}
              style={{ color: timeLeft < 60 ? T.wrong : T.textMuted }}
              aria-label={timeLeft < 60 ? `Peringatan: sisa waktu ${fmtTime}` : `Waktu ${fmtTime}`}
            >
              ⏱ {fmtTime}
            </span>
          )}
          <span className={S.score} aria-label={`Skor ${correct} benar dari ${qIdx + (selected !== null ? 1 : 0)} soal`}>{correct}/{qIdx + (selected !== null ? 1 : 0)}</span>
          {streak > 1 && <span className={S.streak} aria-label={`Streak ${streak}`}>🔥{streak}</span>}
        </div>
      </div>

      <ProgressBar
        current={qIdx + (selected !== null ? 1 : 0)}
        total={questions.length}
        color={accentColor}
      />

      <div className={S.counter}>
        {qIdx + 1} / {questions.length}
      </div>

      <div className={S.questionCard}>
        <div className={S.questionText} style={{ fontFamily: T.fontJP }}>{q.question}</div>
        {q.questionSub && <div className={S.questionSub}>{q.questionSub}</div>}
        {showHint && q.hint && <div className={S.hint}>💡 {q.hint}</div>}
        {renderExtra?.(q)}
      </div>

      <div className={S.options}>
        {q.options.map((opt, i) => (
          <OptionButton
            key={i}
            idx={i}
            text={opt.text}
            subText={opt.sub}
            selected={selected}
            isCorrect={i === q.correctIdx}
            onSelect={handleSelect}
          />
        ))}
      </div>

      {selected !== null && q.explanation && (
        <div className={S.explanation}>💡 {q.explanation}</div>
      )}

      {selected !== null && (
        <button className={S.btnNext} onClick={handleNext}>
          {isLast ? 'Lihat Hasil →' : 'Lanjut →'}
        </button>
      )}
    </div>
  );
}
