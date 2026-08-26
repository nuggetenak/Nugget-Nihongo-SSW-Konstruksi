// ─── SimulasiMode.jsx ─────────────────────────────────────────────────────────
// Note: timer box bg/border/animation conditional on isUrgent — justified inline.
// Note: lulus banner bg/border/color conditional on pass/fail — justified inline.
// Note: progress fill gradient conditional on pass/fail — justified inline.
// Note: red gradient buttons (exam theme) — justified inline (not amber).
// Note: pause overlay bg — justified inline (full-screen dim).
import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { T } from '../styles/theme.js';
import { shuffle } from '../utils/shuffle.js';
import { useApp } from '../contexts/AppContext.jsx';
import { useConfirm } from '../components/ConfirmDialog.jsx';
import { JpFront } from '../components/JpDisplay.jsx';
import { JAC_OFFICIAL } from '../data/index.js';
import { QUIZ_SETS } from '../data/quiz-sets.js';
import { haptic } from '../utils/haptic.js';
import { buildSimulasiResults } from '../utils/simulasi-scoring.js';
import { useSessionTimer } from '../hooks/useSessionTimer.js';
import ProgressBar from '../components/ProgressBar.jsx';
import S from './modes.module.css';
import SM from './SimulasiMode.module.css';

const PASS_PCT = 65;
const RED_BTN = {
  fontFamily: 'inherit',
  borderRadius: T.r.md,
  border: 'none',
  background: 'linear-gradient(135deg,#7f1d1d,#dc2626)',
  color: '#fff',
  cursor: 'pointer',
  fontWeight: 700,
  fontSize: 13,
};
const PRESETS = [
  {
    key: 'quick',
    emoji: '⚡',
    label: 'Latihan Cepat',
    sub: '15 soal · 15 menit',
    count: 15,
    time: 15 * 60,
  },
  {
    key: 'half',
    emoji: '📝',
    label: 'Setengah Ujian',
    sub: '25 soal · 25 menit',
    count: 25,
    time: 25 * 60,
  },
  {
    key: 'full',
    emoji: '🎯',
    label: 'Ujian Penuh',
    sub: 'semua soal · 45 menit',
    count: 0,
    time: 45 * 60,
  },
];
const INSTRUCTIONS = [
  '📋 Pilih satu jawaban yang paling tepat',
  '⏱ Timer berjalan — jangan sampai habis',
  '🚫 Soal otomatis lanjut setelah kamu jawab',
  `✅ ${PASS_PCT}% ke atas = LULUS`,
];
function fmtTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

// Normalize JAC and Wayground+CSV questions to a common shape
function buildPool() {
  const jacNorm = JAC_OFFICIAL.map((q) => ({
    jp: q.q,
    id_text: q.hint,
    options: q.opts,
    answer: q.ans,
    explanation: q.exp,
    hasPhoto: !!q.photoDesc,
    photoDesc: q.photoDesc,
    _source: 'jac',
    _setLabel: q.setLabel || 'JAC',
  }));

  const wayNorm = QUIZ_SETS.flatMap((set) =>
    (set.questions || []).map((q) => ({
      jp: q.q,
      id_text: q.hint || null,
      options: q.opts,
      answer: q.ans,
      explanation: q.exp || null,
      hasPhoto: false,
      photoDesc: null,
      _source: set.source?.startsWith('csv') ? 'csv' : 'wayground',
      _setLabel: set.title || 'Wayground',
    }))
  );

  return [...jacNorm, ...wayNorm];
}

export default function SimulasiMode({ onExit, onSessionEnd, onRetryWrong }) {
  const { prefs } = useApp();
  const confirm = useConfirm();
  const furiganaPolicy = prefs?.furiganaPolicy ?? 'always';
  const [phase, setPhase] = useState('start');
  const [preset, setPreset] = useState('quick');
  const [seed, setSeed] = useState(0);
  const [qIdx, setQIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { [qIdx]: { selectedIdx, isCorrect } }
  const [results, setResults] = useState([]); // built once, at submit (item 48)
  const [timeLeft, setTimeLeft] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);
  const { getDurationMs } = useSessionTimer();

  const config = PRESETS.find((p) => p.key === preset) || PRESETS[0];

  const questions = useMemo(() => {
    if (phase !== 'playing') return [];
    const pool = shuffle(buildPool());
    const items = config.count > 0 ? pool.slice(0, config.count) : pool;
    return items.map((q) => {
      const shuffledOpts = shuffle(q.options.map((text, origIdx) => ({ text, origIdx })));
      return {
        jp: q.jp,
        id_text: q.id_text,
        opts: shuffledOpts,
        correctIdx: shuffledOpts.findIndex((o) => o.origIdx === q.answer),
        explanation: q.explanation,
        hasPhoto: q.hasPhoto,
        photoDesc: q.photoDesc,
        _source: q._source,
        _setLabel: q._setLabel,
      };
    });
  }, [phase, seed, config.count]); // eslint-disable-line react-hooks/exhaustive-deps

  const q = questions[qIdx];
  const isLast = qIdx === questions.length - 1;
  const selected = answers[qIdx]?.selectedIdx ?? null;
  const answeredCount = Object.keys(answers).length;

  const finishExam = useCallback(() => {
    setResults(buildSimulasiResults(questions, answers));
    setPhase('result');
  }, [questions, answers]);

  const handleSubmitClick = useCallback(async () => {
    const unanswered = questions.length - answeredCount;
    if (unanswered > 0) {
      const ok = await confirm(
        `${unanswered} soal belum dijawab. Soal yang belum dijawab dihitung salah, sama seperti ujian sungguhan.`,
        'Kumpulkan sekarang',
        'Kembali'
      );
      if (!ok) return;
    }
    finishExam();
  }, [questions.length, answeredCount, confirm, finishExam]);

  // Auto-pause on tab/app hide
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && phase === 'playing') setPaused(true);
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [phase]);

  useEffect(() => {
    if (phase !== 'playing' || paused) {
      clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          finishExam();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase, seed, paused, finishExam]);

  // (Item 48: the old auto-advance-1.5s-after-answering effect is gone --
  // answering no longer implies "done with this question." Navigation is
  // explicit now: Prev/Next/the question-navigator/Submit.)

  useEffect(() => {
    if (phase === 'result' && results.length > 0) {
      const correct = results.filter((r) => r.isCorrect).length;
      onSessionEnd?.({ correct, total: results.length, durationMs: getDurationMs() });
    }
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStart = useCallback(() => {
    setSeed((s) => s + 1);
    setQIdx(0);
    setAnswers({});
    setResults([]);
    setTimeLeft(config.time);
    setPaused(false);
    setPhase('playing');
  }, [config.time]);

  const handleSelect = useCallback(
    (optArrayIdx) => {
      if (phase !== 'playing' || paused || !q) return;
      const isCorrect = optArrayIdx === q.correctIdx;
      haptic.tap(); // not .correct()/.wrong() -- that would itself leak the answer
      setAnswers((prev) => ({ ...prev, [qIdx]: { selectedIdx: optArrayIdx, isCorrect } }));
    },
    [phase, paused, q, qIdx]
  );

  const goToQuestion = useCallback(
    (i) => {
      if (phase !== 'playing' || paused || i < 0 || i >= questions.length) return;
      setQIdx(i);
    },
    [phase, paused, questions.length]
  );

  const isUrgent = timeLeft < 60 && timeLeft > 0 && phase === 'playing';

  // ─── START ─────────────────────────────────────────────────────────────────
  if (phase === 'start') {
    return (
      <div className={S.page}>
        <button className={S.btnBack} onClick={onExit}>
          ← Kembali
        </button>
        <div className={SM.startHero}>
          <div className={SM.startHeroEmoji}>🎯</div>
          <h2 className={`${S.pageTitle} ${SM.startTitle}`}>Simulasi Ujian</h2>
          <p className={S.pageSub}>Format ujian SSW Konstruksi dengan timer</p>
        </div>
        <div className={`${S.card} ${SM.instructionsCard}`}>
          {INSTRUCTIONS.map((inst, i) => (
            <div key={i} className={SM.instructionLine}>
              {inst}
            </div>
          ))}
        </div>
        <div className={S.sectionLabel}>Mode Simulasi</div>
        <div className={`${S.list} ${SM.presetList}`}>
          {PRESETS.map((p) => (
            <button
              key={p.key}
              className={S.btnItem}
              onClick={() => setPreset(p.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                background: preset === p.key ? 'rgba(239,68,68,0.10)' : T.surface,
                border: `1px solid ${preset === p.key ? 'rgba(239,68,68,0.4)' : T.border}`,
                color: preset === p.key ? '#ef4444' : T.text,
              }}
            >
              <span className={SM.presetEmoji}>{p.emoji}</span>
              <div>
                <div className={SM.presetLabel}>{p.label}</div>
                <div
                  className={SM.presetSub}
                  style={{ color: preset === p.key ? 'rgba(239,68,68,0.7)' : T.textDim }}
                >
                  {p.sub}
                </div>
              </div>
            </button>
          ))}
        </div>
        <button
          style={{
            ...RED_BTN,
            width: '100%',
            padding: '14px',
            fontSize: 15,
            boxShadow: '0 4px 16px rgba(220,38,38,0.3)',
          }}
          onClick={handleStart}
        >
          Mulai Simulasi 🎯
        </button>
      </div>
    );
  }

  // ─── RESULT ───────────────────────────────────────────────────────────────
  // Item 46: deliberately not using ResultScreen here. This is a pass/fail exam
  // simulation against a 65% threshold (PASS_PCT), not a generic quiz score --
  // the lulus/tidak-lulus banner and full sequential answer review below are
  // the whole point of "Simulasi" and don't fit ResultScreen's shape. Plan's
  // own note: "leave Simulasi out and say so" rather than force-fit it.
  if (phase === 'result') {
    const correct = results.filter((r) => r.isCorrect).length;
    const total = results.length;
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
    const lulus = pct >= PASS_PCT;
    const wrongList = results.filter((r) => !r.isCorrect);
    return (
      <div className={`${S.page} ${SM.resultPage}`}>
        <div
          className={SM.lulusBanner}
          style={{
            background: lulus ? T.correctBg : T.wrongBg,
            border: `2px solid ${lulus ? T.correctBorder : T.wrongBorder}`,
          }}
        >
          <div className={SM.lulusIcon}>{lulus ? '✅' : '❌'}</div>
          <div className={SM.lulusStatus} style={{ color: lulus ? T.correct : T.wrong }}>
            {lulus ? 'LULUS' : 'BELUM LULUS'}
          </div>
          <div className={SM.lulusPct} style={{ color: lulus ? T.correct : T.wrong }}>
            {pct}%
          </div>
          <div className={SM.lulusSub}>
            {correct} / {total} benar · batas lulus {PASS_PCT}%
          </div>
          <div className={SM.progressTrack}>
            <div
              style={{
                height: '100%',
                width: `${pct}%`,
                background: lulus
                  ? 'linear-gradient(90deg,rgba(22,163,74,0.5),var(--ssw-correct))'
                  : 'linear-gradient(90deg,rgba(220,38,38,0.5),var(--ssw-wrong))',
                borderRadius: 99,
                transition: 'width 0.8s ease',
              }}
            />
          </div>
        </div>
        <div className={`${S.row} ${SM.resultActions}`}>
          <button style={{ ...RED_BTN, flex: 1, padding: '12px' }} onClick={handleStart}>
            🔄 Ulang
          </button>
          {wrongList.length > 0 && onRetryWrong && (
            <button
              style={{
                ...RED_BTN,
                flex: 1,
                padding: '12px',
                background: 'linear-gradient(135deg,#1e3a5f,#2563eb)',
              }}
              onClick={() => onRetryWrong(wrongList.map((_, i) => i))}
            >
              📚 Latih {wrongList.length} Salah
            </button>
          )}
          <button className={`${S.btnSecondary} ${SM.kembaliBtn}`} onClick={onExit}>
            ← Kembali
          </button>
        </div>

        {/* Breakdown per source */}
        {results.length > 0 &&
          (() => {
            const bySource = {};
            results.forEach((r) => {
              const key = r._setLabel || r._source || 'Lainnya';
              if (!bySource[key]) bySource[key] = { correct: 0, total: 0 };
              bySource[key].total++;
              if (r.isCorrect) bySource[key].correct++;
            });
            const entries = Object.entries(bySource).sort(
              (a, b) => a[1].correct / a[1].total - b[1].correct / b[1].total
            );
            return (
              <>
                <div className={S.sectionLabel}>Breakdown per Set</div>
                <div className={S.list} style={{ gap: 6 }}>
                  {entries.map(([label, stat]) => {
                    const pct = Math.round((stat.correct / stat.total) * 100);
                    const color = pct >= 75 ? T.correct : pct >= 50 ? T.gold : T.wrong;
                    return (
                      <div
                        key={label}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          background: T.surface,
                          borderRadius: T.r.md,
                          border: `1px solid ${T.border}`,
                          fontSize: 12,
                        }}
                      >
                        <span style={{ color: T.textMuted, flex: 1 }}>{label}</span>
                        <span style={{ color, fontWeight: 700, minWidth: 60, textAlign: 'right' }}>
                          {pct}% ({stat.correct}/{stat.total})
                        </span>
                      </div>
                    );
                  })}
                </div>
              </>
            );
          })()}
        {wrongList.length > 0 && (
          <>
            <div className={S.sectionLabel}>Review Salah ({wrongList.length})</div>
            <div className={S.list}>
              {wrongList.map((r, i) => {
                const correctOpt = r.opts[r.correctIdx];
                const userOpt = r.opts[r.userIdx];
                return (
                  <div
                    key={i}
                    className={SM.reviewItem}
                    style={{ animation: `slideUp 0.3s ease ${i * 0.05}s both` }}
                  >
                    <div className={SM.reviewJp}>
                      <JpFront jp={r.jp} furiganaPolicy={furiganaPolicy} />
                    </div>
                    <div className={SM.reviewIdText}>{r.id_text}</div>
                    <div className={SM.reviewWrong}>
                      ✗ <JpFront jp={userOpt?.text || '—'} furiganaPolicy={furiganaPolicy} />
                    </div>
                    <div className={SM.reviewCorrect}>
                      ✓ <JpFront jp={correctOpt?.text || '—'} furiganaPolicy={furiganaPolicy} />
                    </div>
                    {r.explanation && (
                      <div className={SM.reviewExpl}>
                        💡 {r.explanation.slice(0, 160)}
                        {r.explanation.length > 160 ? '…' : ''}
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

  // ─── PLAYING ──────────────────────────────────────────────────────────────
  if (!q) return null;
  return (
    <div className={`${S.pageScroll} ${SM.quizPage}`}>
      <div className={`${S.rowSpread} ${SM.quizHeader}`}>
        <button className={S.btnBack} style={{ marginBottom: 0 }} onClick={onExit}>
          ✕ Keluar
        </button>
        <div className={S.row} style={{ gap: 10 }}>
          {/* Pause button */}
          <button
            onClick={() => setPaused((p) => !p)}
            style={{
              ...RED_BTN,
              padding: '6px 12px',
              fontSize: 14,
              background: paused
                ? 'linear-gradient(135deg,#1e3a5f,#2563eb)'
                : 'linear-gradient(135deg,#7f1d1d,#dc2626)',
            }}
            aria-label={paused ? 'Lanjutkan' : 'Jeda'}
          >
            {paused ? '▶' : '⏸'}
          </button>
          <div
            className={SM.timerBox}
            style={{
              background: isUrgent ? 'rgba(220,38,38,0.10)' : T.surface,
              border: `1px solid ${isUrgent ? 'rgba(220,38,38,0.4)' : T.border}`,
              animation: isUrgent ? 'pulse 0.8s ease infinite' : 'none',
            }}
          >
            <div className={SM.timerLabel} style={{ color: isUrgent ? T.wrong : T.textDim }}>
              WAKTU
            </div>
            <div className={SM.timerValue} style={{ color: isUrgent ? T.wrong : T.text }}>
              {fmtTime(timeLeft)}
            </div>
            {/* Pace hint — soal/menit needed to finish on time */}
            {timeLeft > 0 &&
              (() => {
                const remaining = questions.length - answeredCount;
                const minsLeft = timeLeft / 60;
                const needed = minsLeft > 0 ? (remaining / minsLeft).toFixed(1) : '—';
                return (
                  <div
                    style={{
                      fontSize: 9,
                      color: isUrgent ? T.wrong : T.textDim,
                      marginTop: 2,
                      letterSpacing: 0.2,
                    }}
                  >
                    {needed} soal/mnt
                  </div>
                );
              })()}
          </div>
          {/* Item 48: was a live ✓/✗ score tally -- removed. An exam
              simulation shouldn't tell you how you're doing mid-exam;
              that's the entire point of "deferred." Answered-count is
              progress, not a grade, so it stays. */}
          <div className={SM.scoreMini}>
            <div style={{ fontSize: 10, color: T.textDim }}>TERJAWAB</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>
              {answeredCount}/{questions.length}
            </div>
          </div>
        </div>
      </div>
      <ProgressBar current={answeredCount} total={questions.length} color="#ef4444" />
      <div className={S.counter}>
        Soal {qIdx + 1} / {questions.length}
      </div>

      <div className={`${S.cardLg} ${SM.questionCard}`}>
        <div className={SM.questionJp}>
          <JpFront jp={q.jp} furiganaPolicy={furiganaPolicy} />
        </div>
        {q.id_text && <div className={SM.questionSub}>{q.id_text}</div>}
        {q.hasPhoto && (
          <div className={SM.photoHint}>📷 {q.photoDesc || 'Soal asli pakai foto'}</div>
        )}
      </div>

      {/* Item 48: neutral option buttons, not the shared OptionButton --
          that component always reveals correct/wrong on selection, which
          is exactly what an exam simulation must NOT do. Selecting again
          changes the answer rather than locking it in, matching a real
          answer sheet you can erase and re-mark before turning in. */}
      <div className={S.list}>
        {q.opts.map((opt, i) => {
          const isSelected = i === selected;
          return (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              aria-pressed={isSelected}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                padding: '13px 16px',
                textAlign: 'left',
                borderRadius: 12,
                background: isSelected ? T.surfaceActive : T.surface,
                border: `2px solid ${isSelected ? T.amber : T.border}`,
                color: T.text,
                fontFamily: 'inherit',
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  border: `1.5px solid ${isSelected ? T.amber : T.border}`,
                  color: isSelected ? T.amber : T.textDim,
                  fontSize: 12,
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {String.fromCharCode(65 + i)}
              </span>
              {opt.text}
            </button>
          );
        })}
      </div>

      {/* Question navigator — jump anywhere, see answered/unanswered/current
          at a glance, matching how a paper answer sheet lets you scan and
          jump to any question, not just step through in order. */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 6,
          marginTop: 16,
          padding: '10px',
          background: T.surface,
          border: `1px solid ${T.border}`,
          borderRadius: 12,
        }}
      >
        {questions.map((_, i) => {
          const isCurrent = i === qIdx;
          const isAnswered = answers[i] !== undefined;
          return (
            <button
              key={i}
              onClick={() => goToQuestion(i)}
              aria-label={`Soal ${i + 1}${isAnswered ? ', sudah dijawab' : ', belum dijawab'}${isCurrent ? ', sedang dilihat' : ''}`}
              style={{
                width: 30,
                height: 30,
                borderRadius: 8,
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
                fontFamily: 'inherit',
                background: isCurrent ? T.amber : isAnswered ? T.surfaceActive : T.surface,
                color: isCurrent ? '#1c1917' : isAnswered ? T.text : T.textDim,
                border: `1.5px solid ${isCurrent ? T.amber : isAnswered ? T.borderActive : T.border}`,
              }}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      {/* Prev / Next / Submit — replaces the old single auto-advancing
          "Lanjut" button. Submit is always available (a real exam lets
          you turn in early), Prev/Next just move the viewed question. */}
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button
          className={S.btnSecondary}
          style={{ flex: 1 }}
          onClick={() => goToQuestion(qIdx - 1)}
          disabled={qIdx === 0}
        >
          ← Sebelumnya
        </button>
        {!isLast && (
          <button
            className={S.btnSecondary}
            style={{ flex: 1 }}
            onClick={() => goToQuestion(qIdx + 1)}
          >
            Selanjutnya →
          </button>
        )}
      </div>
      <button
        style={{ ...RED_BTN, width: '100%', marginTop: 8, padding: '13px' }}
        onClick={handleSubmitClick}
      >
        Kumpulkan Ujian
      </button>

      {/* Pause overlay */}
      {paused && (
        <button
          type="button"
          onClick={() => setPaused(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 'var(--z-overlay)',
            width: '100%',
            margin: 0,
            border: 'none',
            font: 'inherit',
            background: 'rgba(0,0,0,0.72)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 12,
            cursor: 'pointer',
          }}
        >
          <div style={{ fontSize: 48 }}>⏸</div>
          <div style={{ color: '#fff', fontSize: 20, fontWeight: 700 }}>Dijeda</div>
          <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14 }}>Ketuk untuk lanjut</div>
        </button>
      )}
    </div>
  );
}
