// doboku-03.js — Quiz Set: doboku-03
export const SET_DOBOKU_03 = {
    id: 'doboku-03',
    title: '安全管理・法規',
    subtitle: 'Manajemen Keselamatan & Peraturan',
    emoji: '🛡️',
    questions: [
      {
        q: '酸素欠乏危険作業とは酸素濃度が何%未満の場所？',
        opts: ['18%未満', '21%未満', '15%未満', '25%未満'],
        opts_id: ['Di bawah 18%', 'Di bawah 21%', 'Di bawah 15%', 'Di bawah 25%'],
        ans: 0,
        exp: 'Menurut peraturan K3 Jepang, tempat dengan kadar oksigen di bawah 18% = lingkungan defisiensi oksigen (酸素欠乏). Udara normal = 21%. Kesalahan umum: menjawab 21% (itu kadar normal).',
        cat: 'hourei',
        desc: 'Standar kadar oksigen minimum. Sebagai pekerja SSW: di manhole, tangki, atau ruang tertutup, WAJIB ukur kadar O2 sebelum masuk. Di bawah 18% = DILARANG masuk tanpa alat bantu napas. Mandor: 酸素濃度を測定してください。'
      },
      {
        q: '労働安全衛生法で事業者の義務は？',
        opts: ['労働者の安全と健康を確保すること', '利益を最大化すること', '残業を増やすこと', '工期を短縮すること'],
        opts_id: ['Memastikan keselamatan & kesehatan pekerja', 'Memaksimalkan keuntungan', 'Menambah lembur', 'Mempersingkat jadwal'],
        ans: 0,
        exp: '労働安全衛生法 (UU K3 Jepang) mewajibkan pemberi kerja menjamin keselamatan dan kesehatan pekerja. Ini bukan soal profit atau jadwal.',
        cat: 'hourei',
        desc: 'Kewajiban pemberi kerja menurut UU K3. Sebagai pekerja SSW: kamu punya HAK atas lingkungan kerja yang aman — kalau ada kondisi bahaya, kamu berhak menolak bekerja. Ini dilindungi hukum.'
      },
      {
        q: '「安全衛生責任者」を選任しなければならない現場は？',
        opts: ['元請と下請が混在する現場', 'すべての現場', '大規模現場のみ', '公共工事のみ'],
        opts_id: ['Proyek dengan kontraktor utama & sub-kontraktor', 'Semua proyek', 'Hanya proyek besar', 'Hanya proyek pemerintah'],
        ans: 0,
        exp: 'Petugas K3 (安全衛生責任者) wajib ditunjuk saat proyek melibatkan kontraktor utama (元請) dan subkontraktor (下請) bekerja bersama — untuk koordinasi keselamatan antar perusahaan.',
        cat: 'hourei',
        desc: 'Penunjukan petugas K3. Sebagai pekerja SSW di subkontraktor: kamu melapor ke 安全衛生責任者 perusahaan submu, bukan langsung ke kontraktor utama. Tahu siapa namanya.'
      },
      {
        q: '「作業主任者」が必要な作業は？',
        opts: ['型枠支保工の組立て', '掃除', '材料の運搬', '事務作業'],
        opts_id: ['Pemasangan shoring bekisting', 'Kebersihan', 'Pengangkutan material', 'Pekerjaan kantor'],
        ans: 0,
        exp: 'Pekerjaan berisiko tinggi seperti pemasangan shoring bekisting (型枠支保工) wajib ada 作業主任者 (supervisor kerja bersertifikat). Kebersihan dan pengangkutan biasa tidak memerlukan.',
        cat: 'hourei',
        desc: 'Kewajiban supervisor bersertifikat. Sebagai pekerja SSW: pastikan ada 作業主任者 sebelum mulai kerja berisiko — kalau tidak ada, jangan mulai. Ini hakmu.'
      },
      {
        q: '有機溶剤を使用するときに必要なものは？',
        opts: ['防毒マスクと換気装置', '軍手だけ', '安全靴だけ', 'ヘルメットだけ'],
        opts_id: ['Masker anti gas & ventilasi', 'Hanya sarung tangan kain', 'Hanya sepatu safety', 'Hanya helm'],
        ans: 0,
        exp: 'Pelarut organik (有機溶剤) = beracun. WAJIB pakai masker anti gas (防毒マスク) DAN pastikan ventilasi (換気). Sarung tangan kain saja tidak cukup melindungi dari uap kimia.',
        cat: 'anzen',
        desc: 'Perlindungan dari pelarut organik. Sebagai pekerja SSW: cat, thinner, lem — semua mengandung 有機溶剤. Tanpa masker yang benar = keracunan. Mandor: 防毒マスクをつけてから作業してください。'
      },
      {
        q: '石綿（アスベスト）を含む建材の解体で必要な措置は？',
        opts: ['事前調査と届出、飛散防止措置', '普通に解体してよい', '水をかけるだけでよい', '窓を開けるだけでよい'],
        opts_id: ['Survei awal, pelaporan, & pencegahan serbuk', 'Boleh bongkar biasa', 'Cukup siram air', 'Cukup buka jendela'],
        ans: 0,
        exp: 'Asbes (石綿/アスベスト) = karsinogenik. Pembongkaran material ber-asbes WAJIB: (1) survei awal, (2) melapor ke pemerintah, (3) tindakan pencegahan penyebaran serat. Bukan pekerjaan biasa.',
        cat: 'hourei',
        desc: 'Prosedur pembongkaran material ber-asbes. Sebagai pekerja SSW: JANGAN pernah potong atau bor material yang dicurigai asbes tanpa izin — serat asbes menyebabkan kanker paru-paru.'
      },
      {
        q: '感電防止のために電動工具で確認することは？',
        opts: ['アース（接地）が正しく接続されている', '色がきれい', '新品である', '値段が高い'],
        opts_id: ['Grounding/arde terpasang dengan benar', 'Warnanya bagus', 'Masih baru', 'Harganya mahal'],
        ans: 0,
        exp: 'Untuk mencegah kesetrum (感電), pastikan alat listrik terhubung grounding/arde (アース/接地) dengan benar. Warna, usia, atau harga alat tidak relevan dengan keselamatan listrik.',
        cat: 'anzen',
        desc: 'Pencegahan kesetrum. Sebagai pekerja SSW: sebelum pakai bor, gerinda, dll — cek kabel arde. Kalau kabel terkelupas = LAPOR, jangan pakai. Mandor: アースの接続を確認してください。'
      },
      {
        q: '「新規入場者教育」はいつ行う？',
        opts: ['現場に初めて入るとき', '毎月1回', '毎年1回', '工事完了時'],
        opts_id: ['Saat pertama kali masuk proyek', 'Sebulan sekali', 'Setahun sekali', 'Saat proyek selesai'],
        ans: 0,
        exp: '新規入場者教育 = orientasi keselamatan untuk pekerja yang PERTAMA KALI masuk proyek tersebut. Bukan bulanan atau tahunan.',
        cat: 'hourei',
        desc: 'Orientasi keselamatan pekerja baru di proyek. Sebagai pekerja SSW: setiap pindah ke proyek baru, kamu WAJIB ikut orientasi ini — biasanya 1-2 jam. Isi: aturan proyek, titik bahaya, jalur evakuasi.'
      },
      {
        q: '「安全帯使用の免除」が認められる場合は？',
        opts: ['原則として免除はない', '天気が良いとき', '作業が簡単なとき', '経験が長いとき'],
        opts_id: ['Pada prinsipnya tidak ada pengecualian', 'Saat cuaca baik', 'Saat pekerjaan mudah', 'Saat pengalaman sudah lama'],
        ans: 0,
        exp: 'Pada prinsipnya TIDAK ADA pengecualian untuk penggunaan harness di ketinggian ≥2m. Cuaca baik, pekerjaan mudah, atau pengalaman lama bukan alasan untuk tidak pakai.',
        cat: 'hourei',
        desc: 'Tidak ada pengecualian harness. Sebagai pekerja SSW: kalau mandor bilang "tidak perlu harness karena kerjanya cepat" — itu SALAH. Kamu berhak menolak naik tanpa harness.'
      },
      {
        q: '高さ5m以上の足場の組立てに必要な資格は？',
        opts: ['足場の組立て等作業主任者', '特に資格は不要', '運転免許', '医師免許'],
        opts_id: ['Sertifikat supervisor pemasangan scaffolding', 'Tidak perlu sertifikat', 'SIM', 'Izin dokter'],
        ans: 0,
        exp: 'Pemasangan scaffolding ≥5m WAJIB ada supervisor bersertifikat (足場の組立て等作業主任者). Bukan pekerjaan yang boleh dilakukan tanpa pengawasan.',
        cat: 'hourei',
        desc: 'Sertifikasi scaffolding. Sebagai pekerja SSW: kamu boleh MEMBANTU pasang scaffolding di bawah pengawasan 作業主任者, tapi tidak boleh memimpin pemasangan tanpa sertifikat.'
      },
      {
        q: '熱中症の初期症状は？',
        opts: ['めまい・大量の汗・筋肉のけいれん', '頭痛だけ', '鼻血だけ', '目のかゆみだけ'],
        opts_id: ['Pusing, keringat banyak, kram otot', 'Hanya sakit kepala', 'Hanya mimisan', 'Hanya mata gatal'],
        ans: 0,
        exp: 'Gejala awal heat stroke (熱中症): pusing (めまい), keringat berlebihan (大量の汗), kram otot (筋肉のけいれん). Kalau dibiarkan → pingsan → bisa meninggal.',
        cat: 'anzen',
        desc: 'Mengenali gejala heat stroke. Sebagai pekerja SSW: musim panas Jepang sangat panas + lembab. Wajib minum air tiap 30 menit. Mandor: 水分補給をこまめにしてください。'
      },
      {
        q: '労災保険の適用範囲は？',
        opts: ['すべての労働者（外国人を含む）', '日本人だけ', '正社員だけ', '管理者だけ'],
        opts_id: ['Semua pekerja (termasuk WNA)', 'Hanya orang Jepang', 'Hanya karyawan tetap', 'Hanya manajer'],
        ans: 0,
        exp: 'Asuransi kecelakaan kerja (労災保険) berlaku untuk SEMUA pekerja termasuk pekerja asing (外国人). Ini hak kamu sebagai pekerja SSW.',
        cat: 'hourei',
        desc: 'Hak asuransi kecelakaan kerja. Sebagai pekerja SSW: kalau kamu cedera di tempat kerja, perusahaan WAJIB menanggung biaya pengobatan lewat 労災保険. Ini hakmu — jangan takut melapor.'
      },
      {
        q: '「指差し呼称（ゆびさしこしょう）」の目的は？',
        opts: ['確認の精度を上げてミスを防ぐ', '上司に見せるため', '時間を稼ぐため', '体操のため'],
        opts_id: ['Meningkatkan ketelitian pengecekan & mencegah kesalahan', 'Untuk ditunjukkan ke atasan', 'Untuk mengulur waktu', 'Untuk olahraga'],
        ans: 0,
        exp: '指差し呼称 (pointing and calling) = metode konfirmasi keselamatan dengan menunjuk + menyebut item yang dicek dengan suara keras. Terbukti mengurangi kesalahan hingga 85%.',
        cat: 'anzen',
        desc: 'Metode pointing & calling. Sebagai pekerja SSW: ini kebiasaan Jepang yang mungkin terasa aneh awalnya — tapi sangat efektif. Contoh: tunjuk switch → "スイッチ OFF、ヨシ！"'
      },
      {
        q: '建設現場の「整理・整頓」の目的は？',
        opts: ['事故の防止と作業効率の向上', '見た目をきれいにするだけ', '検査に合格するため', '写真を撮るため'],
        opts_id: ['Mencegah kecelakaan & meningkatkan efisiensi', 'Hanya supaya terlihat rapi', 'Supaya lulus inspeksi', 'Untuk difoto'],
        ans: 0,
        exp: '整理・整頓 (5S — seiri, seiton) di proyek konstruksi = bukan soal estetika, tapi pencegahan kecelakaan (tersandung material) dan efisiensi (cepat cari alat).',
        cat: 'anzen',
        desc: 'Budaya rapi/tertib di proyek Jepang. Sebagai pekerja SSW: setelah selesai kerja, WAJIB rapikan area kerja — alat dikembalikan, sampah dibuang, material ditata. Mandor: 今日の片付けをお願いします。'
      },
      {
        q: '特定技能1号で建設分野の在留期間は最長何年？',
        opts: ['通算5年', '通算3年', '通算10年', '期限なし'],
        opts_id: ['Total 5 tahun', 'Total 3 tahun', 'Total 10 tahun', 'Tanpa batas'],
        ans: 0,
        exp: 'SSW 1号 (特定技能1号) di bidang konstruksi = masa tinggal maksimum total 5 tahun (通算5年). Setelah itu bisa upgrade ke SSW 2号 yang tidak ada batas waktu.',
        cat: 'hourei',
        desc: 'Masa berlaku visa SSW 1. Sebagai pekerja SSW: kamu punya 5 tahun — manfaatkan untuk belajar bahasa & skill agar bisa naik ke SSW 2号 (tanpa batas waktu tinggal).'
      },
    ],
  };
