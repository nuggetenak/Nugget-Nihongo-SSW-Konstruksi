import { useState, useEffect, useCallback } from 'react';
import { T } from '../styles/theme.js';
import { shuffle } from '../utils/shuffle.js';
import { DANGER_PAIRS } from '../data/danger-pairs.js';
import { getGrade } from '../styles/theme.js';
import ProgressBar from '../components/ProgressBar.jsx';

// DANGER_PAIRS shape: { term, furi, correct, traps: [str, str] }

function buildItems() {
  return shuffle(DANGER_PAIRS).map((pair) => {
    const allOpts = shuffle([
      { text: pair.correct, isCorrect: true },
      ...pair.traps.map((t) => ({ text: t, isCorrect: false })),
    ]);
    return { pair, opts: allOpts, correctIdx: allOpts.findIndex((o) => o.isCorrect) };
  });
}

export default function DangerMode({ onExit }) {
  const [view, setView] = useState('panel'); // 'panel' | 'quiz'

  return view === 'panel' ? (
    <PanelView onExit={onExit} onStartQuiz={() => setView('quiz')} />
  ) : (
    <QuizView onBack={() => setView('panel')} />
  );
}

// ─── PANEL: Browse all pairs ───────────────────────────────────────────────
function PanelView({ onExit, onStartQuiz }) {
  const [expanded, setExpanded] = useState(null);

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

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 20,
        }}
      >
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>⚠️ Soal Jebak</h2>
          <p style={{ fontSize: 13, color: T.textMuted }}>
            {DANGER_PAIRS.length} istilah yang sering salah di ujian
          </p>
        </div>
        <button
          onClick={onStartQuiz}
          style={{
            fontFamily: 'inherit',
            padding: '9px 16px',
            fontSize: 13,
            fontWeight: 700,
            borderRadius: T.r.md,
            background: T.accent,
            border: 'none',
            color: T.textBright,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          🧠 Drill
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {DANGER_PAIRS.map((pair, i) => {
          const isOpen = expanded === i;
          return (
            <div key={i}>
              <button
                onClick={() => setExpanded(isOpen ? null : i)}
                style={{
                  fontFamily: 'inherit',
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: isOpen ? `${T.r.md}px ${T.r.md}px 0 0` : T.r.md,
                  background: isOpen ? 'rgba(220,38,38,0.10)' : T.surface,
                  border: `1px solid ${isOpen ? 'rgba(220,38,38,0.35)' : T.border}`,
                  color: T.text,
                  textAlign: 'left',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <div>
                  <span style={{ fontFamily: T.fontJP, fontWeight: 700, fontSize: 15 }}>
                    {pair.term}
                  </span>
                  {pair.furi && (
                    <span style={{ fontSize: 11, color: T.textDim, marginLeft: 8 }}>
                      {pair.furi}
                    </span>
                  )}
                </div>
                <span style={{ fontSize: 13, color: T.textDim, flexShrink: 0 }}>
                  {isOpen ? '▲' : '▼'}
                </span>
              </button>
              {isOpen && (
                <div
                  style={{
                    padding: '14px 16px',
                    background: 'rgba(220,38,38,0.04)',
                    border: `1px solid rgba(220,38,38,0.25)`,
                    borderTop: 'none',
                    borderRadius: `0 0 ${T.r.md}px ${T.r.md}px`,
                    animation: 'fadeIn 0.15s ease',
                  }}
                >
                  <div style={{ marginBottom: 10 }}>
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: 1.5,
                        color: T.correct,
                        textTransform: 'uppercase',
                        marginBottom: 4,
                      }}
                    >
                      ✓ Jawaban Benar
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        lineHeight: 1.65,
                        color: T.text,
                        padding: '8px 12px',
                        background: T.correctBg,
                        borderRadius: T.r.sm,
                        border: `1px solid ${T.correctBorder}`,
                      }}
                    >
                      {pair.correct}
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: 1.5,
                        color: T.wrong,
                        textTransform: 'uppercase',
                        marginBottom: 4,
                      }}
                    >
                      ✗ Jebakan Umum
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {pair.traps.map((trap, ti) => (
                        <div
                          key={ti}
                          style={{
                            fontSize: 13,
                            lineHeight: 1.65,
                            color: T.textMuted,
                            padding: '8px 12px',
                            background: T.wrongBg,
                            borderRadius: T.r.sm,
                            border: `1px solid ${T.wrongBorder}`,
                          }}
                        >
                          {trap}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── QUIZ: standalone drill ────────────────────────────────────────────────
function QuizView({ onBack }) {
  const [items, setItems] = useState(() => buildItems());
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [results, setResults] = useState([]);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [phase, setPhase] = useState('playing');

  const item = items[qIdx];
  const isLast = qIdx === items.length - 1;

  const handleSelect = useCallback(
    (idx) => {
      if (selected !== null || phase !== 'playing') return;
      setSelected(idx);
      const isCorrect = idx === item.correctIdx;
      const ns = isCorrect ? streak + 1 : 0;
      setStreak(ns);
      setMaxStreak((m) => Math.max(m, ns));
      setResults((r) => [...r, { isCorrect, picked: idx, item }]);
    },
    [selected, phase, item, streak]
  );

  // Auto-next
  useEffect(() => {
    if (selected === null || phase !== 'playing') return;
    const t = setTimeout(() => {
      if (isLast) {
        setPhase('result');
      } else {
        setQIdx((i) => i + 1);
        setSelected(null);
      }
    }, 2500); // slightly longer so user can read the explanation comparison
    return () => clearTimeout(t);
  }, [selected, phase, isLast]);

  // Keyboard
  useEffect(() => {
    const h = (e) => {
      if (phase !== 'playing') return;
      const MAP = { 1: 0, 2: 1, 3: 2, a: 0, b: 1, c: 2 };
      const k = e.key.toLowerCase();
      if (selected === null && MAP[k] !== undefined) handleSelect(MAP[k]);
      else if (selected !== null && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        if (isLast) {
          setPhase('result');
        } else {
          setQIdx((i) => i + 1);
          setSelected(null);
        }
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [selected, phase, isLast, handleSelect]);

  const restart = () => {
    setItems(buildItems());
    setQIdx(0);
    setSelected(null);
    setResults([]);
    setStreak(0);
    setMaxStreak(0);
    setPhase('playing');
  };

  // ── Result screen ──────────────────────────────────────────────────────────
  if (phase === 'result') {
    const correct = results.filter((r) => r.isCorrect).length;
    const total = results.length;
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
    const grade = getGrade(pct);
    const wrongList = results.filter((r) => !r.isCorrect);

    return (
      <div
        style={{
          padding: '20px 16px',
          maxWidth: T.maxW,
          margin: '0 auto',
          animation: 'scaleIn 0.3s ease',
        }}
      >
        <div
          style={{
            textAlign: 'center',
            padding: '28px 20px 24px',
            background: T.accentSoft,
            borderRadius: T.r.xl,
            border: `1px solid ${T.border}`,
            marginBottom: 16,
          }}
        >
          <div style={{ fontSize: 52, marginBottom: 6 }}>{grade.emoji}</div>
          <div
            style={{
              fontSize: 32,
              fontWeight: 800,
              color: grade.color,
              marginBottom: 2,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {pct}%
          </div>
          <div style={{ fontSize: 13, color: T.textMuted, fontWeight: 600, marginBottom: 8 }}>
            {grade.label}
          </div>
          <div style={{ fontSize: 12, color: T.textDim }}>
            {correct}/{total} benar{maxStreak > 1 ? ` · 🔥 ${maxStreak} streak` : ''}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <button
            onClick={restart}
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
            onClick={onBack}
            style={{
              flex: 1,
              padding: '12px',
              fontSize: 13,
              fontWeight: 700,
              fontFamily: 'inherit',
              borderRadius: T.r.md,
              background: T.surface,
              border: `1px solid ${T.border}`,
              color: T.textMuted,
              cursor: 'pointer',
            }}
          >
            📋 Panel
          </button>
        </div>

        {wrongList.length > 0 && (
          <>
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: 1.5,
                color: T.textDim,
                textTransform: 'uppercase',
                marginBottom: 8,
              }}
            >
              Review Salah ({wrongList.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {wrongList.map((r, i) => {
                const p = r.item.pair;
                const pickedText = r.item.opts[r.picked]?.text;
                return (
                  <div
                    key={i}
                    style={{
                      borderRadius: T.r.md,
                      background: T.surface,
                      borderLeft: `3px solid ${T.wrong}`,
                      overflow: 'hidden',
                      animation: `slideUp 0.3s ease ${i * 0.05}s both`,
                    }}
                  >
                    {/* Term header */}
                    <div
                      style={{
                        padding: '10px 14px',
                        background: T.wrongBg,
                        borderBottom: `1px solid ${T.wrongBorder}`,
                      }}
                    >
                      <span style={{ fontFamily: T.fontJP, fontWeight: 700, fontSize: 14 }}>
                        {p.term}
                      </span>
                      {p.furi && (
                        <span style={{ fontSize: 11, color: T.textDim, marginLeft: 8 }}>
                          {p.furi}
                        </span>
                      )}
                    </div>
                    <div style={{ padding: '12px 14px' }}>
                      <div style={{ fontSize: 12, color: T.wrong, marginBottom: 6 }}>
                        ✗ {pickedText}
                      </div>
                      <div style={{ fontSize: 12, color: T.correct }}>✓ {p.correct}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    );
  }

  // ── Playing screen ─────────────────────────────────────────────────────────
  if (!item) return null;
  const { pair, opts } = item;

  return (
    <div
      style={{
        padding: '12px 16px 24px',
        maxWidth: T.maxW,
        margin: '0 auto',
        animation: 'fadeIn 0.2s ease',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 10,
        }}
      >
        <button
          onClick={onBack}
          style={{
            fontFamily: 'inherit',
            fontSize: 12,
            color: T.textMuted,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '6px 0',
          }}
        >
          ← Soal Jebak
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
          <span style={{ color: T.textDim, fontVariantNumeric: 'tabular-nums' }}>
            {results.filter((r) => r.isCorrect).length}/{qIdx + (selected !== null ? 1 : 0)}
          </span>
          {streak > 1 && <span style={{ color: T.gold, fontWeight: 700 }}>🔥{streak}</span>}
        </div>
      </div>

      <ProgressBar
        current={qIdx + (selected !== null ? 1 : 0)}
        total={items.length}
        color={T.wrong}
      />
      <div
        style={{
          fontSize: 11,
          color: T.textFaint,
          marginTop: 8,
          marginBottom: 14,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {qIdx + 1} / {items.length}
      </div>

      {/* Question card */}
      <div
        style={{
          padding: '20px 18px',
          background: T.surface,
          borderRadius: T.r.lg,
          border: `1px solid ${T.border}`,
          marginBottom: 14,
        }}
      >
        <div
          style={{
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: 2,
            color: T.wrong,
            textTransform: 'uppercase',
            marginBottom: 10,
          }}
        >
          ⚠️ Jangan tertukar! Pilih arti yang BENAR
        </div>
        <div
          style={{
            fontFamily: T.fontJP,
            fontSize: 22,
            fontWeight: 700,
            lineHeight: 1.4,
            marginBottom: pair.furi ? 6 : 0,
          }}
        >
          {pair.term}
        </div>
        {pair.furi && <div style={{ fontSize: 13, color: T.textDim }}>{pair.furi}</div>}
      </div>

      {/* Options */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {opts.map((opt, i) => {
          const isSelected = selected === i;
          const showResult = selected !== null;
          const isCorrect = opt.isCorrect;
          const isWrongPick = isSelected && !isCorrect;
          const bg = !showResult
            ? T.surface
            : isCorrect
              ? T.correctBg
              : isWrongPick
                ? T.wrongBg
                : T.surface;
          const border = !showResult
            ? T.border
            : isCorrect
              ? T.correctBorder
              : isWrongPick
                ? T.wrongBorder
                : T.border;
          const color = !showResult
            ? T.text
            : isCorrect
              ? T.correct
              : isWrongPick
                ? T.wrong
                : T.textDim;
          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={selected !== null}
              style={{
                fontFamily: 'inherit',
                padding: '12px 14px',
                borderRadius: T.r.md,
                background: bg,
                border: `1.5px solid ${border}`,
                color,
                textAlign: 'left',
                cursor: selected !== null ? 'default' : 'pointer',
                fontSize: 13,
                lineHeight: 1.5,
                transition: 'all 0.15s',
                display: 'flex',
                gap: 8,
                alignItems: 'flex-start',
              }}
            >
              <span style={{ fontWeight: 700, flexShrink: 0, opacity: 0.5 }}>{i + 1})</span>
              <span>{opt.text}</span>
              {showResult && isCorrect && (
                <span style={{ marginLeft: 'auto', flexShrink: 0 }}>✓</span>
              )}
              {showResult && isWrongPick && (
                <span style={{ marginLeft: 'auto', flexShrink: 0 }}>✗</span>
              )}
            </button>
          );
        })}
      </div>

      {/* After-answer: pair comparison */}
      {selected !== null && (
        <div
          style={{
            marginTop: 14,
            padding: '14px 16px',
            borderRadius: T.r.md,
            background: T.surface,
            border: `1px solid ${T.border}`,
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: 1.5,
              color: T.textDim,
              textTransform: 'uppercase',
              marginBottom: 10,
            }}
          >
            Penjelasan Perbedaan
          </div>
          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 10, color: T.correct, fontWeight: 700, marginBottom: 4 }}>
              ✓ BENAR
            </div>
            <div
              style={{
                fontSize: 12,
                lineHeight: 1.65,
                color: T.text,
                padding: '8px 12px',
                background: T.correctBg,
                borderRadius: T.r.sm,
                border: `1px solid ${T.correctBorder}`,
              }}
            >
              {pair.correct}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: T.wrong, fontWeight: 700, marginBottom: 4 }}>
              ✗ JEBAKAN
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {pair.traps.map((trap, ti) => (
                <div
                  key={ti}
                  style={{
                    fontSize: 12,
                    lineHeight: 1.65,
                    color: T.textMuted,
                    padding: '8px 12px',
                    background: T.wrongBg,
                    borderRadius: T.r.sm,
                    border: `1px solid ${T.wrongBorder}`,
                  }}
                >
                  {trap}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Manual next */}
      {selected !== null && (
        <button
          onClick={() => {
            if (isLast) {
              setPhase('result');
            } else {
              setQIdx((i) => i + 1);
              setSelected(null);
            }
          }}
          style={{
            width: '100%',
            marginTop: 12,
            padding: '13px',
            fontSize: 13,
            fontWeight: 700,
            fontFamily: 'inherit',
            borderRadius: T.r.md,
            border: 'none',
            background: T.accent,
            color: T.textBright,
            cursor: 'pointer',
            animation: 'fadeIn 0.15s ease',
          }}
        >
          {isLast ? 'Lihat Hasil →' : 'Lanjut →'}
        </button>
      )}
    </div>
  );
}
