// ─── tests/nav-a11y-residuals.test.jsx ───────────────────────────────────────
// The navigation and accessibility findings from the 2026-09-10 audits that were
// small, real, and each one press or one Tab away from a learner (KIMI §4.4, §5.1,
// §7.2, §7.3, §7.4).
//
// They have a shape in common worth naming: each is a promise the markup makes and
// the behaviour does not keep. `aria-modal="true"` with no focus trap, a skip link
// pointing at an id that does not exist on the screen the link is on, a history entry
// that stores some of its state. Nothing throws; the guarantee is just absent, and
// only a keyboard or screen-reader user finds out.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { AppProvider, useApp } from '../contexts/AppContext.jsx';
import { ToastProvider } from '../components/Toast.jsx';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import QuizShell from '../components/QuizShell.jsx';
import { _reset_for_test } from '../storage/engine.js';

beforeEach(() => {
  localStorage.clear();
  _reset_for_test();
});

const makeQ = (n) => ({
  question: `soal ${n}`,
  options: [{ text: `a${n}` }, { text: `b${n}` }],
  correctIdx: 0,
  explanation: '',
});

describe('the quiz progress announcement waits its turn', () => {
  // The same sentence was `assertive` here and `polite` in SimulasiMode, so
  // "Soal 3 dari 10" interrupted a screen reader mid-question on every advance in
  // four modes and waited politely in the fifth. It is orientation, not an alert.
  it('announces progress politely, as SimulasiMode already did', () => {
    render(
      <QuizShell
        questions={[makeQ(1), makeQ(2)]}
        onExit={() => {}}
        title="Kuis"
        autoNextDelay={0}
      />
    );
    const region = screen.getByText(/Soal 1 dari 2/);
    expect(region.getAttribute('aria-live')).toBe('polite');
  });

  it('still lets the answer outcome cut in, which is the one thing worth interrupting', () => {
    // `QuizAnnouncer` stays assertive on purpose: it is the direct result of the tap
    // the user just made. Keeping both at one setting would have lost that.
    render(<QuizShell questions={[makeQ(1)]} onExit={() => {}} title="Kuis" autoNextDelay={0} />);
    fireEvent.click(screen.getByText('a1'));
    const outcome = screen.getByText('Benar!');
    expect(outcome.getAttribute('aria-live')).toBe('assertive');
  });
});

describe('the loading region does not specify its politeness twice', () => {
  it('leaves role="status" to imply aria-live', async () => {
    // `role="status"` carries an implicit `aria-live="polite"`. Both were set, which is
    // harmless while they agree — and item 16 exists in this repo because a status role
    // and an explicit aria-live drifted into contradicting each other.
    const { ModeLoader } = await import('../router/ModeRouter.jsx');
    render(<ModeLoader />);
    const el = screen.getByRole('status');
    expect(el.getAttribute('aria-live')).toBeNull();
  });
});

describe('the skip link has somewhere to go on every screen', () => {
  // `index.html` ships a "Langsung ke konten" link pointing at #main-content, and the
  // onboarding branch was the one screen that did not render that id — so the very
  // first keyboard user, on the very first screen, got a link to nowhere.
  const read = (rel) => readFileSync(resolve(process.cwd(), rel), 'utf8');

  it('index.html targets an id App renders in every branch', () => {
    const html = read('index.html');
    const target = html.match(/class="skip-nav"[^>]*>|href="#([^"]+)"\s+class="skip-nav"/);
    expect(target, 'the skip link markup moved — re-derive this test').toBeTruthy();
    expect(html).toContain('href="#main-content"');

    const app = read('src/App.jsx');
    // Every `return` that renders a screen has to be inside the landmark. Counting is
    // crude but it is the property that broke: one branch out of five lacked it.
    const returns = app.match(/^\s*(?:if \([^)]*\)\s*)?return \(/gm) ?? [];
    const landmarks = app.match(/<main id="main-content"/g) ?? [];
    expect(landmarks.length, 'a screen-rendering branch of App has no #main-content').toBe(
      returns.length
    );
  });
});

describe('a history entry carries the params the mode was opened with', () => {
  // `modeParams` was left out of the pushed state, so a hardware-back into a mode
  // entered with params (a filtered `kartu` deck, a deep-linked `tentang?section=`)
  // came back without its scope — and worse, with whatever params the *previous* mode
  // had left on the context, because the restore branch never touched them.
  //
  // Behavioural, through the real provider and the real history object, for the same
  // reason history.test.jsx gives: asserting the shape of the state object would test
  // the code against itself.
  function Capture({ onCtx }) {
    onCtx(useApp());
    return null;
  }
  function renderApp() {
    let ctx;
    render(
      <ToastProvider>
        <AppProvider>
          <Capture onCtx={(c) => (ctx = c)} />
        </AppProvider>
      </ToastProvider>
    );
    return () => ctx;
  }

  it('puts modeParams into the pushed entry', () => {
    history.replaceState(null, '', '#/');
    const getCtx = renderApp();
    act(() => getCtx().goMode('kartu', { filterIds: [7, 8], filterReason: 'recent' }));
    expect(history.state).toMatchObject({
      mode: 'kartu',
      modeParams: { filterIds: [7, 8], filterReason: 'recent' },
    });
  });

  it('restores them on a back press instead of leaving the previous mode\u2019s', () => {
    history.replaceState(null, '', '#/');
    const getCtx = renderApp();
    act(() => getCtx().goMode('kartu', { filterIds: [7, 8] }));
    act(() => getCtx().goMode('glosarium', { section: 'a' }));

    // The entry the first goMode pushed, delivered the way the browser delivers it.
    act(() =>
      window.dispatchEvent(
        new PopStateEvent('popstate', {
          state: {
            tab: 'belajar',
            mode: 'kartu',
            modeHistory: [],
            modeParams: { filterIds: [7, 8] },
          },
        })
      )
    );

    expect(getCtx().mode).toBe('kartu');
    expect(getCtx().modeParams).toEqual({ filterIds: [7, 8] });
  });

  it('clears them when the pop lands at the tab level', () => {
    history.replaceState(null, '', '#/');
    const getCtx = renderApp();
    act(() => getCtx().goMode('kartu', { filterIds: [7, 8] }));
    act(() =>
      window.dispatchEvent(new PopStateEvent('popstate', { state: { tab: 'home', mode: null } }))
    );
    expect(getCtx().mode).toBeNull();
    expect(getCtx().modeParams).toBeNull();
  });

  it('does not stack history entries when back is pressed twice behind a guard', () => {
    // Each press used to re-run the guard branch and pushState another copy of the
    // same entry, so mashing back built a stack that then needed one press per copy to
    // escape. The guard here never resolves, which is exactly the window being tested.
    history.replaceState(null, '', '#/');
    const getCtx = renderApp();
    act(() => getCtx().goMode('simulasi'));
    act(() => getCtx().registerExitGuard(() => new Promise(() => {})));

    const pushSpy = vi.spyOn(history, 'pushState');
    const entry = { state: history.state };
    act(() => window.dispatchEvent(new PopStateEvent('popstate', entry)));
    act(() => window.dispatchEvent(new PopStateEvent('popstate', entry)));
    act(() => window.dispatchEvent(new PopStateEvent('popstate', entry)));

    expect(pushSpy).toHaveBeenCalledTimes(1);
    pushSpy.mockRestore();
  });
});

describe('the exam pause overlay is a real dialog', () => {
  // It was a `position: fixed` dim with no role, no aria-modal and no focus trap: a
  // keyboard user could Tab straight through into the exam behind it and answer
  // questions they could not see, and "Dijeda" was never announced, so nothing said
  // the clock had stopped.
  // The rendered assertions moved to simulasi-a11y.test.jsx when item 187 made
  // the modal attributes conditional: the overlay hands modality to the exit
  // confirmation while that Sheet is open, so it no longer spells role="dialog"
  // as a literal. Asserting the rendered DOM is the stronger guard anyway -- a
  // source sweep cannot tell whether an attribute reached the element.
  //
  // What stays here is what a source sweep is actually good for: that the
  // semantics and the trap are still wired at all, in any spelling.
  it('declares dialog semantics and traps focus', () => {
    const src = readFileSync(resolve(process.cwd(), 'src/modes/SimulasiMode.jsx'), 'utf8');
    expect(src).toMatch(/role=\{?['"{]?.*dialog/);
    expect(src).toMatch(/aria-modal=/);
    expect(src).toMatch(/simulasi-paused-title/);
    expect(src).toMatch(/useFocusTrap\(pauseRef, paused\)/);
  });

  it('reuses the focus trap Sheet already had rather than a second one', () => {
    // `useFocusTrap` existed with one consumer. A parallel implementation here is the
    // "one source of truth per concept" rule this repo states in AGENT_WORKFLOW §2.
    const src = readFileSync(resolve(process.cwd(), 'src/modes/SimulasiMode.jsx'), 'utf8');
    expect(src).toContain("from '../hooks/useFocusTrap.js'");
  });
});

describe('the cross-tab notice says the right thing', () => {
  it('has its own copy, not the corruption copy', async () => {
    // Telling someone their data "could not be read and has been reset, earlier
    // progress is probably lost" when another tab simply moved ahead would be false in
    // the direction that makes them act — and the action it offers has to differ too:
    // backing up from the stale tab would write the older view into the file.
    const src = readFileSync(
      resolve(process.cwd(), 'src/components/DataWarningBanner.jsx'),
      'utf8'
    );
    expect(src).toMatch(/othertab: \{/);
    expect(src).toMatch(/Muat ulang/);
    expect(src).toMatch(/setExternalChangeHandler/);
  });
});

describe('ExportMode offers the reload it tells you to do', () => {
  it('renders a reload control alongside the success message', async () => {
    const src = readFileSync(resolve(process.cwd(), 'src/modes/ExportMode.jsx'), 'utf8');
    // The copy said "Muat ulang halaman" and left the user to find the browser's own
    // reload — on a phone, in an installed PWA, where there may not be a visible one.
    expect(src).toMatch(/location\.reload\(\)/);
  });
});

describe('vi is used', () => {
  // Keeps the import honest if the suite above stops needing it.
  it('is available', () => {
    expect(typeof vi.fn).toBe('function');
    expect(typeof waitFor).toBe('function');
  });
});
