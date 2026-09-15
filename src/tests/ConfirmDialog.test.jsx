// ─── tests/ConfirmDialog.test.jsx ─────────────────────────────────────────────
// item 15: ConfirmDialog set role="dialog" aria-modal="true" but had no focus
// trap and no Escape handler — a promise aria-modal makes to assistive tech
// that nothing here kept. useFocusTrap already existed with zero consumers;
// this is what it was written for.
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
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

  it('restores focus to the triggering element after the dialog closes', async () => {
    setup();
    const trigger = screen.getByText('ask');
    trigger.focus();
    fireEvent.click(trigger);
    fireEvent.click(screen.getByText('Batal'));
    // The sheet animates out before it unmounts (item 148), so focus comes back
    // when the exit finishes rather than on the click. Awaited rather than
    // assumed instant: that IS the contract now.
    await waitFor(() => expect(document.activeElement).toBe(trigger));
  });

  it('Escape cancels the dialog', async () => {
    const { getResult } = setup();
    fireEvent.click(screen.getByText('ask'));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await act(async () => {
      fireEvent.keyDown(window, { key: 'Escape' });
    });
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
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
    // The callback and the promise both settle on the click, with nothing
    // awaited -- only the sheet's removal waits for its exit.
    expect(onAlternative).toHaveBeenCalledTimes(1);
    expect(getResult()).toBe(false);
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  });

  it('renders no alternative button when none is provided (backward compatible)', () => {
    setup();
    fireEvent.click(screen.getByText('ask'));
    expect(screen.queryByText(/Cadangkan/)).toBeNull();
  });
});
