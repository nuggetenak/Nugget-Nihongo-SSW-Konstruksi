// ─── CatatanMode.jsx ──────────────────────────────────────────────────────────
// Personal notes per card — user adds mnemonics, context, reminders.
// Notes stored in localStorage (prefs doc: notes: { [cardId]: string }).
// Constructivism: personal meaning-making is stronger than generic definitions.
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useCallback, useEffect, useMemo } from 'react';
import { useApp } from '../contexts/AppContext.jsx';
import { get as storageGet, set as storageSet } from '../storage/engine.js';
import { stripFuri, JP_LIST_MAX } from '../utils/jp-helpers.js';
import { useDebounce } from '../hooks/useDebounce.js';
import { JpFront } from '../components/JpDisplay.jsx';
import EmptyState from '../components/EmptyState.jsx';
import S from './modes.module.css';
import { formatCount } from '../utils/format.js';

function NoteCard({ card, note, onSave }) {
  const { prefs } = useApp();
  const furiganaPolicy = prefs?.furiganaPolicy ?? 'always';
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(note || '');

  const handleSave = () => {
    onSave(card.id, draft.trim());
    setEditing(false);
  };

  const handleDelete = () => {
    setDraft('');
    onSave(card.id, '');
    setEditing(false);
  };

  return (
    <div
      style={{
        padding: 'var(--space-14) var(--space-16)',
        background: 'var(--ssw-surface)',
        borderRadius: 12,
        border: `1px solid ${note ? 'var(--ssw-borderLight)' : 'var(--ssw-border)'}`,
        marginBottom: 'var(--space-10)',
      }}
    >
      <div style={{ display: 'flex', gap: 'var(--space-10)', alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ marginBottom: 'var(--space-2)' }}>
            <JpFront jp={card.jp} furiganaPolicy={furiganaPolicy} maxSize={JP_LIST_MAX} compact />
          </div>
          <div style={{ fontSize: 'var(--fs-body)', color: 'var(--ssw-textMuted)' }}>
            {card.id_text}
          </div>
        </div>
        <button
          onClick={() => {
            setDraft(note || '');
            setEditing(!editing);
          }}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 18,
            padding: 'var(--space-4)',
            color: note ? 'var(--ssw-amber)' : 'var(--ssw-textFaint)',
          }}
          aria-label={editing ? 'Tutup catatan' : 'Edit catatan'}
        >
          {editing ? '✕' : note ? '📝' : '＋'}
        </button>
      </div>

      {note && !editing && (
        <div
          style={{
            marginTop: 'var(--space-10)',
            padding: 'var(--space-10) var(--space-12)',
            background: 'rgba(245,158,11,0.08)',
            borderRadius: 8,
            fontSize: 'var(--fs-body)',
            color: 'var(--ssw-text)',
            lineHeight: 1.5,
            borderLeft: '3px solid var(--ssw-amber)',
          }}
        >
          {note}
        </div>
      )}

      {editing && (
        <div style={{ marginTop: 'var(--space-10)' }}>
          <textarea
            aria-label="Catatan pribadi"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Tambah catatan, mnemonik, atau konteks pribadi..."
            autoFocus
            rows={3}
            style={{
              width: '100%',
              padding: 'var(--space-10) var(--space-12)',
              background: 'var(--ssw-inputBg)',
              border: '2px solid var(--ssw-borderLight)',
              borderRadius: 8,
              fontSize: 'var(--fs-body)',
              color: 'var(--ssw-text)',
              fontFamily: 'inherit',
              resize: 'vertical',
              lineHeight: 1.5,
              boxSizing: 'border-box',
            }}
          />
          <div style={{ display: 'flex', gap: 'var(--space-8)', marginTop: 'var(--space-8)' }}>
            <button
              onClick={handleSave}
              style={{
                flex: 1,
                padding: 'var(--space-10)',
                borderRadius: 8,
                background: 'var(--ssw-amber)',
                color: 'var(--ssw-onAmber)',
                fontFamily: 'inherit',
                fontSize: 'var(--fs-body)',
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Simpan
            </button>
            {note && (
              <button
                onClick={handleDelete}
                style={{
                  padding: 'var(--space-10) var(--space-16)',
                  borderRadius: 8,
                  background: 'var(--ssw-wrongBg)',
                  color: 'var(--ssw-wrong)',
                  fontFamily: 'inherit',
                  fontSize: 'var(--fs-body)',
                  fontWeight: 600,
                  border: '1px solid var(--ssw-wrongBorder)',
                  cursor: 'pointer',
                }}
              >
                Hapus
              </button>
            )}
            <button
              onClick={() => setEditing(false)}
              style={{
                padding: 'var(--space-10) var(--space-16)',
                borderRadius: 8,
                background: 'var(--ssw-surface)',
                color: 'var(--ssw-textMuted)',
                fontFamily: 'inherit',
                fontSize: 'var(--fs-body)',
                border: '1px solid var(--ssw-border)',
                cursor: 'pointer',
              }}
            >
              Batal
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Cards rendered per page. Comfortably more than one phone screen, so the
// button is reached by deliberate scrolling rather than immediately.
const PAGE = 40;

export default function CatatanMode({ cards }) {
  const { toast } = useApp();

  // Notes stored in prefs doc: notes: { [cardId]: string }
  const loadNotes = () => storageGet('prefs')?.notes || {};
  const [notes, setNotesState] = useState(loadNotes);

  const [filter, setFilter] = useState('semua'); // 'semua' | 'ada' | 'belum'
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 120);

  const handleSave = useCallback(
    (cardId, text) => {
      const current = storageGet('prefs')?.notes || {};
      const updated = { ...current };
      if (text) updated[cardId] = text;
      else delete updated[cardId];
      storageSet('prefs', (p) => ({ ...p, notes: updated }));
      setNotesState(updated);
      if (text) toast.show('📝 Catatan disimpan');
      else toast.show('🗑️ Catatan dihapus');
    },
    [toast]
  );

  const filtered = useMemo(() => {
    let pool = cards;
    if (filter === 'ada') pool = pool.filter((c) => notes[c.id]);
    else if (filter === 'belum') pool = pool.filter((c) => !notes[c.id]);
    if (debouncedQuery) {
      const q = debouncedQuery.toLowerCase();
      pool = pool.filter(
        (c) =>
          stripFuri(c.jp).toLowerCase().includes(q) ||
          (c.id_text || '').toLowerCase().includes(q) ||
          (notes[c.id] || '').toLowerCase().includes(q)
      );
    }
    return pool;
  }, [cards, filter, debouncedQuery, notes]);

  // Render the list incrementally. Measured before changing anything: the
  // unfiltered list mounted 19,264 DOM nodes and a 134,599px page — a 134-metre
  // scroll on a phone, for a screen whose actual job is "find the card I want to
  // annotate". Filtering and searching still run over the full deck; only the
  // rendering is windowed, so a search never misses a match that happens to sit
  // past the window.
  const [limit, setLimit] = useState(PAGE);
  useEffect(() => setLimit(PAGE), [filter, debouncedQuery]);
  const visible = useMemo(() => filtered.slice(0, limit), [filtered, limit]);

  const noteCount = Object.keys(notes).filter((id) => cards.some((c) => c.id === id)).length;

  const filters = [
    { key: 'semua', label: 'Semua' },
    { key: 'ada', label: `Ada Catatan (${noteCount})` },
    { key: 'belum', label: 'Belum Ada' },
  ];

  return (
    <div className={S.pageScroll}>
      <div style={{ marginBottom: 'var(--space-16)' }}>
        {/* No title here — ModeHeader renders "Buku Catatan" as the page <h1>.
            This one was written as a plain styled div rather than .pageTitle,
            which is why the sweep that removed the other 16 duplicates missed
            it. The count line below is the part that carries information. */}
        <div style={{ fontSize: 'var(--fs-body)', color: 'var(--ssw-textMuted)' }}>
          {noteCount} catatan · {formatCount(cards.length)} kartu total
        </div>
      </div>

      {/* Search */}
      <input
        type="search"
        aria-label="Cari catatan"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Cari kartu atau catatan..."
        style={{
          width: '100%',
          padding: 'var(--space-10) var(--space-14)',
          background: 'var(--ssw-inputBg)',
          border: '2px solid var(--ssw-border)',
          borderRadius: 10,
          fontSize: 14,
          color: 'var(--ssw-text)',
          fontFamily: 'inherit',
          boxSizing: 'border-box',
          marginBottom: 'var(--space-12)',
        }}
      />

      {/* Filter pills */}
      <div
        style={{
          display: 'flex',
          gap: 'var(--space-6)',
          marginBottom: 'var(--space-16)',
          flexWrap: 'wrap',
        }}
      >
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            style={{
              padding: 'var(--space-6) var(--space-14)',
              borderRadius: 99,
              fontFamily: 'inherit',
              fontSize: 'var(--fs-caption)',
              fontWeight: filter === f.key ? 700 : 500,
              cursor: 'pointer',
              border: `2px solid ${filter === f.key ? 'var(--ssw-amber)' : 'var(--ssw-border)'}`,
              background: filter === f.key ? 'rgba(245,158,11,0.12)' : 'var(--ssw-surface)',
              color: filter === f.key ? 'var(--ssw-amber)' : 'var(--ssw-textMuted)',
              transition: 'all 0.15s',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Card list */}
      {filtered.length === 0 ? (
        query ? (
          <EmptyState.SearchEmpty query={query} />
        ) : (
          <EmptyState.NoNotes />
        )
      ) : (
        <>
          {visible.map((card) => (
            <NoteCard key={card.id} card={card} note={notes[card.id] || ''} onSave={handleSave} />
          ))}
          <div
            style={{
              textAlign: 'center',
              fontSize: 'var(--fs-caption)',
              color: 'var(--ssw-textDim)',
              paddingTop: 'var(--space-8)',
            }}
          >
            Menampilkan {visible.length} dari {formatCount(filtered.length)} kartu
          </div>
          {visible.length < filtered.length && (
            <button
              type="button"
              className={S.btnSecondary}
              onClick={() => setLimit((n) => n + PAGE)}
            >
              Muat {Math.min(PAGE, filtered.length - visible.length)} kartu lagi
            </button>
          )}
        </>
      )}
    </div>
  );
}
