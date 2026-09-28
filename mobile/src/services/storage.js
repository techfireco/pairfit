import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'pairfit_auth_token';
const ONBOARDING_KEY = 'pairfit_onboarding_completed';

export async function saveAuthToken(token) {
  try {
    if (token) {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    } else {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    }
  } catch (e) {
    console.warn('Failed to save auth token to SecureStore:', e);
  }
}

export async function getAuthToken() {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch (e) {
    console.warn('Failed to get auth token from SecureStore:', e);
    return null;
  }
}

export async function clearAuthToken() {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch (e) {
    console.warn('Failed to clear auth token from SecureStore:', e);
  }
}

export async function hasCompletedOnboarding() {
  try {
    const val = await SecureStore.getItemAsync(ONBOARDING_KEY);
    return val === 'true';
  } catch (e) {
    return false;
  }
}

export async function setCompletedOnboarding(completed = true) {
  try {
    await SecureStore.setItemAsync(ONBOARDING_KEY, completed ? 'true' : 'false');
  } catch (e) {
    console.warn('Failed to save onboarding flag:', e);
  }
}
