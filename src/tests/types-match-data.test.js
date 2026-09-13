// ─── tests/types-match-data.test.js ──────────────────────────────────────────
// `src/types.js` is JSDoc, so nothing enforces it and nothing imports it. It had
// therefore drifted into describing shapes the app does not use: `Card.id` as a
// string when ids are numbers and must be (`recordWrong` drops a non-integer id),
// a `Card.furi` field no card has ever carried, and a pre-FSRS `SRSState` with
// `interval`/`repetitions`/numeric `due`. An external audit found it, which is the
// wrong way to find it: documentation that contradicts the code is worse than none,
// because the next author trusts it and writes a bug the runtime silently swallows.
//
// This asserts the claims that actually went wrong, against the shipped data and the
// real serializer. It cannot check every field of every typedef — that would need a
// type checker, which this repo deliberately does not have — but it holds the three
// facts a reader would be misled about, and any future edit to those typedefs has to
// come here too.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { CARDS } from '../data/cards.js';
import { createCard } from '../srs/fsrs-core.js';

const TYPES_SRC = readFileSync(resolve(process.cwd(), 'src/types.js'), 'utf8');

describe('types.js Card matches the shipped cards', () => {
  it('declares id as a number, because it is one', () => {
    expect(new Set(CARDS.map((c) => typeof c.id))).toEqual(new Set(['number']));
    expect(TYPES_SRC).toMatch(/id: number,/);
    expect(TYPES_SRC).not.toMatch(/id: string,/);
  });

  it('does not declare a field no card carries', () => {
    // `furi` is a JpFront prop supplied by a caller, not card data. Zero of 1,626.
    expect(CARDS.filter((c) => 'furi' in c)).toHaveLength(0);
    expect(TYPES_SRC).not.toMatch(/\bfuri: string/);
  });

  it('declares every field the cards actually have', () => {
    const real = new Set();
    for (const c of CARDS) for (const k of Object.keys(c)) real.add(k);
    for (const k of real) {
      expect(TYPES_SRC, `types.js does not mention the card field \`${k}\``).toMatch(
        new RegExp(`\\b${k}\\??:`)
      );
    }
  });
});

describe('types.js SerializedFSRSCard matches what the scheduler writes', () => {
  it('names exactly the fields serializeCard produces', () => {
    const card = createCard(new Date('2026-09-13T00:00:00.000Z'));
    const block = TYPES_SRC.slice(
      TYPES_SRC.indexOf('SerializedFSRSCard') - 700,
      TYPES_SRC.indexOf('}} SerializedFSRSCard')
    );
    for (const k of Object.keys(card)) {
      expect(block, `SerializedFSRSCard is missing \`${k}\``).toMatch(new RegExp(`\\b${k}:`));
    }
    // And the pre-FSRS names are gone, not merely joined by the new ones.
    for (const stale of ['interval', 'repetitions', 'lastRating', 'cardId']) {
      expect(TYPES_SRC, `types.js still describes the pre-FSRS \`${stale}\``).not.toMatch(
        new RegExp(`\\b${stale}:`)
      );
    }
  });

  it('stores due as an ISO string, which is why the typedef says string', () => {
    const card = createCard(new Date('2026-09-13T00:00:00.000Z'));
    expect(typeof card.due).toBe('string');
    expect(Number.isFinite(Date.parse(card.due))).toBe(true);
  });
});
