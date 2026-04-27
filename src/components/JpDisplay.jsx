import { T } from "../styles/theme.js";
import { stripFuri, extractReadings, hasJapanese, jpFontSize } from "../utils/jp-helpers.js";

/**
 * Japanese text front display — adaptive sizing for kanji + reading.
 */
export function JpFront({ jp = "", furi, romaji }) {
  const clean = stripFuri(jp);
  const reading = furi || extractReadings(jp);
  const fs = jpFontSize(clean);

  // Check if the jp contains separate lines (e.g., title + subtitle)
  const parts = clean.split(/[（）]/g).filter(Boolean);

  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: fs, fontWeight: 700, fontFamily: T.fontJP, lineHeight: 1.4, marginBottom: 4 }}>
        {clean}
      </div>
      {reading && (
        <div style={{ fontSize: 12, color: T.textMuted, fontFamily: T.fontJP, marginBottom: 2 }}>
          {reading}
        </div>
      )}
      {romaji && (
        <div style={{ fontSize: 11, color: T.textDim, fontStyle: "italic" }}>
          {romaji}
        </div>
      )}
    </div>
  );
}

/**
 * Description block — renders Indonesian explanation with line breaks.
 */
export function DescBlock({ desc = "", maxLines = 0 }) {
  if (!desc) return null;
  const lines = desc.split(/\n|\\n/).filter(Boolean);
  const show = maxLines > 0 ? lines.slice(0, maxLines) : lines;

  return (
    <div style={{ fontSize: 13, lineHeight: 1.65, color: T.textMuted }}>
      {show.map((line, i) => (
        <p key={i} style={{ marginBottom: i < show.length - 1 ? 6 : 0 }}>
          {line}
        </p>
      ))}
    </div>
  );
}
