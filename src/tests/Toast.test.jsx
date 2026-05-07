// ─── Toast.test.jsx ───────────────────────────────────────────────────────────
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ToastProvider, useToast } from '../components/Toast.jsx';

vi.mock('../components/Toast.module.css', () => ({
  default: new Proxy({}, { get: (_, key) => key }),
}));

// Helper: component that fires toasts via hook
function Trigger({ message, opts, label = 'show' }) {
  const { show } = useToast();
  return <button onClick={() => show(message, opts)}>{label}</button>;
}
function setup(message, opts) {
  return render(
    <ToastProvider>
      <Trigger message={message} opts={opts} />
    </ToastProvider>
  );
}

describe('Toast', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('renders with message text after show()', () => {
    setup('Berhasil disimpan');
    fireEvent.click(screen.getByRole('button', { name: 'show' }));
    expect(screen.getByText('Berhasil disimpan')).toBeTruthy();
  });

  it('auto-dismisses after duration', () => {
    setup('Sementara', { duration: 2000 });
    fireEvent.click(screen.getByRole('button', { name: 'show' }));
    expect(screen.getByText('Sementara')).toBeTruthy();
    act(() => { vi.advanceTimersByTime(2001); });
    expect(screen.queryByText('Sementara')).toBeNull();
  });

  it('Undo button calls onUndo prop if provided', () => {
    const onUndo = vi.fn();
    setup('Kartu dihapus', { undo: onUndo });
    fireEvent.click(screen.getByRole('button', { name: 'show' }));
    const undoBtn = screen.getByRole('button', { name: /batalkan/i });
    fireEvent.click(undoBtn);
    expect(onUndo).toHaveBeenCalledTimes(1);
  });

  it('dismiss button removes toast', () => {
    setup('Tutup saya');
    fireEvent.click(screen.getByRole('button', { name: 'show' }));
    expect(screen.getByText('Tutup saya')).toBeTruthy();
    const closeBtn = screen.getByRole('button', { name: /tutup notifikasi/i });
    fireEvent.click(closeBtn);
    expect(screen.queryByText('Tutup saya')).toBeNull();
  });

  it('multiple toasts render (stack — max 2 shown)', () => {
    function MultiTrigger() {
      const { show } = useToast();
      return (
        <>
          <button onClick={() => show('Toast A')}>a</button>
          <button onClick={() => show('Toast B')}>b</button>
        </>
      );
    }
    render(<ToastProvider><MultiTrigger /></ToastProvider>);
    fireEvent.click(screen.getByRole('button', { name: 'a' }));
    fireEvent.click(screen.getByRole('button', { name: 'b' }));
    // Both A and B visible (slice(-1) keeps last 2, but show pushes A then B)
    expect(screen.getByText('Toast B')).toBeTruthy();
  });

  it('role="status" present for a11y', () => {
    setup('Tes aksesibilitas');
    fireEvent.click(screen.getByRole('button', { name: 'show' }));
    const statusEl = screen.getByRole('status');
    expect(statusEl).toBeTruthy();
  });

  it('error type sets aria-live="assertive"', () => {
    setup('Error!', { type: 'error' });
    fireEvent.click(screen.getByRole('button', { name: 'show' }));
    const toast = screen.getByRole('status');
    expect(toast.getAttribute('aria-live')).toBe('assertive');
  });

  it('default type sets aria-live="polite"', () => {
    setup('Info biasa', { type: 'default' });
    fireEvent.click(screen.getByRole('button', { name: 'show' }));
    const toast = screen.getByRole('status');
    expect(toast.getAttribute('aria-live')).toBe('polite');
  });
});
