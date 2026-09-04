import { useState, useMemo, useCallback } from 'react';
import { T } from '../styles/theme.js';
import { stripFuri, extractReadings, JP_LIST_MAX } from '../utils/jp-helpers.js';
import { CARDS } from '../data/cards.js';
import { getCatInfo, getCatsForTrack } from '../data/categories.js';
import { useDebounce } from '../hooks/useDebounce.js';
import { useApp } from '../contexts/AppContext.jsx';
import { get as storageGet } from '../storage/engine.js';
import { getWrongCount } from '../utils/wrong-tracker.js';
import { formatCount } from '../utils/format.js';
import { JpFront } from '../components/JpDisplay.jsx';
import EmptyState from '../components/EmptyState.jsx';
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

export default function SearchMode({ track, starred, toggleStar }) {
  const { prefs } = useApp();
  const furiganaPolicy = prefs?.furiganaPolicy ?? 'always';
  const [query, setQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null); // copy feedback per card
  const debouncedQuery = useDebounce(query, 120);
  // showAllTracks removed 2026-09-04. It toggled between "cards in my track" and
  // "all cards" — but every category in categories.js carries tracks:
  // ['lifeline'], so getCatsForTrack('lifeline') returns all 11 content
  // categories and both sides of the toggle produced the identical set. A
  // control that cannot change what it claims to change, shown in two modes,
  // left over from when Doboku and Kenchiku existed (removed session 24).
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
    if (!trackCatKeys) return CARDS;
    return CARDS.filter((c) => trackCatKeys.has(c.category));
  }, [trackCatKeys]);

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
    <div className={`${S.page} ${S.pageTight}`}>
      <input
        type="text"
        aria-label="Cari kartu"
        value={query}
        onChange={(e) => handleQueryChange(e.target.value)}
        onBlur={handleQueryBlur}
        placeholder="Cari kartu... (JP, furigana, atau Indonesia)"
        autoFocus
        // Declares the intent to ModeRouter's mode-change focus effect, which
        // otherwise moves focus to the mode's <h1>. Without it the right thing
        // still happened, but only by timing: the effect fired before this lazy
        // chunk had mounted, so React's autoFocus won by arriving second.
        data-autofocus
        className={S.searchInput}
        style={{ width: '100%', marginBottom: 'var(--space-16)' }}
      />

      {/* Search history — show when input empty */}
      {debouncedQuery.length < 2 && history.length > 0 && (
        <div style={{ marginBottom: 'var(--space-12)' }}>
          <div
            style={{
              fontSize: 'var(--fs-micro)',
              fontWeight: 700,
              color: T.textMuted,
              letterSpacing: 1.2,
              textTransform: 'uppercase',
              marginBottom: 'var(--space-6)',
            }}
          >
            Pencarian terakhir
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-6)' }}>
            {history.map((h) => (
              <button
                key={h}
                onClick={() => applyHistory(h)}
                style={{
                  fontFamily: 'inherit',
                  fontSize: 'var(--fs-caption)',
                  padding: 'var(--space-4) var(--space-10)',
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
          {results.length} hasil {results.length >= 30 && '(maks 30)'} · dari{' '}
          {formatCount(pool.length)} kartu
        </div>
      )}

      {debouncedQuery.length < 2 && (
        <EmptyState
          icon="🔍"
          title="Cari kosakata"
          desc={
            <>
              Coba ketik <strong>denki</strong> atau <strong>電気</strong> atau{' '}
              <strong>listrik</strong>
            </>
          }
        />
      )}

      {debouncedQuery.length >= 2 && results.length === 0 && (
        <EmptyState.SearchEmpty query={debouncedQuery} />
      )}

      <div className={S.list}>
        {results.map((c) => {
          const cat = getCatInfo(c.category);
          // User accuracy for this card.
          const wrongCount = getWrongCount(progressData?.quizWrong?.[c.id]);
          const isKnown = (progressData?.known ?? []).includes(c.id);
          return (
            <div
              key={c.id}
              className={S.card}
              style={{ padding: 'var(--space-12) var(--space-14)' }}
            >
              <div className={S.rowSpread} style={{ alignItems: 'flex-start' }}>
                <div style={{ fontSize: 'var(--fs-subtitle)', fontWeight: 600 }}>
                  <JpFront
                    jp={c.jp}
                    furiganaPolicy={furiganaPolicy}
                    maxSize={JP_LIST_MAX}
                    compact
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)' }}>
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
                        fontSize: '1rem',
                        padding: '0 var(--space-2)',
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
                      fontSize: 'var(--fs-body)',
                      padding: '0 var(--space-2)',
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
                      fontSize: 'var(--fs-nano)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {cat.emoji}
                  </span>
                </div>
              </div>
              {extractReadings(c.jp) && (
                <div
                  style={{ fontSize: 'var(--fs-small)', color: T.textDim, fontFamily: T.fontJP }}
                >
                  {extractReadings(c.jp)}
                </div>
              )}
              <div
                style={{ fontSize: 'var(--fs-body)', color: T.gold, marginTop: 'var(--space-4)' }}
              >
                {c.id_text}
              </div>
              {c.desc &&
                (() => {
                  const clean = stripFuri(c.desc);
                  return (
                    <div
                      style={{
                        fontSize: 'var(--fs-small)',
                        color: T.textMuted,
                        marginTop: 'var(--space-4)',
                        lineHeight: 1.5,
                      }}
                    >
                      {clean.slice(0, 100)}
                      {clean.length > 100 ? '…' : ''}
                    </div>
                  );
                })()}
              {/* User accuracy badge */}
              <div
                style={{
                  display: 'flex',
                  gap: 'var(--space-6)',
                  marginTop: 'var(--space-6)',
                  flexWrap: 'wrap',
                }}
              >
                {isKnown && (
                  <span
                    className={S.pill}
                    style={{
                      fontSize: 'var(--fs-nano)',
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
                      fontSize: 'var(--fs-nano)',
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
