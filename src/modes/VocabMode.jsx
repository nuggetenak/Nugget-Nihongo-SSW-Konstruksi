import { useState, useMemo, useCallback } from 'react';
import { T } from '../styles/theme.js';
import { shuffle } from '../utils/shuffle.js';
import { makeWrongEntry } from '../utils/wrong-tracker.js';
import { usePersistedState } from '../hooks/usePersistedState.js';
import { stripFuri } from '../utils/jp-helpers.js';
import { WAYGROUND_SETS } from '../data/wayground-sets.js';
import QuizShell from '../components/QuizShell.jsx';
import S from './modes.module.css';

const VOCAB_SETS = WAYGROUND_SETS.filter((s) => s.id.startsWith('wg'));
const MIX_ALL_ID = '__vocab_mix__';
const MIX_ALL = {
  id: MIX_ALL_ID,
  title: `Mix All · ${VOCAB_SETS.reduce((n, s) => n + s.questions.length, 0)}qs`,
  subtitle: '全語彙セット — semua vocab acak',
  emoji: '🔀',
  color: '#a78bfa',
};

export default function VocabMode({ onExit }) {
  const [activeSet, setActiveSet] = useState(null);
  const [showFuri, setShowFuri] = useState(true);
  const [showHint, setShowHint] = useState(true);
  const [scores, setScores] = usePersistedState('ssw-vocab-scores', {});

  const setDef = activeSet === MIX_ALL_ID ? MIX_ALL : VOCAB_SETS.find((s) => s.id === activeSet);

  const questions = useMemo(() => {
    if (!activeSet) return [];
    const qs = activeSet === MIX_ALL_ID
      ? shuffle(VOCAB_SETS.flatMap((s) => s.questions.map((q) => ({ ...q, _set: s.id }))))
      : shuffle(setDef?.questions ?? []);
    return qs.map((q) => ({
      question: showFuri ? q.q : stripFuri(q.q),
      hint: showHint ? q.hint : null,
      options: q.opts.map((opt, i) => ({ text: showFuri ? opt : stripFuri(opt), sub: q.opts_id?.[i] || null })),
      correctIdx: q.ans,
      explanation: q.exp,
      _qId: `${activeSet}-${q.id}`,
    }));
  }, [activeSet, setDef, showFuri, showHint]);

  const [_wrongCounts, setWrongCounts] = usePersistedState(
    activeSet ? `ssw-vocab-wrong-${activeSet}` : 'ssw-vocab-temp', {}
  );

  const handleAnswer = useCallback((qIdx, _selIdx, isCorrect) => {
    if (!isCorrect && activeSet) {
      const qId = questions[qIdx]?._qId;
      if (qId) setWrongCounts((w) => ({ ...w, [qId]: makeWrongEntry(w[qId]) }));
    }
  }, [questions, activeSet, setWrongCounts]);

  const handleFinish = useCallback(({ correct, total, maxStreak }) => {
    if (!activeSet) return;
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
    setScores((s) => ({ ...s, [activeSet]: { score: correct, total, pct, maxStreak, date: Date.now() } }));
  }, [activeSet, setScores]);

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

  const totalSoal = VOCAB_SETS.reduce((n, s) => n + s.questions.length, 0);

  return (
    <div className={S.page}>
      <button className={S.btnBack} onClick={onExit}>← Kembali</button>
      <h2 className={S.pageTitle}>Kosakata · Vocab Drill</h2>
      <p className={S.pageSub}>{totalSoal} soal dalam {VOCAB_SETS.length} set · 語彙JP↔ID</p>

      <div className={S.row} style={{ marginBottom: 20 }}>
        {[{ label: `ふり ${showFuri ? 'ON' : 'OFF'}`, active: showFuri, onClick: () => setShowFuri((f) => !f) },
          { label: `💡 ${showHint ? 'ON' : 'OFF'}`, active: showHint, onClick: () => setShowHint((f) => !f) }
        ].map((btn) => (
          <button key={btn.label} onClick={btn.onClick} style={{ fontFamily: 'inherit', fontSize: 11, padding: '6px 12px', borderRadius: T.r.pill, cursor: 'pointer', background: btn.active ? 'rgba(167,139,250,0.15)' : T.surface, border: `1px solid ${btn.active ? 'rgba(167,139,250,0.4)' : T.border}`, color: btn.active ? '#a78bfa' : T.textMuted }}>
            {btn.label}
          </button>
        ))}
      </div>

      <button
        className={S.btnItem}
        onClick={() => setActiveSet(MIX_ALL_ID)}
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, background: 'linear-gradient(135deg,rgba(109,40,217,0.15),rgba(167,139,250,0.1))', border: '1px solid rgba(167,139,250,0.35)' }}
      >
        <div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>🔀 Mix All Vocab</div>
          <div style={{ fontSize: 11, color: T.textDim, marginTop: 2 }}>Semua {totalSoal} soal diacak — latihan komprehensif</div>
        </div>
        <span style={{ fontSize: 11, color: '#a78bfa', fontWeight: 700 }}>{totalSoal}q →</span>
      </button>

      <div style={{ marginBottom: 8 }}>
        <div className={S.row} style={{ marginBottom: 10 }}>
          <span style={{ fontSize: 13 }}>📖</span>
          <span style={{ fontSize: 10, fontWeight: 800, color: '#60a5fa', letterSpacing: 1.8, textTransform: 'uppercase' }}>Per Set</span>
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg,rgba(96,165,250,0.3),transparent)' }} />
          <span className={S.pill} style={{ fontSize: 10, color: T.textDim, background: T.surface, border: `1px solid ${T.border}`, fontWeight: 700 }}>{VOCAB_SETS.length} set</span>
        </div>
        <div className={S.list}>
          {VOCAB_SETS.map((s) => {
            const saved = scores[s.id];
            return (
              <button key={s.id} className={S.btnItem} onClick={() => setActiveSet(s.id)} style={{ paddingLeft: 18, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: s.color || '#60a5fa' }} />
                <div className={S.rowSpread}>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>{s.emoji} {s.title}</span>
                  <div className={S.row} style={{ gap: 8 }}>
                    {saved && <span style={{ fontSize: 11, fontWeight: 700, color: saved.pct >= 70 ? T.correct : saved.pct >= 50 ? T.amber : T.wrong }}>{saved.pct}%{saved.maxStreak > 1 ? ` 🔥${saved.maxStreak}` : ''}</span>}
                    <span style={{ fontSize: 11, color: T.textDim }}>{s.questions.length}q</span>
                  </div>
                </div>
                {s.subtitle && <div style={{ fontSize: 11, color: T.textDim, marginTop: 4, fontFamily: T.fontJP }}>{s.subtitle}</div>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
