// ─── QuizAnnouncer.jsx ────────────────────────────────────────────────────
// Screen-reader outcome announcement for graded practice modes (item 45).
//
// Verified before building this: QuizShell's own aria-live region does NOT
// announce correct/wrong, contrary to the plan's description of it as the
// reference pattern to extract — it announces question progress ("Soal X
// dari Y") and wraps the timer. There is no outcome announcement anywhere
// in the app, including in the four QuizShell-based modes the plan called
// compliant. This component is used to add one, everywhere, not just to
// extract something that already existed for the "compliant" four.
//
// Deliberately not used by SprintMode. Its Tahu/Tidak Tahu buttons are
// self-assessment, not a graded answer checked against a selection — the
// user's own tap already is the outcome, so "announcing" it back would be
// redundant rather than informative. Different interaction shape, same
// reasoning the plan already applies to keep SimulasiMode/SprintMode out of
// item 46's ResultScreen adoption.
//
// Rendered unconditionally (not returned null when there's nothing to say)
// so the live region's text content genuinely changes between answers,
// rather than the element being added/removed from the DOM each time —
// the more reliable pattern for consistent screen-reader announcement,
// matching how QuizShell's own progress region already works.

export default function QuizAnnouncer({ isCorrect, correctText }) {
  const text =
    isCorrect === null || isCorrect === undefined
      ? ''
      : isCorrect
        ? 'Benar!'
        : correctText
          ? `Salah. Jawaban yang benar: ${correctText}`
          : 'Salah.';

  return (
    <div className="sr-only" aria-live="assertive" aria-atomic="true">
      {text}
    </div>
  );
}
