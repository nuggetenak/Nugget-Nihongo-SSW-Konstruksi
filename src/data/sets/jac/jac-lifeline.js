// JAC Official — 実技 (Praktik) Lifeline Sets st1+st2 · 30qs · track:lifeline
export const JAC_LIFELINE = [
  {
    id: 'st1_q01',
    set: 'st1',
    setLabel: '実技 Set 1',
    topic: 'listrik',
    q: '過大電流が流れた時に、自動的に電気の供給を止める安全装置を、何というか。',
    hint: 'Ketika arus berlebih mengalir, alat keselamatan yang secara otomatis menghentikan pasokan listrik disebut apa?',
    opts: [
      'リレー',
      'コンセント',
      'ブレーカー',
      'ストリップゲージ'
    ],
    opts_id: [
      'Relay',
      'Stop kontak',
      'Breaker / NFB',
      'Strip gauge'
    ],
    ans: 2,
    img: null,
    exp: 'ブレーカー (NFB = No-Fuse Breaker) secara otomatis memutus pasokan listrik saat arus berlebih. Kartu #41.',
    related_card_id: 61,
    track: 'lifeline'
  },
  {
    id: 'st1_q02',
    set: 'st1',
    setLabel: '実技 Set 1',
    topic: 'listrik',
    q: '写真の道具の名前はどれか。',
    hint: 'Apa nama alat dalam foto?',
    opts: [
      'ドライバー',
      'ポンチ',
      'ファイバカッター',
      '電工ナイフ《でんこうナイフ》'
    ],
    opts_id: [
      'Obeng',
      'Punch/penanda',
      'Pemotong serat',
      'Pisau listrik'
    ],
    ans: 3,
    img: null,
    photoDesc: '📷 Foto: Pisau lipat dengan bilah melengkung, ujung TUMPUL (bukan lancip). Ciri khas: bilah agak lebar, ujung membulat tumpul untuk melindungi konduktor.',
    exp: '電工ナイフ (Pisau listrik) — bilah melengkung dengan ujung TUMPUL, khusus untuk mengupas isolasi kabel. Kartu #104.',
    related_card_id: 66,
    track: 'lifeline'
  },
  {
    id: 'st1_q03',
    set: 'st1',
    setLabel: '実技 Set 1',
    topic: 'pipa',
    q: '写真の道具の名前はどれか。',
    hint: 'Apa nama alat dalam foto?',
    opts: [
      'パイプ万力《パイプまんりき》',
      'パイプカッター',
      'パイプねじ切機《パイプねじきりき》',
      'パイプレンチ'
    ],
    opts_id: [
      'Ragum pipa',
      'Pemotong pipa',
      'Mesin ulir pipa',
      'Kunci pipa'
    ],
    ans: 1,
    img: null,
    photoDesc: '📷 Foto: Alat berbentuk C/U kecil dengan roda pemotong di ujung dan pegangan hitam. Berbeda dari kunci pipa yang seperti tang besar.',
    exp: 'パイプカッター — memotong pipa dengan cara roda pemotong mengencang melingkar pipa. Kartu #60.',
    related_card_id: 88,
    track: 'lifeline'
  },
  {
    id: 'st1_q04',
    set: 'st1',
    setLabel: '実技 Set 1',
    topic: 'pemadam',
    q: '写真の設備の名前はどれか。',
    hint: 'Apa nama peralatan dalam foto?',
    opts: [
      '消火器《しょうかき》',
      '屋内消火栓設備《おくないしょうかせんせつび》',
      'スプリンクラー設備《スプリンクラーせつび》',
      '屋外消火栓設備《おくがいしょうかせんせつび》'
    ],
    opts_id: [
      'APAR',
      'Hidran dalam gedung',
      'Sprinkler',
      'Hidran luar gedung'
    ],
    ans: 3,
    img: null,
    photoDesc: '📷 Foto: Beberapa tiang hidran berwarna silver/perak berdiri di area luar gedung, di antara semak-semak. Terletak di LUAR ruangan.',
    exp: '屋外消火栓設備 — hidran di LUAR gedung, untuk pemadaman awal & mencegah api menyebar (jangkauan lantai 1-2). Kartu #74.',
    related_card_id: 107,
    track: 'lifeline'
  },
  {
    id: 'st1_q05',
    set: 'st1',
    setLabel: '実技 Set 1',
    topic: 'umum',
    q: '写真の道具の名前はどれか。',
    hint: 'Apa nama alat dalam foto?',
    opts: [
      '墨さし《すみさし》',
      'チョーク',
      '墨つぼ《すみつぼ》',
      'レーザー墨出し器《レーザーすみだしき》'
    ],
    opts_id: [
      'Kuas tinta',
      'Kapur',
      'Wadah tinta/chalk line reel',
      'Laser marker'
    ],
    ans: 2,
    img: null,
    photoDesc: '📷 Foto: Alat kecil berbentuk drum/gulungan dengan cangkang logam gelap dan pengait benang. Ada tombol/roda di badan untuk menggulung benang.',
    exp: '墨つぼ — membuat garis lurus panjang dengan benang bercelup tinta. Kartu #106.',
    related_card_id: 145,
    track: 'lifeline'
  },
  {
    id: 'st1_q06',
    set: 'st1',
    setLabel: '実技 Set 1',
    topic: 'umum',
    q: '写真の道具の名前はどれか。',
    hint: 'Apa nama alat dalam foto?',
    opts: [
      '三脚《さんきゃく》',
      '気泡管《きほうかん》',
      '望遠鏡《ぼうえんきょう》',
      'レベル'
    ],
    opts_id: [
      'Tripod',
      'Tabung gelembung',
      'Teleskop',
      'Level/waterpas survei'
    ],
    ans: 3,
    img: null,
    photoDesc: '📷 Foto: Instrumen survei putih/abu dengan teleskop horizontal, dipasang di atas tripod kayu di lingkungan hutan/outdoor. Bukan transit (yang mengukur sudut vertikal).',
    exp: 'レベル (水準器) — instrumen survei untuk mengukur ketinggian/elevasi, dipasang di tripod. Kartu #94.',
    related_card_id: 138,
    track: 'lifeline'
  },
  {
    id: 'st1_q07',
    set: 'st1',
    setLabel: '実技 Set 1',
    topic: 'umum',
    q: '施工管理とは、施工計画に基づいて、施工者が、所定の（　）の工事目的物を完成させるために必要な管理のことである。',
    hint: 'Manajemen konstruksi adalah manajemen yang diperlukan untuk menyelesaikan objek pekerjaan dengan ( ) yang telah ditentukan berdasarkan rencana konstruksi.',
    opts: [
      '環境《かんきょう》',
      '品質《ひんしつ》'
    ],
    opts_id: [
      'Lingkungan',
      'Kualitas'
    ],
    ans: 1,
    img: null,
    exp: '施工管理 bertujuan menyelesaikan pekerjaan dengan KUALITAS (品質) yang ditentukan — bukan \'lingkungan\'. Kartu #153.',
    related_card_id: 50,
    track: 'lifeline'
  },
  {
    id: 'st1_q08',
    set: 'st1',
    setLabel: '実技 Set 1',
    topic: 'pipa',
    q: '配管用炭素鋼鋼管の代表的な接合方法である、ねじ接合方法は、主に（　）に採用されている。',
    hint: 'Metode sambungan ulir (ねじ接合) pada pipa baja karbon untuk pemipaan (SGP) terutama digunakan pada ( ).',
    opts: [
      '100A以上《100Aいじょう》',
      '15A～100A',
      '15A以下《15Aいか》'
    ],
    opts_id: [
      '100A ke atas',
      '15A～100A',
      '15A ke bawah'
    ],
    ans: 1,
    img: null,
    exp: 'SGP ねじ接合 digunakan untuk ukuran 15A～100A. Di atas 100A → flensa/las. Kartu #114.',
    related_card_id: 96,
    track: 'lifeline'
  },
  {
    id: 'st1_q09',
    set: 'st1',
    setLabel: '実技 Set 1',
    topic: 'listrik',
    q: '2本以上の電線が、負荷を通さないで接触してしまうことを、何というか。',
    hint: 'Kondisi di mana 2 kabel atau lebih bersentuhan TANPA melalui beban (load) disebut apa?',
    opts: [
      '短絡《たんらく》',
      '漏電《ろうでん》',
      '感電《かんでん》'
    ],
    opts_id: [
      'Short circuit',
      'Arus bocor',
      'Sengatan listrik'
    ],
    ans: 0,
    img: null,
    exp: '短絡 (tanraku) = short circuit. Berbeda: 漏電 = kebocoran arus ke ground, 感電 = listrik mengalir ke tubuh manusia. Kartu #103.',
    related_card_id: 65,
    track: 'lifeline'
  },
  {
    id: 'st1_q10',
    set: 'st1',
    setLabel: '実技 Set 1',
    topic: 'telekomunikasi',
    q: '青い矢印が指し示す設備の名前はどれか。',
    hint: 'Apa nama peralatan yang ditunjukkan oleh panah biru? [Diagram jaringan telekomunikasi: gedung komunikasi → tiang → kabel bawah tanah → rumah]',
    opts: [
      '通信ケーブル《つうしんケーブル》',
      '管路《かんろ》',
      '電柱《でんちゅう》',
      'マンホール'
    ],
    opts_id: [
      'Kabel komunikasi',
      'Jalur kabel bawah tanah',
      'Tiang listrik/telepon',
      'Manhole'
    ],
    ans: 2,
    img: null,
    photoDesc: '📷 Diagram: Jaringan telekomunikasi dari gedung komunikasi ke rumah. Panah biru menunjuk ke TIANG yang berdiri di atas tanah, di antara gedung dan rumah.',
    exp: '電柱 (denchu) = tiang listrik/telepon. Berbeda dari 管路 (jalur bawah tanah) dan マンホール. Kartu #113.',
    related_card_id: 77,
    track: 'lifeline'
  },
  {
    id: 'st1_q11',
    set: 'st1',
    setLabel: '実技 Set 1',
    topic: 'isolasi',
    q: '築炉とは、電気炉など、高温になる内側を、（　）で構築する工事のことである。',
    hint: '築炉 adalah pekerjaan membangun bagian dalam yang menjadi suhu tinggi (seperti tungku listrik) menggunakan ( ).',
    opts: [
      '保温材《ほおんざい》',
      '保冷材《ほれいざい》',
      '耐火物《たいかぶつ》',
      '断熱材《だんねつざい》'
    ],
    opts_id: [
      'Bahan isolasi panas',
      'Bahan isolasi dingin',
      'Bahan tahan api',
      'Bahan insulasi'
    ],
    ans: 2,
    img: null,
    exp: '築炉 = konstruksi tungku menggunakan BAHAN TAHAN API (耐火物). BUKAN 保温材 atau 断熱材 biasa. Perekat: 耐熱断熱煉瓦用モルタル. Kartu #124.',
    related_card_id: 39,
    track: 'lifeline'
  },
  {
    id: 'st1_q12',
    set: 'st1',
    setLabel: '実技 Set 1',
    topic: 'keselamatan',
    q: '建設業における三大災害のなかで、最も多いのは、どれか。',
    hint: 'Di antara tiga bencana besar konstruksi (三大災害), mana yang paling banyak terjadi?',
    opts: [
      '墜落・転落《ついらく・てんらく》',
      '建設機械・クレーンなど災害《けんせつきかい・クレーンなどさいがい》',
      '高温・低温の物との接触《こうおん・ていおんのものとのせっしょく》'
    ],
    opts_id: [
      'Jatuh dari ketinggian / bergulir',
      'Kecelakaan mesin/crane',
      'Kontak benda suhu ekstrem'
    ],
    ans: 0,
    img: null,
    exp: '墜落・転落 (jatuh) adalah penyebab kematian TERBANYAK. 2021: 110 dari 288 total kematian. Opsi 3 BUKAN bagian dari 三大災害 (③ sebenarnya adalah 崩壊・倒壊). Kartu #127.',
    related_card_id: 123,
    track: 'lifeline'
  },
  {
    id: 'st1_q13',
    set: 'st1',
    setLabel: '実技 Set 1',
    topic: 'listrik',
    q: '人の体の中を電気が通って、強いショックを受けることを、何というか。',
    hint: 'Kondisi di mana listrik mengalir melalui tubuh manusia dan menerima kejutan kuat disebut apa?',
    opts: [
      '停電《ていでん》',
      '火傷《やけど》',
      '感電《かんでん》'
    ],
    opts_id: [
      'Pemadaman listrik',
      'Luka bakar',
      'Sengatan listrik'
    ],
    ans: 2,
    img: null,
    exp: '感電 (kanden) = sengatan listrik. Listrik mengalir melalui tubuh → kejutan kuat. Kecelakaan khas pekerjaan listrik. Kartu #81.',
    related_card_id: 81,
    track: 'lifeline'
  },
  {
    id: 'st1_q14',
    set: 'st1',
    setLabel: '実技 Set 1',
    topic: 'keselamatan',
    q: '酸素欠乏に注意するべき作業は、どれか。',
    hint: 'Pekerjaan apa yang perlu memperhatikan kekurangan oksigen (酸素欠乏)?',
    opts: [
      'マンホール内での作業《マンホールないでのさぎょう》',
      '電柱の上での作業《でんちゅうのうえでのさぎょう》',
      '建物屋上での作業《たてものおくじょうでのさぎょう》'
    ],
    opts_id: [
      'Di dalam manhole',
      'Di atas tiang listrik',
      'Di atap gedung'
    ],
    ans: 0,
    img: null,
    exp: '酸素欠乏 terjadi di ruang TERTUTUP seperti MANHOLE. Kerja di atas tiang atau atap gedung = tidak ada risiko kekurangan oksigen. Kartu #107.',
    related_card_id: 120,
    track: 'lifeline'
  },
  {
    id: 'st1_q15',
    set: 'st1',
    setLabel: '実技 Set 1',
    topic: 'keselamatan',
    q: '掘削の深さが1.5ｍ以上になる場合、土砂崩れを防ぐため行うことは、どれか。',
    hint: 'Jika kedalaman galian mencapai 1.5m atau lebih, apa yang dilakukan untuk mencegah longsor tanah?',
    opts: [
      '換気《かんき》',
      '排水《はいすい》',
      '土留め《どどめ》'
    ],
    opts_id: [
      'Ventilasi',
      'Drainase',
      'Penahan tanah'
    ],
    ans: 2,
    img: null,
    exp: '土留め (dodome) WAJIB jika kedalaman galian ≥1.5m. Angka 1.5m harus dihafalkan. Kartu #108.',
    related_card_id: 121,
    track: 'lifeline'
  },
  {
    id: 'st2_q01',
    set: 'st2',
    setLabel: '実技 Set 2',
    topic: 'telekomunikasi',
    q: '光ファイバーの特徴を選べ。',
    hint: 'Pilih ciri-ciri serat optik.',
    opts: [
      '損失が小さい《そんしつがちいさい》',
      '重い《おもい》',
      '傷に強い《きずにつよい》',
      '伝送容量が小さい《でんそうようりょうがちいさい》'
    ],
    opts_id: [
      'Rugi-rugi kecil',
      'Berat',
      'Tahan goresan',
      'Kapasitas transmisi kecil'
    ],
    ans: 0,
    img: null,
    exp: 'Serat optik: 損失が小さい (rugi kecil) ✓, ringan ✓, kapasitas BESAR ✓. Kelemahannya: rentan goresan & tekukan. Kartu #45.',
    related_card_id: 67,
    track: 'lifeline'
  },
  {
    id: 'st2_q02',
    set: 'st2',
    setLabel: '実技 Set 2',
    topic: 'telekomunikasi',
    q: '光ファイバー芯線の線路長や、接続による損失、反射などの異常箇所を測定することができる装置を何というか。',
    hint: 'Alat yang dapat mengukur panjang jalur serat optik, kerugian akibat sambungan, dan mendeteksi titik abnormal seperti pantulan disebut apa?',
    opts: [
      'ファイバーカッター',
      'OTDR',
      '光パワーメーター《ひかりパワーメーター》',
      'クランプメーター'
    ],
    opts_id: [
      'Pemotong serat',
      'OTDR',
      'Pengukur daya optik',
      'Clamp meter'
    ],
    ans: 1,
    img: null,
    exp: 'OTDR (Optical Time Domain Reflectometer) = mengukur panjang jalur & titik abnormal serat optik. 光パワーメーター hanya mengukur daya/kekuatan sinyal. Kartu #51.',
    related_card_id: 73,
    track: 'lifeline'
  },
  {
    id: 'st2_q03',
    set: 'st2',
    setLabel: '実技 Set 2',
    topic: 'telekomunikasi',
    q: '光ファイバーの先端部を溶かして、接続する方法を何というか。',
    hint: 'Metode penyambungan serat optik dengan cara MELELEHKAN ujung serat disebut apa?',
    opts: [
      'コネクタ接続《コネクタせつぞく》',
      'はんだあげ',
      '融着接続《ゆうちゃくせつぞく》',
      'メカニカルスプライス接続《メカニカルスプライスせつぞく》'
    ],
    opts_id: [
      'Sambungan konektor',
      'Soldering',
      'Fusion splicing',
      'Mechanical splice'
    ],
    ans: 2,
    img: null,
    exp: '融着接続 = melelehkan/memfusikan ujung serat → sambungan permanen, rugi terkecil. Kata kunci: \'MELELEHKAN ujung serat\'. Kartu #109.',
    related_card_id: 76,
    track: 'lifeline'
  },
  {
    id: 'st2_q04',
    set: 'st2',
    setLabel: '実技 Set 2',
    topic: 'isolasi',
    q: '主に冷凍空気調和機器工事で使う乾いた空気に水分を加える機器は、次のどれか。',
    hint: 'Alat yang digunakan terutama dalam pekerjaan mesin pendingin AC, yang MENAMBAHKAN kelembapan ke udara kering, adalah yang mana?',
    opts: [
      '除湿器《じょしつき》',
      '冷却コイル《れいきゃくコイル》',
      'けい酸カルシウム保温材《けいさんカルシウムほおんざい》',
      '加湿器《かしつき》'
    ],
    opts_id: [
      'Penyerap kelembapan',
      'Koil pendingin',
      'Isolasi kalsium silikat',
      'Pelembap udara'
    ],
    ans: 3,
    img: null,
    exp: '加湿器 = MENAMBAH kelembapan ke udara kering. 除湿器 = mengurangi kelembapan. Kata kunci: \'menambah air ke udara kering\'. Kartu #115.',
    related_card_id: 38,
    track: 'lifeline'
  },
  {
    id: 'st2_q05',
    set: 'st2',
    setLabel: '実技 Set 2',
    topic: 'isolasi',
    q: '主に保温保冷工事で使うガラスを溶かし、繊維状にした保温材は、次のどれか。',
    hint: 'Bahan isolasi yang digunakan terutama dalam pekerjaan isolasi termal, dibuat dengan MELELEHKAN KACA menjadi bentuk serat, adalah yang mana?',
    opts: [
      'グラスウール保温材《グラスウールほおんざい》',
      'ロックウール保温材《ロックウールほおんざい》',
      'ポリスチレンフォーム保温材《ポリスチレンフォームほおんざい》',
      'けい酸カルシウム保温材《けいさんカルシウムほおんざい》'
    ],
    opts_id: [
      'Wol kaca',
      'Wol batu',
      'Busa polistiren',
      'Kalsium silikat'
    ],
    ans: 0,
    img: null,
    exp: 'グラスウール = dari KACA dilebur menjadi serat. ロックウール = dari BATU BASALT. Kata kunci: \'kaca dilelehkan jadi serat\'. Kartu #111.',
    related_card_id: 102,
    track: 'lifeline'
  },
  {
    id: 'st2_q06',
    set: 'st2',
    setLabel: '実技 Set 2',
    topic: 'umum',
    q: '写真の道具の名前は、次のどれか。',
    hint: 'Apa nama alat dalam foto?',
    opts: [
      '一輪車《いちりんしゃ》',
      '台車《だいしゃ》',
      'そり',
      'ころ'
    ],
    opts_id: [
      'Gerobak satu roda',
      'Kereta dorong datar',
      'Sledge',
      'Roller'
    ],
    ans: 1,
    img: null,
    photoDesc: '📷 Foto: Kereta dorong datar berbentuk platform persegi panjang rendah dengan 4 roda kecil dan pegangan lipat/condong. Dilihat dari atas/sudut.',
    exp: '台車 (daisha) = kereta dorong datar 4 roda untuk mengangkut material berat. Berbeda dari 一輪車 (gerobak satu roda). Kartu #342 (id di alat_umum).',
    related_card_id: 149,
    track: 'lifeline'
  },
  {
    id: 'st2_q07',
    set: 'st2',
    setLabel: '実技 Set 2',
    topic: 'isolasi',
    q: '配管の保温保冷の屋外露出箇所では、保温筒を（　）で覆い仕上げます。',
    hint: 'Pada bagian pipa isolasi yang terekspos di LUAR RUANGAN, tabung insulasi (保温筒) ditutup menggunakan ( ).',
    opts: [
      'ラッキングカバー',
      'マグパイプカバー'
    ],
    opts_id: [
      'Lagging cover',
      'Mag pipe cover'
    ],
    ans: 0,
    img: null,
    exp: 'ラッキングカバー = penutup finishing untuk isolasi pipa LUAR RUANGAN (屋外露出). Untuk dalam ruangan tidak wajib. Kartu #112.',
    related_card_id: 103,
    track: 'lifeline'
  },
  {
    id: 'st2_q08',
    set: 'st2',
    setLabel: '実技 Set 2',
    topic: 'pipa',
    q: '上水道やガス配管で使うポリエチレン管の接合は、次のどれか。',
    hint: 'Sambungan pipa polietilen yang digunakan untuk pipa air bersih dan pipa gas adalah yang mana?',
    opts: [
      'ねじ接合《ねじせつごう》',
      'ＥＦ接合《ＥＦせつごう》'
    ],
    opts_id: [
      'Sambungan ulir',
      'EF / Electro Fusion'
    ],
    ans: 1,
    img: null,
    exp: 'Pipa polietilen (polyethylene) → EF接合 (Electro Fusion). SGP (baja) → ねじ接合 (sambungan ulir). Kartu #110.',
    related_card_id: 95,
    track: 'lifeline'
  },
  {
    id: 'st2_q09',
    set: 'st2',
    setLabel: '実技 Set 2',
    topic: 'umum',
    q: '建築板金の丸ダクトの接続方法は、次のどれか。',
    hint: 'Metode sambungan saluran udara bulat (丸ダクト) dalam pekerjaan pelat bangunan adalah yang mana?',
    opts: [
      '差し込み継手工法《さしこみつぎてこうほう》',
      '共板フランジ工法《きょうばんフランジこうほう》'
    ],
    opts_id: [
      'Insert joint method',
      'Common plate flange method'
    ],
    ans: 0,
    img: null,
    exp: '丸ダクト (round duct) → 差し込み継手工法 (selip/insert). 角ダクト (square duct) → 共板フランジ工法. Kartu #126.',
    related_card_id: 40,
    track: 'lifeline'
  },
  {
    id: 'st2_q10',
    set: 'st2',
    setLabel: '実技 Set 2',
    topic: 'telekomunikasi',
    q: '電柱を建てる穴を掘る前に、（　）や探針棒をつかって埋設物を確認します。',
    hint: 'Sebelum menggali lubang untuk mendirikan tiang listrik, ( ) dan batang probe (探針棒) digunakan untuk mengkonfirmasi benda terpendam (埋設物).',
    opts: [
      '穴掘建柱車《あなほりけんちゅうしゃ》',
      '手掘り《てぼり》'
    ],
    opts_id: [
      'Kendaraan penggali & pendiri tiang',
      'Penggalian manual'
    ],
    ans: 1,
    img: null,
    exp: '手掘り (gali manual) + 探針棒 (batang probe) digunakan BERSAMA untuk memeriksa benda terpendam secara hati-hati sebelum menggali dengan mesin. 穴掘建柱車 = kendaraan untuk menggali & mendirikan tiang. Kartu #154.',
    related_card_id: 79,
    track: 'lifeline'
  },
  {
    id: 'st2_q11',
    set: 'st2',
    setLabel: '実技 Set 2',
    topic: 'telekomunikasi',
    q: 'マンホール、ハンドホール、とう道、引上柱の間を結ぶ設備を何というか。',
    hint: 'Peralatan yang menghubungkan antara manhole, handhole, terowongan (とう道), dan tiang pengangkat (引上柱) disebut apa?',
    opts: [
      '管路《かんろ》',
      '共同溝《きょうどうこう》'
    ],
    opts_id: [
      'Jalur kabel bawah tanah',
      'Terowongan utilitas bersama'
    ],
    ans: 0,
    img: null,
    exp: '管路 (kanro) = infrastruktur yang menghubungkan manhole - handhole - とう道 - 引上柱. Berbeda dari 共同溝 yang merupakan terowongan utilitas besar. Kartu #113.',
    related_card_id: 77,
    track: 'lifeline'
  },
  {
    id: 'st2_q12',
    set: 'st2',
    setLabel: '実技 Set 2',
    topic: 'telekomunikasi',
    q: '管路の土被りは、車道では何メートルを超えなければならないか。',
    hint: 'Kedalaman tanah (土被り) jalur kabel (管路) di jalan raya harus melebihi berapa meter?',
    opts: [
      '0.6ｍ',
      '0.8ｍ'
    ],
    opts_id: [
      '0.6ｍ',
      '0.8ｍ'
    ],
    ans: 1,
    img: null,
    exp: '管路 di jalan raya (車道) → kedalaman tanah harus >0.8m. Angka ini wajib dihafalkan. Kartu #113.',
    related_card_id: 77,
    track: 'lifeline'
  },
  {
    id: 'st2_q13',
    set: 'st2',
    setLabel: '実技 Set 2',
    topic: 'isolasi',
    q: '築炉工事での耐火煉瓦の接着に使うものは、次のどれか。',
    hint: 'Bahan yang digunakan untuk merekatkan bata tahan api dalam pekerjaan築炉 adalah yang mana?',
    opts: [
      '耐熱断熱煉瓦用モルタル《たいねつだんねつれんがようモルタル》',
      '樹脂モルタル《じゅしモルタル》'
    ],
    opts_id: [
      'Mortar khusus bata tahan api',
      'Mortar resin'
    ],
    ans: 0,
    img: null,
    exp: 'Perekat bata tahan api di konstruksi tungku = 耐熱断熱煉瓦用モルタル (mortar khusus tahan panas untuk bata tahan api). BUKAN mortar resin biasa. Kartu #124.',
    related_card_id: 39,
    track: 'lifeline'
  },
  {
    id: 'st2_q14',
    set: 'st2',
    setLabel: '実技 Set 2',
    topic: 'keselamatan',
    q: '事業者が新しく労働者を雇い入れた時に行う安全教育を何というか。',
    hint: 'Pendidikan keselamatan yang dilakukan ketika pengusaha MEREKRUT PEKERJA BARU disebut apa?',
    opts: [
      '新規入場者教育《しんきにゅうじょうしゃきょういく》',
      '安全パトロール《あんぜんパトロール》',
      '新入者安全衛生教育《しんにゅうしゃあんぜんえいせいきょういく》'
    ],
    opts_id: [
      'Pendidikan pekerja baru lokasi kerja',
      'Patroli keselamatan',
      'Pendidikan K3 pekerja baru perusahaan'
    ],
    ans: 2,
    img: null,
    exp: '新入者安全衛生教育 = untuk PEREKRUTAN BARU oleh perusahaan. 新規入場者教育 = untuk PENDATANG BARU ke lokasi kerja (bisa sudah lama bekerja di perusahaan). Kartu #119.',
    related_card_id: 122,
    track: 'lifeline'
  },
  {
    id: 'st2_q15',
    set: 'st2',
    setLabel: '実技 Set 2',
    topic: 'keselamatan',
    q: '疲労がたまると事故につながるので、（　）を心がける。',
    hint: 'Karena kelelahan yang menumpuk bisa menyebabkan kecelakaan, yang perlu diperhatikan adalah ( ).',
    opts: [
      '適切な睡眠と食事をとること《てきせつなすいみんとしょくじをとること》',
      'お酒を飲んで作業すること《おさけをのんでさぎょうすること》',
      '前日に徹夜すること《ぜんじつにてつやすること》'
    ],
    opts_id: [
      'Tidur & makan yang cukup',
      'Bekerja sambil minum alkohol',
      'Begadang sehari sebelumnya'
    ],
    ans: 0,
    img: null,
    exp: 'Pencegahan kelelahan → 適切な睡眠と食事 (tidur & makan yang cukup). Kelelahan = penyebab kecelakaan. Kartu #155.',
    related_card_id: 128,
    track: 'lifeline'
  }
];
