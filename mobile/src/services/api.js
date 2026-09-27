// API and Supabase Service Layer for PairFit Mobile
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { getApiBaseUrl } from '../config';

let supabaseClient = null;
let initPromise = null;
let onSessionExpiredCallback = null;

export function setOnSessionExpired(cb) {
  onSessionExpiredCallback = cb;
}

export async function initSupabase() {
  if (supabaseClient) return supabaseClient;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      const apiBase = getApiBaseUrl();
      const configRes = await fetch(`${apiBase}/api/config`);
      if (!configRes.ok) {
        throw new Error(`Failed to load server config (${configRes.status}) from ${apiBase}`);
      }
      const config = await configRes.json();
      if (!config.supabaseUrl || !config.supabaseAnonKey) {
        throw new Error('Server returned invalid Supabase configuration');
      }

      supabaseClient = createClient(config.supabaseUrl, config.supabaseAnonKey, {
        auth: {
          storage: AsyncStorage,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        },
      });

      return supabaseClient;
    } catch (err) {
      initPromise = null;
      throw err;
    }
  })();

  return initPromise;
}

export async function getSupabase() {
  if (!supabaseClient) {
    return await initSupabase();
  }
  return supabaseClient;
}

export async function apiRequest(path, options = {}) {
  const sb = await getSupabase();
  const { data: { session } } = await sb.auth.getSession();

  const apiBase = getApiBaseUrl();
  const url = `${apiBase}${path.startsWith('/') ? path : '/' + path}`;

  const headers = {
    ...(options.headers || {}),
  };

  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) {
      if (onSessionExpiredCallback) {
        onSessionExpiredCallback();
      }
      const err = new Error(data.error || 'Session expired, please login again');
      err.status = 401;
      throw err;
    }

    const err = new Error(data.error || 'Network request failed');
    err.status = response.status;
    err.upgrade = Boolean(data.upgrade);
    throw err;
  }

  return data;
}

// User Profile & Limits
export async function getMe() {
  return await apiRequest('/api/me');
}

// Closet Items
export async function getItems() {
  return await apiRequest('/api/items');
}

export async function deleteItem(id) {
  return await apiRequest(`/api/items/${id}`, { method: 'DELETE' });
}

// Add Item (Multipart Upload)
export async function addItem({ uri, name, category }) {
  if (!uri) throw new Error('Photo is required');
  if (!category) throw new Error('Category is required');

  const filename = uri.split('/').pop() || `photo_${Date.now()}.jpg`;
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1] === 'jpg' ? 'jpeg' : match[1]}` : 'image/jpeg';

  const formData = new FormData();
  formData.append('photo', {
    uri,
    name: filename,
    type,
  });
  formData.append('name', name || 'Untitled');
  formData.append('category', category);

  return await apiRequest('/api/items', {
    method: 'POST',
    body: formData,
  });
}

// Recommendations
export async function getRecommendations(itemId) {
  return await apiRequest(`/api/recommend/${itemId}`);
}
