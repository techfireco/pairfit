import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { Button } from '../../src/components/Button';
import { haptics } from '../../src/utils/haptics';
import { AppProviders } from '../../test-utils/AppProviders';

jest.mock('../../src/utils/haptics', () => ({
  haptics: { tap: jest.fn(), press: jest.fn(), selection: jest.fn(), success: jest.fn(), warning: jest.fn() },
}));

beforeEach(() => jest.clearAllMocks());

describe('Button', () => {
  it('is announced as a button named by its title', async () => {
    await render(<Button title="Add piece" onPress={jest.fn()} />, { wrapper: AppProviders });

    expect(screen.getByRole('button', { name: 'Add piece' })).toBeTruthy();
  });

  it('runs onPress with a firm haptic for the primary 3D button', async () => {
    const onPress = jest.fn();
    await render(<Button title="Add piece" onPress={onPress} />, { wrapper: AppProviders });

    await fireEvent.press(screen.getByRole('button', { name: 'Add piece' }));

    expect(onPress).toHaveBeenCalledTimes(1);
    expect(haptics.press).toHaveBeenCalledTimes(1);
  });

  it('uses a light haptic for secondary buttons', async () => {
    await render(<Button title="Cancel" variant="secondary" onPress={jest.fn()} />, {
      wrapper: AppProviders,
    });

    await fireEvent.press(screen.getByRole('button', { name: 'Cancel' }));

    expect(haptics.tap).toHaveBeenCalledTimes(1);
    expect(haptics.press).not.toHaveBeenCalled();
  });

  it('ignores presses and reports disabled state when disabled', async () => {
    const onPress = jest.fn();
    await render(<Button title="Add piece" onPress={onPress} disabled />, { wrapper: AppProviders });

    const button = screen.getByRole('button', { name: 'Add piece' });
    await fireEvent.press(button);

    expect(onPress).not.toHaveBeenCalled();
    expect(button.props.accessibilityState).toMatchObject({ disabled: true });
  });

  it('shows a busy spinner instead of the label while loading', async () => {
    const onPress = jest.fn();
    await render(<Button title="Add piece" onPress={onPress} loading />, { wrapper: AppProviders });

    const button = screen.getByRole('button', { name: 'Add piece' });
    expect(button.props.accessibilityState).toMatchObject({ busy: true, disabled: true });
    expect(screen.queryByText('Add piece')).toBeNull();

    await fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();
  });
});
