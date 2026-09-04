// SSW Flashcards: Danger Pairs — Pasangan istilah mirip yang sering dijebak di ujian
// confusionType: 'makna' (semantic), 'angka' (numeric), 'kata' (word/term), 'prosedur' (procedure/rule)
// explanation: penjelasan linguistik "kenapa keduanya sering tertukar"

export const DANGER_PAIRS = [
  {
    term: '短絡《たんらく》',
    track: 'common',
    furi: 'たんらく',
    confusionType: 'makna',
    correct: '2 kabel+ bersentuhan TANPA melalui beban → bisa kebakaran',
    traps: [
      'arus listrik bocor ke tanah (漏電《ろうでん》)',
      'listrik mengalir ke tubuh manusia (感電《かんでん》)',
    ],
    explanation:
      '短絡《たんらく》 (hubung singkat), 漏電《ろうでん》 (bocor ke tanah), 感電《かんでん》 (kesetrum) — ketiganya melibatkan "arus tidak normal" tapi jalurnya berbeda: short circuit antar kabel, bocor ke bumi, atau masuk ke tubuh manusia.',
  },
  {
    term: '労災保険《ろうさいほけん》',
    track: 'common',
    furi: 'ろうさいほけん',
    confusionType: 'makna',
    correct: 'Premi SELURUHNYA ditanggung pengusaha (kecelakaan kerja)',
    traps: ['premi bersama pengusaha & pekerja', 'premi ditanggung pekerja'],
    explanation:
      '労災《ろうさい》 vs 雇用保険《こようほけん》 — keduanya "asuransi kerja" tapi siapa yang bayar beda total. 労災《ろうさい》 = 100% pengusaha (risiko kerja = tanggung jawab pengusaha). 雇用《こよう》 = bersama (pengangguran = risiko kedua pihak).',
  },
  {
    term: '雇用保険《こようほけん》',
    track: 'common',
    furi: 'こようほけん',
    confusionType: 'makna',
    correct: 'Premi BERSAMA pengusaha & pekerja — tunjangan pengangguran',
    traps: ['premi seluruhnya pengusaha', 'premi seluruhnya pekerja'],
    explanation:
      '雇用 (koyou = pekerjaan) — asuransi saat kehilangan pekerjaan. Risiko PHK melibatkan kedua pihak, maka preminyapun bersama. Beda dengan 労災《ろうさい》 yang murni tanggung jawab pengusaha.',
  },
  {
    term: 'ご苦労様《ごくろうさま》',
    track: 'common',
    furi: 'ごくろうさま',
    confusionType: 'kata',
    correct: 'HANYA boleh ke bawahan — JANGAN ke atasan',
    traps: [
      'bisa ke siapa saja seperti お疲れ様《おつかれさま》',
      'diucapkan ke atasan sebagai rasa hormat',
    ],
    explanation:
      'ご苦労様《ごくろうさま》 secara historis diucapkan oleh orang yang "menerima kerja" ke yang "melakukan kerja" — bersifat top-down. Ke atasan terasa merendahkan. お疲れ様《おつかれさま》 lebih netral dan aman ke siapa saja.',
  },
  {
    term: 'グラスウール',
    track: 'lifeline',
    furi: null,
    confusionType: 'kata',
    correct: 'Dari KACA (ガラス) yang dilelehkan menjadi serat',
    traps: ['dari batu basalt/andesit → itu ロックウール', 'dari busa polimer sintetis'],
    explanation:
      'グラス = ガラス (kaca), ロック = 岩《いわ》 (batu). Keduanya berupa serat isolasi berbentuk kapas — penampilan fisik sangat mirip. Kunci: ingat bahan baku dari namanya. Kaca vs batu.',
  },
  {
    term: '新規入場者教育《しんきにゅうじょうしゃきょういく》',
    track: 'common',
    furi: 'しんきにゅうじょうしゃきょういく',
    confusionType: 'kata',
    correct: 'Untuk PENDATANG BARU ke LOKASI KERJA (bukan rekrutan baru perusahaan)',
    traps: [
      'untuk pekerja baru rekrutan perusahaan (新入者安全衛生教育《しんにゅうしゃあんぜんえいせいきょういく》)',
      'untuk semua pekerja setiap bulan',
    ],
    explanation:
      'Kunci: 入場《にゅうじょう》 (masuk LOKASI) bukan 入社《にゅうしゃ》 (masuk PERUSAHAAN). Kontraktor lama yang pindah ke proyek baru tetap wajib ikut 新規入場者教育《しんきにゅうじょうしゃきょういく》 karena mereka "baru masuk" lokasi tersebut.',
  },
  {
    term: 'OTDR',
    track: 'lifeline',
    furi: null,
    confusionType: 'makna',
    correct: 'Mengukur PANJANG JALUR & titik abnormal serat optik',
    traps: [
      'hanya mengukur kekuatan sinyal → itu 光《ひかり》パワーメーター',
      'menyambungkan serat optik → itu 融着接続《ゆうちゃくせつぞく》',
    ],
    explanation:
      'OTDR seperti sonar untuk kabel optik — mengirim pulsa cahaya dan mengukur waktu pantulan untuk menemukan posisi kerusakan. 光《ひかり》パワーメーター hanya ukur kuat lemah cahaya di ujung, tidak bisa deteksi posisi kerusakan.',
  },
  {
    term: 'ラッキングカバー',
    track: 'lifeline',
    furi: null,
    confusionType: 'prosedur',
    correct: 'HANYA untuk pipa terekspos di LUAR RUANGAN (屋外露出)',
    traps: ['semua pipa termasuk dalam ruangan', 'pipa panas suhu tinggi saja'],
    explanation:
      'ラッキング = lagging (isolasi) + カバー = pelindung logam luar. Pelindung aluminium hanya dibutuhkan saat terekspos cuaca/UV/hujan. Di dalam ruangan cukup lapisan isolasi saja tanpa cover logam.',
  },
  {
    term: '電気事業法《でんきじぎょうほう》',
    track: 'common',
    furi: 'でんきじぎょうほう',
    confusionType: 'kata',
    correct: 'UU mengatur PERUSAHAAN PENYEDIA LISTRIK (utility company)',
    traps: [
      'UU mengatur KONTRAKTOR listrik → itu 電気工事業法《でんきこうじぎょうほう》',
      'UU mengatur usaha telekomunikasi',
    ],
    explanation:
      '電気事業法《でんきじぎょうほう》 vs 電気工事業法《でんきこうじぎょうほう》 — satu kata 工事《こうじ》 (konstruksi) membuat perbedaan total. 事業法《じぎょうほう》 = regulasi PLN-nya Jepang. 工事業法《こうじぎょうほう》 = regulasi kontraktor listrik. Hati-hati: hampir identik secara bunyi.',
  },
  {
    term: '土留め《どどめ》 ≥ 1.5m',
    track: 'common',
    furi: 'どどめ',
    confusionType: 'angka',
    correct: 'Wajib dipasang jika kedalaman galian ≥ 1.5m',
    traps: ['wajib jika ≥ 1.0m (terlalu rendah)', 'wajib jika ≥ 2.0m (terlalu tinggi)'],
    explanation:
      'Sering dikacaukan dengan angka galian lain: 1.0m = wajib pakai helm di zona, 2.0m = wajib scaffolding dll. Khusus 土留め《どどめ》 (penahan tanah): 1.5m karena tanah mulai tidak stabil dan bahaya longsor ke pekerja di bawah.',
  },
  {
    term: '既成杭工法《きせいくいこうほう》',
    track: 'common',
    furi: 'きせいくいこうほう',
    confusionType: 'makna',
    correct: 'Tiang dibuat di PABRIK, kemudian dipancang ke lapangan',
    traps: [
      'tiang dibuat langsung di lapangan → itu 場所打ち杭《ばしょうちくい》',
      'tiang bekas yang digunakan ulang',
    ],
    explanation:
      '既成 (kisei) = "sudah jadi sebelumnya". 場所打ち (basho-uchi) = "cetak di tempat". Logiknya berlawanan: pabrik dulu → kirim → pancang VS gali lubang → cetak beton langsung di situ.',
  },
  {
    term: 'さく井工事《さくせいこうじ》',
    track: 'common',
    furi: 'さくせいこうじ',
    confusionType: 'makna',
    correct: 'Pekerjaan PENGEBORAN SUMUR air — bukan galian biasa',
    traps: [
      'pekerjaan galian tanah umum (掘削工事《くっさくこうじ》)',
      'pekerjaan pengeboran minyak/gas',
    ],
    explanation:
      'さく井《さくせい》 = 鑿井《さくせい》 — kanji 鑿 (nomi) artinya pahat/bor. Spesifik untuk sumur air tanah dengan teknik pengeboran. Berbeda dari 掘削《くっさく》 (penggalian tanah terbuka). Lingkup terbatas: sumur air, bukan minyak/gas.',
  },
  {
    term: '押土《おしど》',
    track: 'common',
    furi: 'おしど',
    confusionType: 'kata',
    correct: 'Mendorong tanah dengan BULLDOZER (ブルドーザ)',
    traps: [
      'memadatkan tanah dengan roller → itu 転圧《てんあつ》',
      'mengangkat tanah dengan excavator',
    ],
    explanation:
      '押土《おしど》 = mendorong (horizontal, blade). 転圧《てんあつ》 = memadatkan dengan tekanan putar (roller). 掘削《くっさく》 = menggali (vertical, bucket). Tiga alat, tiga arah gerak: horizontal / vertikal berputar / vertikal ke bawah.',
  },
  {
    term: 'CD管《シーディーかん》 vs PF管《ピーエフかん》',
    track: 'lifeline',
    furi: 'シーディーかん・ピーエフかん',
    confusionType: 'prosedur',
    correct:
      'CD管 = khusus dalam BETON (oranye, fleksibel); PF管 = instalasi umum (tidak boleh dalam beton)',
    traps: [
      'CD管《CDかん》 boleh di mana saja termasuk luar beton',
      'keduanya sama saja & bisa dipakai bergantian',
    ],
    explanation:
      'CD管《CDかん》 (oranye) tahan tekanan beton basah, tidak perlu self-extinguishing karena terlindung beton. PF管《PFかん》 (abu-abu) harus self-extinguishing untuk area terbuka. Warna oranye = alarm "hanya untuk dalam beton".',
  },
  {
    term: 'ライニング管の切断《ライニングかんのせつだん》',
    track: 'lifeline',
    furi: 'ライニングかんのせつだん',
    confusionType: 'prosedur',
    correct: 'Harus pakai バンドソー atau 金属ノコギリ — DILARANG ガス溶断',
    traps: ['boleh pakai ガス溶断《ガスようだん》 (acetylene torch)', 'boleh pakai グラインダー'],
    explanation:
      'ライニング管《ライニングかん》 = pipa baja berlapis polimer di dalamnya. Panas tinggi dari ガス溶断《ガスようだん》/grinder membakar lapisan polimer dan menghasilkan gas beracun. バンドソー/gergaji tidak menghasilkan panas tinggi sehingga lapisan aman.',
  },
  {
    term: '銅管（冷媒管）の切断《どうかん（れいばいかん）のせつだん》',
    track: 'lifeline',
    furi: 'どうかん（れいばいかん）のせつだん',
    confusionType: 'prosedur',
    correct: 'Harus pakai パイプカッター saja — DILARANG 金ノコ/グラインダー',
    traps: ['boleh pakai 金ノコ《きんのこ》 (gergaji logam)', 'boleh pakai グラインダー'],
    explanation:
      'Tembaga (銅《どう》) lunak — 金ノコ《きんのこ》/grinder membuat serpihan dan ujung tidak rata sehingga sambungan bocor. パイプカッター berputar mengikuti lingkaran pipa sehingga potongan sempurna tegak lurus dan rapat.',
  },
  {
    term: '免振《めんしん》 vs 制振《せいしん》 vs 耐震《たいしん》',
    track: 'common',
    furi: 'めんしん・せいしん・たいしん',
    confusionType: 'kata',
    correct: '免振 = isolator di fondasi; 制振 = damper dalam bangunan; 耐震 = struktur diperkuat',
    traps: [
      '免振《めんしん》 = damper di dinding; 耐震《たいしん》 = isolator fondasi',
      'ketiganya sama, hanya istilah berbeda',
    ],
    explanation:
      '免振 (mensin) = hindari — isolator karet memutus getaran sebelum masuk bangunan. 制振 (seishin) = kendalikan — damper menyerap energi di dalam. 耐震 (taishin) = tahan — struktur sendiri diperkuat. Tiga strategi berbeda: hindari → serap → tahan.',
  },
  {
    term: '治水《ちすい》 vs 利水《りすい》',
    track: 'common',
    furi: 'ちすい・りすい',
    confusionType: 'kata',
    correct: '治水 = cegah/kendalikan banjir; 利水 = manfaatkan air (irigasi/PLTA)',
    traps: [
      '治水《ちすい》 = memanfaatkan air; 利水《りすい》 = mencegah banjir (terbalik)',
      'keduanya sama-sama tujuan bendungan',
    ],
    explanation:
      '治 (osaeru = menekan/mengendalikan) vs 利 (ri = keuntungan/manfaat). 治水《ちすい》 = kendalikan air dari bencana. 利水《りすい》 = ambil manfaat dari air. Bendungan bisa punya kedua fungsi tapi tujuan rancangnya beda.',
  },
  {
    term: '圧着《あっちゃく》ペンチ 赤《あか》 vs 黄《き》',
    track: 'lifeline',
    furi: 'あっちゃくペンチ あか・き',
    confusionType: 'angka',
    correct: '赤 (merah) = untuk 圧着端子; 黄 (kuning) = untuk リングスリーブ',
    traps: [
      '赤《あか》 = untuk リングスリーブ; 黄《き》 = untuk 圧着端子《あっちゃくたんし》 (terbalik)',
      'warna tidak penting, bisa dipakai bergantian',
    ],
    explanation:
      'Warna berbeda = standar JIS berbeda = ukuran dies berbeda. Merah (赤《あか》) untuk terminal kabel berinsulasi (圧着端子《あっちゃくたんし》). Kuning (黄《き》) untuk ring sleeve sambungan kabel (リングスリーブ). Pakai yang salah = sambungan tidak kuat = bahaya kebakaran.',
  },
  {
    term: '軍手《ぐんて》 + ねじ切り機《ねじきりき》',
    track: 'lifeline',
    furi: 'ぐんて・ねじきりき',
    confusionType: 'prosedur',
    correct: 'DILARANG KERAS memakai sarung tangan kain (軍手) saat pakai mesin ulir',
    traps: [
      'dianjurkan memakai 軍手《ぐんて》 agar tidak terluka',
      'wajib memakai sarung tangan apapun saat mesin hidup',
    ],
    explanation:
      '軍手《ぐんて》 (kain rajut longgar) mudah tersangkut di bagian berputar dan menarik tangan masuk mesin. Prinsip umum: semua mesin berputar (旋盤《せんばん》, ドリル, ねじ切り機《ねじきりき》) = DILARANG sarung tangan kain. Sarung tangan kulit/karet yang pas boleh.',
  },
];
