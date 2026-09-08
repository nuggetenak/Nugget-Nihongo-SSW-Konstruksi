// ─── tests/flashcard-filter-reason.test.jsx ──────────────────────────────────
// The filtered-deck banner used to be gated on `filterIds` alone, so every
// filtered entry into `kartu` was labelled "❌ Latihan kartu salah" in the
// wrong-answer colour. That was already untrue for SumberMode -- browsing a
// PDF source's cards showed "❌ Latihan kartu salah · 49 kartu" -- and it would
// be untrue for a "Terakhir dipelajari" row too. DESIGN_SPEC §2: --ssw-wrong
// means a wrong answer, not a filtered deck.
//
// Tested at the map and the router rather than by rendering FlashcardMode with
// filterIds, because that render hangs under jsdom -- on `main` as well as
// here, so it is pre-existing and not something this change introduced. It is
// also the reason this bug survived: `filterIds` is the one prop that makes the
// banner appear, and no test could set it. Filed separately.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { FILTER_BANNERS } from '../modes/FlashcardMode/index.jsx';

describe('the filtered-deck banner vocabulary', () => {
  it('covers every reason ModeRouter can pass', () => {
    expect(Object.keys(FILTER_BANNERS).sort()).toEqual(['recent', 'sumber', 'wrong']);
  });

  it('reserves the wrong-answer tone for actual wrong answers', () => {
    expect(FILTER_BANNERS.wrong.tone).toBe('wrong');
    expect(FILTER_BANNERS.recent.tone).toBe('neutral');
    expect(FILTER_BANNERS.sumber.tone).toBe('neutral');
  });

  it('says something true in Indonesian for each', () => {
    expect(FILTER_BANNERS.wrong.text).toMatch(/salah/i);
    expect(FILTER_BANNERS.recent.text).toMatch(/Terakhir dipelajari/i);
    expect(FILTER_BANNERS.sumber.text).toMatch(/sumber/i);
  });
});

describe('how callers reach it', () => {
  const router = readFileSync(resolve(process.cwd(), 'src/router/ModeRouter.jsx'), 'utf8');
  const sumber = readFileSync(resolve(process.cwd(), 'src/modes/SumberMode.jsx'), 'utf8');

  it("defaults to 'wrong', so the eight retry-wrong call sites are unchanged", () => {
    // Source-read rather than a render, same technique srs-orphans.test.js uses
    // to assert a call-site convention.
    expect(router).toMatch(/filterReason:\s*modeParams\?\.filterReason\s*\?\?\s*'wrong'/);
  });

  it('SumberMode says it is a source browse, not a wrong-answer drill', () => {
    expect(sumber).toMatch(/filterReason:\s*'sumber'/);
  });

  it('every onRetryWrong bridge still passes only filterIds, inheriting the default', () => {
    const bridges = router.match(/goMode\('kartu',\s*\{\s*filterIds:\s*ids\s*\}\)/g) ?? [];
    expect(bridges.length).toBeGreaterThanOrEqual(8);
  });
});
