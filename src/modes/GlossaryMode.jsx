// ─── GlossaryMode.jsx ─────────────────────────────────────────────────────────
// Note: IntersectionObserver logic unchanged. data-nav / data-letter attributes kept.
// Note: azBtn active bg/border/color/fontWeight are dynamic (isActive), kept inline.
// Note: filterBtn active bg/border/color are dynamic, kept inline.
// Note: trackToggle bg/border/color are dynamic (showAllTracks), kept inline.
// Note: termRow bg is dynamic (isOpen), kept inline.
import { useState, useMemo, useRef, useEffect } from 'react';
import { T } from '../styles/theme.js';
import { CARDS } from '../data/cards.js';
import { CATEGORIES, getCatsForTrack } from '../data/categories.js';
import { stripFuri } from '../utils/jp-helpers.js';
import S from './modes.module.css';
import G from './GlossaryMode.module.css';

export default function GlossaryMode({ onExit, track }) {
  const [filterCat, setFilterCat] = useState('all');
  const [showAllTracks, setShowAllTracks] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [activeLetter, setActiveLetter] = useState(null);
  const navRef = useRef(null);
  const sectionRefs = useRef({});
  const observerRef = useRef(null);

  const trackCatKeys = useMemo(() => track ? new Set(getCatsForTrack(track)) : null, [track]);
  const visibleCats = useMemo(() => {
    const base = CATEGORIES.filter((c) => c.key !== 'all' && c.key !== 'bintang');
    if (!trackCatKeys || showAllTracks) return base;
    return base.filter((c) => trackCatKeys.has(c.key));
  }, [trackCatKeys, showAllTracks]);

  const sorted = useMemo(() => {
    let items;
    if (filterCat === 'all') {
      items = trackCatKeys && !showAllTracks
        ? CARDS.filter((c) => trackCatKeys.has(c.category))
        : CARDS;
    } else {
      items = CARDS.filter((c) => c.category === filterCat);
    }
    return [...items].sort((a, b) => (a.furi || '').toLowerCase().localeCompare((b.furi || '').toLowerCase(), 'ja'));
  }, [filterCat, trackCatKeys, showAllTracks]);

  const groups = useMemo(() => {
    const map = {};
    sorted.forEach((c) => { const key = (c.furi || '?')[0]; if (!map[key]) map[key] = []; map[key].push(c); });
    return Object.entries(map);
  }, [sorted]);

  const letters = useMemo(() => groups.map(([l]) => l), [groups]);

  useEffect(() => { setExpanded(null); if (letters.length > 0) setActiveLetter(letters[0]); }, [filterCat, letters]);

  // IntersectionObserver — logic unchanged, data-letter attribute pattern kept
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          const letter = visible[0].target.dataset.letter;
          setActiveLetter(letter);
          const navEl = navRef.current;
          const pill = navEl?.querySelector(`[data-nav="${letter}"]`);
          if (pill && navEl) navEl.scrollTo({ left: pill.offsetLeft - navEl.offsetWidth / 2 + pill.offsetWidth / 2, behavior: 'smooth' });
        }
      },
      { threshold: 0.05, rootMargin: '-10% 0px -75% 0px' }
    );
    groups.forEach(([letter]) => { const el = sectionRefs.current[letter]; if (el) observerRef.current.observe(el); });
    return () => observerRef.current?.disconnect();
  }, [groups]);

  function jumpTo(letter) {
    const el = sectionRefs.current[letter];
    if (el) { window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 52, behavior: 'smooth' }); setActiveLetter(letter); }
  }

  const catMap = useMemo(() => { const m = {}; CATEGORIES.forEach((c) => { m[c.key] = c; }); return m; }, []);

  return (
    <div className={G.outerWrap}>
      <div className={G.header}>
        <button className={S.btnBack} style={{ padding: 0 }} onClick={onExit}>← Kembali</button>
        <div className={`${S.row} ${G.titleRow}`}>
          <h2 className={G.title}>📖 Glosari</h2>
          <span className={`${S.pill} ${G.countPill}`}>{sorted.length} istilah</span>
        </div>
        <div className={G.metaRow}>
          <p className={G.metaText}>{groups.length} huruf · diurutkan あいうえお</p>
          {trackCatKeys && (
            <button
              onClick={() => { setShowAllTracks((v) => !v); setFilterCat('all'); }}
              className={G.trackToggle}
              style={{
                background: showAllTracks ? 'rgba(251,191,36,0.15)' : T.surface,
                border: `1px solid ${showAllTracks ? 'rgba(251,191,36,0.35)' : T.border}`,
                color: showAllTracks ? T.gold : T.textDim,
              }}
            >
              {showAllTracks ? '🗂 Semua jalur' : '🗂 Jalurku'}
            </button>
          )}
        </div>
        <div className={G.filterRow}>
          {[{ key: 'all', label: 'Semua', emoji: '📋' }, ...visibleCats].map((c) => {
            const active = filterCat === c.key;
            const count = c.key === 'all' ? sorted.length : CARDS.filter((card) => card.category === c.key).length;
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
        {groups.map(([letter, items]) => (
          /* data-letter attribute kept for IntersectionObserver */
          <div key={letter} data-letter={letter} ref={(el) => { sectionRefs.current[letter] = el; }}>
            <div className={G.letterHeader}>
              <span className={G.letterLabel}>{letter}</span>
              <span className={G.letterCount}>{items.length}</span>
            </div>
            {items.map((c) => {
              const isOpen = expanded === c.id;
              const catInfo = catMap[c.category];
              return (
                <div
                  key={c.id}
                  onClick={() => setExpanded(isOpen ? null : c.id)}
                  className={G.termRow}
                  style={{ background: isOpen ? T.surface : 'transparent' }}
                >
                  <div className={G.termMain}>
                    <div className={G.termLeft}>
                      {catInfo && <span className={G.termCatEmoji}>{catInfo.emoji}</span>}
                      <span className={G.termJp}>{stripFuri(c.jp)}</span>
                    </div>
                    <span className={G.termId}>{c.id_text}</span>
                  </div>
                  {isOpen && (
                    <div className={G.termDetail}>
                      {c.furi && (
                        <div className={G.termFuriRow}>
                          <span className={G.termFuri}>{c.furi}</span>
                        </div>
                      )}
                      <p className={G.termDesc}>{c.desc}</p>
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
      </div>
    </div>
  );
}
