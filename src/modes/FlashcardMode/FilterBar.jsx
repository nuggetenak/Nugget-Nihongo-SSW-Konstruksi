// ─── FlashcardMode/FilterBar.jsx (phaseE) ────────────────────────────────────
// Search input + star filter button.
// ─────────────────────────────────────────────────────────────────────────────
import { T } from '../../styles/theme.js';
import FC from './flashcard.module.css';

export default function FilterBar({ search, onSearch, isStarred, onToggleStar }) {
  const isCatFilter = search.startsWith('__cat:');
  const catKey = isCatFilter ? search.slice(6) : null;

  return (
    <div className={FC.filterBar}>
      {isCatFilter ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: T.amber, fontWeight: 700, padding: '6px 10px', background: `${T.amber}15`, borderRadius: 99, border: `1px solid ${T.amber}40` }}>
            🏷 Kategori: {catKey}
          </span>
          <button
            onClick={() => onSearch('')}
            style={{ fontFamily: 'inherit', fontSize: 11, color: T.textDim, background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px 6px' }}
            aria-label="Hapus filter kategori"
          >
            ✕ Hapus filter
          </button>
        </div>
      ) : (
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="🔍 Cari JP / ID..."
          className={FC.filterInput}
          style={{
            background: T.surface,
            border: `1px solid ${T.border}`,
            color: T.text,
          }}
        />
      )}
      <button
        onClick={onToggleStar}
        aria-label={isStarred ? 'Hapus bintang' : 'Tambah bintang'}
        className={FC.filterStarBtn}
        style={{
          border: `1px solid ${isStarred ? `${T.gold}80` : T.border}`,
          background: isStarred ? 'rgba(251,191,36,0.12)' : T.surface,
          color: isStarred ? T.gold : T.textDim,
        }}
      >
        {isStarred ? '⭐' : '☆'}
      </button>
    </div>
  );
}
