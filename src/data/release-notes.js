// ─── data/release-notes.js ────────────────────────────────────────────────────
// User-facing "Apa yang baru", shown in the Tentang mode.
//
// Hand-written, and deliberately not derived from CHANGELOG.md. That file is
// 1,482 lines of maintainer prose in English -- internal item numbers, test
// filenames, ts-fsrs enum names -- written for whoever picks up the code next.
// Rendering it to a construction worker preparing for an exam would be worse
// than showing nothing.
//
// Rules for adding an entry, so a future release does not drift from these:
//
//   * Bahasa Indonesia, sapa pembaca langsung ("kamu"), present tense.
//   * Only things a user can observe. If a release genuinely changed nothing
//     they can see, say so in one line rather than padding it out.
//   * No item numbers, no filenames, no FSRS/ts-fsrs/Rating internals, no
//     version-control language. There is a test that greps for these.
//   * Name modes the way the app names them -- "Mode Kartu", "Ulasan SRS",
//     "Soal Teknis" -- i.e. MODE_META.label, not internal keys.
//   * 2-5 lines per release. Newest first.
//
// The newest entry must be the version this build ships; a test asserts that
// against package.json, so a release that forgets to add itself fails.
// ─────────────────────────────────────────────────────────────────────────────

export const RELEASE_NOTES = [
  {
    version: '7.2.0',
    date: '2026-09-08',
    title: 'Tentang Aplikasi, tema ikut HP, dan perbaikan penyimpanan',
    changes: [
      'Ada layar Tentang Aplikasi baru: penjelasan ujian, panduan tiap menu, tanya-jawab, sumber materi, dan catatan pembaruan ini.',
      'Tema sekarang punya pilihan "Ikuti Sistem" — aplikasi ikut gelap/terang mengikuti pengaturan HP kamu, dan langsung berubah saat HP berganti.',
      'Ukuran teks bawaan sekarang "Kecil" supaya lebih banyak yang muat di layar. Kamu bisa mengubahnya kapan saja di Saya → Ukuran Teks.',
      'Kartu di "Terakhir dipelajari" sekarang bisa ditap untuk langsung membuka kartunya.',
      'Perbaikan penting: catatan pribadi, rekor Sprint, dan riwayat jawaban salah bisa hilang setelah kamu mengubah pengaturan. Sekarang tidak lagi.',
    ],
  },
  {
    version: '7.1.0',
    date: '2026-09-08',
    title: 'Statistik "Sempat Ragu" dan perbaikan tautan soal',
    changes: [
      'Statistik baru "Sempat Ragu": kartu yang kamu jawab benar tapi butuh waktu jauh lebih lama dari biasanya — tanda kamu mengingat-ingat, bukan hafal.',
      'Tombol "Latih N Salah" sekarang berfungsi di Soal Teknis, Kosakata, dan Simulasi. Sebelumnya tombolnya ada tapi tidak bisa dipakai.',
      'Banyak soal JAC yang tautannya menunjuk ke kartu yang salah — sekarang sudah diperbaiki.',
      'Semua 1.418 kartu kosakata kini punya contoh kalimat.',
    ],
  },
  {
    version: '7.0.0',
    date: '2026-09-07',
    title: 'Satu kartu = satu istilah',
    changes: [
      'Kartu yang dulu memuat beberapa istilah sekaligus kini dipecah — satu kartu satu istilah. Total kartu naik dari 1.438 ke 1.626.',
      'Mode Produksi dan Kuis Produksi dihapus.',
      'Progres belajarmu tidak terpengaruh oleh pemecahan kartu ini.',
    ],
  },
  {
    version: '6.1.0',
    date: '2026-09-05',
    title: 'Filter kategori di Mode Kartu, dan perbaikan mode ujian',
    changes: [
      'Mode Kartu punya pemilih kategori — pilih beberapa kategori sekaligus, digabung dengan pencarian teks.',
      'Empat perbaikan penting di mode ujian, termasuk timer yang sebelumnya bisa mengulang sendiri dan soal yang berganti saat kamu menjawab.',
      'Kartu yang sudah dibalik kini bisa dibalik lagi lewat sentuhan, tidak hanya lewat keyboard.',
    ],
  },
  {
    version: '6.0.0',
    date: '2026-09-04',
    title: 'Tampilan lebih lega dan teks lebih besar',
    changes: [
      'Seluruh ukuran teks dinaikkan. Sebelumnya 85% tulisan di aplikasi berukuran 13px ke bawah — sulit dibaca di luar ruangan.',
      'Ruang kosong di banyak layar dipangkas, jadi lebih banyak isi yang terlihat tanpa menggulir.',
      'Furigana punya ukuran minimum, supaya cara baca kanji tetap terbaca.',
    ],
  },
  {
    version: '5.5.0',
    date: '2026-09-01',
    title: 'Perapian tampilan',
    changes: [
      'Ukuran huruf yang tidak konsisten di berbagai layar diseragamkan.',
      'Gaya tampilan yang tidak terpakai dibersihkan — aplikasi jadi sedikit lebih ringan.',
    ],
  },
  {
    version: '5.2.0',
    date: '2026-08-31',
    title: 'Perbaikan dari masukan langsung',
    changes: [
      'Beberapa perbaikan tampilan dan satu koreksi isi materi, dari hasil mencoba aplikasi di HP sungguhan.',
      'Huruf Jepang dan Latin kini dimuat dari aplikasi sendiri, jadi tetap tampil rapi walau sedang offline.',
    ],
  },
  {
    version: '4.23.0',
    date: '2026-08-18',
    title: 'Fokus ke jalur Lifeline',
    changes: [
      'Hasil 3,5 bulan perbaikan kualitas materi digabungkan: cara baca kanji, contoh kalimat, dan penjelasan diperiksa ulang.',
      'Jalur Teknik Sipil (土木) dan Bangunan (建築) dihapus — aplikasi kini fokus penuh ke ライフライン設備 (Lifeline).',
    ],
  },
  {
    version: '4.x',
    date: null,
    title: 'Sebelum 4.23',
    changes: [
      'Fondasi aplikasi: kartu hafalan dengan sistem pengulangan terjadwal, kuis, simulasi ujian, statistik, dan mode offline.',
    ],
  },
];

/**
 * Has this reader seen the notes for the build they are running?
 *
 * `lastSeenVersion` is absent for everyone who installed before it existed, and
 * null on a fresh install -- both mean "has not seen these notes", which is the
 * truthful reading and needs no migration.
 */
// `export const`, not `export function`, on purpose: verify-content.mjs checks
// every file under src/data/ by rewriting `export const ` to CommonJS, and a
// function declaration survives the transform as a bare `export` and fails the
// audit. Keep the arrow form if you edit this.
export const hasUnseenReleaseNotes = (prefs, appVersion) =>
  (prefs?.lastSeenVersion ?? null) !== appVersion;
