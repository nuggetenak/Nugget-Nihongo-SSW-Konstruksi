// ─── QuizMode.jsx ────────────────────────────────────────────────────────────
// seenPool is a useRef — resets on unmount, preventing cross-session repetition.
import { useState, useCallback, useRef, useMemo } from 'react';
import { T } from '../styles/theme.js';
import { generateQuiz } from '../utils/quiz-generator.js';
import { getWrongCount } from '../utils/wrong-tracker.js';
import { shuffle } from '../utils/shuffle.js';
import { get as storageGet } from '../storage/engine.js';
import { QUIZ_COUNTS } from '../utils/constants.js';
import { CATEGORIES } from '../data/categories.js';
import { useProgress } from '../contexts/ProgressContext.jsx';
import QuizShell from '../components/QuizShell.jsx';
import {
  saveQuizSnapshot,
  readQuizSnapshot,
  clearQuizSnapshot,
} from '../utils/quiz-persistence.js';
import S from './modes.module.css';

const PERSIST_KEY = 'ssw-persist-kuis';
const PERSIST_QUESTIONS_KEY = 'ssw-persist-kuis-questions';

export default function QuizMode({
  cards,
  allCards,
  onExit,
  onFinish,
  onRetryWrong,
  audioEnabled = false,
  filterIds = null,
}) {
  const [difficulty, setDifficulty] = useState('medium');
  const [quizCount, setQuizCount] = useState(() => storageGet('prefs')?.quizQuestionCount ?? 10);
  const [lemahMode, setLemahMode] = useState(false);
  const [autoNextDelay, setAutoNextDelay] = useState(2000);
  const [showSettings, setShowSettings] = useState(false);
  const [started, setStarted] = useState(false);
  const [resumeData, setResumeData] = useState(() => {
    // Checked once, at mount, before the user has done anything -- a
    // resume prompt that appeared mid-session (e.g. after they'd already
    // chosen to start fresh) would be confusing, not helpful.
    const progress = readQuizSnapshot(PERSIST_KEY);
    const savedQuestions = readQuizSnapshot(PERSIST_QUESTIONS_KEY);
    if (progress && savedQuestions && savedQuestions.length > 0) {
      return { progress, questions: savedQuestions };
    }
    return null;
  });
  const { quizWrong, recordWrong } = useProgress();

  // preventing stale seen-card memory across separate mode sessions.
  const seenPool = useRef(new Set());

  // Scope cards if filterIds provided (launched from SumberMode).
  const baseCards = filterIds ? cards.filter((c) => filterIds.includes(c.id)) : cards;

  const lemahCards = baseCards
    .filter((c) => getWrongCount(quizWrong[c.id]) > 0)
    .sort((a, b) => getWrongCount(quizWrong[b.id]) - getWrongCount(quizWrong[a.id]));

  const activeCards = lemahMode && lemahCards.length > 0 ? lemahCards : baseCards;

  // Category filter.
  const [selectedCat, setSelectedCat] = useState('all');
  const availableCats = useMemo(() => {
    const catKeys = new Set(baseCards.map((c) => c.category));
    return ['all', ...[...catKeys]];
  }, [baseCards]);
  const catFilteredCards =
    selectedCat === 'all' ? activeCards : activeCards.filter((c) => c.category === selectedCat);

  const [questions, setQuestions] = useState([]);

  const handleAnswer = useCallback(
    (qIdx, _selIdx, isCorrect) => {
      if (!isCorrect) {
        const cardId = questions[qIdx]?._cardId;
        if (cardId) recordWrong(cardId);
      }
    },
    [questions, recordWrong]
  );

  const startQuiz = () => {
    // Compute questions here (not in useMemo) to avoid ref-in-render lint error
    const unseen = catFilteredCards.filter((c) => !seenPool.current.has(c.id));
    let pool;
    if (unseen.length >= quizCount) {
      pool = shuffle(unseen).slice(0, quizCount);
    } else {
      seenPool.current.clear();
      pool = shuffle(catFilteredCards).slice(0, quizCount);
    }
    pool.forEach((c) => seenPool.current.add(c.id));
    const raw = generateQuiz(pool, allCards, difficulty, quizWrong);
    const qs = raw.map((q) => ({
      question: q.card.jp,
      options: q.options.map((o) => ({ text: o.text, sub: null })),
      correctIdx: q.options.findIndex((o) => o.correct),
      explanation: q.card.desc,
      _cardId: q.card.id,
    }));
    setQuestions(qs);
    saveQuizSnapshot(PERSIST_QUESTIONS_KEY, qs);
    setResumeData(null); // fresh session now, not resuming
    setStarted(true);
  };

  const handleResume = useCallback(() => {
    if (!resumeData) return;
    setQuestions(resumeData.questions);
    setStarted(true);
    // resumeData itself stays set -- QuizShell reads its initial* values
    // from it below. Cleared only once the session actually finishes or
    // the user explicitly declines (handleDeclineResume).
  }, [resumeData]);

  const handleDeclineResume = useCallback(() => {
    clearQuizSnapshot(PERSIST_KEY);
    clearQuizSnapshot(PERSIST_QUESTIONS_KEY);
    setResumeData(null);
  }, []);

  if (!started) {
    const DIFF = [
      {
        key: 'easy',
        label: 'Mudah',
        desc: 'Jawaban beda kategori',
        detail:
          'Pilihan jawaban dari kategori berbeda — mudah disingkirkan. Cocok untuk belajar kosakata baru.',
        color: T.correct,
      },
      {
        key: 'medium',
        label: 'Sedang',
        desc: 'Campuran',
        detail: 'Campuran jawaban satu dan beda kategori. Perlu teliti membaca pilihan.',
        color: T.gold,
      },
      {
        key: 'hard',
        label: 'Sulit',
        desc: 'Jawaban mirip',
        detail:
          'Semua pilihan dari kategori sama — mirip bunyi/makna. Mendekati kesulitan ujian asli JAC.',
        color: T.wrong,
      },
    ];
    const DELAYS = [
      { v: 1000, l: '1 dtk' },
      { v: 1500, l: '1.5 dtk' },
      { v: 2000, l: '2 dtk' },
      { v: 0, l: 'Manual' },
    ];

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
      <div className={S.pageFade} style={{ padding: '24px 16px' }}>
        <div className={S.rowSpread} style={{ marginBottom: 16 }}>
          <button className={S.btnBack} style={{ marginBottom: 0 }} onClick={onExit}>
            ← Kembali
          </button>
          <button
            style={{
              fontFamily: 'inherit',
              fontSize: 'var(--fs-caption)',
              padding: '5px 12px',
              borderRadius: T.r.pill,
              border: `1px solid ${showSettings ? T.borderActive : T.border}`,
              background: showSettings ? T.surfaceActive : T.surface,
              color: showSettings ? T.amber : T.textMuted,
              cursor: 'pointer',
            }}
            onClick={() => setShowSettings((s) => !s)}
          >
            ⚙ {showSettings ? 'Tutup' : 'Pengaturan'}
          </button>
        </div>

        <h2 className={S.pageTitle}>Kuis Flashcard</h2>

        {resumeData && (
          <div
            style={{
              background: T.surfaceActive,
              border: `1.5px solid ${T.borderActive}`,
              borderRadius: T.r.md,
              padding: '14px 16px',
              marginBottom: 16,
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 4 }}>
              Lanjutkan kuis sebelumnya?
            </div>
            <div style={{ fontSize: 'var(--fs-caption)', color: T.textMuted, marginBottom: 10 }}>
              Soal {resumeData.progress.qIdx + 1} dari {resumeData.questions.length}, terjawab{' '}
              {resumeData.progress.results.length}.
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                style={{
                  ...pillStyle(true),
                  flex: 1,
                  textAlign: 'center',
                  background: T.amber,
                  color: '#1c1917',
                  border: 'none',
                }}
                onClick={handleResume}
              >
                Lanjutkan
              </button>
              <button
                style={{ ...pillStyle(false), flex: 1, textAlign: 'center' }}
                onClick={handleDeclineResume}
              >
                Mulai Baru
              </button>
            </div>
          </div>
        )}

        <p className={S.pageSub}>
          {catFilteredCards.length} kartu tersedia {lemahMode ? '(mode lemah)' : ''}
          {selectedCat !== 'all' ? ` · ${selectedCat}` : ''}
        </p>

        <div className={S.sectionLabel}>Jumlah Soal</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          {[...QUIZ_COUNTS, catFilteredCards.length].map((n, i) => {
            const label = i === QUIZ_COUNTS.length ? 'Semua' : String(n);
            return (
              <button
                key={n}
                onClick={() => {
                  setQuizCount(n);
                  // Persist count choice.
                  import('../storage/engine.js').then(({ set: storageSet }) => {
                    const prefs = storageGet('prefs') ?? {};
                    storageSet('prefs', { ...prefs, quizQuestionCount: n });
                  });
                }}
                style={pillStyle(quizCount === n)}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className={S.sectionLabel}>Tingkat Kesulitan</div>
        <div className={S.list} style={{ marginBottom: 20 }}>
          {DIFF.map((d) => (
            <div key={d.key}>
              <button
                className={S.btnItem}
                onClick={() => setDifficulty(d.key)}
                style={{
                  background: difficulty === d.key ? `${d.color}18` : T.surface,
                  border: `1px solid ${difficulty === d.key ? `${d.color}55` : T.border}`,
                  color: difficulty === d.key ? d.color : T.text,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span style={{ fontWeight: 600 }}>{d.label}</span>
                <span style={{ fontSize: 'var(--fs-small)', color: T.textDim }}>{d.desc}</span>
              </button>
              {difficulty === d.key && (
                <div
                  style={{
                    fontSize: 'var(--fs-small)',
                    color: d.color,
                    padding: '4px 12px 8px',
                    lineHeight: 1.5,
                  }}
                >
                  {d.detail}
                </div>
              )}
            </div>
          ))}
        </div>

        {showSettings && (
          <div className={S.card} style={{ marginBottom: 20, animation: 'fadeIn 0.15s ease' }}>
            {lemahCards.length > 0 && (
              <div className={S.rowSpread} style={{ marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 'var(--fs-body)', fontWeight: 600, color: T.text }}>
                    Mode Lemah
                  </div>
                  <div style={{ fontSize: 'var(--fs-small)', color: T.textDim }}>
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
                    fontSize: 'var(--fs-caption)',
                  }}
                >
                  {lemahMode ? '⚠ ON' : 'OFF'}
                </button>
              </div>
            )}
            <div>
              <div
                style={{
                  fontSize: 'var(--fs-body)',
                  fontWeight: 600,
                  color: T.text,
                  marginBottom: 8,
                }}
              >
                Lanjut otomatis
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {DELAYS.map((d) => (
                  <button
                    key={d.v}
                    onClick={() => setAutoNextDelay(d.v)}
                    style={pillStyle(autoNextDelay === d.v)}
                  >
                    {d.l}
                  </button>
                ))}
              </div>
            </div>
            {/* Category filter */}
            {availableCats.length > 1 && (
              <div style={{ marginTop: 12 }}>
                <div
                  style={{
                    fontSize: 'var(--fs-body)',
                    fontWeight: 600,
                    color: T.text,
                    marginBottom: 8,
                  }}
                >
                  Filter Kategori
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {availableCats.map((key) => {
                    const meta =
                      key === 'all'
                        ? { label: 'Semua', emoji: '📚' }
                        : CATEGORIES.find((c) => c.key === key) || { label: key, emoji: '📁' };
                    return (
                      <button
                        key={key}
                        onClick={() => setSelectedCat(key)}
                        style={{ ...pillStyle(selectedCat === key), fontSize: 'var(--fs-small)' }}
                      >
                        {meta.emoji} {meta.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        <button
          className={S.btnPrimary}
          style={{ fontSize: 'var(--fs-subtitle)', padding: '15px' }}
          onClick={startQuiz}
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
        seenPool.current.clear();
        // Re-read rather than trust the mount-time resumeData -- QuizShell
        // has been writing fresh progress throughout, and this needs to
        // reflect where they actually left off just now, not where they
        // were the last time this screen was shown.
        const progress = readQuizSnapshot(PERSIST_KEY);
        const savedQuestions = readQuizSnapshot(PERSIST_QUESTIONS_KEY);
        setResumeData(
          progress && savedQuestions?.length > 0 ? { progress, questions: savedQuestions } : null
        );
      }}
      title="Kuis"
      onAnswer={handleAnswer}
      onFinish={(payload) => {
        clearQuizSnapshot(PERSIST_QUESTIONS_KEY); // QuizShell only owns PERSIST_KEY
        setResumeData(null);
        onFinish?.(payload);
      }}
      onRetryWrong={onRetryWrong}
      accentColor={T.gold}
      autoNextDelay={autoNextDelay}
      audioEnabled={audioEnabled}
      persistKey={PERSIST_KEY}
      initialQIdx={resumeData?.progress?.qIdx ?? 0}
      initialSelected={resumeData?.progress?.selected ?? null}
      initialResults={resumeData?.progress?.results ?? []}
    />
  );
}
