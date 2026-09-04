// ─── tests/global-keyboard.test.jsx ───────────────────────────────────────────
// item 20: Escape exits a mode, ? opens the shortcut sheet, 1/2/3 switch
// tabs -- but only when nothing else should be claiming those keys. The two
// guards (isTypingTarget, an open dialog/sheet) are the part actually worth
// testing; the plain "does Escape call exitMode" path is the easy half.
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { createElement } from 'react';
import { _reset_for_test } from '../storage/engine.js';
import { AppProvider, useApp } from '../contexts/AppContext.jsx';
import { ToastProvider } from '../components/Toast.jsx';
import { ConfirmProvider, useConfirm } from '../components/ConfirmDialog.jsx';
import GlobalKeyboardLayer from '../components/GlobalKeyboardLayer.jsx';

beforeEach(() => {
  localStorage.clear();
  _reset_for_test();
  history.replaceState(null, '', '#/');
});

function Harness({ onCtx, withConfirmTrigger = false }) {
  const app = useApp();
  onCtx(app);
  return (
    <>
      <GlobalKeyboardLayer />
      {withConfirmTrigger && <ConfirmTrigger />}
      <input aria-label="a text field" />
    </>
  );
}

function ConfirmTrigger() {
  const confirm = useConfirm();
  return <button onClick={() => confirm('Yakin?')}>ask</button>;
}

function renderHarness(props = {}) {
  let ctx;
  render(
    createElement(
      ToastProvider,
      null,
      createElement(
        ConfirmProvider,
        null,
        createElement(
          AppProvider,
          null,
          createElement(Harness, { onCtx: (c) => (ctx = c), ...props })
        )
      )
    )
  );
  return () => ctx;
}

describe('GlobalKeyboardLayer', () => {
  it('Escape exits the current mode', () => {
    const getCtx = renderHarness();
    act(() => {
      getCtx().goMode('kartu');
    });
    expect(getCtx().mode).toBe('kartu');

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(getCtx().mode).toBeNull();
  });

  it('Escape at the tab level (no mode open) does nothing harmful', () => {
    const getCtx = renderHarness();
    expect(() => fireEvent.keyDown(window, { key: 'Escape' })).not.toThrow();
    expect(getCtx().mode).toBeNull();
  });

  it('1/2/3 switch tabs when no mode is open', () => {
    const getCtx = renderHarness();
    fireEvent.keyDown(window, { key: '2' });
    expect(getCtx().tab).toBe('belajar');
    fireEvent.keyDown(window, { key: '3' });
    expect(getCtx().tab).toBe('saya');
  });

  it('digit keys do not switch tabs while a mode is open -- so they stay free for useQuizKeyboard', () => {
    const getCtx = renderHarness();
    act(() => {
      getCtx().goMode('kuis');
    });
    fireEvent.keyDown(window, { key: '2' });
    expect(getCtx().tab).toBe('home'); // unchanged
    expect(getCtx().mode).toBe('kuis'); // still in the mode
  });

  it('? opens the shortcut sheet', () => {
    renderHarness();
    expect(screen.queryByText('⌨️ Pintasan Keyboard')).toBeNull();
    fireEvent.keyDown(window, { key: '?' });
    expect(screen.getByText('⌨️ Pintasan Keyboard')).toBeInTheDocument();
  });

  it('none of the shortcuts fire while focus is in a text field (isTypingTarget guard)', () => {
    const getCtx = renderHarness();
    act(() => {
      getCtx().goMode('kartu');
    });
    const input = screen.getByLabelText('a text field');
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(getCtx().mode).toBe('kartu'); // unaffected
    fireEvent.keyDown(input, { key: '?' });
    expect(screen.queryByText('⌨️ Pintasan Keyboard')).toBeNull();
  });

  it('Escape does not exit the mode underneath an open confirm dialog -- it only cancels the dialog', async () => {
    const getCtx = renderHarness({ withConfirmTrigger: true });
    act(() => {
      getCtx().goMode('kartu');
    });
    fireEvent.click(screen.getByText('ask'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await act(async () => {
      fireEvent.keyDown(window, { key: 'Escape' });
    });

    // The dialog closed (Sheet's own Escape handling)...
    expect(screen.queryByRole('dialog')).toBeNull();
    // ...but the mode underneath is untouched -- this Escape press was
    // consumed by the dialog, not double-handled by the global layer.
    expect(getCtx().mode).toBe('kartu');
  });

  it('? does not open the shortcut sheet while a confirm dialog is open', () => {
    renderHarness({ withConfirmTrigger: true });
    fireEvent.click(screen.getByText('ask'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    fireEvent.keyDown(window, { key: '?' });
    expect(screen.queryByText('⌨️ Pintasan Keyboard')).toBeNull();
  });
});
