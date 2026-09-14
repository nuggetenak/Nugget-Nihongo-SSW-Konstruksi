// ─── GenbaMode.jsx ────────────────────────────────────────────────────────────
// UI_UX_PLAN items 103 and 104, on one screen, because they turned out to be the
// same thing.
//
// 104 asked for a mode that tests Japanese → action: given
// `ホースを巻いて片付けてください`, choose *coil the hose and put it away* over
// three plausible wrong actions. The plan re-sized it to `S` on the grounds that
// the corpus already existed — 1,409 verb-final `usage` sentences — and then
// noted the honest caveat itself: those sentences are dictionary-form
// descriptions, not the imperative register, so the mode would test
// comprehension of a *described* action rather than response to an order.
//
// Note the example in 104's own text is `〜てください`. It was describing item
// 103's register all along. So with 103's corpus in the tree the cheap version
// is no longer the better one: this drill runs over genba-phrases.js, where the
// stem is a line someone actually says to you, and the caveat disappears rather
// than being documented around.
//
// ── TWO DIRECTIONS, ONE SHELL ────────────────────────────────────────────────
// `speaker` decides the question. A foreman's line is played *at* you and the
// options are actions; your own line is asked *of* you and the options are
// Japanese. QuizShell carries both without knowing the difference — `question`
// goes through JpFront, which already falls back to Indonesian body type for a
// string that is not meaningfully Japanese (the guard its own header documents),
// so an Indonesian situation stem renders as prose and a Japanese one renders
// with ruby, from the same field.
//
// Audio is on. For a corpus whose whole point is what a sentence sounds like
// when it arrives at speed, reading it off a screen is the easy version.
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useCallback, useMemo } from 'react';
import { shuffle } from '../utils/shuffle.js';
import { GENBA_PHRASES, GENBA_FUNCTIONS } from '../data/genba-phrases.js';
import QuizShell from '../components/QuizShell.jsx';
import SessionLengthPicker, { storedQuizCount } from '../components/SessionLengthPicker.jsx';
import {
  JpFront,
  DescBlock,
  renderJPWithRuby,
  parseRubyFragments,
} from '../components/JpDisplay.jsx';
import { JP_LIST_MAX, stripFuri } from '../utils/jp-helpers.js';
import { useApp } from '../contexts/AppContext.jsx';
import { useProgress } from '../contexts/ProgressContext.jsx';
import { recordTermMistake } from '../utils/mistake-bridge.js';
import S from './modes.module.css';
import G from './GenbaMode.module.css';

const ACCENT = '#14b8a6';

/** Who is talking, and therefore which way the drill runs. */
const DIRECTION = {
  shokucho: { badge: '👷→🧑 Kamu dengar', prompt: 'Apa yang kamu lakukan?' },
  sagyouin: { badge: '🧑→👷 Kamu bilang', prompt: 'Apa yang kamu katakan?' },
};

const byFn = (key) => (key === 'all' ? GENBA_PHRASES : GENBA_PHRASES.filter((p) => p.fn === key));

/**
 * One phrase becomes one QuizShell question.
 *
 * The correct option for a phrase you say is `jp` itself — genba-phrases.js
 * deliberately stores no second copy, so this is the one place that decides it.
 */
export function buildQuestion(p) {
  // Options are plain strings, not rendered nodes, and they have to be: OptionButton
  // prints `text` as-is, QuizAnnouncer reads it to a screen reader, and ResultScreen
  // stores it as the review row's userAnswer. A 《》 marker would show up literally in
  // the first and be spoken as brackets in the second, which is why every mode that
  // puts Japanese in an option calls stripFuri first. The readings are not lost —
  // the stem renders with ruby through JpFront, and the explanation re-shows the
  // phrase in full the moment an answer is picked.
  const correct = p.speaker === 'shokucho' ? p.answer : stripFuri(p.jp);
  const opts = shuffle([correct, ...p.traps.map(stripFuri)]);
  const polite = p.polite && p.polite !== p.jp ? `Bentuk sopan: 「${p.polite}」. ` : '';
  const reply = p.reply ? `Balasan: 「${p.reply}」. ` : '';
  return {
    question: p.speaker === 'shokucho' ? p.jp : p.situation,
    questionSub: p.speaker === 'shokucho' ? p.situation : null,
    options: opts.map((text) => ({ text })),
    correctIdx: opts.indexOf(correct),
    explanation: `「${p.jp}」= ${p.id_text}. ${polite}${reply}${p.note}`,
    phrase: p,
  };
}

export default function GenbaMode({ onSessionEnd }) {
  const [view, setView] = useState('panel');
  const [fn, setFn] = useState('all');
  const [limit, setLimit] = useState(null);
  return view === 'panel' ? (
    <PanelView
      fn={fn}
      setFn={setFn}
      limit={limit}
      setLimit={setLimit}
      onStart={() => setView('drill')}
    />
  ) : (
    <DrillView fn={fn} limit={limit} onBack={() => setView('panel')} onSessionEnd={onSessionEnd} />
  );
}

function PanelView({ fn, setFn, limit, setLimit, onStart }) {
  const { prefs } = useApp();
  const furiganaPolicy = prefs?.furiganaPolicy ?? 'always';
  const [expanded, setExpanded] = useState(null);
  const pool = byFn(fn);
  const count = limit ?? storedQuizCount(pool.length);

  return (
    <div className={S.page}>
      <div className={S.rowSpread}>
        <p className={S.pageSub}>
          {GENBA_PHRASES.length} kalimat yang benar-benar diucapkan di lokasi — bukan istilah
        </p>
        <button className={S.btnPrimary} onClick={onStart}>
          🗣️ Drill ({Math.min(count, pool.length)})
        </button>
      </div>

      <div className={G.chips}>
        {[{ key: 'all', emoji: '📚', id_label: 'Semua' }, ...GENBA_FUNCTIONS].map((f) => {
          const n = byFn(f.key).length;
          const active = fn === f.key;
          return (
            <button
              key={f.key}
              className={`${G.chip}${active ? ` ${G.chipActive}` : ''}`}
              aria-pressed={active}
              onClick={() => {
                setFn(f.key);
                setExpanded(null);
                setLimit(null);
              }}
            >
              {f.emoji} {f.id_label} {n}
            </button>
          );
        })}
      </div>

      <SessionLengthPicker total={pool.length} value={count} onChange={setLimit} />

      <div className={S.list}>
        {pool.map((p) => {
          const isOpen = expanded === p.id;
          const dir = DIRECTION[p.speaker];
          return (
            <div key={p.id}>
              <button
                className={`${G.rowBtn}${isOpen ? ` ${G.rowOpen}` : ''}`}
                onClick={() => setExpanded(isOpen ? null : p.id)}
                aria-expanded={isOpen}
              >
                <span className={G.rowMain}>
                  <span className={G.rowJp}>
                    <JpFront
                      jp={p.jp}
                      furiganaPolicy={furiganaPolicy}
                      maxSize={JP_LIST_MAX}
                      compact
                    />
                  </span>
                  <span className={G.rowId}>{p.id_text}</span>
                </span>
                <span className={G.rowDir}>{dir.badge}</span>
              </button>
              {isOpen && (
                <div className={G.panel}>
                  {p.polite && (
                    <p className={G.panelRow}>
                      <span className={G.panelLabel}>Bentuk sopan</span>
                      {renderJPWithRuby(p.polite, parseRubyFragments(p.polite))}
                    </p>
                  )}
                  <p className={G.panelRow}>
                    <span className={G.panelLabel}>Situasi</span>
                    {p.situation}
                  </p>
                  {p.answer && (
                    <p className={G.panelRow}>
                      <span className={G.panelLabel}>Yang kamu lakukan</span>
                      {p.answer}
                    </p>
                  )}
                  <p className={G.panelRow}>
                    <span className={G.panelLabel}>Balasan</span>
                    {renderJPWithRuby(p.reply, parseRubyFragments(p.reply))}
                  </p>
                  <div className={G.note}>
                    <DescBlock desc={p.note} />
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

function DrillView({ fn, limit, onBack, onSessionEnd }) {
  const { recordWrong } = useProgress();
  const questions = useMemo(() => {
    const pool = byFn(fn);
    return shuffle(pool)
      .slice(0, limit ?? pool.length)
      .map(buildQuestion);
  }, [fn, limit]);

  // QuizShell's signature is positional: (qIdx, pickedIdx, isCorrect).
  const handleAnswer = useCallback(
    (qIdx, _picked, isCorrect) => {
      if (isCorrect) return;
      const p = questions[qIdx]?.phrase;
      // These phrases are not cards, so a miss goes to progress.termWrong
      // through the bridge item 129 added, not into card-keyed storage.
      if (p) recordTermMistake(p.jp, recordWrong);
    },
    [questions, recordWrong]
  );

  // No onRetryWrong: the wrong answers here are phrases, and there is no card
  // deck to send them to. Passing a handler that could never assemble one is the
  // exact shape item 96 found in wayground and vocab.
  return (
    <QuizShell
      questions={questions}
      onExit={onBack}
      title="Bahasa Lapangan"
      accentColor={ACCENT}
      audioEnabled
      onAnswer={handleAnswer}
      onFinish={onSessionEnd}
      renderExtra={(q) => <div className={G.prompt}>{DIRECTION[q.phrase.speaker].prompt}</div>}
    />
  );
}
