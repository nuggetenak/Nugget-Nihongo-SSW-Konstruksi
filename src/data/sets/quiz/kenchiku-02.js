// kenchiku-02.js — Quiz Set: kenchiku-02
export const SET_KENCHIKU_02 = {
    id: 'kenchiku-02',
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
  };
