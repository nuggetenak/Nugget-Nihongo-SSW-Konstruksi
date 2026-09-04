// ─── QuizProduksiMode.test.jsx ───────────────────────────────────────────────
// B1: Quiz Production Mode — JP shown, user types Indonesian
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import QuizProduksiMode from '../modes/QuizProduksiMode.jsx';

vi.mock('../styles/theme.js', () => ({ T: new Proxy({}, { get: (_, k) => k }) }));
vi.mock('../utils/speak.js', () => ({ speakJP: vi.fn(), canSpeak: () => false }));
vi.mock('../utils/haptic.js', () => ({
  haptic: { correct: vi.fn(), wrong: vi.fn(), tap: vi.fn() },
}));
vi.mock('../contexts/ProgressContext.jsx', () => ({
  useProgress: () => ({ recordWrong: vi.fn() }),
}));
vi.mock('../components/ProgressBar.jsx', () => ({
  default: () => <div data-testid="progress-bar" />,
}));
vi.mock('./modes.module.css', () => ({ default: new Proxy({}, { get: (_, k) => k }) }));

const SAMPLE_CARDS = [
  { id: 1, jp: '朝礼《ちょれい》', id_text: 'Apel pagi', category: 'salam', desc: '' },
  {
    id: 2,
    jp: '安全帯《あんぜんたい》',
    id_text: 'Sabuk pengaman',
    category: 'keselamatan',
    desc: '',
  },
  { id: 3, jp: '足場《あしば》', id_text: 'Perancah', category: 'alat_umum', desc: '' },
];

const renderMode = (props = {}) =>
  render(<QuizProduksiMode cards={SAMPLE_CARDS} onExit={vi.fn()} {...props} />);

describe('QuizProduksiMode (B1)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the start screen', () => {
    // The mode's own <h2> title came out 2026-09-04: ModeHeader renders the
    // mode's name as the page <h1> for all 21 modes, and every one of them was
    // repeating it one line further down. What identifies this screen is its
    // instruction line and its start button, both of which are its own.
    renderMode();
    expect(screen.getByText(/ketik terjemahan Indonesia/i)).toBeTruthy();
    expect(screen.getByText('Mulai 🔤')).toBeTruthy();
  });

  it('shows card count options on start screen', () => {
    renderMode();
    expect(screen.getByText('10')).toBeTruthy();
    expect(screen.getByText('20')).toBeTruthy();
    expect(screen.getByText('30')).toBeTruthy();
  });

  it('starts session and shows JP term', () => {
    renderMode();
    fireEvent.click(screen.getByText('Mulai 🔤'));
    // Should show a Japanese term (component renders stripFuri(card.jp))
    const jpTexts = SAMPLE_CARDS.map((c) => c.jp.replace(/《[^》]*》/g, ''));
    const found = jpTexts.some((jp) => screen.queryByText(jp));
    expect(found).toBe(true);
  });

  it('shows input field after start', () => {
    renderMode();
    fireEvent.click(screen.getByText('Mulai 🔤'));
    expect(screen.getByPlaceholderText('Ketik terjemahan Indonesia...')).toBeTruthy();
  });

  it('enables kirim button only when input non-empty', () => {
    renderMode();
    fireEvent.click(screen.getByText('Mulai 🔤'));
    const kirimBtn = screen.getByText('Kirim →');
    expect(kirimBtn.disabled).toBe(true);
    fireEvent.change(screen.getByPlaceholderText('Ketik terjemahan Indonesia...'), {
      target: { value: 'test' },
    });
    expect(kirimBtn.disabled).toBe(false);
  });

  it('shows skip button', () => {
    renderMode();
    fireEvent.click(screen.getByText('Mulai 🔤'));
    expect(screen.getByText('Lewati ⏭')).toBeTruthy();
  });

  it('renders no back control of its own — ModeHeader owns that now', () => {
    // Same change as above. Leaving the mode is the shared header's job, so a
    // second control here would be the duplication that consolidation removed.
    // The assertion is kept (rather than deleted) so re-adding one is a visible
    // decision rather than a quiet drift back.
    renderMode();
    expect(screen.queryByText('← Kembali')).toBeNull();
  });
});
