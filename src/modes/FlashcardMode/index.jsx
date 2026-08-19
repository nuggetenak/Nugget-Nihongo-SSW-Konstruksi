// ─── FlashcardMode/index.jsx ─────────────────────────────────────────────────
// Orchestrator — all state lives here, sub-components are presentational.
// Decomposed from a single file into 5 sub-components; zero behavioral change.
// furiganaPolicy prop wired to JpDisplay (default: 'always').
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect, useCallback, useRef } from 'react';
import { T } from '../../styles/theme.js';
import { shuffle } from '../../utils/shuffle.js';
import { getCatInfo } from '../../data/categories.js';
import { useToast } from '../../components/Toast.jsx';
import { get as storageGet, set as storageSet } from '../../storage/engine.js';
import ProgressBar from '../../components/ProgressBar.jsx';
import ErrorBoundary, { FlatCardFallback } from '../../components/ErrorBoundary.jsx';
import S from '../modes.module.css';
import FC from './flashcard.module.css';

import FlipCard from './FlipCard.jsx';
import RatingRow from './RatingRow.jsx';
import ToolStrip from './ToolStrip.jsx';
import FilterBar from './FilterBar.jsx';
import Icon from '../../components/Icon.jsx';

export default function FlashcardMode({
  cards,
  known,
  unknown,
  onMark,
  onExit,
  srs,
  starred = new Set(),
  onToggleStar = () => {},
  filterIds = null,
}) {
  // If filterIds provided (wrong-card bridge), scope cards to that set.
  const baseCards = filterIds ? cards.filter((c) => filterIds.includes(c.id)) : cards;
  const [order, setOrder] = useState([]);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [showDesc, setShowDesc] = useState(false);
  const [rated, setRated] = useState(false);
  const toast = useToast();

  // Hint: show "Tap untuk balik" until 3 flips lifetime
  const [hintCount, setHintCount] = useState(() => storageGet('prefs')?.flashcardHintCount ?? 0);
  const showHint = hintCount < 3 && !flipped;
  const bumpHint = useCallback(() => {
    if (hintCount >= 3) return;
    const next = hintCount + 1;
    setHintCount(next);
    storageSet('prefs', (p) => ({ ...p, flashcardHintCount: next }));
  }, [hintCount]);

  // Swipe tilt — touchStart is {x, y} or null
  const [touchStart, setTouchStart] = useState(null);
  const [swipeDelta, setSwipeDelta] = useState(0);

  // Filter/sort — persists across mode switches via sessionStorage.
  const [search, setSearch] = useState(() => sessionStorage.getItem('ssw-fc-search') ?? '');
  const [sortMode, setSortMode] = useState(
    () => sessionStorage.getItem('ssw-fc-sort') ?? 'priority'
  );
  const [reviewBelum, setReviewBelum] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const confirmTimer = useRef(null);
  // Read-only mode — browse without FSRS rating.
  const [readOnly, setReadOnly] = useState(false);
  // Search starts collapsed. It was permanently on screen, costing a row above
  // the card every session while being used only occasionally. Opens
  // automatically when a filter is already active, so a restored session never
  // hides why the deck looks smaller than expected.
  const [searchOpen, setSearchOpen] = useState(() => Boolean(search));

  // furiganaPolicy — wired to FlipCard → JpFront.
  const furiganaPolicy = storageGet('prefs')?.furiganaPolicy ?? 'always';

  const rebuildOrder = useCallback(
    (mode) => {
      const base = reviewBelum ? baseCards.filter((c) => unknown.has(c.id)) : baseCards;
      if (mode === 'original') return base;
      if (mode === 'shuffle') return shuffle([...base]);
      const u = base.filter((c) => unknown.has(c.id));
      const t = base.filter((c) => !known.has(c.id) && !unknown.has(c.id));
      const k = base.filter((c) => known.has(c.id));
      return [...shuffle(u), ...shuffle(t), ...shuffle(k)];
    },
    [baseCards, known, unknown, reviewBelum]
  );

  useEffect(() => {
    setOrder(rebuildOrder(sortMode));
    setIdx(0);
    setFlipped(false);
    setShowDesc(false);
    setRated(false);
  }, [baseCards, known, unknown, rebuildOrder, sortMode, reviewBelum]);

  const displayCards =
    search === '__starred__'
      ? order.filter((c) => starred.has(c.id))
      : search.startsWith('__cat:')
        ? order.filter((c) => c.category === search.slice(6))
        : search.trim()
          ? order.filter((c) => {
              const q = search.toLowerCase();
              return (
                (c.jp || '').toLowerCase().includes(q) ||
                (c.id_text || '').toLowerCase().includes(q)
              );
            })
          : order;

  const safeIdx = Math.min(idx, Math.max(0, displayCards.length - 1));
  const card = displayCards[safeIdx];
  const cat = card ? getCatInfo(card.category) : null;
  const isKnown = card && known.has(card.id);
  const isUnknown = card && unknown.has(card.id);
  const isStarred = card && starred.has(card.id);

  const knownInView = displayCards.filter((c) => known.has(c.id)).length;
  const unknownInView = displayCards.filter((c) => unknown.has(c.id)).length;

  const srsInfo = srs?.ready && card ? srs.getInfo(card.id) : null;
  const srsPreviews = srs?.ready && card ? srs.previewFor(card.id) : {};

  const go = useCallback(
    (dir) => {
      setSwipeDelta(0);
      setIdx((i) => Math.max(0, Math.min(displayCards.length - 1, i + dir)));
      setFlipped(false);
      setShowDesc(false);
      setRated(false);
    },
    [displayCards.length]
  );

  const flip = useCallback(() => {
    if (!flipped) bumpHint();
    setFlipped((f) => !f);
    setShowDesc(false);
  }, [flipped, bumpHint]);

  const handleRate = useCallback(
    (rating) => {
      if (!card || rated) return;
      if (srs?.ready) {
        const result = srs.review(card.id, rating);
        onMark?.(card.id, result.isKnown ? 'known' : 'unknown');
      } else {
        onMark?.(card.id, rating >= 2 ? 'known' : 'unknown');
      }
      setRated(true);
      setTimeout(() => go(1), 400);
    },
    [card, rated, srs, onMark, go]
  );

  const handleReset = useCallback(() => {
    if (confirmReset) {
      clearTimeout(confirmTimer.current);
      onMark?.('__RESET__', 'reset');
      setConfirmReset(false);
      setOrder(rebuildOrder(sortMode));
      setIdx(0);
      setFlipped(false);
      setRated(false);
      toast.show('Progres direset');
    } else {
      setConfirmReset(true);
      confirmTimer.current = setTimeout(() => setConfirmReset(false), 3000);
    }
  }, [confirmReset, onMark, rebuildOrder, sortMode, toast]);

  useEffect(() => {
    const h = (e) => {
      if (e.key === 'ArrowLeft') {
        go(-1);
        return;
      }
      if (e.key === 'ArrowRight') {
        go(1);
        return;
      }
      if (e.key === ' ') {
        e.preventDefault();
        flip();
        return;
      }
      if (flipped && !rated) {
        if (e.key === '1') handleRate(1);
        if (e.key === '2') handleRate(2);
        if (e.key === '3') handleRate(3);
        if (e.key === '4') handleRate(4);
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [go, flip, flipped, rated, handleRate]);

  // ── Empty state ──────────────────────────────────────────────────────────
  if (!card || displayCards.length === 0) {
    return (
      <div className={S.pageCenter}>
        <button
          onClick={onExit}
          className={S.btnBack}
          style={{ display: 'inline-block', marginBottom: 24 }}
        >
          ← Kembali
        </button>
        <div className={S.emptyIcon}>{search ? '🔍' : reviewBelum ? '🎉' : '📭'}</div>
        <div className={S.emptyTitle}>
          {search
            ? `Tidak ada hasil untuk "${search}"`
            : reviewBelum
              ? 'Tidak ada kartu belum hafal!'
              : 'Tidak ada kartu'}
        </div>
        {(search || reviewBelum) && (
          <button
            onClick={() => {
              setSearch('');
              setReviewBelum(false);
            }}
            className={S.btnSecondary}
          >
            Reset filter
          </button>
        )}
      </div>
    );
  }

  const borderColor = isKnown ? T.correctBorder : isUnknown ? T.wrongBorder : T.border;

  return (
    <div className={S.fcWrapper}>
      {/* Wrong-card bridge banner */}
      {filterIds && (
        <div
          style={{
            background: 'rgba(248,113,113,0.10)',
            border: '1px solid rgba(248,113,113,0.3)',
            borderRadius: 8,
            padding: '8px 12px',
            marginBottom: 8,
            fontSize: 12,
            color: '#f87171',
            textAlign: 'center',
          }}
        >
          ❌ Latihan kartu salah · {baseCards.length} kartu
        </div>
      )}

      {/* Header — back, progress, position and search on a single row. This
          previously took three rows: header, progress bar, then a stat strip
          repeating numbers already shown on the dashboard. */}
      <div className={FC.topBar}>
        <button className={FC.backBtn} onClick={onExit} aria-label="Kembali">
          ←
        </button>

        <div className={FC.railWrap}>
          <ProgressBar current={knownInView} total={displayCards.length} color={T.correct} />
        </div>

        {srsInfo && (
          <span
            className={FC.srsPill}
            style={{ background: `${srsInfo.strength.color}15`, color: srsInfo.strength.color }}
          >
            {srsInfo.strength.label}
          </span>
        )}

        <span className={FC.counter}>
          {safeIdx + 1}/{displayCards.length}
        </span>

        <button
          className={FC.iconBtn}
          onClick={() => setSearchOpen((o) => !o)}
          aria-label={searchOpen ? 'Tutup pencarian' : 'Cari kartu'}
          aria-expanded={searchOpen}
          data-active={searchOpen || Boolean(search)}
        >
          <Icon name="cari" size={17} />
        </button>
      </div>

      {/* Filter bar — collapsed by default */}
      {searchOpen && (
        <FilterBar
          search={search}
          onSearch={(v) => {
            setSearch(v);
            sessionStorage.setItem('ssw-fc-search', v);
            setIdx(0);
          }}
          isStarred={isStarred}
          onToggleStar={() => onToggleStar(card?.id)}
        />
      )}

      {/* 3D Flip Card — wrapped in ErrorBoundary for old WebView fallback */}
      <ErrorBoundary fallback={<FlatCardFallback card={card} />}>
        <FlipCard
          card={card}
          cat={cat}
          flipped={flipped}
          furiganaPolicy={furiganaPolicy}
          showDesc={showDesc}
          onFlip={flip}
          onShowDesc={() => setShowDesc(true)}
          safeIdx={safeIdx}
          srsInfo={srsInfo}
          hintCount={hintCount}
          showHint={showHint}
          borderColor={borderColor}
          swipeDelta={swipeDelta}
          onCatFilter={(key) => {
            setSearch(`__cat:${key}`);
            sessionStorage.setItem('ssw-fc-search', `__cat:${key}`);
            setIdx(0);
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
            // If flipped and not yet rated — swipe to rate.
            if (flipped && !rated) {
              if (dy < -60 && Math.abs(dy) > Math.abs(dx)) {
                handleRate(4);
                return;
              } // swipe up = Easy
              if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
                handleRate(dx < 0 ? 1 : 3);
                return; // left=Again, right=Good
              }
            }
            // Not flipped or small swipe — navigate cards
            if (!flipped && Math.abs(dx) > 60) go(dx > 0 ? -1 : 1);
          }}
        />
      </ErrorBoundary>

      {/* FSRS rating row — hidden in read-only mode */}
      {!readOnly && (
        <RatingRow flipped={flipped} rated={rated} srsPreviews={srsPreviews} onRate={handleRate} />
      )}

      {/* Swipe hint — shown when flipped and not yet rated */}
      {!readOnly && flipped && !rated && (
        <div
          style={{
            textAlign: 'center',
            fontSize: 11,
            color: T.textFaint,
            marginTop: 4,
            letterSpacing: 0.3,
          }}
        >
          ← Lagi · Oke → · ↑ Mudah
        </div>
      )}

      {/* Nav row — arrows only. The flip button was redundant (tapping the card
          flips it, Space does on a keyboard) but the arrows are NOT: swipe does
          not exist with a mouse, and desktop is now a supported size. */}
      <div className={FC.navRow}>
        <button
          onClick={() => go(-1)}
          disabled={safeIdx === 0}
          className={FC.navBtn}
          aria-label="Kartu sebelumnya"
        >
          ← Prev
        </button>
        <button
          onClick={() => go(1)}
          disabled={safeIdx >= displayCards.length - 1}
          className={FC.navBtn}
          aria-label="Kartu berikutnya"
        >
          Next →
        </button>
      </div>

      {/* Manual SRS enqueue for known cards not yet in SRS */}
      {isKnown && srs?.ready && !srsInfo && (
        <button
          onClick={() => {
            srs.review(card.id, 1);
          }}
          style={{
            fontFamily: 'inherit',
            width: '100%',
            padding: '8px 12px',
            marginTop: 4,
            borderRadius: 8,
            background: 'rgba(34,197,94,0.08)',
            border: '1px solid rgba(34,197,94,0.3)',
            color: '#22c55e',
            fontSize: 12,
            cursor: 'pointer',
          }}
        >
          ＋ Tambah ke Ulasan SRS
        </button>
      )}
      {isKnown && srs?.ready && srsInfo && (
        <div
          style={{
            textAlign: 'center',
            fontSize: 11,
            color: '#22c55e',
            marginTop: 4,
            opacity: 0.7,
          }}
        >
          ✓ Sudah di SRS
        </div>
      )}

      {/* Tool strip */}
      <ToolStrip
        sortMode={sortMode}
        onCycleSort={() =>
          setSortMode((m) => {
            const next = m === 'priority' ? 'original' : m === 'original' ? 'shuffle' : 'priority';
            sessionStorage.setItem('ssw-fc-sort', next);
            return next;
          })
        }
        reviewBelum={reviewBelum}
        onToggleBelum={() => {
          setReviewBelum((r) => !r);
          setIdx(0);
        }}
        unknownInView={unknownInView}
        confirmReset={confirmReset}
        onReset={handleReset}
        starredCount={starred.size}
        starFilterActive={search === '__starred__'}
        onToggleStarFilter={() => {
          setSearch(search === '__starred__' ? '' : '__starred__');
          setIdx(0);
        }}
        flipped={flipped}
        rated={rated}
        readOnly={readOnly}
        onToggleReadOnly={() => setReadOnly((r) => !r)}
      />
    </div>
  );
}
