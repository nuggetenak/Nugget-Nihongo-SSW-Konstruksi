import { useState, useMemo } from 'react';
import { T } from '../styles/theme.js';
import { shuffle } from '../utils/shuffle.js';
import { DANGER_PAIRS } from '../data/danger-pairs.js';
import QuizShell from '../components/QuizShell.jsx';

export default function DangerMode({ onExit }) {
  const [started, setStarted] = useState(false);

  const questions = useMemo(() => {
    if (!started) return [];
    return shuffle(DANGER_PAIRS).flatMap((pair) => {
      // Generate 2 questions per pair: one asks for each term
      return shuffle([0, 1])
        .slice(0, 1)
        .map((askIdx) => {
          const correct = pair[askIdx];
          const wrong = pair[1 - askIdx];
          const opts = shuffle([
            { text: correct.id_text, sub: correct.jp, _correct: true },
            { text: wrong.id_text, sub: wrong.jp, _correct: false },
            // Add a random third distractor from other pairs
            ...shuffle(DANGER_PAIRS.filter((p) => p !== pair).flatMap((p) => p))
              .slice(0, 1)
              .map((d) => ({ text: d.id_text, sub: d.jp, _correct: false })),
          ]);
          return {
            question: correct.jp,
            questionSub: `⚠️ Jangan tertukar! Pilih arti yang BENAR`,
            options: opts.map((o) => ({ text: o.text, sub: o.sub })),
            correctIdx: opts.findIndex((o) => o._correct),
            explanation: `${correct.jp} = ${correct.id_text}\n${wrong.jp} = ${wrong.id_text}\n\nKedua istilah ini sering tertukar di ujian!`,
          };
        });
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
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>⚠️ Soal Jebak</h2>
        <p style={{ fontSize: 13, color: T.textMuted, marginBottom: 12 }}>
          {DANGER_PAIRS.length} pasangan istilah mirip yang sering dijebak di ujian.
        </p>

        <div style={{ marginBottom: 20 }}>
          {DANGER_PAIRS.map((pair, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                gap: 8,
                padding: '10px 0',
                borderBottom: `1px solid ${T.border}`,
                fontSize: 13,
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: T.fontJP, fontWeight: 600 }}>{pair[0].jp}</div>
                <div style={{ fontSize: 11, color: T.textMuted }}>{pair[0].id_text}</div>
              </div>
              <div style={{ color: T.wrong, fontSize: 12, alignSelf: 'center' }}>⚡</div>
              <div style={{ flex: 1, textAlign: 'right' }}>
                <div style={{ fontFamily: T.fontJP, fontWeight: 600 }}>{pair[1].jp}</div>
                <div style={{ fontSize: 11, color: T.textMuted }}>{pair[1].id_text}</div>
              </div>
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
          Mulai Drill ⚠️
        </button>
      </div>
    );
  }

  return (
    <QuizShell
      questions={questions}
      onExit={() => setStarted(false)}
      title="Soal Jebak"
      accentColor={T.wrong}
    />
  );
}
