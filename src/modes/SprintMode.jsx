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
import { CATEGORIES } from '../data/categories.js';
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

export default function SprintMode({ cards, onExit, onSessionEnd, filterIds = null }) {
  const [phase, setPhase] = useState('ready');
  const [order, setOrder] = useState([]);
  const [idx, setIdx] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
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
  const baseCards = filterIds ? cards.filter((c) => filterIds.includes(c.id)) : cards;
  const availableCats = useMemo(() => {
    const catKeys = new Set(baseCards.map((c) => c.category));
    return [
      { key: 'all', label: 'Semua Kategori', emoji: '📚' },
      ...CATEGORIES.filter((c) => c.key !== 'all' && c.key !== 'bintang' && catKeys.has(c.key)).map(
        (c) => ({ key: c.key, label: c.label, emoji: c.emoji })
      ),
    ];
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

  useEffect(() => {
    if (phase !== 'playing') return;
    if (timeLeft <= 0) {
      setPhase('done');
      fireSessionEnd(correct, wrong);
      return;
    }

    // Record ghost timeline point every 5 seconds.
    const duration = DURATIONS.find((d) => d.key === selectedDuration)?.value ?? 60;
    const elapsed = duration - timeLeft;
    if (elapsed > 0 && elapsed % 5 === 0) {
      currentTimeline.current = [...currentTimeline.current, { t: elapsed, score: correct }];
    }
    // Update ghost score from saved best timeline.
    if (ghostTimeline.length > 0) {
      const bestPoint = ghostTimeline.filter((p) => p.t <= elapsed).pop();
      if (bestPoint) setGhostScore(bestPoint.score);
    }

    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, phase, correct, wrong, fireSessionEnd, ghostTimeline, selectedDuration]);

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
      <div className={S.page}>
        <button className={S.btnBack} onClick={onExit}>
          ← Kembali
        </button>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>⚡</div>
          <h2 className={S.pageTitle}>Sprint Mode</h2>
          <p className={S.pageSub}>Jawab sebanyak-banyaknya dalam waktu yang dipilih!</p>
          {pb > 0 && (
            <div
              style={{
                fontSize: 'var(--fs-caption)',
                color: T.gold,
                fontWeight: 700,
                marginBottom: 8,
              }}
            >
              🏆 Rekor: {pb} benar
            </div>
          )}
        </div>

        {/* Duration picker */}
        <div className={S.sectionLabel}>Durasi</div>
        <div className={S.row} style={{ gap: 8, marginBottom: 16 }}>
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
                padding: '10px 6px',
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

        {/* Category picker */}
        {availableCats.length > 1 && (
          <>
            <div className={S.sectionLabel}>Kategori</div>
            <div className={S.list} style={{ maxHeight: 200, overflowY: 'auto', marginBottom: 16 }}>
              {availableCats.map((c) => (
                <button
                  key={c.key}
                  onClick={() => setSelectedCat(c.key)}
                  className={S.btnItem}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    background: selectedCat === c.key ? 'rgba(245,158,11,0.10)' : T.surface,
                    border: `1px solid ${selectedCat === c.key ? `${T.amber}66` : T.border}`,
                    color: selectedCat === c.key ? T.amber : T.text,
                  }}
                >
                  <span>{c.emoji}</span>
                  <span style={{ fontSize: 'var(--fs-body)' }}>{c.label}</span>
                  <span
                    style={{ marginLeft: 'auto', fontSize: 'var(--fs-small)', color: T.textDim }}
                  >
                    {c.key === 'all'
                      ? `${baseCards.length} kartu`
                      : `${baseCards.filter((cd) => cd.category === c.key).length} kartu`}
                  </span>
                </button>
              ))}
            </div>
          </>
        )}

        <button
          className={S.btnPrimary}
          style={{ width: '100%', padding: '14px', fontSize: 'var(--fs-subtitle)' }}
          onClick={startSprint}
        >
          Mulai ⚡
        </button>
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
        <div style={{ fontSize: 48, marginBottom: 12 }}>⚡</div>
        {newBest && (
          <div
            style={{ fontSize: 'var(--fs-body)', color: T.gold, fontWeight: 800, marginBottom: 8 }}
          >
            🏆 Rekor baru!
          </div>
        )}
        <div style={{ fontSize: 36, fontWeight: 800, color: T.gold, marginBottom: 2 }}>
          {correct}
        </div>
        <div style={{ fontSize: 'var(--fs-caption)', color: T.textMuted, marginBottom: 4 }}>
          benar dari {total} kartu · {pct}%
        </div>
        {!newBest && personalBest > 0 && (
          <div style={{ fontSize: 'var(--fs-small)', color: T.textDim, marginBottom: 16 }}>
            🏆 Rekor: {personalBest}
          </div>
        )}
        {newBest && (
          <div style={{ fontSize: 'var(--fs-small)', color: T.textDim, marginBottom: 16 }}>
            Rekor sebelumnya terlampaui!
          </div>
        )}
        <div className={S.row} style={{ gap: 8 }}>
          <button
            className={S.btnPrimary}
            style={{ fontSize: 'var(--fs-body)', padding: '12px' }}
            onClick={startSprint}
          >
            🔄 Ulang
          </button>
          <button
            className={S.btnSecondary}
            style={{ flex: 1, padding: '12px', borderRadius: T.r.md }}
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
    <div className={S.page} style={{ padding: '16px 16px 24px' }}>
      <div className={S.row} style={{ marginBottom: 10 }}>
        <button className={S.btnBack} onClick={onExit} style={{ padding: 0 }}>
          ← Kembali
        </button>
        <span
          style={{
            fontSize: 'var(--fs-jp-back)',
            fontWeight: 800,
            color: timerColor,
            animation: isUrgent ? 'pulse 0.8s ease infinite' : 'none',
            marginLeft: 16,
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
                marginTop: 2,
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
          marginTop: 20,
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
              marginTop: 12,
              fontSize: 14,
              color: T.gold,
              fontWeight: 600,
            }}
          >
            {card.id_text}
          </div>
        )}
      </div>
      {!showAnswer && (
        <div className={S.row} style={{ marginTop: 16 }}>
          <button
            style={{
              flex: 1,
              padding: '14px',
              fontSize: 14,
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
              padding: '14px',
              fontSize: 14,
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
