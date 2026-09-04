// ─── SimulasiMode.jsx ─────────────────────────────────────────────────────────
// Note: timer box bg/border/animation conditional on isUrgent — justified inline.
// Note: lulus banner bg/border/color conditional on pass/fail — justified inline.
// Note: progress fill gradient conditional on pass/fail — justified inline.
// Note: red gradient buttons (exam theme) — justified inline (not amber).
// Note: pause overlay bg — justified inline (full-screen dim).
import { useState, useEffect, useCallback, useRef } from 'react';
import { T } from '../styles/theme.js';
import { shuffle } from '../utils/shuffle.js';
import { stripFuri, JP_LIST_MAX, JP_LIST_MAX_SECONDARY } from '../utils/jp-helpers.js';
import { useApp } from '../contexts/AppContext.jsx';
import { useConfirm } from '../components/ConfirmDialog.jsx';
import { useExitGuard } from '../hooks/useExitGuard.js';
import { JpFront, renderJPWithRuby, parseRubyFragments } from '../components/JpDisplay.jsx';
import { JAC_OFFICIAL } from '../data/index.js';
import { QUIZ_SETS } from '../data/quiz-sets.js';
import { isTeoriId, isPraktikId } from '../utils/quiz-classification.js';
import { haptic } from '../utils/haptic.js';
import { buildSimulasiResults } from '../utils/simulasi-scoring.js';
import { EXAM_PASS_PCT, EXAM_SECONDS_PER_QUESTION } from '../utils/constants.js';
import {
  saveQuizSnapshot,
  readQuizSnapshot,
  clearQuizSnapshot,
} from '../utils/quiz-persistence.js';
import ProgressBar from '../components/ProgressBar.jsx';
import S from './modes.module.css';
import SM from './SimulasiMode.module.css';

// Both of these describe the real exam, and both had a second copy elsewhere
// that could drift from this one: PASS_PCT was repeated as a bare 65 in
// achievements.js and recommend-mode.js, and the per-question time budget
// contradicted data/angka-kunci.js, which taught 90 s/question as a
// memorisable fact. They live in utils/constants.js now; the angka-kunci
// entry was the wrong one and has been corrected to 2 min (owner, 2026-09-04).
const PASS_PCT = EXAM_PASS_PCT;
const RED_BTN = {
  fontFamily: 'inherit',
  borderRadius: T.r.md,
  border: 'none',
  background: 'linear-gradient(135deg,#7f1d1d,#dc2626)',
  color: '#fff',
  cursor: 'pointer',
  fontWeight: 700,
  fontSize: 'var(--fs-body)',
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
const SECONDS_PER_QUESTION = EXAM_SECONDS_PER_QUESTION;
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
// The third line used to read "🚫 Soal otomatis lanjut setelah kamu jawab",
// which item 48 made false when it removed auto-advance: navigation has been
// explicit (Prev/Next/navigator/Kumpulkan) ever since, and answers can be
// changed until you submit. The card that tells you the rules was the one
// thing still describing the old behaviour.
const INSTRUCTIONS = [
  '📋 Pilih satu jawaban yang paling tepat',
  '⏱ Timer berjalan — jangan sampai habis',
  '↔️ Bebas pindah soal & ganti jawaban sebelum dikumpulkan',
  '⬜ Soal kosong dihitung salah',
  `✅ ${PASS_PCT}% ke atas = LULUS`,
];
// One row per bucket: "label ..... 72% (13/18)". Extracted when the results
// screen gained a second breakdown (teori/praktik alongside per-set) so the
// row markup exists once rather than twice.
function BreakdownList({ label, entries }) {
  if (entries.length === 0) return null;
  return (
    <>
      <div className={S.sectionLabel}>{label}</div>
      <div className={S.list} style={{ gap: 'var(--space-6)' }}>
        {entries.map(([rowLabel, stat]) => {
          const pct = Math.round((stat.correct / stat.total) * 100);
          const color = pct >= 75 ? T.correct : pct >= 50 ? T.gold : T.wrong;
          return (
            <div key={rowLabel} className={SM.breakdownRow}>
              <span style={{ color: T.textMuted, flex: 1 }}>{rowLabel}</span>
              <span style={{ color, fontWeight: 700, minWidth: 60, textAlign: 'right' }}>
                {pct}% ({stat.correct}/{stat.total})
              </span>
            </div>
          );
        })}
      </div>
    </>
  );
}

// Tally results into [[label, {correct,total}], ...], worst ratio first.
function tallyBy(results, keyOf) {
  const buckets = {};
  results.forEach((r) => {
    const key = keyOf(r);
    if (key == null) return;
    if (!buckets[key]) buckets[key] = { correct: 0, total: 0 };
    buckets[key].total++;
    if (r.isCorrect) buckets[key].correct++;
  });
  return Object.entries(buckets).sort(
    (a, b) => a[1].correct / a[1].total - b[1].correct / b[1].total
  );
}

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
    // Every one of JAC_OFFICIAL's 95 questions carries a related_card_id, and
    // this mapper was dropping all 95 of them -- which is why the results
    // screen's "Latih N Salah" had no card ids to send anywhere and shipped
    // sending array *indexes* instead (see the results screen below).
    _cardId: typeof q.related_card_id === 'number' ? q.related_card_id : null,
  }));
}

// _category ('teori'/'praktik'/null) drives the ratio sampling below --
// null means the set is neither (vocab, wglv-*), so it's naturally excluded
// from both buckets rather than needing its own separate filter.
export function buildQuizSetsPool() {
  // Deduplicated by question text. 740 questions across 34 sets contain only
  // 688 distinct ones: 41 teori questions and 9 praktik questions appear in
  // two sets each, mostly where a Wayground set and a JAC-Mockup set cover the
  // same ground (the KY活動 4-step questions live in wt01, wt06, jmt01 and
  // jmt02). Sampling 30+20 from the raw pool therefore drew the same question
  // twice in 22.6% of full exams (measured over 20 000 simulated draws; 6.2% at
  // 25 questions, 2.1% at 15) -- a repeat is the most obviously "not a real
  // exam" thing this mode could do, and one Set here removes it for good.
  //
  // Deliberately NOT applied to buildJacPool: 学科 Set 1 and 実技 Set 1 share
  // exactly one question, but the owner's rule for JAC Official is "take
  // everything in both sets" (2026-08-28), and its 44/51 totals are a stated
  // contract. Official content repeating itself across two official sets is
  // the book's own doing, not an import artefact.
  const seen = new Set();
  return QUIZ_SETS.flatMap((set) => {
    const category = isTeoriId(set.id) ? 'teori' : isPraktikId(set.id) ? 'praktik' : null;
    if (!category) return [];
    return (set.questions || []).flatMap((q) => {
      if (seen.has(q.q)) return [];
      seen.add(q.q);
      return [
        {
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
          // No question in QUIZ_SETS has a related card id (checked: 0 of 980),
          // so a wrong answer from this pool has no flashcard to send you to.
          // Explicit rather than absent, so the results screen's retry button
          // can filter on it instead of guessing.
          _cardId: null,
        },
      ];
    });
  });
}

// Snapshot keys. Two of them, matching QuizMode's convention (item 51): the
// drawn questions are written once per exam and the progress many times, so
// they don't belong in one blob that gets rewritten on every answer.
const PERSIST_KEY = 'ssw-simulasi-progress';
const PERSIST_QUESTIONS_KEY = 'ssw-simulasi-questions';
// quiz-persistence's own 30-minute default is shorter than the thing being
// persisted: a full exam runs 100 minutes, and JAC Official's full preset up
// to 102. Six hours is "the same sitting, generously" -- sessionStorage is
// already cleared when the tab closes, so this only decides how long a
// backgrounded tab may nap before its exam stops being offered back.
const SNAPSHOT_MAX_AGE_MS = 6 * 60 * 60 * 1000;

// Draw one exam. Pulled out of the component (it used to be a useMemo keyed on
// a `seed` counter) because an exam now has to be restorable: the questions are
// state you can save and load, not a value derived from render inputs.
function drawExam(mode, config) {
  let items;
  if (mode === 'jac') {
    const pool = shuffle(buildJacPool());
    items = config.count > 0 ? pool.slice(0, config.count) : pool;
  } else {
    const pool = buildQuizSetsPool();
    const teoriPool = shuffle(pool.filter((q) => q._category === 'teori'));
    const praktikPool = shuffle(pool.filter((q) => q._category === 'praktik'));
    // Math.min guards a pool ever coming up short of the preset's ask --
    // not expected (teori alone is 377 deduplicated questions, far more than
    // the largest preset's 30), but slicing past an array's length just
    // returns what's there rather than throwing, so this is a defensive
    // floor, not a fix for a currently-observed shortage.
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
      _category: q._category ?? null,
      _cardId: q._cardId ?? null,
    };
  });
}

export default function SimulasiMode({ onExit, onSessionEnd, onRetryWrong }) {
  const { prefs } = useApp();
  const confirm = useConfirm();
  const furiganaPolicy = prefs?.furiganaPolicy ?? 'always';
  const [phase, setPhase] = useState('start');
  const [mode, setMode] = useState('pool');
  const [preset, setPreset] = useState('quick');
  const [questions, setQuestions] = useState([]);
  const [qIdx, setQIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { [qIdx]: { selectedIdx, isCorrect } }
  const [results, setResults] = useState([]); // built once, at submit (item 48)
  const [timeLeft, setTimeLeft] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);
  // The exam ends at a wall-clock instant, not after N ticks of an interval.
  // The old counter decremented on a setInterval whose effect depended on
  // finishExam -- which depends on `answers` -- so every single answer tore the
  // interval down and started a fresh one, throwing away that second's elapsed
  // time. Fifty answers bought roughly fifty free seconds, and a fast run
  // through the paper could stall the clock almost completely. A deadline can't
  // be gamed that way, survives the browser throttling timers in a backgrounded
  // tab, and is the one number a resumed exam needs to restore.
  const deadlineRef = useRef(0);
  const frozenLeftRef = useRef(0); // seconds remaining, while paused
  const finishRef = useRef(null);

  const activePresets = mode === 'jac' ? JAC_PRESETS : POOL_PRESETS;
  const config = activePresets.find((p) => p.key === preset) || activePresets[0];

  // A snapshot found at mount, offered as "resume?" on the start screen. Read
  // once, in the initialiser, so a save written later in this same session
  // can't make the prompt reappear mid-exam.
  const [resumeData, setResumeData] = useState(() => {
    const progress = readQuizSnapshot(PERSIST_KEY, SNAPSHOT_MAX_AGE_MS);
    const saved = readQuizSnapshot(PERSIST_QUESTIONS_KEY, SNAPSHOT_MAX_AGE_MS);
    if (!progress || !Array.isArray(saved) || saved.length === 0) return null;
    return { progress, questions: saved };
  });

  const q = questions[qIdx];
  const isLast = qIdx === questions.length - 1;
  const selected = answers[qIdx]?.selectedIdx ?? null;
  const answeredCount = Object.keys(answers).length;
  const budgetSec = questions.length * SECONDS_PER_QUESTION;

  const clearSnapshot = useCallback(() => {
    clearQuizSnapshot(PERSIST_KEY);
    clearQuizSnapshot(PERSIST_QUESTIONS_KEY);
  }, []);

  const finishExam = useCallback(() => {
    setResults(buildSimulasiResults(questions, answers));
    setPhase('result');
    clearSnapshot();
  }, [questions, answers, clearSnapshot]);

  // Kept in a ref so the ticking effect below never has to list finishExam as a
  // dependency -- that dependency is exactly what used to restart the timer on
  // every answer.
  useEffect(() => {
    finishRef.current = finishExam;
  }, [finishExam]);

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

  const pauseExam = useCallback(() => {
    frozenLeftRef.current = Math.max(0, Math.round((deadlineRef.current - Date.now()) / 1000));
    setPaused(true);
  }, []);

  const resumeExam = useCallback(() => {
    deadlineRef.current = Date.now() + frozenLeftRef.current * 1000;
    setPaused(false);
  }, []);

  // Auto-pause on tab/app hide. Guarded on !paused: pausing an already-paused
  // exam would re-freeze from a deadline that stopped moving, zeroing the clock.
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && phase === 'playing' && !paused) pauseExam();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [phase, paused, pauseExam]);

  useEffect(() => {
    if (phase !== 'playing' || paused) {
      clearInterval(timerRef.current);
      return;
    }
    const tick = () => {
      const left = Math.max(0, Math.round((deadlineRef.current - Date.now()) / 1000));
      setTimeLeft(left);
      if (left <= 0) {
        clearInterval(timerRef.current);
        finishRef.current?.();
      }
    };
    tick(); // don't wait a second to show a restored or freshly-set clock
    timerRef.current = setInterval(tick, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase, paused]);

  // Snapshot (item 78). Written on the state that actually changes -- the
  // viewed question, the answer sheet, the pause -- not on the clock, which
  // would mean rewriting the whole exam to sessionStorage once a second. The
  // deadline is stored absolute, so a reload three minutes later comes back
  // with three fewer minutes rather than a refilled clock.
  useEffect(() => {
    if (phase !== 'playing' || questions.length === 0) return;
    saveQuizSnapshot(PERSIST_KEY, {
      mode,
      preset,
      qIdx,
      answers,
      paused,
      deadlineAt: deadlineRef.current,
      frozenLeft: frozenLeftRef.current,
    });
  }, [phase, questions.length, mode, preset, qIdx, answers, paused]);

  useEffect(() => {
    if (phase === 'result' && results.length > 0) {
      const correct = results.filter((r) => r.isCorrect).length;
      // Elapsed exam time, not wall-clock-since-mount. useSessionTimer measures
      // from when the component mounted and is never reset, so it counted the
      // time spent choosing a preset, every pause, and -- on a second attempt
      // via 🔄 Ulang -- the whole first exam as well. The budget minus what is
      // left on the clock is the exam's own elapsed time, and pausing extends
      // the deadline rather than the elapsed time, so a break doesn't inflate
      // the study minutes this reports.
      const durationMs = Math.max(0, (budgetSec - timeLeft) * 1000);
      onSessionEnd?.({ correct, total: results.length, durationMs });
    }
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const startExam = useCallback((drawn, remainingSec, startPaused = false) => {
    // The drawn list is written once, here. It cannot be re-derived on a
    // reload: both sources shuffle, and the options within each question are
    // shuffled too, so restoring "question 7, answer B" against a fresh draw
    // would restore the position into a different exam.
    saveQuizSnapshot(PERSIST_QUESTIONS_KEY, drawn);
    setQuestions(drawn);
    setQIdx(0);
    setAnswers({});
    setResults([]);
    deadlineRef.current = Date.now() + remainingSec * 1000;
    frozenLeftRef.current = remainingSec;
    setTimeLeft(remainingSec);
    setPaused(startPaused);
    setPhase('playing');
  }, []);

  const handleStart = useCallback(() => {
    const drawn = drawExam(mode, config);
    setResumeData(null); // a fresh exam replaces whatever was saved
    clearSnapshot();
    // The budget follows the actual draw. JAC Official's "full" preset picks a
    // random set pair whose total is 44 or 51, so its config.time is only a
    // placeholder; every other preset draws exactly what it asked for, and this
    // recomputes the identical number for them.
    startExam(drawn, drawn.length * SECONDS_PER_QUESTION);
  }, [mode, config, clearSnapshot, startExam]);

  const handleResume = useCallback(() => {
    if (!resumeData) return;
    const { progress, questions: saved } = resumeData;
    setResumeData(null);
    setMode(progress.mode ?? 'pool');
    setPreset(progress.preset ?? 'quick');
    setQuestions(saved);
    setQIdx(Math.min(progress.qIdx ?? 0, saved.length - 1));
    setAnswers(progress.answers ?? {});
    setResults([]);
    const wasPaused = !!progress.paused;
    const left = wasPaused
      ? Math.max(0, progress.frozenLeft ?? 0)
      : Math.max(0, Math.round(((progress.deadlineAt ?? 0) - Date.now()) / 1000));
    deadlineRef.current = Date.now() + left * 1000;
    frozenLeftRef.current = left;
    setTimeLeft(left);
    setPaused(wasPaused);
    setPhase('playing');
    // left === 0 needs no special case: the ticking effect's first tick sees a
    // dead clock and submits the restored answer sheet, which is what running
    // out of time away from the tab should mean.
  }, [resumeData]);

  const handleDiscardResume = useCallback(() => {
    clearSnapshot();
    setResumeData(null);
  }, [clearSnapshot]);

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

  // Shared by this mode's own exit controls and by ModeHeader's back arrow, via
  // the exit guard below — the header owns the only back control on the screen
  // now, so the confirmation has to live somewhere both can reach.
  const confirmDiscard = useCallback(async () => {
    const ok = await confirm(
      `${answeredCount}/${questions.length} soal sudah dijawab. Keluar sekarang akan menghapus semuanya — progres simulasi tidak tersimpan sebagian.`,
      'Keluar, hapus progres',
      'Tetap di sini'
    );
    // Leaving on purpose has to take the snapshot with it, or the exam the user
    // just chose to throw away would be offered back on the next visit.
    if (ok) clearSnapshot();
    return ok;
  }, [answeredCount, questions.length, confirm, clearSnapshot]);

  // Only while an exam is actually running: there is nothing to lose on the
  // start screen or once results are on screen, and a confirmation with no
  // stakes is the kind of dialog people learn to dismiss without reading.
  useExitGuard(phase === 'playing' ? confirmDiscard : null);

  const handleExitClick = useCallback(async () => {
    if (phase === 'playing' && !(await confirmDiscard())) return;
    onExit();
  }, [phase, confirmDiscard, onExit]);

  const isUrgent = timeLeft < 60 && timeLeft > 0 && phase === 'playing';

  // ─── START ─────────────────────────────────────────────────────────────────
  if (phase === 'start') {
    return (
      <div className={S.page}>
        <div className={SM.startHero}>
          <div className={SM.startHeroEmoji}>🎯</div>
          <p className={S.pageSub}>Format ujian SSW Konstruksi dengan timer</p>
        </div>
        {resumeData &&
          (() => {
            // A saved exam is worth more than a preset choice, so it sits above
            // everything else on this screen. The remaining time is recomputed
            // from the stored deadline rather than shown as saved -- an exam
            // whose clock ran out while the tab was closed says so, and
            // "Lanjutkan" then submits the answer sheet it did have.
            const answered = Object.keys(resumeData.progress.answers ?? {}).length;
            const total = resumeData.questions.length;
            const left = resumeData.progress.paused
              ? Math.max(0, resumeData.progress.frozenLeft ?? 0)
              : Math.max(
                  0,
                  Math.round(((resumeData.progress.deadlineAt ?? 0) - Date.now()) / 1000)
                );
            return (
              <div className={SM.resumeCard}>
                <div className={SM.resumeTitle}>Lanjutkan simulasi sebelumnya?</div>
                <div className={SM.resumeSub}>
                  {answered}/{total} soal terjawab ·{' '}
                  {left > 0
                    ? `sisa waktu ${fmtTime(left)}`
                    : 'waktu sudah habis — akan langsung dinilai'}
                </div>
                <div className={`${S.row} ${SM.resumeActions}`}>
                  <button
                    style={{ ...RED_BTN, flex: 1, padding: 'var(--space-10)' }}
                    onClick={handleResume}
                  >
                    ▶ Lanjutkan
                  </button>
                  <button
                    className={S.btnSecondary}
                    style={{ flex: 1 }}
                    onClick={handleDiscardResume}
                  >
                    Mulai Baru
                  </button>
                </div>
              </div>
            );
          })()}
        <div className={`${S.card} ${SM.instructionsCard}`}>
          {INSTRUCTIONS.map((inst, i) => (
            <div key={i} className={SM.instructionLine}>
              {inst}
            </div>
          ))}
        </div>
        <div className={S.sectionLabel}>Sumber Soal</div>
        <div className={`${S.list} ${SM.presetList}`} style={{ marginBottom: 'var(--space-20)' }}>
          {MODES.map((m) => (
            <button
              key={m.key}
              className={S.btnItem}
              onClick={() => setMode(m.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-12)',
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
                gap: 'var(--space-12)',
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
            padding: 'var(--space-14)',
            fontSize: 'var(--fs-subtitle)',
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
    // The cards behind the wrong answers, deduplicated. This button used to
    // pass `wrongList.map((_, i) => i)` -- positions in the wrong-answer list,
    // handed to ModeRouter as `filterIds` and matched against card ids. Card
    // ids run 1..1443, so one wrong answer sent you to an empty deck (id 0
    // matches nothing) and twenty sent you to cards 1..19: real flashcards,
    // none of them the ones you got wrong. Only JAC Official questions carry a
    // related_card_id at all, so a pure Teori & Praktik exam legitimately has
    // nothing to offer here and the button stays hidden rather than lying.
    const wrongCardIds = [
      ...new Set(wrongList.map((r) => r._cardId).filter((id) => typeof id === 'number')),
    ];
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
          <button style={{ ...RED_BTN, flex: 1, padding: 'var(--space-12)' }} onClick={handleStart}>
            🔄 Ulang
          </button>
          {wrongCardIds.length > 0 && onRetryWrong && (
            <button
              style={{
                ...RED_BTN,
                flex: 1,
                padding: 'var(--space-12)',
                background: 'linear-gradient(135deg,#1e3a5f,#2563eb)',
              }}
              onClick={() => onRetryWrong(wrongCardIds)}
            >
              📚 Latih {wrongCardIds.length} Kartu
            </button>
          )}
          <button className={`${S.btnSecondary} ${SM.kembaliBtn}`} onClick={onExit}>
            ← Kembali
          </button>
        </div>

        {/* Breakdown. Teori/praktik first: on a 50-question pool exam the
            per-set rows are ~34 buckets of one or two questions each, which
            says nothing about anything, while the teori/praktik split is the
            axis the exam is actually sampled on (30/20) and the one the real
            exam is graded on. _category is null for JAC Official, whose own
            sets are the meaningful grouping, so that source shows per-set
            only -- and its two rows are 学科 vs 実技 anyway. */}
        <BreakdownList
          label="Breakdown Teori / Praktik"
          entries={tallyBy(results, (r) =>
            r._category === 'teori' ? '📋 Teori' : r._category === 'praktik' ? '🛠️ Praktik' : null
          )}
        />
        <BreakdownList
          label="Breakdown per Set"
          entries={tallyBy(results, (r) => r._setLabel || r._source || 'Lainnya')}
        />

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
                      <JpFront
                        jp={r.jp}
                        furiganaPolicy={furiganaPolicy}
                        maxSize={JP_LIST_MAX}
                        compact
                      />
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
                        compact
                      />
                    </div>
                    <div className={SM.reviewCorrect}>
                      ✓{' '}
                      <JpFront
                        jp={correctOpt?.text || '—'}
                        furiganaPolicy={furiganaPolicy}
                        maxSize={JP_LIST_MAX_SECONDARY}
                        compact
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
        <div className={S.row} style={{ gap: 'var(--space-10)' }}>
          {/* Pause button */}
          <button
            onClick={() => (paused ? resumeExam() : pauseExam())}
            style={{
              ...RED_BTN,
              padding: 'var(--space-6) var(--space-12)',
              fontSize: '0.875rem',
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
                      fontSize: 'var(--fs-nano)',
                      color: isUrgent ? T.wrong : T.textDim,
                      marginTop: 'var(--space-2)',
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
            <div style={{ fontSize: 'var(--fs-micro)', color: T.textDim }}>TERJAWAB</div>
            <div style={{ fontSize: 'var(--fs-subtitle)', fontWeight: 700, color: T.text }}>
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
                gap: 'var(--space-10)',
                width: '100%',
                padding: 'var(--space-14) var(--space-16)',
                textAlign: 'left',
                borderRadius: 12,
                background: isSelected ? T.surfaceActive : T.surface,
                border: `2px solid ${isSelected ? T.amber : T.border}`,
                color: T.text,
                fontFamily: 'inherit',
                fontSize: '0.875rem',
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
                  fontSize: 'var(--fs-caption)',
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
          gap: 'var(--space-6)',
          marginTop: 'var(--space-16)',
          padding: 'var(--space-10)',
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
                fontSize: 'var(--fs-small)',
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
      <div style={{ display: 'flex', gap: 'var(--space-8)', marginTop: 'var(--space-12)' }}>
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
        style={{
          ...RED_BTN,
          width: '100%',
          marginTop: 'var(--space-8)',
          padding: 'var(--space-14)',
        }}
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
            gap: 'var(--space-12)',
          }}
        >
          <div style={{ fontSize: '3rem' }}>⏸</div>
          <div style={{ color: '#fff', fontSize: 'var(--fs-jp-back)', fontWeight: 700 }}>
            Dijeda
          </div>
          <div
            style={{
              color: 'rgba(255,255,255,0.65)',
              fontSize: '0.875rem',
              marginBottom: 'var(--space-8)',
            }}
          >
            {answeredCount}/{questions.length} soal terjawab · waktu ikut berhenti
          </div>
          <button
            type="button"
            onClick={resumeExam}
            style={{
              ...RED_BTN,
              padding: 'var(--space-14) var(--space-32)',
              fontSize: 'var(--fs-subtitle)',
            }}
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
              fontSize: 'var(--fs-body)',
              fontFamily: 'inherit',
              cursor: 'pointer',
              padding: 'var(--space-8)',
              marginTop: 'var(--space-4)',
            }}
          >
            ✕ Keluar dari simulasi
          </button>
        </div>
      )}
    </div>
  );
}
