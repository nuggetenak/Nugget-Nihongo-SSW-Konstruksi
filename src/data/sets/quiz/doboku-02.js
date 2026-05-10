// doboku-02.js — Quiz Set: doboku-02
export const SET_DOBOKU_02 = {
    id: 'doboku-02',
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
  };
