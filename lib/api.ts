const API_URL = (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080').replace(/\/$/, '');
const TOKEN_KEY = 'nexo.session';

let token: string | null = null;

export function getToken() {
  return token;
}

export function setToken(next: string | null) {
  token = next;
  if (next) {
    globalThis.localStorage?.setItem(TOKEN_KEY, next);
  } else {
    globalThis.localStorage?.removeItem(TOKEN_KEY);
  }
}

export function restoreToken() {
  const stored = globalThis.localStorage?.getItem(TOKEN_KEY) || null;
  if (stored) {
    token = stored;
    return stored;
  }
  return null;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export async function apiRequest<T>(path: string, options: { method?: string; body?: unknown; auth?: boolean } = {}): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (options.auth !== false && token) headers.Authorization = `Bearer ${token}`;

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: options.method || 'GET',
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch {
    throw new ApiError(0, 'No pudimos conectar con el servidor. Revisa tu conexión.');
  }

  if (response.status === 204) return undefined as T;

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 401 && options.auth !== false) setToken(null);
    throw new ApiError(response.status, (payload && payload.error) || 'Algo salió mal. Inténtalo otra vez.');
  }
  return payload as T;
}
