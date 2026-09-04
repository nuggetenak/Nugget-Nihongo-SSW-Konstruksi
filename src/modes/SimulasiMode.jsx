// ─── SimulasiMode.jsx ─────────────────────────────────────────────────────────
// Note: timer box bg/border/animation conditional on isUrgent — justified inline.
// Note: lulus banner bg/border/color conditional on pass/fail — justified inline.
// Note: progress fill gradient conditional on pass/fail — justified inline.
// Note: red gradient buttons (exam theme) — justified inline (not amber).
// Note: pause overlay bg — justified inline (full-screen dim).
import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { T } from '../styles/theme.js';
import { shuffle } from '../utils/shuffle.js';
import { stripFuri, JP_LIST_MAX, JP_LIST_MAX_SECONDARY } from '../utils/jp-helpers.js';
import { useApp } from '../contexts/AppContext.jsx';
import { useConfirm } from '../components/ConfirmDialog.jsx';
import { JpFront, renderJPWithRuby, parseRubyFragments } from '../components/JpDisplay.jsx';
import { JAC_OFFICIAL } from '../data/index.js';
import { QUIZ_SETS } from '../data/quiz-sets.js';
import { isTeoriId, isPraktikId } from '../utils/quiz-classification.js';
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
// Two independent sources, chosen explicitly rather than always pooled
// together (owner's request, 2026-08-28): JAC Official's own 95 questions
// keep their own natural composition (no forced ratio -- there's no
// teori/praktik split to enforce on a small, fixed, official set), while
// the Teori & Praktik pool (everything else: Wayground + JAC Mockup,
// classified via quiz-classification.js so this doesn't duplicate/drift
// from WaygroundMode's own copy of the same rule) samples a fixed ratio.
// 60/40 teori/praktik, chosen by the owner directly (30+20=50 for the
// full exam) -- scales cleanly to the smaller presets with no rounding:
// 15 -> 9+6, 25 -> 15+10, 50 -> 30+20.
//
// Time budget: 2 minutes per question, matching the real JAC exam's own
// convention (owner, 2026-08-31 -- corrected from this file's previous
// ~1 min/question, which had no cited basis). Applied uniformly across
// every preset rather than only the reported "full" one, since the same
// per-question rate is presumably the actual exam's rule at any length,
// not a full-exam-specific number. JAC Official's own "full" preset draws
// one random teori set + one random praktik set (pickJacSetPair) rather
// than a fixed count, so its total varies (44-51, see JAC_PRESETS below);
// SECONDS_PER_QUESTION is exported so the time budget can be recomputed
// from the actual drawn count once it's known, instead of guessing at a
// fixed number that's only sometimes right -- see the effect that does
// this in the component body.
const SECONDS_PER_QUESTION = 2 * 60;
const MODES = [
  {
    key: 'pool',
    emoji: '📚',
    label: 'Teori & Praktik',
    sub: 'Campuran semua sumber (Wayground + JAC Mockup)',
  },
  {
    key: 'jac',
    emoji: '🏛️',
    label: 'JAC Official',
    sub: `Soal resmi dari buku ujian JAC (${JAC_OFFICIAL.length} soal)`,
  },
];
const POOL_PRESETS = [
  {
    key: 'quick',
    emoji: '⚡',
    label: 'Latihan Cepat',
    sub: '15 soal (9 teori + 6 praktik) · 30 menit',
    teori: 9,
    praktik: 6,
    time: 15 * SECONDS_PER_QUESTION,
  },
  {
    key: 'half',
    emoji: '📝',
    label: 'Setengah Ujian',
    sub: '25 soal (15 teori + 10 praktik) · 50 menit',
    teori: 15,
    praktik: 10,
    time: 25 * SECONDS_PER_QUESTION,
  },
  {
    key: 'full',
    emoji: '🎯',
    label: 'Ujian Penuh',
    sub: '50 soal (30 teori + 20 praktik) · 100 menit',
    teori: 30,
    praktik: 20,
    time: 50 * SECONDS_PER_QUESTION,
  },
];
const JAC_PRESETS = [
  {
    key: 'quick',
    emoji: '⚡',
    label: 'Latihan Cepat',
    sub: '15 soal · 30 menit',
    count: 15,
    time: 15 * SECONDS_PER_QUESTION,
  },
  {
    key: 'half',
    emoji: '📝',
    label: 'Setengah Ujian',
    sub: '25 soal · 50 menit',
    count: 25,
    time: 25 * SECONDS_PER_QUESTION,
  },
  {
    key: 'full',
    emoji: '🎯',
    label: 'Ujian Penuh',
    // Was "Semua 95 soal JAC" -- no longer true now that this draws from 1
    // random teori set + 1 random praktik set (see pickJacSetPair) instead
    // of the full flattened 95. Total varies by which pair gets picked
    // (44 or 51 -- praktik sets are equal size, so teori is what swings
    // it). Time range (88-102 min) is the honest reflection of that same
    // variability at 2 min/question, not a separate approximation --
    // 50 * SECONDS_PER_QUESTION below is a *placeholder* only, immediately
    // corrected once the actual draw's count is known (see the effect in
    // the component body); it exists so `time` isn't briefly undefined
    // between selecting this preset and the pool finishing its draw.
    sub: '1 set teori + 1 set praktik (44–51 soal) · 88–102 menit',
    count: 0,
    time: 50 * SECONDS_PER_QUESTION,
  },
];
// Exported for direct testing of the ratio math (POOL_PRESETS), the
// JAC-vs-pool split, and the time budget (SECONDS_PER_QUESTION), rather
// than only probing any of it indirectly through rendered DOM text.
export const SIMULASI_POOL_PRESETS = POOL_PRESETS;
export const SIMULASI_JAC_PRESETS = JAC_PRESETS;
export const SIMULASI_SECONDS_PER_QUESTION = SECONDS_PER_QUESTION;
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

// Some quiz sets' hint/id_text field is a mixed ID+JP string with 《reading》
// segments embedded inline for kanji breakdown (e.g. "安全《あんぜん》=
// keselamatan, 弁=katup" -- deliberately teaching the reading alongside the
// meaning), not a plain Indonesian translation. Rendering it as bare text
// leaves the 《》 markers themselves visible; running the whole string
// through JpFront is also wrong the other direction (it assumes pure
// Japanese and forces JP font/centering onto what's mostly Indonesian
// prose). This mirrors DescBlock's own 'plain' branch -- same fix, without
// pulling in a block-level component into a single inline hint line.
function MixedRuby({ text }) {
  if (!text) return null;
  return renderJPWithRuby(text, parseRubyFragments(text));
}

// JAC_OFFICIAL's own set/setLabel fields (tt1/tt2 = 学科/teori, st1/st2 =
// 実技/praktik -- see sets/jac/jac-teori.js and jac-lifeline.js) were never
// used by this pool before; the compat shim (jac-official.js) just
// concatenates both into one flat 95-question array, and buildJacPool
// originally pretended that was one undifferentiated pool. It isn't --
// verified directly against the source files after the owner pointed out
// the flattened shim was hiding this: 2 teori sets (tt1=29q, tt2=36q,
// genuinely uneven -- not a rounding artifact) + 2 praktik sets (st1=15q,
// st2=15q). Owner's request: pick one teori set + one praktik set at
// random on every start (not shown as a choice -- "biar keliatan kyk
// random"), take everything in both, let the total be whatever that pair
// adds up to (44 or 51, since the praktik sets are equal size the total
// is entirely determined by which teori set gets picked) rather than
// forcing a fixed count the way the Teori & Praktik pool does.
function pickJacSetPair() {
  const bySet = {};
  for (const q of JAC_OFFICIAL) {
    (bySet[q.set] ??= []).push(q);
  }
  const teoriIds = Object.keys(bySet).filter((id) => id.startsWith('tt'));
  const praktikIds = Object.keys(bySet).filter((id) => id.startsWith('st'));
  const teoriId = teoriIds[Math.floor(Math.random() * teoriIds.length)];
  const praktikId = praktikIds[Math.floor(Math.random() * praktikIds.length)];
  return [...(bySet[teoriId] || []), ...(bySet[praktikId] || [])];
}

// Normalize JAC and Wayground+CSV questions to a common shape
export function buildJacPool() {
  return pickJacSetPair().map((q) => ({
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
}

// _category ('teori'/'praktik'/null) drives the ratio sampling below --
// null means the set is neither (vocab, wglv-*), so it's naturally excluded
// from both buckets rather than needing its own separate filter.
export function buildQuizSetsPool() {
  return QUIZ_SETS.flatMap((set) => {
    const category = isTeoriId(set.id) ? 'teori' : isPraktikId(set.id) ? 'praktik' : null;
    if (!category) return [];
    return (set.questions || []).map((q) => ({
      jp: q.q,
      id_text: q.hint || null,
      options: q.opts,
      answer: q.ans,
      explanation: q.exp || null,
      hasPhoto: false,
      photoDesc: null,
      _source: set.source?.startsWith('csv') ? 'csv' : 'wayground',
      _setLabel: set.title || 'Wayground',
      _category: category,
    }));
  });
}

export default function SimulasiMode({ onExit, onSessionEnd, onRetryWrong }) {
  const { prefs } = useApp();
  const confirm = useConfirm();
  const furiganaPolicy = prefs?.furiganaPolicy ?? 'always';
  const [phase, setPhase] = useState('start');
  const [mode, setMode] = useState('pool');
  const [preset, setPreset] = useState('quick');
  const [seed, setSeed] = useState(0);
  const [qIdx, setQIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { [qIdx]: { selectedIdx, isCorrect } }
  const [results, setResults] = useState([]); // built once, at submit (item 48)
  const [timeLeft, setTimeLeft] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);
  const { getDurationMs } = useSessionTimer();

  const activePresets = mode === 'jac' ? JAC_PRESETS : POOL_PRESETS;
  const config = activePresets.find((p) => p.key === preset) || activePresets[0];

  const questions = useMemo(() => {
    if (phase !== 'playing') return [];
    // Freshly sampled every time (seed dependency below) -- not a fixed
    // pool, per the owner's explicit request: same preset, different
    // questions on a retry.
    let items;
    if (mode === 'jac') {
      const pool = shuffle(buildJacPool());
      items = config.count > 0 ? pool.slice(0, config.count) : pool;
    } else {
      const pool = buildQuizSetsPool();
      const teoriPool = shuffle(pool.filter((q) => q._category === 'teori'));
      const praktikPool = shuffle(pool.filter((q) => q._category === 'praktik'));
      // Math.min guards a pool ever coming up short of the preset's ask --
      // not expected (teori alone is ~360+ questions across 18 sets, far
      // more than the largest preset's 30), but slicing past an array's
      // length just returns what's there rather than throwing, so this is
      // a defensive floor, not a fix for a currently-observed shortage.
      const teoriPick = teoriPool.slice(0, Math.min(config.teori, teoriPool.length));
      const praktikPick = praktikPool.slice(0, Math.min(config.praktik, praktikPool.length));
      items = shuffle([...teoriPick, ...praktikPick]);
    }
    return items.map((q) => {
      // Options never render through ruby-aware JpFront here (OptionButton-
      // style plain text, same convention QuizShell/VocabMode already use for
      // every other mode's choices — see stripFuri's own call sites) — so the
      // raw 《reading》 markup needs stripping at the source, same as those,
      // or it shows up on-screen literally instead of being parsed as ruby.
      const shuffledOpts = shuffle(
        q.options.map((text, origIdx) => ({ text: stripFuri(text), origIdx }))
      );
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, seed, mode, config.count, config.teori, config.praktik]);

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

  // JAC Official's "full" preset draws a random set pair (pickJacPool ->
  // pickJacSetPair) whose total (44 or 51) isn't known until `questions`
  // itself is computed -- config.time above is only a placeholder for that
  // one specific preset (see JAC_PRESETS's own comment). Correct timeLeft
  // here once the real count is in. A no-op for every other preset/mode:
  // there, questions.length always already equals what config.time was
  // computed from, so this recomputes the identical value it's replacing.
  useEffect(() => {
    if (phase === 'playing' && questions.length > 0) {
      setTimeLeft(questions.length * SECONDS_PER_QUESTION);
    }
  }, [phase, questions]);

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

  const handleExitClick = useCallback(async () => {
    if (phase === 'playing') {
      const ok = await confirm(
        `${answeredCount}/${questions.length} soal sudah dijawab. Keluar sekarang akan menghapus semuanya — progres simulasi tidak tersimpan sebagian.`,
        'Keluar, hapus progres',
        'Tetap di sini'
      );
      if (!ok) return;
    }
    onExit();
  }, [phase, answeredCount, questions.length, confirm, onExit]);

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
        <div className={S.sectionLabel}>Sumber Soal</div>
        <div className={`${S.list} ${SM.presetList}`} style={{ marginBottom: 20 }}>
          {MODES.map((m) => (
            <button
              key={m.key}
              className={S.btnItem}
              onClick={() => setMode(m.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                background: mode === m.key ? 'rgba(239,68,68,0.10)' : T.surface,
                border: `1px solid ${mode === m.key ? 'rgba(239,68,68,0.4)' : T.border}`,
                color: mode === m.key ? '#ef4444' : T.text,
              }}
            >
              <span className={SM.presetEmoji}>{m.emoji}</span>
              <div>
                <div className={SM.presetLabel}>{m.label}</div>
                <div
                  className={SM.presetSub}
                  style={{ color: mode === m.key ? 'rgba(239,68,68,0.7)' : T.textDim }}
                >
                  {m.sub}
                </div>
              </div>
            </button>
          ))}
        </div>
        <div className={S.sectionLabel}>Jumlah Soal</div>
        <div className={`${S.list} ${SM.presetList}`}>
          {activePresets.map((p) => (
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
                      <JpFront jp={r.jp} furiganaPolicy={furiganaPolicy} maxSize={JP_LIST_MAX} />
                    </div>
                    <div className={SM.reviewIdText}>
                      <MixedRuby text={r.id_text} />
                    </div>
                    <div className={SM.reviewWrong}>
                      ✗{' '}
                      <JpFront
                        jp={userOpt?.text || '—'}
                        furiganaPolicy={furiganaPolicy}
                        maxSize={JP_LIST_MAX_SECONDARY}
                      />
                    </div>
                    <div className={SM.reviewCorrect}>
                      ✓{' '}
                      <JpFront
                        jp={correctOpt?.text || '—'}
                        furiganaPolicy={furiganaPolicy}
                        maxSize={JP_LIST_MAX_SECONDARY}
                      />
                    </div>
                    {r.explanation &&
                      (() => {
                        const clean = stripFuri(r.explanation);
                        return (
                          <div className={SM.reviewExpl}>
                            💡 {clean.slice(0, 160)}
                            {clean.length > 160 ? '…' : ''}
                          </div>
                        );
                      })()}
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
        <button className={S.btnBack} style={{ marginBottom: 0 }} onClick={handleExitClick}>
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
        {q.id_text && (
          <div className={SM.questionSub}>
            <MixedRuby text={q.id_text} />
          </div>
        )}
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

      {/* Pause overlay. Also offers Keluar here specifically -- pausing is
          the natural "step away" moment, so it doubles as the safe exit
          point rather than making Keluar and Jeda two disconnected buttons
          with no relationship to each other. */}
      {paused && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 'var(--z-overlay)',
            background: 'rgba(0,0,0,0.72)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <div style={{ fontSize: 48 }}>⏸</div>
          <div style={{ color: '#fff', fontSize: 20, fontWeight: 700 }}>Dijeda</div>
          <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, marginBottom: 8 }}>
            {answeredCount}/{questions.length} soal terjawab · waktu ikut berhenti
          </div>
          <button
            type="button"
            onClick={() => setPaused(false)}
            style={{ ...RED_BTN, padding: '13px 32px', fontSize: 15 }}
          >
            ▶ Lanjutkan
          </button>
          <button
            type="button"
            onClick={handleExitClick}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,0.55)',
              fontSize: 13,
              fontFamily: 'inherit',
              cursor: 'pointer',
              padding: 8,
              marginTop: 4,
            }}
          >
            ✕ Keluar dari simulasi
          </button>
        </div>
      )}
    </div>
  );
}
