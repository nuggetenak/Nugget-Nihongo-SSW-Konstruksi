// ─── tests/flashcard-session-audio.test.jsx ──────────────────────────────────
// Items 75 and 76, both about `kartu` being the exception to a rule nobody had
// written down.
//
// 75: every study mode in the prop map is handed onSessionEnd or onFinish
// except this one, so progress.sessions — what StatsMode, session-analytics and
// the heatmap all read — had never seen a minute of the app's most-opened mode.
// The shape decision: a flashcard sitting ends when you leave it, not every N
// cards. Flashcards have no natural length; the reader decides when to stop.
//
// 76: `kartu` never called speakJP at all — the one mode that shows a Japanese
// term and asks you to recall its meaning had no way to hear it.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ToastProvider } from '../components/Toast.jsx';
import { ConfirmProvider } from '../components/ConfirmDialog.jsx';
import { AppProvider } from '../contexts/AppContext.jsx';
import { _reset_for_test, init } from '../storage/engine.js';
import FlashcardMode from '../modes/FlashcardMode/index.jsx';

const CARDS = [
  { id: 1, jp: '配管《はいかん》', id_text: 'perpipaan', category: 'haikan' },
  { id: 2, jp: '電気', id_text: 'listrik', category: 'denki' },
];

function setup(props = {}) {
  return render(
    <ToastProvider>
      <ConfirmProvider>
        <AppProvider>
          <FlashcardMode
            cards={CARDS}
            known={new Set()}
            unknown={new Set()}
            onMark={() => {}}
            onResetProgress={() => {}}
            onExit={() => {}}
            starred={new Set()}
            onToggleStar={() => {}}
            {...props}
          />
        </AppProvider>
      </ConfirmProvider>
    </ToastProvider>
  );
}

/** Flip, then rate. `label` is one of Lagi / Susah / Oke / Mudah. */
const rate = (label) => {
  fireEvent.click(screen.getByLabelText('Balik kartu'));
  fireEvent.click(screen.getByRole('button', { name: new RegExp(`^Nilai ${label}`) }));
};

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  sessionStorage.setItem('ssw-fc-sort', 'original');
  _reset_for_test();
  init();
});

describe('kartu records a session (item 75)', () => {
  it('reports what was rated when the mode is left', () => {
    const onSessionEnd = vi.fn();
    const { unmount } = setup({ onSessionEnd });

    rate('Oke');
    unmount();

    expect(onSessionEnd).toHaveBeenCalledTimes(1);
    const [session] = onSessionEnd.mock.calls[0];
    expect(session.total).toBe(1);
    expect(session.correct).toBe(1);
    expect(session.durationMs).toBeGreaterThanOrEqual(0);
  });

  it('counts Oke and Mudah as known, Lagi and Susah as not', () => {
    const onSessionEnd = vi.fn();
    const { unmount } = setup({ onSessionEnd });

    rate('Lagi'); // card 1 — advances after 400ms, but the tally is immediate
    unmount();

    const [session] = onSessionEnd.mock.calls[0];
    expect(session.total).toBe(1);
    expect(session.correct).toBe(0);
  });

  it('a sitting with nothing rated is not a session', () => {
    const onSessionEnd = vi.fn();
    const { unmount } = setup({ onSessionEnd });

    // Opened, flipped a card, read it, left. That is not study to record.
    fireEvent.click(screen.getByLabelText('Balik kartu'));
    unmount();

    expect(onSessionEnd).not.toHaveBeenCalled();
  });

  it('records once per sitting, not once per card', () => {
    // The decision this item asked for: leaving ends the session, so one visit
    // is one row in progress.sessions however many cards it covered.
    const onSessionEnd = vi.fn();
    const { unmount } = setup({ onSessionEnd });

    rate('Oke');
    unmount();

    expect(onSessionEnd).toHaveBeenCalledTimes(1);
  });

  it('works without the prop, for any caller that does not pass it', () => {
    const { unmount } = setup();
    rate('Oke');
    expect(() => unmount()).not.toThrow();
  });
});

/** What speechSynthesis was asked to say, this test. */
let spoken = [];

/** Give jsdom the Web Speech API for the duration of one test. */
function withVoice(fn) {
  spoken = [];
  class Utterance {
    constructor(text) {
      this.text = text;
    }
  }
  vi.stubGlobal('SpeechSynthesisUtterance', Utterance);
  vi.stubGlobal('speechSynthesis', {
    speak: (u) => spoken.push(u.text),
    cancel: () => {},
    getVoices: () => [],
  });
  try {
    fn();
  } finally {
    vi.unstubAllGlobals();
  }
}

describe('kartu can speak its card (item 76)', () => {
  it('offers no speaker button when audio is off', () => {
    setup({ audioEnabled: false });
    expect(screen.queryByLabelText('Putar audio')).toBeNull();
  });

  it('offers none when the platform has no voice, even with audio on', () => {
    // jsdom has no speechSynthesis, so canSpeak() is false here. A speaker
    // button that cannot make a sound is worse than no button.
    setup({ audioEnabled: true });
    expect(screen.queryByLabelText('Putar audio')).toBeNull();
  });

  it('offers one, and speaks the card, once both the pref and a voice are there', () => {
    withVoice(() => {
      setup({ audioEnabled: true });
      const btn = screen.getByLabelText('Putar audio');
      fireEvent.click(btn);
      expect(spoken).toHaveLength(1);
      // Ruby markers are stripped: 配管《はいかん》 must not be read aloud as
      // its own furigana, the same convention every other speakJP site uses.
      expect(spoken[0]).toBe('配管');
    });
  });

  it('tapping the speaker does not also flip the card', () => {
    withVoice(() => {
      const { container } = setup({ audioEnabled: true });
      fireEvent.click(screen.getByLabelText('Putar audio'));
      expect(container.querySelector('.fc-card').classList.contains('is-flipped')).toBe(false);
    });
  });

  it('does not speak on its own — the button is the only way', () => {
    // A card that spoke on arrival would answer a reading question before it
    // was asked. This is why `speakOnFlip` stays a Ulasan-only preference.
    withVoice(() => {
      setup({ audioEnabled: true });
      fireEvent.click(screen.getByLabelText('Balik kartu'));
      expect(spoken).toEqual([]);
    });
  });
});
