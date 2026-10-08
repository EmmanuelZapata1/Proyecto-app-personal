import { PropsWithChildren, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { apiRequest, restoreToken, setToken, ApiError } from '@/lib/api';

type SessionValue = {
  email: string | null;
  isReady: boolean;
  isAuthenticating: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const SessionContext = createContext<SessionValue | undefined>(undefined);

export function SessionProvider({ children }: PropsWithChildren) {
  const [email, setEmail] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const stored = restoreToken();
    if (!stored) {
      setIsReady(true);
      return;
    }
    void (async () => {
      try {
        const result = await apiRequest<{ user: { email: string } }>('/api/me');
        setEmail(result.user.email);
      } catch (exception) {
        if (!(exception instanceof ApiError) || exception.status !== 401) setError('No pudimos conectar con el servidor.');
        setToken(null);
      } finally {
        setIsReady(true);
      }
    })();
  }, []);

  const authenticate = useCallback(async (path: '/auth/login' | '/auth/register', currentEmail: string, password: string) => {
    if (isAuthenticating) return;
    setIsAuthenticating(true);
    setError(null);
    try {
      const result = await apiRequest<{ token: string; user: { email: string } }>(path, {
        method: 'POST',
        body: { email: currentEmail, password },
        auth: false,
      });
      setToken(result.token);
      setEmail(result.user.email);
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : 'No pudimos iniciar sesión.');
      throw exception;
    } finally {
      setIsAuthenticating(false);
    }
  }, [isAuthenticating]);

  const login = useCallback((currentEmail: string, password: string) => authenticate('/auth/login', currentEmail, password), [authenticate]);
  const register = useCallback((currentEmail: string, password: string) => authenticate('/auth/register', currentEmail, password), [authenticate]);

  const logout = useCallback(() => {
    setToken(null);
    setEmail(null);
    setError(null);
  }, []);

  const value = useMemo(
    () => ({ email, isReady, isAuthenticating, error, login, register, logout }),
    [email, isReady, isAuthenticating, error, login, register, logout],
  );
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) throw new Error('useSession debe usarse dentro de SessionProvider.');
  return context;
}
