import { useState, useMemo, useCallback } from 'react';
import { T } from '../styles/theme.js';
import { shuffle } from '../utils/shuffle.js';
import { makeWrongEntry } from '../utils/wrong-tracker.js';
import { usePersistedState } from '../hooks/usePersistedState.js';
import { stripFuri } from '../utils/jp-helpers.js';
import { WAYGROUND_SETS } from '../data/wayground-sets.js';
import QuizShell from '../components/QuizShell.jsx';

// Only vocab sets (wg prefix)
const VOCAB_SETS = WAYGROUND_SETS.filter((s) => s.id.startsWith('wg'));

// "Mix All" meta-set — combine all vocab questions, re-number IDs
const MIX_ALL_ID = '__vocab_mix__';
const MIX_ALL = {
  id: MIX_ALL_ID,
  title: `Mix All · ${VOCAB_SETS.reduce((n, s) => n + s.questions.length, 0)}qs`,
  subtitle: '全語彙セット — semua vocab acak',
  emoji: '🔀',
  color: '#a78bfa',
  grad: 'linear-gradient(135deg,#1e1b4b,#6d28d9)',
};

export default function VocabMode({ onExit }) {
  const [activeSet, setActiveSet] = useState(null);
  const [showFuri, setShowFuri] = useState(true);
  const [showHint, setShowHint] = useState(true);
  const [scores, setScores] = usePersistedState('ssw-vocab-scores', {});

  const setDef = activeSet === MIX_ALL_ID ? MIX_ALL : VOCAB_SETS.find((s) => s.id === activeSet);

  const questions = useMemo(() => {
    if (!activeSet) return [];
    let qs;
    if (activeSet === MIX_ALL_ID) {
      qs = shuffle(VOCAB_SETS.flatMap((s) => s.questions.map((q) => ({ ...q, _set: s.id }))));
    } else {
      qs = shuffle(setDef?.questions ?? []);
    }
    return qs.map((q) => ({
      question: showFuri ? q.q : stripFuri(q.q),
      questionSub: null,
      hint: showHint ? q.hint : null,
      options: q.opts.map((opt, i) => ({
        text: showFuri ? opt : stripFuri(opt),
        sub: q.opts_id?.[i] || null,
      })),
      correctIdx: q.ans,
      explanation: q.exp,
      _qId: `${activeSet}-${q.id}`,
    }));
  }, [activeSet, setDef, showFuri, showHint]);

  const [_wrongCounts, setWrongCounts] = usePersistedState(
    activeSet ? `ssw-vocab-wrong-${activeSet}` : 'ssw-vocab-temp',
    {}
  );

  const handleAnswer = useCallback(
    (qIdx, _selIdx, isCorrect) => {
      if (!isCorrect && activeSet) {
        const qId = questions[qIdx]?._qId;
        if (qId) setWrongCounts((w) => ({ ...w, [qId]: makeWrongEntry(w[qId]) }));
      }
    },
    [questions, activeSet, setWrongCounts]
  );

  const handleFinish = useCallback(
    ({ correct, total, maxStreak }) => {
      if (!activeSet) return;
      const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
      setScores((s) => ({
        ...s,
        [activeSet]: { score: correct, total, pct, maxStreak, date: Date.now() },
      }));
    },
    [activeSet, setScores]
  );

  // ─── Quiz ─────────────────────────────────────────────────────────────────
  if (activeSet) {
    return (
      <QuizShell
        questions={questions}
        onExit={() => setActiveSet(null)}
        title={setDef?.title || ''}
        onAnswer={handleAnswer}
        onFinish={handleFinish}
        showHint={showHint}
        accentColor={setDef?.color || T.amber}
      />
    );
  }

  // ─── Set Picker ───────────────────────────────────────────────────────────
  const totalSoal = VOCAB_SETS.reduce((n, s) => n + s.questions.length, 0);

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
      <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>Kosakata · Vocab Drill</h2>
      <p style={{ fontSize: 13, color: T.textMuted, marginBottom: 16 }}>
        {totalSoal} soal dalam {VOCAB_SETS.length} set · 語彙JP↔ID
      </p>

      {/* Toggles */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[
          {
            label: `ふり ${showFuri ? 'ON' : 'OFF'}`,
            active: showFuri,
            onClick: () => setShowFuri((f) => !f),
          },
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
              fontSize: 11,
              padding: '6px 12px',
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

      {/* Mix All button */}
      <button
        onClick={() => setActiveSet(MIX_ALL_ID)}
        style={{
          fontFamily: 'inherit',
          width: '100%',
          padding: '14px 18px',
          borderRadius: T.r.md,
          cursor: 'pointer',
          background: 'linear-gradient(135deg,rgba(109,40,217,0.15),rgba(167,139,250,0.1))',
          border: '1px solid rgba(167,139,250,0.35)',
          color: T.text,
          textAlign: 'left',
          marginBottom: 20,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>🔀 Mix All Vocab</div>
          <div style={{ fontSize: 11, color: T.textDim, marginTop: 2 }}>
            Semua {totalSoal} soal diacak — latihan komprehensif
          </div>
        </div>
        <span style={{ fontSize: 11, color: '#a78bfa', fontWeight: 700 }}>{totalSoal}q →</span>
      </button>

      {/* Individual sets */}
      <div style={{ marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 13 }}>📖</span>
          <span
            style={{
              fontSize: 10,
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
            style={{
              fontSize: 10,
              color: T.textDim,
              background: T.surface,
              border: `1px solid ${T.border}`,
              borderRadius: T.r.pill,
              padding: '2px 8px',
              fontWeight: 700,
            }}
          >
            {VOCAB_SETS.length} set
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {VOCAB_SETS.map((s) => {
            const saved = scores[s.id];
            return (
              <button
                key={s.id}
                onClick={() => setActiveSet(s.id)}
                style={{
                  fontFamily: 'inherit',
                  padding: '12px 14px 12px 18px',
                  borderRadius: T.r.md,
                  cursor: 'pointer',
                  background: T.surface,
                  border: `1px solid ${T.border}`,
                  color: T.text,
                  textAlign: 'left',
                  position: 'relative',
                  overflow: 'hidden',
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
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <span style={{ fontSize: 13, fontWeight: 700 }}>
                    {s.emoji} {s.title}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {saved && (
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: saved.pct >= 70 ? T.correct : saved.pct >= 50 ? T.amber : T.wrong,
                        }}
                      >
                        {saved.pct}%{saved.maxStreak > 1 ? ` 🔥${saved.maxStreak}` : ''}
                      </span>
                    )}
                    <span style={{ fontSize: 11, color: T.textDim }}>{s.questions.length}q</span>
                  </div>
                </div>
                {s.subtitle && (
                  <div
                    style={{ fontSize: 11, color: T.textDim, marginTop: 4, fontFamily: T.fontJP }}
                  >
                    {s.subtitle}
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
