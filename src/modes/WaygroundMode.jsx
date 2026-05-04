import { useState, useMemo, useCallback } from 'react';
import { T } from '../styles/theme.js';
import { shuffle } from '../utils/shuffle.js';
import { makeWrongEntry } from '../utils/wrong-tracker.js';
import { usePersistedState } from '../hooks/usePersistedState.js';
import { stripFuri, standardizeFuri } from '../utils/jp-helpers.js';
import { WAYGROUND_SETS } from '../data/wayground-sets.js';
import { CSV_SETS } from '../data/csv-sets.js';
import QuizShell from '../components/QuizShell.jsx';
import S from './modes.module.css';

const TEORI_PRAKTIK = [...WAYGROUND_SETS.filter((s) => !s.id.startsWith('wg')), ...CSV_SETS];
const GROUPS = [
  { label: 'Teori', icon: '📋', color: '#f97316', prefix: 'wt' },
  { label: 'Praktik', icon: '🛠️', color: '#4ade80', prefix: 'wp' },
  { label: 'CSV Teori', icon: '📚', color: '#f59e0b', prefix: 'ct' },
  { label: 'CSV Praktik', icon: '🔧', color: '#34d399', prefix: 'cp' },
];

export default function WaygroundMode({ onExit, onSessionEnd }) {
  const [activeSet, setActiveSet] = useState(null);
  const [showFuri, setShowFuri] = useState(true);
  const [showHint, setShowHint] = useState(true);
  const [wgScores, setWgScores] = usePersistedState('ssw-wg-scores', {});

  const set = TEORI_PRAKTIK.find((s) => s.id === activeSet);

  const questions = useMemo(() => {
    if (!set) return [];
    return shuffle(set.questions).map((q) => ({
      question: showFuri ? standardizeFuri(q.q) : stripFuri(q.q),
      hint: showHint ? q.hint : null,
      options: q.opts.map((opt, i) => ({ text: showFuri ? standardizeFuri(opt) : stripFuri(opt), sub: q.opts_id?.[i] || null })),
      correctIdx: q.ans, explanation: q.exp, _qId: `${set.id}-${q.id}`,
    }));
  }, [set, showFuri, showHint]);

  const [_wrongCounts, setWrongCounts] = usePersistedState(activeSet ? `ssw-wg-wrong-${activeSet}` : 'ssw-wg-temp', {});

  const handleAnswer = useCallback((qIdx, _selIdx, isCorrect) => {
    if (!isCorrect && set) { const qId = questions[qIdx]?._qId; if (qId) setWrongCounts((w) => ({ ...w, [qId]: makeWrongEntry(w[qId]) })); }
  }, [questions, set, setWrongCounts]);

  const handleFinish = useCallback(({ correct, total, maxStreak }) => {
    if (!activeSet) return;
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
    setWgScores((s) => ({ ...s, [activeSet]: { score: correct, total, pct, maxStreak, date: Date.now() } }));
    onSessionEnd?.({ correct, total });
  }, [activeSet, setWgScores, onSessionEnd]);

  if (activeSet) {
    return <QuizShell questions={questions} onExit={() => setActiveSet(null)} title={set?.title || ''} onAnswer={handleAnswer} onFinish={handleFinish} showHint={showHint} accentColor={set?.color || T.amber} />;
  }

  const totalSoal = TEORI_PRAKTIK.reduce((n, s) => n + s.questions.length, 0);
  const groups = GROUPS.map((g) => ({ ...g, sets: TEORI_PRAKTIK.filter((s) => s.id.startsWith(g.prefix)) })).filter((g) => g.sets.length > 0);

  const pillStyle = (active) => ({ fontFamily: 'inherit', fontSize: 11, padding: '6px 12px', borderRadius: T.r.pill, cursor: 'pointer', background: active ? 'rgba(251,191,36,0.15)' : T.surface, border: `1px solid ${active ? 'rgba(251,191,36,0.4)' : T.border}`, color: active ? T.gold : T.textMuted });

  return (
    <div className={S.page}>
      <button className={S.btnBack} onClick={onExit}>← Kembali</button>
      <h2 className={S.pageTitle}>Soal Teknis · Lifeline</h2>
      <p className={S.pageSub}>{totalSoal} soal dalam {TEORI_PRAKTIK.length} set · Teori &amp; Praktik</p>

      <div className={S.row} style={{ marginBottom: 20 }}>
        {[{ label: `ふり ${showFuri ? 'ON' : 'OFF'}`, active: showFuri, onClick: () => setShowFuri((f) => !f) },
          { label: `💡 ${showHint ? 'ON' : 'OFF'}`, active: showHint, onClick: () => setShowHint((f) => !f) }
        ].map((btn) => <button key={btn.label} onClick={btn.onClick} style={pillStyle(btn.active)}>{btn.label}</button>)}
      </div>

      {groups.map((g) => (
        <div key={g.label} style={{ marginBottom: 20 }}>
          <div className={S.row} style={{ marginBottom: 8 }}>
            <span style={{ fontSize: 13 }}>{g.icon}</span>
            <span style={{ fontSize: 10, fontWeight: 800, color: g.color, letterSpacing: 1.8, textTransform: 'uppercase' }}>{g.label}</span>
            <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg,${g.color}30,transparent)` }} />
            <span className={S.pill} style={{ fontSize: 10, color: T.textDim, background: T.surface, border: `1px solid ${T.border}`, fontWeight: 700 }}>{g.sets.length} set</span>
          </div>
          <div className={S.list}>
            {g.sets.map((s) => {
              const saved = wgScores[s.id];
              return (
                <button key={s.id} className={S.btnItem} onClick={() => setActiveSet(s.id)} style={{ paddingLeft: 18, position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: s.color || g.color }} />
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
      ))}

      <div style={{ marginTop: 8, marginBottom: 8 }}>
        <div className={S.row} style={{ marginBottom: 8 }}>
          <span style={{ fontSize: 13 }}>🚧</span>
          <span style={{ fontSize: 10, fontWeight: 800, color: T.textDim, letterSpacing: 1.8, textTransform: 'uppercase' }}>Segera Hadir</span>
          <div style={{ flex: 1, height: 1, background: T.border }} />
        </div>
        <div className={S.list}>
          {[{ emoji: '⛏️', label: 'Doboku · Sipil (土木)', sub: '土木施工 — Belum tersedia' },
            { emoji: '🏗️', label: 'Kenchiku · Bangunan (建築)', sub: '建築施工 — Belum tersedia' }
          ].map((item) => (
            <div key={item.label} style={{ padding: '12px 14px 12px 18px', borderRadius: T.r.md, background: T.surface, border: `1px dashed ${T.border}`, opacity: 0.5, position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: T.border }} />
              <div className={S.rowSpread}>
                <span style={{ fontSize: 13, fontWeight: 700, color: T.textMuted }}>{item.emoji} {item.label}</span>
                <span style={{ fontSize: 9, fontWeight: 800, color: T.textDim, background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.r.pill, padding: '2px 8px', letterSpacing: 1 }}>COMING SOON</span>
              </div>
              <div style={{ fontSize: 11, color: T.textDim, marginTop: 4, fontFamily: T.fontJP }}>{item.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
