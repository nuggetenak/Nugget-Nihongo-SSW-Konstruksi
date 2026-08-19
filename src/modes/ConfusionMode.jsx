// ─── ConfusionMode.jsx ────────────────────────────────────────────────────────
// VLT-style confusion pair mode: presents two similar JP terms and tests whether
// user can correctly match each term to its Indonesian definition.
// Targets lexical confusion errors that lead to wrong answers on JAC exam.
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useCallback, useEffect, useRef } from 'react';
import { T } from '../styles/theme.js';
import { shuffle } from '../utils/shuffle.js';
import { CONFUSION_PAIRS } from '../data/confusion-pairs.js';
import { getGrade } from '../styles/theme.js';
import { haptic } from '../utils/haptic.js';
import { useSessionTimer } from '../hooks/useSessionTimer.js';
import ProgressBar from '../components/ProgressBar.jsx';
import S from './modes.module.css';

const TYPE_LABEL = {
  音: { label: '発音', color: '#7C3AED', bg: 'rgba(124,58,237,0.10)', desc: 'Bunyi mirip' },
  字: { label: '漢字', color: '#0284C7', bg: 'rgba(2,132,199,0.10)', desc: 'Kanji mirip' },
  意: { label: '意味', color: '#059669', bg: 'rgba(5,150,105,0.10)', desc: 'Makna mirip' },
};

function buildQuestions(pairs) {
  // Each pair generates ONE question: show termA and termB, show 2 definitions in shuffled order,
  // user matches Term A → correct def. (Then we reveal both.)
  return shuffle(pairs).map((pair) => {
    // Shuffle the definitions so A's def isn't always first
    const opts = shuffle([
      { text: pair.defA, isA: true },
      { text: pair.defB, isA: false },
    ]);
    return { pair, opts, correctIdx: opts.findIndex((o) => o.isA) };
  });
}

export default function ConfusionMode({ onExit, onSessionEnd }) {
  const [view, setView] = useState('panel'); // 'panel' | 'quiz' | 'detail'
  const [selectedPair, setSelectedPair] = useState(null);
  const [filterType, setFilterType] = useState('all');

  const filtered =
    filterType === 'all' ? CONFUSION_PAIRS : CONFUSION_PAIRS.filter((p) => p.type === filterType);

  if (view === 'quiz') {
    return (
      <QuizView pairs={filtered} onBack={() => setView('panel')} onSessionEnd={onSessionEnd} />
    );
  }

  if (view === 'detail' && selectedPair) {
    return <DetailView pair={selectedPair} onBack={() => setView('panel')} />;
  }

  return (
    <PanelView
      pairs={CONFUSION_PAIRS}
      filtered={filtered}
      filterType={filterType}
      onFilterChange={setFilterType}
      onExit={onExit}
      onStartQuiz={() => setView('quiz')}
      onOpenDetail={(pair) => {
        setSelectedPair(pair);
        setView('detail');
      }}
    />
  );
}

// ── Panel ─────────────────────────────────────────────────────────────────────
function PanelView({
  pairs,
  filtered,
  filterType,
  onFilterChange,
  onExit,
  onStartQuiz,
  onOpenDetail,
}) {
  const types = ['all', '音', '字', '意'];
  const typeCount = (t) => (t === 'all' ? pairs.length : pairs.filter((p) => p.type === t).length);

  return (
    <div className={S.page}>
      <button className={S.btnBack} onClick={onExit}>
        ← Kembali
      </button>

      <div className={S.rowSpread} style={{ marginBottom: 4, alignItems: 'flex-start' }}>
        <div>
          <h2 className={S.pageTitle}>🔀 Kata Mirip</h2>
          <p className={S.pageSub}>{pairs.length} pasang kata yang sering tertukar di ujian</p>
        </div>
        <button
          className={S.btnPrimary}
          style={{ padding: '10px 18px', fontSize: 13 }}
          onClick={onStartQuiz}
        >
          🧠 Kuis
        </button>
      </div>

      {/* Filter chips */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {types.map((t) => {
          const meta = TYPE_LABEL[t] ?? { label: 'Semua', color: T.amber, bg: T.surface, desc: '' };
          const active = filterType === t;
          return (
            <button
              key={t}
              onClick={() => onFilterChange(t)}
              style={{
                fontFamily: 'inherit',
                padding: '5px 12px',
                fontSize: 12,
                borderRadius: T.r.pill,
                cursor: 'pointer',
                fontWeight: active ? 700 : 500,
                background: active ? (meta.bg ?? T.surfaceActive) : T.surface,
                border: `1px solid ${active ? (meta.color ?? T.amber) : T.border}`,
                color: active ? (meta.color ?? T.amber) : T.textMuted,
              }}
            >
              {t === 'all'
                ? `Semua (${typeCount(t)})`
                : `${meta.label} · ${meta.desc} (${typeCount(t)})`}
            </button>
          );
        })}
      </div>

      <div className={S.list}>
        {filtered.map((pair, i) => {
          const meta = TYPE_LABEL[pair.type] ?? {};
          return (
            <button
              key={i}
              className={S.btnItem}
              onClick={() => onOpenDetail(pair)}
              style={{ textAlign: 'left' }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 6,
                }}
              >
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: '2px 7px',
                      borderRadius: T.r.pill,
                      background: meta.bg,
                      color: meta.color,
                    }}
                  >
                    {meta.desc}
                  </span>
                </div>
                <span style={{ fontSize: 10, color: T.textFaint }}>詳細 →</span>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      fontFamily: 'Noto Sans JP, sans-serif',
                      color: T.text,
                    }}
                  >
                    {pair.termA}
                  </div>
                  {pair.furiA && <div style={{ fontSize: 10, color: T.textDim }}>{pair.furiA}</div>}
                </div>
                <div style={{ color: T.textFaint, fontSize: 18, alignSelf: 'center' }}>vs</div>
                <div style={{ flex: 1, textAlign: 'right' }}>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      fontFamily: 'Noto Sans JP, sans-serif',
                      color: T.text,
                    }}
                  >
                    {pair.termB}
                  </div>
                  {pair.furiB && <div style={{ fontSize: 10, color: T.textDim }}>{pair.furiB}</div>}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Detail view ───────────────────────────────────────────────────────────────
function DetailView({ pair, onBack }) {
  const meta = TYPE_LABEL[pair.type] ?? {};
  return (
    <div className={S.pageFade} style={{ padding: 'var(--sp-5) var(--sp-4)' }}>
      <button className={S.btnBack} onClick={onBack}>
        ← Kata Mirip
      </button>

      <div style={{ marginBottom: 4 }}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            padding: '3px 9px',
            borderRadius: T.r.pill,
            background: meta.bg,
            color: meta.color,
            display: 'inline-block',
            marginBottom: 12,
          }}
        >
          {meta.desc}
        </span>
      </div>

      {/* Term A */}
      <div className={S.card} style={{ marginBottom: 12, borderLeft: `3px solid ${T.amber}` }}>
        <div
          style={{
            fontSize: 24,
            fontWeight: 800,
            fontFamily: 'Noto Sans JP, sans-serif',
            marginBottom: 4,
          }}
        >
          {pair.termA}
        </div>
        {pair.furiA && (
          <div style={{ fontSize: 12, color: T.textDim, marginBottom: 8 }}>{pair.furiA}</div>
        )}
        <div style={{ fontSize: 14, color: T.text, lineHeight: 1.6 }}>{pair.defA}</div>
      </div>

      {/* Term B */}
      <div
        className={S.card}
        style={{ marginBottom: 12, borderLeft: `3px solid ${T.borderActive}` }}
      >
        <div
          style={{
            fontSize: 24,
            fontWeight: 800,
            fontFamily: 'Noto Sans JP, sans-serif',
            marginBottom: 4,
          }}
        >
          {pair.termB}
        </div>
        {pair.furiB && (
          <div style={{ fontSize: 12, color: T.textDim, marginBottom: 8 }}>{pair.furiB}</div>
        )}
        <div style={{ fontSize: 14, color: T.text, lineHeight: 1.6 }}>{pair.defB}</div>
      </div>

      {/* Tip */}
      {pair.tip && (
        <div
          className={S.card}
          style={{ background: `rgba(245,158,11,0.08)`, border: `1px solid rgba(245,158,11,0.25)` }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, color: T.amber, marginBottom: 6 }}>
            💡 Cara Bedakan
          </div>
          <div style={{ fontSize: 13, color: T.text, lineHeight: 1.6 }}>{pair.tip}</div>
        </div>
      )}
    </div>
  );
}

// ── Quiz ──────────────────────────────────────────────────────────────────────
function QuizView({ pairs, onBack, onSessionEnd }) {
  const [questions] = useState(() => buildQuestions(pairs));
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [results, setResults] = useState([]);
  const [phase, setPhase] = useState('playing'); // 'playing' | 'result'
  const sessionFired = useRef(false);
  const { getDurationMs } = useSessionTimer();

  const q = questions[qIdx];
  const isLast = qIdx === questions.length - 1;
  const { pair, opts, correctIdx } = q;
  const meta = TYPE_LABEL[pair.type] ?? {};

  const handleSelect = useCallback(
    (idx) => {
      if (selected !== null || phase !== 'playing') return;
      setSelected(idx);
      const isCorrect = idx === correctIdx;
      if (isCorrect) haptic.correct();
      else haptic.wrong();
      setResults((r) => [...r, { isCorrect, picked: idx, q }]);
    },
    [selected, phase, correctIdx, q]
  );

  useEffect(() => {
    if (selected === null || phase !== 'playing') return;
    const t = setTimeout(() => {
      if (isLast) setPhase('result');
      else {
        setQIdx((i) => i + 1);
        setSelected(null);
      }
    }, 2800);
    return () => clearTimeout(t);
  }, [selected, phase, isLast]);

  useEffect(() => {
    const h = (e) => {
      if (phase !== 'playing') return;
      const MAP = { 1: 0, 2: 1, a: 0, b: 1 };
      const k = e.key.toLowerCase();
      if (selected === null && MAP[k] !== undefined) handleSelect(MAP[k]);
      else if (selected !== null && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        if (isLast) setPhase('result');
        else {
          setQIdx((i) => i + 1);
          setSelected(null);
        }
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [selected, phase, isLast, handleSelect]);

  useEffect(() => {
    if (phase !== 'result' || sessionFired.current) return;
    sessionFired.current = true;
    const correct = results.filter((r) => r.isCorrect).length;
    onSessionEnd?.({ correct, total: results.length, durationMs: getDurationMs() });
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  if (phase === 'result') {
    const correct = results.filter((r) => r.isCorrect).length;
    const total = results.length;
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
    const grade = getGrade(pct);
    const wrongList = results.filter((r) => !r.isCorrect);

    return (
      <div className={S.pageScroll} style={{ padding: 'var(--sp-5) var(--sp-4)' }}>
        <div
          style={{
            background: T.surface,
            border: `1px solid ${T.border}`,
            borderRadius: 16,
            padding: '24px 20px',
            textAlign: 'center',
            marginBottom: 20,
            animation: 'popIn 0.35s var(--ease-spring) both',
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 8 }}>{grade.emoji}</div>
          <div style={{ fontSize: 40, fontWeight: 900, color: grade.color }}>{pct}%</div>
          <div style={{ fontSize: 15, color: T.textMuted, marginTop: 4 }}>
            {correct}/{total} benar · Kata Mirip
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          <button
            className={S.btnPrimary}
            style={{ flex: 1 }}
            onClick={() => {
              setQIdx(0);
              setSelected(null);
              setResults([]);
              setPhase('playing');
              sessionFired.current = false;
            }}
          >
            🔄 Ulang
          </button>
          <button className={S.btnSecondary} style={{ flex: 1 }} onClick={onBack}>
            📋 Panel
          </button>
        </div>

        {wrongList.length > 0 && (
          <>
            <div className={S.sectionLabel}>Review Salah ({wrongList.length})</div>
            <div className={S.list} style={{ gap: 10 }}>
              {wrongList.map((r, i) => {
                const p = r.q.pair;
                const pickedText = r.q.opts[r.picked]?.text;
                return (
                  <div
                    key={i}
                    className={S.card}
                    style={{
                      animation: `slideUp 0.25s ease ${i * 0.05}s both`,
                      borderLeft: `3px solid ${T.wrong}`,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        gap: 8,
                        marginBottom: 8,
                        fontFamily: 'Noto Sans JP, sans-serif',
                      }}
                    >
                      <span style={{ fontSize: 16, fontWeight: 700 }}>{p.termA}</span>
                      <span style={{ color: T.textFaint }}>vs</span>
                      <span style={{ fontSize: 16, fontWeight: 700 }}>{p.termB}</span>
                    </div>
                    <div style={{ fontSize: 12, color: T.wrong, marginBottom: 4 }}>
                      ✗ dipilih: {pickedText}
                    </div>
                    <div style={{ fontSize: 12, color: T.correct }}>
                      ✓ {p.termA} = {p.defA}
                    </div>
                    {p.tip && (
                      <div
                        style={{ fontSize: 11, color: T.textDim, marginTop: 6, lineHeight: 1.5 }}
                      >
                        💡 {p.tip}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    );
  }

  // ── Playing ────────────────────────────────────────────────────────────────
  const showResult = selected !== null;

  return (
    <div className={S.pageScroll} style={{ padding: 'var(--sp-4)' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <button className={S.btnBack} style={{ marginBottom: 0 }} onClick={onBack}>
          ← Kata Mirip
        </button>
        <div style={{ fontSize: 12, color: T.textDim }}>
          {results.filter((r) => r.isCorrect).length}/{qIdx + (selected !== null ? 1 : 0)} ·{' '}
          {qIdx + 1}/{questions.length}
        </div>
      </div>

      <ProgressBar current={qIdx + (showResult ? 1 : 0)} total={questions.length} color={T.amber} />

      {/* Type badge */}
      <div style={{ textAlign: 'center', margin: '12px 0 8px' }}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            padding: '3px 10px',
            borderRadius: T.r.pill,
            background: meta.bg,
            color: meta.color,
          }}
        >
          {meta.desc}
        </span>
      </div>

      {/* The two terms side by side */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto 1fr',
          gap: 8,
          alignItems: 'center',
          background: T.surface,
          border: `1px solid ${T.border}`,
          borderRadius: 14,
          padding: '16px 14px',
          marginBottom: 16,
          animation: 'scaleIn 0.2s var(--ease-smooth)',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontSize: 20,
              fontWeight: 800,
              fontFamily: 'Noto Sans JP, sans-serif',
              color: T.amber,
            }}
          >
            {pair.termA}
          </div>
          {pair.furiA && <div style={{ fontSize: 11, color: T.textDim }}>{pair.furiA}</div>}
        </div>
        <div style={{ fontSize: 13, color: T.textFaint, fontWeight: 700 }}>vs</div>
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontSize: 20,
              fontWeight: 800,
              fontFamily: 'Noto Sans JP, sans-serif',
              color: T.text,
            }}
          >
            {pair.termB}
          </div>
          {pair.furiB && <div style={{ fontSize: 11, color: T.textDim }}>{pair.furiB}</div>}
        </div>
      </div>

      {/* Question prompt */}
      <div
        style={{
          fontSize: 13,
          color: T.textMuted,
          textAlign: 'center',
          marginBottom: 12,
          fontWeight: 600,
        }}
      >
        ❓ Pilih arti yang benar untuk{' '}
        <span style={{ color: T.amber, fontFamily: 'Noto Sans JP, sans-serif' }}>{pair.termA}</span>
      </div>

      {/* Options */}
      <div className={S.list} style={{ gap: 10, marginBottom: 16 }}>
        {opts.map((opt, i) => {
          const isSelected = selected === i;
          const isCorrectOpt = opt.isA; // term A's definition is the correct answer
          const isWrongPick = isSelected && !isCorrectOpt;

          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={showResult}
              style={{
                fontFamily: 'inherit',
                padding: '14px 16px',
                borderRadius: 12,
                background: !showResult
                  ? T.surface
                  : isCorrectOpt
                    ? T.correctBg
                    : isWrongPick
                      ? T.wrongBg
                      : T.surface,
                border: `1.5px solid ${!showResult ? T.border : isCorrectOpt ? T.correctBorder : isWrongPick ? T.wrongBorder : T.border}`,
                color: !showResult
                  ? T.text
                  : isCorrectOpt
                    ? T.correct
                    : isWrongPick
                      ? T.wrong
                      : T.textDim,
                textAlign: 'left',
                cursor: showResult ? 'default' : 'pointer',
                fontSize: 13,
                lineHeight: 1.5,
                transition: 'all var(--t-fast)',
                display: 'flex',
                gap: 8,
                alignItems: 'flex-start',
              }}
            >
              <span style={{ fontWeight: 700, minWidth: 18, color: T.textFaint }}>{i + 1})</span>
              <span style={{ flex: 1 }}>{opt.text}</span>
              {showResult && isCorrectOpt && <span>✓</span>}
              {showResult && isWrongPick && <span>✗</span>}
            </button>
          );
        })}
      </div>

      {/* Reveal panel with both definitions + tip */}
      {showResult && (
        <div
          className={S.card}
          style={{
            background: `rgba(245,158,11,0.06)`,
            border: `1px solid rgba(245,158,11,0.22)`,
            animation: 'slideUp 0.2s var(--ease-smooth)',
          }}
        >
          <div style={{ marginBottom: 8 }}>
            <span style={{ fontSize: 11, color: T.amber, fontWeight: 700 }}>{pair.termA}</span>
            <span style={{ fontSize: 11, color: T.textDim }}> = {pair.defA}</span>
          </div>
          <div style={{ marginBottom: pair.tip ? 10 : 0 }}>
            <span style={{ fontSize: 11, color: T.textMuted, fontWeight: 700 }}>{pair.termB}</span>
            <span style={{ fontSize: 11, color: T.textDim }}> = {pair.defB}</span>
          </div>
          {pair.tip && (
            <div
              style={{
                fontSize: 12,
                color: T.text,
                lineHeight: 1.5,
                borderTop: `1px solid rgba(245,158,11,0.15)`,
                paddingTop: 8,
              }}
            >
              💡 {pair.tip}
            </div>
          )}
        </div>
      )}

      {showResult && (
        <button
          className={S.btnPrimary}
          style={{ marginTop: 12 }}
          onClick={() => {
            if (isLast) setPhase('result');
            else {
              setQIdx((i) => i + 1);
              setSelected(null);
            }
          }}
        >
          {isLast ? 'Lihat Hasil →' : 'Lanjut →'}
        </button>
      )}
    </div>
  );
}
