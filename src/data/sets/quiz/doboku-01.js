// doboku-01.js — Quiz Set: doboku-01
export const SET_DOBOKU_01 = {
    id: 'doboku-01',
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
  };
