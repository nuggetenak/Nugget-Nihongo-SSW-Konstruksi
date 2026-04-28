import { useState, useMemo } from 'react';
import { T } from '../styles/theme.js';
import { CARDS } from '../data/cards.js';
import { CATEGORIES } from '../data/categories.js';
import { stripFuri } from '../utils/jp-helpers.js';

export default function GlossaryMode({ onExit }) {
  const [filterCat, setFilterCat] = useState('all');
  const [expanded, setExpanded] = useState(null);

  const sorted = useMemo(() => {
    const items = filterCat === 'all' ? CARDS : CARDS.filter((c) => c.category === filterCat);
    return [...items].sort((a, b) => {
      const aKey = (a.furi || a.romaji || '').toLowerCase();
      const bKey = (b.furi || b.romaji || '').toLowerCase();
      return aKey.localeCompare(bKey, 'ja');
    });
  }, [filterCat]);

  // Group by first character
  const groups = useMemo(() => {
    const map = {};
    sorted.forEach((c) => {
      const key = (c.furi || c.romaji || '?')[0].toUpperCase();
      if (!map[key]) map[key] = [];
      map[key].push(c);
    });
    return Object.entries(map);
  }, [sorted]);

  return (
    <div style={{ padding: '16px 16px 24px', maxWidth: T.maxW, margin: '0 auto' }}>
      <button
        onClick={onExit}
        style={{
          fontFamily: 'inherit',
          fontSize: 12,
          color: T.textMuted,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          marginBottom: 12,
        }}
      >
        ← Kembali
      </button>
      <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>📖 Glosari</h2>
      <p style={{ fontSize: 12, color: T.textDim, marginBottom: 12 }}>
        {sorted.length} istilah terurut
      </p>

      {/* Category Filter */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
        {[
          { key: 'all', label: 'Semua', emoji: '📋' },
          ...CATEGORIES.filter((c) => c.key !== 'all' && c.key !== 'bintang'),
        ].map((c) => (
          <button
            key={c.key}
            onClick={() => setFilterCat(c.key)}
            style={{
              fontFamily: 'inherit',
              fontSize: 10,
              padding: '4px 10px',
              borderRadius: T.r.pill,
              cursor: 'pointer',
              background: filterCat === c.key ? 'rgba(251,191,36,0.15)' : T.surface,
              border: `1px solid ${filterCat === c.key ? 'rgba(251,191,36,0.35)' : T.border}`,
              color: filterCat === c.key ? T.gold : T.textMuted,
            }}
          >
            {c.emoji}
          </button>
        ))}
      </div>

      {/* Glossary List */}
      {groups.map(([letter, items]) => (
        <div key={letter}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 800,
              color: T.gold,
              padding: '8px 0 4px',
              borderBottom: `1px solid ${T.border}`,
              marginBottom: 4,
            }}
          >
            {letter}
          </div>
          {items.map((c) => {
            const isOpen = expanded === c.id;
            return (
              <div
                key={c.id}
                onClick={() => setExpanded(isOpen ? null : c.id)}
                style={{
                  padding: '8px 10px',
                  cursor: 'pointer',
                  borderBottom: `1px solid ${T.border}`,
                  background: isOpen ? T.surface : 'transparent',
                }}
              >
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <span style={{ fontFamily: T.fontJP, fontSize: 13 }}>{stripFuri(c.jp)}</span>
                  <span style={{ fontSize: 12, color: T.textMuted }}>{c.id_text}</span>
                </div>
                {isOpen && (
                  <div style={{ marginTop: 6, fontSize: 11, color: T.textMuted, lineHeight: 1.5 }}>
                    {c.furi && (
                      <div style={{ color: T.textDim, fontFamily: T.fontJP, marginBottom: 2 }}>
                        {c.furi} · {c.romaji}
                      </div>
                    )}
                    {c.desc}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
