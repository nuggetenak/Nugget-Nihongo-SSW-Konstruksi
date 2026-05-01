// ─── QuizMode.jsx v3.1 (phaseA) ───────────────────────────────────────────────
// A.1: Fixed BUG-02 — _seenPool moved from module scope into useRef.
//      Module-scope Set persisted across mode entries; useRef resets correctly.
import { useState, useCallback, useRef } from 'react';
import { T } from '../styles/theme.js';
import { generateQuiz } from '../utils/quiz-generator.js';
import { makeWrongEntry, getWrongCount } from '../utils/wrong-tracker.js';
import { usePersistedState } from '../hooks/usePersistedState.js';
import { shuffle } from '../utils/shuffle.js';
import { stripFuri } from '../utils/jp-helpers.js';
import QuizShell from '../components/QuizShell.jsx';
import S from './modes.module.css';

export default function QuizMode({ cards, allCards, onExit, onFinish }) {
  const [difficulty, setDifficulty] = useState('medium');
  const [quizCount, setQuizCount] = useState(10);
  const [lemahMode, setLemahMode] = useState(false);
  const [autoNextDelay, setAutoNextDelay] = useState(2000);
  const [showSettings, setShowSettings] = useState(false);
  const [started, setStarted] = useState(false);
  const [quizWrong, setQuizWrong] = usePersistedState('ssw-quiz-wrong', {});

  // A.1 FIX: seenPool as useRef — resets when component unmounts/remounts,
  // preventing stale seen-card memory across separate mode sessions.
  const seenPool = useRef(new Set());

  const lemahCards = cards
    .filter((c) => getWrongCount(quizWrong[c.id]) > 0)
    .sort((a, b) => getWrongCount(quizWrong[b.id]) - getWrongCount(quizWrong[a.id]));

  const activeCards = lemahMode && lemahCards.length > 0 ? lemahCards : cards;

  const [questions, setQuestions] = useState([]);

  const handleAnswer = useCallback(
    (qIdx, _selIdx, isCorrect) => {
      if (!isCorrect) {
        const cardId = questions[qIdx]?._cardId;
        if (cardId) setQuizWrong((w) => ({ ...w, [cardId]: makeWrongEntry(w[cardId]) }));
      }
    },
    [questions, setQuizWrong]
  );

  const startQuiz = () => {
    // Compute questions here (not in useMemo) to avoid ref-in-render lint error
    const unseen = activeCards.filter((c) => !seenPool.current.has(c.id));
    let pool;
    if (unseen.length >= quizCount) { pool = shuffle(unseen).slice(0, quizCount); }
    else { seenPool.current.clear(); pool = shuffle(activeCards).slice(0, quizCount); }
    pool.forEach((c) => seenPool.current.add(c.id));
    const raw = generateQuiz(pool, allCards, difficulty, quizWrong);
    const qs = raw.map((q) => ({
      question: stripFuri(q.card.jp),
      questionSub: q.card.romaji || null,
      options: q.options.map((o) => ({ text: o.text, sub: null })),
      correctIdx: q.options.findIndex((o) => o.correct),
      explanation: q.card.desc,
      _cardId: q.card.id,
    }));
    setQuestions(qs);
    setStarted(true);
  };

  if (!started) {
    const DIFF = [
      { key: 'easy', label: 'Mudah', desc: 'Jawaban beda kategori', color: T.correct },
      { key: 'medium', label: 'Sedang', desc: 'Campuran', color: T.gold },
      { key: 'hard', label: 'Sulit', desc: 'Jawaban mirip', color: T.wrong },
    ];
    const COUNTS = [10, 20, 30, activeCards.length];
    const DELAYS = [{ v: 1000, l: '1 dtk' }, { v: 1500, l: '1.5 dtk' }, { v: 2000, l: '2 dtk' }, { v: 0, l: 'Manual' }];

    const pillStyle = (on) => ({
      fontFamily: 'inherit', padding: '7px 16px', fontSize: 13,
      borderRadius: T.r.pill, cursor: 'pointer', fontWeight: on ? 700 : 400,
      background: on ? T.surfaceActive : T.surface,
      border: `1px solid ${on ? T.borderActive : T.border}`,
      color: on ? T.amber : T.textMuted,
    });

    return (
      <div className={S.pageFade} style={{ padding: '24px 16px' }}>
        <div className={S.rowSpread} style={{ marginBottom: 16 }}>
          <button className={S.btnBack} style={{ marginBottom: 0 }} onClick={onExit}>← Kembali</button>
          <button
            style={{ fontFamily: 'inherit', fontSize: 12, padding: '5px 12px', borderRadius: T.r.pill, border: `1px solid ${showSettings ? T.borderActive : T.border}`, background: showSettings ? T.surfaceActive : T.surface, color: showSettings ? T.amber : T.textMuted, cursor: 'pointer' }}
            onClick={() => setShowSettings((s) => !s)}
          >
            ⚙ {showSettings ? 'Tutup' : 'Pengaturan'}
          </button>
        </div>

        <h2 className={S.pageTitle} style={{ fontSize: 20 }}>Kuis Flashcard</h2>
        <p className={S.pageSub}>{activeCards.length} kartu tersedia {lemahMode ? '(mode lemah)' : ''}</p>

        <div className={S.sectionLabel}>Jumlah Soal</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {COUNTS.map((n, i) => {
            const label = i === COUNTS.length - 1 ? 'Semua' : String(n);
            return (
              <button key={n} onClick={() => setQuizCount(n)} style={pillStyle(quizCount === n)}>{label}</button>
            );
          })}
        </div>

        <div className={S.sectionLabel}>Tingkat Kesulitan</div>
        <div className={S.list} style={{ marginBottom: 20 }}>
          {DIFF.map((d) => (
            <button
              key={d.key}
              className={S.btnItem}
              onClick={() => setDifficulty(d.key)}
              style={{ background: difficulty === d.key ? `${d.color}18` : T.surface, border: `1px solid ${difficulty === d.key ? `${d.color}55` : T.border}`, color: difficulty === d.key ? d.color : T.text, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <span style={{ fontWeight: 600 }}>{d.label}</span>
              <span style={{ fontSize: 11, color: T.textDim }}>{d.desc}</span>
            </button>
          ))}
        </div>

        {showSettings && (
          <div className={S.card} style={{ marginBottom: 20, animation: 'fadeIn 0.15s ease' }}>
            {lemahCards.length > 0 && (
              <div className={S.rowSpread} style={{ marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>Mode Lemah</div>
                  <div style={{ fontSize: 11, color: T.textDim }}>Fokus ke {lemahCards.length} kartu yang sering salah</div>
                </div>
                <button
                  onClick={() => setLemahMode((l) => !l)}
                  style={{ fontFamily: 'inherit', padding: '6px 14px', borderRadius: T.r.pill, border: `1px solid ${lemahMode ? T.wrongBorder : T.border}`, background: lemahMode ? T.wrongBg : T.surface, color: lemahMode ? T.wrong : T.textMuted, cursor: 'pointer', fontWeight: 700, fontSize: 12 }}
                >
                  {lemahMode ? '⚠ ON' : 'OFF'}
                </button>
              </div>
            )}
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 8 }}>Lanjut otomatis</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {DELAYS.map((d) => (
                  <button key={d.v} onClick={() => setAutoNextDelay(d.v)} style={pillStyle(autoNextDelay === d.v)}>{d.l}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        <button className={S.btnPrimary} style={{ fontSize: 15, padding: '15px' }} onClick={startQuiz}>
          Mulai Kuis 🚀
        </button>
      </div>
    );
  }

  return (
    <QuizShell
      questions={questions}
      onExit={() => { setStarted(false); seenPool.current.clear(); }}
      title="Kuis"
      onAnswer={handleAnswer}
      onFinish={onFinish}
      accentColor={T.gold}
      autoNextDelay={autoNextDelay}
    />
  );
}
