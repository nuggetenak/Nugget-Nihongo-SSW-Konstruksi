// ─── ConfusionMode.jsx ────────────────────────────────────────────────────────
// VLT-style confusion pair mode: presents two similar JP terms and tests whether
// user can correctly match each term to its Indonesian definition.
// Targets lexical confusion errors that lead to wrong answers on JAC exam.
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useCallback, useEffect, useRef } from 'react';
import { T } from '../styles/theme.js';
import { shuffle } from '../utils/shuffle.js';
import { stripFuri, JP_LIST_MAX_SECONDARY } from '../utils/jp-helpers.js';
import { CONFUSION_PAIRS } from '../data/confusion-pairs.js';
import { JpFront } from '../components/JpDisplay.jsx';
import QuizAnnouncer from '../components/QuizAnnouncer.jsx';
import ResultScreen from '../components/ResultScreen.jsx';
import { haptic } from '../utils/haptic.js';
import { useApp } from '../contexts/AppContext.jsx';
import { useSessionTimer } from '../hooks/useSessionTimer.js';
import ProgressBar from '../components/ProgressBar.jsx';
import S from './modes.module.css';

// Detail view shows termA/termB as two separate stacked cards, each with its
// own definition -- not side by side, but still presented as a matched pair
// a learner is meant to compare, so a 2-character termA hitting jpFontSize's
// 28px tier next to a 6-character termB at 20px would undercut the point of
// the comparison. Restores the weight the surrounding fontSize:24 wrapper
// already signals (JpFront's own inline size otherwise overrides it
// silently) as a shared ceiling for both cards.
const CONFUSION_DETAIL_MAX = 24;
// The quiz screen's own termA/termB pairing is the clearest case of the
// three in this file: a CSS grid literally places them side by side
// (1fr auto 1fr, "vs" in the middle column), so any size mismatch is
// immediately visible in the same row rather than between scrolled cards.
const CONFUSION_QUIZ_MAX = 20;

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

export default function ConfusionMode({ onSessionEnd }) {
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
      onStartQuiz={() => setView('quiz')}
      onOpenDetail={(pair) => {
        setSelectedPair(pair);
        setView('detail');
      }}
    />
  );
}

// ── Panel ─────────────────────────────────────────────────────────────────────
function PanelView({ pairs, filtered, filterType, onFilterChange, onStartQuiz, onOpenDetail }) {
  const { prefs } = useApp();
  const furiganaPolicy = prefs?.furiganaPolicy ?? 'always';
  const types = ['all', '音', '字', '意'];
  const typeCount = (t) => (t === 'all' ? pairs.length : pairs.filter((p) => p.type === t).length);

  return (
    <div className={S.page}>
      <div className={S.rowSpread} style={{ marginBottom: 4, alignItems: 'flex-start' }}>
        <div>
          <p className={S.pageSub}>{pairs.length} pasang kata yang sering tertukar di ujian</p>
        </div>
        <button
          className={S.btnPrimary}
          style={{ width: 'auto', padding: '10px 18px', fontSize: 'var(--fs-body)' }}
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
                fontSize: 'var(--fs-caption)',
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
                      fontSize: 'var(--fs-micro)',
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
                <span style={{ fontSize: 'var(--fs-micro)', color: T.textDim }}>詳細 →</span>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: T.text,
                    }}
                  >
                    <JpFront
                      jp={pair.termA}
                      furiganaPolicy={furiganaPolicy}
                      maxSize={JP_LIST_MAX_SECONDARY}
                      compact
                    />
                  </div>
                </div>
                <div style={{ color: T.textDim, fontSize: 18, alignSelf: 'center' }}>vs</div>
                <div style={{ flex: 1, textAlign: 'right' }}>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 700,
                      color: T.text,
                    }}
                  >
                    <JpFront
                      jp={pair.termB}
                      furiganaPolicy={furiganaPolicy}
                      maxSize={JP_LIST_MAX_SECONDARY}
                      compact
                    />
                  </div>
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
  const { prefs } = useApp();
  const furiganaPolicy = prefs?.furiganaPolicy ?? 'always';
  const meta = TYPE_LABEL[pair.type] ?? {};
  return (
    <div className={S.pageFade} style={{ padding: 'var(--sp-5) var(--sp-4)' }}>
      <button className={S.btnBack} onClick={onBack}>
        ← Kata Mirip
      </button>

      <div style={{ marginBottom: 4 }}>
        <span
          style={{
            fontSize: 'var(--fs-small)',
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
            marginBottom: 4,
          }}
        >
          <JpFront jp={pair.termA} furiganaPolicy={furiganaPolicy} maxSize={CONFUSION_DETAIL_MAX} />
        </div>
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
            marginBottom: 4,
          }}
        >
          <JpFront jp={pair.termB} furiganaPolicy={furiganaPolicy} maxSize={CONFUSION_DETAIL_MAX} />
        </div>
        <div style={{ fontSize: 14, color: T.text, lineHeight: 1.6 }}>{pair.defB}</div>
      </div>

      {/* Tip */}
      {pair.tip && (
        <div
          className={S.card}
          style={{ background: `rgba(245,158,11,0.08)`, border: `1px solid rgba(245,158,11,0.25)` }}
        >
          <div
            style={{
              fontSize: 'var(--fs-small)',
              fontWeight: 700,
              color: T.amber,
              marginBottom: 6,
            }}
          >
            💡 Cara Bedakan
          </div>
          <div style={{ fontSize: 'var(--fs-body)', color: T.text, lineHeight: 1.6 }}>
            {pair.tip}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Quiz ──────────────────────────────────────────────────────────────────────
function QuizView({ pairs, onBack, onSessionEnd }) {
  const { prefs } = useApp();
  const furiganaPolicy = prefs?.furiganaPolicy ?? 'always';
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
    const wrongList = results.filter((r) => !r.isCorrect);

    return (
      <ResultScreen
        correct={correct}
        total={total}
        review={wrongList.map((r) => {
          const p = r.q.pair;
          return {
            question: `${p.termA} vs ${p.termB}`,
            userAnswer: r.q.opts[r.picked]?.text || '',
            correctAnswer: p.defA,
            explanation: p.tip || '',
          };
        })}
        onRestart={() => {
          setQIdx(0);
          setSelected(null);
          setResults([]);
          setPhase('playing');
          sessionFired.current = false;
        }}
        onExit={onBack}
      />
    );
  }

  // ── Playing ────────────────────────────────────────────────────────────────
  const showResult = selected !== null;

  return (
    <div className={S.pageScroll} style={{ padding: 'var(--sp-4)' }}>
      <QuizAnnouncer
        isCorrect={selected !== null ? selected === correctIdx : null}
        correctText={opts[correctIdx]?.text}
      />
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
        <div style={{ fontSize: 'var(--fs-caption)', color: T.textDim }}>
          {results.filter((r) => r.isCorrect).length}/{qIdx + (selected !== null ? 1 : 0)} ·{' '}
          {qIdx + 1}/{questions.length}
        </div>
      </div>

      <ProgressBar current={qIdx + (showResult ? 1 : 0)} total={questions.length} color={T.amber} />

      {/* Type badge */}
      <div style={{ textAlign: 'center', margin: '12px 0 8px' }}>
        <span
          style={{
            fontSize: 'var(--fs-small)',
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
              fontSize: 'var(--fs-jp-back)',
              fontWeight: 800,
              color: T.amber,
            }}
          >
            <JpFront jp={pair.termA} furiganaPolicy={furiganaPolicy} maxSize={CONFUSION_QUIZ_MAX} />
          </div>
        </div>
        <div style={{ fontSize: 'var(--fs-body)', color: T.textDim, fontWeight: 700 }}>vs</div>
        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              fontSize: 'var(--fs-jp-back)',
              fontWeight: 800,
              color: T.text,
            }}
          >
            <JpFront jp={pair.termB} furiganaPolicy={furiganaPolicy} maxSize={CONFUSION_QUIZ_MAX} />
          </div>
        </div>
      </div>

      {/* Question prompt */}
      <div
        style={{
          fontSize: 'var(--fs-body)',
          color: T.textMuted,
          textAlign: 'center',
          marginBottom: 12,
          fontWeight: 600,
        }}
      >
        ❓ Pilih arti yang benar untuk{' '}
        <span style={{ color: T.amber }}>{stripFuri(pair.termA)}</span>
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
                animation: !showResult
                  ? 'none'
                  : isCorrectOpt
                    ? 'correctFlash 0.5s ease'
                    : isWrongPick
                      ? 'wrongShake 0.45s ease'
                      : 'none',
                color: !showResult
                  ? T.text
                  : isCorrectOpt
                    ? T.correct
                    : isWrongPick
                      ? T.wrong
                      : T.textDim,
                textAlign: 'left',
                cursor: showResult ? 'default' : 'pointer',
                fontSize: 'var(--fs-body)',
                lineHeight: 1.5,
                transition: 'all var(--t-fast)',
                display: 'flex',
                gap: 8,
                alignItems: 'flex-start',
              }}
            >
              <span style={{ fontWeight: 700, minWidth: 18, color: T.textDim }}>{i + 1})</span>
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
            <span style={{ fontSize: 'var(--fs-small)', color: T.amber, fontWeight: 700 }}>
              {stripFuri(pair.termA)}
            </span>
            <span style={{ fontSize: 'var(--fs-small)', color: T.textDim }}> = {pair.defA}</span>
          </div>
          <div style={{ marginBottom: pair.tip ? 10 : 0 }}>
            <span style={{ fontSize: 'var(--fs-small)', color: T.textMuted, fontWeight: 700 }}>
              {stripFuri(pair.termB)}
            </span>
            <span style={{ fontSize: 'var(--fs-small)', color: T.textDim }}> = {pair.defB}</span>
          </div>
          {pair.tip && (
            <div
              style={{
                fontSize: 'var(--fs-caption)',
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
