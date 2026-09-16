// ─── ShortcutSheet.jsx ─────────────────────────────────────────────────────
// item 20: the app-level shortcuts (always true) plus a quick reference for
// the common per-mode patterns (which vary — this isn't mode-aware, it's a
// discoverability aid, not a live contextual list).
import Sheet from './Sheet.jsx';
import S from './ShortcutSheet.module.css';

// `index` is passed by hand rather than derived from a map, because these rows
// are written out one per line rather than generated -- which is the right
// shape for a reference card whose contents are prose, and means the stagger
// order has to be stated the same way (item 166).
function Row({ keys, desc, index = 0 }) {
  return (
    <div className={`${S.row} stagger-item`} style={{ '--stagger-i': index }}>
      <span className={S.keys}>
        {keys.map((k, i) => (
          <kbd key={i} className={S.kbd}>
            {k}
          </kbd>
        ))}
      </span>
      <span className={S.desc}>{desc}</span>
    </div>
  );
}

export default function ShortcutSheet({ onClose }) {
  return (
    <Sheet onClose={onClose} labelledBy="shortcut-sheet-title">
      <div className={S.title} id="shortcut-sheet-title">
        ⌨️ Pintasan Keyboard
      </div>

      <div className={S.section}>Di semua layar</div>
      <Row keys={['Esc']} desc="Keluar dari mode" index={1} />
      <Row keys={['1', '2', '3']} desc="Pindah tab (Beranda/Belajar/Saya)" index={2} />
      <Row keys={['?']} desc="Buka daftar ini" index={3} />

      <div className={S.section}>Di dalam kuis</div>
      <Row keys={['1', '–', '4']} desc="Pilih jawaban" index={4} />
      <Row keys={['Enter', 'Space']} desc="Lanjut ke soal berikutnya" index={5} />

      <div className={S.section}>Di kartu flashcard</div>
      <Row keys={['Space']} desc="Balik kartu" index={6} />
      <Row keys={['←', '→']} desc="Kartu sebelumnya / berikutnya" index={7} />
      <Row keys={['1', '–', '4']} desc="Nilai setelah dibalik (Lagi/Susah/Oke/Mudah)" index={8} />

      <div className={S.note}>Tidak aktif saat kamu sedang mengetik di kolom teks.</div>
    </Sheet>
  );
}
