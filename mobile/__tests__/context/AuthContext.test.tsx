import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '../../src/context/AuthContext';
import { getSupabase } from '../../src/lib/supabase';
import { fetchMe, deleteAccountApi, ApiError } from '../../src/api/client';

jest.mock('../../src/lib/supabase', () => ({ getSupabase: jest.fn() }));
jest.mock('../../src/api/client', () => {
  const actual = jest.requireActual('../../src/api/client');
  return { ApiError: actual.ApiError, fetchMe: jest.fn(), deleteAccountApi: jest.fn() };
});

const SESSION = { access_token: 'jwt-123', user: { id: 'user-1', email: 'a@b.co' } };
const ME = { id: 'user-1', email: 'a@b.co', isPro: false, itemCount: 3, itemLimit: 30 };

const mockedGetSupabase = getSupabase as jest.Mock;
const mockedFetchMe = fetchMe as jest.Mock;
const mockedDeleteAccountApi = deleteAccountApi as jest.Mock;

let signOut: jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'error').mockImplementation(() => {});
  signOut = jest.fn().mockResolvedValue({ error: null });
  mockedGetSupabase.mockResolvedValue({
    auth: {
      getSession: async () => ({ data: { session: SESSION } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: jest.fn() } } }),
      signOut,
    },
  });
  mockedFetchMe.mockResolvedValue(ME);
});

afterEach(() => {
  (console.error as jest.Mock).mockRestore();
});

async function renderSignedIn() {
  const hook = await renderHook(() => useAuth(), { wrapper: AuthProvider });
  await waitFor(() => expect(hook.result.current.isLoading).toBe(false));
  expect(hook.result.current.session).not.toBeNull();
  return hook;
}

describe('AuthContext.deleteAccount', () => {
  it('deletes the account on the server, then clears the local session', async () => {
    // Arrange
    mockedDeleteAccountApi.mockResolvedValue({ ok: true });
    const { result } = await renderSignedIn();

    // Act
    let response: { error?: string } | undefined;
    await act(async () => {
      response = await result.current.deleteAccount();
    });

    // Assert
    expect(response).toEqual({});
    expect(mockedDeleteAccountApi).toHaveBeenCalledTimes(1);
    // The server already removed the user, so only the local session is cleared.
    expect(signOut).toHaveBeenCalledWith({ scope: 'local' });
    expect(mockedDeleteAccountApi.mock.invocationCallOrder[0]).toBeLessThan(
      signOut.mock.invocationCallOrder[0]
    );
    expect(result.current.session).toBeNull();
    expect(result.current.user).toBeNull();
    expect(result.current.me).toBeNull();
  });

  it('keeps the user signed in and returns a friendly error when the server fails', async () => {
    mockedDeleteAccountApi.mockRejectedValue(
      new ApiError('Could not delete your account. Please try again.', 500)
    );
    const { result } = await renderSignedIn();

    let response: { error?: string } | undefined;
    await act(async () => {
      response = await result.current.deleteAccount();
    });

    expect(response?.error).toMatch(/try again/i);
    expect(signOut).not.toHaveBeenCalled();
    expect(result.current.session).not.toBeNull();
  });

  it('reports a connection problem when the request never reaches the server', async () => {
    mockedDeleteAccountApi.mockRejectedValue(new TypeError('Network request failed'));
    const { result } = await renderSignedIn();

    let response: { error?: string } | undefined;
    await act(async () => {
      response = await result.current.deleteAccount();
    });

    expect(response?.error).toMatch(/internet connection/i);
    expect(signOut).not.toHaveBeenCalled();
  });
});
