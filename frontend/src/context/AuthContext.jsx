import { createContext, useContext, useState, useCallback } from 'react';
import apiClient from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sk_user')); } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  const login = useCallback(async (email, password) => {
    const { data } = await apiClient.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('sk_user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data;
  }, []);

  // Registration now uses a 2-step OTP flow handled inside Login.jsx.
  // After verify-and-register the OTP dialog writes to localStorage directly,
  // then calls syncFromStorage to bring React state in sync.
  const syncFromStorage = useCallback(() => {
    try {
      const t = localStorage.getItem('token');
      const u = JSON.parse(localStorage.getItem('sk_user'));
      setToken(t);
      setUser(u);
    } catch { /* ignore */ }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('sk_user');
    setToken(null);
    setUser(null);
  }, []);

  const updateLocalUser = useCallback((updated) => {
    const merged = { ...user, ...updated };
    localStorage.setItem('sk_user', JSON.stringify(merged));
    setUser(merged);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, token, login, syncFromStorage, logout, updateLocalUser, isAuth: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
