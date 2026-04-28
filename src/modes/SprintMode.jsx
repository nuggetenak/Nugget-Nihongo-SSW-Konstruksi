import { useState, useEffect } from 'react';
import { T } from '../styles/theme.js';
import { shuffle } from '../utils/shuffle.js';

import { JpFront } from '../components/JpDisplay.jsx';
import ProgressBar from '../components/ProgressBar.jsx';

const DURATION = 60; // seconds

export default function SprintMode({ cards, onExit }) {
  const [phase, setPhase] = useState('ready'); // ready | playing | done
  const [order, setOrder] = useState([]);
  const [idx, setIdx] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    setOrder(shuffle(cards)); // eslint-disable-line react-hooks/set-state-in-effect
  }, [cards]);

  useEffect(() => {
    if (phase !== 'playing') return;
    if (timeLeft <= 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPhase('done');
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, phase]);

  const card = order[idx];

  const handleKnow = () => {
    setCorrect((c) => c + 1);
    next();
  };
  const handleDontKnow = () => {
    setWrong((w) => w + 1);
    setShowAnswer(true);
    setTimeout(next, 1200);
  };
  const next = () => {
    setShowAnswer(false);
    setIdx((i) => (i + 1) % order.length);
  };

  if (phase === 'ready') {
    return (
      <div
        style={{ padding: '24px 16px', maxWidth: T.maxW, margin: '0 auto', textAlign: 'center' }}
      >
        <button
          onClick={onExit}
          style={{
            fontFamily: 'inherit',
            fontSize: 12,
            color: T.textMuted,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            marginBottom: 24,
            display: 'block',
          }}
        >
          ← Kembali
        </button>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚡</div>
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Sprint Mode</h2>
        <p style={{ fontSize: 13, color: T.textMuted, marginBottom: 24 }}>
          Jawab sebanyak-banyaknya dalam {DURATION} detik!
        </p>
        <button
          onClick={() => setPhase('playing')}
          style={{
            padding: '14px 48px',
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
          Mulai ⚡
        </button>
      </div>
    );
  }

  if (phase === 'done') {
    const total = correct + wrong;
    return (
      <div
        style={{ padding: '24px 16px', maxWidth: T.maxW, margin: '0 auto', textAlign: 'center' }}
      >
        <div style={{ fontSize: 48, marginBottom: 12 }}>⚡</div>
        <div style={{ fontSize: 28, fontWeight: 800, color: T.gold, marginBottom: 4 }}>
          {correct}
        </div>
        <div style={{ fontSize: 13, color: T.textMuted, marginBottom: 20 }}>
          kartu dijawab benar dari {total} total
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => {
              setPhase('ready');
              setIdx(0);
              setCorrect(0);
              setWrong(0);
              setTimeLeft(DURATION);
              setOrder(shuffle(cards));
            }}
            style={{
              flex: 1,
              padding: '12px',
              fontSize: 13,
              fontWeight: 700,
              fontFamily: 'inherit',
              borderRadius: T.r.md,
              background: T.accent,
              border: 'none',
              color: T.textBright,
              cursor: 'pointer',
            }}
          >
            🔄 Ulang
          </button>
          <button
            onClick={onExit}
            style={{
              flex: 1,
              padding: '12px',
              fontSize: 13,
              fontFamily: 'inherit',
              borderRadius: T.r.md,
              background: T.surface,
              border: `1px solid ${T.border}`,
              color: T.textMuted,
              cursor: 'pointer',
            }}
          >
            ← Kembali
          </button>
        </div>
      </div>
    );
  }

  if (!card) return null;

  return (
    <div style={{ padding: '16px 16px 24px', maxWidth: T.maxW, margin: '0 auto' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 10,
        }}
      >
        <span style={{ fontSize: 20, fontWeight: 800, color: timeLeft <= 10 ? T.wrong : T.gold }}>
          ⏱ {timeLeft}s
        </span>
        <span style={{ fontSize: 13, color: T.textMuted }}>
          ✅ {correct} · ❌ {wrong}
        </span>
      </div>
      <ProgressBar
        current={DURATION - timeLeft}
        total={DURATION}
        color={timeLeft <= 10 ? T.wrong : T.amber}
      />

      <div
        style={{
          marginTop: 20,
          padding: '32px 20px',
          background: T.surface,
          borderRadius: T.r.xl,
          border: `1px solid ${T.border}`,
          minHeight: 180,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <JpFront jp={card.jp} furi={card.furi} romaji={card.romaji} />
        {showAnswer && (
          <div
            style={{
              textAlign: 'center',
              marginTop: 12,
              fontSize: 14,
              color: T.gold,
              fontWeight: 600,
            }}
          >
            {card.id_text}
          </div>
        )}
      </div>

      {!showAnswer && (
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button
            onClick={handleDontKnow}
            style={{
              flex: 1,
              padding: '14px',
              fontSize: 14,
              fontWeight: 600,
              fontFamily: 'inherit',
              borderRadius: T.r.md,
              cursor: 'pointer',
              background: T.wrongBg,
              border: `1px solid ${T.wrongBorder}`,
              color: T.wrong,
            }}
          >
            Tidak tahu
          </button>
          <button
            onClick={handleKnow}
            style={{
              flex: 1,
              padding: '14px',
              fontSize: 14,
              fontWeight: 600,
              fontFamily: 'inherit',
              borderRadius: T.r.md,
              cursor: 'pointer',
              background: T.correctBg,
              border: `1px solid ${T.correctBorder}`,
              color: T.correct,
            }}
          >
            Tahu! ✓
          </button>
        </div>
      )}
    </div>
  );
}
