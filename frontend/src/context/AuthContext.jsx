import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, clearToken, getToken, setToken } from '../api/client';

const AuthContext = createContext(null);

/** Minimal JWT payload decode — used only to show the user's email in the UI. */
function decode(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return { email: payload.email, userId: payload.userId || payload.sub, ...payload };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => getToken());
  const [user, setUser] = useState(() => {
    const t = getToken();
    return t ? decode(t) : null;
  });

  // Keep tabs in sync: logging out in one tab logs out the others.
  useEffect(() => {
    const onStorage = () => {
      const t = getToken();
      setTokenState(t);
      setUser(t ? decode(t) : null);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const adopt = useCallback((res, fallbackEmail) => {
    if (!res?.token) throw new Error('Server did not return a token');
    setToken(res.token);
    setTokenState(res.token);
    setUser(decode(res.token) || { email: fallbackEmail, userId: res.userId });
    return res;
  }, []);

  const login = useCallback(async (email, password) => adopt(await api.login(email, password), email), [adopt]);

  // Register returns { userId, token } → adopt it so the user lands signed in.
  const register = useCallback(async (email, password) => adopt(await api.register(email, password), email), [adopt]);

  const logout = useCallback(() => {
    clearToken();
    setTokenState(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ token, user, userId: user?.userId ?? null, isAuthenticated: Boolean(token), login, register, logout }),
    [token, user, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
