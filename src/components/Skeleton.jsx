// ─── components/Skeleton.jsx ──────────────────────────────────────────────────
// Reusable shimmer skeleton for loading states.
// Usage:
//   <Skeleton width="60%" height={32} />
//   <Skeleton.Card />       ← Flashcard front skeleton
//   <Skeleton.QuizItem />   ← Quiz option skeleton
// ─────────────────────────────────────────────────────────────────────────────

import S from './Skeleton.module.css';

// ── Base shimmer block ──────────────────────────────────────────────────────
export default function Skeleton({ width = '100%', height = 16, radius = 6, style = {}, className = '' }) {
  return (
    <div
      className={`${S.shimmer} ${className}`}
      style={{ width, height, borderRadius: radius, ...style }}
      aria-hidden="true"
    />
  );
}

// ── Flashcard front skeleton ────────────────────────────────────────────────
Skeleton.Card = function SkeletonCard() {
  return (
    <div className={S.card} aria-hidden="true" aria-label="Memuat kartu...">
      {/* Category pill */}
      <Skeleton width="80px" height={18} radius={99} style={{ marginBottom: 24 }} />
      {/* JP text */}
      <Skeleton width="100px" height={44} radius={8} style={{ marginBottom: 10 }} />
      {/* Furigana */}
      <Skeleton width="80px" height={14} radius={6} style={{ marginBottom: 6 }} />
      {/* Romaji */}
      <Skeleton width="70px" height={12} radius={6} />
    </div>
  );
};

// ── Quiz option skeleton ────────────────────────────────────────────────────
Skeleton.QuizOption = function SkeletonQuizOption() {
  return (
    <div className={S.quizOption} aria-hidden="true">
      <Skeleton width="24px" height={24} radius={6} style={{ flexShrink: 0 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Skeleton width="70%" height={14} />
        <Skeleton width="50%" height={12} />
      </div>
    </div>
  );
};

// ── Dashboard stat skeleton ─────────────────────────────────────────────────
Skeleton.Stat = function SkeletonStat() {
  return (
    <div className={S.stat} aria-hidden="true">
      <Skeleton width="40px" height={28} radius={6} style={{ margin: '0 auto 4px' }} />
      <Skeleton width="50px" height={11} radius={4} style={{ margin: '0 auto' }} />
    </div>
  );
};

// ── List row skeleton ────────────────────────────────────────────────────────
Skeleton.Row = function SkeletonRow({ lines = 2 }) {
  return (
    <div className={S.row} aria-hidden="true">
      <Skeleton width="36px" height={36} radius={10} style={{ flexShrink: 0 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 5 }}>
        {lines >= 1 && <Skeleton width="60%" height={13} />}
        {lines >= 2 && <Skeleton width="40%" height={11} />}
      </div>
    </div>
  );
};
