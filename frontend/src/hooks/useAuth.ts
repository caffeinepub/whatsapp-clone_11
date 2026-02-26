import { useState, useEffect, useCallback } from 'react';

const SESSION_KEY = 'chatconnect_session';

export interface AuthSession {
  username: string;
  loggedInAt: number;
}

export function useAuth() {
  const [session, setSession] = useState<AuthSession | null>(() => {
    try {
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) {
        return JSON.parse(stored) as AuthSession;
      }
    } catch {
      // ignore
    }
    return null;
  });

  const isAuthenticated = session !== null;

  const saveSession = useCallback((username: string) => {
    const newSession: AuthSession = { username, loggedInAt: Date.now() };
    localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
    setSession(newSession);
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
  }, []);

  return {
    session,
    isAuthenticated,
    username: session?.username ?? null,
    saveSession,
    clearSession,
  };
}
