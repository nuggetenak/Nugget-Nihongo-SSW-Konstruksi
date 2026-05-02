// ─── docs/seeds/sipil-sets-seed.js ────────────────────────────────────────────
// SEED DATA for Phase B — Copy to src/data/sipil-sets.js
// 3 sets × 15 questions = 45 questions (minimum viable)
//
// Every question has been checked against the LSP Content Authoring Standard:
// ✅ F1 — TSA justification (on-site scenario)
// ✅ F2 — Objective needs (safety / task / compliance)
// ✅ F3 — Metalinguistic exp field
// ✅ F4 — Andragogical desc field (what / on-site action / supervisor dialogue)
// ✅ F5 — Semantic interleave (≥3 domains per set)
// ✅ F6 — Answer index verified (0-based)
// ✅ F7 — Construction-worker register in opts_id
//
// Content sources: JAC textbook Ch.3–5, JAC official 実技 questions
// ─────────────────────────────────────────────────────────────────────────────

export const SIPIL_SETS = [
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SET 1: 土工事・基礎の基本 — Pekerjaan Tanah & Dasar Sipil
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'sipil-01',
    title: '土工事・基礎の基本',
    subtitle: 'Pekerjaan Tanah & Dasar Sipil',
    emoji: '⛏️',
    questions: [
      {
        q: '掘削作業を行う前に必ず確認することは？',
        opts: ['地下埋設物の有無', '天気予報', '作業員の年齢', '昼食のメニュー'],
        opts_id: ['Ada tidaknya utilitas bawah tanah', 'Prakiraan cuaca', 'Usia pekerja', 'Menu makan siang'],
        ans: 0,
        exp: 'Sebelum menggali, WAJIB cek utilitas bawah tanah (gas, listrik, air) untuk mencegah kecelakaan fatal. Kesalahan umum: memilih "prakiraan cuaca" — cuaca penting tapi bukan prioritas keselamatan utama.',
        cat: 'anzen',
        desc: 'Pengecekan utilitas bawah tanah sebelum galian. Sebagai pekerja SSW: ini prosedur K3 wajib sebelum excavator mulai — pelanggaran bisa berakibat ledakan pipa gas. Atasan akan tanya: 地下埋設物の確認はしましたか？'
      },
      {
        q: '盛土の転圧に使う機械は？',
        opts: ['ローラー', 'クレーン', 'ミキサー車', 'ポンプ車'],
        opts_id: ['Roller/gilas', 'Crane', 'Truk molen', 'Truk pompa'],
        ans: 0,
        exp: 'Roller (ローラー) digunakan untuk memadatkan (転圧) tanah timbunan (盛土). Crane untuk angkat, molen untuk beton, pompa untuk cor.',
        cat: 'sekou',
        desc: 'Roller untuk pemadatan tanah. Sebagai pekerja SSW sipil: kamu akan sering lihat vibration roller di proyek jalan — tanah yang tidak dipadatkan = jalan ambles. Mandor bilang: ローラーで転圧してください。'
      },
      {
        q: '法面（のりめん）とは何か？',
        opts: ['切土や盛土の斜面', '建物の壁', '道路の舗装面', '橋の床板'],
        opts_id: ['Lereng galian/timbunan', 'Dinding bangunan', 'Permukaan aspal jalan', 'Lantai jembatan'],
        ans: 0,
        exp: '法面 (のりめん) = lereng yang terbentuk akibat galian (切土) atau timbunan (盛土). Bukan dinding bangunan (壁) atau permukaan jalan (舗装面).',
        cat: 'sekou',
        desc: 'Lereng galian/timbunan di proyek sipil. Sebagai pekerja SSW: lereng yang tidak stabil = longsor. Kamu wajib lapor kalau lihat retakan di 法面. Atasan: 法面の状態を確認してください。'
      },
      {
        q: '土留め工事で使う「切梁」の役割は？',
        opts: ['土圧に対抗して壁を支える', '地面を掘る', '水を排出する', 'コンクリートを混ぜる'],
        opts_id: ['Menopang dinding terhadap tekanan tanah', 'Menggali tanah', 'Mengalirkan air', 'Mengaduk beton'],
        ans: 0,
        exp: '切梁 (きりばり/strut) berfungsi menopang dinding penahan tanah (土留め壁) terhadap tekanan lateral tanah. Ini bukan alat gali atau pompa air.',
        cat: 'sekou',
        desc: 'Strut penopang dinding penahan tanah. Sebagai pekerja SSW: kalau strut dipasang tidak benar, dinding bisa runtuh masuk ke galian — ini kecelakaan mematikan. Mandor: 切梁の取り付けを確認しろ。'
      },
      {
        q: '安全帯（あんぜんたい）はどこに取り付けて使う？',
        opts: ['親綱やアンカーに取り付ける', '腕に巻く', '頭にかぶる', '足に付ける'],
        opts_id: ['Dikaitkan di tali induk atau jangkar', 'Dililit di lengan', 'Dipakai di kepala', 'Dipasang di kaki'],
        ans: 0,
        exp: 'Safety harness (安全帯) dikaitkan ke lifeline (親綱) atau anchor point. Bukan dipakai di lengan (itu gelang), kepala (itu helm), atau kaki (itu sepatu).',
        cat: 'anzen',
        desc: 'Safety harness untuk kerja di ketinggian. Sebagai pekerja SSW: WAJIB dipakai di atas 2 meter — tanpa harness = dilarang naik. Atasan: 安全帯をつけましたか？'
      },
      {
        q: '排水工事の目的は？',
        opts: ['地下水や雨水を処理する', '建物を建てる', '道路を舗装する', '鉄筋を組む'],
        opts_id: ['Mengelola air tanah dan air hujan', 'Membangun gedung', 'Mengaspal jalan', 'Merakit besi tulangan'],
        ans: 0,
        exp: '排水工事 = pekerjaan drainase untuk mengelola air tanah dan hujan. Ini berbeda dari konstruksi gedung, pengaspalan, atau pekerjaan besi.',
        cat: 'sekou',
        desc: 'Pekerjaan drainase sipil. Sebagai pekerja SSW: air yang menggenang di galian = bahaya longsor dan korsleting. Kamu akan bantu pasang pipa drainase dan pompa. Mandor: 排水ポンプを動かしてください。'
      },
      {
        q: '測量（そくりょう）で使う「トランシット」の用途は？',
        opts: ['角度を測る', '重さを測る', '温度を測る', '音を測る'],
        opts_id: ['Mengukur sudut', 'Mengukur berat', 'Mengukur suhu', 'Mengukur suara'],
        ans: 0,
        exp: 'Transit/theodolite (トランシット) digunakan untuk mengukur sudut horizontal dan vertikal dalam survei. Bukan alat ukur berat (timbangan), suhu (termometer), atau suara (desibel meter).',
        cat: 'sekou',
        desc: 'Transit untuk survei/pengukuran. Sebagai pekerja SSW: kamu mungkin diminta pegang staf/prism saat surveyor ukur — posisi yang salah = titik bangunan geser. Atasan: トランシットの位置を動かすな。'
      },
      {
        q: '地盤改良工事で「セメント系固化材」を使う目的は？',
        opts: ['軟弱地盤を硬くする', '地面に色をつける', '地面を掘りやすくする', '雑草を防ぐ'],
        opts_id: ['Mengeraskan tanah lunak', 'Memberi warna tanah', 'Mempermudah penggalian', 'Mencegah rumput liar'],
        ans: 0,
        exp: 'Bahan pengikat semen (セメント系固化材) dicampur ke tanah lunak untuk mengeraskannya (地盤改良). Bukan untuk pewarnaan atau pengendalian gulma.',
        cat: 'sekou',
        desc: 'Perbaikan tanah dengan semen. Sebagai pekerja SSW: di proyek tanah lunak, kamu akan bantu campurkan stabilizer ke tanah sebelum fondasi dipasang. Mandor: 固化材の量を確認してください。'
      },
      {
        q: '「KY活動」とは何の略？',
        opts: ['危険予知活動', '休憩予定活動', '器具安全活動', '緊急避難活動'],
        opts_id: ['Kegiatan Prediksi Bahaya', 'Kegiatan Jadwal Istirahat', 'Kegiatan Keamanan Alat', 'Kegiatan Evakuasi Darurat'],
        ans: 0,
        exp: 'KY = 危険予知 (Kiken Yochi = Prediksi Bahaya). KY活動 dilakukan setiap pagi sebelum kerja dimulai untuk identifikasi potensi bahaya hari itu.',
        cat: 'anzen',
        desc: 'Kegiatan identifikasi bahaya harian. Sebagai pekerja SSW: setiap pagi kamu ikut KY meeting — wajib bisa menyebut risiko kerja hari itu dalam bahasa Jepang sederhana. Mandor: 今日のKYを始めます。'
      },
      {
        q: '舗装工事でアスファルトの温度管理が重要な理由は？',
        opts: ['温度が低すぎると締め固めができない', '色が変わるから', '臭いが出るから', '機械が壊れるから'],
        opts_id: ['Suhu terlalu rendah = tidak bisa dipadatkan', 'Karena warnanya berubah', 'Karena baunya keluar', 'Karena mesin rusak'],
        ans: 0,
        exp: 'Aspal harus dijaga suhunya saat penghamparan — terlalu dingin = tidak bisa dipadatkan dengan roller, hasilnya permukaan jelek dan mudah rusak.',
        cat: 'sekou',
        desc: 'Kontrol suhu aspal saat pengaspalan. Sebagai pekerja SSW: kamu akan bantu cek suhu aspal di finisher — di bawah standar harus lapor segera. Mandor: アスファルトの温度は何度ですか？'
      },
      {
        q: 'バックホウ（ユンボ）の主な用途は？',
        opts: ['掘削作業', '高所作業', 'コンクリート打設', '溶接作業'],
        opts_id: ['Pekerjaan penggalian', 'Kerja di ketinggian', 'Pengecoran beton', 'Pengelasan'],
        ans: 0,
        exp: 'Backhoe/excavator (バックホウ/ユンボ) digunakan utamanya untuk menggali (掘削). Bukan untuk kerja tinggi (aerial), cor beton (打設), atau las (溶接).',
        cat: 'sekou',
        desc: 'Excavator untuk penggalian. Sebagai pekerja SSW: jangan pernah berdiri di radius putar (旋回範囲) backhoe — zona mematikan. Operator: バックホウの旋回範囲に入るな！'
      },
      {
        q: '建設現場で「ヒヤリハット」とは？',
        opts: ['事故にはならなかったが危険を感じた体験', '新しい安全装置の名前', '作業報告書の種類', '休憩時間の合図'],
        opts_id: ['Pengalaman hampir celaka (near miss)', 'Nama alat keselamatan baru', 'Jenis laporan kerja', 'Tanda waktu istirahat'],
        ans: 0,
        exp: 'ヒヤリハット (hiyari-hatto) = near miss / kejadian nyaris celaka. Wajib dilaporkan agar kecelakaan dicegah. Bukan nama alat atau jenis laporan biasa.',
        cat: 'anzen',
        desc: 'Pelaporan insiden nyaris celaka. Sebagai pekerja SSW: kalau kamu hampir kejatuhan benda atau hampir tersandung, WAJIB lapor ヒヤリハット — ini mencegah kecelakaan berikutnya. Mandor: ヒヤリハットがあったら必ず報告してください。'
      },
      {
        q: '現場で「玉掛け作業」とは？',
        opts: ['クレーンで荷物を吊る準備作業', '壁にペンキを塗る作業', '地面を掘る作業', '鉄筋を曲げる作業'],
        opts_id: ['Pekerjaan persiapan mengangkat beban dengan crane', 'Pekerjaan mengecat dinding', 'Pekerjaan menggali tanah', 'Pekerjaan membengkokkan besi'],
        ans: 0,
        exp: '玉掛け (たまかけ) = rigging/slinging — pekerjaan memasang sling/tali ke beban sebelum diangkat crane. Butuh sertifikat khusus. Bukan mengecat, menggali, atau membengkokkan besi.',
        cat: 'sekou',
        desc: 'Pekerjaan rigging crane. Sebagai pekerja SSW: kamu perlu sertifikat 玉掛け技能講習 untuk boleh pasang sling. Tanpa sertifikat = dilarang menyentuh beban crane. Mandor: 玉掛けの資格を持っていますか？'
      },
      {
        q: '高所作業とは地上何メートル以上の作業？',
        opts: ['2メートル以上', '5メートル以上', '10メートル以上', '1メートル以上'],
        opts_id: ['2 meter ke atas', '5 meter ke atas', '10 meter ke atas', '1 meter ke atas'],
        ans: 0,
        exp: 'Menurut UU K3 Jepang (労働安全衛生規則), kerja di ketinggian (高所作業) didefinisikan sebagai 2 meter ke atas. Kesalahan umum: mengira 5 atau 10 meter.',
        cat: 'anzen',
        desc: 'Definisi kerja di ketinggian. Sebagai pekerja SSW: di atas 2 meter = WAJIB harness + helm. Banyak pekerja Indonesia mengira 5 meter — itu standar Indonesia, bukan Jepang. Mandor: 2メートル以上は安全帯必須です。'
      },
      {
        q: '「墜落制止用器具」の新しい規格で求められるものは？',
        opts: ['フルハーネス型', '胴ベルト型のみ', '安全靴のみ', 'ヘルメットのみ'],
        opts_id: ['Tipe full harness', 'Hanya sabuk pinggang', 'Hanya sepatu safety', 'Hanya helm'],
        ans: 0,
        exp: 'Regulasi baru Jepang (2019) mewajibkan full harness (フルハーネス型) untuk kerja di ketinggian ≥6.75m (konstruksi baja/besi). Sabuk pinggang saja tidak lagi cukup.',
        cat: 'anzen',
        desc: 'Standar baru alat anti jatuh. Sebagai pekerja SSW: full harness = wajib. Kalau proyek hanya sediakan sabuk pinggang, kamu berhak minta full harness. Atasan: フルハーネスを着用してください。'
      },
    ],
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SET 2: 道路・舗装・排水 — Jalan, Perkerasan & Drainase
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'sipil-02',
    title: '道路・舗装・排水',
    subtitle: 'Jalan, Perkerasan & Drainase',
    emoji: '🛣️',
    questions: [
      {
        q: 'アスファルト舗装の施工順序で正しいのは？',
        opts: ['路盤→基層→表層', '表層→基層→路盤', '基層→表層→路盤', '路盤→表層→基層'],
        opts_id: ['Subgrade→Base→Surface', 'Surface→Base→Subgrade', 'Base→Surface→Subgrade', 'Subgrade→Surface→Base'],
        ans: 0,
        exp: 'Urutan yang benar: 路盤 (subgrade/pondasi bawah) → 基層 (base course/lapisan dasar) → 表層 (surface/lapisan permukaan). Ini prinsip dasar — dari bawah ke atas.',
        cat: 'sekou',
        desc: 'Urutan pengaspalan. Sebagai pekerja SSW: kalau urutan salah, jalan cepat rusak. Setiap lapisan harus dipadatkan dulu sebelum lapisan berikutnya. Mandor: まず路盤の転圧をしてください。'
      },
      {
        q: '路盤の締め固めが不十分だとどうなる？',
        opts: ['舗装にひび割れが発生する', '舗装の色が変わる', '交通量が増える', '工期が短くなる'],
        opts_id: ['Aspal retak', 'Warna aspal berubah', 'Volume lalu lintas bertambah', 'Durasi proyek memendek'],
        ans: 0,
        exp: 'Pemadatan pondasi yang kurang = permukaan aspal retak dan turun (settlement). Warna aspal tidak terkait pemadatan, dan volume lalu lintas/durasi proyek bukan akibat pemadatan.',
        cat: 'sekou',
        desc: 'Dampak pemadatan pondasi yang buruk. Sebagai pekerja SSW: kamu akan diminta cek kepadatan dengan alat density test — hasilnya harus ≥95%. Mandor: 締め固め度は95%以上にしてください。'
      },
      {
        q: '側溝（そっこう）の役割は？',
        opts: ['道路の雨水を集めて排水する', '車を止める', '歩行者を守る', '道路を美しくする'],
        opts_id: ['Mengumpulkan dan mengalirkan air hujan jalan', 'Menghentikan kendaraan', 'Melindungi pejalan kaki', 'Memperindah jalan'],
        ans: 0,
        exp: '側溝 (saluran tepi jalan) = drainase yang mengumpulkan air hujan dari permukaan jalan. Bukan pembatas kendaraan (guardrail), bukan trotoar (歩道), bukan elemen dekoratif.',
        cat: 'sekou',
        desc: 'Saluran drainase tepi jalan. Sebagai pekerja SSW: kamu akan bantu pasang precast U-ditch atau gali saluran manual. Mandor: 側溝の勾配を確認してください。'
      },
      {
        q: 'コンクリート舗装とアスファルト舗装の違いで正しいのは？',
        opts: ['コンクリートは養生期間が長い', 'アスファルトは養生期間が長い', '両方同じ養生期間', 'どちらも養生不要'],
        opts_id: ['Beton butuh curing lebih lama', 'Aspal butuh curing lebih lama', 'Keduanya sama', 'Keduanya tidak perlu curing'],
        ans: 0,
        exp: 'Perkerasan beton (コンクリート舗装) butuh curing 7–28 hari sebelum bisa dilalui kendaraan. Aspal bisa digunakan setelah dingin (beberapa jam). Ini perbedaan operasional terbesar.',
        cat: 'sekou',
        desc: 'Perbandingan beton vs aspal. Sebagai pekerja SSW: di proyek beton, kamu akan bantu proses curing — jaga kelembaban permukaan. Mandor: コンクリートの養生シートを敷いてください。'
      },
      {
        q: '建設現場の朝礼で行うことは？',
        opts: ['安全確認と作業内容の共有', '昼食の注文', '給料の計算', '道具の販売'],
        opts_id: ['Konfirmasi keselamatan & sharing rencana kerja', 'Pesan makan siang', 'Perhitungan gaji', 'Penjualan alat'],
        ans: 0,
        exp: '朝礼 (chorei/morning assembly) = briefing pagi untuk cek keselamatan, bagi tugas, dan konfirmasi bahaya hari itu. Ini prosedur standar di semua proyek konstruksi Jepang.',
        cat: 'anzen',
        desc: 'Briefing pagi di proyek. Sebagai pekerja SSW: kamu WAJIB hadir di 朝礼 setiap pagi — absen = pelanggaran serius. Kadang kamu diminta baca item KY. Atasan: 朝礼に集合してください。'
      },
      {
        q: '暗渠排水（あんきょはいすい）とは？',
        opts: ['地中に埋設した管で排水する方法', '空中の排水管', '川に直接流す方法', '水を蒸発させる方法'],
        opts_id: ['Drainase lewat pipa yang ditanam', 'Pipa drainase di udara', 'Langsung buang ke sungai', 'Menguapkan air'],
        ans: 0,
        exp: '暗渠排水 = drainase bawah tanah (tertutup), menggunakan pipa perforated yang ditanam di dalam tanah. Lawan kata: 明渠 (saluran terbuka).',
        cat: 'sekou',
        desc: 'Sistem drainase bawah tanah. Sebagai pekerja SSW: kamu akan bantu gali parit, pasang geotextile, dan letakkan pipa drainase. Mandor: 暗渠管の勾配を取ってください。'
      },
      {
        q: '「養生」の意味で正しいのは？',
        opts: ['コンクリートなどを適切な条件で保護すること', '休憩すること', '掃除すること', '撤去すること'],
        opts_id: ['Melindungi beton dll pada kondisi yang tepat', 'Istirahat', 'Membersihkan', 'Membongkar'],
        ans: 0,
        exp: '養生 (ようじょう) dalam konstruksi = curing/perlindungan material (terutama beton) agar mengeras dengan benar. Bukan istirahat (休憩), bersih-bersih (掃除), atau bongkar (撤去).',
        cat: 'sekou',
        desc: 'Proses curing/perlindungan. Sebagai pekerja SSW: kamu akan sering dengar kata ini — 養生シート (curing sheet), 養生期間 (masa curing). Mandor: 養生シートで覆ってください。'
      },
      {
        q: '道路工事の交通規制で「片側交互通行」とは？',
        opts: ['片方の車線だけ交互に通す方法', '全車線を閉鎖する方法', '歩行者のみ通す方法', '大型車両のみ通す方法'],
        opts_id: ['Lalu lintas bergantian satu arah', 'Menutup semua jalur', 'Hanya pejalan kaki', 'Hanya kendaraan besar'],
        ans: 0,
        exp: '片側交互通行 = one-way alternating traffic — satu jalur ditutup untuk pekerjaan, kendaraan bergantian lewat jalur satunya. Ini pengaturan lalin paling umum di proyek jalan.',
        cat: 'anzen',
        desc: 'Pengaturan lalu lintas kerja jalan. Sebagai pekerja SSW: kamu mungkin ditugaskan sebagai flagman (交通誘導員) — harus hafal aba-aba tangan. Mandor: 片側交互通行の誘導をお願いします。'
      },
      {
        q: '建設現場で使う「水糸（みずいと）」の目的は？',
        opts: ['水平や直線を確認するための糸', '水を運ぶパイプ', '釣り糸', '電線'],
        opts_id: ['Benang untuk cek level/garis lurus', 'Pipa untuk membawa air', 'Tali pancing', 'Kabel listrik'],
        ans: 0,
        exp: '水糸 = benang referensi yang ditarik kencang untuk mengecek kelurusan dan level horizontal. Alat dasar survei yang murah tapi krusial.',
        cat: 'sekou',
        desc: 'Benang level/referensi. Sebagai pekerja SSW: ini alat yang paling sering kamu gunakan — pasang dari titik A ke B untuk panduan galian atau pasangan. Mandor: 水糸を張ってくれ。'
      },
      {
        q: '型枠の解体はいつ行う？',
        opts: ['コンクリートが所定の強度に達した後', '打設直後', '翌日の朝', '1時間後'],
        opts_id: ['Setelah beton mencapai kekuatan yang ditentukan', 'Segera setelah cor', 'Pagi esok hari', 'Setelah 1 jam'],
        ans: 0,
        exp: 'Bekisting (型枠) baru boleh dibongkar setelah beton mencapai kekuatan minimum yang disyaratkan (biasanya 5 N/mm² untuk dinding). Membongkar terlalu cepat = beton runtuh.',
        cat: 'sekou',
        desc: 'Waktu bongkar bekisting. Sebagai pekerja SSW: jangan pernah bongkar bekisting tanpa izin mandor — harus ada hasil uji tekan. Mandor: 型枠は強度が出てから解体してください。'
      },
      {
        q: '「丁張り」の目的は？',
        opts: ['施工位置と高さの基準を示す', '作業員の人数を数える', '工事の予算を計算する', '道具を整理する'],
        opts_id: ['Menunjukkan posisi & level referensi konstruksi', 'Menghitung jumlah pekerja', 'Menghitung anggaran', 'Merapikan alat'],
        ans: 0,
        exp: '丁張り (ちょうはり) = batter board — papan referensi yang menunjukkan posisi dan ketinggian untuk panduan penggalian/konstruksi.',
        cat: 'sekou',
        desc: 'Papan referensi konstruksi. Sebagai pekerja SSW: surveyor pasang 丁張り → kamu gali sesuai level yang ditunjukkan. Jangan sentuh atau geser 丁張り yang sudah dipasang. Mandor: 丁張りに合わせて掘削してください。'
      },
      {
        q: '建設機械の作業開始前点検で確認するのは？',
        opts: ['油量・水量・ブレーキ・安全装置', '天気・気温・湿度', '作業員の食事', '近所の住民の有無'],
        opts_id: ['Oli, air, rem, alat keselamatan', 'Cuaca, suhu, kelembaban', 'Makanan pekerja', 'Ada tidaknya warga sekitar'],
        ans: 0,
        exp: 'Inspeksi harian alat berat (始業前点検) wajib cek: oli (油量), air radiator (水量), rem (ブレーキ), alat keselamatan (安全装置). Ini kewajiban operator sebelum mesin dinyalakan.',
        cat: 'anzen',
        desc: 'Inspeksi harian alat berat. Sebagai pekerja SSW: kalau kamu jadi operator, ini checklist pagi yang wajib. Catat hasilnya di form 始業前点検表. Mandor: 始業前点検は終わりましたか？'
      },
      {
        q: '地山（じやま）の掘削で「手掘り」を行う条件は？',
        opts: ['埋設物が近くにある場合', '天気が良い場合', '作業員が多い場合', '地盤が硬い場合'],
        opts_id: ['Bila ada utilitas bawah tanah di dekatnya', 'Bila cuaca baik', 'Bila pekerja banyak', 'Bila tanah keras'],
        ans: 0,
        exp: 'Galian manual (手掘り) dilakukan saat ada utilitas bawah tanah (ガス管, 水道管) di dekat area galian — excavator bisa merusak pipa. Ini prosedur keselamatan.',
        cat: 'sekou',
        desc: 'Galian manual dekat utilitas. Sebagai pekerja SSW: kamu akan diminta gali manual 50cm di sekitar pipa/kabel yang terdeteksi. Lamban tapi wajib — excavator bisa potong pipa gas. Mandor: 埋設物の近くは手掘りでお願いします。'
      },
      {
        q: '建設現場でのヘルメットの正しい着用方法は？',
        opts: ['あご紐をしっかり締める', 'ゆるく被る', '後ろ向きに被る', 'あご紐は締めない'],
        opts_id: ['Tali dagu dikencangkan', 'Dipakai longgar', 'Dipakai terbalik', 'Tali dagu tidak dikencangkan'],
        ans: 0,
        exp: 'Helm harus dipakai dengan tali dagu (あご紐) dikencangkan. Helm longgar atau terbalik = tidak melindungi saat benda jatuh.',
        cat: 'anzen',
        desc: 'Cara pakai helm yang benar. Sebagai pekerja SSW: helm longgar = ditegur mandor. Di Jepang sangat ketat soal ini — beda dengan kebiasaan di Indonesia. Mandor: あご紐をちゃんと締めてください。'
      },
      {
        q: '「根切り」とは？',
        opts: ['建物の基礎をつくるための掘削', '木の根を切る作業', '鉄筋を切る作業', '配管を切る作業'],
        opts_id: ['Penggalian untuk membuat fondasi bangunan', 'Memotong akar pohon', 'Memotong besi tulangan', 'Memotong pipa'],
        ans: 0,
        exp: '根切り (ねぎり) = penggalian untuk fondasi. Walaupun huruf kanji 根 (akar) dan 切 (potong), ini BUKAN memotong akar pohon — ini istilah teknis untuk excavation fondasi.',
        cat: 'sekou',
        desc: 'Penggalian fondasi. Sebagai pekerja SSW: 根切り adalah langkah pertama dalam membangun fondasi — kedalaman dan lebarnya harus sesuai gambar. Mandor: 根切りの深さを確認してください。'
      },
    ],
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SET 3: 安全管理・法規 — Manajemen Keselamatan & Peraturan
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'sipil-03',
    title: '安全管理・法規',
    subtitle: 'Manajemen Keselamatan & Peraturan',
    emoji: '🛡️',
    questions: [
      {
        q: '酸素欠乏危険作業とは酸素濃度が何%未満の場所？',
        opts: ['18%未満', '21%未満', '15%未満', '25%未満'],
        opts_id: ['Di bawah 18%', 'Di bawah 21%', 'Di bawah 15%', 'Di bawah 25%'],
        ans: 0,
        exp: 'Menurut peraturan K3 Jepang, tempat dengan kadar oksigen di bawah 18% = lingkungan defisiensi oksigen (酸素欠乏). Udara normal = 21%. Kesalahan umum: menjawab 21% (itu kadar normal).',
        cat: 'hourei',
        desc: 'Standar kadar oksigen minimum. Sebagai pekerja SSW: di manhole, tangki, atau ruang tertutup, WAJIB ukur kadar O2 sebelum masuk. Di bawah 18% = DILARANG masuk tanpa alat bantu napas. Mandor: 酸素濃度を測定してください。'
      },
      {
        q: '労働安全衛生法で事業者の義務は？',
        opts: ['労働者の安全と健康を確保すること', '利益を最大化すること', '残業を増やすこと', '工期を短縮すること'],
        opts_id: ['Memastikan keselamatan & kesehatan pekerja', 'Memaksimalkan keuntungan', 'Menambah lembur', 'Mempersingkat jadwal'],
        ans: 0,
        exp: '労働安全衛生法 (UU K3 Jepang) mewajibkan pemberi kerja menjamin keselamatan dan kesehatan pekerja. Ini bukan soal profit atau jadwal.',
        cat: 'hourei',
        desc: 'Kewajiban pemberi kerja menurut UU K3. Sebagai pekerja SSW: kamu punya HAK atas lingkungan kerja yang aman — kalau ada kondisi bahaya, kamu berhak menolak bekerja. Ini dilindungi hukum.'
      },
      {
        q: '「安全衛生責任者」を選任しなければならない現場は？',
        opts: ['元請と下請が混在する現場', 'すべての現場', '大規模現場のみ', '公共工事のみ'],
        opts_id: ['Proyek dengan kontraktor utama & sub-kontraktor', 'Semua proyek', 'Hanya proyek besar', 'Hanya proyek pemerintah'],
        ans: 0,
        exp: 'Petugas K3 (安全衛生責任者) wajib ditunjuk saat proyek melibatkan kontraktor utama (元請) dan subkontraktor (下請) bekerja bersama — untuk koordinasi keselamatan antar perusahaan.',
        cat: 'hourei',
        desc: 'Penunjukan petugas K3. Sebagai pekerja SSW di subkontraktor: kamu melapor ke 安全衛生責任者 perusahaan submu, bukan langsung ke kontraktor utama. Tahu siapa namanya.'
      },
      {
        q: '「作業主任者」が必要な作業は？',
        opts: ['型枠支保工の組立て', '掃除', '材料の運搬', '事務作業'],
        opts_id: ['Pemasangan shoring bekisting', 'Kebersihan', 'Pengangkutan material', 'Pekerjaan kantor'],
        ans: 0,
        exp: 'Pekerjaan berisiko tinggi seperti pemasangan shoring bekisting (型枠支保工) wajib ada 作業主任者 (supervisor kerja bersertifikat). Kebersihan dan pengangkutan biasa tidak memerlukan.',
        cat: 'hourei',
        desc: 'Kewajiban supervisor bersertifikat. Sebagai pekerja SSW: pastikan ada 作業主任者 sebelum mulai kerja berisiko — kalau tidak ada, jangan mulai. Ini hakmu.'
      },
      {
        q: '有機溶剤を使用するときに必要なものは？',
        opts: ['防毒マスクと換気装置', '軍手だけ', '安全靴だけ', 'ヘルメットだけ'],
        opts_id: ['Masker anti gas & ventilasi', 'Hanya sarung tangan kain', 'Hanya sepatu safety', 'Hanya helm'],
        ans: 0,
        exp: 'Pelarut organik (有機溶剤) = beracun. WAJIB pakai masker anti gas (防毒マスク) DAN pastikan ventilasi (換気). Sarung tangan kain saja tidak cukup melindungi dari uap kimia.',
        cat: 'anzen',
        desc: 'Perlindungan dari pelarut organik. Sebagai pekerja SSW: cat, thinner, lem — semua mengandung 有機溶剤. Tanpa masker yang benar = keracunan. Mandor: 防毒マスクをつけてから作業してください。'
      },
      {
        q: '石綿（アスベスト）を含む建材の解体で必要な措置は？',
        opts: ['事前調査と届出、飛散防止措置', '普通に解体してよい', '水をかけるだけでよい', '窓を開けるだけでよい'],
        opts_id: ['Survei awal, pelaporan, & pencegahan serbuk', 'Boleh bongkar biasa', 'Cukup siram air', 'Cukup buka jendela'],
        ans: 0,
        exp: 'Asbes (石綿/アスベスト) = karsinogenik. Pembongkaran material ber-asbes WAJIB: (1) survei awal, (2) melapor ke pemerintah, (3) tindakan pencegahan penyebaran serat. Bukan pekerjaan biasa.',
        cat: 'hourei',
        desc: 'Prosedur pembongkaran material ber-asbes. Sebagai pekerja SSW: JANGAN pernah potong atau bor material yang dicurigai asbes tanpa izin — serat asbes menyebabkan kanker paru-paru.'
      },
      {
        q: '感電防止のために電動工具で確認することは？',
        opts: ['アース（接地）が正しく接続されている', '色がきれい', '新品である', '値段が高い'],
        opts_id: ['Grounding/arde terpasang dengan benar', 'Warnanya bagus', 'Masih baru', 'Harganya mahal'],
        ans: 0,
        exp: 'Untuk mencegah kesetrum (感電), pastikan alat listrik terhubung grounding/arde (アース/接地) dengan benar. Warna, usia, atau harga alat tidak relevan dengan keselamatan listrik.',
        cat: 'anzen',
        desc: 'Pencegahan kesetrum. Sebagai pekerja SSW: sebelum pakai bor, gerinda, dll — cek kabel arde. Kalau kabel terkelupas = LAPOR, jangan pakai. Mandor: アースの接続を確認してください。'
      },
      {
        q: '「新規入場者教育」はいつ行う？',
        opts: ['現場に初めて入るとき', '毎月1回', '毎年1回', '工事完了時'],
        opts_id: ['Saat pertama kali masuk proyek', 'Sebulan sekali', 'Setahun sekali', 'Saat proyek selesai'],
        ans: 0,
        exp: '新規入場者教育 = orientasi keselamatan untuk pekerja yang PERTAMA KALI masuk proyek tersebut. Bukan bulanan atau tahunan.',
        cat: 'hourei',
        desc: 'Orientasi keselamatan pekerja baru di proyek. Sebagai pekerja SSW: setiap pindah ke proyek baru, kamu WAJIB ikut orientasi ini — biasanya 1-2 jam. Isi: aturan proyek, titik bahaya, jalur evakuasi.'
      },
      {
        q: '「安全帯使用の免除」が認められる場合は？',
        opts: ['原則として免除はない', '天気が良いとき', '作業が簡単なとき', '経験が長いとき'],
        opts_id: ['Pada prinsipnya tidak ada pengecualian', 'Saat cuaca baik', 'Saat pekerjaan mudah', 'Saat pengalaman sudah lama'],
        ans: 0,
        exp: 'Pada prinsipnya TIDAK ADA pengecualian untuk penggunaan harness di ketinggian ≥2m. Cuaca baik, pekerjaan mudah, atau pengalaman lama bukan alasan untuk tidak pakai.',
        cat: 'hourei',
        desc: 'Tidak ada pengecualian harness. Sebagai pekerja SSW: kalau mandor bilang "tidak perlu harness karena kerjanya cepat" — itu SALAH. Kamu berhak menolak naik tanpa harness.'
      },
      {
        q: '高さ5m以上の足場の組立てに必要な資格は？',
        opts: ['足場の組立て等作業主任者', '特に資格は不要', '運転免許', '医師免許'],
        opts_id: ['Sertifikat supervisor pemasangan scaffolding', 'Tidak perlu sertifikat', 'SIM', 'Izin dokter'],
        ans: 0,
        exp: 'Pemasangan scaffolding ≥5m WAJIB ada supervisor bersertifikat (足場の組立て等作業主任者). Bukan pekerjaan yang boleh dilakukan tanpa pengawasan.',
        cat: 'hourei',
        desc: 'Sertifikasi scaffolding. Sebagai pekerja SSW: kamu boleh MEMBANTU pasang scaffolding di bawah pengawasan 作業主任者, tapi tidak boleh memimpin pemasangan tanpa sertifikat.'
      },
      {
        q: '熱中症の初期症状は？',
        opts: ['めまい・大量の汗・筋肉のけいれん', '頭痛だけ', '鼻血だけ', '目のかゆみだけ'],
        opts_id: ['Pusing, keringat banyak, kram otot', 'Hanya sakit kepala', 'Hanya mimisan', 'Hanya mata gatal'],
        ans: 0,
        exp: 'Gejala awal heat stroke (熱中症): pusing (めまい), keringat berlebihan (大量の汗), kram otot (筋肉のけいれん). Kalau dibiarkan → pingsan → bisa meninggal.',
        cat: 'anzen',
        desc: 'Mengenali gejala heat stroke. Sebagai pekerja SSW: musim panas Jepang sangat panas + lembab. Wajib minum air tiap 30 menit. Mandor: 水分補給をこまめにしてください。'
      },
      {
        q: '労災保険の適用範囲は？',
        opts: ['すべての労働者（外国人を含む）', '日本人だけ', '正社員だけ', '管理者だけ'],
        opts_id: ['Semua pekerja (termasuk WNA)', 'Hanya orang Jepang', 'Hanya karyawan tetap', 'Hanya manajer'],
        ans: 0,
        exp: 'Asuransi kecelakaan kerja (労災保険) berlaku untuk SEMUA pekerja termasuk pekerja asing (外国人). Ini hak kamu sebagai pekerja SSW.',
        cat: 'hourei',
        desc: 'Hak asuransi kecelakaan kerja. Sebagai pekerja SSW: kalau kamu cedera di tempat kerja, perusahaan WAJIB menanggung biaya pengobatan lewat 労災保険. Ini hakmu — jangan takut melapor.'
      },
      {
        q: '「指差し呼称（ゆびさしこしょう）」の目的は？',
        opts: ['確認の精度を上げてミスを防ぐ', '上司に見せるため', '時間を稼ぐため', '体操のため'],
        opts_id: ['Meningkatkan ketelitian pengecekan & mencegah kesalahan', 'Untuk ditunjukkan ke atasan', 'Untuk mengulur waktu', 'Untuk olahraga'],
        ans: 0,
        exp: '指差し呼称 (pointing and calling) = metode konfirmasi keselamatan dengan menunjuk + menyebut item yang dicek dengan suara keras. Terbukti mengurangi kesalahan hingga 85%.',
        cat: 'anzen',
        desc: 'Metode pointing & calling. Sebagai pekerja SSW: ini kebiasaan Jepang yang mungkin terasa aneh awalnya — tapi sangat efektif. Contoh: tunjuk switch → "スイッチ OFF、ヨシ！"'
      },
      {
        q: '建設現場の「整理・整頓」の目的は？',
        opts: ['事故の防止と作業効率の向上', '見た目をきれいにするだけ', '検査に合格するため', '写真を撮るため'],
        opts_id: ['Mencegah kecelakaan & meningkatkan efisiensi', 'Hanya supaya terlihat rapi', 'Supaya lulus inspeksi', 'Untuk difoto'],
        ans: 0,
        exp: '整理・整頓 (5S — seiri, seiton) di proyek konstruksi = bukan soal estetika, tapi pencegahan kecelakaan (tersandung material) dan efisiensi (cepat cari alat).',
        cat: 'anzen',
        desc: 'Budaya rapi/tertib di proyek Jepang. Sebagai pekerja SSW: setelah selesai kerja, WAJIB rapikan area kerja — alat dikembalikan, sampah dibuang, material ditata. Mandor: 今日の片付けをお願いします。'
      },
      {
        q: '特定技能1号で建設分野の在留期間は最長何年？',
        opts: ['通算5年', '通算3年', '通算10年', '期限なし'],
        opts_id: ['Total 5 tahun', 'Total 3 tahun', 'Total 10 tahun', 'Tanpa batas'],
        ans: 0,
        exp: 'SSW 1号 (特定技能1号) di bidang konstruksi = masa tinggal maksimum total 5 tahun (通算5年). Setelah itu bisa upgrade ke SSW 2号 yang tidak ada batas waktu.',
        cat: 'hourei',
        desc: 'Masa berlaku visa SSW 1. Sebagai pekerja SSW: kamu punya 5 tahun — manfaatkan untuk belajar bahasa & skill agar bisa naik ke SSW 2号 (tanpa batas waktu tinggal).'
      },
    ],
  },
];
