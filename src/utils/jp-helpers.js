// ─── Furigana / Japanese Text Utilities ──────────────────────────────────────

/**
 * Strip furigana markers from text for clean display.
 * Handles both 《reading》 (Wayground format) and （reading） (CARDS format).
 * Keeps semantic parenthetical content like （石綿）（NFB）（SGP）.
 */
export function stripFuri(text = '') {
  // 1. Strip 《reading》 ruby markers — keep the kanji word, drop the reading
  let t = text.replace(/《[^》]+》/g, '');
  // 2. Strip （）only if content is a pure hiragana reading
  //    Katakana residual = semantic term → keep. Kanji/ASCII → keep.
  t = t.replace(/（([^）]+)）/g, (match, inner) => {
    const residual = inner
      .replace(/[ぁ-んー]/g, '')
      .replace(/\bvs\b/gi, '')
      .replace(/\b[A-Za-z]\b/g, '')
      .replace(/[\u30FB\s\u3000/]/g, '')
      .trim();
    return residual.length === 0 ? '' : match;
  });
  return t.replace(/\s{2,}/g, ' ').trim();
}

/**
 * Extract hiragana/katakana readings from inline furigana markers.
 * Supports both （ふりがな） and 《ふりがな》 formats.
 */
export function extractReadings(text = '') {
  const readings = [];
  // Format 1: full-width （ふりがな） — CARDS and JAC data format
  const re1 = /（([ぁ-んァ-ヴー\u30A0-\u30FFa-zA-Z0-9Ａ-Ｚ・、]+)）/g;
  let m;
  while ((m = re1.exec(text)) !== null) {
    if (/[ぁ-んァ-ヴー]/.test(m[1])) readings.push(m[1]);
  }
  // Format 2: 《ふりがな》 — Wayground data format
  if (readings.length === 0) {
    const re2 = /《([^》]+)》/g;
    while ((m = re2.exec(text)) !== null) {
      if (/[ぁ-んァ-ヴー]/.test(m[1])) readings.push(m[1]);
    }
  }
  return readings.length > 0 ? readings.join('　') : null;
}

/**
 * Normalize furigana for display when showFuri=true.
 * Converts both 《reading》 and duplicate 《reading》（reading） to （reading）.
 * Semantic 《reading》（different content） = keeps both but converts 《》 to （）.
 * Result: clean single-format text using only （reading） notation.
 */
export function standardizeFuri(text = '') {
  // Step 1: same duplicate 《xyz》（xyz） → （xyz）
  let t = text.replace(/《([^》]+)》（\1）/g, '（$1）');
  // Step 2: remaining standalone 《reading》 → （reading）
  t = t.replace(/《([^》]+)》/g, '（$1）');
  return t;
}

/**
 * Detect if string contains Japanese characters (hiragana/katakana/kanji).
 */
export function hasJapanese(s = '') {
  return /[\u3040-\u9FFF]/.test(s);
}

/**
 * Calculate appropriate font size for Japanese text based on length.
 * Returns a number (px) suitable for inline style fontSize.
 */
// item 22: length-based ladder, unrelated to (and not reading) the
// --fs-jp-primary/--fs-jp-back CSS tokens -- JpDisplay is the primary JP
// rendering path in this app and drives its font-size from this function's
// return value via an inline style, not from those custom properties
// directly. Bumping the tokens alone (global.css's 1040px block) would have
// had no visible effect on most real card content. Wide-breakpoint ladder
// mirrors the same per-rung bump chosen for the static tokens (28->30 matches
// --fs-jp-primary, 20->22 matches --fs-jp-back, etc.) so the two scales stay
// in step with each other rather than drifting into two different "how much
// bigger is wide" answers. Checks the same 1040px breakpoint global.css
// uses -- can't literally share the media query from JS, so the number is
// duplicated; if that breakpoint ever moves, this needs to move with it.
function isWideBreakpoint() {
  return typeof window !== 'undefined' && !!window.matchMedia?.('(min-width: 1040px)').matches;
}

export function jpFontSize(text = '') {
  const len = text.length;
  const wide = isWideBreakpoint();
  if (len <= 4) return wide ? 30 : 28;
  if (len <= 8) return wide ? 26 : 24;
  if (len <= 14) return wide ? 22 : 20;
  if (len <= 20) return wide ? 18 : 17;
  if (len <= 30) return wide ? 16 : 15;
  return wide ? 14 : 13;
}

// Shared maxSize ceilings for JpFront in a dense list/grid context (many
// items visible together, where jpFontSize's own upward scaling for short
// strings reads as random size-jumping rather than intentional emphasis --
// see JpFront's maxSize doc comment in JpDisplay.jsx). JP_LIST_MAX is for
// the row's own primary term; JP_LIST_MAX_SECONDARY is for a smaller
// supporting value within that same row (an answer option, a related-card
// preview). Originally introduced ad hoc as 17/15 in SimulasiMode's review
// list and ResultScreen; named here so every later dense-list caller lines
// up with that precedent instead of picking its own number.
export const JP_LIST_MAX = 17;
export const JP_LIST_MAX_SECONDARY = 15;

/**
 * Parse a desc string into a structured object for memoized rendering.
 * @returns {{ branch: 'brackets'|'circled'|'plain', intro: string, items: Array, lines: string[], src: string|null }|null}
 */
export function parseDescStructure(desc = '', maxLines = 0) {
  if (!desc) return null;

  const CIRCLED = '①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮';
  const srcRe = /\s*\([^)]*Sumber[^)]*\)\s*$/;
  const srcMatch = desc.match(srcRe);
  const main = srcMatch ? desc.slice(0, srcMatch.index).trim() : desc.trim();
  const src = srcMatch ? srcMatch[0].trim() : null;

  // Branch A: 【keyword】
  const bracketMatches = [...main.matchAll(/【([^】]+)】/g)];
  if (bracketMatches.length >= 2) {
    const parts = main.split(/(【[^】]+】)/);
    const items = [];
    let intro = '';
    let label = null;
    for (const p of parts) {
      const lm = p.match(/^【([^】]+)】$/);
      if (lm) {
        label = lm[1];
      } else if (label !== null) {
        items.push({ label, body: p.trim() });
        label = null;
      } else {
        intro += p;
      }
    }
    return { branch: 'brackets', intro: intro.trim(), items, src };
  }

  // Branch B: ①②③
  const hasCircled = [...CIRCLED].some((c) => main.includes(c));
  if (hasCircled) {
    const CIDX = Object.fromEntries([...CIRCLED].map((c, i) => [c, i + 1]));
    const tokens = main.split(new RegExp(`(${[...CIRCLED].join('|')})`));
    const items = [];
    let intro = '';
    let cur = null;
    let lastIdx = 0;
    for (const t of tokens) {
      if (t.length === 1 && CIRCLED.includes(t)) {
        const tIdx = CIDX[t];
        if (tIdx > lastIdx) {
          if (cur) items.push(cur);
          cur = { num: t, body: '' };
          lastIdx = tIdx;
        } else {
          if (cur) cur.body += t;
          else intro += t;
        }
      } else if (cur) {
        cur.body += t;
      } else {
        intro += t;
      }
    }
    if (cur) items.push(cur);
    return { branch: 'circled', intro: intro.trim(), items, src };
  }

  // Branch C: plain
  const applyMax = (text) =>
    maxLines
      ? text
          .split(/\n|\\n/)
          .filter(Boolean)
          .slice(0, maxLines)
          .join('\n')
      : text;
  const lines = applyMax(main)
    .split(/\n|\\n/)
    .filter(Boolean);
  return { branch: 'plain', lines, src };
}
