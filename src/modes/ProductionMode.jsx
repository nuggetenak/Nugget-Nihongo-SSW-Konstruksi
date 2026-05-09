// ─── ProductionMode.jsx ───────────────────────────────────────────────────────
// Active production practice: shown Indonesian → user types Japanese (kanji/kana).
// Implements Output Hypothesis (Swain 1985) — active recall bridges recognition→production gap.
// Accepts: exact jp match, stripped-furi match, or accepted romaji equivalent.
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useRef, useCallback, useEffect } from 'react';
import { T } from '../styles/theme.js';
import { useProgress } from '../contexts/ProgressContext.jsx';
import { shuffle } from '../utils/shuffle.js';
import { stripFuri } from '../utils/jp-helpers.js';
import { speakJP, canSpeak } from '../utils/speak.js';
import { haptic } from '../utils/haptic.js';
import { useSessionTimer } from '../hooks/useSessionTimer.js';
import ProgressBar from '../components/ProgressBar.jsx';
import S from './modes.module.css';

const QUIZ_COUNTS = [10, 20, 30];

// Normalize: strip furi, trim, lowercase for loose comparison
function norm(s = '') {
  return stripFuri(String(s)).trim().toLowerCase();
}

// Accept if: exact jp, stripped jp, or id_text match (fallback hint)
function isCorrect(input, card) {
  const trimmed = input.trim();
  if (!trimmed) return false;
  const stripped = stripFuri(card.jp);
  // Exact or stripped match
  if (trimmed === card.jp || trimmed === stripped) return true;
  // Lowercase match (for romaji-ish or capitalization)
  if (norm(trimmed) === norm(card.jp)) return true;
  // Kana-only match (furi field)
  if (card.furi && trimmed === card.furi) return true;
  return false;
}

export default function ProductionMode({ cards, onExit, onSessionEnd, audioEnabled = false }) {
  const [started, setStarted] = useState(false);
  const [count, setCount] = useState(10);
  const [queue, setQueue] = useState([]);
  const [idx, setIdx] = useState(0);
  const [input, setInput] = useState('');
  const [phase, setPhase] = useState('prompt'); // 'prompt' | 'revealed'
  const [results, setResults] = useState([]);
  const [sessionFired, setSessionFired] = useState(false);
  const inputRef = useRef(null);
  const { getDurationMs } = useSessionTimer();
  const { recordWrong } = useProgress();

  const startSession = () => {
    const q = shuffle(cards).slice(0, count);
    setQueue(q);
    setIdx(0);
    setInput('');
    setPhase('prompt');
    setResults([]);
    setSessionFired(false);
    setStarted(true);
  };

  useEffect(() => {
    if (started && phase === 'prompt') {
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [started, idx, phase]);

  const card = queue[idx];
  const isLast = idx === queue.length - 1;

  const handleSubmit = useCallback(() => {
    if (phase !== 'prompt' || !card) return;
    const correct = isCorrect(input, card);
    if (correct) haptic.correct();
    else { haptic.wrong(); recordWrong(card.id); }

    if (audioEnabled && canSpeak()) {
      speakJP(stripFuri(card.jp));
    }

    setResults((r) => [...r, { card, input: input.trim(), correct }]);
    setPhase('revealed');
  }, [phase, card, input, audioEnabled]);

  const handleNext = useCallback(() => {
    if (isLast) {
      const finalResults = [...results];
      if (!sessionFired) {
        setSessionFired(true);
        const c = finalResults.filter((r) => r.correct).length;
        onSessionEnd?.({ correct: c, total: finalResults.length, durationMs: getDurationMs() });
      }
      setStarted(false);
      setIdx(0);
    } else {
      setIdx((i) => i + 1);
      setInput('');
      setPhase('prompt');
    }
  }, [isLast, results, sessionFired, onSessionEnd, getDurationMs]);

  const handleSkip = useCallback(() => {
    if (phase !== 'prompt' || !card) return;
    haptic.wrong();
    recordWrong(card.id);
    setResults((r) => [...r, { card, input: '', correct: false, skipped: true }]);
    setPhase('revealed');
  }, [phase, card]);

  useEffect(() => {
    const handler = (e) => {
      if (phase === 'prompt') {
        if (e.key === 'Enter') { e.preventDefault(); handleSubmit(); }
        if (e.key === 'Escape') handleSkip();
      } else {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleNext(); }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [phase, handleSubmit, handleSkip, handleNext]);

  // ── Start screen ──────────────────────────────────────────────────────────
  if (!started) {
    const doneCount = results.length;
    const correctCount = results.filter((r) => r.correct).length;
    const showSummary = doneCount > 0;

    const pillStyle = (on) => ({
      fontFamily: 'inherit', padding: '7px 16px', fontSize: 13,
      borderRadius: T.r.pill, cursor: 'pointer', fontWeight: on ? 700 : 400,
      background: on ? T.surfaceActive : T.surface,
      border: `1px solid ${on ? T.borderActive : T.border}`,
      color: on ? T.amber : T.textMuted,
    });

    return (
      <div className={S.pageFade} style={{ padding: 'var(--sp-5) var(--sp-4)' }}>
        <button className={S.btnBack} onClick={onExit}>← Kembali</button>

        <h2 className={S.pageTitle} style={{ fontSize: 20 }}>✍️ Produksi Aktif</h2>
        <p className={S.pageSub} style={{ marginBottom: 20 }}>
          Lihat terjemahan Indonesia → ketik jawaban Jepang (kanji/kana).
        </p>

        {showSummary && (
          <div className={S.card} style={{ marginBottom: 20, background: T.correctBg, border: `1px solid ${T.correctBorder}` }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: T.correct }}>
              Sesi terakhir: {correctCount}/{doneCount} benar ({doneCount > 0 ? Math.round((correctCount / doneCount) * 100) : 0}%)
            </div>
          </div>
        )}

        <div className={S.sectionLabel}>Jumlah Soal</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {QUIZ_COUNTS.map((n) => (
            <button key={n} onClick={() => setCount(n)} style={pillStyle(count === n)}>{n}</button>
          ))}
          <button onClick={() => setCount(cards.length)} style={pillStyle(count === cards.length)}>
            Semua ({cards.length})
          </button>
        </div>

        <div className={S.card} style={{ marginBottom: 24, fontSize: 12, color: T.textMuted }}>
          <div style={{ marginBottom: 6, fontWeight: 600, color: T.text }}>💡 Cara main</div>
          <div>Prompt bahasa Indonesia tampil → ketik Jepang (kanji, kana, atau kombinasi).</div>
          <div style={{ marginTop: 4 }}>Enter = kirim jawaban · Esc = skip · spasi (setelah reveal) = lanjut</div>
        </div>

        <button className={S.btnPrimary} style={{ fontSize: 15, padding: '15px' }} onClick={startSession}>
          Mulai ✍️
        </button>
      </div>
    );
  }

  // ── Result screen ─────────────────────────────────────────────────────────
  if (!card) {
    const correct = results.filter((r) => r.correct).length;
    const total = results.length;
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
    const wrongList = results.filter((r) => !r.correct);

    return (
      <div className={S.pageScroll} style={{ padding: 'var(--sp-5) var(--sp-4)' }}>
        <div style={{
          background: T.surface,
          border: `1px solid ${T.border}`,
          borderRadius: 16,
          padding: '24px 20px',
          textAlign: 'center',
          marginBottom: 20,
          animation: 'popIn 0.35s var(--ease-spring) both',
        }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>
            {pct >= 80 ? '🎉' : pct >= 60 ? '📝' : '💪'}
          </div>
          <div style={{ fontSize: 40, fontWeight: 900, color: pct >= 80 ? T.correct : pct >= 60 ? T.amber : T.wrong }}>
            {pct}%
          </div>
          <div style={{ fontSize: 15, color: T.textMuted, marginTop: 4 }}>
            {correct}/{total} benar
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          <button className={S.btnPrimary} style={{ flex: 1 }} onClick={startSession}>🔄 Ulang</button>
          <button className={S.btnSecondary} style={{ flex: 1 }} onClick={onExit}>← Menu</button>
        </div>

        {wrongList.length > 0 && (
          <>
            <div className={S.sectionLabel}>Review Salah ({wrongList.length})</div>
            <div className={S.list} style={{ gap: 8 }}>
              {wrongList.map((r, i) => (
                <div key={i} className={S.card} style={{
                  animation: `slideUp 0.25s ease ${i * 0.04}s both`,
                  borderLeft: `3px solid ${T.wrong}`,
                }}>
                  <div style={{ fontSize: 11, color: T.textDim, marginBottom: 4 }}>{r.card.id_text}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: T.text, marginBottom: 4 }}>
                    {stripFuri(r.card.jp)}
                    {r.card.furi && <span style={{ fontSize: 12, color: T.textDim, marginLeft: 6 }}>({r.card.furi})</span>}
                  </div>
                  {r.input && (
                    <div style={{ fontSize: 12, color: T.wrong }}>
                      ✗ kamu: <span style={{ fontFamily: 'Noto Sans JP, sans-serif' }}>{r.input}</span>
                    </div>
                  )}
                  {r.skipped && (
                    <div style={{ fontSize: 12, color: T.textFaint }}>⏭ dilewati</div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  // ── Quiz screen ────────────────────────────────────────────────────────────
  const lastResult = phase === 'revealed' ? results[results.length - 1] : null;
  const answerCorrect = lastResult?.correct ?? false;

  return (
    <div className={S.pageScroll} style={{ padding: 'var(--sp-4)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <button className={S.btnBack} style={{ marginBottom: 0 }} onClick={() => { setStarted(false); }}>
          ← Produksi
        </button>
        <div style={{ fontSize: 12, color: T.textDim }}>
          {idx + 1} / {queue.length}
          {results.length > 0 && (
            <span style={{ marginLeft: 8, color: T.correct, fontWeight: 700 }}>
              {results.filter((r) => r.correct).length} ✓
            </span>
          )}
        </div>
      </div>

      <ProgressBar
        current={idx + (phase === 'revealed' ? 1 : 0)}
        total={queue.length}
        color={T.amber}
      />

      {/* Prompt card — Indonesian → user types Japanese */}
      <div style={{
        background: T.surface,
        border: `1px solid ${T.border}`,
        borderRadius: 16,
        padding: '28px 20px',
        textAlign: 'center',
        margin: '16px 0',
        animation: 'scaleIn 0.2s var(--ease-smooth)',
      }}>
        <div style={{ fontSize: 11, color: T.textFaint, marginBottom: 8, letterSpacing: 1, textTransform: 'uppercase' }}>
          bahasa indonesia
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, color: T.text, lineHeight: 1.4 }}>
          {card.id_text}
        </div>
        {card.desc && (
          <div style={{ fontSize: 12, color: T.textDim, marginTop: 10, lineHeight: 1.5 }}>
            {card.desc}
          </div>
        )}
      </div>

      {/* Input area */}
      {phase === 'prompt' ? (
        <>
          <div style={{ position: 'relative', marginBottom: 12 }}>
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ketik Jepang di sini... (kanji/kana)"
              style={{
                width: '100%',
                padding: '14px 16px',
                fontSize: 20,
                fontFamily: 'Noto Sans JP, DM Sans, sans-serif',
                border: `1.5px solid ${T.border}`,
                borderRadius: 12,
                background: T.surface,
                color: T.text,
                outline: 'none',
                boxSizing: 'border-box',
              }}
              onFocus={(e) => { e.target.style.borderColor = T.borderActive; }}
              onBlur={(e) => { e.target.style.borderColor = T.border; }}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
            />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className={S.btnPrimary}
              style={{ flex: 2 }}
              onClick={handleSubmit}
              disabled={!input.trim()}
            >
              Kirim →
            </button>
            <button
              className={S.btnSecondary}
              style={{ flex: 1, fontSize: 12 }}
              onClick={handleSkip}
            >
              Lewati ⏭
            </button>
          </div>
        </>
      ) : (
        /* Reveal panel */
        <div style={{
          border: `1.5px solid ${answerCorrect ? T.correctBorder : T.wrongBorder}`,
          borderRadius: 12,
          background: answerCorrect ? T.correctBg : T.wrongBg,
          padding: '16px',
          marginBottom: 12,
          animation: 'scaleIn 0.18s var(--ease-smooth)',
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: answerCorrect ? T.correct : T.wrong }}>
              {answerCorrect ? '✓ Benar!' : '✗ Kurang tepat'}
            </span>
          </div>

          {!answerCorrect && lastResult?.input && (
            <div style={{ fontSize: 13, color: T.wrong, marginBottom: 6 }}>
              Kamu: <span style={{ fontFamily: 'Noto Sans JP, sans-serif' }}>{lastResult.input || '(dilewati)'}</span>
            </div>
          )}

          <div style={{ marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: T.textDim }}>Jawaban: </span>
            <span style={{ fontSize: 20, fontWeight: 700, fontFamily: 'Noto Sans JP, sans-serif', color: T.text }}>
              {stripFuri(card.jp)}
            </span>
            {card.furi && (
              <span style={{ fontSize: 13, color: T.textDim, marginLeft: 8 }}>({card.furi})</span>
            )}
          </div>

          {card.desc && (
            <div style={{ fontSize: 12, color: T.textDim, marginTop: 8, lineHeight: 1.5 }}>
              {card.desc}
            </div>
          )}

          {audioEnabled && canSpeak() && (
            <button
              onClick={() => speakJP(stripFuri(card.jp))}
              style={{
                marginTop: 8, background: 'none', border: 'none',
                fontSize: 12, color: T.amber, cursor: 'pointer', padding: '4px 0',
              }}
            >
              🔊 Dengarkan
            </button>
          )}
        </div>
      )}

      {phase === 'revealed' && (
        <button className={S.btnPrimary} style={{ fontSize: 15 }} onClick={handleNext}>
          {isLast ? 'Lihat Hasil →' : 'Lanjut →'}
        </button>
      )}
    </div>
  );
}
