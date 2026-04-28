import { useState, useMemo, useCallback } from 'react';
import { T } from '../styles/theme.js';
import { generateQuiz } from '../utils/quiz-generator.js';
import { makeWrongEntry } from '../utils/wrong-tracker.js';
import { usePersistedState } from '../hooks/usePersistedState.js';
import { shuffle } from '../utils/shuffle.js';
import { stripFuri } from '../utils/jp-helpers.js';
import QuizShell from '../components/QuizShell.jsx';

export default function QuizMode({ cards, allCards, onExit }) {
  const [difficulty, setDifficulty] = useState('medium');
  const [started, setStarted] = useState(false);
  const [quizWrong, setQuizWrong] = usePersistedState('ssw-quiz-wrong', {});
  const [seed, setSeed] = useState(0); // force re-generate

  const count = Math.min(cards.length, 15);

  const questions = useMemo(() => {
    if (!started) return [];
    const pool = shuffle(cards).slice(0, count);
    const raw = generateQuiz(pool, allCards, difficulty, quizWrong);
    return raw.map((q) => ({
      question: stripFuri(q.card.jp),
      questionSub: q.card.furi || q.card.romaji,
      options: q.options.map((o) => ({ text: o.text, sub: null })),
      correctIdx: q.options.findIndex((o) => o.correct),
      explanation: q.card.desc,
      _cardId: q.card.id,
    }));
  }, [started, cards, allCards, difficulty, seed]); // eslint-disable-line

  const handleAnswer = useCallback(
    (qIdx, selIdx, isCorrect) => {
      if (!isCorrect) {
        const cardId = questions[qIdx]?._cardId;
        if (cardId) setQuizWrong((w) => ({ ...w, [cardId]: makeWrongEntry(w[cardId]) }));
      }
    },
    [questions, setQuizWrong]
  );

  // ─── Setup Screen ───
  if (!started) {
    const DIFF = [
      { key: 'easy', label: 'Mudah', desc: 'Jawaban beda kategori', color: T.correct },
      { key: 'medium', label: 'Sedang', desc: 'Campuran', color: T.gold },
      { key: 'hard', label: 'Sulit', desc: 'Jawaban mirip', color: T.wrong },
    ];
    return (
      <div style={{ padding: '24px 16px', maxWidth: T.maxW, margin: '0 auto' }}>
        <button
          onClick={onExit}
          style={{
            fontFamily: 'inherit',
            fontSize: 12,
            color: T.textMuted,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            marginBottom: 16,
          }}
        >
          ← Kembali
        </button>
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>Kuis Flashcard</h2>
        <p style={{ fontSize: 13, color: T.textMuted, marginBottom: 20 }}>
          {count} soal dari {cards.length} kartu
        </p>

        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 1.5,
            color: T.textDim,
            textTransform: 'uppercase',
            marginBottom: 8,
          }}
        >
          Tingkat Kesulitan
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
          {DIFF.map((d) => (
            <button
              key={d.key}
              onClick={() => setDifficulty(d.key)}
              style={{
                fontFamily: 'inherit',
                padding: '12px 14px',
                borderRadius: T.r.md,
                cursor: 'pointer',
                background: difficulty === d.key ? `${d.color}18` : T.surface,
                border: `1px solid ${difficulty === d.key ? `${d.color}55` : T.border}`,
                color: difficulty === d.key ? d.color : T.text,
                textAlign: 'left',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ fontWeight: 600 }}>{d.label}</span>
              <span style={{ fontSize: 11, color: T.textDim }}>{d.desc}</span>
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            setSeed((s) => s + 1);
            setStarted(true);
          }}
          style={{
            width: '100%',
            padding: '14px',
            fontSize: 15,
            fontWeight: 700,
            fontFamily: 'inherit',
            borderRadius: T.r.md,
            background: T.accent,
            border: 'none',
            color: T.textBright,
            cursor: 'pointer',
          }}
        >
          Mulai Kuis 🚀
        </button>
      </div>
    );
  }

  return (
    <QuizShell
      questions={questions}
      onExit={() => setStarted(false)}
      title="Kuis"
      onAnswer={handleAnswer}
      accentColor={T.gold}
    />
  );
}
