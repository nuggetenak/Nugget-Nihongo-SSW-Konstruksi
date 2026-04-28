// ─── ReviewMode.jsx ───────────────────────────────────────────────────────────
// Dedicated SRS review session. Works through the due queue one card at a time.
// User must flip the card before rating — mirrors Anki's UX.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react';
import { T } from '../styles/theme.js';
import { CARDS } from '../data/cards.js';
import { getCatInfo } from '../data/categories.js';
import { stripFuri, jpFontSize } from '../utils/jp-helpers.js';
import { fmtInterval } from '../srs/fsrs-scheduler.js';
import { RATING_META } from '../srs/fsrs-core.js';
import ProgressBar from '../components/ProgressBar.jsx';

// Build a card lookup map once
const CARD_MAP = Object.fromEntries(CARDS.map((c) => [c.id, c]));

export default function ReviewMode({ srs, onExit }) {
  const [queue, setQueue] = useState(null); // null = loading
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(false);
  const [_lastResult, setLast] = useState(null); // { interval, rating }
  const [intervals, setIntervals] = useState({}); // preview intervals for current card
  const [sessionCorrect, setSessionCorrect] = useState(0);

  // Load due queue on mount (after SRS store is ready)
  useEffect(() => {
    if (!srs.ready) return;
    const ids = srs.getDue();
    setQueue(ids); // eslint-disable-line react-hooks/set-state-in-effect
    setIdx(0);
    setDone(ids.length === 0);
  }, [srs.ready]); // eslint-disable-line react-hooks/exhaustive-deps

  const currentId = queue?.[idx];
  const currentCard = currentId != null ? CARD_MAP[currentId] : null;

  // Update interval preview whenever card changes
  useEffect(() => {
    if (currentId == null) return;
    setIntervals(srs.previewFor(currentId)); // eslint-disable-line react-hooks/set-state-in-effect
    setFlipped(false);
    setLast(null);
  }, [currentId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle a rating button press
  const handleRate = useCallback(
    (rating) => {
      if (!flipped || currentId == null) return;

      const result = srs.review(currentId, rating);
      setLast({ rating, interval: result.interval });
      if (result.isKnown) setSessionCorrect((n) => n + 1);

      // Brief pause so user sees feedback, then advance
      setTimeout(() => {
        const nextIdx = idx + 1;
        if (nextIdx >= queue.length) {
          setDone(true);
        } else {
          setIdx(nextIdx);
        }
      }, 600);
    },
    [flipped, currentId, idx, queue, srs]
  );

  // Keyboard shortcuts
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
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [flipped, handleRate]);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (queue === null) {
    return (
      <div
        style={{ padding: '40px 20px', textAlign: 'center', maxWidth: T.maxW, margin: '0 auto' }}
      >
        <div style={{ fontSize: 13, color: T.textDim }}>Memuat antrian ulasan...</div>
      </div>
    );
  }

  // ── All done ─────────────────────────────────────────────────────────────
  if (done) {
    const total = queue.length;
    const pct = total > 0 ? Math.round((sessionCorrect / total) * 100) : 100;
    return (
      <div
        style={{
          padding: '40px 20px',
          textAlign: 'center',
          maxWidth: T.maxW,
          margin: '0 auto',
          animation: 'fadeIn 0.3s ease',
        }}
      >
        <div style={{ fontSize: 52, marginBottom: 12 }}>
          {total === 0 ? '🎉' : pct >= 70 ? '🏆' : '📚'}
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>
          {total === 0 ? 'Tidak ada ulasan hari ini!' : 'Sesi selesai!'}
        </h2>
        {total > 0 && (
          <>
            <div style={{ fontSize: 14, color: T.textMuted, marginBottom: 20 }}>
              {sessionCorrect} dari {total} kartu dijawab dengan benar ({pct}%)
            </div>
            {srs.stats && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: 8,
                  marginBottom: 24,
                }}
              >
                {[
                  { n: srs.stats.mature, label: 'Matang', icon: '🌟', color: T.correct },
                  { n: srs.stats.young, label: 'Berkemb.', icon: '📗', color: T.gold },
                  { n: srs.stats.learning, label: 'Belajar', icon: '📘', color: '#60a5fa' },
                ].map((s, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '10px 6px',
                      borderRadius: T.r.md,
                      background: T.surface,
                      border: `1px solid ${T.border}`,
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: 14 }}>{s.icon}</div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.n}</div>
                    <div style={{ fontSize: 10, color: T.textDim }}>{s.label}</div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
        <button
          onClick={onExit}
          style={{
            width: '100%',
            padding: '14px',
            fontSize: 14,
            fontWeight: 700,
            fontFamily: 'inherit',
            borderRadius: T.r.md,
            border: 'none',
            cursor: 'pointer',
            background: T.accent,
            color: T.textBright,
            boxShadow: T.shadow.glow,
          }}
        >
          ← Kembali
        </button>
      </div>
    );
  }

  if (!currentCard) return null;
  const cat = getCatInfo(currentCard.category);
  const clean = stripFuri(currentCard.jp);
  const fs = jpFontSize(clean);
  const info = srs.getInfo(currentId);

  return (
    <div
      style={{
        padding: '12px 16px 32px',
        maxWidth: T.maxW,
        margin: '0 auto',
        animation: 'fadeIn 0.2s ease',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
        }}
      >
        <button
          onClick={onExit}
          style={{
            fontFamily: 'inherit',
            fontSize: 12,
            color: T.textMuted,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '6px 0',
          }}
        >
          ← Keluar
        </button>
        <div style={{ fontSize: 12, color: T.textFaint }}>
          {idx + 1} / {queue.length}
        </div>
      </div>
      <ProgressBar current={idx} total={queue.length} color={T.amber} />

      {/* SRS strength badge */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 10, marginBottom: 2 }}>
        <span
          style={{
            fontSize: 10,
            padding: '2px 8px',
            borderRadius: T.r.pill,
            background: `${info.strength.color}15`,
            color: info.strength.color,
            border: `1px solid ${info.strength.color}30`,
          }}
        >
          {info.strength.label} · {Math.round(info.R * 100)}% ingat
        </span>
      </div>

      {/* Card */}
      <div
        onClick={() => !flipped && setFlipped(true)}
        style={{
          marginTop: 10,
          padding: flipped ? '22px 18px' : '36px 20px',
          background: T.surface,
          borderRadius: T.r.xxl,
          border: `1.5px solid ${flipped ? T.borderActive : T.border}`,
          minHeight: 220,
          cursor: flipped ? 'default' : 'pointer',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)',
        }}
      >
        {/* Front (always visible) */}
        <div style={{ textAlign: 'center', marginBottom: flipped ? 16 : 0 }}>
          <div style={{ fontSize: fs, fontWeight: 700, fontFamily: T.fontJP, lineHeight: 1.4 }}>
            {clean}
          </div>
          {currentCard.furi && (
            <div style={{ fontSize: 12, color: T.textMuted, fontFamily: T.fontJP, marginTop: 4 }}>
              {currentCard.furi}
            </div>
          )}
          <div style={{ fontSize: 11, color: T.textDim, fontStyle: 'italic', marginTop: 2 }}>
            {currentCard.romaji}
          </div>
        </div>

        {/* Back (revealed on flip) */}
        {flipped && (
          <div
            style={{
              animation: 'fadeIn 0.15s ease',
              borderTop: `1px solid ${T.border}`,
              paddingTop: 14,
            }}
          >
            <div
              style={{
                fontSize: 16,
                fontWeight: 700,
                color: T.gold,
                textAlign: 'center',
                marginBottom: 8,
              }}
            >
              {currentCard.id_text}
            </div>
            <div style={{ fontSize: 12, lineHeight: 1.7, color: T.textMuted }}>
              {currentCard.desc}
            </div>
            <div style={{ marginTop: 10, textAlign: 'center' }}>
              <span
                style={{
                  fontSize: 10,
                  padding: '2px 8px',
                  borderRadius: T.r.pill,
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

      {/* Flip hint / Rating buttons */}
      {!flipped ? (
        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: T.textDim }}>
          Ketuk kartu untuk lihat jawaban · Space/Enter
        </div>
      ) : (
        <div style={{ marginTop: 14 }}>
          <div
            style={{
              fontSize: 10,
              color: T.textDim,
              textAlign: 'center',
              marginBottom: 8,
              letterSpacing: 0.5,
            }}
          >
            Seberapa mudah kamu ingat?
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 6 }}>
            {[1, 2, 3, 4].map((rating) => {
              const m = RATING_META[rating];
              const days = intervals[rating];
              return (
                <button
                  key={rating}
                  onClick={() => handleRate(rating)}
                  style={{
                    fontFamily: 'inherit',
                    padding: '10px 4px',
                    borderRadius: T.r.md,
                    cursor: 'pointer',
                    background: m.bg,
                    border: `1.5px solid ${m.border}`,
                    color: m.color,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 3,
                    transition: 'all 0.15s',
                  }}
                >
                  <span style={{ fontSize: 14 }}>{m.emoji}</span>
                  <span style={{ fontSize: 12, fontWeight: 700 }}>{m.id}</span>
                  {days != null && (
                    <span style={{ fontSize: 9, opacity: 0.7 }}>{fmtInterval(days)}</span>
                  )}
                  <span style={{ fontSize: 9, opacity: 0.45 }}>{rating}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
