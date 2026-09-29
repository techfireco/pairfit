import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import { getSupabase } from '../lib/supabase';
import { API_BASE_URL } from './config';
import { Item, MeResponse, RecommendationResponse } from '../types';

export class ApiError extends Error {
  status: number;
  upgrade: boolean;

  constructor(message: string, status: number, upgrade = false) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.upgrade = upgrade;
  }
}

export async function apiRequest<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const sb = await getSupabase();
  const { data: { session } } = await sb.auth.getSession();

  const headers: Record<string, string> = {
    ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
    ...((options.headers as Record<string, string>) || {}),
  };

  const url = `${API_BASE_URL.replace(/\/+$/, '')}${path.startsWith('/') ? path : `/${path}`}`;

  const res = await fetch(url, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorMsg = data.error || `Request failed with status ${res.status}`;
    const isUpgrade = Boolean(data.upgrade || res.status === 402);
    throw new ApiError(errorMsg, res.status, isUpgrade);
  }

  return data as T;
}

export async function fetchMe(): Promise<MeResponse> {
  return apiRequest<MeResponse>('/api/me');
}

export async function fetchItems(): Promise<Item[]> {
  return apiRequest<Item[]>('/api/items');
}

export async function deleteItemApi(id: string): Promise<{ ok: boolean }> {
  return apiRequest<{ ok: boolean }>(`/api/items/${id}`, {
    method: 'DELETE',
  });
}

export async function fetchRecommendationsApi(itemId: string): Promise<RecommendationResponse> {
  return apiRequest<RecommendationResponse>(`/api/recommend/${itemId}`);
}

export async function uploadItemApi(params: {
  photoUri: string;
  name: string;
  category: string;
}): Promise<Item> {
  const sb = await getSupabase();
  const { data: { session } } = await sb.auth.getSession();
  const url = `${API_BASE_URL.replace(/\/+$/, '')}/api/items`;

  if (Platform.OS !== 'web') {
    const uploadResult = await FileSystem.uploadAsync(url, params.photoUri, {
      httpMethod: 'POST',
      uploadType: FileSystem.FileSystemUploadType.MULTIPART,
      fieldName: 'photo',
      parameters: {
        name: params.name || 'Untitled',
        category: params.category,
      },
      headers: {
        ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
      },
    });

    let data: any = {};
    try {
      data = JSON.parse(uploadResult.body);
    } catch {
      data = {};
    }

    if (uploadResult.status < 200 || uploadResult.status >= 300) {
      const errorMsg = data.error || `Upload failed with status ${uploadResult.status}`;
      const isUpgrade = Boolean(data.upgrade || uploadResult.status === 402);
      throw new ApiError(errorMsg, uploadResult.status, isUpgrade);
    }

    return data as Item;
  }

  // Fallback for Web browser runtime
  const formData = new FormData();
  formData.append('name', params.name || 'Untitled');
  formData.append('category', params.category);

  const res = await fetch(params.photoUri);
  const blob = await res.blob();
  formData.append('photo', blob, 'photo.jpg');

  const webRes = await fetch(url, {
    method: 'POST',
    headers: {
      ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
    },
    body: formData,
  });

  const data = await webRes.json().catch(() => ({}));

  if (!webRes.ok) {
    const errorMsg = data.error || `Upload failed with status ${webRes.status}`;
    const isUpgrade = Boolean(data.upgrade || webRes.status === 402);
    throw new ApiError(errorMsg, webRes.status, isUpgrade);
  }

  return data as Item;
}
