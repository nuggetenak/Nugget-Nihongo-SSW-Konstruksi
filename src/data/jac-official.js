// SSW Flashcards: JAC Official Questions — ~95 soal dari PDF contoh JAC
// Sets: tt1 (学科 Set 1), tt2 (学科 Set 2), st1 (実技 Set 1), st2 (実技 Set 2)
// IMPORTANT: answer field is 1-BASED (answer:1 = first option)

export const JAC_OFFICIAL = [
  // ── SET 1: st_sample_l.pdf ─────────────────────────────────────────────
  {
    id: "st1_q01", set: "st1", setLabel: "実技 Set 1",
    jp: "過大電流が流れた時に、自動的に電気の供給を止める安全装置を、何というか。",
    hiragana: "かだい でんりゅう が ながれた とき に、 じどうてき に でんき の きょうきゅう を とめる あんぜん そうち を、 なんと いうか。",
    id_text: "Ketika arus berlebih mengalir, alat keselamatan yang secara otomatis menghentikan pasokan listrik disebut apa?",
    options: ["リレー (Relay)", "コンセント (Stop kontak)", "ブレーカー (Breaker / NFB)", "ストリップゲージ (Strip gauge)"],
    answer: 3, hasPhoto: false,
    explanation: "ブレーカー (NFB = No-Fuse Breaker) secara otomatis memutus pasokan listrik saat arus berlebih. Kartu #41.",
    related_card_id: 41
  },
  {
    id: "st1_q02", set: "st1", setLabel: "実技 Set 1",
    jp: "写真の道具の名前はどれか。",
    hiragana: "しゃしん の どうぐ の なまえ は どれか。",
    id_text: "Apa nama alat dalam foto?",
    options: ["ドライバー (Obeng)", "ポンチ (Punch/penanda)", "ファイバカッター (Pemotong serat)", "電工ナイフ（でんこうナイフ）(Pisau listrik)"],
    answer: 4, hasPhoto: true,
    photoDesc: "📷 Foto: Pisau lipat dengan bilah melengkung, ujung TUMPUL (bukan lancip). Ciri khas: bilah agak lebar, ujung membulat tumpul untuk melindungi konduktor.",
    explanation: "電工ナイフ (Pisau listrik) — bilah melengkung dengan ujung TUMPUL, khusus untuk mengupas isolasi kabel. Kartu #104.",
    related_card_id: 104
  },
  {
    id: "st1_q03", set: "st1", setLabel: "実技 Set 1",
    jp: "写真の道具の名前はどれか。",
    hiragana: "しゃしん の どうぐ の なまえ は どれか。",
    id_text: "Apa nama alat dalam foto?",
    options: ["パイプ万力（パイプまんりき）(Ragum pipa)", "パイプカッター (Pemotong pipa)", "パイプねじ切機（パイプねじきりき）(Mesin ulir pipa)", "パイプレンチ (Kunci pipa)"],
    answer: 2, hasPhoto: true,
    photoDesc: "📷 Foto: Alat berbentuk C/U kecil dengan roda pemotong di ujung dan pegangan hitam. Berbeda dari kunci pipa yang seperti tang besar.",
    explanation: "パイプカッター — memotong pipa dengan cara roda pemotong mengencang melingkar pipa. Kartu #60.",
    related_card_id: 60
  },
  {
    id: "st1_q04", set: "st1", setLabel: "実技 Set 1",
    jp: "写真の設備の名前はどれか。",
    hiragana: "しゃしん の せつび の なまえ は どれか。",
    id_text: "Apa nama peralatan dalam foto?",
    options: ["消火器（しょうかき）(APAR)", "屋内消火栓設備（おくないしょうかせんせつび）(Hidran dalam gedung)", "スプリンクラー設備（スプリンクラーせつび）(Sprinkler)", "屋外消火栓設備（おくがいしょうかせんせつび）(Hidran luar gedung)"],
    answer: 4, hasPhoto: true,
    photoDesc: "📷 Foto: Beberapa tiang hidran berwarna silver/perak berdiri di area luar gedung, di antara semak-semak. Terletak di LUAR ruangan.",
    explanation: "屋外消火栓設備 — hidran di LUAR gedung, untuk pemadaman awal & mencegah api menyebar (jangkauan lantai 1-2). Kartu #74.",
    related_card_id: 74
  },
  {
    id: "st1_q05", set: "st1", setLabel: "実技 Set 1",
    jp: "写真の道具の名前はどれか。",
    hiragana: "しゃしん の どうぐ の なまえ は どれか。",
    id_text: "Apa nama alat dalam foto?",
    options: ["墨さし（すみさし）(Kuas tinta)", "チョーク (Kapur)", "墨つぼ（すみつぼ）(Wadah tinta/chalk line reel)", "レーザー墨出し器（レーザーすみだしき）(Laser marker)"],
    answer: 3, hasPhoto: true,
    photoDesc: "📷 Foto: Alat kecil berbentuk drum/gulungan dengan cangkang logam gelap dan pengait benang. Ada tombol/roda di badan untuk menggulung benang.",
    explanation: "墨つぼ — membuat garis lurus panjang dengan benang bercelup tinta. Kartu #106.",
    related_card_id: 106
  },
  {
    id: "st1_q06", set: "st1", setLabel: "実技 Set 1",
    jp: "写真の道具の名前はどれか。",
    hiragana: "しゃしん の どうぐ の なまえ は どれか。",
    id_text: "Apa nama alat dalam foto?",
    options: ["三脚（さんきゃく）(Tripod)", "気泡管（きほうかん）(Tabung gelembung)", "望遠鏡（ぼうえんきょう）(Teleskop)", "レベル (Level/waterpas survei)"],
    answer: 4, hasPhoto: true,
    photoDesc: "📷 Foto: Instrumen survei putih/abu dengan teleskop horizontal, dipasang di atas tripod kayu di lingkungan hutan/outdoor. Bukan transit (yang mengukur sudut vertikal).",
    explanation: "レベル (水準器) — instrumen survei untuk mengukur ketinggian/elevasi, dipasang di tripod. Kartu #94.",
    related_card_id: 94
  },
  {
    id: "st1_q07", set: "st1", setLabel: "実技 Set 1",
    jp: "施工管理とは、施工計画に基づいて、施工者が、所定の（　）の工事目的物を完成させるために必要な管理のことである。",
    hiragana: "いかの ぶんしょうの （ ）に はいる ことばを えらびなさい。せこう かんり とは、 せこう けいかく に もとづいて、 せこうしゃが、 しょてい の （ ）の こうじ もくてきぶつ を かんせい させる ために ひつよう な かんり の ことで ある。",
    id_text: "Manajemen konstruksi adalah manajemen yang diperlukan untuk menyelesaikan objek pekerjaan dengan ( ) yang telah ditentukan berdasarkan rencana konstruksi.",
    options: ["環境（かんきょう）(Lingkungan)", "品質（ひんしつ）(Kualitas)"],
    answer: 2, hasPhoto: false,
    explanation: "施工管理 bertujuan menyelesaikan pekerjaan dengan KUALITAS (品質) yang ditentukan — bukan 'lingkungan'. Kartu #153.",
    related_card_id: 153
  },
  {
    id: "st1_q08", set: "st1", setLabel: "実技 Set 1",
    jp: "配管用炭素鋼鋼管の代表的な接合方法である、ねじ接合方法は、主に（　）に採用されている。",
    hiragana: "いかの ぶんしょうの （ ）に はいる ことばを えらびなさい。はいかんよう たんそこう こうかんの だいひょう てきな せつごう ほうほう である ねじ せつごう ほうほう は、おもに（ ）に さいよう されている。",
    id_text: "Metode sambungan ulir (ねじ接合) pada pipa baja karbon untuk pemipaan (SGP) terutama digunakan pada ( ).",
    options: ["100A以上（100Aいじょう）(100A ke atas)", "15A～100A", "15A以下（15Aいか）(15A ke bawah)"],
    answer: 2, hasPhoto: false,
    explanation: "SGP ねじ接合 digunakan untuk ukuran 15A～100A. Di atas 100A → flensa/las. Kartu #114.",
    related_card_id: 114
  },
  {
    id: "st1_q09", set: "st1", setLabel: "実技 Set 1",
    jp: "2本以上の電線が、負荷を通さないで接触してしまうことを、何というか。",
    hiragana: "2ほん いじょう の でんせん が、 ふか を とおさない で せっしょく して しまう こと を、 なんと いうか。",
    id_text: "Kondisi di mana 2 kabel atau lebih bersentuhan TANPA melalui beban (load) disebut apa?",
    options: ["短絡（たんらく）(Short circuit)", "漏電（ろうでん）(Arus bocor)", "感電（かんでん）(Sengatan listrik)"],
    answer: 1, hasPhoto: false,
    explanation: "短絡 (tanraku) = short circuit. Berbeda: 漏電 = kebocoran arus ke ground, 感電 = listrik mengalir ke tubuh manusia. Kartu #103.",
    related_card_id: 103
  },
  {
    id: "st1_q10", set: "st1", setLabel: "実技 Set 1",
    jp: "青い矢印が指し示す設備の名前はどれか。",
    hiragana: "あおい やじるし が さし しめす せつび の なまえ は どれか。",
    id_text: "Apa nama peralatan yang ditunjukkan oleh panah biru? [Diagram jaringan telekomunikasi: gedung komunikasi → tiang → kabel bawah tanah → rumah]",
    options: ["通信ケーブル（つうしんケーブル）(Kabel komunikasi)", "管路（かんろ）(Jalur kabel bawah tanah)", "電柱（でんちゅう）(Tiang listrik/telepon)", "マンホール (Manhole)"],
    answer: 3, hasPhoto: true,
    photoDesc: "📷 Diagram: Jaringan telekomunikasi dari gedung komunikasi ke rumah. Panah biru menunjuk ke TIANG yang berdiri di atas tanah, di antara gedung dan rumah.",
    explanation: "電柱 (denchu) = tiang listrik/telepon. Berbeda dari 管路 (jalur bawah tanah) dan マンホール. Kartu #113.",
    related_card_id: 113
  },
  {
    id: "st1_q11", set: "st1", setLabel: "実技 Set 1",
    jp: "築炉とは、電気炉など、高温になる内側を、（　）で構築する工事のことである。",
    hiragana: "いかの ぶんしょうの （ ）に はいる ことばを えらびなさい。ちくろ とは、でんき ろ など、こうおん になる うちがわを、（ ）で こうちく する こうじ の こと である。",
    id_text: "築炉 adalah pekerjaan membangun bagian dalam yang menjadi suhu tinggi (seperti tungku listrik) menggunakan ( ).",
    options: ["保温材（ほおんざい）(Bahan isolasi panas)", "保冷材（ほれいざい）(Bahan isolasi dingin)", "耐火物（たいかぶつ）(Bahan tahan api)", "断熱材（だんねつざい）(Bahan insulasi)"],
    answer: 3, hasPhoto: false,
    explanation: "築炉 = konstruksi tungku menggunakan BAHAN TAHAN API (耐火物). BUKAN 保温材 atau 断熱材 biasa. Perekat: 耐熱断熱煉瓦用モルタル. Kartu #124.",
    related_card_id: 124
  },
  {
    id: "st1_q12", set: "st1", setLabel: "実技 Set 1",
    jp: "建設業における三大災害のなかで、最も多いのは、どれか。",
    hiragana: "けんせつぎょう における さん だいさいがい の なか で、 もっとも おおい の は、 どれか。",
    id_text: "Di antara tiga bencana besar konstruksi (三大災害), mana yang paling banyak terjadi?",
    options: ["墜落・転落（ついらく・てんらく）(Jatuh dari ketinggian / bergulir)", "建設機械・クレーンなど災害（けんせつきかい・クレーンなどさいがい）(Kecelakaan mesin/crane)", "高温・低温の物との接触（こうおん・ていおんのものとのせっしょく）(Kontak benda suhu ekstrem)"],
    answer: 1, hasPhoto: false,
    explanation: "墜落・転落 (jatuh) adalah penyebab kematian TERBANYAK. 2021: 110 dari 288 total kematian. Opsi 3 BUKAN bagian dari 三大災害 (③ sebenarnya adalah 崩壊・倒壊). Kartu #127.",
    related_card_id: 127
  },
  {
    id: "st1_q13", set: "st1", setLabel: "実技 Set 1",
    jp: "人の体の中を電気が通って、強いショックを受けることを、何というか。",
    hiragana: "ひと の からだ の なか を でんき が かよって、 つよい しょっく を うける こと を、 なんと いうか。",
    id_text: "Kondisi di mana listrik mengalir melalui tubuh manusia dan menerima kejutan kuat disebut apa?",
    options: ["停電（ていでん）(Pemadaman listrik)", "火傷（やけど）(Luka bakar)", "感電（かんでん）(Sengatan listrik)"],
    answer: 3, hasPhoto: false,
    explanation: "感電 (kanden) = sengatan listrik. Listrik mengalir melalui tubuh → kejutan kuat. Kecelakaan khas pekerjaan listrik. Kartu #81.",
    related_card_id: 81
  },
  {
    id: "st1_q14", set: "st1", setLabel: "実技 Set 1",
    jp: "酸素欠乏に注意するべき作業は、どれか。",
    hiragana: "さんそ けつぼう に ちゅうい するべき さぎょう は、 どれか。",
    id_text: "Pekerjaan apa yang perlu memperhatikan kekurangan oksigen (酸素欠乏)?",
    options: ["マンホール内での作業（マンホールないでのさぎょう）(Di dalam manhole)", "電柱の上での作業（でんちゅうのうえでのさぎょう）(Di atas tiang listrik)", "建物屋上での作業（たてものおくじょうでのさぎょう）(Di atap gedung)"],
    answer: 1, hasPhoto: false,
    explanation: "酸素欠乏 terjadi di ruang TERTUTUP seperti MANHOLE. Kerja di atas tiang atau atap gedung = tidak ada risiko kekurangan oksigen. Kartu #107.",
    related_card_id: 107
  },
  {
    id: "st1_q15", set: "st1", setLabel: "実技 Set 1",
    jp: "掘削の深さが1.5ｍ以上になる場合、土砂崩れを防ぐため行うことは、どれか。",
    hiragana: "くっさく の ふかさ が 1.5ｍ いじょう に なる ばあい、 どしゃくずれ を ふせぐ ため おこなう こと は、 どれか。",
    id_text: "Jika kedalaman galian mencapai 1.5m atau lebih, apa yang dilakukan untuk mencegah longsor tanah?",
    options: ["換気（かんき）(Ventilasi)", "排水（はいすい）(Drainase)", "土留め（どどめ）(Penahan tanah)"],
    answer: 3, hasPhoto: false,
    explanation: "土留め (dodome) WAJIB jika kedalaman galian ≥1.5m. Angka 1.5m harus dihafalkan. Kartu #108.",
    related_card_id: 108
  },

  // ── SET 2: st_sample2_l.pdf ────────────────────────────────────────────
  {
    id: "st2_q01", set: "st2", setLabel: "実技 Set 2",
    jp: "光ファイバーの特徴を選べ。",
    hiragana: "ひかりふぁいばー の とくちょう を えらべ。",
    id_text: "Pilih ciri-ciri serat optik.",
    options: ["損失が小さい（そんしつがちいさい）(Rugi-rugi kecil)", "重い（おもい）(Berat)", "傷に強い（きずにつよい）(Tahan goresan)", "伝送容量が小さい（でんそうようりょうがちいさい）(Kapasitas transmisi kecil)"],
    answer: 1, hasPhoto: false,
    explanation: "Serat optik: 損失が小さい (rugi kecil) ✓, ringan ✓, kapasitas BESAR ✓. Kelemahannya: rentan goresan & tekukan. Kartu #45.",
    related_card_id: 45
  },
  {
    id: "st2_q02", set: "st2", setLabel: "実技 Set 2",
    jp: "光ファイバー芯線の線路長や、接続による損失、反射などの異常箇所を測定することができる装置を何というか。",
    hiragana: "ひかりふぁいばー しんせん の せんろちょう や、 せつぞく による そんしつ、 はんしゃ など の いじょう かしょ を そくてい する こと が できる そうち を なんと いうか。",
    id_text: "Alat yang dapat mengukur panjang jalur serat optik, kerugian akibat sambungan, dan mendeteksi titik abnormal seperti pantulan disebut apa?",
    options: ["ファイバーカッター (Pemotong serat)", "OTDR", "光パワーメーター（ひかりパワーメーター）(Pengukur daya optik)", "クランプメーター (Clamp meter)"],
    answer: 2, hasPhoto: false,
    explanation: "OTDR (Optical Time Domain Reflectometer) = mengukur panjang jalur & titik abnormal serat optik. 光パワーメーター hanya mengukur daya/kekuatan sinyal. Kartu #51.",
    related_card_id: 51
  },
  {
    id: "st2_q03", set: "st2", setLabel: "実技 Set 2",
    jp: "光ファイバーの先端部を溶かして、接続する方法を何というか。",
    hiragana: "ひかりふぁいばー の せんたんぶ を とかして、 せつぞく する ほうほう を なんと いうか。",
    id_text: "Metode penyambungan serat optik dengan cara MELELEHKAN ujung serat disebut apa?",
    options: ["コネクタ接続（コネクタせつぞく）(Sambungan konektor)", "はんだあげ (Soldering)", "融着接続（ゆうちゃくせつぞく）(Fusion splicing)", "メカニカルスプライス接続（メカニカルスプライスせつぞく）(Mechanical splice)"],
    answer: 3, hasPhoto: false,
    explanation: "融着接続 = melelehkan/memfusikan ujung serat → sambungan permanen, rugi terkecil. Kata kunci: 'MELELEHKAN ujung serat'. Kartu #109.",
    related_card_id: 109
  },
  {
    id: "st2_q04", set: "st2", setLabel: "実技 Set 2",
    jp: "主に冷凍空気調和機器工事で使う乾いた空気に水分を加える機器は、次のどれか。",
    hiragana: "おも に れいとう くうき ちょうわ きき こうじ で つかう かわいた くうき に すいぶん を くわえる きき は、 つぎ の どれか。",
    id_text: "Alat yang digunakan terutama dalam pekerjaan mesin pendingin AC, yang MENAMBAHKAN kelembapan ke udara kering, adalah yang mana?",
    options: ["除湿器（じょしつき）(Penyerap kelembapan)", "冷却コイル（れいきゃくコイル）(Koil pendingin)", "けい酸カルシウム保温材（けいさんカルシウムほおんざい）(Isolasi kalsium silikat)", "加湿器（かしつき）(Pelembap udara)"],
    answer: 4, hasPhoto: false,
    explanation: "加湿器 = MENAMBAH kelembapan ke udara kering. 除湿器 = mengurangi kelembapan. Kata kunci: 'menambah air ke udara kering'. Kartu #115.",
    related_card_id: 115
  },
  {
    id: "st2_q05", set: "st2", setLabel: "実技 Set 2",
    jp: "主に保温保冷工事で使うガラスを溶かし、繊維状にした保温材は、次のどれか。",
    hiragana: "おも に ほおんほれいこうじ で つかう がらす を とかし、 せんいじょう に した ほおんざい は、 つぎ の どれか。",
    id_text: "Bahan isolasi yang digunakan terutama dalam pekerjaan isolasi termal, dibuat dengan MELELEHKAN KACA menjadi bentuk serat, adalah yang mana?",
    options: ["グラスウール保温材（グラスウールほおんざい）(Wol kaca)", "ロックウール保温材（ロックウールほおんざい）(Wol batu)", "ポリスチレンフォーム保温材（ポリスチレンフォームほおんざい）(Busa polistiren)", "けい酸カルシウム保温材（けいさんカルシウムほおんざい）(Kalsium silikat)"],
    answer: 1, hasPhoto: false,
    explanation: "グラスウール = dari KACA dilebur menjadi serat. ロックウール = dari BATU BASALT. Kata kunci: 'kaca dilelehkan jadi serat'. Kartu #111.",
    related_card_id: 111
  },
  {
    id: "st2_q06", set: "st2", setLabel: "実技 Set 2",
    jp: "写真の道具の名前は、次のどれか。",
    hiragana: "しゃしん の どうぐ の なまえ は、 つぎ の どれか。",
    id_text: "Apa nama alat dalam foto?",
    options: ["一輪車（いちりんしゃ）(Gerobak satu roda)", "台車（だいしゃ）(Kereta dorong datar)", "そり (Sledge)", "ころ (Roller)"],
    answer: 2, hasPhoto: true,
    photoDesc: "📷 Foto: Kereta dorong datar berbentuk platform persegi panjang rendah dengan 4 roda kecil dan pegangan lipat/condong. Dilihat dari atas/sudut.",
    explanation: "台車 (daisha) = kereta dorong datar 4 roda untuk mengangkut material berat. Berbeda dari 一輪車 (gerobak satu roda). Kartu #342 (id di alat_umum).",
    related_card_id: 342
  },
  {
    id: "st2_q07", set: "st2", setLabel: "実技 Set 2",
    jp: "配管の保温保冷の屋外露出箇所では、保温筒を（　）で覆い仕上げます。",
    hiragana: "いか の ぶんしょう の （ ） に はいる ことば を えらびなさい。はいかん の ほおんほれい の おくがい ろしゅつ かしょ では、 ほおん とう を （ ） で おおい しあげます。",
    id_text: "Pada bagian pipa isolasi yang terekspos di LUAR RUANGAN, tabung insulasi (保温筒) ditutup menggunakan ( ).",
    options: ["ラッキングカバー (Lagging cover)", "マグパイプカバー (Mag pipe cover)"],
    answer: 1, hasPhoto: false,
    explanation: "ラッキングカバー = penutup finishing untuk isolasi pipa LUAR RUANGAN (屋外露出). Untuk dalam ruangan tidak wajib. Kartu #112.",
    related_card_id: 112
  },
  {
    id: "st2_q08", set: "st2", setLabel: "実技 Set 2",
    jp: "上水道やガス配管で使うポリエチレン管の接合は、次のどれか。",
    hiragana: "じょうすいどう や がすはいかん で つかう ぽりえちれんかん の せつごう は、 つぎ の どれか。",
    id_text: "Sambungan pipa polietilen yang digunakan untuk pipa air bersih dan pipa gas adalah yang mana?",
    options: ["ねじ接合（ねじせつごう）(Sambungan ulir)", "ＥＦ接合（ＥＦせつごう）(EF / Electro Fusion)"],
    answer: 2, hasPhoto: false,
    explanation: "Pipa polietilen (polyethylene) → EF接合 (Electro Fusion). SGP (baja) → ねじ接合 (sambungan ulir). Kartu #110.",
    related_card_id: 110
  },
  {
    id: "st2_q09", set: "st2", setLabel: "実技 Set 2",
    jp: "建築板金の丸ダクトの接続方法は、次のどれか。",
    hiragana: "けんちくばんきん の まるだくと の せつぞくほうほう は、 つぎ の どれか。",
    id_text: "Metode sambungan saluran udara bulat (丸ダクト) dalam pekerjaan pelat bangunan adalah yang mana?",
    options: ["差し込み継手工法（さしこみつぎてこうほう）(Insert joint method)", "共板フランジ工法（きょうばんフランジこうほう）(Common plate flange method)"],
    answer: 1, hasPhoto: false,
    explanation: "丸ダクト (round duct) → 差し込み継手工法 (selip/insert). 角ダクト (square duct) → 共板フランジ工法. Kartu #126.",
    related_card_id: 126
  },
  {
    id: "st2_q10", set: "st2", setLabel: "実技 Set 2",
    jp: "電柱を建てる穴を掘る前に、（　）や探針棒をつかって埋設物を確認します。",
    hiragana: "いか の ぶんしょう の （ ） に はいる ことば を えらびなさい。でんちゅう を たてる あな を ほる まえ に、 （ ） や たんしん ぼう を つかって まいせつぶつ を かくにん します。",
    id_text: "Sebelum menggali lubang untuk mendirikan tiang listrik, ( ) dan batang probe (探針棒) digunakan untuk mengkonfirmasi benda terpendam (埋設物).",
    options: ["穴掘建柱車（あなほりけんちゅうしゃ）(Kendaraan penggali & pendiri tiang)", "手掘り（てぼり）(Penggalian manual)"],
    answer: 2, hasPhoto: false,
    explanation: "手掘り (gali manual) + 探針棒 (batang probe) digunakan BERSAMA untuk memeriksa benda terpendam secara hati-hati sebelum menggali dengan mesin. 穴掘建柱車 = kendaraan untuk menggali & mendirikan tiang. Kartu #154.",
    related_card_id: 154
  },
  {
    id: "st2_q11", set: "st2", setLabel: "実技 Set 2",
    jp: "マンホール、ハンドホール、とう道、引上柱の間を結ぶ設備を何というか。",
    hiragana: "まんほーる、 はんど ほーる、 とうどう、 ひきあげちゅう の あいだ を むすぶ せつび を なんと いうか。",
    id_text: "Peralatan yang menghubungkan antara manhole, handhole, terowongan (とう道), dan tiang pengangkat (引上柱) disebut apa?",
    options: ["管路（かんろ）(Jalur kabel bawah tanah)", "共同溝（きょうどうこう）(Terowongan utilitas bersama)"],
    answer: 1, hasPhoto: false,
    explanation: "管路 (kanro) = infrastruktur yang menghubungkan manhole - handhole - とう道 - 引上柱. Berbeda dari 共同溝 yang merupakan terowongan utilitas besar. Kartu #113.",
    related_card_id: 113
  },
  {
    id: "st2_q12", set: "st2", setLabel: "実技 Set 2",
    jp: "管路の土被りは、車道では何メートルを超えなければならないか。",
    hiragana: "かんろ の どかぶり は、 しゃどう で は なんめーとる を こえなければ ならないか。",
    id_text: "Kedalaman tanah (土被り) jalur kabel (管路) di jalan raya harus melebihi berapa meter?",
    options: ["0.6ｍ", "0.8ｍ"],
    answer: 2, hasPhoto: false,
    explanation: "管路 di jalan raya (車道) → kedalaman tanah harus >0.8m. Angka ini wajib dihafalkan. Kartu #113.",
    related_card_id: 113
  },
  {
    id: "st2_q13", set: "st2", setLabel: "実技 Set 2",
    jp: "築炉工事での耐火煉瓦の接着に使うものは、次のどれか。",
    hiragana: "ちくろこうじ での たいかれんが の せっちゃく に つかう もの は、 つぎ の どれか。",
    id_text: "Bahan yang digunakan untuk merekatkan bata tahan api dalam pekerjaan築炉 adalah yang mana?",
    options: ["耐熱断熱煉瓦用モルタル（たいねつだんねつれんがようモルタル）(Mortar khusus bata tahan api)", "樹脂モルタル（じゅしモルタル）(Mortar resin)"],
    answer: 1, hasPhoto: false,
    explanation: "Perekat bata tahan api di konstruksi tungku = 耐熱断熱煉瓦用モルタル (mortar khusus tahan panas untuk bata tahan api). BUKAN mortar resin biasa. Kartu #124.",
    related_card_id: 124
  },
  {
    id: "st2_q14", set: "st2", setLabel: "実技 Set 2",
    jp: "事業者が新しく労働者を雇い入れた時に行う安全教育を何というか。",
    hiragana: "じぎょうしゃ が あたらしく ろうどうしゃ を やといいれた とき に おこなう あんぜん きょういく を なんと いうか。",
    id_text: "Pendidikan keselamatan yang dilakukan ketika pengusaha MEREKRUT PEKERJA BARU disebut apa?",
    options: ["新規入場者教育（しんきにゅうじょうしゃきょういく）(Pendidikan pekerja baru lokasi kerja)", "安全パトロール（あんぜんパトロール）(Patroli keselamatan)", "新入者安全衛生教育（しんにゅうしゃあんぜんえいせいきょういく）(Pendidikan K3 pekerja baru perusahaan)"],
    answer: 3, hasPhoto: false,
    explanation: "新入者安全衛生教育 = untuk PEREKRUTAN BARU oleh perusahaan. 新規入場者教育 = untuk PENDATANG BARU ke lokasi kerja (bisa sudah lama bekerja di perusahaan). Kartu #119.",
    related_card_id: 119
  },
  {
    id: "st2_q15", set: "st2", setLabel: "実技 Set 2",
    jp: "疲労がたまると事故につながるので、（　）を心がける。",
    hiragana: "いか の ぶんしょう の （ ） に はいる ことば を えらびなさい。ひろう が たまると じこ に つながるので、 （ ） を こころがける。",
    id_text: "Karena kelelahan yang menumpuk bisa menyebabkan kecelakaan, yang perlu diperhatikan adalah ( ).",
    options: ["適切な睡眠と食事をとること（てきせつなすいみんとしょくじをとること）(Tidur & makan yang cukup)", "お酒を飲んで作業すること（おさけをのんでさぎょうすること）(Bekerja sambil minum alkohol)", "前日に徹夜すること（ぜんじつにてつやすること）(Begadang sehari sebelumnya)"],
    answer: 1, hasPhoto: false,
    explanation: "Pencegahan kelelahan → 適切な睡眠と食事 (tidur & makan yang cukup). Kelelahan = penyebab kecelakaan. Kartu #155.",
    related_card_id: 155
  },

  // ── SET tt1: tt_sample.pdf — 学科 Set 1 (29 soal) ─────────────────────────
  {
    id: "tt1_q01", set: "tt1", setLabel: "学科 Set 1",
    jp: "流れよく工事を進めるには、専門工事業者間の（　）が大切である。",
    hiragana: "ながれよく こうじ を すすめる には、 せんもん こうじ ぎょうしゃ かん の （ ） が たいせつ である。",
    id_text: "Untuk memajukan pekerjaan dengan lancar, ( ) antar kontraktor spesialis sangat penting.",
    options: ["興味を持たないこと（きょうみをもたないこと）(Tidak peduli)", "チームワーク (Kerja tim / Teamwork)"],
    answer: 2, hasPhoto: false,
    explanation: "Kerjasama antar kontraktor spesialis = チームワーク. Tanpa teamwork, alur konstruksi kacau.",
    related_card_id: 764
  },
  {
    id: "tt1_q02", set: "tt1", setLabel: "学科 Set 1",
    jp: "一般的には、朝礼の最後に、２人１組となって、声を出しながら、（　）を行う。",
    hiragana: "いっぱんてき には、 ちょうれい の さいご に、 ふたりひとくみ と なって、 こえ を だしながら、 （ ） を おこなう。",
    id_text: "Pada umumnya, di akhir apel pagi, berpasangan dua orang, sambil bersuara, melakukan ( ).",
    options: ["あいさつ (Salam)", "体操（たいそう）(Senam)", "安全確認（あんぜんかくにん）(Konfirmasi keselamatan)"],
    answer: 3, hasPhoto: false,
    explanation: "Di akhir apel pagi, berpasangan → 安全確認 (konfirmasi keselamatan) sambil bersuara keras. Ini adalah 指差し呼称.",
    related_card_id: 7
  },
  {
    id: "tt1_q03", set: "tt1", setLabel: "学科 Set 1",
    jp: "職場内での優位性を利用して、業務の適正な範囲を超えて、精神・肉体に苦痛を与える、または職場環境を悪化させる行為は、何と呼ばれるか。",
    hiragana: "しょくばない で の ゆういせい を りよう して、 ぎょうむ の てきせい な はんい を こえて、 せいしん・にくたい に くつう を あたえる、 または しょくば かんきょう を あっか させる こうい は、 なに と よばれる か。",
    id_text: "Tindakan yang menggunakan superioritas di tempat kerja untuk menyebabkan penderitaan fisik/mental melebihi batas wajar disebut apa?",
    options: ["パワー・ハラスメント (Power Harassment)", "セクシャル・ハラスメント (Sexual Harassment)", "アルコール・ハラスメント (Alcohol Harassment)"],
    answer: 1, hasPhoto: false,
    explanation: "パワハラ = pelecehan berbasis kekuasaan jabatan. セクハラ = pelecehan seksual. Kata kunci: 'superioritas jabatan + penderitaan fisik/mental'.",
    related_card_id: 102
  },
  {
    id: "tt1_q04", set: "tt1", setLabel: "学科 Set 1",
    jp: "法定労働時間では、働く時間は1日何時間までか。",
    hiragana: "ほうてい ろうどう じかん で は、 はたらく じかん は 1 にち なんじかん まで か。",
    id_text: "Berdasarkan jam kerja yang ditetapkan undang-undang, batas jam kerja per hari adalah berapa jam?",
    options: ["6時間（6じかん）(6 jam)", "8時間（8じかん）(8 jam)", "12時間（12じかん）(12 jam)"],
    answer: 2, hasPhoto: false,
    explanation: "Batas jam kerja legal = 8 jam/hari & 40 jam/minggu (UU Standar Ketenagakerjaan). Kartu #9.",
    related_card_id: 9
  },
  {
    id: "tt1_q05", set: "tt1", setLabel: "学科 Set 1",
    jp: "建築基準法では、安全で安心な生活を送れるようにするため、建物の建築や利用についての（　）ルールを定めています。",
    hiragana: "けんちく きじゅんほう で は、 あんぜん で あんしん な せいかつ を おくれる よう に する ため、 たてもの の けんちく や りよう について の （ ） るーる を さだめて います。",
    id_text: "UU Standar Bangunan menetapkan aturan ( ) untuk konstruksi dan penggunaan bangunan demi kehidupan yang aman.",
    options: ["安全が保証される（あんぜんがほしょうされる）(Yang menjamin keamanan)", "最低限の（さいていげんの）(Minimum)", "必要以上の（ひつよういじょうの）(Lebih dari yang diperlukan)"],
    answer: 2, hasPhoto: false,
    explanation: "建築基準法 = menetapkan standar MINIMUM (最低限の) untuk bangunan. Bukan jaminan mutlak, bukan berlebihan. Kartu #13.",
    related_card_id: 13
  },
  {
    id: "tt1_q06", set: "tt1", setLabel: "学科 Set 1",
    jp: "消防法の目的には、火災または地震等の災害による被害を（　）することがあります。",
    hiragana: "しょうぼうほう の もくてき には、 かさい または じしん とう の さいがい による ひがい を （ ） する ことが あります。",
    id_text: "Salah satu tujuan UU Pemadam Kebakaran adalah ( ) kerugian akibat kebakaran atau bencana seperti gempa.",
    options: ["増加（ぞうか）(Meningkatkan)", "軽減（けいげん）(Mengurangi / Meringankan)"],
    answer: 2, hasPhoto: false,
    explanation: "Tujuan 消防法 = MENGURANGI (軽減) kerugian bencana. Bukan meningkatkan! Kartu #14.",
    related_card_id: 14
  },
  {
    id: "tt1_q07", set: "tt1", setLabel: "学科 Set 1",
    jp: "水道法が目指すものはどれか。",
    hiragana: "すいどうほうが めざすものは どれか。",
    id_text: "Apa yang menjadi tujuan UU Air Bersih (水道法)?",
    options: ["安価な水を供給する（あんかなみずをきょうきゅうする）(Menyuplai air yang terjangkau)", "高価な水を供給する（こうかなみずをきょうきゅうする）(Menyuplai air yang mahal)", "不浄な水を供給する（ふじょうなみずをきょうきゅうする）(Menyuplai air yang kotor)"],
    answer: 1, hasPhoto: false,
    explanation: "水道法 = bertujuan menyuplai air bersih yang terjangkau (安価). Bukan air mahal, bukan air kotor. Kartu #15.",
    related_card_id: 15
  },
  {
    id: "tt1_q08", set: "tt1", setLabel: "学科 Set 1",
    jp: "電気設備の工事や保安について定めている法律は何か。",
    hiragana: "でんき せつび の こうじ や ほあん について さだめて いる ほうりつ は なに か。",
    id_text: "UU apa yang mengatur konstruksi dan keamanan fasilitas kelistrikan?",
    options: ["ガス事業法（ガスじぎょうほう）(UU Usaha Gas)", "電気通信事業法（でんきつうしんじぎょうほう）(UU Usaha Telekomunikasi)", "電波法（でんぱほう）(UU Gelombang Radio)", "電気事業法（でんきじぎょうほう）(UU Usaha Kelistrikan)"],
    answer: 4, hasPhoto: false,
    explanation: "電気事業法 = mengatur konstruksi, pemeliharaan, & keamanan fasilitas listrik. Jangan bingung dengan 電気工事業法 (UU kontraktor listrik). Kartu #16.",
    related_card_id: 16
  },
  {
    id: "tt1_q09", set: "tt1", setLabel: "学科 Set 1",
    jp: "建築工事はどれか。",
    hiragana: "けんちくこうじは どれか。",
    id_text: "Yang mana yang termasuk pekerjaan bangunan (建築工事)?",
    options: ["住宅を作る工事（じゅうたくをつくるこうじ）(Membangun rumah)", "道路を作る工事（どうろをつくるこうじ）(Membangun jalan)", "ダムを作る工事（ダムをつくるこうじ）(Membangun bendungan)"],
    answer: 1, hasPhoto: false,
    explanation: "建築工事 = membangun gedung/rumah. Jalan & bendungan = 土木工事 (sipil). Perbedaan kunci: 建築 = struktur bangunan, 土木 = infrastruktur.",
    related_card_id: 641
  },
  {
    id: "tt1_q10", set: "tt1", setLabel: "学科 Set 1",
    jp: "写真の装置は、次のうちどれか。",
    hiragana: "しゃしんの そうちは、 つぎのうち どれか。",
    id_text: "Perangkat dalam foto adalah yang mana?",
    options: ["防水装置（ぼうすいそうち）(Alat kedap air)", "免振装置（めんしんそうち）(Alat isolasi seismik)", "空調装置（くうちょうそうち）(Alat AC)"],
    answer: 2, hasPhoto: true,
    photoDesc: "📸 FOTO: Perangkat berbentuk silinder/bantalan karet tebal di bawah struktur bangunan — ini adalah 免振装置 (seismic isolator), sistem isolasi gempa yang memisahkan bangunan dari gerakan tanah.",
    explanation: "免振装置 = seismic isolator — bantalan karet + baja berlapis di fondasi bangunan untuk meredam getaran gempa. Berbeda dari 制振 (damper) dan 耐震 (tahan gempa kaku).",
    related_card_id: 200
  },
  {
    id: "tt1_q11", set: "tt1", setLabel: "学科 Set 1",
    jp: "電気・ガス・水道・電話・インターネットなどに関わる工事を何というか。",
    hiragana: "でんき・がす・すいどう・でんわ・いんたーねっと など に かかわる こうじ を なに と いう か。",
    id_text: "Pekerjaan yang berkaitan dengan listrik, gas, air, telepon, internet disebut apa?",
    options: ["ライフライン工事（ライフラインこうじ）(Pekerjaan lifeline)", "建築工事（けんちくこうじ）(Pekerjaan bangunan)", "土木工事（どぼくこうじ）(Pekerjaan sipil)"],
    answer: 1, hasPhoto: false,
    explanation: "ライフライン工事 = pekerjaan jaringan utilitas vital: listrik, gas kota, air, telekomunikasi. Kartu #21.",
    related_card_id: 21
  },
  {
    id: "tt1_q12", set: "tt1", setLabel: "学科 Set 1",
    jp: "地面を掘って、井戸を作る工事を（　）と言います。",
    hiragana: "じめん を ほって、 いど を つくる こうじ を （ ） と いいます。",
    id_text: "Pekerjaan menggali tanah untuk membuat sumur disebut ( ).",
    options: ["掘削工事（くっさくこうじ）(Pekerjaan penggalian)", "トンネル工事（トンネルこうじ）(Pekerjaan terowongan)", "さく井工事（さくいこうじ）(Pekerjaan pengeboran sumur)", "穴掘工事（あなほりこうじ）(Pekerjaan gali lubang)"],
    answer: 3, hasPhoto: false,
    explanation: "さく井工事 = pengeboran sumur air secara vertikal. Bukan 掘削 (galian umum) atau 穴掘 (galian biasa). Kata kunci: 'menggali SUMUR' (井戸).",
    related_card_id: 205
  },
  {
    id: "tt1_q13", set: "tt1", setLabel: "学科 Set 1",
    jp: "既成杭工法とは、次のうちどれか。",
    hiragana: "きせいくいこうほう とは、 つぎ の うち どれか。",
    id_text: "Metode tiang pancang precast (既成杭工法) adalah yang mana?",
    options: ["工場で製作した杭を、現場に運んで打ち込む工法（こうじょうでせいさくしたくいを、げんばにはこんでうちこむこうほう）(Tiang dibuat di pabrik, dibawa & dipancang di lapangan)", "工事現場で杭を作る工法（こうじげんばでくいをつくるこうほう）(Tiang dibuat di lokasi proyek)", "既に使用された杭を再利用する工法（すでにしようされたくいをさいりようするこうほう）(Tiang bekas digunakan kembali)", "穴の中に生コンクリートを入れて杭を造る工法（あなのなかになまコンクリートをいれてくいをつくるこうほう）(Beton segar dituang ke lubang untuk membuat tiang)"],
    answer: 1, hasPhoto: false,
    explanation: "既成杭 = precast pile: dibuat di pabrik → dibawa ke lapangan → dipancang. Lawannya: 場所打ち杭 = beton cor di tempat (opsi 4). Pasangan jebakan klasik!",
    related_card_id: 332
  },
  {
    id: "tt1_q14", set: "tt1", setLabel: "学科 Set 1",
    jp: "柱や梁などの建物の骨組みを、鉄骨を使って組み立てる工事を、何というか。",
    hiragana: "はしら や はり など の たてもの の ほねぐみ を、 てっこつ を つかって くみたてる こうじ を、 なんと いうか。",
    id_text: "Pekerjaan memasang rangka bangunan (kolom, balok, dll) menggunakan baja struktural disebut apa?",
    options: ["鉄筋工事（てっきんこうじ）(Pekerjaan pembesian)", "型枠工事（かたわくこうじ）(Pekerjaan bekisting)", "鉄筋継手工事（てっきんつぎてこうじ）(Pekerjaan sambungan tulangan)", "鉄骨工事（てっこつこうじ）(Pekerjaan struktur baja)"],
    answer: 4, hasPhoto: false,
    explanation: "鉄骨工事 = pekerjaan struktur baja (kolom+balok baja). 鉄筋工事 = pekerjaan tulangan beton. Jangan tukar: 骨 (kerangka/baja) vs 筋 (tulangan/rebar).",
    related_card_id: 765
  },
  {
    id: "tt1_q15", set: "tt1", setLabel: "学科 Set 1",
    jp: "鉄筋の周りにコンクリートを流しこむための枠を作る工事は次のうちどれか。",
    hiragana: "てっきんの まわりに こんくりーとを ながしこむための わくを つくる こうじは つぎのうちどれか。",
    id_text: "Pekerjaan membuat cetakan/bekisting untuk mengecor beton di sekitar tulangan adalah yang mana?",
    options: ["鉄筋工事（てっきんこうじ）(Pembesian)", "鉄筋継手工事（てっきんつぎてこうじ）(Sambungan tulangan)", "型枠工事（かたわくこうじ）(Bekisting/formwork)", "窓枠工事（まどわくこうじ）(Pemasangan kusen jendela)"],
    answer: 3, hasPhoto: false,
    explanation: "型枠工事 = membuat cetakan (formwork/bekisting) agar beton mengeras dalam bentuk yang diinginkan. 鉄筋工事 = pasang tulangan baja saja.",
    related_card_id: 210
  },
  {
    id: "tt1_q16", set: "tt1", setLabel: "学科 Set 1",
    jp: "写真はどのような工事を行っているか。",
    hiragana: "しゃしんは どのような こうじを おこなっているか。",
    id_text: "Foto menunjukkan pekerjaan apa yang sedang dilakukan?",
    options: ["コンクリート打設工事（コンクリートだせつこうじ）(Pengecoran beton)", "機械土工事（きかいどこうじ）(Pekerjaan tanah mekanis)", "サッシ工事（サッシこうじ）(Pemasangan kusen aluminium)", "屋根工事（やねこうじ）(Pekerjaan atap)"],
    answer: 1, hasPhoto: true,
    photoDesc: "📸 FOTO: Beberapa pekerja berhelm merah & putih di atap bangunan mendatar, menggunakan selang besar & alat perata — ini adalah コンクリート打設工事 (pengecoran beton). Terlihat beton segar dituang & diratakan.",
    explanation: "コンクリート打設工事 = pengecoran beton. Ciri: selang pompa beton, alat pemadat (vibrator), permukaan datar yang sedang diisi beton.",
    related_card_id: 766
  },
  {
    id: "tt1_q17", set: "tt1", setLabel: "学科 Set 1",
    jp: "電気工事を行うために必要な資格を選びなさい。",
    hiragana: "でんき こうじ を おこなう ため に ひつよう な しかく を えらびなさい。",
    id_text: "Pilih kualifikasi yang diperlukan untuk melakukan pekerjaan listrik.",
    options: ["電気工事士（でんきこうじし）(Teknisi pekerjaan listrik)", "工事担任者（こうじたんにんしゃ）(Penanggung jawab pekerjaan telekomunikasi)", "電気通信主任技術者（でんきつうしんしゅにんぎじゅつしゃ）(Insinyur kepala telekomunikasi)", "消防設備士（しょうぼうせつびし）(Teknisi peralatan pemadam)"],
    answer: 1, hasPhoto: false,
    explanation: "電気工事士 = kualifikasi WAJIB untuk pekerjaan listrik. 工事担任者 = untuk telekomunikasi. 消防設備士 = untuk pemadam. Jangan tertukar!",
    related_card_id: 252
  },
  {
    id: "tt1_q18", set: "tt1", setLabel: "学科 Set 1",
    jp: "消防設備工事で設置される設備を選びなさい。",
    hiragana: "しょうぼう せつび こうじ で せっち される せつび を えらびなさい。",
    id_text: "Pilih peralatan yang dipasang dalam pekerjaan peralatan pemadam kebakaran.",
    options: ["洗面器（せんめんき）(Wastafel)", "焼却炉（しょうきゃくろ）(Incinerator/tungku pembakaran)", "スプリンクラー (Sprinkler)", "エアコン (AC)"],
    answer: 3, hasPhoto: false,
    explanation: "スプリンクラー (sprinkler) = peralatan pemadam otomatis → dipasang dalam 消防設備工事. Wastafel = sanitasi, AC = AC, tungku = bukan pemadam. Kartu #28.",
    related_card_id: 28
  },
  {
    id: "tt1_q19", set: "tt1", setLabel: "学科 Set 1",
    jp: "建物や建造物を（　）作業を解体工事という。",
    hiragana: "たてもの や けんぞうぶつ を（ ）さぎょう を かいたい こうじ と いう。",
    id_text: "Pekerjaan yang ( ) bangunan atau konstruksi disebut pekerjaan pembongkaran (解体工事).",
    options: ["作る（つくる）(Membuat)", "直す（なおす）(Memperbaiki)", "組み立てる（くみたてる）(Merakit)", "壊す（こわす）(Menghancurkan/membongkar)"],
    answer: 4, hasPhoto: false,
    explanation: "解体工事 = pekerjaan pembongkaran → kata kuncinya 壊す (menghancurkan). Bukan membuat, memperbaiki, atau merakit.",
    related_card_id: 222
  },
  {
    id: "tt1_q20", set: "tt1", setLabel: "学科 Set 1",
    jp: "建設工事には、（　）が必要な作業がある。",
    hiragana: "けんせつこうじには （ ）が ひつようなさぎょうがある。",
    id_text: "Dalam pekerjaan konstruksi, ada pekerjaan yang memerlukan ( ).",
    options: ["免許（めんきょ）(Lisensi/izin resmi)", "パスポート (Paspor)", "在留カード（ざいりゅうカード）(Kartu izin tinggal)"],
    answer: 1, hasPhoto: false,
    explanation: "Ada pekerjaan konstruksi yang memerlukan 免許 (lisensi/sertifikasi resmi), seperti pekerjaan listrik, crane, dll. Paspor & kartu tinggal bukan untuk pekerjaan teknis.",
    related_card_id: 220
  },
  {
    id: "tt1_q21", set: "tt1", setLabel: "学科 Set 1",
    jp: "特別教育は、社外で受講する方法と、（　）で実施する方法がある。",
    hiragana: "とくべつきょういくは、しゃがいで じゅこうする ほうほうと、（ ）で じっしする ほうほうが ある。",
    id_text: "Pelatihan khusus (特別教育) bisa dilaksanakan secara eksternal dan secara ( ).",
    options: ["海外（かいがい）(Di luar negeri)", "社内（しゃない）(Di dalam perusahaan)", "労働局（ろうどうきょく）(Di kantor tenaga kerja)"],
    answer: 2, hasPhoto: false,
    explanation: "特別教育 = 2 cara: ①社外 (eksternal, lembaga luar) dan ②社内 (internal, di dalam perusahaan sendiri). Keduanya sah secara hukum.",
    related_card_id: 220
  },
  {
    id: "tt1_q22", set: "tt1", setLabel: "学科 Set 1",
    jp: "事故やケガが無く、無事に１日の作業が進められることを願う気持ちを表すために、（　）というあいさつが使われる。",
    hiragana: "じこ や けが が なく、 ぶじ に １にち の さぎょう が すすめられる こと を ねがう きもち を あらわす ため に、（ ） という あいさつ が つかわれる。",
    id_text: "Sapaan yang digunakan untuk mengungkapkan harapan agar pekerjaan sehari berjalan tanpa kecelakaan adalah ( ).",
    options: ["お大事に（おだいじに）(Jaga kesehatan ya)", "ご安全（あんぜん）に (Semoga selamat)", "ご注意（ちゅうい）を (Harap berhati-hati)"],
    answer: 2, hasPhoto: false,
    explanation: "ご安全に = sapaan keselamatan khas konstruksi, bermakna 'semoga selamat bekerja'. Diucapkan di awal/akhir kerja. Kartu #678.",
    related_card_id: 678
  },
  {
    id: "tt1_q23", set: "tt1", setLabel: "学科 Set 1",
    jp: "（　）という言葉は、建設現場だけではなく、事務所や休憩場所などですれ違ったときにも使える。",
    hiragana: "（ ） という ことば は、 けんせつげんば だけ ではなく、 じむしょ や きゅうけいばしょ など で すれちがった とき にも つかえる。",
    id_text: "Kata ( ) bisa digunakan tidak hanya di lokasi konstruksi, tapi juga saat berpapasan di kantor atau ruang istirahat.",
    options: ["さようなら (Selamat tinggal)", "どういたしまして (Sama-sama)", "おつかれさまです (Terima kasih atas kerja kerasnya)"],
    answer: 3, hasPhoto: false,
    explanation: "お疲れ様です = bisa dipakai kapan saja & di mana saja di lingkungan kerja. ご安全に = khas lokasi konstruksi/berbahaya saja. Kartu #679.",
    related_card_id: 679
  },
  {
    id: "tt1_q24", set: "tt1", setLabel: "学科 Set 1",
    jp: "床など水平面に直接付ける墨を何というか。",
    hiragana: "ゆか など すいへいめん に ちょくせつ つける すみ を なんと いうか。",
    id_text: "Garis tinta yang dibuat langsung di permukaan horizontal seperti lantai disebut apa?",
    options: ["立て墨（たてずみ）(Garis vertikal)", "逃げ墨（にげずみ）(Garis referensi offset)", "仕上げ墨（しあげずみ）(Garis finishing)", "地墨（じずみ）(Garis lantai)"],
    answer: 4, hasPhoto: false,
    explanation: "地墨 (じずみ) = garis tinta di permukaan HORIZONTAL (lantai). 立て墨 = garis vertikal (kolom/dinding). 逃げ墨 = garis offset/referensi.",
    related_card_id: 684
  },
  {
    id: "tt1_q25", set: "tt1", setLabel: "学科 Set 1",
    jp: "斜面や平坦でない土地、低い土地に土砂を盛り上げて、平らな地表を作ることを何というか。",
    hiragana: "しゃめん や へいたん でない とち、 ひくい とち に どしゃ を もりあげて、 たいら な ちひょう を つくる こと を なんと いうか。",
    id_text: "Menimbun tanah/pasir di lereng atau tanah rendah untuk membuat permukaan yang rata disebut apa?",
    options: ["根切り（ねぎり）(Penggalian fondasi)", "盛り土（もりど）(Urugan/timbunan tanah)", "埋戻し（うめもどし）(Pengurugan kembali)", "素掘り（すぼり）(Galian mentah tanpa perkuatan)"],
    answer: 2, hasPhoto: false,
    explanation: "盛り土 = menambah/menumpuk tanah untuk meratakan permukaan. 根切り = menggali untuk fondasi. 埋戻し = menutup kembali galian setelah selesai.",
    related_card_id: 203
  },
  {
    id: "tt1_q26", set: "tt1", setLabel: "学科 Set 1",
    jp: "鉄筋とこれを覆うコンクリート表面までの距離のことを何というか。",
    hiragana: "てっきんと これをおおう こんくりーと ひょうめんまでの きょりのことを なんと いうか。",
    id_text: "Jarak antara tulangan baja dengan permukaan beton yang menutupinya disebut apa?",
    options: ["あき (Jarak bebas antar tulangan)", "あそび (Kelonggaran)", "かぶり厚さ（かぶりあつさ）(Selimut beton / concrete cover)", "間隔（かんかく）(Jarak/spasi)"],
    answer: 3, hasPhoto: false,
    explanation: "かぶり厚さ = selimut beton (concrete cover) — jarak dari tulangan ke permukaan beton. Fungsi: melindungi tulangan dari korosi & api.",
    related_card_id: 279
  },
  {
    id: "tt1_q27", set: "tt1", setLabel: "学科 Set 1",
    jp: "ライフライン・設備工事で使われる用語で、部屋の温度、湿度などを調整するという意味の言葉はどれか。",
    hiragana: "らいふらいん・せつびこうじ で つかわれる ようご で、へや の おんど、しつど など を ちょうせいする という いみ の ことば は どれか。",
    id_text: "Istilah dalam pekerjaan lifeline/instalasi yang berarti mengatur suhu dan kelembapan ruangan adalah?",
    options: ["空調（くうちょう）(AC / pengkondisian udara)", "換気（かんき）(Ventilasi)", "排煙（はいえん）(Pembuangan asap)", "衛生（えいせい）(Sanitasi)"],
    answer: 1, hasPhoto: false,
    explanation: "空調 (くうちょう) = Air Conditioning → mengatur suhu & kelembapan. 換気 = hanya sirkulasi udara. 排煙 = pembuangan asap darurat. Kartu #27.",
    related_card_id: 27
  },
  {
    id: "tt1_q28", set: "tt1", setLabel: "学科 Set 1",
    jp: "安全で過ごしやすく働きやすい環境を作るための5Sは、整理・整頓・清掃・清潔ともう一つは何か。",
    hiragana: "あんぜん で すごしやすく はたらきやすい かんきょう を つくる ため の 5S は、せいり・せいとん・せいそう・せいけつ と もうひとつは なにか。",
    id_text: "5S untuk menciptakan lingkungan kerja yang aman adalah 整理・整頓・清掃・清潔 dan satu lagi adalah?",
    options: ["修理（しゅうり）(Perbaikan)", "相談（そうだん）(Konsultasi)", "しつけ (Disiplin/Shitsuke)"],
    answer: 3, hasPhoto: false,
    explanation: "5S = 整理(Seiri) + 整頓(Seiton) + 清掃(Seisou) + 清潔(Seiketsu) + しつけ(Shitsuke/Disiplin). Semua diawali 'S'. Hafal 5 kata ini!",
    related_card_id: 101
  },
  {
    id: "tt1_q29", set: "tt1", setLabel: "学科 Set 1",
    jp: "作業員詰め所のルールとして、正しいものは、次のうちどれか。",
    hiragana: "さぎょういんつめしょ の るーる として、 ただしい もの は、 つぎ の うち どれか。",
    id_text: "Manakah yang merupakan aturan yang benar untuk ruang istirahat pekerja?",
    options: ["喫煙は、まわりから見えない場所で隠れてする（きつえんは、まわりからみえないばしょでかくれてする）(Merokok di tempat tersembunyi dari pandangan orang)", "ごみが落（お）ちているのを見（み）つけたら、そのままにしておく (Biarkan sampah yang ditemukan)", "ヘルメットや安全帯は決められた場所に置く（ヘルメットやあんぜんたいはきめられたばしょにおく）(Simpan helm & harness di tempat yang ditentukan)"],
    answer: 3, hasPhoto: false,
    explanation: "Helm & harness disimpan di tempat yang SUDAH DITENTUKAN → mudah ditemukan & tidak rusak. Merokok sembarangan & membiarkan sampah = SALAH.",
    related_card_id: 304
  },

  // ── SET tt2: tt_sample2.pdf — 学科 Set 2 (36 soal) ────────────────────────
  {
    id: "tt2_q01", set: "tt2", setLabel: "学科 Set 2",
    jp: "作業開始前に毎日行われる、すべての作業員が集まるミーティングを何というか。",
    hiragana: "さぎょう かいし まえ に まいにち おこなわれる、 すべて の さぎょう いん が あつまる みーてぃんぐ を なん と いう か。",
    id_text: "Pertemuan harian sebelum mulai kerja yang dihadiri semua pekerja disebut apa?",
    options: ["朝礼（ちょうれい）(Apel pagi)", "ラジオ体操（ラジオたいそう）(Senam radio)", "安全唱和（あんぜんしょうわ）(Nyanyian keselamatan)"],
    answer: 1, hasPhoto: false,
    explanation: "朝礼 = apel pagi wajib setiap hari sebelum kerja, dihadiri SEMUA pekerja. Ada 2 jenis: apel umum & apel per jenis kerja. Kartu #4.",
    related_card_id: 4
  },
  {
    id: "tt2_q02", set: "tt2", setLabel: "学科 Set 2",
    jp: "写真は何の活動を行っているところか。",
    hiragana: "しゃしん は なん の かつどう を おこなっている ところ か。",
    id_text: "Foto menunjukkan kegiatan apa yang sedang dilakukan?",
    options: ["KY活動（KYかつどう）(Kegiatan KY/identifikasi bahaya)", "タッチアンドコール (Touch-and-call)", "ラジオ体操（ラジオたいそう）(Senam radio)"],
    answer: 2, hasPhoto: true,
    photoDesc: "📸 FOTO: Beberapa pekerja berhelm menumpuk tangan di tengah (seperti yel-yel tim olahraga) — ini adalah タッチアンドコール (touch-and-call), konfirmasi komitmen keselamatan kelompok.",
    explanation: "タッチアンドコール = semua anggota tumpuk tangan → teriak bersama → konfirmasi komitmen keselamatan. Berbeda dari KY活動 (identifikasi bahaya per titik).",
    related_card_id: 599
  },
  {
    id: "tt2_q03", set: "tt2", setLabel: "学科 Set 2",
    jp: "労災保険の保険料を支払うのは誰か。",
    hiragana: "ろうさい ほけん の ほけんりょう を しはらう の は だれか。",
    id_text: "Siapa yang membayar premi asuransi kecelakaan kerja (労災保険)?",
    options: ["事業主（じぎょうぬし）(Pengusaha/pemberi kerja)", "労働者（ろうどうしゃ）(Pekerja/karyawan)"],
    answer: 1, hasPhoto: false,
    explanation: "労災保険 = premi 100% ditanggung 事業主 (pengusaha). Pekerja tidak bayar sama sekali. BERBEDA dari 雇用保険 yang dibayar bersama. Kartu #19.",
    related_card_id: 19
  },
  {
    id: "tt2_q04", set: "tt2", setLabel: "学科 Set 2",
    jp: "職場における労働者の安全と健康を確保することを目的とした法律は何か。",
    hiragana: "しょくば に おける ろうどうしゃ の あんぜん と けんこう を かくほ する こと を もくてき と した ほうりつ は なにか。",
    id_text: "UU apa yang bertujuan memastikan keselamatan dan kesehatan pekerja di tempat kerja?",
    options: ["雇用保険法（こようほけんほう）(UU Asuransi Ketenagakerjaan)", "労働安全衛生法（ろうどうあんぜんえいせいほう）(UU Keselamatan & Kesehatan Kerja)"],
    answer: 2, hasPhoto: false,
    explanation: "労働安全衛生法 = UU K3 → keselamatan & kesehatan pekerja di tempat kerja. 雇用保険法 = asuransi saat kehilangan pekerjaan. Kartu #10.",
    related_card_id: 10
  },
  {
    id: "tt2_q05", set: "tt2", setLabel: "学科 Set 2",
    jp: "建設業法の目的はどれか。",
    hiragana: "けんせつぎょうほう の もくてき は どれか。",
    id_text: "Apa tujuan dari UU Industri Konstruksi (建設業法)?",
    options: ["建設業を営む者の資質の向上（けんせつぎょうをいとなむもののししつのこうじょう）(Peningkatan KUALITAS SDM pelaku konstruksi)", "建設業を営む者の技能の向上（けんせつぎょうをいとなむもののぎのうのこうじょう）(Peningkatan KETERAMPILAN pelaku konstruksi)"],
    answer: 1, hasPhoto: false,
    explanation: "建設業法の目的 = meningkatkan 資質 (kualitas/kompetensi menyeluruh). Bukan hanya 技能 (skill teknis). 資質 mencakup etika, manajemen, dll. Kartu #12.",
    related_card_id: 12
  },
  {
    id: "tt2_q06", set: "tt2", setLabel: "学科 Set 2",
    jp: "建設リサイクル法とは、（　）の適切な処理や再資源化を促すための法律です。",
    hiragana: "けんせつ りさいくるほう とは、（ ） の てきせつ な しょり や さいしげんか を うながす ため の ほうりつ です。",
    id_text: "UU Daur Ulang Konstruksi adalah UU yang mendorong pengelolaan & daur ulang ( ) secara tepat.",
    options: ["大気汚染物質（たいきおせんぶっしつ）(Polutan udara)", "廃材（はいざい）(Material sisa/limbah konstruksi)"],
    answer: 2, hasPhoto: false,
    explanation: "建設リサイクル法 = mengatur daur ulang 廃材 (material sisa konstruksi: beton, kayu, aspal). Bukan polutan udara. Kartu #116.",
    related_card_id: 116
  },
  {
    id: "tt2_q07", set: "tt2", setLabel: "学科 Set 2",
    jp: "ガス事業法は、導管によりガスを供給する（　）ガス事業に関して、保安の確保や、ガスの使用者の保護を目的とした法律です。",
    hiragana: "がすじぎょうほう は、 どうかん に より がす を きょうきゅう する （ ）がすじぎょう に かんして、 ほあん の かくほ や、 がす の しよう しゃ の ほご を もくてき と した ほうりつ です。",
    id_text: "UU Usaha Gas mengatur usaha gas ( ) yang memasok gas melalui pipa, bertujuan memastikan keamanan & melindungi pengguna gas.",
    options: ["都市（とし）(Gas kota/city gas)", "LP (Gas LPG)"],
    answer: 1, hasPhoto: false,
    explanation: "ガス事業法 = untuk 都市ガス (gas kota, distribusi lewat pipa/導管). LPガス diatur UU berbeda. Kata kunci: 導管 (pipa) = gas kota. Kartu #118.",
    related_card_id: 118
  },
  {
    id: "tt2_q08", set: "tt2", setLabel: "学科 Set 2",
    jp: "電気通信工事を実施したり、監督するのに必要な資格は何か。",
    hiragana: "でんき つうしん こうじ を じっし したり、 かんとく する の に ひつよう な しかく は なにか。",
    id_text: "Kualifikasi apa yang diperlukan untuk melaksanakan atau mengawasi pekerjaan telekomunikasi?",
    options: ["電気工事士（でんきこうじし）(Teknisi pekerjaan listrik)", "工事担任者（こうじたんにんしゃ）(Penanggung jawab pekerjaan telekomunikasi)"],
    answer: 2, hasPhoto: false,
    explanation: "工事担任者 = kualifikasi untuk pekerjaan TELEKOMUNIKASI. 電気工事士 = untuk pekerjaan LISTRIK. Pasangan jebakan klasik! Kartu #17.",
    related_card_id: 17
  },
  {
    id: "tt2_q09", set: "tt2", setLabel: "学科 Set 2",
    jp: "電気は扱い方を間違えると、（　）につながる。",
    hiragana: "でんき は あつかいかた を まちがえると、 （ ） に つながる。",
    id_text: "Jika listrik ditangani dengan salah, akan menyebabkan ( ).",
    options: ["火災や感電（かさいやかんでん）(Kebakaran dan sengatan listrik)", "ガス漏れ（ガスもれ）(Kebocoran gas)"],
    answer: 1, hasPhoto: false,
    explanation: "Listrik yang ditangani salah → kebakaran (火災) & sengatan listrik (感電). Bukan kebocoran gas. Kartu #81 (感電).",
    related_card_id: 81
  },
  {
    id: "tt2_q10", set: "tt2", setLabel: "学科 Set 2",
    jp: "ダムの目的は、次のどれか。",
    hiragana: "だむ の もくてき は、 つぎ の どれか。",
    id_text: "Apa tujuan pembangunan bendungan (ダム)?",
    options: ["治水（ちすい）(Pengendalian banjir)", "汚水（おすい）(Air kotor/limbah)", "排水（はいすい）(Drainase/pembuangan air)", "治山（ちざん）(Konservasi lahan pegunungan)"],
    answer: 1, hasPhoto: false,
    explanation: "Tujuan utama bendungan = 治水 (pengendalian banjir, penyediaan air). 治山 = reboisasi/konservasi gunung. Jangan tukar keduanya.",
    related_card_id: 642
  },
  {
    id: "tt2_q11", set: "tt2", setLabel: "学科 Set 2",
    jp: "トンネルは、（　）、道路、水路、およびその他のインフラ設備の建設に使用されます。",
    hiragana: "とんねる は、 （ ）、 どうろ、 すいろ、 および そのた の いんふらせつび の けんせつ に しよう されます。",
    id_text: "Terowongan digunakan untuk pembangunan ( ), jalan raya, saluran air, dan infrastruktur lainnya.",
    options: ["海路（かいろ）(Jalur laut)", "鉄道（てつどう）(Jalur kereta api)", "空路（くうろ）(Jalur udara)", "橋（はし）(Jembatan)"],
    answer: 2, hasPhoto: false,
    explanation: "Terowongan digunakan untuk 鉄道 (kereta api), jalan raya, saluran air. Bukan jalur laut/udara — itu di atas permukaan.",
    related_card_id: 643
  },
  {
    id: "tt2_q12", set: "tt2", setLabel: "学科 Set 2",
    jp: "掘削工事によって土の壁が崩れないようにすることを（　）という。",
    hiragana: "くっさくこうじ に よって つち の かべ が くずれない よう に する こと を （ ） と いう。",
    id_text: "Tindakan mencegah dinding tanah runtuh akibat pekerjaan penggalian disebut ( ).",
    options: ["仮設（かせつ）(Instalasi sementara)", "排水（はいすい）(Drainase)", "山留め（やまどめ）(Penahan tanah galian)", "試掘（しくつ）(Galian uji coba)"],
    answer: 3, hasPhoto: false,
    explanation: "山留め = mencegah tanah di sisi galian runtuh. Di bidang konstruksi sering disebut 土留め. Wajib jika kedalaman ≥1.5m. Kartu #108.",
    related_card_id: 108
  },
  {
    id: "tt2_q13", set: "tt2", setLabel: "学科 Set 2",
    jp: "基礎、柱、梁、壁面、床などで構成される建物の構造部分を（　）と言う。",
    hiragana: "きそ、 はしら、 はり、 へきめん、 ゆか など で こうせい される たてもの の こうぞう ぶぶん を （ ） と いう。",
    id_text: "Bagian struktural bangunan yang terdiri dari fondasi, kolom, balok, dinding, lantai dsb disebut ( ).",
    options: ["内装仕上げ（ないそうしあげ）(Finishing interior)", "建具（たてぐ）(Kusen pintu/jendela)", "屋根（やね）(Atap)", "躯体（くたい）(Struktur utama/kutai)"],
    answer: 4, hasPhoto: false,
    explanation: "躯体 (くたい) = struktur utama bangunan: fondasi + kolom + balok + dinding + lantai. 仕上げ = finishing, 建具 = kusen, 屋根 = atap.",
    related_card_id: 767
  },
  {
    id: "tt2_q14", set: "tt2", setLabel: "学科 Set 2",
    jp: "都市ガス工事で行う工事はどれか。",
    hiragana: "とし がす こうじ で おこなう こうじ は どれか。",
    id_text: "Pekerjaan apa yang dilakukan dalam 都市ガス工事 (pekerjaan gas kota)?",
    options: ["ケーブル工事（ケーブルこうじ）(Pekerjaan kabel)", "管路の工事（かんろのこうじ）(Pekerjaan jalur pipa)", "配電盤の工事（はいでんばんのこうじ）(Pekerjaan panel distribusi listrik)", "電柱工事（でんちゅうこうじ）(Pekerjaan tiang listrik)"],
    answer: 2, hasPhoto: false,
    explanation: "都市ガス工事 = pekerjaan jaringan PIPA (管路) untuk mendistribusikan gas kota. Kabel & panel = pekerjaan listrik. Kartu #24.",
    related_card_id: 24
  },
  {
    id: "tt2_q15", set: "tt2", setLabel: "学科 Set 2",
    jp: "建物内で使用された水を集める施設を作る工事を何というか。",
    hiragana: "たてものない で しよう された みず を あつめる しせつ を つくる こうじ を なんと いうか。",
    id_text: "Pekerjaan membangun fasilitas yang mengumpulkan air yang sudah digunakan di dalam gedung disebut apa?",
    options: ["電気通信工事（でんきつうしんこうじ）(Pekerjaan telekomunikasi)", "上水道工事（じょうすいどうこうじ）(Pekerjaan air bersih)", "下水道工事（げすいどうこうじ）(Pekerjaan saluran air limbah)", "電気工事（でんきこうじ）(Pekerjaan listrik)"],
    answer: 3, hasPhoto: false,
    explanation: "下水道工事 = membangun sistem pengumpulan air LIMBAH (bekas pakai). 上水道 = air BERSIH. Air yang sudah dipakai → 下水道. Kartu #25.",
    related_card_id: 25
  },
  {
    id: "tt2_q16", set: "tt2", setLabel: "学科 Set 2",
    jp: "推進トンネル工事では、あらかじめ工場で製作した管を掘進機に連結し、発進立坑に設置した（　）で地中に押し込む。",
    hiragana: "すいしん とんねる こうじ では、 あらかじめ こうじょう で せいさく した かん を くっしんき に れんけつ し、 はっしん たてこう に せっち した （ ） で ちちゅう に おしこむ。",
    id_text: "Dalam pipe jacking tunnel, pipa yang dibuat di pabrik dihubungkan ke mesin bor dan didorong ke dalam tanah menggunakan ( ) yang dipasang di shaft awal.",
    options: ["ジャッキ (Dongkrak hidrolik/jack)", "クレーン (Crane)", "押輪（おしわ）(Cincin pendorong)"],
    answer: 1, hasPhoto: false,
    explanation: "推進トンネル工事 (pipe jacking) = pipa didorong dengan JACKS hidrolik (ジャッキ). Bukan crane (digunakan angkat, bukan dorong horizontal).",
    related_card_id: 191
  },
  {
    id: "tt2_q17", set: "tt2", setLabel: "学科 Set 2",
    jp: "機械の運転・操作には、定められた（　）や特別教育を修了しなければならない。",
    hiragana: "きかい の うんてん・そうさ には、 さだめられた （ ） や とくべつ きょういく を しゅうりょう しなければ ならない。",
    id_text: "Untuk mengoperasikan mesin, harus menyelesaikan ( ) yang ditetapkan dan pelatihan khusus.",
    options: ["マネジメント講習（マネジメントこうしゅう）(Pelatihan manajemen)", "技能講習（ぎのうこうしゅう）(Pelatihan keterampilan)", "基幹技能者講習（きかんぎのうしゃこうしゅう）(Pelatihan teknisi inti)"],
    answer: 2, hasPhoto: false,
    explanation: "Operasi mesin berat = wajib 技能講習 (pelatihan keterampilan, misal: crane, forklift) + 特別教育. Bukan manajemen atau teknisi inti.",
    related_card_id: 220
  },
  {
    id: "tt2_q18", set: "tt2", setLabel: "学科 Set 2",
    jp: "この写真は、どんな作業を行っているところか。",
    hiragana: "この しゃしん は、 どんな さぎょう を おこなっている ところ か。",
    id_text: "Foto ini menunjukkan pekerjaan apa yang sedang dilakukan?",
    options: ["積み込み作業（つみこみさぎょう）(Pekerjaan pemuatan/loading)", "盛り土作業（もりどさぎょう）(Pekerjaan urugan tanah)", "敷き均し作業（しきならしさぎょう）(Pekerjaan penghamparan/grading)"],
    answer: 3, hasPhoto: true,
    photoDesc: "📸 FOTO: Mesin paver aspal besar (asphalt finisher) berwarna hijau sedang bergerak di atas permukaan jalan, menghamparkan material aspal secara merata — ini adalah 敷き均し作業.",
    explanation: "敷き均し作業 = penghamparan material (aspal dll) secara merata menggunakan mesin finisher. Berbeda dari 盛り土 (timbunan tanah) atau 積み込み (pemuatan).",
    related_card_id: 768
  },
  {
    id: "tt2_q19", set: "tt2", setLabel: "学科 Set 2",
    jp: "ブルドーザなどの機械を使って、土砂を押して運ぶことを（　）という。",
    hiragana: "ぶるどーざ など の きかい を つかって、 どしゃ を おして はこぶ こと を （ ） と いう。",
    id_text: "Mendorong dan memindahkan tanah/pasir menggunakan mesin seperti bulldozer disebut ( ).",
    options: ["押土（おしど）(Mendorong tanah)", "運搬（うんぱん）(Pengangkutan)", "掘削（くっさく）(Penggalian)"],
    answer: 1, hasPhoto: false,
    explanation: "押土 (おしど) = mendorong tanah dengan blade bulldozer. 掘削 = menggali. 運搬 = mengangkut. Kata kunci: 'mendorong' (押す) + bulldozer. Kartu #148 (転圧関連).",
    related_card_id: 242
  },
  {
    id: "tt2_q20", set: "tt2", setLabel: "学科 Set 2",
    jp: "屋根工事に含まれる工事はどれか。",
    hiragana: "やねこうじ に ふくまれる こうじ は どれか。",
    id_text: "Mana yang termasuk dalam pekerjaan atap (屋根工事)?",
    options: ["カーテン工事（カーテンこうじ）(Pemasangan tirai/curtain)", "漆喰補修工事（しっくいほしゅうこうじ）(Perbaikan plester mortar)", "吹付けウレタン断熱工事（ふきつけウレタンだんねつこうじ）(Semprot insulasi uretan)"],
    answer: 2, hasPhoto: false,
    explanation: "漆喰補修工事 (perbaikan plester/mortar) = masuk 屋根工事 karena atap tradisional Jepang menggunakan plester. Tirai = interior. Semprot uretan = biasanya isolasi dinding/lantai.",
    related_card_id: 674
  },
  {
    id: "tt2_q21", set: "tt2", setLabel: "学科 Set 2",
    jp: "型枠を鉄製のパイプで補強することを（　）という。",
    hiragana: "かたわく を てつせい の ぱいぷ で ほきょう することを （ ） と いう。",
    id_text: "Memperkuat bekisting dengan pipa besi disebut ( ).",
    options: ["打設（だせつ）(Pengecoran)", "保温（ほおん）(Isolasi termal)", "支保工（しほこう）(Perancah penyangga/shoring)"],
    answer: 3, hasPhoto: false,
    explanation: "支保工 = sistem perancah/shoring dengan pipa besi untuk menopang bekisting saat pengecoran. 打設 = menuang beton. 保温 = isolasi panas.",
    related_card_id: 210
  },
  {
    id: "tt2_q22", set: "tt2", setLabel: "学科 Set 2",
    jp: "写真の鉄筋継手は何という工法か。",
    hiragana: "しゃしん の てっきん つぎて は なんという こうほう か。",
    id_text: "Metode sambungan tulangan dalam foto disebut apa?",
    options: ["機械式継手（きかいしきつぎて）(Sambungan mekanis/coupler)", "重ね継手（かさねつぎて）(Sambungan tumpang)", "溶接継手（ようせつつぎて）(Sambungan las)"],
    answer: 1, hasPhoto: true,
    photoDesc: "📸 FOTO: Batang baja berulir (rebar) dengan coupling sleeve logam di tengah — ini adalah 機械式継手 (mechanical coupler/sambungan mekanis), tulangan disambung lewat selongsong berulir.",
    explanation: "機械式継手 = coupler berulir menghubungkan 2 rebar. Ciri visual: ada selongsong/sleeve di tengah sambungan. 重ね継手 = tumpang, 溶接継手 = las.",
    related_card_id: 208
  },
  {
    id: "tt2_q23", set: "tt2", setLabel: "学科 Set 2",
    jp: "（　）は、鉄筋と鉄筋のつなぐ部分を加熱して、軸方向に圧力をかけて接合する工法である。",
    hiragana: "（ ）は、 てっきん と てっきん の つなぐ ぶぶん を かねつ して、 じくほうこう に あつりょく を かけて せつごう する こうほう である。",
    id_text: "( ) adalah metode menyambung tulangan dengan memanaskan bagian sambungan lalu memberikan tekanan pada arah aksial.",
    options: ["溶接継手（ようせつつぎて）(Las listrik)", "ガス圧接継手（ガスあっせつつぎて）(Gas pressure welding)", "重ね継手（かさねつぎて）(Tumpang)"],
    answer: 2, hasPhoto: false,
    explanation: "ガス圧接継手 = pemanasan gas + tekanan aksial → sambungan permanen tanpa logam pengisi. 溶接継手 = las (ada logam pengisi). Kata kunci: 'dipanaskan + tekanan aksial'.",
    related_card_id: 208
  },
  {
    id: "tt2_q24", set: "tt2", setLabel: "学科 Set 2",
    jp: "電気工事は、外線工事と（　）の大きく２つに分かれます。",
    hiragana: "でんき こうじ は、 がいせん こうじ と （ ） の おおきく ２ つ に わかれます。",
    id_text: "Pekerjaan listrik secara garis besar dibagi menjadi pekerjaan luar (外線工事) dan ( ).",
    options: ["配線工事（はいせんこうじ）(Pekerjaan pengkabelan)", "接地工事（せっちこうじ）(Pekerjaan pentanahan)", "内線工事（ないせんこうじ）(Pekerjaan instalasi dalam gedung)"],
    answer: 3, hasPhoto: false,
    explanation: "Listrik = 外線工事 (jaringan luar: tiang, kabel udara/bawah tanah) + 内線工事 (instalasi dalam gedung). Kartu #23.",
    related_card_id: 23
  },
  {
    id: "tt2_q25", set: "tt2", setLabel: "学科 Set 2",
    jp: "電気通信には、ケーブルを用いた有線方式と、電波を用いた（　）がある。",
    hiragana: "でんき つうしん に は、 けーぶる を もちいた ゆうせん ほうしき と、 でんぱ を もちいた （ ） が ある。",
    id_text: "Telekomunikasi terbagi atas sistem berkabel (有線方式) dan ( ) yang menggunakan gelombang radio.",
    options: ["無線方式（むせんほうしき）(Sistem nirkabel)", "光ファイバー（ひかりファイバー）(Serat optik)", "インターネット (Internet)"],
    answer: 1, hasPhoto: false,
    explanation: "Telekomunikasi = 有線方式 (kabel, termasuk serat optik) + 無線方式 (nirkabel, gelombang radio). Serat optik masih 有線 (berkabel). Kartu #45, #26.",
    related_card_id: 26
  },
  {
    id: "tt2_q26", set: "tt2", setLabel: "学科 Set 2",
    jp: "衛生器具設備工事で、設置する設備を選べ。",
    hiragana: "えいせい きぐ せつび こうじ で、 せっち する せつび を えらべ。",
    id_text: "Pilih peralatan yang dipasang dalam pekerjaan instalasi sanitasi (衛生器具設備工事).",
    options: ["エアコン (AC)", "トイレの便器（トイレのべんき）(Closet/toilet)", "貯湯槽（ちょとうそう）(Tangki air panas)"],
    answer: 2, hasPhoto: false,
    explanation: "衛生器具設備 = peralatan sanitasi: toilet/closet, wastafel, bath tub. AC = 空調. Tangki air panas = perlengkapan pemanas air, bukan sanitasi.",
    related_card_id: 30
  },
  {
    id: "tt2_q27", set: "tt2", setLabel: "学科 Set 2",
    jp: "煙や熱を自動的に感知する装置や、非常ベル、非常放送などの設備を何というか。",
    hiragana: "けむり や ねつ を じどうてき に かんち する そうち や、 ひじょう べる、 ひじょう ほうそう など の せつび を なんと いうか。",
    id_text: "Perangkat yang secara otomatis mendeteksi asap/panas, bel darurat, dan siaran darurat disebut apa?",
    options: ["消火設備（しょうかせつび）(Peralatan pemadam kebakaran)", "避難設備（ひなんせつび）(Peralatan evakuasi)", "警報設備（けいほうせつび）(Peralatan alarm/peringatan)"],
    answer: 3, hasPhoto: false,
    explanation: "警報設備 = sistem alarm: detektor asap/panas, bel darurat, siaran darurat. 消火設備 = aktif memadamkan api (sprinkler, hidran). 避難設備 = tangga darurat, tanda evakuasi.",
    related_card_id: 28
  },
  {
    id: "tt2_q28", set: "tt2", setLabel: "学科 Set 2",
    jp: "まわりにいる人が（　）と叫んだときは、自分に危険が迫っている可能性があるため、すぐに反応すること。",
    hiragana: "まわり に いる ひと が （ ） と さけんだ とき は、 じぶん に きけん が せまって いる かのうせい が ある ため、 すぐ に はんのう する こと。",
    id_text: "Saat orang di sekitar berteriak ( ), ada kemungkinan bahaya sedang mengancam dirimu, jadi segera bereaksi.",
    options: ["危ない（あぶない）(Bahaya! / Awas!)", "足元よし（あしもとよし）(Kondisi kaki/pijakan aman)", "ご安全（あんぜん）に (Semoga selamat)", "起立（きりつ）(Berdiri)"],
    answer: 1, hasPhoto: false,
    explanation: "Teriakan 危ない！= bahaya mengancam SEGERA. Harus langsung bereaksi, minggir, atau hindari. Kartu #682.",
    related_card_id: 682
  },
  {
    id: "tt2_q29", set: "tt2", setLabel: "学科 Set 2",
    jp: "土木工事では、「丁張り」ともいう建物を建てるための基準線、建物の位置、直角、水平が分かるように作る「仮の囲い」は、次のどれか。",
    hiragana: "どぼくこうじ では、「ちょうはり」 ともいう たてもの を たてるため の きじゅんせん、 たてもの の いち、 ちょっかく、 すいへい が わかるよう に つくる 「かりのかこい」 は、 つぎのどれか。",
    id_text: "Di konstruksi sipil, 'pagar sementara' yang disebut juga '丁張り' untuk menentukan garis referensi, posisi, sudut siku, dan ketinggian bangunan adalah?",
    options: ["水盛り（みずもり）(Penyamaan ketinggian dengan air)", "遣り方（やりかた）(Setting-out/tata letak referensi)", "水貫（みずぬき）(Papan horizontal referensi)"],
    answer: 2, hasPhoto: false,
    explanation: "遣り方 = rangka tiang kayu + papan (水貫) untuk menentukan posisi & ketinggian. Di sipil disebut 丁張り. 水盛り = hanya untuk cek kerataan. Kartu #152.",
    related_card_id: 152
  },
  {
    id: "tt2_q30", set: "tt2", setLabel: "学科 Set 2",
    jp: "急な斜面に盛り土をするとき、盛り土が滑り落ちないようにするために、階段状に地盤を削ることは、次のどれか。",
    hiragana: "きゅうな しゃめん に もりど を するとき、 もりど が すべりおちないように するために、 かいだんじょう に じばん を けずることは、 つぎのどれか。",
    id_text: "Saat melakukan urugan di lereng terjal, apa yang dilakukan untuk mencegah urugan meluncur, yaitu memotong tanah dasar secara bertangga?",
    options: ["路床（ろしょう）(Subgrade/lapisan sub-dasar jalan)", "締固め（しめかため）(Pemadatan)", "段切り（だんぎり）(Potongan bertangga/step cutting)"],
    answer: 3, hasPhoto: false,
    explanation: "段切り = memotong lereng secara BERTANGGA (seperti tangga) sebelum menambah urugan → mencegah urugan meluncur. 締固め = memadatkan tanah (berbeda tahap).",
    related_card_id: 267
  },
  {
    id: "tt2_q31", set: "tt2", setLabel: "学科 Set 2",
    jp: "日本で古くから使われている面積の単位は何か。",
    hiragana: "にほん で ふるく から つかわれている めんせき の たんい は なにか。",
    id_text: "Satuan luas yang sudah lama digunakan di Jepang adalah apa?",
    options: ["坪（つぼ）(Tsubo — satuan luas tradisional)", "寸（すん）(Sun — satuan panjang)", "尺（しゃく）(Shaku — satuan panjang)"],
    answer: 1, hasPhoto: false,
    explanation: "坪 (つぼ) = satuan luas tradisional Jepang ≈ 3.3 m². Masih digunakan dalam properti. 寸/尺 = satuan PANJANG (bukan luas).",
    related_card_id: 288
  },
  {
    id: "tt2_q32", set: "tt2", setLabel: "学科 Set 2",
    jp: "型枠の再利用のために型枠から釘を抜き取ることを何というか。",
    hiragana: "かたわく の さいりよう の ために かたわく から くぎ を ぬきとる こと を なんというか。",
    id_text: "Mencabut paku dari bekisting agar bisa digunakan kembali disebut apa?",
    options: ["打ち込み（うちこみ）(Pemakuan/menancapkan paku)", "釘仕舞（くぎじまい）(Mencabut dan menyimpan paku)", "釘止め（くぎどめ）(Pengikatan dengan paku)"],
    answer: 2, hasPhoto: false,
    explanation: "釘仕舞 (くぎじまい) = mencabut paku dari bekisting yang sudah dibongkar, agar papan bisa dipakai ulang. 打ち込み = menancapkan. 釘止め = mengencangkan.",
    related_card_id: 314
  },
  {
    id: "tt2_q33", set: "tt2", setLabel: "学科 Set 2",
    jp: "電気工事で、電気が流れる部分から、他の部分に電流が流れないようにすることは、次のどれか。",
    hiragana: "でんきこうじ で、 でんき が ながれる ぶぶん から、 た の ぶぶん に でんりゅう が ながれない よう に すること は、 つぎのどれか。",
    id_text: "Dalam pekerjaan listrik, tindakan mencegah arus mengalir dari bagian berlistrik ke bagian lain adalah?",
    options: ["接続（せつぞく）(Penyambungan)", "配線（はいせん）(Pengkabelan)", "絶縁（ぜつえん）(Isolasi)"],
    answer: 3, hasPhoto: false,
    explanation: "絶縁 (ぜつえん) = isolasi listrik — mencegah arus mengalir ke tempat yang tidak diinginkan. Dilakukan dengan karet, plastik, atau bahan dielektrik lainnya.",
    related_card_id: 291
  },
  {
    id: "tt2_q34", set: "tt2", setLabel: "学科 Set 2",
    jp: "電気工事で、電気機器や回路と大地を電気的に接続することは、次のどれか。",
    hiragana: "でんきこうじ で、 でんききき や かいろ と だいち を でんきてき に せつぞく する こと は、 つぎのどれか。",
    id_text: "Dalam pekerjaan listrik, menghubungkan perangkat listrik atau rangkaian dengan tanah (bumi) secara elektrikal adalah?",
    options: ["接地（せっち）(Pentanahan/grounding)", "漏電（ろうでん）(Kebocoran arus)", "通線（つうせん）(Penarikan kabel)"],
    answer: 1, hasPhoto: false,
    explanation: "接地 (せっち) = grounding — menghubungkan ke tanah untuk keamanan (jika ada arus bocor, mengalir ke bumi bukan ke manusia). 漏電 = KEADAAN bocor, bukan tindakan.",
    related_card_id: 42
  },
  {
    id: "tt2_q35", set: "tt2", setLabel: "学科 Set 2",
    jp: "（　）とは、必要なものを決められた場所に置くことである。",
    hiragana: "（ ） とは、 ひつよう な もの を きめられた ばしょ に おく こと で ある。",
    id_text: "( ) adalah meletakkan barang yang diperlukan di tempat yang sudah ditentukan.",
    options: ["掃除（そうじ）(Membersihkan)", "整頓（せいとん）(Menata/merapikan — Seiton)", "清潔（せいけつ）(Bersih/higienis — Seiketsu)"],
    answer: 2, hasPhoto: false,
    explanation: "整頓 (せいとん) = Seiton = meletakkan barang di TEMPAT YANG DITENTUKAN agar mudah ditemukan. 清潔 = menjaga kebersihan. 掃除 = aktif membersihkan.",
    related_card_id: 338
  },
  {
    id: "tt2_q36", set: "tt2", setLabel: "学科 Set 2",
    jp: "服装に関する注意のうち、正しいものはどれか。",
    hiragana: "ふくそう に かんする ちゅうい の うち、 ただしい もの は どれか。",
    id_text: "Mana yang merupakan perhatian yang benar mengenai pakaian kerja?",
    options: ["上着のボタンは外したままにする（うわぎのボタンははずしたままにする）(Biarkan kancing jaket terbuka)", "暑い時は半袖を着用する（あついときははんそでをちゃくようする）(Saat panas, pakai baju lengan pendek)", "袖は手首までおろして着用する（そではてくびまでおろしてちゃくようする）(Turunkan lengan baju hingga pergelangan tangan)"],
    answer: 3, hasPhoto: false,
    explanation: "Di lokasi konstruksi: lengan HARUS diturunkan ke pergelangan tangan (melindungi dari luka/lecet). Kancing harus terkancing. Lengan pendek = DILARANG karena bahaya.",
    related_card_id: 327
  },
];
