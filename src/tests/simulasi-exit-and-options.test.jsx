// ─── tests/simulasi-exit-and-options.test.jsx ────────────────────────────────
// Reported: "kalau pencet keluar langsung keluar hilang progressnya" -- ✕
// Keluar called onExit directly during the playing phase with no
// confirmation, unlike the submit-with-unanswered-questions path (which
// already used the same useConfirm hook). A misclick during a 45-minute/
// 1075-question full simulation discarded everything with no recovery.
//
// Also reported: "banyak yang masih kyk ⟨⟨...⟩⟩" -- SimulasiMode built its
// own option pool in buildPool()/the questions memo without stripFuri(),
// unlike every other mode's options (VocabMode etc., which strip before
// handing text to QuizShell/OptionButton -- options render as plain text
// everywhere else in the app, never as live <ruby>). The raw 《reading》
// marker showed up on screen literally instead of being removed.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { ConfirmProvider } from '../components/ConfirmDialog.jsx';
import { ToastProvider } from '../components/Toast.jsx';
import { AppProvider, useApp } from '../contexts/AppContext.jsx';
import { ProgressProvider } from '../contexts/ProgressContext.jsx';
import { _reset_for_test } from '../storage/engine.js';
import SimulasiMode from '../modes/SimulasiMode.jsx';
import { renderJPWithRuby } from '../components/JpDisplay.jsx';
import { stripFuri } from '../utils/jp-helpers.js';
import { JAC_OFFICIAL } from '../data/index.js';
import { QUIZ_SETS } from '../data/quiz-sets.js';

const root = resolve(__dirname, '..');

function renderSimulasi(onExit = vi.fn()) {
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
          createElement(
            ProgressProvider,
            null,
            createElement(SimulasiMode, { onExit, onSessionEnd: vi.fn(), onRetryWrong: vi.fn() })
          )
        )
      )
    )
  );
  return onExit;
}

beforeEach(() => {
  localStorage.clear();
  _reset_for_test();
});

describe('SimulasiMode — exit confirmation during an active simulation', () => {
  it('does not exit immediately -- shows a confirm dialog first', async () => {
    const onExit = renderSimulasi();
    fireEvent.click(screen.getByText('Mulai Simulasi 🎯'));

    fireEvent.click(screen.getByText('✕ Keluar'));
    // Still on the quiz -- a question should still be visible, dialog pending.
    expect(await screen.findByText('Tetap di sini')).toBeTruthy();
    expect(onExit).not.toHaveBeenCalled();
  });

  it('cancelling the exit dialog keeps the simulation running', async () => {
    const onExit = renderSimulasi();
    fireEvent.click(screen.getByText('Mulai Simulasi 🎯'));
    fireEvent.click(screen.getByText('✕ Keluar'));

    await act(async () => {
      fireEvent.click(await screen.findByText('Tetap di sini'));
    });
    expect(onExit).not.toHaveBeenCalled();
    expect(screen.getByText(/Soal 1 \//)).toBeTruthy();
  });

  it('confirming actually exits', async () => {
    const onExit = renderSimulasi();
    fireEvent.click(screen.getByText('Mulai Simulasi 🎯'));
    fireEvent.click(screen.getByText('✕ Keluar'));

    await act(async () => {
      fireEvent.click(await screen.findByText('Keluar, hapus progres'));
    });
    expect(onExit).toHaveBeenCalledTimes(1);
  });

  // ── The header's back arrow is guarded too (2026-09-04) ──────────────────
  // SimulasiMode no longer draws its own top-level back button: ModeHeader
  // renders the one back control for all 19 modes. That control has to respect
  // the same confirmation, or the header's arrow becomes a silent way to throw
  // away a 100-minute exam. SimulasiMode registers its confirmation as an exit
  // guard (useExitGuard) while, and only while, an exam is running.
  it('registers an exit guard while playing, and none on the start screen', async () => {
    let app;
    function CaptureApp() {
      app = useApp();
      return null;
    }
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
            createElement(CaptureApp),
            createElement(
              ProgressProvider,
              null,
              createElement(SimulasiMode, {
                onExit: vi.fn(),
                onSessionEnd: vi.fn(),
                onRetryWrong: vi.fn(),
              })
            )
          )
        )
      )
    );

    // Start screen: nothing to lose, so goBack must not be intercepted. A
    // confirmation with no stakes is the kind people learn to dismiss unread.
    await act(async () => {
      app.goBack();
    });
    expect(screen.queryByText('Tetap di sini')).toBeNull();

    // Playing: the same goBack now has to raise the confirmation.
    fireEvent.click(screen.getByText('Mulai Simulasi 🎯'));
    await act(async () => {
      app.goBack();
    });
    expect(await screen.findByText('Tetap di sini')).toBeTruthy();
  });

  it('pausing offers an explicit exit path alongside resume, not just a dismiss-to-resume overlay', async () => {
    const onExit = renderSimulasi();
    fireEvent.click(screen.getByText('Mulai Simulasi 🎯'));
    fireEvent.click(screen.getByLabelText('Jeda'));

    expect(screen.getByText('Dijeda')).toBeTruthy();
    expect(screen.getByText('▶ Lanjutkan')).toBeTruthy();
    fireEvent.click(screen.getByText('✕ Keluar dari simulasi'));
    await act(async () => {
      fireEvent.click(await screen.findByText('Keluar, hapus progres'));
    });
    expect(onExit).toHaveBeenCalledTimes(1);
  });
});

describe('SimulasiMode — option text never shows raw 《reading》 markup', () => {
  it('strips furigana markers before the options array is built, deterministically', () => {
    // Source-level guarantee (no dependency on which questions a random
    // shuffle happens to sample): the options mapping must run every option
    // through stripFuri before it becomes shuffledOpts. Same convention this
    // file already uses in correct-wrong-tokens.test.js for its own
    // regressions -- read the source, assert the fix's shape is present.
    const src = readFileSync(resolve(root, 'modes/SimulasiMode.jsx'), 'utf8');
    const idx = src.indexOf('q.options.map(');
    expect(idx).toBeGreaterThan(-1);
    // The stripFuri( call should appear within the same statement, well
    // before the next unrelated top-level construct.
    const nearby = src.slice(idx, idx + 200);
    expect(nearby).toMatch(/stripFuri\(/);
  });

  // ── Why this is a whole-pool scan and not a sample (2026-09-07) ───────────
  // This used to render one exam and walk its 15 shuffled questions. It failed
  // roughly one run in twelve, and each failure named a different question --
  // the classic shape of a test whose *rule* is wrong rather than whose subject
  // is broken. Scanning all 1075 questions through the same two render paths
  // settles it: the rule below holds for every one of them, so the flake was
  // never the shuffle finding a broken question. It was the rule catching
  // three kinds of 《》 that are supposed to survive:
  //
  //   1. cloze blanks -- 文章の《 》に入る言葉 (6 questions). The blank IS the
  //      question; rendering it away leaves an unanswerable sentence.
  //   2. katakana glossed synonyms -- 人間の誤り《ヒューマンエラー》,
  //      ろう付け《ブレイジング》. JpDisplay's isGloss branch passes these
  //      through deliberately.
  //   3. kanji parentheticals -- 危険予知活動《KY活動》, already excluded when
  //      this assertion was narrowed on 2026-09-04. That narrowing was right and
  //      incomplete: it fixed the kanji case and left 1 and 2 behind.
  //
  // Furigana in this corpus is written in hiragana, always -- so "a hiragana-
  // only marker reached the screen" is an unconverted reading and nothing else,
  // while whitespace (cloze) and katakana (gloss) are the two intentional
  // shapes. That is the rule, and it is not a restatement of the renderer's own
  // branching: it never asks what JpDisplay decided, only what is on screen.
  const HIRAGANA_READING = /《[ぁ-んー]*[ぁ-ん][ぁ-んー]*》/;

  it('leaves no unconverted reading anywhere in either simulasi pool', () => {
    // 1075 questions x (question + hint + explanation + ~4 options), against
    // the exact two transforms SimulasiMode applies: options are stripped
    // outright (stripFuri), everything else goes through the ruby renderer.
    const offenders = [];
    const check = (where, source, rendered) => {
      const m = rendered.match(HIRAGANA_READING);
      if (m) offenders.push(`${where}: ${m[0]} in "${source.slice(0, 80)}"`);
    };
    const asText = (nodes) =>
      typeof nodes === 'string' || nodes == null
        ? (nodes ?? '')
        : renderToStaticMarkup(createElement('div', null, nodes)).replace(/<[^>]*>/g, '');

    const scan = (where, q) => {
      check(`${where} question`, q.q, asText(renderJPWithRuby(q.q)));
      if (q.hint) check(`${where} hint`, q.hint, asText(renderJPWithRuby(q.hint)));
      if (q.exp) check(`${where} explanation`, q.exp, asText(renderJPWithRuby(q.exp)));
      (q.opts || []).forEach((o, i) => check(`${where} option ${i}`, o, stripFuri(o)));
    };
    for (const q of JAC_OFFICIAL) scan(`JAC ${q.set}/${q.id}`, q);
    for (const set of QUIZ_SETS) for (const q of set.questions || []) scan(`${set.id}/${q.id}`, q);

    expect(offenders, `unconverted readings:\n${offenders.slice(0, 10).join('\n')}`).toEqual([]);
  });

  it('the option scan above would actually catch the original bug', () => {
    // A whole-corpus scan that passes proves nothing on its own -- it passes
    // just as happily if the thing it scans is empty. 2366 of the pool's
    // options carry a 《reading》 in source, so removing the stripFuri() that
    // this file's first test pins would put every one of them on screen.
    const raw = [
      ...JAC_OFFICIAL.flatMap((q) => q.opts || []),
      ...QUIZ_SETS.flatMap((s) => (s.questions || []).flatMap((q) => q.opts || [])),
    ].filter((o) => HIRAGANA_READING.test(o));
    expect(raw.length).toBeGreaterThan(2000);
  });

  it('strips furigana markers from every rendered option in a real exam', () => {
    // The pool scan above covers the data; this covers the wiring -- that the
    // component really does route options through that transform and questions
    // through the renderer, on screen, in a mounted exam.
    renderSimulasi();
    fireEvent.click(screen.getByText('Mulai Simulasi 🎯'));
    for (let i = 0; i < 15; i++) {
      const nav = screen.queryByLabelText(new RegExp(`^Soal ${i + 1},`));
      if (nav) fireEvent.click(nav);
      const found = document.body.textContent.match(HIRAGANA_READING);
      let near = '';
      if (found) {
        const el = [...document.querySelectorAll('*')]
          .filter((n) => n.children.length === 0 && HIRAGANA_READING.test(n.textContent))
          .pop();
        near = el ? `<${el.tagName} class="${el.className}"> ${el.textContent.slice(0, 120)}` : '?';
      }
      // A failure that does not say what it found is a failure you cannot act
      // on -- this one used to just assert and leave you guessing which of the
      // shuffled 15 was responsible.
      expect(found, `raw reading marker on screen at question ${i + 1}: …${near}…`).toBeNull();
    }
  });
});
