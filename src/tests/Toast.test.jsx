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
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders with message text after show()', () => {
    setup('Berhasil disimpan');
    fireEvent.click(screen.getByRole('button', { name: 'show' }));
    expect(screen.getByText('Berhasil disimpan')).toBeTruthy();
  });

  it('auto-dismisses after duration', () => {
    setup('Sementara', { duration: 2000 });
    fireEvent.click(screen.getByRole('button', { name: 'show' }));
    expect(screen.getByText('Sementara')).toBeTruthy();
    act(() => {
      vi.advanceTimersByTime(2001);
    });
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
    render(
      <ToastProvider>
        <MultiTrigger />
      </ToastProvider>
    );
    fireEvent.click(screen.getByRole('button', { name: 'a' }));
    fireEvent.click(screen.getByRole('button', { name: 'b' }));
    // Both fit within MAX_VISIBLE (2), so both show immediately.
    expect(screen.getByText('Toast A')).toBeTruthy();
    expect(screen.getByText('Toast B')).toBeTruthy();
  });

  it('a third toast queues rather than being discarded, and appears once a slot frees up', () => {
    function MultiTrigger() {
      const { show } = useToast();
      return (
        <>
          <button onClick={() => show('Toast A')}>a</button>
          <button onClick={() => show('Toast B')}>b</button>
          <button onClick={() => show('Toast C')}>c</button>
        </>
      );
    }
    render(
      <ToastProvider>
        <MultiTrigger />
      </ToastProvider>
    );
    fireEvent.click(screen.getByRole('button', { name: 'a' }));
    fireEvent.click(screen.getByRole('button', { name: 'b' }));
    fireEvent.click(screen.getByRole('button', { name: 'c' }));
    // Not discarded, just not on screen yet.
    expect(screen.queryByText('Toast C')).toBeNull();

    // Dismiss A (the close button of the first toast) — C should take its slot.
    const closeButtons = screen.getAllByRole('button', { name: /tutup notifikasi/i });
    fireEvent.click(closeButtons[0]);
    expect(screen.getByText('Toast C')).toBeTruthy();
    expect(screen.getByText('Toast B')).toBeTruthy();
  });

  it('a priority toast jumps the queue ahead of already-waiting ones', () => {
    function MultiTrigger() {
      const { show } = useToast();
      return (
        <>
          <button onClick={() => show('Toast A')}>a</button>
          <button onClick={() => show('Toast B')}>b</button>
          <button onClick={() => show('Urgent', { priority: true })}>urgent</button>
          <button onClick={() => show('Toast D')}>d</button>
        </>
      );
    }
    render(
      <ToastProvider>
        <MultiTrigger />
      </ToastProvider>
    );
    fireEvent.click(screen.getByRole('button', { name: 'a' }));
    fireEvent.click(screen.getByRole('button', { name: 'b' }));
    fireEvent.click(screen.getByRole('button', { name: 'd' })); // queued behind nothing yet
    fireEvent.click(screen.getByRole('button', { name: 'urgent' })); // jumps ahead of D

    const closeButtons = screen.getAllByRole('button', { name: /tutup notifikasi/i });
    fireEvent.click(closeButtons[0]); // free a slot
    expect(screen.getByText('Urgent')).toBeTruthy();
    expect(screen.queryByText('Toast D')).toBeNull();
  });

  it('Escape dismisses the frontmost toast, not a background one', () => {
    function MultiTrigger() {
      const { show } = useToast();
      return (
        <>
          <button onClick={() => show('Toast A')}>a</button>
          <button onClick={() => show('Toast B')}>b</button>
        </>
      );
    }
    render(
      <ToastProvider>
        <MultiTrigger />
      </ToastProvider>
    );
    fireEvent.click(screen.getByRole('button', { name: 'a' }));
    fireEvent.click(screen.getByRole('button', { name: 'b' }));
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByText('Toast B')).toBeNull();
    expect(screen.getByText('Toast A')).toBeTruthy();
  });

  it('Escape is ignored while typing in a field elsewhere on the page', () => {
    function Scene() {
      const { show } = useToast();
      return (
        <>
          <input aria-label="some field" />
          <button onClick={() => show('Toast A')}>a</button>
        </>
      );
    }
    render(
      <ToastProvider>
        <Scene />
      </ToastProvider>
    );
    fireEvent.click(screen.getByRole('button', { name: 'a' }));
    const input = screen.getByRole('textbox');
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(screen.getByText('Toast A')).toBeTruthy();
  });

  it('hover pauses auto-dismiss; leaving resumes it', () => {
    setup('Sementara', { duration: 2000 });
    fireEvent.click(screen.getByRole('button', { name: 'show' }));
    const toast = screen.getByRole('status');
    fireEvent.mouseEnter(toast);
    act(() => {
      vi.advanceTimersByTime(5000); // well past duration, but paused
    });
    expect(screen.getByText('Sementara')).toBeTruthy();
    fireEvent.mouseLeave(toast);
    act(() => {
      vi.advanceTimersByTime(2001);
    });
    expect(screen.queryByText('Sementara')).toBeNull();
  });

  it('a dismissed toast does not fire its timer after unmount (no leaked setTimeout)', () => {
    const clearSpy = vi.spyOn(globalThis, 'clearTimeout');
    setup('Tutup cepat', { duration: 5000 });
    fireEvent.click(screen.getByRole('button', { name: 'show' }));
    const closeBtn = screen.getByRole('button', { name: /tutup notifikasi/i });
    fireEvent.click(closeBtn);
    expect(clearSpy).toHaveBeenCalled();
    clearSpy.mockRestore();
  });

  it('role="status" present for a11y', () => {
    setup('Tes aksesibilitas');
    fireEvent.click(screen.getByRole('button', { name: 'show' }));
    const statusEl = screen.getByRole('status');
    expect(statusEl).toBeTruthy();
  });

  it('error type uses role="alert" (implicit assertive), not a status role fighting its own aria-live', () => {
    setup('Error!', { type: 'error' });
    fireEvent.click(screen.getByRole('button', { name: 'show' }));
    expect(screen.getByRole('alert')).toBeTruthy();
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('default type keeps role="status" with no explicit aria-live override', () => {
    setup('Info biasa', { type: 'default' });
    fireEvent.click(screen.getByRole('button', { name: 'show' }));
    const toast = screen.getByRole('status');
    expect(toast.getAttribute('aria-live')).toBeNull();
  });
});
