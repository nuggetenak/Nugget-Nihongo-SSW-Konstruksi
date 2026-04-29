// ─── SSW Konstruksi: Design System ──────────────────────────────────────────
// Dual-theme: Light (default) + Dark — toggled via CSS custom properties
// All T.* values reference CSS vars → components auto-update on theme switch
// ─────────────────────────────────────────────────────────────────────────────

export const THEMES = {
  light: {
    '--ssw-bg': '#FFFDF5',
    '--ssw-bgAlt': '#FEF9E7',
    '--ssw-surface': 'rgba(180,83,9,0.06)',
    '--ssw-surfaceHover': 'rgba(180,83,9,0.11)',
    '--ssw-surfaceActive': 'rgba(180,83,9,0.16)',
    '--ssw-overlay': 'rgba(0,0,0,0.22)',
    '--ssw-text': '#1C1917',
    '--ssw-textBright': '#0C0A09',
    '--ssw-textMuted': 'rgba(28,25,23,0.58)',
    '--ssw-textDim': 'rgba(28,25,23,0.36)',
    '--ssw-textFaint': 'rgba(28,25,23,0.18)',
    '--ssw-border': 'rgba(180,83,9,0.13)',
    '--ssw-borderLight': 'rgba(180,83,9,0.20)',
    '--ssw-borderHover': 'rgba(180,83,9,0.35)',
    '--ssw-borderActive': 'rgba(180,83,9,0.55)',
    '--ssw-shadowSm': '0 1px 4px rgba(28,25,23,0.09)',
    '--ssw-shadowMd': '0 4px 14px rgba(28,25,23,0.11)',
    '--ssw-shadowLg': '0 8px 32px rgba(28,25,23,0.14)',
    '--ssw-shadowGlow': '0 0 20px rgba(245,158,11,0.22)',
    '--ssw-shadowGlowStrong': '0 0 32px rgba(245,158,11,0.35)',
    '--ssw-scrollbar': 'rgba(180,83,9,0.20)',
    '--ssw-inputBg': 'rgba(180,83,9,0.05)',
    '--ssw-navBg': 'rgba(255,253,245,0.94)',
    '--ssw-amber':          '#F59E0B',
    '--ssw-amberDark':      '#92400E',
    '--ssw-gold':           '#FBBF24',
    '--ssw-correct':        '#16a34a',
    '--ssw-correctBg':      'rgba(22,163,74,0.10)',
    '--ssw-correctBorder':  'rgba(22,163,74,0.35)',
    '--ssw-wrong':          '#dc2626',
    '--ssw-wrongBg':        'rgba(220,38,38,0.10)',
    '--ssw-wrongBorder':    'rgba(220,38,38,0.35)',
  },
  dark: {
    '--ssw-bg': '#0D0B08',
    '--ssw-bgAlt': '#110E0A',
    '--ssw-surface': 'rgba(245,158,11,0.055)',
    '--ssw-surfaceHover': 'rgba(245,158,11,0.10)',
    '--ssw-surfaceActive': 'rgba(245,158,11,0.14)',
    '--ssw-overlay': 'rgba(0,0,0,0.50)',
    '--ssw-text': '#FEF3C7',
    '--ssw-textBright': '#FFFBEB',
    '--ssw-textMuted': 'rgba(254,243,199,0.55)',
    '--ssw-textDim': 'rgba(254,243,199,0.30)',
    '--ssw-textFaint': 'rgba(254,243,199,0.16)',
    '--ssw-border': 'rgba(245,158,11,0.08)',
    '--ssw-borderLight': 'rgba(245,158,11,0.14)',
    '--ssw-borderHover': 'rgba(245,158,11,0.25)',
    '--ssw-borderActive': 'rgba(245,158,11,0.40)',
    '--ssw-shadowSm': '0 1px 3px rgba(0,0,0,0.30)',
    '--ssw-shadowMd': '0 4px 12px rgba(0,0,0,0.35)',
    '--ssw-shadowLg': '0 8px 30px rgba(0,0,0,0.40)',
    '--ssw-shadowGlow': '0 0 20px rgba(245,158,11,0.15)',
    '--ssw-shadowGlowStrong': '0 0 30px rgba(245,158,11,0.25)',
    '--ssw-scrollbar': 'rgba(245,158,11,0.18)',
    '--ssw-inputBg': 'rgba(245,158,11,0.05)',
    '--ssw-navBg': 'rgba(13,11,8,0.94)',
    '--ssw-amber':          '#F59E0B',
    '--ssw-amberDark':      '#92400E',
    '--ssw-gold':           '#FBBF24',
    '--ssw-correct':        '#16a34a',
    '--ssw-correctBg':      'rgba(22,163,74,0.10)',
    '--ssw-correctBorder':  'rgba(22,163,74,0.35)',
    '--ssw-wrong':          '#dc2626',
    '--ssw-wrongBg':        'rgba(220,38,38,0.10)',
    '--ssw-wrongBorder':    'rgba(220,38,38,0.35)',
  },
};

export function applyTheme(isDark) {
  const vars = isDark ? THEMES.dark : THEMES.light;
  const root = document.documentElement;
  Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v));
  root.setAttribute('data-theme', isDark ? 'dark' : 'light');
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', isDark ? '#0D0B08' : '#FFFDF5');
}

export const T = {
  bg: 'var(--ssw-bg)',
  bgAlt: 'var(--ssw-bgAlt)',
  surface: 'var(--ssw-surface)',
  surfaceHover: 'var(--ssw-surfaceHover)',
  surfaceActive: 'var(--ssw-surfaceActive)',
  overlay: 'var(--ssw-overlay)',
  text: 'var(--ssw-text)',
  textBright: 'var(--ssw-textBright)',
  textMuted: 'var(--ssw-textMuted)',
  textDim: 'var(--ssw-textDim)',
  textFaint: 'var(--ssw-textFaint)',
  border: 'var(--ssw-border)',
  borderLight: 'var(--ssw-borderLight)',
  borderHover: 'var(--ssw-borderHover)',
  borderActive: 'var(--ssw-borderActive)',
  amber: 'var(--ssw-amber)',
  amberDark: 'var(--ssw-amberDark)',
  amberMid: '#B45309',
  gold: 'var(--ssw-gold)',
  accent: 'linear-gradient(135deg, #92400E, #B45309 50%, #F59E0B)',
  accentSoft: 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(251,191,36,0.08))',
  correct: 'var(--ssw-correct)',
  correctBg: 'var(--ssw-correctBg)',
  correctBorder: 'var(--ssw-correctBorder)',
  wrong: 'var(--ssw-wrong)',
  wrongBg: 'var(--ssw-wrongBg)',
  wrongBorder: 'var(--ssw-wrongBorder)',
  track: {
    doboku: {
      color: '#D97706',
      bg: 'rgba(217,119,6,0.10)',
      icon: '🏗️',
      label: 'Teknik Sipil',
      jp: '土木',
    },
    kenchiku: {
      color: '#0284C7',
      bg: 'rgba(2,132,199,0.10)',
      icon: '🏢',
      label: 'Bangunan',
      jp: '建築',
    },
    lifeline: {
      color: '#059669',
      bg: 'rgba(5,150,105,0.10)',
      icon: '⚡',
      label: 'Lifeline & Peralatan',
      jp: 'ライフライン・設備',
    },
  },
  shadow: {
    sm: 'var(--ssw-shadowSm)',
    md: 'var(--ssw-shadowMd)',
    lg: 'var(--ssw-shadowLg)',
    glow: 'var(--ssw-shadowGlow)',
    glowStrong: 'var(--ssw-shadowGlowStrong)',
  },
  sp: [0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64],
  r: { xs: 6, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, pill: 99 },
  font: "'DM Sans','Noto Sans JP',system-ui,sans-serif",
  fontJP: "'Noto Sans JP','DM Sans',sans-serif",
  maxW: 480,
  navH: 56,
};

export const GRADES = [
  { key: 'S', emoji: '🏆', color: '#D97706', label: 'Luar Biasa!', min: 90 },
  { key: 'A', emoji: '✨', color: '#16a34a', label: 'Bagus Sekali!', min: 70 },
  { key: 'B', emoji: '📚', color: '#0284C7', label: 'Terus Belajar!', min: 50 },
  { key: 'C', emoji: '💪', color: '#dc2626', label: 'Jangan Menyerah!', min: 0 },
];
export const getGrade = (pct) => GRADES.find((g) => pct >= g.min) || GRADES[3];

if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
    @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
    @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.6} }
    @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
    @keyframes scaleIn { from{transform:scale(0.92);opacity:0} to{transform:scale(1);opacity:1} }
    @keyframes flipIn { from{transform:rotateY(90deg);opacity:0} to{transform:rotateY(0deg);opacity:1} }
    @keyframes toastIn { from{opacity:0;transform:translateY(20px) scale(0.95)} to{opacity:1;transform:translateY(0) scale(1)} }
    @keyframes toastOut { from{opacity:1;transform:translateY(0) scale(1)} to{opacity:0;transform:translateY(20px) scale(0.95)} }
    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
    }
    html { transition: background-color 0.2s ease; }
    body { background:var(--ssw-bg); color:var(--ssw-text); margin:0; }
    *::-webkit-scrollbar { width:4px; }
    *::-webkit-scrollbar-track { background:transparent; }
    *::-webkit-scrollbar-thumb { background:var(--ssw-scrollbar); border-radius:99px; }
    button { -webkit-tap-highlight-color:transparent; }
    input { -webkit-tap-highlight-color:transparent; }
    [data-theme='light'] ::placeholder { color:rgba(28,25,23,0.35); }
    [data-theme='dark'] ::placeholder { color:rgba(254,243,199,0.30); }
  `;
  document.head.appendChild(style);
}
