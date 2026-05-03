import { useState, useMemo } from 'react';
import { T } from '../styles/theme.js';
import { stripFuri } from '../utils/jp-helpers.js';
import { CARDS } from '../data/cards.js';
import { getCatInfo, getCatsForTrack } from '../data/categories.js';
import S from './modes.module.css';

export default function SearchMode({ onExit, track }) {
  const [query, setQuery] = useState('');
  const [showAllTracks, setShowAllTracks] = useState(false);

  const trackCatKeys = useMemo(() => track ? new Set(getCatsForTrack(track)) : null, [track]);

  const pool = useMemo(() => {
    if (!trackCatKeys || showAllTracks) return CARDS;
    return CARDS.filter((c) => trackCatKeys.has(c.category));
  }, [trackCatKeys, showAllTracks]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return pool.filter((c) => {
      const haystack = `${c.jp} ${c.furi || ''} ${c.romaji || ''} ${c.id_text} ${c.desc}`.toLowerCase();
      return haystack.includes(q);
    }).slice(0, 30);
  }, [query, pool]);

  return (
    <div className={S.page} style={{ paddingTop: 16, paddingBottom: 24 }}>
      <div className={S.rowSpread} style={{ marginBottom: 12 }}>
        <button className={S.btnBack} style={{ marginBottom: 0 }} onClick={onExit}>← Kembali</button>
        {trackCatKeys && (
          <button
            onClick={() => setShowAllTracks((v) => !v)}
            style={{ fontFamily: 'inherit', fontSize: 11, padding: '5px 10px', borderRadius: 99, background: showAllTracks ? T.surface : T.surfaceActive, border: `1px solid ${showAllTracks ? T.border : T.borderActive}`, color: showAllTracks ? T.textMuted : T.amber, cursor: 'pointer', fontWeight: 600 }}
          >
            {showAllTracks ? '🗂 Semua jalur' : '🗂 Jalurku'}
          </button>
        )}
      </div>

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Cari kartu... (JP, romaji, atau Indonesia)"
        autoFocus
        className={S.searchInput}
        style={{ width: '100%', marginBottom: 16 }}
      />

      {query.length >= 2 && (
        <div className={S.searchMeta}>
          {results.length} hasil {results.length >= 30 && '(maks 30)'} · dari {pool.length} kartu
        </div>
      )}

      {query.length < 2 && (
        <div className={S.emptyInMode}>
          <div className={S.emptyIcon}>🔍</div>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>Cari kosakata</div>
          <div style={{ fontSize: 12, color: T.textMuted }}>
            Coba ketik <strong>denki</strong> atau <strong>電気</strong> atau <strong>listrik</strong>
          </div>
        </div>
      )}

      {query.length >= 2 && results.length === 0 && (
        <div className={S.emptyInMode}>
          <div className={S.emptyIcon}>😕</div>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>Tidak ditemukan</div>
          <div style={{ fontSize: 12, color: T.textMuted }}>Coba kata lain atau romaji</div>
        </div>
      )}

      <div className={S.list}>
        {results.map((c) => {
          const cat = getCatInfo(c.category);
          return (
            <div key={c.id} className={S.card} style={{ padding: '12px 14px' }}>
              <div className={S.rowSpread} style={{ alignItems: 'flex-start' }}>
                <div style={{ fontFamily: T.fontJP, fontSize: 15, fontWeight: 600 }}>
                  {stripFuri(c.jp)}
                </div>
                <span className={S.pill} style={{ background: `${cat.color}22`, color: cat.color, fontSize: 9, whiteSpace: 'nowrap' }}>
                  {cat.emoji}
                </span>
              </div>
              {c.furi && <div style={{ fontSize: 11, color: T.textDim, fontFamily: T.fontJP }}>{c.furi}</div>}
              <div style={{ fontSize: 13, color: T.gold, marginTop: 4 }}>{c.id_text}</div>
              {c.desc && (
                <div style={{ fontSize: 11, color: T.textMuted, marginTop: 4, lineHeight: 1.5 }}>
                  {c.desc.slice(0, 100)}{c.desc.length > 100 ? '…' : ''}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
