// ─── tests/a11y-polish.test.jsx ──────────────────────────────────────────────
// UI_UX_PLAN items 136, 137, 139 (corrected), 140, 141 and 142.
//
// Each is small on its own. What they share is that every one of them was
// invisible to the checks already in place: a hint string that names keys, a
// literal 'smooth', a padding value, and a colour pair are all well-formed.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { render, screen } from '@testing-library/react';
import { contrastRatio, readableOn, INK_DARK } from '../utils/contrast.js';
import { MODE_META } from '../router/modes.js';
import QuizShell from '../components/QuizShell.jsx';
import FlashcardMode from '../modes/FlashcardMode/index.jsx';
import { ToastProvider } from '../components/Toast.jsx';
import { ConfirmProvider } from '../components/ConfirmDialog.jsx';
import { AppProvider } from '../contexts/AppContext.jsx';

const read = (p) => readFileSync(resolve(process.cwd(), p), 'utf8');

const makeQuestion = (n) => ({
  question: '安全帯',
  options: Array.from({ length: n }, (_, i) => ({ text: `pilihan ${i + 1}` })),
  correctIdx: 0,
});

describe('136 — the keyboard hint promises only keys that exist', () => {
  it.each([2, 3, 4])('names 1–%i for a %i-option question', (n) => {
    render(
      <QuizShell questions={[makeQuestion(n)]} onFinish={() => {}} onExit={() => {}} title="Tes" />
    );
    expect(screen.getByText(new RegExp(`Keyboard: 1–${n} pilih`))).toBeTruthy();
  });

  it('does not offer an arrow key, because there is no handler for one', () => {
    // useQuizKeyboard advances on Enter and Space only — never ArrowRight — and
    // ShortcutSheet has always listed exactly those two. The hint said "Space/→".
    const hook = read('src/hooks/useQuizKeyboard.js');
    expect(hook).not.toContain('ArrowRight');
    render(
      <QuizShell questions={[makeQuestion(4)]} onFinish={() => {}} onExit={() => {}} title="Tes" />
    );
    expect(screen.queryByText(/Space\/→/)).toBeNull();
    expect(screen.getByText(/Enter\/Space lanjut/)).toBeTruthy();
  });
});

describe('137 — JS-driven motion respects the OS setting', () => {
  it('no source file writes a literal smooth scroll behavior', () => {
    // An explicit `behavior` in the call overrides the CSS scroll-behavior that
    // global.css's reduced-motion catch-all sets, so the catch-all cannot reach
    // it. utils/motion.js is the only way to spell this.
    for (const file of ['src/modes/GlossaryMode.jsx', 'src/components/BottomNav.jsx']) {
      expect(read(file), `${file} hardcodes smooth scrolling`).not.toMatch(/behavior:\s*'smooth'/);
    }
  });

  it('routes both former offenders through the shared helper', () => {
    expect(read('src/modes/GlossaryMode.jsx')).toContain('scrollBehavior()');
    expect(read('src/components/BottomNav.jsx')).toContain('prefersReducedMotion()');
  });
});

describe('139 corrected — stopSpeech is wired, not dead', () => {
  it('the router cancels speech when the mode changes', () => {
    // Filed as "zero references, delete". It had zero *call sites* while five
    // surfaces call speakJP, which meant nothing in the app had ever cancelled
    // an utterance: tap the speaker, hit Back, and the phone reads on over the
    // next screen.
    const router = read('src/router/ModeRouter.jsx');
    expect(router).toContain('stopSpeech');
    expect(router).toMatch(/useEffect\(\(\) => stopSpeech, \[mode\]\)/);
  });
});

describe('140 — one language per control', () => {
  it('the flashcard nav buttons are Indonesian, like their own aria-labels', () => {
    // Rendered, not grepped: the source still says "← Prev" — in the comment
    // recording what it used to say.
    render(
      <ToastProvider>
        <ConfirmProvider>
          <AppProvider>
            <FlashcardMode
              cards={[{ id: 1, jp: '安全帯', id_text: 'sabuk', category: 'anzen' }]}
              known={new Set()}
              unknown={new Set()}
              onMark={() => {}}
              onResetProgress={() => {}}
              onExit={() => {}}
              starred={new Set()}
              onToggleStar={() => {}}
            />
          </AppProvider>
        </ConfirmProvider>
      </ToastProvider>
    );
    const prev = screen.getByRole('button', { name: 'Kartu sebelumnya' });
    const next = screen.getByRole('button', { name: 'Kartu berikutnya' });
    // The visible label and the announced label used to be different languages.
    expect(prev.textContent).toContain('Sebelumnya');
    expect(next.textContent).toContain('Berikutnya');
  });

  it('no English aria-label survives in the components', () => {
    expect(read('src/components/JpDisplay.jsx')).not.toContain('aria-label="Toggle');
  });
});

describe('141 — the toast dismiss button clears the tap floor', () => {
  it('is sized by --tap-min rather than by its glyph', () => {
    const css = read('src/components/Toast.module.css');
    const rule = css.slice(css.indexOf('.btnClose {'), css.indexOf('.btnClose {') + 400);
    expect(rule).toContain('min-width: var(--tap-min)');
    expect(rule).toContain('min-height: var(--tap-min)');
  });
});

describe('142 — badge ink is computed, because the background is not fixed', () => {
  const colours = Object.values(MODE_META)
    .map((m) => m.color)
    .filter((c) => typeof c === 'string' && c.startsWith('#'));

  it('has mode colours to test', () => {
    expect(colours.length).toBeGreaterThan(10);
  });

  it('always picks the higher-contrast of the two inks', () => {
    // The invariant. Whatever colours the modes carry, the badge gets the
    // better option rather than a literal chosen once for a different surface.
    for (const c of colours) {
      const ink = readableOn(c);
      const other = ink === INK_DARK ? '#ffffff' : INK_DARK;
      expect(contrastRatio(ink, c), `${ink} on ${c}`).toBeGreaterThanOrEqual(
        contrastRatio(other, c)
      );
    }
  });

  it('clears 4.5:1 on every mode accent colour but one, which is named', () => {
    // #6366f1 (Ulasan) tops out at 4.47:1 with white and 4.32:1 with the dark
    // ink — no ink clears AA on it, so the badge takes the better of the two and
    // the colour itself is what would have to change. That is a brand decision,
    // not a bug fix, so it is recorded here rather than made quietly. A NEW mode
    // colour that lands under 4.5 fails this test.
    const KNOWN_BELOW_AA = ['#6366f1'];
    const failing = colours.filter((c) => contrastRatio(readableOn(c), c) < 4.5);
    expect(failing.sort()).toEqual(KNOWN_BELOW_AA);
    // Even the exception clears the 3:1 large-text floor comfortably.
    for (const c of KNOWN_BELOW_AA) {
      expect(contrastRatio(readableOn(c), c)).toBeGreaterThan(3);
    }
  });

  it('would have failed with the hardcoded white it replaced', () => {
    // The measurement that makes this worth doing: white fails the 3:1
    // large-text floor on most of them, and is 1.53:1 on #facc15.
    const failing = colours.filter((c) => contrastRatio('#ffffff', c) < 3);
    expect(failing.length).toBeGreaterThan(5);
  });

  it('does not blanket-apply the dark ink — item 64 prescribed that and was wrong', () => {
    // --ssw-onAmber is #1a0a00, an ink for a light surface. On the red confirm
    // button and the blue offline banner, white is correct and this would be a
    // regression.
    expect(contrastRatio('#ffffff', '#dc2626')).toBeGreaterThan(4.5);
    expect(contrastRatio(INK_DARK, '#dc2626')).toBeLessThan(4.5);
    expect(readableOn('#dc2626')).toBe('#ffffff');
  });
});
