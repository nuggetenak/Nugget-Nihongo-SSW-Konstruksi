// ─── tests/simulasi-source-split.test.jsx ────────────────────────────────────
// Owner's request (2026-08-28, after asking where Simulasi's questions come
// from and finding the answer "kacau"): split into two explicit sources
// instead of one undifferentiated 1075-question pool --
//   - "JAC Official": JAC_OFFICIAL only, no forced ratio (owner: "presentase
//     nya tidak sama 30+20 itu which is fine")
//   - "Teori & Praktik": everything else (Wayground + JAC Mockup, which
//     folds in without its own menu -- see the isTeoriId/isPraktikId
//     classification shared with WaygroundMode), sampled at a fixed
//     60/40 teori/praktik ratio that scales across presets: 9+6=15,
//     15+10=25, 30+20=50. Regenerated fresh on every start, not a fixed
//     set (owner: "generate random based on the pool tiap kali mulai").
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { createElement } from 'react';
import { ConfirmProvider } from '../components/ConfirmDialog.jsx';
import { ToastProvider } from '../components/Toast.jsx';
import { AppProvider } from '../contexts/AppContext.jsx';
import SimulasiMode, {
  buildJacPool,
  buildQuizSetsPool,
  SIMULASI_POOL_PRESETS,
  SIMULASI_JAC_PRESETS,
  SIMULASI_SECONDS_PER_QUESTION,
} from '../modes/SimulasiMode.jsx';
import { isTeoriId, isPraktikId, isVocabId } from '../utils/quiz-classification.js';
import { QUIZ_SETS } from '../data/quiz-sets.js';

function renderSimulasi() {
  render(
    createElement(
      ToastProvider,
      null,
      createElement(
        ConfirmProvider,
        null,
        createElement(
          AppProvider,
          null,
          createElement(SimulasiMode, { onExit: vi.fn(), onSessionEnd: vi.fn(), onRetryWrong: vi.fn() })
        )
      )
    )
  );
}

describe('SIMULASI_POOL_PRESETS — the ratio math itself', () => {
  it('every preset is exactly teori + praktik, and scales 60/40', () => {
    for (const p of SIMULASI_POOL_PRESETS) {
      const total = p.teori + p.praktik;
      expect(p.sub).toContain(String(total));
      expect(p.teori / total).toBeCloseTo(0.6, 5);
      expect(p.praktik / total).toBeCloseTo(0.4, 5);
    }
    const full = SIMULASI_POOL_PRESETS.find((p) => p.key === 'full');
    expect(full.teori).toBe(30);
    expect(full.praktik).toBe(20);
  });
});

// 2026-08-31: owner reported the time budget as 1 min/question (slightly
// less for the pool "full" preset, 50 questions / 45 min) when the real
// JAC exam allots 2 min/question -- corrected uniformly across every
// preset, not only the one they happened to mention, since there's no
// reason to think the per-question rate is full-exam-specific.
describe('exam time budget — 2 minutes per question (owner, 2026-08-31)', () => {
  it('every pool preset spends exactly SECONDS_PER_QUESTION per question', () => {
    for (const p of SIMULASI_POOL_PRESETS) {
      const total = p.teori + p.praktik;
      expect(p.time).toBe(total * SIMULASI_SECONDS_PER_QUESTION);
      expect(p.sub).toContain(`${p.time / 60} menit`);
    }
  });

  it('every fixed-count JAC preset spends exactly SECONDS_PER_QUESTION per question', () => {
    for (const p of SIMULASI_JAC_PRESETS.filter((p) => p.count > 0)) {
      expect(p.time).toBe(p.count * SIMULASI_SECONDS_PER_QUESTION);
      expect(p.sub).toContain(`${p.time / 60} menit`);
    }
  });

  it('JAC Official "full" (variable count) states the honest 88-102 minute range, not a single guess', () => {
    const full = SIMULASI_JAC_PRESETS.find((p) => p.key === 'full');
    const minMinutes = (44 * SIMULASI_SECONDS_PER_QUESTION) / 60;
    const maxMinutes = (51 * SIMULASI_SECONDS_PER_QUESTION) / 60;
    expect(full.sub).toContain(`${minMinutes}–${maxMinutes} menit`);
  });
});

describe('SimulasiMode UI — JAC Official "full" preset corrects its placeholder time to the actual draw', () => {
  it('timer starts within the true 88-102 minute range once questions are drawn, not at the 100-minute placeholder unless that happens to be the actual draw', async () => {
    renderSimulasi();
    fireEvent.click(screen.getByText('JAC Official'));
    fireEvent.click(screen.getByText(/1 set teori \+ 1 set praktik/));
    const startBtn = await screen.findByText(/Mulai/i);
    fireEvent.click(startBtn);

    // Timer text renders as MM:SS; parse it back to seconds and confirm
    // it's an exact multiple of SECONDS_PER_QUESTION in the valid range,
    // not the static 6000s (100 min) placeholder specifically (that would
    // only coincidentally be correct if the draw landed on exactly 50).
    const timerEl = await screen.findByText(/^\d{1,3}:\d{2}$/);
    const [mm, ss] = timerEl.textContent.split(':').map(Number);
    const totalSeconds = mm * 60 + ss;
    expect(totalSeconds % SIMULASI_SECONDS_PER_QUESTION).toBe(0);
    const impliedCount = totalSeconds / SIMULASI_SECONDS_PER_QUESTION;
    expect(impliedCount).toBeGreaterThanOrEqual(44);
    expect(impliedCount).toBeLessThanOrEqual(51);
  });
});

describe('buildQuizSetsPool — teori/praktik classification excludes vocab', () => {
  const pool = buildQuizSetsPool();

  it('every question is tagged teori or praktik, never anything else', () => {
    const categories = new Set(pool.map((q) => q._category));
    expect(categories).toEqual(new Set(['teori', 'praktik']));
  });

  it('has comfortably more than the largest preset needs of each category', () => {
    const teoriCount = pool.filter((q) => q._category === 'teori').length;
    const praktikCount = pool.filter((q) => q._category === 'praktik').length;
    const full = SIMULASI_POOL_PRESETS.find((p) => p.key === 'full');
    expect(teoriCount).toBeGreaterThan(full.teori);
    expect(praktikCount).toBeGreaterThan(full.praktik);
  });

  it('no vocab-sourced (wglv-*) question ever appears in the pool', () => {
    const vocabSetIds = new Set(QUIZ_SETS.filter((s) => isVocabId(s.id)).map((s) => s.title));
    for (const q of pool) {
      expect(vocabSetIds.has(q._setLabel)).toBe(false);
    }
  });

  it('classification agrees with the set-level predicates for every question in the pool', () => {
    // Cross-check at the question level against the same set-level id
    // predicates WaygroundMode uses -- if these ever disagree, the shared
    // classifier and this pool-builder have drifted apart.
    for (const set of QUIZ_SETS) {
      if (!set.questions?.length) continue;
      const expected = isTeoriId(set.id) ? 'teori' : isPraktikId(set.id) ? 'praktik' : null;
      const inPool = pool.filter((q) => q._setLabel === set.title);
      if (expected === null) {
        expect(inPool.length).toBe(0);
      } else if (inPool.length > 0) {
        expect(inPool.every((q) => q._category === expected)).toBe(true);
      }
    }
  });
});

describe('buildJacPool — JAC Official stays its own separate, unclassified pool', () => {
  it('draws only from JAC_OFFICIAL, with no teori/praktik tagging', () => {
    const pool = buildJacPool();
    expect(pool.length).toBeGreaterThan(0);
    expect(pool.every((q) => q._source === 'jac')).toBe(true);
    expect(pool.every((q) => q._category === undefined)).toBe(true);
  });

  // Owner's correction (2026-08-28, after first claiming -- wrongly -- that
  // JAC_OFFICIAL had no set structure at all): the flattened compat shim
  // (jac-official.js) hides it, but the real source files tag every
  // question with set: 'tt1'/'tt2' (学科/teori, 29 and 36 questions) or
  // 'st1'/'st2' (実技/praktik, 15 each). Request: pick one teori set + one
  // praktik set at random every start, not shown as an explicit choice,
  // total is whatever that pair happens to add up to.
  it('always returns exactly one teori set + one praktik set worth of questions (44 or 51, never anything else)', () => {
    const seen = new Set();
    for (let i = 0; i < 60; i++) {
      const pool = buildJacPool();
      seen.add(pool.length);
      expect([44, 51]).toContain(pool.length);
    }
    // Over 60 draws, both possible totals should show up -- if this ever
    // only sees one value, the random pick isn't actually varying.
    expect(seen.size).toBe(2);
  });

  it('every draw is internally consistent -- all questions share the same two _setLabel values', () => {
    const pool = buildJacPool();
    const labels = new Set(pool.map((q) => q._setLabel));
    expect(labels.size).toBe(2);
    for (const label of labels) {
      expect(label).toMatch(/^(学科|実技) Set [12]$/);
    }
  });
});

describe('SimulasiMode UI — source selector', () => {
  it('defaults to the Teori & Praktik pool, offers JAC Official as the other option', () => {
    renderSimulasi();
    expect(screen.getByText('Teori & Praktik')).toBeTruthy();
    expect(screen.getByText('JAC Official')).toBeTruthy();
    // Pool preset labels visible by default (mentions the split).
    expect(screen.getByText(/30 teori \+ 20 praktik/)).toBeTruthy();
  });

  it('switching to JAC Official swaps the preset list to JAC-specific labels', () => {
    renderSimulasi();
    fireEvent.click(screen.getByText('JAC Official'));
    const full = SIMULASI_JAC_PRESETS.find((p) => p.key === 'full');
    expect(screen.getByText(full.sub)).toBeTruthy();
    // The pool-specific "30 teori + 20 praktik" wording should be gone.
    expect(screen.queryByText(/30 teori \+ 20 praktik/)).toBeNull();
  });
});
