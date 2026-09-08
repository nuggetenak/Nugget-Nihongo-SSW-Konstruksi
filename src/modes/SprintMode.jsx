// ─── SprintMode.jsx ─────────────────────────────────────────────────────────
// Personal best tracking via prefs.sprintBests (per duration).
// onSessionEnd prop fires when sprint ends → ModeRouter records session + mission.
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T } from '../styles/theme.js';
import { shuffle } from '../utils/shuffle.js';
import { JpFront } from '../components/JpDisplay.jsx';
import { get as storageGet, set as storageSet } from '../storage/engine.js';
import { makeWrongEntry } from '../utils/wrong-tracker.js';
import CategoryPicker, { countByCategory } from '../components/CategoryPicker.jsx';
import { CATEGORIES } from '../data/categories.js';
import { useScopedDeck } from './FlashcardMode/use-scoped-deck.js';
import { useSessionTimer } from '../hooks/useSessionTimer.js';
import ProgressBar from '../components/ProgressBar.jsx';
import S from './modes.module.css';

const DURATIONS = [
  { key: '30', label: '30 detik', value: 30 },
  { key: '60', label: '60 detik', value: 60 },
  { key: '120', label: '2 menit', value: 120 },
];

function getDurationBests(key) {
  return storageGet('prefs')?.sprintBests?.[key] ?? { score: 0, timeline: [] };
}
function saveDurationBests(key, score, timeline) {
  storageSet('prefs', (p) => ({
    ...p,
    sprintBests: {
      ...(p.sprintBests ?? {}),
      [key]: { score: Math.max(p.sprintBests?.[key]?.score ?? 0, score), timeline },
    },
  }));
}

export default function SprintMode({
  cards,
  onExit,
  onSessionEnd,
  onRetryWrong,
  filterIds = null,
}) {
  const [phase, setPhase] = useState('ready');
  const [order, setOrder] = useState([]);
  const [idx, setIdx] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  // Item 79: Sprint already wrote every "Tidak Tahu" into progress.quizWrong
  // keyed by real card id — it was the one mode in the item's list where the
  // ids are exact rather than inferred — and then offered no way back to them.
  // Kept for this run only; the persistent tally is the wrong-tracker's job.
  const [wrongIds, setWrongIds] = useState([]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [showAnswer, setShowAnswer] = useState(false);
  const [newBest, setNewBest] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState('60');
  const [selectedCat, setSelectedCat] = useState('all');
  const sessionEndFired = useRef(false);
  const { getDurationMs } = useSessionTimer();
  // Ghost timeline scoped by selectedDuration key.
  const [ghostTimeline, setGhostTimeline] = useState(() => getDurationBests('60').timeline);
  const currentTimeline = useRef([]);
  const [ghostScore, setGhostScore] = useState(0);
  const [personalBest, setPersonalBest] = useState(() => getDurationBests('60').score);

  // Available categories from the cards prop.
  // Scope to filterIds if launched from SumberMode.
  // Item 119/F1. This was `filterIds ? cards.filter(...) : cards` -- the exact
  // line that put FlashcardMode in an unbounded render loop earlier today, still
  // live here and reached from Sumber's "⚡ Sprint" button, the app's only call
  // site that hands this mode a `filterIds`. `.filter()` allocates every render,
  // `filteredCards` below memoises on it, and the effect under that calls
  // `setOrder(shuffle(filteredCards))` -- so the loop started at mount, before
  // the learner pressed anything, and the setup screen's own buttons stopped
  // responding. Found by two independent audits of the untested modes.
  const baseCards = useScopedDeck(cards, filterIds);
  // Item 77: the `all` row moved into CategoryPicker, which owns it for all
  // three callers rather than each of them re-inventing it.
  const availableCats = useMemo(() => {
    const catKeys = new Set(baseCards.map((c) => c.category));
    return CATEGORIES.filter(
      (c) => c.key !== 'all' && c.key !== 'bintang' && catKeys.has(c.key)
    ).map((c) => ({ key: c.key, label: c.label, emoji: c.emoji }));
  }, [baseCards]);

  const filteredCards = useMemo(() => {
    if (selectedCat === 'all') return baseCards;
    return baseCards.filter((c) => c.category === selectedCat);
  }, [baseCards, selectedCat]);

  useEffect(() => {
    setOrder(shuffle(filteredCards));
  }, [filteredCards]);

  const fireSessionEnd = useCallback(
    (c, w) => {
      if (sessionEndFired.current) return;
      sessionEndFired.current = true;
      onSessionEnd?.({ correct: c, total: c + w, durationMs: getDurationMs() });
      const key = selectedDuration;
      const prev = getDurationBests(key).score;
      const finalTimeline = [
        ...currentTimeline.current,
        { t: DURATIONS.find((d) => d.key === selectedDuration)?.value ?? 60, score: c },
      ];
      if (c > prev) {
        saveDurationBests(key, c, finalTimeline);
        setPersonalBest(c);
        setNewBest(true);
      }
    },
    [onSessionEnd, selectedDuration, getDurationMs]
  );

  // The clock, and nothing else. It used to share an effect with the ghost
  // sampling and the end condition, whose dependency array therefore carried
  // `correct`, `wrong` and `fireSessionEnd` -- so every tap tore down the
  // pending one-second timeout and started a fresh one, discarding whatever
  // fraction of that second had elapsed (item 119/F3). Answering faster than
  // once a second, which is the pace this mode exists to train, meant the timer
  // never reached zero: the sprint ran forever, the only way out was the header
  // arrow, and the inflated score was written to prefs.sprintBests as a personal
  // best that can never be beaten honestly. `fireSessionEnd` alone re-ran it on
  // *every* render, because useSessionTimer hands back fresh function identities.
  //
  // An interval keyed on `phase` cannot be restarted by scoring.
  useEffect(() => {
    if (phase !== 'playing') return;
    const id = setInterval(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [phase]);

  // Score is read through refs here so that adding it to the deps -- which is
  // what broke the clock -- is not required to end the run with the right total.
  const scoreRef = useRef({ correct: 0, wrong: 0 });
  useEffect(() => {
    scoreRef.current = { correct, wrong };
  }, [correct, wrong]);

  useEffect(() => {
    if (phase !== 'playing') return;
    if (timeLeft <= 0) {
      setPhase('done');
      fireSessionEnd(scoreRef.current.correct, scoreRef.current.wrong);
      return;
    }
    // Record ghost timeline point every 5 seconds.
    const duration = DURATIONS.find((d) => d.key === selectedDuration)?.value ?? 60;
    const elapsed = duration - timeLeft;
    if (elapsed > 0 && elapsed % 5 === 0) {
      currentTimeline.current = [
        ...currentTimeline.current,
        { t: elapsed, score: scoreRef.current.correct },
      ];
    }
    if (ghostTimeline.length > 0) {
      const bestPoint = ghostTimeline.filter((p) => p.t <= elapsed).pop();
      if (bestPoint) setGhostScore(bestPoint.score);
    }
    // Score reaches this through scoreRef on purpose, and `fireSessionEnd` is
    // left out for the same reason: useSessionTimer hands back a fresh identity
    // every render, so declaring it here would restore exactly the every-render
    // re-run that broke the clock. It is guarded by its own sessionEndFired ref,
    // so a stale identity cannot double-fire the session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, phase, selectedDuration, ghostTimeline]);

  const card = order[idx];
  // Deliberately no QuizAnnouncer here (item 45) -- Tahu/Tidak Tahu is
  // self-assessment, not a graded answer checked against a selection. The
  // user's own tap already is the outcome; there's nothing to announce back.
  const next = () => {
    setShowAnswer(false);
    setIdx((i) => (i + 1) % order.length);
  };
  const handleKnow = () => {
    setCorrect((c) => c + 1);
    next();
  };
  const handleDontKnow = () => {
    setWrong((w) => w + 1);
    // Record wrong answer to quiz wrong-tracker.
    const cardId = order[idx]?.id;
    if (cardId) {
      setWrongIds((ids) => (ids.includes(cardId) ? ids : [...ids, cardId]));
      storageSet('progress', (p) => {
        const qw = { ...(p?.quizWrong ?? {}) };
        qw[cardId] = makeWrongEntry(qw[cardId]);
        return { ...p, quizWrong: qw };
      });
    }
    setShowAnswer(true);
    setTimeout(next, 1200);
  };
  const duration = DURATIONS.find((d) => d.key === selectedDuration)?.value ?? 60;
  const startSprint = () => {
    setPhase('playing');
    setIdx(0);
    setCorrect(0);
    setWrong(0);
    setWrongIds([]);
    setTimeLeft(duration);
    setNewBest(false);
    setGhostScore(0);
    sessionEndFired.current = false;
    currentTimeline.current = [];
    setOrder(shuffle(filteredCards));
  };

  if (phase === 'ready') {
    const pb = personalBest;
    return (
      <div className={`${S.page} ${S.setupPage}`}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-20)' }}>
          <div style={{ fontSize: '3rem', marginBottom: 'var(--space-8)' }}>⚡</div>
          <p className={S.pageSub}>Jawab sebanyak-banyaknya dalam waktu yang dipilih!</p>
          {pb > 0 && (
            <div
              style={{
                fontSize: 'var(--fs-caption)',
                color: T.gold,
                fontWeight: 700,
                marginBottom: 'var(--space-8)',
              }}
            >
              🏆 Rekor: {pb} benar
            </div>
          )}
        </div>

        {/* Duration picker */}
        <div className={S.sectionLabel}>Durasi</div>
        <div className={S.row} style={{ gap: 'var(--space-8)', marginBottom: 'var(--space-16)' }}>
          {DURATIONS.map((d) => (
            <button
              key={d.key}
              onClick={() => {
                setSelectedDuration(d.key);
                const bests = getDurationBests(d.key);
                setPersonalBest(bests.score);
                setGhostTimeline(bests.timeline);
              }}
              style={{
                flex: 1,
                padding: 'var(--space-10) var(--space-6)',
                fontFamily: 'inherit',
                fontSize: 'var(--fs-caption)',
                fontWeight: 700,
                borderRadius: T.r.md,
                cursor: 'pointer',
                border: `1px solid ${selectedDuration === d.key ? T.amber : T.border}`,
                background: selectedDuration === d.key ? 'rgba(245,158,11,0.12)' : T.surface,
                color: selectedDuration === d.key ? T.amber : T.text,
              }}
            >
              {d.label}
            </button>
          ))}
        </div>

        {/* Item 77: was the second of three hand-rolled copies. */}
        <CategoryPicker
          cats={availableCats}
          value={selectedCat}
          onChange={setSelectedCat}
          variant="rows"
          label="Kategori"
          counts={countByCategory(baseCards)}
          countSuffix="kartu"
          allOption={{ label: 'Semua Kategori', emoji: '📚' }}
          maxHeight={200}
        />

        <div className={S.setupCta}>
          <button
            className={S.btnPrimary}
            style={{ width: '100%', padding: 'var(--space-14)', fontSize: 'var(--fs-subtitle)' }}
            onClick={startSprint}
          >
            Mulai ⚡
          </button>
        </div>
      </div>
    );
  }

  // Item 46: deliberately not using ResultScreen here either. Sprint is a
  // speed drill with ghost-race/best-time framing (newBest, timeline replay),
  // not a graded quiz -- there's no "wrong answer to review," since
  // Tahu/Tidak Tahu is self-assessment (see item 45's QuizAnnouncer exclusion
  // for the same underlying reasoning). Plan's own note: "legitimately
  // different" alongside SimulasiMode.
  if (phase === 'done') {
    const total = correct + wrong;
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
    return (
      <div className={S.page} style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: 'var(--space-12)' }}>⚡</div>
        {newBest && (
          <div
            style={{
              fontSize: 'var(--fs-body)',
              color: T.gold,
              fontWeight: 800,
              marginBottom: 'var(--space-8)',
            }}
          >
            🏆 Rekor baru!
          </div>
        )}
        <div
          style={{
            fontSize: '2.25rem',
            fontWeight: 800,
            color: T.gold,
            marginBottom: 'var(--space-2)',
          }}
        >
          {correct}
        </div>
        <div
          style={{
            fontSize: 'var(--fs-caption)',
            color: T.textMuted,
            marginBottom: 'var(--space-4)',
          }}
        >
          benar dari {total} kartu · {pct}%
        </div>
        {!newBest && personalBest > 0 && (
          <div
            style={{
              fontSize: 'var(--fs-small)',
              color: T.textDim,
              marginBottom: 'var(--space-16)',
            }}
          >
            🏆 Rekor: {personalBest}
          </div>
        )}
        {newBest && (
          <div
            style={{
              fontSize: 'var(--fs-small)',
              color: T.textDim,
              marginBottom: 'var(--space-16)',
            }}
          >
            Rekor sebelumnya terlampaui!
          </div>
        )}
        <div className={S.row} style={{ gap: 'var(--space-8)', flexWrap: 'wrap' }}>
          <button
            className={S.btnPrimary}
            style={{ fontSize: 'var(--fs-body)', padding: 'var(--space-12)' }}
            onClick={startSprint}
          >
            🔄 Ulang
          </button>
          {/* Item 79. Not on ResultScreen — item 46 kept Sprint off that screen
              on purpose — but the bridge itself is the same one every other
              scored mode has, and the ids behind it are exact. */}
          {onRetryWrong && wrongIds.length > 0 && (
            <button
              className={S.btnSecondary}
              style={{ padding: 'var(--space-12)', borderRadius: T.r.md }}
              onClick={() => onRetryWrong(wrongIds)}
            >
              ❌ Latih {wrongIds.length} salah
            </button>
          )}
          <button
            className={S.btnSecondary}
            style={{ flex: 1, padding: 'var(--space-12)', borderRadius: T.r.md }}
            onClick={onExit}
          >
            ← Kembali
          </button>
        </div>
      </div>
    );
  }

  if (!card) return null;

  const furiganaPolicy = storageGet('prefs')?.furiganaPolicy ?? 'always';

  // Escalating visual urgency as time runs out.
  const isWarning = timeLeft <= 30 && timeLeft > 10;
  const isUrgent = timeLeft <= 10;
  const timerColor = isUrgent ? T.wrong : isWarning ? T.amber : T.gold;
  const barColor = isUrgent ? T.wrong : isWarning ? T.amber : T.amber;

  return (
    <div className={`${S.page} ${S.pageTight}`}>
      <div className={S.row} style={{ marginBottom: 'var(--space-10)' }}>
        <span
          style={{
            fontSize: 'var(--fs-jp-back)',
            fontWeight: 800,
            color: timerColor,
            animation: isUrgent ? 'pulse 0.8s ease infinite' : 'none',
            marginLeft: 'var(--space-16)',
          }}
        >
          ⏱ {timeLeft}s
        </span>
        <div style={{ textAlign: 'right', marginLeft: 'auto' }}>
          <span style={{ fontSize: 'var(--fs-body)', color: T.textMuted }}>
            ✅ {correct} · ❌ {wrong}
          </span>
          {ghostTimeline.length > 0 && (
            <div
              style={{
                fontSize: 'var(--fs-small)',
                color: correct > ghostScore ? T.correct : T.textDim,
                marginTop: 'var(--space-2)',
              }}
            >
              👻 {ghostScore}{' '}
              {correct > ghostScore
                ? '↑ unggul!'
                : correct === ghostScore
                  ? '= sejajar'
                  : `↓ -${ghostScore - correct}`}
            </div>
          )}
        </div>
      </div>
      <ProgressBar current={duration - timeLeft} total={duration} color={barColor} />
      <div
        className={S.cardLg}
        style={{
          marginTop: 'var(--space-20)',
          minHeight: 180,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <JpFront jp={card.jp} furiganaPolicy={furiganaPolicy} />
        {showAnswer && (
          <div
            style={{
              textAlign: 'center',
              marginTop: 'var(--space-12)',
              fontSize: 'var(--fs-caption)',
              color: T.gold,
              fontWeight: 600,
            }}
          >
            {card.id_text}
          </div>
        )}
      </div>
      {!showAnswer && (
        <div className={S.row} style={{ marginTop: 'var(--space-16)' }}>
          <button
            style={{
              flex: 1,
              padding: 'var(--space-14)',
              fontSize: 'var(--fs-caption)',
              fontWeight: 600,
              fontFamily: 'inherit',
              borderRadius: T.r.md,
              cursor: 'pointer',
              background: T.wrongBg,
              border: `1px solid ${T.wrongBorder}`,
              color: T.wrong,
            }}
            onClick={handleDontKnow}
          >
            Tidak tahu
          </button>
          <button
            style={{
              flex: 1,
              padding: 'var(--space-14)',
              fontSize: 'var(--fs-caption)',
              fontWeight: 600,
              fontFamily: 'inherit',
              borderRadius: T.r.md,
              cursor: 'pointer',
              background: T.correctBg,
              border: `1px solid ${T.correctBorder}`,
              color: T.correct,
            }}
            onClick={handleKnow}
          >
            Tahu! ✓
          </button>
        </div>
      )}
    </div>
  );
}
