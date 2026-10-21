import React from 'react';
import { render, screen } from '@testing-library/react-native';
import AuthScreen from '../../app/auth';

jest.mock('expo-router', () => ({ useRouter: () => ({ push: jest.fn(), replace: jest.fn() }) }));
jest.mock('../../src/context/AuthContext', () => ({
  useAuth: () => ({ signIn: jest.fn(), signUp: jest.fn() }),
}));

describe('AuthScreen', () => {
  it('does not show social sign-in buttons that are not wired up', async () => {
    await render(<AuthScreen />);

    expect(screen.queryByText(/continue with apple/i)).toBeNull();
    expect(screen.queryByText(/continue with google/i)).toBeNull();
    expect(screen.queryByText(/or continue with/i)).toBeNull();
  });

  it('still offers email sign-in and the legal links', async () => {
    await render(<AuthScreen />);

    expect(screen.getByPlaceholderText('your.email@example.com')).toBeTruthy();
    expect(screen.getAllByText('Sign In').length).toBeGreaterThan(0);
    expect(screen.getByText('Terms of Service')).toBeTruthy();
    expect(screen.getByText('Privacy Policy')).toBeTruthy();
  });
});
