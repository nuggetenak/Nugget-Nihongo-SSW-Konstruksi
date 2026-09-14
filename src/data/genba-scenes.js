// ─── data/genba-scenes.js — 現場の一日 ─────────────────────────────────────────
// UI_UX_PLAN item 105. The plan asked for "a 朝礼 that runs as a sequence: the
// foreman states today's work, asks for a material, then asks for a report — with
// a question after each", and then said why it could not be built yet:
//
//   "Blocked on 103, not on effort. A scenario is authored dialogue in the spoken
//    register, and the measurement above says the corpus has 3 sentences in that
//    register. Build 103's content first; this mode is a shell around it, and
//    building the shell first would only produce a convincing-looking mode with
//    nothing true to say."
//
// 103's corpus is in the tree, so this is no longer a shell around nothing.
//
// ── WHAT MAKES A SCENE DIFFERENT FROM SIX SEPARATE QUESTIONS ─────────────────
// Context carries. 「どっちですか」 is a sensible thing to say in scene 2 only
// because two beats earlier the foreman said 「青いやつ」 and there turned out to
// be two blue ones; 「4つ足りません」 is only correct because the beat before
// asked 「いくつ足りない？」. Drilled in isolation each of those is a phrase; in a
// thread they are a decision. That is the whole of item 105, and it is why the
// beats are ordered rather than shuffled — GenbaMode shuffles, this does not.
//
// ── THE TWO KINDS OF BEAT ────────────────────────────────────────────────────
// Same convention as genba-phrases.js, deliberately: `speaker` decides what kind
// of string the options hold.
//
//   speaker: 'shokucho'  — the line is said to you. `answer`/`traps` are
//                          Indonesian actions.
//   speaker: 'sagyouin'  — the line is yours to produce. The correct option is
//                          `jp`; `traps` are Japanese phrases. No `answer`.
//
// ── OVERLAP WITH genba-phrases.js IS THE POINT ───────────────────────────────
// Several beats are lines that file already drills (けがしました, 部品が足りません,
// ここまで終わりました). A learner should meet a phrase alone first and then find
// it inside a shift where something depends on it. genba-scenes.test.jsx asserts
// the overlap is real, so the two corpora cannot quietly drift into two unrelated
// files teaching two unrelated registers.
// ─────────────────────────────────────────────────────────────────────────────

export const GENBA_SCENES = [
  {
    id: 'chourei',
    emoji: '🌅',
    title: '朝礼《ちょうれい》',
    id_title: 'Apel pagi',
    setting: 'Jam 8 pagi, hari pertamamu di lokasi. Semua berkumpul di depan kantor lapangan.',
    beats: [
      {
        speaker: 'shokucho',
        jp: 'おはようございます。今日《きょう》は3階《がい》の配管《はいかん》をやります',
        id_text: 'Selamat pagi. Hari ini kita kerjakan pemipaan lantai 3.',
        ask: 'Pekerjaan hari ini apa?',
        answer: 'Pemipaan di lantai 3',
        traps: ['Pemipaan di lantai 1', 'Pengabelan di lantai 3', 'Pembongkaran di lantai 3'],
        note: '階《がい》 = lantai. 3階 dibaca さんがい — bukan さんかい, dan bukan さんかいめ.',
      },
      {
        speaker: 'shokucho',
        jp: '今日《きょう》のKY、危険《きけん》は高所《こうしょ》からの墜落《ついらく》です',
        id_text: 'KY hari ini: bahayanya pekerja jatuh dari ketinggian.',
        ask: 'Bahaya utama yang disebutkan hari ini?',
        answer: 'Pekerja jatuh dari ketinggian',
        traps: [
          'Material jatuh dari atas',
          'Tersengat listrik saat memasang pipa',
          'Kebakaran dari percikan las',
        ],
        note: '墜落《ついらく》 = ORANG yang jatuh. 落下《らっか》 = BENDA yang jatuh. Keduanya risiko 高所《こうしょ》 tapi tindakannya beda: harness untuk yang pertama, jaring dan pagar untuk yang kedua.',
      },
      {
        speaker: 'sagyouin',
        ask: 'Kamu belum tahu APD apa yang wajib hari ini. Apa yang kamu katakan?',
        jp: 'すみません、保護具《ほごぐ》は何《なに》が必要《ひつよう》ですか',
        id_text: 'Maaf, APD apa yang diperlukan?',
        traps: [
          'わかりました',
          '保護具《ほごぐ》を持《も》ってきました',
          '保護具《ほごぐ》は必要《ひつよう》ありません',
        ],
        note: 'Bertanya saat 朝礼《ちょうれい》 justru diharapkan. Setelah apel bubar semua sudah pergi ke posisinya masing-masing, dan pertanyaan yang sama jadi jauh lebih mahal.',
      },
      {
        speaker: 'shokucho',
        jp: 'フルハーネスとヘルメット、あと手袋《てぶくろ》です',
        id_text: 'Full harness dan helm, plus sarung tangan.',
        ask: 'Apa yang harus kamu siapkan?',
        answer: 'Full harness, helm, dan sarung tangan',
        traps: [
          'Full harness dan sepatu safety',
          'Helm dan masker anti-debu',
          'Cukup full harness saja',
        ],
        note: 'フルハーネス wajib di atas 2 m — 胴《どう》ベルト単体《たんたい》 sudah tidak memenuhi syarat.',
      },
      {
        speaker: 'sagyouin',
        ask: 'Apel selesai dan kamu sudah paham tugasmu. Apa yang kamu katakan sebelum bubar?',
        jp: 'はい、今日《きょう》もよろしくお願《ねが》いします',
        id_text: 'Baik, mohon kerjasamanya hari ini.',
        traps: ['お疲《つか》れさまでした', 'いただきます', '失礼《しつれい》します'],
        note: 'よろしくお願《ねが》いします membuka hari kerja. お疲《つか》れさまでした menutupnya — mengucapkannya di 朝礼《ちょうれい》 membalik urutan harinya.',
      },
    ],
  },
  {
    id: 'sagyouchuu',
    emoji: '🔧',
    title: '作業中《さぎょうちゅう》の指示《しじ》',
    id_title: 'Instruksi saat bekerja',
    setting: 'Kamu di lantai 3, memegang ujung pipa. Mandor bekerja di sebelahmu.',
    beats: [
      {
        speaker: 'shokucho',
        jp: 'そこ押《お》さえて。動《うご》かないように',
        id_text: 'Tahan bagian itu. Jangan sampai bergerak.',
        ask: 'Apa yang kamu lakukan?',
        answer: 'Tekan pipa itu dan tahan supaya tidak bergerak',
        traps: [
          'Tekan sekali lalu lepaskan',
          'Pindahkan pipa ke posisi lain',
          'Ikat pipa itu lalu tinggalkan',
        ],
        note: '押《お》さえる = menahan supaya tidak bergerak. 押《お》す = mendorong. Yang diminta yang pertama, dan 動《うご》かないように mengunci artinya.',
      },
      {
        speaker: 'shokucho',
        jp: 'それ持《も》ってきて。青《あお》いやつ',
        id_text: 'Bawa itu ke sini. Yang biru.',
        ask: 'Apa yang kamu lakukan?',
        answer: 'Ambil barang yang biru dan bawa ke tempat mandor',
        traps: [
          'Bawa barang yang biru ke gudang',
          'Tunjukkan barang yang biru dari tempatmu',
          'Tanyakan warna apa yang dimaksud',
        ],
        note: '持《も》ってくる = bawa KE SINI. やつ = "yang itu" — kasual, dan sangat normal di lokasi.',
      },
      {
        speaker: 'sagyouin',
        ask: 'Ternyata ada dua barang biru dan kamu tidak tahu yang mana. Apa yang kamu katakan?',
        jp: 'どっちですか',
        id_text: 'Yang mana?',
        traps: ['どっちでもいいです', 'これです', '青《あお》いのはありません'],
        note: 'Satu kata sudah cukup. Menebak salah satu memakan waktu lebih banyak daripada bertanya — dan di sini menebak berarti membawa pipa yang salah ke lantai 3.',
      },
      {
        speaker: 'shokucho',
        jp: '長《なが》いほう。一回《いっかい》手《て》を離《はな》していいよ',
        id_text: 'Yang panjang. Boleh lepas tanganmu dulu.',
        ask: 'Apa yang kamu lakukan?',
        answer: 'Lepaskan pipa yang sedang kamu tahan, lalu ambil yang panjang',
        traps: [
          'Tetap tahan pipanya sambil mengambil yang panjang',
          'Lepas tangan lalu tunggu instruksi berikutnya',
          'Ambil yang pendek karena lebih mudah dibawa',
        ],
        note: '〜ていいよ memberi izin, bukan perintah. Yang diizinkan melepas tangan — tanpa itu kamu masih terikat pada instruksi beat pertama.',
      },
      {
        speaker: 'sagyouin',
        ask: 'Kamu sudah meletakkan pipa yang panjang di sebelah mandor. Apa yang kamu katakan?',
        jp: '持《も》ってきました',
        id_text: 'Sudah saya bawa.',
        traps: ['持《も》ってきます', '持《も》っていきます', '持《も》ってください'],
        note: 'Bentuk 〜ました melaporkan yang sudah selesai; 〜ます masih rencana. 持《も》っていきます malah berarti kamu membawanya menjauh.',
      },
    ],
  },
  {
    id: 'hiyarihatto',
    emoji: '😰',
    title: 'ヒヤリハット',
    id_title: 'Near-miss',
    setting: 'Kamu lewat di jalur kerja dan menginjak papan pijakan yang bergerak.',
    beats: [
      {
        speaker: 'sagyouin',
        ask: 'Papannya longgar dan bisa membuat orang jatuh. Apa yang kamu katakan ke mandor?',
        jp: '危《あぶ》ない所《ところ》があります',
        id_text: 'Ada tempat yang berbahaya.',
        traps: ['気《き》をつけます', '大丈夫《だいじょうぶ》です', '直《なお》しました'],
        note: 'Temuan bahaya dilaporkan meski belum ada korban. 気《き》をつけます hanya menjaga dirimu; papannya tetap longgar untuk orang berikutnya.',
      },
      {
        speaker: 'shokucho',
        jp: 'どこ？案内《あんない》して',
        id_text: 'Di mana? Antar saya.',
        ask: 'Apa yang kamu lakukan?',
        answer: 'Antar mandor ke tempat papan yang longgar itu',
        traps: [
          'Jelaskan lokasinya dengan kata-kata',
          'Perbaiki papannya sendiri lebih dulu',
          'Tunjukkan lokasinya di gambar',
        ],
        note: '案内《あんない》する = mengantar ke tempatnya. Menjelaskan lewat kata saja bukan 案内《あんない》, dan di lokasi yang berlapis-lapis itu biasanya tidak cukup.',
      },
      {
        speaker: 'shokucho',
        jp: 'これはヒヤリハットだね。報告書《ほうこくしょ》書《か》いといて',
        id_text: 'Ini termasuk near-miss ya. Tolong tulis laporannya.',
        ask: 'Apa yang kamu lakukan?',
        answer: 'Tulis laporan near-miss itu hari ini juga',
        traps: [
          'Laporkan secara lisan saja',
          'Tulis laporannya kalau nanti ada korban',
          'Minta mandor yang menuliskannya',
        ],
        note: '〜といて = 〜ておいて: kerjakan sekarang supaya nanti sudah ada. ヒヤリハット yang tidak tercatat tidak masuk hitungan mana pun — dan hitungan itulah yang memindahkan anggaran keselamatan.',
      },
      {
        speaker: 'sagyouin',
        ask: 'Kamu belum pernah menulis laporan itu. Apa yang kamu katakan?',
        jp: '書《か》き方《かた》を教《おし》えてください',
        id_text: 'Tolong ajari cara menulisnya.',
        traps: ['書《か》きました', '書《か》けません', '書《か》かなくていいですか'],
        note: '書《か》けません menutup pintu; 教《おし》えてください membukanya. Di lokasi yang kedua hampir selalu lebih baik diterima.',
      },
    ],
  },
  {
    id: 'busoku',
    emoji: '📦',
    title: '材料《ざいりょう》不足《ぶそく》',
    id_title: 'Material kurang',
    setting: 'Kamu membuka ikatan fitting dan menghitungnya. Butuh 12, yang ada 8.',
    beats: [
      {
        speaker: 'sagyouin',
        ask: 'Jumlahnya kurang dan pekerjaan belum bisa selesai. Apa yang kamu katakan?',
        jp: '部品《ぶひん》が足《た》りません',
        id_text: 'Komponennya kurang.',
        traps: [
          '部品《ぶひん》があります',
          '部品《ぶひん》を借《か》ります',
          '部品《ぶひん》を買《か》います',
        ],
        note: '足《た》りない = kurang dari yang dibutuhkan. Melaporkan sekarang lebih murah daripada berhenti di tengah pemasangan.',
      },
      {
        speaker: 'shokucho',
        jp: 'いくつ足《た》りない？',
        id_text: 'Kurang berapa?',
        ask: 'Apa yang kamu lakukan?',
        answer: 'Sebutkan berapa jumlah yang kurang',
        traps: [
          'Sebutkan berapa jumlah yang ada',
          'Katakan saja kurangnya sedikit',
          'Bawa semua materialnya ke mandor',
        ],
        note: 'Pertanyaan pertama selalu jumlah, karena jumlah itulah yang menentukan apakah pekerjaan bisa lanjut hari ini atau tidak.',
      },
      {
        speaker: 'sagyouin',
        ask: 'Kurang 4 buah. Apa yang kamu katakan?',
        jp: '4つ足《た》りません',
        id_text: 'Kurang 4 buah.',
        traps: ['4つあります', '4つ使《つか》いました', '4つください'],
        note: '〜つ menghitung benda umum, dan 4つ dibaca よっつ. 4つください meminta tambahan — itu permintaan, bukan laporan jumlah.',
      },
      {
        speaker: 'shokucho',
        jp: '倉庫《そうこ》にあるから取《と》ってきて。鍵《かぎ》はこれ',
        id_text: 'Ada di gudang, ambil ya. Ini kuncinya.',
        ask: 'Apa yang kamu lakukan?',
        answer: 'Terima kuncinya, ambil 4 buah dari gudang, dan bawa kembali',
        traps: [
          'Minta mandor yang mengambilnya',
          'Ambil semua yang ada di gudang',
          'Tunggu material dikirim ke lokasi',
        ],
        note: '取《と》ってくる = ambil DAN bawa kembali ke sini. 取《と》る sendiri hanya "mengambil", dan berhenti di gudang bukan menyelesaikan instruksinya.',
      },
      {
        speaker: 'sagyouin',
        ask: 'Kamu kembali dengan 4 fitting, dan kuncinya masih di tanganmu. Apa yang kamu katakan?',
        jp: '取《と》ってきました。鍵《かぎ》もお返《かえ》しします',
        id_text: 'Sudah saya ambil. Kuncinya saya kembalikan juga.',
        traps: [
          '取《と》ってきます',
          '鍵《かぎ》をください',
          '倉庫《そうこ》は開《あ》いていました',
        ],
        note: 'Mengembalikan kunci tanpa diminta adalah bagian dari laporannya. Kunci gudang yang ikut pulang menghentikan regu lain besok pagi.',
      },
    ],
  },
  {
    id: 'kega',
    emoji: '🩹',
    title: 'けが',
    id_title: 'Cedera',
    setting: 'Tanganmu tergores cutter saat membuka ikatan material. Berdarah sedikit.',
    beats: [
      {
        speaker: 'sagyouin',
        ask: 'Lukanya kecil tapi berdarah. Apa yang kamu katakan?',
        jp: 'けがしました',
        id_text: 'Saya terluka.',
        traps: ['大丈夫《だいじょうぶ》です', '疲《つか》れました', '休《やす》みます'],
        note: 'Sekecil apa pun tetap dilaporkan. 大丈夫《だいじょうぶ》です menutup laporan yang wajib — dan tanpa catatan itu tidak ada jejak untuk 労災《ろうさい》.',
      },
      {
        speaker: 'shokucho',
        jp: 'すぐ来《き》て、見《み》せて',
        id_text: 'Sini cepat, perlihatkan.',
        ask: 'Apa yang kamu lakukan?',
        answer: 'Datang ke mandor dan perlihatkan lukanya',
        traps: [
          'Cuci lukanya dulu di keran',
          'Tutup lukanya dengan plester lalu lanjut kerja',
          'Jelaskan lukanya dari tempatmu berdiri',
        ],
        note: '見《み》せて = perlihatkan. Dia harus melihatnya sendiri untuk memutuskan, jadi menjelaskan dari jauh tidak menyelesaikan apa pun.',
      },
      {
        speaker: 'shokucho',
        jp: '深《ふか》いな。病院《びょういん》行《い》こう',
        id_text: 'Dalam ya. Ayo ke rumah sakit.',
        ask: 'Apa yang kamu lakukan?',
        answer: 'Ikut ke rumah sakit bersama mandor',
        traps: [
          'Menolak karena lukanya terasa kecil',
          'Pergi sendiri setelah jam kerja selesai',
          'Lanjutkan kerja dan pergi besok pagi',
        ],
        note: '行《い》こう adalah bentuk ajakan: dia ikut. Untuk cedera kerja, pergi bersama atasan yang menyalakan prosedur 労災《ろうさい》 — pergi sendiri nanti biasanya tercatat sebagai urusan pribadi.',
      },
      {
        speaker: 'sagyouin',
        ask: 'Kamu masih perlu izin resmi untuk meninggalkan lokasi. Apa yang kamu katakan?',
        jp: '病院《びょういん》に行《い》ってもいいですか',
        id_text: 'Boleh saya ke rumah sakit?',
        traps: [
          '病院《びょういん》に行《い》きました',
          '病院《びょういん》はどこですか',
          '病院《びょういん》に行《い》きません',
        ],
        note: 'Izinnya yang membuat kunjungan itu tercatat sebagai 労災《ろうさい》. Urutannya: lapor, perlihatkan, minta izin — dan tiga-tiganya sudah lewat di scene ini.',
      },
    ],
  },
  {
    id: 'hikitsugi',
    emoji: '🔁',
    title: '引《ひ》き継《つ》ぎ',
    id_title: 'Serah terima',
    setting:
      'Jam kerjamu habis. Dari 12 sambungan, kamu selesai sampai yang ke-8. Shift berikutnya sudah datang.',
    beats: [
      {
        speaker: 'sagyouin',
        ask: 'Pekerjaan belum tuntas dan shiftmu berakhir. Apa yang kamu katakan?',
        jp: 'ここまで終《お》わりました',
        id_text: 'Sudah selesai sampai sini.',
        traps: [
          '全部《ぜんぶ》終《お》わりました',
          'まだ始《はじ》めていません',
          '終《お》わりにします',
        ],
        note: 'Menyebut sampai mana adalah inti serah terima. 全部《ぜんぶ》終《お》わりました akan membuat orang berikutnya melewati 4 sambungan yang belum ada.',
      },
      {
        speaker: 'shokucho',
        jp: '残《のこ》りは？',
        id_text: 'Sisanya?',
        ask: 'Apa yang kamu lakukan?',
        answer: 'Sebutkan berapa sambungan yang belum dikerjakan',
        traps: [
          'Sebutkan berapa sambungan yang sudah selesai',
          'Katakan sisanya tinggal sedikit',
          'Tunjukkan gambar seluruh jalur pipa',
        ],
        note: '残《のこ》り = yang tersisa. Dia menanyakan pekerjaan yang belum ada, bukan yang sudah — dan angka itu yang dipakai menyusun shift berikutnya.',
      },
      {
        speaker: 'sagyouin',
        ask: 'Sisa 4 sambungan. Apa yang kamu katakan?',
        jp: '4か所《しょ》残《のこ》っています',
        id_text: 'Tinggal 4 titik.',
        traps: [
          '4か所《しょ》終《お》わりました',
          '4か所《しょ》やりました',
          '全部《ぜんぶ》残《のこ》っています',
        ],
        note: '残《のこ》っている menyatakan keadaan sekarang. 〜か所《しょ》 menghitung titik atau lokasi — bukan 〜つ, yang menghitung benda.',
      },
      {
        speaker: 'shokucho',
        jp: '次《つぎ》の人《ひと》に言《い》っといて。道具《どうぐ》はそのままで',
        id_text: 'Sampaikan ke orang berikutnya. Alatnya biarkan saja.',
        ask: 'Apa yang kamu lakukan?',
        answer: 'Sampaikan sendiri ke shift berikutnya, dan tinggalkan alatnya di tempat',
        traps: [
          'Tulis di papan pengumuman lalu pulang',
          'Bawa alatnya ke gudang lalu sampaikan',
          'Simpan alatnya lalu sampaikan besok pagi',
        ],
        note: '言《い》っといて menaruh tanggung jawab penyampaian padamu, bukan pada papannya. そのままで = jangan dipindahkan; regu berikutnya perlu alat itu persis di titik itu.',
      },
      {
        speaker: 'sagyouin',
        ask: 'Semua sudah disampaikan dan kamu akan pulang. Apa yang kamu katakan?',
        jp: 'お先《さき》に失礼《しつれい》します',
        id_text: 'Saya pulang lebih dulu.',
        traps: ['おはようございます', 'いただきます', 'よろしくお願《ねが》いします'],
        note: 'お先《さき》に失礼《しつれい》します adalah bentuk baku untuk pulang lebih dulu. 先《さき》に帰《かえ》ります lebih kasual dan dipakai antar rekan sederajat.',
      },
    ],
  },
];
