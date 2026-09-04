// ─── FlashcardMode/FilterBar.jsx ────────────────────────────────────────────
// Search input + active-category summary + star-this-card button.
//
// The category chip used to read the key straight out of the search string
// ("🏷 Kategori: haikan") because the filter WAS that string. Now that
// categories are a real set it can say what the picker says — emoji, label,
// and how many cards that leaves — and the search box no longer has to
// disappear to make room for it: text and category filter compose.
// ─────────────────────────────────────────────────────────────────────────────
import { T } from '../../styles/theme.js';
import { getCatInfo } from '../../data/categories.js';
import FC from './flashcard.module.css';

function summarise(catFilter, matchCount) {
  if (catFilter.has('bintang')) return `⭐ Bintang · ${matchCount} kartu`;
  const keys = [...catFilter];
  if (keys.length === 1) {
    const cat = getCatInfo(keys[0]);
    return `${cat.emoji} ${cat.label} · ${matchCount} kartu`;
  }
  // U+FE0F: bare U+1F3F7 renders in monochrome text presentation next to the
  // colour emoji used everywhere else in this UI.
  return `🏷️ ${keys.length} kategori · ${matchCount} kartu`;
}

export default function FilterBar({
  search,
  onSearch,
  catFilter,
  onClearCats,
  matchCount,
  isStarred,
  onToggleStar,
}) {
  const hasCatFilter = !catFilter.has('all');

  return (
    <div className={FC.filterBar}>
      <input
        aria-label="Cari kartu"
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

      {hasCatFilter && (
        <div className={FC.filterCatRow}>
          <span
            className={FC.filterCatChip}
            style={{
              color: T.amber,
              background: `${T.amber}15`,
              border: `1px solid ${T.amber}40`,
            }}
          >
            {summarise(catFilter, matchCount)}
          </span>
          <button
            onClick={onClearCats}
            className={FC.filterCatClear}
            style={{ color: T.textDim }}
            aria-label="Hapus filter kategori"
          >
            ✕ Hapus filter
          </button>
        </div>
      )}
    </div>
  );
}
