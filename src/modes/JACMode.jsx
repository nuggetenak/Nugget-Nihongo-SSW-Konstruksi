import { useState, useMemo, useCallback } from 'react';
import { T } from '../styles/theme.js';
import { shuffle } from '../utils/shuffle.js';
import { makeWrongEntry, getWrongCount } from '../utils/wrong-tracker.js';
import { usePersistedState } from '../hooks/usePersistedState.js';
import { stripFuri, extractReadings } from '../utils/jp-helpers.js';
import { JAC_OFFICIAL } from '../data/jac-official.js';
import QuizShell from '../components/QuizShell.jsx';

const SETS = [
  { key: 'all',  label: 'Semua Set',  icon: '📋' },
  { key: 'tt1',  label: '学科 Set 1', icon: '📝' },
  { key: 'tt2',  label: '学科 Set 2', icon: '📝' },
  { key: 'st1',  label: '実技 Set 1', icon: '🔧' },
  { key: 'st2',  label: '実技 Set 2', icon: '🔧' },
];

const SET_COUNT = {
  all: JAC_OFFICIAL.length,
  tt1: JAC_OFFICIAL.filter((q) => q.set === 'tt1').length,
  tt2: JAC_OFFICIAL.filter((q) => q.set === 'tt2').length,
  st1: JAC_OFFICIAL.filter((q) => q.set === 'st1').length,
  st2: JAC_OFFICIAL.filter((q) => q.set === 'st2').length,
};

const DELAYS = [
  { ms: 1000,  label: '1s'     },
  { ms: 1500,  label: '1.5s'   },
  { ms: 2000,  label: '2s'     },
  { ms: 0,     label: 'Manual' },
];

export default function JACMode({ onExit }) {
  const [setKey, setSetKey] = useState(null);
  const [wrongCounts, setWrongCounts] = usePersistedState('ssw-wrong-counts', {});
  const [jacScores, setJacScores] = usePersistedState('ssw-jac-scores', {});
  const [showFuri, setShowFuri] = useState(true);
  const [showID, setShowID]     = useState(true);
  const [autoDelay, setAutoDelay] = useState(2000);

  const lemahCount = JAC_OFFICIAL.filter((q) => getWrongCount(wrongCounts[q.id]) > 0).length;

  const filtered = useMemo(() => {
    if (!setKey) return [];
    if (setKey === 'lemah') {
      return [...JAC_OFFICIAL]
        .filter((q) => getWrongCount(wrongCounts[q.id]) > 0)
        .sort((a, b) => getWrongCount(wrongCounts[b.id]) - getWrongCount(wrongCounts[a.id]));
    }
    const base = setKey === 'all' ? JAC_OFFICIAL : JAC_OFFICIAL.filter((q) => q.set === setKey);
    return shuffle(base);
  }, [setKey, wrongCounts]);

  const questions = useMemo(() => {
    return filtered.map((q) => {
      const reading = showFuri ? extractReadings(q.jp) : null;
      return {
        question:    showFuri ? q.jp : stripFuri(q.jp),
        questionSub: showID ? q.id_text : (reading || null),
        options: q.options.map((opt) => ({
          text: showFuri ? opt : stripFuri(opt),
          sub: null,
        })),
        correctIdx:  q.answer,
        explanation: q.explanation,
        hint: q.hasPhoto ? `📷 ${q.photoDesc || 'Soal ini aslinya pakai foto'}` : null,
        _qId: q.id,
      };
    });
  }, [filtered, showFuri, showID]);

  const handleAnswer = useCallback(
    (qIdx, _selIdx, isCorrect) => {
      if (!isCorrect) {
        const qId = filtered[qIdx]?.id;
        if (qId) setWrongCounts((w) => ({ ...w, [qId]: makeWrongEntry(w[qId]) }));
      }
    },
    [filtered, setWrongCounts]
  );

  const handleFinish = useCallback(
    ({ correct, total }) => {
      if (!setKey) return;
      const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
      setJacScores((s) => ({
        ...s,
        [setKey]: { score: correct, total, pct, date: Date.now() },
      }));
    },
    [setKey, setJacScores]
  );

  // Empty state for lemah
  if (setKey === 'lemah' && filtered.length === 0) {
    return (
      <div style={{ padding: '40px 16px', textAlign: 'center', maxWidth: T.maxW, margin: '0 auto' }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>💪</div>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>Belum ada soal lemah</div>
        <div style={{ fontSize: 13, color: T.textMuted, marginBottom: 20 }}>Kerjakan beberapa soal dulu!</div>
        <button
          onClick={() => setSetKey(null)}
          style={{ fontFamily: 'inherit', padding: '10px 20px', borderRadius: T.r.md, background: T.surface, border: `1px solid ${T.border}`, color: T.textMuted, cursor: 'pointer', fontSize: 13 }}
        >
          ← Kembali
        </button>
      </div>
    );
  }

  // Quiz
  if (setKey !== null) {
    return (
      <QuizShell
        questions={questions}
        onExit={() => setSetKey(null)}
        title="JAC Official"
        onAnswer={handleAnswer}
        onFinish={handleFinish}
        showHint={true}
        accentColor="#ef4444"
        autoNextDelay={autoDelay}
      />
    );
  }

  // Set Picker
  return (
    <div style={{ padding: '24px 16px', maxWidth: T.maxW, margin: '0 auto' }}>
      <button
        onClick={onExit}
        style={{ fontFamily: 'inherit', fontSize: 12, color: T.textMuted, background: 'none', border: 'none', cursor: 'pointer', marginBottom: 16 }}
      >
        ← Kembali
      </button>

      <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>Soal JAC Official</h2>
      <p style={{ fontSize: 13, color: T.textMuted, marginBottom: 20 }}>
        {JAC_OFFICIAL.length} soal dari contoh ujian resmi
      </p>

      {/* Toggles */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {[
          { label: `ふり ${showFuri ? 'ON' : 'OFF'}`, active: showFuri, onClick: () => setShowFuri((f) => !f) },
          { label: `ID ${showID ? 'ON' : 'OFF'}`,     active: showID,   onClick: () => setShowID((f) => !f)   },
        ].map((btn) => (
          <button
            key={btn.label}
            onClick={btn.onClick}
            style={{ fontFamily: 'inherit', fontSize: 11, padding: '6px 12px', borderRadius: T.r.pill, cursor: 'pointer', background: btn.active ? 'rgba(251,191,36,0.15)' : T.surface, border: `1px solid ${btn.active ? 'rgba(251,191,36,0.4)' : T.border}`, color: btn.active ? T.gold : T.textMuted }}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Auto-delay */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color: T.textDim, textTransform: 'uppercase', marginBottom: 8 }}>
          Lanjut otomatis
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {DELAYS.map((d) => (
            <button
              key={d.ms}
              onClick={() => setAutoDelay(d.ms)}
              style={{ fontFamily: 'inherit', fontSize: 11, padding: '5px 10px', borderRadius: T.r.pill, cursor: 'pointer', background: autoDelay === d.ms ? 'rgba(245,158,11,0.15)' : T.surface, border: `1px solid ${autoDelay === d.ms ? T.amber : T.border}`, color: autoDelay === d.ms ? T.amber : T.textMuted, fontWeight: autoDelay === d.ms ? 700 : 400 }}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Set list + Lemah */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {SETS.map((s) => {
          const saved = jacScores[s.key];
          const count = SET_COUNT[s.key];
          return (
            <button
              key={s.key}
              onClick={() => setSetKey(s.key)}
              style={{ fontFamily: 'inherit', padding: '14px 16px', borderRadius: T.r.md, cursor: 'pointer', background: T.surface, border: `1px solid ${T.border}`, color: T.text, textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <span>{s.icon} {s.label}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {saved && (
                  <span style={{ fontSize: 11, fontWeight: 700, color: saved.pct >= 70 ? T.correct : saved.pct >= 50 ? T.amber : T.wrong }}>
                    {saved.pct}%
                  </span>
                )}
                <span style={{ fontSize: 12, color: T.textDim }}>{count} soal</span>
              </div>
            </button>
          );
        })}

        <button
          onClick={() => lemahCount > 0 && setSetKey('lemah')}
          style={{ fontFamily: 'inherit', padding: '14px 16px', borderRadius: T.r.md, cursor: lemahCount > 0 ? 'pointer' : 'default', background: lemahCount > 0 ? 'rgba(220,38,38,0.06)' : T.surface, border: `1px solid ${lemahCount > 0 ? 'rgba(220,38,38,0.25)' : T.border}`, color: lemahCount > 0 ? T.wrong : T.textDim, textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <span>⚠ Lemah</span>
          <span style={{ fontSize: 12 }}>
            {lemahCount > 0 ? `${lemahCount} soal` : 'belum ada'}
          </span>
        </button>
      </div>
    </div>
  );
}
