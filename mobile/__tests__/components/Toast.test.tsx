import React from 'react';
import { Pressable, Text } from 'react-native';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import { useToast } from '../../src/components/Toast';
import { AppProviders } from '../../test-utils/AppProviders';

function ToastTrigger({ message }: { message: string }) {
  const { showToast } = useToast();
  return (
    <Pressable onPress={() => showToast({ message, tone: 'success' })}>
      <Text>Trigger</Text>
    </Pressable>
  );
}

describe('Toast', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('shows the message as an alert, then hides it on its own', async () => {
    await render(<ToastTrigger message="Added to your closet" />, { wrapper: AppProviders });

    await fireEvent.press(screen.getByText('Trigger'));
    expect(screen.getByRole('alert')).toBeTruthy();
    expect(screen.getByText('Added to your closet')).toBeTruthy();

    await act(async () => {
      jest.advanceTimersByTime(4000);
    });
    expect(screen.queryByText('Added to your closet')).toBeNull();
  });

  it('replaces the current toast instead of stacking them', async () => {
    const { rerender } = await render(<ToastTrigger message="First" />, { wrapper: AppProviders });
    await fireEvent.press(screen.getByText('Trigger'));

    await rerender(<ToastTrigger message="Second" />);
    await fireEvent.press(screen.getByText('Trigger'));

    expect(screen.queryByText('First')).toBeNull();
    expect(screen.getByText('Second')).toBeTruthy();
  });
});
