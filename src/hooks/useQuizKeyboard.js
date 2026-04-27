// ─── useQuizKeyboard — Unified keyboard handling for all quiz modes ──────────
import { useEffect } from "react";

/**
 * React hook for quiz keyboard shortcuts.
 *
 * @param {Object} config
 * @param {Function} config.onSelect  - Called with option index (0-3) when 1/2/3/4 pressed
 * @param {Function} config.onNext    - Called when Enter/Space pressed after answering
 * @param {*}        config.selected  - Current selected answer (null = not answered yet)
 * @param {string}   config.phase     - "playing" | "finished" etc.
 * @param {number}   config.optCount  - Number of options (default 4)
 * @param {boolean}  config.enabled   - Whether shortcuts are active (default true)
 *
 * Shortcuts:
 *   1/2/3/4 or a/b/c/d → select option (only when selected === null)
 *   Enter or Space     → next question (only when selected !== null)
 */
export function useQuizKeyboard({ onSelect, onNext, selected, phase = "playing", optCount = 4, enabled = true }) {
  useEffect(() => {
    if (!enabled || phase !== "playing") return;

    const handler = (e) => {
      const MAP = { "1": 0, "2": 1, "3": 2, "4": 3, "a": 0, "b": 1, "c": 2, "d": 3 };
      const k = e.key.toLowerCase();

      if (selected === null && MAP[k] !== undefined && MAP[k] < optCount) {
        onSelect(MAP[k]);
      } else if (selected !== null && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        onNext();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onSelect, onNext, selected, phase, optCount, enabled]);
}
