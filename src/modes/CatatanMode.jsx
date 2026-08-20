// ─── CatatanMode.jsx ──────────────────────────────────────────────────────────
// Personal notes per card — user adds mnemonics, context, reminders.
// Notes stored in localStorage (prefs doc: notes: { [cardId]: string }).
// Constructivism: personal meaning-making is stronger than generic definitions.
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useCallback, useMemo } from 'react';
import { useApp } from '../contexts/AppContext.jsx';
import { get as storageGet, set as storageSet } from '../storage/engine.js';
import { stripFuri, extractReadings } from '../utils/jp-helpers.js';
import { useDebounce } from '../hooks/useDebounce.js';
import S from './modes.module.css';

function NoteCard({ card, note, onSave }) {
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
        padding: '14px 16px',
        background: 'var(--ssw-surface)',
        borderRadius: 12,
        border: `1px solid ${note ? 'var(--ssw-borderLight)' : 'var(--ssw-border)'}`,
        marginBottom: 10,
      }}
    >
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 18,
              fontWeight: 700,
              color: 'var(--ssw-textBright)',
              marginBottom: 2,
            }}
          >
            {stripFuri(card.jp)}
          </div>
          {extractReadings(card.jp) && (
            <div style={{ fontSize: 12, color: 'var(--ssw-textMuted)', marginBottom: 4 }}>
              {extractReadings(card.jp)}
            </div>
          )}
          <div style={{ fontSize: 13, color: 'var(--ssw-textMuted)' }}>{card.id_text}</div>
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
            padding: '4px',
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
            marginTop: 10,
            padding: '10px 12px',
            background: 'rgba(245,158,11,0.08)',
            borderRadius: 8,
            fontSize: 13,
            color: 'var(--ssw-text)',
            lineHeight: 1.5,
            borderLeft: '3px solid var(--ssw-amber)',
          }}
        >
          {note}
        </div>
      )}

      {editing && (
        <div style={{ marginTop: 10 }}>
          <textarea
            aria-label="Catatan pribadi"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Tambah catatan, mnemonik, atau konteks pribadi..."
            autoFocus
            rows={3}
            style={{
              width: '100%',
              padding: '10px 12px',
              background: 'var(--ssw-inputBg)',
              border: '2px solid var(--ssw-borderLight)',
              borderRadius: 8,
              fontSize: 13,
              color: 'var(--ssw-text)',
              fontFamily: 'inherit',
              resize: 'vertical',
              lineHeight: 1.5,
              boxSizing: 'border-box',
            }}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button
              onClick={handleSave}
              style={{
                flex: 1,
                padding: '9px',
                borderRadius: 8,
                background: 'var(--ssw-amber)',
                color: '#fff',
                fontFamily: 'inherit',
                fontSize: 13,
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
                  padding: '9px 16px',
                  borderRadius: 8,
                  background: 'var(--ssw-wrongBg)',
                  color: 'var(--ssw-wrong)',
                  fontFamily: 'inherit',
                  fontSize: 13,
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
                padding: '9px 16px',
                borderRadius: 8,
                background: 'var(--ssw-surface)',
                color: 'var(--ssw-textMuted)',
                fontFamily: 'inherit',
                fontSize: 13,
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

export default function CatatanMode({ cards, onExit }) {
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

  const noteCount = Object.keys(notes).filter((id) => cards.some((c) => c.id === id)).length;

  const filters = [
    { key: 'semua', label: 'Semua' },
    { key: 'ada', label: `Ada Catatan (${noteCount})` },
    { key: 'belum', label: 'Belum Ada' },
  ];

  return (
    <div className={S.pageScroll}>
      <button className={S.btnBack} onClick={onExit}>
        ← Kembali
      </button>

      <div style={{ marginBottom: 16 }}>
        <div
          style={{ fontSize: 20, fontWeight: 700, color: 'var(--ssw-textBright)', marginBottom: 2 }}
        >
          📓 Buku Catatan
        </div>
        <div style={{ fontSize: 13, color: 'var(--ssw-textMuted)' }}>
          {noteCount} catatan · {cards.length} kartu total
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
          padding: '10px 14px',
          background: 'var(--ssw-inputBg)',
          border: '2px solid var(--ssw-border)',
          borderRadius: 10,
          fontSize: 14,
          color: 'var(--ssw-text)',
          fontFamily: 'inherit',
          boxSizing: 'border-box',
          marginBottom: 12,
          outline: 'none',
        }}
      />

      {/* Filter pills */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            style={{
              padding: '6px 14px',
              borderRadius: 99,
              fontFamily: 'inherit',
              fontSize: 12,
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
        <div
          style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: 'var(--ssw-textFaint)',
            fontSize: 14,
          }}
        >
          {query ? 'Tidak ada kartu yang cocok.' : 'Belum ada catatan.'}
        </div>
      ) : (
        <>
          {filtered.map((card) => (
            <NoteCard key={card.id} card={card} note={notes[card.id] || ''} onSave={handleSave} />
          ))}
          {filtered.length < (filter === 'semua' ? cards.length : filtered.length) && (
            <div
              style={{
                textAlign: 'center',
                fontSize: 12,
                color: 'var(--ssw-textFaint)',
                paddingTop: 8,
              }}
            >
              Menampilkan {filtered.length} kartu
            </div>
          )}
        </>
      )}
    </div>
  );
}
