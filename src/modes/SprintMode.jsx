import { useState, useEffect } from 'react';
import { T } from '../styles/theme.js';
import { shuffle } from '../utils/shuffle.js';
import { JpFront } from '../components/JpDisplay.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import S from './modes.module.css';

const DURATION = 60;

export default function SprintMode({ cards, onExit }) {
  const [phase, setPhase] = useState('ready');
  const [order, setOrder] = useState([]);
  const [idx, setIdx] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => { setOrder(shuffle(cards)); }, [cards]);

  useEffect(() => {
    if (phase !== 'playing') return;
    if (timeLeft <= 0) { setPhase('done'); return; }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, phase]);

  const card = order[idx];
  const handleKnow = () => { setCorrect((c) => c + 1); next(); };
  const handleDontKnow = () => { setWrong((w) => w + 1); setShowAnswer(true); setTimeout(next, 1200); };
  const next = () => { setShowAnswer(false); setIdx((i) => (i + 1) % order.length); };

  if (phase === 'ready') {
    return (
      <div className={S.page} style={{ textAlign: 'center' }}>
        <button className={S.btnBack} style={{ marginLeft: 'auto', marginRight: 'auto' }} onClick={onExit}>← Kembali</button>
        <div style={{ fontSize: 48, marginBottom: 16 }}>⚡</div>
        <h2 className={S.pageTitle} style={{ fontSize: 20 }}>Sprint Mode</h2>
        <p className={S.pageSub}>Jawab sebanyak-banyaknya dalam {DURATION} detik!</p>
        <button className={S.btnPrimary} style={{ width: 'auto', padding: '14px 48px', fontSize: 15 }} onClick={() => setPhase('playing')}>
          Mulai ⚡
        </button>
      </div>
    );
  }

  if (phase === 'done') {
    const total = correct + wrong;
    return (
      <div className={S.page} style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>⚡</div>
        <div style={{ fontSize: 28, fontWeight: 800, color: T.gold, marginBottom: 4 }}>{correct}</div>
        <div style={{ fontSize: 13, color: T.textMuted, marginBottom: 20 }}>kartu dijawab benar dari {total} total</div>
        <div className={S.row} style={{ gap: 8 }}>
          <button
            className={S.btnPrimary} style={{ fontSize: 13, padding: '12px' }}
            onClick={() => { setPhase('ready'); setIdx(0); setCorrect(0); setWrong(0); setTimeLeft(DURATION); setOrder(shuffle(cards)); }}
          >
            🔄 Ulang
          </button>
          <button className={S.btnSecondary} style={{ flex: 1, padding: '12px', borderRadius: T.r.md }} onClick={onExit}>← Kembali</button>
        </div>
      </div>
    );
  }

  if (!card) return null;

  return (
    <div className={S.page} style={{ padding: '16px 16px 24px' }}>
      <div className={S.rowSpread} style={{ marginBottom: 10 }}>
        <span style={{ fontSize: 20, fontWeight: 800, color: timeLeft <= 10 ? T.wrong : T.gold }}>⏱ {timeLeft}s</span>
        <span style={{ fontSize: 13, color: T.textMuted }}>✅ {correct} · ❌ {wrong}</span>
      </div>
      <ProgressBar current={DURATION - timeLeft} total={DURATION} color={timeLeft <= 10 ? T.wrong : T.amber} />

      <div className={S.cardLg} style={{ marginTop: 20, minHeight: 180, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <JpFront jp={card.jp} furi={card.furi} romaji={card.romaji} />
        {showAnswer && (
          <div style={{ textAlign: 'center', marginTop: 12, fontSize: 14, color: T.gold, fontWeight: 600 }}>
            {card.id_text}
          </div>
        )}
      </div>

      {!showAnswer && (
        <div className={S.row} style={{ marginTop: 16 }}>
          <button
            style={{ flex: 1, padding: '14px', fontSize: 14, fontWeight: 600, fontFamily: 'inherit', borderRadius: T.r.md, cursor: 'pointer', background: T.wrongBg, border: `1px solid ${T.wrongBorder}`, color: T.wrong }}
            onClick={handleDontKnow}
          >
            Tidak tahu
          </button>
          <button
            style={{ flex: 1, padding: '14px', fontSize: 14, fontWeight: 600, fontFamily: 'inherit', borderRadius: T.r.md, cursor: 'pointer', background: T.correctBg, border: `1px solid ${T.correctBorder}`, color: T.correct }}
            onClick={handleKnow}
          >
            Tahu! ✓
          </button>
        </div>
      )}
    </div>
  );
}
