// ─── SSW Flashcards: Design Tokens ──────────────────────────────────────────
// Single source of truth for all colors, spacing, radii, fonts, and presets.
// Import this instead of hardcoding hex values in components.
// ─────────────────────────────────────────────────────────────────────────────

export const T = {
  // ── Core Palette ──
  bg:         "#0f172a",       // Main background
  bgCard:     "rgba(255,255,255,0.06)",
  bgHover:    "rgba(255,255,255,0.08)",
  bgSubtle:   "rgba(255,255,255,0.04)",
  bgOverlay:  "rgba(0,0,0,0.22)",

  // ── Text ──
  text:       "#e2e8f0",       // Primary text
  textMuted:  "#94a3b8",       // Secondary text
  textDim:    "#64748b",       // Tertiary text
  textDark:   "#475569",       // Quaternary / disabled text
  textSlate:  "#334155",       // Very dim

  // ── Borders ──
  border:     "rgba(255,255,255,0.09)",
  borderLight:"rgba(255,255,255,0.12)",
  borderHover:"rgba(255,255,255,0.15)",

  // ── Semantic: Correct / Wrong ──
  correct:       "#4ade80",
  correctBg:     "rgba(74,222,128,0.1)",
  correctBorder: "rgba(74,222,128,0.35)",
  correctGlow:   "rgba(74,222,128,0.2)",

  wrong:         "#f87171",
  wrongBg:       "rgba(248,113,113,0.1)",
  wrongBorder:   "rgba(248,113,113,0.35)",
  wrongGlow:     "rgba(248,113,113,0.2)",

  // ── Accent ──
  accent:     "linear-gradient(135deg, #f6d365, #fda085)",
  accentText: "#1a1a2e",
  blue:       "#93c5fd",
  blueBg:     "rgba(147,197,253,0.15)",
  blueBorder: "rgba(147,197,253,0.4)",
  gold:       "#fbbf24",

  // ── Grade Colors (result screen) ──
  grade: {
    S: { emoji: "🏆", col: "#fbbf24", min: 90 },
    A: { emoji: "✨", col: "#4ade80", min: 70 },
    B: { emoji: "📚", col: "#60a5fa", min: 50 },
    C: { emoji: "💪", col: "#f87171", min: 0 },
  },

  // ── Spacing (px) ──
  sp: { xs: 4, sm: 8, md: 14, lg: 20, xl: 28 },

  // ── Border Radius (px) ──
  rad: { sm: 8, md: 14, lg: 20, xl: 22, pill: 99 },

  // ── Fonts ──
  fontJP:    "'Noto Sans JP', sans-serif",
  fontJPAlt: "'Zen Kaku Gothic New', 'Noto Sans JP', sans-serif",
  fontMono:  "monospace",

  // ── Max Width ──
  maxW: 560,
};

// ─── Grade Calculator ────────────────────────────────────────────────────────
export function getGrade(accuracy) {
  if (accuracy >= T.grade.S.min) return T.grade.S;
  if (accuracy >= T.grade.A.min) return T.grade.A;
  if (accuracy >= T.grade.B.min) return T.grade.B;
  return T.grade.C;
}

// ─── Shared Style Presets ────────────────────────────────────────────────────
export const S = {
  // Generic button base
  btn: {
    fontFamily: "inherit",
    cursor: "pointer",
    border: "none",
    transition: "all 0.15s",
  },

  // Quiz option button (unselected)
  optionBtn: {
    padding: "13px 14px",
    fontSize: 13,
    borderRadius: T.rad.md,
    background: "rgba(255,255,255,0.07)",
    border: `1px solid ${T.borderLight}`,
    color: T.text,
    cursor: "pointer",
    textAlign: "left",
    lineHeight: 1.5,
    display: "flex",
    gap: 10,
    alignItems: "flex-start",
    fontFamily: T.fontJP,
    transition: "all 0.15s",
  },

  // Option badge (circle with number)
  optionBadge: {
    width: 26,
    height: 26,
    borderRadius: "50%",
    flexShrink: 0,
    background: "rgba(255,255,255,0.05)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 11,
    fontWeight: 700,
    border: `1px solid ${T.border}`,
    marginTop: 1,
  },

  // Progress bar container
  progressBar: {
    height: 4,
    background: "rgba(255,255,255,0.06)",
    borderRadius: T.rad.pill,
    overflow: "hidden",
  },

  // Primary CTA button (gradient)
  ctaBtn: {
    fontFamily: "inherit",
    width: "100%",
    padding: "13px",
    fontSize: 14,
    fontWeight: 700,
    borderRadius: T.rad.md,
    background: T.accent,
    border: "none",
    color: T.accentText,
    cursor: "pointer",
  },

  // Card container
  card: {
    borderRadius: T.rad.xl,
    background: T.bgCard,
    border: `1px solid ${T.border}`,
    padding: `${T.sp.xl}px ${T.sp.lg}px`,
  },

  // Section label (small caps)
  sectionLabel: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 1.5,
    color: T.textDim,
    textTransform: "uppercase",
    marginBottom: T.sp.sm,
  },

  // Container with max width
  container: {
    padding: "0 16px 24px",
    maxWidth: T.maxW,
    margin: "0 auto",
  },
};
