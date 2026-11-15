// ─── tests/kenchiku-track.test.jsx ─────────────────────────────────────────────
// Verification suite for Kenchiku (建築) track additions:
// - Official JAC Kenchiku practical exam questions
// - Curated Kenchiku practice sets (wgk01–wgk10)
// - Vocabulary mini-deck (cards-kenchiku.js)
// - Track switcher and track-aware pool filtering
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { createElement } from 'react';

import { JAC_KENCHIKU } from '../data/sets/jac/jac-kenchiku.js';
import { KENCHIKU_SETS } from '../data/sets/kenchiku-sets.js';
import { CARDS_KENCHIKU } from '../data/source/cards-kenchiku.js';
import { CARDS } from '../data/cards.js';
import { getJacOfficial } from '../data/jac-official.js';
import { QUIZ_SETS, getQuizSetsForTrack } from '../data/quiz-sets.js';
import { getCatsForTrack } from '../data/categories.js';
import { isWaygroundPraktikId, isPraktikId } from '../utils/quiz-classification.js';
import { buildJacPool, buildQuizSetsPool, drawExam } from '../modes/SimulasiMode.jsx';
import TrackSwitcherModal from '../components/TrackSwitcherModal.jsx';

describe('JAC Kenchiku Practical Exam Data Integrity', () => {
  it('contains exactly 30 authentic exam questions (15 in st1 and 15 in st2)', () => {
    expect(JAC_KENCHIKU.length).toBe(30);
    const st1 = JAC_KENCHIKU.filter((q) => q.set === 'st1');
    const st2 = JAC_KENCHIKU.filter((q) => q.set === 'st2');
    expect(st1.length).toBe(15);
    expect(st2.length).toBe(15);
  });

  it('every question has valid structure, track, answers, and ruby syntax', () => {
    for (const q of JAC_KENCHIKU) {
      expect(q.id).toMatch(/^stk[12]_q\d{2}$/);
      expect(q.track).toBe('kenchiku');
      expect(q.q).toBeTruthy();
      expect(q.hint).toBeTruthy();
      expect(q.opts.length).toBe(4);
      expect(q.opts_id.length).toBe(4);
      expect(q.ans).toBeGreaterThanOrEqual(0);
      expect(q.ans).toBeLessThan(4);
      expect(q.exp).toBeTruthy();

      // Check for unclosed ruby markers
      const openCount = (q.q.match(/《/g) || []).length;
      const closeCount = (q.q.match(/》/g) || []).length;
      expect(openCount).toBe(closeCount);
    }
  });

  it('getJacOfficial returns 95 questions for kenchiku and 95 for lifeline', () => {
    const kenchikuPool = getJacOfficial('kenchiku');
    const lifelinePool = getJacOfficial('lifeline');

    expect(kenchikuPool.length).toBe(95);
    expect(lifelinePool.length).toBe(95);

    // Kenchiku pool has Kenchiku practical questions
    const kenchikuPractical = kenchikuPool.filter((q) => q.track === 'kenchiku');
    expect(kenchikuPractical.length).toBe(30);

    // Lifeline pool has Lifeline practical questions
    const lifelinePractical = lifelinePool.filter((q) => q.track === 'lifeline');
    expect(lifelinePractical.length).toBe(30);
  });
});

describe('Kenchiku Curated Sets (wgk01–wgk10)', () => {
  it('contains 10 sets of 20 questions each (200 total questions)', () => {
    expect(KENCHIKU_SETS.length).toBe(10);
    const totalQ = KENCHIKU_SETS.reduce((sum, s) => sum + s.questions.length, 0);
    expect(totalQ).toBe(200);
  });

  it('all questions have complete metadata and valid ruby brackets', () => {
    for (const s of KENCHIKU_SETS) {
      expect(s.id).toMatch(/^wgk(0[1-9]|10)$/);
      expect(s.track).toBe('kenchiku');
      expect(s.questions.length).toBe(20);

      for (const q of s.questions) {
        expect(q.id).toBeTruthy();
        expect(q.q).toBeTruthy();
        expect(q.hint).toBeTruthy();
        expect(q.opts.length).toBe(4);
        expect(q.opts_id.length).toBe(4);
        expect(q.ans).toBeGreaterThanOrEqual(0);
        expect(q.ans).toBeLessThan(4);
        expect(q.exp).toBeTruthy();

        const openCount = (q.q.match(/《/g) || []).length;
        const closeCount = (q.q.match(/》/g) || []).length;
        expect(openCount).toBe(closeCount);
      }
    }
  });

  it('isWaygroundPraktikId correctly matches wgk sets', () => {
    expect(isWaygroundPraktikId('wgk01')).toBe(true);
    expect(isWaygroundPraktikId('wgk10')).toBe(true);
    expect(isWaygroundPraktikId('wgl01')).toBe(true);
    expect(isWaygroundPraktikId('wgl10')).toBe(true);
    expect(isWaygroundPraktikId('wglv-01')).toBe(false);
    expect(isWaygroundPraktikId('wt01')).toBe(false);
    expect(isPraktikId('wgk05')).toBe(true);
  });

  it('getQuizSetsForTrack correctly partitions sets by track', () => {
    const kenchikuSets = getQuizSetsForTrack('kenchiku');
    const lifelineSets = getQuizSetsForTrack('lifeline');

    // Kenchiku: 14 wt + 2 jmt + 2 wglv + 10 wgk = 28 sets
    expect(kenchikuSets.length).toBe(28);
    expect(kenchikuSets.some((s) => s.id === 'wgk01')).toBe(true);
    expect(kenchikuSets.some((s) => s.id === 'wgl01')).toBe(false);

    // Lifeline: 14 wt + 2 jmt + 2 wglv + 10 wgl + 2 jml + 10 wglv = 40 sets
    expect(lifelineSets.length).toBe(40);
    expect(lifelineSets.some((s) => s.id === 'wgl01')).toBe(true);
    expect(lifelineSets.some((s) => s.id === 'wgk01')).toBe(false);
  });
});

describe('Kenchiku Flashcard Mini-Deck', () => {
  it('contains 60 high-yield Kenchiku cards (IDs 2001–2060)', () => {
    expect(CARDS_KENCHIKU.length).toBe(60);
    expect(CARDS_KENCHIKU[0].id).toBe(2001);
    expect(CARDS_KENCHIKU[59].id).toBe(2060);
  });

  it('CARDS has 1686 total merged cards', () => {
    expect(CARDS.length).toBe(1686);
    const kenchikuCats = ['katawaku', 'tekkin', 'tobi', 'atsuou', 'naisou', 'sakan', 'bousui'];
    const kenchikuInCards = CARDS.filter((c) => kenchikuCats.includes(c.category));
    expect(kenchikuInCards.length).toBe(60);

    const allKenchiku = CARDS.filter((c) => getCatsForTrack('kenchiku').includes(c.category));
    expect(allKenchiku.length).toBe(1060);
  });
});

describe('SimulasiMode Track Filtering', () => {
  it('buildJacPool draws from Kenchiku questions when track is kenchiku', () => {
    const pool = buildJacPool('kenchiku');
    expect(pool.length).toBeGreaterThan(0);
    const praktiks = pool.filter((q) => q._category === 'praktik');
    expect(praktiks.length).toBe(15);
    // All practical questions drawn belong to Kenchiku
    expect(praktiks.every((q) => q._wrongKey.startsWith('stk'))).toBe(true);
  });

  it('buildQuizSetsPool excludes lifeline sets when track is kenchiku', () => {
    const pool = buildQuizSetsPool('kenchiku');
    const praktiks = pool.filter((q) => q._category === 'praktik');
    expect(praktiks.length).toBeGreaterThan(0);
    // No wgl or jml questions in Kenchiku pool
    expect(praktiks.every((q) => !q._wrongKey.startsWith('wgl') && !q._wrongKey.startsWith('jml'))).toBe(true);
  });

  it('drawExam successfully draws an exam for kenchiku track', () => {
    const exam = drawExam('jac', { count: 15 }, 'kenchiku');
    expect(exam.length).toBe(15);
    expect(exam.some((q) => q._category === 'praktik')).toBe(true);
    expect(exam.some((q) => q._category === 'teori')).toBe(true);
  });
});

describe('TrackSwitcherModal', () => {
  it('renders Lifeline and Kenchiku options and handles selection', () => {
    const onSelectTrack = vi.fn();
    const onClose = vi.fn();

    render(
      createElement(TrackSwitcherModal, {
        isOpen: true,
        onClose,
        currentTrack: 'lifeline',
        onSelectTrack,
      })
    );

    expect(screen.getByText('Pilih Jalur SSW Konstruksi')).toBeInTheDocument();
    expect(screen.getByText(/Lifeline \(ライフライン設備\)/)).toBeInTheDocument();
    expect(screen.getByText(/Kenchiku \(建築 - Gedung\)/)).toBeInTheDocument();

    // Click Kenchiku track
    const kenchikuCard = screen.getByText(/Kenchiku \(建築 - Gedung\)/).closest('button');
    fireEvent.click(kenchikuCard);

    expect(onSelectTrack).toHaveBeenCalledWith('kenchiku');
    expect(onClose).toHaveBeenCalled();
  });
});
