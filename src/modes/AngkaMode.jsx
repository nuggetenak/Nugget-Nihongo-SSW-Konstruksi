import { useState, useMemo } from 'react';
import { T } from '../styles/theme.js';
import { shuffle } from '../utils/shuffle.js';
import { ANGKA_KUNCI } from '../data/angka-kunci.js';
import QuizShell from '../components/QuizShell.jsx';

export default function AngkaMode({ onExit }) {
  const [started, setStarted] = useState(false);

  const questions = useMemo(() => {
    if (!started) return [];
    return shuffle(ANGKA_KUNCI).map((a) => {
      const distractors = shuffle(ANGKA_KUNCI.filter((x) => x !== a)).slice(0, 3);
      const opts = shuffle([a, ...distractors]);
      return {
        question: a.label,
        questionSub: a.desc,
        options: opts.map((o) => ({ text: o.value, sub: null })),
        correctIdx: opts.indexOf(a),
        explanation: `${a.label} = ${a.value}\n${a.desc}`,
      };
    });
  }, [started]);

  if (!started) {
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
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>🔢 Angka Kunci</h2>
        <p style={{ fontSize: 13, color: T.textMuted, marginBottom: 12 }}>
          {ANGKA_KUNCI.length} angka penting yang WAJIB dihafal untuk ujian.
        </p>

        {/* Reference table */}
        <div style={{ marginBottom: 20 }}>
          {ANGKA_KUNCI.map((a, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 12px',
                borderBottom: `1px solid ${T.border}`,
                fontSize: 13,
              }}
            >
              <span style={{ color: T.text, flex: 1 }}>{a.label}</span>
              <span style={{ color: T.gold, fontWeight: 700, minWidth: 60, textAlign: 'right' }}>
                {a.value}
              </span>
            </div>
          ))}
        </div>

        <button
          onClick={() => setStarted(true)}
          style={{
            width: '100%',
            padding: '14px',
            fontSize: 15,
            fontWeight: 700,
            fontFamily: 'inherit',
            borderRadius: T.r.md,
            background: T.accent,
            border: 'none',
            color: T.textBright,
            cursor: 'pointer',
          }}
        >
          Mulai Kuis Angka 🔢
        </button>
      </div>
    );
  }

  return (
    <QuizShell
      questions={questions}
      onExit={() => setStarted(false)}
      title="Angka Kunci"
      accentColor="#eab308"
    />
  );
}
