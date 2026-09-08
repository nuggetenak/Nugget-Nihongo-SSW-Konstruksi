// ─── data/about-content.js ────────────────────────────────────────────────────
// Prose for the Tentang mode. Data, not JSX, so a wording change is one edit in
// one file and never a component change.
//
// What is deliberately NOT here: the per-menu guide and the source credits.
// Those are generated at render time from MODE_SECTIONS + MODE_META and from
// SOURCE_GROUPS + SOURCE_META, because the registries already hold a reviewed
// one-line description of every mode and every PDF source. Retyping them would
// create a second source of truth that drifts -- which is the exact failure
// docs/AGENT_WORKFLOW.md §4 keeps warning about.
// ─────────────────────────────────────────────────────────────────────────────

export const ABOUT_EXAM = {
  icon: '🏗️',
  title: 'Apa itu ujian SSW Konstruksi?',
  paras: [
    'SSW (特定技能 / Specified Skilled Worker) adalah izin kerja Jepang untuk tenaga kerja terampil. Aplikasi ini khusus untuk bidang konstruksi, jalur ライフライン設備 (Lifeline) — listrik, pipa, AC, dan telekomunikasi.',
    'Ujiannya dua bagian: teori (学科) dan praktik (実技). Keduanya memakai bahasa Jepang, jadi yang diuji bukan cuma pengetahuan teknismu, tapi juga apakah kamu paham istilah kerjanya dalam bahasa Jepang.',
    'Batas lulus 65%. Aplikasi ini memakai angka yang sama di mode Simulasi, supaya latihanmu sejalan dengan ujian aslinya.',
  ],
};

export const ABOUT_SRS = {
  icon: '🔁',
  title: 'Bagaimana cara belajarnya bekerja?',
  paras: [
    'Setiap kartu yang kamu nilai dijadwalkan ulang otomatis. Kartu yang kamu rasa mudah akan muncul lagi makin lama, kartu yang sulit muncul lagi lebih cepat. Jadi waktumu terpakai untuk yang belum kamu kuasai.',
    'Menu Ulasan SRS berisi kartu yang jatuh tempo hari ini, diurutkan dari yang paling mungkin sudah kamu lupa. Ini menu yang paling berguna dipakai tiap hari, walau cuma sebentar.',
    'Penjadwalan memakai FSRS dengan pengaturan standar — belum dikalibrasi khusus untuk penutur bahasa Indonesia. Jadi anggap jadwalnya panduan yang baik, bukan angka mutlak.',
  ],
};

export const ABOUT_PRIVACY = {
  icon: '🔒',
  title: 'Data & privasi',
  paras: [
    'Semua progresmu disimpan di browser HP ini saja. Tidak ada akun, tidak ada server, tidak ada yang dikirim ke mana pun.',
    'Konsekuensinya penting: ganti HP, ganti browser, atau hapus data browser = progres hilang, dan tidak bisa dikembalikan.',
    'Karena itu, sesekali simpan cadangan lewat Ekspor & Impor. File-nya milikmu sendiri — simpan di HP, kirim ke dirimu sendiri, terserah.',
  ],
};

export const ABOUT_CREDITS = {
  icon: '📂',
  title: 'Sumber materi',
  intro:
    'Semua kartu dan soal disusun dari materi persiapan ujian berikut. Kamu bisa belajar per sumber lewat menu Sumber.',
  note: 'Soal latihan Wayground dan JAC Mockup disusun untuk aplikasi ini, bukan soal ujian resmi. Soal JAC Official diambil dari buku contoh ujian resmi.',
};

export const ABOUT_FAQ = [
  {
    q: 'Apakah aplikasi ini bisa dipakai offline?',
    a: 'Bisa. Setelah dibuka sekali dengan koneksi, aplikasi tersimpan di HP dan bisa dipakai tanpa internet. Tambahkan ke Layar Utama supaya terasa seperti aplikasi biasa.',
  },
  {
    q: 'Kalau saya hafal semua kartu, pasti lulus?',
    a: 'Belum tentu. Kartu mengajarkan istilah; ujian juga menguji pemahaman prosedur dan keselamatan kerja. Pakai mode Simulasi untuk mengukur kesiapanmu, bukan jumlah kartu yang sudah dihafal.',
  },
  {
    q: 'Kenapa soal yang sama muncul lagi?',
    a: 'Beberapa set memang mengulang soal penting dengan sengaja, dan pengulangan memang cara kerja hafalan jangka panjang. Kalau ingin soal yang belum pernah kamu jawab benar, pakai mode "⚠ Lemah" di menu soal.',
  },
  {
    q: 'Apa bedanya Kartu, Ulasan SRS, dan Kuis?',
    a: 'Kartu untuk menjelajah dan menghafal bebas. Ulasan SRS hanya menampilkan kartu yang jatuh tempo hari ini — ini yang paling efisien. Kuis menguji dengan pilihan ganda.',
  },
  {
    q: 'Progres saya hilang. Bisa dikembalikan?',
    a: 'Kalau kamu punya file cadangan dari Ekspor, bisa — pakai Impor. Kalau tidak ada cadangan, sayangnya tidak bisa: tidak ada salinan di server mana pun.',
  },
  {
    q: 'Kenapa tulisannya kecil / besar sekali?',
    a: 'Ukuran teks bisa diatur di Saya → Ukuran Teks, ada empat tingkat. Seluruh tata letak ikut menyesuaikan, bukan cuma hurufnya.',
  },
];
