// ─── tests/genba-mode.test.jsx ────────────────────────────────────────────────
// items 103/104. The mode is thin on purpose — QuizShell does the quiz — so what
// is worth testing is the one thing it decides: which way each question runs.
//
// `buildQuestion` is exported for that reason and only that reason. Rendering the
// drill to check a stem would go through QuizShell's whole machinery to assert a
// string, and it would still not tell you whether the *other* direction was
// built correctly, because a session is a random draw.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import GenbaMode, { buildQuestion } from '../modes/GenbaMode.jsx';
import { GENBA_PHRASES } from '../data/genba-phrases.js';
import { stripFuri } from '../utils/jp-helpers.js';
import { MODE_COMPONENTS, MODE_META, MODE_SECTIONS } from '../router/modes.js';
import { _reset_for_test } from '../storage/engine.js';

vi.mock('../modes/GenbaMode.module.css', () => ({
  default: new Proxy({}, { get: (_, k) => k }),
}));

beforeEach(() => {
  localStorage.clear();
  _reset_for_test();
});

const heard = GENBA_PHRASES.find((p) => p.speaker === 'shokucho');
const said = GENBA_PHRASES.find((p) => p.speaker === 'sagyouin');

describe('a phrase you hear becomes "what do you do?"', () => {
  it('puts the Japanese in the stem and the situation underneath it', () => {
    const q = buildQuestion(heard);
    expect(q.question).toBe(heard.jp);
    expect(q.questionSub).toBe(heard.situation);
  });

  it('marks the action as correct, wherever the shuffle put it', () => {
    // Over many draws, because a single draw can land the answer first by luck
    // and pass a broken index.
    for (let i = 0; i < 50; i++) {
      const q = buildQuestion(heard);
      expect(q.options[q.correctIdx].text).toBe(heard.answer);
      expect(q.options).toHaveLength(4);
    }
  });
});

describe('a phrase you say becomes "what do you say?"', () => {
  it('puts the situation in the stem, and nothing underneath', () => {
    const q = buildQuestion(said);
    expect(q.question).toBe(said.situation);
    expect(q.questionSub).toBeNull();
  });

  it('marks the phrase itself as correct — there is no second copy to drift', () => {
    for (let i = 0; i < 50; i++) {
      const q = buildQuestion(said);
      expect(q.options[q.correctIdx].text).toBe(stripFuri(said.jp));
    }
  });
});

describe('every phrase builds a usable question', () => {
  it('over the whole corpus, with four distinct options and a real answer', () => {
    for (const p of GENBA_PHRASES) {
      const q = buildQuestion(p);
      expect(q.question, `${p.id} has no stem`).toBeTruthy();
      expect(new Set(q.options.map((o) => o.text)).size, `${p.id} has a repeated option`).toBe(4);
      expect(q.correctIdx, `${p.id} has no correct option`).toBeGreaterThanOrEqual(0);
      // The explanation is the only place the polite form and the reply appear
      // during a drill, so an entry that lost one would silently teach less.
      expect(q.explanation).toContain(p.id_text);
      if (p.polite) expect(q.explanation).toContain(p.polite);
      expect(q.explanation).toContain(p.reply);
      // No furigana marker survives into an option. OptionButton prints the
      // string, QuizAnnouncer speaks it, and ResultScreen files it as a review
      // row — a 《》 in there is visible, audible and permanent.
      for (const o of q.options) expect(o.text, `${p.id}: ${o.text}`).not.toContain('\u300a');
    }
  });
});

describe('the panel', () => {
  it('lists the phrases and says how many there are', () => {
    render(<GenbaMode />);
    expect(screen.getByText(new RegExp(`${GENBA_PHRASES.length} kalimat`))).toBeTruthy();
    expect(screen.getByText(heard.id_text)).toBeTruthy();
  });

  it('narrows to one function when its chip is pressed', () => {
    render(<GenbaMode />);
    // 報告 is worker-side, so pressing it must drop every foreman line.
    fireEvent.click(screen.getByText(/Lapor/));
    const lapor = GENBA_PHRASES.filter((p) => p.fn === 'lapor');
    expect(screen.getByText(lapor[0].id_text)).toBeTruthy();
    expect(screen.queryByText(heard.id_text)).toBeNull();
  });

  it('opens one phrase to show the register, not just the meaning', () => {
    render(<GenbaMode />);
    fireEvent.click(screen.getByText(heard.id_text));
    expect(screen.getByText('Bentuk sopan')).toBeTruthy();
    expect(screen.getByText('Balasan')).toBeTruthy();
    expect(screen.getByText(heard.answer)).toBeTruthy();
  });
});

describe('the registry entry', () => {
  it('is registered, described, and reachable from the menu', () => {
    expect(MODE_COMPONENTS.genba).toBeTruthy();
    expect(MODE_META.genba?.label).toBe('Bahasa Lapangan');
    expect(MODE_META.genba?.strand).toBe('output');
    const listed = Object.values(MODE_SECTIONS).flatMap((s) => s.modes);
    expect(listed).toContain('genba');
  });
});
