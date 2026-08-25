// ─── tests/ConfirmDialog.test.jsx ─────────────────────────────────────────────
// item 15: ConfirmDialog set role="dialog" aria-modal="true" but had no focus
// trap and no Escape handler — a promise aria-modal makes to assistive tech
// that nothing here kept. useFocusTrap already existed with zero consumers;
// this is what it was written for.
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ConfirmProvider, useConfirm } from '../components/ConfirmDialog.jsx';

function Trigger({ onResult, args = ['Yakin?'] }) {
  const confirm = useConfirm();
  return (
    <>
      <button onClick={() => confirm(...args).then(onResult)}>ask</button>
      <input aria-label="outside field" />
    </>
  );
}

function setup(props) {
  let result;
  const utils = render(
    <ConfirmProvider>
      <Trigger onResult={(r) => (result = r)} {...props} />
    </ConfirmProvider>
  );
  return { ...utils, getResult: () => result };
}

describe('ConfirmDialog', () => {
  it('moves focus into the dialog when it opens', () => {
    setup();
    fireEvent.click(screen.getByText('ask'));
    const dialog = screen.getByRole('dialog');
    expect(dialog.contains(document.activeElement)).toBe(true);
  });

  it('Tab wraps within the dialog instead of escaping to the page behind it', () => {
    setup();
    fireEvent.click(screen.getByText('ask'));
    const cancelBtn = screen.getByText('Batal');
    const confirmBtn = screen.getByText('Ya');
    confirmBtn.focus();
    fireEvent.keyDown(confirmBtn, { key: 'Tab' });
    expect(document.activeElement).toBe(cancelBtn);
  });

  it('restores focus to the triggering element after the dialog closes', () => {
    setup();
    const trigger = screen.getByText('ask');
    trigger.focus();
    fireEvent.click(trigger);
    fireEvent.click(screen.getByText('Batal'));
    expect(document.activeElement).toBe(trigger);
  });

  it('Escape cancels the dialog', async () => {
    const { getResult } = setup();
    fireEvent.click(screen.getByText('ask'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await act(async () => {
      fireEvent.keyDown(window, { key: 'Escape' });
    });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(getResult()).toBe(false);
  });

  it('an alternative action fires its callback and resolves as cancelled, not confirmed', async () => {
    const onAlternative = vi.fn();
    const { getResult } = setup({
      args: ['Yakin?', 'Ya', 'Batal', { label: 'Cadangkan dulu', onClick: onAlternative }],
    });
    fireEvent.click(screen.getByText('ask'));
    await act(async () => {
      fireEvent.click(screen.getByText('Cadangkan dulu'));
    });
    expect(onAlternative).toHaveBeenCalledTimes(1);
    expect(getResult()).toBe(false);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('renders no alternative button when none is provided (backward compatible)', () => {
    setup();
    fireEvent.click(screen.getByText('ask'));
    expect(screen.queryByText(/Cadangkan/)).toBeNull();
  });
});
