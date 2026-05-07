// ─── DengarMode.jsx ───────────────────────────────────────────────────────────
// D1: Audio-first listening comprehension mode.
// Shows 🔊 button → user hears Japanese → picks Indonesian translation.
// Trains ear-to-meaning pathway (no visual kanji crutch).
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useCallback, useEffect, useRef } from 'react';
import { shuffle } from '../utils/shuffle.js';
import { speakJP, canSpeak } from '../utils/speak.js';
import { haptic } from '../utils/haptic.js';
import { stripFuri } from '../utils/jp-helpers.js';
import ProgressBar from '../components/ProgressBar.jsx';
import S from './modes.module.css';

const QUIZ_COUNTS = [10, 20, 30];

function buildQuestions(cards, count, allCards) {
  const pool = shuffle(cards).slice(0, count);
  return pool.map((card) => {
    // Build 4 distractors from allCards
    const others = shuffle(allCards.filter((c) => c.id !== card.id)).slice(0, 3);
    const opts = shuffle([
      { text: card.id_text || card.jp, isCorrect: true },
      ...others.map((c) => ({ text: c.id_text || c.jp, isCorrect: false })),
    ]);
    return { card, opts, correctIdx: opts.findIndex((o) => o.isCorrect) };
  });
}

export default function DengarMode({ cards, allCards, onExit, onSessionEnd }) {
  const [started, setStarted] = useState(false);
  const [count, setCount] = useState(10);
  const [questions, setQuestions] = useState([]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null); // null | index
  const [results, setResults] = useState([]);
  const [sessionFired, setSessionFired] = useState(false);
  const speakCountRef = useRef(0);

  const hasAudio = canSpeak();

  const start = () => {
    const qs = buildQuestions(cards, count, allCards || cards);
    setQuestions(qs);
    setIdx(0);
    setSelected(null);
    setResults([]);
    setSessionFired(false);
    speakCountRef.current = 0;
    setStarted(true);
  };

  const currentQ = questions[idx];

  // Auto-speak when card loads
  useEffect(() => {
    if (!started || !currentQ || selected !== null) return;
    speakCountRef.current = 0;
    if (hasAudio) {
      setTimeout(() => speakJP(stripFuri(currentQ.card.jp)), 300);
    }
  }, [idx, started]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSpeak = () => {
    if (!currentQ) return;
    speakCountRef.current += 1;
    speakJP(stripFuri(currentQ.card.jp));
    haptic.tap();
  };

  const handleSelect = useCallback((optIdx) => {
    if (selected !== null) return;
    setSelected(optIdx);
    const isCorrect = optIdx === currentQ.correctIdx;
    haptic[isCorrect ? 'correct' : 'wrong']();
    setResults((r) => [...r, { card: currentQ.card, isCorrect }]);

    // Advance after 1.5s
    setTimeout(() => {
      if (idx + 1 < questions.length) {
        setIdx((i) => i + 1);
        setSelected(null);
      } else {
        // Done — fire session
        const newResults = [...results, { card: currentQ.card, isCorrect }];
        if (!sessionFired && onSessionEnd) {
          const correct = newResults.filter((r) => r.isCorrect).length;
          onSessionEnd({ mode: 'dengar', correct, total: newResults.length });
          setSessionFired(true);
        }
        setIdx(questions.length); // trigger done state
      }
    }, 1500);
  }, [selected, currentQ, idx, questions.length, results, sessionFired, onSessionEnd]);

  // ── Settings screen ──────────────────────────────────────────────────────
  if (!started) {
    return (
      <div className={S.page}>
        <button className={S.btnBack} onClick={onExit}>← Kembali</button>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 28, marginBottom: 4 }}>🎧</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--ssw-textBright)' }}>
            Mode Dengarkan
          </div>
          <div style={{ fontSize: 13, color: 'var(--ssw-textMuted)', marginTop: 4 }}>
            Dengar 🔊 bahasa Jepang → pilih terjemahan Indonesia
          </div>
          {!hasAudio && (
            <div style={{
              marginTop: 12, padding: '10px 14px',
              background: 'var(--ssw-wrongBg)', border: '1px solid var(--ssw-wrongBorder)',
              borderRadius: 10, fontSize: 13, color: 'var(--ssw-wrong)',
            }}>
              ⚠️ Browser ini tidak mendukung Web Speech API. Mode Dengarkan membutuhkan audio.
            </div>
          )}
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ssw-textMuted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Jumlah Soal
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {QUIZ_COUNTS.map((n) => (
              <button
                key={n}
                onClick={() => setCount(n)}
                style={{
                  flex: 1, padding: '10px 0', borderRadius: 10, fontFamily: 'inherit',
                  fontSize: 15, fontWeight: count === n ? 700 : 400, cursor: 'pointer',
                  border: `2px solid ${count === n ? 'var(--ssw-amber)' : 'var(--ssw-border)'}`,
                  background: count === n ? 'rgba(245,158,11,0.12)' : 'var(--ssw-surface)',
                  color: count === n ? 'var(--ssw-amber)' : 'var(--ssw-textMuted)',
                  transition: 'all 0.15s',
                }}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div style={{
          padding: '14px 16px', background: 'var(--ssw-surface)',
          borderRadius: 12, marginBottom: 24, fontSize: 13, color: 'var(--ssw-textMuted)', lineHeight: 1.6,
        }}>
          <strong style={{ color: 'var(--ssw-textBright)' }}>Cara main:</strong>{' '}
          Tekan 🔊 untuk mendengar kata Jepang. Pilih terjemahan yang benar. Kartu bergerak otomatis setelah {1.5} detik.
        </div>

        <button
          onClick={start}
          disabled={!hasAudio}
          style={{
            width: '100%', padding: '14px', borderRadius: 12,
            background: hasAudio ? 'var(--ssw-amber)' : 'var(--ssw-surface)',
            color: hasAudio ? '#fff' : 'var(--ssw-textFaint)',
            fontFamily: 'inherit', fontSize: 16, fontWeight: 700,
            border: 'none', cursor: hasAudio ? 'pointer' : 'not-allowed',
          }}
        >
          Mulai Latihan
        </button>
      </div>
    );
  }

  // ── Done screen ───────────────────────────────────────────────────────────
  if (idx >= questions.length && results.length > 0) {
    const correct = results.filter((r) => r.isCorrect).length;
    const pct = Math.round((correct / results.length) * 100);
    const color = pct >= 80 ? 'var(--ssw-correct)' : pct >= 60 ? 'var(--ssw-amber)' : 'var(--ssw-wrong)';

    return (
      <div className={S.pageCenter}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>
          {pct >= 80 ? '🏆' : pct >= 60 ? '🎯' : '💪'}
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--ssw-textBright)', marginBottom: 4 }}>
          Sesi Selesai
        </div>
        <div style={{ fontSize: 36, fontWeight: 800, color, marginBottom: 4 }}>
          {pct}%
        </div>
        <div style={{ fontSize: 14, color: 'var(--ssw-textMuted)', marginBottom: 24 }}>
          {correct} benar dari {results.length} soal
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 320, margin: '0 auto' }}>
          <button
            onClick={start}
            style={{
              padding: '13px', borderRadius: 12, background: 'var(--ssw-amber)',
              color: '#fff', fontFamily: 'inherit', fontSize: 15, fontWeight: 700,
              border: 'none', cursor: 'pointer',
            }}
          >
            🔄 Ulangi
          </button>
          <button
            onClick={onExit}
            style={{
              padding: '13px', borderRadius: 12, background: 'var(--ssw-surface)',
              color: 'var(--ssw-textMuted)', fontFamily: 'inherit', fontSize: 15, fontWeight: 600,
              border: '1px solid var(--ssw-border)', cursor: 'pointer',
            }}
          >
            ← Kembali
          </button>
        </div>
      </div>
    );
  }

  if (!currentQ) return null;

  // ── Quiz screen ───────────────────────────────────────────────────────────
  const isAnswered = selected !== null;

  return (
    <div className={S.page}>
      <button className={S.btnBack} onClick={onExit}>← Kembali</button>
      <ProgressBar value={idx} max={questions.length} />

      <div style={{
        textAlign: 'center', padding: '32px 16px 24px',
        background: 'var(--ssw-surface)', borderRadius: 16, marginBottom: 20,
      }}>
        <div style={{ fontSize: 13, color: 'var(--ssw-textMuted)', marginBottom: 12 }}>
          {idx + 1} / {questions.length}
        </div>

        {/* Big speak button */}
        <button
          onClick={handleSpeak}
          disabled={isAnswered}
          aria-label="Putar audio"
          style={{
            width: 80, height: 80, borderRadius: '50%',
            background: isAnswered ? 'var(--ssw-surface)' : 'var(--ssw-amber)',
            border: 'none', cursor: isAnswered ? 'default' : 'pointer',
            fontSize: 32, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: isAnswered ? 'none' : '0 4px 16px rgba(245,158,11,0.35)',
            transition: 'all 0.2s',
          }}
        >
          🔊
        </button>

        <div style={{
          marginTop: 16, fontSize: 13, color: 'var(--ssw-textMuted)',
          opacity: isAnswered ? 0 : 1, transition: 'opacity 0.2s',
        }}>
          Tekan untuk mendengar kata Jepang
        </div>

        {/* Reveal after answer */}
        {isAnswered && (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--ssw-textBright)' }}>
              {currentQ.card.jp}
            </div>
            {currentQ.card.furi && (
              <div style={{ fontSize: 14, color: 'var(--ssw-textMuted)', marginTop: 2 }}>
                {currentQ.card.furi}
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {currentQ.opts.map((opt, i) => {
          let bg = 'var(--ssw-surface)';
          let border = 'var(--ssw-border)';
          let color = 'var(--ssw-text)';
          if (isAnswered) {
            if (opt.isCorrect) { bg = 'var(--ssw-correctBg)'; border = 'var(--ssw-correctBorder)'; color = 'var(--ssw-correct)'; }
            else if (i === selected && !opt.isCorrect) { bg = 'var(--ssw-wrongBg)'; border = 'var(--ssw-wrongBorder)'; color = 'var(--ssw-wrong)'; }
          }
          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={isAnswered}
              style={{
                width: '100%', padding: '14px 16px', textAlign: 'left',
                borderRadius: 12, background: bg, border: `2px solid ${border}`,
                color, fontFamily: 'inherit', fontSize: 15, cursor: isAnswered ? 'default' : 'pointer',
                transition: 'all 0.15s', fontWeight: 500,
              }}
            >
              {opt.text}
            </button>
          );
        })}
      </div>
    </div>
  );
}
