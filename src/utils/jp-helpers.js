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
 * Whether text is Japanese *enough* to warrant Japanese-specific typography
 * (CJK font, center alignment, jpFontSize's length-based auto-scaling) --
 * ratio-based rather than hasJapanese()'s plain presence check, because
 * several real call sites hand JpFront content that isn't uniformly one
 * language: a mostly-Japanese term can carry a short Indonesian aside
 * (rare), and more commonly, several modes' shared ResultScreen slots
 * (ConfusionMode's Indonesian definitions, AngkaMode's mostly-Indonesian
 * konteks sentences) carry an
 * Indonesian sentence with at most an incidental parenthetical JP term.
 * hasJapanese() alone would wrongly route the second group into full
 * Japanese styling over one matching character. 0.4 chosen by checking real
 * examples of both populations: genuine card.jp content (even
 * hiragana/particle-heavy natural sentences) sits at 50-100%; the
 * Indonesian-dominant cases found in the shipped app sit at 0-16%. Plenty
 * of headroom either side of the boundary, not a knife-edge tuning.
 *
 * **A 《》 reading marker settles it before the ratio is consulted** (item 116).
 * The headroom claimed above turned out not to be empty: nine shipped cards sit
 * at 25-33% and were being routed to plain Indonesian body text --
 * `CD管《かん》`, `PC杭《ぐい》`, `PHC杭《ぐい》`, `RC造《ぞう》`, `SRC造《ぞう》`,
 * `PF管《かん》`, `CB造《ぞう》`, `土留め《どどめ》≥ 1.5m`, `CT / VCT（移動用電線）`.
 * They are <latin abbreviation>+<kanji> construction terms, and the latin half
 * is what drags the ratio down. The bail-out renders the *stripped* string, so
 * `CD管《かん》` displayed as `CD管` with no reading at all -- suppressing the one
 * thing a learner cannot supply for 管 (pipe), 杭 (pile), 造 (construction), and
 * tagging it `lang="id"` for a screen reader on top.
 *
 * The fix is deliberately not a lower threshold: 0.25 would drag the
 * Indonesian-sentence population it exists to catch back over the line. A
 * reading marker, by contrast, only ever appears on Japanese text, so keying on
 * it cannot produce a false positive on an Indonesian sentence. These nine had
 * been misrendering since the guard was introduced -- not since 7.1.0's ruby
 * fix shortened their readings, which looks like the cause and is not:
 * `stripFuri` runs before the ratio, so the reading's length never entered it.
 *
 * Takes the ORIGINAL text and strips internally, so the marker is still there
 * to see. Callers must not pre-strip.
 */
export function isMeaningfullyJapanese(s = '', threshold = 0.4) {
  if (!s) return true; // nothing to disqualify -- let normal handling apply
  if (/《[^》]+》/.test(s)) return true; // carries a reading: Japanese by definition
  const clean = stripFuri(s);
  if (!clean) return true;
  const jpChars = (clean.match(/[\u3040-\u9FFF]/g) || []).length;
  return jpChars / clean.length >= threshold;
}

/**
 * Calculate appropriate font size for Japanese text based on length.
 * Returns a number (px) suitable for inline style fontSize.
 */
// item 22: length-based ladder, unrelated to (and not reading) the --fs-jp-*
// CSS tokens -- JpDisplay is the primary JP rendering path in this app and
// drives its font-size from this function's return value via an inline style,
// not from those custom properties directly. Bumping the tokens alone
// (global.css's 1040px block) would have had no visible effect on most real
// card content. Wide-breakpoint ladder mirrors the same per-rung bump chosen
// for the static tokens (20->22 matches --fs-jp-back, and the top rung's
// 28->30 matched the --fs-jp-primary that used to sit beside it) so the two
// scales stay in step with each other rather than drifting into two different
// "how much bigger is wide" answers.
//
// item 171: --fs-jp-primary is gone. It was declared, it read as the token that
// sizes a flashcard's Japanese, and no rule anywhere referenced it -- the size
// it claimed to own has always come from the ladder below. Adopting it would
// have given one size two owners, which is the drift this header already warns
// about; deleting it leaves the ladder as the single answer. Checks the same 1040px breakpoint global.css
// uses -- can't literally share the media query from JS, so the number is
// duplicated; if that breakpoint ever moves, this needs to move with it.
function isWideBreakpoint() {
  return typeof window !== 'undefined' && !!window.matchMedia?.('(min-width: 1040px)').matches;
}

/**
 * How much the reader has asked to enlarge text, as a multiplier, floored at 1.
 *
 * ── item 170 ────────────────────────────────────────────────────────────────
 * The Ukuran Teks control works by setting a PERCENTAGE on the root font-size,
 * which is what every rem in the app resolves against. The ladder below returns
 * bare numbers that JpDisplay applies as an inline `fontSize`, and px does not
 * resolve against anything -- so Besar and Sangat Besar enlarged every label,
 * button, heading and Indonesian gloss in the app and left the JAPANESE exactly
 * where it was. On the flashcard front. On every quiz stem. In every glossary
 * entry. The one piece of content the control exists for, on an app whose own
 * setting copy promises "Semua tulisan {pct}% dari ukuran normal".
 *
 * Furigana rode along with it: `.ruby rt` is `max(0.5em, 0.6875rem)`, and that
 * `em` is relative to this same fixed px.
 *
 * ── why it only scales UP ───────────────────────────────────────────────────
 * `max(1, ...)`, deliberately, and this is the part worth reading before
 * "fixing" it to be symmetric. The default is `kecil` (90%) -- an owner
 * decision, recorded in text-scale.js -- so scaling both ways would shrink
 * every flashcard headword from 30px to 27px for every existing reader who has
 * never touched the setting. This repo already fought that battle once: a
 * census found 85% of the app's text at 13px or below and called it "the app's
 * largest usability problem", and the note in text-scale.js observes that 13px
 * of CJK is not comparable to 13px of Latin, because a kanji carries far more
 * strokes in the same box.
 *
 * So: up closes the gap for the readers who asked, down changes nothing for
 * anyone who did not. `jp-text-scale.test.js` asserts both directions, and the
 * Kecil case is the one that fails loudly if this is ever made symmetric by
 * accident.
 *
 * Read from the DOM rather than taken as an argument because applyTextScale()
 * has already written it there -- the same reason utils/motion.js can answer a
 * question about user preference without a React dependency.
 */
function textScaleFactor() {
  if (typeof document === 'undefined') return 1;
  const pct = parseFloat(document.documentElement.style.fontSize);
  if (!Number.isFinite(pct) || pct <= 0) return 1;
  return Math.max(1, pct / 100);
}

export function jpFontSize(text = '') {
  const len = text.length;
  const wide = isWideBreakpoint();
  const base =
    len <= 4
      ? wide
        ? 34
        : 30
      : len <= 8
        ? wide
          ? 30
          : 27
        : len <= 14
          ? wide
            ? 25
            : 23
          : len <= 20
            ? wide
              ? 21
              : 20
            : len <= 30
              ? wide
                ? 19
                : 18
              : wide
                ? 18
                : 17;
  // Rounded so the value stays a whole px: a fractional inline font-size is
  // legal but makes the furigana `max(0.5em, ...)` floor land unpredictably
  // between rungs.
  return Math.round(base * textScaleFactor());
}

// Raised across the board 2026-09-04, along with the ladder above. The old
// floor was 13px, and 13px of CJK is not comparable to 13px of Latin — a kanji
// carries far more strokes in the same box, so it needs more size for the same
// legibility, and this app's readers are looking at it on cheap phones,
// outdoors. The floor is now 17px, and the ceilings below moved with it so a
// list row's term doesn't end up smaller than the body text beside it. 19/17
// rather than the 21/19 first tried: at 21 a long term in an accordion row that
// also carries a category badge wrapped to three lines, which costs more
// legibility than the extra 2px buys.
//
// Shared maxSize ceilings for JpFront in a dense list/grid context (many
// items visible together, where jpFontSize's own upward scaling for short
// strings reads as random size-jumping rather than intentional emphasis --
// see JpFront's maxSize doc comment in JpDisplay.jsx). JP_LIST_MAX is for
// the row's own primary term; JP_LIST_MAX_SECONDARY is for a smaller
// supporting value within that same row (an answer option, a related-card
// preview). Originally introduced ad hoc as 17/15 in SimulasiMode's review
// list and ResultScreen; named here so every later dense-list caller lines
// up with that precedent instead of picking its own number.
export const JP_LIST_MAX = 19;
export const JP_LIST_MAX_SECONDARY = 17;

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
