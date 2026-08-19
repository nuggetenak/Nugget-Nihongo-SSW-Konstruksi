// SSW Flashcards: Angka Kunci — ~45 angka penting wajib hafal untuk ujian
// mnemonic: memory hook to remember the number
// soal: contoh kalimat soal ujian untuk konteks angka ini

export const ANGKA_KUNCI = [
  {
    angka: '8 jam/hari, 40 jam/minggu',
    konteks: 'Batas jam kerja legal (労基法)',
    track: 'common',
    kartu: 5,
    mnemonic:
      '8 jam = 1 hari kerja; 5 hari × 8 = 40. Ingat: "delapan per hari, empat-puluh per minggu"',
    soal: '労働基準法《ろうどうきじゅんほう》において、1日の所定労働時間《しょていろうどうじかん》は最大何時間か？ → 8時間（1週40時間）',
  },
  {
    angka: '45 jam/bln, 360 jam/thn',
    konteks: 'Batas lembur maks (April 2024)',
    track: 'common',
    kartu: 134,
    mnemonic: '45 ≈ 1.5 jam/hari. 360 = 45 × 8 bulan. Atau: "setahun penuh tapi 4 bulan bebas"',
    soal: '時間外労働《じかんがいろうどう》の上限《じょうげん》（月・年）は？ → 月45時間・年360時間（原則）',
  },
  {
    angka: '+25% / +35% / +25%',
    konteks: 'Tarif lembur biasa / hari libur / malam',
    track: 'common',
    kartu: 134,
    mnemonic:
      'Hari libur paling mahal (+35%). Biasa & malam sama-sama +25%. Ingat: "libur = extra 10%"',
    soal: '休日労働《きゅうじつろうどう》の割増賃金率《わりましちんぎんりつ》は？ → 35%以上（通常残業《つうじょうざんぎょう》25%・深夜《しんや》25%より高い）',
  },
  {
    angka: '30 hari',
    konteks: 'Advance notice sebelum PHK (解雇予告)',
    track: 'common',
    kartu: 144,
    mnemonic: '1 bulan penuh = 30 hari. "Satu bulan sebelum kamu dipecat"',
    soal: '労働者《ろうどうしゃ》を解雇《かいこ》する場合、何日前に予告《よこく》しなければならないか？ → 30日前',
  },
  {
    angka: '>6jam → 45 mnt, >8jam → 1 jam',
    konteks: 'Istirahat wajib (労基法)',
    track: 'common',
    kartu: 143,
    mnemonic:
      'Makin lama kerja, makin lama istirahat. 6→45, 8→60. Pattern: +2jam kerja = +15mnt istirahat',
    soal: '1日8時間を超える場合、休憩《きゅうけい》は最低何分必要か？ → 少なくとも1時間',
  },
  {
    angka: '6 bulan → 10 hari',
    konteks: 'Cuti berbayar (有給休暇) pertama kali',
    track: 'common',
    kartu: 1172,
    mnemonic:
      '6 bulan kerja baru dapat cuti. 10 hari = 2 minggu penuh. Ingat: "setengah tahun = 10 hari hadiah"',
    soal: '入社《にゅうしゃ》後、有給休暇《ゆうきゅうきゅうか》が初めて付与《ふよ》されるのはいつか？何日か？ → 6ヶ月後・10日間',
  },
  {
    angka: '12 bulan dalam 2 tahun',
    konteks: 'Syarat dapat 雇用保険 (tunjangan pengangguran)',
    track: 'common',
    kartu: 138,
    mnemonic: 'Setengah dari 2 tahun (24 bulan) = 12 bulan. "Kerja setengahnya, dapat tunjangan"',
    soal: '雇用保険《こようほけん》の失業給付《しつぎょうきゅうふ》を受けるには、離職前《りしょくまえ》の2年間に何ヶ月の被保険者期間《ひほけんしゃきかん》が必要か？ → 12ヶ月以上',
  },
  {
    angka: '≥ 50 orang',
    konteks: 'Wajib ストレスチェック (stress check)',
    track: 'common',
    kartu: 139,
    mnemonic:
      '50 = setengah dari 100. Perusahaan "ukuran 50" wajib cek stres. Ingat angka "50" = stres check',
    soal: 'ストレスチェックが義務付《ぎむづ》けられている事業場《じぎょうじょう》の規模《きぼ》は？ → 常時50人以上の労働者《ろうどうしゃ》',
  },
  {
    angka: '≥ 100g',
    konteks: 'Drone wajib didaftarkan',
    track: 'common',
    kartu: 140,
    mnemonic: '100g = berat smartphone. Drone seberat HP wajib daftar. "Satu ons = daftar drone"',
    soal: '無人航空機《むじんこうくうき》（ドローン）を登録《とうろく》しなければならない最小重量《さいしょうじゅうりょう》は？ → 100g以上',
  },
  {
    angka: '≥ 60m',
    konteks: 'Wajib 航空障害灯 (lampu penghalang udara)',
    track: 'common',
    kartu: 141,
    mnemonic:
      '60m = tinggi gedung ~20 lantai. Gedung tinggi = wajib lampu merah atas. "Enam-puluh meter = lampu udara"',
    soal: '航空障害灯《こうくうしょうがいとう》の設置《せっち》が義務付《ぎむづ》けられる建築物《けんちくぶつ》の高さは？ → 地上60m以上',
  },
  {
    angka: '≥ 645 hari',
    konteks: 'CCUS Level 2 minimum hari kerja',
    track: 'common',
    kartu: 114,
    mnemonic: '645 ≈ 2.5 tahun kerja (255 hari/tahun). "Lebih dari 2 tahun = Level 2 CCUS"',
    soal: 'CCUSのレベル2を取得《しゅとく》するために必要な最低就業日数《さいていしゅうぎょうにっすう》は？ → 645日以上',
  },
  {
    angka: '≥ 1.5m',
    konteks: '土留め wajib dipasang saat galian',
    track: 'common',
    kartu: 106,
    mnemonic:
      '1.5m = setinggi orang dewasa. Jika lubang galian lebih dalam dari orang = wajib 土留め. "Sedalam manusia = pasang penahan"',
    soal: '掘削《くっさく》深さが何m以上になると土留め《どどめ》設備の設置《せっち》が必要か？ → 1.5m以上',
  },
  {
    angka: '15A ～ 100A',
    konteks: 'SGP sambungan ulir ねじ接合 range',
    track: 'lifeline',
    kartu: 85,
    mnemonic: 'SGP (pipa gas/air ringan): mulai 15 sampai 100 ampere/mm. Ingat angka 15 dan 100',
    soal: 'SGP配管《はいかん》でねじ接合《せつごう》が適用《てきよう》できる管径《かんけい》の範囲《はんい》は？ → 15A以上100A以下',
  },
  {
    angka: '> 0.8m',
    konteks: 'Kedalaman kabel bawah jalan raya (土被り)',
    track: 'lifeline',
    kartu: 67,
    mnemonic:
      '0.8m = hampir 1 meter. Kabel di bawah jalan harus terkubur hampir 1 meter. "Delapan puluh sentimeter bawah aspal"',
    soal: '道路下《どうろした》に埋設《まいせつ》するケーブルの土被り《どかぶり》（最低埋設深さ）は？ → 0.8mより深く',
  },
  {
    angka: '110 / 288 kasus',
    konteks: '墜落・転落 th.2021 (kematian 墜落 / total kematian konstruksi)',
    track: 'common',
    kartu: 101,
    mnemonic:
      '110 dari 288 = ~38% kematian konstruksi karena jatuh. "Lebih dari sepertiga mati jatuh"',
    soal: '建設業《けんせつぎょう》の死亡事故《しぼうじこ》で最も多い原因《げんいん》は何か、その件数《けんすう》は？ → 墜落《ついらく》・転落《てんらく》（110件／全288件 2021年）',
  },
  {
    angka: '14 hari sebelum',
    konteks: 'Laporan wajib bongkar asbes ke gubernur',
    track: 'common',
    kartu: 26,
    mnemonic:
      '14 hari = 2 minggu. Laporan 2 minggu sebelum bongkar asbes. "Dua minggu sebelum bongkar asbes"',
    soal: 'アスベストを含む建材《けんざい》を解体《かいたい》する場合、都道府県知事《とどうふけんちじ》への届出《とどけで》はいつまでに行うか？ → 14日前まで',
  },
  {
    angka: '< 6mm / ≥ 6mm',
    konteks: 'Baja ringan LGS vs baja berat (重量鉄骨)',
    track: 'common',
    kartu: 1347,
    mnemonic:
      '6mm = batas antara ringan dan berat. Di bawah 6 = LGS ringan; 6 ke atas = baja berat struktural',
    soal: '軽量鉄骨《けいりょうてっこつ》（LGS）と重量鉄骨《じゅうりょうてっこつ》の区別《くべつ》は板厚《いたあつ》何mmか？ → 6mm未満 = 軽量；6mm以上 = 重量',
  },
  {
    angka: '≈ 10m',
    konteks: 'Wellpoint method kedalaman maks',
    track: 'lifeline',
    kartu: 112,
    mnemonic:
      '10m = batas dewatering wellpoint. Lebih dalam dari itu perlu metode lain. "Wellpoint hanya sampai 10 meter"',
    soal: 'ウェルポイント工法《こうほう》が適用《てきよう》できる最大の掘削《くっさく》深さはどのくらいか？ → 約10m',
  },
  {
    angka: '29 jenis',
    konteks: 'Jenis izin usaha konstruksi (建設業法)',
    track: 'common',
    kartu: 24,
    mnemonic:
      '29 jenis izin konstruksi. Ingat: "dua-sembilan izin, hampir 30". Atau: 2+9=11 → tidak ada trik; hafal 29',
    soal: '建設業法《けんせつぎょうほう》に基づく建設工事《けんせつこうじ》の種類《しゅるい》（許可業種《きょかぎょうしゅ》）は全部で何種類か？ → 29種類',
  },
  {
    angka: '32 jenis',
    konteks: '技能検定 bidang konstruksi',
    track: 'common',
    kartu: 136,
    mnemonic: '32 jenis sertifikasi 技能検定. Ingat: "tiga-dua sertifikasi teknis"',
    soal: '建設分野《けんせつぶんや》において技能検定《ぎのうけんてい》の職種《しょくしゅ》は何種類あるか？ → 32職種',
  },
  {
    angka: '5t / 1t',
    konteks: 'Batas lisensi crane / 玉掛け',
    track: 'common',
    kartu: 170,
    mnemonic:
      'Crane: 5 ton ke atas perlu lisensi penuh; 玉掛け (slinging): 1 ton ke atas. "5 ton crane, 1 ton slinging"',
    soal: 'クレーン運転《うんてん》（つり上げ荷重《つりあげかじゅう》）と玉掛け《たまかけ》で技能講習《ぎのうこうしゅう》が必要になる荷重《かじゅう》は？ → クレーン5t以上・玉掛け《たまかけ》1t以上',
  },
  {
    angka: '10m',
    konteks: '高所作業車 ≥10m → 技能講習 wajib',
    track: 'common',
    kartu: 171,
    mnemonic:
      '10m = tinggi gedung 3-4 lantai. Aerial work platform setinggi itu butuh sertifikasi. "Sepuluh meter = sertif aerial"',
    soal: '高所作業車《こうしょさぎょうしゃ》で技能講習《ぎのうこうしゅう》が必要になる作業床《さぎょうゆか》の高さは？ → 10m以上',
  },
  {
    angka: '3t',
    konteks: '車両系建設機械 ≥3t → 技能講習 wajib',
    track: 'common',
    kartu: 172,
    mnemonic:
      '3 ton = excavator kecil. Mesin konstruksi di atas 3 ton perlu kursus teknis. "Tiga ton = kursus alat berat"',
    soal: '車両系建設機械《しゃりょうけいけんせつきかい》の技能講習《ぎのうこうしゅう》が必要となる機体質量《きたいしつりょう》は？ → 3t以上',
  },
  {
    angka: '≥ 1.0mm',
    konteks: 'Cacat potong pipa → risiko bocor (斜め/段切れ)',
    track: 'lifeline',
    kartu: 428,
    mnemonic:
      '1mm = hampir tak terlihat, tapi cukup bikin pipa bocor. "Satu milimeter cacat = tolak pipa"',
    soal: 'ライニング管の切断面《せつだんめん》の斜め《ななめ》（傾き《かたむき》）が何mm以上ある場合は再切断《さいせつだん》が必要か？ → 1.0mm以上',
  },
  {
    angka: '6〜7 lilitan',
    konteks: 'Seal tape pada sambungan ulir ねじ接合',
    track: 'lifeline',
    kartu: 430,
    mnemonic: '6-7 lilitan seal tape. Ingat: "enam-tujuh putaran, tidak lebih tidak kurang"',
    soal: 'ねじ接合《せつごう》においてシールテープを巻く回数《かいすう》（標準《ひょうじゅん》）は？ → 6〜7回',
  },
  {
    angka: '2〜2.5 ulir',
    konteks: 'Sisa ulir saat ねじ込み dengan パイプレンチ',
    track: 'lifeline',
    kartu: 431,
    mnemonic:
      'Sisa 2-2.5 ulir = pas. Terlalu dalam bocor; terlalu sedikit goyah. "Dua ulir sisa = kencang pas"',
    soal: 'パイプレンチでねじ込んだとき、管端《かんたん》から露出《ろしゅつ》するねじの山数《やまかず》の目安《めやす》は？ → 2〜2.5山',
  },
  {
    angka: '2%',
    konteks: 'Penyusutan insulasi termal maksimum (保温材)',
    track: 'lifeline',
    kartu: 452,
    mnemonic:
      '2% = sangat kecil. Insulasi termal tidak boleh menyusut lebih dari 2%. "Dua persen maks susut isolasi"',
    soal: '保温材《ほおんざい》の線収縮率《せんしゅうしゅくりつ》（最大許容値《さいだいきょようち》）は何%以下か？ → 2%以下',
  },
  {
    angka: '90 detik/soal',
    konteks: 'Estimasi waktu Prometric (50 soal ÷ 75 mnt)',
    track: 'common',
    kartu: null,
    /* exam meta rule — no flashcard linked (intentional) */ mnemonic:
      '75 menit ÷ 50 soal = 1.5 menit = 90 detik per soal. "Satu setengah menit per soal ujian"',
    soal: '試験時間《しけんじかん》75分・50問の場合、1問あたりに使える時間は？ → 約90秒（1分30秒）',
  },
  {
    angka: '65%',
    konteks: 'Nilai lulus simulasi ujian (nilai batas kelulusan)',
    track: 'common',
    kartu: null,
    /* exam meta rule — no flashcard linked (intentional) */ mnemonic:
      '65% = 33 dari 50 soal. "Enam-lima persen = lulus ujian". Minimal 33 soal benar dari 50',
    soal: '試験に合格《ごうかく》するために必要な正解率《せいかいりつ》の目安《めやす》は？ → 65%以上（50問中33問以上）',
  },
];
