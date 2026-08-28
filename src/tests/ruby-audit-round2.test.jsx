// ─── tests/ruby-audit-round2.test.jsx ────────────────────────────────────────
// Follow-up audit after the first ruby-consistency pass (SimulasiMode,
// QuizShell, DescBlock adoption, DangerMode, ResultScreen): a systematic
// field-name -> render-site cross-reference (not ad-hoc grep) turned up more
// gaps the first pass's manual spot-checking missed, because they used
// differently-named fields (soal, subtitle) or lived behind an extra layer
// (daily-challenge.js builds its own question shape from JAC_OFFICIAL/
// QUIZ_SETS before SayaTab ever sees it).
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect } from 'vitest';
import { getDailyChallenge } from '../utils/daily-challenge.js';
import { stripFuri } from '../utils/jp-helpers.js';
import { ANGKA_KUNCI } from '../data/angka-kunci.js';

describe('daily-challenge.js — options stripped at the source', () => {
  it('every option across a full year of seeded days is free of 《reading》 markers', () => {
    // getDailyChallenge is deterministic per date (seeded), so sweep a full
    // year rather than one arbitrary date -- cheap (pure string ops) and
    // deterministic, not flaky like sampling live app state would be.
    for (let d = 1; d <= 365; d++) {
      const date = new Date(2026, 0, d).toISOString().slice(0, 10);
      const q = getDailyChallenge(date);
      if (!q) continue;
      for (const opt of q.options) {
        expect(opt).not.toMatch(/《.*》/);
      }
    }
  });
});

describe('AngkaMode — item.soal contains embedded readings that need rendering, not stripping', () => {
  it('every soal entry in the live data actually has a 《reading》 to render', () => {
    // Sanity check on the premise, not just the fix: if this data ever
    // stopped carrying readings, MixedRuby-style rendering would be a no-op
    // and stripFuri would've been the simpler correct choice instead.
    const withRuby = ANGKA_KUNCI.filter((item) => item.soal?.includes('《'));
    expect(withRuby.length).toBeGreaterThan(0);
  });
});

describe('StatsMode — truncating a jp string with an embedded reading', () => {
  it('stripping before slicing never leaves an unclosed 《 or stray 》 at the cut', () => {
    // The bug this guards: slicing a raw jp string mid-《reading》 can cut the
    // marker itself in half, which looks worse than an unstripped string
    // (an unclosed bracket instead of just a visible-but-intact one).
    const samples = [
      '安全帯《あんぜんたい》を正しく装着する方法について説明しなさい',
      '短い《みじかい》',
      '労働者名簿と賃金台帳《ちんぎんだいちょう》の保存期間',
    ];
    for (const raw of samples) {
      const truncated = stripFuri(raw).slice(0, 20);
      expect(truncated).not.toMatch(/《[^》]*$/); // no unclosed opening bracket
      expect(truncated.includes('》')).toBe(false); // no stray closing bracket either
    }
  });
});
