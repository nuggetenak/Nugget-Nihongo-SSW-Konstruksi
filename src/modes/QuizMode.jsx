// ─── QuizMode.jsx ─────────────────────────────────────────────────────────────
// v3.0 — quiz count selector, lemah mode, anti-repeat, settings panel
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useMemo, useCallback } from 'react';

// Anti-repeat pool — module-level, persists across re-renders but resets on page reload
const _seenPool = new Set();
import { T } from '../styles/theme.js';
import { generateQuiz } from '../utils/quiz-generator.js';
import { makeWrongEntry, getWrongCount } from '../utils/wrong-tracker.js';
import { usePersistedState } from '../hooks/usePersistedState.js';
import { shuffle } from '../utils/shuffle.js';
import { stripFuri } from '../utils/jp-helpers.js';
import QuizShell from '../components/QuizShell.jsx';

export default function QuizMode({ cards, allCards, onExit, onFinish }) {
  const [difficulty, setDifficulty] = useState('medium');
  const [quizCount, setQuizCount] = useState(10);
  const [lemahMode, setLemahMode] = useState(false);
  const [autoNextDelay, setAutoNextDelay] = useState(2000); // ms
  const [showSettings, setShowSettings] = useState(false);
  const [started, setStarted] = useState(false);
  const [seed, setSeed] = useState(0);
  const [quizWrong, setQuizWrong] = usePersistedState('ssw-quiz-wrong', {});

  const lemahCards = cards
    .filter((c) => getWrongCount(quizWrong[c.id]) > 0)
    .sort((a, b) => getWrongCount(quizWrong[b.id]) - getWrongCount(quizWrong[a.id]));

  const activeCards = lemahMode && lemahCards.length > 0 ? lemahCards : cards;

  const questions = useMemo(() => {
    if (!started) return [];

    // Anti-repeat: pick unseen first, then fill from seen if needed
    const unseen = activeCards.filter((c) => !_seenPool.has(c.id));
    let pool;
    if (unseen.length >= quizCount) {
      pool = shuffle(unseen).slice(0, quizCount);
    } else {
      // Exhausted unseen pool — reset and use all
      _seenPool.clear();
      pool = shuffle(activeCards).slice(0, quizCount);
    }
    pool.forEach((c) => _seenPool.add(c.id));

    const raw = generateQuiz(pool, allCards, difficulty, quizWrong);
    return raw.map((q) => ({
      question: stripFuri(q.card.jp),
      questionSub: q.card.romaji || null,
      questionIdText: q.card.id_text || null, // revealed after answer
      options: q.options.map((o) => ({
        text: o.text,
        sub: null,
        // Store full card info for post-answer reveal
        _jp: o._card?.jp ? stripFuri(o._card.jp) : null,
        _romaji: o._card?.romaji || null,
      })),
      correctIdx: q.options.findIndex((o) => o.correct),
      explanation: q.card.desc,
      _cardId: q.card.id,
      _category: q.card.category,
    }));
  }, [started, activeCards, allCards, difficulty, quizCount, quizWrong, seed]); // eslint-disable-line

  const handleAnswer = useCallback(
    (qIdx, selIdx, isCorrect) => {
      if (!isCorrect) {
        const cardId = questions[qIdx]?._cardId;
        if (cardId) setQuizWrong((w) => ({ ...w, [cardId]: makeWrongEntry(w[cardId]) }));
      }
    },
    [questions, setQuizWrong]
  );

  const startQuiz = () => {
    setSeed((s) => s + 1);
    setStarted(true);
  };

  // ─── Pre-start screen ───
  if (!started) {
    const DIFF = [
      { key: 'easy', label: 'Mudah', desc: 'Jawaban beda kategori', color: T.correct },
      { key: 'medium', label: 'Sedang', desc: 'Campuran', color: T.gold },
      { key: 'hard', label: 'Sulit', desc: 'Jawaban mirip', color: T.wrong },
    ];
    const COUNTS = [10, 20, 30, activeCards.length];
    const DELAYS = [
      { v: 1000, l: '1 dtk' },
      { v: 1500, l: '1.5 dtk' },
      { v: 2000, l: '2 dtk' },
      { v: 0, l: 'Manual' },
    ];

    return (
      <div
        style={{
          padding: '24px 16px',
          maxWidth: T.maxW,
          margin: '0 auto',
          animation: 'fadeIn 0.2s ease',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <button
            onClick={onExit}
            style={{
              fontFamily: 'inherit',
              fontSize: 12,
              color: T.textMuted,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            ← Kembali
          </button>
          <button
            onClick={() => setShowSettings((s) => !s)}
            style={{
              fontFamily: 'inherit',
              fontSize: 12,
              padding: '5px 12px',
              borderRadius: T.r.pill,
              border: `1px solid ${showSettings ? T.borderActive : T.border}`,
              background: showSettings ? T.surfaceActive : T.surface,
              color: showSettings ? T.amber : T.textMuted,
              cursor: 'pointer',
            }}
          >
            ⚙ {showSettings ? 'Tutup' : 'Pengaturan'}
          </button>
        </div>

        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 4, color: T.text }}>
          Kuis Flashcard
        </h2>
        <p style={{ fontSize: 13, color: T.textMuted, marginBottom: 20 }}>
          {activeCards.length} kartu tersedia {lemahMode ? '(mode lemah)' : ''}
        </p>

        {/* Jumlah soal */}
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
          Jumlah Soal
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {COUNTS.map((n, i) => {
            const label = i === COUNTS.length - 1 ? 'Semua' : String(n);
            const on = quizCount === n;
            return (
              <button
                key={n}
                onClick={() => setQuizCount(n)}
                style={{
                  fontFamily: 'inherit',
                  padding: '7px 16px',
                  fontSize: 13,
                  borderRadius: T.r.pill,
                  cursor: 'pointer',
                  fontWeight: on ? 700 : 400,
                  background: on ? T.surfaceActive : T.surface,
                  border: `1px solid ${on ? T.borderActive : T.border}`,
                  color: on ? T.amber : T.textMuted,
                }}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Kesulitan */}
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
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

        {/* Extra settings */}
        {showSettings && (
          <div
            style={{
              padding: '14px',
              borderRadius: T.r.md,
              background: T.surface,
              border: `1px solid ${T.border}`,
              marginBottom: 20,
              animation: 'fadeIn 0.15s ease',
            }}
          >
            {/* Mode lemah */}
            {lemahCards.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 12,
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>Mode Lemah</div>
                  <div style={{ fontSize: 11, color: T.textDim }}>
                    Fokus ke {lemahCards.length} kartu yang sering salah
                  </div>
                </div>
                <button
                  onClick={() => setLemahMode((l) => !l)}
                  style={{
                    fontFamily: 'inherit',
                    padding: '6px 14px',
                    borderRadius: T.r.pill,
                    border: `1px solid ${lemahMode ? T.wrongBorder : T.border}`,
                    background: lemahMode ? T.wrongBg : T.surface,
                    color: lemahMode ? T.wrong : T.textMuted,
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: 12,
                  }}
                >
                  {lemahMode ? '⚠ ON' : 'OFF'}
                </button>
              </div>
            )}
            {/* Auto-next delay */}
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 8 }}>
                Lanjut otomatis
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {DELAYS.map((d) => (
                  <button
                    key={d.v}
                    onClick={() => setAutoNextDelay(d.v)}
                    style={{
                      fontFamily: 'inherit',
                      padding: '5px 12px',
                      fontSize: 12,
                      borderRadius: T.r.pill,
                      cursor: 'pointer',
                      background: autoNextDelay === d.v ? T.surfaceActive : T.surface,
                      border: `1px solid ${autoNextDelay === d.v ? T.borderActive : T.border}`,
                      color: autoNextDelay === d.v ? T.amber : T.textMuted,
                    }}
                  >
                    {d.l}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <button
          onClick={startQuiz}
          style={{
            width: '100%',
            padding: '15px',
            fontSize: 15,
            fontWeight: 700,
            fontFamily: 'inherit',
            borderRadius: T.r.md,
            background: T.accent,
            border: 'none',
            color: T.textBright,
            cursor: 'pointer',
            boxShadow: T.shadow.glow,
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
      onExit={() => {
        setStarted(false);
        _seenPool.clear();
      }}
      title="Kuis"
      onAnswer={handleAnswer}
      onFinish={onFinish}
      accentColor={T.gold}
      autoNextDelay={autoNextDelay}
    />
  );
}
