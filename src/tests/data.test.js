import { describe, it, expect } from 'vitest';
import { CARDS } from '../data/cards.js';
import { JAC_OFFICIAL } from '../data/jac-official.js';
import { WAYGROUND_SETS } from '../data/wayground-sets.js';
import { CSV_SETS } from '../data/csv-sets.js';
import { ANGKA_KUNCI } from '../data/angka-kunci.js';
import { DANGER_PAIRS } from '../data/danger-pairs.js';
import { CATEGORIES, getCatsForTrack, VOCAB_SOURCES } from '../data/categories.js';

describe('CARDS data integrity', () => {
  it('has at least 1400 cards', () => expect(CARDS.length).toBeGreaterThanOrEqual(1400));

  it('all IDs sequential 1-N no gaps', () => {
    const ids = CARDS.map((c) => c.id).sort((a, b) => a - b);
    ids.forEach((id, i) => expect(id, `expected ${i + 1} got ${id}`).toBe(i + 1));
  });

  it('no duplicate IDs', () => {
    const ids = CARDS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every card has required non-empty fields', () => {
    const REQ = ['id', 'category', 'source', 'jp', 'romaji', 'id_text', 'desc'];
    const bad = CARDS.filter((c) => REQ.some((f) => !c[f] && c[f] !== 0));
    expect(bad.map((c) => c.id)).toHaveLength(0);
  });

  it('every card has furi field (Phase 1)', () => {
    const bad = CARDS.filter((c) => c.furi == null);
    expect(bad.map((c) => c.id)).toHaveLength(0);
  });

  it('all categories valid', () => {
    const valid = new Set(CATEGORIES.map((c) => c.key));
    expect(CARDS.filter((c) => !valid.has(c.category)).map((c) => c.id)).toHaveLength(0);
  });

  it('all sources canonical (no old text1l/lifeline4/vocab_jac)', () => {
    const OLD = [
      'text1l',
      'text2',
      'text3',
      'text4',
      'text5l',
      'text6l',
      'text7l',
      'lifeline4',
      'vocab_jac',
      'vocab_core',
      'vocab_exam',
      'vocab_teori',
      'tt_sample',
      'st_sample_l',
    ];
    expect(CARDS.filter((c) => OLD.includes(c.source)).map((c) => c.id)).toHaveLength(0);
  });

  it('no Devanagari in romaji (Phase 1 typo fix)', () => {
    expect(
      CARDS.filter((c) => c.romaji && /[\u0900-\u097F]/.test(c.romaji)).map((c) => c.id)
    ).toHaveLength(0);
  });
});

describe('JAC_OFFICIAL data integrity', () => {
  it('has at least 50 questions', () => expect(JAC_OFFICIAL.length).toBeGreaterThan(50));

  it('all answers 0-based and in range', () => {
    JAC_OFFICIAL.forEach((q) => {
      expect(q.answer).toBeGreaterThanOrEqual(0);
      expect(q.answer).toBeLessThan(q.options.length);
    });
  });

  it('every question has 2+ options', () => {
    expect(
      JAC_OFFICIAL.filter((q) => !Array.isArray(q.options) || q.options.length < 2)
    ).toHaveLength(0);
  });

  it('all sets are tt1/tt2/st1/st2', () => {
    const VALID = new Set(['tt1', 'tt2', 'st1', 'st2']);
    expect(JAC_OFFICIAL.filter((q) => !VALID.has(q.set)).map((q) => q.id)).toHaveLength(0);
  });
});

describe('WAYGROUND_SETS data integrity', () => {
  it('has at least 12 sets', () => expect(WAYGROUND_SETS.length).toBeGreaterThanOrEqual(12));

  it('every set has id, title, non-empty questions', () => {
    WAYGROUND_SETS.forEach((s) => {
      expect(s.id).toBeTruthy();
      expect(s.title).toBeTruthy();
      expect(s.questions.length).toBeGreaterThan(0);
    });
  });

  it('all ans values 0-based and in range', () => {
    WAYGROUND_SETS.forEach((s) =>
      s.questions.forEach((q) => {
        expect(q.ans).toBeGreaterThanOrEqual(0);
        expect(q.ans).toBeLessThan(q.opts.length);
      })
    );
  });

  it('wt1 Q5 removed (Phase 1 duplicate fix)', () => {
    const wt1 = WAYGROUND_SETS.find((s) => s.id === 'wt1');
    expect(wt1).toBeDefined();
    expect(wt1.questions.length).toBeLessThan(20);
  });

  it('no set has duplicate question IDs', () => {
    WAYGROUND_SETS.forEach((s) => {
      const ids = s.questions.map((q) => q.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  it('wg9, wg11 now complete (Phase 12 OCR fix)', () => {
    const wg9 = WAYGROUND_SETS.find((s) => s.id === 'wg9');
    const wg11 = WAYGROUND_SETS.find((s) => s.id === 'wg11');
    expect(wg9).toBeDefined();
    expect(wg9.questions.length).toBeGreaterThan(10);
    expect(wg11).toBeDefined();
    expect(wg11.questions.length).toBeGreaterThan(10);
    // Verify no placeholder questions remain
    const placeholders = [...(wg9?.questions ?? []), ...(wg11?.questions ?? [])].filter(
      (q) => !q.q || q.q.trim() === ''
    );
    expect(placeholders).toHaveLength(0);
  });

  it('all vocab sets (wg*) have non-empty q and opts', () => {
    WAYGROUND_SETS.filter((s) => s.id.startsWith('wg')).forEach((s) => {
      s.questions.forEach((q) => {
        expect(q.q, `${s.id} q${q.id} missing q`).toBeTruthy();
        expect(q.opts.length, `${s.id} q${q.id} needs 3 opts`).toBeGreaterThanOrEqual(3);
      });
    });
  });
});

describe('CSV_SETS data integrity', () => {
  it('has exactly 12 sets', () => expect(CSV_SETS.length).toBe(12));

  it('total questions equals 300', () => {
    const total = CSV_SETS.reduce((n, s) => n + s.questions.length, 0);
    expect(total).toBe(300);
  });

  it('every set has id, title, non-empty questions', () => {
    CSV_SETS.forEach((s) => {
      expect(s.id).toBeTruthy();
      expect(s.title).toBeTruthy();
      expect(s.questions.length).toBeGreaterThan(0);
    });
  });

  it('set IDs follow ct## or cp## pattern', () => {
    const valid = /^c[tp]\d{2}$/;
    CSV_SETS.forEach((s) => {
      expect(valid.test(s.id), `invalid id: ${s.id}`).toBe(true);
    });
  });

  it('all ans values 0-based and in range (4-choice A-D)', () => {
    CSV_SETS.forEach((s) =>
      s.questions.forEach((q) => {
        expect(q.ans).toBeGreaterThanOrEqual(0);
        expect(q.ans).toBeLessThanOrEqual(3);
        expect(q.ans).toBeLessThan(q.opts.length);
      })
    );
  });

  it('every question has 4 options', () => {
    const bad = CSV_SETS.flatMap((s) =>
      s.questions.filter((q) => q.opts.length !== 4).map((q) => `${s.id}-q${q.id}`)
    );
    expect(bad).toHaveLength(0);
  });

  it('no set has duplicate question IDs', () => {
    CSV_SETS.forEach((s) => {
      const ids = s.questions.map((q) => q.id);
      expect(new Set(ids).size, `${s.id} has duplicate q IDs`).toBe(ids.length);
    });
  });

  it('6 teori sets (ct01-ct06) with 30qs each', () => {
    const teori = CSV_SETS.filter((s) => s.id.startsWith('ct'));
    expect(teori.length).toBe(6);
    teori.forEach((s) => expect(s.questions.length).toBe(30));
  });

  it('6 praktik sets (cp01-cp06) with 20qs each', () => {
    const praktik = CSV_SETS.filter((s) => s.id.startsWith('cp'));
    expect(praktik.length).toBe(6);
    praktik.forEach((s) => expect(s.questions.length).toBe(20));
  });

  it('every question has non-empty q and hint', () => {
    const bad = CSV_SETS.flatMap((s) =>
      s.questions.filter((q) => !q.q || !q.hint).map((q) => `${s.id}-q${q.id}`)
    );
    expect(bad).toHaveLength(0);
  });
});

describe('ANGKA_KUNCI', () => {
  it('has at least 10 entries', () => expect(ANGKA_KUNCI.length).toBeGreaterThan(10));

  it('every entry has angka and konteks', () => {
    ANGKA_KUNCI.forEach((a, i) => {
      expect(a.angka, `entry ${i} missing angka`).toBeTruthy();
      expect(a.konteks, `entry ${i} missing konteks`).toBeTruthy();
    });
  });
});

describe('DANGER_PAIRS', () => {
  it('has at least 5 entries', () => expect(DANGER_PAIRS.length).toBeGreaterThan(5));

  it('every entry has term, correct, traps[]', () => {
    DANGER_PAIRS.forEach((d, i) => {
      expect(d.term, `entry ${i} missing term`).toBeTruthy();
      expect(d.correct, `entry ${i} missing correct`).toBeTruthy();
      expect(Array.isArray(d.traps), `entry ${i} traps not array`).toBe(true);
    });
  });
});

describe('CATEGORIES', () => {
  it('includes all and bintang', () => {
    const keys = CATEGORIES.map((c) => c.key);
    expect(keys).toContain('all');
    expect(keys).toContain('bintang');
  });

  it('non-special categories have tracks[]', () => {
    CATEGORIES.filter((c) => c.key !== 'all' && c.key !== 'bintang').forEach((c) => {
      expect(Array.isArray(c.tracks), `${c.key} missing tracks`).toBe(true);
    });
  });

  it('VOCAB_SOURCES use canonical names', () => {
    const OLD = ['lifeline4', 'vocab_jac', 'vocab_core', 'vocab_exam', 'vocab_teori'];
    VOCAB_SOURCES.forEach((s) => expect(OLD).not.toContain(s));
  });
});

describe('getCatsForTrack', () => {
  const TRACKS = ['doboku', 'kenchiku', 'lifeline'];

  it('returns non-empty array for every valid track', () => {
    TRACKS.forEach((t) => {
      const cats = getCatsForTrack(t);
      expect(cats.length, `${t} returned 0 cats`).toBeGreaterThan(0);
    });
  });

  it('never includes "all" or "bintang" in results', () => {
    TRACKS.forEach((t) => {
      const cats = getCatsForTrack(t);
      expect(cats).not.toContain('all');
      expect(cats).not.toContain('bintang');
    });
  });

  it('all returned keys exist in CATEGORIES', () => {
    const validKeys = new Set(CATEGORIES.map((c) => c.key));
    TRACKS.forEach((t) => {
      getCatsForTrack(t).forEach((key) => {
        expect(validKeys.has(key), `unknown key "${key}" for track ${t}`).toBe(true);
      });
    });
  });

  it('each track actually filters cards (cards.category ∈ getCatsForTrack result)', () => {
    TRACKS.forEach((t) => {
      const cats = new Set(getCatsForTrack(t));
      const trackCards = CARDS.filter((c) => cats.has(c.category));
      expect(trackCards.length, `no cards for track ${t}`).toBeGreaterThan(0);
    });
  });

  it('returns empty array for unknown track', () => {
    expect(getCatsForTrack('nonexistent')).toEqual([]);
  });

  it('tracks have category overlap (common categories appear in multiple tracks)', () => {
    const doboku = new Set(getCatsForTrack('doboku'));
    const kenchiku = new Set(getCatsForTrack('kenchiku'));
    const overlap = [...doboku].filter((k) => kenchiku.has(k));
    expect(overlap.length).toBeGreaterThan(0);
  });
});
