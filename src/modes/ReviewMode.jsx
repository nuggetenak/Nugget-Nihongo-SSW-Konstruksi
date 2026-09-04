// ─── ReviewMode.jsx ───────────────────────────────────────────────────────────
// Note: card border-color on flip is conditional (T.borderActive vs T.border) — justified inline.
// Note: card padding on flip is conditional — justified inline.
// Note: rating button bg/border/color is per-rating grade from RATING_META — justified inline.
// Note: strength pill bg/color use info.strength.color — justified inline.
// Note: cat pill bg/color use cat.color — justified inline.
import { useState, useEffect, useCallback } from 'react';
import { T } from '../styles/theme.js';
import { CARDS } from '../data/cards.js';
import { getCatInfo } from '../data/categories.js';
import { stripFuri } from '../utils/jp-helpers.js';
import { fmtInterval } from '../srs/fsrs-scheduler.js';
import { RATING_META } from '../srs/fsrs-core.js';
import { get as storageGet } from '../storage/engine.js';
import { useApp } from '../contexts/AppContext.jsx';
import { useSpeakErrorHandler } from '../hooks/useSpeakErrorHandler.js';
import { JpFront, DescBlock } from '../components/JpDisplay.jsx';
import { speakJP, canSpeak } from '../utils/speak.js';
import { useSessionTimer } from '../hooks/useSessionTimer.js';
import ProgressBar from '../components/ProgressBar.jsx';
import Skeleton from '../components/Skeleton.jsx';
import EmptyState from '../components/EmptyState.jsx';
import S from './modes.module.css';
import R from './ReviewMode.module.css';

const CARD_MAP = Object.fromEntries(CARDS.map((c) => [c.id, c]));

export default function ReviewMode({ srs, onExit, onSessionEnd, onGoKartu }) {
  const { prefs } = useApp();
  const handleSpeakError = useSpeakErrorHandler();
  const furiganaPolicy = prefs?.furiganaPolicy ?? 'always';
  const [queue, setQueue] = useState(null);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [swipeDelta, setSwipeDelta] = useState(0);
  const [done, setDone] = useState(false);
  const [intervals, setIntervals] = useState({});
  const [sessionCorrect, setSessionCorrect] = useState(0);
  // Rating distribution tracking.
  const [ratingDist, setRatingDist] = useState({ 1: 0, 2: 0, 3: 0, 4: 0 });
  const { getDurationMs } = useSessionTimer();

  useEffect(() => {
    if (!srs.ready) return;
    const ids = srs.getDue();
    setQueue(ids);
    setIdx(0);
    setDone(ids.length === 0);
  }, [srs.ready]); // eslint-disable-line react-hooks/exhaustive-deps

  const currentId = queue?.[idx];
  const currentCard = currentId != null ? CARD_MAP[currentId] : null;

  useEffect(() => {
    if (currentId == null) return;
    setIntervals(srs.previewFor(currentId));
    setFlipped(false);
  }, [currentId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!done || !queue) return;
    // Nothing was actually reviewed -- the queue was empty before the user
    // did anything, not emptied by finishing it. The render path below
    // already treats this differently (EmptyState.NoReviews, not the
    // "session complete" screen); recording a session here would silently
    // disagree with that, logging a 0/0 session just from opening the tab
    // with nothing due -- a very common state, not an edge case.
    if (queue.length === 0) return;
    onSessionEnd?.({ correct: sessionCorrect, total: queue.length, durationMs: getDurationMs() });
  }, [done]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-speak on card advance — HVPT: passive exposure more effective than manual tap.
  // If speakOnFlip is true, speak on flip instead of advance.
  useEffect(() => {
    const prefs = storageGet('prefs') ?? {};
    const audioEnabled = prefs.audioEnabled !== false;
    const speakOnFlip = prefs.speakOnFlip === true;
    if (!audioEnabled || !currentCard || !canSpeak() || speakOnFlip) return;
    const t = setTimeout(
      () =>
        speakJP(stripFuri(currentCard.jp), {
          onError: () => handleSpeakError({ automatic: true }),
        }),
      300
    );
    return () => clearTimeout(t);
  }, [currentId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Speak on flip.
  useEffect(() => {
    const prefs = storageGet('prefs') ?? {};
    const audioEnabled = prefs.audioEnabled !== false;
    const speakOnFlip = prefs.speakOnFlip === true;
    if (!audioEnabled || !flipped || !currentCard || !canSpeak() || !speakOnFlip) return;
    speakJP(stripFuri(currentCard.jp), { onError: () => handleSpeakError({ automatic: true }) });
  }, [flipped]); // eslint-disable-line react-hooks/exhaustive-deps

  // Skip card without rating — advance to next without SRS review.
  const handleSkip = useCallback(() => {
    if (!queue) return;
    const nextIdx = idx + 1;
    if (nextIdx >= queue.length) setDone(true);
    else {
      setIdx(nextIdx);
      setFlipped(false);
    }
  }, [idx, queue]);

  const handleRate = useCallback(
    (rating) => {
      if (!flipped || currentId == null) return;
      const result = srs.review(currentId, rating);
      setRatingDist((d) => ({ ...d, [rating]: d[rating] + 1 }));
      if (result.isKnown) setSessionCorrect((n) => n + 1);
      setTimeout(() => {
        const nextIdx = idx + 1;
        if (nextIdx >= queue.length) setDone(true);
        else setIdx(nextIdx);
      }, 600);
    },
    [flipped, currentId, idx, queue, srs]
  );

  useEffect(() => {
    const h = (e) => {
      if (!flipped) {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          setFlipped(true);
        }
        return;
      }
      if (e.key === '1') handleRate(1);
      if (e.key === '2') handleRate(2);
      if (e.key === '3') handleRate(3);
      if (e.key === '4') handleRate(4);
      if (e.key === 's' || e.key === 'S') handleSkip();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [flipped, handleRate, handleSkip]);

  // ─── LOADING ───────────────────────────────────────────────────────────────
  if (queue === null) {
    return (
      <div className={R.skeleton} role="status" aria-label="Memuat kartu..." aria-live="polite">
        <Skeleton width="60px" height={14} style={{ marginBottom: 'var(--space-16)' }} />
        <Skeleton width="100%" height={4} radius={99} style={{ marginBottom: 'var(--space-24)' }} />
        <Skeleton.Card />
      </div>
    );
  }

  // ─── DONE ──────────────────────────────────────────────────────────────────
  if (done) {
    const total = queue.length;
    const pct = total > 0 ? Math.round((sessionCorrect / total) * 100) : 100;

    if (total === 0) {
      return (
        <div className={S.page} style={{ paddingTop: 0 }}>
          <EmptyState.NoReviews onCta={onGoKartu} />
        </div>
      );
    }

    return (
      <div className={R.doneScreen}>
        {/* Hero card */}
        <div className={R.doneHero}>
          <div className={R.doneEmoji}>{pct >= 70 ? '🏆' : '📚'}</div>
          <h2 className={`${S.pageTitle} ${R.doneTitle}`}>Sesi selesai!</h2>
          <div className={R.doneSub}>
            {sessionCorrect} dari {total} kartu dijawab dengan benar ({pct}%)
          </div>
        </div>

        {/* SRS stats grid */}
        {srs.stats && (
          <div className={R.doneMiniGrid}>
            {[
              { n: srs.stats.mature, label: 'Matang', icon: '🌟', color: T.correct },
              { n: srs.stats.young, label: 'Berkemb.', icon: '📗', color: T.gold },
              { n: srs.stats.learning, label: 'Belajar', icon: '📘', color: '#60a5fa' },
            ].map((stat, i) => (
              <div key={i} className={R.doneMiniCard}>
                <div className={R.doneMiniIcon}>{stat.icon}</div>
                <div className={R.doneMiniValue} style={{ color: stat.color }}>
                  {stat.n}
                </div>
                <div className={R.doneMiniLabel}>{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Rating distribution */}
        {total > 0 && (
          <div className={R.doneRatingSection}>
            <div className={R.doneRatingLabel}>Distribusi Rating</div>
            <div className={R.doneRatingGrid}>
              {[
                { r: 1, label: 'Lagi', emoji: '🔴', color: '#f87171' },
                { r: 2, label: 'Susah', emoji: '🟠', color: '#fb923c' },
                { r: 3, label: 'Oke', emoji: '🟢', color: T.correct },
                { r: 4, label: 'Mudah', emoji: '💎', color: '#60a5fa' },
              ].map(({ r, label, emoji, color }) => (
                <div
                  key={r}
                  className={R.doneRatingCell}
                  style={{ background: `${color}12`, border: `1px solid ${color}30` }}
                >
                  <div className={R.doneRatingEmoji}>{emoji}</div>
                  <div className={R.doneRatingCount} style={{ color }}>
                    {ratingDist[r]}
                  </div>
                  <div className={R.doneRatingName}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button className={S.btnPrimary} onClick={onExit}>
          ← Kembali
        </button>
      </div>
    );
  }

  // ─── PLAYING ───────────────────────────────────────────────────────────────
  if (!currentCard) return null;
  const cat = getCatInfo(currentCard.category);
  const clean = stripFuri(currentCard.jp);
  const info = srs.getInfo(currentId);
  const audioEnabled = storageGet('prefs')?.audioEnabled !== false && canSpeak();
  const remaining = queue.length - idx - 1;

  return (
    <div className={`${S.pageScroll} ${R.quizPage}`}>
      <div className={`${S.rowSpread} ${R.quizHeader}`}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
          {audioEnabled && (
            <button
              onClick={() => speakJP(clean, { onError: handleSpeakError })}
              aria-label="Putar audio"
              className={R.audioBtn}
            >
              🔊
            </button>
          )}
          {/* Skip without rating */}
          <button
            onClick={handleSkip}
            aria-label="Lewati kartu ini (S)"
            title="Lewati (S)"
            style={{
              fontSize: 'var(--fs-small)',
              color: T.textDim,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 'var(--space-4) var(--space-6)',
            }}
          >
            Lewati
          </button>
          {/* Remaining count */}
          <div className={R.cardIdxLabel}>
            {idx + 1} / {queue.length}
            {remaining > 0 ? ` · ${remaining} lagi` : ''}
          </div>
        </div>
      </div>
      <ProgressBar current={idx} total={queue.length} color={T.amber} />

      <div className={R.strengthPill}>
        <span
          className={S.pill}
          style={{
            fontSize: 'var(--fs-micro)',
            background: `${info.strength.color}15`,
            color: info.strength.color,
            border: `1px solid ${info.strength.color}30`,
          }}
        >
          {info.strength.label} · {Math.round(info.R * 100)}% ingat
        </span>
        {/* Due reason — interval + reps */}
        {info.seen && (
          <span
            className={S.pill}
            style={{
              fontSize: 'var(--fs-micro)',
              background: T.surface,
              color: T.textMuted,
              border: `1px solid ${T.border}`,
            }}
          >
            {info.reps > 0 ? `${info.reps}× ulasan` : 'Baru'}
            {info.reps > 0 ? ` · interval ${fmtInterval(intervals[3])}` : ''}
          </span>
        )}
      </div>

      {/* Card — border/padding conditional on flip state, justified inline */}
      <div
        onClick={() => !flipped && setFlipped(true)}
        role="button"
        tabIndex={flipped ? -1 : 0}
        onKeyDown={(e) => {
          if (!flipped && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            setFlipped(true);
          }
        }}
        onTouchStart={(e) => {
          setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
        }}
        onTouchMove={(e) => {
          if (touchStart === null) return;
          const dx = (e.touches[0].clientX - touchStart.x) / 120;
          setSwipeDelta(Math.max(-1, Math.min(1, dx)));
        }}
        onTouchEnd={(e) => {
          if (touchStart === null) {
            setSwipeDelta(0);
            return;
          }
          const dx = e.changedTouches[0].clientX - touchStart.x;
          const dy = e.changedTouches[0].clientY - touchStart.y;
          setSwipeDelta(0);
          setTouchStart(null);
          if (flipped) {
            // Swipe to rate -- same mapping as FlashcardMode's post-flip swipe.
            if (dy < -60 && Math.abs(dy) > Math.abs(dx)) {
              handleRate(4);
              return;
            } // up = Easy
            if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
              handleRate(dx < 0 ? 1 : 3); // left = Again, right = Good
              return;
            }
          } else if (Math.abs(dx) > 60 || Math.abs(dy) > 60) {
            // No free navigation to map to pre-flip (unlike FlashcardMode's
            // deck browsing) -- swipe reveals the card instead, same as tap.
            setFlipped(true);
          }
        }}
        aria-label={flipped ? undefined : `Balik kartu: ${currentCard ? clean : ''}`}
        className={R.card}
        style={{
          padding: flipped ? 'var(--space-24) var(--space-16)' : 'var(--space-32) var(--space-20)',
          background: T.surface,
          borderRadius: T.r.xxl,
          border: `1.5px solid ${flipped ? T.borderActive : T.border}`,
          minHeight: 220,
          cursor: flipped ? 'default' : 'pointer',
          transform: `translateX(${swipeDelta * 24}px) rotate(${swipeDelta * 4}deg)`,
        }}
      >
        <div className={R.cardFront} style={{ marginBottom: flipped ? 16 : 0 }}>
          <div className={R.cardJp}>
            <JpFront jp={currentCard.jp} furiganaPolicy={furiganaPolicy} />
          </div>
        </div>
        {flipped && (
          <div className={R.flipReveal}>
            <div className={R.flipIdText}>{currentCard.id_text}</div>
            <div className={R.flipDesc}>
              <DescBlock desc={currentCard.desc} />
            </div>
            <div className={R.flipCatRow}>
              <span
                className={S.pill}
                style={{
                  fontSize: 'var(--fs-micro)',
                  background: `${cat.color}15`,
                  color: cat.color,
                  border: `1px solid ${cat.color}33`,
                }}
              >
                {cat.emoji} {cat.label}
              </span>
            </div>
          </div>
        )}
      </div>

      {!flipped ? (
        <div className={R.flipPrompt}>Ketuk kartu untuk lihat jawaban · Space/Enter</div>
      ) : (
        <div className={R.ratingWrap}>
          <div className={R.ratingLabel}>Seberapa mudah kamu ingat?</div>
          <div className={R.ratingGrid}>
            {[1, 2, 3, 4].map((rating) => {
              const m = RATING_META[rating];
              const days = intervals[rating];
              return (
                <button
                  key={rating}
                  onClick={() => handleRate(rating)}
                  aria-label={`Nilai ${m.id}`}
                  className={R.ratingBtn}
                  style={{ background: m.bg, border: `1.5px solid ${m.border}`, color: m.color }}
                >
                  <span className={R.ratingEmoji}>{m.emoji}</span>
                  <span className={R.ratingId}>{m.id}</span>
                  {days != null && <span className={R.ratingInterval}>{fmtInterval(days)}</span>}
                  <span className={R.ratingKey}>{rating}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
