import { useState, useMemo, useEffect, useCallback } from 'react';
import { T } from '../styles/theme.js';
import { shuffle } from '../utils/shuffle.js';
import { ANGKA_KUNCI } from '../data/angka-kunci.js';
import { CARDS } from '../data/cards.js';
import { getGrade } from '../styles/theme.js';
import ProgressBar from '../components/ProgressBar.jsx';

// ANGKA_KUNCI shape: { angka, konteks, kartu }

// Group by rough topic based on konteks keywords
function getGroup(item) {
  const k = item.konteks.toLowerCase();
  if (
    k.includes('jam') ||
    k.includes('menit') ||
    k.includes('hari') ||
    k.includes('bulan') ||
    k.includes('tahun') ||
    k.includes('lembur') ||
    k.includes('cuti') ||
    k.includes('phk') ||
    k.includes('istirahat')
  )
    return 'Waktu & Ketenagakerjaan';
  if (
    k.includes('crane') ||
    k.includes('機械') ||
    k.includes('作業車') ||
    k.includes('高所') ||
    k.includes('玉掛') ||
    k.includes('t ') ||
    k.includes('m ') ||
    k.includes('mm') ||
    k.includes('pipa') ||
    k.includes('ulir') ||
    k.includes('galian') ||
    k.includes('kabel') ||
    k.includes('drone')
  )
    return 'Teknis Konstruksi';
  if (
    k.includes('%') ||
    k.includes('ccus') ||
    k.includes('stres') ||
    k.includes('保険') ||
    k.includes('tunjang') ||
    k.includes('premi')
  )
    return 'Keselamatan & Asuransi';
  if (
    k.includes('jenis') ||
    k.includes('ujian') ||
    k.includes('soal') ||
    k.includes('prometric') ||
    k.includes('izin') ||
    k.includes('検定')
  )
    return 'Ujian & Regulasi';
  return 'Lainnya';
}

const GROUP_ORDER = [
  'Waktu & Ketenagakerjaan',
  'Teknis Konstruksi',
  'Keselamatan & Asuransi',
  'Ujian & Regulasi',
  'Lainnya',
];

const GROUP_COLOR = {
  'Waktu & Ketenagakerjaan': '#0284C7',
  'Teknis Konstruksi': '#D97706',
  'Keselamatan & Asuransi': '#059669',
  'Ujian & Regulasi': '#7C3AED',
  Lainnya: '#6B7280',
};

function buildGroups() {
  const map = {};
  ANGKA_KUNCI.forEach((item) => {
    const g = getGroup(item);
    if (!map[g]) map[g] = [];
    map[g].push(item);
  });
  return GROUP_ORDER.filter((g) => map[g]).map((g) => ({
    label: g,
    color: GROUP_COLOR[g],
    items: map[g],
  }));
}

function buildQuizItems() {
  return shuffle(ANGKA_KUNCI).map((item) => {
    const distractors = shuffle(ANGKA_KUNCI.filter((x) => x !== item)).slice(0, 3);
    const opts = shuffle([
      { text: item.angka, isCorrect: true },
      ...distractors.map((d) => ({ text: d.angka, isCorrect: false })),
    ]);
    return { item, opts, correctIdx: opts.findIndex((o) => o.isCorrect) };
  });
}

export default function AngkaMode({ onExit }) {
  const [view, setView] = useState('panel'); // 'panel' | 'quiz'

  return view === 'panel' ? (
    <PanelView onExit={onExit} onStartQuiz={() => setView('quiz')} />
  ) : (
    <QuizView onBack={() => setView('panel')} />
  );
}

// ─── PANEL: Browse grouped ─────────────────────────────────────────────────
function PanelView({ onExit, onStartQuiz }) {
  const [expanded, setExpanded] = useState(null); // "groupIdx-itemIdx"
  const groups = useMemo(() => buildGroups(), []);

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
          <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>🔢 Angka Kunci</h2>
          <p style={{ fontSize: 13, color: T.textMuted }}>
            {ANGKA_KUNCI.length} angka WAJIB hafal sebelum ujian
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
          🧠 Kuis
        </button>
      </div>

      {/* Wajib hafal badge */}
      <div
        style={{
          padding: '10px 14px',
          borderRadius: T.r.md,
          background: 'rgba(220,38,38,0.07)',
          border: `1px solid rgba(220,38,38,0.25)`,
          marginBottom: 20,
          fontSize: 12,
          color: T.wrong,
          fontWeight: 600,
        }}
      >
        🚨 Wajib hafal sebelum ujian — sering muncul di soal Prometric SSW!
      </div>

      {groups.map((g, gi) => (
        <div key={g.label} style={{ marginBottom: 20 }}>
          {/* Group header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: g.color,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: 10,
                fontWeight: 800,
                color: g.color,
                letterSpacing: 1.5,
                textTransform: 'uppercase',
              }}
            >
              {g.label}
            </span>
            <div
              style={{
                flex: 1,
                height: 1,
                background: `linear-gradient(90deg,${g.color}30,transparent)`,
              }}
            />
            <span style={{ fontSize: 10, color: T.textDim }}>{g.items.length}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {g.items.map((item, ii) => {
              const key = `${gi}-${ii}`;
              const isOpen = expanded === key;
              const relCard = item.kartu ? CARDS.find((c) => c.id === item.kartu) : null;

              return (
                <div key={key}>
                  <button
                    onClick={() => setExpanded(isOpen ? null : key)}
                    style={{
                      fontFamily: 'inherit',
                      width: '100%',
                      padding: '11px 14px',
                      borderRadius: isOpen ? `${T.r.md}px ${T.r.md}px 0 0` : T.r.md,
                      background: isOpen ? `${g.color}14` : T.surface,
                      border: `1px solid ${isOpen ? `${g.color}40` : T.border}`,
                      color: T.text,
                      textAlign: 'left',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 800,
                        color: g.color,
                        fontVariantNumeric: 'tabular-nums',
                        flexShrink: 0,
                        minWidth: 64,
                      }}
                    >
                      {item.angka}
                    </span>
                    <span
                      style={{
                        fontSize: 12,
                        color: T.textMuted,
                        flex: 1,
                        lineHeight: 1.4,
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {item.konteks}
                    </span>
                    <span style={{ color: T.textDim, fontSize: 11, flexShrink: 0 }}>
                      {isOpen ? '▲' : '▼'}
                    </span>
                  </button>

                  {isOpen && (
                    <div
                      style={{
                        padding: '14px 16px',
                        background: `${g.color}08`,
                        border: `1px solid ${g.color}30`,
                        borderTop: 'none',
                        borderRadius: `0 0 ${T.r.md}px ${T.r.md}px`,
                        animation: 'fadeIn 0.15s ease',
                      }}
                    >
                      <div
                        style={{
                          fontSize: 22,
                          fontWeight: 800,
                          color: g.color,
                          fontVariantNumeric: 'tabular-nums',
                          marginBottom: 8,
                        }}
                      >
                        {item.angka}
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          lineHeight: 1.7,
                          color: T.text,
                          marginBottom: relCard ? 12 : 0,
                        }}
                      >
                        {item.konteks}
                      </div>
                      {relCard && (
                        <div
                          style={{
                            padding: '10px 12px',
                            background: T.surface,
                            borderRadius: T.r.sm,
                            border: `1px solid ${T.border}`,
                          }}
                        >
                          <div
                            style={{
                              fontSize: 10,
                              color: T.textDim,
                              letterSpacing: 1.2,
                              marginBottom: 6,
                            }}
                          >
                            KARTU #{relCard.id}
                          </div>
                          <div
                            style={{
                              fontFamily: T.fontJP,
                              fontSize: 16,
                              fontWeight: 700,
                              marginBottom: 4,
                            }}
                          >
                            {relCard.jp}
                          </div>
                          <div style={{ fontSize: 12, color: T.textMuted }}>{relCard.id_text}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── QUIZ: standalone ─────────────────────────────────────────────────────
function QuizView({ onBack }) {
  const [items, setItems] = useState(() => buildQuizItems());
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

  // Auto-next 2s
  useEffect(() => {
    if (selected === null || phase !== 'playing') return;
    const t = setTimeout(() => {
      if (isLast) {
        setPhase('result');
      } else {
        setQIdx((i) => i + 1);
        setSelected(null);
      }
    }, 2000);
    return () => clearTimeout(t);
  }, [selected, phase, isLast]);

  // Keyboard
  useEffect(() => {
    const h = (e) => {
      if (phase !== 'playing') return;
      const MAP = { 1: 0, 2: 1, 3: 2, 4: 3, a: 0, b: 1, c: 2, d: 3 };
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
    setItems(buildQuizItems());
    setQIdx(0);
    setSelected(null);
    setResults([]);
    setStreak(0);
    setMaxStreak(0);
    setPhase('playing');
  };

  // ── Result screen ─────────────────────────────────────────────────────────
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
            📋 Daftar
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {wrongList.map((r, i) => {
                const pickedText = r.item.opts[r.picked]?.text;
                return (
                  <div
                    key={i}
                    style={{
                      padding: '12px 14px',
                      borderRadius: T.r.md,
                      background: T.surface,
                      borderLeft: `3px solid ${T.wrong}`,
                      animation: `slideUp 0.3s ease ${i * 0.05}s both`,
                    }}
                  >
                    <div
                      style={{ fontSize: 12, color: T.textMuted, lineHeight: 1.5, marginBottom: 6 }}
                    >
                      {r.item.item.konteks}
                    </div>
                    <div style={{ fontSize: 12, color: T.wrong, marginBottom: 3 }}>
                      ✗ {pickedText}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.correct }}>
                      ✓ {r.item.item.angka}
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
  const { opts } = item;
  const color = '#0284C7'; // teal accent for angka

  return (
    <div
      style={{
        padding: '12px 16px 24px',
        maxWidth: T.maxW,
        margin: '0 auto',
        animation: 'fadeIn 0.2s ease',
      }}
    >
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
          ← Angka Kunci
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
        color={color}
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
          background: `${color}0E`,
          borderRadius: T.r.lg,
          border: `2px solid ${color}35`,
          marginBottom: 14,
          animation: 'fadeIn 0.2s ease',
        }}
      >
        <div
          style={{
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: 2,
            color,
            textTransform: 'uppercase',
            marginBottom: 10,
          }}
        >
          Angka berapa untuk…
        </div>
        <div style={{ fontSize: 15, lineHeight: 1.7, fontFamily: T.fontJP, fontWeight: 600 }}>
          {item.item.konteks}
        </div>
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
          const txtColor = !showResult
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
                color: txtColor,
                textAlign: 'left',
                cursor: selected !== null ? 'default' : 'pointer',
                fontSize: 14,
                fontWeight: 700,
                fontVariantNumeric: 'tabular-nums',
                transition: 'all 0.15s',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span>{opt.text}</span>
              {showResult && isCorrect && <span>✓</span>}
              {showResult && isWrongPick && <span>✗</span>}
            </button>
          );
        })}
      </div>

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
