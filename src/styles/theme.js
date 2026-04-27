// ─── SSW Konstruksi: Design Tokens (Warm Amber Theme) ────────────────────────
// Matches nugget-nihongo.pages.dev brand colors
// ─────────────────────────────────────────────────────────────────────────────

export const T = {
  // ── Core ──
  bg:       "#0D0B08",
  surface:  "rgba(245,158,11,0.06)",
  surfaceHover: "rgba(245,158,11,0.10)",
  overlay:  "rgba(0,0,0,0.40)",

  // ── Text ──
  text:      "#FEF3C7",
  textBright:"#FFFBEB",
  textMuted: "rgba(254,243,199,0.56)",
  textDim:   "rgba(254,243,199,0.32)",
  textFaint: "rgba(254,243,199,0.18)",

  // ── Border ──
  border:      "rgba(245,158,11,0.10)",
  borderLight: "rgba(245,158,11,0.15)",
  borderHover: "rgba(245,158,11,0.25)",

  // ── Brand ──
  amber:    "#F59E0B",
  amberDark:"#92400E",
  amberMid: "#B45309",
  gold:     "#FBBF24",
  accent:   "linear-gradient(135deg, #92400E, #B45309 50%, #F59E0B)",

  // ── Semantic ──
  correct:       "#4ade80",
  correctBg:     "rgba(74,222,128,0.12)",
  correctBorder: "rgba(74,222,128,0.40)",
  wrong:         "#f87171",
  wrongBg:       "rgba(248,113,113,0.12)",
  wrongBorder:   "rgba(248,113,113,0.40)",

  // ── Track Colors ──
  trackDoboku:   "#D97706",
  trackKenchiku: "#0EA5E9",
  trackLifeline: "#10B981",

  // ── Spacing ──
  sp: [0, 4, 8, 12, 16, 20, 24, 32, 40, 48],

  // ── Radius ──
  r: { sm: 8, md: 12, lg: 16, xl: 20, pill: 99 },

  // ── Font ──
  font: "'DM Sans','Noto Sans JP',system-ui,sans-serif",
  fontJP: "'Noto Sans JP','DM Sans',sans-serif",

  // ── Layout ──
  maxW: 480,
};

// ─── Grade System ──
export const GRADES = [
  { key: "S", emoji: "🏆", color: "#FBBF24", label: "Luar Biasa!", min: 90 },
  { key: "A", emoji: "✨", color: "#4ade80", label: "Bagus Sekali!", min: 70 },
  { key: "B", emoji: "📚", color: "#60a5fa", label: "Terus Belajar!", min: 50 },
  { key: "C", emoji: "💪", color: "#f87171", label: "Jangan Menyerah!", min: 0 },
];
export const getGrade = (pct) => GRADES.find(g => pct >= g.min) || GRADES[3];
