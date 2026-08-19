import { useState, useMemo, useCallback } from 'react';
import { T } from '../styles/theme.js';
import { stripFuri, extractReadings } from '../utils/jp-helpers.js';
import { CARDS } from '../data/cards.js';
import { getCatInfo, getCatsForTrack } from '../data/categories.js';
import { useDebounce } from '../hooks/useDebounce.js';
import { get as storageGet } from '../storage/engine.js';
import { getWrongCount } from '../utils/wrong-tracker.js';
import S from './modes.module.css';

const HISTORY_KEY = 'ssw-search-history';
const MAX_HISTORY = 5;

function getHistory() {
  try {
    return JSON.parse(sessionStorage.getItem(HISTORY_KEY) || '[]');
  } catch {
    return [];
  }
}
function saveHistory(term) {
  if (!term || term.length < 2) return;
  const prev = getHistory().filter((h) => h !== term);
  sessionStorage.setItem(HISTORY_KEY, JSON.stringify([term, ...prev].slice(0, MAX_HISTORY)));
}

export default function SearchMode({ onExit, track, starred, toggleStar }) {
  const [query, setQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null); // copy feedback per card
  const debouncedQuery = useDebounce(query, 120);
  const [showAllTracks, setShowAllTracks] = useState(false);
  const [history, setHistory] = useState(() => getHistory());

  // User accuracy data — loaded once on mount (static snapshot fine for search).
  const progressData = useMemo(() => storageGet('progress') ?? {}, []);

  const trackCatKeys = useMemo(() => (track ? new Set(getCatsForTrack(track)) : null), [track]);

  // Copy card text to clipboard.
  const handleCopy = useCallback((c, e) => {
    e.stopPropagation();
    const reading = extractReadings(c.jp);
    const text = `${stripFuri(c.jp)}${reading ? ` (${reading})` : ''} — ${c.id_text}`;
    navigator.clipboard
      ?.writeText(text)
      .then(() => {
        setCopiedId(c.id);
        setTimeout(() => setCopiedId(null), 1500);
      })
      .catch(() => {});
  }, []);

  const handleQueryChange = useCallback((val) => {
    setQuery(val);
  }, []);

  const handleQueryBlur = useCallback(() => {
    const q = query.trim();
    if (q.length >= 2) {
      saveHistory(q);
      setHistory(getHistory());
    }
  }, [query]);

  const applyHistory = useCallback((term) => {
    setQuery(term);
  }, []);

  const pool = useMemo(() => {
    if (!trackCatKeys || showAllTracks) return CARDS;
    return CARDS.filter((c) => trackCatKeys.has(c.category));
  }, [trackCatKeys, showAllTracks]);

  const results = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    if (q.length < 2) return [];
    return pool
      .filter((c) => {
        const haystack =
          `${c.jp} ${extractReadings(c.jp) || ''} ${c.id_text} ${c.desc}`.toLowerCase();
        return haystack.includes(q);
      })
      .slice(0, 30);
  }, [debouncedQuery, pool]);

  return (
    <div className={S.page} style={{ paddingTop: 16, paddingBottom: 24 }}>
      <div className={S.rowSpread} style={{ marginBottom: 12 }}>
        <button className={S.btnBack} style={{ marginBottom: 0 }} onClick={onExit}>
          ← Kembali
        </button>
        {trackCatKeys && (
          <button
            onClick={() => setShowAllTracks((v) => !v)}
            style={{
              fontFamily: 'inherit',
              fontSize: 11,
              padding: '5px 10px',
              borderRadius: 99,
              background: showAllTracks ? T.surface : T.surfaceActive,
              border: `1px solid ${showAllTracks ? T.border : T.borderActive}`,
              color: showAllTracks ? T.textMuted : T.amber,
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            {showAllTracks ? '🗂 Semua jalur' : '🗂 Jalurku'}
          </button>
        )}
      </div>

      <input
        type="text"
        value={query}
        onChange={(e) => handleQueryChange(e.target.value)}
        onBlur={handleQueryBlur}
        placeholder="Cari kartu... (JP, furigana, atau Indonesia)"
        autoFocus
        className={S.searchInput}
        style={{ width: '100%', marginBottom: 16 }}
      />

      {/* Search history — show when input empty */}
      {debouncedQuery.length < 2 && history.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: T.textMuted,
              letterSpacing: 1.2,
              textTransform: 'uppercase',
              marginBottom: 6,
            }}
          >
            Pencarian terakhir
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {history.map((h) => (
              <button
                key={h}
                onClick={() => applyHistory(h)}
                style={{
                  fontFamily: 'inherit',
                  fontSize: 12,
                  padding: '4px 10px',
                  borderRadius: 99,
                  background: T.surface,
                  border: `1px solid ${T.border}`,
                  color: T.textDim,
                  cursor: 'pointer',
                }}
              >
                🕐 {h}
              </button>
            ))}
          </div>
        </div>
      )}

      {debouncedQuery.length >= 2 && (
        <div className={S.searchMeta}>
          {results.length} hasil {results.length >= 30 && '(maks 30)'} · dari {pool.length} kartu
        </div>
      )}

      {debouncedQuery.length < 2 && (
        <div className={S.emptyInMode}>
          <div className={S.emptyIcon}>🔍</div>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>Cari kosakata</div>
          <div style={{ fontSize: 12, color: T.textMuted }}>
            Coba ketik <strong>denki</strong> atau <strong>電気</strong> atau{' '}
            <strong>listrik</strong>
          </div>
        </div>
      )}

      {debouncedQuery.length >= 2 && results.length === 0 && (
        <div className={S.emptyInMode}>
          <div className={S.emptyIcon}>😕</div>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>Tidak ditemukan</div>
          <div style={{ fontSize: 12, color: T.textMuted }}>Coba kata lain atau furigana</div>
        </div>
      )}

      <div className={S.list}>
        {results.map((c) => {
          const cat = getCatInfo(c.category);
          // User accuracy for this card.
          const wrongCount = getWrongCount(progressData?.quizWrong?.[c.id]);
          const isKnown = (progressData?.known ?? []).includes(c.id);
          return (
            <div key={c.id} className={S.card} style={{ padding: '12px 14px' }}>
              <div className={S.rowSpread} style={{ alignItems: 'flex-start' }}>
                <div style={{ fontFamily: T.fontJP, fontSize: 15, fontWeight: 600 }}>
                  {stripFuri(c.jp)}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {toggleStar && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStar(c.id);
                      }}
                      aria-label={starred?.has(c.id) ? 'Hapus bintang' : 'Beri bintang'}
                      style={{
                        fontFamily: 'inherit',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: 16,
                        padding: '0 2px',
                        lineHeight: 1,
                      }}
                    >
                      {starred?.has(c.id) ? '⭐' : '☆'}
                    </button>
                  )}
                  {/* Copy to clipboard */}
                  <button
                    onClick={(e) => handleCopy(c, e)}
                    aria-label="Salin ke clipboard"
                    style={{
                      fontFamily: 'inherit',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: 13,
                      padding: '0 2px',
                      lineHeight: 1,
                      color: copiedId === c.id ? T.correct : T.textMuted,
                    }}
                  >
                    {copiedId === c.id ? '✓' : '⎘'}
                  </button>
                  <span
                    className={S.pill}
                    style={{
                      background: `${cat.color}22`,
                      color: cat.color,
                      fontSize: 9,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {cat.emoji}
                  </span>
                </div>
              </div>
              {extractReadings(c.jp) && (
                <div style={{ fontSize: 11, color: T.textDim, fontFamily: T.fontJP }}>
                  {extractReadings(c.jp)}
                </div>
              )}
              <div style={{ fontSize: 13, color: T.gold, marginTop: 4 }}>{c.id_text}</div>
              {c.desc && (
                <div style={{ fontSize: 11, color: T.textMuted, marginTop: 4, lineHeight: 1.5 }}>
                  {c.desc.slice(0, 100)}
                  {c.desc.length > 100 ? '…' : ''}
                </div>
              )}
              {/* User accuracy badge */}
              <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                {isKnown && (
                  <span
                    className={S.pill}
                    style={{
                      fontSize: 9,
                      background: 'rgba(34,197,94,0.1)',
                      color: T.correct,
                      border: '1px solid rgba(34,197,94,0.25)',
                    }}
                  >
                    ✓ Hafal
                  </span>
                )}
                {wrongCount > 0 && (
                  <span
                    className={S.pill}
                    style={{
                      fontSize: 9,
                      background: 'rgba(220,38,38,0.08)',
                      color: T.wrong,
                      border: '1px solid rgba(220,38,38,0.2)',
                    }}
                  >
                    ⚠ {wrongCount}× salah
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
