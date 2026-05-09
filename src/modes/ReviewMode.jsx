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
import { stripFuri, jpFontSize } from '../utils/jp-helpers.js';
import { fmtInterval } from '../srs/fsrs-scheduler.js';
import { RATING_META } from '../srs/fsrs-core.js';
import { get as storageGet } from '../storage/engine.js';
import { speakJP, canSpeak } from '../utils/speak.js';
import { useSessionTimer } from '../hooks/useSessionTimer.js';
import ProgressBar from '../components/ProgressBar.jsx';
import Skeleton from '../components/Skeleton.jsx';
import S from './modes.module.css';
import R from './ReviewMode.module.css';

const CARD_MAP = Object.fromEntries(CARDS.map((c) => [c.id, c]));

export default function ReviewMode({ srs, onExit, onSessionEnd }) {
  const [queue, setQueue] = useState(null);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(false);
  const [intervals, setIntervals] = useState({});
  const [sessionCorrect, setSessionCorrect] = useState(0);
  // Rating distribution tracking.
  const [ratingDist, setRatingDist] = useState({ 1: 0, 2: 0, 3: 0, 4: 0 });
  const { getDurationMs } = useSessionTimer();

  useEffect(() => {
    if (!srs.ready) return;
    const ids = srs.getDue();
    setQueue(ids); setIdx(0); setDone(ids.length === 0);
  }, [srs.ready]); // eslint-disable-line react-hooks/exhaustive-deps

  const currentId = queue?.[idx];
  const currentCard = currentId != null ? CARD_MAP[currentId] : null;

  useEffect(() => {
    if (currentId == null) return;
    setIntervals(srs.previewFor(currentId)); setFlipped(false);
  }, [currentId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!done || !queue) return;
    onSessionEnd?.({ correct: sessionCorrect, total: queue.length, durationMs: getDurationMs() });
  }, [done]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-speak on card advance — HVPT: passive exposure more effective than manual tap.
  // If speakOnFlip is true, speak on flip instead of advance.
  useEffect(() => {
    const prefs = storageGet('prefs') ?? {};
    const audioEnabled = prefs.audioEnabled !== false;
    const speakOnFlip = prefs.speakOnFlip === true;
    if (!audioEnabled || !currentCard || !canSpeak() || speakOnFlip) return;
    const t = setTimeout(() => speakJP(stripFuri(currentCard.jp)), 300);
    return () => clearTimeout(t);
  }, [currentId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Speak on flip.
  useEffect(() => {
    const prefs = storageGet('prefs') ?? {};
    const audioEnabled = prefs.audioEnabled !== false;
    const speakOnFlip = prefs.speakOnFlip === true;
    if (!audioEnabled || !flipped || !currentCard || !canSpeak() || !speakOnFlip) return;
    speakJP(stripFuri(currentCard.jp));
  }, [flipped]); // eslint-disable-line react-hooks/exhaustive-deps

  // Skip card without rating — advance to next without SRS review.
  const handleSkip = useCallback(() => {
    if (!queue) return;
    const nextIdx = idx + 1;
    if (nextIdx >= queue.length) setDone(true);
    else { setIdx(nextIdx); setFlipped(false); }
  }, [idx, queue]);

  const handleRate = useCallback((rating) => {
    if (!flipped || currentId == null) return;
    const result = srs.review(currentId, rating);
    setRatingDist((d) => ({ ...d, [rating]: d[rating] + 1 }));
    if (result.isKnown) setSessionCorrect((n) => n + 1);
    setTimeout(() => {
      const nextIdx = idx + 1;
      if (nextIdx >= queue.length) setDone(true);
      else setIdx(nextIdx);
    }, 600);
  }, [flipped, currentId, idx, queue, srs]);

  useEffect(() => {
    const h = (e) => {
      if (!flipped) { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setFlipped(true); } return; }
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
      <div className={R.skeleton}>
        <Skeleton width="60px" height={14} style={{ marginBottom: 16 }} />
        <Skeleton width="100%" height={4} radius={99} style={{ marginBottom: 24 }} />
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
          <button className={`${S.btnBack} ${R.emptyBack}`} onClick={onExit}>← Kembali</button>
          <div className={`${S.emptyInMode}`} style={{ padding: '48px 24px', animation: 'scaleIn 0.3s ease' }}>
            <div className={S.emptyIcon}>🎉</div>
            <div className={S.emptyTitle}>Semua kartu sudah terulang!</div>
            <div className={S.emptyDesc}>Tidak ada yang jatuh tempo hari ini. Datang lagi besok untuk sesi ulasan berikutnya.</div>
            <button className={S.btnPrimary} style={{ width: 'auto', padding: '12px 24px', fontSize: 13 }} onClick={onExit}>Kembali ke Dashboard</button>
          </div>
        </div>
      );
    }

    return (
      <div className={`${S.pageCenter} ${R.doneScreen}`}>
        <div className={R.doneEmoji}>{pct >= 70 ? '🏆' : '📚'}</div>
        <h2 className={`${S.pageTitle} ${R.doneTitle}`}>Sesi selesai!</h2>
        <div className={R.doneSub}>{sessionCorrect} dari {total} kartu dijawab dengan benar ({pct}%)</div>
        {srs.stats && (
          <div className={R.doneMiniGrid}>
            {[{ n: srs.stats.mature, label: 'Matang', icon: '🌟', color: T.correct },
              { n: srs.stats.young, label: 'Berkemb.', icon: '📗', color: T.gold },
              { n: srs.stats.learning, label: 'Belajar', icon: '📘', color: '#60a5fa' }
            ].map((stat, i) => (
              <div key={i} className={R.doneMiniCard}>
                <div className={R.doneMiniIcon}>{stat.icon}</div>
                <div className={R.doneMiniValue} style={{ color: stat.color }}>{stat.n}</div>
                <div className={R.doneMiniLabel}>{stat.label}</div>
              </div>
            ))}
          </div>
        )}
        {/* Rating distribution */}
        {total > 0 && (
          <div style={{ width: '100%', maxWidth: 280, margin: '12px auto 0' }}>
            <div style={{ fontSize: 11, color: T.textDim, marginBottom: 6, textAlign: 'center', letterSpacing: 0.4 }}>DISTRIBUSI RATING</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
              {[
                { r: 1, label: 'Lagi', emoji: '🔴', color: '#f87171' },
                { r: 2, label: 'Susah', emoji: '🟠', color: '#fb923c' },
                { r: 3, label: 'Oke', emoji: '🟢', color: T.correct },
                { r: 4, label: 'Mudah', emoji: '🔵', color: '#60a5fa' },
              ].map(({ r, label, emoji, color }) => (
                <div key={r} style={{ textAlign: 'center', background: `${color}12`, border: `1px solid ${color}30`, borderRadius: 8, padding: '8px 4px' }}>
                  <div style={{ fontSize: 14 }}>{emoji}</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color }}>{ratingDist[r]}</div>
                  <div style={{ fontSize: 10, color: T.textDim }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        <button className={S.btnPrimary} onClick={onExit}>← Kembali</button>
      </div>
    );
  }

  // ─── PLAYING ───────────────────────────────────────────────────────────────
  if (!currentCard) return null;
  const cat = getCatInfo(currentCard.category);
  const clean = stripFuri(currentCard.jp);
  const fs = jpFontSize(clean);
  const info = srs.getInfo(currentId);
  const audioEnabled = storageGet('prefs')?.audioEnabled !== false && canSpeak();
  const remaining = queue.length - idx - 1;

  return (
    <div className={`${S.pageScroll} ${R.quizPage}`}>
      <div className={`${S.rowSpread} ${R.quizHeader}`}>
        <button className={S.btnBack} style={{ marginBottom: 0 }} onClick={onExit}>← Keluar</button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {audioEnabled && (
            <button onClick={() => speakJP(clean)} aria-label="Putar audio" className={R.audioBtn}>🔊</button>
          )}
          {/* Skip without rating */}
          <button
            onClick={handleSkip}
            aria-label="Lewati kartu ini (S)"
            title="Lewati (S)"
            style={{ fontSize: 11, color: 'var(--c-text-dim)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 6px' }}
          >Lewati</button>
          {/* Remaining count */}
          <div className={R.cardIdxLabel}>{idx + 1} / {queue.length}{remaining > 0 ? ` · ${remaining} lagi` : ''}</div>
        </div>
      </div>
      <ProgressBar current={idx} total={queue.length} color={T.amber} />

      <div className={R.strengthPill}>
        <span className={S.pill} style={{ fontSize: 10, background: `${info.strength.color}15`, color: info.strength.color, border: `1px solid ${info.strength.color}30` }}>
          {info.strength.label} · {Math.round(info.R * 100)}% ingat
        </span>
        {/* Due reason — interval + reps */}
        {info.seen && (
          <span className={S.pill} style={{ fontSize: 10, background: T.surface, color: T.textMuted, border: `1px solid ${T.border}` }}>
            {info.reps > 0 ? `${info.reps}× ulasan` : 'Baru'}{info.reps > 0 ? ` · interval ${fmtInterval(intervals[3])}` : ''}
          </span>
        )}
      </div>

      {/* Card — border/padding conditional on flip state, justified inline */}
      <div
        onClick={() => !flipped && setFlipped(true)}
        role="button"
        tabIndex={flipped ? -1 : 0}
        onKeyDown={(e) => { if (!flipped && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); setFlipped(true); } }}
        aria-label={flipped ? undefined : `Balik kartu: ${currentCard ? currentCard.jp : ''}`}
        className={R.card}
        style={{
          padding: flipped ? '22px 18px' : '36px 20px',
          background: T.surface,
          borderRadius: T.r.xxl,
          border: `1.5px solid ${flipped ? T.borderActive : T.border}`,
          minHeight: 220,
          cursor: flipped ? 'default' : 'pointer',
        }}
      >
        <div className={R.cardFront} style={{ marginBottom: flipped ? 16 : 0 }}>
          <div className={R.cardJp} style={{ fontSize: fs }}>{clean}</div>
          {currentCard.furi && <div className={R.cardFuri}>{currentCard.furi}</div>}
        </div>
        {flipped && (
          <div className={R.flipReveal}>
            <div className={R.flipIdText}>{currentCard.id_text}</div>
            <div className={R.flipDesc}>{currentCard.desc}</div>
            <div className={R.flipCatRow}>
              <span className={S.pill} style={{ fontSize: 10, background: `${cat.color}15`, color: cat.color, border: `1px solid ${cat.color}33` }}>
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
