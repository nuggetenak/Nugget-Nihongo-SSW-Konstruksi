// ─── docs/seeds/bangunan-sets-seed.js ─────────────────────────────────────────
// SEED DATA for Phase B — Copy to src/data/bangunan-sets.js
// 3 sets × 15 questions = 45 questions (minimum viable)
//
// Every question checked against LSP Content Authoring Standard.
// Content sources: JAC textbook Ch.6–8, JAC official 実技 questions
// ─────────────────────────────────────────────────────────────────────────────

export const BANGUNAN_SETS = [
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SET 1: 型枠・鉄筋・コンクリート — Bekisting, Tulangan & Beton
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'bangunan-01',
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
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SET 2: 仕上げ・内装・外壁 — Finishing, Interior & Eksterior
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'bangunan-02',
    title: '仕上げ・内装・外壁',
    subtitle: 'Finishing, Interior & Eksterior',
    emoji: '🎨',
    questions: [
      {
        q: '内装工事でクロス（壁紙）を貼る前に必要な下地処理は？',
        opts: ['パテ処理で平滑にする', '水を塗る', 'ペンキを塗る', '何もしなくてよい'],
        opts_id: ['Meratakan dengan dempul/putty', 'Menyiram air', 'Mengecat', 'Tidak perlu apa-apa'],
        ans: 0,
        exp: 'Sebelum pasang wallpaper (クロス), permukaan dinding harus diratakan dengan putty/dempul (パテ). Permukaan yang tidak rata = wallpaper gelembung atau tidak merekat.',
        cat: 'sekou',
        desc: 'Persiapan permukaan sebelum wallpaper. Sebagai pekerja SSW: kamu akan bantu dempul dinding — harus benar-benar rata. Mandor: パテをしっかりかけてから、クロスを貼ってください。'
      },
      {
        q: 'タイル工事で「目地（めじ）」の役割は？',
        opts: ['タイル間の隙間を埋めて防水する', '飾りのため', 'タイルを固定するため', '色をつけるため'],
        opts_id: ['Mengisi celah antar ubin & waterproofing', 'Untuk dekorasi', 'Untuk fiksasi ubin', 'Untuk memberi warna'],
        ans: 0,
        exp: '目地 (nat/grout) = material yang mengisi celah antar ubin. Fungsi utama: waterproofing + mencegah kotoran masuk. Fiksasi ubin = mortar perekat (bukan grout).',
        cat: 'sekou',
        desc: 'Fungsi nat/grout pada ubin. Sebagai pekerja SSW: setelah ubin dipasang, kamu akan bantu aplikasi grout — ratakan dengan rubber float dan bersihkan kelebihan segera. Mandor: 目地を丁寧に入れてください。'
      },
      {
        q: '外壁塗装の工程で正しい順序は？',
        opts: ['下塗り→中塗り→上塗り', '上塗り→中塗り→下塗り', '中塗り→下塗り→上塗り', '一度塗りのみ'],
        opts_id: ['Primer→Mid coat→Top coat', 'Top coat→Mid→Primer', 'Mid→Primer→Top', 'Satu lapis saja'],
        ans: 0,
        exp: 'Urutan pengecatan eksterior: 下塗り (primer) → 中塗り (mid coat) → 上塗り (top coat). Masing-masing harus kering sebelum lapisan berikut. Satu lapis saja = tidak tahan lama.',
        cat: 'sekou',
        desc: 'Urutan pengecatan 3 lapis. Sebagai pekerja SSW: setiap lapisan harus kering dulu (乾燥時間). Cat di atas lapisan basah = mengelupas. Mandor: 下塗りが乾いてから中塗りをしてください。'
      },
      {
        q: 'フローリング（床板）の施工で「伸縮目地」を設ける理由は？',
        opts: ['温度変化による膨張・収縮に対応するため', '掃除をしやすくするため', '見た目をよくするため', '音を大きくするため'],
        opts_id: ['Mengakomodasi pemuaian/penyusutan akibat suhu', 'Agar mudah dibersihkan', 'Agar terlihat bagus', 'Agar suaranya keras'],
        ans: 0,
        exp: 'Expansion joint (伸縮目地) di lantai kayu = celah yang disediakan untuk mengakomodasi pemuaian/penyusutan material akibat perubahan suhu dan kelembaban. Tanpa ini = lantai melenting.',
        cat: 'sekou',
        desc: 'Expansion joint pada lantai. Sebagai pekerja SSW: tinggalkan celah 5-10mm di tepi dinding saat pasang lantai kayu — ini bukan kesalahan, ini desain. Mandor: 壁際に隙間を取ってください。'
      },
      {
        q: '石膏ボード（せっこうボード）の施工で注意することは？',
        opts: ['ビスの間隔と深さを均一にする', '色を選ぶ', '温度を測る', '音を確認する'],
        opts_id: ['Jarak & kedalaman sekrup harus seragam', 'Memilih warna', 'Mengukur suhu', 'Memeriksa suara'],
        ans: 0,
        exp: 'Pemasangan gypsum board: jarak sekrup (ビス間隔) harus seragam (biasanya 150-200mm di tepi, 200-300mm di tengah) dan kedalaman pas — terlalu dalam = gypsum pecah, terlalu dangkal = tidak kencang.',
        cat: 'sekou',
        desc: 'Pemasangan gypsum board. Sebagai pekerja SSW: ini pekerjaan interior yang sering. Gunakan screw gun dengan stopper agar kedalaman konsisten. Mandor: ビスのピッチは200mmにしてください。'
      },
      {
        q: 'シーリング工事（コーキング）の目的は？',
        opts: ['隙間からの雨水の浸入を防ぐ', '壁を美しくする', '壁を厚くする', '壁の色を変える'],
        opts_id: ['Mencegah air hujan masuk lewat celah', 'Mempercantik dinding', 'Menambah tebal dinding', 'Mengubah warna dinding'],
        ans: 0,
        exp: 'Sealant/caulking (シーリング) = material elastis yang mengisi celah pada sambungan (目地) untuk mencegah infiltrasi air hujan. Bukan untuk estetika utama.',
        cat: 'sekou',
        desc: 'Pekerjaan sealant. Sebagai pekerja SSW: kamu akan sering aplikasi sealant di sambungan jendela, panel, dll. Masking tape harus rapi. Mandor: シーリングの目地をきれいに仕上げてください。'
      },
      {
        q: '吹付け塗装（ふきつけとそう）で養生する理由は？',
        opts: ['塗料の飛散を防ぐ', '天気を確認するため', '写真を撮るため', '休憩するため'],
        opts_id: ['Mencegah percikan cat', 'Untuk cek cuaca', 'Untuk foto', 'Untuk istirahat'],
        ans: 0,
        exp: '養生 dalam konteks spray painting = menutup/melindungi area yang tidak boleh kena cat menggunakan masking tape + plastik sheet. Cat spray menyebar luas — tanpa 養生, semuanya kena cat.',
        cat: 'sekou',
        desc: 'Masking sebelum spray painting. Sebagai pekerja SSW: kamu akan bantu pasang plastik sheet di jendela, lantai, dan area sekitar sebelum painting spray dimulai. Mandor: 養生をしっかりしてから吹付けてください。'
      },
      {
        q: '「建具（たてぐ）」とは何を指す？',
        opts: ['ドア・窓・障子など開閉する部材', '柱', '基礎', '屋根'],
        opts_id: ['Pintu, jendela, shoji dll (elemen buka-tutup)', 'Kolom', 'Fondasi', 'Atap'],
        ans: 0,
        exp: '建具 (たてぐ) = semua elemen yang bisa dibuka-tutup: pintu (ドア), jendela (窓), shoji (障子), fusuma. Bukan kolom (柱), fondasi (基礎), atau atap (屋根).',
        cat: 'sekou',
        desc: 'Elemen buka-tutup bangunan. Sebagai pekerja SSW: pekerjaan 建具 termasuk pasang kusen, engsel, handle, kunci. Mandor: 建具の取り付けを始めてください。'
      },
      {
        q: 'アルミサッシの取り付けで重要なことは？',
        opts: ['水平と垂直を正確に合わせる', '速く取り付ける', '安い材料を使う', '色を選ぶ'],
        opts_id: ['Menjaga level horizontal & vertikal yang akurat', 'Pasang secepat mungkin', 'Pakai material murah', 'Memilih warna'],
        ans: 0,
        exp: 'Kusen aluminium (アルミサッシ) harus dipasang level (水平) dan plumb (垂直) secara akurat. Miring sedikit saja = jendela tidak bisa dibuka/ditutup dengan baik.',
        cat: 'sekou',
        desc: 'Pemasangan kusen aluminium. Sebagai pekerja SSW: selalu gunakan waterpass saat pasang sash — koreksi dengan shim kalau perlu. Mandor: サッシの水平・垂直を確認してください。'
      },
      {
        q: '外壁の「通気工法」の目的は？',
        opts: ['壁内の湿気を外に逃がす', '壁を厚くする', '壁に色をつける', '壁に音を通す'],
        opts_id: ['Membuang kelembaban dari dalam dinding', 'Menambah tebal dinding', 'Memberi warna dinding', 'Meneruskan suara'],
        ans: 0,
        exp: '通気工法 (ventilated facade) = sistem konstruksi dinding eksterior yang menyediakan celah udara (通気層) untuk membuang kelembaban/uap air dari dalam dinding. Mencegah kayu/metal berkarat.',
        cat: 'sekou',
        desc: 'Sistem dinding berventilasi. Sebagai pekerja SSW: saat pasang siding (外装材), harus ada celah udara di belakangnya — JANGAN tutup rapat. Mandor: 通気層を塞がないように注意してください。'
      },
      {
        q: '天井の「野縁（のぶち）」の役割は？',
        opts: ['天井板を取り付ける下地材', '柱を支える材料', '床板を支える材料', '外壁を支える材料'],
        opts_id: ['Rangka penopang plafon', 'Material penopang kolom', 'Material penopang lantai', 'Material penopang dinding luar'],
        ans: 0,
        exp: '野縁 (のぶち) = ceiling furring strip — rangka horizontal tempat plafon dipasang. Mirip seperti rangka hollow di Indonesia.',
        cat: 'sekou',
        desc: 'Rangka plafon. Sebagai pekerja SSW: kamu akan pasang 野縁 di bawah langit-langit sebelum gypsum board dipasang. Jarak harus rata. Mandor: 野縁のピッチを確認してください。'
      },
      {
        q: '「ユニットバス」の施工で最も注意すべきことは？',
        opts: ['防水と排水の確実な施工', '色の選定', '窓の大きさ', '照明の明るさ'],
        opts_id: ['Waterproofing & drainase yang sempurna', 'Pemilihan warna', 'Ukuran jendela', 'Kecerahan lampu'],
        ans: 0,
        exp: 'Unit bath (bathroom prefab): prioritas utama = waterproofing dan drainase. Kebocoran air di kamar mandi = kerusakan struktur di bawahnya. Warna dan pencahayaan penting tapi bukan prioritas keselamatan.',
        cat: 'sekou',
        desc: 'Instalasi kamar mandi prefab. Sebagai pekerja SSW: tes kebocoran (漏水テスト) WAJIB setelah instalasi. Mandor: 防水の漏水テストをしてください。'
      },
      {
        q: '「墨出し」で使う「墨壺（すみつぼ）」の使い方は？',
        opts: ['糸を引っ張って直線を打つ', '穴を開ける', 'ネジを締める', '釘を打つ'],
        opts_id: ['Tarik benang & hentakkan untuk garis lurus', 'Membuat lubang', 'Mengencangkan sekrup', 'Memukul paku'],
        ans: 0,
        exp: '墨壺 (sumitsubo/chalk line) = alat tradisional Jepang untuk membuat garis lurus pada permukaan. Tarik benang yang sudah dilumuri tinta → hentakkan → muncul garis lurus.',
        cat: 'sekou',
        desc: 'Chalk line tradisional Jepang. Sebagai pekerja SSW: walaupun ada laser, 墨壺 masih sering dipakai. Cara pakai: tahan ujung, tarik benang, hentakkan. Mandor: 墨壺で墨を打ってくれ。'
      },
      {
        q: '「地震力」に対する建物の構造で重要なものは？',
        opts: ['耐震壁（たいしんへき）と筋交い（すじかい）', '窓ガラスの色', 'カーテンの種類', '照明の数'],
        opts_id: ['Dinding tahan gempa & bracing', 'Warna kaca jendela', 'Jenis tirai', 'Jumlah lampu'],
        ans: 0,
        exp: 'Ketahanan gempa (耐震) dicapai dengan dinding tahan gempa (耐震壁/shear wall) dan bracing diagonal (筋交い). Warna kaca atau tirai tidak relevan dengan kekuatan struktur.',
        cat: 'sekou',
        desc: 'Elemen tahan gempa bangunan. Sebagai pekerja SSW: Jepang rawan gempa — setiap bangunan harus punya elemen 耐震. Jangan pernah potong 筋交い tanpa izin. Mandor: 筋交いは絶対に切るな！'
      },
      {
        q: '「GL工法」でボードを壁に貼る接着剤は？',
        opts: ['GLボンド（石膏系接着剤）', '木工用ボンド', 'セメント', '水'],
        opts_id: ['GL Bond (adhesive berbasis gypsum)', 'Lem kayu', 'Semen', 'Air'],
        ans: 0,
        exp: 'GL工法 = metode pemasangan plasterboard langsung ke dinding beton menggunakan GLボンド (adhesive berbasis gypsum). Bukan lem kayu (terlalu lemah) atau semen (terlalu kaku).',
        cat: 'sekou',
        desc: 'Metode tempel plasterboard langsung. Sebagai pekerja SSW: oleskan GL Bond dalam gumpalan (だんご状) di belakang board, lalu tekan ke dinding beton. Mandor: GLボンドをだんご状に付けてください。'
      },
    ],
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // SET 3: 建築の安全管理 — Keselamatan Konstruksi Bangunan
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: 'bangunan-03',
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
  },
];
