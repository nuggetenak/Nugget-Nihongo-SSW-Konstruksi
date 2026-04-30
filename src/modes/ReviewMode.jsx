// ─── ReviewMode.jsx ───────────────────────────────────────────────────────────
// Note: card border-color on flip is conditional (T.borderActive vs T.border) — justified inline.
// Note: rating button bg/border/color is per-rating grade from RATING_META — justified inline.
import { useState, useEffect, useCallback } from 'react';
import { T } from '../styles/theme.js';
import { CARDS } from '../data/cards.js';
import { getCatInfo } from '../data/categories.js';
import { stripFuri, jpFontSize } from '../utils/jp-helpers.js';
import { fmtInterval } from '../srs/fsrs-scheduler.js';
import { RATING_META } from '../srs/fsrs-core.js';
import ProgressBar from '../components/ProgressBar.jsx';
import Skeleton from '../components/Skeleton.jsx';
import S from './modes.module.css';

const CARD_MAP = Object.fromEntries(CARDS.map((c) => [c.id, c]));

export default function ReviewMode({ srs, onExit }) {
  const [queue, setQueue] = useState(null);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(false);
  const [_lastResult, setLast] = useState(null);
  const [intervals, setIntervals] = useState({});
  const [sessionCorrect, setSessionCorrect] = useState(0);

  useEffect(() => {
    if (!srs.ready) return;
    const ids = srs.getDue();
    setQueue(ids); setIdx(0); setDone(ids.length === 0);
  }, [srs.ready]); // eslint-disable-line react-hooks/exhaustive-deps

  const currentId = queue?.[idx];
  const currentCard = currentId != null ? CARD_MAP[currentId] : null;

  useEffect(() => {
    if (currentId == null) return;
    setIntervals(srs.previewFor(currentId)); setFlipped(false); setLast(null);
  }, [currentId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRate = useCallback((rating) => {
    if (!flipped || currentId == null) return;
    const result = srs.review(currentId, rating);
    setLast({ rating, interval: result.interval });
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
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [flipped, handleRate]);

  if (queue === null) {
    return (
    <div style={{ padding: '20px 20px', maxWidth: 480, margin: '0 auto' }}>
      <Skeleton width="60px" height={14} style={{ marginBottom: 16 }} />
      <Skeleton width="100%" height={4} radius={99} style={{ marginBottom: 24 }} />
      <Skeleton.Card />
    </div>
  );
  }

  if (done) {
    const total = queue.length;
    const pct = total > 0 ? Math.round((sessionCorrect / total) * 100) : 100;

    if (total === 0) {
      return (
        <div className={S.page} style={{ paddingTop: 0 }}>
          <button className={S.btnBack} style={{ paddingTop: 20 }} onClick={onExit}>← Kembali</button>
          <div className={S.emptyInMode} style={{ padding: '48px 24px', animation: 'scaleIn 0.3s ease' }}>
            <div className={S.emptyIcon}>🎉</div>
            <div className={S.emptyTitle}>Semua kartu sudah terulang!</div>
            <div className={S.emptyDesc}>Tidak ada yang jatuh tempo hari ini. Datang lagi besok untuk sesi ulasan berikutnya.</div>
            <button className={S.btnPrimary} style={{ width: 'auto', padding: '12px 24px', fontSize: 13 }} onClick={onExit}>Kembali ke Dashboard</button>
          </div>
        </div>
      );
    }

    return (
      <div className={S.pageCenter} style={{ animation: 'fadeIn 0.3s ease' }}>
        <div style={{ fontSize: 52, marginBottom: 12 }}>{pct >= 70 ? '🏆' : '📚'}</div>
        <h2 className={S.pageTitle} style={{ fontSize: 20 }}>Sesi selesai!</h2>
        <div style={{ fontSize: 14, color: T.textMuted, marginBottom: 20 }}>
          {sessionCorrect} dari {total} kartu dijawab dengan benar ({pct}%)
        </div>
        {srs.stats && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 24 }}>
            {[{ n: srs.stats.mature, label: 'Matang', icon: '🌟', color: T.correct },
              { n: srs.stats.young, label: 'Berkemb.', icon: '📗', color: T.gold },
              { n: srs.stats.learning, label: 'Belajar', icon: '📘', color: '#60a5fa' }
            ].map((s, i) => (
              <div key={i} style={{ padding: '10px 6px', borderRadius: T.r.md, background: T.surface, border: `1px solid ${T.border}`, textAlign: 'center' }}>
                <div style={{ fontSize: 14 }}>{s.icon}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.n}</div>
                <div style={{ fontSize: 10, color: T.textDim }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}
        <button className={S.btnPrimary} onClick={onExit}>← Kembali</button>
      </div>
    );
  }

  if (!currentCard) return null;
  const cat = getCatInfo(currentCard.category);
  const clean = stripFuri(currentCard.jp);
  const fs = jpFontSize(clean);
  const info = srs.getInfo(currentId);

  return (
    <div className={S.pageScroll} style={{ padding: '12px 16px 32px' }}>
      <div className={S.rowSpread} style={{ marginBottom: 8 }}>
        <button className={S.btnBack} style={{ marginBottom: 0 }} onClick={onExit}>← Keluar</button>
        <div style={{ fontSize: 12, color: T.textFaint }}>{idx + 1} / {queue.length}</div>
      </div>
      <ProgressBar current={idx} total={queue.length} color={T.amber} />

      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 10, marginBottom: 2 }}>
        <span className={S.pill} style={{ fontSize: 10, background: `${info.strength.color}15`, color: info.strength.color, border: `1px solid ${info.strength.color}30` }}>
          {info.strength.label} · {Math.round(info.R * 100)}% ingat
        </span>
      </div>

      {/* Card - border color is conditional on flip state, justified inline */}
      <div
        onClick={() => !flipped && setFlipped(true)}
        style={{ marginTop: 10, padding: flipped ? '22px 18px' : '36px 20px', background: T.surface, borderRadius: T.r.xxl, border: `1.5px solid ${flipped ? T.borderActive : T.border}`, minHeight: 220, cursor: flipped ? 'default' : 'pointer', display: 'flex', flexDirection: 'column', justifyContent: 'center', transition: 'all 0.2s cubic-bezier(0.4,0,0.2,1)' }}
      >
        <div style={{ textAlign: 'center', marginBottom: flipped ? 16 : 0 }}>
          <div style={{ fontSize: fs, fontWeight: 700, fontFamily: T.fontJP, lineHeight: 1.4 }}>{clean}</div>
          {currentCard.furi && <div style={{ fontSize: 12, color: T.textMuted, fontFamily: T.fontJP, marginTop: 4 }}>{currentCard.furi}</div>}
          <div style={{ fontSize: 11, color: T.textDim, fontStyle: 'italic', marginTop: 2 }}>{currentCard.romaji}</div>
        </div>
        {flipped && (
          <div style={{ animation: 'fadeIn 0.15s ease', borderTop: `1px solid ${T.border}`, paddingTop: 14 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: T.gold, textAlign: 'center', marginBottom: 8 }}>{currentCard.id_text}</div>
            <div style={{ fontSize: 12, lineHeight: 1.7, color: T.textMuted }}>{currentCard.desc}</div>
            <div style={{ marginTop: 10, textAlign: 'center' }}>
              <span className={S.pill} style={{ fontSize: 10, background: `${cat.color}15`, color: cat.color, border: `1px solid ${cat.color}33` }}>
                {cat.emoji} {cat.label}
              </span>
            </div>
          </div>
        )}
      </div>

      {!flipped ? (
        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: T.textDim }}>
          Ketuk kartu untuk lihat jawaban · Space/Enter
        </div>
      ) : (
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 10, color: T.textDim, textAlign: 'center', marginBottom: 8, letterSpacing: 0.5 }}>Seberapa mudah kamu ingat?</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 6 }}>
            {[1, 2, 3, 4].map((rating) => {
              const m = RATING_META[rating];
              const days = intervals[rating];
              return (
                <button key={rating} onClick={() => handleRate(rating)} style={{ fontFamily: 'inherit', padding: '10px 4px', borderRadius: T.r.md, cursor: 'pointer', background: m.bg, border: `1.5px solid ${m.border}`, color: m.color, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, transition: 'all 0.15s' }}>
                  <span style={{ fontSize: 14 }}>{m.emoji}</span>
                  <span style={{ fontSize: 12, fontWeight: 700 }}>{m.id}</span>
                  {days != null && <span style={{ fontSize: 9, opacity: 0.7 }}>{fmtInterval(days)}</span>}
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
