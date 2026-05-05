// ─── FlashcardMode/FilterBar.jsx (phaseE) ────────────────────────────────────
// Search input + star filter button.
// ─────────────────────────────────────────────────────────────────────────────
import { T } from '../../styles/theme.js';
import FC from './flashcard.module.css';

export default function FilterBar({ search, onSearch, isStarred, onToggleStar }) {
  return (
    <div className={FC.filterBar}>
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
