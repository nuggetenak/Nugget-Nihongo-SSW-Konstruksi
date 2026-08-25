// ─── ShortcutSheet.jsx ─────────────────────────────────────────────────────
// item 20: the app-level shortcuts (always true) plus a quick reference for
// the common per-mode patterns (which vary — this isn't mode-aware, it's a
// discoverability aid, not a live contextual list).
import Sheet from './Sheet.jsx';
import S from './ShortcutSheet.module.css';

function Row({ keys, desc }) {
  return (
    <div className={S.row}>
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
      <Row keys={['Esc']} desc="Keluar dari mode" />
      <Row keys={['1', '2', '3']} desc="Pindah tab (Beranda/Belajar/Saya)" />
      <Row keys={['?']} desc="Buka daftar ini" />

      <div className={S.section}>Di dalam kuis</div>
      <Row keys={['1', '–', '4']} desc="Pilih jawaban" />
      <Row keys={['Enter', 'Space']} desc="Lanjut ke soal berikutnya" />

      <div className={S.section}>Di kartu flashcard</div>
      <Row keys={['Space']} desc="Balik kartu" />
      <Row keys={['←', '→']} desc="Kartu sebelumnya / berikutnya" />
      <Row keys={['1', '–', '4']} desc="Nilai setelah dibalik (Lagi/Susah/Oke/Mudah)" />

      <div className={S.note}>Tidak aktif saat kamu sedang mengetik di kolom teks.</div>
    </Sheet>
  );
}
