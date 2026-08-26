// ─── scripts/generate-precache.mjs ────────────────────────────────────────
// Items 61 + 62 (2026-08-26): PRECACHE_URLS was hand-written as exactly 2
// entries (the shell), guaranteeing drift from whatever Vite actually
// produces. This reads dist/.vite/manifest.json (enabled in vite.config.js)
// and generates the real list, then injects it into the built dist/sw.js in
// place of the hand-written array in the source file.
//
// Scope decision, made explicit rather than silently: NOT precaching all 21
// lazy mode chunks (weighs total install size against a metered-connection
// audience). Precaching the shell + the three highest-traffic modes --
// kartu (FlashcardMode), ulasan (ReviewMode), kuis (QuizMode) -- per the
// plan's own suggested middle path (docs/UI_UX_PLAN.md item 62). A fresh
// install that goes offline immediately can still study, review, and quiz;
// the other 18 modes remain opportunistically cached on first visit, same
// as before.
//
// Vite's manifest already flattens each entry's transitive imports (verified
// by inspection: QuizMode's `imports` array includes QuizShell, ResultScreen,
// OptionButton etc., not just its direct import), so no separate recursive
// resolution is needed here -- just union each target entry's own file, css,
// and imports.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const distDir = path.join(root, 'dist');
const manifestPath = path.join(distDir, '.vite', 'manifest.json');
const swPath = path.join(distDir, 'sw.js');
const BASE = '/Nugget-Nihongo-SSW-Konstruksi';

const HIGH_TRAFFIC_MODE_ENTRIES = [
  'src/modes/FlashcardMode.jsx', // kartu
  'src/modes/ReviewMode.jsx', // ulasan
  'src/modes/QuizMode.jsx', // kuis
];

const FONT_FILES = [
  'DMSans.woff2',
  'Syne.woff2',
  'NotoSansJP-Regular.woff2',
  'NotoSansJP-Medium.woff2',
  'NotoSansJP-Bold.woff2',
  'NotoSansJP-Black.woff2',
];

function resolveEntryFiles(manifest, key, seen) {
  if (seen.has(key)) return;
  seen.add(key);
  const entry = manifest[key];
  if (!entry) {
    console.warn(`  ! manifest key not found, skipping: ${key}`);
    return;
  }
  if (entry.file) seen.files.add(entry.file);
  if (entry.css) for (const c of entry.css) seen.files.add(c);
  if (entry.imports) for (const imp of entry.imports) resolveEntryFiles(manifest, imp, seen);
}

function main() {
  if (!fs.existsSync(manifestPath)) {
    console.error(`Manifest not found at ${manifestPath} -- did the build run with manifest: true?`);
    process.exit(1);
  }
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

  const files = new Set();
  files.files = files; // small trick so resolveEntryFiles can push into `seen.files`

  const seenKeys = new Set();
  seenKeys.files = files;

  // Main shell entry (index.html itself) — always needed.
  resolveEntryFiles(manifest, 'index.html', seenKeys);

  // The three high-traffic modes.
  for (const key of HIGH_TRAFFIC_MODE_ENTRIES) {
    resolveEntryFiles(manifest, key, seenKeys);
  }

  const assetUrls = [...files].map((f) => `${BASE}/${f}`);
  const fontUrls = FONT_FILES.map((f) => `${BASE}/fonts/${f}`);

  const precacheUrls = [
    `${BASE}/`,
    `${BASE}/index.html`,
    ...assetUrls,
    ...fontUrls,
  ];

  console.log(`Generated PRECACHE_URLS: ${precacheUrls.length} entries`);
  console.log(`  (shell: 2, bundled assets: ${assetUrls.length}, fonts: ${fontUrls.length})`);

  // Inject into the built sw.js, replacing the source file's hand-written
  // array. Match the exact PRECACHE_URLS declaration through its closing
  // `];` so this fails loudly (not silently) if sw.js's shape changes.
  let swContent = fs.readFileSync(swPath, 'utf-8');
  const arrayLiteral = `const PRECACHE_URLS = ${JSON.stringify(precacheUrls, null, 2)};`;
  const pattern = /const PRECACHE_URLS = \[[\s\S]*?\];/;
  if (!pattern.test(swContent)) {
    console.error('Could not find PRECACHE_URLS declaration in built sw.js -- aborting rather than silently failing to precache.');
    process.exit(1);
  }
  swContent = swContent.replace(pattern, arrayLiteral);
  fs.writeFileSync(swPath, swContent);
  console.log(`Injected into ${swPath}`);
}

main();
