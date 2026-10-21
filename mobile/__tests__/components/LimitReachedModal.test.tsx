import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { LimitReachedModal } from '../../src/components/LimitReachedModal';

describe('LimitReachedModal', () => {
  it('explains the free limit using the limit it is given', async () => {
    await render(<LimitReachedModal visible limit={30} onClose={jest.fn()} />);

    expect(screen.getByText(/closet is full/i)).toBeTruthy();
    expect(screen.getByText(/up to 30 pieces/i)).toBeTruthy();
  });

  it('shows no prices, trials or purchase buttons until real in-app purchases exist', async () => {
    await render(<LimitReachedModal visible limit={30} onClose={jest.fn()} />);

    expect(screen.queryByText(/\$|₹/)).toBeNull();
    expect(screen.queryByText(/trial/i)).toBeNull();
    expect(screen.queryByText(/restore purchases/i)).toBeNull();
    expect(screen.queryByText(/upgrade|subscribe|pro\b/i)).toBeNull();
  });

  it('closes when the person taps "Got it"', async () => {
    const onClose = jest.fn();
    await render(<LimitReachedModal visible limit={30} onClose={onClose} />);

    await fireEvent.press(screen.getByText('Got it'));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
