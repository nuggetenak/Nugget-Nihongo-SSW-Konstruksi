// lifeline/jitsugi.js — lifeline JAC sample jitsugi exam cards
// (19 cards)
export const CARDS_LIFELINE_JITSUGI = [
{
  id: 36,
  category: "setsubi_kougu",
  source: "jac-jitsugi2",
  furi: "かしつき vs じょしつき",
  jp: "加湿器《かしつき》 vs 除湿器《じょしつき》",
  type: "konsep",
  id_text: "Pelembap vs pengering",
  desc: "加湿器《かしつき》=menambah kelembapan. 除湿器《じょしつき》=mengurangi kelembapan.\n冷却《れいきゃく》コイル=koil pendingin.",
  _origIndex: 36
  },
{
  id: 37,
  category: "setsubi_kougu",
  source: "jac-jitsugi2",
  furi: "ちくろこうじ",
  jp: "築炉工事《ちくろこうじ》（耐火物）",
  type: "konsep",
  id_text: "Lapisan tahan api tungku",
  desc: "Melapisi dalam tungku suhu tinggi dengan 耐火物《たいかぶつ》 (bahan tahan api).\nBukan 保温材《ほおんざい》/断熱材《だんねつざい》",
  _origIndex: 37
  },
{
  id: 38,
  category: "setsubi_kougu",
  source: "jac-jitsugi2",
  furi: "まるだくとさしこみつぎてこうほう",
  jp: "丸ダクト《まるだくとさしこみつぎてこうほう》",
  type: "konsep",
  id_text: "Saluran udara bulat",
  desc: "丸《まる》ダクト→差込《さしこみ》継手《つぎて》 (insert). 角《かく》ダクト→共板《きょうばん》フランジ工法《こうほう》 (flensa).",
  _origIndex: 38
  },
{
  id: 51,
  category: "denki",
  source: "jac-jitsugi1",
  furi: "ぶれえかあ",
  jp: "ブレーカー（NFB）",
  type: "konsep",
  id_text: "Pemutus arus",
  desc: "Otomatis memutus listrik saat arus berlebih mengalir di sirkuit. NFB = No-Fuse Breaker.",
  _origIndex: 59
  },
{
  id: 55,
  category: "denki",
  source: "jac-jitsugi1",
  furi: "たんらく",
  jp: "短絡《たんらく》",
  type: "konsep",
  id_text: "Hubungan arus pendek",
  desc: "2 kabel bersentuhan TANPA melalui beban. Berbeda dari 漏電《ろうでん》 (bocor) & 感電《かんでん》 (sengatan). Bisa",
  _origIndex: 63
  },
{
  id: 56,
  category: "denki",
  source: "jac-jitsugi1",
  furi: "でんこうないふ",
  jp: "電工ナイフ《でんこうないふ》",
  type: "konsep",
  id_text: "Pisau listrik",
  desc: "Pisau untuk mengupas isolasi kabel. Bilah melengkung, ujung tumpul (mencegah rusak konduktor).",
  _origIndex: 64
  },
{
  id: 57,
  category: "tsushin",
  source: "jac-jitsugi2",
  furi: "ひかりあいばあ",
  jp: "光ファイバー《ひかりあいばあ》",
  type: "konsep",
  id_text: "Serat optik",
  desc: "Serat tipis, kapasitas besar, rugi-rugi kecil, non-induktif. Kelemahan: rentan goresan & tekukan.",
  _origIndex: 65
  },
{
  id: 61,
  category: "tsushin",
  source: "jac-jitsugi2",
  furi: "ゆうちゃくせつぞくき",
  jp: "融着接続機《ゆうちゃくせつぞくき》",
  type: "konsep",
  id_text: "Fusion splicer optik",
  desc: "Mesin yang melelehkan dan menyambungkan ujung 2 kabel serat optik.",
  _origIndex: 69
  },
{
  id: 63,
  category: "tsushin",
  source: "jac-jitsugi2",
  furi: "おおちあちめどまいんれえとめて",
  jp: "OTDR",
  type: "konsep",
  id_text: "Alat uji pulsa optik",
  desc: "Mengukur panjang jalur serat optik dan mendeteksi titik abnormal (rugi sambungan, pantulan).",
  _origIndex: 71
  },
{
  id: 66,
  category: "tsushin",
  source: "jac-jitsugi2",
  furi: "ゆうちゃく vs こねくた vs めかにかるすぷらいす",
  jp: "融着 vs コネクタ vs メカニカル《ゆうちゃく vs こねくた vs めかにかるすぷらいす》",
  type: "konsep",
  id_text: "Tiga cara sambungan optik",
  desc: "①融着《ゆうちゃく》=permanen, rugi terkecil. ②コネクタ=bisa lepas-pasang. ③メカニカル=lebih cepat dari fusion.",
  _origIndex: 74
  },
{
  id: 67,
  category: "tsushin",
  source: "jac-jitsugi2",
  furi: "かんろ",
  jp: "管路《かんろ》",
  type: "konsep",
  id_text: "Jalur kabel bawah tanah",
  desc: "Menghubungkan manhole, handhole, 洞道《とうどう》, dan 引上柱《ひきあげちゅう》. Kedalaman di jalan raya >0.8m.",
  _origIndex: 75
  },
{
  id: 69,
  category: "tsushin",
  source: "jac-jitsugi2",
  furi: "てぼり・あなほりけんちゅうしゃ・たんしんぼう",
  jp: "手掘り《てぼり》・穴掘建柱車《あなほりけんちゅうしゃ》・探針棒《たんしんぼう》（埋設物確認）",
  type: "konsep",
  id_text: "Cek benda terpendam",
  desc: "Sebelum gali tiang: gunakan 手掘《てぼ》り & 探針棒《たんしんぼう》.\n穴掘建柱車《あなほりけんちゅうしゃ》=kendaraan gali & pendiri",
  _origIndex: 77
  },
{
  id: 78,
  category: "haikan",
  source: "jac-jitsugi1",
  furi: "ぱいぷかったあ",
  jp: "パイプカッター",
  type: "konsep",
  id_text: "Pemotong pipa",
  desc: "Alat potong pipa (baja, kuningan, tembaga) via roda menjepit melingkar. Sering diuji lewat FOTO.",
  _origIndex: 86
  },
{
  id: 84,
  category: "haikan",
  source: "jac-jitsugi2",
  furi: "ぽりえちれんかんえせつごう",
  jp: "ポリエチレン管《ぽりえちれんかんえせつごう》（EF接合）",
  type: "konsep",
  id_text: "Pipa polietilen (EF)",
  desc: "Pipa polietilen untuk air bersih & gas. Sambungan khas: EF接合《せつごう》 (Electro Fusion). SGP→ulir.",
  _origIndex: 92
  },
{
  id: 85,
  category: "haikan",
  source: "jac-jitsugi1",
  furi: "ねじせつごうあからあ",
  jp: "SGP ねじ接合《ねじせつごうあからあ》",
  type: "konsep",
  id_text: "Pipa SGP — sambungan ulir",
  desc: "SGP: ねじ接合《せつごう》 (sambungan ulir) untuk 15A～100A. Di atas 100A→flensa/las.",
  _origIndex: 93
  },
{
  id: 91,
  category: "hoon",
  source: "jac-jitsugi2",
  furi: "ぐらすうーる vs ろっくうーる",
  jp: "グラスウール vs ロックウール",
  type: "konsep",
  id_text: "Wol kaca vs wol batu",
  desc: "グラスウール: dari kaca dilebur. ロックウール: dari basalt, tahan api lebih baik.\nUjian: 'kaca→serat'=グラスウール.",
  _origIndex: 99
  },
{
  id: 92,
  category: "hoon",
  source: "jac-jitsugi2",
  furi: "らっきんぐかばあ",
  jp: "ラッキングカバー",
  type: "konsep",
  id_text: "Lagging cover pipa",
  desc: "Penutup finishing insulasi pipa di luar ruangan (屋外《おくがい》露出《ろしゅつ》). Dalam ruangan tidak wajib.",
  _origIndex: 100
  },
{
  id: 96,
  category: "shoubou",
  source: "jac-jitsugi1",
  furi: "おくがいしょうかいせんせつび",
  jp: "屋外消火栓設備《おくがいしょうかいせんせつび》",
  type: "konsep",
  id_text: "Hidran luar gedung",
  desc: "Dipasang di luar gedung untuk pemadaman awal & cegah api menyebar ke bangunan berdekatan (lantai",
  _origIndex: 104
  },
{
  id: 98,
  category: "shoubou",
  source: "jac-jitsugi1",
  furi: "おくがいしょうかいせん vs おくないしょうかいせん",
  jp: "屋外消火栓《おくがいしょうかいせん》 vs 屋内消火栓《おくないしょうかいせん》",
  type: "konsep",
  id_text: "Hidran luar vs dalam",
  desc: "屋外《おくがい》: luar gedung, cegah menyebar, lantai 1-2.\n屋内《おくない》: dalam gedung, untuk penghuni, tipe",
  _origIndex: 106
  }
];
