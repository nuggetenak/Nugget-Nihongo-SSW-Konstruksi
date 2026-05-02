# 📋 CONTENT-VERIFICATION-REPORT

> **Date:** 2026-05-02
> **Auditor:** Crunchy (Opus 4.6)
> **Method:** Automated term matching against JAC textbook markdown (text1l–text7l)
> **Caveat:** JAC PDFs were converted to markdown by the user — some OCR/conversion artifacts may cause false negatives. Match rates are conservative lower bounds.

## Results Summary

| Classification | Cards | % | Source tag |
|---------------|-------|---|------------|
| ✅ Verified — term exists in JAC text | 889 | 63% | `jac-ch1`–`jac-ch7`, `vocab-*` (verified subset) |
| 🟡 Synthesized — JAC-derived compound study cards | 206 | 15% | `jac-ch1`–`jac-ch7` (compound terms) |
| 🔧 Supplementary — valid construction terms, not in JAC textbook | 270 | 19% | `vocab-supplementary` |
| 📎 General — common words, not construction-specific | 45 | 3% | `vocab-general` |

## Fixes Applied

1. **23 wrong chapter source tags corrected** — e.g., card claimed `jac-ch5` but term was found in `jac-ch6`
2. **315 vocab cards relabeled** — cards not traceable to JAC textbook now have honest `vocab-supplementary` or `vocab-general` source tags instead of misleading `vocab-exam`/`vocab-lifeline` labels

## Interpretation

**The 206 "synthesized" cards** are NOT errors. They're study aids that package JAC content into memorable groupings like `鉄骨構造の種類（ブレース・ラーメン・トラス）`. The individual terms (ブレース, ラーメン, トラス) ARE in JAC — the card just groups them. These are pedagogically valuable.

**The 270 "supplementary" cards** are real construction vocabulary (真空引き, 凍結防止, 圧力試験) that a construction worker would encounter on site. They're not in the JAC textbook but they're not wrong. They're honestly labeled now.

**The 45 "general" cards** are common Japanese words (油, 錆, 記録) that appear in construction contexts. Useful for N4-N3 learners but not construction-specific.

## What Could NOT Be Verified

- **Accuracy of `desc` and `id_text` content** — term existence was checked, but whether the Indonesian explanation is correct was not audited. This requires human review.
- **Romaji accuracy** — not cross-referenced.
- **Sipil/bangunan track content** — text5d/5k/6d/6k/7d/7k PDFs not available. The 45+45 seed quiz questions and the 67+90 reclassified cards could not be verified against JAC sipil/bangunan textbooks.

## Verification Methodology

```
For each card:
  1. Extract core JP term (strip parentheticals, vs comparisons)
  2. Search normalized JAC text (furigana lines removed)
  3. If not found, try kanji-only match (remove hiragana/katakana)
  4. Record which chapter(s) contain the term
  5. Compare against claimed source field
```

This is a TERM EXISTENCE check, not a CONTENT ACCURACY check. A card could have the right term but wrong explanation.
