// kenchiku-01.js — Quiz Set: kenchiku-01
export const SET_KENCHIKU_01 = {
    id: 'kenchiku-01',
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
  };
