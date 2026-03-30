import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import {
  LoginResponse,
  AuthMeResponse,
  SearchSingleBody,
  SearchGroupBody,
  SearchBatchBody,
  SearchImeiBody,
  SearchJsonResponse,
  SearchGroupJsonResponse,
} from '../types';

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000/api/v1';
const TOKEN_KEY = 'cdr_auth_token';

// ─── Token Management (SecureStore natif, localStorage web) ───

export async function saveToken(token: string): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  }
}

export async function getToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export async function removeToken(): Promise<void> {
  if (Platform.OS === 'web') {
    localStorage.removeItem(TOKEN_KEY);
  } else {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
}

// ─── Headers ───

async function authHeaders(): Promise<Record<string, string>> {
  const token = await getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

// ─── Generic fetch wrapper ───

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = await authHeaders();
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: { ...headers, ...(options.headers as Record<string, string>) },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: 'Erreur serveur' }));
    throw new Error(body.error || `Erreur HTTP ${res.status}`);
  }

  return res.json();
}

// ─── Helper: save binary response to file ───

async function saveBlobToFile(res: Response, defaultFilename: string): Promise<string> {
  const contentDisposition = res.headers.get('Content-Disposition') || '';
  const filenameMatch = contentDisposition.match(/filename="?(.+?)"?$/);
  const filename = filenameMatch ? filenameMatch[1] : defaultFilename;

  const blob = await res.blob();
  const reader = new FileReader();
  const base64 = await new Promise<string>((resolve) => {
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.readAsDataURL(blob);
  });

  const file = new File(Paths.document, filename);
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  file.write(bytes);

  return file.uri;
}

// ─── Auth ───

export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  const res = await request<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  await saveToken(res.token);
  return res;
}

export async function getMe(): Promise<AuthMeResponse> {
  return request<AuthMeResponse>('/auth/me');
}

// ─── Search by Number ───

export async function searchNumber(
  body: SearchSingleBody | SearchGroupBody | SearchBatchBody
): Promise<SearchJsonResponse | SearchGroupJsonResponse> {
  return request('/search/number', {
    method: 'POST',
    body: JSON.stringify({ ...body, format: 'json' }),
  });
}

export async function searchNumberPdf(
  body: SearchSingleBody | SearchGroupBody | SearchBatchBody
): Promise<string> {
  const token = await getToken();
  const res = await fetch(`${BASE_URL}/search/number`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ ...body, format: 'pdf' }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Erreur serveur' }));
    throw new Error(err.error || `Erreur HTTP ${res.status}`);
  }

  return saveBlobToFile(res, `CDR_${Date.now()}.pdf`);
}

// ─── Search by IMEI ───

export async function searchImei(
  body: SearchImeiBody
): Promise<SearchJsonResponse> {
  return request('/search/imei', {
    method: 'POST',
    body: JSON.stringify({ ...body, format: 'json' }),
  });
}

export async function searchImeiPdf(body: SearchImeiBody): Promise<string> {
  const token = await getToken();
  const res = await fetch(`${BASE_URL}/search/imei`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ ...body, format: 'pdf' }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Erreur serveur' }));
    throw new Error(err.error || `Erreur HTTP ${res.status}`);
  }

  return saveBlobToFile(res, `CDR_IMEI_${Date.now()}.pdf`);
}

// ─── Share file ───

export async function shareFile(fileUri: string): Promise<void> {
  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(fileUri);
  } else {
    throw new Error('Le partage n\'est pas disponible sur cet appareil');
  }
}
