// kenchiku-03.js — Quiz Set: kenchiku-03
export const SET_KENCHIKU_03 = {
    id: 'kenchiku-03',
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
  };
