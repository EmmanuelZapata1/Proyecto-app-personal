import { readSecure, writeSecure } from '@/lib/storage';

const API_URL = (process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080').replace(/\/$/, '');
const TOKEN_KEY = 'nexo.session';

let token: string | null = null;
let onUnauthorized: (() => void) | null = null;

export function getToken() {
  return token;
}

export function setToken(next: string | null) {
  token = next;
  void writeSecure(TOKEN_KEY, next).catch(() => undefined);
}

export async function restoreToken() {
  const stored = await readSecure(TOKEN_KEY).catch(() => null);
  token = stored || null;
  return token;
}

// La sesión se registra aquí para enterarse cuando el servidor rechaza el token.
export function setUnauthorizedHandler(handler: (() => void) | null) {
  onUnauthorized = handler;
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
  const sentToken = options.auth !== false ? token : null;
  if (sentToken) headers.Authorization = `Bearer ${sentToken}`;

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
    // Solo cerramos la sesión si se rechazó el token vigente, no uno viejo o una petición sin token.
    if (response.status === 401 && sentToken && sentToken === token) {
      setToken(null);
      onUnauthorized?.();
    }
    throw new ApiError(response.status, (payload && payload.error) || 'Algo salió mal. Inténtalo otra vez.');
  }
  return payload as T;
}
