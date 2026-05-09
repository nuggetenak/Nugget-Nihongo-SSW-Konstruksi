// quiz-sets.js — All question sets, single source of truth.
// track: 'common'   = Teori (Ch.1-4, all 3 tracks see this)
// track: 'lifeline' = Praktik Lifeline + CSV Lifeline
// track: 'doboku'   = Praktik Sipil (Doboku track)
// track: 'kenchiku' = Praktik Bangunan (Kenchiku track)
import { WAYGROUND_SETS } from './wayground-sets.js';
import { CSV_SETS } from './csv-sets.js';

// ── Sipil sets ───────────────────────────────────────────────────────────────
const SIPIL_SETS = [
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

// ── Bangunan sets ────────────────────────────────────────────────────────────
const BANGUNAN_SETS = [
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SET 1: 型枠・鉄筋・コンクリート — Bekisting, Tulangan & Beton
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'bangunan-01',
    title: '型枠・鉄筋・コンクリート',
    subtitle: 'Bekisting, Tulangan & Beton',
    emoji: '🏗️',
    questions: [
      {
        q: 'コンクリートの「スランプ試験」で測定するものは？',
        opts: ['軟らかさ（コンシステンシー）', '圧縮強度', '引張強度', '含水率'],
        opts_id: ['Kelunakan (konsistensi)', 'Kuat tekan', 'Kuat tarik', 'Kadar air'],
        ans: 0,
        exp: 'Slump test mengukur konsistensi (kelunakan/flowability) beton segar, BUKAN kekuatan. Kuat tekan diukur setelah curing 28 hari dengan uji silinder.',
        cat: 'sekou',
        desc: 'Uji slump beton segar. Sebagai pekerja SSW bangunan: setiap truk mixer datang, mandor cek slump. Kalau nilainya di luar spesifikasi = beton DITOLAK. Mandor: スランプ値を確認してください。'
      },
      {
        q: '鉄筋の「かぶり厚さ」の目的は？',
        opts: ['鉄筋を腐食から守る', '建物を美しくする', '鉄筋を軽くする', '工期を短縮する'],
        opts_id: ['Melindungi tulangan dari korosi', 'Mempercantik bangunan', 'Meringankan tulangan', 'Mempersingkat jadwal'],
        ans: 0,
        exp: 'Concrete cover (かぶり厚さ) = tebal selimut beton di atas tulangan. Fungsi utama: melindungi besi dari korosi (karat). Selimut tipis = besi cepat berkarat = bangunan runtuh.',
        cat: 'sekou',
        desc: 'Selimut beton untuk tulangan. Sebagai pekerja SSW: saat pasang tulangan, WAJIB pasang spacer agar besi tidak menempel bekisting. Mandor: かぶりが足りないぞ、スペーサーを入れてくれ。'
      },
      {
        q: '型枠（かたわく）の組立てで最も重要なことは？',
        opts: ['寸法精度と強度の確保', '色の統一', '材料の値段', '作業の速さ'],
        opts_id: ['Menjamin akurasi dimensi & kekuatan', 'Keseragaman warna', 'Harga material', 'Kecepatan kerja'],
        ans: 0,
        exp: 'Bekisting (型枠) harus akurat dimensinya dan cukup kuat menahan tekanan beton segar. Warna tidak relevan. Murah atau cepat tapi tidak akurat/kuat = beton bocor atau miring.',
        cat: 'sekou',
        desc: 'Prinsip pemasangan bekisting. Sebagai pekerja SSW: bekisting yang jebol saat cor = kecelakaan serius + beton terbuang. Cek setiap sambungan sebelum cor dimulai. Mandor: 型枠の精度を確認してください。'
      },
      {
        q: 'コンクリートの打設（打ち込み）で「バイブレーター」を使う理由は？',
        opts: ['空気を抜いて密実にする', '音を出して合図する', 'コンクリートを温める', 'コンクリートを冷やす'],
        opts_id: ['Mengeluarkan udara agar padat', 'Memberi sinyal bunyi', 'Menghangatkan beton', 'Mendinginkan beton'],
        ans: 0,
        exp: 'Vibrator beton digunakan untuk mengeluarkan gelembung udara (空気) agar beton padat (密実). Beton dengan banyak rongga udara = lemah. Vibrator bukan alat sinyal atau pengatur suhu.',
        cat: 'sekou',
        desc: 'Vibrator untuk pemadatan beton. Sebagai pekerja SSW: kamu akan sering pegang vibrator saat cor — masukkan vertikal, jangan miring. Mandor: バイブレーターを丁寧にかけてください。'
      },
      {
        q: '足場（あしば）の点検はいつ行う？',
        opts: ['毎日の作業開始前', '月に1回', '年に1回', '足場を解体するとき'],
        opts_id: ['Setiap hari sebelum mulai kerja', 'Sebulan sekali', 'Setahun sekali', 'Saat bongkar scaffolding'],
        ans: 0,
        exp: 'Inspeksi scaffolding WAJIB setiap hari sebelum kerja dimulai (毎日の作業開始前). Bukan bulanan atau tahunan. Setelah hujan/angin kencang juga harus inspeksi ulang.',
        cat: 'anzen',
        desc: 'Inspeksi harian scaffolding. Sebagai pekerja SSW: sebelum naik, cek clamp, papan lantai, guardrail. Kalau ada yang longgar = LAPOR, jangan naik. Mandor: 足場の点検はしましたか？'
      },
      {
        q: '鉄筋の継手（つぎて）で「重ね継手」の長さは？',
        opts: ['鉄筋径の40倍以上', '鉄筋径の5倍以上', '鉄筋径の2倍以上', '長さは決まっていない'],
        opts_id: ['≥40× diameter tulangan', '≥5× diameter tulangan', '≥2× diameter tulangan', 'Tidak ada ketentuan'],
        ans: 0,
        exp: 'Overlap joint (重ね継手) = panjang tumpangan ≥40× diameter tulangan (contoh: D13 → tumpangan ≥520mm). 5× atau 2× terlalu pendek = sambungan tidak kuat.',
        cat: 'sekou',
        desc: 'Panjang tumpangan tulangan. Sebagai pekerja SSW: ini angka yang WAJIB diingat — kalau tumpangan kurang, inspektur akan tolak. Mandor: 重ね継手の長さは足りているか確認しろ。'
      },
      {
        q: '建築現場で「墨出し（すみだし）」とは？',
        opts: ['壁や柱の位置を床に印をつける作業', '壁にペンキを塗る作業', '床を洗う作業', '窓を取り付ける作業'],
        opts_id: ['Menandai posisi dinding/kolom di lantai', 'Mengecat dinding', 'Mencuci lantai', 'Memasang jendela'],
        ans: 0,
        exp: '墨出し = marking/layout — menandai posisi dinding, kolom, dan elemen struktur di permukaan lantai menggunakan tinta墨 (sumi) dan 墨壺 (sumitsubo/chalk line).',
        cat: 'sekou',
        desc: 'Marking posisi konstruksi di lantai. Sebagai pekerja SSW: ini pekerjaan presisi — garis yang kamu tarik menentukan posisi tembok. Salah 1cm = tembok miring. Mandor: 墨出しの位置を確認してくれ。'
      },
      {
        q: 'コンクリートの「養生」で水をかける理由は？',
        opts: ['乾燥によるひび割れを防ぐ', 'コンクリートを冷やす', '色をつける', '表面をきれいにする'],
        opts_id: ['Mencegah retak akibat kering', 'Mendinginkan beton', 'Memberi warna', 'Membersihkan permukaan'],
        ans: 0,
        exp: 'Curing basah = menjaga kelembaban beton agar reaksi semen berlanjut optimal. Beton yang terlalu cepat kering = retak (乾燥収縮ひび割れ). Bukan untuk mendinginkan atau membersihkan.',
        cat: 'sekou',
        desc: 'Curing basah beton. Sebagai pekerja SSW: kamu akan diminta siram air ke beton yang baru cor atau tutup dengan curing sheet. Mandor: コンクリートの散水養生をしてください。'
      },
      {
        q: '外壁の「左官工事（さかんこうじ）」とは？',
        opts: ['モルタルやプラスターを塗る工事', '電気の配線工事', '水道管の工事', 'ガラスを入れる工事'],
        opts_id: ['Pekerjaan plester/acian mortar', 'Instalasi kabel listrik', 'Instalasi pipa air', 'Pemasangan kaca'],
        ans: 0,
        exp: '左官工事 (plastering) = pekerjaan plester/acian menggunakan mortar atau plaster. Bukan pekerjaan listrik (電気), pipa (水道), atau kaca (ガラス).',
        cat: 'sekou',
        desc: 'Pekerjaan plester/acian. Sebagai pekerja SSW bangunan: kamu mungkin diminta bantu campur mortar dan bawa ke tukang plester. Mandor: モルタルを練って持ってきてくれ。'
      },
      {
        q: '「根太（ねだ）」とは建物のどの部分？',
        opts: ['床を支える横架材', '壁の材料', '屋根の部品', '基礎の鉄筋'],
        opts_id: ['Balok horizontal penopang lantai', 'Material dinding', 'Komponen atap', 'Tulangan fondasi'],
        ans: 0,
        exp: '根太 (ねだ) = floor joist/balok lantai horizontal yang menopang papan lantai. Bukan bagian dinding, atap, atau fondasi.',
        cat: 'sekou',
        desc: 'Balok lantai kayu. Sebagai pekerja SSW di pekerjaan kayu (木工事): kamu akan pasang 根太 di atas 大引 sebelum papan lantai dipasang. Mandor: 根太の間隔は303mmにしてください。'
      },
      {
        q: '防水工事で「シート防水」の施工で注意することは？',
        opts: ['接合部からの漏水防止', '色の選択', '工期の短縮', '景観への配慮'],
        opts_id: ['Mencegah bocor di sambungan', 'Pemilihan warna', 'Mempersingkat jadwal', 'Pertimbangan estetika'],
        ans: 0,
        exp: 'Waterproofing sheet: titik paling rawan bocor = sambungan antar sheet (接合部). Harus di-overlap minimal sesuai spec dan direkatkan sempurna.',
        cat: 'sekou',
        desc: 'Waterproofing membran sheet. Sebagai pekerja SSW: saat pasang sheet, overlap harus tepat dan tidak ada gelembung udara di bawahnya. Mandor: シートの重ね部分を確認してください。'
      },
      {
        q: '建築現場で「仮設工事」に含まれるものは？',
        opts: ['足場・仮囲い・仮設電気', '基礎工事', '内装工事', '設備工事'],
        opts_id: ['Scaffolding, pagar sementara, listrik sementara', 'Pekerjaan fondasi', 'Pekerjaan interior', 'Pekerjaan MEP'],
        ans: 0,
        exp: '仮設工事 = pekerjaan sementara yang mendukung konstruksi: scaffolding (足場), pagar proyek (仮囲い), instalasi listrik sementara (仮設電気). Ini dibongkar setelah proyek selesai.',
        cat: 'sekou',
        desc: 'Pekerjaan sementara/temporary. Sebagai pekerja SSW: 仮設 = sementara, bukan permanen. Scaffolding, kantor proyek, toilet portabel — semua 仮設. Mandor: 仮設足場の組立てを手伝ってくれ。'
      },
      {
        q: '「断熱材（だんねつざい）」の役割は？',
        opts: ['外部の熱を遮断する', '建物を飾る', '音を出す', '水を通す'],
        opts_id: ['Menghalangi panas dari luar', 'Menghias bangunan', 'Menghasilkan suara', 'Mengalirkan air'],
        ans: 0,
        exp: '断熱材 = insulation material — menghalangi transfer panas antara luar dan dalam bangunan. Bukan dekorasi, bukan penghasil suara, dan bukan saluran air.',
        cat: 'sekou',
        desc: 'Material insulasi termal. Sebagai pekerja SSW: kamu akan pasang styrofoam, glasswool, atau rockwool di dinding/atap. Celah = kebocoran termal = rugi energi. Mandor: 断熱材に隙間がないように施工してください。'
      },
      {
        q: '「配筋検査（はいきんけんさ）」は何を確認する？',
        opts: ['鉄筋の配置・間隔・かぶりが図面通りか', 'コンクリートの温度', '作業員の資格', '足場の安全'],
        opts_id: ['Posisi, jarak, & selimut tulangan sesuai gambar', 'Suhu beton', 'Sertifikat pekerja', 'Keamanan scaffolding'],
        ans: 0,
        exp: '配筋検査 = inspeksi tulangan sebelum cor — memastikan posisi (配置), jarak (間隔), dan selimut beton (かぶり) sesuai gambar desain. Ini dilakukan SEBELUM beton dicor.',
        cat: 'sekou',
        desc: 'Inspeksi tulangan pre-cor. Sebagai pekerja SSW: inspektur datang cek tulangan SEBELUM cor dimulai. Kalau gagal = harus perbaiki dulu. Mandor: 配筋検査は明日だ、準備しておいてくれ。'
      },
      {
        q: '建築確認申請で確認するものは？',
        opts: ['建築計画が法令に適合しているか', '材料の値段', '作業員の国籍', '天気予報'],
        opts_id: ['Apakah rencana bangunan sesuai peraturan', 'Harga material', 'Kewarganegaraan pekerja', 'Prakiraan cuaca'],
        ans: 0,
        exp: '建築確認申請 = permohonan izin bangunan — memeriksa apakah rencana konstruksi sesuai dengan peraturan bangunan (建築基準法). Bukan soal harga, pekerja, atau cuaca.',
        cat: 'hourei',
        desc: 'Proses perizinan bangunan. Sebagai pekerja SSW: kamu tidak mengurus ini langsung, tapi harus tahu bahwa pekerjaan tidak boleh dimulai sebelum 確認済証 (surat persetujuan) keluar.'
      },
    ],
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SET 2: 仕上げ・内装・外壁 — Finishing, Interior & Eksterior
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'bangunan-02',
    title: '仕上げ・内装・外壁',
    subtitle: 'Finishing, Interior & Eksterior',
    emoji: '🎨',
    questions: [
      {
        q: '内装工事でクロス（壁紙）を貼る前に必要な下地処理は？',
        opts: ['パテ処理で平滑にする', '水を塗る', 'ペンキを塗る', '何もしなくてよい'],
        opts_id: ['Meratakan dengan dempul/putty', 'Menyiram air', 'Mengecat', 'Tidak perlu apa-apa'],
        ans: 0,
        exp: 'Sebelum pasang wallpaper (クロス), permukaan dinding harus diratakan dengan putty/dempul (パテ). Permukaan yang tidak rata = wallpaper gelembung atau tidak merekat.',
        cat: 'sekou',
        desc: 'Persiapan permukaan sebelum wallpaper. Sebagai pekerja SSW: kamu akan bantu dempul dinding — harus benar-benar rata. Mandor: パテをしっかりかけてから、クロスを貼ってください。'
      },
      {
        q: 'タイル工事で「目地（めじ）」の役割は？',
        opts: ['タイル間の隙間を埋めて防水する', '飾りのため', 'タイルを固定するため', '色をつけるため'],
        opts_id: ['Mengisi celah antar ubin & waterproofing', 'Untuk dekorasi', 'Untuk fiksasi ubin', 'Untuk memberi warna'],
        ans: 0,
        exp: '目地 (nat/grout) = material yang mengisi celah antar ubin. Fungsi utama: waterproofing + mencegah kotoran masuk. Fiksasi ubin = mortar perekat (bukan grout).',
        cat: 'sekou',
        desc: 'Fungsi nat/grout pada ubin. Sebagai pekerja SSW: setelah ubin dipasang, kamu akan bantu aplikasi grout — ratakan dengan rubber float dan bersihkan kelebihan segera. Mandor: 目地を丁寧に入れてください。'
      },
      {
        q: '外壁塗装の工程で正しい順序は？',
        opts: ['下塗り→中塗り→上塗り', '上塗り→中塗り→下塗り', '中塗り→下塗り→上塗り', '一度塗りのみ'],
        opts_id: ['Primer→Mid coat→Top coat', 'Top coat→Mid→Primer', 'Mid→Primer→Top', 'Satu lapis saja'],
        ans: 0,
        exp: 'Urutan pengecatan eksterior: 下塗り (primer) → 中塗り (mid coat) → 上塗り (top coat). Masing-masing harus kering sebelum lapisan berikut. Satu lapis saja = tidak tahan lama.',
        cat: 'sekou',
        desc: 'Urutan pengecatan 3 lapis. Sebagai pekerja SSW: setiap lapisan harus kering dulu (乾燥時間). Cat di atas lapisan basah = mengelupas. Mandor: 下塗りが乾いてから中塗りをしてください。'
      },
      {
        q: 'フローリング（床板）の施工で「伸縮目地」を設ける理由は？',
        opts: ['温度変化による膨張・収縮に対応するため', '掃除をしやすくするため', '見た目をよくするため', '音を大きくするため'],
        opts_id: ['Mengakomodasi pemuaian/penyusutan akibat suhu', 'Agar mudah dibersihkan', 'Agar terlihat bagus', 'Agar suaranya keras'],
        ans: 0,
        exp: 'Expansion joint (伸縮目地) di lantai kayu = celah yang disediakan untuk mengakomodasi pemuaian/penyusutan material akibat perubahan suhu dan kelembaban. Tanpa ini = lantai melenting.',
        cat: 'sekou',
        desc: 'Expansion joint pada lantai. Sebagai pekerja SSW: tinggalkan celah 5-10mm di tepi dinding saat pasang lantai kayu — ini bukan kesalahan, ini desain. Mandor: 壁際に隙間を取ってください。'
      },
      {
        q: '石膏ボード（せっこうボード）の施工で注意することは？',
        opts: ['ビスの間隔と深さを均一にする', '色を選ぶ', '温度を測る', '音を確認する'],
        opts_id: ['Jarak & kedalaman sekrup harus seragam', 'Memilih warna', 'Mengukur suhu', 'Memeriksa suara'],
        ans: 0,
        exp: 'Pemasangan gypsum board: jarak sekrup (ビス間隔) harus seragam (biasanya 150-200mm di tepi, 200-300mm di tengah) dan kedalaman pas — terlalu dalam = gypsum pecah, terlalu dangkal = tidak kencang.',
        cat: 'sekou',
        desc: 'Pemasangan gypsum board. Sebagai pekerja SSW: ini pekerjaan interior yang sering. Gunakan screw gun dengan stopper agar kedalaman konsisten. Mandor: ビスのピッチは200mmにしてください。'
      },
      {
        q: 'シーリング工事（コーキング）の目的は？',
        opts: ['隙間からの雨水の浸入を防ぐ', '壁を美しくする', '壁を厚くする', '壁の色を変える'],
        opts_id: ['Mencegah air hujan masuk lewat celah', 'Mempercantik dinding', 'Menambah tebal dinding', 'Mengubah warna dinding'],
        ans: 0,
        exp: 'Sealant/caulking (シーリング) = material elastis yang mengisi celah pada sambungan (目地) untuk mencegah infiltrasi air hujan. Bukan untuk estetika utama.',
        cat: 'sekou',
        desc: 'Pekerjaan sealant. Sebagai pekerja SSW: kamu akan sering aplikasi sealant di sambungan jendela, panel, dll. Masking tape harus rapi. Mandor: シーリングの目地をきれいに仕上げてください。'
      },
      {
        q: '吹付け塗装（ふきつけとそう）で養生する理由は？',
        opts: ['塗料の飛散を防ぐ', '天気を確認するため', '写真を撮るため', '休憩するため'],
        opts_id: ['Mencegah percikan cat', 'Untuk cek cuaca', 'Untuk foto', 'Untuk istirahat'],
        ans: 0,
        exp: '養生 dalam konteks spray painting = menutup/melindungi area yang tidak boleh kena cat menggunakan masking tape + plastik sheet. Cat spray menyebar luas — tanpa 養生, semuanya kena cat.',
        cat: 'sekou',
        desc: 'Masking sebelum spray painting. Sebagai pekerja SSW: kamu akan bantu pasang plastik sheet di jendela, lantai, dan area sekitar sebelum painting spray dimulai. Mandor: 養生をしっかりしてから吹付けてください。'
      },
      {
        q: '「建具（たてぐ）」とは何を指す？',
        opts: ['ドア・窓・障子など開閉する部材', '柱', '基礎', '屋根'],
        opts_id: ['Pintu, jendela, shoji dll (elemen buka-tutup)', 'Kolom', 'Fondasi', 'Atap'],
        ans: 0,
        exp: '建具 (たてぐ) = semua elemen yang bisa dibuka-tutup: pintu (ドア), jendela (窓), shoji (障子), fusuma. Bukan kolom (柱), fondasi (基礎), atau atap (屋根).',
        cat: 'sekou',
        desc: 'Elemen buka-tutup bangunan. Sebagai pekerja SSW: pekerjaan 建具 termasuk pasang kusen, engsel, handle, kunci. Mandor: 建具の取り付けを始めてください。'
      },
      {
        q: 'アルミサッシの取り付けで重要なことは？',
        opts: ['水平と垂直を正確に合わせる', '速く取り付ける', '安い材料を使う', '色を選ぶ'],
        opts_id: ['Menjaga level horizontal & vertikal yang akurat', 'Pasang secepat mungkin', 'Pakai material murah', 'Memilih warna'],
        ans: 0,
        exp: 'Kusen aluminium (アルミサッシ) harus dipasang level (水平) dan plumb (垂直) secara akurat. Miring sedikit saja = jendela tidak bisa dibuka/ditutup dengan baik.',
        cat: 'sekou',
        desc: 'Pemasangan kusen aluminium. Sebagai pekerja SSW: selalu gunakan waterpass saat pasang sash — koreksi dengan shim kalau perlu. Mandor: サッシの水平・垂直を確認してください。'
      },
      {
        q: '外壁の「通気工法」の目的は？',
        opts: ['壁内の湿気を外に逃がす', '壁を厚くする', '壁に色をつける', '壁に音を通す'],
        opts_id: ['Membuang kelembaban dari dalam dinding', 'Menambah tebal dinding', 'Memberi warna dinding', 'Meneruskan suara'],
        ans: 0,
        exp: '通気工法 (ventilated facade) = sistem konstruksi dinding eksterior yang menyediakan celah udara (通気層) untuk membuang kelembaban/uap air dari dalam dinding. Mencegah kayu/metal berkarat.',
        cat: 'sekou',
        desc: 'Sistem dinding berventilasi. Sebagai pekerja SSW: saat pasang siding (外装材), harus ada celah udara di belakangnya — JANGAN tutup rapat. Mandor: 通気層を塞がないように注意してください。'
      },
      {
        q: '天井の「野縁（のぶち）」の役割は？',
        opts: ['天井板を取り付ける下地材', '柱を支える材料', '床板を支える材料', '外壁を支える材料'],
        opts_id: ['Rangka penopang plafon', 'Material penopang kolom', 'Material penopang lantai', 'Material penopang dinding luar'],
        ans: 0,
        exp: '野縁 (のぶち) = ceiling furring strip — rangka horizontal tempat plafon dipasang. Mirip seperti rangka hollow di Indonesia.',
        cat: 'sekou',
        desc: 'Rangka plafon. Sebagai pekerja SSW: kamu akan pasang 野縁 di bawah langit-langit sebelum gypsum board dipasang. Jarak harus rata. Mandor: 野縁のピッチを確認してください。'
      },
      {
        q: '「ユニットバス」の施工で最も注意すべきことは？',
        opts: ['防水と排水の確実な施工', '色の選定', '窓の大きさ', '照明の明るさ'],
        opts_id: ['Waterproofing & drainase yang sempurna', 'Pemilihan warna', 'Ukuran jendela', 'Kecerahan lampu'],
        ans: 0,
        exp: 'Unit bath (bathroom prefab): prioritas utama = waterproofing dan drainase. Kebocoran air di kamar mandi = kerusakan struktur di bawahnya. Warna dan pencahayaan penting tapi bukan prioritas keselamatan.',
        cat: 'sekou',
        desc: 'Instalasi kamar mandi prefab. Sebagai pekerja SSW: tes kebocoran (漏水テスト) WAJIB setelah instalasi. Mandor: 防水の漏水テストをしてください。'
      },
      {
        q: '「墨出し」で使う「墨壺（すみつぼ）」の使い方は？',
        opts: ['糸を引っ張って直線を打つ', '穴を開ける', 'ネジを締める', '釘を打つ'],
        opts_id: ['Tarik benang & hentakkan untuk garis lurus', 'Membuat lubang', 'Mengencangkan sekrup', 'Memukul paku'],
        ans: 0,
        exp: '墨壺 (sumitsubo/chalk line) = alat tradisional Jepang untuk membuat garis lurus pada permukaan. Tarik benang yang sudah dilumuri tinta → hentakkan → muncul garis lurus.',
        cat: 'sekou',
        desc: 'Chalk line tradisional Jepang. Sebagai pekerja SSW: walaupun ada laser, 墨壺 masih sering dipakai. Cara pakai: tahan ujung, tarik benang, hentakkan. Mandor: 墨壺で墨を打ってくれ。'
      },
      {
        q: '「地震力」に対する建物の構造で重要なものは？',
        opts: ['耐震壁（たいしんへき）と筋交い（すじかい）', '窓ガラスの色', 'カーテンの種類', '照明の数'],
        opts_id: ['Dinding tahan gempa & bracing', 'Warna kaca jendela', 'Jenis tirai', 'Jumlah lampu'],
        ans: 0,
        exp: 'Ketahanan gempa (耐震) dicapai dengan dinding tahan gempa (耐震壁/shear wall) dan bracing diagonal (筋交い). Warna kaca atau tirai tidak relevan dengan kekuatan struktur.',
        cat: 'sekou',
        desc: 'Elemen tahan gempa bangunan. Sebagai pekerja SSW: Jepang rawan gempa — setiap bangunan harus punya elemen 耐震. Jangan pernah potong 筋交い tanpa izin. Mandor: 筋交いは絶対に切るな！'
      },
      {
        q: '「GL工法」でボードを壁に貼る接着剤は？',
        opts: ['GLボンド（石膏系接着剤）', '木工用ボンド', 'セメント', '水'],
        opts_id: ['GL Bond (adhesive berbasis gypsum)', 'Lem kayu', 'Semen', 'Air'],
        ans: 0,
        exp: 'GL工法 = metode pemasangan plasterboard langsung ke dinding beton menggunakan GLボンド (adhesive berbasis gypsum). Bukan lem kayu (terlalu lemah) atau semen (terlalu kaku).',
        cat: 'sekou',
        desc: 'Metode tempel plasterboard langsung. Sebagai pekerja SSW: oleskan GL Bond dalam gumpalan (だんご状) di belakang board, lalu tekan ke dinding beton. Mandor: GLボンドをだんご状に付けてください。'
      },
    ],
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SET 3: 建築の安全管理 — Keselamatan Konstruksi Bangunan
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'bangunan-03',
    title: '建築の安全管理',
    subtitle: 'Keselamatan Konstruksi Bangunan',
    emoji: '🛡️',
    questions: [
      {
        q: '高所作業で「親綱（おやづな）」の設置が必要なのは？',
        opts: ['安全帯（ハーネス）を接続するため', '材料を運ぶため', '足場を固定するため', '看板を吊るため'],
        opts_id: ['Untuk menghubungkan harness keselamatan', 'Untuk mengangkut material', 'Untuk mengikat scaffolding', 'Untuk menggantung papan nama'],
        ans: 0,
        exp: '親綱 (おやづな/lifeline) = tali horizontal yang dipasang di ketinggian sebagai titik kait untuk harness (安全帯/ハーネス). Bukan tali untuk angkat material atau ikat scaffolding.',
        cat: 'anzen',
        desc: 'Lifeline untuk harness. Sebagai pekerja SSW: sebelum naik ke ketinggian, pastikan ada 親綱 yang terpasang kuat. Kaitkan harness-mu ke sini. Mandor: 親綱にハーネスを接続してください。'
      },
      {
        q: '建築現場での「開口部」の危険防止措置は？',
        opts: ['手すり・覆い・安全ネットの設置', '看板を立てる', '色テープを貼る', '声で注意する'],
        opts_id: ['Pasang guardrail, tutup, & safety net', 'Pasang papan nama', 'Pasang tape warna', 'Teriakkan peringatan'],
        ans: 0,
        exp: 'Lubang/bukaan (開口部) di lantai atau dinding = risiko jatuh. Wajib pasang guardrail (手すり), tutup (覆い), atau safety net. Tape warna atau teriakan saja TIDAK cukup.',
        cat: 'anzen',
        desc: 'Pengamanan lubang di lantai/dinding. Sebagai pekerja SSW: lubang yang dibiarkan terbuka tanpa guardrail = orang bisa jatuh dan tewas. WAJIB lapor. Mandor: 開口部に手すりを設けてください。'
      },
      {
        q: '電動工具の使用前に確認すべきことは？',
        opts: ['コードの損傷・アースの接続・スイッチの動作', '工具の色', '工具の重さ', '工具の値段'],
        opts_id: ['Kerusakan kabel, sambungan arde, fungsi switch', 'Warna alat', 'Berat alat', 'Harga alat'],
        ans: 0,
        exp: 'Sebelum pakai power tool: cek kabel (損傷), grounding/arde (アース接続), dan fungsi switch (スイッチ動作). Kabel rusak = risiko kesetrum. Warna dan harga tidak relevan.',
        cat: 'anzen',
        desc: 'Pemeriksaan alat listrik. Sebagai pekerja SSW: tangan basah + kabel rusak = kesetrum. Cek SEBELUM colok listrik. Mandor: 電動工具の点検は済みましたか？'
      },
      {
        q: '解体工事で最初にすることは？',
        opts: ['ライフライン（電気・ガス・水道）の切断確認', '壁を壊す', '屋根を外す', '窓を割る'],
        opts_id: ['Konfirmasi pemutusan utilitas (listrik, gas, air)', 'Menghancurkan dinding', 'Membuka atap', 'Memecahkan jendela'],
        ans: 0,
        exp: 'Langkah pertama pembongkaran: KONFIRMASI bahwa utilitas (listrik, gas, air) sudah diputus. Mulai membongkar tanpa memutus utilitas = ledakan gas, kesetrum, kebanjiran.',
        cat: 'anzen',
        desc: 'Prosedur awal pembongkaran. Sebagai pekerja SSW: JANGAN sentuh apa pun di bangunan yang akan dibongkar sebelum mandor konfirmasi utilitas sudah diputus.'
      },
      {
        q: 'クレーンの「定格荷重」を超えて吊るとどうなる？',
        opts: ['転倒やワイヤーの破断の危険', '速く作業できる', '問題はない', 'クレーンが速くなる'],
        opts_id: ['Bahaya terbalik atau putus tali sling', 'Bisa kerja lebih cepat', 'Tidak masalah', 'Crane jadi lebih cepat'],
        ans: 0,
        exp: 'Melebihi kapasitas angkat (定格荷重) crane = risiko crane terbalik (転倒) atau wire/sling putus (破断). INI MEMATIKAN. Tidak pernah "tidak masalah" melebihi kapasitas.',
        cat: 'anzen',
        desc: 'Bahaya overload crane. Sebagai pekerja SSW: kalau kamu diminta angkat beban yang kelihatan terlalu berat untuk crane-nya, WAJIB tanya operator. Mandor: 定格荷重を絶対に超えるな！'
      },
      {
        q: '丸のこの使用で「キックバック」とは？',
        opts: ['刃が材料に噛み込んで工具が跳ね返ること', '工具が落ちること', '電源が切れること', '音が出ること'],
        opts_id: ['Bilah tersangkut & alat terpental balik', 'Alat jatuh', 'Listrik mati', 'Bunyi keluar'],
        ans: 0,
        exp: 'Kickback (キックバック) pada circular saw = bilah tersangkut material dan alat terpental balik ke arah operator. Penyebab cedera serius paling umum dari circular saw.',
        cat: 'anzen',
        desc: 'Bahaya kickback circular saw. Sebagai pekerja SSW: selalu pegang circular saw dengan DUA tangan, jangan paksa potong, dan pastikan material tertahan. Mandor: 丸のこのキックバックに注意しろ。'
      },
      {
        q: '「脚立（きゃたつ）」の正しい使い方は？',
        opts: ['天板に乗らない・開き止めを確認する', '天板に立つ', '片足で使う', '斜めに置く'],
        opts_id: ['Jangan injak puncak & cek pengunci terbuka', 'Berdiri di puncak', 'Pakai satu kaki', 'Letakkan miring'],
        ans: 0,
        exp: 'Tangga lipat (脚立): DILARANG berdiri di puncak (天板) — risiko jatuh. Selalu pastikan pengunci terbuka (開き止め) terkunci. Jangan pernah pakai miring.',
        cat: 'anzen',
        desc: 'Penggunaan tangga lipat yang benar. Sebagai pekerja SSW: banyak kecelakaan dari jatuh tangga lipat. Aturan Jepang sangat ketat soal ini. Mandor: 脚立の天板には乗るな！'
      },
      {
        q: '作業中に地震が起きたらまず何をする？',
        opts: ['作業を中止し安全な場所に避難する', '作業を続ける', '写真を撮る', '電話をかける'],
        opts_id: ['Hentikan kerja & evakuasi ke tempat aman', 'Lanjutkan kerja', 'Ambil foto', 'Telepon'],
        ans: 0,
        exp: 'Saat gempa di proyek konstruksi: SEGERA hentikan semua pekerjaan dan evakuasi ke tempat yang ditentukan (避難場所). Jangan lanjutkan kerja — aftershock bisa menjatuhkan material.',
        cat: 'anzen',
        desc: 'Prosedur gempa di proyek. Sebagai pekerja SSW: hafal jalur evakuasi (避難経路) dari lokasi kerjamu. Di Jepang gempa sering — ini bukan latihan. Mandor: 地震です！作業を中止して避難してください！'
      },
      {
        q: '「酸素欠乏」の危険がある場所は？',
        opts: ['マンホール・タンク・地下ピット', '事務所', '駐車場', '屋上'],
        opts_id: ['Manhole, tangki, pit bawah tanah', 'Kantor', 'Parkiran', 'Rooftop'],
        ans: 0,
        exp: 'Ruang tertutup/sempit (マンホール, タンク, 地下ピット) berisiko defisiensi oksigen (酸素欠乏). Kantor, parkiran terbuka, dan rooftop umumnya aman.',
        cat: 'anzen',
        desc: 'Lokasi risiko kekurangan oksigen. Sebagai pekerja SSW: JANGAN masuk manhole/tangki tanpa ukur O₂ dan tanpa buddy system. Mandor: 酸素濃度を測定してから入ってください。'
      },
      {
        q: '粉じん作業で使用する保護具は？',
        opts: ['防じんマスク', '軍手だけ', '長靴だけ', 'ヘルメットだけ'],
        opts_id: ['Masker anti debu', 'Hanya sarung tangan kain', 'Hanya sepatu boot', 'Hanya helm'],
        ans: 0,
        exp: 'Pekerjaan yang menghasilkan debu (粉じん) seperti cutting beton, grinding, sanding = WAJIB pakai masker anti debu (防じんマスク). Sarung tangan/sepatu/helm saja tidak melindungi paru-paru.',
        cat: 'anzen',
        desc: 'Perlindungan dari debu. Sebagai pekerja SSW: debu beton, kayu, batu = berbahaya untuk paru-paru jangka panjang (じん肺). Pakai masker yang benar. Mandor: 防じんマスクを着用してください。'
      },
      {
        q: '「玉掛け作業」で荷物を吊る前に確認することは？',
        opts: ['ワイヤーロープの傷・荷重・重心', '天気予報', '作業員の昼食', '工事の進捗'],
        opts_id: ['Kerusakan wire rope, beban, titik berat', 'Prakiraan cuaca', 'Makan siang pekerja', 'Progress proyek'],
        ans: 0,
        exp: 'Sebelum angkat beban dengan crane (玉掛け): cek wire rope (ワイヤーロープ) tidak rusak, berat beban (荷重) tidak melebihi kapasitas, dan titik berat (重心) seimbang.',
        cat: 'anzen',
        desc: 'Checklist rigging sebelum angkat. Sebagai pekerja SSW: wire rope yang aus = putus saat angkat = beban jatuh = FATAL. Mandor: ワイヤーの傷を確認してから吊ってください。'
      },
      {
        q: '建築現場で「保護帽（ほごぼう）」の着用が義務づけられている理由は？',
        opts: ['落下物からの頭部保護', 'ファッション', '日よけ', '通信機器'],
        opts_id: ['Melindungi kepala dari benda jatuh', 'Fashion', 'Pelindung matahari', 'Alat komunikasi'],
        ans: 0,
        exp: 'Helm (保護帽) wajib dipakai untuk melindungi kepala dari benda jatuh (落下物). Bukan aksesoris fashion, bukan pelindung matahari, bukan alat komunikasi.',
        cat: 'anzen',
        desc: 'Kewajiban memakai helm. Sebagai pekerja SSW: helm harus dipakai setiap saat di area kerja — termasuk saat "hanya lewat". Mandor: 保護帽を必ず着用してください。'
      },
      {
        q: '「作業手順書」を確認する理由は？',
        opts: ['安全で効率的に作業するため', '暇つぶし', '上司に見せるため', '試験のため'],
        opts_id: ['Agar kerja aman & efisien', 'Mengisi waktu luang', 'Untuk ditunjukkan ke atasan', 'Untuk ujian'],
        ans: 0,
        exp: '作業手順書 (SOP/prosedur kerja) dibaca SEBELUM mulai kerja agar: (1) tahu urutan yang benar, (2) tahu risiko di setiap langkah, (3) tahu APD yang diperlukan.',
        cat: 'anzen',
        desc: 'Pentingnya membaca SOP. Sebagai pekerja SSW: selalu baca 作業手順書 sebelum pekerjaan baru yang belum pernah kamu lakukan. Malu bertanya = celaka. Mandor: 作業手順書を読んでから始めてください。'
      },
      {
        q: '火災が発生した場合、最初にすることは？',
        opts: ['大声で周囲に知らせ、119番通報する', '写真を撮る', '逃げるだけ', '自分で消そうとする'],
        opts_id: ['Teriak peringatan & hubungi 119', 'Ambil foto', 'Langsung kabur', 'Coba padamkan sendiri'],
        ans: 0,
        exp: 'Saat kebakaran: (1) teriak peringatan ke sekitar (大声で知らせる), (2) hubungi 119 (pemadam kebakaran). JANGAN coba padamkan sendiri kalau api sudah besar — evakuasi dulu.',
        cat: 'anzen',
        desc: 'Prosedur kebakaran. Sebagai pekerja SSW: nomor darurat Jepang = 119 (pemadam) dan 110 (polisi). Hafal. Lokasi APAR (消火器) dan alarm (火災報知器) harus kamu tahu.'
      },
      {
        q: '「TBM（ツールボックスミーティング）」の目的は？',
        opts: ['作業前に危険を話し合い、安全を確認する', '工具を売る', '給料を話し合う', '昼食の注文'],
        opts_id: ['Diskusi bahaya & konfirmasi keselamatan sebelum kerja', 'Menjual alat', 'Diskusi gaji', 'Pesan makan siang'],
        ans: 0,
        exp: 'TBM (Tool Box Meeting) = briefing singkat sebelum kerja (biasanya 10-15 menit) untuk diskusi bahaya spesifik pekerjaan hari itu dan konfirmasi tindakan pencegahan.',
        cat: 'anzen',
        desc: 'Briefing keselamatan harian. Sebagai pekerja SSW: TBM mirip KY tapi lebih fokus ke pekerjaan spesifik grup kamu. Dengarkan baik-baik dan tanya kalau tidak mengerti. Mandor: これからTBMを始めます。'
      },
    ],
  },
];

// Add track field to sipil/bangunan sets
const SIPIL_WITH_TRACK = SIPIL_SETS.map(s => ({ ...s, track: 'doboku' }));
const BANGUNAN_WITH_TRACK = BANGUNAN_SETS.map(s => ({ ...s, track: 'kenchiku' }));

export const QUIZ_SETS = [...WAYGROUND_SETS, ...CSV_SETS, ...SIPIL_WITH_TRACK, ...BANGUNAN_WITH_TRACK];

export const getQuizSetsForTrack = (track) =>
  QUIZ_SETS.filter((s) => s.track === 'common' || s.track === track);
