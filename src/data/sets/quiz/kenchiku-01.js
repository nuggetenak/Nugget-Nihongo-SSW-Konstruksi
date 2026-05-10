// kenchiku-01.js — Quiz Set: kenchiku-01
export const SET_KENCHIKU_01 = {
    id: 'kenchiku-01',
    title: '型枠・鉄筋・コンクリート',
    subtitle: 'Bekisting, Tulangan & Beton',
    emoji: '🏗️',
    questions: [
      {
        id: 1,
        q: 'コンクリートの「スランプ試験《しけん》」で測定《そくてい》するものは？',
        hint: 'Apa yang diukur dalam uji slump beton?',
        opts: ['軟らかさ《やわらかさ》（コンシステンシー）', '圧縮《あっしゅく》強度《きょうど》', '引張《ひっぱり》強度《きょうど》', '含水率《がんすいりつ》'],
        opts_id: ['Kelunakan (konsistensi)', 'Kuat tekan', 'Kuat tarik', 'Kadar air'],
        ans: 0,
        exp: 'Slump test mengukur konsistensi (kelunakan/flowability) beton segar, BUKAN kekuatan. Kuat tekan diukur setelah curing 28 hari dengan uji silinder.',
        cat: 'sekou',
        desc: 'Uji slump beton segar. Sebagai pekerja SSW bangunan: setiap truk mixer datang, mandor cek slump. Kalau nilainya di luar spesifikasi = beton DITOLAK. Mandor: スランプ値を確認してください。'
      },
      {
        id: 2,
        q: '鉄筋《てっきん》の「かぶり厚さ《あつさ》」の目的《もくてき》は？',
        hint: 'Apa fungsi selimut beton (かぶり厚さ) pada tulangan?',
        opts: ['鉄筋《てっきん》を腐食《ふしょく》から守る《まもる》', '建物《たてもの》を美しく《うつくしく》する', '鉄筋《てっきん》を軽く《かるく》する', '工期《こうき》を短縮《たんしゅく》する'],
        opts_id: ['Melindungi tulangan dari korosi', 'Mempercantik bangunan', 'Meringankan tulangan', 'Mempersingkat jadwal'],
        ans: 0,
        exp: 'Concrete cover (かぶり厚さ) = tebal selimut beton di atas tulangan. Fungsi utama: melindungi besi dari korosi (karat). Selimut tipis = besi cepat berkarat = bangunan runtuh.',
        cat: 'sekou',
        desc: 'Selimut beton untuk tulangan. Sebagai pekerja SSW: saat pasang tulangan, WAJIB pasang spacer agar besi tidak menempel bekisting. Mandor: かぶりが足りないぞ、スペーサーを入れてくれ。'
      },
      {
        id: 3,
        q: '型枠《かたわく》の組立《くみた》てで最も《もっとも》重要《じゅうよう》なことは？',
        hint: 'Hal terpenting dalam pemasangan bekisting adalah?',
        opts: ['寸法《すんぽう》精度《せいど》と強度《きょうど》の確保《かくほ》', '色《いろ》の統一《とういつ》', '材料《ざいりょう》の値段《ねだん》', '作業《さぎょう》の速さ《はやさ》'],
        opts_id: ['Menjamin akurasi dimensi & kekuatan', 'Keseragaman warna', 'Harga material', 'Kecepatan kerja'],
        ans: 0,
        exp: 'Bekisting (型枠) harus akurat dimensinya dan cukup kuat menahan tekanan beton segar. Warna tidak relevan. Murah atau cepat tapi tidak akurat/kuat = beton bocor atau miring.',
        cat: 'sekou',
        desc: 'Prinsip pemasangan bekisting. Sebagai pekerja SSW: bekisting yang jebol saat cor = kecelakaan serius + beton terbuang. Cek setiap sambungan sebelum cor dimulai. Mandor: 型枠の精度を確認してください。'
      },
      {
        id: 4,
        q: 'コンクリートの打設《だせつ》で「バイブレーター」を使う《つかう》理由《りゆう》は？',
        hint: 'Mengapa vibrator digunakan saat pengecoran beton?',
        opts: ['空気《くうき》を抜いて《ぬいて》密実《みつじつ》にする', '音《おと》を出して《だして》合図《あいず》する', 'コンクリートを温める《あたためる》', 'コンクリートを冷やす《ひやす》'],
        opts_id: ['Mengeluarkan udara agar padat', 'Memberi sinyal bunyi', 'Menghangatkan beton', 'Mendinginkan beton'],
        ans: 0,
        exp: 'Vibrator beton digunakan untuk mengeluarkan gelembung udara (空気) agar beton padat (密実). Beton dengan banyak rongga udara = lemah. Vibrator bukan alat sinyal atau pengatur suhu.',
        cat: 'sekou',
        desc: 'Vibrator untuk pemadatan beton. Sebagai pekerja SSW: kamu akan sering pegang vibrator saat cor — masukkan vertikal, jangan miring. Mandor: バイブレーターを丁寧にかけてください。'
      },
      {
        id: 5,
        q: '足場《あしば》の点検《てんけん》はいつ行う《おこなう》？',
        hint: 'Kapan inspeksi scaffolding dilakukan?',
        opts: ['毎日《まいにち》の作業《さぎょう》開始前《かいしまえ》', '月《つき》に1回《かい》', '年《ねん》に1回《かい》', '足場《あしば》を解体《かいたい》するとき'],
        opts_id: ['Setiap hari sebelum mulai kerja', 'Sebulan sekali', 'Setahun sekali', 'Saat bongkar scaffolding'],
        ans: 0,
        exp: 'Inspeksi scaffolding WAJIB setiap hari sebelum kerja dimulai (毎日の作業開始前). Bukan bulanan atau tahunan. Setelah hujan/angin kencang juga harus inspeksi ulang.',
        cat: 'anzen',
        desc: 'Inspeksi harian scaffolding. Sebagai pekerja SSW: sebelum naik, cek clamp, papan lantai, guardrail. Kalau ada yang longgar = LAPOR, jangan naik. Mandor: 足場の点検はしましたか？'
      },
      {
        id: 6,
        q: '鉄筋《てっきん》の継手《つぎて》で「重ね《かさね》継手《つぎて》」の長さ《ながさ》は？',
        hint: 'Berapa panjang minimum sambungan tumpangan (重ね継手) tulangan?',
        opts: ['鉄筋径《てっきんけい》の40倍《ばい》以上《いじょう》', '鉄筋径《てっきんけい》の5倍《ばい》以上《いじょう》', '鉄筋径《てっきんけい》の2倍《ばい》以上《いじょう》', '長さ《ながさ》は決まって《きまって》いない'],
        opts_id: ['≥40× diameter tulangan', '≥5× diameter tulangan', '≥2× diameter tulangan', 'Tidak ada ketentuan'],
        ans: 0,
        exp: 'Overlap joint (重ね継手) = panjang tumpangan ≥40× diameter tulangan (contoh: D13 → tumpangan ≥520mm). 5× atau 2× terlalu pendek = sambungan tidak kuat.',
        cat: 'sekou',
        desc: 'Panjang tumpangan tulangan. Sebagai pekerja SSW: ini angka yang WAJIB diingat — kalau tumpangan kurang, inspektur akan tolak. Mandor: 重ね継手の長さは足りているか確認しろ。'
      },
      {
        id: 7,
        q: '建築《けんちく》現場《げんば》で「墨出《すみだ》し」とは？',
        hint: 'Apa yang dimaksud dengan "sumidashi" di lokasi konstruksi?',
        opts: ['壁《かべ》や柱《はしら》の位置《いち》を床《ゆか》に印《しるし》をつける作業《さぎょう》', '壁《かべ》にペンキを塗る《ぬる》作業《さぎょう》', '床《ゆか》を洗う《あらう》作業《さぎょう》', '窓《まど》を取り付ける《とりつける》作業《さぎょう》'],
        opts_id: ['Menandai posisi dinding/kolom di lantai', 'Mengecat dinding', 'Mencuci lantai', 'Memasang jendela'],
        ans: 0,
        exp: '墨出し = marking/layout — menandai posisi dinding, kolom, dan elemen struktur di permukaan lantai menggunakan tinta墨 (sumi) dan 墨壺 (sumitsubo/chalk line).',
        cat: 'sekou',
        desc: 'Marking posisi konstruksi di lantai. Sebagai pekerja SSW: ini pekerjaan presisi — garis yang kamu tarik menentukan posisi tembok. Salah 1cm = tembok miring. Mandor: 墨出しの位置を確認してくれ。'
      },
      {
        id: 8,
        q: 'コンクリートの「養生《ようじょう》」で水《みず》をかける理由《りゆう》は？',
        hint: 'Mengapa beton disiram air dalam proses curing?',
        opts: ['乾燥《かんそう》によるひび割れ《われ》を防ぐ《ふせぐ》', 'コンクリートを冷やす《ひやす》', '色《いろ》をつける', '表面《ひょうめん》をきれいにする'],
        opts_id: ['Mencegah retak akibat kering', 'Mendinginkan beton', 'Memberi warna', 'Membersihkan permukaan'],
        ans: 0,
        exp: 'Curing basah = menjaga kelembaban beton agar reaksi semen berlanjut optimal. Beton yang terlalu cepat kering = retak (乾燥収縮ひび割れ). Bukan untuk mendinginkan atau membersihkan.',
        cat: 'sekou',
        desc: 'Curing basah beton. Sebagai pekerja SSW: kamu akan diminta siram air ke beton yang baru cor atau tutup dengan curing sheet. Mandor: コンクリートの散水養生をしてください。'
      },
      {
        id: 9,
        q: '外壁《がいへき》の「左官《さかん》工事《こうじ》」とは？',
        hint: 'Apa itu pekerjaan "sakan" pada dinding luar?',
        opts: ['モルタルやプラスターを塗る《ぬる》工事《こうじ》', '電気《でんき》の配線《はいせん》工事《こうじ》', '水道管《すいどうかん》の工事《こうじ》', 'ガラスを入れる《いれる》工事《こうじ》'],
        opts_id: ['Pekerjaan plester/acian mortar', 'Instalasi kabel listrik', 'Instalasi pipa air', 'Pemasangan kaca'],
        ans: 0,
        exp: '左官工事 (plastering) = pekerjaan plester/acian menggunakan mortar atau plaster. Bukan pekerjaan listrik (電気), pipa (水道), atau kaca (ガラス).',
        cat: 'sekou',
        desc: 'Pekerjaan plester/acian. Sebagai pekerja SSW bangunan: kamu mungkin diminta bantu campur mortar dan bawa ke tukang plester. Mandor: モルタルを練って持ってきてくれ。'
      },
      {
        id: 10,
        q: '「根太《ねだ》」とは建物《たてもの》のどの部分《ぶぶん》？',
        hint: 'Bagian bangunan mana yang disebut "neda"?',
        opts: ['床《ゆか》を支える《ささえる》横架材《おうかざい》', '壁《かべ》の材料《ざいりょう》', '屋根《やね》の部品《ぶひん》', '基礎《きそ》の鉄筋《てっきん》'],
        opts_id: ['Balok horizontal penopang lantai', 'Material dinding', 'Komponen atap', 'Tulangan fondasi'],
        ans: 0,
        exp: '根太 (ねだ) = floor joist/balok lantai horizontal yang menopang papan lantai. Bukan bagian dinding, atap, atau fondasi.',
        cat: 'sekou',
        desc: 'Balok lantai kayu. Sebagai pekerja SSW di pekerjaan kayu (木工事): kamu akan pasang 根太 di atas 大引 sebelum papan lantai dipasang. Mandor: 根太の間隔は303mmにしてください。'
      },
      {
        id: 11,
        q: '防水《ぼうすい》工事《こうじ》で「シート防水《ぼうすい》」の施工《せこう》で注意《ちゅうい》することは？',
        hint: 'Apa yang perlu diperhatikan saat memasang waterproofing membran sheet?',
        opts: ['接合部《せつごうぶ》からの漏水《ろうすい》防止《ぼうし》', '色《いろ》の選択《せんたく》', '工期《こうき》の短縮《たんしゅく》', '景観《けいかん》への配慮《はいりょ》'],
        opts_id: ['Mencegah bocor di sambungan', 'Pemilihan warna', 'Mempersingkat jadwal', 'Pertimbangan estetika'],
        ans: 0,
        exp: 'Waterproofing sheet: titik paling rawan bocor = sambungan antar sheet (接合部). Harus di-overlap minimal sesuai spec dan direkatkan sempurna.',
        cat: 'sekou',
        desc: 'Waterproofing membran sheet. Sebagai pekerja SSW: saat pasang sheet, overlap harus tepat dan tidak ada gelembung udara di bawahnya. Mandor: シートの重ね部分を確認してください。'
      },
      {
        id: 12,
        q: '建築《けんちく》現場《げんば》で「仮設《かせつ》工事《こうじ》」に含まれる《ふくまれる》ものは？',
        hint: 'Apa yang termasuk dalam pekerjaan sementara (仮設工事)?',
        opts: ['足場《あしば》・仮囲《かりかこ》い・仮設《かせつ》電気《でんき》', '基礎《きそ》工事《こうじ》', '内装《ないそう》工事《こうじ》', '設備《せつび》工事《こうじ》'],
        opts_id: ['Scaffolding, pagar sementara, listrik sementara', 'Pekerjaan fondasi', 'Pekerjaan interior', 'Pekerjaan MEP'],
        ans: 0,
        exp: '仮設工事 = pekerjaan sementara yang mendukung konstruksi: scaffolding (足場), pagar proyek (仮囲い), instalasi listrik sementara (仮設電気). Ini dibongkar setelah proyek selesai.',
        cat: 'sekou',
        desc: 'Pekerjaan sementara/temporary. Sebagai pekerja SSW: 仮設 = sementara, bukan permanen. Scaffolding, kantor proyek, toilet portabel — semua 仮設. Mandor: 仮設足場の組立てを手伝ってくれ。'
      },
      {
        id: 13,
        q: '「断熱材《だんねつざい》」の役割《やくわり》は？',
        hint: 'Apa fungsi material insulasi (断熱材)?',
        opts: ['外部《がいぶ》の熱《ねつ》を遮断《しゃだん》する', '建物《たてもの》を飾る《かざる》', '音《おと》を出す《だす》', '水《みず》を通す《とおす》'],
        opts_id: ['Menghalangi panas dari luar', 'Menghias bangunan', 'Menghasilkan suara', 'Mengalirkan air'],
        ans: 0,
        exp: '断熱材 = insulation material — menghalangi transfer panas antara luar dan dalam bangunan. Bukan dekorasi, bukan penghasil suara, dan bukan saluran air.',
        cat: 'sekou',
        desc: 'Material insulasi termal. Sebagai pekerja SSW: kamu akan pasang styrofoam, glasswool, atau rockwool di dinding/atap. Celah = kebocoran termal = rugi energi. Mandor: 断熱材に隙間がないように施工してください。'
      },
      {
        id: 14,
        q: '「配筋《はいきん》検査《けんさ》」は何《なに》を確認《かくにん》する？',
        hint: 'Apa yang dicek dalam inspeksi tulangan (配筋検査)?',
        opts: ['鉄筋《てっきん》の配置《はいち》・間隔《かんかく》・かぶりが図面《ずめん》通り《どおり》か', 'コンクリートの温度《おんど》', '作業員《さぎょういん》の資格《しかく》', '足場《あしば》の安全《あんぜん》'],
        opts_id: ['Posisi, jarak, & selimut tulangan sesuai gambar', 'Suhu beton', 'Sertifikat pekerja', 'Keamanan scaffolding'],
        ans: 0,
        exp: '配筋検査 = inspeksi tulangan sebelum cor — memastikan posisi (配置), jarak (間隔), dan selimut beton (かぶり) sesuai gambar desain. Ini dilakukan SEBELUM beton dicor.',
        cat: 'sekou',
        desc: 'Inspeksi tulangan pre-cor. Sebagai pekerja SSW: inspektur datang cek tulangan SEBELUM cor dimulai. Kalau gagal = harus perbaiki dulu. Mandor: 配筋検査は明日だ、準備しておいてくれ。'
      },
      {
        id: 15,
        q: '建築《けんちく》確認《かくにん》申請《しんせい》で確認《かくにん》するものは？',
        hint: 'Apa yang diperiksa dalam proses izin bangunan (建築確認申請)?',
        opts: ['建築《けんちく》計画《けいかく》が法令《ほうれい》に適合《てきごう》しているか', '材料《ざいりょう》の値段《ねだん》', '作業員《さぎょういん》の国籍《こくせき》', '天気《てんき》予報《よほう》'],
        opts_id: ['Apakah rencana bangunan sesuai peraturan', 'Harga material', 'Kewarganegaraan pekerja', 'Prakiraan cuaca'],
        ans: 0,
        exp: '建築確認申請 = permohonan izin bangunan — memeriksa apakah rencana konstruksi sesuai dengan peraturan bangunan (建築基準法). Bukan soal harga, pekerja, atau cuaca.',
        cat: 'hourei',
        desc: 'Proses perizinan bangunan. Sebagai pekerja SSW: kamu tidak mengurus ini langsung, tapi harus tahu bahwa pekerjaan tidak boleh dimulai sebelum 確認済証 (surat persetujuan) keluar.'
      },
    ],
  };
