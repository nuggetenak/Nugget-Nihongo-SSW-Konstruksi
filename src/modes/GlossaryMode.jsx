import { useState, useMemo, useRef, useEffect } from 'react';
import { T } from '../styles/theme.js';
import { CARDS } from '../data/cards.js';
import { CATEGORIES } from '../data/categories.js';
import { stripFuri } from '../utils/jp-helpers.js';

export default function GlossaryMode({ onExit }) {
  const [filterCat, setFilterCat] = useState('all');
  const [expanded, setExpanded] = useState(null);
  const [activeLetter, setActiveLetter] = useState(null);
  const navRef = useRef(null);
  const sectionRefs = useRef({});
  const observerRef = useRef(null);

  // ── Sorted + grouped data ────────────────────────────────────────────────
  const sorted = useMemo(() => {
    const items = filterCat === 'all' ? CARDS : CARDS.filter((c) => c.category === filterCat);
    return [...items].sort((a, b) => {
      const aKey = (a.furi || a.romaji || '').toLowerCase();
      const bKey = (b.furi || b.romaji || '').toLowerCase();
      return aKey.localeCompare(bKey, 'ja');
    });
  }, [filterCat]);

  const groups = useMemo(() => {
    const map = {};
    sorted.forEach((c) => {
      const key = (c.furi || c.romaji || '?')[0];
      if (!map[key]) map[key] = [];
      map[key].push(c);
    });
    return Object.entries(map);
  }, [sorted]);

  const letters = useMemo(() => groups.map(([l]) => l), [groups]);

  // ── Reset on filter change ───────────────────────────────────────────────
  useEffect(() => {
    setExpanded(null);
    if (letters.length > 0) setActiveLetter(letters[0]);
  }, [filterCat, letters]);

  // ── IntersectionObserver: track which section is in view ─────────────────
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Pick the topmost visible section
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          const letter = visible[0].target.dataset.letter;
          setActiveLetter(letter);
          // Auto-scroll the nav pill into view
          const navEl = navRef.current;
          const pill = navEl?.querySelector(`[data-nav="${letter}"]`);
          if (pill && navEl) {
            const pillLeft = pill.offsetLeft;
            const pillW = pill.offsetWidth;
            const navW = navEl.offsetWidth;
            navEl.scrollTo({
              left: pillLeft - navW / 2 + pillW / 2,
              behavior: 'smooth',
            });
          }
        }
      },
      { threshold: 0.05, rootMargin: '-10% 0px -75% 0px' }
    );

    groups.forEach(([letter]) => {
      const el = sectionRefs.current[letter];
      if (el) observerRef.current.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, [groups]);

  // ── Jump to section ──────────────────────────────────────────────────────
  function jumpTo(letter) {
    const el = sectionRefs.current[letter];
    if (el) {
      // Offset for sticky nav (~48px header strip)
      const y = el.getBoundingClientRect().top + window.scrollY - 52;
      window.scrollTo({ top: y, behavior: 'smooth' });
      setActiveLetter(letter);
    }
  }

  // ── Category metadata lookup ─────────────────────────────────────────────
  const catMap = useMemo(() => {
    const m = {};
    CATEGORIES.forEach((c) => {
      m[c.key] = c;
    });
    return m;
  }, []);

  return (
    <div style={{ paddingBottom: 88 }}>
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div style={{ padding: '16px 16px 10px', maxWidth: T.maxW, margin: '0 auto' }}>
        <button
          onClick={onExit}
          style={{
            fontFamily: 'inherit',
            fontSize: 12,
            color: T.textMuted,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            marginBottom: 10,
            padding: 0,
          }}
        >
          ← Kembali
        </button>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 2 }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>📖 Glosari</h2>
          <span
            style={{
              fontSize: 11,
              color: T.textDim,
              background: T.surface,
              border: `1px solid ${T.border}`,
              borderRadius: T.r.pill,
              padding: '1px 8px',
            }}
          >
            {sorted.length} istilah
          </span>
        </div>
        <p style={{ fontSize: 11, color: T.textDim, margin: '0 0 12px' }}>
          {groups.length} huruf · diurutkan あいうえお
        </p>

        {/* Category filter pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {[
            { key: 'all', label: 'Semua', emoji: '📋' },
            ...CATEGORIES.filter((c) => c.key !== 'all' && c.key !== 'bintang'),
          ].map((c) => {
            const active = filterCat === c.key;
            const count =
              c.key === 'all'
                ? CARDS.length
                : CARDS.filter((card) => card.category === c.key).length;
            return (
              <button
                key={c.key}
                onClick={() => setFilterCat(c.key)}
                style={{
                  fontFamily: 'inherit',
                  fontSize: 10,
                  padding: '3px 10px',
                  borderRadius: T.r.pill,
                  cursor: 'pointer',
                  background: active ? 'rgba(251,191,36,0.15)' : T.surface,
                  border: `1px solid ${active ? 'rgba(251,191,36,0.35)' : T.border}`,
                  color: active ? T.gold : T.textMuted,
                  transition: 'all 0.12s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <span>{c.emoji}</span>
                {active && <span style={{ opacity: 0.7 }}>{count}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Sticky A-Z Nav Strip ─────────────────────────────────────────── */}
      <div
        ref={navRef}
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          overflowX: 'auto',
          display: 'flex',
          gap: 2,
          padding: '5px 12px',
          background: T.bg,
          borderTop: `1px solid ${T.border}`,
          borderBottom: `1px solid ${T.border}`,
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {letters.map((letter) => {
          const isActive = activeLetter === letter;
          return (
            <button
              key={letter}
              data-nav={letter}
              onClick={() => jumpTo(letter)}
              style={{
                flexShrink: 0,
                fontFamily: T.fontJP,
                fontSize: 12,
                fontWeight: isActive ? 800 : 500,
                minWidth: 28,
                height: 28,
                borderRadius: T.r.sm,
                cursor: 'pointer',
                border: isActive ? `1px solid rgba(251,191,36,0.45)` : '1px solid transparent',
                background: isActive ? 'rgba(251,191,36,0.18)' : 'transparent',
                color: isActive ? T.gold : T.textDim,
                transition: 'all 0.15s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {letter}
            </button>
          );
        })}
      </div>

      {/* ── Glossary Sections ────────────────────────────────────────────── */}
      <div style={{ maxWidth: T.maxW, margin: '0 auto', padding: '0 0 8px' }}>
        {groups.map(([letter, items]) => (
          <div
            key={letter}
            data-letter={letter}
            ref={(el) => {
              sectionRefs.current[letter] = el;
            }}
          >
            {/* Section header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 16px 5px',
                borderBottom: `1px solid ${T.borderLight}`,
                marginTop: 2,
              }}
            >
              <span
                style={{
                  fontFamily: T.fontJP,
                  fontSize: 15,
                  fontWeight: 900,
                  color: T.gold,
                  letterSpacing: '0.02em',
                }}
              >
                {letter}
              </span>
              <span
                style={{
                  fontSize: 10,
                  color: T.textFaint,
                  background: T.surface,
                  border: `1px solid ${T.border}`,
                  borderRadius: T.r.pill,
                  padding: '1px 7px',
                }}
              >
                {items.length}
              </span>
            </div>

            {/* Cards in this section */}
            {items.map((c) => {
              const isOpen = expanded === c.id;
              const catInfo = catMap[c.category];
              return (
                <div
                  key={c.id}
                  onClick={() => setExpanded(isOpen ? null : c.id)}
                  style={{
                    padding: '9px 16px',
                    cursor: 'pointer',
                    borderBottom: `1px solid ${T.border}`,
                    background: isOpen ? T.surface : 'transparent',
                    transition: 'background 0.12s',
                  }}
                >
                  {/* Row: JP term + Indonesian translation */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 10,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
                      {catInfo && (
                        <span style={{ fontSize: 11, flexShrink: 0, opacity: 0.6 }}>
                          {catInfo.emoji}
                        </span>
                      )}
                      <span
                        style={{
                          fontFamily: T.fontJP,
                          fontSize: 14,
                          fontWeight: 600,
                          color: T.text,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {stripFuri(c.jp)}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: 11,
                        color: T.textMuted,
                        flexShrink: 0,
                        textAlign: 'right',
                        maxWidth: '45%',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {c.id_text}
                    </span>
                  </div>

                  {/* Expanded detail */}
                  {isOpen && (
                    <div
                      style={{
                        marginTop: 8,
                        paddingTop: 8,
                        borderTop: `1px solid ${T.border}`,
                        animation: 'fadeIn 0.15s ease',
                      }}
                    >
                      {/* Reading + romaji */}
                      {(c.furi || c.romaji) && (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            marginBottom: 6,
                          }}
                        >
                          {c.furi && (
                            <span
                              style={{
                                fontFamily: T.fontJP,
                                fontSize: 12,
                                color: T.amber,
                                fontWeight: 600,
                              }}
                            >
                              {c.furi}
                            </span>
                          )}
                          {c.furi && c.romaji && (
                            <span style={{ fontSize: 10, color: T.textFaint }}>·</span>
                          )}
                          {c.romaji && (
                            <span style={{ fontSize: 11, color: T.textDim, fontStyle: 'italic' }}>
                              {c.romaji}
                            </span>
                          )}
                        </div>
                      )}
                      {/* Description */}
                      <p
                        style={{
                          fontSize: 12,
                          color: T.textMuted,
                          lineHeight: 1.6,
                          margin: 0,
                        }}
                      >
                        {c.desc}
                      </p>
                      {/* Source tag */}
                      {c.source && (
                        <div style={{ marginTop: 6 }}>
                          <span
                            style={{
                              fontSize: 9,
                              color: T.textFaint,
                              background: T.surface,
                              border: `1px solid ${T.border}`,
                              borderRadius: T.r.pill,
                              padding: '1px 6px',
                            }}
                          >
                            {c.source}
                          </span>
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
