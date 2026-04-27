// ─── Furigana / Japanese Text Utilities ──────────────────────────────────────

/**
 * Strip furigana markers from text for clean display.
 * Handles both 《reading》 (Wayground format) and （reading） (CARDS format).
 * Keeps semantic parenthetical content like （石綿）（NFB）（SGP）.
 */
export function stripFuri(text = "") {
  // 1. Strip 《reading》 ruby markers — keep the kanji word, drop the reading
  let t = text.replace(/《[^》]+》/g, "");
  // 2. Strip （）only if content is a pure hiragana reading
  //    Katakana residual = semantic term → keep. Kanji/ASCII → keep.
  t = t.replace(/（([^）]+)）/g, (match, inner) => {
    const residual = inner
      .replace(/[ぁ-んー]/g, "")
      .replace(/\bvs\b/gi, "")
      .replace(/\b[A-Za-z]\b/g, "")
      .replace(/[・\s　/]/g, "")
      .trim();
    return residual.length === 0 ? "" : match;
  });
  return t.replace(/\s{2,}/g, " ").trim();
}

/**
 * Extract hiragana/katakana readings from inline furigana markers.
 * Supports both （ふりがな） and 《ふりがな》 formats.
 */
export function extractReadings(text = "") {
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
  return readings.length > 0 ? readings.join("　") : null;
}

/**
 * Detect if string contains Japanese characters (hiragana/katakana/kanji).
 */
export function hasJapanese(s = "") {
  return /[\u3040-\u9FFF]/.test(s);
}

/**
 * Calculate appropriate font size for Japanese text based on length.
 * Returns a number (px) suitable for inline style fontSize.
 */
export function jpFontSize(text = "") {
  const len = text.length;
  if (len <= 4)  return 28;
  if (len <= 8)  return 24;
  if (len <= 14) return 20;
  if (len <= 20) return 17;
  if (len <= 30) return 15;
  return 13;
}
