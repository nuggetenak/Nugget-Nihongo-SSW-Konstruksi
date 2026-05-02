#!/usr/bin/env node
// ─── scripts/curate-cards.js ──────────────────────────────────────────────────
// Automated card quality fixes based on exhaustive audit (2026-05-02).
//
// Issues addressed:
//   1. Strip (Sumber: ...) from desc — 656 cards
//   2. Remove exact duplicate cards — 28 pairs (keep better desc)
//   3. Clean jp field: move — / → explanations to desc
//   4. Clean id_text: remove Japanese chars, truncate
//   5. Clean jp: split compound terms with excessive parentheticals
//   6. Remove Indonesian from jp field
//
// Usage:
//   node scripts/curate-cards.js          → dry run
//   node scripts/curate-cards.js --apply  → write to cards.js
// ─────────────────────────────────────────────────────────────────────────────

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const cardsPath = join(__dirname, '..', 'src', 'data', 'cards.js');

const { CARDS } = await import('../src/data/cards.js');

let stats = { source_stripped: 0, dupes_removed: 0, jp_cleaned: 0, id_cleaned: 0, total_fixes: 0 };

// ── 1. Identify duplicates (keep card with better desc) ──────────────────
const jpSeen = new Map();
const dupeIds = new Set();

CARDS.forEach(c => {
  const jp = c.jp?.trim();
  if (jpSeen.has(jp)) {
    const origId = jpSeen.get(jp);
    const orig = CARDS.find(x => x.id === origId);
    // Keep whichever has longer desc
    if ((c.desc?.length || 0) > (orig.desc?.length || 0)) {
      dupeIds.add(origId); // drop the original, keep this one
      jpSeen.set(jp, c.id);
    } else {
      dupeIds.add(c.id); // drop this one
    }
  } else {
    jpSeen.set(jp, c.id);
  }
});

stats.dupes_removed = dupeIds.size;

// ── 2. Process each card ─────────────────────────────────────────────────
const cleaned = CARDS.filter(c => !dupeIds.has(c.id)).map(c => {
  const card = { ...c };
  let changed = false;

  // 2a. Strip (Sumber: ...) from desc
  if (card.desc && /\(Sumber:/.test(card.desc)) {
    card.desc = card.desc.replace(/\s*\(Sumber:[^)]*\)/g, '').trim();
    stats.source_stripped++;
    changed = true;
  }

  // 2b. Clean jp: remove — explanation suffix
  // e.g. "施工管理 — 所定の品質" → jp:"施工管理", append "所定の品質" to desc
  if (card.jp && /\s*[—→]\s*/.test(card.jp)) {
    const parts = card.jp.split(/\s*[—→]\s*/);
    if (parts.length === 2 && parts[0].length >= 2) {
      const mainTerm = parts[0].trim();
      const explanation = parts[1].trim();
      // Only split if main term is short enough to be a real term
      if (mainTerm.length <= 25 && explanation.length > 0) {
        card.jp = mainTerm;
        // Prepend explanation to desc if not already there
        if (card.desc && !card.desc.includes(explanation.slice(0, 10))) {
          card.desc = explanation + '。' + card.desc;
        }
        stats.jp_cleaned++;
        changed = true;
      }
    }
  }

  // 2c. Clean id_text: remove Japanese characters (move to desc if significant)
  if (card.id_text && /[ぁ-ん]|[ァ-ヶ]|[一-龥]/.test(card.id_text)) {
    // Remove Japanese text in parentheses: (漢字) or （漢字）
    card.id_text = card.id_text
      .replace(/[（(][ぁ-んァ-ヶ一-龥\s・]+[）)]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    stats.id_cleaned++;
    changed = true;
  }

  // 2d. Remove Indonesian from jp field
  if (card.jp && /perbedaan kunci/i.test(card.jp)) {
    card.jp = card.jp.replace(/\s*—?\s*perbedaan kunci/gi, '').trim();
    stats.jp_cleaned++;
    changed = true;
  }

  if (changed) stats.total_fixes++;
  return card;
});

// ── 3. Report ────────────────────────────────────────────────────────────
console.log('=== CURATION RESULTS ===');
console.log('Input cards:', CARDS.length);
console.log('Output cards:', cleaned.length, '(removed', dupeIds.size, 'duplicates)');
console.log('Source refs stripped:', stats.source_stripped);
console.log('JP fields cleaned:', stats.jp_cleaned);
console.log('ID_TEXT JP chars removed:', stats.id_cleaned);
console.log('Total cards modified:', stats.total_fixes);

if (dupeIds.size > 0) {
  console.log('\nRemoved duplicate IDs:', [...dupeIds].join(', '));
}

// ── 4. Apply ─────────────────────────────────────────────────────────────
if (process.argv.includes('--apply')) {
  // Rebuild the file
  const header = `// SSW Flashcards: All Cards — Content Architecture v2
// ${cleaned.length} cards across ${new Set(cleaned.map(c=>c.category)).size} categories
// Curated: source refs stripped, duplicates removed, jp/id_text cleaned
// Last curated: ${new Date().toISOString().slice(0,10)}

export const CARDS = [\n`;

  const cardLines = cleaned.map(c => {
    // Escape any quotes in string values
    const esc = (s) => s?.replace(/\\/g, '\\\\').replace(/"/g, '\\"') || '';
    const fields = [
      `id: ${c.id}`,
      `category: "${esc(c.category)}"`,
      `source: "${esc(c.source)}"`,
      `furi: "${esc(c.furi)}"`,
      `jp: "${esc(c.jp)}"`,
      `romaji: "${esc(c.romaji)}"`,
      `id_text: "${esc(c.id_text)}"`,
      `desc: "${esc(c.desc)}"`,
    ];
    return '  { ' + fields.join(', ') + ' },';
  });

  const output = header + cardLines.join('\n') + '\n];\n';
  writeFileSync(cardsPath, output, 'utf-8');
  console.log('\n✅ Written to', cardsPath);
} else {
  console.log('\nDry run. Use --apply to write.');
}
