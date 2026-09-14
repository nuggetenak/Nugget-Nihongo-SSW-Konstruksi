// ─── tests/genba-phrases.test.js ─────────────────────────────────────────────
// UI_UX_PLAN item 103. Two things live here, and the first one is the reason the
// second one exists.
//
// 1. THE GAP, RE-DERIVED. The plan says the deck teaches terminology and not
//    register: 1,418 vocab cards carry a `usage` sentence and **3** of them are
//    in an imperative or request form. That number is the whole argument for
//    adding a corpus rather than more cards, so it is measured here instead of
//    quoted. If someone rewrites the deck in the spoken register, this test goes
//    red and genba-phrases.js needs re-justifying — which is the correct
//    outcome, not a nuisance.
//
//    Worth knowing about those 3: they are cards 1203-1205, which *describe*
//    the phrases ("when you want it repeated, ask もう一度言ってください").
//    The deck talks about the register in Indonesian. It does not speak it.
//
// 2. THE SHAPE. `speaker` decides which way an entry is drilled, so it decides
//    what kind of string `answer` and `traps` hold: Indonesian actions for a
//    phrase you hear, Japanese phrases for one you say. Nothing about a JS
//    object stops those from being swapped, and a swapped entry would render a
//    perfectly plausible screen offering four Japanese sentences as "what do you
//    do?" — so the split is asserted by character class.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect } from 'vitest';
import { GENBA_PHRASES, GENBA_FUNCTIONS } from '../data/genba-phrases.js';
import { CARDS } from '../data/cards.js';

const strip = (s) => String(s).replace(/《[^》]*》/g, '');
const HAS_JP = /[ぁ-ゟァ-ヺー一-龯]/;
const FN_KEYS = new Set(GENBA_FUNCTIONS.map((f) => f.key));

describe('the gap this corpus exists to fill', () => {
  it('is still there: 3 of the deck’s 1,418 usage sentences are in a request form', () => {
    const REQUEST = /てください|でください|ないで|ましょう|なさい/;
    const withUsage = CARDS.filter((c) => c.type === 'vocab' && c.usage);
    const inRegister = withUsage.filter((c) => REQUEST.test(strip(c.usage)));
    expect(withUsage.length).toBe(1418);
    expect(
      inRegister.length,
      'the deck gained spoken-register usage sentences — re-derive item 103 before trusting this corpus’ premise'
    ).toBe(3);
  });

  it('and this corpus supplies it, in both directions', () => {
    // Not a round number to hit: every entry here is a spoken line by
    // construction. The assertion is that the file has not quietly filled up
    // with dictionary-form sentences like the deck's.
    const heard = GENBA_PHRASES.filter((p) => p.speaker === 'shokucho');
    const said = GENBA_PHRASES.filter((p) => p.speaker === 'sagyouin');
    expect(heard.length).toBeGreaterThanOrEqual(40);
    expect(said.length).toBeGreaterThanOrEqual(40);

    // What a foreman says is plain and clipped; the polite form is the pair.
    // Every heard line carries both, and that pairing is the teaching point.
    for (const p of heard) {
      expect(p.polite, `${p.id} (${p.jp}) has no polite form`).toBeTruthy();
      expect(strip(p.polite)).not.toBe(strip(p.jp));
    }
    // What a worker says is already polite, so there is nothing to pair it with.
    // `polite: null` is the assertion, not an omission.
    for (const p of said) expect(p.polite, `${p.id} (${p.jp}) should have polite: null`).toBeNull();
  });
});

describe('every entry', () => {
  it('has a known function and a known speaker', () => {
    for (const p of GENBA_PHRASES) {
      expect(FN_KEYS.has(p.fn), `${p.id} has unknown fn "${p.fn}"`).toBe(true);
      expect(['shokucho', 'sagyouin']).toContain(p.speaker);
    }
  });

  it('carries the fields a screen needs, with nothing blank', () => {
    for (const p of GENBA_PHRASES) {
      for (const f of ['jp', 'id_text', 'situation', 'note', 'reply']) {
        expect(String(p[f] ?? '').trim(), `${p.id} has empty ${f}`).not.toBe('');
      }
    }
  });

  it('has a unique, stable id', () => {
    const ids = GENBA_PHRASES.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.every((n) => Number.isInteger(n) && n > 0)).toBe(true);
  });

  it('offers exactly three distractors, none of them the answer', () => {
    for (const p of GENBA_PHRASES) {
      expect(p.traps, `${p.id} has ${p.traps?.length} traps`).toHaveLength(3);
      const correct = strip(p.answer ?? p.jp).trim();
      const seen = new Set([correct]);
      for (const t of p.traps) {
        const k = strip(t).trim();
        expect(k, `${p.id} has a blank trap`).not.toBe('');
        expect(seen.has(k), `${p.id} repeats "${k}"`).toBe(false);
        seen.add(k);
      }
    }
  });
});

describe('the two drill directions do not leak into each other', () => {
  it('a phrase you hear offers Indonesian actions, and nothing Japanese', () => {
    for (const p of GENBA_PHRASES.filter((x) => x.speaker === 'shokucho')) {
      expect(p.answer, `${p.id} (${p.jp}) is heard but has no action`).toBeTruthy();
      for (const s of [p.answer, ...p.traps]) {
        expect(
          HAS_JP.test(s),
          `${p.id} offers a Japanese string where an Indonesian action belongs: ${s}`
        ).toBe(false);
      }
    }
  });

  it('a phrase you say offers Japanese phrases, and carries no separate answer', () => {
    for (const p of GENBA_PHRASES.filter((x) => x.speaker === 'sagyouin')) {
      // The correct option is `jp` itself. A second copy in `answer` is a second
      // thing to keep in sync, so the field is absent by design.
      expect(p.answer, `${p.id} duplicates its answer — the correct option is jp`).toBeUndefined();
      for (const s of [p.jp, ...p.traps]) {
        expect(HAS_JP.test(s), `${p.id} offers a non-Japanese option: ${s}`).toBe(true);
      }
    }
  });
});

describe('the function registry', () => {
  it('covers all seven, each with entries', () => {
    expect(GENBA_FUNCTIONS).toHaveLength(7);
    for (const f of GENBA_FUNCTIONS) {
      const n = GENBA_PHRASES.filter((p) => p.fn === f.key).length;
      expect(n, `${f.key} has ${n} entries`).toBeGreaterThanOrEqual(10);
      for (const k of ['label', 'id_label', 'emoji', 'desc', 'speaker']) {
        expect(String(f[k] ?? '').trim(), `${f.key} has empty ${k}`).not.toBe('');
      }
    }
  });

  it('declares each function’s direction, and its entries agree', () => {
    for (const f of GENBA_FUNCTIONS) {
      const speakers = new Set(GENBA_PHRASES.filter((p) => p.fn === f.key).map((p) => p.speaker));
      if (f.speaker === 'mixed') {
        // Handover runs both ways. Declared, so a one-sided 引き継ぎ set reads as
        // incomplete rather than as the design.
        expect(speakers.size, `${f.key} is declared mixed but is one-directional`).toBe(2);
      } else {
        expect([...speakers], `${f.key} is declared ${f.speaker}`).toEqual([f.speaker]);
      }
    }
  });
});
