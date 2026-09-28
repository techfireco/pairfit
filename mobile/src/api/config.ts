import Constants from 'expo-constants';
import { ApiConfig } from '../types';

export const API_BASE_URL: string =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  Constants.expoConfig?.extra?.apiBaseUrl ||
  'https://jtgohjakh6gsnaiabtdmlyyn.152.67.25.227.sslip.io';

let cachedConfig: ApiConfig | null = null;
let pendingConfigRequest: Promise<ApiConfig> | null = null;

export async function getApiConfig(): Promise<ApiConfig> {
  if (cachedConfig) {
    return cachedConfig;
  }

  if (pendingConfigRequest) {
    return pendingConfigRequest;
  }

  pendingConfigRequest = (async () => {
    try {
      const endpoint = `${API_BASE_URL.replace(/\/+$/, '')}/api/config`;
      const res = await fetch(endpoint, {
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) {
        throw new Error(`Failed to load server config (HTTP ${res.status})`);
      }
      const data: ApiConfig = await res.json();
      if (!data.supabaseUrl || !data.supabaseAnonKey) {
        throw new Error('Server config missing supabaseUrl or supabaseAnonKey');
      }
      cachedConfig = data;
      return data;
    } finally {
      pendingConfigRequest = null;
    }
  })();

  return pendingConfigRequest;
}
