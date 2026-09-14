// ─── SkenarioMode.jsx ─────────────────────────────────────────────────────────
// UI_UX_PLAN item 105. "A 朝礼 that runs as a sequence: the foreman states today's
// work, asks for a material, then asks for a report — with a question after each.
// Combines listening, vocabulary, workplace intent and reporting in one thread
// instead of four separate modes."
//
// ── WHY THIS IS NOT QuizShell ────────────────────────────────────────────────
// Every other drill in the app is a bag of independent questions, which is what
// QuizShell is: it shuffles, it counts, and each question stands alone. This one
// cannot use it, and the reason is the feature. A beat here depends on the beats
// before it — 「どっちですか」 is the right thing to say in scene 2 only because
// two beats earlier the foreman said 「青いやつ」 and there turned out to be two
// blue ones. Shuffling would destroy the thread; dropping the transcript would
// turn it into a memory test. So the transcript stays on screen and grows, and
// the questions are about intent and action rather than recall.
//
// That is also why there is no session-length picker: a scene is as long as it is.
//
// ── THE TRANSCRIPT IS VISIBLE ON PURPOSE ─────────────────────────────────────
// Hiding earlier beats would make this measure retention, which the SRS already
// does better. What it measures instead is whether you can follow a shift — and
// following one means having the earlier lines in front of you, the way you would
// have them in your head ten seconds after they were said.
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { shuffle } from '../utils/shuffle.js';
import { GENBA_SCENES } from '../data/genba-scenes.js';
import ProgressBar from '../components/ProgressBar.jsx';
import ResultScreen from '../components/ResultScreen.jsx';
import OptionButton from '../components/OptionButton.jsx';
import QuizAnnouncer from '../components/QuizAnnouncer.jsx';
import { JpFront, renderJPWithRuby, parseRubyFragments } from '../components/JpDisplay.jsx';
import { stripFuri } from '../utils/jp-helpers.js';
import { useApp } from '../contexts/AppContext.jsx';
import { useProgress } from '../contexts/ProgressContext.jsx';
import { recordTermMistake } from '../utils/mistake-bridge.js';
import { useSessionTimer } from '../hooks/useSessionTimer.js';
import { speakJP, canSpeak } from '../utils/speak.js';
import { useSpeakErrorHandler } from '../hooks/useSpeakErrorHandler.js';
import S from './modes.module.css';
import K from './SkenarioMode.module.css';

const ACCENT = '#14b8a6';

/** One beat becomes one question. Same rule as GenbaMode: `speaker` decides. */
export function buildBeat(beat) {
  const correct = beat.speaker === 'shokucho' ? beat.answer : stripFuri(beat.jp);
  const opts = shuffle([correct, ...beat.traps.map(stripFuri)]);
  return { beat, options: opts.map((text) => ({ text })), correctIdx: opts.indexOf(correct) };
}

export default function SkenarioMode({ onSessionEnd }) {
  const [sceneId, setSceneId] = useState(null);
  const scene = GENBA_SCENES.find((s) => s.id === sceneId) ?? null;
  return scene ? (
    <SceneView scene={scene} onBack={() => setSceneId(null)} onSessionEnd={onSessionEnd} />
  ) : (
    <PickerView onPick={setSceneId} />
  );
}

function PickerView({ onPick }) {
  const { prefs } = useApp();
  const furiganaPolicy = prefs?.furiganaPolicy ?? 'always';
  return (
    <div className={S.page}>
      <p className={S.pageSub}>
        {GENBA_SCENES.length} situasi nyata di lokasi. Satu percakapan dari awal sampai selesai —
        jawaban yang benar tergantung apa yang sudah diucapkan sebelumnya.
      </p>
      <div className={S.list}>
        {GENBA_SCENES.map((s) => (
          <button key={s.id} className={K.sceneBtn} onClick={() => onPick(s.id)}>
            <span className={K.sceneEmoji} aria-hidden="true">
              {s.emoji}
            </span>
            <span className={K.sceneBody}>
              <span className={K.sceneTitle}>
                <JpFront jp={s.title} furiganaPolicy={furiganaPolicy} compact />
              </span>
              <span className={K.sceneId}>{s.id_title}</span>
              <span className={K.sceneSetting}>{s.setting}</span>
            </span>
            <span className={K.sceneCount}>{s.beats.length} bagian</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function SceneView({ scene, onBack, onSessionEnd }) {
  const { prefs } = useApp();
  const { recordWrong } = useProgress();
  const furiganaPolicy = prefs?.furiganaPolicy ?? 'always';
  const handleSpeakError = useSpeakErrorHandler();
  const { getDurationMs } = useSessionTimer();
  const questions = useMemo(() => scene.beats.map(buildBeat), [scene]);

  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [results, setResults] = useState([]);
  const [phase, setPhase] = useState('playing');
  const sessionFired = useRef(false);
  const liveRef = useRef(null);

  const q = questions[idx];
  const isLast = idx === questions.length - 1;

  const handleSelect = useCallback(
    (pick) => {
      if (selected !== null) return;
      setSelected(pick);
      const isCorrect = pick === q.correctIdx;
      if (!isCorrect) recordTermMistake(stripFuri(q.beat.jp), recordWrong);
      setResults((r) => [...r, { isCorrect, pick, q }]);
    },
    [selected, q, recordWrong]
  );

  const advance = useCallback(() => {
    if (selected === null) return;
    if (isLast) setPhase('result');
    else {
      setIdx((i) => i + 1);
      setSelected(null);
    }
  }, [selected, isLast]);

  // Keyboard, matching the rest of the app: digits pick, Enter/Space advances.
  // Four options always, unlike JAC Official — see QuizShell's item 136 note for
  // why the hint text has to say what is actually true.
  useEffect(() => {
    const onKey = (e) => {
      if (phase !== 'playing') return;
      const n = Number(e.key);
      if (selected === null && n >= 1 && n <= q.options.length) handleSelect(n - 1);
      else if (selected !== null && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        advance();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, selected, q, handleSelect, advance]);

  // Moving the focus to the new beat is what makes this usable with a screen
  // reader: the transcript grows above the question, so without this the reading
  // position stays where the last answer was and the new line is never reached.
  useEffect(() => {
    if (selected === null) liveRef.current?.focus();
  }, [idx, selected]);

  useEffect(() => {
    if (phase !== 'result' || sessionFired.current) return;
    sessionFired.current = true;
    onSessionEnd?.({
      correct: results.filter((r) => r.isCorrect).length,
      total: results.length,
      durationMs: getDurationMs(),
    });
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  if (phase === 'result') {
    const correct = results.filter((r) => r.isCorrect).length;
    return (
      <ResultScreen
        correct={correct}
        total={results.length}
        maxStreak={0}
        review={results
          .filter((r) => !r.isCorrect)
          .map((r) => ({
            question: r.q.beat.speaker === 'shokucho' ? r.q.beat.jp : r.q.beat.ask,
            userAnswer: r.q.options[r.pick]?.text ?? '',
            correctAnswer: r.q.options[r.q.correctIdx]?.text ?? '',
            explanation: r.q.beat.note,
          }))}
        onRestart={() => {
          setIdx(0);
          setSelected(null);
          setResults([]);
          setPhase('playing');
          sessionFired.current = false;
        }}
        onExit={onBack}
      />
    );
  }

  const done = results.length;
  return (
    <div className={S.pageScroll}>
      <QuizAnnouncer
        isCorrect={selected !== null ? selected === q.correctIdx : null}
        correctText={q.options[q.correctIdx]?.text}
      />
      <div className={S.rowSpread}>
        <button className={S.btnBack} style={{ marginBottom: 0 }} onClick={onBack}>
          ← Skenario
        </button>
        <span className={K.sceneChip}>
          {scene.emoji} {scene.id_title}
        </span>
      </div>
      <ProgressBar current={done} total={questions.length} color={ACCENT} />
      <div className={S.counter}>
        {idx + 1} / {questions.length}
      </div>

      <p className={K.setting}>{scene.setting}</p>

      {/* Everything said so far. This is the mode. */}
      <ol className={K.thread} aria-label="Percakapan sejauh ini">
        {results.map((r, i) => {
          const b = r.q.beat;
          return (
            <li key={i} className={b.speaker === 'shokucho' ? K.fromThem : K.fromYou}>
              <span className={K.who}>{b.speaker === 'shokucho' ? 'Mandor' : 'Kamu'}</span>
              <span className={K.bubbleJp}>{renderJPWithRuby(b.jp, parseRubyFragments(b.jp))}</span>
              <span className={K.bubbleId}>{b.id_text}</span>
            </li>
          );
        })}
      </ol>

      <div className={K.current} ref={liveRef} tabIndex={-1}>
        {q.beat.speaker === 'shokucho' ? (
          <>
            <div className={K.who}>Mandor</div>
            <div className={K.currentJp}>
              <JpFront jp={q.beat.jp} furiganaPolicy={furiganaPolicy} />
            </div>
            {canSpeak() && (
              <button
                className={K.audio}
                onClick={() => speakJP(stripFuri(q.beat.jp), { onError: handleSpeakError })}
                aria-label="Putar audio"
              >
                🔊 Dengar
              </button>
            )}
          </>
        ) : null}
        <p className={K.ask}>{q.beat.ask}</p>
      </div>

      <div className={S.list}>
        {q.options.map((o, i) => (
          <OptionButton
            key={i}
            idx={i}
            text={o.text}
            selected={selected}
            isCorrect={i === q.correctIdx}
            onSelect={handleSelect}
          />
        ))}
      </div>

      {selected !== null && (
        <>
          <div className={K.note}>
            {/* The phrase in full, with its readings, the moment an answer lands —
                the options had to be stripped (OptionButton prints, QuizAnnouncer
                speaks), so this is where the reading is actually taught. */}
            <div className={K.noteJp}>
              {renderJPWithRuby(q.beat.jp, parseRubyFragments(q.beat.jp))}
              <span className={K.noteId}> — {q.beat.id_text}</span>
            </div>
            <p className={K.noteBody}>{q.beat.note}</p>
          </div>
          <button className={S.btnPrimary} onClick={advance}>
            {isLast ? 'Selesai →' : 'Lanjut →'}
          </button>
        </>
      )}
    </div>
  );
}
