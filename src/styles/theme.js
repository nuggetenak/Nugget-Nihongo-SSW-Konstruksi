// ─── SSW Konstruksi: Design System ──────────────────────────────────────────
// "Warm Industrial Japanese" — inspired by 工事現場 safety colors
// #0D0B08 dark base + #F59E0B amber accent + cream text
// ─────────────────────────────────────────────────────────────────────────────

export const T = {
  // ── Core ──
  bg:       "#0D0B08",
  bgAlt:    "#110E0A",
  surface:  "rgba(245,158,11,0.055)",
  surfaceHover: "rgba(245,158,11,0.10)",
  surfaceActive: "rgba(245,158,11,0.14)",
  overlay:  "rgba(0,0,0,0.50)",

  // ── Text ──
  text:      "#FEF3C7",
  textBright:"#FFFBEB",
  textMuted: "rgba(254,243,199,0.55)",
  textDim:   "rgba(254,243,199,0.30)",
  textFaint: "rgba(254,243,199,0.16)",

  // ── Border ──
  border:      "rgba(245,158,11,0.08)",
  borderLight: "rgba(245,158,11,0.14)",
  borderHover: "rgba(245,158,11,0.25)",
  borderActive:"rgba(245,158,11,0.40)",

  // ── Brand ──
  amber:    "#F59E0B",
  amberDark:"#92400E",
  amberMid: "#B45309",
  gold:     "#FBBF24",
  accent:   "linear-gradient(135deg, #92400E, #B45309 50%, #F59E0B)",
  accentSoft: "linear-gradient(135deg, rgba(245,158,11,0.12), rgba(251,191,36,0.08))",

  // ── Semantic ──
  correct:       "#4ade80",
  correctBg:     "rgba(74,222,128,0.10)",
  correctBorder: "rgba(74,222,128,0.35)",
  wrong:         "#f87171",
  wrongBg:       "rgba(248,113,113,0.10)",
  wrongBorder:   "rgba(248,113,113,0.35)",

  // ── Track Colors ──
  track: {
    doboku:   { color: "#F59E0B", bg: "rgba(245,158,11,0.10)", icon: "🏗️", label: "Teknik Sipil", jp: "土木" },
    kenchiku: { color: "#0EA5E9", bg: "rgba(14,165,233,0.10)",  icon: "🏢", label: "Bangunan",     jp: "建築" },
    lifeline: { color: "#10B981", bg: "rgba(16,185,129,0.10)",  icon: "⚡", label: "Lifeline & Peralatan", jp: "ライフライン・設備" },
  },

  // ── Spacing scale (px) ──
  sp: [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64],

  // ── Radius ──
  r: { xs: 6, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, pill: 99 },

  // ── Font ──
  font: "'DM Sans','Noto Sans JP',system-ui,sans-serif",
  fontJP: "'Noto Sans JP','DM Sans',sans-serif",

  // ── Shadows ──
  shadow: {
    sm: "0 1px 3px rgba(0,0,0,0.3)",
    md: "0 4px 12px rgba(0,0,0,0.35)",
    lg: "0 8px 30px rgba(0,0,0,0.4)",
    glow: "0 0 20px rgba(245,158,11,0.15)",
    glowStrong: "0 0 30px rgba(245,158,11,0.25)",
  },

  // ── Layout ──
  maxW: 480,
  navH: 56,
};

// ─── Grade System ──
export const GRADES = [
  { key: "S", emoji: "🏆", color: "#FBBF24", label: "Luar Biasa!", min: 90 },
  { key: "A", emoji: "✨", color: "#4ade80", label: "Bagus Sekali!", min: 70 },
  { key: "B", emoji: "📚", color: "#60a5fa", label: "Terus Belajar!", min: 50 },
  { key: "C", emoji: "💪", color: "#f87171", label: "Jangan Menyerah!", min: 0 },
];
export const getGrade = (pct) => GRADES.find(g => pct >= g.min) || GRADES[3];

// ─── CSS Injection (animations + global styles) ──
const GLOBAL_CSS = `
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.6; } }
@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
@keyframes scaleIn { from { transform: scale(0.92); opacity: 0; } to { transform: scale(1); opacity: 1; } }

*::-webkit-scrollbar { width: 4px; }
*::-webkit-scrollbar-track { background: transparent; }
*::-webkit-scrollbar-thumb { background: rgba(245,158,11,0.15); border-radius: 99px; }

button { -webkit-tap-highlight-color: transparent; }
input { -webkit-tap-highlight-color: transparent; }
`;

if (typeof document !== "undefined") {
  const style = document.createElement("style");
  style.textContent = GLOBAL_CSS;
  document.head.appendChild(style);
}
