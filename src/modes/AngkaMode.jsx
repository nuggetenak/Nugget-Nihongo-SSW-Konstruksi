// ─── AngkaMode.jsx ────────────────────────────────────────────────────────────
// Note: option bg/border/color is dynamic per answer state — justified inline.
// Note: group color usage on item borders/bg is per-group — justified inline.
import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { T } from '../styles/theme.js';
import { shuffle } from '../utils/shuffle.js';
import { ANGKA_KUNCI as ANGKA } from '../data/angka-kunci.js';
import { CARDS } from '../data/cards.js';
import { getGrade } from '../styles/theme.js';
import { useSessionTimer } from '../hooks/useSessionTimer.js';
import ProgressBar from '../components/ProgressBar.jsx';
import S from './modes.module.css';
import A from './AngkaMode.module.css';

const ANGKA_COLOR = '#0284C7';

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
  ANGKA.forEach((item) => {
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
  return shuffle(ANGKA).map((item) => {
    const distractors = shuffle(ANGKA.filter((x) => x !== item)).slice(0, 3);
    const opts = shuffle([
      { text: item.angka, isCorrect: true },
      ...distractors.map((d) => ({ text: d.angka, isCorrect: false })),
    ]);
    return { item, opts, correctIdx: opts.findIndex((o) => o.isCorrect) };
  });
}

export default function AngkaMode({ onExit, onSessionEnd }) {
  const [view, setView] = useState('panel');
  const [quizMode, setQuizMode] = useState('pilihan'); // 'pilihan' or 'ketik'
  if (view === 'panel')
    return (
      <PanelView
        onExit={onExit}
        onStartQuiz={(mode) => {
          setQuizMode(mode);
          setView('quiz');
        }}
      />
    );
  if (quizMode === 'ketik')
    return <TypeQuizView onBack={() => setView('panel')} onSessionEnd={onSessionEnd} />;
  return <QuizView onBack={() => setView('panel')} onSessionEnd={onSessionEnd} />;
}

function PanelView({ onExit, onStartQuiz }) {
  // onStartQuiz(mode)
  const [expanded, setExpanded] = useState(null);
  const groups = useMemo(() => buildGroups(), []);

  return (
    <div className={S.page}>
      <button className={S.btnBack} onClick={onExit}>
        ← Kembali
      </button>
      <div className={`${S.rowSpread} ${A.headerRow}`}>
        <div>
          <h2 className={S.pageTitle}>🔢 Angka Kunci</h2>
          <p className={`${S.pageSub} ${A.pageSub}`}>
            {ANGKA.length} angka WAJIB hafal sebelum ujian
          </p>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button className={`${S.btnPrimary} ${A.kuisBtn}`} onClick={() => onStartQuiz('pilihan')}>
            🧠 Pilihan
          </button>
          <button
            className={S.btnSecondary}
            style={{ padding: '8px 12px', fontSize: 12 }}
            onClick={() => onStartQuiz('ketik')}
          >
            ⌨️ Ketik
          </button>
        </div>
      </div>

      <div className={A.warningBanner}>
        🚨 Wajib hafal sebelum ujian — sering muncul di soal Prometric SSW!
      </div>

      {groups.map((g, gi) => (
        <div key={g.label} className={A.groupSection}>
          <div className={`${S.row} ${A.groupHeader}`}>
            <div className={A.groupDot} style={{ background: g.color }} />
            <span className={A.groupLabel} style={{ color: g.color }}>
              {g.label}
            </span>
            <div
              className={A.groupDivider}
              style={{ background: `linear-gradient(90deg,${g.color}30,transparent)` }}
            />
            <span className={A.groupCount}>{g.items.length}</span>
          </div>
          <div className={`${S.list} ${A.groupItems}`}>
            {g.items.map((item, ii) => {
              const key = `${gi}-${ii}`;
              const isOpen = expanded === key;
              const relCard = item.kartu ? CARDS.find((c) => c.id === item.kartu) : null;
              return (
                <div key={key}>
                  <button
                    onClick={() => setExpanded(isOpen ? null : key)}
                    className={A.accordionBtn}
                    style={{
                      borderRadius: isOpen ? `${T.r.md}px ${T.r.md}px 0 0` : T.r.md,
                      background: isOpen ? `${g.color}14` : T.surface,
                      border: `1px solid ${isOpen ? `${g.color}40` : T.border}`,
                    }}
                  >
                    <span className={A.angkaValue} style={{ color: g.color }}>
                      {item.angka}
                    </span>
                    <span className={A.konteksText}>{item.konteks}</span>
                    <span className={A.chevron}>{isOpen ? '▲' : '▼'}</span>
                  </button>
                  {isOpen && (
                    <div
                      className={A.accordionPanel}
                      style={{
                        background: `${g.color}08`,
                        border: `1px solid ${g.color}30`,
                        borderRadius: `0 0 ${T.r.md}px ${T.r.md}px`,
                      }}
                    >
                      <div className={A.angkaLarge} style={{ color: g.color }}>
                        {item.angka}
                      </div>
                      <div className={A.konteksFull}>{item.konteks}</div>
                      {item.soal && (
                        <div
                          style={{
                            fontSize: 11,
                            color: 'var(--ssw-textDim)',
                            background: 'rgba(0,0,0,0.12)',
                            borderRadius: 6,
                            padding: '7px 10px',
                            marginTop: 6,
                            lineHeight: 1.6,
                            borderLeft: `3px solid ${g.color}50`,
                          }}
                        >
                          <span style={{ fontWeight: 700, color: g.color }}>問 </span>
                          {item.soal}
                        </div>
                      )}
                      {item.mnemonic && (
                        <div
                          style={{
                            fontSize: 11,
                            color: '#9CA3AF',
                            background: 'rgba(0,0,0,0.15)',
                            borderRadius: 6,
                            padding: '6px 8px',
                            marginTop: 6,
                            lineHeight: 1.5,
                          }}
                        >
                          💡 {item.mnemonic}
                        </div>
                      )}
                      {relCard && (
                        <div className={A.relatedCard}>
                          <div className={A.relatedCardId}>KARTU #{relCard.id}</div>
                          <div className={A.relatedCardJp}>{relCard.jp}</div>
                          <div className={A.relatedCardId_text}>{relCard.id_text}</div>
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

function QuizView({ onBack, onSessionEnd }) {
  const [items, setItems] = useState(() => buildQuizItems());
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [results, setResults] = useState([]);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [phase, setPhase] = useState('playing');
  const sessionFired = useRef(false);
  const { getDurationMs } = useSessionTimer();

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

  useEffect(() => {
    if (selected === null || phase !== 'playing') return;
    const t = setTimeout(() => {
      if (isLast) setPhase('result');
      else {
        setQIdx((i) => i + 1);
        setSelected(null);
      }
    }, 2000);
    return () => clearTimeout(t);
  }, [selected, phase, isLast]);

  useEffect(() => {
    const h = (e) => {
      if (phase !== 'playing') return;
      const MAP = { 1: 0, 2: 1, 3: 2, 4: 3, a: 0, b: 1, c: 2, d: 3 };
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

  const restart = () => {
    setItems(buildQuizItems());
    setQIdx(0);
    setSelected(null);
    setResults([]);
    setStreak(0);
    setMaxStreak(0);
    setPhase('playing');
    sessionFired.current = false;
  };

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
      <div className={`${S.page} ${A.resultPage}`}>
        <div className={A.resultCard}>
          <div className={A.resultEmoji}>{grade.emoji}</div>
          <div className={A.resultPct} style={{ color: grade.color }}>
            {pct}%
          </div>
          <div className={A.resultLabel}>{grade.label}</div>
          <div className={A.resultSub}>
            {correct}/{total} benar{maxStreak > 1 ? ` · 🔥 ${maxStreak} streak` : ''}
          </div>
        </div>
        <div className={`${S.row} ${A.resultActions}`}>
          <button className={`${S.btnPrimary} ${A.ulangBtn}`} onClick={restart}>
            🔄 Ulang
          </button>
          <button className={`${S.btnSecondary} ${A.daftarBtn}`} onClick={onBack}>
            📋 Daftar
          </button>
        </div>
        {wrongList.length > 0 && (
          <>
            <div className={S.sectionLabel}>Review Salah ({wrongList.length})</div>
            <div className={S.list}>
              {wrongList.map((r, i) => (
                <div
                  key={i}
                  className={A.reviewItem}
                  style={{ animation: `slideUp 0.3s ease ${i * 0.05}s both` }}
                >
                  <div className={A.reviewKonteks}>{r.item.item.konteks}</div>
                  <div className={A.reviewWrong}>✗ {r.item.opts[r.picked]?.text}</div>
                  <div className={A.reviewCorrect}>✓ {r.item.item.angka}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }

  if (!item) return null;
  const { opts } = item;

  return (
    <div className={`${S.pageScroll} ${A.quizPage}`}>
      <div className={`${S.rowSpread} ${A.quizHeader}`}>
        <button className={S.btnBack} style={{ marginBottom: 0 }} onClick={onBack}>
          ← Angka Kunci
        </button>
        <div className={S.row} style={{ fontSize: 12 }}>
          <span className={A.scoreBadge}>
            {results.filter((r) => r.isCorrect).length}/{qIdx + (selected !== null ? 1 : 0)}
          </span>
          {streak > 1 && <span className={A.streakBadge}>🔥{streak}</span>}
        </div>
      </div>
      <ProgressBar
        current={qIdx + (selected !== null ? 1 : 0)}
        total={items.length}
        color={ANGKA_COLOR}
      />
      <div className={S.counter}>
        {qIdx + 1} / {items.length}
      </div>

      <div
        className={A.questionCard}
        style={{
          background: `${ANGKA_COLOR}0E`,
          border: `2px solid ${ANGKA_COLOR}35`,
        }}
      >
        <div className={A.questionHint} style={{ color: ANGKA_COLOR }}>
          Angka berapa untuk…
        </div>
        <div className={A.questionKonteks}>{item.item.konteks}</div>
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
                background: !showResult
                  ? T.surface
                  : isCorrect
                    ? T.correctBg
                    : isWrongPick
                      ? T.wrongBg
                      : T.surface,
                border: `1.5px solid ${!showResult ? T.border : isCorrect ? T.correctBorder : isWrongPick ? T.wrongBorder : T.border}`,
                color: !showResult
                  ? T.text
                  : isCorrect
                    ? T.correct
                    : isWrongPick
                      ? T.wrong
                      : T.textDim,
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

      {selected !== null && (
        <button
          className={`${S.btnPrimary} ${A.nextBtn}`}
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

// Type-answer quiz — user types the number/value for each konteks.
function TypeQuizView({ onBack, onSessionEnd }) {
  const [items] = useState(() => shuffle([...ANGKA]));
  const [qIdx, setQIdx] = useState(0);
  const [input, setInput] = useState('');
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [results, setResults] = useState([]);
  const [phase, setPhase] = useState('playing');
  const sessionFired = useRef(false);
  const inputRef = useRef(null);
  const { getDurationMs } = useSessionTimer();

  const item = items[qIdx];
  const isLast = qIdx === items.length - 1;

  // Fuzzy check: normalize spaces, case, ignore punctuation
  function checkAnswer(userInput, correct) {
    const norm = (s) =>
      s
        .toLowerCase()
        .replace(/[~〜～≥≤<>≈×,、。・]/g, '')
        .replace(/\s+/g, '')
        .trim();
    const u = norm(userInput);
    const c = norm(correct);
    if (u === c) return true;
    // Allow partial match if user typed the core number (e.g. "8" matches "8 jam/hari, 40 jam/minggu" if 8 is first token)
    const firstNum = c.match(/\d+/)?.[0];
    if (firstNum && u === firstNum && firstNum.length >= 2) return true;
    return false;
  }

  const handleCheck = () => {
    if (!input.trim() || checked) return;
    const correct = checkAnswer(input, item.angka);
    setIsCorrect(correct);
    setChecked(true);
    setResults((r) => [...r, { correct, item, userInput: input }]);
  };

  const handleNext = () => {
    if (isLast) {
      setPhase('result');
      return;
    }
    setQIdx((i) => i + 1);
    setInput('');
    setChecked(false);
    setIsCorrect(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  useEffect(() => {
    if (phase !== 'result' || sessionFired.current) return;
    sessionFired.current = true;
    const correct = results.filter((r) => r.correct).length;
    onSessionEnd?.({ correct, total: results.length, durationMs: getDurationMs() });
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const h = (e) => {
      if (e.key === 'Enter') {
        if (!checked) handleCheck();
        else handleNext();
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [checked, input]); // eslint-disable-line react-hooks/exhaustive-deps

  if (phase === 'result') {
    const correct = results.filter((r) => r.correct).length;
    const pct = Math.round((correct / results.length) * 100);
    const grade = getGrade(pct);
    return (
      <div className={`${S.page} ${A.resultPage}`}>
        <div className={A.resultCard}>
          <div className={A.resultEmoji}>{grade.emoji}</div>
          <div className={A.resultPct} style={{ color: grade.color }}>
            {pct}%
          </div>
          <div className={A.resultLabel}>{grade.label}</div>
          <div className={A.resultSub}>
            {correct}/{results.length} benar
          </div>
        </div>
        <div className={`${S.row} ${A.resultActions}`}>
          <button className={`${S.btnPrimary} ${A.ulangBtn}`} onClick={onBack}>
            🔄 Kembali
          </button>
        </div>
        <div className={S.sectionLabel}>Review</div>
        <div className={S.list} style={{ gap: 8 }}>
          {results
            .filter((r) => !r.correct)
            .map((r, i) => (
              <div
                key={i}
                style={{
                  background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  borderRadius: 8,
                  padding: '8px 12px',
                }}
              >
                <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 2 }}>
                  {r.item.konteks}
                </div>
                <div style={{ fontSize: 12, color: '#F87171' }}>✗ Kamu: {r.userInput}</div>
                <div style={{ fontSize: 13, color: '#4ADE80', fontWeight: 700 }}>
                  ✓ Benar: {r.item.angka}
                </div>
              </div>
            ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`${S.pageScroll} ${A.quizPage}`}>
      <div className={`${S.rowSpread} ${A.quizHeader}`}>
        <button className={S.btnBack} style={{ marginBottom: 0 }} onClick={onBack}>
          ← Angka Kunci
        </button>
        <span className={A.scoreBadge}>
          {results.filter((r) => r.correct).length}/{qIdx + (checked ? 1 : 0)}
        </span>
      </div>
      <ProgressBar current={qIdx + (checked ? 1 : 0)} total={items.length} color={ANGKA_COLOR} />
      <div className={S.counter}>
        {qIdx + 1} / {items.length}
      </div>

      <div className={`${S.cardLg} ${A.questionCard}`}>
        <div className={A.questionHint}>⌨️ Ketik angka/nilai yang tepat</div>
        <div className={A.questionTerm}>{item.konteks}</div>
      </div>

      <input
        ref={inputRef}
        autoFocus
        value={input}
        onChange={(e) => setInput(e.target.value)}
        disabled={checked}
        placeholder="Ketik jawaban..."
        style={{
          fontFamily: 'inherit',
          fontSize: 16,
          padding: '12px 14px',
          borderRadius: 8,
          background: checked
            ? isCorrect
              ? 'rgba(34,197,94,0.1)'
              : 'rgba(239,68,68,0.1)'
            : T.surface,
          border: `1.5px solid ${checked ? (isCorrect ? '#22c55e' : '#ef4444') : T.border}`,
          color: T.text,
          width: '100%',
          boxSizing: 'border-box',
          marginBottom: 8,
          outline: 'none',
        }}
      />

      {checked && (
        <div
          style={{
            padding: '10px 14px',
            borderRadius: 8,
            marginBottom: 8,
            background: isCorrect ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
            border: `1px solid ${isCorrect ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
          }}
        >
          <div
            style={{ fontWeight: 700, color: isCorrect ? '#22c55e' : '#ef4444', marginBottom: 4 }}
          >
            {isCorrect ? '✓ Benar!' : `✗ Jawaban: ${item.angka}`}
          </div>
          {item.mnemonic && (
            <div style={{ fontSize: 11, color: '#9CA3AF', lineHeight: 1.5 }}>
              💡 {item.mnemonic}
            </div>
          )}
        </div>
      )}

      {!checked ? (
        <button
          className={`${S.btnPrimary} ${A.nextBtn}`}
          onClick={handleCheck}
          disabled={!input.trim()}
        >
          Cek ↵
        </button>
      ) : (
        <button className={`${S.btnPrimary} ${A.nextBtn}`} onClick={handleNext}>
          {isLast ? 'Lihat Hasil →' : 'Lanjut →'}
        </button>
      )}
    </div>
  );
}
