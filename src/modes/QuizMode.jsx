// ─── QuizMode.jsx ────────────────────────────────────────────────────────────
// seenPool is a useRef — resets on unmount, preventing cross-session repetition.
import { useState, useCallback, useRef, useMemo } from 'react';
import { T } from '../styles/theme.js';
import { pillStyle as sharedPill } from '../styles/pill.js';
import { generateQuiz } from '../utils/quiz-generator.js';
import { getWrongCount } from '../utils/wrong-tracker.js';
import { shuffle } from '../utils/shuffle.js';
import { get as storageGet } from '../storage/engine.js';
import {
  QUIZ_COUNTS,
  QUIZ_COUNT_ALL,
  AUTO_NEXT_DELAYS,
  resolveQuizCount,
} from '../utils/constants.js';
import { storedAutoNextDelay, saveAutoNextDelay } from '../utils/auto-next.js';
import { CATEGORIES } from '../data/categories.js';
import { useProgress } from '../contexts/ProgressContext.jsx';
import QuizShell from '../components/QuizShell.jsx';
import { useScopedDeck } from './FlashcardMode/use-scoped-deck.js';
import CategoryPicker from '../components/CategoryPicker.jsx';
import {
  saveQuizSnapshot,
  readQuizSnapshot,
  clearQuizSnapshot,
} from '../utils/quiz-persistence.js';
import S from './modes.module.css';
import { formatCount } from '../utils/format.js';

const PERSIST_KEY = 'ssw-persist-kuis';
const PERSIST_QUESTIONS_KEY = 'ssw-persist-kuis-questions';

export default function QuizMode({
  cards,
  allCards,
  onFinish,
  onRetryWrong,
  audioEnabled = false,
  filterIds = null,
}) {
  const [difficulty, setDifficulty] = useState('medium');
  // Item 80: "Semua" used to persist the deck's own size, so the number carried
  // into another mode as a fixed count that meant nothing there. It is the
  // QUIZ_COUNT_ALL sentinel now, resolved against whatever this session's pool
  // actually holds.
  const [quizCountPref, setQuizCountPref] = useState(
    () => storageGet('prefs')?.quizQuestionCount ?? 10
  );
  const [lemahMode, setLemahMode] = useState(false);
  // Item 80: a preference, not a per-session choice — `wayground` and `vocab`
  // render the same QuizShell from a screen with nowhere to put this picker.
  const [autoNextDelay, setAutoNextDelay] = useState(storedAutoNextDelay);
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
  //
  // Through the hook, not inline. This file has no useEffect, so the inline
  // version could not loop here the way it did in FlashcardMode and SprintMode
  // -- but it is the same landmine, one added effect from being the same bug,
  // and it also costs a wasted `availableCats` recompute on every render.
  const baseCards = useScopedDeck(cards, filterIds);

  const lemahCards = baseCards
    .filter((c) => getWrongCount(quizWrong[c.id]) > 0)
    .sort((a, b) => getWrongCount(quizWrong[b.id]) - getWrongCount(quizWrong[a.id]));

  const activeCards = lemahMode && lemahCards.length > 0 ? lemahCards : baseCards;

  // Category filter.
  const [selectedCat, setSelectedCat] = useState('all');
  // Shaped for CategoryPicker, which owns the `all` entry — this used to be a
  // list of bare keys with the meta looked up again at render time.
  const availableCats = useMemo(() => {
    const catKeys = new Set(baseCards.map((c) => c.category));
    return CATEGORIES.filter((c) => c.key !== 'all' && catKeys.has(c.key)).map((c) => ({
      key: c.key,
      label: c.label,
      emoji: c.emoji,
    }));
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
    const quizCount = resolveQuizCount(quizCountPref, catFilteredCards.length);
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
    const pillStyle = (on) => sharedPill(on, 'md');

    return (
      <div
        className={`${S.pageFade} ${S.setupPage}`}
        style={{ padding: 'var(--space-24) var(--space-16)' }}
      >
        <div className={S.rowSpread} style={{ marginBottom: 'var(--space-16)' }}>
          <button
            style={{
              fontFamily: 'inherit',
              fontSize: 'var(--fs-caption)',
              padding: 'var(--space-6) var(--space-12)',
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

        {resumeData && (
          <div
            style={{
              background: T.surfaceActive,
              border: `1.5px solid ${T.borderActive}`,
              borderRadius: T.r.md,
              padding: 'var(--space-14) var(--space-16)',
              marginBottom: 'var(--space-16)',
            }}
          >
            <div
              style={{
                fontSize: 'var(--fs-caption)',
                fontWeight: 700,
                color: T.text,
                marginBottom: 'var(--space-4)',
              }}
            >
              Lanjutkan kuis sebelumnya?
            </div>
            <div
              style={{
                fontSize: 'var(--fs-caption)',
                color: T.textMuted,
                marginBottom: 'var(--space-10)',
              }}
            >
              Soal {resumeData.progress.qIdx + 1} dari {resumeData.questions.length}, terjawab{' '}
              {resumeData.progress.results.length}.
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-8)' }}>
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
          {formatCount(catFilteredCards.length)} kartu tersedia {lemahMode ? '(mode lemah)' : ''}
          {selectedCat !== 'all' ? ` · ${selectedCat}` : ''}
        </p>

        <div className={S.sectionLabel}>Jumlah Soal</div>
        <div
          style={{
            display: 'flex',
            gap: 'var(--space-8)',
            marginBottom: 'var(--space-20)',
            flexWrap: 'wrap',
          }}
        >
          {[...QUIZ_COUNTS, QUIZ_COUNT_ALL].map((n) => {
            const label = n === QUIZ_COUNT_ALL ? `Semua (${catFilteredCards.length})` : String(n);
            return (
              <button
                key={n}
                onClick={() => {
                  setQuizCountPref(n);
                  // Persist count choice.
                  import('../storage/engine.js').then(({ set: storageSet }) => {
                    const prefs = storageGet('prefs') ?? {};
                    storageSet('prefs', { ...prefs, quizQuestionCount: n });
                  });
                }}
                style={pillStyle(quizCountPref === n)}
              >
                {label}
              </button>
            );
          })}
        </div>

        <div className={S.sectionLabel}>Tingkat Kesulitan</div>
        <div className={S.list} style={{ marginBottom: 'var(--space-20)' }}>
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
                    padding: 'var(--space-4) var(--space-12) var(--space-8)',
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
          <div
            className={S.card}
            style={{ marginBottom: 'var(--space-20)', animation: 'fadeIn 0.15s ease' }}
          >
            {lemahCards.length > 0 && (
              <div className={S.rowSpread} style={{ marginBottom: 'var(--space-12)' }}>
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
                    padding: 'var(--space-6) var(--space-14)',
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
                  marginBottom: 'var(--space-8)',
                }}
              >
                Lanjut otomatis
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-6)', flexWrap: 'wrap' }}>
                {AUTO_NEXT_DELAYS.map((d) => (
                  <button
                    key={d.ms}
                    onClick={() => {
                      setAutoNextDelay(d.ms);
                      saveAutoNextDelay(d.ms);
                    }}
                    style={pillStyle(autoNextDelay === d.ms)}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
            {/* Item 77: was a third hand-rolled copy of the same picker. */}
            <div style={{ marginTop: 'var(--space-12)' }}>
              <CategoryPicker
                cats={availableCats}
                value={selectedCat}
                onChange={setSelectedCat}
                label="Filter Kategori"
              />
            </div>
          </div>
        )}

        <div className={S.setupCta}>
          <button
            className={S.btnPrimary}
            style={{ width: '100%', fontSize: 'var(--fs-subtitle)', padding: 'var(--space-16)' }}
            onClick={startQuiz}
          >
            Mulai Kuis 🚀
          </button>
        </div>
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
