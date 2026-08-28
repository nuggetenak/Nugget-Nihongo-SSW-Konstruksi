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
