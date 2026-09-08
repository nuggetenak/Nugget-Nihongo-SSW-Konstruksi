import { useState, useMemo, useCallback } from 'react';
import { T } from '../styles/theme.js';
import { shuffle, shuffleOptions } from '../utils/shuffle.js';
import { makeWrongEntry, getWrongCount } from '../utils/wrong-tracker.js';
import { get, set as storageSet } from '../storage/engine.js';
import { stripFuri } from '../utils/jp-helpers.js';
import { renderJPWithRuby, parseRubyFragments } from '../components/JpDisplay.jsx';
import { isVocabId } from '../utils/quiz-classification.js';
import { useApp } from '../contexts/AppContext.jsx';
import { storedAutoNextDelay } from '../utils/auto-next.js';
import { useProgress } from '../contexts/ProgressContext.jsx';
import { QUIZ_SETS } from '../data/quiz-sets.js';
import QuizShell from '../components/QuizShell.jsx';
import ResumePrompt from '../components/ResumePrompt.jsx';
import { useQuizResume } from '../hooks/useQuizResume.js';
import S from './modes.module.css';

// VOCAB_SETS and MIX_ALL computed inside component — track-filtered
const MIX_ALL_ID = '__vocab_mix__';

// Item 79: VocabMode writes progress.vocabWrong keyed `${setId}-${q.id}` —
// byte-for-byte the shape WaygroundMode writes to progress.wgWrong, and
// WaygroundMode has offered "⚠ Ulang N salah" per set all along. The store was
// here; the way back into it was not.
function getSetWrongCount(setId, questions) {
  const vocabWrong = get('progress')?.vocabWrong ?? {};
  return questions.filter((q) => getWrongCount(vocabWrong[`${setId}-${q.id}`]) > 0).length;
}

export default function VocabMode({ onSessionEnd, onRetryWrong, audioEnabled = false }) {
  const { track } = useApp();
  // Item 80: same shell, same shape of screen, same preference — see WaygroundMode.
  const [autoNextDelay] = useState(storedAutoNextDelay);
  const [lemahMode, setLemahMode] = useState(false);
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
    (setId, lemah = false) => {
      const def = setId === MIX_ALL_ID ? MIX_ALL : VOCAB_SETS.find((x) => x.id === setId);
      let pool =
        setId === MIX_ALL_ID
          ? VOCAB_SETS.flatMap((x) => x.questions.map((q) => ({ ...q, _set: x.id })))
          : (def?.questions ?? []);
      if (lemah) {
        // The id a question is stored under is the one it was answered under —
        // for Mix All that is its own set's id, not MIX_ALL_ID.
        const vocabWrong = get('progress')?.vocabWrong ?? {};
        pool = pool.filter((q) => getWrongCount(vocabWrong[`${q._set ?? setId}-${q.id}`]) > 0);
      }
      const qs = shuffle(pool);
      const drawn = qs.map((q) => {
        // Shuffled at the draw point, once per session -- see shuffleOptions.
        const { options, correctIdx } = shuffleOptions(
          q.opts.map((opt, i) => ({
            text: stripFuri(opt),
            sub: q.opts_id?.[i] || null,
          })),
          q.ans
        );
        return {
          question: q.q,
          hint: showHint ? q.hint : null,
          options,
          correctIdx,
          explanation: q.exp,
          _cardId: typeof q.related_card_id === 'number' ? q.related_card_id : null,
          _qId: `${q._set ?? setId}-${q.id}`,
        };
      });
      setQuestions(drawn);
      setActiveSet(setId);
      setLemahMode(lemah);
      setRestored(null);
      clear();
      beginSession(drawn, { setId, lemah });
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
    setLemahMode(!!resumeData.meta?.lemah);
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
      // A wrong-only run is a re-drill of a subset, so scoring it would
      // overwrite the set's real result with a number from a different exam —
      // the same reason WaygroundMode skips saveScore in lemah mode.
      if (!lemahMode)
        saveScore('vocab', activeSet, { score: correct, total, pct, maxStreak, date: Date.now() });
      onSessionEnd?.({ correct, total, durationMs });
    },
    [activeSet, lemahMode, saveScore, onSessionEnd, clear]
  );

  if (activeSet) {
    return (
      <QuizShell
        questions={questions}
        onExit={() => {
          setActiveSet(null);
          setLemahMode(false);
          setQuestions([]);
          setRestored(null);
        }}
        title={lemahMode ? `⚠ ${setDef?.title || ''} · Salah` : setDef?.title || ''}
        onAnswer={handleAnswer}
        onFinish={handleFinish}
        // Item 96 landed the content job this was waiting on: 305 of the 980
        // QUIZ_SETS questions now carry a related card id, so the button can
        // finally assemble a deck. It still shows only when the questions you
        // got wrong are among the linked ones -- QuizShell filters on _cardId
        // rather than offering a button that goes nowhere.
        onRetryWrong={onRetryWrong}
        showHint={showHint}
        accentColor={setDef?.color || T.amber}
        autoNextDelay={autoNextDelay}
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
          <div style={{ fontSize: 'var(--fs-caption)', fontWeight: 700 }}>🔀 Mix All Vocab</div>
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
            const wrongCount = getSetWrongCount(s.id, s.questions);
            return (
              <div key={s.id} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                <button
                  className={S.btnItem}
                  onClick={() => openSet(s.id)}
                  style={{
                    paddingLeft: 'var(--space-16)',
                    position: 'relative',
                    overflow: 'hidden',
                    borderBottomLeftRadius: wrongCount > 0 ? 0 : undefined,
                    borderBottomRightRadius: wrongCount > 0 ? 0 : undefined,
                  }}
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
                            color:
                              saved.pct >= 70 ? T.correct : saved.pct >= 50 ? T.amber : T.wrong,
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
                {/* Item 79: the same sub-button WaygroundMode has had all along,
                  over the same shape of store. */}
                {wrongCount > 0 && (
                  <button
                    onClick={() => openSet(s.id, true)}
                    style={{
                      fontFamily: 'inherit',
                      fontSize: 'var(--fs-small)',
                      padding: 'var(--space-6) var(--space-16)',
                      textAlign: 'left',
                      cursor: 'pointer',
                      background: 'rgba(220,38,38,0.06)',
                      border: '1px solid rgba(220,38,38,0.2)',
                      borderTop: 'none',
                      borderBottomLeftRadius: T.r.md,
                      borderBottomRightRadius: T.r.md,
                      color: T.wrong,
                      fontWeight: 600,
                    }}
                  >
                    ⚠ Ulang {wrongCount} salah
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
