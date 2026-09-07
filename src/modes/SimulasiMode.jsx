// ─── SimulasiMode.jsx ─────────────────────────────────────────────────────────
// Note: timer box bg/border/animation conditional on isUrgent — justified inline.
// Note: lulus banner bg/border/color conditional on pass/fail — justified inline.
// Note: progress fill gradient conditional on pass/fail — justified inline.
// Note: red gradient buttons (exam theme) — justified inline (not amber).
// Note: pause overlay bg — justified inline (full-screen dim).
import { useState, useEffect, useCallback, useRef } from 'react';
import { T } from '../styles/theme.js';
import { shuffle } from '../utils/shuffle.js';
import { isTypingTarget } from '../utils/keyboard.js';
import { originForSet, originMeta } from '../utils/question-origin.js';
import { stripFuri, JP_LIST_MAX, JP_LIST_MAX_SECONDARY } from '../utils/jp-helpers.js';
import { useApp } from '../contexts/AppContext.jsx';
import { useProgress } from '../contexts/ProgressContext.jsx';
import { useConfirm } from '../components/ConfirmDialog.jsx';
import { useExitGuard } from '../hooks/useExitGuard.js';
import { JpFront, renderJPWithRuby, parseRubyFragments } from '../components/JpDisplay.jsx';
import { JAC_OFFICIAL } from '../data/index.js';
import { QUIZ_SETS } from '../data/quiz-sets.js';
import { isTeoriId, isPraktikId } from '../utils/quiz-classification.js';
import { haptic } from '../utils/haptic.js';
import { buildSimulasiResults } from '../utils/simulasi-scoring.js';
import { recordSimulasiMistakes } from '../utils/simulasi-mistakes.js';
import {
  EXAM_PASS_PCT,
  EXAM_SECONDS_PER_QUESTION,
  EXAM_FULL_TEORI,
  EXAM_FULL_PRAKTIK,
  examMinutes,
} from '../utils/constants.js';
import {
  saveQuizSnapshot,
  readQuizSnapshot,
  clearQuizSnapshot,
} from '../utils/quiz-persistence.js';
import ProgressBar from '../components/ProgressBar.jsx';
import ExplanationText from '../components/ExplanationText.jsx';
import { pillStyle } from '../styles/pill.js';
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
    // Item 102a. This read "Soal resmi dari buku ujian JAC (95 soal)", which
    // sets up an expectation no preset here can meet: every start — quick, half
    // and full alike — draws from one random teori set plus one random praktik
    // set (pickJacSetPair, 44 or 51 questions), never the flattened 95. The
    // bank is 95; the exam never is. This line says the bank and that a run is
    // a sample of it; the presets below say what each run actually draws, so
    // the set-pair rule is spelled out once rather than twice on one screen.
    sub: `Bank resmi ${JAC_OFFICIAL.length} soal · tiap ujian ambil sebagian secara acak`,
  },
];
// Each preset's `sub` is written from its own `teori`/`praktik` rather than
// typed beside them: "15 soal (9 teori + 6 praktik) · 30 menit" restates three
// numbers that already sit two lines below it, which is exactly how the menu
// counts in modes.js went stale twice (see MODE_COUNTS). The full preset's
// split lives in constants.js because the Belajar menu needs it too and cannot
// import this lazy chunk.
const poolPreset = (key, emoji, label, teori, praktik) => {
  const n = teori + praktik;
  return {
    key,
    emoji,
    label,
    sub: `${n} soal (${teori} teori + ${praktik} praktik) · ${examMinutes(n)} menit`,
    teori,
    praktik,
    time: n * SECONDS_PER_QUESTION,
  };
};
const POOL_PRESETS = [
  poolPreset('quick', '⚡', 'Latihan Cepat', 9, 6),
  poolPreset('half', '📝', 'Setengah Ujian', 15, 10),
  poolPreset('full', '🎯', 'Ujian Penuh', EXAM_FULL_TEORI, EXAM_FULL_PRAKTIK),
];
const JAC_PRESETS = [
  {
    key: 'quick',
    emoji: '⚡',
    label: 'Latihan Cepat',
    sub: `15 soal · ${examMinutes(15)} menit`,
    count: 15,
    time: 15 * SECONDS_PER_QUESTION,
  },
  {
    key: 'half',
    emoji: '📝',
    label: 'Setengah Ujian',
    sub: `25 soal · ${examMinutes(25)} menit`,
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
// Item 100. The review list was wrong-answers-only, which makes a lucky guess
// indistinguishable from knowledge — and on a flagged question you got right,
// there was nothing at all to come back to. Three filters rather than a single
// "show correct too" switch: 🚩 is the one a 100-minute paper is actually
// reviewed by, and it cuts across both of the others.
const REVIEW_FILTERS = [
  { key: 'salah', label: '✗ Salah', pick: (rs) => rs.filter((r) => !r.isCorrect) },
  { key: 'benar', label: '✓ Benar', pick: (rs) => rs.filter((r) => r.isCorrect) },
  { key: 'tandai', label: '🚩 Ditandai', pick: (rs) => rs.filter((r) => r.wasFlagged) },
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
    // Item 98: tt1/tt2 are 学科 (teori) and st1/st2 are 実技 (praktik) — stated
    // in this file's own pickJacSetPair comment and in the source files, just
    // never carried through the mapper. With it, the short presets can sample
    // in proportion (below) and the results screen's teori/praktik breakdown
    // works for this source too instead of silently rendering nothing.
    _category: String(q.set).startsWith('st') ? 'praktik' : 'teori',
    _origin: 'resmi', // item 106 — this is the book itself
    // Item 93: the id this question is already tracked under everywhere else.
    // JACMode writes these into progress.wrongCounts and reads them back as its
    // "⚠ Lemah" set, so a mistake made here lands where a mistake made there
    // already lands, rather than in a third namespace nothing reads.
    _wrongKey: q.id,
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
          // Item 106: this used to read `set.source?.startsWith('csv') ? 'csv'
          // : 'wayground'`, and no set's source starts with 'csv' — the branch
          // was dead, and with it any distinction between JAC-style mockups and
          // practice material.
          _source: 'wayground',
          _origin: originForSet(set.source),
          _setLabel: set.title || 'Wayground',
          _category: category,
          // Item 93: the key WaygroundMode writes into progress.wgWrong and
          // reads back as its per-set "⚠ Ulang N salah". Same question, same
          // key, whichever mode you met it in.
          _wrongKey: `${set.id}-${q.id}`,
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
export function drawExam(mode, config) {
  let items;
  if (mode === 'jac') {
    const pool = buildJacPool();
    if (config.count > 0) {
      // Item 98: this was a plain shuffled slice, so the composition of a
      // 15-question Latihan Cepat was whatever chance gave — measured over
      // 20 000 draws: 0 to 11 praktik questions, and 0.11% of runs with none at
      // all. A mock exam whose practical half can vanish is not a mock exam.
      //
      // Sampled in proportion to the pair it drew, rather than forced to the
      // Teori & Praktik pool's 60/40: this source's premise is "the official
      // book", the full preset already takes the book's own mix (29 or 36 teori
      // to 15 praktik), and a short run should be that same mix, smaller. The
      // owner's "biar keliatan kyk random" governs which pair is drawn — it
      // still does; nothing here chooses the pair.
      const teori = shuffle(pool.filter((q) => q._category === 'teori'));
      const praktik = shuffle(pool.filter((q) => q._category === 'praktik'));
      const nTeori = Math.round((config.count * teori.length) / (pool.length || 1));
      const take = [
        ...teori.slice(0, Math.min(nTeori, teori.length)),
        ...praktik.slice(0, Math.min(config.count - nTeori, praktik.length)),
      ];
      // If either half came up short, top up from whatever is left rather than
      // handing back a slice narrower than the preset promised.
      if (take.length < config.count) {
        const used = new Set(take);
        take.push(...pool.filter((q) => !used.has(q)).slice(0, config.count - take.length));
      }
      items = shuffle(take);
    } else {
      items = shuffle(pool);
    }
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
      _wrongKey: q._wrongKey ?? null,
      _origin: q._origin ?? 'latihan',
    };
  });
}

/**
 * Item 94: what a simulasi attempt is filed under. Per source *and* preset,
 * because "58% last time" only means anything against the same exam — a
 * 15-question Latihan Cepat and a 44-question JAC pair are not comparable runs.
 */
const simScoreKey = (mode, preset) => `${mode}-${preset}`;

export default function SimulasiMode({ onExit, onSessionEnd, onRetryWrong }) {
  const { prefs } = useApp();
  const { saveScore, simScores, recordWrong } = useProgress();
  const confirm = useConfirm();
  const furiganaPolicy = prefs?.furiganaPolicy ?? 'always';
  const [phase, setPhase] = useState('start');
  const [mode, setMode] = useState('pool');
  const [preset, setPreset] = useState('quick');
  const [questions, setQuestions] = useState([]);
  const [qIdx, setQIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { [qIdx]: { selectedIdx, isCorrect } }
  // Item 101: the questions you want to come back to, by index. A real exam --
  // Prometric's delivery included -- lets you mark one and move on rather than
  // stalling on it, which is the behaviour a 100-minute paper actually rewards.
  // A Set beside `answers` is the whole feature: flagging is orthogonal to
  // answering (you can flag an answer you are unsure of, not only a blank).
  const [flagged, setFlagged] = useState(() => new Set());
  const [results, setResults] = useState([]); // built once, at submit (item 48)
  // Item 100: the review list showed only wrong answers, so a lucky guess and a
  // known answer looked identical afterwards -- on a 4-option paper that is a
  // 25% chance per blank guess, and the whole point of this screen is telling
  // someone what they actually know. Defaults to 'salah' because that is still
  // the first thing to read; the other two are one tap away.
  const [reviewFilter, setReviewFilter] = useState('salah');
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
  const flaggedCount = flagged.size;
  const isFlagged = flagged.has(qIdx);
  const budgetSec = questions.length * SECONDS_PER_QUESTION;

  const clearSnapshot = useCallback(() => {
    clearQuizSnapshot(PERSIST_KEY);
    clearQuizSnapshot(PERSIST_QUESTIONS_KEY);
  }, []);

  const finishExam = useCallback(() => {
    const built = buildSimulasiResults(questions, answers, flagged);
    setResults(built);
    // Item 93. At submit, not per answer: item 48 requires that nothing reveals
    // correctness until the paper is handed in, and a store written mid-exam is
    // a store that could be read mid-exam.
    recordSimulasiMistakes(built, recordWrong);
    setPhase('result');
    clearSnapshot();
  }, [questions, answers, flagged, recordWrong, clearSnapshot]);

  // Kept in a ref so the ticking effect below never has to list finishExam as a
  // dependency -- that dependency is exactly what used to restart the timer on
  // every answer.
  useEffect(() => {
    finishRef.current = finishExam;
  }, [finishExam]);

  const handleSubmitClick = useCallback(async () => {
    const unanswered = questions.length - answeredCount;
    // A flag is a promise to yourself to come back. Submitting with flags still
    // set is the one moment that promise can still be kept, so it is worth a
    // sentence -- but only one dialog: two in a row is how people learn to
    // dismiss them without reading.
    const warnings = [];
    if (unanswered > 0) {
      warnings.push(
        `${unanswered} soal belum dijawab. Soal yang belum dijawab dihitung salah, sama seperti ujian sungguhan.`
      );
    }
    if (flaggedCount > 0) {
      warnings.push(`${flaggedCount} soal masih ditandai 🚩 untuk ditinjau ulang.`);
    }
    if (warnings.length > 0) {
      const ok = await confirm(warnings.join(' '), 'Kumpulkan sekarang', 'Kembali');
      if (!ok) return;
    }
    finishExam();
  }, [questions.length, answeredCount, flaggedCount, confirm, finishExam]);

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
      flagged: [...flagged],
      paused,
      deadlineAt: deadlineRef.current,
      frozenLeft: frozenLeftRef.current,
    });
  }, [phase, questions.length, mode, preset, qIdx, answers, flagged, paused]);

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
      // Item 94: the one mode where a trend is the whole reason to take it
      // twice was the only one keeping no history of itself.
      const pct = results.length > 0 ? Math.round((correct / results.length) * 100) : 0;
      saveScore('sim', simScoreKey(mode, preset), {
        score: correct,
        total: results.length,
        pct,
        date: Date.now(),
      });
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
    setFlagged(new Set());
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
    // Stored as an array: sessionStorage holds JSON, and a Set serialises to {}.
    setFlagged(new Set(progress.flagged ?? []));
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

  const toggleFlag = useCallback(() => {
    if (phase !== 'playing' || paused) return;
    haptic.tap();
    setFlagged((prev) => {
      const next = new Set(prev);
      if (!next.delete(qIdx)) next.add(qIdx);
      return next;
    });
  }, [phase, paused, qIdx]);

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

  // Item 95: `simulasi` builds its own playing screen, so it never got
  // QuizShell's `useQuizKeyboard` — no shortcuts at all, on the one screen a
  // learner sits in front of for a hundred minutes. Not the shared hook,
  // though: that one locks an answer (it only fires while `selected === null`)
  // and advances on Space, both of which are wrong for a paper you can re-mark
  // and navigate freely until you hand it in (item 48). Same keys, this mode's
  // rules.
  useEffect(() => {
    if (phase !== 'playing' || paused) return;
    const handler = (e) => {
      if (isTypingTarget(e.target)) return;
      const opts = q?.opts?.length ?? 0;
      const MAP = { 1: 0, 2: 1, 3: 2, 4: 3, a: 0, b: 1, c: 2, d: 3 };
      const k = e.key.toLowerCase();
      if (MAP[k] !== undefined && MAP[k] < opts) {
        handleSelect(MAP[k]); // re-markable, unlike the shared hook
        return;
      }
      if (e.key === 'ArrowRight') goToQuestion(qIdx + 1);
      else if (e.key === 'ArrowLeft') goToQuestion(qIdx - 1);
      else if (k === 'f') toggleFlag();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [phase, paused, q, qIdx, handleSelect, goToQuestion, toggleFlag]);

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
          {activePresets.map((p) => {
            // Item 94: the last attempt at *this* exam, shown where the exam is
            // chosen — the same thing jac, wayground and vocab do on their own
            // start screens, and the one screen that had never done it.
            const last = simScores?.[simScoreKey(mode, p.key)];
            return (
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
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className={SM.presetLabel}>{p.label}</div>
                  <div
                    className={SM.presetSub}
                    style={{ color: preset === p.key ? 'rgba(239,68,68,0.7)' : T.textDim }}
                  >
                    {p.sub}
                  </div>
                </div>
                {last && (
                  <span
                    style={{
                      fontSize: 'var(--fs-small)',
                      fontWeight: 700,
                      flexShrink: 0,
                      color: last.pct >= PASS_PCT ? T.correct : T.wrong,
                    }}
                  >
                    {last.pct}%
                  </span>
                )}
              </button>
            );
          })}
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
    const activeFilter = REVIEW_FILTERS.find((f) => f.key === reviewFilter) ?? REVIEW_FILTERS[0];
    const reviewList = activeFilter.pick(results);
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

        {results.length > 0 && (
          <>
            <div className={S.sectionLabel}>Review Jawaban</div>
            <div
              className={S.row}
              style={{ gap: 'var(--space-6)', marginBottom: 'var(--space-10)', flexWrap: 'wrap' }}
            >
              {REVIEW_FILTERS.map((f) => {
                const n = f.pick(results).length;
                const active = reviewFilter === f.key;
                return (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() => setReviewFilter(f.key)}
                    aria-pressed={active}
                    disabled={n === 0}
                    style={{
                      ...pillStyle(active, 'sm'),
                      opacity: n === 0 ? 0.4 : 1,
                      cursor: n === 0 ? 'default' : 'pointer',
                    }}
                  >
                    {f.label} ({n})
                  </button>
                );
              })}
            </div>
            <div className={S.list}>
              {reviewList.map((r, i) => {
                const correctOpt = r.opts[r.correctIdx];
                const userOpt = r.opts[r.userIdx];
                return (
                  <div
                    key={i}
                    className={SM.reviewItem}
                    style={{ animation: `slideUp 0.3s ease ${i * 0.05}s both` }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-6)',
                        fontSize: 'var(--fs-micro)',
                        color: T.textDim,
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      <span>Soal {r.number}</span>
                      <span style={{ color: originMeta(r._origin).color }}>
                        {originMeta(r._origin).short}
                      </span>
                      <span style={{ color: r.isCorrect ? T.correct : T.wrong }}>
                        {r.isCorrect ? '✓ Benar' : '✗ Salah'}
                      </span>
                      {r.wasFlagged && <span style={{ color: T.amber }}>🚩 Ditandai</span>}
                    </div>
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
                    {/* A correct row would otherwise print the same option
                        twice under two ticks. Blanks still show, as "—": not
                        answering is the answer that was given. */}
                    {!r.isCorrect && (
                      <div className={SM.reviewWrong}>
                        ✗{' '}
                        <JpFront
                          jp={userOpt?.text || '—'}
                          furiganaPolicy={furiganaPolicy}
                          maxSize={JP_LIST_MAX_SECONDARY}
                          compact
                        />
                      </div>
                    )}
                    <div className={SM.reviewCorrect}>
                      ✓{' '}
                      <JpFront
                        jp={correctOpt?.text || '—'}
                        furiganaPolicy={furiganaPolicy}
                        maxSize={JP_LIST_MAX_SECONDARY}
                        compact
                      />
                    </div>
                    <ExplanationText text={r.explanation} className={SM.reviewExpl} />
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
      {/* Item 95: QuizShell gives every other quiz mode a live region, and this
          screen — which changes question and counts down a clock — had none, so
          both moved silently. Polite, not assertive: the countdown must not
          interrupt someone reading the question. */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        Soal {qIdx + 1} dari {questions.length}
        {isFlagged ? ', ditandai' : ''}
        {selected !== null ? ', sudah dijawab' : ''}
      </div>
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
              fontSize: 'var(--fs-caption)',
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
      <div
        className={S.counter}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-8)',
        }}
      >
        <span>
          Soal {qIdx + 1} / {questions.length}
          {flaggedCount > 0 && <span> · {flaggedCount} ditandai</span>}
        </span>
        {/* Item 101. Deliberately a toggle on the current question rather than a
            long-press or swipe on the navigator: the decision to come back is
            made while reading the question, not while looking at the grid. */}
        <button
          type="button"
          onClick={toggleFlag}
          aria-pressed={isFlagged}
          aria-label={
            isFlagged
              ? `Hapus tanda tinjau ulang dari soal ${qIdx + 1}`
              : `Tandai soal ${qIdx + 1} untuk ditinjau ulang`
          }
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-4)',
            padding: 'var(--space-4) var(--space-10)',
            borderRadius: 999,
            fontSize: 'var(--fs-small)',
            fontWeight: 700,
            fontFamily: 'inherit',
            cursor: 'pointer',
            background: isFlagged ? 'rgba(245, 158, 11, 0.15)' : T.surface,
            color: isFlagged ? T.amber : T.textDim,
            border: `1px solid ${isFlagged ? T.amber : T.border}`,
          }}
        >
          <span aria-hidden="true">🚩</span>
          {isFlagged ? 'Ditandai' : 'Tandai'}
        </button>
      </div>

      <div className={`${S.cardLg} ${SM.questionCard}`}>
        {/* Item 106: which bank this question came from, while you are
            answering it. "This is what the exam asked" and "this is what we
            wrote to drill you" should not look identical on an exam-prep app. */}
        {(() => {
          const om = originMeta(q._origin);
          return (
            <div
              className={SM.originBadge}
              style={{ color: om.color, borderColor: `${om.color}55` }}
              title={om.label}
            >
              {om.short}
              {q._setLabel ? ` · ${q._setLabel}` : ''}
            </div>
          );
        })()}
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
          answer sheet you can erase and re-mark before turning in.

          Named as a group because it is no longer the only set of toggle
          buttons on this screen: the review flag (item 101) is a toggle too, so
          "the pressed buttons" stopped being an unambiguous way to mean "the
          options" — for a screen reader as much as for a test. */}
      <div className={S.list} role="group" aria-label="Pilihan jawaban">
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
                fontSize: 'var(--fs-caption)',
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

      {/* Item 95: the navigator is one button per question, in document order,
          ahead of Prev/Next and Kumpulkan — so on a 51-question JAC exam a
          keyboard or switch user tabbed through 51 buttons to reach "submit".
          A skip link rather than a reorder: the navigator sits under the
          options because that is where it belongs visually, and moving 51
          buttons to the end of the document to fix a tab order would trade a
          keyboard problem for a reading-order one. */}
      <a href="#simulasi-kumpulkan" className={SM.skipLink}>
        Lewati daftar soal → Kumpulkan Ujian
      </a>

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
          const isMarked = flagged.has(i);
          return (
            <button
              key={i}
              onClick={() => goToQuestion(i)}
              aria-label={`Soal ${i + 1}${isAnswered ? ', sudah dijawab' : ', belum dijawab'}${isMarked ? ', ditandai untuk ditinjau ulang' : ''}${isCurrent ? ', sedang dilihat' : ''}`}
              style={{
                position: 'relative',
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
              {/* A corner dot, not a colour swap: answered/current already own
                  the cell's fill and border, and flagging has to be readable on
                  top of either of them rather than replacing one. The state is
                  in the aria-label above, so this is decoration. */}
              {isMarked && (
                <span
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    top: -3,
                    right: -3,
                    width: 9,
                    height: 9,
                    borderRadius: '50%',
                    background: T.amber,
                    border: `1.5px solid ${T.surface}`,
                  }}
                />
              )}
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
        id="simulasi-kumpulkan"
        onClick={handleSubmitClick}
      >
        Kumpulkan Ujian
      </button>

      {/* Same shape of hint QuizShell shows, for the same reason: shortcuts
          nobody knows about are shortcuts nobody uses. */}
      <div className={SM.kbHint}>Keyboard: 1–4 pilih · ← → pindah soal · F tandai</div>

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
              fontSize: 'var(--fs-caption)',
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
