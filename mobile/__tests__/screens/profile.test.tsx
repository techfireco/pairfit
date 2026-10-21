import React from 'react';
import { Alert } from 'react-native';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import ProfileScreen from '../../app/(tabs)/profile';

const mockReplace = jest.fn();
const mockDeleteAccount = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: mockReplace }),
}));
jest.mock('../../src/context/AuthContext', () => ({
  useAuth: () => ({
    user: { email: 'a@b.co', user_metadata: { name: 'Asha' } },
    me: { id: 'user-1', email: 'a@b.co', isPro: false, itemCount: 12, itemLimit: 30 },
    signOut: jest.fn(),
    deleteAccount: mockDeleteAccount,
  }),
}));

// Simulate the person tapping the destructive button in the native confirm dialog.
function confirmNextAlert() {
  jest.spyOn(Alert, 'alert').mockImplementationOnce((_title, _msg, buttons) => {
    const destructive = buttons?.find((b) => b.style === 'destructive');
    destructive?.onPress?.();
  });
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('ProfileScreen', () => {
  it('shows the free-plan usage without any upgrade or purchase button', async () => {
    await render(<ProfileScreen />);

    expect(screen.getAllByText('12 / 30 items (Free plan)').length).toBeGreaterThan(0);
    expect(screen.queryByText(/upgrade/i)).toBeNull();
  });

  it('returns to the welcome screen after the account is deleted', async () => {
    mockDeleteAccount.mockResolvedValue({});
    confirmNextAlert();
    await render(<ProfileScreen />);

    await fireEvent.press(screen.getByText('Delete Account'));

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith('/welcome'));
    expect(mockDeleteAccount).toHaveBeenCalledTimes(1);
  });

  it('stays on the profile and shows the error when deletion fails', async () => {
    mockDeleteAccount.mockResolvedValue({ error: 'Something went wrong on our side.' });
    confirmNextAlert();
    const alertSpy = jest.spyOn(Alert, 'alert');
    await render(<ProfileScreen />);

    await fireEvent.press(screen.getByText('Delete Account'));

    await waitFor(() =>
      expect(alertSpy).toHaveBeenCalledWith('Error', 'Something went wrong on our side.')
    );
    expect(mockReplace).not.toHaveBeenCalled();
  });
});
