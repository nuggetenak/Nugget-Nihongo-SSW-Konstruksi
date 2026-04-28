import { useState, useMemo, useCallback } from 'react';
import { T } from '../styles/theme.js';
import { shuffle } from '../utils/shuffle.js';
import { makeWrongEntry } from '../utils/wrong-tracker.js';
import { usePersistedState } from '../hooks/usePersistedState.js';
import { stripFuri, extractReadings } from '../utils/jp-helpers.js';
import { JAC_OFFICIAL } from '../data/jac-official.js';
import QuizShell from '../components/QuizShell.jsx';

const SETS = [
  { key: 'all', label: 'Semua Set', icon: '📋' },
  { key: 'tt1', label: '学科 Set 1', icon: '📝' },
  { key: 'tt2', label: '学科 Set 2', icon: '📝' },
  { key: 'st1', label: '実技 Set 1', icon: '🔧' },
  { key: 'st2', label: '実技 Set 2', icon: '🔧' },
];

export default function JACMode({ onExit }) {
  const [setKey, setSetKey] = useState(null); // null = picker, string = quiz
  const [_wrongCounts, setWrongCounts] = usePersistedState('ssw-wrong-counts', {});
  const [showFuri, setShowFuri] = useState(true);
  const [showID, setShowID] = useState(true);

  const filtered = useMemo(() => {
    const items = setKey === 'all' ? JAC_OFFICIAL : JAC_OFFICIAL.filter((q) => q.set === setKey);
    return shuffle(items);
  }, [setKey]);

  const questions = useMemo(() => {
    return filtered.map((q) => {
      const reading = showFuri ? extractReadings(q.jp) : null;
      return {
        question: showFuri ? q.jp : stripFuri(q.jp),
        questionSub: showID ? q.id_text : reading || null,
        options: q.options.map((opt) => ({
          text: showFuri ? opt : stripFuri(opt),
          sub: null,
        })),
        correctIdx: q.answer, // Now 0-based after Phase 1
        explanation: q.explanation,
        hint: q.hasPhoto ? `📷 ${q.photoDesc || 'Soal ini aslinya pakai foto'}` : null,
        _qId: q.id,
      };
    });
  }, [filtered, showFuri, showID]);

  const handleAnswer = useCallback(
    (qIdx, selIdx, isCorrect) => {
      if (!isCorrect) {
        const qId = filtered[qIdx]?.id;
        if (qId) setWrongCounts((w) => ({ ...w, [qId]: makeWrongEntry(w[qId]) }));
      }
    },
    [filtered, setWrongCounts]
  );

  // ─── Set Picker ───
  if (setKey === null) {
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
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>Soal JAC Official</h2>
        <p style={{ fontSize: 13, color: T.textMuted, marginBottom: 20 }}>
          {JAC_OFFICIAL.length} soal dari contoh ujian resmi
        </p>

        {/* Settings */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          <button
            onClick={() => setShowFuri((f) => !f)}
            style={{
              fontFamily: 'inherit',
              fontSize: 11,
              padding: '6px 12px',
              borderRadius: T.r.pill,
              cursor: 'pointer',
              background: showFuri ? 'rgba(251,191,36,0.15)' : T.surface,
              border: `1px solid ${showFuri ? 'rgba(251,191,36,0.4)' : T.border}`,
              color: showFuri ? T.gold : T.textMuted,
            }}
          >
            ふり {showFuri ? 'ON' : 'OFF'}
          </button>
          <button
            onClick={() => setShowID((f) => !f)}
            style={{
              fontFamily: 'inherit',
              fontSize: 11,
              padding: '6px 12px',
              borderRadius: T.r.pill,
              cursor: 'pointer',
              background: showID ? 'rgba(251,191,36,0.15)' : T.surface,
              border: `1px solid ${showID ? 'rgba(251,191,36,0.4)' : T.border}`,
              color: showID ? T.gold : T.textMuted,
            }}
          >
            ID {showID ? 'ON' : 'OFF'}
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {SETS.map((s) => {
            const count =
              s.key === 'all'
                ? JAC_OFFICIAL.length
                : JAC_OFFICIAL.filter((q) => q.set === s.key).length;
            return (
              <button
                key={s.key}
                onClick={() => setSetKey(s.key)}
                style={{
                  fontFamily: 'inherit',
                  padding: '14px 16px',
                  borderRadius: T.r.md,
                  cursor: 'pointer',
                  background: T.surface,
                  border: `1px solid ${T.border}`,
                  color: T.text,
                  textAlign: 'left',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span>
                  {s.icon} {s.label}
                </span>
                <span style={{ fontSize: 12, color: T.textDim }}>{count} soal</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <QuizShell
      questions={questions}
      onExit={() => setSetKey(null)}
      title="JAC Official"
      onAnswer={handleAnswer}
      showHint={true}
      accentColor="#ef4444"
    />
  );
}
