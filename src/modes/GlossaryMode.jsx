// ─── GlossaryMode.jsx ─────────────────────────────────────────────────────────
// Note: IntersectionObserver logic unchanged. data-nav / data-letter attributes kept.
// Note: azBtn active bg/border/color/fontWeight are dynamic (isActive), kept inline.
// Note: filterBtn active bg/border/color are dynamic, kept inline.
// Note: termRow bg is dynamic (isOpen), kept inline.
import { useState, useMemo, useRef, useEffect } from 'react';
import { T } from '../styles/theme.js';
import { CARDS } from '../data/cards.js';
import { CATEGORIES, getCatsForTrack } from '../data/categories.js';
import { stripFuri, extractReadings, JP_LIST_MAX } from '../utils/jp-helpers.js';
import { speakJP, canSpeak } from '../utils/speak.js';
import { get as storageGet } from '../storage/engine.js';
import { formatCount } from '../utils/format.js';
import { useApp } from '../contexts/AppContext.jsx';
import { useSpeakErrorHandler } from '../hooks/useSpeakErrorHandler.js';
import { JpFront, DescBlock } from '../components/JpDisplay.jsx';
import S from './modes.module.css';
import G from './GlossaryMode.module.css';

// How many letter groups render at once. Six covers roughly the first 200
// entries — more than a phone screen's worth of scrolling before the button is
// even reached — while keeping the DOM to a fraction of the 18,329 nodes the
// full list used to mount.
const GROUP_PAGE = 6;

export default function GlossaryMode({ track }) {
  const { prefs } = useApp();
  const handleSpeakError = useSpeakErrorHandler();
  const furiganaPolicy = prefs?.furiganaPolicy ?? 'always';
  const [filterCat, setFilterCat] = useState('all');
  // showAllTracks removed 2026-09-04. It toggled between "cards in my track" and
  // "all cards" — but every category in categories.js carries tracks:
  // ['lifeline'], so getCatsForTrack('lifeline') returns all 11 content
  // categories and both sides of the toggle produced the identical set. A
  // control that cannot change what it claims to change, shown in two modes,
  // left over from when Doboku and Kenchiku existed (removed session 24).
  const [expanded, setExpanded] = useState(null);
  const [activeLetter, setActiveLetter] = useState(null);
  const [compactView, setCompactView] = useState(true); // true=click-to-expand; false=always-show-all
  // Select mode for mini deck export.
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState(new Set());
  const [exportDone, setExportDone] = useState(false);
  const navRef = useRef(null);
  const audioEnabled = storageGet('prefs')?.audioEnabled !== false && canSpeak();
  const sectionRefs = useRef({});
  const observerRef = useRef(null);

  const trackCatKeys = useMemo(() => (track ? new Set(getCatsForTrack(track)) : null), [track]);
  const visibleCats = useMemo(() => {
    const base = CATEGORIES.filter((c) => c.key !== 'all' && c.key !== 'bintang');
    if (!trackCatKeys) return base;
    return base.filter((c) => trackCatKeys.has(c.key));
  }, [trackCatKeys]);

  const sorted = useMemo(() => {
    let items;
    if (filterCat === 'all') {
      items = trackCatKeys ? CARDS.filter((c) => trackCatKeys.has(c.category)) : CARDS;
    } else {
      items = CARDS.filter((c) => c.category === filterCat);
    }
    return [...items].sort((a, b) =>
      (extractReadings(a.jp) || '')
        .toLowerCase()
        .localeCompare((extractReadings(b.jp) || '').toLowerCase(), 'ja')
    );
  }, [filterCat, trackCatKeys]);

  const groups = useMemo(() => {
    const map = {};
    sorted.forEach((c) => {
      const first = (extractReadings(c.jp) || '?')[0];
      // Use actual first char as key — allows kanji/romaji nav keys.
      if (!map[first]) map[first] = [];
      map[first].push(c);
    });
    // Sort: hiragana/katakana first (by unicode order), then others alphabetically
    const entries = Object.entries(map);
    const kana = entries.filter(([k]) =>
      /^[\u3041-\u3096\u30A1-\u30FA\u30FC\uFF66-\uFF9F]/.test(k)
    );
    const other = entries
      .filter(([k]) => !/^[\u3041-\u3096\u30A1-\u30FA\u30FC\uFF66-\uFF9F]/.test(k))
      .sort(([a], [b]) => a.localeCompare(b));
    return [...kana, ...other];
  }, [sorted]);

  const letters = useMemo(() => groups.map(([l]) => l), [groups]);

  // Render letter groups incrementally. Measured before changing anything: the
  // full glossary put 18,329 DOM nodes and an 82,000px page on screen at once,
  // ~1.5s to enter on a desktop CPU — on the cheap Android phones this app is
  // built for, several seconds and a lot of memory, for a list nobody scrolls
  // end to end. Groups rather than rows, so the A–Z strip's jump targets stay
  // intact; jumpTo below extends the window to cover its target first, so every
  // letter is still one tap away and the interaction is unchanged.
  const [groupLimit, setGroupLimit] = useState(GROUP_PAGE);
  const visibleGroups = useMemo(() => groups.slice(0, groupLimit), [groups, groupLimit]);

  useEffect(() => {
    setExpanded(null);
    setGroupLimit(GROUP_PAGE);
    if (letters.length > 0) setActiveLetter(letters[0]);
  }, [filterCat, letters]);

  // IntersectionObserver — logic unchanged, data-letter attribute pattern kept
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          const letter = visible[0].target.dataset.letter;
          setActiveLetter(letter);
          const navEl = navRef.current;
          const pill = navEl?.querySelector(`[data-nav="${letter}"]`);
          if (pill && navEl)
            navEl.scrollTo({
              left: pill.offsetLeft - navEl.offsetWidth / 2 + pill.offsetWidth / 2,
              behavior: 'smooth',
            });
        }
      },
      { threshold: 0.05, rootMargin: '-10% 0px -75% 0px' }
    );
    visibleGroups.forEach(([letter]) => {
      const el = sectionRefs.current[letter];
      if (el) observerRef.current.observe(el);
    });
    return () => observerRef.current?.disconnect();
  }, [visibleGroups]);

  function jumpTo(letter) {
    setActiveLetter(letter);
    const idx = letters.indexOf(letter);
    if (idx >= groupLimit) {
      // Target isn't rendered yet — extend the window past it, then scroll on
      // the next frame once it's in the DOM. 'auto' rather than 'smooth' here:
      // smooth-scrolling to an element that appeared this frame lands short.
      setGroupLimit(idx + 1);
      requestAnimationFrame(() => {
        const el = sectionRefs.current[letter];
        if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 52 });
      });
      return;
    }
    const el = sectionRefs.current[letter];
    if (el) {
      window.scrollTo({
        top: el.getBoundingClientRect().top + window.scrollY - 52,
        behavior: 'smooth',
      });
    }
  }

  // Toggle select mode.
  function toggleSelectMode() {
    setSelectMode((v) => {
      if (v) setSelected(new Set());
      return !v;
    });
    setExportDone(false);
  }

  // Toggle card selection.
  function toggleCard(id, e) {
    e.stopPropagation();
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // Export selected cards as Anki TSV.
  function exportMiniDeck() {
    const cards = sorted.filter((c) => selected.has(c.id));
    if (cards.length === 0) return;
    // Anki TSV: front\tback\ttags
    const rows = cards.map((c) => {
      const cardReading = extractReadings(c.jp);
      const front = `${stripFuri(c.jp)}${cardReading ? `[${cardReading}]` : ''}`;
      const back = `${c.id_text}${c.desc ? `<br>${stripFuri(c.desc)}` : ''}`;
      const tags = `ssw-konstruksi ${c.category}`;
      return `${front}\t${back}\t${tags}`;
    });
    const content = rows.join('\n');
    const blob = new Blob([content], { type: 'text/plain; charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ssw-mini-deck-${cards.length}kartu.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setExportDone(true);
    setTimeout(() => setExportDone(false), 2500);
  }

  // Select all visible.
  function selectAll() {
    setSelected(new Set(sorted.map((c) => c.id)));
  }

  const catMap = useMemo(() => {
    const m = {};
    CATEGORIES.forEach((c) => {
      m[c.key] = c;
    });
    return m;
  }, []);

  return (
    <div className={G.outerWrap}>
      <div className={G.header}>
        {/* Same as CatatanMode: the title lives in ModeHeader now. The count
            pill stays — it's the only place the filtered total is shown. */}
        <div className={`${S.row} ${G.titleRow}`}>
          <span className={`${S.pill} ${G.countPill}`}>{formatCount(sorted.length)} istilah</span>
        </div>
        <div className={G.metaRow}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-8)' }}>
            <p className={G.metaText}>{groups.length} huruf · diurutkan あいうえお</p>
            <button
              onClick={() => setCompactView((v) => !v)}
              style={{
                fontFamily: 'inherit',
                fontSize: 'var(--fs-small)',
                padding: 'var(--space-2) var(--space-8)',
                borderRadius: 99,
                cursor: 'pointer',
                background: compactView ? T.surface : 'rgba(251,191,36,0.15)',
                border: `1px solid ${compactView ? T.border : 'rgba(251,191,36,0.35)'}`,
                color: compactView ? T.textMuted : T.gold,
              }}
            >
              {compactView ? '≡ Kompak' : '⊞ Lebar'}
            </button>
            {/* Select mode toggle */}
            <button
              onClick={toggleSelectMode}
              style={{
                fontFamily: 'inherit',
                fontSize: 'var(--fs-small)',
                padding: 'var(--space-2) var(--space-8)',
                borderRadius: 99,
                cursor: 'pointer',
                background: selectMode ? 'rgba(99,102,241,0.15)' : T.surface,
                border: `1px solid ${selectMode ? 'rgba(99,102,241,0.45)' : T.border}`,
                color: selectMode ? '#818cf8' : T.textMuted,
              }}
            >
              {selectMode ? `✕ Batal (${selected.size})` : '☑ Pilih'}
            </button>
          </div>
        </div>
        <div className={G.filterRow}>
          {[{ key: 'all', label: 'Semua', emoji: '📋' }, ...visibleCats].map((c) => {
            const active = filterCat === c.key;
            const count =
              c.key === 'all'
                ? sorted.length
                : CARDS.filter((card) => card.category === c.key).length;
            return (
              <button
                key={c.key}
                onClick={() => setFilterCat(c.key)}
                className={G.filterBtn}
                style={{
                  background: active ? 'rgba(251,191,36,0.15)' : T.surface,
                  border: `1px solid ${active ? 'rgba(251,191,36,0.35)' : T.border}`,
                  color: active ? T.gold : T.textMuted,
                }}
              >
                <span>{c.emoji}</span>
                {active && <span style={{ opacity: 0.7 }}>{count}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sticky A-Z nav — data-nav attribute kept for IntersectionObserver targeting */}
      <div ref={navRef} className={G.azNav}>
        {letters.map((letter) => {
          const isActive = activeLetter === letter;
          return (
            <button
              key={letter}
              data-nav={letter}
              onClick={() => jumpTo(letter)}
              className={G.azBtn}
              style={{
                fontWeight: isActive ? 800 : 500,
                border: isActive ? '1px solid rgba(251,191,36,0.45)' : '1px solid transparent',
                background: isActive ? 'rgba(251,191,36,0.18)' : 'transparent',
                color: isActive ? T.gold : T.textDim,
              }}
            >
              {letter}
            </button>
          );
        })}
      </div>

      <div className={G.contentWrap}>
        {visibleGroups.map(([letter, items]) => (
          /* data-letter attribute kept for IntersectionObserver */
          <div
            key={letter}
            data-letter={letter}
            ref={(el) => {
              sectionRefs.current[letter] = el;
            }}
          >
            <div className={G.letterHeader}>
              <span className={G.letterLabel}>{letter}</span>
              <span className={G.letterCount}>{items.length}</span>
            </div>
            {items.map((c) => {
              const isOpen = !compactView || expanded === c.id;
              const catInfo = catMap[c.category];
              const isSelected = selectMode && selected.has(c.id);
              return (
                <div
                  key={c.id}
                  onClick={
                    selectMode
                      ? (e) => toggleCard(c.id, e)
                      : () => setExpanded(isOpen ? null : c.id)
                  }
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key !== 'Enter' && e.key !== ' ') return;
                    e.preventDefault();
                    if (selectMode) toggleCard(c.id, e);
                    else setExpanded(isOpen ? null : c.id);
                  }}
                  aria-expanded={!selectMode ? isOpen : undefined}
                  className={G.termRow}
                  style={{
                    background: isSelected
                      ? 'rgba(99,102,241,0.12)'
                      : isOpen
                        ? T.surface
                        : 'transparent',
                    borderLeft: isSelected ? '2px solid #818cf8' : '2px solid transparent',
                  }}
                >
                  <div className={G.termMain}>
                    <div className={G.termLeft}>
                      {selectMode && (
                        <span
                          style={{
                            fontSize: 16,
                            lineHeight: 1,
                            marginRight: 'var(--space-4)',
                            color: isSelected ? '#818cf8' : T.border,
                          }}
                        >
                          {isSelected ? '☑' : '☐'}
                        </span>
                      )}
                      {catInfo && <span className={G.termCatEmoji}>{catInfo.emoji}</span>}
                      <JpFront
                        jp={c.jp}
                        furiganaPolicy={furiganaPolicy}
                        maxSize={JP_LIST_MAX}
                        compact
                      />
                    </div>
                    <span className={G.termId}>{c.id_text}</span>
                  </div>
                  {!selectMode && isOpen && (
                    <div className={G.termDetail}>
                      {audioEnabled && (
                        <div className={G.termFuriRow}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              speakJP(stripFuri(c.jp), { onError: handleSpeakError });
                            }}
                            aria-label="Putar audio"
                            style={{
                              fontFamily: 'inherit',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: 14,
                              padding: '0 var(--space-4)',
                              lineHeight: 1,
                              color: T.textMuted,
                            }}
                          >
                            🔊
                          </button>
                        </div>
                      )}
                      <div className={G.termDesc}>
                        <DescBlock desc={c.desc} />
                      </div>
                      {c.source && (
                        <div className={G.termSourceRow}>
                          <span className={G.termSourcePill}>{c.source}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
        {groupLimit < groups.length && (
          <button
            type="button"
            className={G.loadMore}
            onClick={() => setGroupLimit((n) => n + GROUP_PAGE)}
          >
            Tampilkan huruf berikutnya ({groups.length - groupLimit} tersisa)
          </button>
        )}
      </div>

      {/* Export mini deck footer */}
      {selectMode && (
        <div
          style={{
            position: 'fixed',
            bottom: 56,
            left: 0,
            right: 0,
            zIndex: 'var(--z-sticky)',
            background: T.bg,
            borderTop: `1px solid ${T.border}`,
            padding: 'var(--space-10) var(--space-16)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-8)',
          }}
        >
          <button
            onClick={selectAll}
            style={{
              fontFamily: 'inherit',
              fontSize: 'var(--fs-caption)',
              padding: 'var(--space-6) var(--space-12)',
              borderRadius: 8,
              cursor: 'pointer',
              background: T.surface,
              border: `1px solid ${T.border}`,
              color: T.textMuted,
              flexShrink: 0,
            }}
          >
            Semua ({sorted.length})
          </button>
          <div style={{ flex: 1, fontSize: 'var(--fs-caption)', color: T.textMuted }}>
            {selected.size > 0 ? `${selected.size} kartu dipilih` : 'Tap kartu untuk pilih'}
          </div>
          <button
            onClick={exportMiniDeck}
            disabled={selected.size === 0}
            style={{
              fontFamily: 'inherit',
              fontSize: 'var(--fs-caption)',
              padding: 'var(--space-6) var(--space-14)',
              borderRadius: 8,
              cursor: selected.size === 0 ? 'not-allowed' : 'pointer',
              background: exportDone
                ? 'rgba(34,197,94,0.15)'
                : selected.size > 0
                  ? 'rgba(99,102,241,0.15)'
                  : T.surface,
              border: `1px solid ${exportDone ? 'rgba(34,197,94,0.45)' : selected.size > 0 ? 'rgba(99,102,241,0.45)' : T.border}`,
              color: exportDone ? '#4ade80' : selected.size > 0 ? '#818cf8' : T.border,
              fontWeight: 600,
              flexShrink: 0,
            }}
          >
            {exportDone ? '✓ Diunduh' : '⬇ Ekspor Anki'}
          </button>
        </div>
      )}
    </div>
  );
}
