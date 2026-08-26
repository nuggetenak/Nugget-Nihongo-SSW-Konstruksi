// ─── typo-diff.js ──────────────────────────────────────────────────────────
// Item 60 (2026-08-26): "Showing the diff turns a typo into a spelling
// lesson." Both free-text modes (ProductionMode, QuizProduksiMode) already
// showed "Kamu: X" / "Jawaban: Y" as two separate facts -- this computes the
// actual character-level difference between them so the specific typo can
// be highlighted, not just left for the learner to spot by eye.
//
// Naive index-by-index comparison (input[i] !== answer[i]) breaks badly on
// the most common real typos -- a single missing or extra letter shifts
// every character after it, making the whole rest of the word look wrong
// even though only one letter actually differs. This is a real risk on the
// audience's actual device (phone keyboards, easy to miss/double a
// keystroke), so this uses proper alignment (edit distance via dynamic
// programming) instead, producing a sequence of 'match' / 'sub' / 'ins' /
// 'del' operations that correctly localizes the real difference regardless
// of length mismatch.

/**
 * Aligns `input` against `answer` and returns the edit operations needed to
 * turn one into the other, e.g. for "keselamaton" vs "keselamatan":
 *   [...8 'match' ops..., {op:'sub', from:'o', to:'a'}, ...2 more 'match'...]
 *
 * @param {string} input - what the user typed
 * @param {string} answer - the expected answer
 * @returns {Array<{op: 'match'|'sub'|'ins'|'del', from?: string, to?: string, char?: string}>}
 */
export function diffChars(input, answer) {
  const a = [...input];
  const b = [...answer];
  const m = a.length;
  const n = b.length;

  // Standard edit-distance DP table, but keeping the actual choice at each
  // cell (not just the cost) so the operations can be reconstructed, not
  // just counted.
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // Walk back from [m][n] to reconstruct the operations, then reverse.
  const ops = [];
  let i = m;
  let j = n;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
      ops.push({ op: 'match', char: a[i - 1] });
      i--;
      j--;
    } else if (i > 0 && j > 0 && dp[i][j] === dp[i - 1][j - 1] + 1) {
      ops.push({ op: 'sub', from: a[i - 1], to: b[j - 1] });
      i--;
      j--;
    } else if (i > 0 && dp[i][j] === dp[i - 1][j] + 1) {
      ops.push({ op: 'del', char: a[i - 1] }); // extra letter typed
      i--;
    } else {
      ops.push({ op: 'ins', char: b[j - 1] }); // missing letter
      j--;
    }
  }
  ops.reverse();
  return ops;
}
