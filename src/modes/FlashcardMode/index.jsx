// ─── FlashcardMode/index.jsx ─────────────────────────────────────────────────
// Orchestrator — all state lives here, sub-components are presentational.
// Decomposed from a single file into 5 sub-components; zero behavioral change.
// furiganaPolicy prop wired to JpDisplay (default: 'always').
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useEffect, useCallback } from 'react';
import { T } from '../../styles/theme.js';
import { shuffle } from '../../utils/shuffle.js';
import { isTypingTarget } from '../../utils/keyboard.js';
import { getCatInfo } from '../../data/categories.js';
import { useToast } from '../../components/Toast.jsx';
import { useConfirm } from '../../components/ConfirmDialog.jsx';
import { useApp } from '../../contexts/AppContext.jsx';
import { get as storageGet, set as storageSet } from '../../storage/engine.js';
import ProgressBar from '../../components/ProgressBar.jsx';
import ErrorBoundary, { FlatCardFallback } from '../../components/ErrorBoundary.jsx';
import EmptyState from '../../components/EmptyState.jsx';
import FilterPopup from '../../components/FilterPopup.jsx';
import S from '../modes.module.css';
import FC from './flashcard.module.css';

import FlipCard from './FlipCard.jsx';
import RatingRow from './RatingRow.jsx';
import ToolStrip from './ToolStrip.jsx';
import FilterBar from './FilterBar.jsx';
import Icon from '../../components/Icon.jsx';

const SEARCH_KEY = 'ssw-fc-search';
const CATS_KEY = 'ssw-fc-cats';

// Filters used to be one string carrying three unrelated things: free text,
// '__cat:<key>' for a single category, and '__starred__'. That made them
// mutually exclusive (you could not search inside a category) and made the
// category filter reachable only by tapping the badge of a card that already
// happened to be on screen. Categories are a real Set now — 'all' and
// 'bintang' are exclusive sentinels, everything else multi-selects — and text
// composes with them.
//
// This still reads the old string, because a tab open across the upgrade would
// otherwise take "__cat:haikan" as a literal query and show an empty deck with
// nothing explaining why.
function readInitialFilters() {
  const rawSearch = sessionStorage.getItem(SEARCH_KEY) ?? '';
  const rawCats = sessionStorage.getItem(CATS_KEY);
  if (rawCats !== null) {
    try {
      const parsed = JSON.parse(rawCats);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return { search: rawSearch, cats: new Set(parsed) };
      }
    } catch {
      // Unparseable — fall through to the defaults rather than trapping the
      // user in a mode that throws on entry.
    }
  }
  if (rawSearch === '__starred__') return { search: '', cats: new Set(['bintang']) };
  if (rawSearch.startsWith('__cat:')) return { search: '', cats: new Set([rawSearch.slice(6)]) };
  return { search: rawSearch, cats: new Set(['all']) };
}

export default function FlashcardMode({
  cards,
  known,
  unknown,
  onMark,
  onResetProgress,
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
  // True once the current card has been turned over at least once. Drives the
  // rating row and the number shortcuts, so they survive flipping back to the
  // front to re-check the Japanese — see RatingRow's header.
  const [seen, setSeen] = useState(false);
  const toast = useToast();
  const confirm = useConfirm();
  const { goMode } = useApp();

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
  const [search, setSearch] = useState(() => readInitialFilters().search);
  const [catFilter, setCatFilter] = useState(() => readInitialFilters().cats);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortMode, setSortMode] = useState(
    () => sessionStorage.getItem('ssw-fc-sort') ?? 'priority'
  );
  const [reviewBelum, setReviewBelum] = useState(false);
  // Read-only mode — browse without FSRS rating.
  const [readOnly, setReadOnly] = useState(false);
  // Search starts collapsed. It was permanently on screen, costing a row above
  // the card every session while being used only occasionally. Opens
  // automatically when a filter is already active, so a restored session never
  // hides why the deck looks smaller than expected — a category filter counts,
  // which is why applyCats opens it too.
  const [searchOpen, setSearchOpen] = useState(() => {
    const { search: s, cats } = readInitialFilters();
    return Boolean(s) || !cats.has('all');
  });

  // furiganaPolicy — wired to FlipCard → JpFront.
  const furiganaPolicy = storageGet('prefs')?.furiganaPolicy ?? 'always';

  // Any filter change lands on a fresh card, so the card-local view state has
  // to go with it — otherwise the rating row, which now outlives a flip-back,
  // would still be up for a card the user has not seen.
  const resetCardView = useCallback(() => {
    setIdx(0);
    setFlipped(false);
    setShowDesc(false);
    setRated(false);
    setSeen(false);
  }, []);

  const applySearch = useCallback(
    (v) => {
      setSearch(v);
      sessionStorage.setItem(SEARCH_KEY, v);
      resetCardView();
    },
    [resetCardView]
  );

  const applyCats = useCallback(
    (next) => {
      setCatFilter(next);
      sessionStorage.setItem(CATS_KEY, JSON.stringify([...next]));
      // Reveal the bar rather than force-rendering it around `searchOpen`: two
      // sources of truth for one row gave the toggle button and the search
      // input the same accessible name ("Cari kartu") whenever a category
      // filter held the bar open against a collapsed toggle.
      if (!next.has('all')) setSearchOpen(true);
      resetCardView();
    },
    [resetCardView]
  );

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
    setSeen(false);
  }, [baseCards, known, unknown, rebuildOrder, sortMode, reviewBelum]);

  // Category and text now stack instead of overriding each other.
  const catFiltered = catFilter.has('bintang')
    ? order.filter((c) => starred.has(c.id))
    : catFilter.has('all')
      ? order
      : order.filter((c) => catFilter.has(c.category));
  const query = search.trim().toLowerCase();
  const displayCards = query
    ? catFiltered.filter(
        (c) =>
          (c.jp || '').toLowerCase().includes(query) ||
          (c.id_text || '').toLowerCase().includes(query)
      )
    : catFiltered;

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
      setSeen(false);
    },
    [displayCards.length]
  );

  const flip = useCallback(() => {
    if (!flipped) {
      bumpHint();
      setSeen(true);
    }
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

  const handleReset = useCallback(async () => {
    const ok = await confirm(
      `${unknown.size + known.size > 0 ? `${known.size} kartu hafal akan direset. ` : ''}Ini tidak bisa dibatalkan.`,
      'Reset',
      'Batal',
      { label: 'Cadangkan data dulu →', onClick: () => goMode('ekspor') }
    );
    if (!ok) return;
    onResetProgress?.();
    setOrder(rebuildOrder(sortMode));
    setIdx(0);
    setFlipped(false);
    setRated(false);
    setSeen(false);
    toast.show('Progres direset');
  }, [confirm, known, unknown, onResetProgress, rebuildOrder, sortMode, toast, goMode]);

  useEffect(() => {
    const h = (e) => {
      if (isTypingTarget(e)) return;
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
      // Keyed off `seen`, matching the rating row: the buttons stay on screen
      // when the card is flipped back to the front, so the shortcuts have to
      // stay live with them.
      if (seen && !rated) {
        if (e.key === '1') handleRate(1);
        if (e.key === '2') handleRate(2);
        if (e.key === '3') handleRate(3);
        if (e.key === '4') handleRate(4);
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [go, flip, seen, rated, handleRate]);

  const hasCatFilter = !catFilter.has('all');

  // ── Empty state ──────────────────────────────────────────────────────────
  if (!card || displayCards.length === 0) {
    const resetFilters = () => {
      setSearch('');
      setCatFilter(new Set(['all']));
      setReviewBelum(false);
      // Clearing React state alone left the filter in sessionStorage, so a
      // "reset" filter came back on the next reload.
      sessionStorage.removeItem(SEARCH_KEY);
      sessionStorage.removeItem(CATS_KEY);
    };
    return (
      <div className={S.pageCenter}>
        {search || hasCatFilter ? (
          <EmptyState.SearchEmpty query={search} onCta={resetFilters} />
        ) : reviewBelum ? (
          <EmptyState
            icon="🎉"
            title="Tidak ada kartu belum hafal!"
            ctaLabel="Reset filter"
            onCta={resetFilters}
          />
        ) : (
          <EmptyState icon="📭" title="Tidak ada kartu" />
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
            background: T.wrongBg,
            border: `1px solid ${T.wrongBorder}`,
            borderRadius: 8,
            padding: 'var(--space-8) var(--space-12)',
            marginBottom: 'var(--space-8)',
            fontSize: 'var(--fs-caption)',
            color: T.wrong,
            textAlign: 'center',
          }}
        >
          ❌ Latihan kartu salah · {baseCards.length} kartu
        </div>
      )}

      {/* Progress, position and search on a single row. This previously took
          three rows: header, progress bar, then a stat strip repeating numbers
          already shown on the dashboard. Its own back button came out
          2026-09-04 when ModeHeader took over that job for all 21 modes — this
          was the only one of the 27 in the app rendered as a bare circular
          icon, which is exactly the sort of per-mode divergence consolidating
          it was meant to end. The row gets the space back. */}
      <div className={FC.topBar}>
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

        {/* Category filter. Until now the only way to narrow the deck by
            category was to tap the badge on a card of that category — which
            means finding one first, in a 1438-card deck, to filter a deck of
            1438 cards. */}
        <button
          className={FC.iconBtn}
          onClick={() => setFilterOpen(true)}
          aria-label="Filter kategori"
          aria-haspopup="dialog"
          data-active={hasCatFilter}
        >
          <Icon name="arsip" size={17} />
        </button>

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

      <FilterPopup
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
        cards={baseCards}
        activeCats={catFilter}
        onApply={applyCats}
        starredCount={starred.size}
      />

      {/* Filter bar — collapsed by default; applying a category opens it, so
          the deck is never quietly smaller than it looks. */}
      {searchOpen && (
        <FilterBar
          search={search}
          onSearch={applySearch}
          catFilter={catFilter}
          onClearCats={() => applyCats(new Set(['all']))}
          matchCount={displayCards.length}
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
          onCatFilter={(key) => applyCats(new Set([key]))}
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
            // v87 semantics: horizontal always moves between cards, up always
            // flips. These used to mean "rate this card" once it was face-up
            // (left=Again, right=Good, up=Easy), so swiping back to the
            // previous card stopped working the moment you flipped one over —
            // and a swipe meant to navigate silently scheduled an SRS review
            // instead. Rating is the four buttons' job.
            if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
              go(dx > 0 ? -1 : 1);
              return;
            }
            if (dy < -60 && Math.abs(dy) > Math.abs(dx)) flip();
          }}
        />
      </ErrorBoundary>

      {/* FSRS rating row — hidden in read-only mode */}
      {!readOnly && (
        <RatingRow seen={seen} rated={rated} srsPreviews={srsPreviews} onRate={handleRate} />
      )}

      {/* Gesture hint — describes navigation now, not rating */}
      {seen && !rated && (
        <div
          style={{
            textAlign: 'center',
            fontSize: 'var(--fs-small)',
            color: T.textDim,
            marginTop: 'var(--space-4)',
            letterSpacing: 0.3,
          }}
        >
          ← → ganti kartu · ↑ balik kartu
        </div>
      )}

      {/* Nav row. The flip button was removed 2026-09-04 as redundant with
          tapping the card — true of the front face, false of the back, which
          carried no handler at all. On a touch screen that made a flipped card
          impossible to turn back over. It is back, and the back face is
          tappable too (FlipCard.jsx). The arrows are separately necessary:
          swipe does not exist with a mouse, and desktop is a supported size. */}
      <div className={FC.navRow}>
        <button
          onClick={() => go(-1)}
          disabled={safeIdx === 0}
          className={FC.navBtn}
          aria-label="Kartu sebelumnya"
        >
          ← Prev
        </button>
        {/* No aria-label: the visible text already names the action, and
            duplicating "Balik kartu" here would give the page two controls with
            that name — the card face itself carries it. */}
        <button onClick={flip} className={FC.navFlip} aria-pressed={flipped}>
          {flipped ? '🔄 Balik' : '👁 Lihat'}
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
            padding: 'var(--space-8) var(--space-12)',
            marginTop: 'var(--space-4)',
            borderRadius: 8,
            background: T.correctBg,
            border: `1px solid ${T.correctBorder}`,
            color: T.correct,
            fontSize: 'var(--fs-caption)',
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
            fontSize: 'var(--fs-small)',
            color: T.correct,
            marginTop: 'var(--space-4)',
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
        onReset={handleReset}
        starredCount={starred.size}
        starFilterActive={catFilter.has('bintang')}
        onToggleStarFilter={() =>
          applyCats(catFilter.has('bintang') ? new Set(['all']) : new Set(['bintang']))
        }
        seen={seen}
        rated={rated}
        readOnly={readOnly}
        onToggleReadOnly={() => setReadOnly((r) => !r)}
      />
    </div>
  );
}
