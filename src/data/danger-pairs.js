// SSW Flashcards: Danger Pairs — Pasangan istilah mirip yang sering dijebak di ujian

export const DANGER_PAIRS = [
  {
    term: '短絡',
    furi: 'たんらく',
    correct: '2 kabel+ bersentuhan TANPA melalui beban → bisa kebakaran',
    traps: ['arus listrik bocor ke tanah (漏電)', 'listrik mengalir ke tubuh manusia (感電)'],
  },
  {
    term: '労災保険',
    furi: 'ろうさいほけん',
    correct: 'Premi SELURUHNYA ditanggung pengusaha (kecelakaan kerja)',
    traps: ['premi bersama pengusaha & pekerja', 'premi ditanggung pekerja'],
  },
  {
    term: '雇用保険',
    furi: 'こようほけん',
    correct: 'Premi BERSAMA pengusaha & pekerja — tunjangan pengangguran',
    traps: ['premi seluruhnya pengusaha', 'premi seluruhnya pekerja'],
  },
  {
    term: 'ご苦労様',
    furi: 'ごくろうさま',
    correct: 'HANYA boleh ke bawahan — JANGAN ke atasan',
    traps: ['bisa ke siapa saja seperti お疲れ様', 'diucapkan ke atasan sebagai rasa hormat'],
  },
  {
    term: 'グラスウール',
    furi: null,
    correct: 'Dari KACA (ガラス) yang dilelehkan menjadi serat',
    traps: ['dari batu basalt/andesit → itu ロックウール', 'dari busa polimer sintetis'],
  },
  {
    term: '新規入場者教育',
    furi: 'しんきにゅうじょうしゃきょういく',
    correct: 'Untuk PENDATANG BARU ke LOKASI KERJA (bukan rekrutan baru perusahaan)',
    traps: [
      'untuk pekerja baru rekrutan perusahaan (新入者安全衛生教育)',
      'untuk semua pekerja setiap bulan',
    ],
  },
  {
    term: 'OTDR',
    furi: null,
    correct: 'Mengukur PANJANG JALUR & titik abnormal serat optik',
    traps: [
      'hanya mengukur kekuatan sinyal → itu 光パワーメーター',
      'menyambungkan serat optik → itu 融着接続',
    ],
  },
  {
    term: 'ラッキングカバー',
    furi: null,
    correct: 'HANYA untuk pipa terekspos di LUAR RUANGAN (屋外露出)',
    traps: ['semua pipa termasuk dalam ruangan', 'pipa panas suhu tinggi saja'],
  },
  {
    term: '電気事業法',
    furi: 'でんきじぎょうほう',
    correct: 'UU mengatur PERUSAHAAN PENYEDIA LISTRIK (utility company)',
    traps: [
      'UU mengatur KONTRAKTOR listrik → itu 電気工事業法',
      'UU mengatur usaha telekomunikasi',
    ],
  },
  {
    term: '土留め ≥ 1.5m',
    furi: 'どどめ',
    correct: 'Wajib dipasang jika kedalaman galian ≥ 1.5m',
    traps: ['wajib jika ≥ 1.0m (terlalu rendah)', 'wajib jika ≥ 2.0m (terlalu tinggi)'],
  },
  {
    term: '既成杭工法',
    furi: 'きせいくいこうほう',
    correct: 'Tiang dibuat di PABRIK, kemudian dipancang ke lapangan',
    traps: [
      'tiang dibuat langsung di lapangan → itu 場所打ち杭',
      'tiang bekas yang digunakan ulang',
    ],
  },
  {
    term: 'さく井工事',
    furi: 'さくせいこうじ',
    correct: 'Pekerjaan PENGEBORAN SUMUR air — bukan galian biasa',
    traps: ['pekerjaan galian tanah umum (掘削工事)', 'pekerjaan pengeboran minyak/gas'],
  },
  {
    term: '押土',
    furi: 'おしど',
    correct: 'Mendorong tanah dengan BULLDOZER (ブルドーザ)',
    traps: ['memadatkan tanah dengan roller → itu 転圧', 'mengangkat tanah dengan excavator'],
  },
  {
    term: 'CD管 vs PF管',
    furi: 'CDかん vs PFかん',
    correct:
      'CD管 = khusus dalam BETON (oranye, fleksibel); PF管 = instalasi umum (tidak boleh dalam beton)',
    traps: [
      'CD管 boleh di mana saja termasuk luar beton',
      'keduanya sama saja & bisa dipakai bergantian',
    ],
  },
  {
    term: 'ライニング管の切断',
    furi: 'ライニングかんのせつだん',
    correct: 'Harus pakai バンドソー atau 金属ノコギリ — DILARANG ガス溶断',
    traps: ['boleh pakai ガス溶断 (acetylene torch)', 'boleh pakai グラインダー'],
  },
  {
    term: '銅管（冷媒管）の切断',
    furi: 'どうかん（れいばいかん）のせつだん',
    correct: 'Harus pakai パイプカッター saja — DILARANG 金ノコ/グラインダー',
    traps: ['boleh pakai 金ノコ (gergaji logam)', 'boleh pakai グラインダー'],
  },
  {
    term: '免振 vs 制振 vs 耐震',
    furi: 'めんしん vs せいしん vs たいしん',
    correct: '免振 = isolator di fondasi; 制振 = damper dalam bangunan; 耐震 = struktur diperkuat',
    traps: [
      '免振 = damper di dinding; 耐震 = isolator fondasi',
      'ketiganya sama, hanya istilah berbeda',
    ],
  },
  {
    term: '治水 vs 利水',
    furi: 'ちすい vs りすい',
    correct: '治水 = cegah/kendalikan banjir; 利水 = manfaatkan air (irigasi/PLTA)',
    traps: [
      '治水 = memanfaatkan air; 利水 = mencegah banjir (terbalik)',
      'keduanya sama-sama tujuan bendungan',
    ],
  },
  {
    term: '圧着ペンチ 赤 vs 黄',
    furi: 'あっちゃくペンチ あか vs き',
    correct: '赤 (merah) = untuk 圧着端子; 黄 (kuning) = untuk リングスリーブ',
    traps: [
      '赤 = untuk リングスリーブ; 黄 = untuk 圧着端子 (terbalik)',
      'warna tidak penting, bisa dipakai bergantian',
    ],
  },
  {
    term: '軍手 + ねじ切り機',
    furi: 'ぐんて + ねじきりき',
    correct: 'DILARANG KERAS memakai sarung tangan kain (軍手) saat pakai mesin ulir',
    traps: [
      'dianjurkan memakai 軍手 agar tidak terluka',
      'wajib memakai sarung tangan apapun saat mesin hidup',
    ],
  },
];
