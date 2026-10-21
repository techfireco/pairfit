import { getSupabase } from '../../src/lib/supabase';
import { deleteAccountApi, ApiError } from '../../src/api/client';

jest.mock('../../src/lib/supabase', () => ({ getSupabase: jest.fn() }));
jest.mock('../../src/api/config', () => ({ API_BASE_URL: 'https://api.example.test/' }));

const mockedGetSupabase = getSupabase as jest.Mock;

function mockSession(accessToken: string | null) {
  mockedGetSupabase.mockResolvedValue({
    auth: {
      getSession: async () => ({
        data: { session: accessToken ? { access_token: accessToken } : null },
      }),
    },
  });
}

function mockFetchResponse(status: number, body: unknown) {
  const fetchMock = jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  });
  globalThis.fetch = fetchMock as unknown as typeof fetch;
  return fetchMock;
}

describe('deleteAccountApi', () => {
  it('sends DELETE /api/me with the user\'s bearer token', async () => {
    // Arrange
    mockSession('jwt-123');
    const fetchMock = mockFetchResponse(200, { ok: true });

    // Act
    const result = await deleteAccountApi();

    // Assert
    expect(result).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.example.test/api/me');
    expect(options.method).toBe('DELETE');
    expect(options.headers.Authorization).toBe('Bearer jwt-123');
  });

  it('throws an ApiError carrying the server message when deletion fails', async () => {
    mockSession('jwt-123');
    mockFetchResponse(500, { error: 'Could not delete your account. Please try again.' });

    const promise = deleteAccountApi();

    await expect(promise).rejects.toBeInstanceOf(ApiError);
    await expect(promise).rejects.toMatchObject({
      status: 500,
      message: 'Could not delete your account. Please try again.',
    });
  });
});
