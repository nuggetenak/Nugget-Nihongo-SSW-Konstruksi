// ─── components/Icon.jsx ─────────────────────────────────────────────────────
// Placeholder-first icon system.
//
// WHY: real icon art is being produced externally (see docs/ASSET-PROMPTS.md).
// Until each file lands, every icon renders as a simple geometric placeholder
// so layout, sizing, and spacing are already correct and nothing shifts when
// the real art arrives.
//
// ── HOW TO SWAP IN A REAL ASSET ──────────────────────────────────────────────
// 1. Drop the file into `public/icons/ui/` (e.g. `public/icons/ui/kartu.png`).
// 2. Add one line to ASSETS below:   kartu: 'kartu.png',
// That's it. No other file changes. Unlisted names keep their placeholder.
// ─────────────────────────────────────────────────────────────────────────────

const BASE = `${import.meta.env.BASE_URL}icons/ui/`;

/**
 * Real asset filenames, relative to public/icons/ui/.
 * Add an entry here to activate it; unlisted names keep their placeholder.
 * Art is single-colour line work — rendered via CSS mask, so it inherits
 * `currentColor` and still adapts to light/dark theme.
 * @type {Record<string, string>}
 */
export const ASSETS = {
  home: 'home.png',
  belajar: 'belajar.png',
  saya: 'saya.png',
  kartu: 'kartu.png',
  kuis: 'kuis.png',
  sprint: 'sprint.png',
  jac: 'jac.png',
  simulasi: 'simulasi.png',
  ujian: 'ujian.png',
  bintang: 'bintang.png',
  catatan: 'catatan.png',
  suara: 'suara.png',
  cari: 'cari.png',
  more: 'more.png',
  api: 'api.png',
  target: 'target.png',
  kalender: 'kalender.png',
  panah: 'panah.png',
  helm: 'helm.png',
  alat: 'alat.png',
};

// Placeholder geometry. Each entry is a minimal shape that reads as a
// distinct silhouette at 20px — enough to tell icons apart while building,
// deliberately not trying to be finished art.
const SHAPES = {
  home: <path d="M3 9.5 10 4l7 5.5V16a1 1 0 0 1-1 1h-4v-4H8v4H4a1 1 0 0 1-1-1z" />,
  belajar: <path d="M4 4h9a2 2 0 0 1 2 2v10H6a2 2 0 0 0-2 2z" />,
  saya: (
    <>
      <circle cx="10" cy="7" r="3" />
      <path d="M4 17a6 6 0 0 1 12 0z" />
    </>
  ),
  kartu: (
    <>
      <rect x="3" y="5" width="14" height="10" rx="2" />
      <path d="M3 9h14" />
    </>
  ),
  kuis: (
    <>
      <circle cx="10" cy="10" r="7" />
      <path d="M10 13v.01M10 11V9l1.5-1a2 2 0 1 0-2.8-2" />
    </>
  ),
  sprint: <path d="M11 3 5 11h4l-1 6 6-8h-4z" />,
  jac: (
    <>
      <rect x="5" y="4" width="10" height="13" rx="1.5" />
      <path d="M8 8h4M8 11h4" />
    </>
  ),
  simulasi: (
    <>
      <rect x="4" y="3" width="12" height="14" rx="1.5" />
      <path d="M7 7h6M7 10h6M7 13h3" />
    </>
  ),
  ujian: (
    <>
      <path d="M10 3l7 4v5c0 3-3 5-7 6-4-1-7-3-7-6V7z" />
      <path d="M7.5 10l2 2 3.5-4" />
    </>
  ),
  bintang: <path d="m10 3 2.2 4.5 5 .7-3.6 3.5.9 4.9-4.5-2.4-4.5 2.4.9-4.9L2.8 8.2l5-.7z" />,
  catatan: (
    <>
      <rect x="4" y="3" width="12" height="14" rx="1.5" />
      <path d="M7 7h6M7 10h6M7 13h4" />
    </>
  ),
  suara: (
    <>
      <path d="M4 8h3l4-3v10l-4-3H4z" />
      <path d="M13.5 7.5a3.5 3.5 0 0 1 0 5" />
    </>
  ),
  cari: (
    <>
      <circle cx="9" cy="9" r="5" />
      <path d="m13 13 4 4" />
    </>
  ),
  more: (
    <>
      <circle cx="4.5" cy="10" r="1.4" />
      <circle cx="10" cy="10" r="1.4" />
      <circle cx="15.5" cy="10" r="1.4" />
    </>
  ),
  api: (
    <path d="M10 3c3 3.5 4.5 5.5 4.5 8a4.5 4.5 0 0 1-9 0c0-1.6.8-3 2-4.4.3 1 .9 1.7 1.6 2C9.6 6.8 9.5 5 10 3z" />
  ),
  target: (
    <>
      <circle cx="10" cy="10" r="6.5" />
      <circle cx="10" cy="10" r="3" />
      <circle cx="10" cy="10" r="0.6" />
    </>
  ),
  kalender: (
    <>
      <rect x="3.5" y="5" width="13" height="12" rx="1.5" />
      <path d="M3.5 9h13M7 3v3M13 3v3" />
    </>
  ),
  panah: <path d="M4 10h11m-4-4 4 4-4 4" />,
  // ── Modes not covered by the first generated sheet ──
  // Distinct silhouettes so every mode stays tellable apart while the second
  // sheet is pending. Prompts: docs/ASSET-PROMPTS.md section 4b.
  ulang: (
    <>
      <path d="M16 6.5A7 7 0 1 0 17 10" />
      <path d="M16 3v4h-4" />
    </>
  ),
  wisuda: (
    <>
      <path d="M10 4 2.5 7.5 10 11l7.5-3.5z" />
      <path d="M5.5 9.2v4c0 1.2 2 2.3 4.5 2.3s4.5-1.1 4.5-2.3v-4" />
    </>
  ),
  angka: (
    <>
      <rect x="3.5" y="3.5" width="13" height="13" rx="2" />
      <path d="M3.5 8h13M3.5 12h13M8 3.5v13M12.5 3.5v13" />
    </>
  ),
  peringatan: (
    <>
      <path d="M10 3.2 18 16.5H2z" />
      <path d="M10 8v3.2M10 13.8v.01" />
    </>
  ),
  arsip: (
    <path d="M2.8 6.2a1.5 1.5 0 0 1 1.5-1.5h3l1.6 1.9h6.4a1.5 1.5 0 0 1 1.5 1.5v6.2a1.5 1.5 0 0 1-1.5 1.5H4.3a1.5 1.5 0 0 1-1.5-1.5z" />
  ),
  statistik: (
    <>
      <path d="M3 17h14" />
      <rect x="4.5" y="10" width="3" height="5" />
      <rect x="9" y="6" width="3" height="9" />
      <rect x="13.5" y="12" width="3" height="3" />
    </>
  ),
  simpan: (
    <>
      <path d="M10 3v8" />
      <path d="M6.8 8 10 11.2 13.2 8" />
      <path d="M3.5 13v2.5a1.5 1.5 0 0 0 1.5 1.5h10a1.5 1.5 0 0 0 1.5-1.5V13" />
    </>
  ),
  tulis: (
    <>
      <path d="M3 17h14" />
      <path d="M13.2 3.6a1.7 1.7 0 0 1 2.4 2.4L7.7 13.9l-3.2.8.8-3.2z" />
    </>
  ),
  tukar: (
    <>
      <path d="M3.5 7h11M12 4.5 14.5 7 12 9.5" />
      <path d="M16.5 13h-11M8 10.5 5.5 13 8 15.5" />
    </>
  ),
  ketik: (
    <>
      <rect x="2.5" y="6" width="15" height="9" rx="1.6" />
      <path d="M5.5 9h.01M8 9h.01M10.5 9h.01M13 9h.01M6.5 12h7" />
    </>
  ),
};

/**
 * @param {object}  props
 * @param {string}  props.name    key in SHAPES / ASSETS
 * @param {number} [props.size]   px, applied to both axes
 * @param {string} [props.label]  accessible name; omit for decorative icons
 * @param {string} [props.className]
 */
export default function Icon({ name, size = 20, label, className }) {
  const a11y = label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': 'true' };

  const asset = ASSETS[name];
  if (asset) {
    // Rendered as a CSS mask, not an <img>: the generated art is single-colour
    // line work on transparency, so its alpha channel IS the shape. Masking
    // means colour comes from `currentColor` — icons still respond to the
    // theme (light/dark) exactly like the placeholders did, and the art's own
    // baked-in colour is irrelevant. Swapping to <img> would freeze them.
    const url = `url("${BASE}${asset}")`;
    return (
      <span
        className={className}
        style={{
          display: 'block',
          width: size,
          height: size,
          backgroundColor: 'currentColor',
          WebkitMaskImage: url,
          maskImage: url,
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
          maskPosition: 'center',
          WebkitMaskSize: 'contain',
          maskSize: 'contain',
        }}
        {...a11y}
      />
    );
  }

  const shape = SHAPES[name];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ display: 'block' }}
      {...a11y}
    >
      {shape ?? <rect x="4" y="4" width="12" height="12" rx="3" />}
    </svg>
  );
}
