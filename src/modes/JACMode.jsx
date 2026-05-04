import { useState, useMemo, useCallback } from 'react';
import { T } from '../styles/theme.js';
import { shuffle } from '../utils/shuffle.js';
import { makeWrongEntry, getWrongCount } from '../utils/wrong-tracker.js';
import { usePersistedState } from '../hooks/usePersistedState.js';
import { stripFuri, extractReadings } from '../utils/jp-helpers.js';
import { JAC_OFFICIAL } from '../data/jac-official.js';
import QuizShell from '../components/QuizShell.jsx';
import S from './modes.module.css';

const SETS = [
  { key: 'all', label: 'Semua Set', icon: '📋' },
  { key: 'tt1', label: '学科 Set 1', icon: '📝' },
  { key: 'tt2', label: '学科 Set 2', icon: '📝' },
  { key: 'st1', label: '実技 Set 1', icon: '🔧' },
  { key: 'st2', label: '実技 Set 2', icon: '🔧' },
];
const SET_COUNT = { all: JAC_OFFICIAL.length, tt1: JAC_OFFICIAL.filter((q) => q.set === 'tt1').length, tt2: JAC_OFFICIAL.filter((q) => q.set === 'tt2').length, st1: JAC_OFFICIAL.filter((q) => q.set === 'st1').length, st2: JAC_OFFICIAL.filter((q) => q.set === 'st2').length };
const DELAYS = [{ ms: 1000, label: '1s' }, { ms: 1500, label: '1.5s' }, { ms: 2000, label: '2s' }, { ms: 0, label: 'Manual' }];

export default function JACMode({ onExit, onSessionEnd, audioEnabled = false }) {
  const [setKey, setSetKey] = useState(null);
  const [wrongCounts, setWrongCounts] = usePersistedState('ssw-wrong-counts', {});
  const [jacScores, setJacScores] = usePersistedState('ssw-jac-scores', {});
  const [showFuri, setShowFuri] = useState(true);
  const [showID, setShowID] = useState(true);
  const [autoDelay, setAutoDelay] = useState(2000);

  const lemahCount = JAC_OFFICIAL.filter((q) => getWrongCount(wrongCounts[q.id]) > 0).length;

  const filtered = useMemo(() => {
    if (!setKey) return [];
    if (setKey === 'lemah') return [...JAC_OFFICIAL].filter((q) => getWrongCount(wrongCounts[q.id]) > 0).sort((a, b) => getWrongCount(wrongCounts[b.id]) - getWrongCount(wrongCounts[a.id]));
    return shuffle(setKey === 'all' ? JAC_OFFICIAL : JAC_OFFICIAL.filter((q) => q.set === setKey));
  }, [setKey, wrongCounts]);

  const questions = useMemo(() => filtered.map((q) => {
    const reading = showFuri ? extractReadings(q.jp) : null;
    return { question: showFuri ? q.jp : stripFuri(q.jp), questionSub: showID ? q.id_text : reading || null, options: q.options.map((opt) => ({ text: showFuri ? opt : stripFuri(opt), sub: null })), correctIdx: q.answer, explanation: q.explanation, hint: q.hasPhoto ? `📷 ${q.photoDesc || 'Soal ini aslinya pakai foto'}` : null, _qId: q.id };
  }), [filtered, showFuri, showID]);

  const handleAnswer = useCallback((qIdx, _selIdx, isCorrect) => {
    if (!isCorrect) { const qId = filtered[qIdx]?.id; if (qId) setWrongCounts((w) => ({ ...w, [qId]: makeWrongEntry(w[qId]) })); }
  }, [filtered, setWrongCounts]);

  const handleFinish = useCallback(({ correct, total }) => {
    if (!setKey) return;
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
    setJacScores((s) => ({ ...s, [setKey]: { score: correct, total, pct, date: Date.now() } }));
    onSessionEnd?.({ correct, total });
  }, [setKey, setJacScores, onSessionEnd]);

  if (setKey === 'lemah' && filtered.length === 0) {
    return (
      <div className={S.pageCenter}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>💪</div>
        <div className={S.emptyTitle}>Belum ada soal lemah</div>
        <div className={S.emptyDesc}>Kerjakan beberapa soal dulu!</div>
        <button className={S.btnSecondary} onClick={() => setSetKey(null)}>← Kembali</button>
      </div>
    );
  }

  if (setKey !== null) {
    return <QuizShell questions={questions} onExit={() => setSetKey(null)} title="JAC Official" onAnswer={handleAnswer} onFinish={handleFinish} showHint={true} accentColor="#ef4444" autoNextDelay={autoDelay} audioEnabled={audioEnabled} />;
  }

  const pillStyle = (active) => ({ fontFamily: 'inherit', fontSize: 11, padding: '6px 12px', borderRadius: T.r.pill, cursor: 'pointer', background: active ? 'rgba(251,191,36,0.15)' : T.surface, border: `1px solid ${active ? 'rgba(251,191,36,0.4)' : T.border}`, color: active ? T.gold : T.textMuted });

  return (
    <div className={S.page}>
      <button className={S.btnBack} onClick={onExit}>← Kembali</button>
      <h2 className={S.pageTitle}>Soal JAC Official</h2>
      <p className={S.pageSub}>{JAC_OFFICIAL.length} soal dari contoh ujian resmi</p>

      <div className={S.row} style={{ marginBottom: 16, flexWrap: 'wrap' }}>
        {[{ label: `ふり ${showFuri ? 'ON' : 'OFF'}`, active: showFuri, onClick: () => setShowFuri((f) => !f) },
          { label: `ID ${showID ? 'ON' : 'OFF'}`, active: showID, onClick: () => setShowID((f) => !f) }
        ].map((btn) => <button key={btn.label} onClick={btn.onClick} style={pillStyle(btn.active)}>{btn.label}</button>)}
      </div>

      <div style={{ marginBottom: 20 }}>
        <div className={S.sectionLabel}>Lanjut otomatis</div>
        <div className={S.row} style={{ gap: 6 }}>
          {DELAYS.map((d) => (
            <button key={d.ms} onClick={() => setAutoDelay(d.ms)} style={{ fontFamily: 'inherit', fontSize: 11, padding: '5px 10px', borderRadius: T.r.pill, cursor: 'pointer', background: autoDelay === d.ms ? 'rgba(245,158,11,0.15)' : T.surface, border: `1px solid ${autoDelay === d.ms ? T.amber : T.border}`, color: autoDelay === d.ms ? T.amber : T.textMuted, fontWeight: autoDelay === d.ms ? 700 : 400 }}>
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <div className={S.list}>
        {SETS.map((s) => {
          const saved = jacScores[s.key];
          return (
            <button key={s.key} className={S.btnItem} onClick={() => setSetKey(s.key)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{s.icon} {s.label}</span>
              <div className={S.row} style={{ gap: 8 }}>
                {saved && <span style={{ fontSize: 11, fontWeight: 700, color: saved.pct >= 70 ? T.correct : saved.pct >= 50 ? T.amber : T.wrong }}>{saved.pct}%</span>}
                <span style={{ fontSize: 12, color: T.textDim }}>{SET_COUNT[s.key]} soal</span>
              </div>
            </button>
          );
        })}
        <button
          className={S.btnItem}
          onClick={() => lemahCount > 0 && setSetKey('lemah')}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: lemahCount > 0 ? 'pointer' : 'default', background: lemahCount > 0 ? 'rgba(220,38,38,0.06)' : T.surface, border: `1px solid ${lemahCount > 0 ? 'rgba(220,38,38,0.25)' : T.border}`, color: lemahCount > 0 ? T.wrong : T.textDim }}
        >
          <span>⚠ Lemah</span>
          <span style={{ fontSize: 12 }}>{lemahCount > 0 ? `${lemahCount} soal` : 'belum ada'}</span>
        </button>
      </div>
    </div>
  );
}
