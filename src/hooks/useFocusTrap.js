import { useEffect } from 'react';

/**
 * Traps focus within `ref` when `active` is true.
 * Restores focus to the trigger element on deactivation.
 *
 * Usage:
 *   const ref = useRef(null);
 *   useFocusTrap(ref, isOpen);
 *   return <div ref={ref} role="dialog" aria-modal="true">...</div>;
 */
export function useFocusTrap(ref, active) {
  useEffect(() => {
    if (!active || !ref.current) return;

    const container = ref.current;
    const focusableSelectors = [
      'button:not([disabled])',
      '[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');

    const getFocusable = () => [...container.querySelectorAll(focusableSelectors)];
    const previousFocus = document.activeElement;

    // Focus first focusable element on activation
    const first = getFocusable()[0];
    if (first) first.focus({ preventScroll: true });

    const handler = (e) => {
      if (e.key !== 'Tab') return;
      const focusable = getFocusable();
      if (!focusable.length) return;
      const firstEl = focusable[0];
      const lastEl  = focusable[focusable.length - 1];

      if (e.shiftKey) {
        // Shift+Tab: wrap from first → last
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        }
      } else {
        // Tab: wrap from last → first
        if (document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    };

    container.addEventListener('keydown', handler);

    return () => {
      container.removeEventListener('keydown', handler);
      // Restore focus to the element that opened the overlay
      previousFocus?.focus({ preventScroll: true });
    };
  }, [active, ref]);
}
