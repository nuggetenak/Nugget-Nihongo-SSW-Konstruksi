// ─── DangerMode.jsx ───────────────────────────────────────────────────────────
// Note: option bg/border/color is dynamic per answer state — justified inline.
// confusionType filter in panel; wrong-tracker write on wrong answers.
import { useState, useEffect, useCallback, useRef } from 'react';
import { T } from '../styles/theme.js';
import { shuffle } from '../utils/shuffle.js';
import { DANGER_PAIRS as PAIRS } from '../data/danger-pairs.js';
import { getGrade } from '../styles/theme.js';
import { useProgress } from '../contexts/ProgressContext.jsx';
import { useSessionTimer } from '../hooks/useSessionTimer.js';
import ProgressBar from '../components/ProgressBar.jsx';
import S from './modes.module.css';
import D from './DangerMode.module.css';

const CONFUSION_LABELS = {
  makna: { label: 'Makna Mirip', color: '#7C3AED' },
  kata: { label: 'Istilah Mirip', color: '#0284C7' },
  angka: { label: 'Angka/Warna', color: '#D97706' },
  prosedur: { label: 'Prosedur/Aturan', color: '#059669' },
};

export default function DangerMode({ onExit, onSessionEnd }) {
  const [view, setView] = useState('panel');
  const [filterType, setFilterType] = useState('all');
  return view === 'panel'
    ? <PanelView onExit={onExit} onStartQuiz={() => setView('quiz')} filterType={filterType} setFilterType={setFilterType} />
    : <QuizView onBack={() => setView('panel')} onSessionEnd={onSessionEnd} filterType={filterType} />;
}

function PanelView({ onExit, onStartQuiz, filterType, setFilterType }) {
  const [expanded, setExpanded] = useState(null);
  const filtered = filterType === 'all' ? PAIRS : PAIRS.filter((p) => p.confusionType === filterType);
  return (
    <div className={S.page}>
      <button className={S.btnBack} onClick={onExit}>← Kembali</button>
      <div className={`${S.rowSpread} ${D.headerRow}`}>
        <div>
          <h2 className={S.pageTitle}>⚠️ Soal Jebak</h2>
          <p className={`${S.pageSub} ${D.pageSub}`}>{PAIRS.length} istilah yang sering salah di ujian</p>
        </div>
        <button className={`${S.btnPrimary} ${D.drillBtn}`} onClick={onStartQuiz}>🧠 Drill ({filtered.length})</button>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
        {[['all', 'Semua', '#6B7280'], ...Object.entries(CONFUSION_LABELS).map(([k, v]) => [k, v.label, v.color])].map(([key, label, color]) => {
          const count = key === 'all' ? PAIRS.length : PAIRS.filter((p) => p.confusionType === key).length;
          const active = filterType === key;
          return (
            <button key={key} onClick={() => { setFilterType(key); setExpanded(null); }}
              style={{ fontFamily: 'inherit', padding: '4px 10px', borderRadius: 99, fontSize: 11, cursor: 'pointer',
                background: active ? color : 'transparent', color: active ? '#fff' : color,
                border: `1.5px solid ${color}`, fontWeight: active ? 700 : 400 }}>
              {label} {count}
            </button>
          );
        })}
      </div>
      <div className={S.list}>
        {filtered.map((pair, i) => {
          const isOpen = expanded === i;
          const cl = CONFUSION_LABELS[pair.confusionType];
          return (
            <div key={i}>
              <button
                onClick={() => setExpanded(isOpen ? null : i)}
                className={`${D.accordionBtn}${isOpen ? ` ${D.open}` : ''}`}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className={D.termJp}>{pair.term}</span>
                    {cl && <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 99, background: cl.color + '22', color: cl.color, fontWeight: 600 }}>{cl.label}</span>}
                  </div>
                  {pair.furi && <span className={D.termFuri}>{pair.furi}</span>}
                </div>
                <span className={D.chevron}>{isOpen ? '▲' : '▼'}</span>
              </button>
              {isOpen && (
                <div className={D.accordionPanel}>
                  <div style={{ marginBottom: 10 }}>
                    <div className={D.correctLabel}>✓ Jawaban Benar</div>
                    <div className={D.correctBox}>{pair.correct}</div>
                  </div>
                  <div>
                    <div className={D.wrongLabel}>✗ Jebakan Umum</div>
                    <div className={`${S.list} ${D.trapList}`}>
                      {pair.traps.map((trap, ti) => <div key={ti} className={D.wrongBox}>{trap}</div>)}
                    </div>
                  </div>
                  {pair.explanation && (
                    <div style={{ marginTop: 10, padding: '10px 12px', background: 'var(--ssw-surfaceActive)', borderRadius: 10, borderLeft: '3px solid var(--ssw-amber)' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ssw-amber)', marginBottom: 4 }}>💡 Kenapa sering tertukar?</div>
                      <div style={{ fontSize: 12, color: 'var(--ssw-text)', lineHeight: 1.6 }}>{pair.explanation}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function QuizView({ onBack, onSessionEnd, filterType }) {
  const { recordWrong } = useProgress();
  const buildFilteredItems = () => {
    const pool = filterType === 'all' ? PAIRS : PAIRS.filter((p) => p.confusionType === filterType);
    return shuffle(pool).map((pair) => {
      const allOpts = shuffle([{ text: pair.correct, isCorrect: true }, ...pair.traps.map((t) => ({ text: t, isCorrect: false }))]);
      return { pair, opts: allOpts, correctIdx: allOpts.findIndex((o) => o.isCorrect) };
    });
  };
  const [items, setItems] = useState(() => buildFilteredItems());
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const sessionFired = useRef(false);
  const { getDurationMs } = useSessionTimer();
  const [results, setResults] = useState([]);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [phase, setPhase] = useState('playing');

  const item = items[qIdx];
  const isLast = qIdx === items.length - 1;

  const handleSelect = useCallback((idx) => {
    if (selected !== null || phase !== 'playing') return;
    setSelected(idx);
    const isCorrect = idx === item.correctIdx;
    if (!isCorrect) {
      const key = `danger-${item.pair.term}`;
      recordWrong(key);
    }
    const ns = isCorrect ? streak + 1 : 0;
    setStreak(ns); setMaxStreak((m) => Math.max(m, ns));
    setResults((r) => [...r, { isCorrect, picked: idx, item }]);
  }, [selected, phase, item, streak, recordWrong]);

  useEffect(() => {
    if (selected === null || phase !== 'playing') return;
    const t = setTimeout(() => { if (isLast) setPhase('result'); else { setQIdx((i) => i + 1); setSelected(null); } }, 2500);
    return () => clearTimeout(t);
  }, [selected, phase, isLast]);

  useEffect(() => {
    const h = (e) => {
      if (phase !== 'playing') return;
      const MAP = { 1: 0, 2: 1, 3: 2, a: 0, b: 1, c: 2 };
      const k = e.key.toLowerCase();
      if (selected === null && MAP[k] !== undefined) handleSelect(MAP[k]);
      else if (selected !== null && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); if (isLast) setPhase('result'); else { setQIdx((i) => i + 1); setSelected(null); } }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [selected, phase, isLast, handleSelect]);

  const restart = () => { setItems(buildFilteredItems()); setQIdx(0); setSelected(null); setResults([]); setStreak(0); setMaxStreak(0); setPhase('playing'); sessionFired.current = false; };

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
      <div className={`${S.page} ${D.resultPage}`}>
        <div className={D.resultCard}>
          <div className={D.resultEmoji}>{grade.emoji}</div>
          <div className={D.resultPct} style={{ color: grade.color }}>{pct}%</div>
          <div className={D.resultLabel}>{grade.label}</div>
          <div className={D.resultSub}>{correct}/{total} benar{maxStreak > 1 ? ` · 🔥 ${maxStreak} streak` : ''}</div>
        </div>
        <div className={`${S.row} ${D.resultActions}`}>
          <button className={`${S.btnPrimary} ${D.ulangBtn}`} onClick={restart}>🔄 Ulang</button>
          <button className={`${S.btnSecondary} ${D.panelBtn}`} onClick={onBack}>📋 Panel</button>
        </div>
        {wrongList.length > 0 && (
          <>
            <div className={S.sectionLabel}>Review Salah ({wrongList.length})</div>
            <div className={S.list} style={{ gap: 10 }}>
              {wrongList.map((r, i) => {
                const p = r.item.pair;
                const pickedText = r.item.opts[r.picked]?.text;
                return (
                  <div key={i} className={D.reviewItem} style={{ animation: `slideUp 0.3s ease ${i * 0.05}s both` }}>
                    <div className={D.reviewItemHeader}>
                      <span className={D.reviewItemHeaderJp}>{p.term}</span>
                      {p.furi && <span className={D.reviewItemHeaderFuri}>{p.furi}</span>}
                    </div>
                    <div className={D.reviewItemBody}>
                      <div className={D.reviewWrongText}>✗ {pickedText}</div>
                      <div className={D.reviewCorrectText}>✓ {p.correct}</div>
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

  if (!item) return null;
  const { pair, opts } = item;

  return (
    <div className={`${S.pageScroll} ${D.quizPage}`}>
      <div className={`${S.rowSpread} ${D.quizHeader}`}>
        <button className={S.btnBack} style={{ marginBottom: 0 }} onClick={onBack}>← Soal Jebak</button>
        <div className={S.row} style={{ fontSize: 12 }}>
          <span className={D.scoreBadge}>{results.filter((r) => r.isCorrect).length}/{qIdx + (selected !== null ? 1 : 0)}</span>
          {streak > 1 && <span className={D.streakBadge}>🔥{streak}</span>}
        </div>
      </div>
      <ProgressBar current={qIdx + (selected !== null ? 1 : 0)} total={items.length} color={T.wrong} />
      <div className={S.counter}>{qIdx + 1} / {items.length}</div>

      <div className={`${S.cardLg} ${D.questionCard}`}>
        <div className={D.questionHint}>⚠️ Jangan tertukar! Pilih arti yang BENAR</div>
        <div className={D.questionTerm}>{pair.term}</div>
        {pair.furi && <div className={D.questionFuri}>{pair.furi}</div>}
      </div>

      <div className={S.list}>
        {opts.map((opt, i) => {
          const isSelected = selected === i;
          const showResult = selected !== null;
          const isCorrect = opt.isCorrect;
          const isWrongPick = isSelected && !isCorrect;
          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              disabled={selected !== null}
              style={{
                fontFamily: 'inherit',
                padding: '12px 14px',
                borderRadius: T.r.md,
                background: !showResult ? T.surface : isCorrect ? T.correctBg : isWrongPick ? T.wrongBg : T.surface,
                border: `1.5px solid ${!showResult ? T.border : isCorrect ? T.correctBorder : isWrongPick ? T.wrongBorder : T.border}`,
                color: !showResult ? T.text : isCorrect ? T.correct : isWrongPick ? T.wrong : T.textDim,
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
              <span className={D.optionLabel}>{i + 1})</span>
              <span>{opt.text}</span>
              {showResult && isCorrect && <span className={D.optionIcon}>✓</span>}
              {showResult && isWrongPick && <span className={D.optionIcon}>✗</span>}
            </button>
          );
        })}
      </div>

      {selected !== null && (
        <div className={`${S.card} ${D.explanationCard}`}>
          <div className={`${S.sectionLabel} ${D.explanationHeader}`}>Penjelasan Perbedaan</div>
          <div style={{ marginBottom: 8 }}>
            <div className={D.explanationCorrectLabel}>✓ BENAR</div>
            <div className={D.explanationCorrectBox}>{pair.correct}</div>
          </div>
          <div>
            <div className={D.explanationWrongLabel}>✗ JEBAKAN</div>
            <div className={`${S.list} ${D.trapList}`}>
              {pair.traps.map((trap, ti) => <div key={ti} className={D.wrongBox}>{trap}</div>)}
            </div>
          </div>
          {pair.explanation && (
            <div style={{ marginTop: 10, padding: '10px 12px', background: 'var(--ssw-surfaceActive)', borderRadius: 10, borderLeft: '3px solid var(--ssw-amber)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ssw-amber)', marginBottom: 4 }}>💡 Kenapa sering tertukar?</div>
              <div style={{ fontSize: 12, color: 'var(--ssw-text)', lineHeight: 1.6 }}>{pair.explanation}</div>
            </div>
          )}
        </div>
      )}
      {selected !== null && (
        <button className={`${S.btnPrimary} ${D.nextBtn}`} onClick={() => { if (isLast) setPhase('result'); else { setQIdx((i) => i + 1); setSelected(null); } }}>
          {isLast ? 'Lihat Hasil →' : 'Lanjut →'}
        </button>
      )}
    </div>
  );
}
