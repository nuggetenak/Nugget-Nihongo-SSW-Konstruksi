// ─── tests/question-photo.test.jsx ───────────────────────────────────────────
// The rendering half of the JAC photo work. `jac-question-images.test.js` holds
// the data; this holds that the data reaches the screen, through both surfaces
// that show a question -- `QuizShell` (jac, wayground, vocab) and
// `SimulasiMode`, which draws its own question card and had its own copy of the
// photo markup.
//
// The `alt` assertions are the point of the file. A quiz photo with no alt is an
// unanswerable question for a screen-reader user, and `alt=""` would be worse
// than missing: it declares the image decorative, which for the one element
// carrying the question's content is a lie.
// ─────────────────────────────────────────────────────────────────────────────
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import QuestionPhoto from '../components/QuestionPhoto.jsx';
import { JAC_OFFICIAL } from '../data/jac-official.js';
import { mapQuestions } from '../modes/JACMode.jsx';
import { buildJacPool } from '../modes/SimulasiMode.jsx';

const withPhoto = JAC_OFFICIAL.find((q) => q.img);

describe('QuestionPhoto', () => {
  it('renders the image, with the description as its alt text', () => {
    render(<QuestionPhoto img={withPhoto.img} photoDesc={withPhoto.photoDesc} hasPhoto />);
    const img = screen.getByRole('img');
    expect(img.getAttribute('src')).toContain(withPhoto.img);
    expect(img.getAttribute('alt')).toBe(withPhoto.photoDesc);
    expect(img.getAttribute('alt')).not.toBe('');
  });

  it('prefixes BASE_URL rather than hard-coding the deploy path', () => {
    render(<QuestionPhoto img="images/jac-official/tt1_q10.webp" photoDesc="x" hasPhoto />);
    expect(screen.getByRole('img').getAttribute('src')).toBe(
      `${import.meta.env.BASE_URL}images/jac-official/tt1_q10.webp`
    );
  });

  it('still has an alt when a question carries an image but no description', () => {
    render(<QuestionPhoto img="images/jac-official/tt1_q10.webp" hasPhoto />);
    expect(screen.getByRole('img').getAttribute('alt')).toBeTruthy();
  });

  it('fades the photo in once it has loaded, and not before (item 168)', () => {
    render(<QuestionPhoto img="images/jac-official/tt1_q10.webp" photoDesc="x" hasPhoto />);
    const img = screen.getByRole('img');
    // The frame reserves the height either way, so this is purely about the
    // photo appearing rather than snapping in at full strength in a box that
    // was empty a moment ago.
    expect(img.dataset.loaded).toBe('false');
    fireEvent.load(img);
    expect(img.dataset.loaded).toBe('true');
  });

  it('a second question starts its own fade rather than inheriting the first', () => {
    // Neither caller remounts this component -- QuizShell and SimulasiMode both
    // render one <QuestionPhoto> and change its props as the question advances
    // -- so without a reset keyed on `img`, every photo after the first would
    // appear at full strength. That is what this asserts; it is not the same
    // statement as the test above.
    const { rerender } = render(<QuestionPhoto img="images/a.webp" hasPhoto />);
    fireEvent.load(screen.getByRole('img'));
    expect(screen.getByRole('img').dataset.loaded).toBe('true');

    rerender(<QuestionPhoto img="images/b.webp" hasPhoto />);
    expect(screen.getByRole('img').dataset.loaded).toBe('false');
  });

  it('falls back to the written description when there is no asset yet', () => {
    render(<QuestionPhoto photoDesc="Sebuah alat genggam" hasPhoto />);
    expect(screen.queryByRole('img')).toBeNull();
    expect(screen.getByText(/Sebuah alat genggam/)).toBeTruthy();
  });

  it('renders nothing at all for an ordinary text question', () => {
    const { container } = render(<QuestionPhoto />);
    expect(container.innerHTML).toBe('');
  });

  it("says the photo is the exam board's, not ours", () => {
    render(<QuestionPhoto img={withPhoto.img} photoDesc={withPhoto.photoDesc} hasPhoto />);
    expect(screen.getByText(/JAC/)).toBeTruthy();
  });
});

describe('the photo reaches both question surfaces', () => {
  it('JACMode carries img through to the shape QuizShell renders', () => {
    const mapped = mapQuestions(
      JAC_OFFICIAL.filter((q) => q.img),
      true
    );
    expect(mapped.length).toBe(12);
    for (const m of mapped) {
      expect(m.img).toMatch(/^images\/jac-official\//);
      expect(m.hasPhoto).toBe(true);
      expect(m.photoDesc).toBeTruthy();
    }
  });

  it('JACMode no longer overwrites the hint with the photo description', () => {
    // It used to, which cost the twelve photo questions their Indonesian gloss
    // and printed the same sentence twice on screen.
    const [first] = mapQuestions(
      JAC_OFFICIAL.filter((q) => q.img),
      true
    );
    expect(first.hint).toBeNull();
    expect(first.questionSub).toBeTruthy(); // the gloss is still there
  });

  it('SimulasiMode carries img through its own pool mapper', () => {
    const pool = buildJacPool();
    expect(pool.length).toBeGreaterThan(0);
    for (const q of pool) {
      // Every photo question in the pool has an asset; every other has null.
      if (q.hasPhoto) expect(q.img).toBeTruthy();
      else expect(q.img).toBeNull();
    }
  });
});
