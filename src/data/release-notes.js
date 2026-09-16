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
    version: '7.6.0',
    date: '2026-09-15',
    title:
      'Jauh lebih cepat saat menilai kartu, huruf Jepang yang ikut membesar, dan aplikasi yang bergerak',
    changes: [
      'Menilai kartu di Ulasan SRS dulu terasa tersendat, dan makin banyak kartu yang sudah kamu pelajari, makin lama jedanya — jadi justru makin berat untuk yang paling rajin. Sekarang sekitar 28 kali lebih cepat. Satu sesi 30 kartu yang dulu menahan aplikasi hampir 20 detik, sekarang kurang dari satu detik.',
      'Pengaturan Ukuran Teks akhirnya mengubah huruf Jepangnya juga. Sebelumnya pilihan Besar dan Sangat Besar hanya membesarkan tulisan Indonesia, label, dan tombol — kanji di depan kartu, di soal kuis, dan di Glosari tetap sekecil sebelumnya. Furigana ikut membesar bersamanya.',
      'Aplikasinya bergerak sekarang: pindah tab dan masuk mode ada transisinya, ikon kartu mode berpindah jadi judul di layar berikutnya, kartu flashcard mengikuti jarimu saat digeser, angka naik pelan-pelan, dan layar "Misi Selesai" akhirnya terasa seperti perayaan.',
      'Semuanya bisa kamu atur sendiri di Pengaturan Gerakan yang baru: empat tingkat dari Penuh sampai Mati, sembilan saklar terpisah, dan pengatur kecepatan. Kalau HP-mu sudah disetel mengurangi animasi, aplikasi ini ikut mati sejak pertama dibuka — dan kalau kamu nyalakan lagi, pilihanmu yang menang.',
      'Tombol "Latih N salah" sekarang muncul di lebih dari separuh soal — 539 dari 980, naik dari 305. Kalau kamu salah menjawab, tombol itu membuka kartu yang mengajarkan jawabannya; sebelumnya untuk banyak soal tombolnya tidak pernah muncul sama sekali.',
      'Beberapa perbaikan kecil: kartu di Ulasan SRS tidak lagi bisa tersangkut sampai tidak bisa dinilai maupun dilewati, layar "Misi Selesai" sekarang terlihat juga oleh yang mematikan animasi di HP-nya (sebelumnya benar-benar tidak muncul), dan tombol jejak navigasi di atas layar sekarang cukup besar untuk disentuh.',
    ],
  },
  {
    version: '7.5.1',
    date: '2026-09-14',
    title: 'Satu soal yang salah tulis, dan kartu terkaitnya yang salah tunjuk',
    changes: [
      'Satu soal tentang sambungan pipa tembaga salah tulis istilahnya — sebagian katakana, sebagian huruf latin yang tercecer. Soal yang sama muncul di dua paket, dan keduanya sudah diperbaiki.',
      'Soal itu juga menunjuk kartu yang salah: tombol kartu terkaitnya membuka "cap" (penutup ujung pipa), padahal soalnya tentang brazing. Sekarang menunjuk kartu ro-setsugou, brazing pipa tembaga.',
      'Isi soalnya ikut diganti. Sebelumnya soal itu menanyakan angka panjang brazing yang sumbernya tidak bisa dipastikan — dan angka yang salah di soal ujian lebih merugikan daripada tidak ada soalnya. Sekarang yang ditanyakan cara kerjanya: bahan brazing tersedot sendiri ke celah sambungan oleh gaya kapiler, dan pipa tembaganya sendiri tidak meleleh.',
      'Selain itu tidak ada perubahan yang terlihat di aplikasi — sisanya rapi-rapi catatan internal.',
    ],
  },
  {
    version: '7.5.0',
    date: '2026-09-14',
    title: 'Dua mode baru untuk bahasa di lokasi, dan jadwal ulasan yang akhirnya berjalan',
    changes: [
      'Dua mode baru. Bahasa Lapangan: 84 kalimat yang benar-benar diucapkan di lokasi — bukan istilah, tapi perintah, peringatan, teguran, cara melapor, dan cara minta izin. Skenario: enam percakapan utuh dari apel pagi sampai serah terima, di mana jawaban yang benar tergantung apa yang sudah diucapkan sebelumnya.',
      'Perbaikan terpenting: kartu yang kamu nilai "Oke" tidak pernah naik tingkat, jadi jadwal ulasannya berhenti di tempat dan kartu yang sama terus muncul. Sekarang jadwalnya berjalan seperti seharusnya.',
      'Data belajarmu lebih aman. Kalau satu bagian datanya rusak atau hilang, riwayat ulasan dan pengaturanmu tidak ikut ditimpa lagi — sebelumnya bisa hilang semua. Dan kalau kamu membuka aplikasi di dua tab sekaligus, sekarang ada peringatan sebelum yang satu menimpa yang lain.',
      'Di Soal Teknis, jawaban benar hampir selalu jadi pilihan yang paling panjang, jadi bisa ditebak tanpa membaca soalnya. Ratusan pilihan salah ditulis ulang supaya panjangnya seimbang.',
      'Nilai yang lebih jujur: kartu yang kamu lewati tidak lagi masuk hitungan, dan kuis yang waktunya habis tidak lagi memberi 100% hanya karena menghitung yang terjawab saja. Aplikasi juga lebih cepat dibuka pertama kali.',
    ],
  },
  {
    version: '7.4.0',
    date: '2026-09-09',
    title: 'Foto soal JAC yang asli, dan pilihan jawaban yang tidak lagi ketebak',
    changes: [
      'Dua belas soal JAC Resmi bertanya tentang sebuah foto — "alat pada foto ini namanya apa?" — tapi fotonya tidak pernah ada. Sekarang foto aslinya tampil di soal, termasuk diagram dengan panah biru di soal jaringan telekomunikasi.',
      'Keterangan foto di beberapa soal itu ternyata menyebut jawabannya. Sudah ditulis ulang supaya hanya menjelaskan apa yang terlihat.',
      'Di paket JAC Mockup, jawaban benar hampir selalu jadi pilihan yang paling panjang — jadi bisa ditebak tanpa membaca soalnya. Ratusan pilihan salah ditulis ulang supaya panjangnya seimbang dan kamu benar-benar harus tahu jawabannya.',
      'Soal berfoto juga tidak lagi kehilangan terjemahan Indonesianya.',
    ],
  },
  {
    version: '7.3.0',
    date: '2026-09-08',
    title: 'Kartu yang tidak mau dibalik, dan banyak perbaikan di belakang layar',
    changes: [
      'Perbaikan terpenting: kartu yang dibuka dari "Terakhir dipelajari", dari "Latih Salah", atau dari Sumber Materi tidak mau dibalik — tombol Lihat, Sebelumnya, dan Berikutnya seperti mati. Sekarang sudah normal.',
      'Satu soal keselamatan tentang 4 langkah KY punya dua jawaban berbeda di dua paket latihan. Jawaban yang salah sudah diperbaiki, dan sekarang ada pemeriksaan otomatis supaya hal ini tidak terjadi lagi.',
      'Beberapa istilah seperti CD管 dan PC杭 tampil tanpa cara bacanya. Sekarang furigana-nya muncul seperti kartu lain.',
      'Aplikasi jadi lebih cepat dibuka pertama kali: data soal tidak lagi ikut diunduh sebelum layar pertama tampil.',
      'Jawaban salah dari Wayground, Vocab, JAC, Kata Mirip, dan Jebakan sekarang ikut terhitung di Fokus dan Statistik. Sebelumnya hanya sebagian yang terhitung.',
      'Tombol "Ekspor Delta SRS Saja" menghasilkan file yang tadinya tidak bisa dimuat kembali. Sekarang bisa, dan digabung dengan data yang sudah ada, bukan menimpanya.',
      'Streak tidak lagi hilang saat kamu pindah zona waktu — misalnya pulang dari Jepang ke Indonesia.',
      'Sprint: penghitung waktunya sempat berhenti kalau kamu menjawab sangat cepat. Sudah diperbaiki.',
      'Cari sekarang menemukan kartu dari tulisan yang kamu lihat di layar. Sebelumnya ratusan kartu tidak ketemu walau ditulis persis.',
      'Buku Catatan sempat menulis "0 catatan" padahal catatannya ada. Sekarang jumlahnya benar.',
      '"Hapus Semua Data" sekarang benar-benar menghapus semuanya, termasuk sambungan cadangan GitHub di HP ini.',
    ],
  },
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
