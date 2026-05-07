// ─── confusion-pairs.js ───────────────────────────────────────────────────────
// VLT-style confusion pairs: words that look/sound alike or have overlapping
// meanings. Each entry: two JP terms, their correct meanings, and a shared
// category (音 = sound-alike, 字 = kanji-alike, 意 = meaning-overlap).
// ─────────────────────────────────────────────────────────────────────────────

export const CONFUSION_PAIRS = [
  // ── 音が似ている (Sound-alikes) ──────────────────────────────────────────
  {
    type: '音',
    label: '発音が似ている',
    termA: '着工', furiA: 'ちゃっこう', defA: 'Mulai konstruksi (proyek dimulai)',
    termB: '竣工', furiB: 'しゅんこう', defB: 'Selesai konstruksi (proyek selesai)',
    tip: '着 (memakai/tiba) = MULAI · 竣 (menyelesaikan) = SELESAI',
  },
  {
    type: '音',
    label: '発音が似ている',
    termA: '養生', furiA: 'ようじょう', defA: 'Perawatan/perlindungan bahan bangunan (beton dll)',
    termB: '用心', furiB: 'ようじん', defB: 'Berhati-hati / kewaspadaan',
    tip: '養生 = proses teknis (merawat beton); 用心 = perilaku (waspada bahaya)',
  },
  {
    type: '音',
    label: '発音が似ている',
    termA: '施工', furiA: 'せこう', defA: 'Pelaksanaan konstruksi (eksekusi di lapangan)',
    termB: '設計', furiB: 'せっけい', defB: 'Perancangan/desain (di atas kertas)',
    tip: '施工 = lapangan; 設計 = kantor/gambar. Urutan: 設計→施工',
  },
  {
    type: '音',
    label: '発音が似ている',
    termA: '解体', furiA: 'かいたい', defA: 'Pembongkaran bangunan',
    termB: '改築', furiB: 'かいちく', defB: 'Renovasi/pembangunan ulang',
    tip: '解体 = habis dibongkar; 改築 = dibongkar lalu DIBANGUN LAGI',
  },
  {
    type: '音',
    label: '発音が似ている',
    termA: '監督', furiA: 'かんとく', defA: 'Pengawas lapangan / site supervisor',
    termB: '管理', furiB: 'かんり', defB: 'Manajemen / administrasi',
    tip: '監督 = mengawasi orang & pekerjaan di lapangan; 管理 = mengelola sistem & proses',
  },
  {
    type: '音',
    label: '発音が似ている',
    termA: '転倒', furiA: 'てんとう', defA: 'Jatuh/terguling (kecelakaan badan)',
    termB: '転落', furiB: 'てんらく', defB: 'Jatuh dari ketinggian',
    tip: '転倒 = jatuh di tempat (tersandung, terpeleset); 転落 = jatuh KE BAWAH dari tempat tinggi',
  },
  {
    type: '音',
    label: '発音が似ている',
    termA: '墜落', furiA: 'ついらく', defA: 'Terjatuh dari ketinggian (kasus fatal)',
    termB: '転落', furiB: 'てんらく', defB: 'Jatuh dari ketinggian (lebih umum)',
    tip: '墜落 bersifat lebih berat/serius; hukum keselamatan (安衛法) sering pakai 墜落 untuk scaffolding/tangga',
  },
  {
    type: '音',
    label: '発音が似ている',
    termA: '親方', furiA: 'おやかた', defA: 'Kepala tukang / mandor berpengalaman',
    termB: '方向', furiB: 'ほうこう', defB: 'Arah / direction',
    tip: 'Hanya mirip ucapan jika tidak hati-hati; 親方 adalah gelar sosial penting di lapangan',
  },
  {
    type: '音',
    label: '発音が似ている',
    termA: '補修', furiA: 'ほしゅう', defA: 'Perbaikan / repair (setelah rusak)',
    termB: '保守', furiB: 'ほしゅ', defB: 'Pemeliharaan rutin / maintenance',
    tip: '補修 = sudah rusak lalu diperbaiki; 保守 = dijaga agar TIDAK rusak',
  },
  {
    type: '音',
    label: '発音が似ている',
    termA: '開口', furiA: 'かいこう', defA: 'Lubang/bukaan di lantai atau dinding (bahaya jatuh)',
    termB: '解雇', furiB: 'かいこ', defB: 'PHK / pemecatan',
    tip: '開口部 (かいこうぶ) = lubang berbahaya yang wajib dipasang penutup atau pagar',
  },

  // ── 字が似ている (Kanji look-alikes) ──────────────────────────────────────
  {
    type: '字',
    label: '漢字が似ている',
    termA: '掘削', furiA: 'くっさく', defA: 'Penggalian tanah (dengan alat berat)',
    termB: '削孔', furiB: 'さっこう', defB: 'Pengeboran lubang (bor ke dalam material)',
    tip: '掘削 = gali tanah (area luas); 削孔 = bor lubang (titik spesifik, spt untuk angkur/paku)',
  },
  {
    type: '字',
    label: '漢字が似ている',
    termA: '鉄筋', furiA: 'てっきん', defA: 'Tulangan baja (rebar) dalam beton',
    termB: '鉄骨', furiB: 'てっこつ', defB: 'Rangka baja struktural (steel frame)',
    tip: '筋 (urat/serat) = bar tipis dalam beton; 骨 (tulang) = rangka besar struktur bangunan',
  },
  {
    type: '字',
    label: '漢字が似ている',
    termA: '基礎', furiA: 'きそ', defA: 'Fondasi bangunan',
    termB: '基盤', furiB: 'きばん', defB: 'Fondasi/dasar sistem (lebih abstrak)',
    tip: '基礎工事 = pekerjaan fondasi fisik; 基盤 lebih sering dipakai secara konseptual',
  },
  {
    type: '字',
    label: '漢字が似ている',
    termA: '足場', furiA: 'あしば', defA: 'Scaffolding / perancah kerja',
    termB: '地盤', furiB: 'じばん', defB: 'Tanah / kondisi lapisan tanah',
    tip: '足 (kaki) = tempat berpijak di atas; 地 (tanah) = kondisi di bawah',
  },
  {
    type: '字',
    label: '漢字が似ている',
    termA: '着火', furiA: 'ちゃっか', defA: 'Terbakar / bahan mulai menyala',
    termB: '発火', furiB: 'はっか', defB: 'Terbakar sendiri / ignisi spontan',
    tip: '着火点 = titik nyala (perlu sumber api); 発火点 = titik bakar sendiri (lebih tinggi temperaturnya)',
  },
  {
    type: '字',
    label: '漢字が似ている',
    termA: '圧縮', furiA: 'あっしゅく', defA: 'Menekan/memampatkan (compression)',
    termB: '圧着', furiB: 'あっちゃく', defB: 'Menghubungkan dengan tekanan (crimping)',
    tip: '圧縮 = kekuatan fisika (beton kuat tekan); 圧着 = teknik menyambung kabel/pipa dengan alat penjepit',
  },
  {
    type: '字',
    label: '漢字が似ている',
    termA: '防水', furiA: 'ぼうすい', defA: 'Waterproofing / mencegah air masuk',
    termB: '排水', furiB: 'はいすい', defB: 'Drainase / mengalirkan air keluar',
    tip: '防 (mencegah) = menahan air; 排 (membuang) = mengalirkan air pergi',
  },
  {
    type: '字',
    label: '漢字が似ている',
    termA: '換気', furiA: 'かんき', defA: 'Ventilasi / pertukaran udara',
    termB: '排気', furiB: 'はいき', defB: 'Pembuangan udara kotor / gas buang',
    tip: '換気 = pertukaran udara dua arah (masuk+keluar); 排気 = buang gas satu arah (spt knalpot)',
  },
  {
    type: '字',
    label: '漢字が似ている',
    termA: '改修', furiA: 'かいしゅう', defA: 'Renovasi/perbaikan bangunan (repair + upgrade)',
    termB: '改築', furiB: 'かいちく', defB: 'Rekonstruksi (bongkar + bangun ulang)',
    tip: '改修 = memperbaiki yang ada; 改築 = bongkar semua, bangun dari awal',
  },
  {
    type: '字',
    label: '漢字が似ている',
    termA: '点検', furiA: 'てんけん', defA: 'Inspeksi / pengecekan berkala',
    termB: '検査', furiB: 'けんさ', defB: 'Pemeriksaan resmi / formal inspection',
    tip: '点検 = cek rutin oleh tim internal; 検査 = pemeriksaan formal sering oleh pihak ketiga atau otoritas',
  },

  // ── 意味が重なる (Meaning overlap) ────────────────────────────────────────
  {
    type: '意',
    label: '意味が似ている',
    termA: '仮設', furiA: 'かせつ', defA: 'Sementara / bersifat provisional (terpasang selama konstruksi)',
    termB: '本設', furiB: 'ほんせつ', defB: 'Permanen / bersifat final (terpasang di bangunan jadi)',
    tip: '仮設 = hanya selama proyek (mis. jalan sementara, toilet proyek); 本設 = ada di bangunan final',
  },
  {
    type: '意',
    label: '意味が似ている',
    termA: '作業主任者', furiA: 'さぎょうしゅにんしゃ', defA: 'Pengawas keselamatan kerja bersertifikat (wajib untuk pekerjaan berbahaya)',
    termB: '職長', furiB: 'しょくちょう', defB: 'Kepala tim / foreman (tidak harus bersertifikat khusus)',
    tip: '作業主任者 = jabatan LEGAL berdasarkan UU (安衛法) — wajib ada; 職長 = jabatan organisasi tim lapangan',
  },
  {
    type: '意',
    label: '意味が似ている',
    termA: '特定元方事業者', furiA: 'とくていもとかたじぎょうしゃ', defA: 'Kontraktor utama di proyek yang melibatkan banyak kontraktor (みなし元方)',
    termB: '元請け', furiB: 'もとうけ', defB: 'Kontraktor utama (umum, melawan 下請け)',
    tip: '特定元方 = istilah hukum spesifik ketika ada minimal 2 kontraktor berbeda; 元請け = istilah umum bisnis',
  },
  {
    type: '意',
    label: '意味が似ている',
    termA: '有機溶剤', furiA: 'ゆうきようざい', defA: 'Pelarut organik (thinner, bensin — uapnya beracun)',
    termB: '危険物', furiB: 'きけんぶつ', defB: 'Bahan berbahaya (mudah terbakar, lebih luas cakupannya)',
    tip: '有機溶剤 = khusus cairan pelarut organik; 危険物 = semua bahan berisiko (termasuk gas, bahan peledak)',
  },
  {
    type: '意',
    label: '意味が似ている',
    termA: '請負', furiA: 'うけおい', defA: 'Kontrak borongan (kontraktor bertanggung jawab hasil)',
    termB: '委託', furiB: 'いたく', defB: 'Kontrak jasa/mandat (pemberi kerja tetap kontrol)',
    tip: '請負 = kontraktor bebas menentukan cara → bertanggung jawab hasil; 委託 = mengikuti instruksi pemberi kerja',
  },
  {
    type: '意',
    label: '意味が似ている',
    termA: '熱中症', furiA: 'ねっちゅうしょう', defA: 'Heat stroke / penyakit karena panas berlebih',
    termB: '脱水症', furiB: 'だっすいしょう', defB: 'Dehidrasi',
    tip: '熱中症 bisa menyebabkan 脱水症; tapi 脱水症 bisa terjadi tanpa kepanasan. Pencegahan sama: minum air + istirahat',
  },
  {
    type: '意',
    label: '意味が似ている',
    termA: '不活性ガス', furiA: 'ふかっせいガス', defA: 'Gas inert/tidak reaktif (nitrogen, argon, dll) — bahaya kekurangan O₂',
    termB: '有毒ガス', furiB: 'ゆうどくガス', defB: 'Gas beracun (CO, H₂S, dll) — bahaya keracunan',
    tip: '不活性ガス = tidak beracun tapi menggusur O₂ → bahaya sesak napas; 有毒ガス = beracun langsung ke tubuh',
  },
  {
    type: '意',
    label: '意味が似ている',
    termA: '安全帯', furiA: 'あんぜんたい', defA: 'Harness / sabuk pengaman (untuk kerja di ketinggian) — istilah lama',
    termB: '墜落制止用器具', furiB: 'ついらくせいしようきぐ', defB: 'Alat pencegah jatuh (istilah resmi baru sejak 2019)',
    tip: '安全帯 = istilah lama yang umum dipakai; 墜落制止用器具 = istilah resmi hukum (安衛法改正 2019) — soal ujian bisa pakai keduanya',
  },
];
