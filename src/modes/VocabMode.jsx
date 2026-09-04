import { useState, useMemo, useCallback } from 'react';
import { T } from '../styles/theme.js';
import { shuffle } from '../utils/shuffle.js';
import { makeWrongEntry } from '../utils/wrong-tracker.js';
import { get, set as storageSet } from '../storage/engine.js';
import { stripFuri } from '../utils/jp-helpers.js';
import { renderJPWithRuby, parseRubyFragments } from '../components/JpDisplay.jsx';
import { isVocabId } from '../utils/quiz-classification.js';
import { useApp } from '../contexts/AppContext.jsx';
import { useProgress } from '../contexts/ProgressContext.jsx';
import { QUIZ_SETS } from '../data/quiz-sets.js';
import QuizShell from '../components/QuizShell.jsx';
import ResumePrompt from '../components/ResumePrompt.jsx';
import { useQuizResume } from '../hooks/useQuizResume.js';
import S from './modes.module.css';

// VOCAB_SETS and MIX_ALL computed inside component — track-filtered
const MIX_ALL_ID = '__vocab_mix__';

export default function VocabMode({ onSessionEnd, audioEnabled = false }) {
  const { track } = useApp();
  // Scoped to wglv-* specifically, not a plain 'wg' prefix -- that also
  // matches wgl01..wgl10 (JAC-style "Praktik Set" questions, unrelated to
  // vocab drilling), which used to get counted/mixed in here by mistake.
  // Those sets now live in WaygroundMode ("Soal Teknis") instead, grouped
  // with the rest of its Praktik content -- see that file's GROUPS comment.
  const VOCAB_SETS = useMemo(
    () => QUIZ_SETS.filter((s) => isVocabId(s.id) && (s.track === 'common' || s.track === track)),
    [track]
  );
  const totalSoal = VOCAB_SETS.reduce((n, s) => n + s.questions.length, 0);
  const MIX_ALL = {
    id: MIX_ALL_ID,
    title: `Mix All · ${totalSoal}qs`,
    subtitle: '全語彙セット — semua vocab acak',
    emoji: '🔀',
    color: '#a78bfa',
  };
  const [activeSet, setActiveSet] = useState(null);
  const [questions, setQuestions] = useState([]);

  const [showHint, setShowHint] = useState(true);
  const { saveScore, vocabScores: scores } = useProgress();

  const setDef = activeSet === MIX_ALL_ID ? MIX_ALL : VOCAB_SETS.find((s) => s.id === activeSet);

  const { resumeData, progressKey, beginSession, clear, dismiss } = useQuizResume('ssw-vocab');
  const [restored, setRestored] = useState(null);

  // Drawn once when a set is opened and held in state. This mode's memo did not
  // have WaygroundMode's re-shuffle bug (its wrong-count state was never a
  // dependency), but a resumable session needs the exact list it started with:
  // restoring "question 7 of 40" against a re-shuffled 40 is the wrong question.
  const openSet = useCallback(
    (setId) => {
      const def = setId === MIX_ALL_ID ? MIX_ALL : VOCAB_SETS.find((x) => x.id === setId);
      const qs =
        setId === MIX_ALL_ID
          ? shuffle(VOCAB_SETS.flatMap((x) => x.questions.map((q) => ({ ...q, _set: x.id }))))
          : shuffle(def?.questions ?? []);
      const drawn = qs.map((q) => ({
        question: q.q,
        hint: showHint ? q.hint : null,
        options: q.opts.map((opt, i) => ({
          text: stripFuri(opt),
          sub: q.opts_id?.[i] || null,
        })),
        correctIdx: q.ans,
        explanation: q.exp,
        _qId: `${setId}-${q.id}`,
      }));
      setQuestions(drawn);
      setActiveSet(setId);
      setRestored(null);
      clear();
      beginSession(drawn, { setId });
    },
    // MIX_ALL is rebuilt every render but only its id and questions are read,
    // both of which are derived from VOCAB_SETS.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [VOCAB_SETS, showHint, clear, beginSession]
  );

  const handleResume = useCallback(() => {
    if (!resumeData) return;
    setQuestions(resumeData.questions);
    setActiveSet(resumeData.meta?.setId ?? null);
    setRestored(resumeData.progress);
    dismiss();
  }, [resumeData, dismiss]);

  const [_wrongCounts, setWrongCounts] = useState(() => get('progress')?.vocabWrong ?? {});

  const handleAnswer = useCallback(
    (qIdx, _selIdx, isCorrect) => {
      if (!isCorrect && activeSet) {
        const qId = questions[qIdx]?._qId;
        if (qId) {
          setWrongCounts((prev) => {
            const updated = { ...prev, [qId]: makeWrongEntry(prev[qId]) };
            storageSet('progress', (p) => ({ ...p, vocabWrong: updated }));
            return updated;
          });
        }
      }
    },
    [questions, activeSet]
  );

  const handleFinish = useCallback(
    ({ correct, total, maxStreak, durationMs = 0 }) => {
      clear(); // QuizShell clears its own progress key; the question list is ours
      if (!activeSet) return;
      const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
      saveScore('vocab', activeSet, { score: correct, total, pct, maxStreak, date: Date.now() });
      onSessionEnd?.({ correct, total, durationMs });
    },
    [activeSet, saveScore, onSessionEnd, clear]
  );

  if (activeSet) {
    return (
      <QuizShell
        questions={questions}
        onExit={() => {
          setActiveSet(null);
          setQuestions([]);
          setRestored(null);
        }}
        title={setDef?.title || ''}
        onAnswer={handleAnswer}
        onFinish={handleFinish}
        // No onRetryWrong: QuizShell can only offer that button when its
        // results carry a _cardId, and not one of QUIZ_SETS' 980 questions has
        // a related card id (JAC_OFFICIAL's 95 all do -- see JACMode). Passing
        // the prop looked like the feature worked here; it has never been able
        // to fire. Restoring it is a content job (linking vocab questions to
        // cards), not a wiring one.
        showHint={showHint}
        accentColor={setDef?.color || T.amber}
        audioEnabled={audioEnabled}
        persistKey={progressKey}
        initialQIdx={restored?.qIdx ?? 0}
        initialSelected={restored?.selected ?? null}
        initialResults={restored?.results ?? []}
      />
    );
  }

  return (
    <div className={S.page}>
      <p className={S.pageSub}>
        {totalSoal} soal dalam {VOCAB_SETS.length} set · 語彙JP↔ID
      </p>

      {resumeData && (
        <ResumePrompt
          title="Lanjutkan set vocab sebelumnya?"
          detail={`Soal ${(resumeData.progress.qIdx ?? 0) + 1} dari ${resumeData.questions.length}, terjawab ${resumeData.progress.results?.length ?? 0}.`}
          onResume={handleResume}
          onDiscard={clear}
        />
      )}

      <div className={S.row} style={{ marginBottom: 'var(--space-20)' }}>
        {[
          {
            label: `💡 ${showHint ? 'ON' : 'OFF'}`,
            active: showHint,
            onClick: () => setShowHint((f) => !f),
          },
        ].map((btn) => (
          <button
            key={btn.label}
            onClick={btn.onClick}
            style={{
              fontFamily: 'inherit',
              fontSize: 'var(--fs-small)',
              padding: 'var(--space-6) var(--space-12)',
              borderRadius: T.r.pill,
              cursor: 'pointer',
              background: btn.active ? 'rgba(167,139,250,0.15)' : T.surface,
              border: `1px solid ${btn.active ? 'rgba(167,139,250,0.4)' : T.border}`,
              color: btn.active ? '#a78bfa' : T.textMuted,
            }}
          >
            {btn.label}
          </button>
        ))}
      </div>

      <button
        className={S.btnItem}
        onClick={() => openSet(MIX_ALL_ID)}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 'var(--space-20)',
          background: 'linear-gradient(135deg,rgba(109,40,217,0.15),rgba(167,139,250,0.1))',
          border: '1px solid rgba(167,139,250,0.35)',
        }}
      >
        <div>
          <div style={{ fontSize: '0.875rem', fontWeight: 700 }}>🔀 Mix All Vocab</div>
          <div
            style={{ fontSize: 'var(--fs-small)', color: T.textDim, marginTop: 'var(--space-2)' }}
          >
            Semua {totalSoal} soal diacak — latihan komprehensif
          </div>
        </div>
        <span style={{ fontSize: 'var(--fs-small)', color: '#a78bfa', fontWeight: 700 }}>
          {totalSoal}q →
        </span>
      </button>

      <div style={{ marginBottom: 'var(--space-8)' }}>
        <div className={S.row} style={{ marginBottom: 'var(--space-10)' }}>
          <span style={{ fontSize: 'var(--fs-body)' }}>📖</span>
          <span
            style={{
              fontSize: 'var(--fs-micro)',
              fontWeight: 800,
              color: '#60a5fa',
              letterSpacing: 1.8,
              textTransform: 'uppercase',
            }}
          >
            Per Set
          </span>
          <div
            style={{
              flex: 1,
              height: 1,
              background: 'linear-gradient(90deg,rgba(96,165,250,0.3),transparent)',
            }}
          />
          <span
            className={S.pill}
            style={{
              fontSize: 'var(--fs-micro)',
              color: T.textDim,
              background: T.surface,
              border: `1px solid ${T.border}`,
              fontWeight: 700,
            }}
          >
            {VOCAB_SETS.length} set
          </span>
        </div>
        <div className={S.list}>
          {VOCAB_SETS.map((s) => {
            const saved = scores[s.id];
            return (
              <button
                key={s.id}
                className={S.btnItem}
                onClick={() => openSet(s.id)}
                style={{ paddingLeft: 'var(--space-16)', position: 'relative', overflow: 'hidden' }}
              >
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 4,
                    background: s.color || '#60a5fa',
                  }}
                />
                <div className={S.rowSpread}>
                  <span style={{ fontSize: 'var(--fs-body)', fontWeight: 700 }}>
                    {s.emoji} {s.title}
                  </span>
                  <div className={S.row} style={{ gap: 'var(--space-8)' }}>
                    {saved && (
                      <span
                        style={{
                          fontSize: 'var(--fs-small)',
                          fontWeight: 700,
                          color: saved.pct >= 70 ? T.correct : saved.pct >= 50 ? T.amber : T.wrong,
                        }}
                      >
                        {saved.pct}%{saved.maxStreak > 1 ? ` 🔥${saved.maxStreak}` : ''}
                      </span>
                    )}
                    <span style={{ fontSize: 'var(--fs-small)', color: T.textDim }}>
                      {s.questions.length}q
                    </span>
                  </div>
                </div>
                {s.subtitle && (
                  <div
                    style={{
                      fontSize: 'var(--fs-small)',
                      color: T.textDim,
                      marginTop: 'var(--space-4)',
                      fontFamily: T.fontJP,
                    }}
                  >
                    {renderJPWithRuby(s.subtitle, parseRubyFragments(s.subtitle))}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
