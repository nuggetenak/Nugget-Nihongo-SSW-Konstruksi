// SSW Flashcards: Categories, Source Metadata, and Category Helpers

export const CATEGORIES = [
  { key: "all", label: "すべて", color: "#4a5568", emoji: "📚" },
  { key: "salam", label: "挨拶・安全", color: "#c05621", emoji: "🙏" },
  { key: "hukum", label: "法律・規制", color: "#285e61", emoji: "⚖️" },
  { key: "jenis_kerja", label: "工事の種類", color: "#1a365d", emoji: "🏗️" },
  { key: "listrik", label: "電気工事", color: "#744210", emoji: "⚡" },
  { key: "telekomunikasi", label: "通信工事", color: "#1c4532", emoji: "📡" },
  { key: "pipa", label: "配管工事", color: "#3c366b", emoji: "🔧" },
  { key: "isolasi", label: "保温保冷", color: "#702459", emoji: "🌡️" },
  { key: "pemadam", label: "消防設備", color: "#742a2a", emoji: "🔥" },
  { key: "keselamatan", label: "安全管理", color: "#22543d", emoji: "🦺" },
  { key: "karier", label: "キャリア・雇用", color: "#553c9a", emoji: "👷" },
  { key: "alat_umum", label: "共通工具", color: "#2d3748", emoji: "🔨" },
  { key: "bintang", label: "Bintang", color: "#b7791f", emoji: "⭐" },
];

export const getCatInfo = (key) => CATEGORIES.find(c => c.key === key) || CATEGORIES[0];

export const SOURCE_META = {
  text1l:      { label: "Text 1L — Keselamatan & Salam",     emoji: "🙏", color: "#c05621" },
  text2:       { label: "Text 2 — Hukum & Regulasi",          emoji: "⚖️", color: "#285e61" },
  text3:       { label: "Text 3 — Jenis Pekerjaan",           emoji: "🏗️", color: "#1a365d" },
  text4:       { label: "Text 4 — Konstruksi & Teknik",       emoji: "🔩", color: "#3c366b" },
  text5l:      { label: "Text 5L — Alat & Lifeline",         emoji: "🔌", color: "#744210" },
  text6l:      { label: "Text 6L — Pipa & Isolasi",          emoji: "🌡️", color: "#702459" },
  text7l:      { label: "Text 7L — Karier & Mesin",          emoji: "👷", color: "#553c9a" },
  tt_sample:   { label: "TT Sample — Soal 学科 Set 1",        emoji: "📋", color: "#742a2a" },
  tt_sample2:  { label: "TT Sample 2 — Soal 学科 Set 2",      emoji: "📋", color: "#742a2a" },
  st_sample_l: { label: "ST Sample — Soal 実技 Set 1",        emoji: "🔧", color: "#22543d" },
  st_sample2_l:{ label: "ST Sample 2 — Soal 実技 Set 2",      emoji: "🔧", color: "#22543d" },
  lifeline4:   { label: "Vocab Wayground — Kosakata 設備実技",   emoji: "📖", color: "#0369a1" },
  vocab_jac:   { label: "Vocab JAC — Kosakata dari soal JAC", emoji: "📝", color: "#1d4ed8" },
  vocab_core:  { label: "Vocab Core — Kosakata inti konstruksi",emoji:"🏛️", color: "#2d3748" },
  vocab_exam:  { label: "Vocab Exam — 250 kosakata ujian Prometric", emoji: "🎯", color: "#7c3aed" },
  vocab_teori: { label: "Vocab Teori — Kosakata 学科 (hukum & safety)", emoji: "📋", color: "#dc2626" },
};

export const VOCAB_SOURCES = ["lifeline4", "vocab_jac", "vocab_core", "vocab_exam", "vocab_teori"];

// Source grouping for SumberMode
export const SOURCE_GROUPS = [
  { label: "PDF Utama JAC", keys: ["text1l","text2","text3","text4","text5l","text6l","text7l"] },
  { label: "Soal Contoh", keys: ["tt_sample","tt_sample2","st_sample_l","st_sample2_l"] },
  { label: "Kosakata", keys: ["lifeline4","vocab_jac","vocab_core","vocab_exam","vocab_teori"] },
];

export const SOURCE_ACCENT = {
  text1l: "#ed8936", text2: "#38b2ac", text3: "#667eea", text4: "#ed64a6",
  text5l: "#ecc94b", text6l: "#9f7aea", text7l: "#48bb78",
  tt_sample: "#fc8181", tt_sample2: "#fc8181", st_sample_l: "#68d391", st_sample2_l: "#68d391",
  lifeline4: "#63b3ed", vocab_jac: "#93c5fd", vocab_core: "#cbd5e0", vocab_exam: "#b794f4", vocab_teori: "#f56565",
};
