import { useState, useMemo } from 'react';
import { T } from '../styles/theme.js';
import { stripFuri } from '../utils/jp-helpers.js';
import { CARDS } from '../data/cards.js';
import { getCatInfo } from '../data/categories.js';

export default function SearchMode({ onExit }) {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return CARDS.filter((c) => {
      const haystack =
        `${c.jp} ${c.furi || ''} ${c.romaji || ''} ${c.id_text} ${c.desc}`.toLowerCase();
      return haystack.includes(q);
    }).slice(0, 30);
  }, [query]);

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
          marginBottom: 16,
        }}
      >
        ← Kembali
      </button>

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Cari kartu... (JP, romaji, atau Indonesia)"
        autoFocus
        style={{
          width: '100%',
          padding: '12px 14px',
          fontSize: 14,
          fontFamily: 'inherit',
          borderRadius: T.r.md,
          background: T.surface,
          border: `1px solid ${T.borderLight}`,
          color: T.text,
          outline: 'none',
          boxSizing: 'border-box',
          marginBottom: 16,
        }}
      />

      {query.length >= 2 && (
        <div style={{ fontSize: 12, color: T.textDim, marginBottom: 12 }}>
          {results.length} hasil {results.length >= 30 && '(maks 30)'}
        </div>
      )}

      {/* Zero-query prompt */}
      {query.length < 2 && (
        <div style={{ padding: '40px 0', textAlign: 'center', animation: 'fadeIn 0.3s ease' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>Cari kosakata</div>
          <div style={{ fontSize: 12, color: T.textMuted }}>
            Coba ketik <strong>denki</strong> atau <strong>電気</strong> atau{' '}
            <strong>listrik</strong>
          </div>
        </div>
      )}

      {/* No results */}
      {query.length >= 2 && results.length === 0 && (
        <div style={{ padding: '40px 0', textAlign: 'center', animation: 'fadeIn 0.2s ease' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>😕</div>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>Tidak ditemukan</div>
          <div style={{ fontSize: 12, color: T.textMuted }}>Coba kata lain atau romaji</div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {results.map((c) => {
          const cat = getCatInfo(c.category);
          return (
            <div
              key={c.id}
              style={{
                padding: '12px 14px',
                borderRadius: T.r.md,
                background: T.surface,
                border: `1px solid ${T.border}`,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <div style={{ fontFamily: T.fontJP, fontSize: 15, fontWeight: 600 }}>
                  {stripFuri(c.jp)}
                </div>
                <span
                  style={{
                    fontSize: 9,
                    padding: '2px 6px',
                    borderRadius: T.r.pill,
                    background: `${cat.color}22`,
                    color: cat.color,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {cat.emoji}
                </span>
              </div>
              {c.furi && (
                <div style={{ fontSize: 11, color: T.textDim, fontFamily: T.fontJP }}>{c.furi}</div>
              )}
              <div style={{ fontSize: 13, color: T.gold, marginTop: 4 }}>{c.id_text}</div>
              {c.desc && (
                <div style={{ fontSize: 11, color: T.textMuted, marginTop: 4, lineHeight: 1.5 }}>
                  {c.desc.slice(0, 100)}
                  {c.desc.length > 100 ? '…' : ''}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
